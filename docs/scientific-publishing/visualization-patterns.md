# Visualization patterns

Week 1 now implements these additional patterns, using native SVG without a plotting dependency:

- **Physical law ↔ graph:** a selected strain changes the material sketch and its point on a fixed stress–strain line. State rescaling and schematic exaggeration.
- **Model-family comparison:** preserve coefficient vectors and plot scales while changing fixed features. Dashed/dotted input curves add to a solid sum.
- **Conserved area:** draw squares with sides equal to coordinate magnitudes; compare sums under orthonormal basis changes. Negative coordinates still give positive areas.
- **Measure → reconstruct:** separate vector, scalar and output vector into panels. State tensor ordering and what information is lost.
- **Two spaces, one loss:** graph residuals become coordinates of a residual in observation space. Explicitly relabel axes; these are not the same line.
- **Adjoint routes:** compare measurement after a forward map with a transferred measurement on the original input. Equal scalar answers do not imply length preservation.
- **Directional quadratic forms:** matched angle plots distinguish positive, zero and negative directions. Explain why testing unit directions suffices.
- **Factor composition:** track labelled basis edges through successive maps, preserving scales and matrix multiplication order. Use the same matrix as the prose.

These are implementations for this chapter, not a requirement for every later chapter. Extend established representations only when the new mathematics calls for them.

| Concept               | Pattern                                    | Invariant / warning                                                          |
| --------------------- | ------------------------------------------ | ---------------------------------------------------------------------------- |
| Linear transformation | Basis vectors and transformed shape        | Keep axis scales explicit; distinguish domain/codomain                       |
| Eigenvectors          | Invariant directions                       | Only eigenvectors remain parallel; complex cases need separate treatment     |
| PCA                   | Projection axis and captured variance      | Center data; explain population/sample convention                            |
| Gradient descent      | Contours and trajectory                    | Use the stated update exactly; show divergence honestly                      |
| Gaussian processes    | Linked covariance and function samples     | Covariance must be PSD; state jitter and sampling seed                       |
| Bayesian inference    | Prior, likelihood and posterior            | Likelihood is not a posterior; normalise posterior                           |
| Inverse sensitivity   | Fixed noise circle mapped to error ellipse | Pilot: radius 0.1, diag(1,σ₂), fixed separate scales, singular zero excluded |
| Regularisation        | Noise/reconstruction tradeoff              | State regulariser, parameter and bias introduced                             |
| Monte Carlo           | Running estimates and uncertainty          | Reproducible samples; distinguish error from estimated uncertainty           |

Implemented patterns: Week 1's rotating ONB links coordinate changes, projection/residual and Parseval, then uses a calibration preset to connect the same geometry to least squares. Week 2's inverse sensitivity remains experimental. Extend Week 1's “measure then reconstruct” convention into Fourier coefficients, random series and SVD modes later in the module. The other entries are editorial candidates, not library APIs. Choose native SVG for simple geometry; add Mafs/D3/visx only when demonstrated needs justify them. Use 3D only when depth is necessary. Precompute expensive experiments in Python/JAX and retain code, seeds and data provenance.
