import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
    animationCatalog,
    animationIds,
    type AnimationId,
} from "../../../src/components/scientific/modules/px457/animation-catalog";
import { animationFrame } from "../../../src/components/scientific/modules/px457/animation-frames";
import {
    roundingState,
    instructionStarts,
    cacheTrace,
    traversalIndices,
    triangularSchedule,
    dynamicSchedule,
    reductionLevels,
    relaxationStates,
    broadcastEdges,
    worldAtCart,
    memorySegments,
    adState,
} from "../../../src/components/scientific/modules/px457/animation-math";
import { px457Order } from "../../../src/lib/px457";

const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-11, `${a} != ${b}`);
test("thirty authored scenes, exactly two per chapter and none on contents", async () => {
    assert.equal(animationIds.length, 30);
    const seen: string[] = [];
    for (const slug of px457Order) {
        const source = await readFile(`_notes/px457/${slug}.md`, "utf8");
        const ids = [...source.matchAll(/<PX457Animation scene="([a-z]+)"\s*\/>/g)].map((m) => m[1]);
        assert.equal(ids.length, 2, slug);
        seen.push(...ids);
        for (const id of ids) assert.equal(animationCatalog[id as AnimationId].chapter, slug);
    }
    assert.deepEqual([...seen].sort(), [...animationIds].sort());
    const index = await readFile("_notes/px457.md", "utf8");
    assert.equal([...index.matchAll(/<PX457Animation /g)].length, 0);
    const gallery = await readFile("docs/scientific-publishing/modules/px457/animations-gallery.mdx", "utf8");
    assert.deepEqual([...gallery.matchAll(/scene="([a-z]+)"/g)].map((m) => m[1]).sort(), [...animationIds].sort());
});
test("every scene has deterministic finite in-bounds geometry in both comparisons", () => {
    for (const id of animationIds)
        for (const comparison of [0, 1])
            for (const progress of [0, 0.01, 0.125, 0.33, 0.5, 0.75, 0.999, 1]) {
                const f = animationFrame(id, progress, comparison);
                assert.deepEqual(f, animationFrame(id, progress, comparison));
                assert.ok(f.summary && f.equation, `${id}: missing explanation`);
                assert.ok(
                    f.marks.some((m) => m.tag === "text") &&
                        f.marks.some((m) => m.tag === "rect" || m.tag === "circle"),
                    `${id}: empty diagram`
                );
                for (const m of f.marks) {
                    for (const value of Object.values(m.attrs))
                        if (typeof value === "number") assert.ok(Number.isFinite(value), `${id}: nonfinite geometry`);
                    if (m.tag === "path") assert.ok(!/NaN|Infinity|undefined/.test(String(m.attrs.d)), id);
                    if (m.tag === "rect") {
                        const { x, y, width, height } = m.attrs as Record<string, number>;
                        assert.ok(
                            x >= -1 && y >= -1 && x + width <= 361 && y + height <= f.height + 1,
                            `${id}: rectangle bounds ${JSON.stringify(m.attrs)}`
                        );
                    }
                    if (m.tag === "circle") {
                        const { cx, cy, r } = m.attrs as Record<string, number>;
                        assert.ok(
                            cx - r >= -1 && cy - r >= -1 && cx + r <= 361 && cy + r <= f.height + 1,
                            `${id}: circle bounds`
                        );
                    }
                }
            }
    assert.throws(() => animationFrame("not-a-scene" as AnimationId, 0, 0), RangeError);
    for (const p of [-0.1, 1.1, NaN, Infinity]) assert.throws(() => animationFrame("cache", p, 0), RangeError);
    assert.throws(() => animationFrame("cache", 0, 2), RangeError);
});
test("rounding, pipeline and accumulator clocks match analytic cases", () => {
    for (const two of [false, true]) {
        assert.equal(roundingState(0, two).roundedRelative, 0);
        assert.equal(roundingState(0.5, two).roundedRelative, 0);
        assert.equal(roundingState(0.75, two).roundedRelative, 1);
        assert.equal(roundingState(1, two).roundedRelative, 1);
    }
    assert.equal(roundingState(0, true).spacing, 2 * roundingState(0, false).spacing);
    assert.deepEqual(instructionStarts(4, 5, 4).starts, [0, 1, 2, 3]);
    assert.equal(instructionStarts(4, 5, 4).finish, 8);
    assert.deepEqual(instructionStarts(4, 5, 1).starts, [0, 5, 10, 15]);
    assert.equal(instructionStarts(4, 5, 1).finish, 20);
    assert.equal(instructionStarts(12, 3, 1).finish, 36);
    assert.equal(instructionStarts(12, 3, 3).finish, 14);
    assert.equal(instructionStarts(0, 3, 1).finish, 0);
    assert.throws(() => instructionStarts(1, 0, 1), RangeError);
});
test("cache and traversal counts follow explicit address traces", () => {
    for (const [base, misses] of [
        [64, 8],
        [80, 2],
    ]) {
        const addresses = Array.from({ length: 8 }, (_, i) => (i % 2 ? base + Math.floor(i / 2) : Math.floor(i / 2)));
        assert.equal(cacheTrace(addresses, 16, 4).filter((e) => e.miss).length, misses);
    }
    for (const [columns, misses] of [
        [false, 4],
        [true, 16],
    ] as const) {
        const order = traversalIndices(columns);
        assert.equal(new Set(order).size, 16);
        assert.equal(cacheTrace(order, 4, 1).filter((e) => e.miss).length, misses);
    }
});
test("both static and dynamic schedules conserve work, ownership and worker order", () => {
    for (const [cyclic, end] of [
        [false, 15],
        [true, 12],
    ] as const) {
        const jobs = triangularSchedule(cyclic);
        assert.equal(Math.max(...jobs.map((j) => j.end)), end);
        assert.equal(
            jobs.reduce((s, j) => s + j.end - j.start, 0),
            36
        );
    }
    for (const [chunk, end] of [
        [1, 22],
        [2, 20],
    ]) {
        const jobs = dynamicSchedule(chunk);
        assert.deepEqual(
            jobs.map((j) => j.index),
            [0, 1, 2, 3, 4, 5, 6, 7]
        );
        assert.equal(
            jobs.reduce((s, j) => s + j.end - j.start, 0),
            36
        );
        assert.equal(Math.max(...jobs.map((j) => j.end)), end);
        assert.equal(jobs.filter((j) => j.start > j.dispatchStart).length, 8 / chunk);
        for (const worker of [0, 1]) {
            const row = jobs.filter((j) => j.worker === worker);
            for (let i = 1; i < row.length; i++) assert.ok(row[i].start >= row[i - 1].end);
        }
    }
});
test("reduction tree and diffusion conserve their intended mathematical quantities", () => {
    for (const serial of [false, true]) {
        const levels = reductionLevels(serial);
        assert.equal(levels.length, serial ? 8 : 4);
        for (const row of levels)
            assert.equal(
                row.reduce((a, b) => a + b, 0),
                36
            );
        assert.deepEqual(levels.at(-1), [36]);
    }
    const fixed = relaxationStates(false),
        periodic = relaxationStates(true);
    close(fixed[1][0][0], 0.6);
    close(fixed[1][0][2], 0.8);
    close(fixed[1][2][2], 1);
    let previous = 1;
    for (const state of fixed) {
        const max = Math.max(...state.flat());
        assert.ok(max <= previous);
        previous = max;
    }
    assert.ok(previous < 1);
    for (const state of periodic) assert.ok(state.flat().every((x) => x === 1));
});
test("broadcast only forwards known data; rank maps and transaction counts are exact", () => {
    for (const tree of [false, true]) {
        const known = new Set([0]);
        for (let round = 0; round < (tree ? 3 : 7); round++) {
            const old = new Set(known);
            for (const [from, to] of broadcastEdges(tree, round)) {
                assert.ok(old.has(from));
                assert.ok(!old.has(to));
                known.add(to);
            }
        }
        assert.equal(known.size, 8);
    }
    for (const reordered of [false, true])
        assert.equal(new Set(Array.from({ length: 16 }, (_, i) => worldAtCart(i, reordered))).size, 16);
    assert.equal(worldAtCart(14, true), 9);
    assert.equal(memorySegments(false).count, 1);
    assert.equal(memorySegments(true).count, 8);
    for (const id of ["allreduce"] as const)
        for (const mode of [0, 1])
            assert.equal(animationFrame(id, 1, mode).marks.filter((m) => m.text === "36").length, 8);
});
test("forward and reverse traces obey analytic gradients, seed linearity and duality", () => {
    const x1 = adState(0),
        x2 = adState(1);
    close(x1.tangents[5], 1.2);
    close(x2.tangents[5], 2 - Math.cos(0.7));
    close(x1.gradient[0], x1.tangents[5]);
    close(x1.gradient[1], x2.tangents[5]);
    const doubled = adState(0, 2);
    for (let i = 0; i < 2; i++) close(doubled.gradient[i], 2 * x1.gradient[i]);
    close(x1.contributions[0] + x1.contributions[1], x1.gradient[0]);
    close(x1.contributions[2] + x1.contributions[3], x1.gradient[1]);
});
