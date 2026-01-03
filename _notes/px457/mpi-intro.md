---
layout: page
title: "MPI: Introduction"
---

### *MPI-01 : Programming with MPI (Introduction & Basic Functions)*

---

## Conceptual Overview

Whereas **OpenMP** parallelises threads within *one process* and a **shared memory space**,

**MPI (Message Passing Interface)** coordinates *multiple processes*, each with its own memory.

| Model | Execution unit | Memory | Communication |
| --- | --- | --- | --- |
| **OpenMP** | Threads | Shared | Implicit load/store |
| **MPI** | Processes | Distributed | Explicit message passing |

MPI programs are typically *SPMD* — **Single Program, Multiple Data** — all processes execute the same code but on different data partitions.

---

## Architecture Recap

- **MIMD** = Multiple Instruction, Multiple Data
    
    → many CPUs running different instruction streams on separate data chunks.
    
- MPI targets clusters or HPC nodes connected via a **network interconnect**.

Each process:

- Has its **own address space**.
- Communicates by **sending and receiving messages**.
- Is identified by a unique **rank** within a *communicator*.

---

## MPI Essentials

| Concept | Description |
| --- | --- |
| **MPI process** | An independent program instance launched by `mpiexec`. |
| **Communicator** | A group of processes that can talk to each other. Default: `MPI_COMM_WORLD`. |
| **Rank** | Unique integer ID ∈ [0, P − 1]. |
| **SPMD pattern** | All ranks run same code; behaviour controlled by rank checks. |

MPI is a **standard**, not a single library: implemented by **OpenMPI**, **MPICH**, Intel MPI, etc.

---

## Why MPI?

- Scales beyond a single machine or memory domain.
- Handles problems too large for one node (e.g. weather models, AI training).
- Portable across supercomputers and clusters.
- Can be combined with OpenMP → *hybrid parallelism*.

---

## Programming Model

### Compilation

```bash
mpicc myprog.c    # wraps gcc and links MPI libraries
```

### Execution

```bash
mpiexec -np 4 ./a.out
```

→ launches 4 independent processes with ranks 0 – 3.

Each process has **no shared variables** with the others.

---

## Basic MPI Lifecycle

### 1. Initialise

```c
#include <mpi.h>

int main(int argc, char **argv) {
    MPI_Init(&argc, &argv);   // Start MPI environment
```

- Must be called **before** any MPI function.
- Usually takes `&argc`, `&argv` so MPI can strip runtime flags if needed.

---

### 2. Query communicator

```c
int p, my_rank;
MPI_Comm_size(MPI_COMM_WORLD, &p);      // total processes
MPI_Comm_rank(MPI_COMM_WORLD, &my_rank); // this process's rank
```

All processes belong to `MPI_COMM_WORLD` by default.

---

### 3. Do parallel work

```c
printf("Hello PX457 from rank %d of %d\n", my_rank, p);
```

Each process prints independently — output order is undefined.

---

### 4. Finalise

```c
MPI_Finalize();   // Tear down MPI environment
return 0;
}
```

After this call, no MPI communication is allowed.

---

## Full "Hello World" Example

```c
#include <stdio.h>
#include <stdlib.h>
#include <mpi.h>

int main(int argc, char **argv) {
    int my_rank, p;

    MPI_Init(&argc, &argv);
    MPI_Comm_rank(MPI_COMM_WORLD, &my_rank);
    MPI_Comm_size(MPI_COMM_WORLD, &p);

    printf("Hello PX457 from rank %d of %d\n", my_rank, p);

    MPI_Finalize();
    return EXIT_SUCCESS;
}
```

Compile & run:

```bash
mpicc hello.c -o hello
mpiexec -np 4 ./hello
```

Sample output (unordered):

```
Hello PX457 from rank 2 of 4
Hello PX457 from rank 0 of 4
Hello PX457 from rank 1 of 4
Hello PX457 from rank 3 of 4
```

---

## Error Handling

MPI functions return an integer status code:

```c
int err = MPI_Init(&argc, &argv);
if (err != MPI_SUCCESS) { /* handle error */ }
```

…but by default, MPI aborts on error — explicit checking is often unnecessary.

---

## Summary

| Step | Function | Purpose |
| --- | --- | --- |
| 1 | `MPI_Init(&argc,&argv)` | Start MPI runtime |
| 2 | `MPI_Comm_size(MPI_COMM_WORLD,&p)` | Query total processes |
| 3 | `MPI_Comm_rank(MPI_COMM_WORLD,&rank)` | Query this process's ID |
| 4 | `MPI_Finalize()` | Gracefully shut down |

---

## Takeaways for PX457

1. MPI = distributed memory → explicit data transfer required (next lectures).
2. All MPI codes follow the same *init–work–finalize* skeleton.
3. **Communicators & ranks** define process topology.
4. Use `mpiexec -np P` to test scaling on SCRTP cluster.
5. Prepare to extend this with **point-to-point communication (send/recv)** in Lecture 11.
