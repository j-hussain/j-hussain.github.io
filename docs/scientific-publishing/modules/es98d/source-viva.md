---
layout: page
title: "ES98D: Particle-based Modelling (Statistical Physics)"
type: module
---

**Side note:** rather than a full collection of lecture notes, this page contains my preparation for the viva-voce examination questions. This is a large page, and I will optimise it to consist of subpages at a later date!

## Contents

1. **Part I: Stochastic Differential Equation for Overdamped Langevin Dynamics** — Describe how the SDE is developed from the Newton equation of motion. It will be useful to discuss why we need to modify the Newton equation, which physical observations and theorems we invoke, and why we need random variables. (p. 7)

2. **Boltzmann Probability Distribution** — Describe how we derive this from the concept of a system in contact with a heat bath. Describe also how it relates to the SDE for overdamped Langevin dynamics and what this means for making predictions about collections of particles at nonzero temperature. (p. 12)

3. **Markov-Chain Monte Carlo and Ergodicity** — Describe the conditions for an ergodic Markov chain and how the Metropolis algorithm satisfies these conditions. (p. 16)

4. **Monte Carlo Methods for Integral Estimation** — Describe how the foundational Monte Carlo methods estimate low-dimensional integrals without Markov chains. Discuss the strengths and weaknesses of these types of methods. Explain how Metropolis Monte Carlo addresses these weaknesses but loses a key strength. (p. 21)

5. **Computational Sampling of Probability Distributions** — Describe the concept of computationally sampling a probability distribution. Explain how Metropolis Monte Carlo provides this functionality in the context of a model presented in Part I. (p. 26)

6. **Uncertainty Quantification, Autocorrelation and Law of Large Numbers** — In the context of predicting expected behaviour with Markov-chain Monte Carlo, describe the relationship between uncertainty quantification, autocorrelation and the law of large numbers. (p. 29)

7. **Critical Slowing Down and Cluster Algorithms** — Describe how Metropolis Monte Carlo breaks down at the phase transition of the 2D Ising model. Describe the algorithms that were developed to circumvent this issue. (p. 32)

8. **Rejection in Monte Carlo** — Explain the concept of rejection in Metropolis Monte Carlo. Why does rejection reduce efficiency? Describe the rejection-free algorithms developed to address this issue. (p. 36)

9. **Event-Driven Monte Carlo** — Describe the concept of event-driven Monte Carlo and explain how it differs from traditional Metropolis Monte Carlo. (p. 39)

10. **Lifting in Markov Chains** — Explain the concept of lifting in Markov chains and how it can improve the efficiency of Monte Carlo sampling. (p. 42)

11. **Statistical Ensembles** — Describe two statistical ensembles (e.g. NVT, NVE or NPT) from the classical and statistical thermodynamics point of view and discuss computational methods that can be used to sample them. Choose at least two practical aspects of simulations, and discuss their role, benefits, computational or otherwise. For example: periodic boundary conditions, neighbour lists, cut-off radius, timestep etc. (p. 45)

12. **Smooth Particle Hydrodynamics vs Molecular Dynamics** — Compare Smooth Particle Hydrodynamics to molecular dynamics simulations of microscopic particles, such as atoms. How do continuum equations give rise to a particle based description? Describe similarities and differences between atomic and SPH simulations. How do particles interact in Smooth Particle Hydrodynamics? How are these interactions related to interparticle forces? How is the form of the model derived from equation of state of the studied material? (p. 49)

13. **Initial Conditions in Simulations** — What is the significance of initial conditions in simulations? Where do you put your particles? What velocities do you assign to them? What are the possible choices? How does that affect the outcome of the simulations? How initial conditions are related to ergodicity? (p. 52)

14. **Markov Chain Monte Carlo in Simulations** — Describe how Markov Chain Monte Carlo methods can be used in simulations – discuss one particular example, e.g. Ising models, simulations with interatomic potentials etc. What could be the trial moves and what are the corresponding acceptance probabilities? (p. 55)

15. **Interatomic Potentials and Magnetism** — Discuss the motivation to use interatomic potentials, and describe at least two types of models. These can include hard spheres, Lennard-Jones, electrostatic or polarisable models, embedded atom model etc. Describe how magnetism can be modelled in computer simulations. Give some background on magnetic interactions, and how these are modelled numerically. Discuss the considerations, e.g. nearest neighbours, crystalline arrangement. (p. 58)

16. **Long-Range Electrostatic and Gravitational Interactions** — What are the pitfalls of computing electrostatic or gravitational interactions? What are the implication on extended systems or those under periodic boundary conditions? Discuss some ideas that could help treating these interactions accurately? (p. 61)

17. **Computing Average Quantities from Simulations** — How can average quantities be calculated from simulations? Describe at least one quantity of interest from the following list: heat capacity, radial distribution function, heat conductivity. (p. 63)

18. **Collective Variables and Free Energy** — Define the concept of a collective variable and discuss how they are used in computer simulations. How does a collective coordinate describe the state of a system? How can dynamics be modified to drive the system into desired states? How is free energy (or free energy differences) calculated in simulations? You can discuss umbrella sampling, metadynamics, accelerated dynamics, free energy perturbation, thermodynamic integration etc. (p. 65)

---

## 1 Part I: Stochastic Differential Equation for Overdamped Langevin Dynamics

### 1.1 Newtonian Dynamics for a Particle

We begin with the classical Newton equation of motion describing a particle moving under the influence of a potential energy function.

$$m\ddot{x}(t) = -\nabla U(x(t))$$

where $x(t) \in \mathbb{R}^d$ is particle position at time $t$, $m > 0$ is particle mass, $U(x)$ is the potential energy function, $\nabla U(x)$ is the gradient of the potential (force) and $\ddot{x}(t)$ is particle acceleration.

This equation describes deterministic motion for a particle in a conservative force field.

**Physical Interpretation**

The Newton equation assumes the particle is evolving in an isolated system. In many physical situations, however, particles are immersed in an environment such as a solvent or heat bath. The effect of this environment must therefore be incorporated into the model.

### 1.2 Interaction with a Heat Bath

When a particle interacts with a surrounding medium two physical mechanisms arise.

**Assumptions**

- The surrounding medium exerts a viscous drag force opposing the particle's velocity.
- The particle experiences random collisions with molecules of the heat bath.
- The cumulative effect of these collisions can be modelled statistically.

#### 1.2.1 Dissipative Force

Viscous interactions with the surrounding medium produce a friction force proportional to velocity:

$$F_{\text{friction}} = -\gamma v(t)$$

where
- $v(t) = \dot{x}(t)$ is particle velocity
- $\gamma > 0$ is friction coefficient.

This force removes energy from the particle and transfers it to the environment.

#### 1.2.2 Random Thermal Forcing

The particle also experiences many microscopic collisions with surrounding molecules. Rather than modelling each collision individually, their cumulative effect is represented by a stochastic force $\eta(t)$ which models the random impulses exerted by the heat bath.

### 1.3 The Langevin Equation

Including both dissipative and stochastic forces modifies the Newton equation to

$$m\dot{v}(t) = -\nabla U(x(t)) - \gamma v(t) + \eta(t)$$

with

$$v(t) = \dot{x}(t)$$

**Physical Interpretation**

This equation is known as the Langevin equation. It represents Newton's second law with additional forces that model the interaction between the particle and a thermal environment.

### 1.4 Statistical Properties of the Stochastic Force

The stochastic forcing term is modelled as Gaussian white noise with the following properties.

#### 1.4.1 Zero Mean

$$\mathbb{E}[\eta(t)] = 0$$

meaning the thermal forcing has no systematic bias.

#### 1.4.2 Delta-Correlated Covariance

$$\mathbb{E}[\eta(t)\eta(t')] = 2\gamma k_B T \delta(t - t')$$

where
- $k_B$ is the Boltzmann constant
- $T$ is the temperature of the heat bath
- $\delta(\cdot)$ is the Dirac delta function.

**Physical Interpretation**

This relation is known as the fluctuation–dissipation theorem. It ensures that the energy injected into the system by thermal fluctuations balances the energy dissipated by friction, allowing the system to reach thermal equilibrium.

### 1.5 Stochastic Differential Equation Formulation

Since the dynamics include stochastic forcing, the particle position and velocity must be treated as random processes.

Introducing a Wiener process $W_t$, the Langevin dynamics can be written as the stochastic differential equations

$$m \, dV_t = -\nabla U(X_t) \, dt - \gamma V_t \, dt + \sigma \, dW_t$$

$$dX_t = V_t \, dt$$

where
- $X_t$ is the stochastic position process
- $V_t$ is the stochastic velocity process
- $W_t$ is a Wiener process (Brownian motion)
- $\sigma$ is the noise amplitude.

### 1.6 The Overdamped Limit

In many physical systems such as colloidal particles suspended in a fluid, viscous damping dominates inertial effects.

This corresponds to the regime

$$|m\dot{v}| \ll |\gamma v|$$

which allows the inertial term to be neglected.

**Physical Interpretation**

Physically this means the velocity relaxes extremely quickly compared with the evolution of particle positions. The velocity therefore does not need to be treated as an independent dynamical variable.

### 1.7 Overdamped Langevin SDE

Removing the inertial term eliminates the velocity variable and yields the overdamped Langevin equation

**Key Result**

$$dX_t = -\frac{1}{\gamma}\nabla U(X_t) \, dt + \sqrt{\frac{2\beta}{\gamma}} \, dW_t$$

where

$$\beta = \frac{1}{k_B T}$$

**Physical Interpretation**

The first term represents deterministic drift due to the potential energy landscape, while the second term describes stochastic diffusion caused by thermal fluctuations from the heat bath.

### 1.8 Variable Definitions

- $X_t$: particle position at time $t$
- $U(x)$: potential energy function
- $\gamma$: friction coefficient
- $W_t$: Wiener process representing Brownian motion
- $k_B$: Boltzmann constant
- $T$: temperature of the heat bath
- $\beta$: $(k_B T)^{-1}$ inverse temperature.

### Summary

The overdamped Langevin SDE arises by modifying Newtonian mechanics to account for interactions with a heat bath. Dissipative forces represent viscous drag, while stochastic forcing represents random microscopic collisions. In the overdamped regime, inertial effects can be neglected, producing a stochastic differential equation that describes the thermally driven motion of particles.

---

## 2 Boltzmann Probability Distribution

### 2.1 Concept of a System in Contact with a Heat Bath

To derive the Boltzmann distribution we consider a system of interest, denoted $A$, which is placed in contact with a second system $B$ acting as a heat bath. The defining assumptions of this physical setup are that the two systems are able to exchange energy, that they share a common temperature at thermal equilibrium, and that the combined system $A \cup B$ is isolated from the rest of the universe.

Let the energy of system $A$ be $E_A$, the energy of the heat bath be $E_B$, and the total energy of the combined isolated system be

$$E_{\text{tot}} = E_A + E_B$$

Since the combined system is isolated, the total energy $E_{\text{tot}}$ remains constant. When the system $A$ exchanges energy with the heat bath, any increase in $E_A$ must correspond to a decrease in $E_B$.

The key idea of statistical mechanics is that the probability of observing a particular state of system $A$ depends on how many states of the heat bath are compatible with it.

### 2.2 Probability of a System State

Let $\Omega_B(E_B)$ denote the number of accessible microstates of the heat bath with energy $E_B$. The probability that the system $A$ has energy $E_A$ is therefore proportional to the number of states of the bath with the remaining energy $E_B = E_{\text{tot}} - E_A$. Hence

$$P(E_A) \propto \Omega_B(E_{\text{tot}} - E_A)$$

To express this dependence in a more useful form, we introduce the entropy of the heat bath

$$S_B(E_B) = k_B \ln \Omega_B(E_B)$$

where $k_B$ is the Boltzmann constant. Rearranging gives

$$\Omega_B(E_B) = \exp\left(\frac{S_B(E_B)}{k_B}\right)$$

Substituting $E_B = E_{\text{tot}} - E_A$ gives

$$\Omega_B(E_{\text{tot}} - E_A) = \exp\left(\frac{S_B(E_{\text{tot}} - E_A)}{k_B}\right)$$

### 2.3 Expansion of the Bath Entropy

Because the heat bath is assumed to be much larger than the system $A$, the change in the bath energy due to energy exchange with $A$ is small relative to the total bath energy. This allows us to expand the bath entropy in a Taylor series about $E_{\text{tot}}$:

$$S_B(E_{\text{tot}} - E_A) \approx S_B(E_{\text{tot}}) - \left(\frac{\partial S_B}{\partial E_B}\right)_{E_{\text{tot}}} E_A$$

From thermodynamics we know that

$$\frac{\partial S}{\partial E} = \frac{1}{T}$$

where $T$ is the absolute temperature. Substituting this relation gives

$$S_B(E_{\text{tot}} - E_A) \approx S_B(E_{\text{tot}}) - \frac{E_A}{T}$$

Substituting this result back into the expression for $\Omega_B$ yields

$$\Omega_B(E_{\text{tot}} - E_A) \propto \exp\left(-\frac{E_A}{k_B T}\right)$$

Defining the inverse temperature

$$\beta = \frac{1}{k_B T}$$

we obtain

**Key Result**

$$P(E_A) \propto e^{-\beta E_A}$$

This is the Boltzmann weighting of energies in the canonical ensemble.

### 2.4 Boltzmann Distribution for a Classical Particle System

For a classical system consisting of $N$ particles, the energy of a microstate is given by the Hamiltonian

$$H(r^N, p^N) = \sum_{i=1}^N \frac{|p_i|^2}{2m_i} + U(r^N)$$

where $r_i$ is the position of particle $i$, $p_i$ is its momentum, $m_i$ is its mass, and $U(r^N)$ is the potential energy of the configuration.

The canonical probability density over phase space is therefore

$$P(r^N, p^N) \propto e^{-\beta H(r^N, p^N)}$$

Since the Hamiltonian separates into kinetic and potential contributions,

$$H(r^N, p^N) = K(p^N) + U(r^N)$$

the probability density factorises:

$$e^{-\beta H} = e^{-\beta K} e^{-\beta U}$$

If we are interested only in the particle positions, we integrate out the momenta

$$P(r^N) = \int P(r^N, p^N) \, dp^N$$

Because the kinetic term depends only on the momenta, the momentum integral contributes only a normalisation constant. The remaining dependence on the particle positions is therefore

**Key Result**

$$\pi(r^N) \propto e^{-\beta U(r^N)}$$

This expression is known as the Boltzmann distribution for the particle positions.

### 2.5 Connection to the Overdamped Langevin SDE

In Question 1 the particle dynamics were described by the overdamped Langevin stochastic differential equation

$$dX_t = -\frac{1}{\gamma}\nabla U(X_t) \, dt + \sqrt{\frac{2\beta}{\gamma}} \, dW_t$$

where $X_t$ is the particle position at time $t$, $\gamma$ is the friction coefficient, and $W_t$ is a Wiener process representing Brownian motion.

The probability density associated with this stochastic process evolves according to a Fokker–Planck equation. When the system reaches equilibrium, the time derivative of the probability density vanishes and the stationary solution of the Fokker–Planck equation is

$$\pi(x) \propto e^{-\beta U(x)}$$

Thus the stationary distribution of the overdamped Langevin SDE is precisely the Boltzmann distribution derived from the heat bath argument.

### 2.6 Implications for Predicting Behaviour at Nonzero Temperature

The Boltzmann distribution allows us to predict the macroscopic behaviour of particle systems at nonzero temperature. If $A(r^N)$ is a physical observable depending on the particle configuration, its equilibrium expectation value is

$$\langle A \rangle = \int A(r^N) \pi(r^N) \, dr^N$$

This means that thermodynamic properties of a particle system can be estimated by sampling particle configurations from the Boltzmann distribution and averaging the observable over those configurations. Methods such as overdamped Langevin dynamics and Monte Carlo simulation exploit this fact to generate representative samples from the equilibrium distribution.

---

## 3 Markov-Chain Monte Carlo and Ergodicity

### 3.1 Motivation: Sampling the Boltzmann Distribution

In the previous question we showed that a system of interacting particles in thermal equilibrium with a heat bath follows the Boltzmann distribution

$$\pi(x) \propto e^{-\beta U(x)}$$

where $U(x)$ is the potential energy of configuration $x$, $k_B$ is the Boltzmann constant, $T$ is the temperature, and $\beta = (k_B T)^{-1}$ is the inverse temperature.

For realistic particle systems the configurational space is extremely high-dimensional. For example, a system of $N$ particles in three spatial dimensions has a configuration space of dimension $3N$. Directly computing expectations of observables therefore requires evaluating integrals of the form

$$\langle A \rangle = \int A(x) \pi(x) \, dx$$

where $A(x)$ is an observable depending on the configuration $x$. In most practical systems these integrals cannot be computed analytically.

Markov-chain Monte Carlo (MCMC) methods address this problem by generating a sequence of configurations

$$x_0, x_1, x_2, \ldots$$

whose distribution converges to the target probability distribution $\pi(x)$. Once this has occurred, averages over the chain can be used to approximate ensemble averages.

### 3.2 Markov Chains

A Markov chain is a stochastic process in which the probability of the next state depends only on the current state. Formally, if $X_t$ denotes the configuration at step $t$, the Markov property states

$$P(X_{t+1} = y \mid X_t = x, X_{t-1}, \ldots) = P(X_{t+1} = y \mid X_t = x)$$

The dynamics of the chain are therefore completely specified by the transition probability

$$P(x \to y)$$

which gives the probability of moving from configuration $x$ to configuration $y$ in one step.

The goal of MCMC is to design a transition probability $P(x \to y)$ such that the Markov chain has a desired stationary distribution $\pi(x)$, in this case the Boltzmann distribution.

### 3.3 Stationary Distribution

A probability distribution $\pi(x)$ is said to be stationary for a Markov chain if

$$\pi(y) = \sum_x \pi(x) P(x \to y)$$

This condition means that if the chain is initially distributed according to $\pi(x)$, it will remain distributed according to $\pi(x)$ after each step of the Markov process.

Designing an MCMC algorithm therefore requires constructing transition probabilities $P(x \to y)$ such that the target distribution satisfies the stationarity condition.

### 3.4 Conditions for an Ergodic Markov Chain

For a Markov chain to correctly sample a probability distribution, two important properties must hold.

#### 3.4.1 Irreducibility

The chain must be able to reach any configuration from any other configuration in a finite number of steps. Formally, for any two states $x$ and $y$, there must exist some integer $n$ such that

$$P^{(n)}(x \to y) > 0$$

where $P^{(n)}$ denotes the $n$-step transition probability.

Irreducibility ensures that the chain is capable of exploring the entire configuration space rather than becoming trapped in a subset of states.

#### 3.4.2 Aperiodicity

The chain must not be forced to revisit states only at multiples of some fixed period. If the chain had a strict period, it would oscillate between subsets of states rather than converging smoothly to the stationary distribution.

Aperiodicity ensures that the Markov chain can revisit configurations at irregular intervals, which is necessary for convergence to equilibrium.

#### 3.4.3 Ergodicity

A Markov chain that is both irreducible and aperiodic is said to be ergodic. For an ergodic Markov chain, time averages over a sufficiently long trajectory converge to ensemble averages with respect to the stationary distribution. In other words, if the chain has stationary distribution $\pi(x)$, then

$$\frac{1}{N}\sum_{t=1}^N A(x_t) \to \mathbb{E}_\pi[A]$$

as $N \to \infty$, where $A(x)$ is an observable and $\mathbb{E}_\pi[A]$ denotes the expectation of $A$ under the distribution $\pi$.

### 3.5 Detailed Balance

A convenient way of ensuring that a target distribution $\pi(x)$ is stationary is to impose the detailed balance condition

$$\pi(x) P(x \to y) = \pi(y) P(y \to x)$$

This condition states that, in equilibrium, the probability flux from configuration $x$ to configuration $y$ is exactly balanced by the flux from $y$ to $x$.

Although detailed balance is not strictly required for stationarity, it greatly simplifies the design of Markov-chain Monte Carlo algorithms.

### 3.6 The Metropolis Algorithm

The Metropolis algorithm constructs transition probabilities that satisfy detailed balance with respect to the Boltzmann distribution.

The algorithm proceeds as follows.

Starting from the current configuration $x$, a trial configuration $y$ is generated according to a proposal distribution $q(x \to y)$. This proposal distribution is often chosen to be symmetric, meaning

$$q(x \to y) = q(y \to x)$$

The trial move is then accepted with probability

$$A(x \to y) = \min\left(1, \frac{\pi(y)}{\pi(x)}\right)$$

If the move is accepted the new configuration becomes $y$; otherwise the system remains in state $x$.

### 3.7 Derivation of the Metropolis Acceptance Probability

To show that the Metropolis algorithm satisfies detailed balance, we consider the full transition probability

$$P(x \to y) = q(x \to y) A(x \to y)$$

Using the acceptance rule

$$A(x \to y) = \min\left(1, \frac{\pi(y)}{\pi(x)}\right)$$

two cases arise.

If $\pi(y) \geq \pi(x)$, then $A(x \to y) = 1$ and $A(y \to x) = \frac{\pi(x)}{\pi(y)}$.

Substituting into the detailed balance condition gives

$$\pi(x) q(x \to y) = \pi(y) q(y \to x) \frac{\pi(x)}{\pi(y)}$$

which holds if the proposal distribution is symmetric.

If $\pi(y) < \pi(x)$, then

$$A(x \to y) = \frac{\pi(y)}{\pi(x)}$$

and

$$A(y \to x) = 1$$

Substituting into the detailed balance condition again yields equality.

Therefore the Metropolis acceptance rule ensures

$$\pi(x) P(x \to y) = \pi(y) P(y \to x)$$

which guarantees that the Boltzmann distribution is stationary for the Markov chain.

### 3.8 Application to the Boltzmann Distribution

For a system with Boltzmann distribution

$$\pi(x) \propto e^{-\beta U(x)}$$

the Metropolis acceptance probability becomes

$$A(x \to y) = \min\left(1, e^{-\beta[U(y) - U(x)]}\right)$$

where $U(x)$ and $U(y)$ are the potential energies of the current and trial configurations respectively.

This means that trial moves which decrease the potential energy are always accepted, while moves that increase the potential energy are accepted with a probability that decreases exponentially with the energy difference.

### 3.9 How the Metropolis Algorithm Achieves Ergodicity

The Metropolis algorithm satisfies the conditions for ergodicity provided the proposal moves allow the system to explore the full configuration space.

Irreducibility is ensured if the proposal distribution allows the system to eventually reach any configuration from any other configuration.

Aperiodicity is ensured because rejected moves leave the system in its current state, breaking any periodic cycling between states.

Because the chain is ergodic and satisfies detailed balance with respect to the Boltzmann distribution, long trajectories generated by the Metropolis algorithm produce samples distributed according to

$$\pi(x) \propto e^{-\beta U(x)}$$

Consequently, averages computed over the Markov chain converge to equilibrium ensemble averages of the system.

### 3.10 Interpretation for Particle Simulations

In particle simulations the configuration $x$ typically represents the set of particle coordinates $r^N$. A trial move may involve displacing a randomly chosen particle by a small random vector. The Metropolis acceptance rule then determines whether the new configuration is accepted based on the resulting change in potential energy.

Through repeated application of these trial moves, the Markov chain explores configuration space and generates configurations distributed according to the Boltzmann distribution, allowing thermodynamic observables to be estimated through sample averages.

---

## 4 Monte Carlo Methods for Integral Estimation

### 4.1 Monte Carlo Estimation of Integrals

Many problems in statistical physics require the evaluation of integrals that represent expectations of physical observables. Consider a function $f(x)$ defined on a domain $D$. The quantity of interest may be an integral of the form

$$I = \int_D f(x) \, dx$$

For high-dimensional systems these integrals are often extremely difficult to evaluate using deterministic numerical quadrature methods. Monte Carlo methods provide a probabilistic approach to estimating such integrals using random sampling.

Suppose we draw $N$ independent random samples

$$x_1, x_2, \ldots, x_N$$

from a probability distribution $p(x)$ defined on the same domain $D$. The integral can then be rewritten as

$$I = \int_D \frac{f(x)}{p(x)} p(x) \, dx$$

This expression shows that the integral can be interpreted as an expectation value with respect to the distribution $p(x)$:

$$I = \mathbb{E}_p\left[\frac{f(x)}{p(x)}\right]$$

where $\mathbb{E}_p[\cdot]$ denotes expectation under the probability density $p(x)$.

Using the law of large numbers, this expectation can be approximated by the sample mean

$$I \approx \frac{1}{N}\sum_{i=1}^N \frac{f(x_i)}{p(x_i)}$$

As the number of samples $N$ increases, the estimator converges to the true value of the integral.

### 4.2 Uniform Sampling

A simple case arises when the samples are drawn uniformly from the domain $D$. If the domain has volume $V$, then

$$p(x) = \frac{1}{V}$$

Substituting this into the Monte Carlo estimator gives

$$I \approx \frac{V}{N}\sum_{i=1}^N f(x_i)$$

where the points $x_i$ are drawn uniformly from $D$.

This is the most basic form of Monte Carlo integration.

### 4.3 Convergence and Variance

The accuracy of the Monte Carlo estimator is determined by its variance. For the estimator

$$\hat{I} = \frac{1}{N}\sum_{i=1}^N \frac{f(x_i)}{p(x_i)}$$

the variance is

$$\text{Var}(\hat{I}) = \frac{\sigma^2}{N}$$

where $\sigma^2$ is the variance of the quantity $f(x)/p(x)$ under the distribution $p(x)$.

This implies that the standard error of the estimator decreases as

$$\sqrt{\text{Var}(\hat{I})} \propto \frac{1}{\sqrt{N}}$$

An important property of Monte Carlo integration is that this convergence rate is independent of the dimensionality of the problem. This makes Monte Carlo methods particularly useful for problems in high-dimensional spaces.

### 4.4 Importance Sampling

The variance of the estimator depends strongly on the choice of the sampling distribution $p(x)$. If $p(x)$ is chosen such that it resembles the shape of the integrand $f(x)$, the variance can be significantly reduced. This technique is known as importance sampling.

In statistical mechanics many quantities can be written in the form

$$\langle A \rangle = \frac{\int A(x) e^{-\beta U(x)} \, dx}{\int e^{-\beta U(x)} \, dx}$$

where $A(x)$ is a physical observable, $U(x)$ is the potential energy of configuration $x$, and $\beta = (k_B T)^{-1}$ is the inverse temperature.

In this case it is natural to sample configurations from the Boltzmann distribution

$$\pi(x) \propto e^{-\beta U(x)}$$

If samples are drawn from this distribution, the expectation value simplifies to

$$\langle A \rangle \approx \frac{1}{N}\sum_{i=1}^N A(x_i)$$

Thus the problem of evaluating thermodynamic averages reduces to the problem of generating samples from the Boltzmann distribution.

### 4.5 Strengths of Direct Monte Carlo Sampling

Foundational Monte Carlo integration methods, where samples are drawn independently from a chosen distribution, possess several important advantages.

First, the samples are independent random variables. This independence simplifies the statistical analysis of the estimator, because the variance decreases as $1/N$ and the central limit theorem applies directly.

Second, the implementation of the estimator is straightforward. Once a method for sampling from the distribution $p(x)$ is available, the estimator can be computed simply by evaluating the function at the sampled points.

Third, Monte Carlo integration performs well in moderately high-dimensional spaces compared with deterministic quadrature methods.

### 4.6 Weaknesses of Direct Monte Carlo Sampling

Despite these advantages, direct Monte Carlo methods suffer from an important limitation. In many problems it is difficult or impossible to generate independent samples from the desired probability distribution.

For example, when sampling the Boltzmann distribution

$$\pi(x) \propto e^{-\beta U(x)}$$

the normalising constant

$$Z = \int e^{-\beta U(x)} \, dx$$

is typically unknown. Without knowing this constant, direct sampling from the distribution is not straightforward.

In addition, the configuration spaces encountered in particle systems are extremely high-dimensional. Designing an algorithm that draws independent samples from such distributions can be computationally prohibitive.

### 4.7 Metropolis Monte Carlo

Markov-chain Monte Carlo methods address this difficulty by constructing a Markov chain whose stationary distribution is the desired target distribution.

The Metropolis algorithm proceeds by generating a sequence of configurations

$$x_0, x_1, x_2, \ldots$$

where each configuration is obtained from the previous one using a stochastic proposal move.

Starting from a configuration $x$, a trial configuration $y$ is generated from a proposal distribution $q(x \to y)$. The move is accepted with probability

$$A(x \to y) = \min\left(1, e^{-\beta[U(y) - U(x)]}\right)$$

If the move is accepted the configuration becomes $y$; otherwise the system remains in state $x$.

This acceptance rule ensures that the resulting Markov chain satisfies detailed balance with respect to the Boltzmann distribution.

### 4.8 How Metropolis Monte Carlo Addresses the Weaknesses

The key advantage of the Metropolis algorithm is that it allows sampling from a probability distribution without requiring knowledge of the normalisation constant.

This works because the acceptance probability depends only on the ratio

$$\frac{\pi(y)}{\pi(x)} = e^{-\beta[U(y) - U(x)]}$$

in which the partition function cancels out.

As a result, Metropolis Monte Carlo makes it possible to generate samples from extremely complex distributions such as the Boltzmann distribution of interacting particle systems.

### 4.9 Loss of Independent Samples

Although Metropolis Monte Carlo solves the problem of sampling from complex distributions, it introduces a new issue: the generated samples are no longer independent.

Because the algorithm constructs a Markov chain, each configuration depends on the previous configuration. This introduces correlations between successive samples.

If $A(x_t)$ denotes an observable evaluated along the Markov chain, the estimator

$$\frac{1}{N}\sum_{t=1}^N A(x_t)$$

still converges to the expectation value, but the effective number of independent samples is reduced due to autocorrelation in the chain.

This means that the statistical error decreases more slowly than in the case of independent sampling. Consequently, longer simulations may be required to obtain accurate estimates of physical quantities.

---

## 5 Computational Sampling of Probability Distributions

### 5.1 Concept of Sampling a Probability Distribution

In many problems in statistical physics we are interested in computing expectations of observables with respect to a probability distribution. If $A(x)$ is an observable depending on a configuration $x$, and $\pi(x)$ is a probability density over the configuration space, the expectation value of the observable is

$$\langle A \rangle = \int A(x) \pi(x) \, dx$$

In realistic systems the configuration space is extremely large. For example, a system of $N$ particles in three spatial dimensions has a configuration vector

$$x = (r_1, r_2, \ldots, r_N)$$

where $r_i$ denotes the position of particle $i$. The configuration space therefore has dimension $3N$. For systems with large $N$, directly evaluating integrals such as the one above becomes computationally infeasible.

Computational sampling addresses this problem by generating configurations $x_1, x_2, \ldots, x_N$ that are distributed according to the target probability distribution $\pi(x)$. If such samples can be generated, the expectation value can be approximated by the sample average

$$\langle A \rangle \approx \frac{1}{N}\sum_{i=1}^N A(x_i)$$

This approach converts the problem of evaluating high-dimensional integrals into the problem of generating representative samples from a probability distribution.

### 5.2 Sampling in Statistical Mechanics

In statistical mechanics the probability distribution of interest is often the Boltzmann distribution

$$\pi(x) \propto e^{-\beta U(x)}$$

where $U(x)$ is the potential energy of configuration $x$, $k_B$ is the Boltzmann constant, $T$ is the temperature of the heat bath, and $\beta = (k_B T)^{-1}$ is the inverse temperature.

Using this distribution, the expectation value of an observable can be written as

$$\langle A \rangle = \frac{\int A(x) e^{-\beta U(x)} \, dx}{\int e^{-\beta U(x)} \, dx}$$

The denominator

$$Z = \int e^{-\beta U(x)} \, dx$$

is known as the partition function. In most realistic systems the partition function cannot be computed analytically, which makes direct sampling from the Boltzmann distribution difficult.

Monte Carlo methods provide a way of generating samples distributed according to $\pi(x)$ without requiring knowledge of the normalisation constant $Z$.

### 5.3 Metropolis Monte Carlo

The Metropolis algorithm constructs a Markov chain whose stationary distribution is the target distribution $\pi(x)$.

Starting from an initial configuration $x$, a trial configuration $y$ is generated using a proposal distribution $q(x \to y)$. In particle simulations this proposal might consist of displacing a randomly chosen particle by a small random vector.

The proposed move is then accepted with probability

$$A(x \to y) = \min\left(1, \frac{\pi(y)}{\pi(x)}\right)$$

If the move is accepted the configuration becomes $y$; otherwise the system remains in configuration $x$.

Because the target distribution is the Boltzmann distribution,

$$\pi(x) \propto e^{-\beta U(x)}$$

the acceptance probability becomes

$$A(x \to y) = \min\left(1, e^{-\beta[U(y) - U(x)]}\right)$$

where $U(x)$ and $U(y)$ are the potential energies of the current and trial configurations respectively.

### 5.4 Why the Partition Function Cancels

A key advantage of the Metropolis algorithm is that the partition function does not appear in the acceptance rule. If the Boltzmann distribution is written explicitly as

$$\pi(x) = \frac{e^{-\beta U(x)}}{Z}$$

then the ratio appearing in the acceptance probability is

$$\frac{\pi(y)}{\pi(x)} = \frac{e^{-\beta U(y)}/Z}{e^{-\beta U(x)}/Z} = e^{-\beta[U(y) - U(x)]}$$

The unknown normalisation constant $Z$ therefore cancels. This allows the algorithm to sample from the Boltzmann distribution without requiring knowledge of the partition function.

### 5.5 Sampling Through a Markov Chain

Repeated application of the Metropolis update rule generates a sequence of configurations

$$x_0, x_1, x_2, \ldots$$

that forms a Markov chain. If the chain satisfies the conditions of ergodicity and detailed balance, the stationary distribution of the chain is the Boltzmann distribution.

After an initial equilibration period, the configurations generated by the Markov chain can therefore be regarded as samples drawn from $\pi(x)$.

Once such samples are available, observables can be estimated by computing averages along the chain,

$$\langle A \rangle \approx \frac{1}{N}\sum_{t=1}^N A(x_t)$$

### 5.6 Application to Particle Models

In the particle models studied in Part I, the configuration $x$ represents the positions of all particles in the system. The potential energy $U(x)$ depends on the interactions between these particles, for example through pair potentials such as the Lennard–Jones potential.

A typical Metropolis Monte Carlo step in such a system proceeds as follows. A particle is selected at random, its position is perturbed slightly to generate a trial configuration, and the change in potential energy is computed. The move is then accepted or rejected according to the Metropolis acceptance rule.

Through repeated application of this procedure, the algorithm explores configuration space and generates configurations distributed according to the Boltzmann distribution.

### 5.7 Interpretation

Metropolis Monte Carlo therefore provides a computational mechanism for sampling from complex probability distributions. By constructing a Markov chain whose stationary distribution is the Boltzmann distribution, the algorithm allows equilibrium properties of interacting particle systems to be estimated through averages over sampled configurations.

---

## 6 Uncertainty Quantification, Autocorrelation and Law of Large Numbers

### 6.1 Predicting Observables with Markov-Chain Monte Carlo

In statistical mechanics many physical quantities are expressed as expectations with respect to a probability distribution. For example, if $A(x)$ is an observable depending on the particle configuration $x$, its equilibrium expectation value is

$$\langle A \rangle = \int A(x) \pi(x) \, dx$$

where $\pi(x)$ is the target probability distribution, such as the Boltzmann distribution $\pi(x) \propto e^{-\beta U(x)}$, where $U(x)$ is the potential energy of configuration $x$, $k_B$ is the Boltzmann constant, $T$ is the temperature, and $\beta = (k_B T)^{-1}$ is the inverse temperature.

Markov-chain Monte Carlo methods generate a sequence of configurations

$$x_1, x_2, x_3, \ldots$$

whose stationary distribution is $\pi(x)$. The expectation value of the observable can then be estimated using the sample mean

$$\hat{A}_N = \frac{1}{N}\sum_{t=1}^N A(x_t)$$

where $x_t$ is the configuration at step $t$.

### 6.2 Law of Large Numbers

The law of large numbers provides the theoretical justification for using sample averages to estimate expectations. For independent samples drawn from a probability distribution $\pi(x)$, the law of large numbers states that

$$\frac{1}{N}\sum_{t=1}^N A(x_t) \to \mathbb{E}_\pi[A]$$

as $N \to \infty$, where $\mathbb{E}_\pi[A]$ denotes the expectation value of $A(x)$ under the distribution $\pi(x)$.

For Markov chains the samples are not independent. However, if the chain is ergodic and has stationary distribution $\pi(x)$, a generalised version of the law of large numbers still applies. In this case the time average along the chain converges to the ensemble average

$$\lim_{N \to \infty} \frac{1}{N}\sum_{t=1}^N A(x_t) = \int A(x) \pi(x) \, dx$$

This result forms the theoretical foundation for predicting physical observables using Markov-chain Monte Carlo simulations.

### 6.3 Uncertainty Quantification

In practical simulations we run the Markov chain for a finite number of steps. As a result, the estimator

$$\hat{A}_N = \frac{1}{N}\sum_{t=1}^N A(x_t)$$

is a random variable whose value fluctuates around the true expectation $\langle A \rangle$.

Uncertainty quantification refers to the process of estimating the statistical error associated with this estimator. The variance of the estimator determines how accurately the observable can be estimated from a finite Markov chain.

If the samples were independent, the variance of the sample mean would be

$$\text{Var}(\hat{A}_N) = \frac{\sigma_A^2}{N}$$

where $\sigma_A^2 = \text{Var}_\pi(A)$ is the variance of the observable under the target distribution.

In Markov-chain Monte Carlo, however, the samples are correlated, which modifies this result.

### 6.4 Autocorrelation in Markov Chains

Because each configuration in a Markov chain is generated from the previous one, successive samples are not statistically independent. Instead, they exhibit autocorrelation.

The autocorrelation function of the observable $A$ along the chain is defined as

$$C(k) = \mathbb{E}[(A(x_t) - \langle A \rangle)(A(x_{t+k}) - \langle A \rangle)]$$

where $k$ is the lag between two samples and $\langle A \rangle$ is the expectation value of the observable.

It is often convenient to work with the normalised autocorrelation function

$$\rho(k) = \frac{C(k)}{C(0)}$$

If the Markov chain mixes efficiently, the autocorrelation function decays rapidly as $k$ increases. However, if the chain explores configuration space slowly, correlations between samples can persist over long time intervals.

### 6.5 Effect of Autocorrelation on Statistical Error

The presence of autocorrelation increases the variance of the estimator. For a Markov chain the variance of the sample mean becomes

$$\text{Var}(\hat{A}_N) = \frac{\sigma_A^2}{N}\left(1 + 2\sum_{k=1}^\infty \rho(k)\right)$$

The factor in parentheses accounts for correlations between successive samples.

It is common to define the integrated autocorrelation time

$$\tau_{\text{int}} = \frac{1}{2} + \sum_{k=1}^\infty \rho(k)$$

which measures how long correlations persist in the Markov chain.

Using this quantity, the variance of the estimator can be written as

$$\text{Var}(\hat{A}_N) = \frac{2\tau_{\text{int}} \sigma_A^2}{N}$$

This expression shows that autocorrelation effectively reduces the amount of independent information contained in the chain.

### 6.6 Effective Sample Size

Because of autocorrelation, a Markov chain of length $N$ does not provide $N$ independent samples. Instead, the number of effectively independent samples is approximately

$$N_{\text{eff}} = \frac{N}{2\tau_{\text{int}}}$$

If the integrated autocorrelation time is large, the effective sample size becomes much smaller than the total number of samples. This means that long simulations may be required to obtain accurate estimates of observables.

### 6.7 Relationship Between the Concepts

The relationship between the law of large numbers, autocorrelation and uncertainty quantification can therefore be summarised as follows.

The law of large numbers guarantees that the time average of an observable computed along an ergodic Markov chain converges to the true expectation value as the number of samples increases.

Uncertainty quantification describes how accurately this expectation value can be estimated from a finite sample of configurations.

Autocorrelation determines how quickly the statistical uncertainty decreases as the simulation length increases, because correlations between samples reduce the effective number of independent observations.

Understanding and controlling autocorrelation is therefore crucial for obtaining reliable predictions from Markov-chain Monte Carlo simulations.

---

## 7 Critical Slowing Down and Cluster Algorithms

### 7.1 The 2D Ising Model

The Ising model is one of the simplest models used to study phase transitions in statistical physics. The system consists of spins arranged on a lattice, where each spin can take one of two values

$$s_i \in \{-1, +1\}$$

where $s_i$ denotes the spin at lattice site $i$.

The energy of a configuration of spins is given by the Hamiltonian

$$H(s) = -J\sum_{\langle i,j \rangle} s_i s_j$$

where $J$ is the coupling constant determining the strength of the interaction between neighbouring spins, and the notation $\langle i, j \rangle$ indicates that the sum runs over pairs of neighbouring lattice sites.

The Boltzmann distribution for the model is

$$\pi(s) \propto e^{-\beta H(s)}$$

where $\beta = (k_B T)^{-1}$, $k_B$ is the Boltzmann constant, and $T$ is the temperature.

This probability distribution determines the equilibrium behaviour of the spin system.

### 7.2 Metropolis Monte Carlo for the Ising Model

A common method for sampling the Boltzmann distribution of the Ising model is the Metropolis algorithm.

Starting from a spin configuration, a trial move consists of selecting a lattice site $i$ at random and proposing to flip its spin

$$s_i \to -s_i$$

The resulting change in energy is computed as

$$\Delta E = H(s') - H(s)$$

where $s$ is the current configuration and $s'$ is the proposed configuration after the spin flip.

The proposed move is accepted with probability

$$A = \min(1, e^{-\beta\Delta E})$$

By repeatedly proposing and accepting or rejecting such spin flips, the Metropolis algorithm generates a Markov chain whose stationary distribution is the Boltzmann distribution.

### 7.3 Phase Transition in the 2D Ising Model

The two-dimensional Ising model exhibits a second-order phase transition at a critical temperature $T_c$.

At temperatures above $T_c$, thermal fluctuations dominate and the spins are largely disordered, resulting in zero average magnetisation.

At temperatures below $T_c$, the spins tend to align with one another, leading to the formation of large domains of spins with the same orientation and a nonzero magnetisation.

Near the critical temperature the system develops large correlated regions of aligned spins known as spin clusters.

The size of these clusters grows as the critical point is approached.

### 7.4 Critical Slowing Down

The presence of large correlated clusters leads to a phenomenon known as critical slowing down.

In the Metropolis algorithm each update changes only a single spin at a time. When large clusters of aligned spins exist, flipping a single spin inside a cluster is energetically unfavourable because it disrupts many favourable interactions with neighbouring spins.

As a result, most proposed moves are rejected.

Even when moves are accepted, they modify the configuration only locally, meaning that large-scale rearrangements of the spin configuration occur very slowly.

Consequently the Markov chain explores configuration space extremely slowly near the phase transition.

This leads to very long autocorrelation times in the simulation.

If $A_t$ denotes an observable measured at step $t$ of the Markov chain, the autocorrelation function

$$\rho(k) = \frac{\mathbb{E}[(A_t - \langle A \rangle)(A_{t+k} - \langle A \rangle)]}{\text{Var}(A)}$$

decays very slowly as a function of the lag $k$.

The integrated autocorrelation time therefore becomes very large, meaning that a very long simulation is required to obtain statistically independent samples.

This phenomenon is referred to as critical slowing down.

### 7.5 Cluster Algorithms

To overcome critical slowing down, alternative Monte Carlo algorithms were developed that update large groups of spins simultaneously rather than flipping spins individually.

These algorithms are known as cluster algorithms.

The key idea is to identify clusters of aligned spins and flip the entire cluster in a single Monte Carlo move.

Because large correlated regions are updated collectively, the algorithm is able to explore configuration space much more efficiently near the critical point.

### 7.6 Swendsen–Wang Algorithm

The Swendsen–Wang algorithm constructs clusters using the following procedure.

First, bonds are introduced between neighbouring spins that have the same orientation. For each pair of neighbouring spins $i$ and $j$ with $s_i = s_j$, a bond is added with probability

$$p = 1 - e^{-2\beta J}$$

These bonds partition the lattice into clusters of connected spins.

Once the clusters have been identified, each cluster is assigned a new spin orientation $+1$ or $-1$ with equal probability.

All spins in the cluster are then updated simultaneously.

Because clusters can contain many spins, this algorithm allows large correlated regions of the system to change orientation in a single update step.

### 7.7 Wolff Algorithm

The Wolff algorithm is a related cluster method that grows and flips a single cluster at each Monte Carlo step.

Starting from a randomly selected spin, neighbouring spins with the same orientation are added to the cluster with probability

$$p = 1 - e^{-2\beta J}$$

This process continues recursively until no additional spins are added to the cluster.

The entire cluster is then flipped.

Because clusters tend to be large near the critical point, flipping a single cluster can substantially change the configuration of the system.

### 7.8 Effect on Autocorrelation

Cluster algorithms dramatically reduce autocorrelation times near the phase transition.

Instead of modifying the configuration through small local updates, the system can undergo large collective rearrangements.

As a result, the Markov chain mixes much more rapidly and produces nearly independent samples even near the critical temperature.

This improvement allows accurate estimation of thermodynamic quantities in regimes where the Metropolis algorithm would require extremely long simulations.

### 7.9 Summary

The Metropolis algorithm becomes inefficient near the phase transition of the two-dimensional Ising model because the system develops large clusters of aligned spins. Local single-spin updates cannot efficiently modify these clusters, leading to critical slowing down and extremely long autocorrelation times.

Cluster algorithms such as the Swendsen–Wang and Wolff methods address this problem by updating entire clusters of spins simultaneously. These collective updates allow the Markov chain to explore configuration space much more efficiently and significantly reduce autocorrelation times near the critical point.

---

## 8 Rejection in Monte Carlo

### 8.1 Rejection in the Metropolis Algorithm

The Metropolis algorithm generates a Markov chain whose stationary distribution is a desired probability distribution, typically the Boltzmann distribution

$$\pi(x) \propto e^{-\beta U(x)}$$

where $U(x)$ is the potential energy of configuration $x$, $k_B$ is the Boltzmann constant, $T$ is the temperature of the heat bath, and $\beta = (k_B T)^{-1}$ is the inverse temperature.

Starting from a configuration $x$, the algorithm proposes a trial configuration $y$ drawn from a proposal distribution $q(x \to y)$. The move is then accepted with probability

$$A(x \to y) = \min\left(1, \frac{\pi(y)}{\pi(x)}\right)$$

For the Boltzmann distribution this becomes

$$A(x \to y) = \min(1, e^{-\beta[U(y) - U(x)]})$$

where $U(y) - U(x)$ is the change in potential energy associated with the proposed move.

If the move is accepted the configuration becomes $y$. If the move is rejected the system remains in configuration $x$.

A rejection therefore corresponds to a Monte Carlo step in which the proposed move is discarded and the configuration of the system does not change.

### 8.2 Why Rejection Occurs

Rejection arises because the Metropolis algorithm enforces detailed balance. The detailed balance condition

$$\pi(x) P(x \to y) = \pi(y) P(y \to x)$$

ensures that the Boltzmann distribution is stationary for the Markov chain.

When the proposed move increases the potential energy, so that $U(y) > U(x)$, the probability of accepting the move becomes

$$A(x \to y) = e^{-\beta[U(y) - U(x)]}$$

If the energy increase is large, this probability becomes very small. Consequently many proposed moves are rejected.

### 8.3 Why Rejection Reduces Efficiency

Rejections reduce the efficiency of the algorithm because computational effort is spent proposing moves that do not change the configuration of the system.

If a large fraction of proposed moves are rejected, the Markov chain spends many steps remaining in the same state. This slows the exploration of configuration space.

More precisely, rejection increases the autocorrelation time of the Markov chain. If $A(x_t)$ denotes an observable measured along the chain, the autocorrelation function

$$\rho(k) = \frac{\mathbb{E}[(A(x_t) - \langle A \rangle)(A(x_{t+k}) - \langle A \rangle)]}{\text{Var}(A)}$$

decays more slowly when the chain contains many rejected moves. This means that successive samples are strongly correlated, reducing the effective number of independent configurations obtained during the simulation.

The efficiency of the algorithm therefore decreases as the rejection rate increases.

### 8.4 Rejection-Free Monte Carlo

To overcome the inefficiency associated with rejected moves, rejection-free Monte Carlo algorithms were developed.

The central idea of these methods is to construct Markov chains in which every update changes the configuration of the system. Instead of proposing a move that may be rejected, the algorithm determines the next event that modifies the system and performs that update directly.

These algorithms therefore avoid wasted computational effort associated with rejected moves and can significantly improve sampling efficiency.

### 8.5 Event-Chain Monte Carlo

One important class of rejection-free algorithms is Event-Chain Monte Carlo (ECMC).

Event-Chain Monte Carlo is a continuous-time Monte Carlo algorithm designed for particle systems with pairwise interactions. Instead of proposing discrete random moves that may be rejected, ECMC moves particles continuously until an interaction event occurs.

Consider a system of particles interacting through a potential energy function

$$U(r^N)$$

where $r^N = (r_1, r_2, \ldots, r_N)$ denotes the positions of all particles.

In ECMC a particle is selected and moved in a specified direction. The particle continues to move until it encounters an event, such as a collision with another particle or reaching a distance at which the interaction potential changes.

At this event the motion is transferred to another particle, which then continues the chain of motion. This process generates a sequence of particle displacements known as an event chain.

Because the algorithm always advances the configuration of the system, no proposed moves are rejected.

### 8.6 Global Balance

Unlike the Metropolis algorithm, which enforces detailed balance, Event-Chain Monte Carlo typically satisfies a weaker condition known as global balance.

Global balance requires that the total probability flow into each configuration equals the total probability flow out of that configuration,

$$\sum_x \pi(x) P(x \to y) = \pi(y)$$

This condition is sufficient to ensure that the target distribution remains stationary.

By relaxing the requirement of detailed balance, rejection-free algorithms can construct more efficient transition dynamics that explore configuration space more rapidly.

### 8.7 Efficiency Improvements

Because rejection-free algorithms avoid wasted steps and reduce autocorrelation, they can achieve much faster exploration of configuration space than traditional Metropolis Monte Carlo.

This improvement is particularly significant in dense particle systems or systems with strong interactions, where the rejection rate of the Metropolis algorithm can become very high.

Event-Chain Monte Carlo has therefore become an important method for efficiently sampling equilibrium configurations of interacting particle systems.

### 8.8 Summary

In the Metropolis algorithm proposed moves may be rejected in order to enforce detailed balance. Rejected moves leave the system in the same configuration and therefore reduce the efficiency of the simulation by increasing autocorrelation times.

Rejection-free Monte Carlo algorithms eliminate this inefficiency by ensuring that every update changes the configuration of the system. Event-Chain Monte Carlo achieves this by moving particles continuously and transferring motion between particles through interaction events, while satisfying global balance and preserving the desired stationary distribution.

---

## 9 Event-Driven Monte Carlo

### 9.1 Motivation for Event-Driven Monte Carlo

Traditional Metropolis Monte Carlo generates a Markov chain by proposing discrete trial moves that are either accepted or rejected according to an acceptance rule. In particle simulations, a typical move might consist of displacing a particle by a small random vector.

Although this approach is conceptually simple, it suffers from inefficiencies. In particular, many proposed moves may be rejected, especially in dense systems or systems with strong interactions. Each rejected move leaves the configuration unchanged, which slows the exploration of configuration space and increases autocorrelation.

Event-driven Monte Carlo methods were developed to overcome these limitations by eliminating rejected moves and replacing discrete trial moves with continuous particle motion.

### 9.2 Basic Idea of Event-Driven Monte Carlo

Event-driven Monte Carlo is a rejection-free sampling method in which the configuration of the system evolves continuously until a well-defined event occurs.

Instead of proposing a random displacement of a particle, the algorithm selects a particle and moves it deterministically in a specified direction. The particle continues to move until it encounters an interaction event with another particle or a constraint imposed by the interaction potential.

At the moment an event occurs, the motion is transferred to another particle and the process continues. This sequence of displacements forms an event chain.

Because the configuration of the system always changes during the simulation, no proposed moves are rejected.

### 9.3 Continuous-Time Perspective

In traditional Monte Carlo algorithms the Markov chain evolves in discrete steps indexed by an integer $t = 0, 1, 2, \ldots$. In contrast, event-driven Monte Carlo can be interpreted as a continuous-time process.

Let $r^N = (r_1, r_2, \ldots, r_N)$ denote the positions of $N$ particles in the system. When particle $i$ is active, its position evolves continuously according to

$$r_i(t) = r_i(0) + vt$$

where $v$ is a fixed direction of motion chosen at the beginning of the event chain and $t$ is the displacement parameter.

The particle continues moving in this direction until an interaction event occurs with another particle $j$.

### 9.4 Determining Event Times

The time of the next event is determined by the interaction potential between particles. For example, consider particles interacting through a pair potential

$$U(r^N) = \sum_{i<j} u(|r_i - r_j|)$$

where $u(r)$ is the interaction potential between two particles separated by a distance $r$.

As particle $i$ moves in the direction $v$, the distance between particles $i$ and $j$ changes. The event occurs when the interaction between the particles reaches a specified condition determined by the Monte Carlo dynamics.

The displacement length required to reach this event defines the next update of the system.

### 9.5 Transfer of Motion

When an event occurs between particles $i$ and $j$, the motion of the system is transferred from particle $i$ to particle $j$. Particle $j$ then continues moving in the same direction.

This transfer of motion ensures that the system evolves continuously through configuration space without requiring rejected trial moves.

The sequence of displacements generated in this way forms an event chain that propagates through the system.

### 9.6 Stationary Distribution

Event-driven Monte Carlo algorithms are designed so that the stationary distribution of the resulting Markov process is the Boltzmann distribution

$$\pi(x) \propto e^{-\beta U(x)}$$

where $U(x)$ is the potential energy of configuration $x$, $k_B$ is the Boltzmann constant, $T$ is the temperature of the heat bath, and $\beta = (k_B T)^{-1}$ is the inverse temperature.

Unlike the Metropolis algorithm, which enforces detailed balance, event-driven Monte Carlo typically satisfies a weaker condition known as global balance. Global balance requires that the total probability flow into each configuration equals the probability flow out of that configuration.

This condition is sufficient to ensure that the Boltzmann distribution remains stationary.

### 9.7 Comparison with Metropolis Monte Carlo

The main differences between event-driven Monte Carlo and the traditional Metropolis algorithm arise from the way trial moves are constructed.

In the Metropolis algorithm, trial configurations are proposed randomly and may be rejected. The algorithm therefore performs a random walk through configuration space with discrete steps.

In event-driven Monte Carlo, particles move continuously in a fixed direction until interaction events occur. Because the algorithm is rejection-free, every step modifies the configuration of the system.

As a result, event-driven methods can explore configuration space much more efficiently, particularly in dense systems where the rejection rate of the Metropolis algorithm becomes large.

### 9.8 Efficiency Advantages

The continuous motion of particles allows event-driven algorithms to perform large collective updates that significantly change the configuration of the system.

This leads to shorter autocorrelation times and faster exploration of configuration space compared with traditional Monte Carlo methods.

Event-driven Monte Carlo is therefore particularly useful for systems with strong particle interactions, where the rejection rate of Metropolis Monte Carlo can severely limit sampling efficiency.

### 9.9 Summary

Event-driven Monte Carlo replaces the discrete trial moves of traditional Metropolis Monte Carlo with continuous particle motion. Instead of proposing random displacements that may be rejected, particles move deterministically until interaction events occur.

These events transfer motion between particles and generate a sequence of updates known as an event chain. Because every update changes the configuration of the system, the algorithm avoids rejection and can explore configuration space more efficiently while still sampling the Boltzmann distribution.

---

## 10 Lifting in Markov Chains

### 10.1 Reversible Markov Chains

Most traditional Markov-chain Monte Carlo algorithms are constructed to satisfy the detailed balance condition

$$\pi(x) P(x \to y) = \pi(y) P(y \to x)$$

where $P(x \to y)$ is the transition probability from configuration $x$ to configuration $y$, and $\pi(x)$ is the target probability distribution.

Detailed balance ensures that the probability flow between any pair of configurations is symmetric.

As a consequence, the stationary distribution of the Markov chain is $\pi(x)$.

However, enforcing detailed balance also makes the Markov chain reversible. A reversible Markov chain behaves like a random walk in configuration space, frequently undoing its own moves. This behaviour can slow the exploration of configuration space and increase the autocorrelation time of the simulation.

### 10.2 Global Balance

The requirement of detailed balance is stronger than necessary. To ensure that a distribution $\pi(x)$ is stationary, it is sufficient to satisfy the global balance condition

$$\sum_x \pi(x) P(x \to y) = \pi(y)$$

which states that the total probability flow into configuration $y$ equals the stationary probability of that configuration.

Algorithms that satisfy global balance but not detailed balance can generate non-reversible Markov chains. These chains may explore configuration space more efficiently because they are not constrained to move symmetrically between states.

### 10.3 Concept of Lifting

Lifting is a technique used to construct non-reversible Markov chains by enlarging the state space of the system.

Instead of considering only the configuration $x$, the lifted Markov chain introduces an additional variable that represents the direction or mode of motion. The state of the Markov chain therefore becomes

$$(x, \sigma)$$

where $x$ denotes the physical configuration of the system and $\sigma$ is an auxiliary variable describing the direction of the update process.

For example, in particle simulations $\sigma$ may represent the direction in which a particle is currently moving.

Transitions of the Markov chain now occur in the extended state space. The lifting variable introduces persistence in the dynamics, allowing the chain to continue moving in a preferred direction rather than repeatedly reversing its steps.

### 10.4 Breaking Reversibility

Because the lifted dynamics contain directional persistence, the transition probabilities no longer satisfy detailed balance in the original configuration space. Instead, probability flows circulate through the extended state space.

This circulation creates a non-reversible Markov process that still preserves the correct stationary distribution.

Although detailed balance is broken, the global balance condition remains satisfied. As a result, the target distribution $\pi(x)$ remains the stationary distribution of the Markov chain.

### 10.5 Connection to Event-Chain Monte Carlo

Event-Chain Monte Carlo provides an example of a lifted Markov chain.

In this algorithm the state of the system includes both the particle configuration $x$ and the identity of the currently active particle together with the direction of motion. The lifted state can therefore be written as

$$(x, i, v)$$

where $x$ denotes the particle configuration, $i$ identifies the active particle, and $v$ is the direction in which the particle is moving.

The active particle moves continuously in direction $v$ until an interaction event occurs. At that moment the motion is transferred to another particle, and the process continues.

Because the direction of motion persists throughout the event chain, the dynamics possess a strong directional bias that breaks reversibility.

### 10.6 Improved Sampling Efficiency

The introduction of directional persistence allows lifted Markov chains to explore configuration space more efficiently than reversible random-walk dynamics.

In reversible algorithms such as Metropolis Monte Carlo, the Markov chain often revisits previously explored configurations because moves are frequently reversed.

In lifted algorithms, the persistence of motion reduces this backtracking behaviour. The system therefore moves more rapidly through configuration space, reducing autocorrelation times and improving the efficiency of sampling.

### 10.7 Summary

Lifting is a technique for constructing non-reversible Markov chains by enlarging the state space to include auxiliary variables describing the direction of the dynamics.

This modification breaks detailed balance while preserving global balance and the correct stationary distribution.

By introducing directional persistence into the dynamics, lifted Markov chains such as those used in Event-Chain Monte Carlo can explore configuration space more efficiently than traditional reversible Monte Carlo algorithms.

---

## 11 Statistical Ensembles

### 11.1 Basic Statistical-Mechanical Picture

For a system of $N$ particles, the microscopic state is a point in phase space,

$$(r^N, p^N) = (r_1, p_1, \ldots, r_N, p_N)$$

where $r_i$ and $p_i$ are the position and momentum of particle $i$. The Hamiltonian is

$$H(r^N, p^N) = \sum_{i=1}^N \frac{|p_i|^2}{2m_i} + U(r^N)$$

where $m_i$ is the mass of particle $i$ and $U(r^N)$ is the potential energy. The lecture notes define ensemble averages as

$$\langle A \rangle = \int dr^N dp^N \, p(r^N, p^N) A(r^N, p^N)$$

while the corresponding time average along a trajectory is

$$\langle A \rangle_t = \lim_{t \to \infty} \frac{1}{t} \int_0^t A(t') \, dt'$$

The ergodic hypothesis states that these agree for sufficiently long trajectories.

### 11.2 Microcanonical Ensemble (N, V, E)

In the microcanonical ensemble the system is closed, so the number of particles $N$, the volume $V$, and the total energy $E$ are constant. The lecture slides describe this as the ensemble in which each allowed microstate on the constant-energy hypersurface has equal probability. The density of states is

$$\Omega(E, V, N) \propto \frac{1}{h^{3N} N!} \int dr^N dp^N \, \delta(E - H(r^N, p^N))$$

where $h$ is Planck's constant and the $1/N!$ factor accounts for indistinguishability. The entropy is then

$$S(E, V, N) = k_B \ln \Omega(E, V, N)$$

From the classical thermodynamics point of view, $(N, V, E)$ describes an isolated system. From the statistical point of view, the microstates compatible with the given total energy are equally weighted. Sampling this ensemble is naturally achieved by molecular dynamics, because Newton's equations

$$m_i a_i = F_i = -\nabla_i U(r^N)$$

conserve the Hamiltonian, up to numerical integration error. This is exactly why the lecture states that MD samples the microcanonical ensemble.

### 11.3 Canonical Ensemble (N, V, T)

In the canonical ensemble the system is in contact with a thermal bath, so $N$, $V$, and $T$ are constant, while the total energy fluctuates. The lecture slides give the Boltzmann weighting

$$p_i \propto e^{-\beta E_i}, \quad \beta = \frac{1}{k_B T}$$

for a state of energy $E_i$. The canonical partition function is

$$Q(N, V, T) = \frac{1}{h^{3N} N!} \int dr^N dp^N \, \exp\left(-\frac{H(r^N, p^N)}{k_B T}\right)$$

The ensemble average of an observable is then

$$\langle A \rangle_{NVT} = \frac{1}{Q(N, V, T)} \int dr^N dp^N \, \exp\left(-\frac{H(r^N, p^N)}{k_B T}\right) A(r^N, p^N)$$

From the classical thermodynamics point of view, $(N, V, T)$ is the appropriate ensemble for a system coupled to a heat bath. From the statistical point of view, all energy states are accessible, but higher-energy states are exponentially suppressed by the Boltzmann factor. The lecture also connects this ensemble to the Helmholtz free energy,

$$F = U - TS, \quad F = -k_B T \ln Q$$

There are two main computational sampling strategies stressed in the notes:

First, Monte Carlo sampling. In that case one typically works in configurational space and samples according to the Boltzmann factor. The lecture explicitly notes that Monte Carlo is an integration technique, stochastic, based on random numbers, and that it contains no dynamical information.

Second, molecular dynamics with thermostats. The slides state that ordinary MD samples $(N, V, E)$, so thermostats are needed to sample $(N, V, T)$. The Nosé–Hoover thermostat introduces a fictitious bath variable and is deterministic, but may fail to be ergodic for simple systems; Nosé–Hoover chains are introduced to address this. The Langevin thermostat adds a damping term and a random force component, is ergodic, and plugs easily into a velocity-Verlet integrator.

### 11.4 Isothermal-Isobaric Ensemble (N, p, T)

The lecture also includes the isothermal-isobaric ensemble. Here the system is connected to both a heat bath and a pressure bath, so $N$, $p$, and $T$ are fixed, while both energy and volume fluctuate. The lecture slides give the weighting

$$p_i \propto V_i^N \exp\left(-\frac{E_i + pV_i}{k_B T}\right)$$

where $E_i$ and $V_i$ are the energy and volume of state $i$. This is the natural ensemble when one wants to model experiments performed at controlled temperature and pressure. From the thermodynamic point of view it is associated with the Gibbs free energy,

$$G = U - TS + pV = H - TS$$

The slides mention two computational approaches. One is Monte Carlo with both particle moves and lattice or volume moves. The other is molecular dynamics with both a thermostat and a barostat, introducing a lattice variable together with fictitious mass, damping, and collision terms.

### 11.5 Practical Aspects of Simulations

A first key practical aspect is the timestep $\Delta t$. In MD, the equations of motion are second-order differential equations and must be integrated numerically. The lecture emphasises Verlet and velocity-Verlet integration. The timestep must be small enough to resolve the fastest motions in the system and to maintain acceptable energy conservation in NVE simulations. If $\Delta t$ is too large, the trajectory becomes inaccurate and can even become unstable; if $\Delta t$ is too small, the simulation becomes unnecessarily expensive.

A second key practical aspect is periodic boundary conditions. Although the slides do not derive them formally in the ensemble section, they are implicit throughout bulk simulations and become especially important in electrostatics and transport calculations. Their role is to reduce surface effects by embedding the simulation cell in periodic images of itself, thereby approximating bulk matter with a finite number of particles. The computational benefit is that one can model a small representative cell rather than an enormous isolated sample. The physical trade-off is that one must then handle long-ranged interactions carefully, because each particle also interacts with periodic images.

A third practical aspect is the cut-off radius. In atomistic simulations, short-ranged pair interactions are often truncated beyond a radius $r_c$ to reduce the computational cost of force evaluation. The benefit is obvious: without truncation, a naïve pairwise calculation scales quadratically in the number of particles. The downside is that a poor choice of $r_c$ can distort thermodynamic and structural properties, especially if the interaction is not truly negligible at the cutoff.

A fourth practical aspect is the neighbour list. Rather than checking all particle pairs at every timestep, one stores for each particle a list of nearby neighbours, updating this list only periodically. This greatly reduces the cost of force evaluation for short-ranged models, especially when combined with a cutoff. Computationally, neighbour lists are essential for large MD simulations because they reduce the repeated cost of pair searching.

### 11.6 Summary

The microcanonical ensemble $(N, V, E)$ describes an isolated system and is naturally sampled by standard molecular dynamics, since Newtonian dynamics conserves the Hamiltonian. The canonical ensemble $(N, V, T)$ describes a system in contact with a heat bath and can be sampled either by Monte Carlo methods using the Boltzmann factor or by molecular dynamics with thermostats. The isothermal-isobaric ensemble $(N, p, T)$ extends this to systems in contact with both heat and pressure baths and is sampled by Monte Carlo with particle and volume moves or by MD with thermostat and barostat variables. In practice, the reliability and efficiency of these simulations depend strongly on implementation choices such as the timestep, periodic boundary conditions, cut-off radius, and neighbour lists.

---

## 12 Smooth Particle Hydrodynamics vs Molecular Dynamics

### 12.1 General Idea

The lecture notes emphasise that particle-based modelling spans many physical scales: atomic systems such as molecules and solids, mesoscopic systems such as colloids and grains, and even macroscopic systems such as people and vehicles. They also explicitly state that continuum matter can be discretised into particles. Smooth Particle Hydrodynamics, or SPH, is exactly such a discretisation of a continuum medium into interacting particles, whereas molecular dynamics uses particles that are intended to represent real microscopic entities such as atoms.

### 12.2 Molecular Dynamics Versus SPH

In molecular dynamics the particles correspond to atoms or molecules, and the force on particle $i$ is computed from an interaction model, typically via

$$m_i a_i = F_i = -\nabla_i U(r^N)$$

where $U(r^N)$ is the interatomic potential energy. The interactions are therefore microscopic and are meant to approximate the true underlying quantum-mechanical energy surface after Born–Oppenheimer separation.

In SPH the particles do not represent individual atoms. Instead they represent finite fluid parcels carrying continuum information such as mass, density, pressure, and velocity. The interactions between SPH particles do not come from a microscopic interatomic potential. Instead they arise from a discretisation of the continuum equations of fluid mechanics, usually the continuity equation and the momentum equation.

So the similarity is that both are particle-based and both evolve positions and velocities by integrating equations of motion. The crucial difference is the physical meaning of the particles and of the forces: in MD the forces are microscopic, while in SPH they are numerical representations of continuum stress and pressure gradients.

### 12.3 From Continuum Fields to a Particle Description

Suppose $A(r)$ is a continuum field, such as density or pressure. In SPH one introduces a smoothing kernel $W(r - r', h)$, where $h$ is the smoothing length. The field is written formally as

$$A(r) = \int A(r') W(r - r', h) \, dr'$$

This is then approximated by replacing the integral with a sum over particles:

$$A(r_i) \approx \sum_j m_j \frac{A_j}{\rho_j} W(r_i - r_j, h)$$

where $m_j$ is the mass of particle $j$, $\rho_j$ is its density, and $A_j$ is the value of the field associated with that particle.

A particularly important case is the density itself. Setting $A = \rho$ gives the standard SPH density estimate

$$\rho_i = \sum_j m_j W(r_i - r_j, h)$$

So the continuum density field is replaced by a kernel-weighted sum over neighbouring particles.

### 12.4 SPH Interactions

The continuum momentum equation contains a pressure-gradient term. In SPH this becomes a pairwise interaction between nearby particles. A common symmetric form is

$$\frac{dv_i}{dt} = -\sum_j m_j \left(\frac{P_i}{\rho_i^2} + \frac{P_j}{\rho_j^2}\right) \nabla_i W(r_i - r_j, h)$$

where $P_i$ and $P_j$ are the particle pressures.

This equation has the form of a sum of pair interactions, so it looks superficially like an interparticle force law in MD. However, its origin is different. It is not derived from a microscopic pair potential $u(r)$. Instead it is the discretised pressure force from continuum mechanics. In the same way, viscosity terms in SPH arise from discretising the viscous stress tensor rather than from atomistic friction laws.

### 12.5 Relation to Interparticle Forces

The best way to phrase the distinction is the following. In MD, one starts from a microscopic model and derives the forces from a potential energy:

$$F_i = -\nabla_i U(r^N)$$

In SPH, one starts from continuum conservation laws and rewrites them in particle form. The resulting particle interactions act like forces and are integrated using Newtonian-style updates, but they are effective forces representing pressure gradients and viscous stresses. So SPH forces are numerically convenient particle analogues of continuum stresses.

### 12.6 Role of the Equation of State

To close the continuum model one needs an equation of state relating pressure to density, typically

$$P = P(\rho)$$

This is essential because the SPH force expression above depends on the pressure carried by each particle. A simple weakly compressible model might use

$$P = c_s^2 (\rho - \rho_0)$$

where $c_s$ is an effective sound speed and $\rho_0$ is a reference density. More generally, the equation of state is chosen to reflect the material being modelled. This is the sense in which the form of the SPH interaction model is derived from the equation of state of the studied material: once the continuum constitutive law is specified, the particle pressure and hence the particle interactions are determined.

### 12.7 Similarities and Differences Summarised

Both MD and SPH are particle-based and both update particle positions and velocities in time.

Both can use neighbour-based interactions and finite timesteps. Both can compute observables from particle trajectories.

However, they model different physics. MD resolves microscopic dynamics and uses interatomic or intermolecular potentials. SPH does not resolve molecules at all. Its particles represent fluid elements, its density comes from kernel averaging, and its interactions come from discretised continuum equations plus an equation of state.

### 12.8 Summary

Smooth Particle Hydrodynamics gives a particle-based description of a continuum by replacing field integrals with kernel-weighted sums over particles. The SPH particles therefore represent fluid parcels rather than atoms. Their interactions arise from discretised pressure and viscous terms, not from microscopic interatomic potentials. Molecular dynamics, by contrast, uses particles to represent actual microscopic constituents and computes forces from atomistic interaction models. The pressure law in SPH is obtained from the equation of state of the material, and this pressure then determines the effective particle interactions.

---

## 13 Initial Conditions in Simulations

### 13.1 Why Initial Conditions Matter

A particle simulation does not begin from an abstract ensemble; it begins from one specific microstate. That means one must specify at least particle positions, and in dynamical simulations also particle velocities or momenta. The lecture notes define a trajectory as a time series of phase-space points and emphasise that the simulated time average is taken along this trajectory.

Therefore the starting point matters, especially over finite simulation times.

In an ideal ergodic simulation, long-time averages become independent of the starting state. In practice, however, the initial condition strongly affects equilibration time, transient behaviour, and whether the system even reaches the physically relevant region of phase space within the available runtime.

### 13.2 Initial Positions

The simplest positional choices depend on the state of matter one wants to model.

For a crystalline solid, one usually starts from an ordered lattice consistent with the target crystal structure, for example fcc, bcc, diamond cubic, or hcp depending on the material. This is natural because the low-temperature equilibrium structure is already known.

For a liquid, a common strategy is to start from either an ordered lattice and then heat or melt it, or from a random configuration that respects excluded-volume constraints. The lecture example for liquid silicon explicitly describes heating a 64-atom diamond-cubic supercell from $T = 0$ K to $T = 5000$ K, then equilibrating at $T = 2000$ K before collecting structural data. That is a textbook example of initial conditions being chosen to reach a liquid state in a controlled way.

For gases or dilute systems, particles may be placed approximately uniformly at random.

In all cases, the initial positions must be physically admissible. For strongly repulsive models one must avoid severe overlaps, since these can create enormous forces and numerical instability.

### 13.3 Initial Velocities

If the simulation is molecular dynamics, one must also assign initial velocities. Several possibilities are common.

One can set all velocities initially to zero. This is simple and sometimes useful for controlled heating protocols, but it does not represent thermal equilibrium.

One can sample velocities from the Maxwell–Boltzmann distribution appropriate to the target temperature,

$$p(v_i) \propto \exp\left(-\frac{m_i |v_i|^2}{2k_B T}\right)$$

which is the natural equilibrium choice for the kinetic part of the canonical ensemble.

One can also assign velocities and then rescale them so that the total kinetic energy matches a desired temperature. In practice one often additionally subtracts the centre-of-mass velocity to ensure zero net momentum:

$$\sum_{i=1}^N m_i v_i = 0$$

These choices affect the early part of the trajectory. A poor velocity initialisation can create long transients, artificial centre-of-mass drift, or nonequilibrium artefacts.

### 13.4 How Initial Conditions Affect the Outcome

Initial conditions affect at least four things.

First, they affect equilibration time. If one starts far from equilibrium, the simulation must spend a long time relaxing before data can be trusted.

Second, they affect which metastable basin is reached. In systems with multiple minima, different starting structures may relax into different local minima rather than the global equilibrium state.

Third, they affect whether rare events are seen at all. If barriers are large, a simulation started in one basin may never leave it on accessible timescales.

Fourth, they affect reproducibility of finite-time measurements. Even if the exact equilibrium average is unique, two short simulations with different initial conditions can give noticeably different answers.

This is why the lecture notes repeatedly emphasise thermodynamic averages, trajectories, and the ergodic hypothesis: the key issue is whether the simulation has sampled enough relevant configurations for the time average to represent the ensemble average.

### 13.5 Initial Conditions and Ergodicity

The ergodic hypothesis in the lecture notes states that the ensemble average

$$\langle A \rangle = \int dr^N dp^N \, p(r^N, p^N) A(r^N, p^N)$$

equals the time average

$$\langle A \rangle_t = \lim_{t \to \infty} \frac{1}{t} \int_0^t A(t') \, dt'$$

This statement is only useful if the trajectory actually explores the relevant part of phase space.

Initial conditions matter because they determine where that exploration begins. If the dynamics are not ergodic, or if they are ergodic only on prohibitively long timescales, then the initial condition can bias the measured average for the entire simulation.

This is particularly important in thermostatting. The lecture notes explicitly warn that Nosé–Hoover dynamics is not always ergodic for simple systems such as the simple harmonic oscillator, and motivate Nosé–Hoover chains partly for this reason. So the relation between initial conditions and ergodicity is not merely philosophical: it determines whether a chosen simulation method can escape memory of its starting state.

### 13.6 Practical Perspective

In practice, one chooses initial positions and velocities to reduce equilibration time and avoid unphysical artefacts. Ordered lattice starts are natural for solids; melt-and-equilibrate protocols are natural for liquids; Maxwell–Boltzmann velocity assignment is natural when targeting a temperature. But one should always verify equilibration, because the correctness of averages depends not on the initial condition itself, but on whether the simulation has lost memory of it.

### 13.7 Summary

Initial conditions specify the first microstate of the simulation, namely particle positions and, in MD, velocities. They strongly influence equilibration, numerical stability, metastability, and finite-time observables. Positions may be placed on a lattice, randomly, or via a prepared structure; velocities may be set to zero, sampled from a Maxwell–Boltzmann distribution, or rescaled to match a target temperature. In an ergodic simulation the long-time averages should become independent of these choices, but in finite simulations and metastable systems the initial condition can remain very important.

---

## 14 Markov Chain Monte Carlo in Simulations

### 14.1 General Idea of MCMC

The lecture notes present Monte Carlo as an integration technique based on random numbers and explicitly stress that it works with configurational variables and does not provide dynamical information. The goal is to sample configurations with the correct probability, usually a Boltzmann weight,

$$\pi(r^N) \propto e^{-\beta U(r^N)}$$

or, more generally, a probability distribution over discrete or continuous configurations.

Markov Chain Monte Carlo constructs a Markov chain of configurations

$$x_0, x_1, x_2, \ldots$$

whose stationary distribution is the target distribution. If the chain is ergodic and satisfies the appropriate balance condition, then configuration averages over the chain estimate ensemble averages.

### 14.2 Metropolis Acceptance Rule

The standard Metropolis method proposes a trial move $x \to x'$ and accepts it with probability

$$P_{\text{acc}}(x \to x') = \min\left(1, \frac{\pi(x')}{\pi(x)}\right)$$

For a Boltzmann distribution,

$$\frac{\pi(x')}{\pi(x)} = e^{-\beta[U(x') - U(x)]}$$

so the acceptance rule becomes

$$P_{\text{acc}}(x \to x') = \min(1, e^{-\beta\Delta U}), \quad \Delta U = U(x') - U(x)$$

This means that energetically favourable moves are always accepted, while energetically unfavourable moves are accepted with a Boltzmann probability.

### 14.3 Example 1: Interatomic-Potential Simulations

For an atomistic system with configurational energy $U(r^N)$, the trial move is often a small displacement of one particle. If particle $i$ is chosen, one proposes

$$r'_i = r_i + \delta r$$

where $\delta r$ is a random displacement drawn from some symmetric proposal distribution. The rest of the coordinates are unchanged. One then computes the potential-energy change $\Delta U$ and accepts the move with

$$P_{\text{acc}} = \min(1, e^{-\beta\Delta U})$$

This is especially useful for canonical $(N, V, T)$ sampling when one does not need real dynamical trajectories. The lecture notes explicitly contrast Monte Carlo with MD by saying that Monte Carlo samples configurational space only, with no dynamical information.

If the ensemble is $(N, p, T)$, one can also include volume or lattice moves. The lecture notes state that in $(N, p, T)$ Monte Carlo one has particle and lattice moves. In that ensemble the weight is

$$\pi_i \propto V_i^N \exp\left(-\frac{E_i + pV_i}{k_B T}\right)$$

so a volume move must use the corresponding acceptance ratio including the $V^N$ Jacobian factor.

### 14.4 Example 2: Ising Model

For the Ising model the configuration is a set of spins

$$s_i \in \{-1, +1\}$$

with Hamiltonian

$$H(\{s_i\}) = -J\sum_{\langle i,j\rangle} s_i s_j$$

where $J$ is the nearest-neighbour coupling and $\langle i, j \rangle$ denotes neighbouring lattice sites.

A natural trial move is a single-spin flip:

$$s_i \to -s_i$$

The energy difference $\Delta E$ caused by the flip is computed, and the Metropolis acceptance probability is

$$P_{\text{acc}} = \min(1, e^{-\beta\Delta E})$$

Again, the move is always accepted if it lowers the energy and is only probabilistically accepted otherwise.

### 14.5 Choice of Trial Moves

The lecture question explicitly asks what the trial moves could be. The answer depends on the model.

For atomistic particle simulations, trial moves can be single-particle displacements, collective displacements, rotations of rigid molecules, particle insertions and deletions in open ensembles, and volume changes in pressure-controlled ensembles.

For lattice spin systems, trial moves can be single-spin flips, cluster flips, or exchanges of occupation variables.

The proposal must be chosen so that the chain is ergodic and so that the acceptance rate is not too low. If the displacement is too small, the chain diffuses very slowly through configuration space; if it is too large, most moves are rejected.

### 14.6 What MCMC Is Used For

MCMC is used to estimate ensemble averages of observables,

$$\langle A \rangle \approx \frac{1}{N_{\text{sample}}} \sum_{n=1}^{N_{\text{sample}}} A(x_n)$$

where the $x_n$ are sampled configurations after equilibration. This is exactly in line with the lecture notes, which write averages as

$$\langle A \rangle = \frac{1}{N_{\text{sample}}} \sum_{i=1}^{N_{\text{sample}}} A_i$$

for sampled data.

### 14.7 Summary

Markov Chain Monte Carlo methods generate a sequence of configurations whose stationary distribution is the target ensemble distribution, usually the Boltzmann distribution. In the Metropolis scheme, one proposes a trial move and accepts it with

$$P_{\text{acc}} = \min\left(1, \frac{\pi(x')}{\pi(x)}\right)$$

which reduces to

$$P_{\text{acc}} = \min(1, e^{-\beta\Delta U})$$

or

$$P_{\text{acc}} = \min(1, e^{-\beta\Delta E})$$

for interatomic-potential models and Ising models respectively. Typical trial moves are particle displacements in atomistic simulations and spin flips in lattice models, with additional volume or lattice moves in pressure-controlled ensembles.

---

## 15 Interatomic Potentials and Magnetism

### 15.1 Why Interatomic Potentials Are Used

The lecture starts from the Schrödinger equation and the Born–Oppenheimer approximation, where the nuclei move on an electronic potential-energy surface $E(R)$. It then emphasises that this exact energy is formally an $N$-body quantity and is too expensive to evaluate directly for large-scale simulations. The motivation for interatomic potentials is therefore computational tractability: one wants a simpler model that approximates the true energy landscape while still reproducing the important structural, thermodynamic, and dynamical properties of the material.

The notes also stress quantum-mechanical near-sightedness: many local electronic properties are mostly determined by the nearby environment, although electrostatics and dispersion introduce nonlocality. That is precisely the modelling philosophy behind force fields and interatomic potentials.

### 15.2 Hard-Sphere Model

The lecture presents hard spheres as the simplest interatomic potential,

$$V(r) = \begin{cases} \infty & r < r_A + r_B \\ 0 & r \geq r_A + r_B \end{cases}$$

where $r_A$ and $r_B$ are the particle radii. This model captures excluded volume and therefore Pauli-like steric repulsion in a very crude way. It was one of the first simulation models and is useful for studying packing, steric structure, and fluid–solid transitions. Its great strength is simplicity; its weakness is that it contains no attraction and no energetic structure beyond overlap avoidance.

### 15.3 Dispersion Models: Lennard–Jones and Buckingham

The lecture then discusses London dispersion and gives the asymptotic attraction

$$V(r) \propto -\frac{1}{r^6}$$

A standard pair model that combines short-range repulsion with this attraction is the Lennard–Jones potential,

$$V(r) = 4\varepsilon\left[\left(\frac{\sigma}{r}\right)^{12} - \left(\frac{\sigma}{r}\right)^6\right]$$

where $\varepsilon$ sets the well depth and $\sigma$ sets the characteristic length scale. The repulsive $r^{-12}$ term is not fundamental but convenient; it mimics short-range Pauli repulsion. The attractive $r^{-6}$ term models dispersion.

The Buckingham potential is an alternative,

$$V(r) = Ae^{-Br} - \frac{C}{r^6}$$

with an exponential repulsion that is often more realistic than the $r^{-12}$ form. Both are pair potentials and therefore relatively cheap to evaluate.

### 15.4 Electrostatic and Polarisable Models

The force-field lecture separates electrostatics into a static term and a polarisation term,

$$E_{\text{elec}} = E_{\text{static}} + E_{\text{pol}}$$

The static contribution is built from fixed local quantities such as charges, dipoles, and higher multipoles. In its simplest form one has charge–charge interactions scaling as $q_i q_j / r_{ij}$.

The lecture also discusses charge fitting, charge equilibration, and explicit polarisability. In a charge-equilibration model one minimises

$$E_{\text{elec}}(q) = \sum_i \left[\chi_i q_i + \frac{1}{2} J_i q_i^2\right] + \frac{1}{2}\sum_{i \neq j} \frac{q_i q_j}{r_{ij}}$$

where $\chi_i$ is an electronegativity-like parameter and $J_i$ is a hardness-like parameter. This allows charges to respond to the environment.

For explicit polarisability, the lecture gives the idea of induced dipoles and shell models. In one form,

$$p_i = \alpha E(r_i; \{r_j\}_{j \neq i}, \{p_j\}_{j \neq i}) + p_i^0$$

so the dipole on site $i$ depends self-consistently on the electric field from the rest of the system.

These models are more accurate than fixed-charge models but computationally more expensive because one must solve a coupled linear or self-consistent problem.

### 15.5 Many-Body Metallic and Directional Models

For metals, the lecture notes mention that Lennard–Jones is too limited, giving only fcc or hcp structures, and introduce many-body models such as the Embedded Atom Model,

$$E = \sum_{ij} \Phi_{\text{pair}}(r_{ij}) + \sum_i U(n_i), \quad n_i = \sum_j \rho(r_{ij})$$

The interpretation is that atom $i$ is embedded in an effective local electron density $n_i$, so the energy is not purely pairwise.

For covalent and directional solids, the lecture presents models such as Stillinger–Weber and Tersoff. A generic directional form is

$$E = \sum_{ij} \varepsilon_2(r_{ij}) + \sum_{ijk} \varepsilon_3(r_{ij}, r_{ik}, \theta_{ijk})$$

where the three-body term depends on the bond angle $\theta_{ijk}$. This is necessary for tetrahedral materials such as silicon, where bond angles matter strongly.

### 15.6 How Magnetism Is Modelled

Although the uploaded force-field slides focus more on structural and electrostatic interactions than on magnetism, the natural particle-based route is to augment each site with a spin degree of freedom. The simplest example is the Ising model,

$$s_i \in \{-1, +1\}, \quad H = -J\sum_{\langle i,j\rangle} s_i s_j$$

where $J > 0$ favours alignment. This is appropriate when one wants a scalar up/down spin variable.

A more detailed vector-spin description is the Heisenberg model,

$$H = -\sum_{\langle i,j\rangle} J_{ij} \mathbf{S}_i \cdot \mathbf{S}_j$$

where $\mathbf{S}_i$ is a vector spin on site $i$. This allows non-collinear magnetic order. In both cases, nearest-neighbour couplings are often the starting point because exchange interactions are usually strongest for nearby sites. Crystalline arrangement matters because it determines the neighbour network and therefore the magnetic ordering pattern. For example, bipartite lattices naturally support simple antiferromagnets, whereas geometrically frustrated lattices can support nontrivial spin order.

Numerically, magnetic models can be treated by Monte Carlo using spin flips or spin rotations, or by spin dynamics if one wants time-dependent magnetic evolution. The crucial modelling choice is the interaction graph and the coupling constants $J_{ij}$, which encode how magnetic order depends on structure.

### 15.7 Summary

Interatomic potentials are used because the exact Born–Oppenheimer energy surface is too expensive for routine large-scale simulation. The lecture presents several model classes: hard spheres for excluded volume, Lennard–Jones and Buckingham for dispersion plus repulsion, electrostatic and polarisable models for systems with charge response, and many-body metallic or directional models such as EAM and Stillinger–Weber for materials where local environment and bond angle matter. Magnetism is modelled by adding spin degrees of freedom and coupling them through exchange interactions, with the lattice geometry and nearest-neighbour structure playing a central role in the resulting magnetic behaviour.

---

## 16 Long-Range Electrostatic and Gravitational Interactions

### 16.1 Why Long-Ranged Interactions Are Difficult

Electrostatic and gravitational interactions both decay as $1/r$. This slow decay is the basic source of difficulty. Unlike short-ranged interactions, they do not become negligible quickly, so each particle interacts significantly with many distant particles. A direct pairwise sum therefore scales quadratically with system size,

$$E \sim \sum_{i<j} \frac{q_i q_j}{r_{ij}}$$

for electrostatics, or analogously with masses for gravity. This becomes very expensive for large systems.

There is also a deeper mathematical issue: in extended systems and especially under periodic boundary conditions, the infinite lattice sum of $1/r$ contributions is only conditionally convergent.

That means the result can depend on how the infinite sum is arranged if one is not careful.

### 16.2 Periodic Boundary Conditions

Under periodic boundary conditions the simulation cell is replicated infinitely in space. For short-ranged models this is usually straightforward. For Coulombic interactions it is not, because each charge interacts not only with the particles in the primary cell but also with infinitely many periodic images. The lecture explicitly notes that direct summation has conditional convergence under periodic boundary conditions and scales quadratically.

For this reason, simply truncating the Coulomb interaction at a spherical cutoff is generally dangerous. The neglected tail is not small in a mathematically controlled way, and the result can show large finite-size and charge-ordering artefacts. The same qualitative warning applies to gravity, although in practice periodic gravitational simulations are handled somewhat differently depending on the physical setting.

### 16.3 Charge Neutrality and Extended Systems

A further pitfall is net charge. For electrostatics in a periodic cell, a non-neutral cell makes the periodic Coulomb sum ill-defined unless some compensating background is introduced. Physically, bulk periodic electrostatics is most natural for globally neutral systems. Even when the net charge is zero, large dipoles or poorly converged sums can still generate severe artefacts if the long-range treatment is inadequate.

### 16.4 Ewald Summation

The classical remedy discussed in the lecture is Ewald summation. The key identity shown in the notes is

$$\frac{1}{r} = \frac{\text{erf}(\alpha r)}{r} + \frac{\text{erfc}(\alpha r)}{r}$$

where $\alpha$ is the Ewald splitting parameter. The idea is to split the interaction into a slowly varying long-range part and a rapidly decaying short-range part. The short-range contribution can be summed in real space, while the smooth long-range part is summed in reciprocal space.

This turns the poorly behaved raw $1/r$ lattice sum into two separately well-behaved sums.

The lecture explicitly describes Ewald as a combination of direct-space and reciprocal-space summation. This is the standard accurate treatment for periodic Coulomb interactions in atomistic simulations.

### 16.5 Particle Mesh Ewald

The lecture also mentions Particle Mesh Ewald, which accelerates the reciprocal-space part by using FFTs. The main advantage is computational: one retains the physical fidelity of Ewald-type long-range treatment while reducing the cost enough for large simulations.

### 16.6 Wolf and Related Methods

The notes also mention Wolf and related methods, based on compensating the charge within a direct cutoff. These are approximate alternatives to full Ewald. The motivation is again computational speed, but one must be cautious: such methods can work well for some systems while failing for others, especially where delicate long-range charge ordering matters.

### 16.7 Direct Truncation and Why It Fails

A common but poor idea is to use a simple cutoff,

$$V(r) = \frac{q_i q_j}{r} \Theta(r_c - r)$$

where $\Theta$ is a Heaviside cutoff at $r_c$. For Coulomb interactions this introduces discontinuities in forces and neglects important long-range correlations. In periodic systems it is especially problematic because the neglected contribution is not controlled by a short correlation length.

### 16.8 Gravitational Analogy

Gravity has the same $1/r$ structure, so it shares the difficulty of long-range summation and slow decay. The main distinction is physical rather than mathematical: electrostatic systems are often neutral, whereas gravitating systems are always attractive and do not benefit from cancellation in the same way. Consequently, finite-size effects and the treatment of boundaries can be even more subtle.

### 16.9 Summary

The main pitfalls of electrostatic and gravitational interactions are their long range, their quadratic cost under direct summation, and the conditional convergence of infinite periodic sums. Under periodic boundary conditions, naïve truncation is generally unreliable. The lecture therefore motivates methods such as Ewald summation, which splits $1/r$ into real-space and reciprocal-space contributions, Particle Mesh Ewald, which accelerates this using FFTs, and Wolf-type methods, which provide approximate cutoff-based alternatives. The central lesson is that long-ranged interactions cannot be treated like short-ranged ones without introducing serious artefacts.

---

## 17 Computing Average Quantities from Simulations

### 17.1 General Computation of Averages

The lecture notes define an ensemble average as

$$\langle A \rangle = \int dr^N dp^N \, p(r^N, p^N) A(r^N, p^N)$$

and in practice, once one has a set of sampled configurations or trajectory frames, one estimates this by a sample average:

$$\langle A \rangle \approx \frac{1}{N_{\text{sample}}} \sum_{i=1}^{N_{\text{sample}}} A_i$$

This is the basic formula shown in the lecture notes under "Properties of interest." The main point is that the simulation generates representative states of the ensemble, and the observable is evaluated on each state and averaged.

In Monte Carlo, the $A_i$ come from sampled configurations. In molecular dynamics, the $A_i$ come from configurations or phase-space points along a trajectory, after equilibration and taking autocorrelation into account.

### 17.2 Heat Capacity

A key fluctuation-derived quantity is the heat capacity. In a constant-temperature ensemble one can write

$$C_V = \frac{\langle E^2 \rangle - \langle E \rangle^2}{k_B T^2}$$

where $E$ is the total energy and $T$ is the temperature. The lecture notes list heat capacity among the important fluctuation properties. The logic is that once one has sampled the energy over the simulation, one computes its mean and mean square, then uses the fluctuation formula.

The physical interpretation is straightforward: large energy fluctuations correspond to a large heat capacity, meaning the system can absorb energy with relatively little temperature change.

### 17.3 Radial Distribution Function

The radial distribution function $g(r)$ is a structural quantity also explicitly mentioned in the lecture notes. It measures how likely one is to find a particle at distance $r$ from a reference particle relative to an ideal gas at the same density.

Operationally, one samples many particle configurations, accumulates a histogram of pair separations, and then normalises by the shell volume and the mean density. In three dimensions, the shell factor is $4\pi r^2 dr$, so $g(r)$ is obtained by comparing the observed pair count in that shell to the count expected for a uniform distribution.

Physically, peaks in $g(r)$ indicate preferred neighbour distances and therefore local structure. The lecture example on liquid silicon explicitly discusses RDF and ADF as structural quantities computed and averaged over MD trajectories.

### 17.4 Heat Conductivity

The lecture also includes non-equilibrium MD for heat transport, specifically the Müller–Plathe reverse non-equilibrium method. The idea is to impose a heat flux by swapping momentum or kinetic energy in selected slabs and then measure the resulting temperature gradient. In the steady state, the thermal conductivity $\kappa$ is obtained from Fourier's law,

$$J_q = -\kappa \nabla T$$

where $J_q$ is the heat flux and $\nabla T$ is the temperature gradient.

The lecture notes describe the analogous momentum-exchange construction for viscosity and emphasise that one imposes a flux, measures the resulting profile, and extracts the transport coefficient from the proportionality law in the linear-response regime. The same logic applies to heat conductivity: create a controlled nonequilibrium steady state, measure the response, and infer the coefficient.

### 17.5 Practical Considerations

To compute any average reliably, one must ensure that the simulation is equilibrated, that the samples are sufficiently decorrelated, and that the estimator is based on enough data. This is especially important for fluctuation-derived quantities such as heat capacity, since variance estimates converge more slowly than simple means. For structural quantities like $g(r)$, one also needs good histogram statistics and careful normalisation.

### 17.6 Summary

Average quantities in simulations are computed by evaluating an observable on many sampled states and taking the sample mean,

$$\langle A \rangle \approx \frac{1}{N_{\text{sample}}} \sum_i A_i$$

Examples from the lecture material include heat capacity, which can be obtained from energy fluctuations; the radial distribution function, which measures structural ordering through pair-separation statistics; and transport quantities such as heat conductivity, which can be extracted from nonequilibrium simulations by imposing a flux and measuring the resulting gradient.

---

## 18 Collective Variables and Free Energy

### 18.1 Collective Variables

The free-energy lecture defines a collective variable as a mapping

$$s : \mathbb{R}^{dN} \to \mathbb{R}^m$$

that takes the full atomic coordinates to a reduced description of the system state. In other words, instead of describing the system by all particle coordinates, one describes it by a small number of coarse variables that capture the physically relevant progress of some process. The lecture gives examples such as coordination number, bond-order parameters, dihedral angles, and the Ramachandran plot.

The key point is that a collective variable is not unique or fundamental. It is chosen by the modeller to distinguish the states of interest. If the chosen $s(r^N)$ is informative, then motion in the reduced coordinate tracks physically meaningful transitions in the full high-dimensional configuration space.

### 18.2 Free Energy as a Function of a Collective Variable

The lecture notes define the free energy associated with a collective variable by

$$F(s) = -k_B T \ln Q(s)$$

where the constrained partition function is

$$Q(s) = \frac{1}{h^{3N} N!} \int dr^N dp^N \, \exp\left(-\frac{H(r^N, p^N)}{k_B T}\right) \delta(s - s(r^N))$$

This means that $F(s)$ is the free-energy cost of observing the system at a particular value of the collective coordinate. Minima correspond to stable or metastable states, and barriers correspond to slow transitions.

### 18.3 Why Enhanced Sampling Is Needed

The lecture stresses that free energy is not directly available from simulation, and that sampling all configurations is not practical because their probabilities vary enormously. In ordinary MD or MC, the system may remain trapped for a very long time in one free-energy basin and never cross the barrier into another basin on accessible timescales. Enhanced sampling therefore works by modifying the Hamiltonian or the sampling weight so that barriers are easier to cross.

### 18.4 Umbrella Sampling

In umbrella sampling one defines a collective variable and adds a bias potential,

$$U'(r^N) = U(r^N) + U_{\text{bias}}(s) \equiv U(r^N) + U_{\text{bias}}[s(r^N)]$$

Equivalently, one changes the configurational probability to

$$\pi(r^N) \propto w(s) \exp\left(-\frac{U(r^N)}{k_B T}\right)$$

The lecture explicitly says that this removes barriers. The idea is to flatten the free-energy landscape in the chosen variable, often by using several overlapping windows, and then reconstruct the unbiased free energy from the biased simulations.

### 18.5 Enhanced Sampling by Extended Variables

The lecture also presents a Hamiltonian modification of the form

$$H'(r^N, p^N, s, p_s) = H(r^N, p^N) + \frac{p_s^2}{2m_s} + \frac{1}{2}k_s[s(r^N) - s]^2$$

where $s$ and $p_s$ are fictitious extended variables, $m_s$ is a fictitious mass, and $k_s$ is a coupling constant. The idea is that the dynamics in the collective variable can discover new places in configuration space and "drag" the physical system along. The lecture explicitly notes that one thermostats the physical and fictitious systems separately, and that a high temperature for $(s, p_s)$ leads to faster discovery.

### 18.6 Metadynamics

Metadynamics introduces a history-dependent bias potential. The lecture writes it as

$$U_{\text{bias}}(s, t) = \sum_i \exp\left(-\frac{|s - s_i|^2}{2\sigma^2}\right)$$

where the $s_i$ are collective-variable values visited during the simulation. The conceptual picture from the slides is that one gradually "fills" a free-energy minimum with Gaussians until the system spills over into another minimum, and then repeats the process. This makes metadynamics especially good for discovering new metastable regions without predefining all windows in advance.

### 18.7 Free Energy Perturbation

The lecture gives free-energy perturbation in the standard Zwanzig form,

$$\Delta F = F_B - F_A = -k_B T \ln\langle \exp(-\beta(\Phi_B - \Phi_A)) \rangle_A$$

where $\Phi_A$ and $\Phi_B$ are the interaction models or potentials of states $A$ and $B$, and the average is taken in ensemble $A$. This method is useful when one wants the free-energy difference between two similar systems, such as two ligands or two closely related force fields. Its weakness is overlap: if the configurations typical of $A$ rarely occur in $B$, the exponential average becomes poorly converged.

### 18.8 Thermodynamic Integration

The lecture then introduces thermodynamic integration by defining an interpolating potential

$$\Phi_\lambda^i = \lambda \Phi_A^i + (1 - \lambda) \Phi_B^i$$

The free-energy difference is

$$\Delta F = F_A - F_B = \int_0^1 d\lambda \left\langle \frac{dU_\lambda^i}{d\lambda} \right\rangle_\lambda = \int_0^1 d\lambda \langle \Phi_A - \Phi_B \rangle_\lambda$$

This is a very general route because the path in $\lambda$ can be chosen arbitrarily, though the integration density must be adapted to where the integrand varies rapidly. The lecture also mentions standard reference states: Einstein crystals for solids and Lennard–Jones-like references for liquids.

### 18.9 Interpretation

A collective variable describes the system state by projecting the full many-body dynamics onto a low-dimensional coordinate relevant to the process of interest. Enhanced sampling methods then alter the probability distribution or the Hamiltonian so that the system is driven more efficiently through this reduced coordinate, allowing barrier crossing and free-energy reconstruction.

### 18.10 Summary

A collective variable is a reduced coordinate $s(r^N)$ that captures the physically relevant state of a many-particle system. The lecture defines the associated free energy by

$$F(s) = -k_B T \ln Q(s)$$

where $Q(s)$ is the constrained partition function at fixed $s$. Because direct sampling of all relevant configurations is often impossible, one modifies the sampling using methods such as umbrella sampling, extended-variable enhanced sampling, and metadynamics. Free-energy differences can then be computed using methods such as free-energy perturbation and thermodynamic integration. The central purpose of all these methods is to make rare but important transitions accessible within feasible simulation times.
