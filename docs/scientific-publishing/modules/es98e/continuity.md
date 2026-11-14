# ES98E continuity ledger

Reading order: **Part B → Part A**, eight topic pages. [Curriculum and full source coverage](curriculum-map.md) map all 26 questions. [Corrections](corrections.md) distinguish repairs, extensions and unverified lecture reports. The module index states the entry prerequisites; no Part A definition is needed to read Part B.

## Definitions and notation

| Object / convention                                                         | Introduced                           | Extension / application                                                                                                                                            |
| --------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Real vectors, transpose T, Euclidean norm                                   | Entry prerequisites                  | All examples are finite-dimensional and real. No outer-product convention is needed or changed.                                                                    |
| Q(x), nominal input x̄, displacement Δ, gradient g, Hessian H                | sensitivity#local-response           | Generic expensive simulator in GP chapter; derivatives are local, not global importance scores.                                                                    |
| Input covariance Σ, coordinate uncertainty σᵢ, scales sᵢ                    | sensitivity#uncertainty              | gᵀΣg separates uncertainty from raw derivative magnitude; dimensionless elasticity requires an output scale.                                                       |
| Feature matrix Φ, weights w, n observations, M features                     | regression#features                  | Learned features in neural-learning; finite basis covariance extended to GP. Sensitivity's X denotes standardised perturbation design, not Φ.                      |
| Observation variance σ²; prior variance τ²; precisions β and α              | regression#probability and #evidence | MSE/MAP scaling is recalled in neural-learning. GP uses σₙ² explicitly for observation noise.                                                                      |
| Conditional mean μ(x), average estimator f̄, random training dataset D       | regression#generalisation            | Entire stochastic neural-training procedure is the estimator; avoid reteaching the decomposition in A4.                                                            |
| GP mean m(x), covariance k, K, C=K+σₙ²I, lengthscale ℓ, signal variance v   | gaussian-processes                   | Prior/latent/noisy predictive uncertainty kept distinct. v is local to this chapter.                                                                               |
| Network hℓ, Wℓ, bℓ, activation φ; residual block Fℓ                         | neural-learning                      | Structured updates in symmetry-graphs; Euler-scaled depth in differential-equations. φ now means an activation, not a regression feature; explicitly reintroduced. |
| Group actions ρX,ρY; rigid rotation R and translation a; energy E, force Fᵢ | symmetry-graphs#symmetry             | Output action differs from positional action; invariant energy differentiated for forces.                                                                          |
| Hₖ has node embeddings in columns; undirected symmetric A; permutation P    | symmetry-graphs#message-passing      | Explicit proof uses H→HP, A→PᵀAP. Directed receiver/sender convention would need Aᵀ on the right.                                                                  |
| Solution u, vector field f or gθ, residual r or Rwκ                         | differential-equations               | Distinguish solution network, learned dynamics, and parameter-to-solution operator.                                                                                |
| Data x∈Rᴰ, latent z∈Rᴹ, uncentred data matrix X with rows, centred Xc       | latent-geometry                      | x changes from simulator input to an observed data vector; this role switch is introduced at the unsupervised transition.                                          |
| Empirical covariance S uses divisor n; eigenvalues λj; PCA Uₘ               | latent-geometry#pca                  | Reconstruction error is a mean, ∑discarded λj. pPCA noise is their average over D−M.                                                                               |
| Decoder θ, encoder φ/varphi, variational q, ELBO ℒ, KL(q‖posterior)         | variational-inference#elbo and #vae  | θ indexes model parameters; varphi indexes amortised inference.                                                                                                    |
| Normal scalar g, posterior mean m and variance v; q=N(a,b²), b=exp ℓ        | variational-inference#normal-model   | Local reuse of g/m/v/ℓ is explicitly defined. Analytic VI provides the final benchmark.                                                                            |

## Assumptions and scope

- Taylor remainders require smoothness on a neighbourhood; small perturbations and solver stability are checked rather than assumed from a fixed step formula. Screening needs validation over the intended range.
- Covariance propagation permits correlated inputs. The quadratic variance extension specifically assumes centred Gaussian displacements.
- Least-squares coefficient uniqueness needs full column rank. Gaussian likelihood assumes conditionally independent, equal-variance errors unless stated otherwise. Prior-to-penalty scaling includes dataset normalisation.
- Bias–variance uses independent new observations and finite second moments. Validation selection and final test evaluation are separate. Complexity curves are not asserted universally U-shaped.
- GP finite sets require PSD kernels; conditioning inverses require SPD C. Hyperparameters are conditional modelling assumptions. Bands show pointwise latent uncertainty, not simultaneous coverage or automatically calibrated error.
- Neural derivative products include weights as well as activation derivatives. ReLU's derivative at zero is undefined; strong-form second-order PDEs need appropriate regularity. Modified-flow statements are local formal approximations.
- Graph permutation claims require shared updates and invariant aggregation. Physical symmetry needs compatible features/readouts throughout. Mean and sum pooling serve different intensive/extensive targets.
- Differential equation residual bounds use stability and continuous residual control; sampled loss does not prove either. The derived bound is for the particular stable scalar ODE, x≥0, with exact initial condition.
- PCA minimises squared reconstruction error after centring. pPCA formulas use M<D and an interior positive-noise solution; latent rotations are not identifiable. Gaussian pPCA is not a multimodal digit distribution.
- MCMC invariance and ergodicity differ; ESS is observable-specific. VI support/finite-expectation conditions are stated. ELBO tightness is conditional on the variational family and model; joint learning does not separately improve evidence and gap at every step.

## Representations and visual continuity

The seven original static figures are deterministic inline SVG in the MDX, wrapped in the existing Figure component. They inherit currentColor and scientific accent/secondary variables, with solid/dashed/dotted marks and textual labels. No colour carries an unlabelled mathematical distinction. Module CSS sizes these SVGs only; shared styles and APIs are untouched. Seven figures are regenerated by `npx tsx src/components/scientific/modules/es98e/generate-figures.ts`; pure calculations are in `math.ts` alongside it. Generated SVG geometry is part of the chapter source, so readers get the full figure with JavaScript disabled.

The covariance ellipse in B1 introduces directional uncertainty; B3 turns covariance into relationships between function values; A7 uses covariance eigenvectors to retain directions; A8 conditions a Gaussian distribution explicitly. These are related operations, but their axes have different meanings and are relabelled locally. The graph storyboard is an exact discrete operation. The ODE comparison deliberately uses different vertical scales and discloses this. No figure is empirical evidence about a trained model.

Two conceptual predictions use the existing registered PredictReveal API: nonlinear mixed response under a zero local derivative, and the persistence of observation noise after interpolation. Essential explanations remain in prose/noscript. The later user-authorised animation pass adds sixteen module-local scenes, two per chapter. The previews on the index were subsequently removed at the user’s request. The shared component API remains unchanged; the module article composer inserts client islands between complete blocks compiled by the existing MDX pipeline. See [animation contracts and authoring](animation-components.md).

## Editorial review beyond successful rendering

Concrete evidence against the framework's quality criteria:

- Motivation/progression: sensitivity starts with a simulator budget; regression inherits its design matrix; GP inherits Bayesian feature covariance; neural features replace fixed ones; symmetry and equations introduce two forms of scientific information; latent geometry ends with the intractable integral that inference addresses.
- Rigour: visible derivations include normal equations/rank, bias–variance, Gaussian conditioning examples, graph equivariance, the ODE stability bound, PCA reconstruction, detailed balance and the analytic normal ELBO optimum. The correction ledger records changed hypotheses rather than preserving false statements.
- Reference utility: each chapter has explicit topic anchors, local contents, displayed definitions/results and previous/next links. The coverage map retains the original question texts without letting them dictate headings.
- Pedagogy: figures answer a named comparison and are interpreted in surrounding prose. Static comparison is deliberate; derivative graphs are visible together, and equal-scale comparisons remain equal-scale. No numerical lecture outcome is presented as a new benchmark.
- Continuity: likelihood and bias–variance are proved once in Part B and applied in Part A; the nonlinear decoder is introduced before ELBO training; assumed matrix/probability prerequisites are stated at the index.

These are agent self-review observations, not independent peer review or user approval. Browser and numerical evidence, including limitations, belongs to the handoff.

## Animated extension

The new classification example introduces the fixed feature map (x,y)→(x,y,τ(x²+y²)) before the cosine examples. It reinforces linearity in learned coefficients without conflating classification and regression. A horizontal plane pulls back to the circle r²=0.8; intermediate positive lifts remain separable. The animation is analytic, not a learned classifier.

Recurring representations now move: input covariance is transported to output variance, a GP covariance matrix reshapes coupled function draws, PCA accounts for retained/discarded variance at every axis angle, and a Gaussian posterior supplies an exact target for variational motion. Fixed point identities, innovations and reference scales make changes comparable. Camera changes affect only projection. Optimiser and solver paths distinguish exact discrete steps from their visual interpolation. The spring molecule and two-dimensional damped rotation are explicitly added teaching models, not lecture benchmarks.

Every chapter contains exactly two allowlisted top-level animation slots. The contents page has none and opens with the user-supplied John von Neumann quotation before the motivating paragraph. All prior static diagrams and substantive source coverage remain intact. The visible index retains the user's topic headings, without Part A/Part B labels or em dashes. User praise of the prose and request for animations are recorded separately from future user review of these new scenes.
