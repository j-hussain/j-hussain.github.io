# ES98A animated explanations

User assignment: at least two beautiful, purposeful animations on every weekly page, including a concentric-circle feature lift. Preserve the course prose and em-dash preference. No deployment.

Owned additions: `src/components/scientific/modules/es98a/{animation-math.ts,animations.tsx,animations.module.css,render.tsx}`, module notes, module routes, `src/app/notes/es98a/animations/page.tsx`, module docs/gallery and module tests. No shared compiler, registry, styles, config or other-module edits. A module-only server compositor splits explicit animation markers at top-level MDX block boundaries and sends every prose segment through the existing scientificMDX compiler. Current chapters contain no cross-segment footnote definitions; retain that invariant or use shared-owner integration before introducing them. This is composition of the reviewed pipeline, not a replacement compiler.

| Week | First animated argument                                                        | Second animated argument                                                   |
| ---- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| 1    | Lift a disk and ring by z=x²+y²; a horizontal plane gives a quadratic boundary | Move a prediction to the least-squares projection; residual and loss agree |
| 2    | Read → scale → reconstruct through an SVD                                      | Sweep a weak singular value and follow inverse amplification               |
| 3    | Correlation reshapes a Gaussian cloud while marginal variances stay fixed      | Move the observed coordinate and follow conditional mean/variance          |
| 4    | Reveal deterministic seeded Monte Carlo samples and running average            | Trace seeded Metropolis proposals, acceptances and rejections              |
| 5    | Reconstruct a square wave from Fourier modes, including Gibbs overshoot        | Watch a two-state Markov law approach stationarity; compare a slow gap     |
| 6    | Move a kernel representer and link its inner product to evaluation             | Narrow a spike while point value stays fixed and L2 norm vanishes          |
| 7    | Assemble a seeded Gaussian random Fourier series mode by mode                  | Coordinate covariance eigenvalues, ellipse and two-mode random functions   |
| 8    | Sweep Tikhonov alpha through weak-mode reconstructions                         | Trace bias and propagated noise separately on fixed data                   |
| 9    | Raise a soft threshold and compare exact zeros with ridge                      | Move a scalar observation and see prior, likelihood and posterior          |
| 10   | Compare densities and square-root densities with Hellinger distance            | Condition a GP sequentially, linking kernel Gram structure and uncertainty |

Controls: one labelled scrubber, play/pause, restart; finite playback, no autoplay. Reduced motion uses discrete steps. Pause when offscreen or tab hidden. SSR shows a deterministic meaningful frame; noscript explains that scrubbing requires JavaScript. Captions, visible formula/summary and dash/point styles supplement colour. Static figures and proofs remain. Pure deterministic mathematics lives outside React and receives analytic/invariant/boundary tests.

Status: all 20 animations implemented across the ten weekly pages. User praised the previous notes and explicitly requested this animation pass; praise is not deployment approval.

## Authoring and API

Use `<ES98AAnimation kind="feature-lift" />` as a standalone top-level block. The `kind` string is one of the 20 literal values exported in `animationKinds`. Each kind can appear once per page because it owns a stable figure ID. The two ES98A chapter routes call `renderES98A`; other modules and the shared compiler are untouched. The compositor validates the allowlist and compiles each prose segment with scientificMDX. Keep footnotes, lists and JSX containers within one segment. The existing chapters have no footnotes split across markers.

Every kind has an executable example in [animation-gallery.mdx](animation-gallery.mdx), served at `/notes/es98a/animations` only in development. This module-specific gallery uses the exact same compositor. It is not a new shared component API and does not require central registration. Its production route returns notFound.

Each model is a pure `scene(kind, progress)` calculation. Progress is clamped to [0,1] and nonfinite values are rejected. `animationInfo` owns the title, parameter meaning, caption and assumptions. The SVG renderer performs no scientific inference. Geometric panels use equal coordinate scales; chart panels explicitly label their axes. Layout coordinates and marker radii are quantised to three decimals to avoid Node/browser transcendental rounding differences in hydration, without rounding the mathematical model.

Playback lasts nine seconds, ends once and supports replay. Reduced-motion preference changes playback to 18 discrete steps and is monitored for changes. No animation autoplays. IntersectionObserver and page visibility stop playback; unmount cancels the frame request and listeners. A scrub pauses playback. Controls are disabled in SSR until hydration, so no-JavaScript readers are not offered misleading active controls. The SVG, formula, explanation and caption are server rendered.

All examples use analytic teaching models or fixed seeded pseudorandom sequences. Replaying sampling figures does not generate new evidence. Gaussian-shape uses a triangular covariance factor LL\*=C, not the principal square root. The feature lift is an SVG projection of genuine three-coordinate geometry, with a paraboloid mesh and horizontal separating plane; no WebGL or added dependency is needed.

## Mathematical verification

`node_modules/.bin/tsx --test tests/scientific-math.test.ts tests/scientific/es98a/figures.test.ts tests/scientific/es98a/animations.test.ts`

31 checks pass: 13 existing numerical checks, six static-figure checks and 12 animation checks. New checks cover finite geometry and domain bounds over 41 frames for all 20 models; exactly two valid unique kinds per week; nonlinear separation; equal geometric axis scales; exact projection and SVD endpoints; Gaussian conditioning; spike energy; reproducible sampling and MH rejection; Tikhonov error splitting and sharp amplification; GP comparison with an independent 3×3 Gram solve; covariance symmetry, positive minors and monotonically decreasing variance; invalid progress and boundaries.

These are explicit local tests. The shared `test:math` command still does not discover module files. Proposed shared-owner follow-up: include the two module numerical test files in aggregate CI discovery. No package scripts were changed within this assignment.

## Current validation limitation

The full repository TypeScript check currently fails in unrelated `/projects` routes importing the missing `src/app/data/projects` module. An explicit ES98A type check, covering the new model, renderer, compositor, chapter/gallery routes and animation tests, passes. Do not describe the full repository check as passing. Unrelated project files have not been edited to conceal or fix that failure. The full production build was also attempted and fails at the same missing project-data imports, before production prerendering. No production success or deployment is claimed.

## Browser and visual evidence

`node_modules/.bin/playwright test --config tests/browser/es98a/animations.config.ts` uses the existing development server on localhost:3000, one browser worker and an ES98A-only output directory. It does not start or kill another worker’s server. `ES98A_TEST_URL` can select another already-running preview. The normal shared suite still expects its production build on port 3001, so that suite was not run against a stale build.

The final eight animation cases passed in 2.7 minutes: desktop and emulated-touch mobile interaction sweeps across all 20 figures; reduced-motion stepping, natural completion, replay and leaving the viewport; a synthetic visibility-change event; no-JavaScript reading across all ten weeks; and all 20 working development gallery examples. Interaction sweeps check keyboard scrubbing, play/pause, restart and mobile button taps, stable paused state, duplicate IDs, KaTeX errors, hydration errors, page exceptions, figure/page bounds at 320/768/1440 pixels and SVG text bounds. No physical device, Safari/Firefox, screen reader or touch-drag range gesture was tested.

All 20 endpoints were captured in light/dark themes on desktop and mobile at `artifacts/es98a/animated-{kind}-{desktop,mobile}-{light,dark}.png`. Manual review covered representative figures from every week, including the feature lift on mobile, SVD composition, Gaussian slice, Metropolis rejection, Fourier overshoot, kernel evaluation, covariance modes, bias/noise balance, soft threshold and GP conditioning. Fixed site navigation is hidden only during the screenshot capture to avoid covering figure headings; app navigation is unchanged. Intermediate-state numerical geometry was checked over 41 frames per model by the numerical suite.

Browser testing exposed last-bit Node/Chromium coordinate differences; SVG quantisation fixed the hydration warnings. It also exposed the implicit live-region role of an HTML output element. The progress percentage now uses an ordinary visual span while the slider provides aria-valuetext; only brief playback events use the explicit live status region. A temporary unrelated ES98E parse error interrupted an intermediate run; it resolved in that owner’s files before the final passing run. This worker did not alter that module.

Final caption review calls the feature view an **oblique** projection, matching its actual linear projection map. After that wording-only correction, the original Week 1/2 interactions are checked separately alongside the new animations, with updated feature-lift screenshots. The eight-case result above certifies the unchanged animation behaviour rather than a full-repository production build.

Shared-owner follow-up: include the ES98A numerical tests in aggregate CI, reconcile historical global documentation status tables, and resolve the unrelated projects-data build error. No shared compiler, registration API, global CSS, build config or other module was edited for these animations.

Final pilot regression: `node_modules/.bin/playwright test --config tests/browser/es98a/animations.config.ts --grep 'original pilot'` passed both desktop/mobile cases in 14.2 seconds. It verifies the final oblique-projection caption and capture, Week 1 prediction reveal and exact calibration preset, and Week 2 prediction reveal, singular-value keyboard boundary and step navigation. The complete browser evidence is eight animation cases plus these two regression cases, all passing. Final ES98A-scoped TypeScript, ESLint and formatting checks pass. Full-repository build remains blocked by the separate missing projects data module.
