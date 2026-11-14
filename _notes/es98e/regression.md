---
title: "2. Regression: choosing what a model can express"
---

Suppose noisy observations trace out a cosine. A straight line will miss the oscillation; an elaborate model may chase every noisy deviation. Before asking how to fit a model, we must decide which aspects of the curve it should be able to express.

The [sensitivity model](/notes/es98e/sensitivity#screening) used fixed input features and unknown coefficients. The same construction can describe curved functions. Its advantage is that expressive choices and parameter estimation can be studied separately.

**In this chapter:** [features and least squares](#features), [likelihood and regularisation](#probability), [generalisation](#generalisation), [Bayesian evidence](#evidence).

<h2 id="features">Curved functions, linear coefficients</h2>

Choose features $\phi_1,\ldots,\phi_M$ and define

$$
f_w(x)=\sum_{j=1}^M w_j\phi_j(x),\qquad \Phi_{ij}=\phi_j(x_i).
$$

The vector of fitted observations is $\Phi w$. The features may be nonlinear in $x$; the model is **linear in its parameters**. This terminology avoids confusing it with a statistical generalised linear model, which additionally specifies a response distribution and link function.

Classification offers a geometric version of the same distinction. An inner disk surrounded by a ring cannot be separated by a line in the input plane. Add the feature $x_1^2+x_2^2$, and a plane can separate them in three dimensions. In the original coordinates, the linear feature-space score becomes the curved boundary

$$
x_1^2+x_2^2-0.8=0.
$$

Play the lift, then change the viewing angle. The input points never move in their first two coordinates; what changes is the representation available to a linear decision rule. This illustrates feature construction, not a regression fit or a trained network.

<div data-es98e-animation="feature-lift" />

For a known period $2\pi$, $\phi(x)=(\cos x,\sin x)^T$ can express any phase-shifted sinusoid at that frequency. Noise-free cosine data recover $(1,0)^T$ if the sampled features have full column rank. Observations only at multiples of $\pi$ cannot identify the sine coefficient. A good function family is not enough: the experiment must distinguish its members.

Polynomial features $1,x,\ldots,x^{M-1}$ express local trends; the Taylor series for cosine explains their local approximation power. A longer domain needs higher degree, which can worsen conditioning and extrapolation. Gaussian radial basis functions,

$$
\phi_j(x)=\exp\!\left[-\frac{(x-c_j)^2}{2\ell^2}\right],
$$

give local control. Narrow widths allow rapid variation but can leave gaps between centres; broad widths can produce nearly dependent columns. Neither smoothness nor good conditioning follows from the name of a basis alone. Even continuously orthogonal Fourier or Chebyshev functions can yield a poorly conditioned sampled design if observations cluster or alias.

For squared error, differentiation gives

$$
\nabla_w\frac12\|\Phi w-y\|^2=\Phi^T(\Phi w-y),\qquad
\Phi^T\Phi\hat w=\Phi^Ty.
$$

The Hessian $\Phi^T\Phi$ is positive semidefinite: $v^T\Phi^T\Phi v=\|\Phi v\|^2$. Thus every local minimiser is global. The coefficients are unique exactly when $\Phi$ has full column rank. If not, all minimisers give the same fitted data but can disagree at new inputs. The pseudoinverse $\Phi^+y$ selects the minimum-norm minimiser.

The familiar inverse formula $(\Phi^T\Phi)^{-1}\Phi^Ty$ is therefore conditional, and is usually a poor computational recipe. QR solves $R\hat w=Q^Ty$ in the full-rank case; SVD handles rank deficiency. Forming normal equations squares the spectral condition number. Use a stable least-squares solver rather than explicitly computing an inverse.

<h2 id="probability">Why squared error, and why penalise weights?</h2>

Assume conditionally independent observations

$$
y_i=f_w(x_i)+\varepsilon_i,\qquad\varepsilon_i\sim\mathcal N(0,\sigma^2),\quad\sigma^2>0.
$$

The negative log likelihood is

$$
-\log p(y\mid X,w,\sigma^2)=\frac n2\log(2\pi\sigma^2)+\frac1{2\sigma^2}\|y-\Phi w\|^2.
$$

For fixed variance, maximum likelihood therefore minimises MSE. This justification depends on independent equal-variance Gaussian errors; unequal variances lead to weighted least squares and correlated Gaussian errors to a covariance-weighted quadratic form. A central-limit argument may motivate Gaussian errors, but does not establish these assumptions for a particular dataset.

When variance is also estimated, its interior likelihood optimum is the mean squared residual, $\hat\sigma^2=\|y-\Phi\hat w\|^2/n$. It is not the degrees-of-freedom-corrected unbiased estimate. If the residual is exactly zero, the unconstrained Gaussian likelihood grows without bound as variance tends to zero; there is no positive interior optimum.

A Gaussian prior $w\sim\mathcal N(0,\tau^2I)$ changes maximum likelihood to maximum a posteriori estimation (MAP). Multiplying the negative log posterior by $2\sigma^2$ produces

$$
\hat w_{\rm MAP}=\arg\min_w\{\|y-\Phi w\|^2+\lambda\|w\|^2\},\qquad
\lambda=\sigma^2/\tau^2.
$$

Consequently $(\Phi^T\Phi+\lambda I)\hat w=\Phi^Ty$, unique for $\lambda>0$. For an MSE objective instead of a sum, the corresponding penalty coefficient is $\sigma^2/(n\tau^2)$. The source's informal equivalence between a penalty coefficient and prior precision omits this scaling. Laplace priors similarly give $\ell_1$ penalties; the assumed weight scales matter in either case.

The penalty becomes tangible if the observations and basis stay fixed while only its strength changes. Watch the fitted curve and its coefficients together. Smoother-looking predictions need not always improve the reference error; regularisation is a modelling choice with a measurable trade-off.

<div data-es98e-animation="ridge-path" />

<h2 id="generalisation">Fitting observations is not predicting new ones</h2>

Imagine repeatedly collecting a training set $D$, fitting the same algorithm and predicting at one fixed input $x$. Write $\mu(x)=\mathbb E[Y\mid x]$, $\bar f(x)=\mathbb E_D[\hat f_D(x)]$, and let the new observation be independent of $D$. Expanding the squared error and cancelling centred cross terms gives

$$
\mathbb E_{D,Y}[(\hat f_D(x)-Y)^2]
=(\bar f(x)-\mu(x))^2
+\mathbb E_D[(\hat f_D(x)-\bar f(x))^2]
+\operatorname{Var}(Y\mid x).
$$

These are squared **bias**, estimator **variance**, and irreducible observation **noise**. The average estimator is not automatically the true regression function, even with large datasets. Bias concerns its systematic error; variance concerns its sensitivity to the random training set. The decomposition requires finite second moments, but does not require Gaussian noise.

<PredictReveal question="If we choose a model with zero training error, have we removed the irreducible noise in future observations?" choices={[{id: "yes", label: "Yes: exact fitting removes the error"}, {id: "no", label: "No: the new observation has its own noise"}]} answer="no" explanation={<p>Interpolation constrains predictions at the observed inputs. The conditional variance of an independent future observation remains, even if the conditional mean is known exactly. Fitting the observed noise can increase estimator variance.</p>} />

Underfitting means the representation or fit is too restrictive for the relevant pattern: training and validation errors are both poor. Overfitting means a fit exploits details that do not generalise, often giving low training error and appreciably worse validation error. Adding features can reduce approximation bias while increasing variance; stronger ridge regularisation often trades variance for bias.

Use held-out validation or cross-validation to choose features, widths and penalties. Fit standardisation and other preprocessing inside each training fold to avoid leakage. A validation set is used for selection, so a final untouched test set is needed for a less biased performance assessment. Collecting more representative data, simplifying the basis or adding regularisation can address overfitting; richer features can address underfitting. A validation curve need not be U-shaped. Interpolating models can exhibit double descent, and raw parameter count alone does not determine generalisation.

Ordinary RBF regression has no uncertainty distribution unless one is supplied. Its features decay away from their centres, so its fitted mean tends to zero, or to an explicitly included intercept; this is an extrapolation assumption, not a guarantee of graceful uncertainty growth. Polynomial predictions can grow rapidly outside the design interval. Both should be checked where the model will actually be used.

<h2 id="evidence">Integrating weights instead of choosing only one</h2>

The Gaussian model permits an exact Bayesian calculation. Set prior precision $\alpha=\tau^{-2}$ and noise precision $\beta=\sigma^{-2}$. Completing the square gives

$$
S=(\alpha I+\beta\Phi^T\Phi)^{-1},\qquad m=\beta S\Phi^Ty,
\qquad p(w\mid y)=\mathcal N(m,S).
$$

At a new input, the latent fitted function has mean $\phi_*^Tm$ and variance $\phi_*^TS\phi_*$. Predicting a noisy observation adds $\beta^{-1}$. This separates uncertainty about the function from future measurement noise.

Integrating the likelihood over the prior gives the **evidence**, $p(y\mid\alpha,\beta,\Phi)$. Its log is

$$
\frac M2\log\alpha+\frac n2\log\beta
-\frac\beta2\|y-\Phi m\|^2-\frac\alpha2m^Tm
-\frac12\log|S^{-1}|-\frac n2\log(2\pi).
$$

Evidence compares the probability mass a model assigns to the observations after averaging over weights. The terms act together: the $M\log\alpha/2$ term is a prior normalisation, not an independent reward for adding features. Evidence-based selection depends on the prior, parameterisation and candidate families; it does not automatically find a physically correct basis or replace external validation.

There is another way to read this integral. The prior induces covariance

$$
k(x,x')=\alpha^{-1}\phi(x)^T\phi(x')
$$

between function values. We have moved from uncertain coefficients to uncertain functions. [Gaussian processes](/notes/es98e/gaussian-processes) take this viewpoint directly, and make it useful when simulator evaluations are scarce.
