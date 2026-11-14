# Four agents, separate modules, one shared system

This is an ownership protocol for future assignments, **not** an implemented agent launcher or locking service. No agents are assigned by this document. Four module workers may run concurrently; one of those four can also be designated the shared integrator. That role has exclusive authority to edit shared infrastructure during the assignment. It need not be a fifth worker, and it does not require a new user approval for every routine integration.

## Establish ownership first

The coordinator records four distinct modules, agent identifiers, branch/worktree or shared-checkout paths, exact writable paths, a shared integrator and a test schedule before concurrent edits. One file has one writer. Do not let each agent edit the global ledger to claim itself. The coordinator owns the assignment ledger; each worker owns its module handoff. Reassign only after the previous owner has stopped editing and handed off its changes.

Inventory verified on 14 November 2026:

| Source module | Existing content                                                   | Current routing / caution                                                     |
| ------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| ES98A         | `_notes/es98a.md`, `_notes/es98a/week1.md`–`week10.md`, two images | Only module currently routed. Legacy root index is not used by the Next index |
| PX457         | `_notes/px457.md` and 20 topic files in `_notes/px457/`            | No Next module route; source index supplies a topic order, not ten weeks      |
| ES98D         | `_notes/es98d.md`                                                  | Monolithic viva preparation, not an existing weekly directory                 |
| ES98E         | `_notes/es98e.md`                                                  | Monolithic source; inventory its actual sections before planning              |
| MA934         | `_notes/ma934.md`                                                  | Placeholder only; do not invent a course to fill four assignments             |

ES98A, PX457, ES98D and ES98E provide four **possible** non-overlapping source areas. This is not an instruction to start them or a certification that the other modules have been fully read/mathematically reviewed in this documentation audit.

## Writable and shared boundaries

For assigned module slug `<module>`, the coordinator can reserve these exclusive paths:

| Area                                                                       | Ownership rule                                                                                                                                                                    |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_notes/<module>.md`, `_notes/<module>/**`                                 | Module worker; preserve existing standalone files when no weekly directory exists                                                                                                 |
| `src/app/notes/<module>/**`, module-only loader such as `src/lib/es98a.ts` | Module worker after explicit path allocation; imports existing compiler/styles. A new route is still code to implement/test, not auto-discovered                                  |
| `src/components/scientific/modules/<module>/**`                            | **Proposed destination for new module-only implementations**, not an existing registry/loader. Create only when needed; keep existing files in place                              |
| `public/scientific/<module>/**`                                            | Reserved destination for new module assets if needed; not a promise these folders/assets exist                                                                                    |
| `docs/scientific-publishing/modules/<module>/**`                           | New module map, editorial plan, corrections, proposals and handoff, created when assigned. Existing ES98A map/Week 1 plan stay in their current locations and belong to its owner |
| `tests/scientific/<module>/**`, `tests/browser/<module>/**`                | Proposed separate test destinations. Numerical discovery needs explicit commands/integration; browser tests are under the existing testDir                                        |
| `artifacts/<module>/**`                                                    | Module's ignored screenshots and outputs; not a substitute for committed evidence descriptions                                                                                    |

These path reservations are workflow conventions, not folders already implemented by the framework. The coordinator lists any additional current files explicitly; an agent must not infer write ownership from a filename alone.

The shared integrator exclusively owns:

- `src/lib/scientific-mdx.tsx`, `src/components/scientific/index.ts`, `core.tsx`, `interactions.tsx`, `article.css`, `diagram-primitives.tsx` and other existing flat scientific files unless exact files are reassigned.
- Global navigation (`src/app/notes/page.tsx`, top/mobile navigation), app layout/theme/homepage, common components and config.
- Package manifests/lockfile, Next/TypeScript/ESLint/Tailwind/Playwright config, CI and root AGENTS.md.
- Global scientific README, editorial/design/API/pattern/accessibility documents and the shared executable gallery. Module workers write proposed documentation changes in their own handoffs.
- Existing aggregate tests `tests/scientific-math.test.ts` and `tests/browser/{scientific,week1}.spec.ts` until deliberately assigned otherwise.

Existing Week 1 files happen to be ES98A-specific but are flat, centrally exported and used by the shared gallery. Leave them under the shared owner by default; explicitly transfer exact files if an ES98A task needs them. Do not move them solely to make the proposed directory tree look complete.

## Shared-change request and integration

1. Reuse available primitives first. Implement genuinely new mathematical logic in the worker's module-only area and test it there. Prefix new exports and figure IDs with the module when ambiguity is likely. Do not fork Figure, Sidenote, the compiler or global CSS to bypass ownership.
2. If the change needs a central export, style, dependency or bug fix, write a concrete request in the module handoff: motivating article, exact proposed diff/API, consumers, assumptions, evidence, compatibility risk and required gallery/docs/tests changes. A small scoped CSS module may remain module-owned; new shared CSS belongs to the integrator.
3. The integrator batches requests and resolves overlaps once. Other workers may keep progressing on prose, computations and already supported diagrams. A new global abstraction is warranted by actual consumers, not four simultaneous guesses about future needs.
4. A component file is not usable in MDX until registered. Keep its proposed MDX insertion in module-local draft documentation until registration is integrated, or integrate registration and content together in the worker's isolated branch after the coordinator supplies the shared change. Do not leave the shared live tree referencing an unknown component and call the note complete.
5. The integrator adds exports, shared examples and docs, updates test discovery when needed, then runs combined validation. Workers verify their rendered pages against that integrated version. If shared behaviour changes, test existing consumers as well.

For an unavailable module route, a worker can implement its allocated route with existing APIs; the shared owner adds the global navigation link. Registration and navigation are explicit integration work, not reasons to invent a new publishing backend or ask the user to resolve minor code choices.

## Worktrees and checkpoints

Prefer isolated worktrees from a common **reviewed baseline** when available. This checkout has many uncommitted/untracked migration files; a worktree from HEAD may omit the entire framework. The coordinator must establish a complete baseline or deliberately use one shared checkout with exclusive paths. Do not copy secrets/generated directories, blanket-stage changes, clean the repository, or commit unrelated migration work to solve this.

Record the actual base revision and dirty-state caveat. Keep module commits scoped and chronological; shared integration commits should be separate. If the working tree cannot safely be committed yet, give an explicit file manifest and pending changes rather than claiming a checkpoint exists. Rebase/integrate deliberately, never overwrite another worker's files to silence a conflict. Preserve source URLs/anchors or provide reviewed redirects when splitting a monolithic note.

## Test and build ownership

The checked-in test setup is **not four-agent parallel-safe**. `.next/`, test results and screenshots are shared outputs in one checkout; browser runs use fixed ports 3000/3001, and some tests hard-code the production URL. Port 3000 can silently reuse the wrong server. Distinct git branches alone do not isolate ports.

- In a shared checkout, one designated worker runs builds/browser suites at a time, with a temporary agreed edit-free window for the tested sources. Others can read/plan; do not report tests against a moving snapshot. Do not kill an unknown or user-owned server to reclaim a port.
- Separate worktrees isolate build output, but fixed-port suites still run serially unless the integrator first implements and validates configurable ports/URLs/output paths. No such configuration is currently present.
- Independent numerical tests can run per module. Use `npx tsx --test <explicit module test files>` with real filenames: `npm run test:math` currently runs only the baseline aggregate file. The integrator must include new numerical tests in the package/CI command before calling them part of CI coverage.
- Local preview servers may use distinct explicit Next ports (`npm run dev -- --port <allocated-port>`); this does **not** retarget the checked-in Playwright suite. Record which checkout each preview serves.
- At integration, run baseline plus module tests, lint/types, scoped formatting, production build and browser checks, then inspect actual screenshots. Report exactly which commands ran against which integrated state.

Each worker hands off changed paths, mathematical corrections, continuity decisions, rendered/tested state, pending shared requests and the exact next task. Shared API documentation is updated by its owner. No agent deploys or undertakes an unassigned broad migration.
