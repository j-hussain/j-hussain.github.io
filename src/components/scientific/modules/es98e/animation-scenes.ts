/** Deterministic SVG scene descriptions. All mathematical geometry stays outside React. */
import { animationCatalogue, type AnimationKind } from "./animation-catalogue";
import * as m from "./animation-math";
export type Role = "ink" | "accent" | "secondary";
type Common = { role: Role; opacity?: number; clip?: string; dash?: boolean | "dotted" };
export type Shape = Common &
    (
        | { type: "path"; points: readonly m.V2[]; fill?: boolean; closed?: boolean; width?: number }
        | { type: "circle"; x: number; y: number; r: number; fill?: boolean }
        | { type: "text"; x: number; y: number; text: string; anchor?: "start" | "middle" | "end"; size?: number }
        | { type: "rect"; x: number; y: number; width: number; height: number; fill?: boolean }
    );
export type Scene = {
    height: number;
    shapes: Shape[];
    clips: { id: string; x: number; y: number; width: number; height: number }[];
    summary: string;
    metrics: string[];
};
function painter(height = 510) {
    const scene: Scene = { height, shapes: [], clips: [], summary: "", metrics: [] };
    const path = (
        points: readonly m.V2[],
        role: Role = "accent",
        options: Partial<Common & { fill: boolean; closed: boolean; width: number }> = {}
    ) => scene.shapes.push({ type: "path", points, role, ...options });
    const line = (a: m.V2, b: m.V2, role: Role = "ink", options: Partial<Common> = {}) => path([a, b], role, options);
    const text = (
        x: number,
        y: number,
        value: string,
        role: Role = "ink",
        anchor: "start" | "middle" | "end" = "start",
        size = 16
    ) => scene.shapes.push({ type: "text", x, y, text: value, role, anchor, size });
    const circle = (x: number, y: number, r = 4, role: Role = "accent", fill = true, options: Partial<Common> = {}) =>
        scene.shapes.push({ type: "circle", x, y, r, role, fill, ...options });
    const rect = (x: number, y: number, width: number, height: number, role: Role, opacity = 1) =>
        scene.shapes.push({ type: "rect", x, y, width, height, role, opacity, fill: true });
    const arrow = (a: m.V2, b: m.V2, role: Role = "accent", opacity = 1) => {
        line(a, b, role, { opacity });
        const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
        path(
            [
                [b[0] - 7 * Math.cos(angle - 0.45), b[1] - 7 * Math.sin(angle - 0.45)],
                b,
                [b[0] - 7 * Math.cos(angle + 0.45), b[1] - 7 * Math.sin(angle + 0.45)],
            ],
            role,
            { opacity }
        );
    };
    const graph = (
        id: string,
        x: number,
        y: number,
        width: number,
        height: number,
        xmin: number,
        xmax: number,
        ymin: number,
        ymax: number,
        xlabel: string,
        ylabel: string
    ) => {
        const X = (v: number) => x + (width * (v - xmin)) / (xmax - xmin),
            Y = (v: number) => y + (height * (ymax - v)) / (ymax - ymin);
        scene.clips.push({ id, x, y, width, height });
        line([x, y], [x, y + height], "ink", { opacity: 0.35 });
        line([x, y + height], [x + width, y + height], "ink", { opacity: 0.35 });
        if (ymin < 0 && ymax > 0) line([x, Y(0)], [x + width, Y(0)], "ink", { opacity: 0.12 });
        if (xmin < 0 && xmax > 0) line([X(0), y], [X(0), y + height], "ink", { opacity: 0.12 });
        text(x, y + height + 24, String(xmin), "ink", "middle", 15);
        text(x + width, y + height + 24, String(xmax), "ink", "middle", 15);
        text(x - 8, y + 6, String(ymax), "ink", "end", 15);
        text(x - 8, y + height + 5, String(ymin), "ink", "end", 15);
        text(x + width, y + height + 42, xlabel, "ink", "end", 16);
        text(x, y - 13, ylabel, "ink", "start", 16);
        return { X, Y, clip: id, point: ([a, b]: m.V2): m.V2 => [X(a), Y(b)] };
    };
    const curve = (
        g: ReturnType<typeof graph>,
        xs: readonly number[],
        f: (x: number) => number,
        role: Role = "accent",
        options: Partial<Common & { width: number }> = {}
    ) =>
        path(
            xs.map((x) => [g.X(x), g.Y(f(x))]),
            role,
            { clip: g.clip, ...options }
        );
    return { scene, path, line, text, circle, rect, arrow, graph, curve };
}
const fmt = (x: number, digits = 3) => (Number.isFinite(x) ? x.toFixed(digits) : "outside range");
export function animationScene(kind: AnimationKind, progress: number, parameter: number): Scene {
    const p = m.clamp(progress),
        b = painter(),
        { scene, path, line, text, circle, rect, arrow, graph, curve } = b;
    switch (kind) {
        case "tangent-trust": {
            scene.height = 405;
            const g = graph("response", 55, 35, 370, 285, -1.8, 1.8, -2, 5, "perturbation s", "response Q");
            const xs = m.linspace(-1.8, 1.8),
                s = 1.6 * Math.sin(2 * Math.PI * p),
                r = m.localResponse(s, parameter);
            curve(g, xs, (x) => m.localResponse(x, parameter).exact);
            curve(g, xs, (x) => x, "ink", { dash: true });
            line(g.point([s, r.linear]), g.point([s, r.exact]), "secondary", { opacity: 0.9 });
            circle(g.X(s), g.Y(r.exact), 6);
            circle(g.X(s), g.Y(r.linear), 5, "ink", false);
            text(70, 382, "solid: Q(s)     dashed: tangent", "ink", "start", 16);
            scene.metrics = [`s = ${fmt(s)}`, `omitted term = ${fmt(r.error)}`];
            break;
        }
        case "uncertainty-transport": {
            const rho = -0.9 + 1.8 * p,
                data = m.covarianceTransport(rho, parameter);
            const g = graph("inputs", 72, 28, 336, 235, -3, 3, -2.1, 2.1, "Δ₁", "Δ₂ (equal units)");
            const root = Math.sqrt(1 - rho * rho);
            path(
                m
                    .linspace(0, 2 * Math.PI, 101)
                    .map((t) => g.point([Math.cos(t), rho * Math.cos(t) + root * Math.sin(t)])),
                "secondary"
            );
            for (const point of data.points)
                circle(...g.point(point), 2.4, "accent", true, { opacity: 0.5, clip: g.clip });
            arrow(g.point([0, 0]), g.point([0.7, 0.7 * parameter]));
            const out = graph("output", 55, 355, 370, 95, -6, 6, 0, 1, "output Q", "exact output density");
            curve(out, m.linspace(-6, 6), (x) => m.normalPDF(x, 0, Math.max(data.variance, 0.001)), "secondary");
            for (const value of data.outputs)
                circle(out.X(value), out.Y(0) - 3, 2, "secondary", true, { opacity: 0.25, clip: out.clip });
            scene.metrics = [`ρ = ${fmt(rho, 2)}`, `Var(Q) = ${fmt(data.variance)}`];
            break;
        }
        case "feature-lift": {
            scene.height = 405;
            const yaw = (parameter * Math.PI) / 180;
            const project = (v: m.V3): m.V2 => {
                const q = m.project3(v, yaw);
                return [240 + 104 * q[0], 292 - 104 * q[1]];
            };
            const plane = 0.8 * p;
            // Fixed reference grid makes depth readable without changing mathematical units.
            for (const x of [-1.4, -0.7, 0, 0.7, 1.4])
                line(project([x, -1.4, 0]), project([x, 1.4, 0]), "ink", { opacity: 0.1 });
            for (const y of [-1.4, -0.7, 0, 0.7, 1.4])
                line(project([-1.4, y, 0]), project([1.4, y, 0]), "ink", { opacity: 0.1 });
            const planeCorners: m.V3[] = [
                [-1.4, -1.4, plane],
                [1.4, -1.4, plane],
                [1.4, 1.4, plane],
                [-1.4, 1.4, plane],
            ];
            path(planeCorners.map(project), "secondary", { closed: true, fill: true, opacity: p * 0.1 });
            path(planeCorners.map(project), "secondary", { closed: true, opacity: p * 0.6, dash: true });
            for (const radius of [0.35, 0.65, 1.05, 1.3])
                path(
                    m
                        .linspace(0, 2 * Math.PI, 81)
                        .map((t) => project(m.liftPoint(radius * Math.cos(t), radius * Math.sin(t), p))),
                    "ink",
                    { opacity: 0.13 }
                );
            for (let i = 0; i < 12; i++) {
                const a = (i * Math.PI) / 6;
                path(
                    m.linspace(0, 1.3, 21).map((r) => project(m.liftPoint(r * Math.cos(a), r * Math.sin(a), p))),
                    "ink",
                    { opacity: 0.1 }
                );
            }
            const points = [...m.circleData].sort(
                (a, c) => Math.sin(yaw) * c.x + Math.cos(yaw) * c.y - (Math.sin(yaw) * a.x + Math.cos(yaw) * a.y)
            );
            for (const d of points) {
                const q = project(m.liftPoint(d.x, d.y, p));
                circle(q[0], q[1], d.inner ? 3.8 : 4.2, d.inner ? "accent" : "secondary", d.inner, { opacity: 0.9 });
            }
            for (const [end, label] of [
                [[1.65, 0, 0], "x"],
                [[0, 1.65, 0], "y"],
                [[0, 0, 2.1], "z"],
            ] as const) {
                const a = project([0, 0, 0]),
                    q = project(end);
                arrow(a, q, "ink", 0.4);
                text(q[0] + 6, q[1] - 7, label);
            }
            text(18, 27, `lift τ = ${fmt(p, 2)}`, "ink", "start", 18);
            text(18, 385, "● inner disk     ○ outer ring", "ink", "start", 17);
            if (p > 0.12) text(460, 58, "z = 0.8τ", "secondary", "end", 17);
            scene.metrics = [`inner height ≤ ${fmt(p * 0.65 ** 2)}`, `outer height ≥ ${fmt(p * 1.05 ** 2)}`];
            break;
        }
        case "ridge-path": {
            const fit = m.ridgeExample(p, parameter),
                g = graph("fit", 55, 30, 370, 245, -1, 1, -1.7, 1.7, "input x", "function / observations");
            curve(g, m.linspace(-1, 1), (x) => Math.cos(Math.PI * x), "ink", { dash: true });
            curve(g, m.linspace(-1, 1, 161), fit.predict);
            for (const d of m.regressionData) circle(g.X(d.x), g.Y(d.y), 4, "ink", false);
            text(55, 345, "Chebyshev coefficients", "ink", "start", 17);
            line([55, 405], [425, 405], "ink", { opacity: 0.2 });
            fit.weights.forEach((w, i) => {
                const x = 65 + i * 33,
                    bar = Math.min(50, Math.abs(w) * 48);
                rect(x, w >= 0 ? 405 - bar : 405, 18, bar, i ? "accent" : "ink", 0.7);
                text(x + 9, 478, String(i), "ink", "middle", 14);
            });
            scene.metrics = [`λ = ${fit.lambda.toPrecision(3)}`, `reference MSE = ${fmt(fit.test, 4)}`];
            break;
        }
        case "gp-conditioning": {
            const observations = m.revealObservations(p, parameter),
                grid = m.linspace(-2.5, 2.5, 101),
                posterior = m.gpPosterior(grid, observations);
            const g = graph("posterior", 55, 30, 370, 245, -2.5, 2.5, -2.3, 2.3, "input x", "latent function f");
            const upper = posterior.map((d) => g.point([d.x, d.mean + 2 * Math.sqrt(d.variance)])),
                lower = [...posterior].reverse().map((d) => g.point([d.x, d.mean - 2 * Math.sqrt(d.variance)]));
            path([...upper, ...lower], "accent", { closed: true, fill: true, opacity: 0.13, clip: g.clip });
            path(
                posterior.map((d) => g.point([d.x, d.mean])),
                "accent",
                { clip: g.clip, width: 2.5 }
            );
            for (const [i, d] of m.gpObservations.entries())
                circle(g.X(d.x), g.Y(d.y), 5, "ink", p * 3 > i, { opacity: p * 3 > i ? 1 : 0.2 });
            const k = graph("covariance", 55, 375, 370, 85, -2.5, 2.5, 0, 1, "input x", "covariance with observations");
            for (const [i, d] of m.gpObservations.entries())
                curve(k, grid, (x) => m.rbfKernel(x, d.x, 0.7), i === 1 ? "secondary" : "accent", {
                    dash: i !== 0,
                    opacity: m.clamp(3 * p - i),
                });
            const atZero = posterior[50];
            scene.metrics = [
                `${observations.length} observations contributing`,
                `latent variance at 0 = ${fmt(atZero.variance)}`,
            ];
            break;
        }
        case "kernel-morph": {
            const ell = 0.18 + 1.62 * p,
                sample = m.gpSamples(ell, parameter),
                g = graph("draws", 55, 30, 370, 205, -2.5, 2.5, -4.5, 4.5, "input x", "three coupled GP draws");
            sample.paths.forEach((ys, i) =>
                path(
                    ys.map((y, k) => g.point([sample.grid[k], y])),
                    i === 1 ? "secondary" : "accent",
                    { dash: i === 2, opacity: i === 2 ? 0.6 : 1, clip: g.clip }
                )
            );
            text(55, 315, "Covariance on seven equally spaced inputs", "ink", "start", 15);
            const knots = m.linspace(-2.5, 2.5, 7);
            for (let i = 0; i < 7; i++)
                for (let j = 0; j < 7; j++)
                    rect(
                        145 + j * 24,
                        337 + i * 24,
                        22,
                        22,
                        "accent",
                        m.rbfKernel(knots[i], knots[j], ell, parameter) / 2
                    );
            scene.metrics = [`lengthscale ℓ = ${fmt(ell, 2)}`, `signal variance = ${fmt(parameter, 1)}`];
            break;
        }
        case "activation-flow": {
            scene.height = 400;
            const chain = m.activationChain(parameter),
                position = 5 * (1 - p);
            for (const [row, values, jacobians, label] of [
                [0, chain.tanh, chain.jt, "tanh"],
                [1, chain.relu, chain.jr, "ReLU"],
            ] as const) {
                const y = 85 + 180 * row;
                text(20, y - 48, label, "ink", "start", 18);
                for (let i = 0; i < 5; i++)
                    line([40 + i * 80, y], [120 + i * 80, y], row ? "secondary" : "accent", { opacity: 0.3 });
                for (let i = 0; i <= 5; i++) {
                    circle(40 + i * 80, y, 15, row ? "secondary" : "accent", false);
                    text(40 + i * 80, y + 43, fmt(values[i], 2), "ink", "middle", 15);
                }
                const partial = m.backwardTransport(jacobians, position);
                circle(
                    40 + 80 * position,
                    y,
                    3 + 10 * Math.sqrt(Math.min(partial, 1.7)),
                    row ? "secondary" : "accent",
                    true,
                    { opacity: 0.9 }
                );
                text(
                    20,
                    y + 80,
                    `input gradient: ${fmt(row ? chain.gradientRelu : chain.gradientTanh, 5)}`,
                    row ? "secondary" : "accent",
                    "start",
                    16
                );
            }
            scene.metrics = [
                `tanh derivative product = ${fmt(chain.gradientTanh, 5)}`,
                `ReLU derivative product = ${fmt(chain.gradientRelu, 3)}`,
            ];
            break;
        }
        case "gradient-descent": {
            scene.height = 470;
            const g = graph("descent", 60, 35, 360, 360, -2.6, 2.6, -2.6, 2.6, "weight w₁", "weight w₂ (equal units)");
            for (const level of [0.1, 0.4, 1, 2, 4, 8])
                path(
                    m
                        .linspace(0, 2 * Math.PI, 101)
                        .map((t) =>
                            g.point([Math.sqrt(2 * level) * Math.cos(t), Math.sqrt((2 * level) / 5) * Math.sin(t)])
                        ),
                    "ink",
                    { opacity: 0.12, clip: g.clip }
                );
            const trajectory = m.gradientTrajectory(parameter),
                point = m.interpolateState(trajectory, p),
                count = Math.floor(p * 40);
            path([...trajectory.slice(0, count + 1), point].map(g.point), "accent", { clip: g.clip });
            trajectory
                .slice(0, count + 1)
                .forEach((q) => circle(...g.point(q), 2.5, "accent", true, { clip: g.clip, opacity: 0.5 }));
            circle(...g.point(point), 6, "accent", true, { clip: g.clip });
            circle(...g.point([0, 0]), 3, "ink");
            const outside = Math.abs(point[0]) > 2.6 || Math.abs(point[1]) > 2.6;
            text(
                64,
                455,
                outside ? "Trajectory has left this fixed viewport" : "dots: iterates · line: visual interpolation",
                outside ? "secondary" : "ink",
                "start",
                14
            );
            scene.metrics = [`step ${count}/40`, `loss = ${m.quadraticLoss(point).toPrecision(4)}`];
            break;
        }
        case "molecular-symmetry": {
            scene.height = 440;
            const angle = 2 * Math.PI * p,
                transformed = m.molecule.map((q) => {
                    const v = m.rotate(q, angle);
                    return [v[0] + parameter, v[1]] as m.V2;
                }),
                physical = m.springMolecule(transformed);
            const g = graph(
                "molecule",
                65,
                35,
                350,
                350,
                -2.2,
                2.2,
                -2.2,
                2.2,
                "position x",
                "position y (equal units)"
            );
            for (let i = 0; i < 3; i++)
                for (let j = i + 1; j < 3; j++) {
                    line(g.point(m.molecule[i]), g.point(m.molecule[j]), "ink", { opacity: 0.16, dash: true });
                    line(g.point(transformed[i]), g.point(transformed[j]), "ink", { opacity: 0.45 });
                }
            transformed.forEach((q, i) => {
                const f = physical.forces[i];
                arrow(g.point(q), g.point([q[0] + 0.85 * f[0], q[1] + 0.85 * f[1]]), "secondary");
                circle(...g.point(q), 11, "accent", false);
                text(g.X(q[0]), g.Y(q[1]) + 5, String(i + 1), "ink", "middle", 13);
            });
            scene.metrics = [
                `energy = ${fmt(physical.energy, 5)}`,
                `|ΣF| = ${Math.hypot(...physical.forces.reduce((a, f) => [a[0] + f[0], a[1] + f[1]], [0, 0])).toFixed(8)}`,
            ];
            break;
        }
        case "message-waves": {
            scene.height = 365;
            const states = m.messageLayers(),
                stage = Math.min(3, Math.floor(4 * p)),
                fraction = p === 1 ? 1 : 4 * p - stage,
                current = states[stage],
                next = states[stage + 1];
            const positions = Array.from({ length: 5 }, (_, i) => 50 + 95 * (parameter > 0.5 ? 4 - i : i));
            text(22, 28, `Layer ${stage} → ${stage + 1}`, "ink", "start", 18);
            for (let i = 0; i < 4; i++) line([positions[i], 160], [positions[i + 1], 160], "ink", { opacity: 0.25 });
            for (let i = 0; i < 5; i++)
                for (let j = 0; j < 5; j++)
                    if (m.pathAdjacency[i][j] && current[j] > 0) {
                        const x = m.mix(positions[j], positions[i], fraction);
                        circle(
                            x,
                            160 + (j > i ? 18 : -18) * Math.sin(Math.PI * fraction),
                            3 + 4 * current[j],
                            "secondary",
                            true,
                            { opacity: 0.85 }
                        );
                    }
            for (let i = 0; i < 5; i++) {
                const value = m.mix(current[i], next[i], m.clamp((fraction - 0.5) * 2));
                circle(positions[i], 160, 22, "accent", false);
                circle(positions[i], 160, 17, "accent", true, { opacity: 0.1 + 0.65 * value });
                text(positions[i], 110, fmt(value, 3), "ink", "middle", 15);
                text(positions[i], 215, `node ${i + 1}`, "ink", "middle", 14);
            }
            const mean = next.reduce((a, v) => a + v, 0) / 5;
            text(240, 285, "weighted messages → updated node features", "ink", "middle", 16);
            scene.metrics = [`completed layers = ${Math.floor(4 * p)}`, `next-layer mean = ${fmt(mean, 4)}`];
            break;
        }
        case "residual-fit": {
            const fit = m.residualFit(p, parameter),
                xs = m.linspace(0, 6, 181),
                g = graph("solution", 55, 30, 370, 195, 0, 6, -0.6, 1.1, "x", "trial and exact solution");
            curve(g, xs, m.exactODE, "ink", { dash: true });
            curve(g, xs, fit.trial);
            const r = graph("residual", 55, 340, 370, 115, 0, 6, -1, 1, "x", "residual (different vertical scale)");
            curve(r, xs, fit.residual, "secondary");
            fit.xs.forEach((x) => circle(r.X(x), r.Y(fit.residual(x)), 3, "ink", false));
            scene.metrics = [
                `amplitude a = ${fmt(fit.amplitude, 6)}`,
                `collocation loss = ${fit.loss.toExponential(2)}`,
            ];
            break;
        }
        case "ode-flow": {
            scene.height = 465;
            const g = graph("flow", 65, 35, 350, 350, -1.6, 1.6, -1.6, 1.6, "state x", "state y (equal units)"),
                time = 8 * p;
            for (const x of m.linspace(-1.2, 1.2, 7))
                for (const y of m.linspace(-1.2, 1.2, 7))
                    arrow(g.point([x, y]), g.point([x + 0.1 * (-0.2 * x - y), y + 0.1 * (x - 0.2 * y)]), "ink", 0.12);
            const exact = m.exactFlow(time),
                euler = m.eulerAt(parameter, time),
                exactPath = m.linspace(0, Math.max(time, 1e-8), 101).map(m.exactFlow),
                eulerPath = m.eulerFlow(parameter, time);
            path(exactPath.map(g.point), "accent", { clip: g.clip });
            path(eulerPath.map(g.point), "secondary", { clip: g.clip, dash: true });
            circle(...g.point(exact), 6, "accent", true, { clip: g.clip });
            circle(...g.point(euler), 6, "secondary", false, { clip: g.clip });
            text(
                65,
                455,
                Math.max(Math.abs(euler[0]), Math.abs(euler[1])) > 1.6
                    ? "Euler has left the fixed viewport"
                    : "solid: exact · outlined: Euler",
                "ink",
                "start",
                15
            );
            scene.metrics = [
                `time = ${fmt(time, 2)}`,
                `trajectory error = ${fmt(Math.hypot(euler[0] - exact[0], euler[1] - exact[1]), 4)}`,
            ];
            break;
        }
        case "pca-rotation": {
            const angle = Math.PI * p,
                data = m.pcaRotation(angle, parameter),
                g = graph(
                    "pca",
                    55,
                    30,
                    370,
                    (370 * 4.6) / 6,
                    -3,
                    3,
                    -2.3,
                    2.3,
                    "coordinate x₁",
                    "coordinate x₂ (equal units)"
                );
            const u = data.axis;
            line(g.point([-2.6 * u[0], -2.6 * u[1]]), g.point([2.6 * u[0], 2.6 * u[1]]), "accent");
            data.points.forEach((point, i) => {
                const projected = data.projection[i];
                line(g.point(point), g.point(projected), "secondary", { opacity: 0.55, dash: true });
                circle(...g.point(point), 3, "ink", false);
                circle(...g.point(projected), 3, "accent");
            });
            const v = graph("variance", 55, 395, 370, 60, 0, 180, 0, 5, "axis angle (degrees)", "retained variance");
            curve(v, m.linspace(0, 180), (x) => m.pcaRotation((x * Math.PI) / 180, parameter).retained);
            circle(v.X(p * 180), v.Y(data.retained), 5);
            scene.metrics = [
                `retained = ${fmt(data.retained)}`,
                `discarded = ${fmt(data.discarded)}; total = ${fmt(data.total, 1)}`,
            ];
            break;
        }
        case "decoder-bend": {
            scene.height = 490;
            const curvature = 0.8 * p,
                data = m.decoderPoints(curvature, parameter),
                g = graph("decoder", 55, 30, 370, 310, -3, 3, -1.5, 5, "decoded x₁", "decoded x₂");
            curve(g, m.linspace(-2.7, 2.7), (z) => curvature * (z * z - 1));
            data.forEach((d) => {
                line(g.point(d.mean), g.point(d.point), "secondary", { opacity: 0.6, clip: g.clip });
                circle(...g.point(d.mean), 2.5, "accent", true, { clip: g.clip });
                circle(...g.point(d.point), 3, "secondary", false, { clip: g.clip });
            });
            text(55, 423, "The same latent draws z", "ink", "start", 16);
            line([55, 455], [425, 455], "ink", { opacity: 0.3 });
            data.forEach((d) => circle(g.X(d.z), 455, 2.4, "ink", true, { opacity: 0.6 }));
            scene.metrics = [`curvature b = ${fmt(curvature, 2)}`, `noise σ = ${fmt(parameter, 2)}`];
            break;
        }
        case "normal-update": {
            scene.height = 395;
            const precision = 4 * p,
                posterior = m.precisionPosterior(precision, parameter),
                g = graph("normal", 55, 30, 370, 270, -3, 5, 0, 1, "latent g", "probability density"),
                xs = m.linspace(-3, 5, 161);
            curve(g, xs, (x) => m.normalPDF(x), "ink", { dash: true });
            if (precision > 1e-6)
                curve(g, xs, (x) => m.normalPDF(x, parameter, 1 / precision), "secondary", { dash: "dotted" });
            curve(g, xs, (x) => m.normalPDF(x, posterior.mean, posterior.variance));
            text(55, 378, "prior · rescaled likelihood · posterior", "ink", "start", 16);
            scene.metrics = [
                `posterior mean = ${fmt(posterior.mean)}`,
                `posterior variance = ${fmt(posterior.variance)}`,
            ];
            break;
        }
        case "variational-gap": {
            const states = m.variationalSteps(parameter),
                s = p * 40,
                i = Math.min(39, Math.floor(s)),
                t = s - i,
                a = m.mix(states[i].mean, states[i + 1].mean, t),
                logSD = m.mix(states[i].logSD, states[i + 1].logSD, t),
                variance = Math.exp(2 * logSD),
                kl = m.gaussianKL(a, variance);
            const g = graph("variational", 55, 30, 370, 210, -5, 5, 0, 1, "latent g", "density q and exact posterior"),
                xs = m.linspace(-5, 5, 161);
            curve(g, xs, (x) => m.normalPDF(x, 1, 0.5), "ink", { dash: true });
            curve(g, xs, (x) => m.normalPDF(x, a, variance));
            const evidence = -0.5 * Math.log(4 * Math.PI) - 1,
                elbo = evidence - kl,
                Y = (value: number) => 480 - 15 * (value + 12);
            rect(210, Y(evidence), 58, Y(elbo) - Y(evidence), "secondary", 0.17);
            line([55, Y(evidence)], [425, Y(evidence)], "ink", { dash: true });
            line([55, Y(elbo)], [425, Y(elbo)], "accent");
            text(55, Y(evidence) - 12, "log evidence (fixed)", "ink", "start", 16);
            text(425, Y(elbo) + 23, "ELBO", "accent", "end", 16);
            scene.metrics = [`KL gap = ${fmt(kl, 6)}`, `q mean = ${fmt(a)}; variance = ${fmt(variance)}`];
            break;
        }
    }
    scene.summary = `${animationCatalogue[kind].title}. ${scene.metrics.join(". ")}.`;
    return scene;
}
