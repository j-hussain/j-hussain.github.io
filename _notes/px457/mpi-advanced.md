---
layout: page
title: "MPI: Nonblocking Communication and Hybrid Programs"
---

A stencil's interior needs only locally owned values. Its boundary needs the [halo values](/notes/px457/mpi-communicators#geometry) from neighbouring ranks. Waiting for the halo before computing **any** point introduces an unnecessary dependency. Nonblocking communication lets the program express the actual dependency: only boundary updates must wait.

<h2 id="overlap">1. Overlap is a schedule with a buffer-lifetime proof</h2>

For a two-buffer stencil, let `old` remain unchanged during the step and write results into distinct `next`. Post receives into separate ghost storage, post sends of old boundary data, compute independent interior points, complete requests, then compute boundary points.

```c
/* One neighbour shown. Tags and peers must match remotely.
   Buffers are disjoint; old_face stays unchanged during the exchange. */
MPI_Request req[2];
MPI_Irecv(halo, n, MPI_DOUBLE, src, 10, comm, &req[0]);
MPI_Isend(old_face, n, MPI_DOUBLE, dst, 10, comm, &req[1]);
update_interior(old, next);
MPI_Waitall(2, req, MPI_STATUSES_IGNORE);
update_boundary(old, halo, next);
```

For a two-dimensional stencil, post each required face receive and send before waiting; use distinct requests and correct direction/tag conventions. Posting receives first often helps the implementation place incoming data directly, although nonblocking sends can be posted first if the overall matching schedule is sound. Complete sends before modifying or swapping away their source storage.

Between initiation and completion, the application must not modify a send buffer; reading immutable send data is allowed. It must not access a receive buffer while MPI may write it. Those lifetime rules, documented for [nonblocking sends](https://docs.open-mpi.org/en/main/man-openmpi/man3/MPI_Isend.3.html), explain why an in-place stencil is harder to overlap safely than a two-buffer stencil.

<Figure id="px457-overlap" title="Remove the interior's unnecessary wait" caption="A teaching schedule with communication cost 4 and independent interior work 6, in arbitrary time units. Serial phases take 10 before boundary work; ideal overlap takes 6. The lower timeline assumes sufficient communication progress while computation runs, which must be verified for the MPI implementation.">
<svg viewBox="0 0 360 200" role="img" aria-label="Serial schedule communication four units then interior six units; overlap schedule communication and interior start together and finish after six units" style={{width: "100%", height: "auto"}}>
<g fill="currentColor" fontSize="13"><text x="10" y="23">wait first: 4 + 6 = 10</text><text x="10" y="104">overlap: max(4, 6) = 6</text></g>
<g fill="var(--sci-accent)" fillOpacity="0.25" stroke="currentColor"><rect x="20" y="35" width="120" height="30"/><rect x="20" y="115" width="120" height="28"/></g>
<g fill="none" stroke="currentColor" strokeDasharray="4 3"><rect x="140" y="35" width="180" height="30"/><rect x="20" y="148" width="180" height="28"/></g>
<g fill="currentColor" fontSize="12"><text x="30" y="55">communication</text><text x="185" y="55">interior</text><text x="30" y="134">communication</text><text x="80" y="167">interior</text><text x="20" y="195">0</text><text x="190" y="195">6</text><text x="310" y="195">10</text></g>
</svg>
</Figure>

In an ideal overlap model,

$$
T_{\mathrm{step}}\approx T_{\mathrm{post}}+
\max(T_{\mathrm{comm}},T_{\mathrm{interior}})+T_{\mathrm{boundary}}.
$$

Without overlap, the maximum becomes a sum. This states the opportunity, not a guaranteed speedup: progress can depend on MPI calls, progress threads, network offload and resource contention. `MPI_Test`/`Testall`/`Testany` poll requests; `Wait`/`Waitall`/`Waitany` wait for completion. Polling too often can cost more than it saves. A latency-dominated small message and a bandwidth-dominated large message require different interpretations of the [alpha–beta model](/notes/px457/mpi-communicators#collective-cost).

Only the boundary requires the incoming halo. Let communication and independent work share the timeline, keeping the boundary dependency visible.

<PX457Animation scene="overlap" />

### Why not always use a buffered send?

`MPI_Bsend` uses an attached user-supplied buffer. For one outstanding message, a traditional setup is:

```c
int packed, attached_bytes;
void *buffer;
MPI_Pack_size(n, MPI_DOUBLE, comm, &packed);
attached_bytes = packed + MPI_BSEND_OVERHEAD;
buffer = malloc((size_t)attached_bytes);
if (buffer == NULL) MPI_Abort(comm, 1);
MPI_Buffer_attach(buffer, attached_bytes);
/* MPI_Bsend(...): ensure enough space for all outstanding messages. */
MPI_Buffer_detach(&buffer, &attached_bytes);
free(buffer);
```

Assume byte-count addition fits `int` and include `stdlib.h`. Several pending messages need corresponding aggregate space and overhead, not this one-message bound. Detaching can wait until buffered data no longer needs the buffer. Nonblocking standard sends usually express lifetime and overlap more directly; neither approach removes matching obligations. `MPI_Ssend` completion means the matching receive has begun receiving, not necessarily that its caller has returned.

<h2 id="hybrid">2. Hybrid reduction composes two ownership levels</h2>

A node contains shared-memory cores, while nodes communicate across an interconnect. Fewer MPI ranks, each with OpenMP threads, can reduce duplicated state and change network communication. It can also introduce thread overhead, NUMA effects or weaker locality. Pure MPI and hybrid decompositions should be compared, not ranked universally.

Request an MPI thread-support level and check that the **provided** level is sufficient:

```c
int provided;
MPI_Init_thread(&argc, &argv, MPI_THREAD_FUNNELED, &provided);
if (provided < MPI_THREAD_FUNNELED)
    MPI_Abort(MPI_COMM_WORLD, 1);
```

The standard levels are ordered:

| Level                   | Contract                                                            |
| ----------------------- | ------------------------------------------------------------------- |
| `MPI_THREAD_SINGLE`     | Only one thread executes                                            |
| `MPI_THREAD_FUNNELED`   | Multiple threads, but only the thread that initialised MPI calls it |
| `MPI_THREAD_SERIALIZED` | Multiple threads may call MPI, never concurrently                   |
| `MPI_THREAD_MULTIPLE`   | Multiple threads may call MPI concurrently                          |

A stronger provided level is acceptable; testing `provided != required` would reject it incorrectly. Under FUNNELED, an arbitrary OpenMP `single` thread is insufficient because it need not be the initialising thread. The simple course pattern returns to that thread outside the parallel region before MPI calls. See [MPI thread initialisation](https://docs.open-mpi.org/en/main/man-openmpi/man3/MPI_Init_thread.3.html).

The source's reduction example illustrates the composition:

```c
int a = 0, b = 0;
#pragma omp parallel reduction(+:a)
{
    int tid = omp_get_thread_num();
    int nt = omp_get_num_threads();
    a = my_rank * nt + tid;
}
MPI_Reduce(&a, &b, 1, MPI_INT, MPI_SUM, 0, MPI_COMM_WORLD);
```

Each thread contributes once to its process-local sum; the MPI call then combines rank-local sums. If every rank has the same team size $Q$, the contributions enumerate $0,\ldots,PQ-1$, so root should obtain $PQ(PQ-1)/2$, assuming all intermediates fit `int`. With varying team sizes, `rank*nt+tid` no longer defines a unique contiguous global worker numbering. Real data ownership must account for that possibility.

Follow the values across both ownership levels. The first merge uses thread-private contributions; the second uses process-local sums.

<PX457Animation scene="hybrid" />

<h2 id="allocation">3. A resource request is part of the experiment</h2>

```bash
mpicc -O2 -fopenmp hybrid.c -o hybrid
export OMP_NUM_THREADS=4
mpiexec -np 2 ./hybrid
```

This asks for two processes with four threads each; placement and binding still depend on the launcher. In Slurm, the corresponding fields use **double hyphens**:

```bash
#!/bin/bash
#SBATCH --nodes=2
#SBATCH --ntasks-per-node=2
#SBATCH --cpus-per-task=4
export OMP_NUM_THREADS="$SLURM_CPUS_PER_TASK"
srun ./hybrid
```

This is a structural template, not a site-ready submission script: partition, account, time limit and MPI integration are site-specific. On the lecture's 48-core-per-node Avon example, ranks per node times threads per rank must fit the allocated cores, at most 48 under that stated configuration. Do not treat that historical machine limit as a universal cluster property. Check core binding and NUMA placement as well as arithmetic resource counts.

<h2 id="scope">4. What the introductory model leaves out</h2>

MPI also supports coordinated MPI-IO, one-sided windows with `Get`/`Put`, and nonblocking collectives. These provide more choices about ownership and overlap; they are not required to understand the present examples. The [MPI document archive](https://www.mpi-forum.org/docs/) records standard revisions, while `MPI_Get_version` queries the implementation's reported standard version. Availability of a standard does not prove the local library supports every feature you intend to use.

### Exercises and continuation

1. Implement four-face halo exchange with distinct old/new arrays. Mark each buffer's lifetime and every point that may depend on incoming data.
2. Compare blocking exchange, immediate waits, and interior-overlap schedules. Verify the same numerical update before comparing time.
3. For equal team sizes, verify the hybrid worker-sum formula for several rank/thread combinations, including one of each.
4. Explain why a stronger MPI thread level is sufficient but a FUNNELED call from an arbitrary `single` thread can be invalid.

OpenMP and MPI have exposed concrete sources of waiting: serial dependencies, imbalance, communication and synchronisation. [Performance metrics](/notes/px457/metrics) turns these into a quantitative model of scaling.
