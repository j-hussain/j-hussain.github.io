---
layout: page
title: "Week 5: From MCMC convergence to infinite-dimensional structure: Hilbert spaces & operators"
---

The alternating chain at the end of [Week 4](/notes/es98a/week4) preserves its target yet refuses to mix. Its problem becomes transparent when we follow what the transition does to **functions** of the state. That change of viewpoint introduces this week's larger theme: functions themselves can be vectors, and transformations of functions can be studied with the geometry of Week 1.

Finite coordinates never raised a convergence question. Infinite coordinates do. We develop completeness, Fourier expansions and compact operators to distinguish a meaningful limit from an infinite formal expression.

<h2 id="week-5">Route through this chapter</h2>

- Convergence behaviour of MCMC
- Linear functional analysis: Hilbert spaces, exemplified by the scale of Sobolev spaces; linear operators between them, exemplified by integral operators

<h2 id="convergence-behaviour-of-mcmc">Convergence behaviour of MCMC</h2>

Recall in MCMC we generate a sequence $(z_t)_{t=1,2,\ldots}$ of random states in $X=\mathbb{R}^d$, with the goal that

$$\int_X f(x)\,\mu(dx) = \int_X f(x)\,\rho(x)\,dx \approx \frac{1}{T}\sum_{t=1}^T f(z_t).$$

The MH scheme gives a recipe for generating $z_{t+1}$ from $z_t$ using an accept-reject comparison against the target density $\rho$. How good are such approximations?

The full answer to this question is highly technical! In brief, one must examine the Markov operator / transition operator / Koopman operator $P$, which is a linear op. that acts on functions $f:X=\mathbb{R}^d\to\mathbb{R}$ to produce new functions $Pf:X\to\mathbb{R}$ via

$$(Pf)(x) := \mathbb{E}\!\left[f(z_{t+1})\mid z_t=x\right].$$

Assume $\mu$ is invariant and work on $L^2(\mu)$. Conditional Jensen and invariance give $\|Pf\|_2^2\le\int P(|f|^2)\,d\mu=\|f\|_2^2$, so $P$ is a contraction. Constants satisfy $P1=1$. Detailed balance makes $P$ self-adjoint.

On the mean-zero subspace $L^2_0(\mu)$, assume the **absolute spectral gap** condition

$$
\|P\|_{L^2_0\to L^2_0}\le1-g,\qquad 0<g\le1.
$$

In a finite reversible chain this bounds every nonconstant eigenvalue in modulus. In infinite dimension it must control the whole spectrum, including continuous spectrum. The alternating two-state chain has eigenvalue $-1$ and no absolute gap.

The spectral gap controls the constant in the MCMC error estimate. Consider, for some integrand $f:X\to\mathbb{R}$, the MCMC quadrature error

$$E_T(f)^2 := \mathbb{E}\!\left[\left|\mathbb{E}[f(x)]-\frac{1}{T}\sum_{t=1}^T f(z_t)\right|^2\right], \qquad \mathbb{E}[f(x)] = \int_X f\,d\mu.$$

**Expectation** against both the initial state $z_1$ and the transition mechanism giving $z_2,z_3,\ldots$

For a stationary chain and $f_0=f-\int f\,d\mu$, we have

$$
|\gamma_k|=|\langle f_0,P^kf_0\rangle|\le(1-g)^k\|f_0\|_2^2.
$$

Insert this into Week 4's covariance sum and sum the geometric series:

$$
E_T(f)^2\le\frac{\|f_0\|_2^2}{T}\left(1+2\sum_{k\ge1}(1-g)^k\right)
=\frac{2-g}{Tg}\|f_0\|_2^2.
$$

This also implies the source's weaker $E_T\le\sqrt2\|f_0\|_2/(\sqrt T\,g)$. Nonstationary initialisation requires a separate bias/control argument; the same formula is not asserted for arbitrary initial laws. A small gap makes many transitions worth much less than the same number of independent samples.

For a two-state chain the nonconstant eigenvalue can be followed exactly. Watch the law relax from a point mass to equilibrium. A slow eigenmode keeps memory of the starting state long after the fast chain has mixed.

<ES98AAnimation kind="markov-gap" />

<h2 id="linear-functional-analysis">Linear functional analysis</h2>

<h3 id="hilbert-spaces-of-functions">Hilbert spaces (of functions)</h3>

A **norm** on a vector space $V$ over $\mathbb{K}=\mathbb{R}$ or $\mathbb{C}$ is a function $\|\cdot\|:V\to[0,\infty)\subseteq\mathbb{R}$ s.t.

- $\|v\|\ge 0$ for all $v\in V$
- $\|v\|=0\iff v=0\in V$
- $\|\lambda v\|=|\lambda|\,\|v\|$ for all $\lambda\in\mathbb{K}$, $v\in V$
- $\|u+v\|\le \|u\|+\|v\|$ for all $u,v\in V$

A space $V$ equipped with a norm is called a **normed space**.

If every sequence in $V$ that is Cauchy w.r.t. $\|\cdot\|$ is also convergent, then $V$ is called a **Banach space**. (**Completeness!**)

**E.g.** $V=C^0([a,b];\mathbb{R})=\{f:[a,b]\to\mathbb{R}\mid f\text{ is continuous everywhere}\}$

$$\|f\|_\infty := \max_{t\in[a,b]} |f(t)|.$$

A norm supplies distance but need not supply angles or perpendicular projection. An inner product adds that geometry; completeness ensures that successive approximations converge inside the space.

An **inner product** on $V$ is a function $\langle\cdot,\cdot\rangle:V\times V\to\mathbb{K}$ s.t.

- $\langle v,v\rangle\ge 0$ for all $v\in V$, with equality if and only if $v=0$
- $\langle u,v\rangle=\overline{\langle v,u\rangle}$ for all $u,v\in V$
- $\langle u,\alpha v+\beta w\rangle=\alpha\langle u,v\rangle+\beta\langle u,w\rangle$ for all $\alpha,\beta\in\mathbb{K}$, $u,v,w\in V$

Every inner product induces a norm via

$$\|v\|:=\sqrt{\langle v,v\rangle}.$$

An inner product space that is complete (every Cauchy seq. converges) is called a **Hilbert space**.

**E.g.** $\mathbb{R}^n$ is a Hilbert space with respect to the usual Euclidean dot product.

**Another e.g.** The space of square-summable sequences

$$\ell^2 := \left\{u=(u_n)_{n\in\mathbb{N}}\ \middle|\ \|u\|_{\ell^2}:=\left(\sum_{n\in\mathbb{N}}|u_n|^2\right)^{1/2}<\infty\right\},$$

(each term $u_n\in\mathbb{K}$) is a Hilbert space w.r.t. the inner product

$$\langle u,v\rangle_{\ell^2} := \sum_{n\in\mathbb{N}} \overline{u_n}\,v_n.$$

This is basically Euclidean space except with (countably!) infinitely many coordinates.

In a Hilbert space $H$, elements/vectors $u,v\in H$ are called **orthogonal** if $\langle u,v\rangle=0$, often denoted $u\perp v$. They are **orthonormal** if both $u\perp v$ and $\|u\|=\|v\|=1$.

A **complete orthonormal basis (CONB)** for $H$ is a collection of vectors $\psi_i\in H$, indexed by $i\in I$, s.t.

$$\langle \psi_i,\psi_j\rangle= \begin{cases} 1 & \text{if } i=j,\\ 0 & \text{if } i\ne j, \end{cases} \qquad \text{and}\qquad H=\overline{\mathrm{span}\{\psi_i,\ i\in I\}}.$$

We will focus only on the case that $I$ is (finite or) countable, in which case $(\psi_n)_{n\in\mathbb{N}}$ is a CONB if they are mutually orthonormal and every $u\in H$ admits an expansion

$$u=\sum_{n\in\mathbb{N}} u_n\psi_n \ (\star)$$

for suitable coefficients $u_n\in\mathbb{K}$, in the sense that

$$\lim_{N\to\infty}\left\|u-\sum_{n=1}^N u_n\psi_n\right\|_H = 0.$$

In fact, the coefficients $u_n$ in $(\star)$ have to be

$$u_n=\langle \psi_n,u\rangle_H.$$

Furthermore, Parseval's identity states that

$$\|u\|_H^2 =\left\|\sum_{n\in\mathbb{N}}u_n\psi_n\right\|_H^2 =\sum_{n\in\mathbb{N}}|u_n|^2 =\|(u_n)_n\|_{\ell^2}^2.$$

So a Hilbert space $H$ with a choice of CONB $\psi$ is (up to isometric isomorphism) just the space $\ell^2$ of square-summable coefficient sequences.

**Another e.g.** The space $L^2([0,2\pi];\mathbb{C})$ of square-integrable functions:

$$L^2([0,2\pi];\mathbb{C}) :=\left\{f:[0,2\pi]\to\mathbb{C}\ \middle|\ \|f\|_{L^2}<\infty\right\},$$

$$\|f\|_{L^2}:=\sqrt{\int_0^{2\pi}|f(t)|^2\,dt}, \qquad \langle f,g\rangle_{L^2}:=\int_0^{2\pi}\overline{f(t)}\,g(t)\,dt.$$

Elements of $L^2$ are measurable functions **identified when equal almost everywhere**. Otherwise a function supported at a single point would have norm zero without being the zero vector. Consequently $f(t)$ at a specified point is not defined for a general $L^2$ element. This matters when we introduce point observations and RKHSs in Week 6.

This has a famous CONB given by the Fourier basis functions $\psi_n:[0,2\pi]\to\mathbb{C}$ indexed by $n\in\mathbb{Z}$:

$$\psi_n(t):=\frac{1}{\sqrt{2\pi}}\exp(i n t).$$

In this setting, Parseval tells us that $\|f\|_{L^2}^2$ is exactly the sum of squares of the sequence $(f_n)_{n\in\mathbb{Z}}$ of Fourier coefficients of $f$, where

$$f_n := \langle \psi_n,f\rangle_{L^2} = \frac{1}{\sqrt{2\pi}}\int_0^{2\pi} f(t)e^{-int}\,dt.$$

<span data-es98a-source="es98a-fourier-tail:start" />

An infinite expansion needs more than small individual coefficients. Compare the coefficient size with the squared tail remaining after truncation.

<Figure id="es98a-fourier-tail" caption="For an ONB and coefficients 1/n, Parseval gives squared truncation error Σ above N of 1/n². Integral comparison bounds it between 1/(N+1) and 1/N.">
<div className="sci-story-grid sci-story-two">
<div><svg className="sci-story-svg" viewBox="0 0 340 290" role="img" aria-label="Coefficients uₙ = 1/n"><title>Coefficients uₙ = 1/n</title><path d="M45 50V195H310" fill="none" stroke="currentColor" opacity="0.5" /><text x="45" y="25">Coefficients uₙ = 1/n</text><text x="300" y="230" textAnchor="end">mode n</text><text x="45" y="45">coefficient</text><text x="45.00" y="210" textAnchor="middle">1</text><text x="305.00" y="210" textAnchor="middle">20</text><text x="38" y="199.00" textAnchor="end">0</text><text x="38" y="59.00" textAnchor="end">1</text><path d="M45.00,55.00 L46.62,69.86 L48.25,81.87 L49.88,91.77 L51.50,100.08 L53.12,107.16 L54.75,113.25 L56.38,118.55 L58.00,123.21 L59.62,127.33 L61.25,131.00 L62.88,134.30 L64.50,137.27 L66.12,139.96 L67.75,142.42 L69.38,144.66 L71.00,146.72 L72.62,148.62 L74.25,150.38 L75.88,152.01 L77.50,153.52 L79.12,154.93 L80.75,156.25 L82.38,157.48 L84.00,158.64 L85.62,159.72 L87.25,160.75 L88.88,161.72 L90.50,162.63 L92.12,163.50 L93.75,164.32 L95.38,165.09 L97.00,165.83 L98.62,166.54 L100.25,167.21 L101.88,167.85 L103.50,168.46 L105.12,169.04 L106.75,169.60 L108.38,170.14 L110.00,170.65 L111.62,171.14 L113.25,171.62 L114.88,172.07 L116.50,172.51 L118.12,172.93 L119.75,173.34 L121.38,173.73 L123.00,174.10 L124.62,174.47 L126.25,174.82 L127.88,175.16 L129.50,175.49 L131.12,175.81 L132.75,176.11 L134.38,176.41 L136.00,176.70 L137.62,176.98 L139.25,177.25 L140.88,177.51 L142.50,177.77 L144.12,178.02 L145.75,178.26 L147.38,178.49 L149.00,178.72 L150.62,178.94 L152.25,179.16 L153.88,179.37 L155.50,179.57 L157.12,179.77 L158.75,179.97 L160.38,180.16 L162.00,180.34 L163.62,180.52 L165.25,180.70 L166.88,180.87 L168.50,181.03 L170.12,181.20 L171.75,181.36 L173.38,181.51 L175.00,181.67 L176.62,181.82 L178.25,181.96 L179.88,182.10 L181.50,182.24 L183.12,182.38 L184.75,182.51 L186.38,182.64 L188.00,182.77 L189.62,182.90 L191.25,183.02 L192.88,183.14 L194.50,183.26 L196.12,183.38 L197.75,183.49 L199.38,183.60 L201.00,183.71 L202.62,183.82 L204.25,183.92 L205.88,184.02 L207.50,184.13 L209.12,184.23 L210.75,184.32 L212.38,184.42 L214.00,184.51 L215.62,184.61 L217.25,184.70 L218.88,184.79 L220.50,184.87 L222.12,184.96 L223.75,185.04 L225.38,185.13 L227.00,185.21 L228.62,185.29 L230.25,185.37 L231.88,185.45 L233.50,185.52 L235.12,185.60 L236.75,185.67 L238.38,185.75 L240.00,185.82 L241.62,185.89 L243.25,185.96 L244.88,186.03 L246.50,186.10 L248.12,186.16 L249.75,186.23 L251.38,186.29 L253.00,186.36 L254.63,186.42 L256.25,186.48 L257.88,186.54 L259.50,186.60 L261.12,186.66 L262.75,186.72 L264.38,186.78 L266.00,186.84 L267.62,186.89 L269.25,186.95 L270.88,187.00 L272.50,187.06 L274.12,187.11 L275.75,187.16 L277.38,187.21 L279.00,187.27 L280.62,187.32 L282.25,187.37 L283.88,187.41 L285.50,187.46 L287.12,187.51 L288.75,187.56 L290.38,187.60 L292.00,187.65 L293.62,187.70 L295.25,187.74 L296.88,187.79 L298.50,187.83 L300.12,187.87 L301.75,187.92 L303.38,187.96 L305.00,188.00" stroke="var(--sci-accent)" strokeWidth="2.5" fill="none" /><text x="45" y="252">solid: |uₙ|</text></svg></div>
<div><svg className="sci-story-svg" viewBox="0 0 340 290" role="img" aria-label="Squared tail bounds"><title>Squared tail bounds</title><path d="M45 50V195H310" fill="none" stroke="currentColor" opacity="0.5" /><text x="45" y="25">Squared tail bounds</text><text x="300" y="230" textAnchor="end">cutoff N</text><text x="45" y="45">squared norm error</text><text x="45.00" y="210" textAnchor="middle">1</text><text x="305.00" y="210" textAnchor="middle">20</text><text x="38" y="199.00" textAnchor="end">0</text><text x="38" y="59.00" textAnchor="end">1</text><path d="M45.00,55.00 L46.62,69.86 L48.25,81.87 L49.88,91.77 L51.50,100.08 L53.12,107.16 L54.75,113.25 L56.38,118.55 L58.00,123.21 L59.62,127.33 L61.25,131.00 L62.88,134.30 L64.50,137.27 L66.12,139.96 L67.75,142.42 L69.38,144.66 L71.00,146.72 L72.62,148.62 L74.25,150.38 L75.88,152.01 L77.50,153.52 L79.12,154.93 L80.75,156.25 L82.38,157.48 L84.00,158.64 L85.62,159.72 L87.25,160.75 L88.88,161.72 L90.50,162.63 L92.12,163.50 L93.75,164.32 L95.38,165.09 L97.00,165.83 L98.62,166.54 L100.25,167.21 L101.88,167.85 L103.50,168.46 L105.12,169.04 L106.75,169.60 L108.38,170.14 L110.00,170.65 L111.62,171.14 L113.25,171.62 L114.88,172.07 L116.50,172.51 L118.12,172.93 L119.75,173.34 L121.38,173.73 L123.00,174.10 L124.62,174.47 L126.25,174.82 L127.88,175.16 L129.50,175.49 L131.12,175.81 L132.75,176.11 L134.38,176.41 L136.00,176.70 L137.62,176.98 L139.25,177.25 L140.88,177.51 L142.50,177.77 L144.12,178.02 L145.75,178.26 L147.38,178.49 L149.00,178.72 L150.62,178.94 L152.25,179.16 L153.88,179.37 L155.50,179.57 L157.12,179.77 L158.75,179.97 L160.38,180.16 L162.00,180.34 L163.62,180.52 L165.25,180.70 L166.88,180.87 L168.50,181.03 L170.12,181.20 L171.75,181.36 L173.38,181.51 L175.00,181.67 L176.62,181.82 L178.25,181.96 L179.88,182.10 L181.50,182.24 L183.12,182.38 L184.75,182.51 L186.38,182.64 L188.00,182.77 L189.62,182.90 L191.25,183.02 L192.88,183.14 L194.50,183.26 L196.12,183.38 L197.75,183.49 L199.38,183.60 L201.00,183.71 L202.62,183.82 L204.25,183.92 L205.88,184.02 L207.50,184.13 L209.12,184.23 L210.75,184.32 L212.38,184.42 L214.00,184.51 L215.62,184.61 L217.25,184.70 L218.88,184.79 L220.50,184.87 L222.12,184.96 L223.75,185.04 L225.38,185.13 L227.00,185.21 L228.62,185.29 L230.25,185.37 L231.88,185.45 L233.50,185.52 L235.12,185.60 L236.75,185.67 L238.38,185.75 L240.00,185.82 L241.62,185.89 L243.25,185.96 L244.88,186.03 L246.50,186.10 L248.12,186.16 L249.75,186.23 L251.38,186.29 L253.00,186.36 L254.63,186.42 L256.25,186.48 L257.88,186.54 L259.50,186.60 L261.12,186.66 L262.75,186.72 L264.38,186.78 L266.00,186.84 L267.62,186.89 L269.25,186.95 L270.88,187.00 L272.50,187.06 L274.12,187.11 L275.75,187.16 L277.38,187.21 L279.00,187.27 L280.62,187.32 L282.25,187.37 L283.88,187.41 L285.50,187.46 L287.12,187.51 L288.75,187.56 L290.38,187.60 L292.00,187.65 L293.62,187.70 L295.25,187.74 L296.88,187.79 L298.50,187.83 L300.12,187.87 L301.75,187.92 L303.38,187.96 L305.00,188.00" stroke="var(--sci-accent)" strokeWidth="2.5" fill="none" /><text x="45" y="252">solid: upper bound 1/N</text><path d="M45.00,125.00 L46.62,128.92 L48.25,132.43 L49.88,135.58 L51.50,138.43 L53.12,141.02 L54.75,143.39 L56.38,145.55 L58.00,147.54 L59.62,149.38 L61.25,151.08 L62.88,152.66 L64.50,154.12 L66.12,155.49 L67.75,156.77 L69.38,157.98 L71.00,159.10 L72.62,160.16 L74.25,161.16 L75.88,162.11 L77.50,163.00 L79.12,163.85 L80.75,164.65 L82.38,165.41 L84.00,166.13 L85.62,166.82 L87.25,167.48 L88.88,168.11 L90.50,168.71 L92.12,169.28 L93.75,169.83 L95.38,170.36 L97.00,170.86 L98.62,171.35 L100.25,171.81 L101.88,172.26 L103.50,172.69 L105.12,173.10 L106.75,173.50 L108.38,173.89 L110.00,174.26 L111.62,174.62 L113.25,174.96 L114.88,175.30 L116.50,175.62 L118.12,175.94 L119.75,176.24 L121.38,176.53 L123.00,176.82 L124.62,177.09 L126.25,177.36 L127.88,177.62 L129.50,177.87 L131.12,178.12 L132.75,178.36 L134.38,178.59 L136.00,178.82 L137.62,179.03 L139.25,179.25 L140.88,179.46 L142.50,179.66 L144.12,179.85 L145.75,180.05 L147.38,180.23 L149.00,180.42 L150.62,180.59 L152.25,180.77 L153.88,180.94 L155.50,181.10 L157.12,181.27 L158.75,181.42 L160.38,181.58 L162.00,181.73 L163.62,181.88 L165.25,182.02 L166.88,182.16 L168.50,182.30 L170.12,182.44 L171.75,182.57 L173.38,182.70 L175.00,182.83 L176.62,182.95 L178.25,183.07 L179.88,183.19 L181.50,183.31 L183.12,183.42 L184.75,183.54 L186.38,183.65 L188.00,183.76 L189.62,183.86 L191.25,183.97 L192.88,184.07 L194.50,184.17 L196.12,184.27 L197.75,184.36 L199.38,184.46 L201.00,184.55 L202.62,184.64 L204.25,184.73 L205.88,184.82 L207.50,184.91 L209.12,185.00 L210.75,185.08 L212.38,185.16 L214.00,185.24 L215.62,185.32 L217.25,185.40 L218.88,185.48 L220.50,185.56 L222.12,185.63 L223.75,185.71 L225.38,185.78 L227.00,185.85 L228.62,185.92 L230.25,185.99 L231.88,186.06 L233.50,186.13 L235.12,186.19 L236.75,186.26 L238.38,186.32 L240.00,186.38 L241.62,186.45 L243.25,186.51 L244.88,186.57 L246.50,186.63 L248.12,186.69 L249.75,186.75 L251.38,186.80 L253.00,186.86 L254.63,186.92 L256.25,186.97 L257.88,187.03 L259.50,187.08 L261.12,187.13 L262.75,187.18 L264.38,187.24 L266.00,187.29 L267.62,187.34 L269.25,187.39 L270.88,187.43 L272.50,187.48 L274.12,187.53 L275.75,187.58 L277.38,187.62 L279.00,187.67 L280.62,187.72 L282.25,187.76 L283.88,187.80 L285.50,187.85 L287.12,187.89 L288.75,187.93 L290.38,187.98 L292.00,188.02 L293.62,188.06 L295.25,188.10 L296.88,188.14 L298.50,188.18 L300.12,188.22 L301.75,188.26 L303.38,188.30 L305.00,188.33" stroke="var(--sci-secondary)" strokeWidth="2.5" fill="none" strokeDasharray="5 4" /><text x="45" y="270">dashed: lower bound 1/(N+1)</text></svg></div>
</div>
</Figure>

The coefficients go to zero like 1/n, while norm error is of order 1/√N. Differentiation multiplies Fourier coefficients by n; square summability can then disappear. This motivates a norm that measures smoothness.

<span data-es98a-source="es98a-fourier-tail:end" />

Build the square wave from successive odd Fourier modes. Notice that the broad shape settles before the sharp edges do. The remaining overshoot is a warning to specify the sense in which an infinite series converges.

<ES98AAnimation kind="fourier" />

<h3 id="sobolev-spaces">Sobolev spaces</h3>

Parseval tells us that $u:[0,2\pi]\to\mathbb{C}$ is square integrable if its Fourier coeff. seq. satisfies $\sum_{n\in\mathbb{Z}}|u_n|^2<\infty$.

Take a smooth periodic $u$, so $u(0)=u(2\pi)$. Integration by parts gives

$$
(u')_n=\frac{[u(t)e^{-int}]_0^{2\pi}}{\sqrt{2\pi}}+
\frac{in}{\sqrt{2\pi}}\int_0^{2\pi}u(t)e^{-int}\,dt=in u_n.
$$

The boundary term vanishes because of periodicity. All Fourier-defined Sobolev spaces below are periodic spaces, denoted $H^s_{\rm per}$; they are not the unrestricted interval Sobolev spaces.

This observation motivates us to define the Sobolev space of weakly differentiable functions (with square-integrable weak deriv.) by

$$H^1_{\rm per}([0,2\pi];\mathbb{C}) :=\left\{u:[0,2\pi]\to\mathbb{C}\ \middle|\ (u_n)\in\ell^2 \text{ and } (n u_n)\in\ell^2\right\}$$

The weighted coefficient condition requires the weak derivative $u'$ to lie in $L^2$.

$$=\left\{u\ \middle|\ \|u\|_{H^1}^2:=\sum_{n\in\mathbb{Z}}(1+|n|^2)\,|u_n|^2<\infty\right\}.$$

We can take this idea further:

$$H^s_{\rm per}([0,2\pi];\mathbb{C}) :=\left\{u\ \middle|\ \|u\|_{H^s}^2:=\sum_{n\in\mathbb{Z}}(1+|n|^2)^s\,|u_n|^2<\infty\right\}.$$

For negative $s$, interpret elements as periodic distributions, obtained by completion, rather than necessarily ordinary functions. This definition allows non-integer or negative smoothness $s\in\mathbb{R}$ just by examining weighted summability of Fourier coefficients.

The **Sobolev embedding theorem** on the periodic $d$-dimensional domain states

$$
H^s_{\rm per}([0,2\pi]^d)\hookrightarrow C^r([0,2\pi]^d)
\quad\text{for integers }r\ge0\text{ with }s>r+d/2.
$$

For $d=1$ this requires $s>r+1/2$. The inequality is strict: the endpoint is not included. A weighted coefficient condition has become a statement about ordinary derivatives of the continuous representative.

<h2 id="linear-operators-between-hilbert-spaces">Linear operators between Hilbert spaces</h2>

Consider two Hilbert spaces $H_1$ and $H_2$ and linear map $A:H_1\to H_2$.

The **kernel** $\mathrm{ker}(A)$ and **range** $\mathrm{ran}(A)$ are

$$\mathrm{ker}(A) := \{u\in H_1\mid Au=0\in H_2\}\subseteq H_1, \qquad \mathrm{ran}(A) := \{Au\in H_2\mid u\in H_1\}\subseteq H_2.$$

The map $A$ is called a **bounded linear operator** if its operator norm

$$\|A\|_{\mathrm{op}} := \sup_{\substack{u\in H_1\\ \|u\|_{H_1}=1}}\|Au\|_{H_2} = \sup_{\substack{u\in H_1\\ u\ne 0}}\frac{\|Au\|_{H_2}}{\|u\|_{H_1}}$$

is finite.

**NB** there are many practical examples of unbounded operators, e.g. differential operators. The space of bounded linear operators is Banach in operator norm. In general this norm does not come from an inner product (there are exceptions, such as scalar-valued operators).

Every bounded op. $A:H_1\to H_2$ has a bounded **adjoint operator** $A^*:H_2\to H_1$ characterized by

$$\langle A^*v,u\rangle_{H_1}=\langle v,Au\rangle_{H_2} \qquad (v\in H_2,\ u\in H_1).$$

$A^*$ is the analogue of the conjugate transpose of a rectangular matrix.

If $A:H\to H$ and $A=A^*$ then $A$ is said to be **self-adjoint**. Just as in the matrix case, we call $A$ self-adjoint and **positive semi-definite (SPSD)** if $A=A^*$ and

$$\langle Au,u\rangle_H\ge 0\qquad\text{for all }u\in H,$$

and **SPD** if also

$$\langle Au,u\rangle_H=0 \iff u=0.$$

Given $\phi\in H_1$ and $\psi\in H_2$, we define the **rank-one operator / outer product / tensor product** $\phi\otimes\psi:H_1\to H_2$ by

$$(\phi\otimes\psi)u := \langle \phi,u\rangle_{H_1}\,\psi.$$

As a special case, if $\phi\in H_1$ has $\|\phi\|_{H_1}=1$, then $\phi\otimes\phi$ is the orthogonal projection operator onto the line spanned by $\phi$.

We write $H_1\otimes H_2$ for the Hilbert space generated by all linear combinations of operators $\phi_i\otimes\psi_i$ of this form, with inner product given by

$$\langle \phi_1\otimes\psi_1,\ \phi_2\otimes\psi_2\rangle_{H_1\otimes H_2} := \langle \phi_2,\phi_1\rangle_{H_1}\,\langle \psi_1,\psi_2\rangle_{H_2}.$$

Over real spaces this is the Hilbert tensor product $H_1\otimes H_2$. Over complex spaces our operator convention is conjugate-linear in $\phi$, so the precise identification is $\overline{H_1}\otimes H_2\cong S^2(H_1,H_2)$. The reversed first inner product above follows directly by computing the Hilbert–Schmidt inner product; it corrects the source convention.

An infinite-dimensional SPD operator need not have a bounded inverse: $Ae_n=n^{-1}e_n$ is strictly positive, but $A^{-1}e_n=ne_n$. Strict positivity is different from a uniform bound $\langle Au,u\rangle\ge c\|u\|^2$ with $c>0$. Regularisation will restore such a bound.

<h2 id="compact-operators">Compact operators</h2>

Bounded operators are certainly better than unbounded ones, but it is often necessary to consider yet more special classes of operators.

**Theorem** For a bounded op. $A:H_1\to H_2$, the following are equivalent, and if one (and hence all) holds, then $A$ is a **compact operator**:

1. (**compactness**) whenever $(u_n)_{n\in\mathbb{N}}$ in $H_1$ is a bounded sequence, the image sequence $(Au_n)_n$ in $H_2$ has at least one convergent subsequence.

2. (**compactness again**) the image under $A$ of any bounded set in $H_1$ is **relatively compact** in $H_2$: its closure is compact.

3. (**finite-rank approximation**) there exists a sequence of operators $A_n:H_1\to H_2$, each having finite rank (i.e. finite-dimensional range), such that

$$\|A_n-A\|_{\mathrm{op}}\to 0 \quad\text{as }n\to\infty.$$

4. (**singular value decomposition**) there exist orthonormal sequences $(\phi_n)$ in $H_1$ and $(\psi_n)$ in $H_2$ and a decreasing null sequence $(\sigma_n)$ in $[0,\infty)$ s.t. $A$ has the SVD

$$A=\sum_n \sigma_n\,\phi_n\otimes\psi_n$$

in the sense that

$$E_N := \left\|A-\sum_{n=1}^N \sigma_n\,\phi_n\otimes\psi_n\right\|_{\mathrm{op}}\to 0 \quad\text{as }N\to\infty.$$

(Equivalently: $Au=\sum_n \sigma_n\langle \phi_n,u\rangle_{H_1}\psi_n$.)

Basic example of a non-compact bounded operator: the identity op. on an infinite-dimensional space, for which $\sigma_n=1$ for all $n$, so $\sigma_n\not\to 0$, and $E_N=1$ for all $N$.

<h3 id="what-compactness-buysand-costs">What compactness buys and costs</h3>

Truncating after $N$ singular modes leaves operator error $\sigma_{N+1}$ (with zero beyond finite rank). Thus compactness says that every fixed accuracy admits a finite-dimensional approximation. But recovering the discarded small modes requires division by numbers tending to zero. The same property that makes forward approximation convenient makes inversion unstable.

**Exercise.** For $Ae_n=n^{-1}e_n$, compute the norm error of the $N$-mode truncation and the norm of its pseudoinverse. Explain why one decreases while the other increases. [Week 6](/notes/es98a/week6) asks which spectral decay rates support kernels and pointwise prediction.
