# PX457 final source and mathematical review

Review scope, 14 November 2026: preserve the existing complete chronological revision, compare all twenty source entries with their original bodies, and close explanatory and validation gaps. All available original bodies in `artifacts/px457/source-before/` and all current chapters were read before this pass. The originals agree with the tracked source inventory; ML1–ML5 originally contained frontmatter only. This review does not reconstruct missing lectures.

Initial exclusive paths for this pass: `_notes/px457/intro-optimisation.md`, `_notes/px457/openmp-variables-synchronisation.md`, `_notes/px457/openmp-loop-scheduling.md`, `_notes/px457/openmp-dependencies.md`, `src/components/scientific/modules/px457/models.ts`, `tests/scientific/px457/models.test.ts`, `tests/scientific/px457/snapshot.py`, and `docs/scientific-publishing/modules/px457/{curriculum,corrections,handoff,review}.md`. Generated validation output stays in `artifacts/px457/`. Shared files and other modules remain outside ownership.

## Chronological refinements

1. **Optimisation:** make reassociation tangible with two binary32 evaluation trees for the same three inputs. Explain ties-to-even, keep the real sum visible, and connect back to Week 1's disappearing increment. This supplies an exact example for the later reduction qualification. Change the five-accumulator guard to `i <= N - 5` under nonnegative `int N`, avoiding signed overflow in `i + 4` near `INT_MAX` while preserving remainder handling.
2. **Variables and synchronisation:** link the reduction's rounding warning to that worked example, retaining the algebraic partition argument.
3. **Scheduling:** derive contiguous and cyclic loads for `N=mP`, rather than leaving the plotted eight-iteration case as unexplained arithmetic. The gap between the largest and smallest loads explains why cyclic placement helps without removing all imbalance.
4. **Dependences:** distinguish fixed-point preservation from convergence through a fixed-Dirichlet versus periodic-boundary error experiment. Prove contraction over several two-buffer steps under explicit boundary hypotheses. This strengthens the existing warning about unsafe asynchronous updates; it does not authorise races or assert convergence of the in-place implementation.

## Source coverage assessment

The chapter-by-chapter inventory and principal corrections remain in [curriculum](curriculum.md), [corrections](corrections.md) and [handoff](handoff.md). The comparison found no additional substantive source chapter or image. Original repeated summaries and lab checklists are represented by the revised explanations and exercises. Historical hardware rates, cycle tables and carbon/cost estimates require the provenance qualifications already recorded in the correction ledger.

The fifteen substantive chapters form one course: numerical contract → instruction dependencies → locality → thread ownership → rank ownership → communication schedules → scaling → GPU indexing → derivative graphs. Source-order links and local definitions preserve standalone reference use. Following the user’s follow-up, the five empty ML entries have been removed from source pages, the contents and the route allowlist. Their original absence remains an editorial record only.

## User follow-up and ownership extension

The user requested removing em dashes wherever possible and allowed removing ML1–ML5. Replaced all PX457 em dashes with fitting punctuation or rephrased sentences. Deleted the five placeholder files, removed contents/final-chapter links, and shortened the route allowlist to the fifteen substantive chapters. Removed slugs must return 404; final navigation must stop at automatic differentiation. Module-only additional paths: `_notes/px457.md`, `_notes/px457/{memory-architecture,openmp-parallels-work-sharing,mpi-intro,higher-abstractions,ml1,ml2,ml3,ml4,ml5}.md`, `src/lib/px457.ts`, `tests/scientific/px457/render.tsx` and `tests/browser/px457/inspect.ts`. Snapshot copying now mirrors module folders so deleted placeholders cannot survive an overlay, and hashes the copied shared compiler/CSS rather than a possibly different live baseline. Additional module-owned path: `src/components/scientific/modules/px457/article.css`, where the h3 anchor offset prevents fixed navigation from covering linked subsections.

## Validation record

- Ten PX457 numerical/loader tests pass, including exact binary32 grouping, general triangular-load formulas, fixed/periodic error-grid values, nonincrease and several-step contraction, existing scaling/grid-stride/AD invariants, removed-slug rejection and absence of em dashes.
- All thirteen baseline numerical tests pass. Selected native C/OpenMP examples and MPI hello/squares at one, two and four ranks pass. The native suite was rerun after the overflow-safe accumulator guard changed.
- All fifteen chapters plus the index compile through the actual scientific MDX compiler. KaTeX, duplicate IDs and internal chapter/fragment targets pass.
- Scoped repository ESLint, Prettier and whitespace checks pass. A direct character scan found no em dash or HTML em-dash entity in any PX457 source, module code, test or editorial document.
- Final isolated production build and its TypeScript phase pass, producing all fifteen chapter paths plus the index. The snapshot is `/var/folders/h9/xtps6rh51x1d5dd3y15qq9c40000gn/T/px457-validation-w9p9rozs`; the last textual hypothesis clarification was copied and rehashed before its final rebuild. Module runtime hashes must agree with `artifacts/px457/snapshot-manifest.json`.
- Current-repository TypeScript and a separate production snapshot of the current checkout fail in unrelated project pages importing missing `src/app/data/projects`. The successful module build uses the earlier frozen integration with current PX457 files overlaid. No shared source or configuration was repaired.
- Final browser run passes thirty desktop/mobile cases and fifteen no-JavaScript pages, including both prediction flows, bounds/themes/navigation, removed-ML 404s and both h3 fragment targets below the fixed header. All twenty-one module runtime files match the final tested snapshot hashes.
- Visually inspected all sixteen static figures in desktop/light and mobile/dark screenshots. Figures and labels remain readable, mathematical colours track their stated roles, and captions retain the assumptions. Additional section screenshots exposed the h3 anchor/header issue, now fixed with a module-scoped offset and browser regression assertions. Screenshots live in `artifacts/px457/browser/`.

No CUDA toolkit/device execution, physical-device test, screen-reader review, full repository browser suite, remote CI, commit or deployment is claimed. The root build limitation and shared navigation/CI/style integration requests remain explicit in the handoff.
