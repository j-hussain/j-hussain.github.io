---
layout: page
title: "OpenMP: Variables and Synchronisation"
---

### *OpenMP 02: Variables and Synchronisation*

---

## Conceptual Focus

Parallelisation introduces **multiple memory contexts**.  Each thread must know:

- which data it can safely modify ( *private* ), and
- which data must remain globally visible ( *shared* ).

Errors here → *race conditions*, *false sharing*, or incorrect results.

---

## Variable Scope

### Default behaviour

```c
#pragma omp parallel default(shared) private(i)
```

or, safer:

```c
#pragma omp parallel default(none) shared(n,a,b) private(i)
```

Always prefer `default(none)` — the compiler forces you to declare every variable's scope explicitly.

| Clause | Meaning |
| --- | --- |
| `shared(list)` | One storage location shared by all threads |
| `private(list)` | Each thread has its own uninitialised copy |
| `firstprivate(list)` | Private + initialised from master copy |
| `lastprivate(list)` | Private + value from last iteration copied back after region |
| `threadprivate(list)` | Global variable replicated per thread (avoid if possible) |

---

## Synchronisation Constructs

### 1. Barriers

All threads stop until everyone reaches the barrier.

Implicit at end of every `parallel` or `for` region.

```c
#pragma omp barrier
```

Add `nowait` on loops to skip the implicit barrier *only if* you are 100 % sure there is no inter-iteration dependency.

### 2. Critical / Atomic / Single

```c
#pragma omp critical
{ /* executed by one thread at a time */ }

#pragma omp atomic
sum += x[i];          // low-overhead for simple ops

#pragma omp single
{ initialise(); }      // exactly one thread executes
```

---

## Parallel `for` Loops

### Valid canonical form

```c
for (i = start; i < end; i += step)
```

- Only one entry & exit point.
- No `break` allowed (use flags instead).
- `continue` permitted.
- Loop bounds and increment must be loop-invariant.

---

## Ordered Execution

Normally, iteration output interleaves arbitrarily:

```c
#pragma omp parallel for
for (int i = 0; i < n; ++i)
  printf("%d\n", i);   // nondeterministic order
```

To enforce sequential order:

```c
#pragma omp parallel for ordered
for (int i = 0; i < n; ++i) {
  compute(i);
  #pragma omp ordered
  printf("%d\n", i);
}
```

Only one `ordered` block per iteration is allowed.

---

## Which Loops Can Be Parallelised?

| Pattern | Parallel-safe? | Why |
| --- | --- | --- |
| `a[i] = a[i] + a[i-1];` | ✗ | dependency on previous iteration |
| `a[i] = a[i] + a[i+n/2];` | ✓ | independent memory locations |
| `a[idx[i]] = a[idx[i]] + b[idx[i]];` | ✓ if `idx` is a permutation | otherwise race on repeated indices |

Before adding `#pragma omp parallel for`, ensure each iteration is **independent** (no write–after-read or write–after-write conflicts).

---

## `lastprivate` and `firstprivate`

### lastprivate – carry last iteration's value out

```c
#pragma omp parallel for private(j) lastprivate(t)
for (int r = 0; r < r_max; ++r) {
  for (int j = 1; j < n; ++j)
    t[j] = t[j-1] * r;
  t_sum[r] = sum(t, n);
}
```

After the loop, the final `t` from iteration `r_max – 1` is visible in the master thread.

### firstprivate – copy master initial value in

```c
t[0] = expensive_init();
#pragma omp parallel for private(j) firstprivate(t)
for (int r = 0; r < r_max; ++r) {
  for (int j = 1; j < n; ++j)
    t[j] = t[j-1] * r;
  t_sum[r] = sum(t, n);
}
```

Prevents recomputation of `t[0]` per thread.

---

## Nested / Compound Loops

Only the outer loop is distributed unless `collapse(n)` is specified.

```c
#pragma omp parallel for shared(m,n) private(i,j,x,y)
for (int i = 0; i < m; ++i)
  for (int j = 0; j < n; ++j)
    work(i,j);
```

Here:

- `m`, `n` → shared
- `i`, `j`, `x`, `y` → private

---

## Summary

| Topic | Key Takeaway |
| --- | --- |
| Variable scope | Declare explicitly; `default(none)` prevents silent bugs. |
| Synchronisation | Use barriers/critical/atomic/single to control access. |
| Loop structure | Must be canonical; ensure iteration independence. |
| Ordered regions | For deterministic output, but slows execution. |
| first/lastprivate | Initialise or propagate values across threads safely. |

---

## Practical Checkpoints for PX457 Labs

1. Compile with `O3 -fopenmp -Wall -Wextra -std=c11`.
2. Use `default(none)` and declare every variable's scope.
3. Measure scaling with and without synchronisation to see cost.
4. Visualise false sharing or ordering effects with micro-benchmarks.
5. When in doubt, add `reduction()` instead of manual accumulation (Lecture 7 topic)
