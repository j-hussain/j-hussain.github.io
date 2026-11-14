/** PX457-only, reviewed scene catalogue. Durations are reading time, not CPU timings. */
function scene(
    chapter: string,
    title: string,
    prompt: string,
    choices: readonly [string, string],
    caption: string,
    outcome: string,
    stages = 8
) {
    return { chapter, title, prompt, choices, caption, outcome, stages, duration: 12 };
}
export const animationCatalog = {
    rounding: scene(
        "intro-hpc",
        "When a number falls between the marks",
        "Move an exact increment across the rounding midpoint. Which representable value keeps it?",
        ["Near 1", "Near 2"],
        "The increment sweeps across one binary32 spacing. The moving dot is the exact sum; the outlined dot is its rounded representation. Ties use round-to-nearest, ties-to-even.",
        "Rounding selects a representable neighbour. Doubling the magnitude from 1 to 2 doubles the spacing, even though the fraction still has 23 stored bits.",
        4
    ),
    energy: scene(
        "intro-hpc",
        "Watch power become energy",
        "The lower-power run takes longer. Predict whether the shaded area will still be smaller when it finishes.",
        ["Full power", "Lower power"],
        "Power is normalised to 1. The alternative uses power 0.8 for time 1.1. Areas use the same scales; the growing area is accumulated energy, not a measured machine trace.",
        "The baseline uses energy 1. The slower alternative uses 0.8 × 1.1 = 0.88, saving 12% while finishing 10% later.",
        11
    ),
    pipeline: scene(
        "intro-optimisation",
        "Let the pipeline fill",
        "Follow the same four instructions. Can the next one enter before the previous result exists?",
        ["Independent", "Dependent"],
        "A five-stage, one-issue teaching pipeline. Independent starts are one cycle apart; a dependent instruction waits five cycles for its predecessor. No stalls other than this chosen dependence are modelled.",
        "Four independent instructions finish after 8 cycles; the chain finishes after 20. Throughput and latency describe different restrictions.",
        20
    ),
    accumulators: scene(
        "intro-optimisation",
        "Unbraid a running sum",
        "Keep twelve additions fixed and change the number of accumulator chains. Watch which starts must wait.",
        ["One chain", "Three chains"],
        "Addition latency is three toy cycles and issue spacing is one. Three accumulators expose independent chains. The final combination is excluded from this small instruction schedule; reassociation changes floating-point rounding.",
        "The final input addition completes at cycle 36 with one chain and cycle 14 with three. Combining partial sums still costs work, and memory or issue limits can dominate.",
        12
    ),
    cache: scene(
        "memory-architecture",
        "Two streams compete for a cache slot",
        "Follow the line fills, then shift B by one cache line. Does the same pair still evict itself?",
        ["Conflicting B", "Padded B"],
        "The first four A/B reads use 16-word lines and four direct-mapped slots, initially empty. A starts at word 0; B at 64 or 80. Read misses only: stores and writebacks are excluded.",
        "The conflicting trace misses on all eight reads. Padding separates the current A/B blocks, so only the first read of each block misses.",
        8
    ),
    traversal: scene(
        "memory-architecture",
        "Read a matrix in physical order",
        "The matrix is unchanged. Switch the traversal and watch addresses, not just the visual direction of the cursor.",
        ["Across rows", "Down columns"],
        "A 4×4 C matrix is row-major. Each teaching cache line contains four elements; a one-line cache makes loss of locality explicit. Both traversals visit every element once, but this is not a column-sum rewrite.",
        "Row traversal fills four lines. Column traversal fills sixteen in this one-line model. Real cache capacities, prefetching and concurrent misses change the traffic and runtime.",
        16
    ),
    fork: scene(
        "openmp-parallels-work-sharing",
        "One thread opens into a team",
        "Follow the initial thread through fork, concurrent work and join. Try a different requested team size.",
        ["Two threads", "Four threads"],
        "This logical OpenMP region uses exactly the selected team size. The initial thread participates as thread zero. The drawing describes execution structure, not OS thread creation or a guaranteed speedup.",
        "All team members finish before the initial thread continues. A runtime may keep worker threads alive between parallel regions.",
        5
    ),
    ownership: scene(
        "openmp-parallels-work-sharing",
        "Who owns each call?",
        "Keep four workers and eight iterations. Change only whether the loop is work-shared.",
        ["Work-shared", "Replicated"],
        "Each moving tile is one call to work(i). A chosen contiguous partition executes eight calls; an ordinary loop inside a parallel region executes eight calls on each of four threads.",
        "Sharing an address space does not partition an iteration space. Work-sharing gives 8 calls; replication gives 32.",
        8
    ),
    race: scene(
        "openmp-variables-synchronisation",
        "Watch an update get lost",
        "Pause after both reads. Is the second write adding to memory, or storing a value calculated earlier?",
        ["Unordered updates", "Atomic order"],
        "Two increments start from zero. The unsynchronised view is one possible interleaving, not a definition of a data-racy program. The atomic view serialises these two updates.",
        "The illustrated race leaves 1; the ordered pair leaves 2. A later barrier cannot reconstruct an increment already lost.",
        6
    ),
    reduction: scene(
        "openmp-variables-synchronisation",
        "Many private sums become one",
        "Follow contributions through a balanced tree, then through a sequential combination. Which values are retained?",
        ["Tree combine", "Serial combine"],
        "Eight contributions 1 through 8 are combined with exact small-integer addition. Each arrow carries a partial sum. Different floating-point trees may produce different rounded answers.",
        "Both trees return 36. The balanced tree has three combination rounds; the serial chain has seven.",
        7
    ),
    scheduling: scene(
        "openmp-loop-scheduling",
        "Watch the longest worker finish",
        "Equal iteration counts can hide unequal work. Compare the same triangular rows under two assignments.",
        ["Contiguous", "Cyclic"],
        "Eight independent rows have costs 8 through 1. Four workers execute assigned rows consecutively. All bars use the same time scale and total work is 36.",
        "Contiguous loads are (15,11,7,3); cyclic loads are (12,10,8,6). Changing ownership reduces the longest load from 15 to 12, still above the mean 9.",
        15
    ),
    chunks: scene(
        "openmp-loop-scheduling",
        "A queue can also become work",
        "Smaller chunks let workers rebalance sooner. Watch the dispatch time that comes with each new chunk.",
        ["Chunks of 1", "Chunks of 2"],
        "A deterministic two-worker dynamic scheduler handles costs (8,7,…,1). Every chunk costs one abstract dispatch unit on its worker; dispatches may overlap. This additive teaching model is not OpenMP's exact runtime.",
        "Chunk size changes both indivisible load and dispatch count. Compare the resulting makespan rather than assuming finer chunks must be faster.",
        20
    ),
    dependence: scene(
        "openmp-dependencies",
        "Keep the edge, move its boundary",
        "The consumer must receive the updated value. Move the work-unit boundaries and see whether that requirement disappears.",
        ["Original units", "Shifted units"],
        "The source's update a[i] → use in b[i+1] edge is preserved. The transformed schedule puts each producer before its consumer inside one work unit; unmatched boundary operations remain necessary.",
        "The value dependency remains. Reindexing makes its ordering local, allowing different producer/consumer pairs to execute independently under the stated nonaliasing assumptions.",
        6
    ),
    relaxation: scene(
        "openmp-dependencies",
        "Let the boundary influence the interior",
        "Begin with interior error one. Where must the first change appear, and can a constant error survive forever?",
        ["Fixed zero boundary", "Periodic boundary"],
        "Five-by-five interior error field, five-point averaging including self, immutable old field. Teal area encodes error magnitude, with numeric values and a fixed scale from 0 to 1. Consecutive states interpolate only for display.",
        "Fixed zero boundary values drain error from the outside inward. Periodic boundaries preserve the constant error exactly, so nonincrease alone is not convergence to zero.",
        12
    ),
    address: scene(
        "mpi-intro",
        "A message copies; it does not share",
        "Rank zero changes its local object. Watch what must happen before another rank can see the value.",
        ["Send a copy", "No message"],
        "Three distinct address spaces each own a variable a. A schematic send carries rank zero's 42 to rank one's storage; it creates no pointer alias and does not update rank two.",
        "Without communication, only rank zero has 42. With the copy, ranks zero and one each own a separate object containing 42; rank two still has 0.",
        4
    ),
    halos: scene(
        "mpi-intro",
        "An ownership boundary creates a halo",
        "Split twelve points over three ranks. Now trace the neighbour values needed by a stencil at each partition edge.",
        ["Nearest-neighbour stencil", "Elementwise work"],
        "Each rank owns four immutable old values. The stencil copies only adjacent remote values into ghost slots. Physical outer boundaries are not periodic in this drawing and require their own boundary conditions.",
        "Independent elementwise updates need no halo. A nearest-neighbour stencil needs one copied value at each internal partition face, while ownership of the original value stays unchanged.",
        4
    ),
    envelope: scene(
        "mpi-point-to-point",
        "The right payload needs the right envelope",
        "A value is waiting to arrive. Change its tag and predict whether this posted receive can accept it.",
        ["Tag matches", "Tag differs"],
        "Rank zero sends tag 7 in one communicator context; rank one's receive asks for source zero, tag 7 in that same context. The animation illustrates matching, not an eager/rendezvous protocol.",
        "Matching source, tag and context permit delivery. A mismatched tag leaves this receive unmatched; elapsed time cannot make the envelopes agree.",
        4
    ),
    deadlock: scene(
        "mpi-point-to-point",
        "Break a cycle of waiting",
        "Both ranks want to exchange a value. Watch which required receive is reachable under each call schedule.",
        ["Send then receive", "Paired exchange"],
        "Exactly two ranks and compatible envelopes. The unsafe schedule assumes no send buffering. The paired schedule illustrates MPI_Sendrecv's concurrent send/receive semantics with disjoint buffers.",
        "Two blocking sends may wait forever for later receives. Posting a matching paired exchange removes this ordering cycle; it does not repair invalid partners or tags.",
        4
    ),
    collective: scene(
        "mpi-collective",
        "Keep the data, or combine it",
        "Send the same three local pairs toward the root. What is the shape of the result after they arrive?",
        ["Gather", "Sum-reduce"],
        "Inputs are (1,2), (3,4), (5,6). Gather preserves six values in rank order; reduction combines aligned entries across ranks into (9,12). Motion is schematic, not an MPI algorithm promise.",
        "Gather returns length six; reduce returns length two. Neither operation silently reduces each local array to a scalar.",
        3
    ),
    broadcast: scene(
        "mpi-collective",
        "A value grows through a broadcast tree",
        "Only informed ranks can forward the value. Compare a tree with a root sending to one rank at a time.",
        ["Binomial tree", "Root loop"],
        "Eight ranks and one replicated value. The tree doubles the informed set in each abstract round; the root loop informs one new rank per round. Circle labels are ranks; the small 7 is the copied payload. Real MPI may choose another broadcast algorithm.",
        "The tree reaches all eight ranks in three rounds; the root loop takes seven. The payload is copied, not consumed, when it is forwarded.",
        7
    ),
    topology: scene(
        "mpi-communicators",
        "The process stays; its rank changes",
        "Regroup sixteen physical process identities into rows. Follow the highlighted process through the change in naming.",
        ["Permuted ordering", "World ordering"],
        "A fixed illustrative permutation assigns world identities to Cartesian ranks. Cartesian row-major rank and row-local rank are then queried conceptually. Permitting MPI reordering does not require this particular permutation.",
        "The same Cartesian neighbour relations survive a different world-rank assignment. Communicating with an unconverted world rank would name the wrong participant.",
        4
    ),
    allreduce: scene(
        "mpi-communicators",
        "Two routes to the same global sum",
        "Keep eight ranks and their local contributions. Compare small full-buffer exchanges with a chunked ring schedule.",
        ["Recursive doubling", "Chunked ring"],
        "For P=8, full-buffer recursive doubling has three partner exchanges. Chunked ring allreduce has seven reduce-scatter plus seven allgather rounds. The ring drawing tracks phase/round, not complete per-chunk contents.",
        "The model distinguishes 3 latency-sensitive rounds from 14 smaller-chunk rounds. Message volume and reduction work also matter; fewer rounds alone do not identify the faster implementation.",
        14
    ),
    overlap: scene(
        "mpi-advanced",
        "Remove a wait that the interior never needed",
        "Slide the independent interior work left. Which part still has to wait for the incoming halo?",
        ["Wait first", "Overlap interior"],
        "Communication takes 4 abstract units, interior work 6, boundary work 2. Overlap assumes sufficient MPI progress and disjoint old/new/halo buffers. The timeline is an ideal opportunity, not a benchmark.",
        "Waiting first takes 12 units including boundary work; ideal overlap takes 8. The boundary always starts after both its input requirements are complete.",
        12
    ),
    hybrid: scene(
        "mpi-advanced",
        "Combine at two ownership levels",
        "First merge threads within a rank, then merge ranks. What changes when the team size doubles?",
        ["Two threads per rank", "Four threads per rank"],
        "Two MPI ranks with equal team size Q. Worker value is rQ+t. Exact integer partials are combined locally before the MPI reduction, outside the OpenMP region under FUNNELED.",
        "For Q=2 the values 0…3 sum to 6; for Q=4 the values 0…7 sum to 28. A global contiguous numbering needs the equal-team-size assumption.",
        4
    ),
    amdahl: scene(
        "metrics",
        "Add processors; watch the floor remain",
        "Keep the problem fixed while the processor count grows. Which part can the extra workers actually shorten?",
        ["Serial fraction 0.1", "No serial section"],
        "Processor count moves from 1 to 32, with zero overhead. Serial and parallel segments use one fixed scale. Relative time is F+(1−F)/P, so this is a bound model rather than a hardware forecast.",
        "At P=32, F=0.1 gives time 0.128125 and speedup about 7.805; F=0 gives speedup 32. More processors cannot divide the serial segment.",
        31
    ),
    scaling: scene(
        "metrics",
        "Keep the global square, or keep each local square",
        "As the process grid grows, watch the useful local area and the boundary that must be exchanged.",
        ["Strong scaling", "Weak scaling"],
        "A square process grid grows from 1×1 to 4×4. Strong scaling fixes the global side at 24; weak scaling fixes the local side at 24. Counts use width-one face halos, ignoring corners. Motion between integer grid milestones is a geometric transition, not a fractional process count.",
        "Strong scaling shrinks local side from 24 to 6 and raises halo/work from 1/6 to 2/3. Weak scaling grows global side from 24 to 96 while preserving that ratio at 1/6.",
        3
    ),
    grid: scene(
        "cuda",
        "Threads sweep their residue classes",
        "Follow the first four logical threads across a changing array length. Does any valid index get two owners?",
        ["Twelve elements", "Fourteen elements"],
        "A tiny teaching grid has stride four. Thread t visits t,t+4,t+8,… below N. Colours and labels denote logical ownership, not physical GPU cores or a recommended launch size.",
        "Euclidean division gives every valid index one residue and one owner. A partial final pass leaves extra threads with no element; no out-of-bounds access is needed.",
        4
    ),
    coalescing: scene(
        "cuda",
        "A warp asks memory a collective question",
        "Keep eight active illustrative lanes and eight loads. Change only the addresses and count the segments touched.",
        ["Adjacent addresses", "Scattered addresses"],
        "Eight illustrative lanes load four-byte values. Aligned 32-byte segments are drawn; adjacent indices 0…7 touch one segment, stride-eight indices touch eight. This isolates segment count, not all real GPU transaction rules.",
        "The same eight scalar loads can touch one or eight segments in this model. Coalescing concerns addresses requested together, rather than simply whether each thread walks its own array sequentially.",
        8
    ),
    forward: scene(
        "higher-abstractions",
        "Carry a perturbation through the program",
        "Choose one input direction, then follow its tangent through log, product and sine to the output.",
        ["Seed x₁", "Seed x₂"],
        "The source function is log(x₁)+x₁x₂−sin(x₂), evaluated at (2,0.7). Forward mode propagates one chosen unit input direction. Primal values and local derivative contributions are kept distinct.",
        "The x₁ seed gives 1/2+0.7=1.2. The x₂ seed gives 2−cos(0.7), about 1.235. These are two columns of the same scalar-output Jacobian.",
        4
    ),
    reverse: scene(
        "higher-abstractions",
        "Send sensitivity back along every path",
        "Seed the output and run the graph backwards. At a reused input, watch contributions add rather than overwrite.",
        ["Output seed 1", "Output seed 2"],
        "Same function and point as the forward sweep. Reverse mode multiplies local derivatives by the output seed and accumulates at shared inputs. The bar denotes derivative sensitivity, not complex conjugation.",
        "With seed 1, the input sensitivities are (1.2, 2−cos(0.7)). Doubling the output seed doubles both: the reverse sweep computes Jᵀw without materialising J.",
        4
    ),
} as const;
export type AnimationId = keyof typeof animationCatalog;
export const animationIds = Object.keys(animationCatalog) as AnimationId[];
export function isAnimationId(id: string): id is AnimationId {
    return Object.hasOwn(animationCatalog, id);
}
