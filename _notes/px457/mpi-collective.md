---
layout: page
title: "MPI: Collective Communications"
---

### *MPI-03: Collective Communications*

---

## Conceptual Focus

Point-to-point messaging (`MPI_Send`/`MPI_Recv`) is flexible but verbose and easier to get wrong (ordering, deadlocks, complexity). MPI therefore provides **collective operations** that implement common communication patterns efficiently and portably.

Collectives are:

- Called by **all ranks in a communicator** (typically `MPI_COMM_WORLD`) with **compatible arguments**.
- Implemented by the MPI library in a way that is often **topology- and hardware-optimised**.
- A mix of **data movement** and often **implicit synchronisation** (because everyone must participate).

---

## Why collectives matter (I/O use case)

In many HPC environments, you should assume **rank 0** is the only rank that reliably reads from standard input. If every rank tries to read, behaviour is implementation-dependent and can become chaotic. Hence: rank 0 reads, then **broadcasts** configuration/inputs to everyone else.

---

# 1) Basic Collective Communications

## 1.1 Broadcast: `MPI_Bcast`

**Goal:** Copy a buffer from one "root" rank to all ranks.

```c
MPI_Bcast(a, n, MPI_FLOAT, root, MPI_COMM_WORLD);
```

**Semantics**

- Every rank calls `MPI_Bcast` with the same `n`, datatype, `root`, communicator.
- On `root`: buffer `a` is the source.
- On non-root ranks: buffer `a` is overwritten with root's data.
- Blocking: returns when `a` is safe to use on that rank.

**Mental model:** rank 1 holds `[4,2]` and after `MPI_Bcast(... root=1 ...)` all ranks have `[4,2]`.

---

## 1.2 Reduce: `MPI_Reduce`

**Goal:** Combine per-rank buffers into one result on the root, using an associative operator.

```c
MPI_Reduce(a, a_sum, n, MPI_FLOAT, MPI_SUM, root, MPI_COMM_WORLD);
```

**Semantics**

- Each rank provides input buffer `a` (length `n`).
- Root receives output buffer `a_sum` (length `n`).
- Combination is elementwise across ranks (e.g. sums per element).
- **Not allowed:** `a` and `a_sum` being the same variable.
- Blocking: completes when input has been contributed; root has output.

**Operations shown:** `MPI_SUM`, also `MPI_PROD`, `MPI_MAX`, `MPI_MIN`, logical ops, and location-aware variants `MPI_MAXLOC/MPI_MINLOC`.

**Mental model:** four ranks each contribute 2 ints; root gets the elementwise sum `[16,20]`.

---

## 1.3 Allreduce: `MPI_Allreduce`

**Goal:** Like Reduce, but every rank receives the reduced result.

```c
MPI_Allreduce(a, a_sum, n, MPI_FLOAT, MPI_SUM, MPI_COMM_WORLD);
```

**Semantics**

- Functionally similar to `MPI_Reduce` followed by `MPI_Bcast`,
    but implementations can do better than naïve composition.
- Blocking: every rank returns with `a_sum` populated.

**Mental model:** every rank ends up with the same `[16,20]`.

---

# 2) More Advanced Collective Communications

## 2.1 Gather: `MPI_Gather`

**Goal:** Collect fixed-size blocks from all ranks onto the root, concatenated in rank order.

```c
MPI_Gather(a, n, MPI_FLOAT,
           b, n, MPI_FLOAT,
           root, MPI_COMM_WORLD);
```

**Semantics**

- Each rank sends `n` elements from `a`.
- Root receives `n * P` elements in `b` laid out as:
    `b[0..n-1]` from rank 0, `b[n..2n-1]` from rank 1, etc.
- Root must allocate `b` with capacity ≥ `n*P`.

**Mental model:** with `n=2, P=4`, root ends up with an 8-element array formed by concatenating each rank's 2-element `a`.

---

## 2.2 Allgather: `MPI_Allgather`

**Goal:** Like Gather, but the gathered buffer is replicated on all ranks.

```c
MPI_Allgather(a, n, MPI_FLOAT,
              b, n, MPI_FLOAT,
              MPI_COMM_WORLD);
```

**Semantics**

- Equivalent "in effect" to `MPI_Gather` then `MPI_Bcast`, but optimised.
- Every rank allocates `b` of size `n*P`.

---

## 2.3 Scatter: `MPI_Scatter`

**Goal:** Root splits a large buffer into rank-ordered chunks and distributes them.

```c
MPI_Scatter(a, n, MPI_FLOAT,
            b, n, MPI_FLOAT,
            root, MPI_COMM_WORLD);
```

**Semantics**

- Root has `a` with at least `n*P` elements.
- Rank `r` receives chunk `a[r*n : (r+1)*n]` into `b`.
- Non-root ranks' `a` argument is ignored in practice (but still must be a valid pointer in C codebases; common convention is to pass `NULL` when allowed by your MPI).

**Mental model:** an 8-element array on root is split into 4 chunks of length 2, one per rank.

---

## 2.4 All-to-all: `MPI_Alltoall`

**Goal:** Every rank sends a distinct chunk to every other rank (full exchange).

```c
MPI_Alltoall(a, n, MPI_FLOAT,
             b, n, MPI_FLOAT,
             MPI_COMM_WORLD);
```

**Semantics**

- Each rank's send buffer `a` is logically partitioned into `P` chunks of size `n`.
- Chunk `i` is sent to rank `i`.
- Receive buffer `b` stores the chunk received from each rank in rank order.
- Both `a` and `b` need capacity ≥ `n*P`.

**Mental model:** with `n=1, P=4`, each rank contributes one element to each other rank; each rank's `b` ends up containing 4 values—one from each sender.

---

# 3) Collective vs Point-to-Point: Ordering Rules

## 3.1 Point-to-point ordering is not enough

MPI guarantees that point-to-point messages **arrive in the order they were sent**, but the receiver can still *choose* to receive them in a different order by specifying different tags—*if buffering allows it*. The lecture's example shows why this can be "unsafe" when synchronous semantics occur (deadlock risk).

## 3.2 Collective calls must match in the same order

Collectives have **no tags**. Therefore **the sequence of collective calls is matched strictly by call order**.

The lecture gives an explicit "wrong program" pattern: rank 0 broadcasts `a` then `b`, rank 1 calls in the same order, but another rank calls `b` then `a`. Result: that rank receives swapped values (or you trigger undefined behaviour depending on the collective and implementation). The "Before/After" table on the last slide shows rank 2 ending with `(a,b)=(10,5)` rather than `(5,10)` due purely to mismatched call order.

**Rule:** every rank must execute collectives in the **same order** on the **same communicator**, with argument compatibility.

---

## Summary

- **Collectives** are standard communication patterns implemented efficiently by MPI libraries.
- Core operations:
    - `MPI_Bcast`: root → all (replicate data).
    - `MPI_Reduce`: all → root (combine via operator).
    - `MPI_Allreduce`: all → all (combine + replicate).
    - `MPI_Gather`/`MPI_Allgather`: concatenate rank blocks to root / to all.
    - `MPI_Scatter`: root splits and distributes blocks.
    - `MPI_Alltoall`: full exchange of fixed-size blocks.
- **Ordering constraint:** collectives must be called in the same order everywhere; there are no tags to "disambiguate."

---

## PX457 Implementation Checklist (C)

1. Rank 0 reads `N` and broadcasts it with `MPI_Bcast`.
2. Each rank computes a local sum; combine with `MPI_Reduce` and `MPI_Allreduce` and compare.
3. Create a distributed array with `MPI_Scatter`, locally modify, then `MPI_Gather` to reconstruct on root.
4. Demonstrate `MPI_Alltoall` by transposing a block-partitioned vector/matrix layout.
5. Add a deliberate collective-order bug (swap two `MPI_Bcast` calls on one rank) and explain the observed mismatch, referencing the lecture's example.
