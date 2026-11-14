---
layout: page
title: "Measuring and Accelerating: Higher Abstractions and Automatic Differentiation"
---

After implementing a [CUDA kernel](/notes/px457/cuda#indexing), we can ask a more productive question: should this kernel have been handwritten at all? If the calculation is a matrix product, FFT or standard reduction, expressing the mathematical primitive may give a library more freedom to tune it than a scientist can afford to maintain.

This final available chapter connects the hardware course to a new mathematical operation: differentiating a program. The same computational graph that exposes dependencies can carry derivative information. We will derive those derivatives rather than treating automatic differentiation as a framework feature to memorise.

<h2 id="abstractions">1. Choose the level at which the problem is regular</h2>

A GPU library knows more than a single loop. A matrix multiplication specifies an entire operation, allowing blocking, data reuse, specialised instructions and device-specific dispatch. NVIDIA's cuBLAS, cuFFT and cuRAND supply linear algebra, Fourier transforms and random-number facilities; AMD's ROCm ecosystem supplies corresponding categories of tools. Prefer an existing primitive when its semantics, accuracy and data layout fit the calculation.

For custom work, options from the source include:

| Abstraction              | What it expresses                                            | What the author still owns                                  |
| ------------------------ | ------------------------------------------------------------ | ----------------------------------------------------------- |
| OpenACC / OpenMP offload | Directive-based parallel loops and data regions              | Dependencies, movement and supported compiler features      |
| OpenCL                   | Portable kernel/execution APIs                               | Kernels, memory and target-specific tuning                  |
| SYCL, Kokkos, Alpaka     | C++ execution/memory abstractions                            | Algorithmic structure and performance portability choices   |
| CuPy                     | GPU array operations resembling NumPy                        | Device residency, temporary arrays and supported operations |
| Numba ecosystem / Taichi | Compiled Python-authored kernels or embedded simulation DSLs | Supported subset, execution model and deployment toolchain  |

These are categories, not an installation or recommendation of a specific current package version. Portability of source is not guaranteed portability of performance. Coalescing, [surface-to-volume ratio](/notes/px457/mpi-communicators#geometry) and serial dependencies remain mathematical constraints underneath the interface.

The source used AlexNet's 2012 results and successive Warwick GPU generations to motivate hardware specialisation. Mixed precision and tensor/matrix units make the point concrete: a fast fused operation such as $A\leftarrow BC+D$ can have very different precision and accumulation semantics from an ordinary scalar loop. Hardware marketing rates cannot replace an application error analysis. Changes across generations also make low-level assumptions costly to sustain; numerical libraries can absorb some of that work.

<h2 id="derivatives">2. Why a gradient is an HPC problem</h2>

Suppose a loss $f:\mathbb R^n\to\mathbb R$ depends on millions of parameters. A gradient-based update needs all $n$ partial derivatives. A forward finite difference is

$$
\frac{\partial f}{\partial x_i}(x)
\approx\frac{f(x+he_i)-f(x)}h.
$$

One reused baseline still leaves approximately $n$ additional evaluations. For a smooth function, forward differencing has truncation error $O(h)$, while roundoff in the subtraction can contribute an error proportional to $u/h$, with scale-dependent constants. Making $h$ arbitrarily small is therefore not a solution.

Symbolic differentiation can produce exact formulas, but expanding a large program into one expression can duplicate subexpressions and separate derivative code from its source. Neither symbolic differentiation nor finite differences is inherently “bad”: finite differences remain useful for small verification cases. We want an approach that reuses the program's own intermediate values.

**Automatic differentiation (AD)** applies the chain rule to elementary operations along a computational trace or transformed program. It avoids finite-difference step-size error, but still uses floating-point arithmetic and differentiates the implemented operations under their derivative rules. Nondifferentiable points, data-dependent branches and custom primitives need care.

<h2 id="trace">3. Decompose the source function into reusable steps</h2>

For $x_1>0$ and $x_2\in\mathbb R$, consider

$$
y=f(x_1,x_2)=\log x_1+x_1x_2-\sin x_2.
$$

Use the primal trace

$$
v_1=\log x_1,\quad v_2=x_1x_2,\quad v_3=\sin x_2,
\quad v_4=v_1+v_2,\quad y=v_4-v_3.
$$

The trace preserves reuse: $x_1$ feeds both logarithm and product, and $x_2$ feeds both product and sine. Those multiple paths will require **adding** derivative contributions in reverse mode.

<Figure id="px457-ad-graph" title="One computation, two derivative directions" caption="The forward graph computes the function. Forward mode carries input perturbations along arrows; reverse mode carries output sensitivities against them and adds contributions at shared inputs. The two incoming paths to each input explain the two terms in each final partial derivative.">
<svg viewBox="0 0 360 245" role="img" aria-label="x1 feeds log and product, x2 feeds product and sine; log plus product minus sine gives y. Forward tangents go toward y, reverse sensitivities return to inputs" style={{width: "100%", height: "auto"}}>
<defs><marker id="px457-ad-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="currentColor" /></marker></defs>
<g fill="none" stroke="currentColor"><rect x="10" y="30" width="65" height="34"/><rect x="10" y="170" width="65" height="34"/><rect x="120" y="20" width="100" height="38"/><rect x="120" y="98" width="100" height="38"/><rect x="120" y="176" width="100" height="38"/><rect x="275" y="98" width="70" height="38"/><g markerEnd="url(#px457-ad-arrow)"><path d="M75 47L120 39"/><path d="M75 47L120 117"/><path d="M75 187L120 117"/><path d="M75 187L120 195"/><path d="M220 39L275 110"/><path d="M220 117H275"/><path d="M220 195L275 125"/></g></g>
<g fill="currentColor" fontSize="13" textAnchor="middle"><text x="42" y="52">x₁</text><text x="42" y="192">x₂</text><text x="170" y="44">log x₁</text><text x="170" y="122">x₁x₂</text><text x="170" y="200">sin x₂</text><text x="310" y="122">+ + −</text><text x="310" y="157">y</text><text x="180" y="239">tangents →        ← sensitivities</text></g>
</svg>
</Figure>

<h2 id="forward">4. Forward mode asks: what does one input perturbation do?</h2>

Seed an input direction $(\dot x_1,\dot x_2)$ and propagate directional derivatives:

$$
\begin{aligned}
\dot v_1&=\dot x_1/x_1,\\
\dot v_2&=x_2\dot x_1+x_1\dot x_2,\\
\dot v_3&=\cos(x_2)\dot x_2,\\
\dot y&=\dot v_1+\dot v_2-\dot v_3.
\end{aligned}
$$

Collecting coefficients gives

$$
\dot y=(1/x_1+x_2)\dot x_1+(x_1-\cos x_2)\dot x_2.
$$

One pass computes $Jv$, a **Jacobian–vector product**. For $f:\mathbb R^n\to\mathbb R^m$, $J\in\mathbb R^{m\times n}$. Seeding coordinate vectors constructs its columns in $n$ passes, but a single desired directional derivative needs just one pass. Few inputs and many outputs often favour forward mode for a full Jacobian.

Keep the primal values fixed and send one input perturbation through the trace. Changing the seed changes the directional derivative, while the computational graph remains the same.

<PX457Animation scene="forward" />

<h2 id="reverse">5. Reverse mode asks: which inputs influenced one output?</h2>

Let $\bar v=\partial y/\partial v$. Seed $\bar y=1$ and initialise other adjoints to zero. The output subtraction gives $\bar v_4=1$ and $\bar v_3=-1$. The addition gives $\bar v_1=1$ and $\bar v_2=1$. Propagating through the remaining operations accumulates

$$
\begin{aligned}
\bar x_1&\mathrel{+}=\bar v_1/x_1,&
\bar x_1&\mathrel{+}=\bar v_2x_2,\\
\bar x_2&\mathrel{+}=\bar v_2x_1,&
\bar x_2&\mathrel{+}=\bar v_3\cos x_2.
\end{aligned}
$$

Consequently,

$$
\nabla f(x_1,x_2)=
\begin{pmatrix}1/x_1+x_2\\x_1-\cos x_2\end{pmatrix}.
$$

At $(x_1,x_2)=(2,0)$ the function is $\log2$ and the gradient is $(1/2,1)$. A forward seed $(1,0)$ yields $1/2$; seed $(0,1)$ yields $1$; seed $(1,1)$ yields $3/2$. Reverse mode obtains both partials from one output seed. The bar means derivative sensitivity here, not complex conjugation.

For general output seed $w\in\mathbb R^m$, reverse mode computes $J^Tw$, a vector–Jacobian product in the common column-vector convention. A scalar loss has $m=1$, so one reverse sweep obtains all input sensitivities. For programs built from suitable primitives, its arithmetic cost is a modest multiple of evaluating the program, rather than $n$ separate function evaluations. It must retain or recompute primal information, so memory can become the limiting resource. Checkpointing trades recomputation for storage.

Forward and reverse modes compute different products of the same local linear map. Neither must materialise the full Jacobian. The [JAX differentiation guide](https://docs.jax.dev/en/latest/jacobian-vector-products.html) develops this JVP/VJP interpretation.

Now send an output sensitivity against the arrows. Pause where the paths meet: both contributions must be added to the input adjoint.

<PX457Animation scene="reverse" />

<h2 id="frameworks">6. Frameworks package the transformation; they do not erase its assumptions</h2>

AD can be implemented by source transformation, operator overloading/tapes, or graph/intermediate-representation transformations. It is misleading to describe every framework as using a precomputed static graph. PyTorch commonly records a dynamic graph; TensorFlow has eager/tape and graph execution; JAX traces computations for transformations and compilation.

For the source's example, representative interfaces are `jax.grad(f, argnums=0)`, TensorFlow's `GradientTape`, and PyTorch tensors with `requires_grad=True` followed by `backward()`. These names illustrate how a scalar-loss derivative is requested; package versions, devices and supported operations still need checking in an implementation.

Tensors, AD, compilation and GPU execution make high-level code powerful because primitives expose large regular operations. They do not provide gradients for arbitrary opaque external code or automatically distribute an arbitrary program optimally. Data loading can remain CPU-bound; device transfers can dominate; large models require collectives between devices; memory limits can dictate recomputation. OpenMP, MPI and CUDA explain these costs beneath the interface.

### Exercises and the available course boundary

1. Derive both AD sweeps without first differentiating the expanded expression. Where must reverse contributions be added rather than overwritten?
2. Verify the analytic gradient at $(2,0)$ and a point with nonzero $x_2$ using several finite-difference step sizes. Explain the truncation/roundoff trade-off.
3. For $f:\mathbb R^{1000}\to\mathbb R^2$, compare full-Jacobian costs with the costs of one JVP or one VJP. Why does a requested product change the preferred method?
4. A library matrix multiply is fast but the application is slow. Use the course's ownership, movement and timing models to propose measurements before writing a custom kernel.

This completes the **available substantive PX457 sources**: numerical representation → instruction/data flow → shared/distributed ownership → scaling → GPU execution → differentiating computational graphs.
