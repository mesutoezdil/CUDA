# Reading GPU White Papers

This lesson explains what GPU white papers are, how to find them, and how to read them.

## What a White Paper Is

A white paper is an official technical document about a GPU. It can feel heavy and too detailed at first. It is the most accurate source about a GPU. It has no marketing and no simplification. It shows how the hardware is actually built.

## Finding a White Paper

Take the chip name and add "white paper". For example: `GA100 white paper` or `H100 white paper`

Not every result is useful. Blog posts, summaries and comparisons can help, but they are not enough. Always look for the official PDF.

## A Consistent Structure

NVIDIA white papers follow a consistent structure. Each new architecture is usually explained against the previous one. So a white paper shows both what is new and what changed. This is why the same tables appear in different white papers.

Once you understand one white paper well, the others become much easier to read.

## The Direction of GPU Architectures

As of 2026, GPU architectures show a clear direction:

- Pascal was still mostly a general-purpose compute architecture.
- Volta introduced Tensor Cores. GPUs became explicitly optimized for AI workloads.
- Ampere expanded this with more throughput, better efficiency, and features like sparsity support.
- Hopper added FP8 and new execution models for large-scale AI systems.
- Blackwell adds new formats like NVFP4, which bring ultra-low precision directly into hardware. This changes how large models are deployed and scaled.

GPUs are no longer just compute devices. They are infrastructure for AI systems.

<arch-timeline focus="Pascal"></arch-timeline>

## The Streaming Multiprocessor (SM)

The most important section in a white paper is the Streaming Multiprocessor (SM). The SM is the core of the GPU. It brings together:

* CUDA cores
* Tensor cores
* Scheduling
* Memory access

To see what really changed in an architecture, look at the SM. The evolution is clear:

- Pascal has no Tensor Cores.
- Volta introduces them.
- Ampere improves and scales them.
- Hopper optimizes them for transformer workloads.
- Blackwell extends them with new precision formats and instructions.

Each step changes what the GPU is designed to do.

## The Order of Sections

Architectures change, but the way they are documented stays the same. The order is:

1. New features
2. SM design
3. Performance comparisons
4. Technical specifications

This consistency is on purpose. It makes the evolution across generations easier to follow.

<whitepaper-map></whitepaper-map>

## How to Read One

Reading white papers is not about memorizing numbers. It is about understanding change. Look at the SM, find the new hardware units, and compare them with the previous generation.
