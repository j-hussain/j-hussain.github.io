import type { ReactNode } from "react";
import {
    energySurfaceMesh,
    motionFrame,
    projectEnergySurface,
    type MotionData,
    type MotionFrame,
    type MotionKind,
    type Point,
} from "./animation-math";
import styles from "./animations.module.css";

const TAU = 2 * Math.PI;
const ink = "currentColor",
    teal = "var(--sci-accent)",
    amber = "var(--sci-secondary)";
const f = (n: number) => Number(n.toFixed(3));
const format = (n: number, digits = 2) => (Number.isFinite(n) ? n.toFixed(digits) : "unavailable");
function Line({
    points,
    colour = teal,
    dash,
    width = 2.2,
    opacity = 1,
}: {
    points: readonly Point[];
    colour?: string;
    dash?: string;
    width?: number;
    opacity?: number;
}) {
    return (
        <path
            d={points.map(([x, y], i) => `${i ? "L" : "M"}${f(x)},${f(y)}`).join(" ")}
            fill="none"
            stroke={colour}
            strokeWidth={width}
            strokeDasharray={dash}
            opacity={opacity}
            strokeLinejoin="round"
            strokeLinecap="round"
        />
    );
}
function Arrow({ from, to, colour = teal, width = 2 }: { from: Point; to: Point; colour?: string; width?: number }) {
    const dx = to[0] - from[0],
        dy = to[1] - from[1],
        length = Math.hypot(dx, dy);
    if (length < 0.1) return <circle cx={from[0]} cy={from[1]} r="2" fill={colour} />;
    const ux = dx / length,
        uy = dy / length;
    return (
        <g>
            <Line points={[from, to]} colour={colour} width={width} />
            <path
                d={`M${f(to[0] - 7 * ux + 3.5 * uy)},${f(to[1] - 7 * uy - 3.5 * ux)}L${f(to[0])},${f(to[1])}L${f(to[0] - 7 * ux - 3.5 * uy)},${f(to[1] - 7 * uy + 3.5 * ux)}`}
                fill="none"
                stroke={colour}
                strokeWidth={width}
            />
        </g>
    );
}
function Dot({
    point,
    colour = teal,
    radius = 4,
    hollow = false,
    opacity = 1,
}: {
    point: Point;
    colour?: string;
    radius?: number;
    hollow?: boolean;
    opacity?: number;
}) {
    return (
        <circle
            cx={f(point[0])}
            cy={f(point[1])}
            r={f(radius)}
            fill={hollow ? "var(--background-color)" : colour}
            stroke={colour}
            strokeWidth={hollow ? 1.5 : 0}
            opacity={opacity}
        />
    );
}
const text = (x: number, y: number, label: ReactNode, anchor: "start" | "middle" | "end" = "start") => (
    <text x={x} y={y} textAnchor={anchor}>
        {label}
    </text>
);
interface Scale {
    x: (v: number) => number;
    y: (v: number) => number;
    point: (p: Point) => Point;
}
function scale(xmin: number, xmax: number, ymin: number, ymax: number): Scale {
    const x = (v: number) => 43 + (232 * (v - xmin)) / (xmax - xmin),
        y = (v: number) => 192 - (148 * (v - ymin)) / (ymax - ymin);
    return { x, y, point: (p) => [x(p[0]), y(p[1])] };
}
function Axes({
    s,
    xmin,
    xmax,
    ymin,
    ymax,
    xLabel,
    yLabel,
}: {
    s: Scale;
    xmin: number;
    xmax: number;
    ymin: number;
    ymax: number;
    xLabel: string;
    yLabel: string;
}) {
    return (
        <g className={styles.axes}>
            {[0.25, 0.5, 0.75, 1].map((q) => (
                <Line
                    key={q}
                    points={[
                        [43, 192 - 148 * q],
                        [275, 192 - 148 * q],
                    ]}
                    colour={ink}
                    opacity={0.09}
                    width={1}
                />
            ))}
            <Line
                points={[
                    [43, 39],
                    [43, 192],
                    [275, 192],
                ]}
                colour={ink}
                width={1}
            />
            {ymin < 0 && ymax > 0 && (
                <Line
                    points={[
                        [43, s.y(0)],
                        [275, s.y(0)],
                    ]}
                    colour={ink}
                    opacity={0.3}
                    dash="3 5"
                    width={1}
                />
            )}
            {text(43, 22, yLabel)}
            {text(159, 234, xLabel, "middle")}
            {text(43, 213, String(f(xmin)), "middle")}
            {text(275, 213, String(f(xmax)), "middle")}
            {text(35, 196, String(f(ymin)), "end")}
            {text(35, 48, String(f(ymax)), "end")}
        </g>
    );
}
function Plot({
    xrange,
    yrange,
    xLabel,
    yLabel,
    children,
}: {
    xrange: [number, number];
    yrange: [number, number];
    xLabel: string;
    yLabel: string;
    children: (s: Scale) => ReactNode;
}) {
    const s = scale(...xrange, ...yrange);
    return (
        <>
            <Axes
                s={s}
                xmin={xrange[0]}
                xmax={xrange[1]}
                ymin={yrange[0]}
                ymax={yrange[1]}
                xLabel={xLabel}
                yLabel={yLabel}
            />
            {children(s)}
        </>
    );
}
function Picture({ label, children }: { label: string; children: ReactNode }) {
    return (
        <svg className={styles.svg} viewBox="0 0 300 245" role="img" aria-label={label}>
            {children}
        </svg>
    );
}
function Grid({
    spins,
    active = [],
    bonds = [],
    size = 12,
}: {
    spins: readonly number[];
    active?: number[];
    bonds?: readonly (readonly [number, number])[];
    size?: number;
}) {
    const cell = 216 / size,
        selected = new Set(active),
        position = (i: number): Point => [42 + ((i % size) + 0.5) * cell, 10 + (Math.floor(i / size) + 0.5) * cell];
    return (
        <g>
            {spins.map((spin, i) => {
                const [x, y] = position(i);
                return (
                    <g key={i}>
                        <rect
                            x={x - cell / 2 + 1}
                            y={y - cell / 2 + 1}
                            width={cell - 2}
                            height={cell - 2}
                            rx="2"
                            fill={spin > 0 ? teal : amber}
                            fillOpacity={selected.has(i) ? 0.52 : 0.18}
                            stroke={selected.has(i) ? teal : "none"}
                            strokeWidth="1.5"
                        />
                        {spin > 0 ? (
                            <path d={`M${x - 3},${y}h6M${x},${y - 3}v6`} stroke={teal} strokeWidth="1.2" />
                        ) : (
                            <path d={`M${x - 3},${y}h6`} stroke={amber} strokeWidth="1.2" />
                        )}
                    </g>
                );
            })}
            {bonds.map(([i, j], k) =>
                Math.abs((i % size) - (j % size)) + Math.abs(Math.floor(i / size) - Math.floor(j / size)) === 1 ? (
                    <Line key={k} points={[position(i), position(j)]} width={2.5} />
                ) : (
                    <g key={k}>
                        <Dot point={position(i)} radius={3} hollow />
                        <Dot point={position(j)} radius={3} hollow />
                    </g>
                )
            )}
        </g>
    );
}
export function motionReadout(kind: MotionKind, m: MotionFrame["metrics"]): string {
    switch (kind) {
        case "thermal":
            return `Excited probability ${format(m.excited, 3)}; equilibrium ${format(m.equilibrium, 3)}; upward flux ${format(m.upFlux, 3)}, downward flux ${format(m.downFlux, 3)}.`;
        case "phase":
            return `β = ${format(1 / m.temperature)}; fixed NVE energy ${format(m.meanEnergy)}; canonical mean energy ${format(m.meanEnergy)}.`;
        case "forces":
            return `Separation ${format(m.r)}σ; energy ${format(m.energy)}; radial force ${format(m.force)}.`;
        case "spins":
            return `Angle ${format((m.theta * 180) / Math.PI, 0)}°; energy ${format(m.energy)}; angular force ${format(m.torque)}.`;
        case "langevin":
            return `Time ${format(m.time)}; exact mean ${format(m.mean)}; exact transient variance ${format(m.variance)}.`;
        case "verlet":
            return `Time ${format(m.time)}; H = ${format(m.energy, 4)}; energy error ${format(m.error, 4)}.`;
        case "metropolis":
            return `Attempt ${format(m.attempt, 0)}: ${m.accepted ? "accepted" : "rejected"}; ΔU = ${format(m.delta)}; acceptance ${format(m.alpha, 3)}.`;
        case "importance":
            return `${format(m.sample, 0)} samples; latest weight ${format(m.weight, 3)}; integral estimate ${format(m.estimate, 3)}.`;
        case "memory":
            return `${format(m.samples, 0)} observations; mean standard deviation ${format(m.sd, 3)}; independent reference ${format(m.independentSd, 3)}.`;
        case "shells":
            return `${format(m.count, 0)} neighbours; shell volume ${format(m.volume, 3)}; g = ${format(m.g, 2)}.`;
        case "ising":
            return `Local m = ${format(m.localM)}, ${format(m.localWork, 0)} attempts; Wolff m = ${format(m.clusterM)}, ${format(m.clusterWork, 0)} flipped sites.`;
        case "cluster":
            return `${format(m.discovered, 0)} discovered sites; bond probability ${format(m.p, 3)}; ${m.flipped ? "completed cluster flipped" : "growth in progress"}.`;
        case "lifting":
            return `${format(m.step, 0)} updates; distinct ring sites: reversible ${format(m.rVisited, 0)}, lifted ${format(m.lVisited, 0)}.`;
        case "hazard":
            return `Active particle ${m.active === 0 ? "i" : "j"}; pair energy ${format(m.energy, 3)}; integrated hazard ${format(m.hazard, 3)} of threshold ${format(m.threshold, 2)}.`;
        case "kernels":
            return `Spacing ${format(m.spacing)}; peak density ${format(m.peak)}; represented total mass ${format(m.mass, 0)}.`;
        case "pressure":
            return `Forces ${format(m.forceI, 3)} and ${format(m.forceJ, 3)}; accelerations ${format(m.accelerationI, 3)} and ${format(m.accelerationJ, 3)}.`;
        case "landscape":
            return `x = ${format(m.x)}; transverse width ${format(m.width)}; potential floor ${format(m.potential)}, free energy ${format(m.free)} + constant.`;
        case "umbrella":
            return `Window centre ${format(m.centre)}; κ = ${format(m.stiffness)}; exact quadrature reweighting restores the reference density.`;
    }
}
export function AnimationScene({
    kind,
    data,
    progress,
    leftTitle,
    rightTitle,
}: {
    kind: MotionKind;
    data: MotionData;
    progress: number;
    leftTitle: string;
    rightTitle: string;
}) {
    const discrete = [
        "metropolis",
        "importance",
        "memory",
        "ising",
        "cluster",
        "shells",
        "lifting",
        "verlet",
        "hazard",
    ].includes(kind);
    const current = motionFrame(data, progress, discrete),
        { layers: L, metrics: m } = current;
    const pair = (a: ReactNode, b: ReactNode) => (
        <>
            <div>
                <div className={styles.panelTitle}>{leftTitle}</div>
                <Picture label={`${leftTitle}. ${motionReadout(kind, m)}`}>{a}</Picture>
            </div>
            <div>
                <div className={styles.panelTitle}>{rightTitle}</div>
                <Picture label={`${rightTitle}. ${motionReadout(kind, m)}`}>{b}</Picture>
            </div>
        </>
    );
    const extent =
        kind === "langevin"
            ? Math.ceil(Math.max(3, ...data.frames.flatMap((v) => v.layers.particles.map((p) => Math.abs(p[0])))))
            : kind === "memory"
              ? Math.ceil(
                    Math.max(
                        3,
                        ...[
                            ...data.frames[data.frames.length - 1].layers.trace,
                            ...data.frames[data.frames.length - 1].layers.white,
                        ].map((p) => Math.abs(p[1]))
                    )
                )
              : 4;
    const path = (points: Point[], s: Scale, colour = teal, dash?: string) => (
        <Line points={points.map(s.point)} colour={colour} dash={dash} />
    );
    switch (kind) {
        case "thermal":
            return pair(
                <g>
                    <Line
                        points={[
                            [26, 64],
                            [275, 64],
                        ]}
                        colour={amber}
                        opacity={0.5}
                    />
                    <Line
                        points={[
                            [26, 190],
                            [275, 190],
                        ]}
                        colour={teal}
                        opacity={0.5}
                    />
                    {text(26, 40, "excited level: four microstates")}
                    {text(26, 225, "ground level: one microstate")}
                    {L.particles.map(([x, y], i) => (
                        <Dot
                            key={i}
                            point={[36 + x * 20, 181 - y * 109 + (Math.floor(i / 12) - 2) * 11]}
                            colour={y > 0.5 ? amber : teal}
                            radius={3.8}
                        />
                    ))}
                    <Arrow from={[279, 96]} to={[279, 153]} colour={amber} />
                    {text(290, 127, "Δ", "middle")}
                </g>,
                <Plot xrange={[0, 20]} yrange={[0, 1]} xLabel="stochastic time" yLabel="excited probability">
                    {(s) => (
                        <>
                            {path(data.curves.excited, s)}
                            <Line
                                points={[
                                    [43, s.y(m.equilibrium)],
                                    [275, s.y(m.equilibrium)],
                                ]}
                                colour={amber}
                                dash="5 4"
                            />
                            <Dot point={s.point([m.time, m.excited])} radius={5} />
                            {text(64, 68, `p* = ${format(m.equilibrium, 3)}`)}
                            <Arrow from={[100, 157]} to={[100 + 100 * m.upFlux, 157]} />
                            <Arrow from={[230, 174]} to={[230 - 100 * m.downFlux, 174]} colour={amber} />
                        </>
                    )}
                </Plot>
            );
        case "phase": {
            const draw = (points: Point[], canonical: boolean) => (
                <g>
                    <Line
                        points={[
                            [20, 122],
                            [280, 122],
                        ]}
                        colour={ink}
                        opacity={0.25}
                    />
                    <Line
                        points={[
                            [150, 15],
                            [150, 230],
                        ]}
                        colour={ink}
                        opacity={0.25}
                    />
                    {text(277, 142, "x", "end")}
                    {text(160, 24, "p")}
                    {[1, 2, 3].map((r) => (
                        <circle
                            key={r}
                            cx="150"
                            cy="122"
                            r={r * 27}
                            stroke={ink}
                            fill="none"
                            opacity={0.1}
                            strokeDasharray="3 5"
                        />
                    ))}
                    {!canonical && (
                        <circle
                            cx="150"
                            cy="122"
                            r={Math.sqrt(2 * m.meanEnergy) * 27}
                            stroke={teal}
                            fill="none"
                            opacity={0.4}
                        />
                    )}
                    {points.map(([x, y], i) => (
                        <Dot
                            key={i}
                            point={[150 + x * 27, 122 - y * 27]}
                            colour={i === 0 ? amber : teal}
                            radius={i === 0 ? 5 : 2.8}
                            opacity={i === 0 ? 1 : 0.6}
                        />
                    ))}
                    {text(
                        150,
                        241,
                        canonical ? "different radii; energies fluctuate" : "one radius; every energy equal",
                        "middle"
                    )}
                </g>
            );
            return pair(draw(L.microcanonical, false), draw(L.canonical, true));
        }
        case "forces": {
            const first = 150 - (60 * m.r) / 2,
                second = 150 + (60 * m.r) / 2,
                arrow = 50 * Math.tanh(m.force / 4);
            return pair(
                <g>
                    {text(24, 28, "force direction (rescaled arrows)")}
                    <Line
                        points={[
                            [30, 130],
                            [275, 130],
                        ]}
                        colour={ink}
                        opacity={0.16}
                    />
                    <Line
                        points={[
                            [first, 130],
                            [second, 130],
                        ]}
                        colour={ink}
                        dash="3 5"
                        opacity={0.3}
                    />
                    <Dot point={[first, 130]} radius={13} />
                    <Dot point={[second, 130]} colour={amber} radius={13} />
                    <Arrow from={[first, 104]} to={[first - arrow, 104]} />
                    <Arrow from={[second, 104]} to={[second + arrow, 104]} colour={amber} />
                    {text(first, 167, "i", "middle")}
                    {text(second, 167, "j", "middle")}
                    {text(150, 207, `r = ${format(m.r)}σ`, "middle")}
                </g>,
                <Plot xrange={[0.96, 2.8]} yrange={[-2.2, 4]} xLabel="separation r / σ" yLabel="potential energy u">
                    {(s) => (
                        <>
                            {path(
                                data.curves.energy.map(([x, y]) => [x, y * m.epsilon]),
                                s
                            )}
                            <Dot point={s.point([m.r, m.energy])} radius={5} />
                            <Line points={[[s.x(m.r), 192], s.point([m.r, m.energy])]} colour={amber} dash="3 5" />
                            {text(125, 66, `Fᵣ = ${format(m.force)}`)}
                        </>
                    )}
                </Plot>
            );
        }
        case "spins":
            return pair(
                <g>
                    <circle cx="150" cy="122" r="80" fill="none" stroke={ink} strokeDasharray="3 5" opacity={0.2} />
                    <Arrow from={[150, 122]} to={[230, 122]} width={3} />
                    <Arrow
                        from={[150, 122]}
                        to={[150 + 80 * Math.cos(m.theta), 122 - 80 * Math.sin(m.theta)]}
                        colour={amber}
                        width={3}
                    />
                    <path
                        d={`M185,122 A35,35 0 ${m.theta > Math.PI ? 1 : 0} 0 ${f(150 + 35 * Math.cos(m.theta))},${f(122 - 35 * Math.sin(m.theta))}`}
                        stroke={ink}
                        fill="none"
                        opacity={0.5}
                    />
                    {text(150, 232, `θ = ${format((m.theta * 180) / Math.PI, 0)}°`, "middle")}
                    {text(
                        25,
                        26,
                        m.coupling >= 0 ? "J > 0 favours parallel spins" : "J < 0 favours antiparallel spins"
                    )}
                </g>,
                <Plot xrange={[0, 6.283]} yrange={[-1.7, 1.7]} xLabel="angle θ (radians)" yLabel="exchange energy">
                    {(s) => (
                        <>
                            {path(data.curves.energy, s)}
                            <Dot point={s.point([m.theta, m.energy])} radius={5} />
                            {text(150, 63, `τ = ${format(m.torque)}`)}
                        </>
                    )}
                </Plot>
            );
        case "langevin":
            return pair(
                <Plot xrange={[0, 9]} yrange={[-extent, extent]} xLabel="physical time" yLabel="position x">
                    {(s) => (
                        <>
                            {path(L.trace, s)}
                            {path(L.mean, s, amber, "5 4")}
                            <Dot point={s.point(L.trace[L.trace.length - 1])} radius={4} />
                        </>
                    )}
                </Plot>,
                <Plot
                    xrange={[-extent, extent]}
                    yrange={[0, 1]}
                    xLabel="position x"
                    yLabel="equilibrium reference density"
                >
                    {(s) => (
                        <>
                            {path(data.curves.stationary, s, amber, "5 4")}
                            {L.particles.map(([x, i]) => (
                                <Dot key={i} point={[s.x(x), 182 - (i % 7) * 7]} radius={2.5} opacity={0.7} />
                            ))}
                            <Line
                                points={[
                                    [s.x(m.mean), 45],
                                    [s.x(m.mean), 192],
                                ]}
                                colour={teal}
                                dash="3 5"
                            />
                        </>
                    )}
                </Plot>
            );
        case "verlet": {
            const position = ([x, v]: Point): Point => [150 + 70 * x, 122 - 70 * v];
            return pair(
                <g>
                    <Line
                        points={[
                            [48, 122],
                            [253, 122],
                        ]}
                        colour={ink}
                        opacity={0.25}
                    />
                    <Line
                        points={[
                            [150, 20],
                            [150, 224],
                        ]}
                        colour={ink}
                        opacity={0.25}
                    />
                    {text(264, 127, "x")}
                    {text(160, 26, "v")}
                    {text(220, 143, "1", "middle")}
                    {text(80, 143, "−1", "middle")}
                    {text(141, 56, "1", "end")}
                    {text(141, 198, "−1", "end")}
                    <Line points={data.curves.circle.map(position)} colour={amber} dash="4 4" />
                    <Line points={L.orbit.map(position)} />
                    <Dot point={position([m.x, m.v])} radius={5} />
                    <Dot point={position(L.exact[0])} colour={amber} hollow radius={5} />
                    {text(150, 241, "equal scales on both phase axes", "middle")}
                </g>,
                <Plot xrange={[0, 120]} yrange={[0, 0.55]} xLabel="computed update n" yLabel="numerical energy H">
                    {(s) => (
                        <>
                            <Line
                                points={[
                                    [43, s.y(0.5)],
                                    [275, s.y(0.5)],
                                ]}
                                colour={amber}
                                dash="4 4"
                            />
                            {path(L.energy, s)}
                            <Dot point={s.point(L.energy[L.energy.length - 1])} />
                            {text(85, 75, `Δt = ${format(m.dt)}`)}
                        </>
                    )}
                </Plot>
            );
        }
        case "metropolis":
            return pair(
                <Plot xrange={[-3, 3]} yrange={[0, 5.2]} xLabel="configuration x" yLabel="potential U(x)">
                    {(s) => (
                        <>
                            {path(data.curves.potential, s, ink)}
                            <Line
                                points={L.proposal.map(([x, y]) => s.point([x, Math.min(5, y)]))}
                                colour={amber}
                                dash="4 4"
                            />
                            <Dot
                                point={s.point([m.proposal, Math.min(5, L.proposal[1][1])])}
                                colour={amber}
                                hollow
                                radius={5}
                            />
                            <Dot point={s.point([m.x, m.energy])} radius={6} />
                            {text(65, 68, m.accepted ? "proposal accepted" : "proposal rejected")}
                            {L.proposal[1][1] > 5 && text(65, 90, "proposal above plot; see ΔU")}
                        </>
                    )}
                </Plot>,
                <Plot
                    xrange={[0, 121]}
                    yrange={[-2.5, 2.5]}
                    xLabel="attempt (including rejection)"
                    yLabel="recorded position"
                >
                    {(s) => (
                        <>
                            {path(L.trace, s)}
                            <Dot point={s.point([m.attempt, m.x])} radius={4} />
                        </>
                    )}
                </Plot>
            );
        case "importance":
            return pair(
                <Plot
                    xrange={[0, 1]}
                    yrange={[0, 1.7]}
                    xLabel="sample position x"
                    yLabel="integrand / proposal density"
                >
                    {(s) => (
                        <>
                            {path(data.curves.integrand, s, ink)}
                            {path(data.curves.proposal, s, amber, "4 4")}
                            {L.samples.slice(-35).map(([x], i) => (
                                <Dot key={i} point={[s.x(x), 185 - (i % 4) * 6]} radius={2.6} opacity={0.7} />
                            ))}
                            {text(115, 69, "solid: integrand")}
                            {text(115, 88, "dashed: proposal")}
                        </>
                    )}
                </Plot>,
                <Plot xrange={[0, 121]} yrange={[0, 1.7]} xLabel="number of samples" yLabel="estimated integral">
                    {(s) => (
                        <>
                            <Line
                                points={[
                                    [43, s.y(1)],
                                    [275, s.y(1)],
                                ]}
                                colour={ink}
                                opacity={0.3}
                                dash="2 5"
                            />
                            {path(L.uniform, s, amber, "4 4")}
                            {path(L.estimate, s)}
                            <Dot point={s.point([m.sample, m.estimate])} radius={4} />
                            {text(100, 65, "teal: importance")}
                            {text(100, 84, "dashed: uniform")}
                        </>
                    )}
                </Plot>
            );
        case "memory":
            return pair(
                <Plot xrange={[0, 120]} yrange={[-extent, extent]} xLabel="observation n" yLabel="stationary value">
                    {(s) => (
                        <>
                            {path(L.white, s, amber, "3 4")}
                            {path(L.trace, s)}
                            <Dot point={s.point(L.trace[L.trace.length - 1])} />
                        </>
                    )}
                </Plot>,
                <g>
                    <Line
                        points={[
                            [40, 118],
                            [276, 118],
                        ]}
                        colour={ink}
                        opacity={0.25}
                    />
                    {text(40, 23, "distribution of the sample mean")}
                    {[
                        { sd: m.sd, y: 87, c: teal, label: "correlated" },
                        { sd: m.independentSd, y: 155, c: amber, label: "independent" },
                    ].map(({ sd, y, c, label }) => (
                        <g key={label}>
                            <Line
                                points={[
                                    [150 - 1.96 * sd * 47, y],
                                    [150 + 1.96 * sd * 47, y],
                                ]}
                                colour={c}
                                width={5}
                            />
                            <Line
                                points={[
                                    [150 - 1.96 * sd * 47, y - 9],
                                    [150 - 1.96 * sd * 47, y + 9],
                                ]}
                                colour={c}
                            />
                            <Line
                                points={[
                                    [150 + 1.96 * sd * 47, y - 9],
                                    [150 + 1.96 * sd * 47, y + 9],
                                ]}
                                colour={c}
                            />
                            {text(150, y - 18, label, "middle")}
                        </g>
                    ))}
                    <Line
                        points={[
                            [150, 43],
                            [150, 180],
                        ]}
                        colour={ink}
                        opacity={0.35}
                        dash="3 4"
                    />
                    {text(150, 214, "bands: ±1.96 × exact mean SD", "middle")}
                    {text(150, 239, `M = ${format(m.samples, 0)}`, "middle")}
                </g>
            );
        case "shells": {
            const ymax = Math.max(3, ...data.frames.map((v) => v.metrics.g)) * 1.05;
            return pair(
                <g>
                    <circle cx="150" cy="122" r="98" fill="none" stroke={ink} opacity={0.2} />
                    <circle cx="150" cy="122" r={(m.r + m.width) * 98} fill="none" stroke={amber} opacity={0.4} />
                    <circle
                        cx="150"
                        cy="122"
                        r={m.r * 98}
                        fill="none"
                        stroke={amber}
                        strokeDasharray="4 4"
                        opacity={0.6}
                    />
                    {L.particles.map(([x, y], i) => (
                        <Dot key={i} point={[150 + x * 98, 122 - y * 98]} colour={ink} radius={1.9} opacity={0.22} />
                    ))}
                    {L.selected.map(([x, y], i) => (
                        <Dot key={i} point={[150 + x * 98, 122 - y * 98]} colour={teal} radius={3} />
                    ))}
                    <Dot point={[150, 122]} colour={amber} radius={4} />
                    {text(150, 238, "projection; selection uses 3D distance", "middle")}
                </g>,
                <Plot
                    xrange={[0.05, 1 - m.width]}
                    yrange={[0, Number(ymax.toFixed(1))]}
                    xLabel="shell inner radius r"
                    yLabel="normalised neighbour density g"
                >
                    {(s) => (
                        <>
                            <Line
                                points={[
                                    [43, s.y(1)],
                                    [275, s.y(1)],
                                ]}
                                colour={amber}
                                dash="5 4"
                            />
                            {path(L.histogram, s)}
                            <Dot point={s.point([m.r, m.g])} />
                            {text(95, 66, "ideal-gas expectation: 1")}
                        </>
                    )}
                </Plot>
            );
        }
        case "ising":
            return pair(<Grid spins={current.spins!} />, <Grid spins={current.secondSpins!} active={current.active} />);
        case "cluster":
            return pair(
                <Grid spins={current.spins!} active={current.active} bonds={current.bonds} />,
                <g>
                    {text(24, 32, "discovered component")}
                    <circle cx="150" cy="123" r="70" fill="none" stroke={ink} strokeWidth="2" opacity={0.12} />
                    <circle
                        cx="150"
                        cy="123"
                        r="70"
                        fill="none"
                        stroke={teal}
                        strokeWidth="5"
                        pathLength="100"
                        strokeDasharray={`${(100 * m.discovered) / m.fullSize} 100`}
                        transform="rotate(-90 150 123)"
                    />
                    <text x="150" y="123" textAnchor="middle" className={styles.bigNumber}>
                        {format(m.discovered, 0)}
                    </text>
                    {text(150, 148, `of ${format(m.fullSize, 0)} sites`, "middle")}
                    {text(
                        150,
                        222,
                        m.flipped ? "whole component flipped" : "frontier grows through accepted bonds",
                        "middle"
                    )}
                </g>
            );
        case "lifting": {
            const end = data.frames[data.frames.length - 1],
                extent =
                    Math.max(20, ...[...end.layers.reversible, ...end.layers.persistent].map((p) => Math.abs(p[1]))) *
                    1.1;
            const spot = (site: number, r: number): Point => [
                150 + r * Math.cos((TAU * site) / m.size - Math.PI / 2),
                122 + r * Math.sin((TAU * site) / m.size - Math.PI / 2),
            ];
            return pair(
                <g>
                    {Array.from({ length: 32 }, (_, i) => (
                        <g key={i}>
                            <Dot point={spot(i, 91)} colour={ink} radius={1.6} opacity={0.25} />
                            <Dot point={spot(i, 62)} colour={ink} radius={1.6} opacity={0.25} />
                        </g>
                    ))}
                    <circle cx="150" cy="122" r="91" fill="none" stroke={amber} opacity={0.25} />
                    <circle cx="150" cy="122" r="62" fill="none" stroke={teal} opacity={0.25} />
                    <Dot point={spot(m.r, 91)} colour={amber} radius={6} />
                    <Dot point={spot(m.l, 62)} radius={6} />
                    {text(150, 110, "inner: lifted", "middle")}
                    {text(150, 134, `direction ${m.direction > 0 ? "+1" : "−1"}`, "middle")}
                    {text(150, 238, "outer: reversible random walk", "middle")}
                </g>,
                <Plot
                    xrange={[0, 120]}
                    yrange={[-Math.ceil(extent), Math.ceil(extent)]}
                    xLabel="kernel updates"
                    yLabel="unwrapped displacement"
                >
                    {(s) => (
                        <>
                            {path(L.reversible, s, amber, "4 4")}
                            {path(L.persistent, s)}
                            <Dot point={s.point(L.persistent[L.persistent.length - 1])} />
                        </>
                    )}
                </Plot>
            );
        }
        case "hazard": {
            const centre = (m.i + m.j) / 2,
                pi: Point = [150 + (m.i - centre) * 70, 125],
                pj: Point = [150 + (m.j - centre) * 70, 125],
                active = m.active === 0 ? pi : pj;
            return pair(
                <g>
                    {text(25, 28, "frame follows the pair midpoint")}
                    <Line
                        points={[
                            [30, 125],
                            [275, 125],
                        ]}
                        colour={ink}
                        opacity={0.2}
                    />
                    <Line points={[pi, pj]} colour={ink} dash="3 5" />
                    <Dot point={pi} colour={m.active === 0 ? teal : amber} radius={m.active === 0 ? 11 : 7} />
                    <Dot point={pj} colour={m.active === 1 ? teal : amber} radius={m.active === 1 ? 11 : 7} />
                    <Arrow from={[active[0], 92]} to={[active[0] + 40, 92]} />
                    {text(pi[0], 159, "i", "middle")}
                    {text(pj[0], 179, "j", "middle")}
                    {text(150, 220, `active: ${m.active === 0 ? "i" : "j"}; separation ${format(m.gap)}`, "middle")}
                </g>,
                <Plot
                    xrange={[0, 6 * m.eventDistance]}
                    yrange={[0, m.threshold * 1.2]}
                    xLabel="total displacement clock ℓ"
                    yLabel="energy / integrated hazard"
                >
                    {(s) => (
                        <>
                            <Line
                                points={[
                                    [43, s.y(m.threshold)],
                                    [275, s.y(m.threshold)],
                                ]}
                                colour={ink}
                                opacity={0.4}
                                dash="2 5"
                            />
                            {path(L.energy, s, amber, "4 4")}
                            {path(L.hazard, s)}
                            <Dot point={s.point([m.displacement, m.hazard])} radius={4} />
                            {text(90, 66, "solid: hazard; dashed: U")}
                        </>
                    )}
                </Plot>
            );
        }
        case "kernels":
            return pair(
                <Plot xrange={[-2.7, 2.7]} yrange={[0, 6]} xLabel="position x" yLabel="individual mass kernels">
                    {(s) => (
                        <>
                            {[0, 1, 2, 3, 4].map((i) => (
                                <Line
                                    key={i}
                                    points={L[`kernel${i}`].map(s.point)}
                                    colour={i === 2 ? teal : amber}
                                    dash={i === 2 ? undefined : "4 4"}
                                    opacity={i === 2 ? 1 : 0.55}
                                />
                            ))}
                            {L.particles.map((p, i) => (
                                <Dot key={i} point={[s.x(p[0]), 192]} colour={i === 2 ? teal : amber} radius={4} />
                            ))}
                        </>
                    )}
                </Plot>,
                <Plot xrange={[-2.7, 2.7]} yrange={[0, 6]} xLabel="position x" yLabel="total represented density">
                    {(s) => (
                        <>
                            {path(L.density, s)}
                            {L.particles.map((p, i) => (
                                <Dot key={i} point={[s.x(p[0]), 192]} radius={4} />
                            ))}
                            {text(115, 67, "area = total mass = 5")}
                        </>
                    )}
                </Plot>
            );
        case "pressure":
            return pair(
                <Plot xrange={[-2, 2]} yrange={[0, 4]} xLabel="position x" yLabel="density from two parcels">
                    {(s) => (
                        <>
                            {path(L.density, s)}
                            <Dot point={[s.x(-m.r / 2), 192]} radius={5} />
                            <Dot point={[s.x(m.r / 2), 192]} colour={amber} radius={5 * Math.sqrt(m.massJ)} />
                            {text(90, 69, `ρᵢ = ${format(m.rhoI)}`)}
                            {text(90, 88, `ρⱼ = ${format(m.rhoJ)}`)}
                        </>
                    )}
                </Plot>,
                <g>
                    {text(25, 25, "pair forces (same linear scale)")}
                    <Arrow from={[150, 70]} to={[150 + 35 * m.forceI, 70]} />
                    <Arrow from={[150, 95]} to={[150 + 35 * m.forceJ, 95]} colour={amber} />
                    {text(25, 74, "Fᵢ")}
                    {text(25, 99, "Fⱼ")}
                    {text(25, 133, "accelerations")}
                    <Arrow from={[150, 169]} to={[150 + 35 * m.accelerationI, 169]} />
                    <Arrow from={[150, 194]} to={[150 + 35 * m.accelerationJ, 194]} colour={amber} />
                    {text(25, 173, "aᵢ")}
                    {text(25, 198, "aⱼ")}
                    <Line
                        points={[
                            [150, 43],
                            [150, 210],
                        ]}
                        colour={ink}
                        opacity={0.25}
                        dash="3 5"
                    />
                    {text(150, 237, "Fᵢ + Fⱼ = 0 at every separation", "middle")}
                </g>
            );
        case "landscape":
            return pair(
                <g>
                    {energySurfaceMesh().map((points, i) => (
                        <Line key={i} points={points} colour={ink} width={0.8} opacity={0.18} />
                    ))}
                    <Line points={L.crossSection.map(([y, z]) => projectEnergySurface(m.x, y, z))} width={3} />
                    {L.dots.map(([y, z], i) => (
                        <Dot key={i} point={projectEnergySurface(m.x, y, z)} colour={amber} radius={2.3} />
                    ))}
                    <Line
                        points={[projectEnergySurface(-1.6, 0, 0), projectEnergySurface(1.6, 0, 0)]}
                        colour={ink}
                        opacity={0.35}
                    />
                    {text(31, 30, "energy U(x,y)")}
                    {text(252, 211, "x")}
                    {text(83, 211, "hidden y")}
                    {text(150, 239, `scan x = ${format(m.x)}; width w = ${format(m.width)}`, "middle")}
                </g>,
                <Plot
                    xrange={[-1.7, 1.7]}
                    yrange={[0, 5]}
                    xLabel="retained coordinate x"
                    yLabel="energy / free energy + constant"
                >
                    {(s) => (
                        <>
                            {path(data.curves.potential, s, amber, "4 4")}
                            {path(data.curves.free, s)}
                            <Dot point={s.point([m.x, m.free])} radius={5} />
                            <Dot point={s.point([m.x, m.potential])} colour={amber} hollow radius={5} />
                            <Line
                                points={[s.point([m.x, m.free]), s.point([m.x, m.potential])]}
                                colour={ink}
                                opacity={0.4}
                            />
                            {text(110, 65, "solid: F; dashed: V")}
                        </>
                    )}
                </Plot>
            );
        case "umbrella":
            return pair(
                <Plot
                    xrange={[-1.8, 1.8]}
                    yrange={[0, 4]}
                    xLabel="collective coordinate x"
                    yLabel="biased and original densities"
                >
                    {(s) => (
                        <>
                            {path(data.curves.target, s, amber, "4 4")}
                            {path(L.biased, s)}
                            <Line
                                points={[
                                    [s.x(m.centre), 192],
                                    [s.x(m.centre), 44],
                                ]}
                                colour={ink}
                                opacity={0.3}
                                dash="2 5"
                            />
                            {L.particles.map((p, i) => (
                                <Dot key={i} point={s.point(p)} radius={2.4} />
                            ))}
                            {text(85, 66, `centre = ${format(m.centre)}`)}
                        </>
                    )}
                </Plot>,
                <Plot xrange={[-1.8, 1.8]} yrange={[0, 4]} xLabel="collective coordinate x" yLabel="reweighted density">
                    {(s) => (
                        <>
                            {path(data.curves.target, s, amber, "6 5")}
                            {path(L.corrected, s)}
                            {text(84, 67, "corrected curve = target")}
                        </>
                    )}
                </Plot>
            );
    }
}
