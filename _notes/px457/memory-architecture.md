---
layout: page
title: "Memory Architecture"
---

Text: Week 3

## 1. Basic Serial (SISD) Architecture

### Flynn's Taxonomy — A Foundation

Computer architectures can be classified by how **instructions** and **data streams** interact:

| Type | Meaning | Description |
| --- | --- | --- |
| **SISD** | *Single Instruction, Single Data* | One instruction operates on one data element at a time (classic CPU). |
| **SIMD** | *Single Instruction, Multiple Data* | Same instruction applied to multiple data elements in parallel. |
| **MISD** | *Multiple Instruction, Single Data* | Multiple instructions on same data stream (rare). |
| **MIMD** | *Multiple Instruction, Multiple Data* | Multiple programs operating on multiple data streams (modern clusters). |

### SISD: The Classic Model

- One **program** → one **processor**.
- Processor fetches and executes instructions sequentially.
- Each instruction operates on one piece of data at a time.
- Includes fetching/writing data to and from **main memory**.

**Example:** Your laptop CPU running a single-threaded Python script.

---

## 2. Memory Hierarchy — Latency and Locality

### Hierarchy Overview

Memory is *hierarchical* — smaller, faster memory near the CPU; larger, slower memory farther away.

| Level | Typical Size | Location | Access Time (cycles) | Description |
| --- | --- | --- | --- | --- |
| **Registers** | 100–500 per core | On-chip | 1 | CPU currently active data |
| **L1 Cache** | 32–64 KB | Per core | 1–3 | Fast SRAM |
| **L2 Cache** | 256 KB | Per core | 5–10 | Medium-speed buffer |
| **L3 Cache** | 2–40 MB | Shared across cores | 15–25 | Shared "last-level cache" |
| **Main Memory (RAM)** | 8–64 GB | Off-chip | 30–300 | Dynamic DRAM |

> Access time grows by orders of magnitude as you move down the hierarchy.
> 
> Performance depends critically on **cache hit rates** (minimising "cache misses").

---

## 3. Cache Mechanics — The "Toy Model"

### Direct-Mapped Cache (Simplified Example)

Imagine:

- Main memory: thousands of 64-bit words (8 bytes each).
- Cache: 4 "lines" each storing **16 words**.

When CPU requests `A[i]`:

1. Check if data is already in cache (cache hit).
2. If not → load the *entire cache line* containing `A[i]` from main memory.
3. If cache is full → overwrite an old cache line (write-back vs. write-through policies).

**Implication:** Accessing adjacent elements (good *spatial locality*) is *free* once data is cached.

---

## 4. Cache Performance in Practice

### Example 1 – "A Happy Cache"

```c
double A[32], B[32];
for (i = 0; i < 32; i++) {
    A[i] = A[i] * B[i];
}
```

- `A[i]` and `B[i]` map to **different cache lines**.
- Both arrays fit comfortably within cache.
- Only **4 reads** from main memory needed.
- Reuse within cache → high temporal locality.

---

### Example 2 – "Cache Thrashing"

```c
double A[64], B[64];
for (i = 0; i < 64; i++) {
    A[i] = A[i] * B[i];
}
```

- Now `A[i]` and `B[i]` map to the **same cache line**.
- Each iteration **evicts** the previous data.
- Results in **128 main memory reads** instead of 4.
- Performance collapses due to repeated cache misses.

This is **cache conflict thrashing** — the cache is "fighting" itself due to address overlap.

---

### Fix 1 – **Padding**

```c
double A[64], C[16], B[64];   // Add padding array C
for (i = 0; i < 64; i++) {
    A[i] = A[i] * B[i];
}
```

- `C` acts as a **buffer** to shift memory alignment.
- Now `A` and `B` occupy *different cache lines* again.
- 8 reads instead of 128 — massive performance gain.

Padding is rarely portable — modern architectures are **associative**, meaning they auto-handle mapping flexibility. Still, conceptually important.

---

## 5. Spatial and Temporal Locality

**Cache logic assumes:**

- **Spatial locality:**
    
    If you access `A[i]`, you'll soon access `A[i+1]`, `A[i+2]`, etc.
    
- **Temporal locality:**
    
    If you use `A[i]` now, you'll likely reuse it soon.

**Lesson:** Write code that *accesses contiguous memory* and *reuses data often*.

**Avoid:**

- Strided access (skipping elements)
- Random memory access patterns

---

## 6. Interleaving — Data Structure Design

### Separate Arrays

```c
double A[64], B[64];
for (i = 0; i < 64; i++) {
    A[i] = A[i] * B[i];
}
```

- Two separate blocks in memory → poor spatial locality.

### Interleaved Structs

```c
struct my_type {
    double A;
    double B;
};
struct my_type d[64];
for (i = 0; i < 64; i++) {
    d[i].A = d[i].A * d[i].B;
}
```

- Each `A[i]` is stored **next to** its corresponding `B[i]`.
- When a cache line loads, both values arrive together.
- 8 main memory reads → same as padded case, but cleaner.

---

## 7. Access Patterns — Even/Odd Example

### Bad (strided) access

```c
for (i = 0; i < 127; i += 2)
    A[i] = A[i] * A[i];
for (i = 1; i < 128; i += 2)
    A[i] = A[i] * A[i] * A[i];
```

- Two passes → double the reads.
- Only half the cache line used per iteration.
- **16 reads total.**

### Good (unit-stride) access

```c
for (i = 0; i < 127; i += 2) {
    A[i]   = A[i] * A[i];
    A[i+1] = A[i+1] * A[i+1] * A[i+1];
}
```

- All elements processed in one contiguous sweep.
- **8 reads total**, 2× faster due to full cache-line utilisation.

---

## 8. Multidimensional Arrays in C

### Poor Access (Column-wise)

```c
double A[4][32];
double sumcol[32];

for (i = 0; i < 32; i++) {
    sumcol[i] = 0.0;
    for (j = 0; j < 4; j++)
        sumcol[i] += A[j][i];
}
```

- Accesses `A[j][i]` with stride 32 → jumps across memory.
- Each inner loop triggers a **new cache line load**.
- Total: **128 reads from main memory**.

### Fixed Access (Row-wise)

```c
double A[32][4];
double sumcol[32];

for (i = 0; i < 32; i++) {
    sumcol[i] = 0.0;
    for (j = 0; j < 4; j++)
        sumcol[i] += A[i][j];
}
```

- Now accessing *contiguous memory*.
- **8 reads total** — up to **16× faster** in realistic systems.

---

## 9. The Programmer's Mantra

### For C (Row-Major Storage):

> "When addressing arrays in C,
> **the right-most index must vary most rapidly.**"

```c
A[i][j]   // i = row, j = column → j must be inner loop
```

### For Fortran (Column-Major Storage):

> "When addressing arrays in Fortran,
> **the left-most index must vary most rapidly.**"

```fortran
A(i, j)   ! i is the inner loop index
```

Mixing conventions (e.g., porting C to Fortran) often causes *catastrophic slowdowns* due to cache inefficiency.

---

## 10. Memory Optimisation Summary

| Principle | Explanation |
| --- | --- |
| **Use unit stride** | Access contiguous memory sequentially. |
| **Exploit spatial locality** | Touch data near what's already in cache. |
| **Exploit temporal locality** | Reuse data soon after loading it. |
| **Avoid cache-line multiples** | Powers of 2 array sizes often cause aliasing issues. |
| **Minimise passes** | Do more work per memory read. |
| **Respect array layout** | Row-major (C) vs column-major (Fortran). |
| **Legacy code caution** | Older code predates caching and may perform poorly. |

---

## 11. Beyond SISD — Alternative Architectures

### MISD (Multiple Instruction, Single Data)

- Multiple programs process *the same data stream* with different algorithms.
- Not used in modern HPC (rare exceptions: fault-tolerant systems like the Space Shuttle).

---

### SIMD (Single Instruction, Multiple Data)

- One instruction applied across many data points simultaneously.
- Example: a vectorised operation like:
    
    ```c
    A = B * C;  // performed on multiple elements in parallel
    ```
    
- Historically used in **vector supercomputers** (Cray, Fujitsu VP).
- Reappeared via **CPU vector extensions** (SSE, AVX, NEON).

---

## 12. Vectorisation in Modern CPUs

### What Is Vectorisation?

Executing a single instruction across multiple data points (SIMD inside a CPU core).

### Evolution:

| Extension | Width | Year | Notes |
| --- | --- | --- | --- |
| **SSE** | 128-bit | ~1999 | Operates on 2 doubles or 4 floats |
| **AVX** | 256-bit | ~2011 | Doubles vector width |
| **AVX2** | 256-bit | ~2013 | Adds integer operations |
| **AVX-512** | 512-bit | ~2017 | Can process 8 doubles or 16 floats per instruction |

### Enabling Vectorisation:

- Short, simple loops
- Avoid branching (`if`, `switch`) inside hot loops
- Avoid inter-loop dependencies
- Let the compiler auto-vectorise

### Helpful GCC flags:

```bash
-fopt-info-vec-optimized
-fopt-info-vec-missed
```

These report which loops were successfully vectorised and why others failed.

### Pitfall:

Manual **loop unrolling** can actually *prevent* compiler vectorisation — compilers are sophisticated enough to do this themselves optimally.

---

## 13. MIMD — The Modern Parallel Model

### Definition:

> Multiple Instruction streams → Multiple Data streams

Each processor (core or node) executes its own program, often on different data.

This is the **dominant model** for:

- Multicore CPUs
- HPC clusters
- Cloud computing infrastructures

---

## 14. Hardware Models

| Model | Description | Example |
| --- | --- | --- |
| **Shared Memory (SMP)** | All cores access the same physical memory. Synchronisation via threads. | Multicore CPU |
| **Distributed Memory** | Each processor has its own local memory; communication via network. | HPC cluster |

**Hybrid model:** Modern supercomputers combine both (clusters of SMP nodes).

---

## 15. Programming Models for MIMD

| Paradigm | Model | API / Standard | Notes |
| --- | --- | --- | --- |
| **Shared Memory** | Threads sharing one memory space | **OpenMP** | Easy to parallelise loops; ideal for multicore CPUs. |
| **Distributed Memory** | Tasks on different nodes communicating via messages | **MPI (Message Passing Interface)** | Explicit control over data communication; used in clusters. |
| **Hybrid** | Mix of both | **OpenMP + MPI** | Real-world supercomputing approach. |

---

# Summary

### Key Takeaways

- **Memory hierarchy** is the bottleneck in modern computing — not CPU speed.
- Cache awareness, stride control, and data locality dominate performance.
- Always design data access patterns to exploit **contiguity**.
- Understand **architecture-level parallelism** (SIMD) and **system-level parallelism** (MIMD).
- Use compiler analysis to verify vectorisation.
- **Programming model choice** (OpenMP vs MPI) depends on your hardware.
