---
layout: page
title: "ES98A: Fundamentals of Predictive Modelling"
type: module
---

> “A Bayesian is one who, vaguely expecting a horse, and catching a glimpse of a donkey, strongly believes he has seen a mule.”
>
> _Stephen Senn_

Two measurements can disagree with the same physical law. How should we fit a model, decide which features of the data it can recover, and express what remains uncertain? ES98A develops these questions from the geometry of least squares to probability distributions over unknown functions.

The ten weeks form a continuous argument: coordinates become function expansions, squared lengths become variances, and projection becomes conditioning. Read chronologically to follow those connections; each chapter also has named sections, worked derivations and animated explanations for reference. The starting background is basic vectors, algebra and calculus. Probability and function-space methods are introduced as they become necessary.

## Models, geometry and probability

1. [Week 1: From measurements to models](/notes/es98a/week1): physical laws and misfit, linear features, orthogonal coordinates, least-squares projection and positive matrices.
2. [Week 2: Singular directions and uncertain observations](/notes/es98a/week2): the SVD, pseudoinverses, normal equations, inverse sensitivity, probability spaces and Bayes' rule.
3. [Week 3: Gaussian geometry and conditioning](/notes/es98a/week3): Gaussian laws, covariance, linear transformations and the conditional mean and covariance updates.

## From sampling to random functions

4. [Week 4: Computing expectations](/notes/es98a/week4): Monte Carlo, laws of large numbers, sampling error, invariant Markov kernels and Metropolis–Hastings.
5. [Week 5: Infinite-dimensional coordinates](/notes/es98a/week5): MCMC convergence, Hilbert spaces, Fourier and Sobolev expansions, adjoints and compact operators.
6. [Week 6: Kernels and approximation geometry](/notes/es98a/week6): spectral summability, integral operators, reproducing kernels and orthogonal projection in function spaces.
7. [Week 7: Describing random functions](/notes/es98a/week7): covariance operators, random series, polynomial chaos, Gaussian processes and Karhunen–Loève expansions.

## Recovering unknowns and making predictions

8. [Week 8: Stable reconstruction from imperfect data](/notes/es98a/week8): ill-posedness, the Picard condition, Tikhonov regularisation, spectral filters and the bias–noise tradeoff.
9. [Week 9: From regularisation to Bayesian inference](/notes/es98a/week9): parameter choice, sparsity and total variation, Gaussian posteriors and Bayes' rule relative to a prior.
10. [Week 10: Posterior stability and prediction](/notes/es98a/week10): Hellinger distance, MAP estimation, Gaussian-process regression, interpolation and uncertainty in linear functionals.
