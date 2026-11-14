---
title: "9. Collective coordinates and free-energy differences"
---

A system can spend almost all its simulation time in one basin even when another basin carries appreciable equilibrium probability. The obstacle is not the definition of the [Boltzmann measure](/notes/es98d/equilibrium#canonical); it is the scarcity of trajectories connecting the relevant regions. To describe the obstacle, we often replace a configuration with a few collective coordinates. To overcome it, we modify sampling and then account for that modification.

The central distinction is between an energy evaluated at one configuration and a free energy that counts many configurations together. We encountered it in the first chapter's competition between energy and multiplicity. Here it becomes a computational tool.

<h2 id="coordinates">9.1 A collective coordinate retains a question, not a full state</h2>

A **collective variable** is a map $s:\mathbb R^{dN}\to\mathbb R^m$, usually with $m\ll dN$, chosen to distinguish structures or processes of interest. Examples include coordination numbers, bond-order parameters, torsional angles and distances. A Ramachandran plot uses two backbone dihedral angles to describe molecular conformations.

Many configurations share the same value of $s$. A good coordinate separates relevant basins and exposes important slow transitions; it need not determine the microscopic state or make the reduced dynamics Markovian. A hidden slow coordinate can remain trapped even while the displayed coordinate moves freely.

At equilibrium the marginal density of $z=s(r)$ is

$$
p_s(z)=\frac1Z\int e^{-\beta U(r)}\delta(z-s(r))dr.
$$

Equivalently one may keep the momentum integral and state-counting factors in a constrained partition function $Q(z)$. They change only a $z$-independent constant when the kinetic degrees of freedom factorise. Define the potential of mean force, or coordinate-dependent free energy, by

$$
F_s(z)=-\beta^{-1}\log p_s(z)+C.
$$

This is defined relative to a coordinate measure such as $dz$. Under a one-to-one reparameterisation $y=f(z)$,

$$
p_y(y)=p_s(z)\left|\det\frac{dz}{dy}\right|,
\qquad F_y(y)=F_s(z)-\beta^{-1}\log\left|\det\frac{dz}{dy}\right|+C'.
$$

For a radial distance in three dimensions, a shell contributes a factor proportional to $r^2$. A raw distance histogram and a radial density with that geometric factor divided out therefore yield different free-energy curves. The delta integral contains the appropriate coarea/Jacobian weighting; it is not an unweighted average over a level surface.

As a discrete example, compare a basin with one configuration of energy zero and a basin with four configurations of energy $\Delta$. Their equilibrium free-energy difference is

$$
F_B-F_A=\Delta-k_BT\log4.
$$

The fourfold basin can win despite its higher energy. This exactly recovers the first chapter's level probabilities. No single minimum-energy configuration can supply the missing multiplicity.

<Figure id="es98d-entropy" title="The free energy counts states" caption="The same one-versus-four level example as Chapter 1. Dimensionless quantities use kBT as the energy unit, with βΔ = log 2.">
<div className="sci-story-grid sci-story-two">
<div className="sci-story-panel"><h4>One configuration versus four</h4><svg className="sci-story-svg" viewBox="0 0 300 240" role="img" aria-label="Basin A has one state of energy zero. Basin B has four states, each of energy log two in thermal units."><text x="30" y="45" textAnchor="start">A: one state, energy 0</text><circle cx="145" cy="95" r="11" fill="var(--sci-accent)" /><text x="30" y="153" textAnchor="start">B: four states, energy log 2</text><circle cx="55" cy="193" r="11" fill="var(--sci-secondary)" /><circle cx="115" cy="193" r="11" fill="var(--sci-secondary)" /><circle cx="175" cy="193" r="11" fill="var(--sci-secondary)" /><circle cx="235" cy="193" r="11" fill="var(--sci-secondary)" /></svg><p>Every B microstate is individually less probable than A.</p></div>
<div className="sci-story-panel"><h4>Combine energy and multiplicity</h4><svg className="sci-story-svg" viewBox="0 0 300 240" role="img" aria-label="Basin free energy difference beta times F B minus F A equals log two minus log four equals minus log two. B has probability two thirds."><text x="25" y="55" textAnchor="start">β(FB − FA) = log 2 − log 4</text><text x="25" y="90" textAnchor="start">= −log 2</text><text x="25" y="145" textAnchor="start">pB / pA = 2</text><text x="25" y="190" textAnchor="start">pB = 2/3</text></svg><p>B is favoured as a basin because four compatible states outweigh the energy penalty.</p></div>
</div>
</Figure>

A barrier in $F_s$ can indicate a sampling obstruction if the coordinate resolves the slow mechanism. A projected barrier alone does not determine a physical transition rate; dynamics, diffusivity and unresolved coordinates also matter.

<h2 id="umbrellas">9.2 Change the measure, then undo the change</h2>

Add a bias $B(s(r))$ to the potential. The biased marginal is

$$
p_B(z)\propto p_s(z)e^{-\beta B(z)}.
$$

Thus a known static bias can be removed:

$$
p_s(z)\propto p_B(z)e^{\beta B(z)},\qquad
\langle A\rangle_0=
\frac{\langle A e^{\beta B(s)}\rangle_B}
{\langle e^{\beta B(s)}\rangle_B}.
$$

The identity follows by cancelling $e^{-\beta B}$ inside the biased integral. It requires support and adequate overlap; an enormous reweighting factor does not create observations in a region never visited.

In umbrella sampling, choose windows such as $B_k(z)=\kappa_k(z-z_k)^2/2$. Each restrains sampling near a selected coordinate value. Neighbouring windows need overlapping distributions so their unknown normalisations can be related, for example by WHAM or MBAR. Within each window, orthogonal degrees of freedom must also equilibrate. An ideal bias $B=-F_s$ would flatten the marginal, but $F_s$ is what we are trying to discover.

Umbrellas can make a chosen barrier accessible; they do not automatically remove every barrier in the full system. Uncertainty analysis must account for within-window autocorrelation, overlap and the combined reconstruction. A biased dynamical trajectory generally does not preserve unbiased transition rates even when static equilibrium averages can be reweighted.

<h2 id="extended">9.3 Let an auxiliary coordinate explore</h2>

An extended-variable construction couples an auxiliary coordinate $z$ with momentum $p_z$ to the physical collective variable:

$$
H_{\mathrm{ext}}(r,p,z,p_z)
=H(r,p)+\frac{|p_z|^2}{2m_z}
+\frac{\kappa}{2}|s(r)-z|^2.
$$

At a common temperature and without extra bias, integrating $z$ over all of $\mathbb R^m$ gives a constant independent of $r$, so the physical marginal is unchanged. Restricted domains, periodic coordinates and boundary conditions require the appropriate coupling and integration measure.

Temperature-accelerated variants thermostat the physical and auxiliary variables separately, using a hotter, slower auxiliary system to explore new regions. Time-scale separation and sufficient coupling allow a mean-force interpretation in a controlled regime. A hotter auxiliary bath is not ordinary canonical sampling of $H_{\mathrm{ext}}$ at the physical temperature. The resulting exploration requires method-specific analysis before it can be interpreted as physical-temperature free energy or kinetics.

<h2 id="metadynamics">9.4 Build a bias from where the process has been</h2>

Metadynamics deposits smooth hills at visited coordinate values, for example

$$
B(z,t)=\sum_{t_n<t}w_n
\exp\left[-\frac{|z-s(r_{t_n})|^2}{2\delta_s^2}\right].
$$

The hill heights $w_n$ have energy units, and $\delta_s$ sets a coordinate width. The source omitted the energy amplitude. Depositing positive hills discourages revisiting already explored basins and helps discover other regions. Because the bias changes with history, the simple static-bias identity cannot be applied blindly to the entire trajectory.

In well-tempered metadynamics, hill heights decrease with accumulated bias. With bias factor $\Gamma=(T+\Delta T)/T>1$, the ideal asymptotic relation is $B(z)\to-(1-1/\Gamma)F_s(z)+C$ under the method's sampling assumptions. The biased marginal is then proportional to $e^{-\beta F_s/\Gamma}$ rather than exactly flat. [Barducci, Bussi and Parrinello's original paper](https://doi.org/10.1103/PhysRevLett.100.020603) supplies the construction and convergence rationale. Finite-time estimates still need adequate coordinates, exploration and a suitable reconstruction or time-dependent reweighting procedure.

<h2 id="differences">9.5 Free-energy differences from overlapping ensembles</h2>

Suppose models $A$ and $B$ have potentials $U_A,U_B$ on a common configuration space, at the same temperature and with the same kinetic/reference factors. Divide their partition functions:

$$
\frac{Z_B}{Z_A}
=\frac{\int e^{-\beta U_A}e^{-\beta(U_B-U_A)}dr}{Z_A}
=\left\langle e^{-\beta(U_B-U_A)}\right\rangle_A.
$$

Taking logarithms gives the **free-energy perturbation identity**

$$
F_B-F_A=-\beta^{-1}\log
\left\langle e^{-\beta(U_B-U_A)}\right\rangle_A.
$$

This exact identity is not necessarily a good finite-sample estimator. Rare configurations under $A$ can dominate the exponential average. Support mismatch can invalidate the ratio identity in the sampled direction, and poor overlap can make a seemingly stable estimate wrong. The logarithm adds finite-sample bias. Intermediate states or bidirectional estimators help when they create overlap; they do not eliminate the need to diagnose it.

For a continuously interpolated potential $U_\lambda$, choose the convention

$$
U_\lambda=(1-\lambda)U_A+\lambda U_B,
\qquad 0\le\lambda\le1.
$$

Differentiate $F_\lambda=-\beta^{-1}\log Z_\lambda$, assuming differentiation under the integral is justified:

$$
\frac{dF_\lambda}{d\lambda}
=\left\langle\frac{\partial U_\lambda}{\partial\lambda}\right\rangle_\lambda,
\qquad
F_B-F_A=\int_0^1\langle U_B-U_A\rangle_\lambda d\lambda.
$$

This is **thermodynamic integration**. The source used the opposite endpoint convention, $U_0=U_B,U_1=U_A$, and correspondingly computed $F_A-F_B$. Both are valid; silently mixing their signs is not. We use $A\to B$ consistently here.

A harmonic example checks both methods. Let $U_A(x)=k_Ax^2/2$, $U_B(x)=k_Bx^2/2$, with positive stiffnesses. Gaussian integration gives $Z_B/Z_A=\sqrt{k_A/k_B}$, hence

$$
F_B-F_A=\frac{1}{2\beta}\log\frac{k_B}{k_A}.
$$

Along the linear path, $k_\lambda=(1-\lambda)k_A+\lambda k_B$ and $\langle x^2\rangle_\lambda=1/(\beta k_\lambda)$. Thus the TI integrand is $(k_B-k_A)/(2\beta k_\lambda)$, whose integral gives the same logarithm. Agreement is an analytic check; it does not establish convergence of a finite exponential average for a very different pair of stiffnesses.

In applications, use more integration points where the mean derivative varies rapidly, verify equilibration at every state, and monitor overlap and possible phase transitions. Einstein-crystal references for solids and tractable fluid references can connect an interacting model to a known free energy, provided constraints, indistinguishability and reference constants are treated consistently. An arbitrary fluid reference does not have a known absolute free energy merely because it is called Lennard–Jones-like.

<h2 id="course-synthesis">9.6 Return to the original prediction</h2>

We began by asking where a warm particle is likely to be. The heat bath supplied a measure; interaction models supplied energies; dynamics and Monte Carlo supplied different ways to explore; covariance accounting supplied finite-run uncertainty. Cluster and event methods changed the exploration without changing the intended target. Continuum parcels changed the physical level of description. Collective coordinates finally combined many microscopic states into the free-energy description of a process.

A reliable simulation keeps all of these levels explicit. State the model, ensemble and measure; justify the sampling mechanism; test numerical approximation; establish exploration of the relevant states; and attach uncertainty to the observable actually being reported. A free-energy curve is then a quantitative conclusion with identifiable assumptions, rather than a picture of a trajectory's preferences.

### Exercises

1. Reparameterise a one-dimensional collective coordinate by $y=2z$. Which part of its free-energy curve changes? What if $y=z^3$ away from zero?
2. Derive the static umbrella reweighting identity and identify the support assumption in the cancellation.
3. Check the harmonic free-energy difference by both perturbation and thermodynamic integration. What happens when $k_B=k_A$?
4. Explain why an unvisited orthogonal basin can invalidate a free-energy estimate even when umbrella histograms overlap along the displayed coordinate.
