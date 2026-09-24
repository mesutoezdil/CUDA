# Lesson 02: Two Blocks, 1024 Threads Each

A block can hold at most 1024 threads. To run more threads, you add more blocks. This lesson launches 2 blocks x 1024 threads = 2048 threads.

## The 1024-thread limit

A block must fit on one streaming multiprocessor (SM). An SM has a fixed number of registers, a fixed amount of shared memory, and a fixed warp scheduler capacity. If a block asks for more than 1024 threads, the SM cannot hold it. The CUDA driver then rejects the launch.

## Streaming Multiprocessors (SMs)

An SM is the physical processing unit inside the GPU. Each SM has CUDA cores, a register file, shared memory, L1 cache, and warp schedulers. A mid-range GPU like the RTX 3080 has 68 SMs. At launch, the driver spreads blocks across the free SMs. One SM can run one or more blocks, depending on how many resources each block needs.

## Thread IDs with multiple blocks

```c
printIDs<<<2, 1024>>>();
//          ^     ^
//  blocks -+     +- threads per block
```

Block 0 has threads 0-1023. Block 1 has its own threads 0-1023. Thread IDs restart at 0 in every block. To get a unique global ID, use this formula:

```
global_id = blockIdx.x * blockDim.x + threadIdx.x
```

`blockDim.x` is a built-in variable. It holds the number of threads per block set at launch. Here it is 1024. Kernels that work on arrays use this formula to give each thread one element.

## The silent failure: `<<<1, 2048>>>`

```c
// printIDs<<<1, 2048>>>();  exceeds 1024 thread-per-block limit
```

This line compiles without error. The driver checks the 1024 limit at runtime, not the compiler. At launch, the driver sees the invalid config and drops the whole kernel call. There is no output, no crash, and no error message. Call `cudaGetLastError()` after the kernel to catch it. Uncomment the line, run it, and compare the output.

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

## Compile and run

```bash
nvcc first_kernel.cu -o first_kernel
./first_kernel
```

The output has 2048 lines. `blockIdx.x` is 0 or 1. `threadIdx.x` goes from 0 to 1023. Lines appear in any order.

```
Block ID: 0  ===  Thread ID: 0
Block ID: 1  ===  Thread ID: 0
Block ID: 0  ===  Thread ID: 1
Block ID: 1  ===  Thread ID: 1
...
```

## Visual

<cuda-launch blocks="2" threads="1024" fn="printIDs"></cuda-launch>

<sm-scheduler blocks="2" sms="2"></sm-scheduler>

```
printIDs<<<2, 1024>>>
              |     |
    blocks ---+     +--- threads per block

GPU Grid
+-------------------------------+  +-------------------------------+
|  Block 0  (blockIdx=0)        |  |  Block 1  (blockIdx=1)        |
|  T0  T1  T2  ...  T1022 T1023 |  |  T0  T1  T2  ...  T1022 T1023 |
|  threadIdx.x restarts at 0    |  |  threadIdx.x restarts at 0    |
+-------------------------------+  +-------------------------------+
         |                                      |
         v                                      v
+------------------+                +------------------+
|  SM 0            |                |  SM 1            |
|  (Streaming      |                |  (Streaming      |
|   Multiprocessor)|                |   Multiprocessor)|
+------------------+                +------------------+

Blocks get assigned to free SMs. Order is not guaranteed.
```

## Glossary

- SM (Streaming Multiprocessor): the physical processor inside the GPU. Blocks run on SMs. One SM can run several blocks at once if it has enough resources.
- `blockDim.x`: built-in variable with the number of threads per block. It is the second number in `<<<blocks, threads>>>`.
- global thread ID: a unique ID for each thread in the whole grid. It is `blockIdx.x * blockDim.x + threadIdx.x`. Thread IDs repeat across blocks. Global IDs do not.
- `cudaGetLastError()`: returns the last CUDA error code. It catches silent failures, such as an invalid launch config that the driver drops without a message.
- non-deterministic: the result or order cannot be predicted. Block scheduling depends on which SM is free at launch time.
