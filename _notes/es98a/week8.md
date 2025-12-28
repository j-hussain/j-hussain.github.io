---
layout: page
title: "Week 8: Regression and inverse problems: pseudoinverses + regularisation as optimisation"
---

# Week 8

- Optimisation approach to inverse problems
- Least squares and generalised linear regression
- Ill-posedness of inverse problems
- Generalised inverses
- Regularisation: Tikhonov regularisation (ridge regression) and other examples

Simply put, an inverse problem means fitting/learning unknown parameters in a mathematical model to best explain some data/observation about the system being modelled. (Sometimes we distinguish between **parameter estimation** and **state estimation** for dynamical systems.)

Classic example: According to Hooke's law, for a linear elastic material, the force $F$ applied to stretch a material and the resulting extension/strain $\varepsilon$ are proportional. Writing $\sigma:=F/A$, $A$ being the cross-sectional area of the material, $\sigma=E\varepsilon$, with $\sigma$ being the stress, $\varepsilon$ the strain, and $E$ the Young's modulus for the material. We can apply known forces and measure extension to get a data set $(\varepsilon_j,\sigma_j)_{j=1}^J$ and find an $E$ that "best" explains the data. A classic choice for "best" is an $E$ that minimises the sum of squared residuals $$\Phi(E):=\sum_{j=1}^J|\sigma_j-E\varepsilon_j|^2.$$

**NB** In reality, this will be an overdetermined problem: there will be no $E$ s.t. $\sigma_j=E\varepsilon_j$ for all $j$; $\min \Phi>0$.

This is a simple example of linear regression: given a set of $J$ input-output pairs $(x_j,y_j)$, find a constant $\theta\in\mathbb{R}$ such that $$\Phi(\theta):=\frac{1}{2}\sum_{j=1}^J|\theta x_j-y_j|^2=\frac{1}{2}\|x\theta-y\|_2^2$$ is minimised. (Here $x=(x_1,\ldots,x_J)$ and $y=(y_1,\ldots,y_J)$.)

As a mild generalisation, we can do linear regression with an intercept that does not have to be zero: we seek $\theta=(\theta_0,\theta_1)^T\in\mathbb{R}^2$ — the model now is $y^j=\theta_0+\theta_1 x_j$ — to minimise $$\Phi(\theta):=\frac{1}{2}\sum_{j=1}^J|\theta_0+\theta_1 x_j-y_j|^2=\frac{1}{2}\|\theta_0(1,\ldots,1)^T+\theta_1 x-y\|_2^2,$$ $$=\frac{1}{2}\left\|\begin{pmatrix}1&x_1\\ \vdots&\vdots\\ 1&x_J\end{pmatrix}\begin{pmatrix}\theta_0\\ \theta_1\end{pmatrix}-\begin{pmatrix}y_1\\ \vdots\\ y_J\end{pmatrix}\right\|_2^2.$$
(In the form that `numpy.linalg.lstsq` expects.)

We can take this a bit further and perform generalised linear regression for generalised linear models of the form $$y=\sum_{k=0}^K \theta_k f_k(x),$$ where the parameters $\theta_0,\ldots,\theta_K\in\mathbb{R}$ appear linearly, and the $f_0,\ldots,f_K:\mathbb{R}\to\mathbb{R}$ are possibly nonlinear feature functions. Classic example of a GLM is a Fourier series, with $f_k(x)=e^{ikx}$.

The misfit function $\Phi:\mathbb{R}^{K+1}\to\mathbb{R}_{\ge 0}$ that needs to be minimised here is again a sum of squared residuals $$\Phi(\theta)=\frac{1}{2}\sum_{j=1}^J\left|\sum_{k=0}^K \theta_k f_k(x_j)-y_j\right|^2=\frac{1}{2}\left\|\begin{pmatrix}
f_0(x_1) & f_1(x_1) & \cdots & f_K(x_1)\\
\vdots & \vdots & \ddots & \vdots\\
f_0(x_J) & f_1(x_J) & \cdots & f_K(x_J)
\end{pmatrix}
\begin{pmatrix}\theta_0\\ \theta_1\\ \vdots\\ \theta_K\end{pmatrix}
-
\begin{pmatrix}y_1\\ \vdots\\ y_J\end{pmatrix}
\right\|_2^2.$$
The matrix above is the **feature matrix** or **design matrix** (or “Vandermonde matrix” if the $f_k$ are polynomials).

All of the above is motivation for, and special cases of, the following:

- (**problem setup**) Given Hilbert spaces $H_1$ and $H_2$, and a linear operator $A:H_1\to H_2$ (usually a compact op.) and $y\in H_2$,
- (**solution**) find $u\in H_1$
- s.t. $\frac{1}{2}\|Au-y\|_{H_2}^2$ is minimised.

(We call $A$ the forward operator.)

Mathematical forward problems are usually well posed: Hadamard called a problem well posed if
1. For each problem setup, a solution exists
2. That solution is unique
3. This unique solution depends “nicely”/stably (e.g. continuously or differentiably) on the problem setup.

However, inverse problems are typically ill posed and violate one or more of Hadamard’s criteria. Just think of over- and under-determined linear systems to see why the eqn $Au=y$ cannot typically be solved for $u$ in a stable way. (Even the minimisation problem is a relaxation of the original goal of solving an equation exactly.)

## Generalised inverses for compact linear inverse problems

We’d like to solve the equation $Au=y$ for $u\in H_1$ given a compact linear op. $A:H_1\to H_2$ and $y\in H_2$. This may be impossible, e.g. if $y\notin\mathrm{ran}(A)$, cf. Hadamard (1). If $A$ is not injective, i.e. if $\ker(A)\ne\{0\}$, then solutions are not unique, cf. Hadamard (2). And what about (3)?

The situation is not hopeless: we relax the problem and seek $u$ to minimise $$\frac{1}{2}\|Au-y\|_{H_2}^2=: \Phi(u).$$ As we have seen, minimisers of $\Phi$ are exactly solutions of $\nabla\Phi(u)=0$, i.e. solutions of the normal equations $$A^*Au=A^*y.$$

If we have the SVD $$A=\sum_{n\in\mathbb{N}} \sigma_n\,\phi_n\otimes\psi_n,$$ then we have that $u$ is given by $$u=A^\dagger y=\sum_{n\in\mathbb{N}}\frac{1}{\sigma_n}\langle \psi_n,y\rangle_{H_2}\,\phi_n\quad (*),$$ where $$A^\dagger=\sum_{n\in\mathbb{N}}\frac{1}{\sigma_n}\,\psi_n\otimes\phi_n.$$ (**Moore–Penrose pseudoinverse / generalised inverse of $A$**)

Two issues present themselves:
1. The expansion (*) for $u$ only converges in $H_1$ if the data $y\in H_2$ satisfies the Picard condition $$\|A^\dagger y\|_{H_1}^2=\sum_{n\in\mathbb{N}}\frac{|\langle \psi_n,y\rangle_{H_2}|^2}{\sigma_n^2}<\infty.$$
   (Parseval)

   So $A^\dagger$ is not a globally-defined operator $H_2\to H_1$; it is only defined on a domain $\mathrm{dom}(A^\dagger)\subseteq H_2$ on which the Picard condition holds.
2. $A^\dagger:\mathrm{dom}(A^\dagger)\subseteq H_2\to H_1$ is an unbounded operator: there is no finite constant $C$ s.t. $$\|A^\dagger y-A^\dagger(y+\delta y)\|\le C\|\delta y\|.$$
   (The only way this can hold is the “boring” case that $A$ has finite rank $r$, in which case $C=\|A^\dagger\|_{\mathrm{op}}=\sigma_r^{-1}$; otherwise $\|A^\dagger\|_{\mathrm{op}}=(\min_n \sigma_n)^{-1}=\sigma^{-1}=\infty$.) Thus $A^\dagger y$ is highly sensitive to small perturbations of the data $y$, cf. Hadamard (3).

Despite these issues, $A^\dagger$ does have many nice properties, e.g. $$A A^\dagger A=A,\qquad A^\dagger A A^\dagger=A^\dagger,$$ $$A^\dagger A=P_{(\ker A)^\perp},\qquad A A^\dagger=P_{\overline{\mathrm{ran}\,A}}\big|_{\mathrm{dom}\,A^\dagger}.$$

Furthermore, if we set $u^+:=A^\dagger y$, then $$\arg\min \Phi=\{u\in H_1:\|Au-y\|_{H_2}^2\text{ is minimised}\}=u^+ + \ker A,$$ and $u^+$ minimises $\|u\|_{H_1}$ in this set. That is, among all solutions to the least squares problem, $A^\dagger y$ is the “smallest”, the closest to the origin in $H_1$.

## Regularisation

This all leads to the idea of regularisation: we approximate the partially-defined unbounded op. $A^\dagger:\mathrm{dom}(A^\dagger)\subseteq H_2\to H_1$ by a family of bounded operators $G_\alpha:H_2\to H_1$, with $\alpha>0$ being a regularisation parameter. Note that $\|G_\alpha\|_{\mathrm{op}}\to +\infty=\|A^\dagger\|_{\mathrm{op}}$ as $\alpha\to 0$. We ask only that $$G_\alpha y \to A^\dagger y\quad\text{as }\alpha\to 0$$ for all $y\in\mathrm{dom}(A^\dagger)$.

There’s clearly a lot of flexibility here. An accessible example is Tikhonov regularisation / ridge regression.

### Tikhonov regularisation

Although there are many ways to regularise inverse problems, an accessible first approach to consider is Tikhonov regularisation.

Instead of minimising the misfit functional $$\Phi(u):=\frac{1}{2}\|Au-y\|_{H_2}^2$$ w.r.t. $u\in H_1$, we minimise $$\Phi_\alpha(u):=\frac{1}{2}\|Au-y\|_{H_2}^2+\frac{\alpha}{2}\|u\|_{H_1}^2,$$ with $\alpha>0$ a regularisation parameter. Small $\alpha$ promotes fidelity to the data, with a risk of overfitting; large $\alpha$ promotes a stable, small solution regardless of the data.

We can derive Tikhonov-regularised normal equations: $$u_\alpha\text{ minimises }\Phi_\alpha \iff \nabla\Phi_\alpha(u_\alpha)=0 \iff A^*A u_\alpha - A^*y + \alpha u_\alpha = 0 \iff (A^*A+\alpha I)u_\alpha=A^*y \iff u_\alpha=(A^*A+\alpha I)^{-1}A^*y.$$

Since $A^*A+\alpha I$ is SPD, and hence invertible. Indeed, the operator $$G_\alpha:=(A^*A+\alpha I)^{-1}A^*$$ is a regularisation of $A^\dagger$ in the sense introduced above:
- $G_\alpha:H_2\to H_1$ is a bounded op. with $\|G_\alpha\|_{\mathrm{op}}\sim \alpha^{-1}$;
- for $y\in H_2$ satisfying the Picard cond., $G_\alpha y \to A^\dagger y$ as $\alpha\to 0$.

In terms of an SVD $A=\sum_{n\in\mathbb{N}}\sigma_n\,\phi_n\otimes\psi_n$ with $\sigma_n\to 0$, $\phi_n$ orthonormal in $H_1$, and $\psi_n$ orthonormal in $H_2$, $A^\dagger$ is given by $$A^\dagger=\sum_{n\in\mathbb{N}}\sigma_n^{-1}\,\psi_n\otimes\phi_n,\quad\text{i.e. }A^\dagger y=\sum_{n\in\mathbb{N}}\frac{\langle \psi_n,y\rangle}{\sigma_n}\,\phi_n.$$

On the other hand, $$u_\alpha=G_\alpha y=\sum_{n\in\mathbb{N}}\frac{\sigma_n}{\sigma_n^2+\alpha}\langle \psi_n,y\rangle\,\phi_n=\sum_{n\in\mathbb{N}} g_\alpha(\sigma_n)\langle \psi_n,y\rangle\,\phi_n,$$ where $g_\alpha:[0,\infty)\to(0,\infty)$ is the regularisation function or filter function.

This is an example of spectral regularisation, replacing the “ideal” filter function $$g_0(\sigma):=\begin{cases}1/\sigma & \sigma>0\\ 0 & \sigma=0\end{cases}$$ by something smoother and bounded.

Other classic examples of filter functions and spectral regularisation include
- $$g_\alpha(\sigma):=\frac{1}{\sigma+\alpha}\qquad\text{“zeroth-order” Tikhonov reg / Lavrentiev reg},$$
- $$g_\alpha(\sigma):=\begin{cases}1/\sigma & \sigma>\alpha\\ 0 & \sigma<\alpha\end{cases}\qquad\text{spectral truncation / spectral cutoff / principal component analysis (PCA)}.$$

Clearly, the choice of $\alpha$ plays an important role. Often, $\alpha$ is chosen to depend upon the quality/amount of data available.
- Inv. probs: $y=Au+\eta$ with observational noise $\eta$ of “size” $\delta>0$; choose $\alpha(\delta)\to 0$ as $\delta\to 0$.
- Statistics and machine learning: $n$ noisy observations at a fixed noise level; choose $\alpha(n)\to 0$ as $n\to\infty$.

The choice of $\alpha$ as a function of $\delta$ or $n$ is called a regularisation schedule. When coupled with source conditions of the form $$\sum_{n\in\mathbb{N}} \frac{|\langle \phi_n,u\rangle|^2}{\sigma_n^s}<\infty,$$ we can bound the reconstruction error $G_\alpha y-u$ and show that $\|G_{\alpha(\delta)}y-u\|\to 0$ as $\delta\to 0$ for an appropriate schedule. See handout!

## Sparsity and edge preserving regularisation

We can consider more general penalties/regularisations: find $u_R$ to minimise $$\Phi(u)+R(u)$$ with $R:H_1\to[0,\infty]$ some regularisation function.

In some situations, we have a prior belief that $u=\sum_n u_n\psi_n$ should be “simple” or “sparse”, i.e. most $u_n=0$. It turns out that a choice of $R$ that promotes sparsity in the minimiser is the $\ell^1$-norm or Manhattan norm of $u$ $$\|u\|_1:=\sum_{n\in\mathbb{N}}|u_n|,$$ $$R(u)=\alpha\sum_n |u_n|.$$
This is known as sparse regularisation, $\ell^1$ regularisation, or the LASSO.

## Source conditions and why they matter for convergence of regularised reconstructions

Consider the inverse problem of recovering $u\in H$ from $y\in Y$, given the linear model $$y=Au+\eta,\qquad A:H\to Y\ \text{compact}.$$ We will use a regularised reconstruction:

$A$ has SVD $$A=\sum_{n\in\mathbb{N}}\sigma_n\,\phi_n\otimes\psi_n,$$ and $$u\approx u_\alpha:=g_\alpha(A)y=\sum_{n\in\mathbb{N}} g_\alpha(\sigma_n)\,\psi_n\otimes\phi_n\,y=\sum_{n\in\mathbb{N}} g_\alpha(\sigma_n)\,\langle \psi_n,y\rangle_Y\,\phi_n.$$

Assume that $\|\eta\|_Y\le \delta$. How should we send $\alpha\to 0$ as $\delta\to 0$ to ensure that $u_{\alpha(\delta)}\to u$? Do we need any assumptions on $u$?

We will focus on Tikhonov regularisation, $$g_\alpha(\sigma):=\frac{\sigma}{\sigma^2+\alpha}.$$ Many generalisations are possible.

Consider the reconstruction error: $$u_\alpha-u=g_\alpha(A)y-u=(g_\alpha(A)A-I)u+\delta\,g_\alpha(A)\eta_0.$$

Try to bound this: $$\|u_\alpha-u\|_{H^0}^2\le 2\|(g_\alpha(A)A-I)u\|_H^2+2\|g_\alpha(A)\eta\|_H^2$$ $$=2\sum_{n\in\mathbb{N}}|g_\alpha(\sigma_n)\sigma_n-1|^2\,|\langle \phi_n,u\rangle|^2 \;+\; 2\sum_{n\in\mathbb{N}}|g_\alpha(\sigma_n)|^2\,|\langle \psi_n,\eta\rangle|^2$$ $$=2\sum_{n\in\mathbb{N}}\left(\frac{\alpha}{\sigma_n^2+\alpha}\right)^2|\langle \phi_n,u\rangle|^2 \;+\; 2\sum_{n\in\mathbb{N}}\frac{\sigma_n^2}{(\sigma_n^2+\alpha)^2}\,|\langle \psi_n,\eta\rangle|^2$$ $$\le 2\cdot 1\cdot \|u\|_H^2 \;+\; 2\max\!\left(1,\frac{1}{\alpha^2}\right)\|\eta\|_Y^2$$ $$\le 2\|u\|_H^2 \;+\; 2\delta^2\max\!\left(1,\frac{1}{\alpha^2}\right).$$

The bound in red is useless as $\alpha,\delta\to 0$ unless we make sure that $$\frac{\delta}{\alpha(\delta)}\to C\quad\text{as }\delta\to 0,$$ i.e. $\alpha(\delta)\to 0$ a bit slower than $\delta$. But we are still left with a constant $\|u\|_H^2$; how to get rid of it? We ask that $u$ lie in a better space than $H$ — we impose a **source condition**:

$$\|u_\alpha-u\|_{H^0}^2 \le 2\sum_{n\in\mathbb{N}}\left(\frac{\alpha}{\sigma_n^2+\alpha}\right)^2|\langle \phi_n,u\rangle|^2 \;+\; 2\sum_{n\in\mathbb{N}}\frac{\sigma_n^2}{(\sigma_n^2+\alpha)^2}\,|\langle \psi_n,\eta\rangle|^2$$
$$=2\sum_{n\in\mathbb{N}}\left(\frac{\alpha\,\sigma_n^s}{\sigma_n^2+\alpha}\right)^2\frac{|\langle \phi_n,u\rangle|^2}{\sigma_n^{2s}} \;+\; 2\sum_{n\in\mathbb{N}}\frac{\sigma_n^2}{(\sigma_n^2+\alpha)^2}\,|\langle \psi_n,\eta\rangle|^2$$
$$\le 2\alpha^2\left[\sup_{t>0}\left|\frac{t^s}{t^2+\alpha}\right|^2\right]\sum_{n\in\mathbb{N}}\frac{|\langle \phi_n,u\rangle|^2}{\sigma_n^{2s}} \;+\; 2\max(1,\alpha^{-2})\|\eta\|_Y^2.$$

(Blue note: If $s\ge 2$, then $\sup_{t>0}\left|\frac{t^s}{t^2+\alpha}\right|\le 1$, independent of $\alpha$. Also, $\sum_{n}\frac{|\langle \phi_n,u\rangle|^2}{\sigma_n^{2s}}$ is the norm of $u$ in $H^s$, in the Hilbert scale generated by $(A^*A)^{1/2}$.)

For $s>2$: $$\|u_\alpha-u\|_{H^0}^2 \le 2\alpha^2\cdot 1\cdot \|u\|_{H^s}^2 \;+\; 2\delta^2\max(1,\alpha^{-2}).$$

The **source condition** $u\in H^s$ allows us to drive the first term in the approx. error to zero as $\alpha\to 0$; the second term will also go to zero as long as we don't send $\alpha\to 0$ too fast relative to $\delta$.
