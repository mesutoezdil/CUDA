# Installing CUDA Toolkit on Linux

This lesson shows how to install the CUDA Toolkit on Linux in WSL. After this, your system can compile and run code on the GPU.

## Match your platform

A CUDA install must match your platform exactly. On WSL, use the WSL-specific repository. Standard Ubuntu repositories will fail or install old versions that do not support modern GPU architectures.

## Check the GPU first

Before you install CUDA, make sure your system can see the GPU:

```bash
nvidia-smi
```

If this command fails, stop and fix your GPU setup first. CUDA will not work without it.

## Install from the NVIDIA repository

Use the official NVIDIA repository for WSL. Do not use `apt install nvidia-cuda-toolkit`. That package is old and not good for modern development.

Run these commands:

```bash
wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update
sudo apt-get -y install cuda-toolkit-13-2
```

This installs CUDA Toolkit 13.2, which fits modern GPU architectures. It includes:

* CUDA compiler (nvcc)
* CUDA runtime
* core libraries

It does not install a GPU driver.

## Verify the install

Check that CUDA works:

```bash
nvcc --version
```

The output should show CUDA 13.x.

If the command is not found, your PATH is not set correctly. PATH is the list of folders where the shell looks for programs.

```bash
export PATH=/usr/local/cuda/bin:$PATH
```

To keep this setting, add it to your `.bashrc` or `.zshrc`.

## Why the version matters

CUDA is closely tied to GPU architecture. Hopper and Blackwell bring new features:

* FP8 execution paths
* FP4 support (Blackwell)
* improved scheduling and memory behavior

If your CUDA version does not support them, your code still runs but does not use the hardware well.

## CUDA under other tools

CUDA is rarely used alone. It runs under systems such as:

* PyTorch
* TensorFlow
* Triton
* custom CUDA kernels

A correct CUDA install makes all of them work properly.

<install-steps></install-steps>

## Ready

Your system is now ready. You have:

* a Linux environment (WSL)
* GPU access
* CUDA Toolkit 13.2
* a working CUDA compiler

Now you can write and run real CUDA programs.

https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&Distribution=WSL-Ubuntu&target_version=2.0&target_type=deb_network
