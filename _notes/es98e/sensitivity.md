---
title: "1. Sensitivity: which uncertainties matter?"
---

A simulator predicts a material's bulk modulus from twelve force-field parameters. Each parameter is uncertain, and each simulator run costs time. Before drawing thousands of random inputs, we can ask a smaller question: which directions in parameter space actually move the prediction?

Write the quantity of interest as $Q:\mathbb R^p\to\mathbb R$ and choose a nominal input $\bar x$. Throughout this chapter, derivatives are evaluated at $\bar x$ unless stated otherwise. Our first approximation will be local. That qualification matters: a parameter can be invisible near one operating point and decisive elsewhere.

**In this chapter:** [local response](#local-response), [computing derivatives](#derivatives), [propagating uncertainty](#uncertainty), [screening and sparsity](#screening).

<h2 id="local-response">A gradient measures a direction, not just a parameter</h2>

For a perturbation $\Delta=x-\bar x$, Taylor's theorem gives, when third derivatives are bounded nearby,

$$
Q(\bar x+\Delta)=Q(\bar x)+g^T\Delta+\frac12\Delta^TH\Delta+O(\|\Delta\|^3),
\qquad g=\nabla Q(\bar x),\quad H=\nabla^2Q(\bar x).
$$

The gradient gives the first-order response; the Hessian measures curvature and interactions. A displacement along $e_i$ isolates $g_i$. A simultaneous displacement in two coordinates can expose $H_{ij}$ even when both first derivatives vanish.

A one-dimensional slice isolates the idea. Let $Q(s)=s+cs^2$ around $s=0$. The derivative fixes the tangent, while the curvature controls the gap. Move the probe through the neighbourhood before changing $c$: the omitted term should shrink quadratically as the probe returns to zero.

<div data-es98e-animation="tangent-trust" />

<PredictReveal question="If every first derivative vanishes at the nominal input, must the output be unaffected by nearby input uncertainty?" choices={[{id: "yes", label: "Yes: zero derivatives mean no response"}, {id: "no", label: "No: curvature or interactions can still contribute"}]} answer="no" explanation={<p>The local linear response vanishes, but a quadratic term can remain. At the origin Q = x₁x₂ has zero gradient and a nonzero mixed derivative, so joint perturbations can change its value.</p>} />

For example, take the illustrative model

$$
Q(x_1,x_2)=x_1+2x_2+x_1x_2,\qquad \bar x=(0,0).
$$

Then $g=(1,2)^T$ and $H_{12}=H_{21}=1$. Moving either coordinate alone misses the interaction; moving both adds the product $\Delta_1\Delta_2$. The quadratic approximation is exact for this example. By contrast, $Q=x_1x_2$ has zero gradient at the origin without being insensitive to joint perturbations. Screening solely by the gradient would discard its entire response.

<h2 id="derivatives">Paying for derivatives</h2>

If only simulator evaluations are available, a forward difference estimates

$$
g_i\approx\frac{Q(\bar x+h_ie_i)-Q(\bar x)}{h_i}.
$$

One shared baseline and $p$ perturbed runs cost $p+1$ evaluations. For a smooth deterministic function, truncation error is $O(h_i)$; central differences reduce it to $O(h_i^2)$ at a cost of $2p$ perturbed runs. Smaller steps eventually amplify roundoff, simulator noise and solver tolerances. Choose $h_i$ relative to a meaningful parameter scale, including a nonzero absolute scale when $\bar x_i=0$, and check stability over several step sizes. The source's rule $h_i=10^{-6}\bar x_i$ cannot be universal.

Central second differences give

$$
H_{ii}\approx\frac{Q(\bar x+h_ie_i)-2Q(\bar x)+Q(\bar x-h_ie_i)}{h_i^2},
$$

$$
H_{ij}\approx\frac{Q_{++}-Q_{+-}-Q_{-+}+Q_{--}}{4h_ih_j},\qquad i\ne j,
$$

where $Q_{ab}=Q(\bar x+ah_ie_i+bh_je_j)$ for signs $a,b\in\{-1,1\}$. For these stencils, sharing the baseline and exploiting symmetry requires

$$
1+2p+4\binom p2=1+2p^2
$$

evaluations for the full Hessian. This includes all coordinate perturbations; do not charge for them again when also estimating the gradient. Automatic differentiation, when the simulator supports it, and adjoint methods can change this cost substantially. Neither removes modelling error or differentiation through an unconverged solver.

<h2 id="uncertainty">Sensitivity depends on the uncertainty we supply</h2>

A derivative has units of output divided by input. Comparing raw derivatives of a distance and an energy is therefore not meaningful without scales. Multiplying by a reference scale $s_i$ gives $s_i g_i$, in **output units**. The source calls $\bar x_i g_i$ dimensionless; a dimensionless relative sensitivity is instead $\bar x_i g_i/Q(\bar x)$, provided the denominator is nonzero. For uncertain inputs, $\sigma_i g_i$ measures the first-order effect of a one-standard-deviation perturbation.

Let the random displacement have mean zero and covariance $\Sigma=\mathbb E[\Delta\Delta^T]$. The linear approximation yields

$$
\operatorname{Var}(Q)\approx\mathbb E[(g^T\Delta)^2]=g^T\Sigma g.
$$

Now transport the same input cloud through the linear response. Changing correlation rotates and reshapes the cloud without changing either coordinate variance. Watch the output distribution rather than treating correlation as an extra independent uncertainty.

<div data-es98e-animation="uncertainty-transport" />

For independent coordinates this becomes $\sum_i g_i^2\sigma_i^2$. Correlation adds cross terms, which can reinforce or cancel. Compare the same gradient under positive and negative correlation in the figure; the individual parameter uncertainties stay fixed.

<Figure id="es98e-correlated-uncertainty" title="The same sensitivities, different output uncertainty" caption="Illustrative linear response Q = Δ₁ + 2Δ₂. Both input standard deviations equal one. The ellipses are one-unit Mahalanobis contours, not confidence regions with a stated coverage. Correlations +0.8 and −0.8 give output variances 8.2 and 1.8. All axes use the same scale.">
  <svg data-es98e-diagram="sensitivity" role="img" aria-label="Equal-scale covariance ellipses at correlations plus and minus 0.8; gradient (1,2); output variances 8.2 and 1.8." viewBox="0 0 400 580" fill="none" xmlns="http://www.w3.org/2000/svg"><g fontSize="16" fontFamily="inherit" fill="currentColor"><text x="15" y="25" fontWeight="600">ρ = 0.8: output variance 8.2</text><line x1="67.500" y1="155.000" x2="342.500" y2="155.000" stroke="currentColor" strokeWidth="1.5"  /><line x1="205.000" y1="259.500" x2="205.000" y2="50.500" stroke="currentColor" strokeWidth="1.5"  /><path d="M257.178 102.822 L258.016 103.804 L258.710 104.926 L259.256 106.186 L259.653 107.579 L259.901 109.102 L259.998 110.751 L259.945 112.521 L259.741 114.408 L259.387 116.405 L258.883 118.509 L258.232 120.713 L257.436 123.011 L256.495 125.396 L255.413 127.862 L254.193 130.403 L252.839 133.012 L251.353 135.680 L249.740 138.402 L248.005 141.169 L246.151 143.974 L244.185 146.809 L242.111 149.666 L239.936 152.539 L237.665 155.418 L235.304 158.295 L232.861 161.164 L230.341 164.016 L227.751 166.843 L225.099 169.638 L222.393 172.393 L219.638 175.099 L216.843 177.751 L214.016 180.341 L211.164 182.861 L208.295 185.304 L205.418 187.665 L202.539 189.936 L199.666 192.111 L196.809 194.185 L193.974 196.151 L191.169 198.005 L188.402 199.740 L185.680 201.353 L183.012 202.839 L180.403 204.193 L177.862 205.413 L175.396 206.495 L173.011 207.436 L170.713 208.232 L168.509 208.883 L166.405 209.387 L164.408 209.741 L162.521 209.945 L160.751 209.998 L159.102 209.901 L157.579 209.653 L156.186 209.256 L154.926 208.710 L153.804 208.016 L152.822 207.178 L151.984 206.196 L151.290 205.074 L150.744 203.814 L150.347 202.421 L150.099 200.898 L150.002 199.249 L150.055 197.479 L150.259 195.592 L150.613 193.595 L151.117 191.491 L151.768 189.287 L152.564 186.989 L153.505 184.604 L154.587 182.138 L155.807 179.597 L157.161 176.988 L158.647 174.320 L160.260 171.598 L161.995 168.831 L163.849 166.026 L165.815 163.191 L167.889 160.334 L170.064 157.461 L172.335 154.582 L174.696 151.705 L177.139 148.836 L179.659 145.984 L182.249 143.157 L184.901 140.362 L187.607 137.607 L190.362 134.901 L193.157 132.249 L195.984 129.659 L198.836 127.139 L201.705 124.696 L204.582 122.335 L207.461 120.064 L210.334 117.889 L213.191 115.815 L216.026 113.849 L218.831 111.995 L221.598 110.260 L224.320 108.647 L226.988 107.161 L229.597 105.807 L232.138 104.587 L234.604 103.505 L236.989 102.564 L239.287 101.768 L241.491 101.117 L243.595 100.613 L245.592 100.259 L247.479 100.055 L249.249 100.002 L250.898 100.099 L252.421 100.347 L253.814 100.744 L255.074 101.290 L256.196 101.984 L257.178 102.822" fill="none" stroke="var(--sci-secondary)" strokeWidth="2"  /><line x1="205.000" y1="155.000" x2="260.000" y2="45.000" stroke="var(--sci-accent)" strokeWidth="1.5"  /><circle cx="260.000" cy="45.000" r="3" fill="var(--sci-accent)" /><text x="250" y="46" >g = (1,2)</text><text x="342" y="176" >Δ₁</text><text x="213" y="65" >Δ₂</text><text x="260" y="275" >Equal input scales</text><text x="15" y="315" fontWeight="600">ρ = -0.8: output variance 1.8</text><line x1="67.500" y1="445.000" x2="342.500" y2="445.000" stroke="currentColor" strokeWidth="1.5"  /><line x1="205.000" y1="549.500" x2="205.000" y2="340.500" stroke="currentColor" strokeWidth="1.5"  /><path d="M222.393 427.607 L225.099 430.362 L227.751 433.157 L230.341 435.984 L232.861 438.836 L235.304 441.705 L237.665 444.582 L239.936 447.461 L242.111 450.334 L244.185 453.191 L246.151 456.026 L248.005 458.831 L249.740 461.598 L251.353 464.320 L252.839 466.988 L254.193 469.597 L255.413 472.138 L256.495 474.604 L257.436 476.989 L258.232 479.287 L258.883 481.491 L259.387 483.595 L259.741 485.592 L259.945 487.479 L259.998 489.249 L259.901 490.898 L259.653 492.421 L259.256 493.814 L258.710 495.074 L258.016 496.196 L257.178 497.178 L256.196 498.016 L255.074 498.710 L253.814 499.256 L252.421 499.653 L250.898 499.901 L249.249 499.998 L247.479 499.945 L245.592 499.741 L243.595 499.387 L241.491 498.883 L239.287 498.232 L236.989 497.436 L234.604 496.495 L232.138 495.413 L229.597 494.193 L226.988 492.839 L224.320 491.353 L221.598 489.740 L218.831 488.005 L216.026 486.151 L213.191 484.185 L210.334 482.111 L207.461 479.936 L204.582 477.665 L201.705 475.304 L198.836 472.861 L195.984 470.341 L193.157 467.751 L190.362 465.099 L187.607 462.393 L184.901 459.638 L182.249 456.843 L179.659 454.016 L177.139 451.164 L174.696 448.295 L172.335 445.418 L170.064 442.539 L167.889 439.666 L165.815 436.809 L163.849 433.974 L161.995 431.169 L160.260 428.402 L158.647 425.680 L157.161 423.012 L155.807 420.403 L154.587 417.862 L153.505 415.396 L152.564 413.011 L151.768 410.713 L151.117 408.509 L150.613 406.405 L150.259 404.408 L150.055 402.521 L150.002 400.751 L150.099 399.102 L150.347 397.579 L150.744 396.186 L151.290 394.926 L151.984 393.804 L152.822 392.822 L153.804 391.984 L154.926 391.290 L156.186 390.744 L157.579 390.347 L159.102 390.099 L160.751 390.002 L162.521 390.055 L164.408 390.259 L166.405 390.613 L168.509 391.117 L170.713 391.768 L173.011 392.564 L175.396 393.505 L177.862 394.587 L180.403 395.807 L183.012 397.161 L185.680 398.647 L188.402 400.260 L191.169 401.995 L193.974 403.849 L196.809 405.815 L199.666 407.889 L202.539 410.064 L205.418 412.335 L208.295 414.696 L211.164 417.139 L214.016 419.659 L216.843 422.249 L219.638 424.901 L222.393 427.607" fill="none" stroke="var(--sci-secondary)" strokeWidth="2"  /><line x1="205.000" y1="445.000" x2="260.000" y2="335.000" stroke="var(--sci-accent)" strokeWidth="1.5"  /><circle cx="260.000" cy="335.000" r="3" fill="var(--sci-accent)" /><text x="250" y="336" >g = (1,2)</text><text x="342" y="466" >Δ₁</text><text x="213" y="355" >Δ₂</text><text x="260" y="565" >Equal input scales</text></g></svg>
</Figure>

The formula also explains its own limitation. If $g=0$, it predicts no variance, even though quadratic terms may fluctuate. Retaining the Hessian gives an approximate mean shift $\tfrac12\operatorname{tr}(H\Sigma)$. For centred Gaussian inputs, the variance of the quadratic Taylor model is

$$
g^T\Sigma g+\frac12\operatorname{tr}(H\Sigma H\Sigma),
$$

because centred Gaussian third moments vanish and fourth moments factor into covariance pairings. This is an added analytic example, not a claim about the unavailable lecture simulator. For $Q=x_1x_2$ with independent unit Gaussians, it correctly gives variance one where linear propagation gives zero.

<h2 id="screening">From screening to sparse regression</h2>

With many inputs, first-order screening can identify candidates for a reduced model. The original notes report that two exponential parameters dominated a Tersoff bulk-modulus calculation, while cutoff parameters were locally inactive. That observation depends on the nominal configuration, perturbation range and quantity of interest. It does not license fixing the same parameters for every configuration or observable.

An alternative samples joint perturbations. Set $X_{ij}=(x_{ij}-\bar x_j)/s_j$ with nonzero scales $s_j$, and $y_i=Q(x_i)-Q(\bar x)$. Taylor's theorem becomes

$$
y=X\beta+r,\qquad \beta_j=s_jg_j,
$$

where $r$ contains curvature and simulation error. If only a few coefficients are appreciable, estimate them using the Lasso:

$$
\hat\beta=\arg\min_\beta\left\{\frac1{2n}\|y-X\beta\|^2+\lambda\|\beta\|_1\right\}.
$$

The cornered $\ell_1$ penalty can set coefficients exactly to zero. Ridge's smooth $\ell_2$ penalty usually shrinks them without selecting a small support. Sparse recovery still requires an informative design, adequate signal, controlled Taylor error and suitable regularisation. Under appropriate assumptions, sample requirements often involve $k\log(p/k)$ for $k$ active variables; $n\sim k$ is not a universal guarantee. Correlated columns can make individual parameter attribution impossible.

The source reports a demonstration selecting five of one hundred parameters from thirty runs. Its data are absent, so this remains a reported example. The transferable lesson is to test the reduced model on withheld runs, multiple nominal points and the intended uncertainty range. The next chapter develops the [regression problem](/notes/es98e/regression) that screening has already produced.

### Check your understanding

For $Q=x_1x_2$, verify the gradient and Hessian at the origin and the quadratic variance above. Then choose $Q=x_1-x_2$ and show why perfectly correlated equal input errors cancel, whereas independent errors do not. These are useful analytic checks before trusting a simulator-based sensitivity calculation.
