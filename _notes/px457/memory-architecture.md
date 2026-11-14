---
layout: page
title: "Memory Architecture"
---

Two loops perform the same additions on the same matrix. One walks across rows; the other jumps between rows. Their arithmetic counts agree, but their memory traffic can differ sharply. The [pipeline model](/notes/px457/intro-optimisation#pipeline) explains how a processor overlaps instructions; this third week asks whether those instructions have data to consume.

<h2 id="hierarchy">1. Memory buys capacity by sacrificing proximity</h2>

Registers hold immediately active operands. L1 and L2 caches retain nearby working data; a last-level cache often serves several cores. Main memory offers much greater capacity but longer access latency. Sizes, sharing arrangements and cycle counts depend on the processor. The source's register/L1/L2/L3/RAM table is a historical illustration, not a specification to use when tuning a current machine.

Two quantities matter. **Latency** measures how long one access takes. **Bandwidth** measures bytes transferred per second under sustained traffic. Several independent misses can overlap, so reducing miss count by a factor of two does not prove a twofold runtime reduction.

For a serial stream with hit probability $h$, a simplified average-access model is

$$
T_{\mathrm{access}}=T_{\mathrm{hit}}+(1-h)T_{\mathrm{miss\ penalty}}.
$$

It accounts for a miss penalty after the cache lookup, but omits prefetching and concurrent accesses. The model explains why locality helps; it is not a modern CPU simulator.

<h2 id="cache">2. A cache transfers a line, not one scalar</h2>

Use the lecture's explicit toy model: eight-byte words, sixteen words per line, four direct-mapped cache slots, an initially empty cache and no prefetching. A word address $a\ge0$ maps to

$$
\operatorname{block}(a)=\left\lfloor\frac a{16}\right\rfloor,
\qquad
\operatorname{slot}(a)=\operatorname{block}(a)\bmod4.
$$

The block's tag distinguishes different memory blocks that share a slot. On a miss the block replaces whatever occupied **that slot**, even if other slots are empty. Replacement mapping and write-back/write-through policy answer different questions: where a line goes, and when modified data reaches lower memory.

<Figure id="px457-cache-map" title="Different addresses can compete for one slot" caption="In the sixteen-word-line, four-slot model, A begins at word 0. B beginning at word 64 competes with A for slot 0. Shifting B to word 80 moves its first block to slot 1. Cache mapping, not array length alone, causes the conflict.">
<svg viewBox="0 0 360 205" role="img" aria-label="Memory blocks 0 and 4 map to cache slot 0; block 5 maps to slot 1" style={{width: "100%", height: "auto"}}>
<g fill="none" stroke="currentColor"><rect x="235" y="28" width="100" height="32"/><rect x="235" y="64" width="100" height="32"/><rect x="235" y="100" width="100" height="32"/><rect x="235" y="136" width="100" height="32"/><path d="M150 42H230 M150 92L230 48"/><path d="M150 142L230 80" strokeDasharray="4 4"/></g>
<g fill="currentColor" fontSize="13"><text x="12" y="45">A: block 0</text><text x="12" y="95">B: block 4</text><text x="12" y="145">padded: block 5</text><text x="255" y="49">slot 0</text><text x="255" y="85">slot 1</text><text x="255" y="121">slot 2</text><text x="255" y="157">slot 3</text><text x="12" y="193">word address → block → slot</text></g>
</svg>
</Figure>

Predict what happens in `A[i] *= B[i]` when A begins at word 0 and B at word 64. For an illustrative **read trace** `A[0], B[0], A[1], B[1], ...`, their corresponding blocks repeatedly evict each other. With 64 elements from each array, this trace has 128 read misses. Stores and dirty-line writebacks are additional traffic; the count is not a complete model of compiled read-modify-write instructions.

If A and B instead contain 32 elements and begin at word 0 and word 32, their four blocks use distinct slots: four compulsory read misses suffice for the read trace. For the 64-element case, shifting B's start by sixteen words separates the simultaneously accessed block pairs; eight compulsory read misses suffice. In actual C, declaring `double A[64], C[16], B[64]` does not guarantee placement or padding; the compiler controls layout. A controlled experiment must arrange addresses in one suitably allocated buffer.

Modern caches are generally set-associative: several lines can occupy a set. Associativity reduces some conflicts but cannot remove capacity and mapping effects. Padding is a hypothesis to test, not a universal rule that powers of two are bad.

The static mapping explains where a block belongs. Follow the actual sequence of fills and evictions to see why placement changes the read-miss count.

<PX457Animation scene="cache" />

<h2 id="locality">3. Use what arrived, then reuse it while it remains</h2>

**Spatial locality** means using nearby addresses; **temporal locality** means reusing an address soon. Once a line arrives, adjacent words can be accessed without another lower-level line fill. Their access is cheaper, not literally free.

The source's even/odd example makes spatial locality visible:

```c
/* A has 128 elements. */
for (int i = 0; i < 128; i += 2) A[i] *= A[i];
for (int i = 1; i < 128; i += 2) A[i] = A[i]*A[i]*A[i];
```

Under a small-cache streaming model, the second pass may reload lines evicted during the first. Fuse the operations:

```c
for (int i = 0; i < 128; i += 2) {
    A[i] *= A[i];
    A[i+1] = A[i+1]*A[i+1]*A[i+1];
}
```

With sixteen-word lines and aligned A, eight line fills supply a single sweep; sixteen may be needed for two sweeps when the eight-line working set does not remain cached. If it does remain cached, the second pass need not reload it. The relevant condition is working-set size and mapping, not the presence of two loops by itself.

### Array of structures or structure of arrays?

If every operation needs paired fields, interleaving can make a loaded line useful:

```c
struct Pair { double a, b; };
struct Pair d[64];
for (int i = 0; i < 64; ++i) d[i].a *= d[i].b;
```

Separate arrays `a[64], b[64]` can also stream efficiently and often make SIMD access simpler. If only `a` is needed, interleaving fetches unused `b` values. Choose layout from the fields actually used together, vectorisation requirements and measured traffic. Neither layout dominates universally.

<h2 id="layout">4. Preserve the calculation when changing loop order</h2>

C stores a rectangular array in row-major order:

$$
\operatorname{offset}(A[i][j])=i\,n_{\mathrm{cols}}+j.
$$

The rightmost index is contiguous. Fortran's conventional column-major arrays make the leftmost index contiguous instead.

The source computes 32 column sums of a four-by-thirty-two C array:

```c
double A[4][32], sumcol[32];
for (int i = 0; i < 32; ++i) {
    sumcol[i] = 0.0;
    for (int j = 0; j < 4; ++j) sumcol[i] += A[j][i];
}
```

A safe loop interchange keeps the same matrix and same sums:

```c
for (int i = 0; i < 32; ++i) sumcol[i] = 0.0;
for (int j = 0; j < 4; ++j)
    for (int i = 0; i < 32; ++i) sumcol[i] += A[j][i];
```

Each column still receives its four additions in increasing `j` order, while the inner loop now reads consecutive A values. Assume `sumcol` does not overlap A. Changing the declaration to `A[32][4]` is instead a **layout transformation**; it preserves the intended values only if the data is transposed or populated consistently. The source's 128-versus-eight line counts require a particular conflict mapping; array dimensions alone do not establish them.

Set the arithmetic aside for a moment and follow the addresses of a small matrix. This isolates traversal locality; both views visit the same sixteen elements.

<PX457Animation scene="traversal" />

### From a cache line to a shared cache line

Coherent shared-memory systems keep cores' cached views consistent, but coherence does not repair a race. Two threads writing distinct words in the **same line** can repeatedly transfer ownership of that line: **false sharing**. The variables are logically separate, yet the hardware's transfer unit couples them. This will matter when OpenMP assigns neighbouring output elements to different threads.

<h2 id="models">5. Which kind of parallelism?</h2>

Flynn's taxonomy classifies instruction and data streams:

| Model | Streams                              | Useful interpretation                                                     |
| ----- | ------------------------------------ | ------------------------------------------------------------------------- |
| SISD  | One instruction, one data            | A simplified serial processor                                             |
| SIMD  | One instruction, multiple data       | Vector lanes applying one operation to several elements                   |
| MISD  | Multiple instructions, one data      | Uncommon classification; sometimes associated with specialised redundancy |
| MIMD  | Multiple instructions, multiple data | Independently progressing cores or processes                              |

A modern CPU combines categories: a thread can issue SIMD instructions while several cores run MIMD programs. A single-threaded Python process is not proof that the underlying machine is purely SISD; libraries may also launch threads.

SSE, AVX, AVX2 and AVX-512 illustrate 128-, 256- and 512-bit vector families. A 256-bit vector can hold four binary64 values; a wider vector does not guarantee proportionally higher application speed. Instruction availability, frequency, memory traffic and dependency constraints all matter. Ask GCC for evidence:

```bash
gcc -O3 -fopt-info-vec-optimized -fopt-info-vec-missed kernel.c -c
```

Simple loops, contiguous access and independent iterations help. Branches and aliasing can impede vectorisation; manual unrolling can help or hurt. Compare compiler reports rather than assuming a particular outcome.

At a larger scale, shared-memory threads access one process's address space; distributed-memory processes own separate address spaces and exchange data explicitly. A cluster can combine both, and a shared-memory node may have nonuniform access costs (NUMA). [OpenMP](/notes/px457/openmp-parallels-work-sharing) begins with shared memory; [MPI](/notes/px457/mpi-intro) later makes process ownership explicit.

### Exercises

1. Use the toy mapping to predict the read misses for A at word 0 and B at words 32, 64 and 80. State array lengths and access order.
2. Compare AoS and SoA when a loop reads both fields, then when it reads only one. Explain the bytes useful per line.
3. Measure the two column-sum loops across working sets that fit and do not fit in cache. Do not convert line-fill ratios directly into claimed speedups.
4. Explain how a loop can be SIMD within each core and MIMD across cores.
