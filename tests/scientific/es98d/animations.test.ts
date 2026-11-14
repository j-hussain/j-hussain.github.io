import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
    buildMotion,
    cubicKernel,
    cubicKernelGradient,
    doubleWell,
    growWolff,
    inverseCDF,
    mixtureCDF,
    mixtureDensity,
    motionFrame,
    normalDraw,
    ouStep,
    periodicIsingEnergy,
    periodicNeighbours,
    seededRandom,
    thermalPopulation,
    valleyFreeEnergy,
    verletStep,
    widthOfValley,
} from "../../../src/components/scientific/modules/es98d/animation-math";
import { motionCatalog, motionPlacements } from "../../../src/components/scientific/modules/es98d/animation-catalog";
import { es98dTopics } from "../../../src/lib/es98d";
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) < tol, `${a} != ${b}`);
function integral(fn: (x: number) => number, lo: number, hi: number, n = 20000) {
    const h = (hi - lo) / n;
    let s = 0;
    for (let i = 0; i < n; i++) s += fn(lo + (i + 0.5) * h);
    return s * h;
}

test("all 18 animations have finite deterministic snapshots at initial and boundary controls", () => {
    for (const spec of Object.values(motionCatalog))
        for (const value of [spec.min, spec.initial, spec.max]) {
            const data = buildMotion(spec.kind, value);
            assert.equal(data.frames.length, 121, spec.kind);
            for (const frame of data.frames) {
                for (const [name, n] of Object.entries(frame.metrics))
                    assert.ok(Number.isFinite(n), `${spec.kind}:${name}:${value}`);
                for (const points of Object.values(frame.layers))
                    for (const point of points) assert.ok(point.every(Number.isFinite), spec.kind);
            }
            for (const p of [0, 0.23, 0.5, 1])
                assert.ok(Object.values(motionFrame(data, p).metrics).every(Number.isFinite));
        }
    assert.deepEqual(buildMotion("metropolis", 2), buildMotion("metropolis", 2));
});

test("every chapter has two ordered whole-section insertion anchors and no em dashes in new copy", async () => {
    const seen = new Set<string>();
    for (const topic of es98dTopics) {
        const slots = motionPlacements[topic];
        assert.equal(slots.length, 2);
        const source = await readFile(`_notes/es98d/${topic}.md`, "utf8");
        let last = -1;
        for (const slot of slots) {
            const at = source.indexOf(`<h2 id="${slot.before}">`);
            assert.ok(at > last);
            last = at;
            assert.ok(!seen.has(slot.kind));
            seen.add(slot.kind);
        }
    }
    assert.equal(seen.size, 18);
    for (const spec of Object.values(motionCatalog))
        assert.ok(!Object.values(spec).some((v) => String(v).includes("—")));
});

test("thermal relaxation preserves probability and approaches the fourfold Gibbs level law", () => {
    for (const beta of [0.3, 1.4, 3]) {
        const p = thermalPopulation(beta, 1000),
            weight = 4 * Math.exp(-beta);
        near(p.equilibrium, weight / (1 + weight));
        near(p.excited, p.equilibrium);
        near(p.upFlux, p.downFlux);
        near(thermalPopulation(beta, 0).excited, 1);
        for (const t of [0, 1, 10]) {
            const dt = 1e-5,
                a = thermalPopulation(beta, t),
                b = thermalPopulation(beta, t + dt);
            near((b.excited - a.excited) / dt, a.upFlux - a.downFlux, 1e-5);
        }
    }
});

test("both phase ensembles conserve every orbit energy with common scales", () => {
    const d = buildMotion("phase", 1.2);
    for (let i = 0; i < 40; i++)
        for (const f of d.frames) {
            const [x, p] = f.layers.microcanonical[i];
            near((x * x + p * p) / 2, 1 / 1.2);
            const first = d.frames[0].layers.canonical[i],
                point = f.layers.canonical[i];
            near(point[0] ** 2 + point[1] ** 2, first[0] ** 2 + first[1] ** 2);
        }
});

test("OU transition has the exact conditional mean and innovation variance", () => {
    const x = 1.3,
        T = 0.7,
        dt = 0.075,
        a = Math.exp(-dt),
        sigma = Math.sqrt(T * (1 - a * a));
    near(ouStep(x, T, dt, 0), a * x);
    near(ouStep(x, T, dt, 1) - ouStep(x, T, dt, -1), 2 * sigma);
    near(a * a * T + sigma * sigma, T);
});

test("Verlet is reversible and preserves its harmonic modified quadratic energy", () => {
    for (const dt of [0.1, 0.5, 1.8]) {
        let x = 0.6,
            v = 0.8;
        const initial = (v * v + (1 - (dt * dt) / 4) * x * x) / 2;
        for (let i = 0; i < 120; i++) {
            [x, v] = verletStep(x, v, dt);
            near((v * v + (1 - (dt * dt) / 4) * x * x) / 2, initial);
        }
        const [a, b] = verletStep(0.6, 0.8, dt),
            [c, d] = verletStep(a, -b, dt);
        near(c, 0.6);
        near(d, -0.8);
    }
});

test("Metropolis records rejections and uses the actual proposal energy difference", () => {
    const data = buildMotion("metropolis", 2);
    let rejected = 0;
    for (const { metrics: m, layers: L } of data.frames) {
        near(m.delta, doubleWell(m.proposal) - doubleWell(m.before));
        near(m.alpha, Math.min(1, Math.exp(-2 * m.delta)));
        near(L.proposal[1][1], doubleWell(m.proposal));
        if (!m.accepted) {
            near(m.x, m.before);
            rejected++;
        }
    }
    assert.ok(rejected > 10);
});

test("importance transport inverts a normalised mixture and becomes zero variance at p=f", () => {
    for (const mix of [0, 0.5, 1]) {
        near(
            integral((x) => mixtureDensity(x, mix), 0, 1),
            1,
            3e-9
        );
        for (const u of [0.001, 0.2, 0.5, 0.9, 0.999])
            near(
                mixtureCDF(
                    inverseCDF((x) => mixtureCDF(x, mix), u),
                    mix
                ),
                u
            );
    }
    for (const f of buildMotion("importance", 1).frames) {
        near(f.metrics.weight, 1);
        near(f.metrics.estimate, 1);
    }
});

test("AR snapshots start at stationarity and use known finite covariance of the Gaussian mean", () => {
    const a = 0.8,
        data = buildMotion("memory", a);
    for (const i of [0, 1, 10, 120]) {
        const M = i + 1;
        let cov = 0;
        for (let j = 0; j < M; j++) for (let k = 0; k < M; k++) cov += a ** Math.abs(j - k);
        near(data.frames[i].metrics.sd ** 2, cov / (M * M));
    }
    near(buildMotion("memory", 0).frames[120].metrics.sd, 1 / Math.sqrt(121));
});

test("3D shell counts use spherical volume, keep all points and select only members", () => {
    for (const f of buildMotion("shells", 0.16).frames) {
        near(f.metrics.volume, ((4 * Math.PI) / 3) * ((f.metrics.r + 0.16) ** 3 - f.metrics.r ** 3));
        near(f.metrics.g, f.metrics.count / (f.metrics.density * f.metrics.volume));
        assert.equal(f.layers.particles.length, 180);
        assert.equal(f.layers.selected.length, f.metrics.count);
    }
});

test("periodic Ising local energy change agrees with recomputation and Wolff only flips a connected same-sign cluster", () => {
    const size = 4,
        spins = Array.from({ length: 16 }, (_, i) => (i % 3 ? 1 : -1));
    for (let i = 0; i < 16; i++) {
        const copy = [...spins];
        copy[i] *= -1;
        near(
            periodicIsingEnergy(copy, size) - periodicIsingEnergy(spins, size),
            2 * spins[i] * periodicNeighbours(i, size).reduce((s, j) => s + spins[j], 0)
        );
    }
    const cluster = growWolff(spins, size, 0.45, seededRandom(12), 1);
    assert.equal(new Set(cluster.active).size, cluster.active.length);
    for (const i of cluster.active) assert.equal(spins[i], spins[1]);
    assert.equal(cluster.bonds.length, cluster.active.length - 1);
    for (const [i, j] of cluster.bonds) assert.ok(periodicNeighbours(i, size).includes(j));
    for (const f of buildMotion("ising", 0.45).frames) {
        assert.ok(f.spins!.every((s) => Math.abs(s) === 1));
        assert.ok(f.secondSpins!.every((s) => Math.abs(s) === 1));
    }
});

test("lifted ring kernel remains doubly stochastic through refresh control range", () => {
    const N = 8;
    for (const r of [0.05, 0.1, 0.6]) {
        const P = Array.from({ length: 2 * N }, () => Array(2 * N).fill(0));
        for (let x = 0; x < N; x++)
            for (let d = 0; d < 2; d++) {
                const i = 2 * x + d;
                P[i][i] += 0.1;
                P[i][2 * x + 1 - d] += r;
                P[i][2 * ((x + (d ? 1 : -1) + N) % N) + d] += 0.9 - r;
            }
        for (let j = 0; j < 2 * N; j++) {
            near(
                P[j].reduce((a, b) => a + b, 0),
                1
            );
            near(
                P.reduce((a, row) => a + row[j], 0),
                1
            );
        }
    }
});

test("pair flights accumulate only positive variation, transfer activity, and hit the specified threshold", () => {
    for (const E of [0.15, 0.5, 1.5]) {
        const data = buildMotion("hazard", E);
        let active = -1,
            changes = 0;
        for (const f of data.frames) {
            const m = f.metrics;
            near(m.energy, (m.i - m.j) ** 2 / 2);
            assert.ok(m.hazard >= 0 && m.hazard <= E + 1e-9);
            if (active !== m.active) {
                changes++;
                active = m.active;
            }
        }
        assert.ok(changes >= 3);
        near(data.frames[20].metrics.hazard, 0); // First event at ℓ=√(2E), then resets.
        const down = data.frames[25];
        near(down.metrics.hazard, 0);
    }
});

test("moving cubic kernels preserve mass and the gradient matches independent finite differences", () => {
    for (const h of [0.2, 0.4, 0.7]) {
        near(
            integral((x) => cubicKernel(x, h), -2 * h, 2 * h),
            1,
            1e-8
        );
        for (const x of [-1.5 * h, -0.5 * h, 0.2 * h, 1.8 * h]) {
            const dx = 1e-6;
            near(cubicKernelGradient(x, h), (cubicKernel(x + dx, h) - cubicKernel(x - dx, h)) / (2 * dx), 1e-7);
        }
        near(cubicKernel(2 * h, h), 0);
        for (const n of [0, 60, 120]) {
            const particles = buildMotion("kernels", h).frames[n].layers.particles;
            near(
                integral((x) => particles.reduce((s, p) => s + cubicKernel(x - p[0], h), 0), -3, 3),
                5,
                1e-6
            );
        }
    }
});

test("SPH pressure pair conserves force while mass changes acceleration", () => {
    for (const f of buildMotion("pressure", 1.5).frames) {
        near(f.metrics.forceI + f.metrics.forceJ, 0);
        near(f.metrics.accelerationI + 1.5 * f.metrics.accelerationJ, 0);
    }
});

test("hidden Gaussian coordinate produces the exact width-dependent free energy", () => {
    const T = 0.8;
    for (const x of [-1.5, -1, 0, 1, 1.5]) {
        const w = widthOfValley(x),
            Z = integral((y) => Math.exp(-(doubleWell(x) + (y * y) / (2 * w * w)) / T), -12 * w, 12 * w);
        near(-T * Math.log(Z), valleyFreeEnergy(x, T) - T * Math.log(Math.sqrt(2 * Math.PI * T)), 1e-8);
    }
    assert.ok(valleyFreeEnergy(1, T) < valleyFreeEnergy(-1, T));
});

test("umbrella quadrature reweighting restores the target for every centre and stiffness endpoint", () => {
    for (const stiffness of [0.5, 3, 6]) {
        const data = buildMotion("umbrella", stiffness);
        for (const f of data.frames)
            for (let i = 0; i < data.curves.target.length; i++)
                near(f.layers.corrected[i][1], data.curves.target[i][1], 1e-10);
    }
});

test("seeded normal innovations are reproducible and finite", () => {
    const a = seededRandom(12),
        b = seededRandom(12);
    for (let i = 0; i < 100; i++) near(normalDraw(a), normalDraw(b));
});

test("intermediate analytic display frames preserve phase energy and linked spin/force equations", () => {
    const phase = buildMotion("phase", 1.2),
        spins = buildMotion("spins", 0.7),
        forces = buildMotion("forces", 1.3);
    for (const progress of [0.1234, 0.4567, 0.8765]) {
        const f = motionFrame(phase, progress);
        for (const [x, p] of f.layers.microcanonical) near((x * x + p * p) / 2, 1 / 1.2);
        const s = motionFrame(spins, progress);
        near(s.metrics.energy, -0.7 * Math.cos(s.metrics.theta));
        near(s.metrics.torque, -0.7 * Math.sin(s.metrics.theta));
        const force = motionFrame(forces, progress);
        const r = force.metrics.r,
            q = (1 / r) ** 6;
        near(force.metrics.energy, 4 * 1.3 * (q * q - q));
    }
});
