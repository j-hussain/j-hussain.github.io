---
title: "2. Choosing the microscopic model"
---

The [Boltzmann measure](/notes/es98d/equilibrium#canonical) converts an energy function into predictions. But where does that energy function come from? Two models can be sampled perfectly and still predict different structures, simply because they assign different costs to the same arrangement of particles. Computational accuracy cannot rescue an inappropriate interaction model.

<h2 id="surface">2.1 An energy surface we cannot usually evaluate directly</h2>

In an atomistic description, electrons and nuclei obey quantum mechanics. The Born–Oppenheimer approximation exploits their different timescales: for fixed nuclear positions $r$, solve an electronic problem and use its energy, together with nuclear repulsion, as a potential-energy surface for the nuclei. Treating the nuclei classically is a further approximation, which can fail for light particles or low temperatures.

This surface is generally a many-body function. Repeated electronic calculations may be too costly for a large system over a long trajectory, so an interatomic potential replaces it with a tractable approximation. The model may be fitted to electronic calculations, measurements, or both. Local electronic structure often motivates dependence on nearby environments, but electrostatic fields and dispersion prevent locality from being a universal principle.

The important question is which distinctions the model preserves. Can it distinguish different bond angles, charge environments or magnetic arrangements? A pair function of distance cannot represent all three, however accurately we integrate the resulting equations.

<h2 id="pairs">2.2 Start with exclusion, then add attraction</h2>

For identical hard spheres of diameter $a$,

$$
u_{\mathrm{HS}}(r)=
\begin{cases}
+\infty,&r<a,\\
0,&r\ge a.
\end{cases}
$$

Here $u_{\mathrm{HS}}$ denotes the pair energy. For unequal radii, $a$ is their sum. The model resolves excluded volume without resolving the microscopic origin of repulsion. Every non-overlapping configuration has the same potential energy, so at fixed volume its configurational equilibrium distribution is uniform over the allowed region. Entropy alone can therefore produce nontrivial packing and phase behaviour. Forces at contact are impulsive; ordinary smooth-force integration is inappropriate.

To model an attractive fluid, introduce the Lennard–Jones pair potential

$$
u_{\mathrm{LJ}}(r)=4\varepsilon
\left[\left(\frac{\sigma}{r}\right)^{12}
-\left(\frac{\sigma}{r}\right)^6\right].
$$

The notation $u_{\mathrm{LJ}}$ again denotes energy; $\varepsilon$ is an energy scale and $\sigma$ a length. The $r^{-6}$ attraction represents the asymptotic London-dispersion form. The $r^{-12}$ repulsion is a convenient approximation, not a fundamental repulsive law.

Where does attraction turn into repulsion? Differentiate rather than infer the answer from where the energy crosses zero:

$$
f_r=-u'_{\mathrm{LJ}}(r)
=\frac{24\varepsilon}{r}
\left[2\left(\frac{\sigma}{r}\right)^{12}
-\left(\frac{\sigma}{r}\right)^6\right].
$$

The radial force vanishes at $r_*=2^{1/6}\sigma$, where $u(r_*)=-\varepsilon$. The zero of the _energy_, $r=\sigma$, is a different point. In the plot, follow the slope on either side of the minimum; positive radial force pushes particles apart.

<Figure id="es98d-lj" title="A zero energy is not a zero force" caption="Both plots use the same separation range, with different labelled vertical quantities and scales. Energy minimum at 2^(1/6)σ; the force there is zero.">
<div className="sci-story-grid sci-story-two">
<div className="sci-story-panel"><h4>Energy and its minimum</h4><svg className="sci-story-svg" viewBox="0 0 300 240" role="img" aria-label="Lennard-Jones energy from r over sigma 0.95 to 3; minimum minus epsilon at 1.122 sigma."><line x1="42" y1="198" x2="278" y2="198" stroke="currentColor" strokeWidth="1.5" /><line x1="42" y1="198" x2="42" y2="38" stroke="currentColor" strokeWidth="1.5" /><text x="160" y="233" textAnchor="middle">separation r / σ</text><text x="42" y="20" textAnchor="start">energy u / ε</text><text x="42" y="218" textAnchor="middle">0.95</text><text x="278" y="218" textAnchor="middle">3</text><text x="34" y="202" textAnchor="end">−1.2</text><text x="34" y="48" textAnchor="end">2</text><path d="M42,44.89 L43.475,77.781 L44.95,104.021 L46.425,124.86 L47.9,141.311 L49.375,154.196 L50.85,164.184 L52.325,171.822 L53.8,177.554 L55.275,181.744 L56.75,184.688 L58.225,186.63 L59.7,187.767 L61.175,188.263 L62.65,188.249 L64.125,187.835 L65.6,187.11 L67.075,186.145 L68.55,185.001 L70.025,183.724 L71.5,182.353 L72.975,180.921 L74.45,179.452 L75.925,177.967 L77.4,176.483 L78.875,175.01 L80.35,173.561 L81.825,172.142 L83.3,170.759 L84.775,169.416 L86.25,168.117 L87.725,166.863 L89.2,165.656 L90.675,164.496 L92.15,163.383 L93.625,162.316 L95.1,161.296 L96.575,160.321 L98.05,159.389 L99.525,158.5 L101,157.652 L102.475,156.843 L103.95,156.073 L105.425,155.339 L106.9,154.64 L108.375,153.975 L109.85,153.341 L111.325,152.738 L112.8,152.165 L114.275,151.619 L115.75,151.099 L117.225,150.605 L118.7,150.134 L120.175,149.686 L121.65,149.26 L123.125,148.855 L124.6,148.468 L126.075,148.101 L127.55,147.75 L129.025,147.417 L130.5,147.099 L131.975,146.796 L133.45,146.508 L134.925,146.233 L136.4,145.971 L137.875,145.721 L139.35,145.483 L140.825,145.256 L142.3,145.039 L143.775,144.832 L145.25,144.634 L146.725,144.446 L148.2,144.266 L149.675,144.094 L151.15,143.929 L152.625,143.772 L154.1,143.622 L155.575,143.479 L157.05,143.341 L158.525,143.21 L160,143.085 L161.475,142.965 L162.95,142.85 L164.425,142.739 L165.9,142.634 L167.375,142.533 L168.85,142.436 L170.325,142.344 L171.8,142.255 L173.275,142.17 L174.75,142.088 L176.225,142.01 L177.7,141.935 L179.175,141.863 L180.65,141.793 L182.125,141.727 L183.6,141.663 L185.075,141.602 L186.55,141.543 L188.025,141.487 L189.5,141.432 L190.975,141.38 L192.45,141.33 L193.925,141.282 L195.4,141.235 L196.875,141.191 L198.35,141.148 L199.825,141.107 L201.3,141.067 L202.775,141.029 L204.25,140.992 L205.725,140.956 L207.2,140.922 L208.675,140.889 L210.15,140.857 L211.625,140.827 L213.1,140.797 L214.575,140.769 L216.05,140.741 L217.525,140.715 L219,140.689 L220.475,140.665 L221.95,140.641 L223.425,140.618 L224.9,140.596 L226.375,140.575 L227.85,140.554 L229.325,140.534 L230.8,140.515 L232.275,140.496 L233.75,140.478 L235.225,140.461 L236.7,140.444 L238.175,140.428 L239.65,140.412 L241.125,140.397 L242.6,140.382 L244.075,140.368 L245.55,140.354 L247.025,140.341 L248.5,140.328 L249.975,140.316 L251.45,140.304 L252.925,140.292 L254.4,140.281 L255.875,140.27 L257.35,140.259 L258.825,140.249 L260.3,140.239 L261.775,140.229 L263.25,140.22 L264.725,140.211 L266.2,140.202 L267.675,140.193 L269.15,140.185 L270.625,140.177 L272.1,140.169 L273.575,140.162 L275.05,140.154 L276.525,140.147 L278,140.14" fill="none" stroke="var(--sci-accent)" strokeWidth="2.5" /><line x1="42" y1="139.875" x2="278" y2="139.875" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" /><circle cx="61.854" cy="188.313" r="4" fill="var(--sci-accent)" /><text x="105" y="185" textAnchor="start">minimum: r* = 1.122σ</text></svg><p>The slope changes sign at the well minimum, after the energy has crossed zero at σ.</p></div>
<div className="sci-story-panel"><h4>The negative energy derivative</h4><svg className="sci-story-svg" viewBox="0 0 300 240" role="img" aria-label="Lennard-Jones radial force: repulsive below the energy minimum and attractive above it."><line x1="42" y1="198" x2="278" y2="198" stroke="currentColor" strokeWidth="1.5" /><line x1="42" y1="198" x2="42" y2="38" stroke="currentColor" strokeWidth="1.5" /><text x="160" y="233" textAnchor="middle">separation r / σ</text><text x="42" y="20" textAnchor="start">radial force f σ / ε</text><text x="42" y="218" textAnchor="middle">0.95</text><text x="278" y="218" textAnchor="middle">3</text><text x="34" y="202" textAnchor="end">−3</text><text x="34" y="48" textAnchor="end">60</text><path d="M42,45.122 L43.475,74.323 L44.95,98.038 L46.425,117.305 L47.9,132.96 L49.375,145.678 L50.85,156.005 L52.325,164.382 L53.8,171.168 L55.275,176.655 L56.75,181.079 L58.225,184.634 L59.7,187.479 L61.175,189.742 L62.65,191.53 L64.125,192.93 L65.6,194.012 L67.075,194.835 L68.55,195.448 L70.025,195.89 L71.5,196.193 L72.975,196.384 L74.45,196.485 L75.925,196.515 L77.4,196.488 L78.875,196.416 L80.35,196.309 L81.825,196.177 L83.3,196.024 L84.775,195.857 L86.25,195.681 L87.725,195.498 L89.2,195.312 L90.675,195.125 L92.15,194.939 L93.625,194.755 L95.1,194.575 L96.575,194.398 L98.05,194.227 L99.525,194.062 L101,193.902 L102.475,193.748 L103.95,193.6 L105.425,193.458 L106.9,193.322 L108.375,193.192 L109.85,193.068 L111.325,192.95 L112.8,192.838 L114.275,192.73 L115.75,192.628 L117.225,192.531 L118.7,192.439 L120.175,192.351 L121.65,192.267 L123.125,192.188 L124.6,192.113 L126.075,192.042 L127.55,191.974 L129.025,191.909 L130.5,191.848 L131.975,191.79 L133.45,191.735 L134.925,191.683 L136.4,191.633 L137.875,191.586 L139.35,191.542 L140.825,191.499 L142.3,191.459 L143.775,191.42 L145.25,191.384 L146.725,191.35 L148.2,191.317 L149.675,191.285 L151.15,191.256 L152.625,191.228 L154.1,191.201 L155.575,191.175 L157.05,191.151 L158.525,191.128 L160,191.106 L161.475,191.085 L162.95,191.065 L164.425,191.046 L165.9,191.028 L167.375,191.011 L168.85,190.994 L170.325,190.979 L171.8,190.964 L173.275,190.95 L174.75,190.936 L176.225,190.923 L177.7,190.911 L179.175,190.899 L180.65,190.888 L182.125,190.877 L183.6,190.867 L185.075,190.857 L186.55,190.848 L188.025,190.839 L189.5,190.83 L190.975,190.822 L192.45,190.814 L193.925,190.807 L195.4,190.799 L196.875,190.793 L198.35,190.786 L199.825,190.78 L201.3,190.774 L202.775,190.768 L204.25,190.762 L205.725,190.757 L207.2,190.752 L208.675,190.747 L210.15,190.743 L211.625,190.738 L213.1,190.734 L214.575,190.73 L216.05,190.726 L217.525,190.722 L219,190.718 L220.475,190.715 L221.95,190.712 L223.425,190.708 L224.9,190.705 L226.375,190.702 L227.85,190.699 L229.325,190.697 L230.8,190.694 L232.275,190.692 L233.75,190.689 L235.225,190.687 L236.7,190.685 L238.175,190.682 L239.65,190.68 L241.125,190.678 L242.6,190.676 L244.075,190.674 L245.55,190.673 L247.025,190.671 L248.5,190.669 L249.975,190.668 L251.45,190.666 L252.925,190.665 L254.4,190.663 L255.875,190.662 L257.35,190.66 L258.825,190.659 L260.3,190.658 L261.775,190.657 L263.25,190.656 L264.725,190.654 L266.2,190.653 L267.675,190.652 L269.15,190.651 L270.625,190.65 L272.1,190.649 L273.575,190.649 L275.05,190.648 L276.525,190.647 L278,190.646" fill="none" stroke="var(--sci-accent)" strokeWidth="2.5" /><line x1="42" y1="190.619" x2="278" y2="190.619" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" /><text x="108" y="78" textAnchor="start">positive: repulsive</text><text x="108" y="106" textAnchor="start">negative: attractive</text></svg><p>The force axis has its own units and scale; its zero is the dashed line near the bottom.</p></div>
</div>
</Figure>

For a pairwise system, $U(r)=\sum_{i<j}u(r_{ij})$ counts every pair once. The force on $i$ from $j$ is $-u'(r_{ij})(r_i-r_j)/r_{ij}$. This dependence on the separation makes the pair forces equal and opposite, conserving total momentum in an isolated system.

The Buckingham form $u(r)=Ae^{-Br}-C/r^6$ replaces the power-law repulsion by an exponential. It may describe an intermediate separation range better, but with $C>0$ it tends to $-\infty$ as $r\to0$: the bare formula needs a validity range or short-distance repair. A plausible-looking potential well does not establish global stability.

<h2 id="response">2.3 Charges that respond to their environment</h2>

Fixed-charge force fields add Coulomb energies $q_iq_j/(4\pi\epsilon_0r_{ij})$, possibly with dipoles and higher multipoles. Such charges are model parameters. They do not automatically adjust when the local environment changes.

A charge-equilibration model instead minimises an energy such as

$$
E(q)=\sum_i\left(\chi_iq_i+\frac12\eta_iq_i^2\right)
+\frac12\sum_{i\ne j}C_{ij}(r)q_iq_j,
\qquad \sum_iq_i=Q_{\mathrm{tot}}.
$$

The electronegativity-like $\chi_i$, hardness-like $\eta_i$ and electrostatic kernel $C_{ij}$ define a constrained quadratic problem. A Lagrange multiplier enforces total charge. A unique stable solution requires positive curvature on the charge-conserving subspace; an arbitrary parameter choice need not supply it. The constraint is essential: unconstrained minimisation can change the total charge of an isolated model.

In an induced-dipole model,

$$
\boldsymbol\mu_i=\boldsymbol\mu_i^0+alpha_i\mathbf E_i(r,\{\boldsymbol\mu_j\}).
$$

The field includes the other dipoles, so these are coupled self-consistency equations. Shell models provide another representation of polarisation through relative displacement of charged sites. Both approaches cost more than evaluating fixed charges. Their extra degrees of freedom improve representational capacity, but stability, damping at short separation and solver convergence still require checking.

<h2 id="many-body">2.4 Distinguish coordination from bond direction</h2>

For a metallic environment, the embedded atom model combines pair energy with an embedding energy:

$$
U=\frac12\sum_i\sum_{j\ne i}\phi(r_{ij})
+\sum_iF_{\mathrm{emb}}(n_i),
\qquad n_i=\sum_{j\ne i}f(r_{ij}).
$$

The nonlinear function $F_{\mathrm{emb}}$ makes the energy genuinely many-body: the energy associated with a neighbour depends on the rest of the environment. The factor $1/2$ removes double counting in the ordered pair sum. Simple isotropic pair models often favour close-packed structures and cannot generally reproduce metallic bonding across diverse coordinations.

Coordination alone does not specify a tetrahedral network. Stillinger–Weber models add terms depending on bond angles, schematically

$$
U=\sum_{i<j}u_2(r_{ij})
+\sum_i\sum_{\substack{j<k\\j,k\ne i}}
 u_3(r_{ij},r_{ik},\theta_{jik}).
$$

Tersoff-type models instead modulate bond strength through the local environment and angles. The relevant modelling distinction is the ability to represent directional bonding, as in silicon, rather than the particular algebraic packaging of the terms.

<h2 id="spins">2.5 Add a degree of freedom for magnetism</h2>

Positions alone do not describe magnetic order. Attach a spin to each site and choose an interaction graph, usually beginning with nearby exchange-coupled sites. An Ising model uses $s_i\in\{-1,+1\}$ and

$$
H(s)=-\sum_{\langle i,j\rangle}J_{ij}s_is_j-\sum_i b_i s_i.
$$

Each undirected bond is counted once, and $b_i$ is a field energy. Positive $J_{ij}$ favours parallel spins. A classical Heisenberg model replaces them by fixed-length vectors and uses $-\sum_{\langle i,j\rangle}J_{ij}\mathbf S_i\cdot\mathbf S_j$, allowing non-collinear order. Anisotropy, dipolar interactions and longer-range exchange can be added when the physics requires them.

The lattice is part of the model: antiferromagnetic couplings can all be satisfied on a bipartite graph, whereas an antiferromagnetic triangle is frustrated. Numerical updates must respect the spin domain. Ising flips and vector-spin rotations are sampling moves; physical spin dynamics requires a separate equation of motion. [Chapter 6](/notes/es98d/collective-updates) will use the nearest-neighbour ferromagnetic Ising model to expose a limitation of local sampling.

<h2 id="long-range">2.6 A boundary condition is also a modelling decision</h2>

A naïve force evaluation visits $N(N-1)/2$ pairs. Short-range models permit cutoffs and neighbour lists, developed in [Chapter 3](/notes/es98d/dynamics#neighbours). A Coulomb or gravitational _potential_ decays as $1/r$ and its force as $1/r^2$; distant contributions cannot generally be discarded using the same argument.

For a periodic Coulomb system, the primary cell is replicated infinitely. A non-neutral cell has no finite conventional periodic Coulomb energy without a specified compensation, such as a uniform background. Even for a neutral cell, the raw lattice sum is not absolutely convergent; the macroscopic boundary or summation convention matters, particularly for dipolar terms. A spherical cutoff silently chooses an uncontrolled approximation and can disrupt long-range correlations. An abruptly truncated energy also adds a discontinuity at the cutoff.

Ewald summation resolves the periodic problem by using

$$
\frac1r=\frac{\operatorname{erfc}(\alpha r)}r
+\frac{\operatorname{erf}(\alpha r)}r.
$$

The rapidly decaying first term is summed in real space. The smooth second term is treated in reciprocal space using the periodic charge density. Self-interaction corrections and the chosen zero-wave-number/boundary convention complete the construction. In an exact calculation, changing the splitting parameter $\alpha$ redistributes work without changing the energy; residual dependence measures truncation error.

Particle Mesh Ewald and related mesh methods accelerate reciprocal-space calculations with FFTs, typically giving $O(N\log N)$ scaling at controlled resolution. Wolf-type damped, locally compensated cutoffs are alternatives whose accuracy depends on the system and convergence checks. The [LAMMPS long-range solver documentation](https://docs.lammps.org/kspace_style.html) illustrates the distinction between real-space and reciprocal-space work and the need to specify accuracy and boundary conditions.

Gravity shares the computational range problem but not charge neutrality: positive masses do not cancel. The unmodified infinite periodic gravitational mean diverges, rather than merely reproducing the neutral electrostatic case. Isolated problems need isolated boundaries; cosmological periodic calculations formulate a mean-subtracted density problem with its physical convention explicit. Tree and fast-multipole approximations offer controlled ways to reduce the cost of suitable nonperiodic long-range calculations.

We now have energies with different smoothness, ranges and degrees of freedom. [Constructing dynamics](/notes/es98d/dynamics) means respecting these choices while deciding which physical exchanges the simulation should represent.

### Exercises

1. Check $u_{\mathrm{LJ}}(\sigma)=0$, $u(r_*)=-\varepsilon$ and $u'(r_*)=0$. Why does shifting an energy by a constant leave forces unchanged?
2. Give two three-particle configurations with the same two distances from a central particle but different bond angles. Which model classes can distinguish them?
3. Write the stationarity equations for the constrained charge model. State the curvature condition needed for uniqueness.
