/** Exact, deterministic teaching calculations. No trajectory data or React dependencies. */
function positive(value: number, name: string) {
    if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${name} must be finite and positive`);
}
export function normalisedWeights(logWeights: readonly number[]) {
    if (!logWeights.length || logWeights.some((v) => !Number.isFinite(v)))
        throw new RangeError("Finite nonempty weights required");
    const shift = Math.max(...logWeights);
    const weights = logWeights.map((v) => Math.exp(v - shift));
    const sum = weights.reduce((a, b) => a + b, 0);
    return weights.map((v) => v / sum);
}
export function levelProbabilities(betaDelta: number, multiplicity = 4) {
    if (!Number.isFinite(betaDelta) || !Number.isInteger(multiplicity) || multiplicity < 1)
        throw new RangeError("Invalid level parameters");
    const [ground, excited] = normalisedWeights([0, Math.log(multiplicity) - betaDelta]);
    return { ground, excited, excitedMicrostate: excited / multiplicity };
}
export function lennardJones(r: number, epsilon = 1, sigma = 1) {
    positive(r, "r");
    positive(epsilon, "epsilon");
    positive(sigma, "sigma");
    const q = (sigma / r) ** 6;
    return { energy: 4 * epsilon * (q * q - q), force: ((24 * epsilon) / r) * (2 * q * q - q) };
}
export function harmonic(beta: number, stiffness: number, friction: number) {
    positive(beta, "beta");
    positive(stiffness, "stiffness");
    positive(friction, "friction");
    return {
        variance: 1 / (beta * stiffness),
        relaxation: friction / stiffness,
        diffusion: 1 / (beta * friction),
        noiseAmplitude: Math.sqrt(2 / (beta * friction)),
    };
}
export function eulerHarmonicVariance(beta: number, stiffness: number, friction: number, dt: number) {
    const exact = harmonic(beta, stiffness, friction).variance;
    positive(dt, "dt");
    if ((stiffness * dt) / friction >= 2) throw new RangeError("Unstable harmonic timestep");
    return exact / (1 - (stiffness * dt) / (2 * friction));
}
export function gaussianDensity(x: number, variance: number) {
    positive(variance, "variance");
    return Math.exp((-x * x) / (2 * variance)) / Math.sqrt(2 * Math.PI * variance);
}
export function metropolisAcceptance(beta: number, deltaEnergy: number, logReverseOverForward = 0) {
    positive(beta, "beta");
    if (!Number.isFinite(deltaEnergy) || !Number.isFinite(logReverseOverForward))
        throw new RangeError("Finite energies and proposal ratio required");
    return Math.exp(Math.min(0, -beta * deltaEnergy + logReverseOverForward));
}
export function finiteVarianceFactor(length: number, rho: (lag: number) => number) {
    if (!Number.isInteger(length) || length < 1) throw new RangeError("Positive integer length required");
    let factor = 1;
    for (let k = 1; k < length; k++) factor += 2 * (1 - k / length) * rho(k);
    return factor;
}
export function ar1Factor(a: number) {
    if (!Number.isFinite(a) || Math.abs(a) >= 1) throw new RangeError("Stationary AR coefficient required");
    return (1 + a) / (1 - a);
}
export type Bond = readonly [number, number];
export function isingEnergy(spins: readonly number[], bonds: readonly Bond[], coupling: number) {
    return -coupling * bonds.reduce((sum, [i, j]) => sum + spins[i] * spins[j], 0);
}
export function isingFlipChange(spins: readonly number[], bonds: readonly Bond[], coupling: number, site: number) {
    return (
        2 *
        coupling *
        spins[site] *
        bonds.reduce((sum, [i, j]) => sum + (i === site ? spins[j] : j === site ? spins[i] : 0), 0)
    );
}
export function clusterBondProbability(beta: number, coupling: number) {
    positive(beta, "beta");
    if (!Number.isFinite(coupling) || coupling < 0) throw new RangeError("Ferromagnetic coupling required");
    return -Math.expm1(-2 * beta * coupling);
}
export function nptLogRatio(
    beta: number,
    deltaEnergy: number,
    pressure: number,
    oldVolume: number,
    newVolume: number,
    particles: number,
    logVolumeProposal = false
) {
    positive(beta, "beta");
    positive(oldVolume, "oldVolume");
    positive(newVolume, "newVolume");
    if (!Number.isInteger(particles) || particles < 1) throw new RangeError("Positive particle count required");
    return (
        -beta * (deltaEnergy + pressure * (newVolume - oldVolume)) +
        (particles + Number(logVolumeProposal)) * Math.log(newVolume / oldVolume)
    );
}
export function pairEventRates(beta: number, directionalDerivative: number) {
    positive(beta, "beta");
    return {
        forward: beta * Math.max(0, directionalDerivative),
        reverseActivity: beta * Math.max(0, -directionalDerivative),
    };
}
export function harmonicEventDisplacement(threshold: number, beta = 1, stiffness = 1) {
    positive(beta, "beta");
    positive(stiffness, "stiffness");
    if (!Number.isFinite(threshold) || threshold < 0) throw new RangeError("Nonnegative threshold required");
    return Math.sqrt((2 * threshold) / (beta * stiffness));
}
export function tentKernel(x: number, h: number) {
    positive(h, "h");
    return Math.max(0, 1 - Math.abs(x) / h) / h;
}
export function sphPairForce(
    massI: number,
    massJ: number,
    pressureI: number,
    pressureJ: number,
    densityI: number,
    densityJ: number,
    gradientI: number
) {
    positive(massI, "massI");
    positive(massJ, "massJ");
    positive(densityI, "densityI");
    positive(densityJ, "densityJ");
    return -massI * massJ * (pressureI / densityI ** 2 + pressureJ / densityJ ** 2) * gradientI;
}
export function harmonicFreeEnergyDifference(beta: number, stiffnessA: number, stiffnessB: number) {
    positive(beta, "beta");
    positive(stiffnessA, "stiffnessA");
    positive(stiffnessB, "stiffnessB");
    return Math.log(stiffnessB / stiffnessA) / (2 * beta);
}
export function harmonicTIIntegrand(lambda: number, beta: number, stiffnessA: number, stiffnessB: number) {
    harmonicFreeEnergyDifference(beta, stiffnessA, stiffnessB);
    if (!Number.isFinite(lambda) || lambda < 0 || lambda > 1) throw new RangeError("Lambda must be in [0,1]");
    return (stiffnessB - stiffnessA) / (2 * beta * ((1 - lambda) * stiffnessA + lambda * stiffnessB));
}
