import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
    pipelineTime,
    cacheReadMisses,
    triangularLoads,
    relaxationErrorStep,
    scaling,
    gridStrideOwners,
    differentiateTrace,
} from "../../../src/components/scientific/modules/px457/models";
import { px457Chapter, px457Order } from "../../../src/lib/px457";

function close(actual: number, expected: number, tolerance = 1e-12) {
    assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
}

test("binary32 rounding example and exact integer encoding", () => {
    assert.equal(Math.fround(1 + 1e-8), 1);
    assert.equal(Math.fround(1 + 2 ** -23), 1 + 2 ** -23);
    const bits = new DataView(new ArrayBuffer(4));
    bits.setFloat32(0, 123456);
    assert.equal(bits.getUint32(0).toString(2).padStart(32, "0"), "01000111111100010010000000000000");
    const a = 2 ** 24,
        b = 1,
        c = -(2 ** 24);
    assert.equal(Math.fround(Math.fround(a + b) + c), 0);
    assert.equal(Math.fround(a + Math.fround(b + c)), 1);
});

test("pipeline completion includes fill/drain and handles empty work", () => {
    assert.equal(pipelineTime(0, 5, 1), 0);
    assert.equal(pipelineTime(1, 5, 1), 5);
    assert.equal(pipelineTime(4, 5, 1), 8);
    assert.equal(pipelineTime(1001, 5, 1) - pipelineTime(1000, 5, 1), 1);
    assert.throws(() => pipelineTime(-1, 5, 1), RangeError);
});

test("cache conflicts depend on address mapping and access order", () => {
    const readTrace = (n: number, b: number) => Array.from({ length: n }, (_, i) => [i, b + i]).flat();
    assert.equal(cacheReadMisses(readTrace(32, 32)), 4);
    assert.equal(cacheReadMisses(readTrace(64, 64)), 128);
    assert.equal(cacheReadMisses(readTrace(64, 80)), 8);
    assert.equal(cacheReadMisses([]), 0);
    assert.equal(cacheReadMisses([0, 15, 16, 0]), 2);
    assert.equal(cacheReadMisses([0, 64, 0]), 3);
    assert.throws(() => cacheReadMisses([1.5]), RangeError);
});

test("scheduling conserves triangular work and respects the mean-load bound", () => {
    assert.deepEqual(triangularLoads(8, 4, false), [15, 11, 7, 3]);
    assert.deepEqual(triangularLoads(8, 4, true), [12, 10, 8, 6]);
    for (const n of [0, 1, 8, 13])
        for (const p of [1, 2, 4, 20]) {
            const loads = triangularLoads(n, p, true);
            assert.equal(
                loads.reduce((a, b) => a + b, 0),
                (n * (n + 1)) / 2
            );
            assert.ok(Math.max(...loads) >= (n * (n + 1)) / (2 * p));
        }
    assert.throws(() => triangularLoads(7, 4, false), RangeError);
});

test("triangular load formulas explain the gap for arbitrary divisible work", () => {
    for (const m of [1, 2, 3, 7])
        for (const p of [1, 2, 4, 9]) {
            const n = m * p;
            const block = triangularLoads(n, p, false);
            const cyclic = triangularLoads(n, p, true);
            for (let r = 0; r < p; ++r) {
                assert.equal(block[r], m * (n - r * m) - (m * (m - 1)) / 2);
                assert.equal(cyclic[r], m * (n - r) - (p * m * (m - 1)) / 2);
            }
            assert.equal(block[0] - block[p - 1], m * m * (p - 1));
            assert.equal(cyclic[0] - cyclic[p - 1], m * (p - 1));
        }
});

test("relaxation figure, boundary dependence and several-step contraction", () => {
    const uniform = Array.from({ length: 3 }, () => [1, 1, 1]);
    assert.deepEqual(relaxationErrorStep(uniform), [
        [0.6, 0.8, 0.6],
        [0.8, 1, 0.8],
        [0.6, 0.8, 0.6],
    ]);
    assert.deepEqual(relaxationErrorStep(uniform, true), uniform);
    assert.deepEqual(uniform, [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
    ]);
    assert.deepEqual(relaxationErrorStep([[1]]), [[0.2]]);
    assert.deepEqual(relaxationErrorStep([[1]], true), [[1]]);
    const maxNorm = (field: number[][]) => Math.max(...field.flat().map(Math.abs));
    for (const m of [1, 2, 3, 4, 7]) {
        for (const signed of [false, true]) {
            let field = Array.from({ length: m }, (_, i) =>
                Array.from({ length: m }, (_, j) => (signed ? Math.sin(3 * i + 7 * j + 1) : 1))
            );
            const initial = maxNorm(field);
            for (let k = 0; k < m; ++k) {
                const next = relaxationErrorStep(field);
                assert.ok(maxNorm(next) <= maxNorm(field) + 1e-14);
                field = next;
            }
            assert.ok(maxNorm(field) <= (1 - 5 ** -m) * initial + 1e-14);
        }
    }
    assert.throws(() => relaxationErrorStep([]), RangeError);
    assert.throws(() => relaxationErrorStep([[1, 2]]), RangeError);
    assert.throws(() => relaxationErrorStep([[NaN]]), RangeError);
});

test("Amdahl boundaries, exact overhead identity and Karp–Flatt interpretation", () => {
    assert.deepEqual(scaling(0.1, 1), {
        relativeTime: 1,
        speedup: 1,
        efficiency: 1,
        processorOverhead: 0,
        karpFlatt: null,
    });
    close(scaling(0.1, 4).speedup, 40 / 13);
    close(scaling(0.1, 16).relativeTime, 0.15625);
    close(scaling(0.1, 16).speedup, 6.4);
    close(scaling(0.1, 4, 0.075).karpFlatt!, 0.2);
    for (const f of [0, 0.1, 1])
        for (const p of [2, 4, 16, 100])
            for (const k of [0, 0.05, 1]) {
                const m = scaling(f, p, k);
                close(m.efficiency, 1 / (1 + m.processorOverhead));
                close(m.karpFlatt!, f + k / (1 - 1 / p));
                assert.ok(m.speedup <= 1 / (f + (1 - f) / p) + 1e-12);
            }
    assert.equal(scaling(0, 16).efficiency, 1);
    assert.equal(scaling(1, 16).speedup, 1);
    assert.throws(() => scaling(0.1, 1, 0.2), RangeError);
});

test("grid-stride ownership is unique and complete at boundaries and partial blocks", () => {
    assert.deepEqual(gridStrideOwners(12, 4), [
        [0, 4, 8],
        [1, 5, 9],
        [2, 6, 10],
        [3, 7, 11],
    ]);
    for (const stride of [1, 4, 32, 256])
        for (const n of [0, 1, stride - 1, stride, stride + 1, 1031]) {
            const owners = gridStrideOwners(n, stride);
            const indices = owners.flat().sort((a, b) => a - b);
            assert.deepEqual(
                indices,
                Array.from({ length: n }, (_, i) => i)
            );
            assert.equal(new Set(indices).size, n);
            owners.forEach((items, t) => items.forEach((i) => assert.equal(i % stride, t)));
        }
    assert.throws(() => gridStrideOwners(1, 0), RangeError);
});

test("AD trace agrees with analytic cases, finite differences and JVP/VJP duality", () => {
    const base = differentiateTrace(2, 0, [1, 1]);
    close(base.value, Math.log(2));
    assert.deepEqual(base.gradient, [0.5, 1]);
    close(base.tangent, 1.5);
    const f = (a: number, b: number) => Math.log(a) + a * b - Math.sin(b);
    for (const [x1, x2] of [
        [0.2, -1],
        [2, 0],
        [1.5, 0.7],
        [10, 3],
    ]) {
        const d = [0.3, -0.8] as const;
        const actual = differentiateTrace(x1, x2, d);
        const h = 1e-5;
        close(actual.gradient[0], (f(x1 + h, x2) - f(x1 - h, x2)) / (2 * h), 1e-7);
        close(actual.gradient[1], (f(x1, x2 + h) - f(x1, x2 - h)) / (2 * h), 1e-7);
        close(actual.tangent, actual.gradient[0] * d[0] + actual.gradient[1] * d[1]);
    }
    assert.throws(() => differentiateTrace(0, 1, [1, 0]), RangeError);
    assert.throws(() => differentiateTrace(-1, 1, [1, 0]), RangeError);
});

test("allowlisted chapter loader rejects arbitrary paths and matches course order", async () => {
    for (const invalid of [
        "../es98a/week1",
        "../../package.json",
        "week1",
        "constructor",
        "",
        "ml1",
        "ml2",
        "ml3",
        "ml4",
        "ml5",
    ])
        assert.equal(await px457Chapter(invalid), null);
    const index = await readFile("_notes/px457.md", "utf8");
    assert.deepEqual(
        [...index.matchAll(/\]\(\/notes\/px457\/([a-z0-9-]+)\)/g)].map((m) => m[1]),
        px457Order
    );
    for (let i = 0; i < px457Order.length; i++) {
        const note = await px457Chapter(px457Order[i]);
        assert.ok(note);
        assert.equal(note.previous, px457Order[i - 1]);
        assert.equal(note.next, px457Order[i + 1]);
        assert.ok(note.source.includes("<h2 id="));
        assert.ok(!note.source.includes("\u2014"), `${note.slug}: em dash remains`);
    }
    const quotedPhrase = "history\u2014with the possible exceptions";
    assert.ok(index.includes(quotedPhrase), "preserve the user's quotation verbatim");
    assert.ok(!index.replace(quotedPhrase, "").includes("\u2014"), "contents: em dash outside supplied quotation");
});
