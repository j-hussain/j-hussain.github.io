---
layout: page
title: "Measuring and Accelerating: CUDA"
---

# PX457 — Lecture 16 Notes

### *GPU Programming with CUDA (CUDA-01: Concepts + Minimal CUDA C)*

---

## Conceptual Focus

CUDA introduces a different parallel paradigm to OpenMP/MPI:

- **CPU model:** fewer, independent MIMD cores; performance often hinges on caching and branch prediction.
- **GPU model:** massive throughput via **hierarchical SIMT** (Single-Instruction, Multiple-Thread) and oversubscription; performance hinges on occupancy and memory access patterns.

A GPU thrives when you give it a **very large volume of independent work** and a memory access pattern that the hardware can service efficiently.

---

# 1) GPUs: from graphics to general compute

## 1.1 Why GPUs exist

Computer graphics is fundamentally **data-parallel**: pixel/vertex computations can be performed independently over huge arrays. This drove hardware evolution from fixed-function accelerators to programmable pipelines and finally to general compute platforms.

## 1.2 CUDA's role

CUDA (introduced 2007) provides direct general-purpose access to GPU compute and memory from C/C++ without needing a graphics pipeline. CUDA is a hardware/software stack: language extensions, runtime library, and a specialised compiler toolchain.

---

# 2) GPU execution model: Hierarchical SIMT

## 2.1 Grid → Blocks → Threads

CUDA decomposes work into a hierarchy:

- **Grid:** all threads launched for a kernel call (analogy: all MPI ranks in `MPI_COMM_WORLD`).
- **Thread Block:** a cooperating group of threads that can synchronise locally (analogy: an OpenMP parallel region / team).
- **Thread:** basic unit of execution (analogy: one OpenMP thread / one MPI process in the "single worker" sense).

CUDA provides builtin variables so each thread can compute its unique global index: `blockIdx`, `blockDim`, `threadIdx`.

## 2.2 Warps and lockstep execution

Hardware schedules threads in groups of **32** called **warps**. Threads in a warp execute in SIMT lockstep.

### Thread divergence (performance hazard)

If threads in the same warp take different branches (`if/else`), the warp must serialise those branches in the worst case. This is qualitatively different from CPU threading where threads are more independent.

The lecture notes that Volta (2017) introduced **Independent Thread Scheduling**, improving flexibility and correctness properties, but divergence can still degrade performance substantially.

## 2.3 Correct mental model

Do not think "each GPU thread = CPU core". Instead:

- Optimisation is about **throughput**, not single-task latency.
- Memory is slow; hide latency via **occupancy** (lots of active threads) rather than relying on deep caches.
- Synchronisation is restricted (fast within block/warp), not arbitrary global locking.

---

# 3) Minimal structure of a CUDA C program

## 3.1 Host–Device workflow

A CUDA program still *runs on the CPU (host)* and offloads work to the GPU (device) over the PCI bus:

1. **Allocate** host memory and device memory
2. **Copy** inputs Host → Device
3. **Launch kernel** on the GPU
4. **Copy** results Device → Host
5. **Free** host/device allocations

## 3.2 Minimal skeleton (from slides)

The lecture provides a canonical minimal program layout. Key points:

- Device allocations via `cudaMalloc`.
- Transfers via `cudaMemcpy`.
- Kernel launched with `kernel<<<blocks, threads>>>(...)`.
- Kernel launch is **asynchronous**; `cudaDeviceSynchronize()` blocks until completion.
- A `cudaMemcpy` Device → Host can also act as an **implicit synchronisation** barrier for operations in the default stream.

---

# 4) Kernels and indexing

## 4.1 Kernel qualifiers and calling context

The lecture distinguishes function qualifiers:

- `__global__`: kernel callable from host, executes on device
- `__device__`: callable from device only
- `__host__ __device__`: callable from both (useful for small utility functions)

## 4.2 Global thread index

The standard 1D global ID pattern:

tid = blockDim.x × blockIdx.x + threadIdx.x

Use `tid` to map each thread to a data element, typically with a bounds check:

```c
if (tid < N) { /* operate on a[tid] */ }
```

This is the CUDA analogue of "rank decides which data it owns" in MPI.

---

# 5) Launch configuration and asynchrony

## 5.1 Blocks and threads

The lecture's standard choice: `THREADS_PER_BLOCK` should be a multiple of 32 (warp size), up to 1024 threads per block.

Typical calculation:

BLOCKS_PER_GRID = ⌈N / THREADS_PER_BLOCK⌉

## 5.2 Kernel launch is asynchronous

The `<<<...>>>` launch returns before the kernel finishes. Use:

- `cudaDeviceSynchronize()` explicitly, or
- rely on a blocking `cudaMemcpy` back to host which implies synchronisation in the default stream.

---

# 6) Grid-stride loop (robust kernel structure)

## 6.1 Motivation

A "one thread per element" kernel tightly couples `N` and launch config, and it becomes fragile as `N` varies or grows; it also fails to embrace the "oversubscribe the GPU" strategy.

## 6.2 Pattern

Decouple `N` from launch config by looping inside the kernel:

stride = blockDim.x × gridDim.x

Each thread processes indices:

i = tid, tid + stride, tid + 2×stride, ...

This is the default "production" shape for many CUDA kernels.

---

# 7) GPU memory hierarchy (what matters immediately)

## 7.1 Streaming Multiprocessors and memory types

An SM is the core execution unit; resources constrain how many blocks/threads can run concurrently. The lecture lists:

- **L2 cache** (global, automatic)
- **Shared memory** (fast R/W within a block)
- **Constant memory** (fast read-only broadcast when accessed uniformly)
- **Registers** (per-thread local variables)

## 7.2 Coalesced global memory access

Even though L2 caching is automatic, you must pay attention to **coalescence**: neighbouring threads in a warp should access neighbouring memory locations so hardware can combine requests efficiently.

The simple `a[i] = a[i]*a[i]` pattern is naturally coalesced; more complex access patterns (e.g., particle transport / irregular Monte Carlo) are harder to coalesce.

---

# 8) Shared memory (block-level cooperation)

## 8.1 What it is

Shared memory is:

- Visible to threads **within a block only**
- Lives for the lifetime of the block
- Declared with `__shared__` inside a kernel.

Synchronisation primitive:

- `__syncthreads()` acts as a block barrier.

## 8.2 Example concept (from slides)

The lecture shows a (simplified) block-local accumulation using shared memory plus atomic operations, then a single thread writes result to global memory.

Key takeaway: shared memory is where you implement **cooperation** and **reuse** within a block to reduce expensive global memory traffic.

---

# 9) Constant memory (read-only broadcast)

## 9.1 Properties

Constant memory:

- Declared at file scope with `__constant__`
- Initialised from host via `cudaMemcpyToSymbol()`
- Small (64KB per translation unit per slides)
- Fast only when threads in a warp read the **same address** at the same time (broadcast)

The lecture's example is a small convolution/filter where all threads reuse the same weights array.

---

# 10) Compiling CUDA code (tooling reality)

CUDA source usually uses `.cu` and is compiled with `nvcc`. The lecture shows:

```bash
nvcc -arch=sm_86 cuda_sq.cu -o cuda_sq
```

The architecture flag selects the GPU compute capability target, influencing available features and instruction set.

---

## Summary

- CUDA uses **hierarchical SIMT**: grid → blocks → threads; hardware executes warps of 32 threads in lockstep. Divergence within a warp can serialise branches and hurt performance.
- CUDA programs follow a host-controlled pipeline: allocate → copy H→D → launch kernel (async) → copy D→H (sync) → free.
- Kernel launch configuration should be thought of as "give the GPU enough threads" (oversubscribe), not "exactly one thread per element"; the **grid-stride loop** is the robust idiom.
- Performance is dominated by memory behaviour: aim for **coalesced** access; use **shared memory** for intra-block reuse; use **constant memory** for read-only broadcast patterns.

---

## PX457 Implementation Checklist (C/CUDA)

1. Implement `square()` twice: (i) single-pass `tid < N`, (ii) **grid-stride**; test varying (N) without changing launch config.
2. Add a branch in the kernel that depends on `tid` parity; time it and explain in terms of **warp divergence** (SIMT).
3. Create a kernel that reads `a[perm[tid]]` (indirect addressing) and compare to contiguous access; interpret via **coalescence**.
4. Implement a small stencil/filter with weights stored in **constant memory** (`__constant__` + `cudaMemcpyToSymbol`) and explain why it can be fast when warp accesses are uniform.
5. Use `cudaDeviceSynchronize()` deliberately to separate kernel time from transfer time; comment on which operations are synchronous vs asynchronous.
