# Develop a module as one learning experience

An agent owns the intellectual continuity of an assigned module, not just a collection of files. Start from the actual sources and their broad topic order. Weekly labels, old contents pages and polished headings can misdescribe the material: ES98A Weeks 3 and 4 are concrete examples in the existing curriculum map.

## Read and map before editing

Inventory every source chapter, image, exercise, annotation and reference. Read all available content in manageable chunks; a truncated tool response or a headings search does not count as a full reading. Record missing handouts and incomplete chapters instead of inferring their contents. If the module is one long viva-preparation document, map its existing sections rather than inventing ten weeks.

Create a curriculum map in the assigned documentation area using the [template](handoff-templates.md). ES98A already has [one](es98a-curriculum-map.md); update it in place rather than creating a rival map. Include:

- Actual concepts, objectives and source paths for each chapter/section.
- Prerequisites: assumed on entry, established earlier in the module, and genuinely new here.
- Definitions, notation, conventions, domains and hypotheses with a first-introduction location.
- Which earlier intuitions/figures can be extended, which should be linked, and what the present extension adds.
- Source-error candidates, repeated passages, missing material and the evidence needed for a correction.
- Chapter status: original, analysed, drafted, mathematically checked, browser checked, ready for review, or user-reviewed. These are editorial statuses, not an implemented CMS schema.

Do not make chapters uniform merely because one lesson worked well. A theorem, counterexample or algorithm may be the most natural opening. Preserve prerequisite order while improving exposition and local sequencing substantially.

## Maintain four ledgers

**Definitions and notation.** Give each important object a meaning, domain, first-use anchor and dependencies. Record deliberate symbol reuse. For ES98A the inner product conjugates its first argument and `(a ⊗ b)x = ⟨a,x⟩b`, so the matrix is `ba*`. Do not silently replace this with a more familiar tensor convention. Stress σ, singular value σᵢ and noise variance σ² need explicit local introductions. A convention in one module is not automatically imposed on unrelated subjects; state translations when linking between them.

**Assumptions and scope.** Track the difference between real/complex, finite/infinite dimensional, exact/noisy, SPD/SPSD, sample/population, independent/correlated and illustrative/empirical. An inherited theorem can only be used under its hypotheses. Extending a visual analogy must identify the new condition: e.g. a finite-dimensional projection picture does not establish closedness or convergence in a Hilbert space.

**Representations and examples.** Track what a figure's axes, colours, strokes and parameters mean, its scale and fixed quantities, and where it will return. Reuse the mathematical representation when it is helpful; do not duplicate the entire widget in every chapter. Fixed-ID components can appear only once on a page. Extend the story without assuming that every prior figure's implementation is generic.

**Corrections and evidence.** Separate suspected errors from verified repairs. Record the old claim, corrected statement, changed hypotheses, derivation or primary reference, affected chapters and validation. A visual should never be made convenient by weakening a theorem silently. Fix within the assigned scope; put findings about another module in a handoff for its owner.

## A chapter's contract with its neighbours

Before writing each section, answer four questions: what motivates it, what intuition is being developed, what mathematical result is introduced, and how the figure (or deliberate absence of a figure) advances the reasoning? Keep this analysis in module docs, not as mechanical labels in the article itself.

At the opening, state a question arising from what is already known. Link the exact earlier definition/result and recall only what is necessary. Explain the new difficulty. At the end, interpret the result and identify the next genuine question. Avoid repetitive “in the previous week we learned…” boilerplate and artificial cliffhangers.

Standalone reference usefulness comes from clear local definitions of symbols, visible assumptions and stable result anchors. It does not require copying every earlier proof. A reader arriving mid-module should find the prerequisite link and understand the present theorem's statement immediately.

### ES98A continuity examples

| Established intuition                                                          | Later extension                                                  | What must be added, rather than silently assumed                                                                   |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Week 1: one parameter constrains all Hooke predictions; fitting is projection  | Week 2: normal equations and SVD; Week 8: inverse problems       | Distinguish best predicted vector from unique parameters, input/output bases, noise sensitivity and regularisation |
| Week 1: coordinates change, vector and squared length do not                   | Week 5: Fourier/Hilbert expansions                               | Completeness, convergence, equivalence classes and appropriate function domains                                    |
| Week 1: measure → scalar → reconstruct                                         | SVD modes, kernel operators and later random series              | State domain/codomain, preserve conjugation and course outer-product order                                         |
| Week 1: positivity tests every direction; Gram matrices encode squared lengths | Gaussian covariance in Week 3 and covariance operators in Week 7 | PSD versus a full-dimensional density, centring, trace conditions and infinite-dimensional limitations             |
| Week 1: deterministic coordinate energy                                        | Week 7: total variance of random coefficients                    | Probability assumptions and the relevant expectation/convergence justification                                     |

These are planned narrative connections grounded in source topics, not claims that later chapters have already been rewritten or that GP/covariance widgets exist.

## Editorial acceptance before moving on

Read the prose without operating any controls. Can the reader explain why a definition appears, what an equation answers and what a proof establishes? Then inspect the figures: do they show the relationship the prose promises? A successful browser test answers neither question by itself.

Check that the reference version still contains the original mathematical substance and citations. Audit all changed and incoming links, explicit figure numbers and notation. When revising a previously established convention, assess downstream chapters before changing it. Proceed in chronological, reviewable batches within the scope of the user's assignment; do not silently expand a pilot into a complete migration.

At a checkpoint, leave the next agent the exact next source/section, what the reader now knows, unresolved mathematics, pending shared changes and commands/results. Use [handoff templates](handoff-templates.md), not a vague “continue polishing” note.
