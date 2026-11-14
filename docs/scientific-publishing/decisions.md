# Decisions, preferences and current status

This record captures the reasoning from the implementation conversations. **Established** means an explicit user preference or adopted engineering convention. **Pilot** means functioning code whose editorial/API generality is not yet established. **Future** means a possibility, not an implemented feature. Current user instructions take precedence over this record.

## Established editorial direction

| Decision                                                   | Rationale                                                                                                                                | Consequence                                                                                                                                              |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evaluate mathematical writing, not just a web page         | The first version looked polished but still read like lecture notes with attractive figures attached                                     | Each major section needs a motivating question, an intuition, a formal result and a reason for its visual treatment                                      |
| Motivation before notation where useful                    | The user especially admired the gold-mining opening in Distill's Bayesian Optimization article: a reason to care precedes machinery      | Use a genuine problem, puzzle or thought experiment; avoid a generic real-world story for every theorem                                                  |
| Thought experiments should let readers reason              | The GP article's linked views make abstract objects explorable                                                                           | Identify what changes, invite prediction when it exposes a misconception, then explain the result mathematically                                         |
| Preserve rigour, allow substantial editorial restructuring | Lecture wording is not sacrosanct; assumptions, dependencies, results and evidence are                                                   | Improve exposition within the module's broad topic order; retain findable definitions, equations, proofs, exercises and references                       |
| Treat a module as a cumulative course                      | Independent weekly rewrites cause repeated introductions and inconsistent conventions                                                    | Read all sources, map dependencies/notation, then develop chapters chronologically; link rather than repeatedly re-teach                                 |
| Figures belong inside the argument                         | A diagram inserted after an equation does not automatically teach                                                                        | Introduce what to compare before it and interpret the discovery afterwards; retain the formal derivation                                                 |
| Visual explanation need not be interactive                 | The user likes 3Blue1Brown's geometric reasoning and supplied a static Distill sequence: observations → covariance matrix → conditioning | Use adjacent panels when simultaneous comparison helps. Controls must answer a counterfactual. Do not copy the image or imitate a visual brand wholesale |
| No figure-count quota                                      | The original maximum-three proposal and early two-intervention pilot left difficult concepts visually unsupported                        | Use a conceptual-purpose test. A simple Hooke-law picture can establish a representation reused later                                                    |
| Keep reference utility                                     | Readers must retrieve a theorem without rereading the entire narrative                                                                   | Keep descriptive headings, stable anchors, hypotheses and visible derivations                                                                            |

Week 1 demonstrates the standard. Two inconsistent stress observations motivate a loss function. The reader solves a one-parameter fit algebraically, develops coordinates, reconstruction and projection, then recognises the same optimum geometrically. The second encounter explains the first. The stress–strain graph and observation-space line have different axes; the revised chapter makes that distinction visible.

The user praised the revised exposition and rotating-rulers experiment. The subsequent request added Hooke's law, selectable linear/quadratic/Fourier families, Parseval, outer products, least squares, adjoints, positivity and Cholesky visuals. These additions are implemented and locally tested. Do not record that as user approval of the latest visual pass or authorisation to migrate every remaining note.

## Established engineering direction

- Integrate into the minimalist, academically oriented site inspired by Dao Ho. Keep warm paper/ink themes, typography, narrow text, purposeful outsets and restrained colour. Avoid dashboard cards, decorative gradients and control-heavy panels.
- Preserve working infrastructure. The initial audit found no operational scientific MDX pipeline despite the original assumptions; the current compiler/components were then built. That historical absence is not the current state.
- Use React/Next.js and trusted repository MDX. Distill's older Rollup/web-component template is a layout reference, not a dependency.
- Separate structural components, topic-specific numerical computation and pedagogical conventions. The small flat directory is intentional; the originally suggested deep folder tree is not mandatory.
- Native SVG suffices so far. Mafs, D3/visx, React Three Fiber and Python/JAX exports are options for demonstrated needs, not installed requirements. Avoid expensive browser computation without a learning benefit.
- Server-render explanations and deterministic initial graphics. Client components are for actual state. Reinforce colour with labels, patterns or underlines; support keyboard/touch and reduced motion.
- Correct mathematical errors openly. Week 1 repaired Cholesky hypotheses/product order and SPSD uniqueness, qualified rank one, distinguished stress/strain from force/extension, and clarified linear-in-parameter models versus statistical GLMs. The [curriculum ledger](es98a-curriculum-map.md) separates completed repairs from later review candidates.
- Keep changes reviewable. Do not stage/revert the pre-existing migration indiscriminately. Deployment requires explicit approval; routine reversible implementation choices do not require repeated permission.

## Pilot and future boundaries

| Area                                                                                                  | Status                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared Figure/Term/linking/prediction/step primitives                                                 | Implemented; limitations in the component reference. No API versioning system exists                                                                      |
| Week 1 specialised figures                                                                            | Working examples with fixed data, IDs and no props; not generic solvers or a universal diagram API                                                        |
| Week 2 SVD/noise prototype                                                                            | Useful experiment; reconcile its exposition with chronology when Week 2 is assigned                                                                       |
| Later ES98A sources                                                                                   | Render as original notes, with known review issues; a build does not certify their mathematics                                                            |
| Four-module concurrency                                                                               | Ownership protocol documented here; no orchestration service, file lock or active agent assignment implemented                                            |
| Lecture notes / explorations / research essays                                                        | Shared visual infrastructure, distinct editorial structures. Research writing must distinguish hypotheses, evidence, uncertainty and teaching simulations |
| LinkedViews, ParameterPlayground, ProofReveal, ReproducibleExperiment, AlgorithmTrace, ComparisonView | Not implemented; introduce only for a real article                                                                                                        |
| Blog presentation                                                                                     | Destination exists; requested Gwern/LessWrong-like long-form style is deferred until posts are written                                                    |

## Other site preferences to preserve

These implemented decisions are context, not permission for module agents to edit the homepage:

- Open-endedness copy is exactly: “agents endlessly co-evolving, competing, and collaborating to create novel complexity without a central goal.” The final full stop was explicitly requested.
- “Several different fields” uses a grouped popup: AI Safety (persona vectors/interpretability; BlueDot TAIS), Palantir Winter Tech Fellow (AIP), Augmentum Fintech (automated screening/sourcing), Quantitative Finance (Optiver, MCD Capital, BSc intraday RL trading). Exact copy lives in `src/app/data/sources.ts`; rendering in `src/app/components/citation.tsx`.
- Blog replaces About in navigation; `/about` redirects to `/blog`. This is not a finished blog publishing framework.
- Notes should be browsed module first, then weeks/chapters, not as a flat “module · week · title” list. ES98A implements this; other module routes still need integration.

The largest earlier handoff gaps were entire-module responsibility, exclusive ownership, shared registration, test-discovery limits and the distinction between assigned work and future rollout ambitions. [Module continuity](module-continuity.md) and [parallel workflow](parallel-workflow.md) now address them explicitly.
