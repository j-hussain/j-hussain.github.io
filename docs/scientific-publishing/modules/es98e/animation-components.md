# ES98E animation authoring and mathematical models

The working examples are all eight chapter pages. Each contains two top-level slots, for sixteen instances of sixteen distinct scenes. The module contents page has no animation slots, as requested by the user. This is module-local functionality: no shared component, registry, compiler, dependency or article stylesheet changed.

## Authoring

Place a slot between complete paragraphs/equations/JSX blocks:

```mdx
Play the lift, then change the viewing angle. The first two feature coordinates stay fixed.

<div data-es98e-animation="feature-lift" />

The plane in feature space pulls back to a circle in the original coordinates.
```

`src/components/scientific/modules/es98e/article.tsx` parses frontmatter once and splits only these exact standalone native-div slots. It checks the explicit catalogue, compiles each prose fragment with the existing `scientificMDX`, and inserts `ES98EAnimation` in document order. Other native divs are unaffected; malformed/unknown animation slots throw. Slots must be top-level, outside lists, equations, JSX containers and footnote definitions. This module has no cross-fragment footnotes. Both ES98E routes use this composer. This is article composition, not a second MDX compiler or a new shared component registration convention.

`ES98EAnimation` accepts only a typed `kind`; titles, formulas, parameter bounds and interpreted captions come from `animation-catalogue.ts`. Use each kind once per page, since its figure ID is `es98e-motion-<kind>`. Existing static figures and all original derivations remain in place.

## Separation of responsibilities

- `animation-math.ts`: numerical kernels, seeded innovations, Gaussian conditioning/sampling, linear solves, polynomial fitting, derivatives, forces, message updates, ODE integration, PCA and Gaussian VI.
- `animation-scenes.ts`: pure mathematical geometry and fixed plot transforms. Returns shape data, clip rectangles, metrics and an accessible summary; imports no React or browser APIs.
- `animations.tsx`: client playback, browser preference/subscription handling, controls and SVG rendering. Coordinates are rendered to 0.001 SVG units to avoid irrelevant cross-engine floating-point hydration mismatches. Numerical readouts are rounded for readability; underlying calculations retain their full precision.
- `animations.module.css`: module-only responsive controls and graphics, inheriting the existing scientific teal/amber/ink variables and font families. No gradients, decorative motion or card layouts.
- `article.tsx`: server composition using the unchanged compiler.

## Scene contracts and working examples

| Kind                  | Live example                          | Model / invariant                                                                                                                                                                                                                                                                                |
| --------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| tangent-trust         | `/notes/es98e/sensitivity`            | Q(s)=s+cs², derivative one at the nominal input; exact omitted term cs².                                                                                                                                                                                                                         |
| uncertainty-transport | `/notes/es98e/sensitivity`            | Covariance [[1,ρ],[ρ,1]], Q=Δ₁+g₂Δ₂; exact output variance 1+g₂²+2ρg₂. UI excludes singular correlations.                                                                                                                                                                                        |
| feature-lift          | `/notes/es98e/regression`             | Inner disk r≤0.65, outer annulus 1.05≤r≤1.3; z=τr²; separating plane z=0.8τ, τ>0. Orthographic camera changes only the view.                                                                                                                                                                     |
| ridge-path            | `/notes/es98e/regression`             | Twelve fixed noisy cosine values, degree 2–10 Chebyshev basis; SSE+λΣj≥1 wj², λ=10^(−4+5p); unpenalised intercept. Cholesky solves the small, positive-definite teaching system; this is not a recommendation to replace QR/SVD in unregularised general least squares.                          |
| gp-conditioning       | `/notes/es98e/gaussian-processes`     | Zero mean, unit signal variance, SE lengthscale 0.7. Introduce each observation by precision strength s/σ²; intermediate updates are exact tempered-likelihood conditioning, not optimisation.                                                                                                   |
| kernel-morph          | `/notes/es98e/gaussian-processes`     | 41-point Gaussian prior draws; SE lengthscale 0.18–1.8, signal variance 0.4–2, diagonal jitter 10⁻⁷. Shared Gaussian innovations couple changing draws. Connected samples do not assert a continuous-path interpolation theorem. Heatmap opacity is covariance/2, with a fixed upper scale of 2. |
| activation-flow       | `/notes/es98e/neural-learning`        | Five scalar tanh/ReLU layers, common weight 1.1; exact node derivatives. Fractional powers only animate traversal between nodes. A minimum visible marker remains at zero gradient; the caption discloses this.                                                                                  |
| gradient-descent      | `/notes/es98e/neural-learning`        | L=(w₁²+5w₂²)/2, exact forty-step GD; convergence requires 0<η<0.4. Fixed viewport clips divergent trajectories and reports departure. Motion interpolates discrete iterates.                                                                                                                     |
| molecular-symmetry    | `/notes/es98e/symmetry-graphs`        | Unit-stiffness all-pair springs, rest length 1.05. Recompute forces after rigid transformation; energy preserved, forces rotate, total force zero. Force arrows have fixed 0.85 magnification.                                                                                                   |
| message-waves         | `/notes/es98e/symmetry-graphs`        | Five-node path, self-plus-neighbour average, four layers. Values stay in [0,1], dependence travels one edge per layer, reversal preserves the pooled readout. This is a stated normalised variant of the source update.                                                                          |
| residual-fit          | `/notes/es98e/differential-equations` | u=e^(−x/5)sin(x)+a sin(6x); forty amplitude-gradient steps, step size 0.0025, initial a=0.15; 4–24 equally spaced collocation points. Geometric interpolation connects coefficient updates. Initial condition exact; sampled residual loss does not certify an arbitrary PDE solution.           |
| ode-flow              | `/notes/es98e/differential-equations` | Damped rotation with exact radius e^(−0.2t); explicit Euler on the same field, Δt 0.04–0.6. Stability bound 0.4/1.04. Numerical solver error is separate from learned-model error.                                                                                                               |
| pca-rotation          | `/notes/es98e/latent-geometry`        | Deterministic centred cloud; principal variances 3 and λminor, divisor n. Rotate one unit axis: retained+discarded=3+λminor; maximum at 45°. Equal geometric axis scales.                                                                                                                        |
| decoder-bend          | `/notes/es98e/latent-geometry`        | Fixed latent normal draws, polynomial mean (z,b(z²−1)), b=0–0.8, independent isotropic observation noise. The Gaussian latent prior is unchanged by bending the decoder. No training or identifiability claim.                                                                                   |
| normal-update         | `/notes/es98e/variational-inference`  | N(0,1) prior and one observation y with precision β=0–4. Posterior m=βy/(1+β), v=1/(1+β). Rescaled likelihood is labelled separately from posterior density.                                                                                                                                     |
| variational-gap       | `/notes/es98e/variational-inference`  | Exact target N(1,1/2), forty Gaussian mean/log-SD gradient updates. Evidence is log N(2;0,2), fixed throughout; gap equals the analytic Gaussian KL.                                                                                                                                             |

## Randomness and reproducibility

All samples are deterministic transforms of fixed pseudo-random Gaussian innovations. The generator uses a stated 32-bit LCG and Box–Muller transform; it is for teaching, not inference. Input cloud: seed 17, 72 pairs. GP draws: seeds 2026, 2123 and 2220, 41 innovations each. Decoder: latent seed 821, observation-noise seed 117, 48 points. Regression noise is the fixed sequence 0.19 sin(17i+0.3). No data, noise or seed is regenerated on playback. Covariance changes transform the same innovations.

The numerical tests check analytic identities and reconstruction of LLᵀ, not empirical covariance estimates from three sample paths. These are conceptual simulations and are not evidence about the unavailable lecture experiments.

## Playback and accessible reading

Nothing autoplays. Play advances a 14-second eased traversal, Pause freezes it, Replay returns to the initial timeline value while retaining the chosen parameter, and labelled native ranges permit direct scrubbing. Parameter edits pause playback. Starting another explanation pauses the first; leaving the viewport or hiding the document pauses playback. The scene is capped at 30 rendered frames/second.

Reduced-motion preference replaces continuous Play with a discrete Step forward action and disables transitions. Preference changes stop playback. Browser-only readiness and preference state use external-store snapshots so server markup and hydration agree. Without JavaScript, each initial SVG, formula, caption and explicit noscript explanation remains readable; controls are disabled. The original mathematical prose never depends on playing an animation.

Colours inherit the scientific theme. Filled/outlined points, dashed curves, labels and captions repeat the roles without relying solely on colour. Paused summaries are announced; running frames do not use a live announcement stream. Keyboard focus and 44px controls are retained. Browser keyboard/touch/no-JavaScript checks are not a substitute for a physical-device or real screen-reader audit.
