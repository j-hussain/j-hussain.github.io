---
layout: page
title: "Introduction to Optimisation"
---

A loop computes a million independent squares. Another loop adds a million numbers into one running sum. Both have linear operation counts. Why might the sum make poorer use of the same processor?

The distinction is **dependency**. A square can start before the previous square finishes. An update to one running sum needs the previous sum. This second week develops a model of instruction flow before we add threads. It builds on the [numerical contract](/notes/px457/intro-hpc#numbers): a faster implementation must still compute an acceptable answer.

<h2 id="discipline">1. Optimise a measured bottleneck</h2>

Parallel computing can reduce elapsed time, enable larger problems, or both. But replicating inefficient serial work across many processors also multiplies the resource cost. First establish correctness, choose representative inputs, and measure where time is spent.

The source's cautions are useful: M. A. Jackson's “Don't do it yet”, W. A. Wulf's warning about computing sins committed in the name of efficiency, and N. D. M. Hine's observation that a slow correct program is more useful than a fast broken one. They concern engineering judgement, not a ban on optimisation.

An improvement from ten to nine minutes may be valuable if executed millions of times. An improvement from six weeks to one week may justify substantial development effort. Compare the expected saved time and energy with implementation, validation and maintenance costs. Preserve a readable reference implementation so that changes remain reviewable.

### Ask the compiler first

```bash
gcc -O2 -Wall -Wextra my_code.c -o my_prog
gfortran -O3 my_code.f90 -o my_fortran_prog
```

`-O0` largely disables optimisation; `-Og` is designed for debugging with some optimisation. `-O1`, `-O2` and `-O3` enable progressively different sets of transformations, but their contents depend on compiler version and target. Higher levels do not guarantee shorter runtime. Consult the [GCC optimisation reference](https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html) and inspect optimisation reports rather than memorising a universal flag table.

Develop with diagnostics, test optimised builds, and time the executable that will actually be used. Flags such as `-ffast-math` change numerical assumptions and need a separate justification; `-O3` alone is not permission to ignore floating-point semantics.

<h2 id="pipeline">2. Latency and throughput answer different questions</h2>

A simplified CPU instruction passes through fetch, decode, execute, memory access and retirement. Real CPUs can issue multiple instructions, execute out of order, and use units with different latencies. The simplified pipeline isolates one useful distinction.

**Latency** $L$ is the time from starting an operation to obtaining its result. **Initiation interval** $I$ is the spacing between starts supported by a pipelined unit. For $n\ge1$ independent operations with no stalls,

$$
T_n=L+(n-1)I.
$$

The first result costs $L$; each additional result costs only $I$. For a five-stage toy pipeline with $L=5$ cycles and $I=1$, four independent instructions finish in eight cycles, rather than twenty.

<Figure id="px457-pipeline" title="Long latency, frequent results" caption="Each row is one independent instruction. Columns are cycles; F, D, E, M and R are the five toy stages. Instruction 2 starts before instruction 1 finishes. This is a teaching pipeline, not a specification of a modern CPU.">
<svg viewBox="0 0 360 170" role="img" aria-label="Four instructions staggered one cycle apart through five stages, finishing at cycles 5, 6, 7 and 8" style={{width: "100%", height: "auto"}}>
<g fill="currentColor" fontSize="13"><text x="12" y="23">cycle</text><text x="80" y="23">1</text><text x="114" y="23">2</text><text x="148" y="23">3</text><text x="182" y="23">4</text><text x="216" y="23">5</text><text x="250" y="23">6</text><text x="284" y="23">7</text><text x="318" y="23">8</text><text x="12" y="53">A</text><text x="12" y="85">B</text><text x="12" y="117">C</text><text x="12" y="149">D</text></g>
<g fill="var(--sci-accent)" fillOpacity="0.12" stroke="currentColor"><rect x="70" y="32" width="170" height="28"/><rect x="104" y="64" width="170" height="28"/><rect x="138" y="96" width="170" height="28"/><rect x="172" y="128" width="170" height="28"/></g>
<g fill="currentColor" fontSize="13" wordSpacing="20"><text x="80" y="52">F D E M R</text><text x="114" y="84">F D E M R</text><text x="148" y="116">F D E M R</text><text x="182" y="148">F D E M R</text></g>
</svg>
</Figure>

Registers hold active values, arithmetic units consume them, and loads/stores move data through the memory hierarchy. A load is not generally a one-cycle operation: its latency depends on where the data is found. Addition and multiplication can have several cycles of latency while still sustaining one or more starts per cycle. Division and transcendental functions are often more expensive, but implementation may involve hardware instructions or library routines; they are not all “microcode”.

Now let the pipeline run. Compare independent instructions with a chain whose next instruction requires the preceding result.

<PX457Animation scene="pipeline" />

<h2 id="algebra">3. Fewer expensive operations, with a numerical condition</h2>

For an integer cube, `x * x * x` uses **two** multiplications:

```c
y = pow(x, 3.0);
y = x * x * x;
```

A compiler may already simplify the first expression. In Fortran, `x**3` makes the integer exponent explicit; `x**3.0` has real-exponent semantics. Inspect generated code and measure. The algebraic identity alone says nothing about instruction selection or handling exceptional values.

The original loop-invariant example is worth retaining. Assume fixed finite `p`, nonzero `k1,k2`, distinct valid output arrays, and a representable index conversion:

```c
for (int i = 0; i < N; ++i) {
    x[i] = 2.0 * p * (double)i / k1;
    y[i] = 2.0 * p * (double)i / k2;
}
```

First share the repeated product; then move invariant arithmetic outside the loop:

```c
double c1 = 2.0 * p / k1;
double c2 = 2.0 * p / k2;
for (int i = 0; i < N; ++i) {
    x[i] = c1 * (double)i;
    y[i] = c2 * (double)i;
}
```

Over the reals the formulas agree. In floating point, division and multiplication are rounded at different points, so validate the resulting error. The change reduces arithmetic inside the loop; it does not inherently reduce the compulsory output stores.

A more hazardous rewrite combines two divisions:

$$
\frac AB+\frac CD=\frac{AD+CB}{BD},\qquad B,D\ne0.
$$

```c
/* Candidate transformation, not a universally safe replacement. */
double inv = 1.0 / (B[i] * D[i]);
E[i] = inv * (A[i] * D[i] + C[i] * B[i]);
```

The replacement has one division, four multiplications and one addition. But `B[i]*D[i]` can overflow or underflow when the original quotients are well behaved. For example, with all four inputs equal to $10^{200}$ in binary64, the original expression is $2$, whereas the products overflow. This is a counterexample to the idea that algebraic equivalence implies numerical equivalence. Fixed cycle counts cannot establish a speed advantage either: independent divisions may overlap, and target hardware differs.

<h2 id="chains">4. Break a chain only when reassociation is acceptable</h2>

Independent squares have no loop-carried data dependency:

```c
for (int i = 0; i < N; ++i) A[i] *= A[i];
```

A running sum has one:

```c
double sum = 0.0;
for (int i = 0; i < N; ++i) sum += A[i];
```

If addition latency is $L$ cycles, one accumulator cannot normally start a dependent addition more often than every $L$ cycles. Several accumulators expose independent chains:

```c
double t0 = 0, t1 = 0, t2 = 0, t3 = 0, t4 = 0;
int i = 0;
for (; i <= N - 5; i += 5) {
    t0 += A[i];     t1 += A[i+1];  t2 += A[i+2];
    t3 += A[i+3];   t4 += A[i+4];
}
double sum = t0 + t1 + t2 + t3 + t4;
for (; i < N; ++i) sum += A[i];
```

Assume $N$ is a nonnegative `int` and A has $N$ valid elements. The bound `i <= N - 5` avoids overflow in a test such as `i + 4 < N` near the largest representable `int`; every executed group and increment stays within the array's index range. The remainder loop is essential when $N$ is not divisible by five. This rewrite changes summation order. Five chains also do not prove fivefold speedup: issue bandwidth, vectorisation, memory bandwidth and register pressure can set tighter bounds.

<h3 id="sum-order">The same sum can follow different rounding paths</h3>

Before accepting the rewrite, try the three binary32 inputs $a=2^{24}$, $b=1$ and $c=-2^{24}$. Their exact real sum is one. With a binary32 rounding after each addition, round-to-nearest with ties-to-even gives

$$
\begin{aligned}
\operatorname{fl}(\operatorname{fl}(a+b)+c)&=\operatorname{fl}(2^{24}-2^{24})=0,\\
\operatorname{fl}(a+\operatorname{fl}(b+c))&=\operatorname{fl}(2^{24}+(1-2^{24}))=1.
\end{aligned}
$$

Above $2^{24}$, adjacent binary32 numbers are two units apart. The first addition in the first line lands exactly halfway between them and rounds to $2^{24}$, whose significand has an even last bit. In the second line, $1-2^{24}$ is exactly representable: below $2^{24}$, the spacing is one. No overflow, invalid index or race is involved; the grouping alone changes the answer. This is [Week 1's lost increment](/notes/px457/intro-hpc#numbers) appearing inside a longer computation.

Neither grouping is guaranteed to be the more accurate one for arbitrary data. Several accumulators, SIMD reductions and thread reductions all choose evaluation trees. Their legitimacy depends on the allowed error, not merely on the real-arithmetic identity. Keep a reference result and test inputs with cancellation before measuring the improvement.

The rounding example tells us what reassociation can change. With that qualification in place, watch why separate accumulators can expose more instruction-level parallelism.

<PX457Animation scene="accumulators" />

The source's shifted-read loop illustrates information the compiler might exploit:

```c
/* Assume 0 <= j <= N and A has N elements. */
for (int i = 0; i < N-j; ++i) sum += A[i] + A[i+j];
```

A runtime `j` does **not** inherently prevent unrolling: both array uses are reads. A known constant can help simplify addresses, but the sum dependency and permitted reassociation still matter. In loops with writes, possible pointer aliasing can prevent transformations; use nonaliasing promises only when they are true.

<h2 id="branches">5. Separate the exceptional boundary from the regular interior</h2>

For a periodic one-dimensional stencil, assume $N\ge2$ and nonoverlapping input `A` and output `B`. The original implementation tests for boundaries inside every iteration:

```c
for (int i = 0; i < N; ++i) {
    if (i == 0) B[i] = 0.5 * (A[1] + A[N-1]);
    else if (i == N-1) B[i] = 0.5 * (A[0] + A[N-2]);
    else B[i] = 0.5 * (A[i+1] + A[i-1]);
}
```

Only two elements are exceptional. Express that structure directly:

```c
B[0] = 0.5 * (A[1] + A[N-1]);
for (int i = 1; i < N-1; ++i)
    B[i] = 0.5 * (A[i+1] + A[i-1]);
B[N-1] = 0.5 * (A[0] + A[N-2]);
```

This makes the regular interior easier to vectorise and removes source-level branch tests from it. A branch does not automatically flush a pipeline: prediction and compiler transformations matter. Measure whether the rewrite helps. Later, MPI halo exchange will use the same interior/boundary separation to compute while messages travel.

### Exercises and continuation

1. Derive $T_n=L+(n-1)I$ and explain what assumption fails for one running sum.
2. Compare the reference and five-accumulator sums on inputs with cancellation, and on $N=0,1,4,5,6$. Report error as well as time.
3. Inspect vectorisation reports before and after splitting the periodic stencil. Keep allocation, compiler flags and problem size fixed.
4. Explain why a compiler can legally reject a mathematically valid reassociation.

We have exposed independent instructions. They still need operands. [Memory architecture](/notes/px457/memory-architecture) asks why an arithmetically efficient loop can spend most of its time waiting for data.

### References

- Dowd and Severance, _High Performance Computing_, O'Reilly (1999).
- Hennessy and Patterson, _Computer Architecture: A Quantitative Approach_.
- [GCC optimisation options](https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html), for the installed compiler's corresponding version.
