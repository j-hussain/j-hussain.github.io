---
title: "7. Rejection, waiting times and persistent motion"
---

[Cluster updates](/notes/es98d/collective-updates) attack a collective length scale. Another source of wasted work is a long run of rejected proposals. Can we skip directly to the next change? The two-state example already warns us that deleting repeated states changes the sampling measure. A correct event method must preserve the probability carried by the time spent between changes.

There are two useful constructions here: skip the waiting in a given local process, or design a different process with persistent motion. They share event-based computation, but their clocks and mathematical mechanisms differ.

<h2 id="waiting">7.1 Skip rejections without deleting residence probability</h2>

For a finite discrete-time kernel $P$, let

$$
a(x)=\sum_{y\ne x}P(x,y)=1-P(x,x).
$$

When $a(x)>0$, the number $K$ of attempts up to and including the next departure is geometric:

$$
\Pr(K=k\mid x)=[1-a(x)]^{k-1}a(x),\qquad k\ge1.
$$

Draw $K$ directly, then choose the destination from $P(x,y)/a(x)$ for $y\ne x$. This reproduces the jump destinations and waiting times of the original chain. Weight an observable by the realised number of attempts spent in each state, truncating the last residence if using a fixed attempt budget. Do not take an unweighted average over jumps.

Indeed, if $\pi P=\pi$, the jump chain has stationary weight proportional to $\pi(x)a(x)$: frequently departing states are overrepresented among departures. Residence weights recover $\pi$. In the earlier two-state example, $a(0)=1/4$ and $a(1)=1$, so these jump weights are equal even though the equilibrium weights are $4:1$.

A continuous-time Markov jump process instead specifies rates $w(x,y)$ and total rate $R(x)=\sum_{y\ne x}w(x,y)$. Its waiting time is exponential, $\Delta t=-\log u/R(x)$, and the next destination has probability $w(x,y)/R(x)$. Time averages retain those holding times. [Bortz–Kalos–Lebowitz](https://cmsr.rutgers.edu/images/people/lebowitz_joel/publications-archived/1975jcp-bortz_kalos_113.pdf), often called the n-fold way for spin systems, organises possible events into classes to avoid repeated failed attempts. Whether this time is physical depends on how the rates were calibrated; equilibrium balance alone does not calibrate kinetics.

Avoiding rejections can save substantial work, but maintaining all event rates has a cost. It also does not remove the local critical bottleneck diagnosed in Chapter 6.

<h2 id="lifting">7.2 Make persistence Markovian by enlarging the state</h2>

Suppose the next move depends on the direction used in the previous move. Position alone may no longer form a Markov process. Add the direction explicitly and use the extended state $(x,\sigma)$, with target

$$
\widetilde\pi(x,\sigma)=\pi(x)\nu(\sigma).
$$

This is **lifting**. If the extended process preserves $\widetilde\pi$, summing or integrating over $\sigma$ gives the desired physical marginal $\pi$. The added variable does not change the equilibrium target; it changes how we travel through it.

A simple example is a uniform target on a finite ring of at least three sites. Extend the state by $\sigma\in\{-1,+1\}$. With positive probabilities, either stay, reverse $\sigma$, or move one site in direction $\sigma$. Each operation preserves the uniform extended measure; the mixture is irreducible and aperiodic when all three probabilities are positive. Directed moves have no reverse edge at the same $\sigma$, so detailed balance fails even though stationarity holds. Persistence is controlled by the relative movement and refresh probabilities. Too little refreshing can leave important directions unexplored.

This example establishes possibility, not a universal speedup. Reversibility does not force all algorithms to be inefficient, and lifting by itself does not guarantee nonreversibility or improved mixing.

<h2 id="events">7.3 Transfer motion instead of rejecting a displacement</h2>

In event-chain Monte Carlo, use an extended state $(r,i,e)$: positions, the active particle index and a direction. Only particle $i$ moves, with $dr_i/d\ell=e$ for displacement parameter $\ell$. At an interaction event, activity transfers to a partner. Refreshing directions and ending chains according to a specified rule provides additional exploration.

For hard spheres, the next event is a contact along the chosen direction. Moving the contacted particle onward transfers the constraint without creating an overlap. For smooth potentials, an event is not an arbitrary threshold at which the potential “changes”. It is drawn from a specific hazard law. The factorised filter and lifting construction are developed in [Krauth's ECMC review](https://www.frontiersin.org/journals/physics/articles/10.3389/fphy.2021.663457/full); here we derive the pair-potential version needed for our course.

<h2 id="hazards">7.4 An energy increase defines an event hazard</h2>

Suppose $U=\sum_f U_f$, where factors can be pair energies. A factorised Metropolis filter is

$$
\alpha_{\mathrm{fac}}(r,r')
=\prod_f\min\{1,e^{-\beta\Delta U_f}\}.
$$

It differs from $\min\{1,e^{-\beta\sum_f\Delta U_f}\}$: a favourable factor cannot compensate an unfavourable one. For a symmetric discrete proposal, the forward/reverse ratio is nevertheless $e^{-\beta\Delta U}$, so the factorised filter also preserves the Boltzmann target.

For an infinitesimal displacement $d\ell$, factor $f$ produces an event at rate per unit displacement

$$
\lambda_f(\ell)=\beta\left[\frac{dU_f(r(\ell))}{d\ell}\right]_+,
\qquad [z]_+=\max(z,0).
$$

Its survival probability is $\exp[-\int_0^\ell\lambda_f(s)ds]$. Draw an independent exponential threshold $E_f=-\log u_f$ and solve

$$
\int_0^{\ell_f}\lambda_f(s)ds=E_f.
$$

The smallest candidate $\ell_f$ supplies the next event. A factor with zero integrated hazard over the allowed flight has no finite event. Numerical implementations need exact inversion or valid thinning/bounding schemes; an inaccurate event search can change the invariant measure.

For a monotone uphill segment, the condition simplifies to $\beta[U_f(\ell_f)-U_f(0)]=E_f$. If the factor first decreases, only subsequent positive variation contributes. This is why the positive derivative, rather than net energy change over a long flight, appears in the law.

For a concrete fixed pair, take $U_{ij}=k(x_i-x_j)^2/2$, initially $x_i=x_j=0$, direction $+1$, and $\beta=k=1$. Moving $i$ gives integrated hazard $\ell^2/2$. An illustrative threshold $E=1/2$ therefore causes an event at $\ell=1$. Activity transfers to $j$, whose first displacement reduces the pair energy. The figure tracks coordinates and activity separately; the value $E=1/2$ is chosen for explanation, not claimed to be a random draw.

<Figure id="es98d-event" title="An event changes the active coordinate" caption="One-dimensional harmonic pair, β = k = 1, with a chosen exponential threshold E = 1/2. The event is at displacement 1; the second panel shows a subsequent energy-decreasing flight to displacement 1/2 of j.">
<div className="sci-story-grid sci-story-two">
<div className="sci-story-panel"><h4>Active i moves uphill</h4><svg className="sci-story-svg" viewBox="0 0 300 240" role="img" aria-label="Initially both coordinates zero. Active particle i moves to one while j remains zero. Integrated hazard one half."><line x1="40" y1="155" x2="260" y2="155" stroke="currentColor" strokeWidth="1.5" /><text x="40" y="182" textAnchor="middle">0</text><text x="260" y="182" textAnchor="middle">1</text><circle cx="40" cy="155" r="9" fill="var(--sci-secondary)" /><circle cx="260" cy="155" r="9" fill="var(--sci-accent)" /><text x="45" y="113" textAnchor="start">j = 0</text><text x="205" y="113" textAnchor="start">i = 1</text><text x="35" y="45" textAnchor="start">∫ λ dℓ = ℓ² / 2</text><text x="35" y="75" textAnchor="start">event at ℓ = 1</text></svg><p>The event threshold determines where activity transfers from i to j.</p></div>
<div className="sci-story-panel"><h4>Active j moves downhill</h4><svg className="sci-story-svg" viewBox="0 0 300 240" role="img" aria-label="Particle i remains at one; active j has reached one half, reducing the pair separation and energy."><line x1="40" y1="155" x2="260" y2="155" stroke="currentColor" strokeWidth="1.5" /><text x="40" y="182" textAnchor="middle">0</text><text x="260" y="182" textAnchor="middle">1</text><circle cx="260" cy="155" r="9" fill="var(--sci-secondary)" /><circle cx="150" cy="155" r="9" fill="var(--sci-accent)" /><text x="122" y="113" textAnchor="start">j = 1/2</text><text x="210" y="113" textAnchor="start">i = 1</text><text x="35" y="45" textAnchor="start">pair energy decreases</text><text x="35" y="75" textAnchor="start">this factor has λ = 0</text></svg><p>Teal marks activity, not a permanent particle identity. No uphill hazard is accumulated on this initial downhill segment.</p></div>
</div>
</Figure>

<h2 id="balance">7.5 Check the stationary flow in the lifted space</h2>

For a translation-invariant pair potential, define $a_{ij}=e\cdot\nabla_i u_{ij}$. Translation invariance gives $e\cdot\nabla_j u_{ij}=-a_{ij}$. When $i$ is active, its event rate to $j$ is $\beta[a_{ij}]_+$. For a target uniform in active index, the incoming minus outgoing event current at $(r,i,e)$ from that partner is

$$
\frac\pi N\beta\bigl([-a_{ij}]_+-[a_{ij}]_+\bigr)
=-\frac\pi N\beta a_{ij}.
$$

Meanwhile the divergence of deterministic transport contributes

$$
-\nabla_i\cdot\left(e\frac\pi N\right)
=\frac\pi N\beta\,e\cdot\nabla_i U
=\frac\pi N\beta\sum_{j\ne i}a_{ij}.
$$

These terms cancel after summing over partners. That is a global-balance calculation for this pair-factor setting with appropriate periodic or decay boundaries. It does not assert pairwise detailed balance of the lifted motion. External fields, many-body factors, constraints and long-range event searches need their corresponding lifting rules; simply transferring to an arbitrary neighbour is not a general algorithm.

Event-chain motion is continuous in displacement parameter, with discrete changes of activity. Its clock is algorithmic, rather than Newtonian time. Sampling at fixed displacement intervals retains the invariant marginal; recording only event endpoints without accounting for inter-event residence generally changes the observation measure. Direction refreshing, factor-search cost and observable-specific correlation determine practical efficiency.

The course has now developed three distinct ways to change exploration: local stochastic proposals, collective clusters and persistent lifted motion. None alters what a physical particle means. [The next chapter](/notes/es98d/continuum-particles) makes that modelling change explicitly, replacing atoms with parcels of a continuum.

### Exercises

1. Show that the stationary jump-chain law is proportional to $\pi(x)a(x)$ using $\pi P=\pi$.
2. Verify global balance for the persistent ring mixture. Identify an edge that violates detailed balance.
3. In the harmonic-pair event example, derive the event displacement for arbitrary $E>0$, $\beta>0$ and $k>0$.
