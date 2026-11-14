---
title: "8. Inference: sampling, approximation and the ELBO"
---

The [latent-variable model](/notes/es98e/latent-geometry#ppca) generates observations by sampling a hidden cause and then an observation. Inference runs in the other direction: which hidden causes remain plausible after observing the data? Bayes' rule says

$$
p(z\mid x)=\frac{h(z)}{p(x)},\qquad
h(z)=p(x\mid z)p(z),\qquad p(x)=\int h(z)\,dz.
$$

The numerator may be easy to evaluate even when its integral is not. Sampling and variational inference exploit this fact in different ways. We will compare them against an example with an exact answer, rather than infer accuracy from a plausible-looking density.

**In this chapter:** [MCMC](#sampling), [normal inference](#normal-model), [the ELBO](#elbo), [variational optimisation](#normal-vi), [VAEs](#vae).

<h2 id="sampling">Explore a distribution without its normalising constant</h2>

Metropolis–Hastings proposes $z'\sim T(\cdot\mid z)$ and accepts with probability

$$
a(z,z')=\min\!\left(1,\frac{h(z')T(z\mid z')}{h(z)T(z'\mid z)}\right).
$$

On rejection the chain stays at $z$; the repeated state must be retained. The normalising constant cancels. A symmetric Gaussian random-walk proposal removes the proposal-density ratio, giving the simpler Metropolis rule in the source. The full expression is needed for asymmetric proposals.

The accepted flow between a pair of states is proportional to

$$
\min\{h(z)T(z'\mid z),\ h(z')T(z\mid z')\},
$$

which is symmetric under exchange. This detailed-balance argument establishes invariance of the target distribution. Convergence additionally needs appropriate irreducibility, aperiodicity and recurrence conditions. A proposal that cannot cross between modes can satisfy a local acceptance rule and still fail to explore the full posterior.

For a stationary chain and a scalar observable $a(z)$, under conditions ensuring a finite integrated autocorrelation time,

$$
\operatorname{Var}\!\left(\frac1N\sum_ta(z_t)\right)
\approx\frac{\operatorname{Var}_p(a)}N\left(1+2\sum_{k\ge1}\rho_k\right),
\qquad
N_{\rm eff}=\frac N{1+2\sum_{k\ge1}\rho_k}.
$$

Effective sample size depends on the observable, and estimating it from a poorly mixing chain can be misleading. Warm-up can reduce initialisation effects and adapt proposals; discarding early states alone does not prove convergence. Use multiple dispersed chains, convergence diagnostics and Monte Carlo error estimates. Finite chains can be biased; “asymptotically exact” refers to valid limiting expectations under the required assumptions.

Random walks struggle along narrow, correlated or curved posteriors. Hamiltonian Monte Carlo chooses a positive-definite mass matrix $M$, augments $z$ with momentum $p\sim\mathcal N(0,M)$ and evolves

$$
\dot z=M^{-1}p,\qquad\dot p=-\nabla V(z),\qquad V(z)=-\log h(z).
$$

A reversible, volume-preserving numerical integrator and an acceptance correction account for integration error. Gradients guide long proposals; they need not be cheap if the likelihood contains an expensive simulator. NUTS adapts trajectory construction and commonly tunes step size during warm-up. It does not guarantee movement between separated modes. [Neal's HMC review](https://arxiv.org/abs/1206.1901) explains the construction. The source's banana-posterior ESS comparison (about three versus one thousand) remains an unverified lecture report, not a general performance ratio.

Sampling is flexible and can represent non-Gaussian or multimodal structure when it mixes. Its cost, correlation and diagnostics motivate an alternative: fit a tractable distribution directly.

<h2 id="normal-model">An exact posterior to keep us honest</h2>

Let $g$ be an unknown scalar, with independent measurements $x_i=g+\varepsilon_i$, $\varepsilon_i\sim\mathcal N(0,\sigma^2)$, and prior $g\sim\mathcal N(g_0,s_0^2)$. Assume both variances are known and strictly positive. Completing the square in the log joint gives

$$
v=\left(s_0^{-2}+n\sigma^{-2}\right)^{-1},\qquad
m=v\left(s_0^{-2}g_0+\sigma^{-2}\sum_ix_i\right),
\qquad g\mid x\sim\mathcal N(m,v).
$$

Independent information adds precision. The posterior mean is a precision-weighted compromise between prior mean and sample mean, not a simple average unless their precisions match. More observations reduce uncertainty under this fixed noise model; correlated measurements would contribute less independent information.

For an illustrative prior $\mathcal N(0,1)$ and one measurement $x=2$ with noise variance one, the posterior is $\mathcal N(1,1/2)$. Compare the prior, the likelihood's shape as a function of $g$, and the posterior.

<Figure id="es98e-normal-conditioning" title="Data and prior contribute precision" caption="Analytic normal example: prior mean 0 and variance 1; observation 2 with noise variance 1; posterior mean 1 and variance 1/2. The likelihood is displayed rescaled to integrate to one over g for comparison; it is not generally a probability density for g. Every curve uses the same horizontal and vertical scales.">
  <svg data-es98e-diagram="normal-inference" role="img" aria-label="Prior N(0,1), rescaled likelihood centred at 2, posterior N(1,1/2), plotted on the same scales." viewBox="0 0 400 340" fill="none" xmlns="http://www.w3.org/2000/svg"><g fontSize="16" fontFamily="inherit" fill="currentColor"><text x="16" y="22" fontWeight="600">Multiply densities, then normalise</text><line x1="53.000" y1="52.000" x2="53.000" y2="227.000" stroke="currentColor" strokeWidth="1.5"  /><line x1="53.000" y1="227.000" x2="368.000" y2="227.000" stroke="currentColor" strokeWidth="1.5"  /><text x="24" y="48" >density</text><text x="345" y="268" >g</text><text x="46" y="250" >-3</text><text x="350" y="250" >5</text><text x="12" y="232" >0</text><text x="12" y="62" >0.65</text><path d="M53.000 225.807 L54.750 225.638 L56.500 225.448 L58.250 225.236 L60.000 224.998 L61.750 224.733 L63.500 224.437 L65.250 224.109 L67.000 223.745 L68.750 223.343 L70.500 222.899 L72.250 222.410 L74.000 221.874 L75.750 221.285 L77.500 220.642 L79.250 219.940 L81.000 219.177 L82.750 218.347 L84.500 217.449 L86.250 216.479 L88.000 215.432 L89.750 214.307 L91.500 213.099 L93.250 211.807 L95.000 210.428 L96.750 208.958 L98.500 207.398 L100.250 205.744 L102.000 203.997 L103.750 202.154 L105.500 200.218 L107.250 198.187 L109.000 196.063 L110.750 193.849 L112.500 191.546 L114.250 189.158 L116.000 186.689 L117.750 184.143 L119.500 181.527 L121.250 178.846 L123.000 176.107 L124.750 173.319 L126.500 170.491 L128.250 167.630 L130.000 164.748 L131.750 161.854 L133.500 158.961 L135.250 156.079 L137.000 153.221 L138.750 150.399 L140.500 147.627 L142.250 144.916 L144.000 142.280 L145.750 139.733 L147.500 137.286 L149.250 134.952 L151.000 132.744 L152.750 130.674 L154.500 128.752 L156.250 126.990 L158.000 125.397 L159.750 123.982 L161.500 122.754 L163.250 121.719 L165.000 120.884 L166.750 120.253 L168.500 119.831 L170.250 119.619 L172.000 119.619 L173.750 119.831 L175.500 120.253 L177.250 120.884 L179.000 121.719 L180.750 122.754 L182.500 123.982 L184.250 125.397 L186.000 126.990 L187.750 128.752 L189.500 130.674 L191.250 132.744 L193.000 134.952 L194.750 137.286 L196.500 139.733 L198.250 142.280 L200.000 144.916 L201.750 147.627 L203.500 150.399 L205.250 153.221 L207.000 156.079 L208.750 158.961 L210.500 161.854 L212.250 164.748 L214.000 167.630 L215.750 170.491 L217.500 173.319 L219.250 176.107 L221.000 178.846 L222.750 181.527 L224.500 184.143 L226.250 186.689 L228.000 189.158 L229.750 191.546 L231.500 193.849 L233.250 196.063 L235.000 198.187 L236.750 200.218 L238.500 202.154 L240.250 203.997 L242.000 205.744 L243.750 207.398 L245.500 208.958 L247.250 210.428 L249.000 211.807 L250.750 213.099 L252.500 214.307 L254.250 215.432 L256.000 216.479 L257.750 217.449 L259.500 218.347 L261.250 219.177 L263.000 219.940 L264.750 220.642 L266.500 221.285 L268.250 221.874 L270.000 222.410 L271.750 222.899 L273.500 223.343 L275.250 223.745 L277.000 224.109 L278.750 224.437 L280.500 224.733 L282.250 224.998 L284.000 225.236 L285.750 225.448 L287.500 225.638 L289.250 225.807 L291.000 225.957 L292.750 226.090 L294.500 226.207 L296.250 226.311 L298.000 226.402 L299.750 226.483 L301.500 226.553 L303.250 226.615 L305.000 226.668 L306.750 226.715 L308.500 226.756 L310.250 226.791 L312.000 226.822 L313.750 226.848 L315.500 226.871 L317.250 226.890 L319.000 226.907 L320.750 226.921 L322.500 226.934 L324.250 226.944 L326.000 226.953 L327.750 226.961 L329.500 226.967 L331.250 226.972 L333.000 226.977 L334.750 226.981 L336.500 226.984 L338.250 226.987 L340.000 226.989 L341.750 226.991 L343.500 226.993 L345.250 226.994 L347.000 226.995 L348.750 226.996 L350.500 226.997 L352.250 226.997 L354.000 226.998 L355.750 226.998 L357.500 226.999 L359.250 226.999 L361.000 226.999 L362.750 226.999 L364.500 226.999 L366.250 227.000 L368.000 227.000" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 4" /><path d="M53.000 227.000 L54.750 227.000 L56.500 226.999 L58.250 226.999 L60.000 226.999 L61.750 226.999 L63.500 226.999 L65.250 226.998 L67.000 226.998 L68.750 226.997 L70.500 226.997 L72.250 226.996 L74.000 226.995 L75.750 226.994 L77.500 226.993 L79.250 226.991 L81.000 226.989 L82.750 226.987 L84.500 226.984 L86.250 226.981 L88.000 226.977 L89.750 226.972 L91.500 226.967 L93.250 226.961 L95.000 226.953 L96.750 226.944 L98.500 226.934 L100.250 226.921 L102.000 226.907 L103.750 226.890 L105.500 226.871 L107.250 226.848 L109.000 226.822 L110.750 226.791 L112.500 226.756 L114.250 226.715 L116.000 226.668 L117.750 226.615 L119.500 226.553 L121.250 226.483 L123.000 226.402 L124.750 226.311 L126.500 226.207 L128.250 226.090 L130.000 225.957 L131.750 225.807 L133.500 225.638 L135.250 225.448 L137.000 225.236 L138.750 224.998 L140.500 224.733 L142.250 224.437 L144.000 224.109 L145.750 223.745 L147.500 223.343 L149.250 222.899 L151.000 222.410 L152.750 221.874 L154.500 221.285 L156.250 220.642 L158.000 219.940 L159.750 219.177 L161.500 218.347 L163.250 217.449 L165.000 216.479 L166.750 215.432 L168.500 214.307 L170.250 213.099 L172.000 211.807 L173.750 210.428 L175.500 208.958 L177.250 207.398 L179.000 205.744 L180.750 203.997 L182.500 202.154 L184.250 200.218 L186.000 198.187 L187.750 196.063 L189.500 193.849 L191.250 191.546 L193.000 189.158 L194.750 186.689 L196.500 184.143 L198.250 181.527 L200.000 178.846 L201.750 176.107 L203.500 173.319 L205.250 170.491 L207.000 167.630 L208.750 164.748 L210.500 161.854 L212.250 158.961 L214.000 156.079 L215.750 153.221 L217.500 150.399 L219.250 147.627 L221.000 144.916 L222.750 142.280 L224.500 139.733 L226.250 137.286 L228.000 134.952 L229.750 132.744 L231.500 130.674 L233.250 128.752 L235.000 126.990 L236.750 125.397 L238.500 123.982 L240.250 122.754 L242.000 121.719 L243.750 120.884 L245.500 120.253 L247.250 119.831 L249.000 119.619 L250.750 119.619 L252.500 119.831 L254.250 120.253 L256.000 120.884 L257.750 121.719 L259.500 122.754 L261.250 123.982 L263.000 125.397 L264.750 126.990 L266.500 128.752 L268.250 130.674 L270.000 132.744 L271.750 134.952 L273.500 137.286 L275.250 139.733 L277.000 142.280 L278.750 144.916 L280.500 147.627 L282.250 150.399 L284.000 153.221 L285.750 156.079 L287.500 158.961 L289.250 161.854 L291.000 164.748 L292.750 167.630 L294.500 170.491 L296.250 173.319 L298.000 176.107 L299.750 178.846 L301.500 181.527 L303.250 184.143 L305.000 186.689 L306.750 189.158 L308.500 191.546 L310.250 193.849 L312.000 196.063 L313.750 198.187 L315.500 200.218 L317.250 202.154 L319.000 203.997 L320.750 205.744 L322.500 207.398 L324.250 208.958 L326.000 210.428 L327.750 211.807 L329.500 213.099 L331.250 214.307 L333.000 215.432 L334.750 216.479 L336.500 217.449 L338.250 218.347 L340.000 219.177 L341.750 219.940 L343.500 220.642 L345.250 221.285 L347.000 221.874 L348.750 222.410 L350.500 222.899 L352.250 223.343 L354.000 223.745 L355.750 224.109 L357.500 224.437 L359.250 224.733 L361.000 224.998 L362.750 225.236 L364.500 225.448 L366.250 225.638 L368.000 225.807" fill="none" stroke="var(--sci-secondary)" strokeWidth="2" strokeDasharray="2 4" /><path d="M53.000 227.000 L54.750 227.000 L56.500 227.000 L58.250 227.000 L60.000 227.000 L61.750 227.000 L63.500 227.000 L65.250 227.000 L67.000 227.000 L68.750 227.000 L70.500 227.000 L72.250 226.999 L74.000 226.999 L75.750 226.999 L77.500 226.998 L79.250 226.998 L81.000 226.997 L82.750 226.996 L84.500 226.995 L86.250 226.993 L88.000 226.990 L89.750 226.987 L91.500 226.984 L93.250 226.979 L95.000 226.972 L96.750 226.964 L98.500 226.953 L100.250 226.940 L102.000 226.923 L103.750 226.902 L105.500 226.876 L107.250 226.843 L109.000 226.802 L110.750 226.752 L112.500 226.690 L114.250 226.614 L116.000 226.521 L117.750 226.409 L119.500 226.272 L121.250 226.108 L123.000 225.911 L124.750 225.676 L126.500 225.397 L128.250 225.066 L130.000 224.676 L131.750 224.218 L133.500 223.683 L135.250 223.061 L137.000 222.341 L138.750 221.511 L140.500 220.559 L142.250 219.471 L144.000 218.234 L145.750 216.834 L147.500 215.258 L149.250 213.490 L151.000 211.517 L152.750 209.326 L154.500 206.905 L156.250 204.242 L158.000 201.327 L159.750 198.154 L161.500 194.716 L163.250 191.011 L165.000 187.039 L166.750 182.804 L168.500 178.312 L170.250 173.576 L172.000 168.609 L173.750 163.433 L175.500 158.071 L177.250 152.551 L179.000 146.906 L180.750 141.172 L182.500 135.391 L184.250 129.606 L186.000 123.865 L187.750 118.215 L189.500 112.708 L191.250 107.395 L193.000 102.330 L194.750 97.562 L196.500 93.141 L198.250 89.116 L200.000 85.529 L201.750 82.422 L203.500 79.828 L205.250 77.779 L207.000 76.298 L208.750 75.403 L210.500 75.103 L212.250 75.403 L214.000 76.298 L215.750 77.779 L217.500 79.828 L219.250 82.422 L221.000 85.529 L222.750 89.116 L224.500 93.141 L226.250 97.562 L228.000 102.330 L229.750 107.395 L231.500 112.708 L233.250 118.215 L235.000 123.865 L236.750 129.606 L238.500 135.391 L240.250 141.172 L242.000 146.906 L243.750 152.551 L245.500 158.071 L247.250 163.433 L249.000 168.609 L250.750 173.576 L252.500 178.312 L254.250 182.804 L256.000 187.039 L257.750 191.011 L259.500 194.716 L261.250 198.154 L263.000 201.327 L264.750 204.242 L266.500 206.905 L268.250 209.326 L270.000 211.517 L271.750 213.490 L273.500 215.258 L275.250 216.834 L277.000 218.234 L278.750 219.471 L280.500 220.559 L282.250 221.511 L284.000 222.341 L285.750 223.061 L287.500 223.683 L289.250 224.218 L291.000 224.676 L292.750 225.066 L294.500 225.397 L296.250 225.676 L298.000 225.911 L299.750 226.108 L301.500 226.272 L303.250 226.409 L305.000 226.521 L306.750 226.614 L308.500 226.690 L310.250 226.752 L312.000 226.802 L313.750 226.843 L315.500 226.876 L317.250 226.902 L319.000 226.923 L320.750 226.940 L322.500 226.953 L324.250 226.964 L326.000 226.972 L327.750 226.979 L329.500 226.984 L331.250 226.987 L333.000 226.990 L334.750 226.993 L336.500 226.995 L338.250 226.996 L340.000 226.997 L341.750 226.998 L343.500 226.998 L345.250 226.999 L347.000 226.999 L348.750 226.999 L350.500 227.000 L352.250 227.000 L354.000 227.000 L355.750 227.000 L357.500 227.000 L359.250 227.000 L361.000 227.000 L362.750 227.000 L364.500 227.000 L366.250 227.000 L368.000 227.000" fill="none" stroke="var(--sci-accent)" strokeWidth="2"  /><text x="48" y="290" >dashed: prior · dotted: likelihood</text><text x="48" y="317" >solid: posterior N(1, 1/2)</text></g></svg>
</Figure>

Rather than jumping directly from prior to posterior, increase the observation precision continuously. The posterior narrows and shifts according to the same precision-weighted algebra. At unit precision, the animation recovers the worked example above.

<div data-es98e-animation="normal-update" />

<h2 id="elbo">Replace an integral by a bound with a measurable gap</h2>

Choose a normalised variational density $q(z)$ with appropriate support and finite expectations. Define

$$
\mathcal L(q)=\mathbb E_q[\log p(x,z)-\log q(z)].
$$

Jensen's inequality applied to $\log\mathbb E_q[p(x,z)/q(z)]$ gives $\mathcal L(q)\le\log p(x)$ when $q$ covers the joint's relevant support. More generally the same lower bound follows from nonnegative KL divergence, when $q$ is absolutely continuous with respect to the posterior and the quantities are finite:

$$
\begin{aligned}
D_{\rm KL}(q\|p(z\mid x))
&=\mathbb E_q[\log q(z)-\log p(x,z)+\log p(x)]\\
&=\log p(x)-\mathcal L(q).
\end{aligned}
$$

This is the **evidence lower bound**, or ELBO. Equality holds precisely when $q$ equals the posterior almost everywhere. It can also be written

$$
\mathcal L(q)=\mathbb E_q[\log p(x\mid z)]-D_{\rm KL}(q\|p(z))
=\mathbb E_q[\log p(x,z)]+H[q].
$$

The first form balances expected reconstruction likelihood with divergence from the prior. The second displays variational entropy. Neither says that entropy always wins over concentration; a sharply concentrated true posterior may demand a narrow $q$.

For a **fixed generative model**, maximising the ELBO minimises the reverse KL to its posterior. If model parameters also change, raising the bound need not separately raise the exact evidence and reduce the gap on every step. The source's claim that both objectives necessarily improve simultaneously is incorrect.

Reverse KL weights errors where $q$ places mass. A unimodal Gaussian approximation may ignore another posterior mode, or underestimate spread. Increasing samples used to estimate the ELBO reduces Monte Carlo error; it does not remove error caused by an inadequate variational family. MCMC also has finite-run and exploration errors, so neither method's accuracy follows from its label alone.

<h2 id="normal-vi">Variational inference with an answer we can derive</h2>

For the normal model above, choose $q(g)=\mathcal N(a,b^2)$ with $b=e^\ell>0$. Its entropy is $\ell+\tfrac12\log(2\pi e)$. Gaussian expectations give an exact ELBO:

$$
\mathcal L(a,b)=C-\frac{(a-g_0)^2+b^2}{2s_0^2}
-\frac1{2\sigma^2}\sum_i[(x_i-a)^2+b^2]+\log b,
$$

where $C$ is independent of $a,b$. Differentiating yields

$$
\frac{\partial\mathcal L}{\partial a}
=-\frac{a-g_0}{s_0^2}+\frac{\sum_i(x_i-a)}{\sigma^2},\qquad
\frac{\partial\mathcal L}{\partial\ell}=1-b^2(s_0^{-2}+n\sigma^{-2}).
$$

The optimum is exactly $a=m$, $b^2=v$. There is no variational family error here because the true posterior belongs to the family. Optimisation tolerance or noisy gradients can still prevent reaching that optimum. The analytic gap for any candidate is

$$
\log p(x)-\mathcal L
=\frac12\left[\frac{b^2+(a-m)^2}{v}-1+\log\frac{v}{b^2}\right].
$$

This nonnegative quantity is a concrete implementation check: a wrong mean or variance gives a positive gap, and the exact posterior gives zero.

The analytic gap lets us watch variational optimisation without guessing whether a density looks close enough. Hold the model fixed and follow the approximation, the ELBO and their exact KL gap together. The evidence line stays still because the observation model is unchanged.

<div data-es98e-animation="variational-gap" />

When expectations are unavailable analytically, draw $\epsilon_s\sim\mathcal N(0,1)$ and write $g_s=a+e^\ell\epsilon_s$. Then

$$
\widehat{\mathcal L}=\frac1S\sum_s\log p(x,g_s)+\ell+\tfrac12\log(2\pi e)
$$

is a Monte Carlo ELBO estimate. The **reparameterisation trick** moves randomness to a distribution independent of $(a,\ell)$, so derivatives flow through the deterministic transformation. Interchanging derivative and expectation needs regularity and integrability. Gradient ascent, possibly with Adam, updates the variational parameters. In this conjugate example, analytic expectations are preferable; sampling is included to explain the method needed for nonlinear models.

<h2 id="vae">Inference becomes a learned map</h2>

A variational autoencoder uses a decoder $p_\theta(x\mid z)$ and an encoder $q_\varphi(z\mid x)$, often a diagonal Gaussian with learned mean and log variance. Its per-observation objective is

$$
\mathcal L(\theta,\varphi;x)
=\mathbb E_{q_\varphi(z\mid x)}[\log p_\theta(x\mid z)]
-D_{\rm KL}(q_\varphi(z\mid x)\|p(z)).
$$

For $q=\mathcal N(\mu,\operatorname{diag}(s_j^2))$ and standard-normal prior, the KL is $\tfrac12\sum_j(\mu_j^2+s_j^2-1-\log s_j^2)$. Reparameterised samples estimate the reconstruction term, and mini-batches train both networks. An encoder amortises inference across observations, potentially adding an amortisation gap beyond the chosen family's approximation error. [Kingma and Welling](https://arxiv.org/abs/1312.6114) introduce this stochastic training construction.

Generation uses the prior and decoder: sample $z\sim p(z)$, then $x\sim p_\theta(x\mid z)$. Encoding and reconstructing a training input is a different test. Evaluate held-out likelihood-related bounds, reconstruction, sample quality and latent use according to the application; they need not improve together. A flexible decoder may ignore $z$, with $q(z\mid x)\approx p(z)$: **posterior collapse**. This need not mean the decoder predicts only an unconditional mean; an expressive conditional likelihood can model a rich distribution without using the latent code.

Exact-posterior updates of $q$ recover the E-step viewpoint of EM; variational families relax it. ELBO optimisation is one method for nonlinear latent models, rather than the only possible training method. The course's progression is now visible: local approximations became fitted functions, fitted functions became probability models, and hidden representations required an explicit account of inference and approximation error.
