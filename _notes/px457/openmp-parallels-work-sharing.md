---
layout: page
title: "OpenMP: Parallel Regions and Work Sharing"
---

Suppose a loop has one million independent iterations. Giving four threads the source code does not, by itself, divide the iterations into four parts. Each thread might run the entire loop. The distinction between **creating workers and assigning work** is the first idea to make precise in OpenMP.

The [memory chapter](/notes/px457/memory-architecture#models) distinguished shared and distributed address spaces. OpenMP begins with threads in one process sharing memory. Its API consists of compiler directives, runtime routines and environment variables. It is commonly used for multicore CPUs and also includes device-offload facilities beyond this chapter's scope.

<h2 id="teams">1. A parallel region creates a team</h2>

The initial thread executes serial code. On encountering a `parallel` construct, it forms a team and participates as thread zero, the **primary thread** (called “master” in older material). Every team member executes the region's structured block. At its end the team synchronises, and the encountering thread continues.

```text
one thread → fork → team executes region → join → one thread
```

This is a logical execution model; a runtime may reuse operating-system threads rather than create and destroy them at every fork/join.

In C/C++ directives begin `#pragma omp`; in Fortran, `!$omp`:

```c
#pragma omp parallel default(shared) private(x, y)
{
    /* Every thread executes this block; x and y are per-thread. */
}
```

```fortran
!$omp parallel default(shared) private(x, y)
! work executed by each thread
!$omp end parallel
```

These are directive fragments; `x,y` must be declared in the enclosing scope. A work-sharing loop has its own loop syntax and constraints. Disabling directive support does not automatically make calls to the OpenMP runtime disappear: those calls still require appropriate linking or conditional compilation.

A team is an execution structure. Follow the initial thread through a complete region, including the point at which it must wait for the others.

<PX457Animation scene="fork" />

<h2 id="hello">2. Observe the team before assigning useful work</h2>

```c
#include <stdio.h>
#include <omp.h>

int main(void) {
    #pragma omp parallel
    {
        int tid = omp_get_thread_num();
        int count = omp_get_num_threads();
        printf("Hello from thread %d of %d\n", tid, count);
    }
    return 0;
}
```

`tid` and `count` are declared inside the block, so each thread has its own automatic objects. `omp_get_thread_num()` is a team-local ID in $[0,P)$; `omp_get_num_threads()` reports that team's actual size. Output order is unspecified. Printing is useful for diagnosis, but distorts a performance measurement.

For a GCC installation with OpenMP support:

```bash
gcc -O2 -fopenmp hello.c -o hello
OMP_NUM_THREADS=4 ./hello
```

Clang needs a compatible OpenMP runtime installed; supported flags and features differ across compilers. Three ways to request team sizes are:

```bash
export OMP_NUM_THREADS=8
```

```c
omp_set_num_threads(8);              /* affects subsequent regions */
#pragma omp parallel num_threads(8) /* applies to this region */
{ /* work */ }
```

These mechanisms have different scopes and precedence; they are not interchangeable settings. Runtime limits, dynamic adjustment and nesting may affect the actual team size. Never assume the default equals the number of physical cores: query what happened and record affinity and allocation when benchmarking.

<h2 id="work-sharing">3. Work-sharing partitions an iteration set</h2>

Compare these two fragments:

```c
#pragma omp parallel
{
    for (int i = 0; i < N; ++i) work(i);
}
```

```c
#pragma omp parallel for
for (int i = 0; i < N; ++i) work(i);
```

In the first, each of $P$ threads executes all $N$ calls: $PN$ calls in total. In the second, the work-sharing `for` assigns each logical iteration to one thread: $N$ calls in total. `parallel for` combines team creation with distribution; a `for` inside an existing parallel region distributes over that team without creating another team.

<Figure id="px457-work-sharing" title="The same workers, different ownership" caption="For four iterations and two threads, a bare parallel region duplicates the loop. One possible work-sharing assignment divides the four iterations. Each numbered box is one call to work(i), not an execution time; the unspecified schedule need not choose this exact partition.">
<svg viewBox="0 0 360 225" role="img" aria-label="Replicated loop: both threads own 0 1 2 3. Partitioned loop: thread 0 owns 0 1 and thread 1 owns 2 3" style={{width: "100%", height: "auto"}}>
<g fill="currentColor" fontSize="13"><text x="10" y="20">parallel: repeat</text><text x="10" y="53">thread 0</text><text x="10" y="88">thread 1</text><text x="10" y="136">parallel for: partition</text><text x="10" y="170">thread 0</text><text x="10" y="205">thread 1</text></g>
<path d="M10 110H345" stroke="currentColor" strokeDasharray="4 4"/>
<rect x="100" y="35" width="34" height="26" fill="none" stroke="currentColor"/><text x="117" y="53" textAnchor="middle" fill="currentColor" fontSize="14">0</text><rect x="155" y="35" width="34" height="26" fill="none" stroke="currentColor"/><text x="172" y="53" textAnchor="middle" fill="currentColor" fontSize="14">1</text><rect x="210" y="35" width="34" height="26" fill="none" stroke="currentColor"/><text x="227" y="53" textAnchor="middle" fill="currentColor" fontSize="14">2</text><rect x="265" y="35" width="34" height="26" fill="none" stroke="currentColor"/><text x="282" y="53" textAnchor="middle" fill="currentColor" fontSize="14">3</text><rect x="100" y="70" width="34" height="26" fill="none" stroke="currentColor"/><text x="117" y="88" textAnchor="middle" fill="currentColor" fontSize="14">0</text><rect x="155" y="70" width="34" height="26" fill="none" stroke="currentColor"/><text x="172" y="88" textAnchor="middle" fill="currentColor" fontSize="14">1</text><rect x="210" y="70" width="34" height="26" fill="none" stroke="currentColor"/><text x="227" y="88" textAnchor="middle" fill="currentColor" fontSize="14">2</text><rect x="265" y="70" width="34" height="26" fill="none" stroke="currentColor"/><text x="282" y="88" textAnchor="middle" fill="currentColor" fontSize="14">3</text><rect x="100" y="152" width="34" height="26" fill="none" stroke="currentColor"/><text x="117" y="170" textAnchor="middle" fill="currentColor" fontSize="14">0</text><rect x="155" y="152" width="34" height="26" fill="none" stroke="currentColor"/><text x="172" y="170" textAnchor="middle" fill="currentColor" fontSize="14">1</text><rect x="210" y="187" width="34" height="26" fill="none" stroke="currentColor"/><text x="227" y="205" textAnchor="middle" fill="currentColor" fontSize="14">2</text><rect x="265" y="187" width="34" height="26" fill="none" stroke="currentColor"/><text x="282" y="205" textAnchor="middle" fill="currentColor" fontSize="14">3</text>
</svg>
</Figure>

The loop index associated with the work-sharing loop is private. That does not make every other variable safe. If `work(i)` writes only to its own output element and reads immutable input, the iterations may be independent. If all iterations update one shared accumulator, dividing iterations creates concurrent conflicting accesses.

<PredictReveal question="Four threads run a parallel region containing an ordinary loop of ten iterations. How many times is the loop body executed?" choices={[{id:"ten",label:"10: one shared loop"},{id:"forty",label:"40: each thread runs the whole loop"}]} answer="forty" explanation={<p>A parallel region replicates the block across the team. A work-sharing for is needed to partition the ten iterations. Sharing the source and sharing memory do not imply sharing the iteration set.</p>} />

Track the calls themselves, rather than counting source-code loops. Each arriving tile records which worker executed one iteration.

<PX457Animation scene="ownership" />

### Conditional compilation

`_OPENMP` is defined when OpenMP processing is enabled:

```c
#ifdef _OPENMP
#include <omp.h>
#endif
```

Guard runtime calls as well if you intend to support a build without the runtime. A serial fallback must still implement the intended computation; ignoring directives cannot repair code whose correctness depended on explicit thread IDs.

### Exercises and the next question

1. Run the two loop fragments with two and four threads. Predict total calls before observing unordered output.
2. Put two `omp for` loops inside one parallel region. Explain which construct creates the team and which assigns work.
3. Measure a pure array kernel without printing, verify its result against a serial version, and record the actual team size.

Workers and iteration owners are now distinct. [Variables and synchronisation](/notes/px457/openmp-variables-synchronisation) asks what happens when those owners touch the same storage.

### Reference

[OpenMP specification index](https://www.openmp.org/spec-html/5.2/openmp.html). Examples here use the common host-threading subset; check implementation support for newer facilities.
