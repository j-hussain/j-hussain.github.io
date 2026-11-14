---
title: "1. Equilibrium is a probability measure"
---

A particle in a potential well does not sit forever at the minimum when its surroundings are warm. It fluctuates. If we could take a photograph at a randomly chosen equilibrium time, where would we expect to find it? The answer requires both an energy model and a rule for assigning probability to configurations. Those are separate choices: the same interaction energy can be studied at fixed energy, fixed temperature or fixed pressure.

We will use this separation throughout ES98D. First identify the physical degrees of freedom and the probability measure they should follow. Then construct a trajectory or a sampling algorithm that preserves that measure. Finally ask how much information a finite simulation contains. An attractive trajectory alone answers none of these questions.

<h2 id="bath">1.1 Count the states we do not simulate</h2>

Let a small system have a particular microstate $x$ with energy $E(x)$. Put it in weak thermal contact with a much larger bath, while keeping their combined energy $E_{\mathrm{tot}}$ fixed. Weak coupling means that the interaction energy can be neglected in the energy bookkeeping. If all accessible microstates of the isolated composite are equally weighted, the probability of $x$ is proportional to the number of compatible bath states:

$$
\Pr(x)\propto\Omega_B(E_{\mathrm{tot}}-E(x)).
$$

The bath has fewer states available when the system takes more energy. To quantify that tradeoff, introduce its entropy $S_B(E)=k_B\log\Omega_B(E)$. Taylor expansion gives

$$
S_B(E_{\mathrm{tot}}-E(x))
=S_B(E_{\mathrm{tot}})-\frac{E(x)}{T}+\cdots,
\qquad \frac{\partial S_B}{\partial E}=\frac1T.
$$

The bath is large enough that this energy exchange barely changes its temperature. More precisely, its quadratic term is $-E(x)^2/(2T^2C_B)$ when expanded at the reference bath energy, so a large heat capacity $C_B$ controls the approximation. Exponentiating the linear term yields the **Boltzmann weight**

$$
\Pr(x)\propto e^{-\beta E(x)},\qquad \beta=\frac{1}{k_BT}.
$$

This is a statement about a microstate. It is not generally the probability of an energy value. If there are $g(E)$ states of energy $E$, then $\Pr(E)\propto g(E)e^{-\beta E}$; for continuous energies, $g$ is a density of states relative to an energy measure.

Suppose there is one state at energy zero and four distinct states at energy $\Delta$. Each excited state is less probable than the ground state, but the excited _level_ can still be more probable. Compare the probability bars before reading the calculation.

<Figure id="es98d-levels" title="Energy competes with multiplicity" caption="Exactly one ground state and four excited states. These bars sum probabilities within each level; they are not per-microstate weights.">
<div className="sci-story-grid sci-story-two">
<div className="sci-story-panel"><h4>Warmer: βΔ = log 2</h4><svg className="sci-story-svg" viewBox="0 0 300 240" role="img" aria-label="Ground probability 0.333; total excited probability 0.667. Four excited microstates."><line x1="42" y1="198" x2="278" y2="198" stroke="currentColor" strokeWidth="1.5" /><line x1="42" y1="198" x2="42" y2="38" stroke="currentColor" strokeWidth="1.5" /><text x="160" y="233" textAnchor="middle">energy level</text><text x="42" y="20" textAnchor="start">total probability</text><text x="42" y="218" textAnchor="middle"></text><text x="278" y="218" textAnchor="middle"></text><text x="34" y="202" textAnchor="end">0</text><text x="34" y="48" textAnchor="end">1</text><rect x="90" y="146.333" width="38" height="51.667" fill="none" stroke="var(--sci-accent)" strokeWidth="2" /><text x="109" y="136.333" textAnchor="middle">0.333</text><text x="109" y="219" textAnchor="middle">0 (1 state)</text><rect x="200" y="94.667" width="38" height="103.333" fill="none" stroke="var(--sci-secondary)" strokeWidth="2" /><text x="219" y="84.667" textAnchor="middle">0.667</text><text x="219" y="219" textAnchor="middle">Δ (4 states)</text></svg><p>The level probability includes all four excited microstates; bar heights share the same zero-to-one scale.</p></div>
<div className="sci-story-panel"><h4>Colder: βΔ = log 8</h4><svg className="sci-story-svg" viewBox="0 0 300 240" role="img" aria-label="Ground probability 0.667; total excited probability 0.333. Four excited microstates."><line x1="42" y1="198" x2="278" y2="198" stroke="currentColor" strokeWidth="1.5" /><line x1="42" y1="198" x2="42" y2="38" stroke="currentColor" strokeWidth="1.5" /><text x="160" y="233" textAnchor="middle">energy level</text><text x="42" y="20" textAnchor="start">total probability</text><text x="42" y="218" textAnchor="middle"></text><text x="278" y="218" textAnchor="middle"></text><text x="34" y="202" textAnchor="end">0</text><text x="34" y="48" textAnchor="end">1</text><rect x="90" y="94.667" width="38" height="103.333" fill="none" stroke="var(--sci-accent)" strokeWidth="2" /><text x="109" y="84.667" textAnchor="middle">0.667</text><text x="109" y="219" textAnchor="middle">0 (1 state)</text><rect x="200" y="146.333" width="38" height="51.667" fill="none" stroke="var(--sci-secondary)" strokeWidth="2" /><text x="219" y="136.333" textAnchor="middle">0.333</text><text x="219" y="219" textAnchor="middle">Δ (4 states)</text></svg><p>The level probability includes all four excited microstates; bar heights share the same zero-to-one scale.</p></div>
</div>
</Figure>

At $\beta\Delta=\log2$, every excited microstate has half the ground-state weight. The partition sum is $Z=1+4/2=3$, so the total excited probability is $2/3$. At $\beta\Delta=\log8$, it is instead $(4/8)/(1+4/8)=1/3$. Energy favours the ground state; multiplicity favours the excited level. Free energy will eventually combine precisely these two effects.

<h2 id="canonical">1.2 From a microstate to a particle distribution</h2>

For $N$ classical particles in $d$ dimensions, write positions $r=(r_1,\ldots,r_N)$, momenta $p=(p_1,\ldots,p_N)$ and Hamiltonian

$$
H(r,p)=K(p)+U(r),\qquad K(p)=\sum_{i=1}^N\frac{|p_i|^2}{2m_i}.
$$

The force is $-\nabla_iU$, rather than $\nabla_iU$. Let the particles occupy a finite domain or let $U$ confine them strongly enough that the partition function is finite. With respect to the classical reference measure

$$
d\mu=\frac{dr\,dp}{N!h_{\mathrm P}^{dN}},
\qquad Q=\int e^{-\beta H}\,d\mu,
$$

the canonical measure is $Q^{-1}e^{-\beta H}d\mu$. Here $h_{\mathrm P}$ is Planck's constant, used to make the classical state count dimensionless, and $N!$ applies to identical particles; mixtures require species factorials. These constants cancel in fixed-composition averages, but must be consistent in absolute free energies. A probability density written with respect to $dr\,dp$ has the corresponding constants absorbed into its normalisation.

Because kinetic and potential energies separate, so does the Boltzmann factor. Integrating the Gaussian momenta leaves

$$
\pi(r)=\frac{e^{-\beta U(r)}}{Z},\qquad
Z=\int e^{-\beta U(r)}dr.
$$

Each unconstrained Cartesian velocity component is Gaussian with mean zero and variance $k_BT/m_i$. This Maxwell–Boltzmann law will supply initial velocities in [the dynamics chapter](/notes/es98d/dynamics#initialisation). The configurational partition function $Z$ and full phase-space partition function $Q$ are different objects.

For an observable $A$, an equilibrium prediction is an expectation:

$$
\langle A\rangle=\int A(r,p)\,Q^{-1}e^{-\beta H(r,p)}d\mu.
$$

If $A$ depends only on positions, we can use $\int A(r)\pi(r)dr$. Sampling methods turn these integrals into averages of representative states. They do not replace the modelling decision contained in $U$.

<h2 id="ensembles">1.3 What is held fixed changes the measure</h2>

An **ensemble** specifies macroscopic constraints and the resulting statistical weighting of microstates. Thermodynamics describes those constraints through state variables; statistical mechanics supplies the measure underneath them.

In an isolated **microcanonical** system, $N,V,E$ are fixed. The phase-space measure is proportional to

$$
\delta(E-H(r,p))d\mu,
\qquad \Omega(E)=\int\delta(E-H)\,d\mu.
$$

One may define entropy from a thin energy shell, $S=k_B\log[\Omega(E)\,\delta E]$, with the shell-width convention stated. The delta distribution does not mean uniform Euclidean surface area: integrating over the energy surface introduces the factor $1/|\nabla H|$ where it is regular. Hamiltonian dynamics preserves this measure and the energy, but preservation alone does not prove that a single trajectory samples every relevant region.

In the **canonical** ensemble, $N,V,T$ are fixed and energy fluctuates. Its thermodynamic potential is the Helmholtz free energy

$$
F=-k_BT\log Q=E_{\mathrm{int}}-TS.
$$

We write $E_{\mathrm{int}}=\langle H\rangle$ to distinguish thermodynamic internal energy from the configuration function $U(r)$. Canonical sampling can use Metropolis moves or suitable thermostatted dynamics. Neither an arbitrary thermostat nor a finite numerical timestep automatically preserves the exact measure.

<h3 id="npt">Allow the box to exchange volume</h3>

At fixed $N,P_{\mathrm{ext}},T$, volume fluctuates as well. The isothermal-isobaric partition function integrates canonical weights over $V$, with an additional factor $e^{-\beta P_{\mathrm{ext}}V}$. A reference volume can make this integral dimensionless; its convention affects the additive free-energy constant. The associated thermodynamic potential is the Gibbs free energy $G=E_{\mathrm{int}}-TS+P_{\mathrm{ext}}V$.

Why does a simulation formula often contain $V^N$? For an isotropically scaled cubic box, introduce fractional coordinates $a_i\in[0,1]^d$ by $r_i=V^{1/d}a_i$. Then $dr=V^N da$, and after momenta are integrated out,

$$
\pi(a,V)\,da\,dV\propto
V^N e^{-\beta[U(V^{1/d}a)+P_{\mathrm{ext}}V]}\,da\,dV.
$$

The volume power is a coordinate Jacobian, not an extra energy. A proposal symmetric in $V$, keeping $a$ fixed, therefore has acceptance

$$
\alpha=\min\left\{1,
\exp\left[-\beta(\Delta U+P_{\mathrm{ext}}\Delta V)
+N\log\frac{V'}V\right]\right\}.
$$

A proposal symmetric in $\log V$ has a different proposal ratio and gives an $(N+1)\log(V'/V)$ term. Flexible cells require their own measure and proposal analysis. This is our first example of a general rule: an acceptance probability is meaningful only after both the target measure and the proposal coordinates are specified.

<h2 id="equilibrium-check">1.4 A target is not yet a simulation</h2>

Newtonian motion is a natural candidate for NVE; Langevin dynamics exchanges heat with a bath; Metropolis sampling can target configurational NVT; volume moves or a correctly constructed barostat add pressure coupling. Each method must be checked for invariance, ability to explore the support, and finite-computation error. We will develop these checks rather than infer them from an ensemble label.

Before constructing motion, we need to decide which interactions give the energy in these measures. [The next chapter](/notes/es98d/interaction-models) starts from the difficulty of evaluating the microscopic energy surface and builds models whose approximations remain visible.

### Exercises

1. For the two-level example, find the temperature at which both levels have equal total probability. What changes if the excited level has multiplicity $g$?
2. Integrate one momentum coordinate and verify its velocity variance $1/(\beta m)$.
3. Derive the extra proposal factor for a move symmetric in $\log V$. Explain why adding it twice would be an error.
