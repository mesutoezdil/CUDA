# Reading GPU Specs

This lesson shows how to find the generation and architecture of a GPU. It uses the RTX 3090 and the A100 as examples.

## Finding GPU Specs

The easiest way is a Google search. For example:

"A100 GPU TechPowerUp"

TechPowerUp is a website that collects detailed GPU specs from many manufacturers. It is one of the easiest places to check GPU details. You can search other GPUs the same way:

"RTX 3090 TechPowerUp"

Open the page to see all the specs.

## A Simple Comparison

Compare two GPUs:

- RTX 3090  
- A100  

First, look at the chip name. For example, A100 → GA100. Chip design comes later. For now, just read the name.

Next, look at the number of cores:

- A100 → around 7,000 cores  
- RTX 3090 → more than 10,000 cores  

This does not mean the RTX 3090 is always stronger.

## Core Counts

A number like "6192 cores" usually counts only single-precision cores. These cores handle standard floating-point math. The number does not include all cores in the GPU.

Modern GPUs have other types of cores too, for example:

- cores for integer operations  
- cores for double-precision operations  
- special cores for AI (tensor cores)

So do not judge a GPU by this number alone.

## Generation and Architecture

### RTX 3090

- Generation → GeForce  
- Architecture → Ampere  

GeForce GPUs are built for everyday users in:

- desktops  
- laptops  
- workstations  

Main use cases:

- gaming  
- content creation  
- general GPU tasks  

### A100

- Generation → (historically Tesla, now Data Center GPUs)  
- Architecture → Ampere  

These GPUs are built for:

- servers  
- data centers  
- supercomputers  

## Key Point

- RTX 3090 and A100 use the SAME architecture (Ampere)  
- but they are built for completely different use cases  

Same architecture ≠ same purpose.

Reminder:
- Architecture → technical design
- Generation → usage category

<gpu-compare></gpu-compare>

## Telling Them Apart by Looks

In many cases, you can tell the difference just by looking at the card.

### Data Center GPUs (A100, V100, P100)

- usually NO built-in fan  
- compact, fanless design

They run in data centers with strong external cooling. The server handles the cooling, not the GPU.

### GeForce GPUs (RTX series)

- have built-in fans  
- designed for standalone systems  

They run in:

- desktop PCs  
- personal workstations  

These systems need their own cooling, so the card needs fans.

## Summary

- Data Center GPUs → no fan  
- GeForce GPUs → built-in fan  

Different environments have different cooling needs. Knowing this helps you:

- read GPU specs  
- choose the right hardware  
- avoid common beginner mistakes  

This becomes more important as you go deeper into CUDA.
