+++
title = "Hubris OS on RP Pico 2(W) board (Cortex-M33 ARM core)"
date = 2025-09-09
draft = true
[taxonomies]
  tags = ["rp235x", "rust", "hubris", "os", "arm"]
+++

## Motivation

As explained in my [rp235x-blinky blog post](https://karthik-d-k.github.io/blog/rp235x-blinky/), I have been experimenting with `Hubris` OS to port it to a `RISC-V` chip.
I have access to a `Pico 2W` board for development and testing. This board is especially exciting because it comes with dual Cortex-M33 cores and dual RISC-V Hazard3 cores. 
My approach was to start with the Cortex-M33 side first, since Hubris already has solid ARM support.

In this blog, I will explain how I got Hubris running on the ARM core **Cortex-M33** of the Pico 2W board. I will also share my experience and challenges faced during the process.

## Technical Details

### Setting up tools

Before I begin to explain how I got Hubris working on the Pico 2W board, I will explain the tools that I used for development. This part is where I spent most of my time 
installing the correct tools to work with Hubris. My development machine is **Windows**, so the details below are specific to Windows OS, but should be easier for Linux as well.
I will list everything that we need to work with both ARM and RISC-V cores.

1. `rustup`

- As we will be working with the **Rust** language, we need to install the **rustup** toolchain manager. You can follow the instructions from [here](https://www.rust-lang.org/tools/install).

2. `Picotool and OpenOCD`

- Both of them can be installed from [pico-sdk-tools/releases](https://github.com/raspberrypi/pico-sdk-tools/releases).

- For *OpenOCD*, we have to set the following environment variable:

  **OPENOCD_SCRIPTS**: C:\Users\<USER>\wws\tools\openocd\0.12.0+dev\scripts

3. `RISC-V TOOLCHAIN`

- Install [pico-sdk-tools/V14](https://github.com/raspberrypi/pico-sdk-tools/releases/download/v2.0.0-5/riscv-toolchain-14-x64-win.zip)

    This is the version used by Pico SDK in VS Code as of this writing.

- Do not install [pico-sdk-tools/V15](https://github.com/raspberrypi/pico-sdk-tools/releases/download/v2.1.1-3/riscv-toolchain-15-x64-win.zip), as this didn't work for me.

    **Error**: Python initialization failed: failed to get the Python codec of the filesystem encoding

4. `ARM TOOLCHAIN`

- Install **arm-gnu-toolchain-14.2.rel1-mingw-w64-x86_64-arm-none-eabi.zip** and add it to the **PATH** environment variable
- Windows (mingw-w64-x86_64) hosted cross toolchains
- AArch32 bare-metal target (arm-none-eabi)
- [official ARM binaries](https://developer.arm.com/downloads/-/arm-gnu-toolchain-downloads)

5. `probe-rs`

- Follow the installation instructions from the official [probe-rs](https://probe.rs/docs/getting-started/installation/) installation page.

6. `humility`

- You'll need to install the version from [humility/tree/bmatt/update-probe-rs](https://github.com/thenewwazoo/humility/tree/bmatt/update-probe-rs), 
which includes an updated `probe-rs` version that supports our Pico 2W board.

> For all the above tools that I have mentioned, you could technically install the latest and greatest tool versions, probably without any issues.

7. `hubake`

- We have to install hubake from my forked repo wherein i fixed some of windows specific issues. Follow below steps:

    ```sh
    $ git clone https://github.com/Karthik-d-k/exhubris-riscv-hazard3

    $ cd exhubris-riscv-hazard3

    $ git checkout windows

    $ cargo install --path .\tools\hubake\
    ```

### Hubris vs ExHubris

Now, coming to the actual Hubris kernel, we have 2 repositories to choose from to work on and experiment with. Below is a short comparison between both.

| Feature | Hubris | ExHubris |
|---------|---------|----------|
| **Origin** | Developed by Oxide Computer Company | Community fork/adaptation of<br> Hubris by Cliff Biffle |
| **Philosophy** | Designed for deeply-embedded systems<br>with Oxide as the primary goal | Making Hubris accessible to<br> external applications outside the main Hubris repo |
| **Target** | 32-bit microcontrollers | Architecture-neutral design<br>(32-bit focus, 64-bit aspirational) |
| **Language** | Rust with nightly toolchain<br>requirement | Rust with stable toolchain<br>requirement |
| **Current Status** | Mature for ARM Cortex-M,<br>experimental RISC-V support | "Hacked-up sprint code"<br> experimental and in flux |

> I chose **ExHubris** because it's simple, has less lines of code to study, is easy to understand with the new build system, and there are blog posts by Cliff Biffle that 
explain the design decisions and architecture in complete detail.

### ExHubris

If you want more info about the design decisions, you could refer to the [ExHubris README](https://github.com/cbiffle/exhubris) file along 
with the [Hubris blogs](https://cliffle.com/tags/hubris/).

### app.kdl

I have followed the [exhubris-demo](https://github.com/cbiffle/exhubris-demo/) repository to set up the demo.

You can find my repository here: [exhubris-demo-rp235x](https://github.com/Karthik-d-k/exhubris-demo-rp235x) to follow along.

The first thing we have to do is write the **app.kdl** file explaining where to get all our tasks and kernel to form our application.
The most important thing here is that we will need a kernel for sure, along with at least 2 tasks: supervisor and idle tasks.

- **Supervisor task**: This is needed for managing the overall system and ensuring that all tasks are running smoothly by restarting faulted tasks. This task depends on the application we are targeting.

- **Idle task**: This is needed for handling the case when no other tasks are ready to run, so that we can just infinitely loop and 
be in low power processor mode until any of the other tasks are ready to run.

I'm pulling in the above tasks and the kernel from my **ExHubris** repo as follows:

```sh
// Instructions for building the kernel.
kernel {
    git-crate {
        repo "https://github.com/Karthik-d-k/exhubris-riscv-hazard3"
        package kernel-generic-cortex-m33
        rev "54b87438a6c1658a13355add40248c21c9c19990"
    }
    no-default-features
    // The kernel itself should provide this information eventually, but for now
    // we have to state it:
    stack-size 1024
    uses-peripheral resets
}

// Supervisor task. Every nontrivial application needs one. The exhubris
// minisuper implementation is good for most simple systems.
task super {
    git-crate {
        repo "https://github.com/Karthik-d-k/exhubris-riscv-hazard3"
        package minisuper
        rev "54b87438a6c1658a13355add40248c21c9c19990"
    }
    priority 0

    // Eventually, tasks should be able to indicate their stack requirement
    // somehow, but for now we have to state it:
    stack-size 192
}

// Idle task. Every application needs one, few applications want to write their
// own. We pull in a standard one from git:
task idle {
    git-crate {
        repo "https://github.com/Karthik-d-k/exhubris-riscv-hazard3"
        package idle
        rev "54b87438a6c1658a13355add40248c21c9c19990"
    }
    stack-size 128
    priority 2
    // This makes Humility work a _lot_ better.
    features insomniac
}
```

- Here, I'm actually pointing to my forked repo because I have made some changes to make the build/tool system work on Windows OS.

- You can find the details about the same in my PR submitted to the ExHubris repo: [[windows] fix build tool issues #6](https://github.com/cbiffle/exhubris/pull/6)

Now coming to my new **blinky** task which I have written specifically to blink an external LED connected to GPIO22 
instead of blinking the onboard LED, which is hard to toggle specifically on the Pico 2W board because it is connected to the wireless chip instead of normal GPIO pins. 
This is not the case for the Pico 2 board which doesn't have a wireless chip in it.

**Blinky task definition**

```sh
// blinky task. Blinks an external led
task blinky {
    workspace-crate blinky
    stack-size 128
    priority 1
    uses-peripheral sio
    uses-peripheral io_bank0
    uses-peripheral pads_bank0
}
```

#### chip.kdl

In **chip.kdl**, we have to define memory properties such as RAM and flash sizes and also define certain memory regions like **io**, **sio** 
and **pads** regions which we would use for our tasks to explicitly specify that we are allowed to access these memory regions from our task.

```sh
memory {
    region "vectors" {
        base 0x1000_0000 // XIP_BASE
        size 0x180 // enlarged to accommodate header + IMAGE_DEF
        read
    }
    region "flash" {
        base 0x1000_0180 // SRAM_BASE
        size 0x003F_FE80 // 4MB (0x0040_0000) (FLASH) - 0x180 (vectors) = 0x3FFE80
        read
        execute
    }
    region "ram" {
        base 0x2000_0000
        size 0x0008_2000 // Logically, there is a single 520KB contiguous memory
        read
        write
    }
}

peripheral "sio" {
    base 0xd000_0000
    size 0x200        // Rounded from 0x1E8 (488 bytes)
}

peripheral "io_bank0" {
    base 0x4002_8000
    size 0x400       // Rounded from 0x320 (800 bytes) 
}

peripheral "pads_bank0" {
    base 0x4003_8000
    size 0x100       // Rounded from 0xCC (204 bytes) 
}

peripheral "resets" {
    base 0x4002_0000
    size 0x20
}
```

> You can see in the app.kdl file that we have used the **resets** peripheral in the kernel and also given access to **io, pads and sio** peripherals for the blinky task.

## Building and Flashing

Now, I will talk about how we could compile and build the firmware and flash it onto the Pico 2W board.

1. Build the application using hubake

    ```sh
    $ hubake build app.kdl

    $ hubake pack-hex .\.work\cortex-m33\final\ output.hex
    ```
2. Flash using either humility or OpenOCD

    - humility
        ```sh
        $ humility -a .\cortex-m33-build.zip flash
        ```
        > You need to run explicitly after flashing via humility, bootram boots into our kernel firmware automatically.

    - OpenOCD
        ```sh
        $ openocd -f openocd.cfg -c "program output.hex verify"

        $ arm-none-eabi-gdb.exe -x gdbconfig.cfg
        ```
        > You have to explicitly run GDB after flashing via OpenOCD, and enter **continue** to start the application.

## Output

After flashing, you will see output like below -->

```sh
$ humility -a .\cortex-m33-build.zip flash
humility: attaching with chip set to "RP235x"
humility: attached via CMSIS-DAP
humility: flash/archive mismatch; reflashing
humility: flashing done

$ humility -a .\cortex-m33-build.zip tasks
humility: attached via CMSIS-DAP
system time = 2491
ID TASK                       GEN PRI STATE
 0 super                        0   0 notif: bit0
 1 blinky                       0   1 RUNNING
 2 idle                         0   2 ready
```

<div style="display: flex; justify-content: center;">
  <video autoplay muted loop playsinline>
    <source src="/Hubris-on-Pico2W.mp4" type="video/mp4">
  </video>
</div>


### Kernel panic

I would like to talk about one instance where I flashed software and the kernel wasn't booting into the application correctly.
Error details are as follows:

❯ **humility -a .\cortex-m33-build.zip registers -s**

```bash
humility: attached via CMSIS-DAP
   R0 = 0x20000358 <- kernel: KERNEL_HAS_FAILED+0x0
   R1 = 0x00000001
   R2 = 0x10000220 <- idle: 0x10000220+0x0
   R3 = 0x200002a0 <- idle: 0x200002a0+0x0
   R4 = 0x00000160
   R5 = 0x200004c0 <- kernel: HUBRIS_TASK_TABLE_SPACE+0x160
   R6 = 0x10002950 <- kernel: HUBRIS_TASK_DESCS+0x58
   R7 = 0x200001c8 <- kernel: 0x20000000+0x1c8
   R8 = 0x200004c0 <- kernel: HUBRIS_TASK_TABLE_SPACE+0x160
   R9 = 0x00000210
  R10 = 0x200002c0 <- super: 0x200002c0+0x0
  R11 = 0x20000258 <- blinky: 0x20000220+0x38
  R12 = 0x00000064
   SP = 0x200001c8 <- kernel: 0x20000000+0x1c8
        |
        +--->  0x200001c8 0x100004f8 cortex_m::asm::inline::__nop
               0x200001c8 0x100004f8 cortex_m::asm::nop
               0x200001c8 0x100004f8 rust_begin_unwind
               0x200001c8 0x100004f8 core::panicking::panic_fmt
               0x200001c8 0x10000504 core::slice::<impl [T]>::copy_from_slice::len_mismatch_fail

   LR = 0x10000505 <- kernel: len_mismatch_fail+0x1
   PC = 0x100004f8 <- kernel: panic_fmt+0xc
  PSR = 0x09000000 <- 0000_1001_0000_0000_0000_0000_0000_0000
                      |||| | ||         |       |           |
                      |||| | ||         |       |           + Exception = 0x0
                      |||| | ||         |       +------------ IC/IT = 0x0
                      |||| | ||         +-------------------- GE = 0x0
                      |||| | |+------------------------------ T = 1
                      |||| | +------------------------------- IC/IT = 0x0
                      |||| +--------------------------------- Q = 1
                      |||+----------------------------------- V = 0
                      ||+------------------------------------ C = 0
                      |+------------------------------------- Z = 0
                      +-------------------------------------- N = 0

  MSP = 0x200001c8 <- kernel: 0x20000000+0x1c8
  PSP = 0x00000000
  SPR = 0x00000000 <- 0000_0000_0000_0000_0000_0000_0000_0000
                            |||         |         |         |
                            |||         |         |         + PRIMASK = 0
                            |||         |         +---------- BASEPRI = 0x0
                            |||         +-------------------- FAULTMASK = 0
                            ||+------------------------------ CONTROL.nPRIV = 0
                            |+------------------------------- CONTROL.SPSEL = 0
                            +-------------------------------- CONTROL.FPCA = 0

FPSCR = 0x00000000
```

Looking closely, we can see the error is from this code line:
```rs
core::slice::<impl [T]>::copy_from_slice::len_mismatch_fail
```

The flashed software which encountered this error had 544 bytes of stack size for the kernel.
With many back-and-forth changes and talking to ChatGPT and Claude, I figured out that the issue was because of a `stack overflow`.

After changing the stack size for the kernel to 1024 bytes, there was no panic from the kernel.
I don't clearly understand yet how to identify this stack overflow corruption by looking at the above log, but according to the documentation,
we may no longer need to worry about stack size for the kernel because it will be somehow deduced during compile time.
I heard this is a feature that will be implemented in future versions of the Hubris kernel.

## Notes

- If you'd like to see the Hubris variant of the same app (also working), I've published it here: [hubris-riscv-hazard3/tree/cortex-m33](https://github.com/Karthik-d-k/hubris-riscv-hazard3/tree/cortex-m33). This is based on @thenewwazoo's excellent work in [hubris/tree/bmatt/rp2350](https://github.com/thenewwazoo/hubris/tree/bmatt/rp2350), with my blinky task added alongside his idle and jefe tasks.

- As mentioned, my **final goal** is to get this same demo running on the **Hazard3 RISC-V core**. I've been experimenting with both the Hubris and ExHubris repos for this porting effort—each has its pros and cons—but since I now have a working demo on both, I'm leaning towards **ExHubris** because of its simpler build system.

- For those curious, my current (non-working, hacky) RISC-V attempts are here:
    * [hubris-riscv-hazard3/tree/riscv](https://github.com/Karthik-d-k/hubris-riscv-hazard3/tree/riscv)
    * [exhubris-riscv-hazard3/tree/riscv](https://github.com/Karthik-d-k/exhubris-riscv-hazard3/tree/riscv)

## References

- [RP2350 Datasheet](https://datasheets.raspberrypi.org/rp2350/rp2350-datasheet.pdf)
- [Cliffle's Hubris Blog posts](https://cliffle.com/tags/hubris/)
- [Hubris Reference](https://hubris.oxide.computer/reference/)
- [exhubris-demo-rp235x](https://github.com/Karthik-d-k/exhubris-demo-rp235x)
- [Hubris-fork](https://github.com/Karthik-d-k/hubris-riscv-hazard3/tree/riscv)
- [exhubris-fork](https://github.com/Karthik-d-k/exhubris-riscv-hazard3/tree/riscv)
