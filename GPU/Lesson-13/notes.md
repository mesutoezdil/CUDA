# Setting Up CUDA Development (A Modern Workflow with JetBrains)

This lesson explains how to set up a CUDA work environment. It uses JetBrains tools, mainly CLion, on top of the CUDA Toolkit.

## Why JetBrains and CLion

You need a setup you can use every day without fighting the tools. This repo builds that setup around CLion.

The reason is how modern development works. GPU architectures and toolkits change faster now. Projects are no longer tied to one platform. You might develop on Linux, test on a remote GPU and deploy somewhere else. A tightly coupled IDE like Visual Studio limits this kind of work.

JetBrains tools are built around CMake. CMake is a tool that describes how to build a project. A CMake project is not tied to one environment. You can build it on different systems with different compilers and keep the same structure. Real GPU systems are built this way.

## The CUDA Toolkit comes first

The CUDA Toolkit is the base of everything. Nothing runs without it. It gives you the compiler, the runtime and the libraries that talk to the GPU. It is not an editor. It is the layer that makes GPU execution possible.

As of 2026, this layer depends more on the hardware. Hopper and Blackwell bring new instructions, new precision formats and new execution behavior. You need a recent CUDA version to use them. Older versions may still work, but they will not use what the hardware can do. So the CUDA version you choose defines what your code can do.

## Where CLion fits

CLion sits on top of the toolkit. It does not replace or hide it. It gives you a clean place to write code and organize your project. When you build, CLion calls CMake, and CMake calls the CUDA compiler. Nothing hidden happens, so you always know what is going on.

<toolchain-stack></toolchain-stack>

## Visual Studio on Windows

> [!NOTE]
> On Windows, you may still need parts of Visual Studio installed, even if you do not use it. The CUDA toolchain uses the Microsoft compiler in the background. So Visual Studio is a dependency, not your workspace. You install it once and then forget it.

All your real work happens in CLion.

## The GPU driver

CUDA depends on the GPU driver. In 2026, architectures change fast, so keeping the driver up to date is part of the setup.

> [!WARNING]
> If the driver is too old, you can get problems that are hard to explain. Code may compile but not run correctly. Some features may not be available.

## The workflow

With everything in place, the workflow is simple:

- You open CLion and write your code.
- You build with CMake.
- The CUDA Toolkit compiles it.
- The GPU runs it.

When the setup is right, these steps work together smoothly.

## Summary

CUDA development is not about choosing an editor. It is about understanding the toolchain. JetBrains tools fit well because they let each part of the system do its own job. This makes the setup cleaner, more stable and closer to production. This repo uses this setup.

## Glossary

- CLion: a JetBrains tool for writing code and organizing projects. It sits on top of the CUDA Toolkit.
- CMake: a tool that describes how to build a project. It is not tied to one environment.
- CUDA Toolkit: the base layer with the compiler, the runtime and the libraries that talk to the GPU.
- toolchain: the chain of tools that builds your code. CLion calls CMake, and CMake calls the CUDA compiler.
- Visual Studio: a Windows dependency, because the CUDA toolchain uses the Microsoft compiler in the background.
- GPU driver: CUDA depends on it. If it is too old, code may compile but not run correctly.
