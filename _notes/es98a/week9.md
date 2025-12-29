---
layout: page
title: "Week 9: Regularisation deep dive + Bayesian inverse problems (linear Gaussian case)"
---


## Week 9

* Heuristics for choice of regularisation parameter
* $\ell^1$ regularisation as a sparsity-promoting regularisation
* Total variation regularisation for edge-preserving image reconstruction — a cautionary tale
* The Bayesian approach to inverse problems

---

## Ways to set the regularisation param. $\alpha$

We already discussed the situation of **a priori** regularisation: we set $\alpha$ to be a function of the noise level $\delta$ but **not** of the observed data $y$. If one also has a source condition for the signal $u$, then one can prove upper bounds for the reconstruction error $|g_\alpha(A)y-u|_{H_1}$ — as in the extra handout from last week.

An **a posteriori** choice of $\alpha$ allows it to be a function of both $\delta$ and $y$. The danger is that we may overfit to the specific instance of $y$ that we have seen; the optimal reconstruction $u_\alpha=u_\alpha(\delta,y)$ may do well for $y$ but poorly for other $y'$. In this situation, we typically start with a large $\alpha$ and then reduce it until $|Au_\alpha-y|_{H_2}\approx\delta$ on the grounds that $Au-y=\eta\approx\delta$. This is Morozov's discrepancy principle.

Finally, heuristic strategies allow $\alpha$ to depend only on $y$ (not on $\delta$). Here it can be shown that a heuristic choice of $\alpha$ s.t. $u_\alpha\to u$ as $\alpha\to 0$ must have $\mathrm{ran}(A)$ being closed, which is the "boring" case that $A^\dagger$ is bounded and $A$ has finite rank. (This is Bakushinskii's veto.) A straightforward heuristic strategy to use when we have access to many instances of $y$ is to split the data set into a training set and a validation set. The reason that $\alpha$ will be "about right" if the errors on the training and validation sets are similar.

---

## Back to $\ell^1$ regularisation and sparsity

We're comparing the minimisers of

* $\frac{1}{2}|Au-y|^2+\frac{\alpha}{2}|u|^2$ (i.e. $\sum_n |u_n|^2$)

with minimisers of

* $\frac{1}{2}|Au-y|^2+\alpha|u|_1$ (i.e. $\sum_n |u_n|$).

Let's consider $u\in\mathbb{R}^N$, $N$ finite, and try to understand why minimisers of the second ($\ell^1$) problem are sparse, with most $u_n=0$, whereas minimisers of the first ($\ell^2$/ridge regression/Tikhonov) problem have no special structure.

First observe that the balls of the $\ell^2$ and $\ell^1$ norms have different shapes:

![diagram-1](image.png)

This matters because minimising the regularised misfit is the same thing as finding the "closest" point of some level set of the misfit to the origin, where "closest" is measured according to the $\ell^2$ or $\ell^1$ norm as appropriate.

![diagram-2](image-1.png)

Most possible locations for $A^\dagger y$ have, along each green contour, the closest point of that contour to the origin being on the coordinate axes i.e. being sparse.

To what extent is this heuristic rigorously true when $H_1$ is genuinely infinite-dimensional and not $\mathbb{R}^N$ for some finite $N$? A related question is whether we can do similar tricks for edge-detection, by imposing a penalty like the $\ell^1$ norm on the derivative of $u$.

---

## TV regularisation and edge-preserving image reconstruction

Let's consider a 1-dimensional "image" / time series as a function $u:[a,b]\to\mathbb{R}$. If $u$ is differentiable, then we define its total variation by

$$|u|_{\mathrm{TV}}:=\int_a^b |u'(t)|\,dt.$$

**Just a seminorm** because $|u|_{\mathrm{TV}}=0$ for any constant $u$.

We can extend this definition to non-differentiable $u$ either by considering a distributional derivative $u'$ or simply by setting

$$|u|_{\mathrm{TV}}:=\sup\left\{\sum_{i=1}^N |u(t_i)-u(t_{i-1})|\;\middle|\; a=t_0<t_1<\cdots<t_N=b,\; N\in\mathbb{N}\right\}.$$

The TV seminorm is clearly a good candidate for a regularisation that, like the $\ell^1$ norm of a vector, will sparsify $u'$, i.e. give the minimiser $u_\alpha$ of

$$\frac{1}{2}|Au-y|_{H_2}^2+\alpha|u|_{\mathrm{TV}} =: \Phi_\alpha(u;y)$$

a few well-localised jumps/edges.

In principle, we minimise $\Phi_\alpha(\cdot;y)$ over the space $\mathcal{U}$ of all $u$ with finite total variation. In computational practice, we select a finite-dimensional subspace $\mathcal{U}_N\subset\mathcal{U}$ (e.g. the space of $N$-pixel images on a given grid) and we minimise $\Phi_\alpha(\cdot;y)$ over $u\in \mathcal{U}_N$. We should also open up the possibility that the regularisation parameter $\alpha$ depends on $N$, and that $N$ will be increased, possibly very large.

Lemna & Siltanen (2005) showed that there is **no** choice of $\alpha(N)$ such that $\lim_{N\to\infty} u_{\alpha(N)}$ exists and is useful — you always end up with some bad feature, e.g. smooth (non-edge) limiting reconstructions), the limit being $0$ regardless of $y$; the posterior mean

$$\int u \exp(-\Phi_\alpha(u;y))\,du$$

fails to exist…

This fundamental mathematical obstacle stimulated the study of (optimisation-based and Bayesian) inverse problems on function spaces $\mathcal{U}$ directly, not just each $\mathcal{U}_N$ individually.

---

## The Bayesian approach to inverse problems

The challenge is the same as always: we want to recover an unknown $u$ from data $y$. The Bayesian worldview is:

1. Treat the unknown and the data as random variables: $u$ (with values in $\mathcal{U}$) and $y$ (with values in $\mathcal{Y}$).

2. The beliefs you have about the unknown before seeing the data are encoded in the prior distribution $\mu_0$ or $\mu_u$ of $u$ on $\mathcal{U}$.

3. The (ideal) relationship between the unknown and the data is encoded in the likelihood model: for each possible value $u\in\mathcal{U}$ that $u$ might take, we have a conditional probability distribution $\mu_{y|u=u}$ on $\mathcal{Y}$ for how we think $y$ would look if $u$ really were $u$.

4. The prior and the likelihood together determine the joint distribution $\mu_{(u,y)}$ of $(u,y)$ on $\mathcal{U}\times\mathcal{Y}$ via

$$\mu_{(u,y)}(A\times B) = \int_A \int_B \mu_{y|u=u}(dy)\,\mu_u(du),$$

(and $\mu_{y|u=u}(B)$).

5. The Bayesian solution to the inverse problem is the conditional distribution $\mu_{u|y=y}$ on $\mathcal{U}$, i.e. the "restriction" of the joint law $\mu_{(u,y)}$ to the "slice" at $y$. Bayesians call this the posterior distribution.

**NB** The posterior dist'n $\mu_{u|y=y}$ is defined to be the result of conditioning the joint dist'n $\mu_{(u,y)}$ onto the slice "$y=y$"; it is a "happy accident" that we can sometimes realise $\mu_{u|y=y}$ by reweighting the prior $\mu_u$, as Bayes' rule claims.

---

## Linear Gaussian Bayesian inverse problems

Take $\mathcal{U}$ to be a Hilbert space $H$, let $\mathcal{Y}=\mathbb{R}^J$ for some $J\in\mathbb{N}$, and suppose that observations $y$ are made according to the linear model

$$y = Au + \eta,$$

where $\eta\sim \mathcal{N}(0,\Gamma)$ in $\mathcal{Y}=\mathbb{R}^J$, with $\Gamma\in\mathbb{R}^{J\times J}$ SPD, indep. of $u$.

This measurement model says that

$$y|_{u=u} \sim \mathcal{N}(Au,\Gamma),$$

i.e. it has PDF proportional to $\exp(-\Phi(u;y))$, where

$$\Phi(u;y)=\frac{1}{2}|\Gamma^{-1/2}(Au-y)|_{\mathbb{R}^J}^2.$$

$\Phi$ is the negative log-likelihood / misfit or potential for this measurement model.

Suppose that a prior $\mu_0$ for $u$ is specified; this determines the joint law $\mu_{(u,y)}$ via

$$\mu_{(u,y)}(A\times B)=\int_A\int_B \frac{1}{\sqrt{\det(2\pi\Gamma)}}\exp(-\Phi(u;y))\,dy\;\mu_0(du).$$

In the specific case that $\mu_0=\mathcal{N}(m_0,C_0)$ is Gaussian, the joint dist'n is again Gaussian:

$$\begin{pmatrix}u\\y\end{pmatrix}\sim \mathcal{N}\left(\begin{pmatrix}m_0\\Am_0\end{pmatrix},\begin{pmatrix}C_0 & C_0A^*\\ AC_0 & AC_0A^*+\Gamma\end{pmatrix}\right).$$

The usual formula for conditioning Gaussians applies here (but additional care would be needed for infinite-dimensional $\mathcal{Y}$!) to give

$$\mu_{u|y=y}=\mathcal{N}(m^y,C^y) \quad\text{where}$$

$$m^y = m_0 + C_0A^*(AC_0A^*+\Gamma)^{-1}(y-Am_0),$$

$$C^y = C_0 - C_0A^*(AC_0A^*+\Gamma)^{-1}AC_0.$$

(the Kalman update formula again).

Interestingly, if we compare the posterior $\mu_{u|y=y}=\mathcal{N}(m^y,C^y)$ for this problem to the prior $\mu_0=\mathcal{N}(m_0,C_0)$, then we notice that the posterior has a density with respect to the prior:

$$\frac{d\mu_{u|y=y}}{d\mu_0}(u)=\frac{\exp(-\Phi(u;y))}{Z(y)},$$

with normalising constant

$$Z(y)=\int_{\mathcal{U}} \exp(-\Phi(u;y))\,\mu_0(du).$$

That is, for any integrable $f:\mathcal{U}\to\mathbb{R}$,

$$\int_{\mathcal{U}} f(u)\,\mu_{u|y=y}(du)=\int_{\mathcal{U}} f(u)\frac{\exp(-\Phi(u;y))}{Z(y)}\,\mu_0(du).$$

This is the more robust (to $\infty$-dim $\mathcal{U}$) formulation of Bayes' rule: not "posterior = likelihood $\times$ prior" but "the density of the posterior w.r.t. the prior = the likelihood". More precisely:

**Theorem (Generalised Bayes rule)** let $\mathcal{U}=H$ be a Hilbert space and $\mathcal{Y}=\mathbb{R}^J$. Let $u\sim \mu_0$ and suppose that $y|_{u=u}$ has conditional PDF on $\mathbb{R}^J$ given by $\rho_{y|u=u}:\mathbb{R}^J\to[0,\infty]$ so that

$$\mu_{(u,y)}(A\times B)=\mathbb{P}[u\in A,y\in B]=\int_A\int_B \rho_{y|u=u}(y)\,dy\;\mu_0(du).$$

Assume that $\rho_y$ is everywhere positive, where

$$\rho_y(y):=\int_{\mathcal{U}} \rho_{y|u=u}(y)\,\mu_0(du).$$

Then the posterior/conditional dist'n $\mu_{u|y=y}$ exists and has a density w.r.t. $\mu_0$ given by Bayes rule:

$$\frac{d\mu_{u|y=y}}{d\mu_0}(u)=\frac{\rho_{y|u=u}(y)}{\rho_y(y)}.$$

(B)

**Proof** The proof is mostly just checking that (B) satisfies the reconstruction law

$$\mu_{(u,y)}(A\times B) = \int_B \mu_{u|y=y}(A)\,\mu_y(dy).$$

Starting from the RHS,

$$\int_B \mu_{u|y=y}(A)\,\mu_y(dy)=\int_B \mu_{u|y=y}(A)\,\rho_y(y)\,dy=\int_B\int_A 1\;\mu_{u|y=y}(du)\;\rho_y(y)\,dy.$$

Under our claim (B) this becomes

$$\int_B\int_A \frac{\rho_{y|u=u}(y)}{\rho_y(y)}\,\mu_0(du)\;\rho_y(y)\,dy = \int_A\int_B \rho_{y|u=u}(y)\,dy\;\mu_0(du)=:\mu_{(u,y)}(A\times B).$$

$\square$