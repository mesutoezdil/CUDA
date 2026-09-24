# Lesson 02: Two Blocks, 1024 Threads Each

The thread count per block hits the hardware maximum. To go beyond 1024 threads, blocks must be added. This lesson launches 2 blocks x 1024 threads = 2048 threads total.

## The 1024-thread limit

Every block must fit entirely on one streaming multiprocessor (SM). An SM has a fixed number of registers, a fixed amount of shared memory, and a fixed warp scheduler capacity. If a block requests more than 1024 threads, the SM cannot hold it and the CUDA driver rejects the launch.

## Streaming Multiprocessors (SMs)

A streaming multiprocessor is the physical processing unit inside the GPU. Each SM contains multiple CUDA cores, a register file, shared memory, L1 cache, and warp schedulers. A mid-range GPU like the RTX 3080 has 68 SMs. When a kernel launches, the driver distributes blocks across available SMs. Each SM runs one or more blocks depending on how many resources each block needs.

## Thread IDs with multiple blocks

```c
printIDs<<<2, 1024>>>();
//          ^     ^
//  blocks -+     +- threads per block
```

Block 0 gets threads 0-1023, block 1 gets its own threads 0-1023. Thread IDs are local to the block and restart at 0 in every block. To get a unique global ID:

```
global_id = blockIdx.x * blockDim.x + threadIdx.x
```

`blockDim.x` is a built-in variable holding the number of threads per block as set at launch. Here it is always 1024. Array-processing kernels use this formula to assign each thread to one element.

## The silent failure: `<<<1, 2048>>>`

```c
// printIDs<<<1, 2048>>>();  exceeds 1024 thread-per-block limit
```

This compiles without error. The 1024 limit is enforced at runtime by the driver, not by the compiler. At launch the driver finds the config invalid and drops the entire kernel call with no output, no crash, and no error message. Call `cudaGetLastError()` after the kernel to detect it. Uncomment the line, run it, and compare the output.

## Block scheduling

Block scheduling across SMs is non-deterministic. The driver assigns blocks to whichever SM becomes free first. Block 0 and Block 1 can run simultaneously on different SMs, so their output lines interleave in a different pattern every run.

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

Output (2048 lines, `blockIdx.x` as 0 or 1, `threadIdx.x` from 0 to 1023, interleaved in any order):

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

- SM (Streaming Multiprocessor): the physical processor inside the GPU. Blocks run on SMs. One SM can run multiple blocks at the same time if it has enough resources.
- `blockDim.x`: built-in variable. Holds the number of threads per block. Set by the second number in `<<<blocks, threads>>>`.
- global thread ID: a unique ID for each thread across the entire grid. Computed as `blockIdx.x * blockDim.x + threadIdx.x`. Thread IDs inside blocks repeat, global IDs do not.
- `cudaGetLastError()`: returns the last CUDA error as an error code. Useful for catching silent failures like an invalid launch config that the driver drops without printing anything.
- non-deterministic: the result or order cannot be predicted. Block scheduling is non-deterministic because it depends on which SM happens to be free at launch time.
