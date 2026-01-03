---
layout: page
title: "Introduction to Optimisation"
---

Text: Week 2

**Focus:** How to write computationally efficient scientific code by understanding CPU execution, pipelining, and compiler optimisation.

---

## 1. Why Worry About Efficiency?

- The course is mainly about **parallel computing**, but:
    
    > "Countless CPU-hours are wasted on parallel computers every day by running inefficient code."

### Key points:

- **Parallel computing ≠ faster code**
    - It's primarily for *solving larger problems*, not just *speeding up* existing ones.
- For decades, developers relied on hardware progress:
    - Chip manufacturers kept increasing clock speeds ("next year's CPU will be faster").
- Today:
    - **CPU clock frequencies have plateaued**.
    - **Single-thread performance has stagnated** — "no more free lunch."
- If your code runs for **thousands of CPU hours**, inefficiency becomes *scientifically expensive*.

---

## 2. Wisdom on Code Optimisation

> Rule 1: Don't do it.
> 
> **Rule 2 (for experts):** Don't do it yet.
> 
> — *M.A. Jackson*

> "More computing sins are committed in the name of efficiency than for any other single reason."
> 
> — *W.A. Wulf*

> "A slow but correct code is infinitely more useful than a fast broken one."
> 
> — *N.D.M. Hine*

**Moral:** Optimisation should *never* compromise correctness.

A "wrong but fast" result is useless.

---

## 3. Caveat Programmor – The Cost of Optimisation

### Trade-offs:

- Optimised code tends to be:
    - Less readable
    - Less modular
    - Harder to maintain
    - Longer and more brittle

### Before optimising, ask:

- Is the gain worth the engineering time?
    - 2 days to go from 10 → 9 minutes runtime? Probably not.
    - 1 month to go from 6 weeks → 1 week runtime? Probably yes.
- Will the **hardware** still exist next year?
    - Architecture-specific optimisation may quickly become obsolete.

---

## 4. Compiler Flags and Built-in Optimisation

Compilers can optimise your code automatically using flags:

```bash
gcc -o my_prog.exe my_code.c -O2
gfortran -o my_prog.exe my_code.f90 -O3
```

### Levels of optimisation:

| Flag | Description |
| --- | --- |
| `-O0` | No optimisation. Exactly what you wrote (for debugging). |
| `-O1` | Removes redundant code, unrolls loops, removes invariants. |
| `-O2` | Adds loop reordering and operation reordering to avoid stalls. |
| `-O3` | Further unrolling, function inlining, array padding, aggressive reordering. |

**Good practice:**

1. Develop at `O0` (debug, test reproducibility).
2. Then test higher levels (`O1`, `O2`, `O3`).
3. Measure timing — sometimes `O3` is *slower* due to over-optimisation.
4. Read compiler docs — flags differ across compilers (Intel, Clang, GNU).

---

## 5. What Happens "Under the Hood"

Every CPU executes instructions through a **fetch-decode-execute-retire** cycle.

- **Registers:** Store local variables for fast access.
- **Functional Units:** Perform basic arithmetic (`+`, , , `/`).
- **Memory Controller:** Manages data flow from RAM → cache → registers.

**Key idea:** CPUs can only execute a *small set* of primitive instructions efficiently.

---

## 6. Not All Operations Are Equal

### Fast (single-cycle):

- Load / store
- Add / multiply
- Compare / shift

### Slow (multi-cycle via microcode):

- Divide, square root, `log`, `exp`, `sin`, `cos`, `x^y`
    - Can take **30–100 cycles** per operation.
    - Implemented as sequences of basic ops (microcode).

**Implication:** Avoid expensive mathematical functions in tight loops unless absolutely necessary.

---

## 7. Avoiding Microcode

### Example (C):

```c
y = pow(x, 3);       // Slow (microcoded, 30–100 cycles)
y = x * x * x;       // Fast (3 multiplies)
```

### Example (Fortran):

```fortran
y = x ** 3.0         ! May call general-purpose pow()
y = x * x * x        ! Explicit multiply avoids overhead
```

**Best practice:**

- Use explicit arithmetic where possible.
- Avoid floating-point exponentiation unless needed.
- Compilers may optimise integer powers automatically — but not always.

---

## 8. Simple Loop Optimisation (C Example)

Original code:

```c
for (i = 0; i < N; i++) {
   x[i] = 2.0 * p * (float)i / k1;
   y[i] = 2.0 * p * (float)i / k2;
}
```

### Stepwise optimisation:

1. **Extract repeated constants:**
    
    ```c
    t2 = 2.0 * p;
    for (i = 0; i < N; i++) {
        t1 = t2 * (float)i;
        x[i] = t1 / k1;
        y[i] = t1 / k2;
    }
    ```
    
2. **Precompute inverses:**
    
    ```c
    t1 = 2.0 * p / k1;
    t2 = 2.0 * p / k2;
    for (i = 0; i < N; i++) {
        x[i] = t1 * (float)i;
        y[i] = t2 * (float)i;
    }
    ```

Result: Fewer operations per iteration, fewer memory loads.

Modern compilers often perform this automatically, but understanding it helps.

---

## 9. Ninja Algebra Skills – Manual Arithmetic Optimisation

Original:

```c
E[i] = A[i]/B[i] + C[i]/D[i];
```

- 2 divides + 1 add = **60–200 cycles**

Optimised:

```c
t1 = 1.0 / (B[i]*D[i]);
E[i] = t1 * (A[i]*D[i] + C[i]*B[i]);
```

- 1 divide + 4 multiplies + 1 add = **50–120 cycles**

**Caution:** Floating-point errors can accumulate differently.

---

## 10. Pipelining — Instruction Flow

A **pipeline** breaks execution into multiple sequential stages:

1. Fetch
2. Decode
3. Execute
4. Memory access
5. Retire

Each stage takes one CPU cycle.

→ First instruction takes *5 cycles total*, but once the pipeline is full, **one result per cycle** is achieved.

### Example: A simple 5-stage pipeline

```
Cycle 1: Fetch A = A + B
Cycle 2: Decode A = A + B
Cycle 3: Execute
Cycle 4: Memory access
Cycle 5: Write back
```

Multiple instructions can overlap across stages.

---

## 11. Loop Pipelining Example

Efficient example:

```c
for (i = 0; i < N; i++) {
    A[i] = A[i] * A[i];
}
```

- No dependency between iterations.
- Compiler can overlap operations (fill the pipeline).
- Sustains near-peak throughput (often 1–2 ops per cycle).

---

## 12. Pipeline Stalls

When operations depend on the previous result, the pipeline **stalls**.

### Example (slow):

```c
sum = 0.0;
for (i = 0; i < N; i++) {
    sum += A[i];   // Dependent on previous iteration
}
```

### Fix (loop unrolling):

```c
t1 = t2 = t3 = t4 = t5 = 0.0;
for (i = 0; i < N; i += 5) {
    t1 += A[i];
    t2 += A[i+1];
    t3 += A[i+2];
    t4 += A[i+3];
    t5 += A[i+4];
}
sum = t1 + t2 + t3 + t4 + t5;
```

~5× faster — the compiler can now execute 5 independent streams simultaneously.

---

## 13. Helping the Compiler

Compilers *try* to unroll and pipeline automatically, but only when it's safe.

### Example:

```c
for (i = 0; i < N - j; i++) {
    sum += A[i] + A[i + j];
}
```

If `j` is unknown at compile time:

- The compiler **can't safely unroll**.
- Declaring it as a constant (`const int j = 100;`) helps the compiler generate optimised code.

---

## 14. Branching — Pipeline Killer

Branches (e.g. `if` statements) break the predictable flow of instructions.

Each branch may flush or stall the pipeline.

### Example (slow):

```c
for (i = 0; i < N; i++) {
    if (i == 0)
        B[i] = 0.5 * (A[i+1] + A[N-1]);
    else if (i == N-1)
        B[i] = 0.5 * (A[0] + A[N-2]);
    else
        B[i] = 0.5 * (A[i+1] + A[i-1]);
}
```

### Improved (fast):

```c
B[0] = 0.5 * (A[1] + A[N-1]);
for (i = 1; i < N-1; i++)
    B[i] = 0.5 * (A[i+1] + A[i-1]);
B[N-1] = 0.5 * (A[0] + A[N-2]);
```

Eliminates branch prediction penalties.

Easier for the compiler to pipeline and vectorise.

---

## 15. Pipelining Summary

**How to help the compiler:**

- Move conditionals outside loops.
- Avoid unnecessary branches.
- Declare constants properly.
- Consider `#pragma unroll` or other compiler directives (e.g. OpenMP).
- Expect code to become longer and less elegant — readability is sacrificed for speed.

> "You understand your code better than the compiler,
> but the compiler understands the CPU better than you."

---

## 16. Looking Ahead

So far, we've optimised **instruction flow** (CPU efficiency).

Next: we'll explore **data flow** — how memory architecture affects performance:

- Shared vs. distributed memory
- Cache coherence
- OpenMP and MPI
- GPU and hybrid programming models

---

### References

- Dowd & Severance, *High Performance Computing*, O'Reilly (1999)
- Hennessy & Patterson, *Computer Architecture: A Quantitative Approach*
