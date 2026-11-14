---
layout: page
title: "MPI: Collective Communications"
---

Every rank holds a local array. Rank zero needs either all arrays in order, or their elementwise sum. Those are different mathematical objects. Gathering concatenates data; reducing combines corresponding values. Choosing the operation begins with specifying the desired result, before selecting an MPI routine.

[Point-to-point messages](/notes/px457/mpi-point-to-point#matching) describe individual transfers. A **collective** describes a pattern involving all members of a communicator. The library can choose an implementation suited to message size and hardware, while the application states the data movement or algebra it needs.

<h2 id="layouts">1. Read the result's shape first</h2>

Take three ranks with two values each:

$$
a^{(0)}=(1,2),\qquad a^{(1)}=(3,4),\qquad a^{(2)}=(5,6).
$$

Gather produces $(1,2,3,4,5,6)$, a vector of length six. Sum-reduce produces $(9,12)$, a vector of length two. The reduction is **across ranks at each element**, not a sum over each local array followed by an implicit second reduction.

<Figure id="px457-collective-shapes" title="Concatenation versus combination" caption="The same rank-labelled inputs give two different outputs. Gather retains all six values in rank order. Reduce applies an operator to each aligned column. Root is chosen by the caller; allgather/allreduce distribute the corresponding result to every rank.">
<svg viewBox="0 0 360 200" role="img" aria-label="Inputs rank zero 1 2, rank one 3 4, rank two 5 6. Gather output 1 2 3 4 5 6. Sum reduce output 9 12" style={{width: "100%", height: "auto"}}>
<g fill="currentColor" fontSize="14"><text x="10" y="25">rank 0       [1, 2]</text><text x="10" y="53">rank 1       [3, 4]</text><text x="10" y="81">rank 2       [5, 6]</text><text x="10" y="138">gather:   [1, 2 | 3, 4 | 5, 6]</text><text x="10" y="180">reduce:  [1+3+5, 2+4+6] = [9, 12]</text></g>
<path d="M10 101H345" stroke="currentColor" strokeDasharray="4 4"/>
</svg>
</Figure>

All examples below are intracommunicator collectives with compatible types, valid significant buffers, count `n>=0` and root in $[0,P)$. Here every local block has the same length. Variable-count routines such as `Gatherv` extend this case but are outside the original material.

Now trace where each input value goes. Watch whether the root retains separate positions or combines corresponding entries.

<PX457Animation scene="collective" />

<h2 id="broadcast">2. Replicate a decision: broadcast</h2>

Often only a designated rank reads standard input reliably under the launcher. Have it read the configuration, then broadcast:

```c
MPI_Bcast(a, n, MPI_FLOAT, root, MPI_COMM_WORLD);
```

The root supplies the values in its `a`; other ranks' `a` buffers receive them. Each rank calls the operation, including the root. In these simple examples counts and datatypes agree; the more general MPI requirement is compatible type signatures. The root's rank and communicator must agree everywhere.

Returning from this blocking call makes the local buffer safe for subsequent use. It does not make the call a general barrier proving that every other rank has returned.

A broadcast need not make the root perform every transfer. Once another rank has the value, it can help forward it. Count the propagation rounds here; the topology chapter will examine what those rounds cost.

<PX457Animation scene="broadcast" />

<h2 id="reduce">3. Combine contributions: reduce and allreduce</h2>

```c
MPI_Reduce(a, sum, n, MPI_FLOAT, MPI_SUM, root, MPI_COMM_WORLD);
MPI_Allreduce(a, sum, n, MPI_FLOAT, MPI_SUM, MPI_COMM_WORLD);
```

Use these as alternative operations for the same inputs, not as a requirement to call both. `Reduce` makes the result available on root; its receive buffer is insignificant elsewhere. `Allreduce` gives every rank the combined result. It is equivalent in effect to reduce-then-broadcast, but need not use that algorithm.

Operations include `MPI_SUM`, `MPI_PROD`, `MPI_MAX`, `MPI_MIN`, logical operations, and location-returning `MPI_MAXLOC`/`MPI_MINLOC` with suitable datatypes. Reduction operators must obey the MPI algebraic contract. Mathematical addition is associative; floating-point addition is only approximately so, and different reduction trees can change rounding.

Ordinary input/output buffers must not overlap. MPI has an explicit in-place convention: for an intracommunicator `MPI_Reduce`, root can use `MPI_IN_PLACE` as its send buffer, with its contribution already in the receive buffer; in-place allreduce is also supported. Do not alias ordinary pointers and assume that is equivalent. See the [MPI reduction reference](https://docs.open-mpi.org/en/main/man-openmpi/man3/MPI_Reduce.3.html).

A distributed scalar sum usually has two stages:

$$
s_r=\sum_{i\in I_r}x_i,
\qquad s=\sum_{r=0}^{P-1}s_r.
$$

An [OpenMP reduction](/notes/px457/openmp-variables-synchronisation#synchronisation) can compute $s_r$ inside each process; MPI then combines processes. This algebra will return in hybrid programming.

<h2 id="gather">4. Retain contributions: gather and allgather</h2>

```c
MPI_Gather(a, n, MPI_FLOAT, b, n, MPI_FLOAT, root, MPI_COMM_WORLD);
MPI_Allgather(a, n, MPI_FLOAT, b, n, MPI_FLOAT, MPI_COMM_WORLD);
```

For gather, root allocates `n*P` elements in `b`; its block from rank $r$ occupies offsets $rn$ through $(r+1)n-1$. The receive count is **per sender**, not total. The root contributes a block too. For allgather, every rank allocates the full output. Replication can cost substantial memory; use it only when every rank needs every block.

<h2 id="scatter">5. Assign blocks: scatter</h2>

```c
MPI_Scatter(a, n, MPI_FLOAT, b, n, MPI_FLOAT, root, MPI_COMM_WORLD);
```

Root's `a` contains `n*P` elements. Rank $r$ receives the rank-$r$ block into local `b`. Root's send buffer is insignificant on non-root ranks and can be `NULL` there; every rank still needs a valid receive buffer for a positive count. An argument being insignificant is an MPI semantic fact, not permission to use an invalid significant buffer.

Scatter → local computation → gather is a useful initial decomposition. It can also bottleneck on the root's memory and traffic; a scalable implementation may construct or read each partition locally instead.

<h2 id="alltoall">6. Transpose ownership: all-to-all</h2>

```c
MPI_Alltoall(a, n, MPI_FLOAT, b, n, MPI_FLOAT, MPI_COMM_WORLD);
```

Every rank allocates `n*P` send and receive elements. Denote by $A_{rs}$ the block on rank $r$ intended for rank $s$. After the operation, rank $s$ holds blocks $A_{0s},\ldots,A_{P-1,s}$ in source-rank order. The operation transposes the two rank indices, not the elements inside each block. This view explains its role in distributed transposes and FFT decompositions.

<h2 id="order">7. Collective order identifies the conversation</h2>

Collectives have no user tag. Participating ranks must issue matching collectives in the same order on a communicator, with compatible arguments. They must not assume a blocking collective synchronises unrelated subsequent communication as a barrier would.

Consider two broadcasts with identical types, counts and root. Root broadcasts `a=5` then `b=10`; one receiver passes its local `b` first, then its local `a`. The calls can legally match **by sequence**, leaving that receiver with `b=5,a=10`: MPI cannot know which variable name you intended. If ranks instead disagree on roots or collective kinds, the program can be erroneous or deadlock. This distinction is more useful than labelling every swapped variable a library error.

<PredictReveal question="Root broadcasts a and then b. Another rank calls the same two broadcasts but passes b first and a second. Do variable names help MPI match the intended values?" choices={[{id:"names",label:"Yes: a matches a"},{id:"order",label:"No: calls match by order"}]} answer="order" explanation={<p>MPI does not transmit C variable names. With compatible signatures and root, the first call matches the first call, so that rank can receive the values into the opposite variables. Check both call order and semantic buffer meaning.</p>} />

### Exercises and continuation

1. Reproduce the gather and reduce outputs in the opening example. Then replace reduce with allreduce and state who owns the result.
2. Broadcast `N`, scatter an array, square each local block, and gather it. State the divisibility and allocation assumptions.
3. Let `a[s] = 100*rank + s` with one element per destination. Predict every receive buffer after all-to-all.
4. Compare MPI sums against a serial reference with cancellation-prone inputs and a stated tolerance.

The communicator has so far been `MPI_COMM_WORLD`. [Communicators and topologies](/notes/px457/mpi-communicators) lets us restrict a collective to a row, distinguish independent conversations and express geometric neighbours.
