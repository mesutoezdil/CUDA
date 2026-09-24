# Reading the Volta White Paper

This lesson walks through the V100 white paper. It shows what Volta changed and why it matters for GPUs today.

## Why Read a Real White Paper

A white paper shows the hardware design directly, without simplification. Volta is one of the most important examples. The V100 white paper shows the moment GPUs changed direction.

## Start With Key Features

Do not jump straight into diagrams or numbers. Start with the "Key Features" section. It is short and shows what the architecture is trying to do.

For Volta, the focus is clear. The architecture is built for artificial intelligence. This is a change in purpose, not just an improvement over the previous generation.

## Tensor Cores

The most important change in Volta is Tensor Cores.

Before Volta, GPUs ran matrix operations on general CUDA cores. That worked, but it was not efficient. Volta gives matrix operations their own dedicated hardware.

From here, the GPU is no longer just a general compute device. It is designed for AI workloads from the ground up.

## The Streaming Multiprocessor (SM)

The Streaming Multiprocessor (SM) is the core building block of the GPU. Volta has a redesigned SM.

A key improvement is that different types of operations can run at the same time. In Pascal, integer and floating point operations shared one execution path and had to take turns. In Volta, they run in parallel.

Modern workloads often mix different types of operations. So this change makes better use of the hardware.

<volta-shift></volta-shift>

## Instruction Speed

A new architecture does not only add cores. It also makes existing operations faster.

In Volta, many instructions finish in fewer cycles than in Pascal. Ampere and Hopper improve this further. This pattern continues into 2026. Progress is about efficiency, not only scale.

## Memory

Volta uses HBM2 memory. It has higher memory bandwidth than earlier generations.

Modern GPU workloads are often limited by how fast data moves, not only by how fast it is processed. Higher bandwidth feeds more data to the compute units without waiting.

## NVLink

Volta introduces the second generation of NVLink. NVLink connects GPUs to each other at high speed.

Volta increases both the number of links and their speed. This makes multi-GPU systems much more efficient.

In 2026, large AI systems based on Hopper and Blackwell depend on this idea even more. Volta was one of the first steps in that direction.

## Transistor Count

The transistor count shows how much hardware is inside a GPU. The V100 has around 21 billion transistors.

Hopper reaches around 80 billion transistors. Blackwell goes further with more complex designs.

This growth is not only about size. It reflects new units, new memory systems and more advanced execution models.

## The Same Structure Every Time

White papers for different architectures use a similar structure:

1. New features
2. SM design
3. Performance comparisons
4. Technical specifications

Once you can read one white paper, the others become much easier.

## Volta's Role

Looking back from 2026, Volta is more than a strong GPU of its time. It is the point where GPUs became AI-focused. Ampere, Hopper and now Blackwell all build on this idea and push it further.

Reading the V100 white paper helps you understand why GPUs look the way they do today.

An example: https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf
