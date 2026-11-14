import { finiteVarianceFactor, gaussianDensity, lennardJones, metropolisAcceptance, normalisedWeights } from "./math";

export type MotionKind =
    | "thermal"
    | "phase"
    | "forces"
    | "spins"
    | "langevin"
    | "verlet"
    | "metropolis"
    | "importance"
    | "memory"
    | "shells"
    | "ising"
    | "cluster"
    | "lifting"
    | "hazard"
    | "kernels"
    | "pressure"
    | "landscape"
    | "umbrella";
export type Point = readonly [number, number];
export type Edge = readonly [number, number];
export interface MotionFrame {
    layers: Record<string, Point[]>;
    metrics: Record<string, number>;
    spins?: number[];
    secondSpins?: number[];
    bonds?: Edge[];
    active?: number[];
}
export interface MotionData {
    kind: MotionKind;
    parameter: number;
    frames: MotionFrame[];
    curves: Record<string, Point[]>;
    metadata: Record<string, number>;
}
export const MOTION_STEPS = 120;
const TAU = 2 * Math.PI;
const linspace = (lo: number, hi: number, count = 121) =>
    Array.from({ length: count }, (_, i) => lo + ((hi - lo) * i) / (count - 1));
export const curve = (fn: (x: number) => number, lo: number, hi: number, count = 121): Point[] =>
    linspace(lo, hi, count).map((x) => [x, fn(x)]);
const frame = (layers: MotionFrame["layers"], metrics: MotionFrame["metrics"]): MotionFrame => ({ layers, metrics });
export function seededRandom(seed: number) {
    let state = seed >>> 0;
    return () => {
        state = (Math.imul(1664525, state) + 1013904223) >>> 0;
        return (state + 0.5) / 4294967296;
    };
}
export function normalDraw(random: () => number) {
    return Math.sqrt(-2 * Math.log(random())) * Math.cos(TAU * random());
}
export function inverseCDF(cdf: (x: number) => number, u: number, lo = 0, hi = 1) {
    if (u < 0 || u > 1 || !Number.isFinite(u)) throw new RangeError("CDF probability must lie in [0,1]");
    for (let i = 0; i < 55; i++) {
        const mid = (lo + hi) / 2;
        if (cdf(mid) < u) lo = mid;
        else hi = mid;
    }
    return (lo + hi) / 2;
}
export function cubicKernel(x: number, h: number) {
    if (!(h > 0)) throw new RangeError("Positive smoothing length required");
    const q = Math.abs(x) / h;
    return (q < 1 ? 2 / 3 - q * q + q ** 3 / 2 : q < 2 ? (2 - q) ** 3 / 6 : 0) / h;
}
export function cubicKernelGradient(x: number, h: number) {
    if (!(h > 0)) throw new RangeError("Positive smoothing length required");
    const q = Math.abs(x) / h;
    return (Math.sign(x) * (q < 1 ? -2 * q + 1.5 * q * q : q < 2 ? -0.5 * (2 - q) ** 2 : 0)) / (h * h);
}
export function thermalPopulation(beta: number, time: number) {
    const up = Math.exp(-beta),
        down = 0.25; // Four degenerate excited states aggregate their downhill rate.
    const equilibrium = up / (up + down);
    const excited = equilibrium + (1 - equilibrium) * Math.exp(-(up + down) * time);
    return { equilibrium, excited, upFlux: (1 - excited) * up, downFlux: excited * down };
}
export function verletStep(x: number, v: number, dt: number): [number, number] {
    const half = v - (dt * x) / 2;
    const next = x + dt * half;
    return [next, half - (dt * next) / 2];
}
export function ouStep(x: number, temperature: number, dt: number, gaussian: number) {
    const a = Math.exp(-dt);
    return a * x + Math.sqrt(temperature * (1 - a * a)) * gaussian;
}
export function mixtureDensity(x: number, mix: number) {
    return 1 - mix + mix * 6 * x * (1 - x);
}
export function mixtureCDF(x: number, mix: number) {
    return (1 - mix) * x + mix * (3 * x * x - 2 * x ** 3);
}
export function widthOfValley(x: number) {
    return 0.35 + (0.65 * (x + 2)) / 4;
}
export function doubleWell(x: number) {
    return (x * x - 1) ** 2;
}
export function valleyFreeEnergy(x: number, temperature: number) {
    return doubleWell(x) - temperature * Math.log(widthOfValley(x));
}
export function periodicNeighbours(site: number, size: number) {
    const x = site % size,
        y = Math.floor(site / size);
    return [
        y * size + ((x + 1) % size),
        y * size + ((x + size - 1) % size),
        ((y + 1) % size) * size + x,
        ((y + size - 1) % size) * size + x,
    ];
}
export function periodicIsingEnergy(spins: readonly number[], size: number) {
    let energy = 0;
    for (let i = 0; i < spins.length; i++) {
        const n = periodicNeighbours(i, size);
        energy -= spins[i] * (spins[n[0]] + spins[n[2]]);
    }
    return energy;
}
export function growWolff(spins: readonly number[], size: number, beta: number, random: () => number, seed: number) {
    const active = [seed],
        visited = new Set(active),
        bonds: Edge[] = [],
        depth = new Map([[seed, 0]]),
        p = -Math.expm1(-2 * beta);
    for (let cursor = 0; cursor < active.length; cursor++) {
        const i = active[cursor];
        for (const j of periodicNeighbours(i, size)) {
            if (!visited.has(j) && spins[i] === spins[j] && random() < p) {
                visited.add(j);
                active.push(j);
                bonds.push([i, j]);
                depth.set(j, depth.get(i)! + 1);
            }
        }
    }
    return { active, bonds, depth };
}
function initialSpins(size: number) {
    const random = seededRandom(420);
    return Array.from({ length: size * size }, (_, i) =>
        Math.sin((i % size) * 0.55) + 0.75 * Math.cos(Math.floor(i / size) * 0.6) + 0.4 * (random() - 0.5) > 0 ? 1 : -1
    );
}
const magnetisation = (spins: number[]) => spins.reduce((a, b) => a + b, 0) / spins.length;

/** Models are recomputed only when a control changes. Rendering reads these deterministic snapshots. */
export function buildMotion(kind: MotionKind, parameter: number): MotionData {
    const frames: MotionFrame[] = [],
        curves: MotionData["curves"] = {},
        metadata: MotionData["metadata"] = {};
    const random = seededRandom(982451653);
    switch (kind) {
        case "thermal": {
            for (const time of linspace(0, 20)) {
                const p = thermalPopulation(parameter, time);
                const particles: Point[] = Array.from({ length: 60 }, (_, i) => {
                    // Smooth stratified mass markers; the exact probability is the displayed curve, not the dot count.
                    const q = (i + 0.5) / 60,
                        upper = 1 / (1 + Math.exp((q - p.excited) * 120));
                    return [i % 12, upper + 0.035 * Math.sin(i * 1.7)];
                });
                frames.push(frame({ particles }, { ...p, time }));
            }
            curves.excited = curve((t) => thermalPopulation(parameter, t).excited, 0, 20);
            break;
        }
        case "phase": {
            const energies = Array.from({ length: 40 }, (_, i) => -Math.log((i + 0.5) / 40) / parameter);
            for (const t of linspace(0, TAU))
                frames.push(
                    frame(
                        {
                            microcanonical: energies.map((_, i) => [
                                Math.sqrt(2 / parameter) * Math.cos(t + i * 2.39996),
                                Math.sqrt(2 / parameter) * Math.sin(t + i * 2.39996),
                            ]),
                            canonical: energies.map((E, i) => [
                                Math.sqrt(2 * E) * Math.cos(t + i * 2.39996),
                                Math.sqrt(2 * E) * Math.sin(t + i * 2.39996),
                            ]),
                        },
                        { time: t, meanEnergy: 1 / parameter, temperature: 1 / parameter }
                    )
                );
            curves.shell = curve((t) => Math.sin(t), 0, TAU);
            break;
        }
        case "forces": {
            curves.energy = curve((r) => lennardJones(r).energy, 0.96, 2.8);
            curves.force = curve((r) => lennardJones(r).force, 0.96, 2.8);
            for (const t of linspace(0, 1)) {
                const r = 1.88 - 0.92 * Math.cos(TAU * t),
                    pair = lennardJones(r, parameter);
                frames.push(
                    frame(
                        {
                            particles: [
                                [-r / 2, 0],
                                [r / 2, 0],
                            ],
                        },
                        { r, ...pair, epsilon: parameter }
                    )
                );
            }
            break;
        }
        case "spins": {
            curves.energy = curve((theta) => -parameter * Math.cos(theta), 0, TAU);
            for (const theta of linspace(0, TAU))
                frames.push(
                    frame(
                        {
                            spins: [
                                [1, 0],
                                [Math.cos(theta), Math.sin(theta)],
                            ],
                        },
                        {
                            theta,
                            energy: -parameter * Math.cos(theta),
                            torque: -parameter * Math.sin(theta),
                            coupling: parameter,
                        }
                    )
                );
            break;
        }
        case "langevin": {
            const dt = 0.075,
                paths: Point[][] = Array.from({ length: 32 }, () => [[0, 2]]),
                positions = Array(32).fill(2);
            for (let n = 0; n <= MOTION_STEPS; n++) {
                const t = n * dt;
                if (n)
                    positions.forEach((x, i) => {
                        positions[i] = ouStep(x, parameter, dt, normalDraw(random));
                        paths[i].push([t, positions[i]]);
                    });
                const variance = parameter * (1 - Math.exp(-2 * t));
                frames.push(
                    frame(
                        {
                            particles: positions.map((x, i) => [x, i]),
                            trace: [...paths[0]],
                            mean: curve((s) => 2 * Math.exp(-s), 0, Math.max(t, 0.001)),
                            density: curve((x) => gaussianDensity(x, parameter), -4, 4),
                        },
                        { time: t, variance, mean: 2 * Math.exp(-t), temperature: parameter }
                    )
                );
            }
            curves.stationary = curve((x) => gaussianDensity(x, parameter), -4, 4);
            break;
        }
        case "verlet": {
            let x = 1,
                v = 0;
            const trace: Point[] = [],
                orbit: Point[] = [];
            for (let n = 0; n <= MOTION_STEPS; n++) {
                if (n) [x, v] = verletStep(x, v, parameter);
                const time = n * parameter,
                    energy = (x * x + v * v) / 2;
                trace.push([n, energy]);
                orbit.push([x, v]);
                frames.push(
                    frame(
                        { orbit: [...orbit], energy: [...trace], exact: [[Math.cos(time), -Math.sin(time)]] },
                        { x, v, energy, error: energy - 0.5, time, dt: parameter }
                    )
                );
            }
            curves.circle = Array.from({ length: 121 }, (_, i) => [
                Math.cos((TAU * i) / 120),
                Math.sin((TAU * i) / 120),
            ]);
            break;
        }
        case "metropolis": {
            let x = -1;
            const trace: Point[] = [[0, x]],
                accepted: Point[] = [];
            for (let n = 0; n <= MOTION_STEPS; n++) {
                const before = x,
                    proposal = x + (2 * random() - 1) * 1.2;
                const delta = doubleWell(proposal) - doubleWell(x),
                    alpha = metropolisAcceptance(parameter, delta);
                const accept = random() < alpha;
                if (accept) x = proposal;
                trace.push([n + 1, x]);
                if (accept) accepted.push([n + 1, x]);
                frames.push(
                    frame(
                        {
                            trace: [...trace],
                            accepted: [...accepted],
                            proposal: [
                                [before, doubleWell(before)],
                                [proposal, doubleWell(proposal)],
                            ],
                        },
                        {
                            x,
                            before,
                            proposal,
                            delta,
                            alpha,
                            accepted: Number(accept),
                            attempt: n + 1,
                            energy: doubleWell(x),
                            beta: parameter,
                        }
                    )
                );
            }
            curves.potential = curve(doubleWell, -1.8, 1.8);
            break;
        }
        case "importance": {
            const points: Point[] = [],
                estimate: Point[] = [],
                uniform: Point[] = [];
            let sum = 0,
                uniformSum = 0;
            for (let n = 0; n <= MOTION_STEPS; n++) {
                const u = random(),
                    x = inverseCDF((y) => mixtureCDF(y, parameter), u),
                    f = 6 * x * (1 - x),
                    weight = f / mixtureDensity(x, parameter);
                points.push([x, f]);
                sum += weight;
                uniformSum += 6 * u * (1 - u);
                estimate.push([n + 1, sum / (n + 1)]);
                uniform.push([n + 1, uniformSum / (n + 1)]);
                frames.push(
                    frame(
                        { samples: [...points], estimate: [...estimate], uniform: [...uniform] },
                        { sample: n + 1, x, u, weight, estimate: sum / (n + 1), mix: parameter }
                    )
                );
            }
            curves.integrand = curve((x) => 6 * x * (1 - x), 0, 1);
            curves.proposal = curve((x) => mixtureDensity(x, parameter), 0, 1);
            break;
        }
        case "memory": {
            const trace: Point[] = [],
                white: Point[] = [];
            let x = normalDraw(random);
            const normalisation = Math.sqrt(1 - parameter * parameter);
            for (let n = 0; n <= MOTION_STEPS; n++) {
                const noise = normalDraw(random);
                if (n) x = parameter * x + normalisation * noise;
                trace.push([n, x]);
                white.push([n, noise]);
                const M = n + 1,
                    sd = Math.sqrt(finiteVarianceFactor(M, (k) => parameter ** k) / M);
                frames.push(
                    frame(
                        { trace: [...trace], white: [...white] },
                        {
                            samples: M,
                            sd,
                            independentSd: 1 / Math.sqrt(M),
                            g: (1 + parameter) / (1 - parameter),
                            mean: trace.reduce((s, p) => s + p[1], 0) / M,
                            a: parameter,
                        }
                    )
                );
            }
            curves.correlation = curve((k) => parameter ** Math.round(k), 0, 20, 21);
            break;
        }
        case "shells": {
            // Independent points uniformly distributed in a 3D unit ball, viewed in orthographic projection.
            const points3D = Array.from({ length: 180 }, () => {
                const r = Math.cbrt(random()),
                    z = 2 * random() - 1,
                    theta = TAU * random();
                return [r * Math.sqrt(1 - z * z) * Math.cos(theta), r * Math.sqrt(1 - z * z) * Math.sin(theta), r * z];
            });
            const all = points3D.map((p) => [p[0], p[1]] as Point),
                density = points3D.length / ((4 * Math.PI) / 3);
            const histogram: Point[] = [];
            for (const r of linspace(0.05, 1 - parameter, 121)) {
                const selected = points3D.filter((p) => {
                    const d = Math.hypot(...p);
                    return d >= r && d < r + parameter;
                });
                const volume = ((4 * Math.PI) / 3) * ((r + parameter) ** 3 - r ** 3),
                    g = selected.length / (density * volume);
                histogram.push([r, g]);
                frames.push(
                    frame(
                        {
                            particles: all,
                            selected: selected.map((p) => [p[0], p[1]] as Point),
                            histogram: [...histogram],
                        },
                        { r, width: parameter, volume, count: selected.length, density, g }
                    )
                );
            }
            break;
        }
        case "ising": {
            const size = 12,
                local = initialSpins(size),
                collective = [...local],
                localRandom = seededRandom(123),
                clusterRandom = seededRandom(123);
            let localWork = 0,
                clusterWork = 0;
            for (let n = 0; n <= MOTION_STEPS; n++) {
                let changed: number[] = [];
                if (n) {
                    // Equal-sized batches are display frames, not equal amounts of computational work.
                    for (let k = 0; k < 12; k++) {
                        const site = Math.floor(localRandom() * local.length),
                            delta = 2 * local[site] * periodicNeighbours(site, size).reduce((s, j) => s + local[j], 0);
                        if (localRandom() < metropolisAcceptance(parameter, delta)) local[site] *= -1;
                        localWork++;
                    }
                    const cluster = growWolff(
                        collective,
                        size,
                        parameter,
                        clusterRandom,
                        Math.floor(clusterRandom() * local.length)
                    );
                    changed = cluster.active;
                    changed.forEach((i) => (collective[i] *= -1));
                    clusterWork += changed.length;
                }
                frames.push({
                    ...frame(
                        {},
                        {
                            localM: magnetisation(local),
                            clusterM: magnetisation(collective),
                            localWork,
                            clusterWork,
                            size,
                            beta: parameter,
                            update: n,
                        }
                    ),
                    spins: [...local],
                    secondSpins: [...collective],
                    active: changed,
                });
            }
            break;
        }
        case "cluster": {
            const size = 12,
                spins = initialSpins(size),
                cluster = growWolff(spins, size, parameter, random, 26),
                maxDepth = Math.max(...cluster.depth.values());
            for (let n = 0; n <= MOTION_STEPS; n++) {
                const depth = Math.floor((n / 100) * (maxDepth + 1)),
                    active = cluster.active.filter((i) => cluster.depth.get(i)! <= depth),
                    current = [...spins];
                if (n >= 110) cluster.active.forEach((i) => (current[i] *= -1));
                frames.push({
                    ...frame(
                        {},
                        {
                            size,
                            discovered: active.length,
                            fullSize: cluster.active.length,
                            p: -Math.expm1(-2 * parameter),
                            flipped: Number(n >= 110),
                            depth,
                            beta: parameter,
                        }
                    ),
                    spins: current,
                    bonds: cluster.bonds.filter(([i, j]) => active.includes(i) && active.includes(j)),
                    active,
                });
            }
            break;
        }
        case "lifting": {
            const size = 32,
                rw = seededRandom(12),
                lift = seededRandom(12),
                reversible: Point[] = [[0, 0]],
                persistent: Point[] = [[0, 0]],
                rVisited = new Set([0]),
                lVisited = new Set([0]);
            let r = 0,
                l = 0,
                direction = 1;
            for (let n = 0; n <= MOTION_STEPS; n++) {
                if (n) {
                    const u = rw();
                    r += u < 0.1 ? 0 : u < 0.55 ? -1 : 1;
                    const v = lift();
                    if (v < parameter) direction *= -1;
                    else if (v >= parameter + 0.1) l += direction;
                }
                const rp = ((r % size) + size) % size,
                    lp = ((l % size) + size) % size;
                rVisited.add(rp);
                lVisited.add(lp);
                reversible.push([n, r]);
                persistent.push([n, l]);
                frames.push(
                    frame(
                        { reversible: [...reversible], persistent: [...persistent] },
                        {
                            size,
                            r: rp,
                            l: lp,
                            direction,
                            rVisited: rVisited.size,
                            lVisited: lVisited.size,
                            refresh: parameter,
                            step: n,
                        }
                    )
                );
            }
            break;
        }
        case "hazard": {
            const a = Math.sqrt(2 * parameter),
                trail: Point[] = [],
                hazards: Point[] = [];
            for (const s of linspace(0, 6 * a)) {
                // The first flight goes uphill; each subsequent flight first goes downhill, then uphill.
                let i: number, j: number, active: number, local: number;
                if (s < a) {
                    i = s;
                    j = 0;
                    active = 0;
                    local = s;
                } else {
                    const cycle = Math.floor((s - a) / (2 * a)),
                        flight = (s - a) % (2 * a);
                    active = (cycle + 1) % 2;
                    local = Math.max(0, flight - a);
                    const fixed = (cycle + 1) * a,
                        moving = cycle * a + flight;
                    i = active === 0 ? moving : fixed;
                    j = active === 1 ? moving : fixed;
                }
                const gap = i - j,
                    energy = (gap * gap) / 2,
                    hazard = (local * local) / 2;
                trail.push([s, energy]);
                hazards.push([s, hazard]);
                frames.push(
                    frame(
                        {
                            particles: [
                                [i, 0],
                                [j, 0],
                            ],
                            energy: [...trail],
                            hazard: [...hazards],
                        },
                        { i, j, active, gap, energy, hazard, threshold: parameter, displacement: s, eventDistance: a }
                    )
                );
            }
            break;
        }
        case "kernels": {
            for (const phase of linspace(0, TAU)) {
                const spacing = 0.42 + 0.2 * Math.cos(phase),
                    particles: Point[] = [-2, -1, 0, 1, 2].map((i) => [i * spacing, 0]),
                    layers: MotionFrame["layers"] = { particles };
                particles.forEach(([x], i) => {
                    layers[`kernel${i}`] = curve((y) => cubicKernel(y - x, parameter), -2.7, 2.7);
                });
                layers.density = curve(
                    (y) => particles.reduce((s, [x]) => s + cubicKernel(y - x, parameter), 0),
                    -2.7,
                    2.7
                );
                frames.push(
                    frame(layers, {
                        phase,
                        spacing,
                        mass: 5,
                        h: parameter,
                        peak: particles.reduce((s, [x]) => s + cubicKernel(-x, parameter), 0),
                    })
                );
            }
            break;
        }
        case "pressure": {
            const h = 0.65,
                massI = 1,
                massJ = parameter;
            for (const phase of linspace(0, TAU)) {
                const r = 0.78 - 0.45 * Math.cos(phase),
                    rhoI = massI * cubicKernel(0, h) + massJ * cubicKernel(r, h),
                    rhoJ = massJ * cubicKernel(0, h) + massI * cubicKernel(r, h),
                    pressureI = rhoI - 0.7,
                    pressureJ = rhoJ - 0.7;
                const forceI =
                        -massI * massJ * (pressureI / rhoI ** 2 + pressureJ / rhoJ ** 2) * cubicKernelGradient(-r, h),
                    forceJ = -forceI;
                frames.push(
                    frame(
                        {
                            particles: [
                                [-r / 2, 0],
                                [r / 2, 0],
                            ],
                            density: curve(
                                (x) => massI * cubicKernel(x + r / 2, h) + massJ * cubicKernel(x - r / 2, h),
                                -2,
                                2
                            ),
                        },
                        {
                            r,
                            rhoI,
                            rhoJ,
                            pressureI,
                            pressureJ,
                            forceI,
                            forceJ,
                            accelerationI: forceI / massI,
                            accelerationJ: forceJ / massJ,
                            massJ,
                        }
                    )
                );
            }
            break;
        }
        case "landscape": {
            curves.potential = curve(doubleWell, -1.7, 1.7);
            curves.free = curve((x) => valleyFreeEnergy(x, parameter), -1.7, 1.7);
            for (const progress of linspace(0, 1)) {
                const x = -1.5 + 3 * progress,
                    width = widthOfValley(x),
                    ys = linspace(-2 * width, 2 * width, 31);
                frames.push(
                    frame(
                        {
                            crossSection: ys.map((y) => [y, doubleWell(x) + (y * y) / (2 * width * width)]),
                            dots: ys
                                .filter((_, i) => i % 3 === 0)
                                .map((y) => [y, doubleWell(x) + (y * y) / (2 * width * width)]),
                        },
                        {
                            x,
                            width,
                            potential: doubleWell(x),
                            free: valleyFreeEnergy(x, parameter),
                            entropy: Math.log(width),
                            temperature: parameter,
                        }
                    )
                );
            }
            break;
        }
        case "umbrella": {
            const xs = linspace(-1.8, 1.8, 161),
                beta = 4,
                base = normalisedWeights(xs.map((x) => -beta * doubleWell(x))),
                dx = xs[1] - xs[0];
            curves.target = xs.map((x, i) => [x, base[i] / dx]);
            for (const centre of linspace(-1.3, 1.3)) {
                const bias = (x: number) => (parameter * (x - centre) ** 2) / 2,
                    biased = normalisedWeights(xs.map((x) => -beta * (doubleWell(x) + bias(x)))),
                    weights = biased.map((p, i) => p * Math.exp(beta * bias(xs[i]))),
                    sum = weights.reduce((a, b) => a + b, 0);
                const samples = Array.from({ length: 36 }, (_, k) => {
                    const u = (k + 0.5) / 36;
                    let total = 0,
                        i = 0;
                    while (i < biased.length - 1 && total + biased[i] < u) {
                        total += biased[i];
                        i++;
                    }
                    return [xs[i], 0.07 + 0.035 * (k % 3)] as Point;
                });
                frames.push(
                    frame(
                        {
                            biased: xs.map((x, i) => [x, biased[i] / dx]),
                            corrected: xs.map((x, i) => [x, weights[i] / sum / dx]),
                            particles: samples,
                        },
                        { centre, stiffness: parameter, beta, maxWeight: Math.max(...weights), normaliser: sum }
                    )
                );
            }
            break;
        }
    }
    return { kind, parameter, frames, curves, metadata };
}

/** Presentation interpolation between computed snapshots; it never advances a numerical solver. */
export function motionFrame(data: MotionData, progress: number, discrete = false): MotionFrame {
    const at = Math.max(0, Math.min(1, progress)) * (data.frames.length - 1),
        index = Math.floor(at),
        a = data.frames[index],
        b = data.frames[Math.min(index + 1, data.frames.length - 1)],
        t = at - index;
    if (discrete || t === 0) return a;
    const metrics = Object.fromEntries(
        Object.entries(a.metrics).map(([key, value]) => [
            key,
            ["active", "accepted", "flipped", "count"].includes(key) ? value : value + t * (b.metrics[key] - value),
        ])
    );
    const layers = Object.fromEntries(
        Object.entries(a.layers).map(([key, points]) => {
            const next = b.layers[key];
            if (next?.length === points.length)
                return [key, points.map(([x, y], i) => [x + t * (next[i][0] - x), y + t * (next[i][1] - y)] as Point)];
            if (next?.length === points.length + 1 && points.length) {
                const p = points[points.length - 1],
                    q = next[next.length - 1];
                return [key, [...points, [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])] as Point]];
            }
            return [key, points];
        })
    );
    // Evaluate analytic geometry at the displayed time, avoiding chord-induced energy changes.
    if (data.kind === "thermal") {
        const time = 20 * progress,
            population = thermalPopulation(data.parameter, time);
        Object.assign(metrics, population, { time });
        layers.particles = Array.from({ length: 60 }, (_, i) => {
            const q = (i + 0.5) / 60;
            return [i % 12, 1 / (1 + Math.exp((q - population.excited) * 120)) + 0.035 * Math.sin(i * 1.7)];
        });
    }
    if (data.kind === "phase") {
        const time = TAU * Math.max(0, Math.min(1, progress));
        for (const key of ["microcanonical", "canonical"])
            layers[key] = data.frames[0].layers[key].map(([x, p]) => [
                x * Math.cos(time) - p * Math.sin(time),
                x * Math.sin(time) + p * Math.cos(time),
            ]);
        metrics.time = time;
    }
    if (data.kind === "spins") {
        metrics.theta = TAU * progress;
        metrics.energy = -data.parameter * Math.cos(metrics.theta);
        metrics.torque = -data.parameter * Math.sin(metrics.theta);
    }
    if (data.kind === "forces") {
        metrics.r = 1.88 - 0.92 * Math.cos(TAU * progress);
        Object.assign(metrics, lennardJones(metrics.r, data.parameter));
        layers.particles = [
            [-metrics.r / 2, 0],
            [metrics.r / 2, 0],
        ];
    }
    if (data.kind === "langevin") {
        metrics.mean = 2 * Math.exp(-metrics.time);
        metrics.variance = data.parameter * (1 - Math.exp(-2 * metrics.time));
    }
    if (data.kind === "landscape") {
        metrics.x = -1.5 + 3 * progress;
        metrics.width = widthOfValley(metrics.x);
        metrics.potential = doubleWell(metrics.x);
        metrics.free = valleyFreeEnergy(metrics.x, data.parameter);
        metrics.entropy = Math.log(metrics.width);
        layers.crossSection = linspace(-2 * metrics.width, 2 * metrics.width, 31).map((y) => [
            y,
            metrics.potential + (y * y) / (2 * metrics.width ** 2),
        ]);
        layers.dots = layers.crossSection.filter((_, i) => i % 3 === 0);
    }
    return { ...a, layers, metrics };
}
export function projectEnergySurface(x: number, y: number, energy: number): Point {
    return [150 + 49 * x + 28 * y, 165 + 13 * x - 18 * y - 22 * energy];
}
export function energySurfaceMesh(): Point[][] {
    const meshes: Point[][] = [];
    for (const q of linspace(-2, 2, 9))
        meshes.push(
            linspace(-1.6, 1.6, 65).map((x) =>
                projectEnergySurface(x, q * widthOfValley(x), doubleWell(x) + (q * q) / 2)
            )
        );
    for (const x of linspace(-1.6, 1.6, 13))
        meshes.push(
            linspace(-2, 2, 25).map((q) => projectEnergySurface(x, q * widthOfValley(x), doubleWell(x) + (q * q) / 2))
        );
    return meshes;
}
