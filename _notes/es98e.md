---
layout: page
title: "ES98E: Scientific Machine Learning"
---

> With four parameters I can fit an elephant, and with five I can make him wiggle his trunk.
>
> _John von Neumann_

An expensive simulator, a small dataset and a known physical law offer different kinds of information. Scientific machine learning asks how to combine them: which parameters matter, which functions should be learnable, and what uncertainty remains after fitting?

These notes follow that question from local sensitivity and regression to learned representations and latent-variable inference.

The assumed background is multivariable calculus, matrix algebra (including eigenvectors and positive matrices), and basic probability densities, expectations and covariance. Gaussian conditioning and Bayesian regression are developed where needed. [ES98A Week 1](/notes/es98a/week1) provides a geometric introduction to the linear algebra.

## Sensitivity and probabilistic regression

1. [Sensitivity: which uncertainties matter?](/notes/es98e/sensitivity): derivatives, uncertainty propagation and sparse screening.
2. [Regression: choosing what a model can express](/notes/es98e/regression): basis functions, least squares, likelihoods, regularisation and generalisation.
3. [Gaussian processes: learning an expensive function](/notes/es98e/gaussian-processes): covariance, conditioning, kernel training and surrogate decisions.

## Neural models and inference

4. [Neural learning: representation, optimisation and generalisation](/notes/es98e/neural-learning): activations, SGD, residual networks and regularisation.
5. [Symmetry and graphs: learning without arbitrary labels](/notes/es98e/symmetry-graphs): group actions, structured architectures and message passing.
6. [Differential equations as models and constraints](/notes/es98e/differential-equations): trial solutions, PINNs, neural ODEs and error control.
7. [Latent geometry: from compression to generation](/notes/es98e/latent-geometry): PCA, probabilistic PCA and nonlinear generative maps.
8. [Inference: sampling, approximation and the ELBO](/notes/es98e/variational-inference): MCMC, exact normal inference, variational methods and VAEs.

Read sequentially for the cumulative argument; each chapter also has a local contents list and explicit result anchors. Figures use deterministic teaching examples, with assumptions and scales stated in their captions. Prediction prompts test conceptual distinctions rather than examination recall.

### Source and scope

Reconstructed from all 26 questions in the ES98E viva preparation notes, attributed there to the University of Warwick course taught by James Kermode and Tim Sullivan. Repeated ideas are developed once and extended later. Claims needing qualification are corrected in the exposition. Lecture-specific numerical outcomes are explicitly attributed reports: their notebooks and data were not supplied. Supplemental derivations and primary references support the new explanatory connections.
