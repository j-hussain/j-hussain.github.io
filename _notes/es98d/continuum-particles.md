---
title: "8. When particles represent a continuum"
---

A particle in molecular dynamics represents an atom or molecule. A particle in smoothed particle hydrodynamics represents a moving parcel of a continuum. Both calculations can store positions, velocities, masses and neighbour lists, yet they answer different physical questions. The resemblance of their update loops must not obscure the origin of their interactions.

The useful question is how a pressure gradient, originally defined as a field, becomes a sum of forces between numerical particles while respecting conservation laws.

<h2 id="smoothing">8.1 Replace a field by a local average, then by quadrature</h2>

Start from the continuum identity

$$
A(r)=\int A(r')\delta(r-r')dr'.
$$

Replace the delta distribution by a normalised smoothing kernel $W_h(r)=h^{-d}w(r/h)$, usually symmetric and compactly supported. The smoothed field is

$$
A_h(r)=\int A(r')W_h(r-r')dr'\approx A(r).
$$

For smooth fields away from boundaries, a symmetric kernel with finite second moment gives a smoothing error of order $h^2$ by Taylor expansion: the first-order moment cancels. For a nonzero finite $h$, convolution is generally not equal to the original field. The equality in the source was missing this approximation.

Now partition the continuum into parcels of fixed mass $m_j$. Their volume elements are represented by $m_j/\rho_j$. Replacing the integral by a particle quadrature gives

$$
A_h(r_i)\approx\sum_j\frac{m_j}{\rho_j}A_jW_h(r_i-r_j).
$$

For density, $A_j=\rho_j$ cancels the volume denominator:

$$
\rho_i=\sum_jm_jW_h(r_i-r_j).
$$

This is a density _estimator_ defining the discrete model, often including the self contribution $j=i$. Particle-distribution error and smoothing error are distinct. Near boundaries the kernel support is truncated unless boundary treatment corrects it; a disordered quadrature need not reproduce even a constant field exactly.

In the illustration, three equal-mass parcels each contribute a compact kernel to the density. The sum is a field even though its representation uses finitely many moving points. Observe that overlapping support, rather than physical molecular contact, determines which parcels communicate.

<Figure id="es98d-kernel" title="A sum of parcel contributions becomes a field" caption="Three one-dimensional parcels of unit mass at −0.8, 0, 0.8; tent-kernel width h = 0.8. Both panels share position and vertical scales. Each kernel integrates to one, so the total density integrates to mass three.">
<div className="sci-story-grid sci-story-two">
<div className="sci-story-panel"><h4>Each parcel supplies a kernel</h4><svg className="sci-story-svg" viewBox="0 0 300 240" role="img" aria-label="Three unit-integral tent kernels centred at minus 0.8, zero, and 0.8."><line x1="42" y1="198" x2="278" y2="198" stroke="currentColor" strokeWidth="1.5" /><line x1="42" y1="198" x2="42" y2="38" stroke="currentColor" strokeWidth="1.5" /><text x="160" y="233" textAnchor="middle">position x</text><text x="42" y="20" textAnchor="start">kernel contribution</text><text x="42" y="218" textAnchor="middle">−2</text><text x="278" y="218" textAnchor="middle">2</text><text x="34" y="202" textAnchor="end">0</text><text x="34" y="48" textAnchor="end">2</text><path d="M42,198 L43.475,198 L44.95,198 L46.425,198 L47.9,198 L49.375,198 L50.85,198 L52.325,198 L53.8,198 L55.275,198 L56.75,198 L58.225,198 L59.7,198 L61.175,198 L62.65,198 L64.125,198 L65.6,198 L67.075,194.973 L68.55,191.945 L70.025,188.918 L71.5,185.891 L72.975,182.863 L74.45,179.836 L75.925,176.809 L77.4,173.781 L78.875,170.754 L80.35,167.727 L81.825,164.699 L83.3,161.672 L84.775,158.645 L86.25,155.617 L87.725,152.59 L89.2,149.563 L90.675,146.535 L92.15,143.508 L93.625,140.48 L95.1,137.453 L96.575,134.426 L98.05,131.398 L99.525,128.371 L101,125.344 L102.475,122.316 L103.95,119.289 L105.425,116.262 L106.9,113.234 L108.375,110.207 L109.85,107.18 L111.325,104.152 L112.8,101.125 L114.275,104.152 L115.75,107.18 L117.225,110.207 L118.7,113.234 L120.175,116.262 L121.65,119.289 L123.125,122.316 L124.6,125.344 L126.075,128.371 L127.55,131.398 L129.025,134.426 L130.5,137.453 L131.975,140.48 L133.45,143.508 L134.925,146.535 L136.4,149.563 L137.875,152.59 L139.35,155.617 L140.825,158.645 L142.3,161.672 L143.775,164.699 L145.25,167.727 L146.725,170.754 L148.2,173.781 L149.675,176.809 L151.15,179.836 L152.625,182.863 L154.1,185.891 L155.575,188.918 L157.05,191.945 L158.525,194.973 L160,198 L161.475,198 L162.95,198 L164.425,198 L165.9,198 L167.375,198 L168.85,198 L170.325,198 L171.8,198 L173.275,198 L174.75,198 L176.225,198 L177.7,198 L179.175,198 L180.65,198 L182.125,198 L183.6,198 L185.075,198 L186.55,198 L188.025,198 L189.5,198 L190.975,198 L192.45,198 L193.925,198 L195.4,198 L196.875,198 L198.35,198 L199.825,198 L201.3,198 L202.775,198 L204.25,198 L205.725,198 L207.2,198 L208.675,198 L210.15,198 L211.625,198 L213.1,198 L214.575,198 L216.05,198 L217.525,198 L219,198 L220.475,198 L221.95,198 L223.425,198 L224.9,198 L226.375,198 L227.85,198 L229.325,198 L230.8,198 L232.275,198 L233.75,198 L235.225,198 L236.7,198 L238.175,198 L239.65,198 L241.125,198 L242.6,198 L244.075,198 L245.55,198 L247.025,198 L248.5,198 L249.975,198 L251.45,198 L252.925,198 L254.4,198 L255.875,198 L257.35,198 L258.825,198 L260.3,198 L261.775,198 L263.25,198 L264.725,198 L266.2,198 L267.675,198 L269.15,198 L270.625,198 L272.1,198 L273.575,198 L275.05,198 L276.525,198 L278,198" fill="none" stroke="var(--sci-secondary)" strokeWidth="2.5" strokeDasharray="5 4" /><path d="M42,198 L43.475,198 L44.95,198 L46.425,198 L47.9,198 L49.375,198 L50.85,198 L52.325,198 L53.8,198 L55.275,198 L56.75,198 L58.225,198 L59.7,198 L61.175,198 L62.65,198 L64.125,198 L65.6,198 L67.075,198 L68.55,198 L70.025,198 L71.5,198 L72.975,198 L74.45,198 L75.925,198 L77.4,198 L78.875,198 L80.35,198 L81.825,198 L83.3,198 L84.775,198 L86.25,198 L87.725,198 L89.2,198 L90.675,198 L92.15,198 L93.625,198 L95.1,198 L96.575,198 L98.05,198 L99.525,198 L101,198 L102.475,198 L103.95,198 L105.425,198 L106.9,198 L108.375,198 L109.85,198 L111.325,198 L112.8,198 L114.275,194.973 L115.75,191.945 L117.225,188.918 L118.7,185.891 L120.175,182.863 L121.65,179.836 L123.125,176.809 L124.6,173.781 L126.075,170.754 L127.55,167.727 L129.025,164.699 L130.5,161.672 L131.975,158.645 L133.45,155.617 L134.925,152.59 L136.4,149.563 L137.875,146.535 L139.35,143.508 L140.825,140.48 L142.3,137.453 L143.775,134.426 L145.25,131.398 L146.725,128.371 L148.2,125.344 L149.675,122.316 L151.15,119.289 L152.625,116.262 L154.1,113.234 L155.575,110.207 L157.05,107.18 L158.525,104.152 L160,101.125 L161.475,104.152 L162.95,107.18 L164.425,110.207 L165.9,113.234 L167.375,116.262 L168.85,119.289 L170.325,122.316 L171.8,125.344 L173.275,128.371 L174.75,131.398 L176.225,134.426 L177.7,137.453 L179.175,140.48 L180.65,143.508 L182.125,146.535 L183.6,149.563 L185.075,152.59 L186.55,155.617 L188.025,158.645 L189.5,161.672 L190.975,164.699 L192.45,167.727 L193.925,170.754 L195.4,173.781 L196.875,176.809 L198.35,179.836 L199.825,182.863 L201.3,185.891 L202.775,188.918 L204.25,191.945 L205.725,194.973 L207.2,198 L208.675,198 L210.15,198 L211.625,198 L213.1,198 L214.575,198 L216.05,198 L217.525,198 L219,198 L220.475,198 L221.95,198 L223.425,198 L224.9,198 L226.375,198 L227.85,198 L229.325,198 L230.8,198 L232.275,198 L233.75,198 L235.225,198 L236.7,198 L238.175,198 L239.65,198 L241.125,198 L242.6,198 L244.075,198 L245.55,198 L247.025,198 L248.5,198 L249.975,198 L251.45,198 L252.925,198 L254.4,198 L255.875,198 L257.35,198 L258.825,198 L260.3,198 L261.775,198 L263.25,198 L264.725,198 L266.2,198 L267.675,198 L269.15,198 L270.625,198 L272.1,198 L273.575,198 L275.05,198 L276.525,198 L278,198" fill="none" stroke="var(--sci-accent)" strokeWidth="2.5" /><path d="M42,198 L43.475,198 L44.95,198 L46.425,198 L47.9,198 L49.375,198 L50.85,198 L52.325,198 L53.8,198 L55.275,198 L56.75,198 L58.225,198 L59.7,198 L61.175,198 L62.65,198 L64.125,198 L65.6,198 L67.075,198 L68.55,198 L70.025,198 L71.5,198 L72.975,198 L74.45,198 L75.925,198 L77.4,198 L78.875,198 L80.35,198 L81.825,198 L83.3,198 L84.775,198 L86.25,198 L87.725,198 L89.2,198 L90.675,198 L92.15,198 L93.625,198 L95.1,198 L96.575,198 L98.05,198 L99.525,198 L101,198 L102.475,198 L103.95,198 L105.425,198 L106.9,198 L108.375,198 L109.85,198 L111.325,198 L112.8,198 L114.275,198 L115.75,198 L117.225,198 L118.7,198 L120.175,198 L121.65,198 L123.125,198 L124.6,198 L126.075,198 L127.55,198 L129.025,198 L130.5,198 L131.975,198 L133.45,198 L134.925,198 L136.4,198 L137.875,198 L139.35,198 L140.825,198 L142.3,198 L143.775,198 L145.25,198 L146.725,198 L148.2,198 L149.675,198 L151.15,198 L152.625,198 L154.1,198 L155.575,198 L157.05,198 L158.525,198 L160,198 L161.475,194.973 L162.95,191.945 L164.425,188.918 L165.9,185.891 L167.375,182.863 L168.85,179.836 L170.325,176.809 L171.8,173.781 L173.275,170.754 L174.75,167.727 L176.225,164.699 L177.7,161.672 L179.175,158.645 L180.65,155.617 L182.125,152.59 L183.6,149.563 L185.075,146.535 L186.55,143.508 L188.025,140.48 L189.5,137.453 L190.975,134.426 L192.45,131.398 L193.925,128.371 L195.4,125.344 L196.875,122.316 L198.35,119.289 L199.825,116.262 L201.3,113.234 L202.775,110.207 L204.25,107.18 L205.725,104.152 L207.2,101.125 L208.675,104.152 L210.15,107.18 L211.625,110.207 L213.1,113.234 L214.575,116.262 L216.05,119.289 L217.525,122.316 L219,125.344 L220.475,128.371 L221.95,131.398 L223.425,134.426 L224.9,137.453 L226.375,140.48 L227.85,143.508 L229.325,146.535 L230.8,149.563 L232.275,152.59 L233.75,155.617 L235.225,158.645 L236.7,161.672 L238.175,164.699 L239.65,167.727 L241.125,170.754 L242.6,173.781 L244.075,176.809 L245.55,179.836 L247.025,182.863 L248.5,185.891 L249.975,188.918 L251.45,191.945 L252.925,194.973 L254.4,198 L255.875,198 L257.35,198 L258.825,198 L260.3,198 L261.775,198 L263.25,198 L264.725,198 L266.2,198 L267.675,198 L269.15,198 L270.625,198 L272.1,198 L273.575,198 L275.05,198 L276.525,198 L278,198" fill="none" stroke="var(--sci-secondary)" strokeWidth="2.5" strokeDasharray="5 4" /></svg><p>The finite support describes smoothing, not an atomic hard core.</p></div>
<div className="sci-story-panel"><h4>Add contributions at each position</h4><svg className="sci-story-svg" viewBox="0 0 300 240" role="img" aria-label="Density is the sum of all three tent kernels; its integral is total mass three."><line x1="42" y1="198" x2="278" y2="198" stroke="currentColor" strokeWidth="1.5" /><line x1="42" y1="198" x2="42" y2="38" stroke="currentColor" strokeWidth="1.5" /><text x="160" y="233" textAnchor="middle">position x</text><text x="42" y="20" textAnchor="start">density Σ m W</text><text x="42" y="218" textAnchor="middle">−2</text><text x="278" y="218" textAnchor="middle">2</text><text x="34" y="202" textAnchor="end">0</text><text x="34" y="48" textAnchor="end">2</text><path d="M42,198 L43.475,198 L44.95,198 L46.425,198 L47.9,198 L49.375,198 L50.85,198 L52.325,198 L53.8,198 L55.275,198 L56.75,198 L58.225,198 L59.7,198 L61.175,198 L62.65,198 L64.125,198 L65.6,198 L67.075,194.973 L68.55,191.945 L70.025,188.918 L71.5,185.891 L72.975,182.863 L74.45,179.836 L75.925,176.809 L77.4,173.781 L78.875,170.754 L80.35,167.727 L81.825,164.699 L83.3,161.672 L84.775,158.645 L86.25,155.617 L87.725,152.59 L89.2,149.563 L90.675,146.535 L92.15,143.508 L93.625,140.48 L95.1,137.453 L96.575,134.426 L98.05,131.398 L99.525,128.371 L101,125.344 L102.475,122.316 L103.95,119.289 L105.425,116.262 L106.9,113.234 L108.375,110.207 L109.85,107.18 L111.325,104.152 L112.8,101.125 L114.275,101.125 L115.75,101.125 L117.225,101.125 L118.7,101.125 L120.175,101.125 L121.65,101.125 L123.125,101.125 L124.6,101.125 L126.075,101.125 L127.55,101.125 L129.025,101.125 L130.5,101.125 L131.975,101.125 L133.45,101.125 L134.925,101.125 L136.4,101.125 L137.875,101.125 L139.35,101.125 L140.825,101.125 L142.3,101.125 L143.775,101.125 L145.25,101.125 L146.725,101.125 L148.2,101.125 L149.675,101.125 L151.15,101.125 L152.625,101.125 L154.1,101.125 L155.575,101.125 L157.05,101.125 L158.525,101.125 L160,101.125 L161.475,101.125 L162.95,101.125 L164.425,101.125 L165.9,101.125 L167.375,101.125 L168.85,101.125 L170.325,101.125 L171.8,101.125 L173.275,101.125 L174.75,101.125 L176.225,101.125 L177.7,101.125 L179.175,101.125 L180.65,101.125 L182.125,101.125 L183.6,101.125 L185.075,101.125 L186.55,101.125 L188.025,101.125 L189.5,101.125 L190.975,101.125 L192.45,101.125 L193.925,101.125 L195.4,101.125 L196.875,101.125 L198.35,101.125 L199.825,101.125 L201.3,101.125 L202.775,101.125 L204.25,101.125 L205.725,101.125 L207.2,101.125 L208.675,104.152 L210.15,107.18 L211.625,110.207 L213.1,113.234 L214.575,116.262 L216.05,119.289 L217.525,122.316 L219,125.344 L220.475,128.371 L221.95,131.398 L223.425,134.426 L224.9,137.453 L226.375,140.48 L227.85,143.508 L229.325,146.535 L230.8,149.563 L232.275,152.59 L233.75,155.617 L235.225,158.645 L236.7,161.672 L238.175,164.699 L239.65,167.727 L241.125,170.754 L242.6,173.781 L244.075,176.809 L245.55,179.836 L247.025,182.863 L248.5,185.891 L249.975,188.918 L251.45,191.945 L252.925,194.973 L254.4,198 L255.875,198 L257.35,198 L258.825,198 L260.3,198 L261.775,198 L263.25,198 L264.725,198 L266.2,198 L267.675,198 L269.15,198 L270.625,198 L272.1,198 L273.575,198 L275.05,198 L276.525,198 L278,198" fill="none" stroke="var(--sci-accent)" strokeWidth="2.5" /><circle cx="112.8" cy="198" r="4" fill="var(--sci-accent)" /><circle cx="160" cy="198" r="4" fill="var(--sci-accent)" /><circle cx="207.2" cy="198" r="4" fill="var(--sci-accent)" /></svg><p>The dots locate parcels. The continuous curve estimates density between them.</p></div>
</div>
</Figure>

The plotted one-dimensional kernel is $W_h(x)=(1-|x|/h)_+/h$, whose integral is one. Its corner is useful for seeing support and normalisation; smoother kernels are generally preferable for accurate pressure gradients. Reducing $h$ changes spatial resolution and neighbour number, not a molecular interaction radius.

<h2 id="pressure">8.2 Build a pressure force with a conservation argument</h2>

For an inviscid fluid, the material momentum equation is

$$
\frac{Dv}{Dt}=-\frac1\rho\nabla P,
\qquad \frac{D\rho}{Dt}=-\rho\nabla\cdot v.
$$

A direct replacement of $\nabla P$ by an unsymmetrised particle sum can lose pairwise momentum conservation. A common fixed-$h$ SPH form instead uses

$$
\frac{dv_i}{dt}=-\sum_jm_j
\left(\frac{P_i}{\rho_i^2}+\frac{P_j}{\rho_j^2}\right)
\nabla_iW_h(r_i-r_j).
$$

For a symmetric kernel, $\nabla_jW_h(r_j-r_i)=-\nabla_iW_h(r_i-r_j)$. Multiply by $m_i$ to obtain forces: the force of $j$ on $i$ is exactly opposite to that of $i$ on $j$. Pair contributions therefore cancel in total momentum. If the kernel is radial, they are also central and conserve angular momentum in continuous time.

There is a deeper route to the same formula. Let $e(\rho,s)$ be specific internal energy and hold each parcel's entropy label $s_i$ fixed. For adiabatic thermodynamics,

$$
\left(\frac{\partial e}{\partial\rho}\right)_s=\frac{P}{\rho^2}.
$$

Use the discrete Lagrangian

$$
L=\sum_i m_i\left[\frac12|v_i|^2-e(\rho_i,s_i)\right],
\qquad \rho_i=\sum_jm_jW_h(r_i-r_j).
$$

Varying particle positions differentiates every density containing the moved particle. For a pair $i,j$, the terms from $e(\rho_i,s_i)$ and $e(\rho_j,s_j)$ add, producing precisely the symmetric pressure coefficient. Thus continuum internal energy can generate conservative discrete interactions. They are not microscopic pair potentials: the pressure coefficients depend on the surrounding density and thermodynamic state.

The [variational SPH formulation in Price's review](https://arxiv.org/html/1012.1885#S3) develops this relationship between density estimation, thermodynamics and conservation. It also explains why variable smoothing lengths require consistent correction terms. The fixed-$h$ expression above should not be copied unchanged into an adaptive formulation.

<h2 id="closure">8.3 The equation of state closes the particle model</h2>

Density alone does not supply the pressure. A barotropic model prescribes $P=P(\rho)$, for example

$$
P=c_s^2(\rho-\rho_0).
$$

Here $c_s^2=dP/d\rho$ is the squared sound speed and $\rho_0$ a reference density. Weakly compressible approximations choose $c_s$ large enough to keep density variations small relative to the flow speed, while paying the cost of a shorter acoustic timestep. The pressure law is a material/numerical closure, not a substitute for the momentum equation or the kernel discretisation.

For non-barotropic thermodynamics, evolve internal energy or entropy and use an equation of state $P(\rho,e)$. For the inviscid adiabatic fixed-$h$ scheme, one compatible work equation is

$$
\frac{de_i}{dt}=\frac{P_i}{\rho_i^2}
\sum_jm_j(v_i-v_j)\cdot\nabla_iW_h(r_i-r_j).
$$

Combined with the symmetric momentum equation, pair terms exchange kinetic and internal energy while preserving their total in continuous time. Viscous stresses and shock-capturing terms add dissipation and the corresponding heating. Artificial viscosity used for shocks must be distinguished from a calibrated physical viscosity.

<h2 id="scales">8.4 Similar computation, different limits</h2>

Both MD and SPH integrate positions and velocities, often use finite-support neighbour searches, and need timestep-convergence checks. MD forces approximate microscopic interactions; SPH pressure forces approximate a continuum conservation law. SPH parcels do not acquire independent molecular thermal noise merely because they are called particles.

In an explicit SPH method, acoustic and flow propagation impose a Courant-type bound involving $h/(c_s+|v|)$, with additional restrictions for viscosity, acceleration and the specific integrator. Increasing sound speed to suppress compressibility therefore increases cost. Kernel choice, neighbour resolution, boundary treatment and particle disorder affect convergence; decreasing $h$ without improving quadrature is insufficient.

This chapter has reduced a continuum field to numerical parcels. [The final chapter](/notes/es98d/free-energy) makes another kind of reduction: it maps a full microscopic configuration onto a small set of collective coordinates, while retaining the statistical weight of the unresolved degrees of freedom.

### Exercises

1. Use a Taylor expansion to show why a symmetric normalised kernel has no first-order smoothing error in the interior.
2. Verify the total momentum cancellation pair by pair for unequal parcel masses.
3. Differentiate the density sum and derive the adiabatic work equation. Check that it conserves total energy with the stated momentum equation.
