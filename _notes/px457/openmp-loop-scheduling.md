---
layout: page
title: "OpenMP: Loop Scheduling and Load Balancing"
---

Four workers each receive two iterations. Their workloads are $15,11,7,3$ time units. The iteration counts are perfectly balanced; the completion times are not. Once [correct ownership](/notes/px457/openmp-variables-synchronisation#loops) is established, the next question is how to assign work so that the last worker finishes sooner.

<h2 id="balance">1. Completion time follows the longest load</h2>

Let iteration $i$ cost $c_i\ge0$, independently of placement, and let $I_r$ be the iterations assigned to thread $r$. In a model without scheduling or memory overhead,

$$
W_r=\sum_{i\in I_r}c_i,\qquad
T=\max_r W_r\ge\frac1P\sum_i c_i.
$$

The mean load is a lower bound because at least one worker must carry at least that mean. Equal iteration counts attain the bound only when costs are suitably balanced.

For the source's triangular kernel, take $N=8$ and cost $c_i=N-i$:

```c
#pragma omp parallel for schedule(static)
for (int i = 0; i < N; ++i)
    for (int j = i; j < N; ++j) A[i][j] = heavy_fn(i,j);
```

Assume all calls have equal cost and each output element is independent. Contiguous two-row blocks produce loads $(15,11,7,3)$. Cyclic assignment produces $(12,10,8,6)$. Total work is $36$ in either case; the model's completion time falls from $15$ to $12$, still above the ideal $9$.

<Figure id="px457-schedule-loads" title="Equal counts are not equal work" caption="Four threads, eight rows, costs 8 through 1. Solid bars are contiguous two-row blocks; outlined bars are cyclic assignment. Both have the same total work. Horizontal lengths share one scale, in abstract time units; no machine timings are shown.">
<svg viewBox="0 0 360 235" role="img" aria-label="Thread loads: contiguous 15 11 7 3; cyclic 12 10 8 6, with a common zero to fifteen scale" style={{width: "100%", height: "auto"}}>
<g fill="currentColor" fontSize="13"><text x="12" y="23">solid: contiguous · outline: cyclic</text><text x="12" y="56">T0</text><text x="12" y="103">T1</text><text x="12" y="150">T2</text><text x="12" y="197">T3</text></g>
<g fill="var(--sci-accent)"><rect x="50" y="38" width="240" height="14"/><rect x="50" y="85" width="176" height="14"/><rect x="50" y="132" width="112" height="14"/><rect x="50" y="179" width="48" height="14"/></g>
<g fill="none" stroke="currentColor"><rect x="50" y="56" width="192" height="14"/><rect x="50" y="103" width="160" height="14"/><rect x="50" y="150" width="128" height="14"/><rect x="50" y="197" width="96" height="14"/></g>
<g fill="currentColor" fontSize="12"><text x="295" y="50">15</text><text x="247" y="68">12</text><text x="231" y="97">11</text><text x="215" y="115">10</text><text x="167" y="144">7</text><text x="183" y="162">8</text><text x="103" y="191">3</text><text x="151" y="209">6</text><text x="50" y="231">0</text><text x="280" y="231">15 units</text></g>
</svg>
</Figure>

Let the workers execute those exact assignments. The moment the final bar fills is the completion time in this model.

<PX457Animation scene="scheduling" />

### Why cyclic placement narrows the load gap

The eight-row example extends exactly when $N=mP$ for positive integers $m,P$, so each worker owns $m$ rows. For worker $r\in\{0,\ldots,P-1\}$, contiguous placement gives rows $rm,\ldots,rm+m-1$ and load

$$
W_r^{\mathrm{contiguous}}
=\sum_{k=0}^{m-1}(N-rm-k)
=m(N-rm)-\frac{m(m-1)}2.
$$

Cyclic placement instead gives rows $r,r+P,\ldots,r+(m-1)P$:

$$
W_r^{\mathrm{cyclic}}
=\sum_{k=0}^{m-1}(N-r-kP)
=m(N-r)-\frac{Pm(m-1)}2.
$$

Both loads decrease with $r$. Their largest-to-smallest gaps are respectively $m^2(P-1)$ and $m(P-1)$. Cyclic placement narrows this gap by a factor of $m$: each worker receives a mixture of early expensive and late cheap rows. For $P>1$ the cyclic gap is still positive, so the longest load still exceeds the mean. Setting $m=2,P=4$ recovers the figure's two lists. These formulas assume the stated cost model; they do not include the locality or queue costs we now examine.

<h2 id="policies">2. Scheduling trades information for overhead</h2>

**`schedule(static)`** assigns approximately equal contiguous portions without a runtime work queue; exact boundaries need not be identical across implementations. **`schedule(static,C)`** divides iterations into chunks of $C$ and assigns chunks round-robin in thread-number order. For predictable smoothly changing costs, `static,1` can improve balance cheaply. But neighbouring writes by different threads may increase false sharing, and contiguous blocks may have better cache/NUMA locality.

**`schedule(dynamic,C)`** lets a thread obtain another chunk when it completes its current chunk. Smaller chunks give more opportunities to rebalance, but require more scheduling operations and may weaken locality. The default dynamic chunk size is one. A single extremely expensive iteration remains indivisible and can dominate completion time.

**`schedule(guided,C)`** starts with larger chunks and decreases chunk sizes toward a minimum of $C$ (the final remainder can be smaller). Exact chunk sequences are implementation-dependent. Guided scheduling can reduce queue overhead, but an early expensive chunk can still create imbalance. It is not guaranteed to outperform dynamic scheduling for a cost decreasing with index.

If no schedule clause appears, the schedule is implementation-defined; do not call it universally static or determined at compile time. Static assignment is cheap because its mapping can be established when the loop is encountered, including with runtime bounds.

### Tune without rebuilding

```c
#pragma omp parallel for schedule(runtime)
for (int i = 0; i < N; ++i) work(i);
```

```bash
export OMP_SCHEDULE="dynamic,4"
```

The runtime schedule can also be set and queried:

```c
omp_sched_t kind;
int chunk;
omp_set_schedule(omp_sched_static, 4);
omp_get_schedule(&kind, &chunk);
```

Keep the relevant runtime setting consistent across threads participating in the work-sharing loop. Record the actual environment in an experiment.

A useful qualitative model is

$$
T\approx\max_r W_r+T_{\mathrm{queue}}+T_{\mathrm{locality}}+T_{\mathrm{sync}}.
$$

The terms can overlap in real execution; the expression is a diagnostic decomposition, not an exact additive law. Reducing the longest load can lose overall if queue or data-movement costs grow more.

A smaller chunk is a smaller indivisible commitment, but acquiring it also takes work. The next model gives every dispatch an explicit cost so that both effects remain visible.

<PX457Animation scene="chunks" />

<h2 id="sections">3. Different functions can be independent work too</h2>

A loop partitions one repeated operation. `sections` instead assigns a fixed set of structured blocks:

```c
#pragma omp parallel sections
{
    #pragma omp section
    { f1 = fun1(); }
    #pragma omp section
    { f2 = fun2(); }
    #pragma omp section
    { f4 = fun4(); }
}
f3 = fun3(f1, f2);
```

Each section executes once, but different sections are not guaranteed to run simultaneously or on different threads. Assume `fun1`, `fun2` and `fun4` have no conflicting side effects and their outputs are distinct. The end barrier makes `f1,f2` available before `fun3`. Placing `fun3` inside a peer section would lose that dependency.

A long section limits completion time; extra threads cannot divide it automatically. `private` and `firstprivate` create task/thread-local state, not an independently initialised object for every section. One thread can execute several sections. `lastprivate` follows the lexically last section; reductions combine supported section contributions.

All participating threads must encounter compatible work-sharing constructs in the same sequence. Do not have thread zero enter `sections` while another enters `for`. Neither is a private work queue that a subset of the team can independently invoke.

<h2 id="serial-regions">4. One execution is different from one named thread</h2>

`single` chooses one thread to execute the block and normally has an end barrier. It need not be whichever thread first arrives in any specified sense. `master` selects the primary thread and has no implicit barrier. In newer OpenMP, `masked` without a filter also selects the primary thread; filtered forms have their own selection rules and compiler-support requirements.

```c
#pragma omp parallel
{
    #pragma omp single
    { initialise_shared_state(); }
    /* The implicit barrier publishes initialisation before use. */
    use_shared_state();
}
```

A function called by multiple threads must itself be thread-safe. Ordinary local automatic variables are separate per invocation, but static locals, globals, shared allocations and external-library state may still conflict. `threadprivate` is a directive for eligible persistent objects, not a remedy for arbitrary shared state.

### Exercises and continuation

1. Reproduce the exact triangular loads above. Why does cyclic assignment improve but not perfect the balance?
2. Time static, cyclic, dynamic and guided policies for a triangular kernel. Vary chunk size and report per-thread finish times as well as overall time.
3. Construct a workload where dynamic scheduling balances better but runs slower because each iteration is tiny.
4. Draw the dependency graph for the four functions above. Which edge is implemented by the end barrier?

Scheduling can change who runs an iteration, but cannot make dependent iterations independent. [Dependences and nested parallelism](/notes/px457/openmp-dependencies) examines when the computation itself can be reorganised.

### Reference

[OpenMP 5.2 specification](https://www.openmp.org/spec-html/5.2/openmp.html), loop scheduling and work-sharing sections; consult the teaching compiler's supported version.
