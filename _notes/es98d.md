---
layout: page
title: "ES98D: Particle-based Modelling (Statistical Physics)"
type: module
---

> Ludwig Boltzmann, who spent much of his life studying statistical mechanics, died in 1906, by his own hand. Paul Ehrenfest, carrying on the work, died similarly in 1933. Now it is our turn to study statistical mechanics.
>
> _David L. Goodstein_

A simulation begins with one microscopic state. Statistical physics asks how that state can teach us about an ensemble: which configurations matter, how to explore them, and how accurately a finite calculation predicts an observable. These notes develop that question from thermal equilibrium to free-energy reconstruction.

The course is arranged by mathematical dependency. Read the nine chapters in order for the continuous argument; their named sections also serve as references. Assumed background is multivariable calculus, Newtonian mechanics, elementary probability and linear algebra.

1. [Equilibrium is a probability measure](/notes/es98d/equilibrium): Heat-bath counting, Boltzmann weights, phase space and the NVE, NVT and NPT ensembles.
2. [Choosing the microscopic model](/notes/es98d/interaction-models): Pair potentials, charge response, many-body bonding, magnetism and long-range interactions.
3. [Trajectories, heat baths and numerical time](/notes/es98d/dynamics): Langevin dynamics, fluctuation–dissipation, overdamped motion, integrators, boundaries and initial conditions.
4. [Sampling without knowing the partition function](/notes/es98d/monte-carlo): Independent integration, importance sampling, Markov kernels, Metropolis–Hastings and concrete trial moves.
5. [What a finite simulation can tell us](/notes/es98d/uncertainty-observables): Ergodic averages, autocorrelation, error bars, heat capacity, structural distributions and transport.
6. [Critical fluctuations need collective moves](/notes/es98d/collective-updates): Ising domains, critical slowing, spin–bond representations, Swendsen–Wang and Wolff algorithms.
7. [Rejection, waiting times and persistent motion](/notes/es98d/event-chains): Residence weighting, kinetic events, lifting, event hazards and global balance.
8. [When particles represent a continuum](/notes/es98d/continuum-particles): SPH kernels, pressure forces, conservation and constitutive closure.
9. [Collective coordinates and free-energy differences](/notes/es98d/free-energy): Marginals, umbrellas, extended variables, metadynamics, perturbation and thermodynamic integration.

The original eighteen viva topics have been integrated into the exposition, including their practical simulation details. Mathematical corrections are identified where they affect the argument. In particular, inverse temperature is always $\beta=(k_BT)^{-1}$, repeated Metropolis states carry residence probability, and finite-run error estimates are distinguished from asymptotic convergence.

These are reconstructed educational notes. References to unavailable lecture slides or experimental examples are attributed accordingly; illustrative figures are analytic teaching models rather than experimental results.
