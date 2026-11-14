---
layout: page
title: "Introduction to High Performance Computing"
---

A simulation takes a month on one processor. If we buy a thousand processors, should it finish in forty-three minutes? Only if the work can be divided, the data can reach each processor, and the processors spend almost no time waiting. Even then, the answer must retain the accuracy the scientist needs.

This is the organising problem of **high-performance computing (HPC)**: obtain useful scientific results within limits on time, memory, energy and cost. Supercomputers and clusters provide resources; algorithms and implementations determine how effectively those resources are used. This first week establishes two contracts that we will keep returning to: what numerical answer is acceptable, and what counts as improved performance.

**In this chapter:** [numbers](#numbers), [rates](#rates), [hardware scaling](#scaling), [energy](#energy), and [the course ahead](#course).

<h2 id="numbers">1. Before computing faster, decide what a number means</h2>

### Integers have a range

The unsigned eight-bit pattern `01111001` represents

$$
121=64+32+16+8+1.
$$

Integers in range are represented exactly. Arithmetic is exact **only when its result is representable**. In C, unsigned arithmetic wraps modulo a power of two; signed integer overflow is undefined behaviour. An iteration count, allocation size or array index can therefore fail before any floating-point operation occurs.

### Real arithmetic becomes rounded arithmetic

Decimal scientific notation separates scale from significant digits: $123456=1.23456\times10^5$. A normal binary floating-point number similarly has the form

$$
x=(-1)^s(1.f)_2\,2^e.
$$

IEEE binary32 stores one sign bit, eight exponent bits and twenty-three fraction bits. The implicit leading one gives twenty-four significant binary digits for normal numbers. Zero, subnormal numbers, infinities and NaNs require separate encodings.

For example, $123456$ is exactly representable in binary32:

```text
sign     exponent       fraction
 0       10001111       11100010010000000000000
```

Here the stored exponent is $143$, so $e=143-127=16$. But a finite binary fraction cannot represent every decimal fraction: $0.9$ has a repeating binary expansion. A calculation starts from a nearby representable number and rounds again after arithmetic operations.

Consider adding $10^{-8}$ to $1$ in binary32, using round-to-nearest. The next representable number above $1$ is $1+2^{-23}$. Since $10^{-8}<2^{-24}$, the exact sum is nearer to $1$ and rounds back to it.

<Figure id="px457-rounding" title="A small increment can disappear" caption="Near 1, adjacent binary32 values are separated by 2⁻²³. The increment 10⁻⁸ lies before the midpoint, so round-to-nearest returns 1. Distances are schematic; the labelled order is exact.">
<svg viewBox="0 0 360 140" role="img" aria-label="Number line with 1 at left, 1 plus 10 to minus 8 before the rounding midpoint, and the next binary32 value at right" style={{width: "100%", height: "auto"}}>
<path d="M25 75H335 M30 67V83 M180 67V83 M330 67V83" fill="none" stroke="currentColor" />
<circle cx="55" cy="75" r="5" fill="var(--sci-accent)" />
<path d="M180 30V100" stroke="currentColor" strokeDasharray="4 4" />
<g fill="currentColor" fontSize="13"><text x="25" y="115">1</text><text x="145" y="23">midpoint</text><text x="265" y="115">1 + 2⁻²³</text><text x="30" y="52">1 + 10⁻⁸</text></g>
</svg>
</Figure>

For a normal result away from overflow and underflow, a standard rounding model is

$$
\operatorname{fl}(a\circ b)=(a\circ b)(1+\delta),\qquad |\delta|\le u,
\qquad u=2^{-24}\quad\text{for binary32},
$$

where $\circ$ is a basic arithmetic operation and rounding is to nearest. This is a local error model, not a bound on an entire simulation. Cancellation can make a small absolute error large relative to the final result. Later, parallel reductions will change the order of additions; a different final bit pattern need not mean a race, but it must still satisfy the application's error tolerance.

Rounding is a map onto a discrete set of values. Follow an exact sum as it crosses a rounding boundary; then change the scale of the number.

<PX457Animation scene="rounding" />

<h2 id="rates">2. A rate is not a time to solution</h2>

A **FLOP** is a floating-point arithmetic operation; **FLOP/s** is a rate. If a calculation performs $W$ operations at sustained rate $R$, then its arithmetic time is $W/R$. This estimate excludes waiting for memory, communication, storage and other work.

A fused multiply-add, $ab+c$, is conventionally counted as two FLOPs even though it can be one instruction. Peak rates must state precision and counting convention. A GPU's low-precision tensor rate cannot be compared directly with a CPU's binary64 rate.

As a dated example, the [November 2024 TOP500 list](https://top500.org/lists/top500/2024/11/) reports El Capitan with 11,039,616 listed cores, an HPL result of 1.742 exaFLOP/s, theoretical peak 2.74638 exaFLOP/s and listed power 29.581 MW. These are different quantities; neither rate predicts the speed of an arbitrary application. The original lecture's rounded “2.8 exaFLOPS” should be read as a peak-scale figure, not an HPL measurement or a current ranking.

The Apollo guidance computer provides the opposite historical scale: tiny memory and a tightly constrained mission. Its integer-oriented instruction set makes an unqualified FLOP/s comparison misleading; see [NASA's hardware history](https://www.nasa.gov/wp-content/uploads/static/history/computers/Ch2-5.html). The useful lesson is that a constrained machine can accomplish a carefully designed computation. Likewise, a smartphone's advertised teraFLOP/s says little without the precision, workload and power envelope.

A cluster contains racks of **nodes** connected by a network. A node may contain several CPU sockets, multiple cores per socket, and accelerators. Three capacities now matter separately: arithmetic throughput, the rate at which data reaches that arithmetic, and the amount of data that fits in memory. More of one cannot always compensate for too little of another.

<h2 id="scaling">3. Why transistor growth led to parallelism</h2>

A MOSFET uses gate voltage to control conduction between source and drain. CMOS combines complementary transistor types to implement logic such as NOT and NAND: NAND outputs zero only when both inputs are one. Ideal static CMOS draws negligible steady current, but real devices also dissipate leakage and short-circuit power.

**Moore's law** describes the historical growth of transistor counts, often summarised as a doubling roughly every two years. It is an observation about integration, not a theorem guaranteeing faster programs or an expiry date. Modern process-node names are technology labels, not direct measurements of a single transistor dimension.

**Dennard scaling** supplied a different argument: under ideal proportional scaling of dimensions and voltage, faster and more numerous transistors could operate at approximately constant power density. A simplified dynamic-power relation explains the attraction:

$$
W_{\mathrm{dynamic}}\approx aCV^2\nu,
$$

where $a$ is switching activity, $C$ switched capacitance, $V$ supply voltage and $\nu$ clock frequency. Voltage reduction is particularly valuable because it appears squared. Leakage and limits to voltage scaling undermined this trajectory around the mid-2000s. Raising frequency indefinitely became thermally expensive.

Manufacturers could still add transistors, but increasingly used them for more cores, SIMD units, caches and specialised accelerators. Single-thread performance has continued to improve through architectural changes; the lost expectation is that clock-frequency growth alone will rescue an unchanged program.

Industry demand has moved through scientific and military computing, personal computers, graphics and gaming, mobile/cloud services, cryptocurrency and machine learning. These overlapping drivers explain why hardware can favour a particular arithmetic precision or data pattern. A scientist must check whether that specialisation matches the problem.

<h2 id="energy">4. The fastest configuration need not use the least energy</h2>

At constant power $W$, energy is $E=WT$. If reducing frequency changes runtime by a factor $t$ and power by a factor $w$, energy changes by $wt$. A 10% slower calculation at 20% lower power uses $1.1\times0.8=0.88$ times the energy. It saves 12% while occupying the machine longer.

[ARCHER2's frequency study](https://www.archer2.ac.uk/news/2022/12/12/CPUFreq.html) compared 2.25 and 2.0 GHz. Three of four benchmarks showed 13–20% energy reductions with 1–5% performance reductions. That is workload-specific evidence, not a promise for every program. Memory-bound code can be relatively insensitive to core frequency; compute-bound code may react differently.

The source also used ARCHER2 to discuss capital cost, electricity and embodied carbon. Those remain distinct accounting questions: manufacturing emissions occur even before the first job; operational emissions depend on energy use and the electricity-accounting method. [The service's sustainability information](https://www.archer2.ac.uk/community/sustainability/) explains its reporting approach. Undated lecture cost/carbon estimates are recorded as unverified historical figures in the editorial ledger rather than treated as current measurements.

Zettascale means $10^{21}$ FLOP/s. For an illustrative efficiency of $47.6$ GFLOP/s/W, arithmetic at that rate would require about $21$ GW. This is a proportional extrapolation with fixed efficiency, not a prediction of a future installation. Improving useful work per joule matters as much as increasing nominal peak throughput.

The energy calculation can be read geometrically as an area under a power curve. Let the two runs unfold on the same axes.

<PX457Animation scene="energy" />

<h2 id="course">5. Follow both instructions and data</h2>

CPUs emphasise flexible control, low latency and complex instruction streams. GPUs devote more resources to throughput across many threads. Discrete GPUs typically have their own high-bandwidth memory, although integrated and unified-memory systems complicate that simple split. Neither processor is universally faster.

Language choice is similarly incomplete as an explanation. A Python loop may pay substantial interpreter overhead, while a NumPy operation can call highly tuned compiled kernels. C and Fortran offer detailed control, but handwritten low-level code does not automatically beat a numerical library.

The course first improves [instruction flow](/notes/px457/intro-optimisation), then [data flow](/notes/px457/memory-architecture). OpenMP distributes work within shared memory; MPI makes ownership and communication explicit across processes; CUDA exposes GPU execution. Finally, performance models help interpret measurements, and automatic differentiation shows how a high-level mathematical operation can expose efficient parallel structure.

### Exercises

1. Explain why an integer overflow, a floating-point rounding difference and a data race require different remedies.
2. A kernel performs $2N$ FLOPs and transfers $24N$ bytes. What information besides peak FLOP/s is needed to estimate its runtime?
3. Derive the energy break-even condition $wt<1$. Why can an energy-saving configuration still be unattractive to a user facing a deadline?
