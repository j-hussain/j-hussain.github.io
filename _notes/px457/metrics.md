---
layout: page
title: "Measuring and Accelerating: Performance Metrics"
---

A program is eight times faster on sixteen processors. Is that good? We need to know which serial baseline was used, whether the problem changed, and what the extra processors spent time doing. The [earlier chapters](/notes/px457/mpi-advanced#overlap) supplied mechanisms of waiting; this chapter supplies definitions that distinguish their effects.

<h2 id="runtime">1. Define the experiment before the ratio</h2>

Let $N$ denote a stated problem-size parameter and $P\ge1$ the processor count. $N$ might mean matrix dimension, number of particles or number of quadrature points; the work need not grow linearly in $N$:

| Calculation                              | Representative work scaling |
| ---------------------------------------- | --------------------------- |
| Dense matrix diagonalisation             | $O(N^3)$                    |
| FFT                                      | $O(N\log N)$                |
| Direct all-pairs N-body interactions     | $O(N^2)$                    |
| Composite trapezoidal rule with N points | $O(N)$                      |

Let $T(N,P)$ be elapsed time for a defined workload and numerical accuracy. Use a meaningful one-processor baseline, the same timing boundaries and representative data. Include transfers or setup if the application pays them; if reporting kernel-only times, label them. Repeat measurements and report variability, compiler settings and resource placement.

For distributed timings, the job cannot finish before its slowest rank. Time local intervals with `MPI_Wtime` and reduce their durations using `MPI_MAX`; clocks need not be synchronised for local duration measurements. A barrier can align a timed phase but itself changes the experiment. For CUDA, asynchronous launches require completion-aware timing, as the [next chapter](/notes/px457/cuda#launch) explains.

### The source's runtime model

Separate the one-processor work into serial and parallelisable parts:

$$
T(N,1)=\sigma(N)+\pi(N),
$$

and model the parallel time as

$$
T(N,P)=\sigma(N)+\frac{\pi(N)}P+\kappa(N,P),\qquad
\kappa(N,P)\ge0,\quad\kappa(N,1)=0.
$$

$\kappa$ is **elapsed-time overhead**: communication, scheduling, synchronisation, imperfect load balance and other departures from ideal division. This model assumes a fixed algorithm and baseline. Cache effects, different algorithms or changed frequency can violate its assumptions and can even produce apparent superlinear speedup. Those observations need explanation rather than being forced into a nonnegative-overhead model.

<h2 id="speedup">2. Speedup and efficiency answer different questions</h2>

Define

$$
\psi(N,P)=\frac{T(N,1)}{T(N,P)},\qquad
\epsilon(N,P)=\frac{\psi(N,P)}P
=\frac{T(N,1)}{P\,T(N,P)}.
$$

Speedup asks how much elapsed time was saved. Efficiency compares processor-time consumed with the baseline time. Eightfold speedup on sixteen processors has $\epsilon=1/2$. That may be worthwhile for a deadline even though it doubles processor-time cost.

Efficiency is not a hardware utilisation counter. A processor can be busy executing redundant work while algorithmic efficiency is poor; idle periods and overhead contribute to the same ratio.

<h2 id="amdahl">3. Amdahl's bound follows from a floor on elapsed time</h2>

At fixed $N$, define

$$
F=\frac{\sigma(N)}{\sigma(N)+\pi(N)}\in[0,1].
$$

Divide the runtime model by $T(N,1)$:

$$
\frac{T(N,P)}{T(N,1)}
=F+\frac{1-F}{P}+\frac{\kappa(N,P)}{T(N,1)}.
$$

Since overhead is nonnegative,

$$
\psi(N,P)\le\frac1{F+(1-F)/P},\qquad
\epsilon(N,P)\le\frac1{PF+1-F}.
$$

This is **Amdahl's law** under the model's assumptions. For $F>0$, the speedup ceiling as $P\to\infty$ is $1/F$. For $F=0$, this bound has no finite ceiling, though overhead or finite available parallelism can still limit scaling. For $P>1$, positive $F$ prevents unit efficiency; unit efficiency is possible in this ideal model only with both $F=0$ and zero overhead. At $P=1$, efficiency is one by definition.

Take $F=0.1$ and zero overhead. On four processors, runtime relative to serial is $0.1+0.9/4=0.325$, speedup $40/13\approx3.077$ and efficiency $10/13\approx0.769$. On sixteen processors, speedup is $6.4$ and efficiency $0.4$. Even infinitely many processors cannot exceed tenfold speedup.

<Figure id="px457-amdahl" title="The serial part refuses to shrink" caption="Relative runtime for F = 0.1 with no overhead. Teal marks the serial 0.1; outlined segments mark parallel work divided by P. All three bars use the same scale. These are exact model predictions, not benchmark results.">
<svg viewBox="0 0 360 190" role="img" aria-label="Runtime bars P equals 1: 1; P equals 4: 0.325; P equals 16: 0.15625, each retaining the same serial part 0.1" style={{width: "100%", height: "auto"}}>
<g fill="var(--sci-accent)"><rect x="60" y="30" width="26" height="26"/><rect x="60" y="80" width="26" height="26"/><rect x="60" y="130" width="26" height="26"/></g>
<g fill="none" stroke="currentColor"><rect x="86" y="30" width="234" height="26"/><rect x="86" y="80" width="58.5" height="26"/><rect x="86" y="130" width="14.625" height="26"/></g>
<g fill="currentColor" fontSize="13"><text x="5" y="48">P=1</text><text x="5" y="98">P=4</text><text x="5" y="148">P=16</text><text x="150" y="98">0.325</text><text x="110" y="148">0.15625</text><text x="60" y="180">0</text><text x="310" y="180">1</text></g>
</svg>
</Figure>

Instead of comparing just three processor counts, grow the machine continuously through the integer counts. Watch the part of the bar that refuses to shrink.

<PX457Animation scene="amdahl" />

<h2 id="scaling">4. Strong and weak scaling change different quantities</h2>

**Strong scaling** varies $P$ at fixed problem size and accuracy. **Weak scaling** grows the problem so that useful work per processor is approximately fixed. Good scaling is an experimental outcome, not part of either definition.

If work is proportional to $N$, doubling $N$ when doubling $P$ maintains work per processor. If work is proportional to $N^2$, use $N\propto\sqrt P$ instead. For a three-dimensional grid whose side length is $N$, work proportional to $N^3$ gives $N\propto P^{1/3}$. State whether $N$ denotes side length or total grid points.

The source's example growth laws $\sigma\sim N$, $\pi\sim N^2$ and $\kappa\sim N\log N+N\log P$ are illustrative algorithm models, not general HPC laws. They explain why the serial fraction and relative overhead can fall when problem size grows at fixed $P$. Check memory capacity and algorithmic complexity before attributing better scaling to “larger N”.

The two scaling experiments hold different geometry fixed. Return to the square halo model and compare the local area with its boundary as the process grid grows.

<PX457Animation scene="scaling" />

### Isoefficiency asks how much growth is enough

Define processor-time overhead

$$
T_{\mathrm{OH}}(N,P)=P\,T(N,P)-T(N,1).
$$

Then, **exactly by definition**,

$$
\epsilon(N,P)=\frac{T(N,1)}{T(N,1)+T_{\mathrm{OH}}(N,P)}.
$$

This is an equality, correcting the source's inequality. In the additive runtime model,

$$
T_{\mathrm{OH}}=(P-1)\sigma+P\kappa.
$$

Thus elapsed overhead $\kappa$ and processor-time overhead are not the same object. To maintain a target $0<\epsilon_0<1$, solve

$$
T(N,1)=\frac{\epsilon_0}{1-\epsilon_0}T_{\mathrm{OH}}(N,P).
$$

For example, suppose useful serial work is $cN$ and elapsed overhead is $a\log_2P$, with no serial section. Then $T_{\mathrm{OH}}=aP\log_2P$, so constant efficiency requires $N$ proportional to $P\log P$. This is the **isoefficiency relation**. It grows faster than the $N\propto P$ choice of ordinary weak scaling: constant work per processor does not guarantee constant efficiency.

<h2 id="karp-flatt">5. Karp–Flatt measures an effective fraction</h2>

For $P>1$ and positive measured speedup, invert Amdahl's expression:

$$
F_{\mathrm{KF}}(P)=
\frac{1/\psi(N,P)-1/P}{1-1/P}.
$$

Under the source's additive model, substitution gives a more revealing identity:

$$
F_{\mathrm{KF}}(P)
=F+\frac{\kappa(N,P)}{T(N,1)(1-1/P)}.
$$

The metric includes overhead. It does not directly measure a region of serial source code. For $F=0.1$ and no overhead it returns $0.1$ at both four and sixteen processors. If at four processors $\kappa/T(N,1)=0.075$, runtime becomes $0.4$ of serial, speedup is $2.5$, and $F_{\mathrm{KF}}=0.2$.

An increasing effective fraction is evidence consistent with growing relative overhead. A constant value is consistent with a fixed serial fraction, but can also hide overhead with suitable scaling. The ratio alone cannot uniquely distinguish causes; use profiles and communication/imbalance timings. Negative values can arise with superlinear speedups or baseline problems and signal assumptions to investigate. The metric is undefined at $P=1$.

### Exercises and course connection

1. Derive the overhead identity and verify the $F=0.1$ examples without a plot.
2. Given measured $T(N,1),T(N,2),T(N,4),T(N,8)$, report speedup, efficiency, variability and Karp–Flatt values. Avoid inferring a unique cause from those values alone.
3. Design a weak-scaling experiment for an $O(N^2)$ algorithm. Explain why doubling both $N$ and $P$ changes work per processor.
4. Relate terms in $\kappa$ to OpenMP queueing, false sharing, MPI halo traffic and synchronisation. Which measurements would distinguish them?

The same discipline applies to accelerators: a kernel's peak arithmetic rate is insufficient if transfers and launch costs dominate. [CUDA](/notes/px457/cuda) returns to the ownership and locality questions on GPU hardware.
