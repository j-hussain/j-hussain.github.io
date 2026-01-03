---
layout: page
title: "OpenMP: Loop Scheduling and Load Balancing"
---

### *OpenMP 04: Loop Scheduling and Parallel Sections*

---

## Conceptual Focus

The previous lectures dealt with correctness (data scope & synchronisation).

Now, the emphasis moves to **performance tuning** — how iterations are assigned to threads and how we can parallelise *different* tasks (not just data loops).

Two dimensions:

1. **Loop scheduling** → improving *load balance* for irregular workloads.
2. **Parallel sections** → exploiting *functional* rather than data parallelism.

---

## Loop Scheduling and Load Balancing

### Motivation

Even if each thread gets the same number of iterations,

work per iteration may differ — causing *load imbalance* and idle threads.

OpenMP exposes several scheduling policies via the **`schedule` clause**.

---

### `schedule(static[, chunk])`

- **Precomputed at compile/start time.**
- Default mode.
- Divides the iteration space into equal-sized chunks.

```c
#pragma omp parallel for schedule(static)
for (int i=0; i<N; ++i) work(i);
```

| Case | Meaning |
| --- | --- |
| `schedule(static)` | each thread gets ~N/P consecutive iterations |
| `schedule(static, C)` | iterations split into chunks of size C; assigned round-robin |

*Lowest overhead*; good for uniform workloads.

*Poor load balance* if iteration cost varies.

---

### `schedule(dynamic[, chunk])`

- Iterations assigned **at runtime**.
- When a thread finishes a chunk, it grabs the next available one.
- Reduces idle time for uneven workloads.

```c
#pragma omp parallel for schedule(dynamic,4)
for (int i=0; i<N; ++i) heavy_work(i);
```

Balances irregular work (e.g. variable loop cost).

Higher runtime overhead (contention on the work queue).

---

### `schedule(guided[, chunk])`

- Hybrid: large chunks first, smaller later.
- Each thread starts with a big block; chunk size decreases geometrically until hitting `chunk`.

```c
#pragma omp parallel for schedule(guided,8)
```

Useful when early iterations dominate cost.

Less predictable pattern; sometimes over-tuned.

---

### `schedule(runtime)`

Schedule determined at runtime via environment variable or API.

```bash
export OMP_SCHEDULE="static,4"
```

or in code:

```c
omp_set_schedule(omp_sched_static, 4);
omp_get_schedule(&kind, &chunk);
```

Excellent for benchmarking and tuning without recompiling.

---

## Load Imbalance Example

**Triangular matrix initialisation:**

```c
#pragma omp parallel for private(i,j)
for (int i=0; i<N; ++i)
  for (int j=i; j<N; ++j)
    A[i][j] = heavy_fn(i,j);
```

- Later `i` values do less work → threads handling small `i` dominate runtime.

| Schedule | Behaviour | Relative Runtime |
| --- | --- | --- |
| `static` | contiguous ranges | slow |
| `static,1` | round-robin | balanced, faster |
| `dynamic` | adaptive | similar or better, depends on cost distribution |

---

## Summary Table

| Clause | When to Use | Overhead | Load Balance |
| --- | --- | --- | --- |
| `static` | Uniform iteration cost | Low | Poor (irregular loops) |
| `static, C` | Moderate variation | Low | Medium |
| `dynamic` | Irregular workloads | High | Excellent |
| `guided` | Work decreases over i | Medium | Good |
| `runtime` | Tune experimentally | depends | variable |

---

## Parallel Sections (Functional Parallelism)

While `for` loops distribute *data*,

`sections` distribute *independent functions* or code blocks.

```c
#pragma omp parallel sections
{
  #pragma omp section
  f1 = fun1();

  #pragma omp section
  f2 = fun2();

  #pragma omp section
  f4 = fun4();
}
f3 = fun3(f1,f2);
```

- Each `section` runs in parallel (possibly on different threads).
- Remaining threads idle if fewer sections than threads.
- Execution order **not guaranteed**.

Use when different tasks can execute concurrently (I/O + compute + post-processing).

Not for dependent computations (e.g. `f3` depends on `f1,f2`).

---

### Section Clauses

| Clause | Meaning |
| --- | --- |
| `private(x)` | separate copy per section |
| `firstprivate(x)` | copy of master's value |
| `lastprivate(x)` | value from last section copied back |
| `reduction(op:x)` | combine results across sections |

---

### Rules & Gotchas

- All threads must encounter the same work-sharing construct in identical order.
- Each section must be a self-contained block.
- Cannot use branching logic to selectively enter `sections` or `for` regions:
    
    ```c
    // Wrong
    if (tid == 0) { #pragma omp sections ... }
    else { #pragma omp for ... }
    ```
    
    → results in undefined behaviour.

---

## Other Control Directives

### `single`

Executed by exactly one thread (whichever arrives first).

Implicit barrier at end.

```c
#pragma omp parallel
{
  #pragma omp single
  printf("Initialisation...\n");
}
```

### `master` / `masked`

Executed **only** by master thread (thread 0).

No implicit barrier at end.

`masked` (OpenMP 5) allows filtering (subset of threads).

```c
#pragma omp master
printf("Master thread only\n");
```

---

### Function Safety

When calling functions inside parallel regions:

- Ensure they **don't modify global state** unless protected.
- Stack variables inside the function are private by default.
- Global variables can be made thread-local using `threadprivate`.

Thread-safe = function produces correct results under concurrent calls.

---

## Summary

| Concept | Key Idea | Example |
| --- | --- | --- |
| Loop scheduling | Controls iteration-to-thread mapping | `schedule(dynamic, 4)` |
| Static vs Dynamic | compile-time vs run-time allocation | `static` = cheap, `dynamic` = balanced |
| Guided | Decreasing chunk size | adaptive |
| Runtime | Controlled via env var or API | tuning knob |
| Parallel sections | Functional parallelism | concurrent function calls |
| Single / Master | Serial portions in parallel region | controlled I/O or init |

---

## PX457 Practical Checklist

1. **Benchmark static vs dynamic** for a triangular matrix kernel.
2. **Measure thread imbalance** using timing per thread (`omp_get_wtime()`).
3. **Profile chunk size** to find the optimal trade-off.
4. **Demonstrate functional parallelism** by executing 3–4 expensive functions concurrently.
5. Include commentary on *scheduling overheads vs balance* in your lab report.
