---
layout: page
title: "Week 10: Gaussian processes + well-posed Bayesian inversion in high/infinite dimensions"
---

The output of [Week 9](/notes/es98a/week9#generalised-bayes-rule) is a law, not just a fitted vector. That changes what a stable answer means. Two posterior means might agree while their uncertainty differs dramatically; conversely two point estimates may differ while the posterior predictions remain close.

We close the course by measuring distance between laws, connecting posterior modes to regularised optimisation, and conditioning Gaussian processes to predict unobserved values and integrals. The geometry of projection now acts on both predictions and uncertainty.

<h2 id="week-10">Route through this chapter</h2>

- Handout: GP regression
- Well-posedness of Bayesian inverse problems
- MAP estimation as the connection between BIPs and regularised optimisation
- Lab: Robust MCMC for high-dimensional BIPs

---

<h3 id="recap">Recap</h3>

In a BIP with prior $u \sim \mu_0$ on $H$, finite-dimensional data in $Y$ with PDF proportional to $\exp(-\Phi(u;y))$, the solution is the posterior distribution $\mu^y$ satisfying Bayes' formula

$$\mu^y(du) = \frac{\exp(-\Phi(u;y))}{Z^y} \mu_0(du)$$

where

$$Z^y = \int_H \exp(-\Phi(u;y)) \, \mu_0(du)$$

In the special case where $\Phi(u;y) = \frac{1}{2}\|\Gamma^{-1/2}(Au-y)\|_2^2$ and $\mu_0 = \mathcal{N}(m_0,C_0)$, the posterior is again Gaussian: $\mu^y = \mathcal{N}(m^y,C^y)$ (Kalman update).

---

<h3 id="natural-questions">Natural questions</h3>

1. Beyond the linear Gaussian case, how will we practically realise and access $\mu^y$? Here we eventually use all the standard tools of numerical integration to approximate posterior expectations of quantities of interest.

    **NB:** MH-MCMC is well suited to this situation, since it can be implemented without knowing the normalising constant $Z^y$, because it cancels out in the acceptance probability calculation.

2. Does the Bayesian approach alleviate the ill-posedness of the inverse problem? The posterior $\mu^y$ is well defined, but is it a stable function of the data $y$?

3. How are the Bayesian and optimisation viewpoints connected?

---

<h2 id="well-posedness-of-bips">Well-posedness of BIPs</h2>

To make quantitative statements about the stability of $\mu^y$ as a function of $y$, we need a distance function on the set of probability measures on $H$. There are many good ones, e.g. total variation distance, the Kullback–Leibler divergence, but we'll use the **Hellinger distance**.

Suppose we have $\mu_1, \mu_2$ that both have densities with respect to $\nu$. The Hellinger distance between them is

$$d_H(\mu_1,\mu_2)^2 = \frac{1}{2} \int_H \left| \sqrt{\frac{d\mu_1}{d\nu}} - \sqrt{\frac{d\mu_2}{d\nu}} \right|^2 d\nu$$

**NB:** We always have $0 \le d_H(\mu_1,\mu_2) \le 1$.

To see why square roots appear, separate two Gaussian means while keeping their variances fixed. The shaded integrand in the square-root view accumulates to the squared Hellinger distance.

<ES98AAnimation kind="hellinger" />

One nice feature of $d_H$ is that it controls expected values of quantities of interest.

**Lemma.** For any $f \in L^2(H,\mu_1) \cap L^2(H,\mu_2)$,

$$\left| \mathbb{E}_{\mu_1}[f] - \mathbb{E}_{\mu_2}[f] \right| \le 2\sqrt{\mathbb{E}_{\mu_1}[f^2] + \mathbb{E}_{\mu_2}[f^2]} \cdot d_H(\mu_1,\mu_2)$$

(The proof is basically just an application of the triangle inequality and the Cauchy–Schwarz inequality.)

**Example (finite-dim case).** The Hellinger distance between Gaussians $\mu_0 = \mathcal{N}(m_0,C_0)$ and $\mu_1 = \mathcal{N}(m_1,C_1)$ involves a formula that hints at a problem for infinite dimensions: even if $m_0 - m_1$ is small, it may lie outside certain ranges, making $d_H(\mu_0,\mu_1) = 1$ no matter how small the mean difference is.

The posterior turns out to be stable in the Hellinger sense.

**Lemma.** Let $\mu_1, \mu_2$ be of the form

$$\mu_i(du) = \frac{1}{Z_i} \exp(-\Phi_i(u)) \, \nu(du)$$

where $\nu$ is a probability measure, $\Phi_1, \Phi_2$ are measurable and non-negative, $0<Z_i\le1$, and $\Phi_1-\Phi_2\in L^2(\nu)$. Then

$$d_H(\mu_1,\mu_2) \le \frac{1}{\sqrt{2} \min(Z_1,Z_2)} \|\Phi_1 - \Phi_2\|_{L^2(\nu)}$$

**Derivation.** Put $a_i=e^{-\Phi_i/2}$ and $r_i=\sqrt{Z_i}=\|a_i\|_2$. Since $t\mapsto e^{-t/2}$ is $1/2$-Lipschitz on $[0,\infty)$,

$$
\|a_1-a_2\|_2\le\tfrac12\|\Phi_1-\Phi_2\|_2,\qquad
|r_1-r_2|\le\|a_1-a_2\|_2.
$$

Adding and subtracting $a_2/r_1$ gives $\|a_1/r_1-a_2/r_2\|_2\le2\|a_1-a_2\|_2/\min r_i$. Divide by $\sqrt2$ to bound Hellinger distance. Since $\sqrt{Z_i}\ge Z_i$, this proves the stated (weaker) bound.

Two related warnings:

1. Since $d_H(\mu_1,\mu_2) \le 1$ under all circumstances, the inequality could be "true but useless" if the RHS is large.
2. When $\Phi_i$ grows rapidly (e.g. it is a misfit function for very precisely observed data), $Z_i$ will be very small, and we end up in the situation of warning 1.

---

<h3 id="applying-the-lemma-to-a-specific-bip">Applying the lemma to a specific BIP</h3>

- $H$ will be a Hilbert space, possibly infinite-dimensional.
- We observe data in $Y = \mathbb{R}^J$ for $J \in \mathbb{N}$.
- Specifically we observe $y = G(u) + \eta$.
- The forward operator $G: H \to Y$ is known, deterministic, and stable (Lipschitz continuous).
- The observational noise $\eta$ is independent of $u$ and is Gaussian: $\eta \sim \mathcal{N}(0,\Gamma)$ with $\Gamma$ SPD.
- Hence the potential is the quadratic misfit

$$\Phi(u;y) = \frac{1}{2} \|\Gamma^{-1/2}(y - G(u))\|^2$$

- The prior $\mu_0$ on $u$ is not required to be Gaussian.

**Theorem (sufficient moment assumptions).** Assume additionally $\int_H\|G(u)\|^2\,\mu_0(du)<\infty$; for globally Lipschitz $G$, a prior with finite second moment suffices. The posterior $\mu^y$ is a locally Lipschitz continuous function of $y$. That is, for each $R > 0$, there exists $K$ such that for all $y, y'$ with bounded norm,

$$d_H(\mu^y, \mu^{y'}) \le K \|y - y'\|$$

For bounded $y,y'$, the difference of squared misfits is bounded by $C_R(1+\|G(u)\|)\|y-y'\|$. The moment assumption makes its $L^2(\mu_0)$ norm finite. Also choose a set of positive prior mass where $\|G(u)\|$ is bounded; the likelihood on that set gives a uniform positive lower bound on $Z^y$ for $\|y\|\le R$. The perturbation lemma now gives the theorem. This is a sufficient route, not the weakest possible hypotheses; see [Stuart (2010)](https://doi.org/10.1017/S0962492910000061).

But remember that $K$ can easily be large when the noise covariance $\Gamma$ is small!

---

<h2 id="maximum-a-posteriori-map-estimation">Maximum a posteriori (MAP) estimation</h2>

To build intuition, consider a BIP on $H = \mathbb{R}^N$, where the prior $\mu_0$ has a PDF $\rho_0$. The posterior $\mu^y$ also has a PDF $\rho^y$:

$$\rho^y(u) = \frac{\exp(-\Phi(u;y))}{Z^y} \rho_0(u)$$

Take negative logarithms:

$$-\log \rho^y(u) = \Phi(u;y) - \log \rho_0(u) + \log Z^y$$

Let's further specialise to a nondegenerate centred Gaussian prior ($C_0$ SPD), $\mu_0 = \mathcal{N}(0,C_0)$:

$$-\log \rho^y(u) = \Phi(u;y) + \frac{1}{2} \|C_0^{-1/2} u\|^2 + \log Z^y + \frac12\log\det(2\pi C_0)$$

This is exactly the Tikhonov regularisation of the misfit function $\Phi$.

Thus, Tikhonov-regularised misfit minimisation was finding a maximiser of the Bayesian posterior density (at least for Gaussian prior), i.e. a mode of the posterior distribution, or a maximum a posteriori (MAP) point. A mode maximises density relative to the chosen coordinates/reference volume; every individual point still has probability zero in a nondegenerate continuous law. A nonlinear change of coordinates can change the density mode.

When $\dim H = \infty$, we have no uniform reference measure and no PDFs. We have to directly examine the $\mu^y$-probabilities of small balls and seek a MAP point. It turns out that there are many ways to make this mathematically precise, and in infinite dimensions, MAP estimation must be handled with care.

---

<h2 id="gaussian-process-regression-and-kernel-interpolation">Gaussian process regression and kernel interpolation</h2>

Suppose that $u \sim \mathrm{GP}(m,k)$ on a set $X$, and we observe the values

$$y_j = u(z_j) + \eta_j$$

at points $z_1, \ldots, z_J \in X$ with i.i.d. observational errors $\eta_j \sim \mathcal{N}(0,\sigma^2)$.

We are interested in the posterior/conditional process $u \mid y$, where $y \in \mathbb{R}^J$. As it turns out, $u \mid y$ is a Gaussian process with mean function $m^y$ and covariance function $k^y$ given by

$$m^y(z) = m(z) + k(z,\mathbf{z}) (k(\mathbf{z},\mathbf{z}) + \sigma^2 I)^{-1} (y - m(\mathbf{z}))$$

$$k^y(z,z') = k(z,z') - k(z,\mathbf{z}) (k(\mathbf{z},\mathbf{z}) + \sigma^2 I)^{-1} k(\mathbf{z},z')$$

where $\mathbf{z}$ denotes the vector of observation points and $k(\mathbf{z},\mathbf{z})$ is the $J \times J$ Gram matrix.

When $\sigma = 0$ and the observation Gram matrix is invertible, i.e. for nonredundant noiseless data, $u \mid y$ exactly interpolates the observations. In this case, $m^y$ is called the **kernel interpolant** of the data. In the noisy case $\sigma > 0$, we are performing regression.

We can (fairly easily) generalise the above to observations $y = Hu + \eta$ with $H$ being a "nice" linear operator acting on sample paths of $u$ and $\eta$ being Gaussian; e.g. local averages.

We may also be interested not so much in $u \mid y$ itself, but in the image of $u \mid y$ under a nice operator $T$, e.g.

$$Tu = \int_0^1 u(z) \, dz$$

$Tu$ is again Gaussian when $T$ is a well-defined Gaussian linear functional (for this integral, suitable integrability of the mean and covariance suffices). Its mean estimates the integral and its variance quantifies uncertainty under the specified model; it is not automatically a calibrated bound on an arbitrary unknown truth.

<span data-es98a-source="es98a-gp-prediction:start" />

A single observation can affect a whole function. Where should its influence, and the reduction in uncertainty, be strongest?

<Figure id="es98a-gp-prediction" caption="Zero-mean squared-exponential prior k(z,z′)=exp(−(z−z′)²/2), unit marginal variance, one observation y=2 at zero and noise variance 0.25. Dashed curves show only the upper one-standard-deviation boundary, not sample paths or simultaneous confidence bands.">
<div className="sci-story-grid sci-story-two">
<div><svg className="sci-story-svg" viewBox="0 0 340 290" role="img" aria-label="Prior at each location"><title>Prior at each location</title><path d="M45 50V195H310" fill="none" stroke="currentColor" opacity="0.5" /><text x="45" y="25">Prior at each location</text><text x="300" y="230" textAnchor="end">location z</text><text x="45" y="45">latent value</text><text x="45.00" y="210" textAnchor="middle">-3</text><text x="305.00" y="210" textAnchor="middle">3</text><text x="38" y="199.00" textAnchor="end">-0.5</text><text x="38" y="59.00" textAnchor="end">2.5</text><path d="M45.00,171.67 L46.63,171.67 L48.25,171.67 L49.87,171.67 L51.50,171.67 L53.12,171.67 L54.75,171.67 L56.38,171.67 L58.00,171.67 L59.62,171.67 L61.25,171.67 L62.88,171.67 L64.50,171.67 L66.12,171.67 L67.75,171.67 L69.38,171.67 L71.00,171.67 L72.63,171.67 L74.25,171.67 L75.88,171.67 L77.50,171.67 L79.12,171.67 L80.75,171.67 L82.38,171.67 L84.00,171.67 L85.62,171.67 L87.25,171.67 L88.88,171.67 L90.50,171.67 L92.12,171.67 L93.75,171.67 L95.38,171.67 L97.00,171.67 L98.62,171.67 L100.25,171.67 L101.88,171.67 L103.50,171.67 L105.12,171.67 L106.75,171.67 L108.38,171.67 L110.00,171.67 L111.62,171.67 L113.25,171.67 L114.88,171.67 L116.50,171.67 L118.12,171.67 L119.75,171.67 L121.38,171.67 L123.00,171.67 L124.62,171.67 L126.25,171.67 L127.88,171.67 L129.50,171.67 L131.12,171.67 L132.75,171.67 L134.38,171.67 L136.00,171.67 L137.62,171.67 L139.25,171.67 L140.88,171.67 L142.50,171.67 L144.12,171.67 L145.75,171.67 L147.38,171.67 L149.00,171.67 L150.62,171.67 L152.25,171.67 L153.88,171.67 L155.50,171.67 L157.12,171.67 L158.75,171.67 L160.38,171.67 L162.00,171.67 L163.62,171.67 L165.25,171.67 L166.88,171.67 L168.50,171.67 L170.12,171.67 L171.75,171.67 L173.38,171.67 L175.00,171.67 L176.62,171.67 L178.25,171.67 L179.88,171.67 L181.50,171.67 L183.12,171.67 L184.75,171.67 L186.38,171.67 L188.00,171.67 L189.62,171.67 L191.25,171.67 L192.88,171.67 L194.50,171.67 L196.12,171.67 L197.75,171.67 L199.38,171.67 L201.00,171.67 L202.62,171.67 L204.25,171.67 L205.88,171.67 L207.50,171.67 L209.12,171.67 L210.75,171.67 L212.38,171.67 L214.00,171.67 L215.62,171.67 L217.25,171.67 L218.88,171.67 L220.50,171.67 L222.12,171.67 L223.75,171.67 L225.38,171.67 L227.00,171.67 L228.62,171.67 L230.25,171.67 L231.88,171.67 L233.50,171.67 L235.12,171.67 L236.75,171.67 L238.38,171.67 L240.00,171.67 L241.62,171.67 L243.25,171.67 L244.88,171.67 L246.50,171.67 L248.12,171.67 L249.75,171.67 L251.38,171.67 L253.00,171.67 L254.62,171.67 L256.25,171.67 L257.88,171.67 L259.50,171.67 L261.12,171.67 L262.75,171.67 L264.38,171.67 L266.00,171.67 L267.62,171.67 L269.25,171.67 L270.88,171.67 L272.50,171.67 L274.12,171.67 L275.75,171.67 L277.38,171.67 L279.00,171.67 L280.62,171.67 L282.25,171.67 L283.88,171.67 L285.50,171.67 L287.12,171.67 L288.75,171.67 L290.38,171.67 L292.00,171.67 L293.62,171.67 L295.25,171.67 L296.88,171.67 L298.50,171.67 L300.12,171.67 L301.75,171.67 L303.38,171.67 L305.00,171.67" stroke="var(--sci-accent)" strokeWidth="2.5" fill="none" /><text x="45" y="252">solid: mean 0</text><path d="M45.00,125.00 L46.63,125.00 L48.25,125.00 L49.87,125.00 L51.50,125.00 L53.12,125.00 L54.75,125.00 L56.38,125.00 L58.00,125.00 L59.62,125.00 L61.25,125.00 L62.88,125.00 L64.50,125.00 L66.12,125.00 L67.75,125.00 L69.38,125.00 L71.00,125.00 L72.63,125.00 L74.25,125.00 L75.88,125.00 L77.50,125.00 L79.12,125.00 L80.75,125.00 L82.38,125.00 L84.00,125.00 L85.62,125.00 L87.25,125.00 L88.88,125.00 L90.50,125.00 L92.12,125.00 L93.75,125.00 L95.38,125.00 L97.00,125.00 L98.62,125.00 L100.25,125.00 L101.88,125.00 L103.50,125.00 L105.12,125.00 L106.75,125.00 L108.38,125.00 L110.00,125.00 L111.62,125.00 L113.25,125.00 L114.88,125.00 L116.50,125.00 L118.12,125.00 L119.75,125.00 L121.38,125.00 L123.00,125.00 L124.62,125.00 L126.25,125.00 L127.88,125.00 L129.50,125.00 L131.12,125.00 L132.75,125.00 L134.38,125.00 L136.00,125.00 L137.62,125.00 L139.25,125.00 L140.88,125.00 L142.50,125.00 L144.12,125.00 L145.75,125.00 L147.38,125.00 L149.00,125.00 L150.62,125.00 L152.25,125.00 L153.88,125.00 L155.50,125.00 L157.12,125.00 L158.75,125.00 L160.38,125.00 L162.00,125.00 L163.62,125.00 L165.25,125.00 L166.88,125.00 L168.50,125.00 L170.12,125.00 L171.75,125.00 L173.38,125.00 L175.00,125.00 L176.62,125.00 L178.25,125.00 L179.88,125.00 L181.50,125.00 L183.12,125.00 L184.75,125.00 L186.38,125.00 L188.00,125.00 L189.62,125.00 L191.25,125.00 L192.88,125.00 L194.50,125.00 L196.12,125.00 L197.75,125.00 L199.38,125.00 L201.00,125.00 L202.62,125.00 L204.25,125.00 L205.88,125.00 L207.50,125.00 L209.12,125.00 L210.75,125.00 L212.38,125.00 L214.00,125.00 L215.62,125.00 L217.25,125.00 L218.88,125.00 L220.50,125.00 L222.12,125.00 L223.75,125.00 L225.38,125.00 L227.00,125.00 L228.62,125.00 L230.25,125.00 L231.88,125.00 L233.50,125.00 L235.12,125.00 L236.75,125.00 L238.38,125.00 L240.00,125.00 L241.62,125.00 L243.25,125.00 L244.88,125.00 L246.50,125.00 L248.12,125.00 L249.75,125.00 L251.38,125.00 L253.00,125.00 L254.62,125.00 L256.25,125.00 L257.88,125.00 L259.50,125.00 L261.12,125.00 L262.75,125.00 L264.38,125.00 L266.00,125.00 L267.62,125.00 L269.25,125.00 L270.88,125.00 L272.50,125.00 L274.12,125.00 L275.75,125.00 L277.38,125.00 L279.00,125.00 L280.62,125.00 L282.25,125.00 L283.88,125.00 L285.50,125.00 L287.12,125.00 L288.75,125.00 L290.38,125.00 L292.00,125.00 L293.62,125.00 L295.25,125.00 L296.88,125.00 L298.50,125.00 L300.12,125.00 L301.75,125.00 L303.38,125.00 L305.00,125.00" stroke="var(--sci-secondary)" strokeWidth="2.5" fill="none" strokeDasharray="5 4" /><text x="45" y="270">dashed: +1 standard deviation</text></svg></div>
<div><svg className="sci-story-svg" viewBox="0 0 340 290" role="img" aria-label="After y = 2 at z = 0"><title>After y = 2 at z = 0</title><path d="M45 50V195H310" fill="none" stroke="currentColor" opacity="0.5" /><text x="45" y="25">After y = 2 at z = 0</text><text x="300" y="230" textAnchor="end">location z</text><text x="45" y="45">latent value</text><text x="45.00" y="210" textAnchor="middle">-3</text><text x="305.00" y="210" textAnchor="middle">3</text><text x="38" y="199.00" textAnchor="end">-0.5</text><text x="38" y="59.00" textAnchor="end">2.5</text><path d="M45.00,170.84 L46.63,170.74 L48.25,170.63 L49.87,170.51 L51.50,170.38 L53.12,170.24 L54.75,170.08 L56.38,169.91 L58.00,169.72 L59.62,169.51 L61.25,169.29 L62.88,169.04 L64.50,168.78 L66.12,168.49 L67.75,168.18 L69.38,167.84 L71.00,167.48 L72.63,167.08 L74.25,166.66 L75.88,166.21 L77.50,165.73 L79.12,165.21 L80.75,164.65 L82.38,164.06 L84.00,163.43 L85.62,162.77 L87.25,162.06 L88.88,161.31 L90.50,160.51 L92.12,159.68 L93.75,158.79 L95.38,157.86 L97.00,156.89 L98.62,155.87 L100.25,154.80 L101.88,153.69 L103.50,152.53 L105.12,151.32 L106.75,150.07 L108.38,148.77 L110.00,147.43 L111.62,146.04 L113.25,144.62 L114.88,143.15 L116.50,141.65 L118.12,140.11 L119.75,138.54 L121.38,136.95 L123.00,135.32 L124.62,133.68 L126.25,132.01 L127.88,130.33 L129.50,128.64 L131.12,126.95 L132.75,125.25 L134.38,123.55 L136.00,121.87 L137.62,120.19 L139.25,118.54 L140.88,116.91 L142.50,115.31 L144.12,113.74 L145.75,112.21 L147.38,110.73 L149.00,109.30 L150.62,107.93 L152.25,106.61 L153.88,105.37 L155.50,104.19 L157.12,103.09 L158.75,102.07 L160.38,101.13 L162.00,100.29 L163.62,99.53 L165.25,98.87 L166.88,98.30 L168.50,97.84 L170.12,97.47 L171.75,97.21 L173.38,97.05 L175.00,97.00 L176.62,97.05 L178.25,97.21 L179.88,97.47 L181.50,97.84 L183.12,98.30 L184.75,98.87 L186.38,99.53 L188.00,100.29 L189.62,101.13 L191.25,102.07 L192.88,103.09 L194.50,104.19 L196.12,105.37 L197.75,106.61 L199.38,107.93 L201.00,109.30 L202.62,110.73 L204.25,112.21 L205.88,113.74 L207.50,115.31 L209.12,116.91 L210.75,118.54 L212.38,120.19 L214.00,121.87 L215.62,123.55 L217.25,125.25 L218.88,126.95 L220.50,128.64 L222.12,130.33 L223.75,132.01 L225.38,133.68 L227.00,135.32 L228.62,136.95 L230.25,138.54 L231.88,140.11 L233.50,141.65 L235.12,143.15 L236.75,144.62 L238.38,146.04 L240.00,147.43 L241.62,148.77 L243.25,150.07 L244.88,151.32 L246.50,152.53 L248.12,153.69 L249.75,154.80 L251.38,155.87 L253.00,156.89 L254.62,157.86 L256.25,158.79 L257.88,159.68 L259.50,160.51 L261.12,161.31 L262.75,162.06 L264.38,162.77 L266.00,163.43 L267.62,164.06 L269.25,164.65 L270.88,165.21 L272.50,165.73 L274.12,166.21 L275.75,166.66 L277.38,167.08 L279.00,167.48 L280.62,167.84 L282.25,168.18 L283.88,168.49 L285.50,168.78 L287.12,169.04 L288.75,169.29 L290.38,169.51 L292.00,169.72 L293.62,169.91 L295.25,170.08 L296.88,170.24 L298.50,170.38 L300.12,170.51 L301.75,170.63 L303.38,170.74 L305.00,170.84" stroke="var(--sci-accent)" strokeWidth="2.5" fill="none" /><text x="45" y="252">solid: posterior mean</text><path d="M45.00,124.17 L46.63,124.08 L48.25,123.97 L49.87,123.85 L51.50,123.72 L53.12,123.58 L54.75,123.42 L56.38,123.25 L58.00,123.06 L59.62,122.86 L61.25,122.64 L62.88,122.40 L64.50,122.14 L66.12,121.85 L67.75,121.55 L69.38,121.22 L71.00,120.87 L72.63,120.49 L74.25,120.08 L75.88,119.64 L77.50,119.18 L79.12,118.68 L80.75,118.15 L82.38,117.59 L84.00,117.00 L85.62,116.37 L87.25,115.70 L88.88,115.00 L90.50,114.26 L92.12,113.49 L93.75,112.68 L95.38,111.84 L97.00,110.96 L98.62,110.05 L100.25,109.10 L101.88,108.12 L103.50,107.10 L105.12,106.06 L106.75,104.99 L108.38,103.89 L110.00,102.77 L111.62,101.63 L113.25,100.47 L114.88,99.29 L116.50,98.10 L118.12,96.91 L119.75,95.71 L121.38,94.51 L123.00,93.31 L124.62,92.12 L126.25,90.95 L127.88,89.79 L129.50,88.65 L131.12,87.54 L132.75,86.46 L134.38,85.42 L136.00,84.41 L137.62,83.45 L139.25,82.54 L140.88,81.68 L142.50,80.88 L144.12,80.14 L145.75,79.45 L147.38,78.83 L149.00,78.28 L150.62,77.79 L152.25,77.37 L153.88,77.01 L155.50,76.71 L157.12,76.48 L158.75,76.30 L160.38,76.17 L162.00,76.09 L163.62,76.04 L165.25,76.03 L166.88,76.04 L168.50,76.06 L170.12,76.08 L171.75,76.11 L173.38,76.12 L175.00,76.13 L176.62,76.12 L178.25,76.11 L179.88,76.08 L181.50,76.06 L183.12,76.04 L184.75,76.03 L186.38,76.04 L188.00,76.09 L189.62,76.17 L191.25,76.30 L192.88,76.48 L194.50,76.71 L196.12,77.01 L197.75,77.37 L199.38,77.79 L201.00,78.28 L202.62,78.83 L204.25,79.45 L205.88,80.14 L207.50,80.88 L209.12,81.68 L210.75,82.54 L212.38,83.45 L214.00,84.41 L215.62,85.42 L217.25,86.46 L218.88,87.54 L220.50,88.65 L222.12,89.79 L223.75,90.95 L225.38,92.12 L227.00,93.31 L228.62,94.51 L230.25,95.71 L231.88,96.91 L233.50,98.10 L235.12,99.29 L236.75,100.47 L238.38,101.63 L240.00,102.77 L241.62,103.89 L243.25,104.99 L244.88,106.06 L246.50,107.10 L248.12,108.12 L249.75,109.10 L251.38,110.05 L253.00,110.96 L254.62,111.84 L256.25,112.68 L257.88,113.49 L259.50,114.26 L261.12,115.00 L262.75,115.70 L264.38,116.37 L266.00,117.00 L267.62,117.59 L269.25,118.15 L270.88,118.68 L272.50,119.18 L274.12,119.64 L275.75,120.08 L277.38,120.49 L279.00,120.87 L280.62,121.22 L282.25,121.55 L283.88,121.85 L285.50,122.14 L287.12,122.40 L288.75,122.64 L290.38,122.86 L292.00,123.06 L293.62,123.25 L295.25,123.42 L296.88,123.58 L298.50,123.72 L300.12,123.85 L301.75,123.97 L303.38,124.08 L305.00,124.17" stroke="var(--sci-secondary)" strokeWidth="2.5" fill="none" strokeDasharray="5 4" /><text x="45" y="270">dashed: mean + std. deviation</text></svg></div>
</div>
</Figure>

At the sensor the posterior mean is 1.6 and variance 0.2. Far away, covariance with the sensor tends to zero, restoring the prior mean and variance. The observation changes the mean through correlation and leaves residual uncertainty because its noise is nonzero.

<span data-es98a-source="es98a-gp-prediction:end" />

Condition on three observations in sequence. Within a stage, the next observation gradually gains precision, so the transition is itself a valid Gaussian update. Compare the posterior band with the covariance that remains between locations.

<ES98AAnimation kind="gp-conditioning" />

<h3 id="derive-the-prediction-from-the-same-conditioning-theorem">Derive the prediction from the same conditioning theorem</h3>

At any test location $z$, the joint vector $(u(z),y)$ is Gaussian with cross covariance $k(z,\mathbf z)$ and data covariance $K+\sigma^2I$. Substitute those blocks into [Week 3's theorem](/notes/es98a/week3#conditioning-theorem). For several test locations, do the same jointly: this establishes a posterior process, not merely separate marginal predictions.

For noiseless data, the row $k(z_i,\mathbf z)$ is row $i$ of $K$, so $m^y(z_i)=y_i$ and $k^y(z_i,z_i)=0$. For noisy data, the latent posterior variance stays nonnegative. Predicting a **new noisy measurement** adds $\sigma^2$ to that latent variance.

For $Tu=\int_0^1u(z)\,dz$, define $b_j=\int_0^1 k(z,z_j)\,dz$ and $v=\int_0^1\int_0^1k(z,z')\,dz\,dz'$. Then

$$
\mathbb E[Tu\mid y]=\int_0^1m(z)\,dz+b^T(K+\sigma^2I)^{-1}(y-m(\mathbf z)),
$$

$$
\operatorname{Var}(Tu\mid y)=v-b^T(K+\sigma^2I)^{-1}b.
$$

The same projection that corrected a material stiffness now corrects an integral, and the residual covariance reports what the observations leave unresolved.

<h3 id="course-synthesis-and-exercises">Course synthesis and exercises</h3>

1. Show the Hellinger expectation bound by writing $p-q=(\sqrt p-\sqrt q)(\sqrt p+\sqrt q)$ and applying Cauchy–Schwarz.
2. For prior $u\sim\mathcal N(0,1)$ and observation $y=u+\eta$, $\eta\sim\mathcal N(0,\sigma^2)$ independent, compute the posterior mean, variance and MAP. What happens as $\sigma\to0$?
3. Explain why the GP mean can belong to the kernel RKHS even though typical prior draws do not.

The course has kept one question in view: what can imperfect measurements justify? Orthogonal coordinates separate information; compactness exposes its loss; probability describes uncertainty; regularisation and conditioning control how evidence changes a prediction. Computation must still respect the assumptions of the model and the convergence of its approximations.
