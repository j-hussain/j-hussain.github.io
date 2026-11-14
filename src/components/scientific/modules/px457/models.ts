/** Analytic teaching models used to check PX457's fixed figures and examples.
 * No empirical hardware predictions, floating-point solver or React state.
 */
function natural(value: number, name: string, positive = false) {
    if (!Number.isSafeInteger(value) || value < (positive ? 1 : 0)) throw new RangeError(name);
}
export function pipelineTime(count: number, latency: number, interval: number) {
    natural(count, "count");
    if (![latency, interval].every((x) => Number.isFinite(x) && x > 0)) throw new RangeError("timing");
    return count === 0 ? 0 : latency + (count - 1) * interval;
}
export function cacheReadMisses(addresses: readonly number[], wordsPerLine = 16, slots = 4) {
    natural(wordsPerLine, "line length", true);
    natural(slots, "slots", true);
    const tags = new Map<number, number>();
    let misses = 0;
    for (const address of addresses) {
        natural(address, "address");
        const block = Math.floor(address / wordsPerLine);
        const slot = block % slots;
        if (tags.get(slot) !== block) {
            ++misses;
            tags.set(slot, block);
        }
    }
    return misses;
}
export function triangularLoads(n: number, workers: number, cyclic: boolean) {
    natural(n, "n");
    natural(workers, "workers", true);
    const loads = Array<number>(workers).fill(0);
    // The figure's contiguous example uses an exactly divisible iteration count.
    if (!cyclic && n % workers !== 0) throw new RangeError("contiguous model requires divisibility");
    for (let i = 0; i < n; ++i) {
        const owner = cyclic ? i % workers : Math.floor(i / (n / workers));
        loads[owner] += n - i;
    }
    return loads;
}
/** One immutable-old-field error update: zero Dirichlet or periodic boundary. */
export function relaxationErrorStep(field: readonly (readonly number[])[], periodic = false): number[][] {
    const m = field.length;
    if (m === 0 || field.some((row) => row.length !== m || row.some((x) => !Number.isFinite(x))))
        throw new RangeError("finite nonempty square field required");
    const read = (i: number, j: number) => {
        if (periodic) return field[(i + m) % m][(j + m) % m];
        return i < 0 || j < 0 || i >= m || j >= m ? 0 : field[i][j];
    };
    return Array.from({ length: m }, (_, i) =>
        Array.from(
            { length: m },
            (_, j) => (read(i, j) + read(i - 1, j) + read(i + 1, j) + read(i, j - 1) + read(i, j + 1)) / 5
        )
    );
}
export function scaling(serialFraction: number, workers: number, overhead = 0) {
    natural(workers, "workers", true);
    if (
        !Number.isFinite(serialFraction) ||
        serialFraction < 0 ||
        serialFraction > 1 ||
        !Number.isFinite(overhead) ||
        overhead < 0
    )
        throw new RangeError("fraction or overhead");
    if (workers === 1 && overhead !== 0) throw new RangeError("baseline overhead must be zero");
    const relativeTime = serialFraction + (1 - serialFraction) / workers + overhead;
    const speedup = 1 / relativeTime;
    return {
        relativeTime,
        speedup,
        efficiency: speedup / workers,
        processorOverhead: workers * relativeTime - 1,
        karpFlatt: workers === 1 ? null : (relativeTime - 1 / workers) / (1 - 1 / workers),
    };
}
export function gridStrideOwners(n: number, stride: number) {
    natural(n, "n");
    natural(stride, "stride", true);
    return Array.from({ length: stride }, (_, thread) => {
        const indices: number[] = [];
        for (let i = thread; i < n; i += stride) indices.push(i);
        return indices;
    });
}
/** A forward directional sweep and a reverse sweep over the chapter's primal trace. */
export function differentiateTrace(x1: number, x2: number, direction: readonly [number, number]) {
    if (!Number.isFinite(x1) || x1 <= 0 || !Number.isFinite(x2) || !direction.every(Number.isFinite))
        throw new RangeError("finite inputs and x1 > 0 required");
    const v1 = Math.log(x1),
        v2 = x1 * x2,
        v3 = Math.sin(x2);
    const dotV1 = direction[0] / x1;
    const dotV2 = x2 * direction[0] + x1 * direction[1];
    const dotV3 = Math.cos(x2) * direction[1];
    let barX1 = 0,
        barX2 = 0;
    const barV1 = 1,
        barV2 = 1,
        barV3 = -1;
    barX1 += barV1 / x1;
    barX1 += barV2 * x2;
    barX2 += barV2 * x1;
    barX2 += barV3 * Math.cos(x2);
    return { value: v1 + v2 - v3, tangent: dotV1 + dotV2 - dotV3, gradient: [barX1, barX2] as const };
}
