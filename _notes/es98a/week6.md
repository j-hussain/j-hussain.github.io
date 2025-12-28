---
layout: page
title: "Week 6: Kernels and RKHS: approximation geometry + random-function basics"
---

## Week 6

- Special classes of compact operators: trace-class and Hilbert–Schmidt operators.
- Integral kernels and integral operators.
- Reproducing kernel Hilbert spaces.
- Orthogonal projection (again).
- Probability on function spaces: perspectives on random fields.
- **NB** Handout on **Kolmogorov’s two-series theorem** on convergence/summability of series of independent random variables, needed for Assignment 3.

## Special classes of compact operators

Recall from last time: a linear operator $A:H_1\to H_2$ is compact if and only if it has an SVD of the form $$A=\sum_{n\in\mathbb{N}}\sigma_n\,\phi_n\otimes\psi_n, \qquad\text{i.e.}\qquad Au=\sum_n \sigma_n\langle \phi_n,u\rangle_{H_1}\,\psi_n,$$ with
- $\sigma_n\ge 0$ non-negative singular values, $\sigma_n\to 0$ as $n\to\infty$,
- singular vectors $\phi_n$ orthonormal in $H_1$,
- $\psi_n$ orthonormal in $H_2$,
- and $$\left\|A-\sum_{n=1}^N \sigma_n\,\phi_n\otimes\psi_n\right\|_{\mathrm{op}}\to 0 \quad\text{as }N\to\infty.$$ The singular value sequence $(\sigma_n)$ can be used to characterize even nicer classes of operators:

### Hilbert–Schmidt operators

If $$\sum_n \sigma_n^2<\infty,$$ then $A$ is called a **Hilbert–Schmidt** operator.

The space $S^2(H_1,H_2)$ of H–S operators from $H_1$ into $H_2$ actually forms a Hilbert space with inner product $$\langle A,B\rangle_{S^2} :=\sum_n \langle A\gamma_n,\,B\gamma_n\rangle_{H_2},$$ for any choice of CONB $(\gamma_n)_n$ of $H_1$ (every choice gives the same value), and induced norm $$\|A\|_{S^2}:=\sqrt{\sum_n \|A\gamma_n\|_{H_2}^2}.$$ (“$\sim$ Frobenius norm”)

It turns out that $S^2(H_1,H_2)$ is just the Hilbert tensor product space $H_1\otimes H_2$ from earlier.

### Trace-class (nuclear) operators

If $$\sum_n \sigma_n<\infty,$$ then $A$ is called **trace class** (or **nuclear**).

The norm on the class $S^1(H_1,H_2)$ of trace-class operators from $H_1$ into $H_2$ is $$\|A\|_{S^1} :=\sum_n \left\langle (A^*A)^{1/2}\gamma_n,\ \gamma_n\right\rangle_{H_1},$$ for any CONB $(\gamma_n)_n$ of $H_1$.

More practically, in the case that $A$ is self-adjoint with real eigenvalues $(\lambda_n)_n$, $$\|A\|_{S^1}=\sum_n |\lambda_n|.$$ **In summary:** $$S^1 \subseteq S^2 \subseteq \{\text{all compact operators}\} \subseteq \{\text{all bounded linear operators}\} \subseteq \{\text{all linear operators}\}.$$ ## Hilbert scales induced by compact operators

Similarly to the construction of the Sobolev scale (earlier in one variable): any compact SPD operator $$A:H^0\to H^0$$ defined on a Hilbert space $H^0$ induces a scale of new Hilbert spaces $H^s$, $s\in\mathbb{R}$, via $$\langle u,v\rangle_{H^s} :=\langle A^{-s}u,\ A^{-s}v\rangle_{H^0},$$ for those $u,v$ for which this is finite.

More concretely, if $$A=\sum_n \lambda_n\,\gamma_n\otimes\gamma_n$$ with eigenvalues $\lambda_n\to 0$ and eigenvectors $\gamma_n$, then $H^s$ consists of those $$u=\sum_n u_n\gamma_n$$ for which $$\left\|\sum_n u_n\gamma_n\right\|_{H^s}^2 = \left\|A^{-s}\sum_n u_n\gamma_n\right\|_{H^0}^2 = \left\|\sum_n \lambda_n^{-s}u_n\gamma_n\right\|_{H^0}^2 = \sum_n \frac{|u_n|^2}{\lambda_n^{2s}}<\infty.$$ Being in $H^s$ turns out to be important when trying to recover $u$ from a noisy observation of $Au$.

**Example (inverse negative Laplacian).** Let $H^0=L^2([0,2\pi];\mathbb{C})$ be the space of square-integrable, mean-zero, $2\pi$-periodic functions with Fourier CONB $$\gamma_n(t):=\frac{1}{\sqrt{2\pi}}e^{int}, \qquad n\in\mathbb{Z}\setminus\{0\}.$$ These $\gamma_n$ are eigenfunctions for the second derivative / Laplacian operator: $$\Delta\gamma_n=\gamma_n''=-n^2\gamma_n.$$ Thus, $\Delta$ has eigenvalues $-n^2$ with eigenfunctions $\gamma_n$, and $(-\Delta)^{-1}$ has eigenvalues $\frac{1}{n^2}$.

Note that, since $$\sum_{n\ne 0}\frac{1}{n^2}=\frac{\pi^2}{3}<\infty,$$ $(-\Delta)^{-1}$ is a trace-class operator.

## Kernels and integral operators

Given a set $X$, a **kernel** on $X$ is just a function $$k:X\times X\to\mathbb{R}.$$ The kernel is called **SPD/SPSD** if, for any $n\in\mathbb{N}$ and distinct points $x_1,\ldots,x_n\in X$, the matrix $$\begin{pmatrix} k(x_1,x_1) & k(x_1,x_2) & \cdots & k(x_1,x_n)\\ \vdots & \vdots & \ddots & \vdots\\ k(x_n,x_1) & k(x_n,x_2) & \cdots & k(x_n,x_n) \end{pmatrix} \in\mathbb{R}^{n\times n}$$ is SPD/SPSD.

Now fix a (bounded, measurable) set $X\subseteq\mathbb{R}^d$ and a kernel $k$ on $X$. The induced **integral operator** $I_k$ is $$(I_k u)(x):=\int_X k(x,y)\,u(y)\,dy,$$ for $x\in X$ and $u:X\to\mathbb{R}$. Think of this $I_k$ as a blurring operator that “thins” an input image $u$ to produce a new one $I_k u$ by averaging against $k$.

**Theorem.** Let $k$ be a square-integrable kernel on $X$, i.e. $$\int_{X\times X} |k(x,y)|^2\,dx\,dy=\|k\|_{L^2(X^2)}^2<\infty.$$ Then
1. $I_k$ is a bounded linear operator from the Hilbert space $L^2(X)$ of square-integrable signals into $L^2(X)$ with $$\|I_k\|_{\mathrm{op}}\le \|k\|_{L^2(X^2)};$$ 2. $I_k$ is compact;
3. the adjoint of $I_k$ is $$(I_k^*u)(x)=\int_X k(y,x)\,u(y)\,dy;$$    in particular, if $k$ is a symmetric kernel, then $I_k$ is a self-adjoint operator;
4. $I_k$ is Hilbert–Schmidt with $$\|I_k\|_{S^2}=\|k\|_{L^2(X^2)};$$ 5. every H–S operator $T:L^2(X)\to L^2(X)$ is of this form, i.e. there exists $k$ s.t. $T=I_k$;
6. if $$\int_X |k(x,x)|\,dx<\infty,$$    then $I_k$ is trace-class and its trace is $$\mathrm{tr}(I_k)=\int_X k(x,x)\,dx$$    and $$\|I_k\|_{S^1}=\int_X |k(x,x)|\,dx.$$ ## Positivity, Mercer representation

There is an elegant connection between positivity of the kernel and the operator:

**Theorem.** Let $k$ be a continuous and symmetric kernel on a closed, bounded set $X\subseteq\mathbb{R}^d$. Then $k$ is SPSD if and only if $I_k$ is SPSD on $L^2(X)$.

Also, if all but finitely many of the eigenvalues $\lambda_n$ of $I_k$ (with eigenfunctions $\phi_n$) have the same sign, then the $\phi_n$ with $\lambda_n\ne 0$ must be continuous and we have $$k(x,y)=\sum_n \lambda_n\,\phi_n(x)\phi_n(y).$$ (Mercer–Schmidt representation)

## Reproducing kernel Hilbert spaces

A Hilbert space $\mathcal{H}$ of real-valued functions defined on a set $X$ is called a **RKHS** if one/all of these equivalent conditions hold:

1. for every $x\in X$, the point evaluation functional $\delta_x:\mathcal{H}\to\mathbb{R}$, $$\delta_x u := u(x),$$    is a bounded linear functional, i.e. there is a constant $C(x)$ s.t. $$|u(x)|\le C(x)\|u\|_{\mathcal{H}};$$ 2. there is a canonical feature map $\varphi:X\to\mathcal{H}$ s.t. $$\langle \varphi(x),u\rangle_{\mathcal{H}}=u(x) \qquad\text{for all }x\in X,\ u\in\mathcal{H};$$ 3. there is a function $k:X\times X\to\mathbb{R}$, a **reproducing kernel**, s.t. $k(x,\cdot)\in\mathcal{H}$ for all $x\in X$ and $$\langle k(x,\cdot),u\rangle_{\mathcal{H}}=u(x) \qquad\text{for all }x\in X,\ u\in\mathcal{H}.$$    (Note: $k(x,\cdot)$ is $\varphi(x)$.)

**The Moore–Aronszajn theorem** states that, for every SPD $k$, there is a unique RKHS $\mathcal{H}=\mathcal{H}_k$ satisfying the above — we call it the **native space** of the kernel.

Think of the native space as the span of all the feature vectors $\varphi(x_i)$, $x_i\in X$, with inner product $$\left\langle \sum_m \alpha_m\varphi(x_m),\ \sum_n \beta_n\varphi(y_n)\right\rangle_{\mathcal{H}_k} = \sum_{m,n}\alpha_m\beta_n\,k(x_m,y_n).$$ (“The kernel trick”: using $\langle \varphi(x),\varphi(y)\rangle = k(x,y)$.)

**Theorem.** Let $X$ be closed and bounded in $\mathbb{R}^d$ and let $k$ be continuous and SPD. Let $I_k$ have eigenvalues $\lambda_n>0$ and orthonormal eigenfunctions $\gamma_n$. Then $$\mathcal{H}_k = \left\{u=\sum_n u_n\gamma_n\ \middle|\ \sum_n \frac{|u_n|^2}{\lambda_n}<\infty\right\},$$ with $$\left\langle \sum_n u_n\gamma_n,\ \sum_n v_n\gamma_n\right\rangle_{\mathcal{H}_k} = \sum_n \frac{u_n v_n}{\lambda_n}.$$ In other words, $\mathcal{H}_k$ is exactly $H^{1/2}$ in the scale induced by $I_k$ on $H^0=L^2(X)$.

## Orthogonality and closest-point approximation in Hilbert spaces

Recall that $u,v\in\mathcal{H}$ are orthogonal, denoted $u\perp v$, if $$\langle u,v\rangle_{\mathcal{H}}=0;$$ they are orthonormal if they are orthogonal and have unit norm.

The orthogonal complement of $S\subseteq\mathcal{H}$ is $$S^\perp := \{u\in\mathcal{H}\mid u\perp s\ \text{for all }s\in S\}.$$ Nice properties:
- For any $S\subseteq\mathcal{H}$, $S^\perp$ is a closed linear subspace of $\mathcal{H}$ (i.e. every sequence in $S^\perp$ that converges has its limit in $S^\perp$).
- For any closed linear subspace $S$ of $\mathcal{H}$, $S^{\perp\perp}=S$.
- For a linear subspace $S$ of $\mathcal{H}$, $S^{\perp\perp}=\overline{S}$, the closure of $S$ in $\mathcal{H}$.
- For a bounded linear operator $A:H_1\to H_2$ with adjoint $A^*:H_2\to H_1$: $$(\mathrm{ran}\,A)^\perp=\ker A^*, \qquad (\mathrm{ran}\,A^*)^\perp=\ker A,$$ $$(\ker A^*)^\perp=\overline{\mathrm{ran}\,A}, \qquad (\ker A)^\perp=\overline{\mathrm{ran}\,A^*}.$$ - $\Psi\subseteq\mathcal{H}$ forms a CONB if and only if the vectors $\psi_i\in\Psi$ are orthonormal and $\Psi^\perp=\{0\}$.

A very nice property of Hilbert spaces is that, given any closed subspace $S$ of $\mathcal{H}$, every $u\in\mathcal{H}$ can be decomposed uniquely as $$u=s' + s^\perp$$ with $s'\in S$ and $s^\perp\in S^\perp$. (Note that $S\cap S^\perp=\{0\}$.)
We say that $\mathcal{H}$ is the orthogonal direct sum of $S$ and $S^\perp$, denoted $$\mathcal{H}=S\oplus S^\perp.$$ ## Orthogonal projection theorem

The operation $P_S:u\mapsto s'$ is
- a bounded linear operator $P_S:\mathcal{H}\to\mathcal{H}$ with $\mathrm{ran}\,P_S=S$;
- $P_S P_S = P_S$ and indeed $P_S u=u$ for $u\in S$;
- $P_S^*=P_S$ and $P_S$ is positive semi-definite;
- for all $u_1,u_2\in\mathcal{H}$, $$\|P_Su_1-P_Su_2\|\le \|u_1-u_2\| \quad\text{and so}\quad \|P_S\|_{\mathrm{op}}\le 1;$$ - **optimal/closest-point approximation:** for all $u\in\mathcal{H}$, $$\|u-P_Su\|=\min_{s\in S}\|u-s\|;$$ - $s=P_Su \iff s\in S$ and the residual $s-u$ is $\perp$ to $S$;
- $I-P_S=P_{S^\perp}$.

An important consequence of the optimal approximation property is that the optimal approximation of $u\in\mathcal{H}$ given as $$u=\sum_{n=1}^\infty u_n\psi_n$$ in terms of a CONB within $$S:=\mathrm{span}\{\psi_1,\ldots,\psi_N\}$$ is just truncating the expansion to $N$ terms: $$\arg\min_{s=\sum_{n=1}^N a_n\psi_n\in S}\|u-s\| = \sum_{n=1}^N u_n\psi_n.$$ ## A “teaser” for least-squares inverse problems

Suppose that $A:H_1\to H_2$ with closed range and $y\in H_2$ are given. Suppose that we seek $u\in H_1$ to solve $$Au=y.$$ This is impossible if $y\notin\mathrm{ran}\,A$, so we relax the problem and seek $u\in H_1$ to minimize $$\|Au-y\|_{H_2},$$ i.e. find the closest point of $\mathrm{ran}\,A$ to $y$.

Equivalently, minimize $$\Phi(u):=\frac{1}{2}\|Au-y\|_{H_2}^2.$$ Just as in the finite-dimensional case, $$u\ \text{minimizes }\Phi \iff \nabla\Phi(u)=0 \iff A^*Au - A^*y = 0,$$ i.e. we need to solve the **normal equations** $$A^*Au=A^*y.$$ If $A$ has finite rank, $\dim(\mathrm{ran}\,A)=r$ say, then $\mathrm{ran}\,A$ is closed. If $A$ has SVD $$A=\sum_{i=1}^r \sigma_i\,\phi_i\otimes\psi_i,$$ then the normal equations are solved by $$u=A^\dagger y =\sum_{i=1}^r \sigma_i^{-1}\,\psi_i\otimes\phi_i\,y =\sum_{i=1}^r \frac{\langle \phi_i,y\rangle}{\sigma_i}\,\psi_i.$$ Unfortunately, most problems of physical interest involve forward operators $A$ that are compact but with non-closed infinite-dimensional range, e.g. integral operators $I_k$ from earlier. What do we do in such cases??

**To BE CONTINUED** (in the chapter on inverse problems).
