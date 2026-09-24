# Lesson 00: One Block, One Thread

Simplest possible kernel launch. One block, one thread, no parallelism. The goal is to get something running and read the first output before adding any complexity.

## GPU vs CPU

On the CPU, a function runs once on one core. On the GPU, a kernel function runs many times in parallel, each copy on a different thread. Two numbers control how many threads run: block count and thread count.

## `__global__`: what it means

```c
__global__ void printIDs() { ... }
```

`__global__` marks a function as a GPU kernel. The compiler builds it for the GPU, not the CPU. The CPU calls it, but it executes on the device. Two other qualifiers exist for reference:

- `__device__`: runs on GPU, callable only from GPU code
- `__host__`: normal CPU function, callable only from CPU

A `__global__` function is called from CPU but runs on GPU.

## Launch configuration: `<<<blocks, threads>>>`

```c
printIDs<<<1, 1>>>();
//          ^  ^
//  blocks -+  +- threads per block
```

The `<<<...>>>` syntax is the execution configuration. It goes between the function name and the argument list. The first number is how many blocks to launch, the second is how many threads per block. `<<<1, 1>>>` means one block with one thread. Total threads: 1 x 1 = 1.

## Thread, Block, Grid

Every kernel launch creates a 3-level hierarchy:

- thread: smallest execution unit. One thread runs one copy of the kernel.
- block: a group of threads that run on the same physical processor and can share memory with each other.
- grid: the full set of all blocks in one kernel launch. One launch, one grid.

```
Grid
+---------------------------------------------------------------------+
|                                                                     |
|   Block 0               Block 1               Block 2              |
|   +---------------+     +---------------+     +---------------+    |
|   | Thread 0      |     | Thread 0      |     | Thread 0      |    |
|   | Thread 1      |     | Thread 1      |     | Thread 1      |    |
|   | Thread 2      |     | Thread 2      |     | Thread 2      |    |
|   |    ...        |     |    ...        |     |    ...        |    |
|   +---------------+     +---------------+     +---------------+    |
|                                                                     |
+---------------------------------------------------------------------+
```

## `blockIdx.x` and `threadIdx.x`

```c
printf("Block ID: %d  Thread ID: %d", blockIdx.x, threadIdx.x);
```

`blockIdx.x` is the index of the block this thread belongs to. `threadIdx.x` is the index of this thread within its block. Both are 3D structs with `.x`, `.y`, `.z` components because grids and blocks can be 1D, 2D, or 3D. For 1D work, only `.x` is used. With `<<<1, 1>>>` both are always 0.

## Header files

- `cuda_runtime.h`: CUDA runtime API, includes `cudaDeviceSynchronize()` and error-checking functions.
- `device_launch_parameters.h`: makes `blockIdx`, `threadIdx`, `blockDim`, `gridDim` available inside kernels when using MSVC or certain IDEs.
- `stdio.h`: standard C, needed for `printf`.

## `cudaDeviceSynchronize()`

Kernel launches are asynchronous. The CPU fires the kernel and immediately moves to the next line without waiting. Without `cudaDeviceSynchronize()`, `main()` returns and the process exits before the GPU has time to print anything. The function blocks the CPU until all GPU work is done.

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
    printIDs<<<1, 1>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

## Compile and run

```bash
nvcc first_kernel.cu -o first_kernel
./first_kernel
```

Output:

```
Block ID: 0  ===  Thread ID: 0
```

One line, every time. Deterministic because there is only one thread.

## Visual

<cuda-launch blocks="1" threads="1" fn="printIDs"></cuda-launch>

```
printIDs<<<1, 1>>>
              |  |
    blocks ---+  +--- threads per block

GPU Grid
+-------------------------+
|  Block 0  (blockIdx=0)  |
|  +-------------------+  |
|  |  Thread 0         |  |
|  |  threadIdx.x = 0  |  |
|  +-------------------+  |
+-------------------------+
```

## Glossary

- kernel: a function that runs on the GPU. You write it once and the GPU runs it on many threads at the same time.
- thread: the smallest unit of execution. One thread = one running copy of the kernel, with its own ID.
- block: a group of threads that run together on the same physical processor and can communicate through shared memory.
- grid: the full collection of all blocks launched by a single kernel call.
- `__global__`: a qualifier that tells the compiler this function is a GPU kernel, called from CPU but executed on GPU.
- `blockIdx.x`: the index of the block the current thread is in. Starts at 0.
- `threadIdx.x`: the index of the current thread within its block. Starts at 0.
- `cudaDeviceSynchronize()`: tells the CPU to wait until the GPU finishes all its work before continuing.
- asynchronous: the CPU does not wait. It sends a command to the GPU and moves on immediately.
