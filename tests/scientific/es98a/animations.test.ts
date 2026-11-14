import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
    animationKinds,
    animationInfo,
    scene,
    progress,
    gaussianConditional,
    mcTrace,
    mhTrace,
    inverseProblem,
    filter,
    kernel,
    gpPosterior,
    softThreshold,
    svgPoint,
} from "../../../src/components/scientific/modules/es98a/animation-math";
const close = (a: number, b: number, tol = 1e-10) => assert.ok(Math.abs(a - b) < tol, `${a} != ${b}`);

test("twenty models have finite, bounded geometry across their full animation domains", () => {
    for (const kind of animationKinds)
        for (let j = 0; j <= 40; j++) {
            const model = scene(kind, j / 40);
            assert.ok(model.formula && model.summary && animationInfo[kind].caption);
            for (const panel of model.panels) {
                assert.ok(panel.x[1] > panel.x[0] && panel.y[1] > panel.y[0]);
                for (const point of [
                    ...panel.curves.flatMap((c) => c.points),
                    ...(panel.dots || []).map((d) => d.at),
                ]) {
                    assert.ok(point.every(Number.isFinite), kind);
                    assert.ok(point[0] >= panel.x[0] - 1e-8 && point[0] <= panel.x[1] + 1e-8, `${kind}: x ${point}`);
                    assert.ok(point[1] >= panel.y[0] - 1e-8 && point[1] <= panel.y[1] + 1e-8, `${kind}: y ${point}`);
                }
            }
        }
});
test("each chapter contains exactly two distinct registered module animations", () => {
    const all: string[] = [];
    for (let week = 1; week <= 10; week++) {
        const source = readFileSync(`_notes/es98a/week${week}.md`, "utf8");
        const matches = [...source.matchAll(/^<ES98AAnimation kind="([a-z-]+)" \/>$/gm)].map((m) => m[1]);
        assert.equal(matches.length, 2);
        assert.equal(new Set(matches).size, 2);
        for (const kind of matches) assert.ok(animationKinds.includes(kind as (typeof animationKinds)[number]));
        assert.ok(!source.includes("—"));
        all.push(...matches);
    }
    assert.equal(new Set(all).size, 20);
});
test("feature lift preserves horizontal coordinates and separates the two radius classes", () => {
    const original = scene("feature-lift", 0).panels[0].dots!;
    const lifted = scene("feature-lift", 1).panels[1].dots!;
    original.forEach((dot, i) => {
        const [x, y] = dot.at,
            r2 = x * x + y * y;
        close(lifted[i].at[0], x - 0.5 * y);
        close(lifted[i].at[1], 0.32 * y + 0.8 * r2);
        assert.ok(dot.hollow ? r2 > 1 : r2 < 1);
    });
});
test("geometric views use equal lengths for both coordinate directions", () => {
    for (const kind of ["svd-flow", "inverse-noise", "gaussian-shape"] as const) {
        for (const panel of scene(kind, 0.5).panels) {
            const origin = svgPoint([0, 0], panel),
                x = svgPoint([1, 0], panel),
                y = svgPoint([0, 1], panel);
            close(x[0] - origin[0], origin[1] - y[1]);
        }
    }
});
test("least-squares endpoint is the exact perpendicular projection", () => {
    const p = scene("projection-fit", 1).panels[0].dots![1].at;
    close(p[0], 1.6);
    close(p[1], 3.2);
    close(2 - p[0] + 2 * (3 - p[1]), 0);
    close((2 - p[0]) ** 2 + (3 - p[1]) ** 2, 0.2);
});
test("SVD sequence endpoint applies the stated rotation-scale-rotation map", () => {
    const curve = scene("svd-flow", 1).panels[1].curves[0];
    const a = (25 * Math.PI) / 180,
        b = (35 * Math.PI) / 180;
    close(curve.points[0][0], 1.4 * Math.cos(a) * Math.cos(b) + 0.5 * Math.sin(a) * Math.sin(b));
    close(curve.points[0][1], 1.4 * Math.cos(a) * Math.sin(b) - 0.5 * Math.sin(a) * Math.cos(b));
});
test("Gaussian conditional law and narrow-spike energy match analytic cases", () => {
    const conditional = gaussianConditional(0.8, 2);
    close(conditional.mean, 1.6);
    close(conditional.variance, 0.36);
    for (const t of [0, 0.2, 0.7, 1]) {
        const p = scene("narrow-spike", t).panels[0].curves[0].points;
        const h = p[2][0];
        close(p[1][1], 1);
        close(scene("narrow-spike", t).panels[1].dots![0].at[1], (2 * h) / 3);
    }
});
test("sampling is reproducible and rejected MH proposals repeat the previous state", () => {
    assert.deepEqual(mcTrace(), mcTrace());
    assert.deepEqual(mhTrace(), mhTrace());
    const trace = mcTrace();
    let sum = 0;
    trace.forEach((step, i) => {
        assert.ok(step.x > 0 && step.x < 1);
        sum += step.x ** 2;
        close(step.estimate, sum / (i + 1));
    });
    const mh = mhTrace();
    assert.ok(mh.some((d) => d.accept) && mh.some((d) => !d.accept));
    let previous = -2;
    for (const step of mh) {
        close(step.x, step.accept ? step.proposal : previous);
        previous = step.x;
    }
});
test("Tikhonov bias and propagated noise add to the reconstruction error", () => {
    for (const alpha of [1, 0.1, 0.01, 0.0001]) {
        const p = inverseProblem(alpha);
        close(Math.hypot(...p.noise), 0.04);
        p.estimate.forEach((u, i) => close(u - p.truth[i], p.bias[i] + p.propagated[i]));
        for (let j = 0; j <= 100; j++) assert.ok(filter(j / 100, alpha) <= 1 / (2 * Math.sqrt(alpha)) + 1e-12);
        close(filter(Math.sqrt(alpha), alpha), 1 / (2 * Math.sqrt(alpha)));
    }
    close(softThreshold(0.7, 0.7), 0);
    close(softThreshold(-2, 0.7), -1.3);
    close(softThreshold(2, 3), 0);
});
function solve(matrix: number[][], rhs: number[]) {
    const a = matrix.map((row, i) => [...row, rhs[i]]);
    for (let k = 0; k < a.length; k++) {
        const d = a[k][k];
        for (let j = k; j <= a.length; j++) a[k][j] /= d;
        for (let i = 0; i < a.length; i++)
            if (i !== k) {
                const v = a[i][k];
                for (let j = k; j <= a.length; j++) a[i][j] -= v * a[k][j];
            }
    }
    return a.map((row) => row[a.length]);
}
test("sequential GP conditioning equals an independent full Gram solve", () => {
    const sites = [-1.2, 0, 1.2],
        values = [0.8, -0.7, 1.1];
    const gram = sites.map((x, i) => sites.map((z, j) => kernel(x, z) + (i === j ? 0.09 : 0)));
    const weights = solve(gram, values);
    for (const x of [-2, -1.2, 0, 0.7, 1.2, 2]) {
        const cross = sites.map((z) => kernel(x, z)),
            varianceWeights = solve(gram, cross);
        const actual = gpPosterior(x, x, 1);
        close(
            actual.mean,
            cross.reduce((s, v, i) => s + v * weights[i], 0)
        );
        close(actual.variance, 1 - cross.reduce((s, v, i) => s + v * varianceWeights[i], 0));
        close(gpPosterior(x, x, 0).mean, 0);
        close(gpPosterior(x, x, 0).variance, 1);
        let previous = 1;
        for (let i = 0; i <= 30; i++) {
            const v = gpPosterior(x, x, i / 30).variance;
            assert.ok(v <= previous + 1e-12 && v >= 0);
            previous = v;
        }
    }
});
test("GP first observation, covariance symmetry and positive 2-point minors", () => {
    const x = 0.3,
        z = -0.7,
        first = gpPosterior(x, x, 1 / 3);
    close(first.mean, (0.8 * kernel(x, -1.2)) / 1.09);
    close(first.variance, 1 - kernel(x, -1.2) ** 2 / 1.09);
    for (const t of [0, 0.1, 0.3333333333, 0.7, 1]) {
        const p = gpPosterior(x, z, t);
        close(p.covariance, gpPosterior(z, x, t).covariance);
        assert.ok(p.covariance ** 2 <= gpPosterior(x, x, t).variance * gpPosterior(z, z, t).variance + 1e-12);
    }
});
test("progress rejects nonfinite values and clamps finite endpoints", () => {
    assert.throws(() => progress(NaN));
    assert.throws(() => progress(Infinity));
    close(progress(-1), 0);
    close(progress(2), 1);
});
