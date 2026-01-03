---
layout: page
title: "OpenMP: Dependencies and Nested Parallelism"
---

### *OpenMP 05: Dependences and Nested Parallelism*

---

## Conceptual Focus

Parallelisation isn't only about dividing work — you must ensure **independent execution**.

This lecture covers:

1. How **data dependences** break safe parallelism and how to remove them.
2. When a **data race is harmless** (relaxed algorithms).
3. How **nested parallelism** allows hybrid combinations of data- and function-level concurrency.

---

## Data Dependences in Loops

### 1. Flow (true) dependence

> Earlier iteration writes, later iteration reads the same memory.
> 
> Must preserve order → usually cannot parallelise directly.

```c
for (int i=1; i<n; ++i) {
  b[i] += a[i-1];   // read from previous iteration
  a[i] += c[i];     // write current element
}
```

**Fix via loop skewing:**

```c
b[1] += a[0];
for (int i=1; i<n-1; ++i) {
  a[i] += c[i];
  b[i+1] += a[i];
}
a[n-1] += c[n-1];
```

Each iteration now uses data computed *within* that same iteration.

---

### 2. Anti-dependence

> Earlier iteration reads, later iteration writes to the same location.
> 
> Not a true dependence — just memory reuse.

```c
for (int i=0; i<n; ++i) {
  x = (b[i] + c[i]) / 2;
  a[i] = a[i+1] + x;   // later iteration will overwrite a[i+1]
}
```

**Fix:** duplicate read array.

```c
for (int i=0; i<n; ++i) a2[i] = a[i+1];
#pragma omp parallel for private(x)
for (int i=0; i<n; ++i) a[i] = a2[i] + (b[i]+c[i])/2;
```

---

### 3. Output dependence

> Multiple iterations write to the same location.

```c
for (int i=0; i<n; ++i) {
  x = (b[i] + c[i]) / 2;
  a[i] += x;
  d[0] = 2*x;  // shared target
}
```

**Fix:** use a temporary and `lastprivate`.

```c
#pragma omp parallel for private(x,tmp) lastprivate(tmp)
for (int i=0; i<n; ++i) {
  x = (b[i] + c[i]) / 2;
  a[i] += x;
  tmp = 2*x;
}
d[0] = tmp;
```

---

## Scalar Expansion and Loop Fission

Sometimes a variable accumulates over iterations and is later reused:

```c
for (int i=0; i<n; ++i) {
  y += a[i];
  b[i] = (b[i]+c[i]) * y;
}
```

**Split (fission) and expand:**

```c
double *y2 = malloc(n * sizeof *y2);
y2[0] = y + a[0];
for (int i=1; i<n; ++i) y2[i] = y2[i-1] + a[i];
y = y2[n-1];

#pragma omp parallel for shared(b,c,y2)
for (int i=0; i<n; ++i)
  b[i] = (b[i]+c[i]) * y2[i];
free(y2);
```

→ The dependence on `y` is removed; the second loop is parallelisable.

---

## Pointer Pitfalls and Data Races

Declaring a pointer as `private` does **not** copy its contents — just the pointer value.

Threads still reference the same memory → data race.

Allocate inside the parallel region for truly independent buffers.

Always `free()` within the same region to avoid leaks.

---

## Relaxed Algorithms (When Races Don't Matter)

Sometimes correctness ≠ bitwise reproducibility.

### Example 1 — Flagging condition

```c
int found = 0;
#pragma omp parallel for
for (int i=0; i<n; ++i)
  if (a[i] > threshold) found = 1;   // race, but benign
```

Any thread setting `found = 1` suffices — exact timing irrelevant.

### Example 2 — Iterative relaxation

```c
for (int i=1; i<n-1; ++i)
  for (int j=1; j<n-1; ++j)
    a[i][j] = (a[i][j] + a[i][j-1] + a[i][j+1]
              + a[i-1][j] + a[i+1][j]) / 5.0;
```

Parallel updates cause small differences but converge to the same steady state.

Used in *Jacobi* or *heat-diffusion* methods.

Do not apply this to non-convergent schemes (e.g. explicit integrators).

---

## Nested Parallelism

### Concept

OpenMP allows **parallel regions inside parallel regions**.

```c
#pragma omp parallel num_threads(2)
{
  work_A();

  #pragma omp parallel num_threads(4)
  work_B();   // each of the 2 threads spawns 4 subthreads
}
```

Each outer thread becomes a *team leader* for its own sub-team.

Useful for combining **functional** and **data** parallelism.

---

### Control of Nesting Depth

| Method | Example | Meaning |
| --- | --- | --- |
| Environment variable | `export OMP_MAX_ACTIVE_LEVELS=2` | allow 2 nested levels |
| API call | `omp_set_max_active_levels(2);` | same, programmatic |
| Deprecated | `OMP_NESTED=TRUE`, `omp_set_nested()` | legacy, avoid |

Beyond the allowed depth, additional `parallel` regions run serially.

---

## Summary

| Topic | Idea | Fix / Usage |
| --- | --- | --- |
| Flow dep. | later reads earlier write | loop skewing |
| Anti dep. | later writes earlier read | duplicate read array |
| Output dep. | multiple writes | temporary + `lastprivate` |
| Scalar expansion | convert scalar recurrence to array | parallel second loop |
| Pointer races | private pointer ≠ private data | allocate per-thread |
| Relaxed algos | data races tolerated | e.g. convergence loops |
| Nested parallelism | parallel within parallel | control via `OMP_MAX_ACTIVE_LEVELS` |

---

## PX457 Implementation Advice

1. **Demonstrate dependency removal** with before/after code and runtime.
2. **Quantify performance** vs. correctness (float drift, convergence).
3. **Experiment with nested regions:** run `num_threads(2)` + `num_threads(4)` and measure total utilisation.
4. **Use `omp_get_level()`** to verify current nesting depth during experiments.
5. Document any race-tolerant algorithm clearly — justify why it's *mathematically safe*.
