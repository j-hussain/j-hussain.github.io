---
layout: page
title: "Week 5: From MCMC convergence to infinite-dimensional structure: Hilbert spaces & operators"
---

## Week 5

- Convergence behaviour of MCMC
- Linear functional analysis: Hilbert spaces, exemplified by the scale of Sobolev spaces; linear operators between them, exemplified by integral operators

## Convergence behaviour of MCMC

Recall in MCMC we generate a sequence $(z_t)_{t=1,2,\ldots}$ of random states in $X=\mathbb{R}^d$, with the goal that $$\int_X f(x)\,\mu(dx) = \int_X f(x)\,\rho(x)\,dx \approx \frac{1}{T}\sum_{t=1}^T f(z_t).$$ The MH scheme gives a recipe for generating $z_{t+1}$ from $z_t$ using an accept-reject comparison against the target density $\rho$. How good are such approximations?

The full answer to this question is highly technical! In brief, one must examine the Markov operator / transition operator / Koopman operator $P$, which is a linear op. that acts on functions $f:X=\mathbb{R}^d\to\mathbb{R}$ to produce new functions $Pf:X\to\mathbb{R}$ via $$(Pf)(x) := \mathbb{E}\!\left[f(z_{t+1})\mid z_t=x\right].$$ This operator turns out to have eigenvalues with modulus at most $1$. In fact, since $P$ maps a constant function to that same constant function, $1$ is always an eigenvalue of $P$. In the situation that all other eigenvalues $\lambda$ of $P$ have $$|\lambda|\le 1-g,$$ we say that $P$ has **spectral gap** $g$.

The spectral gap controls the constant in the MCMC error estimate. Consider, for some integrand $f:X\to\mathbb{R}$, the MCMC quadrature error $$E_T(f)^2 := \mathbb{E}\!\left[\left|\mathbb{E}[f(x)]-\frac{1}{T}\sum_{t=1}^T f(z_t)\right|^2\right], \qquad \mathbb{E}[f(x)] = \int_X f\,d\mu.$$ **Expectation** against both the initial state $z_1$ and the transition mechanism giving $z_2,z_3,\ldots$

With considerable effort, one can show that $$E_T(f)\le \frac{\mathrm{const.}}{\sqrt{T}\,g}\,\|f\|_{L^2(\mu)}.$$ Thus, in principle, MCMC has a vanilla-MC-like inverse-square-root convergence rate, but a small spectral gap may make the constant grow unfeasibly large. Many naïve MCMC schemes have small gap $g$, especially when $d$ is large, e.g. the Gaussian random walk proposal MH-MCMC scheme.

## Linear functional analysis

### Hilbert spaces (of functions)

A **norm** on a vector space $V$ over $\mathbb{K}=\mathbb{R}$ or $\mathbb{C}$ is a function $\|\cdot\|:V\to[0,\infty)\subseteq\mathbb{R}$ s.t.
- $\|v\|\ge 0$ for all $v\in V$
- $\|v\|=0\iff v=0\in V$
- $\|\lambda v\|=|\lambda|\,\|v\|$ for all $\lambda\in\mathbb{K}$, $v\in V$
- $\|u+v\|\le \|u\|+\|v\|$ for all $u,v\in V$

A space $V$ equipped with a norm is called a **normed space**.

If every sequence in $V$ that is Cauchy w.r.t. $\|\cdot\|$ is also convergent, then $V$ is called a **Banach space**. (**Completeness!**)

**E.g.** $V=C^0([a,b];\mathbb{R})=\{f:[a,b]\to\mathbb{R}\mid f\text{ is continuous everywhere}\}$ $$\|f\|_\infty := \max_{t\in[a,b]} |f(t)|.$$ Banach spaces turn out to be rather nasty. Spaces with “Euclidean” structure are much nicer.

An **inner product** on $V$ is a function $\langle\cdot,\cdot\rangle:V\times V\to\mathbb{K}$ s.t.
- $\langle v,v\rangle\ge 0$ for all $v\in V$
- $\langle u,v\rangle=\overline{\langle v,u\rangle}$ for all $u,v\in V$
- $\langle u,\alpha v+\beta w\rangle=\alpha\langle u,v\rangle+\beta\langle u,w\rangle$ for all $\alpha,\beta\in\mathbb{K}$, $u,v,w\in V$

Every inner product induces a norm via $$\|v\|:=\sqrt{\langle v,v\rangle}.$$ An inner product space that is complete (every Cauchy seq. converges) is called a **Hilbert space**.

**E.g.** $\mathbb{R}^n$ is a Hilbert space with respect to the usual Euclidean dot product.

**Another e.g.** The space of square-summable sequences $$\ell^2 := \left\{u=(u_n)_{n\in\mathbb{N}}\ \middle|\ \|u\|_{\ell^2}:=\left(\sum_{n\in\mathbb{N}}|u_n|^2\right)^{1/2}<\infty\right\},$$ (each term $u_n\in\mathbb{K}$) is a Hilbert space w.r.t. the inner product $$\langle u,v\rangle_{\ell^2} := \sum_{n\in\mathbb{N}} \overline{u_n}\,v_n.$$ This is basically Euclidean space except with (countably!) infinitely many coordinates.

In a Hilbert space $H$, elements/vectors $u,v\in H$ are called **orthogonal** if $\langle u,v\rangle=0$, often denoted $u\perp v$. They are **orthonormal** if both $u\perp v$ and $\|u\|=\|v\|=1$.

A **complete orthonormal basis (CONB)** for $H$ is a collection of vectors $\psi_i\in H$, indexed by $i\in I$, s.t. $$\langle \psi_i,\psi_j\rangle= \begin{cases} 1 & \text{if } i=j,\\ 0 & \text{if } i\ne j, \end{cases} \qquad \text{and}\qquad H=\overline{\mathrm{span}\{\psi_i,\ i\in I\}}.$$ We will focus only on the case that $I$ is (finite or) countable, in which case $(\psi_n)_{n\in\mathbb{N}}$ is a CONB if they are mutually orthonormal and every $u\in H$ admits an expansion $$u=\sum_{n\in\mathbb{N}} u_n\psi_n \ (\star)$$ for suitable coefficients $u_n\in\mathbb{K}$, in the sense that $$\lim_{N\to\infty}\left\|u-\sum_{n=1}^N u_n\psi_n\right\|_H = 0.$$ In fact, the coefficients $u_n$ in $(\star)$ have to be $$u_n=\langle \psi_n,u\rangle_H.$$ Furthermore, Parseval’s identity states that $$\|u\|_H^2 =\left\|\sum_{n\in\mathbb{N}}u_n\psi_n\right\|_H^2 =\sum_{n\in\mathbb{N}}|u_n|^2 =\|(u_n)_n\|_{\ell^2}^2.$$ So a Hilbert space $H$ with a choice of CONB $\psi$ is (up to isometric isomorphism) just the space $\ell^2$ of square-summable coefficient sequences.

**Another e.g.** The space $L^2([0,2\pi];\mathbb{C})$ of square-integrable functions: $$L^2([0,2\pi];\mathbb{C}) :=\left\{f:[0,2\pi]\to\mathbb{C}\ \middle|\ \|f\|_{L^2}<\infty\right\},$$ $$\|f\|_{L^2}:=\sqrt{\int_0^{2\pi}|f(t)|^2\,dt}, \qquad \langle f,g\rangle_{L^2}:=\int_0^{2\pi}\overline{f(t)}\,g(t)\,dt.$$ This has a famous CONB given by the Fourier basis functions $\psi_n:[0,2\pi]\to\mathbb{C}$ indexed by $n\in\mathbb{Z}$: $$\psi_n(t):=\frac{1}{\sqrt{2\pi}}\exp(i n t).$$ In this setting, Parseval tells us that $\|f\|_{L^2}^2$ is exactly the sum of squares of the sequence $(f_n)_{n\in\mathbb{Z}}$ of Fourier coefficients of $f$, where $$f_n := \langle \psi_n,f\rangle_{L^2} = \frac{1}{\sqrt{2\pi}}\int_0^{2\pi} f(t)e^{-int}\,dt.$$ ### Sobolev spaces

Parseval tells us that $u:[0,2\pi]\to\mathbb{C}$ is square integrable if its Fourier coeff. seq. satisfies $\sum_{n\in\mathbb{Z}}|u_n|^2<\infty$.

Let’s suppose that $u$ is differentiable with derivative $u'$ and we try to calculate Fourier coefficients for $u'$: $$\frac{1}{\sqrt{2\pi}}\int_0^{2\pi} u'(t)e^{-int}\,dt = \frac{1}{\sqrt{2\pi}}\int_0^{2\pi} u(t)e^{-int}\,dt \ \text{by integration by parts} = i n u_n.$$ This observation motivates us to define the Sobolev space of weakly differentiable functions (with square-integrable weak deriv.) by $$H^1([0,2\pi];\mathbb{C}) :=\left\{u:[0,2\pi]\to\mathbb{C}\ \middle|\ (u_n)\in\ell^2 \text{ and } (n u_n)\in\ell^2\right\}$$ (blue note: This part demands that $u'\in L^2$.) $$=\left\{u\ \middle|\ \|u\|_{H^1}^2:=\sum_{n\in\mathbb{Z}}(1+|n|^2)\,|u_n|^2<\infty\right\}.$$ We can take this idea further: $$H^s([0,2\pi];\mathbb{C}) :=\left\{u\ \middle|\ \|u\|_{H^s}^2:=\sum_{n\in\mathbb{Z}}(1+|n|^2)^s\,|u_n|^2<\infty\right\}.$$ This definition allows us to model functions with non-integer or even negative smoothness $s\in\mathbb{R}$ just by examining weighted summability of Fourier coefficients.

The **Sobolev embedding theorem** asserts that every $f\in H^s([0,2\pi];\mathbb{C})$ is “nearly” $\lfloor s-\tfrac{1}{2}\rfloor$ times continuously differentiable in the usual sense; more precisely, $$H^s([0,2\pi];\mathbb{C}) \subseteq C^r([0,2\pi];\mathbb{C}) \qquad\text{for}\qquad r=\left\lfloor s-\frac{1}{2}\right\rfloor \quad\text{when}\quad s-\frac{1}{2}>r,$$ or in $d$ dimensions, $$H^s([0,2\pi]^d;\mathbb{C}) \subseteq C^r([0,2\pi]^d;\mathbb{C}) \qquad\text{for}\qquad r=\left\lfloor s-\frac{d}{2}\right\rfloor \quad\text{when}\quad s-\frac{d}{2}>r.$$ ## Linear operators between Hilbert spaces

Consider two Hilbert spaces $H_1$ and $H_2$ and linear map $A:H_1\to H_2$.

The **kernel** $\mathrm{ker}(A)$ and **range** $\mathrm{ran}(A)$ are $$\mathrm{ker}(A) := \{u\in H_1\mid Au=0\in H_2\}\subseteq H_1, \qquad \mathrm{ran}(A) := \{Au\in H_2\mid u\in H_1\}\subseteq H_2.$$ The map $A$ is called a **bounded linear operator** if its operator norm $$\|A\|_{\mathrm{op}} := \sup_{\substack{u\in H_1\\ \|u\|_{H_1}=1}}\|Au\|_{H_2} = \sup_{\substack{u\in H_1\\ u\ne 0}}\frac{\|Au\|_{H_2}}{\|u\|_{H_1}}$$ is finite.

**NB** there are many practical examples of unbounded operators, e.g. differential operators. The space of bounded linear operators is a Banach space but not a Hilbert space, i.e. there is no inner product whose norm is $\|\cdot\|_{\mathrm{op}}$.

Every bounded op. $A:H_1\to H_2$ has a bounded **adjoint operator** $A^*:H_2\to H_1$ characterized by $$\langle A^*v,u\rangle_{H_1}=\langle v,Au\rangle_{H_2} \qquad (v\in H_2,\ u\in H_1).$$ $A^*$ is the analogue of the conjugate transpose of a rectangular matrix.

If $A:H\to H$ and $A=A^*$ then $A$ is said to be **self-adjoint**. Just as in the matrix case, we call $A$ self-adjoint and **positive semi-definite (SPSD)** if $A=A^*$ and $$\langle Au,u\rangle_H\ge 0\qquad\text{for all }u\in H,$$ and **SPD** if also $$\langle Au,u\rangle_H=0 \iff u=0.$$ Given $\phi\in H_1$ and $\psi\in H_2$, we define the **rank-one operator / outer product / tensor product** $\phi\otimes\psi:H_1\to H_2$ by $$(\phi\otimes\psi)u := \langle \phi,u\rangle_{H_1}\,\psi.$$ As a special case, if $\phi\in H_1$ has $\|\phi\|_{H_1}=1$, then $\phi\otimes\phi$ is the orthogonal projection operator onto the line spanned by $\phi$.

We write $H_1\otimes H_2$ for the Hilbert space generated by all linear combinations of operators $\phi_i\otimes\psi_i$ of this form, with inner product given by $$\langle \phi_1\otimes\psi_1,\ \phi_2\otimes\psi_2\rangle_{H_1\otimes H_2} := \langle \phi_1,\phi_2\rangle_{H_1}\,\langle \psi_1,\psi_2\rangle_{H_2}.$$ We call $H_1\otimes H_2$ the **Hilbert tensor product** of $H_1$ and $H_2$; it turns out to also be the space of Hilbert–Schmidt operators.

## Compact operators

Bounded operators are certainly better than unbounded ones, but it is often necessary to consider yet more special classes of operators.

**Theorem** For a bounded op. $A:H_1\to H_2$, the following are equivalent, and if one (and hence all) holds, then $A$ is a **compact operator**:

1. (**compactness**) whenever $(u_n)_{n\in\mathbb{N}}$ in $H_1$ is a bounded sequence, the image sequence $(Au_n)_n$ in $H_2$ has at least one convergent subsequence.

2. (**compactness again**) the image under $A$ of any bounded set in $H_1$ is compact in $H_2$.

3. (**finite-rank approximation**) there exists a sequence of operators $A_n:H_1\to H_2$, each having finite rank (i.e. finite-dimensional range), such that $$\|A_n-A\|_{\mathrm{op}}\to 0 \quad\text{as }n\to\infty.$$ 4. (**singular value decomposition**) there exist orthonormal sequences $(\phi_n)$ in $H_1$ and $(\psi_n)$ in $H_2$ and a decreasing null sequence $(\sigma_n)$ in $[0,\infty)$ s.t. $A$ has the SVD $$A=\sum_n \sigma_n\,\phi_n\otimes\psi_n$$    in the sense that $$E_N := \left\|A-\sum_{n=1}^N \sigma_n\,\phi_n\otimes\psi_n\right\|_{\mathrm{op}}\to 0 \quad\text{as }N\to\infty.$$    (Equivalently: $Au=\sum_n \sigma_n\langle \phi_n,u\rangle_{H_1}\psi_n$.)

Basic example of a non-compact bounded operator: the identity op. on an infinite-dimensional space, for which $\sigma_n=1$ for all $n$, so $\sigma_n\not\to 0$, and $E_N=1$ for all $N$.
