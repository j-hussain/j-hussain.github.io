---
layout: page
title: "Week 1: Foundations: linear algebra + uncertainty propagation"
---

## Motivation and overview

### What is predictive modelling? (in the physical sciences)

The fusion of data (perhaps “big data” or perhaps very sparse) with a principles-driven physical model, often using scientific computing resources, to make a prediction about the behaviour of the modelled system — with confidence estimates / error bars / uncertainties.

In this module, the models will be simple algebraic equations or systems of ODEs. Real systems are often more complicated (PDEs, agent-based models, etc.).

### A little more mathematical structure

We often have a mathematical model $\mathcal{M}$ that claims to explain the relationship between inputs $x$ and outputs $y$ with the aid of parameters $\theta$. In the ideal world: $$y=\mathcal{M}(x;\theta^*)$$ (where $\theta^*$ are the “true” parameters)

**Example: Hooke’s law (linear elastic material)** $$\sigma=E\varepsilon$$ * $\sigma$: stress (“stress/force”)
* $E$: Young’s modulus
* $\varepsilon$: strain/extension

In practice, the model may be wrong (wrong functional form) or we may have the wrong value for $\theta$. Observations of $x$ and $y$ may be noisy. We may settle for an approximation: $$y\approx\mathcal{M}(x;\theta)$$ ### Misfit function $$\Phi(\theta):=\sum_{j=1}^J\left|y_j-\mathcal{M}(x_j;\theta)\right|^2$$ (annotated: “misfit function”)

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

Example: a Fourier series in $x$, with Fourier coefficients $$\theta=(\ldots,\theta_{-2},\theta_{-1},\theta_0,\theta_1,\theta_2,\ldots)\in\mathbb{C}^{\mathbb{Z}}.$$ Annotated example equations: $$\mathcal{M}(x;\theta)=\sum_k\theta_k e^{ikx}$$ $$\mathcal{M}(x;\theta+\tilde{\theta})=\mathcal{M}(x;\theta)+\mathcal{M}(x;\tilde{\theta})$$ $$\mathcal{M}(x+\tilde{x};\theta)\ne \mathcal{M}(x;\theta)+\mathcal{M}(\tilde{x};\theta)$$ ---

## Finite-dimensional linear algebra

Let $\mathbb{K}$ denote either $\mathbb{R}$ or $\mathbb{C}$. We’ll work in $\mathbb{R}^n$ or $\mathbb{C}^n$.

### Orthogonal basis expansions

**Euclidean dot product in $\mathbb{R}^n$:** $$x\cdot y=\sum_{j=1}^n x_j y_j$$ leading to the Euclidean norm $$|x|:=\sqrt{x\cdot x}=\sqrt{\sum_{j=1}^n x_j^2}.$$ **Inner product in $\mathbb{C}^n$:** $$\langle x,y\rangle:=\sum_{j=1}^n \overline{x_j},y_j$$ with norm $$|x|:=\sqrt{\langle x,x\rangle}.$$ For $x,y\in\mathbb{K}^n$:

* **orthogonal** if $\langle x,y\rangle=0$
* **orthonormal** if orthogonal and unit length (e.g. $|x|=|y|=1$)

If $\psi_1,\ldots,\psi_n\in\mathbb{K}^n$ form a basis of $\mathbb{K}^n$, then every $x\in\mathbb{K}^n$ can be written uniquely as $$x=\sum_{j=1}^n \alpha_j\psi_j \quad\text{for scalars }\alpha_1,\ldots,\alpha_n\in\mathbb{K}.$$ If $\psi_1,\ldots,\psi_n$ is an **orthonormal** basis, then $$\alpha_j=\langle \psi_j,x\rangle.$$ **Reconstruction law:** $$x=\sum_{j=1}^n \langle \psi_j,x\rangle,\psi_j.$$ **Parseval:** $$|x|^2=\sum_{j=1}^n \left|\langle \psi_j,x\rangle\right|^2.$$ ---

### Outer product

#### What the angle brackets mean

$\langle x,y\rangle$ denotes an **inner product** (dot product):

* In $\mathbb{R}^n$: $\langle x,y\rangle=\sum_{i=1}^n x_i y_i$
* In $\mathbb{C}^n$: $\langle x,y\rangle=\sum_{i=1}^n \overline{x_i},y_i$

#### Definition and how it “works”

For $a\in\mathbb{K}^m$ and $b\in\mathbb{K}^n$, the **outer product** $a\otimes b$ is a matrix in $\mathbb{K}^{n\times m}$ defined entrywise by $$(a\otimes b)_{ij}=\overline{a_j},b_i.$$ It acts on $x\in\mathbb{K}^m$ as a rank-1 linear map: $$(a\otimes b)x=\langle a,x\rangle,b.$$ Interpretation: “measure how much of $x$ points in the $a$ direction (via $\langle a,x\rangle$), then output that scalar times the direction $b$.”

#### Examples

1. $a=(1,0)$, $b=(0,2)$: $$a\otimes b=\begin{pmatrix}0&0\\2&0\end{pmatrix}.$$ 2. If $|u|=1$, then $$(u\otimes u)x=\langle u,x\rangle,u,$$ which is the **orthogonal projection** of $x$ onto $\mathrm{span}{u}$.

#### Reconstruction in outer-product form

The reconstruction law can be written as $$x=\sum_{j=1}^n (\psi_j\otimes \psi_j)x,$$ so equivalently $$\mathrm{Id}=\sum_{j=1}^n \psi_j\otimes \psi_j.$$ (annotated idea: $\psi_j\otimes\psi_j$ is an orthogonal projection operator “onto the $\psi_j$ direction”.)

---

### Three key tasks in linear algebra

1. **Solving linear systems**
   Given $A\in\mathbb{K}^{n\times n}$ and $b\in\mathbb{K}^n$, find $x\in\mathbb{K}^n$ such that $$Ax=b.$$ If $A$ is invertible/nonsingular, the unique solution is $x=A^{-1}b$. In practice, algorithms like Gaussian elimination, CG, GMRES, etc. find $x$ without explicitly forming $A^{-1}$.

2. **Least squares problems**
   Given $A\in\mathbb{K}^{m\times n}$ and $b\in\mathbb{K}^m$, find $x\in\mathbb{K}^n$ such that $$|Ax-b|^2 \text{ is minimal}.$$ (annotated expansion idea: $\sum_{j=1}^m |(Ax)_j-b_j|^2$.)
Quoted note: “Next best thing” to solving $Ax=b$.

3. **Eigenvalue–eigenvector problems**
   Given $A\in\mathbb{K}^{n\times n}$, find $\lambda\in\mathbb{C}$ and $v\in\mathbb{C}^n$ such that $$Av=\lambda v \quad\text{and}\quad |v|=1.$$ If $A$ is Hermitian/self-adjoint (notationally: $A=A^*$; the notes also write something like $A=\overline{A}^{,T}$), then $A$ has $n$ real eigenvalues (possibly repeated) and $n$ orthonormal eigenvectors, giving a diagonalisation: $$A=V\Lambda \overline{V}^{,T},$$ where $\Lambda=\mathrm{diag}(\lambda_1,\ldots,\lambda_n)$ and $V=[v_1\ v_2\ \cdots\ v_n]$.

---

### Special classes of matrices

Given $A\in\mathbb{K}^{m\times n}$:

* $A^T\in\mathbb{K}^{n\times m}$ is the **transpose**, with $(A^T)*{ij}=A*{ji}$.
* $A^*\in\mathbb{K}^{n\times m}$ is the **conjugate transpose / adjoint**, with $(A^*)*{ij}=\overline{A*{ji}}$.

Equivalently, $A^*$ is characterised by (for $x\in\mathbb{K}^n$, $y\in\mathbb{K}^m$): $$\langle Ax,y\rangle=\langle x,A^*y\rangle.$$ If $A\in\mathbb{K}^{n\times n}$ and $A=A^*$, then $A$ is **self-adjoint / Hermitian**.

---

### SPSD / SPD

$A$ is **self-adjoint and positive semi-definite (SPSD)** if $$A=A^* \quad\text{and}\quad \langle Ax,x\rangle\ge 0\ \ \text{for all }x\in\mathbb{K}^n.$$ $A$ is **self-adjoint and positive definite (SPD)** if $$A=A^* \quad\text{and}\quad \langle Ax,x\rangle>0\ \ \text{for all }x\in\mathbb{K}^n\setminus{0}.$$ SPSD/SPD matrices/operators are analogues of non-negative/positive numbers and are useful for describing variance structure of random vectors.

**Exercises (as written in the notes):**

* For any $B$, both $B^*B$ and $BB^*$ are SPSD.
* If $A$ is SPSD, then its eigenvalues are real and $\ge 0$.
* (Implied continuation) If $A$ is SPD, then its eigenvalues are real and $>0$.

---

### Matrix factorisations

#### Cholesky factorisation / matrix square roots

**Theorem.** Let $A\in\mathbb{K}^{n\times n}$ be SPSD.

1. There is a unique lower-triangular matrix $L\in\mathbb{K}^{n\times n}$, called the **Cholesky factor** of $A$, such that $$A=L^*L.$$ 2. There is a unique SPSD **matrix square root** for $A$, i.e. a unique $B\in\mathbb{K}^{n\times n}$ such that $$A=B^2=BB.$$ We usually write $A^{1/2}$ for this $B$.
