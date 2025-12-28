---
layout: page
title: "Week 4: Monte Carlo toolkit: LLN, vanilla MC, MCMC, and Kalman filtering"
---

## Week 4 — Monte Carlo methods

### Monte Carlo methods

We now focus very much on estimating integrals of the form $$Q(f) := \mathbb{E}_{x\sim\mu}[f(x)] = \int_{\mathbb{R}^d} f(x)\,\mu(dx),$$ where $x$ is an $\mathbb{R}^d$-valued r.v. and $f:\mathbb{R}^d\to\mathbb{R}$ (or at least defined on the range of $x$); $\mu$ is the law of $x$, and we usually assume that $\mu$ has PDF $\rho:\mathbb{R}^d\to[0,\infty]$ with $$\int_{\mathbb{R}^d}\rho(x)\,dx = 1.$$ We often call $\mu$ the **target distribution** and $\rho$ the **target density**.

**Key assumption:** the integral defining $Q(f)$ actually converges, i.e. $$\mathbb{E}_{x\sim\mu}[|f(x)|] < \infty.$$ ### “Vanilla” Monte Carlo

**Key enabling assumption:** We can draw as many independent samples $x_1,x_2,x_3,\ldots$ as we like from the target distr. $\mu$.

In this situation, we approximate $Q(f)$ by the **Monte Carlo estimator** $$\hat{Q}_J(f) := \frac{1}{J}\sum_{j=1}^J f(x_j).$$ ### Unbiasedness and LLN $$\begin{aligned} \mathbb{E}\!\left[\hat{Q}_J(f)\right] &= \mathbb{E}\!\left[\frac{1}{J}\sum_{j=1}^J f(x_j)\right] \\ &= \frac{1}{J}\sum_{j=1}^J \mathbb{E}[f(x_j)] \\ &= \frac{1}{J}\,J\,Q(f) \\ &= Q(f). \end{aligned}$$ (since $x_1,\ldots,x_J$ have the same law)

We also have convergence as the number of samples tends to infinity by the law of large numbers (LLN): so long as $Q(f)$ exists (i.e. $\mathbb{E}[|f(x)|]<\infty$), $\hat{Q}_J(f)$ converges to $Q(f)$ almost surely as $J\to\infty$, i.e. $$\mathbb{P}\!\left[\lim_{J\to\infty}\hat{Q}_J(f)=Q(f)\right]=1.$$ MC estimators converge at a (slow!) rate that is independent of the dimension $d$; the rate is the inverse square root of the no. of samples taken, i.e. like $J^{-1/2}$.

Let’s examine the random quadrature error $$E_J(f) := \hat{Q}_J(f) - Q(f),$$ which has mean zero and variance $$\mathbb{E}[|E_J(f)|^2] = \mathbb{E}\!\left[\left|\hat{Q}_J(f)-\mathbb{E}[\hat{Q}_J(f)]\right|^2\right] = \mathbb{V}[\hat{Q}_J(f)] = \frac{1}{J^2}\,J\,\mathbb{V}[f(x)] = \frac{1}{J}\,\mathbb{V}[f(x)].$$ i.e. the root mean square error is $$\sqrt{\mathbb{E}[|E_J(f)|^2]} = \frac{\sqrt{\mathbb{V}[f(x)]}}{\sqrt{J}}.$$ (For bounded $f$, one can often do much better using tools from concentration of measure.)

We can also obtain a probabilistic error bound using Chebyshev’s inequality: for any $\varepsilon>0$, $$\mathbb{P}\!\left[|E_J(f)|>\varepsilon\right] = \mathbb{P}\!\left[|\hat{Q}_J(f)-Q(f)|>\varepsilon\right] \le \frac{\mathbb{V}[\hat{Q}_J(f)]}{\varepsilon^2} = \frac{\mathbb{V}[f(x)]}{J\varepsilon^2}.$$ The $J\varepsilon^2$ part highlights the basic inverse sq. root cost-accuracy tradeoff in MC methods: if you want $[[UNCLEAR: \varepsilon/2 \text{ vs } \varepsilon]]$ (i.e. to double the accuracy), then you must quadruple $J$ since $$4 = \frac{1}{\sqrt{1/2}}.$$ **This is independent of the dimension of integration!**

But how can we apply the MC method if we cannot easily draw samples from $\mu$ / $\rho$. This spurs the Markov chain Monte Carlo (MCMC) methods we consider next.

**Note** that because $$\hat{Q}_J(f):=\frac{1}{J}\sum_{j=1}^J f(z_j)$$ uses only the values $f(z_j)$ and does not care about the spacing of the nodes $z_j$, the performance of $\hat{Q}_J$ is robust to poor features of $f$ (roughness, high-dim domain, ...), but it is also unable to leverage any nice features of $f$ (e.g. smoothness).
$\to$ **quasi-Monte Carlo methods** try to have the best of both worlds.

### Markov chain Monte Carlo

**Setup:** We have a formula for evaluating the target dens. $\rho$ but drawing samples from $\rho$ is hard/impossible. Our idea is to construct a random walk (more precisely, a Markov chain) of states $z_1,z_2,\ldots,z_t,\ldots$ in $\mathbb{R}^d$ such that

1. as $t\to\infty$, the distribution of $z_t$ should approach/converge to the target dist. $\mu$ / its PDF $\rho$;

2. the correlation between successive states should be small, so $\mathrm{Cov}[z_t,z_{t+1}]\to 0$ (quickly?) as $t\to\infty$, so that moderately spaced states are as good as being indep. samples from the target;

3. we want to approximate integrals: $$Q(f) := \int_{\mathbb{R}^d} f(x)\rho(x)\,dx = \lim_{T\to\infty}\frac{1}{T}\sum_{t=1}^T f(z_t).$$    (space average $=$ time average)

How do we construct such sequences $(z_t)_t$? We use a **transition kernel / Markov kernel** $$\chi(x,A) := \mathbb{P}[z_{t+1}\in A \mid z_t=x]$$ telling us the prob. dist. of the next state given the current one.

One minimal requirement (necessary but not sufficient for (i)–(iii)) is that the target $\mu$ be invariant under $\chi$, i.e. that if $z_t\sim\mu$, then $z_{t+1}\sim\chi(z_t,\cdot)$ should be $\mu$-distributed as well: $$\int_{\mathbb{R}^d}\chi(x,A)\,\mu(dx) = \mu(A) \qquad\text{for all measurable }A\subseteq\mathbb{R}^d.$$ In practice, to construct a $\chi$ that has $\mu$ as an invariant/equilibrium distn., we often construct a $\chi$ that satisfies **detailed balance / reversibility** w.r.t. $\mu$: $$\int_A \chi(x,B)\,\mu(dx) = \int_B \chi(x,A)\,\mu(dx) \qquad\text{for all measurable }A,B\subseteq\mathbb{R}^d.$$ **Proof that reversibility $\Rightarrow$ invariance.** Suppose that $\chi$ is $\mu$-reversible, and let $A\subseteq\mathbb{R}^d$. $$\int_{\mathbb{R}^d}\chi(x,A)\,\mu(dx) = \int_A \chi(x,\mathbb{R}^d)\,\mu(dx) = \int_A 1\,\mu(dx) = \mu(A).$$ $\square$

### The Metropolis–Hastings (MH) scheme

The Metropolis–Hastings (MH) scheme offers a simple implementation of a $\mu$-reversible (and hence $\mu$-invariant) transition kernel $\chi$, in two steps.

We need one further prob. distn., called the **proposal distribution** $Q(x,A)$ with PDF $q(x,x')$.

1. Given that $z_t=x$, draw a proposed new state $z'$ with PDF $q(x,\cdot)$.
   (here we need the proposal to be quick and easy to sample)

2. Calculate the **acceptance probability** $\alpha(z_t,z')$, where $$\alpha(x,x') := \min\!\left(1,\ \frac{\rho(x')\,q(x',x)}{\rho(x)\,q(x,x')}\right).$$    In practice, we HARD-code $\log\rho$’s, $\log q$’s, etc, and compare $\log[[UNCLEAR: z \text{ vs } u]]$ to $\log\alpha$.

3. Draw $z\sim\mathrm{Unif}([0,1])$.
   1. if $z\le \alpha(z_t,z')$, then we accept the proposal and set $z_{t+1}:=z'$;
   2. if $z>\alpha(z_t,z')$, then we reject the proposal and set $z_{t+1}:=z_t$.

**FACT:** The MH scheme always yields a kernel $\chi_{\mathrm{MH}}$, i.e. a rule for sampling $z_{t+1}$ given $z_t$, that is reversible w.r.t. $\mu$ and hence has the target as an invariant distn.