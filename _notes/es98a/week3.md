---
layout: page
title: "Week 3: Gaussian geometry and conditioning"
---

Suppose two sensors respond to the same uncertain state. Reading the first should tell us something about the second, but how much? A covariance records the coupling; a Gaussian model makes that coupling sufficient to calculate the entire conditional law.

We use [Week 2's probability space and covariance](/notes/es98a/week2#probability-finite-dimensional), [SVD](/notes/es98a/week2#the-singular-value-decomposition-svd) and [Week 1's matrix square roots](/notes/es98a/week1#positive). These prerequisites let us focus on how a Gaussian law changes when some of its coordinates are observed. Computing expectations under more general laws is the subject of Week 4.

<h2 id="gaussian-random-vectors-continued">Gaussian random vectors</h2>

<h3 id="build-the-distribution-before-writing-its-density">Build the distribution before writing its density</h3>

Let $z$ have independent standard normal coordinates and let $x=m+C^{1/2}z$, where $C$ is SPSD. An eigenvector of $C$ with eigenvalue $\lambda$ has standard deviation $\sqrt\lambda$. If $\lambda=0$, every draw has the same coordinate there. A Gaussian may consequently live on a lower-dimensional affine subspace and have no density relative to ambient volume.

The projection definition below includes this degenerate case. Think of $\ell$ as a measuring ruler: every scalar reading is normal, with a mean and variance determined by $m,C$.

We say that an $\mathbb{R}^n$-valued random variable/vector $\underline{x}$ follows a Gaussian/normal distribution with mean vector $m\in\mathbb{R}^n$ and covariance matrix $C\in\mathbb{R}^{n\times n}$, denoted

$$\underline{x}\sim\mathcal{N}(m,C),$$

if (equivalently)

1. for every $\ell\in\mathbb{R}^n$, $\ell\cdot \underline{x}$ is a real-valued normally-distributed r.v. with mean $\ell\cdot m$ and variance $\ell^\top C\ell\ge 0$;

2. the characteristic function $\mathbb{R}^n \to \mathbb{C}$

$$\ell \mapsto \mathbb{E}\!\left[\exp(i\,\ell\cdot \underline{x})\right]$$

takes the form

$$\mathbb{E}\!\left[\exp(i\,\ell\cdot \underline{x})\right] =\exp\!\left(i\,\ell\cdot m - \frac{1}{2}\,\ell^\top C\ell\right);$$

3. **[Valid only if $C$ is SPD i.e. if $C^{-1}$ exists]** $\underline{x}$ has the PDF

$$p_{\underline{x}}(x)= \frac{1}{\sqrt{\det(2\pi C)}}\, \exp\!\left(-\frac{1}{2}\,\left\|C^{-1/2}(x-m)\right\|^2\right)$$

i.e.

$$\mathbb{P}[\underline{x}\in A] = \int_A \frac{1}{\sqrt{\det(2\pi C)}}\, \exp\!\left(-\frac{1}{2}\,\left\|C^{-1/2}(x-m)\right\|^2\right)\,dx, \qquad A\subseteq \mathbb{R}^n.$$

Keep the underlying standardised draws fixed while changing their covariance. This couples the before and after views: movement comes from the covariance transformation, not from drawing a different random sample.

<ES98AAnimation kind="gaussian-shape" />

<h2 id="linear-images-of-gaussians-are-again-gaussian">Linear images of Gaussians are again Gaussian!</h2>

Let $\underline{x}\sim\mathcal{N}(m,C)$ in $\mathbb{R}^n$ and fix $A\in\mathbb{R}^{p\times n}$ and consider

$$\underline{y}:=A\underline{x}$$

in $\mathbb{R}^p$. Then $\underline{y}$ is a $\mathbb{R}^p$-valued Gaussian, and in fact

$$\underline{y}\sim\mathcal{N}(Am,ACA^\top).$$

To see this:

$$\mathbb{E}\!\left[\exp(i\,\ell\cdot \underline{y})\right] = \mathbb{E}\!\left[\exp\!\left(i\,\ell\cdot (A\underline{x})\right)\right] = \mathbb{E}\!\left[\exp\!\left(i\,(A^\top \ell)\cdot \underline{x}\right)\right], \qquad \ell\in\mathbb{R}^p,$$

$$= \exp\!\left(i\,(A^\top \ell)\cdot m - \frac{1}{2}\,(A^\top \ell)^\top C (A^\top \ell)\right) = \exp\!\left(i\,\ell\cdot (Am) - \frac{1}{2}\,\ell^\top (ACA^\top)\ell\right).$$

Another nice property of Gaussians is that their conditional distributions are Gaussian, and the conditional mean and covariance are easy to calculate using linear algebra.

The transformation theorem explains forward uncertainty propagation: $A$ acts on the mean once and on the covariance on both sides. Conditioning runs a different calculation. We keep the observed value fixed and ask which uncertainty remains compatible with it; it is not an inverse matrix operation on the sample itself.

<h2 id="conditioning-theorem">Conditioning theorem</h2>

Let

$$\underline{x}=\begin{pmatrix}\underline{x}_1\\ \underline{x}_2\end{pmatrix}$$

be an $\mathbb{R}^n$-valued Gaussian, with $\underline{x}_1$ denoting the first $n_1$ components and $\underline{x}_2$ denoting the remaining $n_2$ components, $n_1+n_2=n$.

Write the mean $m$ and cov. $C$ of $\underline{x}$ in block form as

$$\mathbb{E}[\underline{x}] = m = \begin{pmatrix}m_1\\ m_2\end{pmatrix}, \qquad \mathrm{Cov}[\underline{x}] = C = \begin{pmatrix} C_{11} & C_{12}\\ C_{21} & C_{22} \end{pmatrix},$$

with $m_1\in\mathbb{R}^{n_1}$, $m_2\in\mathbb{R}^{n_2}$, $C_{11}\in\mathbb{R}^{n_1\times n_1}$, $C_{12}=C_{21}^\top$, ...

**Assume that $C$ and $C_{22}$ are invertible (generalizations are possible).** Then, for every $x_2\in\mathbb{R}^{n_2}$, $\underline{x}_1\,|\,\underline{x}_2=x_2$ is Gaussian,

$$\underline{x}_1\,|\,\underline{x}_2=x_2 \sim \mathcal{N}(m_1',C_{11}'),$$

where

$$m_1' = m_1 + C_{12}C_{22}^{-1}(x_2-m_2),$$

$$C_{11}' = C_{11} - C_{12}C_{22}^{-1}C_{21}, \qquad (C_{21}=C_{12}^\top).$$

**Kalman update formulae**

- $m_1'$: posterior mean
- $m_1$: prior mean
- $C_{12}C_{22}^{-1}$: Kalman gain matrix
- $(x_2-m_2)$: residual vector $=$ data $-\mathbb{E}[\mathrm{data}]$

<span data-es98a-source="es98a-gaussian-slice:start" />

What changes when the two sensors are correlated? Compare the same observation $x_2=1$ under two joint Gaussian models.

<Figure id="es98a-gaussian-slice" caption="Unit marginal variances and zero prior means. With correlation 0.8, the conditional mean is 0.8 and variance is 0.36. Axes match across panels.">
<div className="sci-story-grid sci-story-two">
<div><svg className="sci-story-svg" viewBox="0 0 340 290" role="img" aria-label="Uncorrelated sensors"><title>Uncorrelated sensors</title><path d="M45 50V195H310" fill="none" stroke="currentColor" opacity="0.5" /><text x="45" y="25">Uncorrelated sensors</text><text x="300" y="230" textAnchor="end">x₁</text><text x="45" y="45">density</text><text x="45.00" y="210" textAnchor="middle">-3</text><text x="305.00" y="210" textAnchor="middle">3</text><text x="38" y="199.00" textAnchor="end">0</text><text x="38" y="59.00" textAnchor="end">0.7</text><path d="M45.00,194.11 L46.63,194.01 L48.25,193.89 L49.87,193.77 L51.50,193.63 L53.12,193.47 L54.75,193.30 L56.38,193.12 L58.00,192.92 L59.62,192.70 L61.25,192.46 L62.88,192.19 L64.50,191.91 L66.12,191.60 L67.75,191.27 L69.38,190.91 L71.00,190.52 L72.63,190.10 L74.25,189.65 L75.88,189.17 L77.50,188.65 L79.12,188.10 L80.75,187.51 L82.38,186.88 L84.00,186.20 L85.62,185.49 L87.25,184.73 L88.88,183.93 L90.50,183.08 L92.12,182.19 L93.75,181.24 L95.38,180.25 L97.00,179.21 L98.62,178.12 L100.25,176.98 L101.88,175.79 L103.50,174.55 L105.12,173.26 L106.75,171.92 L108.38,170.53 L110.00,169.10 L111.62,167.62 L113.25,166.09 L114.88,164.53 L116.50,162.92 L118.12,161.28 L119.75,159.61 L121.38,157.90 L123.00,156.16 L124.62,154.40 L126.25,152.62 L127.88,150.83 L129.50,149.02 L131.12,147.21 L132.75,145.40 L134.38,143.59 L136.00,141.78 L137.62,139.99 L139.25,138.23 L140.88,136.48 L142.50,134.77 L144.12,133.10 L145.75,131.47 L147.38,129.88 L149.00,128.36 L150.62,126.89 L152.25,125.48 L153.88,124.15 L155.50,122.89 L157.12,121.72 L158.75,120.63 L160.38,119.63 L162.00,118.72 L163.62,117.91 L165.25,117.21 L166.88,116.60 L168.50,116.10 L170.12,115.71 L171.75,115.44 L173.38,115.27 L175.00,115.21 L176.62,115.27 L178.25,115.44 L179.88,115.71 L181.50,116.10 L183.12,116.60 L184.75,117.21 L186.38,117.91 L188.00,118.72 L189.62,119.63 L191.25,120.63 L192.88,121.72 L194.50,122.89 L196.12,124.15 L197.75,125.48 L199.38,126.89 L201.00,128.36 L202.62,129.88 L204.25,131.47 L205.88,133.10 L207.50,134.77 L209.12,136.48 L210.75,138.23 L212.38,139.99 L214.00,141.78 L215.62,143.59 L217.25,145.40 L218.88,147.21 L220.50,149.02 L222.12,150.83 L223.75,152.62 L225.38,154.40 L227.00,156.16 L228.62,157.90 L230.25,159.61 L231.88,161.28 L233.50,162.92 L235.12,164.53 L236.75,166.09 L238.38,167.62 L240.00,169.10 L241.62,170.53 L243.25,171.92 L244.88,173.26 L246.50,174.55 L248.12,175.79 L249.75,176.98 L251.38,178.12 L253.00,179.21 L254.62,180.25 L256.25,181.24 L257.88,182.19 L259.50,183.08 L261.12,183.93 L262.75,184.73 L264.38,185.49 L266.00,186.20 L267.62,186.88 L269.25,187.51 L270.88,188.10 L272.50,188.65 L274.12,189.17 L275.75,189.65 L277.38,190.10 L279.00,190.52 L280.62,190.91 L282.25,191.27 L283.88,191.60 L285.50,191.91 L287.12,192.19 L288.75,192.46 L290.38,192.70 L292.00,192.92 L293.62,193.12 L295.25,193.30 L296.88,193.47 L298.50,193.63 L300.12,193.77 L301.75,193.89 L303.38,194.01 L305.00,194.11" stroke="var(--sci-accent)" strokeWidth="2.5" fill="none" /><text x="45" y="252">conditional = marginal</text></svg></div>
<div><svg className="sci-story-svg" viewBox="0 0 340 290" role="img" aria-label="Correlation 0.8"><title>Correlation 0.8</title><path d="M45 50V195H310" fill="none" stroke="currentColor" opacity="0.5" /><text x="45" y="25">Correlation 0.8</text><text x="300" y="230" textAnchor="end">x₁</text><text x="45" y="45">density</text><text x="45.00" y="210" textAnchor="middle">-3</text><text x="305.00" y="210" textAnchor="middle">3</text><text x="38" y="199.00" textAnchor="end">0</text><text x="38" y="59.00" textAnchor="end">0.7</text><path d="M45.00,195.00 L46.63,195.00 L48.25,195.00 L49.87,195.00 L51.50,195.00 L53.12,195.00 L54.75,195.00 L56.38,195.00 L58.00,195.00 L59.62,195.00 L61.25,195.00 L62.88,195.00 L64.50,195.00 L66.12,195.00 L67.75,195.00 L69.38,195.00 L71.00,195.00 L72.63,195.00 L74.25,195.00 L75.88,195.00 L77.50,195.00 L79.12,195.00 L80.75,195.00 L82.38,195.00 L84.00,195.00 L85.62,195.00 L87.25,195.00 L88.88,195.00 L90.50,195.00 L92.12,195.00 L93.75,194.99 L95.38,194.99 L97.00,194.99 L98.62,194.99 L100.25,194.98 L101.88,194.98 L103.50,194.97 L105.12,194.96 L106.75,194.95 L108.38,194.93 L110.00,194.91 L111.62,194.89 L113.25,194.86 L114.88,194.83 L116.50,194.78 L118.12,194.73 L119.75,194.66 L121.38,194.58 L123.00,194.49 L124.62,194.37 L126.25,194.23 L127.88,194.06 L129.50,193.85 L131.12,193.61 L132.75,193.33 L134.38,192.99 L136.00,192.60 L137.62,192.14 L139.25,191.60 L140.88,190.99 L142.50,190.27 L144.12,189.45 L145.75,188.52 L147.38,187.46 L149.00,186.26 L150.62,184.91 L152.25,183.39 L153.88,181.70 L155.50,179.82 L157.12,177.74 L158.75,175.46 L160.38,172.95 L162.00,170.23 L163.62,167.28 L165.25,164.09 L166.88,160.68 L168.50,157.03 L170.12,153.16 L171.75,149.08 L173.38,144.80 L175.00,140.33 L176.62,135.69 L178.25,130.92 L179.88,126.03 L181.50,121.05 L183.12,116.02 L184.75,110.98 L186.38,105.97 L188.00,101.03 L189.62,96.20 L191.25,91.52 L192.88,87.05 L194.50,82.82 L196.12,78.89 L197.75,75.28 L199.38,72.04 L201.00,69.21 L202.62,66.81 L204.25,64.87 L205.88,63.43 L207.50,62.48 L209.12,62.05 L210.75,62.13 L212.38,62.74 L214.00,63.85 L215.62,65.47 L217.25,67.56 L218.88,70.10 L220.50,73.08 L222.12,76.44 L223.75,80.16 L225.38,84.20 L227.00,88.52 L228.62,93.06 L230.25,97.79 L231.88,102.67 L233.50,107.64 L235.12,112.66 L236.75,117.70 L238.38,122.72 L240.00,127.67 L241.62,132.52 L243.25,137.26 L244.88,141.84 L246.50,146.25 L248.12,150.47 L249.75,154.48 L251.38,158.27 L253.00,161.84 L254.62,165.18 L256.25,168.29 L257.88,171.16 L259.50,173.81 L261.12,176.24 L262.75,178.46 L264.38,180.47 L266.00,182.28 L267.62,183.91 L269.25,185.38 L270.88,186.68 L272.50,187.83 L274.12,188.85 L275.75,189.74 L277.38,190.52 L279.00,191.20 L280.62,191.79 L282.25,192.30 L283.88,192.74 L285.50,193.11 L287.12,193.43 L288.75,193.70 L290.38,193.93 L292.00,194.12 L293.62,194.28 L295.25,194.41 L296.88,194.52 L298.50,194.61 L300.12,194.69 L301.75,194.75 L303.38,194.80 L305.00,194.84" stroke="var(--sci-accent)" strokeWidth="2.5" fill="none" /><text x="45" y="252">solid: conditional on x₂ = 1</text><path d="M45.00,194.11 L46.63,194.01 L48.25,193.89 L49.87,193.77 L51.50,193.63 L53.12,193.47 L54.75,193.30 L56.38,193.12 L58.00,192.92 L59.62,192.70 L61.25,192.46 L62.88,192.19 L64.50,191.91 L66.12,191.60 L67.75,191.27 L69.38,190.91 L71.00,190.52 L72.63,190.10 L74.25,189.65 L75.88,189.17 L77.50,188.65 L79.12,188.10 L80.75,187.51 L82.38,186.88 L84.00,186.20 L85.62,185.49 L87.25,184.73 L88.88,183.93 L90.50,183.08 L92.12,182.19 L93.75,181.24 L95.38,180.25 L97.00,179.21 L98.62,178.12 L100.25,176.98 L101.88,175.79 L103.50,174.55 L105.12,173.26 L106.75,171.92 L108.38,170.53 L110.00,169.10 L111.62,167.62 L113.25,166.09 L114.88,164.53 L116.50,162.92 L118.12,161.28 L119.75,159.61 L121.38,157.90 L123.00,156.16 L124.62,154.40 L126.25,152.62 L127.88,150.83 L129.50,149.02 L131.12,147.21 L132.75,145.40 L134.38,143.59 L136.00,141.78 L137.62,139.99 L139.25,138.23 L140.88,136.48 L142.50,134.77 L144.12,133.10 L145.75,131.47 L147.38,129.88 L149.00,128.36 L150.62,126.89 L152.25,125.48 L153.88,124.15 L155.50,122.89 L157.12,121.72 L158.75,120.63 L160.38,119.63 L162.00,118.72 L163.62,117.91 L165.25,117.21 L166.88,116.60 L168.50,116.10 L170.12,115.71 L171.75,115.44 L173.38,115.27 L175.00,115.21 L176.62,115.27 L178.25,115.44 L179.88,115.71 L181.50,116.10 L183.12,116.60 L184.75,117.21 L186.38,117.91 L188.00,118.72 L189.62,119.63 L191.25,120.63 L192.88,121.72 L194.50,122.89 L196.12,124.15 L197.75,125.48 L199.38,126.89 L201.00,128.36 L202.62,129.88 L204.25,131.47 L205.88,133.10 L207.50,134.77 L209.12,136.48 L210.75,138.23 L212.38,139.99 L214.00,141.78 L215.62,143.59 L217.25,145.40 L218.88,147.21 L220.50,149.02 L222.12,150.83 L223.75,152.62 L225.38,154.40 L227.00,156.16 L228.62,157.90 L230.25,159.61 L231.88,161.28 L233.50,162.92 L235.12,164.53 L236.75,166.09 L238.38,167.62 L240.00,169.10 L241.62,170.53 L243.25,171.92 L244.88,173.26 L246.50,174.55 L248.12,175.79 L249.75,176.98 L251.38,178.12 L253.00,179.21 L254.62,180.25 L256.25,181.24 L257.88,182.19 L259.50,183.08 L261.12,183.93 L262.75,184.73 L264.38,185.49 L266.00,186.20 L267.62,186.88 L269.25,187.51 L270.88,188.10 L272.50,188.65 L274.12,189.17 L275.75,189.65 L277.38,190.10 L279.00,190.52 L280.62,190.91 L282.25,191.27 L283.88,191.60 L285.50,191.91 L287.12,192.19 L288.75,192.46 L290.38,192.70 L292.00,192.92 L293.62,193.12 L295.25,193.30 L296.88,193.47 L298.50,193.63 L300.12,193.77 L301.75,193.89 L303.38,194.01 L305.00,194.11" stroke="var(--sci-secondary)" strokeWidth="2.5" fill="none" strokeDasharray="5 4" /><text x="45" y="270">dashed: marginal</text></svg></div>
</div>
</Figure>

The correlated reading moves the centre and narrows the distribution. The next derivation explains both changes using an independent Gaussian residual.

<span data-es98a-source="es98a-gaussian-slice:end" />

Move the observed coordinate through the joint Gaussian. Predict which property of the conditional law changes and which stays fixed before playing the sequence.

<ES98AAnimation kind="gaussian-slice" />

<h3 id="why-the-update-is-a-projection">Why the update is a projection</h3>

Set $K=C_{12}C_{22}^{-1}$ and form the residual random vector

$$
r=x_1-m_1-K(x_2-m_2).
$$

Then $\operatorname{Cov}(r,x_2)=C_{12}-KC_{22}=0$ and $\operatorname{Cov}(r)=C_{11}-C_{12}C_{22}^{-1}C_{21}$. The pair $(r,x_2)$ is jointly Gaussian by the linear-image theorem. Its characteristic function factors because the cross covariance vanishes, so $r$ and $x_2$ are independent. Conditioning now fixes only the term $K(x_2-m_2)$ and leaves the residual law unchanged. This proves the theorem and explains why the conditional covariance does not depend on the observed value.

For scalar unit-variance coordinates with correlation $\rho$, observing $x_2=b$ gives mean $\rho b$ and variance $1-\rho^2$. When $\rho=0$, nothing is learned. As $|\rho|$ approaches one, very little uncertainty remains. Covariance reduction is SPSD because it is the covariance of $r$, not merely a formal subtraction.

**Check your understanding.** Zero covariance implies independence here because the joint law is Gaussian. Give a non-Gaussian counterexample by taking $X$ uniform on $[-1,1]$ and $Y=X^2$.

The update gives exact answers for Gaussian models. For other laws we often need expectations that cannot be evaluated symbolically. [Week 4](/notes/es98a/week4) replaces analytic integration with sampling.
