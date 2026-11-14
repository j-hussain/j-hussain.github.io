import test from "node:test";
import assert from "node:assert/strict";
import {
    ar1Factor,
    clusterBondProbability,
    eulerHarmonicVariance,
    finiteVarianceFactor,
    gaussianDensity,
    harmonic,
    harmonicEventDisplacement,
    harmonicFreeEnergyDifference,
    harmonicTIIntegrand,
    isingEnergy,
    isingFlipChange,
    lennardJones,
    levelProbabilities,
    metropolisAcceptance,
    normalisedWeights,
    nptLogRatio,
    pairEventRates,
    sphPairForce,
    tentKernel,
    type Bond,
} from "../../../src/components/scientific/modules/es98d/math";
const near = (a: number, b: number, tol = 1e-10) => assert.ok(Math.abs(a - b) < tol, `${a} != ${b}`);
function midpoint(fn: (x: number) => number, lo: number, hi: number, n = 20000) {
    const dx = (hi - lo) / n;
    return Array.from({ length: n }, (_, i) => fn(lo + (i + 0.5) * dx)).reduce((a, b) => a + b, 0) * dx;
}

test("level degeneracy, normalisation, temperature limits and stable log weights", () => {
    const warm = levelProbabilities(Math.log(2));
    near(warm.excited, 2 / 3);
    near(warm.ground, 1 / 3);
    near(warm.excitedMicrostate / warm.ground, 0.5);
    near(levelProbabilities(Math.log(8)).excited, 1 / 3);
    near(levelProbabilities(0).excited, 0.8);
    near(levelProbabilities(1000).ground, 1);
    near(normalisedWeights([1000, 1000])[0], 0.5);
    assert.throws(() => normalisedWeights([]));
    assert.throws(() => levelProbabilities(1, 0));
});

test("LJ analytic landmarks and force is negative energy derivative", () => {
    near(lennardJones(1).energy, 0);
    const rstar = 2 ** (1 / 6);
    near(lennardJones(rstar).energy, -1);
    near(lennardJones(rstar).force, 0);
    for (const r of [0.95, 1.1, 1.5, 2.5]) {
        const h = 1e-6,
            derivative = (lennardJones(r + h).energy - lennardJones(r - h).energy) / (2 * h);
        near(lennardJones(r).force, -derivative, 2e-7);
    }
    assert.throws(() => lennardJones(0));
});

test("fluctuation dissipation, Gibbs harmonic width, normalisation and friction independence", () => {
    for (const gamma of [0.2, 1, 4]) {
        const h = harmonic(2, 3, gamma);
        near(h.variance, 1 / 6);
        near(h.noiseAmplitude ** 2, 2 * h.diffusion);
        // Diffusion and restoring drift cancel the stationary variance derivative.
        near(((-2 * 3) / gamma) * h.variance + 2 * h.diffusion, 0);
    }
    near(
        midpoint((x) => gaussianDensity(x, 0.25), -6, 6),
        1
    );
    near(
        midpoint((x) => x * x * gaussianDensity(x, 0.25), -6, 6),
        0.25
    );
    assert.throws(() => harmonic(0, 1, 1));
});

test("Euler harmonic invariant variance, small-step limit and stability boundary", () => {
    const variance = eulerHarmonicVariance(2, 3, 4, 0.2),
        a = 1 - (3 * 0.2) / 4;
    near(a * a * variance + (2 * 0.2) / (2 * 4), variance);
    near(eulerHarmonicVariance(2, 3, 4, 1e-8), 1 / 6, 1e-8);
    assert.throws(() => eulerHarmonicVariance(1, 1, 1, 2));
    assert.throws(() => eulerHarmonicVariance(1, 1, 1, 0));
});

test("Metropolis flux and explicit rejection mass for two states", () => {
    const alpha = metropolisAcceptance(1, Math.log(4));
    near(alpha, 0.25);
    near(0.8 * alpha, 0.2 * metropolisAcceptance(1, -Math.log(4)));
    const P = [
            [1 - alpha, alpha],
            [1, 0],
        ],
        pi = [0.8, 0.2];
    for (let j = 0; j < 2; j++)
        near(
            pi.reduce((v, p, i) => v + p * P[i][j], 0),
            pi[j]
        );
    // Jump-chain probabilities are uniform; residence weighting restores 4:1.
    near(pi[0] * alpha, pi[1]);
    near(1 / alpha / (1 / alpha + 1), pi[0]);
});

test("asymmetric proposal needs the Hastings factor", () => {
    const p = [0.7, 0.3],
        q = [
            [0.8, 0.2],
            [0.9, 0.1],
        ];
    const delta = -Math.log(p[1] / p[0]);
    const forward = metropolisAcceptance(1, delta, Math.log(q[1][0] / q[0][1]));
    const reverse = metropolisAcceptance(1, -delta, Math.log(q[0][1] / q[1][0]));
    near(p[0] * q[0][1] * forward, p[1] * q[1][0] * reverse);
});

test("exact finite covariance sum agrees with direct covariance matrix, including negative memory", () => {
    for (const a of [-0.5, 0, 0.5, 0.9])
        for (const M of [1, 2, 10, 50]) {
            let covarianceSum = 0;
            for (let i = 0; i < M; i++) for (let j = 0; j < M; j++) covarianceSum += a ** Math.abs(i - j);
            near(finiteVarianceFactor(M, (k) => a ** k) / M, covarianceSum / (M * M));
        }
    near(ar1Factor(0.9), 19);
    near(ar1Factor(-0.5), 1 / 3);
    near(
        finiteVarianceFactor(10000, (k) => 0.5 ** k),
        ar1Factor(0.5),
        0.001
    );
    assert.throws(() => ar1Factor(1));
    assert.throws(() => finiteVarianceFactor(0, () => 0));
});

test("all 16 open-square Ising states: local energy change and Metropolis invariance", () => {
    const bonds: Bond[] = [
            [0, 1],
            [0, 2],
            [1, 3],
            [2, 3],
        ],
        J = 0.7,
        beta = 0.8;
    const states = Array.from({ length: 16 }, (_, k) => Array.from({ length: 4 }, (_, i) => (k & (1 << i) ? 1 : -1)));
    const energies = states.map((s) => isingEnergy(s, bonds, J));
    const pi = normalisedWeights(energies.map((E) => -beta * E));
    const P = states.map((s, n) => {
        const row = Array(16).fill(0);
        for (let i = 0; i < 4; i++) {
            const next = n ^ (1 << i),
                delta = isingFlipChange(s, bonds, J, i);
            near(delta, energies[next] - energies[n]);
            const alpha = metropolisAcceptance(beta, delta) / 4;
            row[next] += alpha;
            row[n] += 0.25 - alpha;
        }
        near(
            row.reduce((a, b) => a + b, 0),
            1
        );
        return row;
    });
    for (let j = 0; j < 16; j++)
        near(
            pi.reduce((v, p, i) => v + p * P[i][j], 0),
            pi[j]
        );
});

test("spin-bond identity and cluster boundary detailed balance", () => {
    for (const beta of [0.01, 0.5, 3]) {
        const J = 0.8,
            p = clusterBondProbability(beta, J);
        near(Math.exp(beta * J) * (1 - p), Math.exp(-beta * J));
        near(Math.exp(beta * J) * (1 - p + p), Math.exp(beta * J));
        for (const [same, opp] of [
            [0, 3],
            [2, 2],
            [4, 1],
        ]) {
            const delta = 2 * J * (same - opp);
            near((1 - p) ** (same - opp), Math.exp(-beta * delta), 1e-7);
        }
    }
    near(clusterBondProbability(1, 0), 0);
    assert.throws(() => clusterBondProbability(1, -1));
});

test("NPT volume Jacobian, reversibility and log-volume proposal correction", () => {
    const forward = nptLogRatio(0.8, 0.2, 1, 2, 3, 4);
    const reverse = nptLogRatio(0.8, -0.2, 1, 3, 2, 4);
    near(forward + reverse, 0);
    near(nptLogRatio(0.8, 0.2, 1, 2, 3, 4, true) - forward, Math.log(3 / 2));
    near(nptLogRatio(1, 0, 0, 2, 2, 4), 0);
    assert.throws(() => nptLogRatio(1, 0, 0, 0, 2, 4));
});

test("lifted ring has invariant uniform law, violates detailed balance and is connected", () => {
    const sites = 5,
        size = 2 * sites;
    const P = Array.from({ length: size }, () => Array(size).fill(0));
    for (let x = 0; x < sites; x++)
        for (let d = 0; d < 2; d++) {
            const i = 2 * x + d,
                direction = d ? 1 : -1;
            P[i][i] += 0.1;
            P[i][2 * x + 1 - d] += 0.2;
            P[i][2 * ((x + direction + sites) % sites) + d] += 0.7;
        }
    for (let i = 0; i < size; i++)
        near(
            P[i].reduce((a, b) => a + b, 0),
            1
        );
    for (let j = 0; j < size; j++)
        near(
            P.reduce((v, row) => v + row[j] / size, 0),
            1 / size
        );
    near(P[1][3], 0.7);
    near(P[3][1], 0);
    const reached = new Set([0]);
    for (let step = 0; step < size; step++)
        for (const i of [...reached])
            P[i].forEach((p, j) => {
                if (p > 0) reached.add(j);
            });
    assert.equal(reached.size, size);
});

test("factor event rates cancel drift current, including downhill and zero derivative", () => {
    for (const a of [-4, -0.1, 0, 0.1, 4]) {
        const r = pairEventRates(0.7, a);
        near(r.reverseActivity - r.forward + 0.7 * a, 0);
    }
    for (const E of [0, 0.5, 2, 5]) {
        const ell = harmonicEventDisplacement(E, 2, 3);
        near((2 * 3 * ell * ell) / 2, E);
    }
    assert.throws(() => harmonicEventDisplacement(-1));
});

test("SPH kernel mass, compact support and symmetric unequal-mass pressure forces", () => {
    for (const h of [0.3, 0.8, 2]) {
        near(
            midpoint((x) => tentKernel(x, h), -h, h),
            1
        );
        near(tentKernel(h, h), 0);
        near(tentKernel(-2 * h, h), 0);
    }
    near(
        midpoint((x) => [-0.8, 0, 0.8].reduce((s, p) => s + tentKernel(x - p, 0.8), 0), -2, 2),
        3,
        1e-8
    );
    const fij = sphPairForce(2, 3, 1.2, 0.8, 1, 1.5, -0.4);
    const fji = sphPairForce(3, 2, 0.8, 1.2, 1.5, 1, 0.4);
    near(fij + fji, 0);
    assert.throws(() => tentKernel(0, 0));
});

test("FEP and TI agree with exact harmonic partition ratio, endpoint sign and zero difference", () => {
    for (const [a, b] of [
        [1, 4],
        [4, 1],
        [2, 2],
    ]) {
        const beta = 1.3,
            exact = harmonicFreeEnergyDifference(beta, a, b);
        const ratio = midpoint(
            (x) => gaussianDensity(x, 1 / (beta * a)) * Math.exp((-beta * (b - a) * x * x) / 2),
            -10,
            10
        );
        near(-Math.log(ratio) / beta, exact, 1e-10);
        near(
            midpoint((l) => harmonicTIIntegrand(l, beta, a, b), 0, 1),
            exact,
            2e-9
        );
        near(exact, -harmonicFreeEnergyDifference(beta, b, a));
    }
    assert.throws(() => harmonicFreeEnergyDifference(1, 0, 1));
    assert.throws(() => harmonicTIIntegrand(2, 1, 1, 2));
});

test("static umbrella reweighting recovers an enumerated target", () => {
    const beta = 0.7,
        U = [0, 1, 2, 3],
        B = [2, 0, -1, 0.4];
    const target = normalisedWeights(U.map((v) => -beta * v));
    const biased = normalisedWeights(U.map((v, i) => -beta * (v + B[i])));
    const corrected = biased.map((p, i) => p * Math.exp(beta * B[i]));
    const z = corrected.reduce((a, b) => a + b, 0);
    corrected.forEach((v, i) => near(v / z, target[i]));
});
