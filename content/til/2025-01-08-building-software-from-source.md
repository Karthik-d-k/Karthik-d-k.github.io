+++
title = "Building Software from Source"
date = 2025-01-08
[taxonomies]
  tags = ["build"]
+++

I would like to write down notes on how to build software from scratch based on **Andrew Kelley's** explanation [here 🡵](https://youtu.be/CwXixVcliP0?si=k16EXojdGuUsG1XM). This is a perfect video that I found to learn this stuff and I know I/Someone else will refer to this often and find it useful.

## Ways to Obtain Software

#### Downloading Upstream Binary Distributions

Binaries will be available directly, which we can download and run without building software from scratch. These are built by the project maintainers for all major distributions.

**Example:** On GitHub, this will mostly be available under the **Releases** page of the repo.

#### Downloading from System Package Managers

Binaries can be downloaded by particular system package managers. These will be built by package maintainers and not necessarily by the project maintainers.

**Example:**

- **choco, scoop, winget** for Windows
- **apt-get, apt** for Linux Debian
- **brew** for macOS

#### Building Directly from Source

Creating binaries from source is the best way to do it if we want to change the source code and behavior of some specifics and also if we want to configure differently than what upstream/system packages do.

Most of the core software is built in **C/C++**. Typically, there will be 3 phases to install such software: `configure`, `build`, and `install`.

- Configure:
    - During this phase, we can configure different kinds of things, including but not limited to enabling/disabling features.
    - The most important configuration is to choose a non-root folder as the prefix to install the software. This is important because we don't want to mess up the system files. And we can install software without using *sudo*. 

- Build:
    - This is the phase where the software is actually built.
    - *make* is used to achieve this. But make has terrible defaults. So, we need to pass some flags to make it work as we want.
        - Example: Enable parallel build using the `-j <N>` flag. Make sure to pass in the number of cores to use, or else it will keep on forking new processes, and there is a high chance that the system will hang.

- Install:
    - **make install** is used to achieve this. This will install the software in the prefix location, which is `$prefix/bin`.
    - We can avoid using **sudo make install** because we would have configured the software to install in a non-root folder.
 

## Best Practices

- Do not use the **dev** branch where stuff could break; instead, use the **latest bugfix release** tagged branch to build software from source.
- Do not use a different compiler toolchain; always try to stick to your system toolchain.
- Try installing software without actually using *docker* or a *virtual machine*, because it's easier that way.
- Do not ssh into a different machine to copy files haphazardly.
- Do not use weird configure options to build the software.
- Do not edit the source haphazardly to make it work most of the time.


## References

- [How to Build Software From Source - Andrew Kelley](https://youtu.be/CwXixVcliP0?si=k16EXojdGuUsG1XM)
