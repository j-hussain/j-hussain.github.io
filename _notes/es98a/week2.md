---
layout: page
title: "Week 2: Least squares meets probability: normal equations + multivariate distributions"
---

## Topics

* Matrix factorisations (continued): the singular value decomposition
* Least squares and normal equations
* Finite-dimensional probability

---

## Matrix factorisations (continued)

### Recap: eigenvalues/eigenvectors for Hermitian matrices

Eigenvalue problem: given $A\in\mathbb{C}^{n\times n}$, find $\lambda\in\mathbb{C}$ and $q\in\mathbb{C}^n$ such that $$Aq=\lambda q, \qquad |q|=1.$$ If $A$ is **Hermitian/self-adjoint** ($A=A^*$), then:

* all eigenvalues $\lambda_1,\dots,\lambda_n$ are real
* there exists an orthonormal eigenbasis $q_1,\dots,q_n$ with $$\langle q_i,q_j\rangle=\delta_{ij}= \begin{cases} 1 & i=j\\ 0 & i\ne j \end{cases}$$ * writing $Q=[q_1\ \cdots\ q_n]$ and $\Lambda=\mathrm{diag}(\lambda_1,\dots,\lambda_n)$, $$Q^*Q=I, \qquad A=Q\Lambda Q^*.$$ Using outer products: $$A=\sum_{i=1}^n \lambda_i,(q_i\otimes q_i).$$ Recall: for vectors $a,b$, the outer product acts by $$(a\otimes b)c=\langle a,c\rangle,b.$$ ---

## The singular value decomposition (SVD)

### Theorem (SVD)

Let $A\in\mathbb{K}^{m\times n}$ (with $\mathbb{K}=\mathbb{R}$ or $\mathbb{C}$). Then there exist **unitary** matrices $$U\in\mathbb{K}^{m\times m}, \qquad V\in\mathbb{K}^{n\times n},$$ and a diagonal (rectangular) matrix $\Sigma\in\mathbb{R}^{m\times n}$ with diagonal entries $$\sigma_1\ge\sigma_2\ge\cdots\ge 0$$ (and zeros off-diagonal) such that $$A=U\Sigma V^*.$$ Equivalently: there exist orthonormal bases $u_1,\dots,u_m$ of $\mathbb{K}^m$ and $v_1,\dots,v_n$ of $\mathbb{K}^n$ and nonnegative numbers $\sigma_1,\dots,\sigma_r$ (where $r=\mathrm{rank}(A)$) such that $$A=\sum_{i=1}^r \sigma_i,(v_i\otimes u_i).$$ Action on a vector $x\in\mathbb{K}^n$: $$Ax=\sum_{i=1}^r \sigma_i,(v_i\otimes u_i)x \\ =\sum_{i=1}^r \sigma_i,u_i\langle v_i,x\rangle \\ =\sum_{i=1}^r \sigma_i,u_i v_i^*x.$$ ### Remarks

1. The leading singular value is the operator norm: $$\sigma_1=|A|*{\mathrm{op}}:=\max*{|x|=1}|Ax|=\max_{x\ne 0}\frac{|Ax|}{|x|}.$$ 2. Truncating the SVD gives a rank-$p$ approximation (“truncated SVD”, related to PCA): $$A\approx A_{(p)}:=\sum_{i=1}^p \sigma_i,(v_i\otimes u_i).$$ 3. Later: compact operators will have an SVD with infinitely many terms and $\sigma_i\to 0$ as $i\to\infty$.

4. The SVD gives a **generalised inverse** (pseudoinverse) $A^\dagger\in\mathbb{K}^{n\times m}$ of $$A=\sum_{i=1}^r \sigma_i,(v_i\otimes u_i)$$    via $$A^\dagger=\sum_{i=1}^r \frac{1}{\sigma_i},(u_i\otimes v_i), \qquad \sigma_i\ne 0\ \text{for }i\le r.$$ (Annotation in notes: “not technically an SVD because singular values are in the wrong order”.)

### Exercises (from the notes)

Let $A=\sum_{i=1}^r \sigma_i,(v_i\otimes u_i)$ be an SVD. Show: $$A^*=\sum_{i=1}^r \sigma_i,(u_i\otimes v_i), \qquad A^*A=\sum_{i=1}^r \sigma_i^2,(v_i\otimes v_i).$$ What is $AA^*$?

---

## Least squares and normal equations

Given $A\in\mathbb{K}^{m\times n}$ and $b\in\mathbb{K}^m$, consider the least squares problem: find $x\in\mathbb{K}^n$ minimising $$\Phi(x):=\frac{1}{2}|Ax-b|^2 =\frac{1}{2}\sum_{j=1}^m |(Ax)_j-b_j|^2.$$ Gradient/Jacobian (as written): $$\nabla \Phi(x)=A^*Ax-A^*b.$$ Hessian/second derivative (constant in $x$): $$\nabla^2\Phi(x)=A^*A,$$ and $A^*A$ is SPSD.

Therefore, minimisers are precisely the solutions of the **normal equations**: $$A^*Ax=A^*b.$$ Special case: if $A$ has **full column rank**, then $A^*A$ is invertible and the minimiser is unique: $$x^\dagger:=(A^*A)^{-1}A^*b.$$ (Annotation in notes: if $A$ has a non-trivial kernel, you lose uniqueness of minimisers.)

If $A$ has SVD $A=\sum_{i=1}^r \sigma_i,(v_i\otimes u_i)$, then (using the exercise identities) $$x^\dagger=(A^*A)^{-1}A^*b=\sum_{i=1}^r \frac{1}{\sigma_i},(u_i\otimes v_i)b,$$ i.e. $$x^\dagger=A^\dagger b.$$ ### Stability note

Forward map is stable: $$|A(x+\delta x)-Ax|=|A(\delta x)|\le |A|_{\mathrm{op}}|\delta x|=\sigma_1|\delta x|.$$ Inverse map can be unstable: $$|A^\dagger(b+\delta b)-A^\dagger b| \\ =|A^\dagger(\delta b)| \\ \le |A^\dagger|_{\mathrm{op}}|\delta b| \\ =\frac{1}{\sigma_r}|\delta b|.$$ Annotation: $\sigma_r^{-1}$ can be huge; reconstructions $A^\dagger b$ are sensitive to perturbations in $b$ parallel to singular vectors $u_i$ corresponding to small $\sigma_i$.

Slogan (as written): inverse/learning problems are typically ill-posed, sensitive to “minor” perturbations.

---

## Probability (finite-dimensional)

### Kolmogorov setup

1. A non-empty set $\Omega$ (sample space/outcome space).

2. A collection of measurable events $\mathcal{F}\subseteq \mathcal{P}(\Omega)$, required to be a **$\sigma$-algebra**:

* $\varnothing,\Omega\in\mathcal{F}$
* if $E\in\mathcal{F}$ then $\Omega\setminus E\in\mathcal{F}$
* if $E_1,E_2\in\mathcal{F}$ then $E_1\cap E_2\in\mathcal{F}$ and $E_1\cup E_2\in\mathcal{F}$
* if $E_1,E_2,\dots\in\mathcal{F}$ then $\bigcup_{n\in\mathbb{N}}E_n\in\mathcal{F}$ and $\bigcap_{n\in\mathbb{N}}E_n\in\mathcal{F}$

(Annotation: $\mathcal{F}$ is like a list of questions it is “ok” to ask about the outcome $\omega\in\Omega$; if $E\in\mathcal{F}$ you may ask whether $\omega\in E$.)

3. A probability measure $\mathbb{P}:\mathcal{F}\to [0,1]$ such that:

* $\mathbb{P}(\Omega)=1$ and $\mathbb{P}(\varnothing)=0$
* $\mathbb{P}(\Omega\setminus E)=1-\mathbb{P}(E)$
* if $E_1,E_2,\dots\in\mathcal{F}$ are pairwise disjoint, then $$\mathbb{P}!\left(\bigsqcup_{n\in\mathbb{N}}E_n\right)=\sum_{n\in\mathbb{N}}\mathbb{P}(E_n).$$ ### Interpretations of probability

Two main meanings of $\mathbb{P}(E)$:

1. **Frequentist:** idealised replicable experiment; on each run $E$ happens or not; define $$\mathbb{P}(E):=\lim_{n\to\infty}\frac{{\text{Number of times }E\text{ occurs in first }n\text{ trials}}}{n}$$ 2. **Bayesian/subjectivist:** can speak of probability of any statement $E$, with $\mathbb{P}(E)=1$ meaning certainty true and $\mathbb{P}(E)=0$ certainty false.

### Aleatoric vs epistemic uncertainty

* **Aleatoric** (irreducible) uncertainty: intrinsic randomness/variability.
* **Epistemic** (reducible) uncertainty: due to lack of knowledge; can decrease with more information.

### Bayes’ formula (events)

For $A,B\in\mathcal{F}$ with $\mathbb{P}(B)>0$, define conditional probability $$\mathbb{P}(A\mid B):=\frac{\mathbb{P}(A\cap B)}{\mathbb{P}(B)}.$$ Then $$\mathbb{P}(B\mid A)\mathbb{P}(A)=\mathbb{P}(A\cap B)=\mathbb{P}(A\mid B)\mathbb{P}(B),$$ so $$\mathbb{P}(A\mid B)=\frac{\mathbb{P}(B\mid A)}{\mathbb{P}(B)},\mathbb{P}(A).$$ Annotations:

* $\mathbb{P}(A\mid B)$: posterior probability
* $\mathbb{P}(A)$: prior probability (before seeing data $B$)
* $\mathbb{P}(B\mid A)$: likelihood (from a model for what data should do if $A$ is true)
* $\mathbb{P}(B)$: normalising factor; also called the marginal likelihood / evidence

### Random variables and distributions

A real-valued random variable is a function $x:\Omega\to\mathbb{R}$ defined on a probability space $(\Omega,\mathcal{F},\mathbb{P})$.

A random vector is a measurable function $x:\Omega\to\mathbb{R}^n$, i.e. $x=(x_1,\dots,x_n)$ with each $x_i$ a random variable.

The **law/distribution** of $x$ is the induced probability measure $\mu_x$ on $\mathbb{R}^n$: $$\mu_x(A):=\mathbb{P}({\omega\in\Omega: x(\omega)\in A}) \\ =\mathbb{P}[x\in A] \\ =\mathbb{P}(x^{-1}(A)).$$ 