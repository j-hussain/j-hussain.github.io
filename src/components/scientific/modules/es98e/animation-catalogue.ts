/** Module-local authoring catalogue. Real examples are embedded in the nine ES98E pages. */
export const animationCatalogue = {
    "tangent-trust": {
        title: "How far can a tangent take us?",
        formula: "Q(s) = s + cs²     ·     Qlinear(s) = s",
        timeline: "Probe the neighbourhood",
        parameter: "Curvature c",
        min: 0,
        max: 1,
        step: 0.05,
        initial: 0.6,
        caption:
            "Play to move a perturbation away from and back to the nominal input. The dashed tangent keeps only the derivative; the vertical amber segment is the omitted quadratic response. Change the curvature to see when the local approximation becomes useful.",
    },
    "uncertainty-transport": {
        title: "Watch correlation become output uncertainty",
        formula: "Q = Δ₁ + g₂Δ₂     ·     Var(Q) = 1 + g₂² + 2ρg₂",
        timeline: "Correlation from −0.9 to +0.9",
        parameter: "Second sensitivity g₂",
        min: -2,
        max: 2,
        step: 0.1,
        initial: 2,
        caption:
            "The same 72 deterministic Gaussian innovations are transformed at every correlation. Both marginal input variances remain one. The right-hand curve is the exact Gaussian output density, not a histogram fitted to those points. Input axes have equal units; the output has its own labelled scale.",
    },
    "feature-lift": {
        title: "Lift the data, reveal a plane",
        formula: "φτ(x, y) = (x, y, τ(x² + y²))",
        timeline: "Lift into the third coordinate",
        parameter: "Viewing angle (degrees)",
        min: -80,
        max: 80,
        step: 1,
        initial: 35,
        caption:
            "Play to lift an inner disk and an outer ring onto a paraboloid. Filled points have r ≤ 0.65; outlined points have r ≥ 1.05. The plane z = 0.8τ separates them for every τ > 0. Its inverse image is the circle x² + y² = 0.8. The view is an orthographic projection; rotating it changes the picture, not the data. This is an exact feature map, not a trained classifier.",
    },
    "ridge-path": {
        title: "Tame a flexible curve without changing its features",
        formula: "minw  ‖Φw − y‖² + λ Σj≥1 wj²",
        timeline: "Increase regularisation",
        parameter: "Polynomial degree",
        min: 2,
        max: 10,
        step: 1,
        initial: 9,
        caption:
            "Watch the same Chebyshev basis fit twelve fixed noisy cosine observations as λ moves from 0.0001 to 10. The intercept is unpenalised. Solid teal is the fitted function; dashed ink is the known teaching target. The lower bars show the fitted coefficients. Reference error uses the noiseless cosine on 201 reference grid points; it is not an empirical uncertainty estimate.",
    },
    "gp-conditioning": {
        title: "Let each observation reshape a distribution",
        formula: "μ* = k*ᵀC⁻¹y     ·     s*² = k** − k*ᵀC⁻¹k*",
        timeline: "Introduce three observations",
        parameter: "Observation noise variance",
        min: 0.01,
        max: 0.4,
        step: 0.01,
        initial: 0.04,
        caption:
            "Three observations arrive in order. Between arrivals, increasing likelihood precision gives a continuous, exact Gaussian update; this is not an optimiser trajectory. The band is the posterior mean ± two latent standard deviations. The lower strip shows covariance with each observed input for a fixed lengthscale of 0.7. Observation noise and latent function uncertainty are distinct.",
    },
    "kernel-morph": {
        title: "Smoothness is a relationship between points",
        formula: "k(x, x′) = v exp(−(x − x′)² / 2ℓ²)",
        timeline: "Lengthscale from 0.18 to 1.8",
        parameter: "Signal variance v",
        min: 0.4,
        max: 2,
        step: 0.1,
        initial: 1,
        caption:
            "Keep the same Gaussian innovations while changing the lengthscale. Three finite-grid GP draws bend together as the covariance matrix changes. These are exact joint Gaussian draws at 41 grid points, connected by lines; the diagonal includes 10⁻⁷ numerical jitter. The seven-point heatmap uses the same kernel, with fixed colour scaling. Seeded teaching draws are not fitted data.",
    },
    "activation-flow": {
        title: "Follow a gradient back through the layers",
        formula: "δℓ = δℓ₊₁ · w · φ′(w hℓ)     ·     w = 1.1",
        timeline: "Backpropagate a unit output gradient",
        parameter: "Network input",
        min: -2.5,
        max: 2.5,
        step: 0.1,
        initial: 1.8,
        caption:
            "A pulse travels backwards through five scalar layers. Its size tracks the accumulated derivative magnitude, with a small minimum marker kept visible at zero. Tanh and ReLU share the same input and weight. Move the input below zero to expose the inactive ReLU branch. ReLU uses the chosen zero subgradient at its kink; a positive-side derivative does not remove weight-induced growth.",
    },
    "gradient-descent": {
        title: "An optimiser has a step size, not just a direction",
        formula: "L(w) = ½(w₁² + 5w₂²)     ·     wnext = w − η∇L(w)",
        timeline: "Forty gradient steps",
        parameter: "Learning rate η",
        min: 0.04,
        max: 0.45,
        step: 0.01,
        initial: 0.16,
        caption:
            "Play the exact gradient-descent iterates on a fixed quadratic. The contour ellipse and trajectory share equal coordinate units. Motion between points is a visual interpolation, not a continuous solver. Above η = 0.4 the steep direction is unstable; trajectories leaving the fixed viewport are reported instead of silently rescaled.",
    },
    "molecular-symmetry": {
        title: "Rotate the configuration, carry the forces",
        formula: "E(Rr + a) = E(r)     ·     F(Rr + a) = RF(r)",
        timeline: "One full rotation",
        parameter: "Horizontal translation",
        min: -0.6,
        max: 0.6,
        step: 0.05,
        initial: 0,
        caption:
            "Three particles interact through unit-stiffness pair springs with rest length 1.05. Rotate and translate the positions while their force arrows rotate without acquiring a translation. The dashed configuration is the original; energy and total force are recomputed from the transformed positions. Force arrows use the same fixed magnification throughout. This is a spring model, not a molecular benchmark.",
    },
    "message-waves": {
        title: "Information travels one edge at a time",
        formula: "hnext(n) = mean{ h(n), h(m) : m ∈ neighbours(n) }",
        timeline: "Four message-passing layers",
        parameter: "Reverse node order",
        min: 0,
        max: 1,
        step: 1,
        initial: 0,
        caption:
            "A signal starts at one end of a five-node path. Each layer averages the node and its neighbours; moving beads show the weighted messages before the next update. Scrub between layers to see the growing receptive field. Reversing storage order carries the node features with it and preserves the graph readout. Interpolated transitions are visual aids, not extra network layers.",
    },
    "residual-fit": {
        title: "Watch an equation residual guide a fit",
        formula: "uₐ(x) = exp(−x/5) sin x + a sin(6x)",
        timeline: "Forty residual-gradient steps",
        parameter: "Collocation points",
        min: 4,
        max: 24,
        step: 1,
        initial: 12,
        caption:
            "Optimise the single amplitude a using gradient descent on the mean squared residual at equally spaced collocation points. The initial value stays exact. The upper curve compares trial and exact solution; the lower plot shows the continuous residual on a separate vertical scale. This deliberately transparent one-parameter fit is not neural-network training, and sampled loss alone is not a global error certificate.",
    },
    "ode-flow": {
        title: "A vector field becomes a trajectory",
        formula: "ẋ = −0.2x − y     ·     ẏ = x − 0.2y",
        timeline: "Integrate from t = 0 to t = 8",
        parameter: "Euler time step Δt",
        min: 0.04,
        max: 0.6,
        step: 0.02,
        initial: 0.12,
        caption:
            "The solid teal particle follows the exact damped rotation. The outlined amber particle follows explicit Euler steps through the same vector field. Changing Δt changes the numerical solver, not the underlying dynamics. Exact radius is exp(−0.2t). Euler is stable only for Δt < 0.4/1.04; divergent paths are clipped at the fixed viewing boundary and reported.",
    },
    "pca-rotation": {
        title: "Turn the projection until it keeps the variation",
        formula: "retained variance = uᵀSu     ·     retained + discarded = tr(S)",
        timeline: "Rotate the axis through 180°",
        parameter: "Minor principal variance",
        min: 0.2,
        max: 2,
        step: 0.1,
        initial: 1,
        caption:
            "Rotate one unit direction through a centred cloud with leading principal variance 3. Each point slides onto its projection; dashed segments show what was discarded. The lower curve tracks the same retained variance as a function of angle. At 45° the retained variance is maximal. Both geometric axes have equal units, and total empirical variance is conserved.",
    },
    "decoder-bend": {
        title: "Bend a latent line into a distribution",
        formula: "z ∼ N(0,1)     ·     x = (z, b(z² − 1)) + ε",
        timeline: "Bend the decoder from b = 0 to b = 0.8",
        parameter: "Noise standard deviation",
        min: 0,
        max: 0.35,
        step: 0.01,
        initial: 0.08,
        caption:
            "Keep 48 latent Gaussian draws and independent noise innovations fixed while bending a polynomial decoder. Small ink marks show latent values; teal points show decoded means and amber offsets show observation noise. The decoder becomes nonlinear without changing the prior. This construction illustrates generation, not a trained VAE or identifiable physical factors.",
    },
    "normal-update": {
        title: "See evidence add precision",
        formula: "v = 1/(1 + β)     ·     m = βy/(1 + β)",
        timeline: "Observation precision from 0 to 4",
        parameter: "Observed value y",
        min: -1,
        max: 3,
        step: 0.1,
        initial: 2,
        caption:
            "Start with a standard-normal prior and increase the precision β of one Gaussian observation. At β = 0 the prior is unchanged; at β = 1 and y = 2 the posterior is N(1, 1/2). Dashed ink is the prior, dotted amber is the likelihood rescaled as a density over the latent variable, and solid teal is the normalised posterior. Density heights and horizontal scales stay fixed.",
    },
    "variational-gap": {
        title: "Close the gap between a bound and the evidence",
        formula: "log p(x) = ELBO(q) + KL(q ‖ posterior)",
        timeline: "Forty variational-gradient steps",
        parameter: "Initial standard deviation",
        min: 0.5,
        max: 2.2,
        step: 0.1,
        initial: 1.4,
        caption:
            "Optimise a Gaussian approximation to the exact posterior N(1, 1/2). The model and its evidence stay fixed. The moving density changes mean and log standard deviation; the lower gap is the exact Gaussian KL, not a Monte Carlo estimate. Smooth motion connects discrete ascent steps. The family contains the posterior, so the optimum can make the bound tight.",
    },
} as const;
export type AnimationKind = keyof typeof animationCatalogue;
export const animationKinds = Object.keys(animationCatalogue) as AnimationKind[];
export function isAnimationKind(value: string): value is AnimationKind {
    return Object.hasOwn(animationCatalogue, value);
}
