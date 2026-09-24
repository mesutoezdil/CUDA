# Lesson 07: Warp IDs

This lesson covers warps, the third level of the CUDA hierarchy. Lesson-01 and Lesson-02 covered block and thread IDs. Here you learn how a thread finds its own warp inside the kernel. Machine: NVIDIA L40S, CUDA 13.0, Ubuntu 24.

## CUDA Hierarchy

The software levels in CUDA are:

```
Grid
  └── Blocks
        └── Warps  (exactly 32 threads each)
              └── Threads
```

You choose the number of blocks and threads per block with `<<<num_blocks, threads_per_block>>>` (see Lesson-01, Lesson-02). The warp size is always 32 on NVIDIA GPUs. It is fixed in the hardware and cannot be changed. The warp is the real scheduling unit on the GPU. The GPU does not run threads one by one. It runs them in groups of 32.

Warp limits depend on the hardware. These values were measured on the L40S with `cudaGetDeviceProperties`:

- Max warps per block: 32 (max 1024 threads / 32, applies to all GPUs)
- Max concurrent warps per SM: 48
- SM count: 142
- Max concurrent warps across the entire GPU: 6,816

## warp_id Is Not a Built-in Variable

`blockIdx.x` and `threadIdx.x` are filled in by the GPU for each thread. You only read them. There is no such variable for the warp ID. You calculate it yourself inside the kernel:

```c
int warp_id = threadIdx.x / 32;
```

In a block of 128 threads:

- threads 0-31 → warp 0
- threads 32-63 → warp 1
- threads 64-95 → warp 2
- threads 96-127 → warp 3

That is 128 / 32 = 4 warps.

## What Happens with 1024 Threads

With 1 block of 1024 threads (`<<<1, 1024>>>`), warp IDs go from 0 to 31. This is correct, because 1024 / 32 = 32 warps. Each warp ID has exactly 32 threads:

```
Block ID: 0 --- Thread ID:    0 --- Warp ID:  0
Block ID: 0 --- Thread ID:    1 --- Warp ID:  0
...
Block ID: 0 --- Thread ID:   31 --- Warp ID:  0
Block ID: 0 --- Thread ID:   32 --- Warp ID:  1
...
Block ID: 0 --- Thread ID:  992 --- Warp ID: 31
...
Block ID: 0 --- Thread ID: 1023 --- Warp ID: 31
```

Checked on the machine: warps 0-31, exactly 32 threads each, 1024 lines in total.

```
32 warp 0
32 warp 1
...
32 warp 31
```

## Warp ID Resets Per Block

The warp ID starts at zero in every block. With 2 blocks, both blocks have warp 0 and warp 1. So warp ID 0 alone does not tell you the block. You also need the block ID. With `<<<2, 64>>>`, each block has 64 threads, which is 2 warps. `warp_id=0` appears twice, once in block 0 and once in block 1.

## Lane ID (Exercise)

Each warp has 32 threads. A thread's position inside its warp, from 0 to 31, is its lane ID. You get it with the modulo operator, `threadIdx.x % 32`. For example, thread 33 is in warp 1 and has lane ID 1 (33 % 32 = 1). Threads 0, 32, and 64 are in different warps but all have lane ID 0. So modulo does not give the warp ID. For the warp ID you need division (`/`).

## Code

The kernel runs with 1 block of 128 threads. The `test01` function runs on the GPU. Each thread computes its `warp_id` with `threadIdx.x / 32` and prints its block ID, thread ID, and warp ID. After the launch, `cudaDeviceSynchronize()` makes the CPU wait for the GPU, so the output is not lost when the program ends.

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>

__global__ void test01()
{
    int warp_id = threadIdx.x / 32;
    printf("Block ID: %d --- Thread ID: %d --- Warp ID: %d\n",
           blockIdx.x, threadIdx.x, warp_id);
}

int main()
{
    // 1 block, 128 threads -> 4 warps (IDs: 0,1,2,3)
    test01<<<1, 128>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- `#include "cuda_runtime.h"`: header for CUDA functions.
- `#include "device_launch_parameters.h"`: defines GPU built-in variables like `blockIdx` and `threadIdx`.
- `#include <stdio.h>`: standard C header for `printf`.
- `__global__`: marks the function as a kernel. The CPU calls it and the GPU runs it.
- `int warp_id = threadIdx.x / 32;`: each thread computes its own warp ID. Threads 0-31 → 0, threads 32-63 → 1, and so on.
- `printf(...)`: each thread prints its block ID, thread ID, and warp ID.
- `test01<<<1, 128>>>();`: launches the kernel with 1 block of 128 threads.
- `cudaDeviceSynchronize();`: makes the CPU wait until all GPU threads finish and the output is written.

## warp_ids_2blocks.cu

This file uses the same kernel as `warp_ids.cu`. Only the launch config is different, `<<<2, 64>>>`. That is 2 blocks of 64 threads, so each block has 64 / 32 = 2 warps. The file shows that the warp ID resets in each block.

```c
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>

__global__ void test01()
{
    int warp_id = threadIdx.x / 32;
    printf("Block ID: %d --- Thread ID: %d --- Warp ID: %d\n",
           blockIdx.x, threadIdx.x, warp_id);
}

int main()
{
    // 2 blocks, 64 threads/block -> 2 warps per block, warp ID resets per block
    test01<<<2, 64>>>();
    cudaDeviceSynchronize();
    return 0;
}
```

- `test01<<<2, 64>>>();`: launches the kernel with 2 blocks of 64 threads. That is 128 threads and 4 warps in total, split across 2 blocks.
- All other lines are the same as in `warp_ids.cu`.

## Compile and Run

Both files are in the `code/` directory:

```bash
# 1 block, 128 threads -> 4 warps
nvcc -arch=sm_89 -o warp_ids warp_ids.cu
./warp_ids

# 2 blocks, 64 threads/block -> 2 warps per block
nvcc -arch=sm_89 -o warp_ids_2blocks warp_ids_2blocks.cu
./warp_ids_2blocks
```

## Output: `<<<1, 128>>>`

128 lines, 4 warps. This is real L40S output. Thread order is not guaranteed, so the listing below is sorted.

```
Block ID: 0 --- Thread ID:  0 --- Warp ID: 0
Block ID: 0 --- Thread ID:  1 --- Warp ID: 0
Block ID: 0 --- Thread ID:  2 --- Warp ID: 0
...
Block ID: 0 --- Thread ID: 31 --- Warp ID: 0
Block ID: 0 --- Thread ID: 32 --- Warp ID: 1
Block ID: 0 --- Thread ID: 33 --- Warp ID: 1
...
Block ID: 0 --- Thread ID: 63 --- Warp ID: 1
Block ID: 0 --- Thread ID: 64 --- Warp ID: 2
...
Block ID: 0 --- Thread ID: 95 --- Warp ID: 2
Block ID: 0 --- Thread ID: 96 --- Warp ID: 3
...
Block ID: 0 --- Thread ID: 127 --- Warp ID: 3
```

## Output: `<<<2, 64>>>`

128 lines, 2 blocks, 2 warps per block. The warp ID resets in each block.

```
Block ID: 0 --- Thread ID:  0 --- Warp ID: 0
...
Block ID: 0 --- Thread ID: 31 --- Warp ID: 0
Block ID: 0 --- Thread ID: 32 --- Warp ID: 1
...
Block ID: 0 --- Thread ID: 63 --- Warp ID: 1
Block ID: 1 --- Thread ID:  0 --- Warp ID: 0   <- resets to zero
...
Block ID: 1 --- Thread ID: 31 --- Warp ID: 0
Block ID: 1 --- Thread ID: 32 --- Warp ID: 1
...
Block ID: 1 --- Thread ID: 63 --- Warp ID: 1
```

Block 1 shows warp_id 0 again because warp IDs start at zero in every block. There is no global warp number for the whole GPU.

## Visual

<cuda-launch blocks="1" threads="128" fn="test01"></cuda-launch>

<cuda-launch blocks="2" threads="64" fn="test01"></cuda-launch>

```
test01<<<1, 128>>>
              |
    1 block --+-- 128 threads/block

Block 0
+-------------------------------------------------------+
|  Warp 0: threads   0 -  31  (0/32 = 0)               |
|  Warp 1: threads  32 -  63  (32/32 = 1)              |
|  Warp 2: threads  64 -  95  (64/32 = 2)              |
|  Warp 3: threads  96 - 127  (96/32 = 3)              |
+-------------------------------------------------------+

test01<<<2, 64>>>

Block 0                          Block 1
+---------------------------+   +---------------------------+
|  Warp 0: threads  0 - 31 |   |  Warp 0: threads  0 - 31 |
|  Warp 1: threads 32 - 63 |   |  Warp 1: threads 32 - 63 |
+---------------------------+   +---------------------------+
  warp_id: 0, 1                   warp_id: 0, 1  (resets)
```

## Glossary

- warp: a group of 32 threads that the GPU runs as one unit. The GPU schedules warps, not single threads.
- warp size: always 32 on NVIDIA GPUs. Software cannot change it.
- warp ID: the warp a thread belongs to inside its block. It is `threadIdx.x / 32`.
- lane ID: a thread's position inside its warp, from 0 to 31. It is `threadIdx.x % 32`. It does not give the warp ID.
- warps per block: `(threads per block) / 32`. 128 threads/block → 4 warps/block.
- warp ID reset: warp IDs start at zero in every block, like `threadIdx.x`. There is no global warp ID for the whole GPU.
