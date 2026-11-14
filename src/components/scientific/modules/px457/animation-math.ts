/** Pure numerical schedules and states. Animation time is explicitly pedagogical. */
export const clamp = (x: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
export const ease = (x: number) => {
    const t = clamp(x);
    return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export function phase(progress: number, start: number, end: number) {
    return ease((progress - start) / (end - start));
}
export function roundingState(progress: number, nearTwo: boolean) {
    const base = nearTwo ? 2 : 1,
        spacing = nearTwo ? 2 ** -22 : 2 ** -23;
    const exact = base + clamp(progress) * spacing;
    return {
        base,
        spacing,
        exact,
        rounded: Math.fround(exact),
        relative: clamp(progress),
        roundedRelative: (Math.fround(exact) - base) / spacing,
    };
}
export function instructionStarts(count: number, latency: number, chains: number, issue = 1) {
    if (
        ![count, latency, chains, issue].every(Number.isSafeInteger) ||
        count < 0 ||
        latency < 1 ||
        chains < 1 ||
        issue < 1
    )
        throw new RangeError("instruction schedule");
    const ready = Array<number>(chains).fill(0),
        starts: number[] = [];
    for (let i = 0; i < count; ++i) {
        const lane = i % chains;
        const start = Math.max(i === 0 ? 0 : starts[i - 1] + issue, ready[lane]);
        starts.push(start);
        ready[lane] = start + latency;
    }
    return { starts, finish: count === 0 ? 0 : Math.max(...starts) + latency };
}
export interface Job {
    index: number;
    worker: number;
    start: number;
    end: number;
    dispatchStart: number;
}
export function triangularSchedule(cyclic: boolean): Job[] {
    const ready = [0, 0, 0, 0];
    return Array.from({ length: 8 }, (_, i) => {
        const worker = cyclic ? i % 4 : Math.floor(i / 2),
            start = ready[worker];
        ready[worker] += 8 - i;
        return { index: i, worker, start, end: ready[worker], dispatchStart: start };
    });
}
export function dynamicSchedule(chunk: number): Job[] {
    if (!Number.isSafeInteger(chunk) || chunk < 1 || chunk > 8) throw new RangeError("chunk");
    const ready = [0, 0],
        jobs: Job[] = [];
    for (let first = 0; first < 8; first += chunk) {
        const worker = ready[0] <= ready[1] ? 0 : 1,
            dispatchStart = ready[worker];
        ready[worker] += 1;
        for (let i = first; i < Math.min(first + chunk, 8); ++i) {
            const start = ready[worker];
            ready[worker] += 8 - i;
            jobs.push({
                index: i,
                worker,
                start,
                end: ready[worker],
                dispatchStart: i === first ? dispatchStart : start,
            });
        }
    }
    return jobs;
}
export interface CacheEvent {
    address: number;
    block: number;
    slot: number;
    miss: boolean;
    slots: (number | null)[];
}
export function cacheTrace(addresses: readonly number[], wordsPerLine: number, count: number): CacheEvent[] {
    const slots: (number | null)[] = Array(count).fill(null);
    return addresses.map((address) => {
        const block = Math.floor(address / wordsPerLine),
            slot = block % count,
            miss = slots[slot] !== block;
        slots[slot] = block;
        return { address, block, slot, miss, slots: [...slots] };
    });
}
export function traversalIndices(columns: boolean) {
    return Array.from({ length: 16 }, (_, i) => (columns ? (i % 4) * 4 + Math.floor(i / 4) : i));
}
export function reductionLevels(serial: boolean): number[][] {
    let values = Array.from({ length: 8 }, (_, i) => i + 1);
    const levels = [values];
    while (values.length > 1) {
        values = serial
            ? [values[0] + values[1], ...values.slice(2)]
            : Array.from({ length: values.length / 2 }, (_, i) => values[2 * i] + values[2 * i + 1]);
        levels.push(values);
    }
    return levels;
}
export function relaxationStates(periodic: boolean, steps = 12): number[][][] {
    const states = [Array.from({ length: 5 }, () => Array<number>(5).fill(1))];
    for (let k = 0; k < steps; k++) {
        const old = states[k];
        const read = (i: number, j: number) =>
            periodic ? old[(i + 5) % 5][(j + 5) % 5] : i < 0 || j < 0 || i >= 5 || j >= 5 ? 0 : old[i][j];
        states.push(
            Array.from({ length: 5 }, (_, i) =>
                Array.from(
                    { length: 5 },
                    (_, j) => (read(i, j) + read(i - 1, j) + read(i + 1, j) + read(i, j - 1) + read(i, j + 1)) / 5
                )
            )
        );
    }
    return states;
}
export function broadcastEdges(tree: boolean, round: number): [number, number][] {
    if (!Number.isSafeInteger(round) || round < 0 || round > 6) throw new RangeError("round");
    if (!tree) return [[0, round + 1]];
    return round >= 3 ? [] : Array.from({ length: 2 ** round }, (_, r) => [r, r + 2 ** round]);
}
export function worldAtCart(cart: number, permuted: boolean) {
    return permuted ? (5 * cart + 3) % 16 : cart;
}
export function memorySegments(scattered: boolean) {
    const indices = Array.from({ length: 8 }, (_, i) => (scattered ? 8 * i : i));
    return {
        indices,
        segments: indices.map((i) => Math.floor(i / 8)),
        count: new Set(indices.map((i) => Math.floor(i / 8))).size,
    };
}
export function adState(seedInput: number, outputSeed = 1) {
    const x1 = 2,
        x2 = 0.7,
        v1 = Math.log(x1),
        v2 = x1 * x2,
        v3 = Math.sin(x2),
        v4 = v1 + v2,
        y = v4 - v3;
    const direction = seedInput === 0 ? [1, 0] : [0, 1];
    const tangents = [
        direction[0],
        direction[1],
        direction[0] / x1,
        x2 * direction[0] + x1 * direction[1],
        Math.cos(x2) * direction[1],
        direction[0] / x1 + x2 * direction[0] + x1 * direction[1] - Math.cos(x2) * direction[1],
    ];
    return {
        primal: [x1, x2, v1, v2, v3, y],
        tangents,
        contributions: [outputSeed / x1, outputSeed * x2, outputSeed * x1, -outputSeed * Math.cos(x2)],
        gradient: [outputSeed * (1 / x1 + x2), outputSeed * (x1 - Math.cos(x2))],
    };
}
