import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
    animationCatalogue,
    animationKinds,
} from "../../../src/components/scientific/modules/es98e/animation-catalogue";
import { animationScene } from "../../../src/components/scientific/modules/es98e/animation-scenes";
import * as m from "../../../src/components/scientific/modules/es98e/animation-math";
import { es98eTopics } from "../../../src/lib/es98e";
const close = (a: number, b: number, tolerance = 1e-9) => assert.ok(Math.abs(a - b) <= tolerance, `${a} != ${b}`);

test("every ES98E chapter contains two distinct allowlisted animation slots; the index contains none", async () => {
    for (const filename of ["_notes/es98e.md", ...es98eTopics.map((t) => `_notes/es98e/${t.slug}.md`)]) {
        const source = await readFile(filename, "utf8"),
            slots = [...source.matchAll(/^<div data-es98e-animation="([a-z-]+)" \/>$/gm)].map((x) => x[1]);
        const expected = filename === "_notes/es98e.md" ? 0 : 2;
        assert.equal(slots.length, expected, filename);
        assert.equal(new Set(slots).size, expected, filename);
        for (const kind of slots) assert.ok(animationKinds.includes(kind as (typeof animationKinds)[number]), kind);
    }
});

test("local approximation error is exactly quadratic and vanishes with curvature", () => {
    for (const s of [-1.6, -0.4, 0, 0.4, 1.6])
        for (const c of [0, 0.6, 1]) {
            const r = m.localResponse(s, c);
            close(r.exact - r.linear, c * s * s);
        }
    close(m.localResponse(0.5, 0.6).error / m.localResponse(0.25, 0.6).error, 4);
});

test("correlated uncertainty uses common draws and the exact pushforward variance", () => {
    const a = m.covarianceTransport(0.8, 2),
        b = m.covarianceTransport(-0.8, 2);
    close(a.variance, 8.2);
    close(b.variance, 1.8);
    assert.deepEqual(
        a.points.map((p) => p[0]),
        b.points.map((p) => p[0])
    );
    close(m.covarianceTransport(1, -1).variance, 0);
    for (const [i, p] of a.points.entries()) close(a.outputs[i], p[0] + 2 * p[1]);
    assert.throws(() => m.covarianceTransport(2, 1), RangeError);
});

test("concentric data are linearly separated after every positive lift", () => {
    for (const t of [0, 0.001, 0.25, 1])
        for (const point of m.circleData) {
            const [x, y, z] = m.liftPoint(point.x, point.y, t);
            close(x, point.x);
            close(y, point.y);
            close(z, t * point.radius ** 2);
            if (t > 0) assert.equal(z - 0.8 * t < 0, point.inner);
            else close(z, 0);
        }
    for (const angle of [-1, 0, 1]) {
        const [x, y] = m.project3([1, 0, 0], angle, 0);
        close(x, Math.cos(angle));
        close(y, 0);
    }
});

test("ridge solutions satisfy the penalised normal equations at degree/penalty boundaries", () => {
    for (const degree of [2, 5, 9, 10])
        for (const p of [0, 0.5, 1]) {
            const fit = m.ridgeExample(p, degree);
            fit.gram.forEach((row, i) => close(m.dot(row, fit.weights), fit.rhs[i], 1e-8));
            assert.ok(fit.mse >= 0 && fit.test >= 0);
            assert.ok(fit.weights.every(Number.isFinite));
        }
    const low = m.ridgeExample(0, 9),
        high = m.ridgeExample(1, 9);
    assert.ok(m.dot(high.weights.slice(1), high.weights.slice(1)) < m.dot(low.weights.slice(1), low.weights.slice(1)));
    assert.ok(high.mse > low.mse);
});

test("Gaussian conditioning matches analytic cases and reduces latent variance", () => {
    const grid = [-1, 0, 1],
        prior = m.gpPosterior(grid, []);
    assert.deepEqual(
        prior.map((x) => x.variance),
        [1, 1, 1]
    );
    const single = m.gpPosterior([0], [{ x: 0, y: 1, noise: 0.04 }])[0];
    close(single.mean, 1 / 1.04);
    close(single.variance, 0.04 / 1.04);
    close(m.gpPosterior([0], [{ x: 0, y: 1, noise: 0 }])[0].variance, 0);
    assert.equal(m.revealObservations(0).length, 0);
    assert.equal(m.revealObservations(1).length, 3);
    const final = m.gpPosterior(m.linspace(-2, 2), m.revealObservations(1));
    for (const d of final) assert.ok(d.variance >= 0 && d.variance <= 1);
    const before = m.gpPosterior(grid, m.revealObservations(1 / 3)),
        after = m.gpPosterior(grid, m.revealObservations(2 / 3));
    before.forEach((v, i) => assert.ok(after[i].variance <= v.variance + 1e-10));
});

test("kernel samples are deterministic and their factor reconstructs the covariance", () => {
    for (const ell of [0.18, 0.7, 1.8]) {
        const sample = m.gpSamples(ell),
            l = m.cholesky(sample.covariance);
        for (const i of [0, 10, 20, 40])
            for (const j of [0, 10, 20, 40]) close(m.dot(l[i], l[j]), sample.covariance[i][j], 1e-9);
        assert.deepEqual(sample.paths, m.gpSamples(ell).paths);
        assert.ok(sample.paths.flat().every(Number.isFinite));
    }
    assert.throws(
        () =>
            m.cholesky([
                [1, 2],
                [2, 1],
            ]),
        RangeError
    );
    assert.throws(() => m.rbfKernel(0, 1, 0), RangeError);
});

test("backpropagated derivative products match finite differences", () => {
    for (const input of [-2, -0.5, 0.5, 1.8]) {
        const h = 1e-5,
            a = m.activationChain(input);
        close(
            a.gradientTanh,
            (m.activationChain(input + h).tanh[5] - m.activationChain(input - h).tanh[5]) / (2 * h),
            1e-7
        );
        close(
            a.gradientRelu,
            (m.activationChain(input + h).relu[5] - m.activationChain(input - h).relu[5]) / (2 * h),
            1e-7
        );
    }
    close(m.activationChain(0).gradientRelu, 0);
});

test("quadratic descent respects its stability boundary and stated discrete update", () => {
    const stable = m.gradientTrajectory(0.16),
        unstable = m.gradientTrajectory(0.45);
    stable.slice(1).forEach((p, i) => {
        close(p[0], (1 - 0.16) * stable[i][0]);
        close(p[1], (1 - 5 * 0.16) * stable[i][1]);
        assert.ok(m.quadraticLoss(p) <= m.quadraticLoss(stable[i]));
    });
    assert.ok(m.quadraticLoss(unstable.at(-1)!) > m.quadraticLoss(unstable[0]));
    close(m.interpolateState(stable, 0)[0], stable[0][0]);
    close(m.interpolateState(stable, 1)[1], stable.at(-1)![1]);
});

test("spring forces are energy gradients, transform covariantly and sum to zero", () => {
    const original = m.springMolecule(m.molecule),
        h = 1e-6;
    for (const angle of [0, 0.7, Math.PI, 2 * Math.PI]) {
        const points = m.molecule.map((p) => {
                const q = m.rotate(p, angle);
                return [q[0] + 0.4, q[1] - 0.2] as m.V2;
            }),
            state = m.springMolecule(points);
        close(state.energy, original.energy);
        close(
            state.forces.reduce((s, f) => s + f[0], 0),
            0
        );
        close(
            state.forces.reduce((s, f) => s + f[1], 0),
            0
        );
        state.forces.forEach((f, i) => {
            const expected = m.rotate(original.forces[i], angle);
            close(f[0], expected[0]);
            close(f[1], expected[1]);
        });
    }
    for (let i = 0; i < 3; i++)
        for (let axis = 0; axis < 2; axis++) {
            const perturb = (delta: number) =>
                m.molecule.map(
                    (p, j) =>
                        [p[0] + (j === i && axis === 0 ? delta : 0), p[1] + (j === i && axis === 1 ? delta : 0)] as m.V2
                );
            close(
                original.forces[i][axis],
                -(m.springMolecule(perturb(h)).energy - m.springMolecule(perturb(-h)).energy) / (2 * h),
                1e-8
            );
        }
});

test("message passing travels at most one hop per layer and commutes with path reversal", () => {
    for (const [k, state] of m.messageLayers().entries()) {
        for (let j = k + 1; j < 5; j++) close(state[j], 0);
        assert.ok(state.every((x) => x >= 0 && x <= 1));
        const reversed = m.averageMessages([...state].reverse());
        assert.deepEqual(reversed, [...m.averageMessages(state)].reverse());
    }
});

test("residual descent decreases the stated loss and preserves the initial value", () => {
    for (const count of [4, 12, 24]) {
        let last = Infinity;
        for (let i = 0; i <= 40; i++) {
            const state = m.residualFit(i / 40, count);
            assert.ok(state.loss <= last);
            last = state.loss;
            close(state.trial(0), 0);
            const independent = state.xs.reduce((s, x) => s + state.residual(x) ** 2, 0) / state.xs.length;
            close(state.loss, independent);
        }
    }
});

test("ODE reference has exact decay; Euler converges and exhibits the correct instability", () => {
    for (const t of [0, 0.2, 1, 4, 8]) close(Math.hypot(...m.exactFlow(t)), Math.exp(-0.2 * t));
    const error = (step: number) => {
        const a = m.eulerAt(step, 4),
            b = m.exactFlow(4);
        return Math.hypot(a[0] - b[0], a[1] - b[1]);
    };
    assert.ok(error(0.04) < error(0.12));
    const stable = m.eulerFlow(0.12),
        unstable = m.eulerFlow(0.6);
    assert.ok(Math.hypot(...stable.at(-1)!) < 1);
    assert.ok(Math.hypot(...unstable.at(-1)!) > 1);
});

test("PCA rotates coordinates without losing the variance accounting identity", () => {
    for (const minor of [0.2, 1, 2])
        for (const angle of m.linspace(0, Math.PI, 17)) {
            const a = m.pcaRotation(angle, minor);
            let retained = 0,
                discarded = 0;
            a.points.forEach((p, i) => {
                const q = a.projection[i],
                    r: [number, number] = [p[0] - q[0], p[1] - q[1]];
                close(m.dot(r, a.axis), 0);
                retained += m.dot(q, q);
                discarded += m.dot(r, r);
            });
            close(retained / a.points.length, a.retained);
            close(discarded / a.points.length, a.discarded);
            close(a.retained + a.discarded, 3 + minor);
        }
    close(m.pcaRotation(Math.PI / 4).retained, 3);
});

test("decoder keeps latent/noise innovations fixed and separates mean from observation noise", () => {
    const linear = m.decoderPoints(0, 0),
        curved = m.decoderPoints(0.8, 0),
        noisy = m.decoderPoints(0.8, 0.1),
        twice = m.decoderPoints(0.8, 0.2);
    for (let i = 0; i < linear.length; i++) {
        close(linear[i].z, curved[i].z);
        close(curved[i].mean[1], 0.8 * (linear[i].z ** 2 - 1));
        for (let axis = 0; axis < 2; axis++)
            close(twice[i].point[axis] - curved[i].mean[axis], 2 * (noisy[i].point[axis] - curved[i].mean[axis]));
    }
});

test("Gaussian precision updates and variational ELBO gaps have analytic checks", () => {
    assert.deepEqual(m.precisionPosterior(0), { mean: 0, variance: 1 });
    assert.deepEqual(m.precisionPosterior(1), { mean: 1, variance: 0.5 });
    for (const sd of [0.5, 1.4, 2.2]) {
        const states = m.variationalSteps(sd);
        let last = Infinity;
        for (const state of states) {
            const kl = m.gaussianKL(state.mean, Math.exp(2 * state.logSD));
            assert.ok(kl >= -1e-14 && kl <= last + 1e-12);
            last = kl;
        }
        assert.ok(last < 1e-8);
    }
    close(m.gaussianKL(1, 0.5), 0);
});

test("all scene geometry and summaries remain finite at timeline/parameter boundaries", () => {
    for (const kind of animationKinds) {
        const c = animationCatalogue[kind];
        for (const parameter of [c.min, c.initial, c.max])
            for (const p of [0, 0.25, 0.5, 0.75, 1]) {
                const scene = animationScene(kind, p, parameter);
                assert.ok(scene.summary.length > 20);
                for (const shape of scene.shapes) {
                    for (const value of Object.values(shape))
                        if (typeof value === "number") assert.ok(Number.isFinite(value), `${kind} ${p}`);
                    if (shape.type === "path") assert.ok(shape.points.flat().every(Number.isFinite), kind);
                    if (shape.type === "rect") assert.ok(shape.width >= 0 && shape.height >= -1e-10, kind);
                }
            }
    }
});

test("backward pulse agrees with derivative products at every layer boundary", () => {
    const jacobians = [0.2, 0.3, 0.4];
    close(m.backwardTransport(jacobians, 3), 1);
    close(m.backwardTransport(jacobians, 2), 0.4);
    close(m.backwardTransport(jacobians, 1), 0.12);
    close(m.backwardTransport(jacobians, 0), 0.024);
    close(m.backwardTransport(jacobians, 2.5), Math.sqrt(0.4));
    close(m.backwardTransport([1, 0, 1], 0), 0);
});
