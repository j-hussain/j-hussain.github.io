---
layout: page
title: "OpenMP: Variables and Synchronisation"
---

Two threads each execute `sum += 1`. Should the sum increase by two? That statement usually means **read, add, write**, not one indivisible action. Both threads can read the old value and then both write the same incremented value. [Work-sharing](/notes/px457/openmp-parallels-work-sharing#work-sharing) assigns iterations; it does not make their memory operations atomic.

<h2 id="ownership">1. Scope describes storage, not permission</h2>

`shared(x)` means references use the original storage. It does not make concurrent updates safe. `private(x)` creates separate storage, ordinarily without copying the original scalar value. Initialising the outer `x` does not initialise each private `x`.

| Clause or directive   | Meaning to preserve                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| `shared(list)`        | Original storage is accessible to the participating threads                                                  |
| `private(list)`       | New per-task storage; ordinary scalar initial value is unspecified                                           |
| `firstprivate(list)`  | New storage initialised from the original value                                                              |
| `lastprivate(list)`   | Copy back from the logically last iteration or lexically last section, rather than the last worker to finish |
| `threadprivate(list)` | Directive making eligible static/global variables thread-local; persistence has conditions                   |

`default(none)` asks the compiler to diagnose variables requiring explicit data-sharing attributes. Predetermined attributes still exist: a loop's induction variable and automatic variables declared inside the region need not all be listed.

```c
/* a and b each have n elements and do not overlap. */
#pragma omp parallel for default(none) shared(n, a, b)
for (int i = 0; i < n; ++i) {
    double x = a[i];
    b[i] = x*x;
}
```

Here `i` and `x` have private storage, while all threads access the same arrays. Safety follows because every output element has exactly one writer and no other iteration reads it while it is being written.

<h2 id="races">2. A race is an ordering failure</h2>

<Figure id="px457-lost-update" title="Two increments, one surviving update" caption="This is a possible read–modify–write interleaving of an unsynchronised shared sum initially zero. It illustrates the bug; it does not define the full range of behaviour permitted by a language with a data race.">
<svg viewBox="0 0 360 185" role="img" aria-label="Thread A reads zero, thread B reads zero, each computes one, then both store one; final sum is one" style={{width: "100%", height: "auto"}}>
<g fill="currentColor" fontSize="13"><text x="15" y="22">thread A</text><text x="205" y="22">thread B</text><text x="15" y="58">read sum = 0</text><text x="205" y="83">read sum = 0</text><text x="15" y="108">write sum = 1</text><text x="205" y="133">write sum = 1</text><text x="15" y="172">time ↓     expected 2; lost update gives 1</text></g>
<path d="M175 35V145" stroke="currentColor" strokeDasharray="4 4"/>
</svg>
</Figure>

The [OpenMP memory model](https://www.openmp.org/spec-html/5.2/openmpsu9.html) specifies that unordered conflicting accesses constitute a data race and make the result unspecified. Different addresses can still share a cache line and suffer [false sharing](/notes/px457/memory-architecture#layout), a performance problem distinct from a race on the same object.

The distinction becomes clearest when we slow one possible interleaving down to individual reads and stores. Compare it with two atomic updates.

<PX457Animation scene="race" />

<h2 id="synchronisation">3. Choose the synchronisation that expresses the dependency</h2>

A **barrier** orders phases: every team member must reach it before any proceeds. An explicit barrier is `#pragma omp barrier`. A parallel region has an end barrier; work-sharing loops and `single` ordinarily have end barriers that can sometimes be removed with `nowait`. A barrier does not make updates that happened before it mutually exclusive.

A **critical region** admits one thread at a time among regions with the same critical name. An **atomic update** protects a supported single-location operation; it does not make a surrounding multi-variable algorithm atomic.

```c
#pragma omp critical(account)
{ /* a transaction requiring several protected accesses */ }

#pragma omp atomic update
sum += contribution;
```

`single` selects one team member to execute a block; it normally has an end barrier. It is useful for one-time initialisation. Removing the barrier is safe only when later work does not require that initialisation to have completed. More generally, `nowait` requires a proof about dependencies **between phases**, not just independence within one loop.

### A reduction expresses ownership and combination

A sum need not pay for a shared atomic update at every element:

```c
double sum = 0.0;
#pragma omp parallel for default(none) shared(n, a) reduction(+:sum)
for (int i = 0; i < n; ++i) sum += a[i];
```

Private partial sums are combined at completion. For real arithmetic,

$$
\sum_{i=0}^{n-1}a_i=\sum_{r=0}^{P-1}\ \sum_{i\in I_r}a_i,
$$

where the $I_r$ partition the iteration set. This is the multi-thread counterpart of [multiple accumulators](/notes/px457/intro-optimisation#chains). The [three-number rounding example](/notes/px457/intro-optimisation#sum-order) shows why this real-arithmetic identity does not guarantee equal floating-point results. Changing team size or reduction tree can change the grouping even in a race-free program. Validate an appropriate error tolerance.

A reduction moves the dependency from every element update to a combination of private results. Follow the same eight contributions through two valid addition trees.

<PX457Animation scene="reduction" />

<h2 id="loops">4. Check memory dependencies, not just loop syntax</h2>

A work-sharing loop must have a supported canonical form with invariant bounds and step, and obey structured-control-flow restrictions. An ordinary `break` is not a way to exit the distributed loop. `continue` can skip the remainder of the current iteration. A shared flag requires synchronisation and does not necessarily cancel work already assigned.

| Pattern                  | Conditions for independent iterations                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `a[i] += a[i-1]`         | Not independent: later iterations need newly written values                                                               |
| `a[i] += a[i+n/2]`       | Safe for even n and `0 <= i < n/2`, with at least n elements; not an unrestricted full-array loop                         |
| `a[idx[i]] += b[idx[i]]` | Distinct target indices, valid bounds, and no read/write aliasing through b; a permutation alone does not settle aliasing |

For nested loops, only the associated outer loop is distributed unless an applicable `collapse(k)` combines iteration spaces. An inner induction variable declared in the loop is local; other scratch state must also have correct scope.

```c
#pragma omp parallel for default(none) shared(m, n, out)
for (int i = 0; i < m; ++i)
    for (int j = 0; j < n; ++j)
        out[i*n+j] = (double)i + j;
```

Assume `out` has room for `m*n` elements and the index product is representable. With rectangular canonical loops, `collapse(2)` can expose more iterations when `m` is small. It can also change locality and scheduling overhead.

<h2 id="private-values">5. Initial and final values belong to logical iterations</h2>

For a fixed-size actual array, `firstprivate` copies its elements. For a pointer, it copies an address, not the allocation. The distinction becomes central in the next dependence chapter.

```c
/* Fixed-size array, not a pointer. Assume rmax > 0. */
double t[8] = {1.0};
double result;
#pragma omp parallel for default(none) shared(rmax) \
    firstprivate(t) lastprivate(result)
for (int r = 0; r < rmax; ++r) {
    for (int j = 1; j < 8; ++j) t[j] = t[j-1] * r;
    result = t[7];
}
```

Each thread's `t[0]` starts at one and the remaining entries are assigned before use in every iteration. `result` after the loop comes from `rmax-1`, even if an earlier iteration finishes later. `lastprivate(t)` could instead copy the whole final array. Merely declaring an uninitialised `private(t)` and reading `t[0]` would be wrong. For a zero-trip loop, there is no final iteration to supply a new result; handle that case separately.

### Order only the part that needs order

```c
#pragma omp parallel for ordered
for (int i = 0; i < n; ++i) {
    compute(i);
    #pragma omp ordered
    printf("%d\n", i);
}
```

For this ordinary ordered-loop pattern, every iteration encounters the same ordered region once. It prints in logical iteration order while independent computation can overlap. Newer dependence-based ordered constructs have additional rules; the simple example is not a statement that every OpenMP ordered facility has identical restrictions.

### Exercises and continuation

1. Explain why placing a barrier after unsynchronised increments does not fix the increments.
2. Compare serial, atomic and reduction sums. Check both accuracy and elapsed time; exclude printing.
3. Construct a case where two individually independent loops still require the implicit barrier between them.
4. Replace an array by a pointer in the `firstprivate` example and identify exactly what ceased to be private.

Once each iteration is correct in isolation and its dependencies are respected, performance depends on which thread receives which work. [Scheduling](/notes/px457/openmp-loop-scheduling) makes that assignment explicit.
