# Lesson 02: Two Blocks, 1024 Threads Each

A block can hold at most 1024 threads. To run more threads, you add more blocks. This lesson launches 2 blocks x 1024 threads = 2048 threads.

## The 1024-thread limit

A block must fit on one streaming multiprocessor (SM). An SM has a fixed number of registers, a fixed amount of shared memory, and a fixed warp scheduler capacity. If a block asks for more than 1024 threads, the SM cannot hold it. The CUDA driver then rejects the launch.

## Streaming Multiprocessors (SMs)

An SM is the physical processing unit inside the GPU. Each SM has CUDA cores, a register file, shared memory, L1 cache, and warp schedulers. At launch, the driver spreads blocks across the free SMs. One SM can run one or more blocks, depending on how many resources each block needs.

> [!NOTE]
> The SM count depends on the GPU. A mid-range GPU like the RTX 3080 has 68 SMs.

## Thread IDs with multiple blocks

```c
printIDs<<<2, 1024>>>();
//          ^     ^
//  blocks -+     +- threads per block
```

Block 0 has threads 0-1023. Block 1 has its own threads 0-1023. Thread IDs restart at 0 in every block. To get a unique global ID, use this formula:

```c
global_id = blockIdx.x * blockDim.x + threadIdx.x
```

`blockDim.x` is a built-in variable. It holds the number of threads per block set at launch. Here it is 1024. Kernels that work on arrays use this formula to give each thread one element.

## The silent failure: `<<<1, 2048>>>`

```c
// printIDs<<<1, 2048>>>();  exceeds 1024 thread-per-block limit
```

This line compiles without error. The driver checks the 1024 limit at runtime, not the compiler. At launch, the driver sees the invalid config and drops the whole kernel call. There is no output, no crash, and no error message. Call `cudaGetLastError()` after the kernel to catch it.

> [!TIP]
> Uncomment the line, run it, and compare the output.

## Block scheduling

The order in which blocks run on SMs is non-deterministic. The driver gives each block to whichever SM is free first. Block 0 and Block 1 can run at the same time on different SMs. So their output lines mix in a different order on every run.

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
    // printIDs<<<1, 2048>>>();  exceeds 1024 thread-per-block limit, launches nothing at runtime
    printIDs<<<2, 1024>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- The commented line is the invalid launch from the section above. It stays commented out so the program works.
- `printIDs<<<2, 1024>>>();` starts 2 blocks of 1024 threads each. This stays inside the limit and still runs 2048 threads.
- The rest is the same as in Lesson 00 and Lesson 01.

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

The program prints 2048 lines, one per thread. Here are the first few:

```
Block ID: 0  ===  Thread ID: 0
Block ID: 1  ===  Thread ID: 0
Block ID: 0  ===  Thread ID: 1
Block ID: 1  ===  Thread ID: 1
...
```

- The `...` stands for the rest of the 2048 lines.
- `Block ID` is 0 or 1, because there are two blocks.
- Every `Thread ID` from 0 to 1023 shows up twice, once in each block. Thread IDs restart at 0 in every block.
- The lines of Block 0 and Block 1 mix, and the order changes between runs. The two blocks can run at the same time on different SMs, as explained in Block scheduling.

## Visual

<cuda-launch blocks="2" threads="1024" fn="printIDs"></cuda-launch>

<sm-scheduler blocks="2" sms="2"></sm-scheduler>

## Glossary

- SM (Streaming Multiprocessor): the physical processor inside the GPU. Blocks run on SMs. One SM can run several blocks at once if it has enough resources.
- `blockDim.x`: built-in variable with the number of threads per block. It is the second number in `<<<blocks, threads>>>`.
- global thread ID: a unique ID for each thread in the whole grid. It is `blockIdx.x * blockDim.x + threadIdx.x`. Thread IDs repeat across blocks. Global IDs do not.
- `cudaGetLastError()`: returns the last CUDA error code. It catches silent failures, such as an invalid launch config that the driver drops without a message.
- non-deterministic: the result or order cannot be predicted. Block scheduling depends on which SM is free at launch time.
