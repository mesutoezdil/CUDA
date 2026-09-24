# Compute Capability

This lesson explains compute capability, how its numbers work, and how it decides which features and CUDA toolkit versions you can use.

## What Compute Capability Is

Compute capability (CC) is NVIDIA's system for describing the features and processing power of a GPU. It is sometimes called a version number.

It is not a marketing score or a benchmark. It says exactly what a GPU architecture can and cannot do. Think of it as a specification sheet in a single number.

## How the Numbering Works

Compute capability is a version number, like 3.0, 5.1, or 7.5. The rule is the same for all generations:

- The number before the dot signals a major architectural change
- The number after the dot represents minor improvements or extensions

So going from 7.x to 8.x is not just a speed bump. It means a different architecture with new hardware units and new capabilities.

## The Architectures

### Volta → CC 7.x

Volta introduced Tensor Cores. These are special units that speed up the matrix operations used in AI and deep learning. Before Volta, these operations ran on general-purpose CUDA cores. After Volta, they had dedicated hardware.

### Ampere → CC 8.x

Ampere brought more powerful and efficient Tensor Cores, higher memory bandwidth, and better energy efficiency. It refined and expanded the ideas from Volta.

### Hopper → CC 9.x

Hopper was another major step. It introduced new execution models and pushed AI performance forward.

> [!WARNING]
> Hopper needs CUDA toolkit 11.8 or higher. A lower version gives a compatibility error.

### Blackwell → CC 10.0 (B200/GB200) and 12.0 (RTX PRO / RTX 50 series)

Blackwell is the current generation as of 2026. It has 5th-generation Tensor Cores and a new precision format called NVFP4. NVFP4 doubles throughput compared to FP8 for large model inference. FP4 acceleration does not exist on earlier architectures. To build natively for Blackwell, you need CUDA Toolkit 12.8.

## Feature Support

The official CUDA documentation has tables that map features to compute capability versions. These tables show clear patterns:

- GPUs at CC 5.0 do not support half-precision (FP16) operations
- Tensor Cores appear only from CC 7.x onward
- FP8 Tensor Cores arrive with CC 8.9 (Ada Lovelace) and 9.0 (Hopper)
- NVFP4 requires CC 10.0 or higher

A missing feature is missing completely, because features are hardware units. If your GPU has no Tensor Cores, you cannot use them. There is no software workaround and no emulation. The hardware either has the unit or it does not.

So before writing performance-sensitive CUDA code, ask "Does my GPU support what I need?" This comes before "Is my GPU fast enough?"

## Software Compatibility

Compute capability also decides which CUDA toolkit versions you can use. Higher compute capability allows newer toolkits, and newer toolkits bring more features and better optimizations.

Some examples:

- Maxwell (CC 5.x) - requires CUDA 6.5 or higher
- Hopper (CC 9.x) - requires CUDA 11.8 or higher
- Blackwell (CC 10.0) - requires CUDA 12.8 for native cubin support

A toolkit below the minimum for your architecture gives a hard error. The code will not compile, or it will fail at runtime.

The workflow is always the same:

1. Find your GPU's compute capability.
2. Choose your CUDA version.
3. Write your code.

<cc-explorer></cc-explorer>

## The Low-Level Layer (PTX)

CUDA code does not run directly on the GPU. It compiles to PTX first. PTX is a low-level intermediate language, similar to an assembly language for NVIDIA GPUs.

Some PTX instructions need hardware units that exist only from a certain compute capability onward. Warp shuffle functions are one example.

> [!NOTE]
> Warp shuffle functions let threads in a warp share data without using shared or global memory. Warp shuffle exists since CC 3.0 (Kepler).

If your GPU is below the minimum, these instructions cannot run. The hardware for them is not on the chip.

## Summary

The same rule applies to machine learning pipelines, physics simulations and custom CUDA kernels. Your GPU's compute capability is the contract between your hardware and your code.

Know your CC number. Check it against the CUDA documentation. Choose the right toolkit version. Then build. Performance tuning, optimization and feature choice all start from there.

> Compute capability is not just a version number. It is the definition of what your GPU can actually do.
