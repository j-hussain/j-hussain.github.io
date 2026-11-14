---
layout: page
title: "Week 4: Computing expectations with Monte Carlo and Markov chains"
---

A posterior is useful only if we can extract a prediction from it. Even after specifying a law $\mu$, an integral such as $\mathbb E_\mu[f]$ may be inaccessible analytically. Could repeated draws replace a high-dimensional integration grid?

Imagine estimating the probability of an event by counting its frequency. Monte Carlo applies exactly that idea to a general integrand. We first distinguish three promises (correct average, eventual convergence and finite-sample accuracy), then ask what survives when independent draws are unavailable.

<h2 id="week-4-monte-carlo-methods">Week 4: Monte Carlo methods</h2>

<h3 id="monte-carlo-methods">Monte Carlo methods</h3>

We now focus very much on estimating integrals of the form

$$Q(f) := \mathbb{E}_{x\sim\mu}[f(x)] = \int_{\mathbb{R}^d} f(x)\,\mu(dx),$$

where $x$ is an $\mathbb{R}^d$-valued r.v. and $f:\mathbb{R}^d\to\mathbb{R}$ (or at least defined on the range of $x$); $\mu$ is the law of $x$, and we usually assume that $\mu$ has PDF $\rho:\mathbb{R}^d\to[0,\infty]$ with

$$\int_{\mathbb{R}^d}\rho(x)\,dx = 1.$$

We often call $\mu$ the **target distribution** and $\rho$ the **target density**.

**Key assumption:** the integral defining $Q(f)$ actually converges, i.e.

$$\mathbb{E}_{x\sim\mu}[|f(x)|] < \infty.$$

<h3 id="vanilla-monte-carlo">"Vanilla" Monte Carlo</h3>

**Key enabling assumption:** We can draw as many independent samples $x_1,x_2,x_3,\ldots$ as we like from the target distr. $\mu$.

In this situation, we approximate $Q(f)$ by the **Monte Carlo estimator**

$$\hat{Q}_J(f) := \frac{1}{J}\sum_{j=1}^J f(x_j).$$

<h3 id="unbiasedness-and-lln">Unbiasedness and LLN</h3>

$$\begin{aligned} \mathbb{E}\!\left[\hat{Q}_J(f)\right] &= \mathbb{E}\!\left[\frac{1}{J}\sum_{j=1}^J f(x_j)\right] \\ &= \frac{1}{J}\sum_{j=1}^J \mathbb{E}[f(x_j)] \\ &= \frac{1}{J}\,J\,Q(f) \\ &= Q(f). \end{aligned}$$

(since $x_1,\ldots,x_J$ have the same law)

We also have convergence as the number of samples tends to infinity by the law of large numbers (LLN): so long as $Q(f)$ exists (i.e. $\mathbb{E}[|f(x)|]<\infty$), $\hat{Q}_J(f)$ converges to $Q(f)$ almost surely as $J\to\infty$, i.e.

$$\mathbb{P}\!\left[\lim_{J\to\infty}\hat{Q}_J(f)=Q(f)\right]=1.$$

When $f\in L^2(\mu)$, MC estimators converge in root mean square at a that is independent of the dimension $d$; the rate is the inverse square root of the no. of samples taken, i.e. like $J^{-1/2}$.

Let's examine the random quadrature error

$$E_J(f) := \hat{Q}_J(f) - Q(f),$$

which has mean zero and variance

$$\mathbb{E}[|E_J(f)|^2] = \mathbb{E}\!\left[\left|\hat{Q}_J(f)-\mathbb{E}[\hat{Q}_J(f)]\right|^2\right] = \mathbb{V}[\hat{Q}_J(f)] = \frac{1}{J^2}\,J\,\mathbb{V}[f(x)] = \frac{1}{J}\,\mathbb{V}[f(x)].$$

i.e. the root mean square error is

$$\sqrt{\mathbb{E}[|E_J(f)|^2]} = \frac{\sqrt{\mathbb{V}[f(x)]}}{\sqrt{J}}.$$

(For bounded $f$, one can often do much better using tools from concentration of measure.)

Watch a single running estimate accumulate evidence. The reference line is the exact integral; the shrinking envelope is the theoretical RMSE scale, so crossing it is not a failure of the estimator.

<ES98AAnimation kind="monte-carlo" />

We can also obtain a probabilistic error bound using Chebyshev's inequality: for any $\varepsilon>0$,

$$\mathbb{P}\!\left[|E_J(f)|>\varepsilon\right] = \mathbb{P}\!\left[|\hat{Q}_J(f)-Q(f)|>\varepsilon\right] \le \frac{\mathbb{V}[\hat{Q}_J(f)]}{\varepsilon^2} = \frac{\mathbb{V}[f(x)]}{J\varepsilon^2}.$$

The $J\varepsilon^2$ part highlights the basic inverse sq. root cost-accuracy tradeoff in MC methods: if you want $\varepsilon/2$ instead of $\varepsilon$ (i.e. to double the accuracy), then you must quadruple $J$ since

$$4 = \frac{1}{(1/2)^2}.$$

The exponent is independent of dimension. The variance of $f$ and the cost of producing a draw can nevertheless grow with dimension; this is not a dimension-free computational guarantee.

But how can we apply the MC method if we cannot easily draw samples from $\mu$ / $\rho$. This spurs the Markov chain Monte Carlo (MCMC) methods we consider next.

**Note** that because

$$\hat{Q}_J(f):=\frac{1}{J}\sum_{j=1}^J f(z_j)$$

uses only the values $f(z_j)$ and does not care about the spacing of the nodes $z_j$, the performance of $\hat{Q}_J$ is robust to poor features of $f$ (roughness, high-dim domain, ...), but it is also unable to leverage any nice features of $f$ (e.g. smoothness).

$\to$ **quasi-Monte Carlo methods** try to have the best of both worlds.

<span data-es98a-source="es98a-sampling-cost:start" />

Before replacing independent samples by a chain, compare the cost of precision with the cost of correlation.

<Figure id="es98a-sampling-cost" caption="Left: exact iid RMSE for an observable of variance one. Right: illustrative stationary correlation sequences; these are analytic models, not simulated chains.">
<div className="sci-story-grid sci-story-two">
<div><svg className="sci-story-svg" viewBox="0 0 340 290" role="img" aria-label="Independent sampling"><title>Independent sampling</title><path d="M45 50V195H310" fill="none" stroke="currentColor" opacity="0.5" /><text x="45" y="25">Independent sampling</text><text x="300" y="230" textAnchor="end">draws J</text><text x="45" y="45">RMSE (unit variance)</text><text x="45.00" y="210" textAnchor="middle">1</text><text x="305.00" y="210" textAnchor="middle">100</text><text x="38" y="199.00" textAnchor="end">0</text><text x="38" y="59.00" textAnchor="end">1</text><path d="M45.00,55.00 L46.62,84.96 L48.25,101.41 L49.88,112.16 L51.50,119.90 L53.12,125.81 L54.75,130.51 L56.38,134.37 L58.00,137.61 L59.62,140.38 L61.25,142.78 L62.88,144.89 L64.50,146.77 L66.12,148.45 L67.75,149.96 L69.38,151.34 L71.00,152.60 L72.62,153.75 L74.25,154.82 L75.88,155.80 L77.50,156.72 L79.12,157.58 L80.75,158.38 L82.38,159.13 L84.00,159.83 L85.62,160.50 L87.25,161.13 L88.88,161.73 L90.50,162.30 L92.12,162.83 L93.75,163.35 L95.38,163.84 L97.00,164.30 L98.62,164.75 L100.25,165.18 L101.88,165.59 L103.50,165.98 L105.12,166.36 L106.75,166.72 L108.38,167.07 L110.00,167.41 L111.62,167.74 L113.25,168.05 L114.88,168.35 L116.50,168.65 L118.12,168.93 L119.75,169.21 L121.38,169.47 L123.00,169.73 L124.62,169.98 L126.25,170.23 L127.88,170.46 L129.50,170.69 L131.12,170.92 L132.75,171.13 L134.38,171.35 L136.00,171.55 L137.62,171.75 L139.25,171.95 L140.88,172.14 L142.50,172.33 L144.12,172.51 L145.75,172.69 L147.38,172.86 L149.00,173.03 L150.62,173.19 L152.25,173.36 L153.88,173.51 L155.50,173.67 L157.12,173.82 L158.75,173.97 L160.38,174.11 L162.00,174.26 L163.62,174.40 L165.25,174.53 L166.88,174.67 L168.50,174.80 L170.12,174.93 L171.75,175.05 L173.38,175.18 L175.00,175.30 L176.62,175.42 L178.25,175.54 L179.88,175.65 L181.50,175.76 L183.12,175.88 L184.75,175.99 L186.38,176.09 L188.00,176.20 L189.62,176.30 L191.25,176.41 L192.88,176.51 L194.50,176.61 L196.12,176.70 L197.75,176.80 L199.38,176.89 L201.00,176.99 L202.62,177.08 L204.25,177.17 L205.88,177.26 L207.50,177.34 L209.12,177.43 L210.75,177.52 L212.38,177.60 L214.00,177.68 L215.62,177.76 L217.25,177.84 L218.88,177.92 L220.50,178.00 L222.12,178.08 L223.75,178.15 L225.38,178.23 L227.00,178.30 L228.62,178.38 L230.25,178.45 L231.88,178.52 L233.50,178.59 L235.12,178.66 L236.75,178.73 L238.38,178.79 L240.00,178.86 L241.62,178.93 L243.25,178.99 L244.88,179.06 L246.50,179.12 L248.12,179.18 L249.75,179.25 L251.38,179.31 L253.00,179.37 L254.62,179.43 L256.25,179.49 L257.88,179.54 L259.50,179.60 L261.12,179.66 L262.75,179.72 L264.38,179.77 L266.00,179.83 L267.62,179.88 L269.25,179.94 L270.88,179.99 L272.50,180.04 L274.12,180.10 L275.75,180.15 L277.38,180.20 L279.00,180.25 L280.62,180.30 L282.25,180.35 L283.88,180.40 L285.50,180.45 L287.12,180.50 L288.75,180.55 L290.38,180.59 L292.00,180.64 L293.62,180.69 L295.25,180.73 L296.88,180.78 L298.50,180.82 L300.12,180.87 L301.75,180.91 L303.38,180.96 L305.00,181.00" stroke="var(--sci-accent)" strokeWidth="2.5" fill="none" /><text x="45" y="252">solid: RMSE = 1 / √J</text></svg></div>
<div><svg className="sci-story-svg" viewBox="0 0 340 290" role="img" aria-label="Stationary correlation"><title>Stationary correlation</title><path d="M45 50V195H310" fill="none" stroke="currentColor" opacity="0.5" /><text x="45" y="25">Stationary correlation</text><text x="300" y="230" textAnchor="end">lag k</text><text x="45" y="45">correlation</text><text x="45.00" y="210" textAnchor="middle">0</text><text x="305.00" y="210" textAnchor="middle">30</text><text x="38" y="199.00" textAnchor="end">0</text><text x="38" y="59.00" textAnchor="end">1</text><path d="M45.00,55.00 L46.62,57.74 L48.25,60.42 L49.88,63.06 L51.50,65.64 L53.12,68.17 L54.75,70.65 L56.38,73.08 L58.00,75.47 L59.62,77.80 L61.25,80.10 L62.88,82.34 L64.50,84.55 L66.12,86.71 L67.75,88.83 L69.38,90.90 L71.00,92.94 L72.62,94.94 L74.25,96.89 L75.88,98.81 L77.50,100.69 L79.12,102.54 L80.75,104.35 L82.38,106.12 L84.00,107.86 L85.62,109.56 L87.25,111.24 L88.88,112.87 L90.50,114.48 L92.12,116.06 L93.75,117.60 L95.38,119.11 L97.00,120.60 L98.62,122.05 L100.25,123.48 L101.88,124.88 L103.50,126.25 L105.12,127.60 L106.75,128.91 L108.38,130.21 L110.00,131.47 L111.62,132.72 L113.25,133.94 L114.88,135.13 L116.50,136.30 L118.12,137.45 L119.75,138.58 L121.38,139.68 L123.00,140.76 L124.62,141.82 L126.25,142.86 L127.88,143.88 L129.50,144.88 L131.12,145.86 L132.75,146.82 L134.38,147.77 L136.00,148.69 L137.62,149.60 L139.25,150.48 L140.88,151.35 L142.50,152.21 L144.12,153.05 L145.75,153.87 L147.38,154.67 L149.00,155.46 L150.62,156.23 L152.25,156.99 L153.88,157.74 L155.50,158.46 L157.12,159.18 L158.75,159.88 L160.38,160.57 L162.00,161.24 L163.62,161.90 L165.25,162.55 L166.88,163.18 L168.50,163.81 L170.12,164.42 L171.75,165.01 L173.38,165.60 L175.00,166.18 L176.62,166.74 L178.25,167.29 L179.88,167.83 L181.50,168.37 L183.12,168.89 L184.75,169.40 L186.38,169.90 L188.00,170.39 L189.62,170.87 L191.25,171.34 L192.88,171.81 L194.50,172.26 L196.12,172.70 L197.75,173.14 L199.38,173.57 L201.00,173.99 L202.62,174.40 L204.25,174.80 L205.88,175.20 L207.50,175.58 L209.12,175.96 L210.75,176.34 L212.38,176.70 L214.00,177.06 L215.62,177.41 L217.25,177.75 L218.88,178.09 L220.50,178.42 L222.12,178.75 L223.75,179.06 L225.38,179.38 L227.00,179.68 L228.62,179.98 L230.25,180.27 L231.88,180.56 L233.50,180.85 L235.12,181.12 L236.75,181.39 L238.38,181.66 L240.00,181.92 L241.62,182.18 L243.25,182.43 L244.88,182.67 L246.50,182.91 L248.12,183.15 L249.75,183.38 L251.38,183.61 L253.00,183.83 L254.62,184.05 L256.25,184.27 L257.88,184.48 L259.50,184.68 L261.12,184.88 L262.75,185.08 L264.38,185.27 L266.00,185.47 L267.62,185.65 L269.25,185.83 L270.88,186.01 L272.50,186.19 L274.12,186.36 L275.75,186.53 L277.38,186.70 L279.00,186.86 L280.62,187.02 L282.25,187.17 L283.88,187.33 L285.50,187.48 L287.12,187.62 L288.75,187.77 L290.38,187.91 L292.00,188.05 L293.62,188.19 L295.25,188.32 L296.88,188.45 L298.50,188.58 L300.12,188.70 L301.75,188.83 L303.38,188.95 L305.00,189.07" stroke="var(--sci-accent)" strokeWidth="2.5" fill="none" /><text x="45" y="252">solid: lag correlation 0.9ᵏ</text><path d="M45.00,55.00 L46.62,91.47 L48.25,118.44 L49.88,138.38 L51.50,153.13 L53.12,164.04 L54.75,172.10 L56.38,178.07 L58.00,182.48 L59.62,185.74 L61.25,188.15 L62.88,189.94 L64.50,191.26 L66.12,192.23 L67.75,192.95 L69.38,193.49 L71.00,193.88 L72.62,194.17 L74.25,194.39 L75.88,194.55 L77.50,194.67 L79.12,194.75 L80.75,194.82 L82.38,194.86 L84.00,194.90 L85.62,194.93 L87.25,194.95 L88.88,194.96 L90.50,194.97 L92.12,194.98 L93.75,194.98 L95.38,194.99 L97.00,194.99 L98.62,194.99 L100.25,195.00 L101.88,195.00 L103.50,195.00 L105.12,195.00 L106.75,195.00 L108.38,195.00 L110.00,195.00 L111.62,195.00 L113.25,195.00 L114.88,195.00 L116.50,195.00 L118.12,195.00 L119.75,195.00 L121.38,195.00 L123.00,195.00 L124.62,195.00 L126.25,195.00 L127.88,195.00 L129.50,195.00 L131.12,195.00 L132.75,195.00 L134.38,195.00 L136.00,195.00 L137.62,195.00 L139.25,195.00 L140.88,195.00 L142.50,195.00 L144.12,195.00 L145.75,195.00 L147.38,195.00 L149.00,195.00 L150.62,195.00 L152.25,195.00 L153.88,195.00 L155.50,195.00 L157.12,195.00 L158.75,195.00 L160.38,195.00 L162.00,195.00 L163.62,195.00 L165.25,195.00 L166.88,195.00 L168.50,195.00 L170.12,195.00 L171.75,195.00 L173.38,195.00 L175.00,195.00 L176.62,195.00 L178.25,195.00 L179.88,195.00 L181.50,195.00 L183.12,195.00 L184.75,195.00 L186.38,195.00 L188.00,195.00 L189.62,195.00 L191.25,195.00 L192.88,195.00 L194.50,195.00 L196.12,195.00 L197.75,195.00 L199.38,195.00 L201.00,195.00 L202.62,195.00 L204.25,195.00 L205.88,195.00 L207.50,195.00 L209.12,195.00 L210.75,195.00 L212.38,195.00 L214.00,195.00 L215.62,195.00 L217.25,195.00 L218.88,195.00 L220.50,195.00 L222.12,195.00 L223.75,195.00 L225.38,195.00 L227.00,195.00 L228.62,195.00 L230.25,195.00 L231.88,195.00 L233.50,195.00 L235.12,195.00 L236.75,195.00 L238.38,195.00 L240.00,195.00 L241.62,195.00 L243.25,195.00 L244.88,195.00 L246.50,195.00 L248.12,195.00 L249.75,195.00 L251.38,195.00 L253.00,195.00 L254.62,195.00 L256.25,195.00 L257.88,195.00 L259.50,195.00 L261.12,195.00 L262.75,195.00 L264.38,195.00 L266.00,195.00 L267.62,195.00 L269.25,195.00 L270.88,195.00 L272.50,195.00 L274.12,195.00 L275.75,195.00 L277.38,195.00 L279.00,195.00 L280.62,195.00 L282.25,195.00 L283.88,195.00 L285.50,195.00 L287.12,195.00 L288.75,195.00 L290.38,195.00 L292.00,195.00 L293.62,195.00 L295.25,195.00 L296.88,195.00 L298.50,195.00 L300.12,195.00 L301.75,195.00 L303.38,195.00 L305.00,195.00" stroke="var(--sci-secondary)" strokeWidth="2.5" fill="none" strokeDasharray="5 4" /><text x="45" y="270">dashed: lag correlation 0.2ᵏ</text></svg></div>
</div>
</Figure>

Four times as many iid draws halve RMSE. A slowly decaying lag correlation can undo much of that gain: many recorded states need not mean many independent pieces of information.

<span data-es98a-source="es98a-sampling-cost:end" />

<h3 id="markov-chain-monte-carlo">Markov chain Monte Carlo</h3>

**Setup:** We have a formula for evaluating the target dens. $\rho$ but drawing samples from $\rho$ is hard/impossible. Our idea is to construct a random walk (more precisely, a Markov chain) of states $z_1,z_2,\ldots,z_t,\ldots$ in $\mathbb{R}^d$ such that

1. as $t\to\infty$, the distribution of $z_t$ should approach/converge to the target dist. $\mu$ / its PDF $\rho$;

2. correlations of relevant observables should decay with increasing **lag**. In stationarity, $\operatorname{Cov}(f(z_t),f(z_{t+1}))$ is independent of $t$ and need not vanish;

3. we want to approximate integrals:

$$Q(f) := \int_{\mathbb{R}^d} f(x)\rho(x)\,dx = \lim_{T\to\infty}\frac{1}{T}\sum_{t=1}^T f(z_t).$$

(space average $=$ time average)

Stationarity alone cannot ensure convergence of a time average: a chain that never moves preserves any starting law. For a stationary chain, write $\gamma_k=\operatorname{Cov}(f(z_0),f(z_k))$. Expanding the variance of the sum gives

$$
\operatorname{Var}\!\left[\frac1T\sum_{t=1}^T f(z_t)\right]
=\frac1T\left[\gamma_0+2\sum_{k=1}^{T-1}\left(1-\frac{k}{T}\right)\gamma_k\right].
$$

Positive serial correlation inflates uncertainty. Under absolute summability the bracket tends to the asymptotic variance; it is not generally $\gamma_0$. Ergodicity and suitable moment assumptions, rather than invariance alone, justify the limiting time-average identity.

How do we construct such sequences $(z_t)_t$? We use a **transition kernel / Markov kernel**

$$\chi(x,A) := \mathbb{P}[z_{t+1}\in A \mid z_t=x]$$

telling us the prob. dist. of the next state given the current one.

One minimal requirement (necessary but not sufficient for (i)–(iii)) is that the target $\mu$ be invariant under $\chi$, i.e. that if $z_t\sim\mu$, then $z_{t+1}\sim\chi(z_t,\cdot)$ should be $\mu$-distributed as well:

$$\int_{\mathbb{R}^d}\chi(x,A)\,\mu(dx) = \mu(A) \qquad\text{for all measurable }A\subseteq\mathbb{R}^d.$$

In practice, to construct a $\chi$ that has $\mu$ as an invariant/equilibrium distn., we often construct a $\chi$ that satisfies **detailed balance / reversibility** w.r.t. $\mu$:

$$\int_A \chi(x,B)\,\mu(dx) = \int_B \chi(x,A)\,\mu(dx) \qquad\text{for all measurable }A,B\subseteq\mathbb{R}^d.$$

**Proof that reversibility $\Rightarrow$ invariance.** Suppose that $\chi$ is $\mu$-reversible, and let $A\subseteq\mathbb{R}^d$.

$$\int_{\mathbb{R}^d}\chi(x,A)\,\mu(dx) = \int_A \chi(x,\mathbb{R}^d)\,\mu(dx) = \int_A 1\,\mu(dx) = \mu(A).$$

$\square$

<h3 id="the-metropolishastings-mh-scheme">The Metropolis–Hastings (MH) scheme</h3>

The Metropolis–Hastings (MH) scheme offers a simple implementation of a $\mu$-reversible (and hence $\mu$-invariant) transition kernel $\chi$, in two steps.

We need one further prob. distn., called the **proposal distribution** $Q(x,A)$ with PDF $q(x,x')$.

1. Given that $z_t=x$, draw a proposed new state $z'$ with PDF $q(x,\cdot)$.
   (here we need the proposal to be quick and easy to sample)

2. Calculate the **acceptance probability** $\alpha(z_t,z')$, where

$$\alpha(x,x') := \min\!\left(1,\ \frac{\rho(x')\,q(x',x)}{\rho(x)\,q(x,x')}\right).$$

In practice compute $\log\alpha=\min(0,\log\rho(x')-\log\rho(x)+\log q(x',x)-\log q(x,x'))$ and accept when $\log U\le\log\alpha$. Initialise in the positive-density support; proposals with zero reverse probability are rejected. This avoids underflow and requires no normalising constant for $\rho$.

3. Draw $z\sim\mathrm{Unif}([0,1])$.
    1. if $z\le \alpha(z_t,z')$, then we accept the proposal and set $z_{t+1}:=z'$;
    2. if $z>\alpha(z_t,z')$, then we reject the proposal and set $z_{t+1}:=z_t$.

**FACT:** The MH scheme always yields a kernel $\chi_{\mathrm{MH}}$, i.e. a rule for sampling $z_{t+1}$ given $z_t$, that is reversible w.r.t. $\mu$ and hence has the target as an invariant distn.

Trace the algorithm one proposal at a time. When a proposal is rejected, watch both the point on the target density and the next entry in the time series. A rejected proposal still consumes an iteration.

<ES98AAnimation kind="metropolis" />

<h3 id="why-rejection-is-part-of-the-algorithm">Why rejection is part of the algorithm</h3>

For distinct states the accepted probability flow is

$$
\rho(x)q(x,x')\alpha(x,x')
=\min\{\rho(x)q(x,x'),\rho(x')q(x',x)\},
$$

which is symmetric in $x,x'$. Rejected proposals supply a self-transition; the diagonal flow is automatically symmetric. This proves detailed balance, and the earlier proof then gives invariance. Deleting rejected states changes the chain and generally changes its invariant law.

**Thought experiment.** A reversible chain alternates deterministically between two states. Is it mixing? Its invariant law is uniform, but a point initial distribution oscillates forever. In [Week 5](/notes/es98a/week5), the Markov operator lets us recognise this obstruction as an eigenvalue $-1$.
