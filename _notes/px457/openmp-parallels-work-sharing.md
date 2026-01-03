---
layout: page
title: "OpenMP: Parallels and Work Sharing"
---

## Conceptual Overview

### Why OpenMP?

- Modern CPUs no longer get much faster per core → the only route to higher throughput is **parallelism**.
- **OpenMP** ("Open Specifications for Multi-Processing") is a **shared-memory** parallel programming API that:
    - adds compiler directives (e.g. `#pragma omp parallel`),
    - exposes runtime library functions (`omp_get_num_threads()`),
    - and uses environment variables (`OMP_NUM_THREADS`) to control execution.

Used mainly for *multi-core CPUs*, it complements MPI (distributed memory) and CUDA (GPUs).

---

## Programming Model

| Concept | Meaning |
| --- | --- |
| **Master thread** | The single thread that begins execution. |
| **Fork** | Creation of a team of threads at a `parallel` region. |
| **Join** | Synchronisation where threads finish and control returns to the master. |
| **Thread** | The smallest independent sequence of instructions scheduled by the OS. |

Execution alternates between **serial regions** (one thread) and **parallel regions** (multiple threads):

```
Serial → Fork → Parallel region → Join → Serial → …
```

---

## Core Compiler Directives

### In C / C++

```c
#pragma omp parallel default(shared) private(x, y)
```

### In Fortran

```fortran
!$omp parallel default(shared) private(x, y)
!$omp end parallel
```

- Lines beginning with `#pragma omp` (C) or `!$omp` (Fortran) are ignored by compilers that lack OpenMP support — meaning the code still runs sequentially.
- Directives apply to the next **structured block** (`{...}` in C, `do`/`end do` pair in Fortran).

---

## Example – Parallel Hello World

```c
#include <omp.h>
int main() {
  int nthreads, tid;
  #pragma omp parallel private(tid)
  {
    tid = omp_get_thread_num();
    printf("Hello world from thread %d\n", tid);
    if (tid == 0) {
      nthreads = omp_get_num_threads();
      printf("Number of threads = %d\n", nthreads);
    }
  }
}
```

Key runtime calls:

- `omp_get_thread_num()` → returns current thread ID
- `omp_get_num_threads()` → returns team size

---

## Controlling the Number of Threads

Three equivalent mechanisms:

1. Environment variable:
    
    ```bash
    export OMP_NUM_THREADS=8
    ```
    
2. Library call inside program:
    
    ```c
    omp_set_num_threads(8);
    ```
    
3. Clause on directive:
    
    ```c
    #pragma omp parallel num_threads(8)
    ```

Default = number of physical cores.

---

## Parallel Regions vs Work-Sharing

| Directive | Effect | Example Output |
| --- | --- | --- |
| `#pragma omp parallel` | All threads execute the *entire* block. Work is **replicated**. | `P × N` messages |
| `#pragma omp parallel for` | Threads divide loop iterations among themselves. Work is **shared**. | `N` messages total |

```c
#pragma omp parallel for
for (int i=0; i<10; i++)
  printf("Hello world %d\n", i);
```

Each iteration is independent ⇒ safe for concurrent execution.

With `for`/`do`, loop index `i` is *private* by default.

---

## Conditional Compilation

To compile OpenMP-specific code only when enabled:

```c
#ifdef _OPENMP
  printf("Compiled with OpenMP\n");
#endif
```

---

## Summary

| Topic | Key Idea |
| --- | --- |
| Motivation | Serial CPU performance has plateaued — need thread-level parallelism. |
| Model | Fork–Join, shared-memory threads. |
| API Components | Compiler directives, runtime library, environment variables. |
| Work-sharing | `parallel for/do` splits independent iterations across threads. |
| Thread control | `OMP_NUM_THREADS`, `omp_set_num_threads()`, `num_threads()` clause. |
| Compilation safety | `#ifdef _OPENMP` guards. |

---

## Takeaway for PX457 Assignments

When benchmarking, you should:

1. Compile with `fopenmp` (GCC/Clang) or `/openmp` (MSVC).
2. Verify scaling by timing loops with different `OMP_NUM_THREADS`.
3. Check for **data dependencies** — OpenMP will not protect you from race conditions.
4. Use `private`, `shared`, `reduction`, and `schedule` clauses properly when analysing loop performance.
