# Stage 1 validation

## Week 1 explanatory-figure revision

Completed locally on 14 November 2026. Added Hooke-law and model-family experiments, plus six server-rendered static sequences for Parseval, outer products, least squares, the adjoint, directional positivity and Cholesky. Retained the rotating-rulers experiment and formal derivations. The homepage open-endedness summary now ends with a full stop. No later note sources were changed in this pass, and no dependencies or deployment were added.

- Production build succeeds with 22 generated pages; repository ESLint, TypeScript and `git diff --check` pass.
- All **13 numerical tests** pass. New checks cover coefficient linearity across the plotted domain, the course outer-product convention and discarded information, analytic least-squares residual/perturbation sensitivity, the adjoint identity, directional quadratic-form extrema, and both Cholesky/principal-root factorisations. Existing Parseval, projection and inverse-noise checks remain intact.
- All **16 browser cases** pass in the final complete run (32.2 seconds). New cases exercise mouse/keyboard/mobile-touch model and strain selection, pressed/live states, different plotted families, unique figure IDs, caption visibility, bounds at 320/768/1100/1440px and production no-JavaScript SVG/fallback rendering. Existing article, gallery, route, citation, sidenote, popup and prediction tests still pass.
- Visually inspected desktop and emulated-mobile figures in the dark theme, plus Hooke, quadratic-family and positivity diagrams in the light theme. A reduced-motion desktop browser inspection also found no SVG text extending outside its viewBox. Screenshots are in ignored `artifacts/`: `{figure-id}-{desktop,mobile}.png`, `hooke-experiment-light.png`, `model-families-light.png`, `positive-directions-light.png`, and full `week1-{desktop,mobile}.png`.
- The first run exposed a test selector issue: Playwright excludes the `noscript` container's text; checking its rendered child paragraph verifies the actual fallback. A later run exposed an intermittent homepage tap before hydration/font layout settled. The test now waits for Home's existing scroll-lock effect and font readiness before tapping. Both corrected checks pass in the final suite.

Limits remain: no physical-device, screen-reader, Safari/Firefox or formal performance/bundle audit. Mobile evidence uses Chromium emulation. Static SVGs require no plotting runtime, canvas, WebGL or animation loop. The pre-existing warning about a package lock outside the repository remains. These checks do not certify later archived notes' mathematics.

## Chronological Week 1 revision

The current revision adds the Week 1 editorial pilot, ES98A index and original-note routes, homepage grouped explanations and Blog navigation. All ten source weeks were read before rewriting Week 1. Later source notes remain unchanged; Week 2 retains its previous experimental content.

Final local verification: production build (22 generated pages), TypeScript and repository ESLint pass; seven numerical tests and fourteen desktop/mobile browser cases pass. Tests cover Week 1's prediction/reveal, rotating coordinates, calibration preset, reset, Parseval/reconstruction/orthogonality invariants, keyboard input, 320/768/1440px figure bounds, no-JavaScript production reading, all ten week routes, Week 9 images, module links, About-to-Blog redirect, grouped homepage content and explicit touch activation. Existing Week 2/gallery checks still pass. Pilot tests observe no page exceptions or hydration errors. No new dependencies were added.

Desktop/mobile screenshots of Week 1's figure and the grouped homepage popup were visually inspected. Files: `artifacts/week1-desktop.png`, `week1-mobile.png`, `week1-figure-desktop.png`, `week1-figure-mobile.png`, `home-fields-desktop.png`, `home-fields-mobile.png`. The mobile popup screenshot waits for its ancestor's entry animation to complete so the preview represents the visible result.

The initial expanded browser run hit timeouts compiling multiple legacy chapters and waiting for full-page load. Archive route checks now use prerendered production pages; navigation checks wait for DOM readiness and assert the target content. Browser workers are limited to two. The final complete run passed all fourteen cases in 31.7 seconds.

Mathematical qualifications and prose evaluation are recorded in `week1-editorial-plan.md`; the module-wide review queue is in `es98a-curriculum-map.md`. Browser checks do not certify the unreviewed mathematics of archived later weeks. No physical-device, screen-reader, Firefox/Safari or formal performance audit was performed. No deployment occurred. Week 1 is ready for editorial review before further chronological rewriting.

## Original Week 2 prototype

Validated locally on 14 November 2026, Node 24.19.0, Chromium supplied by Playwright.

- Production Next build succeeds; pilot is prerendered. Production pilot HTTP 200; development gallery HTTP 404.
- Repository ESLint and TypeScript checks pass. Prettier checks pass on new/changed framework code, documentation and tests; legacy note formatting was intentionally preserved.
- Four numerical tests pass: fixed perturbation norm/inverse identity/spectral bound across parameter samples; analytic axes/isotropic boundary; singular null-mode behaviour; rejected invalid arguments.
- Eight browser cases pass across desktop/mobile projects: pilot rendering and interaction, gallery definitions and footnotes, production no-JavaScript fallback/gallery exclusion, and responsive/existing-route checks. Narrow-layout checks cover 320, 768, 1100 and 1440px. Tests inspect actual figure and sidenote bounds in addition to page scroll width.
- Pilot controls tested: choice/reveal/reset, range keyboard input, step navigation/reset, semantic equation/prose selection. Gallery tests cover tooltip focus, Escape, pointer click and an explicit mobile tap. No client exceptions observed in the pilot interaction test.
- More than 40 KaTeX expressions and 20 display equations render without KaTeX error markup. Legacy single-line `$$...$$` delimiters are normalised at compilation without modifying the expression.
- SVG and numerical summaries are server-rendered; production no-JavaScript readers receive the prediction explanation and later step content. Playwright text search excludes noscript, so fallback tests inspect its rendered paragraph elements directly.
- Screenshots in ignored `artifacts/`: full desktop/mobile articles, article viewport previews, and light/dark desktop/mobile figures. Desktop and mobile figure images were visually inspected. No plotting dependency, animation loop, canvas or WebGL was added.

Limits: no Safari/Firefox, physical-device, screen-reader, Lighthouse, bundle budget or field-performance audit was performed. Mobile tests emulate Chromium touch/viewport behaviour. These checks do not establish complete WCAG compliance. The existing Next warning about a package lock outside the repository remains. CI has been extended with numerical and browser checks but has not been run remotely.

No deployment, broad migration or git commit was performed. Existing unrelated migration changes remained in place. The original contrasting-note rollout was subsequently superseded by chronological module development; see the current README and decisions record.
