---
layout: page
title: "MPI: Introduction"
---

An OpenMP thread can read a shared array element once the appropriate ordering is established. A process on another node cannot dereference that element's address. The change from shared to distributed memory is therefore a change in the algorithm's obligations: **data ownership and data transfer become explicit**.

MPI, the Message Passing Interface, is a standard for communication between processes. Implementations include Open MPI and MPICH. It can be used across nodes or between processes on the same node; “MPI” does not imply that every message crosses a network.

<h2 id="processes">1. Same program, separate state</h2>

Most examples use **SPMD**, single program, multiple data. Every process starts the same executable, but rank-dependent control flow and different inputs give it different work. SPMD is a programming pattern; [MIMD](/notes/px457/memory-architecture#models) describes independently progressing instruction streams. The two are compatible.

| Model       | Worker                | Ordinary storage                     | How another worker obtains a value  |
| ----------- | --------------------- | ------------------------------------ | ----------------------------------- |
| OpenMP here | Thread in one process | Shared or private according to scope | Shared loads, with correct ordering |
| MPI here    | Process               | Separate address space               | Explicit communication              |

If every rank declares `int a = 0`, there are $P$ independent objects called `a`. Setting rank zero's `a` to 42 does not update any other rank's object. Later MPI facilities can expose shared-memory or remote-memory windows, but those are explicit mechanisms beyond this introductory model.

A **communicator** supplies an ordered group of processes and a communication context. In our intracommunicator examples, a **rank** is an integer $r\in\{0,\ldots,P-1\}$ identifying a process **within that communicator**. The same process can have a different rank in another communicator. `MPI_COMM_WORLD` initially includes all processes in the World-model job.

<Figure id="px457-address-spaces" title="One name does not imply one object" caption="All ranks run the same source, but each owns a separate a. A message copies a value into a receiver's object; it does not turn the objects into one shared variable. The drawing is logical and also applies to ranks placed on one node.">
<svg viewBox="0 0 360 155" role="img" aria-label="Rank 0 has a equals 42, ranks 1 and 2 have a equals zero in separate address spaces; a message must carry 42 from rank zero to rank one" style={{width: "100%", height: "auto"}}>
<g fill="none" stroke="currentColor"><rect x="5" y="20" width="105" height="75"/><rect x="127" y="20" width="105" height="75"/><rect x="249" y="20" width="105" height="75"/><path d="M58 102V128H178V102 M172 109L178 102L184 109" strokeDasharray="4 3"/></g>
<g fill="currentColor" fontSize="13"><text x="25" y="45">rank 0</text><text x="25" y="73">a = 42</text><text x="147" y="45">rank 1</text><text x="147" y="73">a = 0</text><text x="269" y="45">rank 2</text><text x="269" y="73">a = 0</text><text x="70" y="150">explicit message</text></g>
</svg>
</Figure>

Make the separation literal: changing one object should leave the other two untouched. A message is an additional event, not an automatic consequence of assignment.

<PX457Animation scene="address" />

<h2 id="lifecycle">2. Initialise, identify, compute, finalise</h2>

The World-model program begins with `MPI_Init` (or the threaded form introduced later) and ends with `MPI_Finalize`. Initialise before communication or communicator queries. Some inquiry routines are legal before initialisation or after finalisation; the rule is not literally “no MPI function may be called”.

```c
#include <stdio.h>
#include <stdlib.h>
#include <mpi.h>

int main(int argc, char **argv) {
    int rank, p;
    MPI_Init(&argc, &argv);
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &p);
    printf("Hello PX457 from rank %d of %d\n", rank, p);
    MPI_Finalize();
    return EXIT_SUCCESS;
}
```

The addresses `&argc,&argv` permit the implementation to process command-line arguments. The communicator queries return this process's rank and the group size. Every process prints once; output may be interleaved or reordered by the launcher. A plausible order is ranks 2, 0, 1, 3, but none is promised.

`MPI_Finalize` is collective over the relevant connected World-model processes. Complete pending communications first. It does not mean that all ranks' standard-output text will appear neatly sorted, and no further World-model communication may follow it.

<h2 id="running">3. Compilation and placement are separate choices</h2>

```bash
mpicc hello.c -o hello
mpiexec -np 4 ./hello
```

`mpicc` is a compiler wrapper: it supplies MPI headers and libraries to a configured underlying compiler, which is not necessarily GCC. `mpiexec` requests four processes; scheduler integration, allocation and affinity determine where they run. On a managed cluster, follow the site's launcher and batch-system instructions rather than assuming a login node is an execution resource.

Four ranks on one node are useful for correctness tests. They do not reproduce the network costs of four nodes. A scaling report must state ranks per node, threads per rank, binding and problem partition as well as total process count.

### Errors have a policy as well as a return code

MPI routines commonly return an integer error code. Many communication errors invoke a default error handler that aborts rather than returning control normally. An application can select `MPI_ERRORS_RETURN` on a communicator and inspect returned codes, but MPI does not guarantee that every erroneous program can recover and continue correctly. Do not treat an unchecked failure as a valid result or assume a returned error repairs inconsistent collective participation.

The [Open MPI initialisation documentation](https://docs.open-mpi.org/en/main/man-openmpi/man3/MPI_Init_thread.3.html) distinguishes the World model used here from the newer Sessions model. This course's examples retain the init–work–finalise structure rather than mixing the two.

<h2 id="decomposition">4. Ownership comes before communication</h2>

For a simple divisible array length $N=Pn$, rank $r$ can own global indices $rn,\ldots,(r+1)n-1$. Every index has one owner, so independent elementwise work requires no communication during the kernel. A stencil is different: the first owned element may need its neighbour from another rank. That value becomes a **halo** or **ghost** value: a local copy of remotely owned data.

This is the distributed-memory version of the dependency question in [OpenMP](/notes/px457/openmp-dependencies#dependences). We still draw producer–consumer edges. Now some edges must be implemented by messages.

A decomposition becomes a communication problem exactly where a calculation needs a value owned by another rank. Compare an independent update with a nearest-neighbour stencil on the same partition.

<PX457Animation scene="halos" />

### Exercises and continuation

1. Modify the hello program so each rank prints its own local `a`, after only rank zero changes its value. Predict the result first.
2. For $N=12,P=3$, list each rank's indices and the remotely owned values needed by a nearest-neighbour stencil.
3. Compile and launch with the site's supported commands. Record placement separately from process count.

[Point-to-point communication](/notes/px457/mpi-point-to-point) supplies the operations that carry a value across an ownership boundary, together with the completion rules that make reusing its buffer safe.
