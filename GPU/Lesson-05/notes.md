# Architectures and Chips

This lesson explains how an architecture relates to the real chips inside GPUs. An architecture is not one chip. It is a family of chips that share the same base design.

## One Architecture, Many Chips

Take the Ada Lovelace architecture. It includes different chips such as:

- AD102  
- AD103  
- AD104  

The prefix "AD" links all of them to the same architecture. You know they belong together before you read any specs.

## Same Design, Different Scale

Chips from the same architecture are used in different ways. Some are for high-end GPUs. Others are for mid-range or smaller systems.

For example, AD102 usually goes into top-tier GPUs. AD104 is more likely used in smaller, more efficient cards. So Nvidia scales one design to different sizes and capabilities.

## Different Architectures, Different Work

Not all architectures are built for the same type of work. Compare Ada Lovelace and Hopper:

- Ada is mostly for consumer GPUs, such as gaming, desktops and creative work.  
- Hopper is for data centers, AI training and large-scale computation.  

So the difference is about purpose, not only performance. Some architectures target graphics and interactive work. Others target massive parallel computation. This is why you do not see Hopper-based GPUs in normal PCs.

## A Visual Clue

> [!NOTE]
> The look of a card is a helpful clue, not a strict rule.

Data center GPUs often look very plain, with no visible fans. They live inside servers, where cooling comes from airflow, racks and the whole system.

Consumer GPUs have large cooling systems and several fans. They run inside a normal PC case, so they must handle their own heat.

## One Chip Can Behave Differently

One chip does not mean one purpose. The same chip can appear in different forms. A manufacturer can:

- disable some cores  
- change power limits  
- tune clock speeds  

So two GPUs with the same chip may not behave the same.

## Board Partners

Nvidia does not build every final GPU itself. Companies like ASUS, MSI or Gigabyte take the same chip and build their own versions. They change things like:

- cooling design  
- power configuration  
- boost behavior  

Same base chip, slightly different result.

<arch-family></arch-family>

## The Full Picture

An architecture is a base design. It contains several chips, scaled for different uses. Manufacturers then add their own variations. So a GPU is made of:

- an architecture  
- a specific chip  
- a vendor-specific implementation  

## Why This Matters

This makes GPU names easier to read. It helps you see why two GPUs behave differently and where a GPU fits. Without it, it is easy to misunderstand performance and hardware behavior when you go deeper into CUDA.
