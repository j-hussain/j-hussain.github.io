---
layout: page
title: "MPI: Point-to-Point Connection"
---

### *MPI-02 : Point-to-Point Communication*

---

## Conceptual Focus

OpenMP handled **implicit data sharing** through memory.

MPI requires **explicit message exchange** between *processes*.

Two fundamental communication styles:

| Category | Description | Typical Use |
| --- | --- | --- |
| **Point-to-point** | One sender → one receiver | Direct coordination |
| **Collective** | One-to-many, many-to-one, all-to-all | Reductions, broadcasts (next lecture) |

This lecture focuses on the **point-to-point** model:

`rank 0 → rank 1` or more generally `srce ↔ dest`.

---

## MPI Send/Receive Primitives

MPI offers several send modes, each in *blocking* and *non-blocking* form.

| Send Mode | Blocking | Non-blocking | Semantics |
| --- | --- | --- | --- |
| **Standard** | `MPI_Send` | `MPI_Isend` | Buffered or synchronous depending on message size |
| **Synchronous** | `MPI_Ssend` | `MPI_Issend` | Sender waits for receiver "ready" ack |
| **Buffered** | `MPI_Bsend` | `MPI_Ibsend` | Sender copies to user-supplied buffer, returns immediately |
| **Ready** | `MPI_Rsend` | `MPI_Irsend` | Requires receiver to have already posted receive |

Receivers use:

```c
MPI_Recv(void *buf, int count, MPI_Datatype type,
         int srce, int tag, MPI_Comm comm,
         MPI_Status *status);
```

---

## Basic Send Example

```c
int a = 42;
MPI_Send(&a, 1, MPI_INT, 1, 999, MPI_COMM_WORLD);
```

### Parameters

| Argument | Meaning |
| --- | --- |
| `&a` | Address of data (array or variable) |
| `1` | Number of elements (not bytes) |
| `MPI_INT` | Datatype (portable MPI constant) |
| `1` | Destination rank |
| `999` | *Tag* to identify the message |
| `MPI_COMM_WORLD` | Communicator both ranks share |

---

## Receive Example

```c
int b;
MPI_Status stat;
MPI_Recv(&b, 1, MPI_INT,
         0, 999, MPI_COMM_WORLD, &stat);
```

- `srce = 0` must match sender's destination.
- `tag = 999` must match sender's tag.
- Wildcards: `MPI_ANY_SOURCE`, `MPI_ANY_TAG`.
- After completion, `stat.MPI_SOURCE` and `stat.MPI_TAG` contain actual values.
- `MPI_STATUS_IGNORE` can be used if the status isn't needed.

---

## Message "Envelope"

Every message has:

1. **Data payload** → the buffer and datatype.
2. **Envelope metadata** → source, destination, tag, communicator.

MPI automatically matches senders to receivers using this envelope.

---

## Supported Datatypes (C)

| C Type | MPI Equivalent |
| --- | --- |
| `char` | `MPI_CHAR` |
| `int` | `MPI_INT` |
| `long` | `MPI_LONG` |
| `float` | `MPI_FLOAT` |
| `double` | `MPI_DOUBLE` |

Use these for *portability* across architectures.

---

## Worked Example — Hello MPI (Exchange)

```c
#include <stdio.h>
#include <mpi.h>

int main(int argc, char **argv) {
    int my_rank, p, a;
    MPI_Status status;

    MPI_Init(&argc, &argv);
    MPI_Comm_rank(MPI_COMM_WORLD, &my_rank);
    MPI_Comm_size(MPI_COMM_WORLD, &p);

    if (my_rank != 0) {
        a = my_rank * my_rank;
        MPI_Send(&a, 1, MPI_INT, 0, 999, MPI_COMM_WORLD);
    } else {
        for (int srce = 1; srce < p; ++srce) {
            MPI_Recv(&a, 1, MPI_INT, srce, 999,
                     MPI_COMM_WORLD, &status);
            printf("Proc %d sent %d\n", srce, a);
        }
    }

    MPI_Finalize();
    return 0;
}
```

Compile → `mpicc -o mpi_hello mpi_hello.c`

Run → `mpiexec -np 4 ./mpi_hello`

---

## Deadlock in Point-to-Point

### Problem

Two processes both send before either receives:

```c
int partner = 1 - my_rank;
MPI_Send(a, n, MPI_FLOAT, partner, 999, MPI_COMM_WORLD);
MPI_Recv(b, n, MPI_FLOAT, partner, 999, MPI_COMM_WORLD, &stat);
```

If both `MPI_Send`s choose **synchronous** mode → both block forever.

This is **deadlock** — each process waits for the other's receive.

---

### Ways to Avoid Deadlock

| Strategy | Example | Note |
| --- | --- | --- |
| **Re-order calls** | Rank 0 sends first, Rank 1 receives first | simplest fix |
| **Use non-blocking** | `MPI_Isend` + `MPI_Irecv` | overlap communication/computation |
| **Use `MPI_Bsend`** | explicit buffer | sender never waits |
| **Use `MPI_Sendrecv`** | combined safe exchange | recommended pattern |

---

## Safe Two-Way Exchange

```c
MPI_Sendrecv(a, m, MPI_FLOAT, dest, send_tag,
             b, n, MPI_FLOAT, srce, recv_tag,
             MPI_COMM_WORLD, &status);
```

- Merges `Send` + `Recv` into one call.
- Avoids deadlock automatically.
- `srce` and `dest` may be identical; `a` and `b` must not alias.

---

## Blocking vs Non-blocking (Preview)

| Type | Functions | Behaviour |
| --- | --- | --- |
| **Blocking** | `MPI_Send`, `MPI_Recv` | Return when operation complete |
| **Non-blocking** | `MPI_Isend`, `MPI_Irecv` | Return immediately; must `MPI_Wait` later |

Non-blocking calls enable *overlap* of communication and computation — explored in later lectures.

---

## Summary

| Concept | Key Idea | Analogy |
| --- | --- | --- |
| Point-to-point | Explicit messages between ranks | "Phone call" |
| Tags | Distinguish multiple messages | Envelope label |
| Blocking vs non-blocking | Completion semantics | Wait vs fire-and-forget |
| Deadlock | Mutual blocking on synchronous sends | Two people both talking, neither listening |
| `MPI_Sendrecv` | Atomic exchange | Safe two-way channel |

---

## PX457 Lab Checklist

1. Modify the Hello-MPI example so each rank sends to `(rank + 1) % p`.
2. Intentionally cause a deadlock using `MPI_Ssend` to observe behaviour.
3. Replace with `MPI_Sendrecv` to fix it.
4. Record timing with large messages to compare buffered vs synchronous behaviour.
5. Summarise safety and performance trade-offs in your report.
