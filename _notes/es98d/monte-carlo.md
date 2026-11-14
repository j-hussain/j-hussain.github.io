---
title: "4. Sampling without knowing the partition function"
---

Suppose we want the mean separation of particles under the [canonical position law](/notes/es98d/equilibrium#canonical). We can evaluate $U(r)$ for any proposed configuration, but cannot integrate $e^{-\beta U}$ over a space with $dN$ coordinates. The normalising constant is the very integral we hoped sampling would avoid. How can an algorithm use a distribution it cannot normalise?

The answer will be to compare local probability ratios. Before introducing a chain, we should understand what ordinary independent sampling already provides, and what we give up by replacing it.

<h2 id="independent">4.1 An integral is an expectation under a chosen measure</h2>

Let $I=\int_D f(x)dx$ and choose a normalised sampling density $p(x)$ positive wherever $f$ contributes. If $X_1,\ldots,X_M$ are independent draws from $p$, then

$$
I=\mathbb E_p\left[\frac{f(X)}{p(X)}\right],
\qquad \widehat I_M=\frac1M\sum_{n=1}^M\frac{f(X_n)}{p(X_n)}.
$$

Absolute integrability justifies the expectation and a law of large numbers. If $\sigma^2=\operatorname{Var}_p(f/p)$ is finite, the estimator is unbiased and has variance $\sigma^2/M$. A central limit theorem then gives the familiar $M^{-1/2}$ standard-error rate. The exponent does not depend on dimension; the variance and cost per evaluation certainly can.

For a finite-volume domain of volume $|D|$, uniform sampling gives $\widehat I_M=|D|M^{-1}\sum_n f(X_n)$. Hit-or-miss sampling gives another low-dimensional construction: for $0\le f(x)\le B$, draw uniformly from $D\times[0,B]$ and estimate $I$ by $|D|B$ times the fraction lying below the graph. This trades function values for indicators and often increases variance. In low dimensions, smooth deterministic quadrature can be far more efficient.

Independent draws can be obtained by inverse transforms in suitable one-dimensional distributions or by rejection sampling. The latter uses an envelope $f(x)\le c p(x)$ for a nonnegative unnormalised target, accepting a proposal $X\sim p$ with probability $f(X)/(cp(X))$. It does not require the target normaliser, but it does require a valid envelope, which can be extremely inefficient in high dimensions. Thus an unknown partition function is an obstacle, not a proof that all direct sampling is impossible.

<h2 id="importance">4.2 Spend samples where they matter</h2>

Importance sampling chooses $p$ to reduce fluctuations in $f/p$. For a nonnegative integrand, the ideal choice $p\propto f$ makes that quantity constant, but normalising this ideal density requires knowing $I$. For signed $f$, $p\propto|f|$ minimises the second moment among admissible densities, yet cancellation can still make relative error large.

In statistical mechanics the desired quantity is usually a ratio:

$$
\langle A\rangle=\frac{\int A(x)e^{-\beta U(x)}dx}
{\int e^{-\beta U(x)}dx}.
$$

If independent samples from $\pi\propto e^{-\beta U}$ were available, we would simply average $A$. Sampling from an accessible auxiliary $p$ instead gives a self-normalised weighted estimator. It is generally biased at finite $M$, and poor overlap can concentrate almost all weight on a handful of observations. We need a way to target the physically relevant configurations without constructing a global independent sampler.

<h2 id="sampling">4.3 Replace a global draw by local transitions</h2>

A Markov chain $X_0,X_1,\ldots$ has the property that the law of $X_{n+1}$ conditional on its history depends only on $X_n$. Its transition kernel $P(x,dy)$ describes that law. On a finite state space it is a matrix with nonnegative entries and rows summing to one.

A measure $\pi$ is **stationary** when

$$
\pi(y)=\sum_x\pi(x)P(x,y),
$$

or, in continuous state space, $\pi(B)=\int\pi(dx)P(x,B)$ for every measurable set $B$. A chain started at stationarity has the right distribution at every step, although successive states may be strongly correlated. Starting from a convenient $x_0$ instead introduces an equilibration problem.

<h2 id="balance">4.4 Balance probability flow</h2>

Stationarity balances all incoming flow. A stronger sufficient condition is **detailed balance**:

$$
\pi(x)P(x,y)=\pi(y)P(y,x).
$$

Summing over $x$ proves stationarity because the rows of $P$ sum to one. Detailed balance also makes the stationary chain reversible: a finite path has the same probability as its time reverse. It is useful for constructing algorithms, but it is not required for equilibrium sampling.

<h2 id="metropolis">4.5 The Metropolis–Hastings construction</h2>

At $x$, propose $y$ from $q(x,dy)$. When target and proposal densities are available, accept with

$$
\alpha(x,y)=\min\left\{1,
\frac{\pi(y)q(y,x)}{\pi(x)q(x,y)}\right\}.
$$

A proposal with positive forward density and zero reverse density has acceptance zero in this construction. For $y\ne x$, the probability flux is

$$
\pi(x)q(x,y)\alpha(x,y)
=\min\{\pi(x)q(x,y),\pi(y)q(y,x)\}.
$$

This expression is symmetric in $x,y$, proving detailed balance. The unused probability remains at $x$, completing the stochastic kernel. The diagonal term must be included; a proposed move and an actual transition are different objects.

For a symmetric proposal and a Boltzmann target,

$$
\alpha(x,y)=\min\{1,e^{-\beta\Delta U}\},
\qquad \Delta U=U(y)-U(x).
$$

The partition function cancels in $\pi(y)/\pi(x)$. Downhill moves are accepted; uphill moves are sometimes accepted because equilibrium is a distribution, not an optimisation problem. A practical update draws an independent $u\sim\mathrm{Uniform}(0,1)$ and accepts when $\log u<\min(0,-\beta\Delta U)$. Rejection records the current state again.

<h3 id="residence">A rejection is part of the sample</h3>

Consider two states of energies $0$ and $\Delta$, with $e^{-\beta\Delta}=1/4$. Always propose the other state. The transition matrix and stationary probabilities are

$$
P=\begin{pmatrix}3/4&1/4\\1&0\end{pmatrix},
\qquad \pi=(4/5,1/5).
$$

The equilibrium flux in either direction is $1/5$. Imagine deleting every repeated state from a trajectory. What distribution would the remaining sequence represent?

<PredictReveal question="If we save only accepted moves in this two-state chain, what fraction of saved states are excited?" choices={[{id:"boltzmann",label:"One fifth, the Boltzmann probability"},{id:"half",label:"One half, because accepted jumps alternate"}]} answer="half" explanation={<p>Accepted jumps alternate between the two states. Their unweighted histogram is one half in each state. The repeated ground-state observations carry the longer residence time required for its equilibrium probability of four fifths.</p>} />

<Figure id="es98d-residence" title="Jump counts and residence counts differ" caption="Expected residence lengths per alternating two-jump cycle of the exact two-state chain. These are expectations, not a sample trajectory.">
<div className="sci-story-grid sci-story-two">
<div className="sci-story-panel"><h4>Count jumps: one visit each</h4><svg className="sci-story-svg" viewBox="0 0 300 240" role="img" aria-label="Accepted jumps alternate between ground and excited states, one visit each."><text x="25" y="55" textAnchor="start">ground → excited → ground</text><line x1="55" y1="158" x2="250" y2="158" stroke="currentColor" strokeWidth="1.5" /><circle cx="70" cy="158" r="10" fill="var(--sci-accent)" /><circle cx="220" cy="158" r="10" fill="var(--sci-secondary)" /><text x="70" y="195" textAnchor="middle">1 visit</text><text x="220" y="195" textAnchor="middle">1 visit</text></svg><p>Ignoring holding times gives equal jump frequencies.</p></div>
<div className="sci-story-panel"><h4>Count attempts: residence 4 : 1</h4><svg className="sci-story-svg" viewBox="0 0 300 240" role="img" aria-label="Expected ground holding time four attempts; expected excited holding time one attempt."><text x="20" y="46" textAnchor="start">ground: E[K] = 4</text><text x="20" y="78" textAnchor="start">excited: E[K] = 1</text><line x1="30" y1="138" x2="250" y2="138" stroke="currentColor" strokeWidth="1.5" /><circle cx="45" cy="138" r="9" fill="var(--sci-accent)" /><circle cx="85" cy="138" r="9" fill="var(--sci-accent)" /><circle cx="125" cy="138" r="9" fill="var(--sci-accent)" /><circle cx="165" cy="138" r="9" fill="var(--sci-accent)" /><circle cx="220" cy="138" r="9" fill="var(--sci-secondary)" /><text x="30" y="190" textAnchor="start">probabilities 4/5 and 1/5</text></svg><p>Residence-weighted observations recover the Boltzmann probabilities.</p></div>
</div>
</Figure>

The figure shows expected residence per two-jump cycle, not a randomly generated trajectory. This distinction will explain why [rejection-free methods](/notes/es98d/event-chains#waiting) must retain waiting-time information rather than merely delete rejections.

<h2 id="ergodicity">4.6 Invariance is necessary, exploration is additional</h2>

For a finite state space, irreducibility means every state can reach every other in some finite number of transitions. With irreducibility, a stationary probability is unique and time averages of integrable observables obey an ergodic law. Aperiodicity additionally gives convergence of the time-$n$ distribution from every starting state. A finite irreducible chain is positive recurrent automatically. For countably infinite chains, positive recurrence is an additional requirement; continuous-state theorems use measure-theoretic irreducibility and suitable Harris-recurrence hypotheses. Exact-point reachability is not the right definition for a continuous density.

Rejections can establish aperiodicity if they produce a positive self-transition in an irreducible finite chain. Metropolis does not guarantee that this happens. With a uniform target and a forced two-state flip, every proposal is accepted and the chain alternates forever. It has a valid stationary law and valid time averages, but its one-time distribution does not converge from a fixed initial state. A lazy update, retaining the state with some fixed positive probability, removes that periodicity while preserving the target.

Nor can acceptance rules repair disconnected proposals. Moves restricted to one basin or one conserved sector cannot sample a target that also assigns mass elsewhere. At zero temperature, uphill acceptance vanishes and finite-temperature irreducibility arguments may fail.

<h2 id="moves">4.7 Moves inherit the geometry of the state space</h2>

For atomistic NVT sampling, select a particle uniformly and displace it by a symmetric random vector. Periodic wrapping preserves that symmetry when implemented consistently. Only interactions involving the moved particle change for a pairwise model, so the energy difference can often be evaluated locally. Very small displacements give high acceptance but slow exploration; very large ones mostly fail. The useful criterion is uncertainty per computation, not acceptance alone.

For an Ising configuration from [Chapter 2](/notes/es98d/interaction-models#spins), a symmetric single-spin proposal gives

$$
\Delta H=2s_i\left(\sum_{j:\langle i,j\rangle}J_{ij}s_j+b_i\right),
\qquad \alpha=\min\{1,e^{-\beta\Delta H}\}.
$$

Rotations of rigid molecules, vector-spin rotations, collective displacements and occupation exchanges require proposals defined with respect to their appropriate measures. Particle insertions and deletions target open ensembles, with chemical potential, particle-number factors and proposal volumes in the acceptance ratio; the fixed-$N$ displacement rule cannot be reused unchanged. Pressure-controlled simulations combine position moves with the [volume acceptance ratio](/notes/es98d/equilibrium#npt).

MCMC constructs a tool for integration. Its step count does not generally represent physical time. We can use it to predict equilibrium energy or structure, but not infer a transport coefficient from an arbitrary sequence of accepted displacements. The next chapter separates these observables and quantifies the information in correlated samples.

### Exercises

1. Verify $\pi P=\pi$ in the two-state example and show that the accepted-jump chain has a different stationary distribution.
2. Prove that $(I+P)/2$ preserves any stationary measure of $P$. What happens to its finite-state period?
3. Derive the Ising energy change by cancelling all bonds not incident on the flipped site.
