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

The GPU runs threads in groups of 32 called warps. The hardware schedules warps, not blocks. When you launch 4 threads, the GPU makes a full warp of 32 lanes but uses only 4 of them. Here the 4 threads do the same thing, so they all stay on the same path.

> [!NOTE]
> If threads in a warp take different sides of an if/else, the GPU runs the paths one after the other. This is called warp divergence. It does not happen in this lesson.

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

This is the Lesson 00 code with one change. The launch line is now `printIDs<<<1, 4>>>();`, so four threads run the kernel.

## Compile and run

The first command compiles the code into a program. The second command runs it.

```bash
nvcc first_kernel.cu -o first_kernel
./first_kernel
```

- `nvcc` is the CUDA compiler. It builds the CPU part and the GPU part of the file.
- `first_kernel.cu` is the source file with the code above. CUDA source files end in `.cu`.
- `-o first_kernel` names the program `first_kernel`. Without it the name is `a.out`.
- `./first_kernel` runs the program. The `./` tells the shell to look in the current folder.

The program prints 4 lines, one per thread:

```
Block ID: 0  ===  Thread ID: 2
Block ID: 0  ===  Thread ID: 0
Block ID: 0  ===  Thread ID: 3
Block ID: 0  ===  Thread ID: 1
```

- There are 4 lines because 4 threads run and each prints once.
- `Block ID` is always 0 because there is only one block.
- Each `Thread ID` from 0 to 3 shows up exactly once, because each thread has its own `threadIdx.x`.
- The order here is 2, 0, 3, 1, but your run may show another order. The threads write to the printf buffer in no fixed order, as explained above.

## Visual

<cuda-launch blocks="1" threads="4" fn="printIDs"></cuda-launch>

## Glossary

- warp: a group of 32 threads the GPU runs together as one unit. The GPU schedules warps, not single threads.
- SIMT (Single Instruction, Multiple Threads): every active thread in a warp runs the same instruction in the same clock cycle. Each thread has its own data and its own ID.
- warp divergence: threads in one warp take different paths. For example, thread 0 enters an if-branch and thread 1 does not. The GPU then runs both paths one after the other, which is slower.
- printf buffer: GPU printf does not write to the screen directly. It writes to a buffer in GPU memory. The buffer goes to the screen only when you call `cudaDeviceSynchronize()`.
