---
title: "5. What a finite simulation can tell us"
---

A million saved configurations need not contain a million independent pieces of information. If they all lie in the same slowly evolving domain, their mean may look stable while missing another important region of the ensemble. The [sampling construction](/notes/es98d/monte-carlo#metropolis) tells us which distribution is invariant. It does not tell us the precision of a finite estimate.

We will separate three questions: whether a long average converges, how its fluctuations scale, and whether the measured observable has the physical interpretation we intend.

<h2 id="ergodic-average">5.1 Convergence does not supply an error bar</h2>

For an integrable observable $A$, an appropriate ergodic law gives

$$
\overline A_M=\frac1M\sum_{n=1}^M A(X_n)
\longrightarrow \langle A\rangle_\pi
\quad\text{almost surely}.
$$

For a finite irreducible chain this holds even if it is periodic. For a continuous process, one needs the corresponding recurrence and integrability conditions. Hamiltonian time averages have an analogous assertion only on the invariant component actually explored by the trajectory. Energy conservation alone does not imply ergodicity.

The law is asymptotic. It gives neither a convergence speed nor permission to use independent-sample standard errors. A central limit theorem is a stronger statement, requiring additional mixing and moment conditions. Long memory can prevent the usual $M^{-1/2}$ regime even when the mean converges.

<h2 id="variance">5.2 Count every covariance pair</h2>

Assume now that the chain is stationary, $A$ has finite nonzero variance $\sigma_A^2$, and write

$$
C_A(k)=\operatorname{Cov}(A(X_n),A(X_{n+k})),
\qquad \rho_A(k)=\frac{C_A(k)}{\sigma_A^2}.
$$

Expanding the variance of the mean gives $M$ diagonal terms and $2(M-k)$ covariance terms at each positive lag $k$. Therefore the **exact finite-length identity** is

$$
\operatorname{Var}(\overline A_M)=\frac{\sigma_A^2}{M}
\left[1+2\sum_{k=1}^{M-1}\left(1-\frac{k}{M}\right)\rho_A(k)\right].
$$

The taper $1-k/M$ counts how many pairs actually exist. If the correlations are absolutely summable, the bracket tends to

$$
g_A=1+2\sum_{k=1}^\infty\rho_A(k)=2\tau_{\mathrm{int},A},
\qquad \tau_{\mathrm{int},A}=\frac12+\sum_{k=1}^\infty\rho_A(k).
$$

Then $\operatorname{Var}(\overline A_M)\sim g_A\sigma_A^2/M$, and a conventional effective sample size is $M_{\mathrm{eff}}\approx M/g_A$ when $g_A>0$. Our independent-sample convention is $\tau_{\mathrm{int}}=1/2$, hence $g_A=1$.

The source used the infinite-lag expression as a finite-$M$ equality. It is an asymptotic approximation, and stationarity was implicit. Correlations also need not inflate error: sufficiently negative correlations can give $g_A<1$. All these quantities depend on the observable, not just the chain.

A simple exact comparison uses $\rho(k)=a^k$, with $|a|<1$, as for a stationary Gaussian AR(1) process. Summing the geometric series gives $g=(1+a)/(1-a)$. Inspect how a slowly decaying correlation changes the error scale even though each marginal variance is still one.

<Figure id="es98d-correlation" title="Correlation has a measurable error cost" caption="Exact stationary AR(1) correlation laws, not simulation output. Right: the asymptotic variance relative to independent observations of the same marginal variance and length.">
<div className="sci-story-grid sci-story-two">
<div className="sci-story-panel"><h4>How slowly does memory decay?</h4><svg className="sci-story-svg" viewBox="0 0 300 240" role="img" aria-label="Autocorrelation a to power k for a 0.5 and 0.9, on common lag and correlation scales."><line x1="42" y1="198" x2="278" y2="198" stroke="currentColor" strokeWidth="1.5" /><line x1="42" y1="198" x2="42" y2="38" stroke="currentColor" strokeWidth="1.5" /><text x="160" y="233" textAnchor="middle">lag k</text><text x="42" y="20" textAnchor="start">correlation ρ(k)</text><text x="42" y="218" textAnchor="middle">0</text><text x="278" y="218" textAnchor="middle">20</text><text x="34" y="202" textAnchor="end">0</text><text x="34" y="48" textAnchor="end">1</text><path d="M42,43 L43.475,55.864 L44.95,67.661 L46.425,78.479 L47.9,88.398 L49.375,97.495 L50.85,105.836 L52.325,113.486 L53.8,120.5 L55.275,126.932 L56.75,132.831 L58.225,138.239 L59.7,143.199 L61.175,147.747 L62.65,151.918 L64.125,155.743 L65.6,159.25 L67.075,162.466 L68.55,165.415 L70.025,168.12 L71.5,170.6 L72.975,172.874 L74.45,174.959 L75.925,176.871 L77.4,178.625 L78.875,180.233 L80.35,181.708 L81.825,183.06 L83.3,184.3 L84.775,185.437 L86.25,186.48 L87.725,187.436 L89.2,188.313 L90.675,189.117 L92.15,189.854 L93.625,190.53 L95.1,191.15 L96.575,191.718 L98.05,192.24 L99.525,192.718 L101,193.156 L102.475,193.558 L103.95,193.927 L105.425,194.265 L106.9,194.575 L108.375,194.859 L109.85,195.12 L111.325,195.359 L112.8,195.578 L114.275,195.779 L115.75,195.963 L117.225,196.132 L118.7,196.287 L120.175,196.43 L121.65,196.56 L123.125,196.679 L124.6,196.789 L126.075,196.89 L127.55,196.982 L129.025,197.066 L130.5,197.144 L131.975,197.215 L133.45,197.28 L134.925,197.34 L136.4,197.395 L137.875,197.445 L139.35,197.491 L140.825,197.533 L142.3,197.572 L143.775,197.607 L145.25,197.64 L146.725,197.67 L148.2,197.697 L149.675,197.722 L151.15,197.745 L152.625,197.767 L154.1,197.786 L155.575,197.804 L157.05,197.82 L158.525,197.835 L160,197.849 L161.475,197.861 L162.95,197.873 L164.425,197.883 L165.9,197.893 L167.375,197.902 L168.85,197.91 L170.325,197.917 L171.8,197.924 L173.275,197.931 L174.75,197.936 L176.225,197.942 L177.7,197.946 L179.175,197.951 L180.65,197.955 L182.125,197.959 L183.6,197.962 L185.075,197.965 L186.55,197.968 L188.025,197.971 L189.5,197.973 L190.975,197.975 L192.45,197.977 L193.925,197.979 L195.4,197.981 L196.875,197.983 L198.35,197.984 L199.825,197.985 L201.3,197.987 L202.775,197.988 L204.25,197.989 L205.725,197.99 L207.2,197.991 L208.675,197.991 L210.15,197.992 L211.625,197.993 L213.1,197.993 L214.575,197.994 L216.05,197.994 L217.525,197.995 L219,197.995 L220.475,197.996 L221.95,197.996 L223.425,197.996 L224.9,197.997 L226.375,197.997 L227.85,197.997 L229.325,197.997 L230.8,197.998 L232.275,197.998 L233.75,197.998 L235.225,197.998 L236.7,197.998 L238.175,197.998 L239.65,197.999 L241.125,197.999 L242.6,197.999 L244.075,197.999 L245.55,197.999 L247.025,197.999 L248.5,197.999 L249.975,197.999 L251.45,197.999 L252.925,197.999 L254.4,197.999 L255.875,197.999 L257.35,198 L258.825,198 L260.3,198 L261.775,198 L263.25,198 L264.725,198 L266.2,198 L267.675,198 L269.15,198 L270.625,198 L272.1,198 L273.575,198 L275.05,198 L276.525,198 L278,198" fill="none" stroke="var(--sci-accent)" strokeWidth="2.5" /><path d="M42,43 L43.475,45.028 L44.95,47.029 L46.425,49.005 L47.9,50.954 L49.375,52.878 L50.85,54.777 L52.325,56.651 L53.8,58.5 L55.275,60.325 L56.75,62.126 L58.225,63.904 L59.7,65.659 L61.175,67.39 L62.65,69.099 L64.125,70.786 L65.6,72.45 L67.075,74.093 L68.55,75.714 L70.025,77.314 L71.5,78.893 L72.975,80.451 L74.45,81.989 L75.925,83.507 L77.4,85.005 L78.875,86.483 L80.35,87.942 L81.825,89.382 L83.3,90.804 L84.775,92.206 L86.25,93.59 L87.725,94.956 L89.2,96.305 L90.675,97.635 L92.15,98.948 L93.625,100.244 L95.1,101.523 L96.575,102.785 L98.05,104.031 L99.525,105.261 L101,106.474 L102.475,107.672 L103.95,108.853 L105.425,110.02 L106.9,111.171 L108.375,112.307 L109.85,113.428 L111.325,114.535 L112.8,115.627 L114.275,116.704 L115.75,117.768 L117.225,118.818 L118.7,119.854 L120.175,120.876 L121.65,121.885 L123.125,122.881 L124.6,123.864 L126.075,124.834 L127.55,125.791 L129.025,126.736 L130.5,127.668 L131.975,128.589 L133.45,129.497 L134.925,130.393 L136.4,131.278 L137.875,132.151 L139.35,133.012 L140.825,133.862 L142.3,134.702 L143.775,135.53 L145.25,136.347 L146.725,137.154 L148.2,137.95 L149.675,138.736 L151.15,139.511 L152.625,140.276 L154.1,141.031 L155.575,141.777 L157.05,142.512 L158.525,143.238 L160,143.955 L161.475,144.662 L162.95,145.36 L164.425,146.049 L165.9,146.728 L167.375,147.399 L168.85,148.061 L170.325,148.715 L171.8,149.359 L173.275,149.996 L174.75,150.624 L176.225,151.244 L177.7,151.855 L179.175,152.459 L180.65,153.055 L182.125,153.643 L183.6,154.223 L185.075,154.796 L186.55,155.361 L188.025,155.919 L189.5,156.47 L190.975,157.013 L192.45,157.55 L193.925,158.079 L195.4,158.601 L196.875,159.117 L198.35,159.625 L199.825,160.127 L201.3,160.623 L202.775,161.112 L204.25,161.595 L205.725,162.071 L207.2,162.541 L208.675,163.005 L210.15,163.463 L211.625,163.915 L213.1,164.361 L214.575,164.801 L216.05,165.235 L217.525,165.664 L219,166.087 L220.475,166.504 L221.95,166.916 L223.425,167.323 L224.9,167.725 L226.375,168.121 L227.85,168.512 L229.325,168.897 L230.8,169.278 L232.275,169.654 L233.75,170.025 L235.225,170.391 L236.7,170.752 L238.175,171.109 L239.65,171.46 L241.125,171.808 L242.6,172.15 L244.075,172.489 L245.55,172.822 L247.025,173.152 L248.5,173.477 L249.975,173.798 L251.45,174.114 L252.925,174.427 L254.4,174.735 L255.875,175.04 L257.35,175.34 L258.825,175.637 L260.3,175.929 L261.775,176.218 L263.25,176.503 L264.725,176.784 L266.2,177.062 L267.675,177.336 L269.15,177.606 L270.625,177.873 L272.1,178.136 L273.575,178.396 L275.05,178.653 L276.525,178.906 L278,179.156" fill="none" stroke="var(--sci-secondary)" strokeWidth="2.5" strokeDasharray="6 4" /><text x="140" y="75" textAnchor="start">a = 0.9 (dashed)</text><text x="140" y="97" textAnchor="start">a = 0.5 (solid)</text></svg><p>A larger a leaves substantial correlation at many positive lags.</p></div>
<div className="sci-story-panel"><h4>Sum the covariance contributions</h4><svg className="sci-story-svg" viewBox="0 0 300 240" role="img" aria-label="Long-run variance factors are 1, 3, 19 for AR coefficients 0, 0.5, 0.9."><line x1="42" y1="198" x2="278" y2="198" stroke="currentColor" strokeWidth="1.5" /><line x1="42" y1="198" x2="42" y2="38" stroke="currentColor" strokeWidth="1.5" /><text x="160" y="233" textAnchor="middle">AR coefficient a</text><text x="42" y="20" textAnchor="start">variance factor g</text><text x="42" y="218" textAnchor="middle"></text><text x="278" y="218" textAnchor="middle"></text><text x="34" y="202" textAnchor="end">0</text><text x="34" y="48" textAnchor="end">20</text><rect x="66" y="190.25" width="32" height="7.75" fill="none" stroke="var(--sci-accent)" strokeWidth="2" /><text x="82" y="182.25" textAnchor="middle">1</text><text x="82" y="219" textAnchor="middle">0</text><rect x="142" y="174.75" width="32" height="23.25" fill="none" stroke="var(--sci-accent)" strokeWidth="2" /><text x="158" y="166.75" textAnchor="middle">3</text><text x="158" y="219" textAnchor="middle">0.5</text><rect x="218" y="50.75" width="32" height="147.25" fill="none" stroke="var(--sci-secondary)" strokeWidth="2" /><text x="234" y="42.75" textAnchor="middle">19</text><text x="234" y="219" textAnchor="middle">0.9</text></svg><p>The variance multiplier is g; the standard-error multiplier is its square root.</p></div>
</div>
</Figure>

At $a=0.9$, $g=19$: 1900 observations contain roughly the mean-estimation information of 100 independent ones in the long-run regime. The standard error grows by $\sqrt{19}$, rather than by 19. For a fixed computational budget, compare the product of correlation time and cost per update; a more expensive collective move can still be worthwhile.

<h2 id="error-bars">5.3 Estimate uncertainty without confusing it with equilibration</h2>

Under a valid Markov-chain CLT, a large-sample interval has the form $\overline A_M\pm z\sqrt{\widehat g_A\widehat\sigma_A^2/M}$. Estimating the long-run variance is itself a statistical problem. Summing empirical correlations to arbitrarily large lags accumulates noise. Windowed estimates, batch means, or blocking methods use a finite lag/block scale that must be long compared with the relevant correlation time and short compared with the run.

A practical analysis compares progressively larger blocks and independent runs, including starts in different plausible basins. Stability of a short observable trace cannot rule out an unvisited state. Burn-in targets initial-distribution bias; the stationary covariance formula targets sampling variability. Neither corrects force-field error, finite-size effects or timestep bias.

Thinning usually throws away information at a fixed number of computed steps. It can help when storing or evaluating an observable is expensive, but it does not make an inadequately explored trajectory representative. Report the production length, equilibration procedure, observable-specific error estimate and physical/numerical settings together.

<h2 id="heat-capacity">5.4 Energy fluctuations are a thermodynamic response</h2>

An equilibrium observable can contain more information than its mean. At fixed $N,V$, with a temperature-independent Hamiltonian,

$$
\frac{\partial\log Q}{\partial\beta}=-\langle H\rangle,
\qquad
\frac{\partial\langle H\rangle}{\partial\beta}
=-\operatorname{Var}(H).
$$

Since $d\beta/dT=-1/(k_BT^2)$, the canonical heat capacity is

$$
C_V=\left(\frac{\partial\langle H\rangle}{\partial T}\right)_{N,V}
=\frac{\operatorname{Var}(H)}{k_BT^2}.
$$

The derivation explains the interpretation: a system whose energy distribution changes strongly with temperature also has large energy fluctuations. The formula does not apply to the total-energy variance of a fixed-energy NVE trajectory, which vanishes in exact dynamics.

If configurational Monte Carlo samples only $U$, the independent quadratic momenta supply the missing kinetic term. For $f$ independent unconstrained-or-linearly-constrained quadratic momentum degrees of freedom,

$$
C_V=\frac f2k_B+\frac{\operatorname{Var}(U)}{k_BT^2}.
$$

More general constraints and temperature-dependent effective potentials require revisiting the measure and derivative. Estimating a fluctuation quantity involves correlated estimates of both $\langle U\rangle$ and $\langle U^2\rangle$; blocks should preserve their joint fluctuations.

<h2 id="structure">5.5 A pair histogram must be compared with available volume</h2>

For a homogeneous isotropic fluid in three dimensions, the radial distribution function $g(r)$ compares neighbour density at separation $r$ with the mean density $\rho=N/V$. Using ordered pairs, a shell $[r,r+\Delta r)$ with volume $\Delta V_r=4\pi[(r+\Delta r)^3-r^3]/3$ gives

$$
g(r)\approx\frac{1}{N\rho\,\Delta V_r}
\left\langle\sum_i\sum_{j\ne i}
\mathbf1_{[r,r+\Delta r)}(r_{ij})\right\rangle.
$$

For unordered pair counts, multiply the numerator by two. At finite fixed $N$, this convention gives $g=(N-1)/N$ for an ideal gas; using $(N-1)/V$ as the reference density makes its finite-$N$ ideal-gas baseline exactly one. State which convention is used. Shells must fit the minimum-image geometry or receive a geometric volume correction.

Peaks reveal preferred neighbour distances, and $4\pi\rho\int_0^R r^2g(r)dr$ gives a mean coordination count under the stated convention. The angular distribution function similarly records selected triplet angles and requires its own counting and angular measure. These are equilibrium structural averages accessible to either correctly sampled MC configurations or equilibrated MD frames; the order in which configurations were generated is irrelevant to their static definitions.

<h2 id="transport">5.6 A transport coefficient needs physical time</h2>

Thermal conductivity instead describes a response to a temperature gradient:

$$
\mathbf J_q=-\kappa\nabla T
$$

for an isotropic material in the linear-response regime. A reverse nonequilibrium MD construction, associated with Müller–Plathe, exchanges kinetic energy between selected slabs and measures the resulting steady temperature profile. The imposed energy-transfer rate determines the flux; for a symmetric periodic geometry with two equal heat-flow paths, each path carries half the total transfer rate per area. Other geometries require their own flux accounting. Fit the bulk gradient away from perturbed slabs and verify the weak-driving regime.

For a monatomic model one can implement energy transfer by appropriate velocity exchanges; with equal masses, exchanging velocities preserves the pair's total kinetic energy and momentum while moving energy between spatial slabs. More general masses require a correspondingly conservative exchange rule. Momentum-exchange constructions similarly measure viscosity from an imposed momentum flux and velocity gradient.

Transport requires a time-evolution model with an appropriate physical interpretation and controlled thermostat, size and finite-time effects. Arbitrary Metropolis or event-chain step counts do not provide that time. This is why the same particle configurations may suffice for $g(r)$ but fail to determine $\kappa$.

[The next chapter](/notes/es98d/collective-updates) uses our error analysis to diagnose a different problem: an algorithm may accept many local moves while leaving the slowest collective observable almost unchanged.

### Exercises

1. Derive the finite-$M$ covariance identity by counting pairs at each lag. Evaluate it for $M=2$ and compare with the infinite-lag approximation.
2. For $a=-1/2$, compute $g$ and explain why effective sample size can exceed the number of observations for this particular mean.
3. Derive the heat-capacity identity directly by differentiating the ratio defining $\langle H\rangle$.
4. Write an RDF normalisation for unordered pairs and verify the ideal-gas finite-$N$ baseline.
