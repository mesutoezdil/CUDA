# Lesson 01: One Block, Four Threads

This lesson makes one change to Lesson 00. The thread count goes from 1 to 4, and the block count stays 1. Four threads run the same kernel at the same time, each with a different `threadIdx.x`.

## What changes

```c
printIDs<<<1, 4>>>();
//          ^  ^
//  blocks -+  +- threads per block (was 1, now 4)
```

The GPU runs 4 copies of `printIDs` at the same time. Each copy gets its own `threadIdx.x` of 0, 1, 2 or 3. `blockIdx.x` is 0 for all of them, because there is still only one block.

## SIMT (Single Instruction, Multiple Threads)

Each thread runs on its own. Threads do not wait for each other or work together. They all run the same instructions at the same time, but with different ID values. This model is called SIMT (Single Instruction, Multiple Threads).

## Warps

The GPU runs threads in groups of 32 called warps. The hardware schedules warps, not blocks. When you launch 4 threads, the GPU makes a full warp of 32 lanes but uses only 4 of them. If threads in a warp take different sides of an if/else, the GPU runs the paths one after the other. This is called warp divergence. Here the 4 threads do the same thing, so there is no divergence.

## Why the output order changes

`printf` in a kernel does not print right away. Each thread writes into a shared circular buffer in GPU memory. The buffer is printed when `cudaDeviceSynchronize()` is called. The order in which threads write is not fixed, even inside one warp. So the output order changes between runs.

<printf-order threads="4"></printf-order>

## Code

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>

__global__ void printIDs()
{
    printf("\nBlock ID: %d  ===  Thread ID: %d", blockIdx.x, threadIdx.x);
}

int main()
{
    printIDs<<<1, 4>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

## Compile and run

```bash
nvcc first_kernel.cu -o first_kernel
./first_kernel
```

Output (4 lines, `blockIdx.x` always 0, `threadIdx.x` 0-3 in some order):

```
Block ID: 0  ===  Thread ID: 2
Block ID: 0  ===  Thread ID: 0
Block ID: 0  ===  Thread ID: 3
Block ID: 0  ===  Thread ID: 1
```

## Visual

<cuda-launch blocks="1" threads="4" fn="printIDs"></cuda-launch>

```
printIDs<<<1, 4>>>
              |  |
    blocks ---+  +--- threads per block

GPU Grid
+-------------------------------------------------------------+
|  Block 0  (blockIdx=0)                                      |
|  +----------+ +----------+ +----------+ +----------+        |
|  | Thread 0 | | Thread 1 | | Thread 2 | | Thread 3 |        |
|  | tIdx=0   | | tIdx=1   | | tIdx=2   | | tIdx=3   |        |
|  +----------+ +----------+ +----------+ +----------+        |
|                                                             |
|  all 4 fit in one warp (warp size = 32)                     |
+-------------------------------------------------------------+
```

## Glossary

- warp: a group of 32 threads the GPU runs together as one unit. The GPU schedules warps, not single threads.
- SIMT (Single Instruction, Multiple Threads): every active thread in a warp runs the same instruction in the same clock cycle. Each thread has its own data and its own ID.
- warp divergence: threads in one warp take different paths. For example, thread 0 enters an if-branch and thread 1 does not. The GPU then runs both paths one after the other, which is slower.
- printf buffer: GPU printf does not write to the screen directly. It writes to a buffer in GPU memory. The buffer goes to the screen only when you call `cudaDeviceSynchronize()`.
