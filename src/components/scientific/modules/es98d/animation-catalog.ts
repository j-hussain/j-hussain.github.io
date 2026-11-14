import type { MotionKind } from "./animation-math";

export interface MotionSpec {
    kind: MotionKind;
    title: string;
    question: string;
    caption: string;
    limit: string;
    left: string;
    right: string;
    parameter: string;
    min: number;
    max: number;
    step: number;
    initial: number;
    formula: string;
}
export const motionCatalog: Record<MotionKind, MotionSpec> = {
    thermal: {
        kind: "thermal",
        title: "Watch equilibrium emerge from probability flow",
        question:
            "Start with every system excited. Can you see why the populations stop changing before the upward and downward transitions stop?",
        caption:
            "Play the relaxation, then change inverse temperature β. The coloured markers track stratified probability mass; the curve gives the exact excited-level probability, including its fourfold degeneracy.",
        limit: "Two-level master equation with rates up = exp(−β), down = 1/4, Δ = 1. Time is an illustrative stochastic clock. Marker movement is a visual transport of mass, not a molecular trajectory.",
        left: "Probability mass changes level",
        right: "Opposing fluxes reach balance",
        parameter: "Inverse temperature β",
        min: 0.3,
        max: 3,
        step: 0.1,
        initial: 1.4,
        formula: "dp₁/dt = (1 − p₁)e⁻ᵝ − p₁/4",
    },
    phase: {
        kind: "phase",
        title: "One energy shell or a mixture of shells?",
        question:
            "Both pictures obey the same harmonic equations. What changes when energy is fixed in one ensemble but allowed to fluctuate in the other?",
        caption:
            "Follow a marked phase-space point through one revolution. Each orbit conserves its own energy. The canonical ensemble mixes orbit radii, while the microcanonical ensemble stays on a single circle.",
        limit: "Nondimensional harmonic oscillator, m = k = 1. Equal position and momentum scales. Canonical energies use fixed stratified exponential quantiles; these are representative markers, not a thermostatted simulation.",
        left: "NVE: one radius",
        right: "NVT: a distribution of radii",
        parameter: "Inverse temperature β",
        min: 0.6,
        max: 2.5,
        step: 0.1,
        initial: 1,
        formula: "H = (x² + p²)/2;   p(E) = βe⁻ᵝᴱ",
    },
    forces: {
        kind: "forces",
        title: "Feel the slope of the interaction energy",
        question:
            "Move the two particles through the potential well. Where do their force arrows reverse, and where does the energy cross zero?",
        caption:
            "The moving point and particles share the same separation. Increase the well depth ε to strengthen the energy and forces without moving the minimum at 2¹ᐟ⁶σ.",
        limit: "Prescribed separation probe, σ = 1. This is not an integrated collision. Force arrows show direction with bounded display length; the numerical force retains its actual magnitude.",
        left: "Equal and opposite pair forces",
        right: "Position on the energy curve",
        parameter: "Well depth ε",
        min: 0.5,
        max: 2,
        step: 0.1,
        initial: 1,
        formula: "Fᵣ = −du/dr;   Fᵢ + Fⱼ = 0",
    },
    spins: {
        kind: "spins",
        title: "Rotate a spin through its energy landscape",
        question: "If one spin turns while its neighbour stays fixed, how does the angle become an interaction energy?",
        caption:
            "Track the rotating vector and its point on −J cos θ. Reverse the sign of J to exchange the preferred parallel and antiparallel arrangements.",
        limit: "Two classical unit Heisenberg spins with one exchange bond. Angle is prescribed for inspection; the animation is not a physical spin-dynamics integrator. Torque is −dU/dθ.",
        left: "A dot product becomes alignment",
        right: "Energy and angular force",
        parameter: "Exchange coupling J",
        min: -1.5,
        max: 1.5,
        step: 0.1,
        initial: 1,
        formula: "U(θ) = −J cos θ;   τ = −J sin θ",
    },
    langevin: {
        kind: "langevin",
        title: "Thermal noise broadens a relaxing cloud",
        question:
            "Release an ensemble at the same point in a harmonic well. What does the average do, and what does an individual path do instead?",
        caption:
            "Play one fixed-seed ensemble and follow the highlighted path. Change temperature to replay the same Gaussian innovations at a different thermal scale.",
        limit: "Exact sampled OU transition with k = γ = 1 and Δt = 0.075. The cloud has 32 paths and is not a precision density estimator. Joining sampled positions is visual interpolation, not Euler integration. The position scale is fixed during playback and adapts when temperature changes.",
        left: "One realised path and exact mean",
        right: "The ensemble spreads in the well",
        parameter: "Temperature kBT",
        min: 0.2,
        max: 1.5,
        step: 0.1,
        initial: 0.6,
        formula: "X′ = e⁻ΔᵗX + √[T(1 − e⁻²Δᵗ)] ξ",
    },
    verlet: {
        kind: "verlet",
        title: "A stable orbit can still carry energy error",
        question:
            "Does a numerical oscillator trace the exact phase-space circle? Follow the orbit and its energy at the same time.",
        caption:
            "Replay velocity Verlet at a larger timestep. The exact reference point is evaluated at the same physical time nΔt; the energy trace exposes the discretisation error.",
        limit: "Harmonic oscillator, x₀ = 1, v₀ = 0, m = k = 1. All selectable steps satisfy Δt < 2. Lines connect discrete states for readability; 120 updates are shown, so elapsed physical time changes with Δt.",
        left: "Numerical and exact phase space",
        right: "Energy at every computed step",
        parameter: "Timestep Δt",
        min: 0.1,
        max: 1.8,
        step: 0.1,
        initial: 0.5,
        formula: "Hₙ = (xₙ² + vₙ²)/2;   H₀ = 1/2",
    },
    metropolis: {
        kind: "metropolis",
        title: "A rejected proposal is still an observation",
        question:
            "Propose a displacement in a double well, inspect its energy cost, and then watch whether the chain moves or stays.",
        caption:
            "The dashed segment marks the latest proposal. The trajectory records every attempted update, including repeated states after rejection. Raising β makes uphill proposals harder to accept.",
        limit: "Seeded Metropolis demonstration in U(x) = (x² − 1)², symmetric uniform displacement in [−1.2,1.2]. This short run starts at x = −1 and is not evidence of equilibration or an estimate of mixing time. Proposals above the energy plot are marked at its upper edge, with their true ΔU in the readout.",
        left: "Proposal on the potential",
        right: "The recorded Markov trajectory",
        parameter: "Inverse temperature β",
        min: 0.5,
        max: 5,
        step: 0.1,
        initial: 2,
        formula: "α = min(1, exp[−βΔU])",
    },
    importance: {
        kind: "importance",
        title: "Move the samples without changing the integral",
        question:
            "What happens if we transport uniform draws towards the large parts of an integrand, then compensate for the changed sampling density?",
        caption:
            "The first panel links the integrand to the proposal density. The second reveals the weighted estimate as samples arrive. At mixture one, p = f and every importance weight is exactly one.",
        limit: "f(x) = 6x(1−x), 0 < x < 1, integral one. The normalised mixture p = (1−η) + ηf is sampled by deterministic bisection of its CDF using a fixed random seed. Curves are finite-run estimates, not confidence bands.",
        left: "A proposal follows the integrand",
        right: "The weights preserve the answer",
        parameter: "Importance mixture η",
        min: 0,
        max: 1,
        step: 0.05,
        initial: 0.75,
        formula: "Î = mean[f(X)/p(X)];   ∫₀¹ f(x) dx = 1",
    },
    memory: {
        kind: "memory",
        title: "Watch memory change the information in a mean",
        question:
            "The marginal variance stays one. How much does correlation change the uncertainty of a mean formed from the observations seen so far?",
        caption:
            "Reveal the seeded stationary series beside a white-noise reference. Change a through positive and negative values, and compare the exact finite-length Gaussian mean bands.",
        limit: "Stationary Gaussian AR(1), Xₙ₊₁ = aXₙ + √(1−a²)ξₙ. The displayed ±1.96 standard-deviation intervals use the exact known covariance, not an estimated MCMC diagnostic. No initialisation bias is present in this example. The value scale is fixed during playback and adapts to the selected a.",
        left: "Correlated observations arrive",
        right: "Uncertainty counts covariance",
        parameter: "Memory coefficient a",
        min: -0.6,
        max: 0.95,
        step: 0.05,
        initial: 0.8,
        formula: "Var(X̄M) = [1 + 2Σ(1−k/M)aᵏ]/M",
    },
    shells: {
        kind: "shells",
        title: "A pair count is not yet a radial density",
        question:
            "Sweep a spherical shell outward. Why does a larger raw neighbour count not necessarily imply stronger structural ordering?",
        caption:
            "Selected particles are counted using their full three-dimensional distance. Watch the shell volume and the normalised count together, then widen the shell to trade radial resolution for less noise.",
        limit: "180 independent uniform neighbours inside a 3D unit ball around one fixed probe. Orthographic projection hides depth; selection uses x²+y²+z². This ideal-gas illustration uses neighbour density 180/(4π/3), so its expected g is one.",
        left: "A projected three-dimensional shell",
        right: "Divide by available shell volume",
        parameter: "Shell width Δr",
        min: 0.08,
        max: 0.3,
        step: 0.02,
        initial: 0.16,
        formula: "g = count / [ρ · 4π((r+Δr)³−r³)/3]",
    },
    ising: {
        kind: "ising",
        title: "Change spins locally or reorganise a whole domain",
        question:
            "Starting from the same spin arrangement, what kinds of changes can a local update and a Wolff update make?",
        caption:
            "Play the two valid samplers and compare their patterns and magnetisations. Change β to alter the coupling to thermal fluctuations. Read the work counts before comparing their progress.",
        limit: "12×12 periodic ferromagnetic Ising lattice, J = 1, zero field, fixed seed and prepared initial state. A display frame is 12 local attempts on the left and one cluster update on the right. These are not equal-cost frames or a critical-scaling benchmark.",
        left: "Local Metropolis attempts",
        right: "Wolff cluster flips",
        parameter: "Inverse temperature β",
        min: 0.15,
        max: 0.9,
        step: 0.05,
        initial: 0.45,
        formula: "ΔH = 2sᵢΣⱼsⱼ;   pᵦ = 1 − exp(−2β)",
    },
    cluster: {
        kind: "cluster",
        title: "Grow the object that can be flipped without rejection",
        question:
            "Which aligned neighbours actually join the cluster? Follow the occupied edges outwards from a single seed.",
        caption:
            "The growing frontier traces one fixed-seed Wolff construction. The completed component flips near the end of the sequence. Increase β to change the bond-occupation probability and replay the construction.",
        limit: "One illustrative 12×12 periodic configuration. Only accepted growth edges are drawn; periodic wrap edges are indicated by edge markers rather than long chords. A realised cluster size is not its expectation.",
        left: "Discover the connected component",
        right: "Growth and final sign change",
        parameter: "Inverse temperature β",
        min: 0.15,
        max: 0.9,
        step: 0.05,
        initial: 0.45,
        formula: "pᵦ = 1 − e⁻²ᵝ;   boundary failures encode ΔH",
    },
    lifting: {
        kind: "lifting",
        title: "Give a walk a direction it can remember",
        question:
            "On the same uniform ring, how does retaining an auxiliary direction change the sequence of visited states?",
        caption:
            "Follow a reversible walk and a lifted walk with matched step counts. The right-hand trace unwraps their positions to expose directional persistence; the ring itself remains periodic.",
        limit: "32-site uniform target. Reversible kernel: stay 0.1, left/right 0.45 each. Lifted kernel: flip direction r, stay 0.1, move forward 0.9−r. Both are invariant and irreducible in the selected range. A single seed is not a speedup theorem.",
        left: "The same ring, different paths",
        right: "Persistence becomes visible unwrapped",
        parameter: "Direction refresh probability r",
        min: 0.05,
        max: 0.6,
        step: 0.05,
        initial: 0.1,
        formula: "π̃(x,σ) = 1/64;   Σσ π̃(x,σ) = 1/32",
    },
    hazard: {
        kind: "hazard",
        title: "An event transfers activity at a precise energy budget",
        question: "When the active particle moves downhill, does its interaction factor accumulate an event hazard?",
        caption:
            "Track the active particle, pair energy and accumulated positive energy variation. At the chosen threshold, activity transfers. The next flight first goes downhill, where the hazard remains zero.",
        limit: "One harmonic pair factor, β = k = 1, with the same chosen threshold E at each event. Positions are shown relative to their moving midpoint. This deterministic explanation is not a random event-chain sample; centre-of-mass translation is unconfined.",
        left: "A flight and a change of activity",
        right: "Energy versus accumulated hazard",
        parameter: "Chosen event threshold E",
        min: 0.15,
        max: 1.5,
        step: 0.05,
        initial: 0.5,
        formula: "∫λ dℓ = β∫[dU/dℓ]₊dℓ = E",
    },
    kernels: {
        kind: "kernels",
        title: "Moving parcels carry a continuous mass field",
        question:
            "Compress the parcel positions. Does the height of the density change because mass was created, or because the same mass occupies less space?",
        caption:
            "Follow each parcel's cubic-spline kernel and their sum during one prescribed compression cycle. Change h to alter smoothing while preserving the area under the total density.",
        limit: "Five one-dimensional unit-mass parcels and a normalised compact cubic B-spline kernel with support |x| < 2h. Motion is a prescribed geometry experiment, not an integrated fluid flow. Total represented mass is exactly five.",
        left: "The kernels move with their parcels",
        right: "Their sum preserves total mass",
        parameter: "Smoothing length h",
        min: 0.2,
        max: 0.7,
        step: 0.05,
        initial: 0.4,
        formula: "ρ(x) = ΣⱼmⱼWₕ(x−xⱼ);   ∫ρ dx = 5",
    },
    pressure: {
        kind: "pressure",
        title: "Different accelerations can still conserve momentum",
        question:
            "If two parcels have unequal mass, should equal and opposite pressure forces produce equal accelerations?",
        caption:
            "Move the pair through overlapping kernel supports and watch the conservative pressure interaction. Change the second mass while checking the force sum and the two accelerations.",
        limit: "Fixed-h one-dimensional SPH pressure pair, h = 0.65, mᵢ = 1, P = ρ−0.7. Includes each parcel's self-density. Separations are prescribed, not a simulated fluid trajectory. Force arrows share one linear scale.",
        left: "Kernel overlap supplies pressure",
        right: "Force balance, unequal response",
        parameter: "Second parcel mass mⱼ",
        min: 0.5,
        max: 2,
        step: 0.1,
        initial: 1.5,
        formula: "Fᵢⱼ = −Fⱼᵢ;   aᵢ = Fᵢⱼ/mᵢ",
    },
    landscape: {
        kind: "landscape",
        title: "See the states hidden behind a free-energy curve",
        question:
            "Two valleys have equal minimum potential energy. Why can one contain more equilibrium probability? Scan their transverse widths.",
        caption:
            "The wire surface is U(x,y); a moving cross-section exposes how much room is available at each x. Compare the potential floor with the free energy after the hidden y coordinate has been integrated out.",
        limit: "Analytic model U = (x²−1)² + y²/[2w(x)²], x in [−2,2], y on the real line, w = 0.35 + 0.65(x+2)/4. The displayed surface truncates y to ±2w for clarity; F = U(x,0)−T log w + constant integrates all y exactly.",
        left: "A transverse coordinate has width",
        right: "Integrating it changes the landscape",
        parameter: "Temperature kBT",
        min: 0.2,
        max: 1.5,
        step: 0.1,
        initial: 0.8,
        formula: "∫e⁻ᵁ⁄ᵀdy ∝ w(x)e⁻ⱽ⁽ˣ⁾⁄ᵀ;   F = V−T log w",
    },
    umbrella: {
        kind: "umbrella",
        title: "Move an umbrella, then remove its statistical bias",
        question:
            "A restraint makes one region easier to visit. Can we recover the original distribution while its biased histogram moves across the landscape?",
        caption:
            "Sweep the umbrella centre and compare the biased density with the original dashed target. On the right, exact reweighting cancels the restraint at every frame.",
        limit: "Double-well potential, β = 4, harmonic bias κ(x−c)²/2. Densities and weights are computed by fixed-grid quadrature; markers are stratified biased quantiles. Exact cancellation does not establish convergence of a finite umbrella trajectory or sufficient overlap.",
        left: "A moving window changes occupancy",
        right: "The correction restores the target",
        parameter: "Umbrella stiffness κ",
        min: 0.5,
        max: 6,
        step: 0.5,
        initial: 3,
        formula: "p₀(x) ∝ pᴮ(x) exp[βB(x)]",
    },
};
export const motionPlacements: Record<string, { before: string; kind: MotionKind }[]> = {
    equilibrium: [
        { before: "canonical", kind: "thermal" },
        { before: "equilibrium-check", kind: "phase" },
    ],
    "interaction-models": [
        { before: "response", kind: "forces" },
        { before: "long-range", kind: "spins" },
    ],
    dynamics: [
        { before: "integration", kind: "langevin" },
        { before: "thermostats", kind: "verlet" },
    ],
    "monte-carlo": [
        { before: "sampling", kind: "importance" },
        { before: "ergodicity", kind: "metropolis" },
    ],
    "uncertainty-observables": [
        { before: "error-bars", kind: "memory" },
        { before: "transport", kind: "shells" },
    ],
    "collective-updates": [
        { before: "bonds", kind: "ising" },
        { before: "scope", kind: "cluster" },
    ],
    "event-chains": [
        { before: "events", kind: "lifting" },
        { before: "balance", kind: "hazard" },
    ],
    "continuum-particles": [
        { before: "pressure", kind: "kernels" },
        { before: "closure", kind: "pressure" },
    ],
    "free-energy": [
        { before: "umbrellas", kind: "landscape" },
        { before: "extended", kind: "umbrella" },
    ],
};
