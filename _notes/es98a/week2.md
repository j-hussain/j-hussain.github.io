---
layout: page
title: "Week 2: Least squares meets probability: normal equations + multivariate distributions"
---

The [Week 1 fit](/notes/es98a/week1#least-squares) had one adjustable direction. What if a model has many parameters, some of which barely change the observations? We need coordinates that separate what the experiment measures strongly, weakly and not at all.

The SVD supplies those coordinates. It also exposes a distinction that will guide the rest of the course: a best prediction can be unique even when its parameters are not, and a unique parameter estimate can still be unreliable. Probability then gives us a language for the uncertainty that a deterministic error bound cannot describe.

<h2 id="topics">Topics</h2>

- Matrix factorisations (continued): the singular value decomposition
- Least squares and normal equations
- Finite-dimensional probability

---

<h2 id="matrix-factorisations-continued">Matrix factorisations (continued)</h2>

<h3 id="recap-eigenvalueseigenvectors-for-hermitian-matrices">Recap: eigenvalues/eigenvectors for Hermitian matrices</h3>

Eigenvalue problem: given $A\in\mathbb{C}^{n\times n}$, find $\lambda\in\mathbb{C}$ and $q\in\mathbb{C}^n$ such that

$$Aq=\lambda q, \qquad |q|=1.$$

If $A$ is **Hermitian/self-adjoint** ($A=A^*$), then:

- all eigenvalues $\lambda_1,\dots,\lambda_n$ are real
- there exists an orthonormal eigenbasis $q_1,\dots,q_n$ with

$$\langle q_i,q_j\rangle=\delta_{ij}= \begin{cases} 1 & i=j\\ 0 & i\ne j \end{cases}$$

- writing $Q=[q_1\ \cdots\ q_n]$ and $\Lambda=\mathrm{diag}(\lambda_1,\dots,\lambda_n)$,

$$Q^*Q=I, \qquad A=Q\Lambda Q^*.$$

Using outer products:

$$A=\sum_{i=1}^n \lambda_i\,(q_i\otimes q_i).$$

Recall: for vectors $a,b$, the outer product acts by

$$(a\otimes b)c=\langle a,c\rangle\,b.$$

---

<h2 id="the-singular-value-decomposition-svd">The singular value decomposition (SVD)</h2>

An eigenbasis uses the same space for inputs and outputs. A rectangular map has no reason to permit that: its input and output dimensions may differ. Instead, seek paired unit directions satisfying $Av_i=\sigma_i u_i$. Measuring an input along $v_i$ produces an output along $u_i$, scaled by $\sigma_i$. This is Week 1's “measure then reconstruct” operation with different rulers on each side.

<h3 id="theorem-svd">Theorem (SVD)</h3>

Let $A\in\mathbb{K}^{m\times n}$ (with $\mathbb{K}=\mathbb{R}$ or $\mathbb{C}$). Then there exist **unitary** matrices

$$U\in\mathbb{K}^{m\times m}, \qquad V\in\mathbb{K}^{n\times n},$$

and a diagonal (rectangular) matrix $\Sigma\in\mathbb{R}^{m\times n}$ with diagonal entries

$$\sigma_1\ge\sigma_2\ge\cdots\ge 0$$

(and zeros off-diagonal) such that

$$A=U\Sigma V^*.$$

Equivalently: there exist orthonormal bases $u_1,\dots,u_m$ of $\mathbb{K}^m$ and $v_1,\dots,v_n$ of $\mathbb{K}^n$ and nonnegative numbers $\sigma_1,\dots,\sigma_r$ (where $r=\mathrm{rank}(A)$) such that

$$A=\sum_{i=1}^r \sigma_i\,(v_i\otimes u_i).$$

Action on a vector $x\in\mathbb{K}^n$:

$$Ax=\sum_{i=1}^r \sigma_i\,(v_i\otimes u_i)x = \sum_{i=1}^r \sigma_i\,u_i\langle v_i,x\rangle = \sum_{i=1}^r \sigma_i\,u_i v_i^*x.$$

<h3 id="why-these-directions-exist">Why these directions exist</h3>

Diagonalise the SPSD matrix $A^*A$. If $A^*Av_i=\sigma_i^2v_i$ with $\sigma_i>0$, set $u_i=Av_i/\sigma_i$. Then

$$
\langle u_i,u_j\rangle=\frac{\langle v_i,A^*Av_j\rangle}{\sigma_i\sigma_j}=\delta_{ij}.
$$

Zero-eigenvalue input directions form $\ker A$; complete the output directions to an ONB. Applying $A$ to the expansion of an arbitrary input proves the displayed decomposition. In particular $A^*u_i=\sigma_i v_i$. The same singular value describes a forward measurement and its adjoint.

<h3 id="remarks">Remarks</h3>

<SVDExplanation />

1. The leading singular value is the operator norm:

$$\sigma_1=|A|_{\mathrm{op}}:=\max_{|x|=1}|Ax|=\max_{x\ne 0}\frac{|Ax|}{|x|}.$$

2. Truncating the SVD gives a rank-$p$ approximation ("truncated SVD", related to PCA):

$$A\approx A_{(p)}:=\sum_{i=1}^p \sigma_i\,(v_i\otimes u_i).$$

3. Later: compact operators will have an SVD with infinitely many terms and $\sigma_i\to 0$ as $i\to\infty$.

4. The SVD gives a **generalised inverse** (pseudoinverse) $A^\dagger\in\mathbb{K}^{n\times m}$ of

$$A=\sum_{i=1}^r \sigma_i\,(v_i\otimes u_i)$$

via

$$A^\dagger=\sum_{i=1}^r \frac{1}{\sigma_i}\,(u_i\otimes v_i), \qquad \sigma_i\ne 0\ \text{for }i\le r.$$

The reciprocal singular values increase in this indexing. Reordering the paired directions gives the conventional decreasing order for an SVD of the pseudoinverse.

The factorisation is a sequence of operations on the same points. Play it slowly: first change input coordinates, then scale, then choose output coordinates. The two spaces need not share their singular directions.

<ES98AAnimation kind="svd-flow" />

<h3 id="exercises-from-the-notes">Exercises (from the notes)</h3>

Let $A=\sum_{i=1}^r \sigma_i\,(v_i\otimes u_i)$ be an SVD. Show:

$$A^*=\sum_{i=1}^r \sigma_i\,(u_i\otimes v_i), \qquad A^*A=\sum_{i=1}^r \sigma_i^2\,(v_i\otimes v_i).$$

What is $AA^*$?

---

<h2 id="least-squares-and-normal-equations">Least squares and normal equations</h2>

Given $A\in\mathbb{K}^{m\times n}$ and $b\in\mathbb{K}^m$, consider the least squares problem: find $x\in\mathbb{K}^n$ minimising

$$\Phi(x):=\frac{1}{2}|Ax-b|^2 =\frac{1}{2}\sum_{j=1}^m |(Ax)_j-b_j|^2.$$

Over the real numbers, differentiate the squared residual. Over the complex numbers, regard the domain as a real vector space with metric $\operatorname{Re}\langle\cdot,\cdot
angle$; the same gradient expression holds:

$$\nabla \Phi(x)=A^*Ax-A^*b.$$

Hessian/second derivative (constant in $x$):

$$\nabla^2\Phi(x)=A^*A,$$

and $A^*A$ is SPSD.

Therefore, minimisers are precisely the solutions of the **normal equations**:

$$A^*Ax=A^*b.$$

Special case: if $A$ has **full column rank**, then $A^*A$ is invertible and the minimiser is unique:

$$x^\dagger:=(A^*A)^{-1}A^*b.$$

A nontrivial kernel removes uniqueness of the parameters, while leaving the best predicted vector unique.

If $A$ has SVD $A=\sum_{i=1}^r \sigma_i\,(v_i\otimes u_i)$, then (using the exercise identities)

$$x^\dagger=(A^*A)^{-1}A^*b=\sum_{i=1}^r \frac{1}{\sigma_i}\,(u_i\otimes v_i)b,$$

i.e.

$$x^\dagger=A^\dagger b.$$

The normal equations are also the perpendicular-residual condition from Week 1: $A^*(Ax-b)=0$ says that the residual is orthogonal to every attainable prediction. For any minimiser $x_0$ and increment $h$,

$$
|A(x_0+h)-b|^2=|Ax_0-b|^2+|Ah|^2.
$$

Thus every minimiser is $A^\dagger b+z$ with $z\in\ker A$. Since $A^\dagger b\perp\ker A$, it uniquely minimises parameter norm. The inverse $(A^*A)^{-1}$ in the preceding formula is available only at full column rank; the singular expansion remains valid at any rank.

**Numerical interpretation.** For full column rank, $\kappa_2(A^*A)=\kappa_2(A)^2$. Normal equations explain the geometry beautifully, but QR or SVD avoids explicitly squaring the condition number when computing sensitive fits.

<h3 id="stability-note">Stability note</h3>

The inverse formula above assumes full column rank. The pseudoinverse itself is defined for rank-deficient matrices as well; it selects the minimum-norm least-squares solution.

Before reading the bounds, consider which data perturbations the inverse amplifies most in [Figure 1](#inverse-noise).

<NoiseExperiment />

<Sidenote>The experiment uses a real diagonal matrix to isolate the effect of singular values. Unitary changes of basis preserve Euclidean norms, so the same directional mechanism underlies the general SVD formula.</Sidenote>

Forward map is stable:

$$|A(x+\delta x)-Ax|=|A(\delta x)|\le |A|_{\mathrm{op}}|\delta x|=\sigma_1|\delta x|.$$

For rank $r>0$, the inverse map can be sensitive:

$$|A^\dagger(b+\delta b)-A^\dagger b| =|A^\dagger(\delta b)| \le |A^\dagger|_{\mathrm{op}}|\delta b| =\frac{1}{\sigma_r}|\delta b|.$$

The constant $\sigma_r^{-1}$ can be huge; reconstructions $A^\dagger b$ are sensitive to perturbations in $b$ parallel to singular vectors $u_i$ corresponding to small $\sigma_i$.

At fixed finite rank the pseudoinverse is bounded, but its norm may be enormous. Infinite-dimensional compact inverses in Week 8 can be unbounded: sensitivity then becomes ill-posedness in the continuity sense. For the zero matrix, the pseudoinverse is zero and the positive-singular-value bound is unnecessary.

---

Hold the amount of observation noise fixed and let just one singular value shrink. The evolving ellipse isolates why a small forward response can produce a large inverse error.

<ES98AAnimation kind="inverse-noise" />

<h2 id="probability-finite-dimensional">Probability (finite-dimensional)</h2>

A bound such as $|\delta x|\le |\delta b|/\sigma_r$ protects against the worst direction. It does not say how often that direction occurs. To ask about typical errors or uncertainty in a parameter, we must specify which outcomes are possible and how much probability they receive. A probability space makes those choices explicit.

<h3 id="kolmogorov-setup">Kolmogorov setup</h3>

1. A non-empty set $\Omega$ (sample space/outcome space).

2. A collection of measurable events $\mathcal{F}\subseteq \mathcal{P}(\Omega)$, required to be a **$\sigma$-algebra**:

- $\varnothing,\Omega\in\mathcal{F}$
- if $E\in\mathcal{F}$ then $\Omega\setminus E\in\mathcal{F}$
- if $E_1,E_2\in\mathcal{F}$ then $E_1\cap E_2\in\mathcal{F}$ and $E_1\cup E_2\in\mathcal{F}$
- if $E_1,E_2,\dots\in\mathcal{F}$ then $\bigcup_{n\in\mathbb{N}}E_n\in\mathcal{F}$ and $\bigcap_{n\in\mathbb{N}}E_n\in\mathcal{F}$

(Annotation: $\mathcal{F}$ is like a list of questions it is "ok" to ask about the outcome $\omega\in\Omega$; if $E\in\mathcal{F}$ you may ask whether $\omega\in E$.)

3. A probability measure $\mathbb{P}:\mathcal{F}\to [0,1]$ such that:

- $\mathbb{P}(\Omega)=1$ and $\mathbb{P}(\varnothing)=0$
- $\mathbb{P}(\Omega\setminus E)=1-\mathbb{P}(E)$
- if $E_1,E_2,\dots\in\mathcal{F}$ are pairwise disjoint, then

$$\mathbb{P}\!\left(\bigsqcup_{n\in\mathbb{N}}E_n\right)=\sum_{n\in\mathbb{N}}\mathbb{P}(E_n).$$

<h3 id="interpretations-of-probability">Interpretations of probability</h3>

Two main meanings of $\mathbb{P}(E)$:

1. **Frequentist:** idealised replicable experiment; on each run $E$ happens or not; under iid replication, the strong law gives

$$\mathbb{P}(E)=\lim_{n\to\infty}\frac{\text{Number of times }E\text{ occurs in first }n\text{ trials}}{n}$$

2. **Bayesian/subjectivist:** can speak of probability of any statement $E$, using probabilities to express degrees of belief. Probability one means almost sure, not logical necessity: a specified point in a continuous distribution has probability zero without being impossible.

<h3 id="aleatoric-vs-epistemic-uncertainty">Aleatoric vs epistemic uncertainty</h3>

- **Aleatoric** (irreducible) uncertainty: intrinsic randomness/variability.
- **Epistemic** (reducible) uncertainty: due to lack of knowledge; can decrease with more information.

<h3 id="bayes-formula-events">Bayes' formula (events)</h3>

For $A,B\in\mathcal{F}$ with $\mathbb{P}(A)>0$ and $\mathbb{P}(B)>0$, define conditional probability

$$\mathbb{P}(A\mid B):=\frac{\mathbb{P}(A\cap B)}{\mathbb{P}(B)}.$$

Then

$$\mathbb{P}(B\mid A)\mathbb{P}(A)=\mathbb{P}(A\cap B)=\mathbb{P}(A\mid B)\mathbb{P}(B),$$

so

$$\mathbb{P}(A\mid B)=\frac{\mathbb{P}(B\mid A)}{\mathbb{P}(B)}\,\mathbb{P}(A).$$

Annotations:

- $\mathbb{P}(A\mid B)$: posterior probability
- $\mathbb{P}(A)$: prior probability (before seeing data $B$)
- $\mathbb{P}(B\mid A)$: likelihood (from a model for what data should do if $A$ is true)
- $\mathbb{P}(B)$: normalising factor; also called the marginal likelihood / evidence

<h3 id="random-variables-and-distributions">Random variables and distributions</h3>

A real-valued random variable is a measurable function $x:\Omega\to\mathbb{R}$ defined on a probability space $(\Omega,\mathcal{F},\mathbb{P})$.

A random vector is a measurable function $x:\Omega\to\mathbb{R}^n$, i.e. $x=(x_1,\dots,x_n)$ with each $x_i$ a random variable.

The **law/distribution** of $x$ is the induced probability measure $\mu_x$ on $\mathbb{R}^n$:

$$\mu_x(A):=\mathbb{P}(\{\omega\in\Omega: x(\omega)\in A\}) =\mathbb{P}[x\in A] =\mathbb{P}(x^{-1}(A)).$$

<h3 id="from-a-law-to-a-question-about-data">From a law to a question about data</h3>

The law tells us how to average any integrable quantity: $\mathbb E[f(x)]=\int f(z)\,\mu_x(dz)$. In particular, for a real vector with finite second moment,

$$
m=\mathbb E[x],\qquad C=\mathbb E[(x-m)(x-m)^T],\qquad
\ell^TC\ell=\mathbb E[(\ell^T(x-m))^2]\ge0.
$$

Covariance is therefore a positive matrix for a reason: every directional test is a variance. [Week 3](/notes/es98a/week3) asks which distributions are completely described by this mean and covariance, and what observing some coordinates tells us about the others.
