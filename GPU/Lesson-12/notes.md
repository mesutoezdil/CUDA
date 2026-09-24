# CUDA Toolkit, The Foundation of GPU Programming

This lesson explains what the CUDA Toolkit is and what it gives you. It is the environment you use to write, run and study programs on a GPU.

## What CUDA is

CUDA is NVIDIA's platform for parallel computing. It connects your code to the GPU. Without it, you cannot fully control the GPU.

## The compiler: nvcc

The center of the toolkit is the compiler, `nvcc`. It turns your CUDA code into code the GPU can run.

This happens in two steps. First your code becomes an intermediate form, usually PTX. Then PTX becomes machine code for one specific GPU architecture.

<nvcc-pipeline></nvcc-pipeline>

As of 2026, this step matters more than before. Architectures such as Ampere, Hopper and Blackwell have different instructions, data types and execution models. So you must compile for the correct architecture. The same code may run on different GPUs. But without the right compile target, it will not behave the same or reach the same speed.

## Libraries

The toolkit also gives you optimized libraries. They use the GPU well, so you do not have to write everything yourself. There are libraries for:

- linear algebra
- Fourier transforms
- random number generation
- deep learning

These libraries get updates for new hardware. Recent CUDA versions for Hopper and Blackwell support new data formats such as FP8 and even FP4. Modern AI workloads use these low precision formats.

## The runtime API

Your program talks to the GPU through the CUDA runtime API. With explicit API calls, your program:

- allocates memory on the GPU
- moves data between the CPU and the GPU
- launches kernels

Data movement is often a main bottleneck in GPU programs. So knowing when and how data moves is as important as writing the kernel.

## Tools for profiling and debugging

You also need to see how your program behaves. The toolkit has tools for profiling, debugging and analyzing GPU apps. They measure performance, find bottlenecks and find memory problems. In 2026, workloads are large and complex, so performance tuning is a required part of development.

## Sample programs

The toolkit comes with sample programs. They show how memory is managed, how kernels are launched and how to improve performance. Studying them is a fast way to go from theory to real understanding.

## The toolkit follows the hardware

The toolkit is now closely tied to GPU architecture. Each new architecture brings new hardware features, and the toolkit adds support for them.

- CUDA 12.x and 13.x are needed to fully support Hopper and Blackwell. They add new instructions, new precision formats and more advanced execution features.

CUDA no longer tries to support everything equally. It aims to use modern hardware fully.

> [!WARNING]
> Support for older architectures is slowly removed. Maxwell, Pascal and even Volta are no longer the main target of new releases.

> [!NOTE]
> The toolkit is also no longer one fixed package. The compiler, libraries and profiling tools now change more independently. This shows how complex the ecosystem has become. CUDA today is a whole platform.

## Summary

The CUDA Toolkit is the complete environment for GPU programming. With it you write code, compile it, run it, analyze it and improve it. As of 2026, you need to understand CUDA to work seriously with GPUs. Everything else is built on it.
