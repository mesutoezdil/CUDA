# Lesson 04: Built-in Variables

Every kernel has five read-only variables built in: `gridDim`, `blockDim`, `blockIdx`, `threadIdx`, and `warpSize`. They are not passed as arguments and not declared anywhere in user code. The hardware sets them at launch time based on the execution configuration.

## gridDim

`gridDim` holds how many blocks were launched in each direction. With `<<<2, 4>>>`, `gridDim.x` is 2 and `gridDim.y` and `gridDim.z` are both 1. Every thread in the launch reads the same `gridDim` values because the grid dimensions are fixed at launch time.

## blockDim

`blockDim` holds how many threads are in each block in each direction. With `<<<2, 4>>>`, `blockDim.x` is 4 and `blockDim.y` and `blockDim.z` are 1. The global ID formula from Lesson 02 uses it directly: `blockIdx.x * blockDim.x + threadIdx.x`.

## blockIdx

`blockIdx` is the index of the block this thread belongs to. In a grid of 2 blocks, `blockIdx.x` is 0 for every thread in block 0 and 1 for every thread in block 1. It is always in range: `blockIdx.x < gridDim.x`.

## threadIdx

`threadIdx` is the index of this thread within its block. It restarts at 0 in every block. In a block of 4 threads, `threadIdx.x` runs 0, 1, 2, 3. All four variables (`gridDim`, `blockDim`, `blockIdx`, `threadIdx`) are `dim3` structs with `.x`, `.y`, `.z` fields. Writing `<<<2, 4>>>` without a `dim3` value makes CUDA fill in `.y = 1` and `.z = 1` automatically.

## warpSize

`warpSize` holds the number of threads per warp. On every current GPU it is 32. It is a variable rather than a compile-time constant because NVIDIA reserved the right to change it in a future architecture. Hardcoding 32 works today; reading `warpSize` stays correct if that ever changes.

## Hardware limits

The driver checks the launch configuration against hardware limits before running the kernel. If any dimension exceeds its maximum, the kernel does not launch. Limits for CC 3.0 and later (Kepler through Blackwell):

| Variable      | Dimension    | Max value |
|---------------|--------------|-----------|
| `gridDim.x`   | blocks in x  | 2^31 - 1  |
| `gridDim.y`   | blocks in y  | 65535     |
| `gridDim.z`   | blocks in z  | 65535     |
| `blockDim.x`  | threads in x | 1024      |
| `blockDim.y`  | threads in y | 1024      |
| `blockDim.z`  | threads in z | 64        |
| threads/block | total        | 1024      |

`blockDim.x * blockDim.y * blockDim.z` must not exceed 1024 regardless of the individual dimension values. This is the same 1024 thread-per-block cap from Lesson 02.

## Code

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>

__global__ void printBuiltins()
{
    printf("\ngridDim=(%d,%d,%d)  blockDim=(%d,%d,%d)  blockIdx=(%d,%d,%d)  threadIdx=(%d,%d,%d)  warpSize=%d",
        gridDim.x,   gridDim.y,   gridDim.z,
        blockDim.x,  blockDim.y,  blockDim.z,
        blockIdx.x,  blockIdx.y,  blockIdx.z,
        threadIdx.x, threadIdx.y, threadIdx.z,
        warpSize);
}

int main()
{
    printBuiltins<<<2, 4>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

## Compile and run

```bash
nvcc first_kernel.cu -o first_kernel
./first_kernel
```

Output (8 lines, block order non-deterministic, thread order within each block non-deterministic):

```
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(1,0,0)  threadIdx=(0,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(1,0,0)  threadIdx=(1,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(1,0,0)  threadIdx=(2,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(1,0,0)  threadIdx=(3,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(0,0,0)  threadIdx=(0,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(0,0,0)  threadIdx=(1,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(0,0,0)  threadIdx=(2,0,0)  warpSize=32
gridDim=(2,1,1)  blockDim=(4,1,1)  blockIdx=(0,0,0)  threadIdx=(3,0,0)  warpSize=32
```

`gridDim` and `blockDim` are the same on every line. `blockIdx` changes per block. `threadIdx` changes per thread. `warpSize` is always 32.

## Visual

<cuda-launch blocks="2" threads="4" fn="printBuiltins"></cuda-launch>

```
printBuiltins<<<2, 4>>>
                  |  |
        blocks ---+  +--- threads per block

        gridDim.x = 2    gridDim.y = 1    gridDim.z = 1
        blockDim.x = 4   blockDim.y = 1   blockDim.z = 1

GPU Grid
+-------------------------------+  +-------------------------------+
|  Block 0  (blockIdx.x=0)      |  |  Block 1  (blockIdx.x=1)      |
|  threadIdx.x:  0   1   2   3  |  |  threadIdx.x:  0   1   2   3  |
+-------------------------------+  +-------------------------------+

All 8 threads fit in one warp (warpSize=32, 24 lanes inactive).
```

## Glossary

- `gridDim`: holds the number of blocks in each direction (x, y, z). Same for every thread in the launch.
- `blockDim`: holds the number of threads per block in each direction. Same for every thread in the launch.
- `blockIdx`: index of the block this thread belongs to. Always less than `gridDim` in each dimension.
- `threadIdx`: index of this thread within its block. Restarts at zero in every block.
- `warpSize`: number of threads per warp. Always 32 on current hardware.
- `dim3`: a CUDA struct with `.x`, `.y`, `.z` integer fields. All four index and dimension variables use this type. Plain integers in `<<<>>>` are promoted to `dim3` with `.y=1` and `.z=1`.
