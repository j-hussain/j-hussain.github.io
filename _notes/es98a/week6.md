---
layout: page
title: "Week 6: Kernels and RKHS: approximation geometry + random-function basics"
---

A finite matrix stores all pairwise interactions between coordinates. Could a function $k(x,y)$ do the same for a continuum of locations? An integral operator turns this idea into a linear map; an RKHS turns it into a geometry in which point measurements are continuous.

Keep [Week 5's distinction](/notes/es98a/week5#linear-operators-between-hilbert-spaces) between boundedness, compactness and invertibility in view. We now ask how much singular-value decay is needed to sum squared responses, sum variances, and evaluate a function at a point. These are different requirements.

<h2 id="week-6">Route through this chapter</h2>

- Special classes of compact operators: trace-class and Hilbert–Schmidt operators.
- Integral kernels and integral operators.
- Reproducing kernel Hilbert spaces.
- Orthogonal projection (again).
- Probability on function spaces: perspectives on random fields.
- **NB** Handout on **Kolmogorov's two-series theorem** on convergence/summability of series of independent random variables, needed for Assignment 3.

<h2 id="special-classes-of-compact-operators">Special classes of compact operators</h2>

Recall from last time: a linear operator $A:H_1\to H_2$ is compact if and only if it has an SVD of the form

$$A=\sum_{n\in\mathbb{N}}\sigma_n\,\phi_n\otimes\psi_n, \qquad\text{i.e.}\qquad Au=\sum_n \sigma_n\langle \phi_n,u\rangle_{H_1}\,\psi_n,$$

with

- $\sigma_n\ge 0$ non-negative singular values, $\sigma_n\to 0$ as $n\to\infty$,
- singular vectors $\phi_n$ orthonormal in $H_1$,
- $\psi_n$ orthonormal in $H_2$,
- and

$$\left\|A-\sum_{n=1}^N \sigma_n\,\phi_n\otimes\psi_n\right\|_{\mathrm{op}}\to 0 \quad\text{as }N\to\infty.$$

The singular value sequence $(\sigma_n)$ can be used to characterize even nicer classes of operators:

<h3 id="hilbertschmidt-operators">Hilbert–Schmidt operators</h3>

If

$$\sum_n \sigma_n^2<\infty,$$

then $A$ is called a **Hilbert–Schmidt** operator.

The space $S^2(H_1,H_2)$ of H–S operators from $H_1$ into $H_2$ actually forms a Hilbert space with inner product

$$\langle A,B\rangle_{S^2} :=\sum_n \langle A\gamma_n,\,B\gamma_n\rangle_{H_2},$$

for any choice of CONB $(\gamma_n)_n$ of $H_1$ (every choice gives the same value), and induced norm

$$\|A\|_{S^2}:=\sqrt{\sum_n \|A\gamma_n\|_{H_2}^2}.$$

("$\sim$ Frobenius norm")

As in Week 5, $S^2(H_1,H_2)$ identifies with $H_1\otimes H_2$ over the reals and $\overline{H_1}\otimes H_2$ over the complex numbers.

<h3 id="trace-class-nuclear-operators">Trace-class (nuclear) operators</h3>

If

$$\sum_n \sigma_n<\infty,$$

then $A$ is called **trace class** (or **nuclear**).

The norm on the class $S^1(H_1,H_2)$ of trace-class operators from $H_1$ into $H_2$ is

$$\|A\|_{S^1} :=\sum_n \left\langle (A^*A)^{1/2}\gamma_n,\ \gamma_n\right\rangle_{H_1},$$

for any CONB $(\gamma_n)_n$ of $H_1$.

More practically, in the case that $A$ is self-adjoint with real eigenvalues $(\lambda_n)_n$,

$$\|A\|_{S^1}=\sum_n |\lambda_n|.$$

**In summary:**

$$S^1 \subseteq S^2 \subseteq \{\text{all compact operators}\} \subseteq \{\text{all bounded linear operators}\} \subseteq \{\text{all linear operators}\}.$$

**A spectral comparison.** If $\sigma_n=n^{-p}$, compactness requires $p>0$, Hilbert–Schmidt summability requires $p>1/2$, and trace-class summability requires $p>1$. These thresholds follow from the $p$-series test. Trace class is the strongest requirement: it will make total variance finite in Week 7.

<h2 id="hilbert-scales-induced-by-compact-operators">Hilbert scales induced by compact operators</h2>

Similarly to the construction of the Sobolev scale (earlier in one variable): any compact SPD operator

$$A:H^0\to H^0$$

defined on a Hilbert space $H^0$ induces a scale of new Hilbert spaces $H^s$, $s\in\mathbb{R}$, via

$$\langle u,v\rangle_{H^s} :=\langle A^{-s}u,\ A^{-s}v\rangle_{H^0},$$

for those $u,v$ for which this is finite.

More concretely, if

$$A=\sum_n \lambda_n\,\gamma_n\otimes\gamma_n$$

with eigenvalues $\lambda_n\to 0$ and eigenvectors $\gamma_n$, then $H^s$ consists of those

$$u=\sum_n u_n\gamma_n$$

for which

$$\left\|\sum_n u_n\gamma_n\right\|_{H^s}^2 = \left\|A^{-s}\sum_n u_n\gamma_n\right\|_{H^0}^2 = \left\|\sum_n \lambda_n^{-s}u_n\gamma_n\right\|_{H^0}^2 = \sum_n \frac{|u_n|^2}{\lambda_n^{2s}}<\infty.$$

For $s>0$, $H^s$ is the domain of the generally unbounded $A^{-s}$. For $s<0$, take the completion of finite eigenvector expansions in this weaker norm: merely selecting vectors already in $H^0$ would leave the negative spaces incomplete. This scale uses weights $\lambda_n^{-2s}$; if $A=(-\Delta)^{-1}$, its index $s$ corresponds to periodic Sobolev order $2s$, not $s$.

Being in $H^s$ turns out to be important when trying to recover $u$ from a noisy observation of $Au$.

**Example (inverse negative Laplacian).** Let $H^0=L^2([0,2\pi];\mathbb{C})$ be the space of square-integrable, mean-zero, $2\pi$-periodic functions with Fourier CONB

$$\gamma_n(t):=\frac{1}{\sqrt{2\pi}}e^{int}, \qquad n\in\mathbb{Z}\setminus\{0\}.$$

These $\gamma_n$ are eigenfunctions for the second derivative / Laplacian operator:

$$\Delta\gamma_n=\gamma_n''=-n^2\gamma_n.$$

Thus, $\Delta$ has eigenvalues $-n^2$ with eigenfunctions $\gamma_n$, and $(-\Delta)^{-1}$ has eigenvalues $\frac{1}{n^2}$.

Note that, since

$$\sum_{n\ne 0}\frac{1}{n^2}=\frac{\pi^2}{3}<\infty,$$

$(-\Delta)^{-1}$ is a trace-class operator.

<h2 id="kernels-and-integral-operators">Kernels and integral operators</h2>

Given a set $X$, a **kernel** on $X$ is just a function

$$k:X\times X\to\mathbb{R}.$$

The kernel is called **SPD/SPSD** if, for any $n\in\mathbb{N}$ and distinct points $x_1,\ldots,x_n\in X$, the matrix

$$\begin{pmatrix} k(x_1,x_1) & k(x_1,x_2) & \cdots & k(x_1,x_n)\\ \vdots & \vdots & \ddots & \vdots\\ k(x_n,x_1) & k(x_n,x_2) & \cdots & k(x_n,x_n) \end{pmatrix} \in\mathbb{R}^{n\times n}$$

is SPD/SPSD.

Now fix a (bounded, measurable) set $X\subseteq\mathbb{R}^d$ and a kernel $k$ on $X$. The induced **integral operator** $I_k$ is

$$(I_k u)(x):=\int_X k(x,y)\,u(y)\,dy,$$

for $x\in X$ and $u:X\to\mathbb{R}$. Think of this $I_k$ as a blurring operator that "thins" an input image $u$ to produce a new one $I_k u$ by averaging against $k$.

**Theorem.** Let $k$ be a square-integrable kernel on $X$, i.e.

$$\int_{X\times X} |k(x,y)|^2\,dx\,dy=\|k\|_{L^2(X^2)}^2<\infty.$$

Then

1. $I_k$ is a bounded linear operator from the Hilbert space $L^2(X)$ of square-integrable signals into $L^2(X)$ with

$$\|I_k\|_{\mathrm{op}}\le \|k\|_{L^2(X^2)};$$

2. $I_k$ is compact;

3. the adjoint of $I_k$ is

$$(I_k^*u)(x)=\int_X k(y,x)\,u(y)\,dy;$$

in particular, if $k$ is a symmetric kernel, then $I_k$ is a self-adjoint operator;

4. $I_k$ is Hilbert–Schmidt with

$$\|I_k\|_{S^2}=\|k\|_{L^2(X^2)};$$

5. every H–S operator $T:L^2(X)\to L^2(X)$ is of this form, i.e. there exists $k$ s.t. $T=I_k$;

6. A diagonal trace formula needs stronger assumptions than square integrability. For a continuous symmetric SPSD kernel on a compact set $X$, with finite full-support reference measure,

$$
\operatorname{tr}(I_k)=\|I_k\|_{S^1}=\int_X k(x,x)\,dx.
$$

For a merely $L^2(X^2)$ kernel, values on the diagonal may be changed arbitrarily without changing the operator. Thus diagonal integrability alone cannot imply trace class or determine its trace. For a signed finite-rank continuous kernel, trace and trace norm can already differ: eigenvalues $1,-1$ have trace zero but trace norm two.

<h2 id="positivity-mercer-representation">Positivity, Mercer representation</h2>

There is an elegant connection between positivity of the kernel and the operator:

**Mercer theorem (positive case).** Let $X$ be compact and let its finite reference measure have full support (for Lebesgue measure this excludes isolated or measure-invisible parts of $X$). For continuous symmetric $k$, positivity of every Gram matrix is equivalent to positivity of $I_k$. In the SPSD case, continuous eigenfunctions with $\lambda_n>0$ give

$$
k(x,y)=\sum_n\lambda_n\phi_n(x)\phi_n(y),
$$

with absolute uniform convergence on $X\times X$. Integrating the diagonal gives the preceding trace formula. Nonzero eigenfunctions are continuous because $\phi_n=I_k\phi_n/\lambda_n$. For general signed continuous symmetric kernels one has an $L^2$ spectral expansion; the pointwise Mercer conclusion is not asserted without additional hypotheses. The positive theorem is what covariance kernels need.

<h2 id="reproducing-kernel-hilbert-spaces">Reproducing kernel Hilbert spaces</h2>

Why is an $L^2$ error not enough for a sensor reading? A narrow triangular spike of height one and width $1/n$ has $L^2$ norm tending to zero but keeps value one at its centre. Point evaluation is therefore not continuous in $L^2$. We need a stronger norm whose smallness controls the measurements we intend to make.

<span data-es98a-source="es98a-point-evaluation:start" />

Keep the centre value fixed while narrowing a spike. Can its area-based norm detect what a point sensor sees?

<Figure id="es98a-point-evaluation" caption="Spike fₕ(t) = max(1 − |t|/h, 0), h positive. Every spike has fₕ(0)=1, but squared L² norm 2h/3 tends to zero.">
<div className="sci-story-grid sci-story-two">
<div><svg className="sci-story-svg" viewBox="0 0 340 290" role="img" aria-label="Triangular spikes"><title>Triangular spikes</title><path d="M45 50V195H310" fill="none" stroke="currentColor" opacity="0.5" /><text x="45" y="25">Triangular spikes</text><text x="300" y="230" textAnchor="end">location t</text><text x="45" y="45">height</text><text x="45.00" y="210" textAnchor="middle">-1</text><text x="305.00" y="210" textAnchor="middle">1</text><text x="38" y="199.00" textAnchor="end">0</text><text x="38" y="59.00" textAnchor="end">1</text><path d="M45.00,195.00 L46.62,193.25 L48.25,191.50 L49.88,189.75 L51.50,188.00 L53.12,186.25 L54.75,184.50 L56.38,182.75 L58.00,181.00 L59.63,179.25 L61.25,177.50 L62.87,175.75 L64.50,174.00 L66.12,172.25 L67.75,170.50 L69.38,168.75 L71.00,167.00 L72.62,165.25 L74.25,163.50 L75.88,161.75 L77.50,160.00 L79.12,158.25 L80.75,156.50 L82.38,154.75 L84.00,153.00 L85.62,151.25 L87.25,149.50 L88.88,147.75 L90.50,146.00 L92.12,144.25 L93.75,142.50 L95.38,140.75 L97.00,139.00 L98.62,137.25 L100.25,135.50 L101.88,133.75 L103.50,132.00 L105.12,130.25 L106.75,128.50 L108.38,126.75 L110.00,125.00 L111.62,123.25 L113.25,121.50 L114.88,119.75 L116.50,118.00 L118.12,116.25 L119.75,114.50 L121.38,112.75 L123.00,111.00 L124.62,109.25 L126.25,107.50 L127.88,105.75 L129.50,104.00 L131.12,102.25 L132.75,100.50 L134.38,98.75 L136.00,97.00 L137.62,95.25 L139.25,93.50 L140.88,91.75 L142.50,90.00 L144.12,88.25 L145.75,86.50 L147.38,84.75 L149.00,83.00 L150.62,81.25 L152.25,79.50 L153.88,77.75 L155.50,76.00 L157.12,74.25 L158.75,72.50 L160.38,70.75 L162.00,69.00 L163.62,67.25 L165.25,65.50 L166.88,63.75 L168.50,62.00 L170.12,60.25 L171.75,58.50 L173.38,56.75 L175.00,55.00 L176.62,56.75 L178.25,58.50 L179.88,60.25 L181.50,62.00 L183.12,63.75 L184.75,65.50 L186.38,67.25 L188.00,69.00 L189.62,70.75 L191.25,72.50 L192.88,74.25 L194.50,76.00 L196.12,77.75 L197.75,79.50 L199.38,81.25 L201.00,83.00 L202.62,84.75 L204.25,86.50 L205.88,88.25 L207.50,90.00 L209.12,91.75 L210.75,93.50 L212.38,95.25 L214.00,97.00 L215.62,98.75 L217.25,100.50 L218.88,102.25 L220.50,104.00 L222.12,105.75 L223.75,107.50 L225.38,109.25 L227.00,111.00 L228.62,112.75 L230.25,114.50 L231.88,116.25 L233.50,118.00 L235.12,119.75 L236.75,121.50 L238.38,123.25 L240.00,125.00 L241.62,126.75 L243.25,128.50 L244.88,130.25 L246.50,132.00 L248.12,133.75 L249.75,135.50 L251.38,137.25 L253.00,139.00 L254.62,140.75 L256.25,142.50 L257.88,144.25 L259.50,146.00 L261.12,147.75 L262.75,149.50 L264.38,151.25 L266.00,153.00 L267.62,154.75 L269.25,156.50 L270.88,158.25 L272.50,160.00 L274.12,161.75 L275.75,163.50 L277.38,165.25 L279.00,167.00 L280.62,168.75 L282.25,170.50 L283.88,172.25 L285.50,174.00 L287.12,175.75 L288.75,177.50 L290.38,179.25 L292.00,181.00 L293.62,182.75 L295.25,184.50 L296.88,186.25 L298.50,188.00 L300.12,189.75 L301.75,191.50 L303.38,193.25 L305.00,195.00" stroke="var(--sci-accent)" strokeWidth="2.5" fill="none" /><text x="45" y="252">solid: width 1</text><path d="M45.00,195.00 L46.62,195.00 L48.25,195.00 L49.88,195.00 L51.50,195.00 L53.12,195.00 L54.75,195.00 L56.38,195.00 L58.00,195.00 L59.63,195.00 L61.25,195.00 L62.87,195.00 L64.50,195.00 L66.12,195.00 L67.75,195.00 L69.38,195.00 L71.00,195.00 L72.62,195.00 L74.25,195.00 L75.88,195.00 L77.50,195.00 L79.12,195.00 L80.75,195.00 L82.38,195.00 L84.00,195.00 L85.62,195.00 L87.25,195.00 L88.88,195.00 L90.50,195.00 L92.12,195.00 L93.75,195.00 L95.38,195.00 L97.00,195.00 L98.62,195.00 L100.25,195.00 L101.88,195.00 L103.50,195.00 L105.12,195.00 L106.75,195.00 L108.38,195.00 L110.00,195.00 L111.62,195.00 L113.25,195.00 L114.88,195.00 L116.50,195.00 L118.12,195.00 L119.75,195.00 L121.38,195.00 L123.00,195.00 L124.62,195.00 L126.25,195.00 L127.88,195.00 L129.50,195.00 L131.12,195.00 L132.75,195.00 L134.38,195.00 L136.00,195.00 L137.62,195.00 L139.25,195.00 L140.88,195.00 L142.50,195.00 L144.12,195.00 L145.75,195.00 L147.38,195.00 L149.00,195.00 L150.62,186.25 L152.25,177.50 L153.88,168.75 L155.50,160.00 L157.12,151.25 L158.75,142.50 L160.38,133.75 L162.00,125.00 L163.62,116.25 L165.25,107.50 L166.88,98.75 L168.50,90.00 L170.12,81.25 L171.75,72.50 L173.38,63.75 L175.00,55.00 L176.62,63.75 L178.25,72.50 L179.88,81.25 L181.50,90.00 L183.12,98.75 L184.75,107.50 L186.38,116.25 L188.00,125.00 L189.62,133.75 L191.25,142.50 L192.88,151.25 L194.50,160.00 L196.12,168.75 L197.75,177.50 L199.38,186.25 L201.00,195.00 L202.62,195.00 L204.25,195.00 L205.88,195.00 L207.50,195.00 L209.12,195.00 L210.75,195.00 L212.38,195.00 L214.00,195.00 L215.62,195.00 L217.25,195.00 L218.88,195.00 L220.50,195.00 L222.12,195.00 L223.75,195.00 L225.38,195.00 L227.00,195.00 L228.62,195.00 L230.25,195.00 L231.88,195.00 L233.50,195.00 L235.12,195.00 L236.75,195.00 L238.38,195.00 L240.00,195.00 L241.62,195.00 L243.25,195.00 L244.88,195.00 L246.50,195.00 L248.12,195.00 L249.75,195.00 L251.38,195.00 L253.00,195.00 L254.62,195.00 L256.25,195.00 L257.88,195.00 L259.50,195.00 L261.12,195.00 L262.75,195.00 L264.38,195.00 L266.00,195.00 L267.62,195.00 L269.25,195.00 L270.88,195.00 L272.50,195.00 L274.12,195.00 L275.75,195.00 L277.38,195.00 L279.00,195.00 L280.62,195.00 L282.25,195.00 L283.88,195.00 L285.50,195.00 L287.12,195.00 L288.75,195.00 L290.38,195.00 L292.00,195.00 L293.62,195.00 L295.25,195.00 L296.88,195.00 L298.50,195.00 L300.12,195.00 L301.75,195.00 L303.38,195.00 L305.00,195.00" stroke="var(--sci-secondary)" strokeWidth="2.5" fill="none" strokeDasharray="5 4" /><text x="45" y="270">dashed: width 0.2</text></svg></div>
<div><svg className="sci-story-svg" viewBox="0 0 340 290" role="img" aria-label="Norm tends to zero"><title>Norm tends to zero</title><path d="M45 50V195H310" fill="none" stroke="currentColor" opacity="0.5" /><text x="45" y="25">Norm tends to zero</text><text x="300" y="230" textAnchor="end">half-width h</text><text x="45" y="45">squared norm</text><text x="45.00" y="210" textAnchor="middle">0</text><text x="305.00" y="210" textAnchor="middle">1</text><text x="38" y="199.00" textAnchor="end">0</text><text x="38" y="59.00" textAnchor="end">1</text><path d="M45.00,195.00 L46.62,194.42 L48.25,193.83 L49.88,193.25 L51.50,192.67 L53.12,192.08 L54.75,191.50 L56.38,190.92 L58.00,190.33 L59.62,189.75 L61.25,189.17 L62.88,188.58 L64.50,188.00 L66.12,187.42 L67.75,186.83 L69.38,186.25 L71.00,185.67 L72.62,185.08 L74.25,184.50 L75.88,183.92 L77.50,183.33 L79.12,182.75 L80.75,182.17 L82.38,181.58 L84.00,181.00 L85.62,180.42 L87.25,179.83 L88.88,179.25 L90.50,178.67 L92.12,178.08 L93.75,177.50 L95.38,176.92 L97.00,176.33 L98.62,175.75 L100.25,175.17 L101.88,174.58 L103.50,174.00 L105.12,173.42 L106.75,172.83 L108.38,172.25 L110.00,171.67 L111.62,171.08 L113.25,170.50 L114.88,169.92 L116.50,169.33 L118.12,168.75 L119.75,168.17 L121.38,167.58 L123.00,167.00 L124.62,166.42 L126.25,165.83 L127.88,165.25 L129.50,164.67 L131.12,164.08 L132.75,163.50 L134.38,162.92 L136.00,162.33 L137.62,161.75 L139.25,161.17 L140.88,160.58 L142.50,160.00 L144.12,159.42 L145.75,158.83 L147.38,158.25 L149.00,157.67 L150.62,157.08 L152.25,156.50 L153.88,155.92 L155.50,155.33 L157.12,154.75 L158.75,154.17 L160.38,153.58 L162.00,153.00 L163.62,152.42 L165.25,151.83 L166.88,151.25 L168.50,150.67 L170.12,150.08 L171.75,149.50 L173.38,148.92 L175.00,148.33 L176.62,147.75 L178.25,147.17 L179.88,146.58 L181.50,146.00 L183.12,145.42 L184.75,144.83 L186.38,144.25 L188.00,143.67 L189.62,143.08 L191.25,142.50 L192.88,141.92 L194.50,141.33 L196.12,140.75 L197.75,140.17 L199.38,139.58 L201.00,139.00 L202.62,138.42 L204.25,137.83 L205.88,137.25 L207.50,136.67 L209.12,136.08 L210.75,135.50 L212.38,134.92 L214.00,134.33 L215.62,133.75 L217.25,133.17 L218.88,132.58 L220.50,132.00 L222.12,131.42 L223.75,130.83 L225.38,130.25 L227.00,129.67 L228.62,129.08 L230.25,128.50 L231.88,127.92 L233.50,127.33 L235.12,126.75 L236.75,126.17 L238.38,125.58 L240.00,125.00 L241.62,124.42 L243.25,123.83 L244.88,123.25 L246.50,122.67 L248.12,122.08 L249.75,121.50 L251.38,120.92 L253.00,120.33 L254.62,119.75 L256.25,119.17 L257.88,118.58 L259.50,118.00 L261.12,117.42 L262.75,116.83 L264.38,116.25 L266.00,115.67 L267.62,115.08 L269.25,114.50 L270.88,113.92 L272.50,113.33 L274.12,112.75 L275.75,112.17 L277.38,111.58 L279.00,111.00 L280.62,110.42 L282.25,109.83 L283.88,109.25 L285.50,108.67 L287.12,108.08 L288.75,107.50 L290.38,106.92 L292.00,106.33 L293.62,105.75 L295.25,105.17 L296.88,104.58 L298.50,104.00 L300.12,103.42 L301.75,102.83 L303.38,102.25 L305.00,101.67" stroke="var(--sci-accent)" strokeWidth="2.5" fill="none" /><text x="45" y="252">solid: squared L² norm = 2h/3</text></svg></div>
</div>
</Figure>

An L²-small perturbation need not be small at the sensor. An RKHS repairs this by making evaluation a bounded linear functional in its own norm.

<span data-es98a-source="es98a-point-evaluation:end" />

Animate the shrinking support rather than changing the height. The point reading remains fixed even while the integral of the squared spike vanishes. The discrepancy tells us which measurement the L² norm cannot control.

<ES98AAnimation kind="narrow-spike" />

A Hilbert space $\mathcal{H}$ of real-valued functions defined on a set $X$ is called a **RKHS** if one/all of these equivalent conditions hold:

1. for every $x\in X$, the point evaluation functional $\delta_x:\mathcal{H}\to\mathbb{R}$,

$$\delta_x u := u(x),$$

is a bounded linear functional, i.e. there is a constant $C(x)$ s.t.

$$|u(x)|\le C(x)\|u\|_{\mathcal{H}};$$

2. there is a canonical feature map $\varphi:X\to\mathcal{H}$ s.t.

$$\langle \varphi(x),u\rangle_{\mathcal{H}}=u(x) \qquad\text{for all }x\in X,\ u\in\mathcal{H};$$

3. there is a function $k:X\times X\to\mathbb{R}$, a **reproducing kernel**, s.t. $k(x,\cdot)\in\mathcal{H}$ for all $x\in X$ and

$$\langle k(x,\cdot),u\rangle_{\mathcal{H}}=u(x) \qquad\text{for all }x\in X,\ u\in\mathcal{H}.$$

(Note: $k(x,\cdot)$ is $\varphi(x)$.)

Once evaluation is bounded, its representer can be moved along the domain. Here the function is a finite combination of kernel sections, so its value and its RKHS inner product can be checked by exactly the same two kernel evaluations.

<ES98AAnimation kind="kernel-evaluation" />

**The Moore–Aronszajn theorem** states that, for every SPSD $k$, there is a unique RKHS $\mathcal{H}=\mathcal{H}_k$ satisfying the above; we call it the **native space** of the kernel.

Construct the native space by quotienting zero-norm combinations and completing the span of all the feature vectors $\varphi(x_i)$, $x_i\in X$, with inner product

$$\left\langle \sum_m \alpha_m\varphi(x_m),\ \sum_n \beta_n\varphi(y_n)\right\rangle_{\mathcal{H}_k} = \sum_{m,n}\alpha_m\beta_n\,k(x_m,y_n).$$

("The kernel trick": using $\langle \varphi(x),\varphi(y)\rangle = k(x,y)$.)

**Theorem.** Let $X$ be closed and bounded in $\mathbb{R}^d$ and let $k$ be continuous and SPD. Let $I_k$ have eigenvalues $\lambda_n>0$ and orthonormal eigenfunctions $\gamma_n$. Then

$$\mathcal{H}_k = \left\{u=\sum_n u_n\gamma_n\ \middle|\ \sum_n \frac{|u_n|^2}{\lambda_n}<\infty\right\},$$

with

$$\left\langle \sum_n u_n\gamma_n,\ \sum_n v_n\gamma_n\right\rangle_{\mathcal{H}_k} = \sum_n \frac{u_n v_n}{\lambda_n}.$$

Here sums run over positive eigenvalues; any null-space coordinates are excluded. On the closure of that positive spectral subspace, $\mathcal H_k$ is $H^{1/2}$ in the scale induced by $I_k$. Strict positivity of finite Gram matrices alone does not justify ignoring possible null directions of the integral operator.

<h2 id="orthogonality-and-closest-point-approximation-in-hilbert-spaces">Orthogonality and closest-point approximation in Hilbert spaces</h2>

Recall that $u,v\in\mathcal{H}$ are orthogonal, denoted $u\perp v$, if

$$\langle u,v\rangle_{\mathcal{H}}=0;$$

they are orthonormal if they are orthogonal and have unit norm.

The orthogonal complement of $S\subseteq\mathcal{H}$ is

$$S^\perp := \{u\in\mathcal{H}\mid u\perp s\ \text{for all }s\in S\}.$$

Nice properties:

- For any $S\subseteq\mathcal{H}$, $S^\perp$ is a closed linear subspace of $\mathcal{H}$ (i.e. every sequence in $S^\perp$ that converges has its limit in $S^\perp$).
- For any closed linear subspace $S$ of $\mathcal{H}$, $S^{\perp\perp}=S$.
- For a linear subspace $S$ of $\mathcal{H}$, $S^{\perp\perp}=\overline{S}$, the closure of $S$ in $\mathcal{H}$.
- For a bounded linear operator $A:H_1\to H_2$ with adjoint $A^*:H_2\to H_1$:

$$(\mathrm{ran}\,A)^\perp=\ker A^*, \qquad (\mathrm{ran}\,A^*)^\perp=\ker A,$$

$$(\ker A^*)^\perp=\overline{\mathrm{ran}\,A}, \qquad (\ker A)^\perp=\overline{\mathrm{ran}\,A^*}.$$

- $\Psi\subseteq\mathcal{H}$ forms a CONB if and only if the vectors $\psi_i\in\Psi$ are orthonormal and $\Psi^\perp=\{0\}$.

A very nice property of Hilbert spaces is that, given any closed subspace $S$ of $\mathcal{H}$, every $u\in\mathcal{H}$ can be decomposed uniquely as

$$u=s' + s^\perp$$

with $s'\in S$ and $s^\perp\in S^\perp$. (Note that $S\cap S^\perp=\{0\}$.)

We say that $\mathcal{H}$ is the orthogonal direct sum of $S$ and $S^\perp$, denoted

$$\mathcal{H}=S\oplus S^\perp.$$

<h2 id="orthogonal-projection-theorem">Orthogonal projection theorem</h2>

Closedness is essential. In $\ell^2$, finite-support sequences approximate $u=(1/n)_n$ arbitrarily well, but none equals it. Projection onto that nonclosed subspace would require a closest point at distance zero outside the subspace.

For a closed subspace, a minimising sequence is Cauchy by the parallelogram identity; completeness and closedness give its limit in the subspace. Varying this limit in any subspace direction forces a perpendicular residual. Pythagoras then gives uniqueness and optimality, exactly as in [Week 1](/notes/es98a/week1#least-squares).

The operation $P_S:u\mapsto s'$ is

- a bounded linear operator $P_S:\mathcal{H}\to\mathcal{H}$ with $\mathrm{ran}\,P_S=S$;
- $P_S P_S = P_S$ and indeed $P_S u=u$ for $u\in S$;
- $P_S^*=P_S$ and $P_S$ is positive semi-definite;
- for all $u_1,u_2\in\mathcal{H}$,

$$\|P_Su_1-P_Su_2\|\le \|u_1-u_2\| \quad\text{and so}\quad \|P_S\|_{\mathrm{op}}\le 1;$$

- **optimal/closest-point approximation:** for all $u\in\mathcal{H}$,

$$\|u-P_Su\|=\min_{s\in S}\|u-s\|;$$

- $s=P_Su \iff s\in S$ and the residual $s-u$ is $\perp$ to $S$;
- $I-P_S=P_{S^\perp}$.

An important consequence of the optimal approximation property is that the optimal approximation of $u\in\mathcal{H}$ given as

$$u=\sum_{n=1}^\infty u_n\psi_n$$

in terms of a CONB within

$$S:=\mathrm{span}\{\psi_1,\ldots,\psi_N\}$$

is just truncating the expansion to $N$ terms:

$$\arg\min_{s=\sum_{n=1}^N a_n\psi_n\in S}\|u-s\| = \sum_{n=1}^N u_n\psi_n.$$

<h2 id="a-teaser-for-least-squares-inverse-problems">A "teaser" for least-squares inverse problems</h2>

Suppose that $A:H_1\to H_2$ with closed range and $y\in H_2$ are given. Suppose that we seek $u\in H_1$ to solve

$$Au=y.$$

This is impossible if $y\notin\mathrm{ran}\,A$, so we relax the problem and seek $u\in H_1$ to minimize

$$\|Au-y\|_{H_2},$$

i.e. find the closest point of $\mathrm{ran}\,A$ to $y$.

Equivalently, minimize

$$\Phi(u):=\frac{1}{2}\|Au-y\|_{H_2}^2.$$

Just as in the finite-dimensional case,

$$u\ \text{minimizes }\Phi \iff \nabla\Phi(u)=0 \iff A^*Au - A^*y = 0,$$

i.e. we need to solve the **normal equations**

$$A^*Au=A^*y.$$

If $A$ has finite rank, $\dim(\mathrm{ran}\,A)=r$ say, then $\mathrm{ran}\,A$ is closed. If $A$ has SVD

$$A=\sum_{i=1}^r \sigma_i\,\phi_i\otimes\psi_i,$$

then the normal equations are solved by

$$u=A^\dagger y =\sum_{i=1}^r \sigma_i^{-1}\,\psi_i\otimes\phi_i\,y =\sum_{i=1}^r \frac{\langle \psi_i,y\rangle_{H_2}}{\sigma_i}\,\phi_i.$$

Many physical forward operators, including infinite-rank compact integral operators, have nonclosed range. The closest-point argument alone then supplies neither existence of a least-squares minimiser for every datum nor a stable inverse. We need a way to control the weakly observed modes.

[Week 7](/notes/es98a/week7) first gives these spectral coefficients random amplitudes; [Week 8](/notes/es98a/week8) returns to the inverse and controls its unstable modes.
