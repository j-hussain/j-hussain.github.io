import assert from "node:assert/strict";
import test from "node:test";
import {
    activation,
    correlatedVariance,
    gpOneObservation,
    graphAggregate,
    normalDensity,
    normalKL,
    normalPosterior,
    odeExample,
    pcaExample,
} from "../../../src/components/scientific/modules/es98e/math";
const close = (a: number, b: number, tolerance = 1e-10) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);

test("correlated propagation includes reinforcement, cancellation and singular boundaries", () => {
    close(correlatedVariance([1, 2], 0.8), 8.2);
    close(correlatedVariance([1, 2], -0.8), 1.8);
    close(correlatedVariance([1, -1], 1), 0);
    close(correlatedVariance([1, 1], -1), 0);
    assert.throws(() => correlatedVariance([1, 2], 1.01), RangeError);
});

test("one-observation GP matches conditioning and prior reversion", () => {
    const exact = gpOneObservation(0, 1, 0);
    close(exact.mean, 1);
    close(exact.variance, 0);
    close(gpOneObservation(0, 1).variance, 0.04 / 1.04);
    for (const ell of [0.01, 0.35, 1.2, 100])
        for (const x of [-30, -3, 0, 0.5, 3, 30]) {
            const gp = gpOneObservation(x, ell);
            assert.ok(gp.variance >= 0 && gp.variance <= 1);
            close(gp.mean, gpOneObservation(-x, ell).mean);
            close(gp.mean, gp.covariance / 1.04);
        }
    close(gpOneObservation(100, 0.35).mean, 0);
    close(gpOneObservation(100, 0.35).variance, 1);
    assert.ok(gpOneObservation(1, 0.35).variance > gpOneObservation(1, 1.2).variance);
    assert.throws(() => gpOneObservation(1, 0), RangeError);
    assert.throws(() => gpOneObservation(1, 1, -1), RangeError);
});

test("activation derivatives agree with finite differences away from the ReLU kink", () => {
    for (const x of [-3, -1, 0.4, 2]) {
        const h = 1e-5;
        close((activation(x + h).tanh - activation(x - h).tanh) / (2 * h), activation(x).tanhDerivative, 1e-8);
        close((activation(x + h).relu - activation(x - h).relu) / (2 * h), activation(x).reluDerivative!, 1e-8);
    }
    assert.equal(activation(0).reluDerivative, null);
});

test("ODE reference satisfies initial condition and equation; trial residual matches independent derivative", () => {
    close(odeExample(0).exact, 0);
    close(odeExample(0).trial, 0);
    for (let i = 0; i <= 60; i++) {
        const x = i / 10,
            value = odeExample(x),
            h = 1e-5;
        close(value.exactDerivative + value.exact / 5 - Math.exp(-x / 5) * Math.cos(x), 0);
        const derivative = (odeExample(x + h).trial - odeExample(x - h).trial) / (2 * h);
        close(derivative + value.trial / 5 - Math.exp(-x / 5) * Math.cos(x), value.residual, 1e-8);
        assert.ok(Math.abs(value.trial - value.exact) <= 0.05 + 1e-12);
    }
});

test("PCA cloud has claimed covariance, perpendicular residuals and exact reconstruction loss", () => {
    const cloud = pcaExample(),
        n = cloud.length;
    close(cloud.reduce((s, p) => s + p.point[0], 0) / n, 0);
    close(cloud.reduce((s, p) => s + p.point[1], 0) / n, 0);
    close(cloud.reduce((s, p) => s + p.point[0] ** 2, 0) / n, 2);
    close(cloud.reduce((s, p) => s + p.point[1] ** 2, 0) / n, 2);
    close(cloud.reduce((s, p) => s + p.point[0] * p.point[1], 0) / n, 1);
    let residual = 0,
        retained = 0;
    for (const { point, projection } of cloud) {
        const r = point.map((v, i) => v - projection[i]);
        close(r[0] + r[1], 0);
        residual += r[0] ** 2 + r[1] ** 2;
        retained += projection[0] ** 2 + projection[1] ** 2;
    }
    close(residual / n, 1);
    close(retained / n, 3);
});

test("message passing commutes with all six relabellings, including asymmetric graph convention", () => {
    const features = [1, 2, 4],
        adjacency = [
            [0, 1, 0],
            [1, 0, 1],
            [0, 1, 0],
        ];
    assert.deepEqual(graphAggregate(features, adjacency), [3, 7, 6]);
    for (const a of [
        adjacency,
        [
            [0, 1, 0],
            [0, 0, 1],
            [0, 0, 0],
        ],
    ]) {
        const out = graphAggregate(features, a);
        for (const p of [
            [0, 1, 2],
            [0, 2, 1],
            [1, 0, 2],
            [1, 2, 0],
            [2, 0, 1],
            [2, 1, 0],
        ]) {
            const relabelled = graphAggregate(
                p.map((i) => features[i]),
                p.map((i) => p.map((j) => a[i][j]))
            );
            assert.deepEqual(
                relabelled,
                p.map((i) => out[i])
            );
        }
    }
    assert.throws(() => graphAggregate([1], [[1, 2]]), RangeError);
});

test("normal posterior and ELBO gap match independent Gaussian identities", () => {
    const post = normalPosterior(0, 1, [2], 1);
    close(post.mean, 1);
    close(post.variance, 0.5);
    const empty = normalPosterior(3, 2, [], 1);
    close(empty.mean, 3);
    close(empty.variance, 2);
    assert.ok(normalPosterior(0, 1, [2, 2], 1).variance < post.variance);
    close(normalKL(1, 0.5, 1, 0.5), 0);
    close(normalKL(2, 0.5, 1, 0.5), 1);
    for (const variance of [0.01, 0.5, 1, 10]) assert.ok(normalKL(0, variance, 1, 0.5) > 0);
    const dx = 0.002;
    let total = 0;
    for (let x = -8; x <= 10; x += dx) {
        const joint = normalDensity(x, 0, 1) * normalDensity(2, x, 1);
        const evidence = normalDensity(2, 0, 2);
        close(joint / evidence, normalDensity(x, post.mean, post.variance));
        total += normalDensity(x, post.mean, post.variance) * dx;
    }
    close(total, 1, 1e-9);
    assert.throws(() => normalPosterior(0, 0, [2], 1), RangeError);
    assert.throws(() => normalKL(0, -1, 0, 1), RangeError);
});

test("non-finite inputs are rejected", () => {
    assert.throws(() => activation(NaN), RangeError);
    assert.throws(() => odeExample(Infinity), RangeError);
    assert.throws(() => gpOneObservation(NaN, 1), RangeError);
    assert.throws(() => normalPosterior(0, 1, [Infinity], 1), RangeError);
});
