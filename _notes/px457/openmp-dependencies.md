---
layout: page
title: "OpenMP: Dependences and Nested Parallelism"
---

A scheduler can move an iteration to an idle worker; it cannot supply a value that has not yet been computed. The next step after [load balancing](/notes/px457/openmp-loop-scheduling#balance) is therefore to identify which orderings belong to the mathematics and which arise only from reuse of storage.

<h2 id="dependences">1. Draw an edge whenever order matters</h2>

A **flow dependence** (read after write) carries a value from a producer to a consumer. An **anti-dependence** (write after read) protects an old value from being overwritten too soon. An **output dependence** (write after write) determines which write survives. Conflicting accesses within a single iteration can be ordered normally; the challenge is an edge crossing iterations.

### Move the consumer next to its producer

For $n\ge2$ and nonoverlapping arrays with at least $n$ elements, consider the source example:

```c
for (int i = 1; i < n; ++i) {
    b[i] += a[i-1];
    a[i] += c[i];
}
```

Iteration $i+1$ reads the `a[i]` updated by iteration $i$. Directly parallelising the loop changes which value is read. Reindex the consumer instead:

```c
b[1] += a[0];
#pragma omp parallel for
for (int i = 1; i < n-1; ++i) {
    a[i] += c[i];
    b[i+1] += a[i];
}
a[n-1] += c[n-1];
```

Now each producer and consumer are in the same iteration. The boundary statements supply the unmatched first consumer and final producer. This is a dependence-preserving loop transformation, sometimes described here as shifting/skewing the iteration alignment. It works because different iterations otherwise touch disjoint elements; it is not a recipe for eliminating arbitrary recurrences.

<Figure id="px457-dependence" title="Move an edge inside one work unit" caption="Originally update a[i] supplies the next iteration's b[i+1]. After reindexing, each pair is one work unit. The edge is preserved; only its position relative to iteration boundaries changes. Boundary operations remain explicit in the code.">
<svg viewBox="0 0 360 175" role="img" aria-label="Original flow edge crosses iteration i to iteration i plus one; transformed pair contains producer and consumer together" style={{width: "100%", height: "auto"}}>
<g fill="none" stroke="currentColor"><rect x="10" y="35" width="140" height="44"/><rect x="205" y="35" width="145" height="44"/><path d="M151 57H201 M194 51L201 57L194 63"/><rect x="50" y="116" width="260" height="42" strokeDasharray="4 3"/></g>
<g fill="currentColor" fontSize="13"><text x="12" y="23">original: edge crosses work units</text><text x="23" y="61">update a[i]</text><text x="218" y="61">use in b[i+1]</text><text x="12" y="103">transformed: preserve order locally</text><text x="65" y="142">update a[i] → use in b[i+1]</text></g>
</svg>
</Figure>

Follow one produced value while the work-unit boundaries change. The transformation must move the consumer without reversing the value dependency.

<PX457Animation scene="dependence" />

### Preserve an old value by copying it

```c
/* a has n+1 elements; b and c have n, without aliasing. */
for (int i = 0; i < n; ++i) {
    double x = (b[i] + c[i]) / 2.0;
    a[i] = a[i+1] + x;
}
```

Sequentially, `a[i+1]` is read before the next iteration overwrites it. A snapshot removes that anti-dependence:

```c
for (int i = 0; i < n; ++i) a2[i] = a[i+1];
#pragma omp parallel for
for (int i = 0; i < n; ++i)
    a[i] = a2[i] + (b[i] + c[i]) / 2.0;
```

Assume `a2` is a distinct allocated array of length `n`; copying completes before the parallel loop. The extra memory and traffic may outweigh any speedup. This is the same principle as using separate old/new fields in a stencil.

### Preserve the final writer explicitly

```c
/* n > 0, arrays valid and nonoverlapping. */
double tmp;
#pragma omp parallel for lastprivate(tmp)
for (int i = 0; i < n; ++i) {
    double x = (b[i] + c[i]) / 2.0;
    a[i] += x;
    tmp = 2.0*x;
}
d[0] = tmp;
```

The sequential version wrote `d[0]` on every iteration. Only its final value matters if there are no intervening readers or observable side effects. `lastprivate` preserves that value without concurrent writes to `d[0]`. For `n=0`, skip the assignment so the original `d[0]` remains unchanged. Do not list `tmp` in both `private` and `lastprivate`: the latter already provides private storage.

<h2 id="scan">2. Expansion exposes a recurrence; it does not abolish it</h2>

The source combines a running sum with an independent element update:

```c
for (int i = 0; i < n; ++i) {
    y += a[i];
    b[i] = (b[i] + c[i]) * y;
}
```

The required value is a prefix sum,

$$
y_i=y_{\mathrm{initial}}+\sum_{k=0}^{i}a_k.
$$

Store those values, then use them independently:

```c
if (n > 0) {
    double *y2 = malloc((size_t)n * sizeof *y2);
    if (y2 == NULL) abort();
    y2[0] = y + a[0];
    for (int i = 1; i < n; ++i) y2[i] = y2[i-1] + a[i];
    y = y2[n-1];
    #pragma omp parallel for
    for (int i = 0; i < n; ++i) b[i] = (b[i] + c[i]) * y2[i];
    free(y2);
}
```

Include `stdlib.h` and check allocation-size representability in production. Assume distinct arrays and `n>=0`. This scalar expansion and loop fission parallelises the **second** phase. The first phase still has a serial recurrence; prefix-scan algorithms can reduce its span by changing association. Their floating-point outputs may differ from the sequential scan. The original summation order is retained in the code above.

<h2 id="pointers">3. A pointer is a value, its allocation is another object</h2>

`private(ptr)` normally gives an uninitialised private pointer, not a copy of the original address. `firstprivate(ptr)` copies the address, leaving the allocation shared. Neither creates independent scratch data.

```c
#pragma omp parallel
{
    double *scratch = malloc((size_t)n * sizeof *scratch);
    if (scratch == NULL && n > 0) abort();
    /* Initialise scratch before reading it. Use only within its lifetime. */
    use_scratch(scratch, n);
    free(scratch);
}
```

This fragment assumes a valid allocation size and a thread-safe `use_scratch`. Each allocation is distinct and is released after its final use. Allocate once per thread, rather than once per element, when scratch buffers are repeatedly reused.

<h2 id="relaxation">4. Relaxed numerical order still requires legal memory access</h2>

The source called multiple writes of `found=1` a “benign race”. Equal values do not remove the race. If no thread needs to observe the flag early, a reduction expresses the required existence test:

```c
int found = 0;
#pragma omp parallel for reduction(|:found)
for (int i = 0; i < n; ++i)
    found |= (a[i] > threshold);
```

The final integer is one if any test succeeds. An atomic write is another option if all accesses obey the required synchronisation, but a reduction avoids concurrent shared updates here.

The source's in-place two-dimensional relaxation also has dependencies:

$$
a_{ij}\leftarrow\frac{a_{ij}+a_{i,j-1}+a_{i,j+1}+a_{i-1,j}+a_{i+1,j}}5.
$$

A sequential sweep consumes a mixture of new and old values. Naively adding a parallel directive creates conflicting accesses, not a justified asynchronous solver. A two-buffer Jacobi-style update instead reads only an immutable old field:

```c
#pragma omp parallel for
for (int i = 1; i < n-1; ++i)
    for (int j = 1; j < n-1; ++j)
        next[i][j] = (old[i][j] + old[i][j-1] + old[i][j+1]
                    + old[i-1][j] + old[i+1][j]) / 5.0;
```

Keep boundary values defined in both buffers and swap only after the update completes. This changes the iteration scheme. Its fixed-point equation in the interior is $4a_{ij}=a_{i,j-1}+a_{i,j+1}+a_{i-1,j}+a_{i+1,j}$, but matching fixed points does not establish matching convergence rates or convergence under arbitrary boundary conditions. In the linear form $x^{k+1}=Gx^k+c$, convergence for every initial guess follows from $\rho(G)<1$. Legal asynchronous methods require additional convergence assumptions and synchronised/atomic accesses appropriate to their implementation. The [OpenMP memory model](https://www.openmp.org/spec-html/5.2/openmpsu9.html) supplies no exception for a race thought harmless by the programmer.

<h3 id="boundary-convergence">What makes this particular two-buffer method converge?</h3>

Suppose there are $m\times m$ interior points, $m\ge1$, surrounded by fixed Dirichlet boundary values. Subtract a fixed-point field from an iterate. The error $e^k$ is zero on the boundary and obeys the same five-point averaging rule in the interior. Hence

$$
\|e^{k+1}\|_\infty\le\|e^k\|_\infty,
\qquad \|e\|_\infty=\max_{i,j}|e_{ij}|.
$$

Nonincrease alone is not convergence to zero. Start with error one at every interior point. After one step, a point whose four neighbours are interior still has error one. The boundary must influence it before its error shrinks. With periodic boundaries, a constant error has no boundary to encounter and persists indefinitely.

<Figure id="px457-boundary-error" title="The boundary removes an error mode" caption="Both grids start with interior error 1. One two-buffer averaging step on a 3×3 interior gives 0.6 at corners, 0.8 at edge centres and 1 at the centre when the surrounding error is fixed at zero. Periodic boundaries preserve the constant error 1 everywhere. These are exact model values, not execution timings or an in-place sweep.">
<svg viewBox="0 0 360 205" role="img" aria-label="One step from constant interior error one: fixed zero boundary gives rows 0.6 0.8 0.6, 0.8 1 0.8, 0.6 0.8 0.6; periodic boundary leaves all nine entries one" style={{width: "100%", height: "auto"}}>
<g fill="none" stroke="currentColor"><path d="M15 40H150V148H15Z M15 76H150 M15 112H150 M60 40V148 M105 40V148"/><path d="M200 40H335V148H200Z M200 76H335 M200 112H335 M245 40V148 M290 40V148" strokeDasharray="4 3"/></g>
<g fill="currentColor" fontSize="13"><text x="15" y="23">boundary error 0</text><text x="200" y="23">periodic boundary</text><text x="15" y="177">centre waits for</text><text x="15" y="195">boundary influence</text><text x="200" y="177">constant error</text><text x="200" y="195">never shrinks</text></g>
<g fill="var(--sci-accent)" fontSize="14" textAnchor="middle"><text x="37" y="63">0.6</text><text x="82" y="63">0.8</text><text x="127" y="63">0.6</text><text x="37" y="99">0.8</text><text x="82" y="99">1</text><text x="127" y="99">0.8</text><text x="37" y="135">0.6</text><text x="82" y="135">0.8</text><text x="127" y="135">0.6</text></g>
<g fill="currentColor" fontSize="14" textAnchor="middle"><text x="222" y="63">1</text><text x="267" y="63">1</text><text x="312" y="63">1</text><text x="222" y="99">1</text><text x="267" y="99">1</text><text x="312" y="99">1</text><text x="222" y="135">1</text><text x="267" y="135">1</text><text x="312" y="135">1</text></g>
</svg>
</Figure>

For fixed Dirichlet values we can prove more than nonincrease. Expand an error after $m$ steps backwards through the averaging operations. Each step assigns weight $1/5$ to the current point and each neighbour. From every interior point there is a path of at most $m$ neighbour steps to the zero-error boundary. That path carries at least $5^{-m}$ of the weight and contributes zero. All remaining weights are nonnegative, with sum at most $1-5^{-m}$. Therefore

$$
\|e^{k+m}\|_\infty
\le (1-5^{-m})\|e^k\|_\infty.
$$

Equivalently, the affine update applied $m$ times is a contraction on the finite interior field. It has a unique fixed point; that point is also fixed by one update, since applying one update maps an $m$-step fixed point to another. Repeated blocks of $m$ steps contract by a factor strictly below one, and intervening steps cannot enlarge the error. Thus the two-buffer method converges to the unique fixed point for these boundary conditions in exact arithmetic. The bound is deliberately loose; it proves convergence without predicting a useful iteration count. Floating-point iteration still needs a residual tolerance and a stagnation check.

This proof depends on the immutable old field and the boundary condition. It proves neither the rate of an in-place sweep nor the validity of unsynchronised concurrent reads and writes. The distinction will matter again when [MPI exchanges copies of boundary data](/notes/px457/mpi-advanced#overlap).

The convergence proof explains why boundary influence eventually reaches every point. Watch that influence propagate over several discrete two-buffer steps, then remove the fixed boundary.

<PX457Animation scene="relaxation" />

<h2 id="nesting">5. Nested teams add another resource constraint</h2>

```c
#pragma omp parallel num_threads(2)
{
    work_A();
    #pragma omp parallel num_threads(4)
    { work_B(); }
}
```

Each outer thread encounters its own inner parallel region. If both inner teams are active with four members, there are eight participating inner threads in total; the outer threads also participate as their inner teams' primary threads. Calls are replicated according to this structure: `work_A` runs twice and `work_B` eight times in that case. This is not automatically a partition of either function's work.

```bash
export OMP_MAX_ACTIVE_LEVELS=2
```

`omp_set_max_active_levels(2)` sets the corresponding control programmatically; `omp_get_level()` reports nesting and `omp_get_active_level()` distinguishes active parallel levels. Legacy `OMP_NESTED`/`omp_set_nested` are deprecated. Resource limits can serialise inner regions or reduce team sizes; inspect actual sizes. Oversubscription can make nested execution slower. A single team with tasks or collapsed loops is sometimes a better design.

### Exercises and continuation

1. Verify the shifted producer/consumer loop for `n=2,3` before timing larger inputs. Which aliases would invalidate the proof?
2. Explain why the scan expansion exposes parallel work but leaves a serial bottleneck.
3. Compare two-buffer and sequential in-place relaxation using the same boundary data and residual stopping criterion. Distinguish a fixed point from the path to it.
4. Inspect actual outer/inner team sizes and active levels; do not infer them from requested values.

OpenMP let us change execution while retaining shared storage. [MPI](/notes/px457/mpi-intro) changes the premise: another process's value is unavailable until we explicitly communicate it.
