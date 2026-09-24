# Lesson 03: Compute Capability

Compute capability (CC) is a version number for a GPU generation. It sets the features and hardware limits you met in Lessons 00 to 02, such as warps and the 1024-thread block limit. Every CUDA feature needs a minimum compute capability.

## What the number means

The format is major.minor, for example 9.0 for Hopper. A new major version is a new architecture generation with new hardware. A new minor version is a revision inside the same generation. Code built for CC 7.0 runs on any GPU with CC 7.0 or higher. Code that uses CC 9.0 features does not run on older GPUs.

<cc-explorer></cc-explorer>

## GPU generations

The table covers data center GPUs from Pascal to Blackwell.

> [!NOTE]
> The specs come from the NVIDIA CUDA Programming Guide, Blackwell Tuning Guide, and Hopper Tuning Guide (CUDA Toolkit 13.2, 2025-2026).

| Spec                   | P100 (CC 6.0)     | V100 (CC 7.0)     | A100 (CC 8.0)     | H100 (CC 9.0)     | B100 (CC 10.0)    |
|------------------------|-------------------|-------------------|-------------------|-------------------|-------------------|
| GPU                    | Tesla P100        | Tesla V100        | A100              | H100              | B100              |
| Codename               | GP100             | GV100             | GA100             | GH100             | GB100             |
| Architecture           | Pascal            | Volta             | Ampere            | Hopper            | Blackwell         |
| Threads / Warp         | 32                | 32                | 32                | 32                | 32                |
| Max Warps / SM         | 64                | 64                | 64                | 64                | 64                |
| Max Threads / SM       | 2048              | 2048              | 2048              | 2048              | 2048              |
| Max Thread Blocks / SM | 32                | 32                | 32                | 32                | 32                |
| Max Registers / SM     | 65536             | 65536             | 65536             | 65536             | 65536             |
| Max Registers / Block  | 65536             | 65536             | 65536             | 65536             | 65536             |
| Max Registers / Thread | 255               | 255               | 255               | 255               | 255               |
| Max Thread Block Size  | 1024              | 1024              | 1024              | 1024              | 1024              |
| FP32 Cores / SM        | 64                | 64                | 64                | 128               | 128               |
| Shared Memory / SM     | 64 KB             | up to 96 KB       | up to 164 KB      | up to 228 KB      | up to 228 KB      |

H100 and B100 have the same per-SM thread and memory limits. The per-SM thread and register counts did not change.

> [!NOTE]
> Blackwell is still faster than Hopper because of more SMs (148 on B200 vs 132 on H100 SXM5), 5th generation Tensor Cores, HBM3e bandwidth, and NVLink 5.0.

## Threads per warp

A warp is a group of 32 threads that the GPU runs together (Lesson-01). The number 32 is fixed by the hardware and is part of the compute capability spec. The GPU never schedules single threads. It always schedules whole warps of 32.

> [!NOTE]
> The warp size of 32 has not changed since the first CUDA GPUs (CC 1.0).

## Warps and threads per SM

An SM is the physical processor that blocks run on (Lesson-02). Each SM can hold up to 64 active warps, which is 2048 threads. When some warps wait for memory, the warp scheduler can pick other warps. More active warps keep the execution units busy, because there is more often a warp that is ready to run.

## Thread block size limit

In Lesson-02, `<<<1, 2048>>>` compiled but launched nothing. The reason is the max thread block size of 1024, a hard limit from the compute capability spec. A block must fit on one SM, and the SM's fixed register budget limits how big one block can be.

## FP32 cores per SM

Pascal, Volta, and Ampere have 64 FP32 cores per SM. Hopper and Blackwell have 128. More FP32 cores means more floating-point operations per clock cycle on each SM.

## Shared memory per SM

Shared memory is fast memory inside each SM. All threads in a block can use it. It grew over the generations:

- Pascal: 64 KB
- Volta: up to 96 KB
- Ampere: up to 164 KB
- Hopper and Blackwell: up to 228 KB

More shared memory lets a kernel keep more data on-chip instead of going to global memory.

## Visual

<cc-progress></cc-progress>

## Glossary

- compute capability: a version number (major.minor). It tells which CUDA features a GPU supports and what its hardware limits are.
- SM (Streaming Multiprocessor): the physical processor inside the GPU. All threads run on SMs.
- warp: a group of 32 threads that the GPU schedules and runs together.
- FP32 core: a hardware unit that does one 32-bit floating-point operation per clock cycle.
- shared memory: fast on-chip memory inside each SM, shared by all threads in a block. Much faster than global (device) memory.
- register file: a pool of fast storage per SM for each thread's local variables. It has 65536 registers per SM in all generations shown.
- CUDA Toolkit 12.8+: needed to compile code for Blackwell (CC 10.0).
