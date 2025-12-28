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

In a BIP with prior $u \sim \mu_0$ on $H$, finite-dimensional data in $Y$ with PDF $\rho_{y \mid u}(y) \propto \exp(-\Phi(u;y))$, the solution is the posterior distribution $\mu^y = \mu_{u \mid y=y}$ satisfying Bayes’ formula $$\mu^y(du) ;=; \frac{\exp!\big(-\Phi(u;y)\big)}{Z^y},\mu_0(du), \qquad Z^y ;=; \int_H \exp!\big(-\Phi(u;y)\big),\mu_0(du).$$

In the special case $\Phi(u;y)=\frac12|\Gamma^{-1/2}(Au-y)|_2^2$, $\mu_0=\mathcal N(m_0,C_0)$, the posterior is again Gaussian, $\mu^y=\mathcal N(m^y,C^y)$ (Kalman update).

---

### Natural questions

1. Beyond the linear Gaussian case, how will we practically realise and access $\mu^y$? Here we eventually use all the standard tools of numerical integration to approximate posterior expectations of quantities of interest $f:H\to\mathbb R$: $$\mathbb E[f(u)\mid y=y] ;=; \int_H f(u),\mu^y(du) ;=; \int_H f(u),\frac{\exp(-\Phi(u;y))}{Z^y},\mu_0(du).$$
   **NB:** unless we can think of anything better, MH-MCMC is well suited to this situation, since MH-MCMC can be implemented without knowing the normalising constant $Z^y$, because it cancels out in the acceptance probability calculation.

2. Does the Bayesian approach alleviate the ill-posedness of the inverse problem? The posterior $\mu^y$ is well defined, but is it a stable function of the data $y$? Is $\mu^y$ a stable function of $\Phi$ and $\mu_0$ too?

3. How are the Bayesian and optimisation viewpoints connected?

---

## Well-posedness of BIPs

To make quantitative statements about the stability of $\mu^y$ as a function of $y$, we need a distance function on the set $\mathcal P(H)$ of probability measures on $H$. There are many good ones, e.g. total variation distance, the Kullback–Leibler / relative entropy divergence, but we’ll use the **Hellinger distance**.

Suppose we have $\mu_1,\mu_2\in\mathcal P(H)$ and that both have densities with respect to $\nu$. The Hellinger distance between $\mu_1$ and $\mu_2$ is $$d_H(\mu_1,\mu_2)^2 ;:=; \frac12\int_H\left|\sqrt{\frac{d\mu_1}{d\nu}}-\sqrt{\frac{d\mu_2}{d\nu}}\right|^2,d\nu ;=; \frac12\left|\sqrt{f_1}-\sqrt{f_2}\right|*{L^2(\nu)}^2,$$ and also $$d_H(\mu_1,\mu_2)^2 ;=; 1-\int_H\sqrt{\frac{d\mu_1}{d\nu}\frac{d\mu_2}{d\nu}},d\nu ;=; 1-\mathbb E*{\mu_2}!\left[\sqrt{\frac{d\mu_1}{d\mu_2}}\right].$$

**NB:** $0\le d_H(\mu_1,\mu_2)\le 1$ for all $\mu_1,\mu_2\in\mathcal P(H)$.

One nice feature of $d_H$ is that it controls expected values of quantities of interest.

**Lemma.** Let $\mu_1,\mu_2\in\mathcal P(H)$. Then, for any $f:H\to\mathbb R$ with $f\in L^2(H,\mu_1)\cap L^2(H,\mu_2)$, $$\left|\mathbb E_{\mu_1}[f]-\mathbb E_{\mu_2}[f]\right| ;\le; 2\sqrt{\mathbb E_{\mu_1}[f^2]+\mathbb E_{\mu_2}[f^2]}; d_H(\mu_1,\mu_2).$$
(The proof is basically just an application of the triangle inequality and the Cauchy–Schwarz inequality.)

**Example (finite-dim case = exercise).** The Hellinger distance between Gaussians $\mu_0=\mathcal N(m_0,C_0)$ and $\mu_1=\mathcal N(m_1,C_1)$ is $$d_H(\mu_0,\mu_1)^2 ;=; 1-\frac{\det(C_0)^{1/4}\det(C_1)^{1/4}}{\det(C_{1/2})^{1/2}}\exp!\left(-\frac18\left|C_{1/2}^{-1/2}(m_0-m_1)\right|^2\right),$$ where $$C_{1/2};:=;\frac12(C_0+C_1).$$
**(Red note)** This formula hints at a problem for $\dim H=\infty$: even if $m_0-m_1$ is small, it may lie outside $\operatorname{ran}(C_{1/2}^{1/2})$, so the only sensible value for $|C_{1/2}^{-1/2}(m_0-m_1)|$ is $\infty$, so $d_H(\mu_0,\mu_1)=1$ no matter how small $m_0-m_1$ is. 

The posterior turns out to be stable in the Hellinger sense.

**Lemma.** Let $\mu_1,\mu_2\in\mathcal P(H)$ be of the form $$\mu_i(du);=;\frac{1}{Z_i}\exp!\big(-\Phi_i(u)\big),\nu(du),\qquad Z_i:=\int_H \exp!\big(-\Phi_i(u)\big),\nu(du),$$ where $\Phi_1,\Phi_2\in L^2(\nu)$ are non-negative. Then $$|Z_2-Z_1|;\le;|\Phi_1-\Phi_2|*{L^2(\nu)},$$ and $$d_H(\mu_1,\mu_2);\le;\frac{1}{\sqrt2,\min(Z_1,Z_2)};|\Phi_1-\Phi_2|*{L^2(\nu)}.$$

Two related warnings:

1. Since $d_H(\mu_1,\mu_2)\le 1$ under all circumstances, the inequality could be “true but useless” if the RHS is large.
2. When $\Phi_i$ grows rapidly (e.g. it is a misfit function for very precisely observed data), $Z_i$ will be very small, and we end up in the situation of warning 1.

---

### Applying the lemma to a specific BIP

* $H$ will be a Hilbert space, possibly $\infty$-dimensional.
* We observe data in $Y=\mathbb R^J$ for $J\in\mathbb N$.
* Specifically we observe $$y^J ;=; G(u)+\eta.$$
* The forward operator $G:H\to Y$ is known, deterministic, and stable in the sense of Lipschitz continuity: $$|G(u)-G(u')|_Y ;\le; L|u-u'|_H.$$
* The observational noise $\eta$ is independent of $u$ and is Gaussian, $\eta\sim \mathcal N(0,\Gamma)$ in $Y=\mathbb R^J$ with $\Gamma\in\mathbb R^{J\times J}$ SPD.
* Hence the potential / negative log-likelihood is the quadratic misfit $$\Phi(u;y);:=;-\log \rho_{y\mid u}(y);=;\frac12\left|\Gamma^{-1/2}\big(y-G(u)\big)\right|^2.$$
* The prior $\mu_0$ on $u$ is not required to be Gaussian.
* To ensure that all the integrals we need are finite, we need that $G\in L^4(\mu_0)$, i.e. $$\int_H |G(u)|_Y^4,\mu_0(du);<;\infty.$$
* The BIP solution is $\mu^y$ given by $$\mu^y(du);=;\frac{1}{Z^y}\exp!\big(-\Phi(u;y)\big),\mu_0(du),\qquad Z^y:=\int_H\exp!\big(-\Phi(u;y)\big),\mu_0(du).$$

Applying the second lemma above to this setup yields:

**Theorem.** $\mu^y$ is a locally Lipschitz continuous function of $y$. That is, for each $R>0$, there exists $K=K(R,\Gamma,\mu_0,L)$ s.t. for all $y,y'\in Y$ with $|y|,|y'|\le R$, $$|Z^y-Z^{y'}|;\le;K|y-y'|,\qquad d_H(\mu^y,\mu^{y'});\le;K|y-y'|.$$

**(Red note)** But remember that $K$ and the RHS can easily be large when the noise covariance $\Gamma$ is small! Similar results can be proved for stability with changes in $G$, the noise model, the prior $\mu_0$, … but these are local results with large constants when the data are precisely observed.

---

## Maximum a posteriori (MAP) estimation

To build intuition, consider a BIP on $H=\mathbb R^N$, where the prior $\mu_0$ has a PDF $\rho_0:\mathbb R^N\to\mathbb R_{\ge 0}$. The posterior $\mu^y$ also has a PDF $\rho^y$, $$\rho^y(u);=;\frac{\exp(-\Phi(u;y))}{Z^y},\rho_0(u).$$

Take negative logarithms: $$-\log \rho^y(u);=;\Phi(u;y)-\log \rho_0(u)+\log Z^y.$$

Let’s further specialise to the case of a centred Gaussian prior, $\mu_0=\mathcal N(0,C_0)$: $$-\log \rho^y(u);=;\Phi(u;y)+\frac12|C_0^{-1/2}u|^2+\log Z^y.$$
(**Blue note**) This is the Tikhonov regularisation of the misfit function $\Phi$.

Thus, Tikhonov-regularised misfit minimisation was finding a maximiser of the Bayesian posterior density (at least for Gaussian prior), i.e. a mode of the posterior distribution, or a maximum a posteriori (MAP) point. In some sense, these are “most likely points” under $\mu^y$.

When $\dim H=\infty$, we have no uniform reference measure and PDFs $\rho_0$ or $\rho^y$. We have to directly examine the $\mu^y$-probabilities of small balls $$B_r(u):={v\in H\mid |u-v|_H<r},$$ and seek a MAP point $u$ that maximises $\mu^y(B_r(u))$ in the limit as $r\to 0$. It turns out that there are many ways to make this mathematically precise, and in $\infty$-dim, MAP estimation must be handled with care; in the case of Gaussian $\mu_0$ and smooth $\Phi$ we are where everything works out OK, and most likely points really are Tikhonov-regularised misfit minimisers.

---

## Gaussian process regression and kernel interpolation

Suppose that $u\sim GP(m,k)$ on a set $X$, and we observe the values $$y_j ;=; u(z_j)+\eta_j$$ at points $z_1,\dots,z_J\in X$ with i.i.d. observational errors $\eta_j\sim \mathcal N(0,\sigma^2)$.

We are interested in the posterior/conditional process $u\mid y=y$, $y\in\mathbb R^J$. As it turns out, $u\mid y=y$ is a Gaussian process with mean function $m^y$ and covariance function $k^y$ given by $$m^y(z);=;m(z)+k(z,z)\big(k(z,z)+\sigma^2 I\big)^{-1}\big(y-m(z)\big),\qquad k^y(z,z');=;k(z,z')+k(z,z)\big(k(z,z)+\sigma^2 I\big)^{-1}k(z,z').$$

where $$y^J:=\begin{pmatrix}y_1\ \vdots\ y_J\end{pmatrix},\qquad m(z):=\begin{pmatrix}m(z_1)\ \vdots\ m(z_J)\end{pmatrix},$$ $$k(z,z):=\big(k(z,z_1)\ \cdots\ k(z,z_J)\big);=;k(z_1,z)^T,\qquad k(z,z):=\begin{pmatrix}k(z_1,z_1)&\cdots&k(z_1,z_J)\ \vdots&\ddots&\vdots\ k(z_J,z_1)&\cdots&k(z_J,z_J)\end{pmatrix}.$$

When $\sigma=0$, i.e. when the data are noiseless, $u\mid y=y$ exactly interpolates the observations, i.e. $$m^y(z_j)=y_j=u(z_j)\ \text{for}\ j=1,\dots,J,\qquad k^y(z_j,z_{j'})=0.$$

In this case, $m^y$ is called the **kernel interpolant** of the data. In the noisy case $\sigma>0$, we are performing regression.

We can (fairly easily) generalise the above to observations $y = Hu + \eta$ with $H$ being a “nice” linear operator acting on sample paths of $u$ and $\eta$ being Gaussian; e.g. local averages.

We may also be interested not so much in $u\mid y=y$ itself, but in the image of $u\mid y=y$ under a nice operator $T$, e.g. $X=[0,1]$, $$Tu=\int_0^1 u(z),dz.$$
$T$ again Gaussian! Its mean is an estimate for $\int_0^1 u(z),dz$ and covariance is an error indicator.

