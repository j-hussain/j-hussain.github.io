---
layout: page
title: "ES98A: Fundamentals of Predictive Modelling"
---

# ES98A — Fundamentals of Predictive Modelling (Week 1)


## Motivation and overview

### What is predictive modelling? (in the physical sciences)

The fusion of data (perhaps “big data” or perhaps very sparse) with a principles-driven physical model, often using scientific computing resources, to make a prediction about the behaviour of the modelled system — with confidence estimates / error bars / uncertainties.

In this module, the models will be simple algebraic equations or systems of ODEs. Real systems are often more complicated (PDEs, agent-based models, etc.).

### A little more mathematical structure

We often have a mathematical model $\mathcal{M}$ that claims to explain the relationship between inputs $x$ and outputs $y$ with the aid of parameters $\theta$. In the ideal world:

$$
y=\mathcal{M}(x;\theta^*)
$$

(where $\theta^*$ are the “true” parameters)

**Example: Hooke’s law (linear elastic material)**

$$
\sigma=E\varepsilon
$$

* $\sigma$: stress (“stress/force”)
* $E$: Young’s modulus
* $\varepsilon$: strain/extension

In practice, the model may be wrong (wrong functional form) or we may have the wrong value for $\theta$. Observations of $x$ and $y$ may be noisy. We may settle for an approximation:

$$
y\approx\mathcal{M}(x;\theta)
$$

### Misfit function

$$
\Phi(\theta):=\sum_{j=1}^J\left|y_j-\mathcal{M}(x_j;\theta)\right|^2
$$

(annotated: “misfit function”)

### Natural questions

* What principles underpin this approach?
* How do we find $\theta$ to minimise $\Phi(\theta)$?
* How “good” is the optimised $\theta$?
* How do uncertainties about the data, the model, the optimiser, etc. affect our certainty about predictions made using the calibrated model $\mathcal{M}(\cdot;\theta^{\mathrm{opt}})$?

This motivates:

* **Forward uncertainty quantification (UQ):** how does uncertainty about inputs translate into uncertainty about outputs?
* **Backward UQ / learning / inference / inverse problem:** how do we work backwards from observations (with their uncertainties) to a calibrated parametrised model (with uncertainties)?

Necessary mathematics: functions and spaces of functions, optimisation, probability (and some statistics) in such spaces.

### Generalised linear models (statisticians’ terminology)

This module focuses a lot on what statisticians would call **generalised linear models** $\mathcal{M}(x;\theta)$, where $\mathcal{M}(x;\theta)$ can depend nonlinearly on $x$ but is linear in $\theta$.

Example: a Fourier series in $x$, with Fourier coefficients

$$
\theta=(\ldots,\theta_{-2},\theta_{-1},\theta_0,\theta_1,\theta_2,\ldots)\in\mathbb{C}^{\mathbb{Z}}.
$$

Annotated example equations:

$$
\mathcal{M}(x;\theta)=\sum_k\theta_k e^{ikx}
$$

$$
\mathcal{M}(x;\theta+\tilde{\theta})=\mathcal{M}(x;\theta)+\mathcal{M}(x;\tilde{\theta})
$$

$$
\mathcal{M}(x+\tilde{x};\theta)\ne \mathcal{M}(x;\theta)+\mathcal{M}(\tilde{x};\theta)
$$

---

## Finite-dimensional linear algebra

Let $\mathbb{K}$ denote either $\mathbb{R}$ or $\mathbb{C}$. We’ll work in $\mathbb{R}^n$ or $\mathbb{C}^n$.

### Orthogonal basis expansions

**Euclidean dot product in $\mathbb{R}^n$:**

$$
x\cdot y=\sum_{j=1}^n x_j y_j
$$

leading to the Euclidean norm

$$
|x|:=\sqrt{x\cdot x}=\sqrt{\sum_{j=1}^n x_j^2}.
$$

**Inner product in $\mathbb{C}^n$:**

$$
\langle x,y\rangle:=\sum_{j=1}^n \overline{x_j},y_j
$$

with norm

$$
|x|:=\sqrt{\langle x,x\rangle}.
$$

For $x,y\in\mathbb{K}^n$:

* **orthogonal** if $\langle x,y\rangle=0$
* **orthonormal** if orthogonal and unit length (e.g. $|x|=|y|=1$)

If $\psi_1,\ldots,\psi_n\in\mathbb{K}^n$ form a basis of $\mathbb{K}^n$, then every $x\in\mathbb{K}^n$ can be written uniquely as

$$
x=\sum_{j=1}^n \alpha_j\psi_j
\quad\text{for scalars }\alpha_1,\ldots,\alpha_n\in\mathbb{K}.
$$

If $\psi_1,\ldots,\psi_n$ is an **orthonormal** basis, then

$$
\alpha_j=\langle \psi_j,x\rangle.
$$

**Reconstruction law:**

$$
x=\sum_{j=1}^n \langle \psi_j,x\rangle,\psi_j.
$$

**Parseval:**

$$
|x|^2=\sum_{j=1}^n \left|\langle \psi_j,x\rangle\right|^2.
$$

---

### Outer product

#### What the angle brackets mean

$\langle x,y\rangle$ denotes an **inner product** (dot product):

* In $\mathbb{R}^n$: $\langle x,y\rangle=\sum_{i=1}^n x_i y_i$
* In $\mathbb{C}^n$: $\langle x,y\rangle=\sum_{i=1}^n \overline{x_i},y_i$

#### Definition and how it “works”

For $a\in\mathbb{K}^m$ and $b\in\mathbb{K}^n$, the **outer product** $a\otimes b$ is a matrix in $\mathbb{K}^{n\times m}$ defined entrywise by

$$
(a\otimes b)_{ij}=\overline{a_j},b_i.
$$

It acts on $x\in\mathbb{K}^m$ as a rank-1 linear map:

$$
(a\otimes b)x=\langle a,x\rangle,b.
$$

Interpretation: “measure how much of $x$ points in the $a$ direction (via $\langle a,x\rangle$), then output that scalar times the direction $b$.”

#### Examples

1. $a=(1,0)$, $b=(0,2)$:

$$
a\otimes b=\begin{pmatrix}0&0\2&0\end{pmatrix}.
$$

2. If $|u|=1$, then

$$
(u\otimes u)x=\langle u,x\rangle,u,
$$

which is the **orthogonal projection** of $x$ onto $\mathrm{span}{u}$.

#### Reconstruction in outer-product form

The reconstruction law can be written as

$$
x=\sum_{j=1}^n (\psi_j\otimes \psi_j)x,
$$

so equivalently

$$
\mathrm{Id}=\sum_{j=1}^n \psi_j\otimes \psi_j.
$$

(annotated idea: $\psi_j\otimes\psi_j$ is an orthogonal projection operator “onto the $\psi_j$ direction”.)

---

### Three key tasks in linear algebra

1. **Solving linear systems**
   Given $A\in\mathbb{K}^{n\times n}$ and $b\in\mathbb{K}^n$, find $x\in\mathbb{K}^n$ such that

$$
Ax=b.
$$

If $A$ is invertible/nonsingular, the unique solution is $x=A^{-1}b$. In practice, algorithms like Gaussian elimination, CG, GMRES, etc. find $x$ without explicitly forming $A^{-1}$.

2. **Least squares problems**
   Given $A\in\mathbb{K}^{m\times n}$ and $b\in\mathbb{K}^m$, find $x\in\mathbb{K}^n$ such that

$$
|Ax-b|^2 \text{ is minimal}.
$$

(annotated expansion idea: $\sum_{j=1}^m |(Ax)_j-b_j|^2$.)
Quoted note: “Next best thing” to solving $Ax=b$.

3. **Eigenvalue–eigenvector problems**
   Given $A\in\mathbb{K}^{n\times n}$, find $\lambda\in\mathbb{C}$ and $v\in\mathbb{C}^n$ such that

$$
Av=\lambda v
\quad\text{and}\quad
|v|=1.
$$

If $A$ is Hermitian/self-adjoint (notationally: $A=A^*$; the notes also write something like $A=\overline{A}^{,T}$), then $A$ has $n$ real eigenvalues (possibly repeated) and $n$ orthonormal eigenvectors, giving a diagonalisation:

$$
A=V\Lambda \overline{V}^{,T},
$$

where $\Lambda=\mathrm{diag}(\lambda_1,\ldots,\lambda_n)$ and $V=[v_1\ v_2\ \cdots\ v_n]$.

---

### Special classes of matrices

Given $A\in\mathbb{K}^{m\times n}$:

* $A^T\in\mathbb{K}^{n\times m}$ is the **transpose**, with $(A^T)*{ij}=A*{ji}$.
* $A^*\in\mathbb{K}^{n\times m}$ is the **conjugate transpose / adjoint**, with $(A^*)*{ij}=\overline{A*{ji}}$.

Equivalently, $A^*$ is characterised by (for $x\in\mathbb{K}^n$, $y\in\mathbb{K}^m$):

$$
\langle Ax,y\rangle=\langle x,A^*y\rangle.
$$

If $A\in\mathbb{K}^{n\times n}$ and $A=A^*$, then $A$ is **self-adjoint / Hermitian**.

---

### SPSD / SPD

$A$ is **self-adjoint and positive semi-definite (SPSD)** if

$$
A=A^*
\quad\text{and}\quad
\langle Ax,x\rangle\ge 0\ \ \text{for all }x\in\mathbb{K}^n.
$$

$A$ is **self-adjoint and positive definite (SPD)** if

$$
A=A^*
\quad\text{and}\quad
\langle Ax,x\rangle>0\ \ \text{for all }x\in\mathbb{K}^n\setminus{0}.
$$

SPSD/SPD matrices/operators are analogues of non-negative/positive numbers and are useful for describing variance structure of random vectors.

**Exercises (as written in the notes):**

* For any $B$, both $B^*B$ and $BB^*$ are SPSD.
* If $A$ is SPSD, then its eigenvalues are real and $\ge 0$.
* (Implied continuation) If $A$ is SPD, then its eigenvalues are real and $>0$.

---

### Matrix factorisations

#### Cholesky factorisation / matrix square roots

**Theorem.** Let $A\in\mathbb{K}^{n\times n}$ be SPSD.

1. There is a unique lower-triangular matrix $L\in\mathbb{K}^{n\times n}$, called the **Cholesky factor** of $A$, such that

$$
A=L^*L.
$$

2. There is a unique SPSD **matrix square root** for $A$, i.e. a unique $B\in\mathbb{K}^{n\times n}$ such that

$$
A=B^2=BB.
$$

We usually write $A^{1/2}$ for this $B$.

# ES98A — Fundamentals of Predictive Modelling (Week 2) 

## Topics

* Matrix factorisations (continued): the singular value decomposition
* Least squares and normal equations
* Finite-dimensional probability

---

## Matrix factorisations (continued)

### Recap: eigenvalues/eigenvectors for Hermitian matrices

Eigenvalue problem: given $A\in\mathbb{C}^{n\times n}$, find $\lambda\in\mathbb{C}$ and $q\in\mathbb{C}^n$ such that
$$
Aq=\lambda q,
\qquad |q|=1.
$$

If $A$ is **Hermitian/self-adjoint** ($A=A^*$), then:

* all eigenvalues $\lambda_1,\dots,\lambda_n$ are real
* there exists an orthonormal eigenbasis $q_1,\dots,q_n$ with
  $$
  \langle q_i,q_j\rangle=\delta_{ij}=
  \begin{cases}
  1 & i=j\
  0 & i\ne j
  \end{cases}
  $$
* writing $Q=[q_1\ \cdots\ q_n]$ and $\Lambda=\mathrm{diag}(\lambda_1,\dots,\lambda_n)$,
  $$
  Q^*Q=I,
  \qquad
  A=Q\Lambda Q^*.
  $$

Using outer products:
$$
A=\sum_{i=1}^n \lambda_i,(q_i\otimes q_i).
$$

Recall: for vectors $a,b$, the outer product acts by
$$
(a\otimes b)c=\langle a,c\rangle,b.
$$

---

## The singular value decomposition (SVD)

### Theorem (SVD)

Let $A\in\mathbb{K}^{m\times n}$ (with $\mathbb{K}=\mathbb{R}$ or $\mathbb{C}$). Then there exist **unitary** matrices
$$
U\in\mathbb{K}^{m\times m},
\qquad
V\in\mathbb{K}^{n\times n},
$$
and a diagonal (rectangular) matrix $\Sigma\in\mathbb{R}^{m\times n}$ with diagonal entries
$$
\sigma_1\ge\sigma_2\ge\cdots\ge 0
$$
(and zeros off-diagonal) such that
$$
A=U\Sigma V^*.
$$

Equivalently: there exist orthonormal bases $u_1,\dots,u_m$ of $\mathbb{K}^m$ and $v_1,\dots,v_n$ of $\mathbb{K}^n$ and nonnegative numbers $\sigma_1,\dots,\sigma_r$ (where $r=\mathrm{rank}(A)$) such that
$$
A=\sum_{i=1}^r \sigma_i,(v_i\otimes u_i).
$$

Action on a vector $x\in\mathbb{K}^n$:
$$
Ax=\sum_{i=1}^r \sigma_i,(v_i\otimes u_i)x
=\sum_{i=1}^r \sigma_i,u_i\langle v_i,x\rangle
=\sum_{i=1}^r \sigma_i,u_i v_i^*x.
$$

### Remarks

1. The leading singular value is the operator norm:
   $$
   \sigma_1=|A|*{\mathrm{op}}:=\max*{|x|=1}|Ax|=\max_{x\ne 0}\frac{|Ax|}{|x|}.
   $$

2. Truncating the SVD gives a rank-$p$ approximation (“truncated SVD”, related to PCA):
   $$
   A\approx A_{(p)}:=\sum_{i=1}^p \sigma_i,(v_i\otimes u_i).
   $$

3. Later: compact operators will have an SVD with infinitely many terms and $\sigma_i\to 0$ as $i\to\infty$.

4. The SVD gives a **generalised inverse** (pseudoinverse) $A^\dagger\in\mathbb{K}^{n\times m}$ of
   $$
   A=\sum_{i=1}^r \sigma_i,(v_i\otimes u_i)
   $$
   via
   $$
   A^\dagger=\sum_{i=1}^r \frac{1}{\sigma_i},(u_i\otimes v_i),
   \qquad \sigma_i\ne 0\ \text{for }i\le r.
   $$

(Annotation in notes: “not technically an SVD because singular values are in the wrong order”.)

### Exercises (from the notes)

Let $A=\sum_{i=1}^r \sigma_i,(v_i\otimes u_i)$ be an SVD. Show:
$$
A^*=\sum_{i=1}^r \sigma_i,(u_i\otimes v_i),
\qquad
A^*A=\sum_{i=1}^r \sigma_i^2,(v_i\otimes v_i).
$$
What is $AA^*$?

---

## Least squares and normal equations

Given $A\in\mathbb{K}^{m\times n}$ and $b\in\mathbb{K}^m$, consider the least squares problem: find $x\in\mathbb{K}^n$ minimising
$$
\Phi(x):=\frac{1}{2}|Ax-b|^2
=\frac{1}{2}\sum_{j=1}^m |(Ax)_j-b_j|^2.
$$

Gradient/Jacobian (as written):
$$
\nabla \Phi(x)=A^*Ax-A^*b.
$$

Hessian/second derivative (constant in $x$):
$$
\nabla^2\Phi(x)=A^*A,
$$
and $A^*A$ is SPSD.

Therefore, minimisers are precisely the solutions of the **normal equations**:
$$
A^*Ax=A^*b.
$$

Special case: if $A$ has **full column rank**, then $A^*A$ is invertible and the minimiser is unique:
$$
x^\dagger:=(A^*A)^{-1}A^*b.
$$

(Annotation in notes: if $A$ has a non-trivial kernel, you lose uniqueness of minimisers.)

If $A$ has SVD $A=\sum_{i=1}^r \sigma_i,(v_i\otimes u_i)$, then (using the exercise identities)
$$
x^\dagger=(A^*A)^{-1}A^*b=\sum_{i=1}^r \frac{1}{\sigma_i},(u_i\otimes v_i)b,
$$
i.e.
$$
x^\dagger=A^\dagger b.
$$

### Stability note

Forward map is stable:
$$
|A(x+\delta x)-Ax|=|A(\delta x)|\le |A|_{\mathrm{op}}|\delta x|=\sigma_1|\delta x|.
$$

Inverse map can be unstable:
$$
|A^\dagger(b+\delta b)-A^\dagger b|
=|A^\dagger(\delta b)|
\le |A^\dagger|_{\mathrm{op}}|\delta b|
=\frac{1}{\sigma_r}|\delta b|.
$$

Annotation: $\sigma_r^{-1}$ can be huge; reconstructions $A^\dagger b$ are sensitive to perturbations in $b$ parallel to singular vectors $u_i$ corresponding to small $\sigma_i$.

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
* if $E_1,E_2,\dots\in\mathcal{F}$ are pairwise disjoint, then
  $$
  \mathbb{P}!\left(\bigsqcup_{n\in\mathbb{N}}E_n\right)=\sum_{n\in\mathbb{N}}\mathbb{P}(E_n).
  $$

### Interpretations of probability

Two main meanings of $\mathbb{P}(E)$:

1. **Frequentist:** idealised replicable experiment; on each run $E$ happens or not; define
   $$
   \mathbb{P}(E):=\lim_{n\to\infty}\frac{#{\text{times }E\text{ occurs in first }n\text{ trials}}}{n}.
   $$

2. **Bayesian/subjectivist:** can speak of probability of any statement $E$, with $\mathbb{P}(E)=1$ meaning certainty true and $\mathbb{P}(E)=0$ certainty false.

### Aleatoric vs epistemic uncertainty

* **Aleatoric** (irreducible) uncertainty: intrinsic randomness/variability.
* **Epistemic** (reducible) uncertainty: due to lack of knowledge; can decrease with more information.

### Bayes’ formula (events)

For $A,B\in\mathcal{F}$ with $\mathbb{P}(B)>0$, define conditional probability
$$
\mathbb{P}(A\mid B):=\frac{\mathbb{P}(A\cap B)}{\mathbb{P}(B)}.
$$

Then
$$
\mathbb{P}(B\mid A)\mathbb{P}(A)=\mathbb{P}(A\cap B)=\mathbb{P}(A\mid B)\mathbb{P}(B),
$$
so
$$
\mathbb{P}(A\mid B)=\frac{\mathbb{P}(B\mid A)}{\mathbb{P}(B)},\mathbb{P}(A).
$$

Annotations:

* $\mathbb{P}(A\mid B)$: posterior probability
* $\mathbb{P}(A)$: prior probability (before seeing data $B$)
* $\mathbb{P}(B\mid A)$: likelihood (from a model for what data should do if $A$ is true)
* $\mathbb{P}(B)$: normalising factor; also called the marginal likelihood / evidence

### Random variables and distributions

A real-valued random variable is a function $x:\Omega\to\mathbb{R}$ defined on a probability space $(\Omega,\mathcal{F},\mathbb{P})$.

A random vector is a measurable function $x:\Omega\to\mathbb{R}^n$, i.e. $x=(x_1,\dots,x_n)$ with each $x_i$ a random variable.

The **law/distribution** of $x$ is the induced probability measure $\mu_x$ on $\mathbb{R}^n$:
$$
\mu_x(A):=\mathbb{P}({\omega\in\Omega: x(\omega)\in A})
=\mathbb{P}[x\in A]
=\mathbb{P}(x^{-1}(A)).
$$
