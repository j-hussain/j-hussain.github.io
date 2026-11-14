/** Deterministic teaching examples, independent of React and SVG rendering. */
function finite(...values: number[]) {
    if (!values.every(Number.isFinite)) throw new RangeError("Inputs must be finite");
}

export function correlatedVariance(g: readonly [number, number], rho: number) {
    finite(...g, rho);
    if (Math.abs(rho) > 1) throw new RangeError("Correlation must be in [-1,1]");
    return g[0] ** 2 + g[1] ** 2 + 2 * rho * g[0] * g[1];
}

export function gpOneObservation(x: number, lengthscale: number, noiseVariance = 0.04) {
    finite(x, lengthscale, noiseVariance);
    if (lengthscale <= 0 || noiseVariance < 0) throw new RangeError("Invalid GP parameter");
    const covariance = Math.exp(-0.5 * (x / lengthscale) ** 2);
    return {
        covariance,
        mean: covariance / (1 + noiseVariance),
        variance: 1 - covariance ** 2 / (1 + noiseVariance),
    };
}

export function activation(x: number) {
    finite(x);
    return {
        tanh: Math.tanh(x),
        tanhDerivative: 1 - Math.tanh(x) ** 2,
        relu: Math.max(0, x),
        reluDerivative: x === 0 ? null : x > 0 ? 1 : 0,
    };
}

export function odeExample(x: number) {
    finite(x);
    const exact = Math.exp(-x / 5) * Math.sin(x);
    const exactDerivative = Math.exp(-x / 5) * (Math.cos(x) - Math.sin(x) / 5);
    const error = 0.05 * Math.sin(6 * x);
    const trialDerivative = exactDerivative + 0.3 * Math.cos(6 * x);
    return {
        exact,
        exactDerivative,
        trial: exact + error,
        trialDerivative,
        residual: 0.3 * Math.cos(6 * x) + error / 5,
    };
}

/** Points have empirical covariance [[2,1],[1,2]] with divisor n. */
export function pcaExample() {
    return Array.from({ length: 12 }, (_, i) => {
        const t = (2 * Math.PI * i) / 12;
        const a = Math.sqrt(6) * Math.cos(t);
        const b = Math.sqrt(2) * Math.sin(t);
        return { point: [(a + b) / Math.SQRT2, (a - b) / Math.SQRT2], projection: [a / Math.SQRT2, a / Math.SQRT2] };
    });
}

/** Row n lists which nodes send to n; includes a self contribution. */
export function graphAggregate(features: readonly number[], adjacency: readonly (readonly number[])[]) {
    const n = features.length;
    if (adjacency.length !== n || adjacency.some((row) => row.length !== n))
        throw new RangeError("Invalid graph shape");
    finite(...features, ...adjacency.flat());
    return adjacency.map((row, i) => features[i] + row.reduce((sum, a, j) => sum + a * features[j], 0));
}

export function normalPosterior(
    priorMean: number,
    priorVariance: number,
    observations: readonly number[],
    noiseVariance: number
) {
    finite(priorMean, priorVariance, noiseVariance, ...observations);
    if (priorVariance <= 0 || noiseVariance <= 0) throw new RangeError("Variances must be positive");
    const variance = 1 / (1 / priorVariance + observations.length / noiseVariance);
    const mean = variance * (priorMean / priorVariance + observations.reduce((a, b) => a + b, 0) / noiseVariance);
    return { mean, variance };
}

export function normalKL(mean: number, variance: number, targetMean: number, targetVariance: number) {
    finite(mean, variance, targetMean, targetVariance);
    if (variance <= 0 || targetVariance <= 0) throw new RangeError("Variances must be positive");
    return 0.5 * ((variance + (mean - targetMean) ** 2) / targetVariance - 1 + Math.log(targetVariance / variance));
}

export function normalDensity(x: number, mean: number, variance: number) {
    finite(x, mean, variance);
    if (variance <= 0) throw new RangeError("Variance must be positive");
    return Math.exp(-((x - mean) ** 2) / (2 * variance)) / Math.sqrt(2 * Math.PI * variance);
}
