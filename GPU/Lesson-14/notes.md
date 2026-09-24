# Running Linux on Windows (A Practical Setup with WSL)

This lesson explains how to run Linux inside Windows with WSL. It also shows how the GPU and CUDA work inside WSL.

## Why Linux

Serious CUDA work usually leads to Linux. Windows still works, but the GPU ecosystem has been built around Linux for years. Most tools, docs and real deployments expect Linux. In 2026, modern GPU systems for AI and high-performance computing almost always use Linux.

## What WSL is

WSL (Windows Subsystem for Linux) runs a real Linux environment inside Windows. It is not an emulation layer like older solutions. WSL2 runs a real Linux kernel. This makes a big difference in behavior, compatibility and performance. Many development workflows now use WSL.

## Install WSL

Open a terminal on Windows and run one command: `wsl --install`

As of 2026, always use WSL2. WSL1 has lower compatibility and no useful GPU acceleration. WSL2 is built for modern workloads and is the base for CUDA on Windows. Without WSL2, many GPU features will not work as expected.

## First start

When you start your Linux distribution the first time, you create a username and password. This is a separate Linux environment on the same machine, not your Windows environment. It has its own users, its own file system and its own package manager. From now on, you work in two systems at once.

## GPU access

With WSL2, Linux can use the GPU through the Windows driver. CUDA apps run inside WSL almost like on a native Linux system. So you can develop in Linux and still use Windows as your main system.

The GPU driver is installed on the Windows side, not inside WSL. WSL uses the driver of the host system. It does not need its own NVIDIA driver. Installing a Linux GPU driver inside WSL usually causes conflicts, so do not do it. Keep this separation in mind for a stable setup.

<wsl-layers></wsl-layers>

## Installing CUDA in WSL

Inside WSL, you install the Linux version of the CUDA Toolkit, not the Windows one. But WSL uses special packages. They work with the shared driver and avoid conflicts with the host. So the install looks like normal Linux, but it is not the same.

## WSL in 2026

WSL is now a serious development environment, not just a convenience tool. CUDA 12.x and the new 13.x series fully support Hopper and Blackwell inside WSL. GPU access is stable, memory handling is better and container support is more consistent. In many cases, WSL is now close to a native Linux setup.

Still, keep your expectations realistic. WSL has several layers. A problem can come from Windows config, WSL itself, the Linux distribution or the CUDA setup. Fixing these problems is part of learning how the system works.

## Summary

WSL is a practical bridge. You stay in Windows and use Linux-based GPU tools in a way close to real production systems. It is one of the most natural ways to start.

This was just for general info. The name “windows” will not be used in this repo under any circumstances.
