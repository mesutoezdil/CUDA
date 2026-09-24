# Lesson 04: Built-in Variables

Every kernel has five read-only built-in variables: `gridDim`, `blockDim`, `blockIdx`, `threadIdx`, and `warpSize`. You do not pass or declare them. The hardware sets them at launch, based on the launch configuration.

## gridDim

`gridDim` holds the number of blocks in each direction. With `<<<2, 4>>>`, `gridDim.x` is 2, and `gridDim.y` and `gridDim.z` are 1. The grid size is fixed at launch, so every thread sees the same `gridDim`.

## blockDim

`blockDim` holds the number of threads per block in each direction. With `<<<2, 4>>>`, `blockDim.x` is 4, and `blockDim.y` and `blockDim.z` are 1. The global ID formula from Lesson 02 uses it: `blockIdx.x * blockDim.x + threadIdx.x`.

## blockIdx

`blockIdx` is the index of the thread's block. With 2 blocks, `blockIdx.x` is 0 for all threads in block 0 and 1 for all threads in block 1. It is always less than `gridDim.x`.

## threadIdx

`threadIdx` is the index of the thread inside its block. It restarts at 0 in every block. In a block of 4 threads, `threadIdx.x` is 0, 1, 2, 3.

`gridDim`, `blockDim`, `blockIdx`, and `threadIdx` are all `dim3` structs with `.x`, `.y`, `.z` fields. If you write `<<<2, 4>>>` with plain numbers, CUDA sets `.y = 1` and `.z = 1` for you.

## warpSize

`warpSize` is the number of threads per warp. It is 32 on every current GPU. It is a variable and not a fixed constant because NVIDIA may change it in a future architecture. Writing 32 works today. Reading `warpSize` stays correct if it ever changes.

## Hardware limits

Before running a kernel, the driver checks the launch configuration against hardware limits. If any value is too large, the kernel does not launch. These are the limits for CC 3.0 and later (Kepler to Blackwell):

| Variable      | Dimension    | Max value |
|---------------|--------------|-----------|
| `gridDim.x`   | blocks in x  | 2^31 - 1  |
| `gridDim.y`   | blocks in y  | 65535     |
| `gridDim.z`   | blocks in z  | 65535     |
| `blockDim.x`  | threads in x | 1024      |
| `blockDim.y`  | threads in y | 1024      |
| `blockDim.z`  | threads in z | 64        |
| threads/block | total        | 1024      |

`blockDim.x * blockDim.y * blockDim.z` must not be more than 1024, even if each single value is within its limit. This is the same 1024 threads-per-block limit from Lesson 02.

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

The output has 8 lines. The order of blocks, and of threads inside each block, can change between runs.

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

## Glossary

- `gridDim`: number of blocks in each direction (x, y, z). Same for every thread in the launch.
- `blockDim`: number of threads per block in each direction. Same for every thread in the launch.
- `blockIdx`: index of the thread's block. Always less than `gridDim` in each direction.
- `threadIdx`: index of the thread inside its block. Restarts at zero in every block.
- `warpSize`: number of threads per warp. Always 32 on current hardware.
- `dim3`: a CUDA struct with `.x`, `.y`, `.z` integer fields. The four index and size variables use this type. Plain numbers in `<<<>>>` become a `dim3` with `.y=1` and `.z=1`.
