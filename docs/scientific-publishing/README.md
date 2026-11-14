# Scientific publishing: start here

The goal is to make mathematical understanding easier, deeper and more intuitive. Attractive lecture notes with figures appended are not sufficient. The article must explain why each concept is needed, develop it rigorously, and connect it to what the reader already knows.

This handoff is for agents without the original conversation. Implementation claims were checked against the repository on **14 November 2026**. Code is authoritative for behaviour; [decisions and status](decisions.md) preserve the user's intent. Recheck both when extending the system.

## First session

1. Read repository [AGENTS.md](../../AGENTS.md), [decisions](decisions.md) and the [editorial guide](editorial-guide.md).
2. Read [module continuity](module-continuity.md). Inventory and read the entire assigned module before choosing its first intervention. For ES98A use the [curriculum map](es98a-curriculum-map.md) and [Week 1 plan](week1-editorial-plan.md).
3. Read [architecture](architecture.md), [component reference](component-reference.md), [design principles](design-principles.md) and [accessibility](accessibility.md). Inspect corresponding code before changing it.
4. For parallel work, establish ownership using [the four-agent protocol](parallel-workflow.md) **before editing**. Shared infrastructure has one designated writer, even when all four agents need it.
5. Use the [authoring workflow](authoring-workflow.md) and [handoff templates](handoff-templates.md). Review prose independently of browser behaviour. Record actual validation.

## Current state

| Area             | Implemented state                                                                                                      | What this does not imply                                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| ES98A Week 1     | Complete editorial/visual pilot; rotating-rulers experiment, two newer button-based experiments and six static figures | The user praised the revised exposition and requested richer visuals; the latest figures have not received a subsequent user review |
| ES98A Week 2     | Retained SVD/noise-sensitivity prototype at its own static route                                                       | Its theorem-first exposition is not the final course-wide template                                                                  |
| ES98A Weeks 3–10 | Existing sources rendered, labelled original notes awaiting review                                                     | Successful rendering does not establish mathematical correctness                                                                    |
| Notes navigation | `/notes` → ES98A index → ten weeks                                                                                     | Other modules are not automatically discovered or routed                                                                            |
| Other formats    | Shared primitives can support future explorations and research essays                                                  | No dedicated exploration/research pipeline, experiment runner or bibliography database exists                                       |

The editorial pilot is `/notes/es98a/week1`; the development-only gallery is `/dev/scientific-components`. Start with `npm run dev`. See [architecture](architecture.md#validation-and-local-runtime) for exact test commands, discovery limits and browser ports. The gallery compiles [real MDX examples](examples/gallery.mdx) and returns 404 outside development.

## Architecture

- Content stays in `_notes`; `.md` is compiled as MDX. The ES98A index and allowlisted dynamic week route expose the ten existing notes without editorially rewriting later weeks. The existing static Week 2 route remains intact. Week 9's images are served as static imports. Arbitrary filesystem paths cannot be selected by a route parameter.
- `src/lib/scientific-mdx.tsx` compiles trusted repository content on the server with next-mdx-remote, remark-math, remark-gfm and rehype-katex. Frontmatter uses gray-matter. Structured JSX props are enabled (`blockJS: false`) for choices and explanations; the compiler's dangerous-expression checks remain enabled. Never accept external/user-submitted MDX here. KaTeX trusts only `\\htmlClass`, not arbitrary HTML commands. Components are registered centrally.
- `src/components/scientific/core.tsx` contains structural Figure/Sidenote components; `interactions.tsx` contains small client islands; `pilot.tsx` contains specialised mathematical views; `math.ts` holds pure calculations. Native SVG needs no graphics library.
- `article.css` is scoped to scientific articles, uses existing theme/fonts and does not change homepage styles. KaTeX CSS loads only on scientific routes.
- Week 1's `model-experiments.tsx` contains two small client interactions. `week1-diagrams.tsx` contains six static explanatory figures; `diagram-primitives.tsx` holds internal SVG layout helpers and `week1-math.ts` their real 2D calculations. No new dependencies are required for these figures.
- The development route returns notFound outside development. Examples are compiled by the gallery rather than maintained as disconnected snippets.

New runtime dependencies: next-mdx-remote, gray-matter, remark-math, remark-gfm, rehype-katex, katex. Development: tsx, @playwright/test, @types/katex. These fill missing infrastructure in this checkout; see [audit and pilot analysis](pilot-analysis.md).

## Guides

[Design principles](design-principles.md) · [Editorial guide](editorial-guide.md) · [Component reference](component-reference.md) · [Patterns](visualization-patterns.md) · [Accessibility](accessibility.md) · [Authoring workflow](authoring-workflow.md) · [Working MDX](examples/gallery.mdx) · [Reference study](references.md)

Handoff: [decisions](decisions.md) · [verified architecture](architecture.md) · [module continuity](module-continuity.md) · [parallel ownership](parallel-workflow.md) · [handoff templates](handoff-templates.md) · [fresh-agent review](handoff-review.md).

## Rollout

See [Stage 1 validation and limitations](validation.md) for historical implementation checks. They are not a promise that a future checkout passes. Screenshots under ignored `artifacts/` are local outputs, not guaranteed repository assets. The [original Week 2 audit](pilot-analysis.md) describes the pre-framework checkout, not current capabilities.

The user replaced the contrasting-note rollout with chronological, curriculum-aware development. Review Week 1 as mathematical writing as well as UI before extending the pilot. Each revision must identify prerequisites, link earlier explanations and update the notation/error ledger. Keep archive notes clearly distinguished from revised chapters. Search for existing figure IDs before inserting anything. Different publishing formats share primitives without sharing one mandatory editorial structure.

This documentation task does not start four agents, assign modules or authorise a site-wide migration. Future explicit module assignments define their own scope. Deployment still requires the user's approval.
