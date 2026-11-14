---
layout: page
title: "Week 8: Regression and inverse problems: pseudoinverses + regularisation as optimisation"
---

Return to the [two stress measurements](/notes/es98a/week1#models) that opened the course. A least-squares optimum solved the disagreement, but did not tell us whether small observation errors could produce large changes in stiffness. The SVD in Week 2 exposed that sensitivity; compact operators in Week 5 showed why infinitely many weak directions make it unavoidable.

We now choose to leave some information unrecovered. Regularisation trades a controlled bias for reduced noise amplification. The central question is no longer “can we invert every mode?” but “which modes does the data justify recovering?”

<h2 id="week-8">Route through this chapter</h2>

- Optimisation approach to inverse problems
- Least squares and feature-based linear regression
- Ill-posedness of inverse problems
- Generalised inverses
- Regularisation: Tikhonov regularisation (ridge regression) and other examples

Simply put, an inverse problem means fitting/learning unknown parameters in a mathematical model to best explain some data/observation about the system being modelled. (Sometimes we distinguish between **parameter estimation** and **state estimation** for dynamical systems.)

Classic example: According to Hooke's law, for a linear elastic material, the force $F$ applied to stretch a material and the resulting dimensionless strain $\varepsilon$ are proportional. Writing $\sigma:=F/A$, $A$ being the cross-sectional area of the material, $\sigma=E\varepsilon$, with $\sigma$ being the stress, $\varepsilon$ the strain, and $E$ the Young's modulus for the material. We can apply known forces and measure extension to get a data set $(\varepsilon_j,\sigma_j)_{j=1}^J$ and find an $E$ that "best" explains the data. A classic choice for "best" is an $E$ that minimises the sum of squared residuals

$$\Phi(E):=\sum_{j=1}^J|\sigma_j-E\varepsilon_j|^2.$$

With noisy data, an overdetermined system will generally have positive minimum misfit, although exact consistency is possible. Overdetermined does not by itself mean inconsistent.

This is a simple example of linear regression: given a set of $J$ input-output pairs $(x_j,y_j)$, find a constant $\theta\in\mathbb{R}$ such that

$$\Phi(\theta):=\frac{1}{2}\sum_{j=1}^J|\theta x_j-y_j|^2=\frac{1}{2}\|x\theta-y\|_2^2$$

is minimised. (Here $x=(x_1,\ldots,x_J)$ and $y=(y_1,\ldots,y_J)$.)

As a mild generalisation, we can do linear regression with an intercept that does not have to be zero: we seek $\theta=(\theta_0,\theta_1)^T\in\mathbb{R}^2$, using the model $y^j=\theta_0+\theta_1 x_j$, to minimise

$$\Phi(\theta):=\frac{1}{2}\sum_{j=1}^J|\theta_0+\theta_1 x_j-y_j|^2=\frac{1}{2}\|\theta_0(1,\ldots,1)^T+\theta_1 x-y\|_2^2,$$

$$=\frac{1}{2}\left\|\begin{pmatrix}1&x_1\\ \vdots&\vdots\\ 1&x_J\end{pmatrix}\begin{pmatrix}\theta_0\\ \theta_1\end{pmatrix}-\begin{pmatrix}y_1\\ \vdots\\ y_J\end{pmatrix}\right\|_2^2.$$

(In the form that `numpy.linalg.lstsq` expects.)

We can take this a bit further and fit models linear in their parameters of the form

$$y=\sum_{k=0}^K \theta_k f_k(x),$$

where the parameters $\theta_0,\ldots,\theta_K\in\mathbb{R}$ appear linearly, and the $f_0,\ldots,f_K:\mathbb{R}\to\mathbb{R}$ are possibly nonlinear feature functions. A Fourier expansion is an example, with $f_k(x)=e^{ikx}$.

The misfit function $\Phi:\mathbb{R}^{K+1}\to\mathbb{R}_{\ge 0}$ that needs to be minimised here is again a sum of squared residuals

$$\Phi(\theta)=\frac{1}{2}\sum_{j=1}^J\left|\sum_{k=0}^K \theta_k f_k(x_j)-y_j\right|^2=\frac{1}{2}\left\|\begin{pmatrix} f_0(x_1) & f_1(x_1) & \cdots & f_K(x_1)\\ \vdots & \vdots & \ddots & \vdots\\ f_0(x_J) & f_1(x_J) & \cdots & f_K(x_J) \end{pmatrix} \begin{pmatrix}\theta_0\\ \theta_1\\ \vdots\\ \theta_K\end{pmatrix} - \begin{pmatrix}y_1\\ \vdots\\ y_J\end{pmatrix} \right\|_2^2.$$

The matrix above is the **feature matrix** or **design matrix** (or "Vandermonde matrix" if the $f_k$ are polynomials).

All of the above is motivation for, and special cases of, the following:

- (**problem setup**) Given Hilbert spaces $H_1$ and $H_2$, and a linear operator $A:H_1\to H_2$ (usually a compact op.) and $y\in H_2$,
- (**solution**) find $u\in H_1$
- s.t. $\frac{1}{2}\|Au-y\|_{H_2}^2$ is minimised.

(We call $A$ the forward operator.)

Mathematical forward problems are usually well posed: Hadamard called a problem well posed if

1. For each problem setup, a solution exists
2. That solution is unique
3. This unique solution depends "nicely"/stably (e.g. continuously or differentiably) on the problem setup.

However, inverse problems are typically ill posed and violate one or more of Hadamard's criteria. Just think of over- and under-determined linear systems to see why the eqn $Au=y$ cannot typically be solved for $u$ in a stable way. (Even the minimisation problem is a relaxation of the original goal of solving an equation exactly.)

<h2 id="generalised-inverses-for-compact-linear-inverse-problems">Generalised inverses for compact linear inverse problems</h2>

We'd like to solve the equation $Au=y$ for $u\in H_1$ given a compact linear op. $A:H_1\to H_2$ and $y\in H_2$. This may be impossible, e.g. if $y\notin\mathrm{ran}(A)$, cf. Hadamard (1). If $A$ is not injective, i.e. if $\ker(A)\ne\{0\}$, then solutions are not unique, cf. Hadamard (2). And what about (3)?

The situation is not hopeless: we relax the problem and seek $u$ to minimise

$$\frac{1}{2}\|Au-y\|_{H_2}^2=: \Phi(u).$$

As we have seen, minimisers of $\Phi$ are exactly solutions of $\nabla\Phi(u)=0$, i.e. solutions of the normal equations

$$A^*Au=A^*y.$$

If we have the SVD

$$A=\sum_{n\in\mathbb{N}} \sigma_n\,\phi_n\otimes\psi_n,$$

then, whenever the following series converges, the minimum-norm least-squares solution is given by

$$u=A^\dagger y=\sum_{n\in\mathbb{N}}\frac{1}{\sigma_n}\langle \psi_n,y\rangle_{H_2}\,\phi_n\quad (*),$$

where

$$A^\dagger=\sum_{n\in\mathbb{N}}\frac{1}{\sigma_n}\,\psi_n\otimes\phi_n.$$

(**Moore–Penrose pseudoinverse / generalised inverse of $A$**)

Two issues present themselves:

1. The expansion (\*) for $u$ only converges in $H_1$ if the data $y\in H_2$ satisfies the Picard condition

$$\|A^\dagger y\|_{H_1}^2=\sum_{n\in\mathbb{N}}\frac{|\langle \psi_n,y\rangle_{H_2}|^2}{\sigma_n^2}<\infty.$$

(Parseval)

So $A^\dagger$ is not a globally-defined operator $H_2\to H_1$; it is only defined on a domain $\mathrm{dom}(A^\dagger)\subseteq H_2$ on which the Picard condition holds.

2. $A^\dagger:\mathrm{dom}(A^\dagger)\subseteq H_2\to H_1$ is an unbounded operator: there is no finite constant $C$ s.t.

$$\|A^\dagger y-A^\dagger(y+\delta y)\|\le C\|\delta y\|.$$

(The only way this can hold is the "boring" case that $A$ has finite rank $r$, in which case $C=\|A^\dagger\|_{\mathrm{op}}=\sigma_r^{-1}$; otherwise $\|A^\dagger\|_{\mathrm{op}}=(\min_n \sigma_n)^{-1}=\sigma^{-1}=\infty$.) Thus $A^\dagger y$ is highly sensitive to small perturbations of the data $y$, cf. Hadamard (3).

Despite these issues, $A^\dagger$ does have many nice properties, e.g.

$$A A^\dagger A=A,\qquad A^\dagger A A^\dagger=A^\dagger,$$

$$A^\dagger A=P_{(\ker A)^\perp},\qquad A A^\dagger=P_{\overline{\mathrm{ran}\,A}}\big|_{\mathrm{dom}\,A^\dagger}.$$

Furthermore, **for $y\in\mathrm{dom}(A^\dagger)$**, if we set $u^+:=A^\dagger y$, then

$$\arg\min \Phi=\{u\in H_1:\|Au-y\|_{H_2}^2\text{ is minimised}\}=u^+ + \ker A,$$

and $u^+$ minimises $\|u\|_{H_1}$ in this set. That is, among all solutions to the least squares problem, $A^\dagger y$ is the "smallest", the closest to the origin in $H_1$.

<h2 id="regularisation">Regularisation</h2>

This all leads to the idea of regularisation: we approximate the partially-defined unbounded op. $A^\dagger:\mathrm{dom}(A^\dagger)\subseteq H_2\to H_1$ by a family of bounded operators $G_\alpha:H_2\to H_1$, with $\alpha>0$ being a regularisation parameter. Note that $\|G_\alpha\|_{\mathrm{op}}\to +\infty=\|A^\dagger\|_{\mathrm{op}}$ as $\alpha\to 0$. We ask only that

$$G_\alpha y \to A^\dagger y\quad\text{as }\alpha\to 0$$

for all $y\in\mathrm{dom}(A^\dagger)$.

There's clearly a lot of flexibility here. An accessible example is Tikhonov regularisation / ridge regression.

<h3 id="tikhonov-regularisation">Tikhonov regularisation</h3>

Although there are many ways to regularise inverse problems, an accessible first approach to consider is Tikhonov regularisation.

Instead of minimising the misfit functional

$$\Phi(u):=\frac{1}{2}\|Au-y\|_{H_2}^2$$

w.r.t. $u\in H_1$, we minimise

$$\Phi_\alpha(u):=\frac{1}{2}\|Au-y\|_{H_2}^2+\frac{\alpha}{2}\|u\|_{H_1}^2,$$

with $\alpha>0$ a regularisation parameter. Small $\alpha$ promotes fidelity to the data, with a risk of overfitting; large $\alpha$ promotes a stable, small solution regardless of the data.

We can derive Tikhonov-regularised normal equations:

$$u_\alpha\text{ minimises }\Phi_\alpha \iff \nabla\Phi_\alpha(u_\alpha)=0 \iff A^*A u_\alpha - A^*y + \alpha u_\alpha = 0 \iff (A^*A+\alpha I)u_\alpha=A^*y \iff u_\alpha=(A^*A+\alpha I)^{-1}A^*y.$$

The reason this inverse is bounded is the uniform coercivity bound $\langle u,(A^*A+\alpha I)u\rangle\ge\alpha\|u\|^2$, rather than strict positivity alone. Indeed, the operator

$$G_\alpha:=(A^*A+\alpha I)^{-1}A^*$$

is a regularisation of $A^\dagger$ in the sense introduced above:

- $G_\alpha:H_2\to H_1$ is a bounded op. with $\|G_\alpha\|_{\mathrm{op}}\le 1/(2\sqrt\alpha)$;
- for $y\in H_2$ satisfying the Picard cond., $G_\alpha y \to A^\dagger y$ as $\alpha\to 0$.

In terms of an SVD $A=\sum_{n\in\mathbb{N}}\sigma_n\,\phi_n\otimes\psi_n$ with $\sigma_n\to 0$, $\phi_n$ orthonormal in $H_1$, and $\psi_n$ orthonormal in $H_2$, $A^\dagger$ is given by

$$A^\dagger=\sum_{n\in\mathbb{N}}\sigma_n^{-1}\,\psi_n\otimes\phi_n,\quad\text{i.e. }A^\dagger y=\sum_{n\in\mathbb{N}}\frac{\langle \psi_n,y\rangle}{\sigma_n}\,\phi_n.$$

On the other hand,

$$u_\alpha=G_\alpha y=\sum_{n\in\mathbb{N}}\frac{\sigma_n}{\sigma_n^2+\alpha}\langle \psi_n,y\rangle\,\phi_n=\sum_{n\in\mathbb{N}} g_\alpha(\sigma_n)\langle \psi_n,y\rangle\,\phi_n,$$

where $g_\alpha:[0,\infty)\to[0,\infty)$ is the regularisation function or filter function.

This is an example of spectral regularisation, replacing the "ideal" filter function

$$g_0(\sigma):=\begin{cases}1/\sigma & \sigma>0\\ 0 & \sigma=0\end{cases}$$

by something smoother and bounded.

Other classic examples of filter functions and spectral regularisation include

- $g_\alpha(\sigma):=\frac{1}{\sigma+\alpha}$: a singular-value filter; for a positive self-adjoint $A$, Lavrentiev regularisation uses $(A+\alpha I)^{-1}$

- $g_\alpha(\sigma):=\begin{cases}1/\sigma & \sigma>\alpha\\ 0 & \sigma\le\alpha\end{cases}$: spectral truncation / spectral cutoff / principal component analysis (PCA)

Clearly, the choice of $\alpha$ plays an important role. Often, $\alpha$ is chosen to depend upon the quality/amount of data available.

- Inv. probs: $y=Au+\eta$ with observational noise $\eta$ of "size" $\delta>0$; choose $\alpha(\delta)\to 0$ as $\delta\to 0$.
- Statistics and machine learning: $n$ noisy observations at a fixed noise level; choose $\alpha(n)\to 0$ as $n\to\infty$.

The choice of $\alpha$ as a function of $\delta$ or $n$ is called a regularisation schedule. When coupled with source conditions of the form

$$\sum_{n\in\mathbb{N}} \frac{|\langle \phi_n,u\rangle|^2}{\sigma_n^{2s}}<\infty,$$

we can bound the reconstruction error $G_\alpha y-u$ and show that $\|G_{\alpha(\delta)}y-u\|\to 0$ as $\delta\to 0$ for an appropriate schedule. See handout!

On a fixed noisy data vector, reduce the penalty weight and watch the reconstructed coefficients. Strong modes settle first. Eventually the weak directions begin to explain the noise as if it were signal.

<ES98AAnimation kind="spectral-filter" />

<h2 id="sparsity-and-edge-preserving-regularisation">Sparsity and edge preserving regularisation</h2>

We can consider more general penalties/regularisations: find $u_R$ to minimise

$$\Phi(u)+R(u)$$

with $R:H_1\to[0,\infty]$ some regularisation function.

In some situations, we have a prior belief that $u=\sum_n u_n\psi_n$ should be "simple" or "sparse", i.e. most $u_n=0$. It turns out that a choice of $R$ that promotes sparsity in the minimiser is the $\ell^1$-norm or Manhattan norm of $u$

$$\|u\|_1:=\sum_{n\in\mathbb{N}}|u_n|,$$

$$R(u)=\alpha\sum_n |u_n|.$$

This is known as sparse regularisation, $\ell^1$ regularisation, or the LASSO.

<h2 id="source-conditions-and-why-they-matter-for-convergence-of-regularised-reconstructions">Source conditions and why they matter for convergence of regularised reconstructions</h2>

Consider the inverse problem of recovering $u\in H$ from $y\in Y$, given the linear model

$$y=Au+\eta,\qquad A:H\to Y\ \text{compact}.$$

We will use a regularised reconstruction:

$A$ has SVD

$$A=\sum_{n\in\mathbb{N}}\sigma_n\,\phi_n\otimes\psi_n,$$

and

$$u\approx u_\alpha:=g_\alpha(A)y=\sum_{n\in\mathbb{N}} g_\alpha(\sigma_n)\,\psi_n\otimes\phi_n\,y=\sum_{n\in\mathbb{N}} g_\alpha(\sigma_n)\,\langle \psi_n,y\rangle_Y\,\phi_n.$$

Assume that $\|\eta\|_Y\le \delta$. How should we send $\alpha\to 0$ as $\delta\to 0$ to ensure that $u_{\alpha(\delta)}\to u$? Do we need any assumptions on $u$?

We will focus on Tikhonov regularisation,

$$g_\alpha(\sigma):=\frac{\sigma}{\sigma^2+\alpha}.$$

Many generalisations are possible.

Assume $u\perp\ker A$; an invisible kernel component cannot be recovered by any spectral inverse. Write $u_n=\langle\phi_n,u\rangle$ and $\eta_n=\langle\psi_n,\eta\rangle$. The error splits into a deterministic bias and propagated observation noise:

$$
u_\alpha-u=(G_\alpha A-I)u+G_\alpha\eta,
$$

$$
\|u_\alpha-u\|^2\le
2\sum_n\left(\frac{\alpha}{\sigma_n^2+\alpha}\right)^2|u_n|^2
+2\sum_n\frac{\sigma_n^2}{(\sigma_n^2+\alpha)^2}|\eta_n|^2.
$$

The first term decreases as more modes are trusted; the second can increase. For a scalar singular value $t\ge0$,

$$
(t-\sqrt\alpha)^2\ge0
\quad\Longrightarrow\quad
\frac{t}{t^2+\alpha}\le\frac1{2\sqrt\alpha}.
$$

Therefore the noise term is at most $\delta^2/(2\alpha)$. Equality in the scalar bound occurs at $t=\sqrt\alpha$; the actual operator norm can be smaller if no singular value lies there.

<span data-es98a-source="es98a-filter-balance:start" />

What exactly does regularisation refuse to invert? Compare the filters and the two competing error bounds.

<Figure id="es98a-filter-balance" caption="Left: Tikhonov caps amplification at 2.5 for α=0.04. Right: source radius M₂=1 and noise bound δ=0.02; curves are norm-error bounds, not realised errors.">
<div className="sci-story-grid sci-story-two">
<div><svg className="sci-story-svg" viewBox="0 0 340 290" role="img" aria-label="Filter, α = 0.04"><title>Filter, α = 0.04</title><path d="M45 50V195H310" fill="none" stroke="currentColor" opacity="0.5" /><text x="45" y="25">Filter, α = 0.04</text><text x="300" y="230" textAnchor="end">singular value t</text><text x="45" y="45">data amplification</text><text x="45.00" y="210" textAnchor="middle">0.1</text><text x="305.00" y="210" textAnchor="middle">1</text><text x="38" y="199.00" textAnchor="end">0</text><text x="38" y="59.00" textAnchor="end">10</text><path d="M45.00,167.00 L46.62,166.09 L48.25,165.26 L49.88,164.51 L51.50,163.82 L53.12,163.20 L54.75,162.65 L56.38,162.16 L58.00,161.73 L59.62,161.36 L61.25,161.04 L62.87,160.77 L64.50,160.54 L66.12,160.36 L67.75,160.22 L69.38,160.12 L71.00,160.05 L72.62,160.01 L74.25,160.00 L75.88,160.02 L77.50,160.06 L79.12,160.13 L80.75,160.22 L82.38,160.33 L84.00,160.45 L85.62,160.59 L87.25,160.74 L88.88,160.91 L90.50,161.09 L92.13,161.28 L93.75,161.47 L95.38,161.68 L97.00,161.89 L98.62,162.11 L100.25,162.33 L101.88,162.56 L103.50,162.80 L105.13,163.03 L106.75,163.27 L108.38,163.51 L110.00,163.76 L111.62,164.00 L113.25,164.24 L114.88,164.49 L116.50,164.74 L118.13,164.98 L119.75,165.23 L121.38,165.47 L123.00,165.72 L124.63,165.96 L126.25,166.20 L127.87,166.44 L129.50,166.68 L131.12,166.92 L132.75,167.16 L134.38,167.39 L136.00,167.62 L137.62,167.85 L139.25,168.08 L140.88,168.31 L142.50,168.53 L144.12,168.75 L145.75,168.97 L147.38,169.19 L149.00,169.40 L150.62,169.62 L152.25,169.83 L153.88,170.03 L155.50,170.24 L157.12,170.44 L158.75,170.64 L160.38,170.84 L162.00,171.04 L163.62,171.23 L165.25,171.42 L166.88,171.61 L168.50,171.80 L170.12,171.98 L171.75,172.16 L173.38,172.34 L175.00,172.52 L176.63,172.69 L178.25,172.87 L179.88,173.04 L181.50,173.21 L183.12,173.37 L184.75,173.54 L186.38,173.70 L188.00,173.86 L189.63,174.02 L191.25,174.17 L192.88,174.33 L194.50,174.48 L196.13,174.63 L197.75,174.78 L199.38,174.93 L201.00,175.07 L202.62,175.21 L204.25,175.36 L205.88,175.50 L207.50,175.63 L209.12,175.77 L210.75,175.90 L212.37,176.04 L214.00,176.17 L215.62,176.30 L217.25,176.42 L218.87,176.55 L220.50,176.68 L222.12,176.80 L223.75,176.92 L225.38,177.04 L227.00,177.16 L228.62,177.28 L230.25,177.39 L231.88,177.51 L233.50,177.62 L235.12,177.73 L236.75,177.85 L238.38,177.96 L240.00,178.06 L241.62,178.17 L243.25,178.28 L244.88,178.38 L246.50,178.48 L248.12,178.59 L249.75,178.69 L251.37,178.79 L253.00,178.89 L254.63,178.98 L256.25,179.08 L257.88,179.17 L259.50,179.27 L261.12,179.36 L262.75,179.45 L264.38,179.55 L266.00,179.64 L267.62,179.73 L269.25,179.81 L270.88,179.90 L272.50,179.99 L274.12,180.07 L275.75,180.16 L277.38,180.24 L279.00,180.32 L280.62,180.41 L282.25,180.49 L283.88,180.57 L285.50,180.65 L287.12,180.73 L288.75,180.80 L290.38,180.88 L292.00,180.96 L293.62,181.03 L295.25,181.11 L296.88,181.18 L298.50,181.25 L300.12,181.33 L301.75,181.40 L303.37,181.47 L305.00,181.54" stroke="var(--sci-accent)" strokeWidth="2.5" fill="none" /><text x="45" y="252">solid: t/(t² + α)</text><path d="M45.00,55.00 L46.62,62.46 L48.25,69.16 L49.88,75.21 L51.50,80.71 L53.12,85.73 L54.75,90.33 L56.38,94.55 L58.00,98.45 L59.62,102.05 L61.25,105.40 L62.87,108.51 L64.50,111.42 L66.12,114.13 L67.75,116.68 L69.38,119.07 L71.00,121.32 L72.62,123.43 L74.25,125.43 L75.88,127.33 L77.50,129.12 L79.12,130.82 L80.75,132.43 L82.38,133.96 L84.00,135.43 L85.62,136.82 L87.25,138.15 L88.88,139.42 L90.50,140.63 L92.13,141.79 L93.75,142.91 L95.38,143.97 L97.00,145.00 L98.62,145.98 L100.25,146.93 L101.88,147.84 L103.50,148.72 L105.13,149.56 L106.75,150.38 L108.38,151.16 L110.00,151.92 L111.62,152.66 L113.25,153.36 L114.88,154.05 L116.50,154.71 L118.13,155.35 L119.75,155.98 L121.38,156.58 L123.00,157.16 L124.63,157.73 L126.25,158.28 L127.87,158.81 L129.50,159.33 L131.12,159.84 L132.75,160.33 L134.38,160.80 L136.00,161.27 L137.62,161.72 L139.25,162.16 L140.88,162.58 L142.50,163.00 L144.12,163.41 L145.75,163.80 L147.38,164.19 L149.00,164.57 L150.62,164.93 L152.25,165.29 L153.88,165.64 L155.50,165.98 L157.12,166.32 L158.75,166.65 L160.38,166.96 L162.00,167.28 L163.62,167.58 L165.25,167.88 L166.88,168.17 L168.50,168.46 L170.12,168.74 L171.75,169.01 L173.38,169.28 L175.00,169.55 L176.63,169.80 L178.25,170.06 L179.88,170.30 L181.50,170.55 L183.12,170.78 L184.75,171.02 L186.38,171.25 L188.00,171.47 L189.63,171.69 L191.25,171.91 L192.88,172.12 L194.50,172.33 L196.13,172.53 L197.75,172.73 L199.38,172.93 L201.00,173.12 L202.62,173.32 L204.25,173.50 L205.88,173.69 L207.50,173.87 L209.12,174.05 L210.75,174.22 L212.37,174.39 L214.00,174.56 L215.62,174.73 L217.25,174.89 L218.87,175.05 L220.50,175.21 L222.12,175.37 L223.75,175.52 L225.38,175.67 L227.00,175.82 L228.62,175.97 L230.25,176.11 L231.88,176.26 L233.50,176.40 L235.12,176.53 L236.75,176.67 L238.38,176.80 L240.00,176.94 L241.62,177.07 L243.25,177.19 L244.88,177.32 L246.50,177.45 L248.12,177.57 L249.75,177.69 L251.37,177.81 L253.00,177.93 L254.63,178.04 L256.25,178.16 L257.88,178.27 L259.50,178.38 L261.12,178.49 L262.75,178.60 L264.38,178.71 L266.00,178.82 L267.62,178.92 L269.25,179.02 L270.88,179.12 L272.50,179.23 L274.12,179.32 L275.75,179.42 L277.38,179.52 L279.00,179.62 L280.62,179.71 L282.25,179.80 L283.88,179.90 L285.50,179.99 L287.12,180.08 L288.75,180.17 L290.38,180.25 L292.00,180.34 L293.62,180.43 L295.25,180.51 L296.88,180.59 L298.50,180.68 L300.12,180.76 L301.75,180.84 L303.37,180.92 L305.00,181.00" stroke="var(--sci-secondary)" strokeWidth="2.5" fill="none" strokeDasharray="5 4" /><text x="45" y="270">dashed: inverse 1/t</text></svg></div>
<div><svg className="sci-story-svg" viewBox="0 0 340 290" role="img" aria-label="Error bound, δ = 0.02"><title>Error bound, δ = 0.02</title><path d="M45 50V195H310" fill="none" stroke="currentColor" opacity="0.5" /><text x="45" y="25">Error bound, δ = 0.02</text><text x="300" y="230" textAnchor="end">parameter α</text><text x="45" y="45">norm bound</text><text x="45.00" y="210" textAnchor="middle">0.001</text><text x="305.00" y="210" textAnchor="middle">0.2</text><text x="38" y="199.00" textAnchor="end">0</text><text x="38" y="59.00" textAnchor="end">0.35</text><path d="M45.00,194.60 L46.62,194.10 L48.25,193.60 L49.88,193.11 L51.50,192.61 L53.12,192.11 L54.75,191.62 L56.38,191.12 L58.00,190.62 L59.62,190.12 L61.25,189.62 L62.88,189.13 L64.50,188.63 L66.12,188.13 L67.75,187.63 L69.38,187.14 L71.00,186.64 L72.62,186.14 L74.25,185.65 L75.88,185.15 L77.50,184.65 L79.12,184.15 L80.75,183.66 L82.38,183.16 L84.00,182.66 L85.62,182.16 L87.25,181.66 L88.88,181.17 L90.50,180.67 L92.12,180.17 L93.75,179.68 L95.38,179.18 L97.00,178.68 L98.62,178.18 L100.25,177.69 L101.88,177.19 L103.50,176.69 L105.12,176.19 L106.75,175.69 L108.38,175.20 L110.00,174.70 L111.62,174.20 L113.25,173.70 L114.88,173.21 L116.50,172.71 L118.12,172.21 L119.75,171.72 L121.38,171.22 L123.00,170.72 L124.62,170.22 L126.25,169.72 L127.88,169.23 L129.50,168.73 L131.12,168.23 L132.75,167.74 L134.38,167.24 L136.00,166.74 L137.62,166.24 L139.25,165.75 L140.88,165.25 L142.50,164.75 L144.12,164.25 L145.75,163.75 L147.38,163.26 L149.00,162.76 L150.62,162.26 L152.25,161.76 L153.88,161.27 L155.50,160.77 L157.12,160.27 L158.75,159.77 L160.38,159.28 L162.00,158.78 L163.62,158.28 L165.25,157.78 L166.88,157.29 L168.50,156.79 L170.12,156.29 L171.75,155.79 L173.38,155.30 L175.00,154.80 L176.62,154.30 L178.25,153.81 L179.88,153.31 L181.50,152.81 L183.12,152.31 L184.75,151.81 L186.38,151.32 L188.00,150.82 L189.62,150.32 L191.25,149.82 L192.88,149.33 L194.50,148.83 L196.13,148.33 L197.75,147.83 L199.38,147.34 L201.00,146.84 L202.62,146.34 L204.25,145.84 L205.88,145.35 L207.50,144.85 L209.12,144.35 L210.75,143.85 L212.38,143.36 L214.00,142.86 L215.62,142.36 L217.25,141.87 L218.88,141.37 L220.50,140.87 L222.13,140.37 L223.75,139.88 L225.38,139.38 L227.00,138.88 L228.63,138.38 L230.25,137.88 L231.88,137.39 L233.50,136.89 L235.12,136.39 L236.75,135.89 L238.38,135.40 L240.00,134.90 L241.63,134.40 L243.25,133.90 L244.88,133.41 L246.50,132.91 L248.12,132.41 L249.75,131.91 L251.37,131.42 L253.00,130.92 L254.63,130.42 L256.25,129.93 L257.88,129.43 L259.50,128.93 L261.12,128.43 L262.75,127.94 L264.38,127.44 L266.00,126.94 L267.62,126.44 L269.25,125.95 L270.88,125.45 L272.50,124.95 L274.12,124.45 L275.75,123.95 L277.38,123.46 L279.00,122.96 L280.62,122.46 L282.25,121.96 L283.88,121.47 L285.50,120.97 L287.12,120.47 L288.75,119.97 L290.38,119.48 L292.00,118.98 L293.62,118.48 L295.25,117.98 L296.88,117.49 L298.50,116.99 L300.12,116.49 L301.75,115.99 L303.38,115.50 L305.00,115.00" stroke="var(--sci-accent)" strokeWidth="2.5" fill="none" /><text x="45" y="252">solid: bias bound α (s = 2)</text><path d="M45.00,68.51 L46.62,110.56 L48.25,127.27 L49.88,136.85 L51.50,143.25 L53.12,147.92 L54.75,151.52 L56.38,154.40 L58.00,156.77 L59.62,158.78 L61.25,160.49 L62.88,161.99 L64.50,163.30 L66.12,164.47 L67.75,165.52 L69.38,166.47 L71.00,167.33 L72.62,168.12 L74.25,168.84 L75.88,169.51 L77.50,170.13 L79.12,170.71 L80.75,171.25 L82.38,171.75 L84.00,172.23 L85.62,172.67 L87.25,173.09 L88.88,173.49 L90.50,173.87 L92.12,174.22 L93.75,174.56 L95.38,174.89 L97.00,175.20 L98.62,175.49 L100.25,175.77 L101.88,176.04 L103.50,176.30 L105.12,176.55 L106.75,176.79 L108.38,177.02 L110.00,177.24 L111.62,177.46 L113.25,177.66 L114.88,177.86 L116.50,178.06 L118.12,178.24 L119.75,178.42 L121.38,178.60 L123.00,178.76 L124.62,178.93 L126.25,179.09 L127.88,179.24 L129.50,179.39 L131.12,179.54 L132.75,179.68 L134.38,179.82 L136.00,179.95 L137.62,180.08 L139.25,180.21 L140.88,180.33 L142.50,180.45 L144.12,180.57 L145.75,180.69 L147.38,180.80 L149.00,180.91 L150.62,181.02 L152.25,181.12 L153.88,181.23 L155.50,181.33 L157.12,181.42 L158.75,181.52 L160.38,181.61 L162.00,181.71 L163.62,181.80 L165.25,181.89 L166.88,181.97 L168.50,182.06 L170.12,182.14 L171.75,182.22 L173.38,182.30 L175.00,182.38 L176.62,182.46 L178.25,182.54 L179.88,182.61 L181.50,182.68 L183.12,182.76 L184.75,182.83 L186.38,182.90 L188.00,182.96 L189.62,183.03 L191.25,183.10 L192.88,183.16 L194.50,183.23 L196.13,183.29 L197.75,183.35 L199.38,183.41 L201.00,183.47 L202.62,183.53 L204.25,183.59 L205.88,183.65 L207.50,183.70 L209.12,183.76 L210.75,183.81 L212.38,183.87 L214.00,183.92 L215.62,183.97 L217.25,184.03 L218.88,184.08 L220.50,184.13 L222.13,184.18 L223.75,184.23 L225.38,184.27 L227.00,184.32 L228.63,184.37 L230.25,184.41 L231.88,184.46 L233.50,184.51 L235.12,184.55 L236.75,184.59 L238.38,184.64 L240.00,184.68 L241.63,184.72 L243.25,184.77 L244.88,184.81 L246.50,184.85 L248.12,184.89 L249.75,184.93 L251.37,184.97 L253.00,185.01 L254.63,185.04 L256.25,185.08 L257.88,185.12 L259.50,185.16 L261.12,185.19 L262.75,185.23 L264.38,185.27 L266.00,185.30 L267.62,185.34 L269.25,185.37 L270.88,185.41 L272.50,185.44 L274.12,185.48 L275.75,185.51 L277.38,185.54 L279.00,185.57 L280.62,185.61 L282.25,185.64 L283.88,185.67 L285.50,185.70 L287.12,185.73 L288.75,185.76 L290.38,185.79 L292.00,185.82 L293.62,185.85 L295.25,185.88 L296.88,185.91 L298.50,185.94 L300.12,185.97 L301.75,186.00 L303.38,186.03 L305.00,186.06" stroke="var(--sci-secondary)" strokeWidth="2.5" fill="none" strokeDasharray="5 4" /><text x="45" y="270">dashed: noise δ/(2√α)</text></svg></div>
</div>
</Figure>

The smallest singular values are suppressed rather than accurately inverted. Increasing α lowers noise amplification but raises bias; the derivation below quantifies a schedule that sends both to zero.

<span data-es98a-source="es98a-filter-balance:end" />

Follow the bias and noise vectors separately for those same data. Their norms compete as alpha changes, but the final error is the norm of their vector sum. This distinction explains why an upper bound need not trace the realised error exactly.

<ES98AAnimation kind="bias-noise" />

<h3 id="convergence-without-a-rate-then-a-source-condition">Convergence without a rate, then a source condition</h3>

For a fixed recoverable $u$, each bias factor tends to zero and is bounded by one. Dominated convergence for the summable series $\sum_n|u_n|^2$ gives bias convergence without an extra smoothness assumption. Thus

$$
\alpha(\delta)\to0,\qquad \delta/\sqrt{\alpha(\delta)}\to0
\quad\Longrightarrow\quad u_{\alpha(\delta)}\to u.
$$

A **source condition** gives a quantitative rate uniformly over a smoother class. Define

$$
M_s^2:=\sum_n\frac{|u_n|^2}{\sigma_n^{2s}}<\infty,\qquad s>0.
$$

For $0<s\le2$, put $t=\sqrt\alpha r$. Then

$$
\frac{\alpha t^s}{t^2+\alpha}
=\alpha^{s/2}\frac{r^s}{1+r^2}\le\alpha^{s/2},
$$

because $r^s\le1+r^2$. Consequently,

$$
\|u_\alpha-u\|^2\le2\alpha^s M_s^2+\frac{\delta^2}{2\alpha}.
$$

Balancing the two terms gives $\alpha\asymp\delta^{2/(s+1)}$ and norm error $O(\delta^{s/(s+1)})$, with fixed source bound. For $s>2$, use $t\le\|A\|$ to obtain

$$
\frac{\alpha t^s}{t^2+\alpha}\le\alpha\|A\|^{s-2}.
$$

The bias bound saturates at order $\alpha$ for ordinary Tikhonov; the source's supremum over all $t>0$ was infinite for $s>2$. This restriction is not a technicality: a smoother truth does not remove the filter's limited qualification.

**Exercise.** Let $\sigma_n=1/n$ and put noise of size $\delta$ in a single output mode. Compare the unregularised error $\delta n$ with the regularised error $\delta n/(1+\alpha n^2)$. Which mode is most amplified? [Week 9](/notes/es98a/week9) turns this balance into parameter-choice rules and then a distribution over reconstructions.
