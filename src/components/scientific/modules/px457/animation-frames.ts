import type { AnimationId } from "./animation-catalog";
import {
    clamp,
    ease,
    lerp,
    phase,
    roundingState,
    instructionStarts,
    cacheTrace,
    traversalIndices,
    reductionLevels,
    triangularSchedule,
    dynamicSchedule,
    relaxationStates,
    broadcastEdges,
    worldAtCart,
    memorySegments,
    adState,
} from "./animation-math";

/** SVG geometry is a pure function of the scene, its clock and its comparison. */
export interface Mark {
    tag: "path" | "rect" | "circle" | "text";
    attrs: Record<string, string | number>;
    text?: string;
}
export interface AnimationFrame {
    marks: Mark[];
    height: number;
    summary: string;
    equation: string;
}
const ink = "currentColor",
    teal = "var(--sci-accent)",
    amber = "var(--sci-secondary)";
const fmt = (x: number, d = 2) => Number(x.toFixed(d)).toString();
type Point = readonly [number, number];
class Drawing {
    marks: Mark[] = [];
    height = 280;
    text(x: number, y: number, text: string, anchor = "start", fill = ink, size = 13) {
        this.marks.push({ tag: "text", attrs: { x, y, fill, fontSize: size, textAnchor: anchor }, text });
    }
    path(d: string, stroke = ink, opacity = 1, dash = "", width = 1.2) {
        this.marks.push({
            tag: "path",
            attrs: {
                d,
                fill: "none",
                stroke,
                opacity,
                strokeWidth: width,
                strokeDasharray: dash,
                strokeLinecap: "round",
                strokeLinejoin: "round",
            },
        });
    }
    line(x1: number, y1: number, x2: number, y2: number, stroke = ink, opacity = 1, dash = "") {
        this.path(`M${x1},${y1}L${x2},${y2}`, stroke, opacity, dash);
    }
    rect(x: number, y: number, width: number, height: number, fill = "none", alpha = 0.13, stroke = ink, dash = "") {
        this.marks.push({
            tag: "rect",
            attrs: {
                x,
                y,
                width: Math.max(0, width),
                height: Math.max(0, height),
                rx: 2,
                fill,
                fillOpacity: alpha,
                stroke,
                strokeWidth: 1,
                strokeDasharray: dash,
            },
        });
    }
    dot(x: number, y: number, r = 4, fill = teal, opacity = 1) {
        this.marks.push({ tag: "circle", attrs: { cx: x, cy: y, r, fill, opacity } });
    }
    ring(x: number, y: number, r = 19, active = false, tone = teal) {
        this.marks.push({
            tag: "circle",
            attrs: {
                cx: x,
                cy: y,
                r,
                fill: active ? tone : "none",
                fillOpacity: 0.15,
                stroke: active ? tone : ink,
                strokeWidth: active ? 1.7 : 1,
                strokeOpacity: active ? 1 : 0.5,
            },
        });
    }
    edge(a: Point, b: Point, u: number, tone = teal, label = "", bend = 0) {
        const dx = b[0] - a[0],
            dy = b[1] - a[1],
            len = Math.hypot(dx, dy) || 1;
        const c: Point = [(a[0] + b[0]) / 2 - (bend * dy) / len, (a[1] + b[1]) / 2 + (bend * dx) / len];
        this.path(`M${a[0]},${a[1]}Q${c[0]},${c[1]} ${b[0]},${b[1]}`, ink, 0.2);
        if (u < 0) return;
        const t = clamp(u),
            x = (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
            y = (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1];
        const q: Point = [lerp(a[0], c[0], t), lerp(a[1], c[1], t)];
        this.path(`M${a[0]},${a[1]}Q${q[0]},${q[1]} ${x},${y}`, tone, 0.8, "", 1.8);
        if (t < 1) {
            this.dot(x, y, 4.5, tone);
            if (label) this.text(x, y - 10, label, "middle", tone, 12);
        }
    }
    finish(summary: string, equation: string): AnimationFrame {
        return { marks: this.marks, height: this.height, summary, equation };
    }
}
function trimEndpoints(a: Point, b: Point, startRadius: number, endRadius: number): [Point, Point] {
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const dx = (b[0] - a[0]) / length,
        dy = (b[1] - a[1]) / length;
    return [
        [a[0] + dx * startRadius, a[1] + dy * startRadius],
        [b[0] - dx * endRadius, b[1] - dy * endRadius],
    ];
}
function nodesOnRing() {
    return Array.from(
        { length: 8 },
        (_, r) => [180 + 112 * Math.sin((r * Math.PI) / 4), 140 - 112 * Math.cos((r * Math.PI) / 4)] as Point
    );
}
function timePart(p: number, index: number, count: number) {
    return p * count < index ? -1 : ease(p * count - index);
}

function rounding(p: number, v: boolean) {
    const d = new Drawing(),
        s = roundingState(p, v);
    const x = 35 + 290 * p,
        rx = 35 + 290 * s.roundedRelative;
    d.rect(35, 99, 145, 55, teal, 0.055, "none");
    d.rect(180, 99, 145, 55, amber, 0.055, "none");
    d.line(25, 126, 335, 126);
    for (const tx of [35, 180, 325]) d.line(tx, 119, tx, 133);
    d.line(180, 53, 180, 195, ink, 0.35, "3 5");
    d.text(180, 38, "rounding midpoint", "middle");
    d.line(x, 85, x, 120, teal, 0.6);
    d.dot(x, 85, 5, teal);
    d.text(180, 65, `exact increment: ${fmt(p)} spacing`, "middle", teal);
    d.edge([x, 126], [rx, 175], 1, amber, "", 12);
    d.ring(rx, 175, 7, true, amber);
    d.text(35, 220, `${s.base}`, "middle");
    d.text(325, 220, `${s.base} + 2${v ? "⁻²²" : "⁻²³"}`, "end");
    d.text(180, 258, "exact value → representable neighbour", "middle", ink, 12);
    return d.finish(
        `The exact increment is ${fmt(p)} of a spacing. It rounds to ${s.roundedRelative === 0 ? "the lower" : "the upper"} neighbour.`,
        `spacing = 2${v ? "⁻²²" : "⁻²³"}; rounded increment = ${s.roundedRelative} spacing`
    );
}
function energy(p: number, v: boolean) {
    const d = new Drawing(),
        power = v ? 0.8 : 1,
        end = v ? 1.1 : 1,
        t = p * end,
        x = 35 + 250 * t,
        y = 205 - 130 * power;
    d.line(35, 205, 335, 205);
    d.line(35, 205, 35, 42);
    d.text(35, 24, "power (normalised)");
    d.text(335, 250, "time (normalised)", "end");
    d.rect(35, 75, 250, 130, "none", 0, ink, "4 4");
    d.rect(35, 101, 275, 104, "none", 0, ink, "2 5");
    d.rect(35, y, 250 * t, 130 * power, v ? amber : teal, 0.2, "none");
    d.line(35, y, 35 + 250 * end, y, v ? amber : teal);
    d.line(x, 205, x, y, v ? amber : teal, 0.7);
    d.dot(x, y, 5, v ? amber : teal);
    d.text(24, 80, "1", "end");
    d.text(24, 106, "0.8", "end");
    for (const [at, label] of [
        [0, "0"],
        [1, "1"],
        [1.1, "1.1"],
    ] as const)
        d.text(35 + 250 * at, 226, label, "middle");
    d.text(180, 162, `energy so far = ${fmt(power * t, 3)}`, "middle", v ? amber : teal, 15);
    return d.finish(
        `Elapsed time ${fmt(t, 2)}; power ${power}; accumulated energy ${fmt(power * t, 3)}.`,
        `E = ${power} × ${fmt(t, 2)} = ${fmt(power * t, 3)}`
    );
}
function pipeline(p: number, v: boolean) {
    const d = new Drawing(),
        starts = instructionStarts(4, 5, v ? 1 : 4).starts,
        total = v ? 20 : 8,
        time = p * total;
    for (const [j, label] of ["F", "D", "E", "M", "R"].entries()) d.text(94 + 49 * j, 28, label, "middle");
    for (let i = 0; i < 4; i++) {
        const y = 56 + 43 * i;
        d.text(13, y + 18, String.fromCharCode(65 + i));
        for (let j = 0; j < 5; j++) d.rect(73 + 49 * j, y, 43, 30, "none", 0, ink, "2 4");
        const u = clamp((time - starts[i]) / 5),
            active = time >= starts[i];
        if (active) {
            const x = 78 + 240 * u;
            d.dot(x, y + 15, 8, i % 2 ? amber : teal);
            d.text(336, y + 19, u === 1 ? "✓" : "", "middle", teal, 15);
        }
    }
    const complete = starts.filter((s) => time >= s + 5).length;
    d.text(180, 250, `cycle ${fmt(time, 1)} / ${total} · ${complete} results`, "middle");
    return d.finish(
        `${v ? "Dependent" : "Independent"} starts at cycles ${starts.join(", ")}. ${complete} of four results are complete.`,
        `T = ${v ? "4 × 5 = 20" : "5 + 3 × 1 = 8"} toy cycles`
    );
}
function accumulators(p: number, v: boolean) {
    const d = new Drawing(),
        chains = v ? 3 : 1,
        s = instructionStarts(12, 3, chains),
        time = p * 36;
    for (let i = 0; i < 12; i++) {
        const x = 20 + 29 * i;
        d.text(x, 27, String(i + 1), "middle", ink, 12);
        d.dot(x, 41, 2, ink, 0.25);
    }
    const xs = v ? [70, 180, 290] : [180];
    for (let c = 0; c < chains; c++) {
        const x = xs[c];
        d.ring(x, 157, 28, true, c % 2 ? amber : teal);
        const done = s.starts
            .map((start, i) => ({ start, i }))
            .filter((x) => x.i % chains === c && x.start + 3 <= time);
        const sum = done.reduce((a, x) => a + x.i + 1, 0);
        d.text(x, 162, String(sum), "middle", ink, 16);
        d.text(x, 210, `accumulator ${c}`, "middle", ink, 12);
    }
    for (let i = 0; i < 12; i++) {
        const a = s.starts[i],
            b = a + 3;
        if (time >= a && time <= b)
            d.edge(
                [20 + 29 * i, 45],
                [xs[i % chains], 127],
                ease((time - a) / 3),
                (i % chains) % 2 ? amber : teal,
                String(i + 1),
                18
            );
    }
    d.text(180, 250, `cycle ${fmt(time, 1)} · last input ready at ${s.finish}`, "middle");
    return d.finish(
        `${chains} independent ${chains === 1 ? "chain" : "chains"}; input additions finish at cycle ${s.finish}. Final merging is extra work.`,
        `12 additions; latency 3; ${chains} ${chains === 1 ? "accumulator" : "accumulators"}`
    );
}
function cache(p: number, v: boolean) {
    const d = new Drawing(),
        base = v ? 80 : 64,
        trace = cacheTrace(
            Array.from({ length: 8 }, (_, i) => (i % 2 ? base + Math.floor(i / 2) : Math.floor(i / 2))),
            16,
            4
        );
    const t = p * 8,
        k = Math.min(7, Math.floor(t)),
        u = p === 1 ? 1 : t - k,
        e = trace[k];
    for (let i = 0; i < 8; i++) {
        const x = 17 + i * 42;
        d.rect(x, 24, 33, 30, i === k ? teal : "none", 0.15);
        d.text(x + 16.5, 43, `${i % 2 ? "B" : "A"}${Math.floor(i / 2)}`, "middle", ink, 12);
    }
    d.rect(123, 91, 114, 36, e.miss ? amber : teal, 0.1);
    d.text(180, 114, `block ${e.block}: ${e.miss ? "miss" : "hit"}`, "middle", ink, 12);
    const slots = u >= 0.75 ? e.slots : k ? trace[k - 1].slots : [null, null, null, null];
    for (let s = 0; s < 4; s++) {
        const x = 19 + s * 84;
        d.rect(x, 177, 69, 41, s === e.slot ? teal : "none", 0.13);
        d.text(x + 34, 202, slots[s] === null ? "empty" : `block ${slots[s]}`, "middle", ink, 12);
        d.text(x + 34, 240, `slot ${s}`, "middle", ink, 12);
    }
    d.edge([33 + k * 42, 57], [180, 87], ease(Math.min(1, u * 2)), teal, "", 8);
    if (e.miss) d.edge([180, 130], [53 + e.slot * 84, 173], u < 0.4 ? -1 : phase(u, 0.4, 0.85), amber, "", -14);
    else d.edge([53 + e.slot * 84, 173], [33 + k * 42, 59], u < 0.15 ? -1 : phase(u, 0.15, 0.85), teal, "", 18);
    d.text(180, 269, "amber: line fill · teal: cached read", "middle", ink, 11);
    const completed = Math.min(8, Math.floor(t)),
        misses = trace.slice(0, completed).filter((x) => x.miss).length;
    return d.finish(
        `${completed} reads complete, ${misses} read misses. Current word address ${e.address} maps to block ${e.block}, slot ${e.slot}.`,
        `block = floor(address / 16); slot = block mod 4`
    );
}
function traversal(p: number, v: boolean) {
    const d = new Drawing(),
        order = traversalIndices(v),
        t = p * 16,
        k = Math.min(15, Math.floor(t)),
        u = p === 1 ? 1 : t - k,
        trace = cacheTrace(order, 4, 1);
    const point = (i: number): Point => [95 + (i % 4) * 45, 40 + Math.floor(i / 4) * 45];
    for (let i = 0; i < 16; i++) {
        const [x, y] = point(i);
        d.rect(x - 20, y - 16, 40, 36, order.indexOf(i) < t ? teal : "none", 0.16);
        d.text(x, y + 6, String(i), "middle");
    }
    const visited = order.slice(0, k + 1).map(point);
    if (visited.length > 1) d.path(`M${visited.map((a) => a.join(",")).join("L")}`, teal, 0.45, "", 1.8);
    const a = point(order[Math.max(0, k - 1)]),
        b = point(order[k]);
    d.dot(lerp(a[0], b[0], ease(u)), lerp(a[1], b[1], ease(u)), 5, amber);
    const addr = order[k],
        done = Math.min(16, Math.floor(t)),
        misses = trace.slice(0, done).filter((x) => x.miss).length;
    d.text(180, 230, `target: row ${Math.floor(addr / 4)}, col ${addr % 4} → ${addr}`, "middle");
    d.text(180, 260, `${done} reads · ${misses} line fills`, "middle", teal);
    return d.finish(
        `${v ? "Column" : "Row"} traversal: ${done} reads and ${misses} line fills in the one-line cache. All sixteen positions are visited once.`,
        `address = 4 × row + column`
    );
}
function fork(p: number, v: boolean) {
    const d = new Drawing(),
        count = v ? 4 : 2;
    d.ring(25, 135, 13, true);
    d.text(25, 166, "initial", "middle", ink, 11);
    d.ring(333, 135, 13, p >= 0.95);
    d.text(333, 166, "join", "middle", ink, 11);
    for (let r = 0; r < count; r++) {
        const target = count === 2 ? 87 + 96 * r : 51 + 56 * r,
            y = lerp(135, target, phase(p, 0, 0.25));
        d.edge(
            [39, 135],
            [149, y],
            p < 0.02 ? -1 : phase(p, 0.02, 0.28),
            r % 2 ? amber : teal,
            "",
            (r - (count - 1) / 2) * 12
        );
        d.rect(151, y - 16, 58, 32, teal, p >= 0.3 ? 0.13 : 0.03);
        d.text(180, y + 5, `T${r}`, "middle");
        const work = phase(p, 0.3, 0.5 + 0.05 * r);
        d.line(156, y + 23, 156 + 48 * work, y + 23, r % 2 ? amber : teal, 1);
        d.edge(
            [211, y],
            [319, 135],
            p < 0.65 ? -1 : phase(p, 0.65, 0.86 + 0.03 * r),
            r % 2 ? amber : teal,
            "",
            (r - (count - 1) / 2) * -10
        );
    }
    d.text(
        180,
        261,
        p < 0.28
            ? "fork: the initial thread participates"
            : p < 0.65
              ? "work: every member runs the region"
              : p < 0.95
                ? "join: wait for all members"
                : "continue: one thread",
        "middle",
        ink,
        12
    );
    return d.finish(
        `${count} selected team members. ${p < 0.3 ? "The team is forming." : p < 0.65 ? "Each member executes the block." : p < 0.95 ? "The team synchronises at join." : "The initial thread continues."}`,
        `1 → ${count} → 1 logical workers`
    );
}
function ownership(p: number, v: boolean) {
    const d = new Drawing(),
        t = p * 8,
        done = Math.floor(t);
    for (let i = 0; i < 8; i++) d.text(108 + i * 30, 25, String(i), "middle", ink, 12);
    for (let r = 0; r < 4; r++) {
        const y = 60 + 46 * r;
        d.text(12, y + 17, `T${r}`);
        for (let i = 0; i < 8; i++) {
            const owns = v || Math.floor(i / 2) === r,
                x = 95 + i * 30;
            d.rect(x, y, 25, 27, owns && i < done ? (r % 2 ? amber : teal) : "none", 0.2, ink, owns ? "" : "2 4");
            if (owns && i < done) d.text(x + 12.5, y + 18, String(i), "middle", ink, 12);
            if (owns && Math.floor(t) === i && p < 1)
                d.edge([x + 12, 32], [x + 12, y - 3], ease(t - i), r % 2 ? amber : teal);
        }
    }
    d.text(180, 265, `${Math.min(8, done) * (v ? 4 : 1)} of ${v ? 32 : 8} calls executed`, "middle");
    return d.finish(
        `${v ? "Replicated" : "Partitioned"} execution has completed ${Math.min(8, done) * (v ? 4 : 1)} calls. Each tile records one execution, not a unit of time.`,
        `${v ? "P × N = 4 × 8 = 32" : "N = 8"} total calls`
    );
}
function race(p: number, v: boolean) {
    const d = new Drawing(),
        events = v
            ? ([
                  [0, "read 0"],
                  [0, "prepare 1"],
                  [0, "store 1"],
                  [1, "read 1"],
                  [1, "prepare 2"],
                  [1, "store 2"],
              ] as const)
            : ([
                  [0, "read 0"],
                  [1, "read 0"],
                  [0, "prepare 1"],
                  [1, "prepare 1"],
                  [0, "store 1"],
                  [1, "store 1"],
              ] as const);
    const t = p * 6,
        step = Math.min(5, Math.floor(t));
    d.text(80, 22, "thread A", "middle");
    d.text(270, 22, "thread B", "middle");
    d.line(80, 35, 80, 212, ink, 0.25);
    d.line(270, 35, 270, 212, ink, 0.25);
    events.forEach(([r, label], i) => {
        const x = r ? 270 : 80,
            y = 48 + 29 * i;
        d.rect(x - 48, y - 12, 96, 24, i < t ? (r ? amber : teal) : "none", 0.14, ink, i < t ? "" : "2 4");
        d.text(x, y + 5, i < t ? label : "…", "middle", ink, 12);
        if (i === step && p < 1) d.dot(x - 55, y, 3, r ? amber : teal);
    });
    const value = v ? (t >= 6 ? 2 : t >= 3 ? 1 : 0) : t >= 5 ? 1 : 0;
    d.rect(136, 235, 88, 29, teal, 0.12);
    d.text(180, 255, `sum = ${value}`, "middle");
    return d.finish(
        `${v ? "Atomic ordering" : "One possible racy interleaving"}: ${Math.floor(t)} events complete. Shared sum is ${value}.`,
        v ? "read → add → store, then the next update" : "two old reads can produce two stores of 1"
    );
}
function reduction(p: number, v: boolean) {
    const d = new Drawing(),
        levels = reductionLevels(v),
        t = p * (v ? 7 : 3);
    if (v) {
        const pos: Point[] = [
            [40, 65],
            [130, 65],
            [220, 65],
            [310, 65],
            [310, 190],
            [220, 190],
            [130, 190],
            [40, 190],
        ];
        for (let i = 0; i < 8; i++) {
            const [x, y] = pos[i],
                value = ((i + 1) * (i + 2)) / 2;
            d.ring(x, y, 20, i <= t);
            d.text(x, y + 5, i <= t ? String(value) : "?", "middle");
            d.text(x, y + 35, i === 0 ? "input 1" : `+ ${i + 1}`, "middle", ink, 12);
            if (i > 0)
                d.edge(...trimEndpoints(pos[i - 1], pos[i], 21, 21), timePart(p, i - 1, 7), teal, "", i === 4 ? 35 : 0);
        }
    } else {
        const points = levels.map((values, l) =>
            values.map((_, i) => [180 + (i - (values.length - 1) / 2) * (356 / values.length), 35 + l * 68] as Point)
        );
        for (let l = 1; l < levels.length; l++)
            for (let i = 0; i < levels[l - 1].length; i++)
                d.edge(
                    ...trimEndpoints(points[l - 1][i], points[l][Math.floor(i / 2)], l === 1 ? 16 : 20, 20),
                    t < l - 1 ? -1 : ease(t - l + 1),
                    i % 2 ? amber : teal
                );
        points.forEach((row, l) =>
            row.forEach(([x, y], i) => {
                d.ring(x, y, l === 0 ? 15 : 19, t >= l);
                d.text(x, y + 5, t >= l ? String(levels[l][i]) : "?", "middle", ink, 12);
            })
        );
    }
    return d.finish(
        `${v ? "Sequential" : "Balanced"} combination: round ${fmt(t, 1)} of ${v ? 7 : 3}. The final exact sum is 36.`,
        v ? "(((1 + 2) + 3) + …) + 8 = 36" : "(1+2), (3+4), (5+6), (7+8) → 36"
    );
}
function scheduling(p: number, v: boolean) {
    const d = new Drawing(),
        jobs = triangularSchedule(v),
        time = p * 15;
    d.text(180, 24, "same 36 units of useful work", "middle");
    for (let r = 0; r < 4; r++) {
        const row = jobs.filter((j) => j.worker === r),
            load = row.at(-1)!.end,
            y = 55 + 44 * r;
        d.text(10, y + 19, `T${r}`);
        for (const job of row) {
            const x = 49 + 18 * job.start,
                w = 18 * (job.end - job.start),
                u = clamp((time - job.start) / (job.end - job.start));
            d.rect(x, y, w, 28, "none", 0, ink);
            d.rect(x, y, w * u, 28, job.index % 2 ? amber : teal, 0.24, "none");
            d.text(x + w / 2, y + 18, String(job.index), "middle", ink, 11);
        }
        d.text(54 + 18 * load, y + 19, String(load), "start", ink, 12);
    }
    d.line(49 + 270 * p, 43, 49 + 270 * p, 230, ink, 0.45, "3 4");
    for (const x of [0, 5, 10, 15]) d.text(49 + 18 * x, 252, String(x), "middle", ink, 12);
    const makespan = Math.max(...jobs.map((j) => j.end));
    return d.finish(
        `At time ${fmt(time, 1)}, ${jobs.filter((j) => j.end <= time).length} of eight rows are complete. The last worker finishes at ${makespan}.`,
        `makespan ${makespan}; lower bound 36 / 4 = 9`
    );
}
function chunks(p: number, v: boolean) {
    const d = new Drawing(),
        chunk = v ? 2 : 1,
        jobs = dynamicSchedule(chunk),
        time = p * 24;
    d.text(180, 25, "teal: useful work · amber: dispatch", "middle", ink, 12);
    for (let r = 0; r < 2; r++) {
        const y = 75 + 86 * r;
        d.text(8, y + 21, `T${r}`);
        for (const j of jobs.filter((j) => j.worker === r)) {
            if (j.start > j.dispatchStart) d.rect(40 + 12 * j.dispatchStart, y, 12, 32, amber, 0.3, ink, "2 2");
            const w = 12 * (j.end - j.start),
                u = clamp((time - j.start) / (j.end - j.start));
            d.rect(40 + 12 * j.start, y, w, 32, "none", 0, ink);
            d.rect(40 + 12 * j.start, y, w * u, 32, teal, 0.24, "none");
            d.text(40 + 12 * j.start + w / 2, y + 22, String(j.index), "middle", ink, 11);
        }
    }
    d.line(40 + time * 12, 53, 40 + time * 12, 213, ink, 0.5, "3 4");
    for (const x of [0, 8, 16, 24]) d.text(40 + 12 * x, 245, String(x), "middle", ink, 12);
    const end = Math.max(...jobs.map((j) => j.end));
    return d.finish(
        `Chunk size ${chunk}: ${8 / chunk} dispatches and makespan ${end}. The cursor is at time ${fmt(time, 1)}.`,
        `${36} useful units + ${8 / chunk} worker-time dispatch units`
    );
}
function dependence(p: number, v: boolean) {
    const d = new Drawing(),
        shift = v ? phase(p, 0, 0.55) : 0;
    for (let i = 0; i < 3; i++) {
        d.rect(22 + 125 * i, 38, 82, 173, "none", 0, ink, "4 4");
        d.text(63 + 125 * i, 28, `unit ${i + 1}`, "middle", ink, 12);
    }
    for (let i = 0; i < 2; i++) {
        const x = 63 + 125 * i,
            bx = lerp(x + 125, x, shift);
        d.rect(x - 29, 155, 58, 29, teal, 0.13);
        d.text(x, 174, `a[${i + 1}]`, "middle");
        d.rect(bx - 29, 64, 58, 29, amber, 0.13);
        d.text(bx, 83, `b[${i + 2}]`, "middle");
        const u = phase(p, v ? 0.58 : 0.1, 0.95);
        d.edge([x, 153], [bx, 96], p < (v ? 0.58 : 0.1) ? -1 : u, teal, "", v ? -12 : 15);
    }
    d.text(180, 249, "a[i] is updated before b[i+1] uses it", "middle", ink, 12);
    d.text(180, 272, "unmatched boundary operations stay explicit", "middle", ink, 11);
    return d.finish(
        v
            ? "The consumer moves into its producer's work unit; the value edge is preserved."
            : "Each producer supplies a consumer in the next work unit, creating a cross-iteration ordering.",
        "update a[i] → consume in b[i+1]"
    );
}
const diffusion = [relaxationStates(false), relaxationStates(true)];
function relaxation(p: number, v: boolean) {
    const d = new Drawing(),
        states = diffusion[Number(v)],
        t = p * 12,
        k = Math.min(11, Math.floor(t)),
        u = p === 1 ? 1 : ease(t - k);
    let max = 0;
    d.rect(77, 18, 206, 206, "none", 0, ink, v ? "3 4" : "");
    for (let i = 0; i < 5; i++)
        for (let j = 0; j < 5; j++) {
            const value = lerp(states[k][i][j], states[k + 1][i][j], u);
            max = Math.max(max, value);
            const x = 85 + 38 * j,
                y = 26 + 38 * i;
            d.rect(x, y, 35, 35, teal, 0.06 + 0.65 * value, ink);
            d.text(x + 17.5, y + 23, fmt(value, 2), "middle", ink, 11);
        }
    d.text(
        180,
        249,
        v ? "periodic: a constant error survives" : "fixed boundary: error drains inward",
        "middle",
        ink,
        12
    );
    return d.finish(
        `Iteration ${fmt(t, 1)}; maximum displayed error ${fmt(max, 3)}. ${v ? "The constant mode stays exactly 1." : "Intermediate geometry blends consecutive exact discrete states."}`,
        `e(next) = (self + four neighbours) / 5`
    );
}
function address(p: number, v: boolean) {
    const send = !v;
    const d = new Drawing(),
        values = [p >= 0.15 ? 42 : 0, send && p >= 0.83 ? 42 : 0, 0];
    d.text(180, 28, "rank 0 assigns a = 42", "middle");
    for (let r = 0; r < 3; r++) {
        const x = 12 + 120 * r;
        d.rect(x, 73, 96, 83, "none", 0, ink);
        d.text(x + 48, 98, `rank ${r}`, "middle");
        d.text(x + 48, 132, `a = ${values[r]}`, "middle", r === 0 ? teal : ink, 16);
    }
    if (send) d.edge([60, 167], [180, 167], p < 0.3 ? -1 : phase(p, 0.3, 0.82), teal, "42", 80);
    else d.line(60, 193, 180, 193, ink, 0.35, "3 5");
    d.text(
        180,
        258,
        send ? "copy the value; keep distinct objects" : "no message: other objects do not change",
        "middle",
        ink,
        12
    );
    return d.finish(
        `Local values are (${values.join(", ")}). ${send ? "The receiving rank owns its own copy." : "The source assignment has no remote side effect."}`,
        send ? "a₀ = 42 → message → a₁ = 42" : "same variable name ≠ shared storage"
    );
}
function halos(p: number, v: boolean) {
    const stencil = !v;
    const d = new Drawing();
    for (let r = 0; r < 3; r++) {
        const y = 35 + 75 * r;
        d.text(8, y + 22, `R${r}`, "start", ink, 12);
        for (let i = 0; i < 4; i++) {
            d.rect(83 + 40 * i, y, 36, 32, teal, 0.1);
            d.text(101 + 40 * i, y + 22, String(4 * r + i), "middle", ink, 12);
        }
        for (const side of [-1, 1]) {
            const x = side === -1 ? 43 : 247,
                external = (r === 0 && side === -1) || (r === 2 && side === 1);
            d.rect(x, y, 32, 32, stencil && !external ? amber : "none", stencil && p > 0.8 ? 0.2 : 0.04, ink, "3 3");
            d.text(
                x + 16,
                y + 22,
                external ? "BC" : stencil && p >= 0.85 ? String(side === -1 ? 4 * r - 1 : 4 * r + 4) : "·",
                "middle",
                ink,
                12
            );
        }
    }
    if (stencil) {
        for (let r = 0; r < 2; r++) {
            const y = 35 + 75 * r;
            d.edge([221, y + 35], [59, y + 75 - 4], p < 0.15 ? -1 : phase(p, 0.15, 0.85), teal, String(4 * r + 3), -22);
            d.edge(
                [101, y + 75 - 4],
                [263, y + 35],
                p < 0.15 ? -1 : phase(p, 0.15, 0.85),
                amber,
                String(4 * r + 4),
                22
            );
        }
    }
    d.text(
        180,
        263,
        stencil ? "immutable old values → ghost copies" : "independent elements: no halo traffic",
        "middle",
        ink,
        12
    );
    return d.finish(
        stencil
            ? "Four directed copies serve the two internal partition boundaries. Original ownership is unchanged."
            : "Every rank can update its four independent elements without a remote read.",
        "12 points = 3 ranks × 4 owned points"
    );
}
function envelope(p: number, v: boolean) {
    const d = new Drawing(),
        u = phase(p, 0.15, 0.85),
        end = v ? 190 : 288,
        x = lerp(72, end, u);
    d.ring(46, 108, 23, true);
    d.text(46, 113, "R0", "middle");
    d.ring(313, 108, 23, !v && p >= 0.85);
    d.text(313, 113, "R1", "middle");
    d.line(73, 108, 288, 108, ink, 0.25, "3 4");
    d.rect(x - 23, 86, 46, 34, teal, 0.16);
    d.text(x, 108, "42", "middle", ink, 15);
    d.text(x, 143, `tag ${v ? 9 : 7}`, "middle", teal, 12);
    d.rect(165, 185, 175, 64, "none", 0, ink);
    d.text(252, 207, "posted receive", "middle");
    d.text(252, 233, "source 0 · tag 7 · ctx C", "middle", ink, 11);
    d.text(20, 31, "message context: C");
    d.text(75, 242, !v && p >= 0.85 ? "delivered" : "waiting", "middle", v ? amber : teal, 12);
    return d.finish(
        v
            ? "Tag 9 cannot match this receive for tag 7. The payload remains unavailable to that receive."
            : p >= 0.85
              ? "The source, tag and context match; rank one can receive 42."
              : "A matching envelope is travelling toward the posted receive.",
        `send(0→1, tag ${v ? 9 : 7}, C); receive(0, tag 7, C)`
    );
}
function deadlock(p: number, v: boolean) {
    const d = new Drawing();
    for (const [r, x] of [
        [0, 59],
        [1, 301],
    ] as const) {
        d.rect(x - 43, 77, 86, 63, "none", 0, ink);
        d.text(x, 102, `rank ${r}`, "middle");
        d.text(x, 124, v ? "send + recv" : "send first", "middle", ink, 11);
        d.text(
            x,
            197,
            v ? (p >= 0.9 ? "received" : "receive posted") : p >= 0.4 ? "send waits" : "sending",
            "middle",
            v ? teal : amber,
            11
        );
    }
    const u = v ? phase(p, 0.1, 0.9) : 0.3 * phase(p, 0.1, 0.4);
    d.edge([62, 72], [298, 72], p < 0.1 ? -1 : u, teal, "a", -45);
    d.edge([298, 147], [62, 147], p < 0.1 ? -1 : u, amber, "b", -40);
    if (!v) {
        d.line(103, 158, 257, 158, ink, 0.3, "3 4");
        d.text(180, 250, "both required receives are unreachable", "middle", ink, 12);
    } else d.text(180, 250, "compatible receives are already available", "middle", ink, 12);
    return d.finish(
        v
            ? "The paired schedule supplies both matching receives. Disjoint destination buffers can receive the exchanged values."
            : "Without buffering, each send can wait for the other rank's later receive. The resulting cycle prevents progress.",
        v ? "send + receive: the ordering cycle is broken" : "send waits for receive; receive waits behind send"
    );
}
function collective(p: number, v: boolean) {
    const d = new Drawing(),
        inputs = [
            [1, 2],
            [3, 4],
            [5, 6],
        ];
    for (let r = 0; r < 3; r++) {
        const x = 15 + 120 * r;
        d.rect(x, 37, 90, 42, "none", 0, ink);
        d.text(x + 45, 26, `rank ${r}`, "middle", ink, 12);
        d.text(x + 45, 63, `[${inputs[r].join(", ")}]`, "middle");
    }
    if (!v) {
        for (let i = 0; i < 6; i++) {
            const x = 23 + i * 53;
            d.rect(x, 206, 47, 34, teal, 0.1);
            const rank = Math.floor(i / 2),
                done = p >= 0.68 + 0.1 * rank;
            d.text(x + 23, 229, done ? String(i + 1) : "·", "middle");
        }
    } else
        for (let c = 0; c < 2; c++) {
            let sum = 0;
            for (let r = 0; r < 3; r++) if (p >= 0.68 + 0.1 * r) sum += inputs[r][c];
            d.ring(120 + 120 * c, 224, 24, true);
            d.text(120 + 120 * c, 230, String(sum), "middle", ink, 16);
        }
    for (let r = 0; r < 3; r++)
        for (let c = 0; c < 2; c++) {
            const a: Point = [42 + 120 * r + 36 * c, 84],
                b: Point = v ? [120 + 120 * c, 197] : [46 + 53 * (2 * r + c), 201],
                start = 0.05 + 0.1 * r;
            d.edge(
                a,
                b,
                p < start ? -1 : phase(p, start, 0.68 + 0.1 * r),
                c ? amber : teal,
                String(inputs[r][c]),
                (r - 1) * 12
            );
        }
    return d.finish(
        v
            ? "Corresponding entries accumulate across ranks. The completed root result is (9,12)."
            : "Rank-labelled blocks occupy consecutive root positions. The completed result is (1,2,3,4,5,6).",
        v ? "(1+3+5, 2+4+6) = (9,12)" : "[rank 0 | rank 1 | rank 2]"
    );
}
function broadcast(p: number, v: boolean) {
    const d = new Drawing();
    d.height = 300;
    const positions = nodesOnRing(),
        rounds = v ? 7 : 3,
        t = p * rounds,
        known = new Set([0]);
    for (let r = 0; r < rounds; r++) {
        const edges = broadcastEdges(!v, r);
        for (const [a, b] of edges) {
            if (t >= r + 1) known.add(b);
            d.edge(
                ...trimEndpoints(positions[a], positions[b], 17, 17),
                t < r ? -1 : ease(t - r),
                r % 2 ? amber : teal,
                "7",
                12
            );
        }
    }
    positions.forEach(([x, y], r) => {
        d.ring(x, y, 16, known.has(r));
        d.text(x, y + 4, String(r), "middle", ink, 12);
        if (known.has(r)) d.text(x, y + 30, "7", "middle", teal, 11);
    });
    d.text(180, 130, `round ${fmt(t, 1)} / ${rounds}`, "middle", ink, 12);
    d.text(180, 151, `${known.size} informed`, "middle", teal, 13);
    return d.finish(
        `${v ? "Root loop" : "Binomial tree"}: ${known.size} ranks currently hold the value. The schedule finishes in ${rounds} abstract rounds.`,
        v ? "one new recipient per round" : "1 → 2 → 4 → 8 informed ranks"
    );
}
function topology(p: number, v: boolean) {
    const d = new Drawing(),
        reordered = !v,
        u = phase(p, 0.08, 0.8);
    const pos = (c: number): Point => [15 + (c % 4) * 87, 35 + Math.floor(c / 4) * 47];
    const target = Array.from({ length: 16 }, (_, c) => worldAtCart(c, reordered)).indexOf(9);
    for (let cart = 0; cart < 16; cart++) {
        const [x, y] = pos(cart),
            world = worldAtCart(cart, reordered);
        d.rect(x, y, 68, 38, "none", 0, ink);
        d.text(x + 34, y + 14, `C${cart}`, "middle", ink, 11);
        const old = p < 0.45,
            label = old ? cart : world,
            alpha = !reordered ? 1 : old ? 1 - phase(p, 0.1, 0.4) : phase(p, 0.5, 0.85);
        d.text(x + 34, y + 31, `W${label}`, "middle", ink, 11);
        d.marks[d.marks.length - 1].attrs.opacity = alpha;
    }
    const a = pos(9),
        b = pos(target),
        x = lerp(a[0] + 34, b[0] + 34, u),
        y = lerp(a[1] + 28, b[1] + 28, u);
    d.rect(x - 25, y - 10, 50, 20, "var(--background-color)", 1, teal);
    d.text(x, y + 4, "W9", "middle", teal, 12);
    d.text(180, 253, `world 9 → Cartesian ${target} → row rank ${target % 4}`, "middle", teal, 12);
    return d.finish(
        `The highlighted process stays world identity 9. In the target communicator its Cartesian rank is ${target} and its row-local rank is ${target % 4}.`,
        "world identity stays fixed; communicator-local names change"
    );
}
function allreduce(p: number, v: boolean) {
    const d = new Drawing();
    d.height = 300;
    const positions = nodesOnRing(),
        rounds = v ? 14 : 3,
        t = p * rounds,
        k = Math.min(rounds - 1, Math.floor(t)),
        u = p === 1 ? 1 : ease(t - k);
    if (v) {
        for (let r = 0; r < 8; r++)
            d.edge(...trimEndpoints(positions[r], positions[(r + 1) % 8], 19, 19), u, k < 7 ? teal : amber, "", -15);
    } else
        for (let r = 0; r < 8; r++) {
            const peer = r ^ (1 << k);
            if (r < peer) {
                d.edge(...trimEndpoints(positions[r], positions[peer], 19, 19), u, teal, "", 16);
                d.edge(...trimEndpoints(positions[peer], positions[r], 19, 19), u, amber, "", 16);
            }
        }
    const done = Math.min(3, Math.floor(t));
    positions.forEach(([x, y], r) => {
        d.ring(x, y, 18, true);
        let text: string;
        if (v) text = t >= 14 ? "36" : t === 0 ? String(r + 1) : "m/8";
        else {
            const size = 2 ** done,
                base = Math.floor(r / size) * size;
            text = String((size * (2 * base + size + 1)) / 2);
        }
        d.text(x, y + 4, text, "middle", ink, 11);
        d.text(x, y + 31, `R${r}`, "middle", ink, 10);
    });
    d.text(180, 127, `round ${fmt(t, 1)} / ${rounds}`, "middle", ink, 12);
    d.text(
        180,
        150,
        v ? (k < 7 ? "reduce-scatter" : "allgather") : "partner = rank XOR bit",
        "middle",
        v ? (k < 7 ? teal : amber) : teal,
        11
    );
    return d.finish(
        v
            ? `Ring round ${fmt(t, 1)} of 14. Packets represent one-eighth of the buffer; the diagram does not pretend each node already has a full partial sum.`
            : `Recursive-doubling round ${fmt(t, 1)} of 3. Rank-local partials cover ${2 ** done} original contributions.`,
        v ? "7 reduce-scatter rounds + 7 allgather rounds" : "3 exchanges; final sum 1 + … + 8 = 36"
    );
}
function overlap(p: number, v: boolean) {
    const d = new Drawing(),
        time = 12 * p,
        schedule = v
            ? [
                  [0, 4],
                  [0, 6],
                  [6, 8],
              ]
            : [
                  [0, 4],
                  [4, 10],
                  [10, 12],
              ],
        labels = ["comms", "interior", "boundary"];
    for (let r = 0; r < 3; r++) {
        const [start, end] = schedule[r],
            y = 55 + 61 * r,
            x = 63 + 22 * start,
            w = 22 * (end - start);
        d.text(8, y + 20, labels[r], "start", ink, 11);
        d.rect(x, y, w, 30, "none", 0, ink, r === 2 ? "3 3" : "");
        d.rect(x, y, w * clamp((time - start) / (end - start)), 30, r === 0 ? teal : amber, 0.23, "none");
        d.text(x + 4, y - 6, String(start), "start", ink, 11);
        d.text(x + w, y - 6, String(end), "end", ink, 11);
    }
    d.line(63 + 22 * time, 35, 63 + 22 * time, 227, ink, 0.45, "3 4");
    for (const t of [0, 4, 8, 12]) d.text(63 + 22 * t, 251, String(t), "middle", ink, 11);
    return d.finish(
        `Cursor time ${fmt(time, 1)}. Boundary work starts at ${v ? 6 : 10}, after both communication and interior work finish.`,
        v ? "max(4,6) + 2 = 8" : "4 + 6 + 2 = 12"
    );
}
function hybrid(p: number, v: boolean) {
    const d = new Drawing(),
        q = v ? 4 : 2;
    for (let r = 0; r < 2; r++) {
        const left = 16 + 181 * r,
            cx = 89 + 181 * r;
        d.rect(left, 40, 146, 147, "none", 0, ink, "3 4");
        d.text(cx, 29, `rank ${r}`, "middle");
        let sum = 0;
        for (let t = 0; t < q; t++) {
            const x = left + 18 + (q === 4 ? 36 : 108) * t,
                value = r * q + t;
            sum += value;
            d.ring(x, 79, 14, true, t % 2 ? amber : teal);
            d.text(x, 84, String(value), "middle", ink, 11);
            d.edge([x, 95], [cx, 145], p < 0.05 ? -1 : phase(p, 0.05, 0.43), t % 2 ? amber : teal, "", t * 4);
        }
        d.ring(cx, 166, 18, p >= 0.43);
        d.text(cx, 171, p >= 0.43 ? String(sum) : "?", "middle");
        d.edge([cx, 189], [180, 230], p < 0.55 ? -1 : phase(p, 0.55, 0.9), r ? amber : teal, String(sum), r ? -10 : 10);
    }
    d.ring(180, 251, 20, p >= 0.9);
    d.text(180, 256, p >= 0.9 ? String((2 * q * (2 * q - 1)) / 2) : "?", "middle");
    return d.finish(
        `${q} threads per rank. ${p < 0.43 ? "Private contributions are merging locally." : p < 0.9 ? "Completed rank-local sums travel through MPI." : "The global result is complete."}`,
        `sum 0…${2 * q - 1} = ${(2 * q * (2 * q - 1)) / 2}`
    );
}
function amdahl(p: number, v: boolean) {
    const d = new Drawing(),
        P = 1 + Math.floor(31 * p),
        F = v ? 0 : 0.1,
        parallel = (1 - F) / P,
        time = F + parallel;
    d.text(180, 30, `${P} processors · fixed problem`, "middle", ink, 15);
    d.rect(39, 88, 282, 36, "none", 0, ink, "3 4");
    d.rect(39, 88, 282 * F, 36, teal, 0.65, teal);
    d.rect(39 + 282 * F, 88, 282 * parallel, 36, amber, 0.3, amber);
    d.dot(39 + 282 * time, 79, 4, amber);
    d.text(180, 156, `T / T₁ = ${fmt(time, 6)}`, "middle", ink, 16);
    d.text(180, 181, `speedup = ${fmt(1 / time, 3)}`, "middle", teal, 14);
    d.rect(39, 213, 282, 16, "none", 0, ink);
    d.text(39, 252, "0", "middle", ink, 11);
    d.text(321, 252, "1 (serial baseline)", "end", ink, 11);
    if (F) {
        d.line(39 + 282 * F, 65, 39 + 282 * F, 236, teal, 0.5, "3 4");
        d.text(39 + 282 * F, 54, "serial floor", "start", teal, 11);
    }
    return d.finish(
        `P=${P}, F=${F}. Relative runtime ${fmt(time, 6)}, speedup ${fmt(1 / time, 3)}, efficiency ${fmt(1 / (P * time), 3)}.`,
        `T / T₁ = ${F} + ${1 - F} / ${P}`
    );
}
function scaling(p: number, v: boolean) {
    const d = new Drawing(),
        stage = Math.min(3, Math.floor(p * 3)),
        k = 1 + stage,
        next = Math.min(4, k + 1),
        u = p === 1 ? 0 : ease(p * 3 - stage);
    const first = lerp(1 / k, 1 / next, u),
        local = v ? 24 : 24 / k,
        global = v ? 24 * k : 24;
    d.text(180, 23, `milestone: N = ${global}; P = ${k * k}`, "middle");
    d.rect(95, 43, 170, 170, "none", 0, ink);
    d.rect(95, 43, 170 * first, 170 * first, teal, 0.22, teal);
    for (let j = 1; j < next; j++) {
        const coordinate = lerp(j / k, j / next, u),
            opacity = j === k ? u : 0.4;
        d.line(95 + 170 * coordinate, 43, 95 + 170 * coordinate, 213, ink, opacity);
        d.line(95, 43 + 170 * coordinate, 265, 43 + 170 * coordinate, ink, opacity);
    }
    d.text(49, 243, "local side", "start", ink, 12);
    d.line(126, 240, 126 + (v ? 176 : 176 * first), 240, teal, 1);
    d.text(180, 272, `ℓ = ${fmt(local, 2)} · halo/work ≈ ${fmt(4 / local, 3)}`, "middle", teal, 12);
    return d.finish(
        `${v ? "Weak" : "Strong"} scaling milestone ${k}×${k}: global side ${global}, local side ${fmt(local, 2)}. Geometry morphs to the next integer grid; intermediate frames are not fractional process counts.`,
        v ? "N = 24√P; ℓ = 24; halo/work ≈ 1/6" : "N = 24; ℓ = 24/√P; halo/work ≈ √P/6"
    );
}
function grid(p: number, v: boolean) {
    const d = new Drawing(),
        N = v ? 14 : 12,
        t = p * 4,
        pass = Math.min(3, Math.floor(t)),
        u = p === 1 ? 1 : ease(t - pass);
    for (let c = 0; c < 4; c++) d.text(121 + 64 * c, 27, `pass ${c}`, "middle", ink, 11);
    for (let r = 0; r < 4; r++) {
        const y = 56 + 47 * r;
        d.text(12, y + 20, `T${r}`, "start", ink, 12);
        for (let c = 0; c < 4; c++) {
            const i = r + 4 * c,
                x = 102 + 64 * c,
                valid = i < N;
            d.rect(x, y, 38, 31, valid && c < t ? (r % 2 ? amber : teal) : "none", 0.2, ink, valid ? "" : "3 4");
            d.text(x + 19, y + 21, valid ? String(i) : "·", "middle", ink, 12);
        }
        if (r + 4 * pass < N) d.edge([52, y + 15], [100 + 64 * pass, y + 15], u, r % 2 ? amber : teal, "", -12);
    }
    const complete = Math.min(N, Math.floor(t) * 4);
    d.text(180, 265, `${complete} / ${N} valid indices completed`, "middle", ink, 12);
    return d.finish(
        `Stride 4 and N=${N}: ${complete} elements completed. The final pass has ${N % 4 || 4} valid lanes; remaining checks produce no access.`,
        "index = thread + pass × 4 < N"
    );
}
function coalescing(p: number, v: boolean) {
    const d = new Drawing(),
        m = memorySegments(v),
        arrived = p >= 0.85,
        touched = new Set(arrived ? m.segments : []);
    d.text(180, 22, "eight lane requests considered together", "middle", ink, 12);
    for (let r = 0; r < 8; r++) {
        const x = 24 + 44 * r;
        d.ring(x, 50, 12, true);
        d.text(x, 54, String(r), "middle", ink, 10);
        d.text(x, 82, String(m.indices[r]), "middle", ink, 11);
        const dest = 35 + 41 * m.segments[r];
        d.edge([x, 88], [dest, 181], p < 0.1 ? -1 : phase(p, 0.1, 0.85), teal, "", (r - 3.5) * 5);
    }
    for (let segment = 0; segment < 8; segment++) {
        const x = 18 + 41 * segment;
        d.rect(x, 186, 34, 34, touched.has(segment) ? teal : "none", 0.2, ink, touched.has(segment) ? "" : "3 3");
        d.text(x + 17, 208, String(segment), "middle", ink, 11);
    }
    d.text(180, 245, "aligned 32-byte memory segments", "middle", ink, 12);
    d.text(
        180,
        272,
        `${arrived ? m.count : "?"} distinct segment${m.count === 1 ? "" : "s"} for this group`,
        "middle",
        teal,
        13
    );
    return d.finish(
        `Eight active lanes request their addresses together. ${arrived ? m.count + " distinct segments are touched." : "The grouped request is in flight."} Arrival motion is schematic, not serial lane issue.`,
        v ? "indices 0,8,16,…,56 → 8 segments" : "indices 0…7 → 1 segment"
    );
}
const graphPositions: Point[] = [
    [37, 76],
    [37, 207],
    [176, 40],
    [176, 140],
    [176, 240],
    [324, 140],
];
const graphEdges: [number, number][] = [
    [0, 2],
    [0, 3],
    [1, 3],
    [1, 4],
    [2, 5],
    [3, 5],
    [4, 5],
];
function graphPort(from: number, to: number): Point {
    const a = graphPositions[from],
        b = graphPositions[to],
        dx = b[0] - a[0],
        dy = b[1] - a[1];
    const width = from < 2 ? 55 : from === 5 ? 51 : 76,
        scale = 1 / Math.max(Math.abs(dx) / (width / 2), Math.abs(dy) / 21);
    return [a[0] + dx * scale, a[1] + dy * scale];
}
function ad(p: number, v: boolean, reverse: boolean) {
    const d = new Drawing();
    d.height = 300;
    const a = adState(Number(v), v ? 2 : 1),
        names = ["x₁", "x₂", "log", "multiply", "sin", "+ + −"],
        seed = v ? 2 : 1;
    if (!reverse) {
        for (const [from, to] of graphEdges) {
            const start = to === 5 ? 0.54 : 0.04,
                end = to === 5 ? 0.95 : 0.48,
                active = a.tangents[from] !== 0;
            d.edge(
                graphPort(from, to),
                graphPort(to, from),
                p < start || !active ? -1 : phase(p, start, end),
                v ? amber : teal,
                "",
                from === 1 && to === 3 ? -10 : 10
            );
        }
    } else {
        for (const [from, to] of graphEdges) {
            const backFrom = graphPort(to, from),
                backTo = graphPort(from, to),
                start = to === 5 ? 0.04 : 0.48,
                end = to === 5 ? 0.4 : from === 0 ? (to === 2 ? 0.73 : 0.88) : to === 3 ? 0.83 : 0.98;
            d.edge(
                backFrom,
                backTo,
                p < start ? -1 : phase(p, start, end),
                to === 4 ? amber : teal,
                "",
                from === 1 && to === 3 ? 10 : -10
            );
        }
    }
    graphPositions.forEach(([x, y], i) => {
        const w = i < 2 ? 55 : i === 5 ? 51 : 76;
        d.rect(x - w / 2, y - 21, w, 42, teal, 0.06, ink);
        d.text(x, y - 5, names[i], "middle", ink, 12);
        d.text(x, y + 12, fmt(a.primal[i], 3), "middle", ink, 11);
        let derivative: string;
        if (!reverse)
            derivative = i < 2 ? String(a.tangents[i]) : p >= (i === 5 ? 0.95 : 0.48) ? fmt(a.tangents[i], 3) : "?";
        else if (i === 5) derivative = String(seed);
        else if (i >= 2) derivative = p >= 0.4 ? String(i === 4 ? -seed : seed) : "?";
        else {
            const value =
                i === 0
                    ? (p >= 0.73 ? a.contributions[0] : 0) + (p >= 0.88 ? a.contributions[1] : 0)
                    : (p >= 0.83 ? a.contributions[2] : 0) + (p >= 0.98 ? a.contributions[3] : 0);
            derivative = fmt(value, 3);
        }
        d.text(x, y + 39, `${reverse ? "bar" : "dot"} = ${derivative}`, "middle", reverse ? amber : teal, 11);
    });
    d.text(
        180,
        294,
        reverse
            ? "shared inputs add contributions from every path"
            : "primal values stay fixed; tangents travel forward",
        "middle",
        ink,
        11
    );
    const result = reverse ? `(${fmt(a.gradient[0], 3)}, ${fmt(a.gradient[1], 3)})` : fmt(a.tangents[5], 3);
    return d.finish(
        reverse
            ? `Output seed ${seed}. The completed reverse sensitivities are ${result}; both paths into each input are added.`
            : `Unit seed along ${v ? "x₂" : "x₁"}. The completed forward directional derivative is ${result}.`,
        reverse ? `Jᵀ × ${seed} = ${result}` : `J × ${v ? "(0,1)" : "(1,0)"} = ${result}`
    );
}
const builders: Record<AnimationId, (p: number, v: boolean) => AnimationFrame> = {
    rounding,
    energy,
    pipeline,
    accumulators,
    cache,
    traversal,
    fork,
    ownership,
    race,
    reduction,
    scheduling,
    chunks,
    dependence,
    relaxation,
    address,
    halos,
    envelope,
    deadlock,
    collective,
    broadcast,
    topology,
    allreduce,
    overlap,
    hybrid,
    amdahl,
    scaling,
    grid,
    coalescing,
    forward: (p, v) => ad(p, v, false),
    reverse: (p, v) => ad(p, v, true),
};
export function animationFrame(id: AnimationId, progress: number, comparison: number): AnimationFrame {
    if (!Number.isFinite(progress) || progress < 0 || progress > 1 || ![0, 1].includes(comparison))
        throw new RangeError("animation state");
    if (!Object.hasOwn(builders, id)) throw new RangeError("unknown animation");
    return builders[id](progress, comparison === 1);
}
