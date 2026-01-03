---
layout: page
title: "MPI: Advanced MPI"
---

### *MPI-05: Advanced MPI*

---

## Conceptual Focus

This lecture is about **performance realism** in distributed-memory codes:

1. **Non-blocking point-to-point communication** to *overlap* halo exchange with computation (hide latency).
2. **Hybrid OpenMP/MPI** to match the structure of modern clusters (shared-memory nodes connected by a network).
3. What MPI enables, what it costs, and what the course is intentionally not covering.

---

# 1) Non-blocking Communication

## 1.1 Motivation: halo exchange in domain decomposition

In the domain decomposition picture, boundary elements need fresh halo values before boundary updates. A naïve iteration does:

1. send boundary → neighbours
2. receive halo ← neighbours
3. update all elements

That is correct, but it can **stall**: processes wait doing no compute while messages traverse the network.

---

## 1.2 Latency-hiding algorithm (the key idea)

The lecture proposes an alternative per-iteration schedule:

1. initiate sends (boundary → neighbours)
2. initiate receives (halo ← neighbours)
3. compute **interior** updates (don't need halo)
4. wait for send completion
5. wait for receive completion
6. compute **boundary** updates (now halo available)

This is the standard "overlap comms with compute" pattern.

---

## 1.3 Blocking send modes recap

Completion conditions:

| Function | Completion condition / behaviour |
| --- | --- |
| `MPI_Send` | implementation chooses buffered vs synchronous |
| `MPI_Ssend` | completes when data received/acknowledged by target |
| `MPI_Bsend` | completes when data copied into a comms buffer |

### Buffered send requires explicit buffer management

MPI requires you to supply and attach a buffer:

```c
int s1;
MPI_Pack_size(n, MPI_DOUBLE, MPI_COMM_WORLD, &s1);

double *b = malloc(s1 + MPI_BSEND_OVERHEAD);
MPI_Buffer_attach(b, s1 + MPI_BSEND_OVERHEAD);

/* ... MPI_Bsend ... */

MPI_Buffer_detach(&b, &s1);
free(b);
```

Pragmatically for PX457: you usually prefer `MPI_Isend`/`MPI_Irecv` + waits, rather than relying on `MPI_Bsend`.

---

## 1.4 Non-blocking send/recv API

Non-blocking variants:

| Function | Completion condition / notes |
| --- | --- |
| `MPI_Isend` | like `MPI_Send` but returns immediately |
| `MPI_Issend` | like `MPI_Ssend` but returns immediately |
| `MPI_Ibsend` | like `MPI_Bsend` but returns immediately |
| `MPI_Irecv` | non-blocking receive |

### Requests: how you track an outstanding operation

Non-blocking calls return a **request handle**:

```c
MPI_Request send_req, recv_req;

MPI_Isend(sendbuf, n, MPI_DOUBLE, dest, stag, MPI_COMM_WORLD, &send_req);
MPI_Irecv(recvbuf, n, MPI_DOUBLE, srce, rtag, MPI_COMM_WORLD, &recv_req);
```

---

## 1.5 Waiting and status

You complete non-blocking ops with `MPI_Wait`:

```c
MPI_Status recv_status;

MPI_Wait(&send_req, MPI_STATUS_IGNORE);
MPI_Wait(&recv_req, &recv_status);
```

Critical rule (explicit in lecture):

- Between `MPI_I*` and the matching `MPI_Wait`, **you must not touch** the send or receive buffer.
    - Send: don't overwrite `sendbuf` until wait completes.
    - Receive: don't read `recvbuf` until wait completes.

Useful variants:

- `MPI_Waitall`, `MPI_Waitany` for arrays of requests
- `MPI_Test`, `MPI_Testall`, `MPI_Testany` to poll completion (avoid blocking)

Status fields remain the same as blocking receives: `MPI_SOURCE`, `MPI_TAG`, `MPI_ERROR`.

---

## 1.6 Why it helps: latency dominates

The lecture's performance statement: MPI transfer cost is typically dominated by **latency** (time-to-send a zero-sized message), not by the byte transmission itself.

So the win comes from:

- doing enough interior computation while messages are "in flight" to **hide** some/all latency
- improving surface-to-volume ratio: subdomains with **small boundary** (communication) relative to **volume** (compute) benefit more

---

# 2) Hybrid OpenMP/MPI

## 2.1 Motivation: clusters of shared-memory nodes

Most supercomputers are "MPI between nodes, OpenMP within node." The Avon example: ~48 cores per node, shared memory per node, plus a high-speed network between nodes.

Problem: too many MPI tasks per node can contend for network resources.

Solution: fewer MPI ranks (often 1 per node or a small number), each using OpenMP threads for intra-node parallelism.

---

## 2.2 Thread support: `MPI_Init_thread`

Hybrid programs must ask MPI what level of thread support it provides:

```c
int required = MPI_THREAD_FUNNELED;
int provided;

MPI_Init_thread(&argc, &argv, required, &provided);
if (provided != required) {
    printf("Required thread support unavailable!\n");
    MPI_Abort(MPI_COMM_WORLD, 1);
}
```

Thread levels:

- `MPI_THREAD_SINGLE`: no threading
- `MPI_THREAD_FUNNELED`: only the master thread makes MPI calls (common, pragmatic)
- `MPI_THREAD_SERIALIZED`: any thread may call MPI, but only one at a time
- `MPI_THREAD_MULTIPLE`: fully thread-safe MPI calls from any thread

For PX457-style hybrid jobs, **FUNNELED** is usually the intended assumption: do OpenMP work, exit parallel region, then do MPI calls.

---

## 2.3 Example: OpenMP reduction + MPI reduction (funneled)

Lecture example: OpenMP reduces into `a`, then MPI reduces across ranks into `b`.

```c
int a = 0, b = 0;

#pragma omp parallel default(shared) reduction(+:a)
{
    int tid = omp_get_thread_num();
    int nthreads = omp_get_num_threads();
    a = my_rank * nthreads + tid;
}

MPI_Reduce(&a, &b, 1, MPI_INT, MPI_SUM, 0, MPI_COMM_WORLD);
```

Key design: the MPI call is **outside** the OpenMP parallel region.

---

## 2.4 Compiling hybrid programs

Because `mpicc` is a wrapper, you can pass OpenMP flags through it:

```bash
mpicc -fopenmp my_hybrid_program.c -o hybrid
```

---

## 2.5 Running hybrid programs (threads × ranks)

Example: run 2 MPI ranks, 4 OpenMP threads each.

```bash
export OMP_NUM_THREADS=4
mpiexec -np 2 ./hybrid
```

Practical note from lecture: making a hybrid code *agnostic* to how you factor "total parallelism" into ranks vs threads is non-trivial; you need careful design to avoid assumptions baked into your decomposition.

---

## 2.6 Slurm: Avon hybrid job parameters

The lecture provides a template submission script and explains parameter coupling.

Core fields:

- `-nodes`: number of physical nodes (MPI scaling)
- `-ntasks-per-node`: MPI ranks per node
- `-cpus-per-task`: OpenMP threads per rank
- `OMP_NUM_THREADS=$SLURM_CPUS_PER_TASK`

Avon constraint highlighted: 48 cores per node, so:

(ntasks-per-node) × (cpus-per-task) ≤ 48.

---

# 3) MPI Summary and What's Not Covered

## 3.1 Not covered (but important in real codes)

The lecture lists major MPI capabilities beyond course scope:

- **MPI-IO** (coordinated parallel file I/O)
- **One-sided comms** (`MPI_Get`, `MPI_Put`, windows via `MPI_Win_create`)
- **Non-blocking collectives** (combine overlap with collectives)

## 3.2 MPI standard evolution

MPI-4 and MPI-5 are mentioned, with adoption lag as a practical reality; libraries may take years to implement full standard feature sets. MPI version support can be queried via `MPI_Get_version()`.

## 3.3 Bottom-line summary

MPI remains the only widely used, standards-based approach for large-scale distributed-memory parallelism; with good design, codes can scale to very large core counts, but you must manage deadlock safety and latency/bandwidth tradeoffs.

---

## Summary

- **Non-blocking MPI** (`MPI_Isend`/`MPI_Irecv` + `MPI_Wait*`) enables **asynchronous communication** and can hide **latency** by computing interior work while halo exchanges are in flight.
- You must not touch send/recv buffers between initiation and completion.
- **Hybrid OpenMP/MPI** matches modern clusters: fewer MPI ranks per node, OpenMP threads per rank; verify MPI thread support with `MPI_Init_thread`.
- Slurm hybrid jobs require consistent choices of nodes, tasks-per-node, and CPUs-per-task; on Avon the product must not exceed 48 cores/node.

---

## PX457 Implementation Checklist (C)

1. Implement 2D halo exchange with `MPI_Isend`/`MPI_Irecv` (4 neighbours), update interior, then `MPI_Waitall`, then update boundary.
2. Benchmark blocking (`MPI_Sendrecv`) vs non-blocking overlap; explain results using the lecture's latency-hiding rationale.
3. Convert to hybrid: each rank updates its subdomain using `#pragma omp parallel for` and performs MPI comms outside the parallel region (FUNNELED).
4. Write a Slurm script using `-ntasks-per-node` and `-cpus-per-task`, exporting `OMP_NUM_THREADS`, and ensure the 48-core constraint holds.
