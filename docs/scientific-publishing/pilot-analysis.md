# ES98A Week 2: analysis before implementation

**Historical record of the initial, pre-framework audit.** The statements below that notes/MDX/layouts were absent describe that earlier checkout. See [current architecture](architecture.md) and [decisions](decisions.md) for what now exists. The minimal two-intervention scope and preserve-wording approach were superseded by chronological Week 1 exposition and the later richer visual pass. Do not apply this document as current rollout instructions.

The complete `_notes/es98a/week2.md` was read before choosing figures. Learning objectives: interpret Hermitian eigendecompositions and SVD; derive least-squares normal equations; understand uniqueness and inverse sensitivity; define probability spaces, conditional probability, random variables and induced laws.

Two interventions (no more are needed):

1. **SVD action, after its action-on-a-vector equation.** The reader must distinguish input coordinates, scaling and output directions. Selectable equation/prose terms explain projection → scaling → reconstruction. A staged explanation is sufficient; no independent matrix controls are needed. Preserve the note's outer-product convention `(a⊗b)c=⟨a,c⟩b`, conjugation, and the distinction between U and V.
2. **Noise amplification, immediately before the stability inequalities.** Small data errors need not imply small reconstruction errors. Ask which of two equal-length perturbations is more damaging for diag(1, 0.2), then reveal the analytic result. A linked SVG experiment varies noise angle and the smaller singular value. Preserve Euclidean norms, fixed noise magnitude 0.1, ordered positive singular values, and the exact pseudoinverse update. Explicitly label the real diagonal 2D model, coordinate bases, and fixed plot scales. Singular zero is excluded from the slider; explain separately that the pseudoinverse discards the zero mode and cannot recover it.

Preserve all original equations, exercises, annotations and probability sections. There are no existing figures, footnotes or reference entries in this note. The inverse formula following the full-column-rank paragraph retains that assumption; add a local clarification instead of changing its mathematics. Probability merits a later separate pilot; do not crowd this note with a third experiment.

# Repository audit

Actual checkout: Next.js 16.4.3 / React 19, App Router under `src/app`, TypeScript, Tailwind 3, local Geist fonts, light/dark CSS variables. The homepage and work routes already work. Notes is a placeholder. `_notes` holds legacy Markdown, not an operational MDX pipeline. There is no article layout, KaTeX, sidenote, breakout, footnote pipeline or scientific test suite to reuse. The existing homepage citation component is a source-preview interaction, not a scholarly bibliography processor.

CI runs npm ci, ESLint, Prettier, TypeScript and Next build. No production deployment workflow was found; CNAME names jabir.dev. Extensive pre-existing tracked deletions and untracked Next migration files make a blanket git commit unsafe. Keep this delivery as a scoped working-tree change; review the existing migration separately before committing.

Adaptation: retain `_notes`, add one explicitly allowlisted pilot route and server-side MDX compilation; do not expose every legacy note before review. Add scoped article CSS and client islands. No content folders, build-system replacement, legacy Distill runtime, or speculative research backend.
