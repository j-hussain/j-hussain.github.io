---
layout: page
title: "Week 10: Gaussian processes + well-posed Bayesian inversion in high/infinite dimensions"
---

## Week 10

* Handout: GP regression
* Well-posedness of Bayesian inverse problems
* MAP estimation as the connection between BIPs and regularised optimisation
* Lab: Robust MCMC for high-dimensional BIPs

---

### Recap

In a BIP with prior $u \sim \mu_0$ on $H$, finite-dimensional data in $Y$ with PDF proportional to $\exp(-\Phi(u;y))$, the solution is the posterior distribution $\mu^y$ satisfying Bayes' formula

$$\mu^y(du) = \frac{\exp(-\Phi(u;y))}{Z^y} \mu_0(du)$$

where

$$Z^y = \int_H \exp(-\Phi(u;y)) \, \mu_0(du)$$

In the special case where $\Phi(u;y) = \frac{1}{2}\|\Gamma^{-1/2}(Au-y)\|_2^2$ and $\mu_0 = \mathcal{N}(m_0,C_0)$, the posterior is again Gaussian: $\mu^y = \mathcal{N}(m^y,C^y)$ (Kalman update).

---

### Natural questions

1. Beyond the linear Gaussian case, how will we practically realise and access $\mu^y$? Here we eventually use all the standard tools of numerical integration to approximate posterior expectations of quantities of interest.

   **NB:** MH-MCMC is well suited to this situation, since it can be implemented without knowing the normalising constant $Z^y$, because it cancels out in the acceptance probability calculation.

2. Does the Bayesian approach alleviate the ill-posedness of the inverse problem? The posterior $\mu^y$ is well defined, but is it a stable function of the data $y$?

3. How are the Bayesian and optimisation viewpoints connected?

---

## Well-posedness of BIPs

To make quantitative statements about the stability of $\mu^y$ as a function of $y$, we need a distance function on the set of probability measures on $H$. There are many good ones, e.g. total variation distance, the Kullback–Leibler divergence, but we'll use the **Hellinger distance**.

Suppose we have $\mu_1, \mu_2$ that both have densities with respect to $\nu$. The Hellinger distance between them is

$$d_H(\mu_1,\mu_2)^2 = \frac{1}{2} \int_H \left| \sqrt{\frac{d\mu_1}{d\nu}} - \sqrt{\frac{d\mu_2}{d\nu}} \right|^2 d\nu$$

**NB:** We always have $0 \le d_H(\mu_1,\mu_2) \le 1$.

One nice feature of $d_H$ is that it controls expected values of quantities of interest.

**Lemma.** For any $f \in L^2(H,\mu_1) \cap L^2(H,\mu_2)$,

$$\left| \mathbb{E}_{\mu_1}[f] - \mathbb{E}_{\mu_2}[f] \right| \le 2\sqrt{\mathbb{E}_{\mu_1}[f^2] + \mathbb{E}_{\mu_2}[f^2]} \cdot d_H(\mu_1,\mu_2)$$

(The proof is basically just an application of the triangle inequality and the Cauchy–Schwarz inequality.)

**Example (finite-dim case).** The Hellinger distance between Gaussians $\mu_0 = \mathcal{N}(m_0,C_0)$ and $\mu_1 = \mathcal{N}(m_1,C_1)$ involves a formula that hints at a problem for infinite dimensions: even if $m_0 - m_1$ is small, it may lie outside certain ranges, making $d_H(\mu_0,\mu_1) = 1$ no matter how small the mean difference is.

The posterior turns out to be stable in the Hellinger sense.

**Lemma.** Let $\mu_1, \mu_2$ be of the form

$$\mu_i(du) = \frac{1}{Z_i} \exp(-\Phi_i(u)) \, \nu(du)$$

where $\Phi_1, \Phi_2$ are non-negative. Then

$$d_H(\mu_1,\mu_2) \le \frac{1}{\sqrt{2} \min(Z_1,Z_2)} \|\Phi_1 - \Phi_2\|_{L^2(\nu)}$$

Two related warnings:

1. Since $d_H(\mu_1,\mu_2) \le 1$ under all circumstances, the inequality could be "true but useless" if the RHS is large.
2. When $\Phi_i$ grows rapidly (e.g. it is a misfit function for very precisely observed data), $Z_i$ will be very small, and we end up in the situation of warning 1.

---

### Applying the lemma to a specific BIP

* $H$ will be a Hilbert space, possibly infinite-dimensional.
* We observe data in $Y = \mathbb{R}^J$ for $J \in \mathbb{N}$.
* Specifically we observe $y = G(u) + \eta$.
* The forward operator $G: H \to Y$ is known, deterministic, and stable (Lipschitz continuous).
* The observational noise $\eta$ is independent of $u$ and is Gaussian: $\eta \sim \mathcal{N}(0,\Gamma)$ with $\Gamma$ SPD.
* Hence the potential is the quadratic misfit

$$\Phi(u;y) = \frac{1}{2} \|\Gamma^{-1/2}(y - G(u))\|^2$$

* The prior $\mu_0$ on $u$ is not required to be Gaussian.

**Theorem.** The posterior $\mu^y$ is a locally Lipschitz continuous function of $y$. That is, for each $R > 0$, there exists $K$ such that for all $y, y'$ with bounded norm,

$$d_H(\mu^y, \mu^{y'}) \le K \|y - y'\|$$

But remember that $K$ can easily be large when the noise covariance $\Gamma$ is small!

---

## Maximum a posteriori (MAP) estimation

To build intuition, consider a BIP on $H = \mathbb{R}^N$, where the prior $\mu_0$ has a PDF $\rho_0$. The posterior $\mu^y$ also has a PDF $\rho^y$:

$$\rho^y(u) = \frac{\exp(-\Phi(u;y))}{Z^y} \rho_0(u)$$

Take negative logarithms:

$$-\log \rho^y(u) = \Phi(u;y) - \log \rho_0(u) + \log Z^y$$

Let's further specialise to the case of a centred Gaussian prior, $\mu_0 = \mathcal{N}(0,C_0)$:

$$-\log \rho^y(u) = \Phi(u;y) + \frac{1}{2} \|C_0^{-1/2} u\|^2 + \log Z^y$$

This is exactly the Tikhonov regularisation of the misfit function $\Phi$.

Thus, Tikhonov-regularised misfit minimisation was finding a maximiser of the Bayesian posterior density (at least for Gaussian prior), i.e. a mode of the posterior distribution, or a maximum a posteriori (MAP) point. In some sense, these are "most likely points" under $\mu^y$.

When $\dim H = \infty$, we have no uniform reference measure and no PDFs. We have to directly examine the $\mu^y$-probabilities of small balls and seek a MAP point. It turns out that there are many ways to make this mathematically precise, and in infinite dimensions, MAP estimation must be handled with care.

---

## Gaussian process regression and kernel interpolation

Suppose that $u \sim \mathrm{GP}(m,k)$ on a set $X$, and we observe the values

$$y_j = u(z_j) + \eta_j$$

at points $z_1, \ldots, z_J \in X$ with i.i.d. observational errors $\eta_j \sim \mathcal{N}(0,\sigma^2)$.

We are interested in the posterior/conditional process $u \mid y$, where $y \in \mathbb{R}^J$. As it turns out, $u \mid y$ is a Gaussian process with mean function $m^y$ and covariance function $k^y$ given by

$$m^y(z) = m(z) + k(z,\mathbf{z}) (k(\mathbf{z},\mathbf{z}) + \sigma^2 I)^{-1} (y - m(\mathbf{z}))$$

$$k^y(z,z') = k(z,z') - k(z,\mathbf{z}) (k(\mathbf{z},\mathbf{z}) + \sigma^2 I)^{-1} k(\mathbf{z},z')$$

where $\mathbf{z}$ denotes the vector of observation points and $k(\mathbf{z},\mathbf{z})$ is the $J \times J$ Gram matrix.

When $\sigma = 0$, i.e. when the data are noiseless, $u \mid y$ exactly interpolates the observations. In this case, $m^y$ is called the **kernel interpolant** of the data. In the noisy case $\sigma > 0$, we are performing regression.

We can (fairly easily) generalise the above to observations $y = Hu + \eta$ with $H$ being a "nice" linear operator acting on sample paths of $u$ and $\eta$ being Gaussian; e.g. local averages.

We may also be interested not so much in $u \mid y$ itself, but in the image of $u \mid y$ under a nice operator $T$, e.g.

$$Tu = \int_0^1 u(z) \, dz$$

$Tu$ is again Gaussian! Its mean is an estimate for the integral and its covariance is an error indicator.
