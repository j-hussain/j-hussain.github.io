---
layout: page
title: "MPI: Point-to-Point Communication"
---

Two ranks must exchange their boundary arrays. Each sends first and then receives. The program works for a small array, then hangs for a larger one. Nothing about the mathematics changed. What changed was an assumption that a send would always find enough buffering to return.

This chapter extends the [separate-address-space model](/notes/px457/mpi-intro#processes) with three precise questions: which receive matches a message, when may a buffer be reused, and can the calls make progress without circular waiting?

<h2 id="matching">1. An envelope identifies the conversation</h2>

A message has a payload and an envelope: source, destination, tag and communicator context. Ranks are interpreted within the communicator. A receive's source is the **sender's rank**, not the destination argument the sender used.

```c
/* Executed on rank 0; the communicator has at least two ranks. */
int a = 42;
MPI_Send(&a, 1, MPI_INT, 1, 999, MPI_COMM_WORLD);
```

```c
/* Executed on rank 1. */
int b;
MPI_Status status;
MPI_Recv(&b, 1, MPI_INT, 0, 999, MPI_COMM_WORLD, &status);
```

The count is elements, not bytes. Corresponding basic C datatypes include `MPI_CHAR`, `MPI_INT`, `MPI_LONG`, `MPI_FLOAT` and `MPI_DOUBLE`. Sender and receiver must supply compatible type signatures; receive capacity must be sufficient. Derived datatypes permit different memory layouts, but are not needed here.

`MPI_ANY_SOURCE` and `MPI_ANY_TAG` broaden matching; `status.MPI_SOURCE` and `status.MPI_TAG` identify the actual match. Use `MPI_STATUS_IGNORE` when status is unnecessary. Wildcards are convenient but can introduce nondeterministic choice between available messages.

Within an ordered single-threaded sender, MPI's [nonovertaking rule](https://www.mpi-forum.org/docs/mpi-4.1/mpi41-report/node68.htm) constrains messages that could match the same receive. It is not a global arrival-order guarantee across sources or distinct tags.

A correct payload is insufficient when its envelope belongs to a different conversation. Try a matching and a mismatched tag while holding the participants and context fixed.

<PX457Animation scene="envelope" />

<h2 id="completion">2. Blocking means a local completion condition</h2>

| Send mode   | Blocking / nonblocking     | What the mode commits to                                                          |
| ----------- | -------------------------- | --------------------------------------------------------------------------------- |
| Standard    | `MPI_Send` / `MPI_Isend`   | May buffer or wait for a matching receive; do not rely on buffering               |
| Synchronous | `MPI_Ssend` / `MPI_Issend` | Send completion requires a matching receive to have started receiving             |
| Buffered    | `MPI_Bsend` / `MPI_Ibsend` | Uses sufficient attached buffering; buffer sizing is the application's obligation |
| Ready       | `MPI_Rsend` / `MPI_Irsend` | Valid only if the matching receive is already posted                              |

A completed blocking send permits reuse of the send buffer. It does **not** generally mean the receiver has returned from its receive. A completed receive makes the received data available locally. Buffered sends are not guaranteed instantaneous, and insufficient attached space is an error rather than a portable fallback. Ready sends require a proof of the precondition, not a guess about timing.

<h2 id="example">3. Many senders, one receiver</h2>

The original square-of-rank example separates computation from communication:

```c
#include <stdio.h>
#include <mpi.h>

int main(int argc, char **argv) {
    int rank, p, a;
    MPI_Init(&argc, &argv);
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &p);

    if (rank != 0) {
        a = rank * rank;
        MPI_Send(&a, 1, MPI_INT, 0, 999, MPI_COMM_WORLD);
    } else {
        for (int src = 1; src < p; ++src) {
            MPI_Recv(&a, 1, MPI_INT, src, 999,
                     MPI_COMM_WORLD, MPI_STATUS_IGNORE);
            printf("Rank %d sent %d\n", src, a);
        }
    }
    MPI_Finalize();
    return 0;
}
```

Assume ranks are small enough that `rank*rank` fits in `int`. Compile with `mpicc squares.c -o squares` and launch with `mpiexec -np 4 ./squares`. Rank zero requests sources in increasing order; a later sender may wait, but there is no cycle because rank zero eventually posts each required receive. With one rank, the receive loop is empty.

<h2 id="deadlock">4. Draw the wait-for cycle</h2>

For **exactly two ranks**, `partner=1-rank` identifies the peer:

```c
MPI_Send(a, n, MPI_FLOAT, partner, 999, MPI_COMM_WORLD);
MPI_Recv(b, n, MPI_FLOAT, partner, 999,
         MPI_COMM_WORLD, MPI_STATUS_IGNORE);
```

If each standard send waits for a matching receive, neither rank reaches its receive. The implementation has not changed `MPI_Send` into another API mode; standard-mode semantics simply permit this lack of buffering.

<Figure id="px457-deadlock" title="A cycle of prerequisites" caption="Both ranks require the other rank to post a receive before their send can complete. Neither reaches that receive. Small-message buffering can hide the cycle, so success with a small buffer is not a correctness argument.">
<svg viewBox="0 0 360 145" role="img" aria-label="Rank zero waiting in send for rank one's receive, and rank one waiting in send for rank zero's receive, forming a cycle" style={{width: "100%", height: "auto"}}>
<g fill="none" stroke="currentColor"><rect x="10" y="30" width="130" height="60"/><rect x="220" y="30" width="130" height="60"/><path d="M142 45H215 M208 39L215 45L208 51 M218 77H145 M152 71L145 77L152 83"/></g>
<g fill="currentColor" fontSize="13"><text x="27" y="52">rank 0: send</text><text x="27" y="75">receive later</text><text x="237" y="52">rank 1: send</text><text x="237" y="75">receive later</text><text x="40" y="125">each waits for the other's later action</text></g>
</svg>
</Figure>

For a pair, ordering one rank receive-then-send and the other send-then-receive breaks the cycle. A more direct expression is:

```c
MPI_Sendrecv(a, n, MPI_FLOAT, partner, 999,
             b, n, MPI_FLOAT, partner, 999,
             MPI_COMM_WORLD, MPI_STATUS_IGNORE);
```

`MPI_Sendrecv` combines the two operations so this matching exchange need not depend on buffering. It is not an atomic transaction, nor does it repair mismatched ranks, tags or counts. Send and receive buffers must be disjoint; `MPI_Sendrecv_replace` is a different API for a shared buffer.

In a ring, send to `(rank+1)%p` and receive from `(rank+p-1)%p`. All ranks can call `MPI_Sendrecv` with these neighbours and compatible tags. The same pattern will implement Cartesian halo transfers.

Watch the two schedules unfold. The important change is the availability of a matching receive, rather than the apparent speed of a small test message.

<PX457Animation scene="deadlock" />

<h2 id="requests">5. Initiation and completion can be separate</h2>

`MPI_Isend` and `MPI_Irecv` initiate operations and return requests. Later wait/test calls establish completion. This can break blocking-order cycles **if all needed operations are posted before waiting**, and can expose useful overlap. Immediately waiting for an unmatchable send before posting its receive reproduces the dependency problem.

The [nonblocking send documentation](https://docs.open-mpi.org/en/main/man-openmpi/man3/MPI_Isend.3.html) makes buffer lifetime central: do not modify the send data before completion; do not access incoming data before its receive completes. “Fire and forget” is an unsafe analogy. [Advanced MPI](/notes/px457/mpi-advanced) develops the full overlap pattern.

### Exercises

1. Turn the square-sender example into a ring using `MPI_Sendrecv`; check the received value against the source rank.
2. For a two-rank experiment, replace sends with `MPI_Ssend` in the unsafe ordering. Use a timeout and explain the wait-for graph rather than treating a hang as a performance measurement.
3. Explain why a standard send returning does not prove the receiver has used the value.
4. Make a table of source, destination, tag and communicator for each message in your exchange before writing code.

Point-to-point operations describe individual edges. [Collectives](/notes/px457/mpi-collective) express common communication patterns as a group operation.
