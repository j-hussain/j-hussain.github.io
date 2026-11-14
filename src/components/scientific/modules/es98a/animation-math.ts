/** Deterministic teaching models. Inner products here are real. No browser or React dependencies. */
export const animationKinds = [
    "feature-lift",
    "projection-fit",
    "svd-flow",
    "inverse-noise",
    "gaussian-shape",
    "gaussian-slice",
    "monte-carlo",
    "metropolis",
    "fourier",
    "markov-gap",
    "kernel-evaluation",
    "narrow-spike",
    "random-series",
    "covariance-modes",
    "spectral-filter",
    "bias-noise",
    "soft-threshold",
    "bayes-update",
    "hellinger",
    "gp-conditioning",
] as const;
export type AnimationKind = (typeof animationKinds)[number];
export type Point = [number, number];
export type Ink = "accent" | "secondary" | "ink";
export type Curve = { points: Point[]; ink?: Ink; dashed?: boolean; fill?: boolean; opacity?: number };
export type Dot = { at: Point; ink?: Ink; hollow?: boolean; radius?: number };
export type Panel = {
    title: string;
    x: [number, number];
    y: [number, number];
    xlabel: string;
    ylabel: string;
    curves: Curve[];
    dots?: Dot[];
    equal?: boolean;
    labels?: { at: Point; text: string }[];
};
export type Scene = { panels: [Panel, Panel]; formula: string; summary: string };
export const animationInfo: Record<AnimationKind, { title: string; parameter: string; caption: string }> = {
    "feature-lift": {
        title: "A new coordinate makes a curved boundary flat",
        parameter: "Lift from the plane into feature space",
        caption:
            "The fixed inner disk has radius at most 0.7; the outer ring starts at radius 1.3. Lift by z=t(x²+y²). At t=1, the plane z=1 separates these classes. The tilted right view uses a fixed oblique projection. A separator linear in the features is quadratic in the original coordinates.",
    },
    "projection-fit": {
        title: "The shortest residual finds the fit",
        parameter: "Move the stiffness towards the optimum",
        caption:
            "Fixed observations y=(2,3), prediction E(1,2). Move E from 0 to 1.6. The residual becomes perpendicular to the prediction line at the minimum; the second plot traces the same squared loss.",
    },
    "svd-flow": {
        title: "Read, scale, reconstruct",
        parameter: "Advance through the SVD factors",
        caption:
            "A=R(35°) diag(1.4,0.5) R(−25°). First rotate into input coordinates, then stretch, then rotate into output coordinates. Intermediate maps interpolate each operation; only the endpoint is A.",
    },
    "inverse-noise": {
        title: "A weak measurement becomes a large inverse error",
        parameter: "Weaken the second singular value",
        caption:
            "Fixed data noise has length 0.1. A=diag(1,σ₂), with σ₂ decreasing from 1 to 0.1. The error ellipse has semiaxes 0.1 and 0.1/σ₂. All axis scales remain fixed; zero is excluded.",
    },
    "gaussian-shape": {
        title: "Covariance shapes the same standardised draws",
        parameter: "Increase correlation",
        caption:
            "Transform the same deterministic illustrative standard-normal draws by a covariance factor L satisfying LL*=C=[[1,ρ],[ρ,1]]. Both marginal variances stay one while the principal variances become 1+ρ and 1−ρ. The ellipse is the one-Mahalanobis-radius contour, not a confidence region with unspecified coverage.",
    },
    "gaussian-slice": {
        title: "An observation moves the conditional distribution",
        parameter: "Move the observed second coordinate",
        caption:
            "Zero-mean joint Gaussian with unit marginal variances and fixed correlation 0.8. As x₂=b moves, x₁|x₂=b has mean 0.8b and variance 0.36. The dashed marginal stays fixed. This is Gaussian conditioning, not geometric truncation of the cloud.",
    },
    "monte-carlo": {
        title: "An integral emerges from samples",
        parameter: "Reveal more independent draws",
        caption:
            "Seeded independent pseudorandom uniform samples estimate ∫₀¹x²dx=1/3. The displayed ±1-RMSE envelope uses the exact variance 4/45, not an estimated confidence interval or a guaranteed bound on this one trace.",
    },
    metropolis: {
        title: "A rejection is a real step of the chain",
        parameter: "Reveal proposals and decisions",
        caption:
            "Seeded random-walk Metropolis targeting N(0,1), with a symmetric uniform proposal of half-width 2.5. Hollow markers indicate rejected proposals; the state trace repeats its previous value. This short teaching run is not evidence of convergence.",
    },
    fourier: {
        title: "Build a function one frequency at a time",
        parameter: "Reveal odd Fourier modes",
        caption:
            "Partial sums (4/π)Σ sin((2j+1)x)/(2j+1) approximate a periodic square wave in L². During each transition only the next coefficient grows from zero. Overshoot near jumps persists; convergence is not uniform and the limit at a jump is the midpoint.",
    },
    "markov-gap": {
        title: "A spectral gap sets the relaxation time",
        parameter: "Advance the Markov chain distribution",
        caption:
            "Two-state chains have P=[[1−a,a],[a,1−a]], invariant law (1/2,1/2), and nonconstant eigenvalue 1−2a. Start in state 0. Compare a=0.25 with a=0.04. Curves concern distributions, not individual sample trajectories.",
    },
    "kernel-evaluation": {
        title: "A kernel section is a measuring direction",
        parameter: "Move the evaluation point",
        caption:
            "Gaussian kernel k(x,z)=exp(−(x−z)²/2) and the RKHS element u(x)=k(x,−0.8)−0.6k(x,0.8). The moving representer k(z,·) measures u(z) through the RKHS inner product. The right plot shows the two exact kernel contributions; this is not an L² inner product.",
    },
    "narrow-spike": {
        title: "Small in L² can remain large at a point",
        parameter: "Narrow the spike",
        caption:
            "fₕ(x)=max(1−|x|/h,0), h decreases from 1 to 0.05. Its centre value remains one while squared L² norm equals 2h/3. The animation illustrates unbounded point evaluation on L², with a positive finite width at every frame.",
    },
    "random-series": {
        title: "Random coefficients become a random function",
        parameter: "Assemble the random Fourier series",
        caption:
            "Fixed seeded independent Gaussian coefficients ξₙ and orthonormal sine modes √2 sin(nπx) on [0,1], scaled by 1/n. Completed modes have total expected squared norm Σ1/n²; the last mode fades in continuously. This is one reproducible realisation, not an empirical covariance estimate.",
    },
    "covariance-modes": {
        title: "Mode variance controls shape and uncertainty",
        parameter: "Increase the second mode variance",
        caption:
            "On [0,1], ψ₁=√2 sin(πx), ψ₂=√2 sin(2πx), eigenvalues 1 and λ₂. The coefficient ellipse and three fixed seeded draws use the same λ₂. Covariance kernel is ψ₁(x)ψ₁(y)+λ₂ψ₂(x)ψ₂(y); rank is two when λ₂>0.",
    },
    "spectral-filter": {
        title: "Trust the modes the observations can support",
        parameter: "Reduce the regularisation parameter",
        caption:
            "Eight-mode diagonal forward map σₙ=1/n, truth uₙ=1/n², fixed signed noise of norm 0.04. Solid coefficient curves are compared with the dashed truth. Tikhonov multiplies noisy data by σₙ/(σₙ²+α); reducing α restores signal and eventually amplifies weak-mode noise.",
    },
    "bias-noise": {
        title: "Follow bias and noise separately",
        parameter: "Reduce alpha along the error curve",
        caption:
            "The same fixed eight-mode problem as the spectral-filter animation. Left shows actual bias norm, propagated-noise norm and total error on a logarithmic α axis. Right compares coefficient error vectors. Total error is not the sum of the two norms; cancellation is possible.",
    },
    "soft-threshold": {
        title: "A threshold removes a coefficient",
        parameter: "Raise the penalty weight",
        caption:
            "For A=I and y=(2,0.7), l1 minimisation gives sign(yᵢ)max(|yᵢ|−α,0); ridge gives y/(1+α). The l1 solution reaches a coordinate axis at α=0.7. The diamond is its l1 norm ball at the current solution, not a general guarantee of sparsity for every A.",
    },
    "bayes-update": {
        title: "The likelihood reweights the prior",
        parameter: "Move the observed value",
        caption:
            "Prior u~N(0,1), independent noise variance 0.25, observation y=u+η. Posterior is N(0.8y,0.2). The likelihood curve is scaled as a density in u only for this scalar location model; general likelihoods need not integrate to one over parameters.",
    },
    hellinger: {
        title: "Distance between square roots measures changed belief",
        parameter: "Separate two Gaussian means",
        caption:
            "Compare N(0,1) and N(m,1), m from 0 to 3. Hellinger distance squared is 1−exp(−m²/8). The shaded area in the right plot is half the squared difference between square-root densities, whose integral is this distance squared.",
    },
    "gp-conditioning": {
        title: "Each observation removes correlated uncertainty",
        parameter: "Condition on successive observations",
        caption:
            "Zero-mean squared-exponential GP, unit length scale, observations at −1.2,0,1.2 with values 0.8,−0.7,1.1 and independent noise variance 0.09. Within each stage, gradually increase that observation's precision from zero to 1/0.09. Bands show pointwise latent mean ±1 standard deviation; they are not simultaneous confidence bands.",
    },
};
const sq = (x: number) => x * x;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export function progress(value: number) {
    if (!Number.isFinite(value)) throw new RangeError("Finite progress required");
    return Math.max(0, Math.min(1, value));
}
export const normal = (x: number, m = 0, v = 1) => Math.exp(-sq(x - m) / (2 * v)) / Math.sqrt(2 * Math.PI * v);
export const softThreshold = (x: number, a: number) => Math.sign(x) * Math.max(Math.abs(x) - a, 0);
export const filter = (s: number, a: number) => s / (s * s + a);
export const gaussianConditional = (rho: number, b: number) => ({ mean: rho * b, variance: 1 - rho * rho });
export function seeded(seed = 98) {
    let state = seed >>> 0;
    return () => {
        state = (1664525 * state + 1013904223) >>> 0;
        return (state + 0.5) / 4294967296;
    };
}
function normals(n: number, seed = 98) {
    const rand = seeded(seed);
    return Array.from({ length: n }, () => Math.sqrt(-2 * Math.log(rand())) * Math.cos(2 * Math.PI * rand()));
}
const gaussianDraws = normals(120);
export function mcTrace(n = 160) {
    const random = seeded();
    let sum = 0;
    return Array.from({ length: n }, (_, i) => {
        const x = random();
        sum += x * x;
        return { x, estimate: sum / (i + 1) };
    });
}
export function mhTrace(n = 60) {
    const random = seeded(451);
    let x = -2;
    return Array.from({ length: n }, () => {
        const proposal = x + 5 * (random() - 0.5);
        const accept = random() < Math.min(1, Math.exp((x * x - proposal * proposal) / 2));
        if (accept) x = proposal;
        return { x, proposal, accept };
    });
}
export function inverseProblem(alpha: number) {
    const truth = Array.from({ length: 8 }, (_, i) => 1 / sq(i + 1));
    const noise = truth.map((_, i) => ((i % 2 ? -1 : 1) * 0.04) / Math.sqrt(8));
    const sigma = truth.map((_, i) => 1 / (i + 1));
    const estimate = truth.map((u, i) => filter(sigma[i], alpha) * (sigma[i] * u + noise[i]));
    const bias = truth.map((u, i) => (filter(sigma[i], alpha) * sigma[i] - 1) * u);
    const propagated = noise.map((e, i) => filter(sigma[i], alpha) * e);
    const norm = (a: number[]) => Math.hypot(...a);
    return {
        truth,
        noise,
        sigma,
        estimate,
        bias,
        propagated,
        biasNorm: norm(bias),
        noiseNorm: norm(propagated),
        errorNorm: norm(estimate.map((u, i) => u - truth[i])),
    };
}
export const kernel = (x: number, z: number) => Math.exp(-sq(x - z) / 2);
const obsX = [-1.2, 0, 1.2],
    obsY = [0.8, -0.7, 1.1];
/** Sequential scalar Gaussian conditioning; equivalent to a Gram solve. */
export function gpPosterior(x: number, z: number, t: number) {
    const p = progress(t) * 3;
    // Each update uses the already-conditioned covariance, including previous updates.
    const sites = [...obsX, x, z];
    let mean = sites.map(() => 0);
    let cov = sites.map((a) => sites.map((b) => kernel(a, b)));
    for (let i = 0; i < 3; i++) {
        const weight = progress(p - i);
        if (weight === 0) continue;
        const den = cov[i][i] + 0.09 / weight;
        const column = cov.map((row) => row[i]);
        const residual = obsY[i] - mean[i];
        mean = mean.map((m, j) => m + (column[j] * residual) / den);
        cov = cov.map((row, j) => row.map((c, k) => c - (column[j] * column[k]) / den));
    }
    return { mean: mean[3], variance: Math.max(0, cov[3][3]), covariance: cov[3][4], active: Math.ceil(p) };
}
function sampled(fn: (x: number) => number, x: [number, number], n = 120): Point[] {
    return Array.from({ length: n + 1 }, (_, i) => {
        const a = lerp(...x, i / n);
        return [a, fn(a)];
    });
}
function curve(fn: (x: number) => number, x: [number, number], ink: Ink = "accent", dashed = false): Curve {
    return { points: sampled(fn, x), ink, dashed };
}
function panel(
    title: string,
    x: [number, number],
    y: [number, number],
    xlabel: string,
    ylabel: string,
    curves: Curve[] = [],
    dots: Dot[] = []
): Panel {
    return { title, x, y, xlabel, ylabel, curves, dots };
}
function circle(rx = 1, ry = 1): Point[] {
    return sampled((a) => a, [0, 2 * Math.PI], 96).map(([a]) => [rx * Math.cos(a), ry * Math.sin(a)]);
}
function normLine(values: number[], ink: Ink = "accent", dashed = false): Curve {
    return { points: values.map((v, i) => [i + 1, v]), ink, dashed };
}
function rotation(p: Point, a: number): Point {
    return [Math.cos(a) * p[0] - Math.sin(a) * p[1], Math.sin(a) * p[0] + Math.cos(a) * p[1]];
}
const round = (x: number) => x.toFixed(3);
export function scene(kind: AnimationKind, value: number): Scene {
    const t = progress(value);
    let panels: [Panel, Panel];
    let formula = "",
        summary = "";
    switch (kind) {
        case "feature-lift": {
            const points = Array.from({ length: 96 }, (_, i) => {
                const outer = i >= 40;
                const a = i * 2.39996323;
                const r = outer ? 1.3 + 0.35 * ((i % 11) / 10) : 0.7 * Math.sqrt((i + 0.5) / 40);
                return { x: r * Math.cos(a), y: r * Math.sin(a), r, outer };
            });
            const project = (x: number, y: number, z: number): Point => [x - 0.5 * y, 0.32 * y + 0.8 * z];
            const boundary = circle().map(([x, y]) => [x, y] as Point);
            const mesh: Curve[] = [0.5, 1, 1.65].map((r) => ({
                points: circle(r, r).map(([x, y]) => project(x, y, t * r * r)),
                ink: "ink",
                opacity: 0.2,
            }));
            for (let a = 0; a < 2 * Math.PI; a += Math.PI / 3)
                mesh.push({
                    points: sampled((r) => r, [0, 1.65], 32).map(([r]) =>
                        project(r * Math.cos(a), r * Math.sin(a), t * r * r)
                    ),
                    ink: "ink",
                    opacity: 0.18,
                });
            panels = [
                panel(
                    "Original coordinates",
                    [-2.3, 2.3],
                    [-2.1, 2.1],
                    "x₁",
                    "x₂",
                    [{ points: boundary, ink: "ink", dashed: true }],
                    points.map((p) => ({ at: [p.x, p.y], ink: p.outer ? "secondary" : "accent", hollow: p.outer }))
                ),
                panel(
                    "Lifted feature space",
                    [-2.5, 2.5],
                    [-0.8, 3.1],
                    "x₁ − ½x₂ (projected)",
                    "projected vertical coordinate",
                    [
                        ...mesh,
                        { points: [project(0, 0, 0), project(0, 0, 3)], ink: "ink", opacity: 0.4 },
                        {
                            points: [
                                [-1.6, -1.6],
                                [1.6, -1.6],
                                [1.6, 1.6],
                                [-1.6, 1.6],
                                [-1.6, -1.6],
                            ].map(([x, y]) => project(x, y, t)),
                            ink: "ink",
                            fill: true,
                            opacity: 0.12,
                        },
                    ],
                    points.map((p) => ({
                        at: project(p.x, p.y, t * p.r * p.r),
                        ink: p.outer ? "secondary" : "accent",
                        hollow: p.outer,
                    }))
                ),
            ];
            panels[1].labels = [
                { at: project(0, 0, 3.1), text: "z" },
                { at: project(1.4, 1.2, t), text: "z = t" },
            ];
            formula = `φₜ(x₁,x₂) = (x₁,x₂,t(x₁²+x₂²)), t = ${round(t)}`;
            summary =
                "Solid teal points form the disk; hollow amber points form the outer ring. At full lift, the separating plane is z=1.";
            break;
        }
        case "projection-fit": {
            const E = 1.6 * t;
            const pred: Point = [E, 2 * E];
            const loss = (e: number) => sq(e - 2) + sq(2 * e - 3);
            panels = [
                panel(
                    "Prediction and residual",
                    [-0.5, 3.5],
                    [-0.5, 4],
                    "first observation",
                    "second observation",
                    [
                        {
                            points: [
                                [0, 0],
                                [2, 4],
                            ],
                            ink: "ink",
                            dashed: true,
                        },
                        { points: [pred, [2, 3]], ink: "secondary" },
                        { points: [[0, 0], pred], ink: "accent" },
                    ],
                    [{ at: [2, 3], ink: "ink" }, { at: pred }]
                ),
                panel(
                    "The same squared loss",
                    [0, 2.5],
                    [0, 14],
                    "stiffness E",
                    "Φ(E)",
                    [curve(loss, [0, 2.5])],
                    [{ at: [E, loss(E)], ink: "secondary" }]
                ),
            ];
            formula = `E=${round(E)}, Φ(E)=${round(loss(E))}, (1,2)·residual=${round(8 - 5 * E)}`;
            summary =
                "The highlighted prediction travels along the model line. Only at E=1.6 is its residual perpendicular, with squared loss 0.2.";
            break;
        }
        case "svd-flow": {
            const stage = t * 3;
            const transform = (p: Point) => {
                let v = rotation(p, ((-25 * Math.PI) / 180) * Math.min(stage, 1));
                if (stage > 1)
                    v = [v[0] * lerp(1, 1.4, Math.min(stage - 1, 1)), v[1] * lerp(1, 0.5, Math.min(stage - 1, 1))];
                if (stage > 2) v = rotation(v, ((35 * Math.PI) / 180) * (stage - 2));
                return v;
            };
            const points = circle();
            panels = [
                panel("Input unit circle", [-1.8, 1.8], [-1.8, 1.8], "input x₁", "input x₂", [
                    { points, ink: "ink", dashed: true },
                    {
                        points: [
                            [0, 0],
                            [1, 0],
                        ],
                    },
                    {
                        points: [
                            [0, 0],
                            [0, 1],
                        ],
                        ink: "secondary",
                    },
                ]),
                panel(
                    "Transform the same points",
                    [-1.8, 1.8],
                    [-1.8, 1.8],
                    "current first coordinate",
                    "current second coordinate",
                    [
                        { points: points.map(transform) },
                        { points: [[0, 0], transform([1, 0])], ink: "ink" },
                        { points: [[0, 0], transform([0, 1])], ink: "secondary" },
                    ]
                ),
            ];
            formula =
                t < 1 / 3
                    ? "1. V* reads the input in the singular basis"
                    : t < 2 / 3
                      ? "2. Σ stretches by 1.4 and 0.5"
                      : "3. U reconstructs in the output basis";
            summary =
                "Track the solid first basis edge and dashed reference circle. Rotation alone preserves lengths; unequal scaling creates the ellipse.";
            break;
        }
        case "inverse-noise": {
            const sigma = lerp(1, 0.1, t);
            panels = [
                panel("Fixed observation noise", [-1.1, 1.1], [-1.1, 1.1], "noise coordinate 1", "noise coordinate 2", [
                    { points: circle(0.1, 0.1) },
                ]),
                panel("Error after inversion", [-1.1, 1.1], [-1.1, 1.1], "error coordinate 1", "error coordinate 2", [
                    { points: circle(0.1, 0.1 / sigma), ink: "secondary" },
                ]),
            ];
            formula = `σ₂=${round(sigma)}, max error=0.1/σ₂=${round(0.1 / sigma)}`;
            summary =
                "The first inverse direction is unchanged. The weak second measurement stretches the same noise into a long reconstruction-error ellipse.";
            break;
        }
        case "gaussian-shape": {
            const rho = 0.95 * t;
            const map = (x: number, y: number): Point => [x, rho * x + Math.sqrt(1 - rho * rho) * y];
            panels = [
                panel(
                    "Same standard-normal draws",
                    [-3.5, 3.5],
                    [-3.5, 3.5],
                    "z₁",
                    "z₂",
                    [{ points: circle(), ink: "ink", dashed: true }],
                    Array.from({ length: 60 }, (_, i) => ({ at: [gaussianDraws[2 * i], gaussianDraws[2 * i + 1]] }))
                ),
                panel(
                    "Correlated draws",
                    [-3.5, 3.5],
                    [-3.5, 3.5],
                    "x₁",
                    "x₂",
                    [{ points: circle().map(([x, y]) => map(x, y)), ink: "secondary" }],
                    Array.from({ length: 60 }, (_, i) => ({ at: map(gaussianDraws[2 * i], gaussianDraws[2 * i + 1]) }))
                ),
            ];
            formula = `ρ=${round(rho)}, C eigenvalues = ${round(1 + rho)}, ${round(1 - rho)}`;
            summary =
                "The cloud leans towards x₁=x₂. Narrowing in one principal direction balances widening in the other; both coordinate variances remain one.";
            break;
        }
        case "gaussian-slice": {
            const b = lerp(-2, 2, t),
                c = gaussianConditional(0.8, b);
            panels = [
                panel(
                    "Observed coordinate",
                    [-2.5, 2.5],
                    [-2.5, 2.5],
                    "x₁",
                    "x₂",
                    [
                        { points: circle().map(([x, y]) => [x, 0.8 * x + 0.6 * y]), ink: "ink", dashed: true },
                        {
                            points: [
                                [-2.5, b],
                                [2.5, b],
                            ],
                            ink: "secondary",
                        },
                    ],
                    [{ at: [c.mean, b] }]
                ),
                panel("Conditional law of x₁", [-3.5, 3.5], [0, 0.75], "x₁", "density", [
                    curve((x) => normal(x), [-3.5, 3.5], "ink", true),
                    curve((x) => normal(x, c.mean, c.variance), [-3.5, 3.5]),
                ]),
            ];
            formula = `b=${round(b)}, conditional mean=${round(c.mean)}, variance=0.360`;
            summary =
                "The observation changes the centre, while the conditional variance stays fixed because the joint model and correlation have not changed.";
            break;
        }
        case "monte-carlo": {
            const trace = mcTrace(),
                n = 1 + Math.floor(159 * t);
            const partial = trace.slice(0, n);
            panels = [
                panel(
                    "Sample the integrand",
                    [0, 1],
                    [0, 1],
                    "uniform draw x",
                    "f(x)=x²",
                    [curve((x) => x * x, [0, 1])],
                    partial.map((d) => ({ at: [d.x, d.x * d.x], radius: 2.5 }))
                ),
                panel(
                    "Running estimate",
                    [1, 160],
                    [0, 0.85],
                    "draw count J",
                    "estimate",
                    [
                        { points: partial.map((d, i) => [i + 1, d.estimate]) },
                        curve(() => 1 / 3, [1, 160], "ink", true),
                        curve((j) => 1 / 3 + Math.sqrt(4 / (45 * j)), [1, 160], "secondary", true),
                        curve((j) => 1 / 3 - Math.sqrt(4 / (45 * j)), [1, 160], "secondary", true),
                    ],
                    [{ at: [n, partial[n - 1].estimate] }]
                ),
            ];
            formula = `J=${n}, estimate=${round(partial[n - 1].estimate)}, exact integral=1/3`;
            summary =
                "New samples change one running average. The amber envelope is a scale for random error, not a promise that every running estimate stays inside it.";
            break;
        }
        case "metropolis": {
            const trace = mhTrace(),
                n = 1 + Math.floor(59 * t),
                last = trace[n - 1];
            panels = [
                panel(
                    "Target and current proposal",
                    [-4.5, 4.5],
                    [0, 0.45],
                    "state x",
                    "target density",
                    [curve((x) => normal(x), [-4.5, 4.5])],
                    [
                        { at: [last.x, normal(last.x)] },
                        { at: [last.proposal, normal(last.proposal)], ink: "secondary", hollow: !last.accept },
                    ]
                ),
                panel(
                    "Chain including rejected steps",
                    [0, 60],
                    [-4.5, 4.5],
                    "iteration",
                    "state",
                    [{ points: [[-0, -2], ...trace.slice(0, n).map((d, i) => [i + 1, d.x] as Point)] }],
                    trace
                        .slice(0, n)
                        .filter((d) => !d.accept)
                        .map((d) => ({
                            at: [trace.indexOf(d) + 1, d.proposal],
                            ink: "secondary",
                            hollow: true,
                            radius: 3,
                        }))
                ),
            ];
            formula = `Step ${n}: proposed ${round(last.proposal)}; ${last.accept ? "accepted" : "rejected, keep the previous state"}`;
            summary =
                "Amber hollow proposals were rejected. Their iterations remain in the chain as repeated states; deleting them would change the sampling law.";
            break;
        }
        case "fourier": {
            const count = 1 + 14 * t;
            const terms = Array.from({ length: 15 }, (_, i) => Math.max(0, Math.min(1, count - i)));
            const sum = (x: number) =>
                terms.reduce((s, w, i) => s + (((w * 4) / Math.PI) * Math.sin((2 * i + 1) * x)) / (2 * i + 1), 0);
            panels = [
                panel("The next frequency", [-Math.PI, Math.PI], [-1.6, 1.6], "periodic position x", "mode amplitude", [
                    curve(
                        (x) => {
                            const i = Math.min(14, Math.floor(count));
                            return ((4 / Math.PI) * Math.sin((2 * i + 1) * x)) / (2 * i + 1);
                        },
                        [-Math.PI, Math.PI],
                        "secondary"
                    ),
                ]),
                panel(
                    "Partial Fourier reconstruction",
                    [-Math.PI, Math.PI],
                    [-1.6, 1.6],
                    "periodic position x",
                    "function value",
                    [
                        curve(sum, [-Math.PI, Math.PI]),
                        {
                            points: [
                                [-Math.PI, -1],
                                [0, -1],
                                [0, 1],
                                [Math.PI, 1],
                            ],
                            ink: "ink",
                            dashed: true,
                        },
                    ]
                ),
            ];
            formula =
                count >= 15
                    ? "15 odd Fourier modes complete"
                    : `Completed odd modes: ${Math.floor(count)}; the next coefficient grows continuously`;
            summary =
                "Away from a jump the sum settles towards ±1. Watch near zero: finer oscillations do not remove the persistent Gibbs overshoot.";
            break;
        }
        case "markov-gap": {
            const time = 30 * t;
            const probability = (a: number, k: number) => 0.5 + 0.5 * Math.pow(1 - 2 * a, k);
            panels = [
                panel(
                    "Probability of state 0",
                    [0, 30],
                    [0, 1],
                    "time (integer steps at ticks)",
                    "probability",
                    [
                        curve((k) => probability(0.25, k), [0, 30]),
                        curve((k) => probability(0.04, k), [0, 30], "secondary"),
                        curve(() => 0.5, [0, 30], "ink", true),
                    ],
                    [{ at: [time, probability(0.25, time)] }, { at: [time, probability(0.04, time)], ink: "secondary" }]
                ),
                panel("Current two-state laws", [0, 1], [0, 1], "state (0 or 1)", "probability", [
                    {
                        points: [
                            [0, probability(0.25, time)],
                            [1, 1 - probability(0.25, time)],
                        ],
                    },
                    {
                        points: [
                            [0, probability(0.04, time)],
                            [1, 1 - probability(0.04, time)],
                        ],
                        ink: "secondary",
                    },
                ]),
            ];
            formula = `Time=${round(time)}, eigenvalues 0.50 (teal) and 0.92 (amber)`;
            summary =
                "Integer times are genuine chain iterates. Between them the curves interpolate the exponential relaxation. The smaller absolute gap relaxes more slowly.";
            break;
        }
        case "kernel-evaluation": {
            const z = lerp(-2, 2, t);
            const u = (x: number) => kernel(x, -0.8) - 0.6 * kernel(x, 0.8);
            panels = [
                panel(
                    "Move the representer",
                    [-2.5, 2.5],
                    [-0.5, 1.1],
                    "location x",
                    "u(x) and k(z,x)",
                    [curve(u, [-2.5, 2.5]), curve((x) => kernel(z, x), [-2.5, 2.5], "secondary", true)],
                    [{ at: [z, u(z)] }]
                ),
                panel(
                    "Two exact kernel contributions",
                    [-2.5, 2.5],
                    [-0.7, 1.1],
                    "evaluation point z",
                    "inner product contributions",
                    [
                        curve((x) => kernel(x, -0.8), [-2.5, 2.5], "ink", true),
                        curve((x) => -0.6 * kernel(x, 0.8), [-2.5, 2.5], "secondary", true),
                        curve(u, [-2.5, 2.5]),
                    ],
                    [{ at: [z, u(z)] }]
                ),
            ];
            formula = `⟨k(z,·),u⟩ᴴ = u(z) = ${round(u(z))}, z=${round(z)}`;
            summary =
                "The two dashed contributions add to the solid function. Moving z changes which bounded evaluation functional is applied, not the function u.";
            break;
        }
        case "narrow-spike": {
            const h = lerp(1, 0.05, t);
            panels = [
                panel(
                    "Same point value, narrower support",
                    [-1.2, 1.2],
                    [0, 1.2],
                    "location x",
                    "spike height",
                    [
                        {
                            points: [
                                [-h, 0],
                                [0, 1],
                                [h, 0],
                            ],
                            fill: true,
                        },
                    ],
                    [{ at: [0, 1], ink: "secondary" }]
                ),
                panel(
                    "L² energy versus width",
                    [0, 1],
                    [0, 1.2],
                    "half-width h",
                    "squared L² norm",
                    [curve((x) => (2 * x) / 3, [0, 1]), curve(() => 1, [0, 1], "secondary", true)],
                    [{ at: [h, (2 * h) / 3] }]
                ),
            ];
            formula = `h=${round(h)}, fₕ(0)=1, ‖fₕ‖²₂=2h/3=${round((2 * h) / 3)}`;
            summary =
                "Teal energy tends to zero as the support narrows. The amber point reading stays one, so L² convergence cannot control this sensor.";
            break;
        }
        case "random-series": {
            const count = 1 + 11 * t;
            const weights = Array.from({ length: 12 }, (_, i) => progress(count - i));
            const values = weights.map((w, i) => (w * gaussianDraws[i]) / (i + 1));
            const f = (x: number) =>
                values.reduce((s, a, i) => s + a * Math.SQRT2 * Math.sin((i + 1) * Math.PI * x), 0);
            panels = [
                panel(
                    "Random coefficients",
                    [1, 12],
                    [-2.5, 2.5],
                    "sine mode n",
                    "coefficient ξₙ/n",
                    [normLine(values)],
                    values.map((v, i) => ({ at: [i + 1, v] }))
                ),
                panel("One assembled random function", [0, 1], [-4, 4], "location x", "partial sum", [
                    curve(f, [0, 1]),
                ]),
            ];
            formula = `Expected partial energy = ${round(weights.reduce((s, w, i) => s + (w * w) / sq(i + 1), 0))} < π²/6`;
            summary =
                "The same seeded coefficients are reused on replay. Increasing the truncation reveals finer structure; the variance budget is an expectation, not the energy of this particular draw.";
            break;
        }
        case "covariance-modes": {
            const lambda = 0.05 + 0.95 * t;
            const mode = (x: number, n: number) => Math.SQRT2 * Math.sin(n * Math.PI * x);
            panels = [
                panel(
                    "Coefficient covariance ellipse",
                    [-1.5, 1.5],
                    [-1.5, 1.5],
                    "coefficient along ψ₁",
                    "coefficient along ψ₂",
                    [{ points: circle(1, Math.sqrt(lambda)) }]
                ),
                panel(
                    "Same draws, changed second variance",
                    [0, 1],
                    [-4.5, 4.5],
                    "location x",
                    "random function",
                    [0, 1, 2].map((j) =>
                        curve(
                            (x) =>
                                gaussianDraws[2 * j] * mode(x, 1) +
                                Math.sqrt(lambda) * gaussianDraws[2 * j + 1] * mode(x, 2),
                            [0, 1],
                            j === 0 ? "accent" : j === 1 ? "secondary" : "ink",
                            j > 0
                        )
                    )
                ),
            ];
            formula = `λ₁=1, λ₂=${round(lambda)}, trace(C)=${round(1 + lambda)}`;
            summary =
                "More second-mode variance spreads the coefficient ellipse vertically and strengthens the second sine pattern in every coupled draw.";
            break;
        }
        case "spectral-filter": {
            const alpha = Math.pow(10, -4 * t);
            const p = inverseProblem(alpha);
            panels = [
                panel(
                    "Recover the coefficients",
                    [1, 8],
                    [-0.4, 1.1],
                    "singular mode n",
                    "unknown coefficient",
                    [normLine(p.truth, "ink", true), normLine(p.estimate)],
                    p.estimate.map((v, i) => ({ at: [i + 1, v] }))
                ),
                panel(
                    "Inverse amplification",
                    [0.1, 1],
                    [0, 10],
                    "singular value σ",
                    "filter gα(σ)",
                    [curve((s) => filter(s, alpha), [0.1, 1])],
                    p.sigma.map((s) => ({ at: [s, filter(s, alpha)], ink: "secondary" }))
                ),
            ];
            formula = `α=${alpha.toExponential(2)}, reconstruction error=${round(p.errorNorm)}`;
            summary =
                "Dashed truth stays fixed. The marked singular values sample the filter; weak modes receive more amplification as alpha decreases.";
            break;
        }
        case "bias-noise": {
            const alpha = Math.pow(10, -4 * t),
                p = inverseProblem(alpha);
            panels = [
                panel(
                    "Actual error components",
                    [-4, 0],
                    [0, 0.65],
                    "log₁₀ alpha",
                    "coefficient-vector norm",
                    [
                        curve((a) => inverseProblem(10 ** a).biasNorm, [-4, 0]),
                        curve((a) => inverseProblem(10 ** a).noiseNorm, [-4, 0], "secondary"),
                        curve((a) => inverseProblem(10 ** a).errorNorm, [-4, 0], "ink", true),
                    ],
                    [{ at: [Math.log10(alpha), p.errorNorm], ink: "ink" }]
                ),
                panel("Error vectors add before norms", [1, 8], [-0.6, 0.3], "singular mode n", "coefficient error", [
                    normLine(p.bias),
                    normLine(p.propagated, "secondary"),
                    normLine(
                        p.bias.map((x, i) => x + p.propagated[i]),
                        "ink",
                        true
                    ),
                ]),
            ];
            formula = `bias=${round(p.biasNorm)}, noise=${round(p.noiseNorm)}, total=${round(p.errorNorm)}`;
            summary =
                "Teal bias shrinks while amber propagated noise grows. Their vectors add; the dashed total norm shows the realised compromise for this fixed noise.";
            break;
        }
        case "soft-threshold": {
            const a = 2.2 * t;
            const l1: Point = [softThreshold(2, a), softThreshold(0.7, a)],
                ridge: Point = [2 / (1 + a), 0.7 / (1 + a)];
            const r = Math.abs(l1[0]) + Math.abs(l1[1]);
            panels = [
                panel(
                    "The l1 solution meets an axis",
                    [-3, 3],
                    [-3, 3],
                    "coefficient u₁",
                    "coefficient u₂",
                    [
                        {
                            points: [
                                [r, 0],
                                [0, r],
                                [-r, 0],
                                [0, -r],
                                [r, 0],
                            ],
                            ink: "accent",
                            opacity: 0.4,
                        },
                        {
                            points: sampled((x) => x, [0, a]).map(([w]) => [
                                softThreshold(2, w),
                                softThreshold(0.7, w),
                            ]),
                            ink: "accent",
                        },
                    ],
                    [{ at: l1 }, { at: ridge, ink: "secondary", hollow: true }]
                ),
                panel(
                    "Shrink the smaller coefficient",
                    [0, 2.2],
                    [0, 0.8],
                    "penalty α",
                    "estimate of coefficient 2",
                    [
                        curve((x) => softThreshold(0.7, x), [0, 2.2]),
                        curve((x) => 0.7 / (1 + x), [0, 2.2], "secondary", true),
                    ],
                    [{ at: [a, l1[1]] }]
                ),
            ];
            formula = `α=${round(a)}, l1 estimate=(${round(l1[0])}, ${round(l1[1])})`;
            summary =
                "The solid l1 point reaches the axis and stays there. The hollow amber ridge point approaches zero continuously without setting a nonzero observed coefficient exactly to zero.";
            break;
        }
        case "bayes-update": {
            const y = lerp(-2, 2, t);
            panels = [
                panel("Prior and likelihood", [-3.5, 3.5], [0, 1], "unknown u", "density / scaled likelihood", [
                    curve((x) => normal(x), [-3.5, 3.5], "ink", true),
                    curve((x) => normal(x, y, 0.25), [-3.5, 3.5], "secondary"),
                ]),
                panel("Normalised posterior", [-3.5, 3.5], [0, 1], "unknown u", "posterior density", [
                    curve((x) => normal(x, 0.8 * y, 0.2), [-3.5, 3.5]),
                    curve((x) => normal(x), [-3.5, 3.5], "ink", true),
                ]),
            ];
            formula = `y=${round(y)}, posterior mean=${round(0.8 * y)}, posterior variance=0.200`;
            summary =
                "The posterior balances the prior centre with the observation according to their precisions. Its variance stays fixed while the observed value moves.";
            break;
        }
        case "hellinger": {
            const m = 3 * t;
            const area = (x: number) => 0.5 * sq(Math.sqrt(normal(x)) - Math.sqrt(normal(x, m)));
            panels = [
                panel("Two probability densities", [-4, 7], [0, 0.6], "unknown u", "density", [
                    curve((x) => normal(x), [-4, 7], "ink", true),
                    curve((x) => normal(x, m), [-4, 7]),
                ]),
                panel("Square roots and distance integrand", [-4, 7], [0, 0.7], "unknown u", "square-root density", [
                    curve((x) => Math.sqrt(normal(x)), [-4, 7], "ink", true),
                    curve((x) => Math.sqrt(normal(x, m)), [-4, 7]),
                    { points: [[-4, 0], ...sampled(area, [-4, 7]), [7, 0]], ink: "secondary", fill: true },
                ]),
            ];
            formula = `m=${round(m)}, dᴴ²=1−exp(−m²/8)=${round(1 - Math.exp((-m * m) / 8))}`;
            summary =
                "The amber area is half the squared difference, not the raw distance between the two curves. Coincident laws give zero; separated laws increase Hellinger distance.";
            break;
        }
        case "gp-conditioning": {
            const xs: [number, number] = [-3, 3];
            const mean = (x: number) => gpPosterior(x, x, t).mean;
            const upper = (x: number) => {
                const p = gpPosterior(x, x, t);
                return p.mean + Math.sqrt(p.variance);
            };
            const lower = (x: number) => {
                const p = gpPosterior(x, x, t);
                return p.mean - Math.sqrt(p.variance);
            };
            const heat: Dot[] = Array.from({ length: 13 * 13 }, (_, i) => {
                const a = i % 13,
                    b = Math.floor(i / 13);
                return {
                    at: [lerp(-3, 3, a / 12), lerp(-3, 3, b / 12)],
                    ink: "accent",
                    radius: Math.max(
                        0.8,
                        4 * Math.abs(gpPosterior(lerp(-3, 3, a / 12), lerp(-3, 3, b / 12), t).covariance)
                    ),
                };
            });
            panels = [
                panel(
                    "Posterior function and uncertainty",
                    xs,
                    [-2, 2],
                    "location x",
                    "latent function",
                    [
                        { points: [...sampled(upper, xs), ...sampled(lower, xs).reverse()], fill: true, opacity: 0.14 },
                        curve(mean, xs),
                        curve(upper, xs, "secondary", true),
                        curve(lower, xs, "secondary", true),
                    ],
                    obsX.map((x, i) => ({
                        at: [x, obsY[i]],
                        ink: i < Math.ceil(3 * t) ? "accent" : "ink",
                        hollow: i >= Math.ceil(3 * t),
                    }))
                ),
                panel("Remaining covariance", xs, xs, "location x", "location x′", [], heat),
            ];
            formula = `Observation precision stages: ${round(3 * t)} / 3; Var[u(0)|data]=${round(gpPosterior(0, 0, t).variance)}`;
            summary =
                "Dots on the right scale with the magnitude of covariance on a fixed 13×13 grid. As observations gain precision, correlated regions lose uncertainty; finite noise leaves nonzero posterior variance.";
            break;
        }
    }
    const geometric = ["feature-lift", "svd-flow", "inverse-noise", "gaussian-shape", "gaussian-slice"];
    if (geometric.includes(kind))
        panels.forEach((p, i) => {
            p.equal = kind !== "gaussian-slice" || i === 0;
        });
    if (["projection-fit", "covariance-modes", "soft-threshold"].includes(kind)) panels[0].equal = true;
    return { panels, formula, summary };
}
/** Fixed SVG layout shared by the two coordinated panels. */
export function svgPoint(point: Point, p: Panel): Point {
    const dx = p.x[1] - p.x[0],
        dy = p.y[1] - p.y[0];
    const sx = p.equal ? Math.min(292 / dx, 216 / dy) : 292 / dx;
    const sy = p.equal ? sx : 216 / dy;
    // Quantise SVG layout, not mathematical state: transcendental functions can differ
    // in their last bits between Node and browser engines during hydration.
    return [
        Number((190 + (point[0] - (p.x[0] + p.x[1]) / 2) * sx).toFixed(3)),
        Number((142 - (point[1] - (p.y[0] + p.y[1]) / 2) * sy).toFixed(3)),
    ];
}
export function svgPath(points: Point[], p: Panel) {
    return points
        .map((point, i) => {
            const [x, y] = svgPoint(point, p);
            return `${i ? "L" : "M"}${x.toFixed(3)},${y.toFixed(3)}`;
        })
        .join(" ");
}
