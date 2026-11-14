# Editorial guide

## Chronological, curriculum-aware exposition

The current editorial pilot is **ES98A Week 1**. Before rewriting a chapter, read the entire assigned module and its curriculum map. Establish what the reader already knows, what new question the chapter answers, and where the new idea will be used. Develop chapters chronologically within the authorised scope; retain ES98A Week 2 as an experiment until it is assigned for revision. [Module continuity](module-continuity.md) defines the ledgers, prerequisite links and whole-module review process.

Write for a mathematically mature, technically curious newcomer. Start concepts with a reason to need them: a concrete problem, geometric puzzle, counterexample or question. A real-world story is optional. Never force an analogy where the mathematical question is already compelling.

A useful but flexible progression is question → intuition or exploration → definition → derivation/proof → interpretation and next question. Every paragraph should supply something the next paragraph needs. Each equation must answer a question already posed or sharpen a claim already motivated. Preserve prerequisite order, but restructure lecture wording freely to improve understanding.

Figures belong inside the argument. Introduce a specific experiment before the figure; afterwards interpret its outcome, derive why it occurs and state what the simplified model does not establish. Invite a prediction before giving away the result. One well-integrated experiment is preferable to several disconnected widgets. Reuse visual conventions as the mathematical setting expands: finite coordinates become Fourier coefficients, then random coefficients and spectral inverse filters.

Retain reference utility with descriptive headings, stable anchors, explicit assumptions, named definitions/theorems and visible proofs. Later weeks should briefly recall and link earlier results instead of re-teaching them. Keep the module's inner-product and tensor conventions consistent. Correct source errors transparently in an editorial record; preserving rigour does not mean preserving a false statement.

For each major section, record its motivating question, intuition, formal result and visual role (including a deliberate decision to use no figure). Review the prose independently of the UI: can a reader explain why each definition appeared, what each proof established, and how this section advances the course? A working slider is not evidence of good exposition.

Use `es98a-curriculum-map.md` and `week1-editorial-plan.md` as the current planning documents. The older theorem-first Week 2 prototype below is historical, not the final editorial model.

Start by naming what the reader should understand after a section. Preserve mathematical definitions, qualifications, proofs and notation. A diagram does not discharge a proof obligation.

Use intuition before formalism when a concrete experience makes the definition meaningful. A theorem-first section can be clearer when the statement itself poses the right question. The older Week 2 prototype keeps SVD first; that is an example of a local choice, not a model to impose on subsequent chapters.

Link representations of the same object using shared state and semantic identifiers. Identify what changes and what stays fixed. Explain transformations in a few stages; omit animation when discrete steps communicate them more clearly. Invite a prediction only when plausible alternatives expose an important misconception, and explain the outcome rather than scoring the reader.

Choose a static diagram for a fixed relationship. Use animation for a process whose temporal continuity matters. Use interaction when changing an input can answer a meaningful counterfactual question. Start with one or two controls, sensible defaults and a reset. Captions explain both the image and an experiment to try.

## Explanatory sequences, not an interaction quota

The Week 1 visual revision deliberately replaces the initial limit on figure count with a purpose test. A simple concept may merit a picture if it establishes a representation used later. Avoid both gratuitous controls and a blanket restriction that leaves difficult algebra visually unexplained.

For a fixed mathematical argument, use two or three adjacent panels with short explanatory captions. Each panel should perform one identifiable operation; retain the same object, scale and labels across the sequence. On mobile, preserve the reading order by stacking panels. Do not hide the later steps when simultaneous comparison is the point. This follows the mechanism of the supplied Distill covariance/conditioning illustration without copying its graphics.

Week 1 uses selectable strains for the physical law and selectable feature families for coefficient linearity. Parseval, outer products, least squares, adjoints, positivity and Cholesky are static explanations. The existing rotating-rulers interaction remains the place to experiment with projection. Controls earn their place by answering a counterfactual; static figures earn theirs by exposing a relationship the prose alone makes difficult to see.

Introduce each figure with a question or a specific comparison, then interpret what it shows. Distinguish graph space from observation space, direction from coordinate, and measurement from reconstruction. Colour helps track roles, but names, line styles and panel order must carry the argument independently. Keep source equations and proofs visible; a finite-dimensional picture does not establish a general theorem.

Lecture notes retain academic structure. Explorations can organise around a motivating question and progressively refine a model. Research essays must distinguish claims, measured evidence, hypotheses and conceptual simulations; report limitations, provenance and reproducibility. A teaching simulation is never evidence of empirical model behaviour.
