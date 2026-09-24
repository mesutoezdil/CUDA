# Installing CUDA Toolkit on Linux

Once your Linux env is ready, the next step is to install the CUDA Toolkit.

This is the point where your system becomes capable of compiling and running code on the GPU. 

Without CUDA, your code cannot interact with the GPU in a meaningful way.

CUDA installation is not generic.

It must match your platform exactly.

If you are using WSL, you must use the WSL-specific repository. 

Standard Ubuntu repositories will either fail or install outdated versions that do not support modern GPU architectures.

Before installing CUDA, make sure your system can see the GPU:

```
nvidia-smi
````

If this command fails, stop here and fix your GPU setup first. CUDA will not work otherwise.

Use the official NVIDIA repository for WSL.

Do not use `apt install nvidia-cuda-toolkit`. That package is outdated and not suitable for modern development.

Run the following commands:

```
wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update
sudo apt-get -y install cuda-toolkit-13-2
```

This installs CUDA Toolkit 13.2, which is aligned with modern GPU architectures.

This installation includes:

* CUDA compiler (nvcc)
* CUDA runtime
* core libraries

It does not install a GPU driver.

After installation, verify that CUDA is working:

```
nvcc --version
```

You should see output showing CUDA 13.x.

If the command is not found, your PATH is not configured correctly.

```
export PATH=/usr/local/cuda/bin:$PATH
```

To make this permanent, add it to your `.bashrc` or `.zshrc`.

CUDA is tightly coupled with GPU architecture.

Modern GPUs such as Hopper and Blackwell introduce new capabilities:

* FP8 execution paths
* FP4 support (Blackwell)
* improved scheduling and memory behavior

If your CUDA version does not support these features, your code will run but will not utilize the hardware efficiently.

CUDA is rarely used alone.

It operates underneath systems such as:

* PyTorch
* TensorFlow
* Triton
* custom CUDA kernels

A correct CUDA installation ensures that all these systems function properly.

<install-steps></install-steps>

At this point, your system is ready.

You have:

* a Linux environment (WSL)
* GPU access
* CUDA Toolkit 13.2
* a working CUDA compiler

From here on, you can start writing and running real CUDA programs.

https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&Distribution=WSL-Ubuntu&target_version=2.0&target_type=deb_network

