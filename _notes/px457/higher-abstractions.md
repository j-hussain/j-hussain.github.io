---
layout: page
title: "Measuring and Accelerating: Higher Abstractions"
---

***Harnessing GPUs the easier way***

---

## Conceptual Focus

Writing raw CUDA C can deliver excellent performance, but it is **high maintenance**: architectures change quickly, vendor features evolve, and "good" code becomes obsolete or non-portable. This lecture argues for a pragmatic hierarchy:

1. Prefer **off-the-shelf GPU numerical libraries** when your computation matches a standard primitive.
2. Use **higher-level abstractions** (directive-based or portable kernel models) when you need custom kernels but want portability/maintainability.
3. For AI/ML workflows, use **automatic differentiation + computational graphs** frameworks to get gradients, GPU execution, and parallelisation "for free" relative to hand-deriving and hand-optimising derivatives.

---

# 1) Challenges in Harnessing GPUs

## 1.1 Pace of change: GPUs are being shaped by AI

The lecture uses AlexNet (2012) as a turning point: deep learning success shifted GPU roadmaps toward AI throughput. Consequences include:

- **Mixed-precision acceleration** (e.g., FP16/INT8) improving much faster than FP32/FP64.
- Increased specialisation (e.g., **Tensor Cores** that can compute fused operations like A = B×C + D efficiently).

## 1.2 Evidence: Warwick cluster GPU evolution

A concrete point: different Warwick clusters had very different GPU generations/specs. The headline is not the exact numbers; it's that **capabilities differ dramatically** across a decade and even across "recent" generations, affecting what "optimal" means.

## 1.3 Why raw CUDA is hard to sustain

Key friction points:

- You must manage threads/blocks, memory spaces, synchronisation, and tuning.
- Features change on ~1–2 year cycles (tensor core variants, memory formats, bank sizes, scheduling).
- Using new features often means new intrinsics/types (e.g., `__half`, MMA intrinsics).
- Vendor lock-in and portability issues (NVIDIA CUDA vs AMD ROCm).
- Net: "best" CUDA from 2–3 years ago can become suboptimal or fragile.

**Lecture's conclusion:** most domain scientists should avoid operating at the lowest level unless there's a strong reason; use abstractions so the ecosystem does the hardware-specific work.

---

# 2) Higher-Level GPU Abstractions (C/C++/Python)

## 2.1 C/C++ options when you still need "kernels"

The lecture lists:

- **OpenACC**: pragma/directive-based, similar spirit to OpenMP offload.
- **OpenCL**: write kernels + explicit memory management, but targeting multiple vendors.
- **C++ portability layers**: **SYCL**, **Kokkos**, **Alpaka** (aim: abstract vendor specifics while keeping performance control).

Important nuance the lecture flags: abstraction helps portability, but you still need to design the algorithm. Abstractions don't eliminate the need for good memory access patterns and parallel structure.

---

## 2.2 "Don't write kernels if you don't need to": GPU math libraries

For many scientific workloads, the best route is to express work in terms of well-optimised primitives:

- **cuBLAS**: linear algebra (GEMM etc.)
- **cuFFT**: FFTs
- **cuRAND**: RNG
- AMD **ROCm** provides analogues

This is the HPC analogue of "use BLAS before writing your own matrix multiply": you inherit years of optimisation.

---

## 2.3 Python access to GPUs: why it works

If your GPU use is via C libraries anyway, Python can be a productive front-end:

- **Numba**: JIT compilation with CUDA backend (Python-authored kernels).
- **CuPy**: close to NumPy drop-in, GPU arrays.
- **Taichi**: DSL embedded in Python for performance-oriented simulation kernels.

The "PX457 point": you can often accelerate scientific workflows without becoming a CUDA expert, provided your computations fit the abstraction/library's sweet spot.

---

# 3) Looking towards AI/ML: Automatic Differentiation

## 3.1 ML training is optimisation

Training = minimise a loss via gradient-based optimisation. Losses are huge compositions of primitive ops, often with billions of parameters; computing derivatives efficiently is the core enabler.

---

## 3.2 Three ways to get derivatives (and why two are bad at scale)

The lecture contrasts:

1. **Analytic/symbolic differentiation**
    - Correct but inflexible and requires separate derivative code.
2. **Numerical finite differences**
    
    ∂f(x)/∂x_i ≈ (f(x + h×e_i) - f(x)) / h
    
    - Needs step-size tuning, suffers cancellation/rounding, and costs one (or more) full function evals per variable → impossible at scale.
3. **Automatic differentiation (AD)**
    - Compute derivatives alongside the function using chain rule on a program trace / computational graph.

---

## 3.3 AD as "compute graph + chain rule"

The lecture formalises f: R^n → R^m and the Jacobian J ∈ R^(m×n), motivating why finite differences and symbolic methods don't scale.

It then walks through a toy function:

y = f(x₁, x₂) = ln(x₁) + x₁×x₂ - sin(x₂)

and shows how to decompose it into primitive operations (the "primal trace") and then propagate derivatives.

### Forward mode

- Propagate tangents from inputs to output (in-to-out).
- Efficient when **few inputs**, many outputs (conceptually: one pass per input direction).

### Reverse mode

- Propagate adjoints from output to inputs (out-to-in).
- Efficient when **few outputs** (often 1 loss scalar), many inputs (typical ML).
- Requires storing intermediate values from the forward pass (memory trade-off).

The lecture explicitly states the "mode playoffs" and why reverse-mode matches loss functions.

---

## 3.4 How AD is implemented in practice

Two approaches:

- **Source-to-source transformation** (inject derivative accumulation statements into code; fiddly in practice).
- **Pre-calculated computational graph** as in **TensorFlow**, **PyTorch**, **JAX** (dominant approach in modern ML tooling).

The slide image shows a forward computation graph with nodes for primitives and a backward phase that accumulates gradients.

---

# 4) Frameworks: JAX, TensorFlow, PyTorch

## 4.1 JAX

Described as: NumPy-like API, runs on CPU/GPU/TPU, with strong AD and compilation/vectorisation support. Example uses `jax.grad(f, 0)` to get ∂f/∂x₁.

## 4.2 TensorFlow

Emphasis: tensors + computational graphs + AD + distributed execution. Gradients shown using `tf.GradientTape()`.

## 4.3 PyTorch

Emphasis: dynamic graphs, very "Pythonic", widely used (incl. in scientific ML contexts). Example uses `requires_grad=True` and `result.backward()`.

## 4.4 Common features across frameworks

The lecture summarises shared capabilities:

- tensors
- computational graphs (dynamic in practice for many workflows)
- automatic differentiation
- GPU acceleration
- modularity/extensibility (ecosystems like TorchVision)
    
    Multiplicity is explained by history/competition plus rapid hardware/method evolution.

---

# 5) Connecting back to PX457 (OpenMP/MPI/CUDA → Term 2 AI/ML)

The final slide makes the integrative point: even if Term 2 focuses on AI/ML, these systems sit underneath real deployments:

- CPUs still do orchestration/data loading (often OpenMP).
- Large models often require multi-GPU coordination (often MPI or MPI-like collectives).
- CUDA literacy helps you understand why AI workloads map so well to GPUs.

---

## Summary

- Raw CUDA can be powerful but is **costly to maintain** due to rapid GPU evolution and vendor-specific optimisations.
- Practical GPU strategy: use **GPU numerical libraries** first (cuBLAS/cuFFT/cuRAND), then higher-level portability layers (OpenACC/OpenCL/SYCL/Kokkos/Alpaka) when needed.
- For AI/ML, **automatic differentiation** is the scalable route to gradients; reverse mode is typically best for scalar losses with many parameters, at the cost of storing intermediates.
- Frameworks (JAX/TensorFlow/PyTorch) unify tensors + compute graphs + AD + GPU acceleration, letting you "harness GPUs" without writing low-level kernels most of the time.

---

## PX457 Practical Checklist

1. If asked "how to use GPUs without CUDA," list: (i) libraries (cuBLAS/cuFFT/cuRAND), (ii) pragma models (OpenACC), (iii) portability layers (SYCL/Kokkos), (iv) Python options (Numba/CuPy).
2. Explain why **finite differences** is infeasible for ML-scale gradients using the "one eval per parameter" argument and numerical stability issues.
3. Be able to state when **forward vs reverse mode** AD is preferred, and the memory trade-off of reverse mode.
4. Tie the course together: OpenMP (CPU threading), MPI (multi-node/multi-GPU coordination), CUDA/GPU concepts (why deep learning maps well to GPUs), and AD frameworks as the high-level interface.
