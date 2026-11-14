---
layout: page
title: "Week 7: Random functions in full: covariance operators, stochastic processes, and KL expansions"
---

Choose a function by choosing its coefficients. [Week 5](/notes/es98a/week5) made this a deterministic construction; now let the coefficients vary randomly. How fast must their amplitudes decay for a draw to be an actual vector in the desired space?

This question links three views of the same uncertainty: random coefficients, a covariance operator and a covariance kernel. Parseval will turn function-space variance into a sum of scalar variances. The sum is the key difference between a finite random vector and an infinite random function.

<h2 id="week-7">Route through this chapter</h2>

- Probability on function spaces
- Mean elements, covariance and cross-covariance operators
- Basis expansions with random coefficients
- Generalised polynomial chaos (gPC) expansions
- Handout: Gaussian and other stochastic processes

<h2 id="random-elements-of-hilbert-spaces">Random elements of Hilbert spaces</h2>

Throughout the Hilbert-valued discussion, take $H$ separable and random elements strongly measurable. Gaussian process and gPC examples below are real unless explicitly labelled complex. Given a Hilbert space $H$ (e.g. a Hilbert space of real-valued functions on a set $X$), an $H$-valued random variable is just a (measurable) function $u:\Omega\to H$ defined on a probability space $(\Omega,\mathcal{F},\mathbb{P})$.

Some obvious questions:

1. What are the right notions of mean and variance for $u$?
2. How do we build/sample such $H$-valued random variables?

<h2 id="mean-elements">Mean elements</h2>

Observe that, for an $\mathbb{R}^n$-valued random variable $u:\Omega\to\mathbb{R}^n$, the mean element $m_u\in\mathbb{R}^n$ can be defined as the vector of means of the $n$ components, and also equivalently

$$\mathbb{E}[u]=m_u \iff \mathbb{E}[u-m_u]=0 \iff \text{for all }\ell\in\mathbb{R}^n,\ \mathbb{E}[\langle \ell,\,u-m_u\rangle]=0,$$

where $\langle \ell,\,u-m_u\rangle$ is a real r.v.

Inspired by this, we say that $m_u\in H$ is the (weak) expected value / mean of $u:\Omega\to H$, and write $\mathbb{E}[u]=m_u$, if

$$\text{for all }\ell\in H,\quad \mathbb{E}[\langle \ell,\,u-m_u\rangle_H]=0.$$

(**Note**) cf. the strong/Bochner integral, in which we really do perform vector-valued integration.

<h2 id="covariance-operators">Covariance operators</h2>

The mean is well-defined if $\mathbb{E}[|u|_H]<\infty$.

If $\mathbb{E}[|u|_H^2]<\infty$, then we can go further and define the covariance operator $\mathrm{Cov}[u]$, or $C_u$, of $u:\Omega\to H$ as the linear operator from $H$ to itself given by

$$\langle h,\,C_u k\rangle_H := \mathbb{E}\big[\langle h,\,u-m_u\rangle_H\ \langle u-m_u,\,k\rangle_H\big], \quad\text{for each }h,k\in H.$$

Note, though, that

$$\langle h,\,u-m_u\rangle_H\ \langle u-m_u,\,k\rangle_H = \langle h,\ \langle u-m_u,\,k\rangle_H (u-m_u)\rangle_H,$$

and so (weakly)

$$C_u=\mathbb{E}\big[(u-m_u)\otimes(u-m_u)\big].$$

Similarly, we can define the cross-covariance operator of two random variables. Let $u:\Omega\to H_1$, $v:\Omega\to H_2$ be random variables, i.e. $(u,v)$ takes values in $H_1\oplus H_2$. The cross-covariance operator of $u$ and $v$, denoted $\mathrm{Cov}[u,v]$ or $C_{uv}$, is an operator from $H_2$ into $H_1$ given by

$$\langle h,\,C_{uv} k\rangle_{H_1} := \mathbb{E}\big[\langle h,\,u-m_u\rangle_{H_1}\ \langle v-m_v,\,k\rangle_{H_2}\big],$$

for $k\in H_2$, $h\in H_1$.

Note that $C_u$ above is just $C_{uu}$. Just as before,

$$C_{uv}=\mathbb{E}\big[(v-m_v)\otimes(u-m_u)\big].$$

<h2 id="sazonovs-theorem-structure-of-covariance-operators">Sazonov's theorem (structure of covariance operators)</h2>

**Theorem (Sazonov).** Let $u:\Omega\to H$ take values in a separable Hilbert space (one admitting a finite or countable complete orthonormal basis), have finite second moment $\mathbb{E}[|u|_H^2]$, mean $m_u\in H$ and covariance operator $C_u:H\to H$. Then $C_u$ is SPSD and trace class, and

$$\mathrm{tr}\,C_u=\mathbb{E}\big[|u-m_u|_H^2\big]<\infty.$$

**Proof (sketch pieces).** To see that $C_u$ is self-adjoint, consider any $h,k\in H$:

$$\langle h,\,C_u k\rangle = \mathbb{E}\big[\langle h,\,u-m_u\rangle\ \langle u-m_u,\,k\rangle\big] = \overline{\mathbb{E}\big[\langle k,\,u-m_u\rangle\ \langle u-m_u,\,h\rangle\big]} = \overline{\langle k,\,C_u h\rangle},$$

i.e. $C_u=C_u^*$.

(**Exercise**) Show that $C_{uv}=C_{vu}^*$.

For positivity, let $h\in H$. Then

$$\langle h,\,C_u h\rangle = \mathbb{E}\big[\langle h,\,u-m_u\rangle\ \langle u-m_u,\,h\rangle\big] = \mathbb{E}\big[|\langle h,\,u-m_u\rangle|^2\big]\ge 0.$$

(**Exercise**) $C_u$ is strictly positive iff no nonzero $h$ has $\langle h,u-m_u\rangle=0$ almost surely; equivalently the centred law is not supported on a proper **closed** linear subspace, or the original law on a proper closed affine hyperplane. Centring matters: a constant nonzero random vector has zero covariance. Strict positivity still does not imply a bounded inverse.

To see that $C_u$ has finite trace, let $(\psi_n)_{n\in\mathbb{N}}$ be any CONB of $H$. Then

$$\mathrm{tr}\,C_u = \sum_{n\in\mathbb{N}} \langle \psi_n,\,C_u\psi_n\rangle = \sum_{n\in\mathbb{N}}\mathbb{E}\big[|\langle \psi_n,\,u-m_u\rangle|^2\big] = \mathbb{E}\Big[\sum_{n\in\mathbb{N}}|\langle \psi_n,\,u-m_u\rangle|^2\Big]$$

(Tonelli for the nonnegative series)

$$= \mathbb{E}\big[|u-m_u|^2\big]$$

(Parseval)

$$\le 2|m_u|^2 + 2\mathbb{E}\big[|u|^2\big]<\infty.$$

$\square$

An important consequence of Sazonov's theorem is that a finite-variance random vector $u$ with values in an infinite-dimensional $H$ can never have identity covariance.

<h2 id="randomised-basis-expansions">Randomised basis expansions</h2>

Fix a CONB $(\psi_n)_{n\in\mathbb{N}}$ of a (real) Hilbert space $H$, e.g. a space of functions on some set $X$. We propose to define a random element $u$ of $H$ via

$$u := \sum_{n\in\mathbb{N}} \xi_n \psi_n,$$

where the $\xi_n$, $n\in\mathbb{N}$, are $\mathbb{R}$-valued random variables.

Question: What conditions need to be imposed on the $\xi_n$ to ensure that $u\in H$ a.s.?

The key tool here is Kolmogorov's two-series theorem from last week's handout.

**Theorem.** Let $(\psi_n)_n$ be a CONB of $H$. Fix a deterministic sequence $(\sigma_n)_n$ with $\sigma_n\in\mathbb{R}$, and set

$$u := \sum_{n\in\mathbb{N}} \sigma_n \xi_n \psi_n, \quad\text{with}\quad \xi_n\sim\mathcal{N}(0,1)\ \text{i.i.d.}$$

If $\sum_n \sigma_n^2<\infty$, then $u\in H$ a.s. Moreover $\mathbb{E}[u]=m_u=0$, and $\mathrm{Cov}[u]=C_u=\Sigma^2$, where $\Sigma^2$ is the diagonal operator $\psi_n\mapsto |\sigma_n|^2\psi_n$.

**Proof.** Observe that

$$u\in H \iff |u|_H^2<\infty \iff \sum_{n\in\mathbb{N}}|\sigma_n\xi_n|^2<\infty$$

(by Parseval).

In fact no two-series theorem is needed for this sufficient condition. Tonelli gives

$$
\mathbb E\left[\sum_n|\sigma_n\xi_n|^2\right]=\sum_n\sigma_n^2<\infty.
$$

A nonnegative random variable with finite expectation is finite almost surely, so the coefficient sequence is square-summable almost surely. Its tails also tend to zero in $L^2(\Omega;H)$. The source's fourth-moment/two-series argument below is an alternative route, not a necessary extra assumption.

Now observe that

$$\sum_n \mathbb{E}[|\sigma_n\xi_n|^2] = \sum_n |\sigma_n|^2\mathbb{E}[|\xi_n|^2] = \sum_n |\sigma_n|^2<\infty,$$

and

$$\sum_n \mathbb{E}[|\sigma_n\xi_n|^4] = \sum_n |\sigma_n|^4\mathbb{E}[|\xi_n|^4] = 3\sum_n |\sigma_n|^4<\infty.$$

So Kolmogorov's two-series theorem ensures that $\mathbb{P}[\sum_n |\sigma_n\xi_n|^2<\infty]=1$, i.e. $\mathbb{P}[u\in H]=1$.

(**Exercises**) Check that $\mathbb{E}[u]=0$ (easy!). Check that $\mathrm{Cov}[u]=\Sigma^2$.

$\square$

**Example.** On $H:=L^2_{\mathrm{per}}([0,2\pi];\mathbb{C})$ with Fourier CONB $\psi_n(t)=\exp(int)/\sqrt{2\pi}$ for $n\in\mathbb{Z}$, we can build a random element $u$ of $H$ by setting e.g.

$$u=\sum_{n\in\mathbb{Z}}\sigma_n\xi_n\psi_n, \qquad \sigma_0:=0, \qquad \sigma_{\pm n}:=\frac{1}{n}\ \text{for }n\ne 0.$$

This example is complex-valued with real Gaussian coefficients; it is not a real-valued process unless conjugate Fourier coefficients are coupled. A real sine/cosine basis with independent real coefficients gives the corresponding real model. The zero Fourier mode is excluded when identifying covariance with $(-\Delta)^{-1}$.

Then

$$\sum_{n\in\mathbb{Z}}\sigma_n^2 = 2\sum_{n\in\mathbb{N}}\frac{1}{n^2} = \frac{\pi^2}{3}<\infty,$$

and so $u\in L^2$ a.s.

Indeed, one can similarly check that $u\in H^s$ for all $s<\tfrac{1}{2}$. The mean is the zero function, and the covariance operator is $\psi_n\mapsto n^{-2}\psi_n$, i.e. $\mathrm{Cov}[u]=(-\Delta)^{-1}$, i.e. is the integral operator whose kernel is the Green's function (fundamental solution) of Laplace's equation.

<span data-es98a-source="es98a-variance-budget:start" />

Random coefficients must share a finite variance budget. Compare decaying mode variances with constant mode variance.

<Figure id="es98a-variance-budget" caption="Each panel shows cumulative expected squared norm for an orthonormal expansion. Vertical scales differ: the left stays below π²/6; the right grows as N.">
<div className="sci-story-grid sci-story-two">
<div><svg className="sci-story-svg" viewBox="0 0 340 290" role="img" aria-label="Decaying variance"><title>Decaying variance</title><path d="M45 50V195H310" fill="none" stroke="currentColor" opacity="0.5" /><text x="45" y="25">Decaying variance</text><text x="300" y="230" textAnchor="end">modes N</text><text x="45" y="45">total variance</text><text x="45.00" y="210" textAnchor="middle">1</text><text x="305.00" y="210" textAnchor="middle">20</text><text x="38" y="199.00" textAnchor="end">0</text><text x="38" y="59.00" textAnchor="end">2</text><path d="M45.00,125.00 L46.62,125.00 L48.25,125.00 L49.88,125.00 L51.50,125.00 L53.12,125.00 L54.75,125.00 L56.38,125.00 L58.00,125.00 L59.62,107.50 L61.25,107.50 L62.88,107.50 L64.50,107.50 L66.12,107.50 L67.75,107.50 L69.38,107.50 L71.00,107.50 L72.62,99.72 L74.25,99.72 L75.88,99.72 L77.50,99.72 L79.12,99.72 L80.75,99.72 L82.38,99.72 L84.00,99.72 L85.62,99.72 L87.25,95.35 L88.88,95.35 L90.50,95.35 L92.12,95.35 L93.75,95.35 L95.38,95.35 L97.00,95.35 L98.62,95.35 L100.25,92.55 L101.88,92.55 L103.50,92.55 L105.12,92.55 L106.75,92.55 L108.38,92.55 L110.00,92.55 L111.62,92.55 L113.25,92.55 L114.88,90.60 L116.50,90.60 L118.12,90.60 L119.75,90.60 L121.38,90.60 L123.00,90.60 L124.62,90.60 L126.25,90.60 L127.88,89.17 L129.50,89.17 L131.12,89.17 L132.75,89.17 L134.38,89.17 L136.00,89.17 L137.62,89.17 L139.25,89.17 L140.88,88.08 L142.50,88.08 L144.12,88.08 L145.75,88.08 L147.38,88.08 L149.00,88.08 L150.62,88.08 L152.25,88.08 L153.88,88.08 L155.50,87.22 L157.12,87.22 L158.75,87.22 L160.38,87.22 L162.00,87.22 L163.62,87.22 L165.25,87.22 L166.88,87.22 L168.50,86.52 L170.12,86.52 L171.75,86.52 L173.38,86.52 L175.00,86.52 L176.62,86.52 L178.25,86.52 L179.88,86.52 L181.50,86.52 L183.12,85.94 L184.75,85.94 L186.38,85.94 L188.00,85.94 L189.62,85.94 L191.25,85.94 L192.88,85.94 L194.50,85.94 L196.12,85.45 L197.75,85.45 L199.38,85.45 L201.00,85.45 L202.62,85.45 L204.25,85.45 L205.88,85.45 L207.50,85.45 L209.12,85.45 L210.75,85.04 L212.38,85.04 L214.00,85.04 L215.62,85.04 L217.25,85.04 L218.88,85.04 L220.50,85.04 L222.12,85.04 L223.75,84.68 L225.38,84.68 L227.00,84.68 L228.62,84.68 L230.25,84.68 L231.88,84.68 L233.50,84.68 L235.12,84.68 L236.75,84.37 L238.38,84.37 L240.00,84.37 L241.62,84.37 L243.25,84.37 L244.88,84.37 L246.50,84.37 L248.12,84.37 L249.75,84.37 L251.38,84.10 L253.00,84.10 L254.63,84.10 L256.25,84.10 L257.88,84.10 L259.50,84.10 L261.12,84.10 L262.75,84.10 L264.38,83.85 L266.00,83.85 L267.62,83.85 L269.25,83.85 L270.88,83.85 L272.50,83.85 L274.12,83.85 L275.75,83.85 L277.38,83.85 L279.00,83.64 L280.62,83.64 L282.25,83.64 L283.88,83.64 L285.50,83.64 L287.12,83.64 L288.75,83.64 L290.38,83.64 L292.00,83.44 L293.62,83.44 L295.25,83.44 L296.88,83.44 L298.50,83.44 L300.12,83.44 L301.75,83.44 L303.38,83.44 L305.00,83.27" stroke="var(--sci-accent)" strokeWidth="2.5" fill="none" /><text x="45" y="252">solid: sum through N of 1/n²</text></svg></div>
<div><svg className="sci-story-svg" viewBox="0 0 340 290" role="img" aria-label="White-noise truncation"><title>White-noise truncation</title><path d="M45 50V195H310" fill="none" stroke="currentColor" opacity="0.5" /><text x="45" y="25">White-noise truncation</text><text x="300" y="230" textAnchor="end">modes N</text><text x="45" y="45">total variance</text><text x="45.00" y="210" textAnchor="middle">1</text><text x="305.00" y="210" textAnchor="middle">20</text><text x="38" y="199.00" textAnchor="end">0</text><text x="38" y="59.00" textAnchor="end">20</text><path d="M45.00,188.00 L46.62,188.00 L48.25,188.00 L49.88,188.00 L51.50,188.00 L53.12,188.00 L54.75,188.00 L56.38,188.00 L58.00,188.00 L59.62,181.00 L61.25,181.00 L62.88,181.00 L64.50,181.00 L66.12,181.00 L67.75,181.00 L69.38,181.00 L71.00,181.00 L72.62,174.00 L74.25,174.00 L75.88,174.00 L77.50,174.00 L79.12,174.00 L80.75,174.00 L82.38,174.00 L84.00,174.00 L85.62,174.00 L87.25,167.00 L88.88,167.00 L90.50,167.00 L92.12,167.00 L93.75,167.00 L95.38,167.00 L97.00,167.00 L98.62,167.00 L100.25,160.00 L101.88,160.00 L103.50,160.00 L105.12,160.00 L106.75,160.00 L108.38,160.00 L110.00,160.00 L111.62,160.00 L113.25,160.00 L114.88,153.00 L116.50,153.00 L118.12,153.00 L119.75,153.00 L121.38,153.00 L123.00,153.00 L124.62,153.00 L126.25,153.00 L127.88,146.00 L129.50,146.00 L131.12,146.00 L132.75,146.00 L134.38,146.00 L136.00,146.00 L137.62,146.00 L139.25,146.00 L140.88,139.00 L142.50,139.00 L144.12,139.00 L145.75,139.00 L147.38,139.00 L149.00,139.00 L150.62,139.00 L152.25,139.00 L153.88,139.00 L155.50,132.00 L157.12,132.00 L158.75,132.00 L160.38,132.00 L162.00,132.00 L163.62,132.00 L165.25,132.00 L166.88,132.00 L168.50,125.00 L170.12,125.00 L171.75,125.00 L173.38,125.00 L175.00,125.00 L176.62,125.00 L178.25,125.00 L179.88,125.00 L181.50,125.00 L183.12,118.00 L184.75,118.00 L186.38,118.00 L188.00,118.00 L189.62,118.00 L191.25,118.00 L192.88,118.00 L194.50,118.00 L196.12,111.00 L197.75,111.00 L199.38,111.00 L201.00,111.00 L202.62,111.00 L204.25,111.00 L205.88,111.00 L207.50,111.00 L209.12,111.00 L210.75,104.00 L212.38,104.00 L214.00,104.00 L215.62,104.00 L217.25,104.00 L218.88,104.00 L220.50,104.00 L222.12,104.00 L223.75,97.00 L225.38,97.00 L227.00,97.00 L228.62,97.00 L230.25,97.00 L231.88,97.00 L233.50,97.00 L235.12,97.00 L236.75,90.00 L238.38,90.00 L240.00,90.00 L241.62,90.00 L243.25,90.00 L244.88,90.00 L246.50,90.00 L248.12,90.00 L249.75,90.00 L251.38,83.00 L253.00,83.00 L254.63,83.00 L256.25,83.00 L257.88,83.00 L259.50,83.00 L261.12,83.00 L262.75,83.00 L264.38,76.00 L266.00,76.00 L267.62,76.00 L269.25,76.00 L270.88,76.00 L272.50,76.00 L274.12,76.00 L275.75,76.00 L277.38,76.00 L279.00,69.00 L280.62,69.00 L282.25,69.00 L283.88,69.00 L285.50,69.00 L287.12,69.00 L288.75,69.00 L290.38,69.00 L292.00,62.00 L293.62,62.00 L295.25,62.00 L296.88,62.00 L298.50,62.00 L300.12,62.00 L301.75,62.00 L303.38,62.00 L305.00,55.00" stroke="var(--sci-accent)" strokeWidth="2.5" fill="none" /><text x="45" y="252">solid: sum through N of 1</text></svg></div>
</div>
</Figure>

Every finite white-noise truncation exists, yet their expected squared norms have no finite limit. For Gaussian white noise the strong law gives the stronger almost-sure divergence stated below.

<span data-es98a-source="es98a-variance-budget:end" />

Reveal one fixed random draw through its coefficients. Replaying uses the same random numbers, so the new detail comes only from adding modes. The displayed variance budget is an expectation over draws, not the realised energy of this one curve.

<ES98AAnimation kind="random-series" />

<h3 id="gaussian-white-noise">Gaussian white noise</h3>

A naive definition of Gaussian white noise on $H$ is

$$w := \sum_{n\in\mathbb{N}} \xi_n \psi_n, \qquad \xi_n\sim\mathcal{N}(0,1)\ \text{i.i.d.}$$

Unfortunately, it is easy to show that $\mathbb{P}[|w|_H=\infty]=1$, so $w$ is almost surely too rough to land in $H$. These are formal or cylindrical mean/covariance statements; $w$ is not an $H$-valued random element. Indeed the strong law gives $N^{-1}\sum_{n=1}^N\xi_n^2\to1$ almost surely. In the one-dimensional Fourier Sobolev scale, $\sum_n(1+n^2)^s<\infty$ for $s<-1/2$, so the same expectation argument places white noise in these negative spaces almost surely. This threshold refers to that scale; it is not universal for an arbitrary Hilbert scale.

<h2 id="generalised-polynomial-chaos-gpc-expansions">Generalised polynomial chaos (gPC) expansions</h2>

The idea here is to express a "complicated" r.v. $u$ as a sum of "simple" deterministic functions of a "simple" r.v. $\xi$, called the stochastic germ. To keep things concrete, fix a r.v. $\xi:\Omega\to X=\mathbb{R}$ with law $\mu_\xi$. Under mild assumptions (need that $\mathbb{E}[e^{a|\xi|}]<\infty$ for some $a>0$) there is a system $\{q_k\}_{k\in\mathbb{N}_0}$ of orthogonal polynomials for $\xi/\mu_\xi$:

- each $q_k:\mathbb{R}\to\mathbb{R}$ is a polynomial of degree $k$;
- they satisfy the orthogonality relation

$$\mathbb{E}[q_j(\xi)\,q_k(\xi)] = \gamma_k \delta_{jk}$$

for some normalisation constants $\gamma_k>0$;

- the normalised functions $q_k/\sqrt{\gamma_k}$ form a CONB for $L^2(X,\mu_\xi;\mathbb{R})$.

E.g.:

- For $\xi\sim\mathcal{N}(0,1)$, we obtain the Hermite polynomials

$$\mathrm{He}_0(z)=1,\quad \mathrm{He}_1(z)=z,\quad \mathrm{He}_2(z)=z^2-1,\ \ldots$$

The normalisation constant is $\gamma_k=k!$.

- For $\xi\sim U([-1,1])$, we obtain the Legendre polynomials.

Assume $u=F(\xi)\in L^2(\Omega)$ is measurable with respect to the germ. Otherwise a basis of functions of $\xi$ reconstructs only $\mathbb E[u\mid\xi]$, not independent randomness hidden in $u$. For finite-support germ laws the polynomial system terminates at the dimension of $L^2(\mu_\xi)$; an infinite sequence of positive normalisations requires infinite support.

The idea now is simply to expand $u$ (thought of as a function on $X$) in the orthogonal basis $\{q_k\}_{k}$:

$$u = \sum_{k\in\mathbb{N}_0} u_k\,q_k(\xi),$$

with

$$u_k=\gamma_k^{-1}\mathbb{E}[u\,q_k(\xi)]\in\mathbb{R}.$$

In practice, the expected value on the RHS will have to be approximated somehow, e.g. via Monte Carlo sampling:

$$u_k \approx \hat u_k^{(N)} := \frac{1}{N\gamma_k}\sum_{n=1}^N u(\xi^{(n)})\,q_k(\xi^{(n)}), \qquad \xi^{(n)}\sim \mu_\xi\ \text{i.i.d.}$$

Think of this as a cheap surrogate model for the potentially expensive/slow/complicated r.v. $u$.

The same procedure can be followed for any system of functions $q_k$ that are orthogonal w.r.t. $\mu_\xi$, not just polynomials, e.g. wavelets, Fourier basis functions, …

We can do the same thing for gPC expansion of a random vector $u:\Omega\to\mathbb{R}^d$. Again we expand as

$$u = \sum_k u_k\,q_k(\xi), \qquad u_k=\gamma_k^{-1}\mathbb{E}[u\,q_k(\xi)]\in\mathbb{R}^d.$$

We can do the same thing for gPC expansion of a random function $u:\Omega\to\{\text{functions on }T\}$, i.e. stochastic processes/functions:

$$u(t,\xi) = \sum_k u_k(t)\,q_k(\xi),$$

with $u_k:T\to\mathbb{R}$ given by

$$u_k(t)=\gamma_k^{-1}\mathbb{E}[u(t,\xi)\,q_k(\xi)].$$

(the "stochastic modes" or gPC modes of $u$)

We also often expand using multiple stochastic germs $\xi_1,\ldots,\xi_M$. We then need a system of functions $\mathbb{R}^M\to\mathbb{R}$ that form a CONB with respect to the joint law $\mu_\xi$ of $\xi=(\xi_1,\ldots,\xi_M)$. If the components of $\xi$ are independent, then joint basis functions are just products of univariate ones, but beware the curse of dimension: learning $K^M$ coefficients can rapidly exhaust your computational resources!

Now keep the random numbers fixed and change a covariance eigenvalue. The coefficient ellipse and the function curves must change together, because they are two representations of the same two-mode random element.

<ES98AAnimation kind="covariance-modes" />

<h2 id="stochastic-processes">Stochastic processes</h2>

A **stochastic process** on a set $X$ is just a (measurable) function

$$u:X\times\Omega\to\mathbb{R},$$

where $(\Omega,\mathcal{F},\mathbb{P})$ is some probability space, i.e. it is just a family of $\mathbb{R}$-valued random variables $u(x)$, one for each $x\in X$.

<h3 id="mean-and-covariance-functions">Mean and covariance functions</h3>

The **mean function** $m_u:X\to\mathbb{R}$ of $u$ is given by

$$m_u(x):=\mathbb{E}[u(x)] = \int_\Omega u(x,\omega)\,\mathbb{P}(d\omega),$$

defined as long as $\mathbb{E}[|u(x)|]$ is finite for all $x\in X$.

The **covariance function / cov. kernel** $k_u:X\times X\to\mathbb{R}$ is given by

$$k_u(x,y):=\mathbb{E}\big[(u(x)-m_u(x))(u(y)-m_u(y))\big],$$

and is defined as long as $\mathbb{E}[|u(x)|^2]<\infty$ for all $x\in X$.

<h3 id="gaussian-processes">Gaussian processes</h3>

A stochastic process $u:X\times\Omega\to\mathbb{R}$ is called a **Gaussian process (GP)** with mean func. $m:X\to\mathbb{R}$ and cov. func. $k:X\times X\to\mathbb{R}$, denoted $u\sim\mathrm{GP}(m,k)$, if, for all $x_1,\ldots,x_n\in X$, $n\in\mathbb{N}$,

$$\begin{pmatrix} u(x_1)\\ \vdots\\ u(x_n) \end{pmatrix} \sim \mathcal{N}\!\left( \begin{pmatrix} m(x_1)\\ \vdots\\ m(x_n) \end{pmatrix}, \begin{pmatrix} k(x_1,x_1) & \cdots & k(x_1,x_n)\\ \vdots & \ddots & \vdots\\ k(x_n,x_1) & \cdots & k(x_n,x_n) \end{pmatrix} \right).$$

<h2 id="examples">Examples</h2>

Some commonly-used covariance functions include:

- **Brownian kernel:** $k(x,y):=\min(x,y)$ on $X=[0,T]$

- **Squared exp. kernel:** for $X=\mathbb{R}^d$,

$$k(x,y):=\sigma^2\exp\!\left(-\frac{\|x-y\|^2}{2\ell^2}\right)$$

- **Exp. kernel:**

$$k(x,y):=\sigma^2\exp\!\left(-\frac{\|x-y\|}{\ell}\right)$$

- **Matérn kernels**

<h2 id="karhunenloève-theorem">Karhunen–Loève theorem</h2>

There is a close relationship between "nice" stochastic processes and random basis expansions in the eigenbasis of a suitable integral operator.

**Karhunen–Loève Theorem.** Let $X\subseteq\mathbb{R}^d$ and let $u:X\times\Omega\to\mathbb{R}$ be centred (i.e. $m_u=0$) and square-integrable (i.e.

$$\mathbb{E}\!\left[\int_X |u(x)|^2\,dx\right] = \int_X \mathbb{E}[|u(x)|^2]\,dx < \infty$$

), with continuous and square-integrable cov. func. $k$.

Then the induced integral op.

$$I_k:L^2(X)\to L^2(X), \qquad (I_k f)(x):=\int_X k(x,y)f(y)\,dy$$

is the cov. op. $\mathrm{Cov}[u]$ of $u$. Let $\lambda_n\ge 0$ and $\psi_n$ be the eigenvalues and orthonormal eigenfunctions of $I_k$. Then

$$u=\sum_{n\in\mathbb{N}} z_n\,\psi_n,$$

with

$$z_n=\int_X u(x)\psi_n(x)\,dx=\langle u,\psi_n\rangle_{L^2(X)},$$

and the r.v.s $z_n$ are centred (i.e. $\mathbb{E}[z_n]=0$) and uncorrelated with variance $\lambda_n$ (i.e. $\mathbb{E}[z_n z_m]=\lambda_n\delta_{nm}$).

Furthermore, if $u\sim \mathrm{GP}(0,k)$, then

$$z_n\sim\mathcal{N}(0,\lambda_n).$$

The KL expansion converges in $L^2(\Omega;L^2(X))$, and its mean-square truncation error is $\sum_{n>N}\lambda_n$. In the Gaussian case the coefficients are jointly Gaussian and uncorrelated, hence independent. For a non-Gaussian process they need only be uncorrelated. This is the random analogue of the projection error in Week 6.

<h2 id="smoothness-of-sample-draws">Smoothness of sample draws</h2>

Mean-square differentiability and almost-sure differentiability of paths are different claims. Suitable continuous mixed derivatives of the covariance give derivatives in mean square. Almost-sure path regularity needs additional increment bounds and a continuity/modification theorem; covariance differentiability alone is not used here as a pathwise theorem. See [Rasmussen and Williams, Chapter 4](https://gaussianprocess.org/gpml/chapters/RW4.pdf).

A directly checkable alternative uses the spectral scale. If

$$
\sum_n(1+n^2)^s\sigma_n^2<\infty,
$$

then the Fourier random series lies in $H^s_{\rm per}$ almost surely by Tonelli. For $\sigma_n=1/|n|$, this holds for every fixed $s<1/2$. Sobolev embedding then yields any pathwise regularity that this bound actually supports; it does not assert continuity at the endpoint.

For an infinite-rank Gaussian with covariance eigenvalues $\lambda_n>0$, its RKHS norm would be $\sum_n |z_n|^2/\lambda_n=\sum_n\xi_n^2=\infty$ almost surely. Typical draws are therefore outside the covariance RKHS. There is no universal exact “loss of $d/2$ derivatives” without specifying a spectral model and domain.

<h2 id="proof-that-mathrmcovui_k">Proof that $\mathrm{Cov}[u]=I_k$</h2>

For $f,g\in L^2(X)$, by definition of the covariance operator,

$$\langle f,\ \mathrm{Cov}[u]\,g\rangle_{L^2} = \mathbb{E}\big[\langle f,u\rangle_{L^2}\ \langle u,g\rangle_{L^2}\big] = \mathbb{E}\left[\left(\int_X f(x)u(x)\,dx\right)\left(\int_X u(y)g(y)\,dy\right)\right].$$

(Fubini)

$$= \mathbb{E}\left[\int_X\int_X f(x)u(x)u(y)g(y)\,dx\,dy\right] = \int_X\int_X f(x)\,\mathbb{E}[u(x)u(y)]\,g(y)\,dy\,dx$$

$$= \int_X f(x)\left(\int_X k(x,y)g(y)\,dy\right)\,dx = \int_X f(x)\,(I_k g)(x)\,dx = \langle f,\ I_k g\rangle_{L^2}.$$

$\square$

At many points now, we have a necessary step in implementing our mathematical ideas: we need to learn/fit coefficients in a model to best explain some data, or to best approximate some underlying function. This naturally leads us to our next topic: **inverse problems**.
