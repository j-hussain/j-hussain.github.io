---
layout: page
title: "MPI: Communicators and Cartesian Topologies"
---

A two-dimensional stencil is local in geometry: each subdomain needs four neighbouring faces. World-rank numbers contain no geometry by themselves. We need both a way to name neighbours and a way to keep a row's collective separate from another row's collective.

A communicator answers **who participates and which communication context is used**. A topology adds **logical coordinates and adjacency**. These extend the [rank-local ownership model](/notes/px457/mpi-intro#processes); they do not change its separate memory spaces.

<h2 id="contexts">1. A communicator is more than a list of ranks</h2>

An intracommunicator combines an ordered group with a context. Two communicators can contain the same processes yet have independent message matching. A library can therefore communicate internally without accidentally receiving the application's message with the same tag. `MPI_Comm` is an opaque handle: pass it to MPI, do not inspect its representation.

### Split by colour, order by key

```c
MPI_Comm_split(parent, colour, key, &child);
```

All members of `parent` participate. Equal colours form a group; increasing key determines rank order within that group, with parent rank breaking ties. `MPI_UNDEFINED` excludes a process and gives it `MPI_COMM_NULL`.

For $P=N^2$ ranks in an explicitly chosen row-major logical arrangement:

```c
/* All ranks have checked that P is a positive perfect square. */
int N = (int)sqrt((double)P);
int row = world_rank / N;
MPI_Comm row_comm;
MPI_Comm_split(MPI_COMM_WORLD, row, world_rank, &row_comm);
/* Row-local rank is world_rank % N for this ordering. */
MPI_Comm_free(&row_comm);
```

Include `math.h`; test `N*N==P` safely rather than silently truncating a nonsquare process count. Rank zero in a row communicator need not be world rank zero. `MPI_Comm_split_type` with `MPI_COMM_TYPE_SHARED` instead forms groups able to create a shared-memory region, commonly node-local groups:

```c
MPI_Comm_split_type(MPI_COMM_WORLD, MPI_COMM_TYPE_SHARED,
                    world_rank, MPI_INFO_NULL, &node_comm);
```

All world ranks call it. This supplies a useful hardware-local grouping without assuming that consecutive world ranks share a node.

<h2 id="groups">2. Select an arbitrary ordered subset</h2>

Groups describe membership without creating a communication context:

```c
MPI_Group world_group, column_group;
MPI_Comm column_comm;
int column[] = {1, 5, 9, 13};  /* requires at least 14 world ranks */
MPI_Comm_group(MPI_COMM_WORLD, &world_group);
MPI_Group_incl(world_group, 4, column, &column_group);
MPI_Comm_create(MPI_COMM_WORLD, column_group, &column_comm);

if (column_comm != MPI_COMM_NULL) {
    /* Collective operations here involve just the four selected ranks. */
    MPI_Comm_free(&column_comm);
}
MPI_Group_free(&column_group);
MPI_Group_free(&world_group);
```

`MPI_Comm_create` is collective over the parent communicator; all its members must call it with consistent group information for this example. Excluded ranks receive `MPI_COMM_NULL` and must not use that as a communicator. In the new ordering, world rank 1 is local rank 0; a broadcast rooted there uses `root=0`, not `root=1`. Free groups and communicators once no longer needed.

<h2 id="cartesian">3. Attach the geometry to the rank space</h2>

For sixteen ranks, create a periodic four-by-four topology:

```c
int dims[2] = {4, 4};
int periods[2] = {1, 1};
MPI_Comm cart;
MPI_Cart_create(MPI_COMM_WORLD, 2, dims, periods, 1, &cart);
int rank, coords[2];
MPI_Comm_rank(cart, &rank);
MPI_Cart_coords(cart, rank, 2, coords);
```

The final `1` permits reordering for placement; it does not guarantee that a particular physical mapping is used. If fewer processes are included than exist in the parent, excluded ranks get `MPI_COMM_NULL`; guard usage. The fixed example assumes exactly sixteen ranks.

`MPI_Cart_rank(cart, coords, &rank)` is the inverse query. Cartesian ranks use row-major coordinate ordering, but **world ranks may differ after reordering**. Always query ranks in the communicator actually used by the communication.

<Figure id="px457-cartesian" title="Neighbourhood is geometric, rank is contextual" caption="A 4×4 Cartesian communicator in its own rank order. Rank 9 has coordinates (2,1): neighbours 5 and 13 in dimension 0, 8 and 10 in dimension 1. These are Cartesian ranks; do not substitute world ranks when reordering was allowed. Periodicity connects opposite edges, omitted here for clarity.">
<svg viewBox="0 0 360 225" role="img" aria-label="Four by four grid with Cartesian rank 9 at row 2 column 1 highlighted and connected to ranks 5, 13, 8 and 10" style={{width: "100%", height: "auto"}}>
<g fill="none" stroke="currentColor"><path d="M65 25H285V201H65Z M65 69H285 M65 113H285 M65 157H285 M120 25V201 M175 25V201 M230 25V201"/><path d="M147 91V179 M92 135H202" stroke="var(--sci-accent)" strokeWidth="3"/></g>
<rect x="121" y="114" width="53" height="42" fill="var(--sci-accent)" fillOpacity="0.2"/>
<g fill="currentColor" fontSize="14" textAnchor="middle"><text x="92" y="52">0</text><text x="147" y="52">1</text><text x="202" y="52">2</text><text x="257" y="52">3</text><text x="92" y="96">4</text><text x="147" y="96">5</text><text x="202" y="96">6</text><text x="257" y="96">7</text><text x="92" y="140">8</text><text x="147" y="140">9</text><text x="202" y="140">10</text><text x="257" y="140">11</text><text x="92" y="184">12</text><text x="147" y="184">13</text><text x="202" y="184">14</text><text x="257" y="184">15</text></g>
</svg>
</Figure>

The Cartesian layout names positions, while a world rank names a process in a different communicator. Follow the same highlighted process through a possible reordering and a row-local naming scheme.

<PX457Animation scene="topology" />

### Query the neighbours, then exchange

```c
int src, dst;
MPI_Cart_shift(cart, 0, 1, &src, &dst);
MPI_Sendrecv(send_face, n, MPI_DOUBLE, dst, 10,
             recv_face, n, MPI_DOUBLE, src, 10,
             cart, MPI_STATUS_IGNORE);
```

Direction zero and displacement one give the negative-direction source and positive-direction destination. Dimension one gives left/right neighbours in the pictured convention. A negative displacement reverses the roles. Nonperiodic boundaries return `MPI_PROC_NULL`: sends and receives with it complete as no-ops, and a receive leaves the buffer unchanged. You must therefore initialise physical-boundary ghost values; MPI does not supply the boundary condition.

In a periodic two-by-two grid, positive and negative neighbours along a dimension are the same rank. Keep face buffers and tags/directional exchange conventions distinct so two different halos are not confused.

### Slice a grid into rows or columns

```c
int keep_row[2] = {0, 1}; /* let column coordinate vary */
int keep_col[2] = {1, 0}; /* let row coordinate vary */
MPI_Cart_sub(cart, keep_row, &row_comm);
MPI_Cart_sub(cart, keep_col, &col_comm);
```

A row reduction then calls `MPI_Allreduce` on `row_comm`, not `cart`. All Cartesian processes participate in forming their subcommunicators, then each slice communicates independently. To reproduce the same groups with `MPI_Comm_split`, use **Cartesian coordinates** for colour/key; world-rank arithmetic is insufficient if ranks were reordered.

<h2 id="geometry">4. Surface-to-volume ratio predicts a scaling limit</h2>

A square local subdomain of side $\ell$ contains $\ell^2$ points. A width-one four-face halo transfers approximately $4\ell$ values, ignoring corners. Hence

$$
\frac{\text{halo size}}{\text{local work size}}\approx\frac4\ell.
$$

For a fixed global square with $N$ points along each side and a square process grid, $\ell=N/\sqrt P$. The ratio grows as $4\sqrt P/N$. Adding processes shrinks useful local work faster than boundary traffic: one reason strong scaling eventually degrades. This is a geometric count, before latency and network contention are included.

<h2 id="collective-cost">5. A topology suggests algorithms, not one guaranteed implementation</h2>

Use a simple message model

$$
T_{\mathrm{message}}(m)=\alpha+\beta m,
$$

where $m$ is bytes, $\alpha$ startup latency and $\beta$ seconds per byte. It excludes congestion and overlap. A root-to-all loop or serial ring propagation needs $P-1$ stages; a binomial tree can broadcast in $\lceil\log_2P\rceil$ stages, with different link loads.

For an allreduce of $m$ bytes per rank, a chunked ring has a reduce-scatter phase of $P-1$ rounds and an allgather phase of $P-1$ rounds. Ignoring local reduction cost,

$$
T_{\mathrm{ring}}\approx2(P-1)\alpha+
                         2\frac{P-1}{P}\beta m.
$$

For $P=2^k$, recursive doubling exchanges partial results with partner `rank ^ (1<<j)` at stage $j$. A full-buffer allreduce can take $k$ exchanges for scalars **or arrays**, approximately $k(\alpha+\beta m)$ plus local reduction work. A reduce-then-broadcast tree takes about $2k$ stages; the source's “arrays require $2k$” refers to such a choice, not an intrinsic array requirement.

Fewer startup rounds favour small messages. Less total per-rank transferred data can favour bandwidth-oriented algorithms for large messages. Logical ring adjacency does not guarantee physical proximity. MPI libraries choose among implementations; measure the library's `MPI_Allreduce` before writing a custom replacement.

The formulas count different kinds of rounds. Follow the recursive-doubling partners, then compare the two phases of a chunked ring. The ring view tracks chunk traffic and phase, rather than pretending each chunk is a full rank-local sum.

<PX457Animation scene="allreduce" />

### Exercises and continuation

1. For sixteen ranks, tabulate world rank, Cartesian rank, coordinates and row-local rank. Repeat with reordering permitted; do not assume the implementation must reorder.
2. Verify rank 9's neighbours and periodic boundary neighbours via queries. Explain what `MPI_PROC_NULL` does **not** initialise.
3. Compare row communicators formed with Cartesian splitting and coordinate-based `Comm_split`.
4. Compare ring and recursive-doubling cost models as $m$ grows. Which omitted effects might reverse their prediction?

We can now identify the exact remote values needed by a stencil. [Advanced MPI](/notes/px457/mpi-advanced) asks how to compute its interior while those values are being transferred.

### References

[MPI standard documents](https://www.mpi-forum.org/docs/) for communicator, group and topology semantics; [point-to-point ordering](https://www.mpi-forum.org/docs/mpi-4.1/mpi41-report/node68.htm) for matching and buffering constraints.
