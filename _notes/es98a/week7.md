---
layout: page
title: "Week 7: Random functions in full: covariance operators, stochastic processes, and KL expansions"
---

# Week 7

* Probability on function spaces
* Mean elements, covariance and cross-covariance operators
* Basis expansions with random coefficients
* Generalised polynomial chaos (gPC) expansions
* Handout: Gaussian and other stochastic processes

## Random elements of Hilbert spaces

Given a Hilbert space $H$ (e.g. a Hilbert space of real-valued functions on a set $X$), an $H$-valued random variable is just a (measurable) function $u:\Omega\to H$ defined on a probability space $(\Omega,\mathcal{F},\mathbb{P})$.

Some obvious questions:

1. What are the right notions of mean and variance for $u$?
2. How do we build/sample such $H$-valued random variables?

## Mean elements

Observe that, for an $\mathbb{R}^n$-valued random variable $u:\Omega\to\mathbb{R}^n$, the mean element $m_u\in\mathbb{R}^n$ can be defined as the vector of means of the $n$ components, and also equivalently
$$
\mathbb{E}[u]=m_u
\iff
\mathbb{E}[u-m_u]=0
\iff
\text{for all }\ell\in\mathbb{R}^n,\ \mathbb{E}[\langle \ell,,u-m_u\rangle]=0,
$$
where $\langle \ell,,u-m_u\rangle$ is a real r.v.

Inspired by this, we say that $m_u\in H$ is the (weak) expected value / mean of $u:\Omega\to H$, and write $\mathbb{E}[u]=m_u$, if
$$
\text{for all }\ell\in H,\quad \mathbb{E}[\langle \ell,,u-m_u\rangle_H]=0.
$$

(**Note**) cf. the strong/Bochner integral, in which we really do perform vector-valued integration.

## Covariance operators

The mean is well-defined if $\mathbb{E}[|u|_H]<\infty$.

If $\mathbb{E}[|u|_H^2]<\infty$, then we can go further and define the covariance operator $\mathrm{Cov}[u]$, or $C_u$, of $u:\Omega\to H$ as the linear operator from $H$ to itself given by
$$
\langle h,,C_u k\rangle_H
:=
\mathbb{E}\big[\langle h,,u-m_u\rangle_H\ \langle u-m_u,,k\rangle_H\big],
\quad\text{for each }h,k\in H.
$$

Note, though, that
$$
\langle h,,u-m_u\rangle_H\ \langle u-m_u,,k\rangle_H
====================================================

\langle h,\ \langle u-m_u,,k\rangle_H (u-m_u)\rangle_H,
$$
and so (weakly)
$$
C_u=\mathbb{E}\big[(u-m_u)\otimes(u-m_u)\big].
$$

Similarly, we can define the cross-covariance operator of two random variables. Let $u:\Omega\to H_1$, $v:\Omega\to H_2$ be random variables, i.e. $(u,v)$ takes values in $H_1\oplus H_2$. The cross-covariance operator of $u$ and $v$, denoted $\mathrm{Cov}[u,v]$ or $C_{uv}$, is an operator from $H_2$ into $H_1$ given by
$$
\langle h,,C_{uv} k\rangle_{H_1}
:=
\mathbb{E}\big[\langle h,,u-m_u\rangle_{H_1}\ \langle v-m_v,,k\rangle_{H_2}\big],
$$
for $k\in H_2$, $h\in H_1$.

Note that $C_u$ above is just $C_{uu}$. Just as before,
$$
C_{uv}=\mathbb{E}\big[(v-m_v)\otimes(u-m_u)\big].
$$

## Sazonov’s theorem (structure of covariance operators)

**Theorem (Sazonov).** Let $u:\Omega\to H$ take values in a separable Hilbert space (i.e. $\dim H$ is finite or countably infinite), have finite second moment $\mathbb{E}[|u|_H^2]$, mean $m_u\in H$ and covariance operator $C_u:H\to H$. Then $C_u$ is SPSD and trace class, and
$$
\mathrm{tr},C_u=\mathbb{E}\big[|u-m_u|_H^2\big]<\infty.
$$

**Proof (sketch pieces).** To see that $C_u$ is self-adjoint, consider any $h,k\in H$:
$$
\langle h,,C_u k\rangle
=======================

# \mathbb{E}\big[\langle h,,u-m_u\rangle\ \langle u-m_u,,k\rangle\big]

# \mathbb{E}\big[\langle k,,u-m_u\rangle\ \langle u-m_u,,h\rangle\big]

\langle k,,C_u h\rangle,
$$
i.e. $C_u=C_u^*$.

(**Exercise**) Show that $C_{uv}=C_{vu}^*$.

For positivity, let $h\in H$. Then
$$
\langle h,,C_u h\rangle
=======================

# \mathbb{E}\big[\langle h,,u-m_u\rangle\ \langle u-m_u,,h\rangle\big]

\mathbb{E}\big[|\langle h,,u-m_u\rangle|^2\big]\ge 0.
$$

(**Exercise**) $C_u$ is SPD iff there is no proper subspace $S$ of $H$ with $u\in S$ almost surely.

To see that $C_u$ has finite trace, let $(\psi_n)_{n\in\mathbb{N}}$ be any CONB of $H$. Then
$$
\mathrm{tr},C_u
===============

# \sum_{n\in\mathbb{N}} \langle \psi_n,,C_u\psi_n\rangle

# \sum_{n\in\mathbb{N}}\mathbb{E}\big[|\langle \psi_n,,u-m_u\rangle|^2\big]

\mathbb{E}\Big[\sum_{n\in\mathbb{N}}|\langle \psi_n,,u-m_u\rangle|^2\Big]
$$
(Fubini)
$$
==

\mathbb{E}\big[|u-m_u|^2\big]
$$
(Parseval)
$$
\le 2|m_u|^2 + 2\mathbb{E}\big[|u|^2\big]<\infty.
$$
$\square$

An important consequence of Sazonov’s theorem is that a finite-variance random vector $u$ with values in an infinite-dimensional $H$ can never have identity covariance.

## Randomised basis expansions

Fix a CONB $(\psi_n)*{n\in\mathbb{N}}$ of a (real) Hilbert space $H$, e.g. a space of functions on some set $X$. We propose to define a random element $u$ of $H$ via
$$
u := \sum*{n\in\mathbb{N}} \xi_n \psi_n,
$$
where the $\xi_n$, $n\in\mathbb{N}$, are $\mathbb{R}$-valued random variables.

Question: What conditions need to be imposed on the $\xi_n$ to ensure that $u\in H$ a.s.?

The key tool here is Kolmogorov’s two-series theorem from last week’s handout.

**Theorem.** Let $(\psi_n)_n$ be a CONB of $H$. Fix a deterministic sequence $(\sigma_n)*n$ with $\sigma_n\in\mathbb{R}$, and set
$$
u := \sum*{n\in\mathbb{N}} \sigma_n \xi_n \psi_n,
\quad\text{with}\quad
\xi_n\sim\mathcal{N}(0,1)\ \text{i.i.d.}
$$
If $\sum_n \sigma_n^2<\infty$, then $u\in H$ a.s. Moreover $\mathbb{E}[u]=m_u=0$, and $\mathrm{Cov}[u]=C_u=\Sigma^2$, where $\Sigma^2$ is the diagonal operator $\psi_n\mapsto |\sigma_n|^2\psi_n$.

**Proof.** Observe that
$$
u\in H
\iff
|u|*H^2<\infty
\iff
\sum*{n\in\mathbb{N}}|\sigma_n\xi_n|^2<\infty
$$
(by Parseval).

Now observe that
$$
\sum_n \mathbb{E}[|\sigma_n\xi_n|^2]
====================================

# \sum_n |\sigma_n|^2\mathbb{E}[|\xi_n|^2]

\sum_n |\sigma_n|^2<\infty,
$$
and
$$
\sum_n \mathbb{E}[|\sigma_n\xi_n|^4]
====================================

# \sum_n |\sigma_n|^4\mathbb{E}[|\xi_n|^4]

3\sum_n |\sigma_n|^4<\infty.
$$
So Kolmogorov’s two-series theorem ensures that $\mathbb{P}[\sum_n |\sigma_n\xi_n|^2<\infty]=1$, i.e. $\mathbb{P}[u\in H]=1.

(**Exercises**) Check that $\mathbb{E}[u]=0$ (easy!). Check that $\mathrm{Cov}[u]=\Sigma^2$.
$\square$

**Example.** On $H:=L^2_{\mathrm{per}}([0,2\pi];\mathbb{C})$ with Fourier CONB $\psi_n(t)=\exp(int)/\sqrt{2\pi}$ for $n\in\mathbb{Z}$, we can build a random element $u$ of $H$ by setting e.g.
$$
u=\sum_{n\in\mathbb{Z}}\sigma_n\xi_n\psi_n,
\qquad
\sigma_0:=0,
\qquad
\sigma_{\pm n}:=\frac{1}{n}\ \text{for }n\ne 0.
$$
Then
$$
\sum_{n\in\mathbb{Z}}\sigma_n^2
===============================

# 2\sum_{n\in\mathbb{N}}\frac{1}{n^2}

\frac{\pi^2}{3}<\infty,
$$
and so $u\in L^2$ a.s.

Indeed, one can similarly check that $u\in H^s$ for all $s<\tfrac{1}{2}$. The mean is the zero function, and the covariance operator is $\psi_n\mapsto n^{-2}\psi_n$, i.e. $\mathrm{Cov}[u]=(-\Delta)^{-1}$, i.e. is the integral operator whose kernel is the Green’s function (fundamental solution) of Laplace’s equation.

### Gaussian white noise

A naive definition of Gaussian white noise on $H$ is
$$
w := \sum_{n\in\mathbb{N}} \xi_n \psi_n,
\qquad
\xi_n\sim\mathcal{N}(0,1)\ \text{i.i.d.}
$$
Unfortunately, it is easy to show that $\mathbb{P}[|w|_H=\infty]=1$, so $w$ is almost surely too rough to land in $H$. Its mean is zero and its covariance operator is the identity; it has infinite second moment. Similar proof techniques to the above use Kolmogorov’s theorem to show that $w\in H^s$ a.s. for all $s<-\tfrac{1}{2}$.

## Generalised polynomial chaos (gPC) expansions

The idea here is to express a “complicated” r.v. $u$ as a sum of “simple” deterministic functions of a “simple” r.v. $\xi$, called the stochastic germ. To keep things concrete, fix a r.v. $\xi:\Omega\to X=\mathbb{R}$ with law $\mu_\xi$. Under mild assumptions (need that $\mathbb{E}[e^{a|\xi|}]<\infty$ for some $a>0$) there is a system ${q_k}_{k\in\mathbb{N}*0}$ of orthogonal polynomials for $\xi/\mu*\xi$:

* each $q_k:\mathbb{R}\to\mathbb{R}$ is a polynomial of degree $k$;
* they satisfy the orthogonality relation
  $$
  \mathbb{E}[q_j(\xi),q_k(\xi)] = \gamma_k \delta_{jk}
  $$
  for some normalisation constants $\gamma_k>0$;
* the functions $q_k$ form a CONB for $L^2(X,\mu_\xi;\mathbb{R})$.

E.g.:

* For $\xi\sim\mathcal{N}(0,1)$, we obtain the Hermite polynomials
  $$
  \mathrm{He}_0(z)=1,\quad
  \mathrm{He}_1(z)=z,\quad
  \mathrm{He}_2(z)=z^2-1,\ \ldots
  $$
  The normalisation constant is $\gamma_k=k!$.
* For $\xi\sim U([-1,1])$, we obtain the Legendre polynomials.

The idea now is simply to expand $u$ (thought of as a function on $X$) in the CONB ${q_k}*{k}$:
$$
u = \sum*{k\in\mathbb{N}_0} u_k,q_k(\xi),
$$
with
$$
u_k=\gamma_k^{-1}\mathbb{E}[u,q_k(\xi)]\in\mathbb{R}.
$$

In practice, the expected value on the RHS will have to be approximated somehow, e.g. via Monte Carlo sampling:
$$
u_k \approx \hat u_k^{(N)} := \frac{1}{N}\sum_{n=1}^N u(\xi^{(n)}),q_k(\xi^{(n)}),
\qquad
\xi^{(n)}\sim \mu_\xi\ \text{i.i.d.}
$$

Think of this as a cheap surrogate model for the potentially expensive/slow/complicated r.v. $u$.

The same procedure can be followed for any system of functions $q_k$ that are orthogonal w.r.t. $\mu_\xi$, not just polynomials, e.g. wavelets, Fourier basis functions, …

We can do the same thing for gPC expansion of a random vector $u:\Omega\to\mathbb{R}^d$. Again we expand as
$$
u = \sum_k u_k,q_k(\xi),
\qquad
u_k=\gamma_k^{-1}\mathbb{E}[u,q_k(\xi)]\in\mathbb{R}^d.
$$

We can do the same thing for gPC expansion of a random function $u:\Omega\to{\text{functions on }T}$, i.e. stochastic processes/functions:
$$
u(t,\xi) = \sum_k u_k(t),q_k(\xi),
$$
with $u_k:T\to\mathbb{R}$ given by
$$
u_k(t)=\gamma_k^{-1}\mathbb{E}[u(t,\xi),q_k(\xi)].
$$
(the “stochastic modes” or gPC modes of $u$)

We also often expand using multiple stochastic germs $\xi_1,\ldots,\xi_M$. We then need a system of functions $\mathbb{R}^M\to\mathbb{R}$ that form a CONB with respect to the joint law $\mu_\xi$ of $\xi=(\xi_1,\ldots,\xi_M)$. If the components of $\xi$ are independent, then joint basis functions are just products of univariate ones — but beware the curse of dimension: learning $K^M$ coefficients can rapidly exhaust your computational resources!

## Stochastic processes

A **stochastic process** on a set $X$ is just a (measurable) function
$$
u:X\times\Omega\to\mathbb{R},
$$
where $(\Omega,\mathcal{F},\mathbb{P})$ is some probability space, i.e. it is just a family of $\mathbb{R}$-valued random variables $u(x)$, one for each $x\in X$.

### Mean and covariance functions

The **mean function** $m_u:X\to\mathbb{R}$ of $u$ is given by
$$
m_u(x):=\mathbb{E}[u(x)] = \int_\Omega u(x,\omega)\,\mathbb{P}(d\omega),
$$
defined as long as $\mathbb{E}[|u(x)|]$ is finite for all $x\in X$.

The **covariance function / cov. kernel** $k_u:X\times X\to\mathbb{R}$ is given by
$$
k_u(x,y):=\mathbb{E}\big[(u(x)-m_u(x))(u(y)-m_u(y))\big],
$$
and is defined as long as $\mathbb{E}[|u(x)|^2]<\infty$ for all $x\in X$.

### Gaussian processes

A stochastic process $u:X\times\Omega\to\mathbb{R}$ is called a **Gaussian process (GP)** with mean func. $m:X\to\mathbb{R}$ and cov. func. $k:X\times X\to\mathbb{R}$, denoted $u\sim\mathrm{GP}(m,k)$, if, for all $x_1,\ldots,x_n\in X$, $n\in\mathbb{N}$,
$$
\begin{pmatrix}
u(x_1)\\
\vdots\\
u(x_n)
\end{pmatrix}
\sim
\mathcal{N}\!\left(
\begin{pmatrix}
m(x_1)\\
\vdots\\
m(x_n)
\end{pmatrix},
\begin{pmatrix}
k(x_1,x_1) & \cdots & k(x_1,x_n)\\
\vdots & \ddots & \vdots\\
k(x_n,x_1) & \cdots & k(x_n,x_n)
\end{pmatrix}
\right).
$$

## Examples

Some commonly-used covariance functions include:
- **Brownian kernel:** $k(x,y):=\min(x,y)$ on $X=[0,T]$
- **Squared exp. kernel:** for $X=\mathbb{R}^d$,
  $$
  k(x,y):=\sigma^2\exp\!\left(-\frac{\|x-y\|^2}{2\ell^2}\right)
  $$
- **Exp. kernel:**
  $$
  k(x,y):=\sigma^2\exp\!\left(-\frac{\|x-y\|}{\ell}\right)
  $$
- **Matérn kernels**

## Karhunen–Loève theorem

There is a close relationship between “nice” stochastic processes and random basis expansions in the eigenbasis of a suitable integral operator.

**Karhunen–Loève Theorem.** Let $X\subseteq\mathbb{R}^d$ and let $u:X\times\Omega\to\mathbb{R}$ be centred (i.e. $m_u=0$) and square-integrable (i.e.
$$
\mathbb{E}\!\left[\int_X |u(x)|^2\,dx\right]
=
\int_X \mathbb{E}[|u(x)|^2]\,dx
<\infty
$$
), with continuous and square-integrable cov. func. $k$.

Then the induced integral op.
$$
I_k:L^2(X)\to L^2(X),
\qquad
(I_k f)(x):=\int_X k(x,y)f(y)\,dy
$$
is the cov. op. $\mathrm{Cov}[u]$ of $u$. Let $\lambda_n\ge 0$ and $\psi_n$ be the eigenvalues and orthonormal eigenfunctions of $I_k$. Then
$$
u=\sum_{n\in\mathbb{N}} z_n\,\psi_n,
$$
with
$$
z_n=\int_X u(x)\psi_n(x)\,dx=\langle u,\psi_n\rangle_{L^2(X)},
$$
and the r.v.s $z_n$ are centred (i.e. $\mathbb{E}[z_n]=0$) and uncorrelated with variance $\lambda_n$ (i.e. $\mathbb{E}[z_n z_m]=\lambda_n\delta_{nm}$).

Furthermore, if $u\sim \mathrm{GP}(0,k)$, then
$$
z_n\sim\mathcal{N}(0,\lambda_n).
$$

## Smoothness of sample draws

How regular/smooth are the sample draws of a stochastic process / GP? Needs a lot of mathematical analysis.

- If $k$ has all partial derivatives up to order $2n$ continuous, then $u$ is almost surely $n$ times differentiable.
- If the RKHS $\mathcal{H}_k$ induced by the cov. kernel $k$ is a space of $s$-times differentiable functions, then $u$ is almost surely not in $\mathcal{H}_k$, but it does almost surely have $s-\tfrac{d}{2}$ derivatives, as long as $s>d$.

## Proof that $\mathrm{Cov}[u]=I_k$

For $f,g\in L^2(X)$, by definition of the covariance operator,
$$
\langle f,\ \mathrm{Cov}[u]\,g\rangle_{L^2}
=
\mathbb{E}\big[\langle f,u\rangle_{L^2}\ \langle u,g\rangle_{L^2}\big]
=
\mathbb{E}\left[\left(\int_X f(x)u(x)\,dx\right)\left(\int_X u(y)g(y)\,dy\right)\right].
$$
(Fubini)
$$
=
\mathbb{E}\left[\int_X\int_X f(x)u(x)u(y)g(y)\,dx\,dy\right]
=
\int_X\int_X f(x)\,\mathbb{E}[u(x)u(y)]\,g(y)\,dy\,dx
$$
$$
=
\int_X f(x)\left(\int_X k(x,y)g(y)\,dy\right)\,dx
=
\int_X f(x)\,(I_k g)(x)\,dx
=
\langle f,\ I_k g\rangle_{L^2}.
$$
$\square$

At many points now, we have a necessary step in implementing our mathematical ideas: we need to learn/fit coefficients in a model to best explain some data, or to best approximate some underlying function. This naturally leads us to our next topic: **inverse problems**.
