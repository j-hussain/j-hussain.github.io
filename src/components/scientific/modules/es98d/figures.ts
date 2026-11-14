import {
    ar1Factor,
    gaussianDensity,
    harmonic,
    harmonicEventDisplacement,
    lennardJones,
    levelProbabilities,
    tentKernel,
} from "./math";

const accent = "var(--sci-accent)";
const secondary = "var(--sci-secondary)";
const f = (n: number) => Number(n.toFixed(3));
const text = (x: number, y: number, label: string, anchor = "start") =>
    `<text x="${f(x)}" y="${f(y)}" textAnchor="${anchor}">${label}</text>`;
const line = (x1: number, y1: number, x2: number, y2: number, colour = "currentColor", dash = "") =>
    `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${colour}" strokeWidth="1.5"${dash ? ` strokeDasharray="${dash}"` : ""} />`;
const path = (points: number[][], colour = accent, dash = "") =>
    `<path d="${points.map(([x, y], i) => `${i ? "L" : "M"}${f(x)},${f(y)}`).join(" ")}" fill="none" stroke="${colour}" strokeWidth="2.5"${dash ? ` strokeDasharray="${dash}"` : ""} />`;
const circle = (x: number, y: number, colour = accent, radius = 4) =>
    `<circle cx="${f(x)}" cy="${f(y)}" r="${radius}" fill="${colour}" />`;
const svg = (label: string, body: string) =>
    `<svg className="sci-story-svg" viewBox="0 0 300 240" role="img" aria-label="${label}">${body}</svg>`;
const panel = (heading: string, graphic: string, prose: string) =>
    `<div className="sci-story-panel"><h4>${heading}</h4>${graphic}<p>${prose}</p></div>`;
const figure = (id: string, title: string, caption: string, panels: string[]) =>
    `<Figure id="es98d-${id}" title="${title}" caption="${caption}">\n<div className="sci-story-grid sci-story-two">\n${panels.join("\n")}\n</div>\n</Figure>`;
function plot(
    fn: (x: number) => number,
    xmin: number,
    xmax: number,
    ymin: number,
    ymax: number,
    colour = accent,
    dash = ""
) {
    const points = Array.from({ length: 161 }, (_, i) => {
        const x = xmin + ((xmax - xmin) * i) / 160;
        return [
            42 + (236 * (x - xmin)) / (xmax - xmin),
            198 - (155 * (Math.max(ymin, Math.min(ymax, fn(x))) - ymin)) / (ymax - ymin),
        ];
    });
    return path(points, colour, dash);
}
function axes(xlabel: string, ylabel: string, xmin: string, xmax: string, ymin = "0", ymax = "1") {
    return (
        line(42, 198, 278, 198) +
        line(42, 198, 42, 38) +
        text(160, 233, xlabel, "middle") +
        text(42, 20, ylabel) +
        text(42, 218, xmin, "middle") +
        text(278, 218, xmax, "middle") +
        text(34, 202, ymin, "end") +
        text(34, 48, ymax, "end")
    );
}
function levelPanel(betaDelta: number, label: string) {
    const p = levelProbabilities(betaDelta);
    const body =
        axes("energy level", "total probability", "", "") +
        [p.ground, p.excited]
            .map((prob, i) => {
                const x = 90 + 110 * i,
                    h = 155 * prob;
                return (
                    `<rect x="${x}" y="${f(198 - h)}" width="38" height="${f(h)}" fill="none" stroke="${i ? secondary : accent}" strokeWidth="2" />` +
                    text(x + 19, 188 - h, prob.toFixed(3), "middle") +
                    text(x + 19, 219, i ? "Δ (4 states)" : "0 (1 state)", "middle")
                );
            })
            .join("");
    return panel(
        label,
        svg(
            `Ground probability ${p.ground.toFixed(3)}; total excited probability ${p.excited.toFixed(3)}. Four excited microstates.`,
            body
        ),
        "The level probability includes all four excited microstates; bar heights share the same zero-to-one scale."
    );
}
export function es98dFigureSources(): Record<string, { chapter: string; mdx: string }> {
    const levels = figure(
        "levels",
        "Energy competes with multiplicity",
        "Exactly one ground state and four excited states. These bars sum probabilities within each level; they are not per-microstate weights.",
        [levelPanel(Math.log(2), "Warmer: βΔ = log 2"), levelPanel(Math.log(8), "Colder: βΔ = log 8")]
    );
    const rstar = 2 ** (1 / 6);
    const energy =
        axes("separation r / σ", "energy u / ε", "0.95", "3", "−1.2", "2") +
        plot((r) => lennardJones(r).energy, 0.95, 3, -1.2, 2) +
        line(42, 198 - (155 * 1.2) / 3.2, 278, 198 - (155 * 1.2) / 3.2, "currentColor", "3 4") +
        circle(42 + (236 * (rstar - 0.95)) / 2.05, 198 - (155 * 0.2) / 3.2) +
        text(105, 185, "minimum: r* = 1.122σ");
    const force =
        axes("separation r / σ", "radial force f σ / ε", "0.95", "3", "−3", "60") +
        plot((r) => lennardJones(r).force, 0.95, 3, -3, 60) +
        line(42, 198 - (155 * 3) / 63, 278, 198 - (155 * 3) / 63, "currentColor", "3 4") +
        text(108, 78, "positive: repulsive") +
        text(108, 106, "negative: attractive");
    const lj = figure(
        "lj",
        "A zero energy is not a zero force",
        "Both plots use the same separation range, with different labelled vertical quantities and scales. Energy minimum at 2^(1/6)σ; the force there is zero.",
        [
            panel(
                "Energy and its minimum",
                svg("Lennard-Jones energy from r over sigma 0.95 to 3; minimum minus epsilon at 1.122 sigma.", energy),
                "The slope changes sign at the well minimum, after the energy has crossed zero at σ."
            ),
            panel(
                "The negative energy derivative",
                svg("Lennard-Jones radial force: repulsive below the energy minimum and attractive above it.", force),
                "The force axis has its own units and scale; its zero is the dashed line near the bottom."
            ),
        ]
    );
    const density =
        axes("position x", "equilibrium density", "−3", "3", "0", "0.85") +
        plot((x) => gaussianDensity(x, harmonic(1, 1, 1).variance), -3, 3, 0, 0.85) +
        plot((x) => gaussianDensity(x, harmonic(4, 1, 1).variance), -3, 3, 0, 0.85, secondary, "6 4") +
        text(177, 49, "β = 4 (dashed)") +
        text(177, 69, "β = 1 (solid)");
    const relax =
        axes("time t", "normalised covariance", "0", "4") +
        plot((t) => Math.exp(-t / harmonic(1, 1, 1).relaxation), 0, 4, 0, 1) +
        plot((t) => Math.exp(-t / harmonic(1, 1, 4).relaxation), 0, 4, 0, 1, secondary, "6 4") +
        text(160, 80, "γ = 4 (dashed)") +
        text(160, 100, "γ = 1 (solid)");
    const harmonicFigure = figure(
        "harmonic",
        "Width and relaxation answer different questions",
        "Analytic overdamped harmonic laws with stiffness k = 1. Left varies inverse temperature with γ = 1. Right varies friction with β = 1. All quantities are nondimensional.",
        [
            panel(
                "Cooling narrows equilibrium",
                svg("Gaussian equilibrium densities: beta 1 has variance 1, beta 4 has variance one quarter.", density),
                "Temperature changes the equilibrium spread: variance is 1/(βk)."
            ),
            panel(
                "Friction slows relaxation",
                svg(
                    "Normalised covariance exp minus t over gamma; friction 4 decays more slowly than friction 1.",
                    relax
                ),
                "Friction changes the clock: decay time is γ/k, while the equilibrium width stays fixed."
            ),
        ]
    );
    const residence = figure(
        "residence",
        "Jump counts and residence counts differ",
        "Expected residence lengths per alternating two-jump cycle of the exact two-state chain. These are expectations, not a sample trajectory.",
        [
            panel(
                "Count jumps: one visit each",
                svg(
                    "Accepted jumps alternate between ground and excited states, one visit each.",
                    text(25, 55, "ground → excited → ground") +
                        line(55, 158, 250, 158) +
                        circle(70, 158, accent, 10) +
                        circle(220, 158, secondary, 10) +
                        text(70, 195, "1 visit", "middle") +
                        text(220, 195, "1 visit", "middle")
                ),
                "Ignoring holding times gives equal jump frequencies."
            ),
            panel(
                "Count attempts: residence 4 : 1",
                svg(
                    "Expected ground holding time four attempts; expected excited holding time one attempt.",
                    text(20, 46, "ground: E[K] = 4") +
                        text(20, 78, "excited: E[K] = 1") +
                        line(30, 138, 250, 138) +
                        [0, 1, 2, 3].map((i) => circle(45 + i * 40, 138, accent, 9)).join("") +
                        circle(220, 138, secondary, 9) +
                        text(30, 190, "probabilities 4/5 and 1/5")
                ),
                "Residence-weighted observations recover the Boltzmann probabilities."
            ),
        ]
    );
    const corr =
        axes("lag k", "correlation ρ(k)", "0", "20") +
        plot((k) => 0.5 ** k, 0, 20, 0, 1) +
        plot((k) => 0.9 ** k, 0, 20, 0, 1, secondary, "6 4") +
        text(140, 75, "a = 0.9 (dashed)") +
        text(140, 97, "a = 0.5 (solid)");
    const inflation =
        axes("AR coefficient a", "variance factor g", "", "", "0", "20") +
        [0, 0.5, 0.9]
            .map((a, i) => {
                const x = 66 + 76 * i,
                    g = ar1Factor(a),
                    h = (155 * g) / 20;
                return (
                    `<rect x="${x}" y="${f(198 - h)}" width="32" height="${f(h)}" fill="none" stroke="${i === 2 ? secondary : accent}" strokeWidth="2" />` +
                    text(x + 16, 190 - h, String(f(g)), "middle") +
                    text(x + 16, 219, String(a), "middle")
                );
            })
            .join("");
    const correlation = figure(
        "correlation",
        "Correlation has a measurable error cost",
        "Exact stationary AR(1) correlation laws, not simulation output. Right: the asymptotic variance relative to independent observations of the same marginal variance and length.",
        [
            panel(
                "How slowly does memory decay?",
                svg("Autocorrelation a to power k for a 0.5 and 0.9, on common lag and correlation scales.", corr),
                "A larger a leaves substantial correlation at many positive lags."
            ),
            panel(
                "Sum the covariance contributions",
                svg("Long-run variance factors are 1, 3, 19 for AR coefficients 0, 0.5, 0.9.", inflation),
                "The variance multiplier is g; the standard-error multiplier is its square root."
            ),
        ]
    );
    const spins = [1, 1, -1, 1, 1, -1, -1, 1, 1];
    const bonds: [[number, number], [number, number], [number, number]] = [
        [0, 1],
        [0, 3],
        [3, 4],
    ];
    const clusterSites = new Set([0, 1, 3, 4]);
    function lattice(flipped: boolean) {
        let body = "";
        for (let i = 0; i < 9; i++) {
            const x = 65 + 80 * (i % 3),
                y = 55 + 65 * Math.floor(i / 3);
            for (const j of [i % 3 < 2 ? i + 1 : -1, i < 6 ? i + 3 : -1])
                if (j >= 0) body += line(x, y, 65 + 80 * (j % 3), 55 + 65 * Math.floor(j / 3), "currentColor", "2 5");
        }
        for (const [i, j] of bonds)
            body += line(
                65 + 80 * (i % 3),
                55 + 65 * Math.floor(i / 3),
                65 + 80 * (j % 3),
                55 + 65 * Math.floor(j / 3),
                accent
            );
        for (let i = 0; i < 9; i++) {
            const x = 65 + 80 * (i % 3),
                y = 55 + 65 * Math.floor(i / 3),
                selected = clusterSites.has(i);
            body +=
                `<circle cx="${x}" cy="${y}" r="16" fill="var(--background-color)" stroke="${selected ? accent : "currentColor"}" strokeWidth="${selected ? 3 : 1}" />` +
                text(x, y + 5, String(spins[i] * (flipped && selected ? -1 : 1)), "middle");
        }
        return body + text(150, 228, "solid edges: occupied bonds", "middle");
    }
    const cluster = figure(
        "cluster",
        "Flip a bond-connected component",
        "A fixed open 3×3 example, not a random cluster draw or critical configuration. The highlighted four-site component is one valid occupied-bond component. Dotted edges remain lattice edges but are unoccupied.",
        [
            panel(
                "Aligned does not mean bonded",
                svg(
                    "Nine spins with an occupied four-site plus cluster. Some adjacent equal spins have unoccupied bonds.",
                    lattice(false)
                ),
                "Three occupied edges connect four sites. Other equal-spin edges were not occupied in this illustrative realisation."
            ),
            panel(
                "Change a whole component",
                svg(
                    "The four-site cluster changes from plus one to minus one, with occupied bonds unchanged.",
                    lattice(true)
                ),
                "The occupied-bond compatibility condition survives the flip; boundary energy is handled by construction probabilities."
            ),
        ]
    );
    const eventLength = harmonicEventDisplacement(0.5);
    const event = figure(
        "event",
        "An event changes the active coordinate",
        "One-dimensional harmonic pair, β = k = 1, with a chosen exponential threshold E = 1/2. The event is at displacement 1; the second panel shows a subsequent energy-decreasing flight to displacement 1/2 of j.",
        [
            panel(
                "Active i moves uphill",
                svg(
                    "Initially both coordinates zero. Active particle i moves to one while j remains zero. Integrated hazard one half.",
                    line(40, 155, 260, 155) +
                        text(40, 182, "0", "middle") +
                        text(260, 182, "1", "middle") +
                        circle(40, 155, secondary, 9) +
                        circle(260, 155, accent, 9) +
                        text(45, 113, "j = 0") +
                        text(205, 113, `i = ${eventLength}`) +
                        text(35, 45, "∫ λ dℓ = ℓ² / 2") +
                        text(35, 75, "event at ℓ = 1")
                ),
                "The event threshold determines where activity transfers from i to j."
            ),
            panel(
                "Active j moves downhill",
                svg(
                    "Particle i remains at one; active j has reached one half, reducing the pair separation and energy.",
                    line(40, 155, 260, 155) +
                        text(40, 182, "0", "middle") +
                        text(260, 182, "1", "middle") +
                        circle(260, 155, secondary, 9) +
                        circle(150, 155, accent, 9) +
                        text(122, 113, "j = 1/2") +
                        text(210, 113, "i = 1") +
                        text(35, 45, "pair energy decreases") +
                        text(35, 75, "this factor has λ = 0")
                ),
                "Teal marks activity, not a permanent particle identity. No uphill hazard is accumulated on this initial downhill segment."
            ),
        ]
    );
    const positions = [-0.8, 0, 0.8],
        h = 0.8;
    const kernels =
        axes("position x", "kernel contribution", "−2", "2", "0", "2") +
        positions
            .map((p, i) =>
                plot((x) => tentKernel(x - p, h), -2, 2, 0, 2, i === 1 ? accent : secondary, i === 1 ? "" : "5 4")
            )
            .join("");
    const sum =
        axes("position x", "density Σ m W", "−2", "2", "0", "2") +
        plot((x) => positions.reduce((v, p) => v + tentKernel(x - p, h), 0), -2, 2, 0, 2) +
        positions.map((p) => circle(42 + (236 * (p + 2)) / 4, 198, accent, 4)).join("");
    const kernel = figure(
        "kernel",
        "A sum of parcel contributions becomes a field",
        "Three one-dimensional parcels of unit mass at −0.8, 0, 0.8; tent-kernel width h = 0.8. Both panels share position and vertical scales. Each kernel integrates to one, so the total density integrates to mass three.",
        [
            panel(
                "Each parcel supplies a kernel",
                svg("Three unit-integral tent kernels centred at minus 0.8, zero, and 0.8.", kernels),
                "The finite support describes smoothing, not an atomic hard core."
            ),
            panel(
                "Add contributions at each position",
                svg("Density is the sum of all three tent kernels; its integral is total mass three.", sum),
                "The dots locate parcels. The continuous curve estimates density between them."
            ),
        ]
    );
    const entropy = figure(
        "entropy",
        "The free energy counts states",
        "The same one-versus-four level example as Chapter 1. Dimensionless quantities use kBT as the energy unit, with βΔ = log 2.",
        [
            panel(
                "One configuration versus four",
                svg(
                    "Basin A has one state of energy zero. Basin B has four states, each of energy log two in thermal units.",
                    text(30, 45, "A: one state, energy 0") +
                        circle(145, 95, accent, 11) +
                        text(30, 153, "B: four states, energy log 2") +
                        [55, 115, 175, 235].map((x) => circle(x, 193, secondary, 11)).join("")
                ),
                "Every B microstate is individually less probable than A."
            ),
            panel(
                "Combine energy and multiplicity",
                svg(
                    "Basin free energy difference beta times F B minus F A equals log two minus log four equals minus log two. B has probability two thirds.",
                    text(25, 55, "β(FB − FA) = log 2 − log 4") +
                        text(25, 90, "= −log 2") +
                        text(25, 145, "pB / pA = 2") +
                        text(25, 190, "pB = 2/3")
                ),
                "B is favoured as a basin because four compatible states outweigh the energy penalty."
            ),
        ]
    );
    return {
        levels: { chapter: "equilibrium", mdx: levels },
        lj: { chapter: "interaction-models", mdx: lj },
        harmonic: { chapter: "dynamics", mdx: harmonicFigure },
        residence: { chapter: "monte-carlo", mdx: residence },
        correlation: { chapter: "uncertainty-observables", mdx: correlation },
        cluster: { chapter: "collective-updates", mdx: cluster },
        event: { chapter: "event-chains", mdx: event },
        kernel: { chapter: "continuum-particles", mdx: kernel },
        entropy: { chapter: "free-energy", mdx: entropy },
    };
}
