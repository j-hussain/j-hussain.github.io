# Reference study and decisions

- [Visual Exploration of Gaussian Processes](https://distill.pub/2019/visual-exploration-gaussian-processes/): coordinated distribution/function views make one mathematical object recognisable in several forms. Apply shared state to the data perturbation and reconstructed error; retain exact algebra beside geometry.
- [Exploring Bayesian Optimization](https://distill.pub/2020/bayesian-optimization/): a concrete motivating problem precedes progressively richer acquisition rules. Apply a focused prediction before the stability inequality; avoid imposing its narrative structure on every lecture section.
- [Building Blocks of Interpretability](https://distill.pub/2018/building-blocks/): representations are chosen around explanatory goals, and complex interfaces decompose into meaningful operations. Apply projection/scaling/reconstruction stages; avoid building an abstract interface grammar prematurely.
- [Zoom In](https://distill.pub/2020/circuits/zoom-in/): concrete evidence supports distinct claims, with uncertainty and counterarguments visible. Future research articles must separate observed evidence from conjecture and teaching simulations.
- [Communicating with Interactive Articles](https://distill.pub/2020/communicating-with-interactive-articles/): linked representations, reader prediction and reflection motivate the pilot. Interaction has to answer a question, with progressive disclosure controlling the amount visible at once.
- [Distill template](https://github.com/distillpub/template): inspected `src/styles/styles-layout.css` and `d-article.css`. Its text/gutter/page grid, responsive asides, figure outsets and contained math overflow inform a smaller React/CSS implementation. Preserve readable measure, explicit footnote/reference links and captions. No code/runtime or legacy build dependencies imported.
- [Dao Ho](https://www.daoho.dev/): restrained personal-site navigation and typography support retaining this checkout's existing visual vocabulary.

These are design references, not sources for new mathematical claims in the original lecture notes. The applications to noise/SVD above describe the first Week 2 experiment, not the final editorial target.

## Lessons reinforced in the user's review

- **Bayesian Optimization:** the gold-mining problem is the key preference, not merely its acquisition-function graphics. Establish a reason to need the mathematics. Week 1 now uses inconsistent Hooke-law observations as a problem that returns later as projection.
- **Gaussian Processes:** thought experiments and coordinated representations let readers reason before formal treatment. The same object should remain recognisable as the representation changes. Week 1 distinguishes parameter space, a model graph and observation space instead of treating their pictures as interchangeable.
- **Communicating with Interactive Articles:** encourage prediction and reflection, but control cognitive load. Interaction is justified by a question that changing something helps answer; the number of widgets is not a quality measure.
- **The supplied static GP illustration:** observations → pairwise kernel covariance → conditioning communicates a mathematical sequence through adjacent diagrams and explanatory text. Its lesson is panel-to-panel reasoning, not compulsory animation or a covariance component to copy into unrelated notes. That image was supplied conversationally; its Downloads path is not a repository dependency. The descriptions here and implemented Week 1 sequences preserve the relevant lesson.
- **3Blue1Brown:** the user explicitly values geometric explanations of Parseval, outer products, projection, adjoints and positive matrices. Use geometric transformations and consistent labels; do not infer a request for Manim, video production or a clone of its visual style.

Intuition motivates formalism; formalism then explains why the observed relationship holds. Lecture notes retain rigorous reference structure. Future research essays should draw on _Zoom In_ for claim/evidence progression rather than merely adding figures to a lecture-note template.
