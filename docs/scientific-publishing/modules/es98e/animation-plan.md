# ES98E animated explanations

User assignment: add at least two thematic interactive animations per page, including a concentric-circle feature lift. Scope extends the completed module with two animations on each of eight chapters. The user subsequently requested an animation-free contents page; its two previews have been removed. User praise applies to the existing notes; the animations await review.

Exact writable paths: `_notes/es98e.md`, `_notes/es98e/*.md`; new `src/components/scientific/modules/es98e/{animation-math.ts,animation-scenes.ts,animation-catalogue.ts,animations.tsx,animations.module.css,article.tsx}`; existing module route files `src/app/notes/es98e/{page.tsx,[topic]/page.tsx}`; `tests/scientific/es98e/*`, `tests/browser/es98e/*`; `docs/scientific-publishing/modules/es98e/*`; ignored `artifacts/es98e/*`. Existing shared compiler, registry, CSS, components, configuration and other modules remain untouched. No sub-agents or deployment.

## Editorial placement and mathematical contract

| Page                   | First animation                                      | Second animation                                   | Mathematical invariant / caveat                                                                                      |
| ---------------------- | ---------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Index                  | None                                                 | None                                               | Contents and opening quotation only, following the user’s refinement.                                                |
| Sensitivity            | Tangent versus curved response                       | Correlated uncertainty transported to output       | Taylor error vanishes quadratically; covariance uses gᵀΣg.                                                           |
| Regression             | (x,y) → (x,y,τ(x²+y²))                               | Ridge regularisation path                          | Disk r≤0.65 and ring r≥1.05 separate at r²=0.8 for every τ>0. Ridge minimises a stated finite-basis objective.       |
| Gaussian processes     | Add three observations by increasing their precision | Change lengthscale with fixed Gaussian innovations | Exact Gaussian conditioning; sample curves are finite-grid Gaussian draws with stated jitter and deterministic seed. |
| Neural learning        | Forward activations and backward derivative products | Gradient descent on anisotropic quadratic          | Jacobians include weights; displayed motion interpolates discrete optimisation steps.                                |
| Symmetry/graphs        | Rotate a spring molecule and its force vectors       | Messages travel across a path graph                | Rigid motion preserves energy; forces rotate; message layers are explicitly normalised neighbour averages.           |
| Differential equations | Optimise one residual-amplitude coefficient          | Exact damped rotation versus Euler integration     | Analytic trial family is not a trained PINN; fixed vector field, adjustable numerical step.                          |
| Latent geometry        | Rotate a PCA projection axis                         | Bend a latent decoder and add noise                | Retained plus residual variance equals total; decoder samples keep fixed latent quantiles/noise innovations.         |
| Inference              | Increase observation precision                       | Gaussian VI approaches its analytic posterior      | Proper Gaussian densities, evidence constant, ELBO gap exactly KL.                                                   |

Every scene needs a motivating paragraph, a visible formula, an interpreted caption and a fixed reference scale. Use teal, amber and ink inherited from the article. Filled/outlined points and stroke patterns distinguish mathematical roles. Native SVG supports the 3D lift through a tested orthographic projection, without a new graphics dependency.

## Integration

A module-owned article composer recognises only exact, top-level `<div data-es98e-animation="…" />` slots from an explicit allowlist, compiles every prose block with the unchanged `scientificMDX`, and inserts the module client island between those blocks. These are valid native MDX placeholders, not unregistered JSX components. This keeps registration and compiler APIs unchanged. Slots must not split equations, JSX containers, footnotes, lists or proof blocks. There are no cross-block footnotes in this module. Unsupported/malformed animation slots fail closed. The real notes are the executable usage examples; no shared gallery API changes are required.

## Playback/accessibility

Deterministic server-rendered initial scenes; no autoplay. Play/pause, replay, a labelled timeline and one contextual parameter. One active animation per page; pause offscreen or in hidden tabs. Reduced motion replaces continuous playback with a discrete forward step. Slider edits pause playback. Meaningful graphics/captions remain without JavaScript. Announce paused summaries rather than every animation frame. Keyboard/touch controls have visible focus and 44px targets. No decorative motion, em dashes or card/dashboard styling.

## Validation to complete

Pure analytic/invariant/boundary tests, deterministic sampling and SPD checks, ridge/VI descent, force covariance, PCA energy, feature separation and Euler stability. Test actual rendered slots on all nine pages, desktop/mobile and both themes; play/pause/scrub/replay/parameter changes; reduced motion, offscreen/hidden-page behaviour and no-JavaScript reading. Inspect actual screenshots and animated frame changes. Run TypeScript, scoped lint/format, baseline plus explicit module numerical tests, and a serial production build without competing with other workers. Record actual results and limitations in the handoff.
