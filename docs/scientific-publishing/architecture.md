# Implemented architecture

Verified against source and `package-lock.json` on 14 November 2026. Locked versions: Next.js 16.4.3, React 19.3.1, next-mdx-remote 6.0.0, KaTeX 0.19.1 and Tailwind 3.4.18. Package ranges are not exact installed versions. Read the relevant bundled Next guides before changing framework code, as required by AGENTS.md.

## Content to article

1. `_notes/es98a/week1.md` through `week10.md` are repository-owned Markdown **compiled as MDX**, despite the `.md` extension.
2. `src/lib/es98a.ts` reads exactly those ten files and their frontmatter. It is not a module registry or crawler.
3. `src/lib/scientific-mdx.tsx` strips frontmatter using gray-matter, normalises legacy single-line display-math delimiters, and calls `compileMDX` from `next-mdx-remote/rsc`. It returns `{ title, content }`; the title fallback is “Scientific article”.
4. remark-math handles math, remark-gfm supplies GFM including footnotes, and rehype-katex renders equations. KaTeX trusts **only** `\htmlClass`, with strictness set to warn.
5. The compiler's component map is the exports of `src/components/scientific/index.ts`. New files are **not** automatically registered. `blockJS: false` enables structured expression-valued props for reviewed repository content; MDX is executable code, not a safe external-content input format.
6. Routes supply `.scientific-article`, article/KaTeX CSS and navigation. Frontmatter `layout` does not select a Jekyll layout; there is no Liquid `site.baseurl` expansion.

Registered names are the supported MDX authoring path. There is no documented arbitrary-import resolver, module-specific registry argument or component auto-discovery. Coordinate registration with the shared owner rather than inventing a parallel compiler.

## Routes

| Path                         | Source and behaviour                                                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/notes`                     | `src/app/notes/page.tsx`: explicit ES98A link only                                                                                                                              |
| `/notes/es98a`               | Index uses `es98aWeeks()`, not `_notes/es98a.md`                                                                                                                                |
| `/notes/es98a/[week]`        | Allowlisted generated params, `dynamicParams=false`, awaited params and exact lookup. Generates Week 1 and Weeks 3–10; prev/next links and original-note warning for numbers >2 |
| `/notes/es98a/week2`         | Separate static page reading its one source; takes precedence over the dynamic segment and lacks that route's prev/next footer                                                  |
| Week 9 images                | Two static imports from `_notes/es98a` and two explicit Markdown URL replacements in the dynamic route; not a general relative-image resolver                                   |
| `/dev/scientific-components` | Compiles `docs/scientific-publishing/examples/gallery.mdx`; calls `notFound()` outside development, additionally sets noindex/nofollow                                          |
| `/blog`, `/about`            | Blog placeholder and redirect; not connected to the scientific compiler                                                                                                         |

Another module needs explicit index/article routes and a navigation integration change. Existing Markdown is not proof that a URL exists. Do not blindly render legacy Liquid or monolithic viva notes through a guessed weekly loader.

## Component boundaries

| File under `src/components/scientific/` | Responsibility                                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `core.tsx`                              | Figure, Sidenote; no client directive                                                                              |
| `interactions.tsx`                      | Client Term, LinkedEquation/LinkedTerm/LinkedMark, PredictReveal, Stepper                                          |
| `projection.tsx` / `projection-math.ts` | Client rotating ONB/calibration figure; pure real 2D projection math                                               |
| `model-experiments.tsx`                 | Client Hooke and three-family examples                                                                             |
| `week1-diagrams.tsx`                    | Six static figures; no client directive                                                                            |
| `diagram-primitives.tsx`                | Internal Plane/Vector/Panel and fixed-scale helpers; not public MDX exports                                        |
| `week1-math.ts`                         | Real Vec2/Mat2 operations, analytic stiffness fit, feature functions, directional quadratic form and fixed factors |
| `pilot.tsx` / `math.ts`                 | Client SVDExplanation/NoiseExperiment; diagonal inverse-noise calculation, not an SVD solver                       |
| `index.ts`                              | Central public exports, used directly by the MDX compiler                                                          |
| `article.css`                           | Scientific classes and article descendants, imported by relevant routes                                            |

Static figures remain server-rendered in current article usage. Importing them through a client boundary can pull dependencies into the client graph: do not add `use client` to the whole barrel/article. Keep computation independently testable. `week1-math.ts` assumes finite teaching inputs except its zero-strain fit guard; it is not a robust general solver library.

`orthogonalCoordinates` validates finite vector/angle values and returns the basis, coordinates, projections and conserved energy. `inverseNoise` permits σ in [0,1], finite angle and nonnegative magnitude; at σ=0 it drops the null mode. The UI excludes zero (0.05–1). Its bound at zero concerns the pseudoinverse, not the undefined expression magnitude/0.

## Layout and scholarly apparatus

The text container is 680px including 24px side gutters. Wide/breakout figures gain 160/280px at ≥1100px. Sidenotes become right-margin floats at ≥1300px; there is no collision manager. Week 1 storyboards and Week 2 paired plots have different stacking rules; see [design principles](design-principles.md).

Figure references are explicit fragment links; numbering is manual and optional. Week 1 uses descriptive titles/anchors; Week 2 retains “Figure 1”. No cross-reference resolver, automatic contents generator or theorem-numbering engine exists. Citations are explicit links/reference lists, not BibTeX. Homepage citation popups are separate UI.

Display equations scroll inside their own block. No-JavaScript figures use the same server-rendered SVG; PredictReveal/Stepper additionally expose explanations in noscript. Term definitions are hidden until interaction, so important definitions must also appear in prose. There is no screenshot-fallback prop, generated SVG download, production PDF exporter or demonstrated full screen-reader compliance.

## Validation and local runtime

| Command                                         | Actual scope                                                                                                     |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                                   | Next development server, default 3000                                                                            |
| `npm run test:math`                             | **Only** `tests/scientific-math.test.ts`, via tsx/node:test; new files are not automatically included            |
| `npm run lint` / `npx tsc --noEmit`             | Repository ESLint / TypeScript                                                                                   |
| `npx prettier --check <explicit changed files>` | Scoped formatting. `npm run format:check` checks the whole repo; avoid broad write-formatting during scoped work |
| `npm run build`                                 | Production compilation/prerendering, not mathematical proof or visual inspection                                 |
| `npm run test:browser`                          | Builds, then runs Playwright                                                                                     |
| `npx playwright test`                           | Uses the existing production build; does not build first                                                         |

Use the Node/npm setup (`package.json` requires Node ≥20.9; CI uses Node 24); `npm ci` installs the lockfile in a clean checkout. Install Chromium with `npx playwright install chromium` when needed.

Playwright uses two workers, Chromium desktop 1440×1000 and emulated-touch mobile 390×844; tests also exercise narrower/wider viewports. It reuses or starts development on **3000** and starts production on **3001** with reuse disabled. Several tests hard-code 3001. Do not run four copies, silently reuse another worktree's server or assume environment variables parameterise these ports. See [parallel testing rules](parallel-workflow.md#test-and-build-ownership).

CI (`.github/workflows/ci.yml`) installs with npm ci on Node 24, runs lint/format/types/build/numerical tests, installs Chromium and runs Playwright. It is not a deployment workflow. Local success does not establish a remote CI result.

`artifacts/`, Playwright results and `.next/` are ignored outputs. A worktree made from HEAD does not include uncommitted/untracked framework files: establish a reviewed baseline before parallel branching. The current checkout contains extensive pre-existing migration changes; do not use blanket staging or cleanup to manufacture a clean baseline.
