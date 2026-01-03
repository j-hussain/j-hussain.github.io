---
layout: page
title: "MPI: MPI Communicators"
---

### *MPI-04: MPI Communicators*

---

## Conceptual Focus

MPI scales by **domain decomposition**: each process owns a subdomain of the global problem, and exchanges boundary ("halo") data with neighbours. The lecture's 2D periodic grid sketch shows 4 MPI tasks laid out in a (2×2) grid; each task needs "up/down/left/right" halo values from adjacent ranks.

To implement this cleanly you need answers to:

- Where am I in the logical processor grid?
- Which ranks are my neighbours?
- How many processes exist along each dimension?
- How do I structure communication so only the relevant processes participate?

MPI's solution is **communicators**, plus optional **topologies** attached to them.

---

## 1) Communicators (what they are and why you care)

### 1.1 Definitions

- A **communicator** is a *context* in which a set of processes can communicate.
- Default is `MPI_COMM_WORLD` (all processes).
- In C, communicator handles have type `MPI_Comm` and are **opaque** (you don't inspect internals; you pass them to MPI calls).

Key operational implication:

- **Point-to-point and collective operations only occur within a communicator.**
- Creating sub-communicators lets you structure complex codes (e.g., row-wise collectives, neighbour exchange groups) without global coordination overhead.

---

### 1.2 Splitting a communicator: `MPI_Comm_split`

**Use case:** arrange (P=N²) ranks into an (N×N) logical grid, then create per-row communicators.

```c
MPI_Comm_split(existing_comm, split_id, split_key, &split_comm);
```

Arguments (lecture's terminology):

- `existing_comm`: communicator being split (e.g. `MPI_COMM_WORLD`)
- `split_id`: "color" (which subgroup this rank belongs to)
- `split_key`: ordering within the new communicator
- `split_comm`: output communicator handle for this rank

**Row communicator example:**

```c
int world_rank, P;
MPI_Comm row_comm;

MPI_Comm_rank(MPI_COMM_WORLD, &world_rank);
MPI_Comm_size(MPI_COMM_WORLD, &P);

int N = (int)(sqrt((double)P));     // assuming perfect square
int row_id = world_rank / N;        // which row in an N×N grid

MPI_Comm_split(MPI_COMM_WORLD, row_id, world_rank, &row_comm);

/* ... communicate using row_comm ... */

MPI_Comm_free(&row_comm);
```

The mapping table shows: ranks with the same `row_id` are grouped, and using `world_rank` as the key preserves the intuitive left-to-right ordering inside each row.

---

### 1.3 Splitting by hardware locality: `MPI_Comm_split_type`

**Motivation:** processes on the same node share physical memory; intra-node MPI can be much faster than inter-node communication. Creating "shared-memory node" communicators enables hybrid designs (shared-memory optimisations, per-node leaders, etc.).

```c
MPI_Comm_split_type(MPI_COMM_WORLD,
                    MPI_COMM_TYPE_SHARED,
                    split_key, MPI_INFO_NULL,
                    &node_comm);
```

Notes:

- Must be called by all ranks in `MPI_COMM_WORLD`.
- Some implementations offer vendor-specific split types (e.g., NUMA-aware).

---

# 2) Groups and Communicators

## 2.1 What is a group?

A **group** is an ordered set of processes (still opaque). A **communicator** is effectively:

communicator = group + communication context.

Groups allow nontrivial selections like "processes 2, 4, 8, 13 but not 6".

## 2.2 Create a group from `MPI_COMM_WORLD`

```c
MPI_Group world_grp;
MPI_Comm_group(MPI_COMM_WORLD, &world_grp);
```

## 2.3 Include specific ranks: `MPI_Group_incl`

Example in the lecture uses a "column" subset:

```c
int column[] = {1, 5, 9, 13};
MPI_Group column_grp;
MPI_Group_incl(world_grp, 4, column, &column_grp);
```

Then free groups when done:

```c
MPI_Group_free(&column_grp);
MPI_Group_free(&world_grp);
```

(Freeing matters in long-running codes; `MPI_Finalize` will also clean up.)

## 2.4 Turn a group into a communicator: `MPI_Comm_create`

```c
MPI_Comm column_comm;
MPI_Comm_create(MPI_COMM_WORLD, column_grp, &column_comm);
```

Important behaviour: ranks not in the group get `MPI_COMM_NULL`.

So you must guard communicator usage:

```c
if (column_comm != MPI_COMM_NULL) {
    /* safe to call collectives/pt2pt on column_comm */
    MPI_Comm_free(&column_comm);
}
```

The lecture's example broadcasts within `column_comm`, which corresponds to world ranks (1 → 5,9,13).

---

# 3) Topologies

## 3.1 What a topology gives you

A topology attaches a logical addressing scheme to a communicator so ranks can answer:

- "What are my coordinates?"
- "Who are my neighbours?"
    This is **virtual** (not necessarily the physical interconnect).

This lecture focuses on **Cartesian (grid) topologies**.

---

## 3.2 Create a 2D Cartesian topology: `MPI_Cart_create`

For N=4, P=16:

```c
int dims[2]   = {4, 4};
int wrap[2]   = {1, 1};   // periodic in both dimensions
int reorder   = 1;        // MPI may reorder ranks for performance

MPI_Comm cart_comm;
MPI_Cart_create(MPI_COMM_WORLD, 2, dims, wrap, reorder, &cart_comm);
```

Meaning:

- `dims[d]`: number of processes along dimension (d).
- `wrap[d]=1`: periodic boundaries (torus); `0`: nonperiodic.
- `reorder=1`: MPI can remap ranks in `cart_comm` to better match hardware.

---

## 3.3 Rank ↔ coordinates: `MPI_Cart_coords` and `MPI_Cart_rank`

```c
int cart_rank, coords[2];
MPI_Comm_rank(cart_comm, &cart_rank);
MPI_Cart_coords(cart_comm, cart_rank, 2, coords);
```

Inverse:

```c
MPI_Cart_rank(cart_comm, coords, &cart_rank);
```

The lecture notes that ranks in `cart_comm` are row-major in the conceptual grid.

---

## 3.4 Neighbours: `MPI_Cart_shift`

This is the workhorse for halo exchange patterns.

```c
int src, dst;
MPI_Cart_shift(cart_comm, dir, 1, &src, &dst);
```

- `dir`: which dimension (0..ndims-1)
- `shift=1`: immediate neighbour
- returns neighbour ranks `src` (negative direction) and `dst` (positive direction)

Examples in the lecture:

- For process 9 in a (4×4) grid, shifting in `dir=0` by 1 gives `src=5`, `dst=13`.
- Shifting in `dir=1` by 1 gives `src=8`, `dst=10`.
- Negative shifts behave as expected (swap directions).
- On a boundary with **non-periodic** wrap, a neighbour may be `MPI_PROC_NULL`. Sending to / receiving from `MPI_PROC_NULL` is defined as a no-op, which simplifies edge handling.

Practical pairing:

- `MPI_Cart_shift` is commonly used to set up safe neighbour exchanges via `MPI_Sendrecv` (from Lecture 11).

---

## 3.5 Grid slicing: `MPI_Cart_sub`

This is the Cartesian-topology analogue of `MPI_Comm_split`, used to build row/column communicators for collectives.

```c
int remain_dims[2] = {0, 1};  // keep dim 1 (columns vary) => row slices
MPI_Comm row_comm;
MPI_Cart_sub(cart_comm, remain_dims, &row_comm);

int remain_dims2[2] = {1, 0}; // keep dim 0 => column slices
MPI_Comm col_comm;
MPI_Cart_sub(cart_comm, remain_dims2, &col_comm);
```

The diagram/table shows how `cart_comm` ranks map into `row_comm` (each row has ranks 0..3 locally) and `col_comm` (each column has ranks 0..3 locally).

---

# 4) Architecture of Collective Communications

## 4.1 Why discuss it?

MPI collectives are "built-in and optimised", but understanding typical implementations helps you reason about:

- latency vs bandwidth regimes,
- algorithmic step counts,
- and when you may need custom communication patterns.

## 4.2 Broadcast / reduce structures

The lecture sketches three patterns:

1. **Simple loop** (root sends to each rank): (P-1) steps
2. **Ring pass**: still (P-1) steps, but structured
3. **Tree/graph**: (log₂ P) steps

---

## 4.3 Ring-pass allreduce (chunked, pipelined)

A ring can implement allreduce by splitting data into (P) chunks to pipeline communication.

Mechanics:

- Each rank knows its ring neighbours via `MPI_Cart_shift(cart_comm, dir, 1, &src, &dst)`.
- Over (P-1) rounds, chunks circulate and partial reductions accumulate.
- Then another (P-1) rounds distribute the fully reduced chunks, giving total (2(P-1)) passes for full allreduce.

Key idea:

- Good for **large data** because it pipelines bandwidth and tends to use "nearby" links in the logical topology.

---

## 4.4 Butterfly (hypercube) allreduce

For P=2^N processes, butterfly reduces a scalar in N steps (and arrays in 2N steps as per lecture) by exchanging with a partner that differs in one bit of the rank each stage.

The hypercube mapping slide explicitly motivates converting ranks to binary so pairing is "flip bit (k)".

Key idea:

- Fewer rounds than ring → good when **latency dominates** (small messages, many ranks).

---

## 4.5 Latency vs bandwidth trade-off

The final slide states the practical performance heuristic:

- **Butterfly:** fewer messages/rounds → best for small data (minimise latency).
- **Ring-pass:** more rounds but predictable/pipelined transfers → best for large data (maximise bandwidth).
    MPI libraries typically choose internally at runtime for `MPI_Allreduce` based on message size and process count.

---

## Summary

- **Communicators** define who can communicate; they structure complex MPI programs beyond `MPI_COMM_WORLD`.
- `MPI_Comm_split` partitions a communicator using a color/key mechanism; `MPI_Comm_split_type` can split by hardware locality (e.g., shared-memory nodes).
- **Groups** allow arbitrary subsets; to communicate you must create a communicator, and excluded ranks receive `MPI_COMM_NULL` (must guard).
- **Cartesian topologies** (`MPI_Cart_create`) let you compute coordinates and neighbours cleanly (`MPI_Cart_shift`) and slice communicators for row/column collectives (`MPI_Cart_sub`).
- Collective operations can be implemented with **loop**, **ring**, or **tree/butterfly** patterns; performance depends on latency vs bandwidth regime.

---

## PX457 Implementation Checklist (C)

1. Assume (P=N²). Build `cart_comm` with periodic boundaries and query each rank's `(i,j)` coordinates using `MPI_Cart_coords`.
2. Use `MPI_Cart_shift` to compute four neighbours; implement halo exchange with `MPI_Sendrecv` and handle edges via `MPI_PROC_NULL` if nonperiodic.
3. Use `MPI_Cart_sub` to create `row_comm` and run `MPI_Allreduce` per row; verify only row ranks participate.
4. Recreate "row communicator" using `MPI_Comm_split` and confirm it matches the `MPI_Cart_sub` result.
5. Micro-benchmark `MPI_Allreduce` on small vs large buffers; interpret results using the lecture's butterfly-vs-ring latency/bandwidth discussion.
