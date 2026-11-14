/** Mathematical kernels for the ES98E animated teaching examples. No React or DOM. */
export type V2 = readonly [number, number];
export type V3 = readonly [number, number, number];
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const linspace = (a: number, b: number, n = 81) => Array.from({ length: n }, (_, i) => mix(a, b, i / (n - 1)));
export const dot = (a: readonly number[], b: readonly number[]) => a.reduce((sum, x, i) => sum + x * b[i], 0);
const finite = (...xs: number[]) => {
    if (!xs.every(Number.isFinite)) throw new RangeError("Expected finite values");
};

export function cholesky(a: readonly (readonly number[])[]) {
    const n = a.length;
    if (!n || a.some((row) => row.length !== n)) throw new RangeError("Expected square matrix");
    const l = Array.from({ length: n }, () => Array(n).fill(0) as number[]);
    for (let i = 0; i < n; i++)
        for (let j = 0; j <= i; j++) {
            finite(a[i][j]);
            if (Math.abs(a[i][j] - a[j][i]) > 1e-9) throw new RangeError("Expected symmetric matrix");
            let s = a[i][j];
            for (let k = 0; k < j; k++) s -= l[i][k] * l[j][k];
            if (i === j) {
                if (s <= 0) throw new RangeError("Expected positive definite matrix");
                l[i][j] = Math.sqrt(s);
            } else l[i][j] = s / l[j][j];
        }
    return l;
}
export function solveLower(l: readonly (readonly number[])[], b: readonly number[]) {
    const x = Array(b.length).fill(0) as number[];
    for (let i = 0; i < x.length; i++) {
        let s = b[i];
        for (let j = 0; j < i; j++) s -= l[i][j] * x[j];
        x[i] = s / l[i][i];
    }
    return x;
}
export function solveSPD(a: readonly (readonly number[])[], b: readonly number[]) {
    const l = cholesky(a),
        y = solveLower(l, b),
        x = Array(b.length).fill(0) as number[];
    for (let i = b.length - 1; i >= 0; i--) {
        let s = y[i];
        for (let j = i + 1; j < b.length; j++) s -= l[j][i] * x[j];
        x[i] = s / l[i][i];
    }
    return x;
}
export function normalInnovations(n: number, seed = 8128) {
    let state = seed >>> 0;
    const uniform = () => {
        state = (Math.imul(1664525, state) + 1013904223) >>> 0;
        return (state + 0.5) / 4294967296;
    };
    return Array.from({ length: n }, () => Math.sqrt(-2 * Math.log(uniform())) * Math.cos(2 * Math.PI * uniform()));
}
export function normalPDF(x: number, mean = 0, variance = 1) {
    if (variance <= 0) throw new RangeError("Positive variance required");
    return Math.exp(-((x - mean) ** 2) / (2 * variance)) / Math.sqrt(2 * Math.PI * variance);
}
export function localResponse(s: number, curvature: number) {
    finite(s, curvature);
    return { exact: s + curvature * s * s, linear: s, error: curvature * s * s };
}
export function covarianceTransport(rho: number, secondSensitivity: number) {
    finite(rho, secondSensitivity);
    if (Math.abs(rho) > 1) throw new RangeError("Invalid correlation");
    const normal = normalInnovations(144, 17),
        points: V2[] = Array.from({ length: 72 }, (_, i) => [
            normal[2 * i],
            rho * normal[2 * i] + Math.sqrt(1 - rho * rho) * normal[2 * i + 1],
        ]);
    const variance = 1 + secondSensitivity ** 2 + 2 * rho * secondSensitivity;
    return { points, outputs: points.map(([x, y]) => x + secondSensitivity * y), variance };
}
export const circleData = Array.from({ length: 112 }, (_, i) => {
    const inner = i < 48,
        j = inner ? i : i - 48;
    const radius = inner ? 0.65 * Math.sqrt((j + 0.5) / 48) : 1.05 + (0.25 * ((j * 37) % 64)) / 63;
    const angle = j * Math.PI * (3 - Math.sqrt(5));
    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle), inner, radius };
});
export function liftPoint(x: number, y: number, t: number): V3 {
    return [x, y, t * (x * x + y * y)];
}
/** Orthographic projection: x/y rotate in azimuth, then depth/z tilt in elevation. */
export function project3([x, y, z]: V3, yaw: number, elevation = 0.55): V2 {
    const right = Math.cos(yaw) * x - Math.sin(yaw) * y;
    const depth = Math.sin(yaw) * x + Math.cos(yaw) * y;
    return [right, Math.cos(elevation) * z - Math.sin(elevation) * depth];
}
export function chebyshev(x: number, degree: number) {
    const row = [1];
    if (degree > 0) row.push(x);
    for (let j = 2; j <= degree; j++) row.push(2 * x * row[j - 1] - row[j - 2]);
    return row;
}
export const regressionData = linspace(-1, 1, 12).map((x, i) => ({
    x,
    y: Math.cos(Math.PI * x) + 0.19 * Math.sin(17 * i + 0.3),
}));
export function ridgeExample(progress: number, degree: number) {
    degree = Math.round(degree);
    if (degree < 1 || degree > 10) throw new RangeError("Degree must be 1–10");
    const lambda = 10 ** (-4 + 5 * clamp(progress)),
        design = regressionData.map((d) => chebyshev(d.x, degree));
    const gram = Array.from({ length: degree + 1 }, (_, i) =>
        Array.from(
            { length: degree + 1 },
            (_, j) => design.reduce((s, row) => s + row[i] * row[j], 0) + (i === j && i > 0 ? lambda : 0)
        )
    );
    const rhs = Array.from({ length: degree + 1 }, (_, i) =>
        design.reduce((s, row, k) => s + row[i] * regressionData[k].y, 0)
    );
    const weights = solveSPD(gram, rhs),
        predict = (x: number) => dot(weights, chebyshev(x, degree));
    const mse = regressionData.reduce((s, d) => s + (predict(d.x) - d.y) ** 2, 0) / regressionData.length;
    const test = linspace(-1, 1, 201).reduce((s, x) => s + (predict(x) - Math.cos(Math.PI * x)) ** 2, 0) / 201;
    return { lambda, weights, predict, mse, test, gram, rhs };
}
export const rbfKernel = (x: number, y: number, ell: number, variance = 1) => {
    if (ell <= 0 || variance <= 0) throw new RangeError("Invalid kernel parameter");
    return variance * Math.exp(-0.5 * ((x - y) / ell) ** 2);
};
export type Observation = { x: number; y: number; noise: number };
export function gpPosterior(grid: readonly number[], observations: readonly Observation[], ell = 0.7) {
    if (!observations.length) return grid.map((x) => ({ x, mean: 0, variance: 1 }));
    const c = observations.map((a, i) =>
        observations.map((b, j) => rbfKernel(a.x, b.x, ell) + (i === j ? a.noise : 0))
    );
    const l = cholesky(c),
        alpha = solveSPD(
            c,
            observations.map((o) => o.y)
        );
    return grid.map((x) => {
        const k = observations.map((o) => rbfKernel(x, o.x, ell)),
            v = solveLower(l, k);
        return { x, mean: dot(k, alpha), variance: Math.max(0, 1 - dot(v, v)) };
    });
}
export const gpObservations = [
    { x: -1.45, y: 0.65 },
    { x: 0, y: -0.8 },
    { x: 1.35, y: 0.8 },
];
export function revealObservations(progress: number, noise = 0.04): Observation[] {
    return gpObservations.flatMap((o, i) => {
        const strength = clamp(3 * progress - i);
        return strength > 1e-8 ? [{ ...o, noise: noise / strength }] : [];
    });
}
export function gpSamples(lengthscale: number, variance = 1) {
    const grid = linspace(-2.5, 2.5, 41),
        jitter = 1e-7;
    const covariance = grid.map((x, i) =>
        grid.map((y, j) => rbfKernel(x, y, lengthscale, variance) + (i === j ? jitter : 0))
    );
    const l = cholesky(covariance);
    const paths = Array.from({ length: 3 }, (_, p) => {
        const z = normalInnovations(grid.length, 2026 + p * 97);
        return l.map((row) => dot(row, z));
    });
    return { grid, paths, covariance, jitter };
}
export function activationChain(input: number, layers = 5, weight = 1.1) {
    const tanh = [input],
        relu = [input],
        jt: number[] = [],
        jr: number[] = [];
    for (let i = 0; i < layers; i++) {
        tanh.push(Math.tanh(weight * tanh[i]));
        relu.push(Math.max(0, weight * relu[i]));
        jt.push(weight * (1 - tanh[i + 1] ** 2));
        jr.push(weight * relu[i] > 0 ? weight : 0);
    }
    return {
        tanh,
        relu,
        jt,
        jr,
        gradientTanh: jt.reduce((a, b) => a * b, 1),
        gradientRelu: jr.reduce((a, b) => a * b, 1),
    };
}
/** Transport at nodes is exact; fractional powers only animate travel along an edge. */
export function backwardTransport(jacobians: readonly number[], position: number) {
    if (position >= jacobians.length) return 1;
    const layer = Math.floor(Math.max(0, position)),
        fraction = position - layer;
    return (
        jacobians.slice(layer + 1).reduce((a, b) => a * b, 1) * Math.pow(Math.max(jacobians[layer], 0), 1 - fraction)
    );
}
export function gradientTrajectory(rate: number, steps = 40): V2[] {
    const states: V2[] = [[-2, 1.6]];
    for (let i = 0; i < steps; i++) {
        const [x, y] = states[i];
        states.push([x - rate * x, y - 5 * rate * y]);
    }
    return states;
}
export const quadraticLoss = ([x, y]: V2) => 0.5 * (x * x + 5 * y * y);
export function rotate([x, y]: V2, angle: number): V2 {
    return [x * Math.cos(angle) - y * Math.sin(angle), x * Math.sin(angle) + y * Math.cos(angle)];
}
export const molecule: V2[] = [
    [-0.95, -0.25],
    [0.95, -0.25],
    [0, 0.9],
];
export function springMolecule(points: readonly V2[]) {
    const forces = points.map(() => [0, 0]) as [number, number][];
    let energy = 0;
    for (let i = 0; i < points.length; i++)
        for (let j = i + 1; j < points.length; j++) {
            const dx = points[i][0] - points[j][0],
                dy = points[i][1] - points[j][1],
                d = Math.hypot(dx, dy),
                rest = 1.05;
            if (d < 1e-12) throw new RangeError("Coincident particles");
            energy += 0.5 * (d - rest) ** 2;
            const scale = -(d - rest) / d;
            forces[i][0] += scale * dx;
            forces[i][1] += scale * dy;
            forces[j][0] -= scale * dx;
            forces[j][1] -= scale * dy;
        }
    return { forces, energy };
}
export const pathAdjacency = Array.from({ length: 5 }, (_, i) =>
    Array.from({ length: 5 }, (_, j) => (Math.abs(i - j) === 1 ? 1 : 0))
);
export function averageMessages(values: readonly number[]) {
    return values.map((self, i) => {
        const neighbours = pathAdjacency[i];
        return (self + dot(neighbours, values)) / (1 + neighbours.reduce<number>((a, b) => a + b, 0));
    });
}
export function messageLayers(count = 4) {
    const states = [[1, 0, 0, 0, 0]];
    for (let k = 0; k < count; k++) states.push(averageMessages(states[k]));
    return states;
}
export const exactODE = (x: number) => Math.exp(-x / 5) * Math.sin(x);
export function residualFit(progress: number, collocation: number) {
    const xs = linspace(0, 6, Math.round(collocation)),
        frequency = 6;
    const coefficient =
        xs.reduce((s, x) => s + (frequency * Math.cos(frequency * x) + 0.2 * Math.sin(frequency * x)) ** 2, 0) /
        xs.length;
    const step = 0.0025,
        iterations = 40,
        index = clamp(progress) * iterations;
    const amplitude = 0.15 * (1 - 2 * step * coefficient) ** index;
    const trial = (x: number) => exactODE(x) + amplitude * Math.sin(frequency * x);
    const residual = (x: number) => amplitude * (frequency * Math.cos(frequency * x) + 0.2 * Math.sin(frequency * x));
    return { amplitude, coefficient, loss: coefficient * amplitude * amplitude, trial, residual, xs, index };
}
export function exactFlow(t: number): V2 {
    return [Math.exp(-0.2 * t) * Math.cos(t), Math.exp(-0.2 * t) * Math.sin(t)];
}
export function eulerFlow(step: number, time = 8): V2[] {
    if (step <= 0) throw new RangeError("Positive step required");
    const states: V2[] = [[1, 0]];
    for (let t = 0; t < time - 1e-10; t += step) {
        const h = Math.min(step, time - t),
            [x, y] = states[states.length - 1];
        states.push([x + h * (-0.2 * x - y), y + h * (x - 0.2 * y)]);
    }
    return states;
}
export function eulerAt(step: number, time: number): V2 {
    return eulerFlow(step, time).at(-1)!;
}
export function pcaRotation(angle: number, minor = 1) {
    const axis: V2 = [Math.cos(angle), Math.sin(angle)];
    const points: V2[] = linspace(0, 2 * Math.PI, 25)
        .slice(0, -1)
        .map((t) => {
            const a = Math.sqrt(6) * Math.cos(t),
                b = Math.sqrt(2 * minor) * Math.sin(t);
            return [(a + b) / Math.SQRT2, (a - b) / Math.SQRT2];
        });
    const projection = points.map((p) => {
        const z = dot(p, axis);
        return [z * axis[0], z * axis[1]] as V2;
    });
    const retained = 3 * Math.cos(angle - Math.PI / 4) ** 2 + minor * Math.sin(angle - Math.PI / 4) ** 2;
    return { points, projection, axis, retained, discarded: 3 + minor - retained, total: 3 + minor };
}
export function decoderPoints(curvature: number, noise: number) {
    const z = normalInnovations(48, 821),
        eps = normalInnovations(96, 117);
    return z.map((latent, i) => {
        const mean: V2 = [latent, curvature * (latent * latent - 1)];
        return { z: latent, mean, point: [mean[0] + noise * eps[2 * i], mean[1] + noise * eps[2 * i + 1]] as V2 };
    });
}
export function precisionPosterior(precision: number, observation = 2) {
    if (precision < 0) throw new RangeError("Nonnegative precision required");
    return { mean: (precision * observation) / (1 + precision), variance: 1 / (1 + precision) };
}
export function gaussianKL(mean: number, variance: number, targetMean = 1, targetVariance = 0.5) {
    if (variance <= 0 || targetVariance <= 0) throw new RangeError("Positive variances required");
    return 0.5 * ((variance + (mean - targetMean) ** 2) / targetVariance - 1 + Math.log(targetVariance / variance));
}
export function variationalSteps(initialSpread = 1.4, steps = 40) {
    const states = [{ mean: -1.2, logSD: Math.log(initialSpread) }];
    for (let k = 0; k < steps; k++) {
        const s = states[k];
        states.push({
            mean: s.mean - (0.15 * (s.mean - 1)) / 0.5,
            logSD: s.logSD - 0.12 * (Math.exp(2 * s.logSD) / 0.5 - 1),
        });
    }
    return states;
}
export function interpolateState(states: readonly V2[], progress: number): V2 {
    const s = clamp(progress) * (states.length - 1),
        i = Math.min(states.length - 2, Math.floor(s)),
        t = s - i;
    return [mix(states[i][0], states[i + 1][0], t), mix(states[i][1], states[i + 1][1], t)];
}
