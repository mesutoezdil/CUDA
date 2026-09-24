# Lesson 00: One Block, One Thread

This lesson runs the simplest possible kernel. It uses one block and one thread, with no parallelism, so you can see the first output before anything gets complex.

## GPU vs CPU

On the CPU, a function runs once on one core. On the GPU, a kernel runs many times in parallel. Each copy runs on its own thread. Two numbers set how many threads run. They are the block count and the thread count.

## What `__global__` means

```c
__global__ void printIDs() { ... }
```

`__global__` marks a function as a GPU kernel. The compiler builds it for the GPU, not the CPU. The CPU calls it, but it runs on the GPU. 
> [!NOTE]
> Two other qualifiers exist. `__device__` runs on the GPU and can be called only from GPU code. `__host__` is a normal CPU function that can be called only from the CPU.

## Launch configuration `<<<blocks, threads>>>`

```c
printIDs<<<1, 1>>>();
//          ^  ^
//  blocks -+  +- threads per block
```

The `<<<...>>>` syntax is the execution configuration. It goes between the function name and the argument list. The first number is the number of blocks. The second number is the threads per block. `<<<1, 1>>>` means one block with one thread. Total threads are 1 x 1 = 1.

## Thread, Block, Grid

Every kernel launch creates three levels:

- thread: the smallest unit. One thread runs one copy of the kernel.
- block: a group of threads on the same physical processor. They can share memory.
- grid: all blocks of one kernel launch. One launch, one grid.

<cuda-hierarchy></cuda-hierarchy>

## `blockIdx.x` and `threadIdx.x`

```c
printf("Block ID: %d  Thread ID: %d", blockIdx.x, threadIdx.x);
```

`blockIdx.x` is the index of the block this thread is in. `threadIdx.x` is the index of this thread inside its block. Both have `.x`, `.y` and `.z` parts, because grids and blocks can be 1D, 2D or 3D. For 1D work, you only use `.x`. With `<<<1, 1>>>`, both are always 0.

## Header files

- `cuda_runtime.h`: CUDA runtime API, includes `cudaDeviceSynchronize()` and error-checking functions.
- `stdio.h`: standard C, needed for `printf`.

> [!NOTE]
> `device_launch_parameters.h` makes `blockIdx`, `threadIdx`, `blockDim` and `gridDim` available inside kernels when you use MSVC or certain IDEs.

## `cudaDeviceSynchronize()`

Kernel launches are asynchronous. The CPU starts the kernel and goes to the next line at once. Without `cudaDeviceSynchronize()`, `main()` returns and the program exits before the GPU prints anything. This function makes the CPU wait until all GPU work is done.

<kernel-sync></kernel-sync>

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

- The three `#include` lines load the headers described above.
- `printIDs` is the kernel. Each thread prints its block ID and its thread ID. The `\n` at the start of the string puts each line on a new line.
- `printIDs<<<1, 1>>>();` starts the kernel with one block of one thread.
- `cudaDeviceSynchronize();` waits for the GPU, so the print shows up before the program ends.

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

The program prints this:

```
Block ID: 0  ===  Thread ID: 0
```

There is one line because there is one thread, and each thread prints once. Both IDs are 0 because the only block and the only thread each get index 0. The output is the same on every run, because one thread has no other thread to race with.

## Visual

<cuda-launch blocks="1" threads="1" fn="printIDs"></cuda-launch>

## Glossary

- kernel: a function that runs on the GPU. You write it once, and the GPU runs it on many threads at the same time.
- thread: the smallest unit of execution. One thread is one running copy of the kernel, with its own ID.
- block: a group of threads on the same physical processor. They can share data through shared memory.
- grid: all blocks started by one kernel call.
- `__global__`: tells the compiler this function is a GPU kernel. The CPU calls it and the GPU runs it.
- `blockIdx.x`: the index of the block the current thread is in. Starts at 0.
- `threadIdx.x`: the index of the current thread inside its block. Starts at 0.
- `cudaDeviceSynchronize()`: makes the CPU wait until the GPU finishes all its work.
- asynchronous: the CPU does not wait. It sends a command to the GPU and moves on at once.
