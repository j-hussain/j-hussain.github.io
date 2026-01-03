---
layout: page
title: "Introduction to High Performance Computing"
---

Text: Week 1

## What is HPC?

- **Definition:** High-Performance Computing uses supercomputers and clusters to solve advanced computational problems.
- **Supercomputer:** Performs at much higher levels than general-purpose computers.
- **Performance metrics:**
    - FLOPS (floating point operations per second)
    - Memory bandwidth
    - Storage and interconnect speed
- **Architecture:**
    - Many racks of compute nodes.
    - Each node has multiple CPUs (sockets) and cores.

---

## Number Representation

### Integers

- Example: `121` → 1-byte integer `01111001`
- Representation is exact (signed vs. unsigned)
- Arithmetic is exact.

### Reals (Floating Point)

- Scientific notation: `123456 ≈ 1.234 × 10⁶`
- Computers use base-2 exponent + mantissa representation.
- **Rounding errors:**
    - 0.9 cannot be represented exactly.
    - `1 + 1e−8 = 1` (in 32-bit float)
- **Example:**
    
    `123456` in 32-bit representation:
    
    `0 10001111110001001000000000000000`
    

---

## FLOPS

- FLOPS = Floating Point Operations Per Second.
- Primary metric for scientific compute performance.

### Example: Apollo Guidance Computer (1969)

- 72 KB ROM, 4 KB RAM
- 14,245 FLOPS @ 2 MHz
- Power: 40 W

### Modern Supercomputer: El Capitan (LLNL)

- 11,039,616 compute cores
- 2 GHz, 5.7 PB memory
- Power: 30 MW
- Performance: **2.8 exaFLOPS (2.8×10¹⁸)**

> Your smartphone can reach several teraFLOPS!

---

## Moore's Law

- Observation (1965): Transistors on a chip double every ~2 years.
- Achieved by **scaling down feature size** (20μm → 3–5nm).
- Predicted to end around **2025**.
- Led to exponential growth in compute power.

---

## Inside a Chip: MOSFET

- **MOSFET** = Metal-Oxide-Semiconductor Field-Effect Transistor
- Gate voltage controls current between source and drain.
- Building block of logic gates.
- Almost no current flows except during switching.

---

## CMOS Logic

- **CMOS** = Complementary MOSFET design.
- No power dissipated except during switching.
- Smaller devices → smaller capacitance → faster switching.

| Logic | Example | Output Behavior |
| --- | --- | --- |
| NOT | 1 input | Inverts signal |
| NAND | 2 input | Output = 1 except when both inputs = 1 |

---

## Dennard Scaling (1974)

- As transistors shrink, **power density remains constant**.
- Voltage & current scale with length → faster switching at same power.

### Ceased Around 2005

- Leakage currents (thin oxide layer) increased.
- Power consumption & heat dissipation rose.
- Result: Clock speed increases stopped.
- Performance now scales via **multi-core parallelism**.

---

## Key Industry Trends

| Era | Main Drivers |
| --- | --- |
| 1940s–1960s | Science, military, mainframes |
| 1970s–1990s | Rise of personal computers |
| 1990s–2010s | GPUs & gaming revolution |
| 2000s–Now | Mobile & cloud computing |
| 2010s–??? | Cryptocurrency mining |

---

## The Cost of HPC

**Example: Archer2 (UK Tier 1 Supercomputer)**

- 28 PFLOPS (2020)
- £48M for 4 years
- Power: 25 GWh/year (~£6M)
- Compute nodes: 85% of energy cost

**Carbon footprint:**

- Hardware: 7,320 tons CO₂
- Electricity (if non-renewable): +7,000 tons/year
- Using renewable energy reduces this drastically.
- Reducing clock speed (2.3 → 2.0 GHz):
    - Performance: 74–95%
    - Energy use: 80–93%

---

## Towards Zettascale Computing

- **Goal:** 10²¹ FLOPS (zettascale).
- On current tech: ~21 GW (≈21 nuclear reactors).
- Focus now on **performance per watt** and **energy efficiency**.

---

## HPC Challenges

As systems scale, problems grow:

| Challenge | Description |
| --- | --- |
| Efficiency | Using FLOPS effectively |
| Latency | Data availability on time |
| Pipelining | Keeping processors busy |
| Parallelism | Multi-core usage |
| Load Balance | Fair distribution of work |
| Scalability | Adapting to resource size |
| Energy Efficiency | Power usage control |
| Memory Capacity | Fit entire problem in memory |
| Data Locality | CPU access to needed data |
| Storage | Manage input/output |
| Reproducibility | Verifiable results |
| Reliability | Correctness of computation |
| Visualization | Interpretable outputs |

---

## CPU vs GPU

| Feature | CPU | GPU |
| --- | --- | --- |
| Purpose | General tasks | High-throughput maths |
| Design | Fewer, powerful cores | Thousands of simple cores |
| Memory | Access to main system RAM | Own on-board fast memory |
| Best for | Serial / control-heavy tasks | Parallel / matrix-heavy tasks |

---

## Programming Languages

- **Compiled (C, Fortran):** Fast, efficient, low-level memory control.
- **Interpreted (Python):** Slower, but flexible and easy to use.
- Domain-specific Python libraries (NumPy, PyTorch, TensorFlow) can outperform low-level code for certain workloads.

---

## Summary

- **HPC = complex ecosystem** of hardware, software, and human optimization.
- Single-core performance has stagnated.
- Modern improvements = parallelism + efficiency.
- **Optimisation** remains critical for effective scientific computing.
