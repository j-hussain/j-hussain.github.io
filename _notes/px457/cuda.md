---
layout: page
title: "Measuring and Accelerating: CUDA"
---

A million independent array updates seem ideal for parallelism. Launching a million operating-system threads would be expensive; a GPU provides a different execution model for that fine-grained work. CUDA exposes a hierarchy of lightweight threads, cooperating blocks and host-controlled launches. The question remains familiar: who owns each output, where do its inputs live, and which dependencies require synchronisation?

This chapter follows the source's Lecture 16. It builds on [SIMD and locality](/notes/px457/memory-architecture#models), [scope and barriers](/notes/px457/openmp-variables-synchronisation#synchronisation), and [completion-aware measurement](/notes/px457/metrics#runtime).

<h2 id="execution">1. Many logical threads, fewer resident execution resources</h2>

CUDA's general-purpose platform grew from programmable graphics, whose pixel and vertex operations supplied abundant data-parallel work. Introduced in 2007, CUDA combines language extensions, runtime APIs and a compiler toolchain for NVIDIA GPUs.

A **grid** is the collection of threads in a kernel launch. A **block** is a group of threads that can cooperate through block-local shared memory and barriers. Hardware schedules blocks onto streaming multiprocessors (SMs); resources such as registers, shared memory and resident-thread limits constrain how many can run at once. Blocks can execute in any order, so an ordinary kernel must not require all blocks to be resident simultaneously.

Threads are scheduled in groups called **warps**, currently 32 threads on NVIDIA CUDA devices. SIMT, single-instruction multiple-thread, presents per-thread state while issuing operations to active lanes. Divergent branches within a warp can require separate execution of different paths. Volta's independent thread scheduling means programs must not assume implicit warp synchrony; use documented warp/block synchronisation for communication.

A GPU thread is therefore not a CPU core. A large grid provides work that can be scheduled as resources become available. More active warps can hide latency, but maximising occupancy alone is not a proof of better performance: spills, extra work and memory traffic may dominate.

<h2 id="indexing">2. Prove ownership with an index formula</h2>

For one-dimensional blocks of $B$ threads and block index $b$, local thread $q\in[0,B)$ has global logical index

$$
t=Bb+q.
$$

A one-element-per-thread kernel checks the array bound:

```cpp
__global__ void square_once(float *a, size_t N) {
    size_t i = (size_t)blockIdx.x * blockDim.x + threadIdx.x;
    if (i < N) a[i] *= a[i];
}
```

For $N>0$, choose $G=\lceil N/B\rceil$ blocks; the final block can have threads with no element. Choose a supported block width, often a multiple of warp size, and verify device and kernel limits rather than treating a common 1024-thread maximum as universal.

### Grid-stride loops decouple work size from launch size

Let $S=BG$ be the total logical threads. Thread $t$ owns

$$
t,\ t+S,\ t+2S,\ldots <N.
$$

```cpp
__global__ void square(float *a, size_t N) {
    size_t t = (size_t)blockIdx.x * blockDim.x + threadIdx.x;
    size_t stride = (size_t)blockDim.x * gridDim.x;
    for (size_t i = t; i < N; i += stride) a[i] *= a[i];
}
```

Assume index additions remain representable. Every valid index has a unique decomposition $i=t+kS$ with $0\le t<S$ by Euclidean division. Thus every element is updated exactly once, provided the launch has positive stride. This is an ownership proof, not just an indexing idiom.

<Figure id="px457-grid-stride" title="Four threads can own twelve elements" caption="For stride S = 4, each thread owns one residue class modulo four. Every column is one pass through the grid-stride loop. Adjacent threads still access adjacent elements within a pass. The tiny grid illustrates ownership; it is not a recommended performance configuration.">
<svg viewBox="0 0 360 190" role="img" aria-label="Thread zero owns 0 4 8; one owns 1 5 9; two owns 2 6 10; three owns 3 7 11" style={{width: "100%", height: "auto"}}>
<g fill="currentColor" fontSize="13" textAnchor="middle"><text x="35" y="25">thread</text><text x="130" y="25">pass 0</text><text x="225" y="25">pass 1</text><text x="320" y="25">pass 2</text></g>
<path d="M78 35V179 M95 35H345" fill="none" stroke="currentColor" strokeDasharray="3 4"/>
<g fill="currentColor" fontSize="14" textAnchor="middle"><text x="35" y="62">0</text><text x="130" y="62">0</text><text x="225" y="62">4</text><text x="320" y="62">8</text><text x="35" y="96">1</text><text x="130" y="96">1</text><text x="225" y="96">5</text><text x="320" y="96">9</text><text x="35" y="130">2</text><text x="130" y="130">2</text><text x="225" y="130">6</text><text x="320" y="130">10</text><text x="35" y="164">3</text><text x="130" y="164">3</text><text x="225" y="164">7</text><text x="320" y="164">11</text></g>
</svg>
</Figure>

Follow the residue classes through successive passes. A partial final pass tests whether the bound check preserves ownership without accessing an invalid element.

<PX457Animation scene="grid" />

<h2 id="launch">3. A launch starts work; it does not finish the measurement</h2>

`__global__` marks a kernel, normally launched from host code; `__device__` marks a device-callable function, and `__host__ __device__` requests separate host/device versions. A discrete-device workflow allocates device storage, copies input, launches, obtains completed results, and frees storage. Integrated/unified-memory systems change how transfers are managed, not the need to respect data availability.

The following host function applies the grid-stride kernel to an existing host array. It checks every runtime call, skips an empty problem, and separates launch errors from execution completion:

```cpp
#include <cuda_runtime.h>
#include <cstdio>
#include <cstdlib>

static void check(cudaError_t err) {
    if (err != cudaSuccess) {
        std::fprintf(stderr, "%s\n", cudaGetErrorString(err));
        std::exit(EXIT_FAILURE);
    }
}

/* square() above must be visible in this .cu translation unit. */
void square_on_gpu(float *host, size_t N) {
    if (N == 0) return;
    /* Preconditions: host has N elements; N*sizeof(float) fits size_t. */
    size_t bytes = N * sizeof(float);
    float *device = nullptr;
    check(cudaMalloc((void **)&device, bytes));
    check(cudaMemcpy(device, host, bytes, cudaMemcpyHostToDevice));
    square<<<128, 256>>>(device, N); /* example: check target supports it */
    check(cudaGetLastError());
    check(cudaDeviceSynchronize());
    check(cudaMemcpy(host, device, bytes, cudaMemcpyDeviceToHost));
    check(cudaFree(device));
}
```

This is a function plus kernel, not a standalone executable: add a `main` that constructs input and checks the result. Compile `.cu` code with `nvcc`; for example, `nvcc -arch=sm_86 square.cu -o square` selects an appropriate target only if the actual device/toolchain supports that architecture. A launch returns asynchronously with respect to host execution. `cudaDeviceSynchronize` establishes completion and reports deferred execution errors.

For kernel-only timing, use CUDA events in the relevant stream or a host timing interval with deliberate synchronisation. For end-to-end timing, include the copies and allocation if they are part of actual use. A synchronous device-to-host copy waits for the relevant data transfer; do not generalise it into a barrier for arbitrary unrelated streams. The [runtime's synchronisation rules](https://docs.nvidia.com/cuda/archive/12.6.3/cuda-runtime-api/api-sync-behavior.html) distinguish host/device directions, memory types and asynchronous forms.

<h2 id="memory">4. Locality reappears as coalescing and reuse</h2>

A warp's adjacent lanes should, where possible, access adjacent suitably aligned elements. Hardware can then serve requests with fewer memory transactions: **coalescing**. The grid-stride square preserves this within each pass. An indirect access `a[perm[i]]` can scatter addresses and increase transactions. This is related to [CPU spatial locality](/notes/px457/memory-architecture#locality), but the unit of comparison is now the addresses requested together by a warp.

To see coalescing, ask a question about a group of addresses. The next view uses eight illustrative active lanes and a declared segment size so that every requested segment can be counted.

<PX457Animation scene="coalescing" />

| Storage                  | Scope and useful role                                               |
| ------------------------ | ------------------------------------------------------------------- |
| Registers                | Per-thread values; finite capacity, spills can use slower memory    |
| Global memory and caches | Device-accessible arrays; caches do not remove traffic costs        |
| Shared memory            | Block-local cooperation and reuse, allocated for a block's lifetime |
| Constant memory          | Read-only-to-kernel data with efficient same-address warp broadcast |

For example, a block can sum its inputs into shared memory, synchronise, then reduce partials:

```cpp
/* Launch exactly 256 threads per block; out has gridDim.x elements. */
__global__ void block_sums(const float *a, float *out, size_t N) {
    __shared__ float s[256];
    unsigned int q = threadIdx.x;
    size_t i = (size_t)blockIdx.x * blockDim.x + q;
    s[q] = (i < N) ? a[i] : 0.0f;
    __syncthreads();
    for (unsigned int step = 128; step > 0; step /= 2) {
        if (q < step) s[q] += s[q + step];
        __syncthreads();
    }
    if (q == 0) out[blockIdx.x] = s[0];
}
```

Use enough blocks to cover the inputs in this **single-pass** reduction kernel; unlike `square`, it has no grid-stride input loop. All threads reach each barrier, including those outside the input range, which contribute zero. The host or a later kernel must combine block outputs. Shared-memory atomic accumulation is another possible design, but the tree shows explicit producer–consumer phases and changes summation association. `__syncthreads()` does not synchronise different blocks. Never return some block threads before a barrier that the remaining threads require.

A filter can instead share coefficients through constant memory:

```cpp
__constant__ float weights[3];
/* Host: cudaMemcpyToSymbol(weights, hweights, sizeof hweights); */
```

When all lanes read the same coefficient at a given loop step, broadcast is favourable. Distinct addresses can require serialised requests. Constant memory is typically 64 KiB **per device**, not per translation unit; query device properties. The [CUDA best-practices guide](https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/) discusses both access patterns and their limitations.

### Exercises and continuation

1. Verify unique grid-stride ownership for $N=0,1,S-1,S,S+1$ and a nonmultiple of block size. Compare against the serial square.
2. Compare one-element and grid-stride kernels with completion-aware timing. Report transfers separately as well as end-to-end.
3. Introduce parity-dependent work, then indirect addresses. Explain divergence and memory scattering separately; do not assume the compiler must implement a branch.
4. Test block sums with a partial final block. Why must inactive input threads still participate in barriers?

CUDA exposes how work maps to hardware, but scientists need not implement every kernel themselves. [Higher abstractions](/notes/px457/higher-abstractions) asks which mathematical operations should be delegated to libraries and how a computational graph can supply derivatives efficiently.

### Reference

[NVIDIA's SIMT kernel guide](https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/writing-cuda-kernels.html) documents the execution hierarchy. Use documentation matching the installed toolkit and target device.
