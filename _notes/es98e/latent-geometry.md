---
title: "7. Latent geometry: from compression to generation"
---

An unlabelled collection of sensor traces has no target column to predict. Yet some traces vary together, some are unusual, and the apparent dimension may greatly exceed the number of underlying modes. Learning can now mean finding coordinates, groups or a probability distribution rather than an input–output map.

In **supervised learning**, pairs $(x_i,y_i)$ constrain a conditional prediction, such as $p(y\mid x)$. In **unsupervised learning**, observations $x_i$ alone supply the structure to be learned. Clustering, dimensionality reduction, density modelling and anomaly detection are different tasks within this setting. Not every unsupervised method maximises a marginal likelihood: ordinary PCA and $k$-means have geometric objectives, although probabilistic relatives exist.

**In this chapter:** [PCA](#pca), [reconstruction](#reconstruction), [probabilistic PCA](#ppca), [nonlinear latent models](#nonlinear).

<h2 id="pca">Which direction loses the least information?</h2>

Let $x_1,\ldots,x_n\in\mathbb R^D$, $\bar x=n^{-1}\sum_i x_i$, and use the covariance convention

$$
S=\frac1n\sum_{i=1}^n(x_i-\bar x)(x_i-\bar x)^T.
$$

This is the empirical covariance with divisor $n$, not the unbiased population-covariance estimator with divisor $n-1$. For a unit vector $u$, the centred projected coordinates $u^T(x_i-\bar x)$ have empirical variance $u^TSu$. To retain as much variance as possible in one coordinate, maximise this quadratic form subject to $u^Tu=1$.

A Lagrange multiplier gives $Su=\lambda u$. The spectral theorem orders the eigenvalues $\lambda_1\ge\cdots\ge\lambda_D\ge0$, and the maximum is $\lambda_1$ at a leading eigenvector. Requiring later directions to be orthogonal gives the remaining eigenvectors. Their signs are arbitrary; equal eigenvalues allow rotations within a tied eigenspace. The resulting principal subspace is unique only when the retained and discarded eigenvalues are separated.

This construction makes a geometric claim: a direction with a wide spread of projected data is more useful for compression than one with little spread. It does not claim that high variance is scientifically important. Feature scaling changes $S$, and a large-variance nuisance can dominate a small but predictive signal.

Rotate the candidate axis before accepting the leading eigenvector. Every retained coordinate grows at the expense of a perpendicular residual. The variation curve below records exactly the same operation as the geometric projection, and makes the maximum at the principal direction visible.

<div data-es98e-animation="pca-rotation" />

<h2 id="reconstruction">Maximum variance is minimum squared reconstruction error</h2>

Collect the first $M<D$ orthonormal eigenvectors into $U_M$. A point is encoded and reconstructed by

$$
z_i=U_M^T(x_i-\bar x),\qquad
\tilde x_i=\bar x+U_Mz_i.
$$

The discarded residual is perpendicular to the retained subspace. Pythagoras gives

$$
\frac1n\sum_i\|x_i-\tilde x_i\|^2
=\operatorname{tr}(S)-\operatorname{tr}(U_M^TSU_M)
=\sum_{j>M}\lambda_j.
$$

Thus PCA minimises mean squared reconstruction error among rank-$M$ orthogonal projections. Total squared error is $n$ times this sum; the normalisation must not be lost. For a data matrix $X$ with **uncentred rows** $x_i^T$, the matrix formulas are

$$
X_c=X-\mathbf1\bar x^T,\qquad Z=X_cU_M,\qquad
\tilde X=ZU_M^T+\mathbf1\bar x^T.
$$

A thin SVD $X_c=V\operatorname{diag}(s_j)U^T$ computes the principal directions without forming $S$; $\lambda_j=s_j^2/n$. The mean and basis fitted on training data are reused on test data, rather than recomputed jointly with it.

Compare the retained and discarded directions for $S=\begin{pmatrix}2&1\\1&2\end{pmatrix}$. Keeping the diagonal direction retains variance three and discards variance one. The cloud is a deterministic teaching construction with exactly this empirical covariance, not a random sample from a Gaussian.

<Figure id="es98e-pca-projection" title="A coordinate and the information it discards" caption="Centred two-dimensional points, their projections onto u = (1,1)/√2, and perpendicular residuals. The retained empirical variance is 3; mean squared reconstruction error is 1. Dashed segments are discarded components. Both axes have equal units.">
  <svg data-es98e-diagram="pca" role="img" aria-label="PCA projection for empirical covariance [[2,1],[1,2]]. Retained variance 3 and mean squared residual 1; equal axes." viewBox="0 0 400 515" fill="none" xmlns="http://www.w3.org/2000/svg"><g fontSize="16" fontFamily="inherit" fill="currentColor"><text x="18" y="25" fontWeight="600">Keep the long axis, discard its normal</text><line x1="35.000" y1="235.000" x2="365.000" y2="235.000" stroke="currentColor" strokeWidth="1.5"  /><line x1="200.000" y1="400.000" x2="200.000" y2="70.000" stroke="currentColor" strokeWidth="1.5"  /><line x1="62.500" y1="372.500" x2="337.500" y2="97.500" stroke="var(--sci-accent)" strokeWidth="1.5"  /><line x1="295.263" y1="139.737" x2="295.263" y2="139.737" stroke="var(--sci-secondary)" strokeWidth="1.5" strokeDasharray="4 4" /><circle cx="295.263" cy="139.737" r="3.5" fill="currentColor" /><circle cx="295.263" cy="139.737" r="2.5" fill="var(--sci-accent)" /><line x1="310.000" y1="180.000" x2="282.500" y2="152.500" stroke="var(--sci-secondary)" strokeWidth="1.5" strokeDasharray="4 4" /><circle cx="310.000" cy="180.000" r="3.5" fill="currentColor" /><circle cx="282.500" cy="152.500" r="2.5" fill="var(--sci-accent)" /><line x1="295.263" y1="235.000" x2="247.631" y2="187.369" stroke="var(--sci-secondary)" strokeWidth="1.5" strokeDasharray="4 4" /><circle cx="295.263" cy="235.000" r="3.5" fill="currentColor" /><circle cx="247.631" cy="187.369" r="2.5" fill="var(--sci-accent)" /><line x1="255.000" y1="290.000" x2="200.000" y2="235.000" stroke="var(--sci-secondary)" strokeWidth="1.5" strokeDasharray="4 4" /><circle cx="255.000" cy="290.000" r="3.5" fill="currentColor" /><circle cx="200.000" cy="235.000" r="2.5" fill="var(--sci-accent)" /><line x1="200.000" y1="330.263" x2="152.369" y2="282.631" stroke="var(--sci-secondary)" strokeWidth="1.5" strokeDasharray="4 4" /><circle cx="200.000" cy="330.263" r="3.5" fill="currentColor" /><circle cx="152.369" cy="282.631" r="2.5" fill="var(--sci-accent)" /><line x1="145.000" y1="345.000" x2="117.500" y2="317.500" stroke="var(--sci-secondary)" strokeWidth="1.5" strokeDasharray="4 4" /><circle cx="145.000" cy="345.000" r="3.5" fill="currentColor" /><circle cx="117.500" cy="317.500" r="2.5" fill="var(--sci-accent)" /><line x1="104.737" y1="330.263" x2="104.737" y2="330.263" stroke="var(--sci-secondary)" strokeWidth="1.5" strokeDasharray="4 4" /><circle cx="104.737" cy="330.263" r="3.5" fill="currentColor" /><circle cx="104.737" cy="330.263" r="2.5" fill="var(--sci-accent)" /><line x1="90.000" y1="290.000" x2="117.500" y2="317.500" stroke="var(--sci-secondary)" strokeWidth="1.5" strokeDasharray="4 4" /><circle cx="90.000" cy="290.000" r="3.5" fill="currentColor" /><circle cx="117.500" cy="317.500" r="2.5" fill="var(--sci-accent)" /><line x1="104.737" y1="235.000" x2="152.369" y2="282.631" stroke="var(--sci-secondary)" strokeWidth="1.5" strokeDasharray="4 4" /><circle cx="104.737" cy="235.000" r="3.5" fill="currentColor" /><circle cx="152.369" cy="282.631" r="2.5" fill="var(--sci-accent)" /><line x1="145.000" y1="180.000" x2="200.000" y2="235.000" stroke="var(--sci-secondary)" strokeWidth="1.5" strokeDasharray="4 4" /><circle cx="145.000" cy="180.000" r="3.5" fill="currentColor" /><circle cx="200.000" cy="235.000" r="2.5" fill="var(--sci-accent)" /><line x1="200.000" y1="139.737" x2="247.631" y2="187.369" stroke="var(--sci-secondary)" strokeWidth="1.5" strokeDasharray="4 4" /><circle cx="200.000" cy="139.737" r="3.5" fill="currentColor" /><circle cx="247.631" cy="187.369" r="2.5" fill="var(--sci-accent)" /><line x1="255.000" y1="125.000" x2="282.500" y2="152.500" stroke="var(--sci-secondary)" strokeWidth="1.5" strokeDasharray="4 4" /><circle cx="255.000" cy="125.000" r="3.5" fill="currentColor" /><circle cx="282.500" cy="152.500" r="2.5" fill="var(--sci-accent)" /><text x="347" y="258" >x₁</text><text x="210" y="70" >x₂</text><text x="20" y="435" >retained variance = 3</text><text x="20" y="465" >mean squared residual = 1</text><text x="20" y="495" >Equal units on both axes</text></g></svg>
</Figure>

PCA supports visualisation, compressed storage, decorrelation and reconstruction-based anomaly scores. Compression must also store the mean and basis. Decorrelation is not independence except in special distributions such as a joint Gaussian. An unusual point may have small reconstruction error while lying far along the principal subspace; anomaly detection should consider both retained coordinates and discarded residuals. Linear projection cannot unfold a curved manifold. Kernel PCA changes the feature geometry, while nonlinear decoders learn an explicit generative map.

<h2 id="ppca">A subspace is not yet a distribution</h2>

Ordinary PCA says how to project an observed point, but not how frequently different points should occur. A **latent-variable model** supplies a generative mechanism:

$$
z\sim p(z),\qquad x\sim p_\theta(x\mid z),\qquad
p_\theta(x)=\int p_\theta(x\mid z)p(z)\,dz.
$$

Probabilistic PCA chooses

$$
z\sim\mathcal N(0,I_M),\qquad
x=\mu+Wz+\varepsilon,\qquad
\varepsilon\sim\mathcal N(0,\sigma^2I_D),
$$

with independent $z$ and $\varepsilon$. Its marginal is $\mathcal N(\mu,WW^T+\sigma^2I_D)$. Latent variation accounts for the dominant directions; isotropic noise fills the rest. For $\sigma^2>0$ the distribution has full-dimensional support, so the data do not literally lie on a plane.

Under the usual interior solution, maximum likelihood gives

$$
\hat\mu=\bar x,\qquad
\hat\sigma^2=\frac1{D-M}\sum_{j=M+1}^D\lambda_j,
\qquad
\hat W=U_M(\Lambda_M-\hat\sigma^2I)^{1/2}R,
$$

where $R$ is any orthogonal $M\times M$ matrix. Latent rotations are not identifiable. The covariance fits leading eigenvalues individually and replaces all discarded eigenvalues by their average; this explains the noise estimate. Boundary cases with zero noise can be singular and need separate treatment. These formulas and their likelihood interpretation come from [Tipping and Bishop's probabilistic PCA](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/bishop-ppca-jrss.pdf).

Conditioning is also analytic. With $B=W^TW+\sigma^2I$,

$$
p(z\mid x)=\mathcal N\!\left(B^{-1}W^T(x-\mu),\ \sigma^2B^{-1}\right).
$$

As noise tends to zero with $W$ full column rank, decoding the posterior mean approaches the orthogonal PCA reconstruction. The latent coordinates can remain scaled and rotated relative to ordinary PCA scores; the full probability model becomes singular in that limit. “Recovers PCA” refers to the principal subspace and reconstruction, not identical coordinates and a nonsingular density.

Generation now has an unambiguous recipe: independently draw $z^*\sim\mathcal N(0,I)$ and $\varepsilon^*\sim\mathcal N(0,\sigma^2I)$, then return $\mu+Wz^*+\varepsilon^*$. Omitting noise generates only the low-rank component. The source describes MNIST1D samples with thirty components; without its data we cannot assess their resemblance. A single Gaussian can reproduce covariance while still mixing distinct digit classes into implausible samples.

<h2 id="nonlinear">Bending the generative map</h2>

Replace $\mu+Wz$ by a network decoder $g_\theta(z)$:

$$
z\sim\mathcal N(0,I),\qquad
x\mid z\sim\mathcal N(g_\theta(z),\sigma^2I).
$$

The mean map can represent curved structure and sometimes use fewer latent dimensions for a given reconstruction error. But nonlinearity generally removes Gaussian conjugacy: the posterior and marginal integral are usually intractable. This is not true for every nonlinear model, and flexibility does not guarantee better generation, identifiable latent factors or the ability to represent arbitrary topology with a chosen continuous decoder.

Keep a collection of latent draws fixed while bending their decoder. The resulting motion separates three objects that can otherwise be conflated: the latent prior, the decoder mean and observation noise. Nonlinearity changes the map into data space; it need not change the prior at all.

<div data-es98e-animation="decoder-bend" />

For clustering, a Gaussian mixture instead uses a discrete latent class and a distribution within each class. $k$-means can be viewed through a limiting hard-assignment construction, but centres alone are not a normalised generative distribution. GANs, flows and diffusion models offer other generative formulations; they need not use the Gaussian decoder likelihood above or the same training objective.

A nonlinear decoder trained only with a reconstruction objective is not yet a variational autoencoder. We still need a distribution over latent codes, a way to infer them from observations, and an objective relating that inference to data probability. [The final chapter](/notes/es98e/variational-inference) builds those pieces and makes their approximation error explicit.
