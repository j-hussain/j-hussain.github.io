import { test } from "node:test";
import assert from "node:assert/strict";
import { inverseNoise } from "../src/components/scientific/math";
import { orthogonalCoordinates } from "../src/components/scientific/projection-math";
import {
    apply2,
    transpose2,
    dot2,
    outerAction,
    fitStiffness,
    modelFamilies,
    modelValue,
    directionalSize,
    choleskyFactor,
    principalRoot,
    exampleMatrix,
    type ModelFamily,
    type Vec2,
} from "../src/components/scientific/week1-math";

const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-10, `${a} ≠ ${b}`);
test("all plotted model families are linear in parameters across the plotted domain", () => {
    for (const family of Object.keys(modelFamilies) as ModelFamily[]) {
        for (let i = 0; i <= 160; i++) {
            const x = -1 + i / 80;
            close(
                modelValue(family, x, [0.5, 1.5]),
                modelValue(family, x, [1, 0.5]) + modelValue(family, x, [-0.5, 1])
            );
            close(modelValue(family, x, [2, 1]), 2 * modelValue(family, x, [1, 0.5]));
        }
    }
    close(modelValue("Quadratic", 1, [1, 0.5]), 1.5);
    close(modelValue("Fourier", 0, [1, 0.5]), 0.5);
    close(modelValue("Fourier", 0.5, [1, 0.5]), 1);
});
test("outer product follows the course convention and discards the unmeasured coordinate", () => {
    for (const y of [-100, 0, 1, 7]) assert.deepEqual(outerAction([1, 0], [0, 2], [2, y]), [0, 4]);
    assert.deepEqual(outerAction([0, 0], [0, 2], [2, 1]), [0, 0]);
    const u: Vec2 = [1 / Math.sqrt(5), 2 / Math.sqrt(5)];
    const p = outerAction(u, u, [2, 3]);
    outerAction(u, u, p).forEach((v, i) => close(v, p[i]));
});
test("least squares has perpendicular residual and respects measurement sensitivity", () => {
    const fit = fitStiffness([1, 2], [2, 3]);
    close(fit.stiffness, 1.6);
    close(fit.loss, 0.2);
    close(dot2([1, 2], fit.residual), 0);
    for (const delta of [-10, -0.001, 0, 0.2, 3])
        close(fitStiffness([1, 2], [2, 3 + delta]).stiffness - fit.stiffness, (2 * delta) / 5);
    assert.throws(() => fitStiffness([0, 0], [2, 3]), RangeError);
});
test("adjoint transfers the measurement, not an inverse transformation", () => {
    const a = [
        [1, 1],
        [0, 1],
    ] as const;
    for (const x of [
        [1, 2],
        [0, 0],
        [-1, 4],
    ] as const)
        for (const y of [
            [2, 1],
            [3, -2],
            [0, 0],
        ] as const)
            close(dot2(apply2(a, x), y), dot2(x, apply2(transpose2(a), y)));
    close(dot2(apply2(a, [1, 2]), [2, 1]), 8);
    assert.deepEqual(apply2(transpose2(a), [2, 1]), [2, 3]);
});
test("directional quadratic forms have the stated extrema and classifications", () => {
    for (const lambda of [-1, 0, 1]) {
        close(directionalSize(lambda, 0), 2);
        close(directionalSize(lambda, Math.PI / 2), lambda);
        for (let i = 0; i <= 100; i++) {
            const angle = (i * Math.PI) / 100;
            const q = directionalSize(lambda, angle);
            assert.ok(q >= lambda - 1e-12 && q <= 2 + 1e-12);
            const x: Vec2 = [Math.cos(angle), Math.sin(angle)];
            close(
                q,
                dot2(
                    apply2(
                        [
                            [2, 0],
                            [0, lambda],
                        ],
                        x
                    ),
                    x
                )
            );
        }
    }
});
test("Cholesky and principal square root reproduce A by different paired operations", () => {
    for (const x of [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
        [-2, 3],
    ] as const) {
        const expected = apply2(exampleMatrix, x);
        const paired = apply2(choleskyFactor, apply2(transpose2(choleskyFactor), x));
        const rooted = apply2(principalRoot, apply2(principalRoot, x));
        paired.forEach((v, i) => close(v, expected[i]));
        rooted.forEach((v, i) => close(v, expected[i]));
        close(dot2(expected, x), dot2(apply2(transpose2(choleskyFactor), x), apply2(transpose2(choleskyFactor), x)));
    }
    assert.ok(Math.abs(apply2(choleskyFactor, apply2(choleskyFactor, [1, 0]))[1] - 1) > 0.1);
});
test("rotated ONB preserves reconstruction, orthogonality and Parseval", () => {
    for (const x of [
        [2, 1],
        [2, 3],
        [0, 0],
        [-1, 4],
    ] as const)
        for (let angle = -180; angle <= 180; angle += 3) {
            const r = orthogonalCoordinates(x, angle);
            close(r.u[0] * r.v[0] + r.u[1] * r.v[1], 0);
            close(Math.hypot(...r.u), 1);
            close(Math.hypot(...r.v), 1);
            close(r.projection[0] + r.residual[0], x[0]);
            close(r.projection[1] + r.residual[1], x[1]);
            close(r.projection[0] * r.residual[0] + r.projection[1] * r.residual[1], 0);
            close(r.energy, x[0] ** 2 + x[1] ** 2);
        }
});
test("calibration projection reproduces analytic least-squares solution", () => {
    const r = orthogonalCoordinates([2, 3], (Math.atan2(2, 1) * 180) / Math.PI);
    close(r.projection[0], 1.6);
    close(r.projection[1], 3.2);
    close(r.residual[0], 0.4);
    close(r.residual[1], -0.2);
    close(r.residual[0] ** 2 + r.residual[1] ** 2, 0.2);
    for (const e of [-2, 0, 1.5, 1.6, 1.75, 4]) close((2 - e) ** 2 + (3 - 2 * e) ** 2, 5 * (e - 1.6) ** 2 + 0.2);
});
test("projection rejects nonfinite inputs", () => {
    assert.throws(() => orthogonalCoordinates([NaN, 1], 0), RangeError);
    assert.throws(() => orthogonalCoordinates([2, 1], Infinity), RangeError);
});
test("fixed noise norm, inverse identity and spectral bound across the control domain", () => {
    for (const sigma of [0.05, 0.2, 0.5, 1])
        for (let angle = 0; angle <= 360; angle += 3) {
            const r = inverseNoise(sigma, angle);
            close(Math.hypot(...r.noise), 0.1);
            close(r.error[0], r.noise[0]);
            close(sigma * r.error[1], r.noise[1]);
            assert.ok(r.norm <= r.bound + 1e-12);
        }
});
test("analytic axis cases and isotropic boundary", () => {
    close(inverseNoise(0.2, 0).norm, 0.1);
    close(inverseNoise(0.2, 90).norm, 0.5);
    close(inverseNoise(0.05, 90).norm, 2);
    for (const angle of [0, 35, 90, 180, 270]) close(inverseNoise(1, angle).norm, 0.1);
});
test("singular pseudoinverse drops the null mode rather than dividing by zero", () => {
    const r = inverseNoise(0, 90);
    close(r.norm, 0);
    assert.ok(Number.isFinite(r.bound));
    close(inverseNoise(0, 0).norm, 0.1);
});
test("invalid parameters fail explicitly", () => {
    for (const sigma of [-1, 1.01, NaN, Infinity]) assert.throws(() => inverseNoise(sigma, 0), RangeError);
    assert.throws(() => inverseNoise(1, Infinity), RangeError);
    assert.throws(() => inverseNoise(1, 0, -0.1), RangeError);
});
