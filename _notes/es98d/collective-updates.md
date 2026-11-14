---
title: "6. Critical fluctuations need collective moves"
---

A local update can be valid and still be a poor way to explore equilibrium. In a ferromagnet, neighbouring spins cooperate over increasingly large distances near a continuous phase transition. Changing one spin is then a small perturbation of the object we need to rearrange: an extended correlated domain.

The [uncertainty chapter](/notes/es98d/uncertainty-observables#variance) gave this problem a measurable consequence: a long autocorrelation time for the observable of interest. We now change the geometry of an update while preserving the same equilibrium distribution.

<h2 id="critical">6.1 Local correctness does not resolve large scales</h2>

Consider the zero-field nearest-neighbour ferromagnetic Ising model on a square lattice,

$$
H(s)=-J\sum_{\langle i,j\rangle}s_is_j,
\qquad s_i\in\{-1,+1\},\quad J>0.
$$

Each bond appears once. The magnetisation per spin is $m=N^{-1}\sum_i s_i$. A local flip has $\Delta H=2Js_i\sum_{j\sim i}s_j$, giving the Metropolis rule already derived in [Chapter 4](/notes/es98d/monte-carlo#moves).

For the infinite square lattice, [the exact Ising solution](https://www.lps.ens.fr/~krzakala/ISINGMODEL.pdf) gives the critical temperature $k_BT_c/J=2/\log(1+\sqrt2)$. In a finite zero-field box, spin-inversion symmetry gives the exact equilibrium mean $\langle m\rangle=0$ at every temperature. Low-temperature order is instead visible through $\langle|m|\rangle$, the two peaks of the magnetisation distribution, or a thermodynamic limit with symmetry breaking specified. A short run trapped in one sign is not evidence that finite-volume equilibrium has lost its symmetry.

Near criticality, the correlation length $\xi$ becomes large. Local-update relaxation often scales as $\tau\sim\xi^z$, saturating at a system-size-dependent value in a finite box. Units matter: a sweep is $N$ attempted local flips. Comparing a single local attempt with a whole cluster construction is not a fair cost comparison.

Low acceptance can contribute to slow motion, especially for a spin deep inside an ordered region. But critical slowing is not simply “most moves are rejected”. Even accepted local moves communicate change slowly across a large correlated domain. A rejection-free local algorithm can therefore retain critical slowing.

<PredictReveal question="If a local sampler accepts every update, must its magnetisation decorrelate rapidly near criticality?" choices={[{id:"yes",label:"Yes: rejection was the only obstacle"},{id:"no",label:"No: local changes can still relax large domains slowly"}]} answer="no" explanation={<p>Acceptance measures whether an attempted update changes the state. Magnetisation decorrelation depends on how those changes reorganise fluctuations across the system. Collective length scales can remain slow even when no proposal is discarded.</p>} />

<h2 id="bonds">6.2 Make clusters part of an exact joint distribution</h2>

A cluster must not simply be chosen by visual resemblance and flipped with probability one. Its construction must encode the Boltzmann weights. For one ferromagnetic bond,

$$
e^{\beta Js_is_j}
=e^{\beta J}\left[(1-p)+p\,\mathbf1_{s_i=s_j}\right],
\qquad p=1-e^{-2\beta J}.
$$

Check both cases. Aligned spins give $e^{\beta J}$; opposite spins give $e^{\beta J}(1-p)=e^{-\beta J}$. Introduce a bond variable $b_{ij}\in\{0,1\}$ and the joint weight

$$
\prod_{\langle i,j\rangle}
\left[(1-p)\mathbf1_{b_{ij}=0}
+p\mathbf1_{b_{ij}=1}\mathbf1_{s_i=s_j}\right].
$$

Summing over bonds recovers the Ising distribution up to the constant $e^{\beta J}$ per edge. Given spins, compatible aligned edges are independently occupied with probability $p$, while opposite-spin edges cannot be occupied. Given bonds, all spins in each connected cluster must agree, but different clusters have independent, equally likely signs at zero field.

The following fixed example distinguishes aligned neighbours from occupied bonds. A cluster is a connected component of the randomly occupied edges, not necessarily a whole visible same-sign domain. The highlighted cluster can change sign without changing the occupied-bond constraints.

<Figure id="es98d-cluster" title="Flip a bond-connected component" caption="A fixed open 3×3 example, not a random cluster draw or critical configuration. The highlighted four-site component is one valid occupied-bond component. Dotted edges remain lattice edges but are unoccupied.">
<div className="sci-story-grid sci-story-two">
<div className="sci-story-panel"><h4>Aligned does not mean bonded</h4><svg className="sci-story-svg" viewBox="0 0 300 240" role="img" aria-label="Nine spins with an occupied four-site plus cluster. Some adjacent equal spins have unoccupied bonds."><line x1="65" y1="55" x2="145" y2="55" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="65" y1="55" x2="65" y2="120" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="145" y1="55" x2="225" y2="55" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="145" y1="55" x2="145" y2="120" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="225" y1="55" x2="225" y2="120" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="65" y1="120" x2="145" y2="120" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="65" y1="120" x2="65" y2="185" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="145" y1="120" x2="225" y2="120" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="145" y1="120" x2="145" y2="185" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="225" y1="120" x2="225" y2="185" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="65" y1="185" x2="145" y2="185" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="145" y1="185" x2="225" y2="185" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="65" y1="55" x2="145" y2="55" stroke="var(--sci-accent)" strokeWidth="1.5" /><line x1="65" y1="55" x2="65" y2="120" stroke="var(--sci-accent)" strokeWidth="1.5" /><line x1="65" y1="120" x2="145" y2="120" stroke="var(--sci-accent)" strokeWidth="1.5" /><circle cx="65" cy="55" r="16" fill="var(--background-color)" stroke="var(--sci-accent)" strokeWidth="3" /><text x="65" y="60" textAnchor="middle">1</text><circle cx="145" cy="55" r="16" fill="var(--background-color)" stroke="var(--sci-accent)" strokeWidth="3" /><text x="145" y="60" textAnchor="middle">1</text><circle cx="225" cy="55" r="16" fill="var(--background-color)" stroke="currentColor" strokeWidth="1" /><text x="225" y="60" textAnchor="middle">-1</text><circle cx="65" cy="120" r="16" fill="var(--background-color)" stroke="var(--sci-accent)" strokeWidth="3" /><text x="65" y="125" textAnchor="middle">1</text><circle cx="145" cy="120" r="16" fill="var(--background-color)" stroke="var(--sci-accent)" strokeWidth="3" /><text x="145" y="125" textAnchor="middle">1</text><circle cx="225" cy="120" r="16" fill="var(--background-color)" stroke="currentColor" strokeWidth="1" /><text x="225" y="125" textAnchor="middle">-1</text><circle cx="65" cy="185" r="16" fill="var(--background-color)" stroke="currentColor" strokeWidth="1" /><text x="65" y="190" textAnchor="middle">-1</text><circle cx="145" cy="185" r="16" fill="var(--background-color)" stroke="currentColor" strokeWidth="1" /><text x="145" y="190" textAnchor="middle">1</text><circle cx="225" cy="185" r="16" fill="var(--background-color)" stroke="currentColor" strokeWidth="1" /><text x="225" y="190" textAnchor="middle">1</text><text x="150" y="228" textAnchor="middle">solid edges: occupied bonds</text></svg><p>Three occupied edges connect four sites. Other equal-spin edges were not occupied in this illustrative realisation.</p></div>
<div className="sci-story-panel"><h4>Change a whole component</h4><svg className="sci-story-svg" viewBox="0 0 300 240" role="img" aria-label="The four-site cluster changes from plus one to minus one, with occupied bonds unchanged."><line x1="65" y1="55" x2="145" y2="55" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="65" y1="55" x2="65" y2="120" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="145" y1="55" x2="225" y2="55" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="145" y1="55" x2="145" y2="120" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="225" y1="55" x2="225" y2="120" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="65" y1="120" x2="145" y2="120" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="65" y1="120" x2="65" y2="185" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="145" y1="120" x2="225" y2="120" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="145" y1="120" x2="145" y2="185" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="225" y1="120" x2="225" y2="185" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="65" y1="185" x2="145" y2="185" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="145" y1="185" x2="225" y2="185" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 5" /><line x1="65" y1="55" x2="145" y2="55" stroke="var(--sci-accent)" strokeWidth="1.5" /><line x1="65" y1="55" x2="65" y2="120" stroke="var(--sci-accent)" strokeWidth="1.5" /><line x1="65" y1="120" x2="145" y2="120" stroke="var(--sci-accent)" strokeWidth="1.5" /><circle cx="65" cy="55" r="16" fill="var(--background-color)" stroke="var(--sci-accent)" strokeWidth="3" /><text x="65" y="60" textAnchor="middle">-1</text><circle cx="145" cy="55" r="16" fill="var(--background-color)" stroke="var(--sci-accent)" strokeWidth="3" /><text x="145" y="60" textAnchor="middle">-1</text><circle cx="225" cy="55" r="16" fill="var(--background-color)" stroke="currentColor" strokeWidth="1" /><text x="225" y="60" textAnchor="middle">-1</text><circle cx="65" cy="120" r="16" fill="var(--background-color)" stroke="var(--sci-accent)" strokeWidth="3" /><text x="65" y="125" textAnchor="middle">-1</text><circle cx="145" cy="120" r="16" fill="var(--background-color)" stroke="var(--sci-accent)" strokeWidth="3" /><text x="145" y="125" textAnchor="middle">-1</text><circle cx="225" cy="120" r="16" fill="var(--background-color)" stroke="currentColor" strokeWidth="1" /><text x="225" y="125" textAnchor="middle">-1</text><circle cx="65" cy="185" r="16" fill="var(--background-color)" stroke="currentColor" strokeWidth="1" /><text x="65" y="190" textAnchor="middle">-1</text><circle cx="145" cy="185" r="16" fill="var(--background-color)" stroke="currentColor" strokeWidth="1" /><text x="145" y="190" textAnchor="middle">1</text><circle cx="225" cy="185" r="16" fill="var(--background-color)" stroke="currentColor" strokeWidth="1" /><text x="225" y="190" textAnchor="middle">1</text><text x="150" y="228" textAnchor="middle">solid edges: occupied bonds</text></svg><p>The occupied-bond compatibility condition survives the flip; boundary energy is handled by construction probabilities.</p></div>
</div>
</Figure>

<h2 id="clusters">6.3 Two ways to use the same bond representation</h2>

The **Swendsen–Wang algorithm** alternates the two exact conditional draws. Starting from spins, populate the compatible bonds. Find their connected components. Assign each component a sign independently with probability $1/2$. This is Gibbs sampling of the joint spin–bond measure, so its spin marginal is the desired Boltzmann measure. Conditional resampling explains why no additional Metropolis acceptance is needed.

The **Wolff algorithm** constructs only one component. Pick a seed site uniformly. For each eligible edge from a cluster site to an as-yet-unassigned aligned neighbour, test occupation with probability $p$; continue through newly added sites, then flip the completed cluster. Each eligible edge is treated according to the bond construction, rather than repeatedly tested until it succeeds.

Why does the single-cluster flip preserve equilibrium? Suppose a cluster $C$ of sign $s$ is flipped. Let $n_{\mathrm{same}}$ count boundary edges to outside spins initially equal to $s$, and $n_{\mathrm{opp}}$ count those initially opposite. Its energy change is

$$
\Delta H=2J(n_{\mathrm{same}}-n_{\mathrm{opp}}).
$$

Every same-sign boundary edge must have failed to join the cluster, contributing $1-p$. In the reverse construction, the corresponding failures occur at the previously opposite edges. Internal construction factors and seed choices match, so

$$
\frac{q(s\to s')}{q(s'\to s)}
=(1-p)^{n_{\mathrm{same}}-n_{\mathrm{opp}}}
=e^{-\beta\Delta H}=\frac{\pi(s')}{\pi(s)}.
$$

Consequently $\pi(s)q(s\to s')=\pi(s')q(s'\to s)$ even though the completed cluster is always flipped. The probability of constructing the cluster already accounts for its energetic cost. This is the key difference from an arbitrary multi-spin flip.

<h2 id="scope">6.4 Collective updates improve a particular obstruction</h2>

Near the unfrustrated zero-field critical point, these algorithms substantially reduce the cost of rearranging long-wavelength fluctuations. They do not guarantee independent samples or eliminate all critical scaling. Estimate autocorrelation for the actual energy, magnetisation or structural observable being measured, and include cluster-building cost.

The elementary construction assumes ferromagnetic bonds and zero field. A nonzero field changes cluster sign probabilities; frustrated or antiferromagnetic systems require different constructions or transformations where available. At the infinite-temperature endpoint, deterministic flipping rules may also require aperiodicity care. An algorithm's impressive performance in one model is not a theorem about all interaction graphs.

We have changed _which coordinates move together_. [Event-chain methods](/notes/es98d/event-chains) will make a different change: preserve a direction of motion and redirect it at events, rather than repeatedly proposing a fresh local random walk.

### Exercises

1. Verify the one-bond identity in both spin cases and derive $p$ from it.
2. For a proposed cluster, count its boundary edges and verify the Wolff probability ratio above.
3. Explain why a finite-box mean magnetisation can be zero while its typical magnitude is large.
