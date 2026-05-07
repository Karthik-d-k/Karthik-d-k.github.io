+++
title = "RISC-V Toolchain"
date = 2026-05-07
[taxonomies]
  tags = ["riscv", "windows", "wsl"]
+++


## Motivation

The reason for writing this post is to capture my understanding of how embedded toolchains work.
I primarily work on embedded RISC-V cores, so I will explain how to get the correct `RISC-V toolchain` on both Windows and WSL,
because these are my primary development environments.

### Toolchain

A toolchain basically contains all the required tools and libraries to compile, link, and manipulate object files and binaries.
It is the basic first step when starting to work with embedded systems, or with native development in general.

## Installation

Here, I will list a few possible sources you can use to get or download the correct toolchain for your needs.

### riscv-gnu-toolchain

##### Windows

Compiling the whole toolchain from source is not well documented on Windows because it requires many dependencies, including GNU/LLVM tools, which are not straightforward to set up unless you already have MinGW/MSYS2 installed on your system.
Even the official **riscv-gnu-toolchain** [README.md](https://github.com/riscv-collab/riscv-gnu-toolchain/blob/master/README.md) does not explain how to build or obtain a native Windows toolchain.
In theory, you could cross-compile a Windows toolchain from another environment such as WSL, but I would recommend using one of the other sources mentioned below.

##### WSL

- Just follow the [README.md](https://github.com/riscv-collab/riscv-gnu-toolchain/blob/master/README.md) page which explains how to compile and install. 
- You can also get precompiled versions from their [GitHub Releases](https://github.com/riscv-collab/riscv-gnu-toolchain/releases) page.
- Download the correct archive for your machine:
    - RISC-V 32-bit: [riscv32-elf-ubuntu-22.04-gcc.tar.xz](https://github.com/riscv-collab/riscv-gnu-toolchain/releases/download/2026.05.06/riscv32-elf-ubuntu-22.04-gcc.tar.xz)
    - RISC-V 64-bit: [riscv64-elf-ubuntu-22.04-gcc.tar.xz](https://github.com/riscv-collab/riscv-gnu-toolchain/releases/download/2026.05.06/riscv64-elf-ubuntu-22.04-gcc.tar.xz)


### xPack

**xPack Binary Development Tools** is a cross-platform binary tools for software development, intended for reproducible builds, with an emphasis on C/C++ and embedded projects.

xPack supports many packages, but here we are interested in embedded RISC-V, so we will focus on [riscv-none-elf-gcc-xpack](https://github.com/xpack-dev-tools/riscv-none-elf-gcc-xpack), which is a binary distribution of the GNU RISC-V Embedded GCC toolchain.
Documentation is available [here](https://xpack-dev-tools.github.io/riscv-none-elf-gcc-xpack/).
 
There are two ways to install these xPack toolchains:

1. [xpm](https://xpack.github.io/xpm/)

- A tool to automate builds, tests, and manage C/C++ dependencies, inspired by npm. For example:
    ```sh
    $ xpm install @xpack-dev-tools/riscv-none-elf-gcc@14.2.0-3 --verbose
    ```

2. [GitHub Releases](https://github.com/xpack-dev-tools/riscv-none-elf-gcc-xpack/releases)

- Download the correct archive for your machine. For example:
    - Windows: [xpack-riscv-none-elf-gcc-14.2.0-3-win32-x64.zip](https://github.com/xpack-dev-tools/riscv-none-elf-gcc-xpack/releases/download/v14.2.0-3/xpack-riscv-none-elf-gcc-14.2.0-3-win32-x64.zip)
    - Linux (WSL): [xpack-riscv-none-elf-gcc-14.2.0-3-linux-x64.tar.gz](https://github.com/xpack-dev-tools/riscv-none-elf-gcc-xpack/releases/download/v14.2.0-3/xpack-riscv-none-elf-gcc-14.2.0-3-linux-x64.tar.gz)

### Embecosm

[Embecosm](https://embecosm.com/) provides free GNU and Clang/LLVM compiler tool chain packages for the convenience of the open source software community.

There are a few different packages listed on their [tool-chain-downloads](https://embecosm.com/downloads/tool-chain-downloads/) page.
For this use case, we want the embedded RISC-V toolchains, which means choosing either **RISC-V Embedded stable release compilers** or **RISC-V Embedded top-of-tree compilers**.
I generally use the stable releases (GCC/LLVM), but you are free to choose based on your development needs.

- Download the correct archive for your machine:
    - Windows: [riscv32-embecosm-win64-gcc13.2.0.zip](https://buildbot.embecosm.com/job/riscv32-gcc-win64-release/24/artifact/riscv32-embecosm-win64-gcc13.2.0.zip)
    - Linux (WSL): [riscv32-embecosm-ubuntu2204-gcc13.2.0.tar.gz](https://buildbot.embecosm.com/job/riscv32-gcc-ubuntu2204-release/10/artifact/riscv32-embecosm-ubuntu2204-gcc13.2.0.tar.gz)

## Multilib Support

- You may have noticed by now that I have listed two separate prebuilt versions of `riscv-gnu-toolchain`: one for 32-bit and one for 64-bit.
These precompiled versions do not support multilib, meaning each version only compiles for one ISA width. However, when building from source, we can enable multilib support using the `--enable-multilib` option.

- `xPack` and `Embecosm` support multilib, meaning you get a single binary that can be used to compile for both 32-bit and 64-bit ISAs.

- You could check which all variants a particular compiler supports by passing `--print-multi-lib` to `gcc`:

    ```sh
    $ riscv32-elf-ubuntu-22.04-gcc --print-multi-lib
    .;
    ```

    ```sh
    $ riscv64-elf-ubuntu-22.04-gcc --print-multi-lib
    .;
    ```

    ```sh
    $ riscv32-embecosm-win64-gcc13.2.0.exe --print-multi-lib
    .;
    rv32e/ilp32e;@march=rv32e@mabi=ilp32e
    rv32ea/ilp32e;@march=rv32ea@mabi=ilp32e
    rv32em/ilp32e;@march=rv32em@mabi=ilp32e
    rv32eac/ilp32e;@march=rv32eac@mabi=ilp32e
    rv32emac/ilp32e;@march=rv32emac@mabi=ilp32e
    rv32i/ilp32;@march=rv32i@mabi=ilp32
    rv32ia/ilp32;@march=rv32ia@mabi=ilp32
    rv32im/ilp32;@march=rv32im@mabi=ilp32
    rv32if_zicsr/ilp32f;@march=rv32if_zicsr@mabi=ilp32f
    rv32ifd_zicsr/ilp32d;@march=rv32ifd_zicsr@mabi=ilp32d
    rv32iaf_zicsr/ilp32f;@march=rv32iaf_zicsr@mabi=ilp32f
    rv32iafd_zicsr/ilp32d;@march=rv32iafd_zicsr@mabi=ilp32d
    rv32imf_zicsr/ilp32f;@march=rv32imf_zicsr@mabi=ilp32f
    rv32imfd_zicsr/ilp32d;@march=rv32imfd_zicsr@mabi=ilp32d
    rv32iac/ilp32;@march=rv32iac@mabi=ilp32
    rv32imafc_zicsr/ilp32f;@march=rv32imafc_zicsr@mabi=ilp32f
    rv32imafdc_zicsr/ilp32d;@march=rv32imafdc_zicsr@mabi=ilp32d
    rv64i/lp64;@march=rv64i@mabi=lp64
    rv64ia/lp64;@march=rv64ia@mabi=lp64
    rv64im/lp64;@march=rv64im@mabi=lp64
    rv64if_zicsr/lp64f;@march=rv64if_zicsr@mabi=lp64f
    rv64ifd_zicsr/lp64d;@march=rv64ifd_zicsr@mabi=lp64d
    rv64iaf_zicsr/lp64f;@march=rv64iaf_zicsr@mabi=lp64f
    rv64iafd_zicsr/lp64d;@march=rv64iafd_zicsr@mabi=lp64d
    rv64imf_zicsr/lp64f;@march=rv64imf_zicsr@mabi=lp64f
    rv64iac/lp64;@march=rv64iac@mabi=lp64
    rv64imac/lp64;@march=rv64imac@mabi=lp64
    rv64imafc_zicsr/lp64f;@march=rv64imafc_zicsr@mabi=lp64f
    rv64imafdc_zicsr/lp64d;@march=rv64imafdc_zicsr@mabi=lp64d
    ```

    ```sh
    $ xpack-riscv-none-elf-gcc-14.2.0-3-win32-x64.exe --print-multi-lib
    .;
    rv32e/ilp32e;@march=rv32e@mabi=ilp32e
    rv32ec/ilp32e;@march=rv32ec@mabi=ilp32e
    rv32ea/ilp32e;@march=rv32ea@mabi=ilp32e
    rv32em/ilp32e;@march=rv32em@mabi=ilp32e
    rv32eac/ilp32e;@march=rv32eac@mabi=ilp32e
    rv32emac/ilp32e;@march=rv32emac@mabi=ilp32e
    rv32i/ilp32;@march=rv32i@mabi=ilp32
    rv32ia/ilp32;@march=rv32ia@mabi=ilp32
    rv32im/ilp32;@march=rv32im@mabi=ilp32
    rv32imc/ilp32;@march=rv32imc@mabi=ilp32
    rv32if_zicsr/ilp32f;@march=rv32if_zicsr@mabi=ilp32f
    rv32ifd_zicsr/ilp32d;@march=rv32ifd_zicsr@mabi=ilp32d
    rv32iaf_zicsr/ilp32f;@march=rv32iaf_zicsr@mabi=ilp32f
    rv32iafd_zicsr/ilp32d;@march=rv32iafd_zicsr@mabi=ilp32d
    rv32imf_zicsr/ilp32f;@march=rv32imf_zicsr@mabi=ilp32f
    rv32imfd_zicsr/ilp32d;@march=rv32imfd_zicsr@mabi=ilp32d
    rv32iac/ilp32;@march=rv32iac@mabi=ilp32
    rv32imafc_zicsr/ilp32f;@march=rv32imafc_zicsr@mabi=ilp32f
    rv32imafdc_zicsr/ilp32d;@march=rv32imafdc_zicsr@mabi=ilp32d
    rv64i/lp64;@march=rv64i@mabi=lp64
    rv64ia/lp64;@march=rv64ia@mabi=lp64
    rv64im/lp64;@march=rv64im@mabi=lp64
    rv64if_zicsr/lp64f;@march=rv64if_zicsr@mabi=lp64f
    rv64ifd_zicsr/lp64d;@march=rv64ifd_zicsr@mabi=lp64d
    rv64iaf_zicsr/lp64f;@march=rv64iaf_zicsr@mabi=lp64f
    rv64iafd_zicsr/lp64d;@march=rv64iafd_zicsr@mabi=lp64d
    rv64imf_zicsr/lp64f;@march=rv64imf_zicsr@mabi=lp64f
    rv64iac/lp64;@march=rv64iac@mabi=lp64
    rv64imac/lp64;@march=rv64imac@mabi=lp64
    rv64imafc_zicsr/lp64f;@march=rv64imafc_zicsr@mabi=lp64f
    rv64imafdc_zicsr/lp64d;@march=rv64imafdc_zicsr@mabi=lp64d
    ```

    > The xPack package supports two extra variants compared to Embecosm:
    rv32ec/ilp32e;@march=rv32ec@mabi=ilp32e 
    rv32imc/ilp32;@march=rv32imc@mabi=ilp32


#### Note

Compiling for the correct variant, depending on which RISC-V core you use, can be done by using the `march` and `mabi` compiler flags:

```sh
$ riscv32-unknown-elf-gcc -march=rv32imac -mabi=ilp32 main.c
```

## References

- [riscv-gnu-toolchain](https://github.com/riscv-collab/riscv-gnu-toolchain)
- [xpack-dev-tools](https://xpack-dev-tools.github.io/)
- [embecosm.com](https://embecosm.com/)
