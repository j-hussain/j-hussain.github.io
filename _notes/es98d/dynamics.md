---
title: "3. Trajectories, heat baths and numerical time"
---

Release a particle in the harmonic well $U(x)=kx^2/2$. Newton's equation makes it oscillate; adding drag makes it settle at zero. Neither motion, by itself, describes the nonzero equilibrium width of a warm particle. To obtain that width while dissipating energy, we must model fluctuations as well as friction.

This chapter constructs that balance and then asks what survives a finite numerical timestep. The same distinction between an exact invariant measure and its numerical approximation will recur in Monte Carlo.

<h2 id="bath-dynamics">3.1 The degrees of freedom we eliminated return as noise</h2>

For a smooth potential, isolated classical motion satisfies

$$
dX_t=V_t\,dt,\qquad m\,dV_t=-\nabla U(X_t)dt.
$$

Coupling to an unresolved fluid motivates a drag force $-\gamma V$, where $\gamma>0$ has units mass/time. Many rapidly decorrelating bath impulses are approximated by Gaussian white noise. This is a coarse-grained Markov approximation: a bath with important memory can require coloured noise and a memory-dependent friction instead.

A $d$-dimensional Wiener process $W_t$ has independent Gaussian increments with covariance $\Delta t\,I_d$. Its derivative is not an ordinary function. The Langevin SDE is

$$
dX_t=V_t\,dt,\qquad
m\,dV_t=-\nabla U(X_t)dt-\gamma V_tdt
+\sqrt{2\gamma k_BT}\,dW_t.
$$

Formally the random force has mean zero and component covariance

$$
\mathbb E[\eta_a(t)\eta_b(t')]
=2\gamma k_BT\,\delta_{ab}\delta(t-t').
$$

Why this amplitude? Set the conservative force to zero and apply Itô's formula to one component $V^2$. If the random-force amplitude is $\sigma$, then

$$
\frac{d}{dt}\mathbb E[V^2]
=-\frac{2\gamma}{m}\mathbb E[V^2]+\frac{\sigma^2}{m^2}.
$$

At equilibrium, equipartition demands $m\mathbb E[V^2]=k_BT$. Thus $\sigma^2=2\gamma k_BT$. The **fluctuation–dissipation relation** is a constraint imposed by the target thermal distribution, not an independent knob for making trajectories look random.

For a confining smooth potential, this SDE preserves the full canonical position–velocity measure. Whether it converges to that measure additionally depends on the domain, regularity and accessibility; the word “Langevin” alone is not an ergodicity proof.

<h2 id="overdamped">3.2 Eliminate velocity only after identifying its timescale</h2>

A free velocity relaxes on the time $\tau_v=m/\gamma$. If this is short compared with the timescales on which positions and forces change, observations made after that transient can be described by the constant-friction overdamped limit

$$
dX_t=-\frac1\gamma\nabla U(X_t)dt
+\sqrt{\frac{2k_BT}{\gamma}}\,dW_t
=-\frac1\gamma\nabla U(X_t)dt
+\sqrt{\frac{2}{\beta\gamma}}\,dW_t.
$$

This is a limiting model, not a pointwise assertion that a white-noise acceleration is small. Its mobility is $1/\gamma$ and its diffusion coefficient is $D=k_BT/\gamma$. With $U=0$, each component has mean-square displacement $2Dt$. Spatially varying mobility needs additional care, including a thermal drift in the Itô formulation; we use constant mobility here.

The original viva answer used $\sqrt{2\beta/\gamma}$ while defining $\beta=(k_BT)^{-1}$. That factor is incorrect. It reverses the temperature dependence and fails the stationary-distribution check below.

<h2 id="stationarity">3.3 The probability current checks the model</h2>

For the overdamped process, a density $\rho$ obeys the Fokker–Planck equation

$$
\partial_t\rho=\frac1\gamma\nabla\cdot(\rho\nabla U)
+\frac1{\beta\gamma}\Delta\rho=-\nabla\cdot J,
\qquad
J=-\frac1\gamma\rho\nabla U-\frac1{\beta\gamma}\nabla\rho.
$$

Substitute $\rho=\pi\propto e^{-\beta U}$. Since $\nabla\pi=-\beta\pi\nabla U$, the drift and diffusive currents cancel pointwise: $J=0$. With periodic or reflecting boundaries, or sufficient decay at infinity, this gives a stationary probability measure. Normalisability and boundary conditions are essential; a free particle on all of $\mathbb R^d$ has no normalisable uniform equilibrium.

For the harmonic well the stationary law is Gaussian,

$$
\pi(x)=\sqrt{\frac{\beta k}{2\pi}}e^{-\beta kx^2/2},
\qquad \operatorname{Var}(X)=\frac1{\beta k},
\qquad \tau_x=\frac\gamma k.
$$

Increasing friction slows relaxation but does not change this width. Increasing temperature broadens the distribution. Compare these effects in the exact formulas represented below; the curves are equilibrium laws, not finite simulated histograms.

<Figure id="es98d-harmonic" title="Width and relaxation answer different questions" caption="Analytic overdamped harmonic laws with stiffness k = 1. Left varies inverse temperature with γ = 1. Right varies friction with β = 1. All quantities are nondimensional.">
<div className="sci-story-grid sci-story-two">
<div className="sci-story-panel"><h4>Cooling narrows equilibrium</h4><svg className="sci-story-svg" viewBox="0 0 300 240" role="img" aria-label="Gaussian equilibrium densities: beta 1 has variance 1, beta 4 has variance one quarter."><line x1="42" y1="198" x2="278" y2="198" stroke="currentColor" strokeWidth="1.5" /><line x1="42" y1="198" x2="42" y2="38" stroke="currentColor" strokeWidth="1.5" /><text x="160" y="233" textAnchor="middle">position x</text><text x="42" y="20" textAnchor="start">equilibrium density</text><text x="42" y="218" textAnchor="middle">−3</text><text x="278" y="218" textAnchor="middle">3</text><text x="34" y="202" textAnchor="end">0</text><text x="34" y="48" textAnchor="end">0.85</text><path d="M42,197.192 L43.475,197.096 L44.95,196.991 L46.425,196.875 L47.9,196.747 L49.375,196.606 L50.85,196.452 L52.325,196.284 L53.8,196.1 L55.275,195.899 L56.75,195.68 L58.225,195.441 L59.7,195.183 L61.175,194.902 L62.65,194.599 L64.125,194.27 L65.6,193.916 L67.075,193.535 L68.55,193.125 L70.025,192.684 L71.5,192.212 L72.975,191.707 L74.45,191.167 L75.925,190.592 L77.4,189.979 L78.875,189.328 L80.35,188.638 L81.825,187.906 L83.3,187.133 L84.775,186.317 L86.25,185.457 L87.725,184.552 L89.2,183.603 L90.675,182.609 L92.15,181.569 L93.625,180.483 L95.1,179.352 L96.575,178.175 L98.05,176.954 L99.525,175.69 L101,174.382 L102.475,173.033 L103.95,171.644 L105.425,170.217 L106.9,168.754 L108.375,167.257 L109.85,165.728 L111.325,164.172 L112.8,162.59 L114.275,160.986 L115.75,159.364 L117.225,157.727 L118.7,156.08 L120.175,154.427 L121.65,152.773 L123.125,151.122 L124.6,149.479 L126.075,147.848 L127.55,146.236 L129.025,144.647 L130.5,143.087 L131.975,141.56 L133.45,140.072 L134.925,138.629 L136.4,137.236 L137.875,135.896 L139.35,134.617 L140.825,133.402 L142.3,132.257 L143.775,131.185 L145.25,130.191 L146.725,129.279 L148.2,128.453 L149.675,127.715 L151.15,127.07 L152.625,126.519 L154.1,126.066 L155.575,125.711 L157.05,125.456 L158.525,125.303 L160,125.252 L161.475,125.303 L162.95,125.456 L164.425,125.711 L165.9,126.066 L167.375,126.519 L168.85,127.07 L170.325,127.715 L171.8,128.453 L173.275,129.279 L174.75,130.191 L176.225,131.185 L177.7,132.257 L179.175,133.402 L180.65,134.617 L182.125,135.896 L183.6,137.236 L185.075,138.629 L186.55,140.072 L188.025,141.56 L189.5,143.087 L190.975,144.647 L192.45,146.236 L193.925,147.848 L195.4,149.479 L196.875,151.122 L198.35,152.773 L199.825,154.427 L201.3,156.08 L202.775,157.727 L204.25,159.364 L205.725,160.986 L207.2,162.59 L208.675,164.172 L210.15,165.728 L211.625,167.257 L213.1,168.754 L214.575,170.217 L216.05,171.644 L217.525,173.033 L219,174.382 L220.475,175.69 L221.95,176.954 L223.425,178.175 L224.9,179.352 L226.375,180.483 L227.85,181.569 L229.325,182.609 L230.8,183.603 L232.275,184.552 L233.75,185.457 L235.225,186.317 L236.7,187.133 L238.175,187.906 L239.65,188.638 L241.125,189.328 L242.6,189.979 L244.075,190.592 L245.55,191.167 L247.025,191.707 L248.5,192.212 L249.975,192.684 L251.45,193.125 L252.925,193.535 L254.4,193.916 L255.875,194.27 L257.35,194.599 L258.825,194.902 L260.3,195.183 L261.775,195.441 L263.25,195.68 L264.725,195.899 L266.2,196.1 L267.675,196.284 L269.15,196.452 L270.625,196.606 L272.1,196.747 L273.575,196.875 L275.05,196.991 L276.525,197.096 L278,197.192" fill="none" stroke="var(--sci-accent)" strokeWidth="2.5" /><path d="M42,198 L43.475,198 L44.95,198 L46.425,198 L47.9,198 L49.375,198 L50.85,198 L52.325,198 L53.8,198 L55.275,198 L56.75,198 L58.225,198 L59.7,198 L61.175,198 L62.65,197.999 L64.125,197.999 L65.6,197.999 L67.075,197.998 L68.55,197.997 L70.025,197.996 L71.5,197.994 L72.975,197.992 L74.45,197.989 L75.925,197.984 L77.4,197.979 L78.875,197.971 L80.35,197.96 L81.825,197.946 L83.3,197.928 L84.775,197.903 L86.25,197.871 L87.725,197.83 L89.2,197.777 L90.675,197.708 L92.15,197.621 L93.625,197.511 L95.1,197.372 L96.575,197.198 L98.05,196.981 L99.525,196.713 L101,196.384 L102.475,195.982 L103.95,195.493 L105.425,194.905 L106.9,194.199 L108.375,193.359 L109.85,192.366 L111.325,191.197 L112.8,189.833 L114.275,188.249 L115.75,186.424 L117.225,184.335 L118.7,181.959 L120.175,179.275 L121.65,176.265 L123.125,172.913 L124.6,169.206 L126.075,165.137 L127.55,160.703 L129.025,155.909 L130.5,150.764 L131.975,145.288 L133.45,139.507 L134.925,133.456 L136.4,127.179 L137.875,120.727 L139.35,114.161 L140.825,107.546 L142.3,100.957 L143.775,94.472 L145.25,88.173 L146.725,82.145 L148.2,76.471 L149.675,71.234 L151.15,66.514 L152.625,62.382 L154.1,58.906 L155.575,56.14 L157.05,54.131 L158.525,52.912 L160,52.503 L161.475,52.912 L162.95,54.131 L164.425,56.14 L165.9,58.906 L167.375,62.382 L168.85,66.514 L170.325,71.234 L171.8,76.471 L173.275,82.145 L174.75,88.173 L176.225,94.472 L177.7,100.957 L179.175,107.546 L180.65,114.161 L182.125,120.727 L183.6,127.179 L185.075,133.456 L186.55,139.507 L188.025,145.288 L189.5,150.764 L190.975,155.909 L192.45,160.703 L193.925,165.137 L195.4,169.206 L196.875,172.913 L198.35,176.265 L199.825,179.275 L201.3,181.959 L202.775,184.335 L204.25,186.424 L205.725,188.249 L207.2,189.833 L208.675,191.197 L210.15,192.366 L211.625,193.359 L213.1,194.199 L214.575,194.905 L216.05,195.493 L217.525,195.982 L219,196.384 L220.475,196.713 L221.95,196.981 L223.425,197.198 L224.9,197.372 L226.375,197.511 L227.85,197.621 L229.325,197.708 L230.8,197.777 L232.275,197.83 L233.75,197.871 L235.225,197.903 L236.7,197.928 L238.175,197.946 L239.65,197.96 L241.125,197.971 L242.6,197.979 L244.075,197.984 L245.55,197.989 L247.025,197.992 L248.5,197.994 L249.975,197.996 L251.45,197.997 L252.925,197.998 L254.4,197.999 L255.875,197.999 L257.35,197.999 L258.825,198 L260.3,198 L261.775,198 L263.25,198 L264.725,198 L266.2,198 L267.675,198 L269.15,198 L270.625,198 L272.1,198 L273.575,198 L275.05,198 L276.525,198 L278,198" fill="none" stroke="var(--sci-secondary)" strokeWidth="2.5" strokeDasharray="6 4" /><text x="177" y="49" textAnchor="start">β = 4 (dashed)</text><text x="177" y="69" textAnchor="start">β = 1 (solid)</text></svg><p>Temperature changes the equilibrium spread: variance is 1/(βk).</p></div>
<div className="sci-story-panel"><h4>Friction slows relaxation</h4><svg className="sci-story-svg" viewBox="0 0 300 240" role="img" aria-label="Normalised covariance exp minus t over gamma; friction 4 decays more slowly than friction 1."><line x1="42" y1="198" x2="278" y2="198" stroke="currentColor" strokeWidth="1.5" /><line x1="42" y1="198" x2="42" y2="38" stroke="currentColor" strokeWidth="1.5" /><text x="160" y="233" textAnchor="middle">time t</text><text x="42" y="20" textAnchor="start">normalised covariance</text><text x="42" y="218" textAnchor="middle">0</text><text x="278" y="218" textAnchor="middle">4</text><text x="34" y="202" textAnchor="end">0</text><text x="34" y="48" textAnchor="end">1</text><path d="M42,43 L43.475,46.827 L44.95,50.559 L46.425,54.2 L47.9,57.75 L49.375,61.213 L50.85,64.59 L52.325,67.884 L53.8,71.097 L55.275,74.23 L56.75,77.286 L58.225,80.266 L59.7,83.173 L61.175,86.008 L62.65,88.773 L64.125,91.47 L65.6,94.1 L67.075,96.666 L68.55,99.168 L70.025,101.608 L71.5,103.988 L72.975,106.309 L74.45,108.573 L75.925,110.781 L77.4,112.934 L78.875,115.034 L80.35,117.083 L81.825,119.081 L83.3,121.029 L84.775,122.93 L86.25,124.783 L87.725,126.591 L89.2,128.354 L90.675,130.074 L92.15,131.751 L93.625,133.386 L95.1,134.982 L96.575,136.538 L98.05,138.055 L99.525,139.535 L101,140.979 L102.475,142.387 L103.95,143.76 L105.425,145.099 L106.9,146.405 L108.375,147.679 L109.85,148.921 L111.325,150.133 L112.8,151.315 L114.275,152.468 L115.75,153.592 L117.225,154.688 L118.7,155.758 L120.175,156.801 L121.65,157.818 L123.125,158.81 L124.6,159.777 L126.075,160.721 L127.55,161.642 L129.025,162.539 L130.5,163.415 L131.975,164.269 L133.45,165.102 L134.925,165.914 L136.4,166.706 L137.875,167.479 L139.35,168.232 L140.825,168.967 L142.3,169.684 L143.775,170.383 L145.25,171.065 L146.725,171.73 L148.2,172.379 L149.675,173.011 L151.15,173.628 L152.625,174.23 L154.1,174.817 L155.575,175.389 L157.05,175.948 L158.525,176.492 L160,177.023 L161.475,177.541 L162.95,178.046 L164.425,178.539 L165.9,179.019 L167.375,179.488 L168.85,179.945 L170.325,180.391 L171.8,180.826 L173.275,181.25 L174.75,181.663 L176.225,182.066 L177.7,182.46 L179.175,182.844 L180.65,183.218 L182.125,183.583 L183.6,183.939 L185.075,184.286 L186.55,184.624 L188.025,184.955 L189.5,185.277 L190.975,185.591 L192.45,185.897 L193.925,186.196 L195.4,186.488 L196.875,186.772 L198.35,187.049 L199.825,187.319 L201.3,187.583 L202.775,187.84 L204.25,188.091 L205.725,188.336 L207.2,188.574 L208.675,188.807 L210.15,189.034 L211.625,189.255 L213.1,189.471 L214.575,189.682 L216.05,189.887 L217.525,190.088 L219,190.283 L220.475,190.474 L221.95,190.659 L223.425,190.841 L224.9,191.017 L226.375,191.19 L227.85,191.358 L229.325,191.522 L230.8,191.682 L232.275,191.838 L233.75,191.99 L235.225,192.138 L236.7,192.283 L238.175,192.424 L239.65,192.562 L241.125,192.696 L242.6,192.827 L244.075,192.955 L245.55,193.079 L247.025,193.201 L248.5,193.319 L249.975,193.435 L251.45,193.548 L252.925,193.658 L254.4,193.765 L255.875,193.869 L257.35,193.971 L258.825,194.071 L260.3,194.168 L261.775,194.262 L263.25,194.355 L264.725,194.445 L266.2,194.533 L267.675,194.618 L269.15,194.702 L270.625,194.783 L272.1,194.863 L273.575,194.94 L275.05,195.016 L276.525,195.089 L278,195.161" fill="none" stroke="var(--sci-accent)" strokeWidth="2.5" /><path d="M42,43 L43.475,43.966 L44.95,44.925 L46.425,45.879 L47.9,46.827 L49.375,47.769 L50.85,48.705 L52.325,49.635 L53.8,50.559 L55.275,51.478 L56.75,52.391 L58.225,53.298 L59.7,54.2 L61.175,55.096 L62.65,55.986 L64.125,56.871 L65.6,57.75 L67.075,58.624 L68.55,59.492 L70.025,60.355 L71.5,61.213 L72.975,62.065 L74.45,62.912 L75.925,63.754 L77.4,64.59 L78.875,65.421 L80.35,66.248 L81.825,67.068 L83.3,67.884 L84.775,68.695 L86.25,69.5 L87.725,70.301 L89.2,71.097 L90.675,71.887 L92.15,72.673 L93.625,73.454 L95.1,74.23 L96.575,75.001 L98.05,75.767 L99.525,76.529 L101,77.286 L102.475,78.038 L103.95,78.785 L105.425,79.528 L106.9,80.266 L108.375,81 L109.85,81.729 L111.325,82.453 L112.8,83.173 L114.275,83.889 L115.75,84.6 L117.225,85.306 L118.7,86.008 L120.175,86.706 L121.65,87.399 L123.125,88.089 L124.6,88.773 L126.075,89.454 L127.55,90.13 L129.025,90.802 L130.5,91.47 L131.975,92.134 L133.45,92.793 L134.925,93.449 L136.4,94.1 L137.875,94.748 L139.35,95.391 L140.825,96.03 L142.3,96.666 L143.775,97.297 L145.25,97.924 L146.725,98.548 L148.2,99.168 L149.675,99.783 L151.15,100.395 L152.625,101.003 L154.1,101.608 L155.575,102.208 L157.05,102.805 L158.525,103.398 L160,103.988 L161.475,104.573 L162.95,105.156 L164.425,105.734 L165.9,106.309 L167.375,106.88 L168.85,107.448 L170.325,108.012 L171.8,108.573 L173.275,109.13 L174.75,109.684 L176.225,110.234 L177.7,110.781 L179.175,111.324 L180.65,111.864 L182.125,112.401 L183.6,112.934 L185.075,113.464 L186.55,113.991 L188.025,114.514 L189.5,115.034 L190.975,115.551 L192.45,116.065 L193.925,116.576 L195.4,117.083 L196.875,117.587 L198.35,118.088 L199.825,118.586 L201.3,119.081 L202.775,119.572 L204.25,120.061 L205.725,120.547 L207.2,121.029 L208.675,121.509 L210.15,121.985 L211.625,122.459 L213.1,122.93 L214.575,123.397 L216.05,123.862 L217.525,124.324 L219,124.783 L220.475,125.239 L221.95,125.693 L223.425,126.143 L224.9,126.591 L226.375,127.036 L227.85,127.478 L229.325,127.917 L230.8,128.354 L232.275,128.788 L233.75,129.219 L235.225,129.648 L236.7,130.074 L238.175,130.497 L239.65,130.917 L241.125,131.335 L242.6,131.751 L244.075,132.163 L245.55,132.574 L247.025,132.981 L248.5,133.386 L249.975,133.789 L251.45,134.189 L252.925,134.587 L254.4,134.982 L255.875,135.374 L257.35,135.765 L258.825,136.152 L260.3,136.538 L261.775,136.921 L263.25,137.301 L264.725,137.679 L266.2,138.055 L267.675,138.429 L269.15,138.8 L270.625,139.169 L272.1,139.535 L273.575,139.899 L275.05,140.261 L276.525,140.621 L278,140.979" fill="none" stroke="var(--sci-secondary)" strokeWidth="2.5" strokeDasharray="6 4" /><text x="160" y="80" textAnchor="start">γ = 4 (dashed)</text><text x="160" y="100" textAnchor="start">γ = 1 (solid)</text></svg><p>Friction changes the clock: decay time is γ/k, while the equilibrium width stays fixed.</p></div>
</div>
</Figure>

In fact $\operatorname{Cov}(X_t,X_0)=e^{-kt/\gamma}/(\beta k)$ at stationarity. Equilibrium spread and relaxation rate are different properties of the same model. An algorithm can preserve one while changing the other.

<h2 id="integration">3.4 Numerical trajectories introduce a second approximation</h2>

For smooth isolated dynamics, velocity Verlet uses

$$
v_{n+1/2}=v_n+\frac{\Delta t}{2}a(r_n),\qquad
r_{n+1}=r_n+\Delta t\,v_{n+1/2},
$$

$$
v_{n+1}=v_{n+1/2}+\frac{\Delta t}{2}a(r_{n+1}),
\qquad a_i(r)=-\frac{\nabla_iU(r)}{m_i}.
$$

It is second-order, time-reversible and symplectic for the smooth Hamiltonian problem, with typically bounded oscillatory energy error in a resolved stable regime. It does not conserve the exact Hamiltonian at every step. For a harmonic mode of frequency $\omega$, stability requires $\omega\Delta t<2$; accurate trajectories need a smaller step. The fastest mode, rather than the slow process of scientific interest, constrains the timestep.

For overdamped motion, Euler–Maruyama gives

$$
X_{n+1}=X_n-\frac{\Delta t}{\gamma}\nabla U(X_n)
+\sqrt{\frac{2\Delta t}{\beta\gamma}}\,\xi_n,
\qquad \xi_n\sim N(0,I).
$$

The harmonic case exposes its bias without a simulation. Setting $a=1-k\Delta t/\gamma$, the stationary variance solves $S=a^2S+2\Delta t/(\beta\gamma)$, hence

$$
S=\frac{1}{\beta k}\frac{1}{1-k\Delta t/(2\gamma)},
\qquad 0<k\Delta t/\gamma<2.
$$

A stable discretisation can therefore sample the wrong width. Reducing the step checks this bias; a Metropolis correction can instead restore the target measure at the cost of changing the process. For underdamped Langevin dynamics, splitting the deterministic force, drift and Ornstein–Uhlenbeck velocity update gives useful integrators; simply appending arbitrary noise to Verlet is not an accuracy argument.

<h2 id="thermostats">3.5 Preserving a distribution does not guarantee exploration</h2>

A thermostat exchanges energy to target NVT. Langevin friction and noise give one construction. A deterministic Nosé–Hoover thermostat introduces a bath variable $\zeta$, for example through $\dot p_i=F_i-\zeta p_i$ and $\dot\zeta=(2K-fk_BT)/Q_{\mathrm{th}}$, with $f$ thermal degrees of freedom and thermostat mass $Q_{\mathrm{th}}$. Suitable extended dynamics admit a canonical physical marginal, but simple systems can be nonergodic. Thermostat chains add coupled variables to improve exploration without a universal guarantee.

A barostat additionally evolves the volume or cell to target pressure; it must be constructed with the intended [NPT measure](/notes/es98d/equilibrium#npt). Neither resetting velocities to a fixed kinetic energy every step nor rescaling a box arbitrarily produces the correct ensemble fluctuations. For a transport measurement, coupling choices also affect physical dynamics, even when equilibrium position averages look right.

<h2 id="boundaries">3.6 A finite box with bulk ambitions</h2>

Periodic boundaries reduce exposed surfaces by identifying opposite faces. In a cubic cell of side $L$, wrap positions modulo $L$. For short-range pair interactions, the minimum-image displacement subtracts $L\operatorname{round}(\Delta r/L)$ componentwise. Using a spherical cutoff $r_c<L/2$ avoids including two images of the same particle in this simple construction. General cells require the corresponding geometric analysis.

Truncation changes the interaction model. A shifted potential, $u(r)-u(r_c)$ below $r_c$, makes the energy continuous but generally leaves a force jump. A force-shifted version

$$
u_{\mathrm{fs}}(r)=u(r)-u(r_c)-(r-r_c)u'(r_c),\qquad r<r_c,
$$

with zero beyond, makes both energy and force continuous. Switching functions give other smooth approximations. Tail corrections rely on assumptions about distant correlations and cannot replace a proper [long-range treatment](/notes/es98d/interaction-models#long-range) of Coulomb interactions.

<h3 id="neighbours">Avoid repeating the same pair search</h3>

A neighbour list stores pairs within $r_c+\delta$, where $\delta$ is a skin distance. If every particle has moved by less than $\delta/2$ since the list was built, no pair initially outside the list can have entered the interaction cutoff: relative separation can shrink by at most $\delta$. Rebuild before that bound fails, using displacements that account for periodic wrapping.

Cell-based searches and bounded local density can make short-range force evaluation approximately linear in $N$. The gain depends on locality and list maintenance; it is not obtained by storing an incomplete list. This is an implementation invariant with a direct geometric proof.

<h2 id="initialisation">3.7 One initial microstate must become representative</h2>

For a solid, start from a lattice compatible with the intended crystal, such as fcc, bcc, hcp or diamond cubic. A liquid can be prepared by melting an ordered structure or placing particles randomly subject to excluded-volume constraints. Dilute gases admit simpler random placements. Severe overlaps in a repulsive model create enormous forces and can destabilise the first step.

The original source describes a 64-atom diamond-cubic silicon supercell heated to 5000 K and equilibrated at 2000 K. Its underlying data and force-field slides are unavailable here. The example illustrates a preparation protocol, not a temperature recommendation transferable to every silicon potential.

For canonical unconstrained velocities, draw each component independently from $N(0,k_BT/m_i)$. To impose zero total momentum, subtract the centre-of-mass velocity $v_{\mathrm{cm}}=\sum_i m_iv_i/\sum_i m_i$. This samples a constrained kinetic distribution and removes $d$ degrees of freedom. Holonomic constraints remove further degrees of freedom. Temperature estimates use $T_{\mathrm{kin}}=2K/(fk_B)$ with the appropriate $f$.

Setting velocities to zero describes a cold start, while rescaling them to an exact kinetic energy fixes a quantity that should fluctuate in an unconstrained canonical ensemble. Either can be a preparation step, followed by equilibration; neither is the same as an equilibrium Maxwell draw.

Initial structure can select a metastable basin. Even a mathematically ergodic process may need far longer than the available runtime to leave it. Compare independent starts, monitor slow observables and distinguish preparation from production data. Discarding a fixed number of frames is not proof of equilibration. [Monte Carlo](/notes/es98d/monte-carlo) will change the sampling dynamics, but it inherits this finite-time problem.

### Exercises

1. Derive the stationary harmonic variance from Itô's formula and compare it with the Euler–Maruyama result.
2. Hold $T$ and $k$ fixed and double $\gamma$. Which quantities in the harmonic figure change?
3. Prove the neighbour-skin criterion using the triangle inequality. Why is a displacement measured only between wrapped coordinates insufficient?
