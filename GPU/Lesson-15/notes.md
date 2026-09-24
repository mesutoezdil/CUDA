# Installing CUDA Toolkit on Linux

This lesson shows how to install the CUDA Toolkit on Linux in WSL. After this, your system can compile and run code on the GPU.

## Match your platform

A CUDA install must match your platform exactly. On WSL, use the WSL-specific repository. Standard Ubuntu repositories will fail or install old versions that do not support modern GPU architectures.

## Check the GPU first

Before you install CUDA, make sure your system can see the GPU:

```bash
nvidia-smi
```

- `nvidia-smi` is NVIDIA's command line tool that asks the driver about the GPU. It prints the GPU name, the driver version and the memory use.
- In WSL it works because the driver lives on the Windows side and WSL uses it.

If this command fails, stop and fix your GPU setup first. CUDA will not work without it, because the toolkit talks to the GPU through the driver.

## Install from the NVIDIA repository

Use the official NVIDIA repository for WSL. It has the current toolkit, built to work with the shared driver.

> [!WARNING]
> Do not use `apt install nvidia-cuda-toolkit`. That package is old and not good for modern development.

Run these commands. They first tell the package manager about NVIDIA's repository, then install the toolkit from it.

```bash
wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update
sudo apt-get -y install cuda-toolkit-13-2
```

- `wget` downloads a file from a URL. The `wsl-ubuntu/x86_64` part of the address picks the repository for WSL on a 64-bit Intel or AMD CPU.
- `cuda-keyring_1.1-1_all.deb` is a small package. It holds NVIDIA's signing key and the address of the repository, so your system trusts NVIDIA's packages.
- `sudo` runs a command with admin rights. Installing packages changes the system, so it needs them.
- `dpkg -i` installs a local `.deb` file, here the keyring.
- `apt-get update` refreshes the package lists. Without it, apt does not know about the packages in the new repository.
- `apt-get -y install` installs a package. `-y` answers "yes" to the confirmation question.
- `cuda-toolkit-13-2` is the toolkit package for CUDA 13.2. It holds only the toolkit, which is why no driver is installed.

This installs CUDA Toolkit 13.2, which fits modern GPU architectures. It includes:

* CUDA compiler (nvcc)
* CUDA runtime
* core libraries

It does not install a GPU driver. In WSL the driver comes from the Windows side.

## Verify the install

Check that the compiler is installed and that your shell can find it:

```bash
nvcc --version
```

- `nvcc` is the CUDA compiler.
- `--version` makes it print its version and exit, without compiling anything.

The output should show CUDA 13.x, because you installed 13.2.

If the command is not found, your PATH is not set correctly. PATH is the list of folders where the shell looks for programs. Add the CUDA folder to it:

```bash
export PATH=/usr/local/cuda/bin:$PATH
```

- `export` sets a variable for this shell and for the programs it starts.
- `/usr/local/cuda/bin` is the folder that holds `nvcc`.
- `:$PATH` adds the old list after the new folder, so nothing is lost. The shell searches the CUDA folder first.

> [!TIP]
> The setting lasts only for the current terminal. To keep it, add it to your `.bashrc` or `.zshrc`.

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

## Glossary

- `nvidia-smi`: NVIDIA's command line tool that asks the driver for the GPU name, driver version and memory use.
- NVIDIA repository: NVIDIA's official package source for WSL, with the current toolkit built for the shared driver.
- `cuda-keyring_1.1-1_all.deb`: a small package with NVIDIA's signing key and repository address, so your system trusts NVIDIA's packages.
- `sudo`: runs a command with admin rights. Installing packages needs them.
- `apt-get update`: refreshes the package lists so apt knows about the packages in the new repository.
- `nvcc`: the CUDA compiler. `nvcc --version` prints its version without compiling anything.
- PATH: the list of folders where the shell looks for programs.
- `export`: sets a variable for this shell and for the programs it starts.
