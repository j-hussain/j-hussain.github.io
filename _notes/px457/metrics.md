---
layout: page
title: "Measuring and Accelerating: Metrics"
---

### *Measuring and Accelerating Performance Metrics*

---

## Conceptual Focus

This lecture formalises how we evaluate parallel performance beyond "it feels faster":

- **Speedup** and **parallel efficiency** as primary metrics.
- **Amdahl's Law**: an upper bound on *strong scaling* (fixed problem size).
- **Isoefficiency**: a way to reason about *weak scaling* (grow problem size with processor count).
- **Karp–Flatt metric**: estimate an *effective serial fraction* from measured speedups, and diagnose whether scaling limits come from true serial work or overheads.

---

# 1) Speedup and Efficiency

## 1.1 Problem size and algorithmic cost

Let N denote "problem size". Examples of complexity classes the lecture highlights:

- Dense diagonalisation: O(N³)
- FFT: O(N log₂ N)
- Naive N-body interactions: O(N²)
- Trapezoidal rule with N points: O(N)

This matters because **scaling behaviour interacts with algorithmic complexity**.

---

## 1.2 Decomposing runtime

The lecture splits the work into three pieces:

- σ(N): inherently serial part
- π(N): parallelisable part
- κ(N,P): parallel overheads (communication, synchronisation, load imbalance, etc.)

Sequential time (1 processor):

T(N,1) = σ(N) + π(N)   (κ(N,1) = 0)

Idealised parallel time (perfect division of parallel work):

T(N,P) = σ(N) + π(N)/P + κ(N,P)

---

## 1.3 Definitions

Speedup:

ψ(N,P) = T(N,1) / T(N,P)

Efficiency:

ε(N,P) = ψ(N,P) / P = T(N,1) / (P × T(N,P))

Interpretation:

- ψ answers "how many times faster?"
- ε answers "how well did we utilise processors?" (ideal is 1, but rarely achieved).

---

# 2) Amdahl's Law (Strong Scaling Limit)

## 2.1 Serial fraction

Define the **serial fraction**:

F = σ(N) / (σ(N) + π(N))

Ignoring overheads (κ > 0 only worsens things), the lecture derives:

ψ(N,P) ≤ 1 / (F + (1-F)/P)

ε(N,P) ≤ 1 / (PF + (1-F))

This is **Amdahl's Law**: even a small serial fraction caps strong scaling.

---

## 2.2 Consequences (the "sobering" part)

- Efficiency is never 100% unless F = 0.
- To get high efficiency at higher P, F must be tiny: the lecture gives concrete examples.
- Maximum speedup as P → ∞:
    
    ψ_max = 1/F

The plots in the lecture illustrate how speedup curves flatten as P grows, and flatten even more once communication overhead is included.

---

## 2.3 Amdahl oversimplifies: dependence on N

In realistic settings, larger machines are used for larger problems. The lecture notes typical asymptotic behaviour:

- σ(N) ~ N
- π(N) ~ N²
- κ(N,P) ~ N log₂ N + N log₂ P

As N grows, π(N)/P may dominate κ(N,P), so apparent speedup often improves with larger problem sizes—subject to memory limits per processor.

---

# 3) Strong vs Weak Scaling and Isoefficiency

## 3.1 Strong vs weak scaling

The lecture defines:

- **Strong scaling:** increase P at fixed N, maintain ε(N,P).
- **Weak scaling:** increase P and increase N "correspondingly" so efficiency stays roughly constant.

A diagnostic described: if ε(2N,2P) ≈ ε(N,P) but ε(N,2P) << ε(N,P), the system has good weak scaling but poor strong scaling.

---

## 3.2 Isoefficiency relation (overhead-based)

The lecture defines the *total overhead*:

T_OH(N,P) = P × T(N,P) - T(N,1)

Then:

ε(N,P) ≤ T(N,1) / (T_OH(N,P) + T(N,1))

**Interpretation:** to maintain a target efficiency as P increases, the serial work T(N,1) must grow sufficiently fast relative to the overhead term T_OH(N,P). This is exactly the "how big must N be as a function of P to keep efficiency constant?" question.

---

# 4) Karp–Flatt Metric (Diagnosing Inefficiency)

## 4.1 Definition

Starting from Amdahl's form:

1/ψ = F + (1-F)/P

Solve for F in terms of measured ψ and known P:

F = (1/ψ - 1/P) / (1 - 1/P)

This F is the **Karp–Flatt metric**: an experimentally inferred "serial fraction".

---

## 4.2 How to interpret it

The lecture uses two illustrative tables:

- If F is ~constant as P increases, poor scaling is mainly due to *true serial code* σ(N) (Amdahl regime).
- If F increases with P, poor scaling is mainly due to *parallel overhead* κ(N,P) (communication/synchronisation dominating).

This is practically useful because it tells you whether to:

- refactor to reduce serial sections, or
- attack comms/load-balance/latency, or reduce synchronisation frequency.

The lecture also ties this back to the Amdahl vs "Amdahl + communications" plots.

---

# 5) Practical Conclusions and Optimisation Discipline

## 5.1 Measure under realistic conditions

The lecture's conclusion stresses:

- Consider both theoretical scaling and empirical measurement.
- Lowest-asymptotic-complexity algorithm isn't always fastest in practice.
- Use multiple metrics: speedup, efficiency, isoefficiency, Karp–Flatt.
- Decide whether your users care about strong or weak scaling.

## 5.2 Premature optimisation caveat

Final slide is essentially software engineering guidance: optimisation has opportunity cost, must preserve maintainability, and should be justified by expected usage and hardware longevity.

---

## Summary

- Decompose parallel runtime: T(N,P) = σ(N) + π(N)/P + κ(N,P).
- Speedup ψ = T(N,1)/T(N,P), efficiency ε = ψ/P.
- **Amdahl's Law** bounds strong scaling using serial fraction F:
    ψ ≤ 1/(F + (1-F)/P), ε ≤ 1/(PF + (1-F)).
- **Isoefficiency** uses overhead T_OH = P×T(N,P) - T(N,1) to ask how N must grow with P to maintain ε.
- **Karp–Flatt** estimates an effective F from measurements:
    F = (1/ψ - 1/P)/(1 - 1/P), diagnosing serial-vs-overhead scaling limits.

---

## PX457 "what to do in your report" checklist

1. Report ψ(N,P) and ε(N,P) for multiple P, fixed N (strong scaling).
2. Compute Karp–Flatt F(P) from measured speedups and interpret whether overheads are dominating.
3. Run a weak-scaling sweep (increase N with P) and comment using the isoefficiency perspective.
4. Explicitly discuss what's in κ(N,P) for your code (MPI comms, OpenMP synchronisation, load imbalance) and connect to observed data.
