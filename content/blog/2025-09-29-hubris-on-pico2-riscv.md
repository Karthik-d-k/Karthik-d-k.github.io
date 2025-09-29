+++
title = "Hubris OS on RP Pico 2(W) board (Hazard3 RISC-V core)"
date = 2025-09-29
[taxonomies]
  tags = ["rp235x", "rust", "hubris", "os", "riscv"]
+++

## Overview

If you haven't checked it out already, go through my [hubris-on-pico2 blog post](https://karthik-d-k.github.io/blog/hubris-on-pico2/) where I explained how to get the Hubris OS running on the RP Pico 2W board's Cortex-M33 core. I have also explained the technical details of the tools that I used for development.
In this blog post, I will explain how I got the same Hubris OS running on the RP Pico 2W board's Hazard3 RISC-V core.

If you want to follow along, please refer to the [exhubris-riscv-hazard3](https://github.com/Karthik-d-k/exhubris-riscv-hazard3/tree/72518ad1fe574e27057a5933d1363e59f32f77f5) repo for the working code.

### RISC-V kernel

Building tasks is the same as what I have done on the ARM core, but for the kernel, I have used my RISC-V port present in the [hubris-riscv-hazard3](https://github.com/oxidecomputer/hubris/commit/a55363a57a29d97b94b587c7c2deb4021f50377d) repo.

For technical details about the RISC-V port, please refer to [this discussion](https://github.com/oxidecomputer/hubris/discussions/365). I have made changes based on `jperkin's` implementation and updated/changed code to support the latest Hubris version. I have added some logs on top of it and did a few Pico 2 board specific changes.

## Building and Flashing

Now, I will talk about how we could compile and build the firmware and flash it onto the Pico 2W board.
I'm using [just](https://github.com/casey/just) to simplify the build process. Follow the repo for installing the tool.

1. **Building and flashing the application**
   
   In the first terminal:
    ```sh
    $ just build reboot flash
    ```

    Output:
    ```sh
    hubake build .\app\rp235x-hazard3\app.kdl

    ╭───────────────────┬───────────────────────────────────────────────────────╮
    │ App name          │ hazard3                                               │
    ├───────────────────┼───────────────────────────────────────────────────────┤
    │ Config path       │ .\app\rp235x-hazard3\app.kdl                          │
    ├───────────────────┼───────────────────────────────────────────────────────┤
    │ Workspace root    │ \\?\C:\Users\adt8kor\wws\riscv\exhubris-riscv-hazard3 │
    ├───────────────────┼───────────────────────────────────────────────────────┤
    │ Host platform     │ x86_64-pc-windows-msvc                                │
    ├───────────────────┼───────────────────────────────────────────────────────┤
    │ Default toolchain │ 1.88.0                                                │
    ╰───────────────────┴───────────────────────────────────────────────────────╯

    ╭───────────────────────────╮
    │ building component: super │
    ╰───────────────────────────╯

        Finished `release` profile [optimized + debuginfo] target(s) in 0.60s

    ╭────────────────────────────╮
    │ building component: blinky │
    ╰────────────────────────────╯

        Finished `release` profile [optimized + debuginfo] target(s) in 0.51s

    ╭──────────────────────────╮
    │ building component: idle │
    ╰──────────────────────────╯

        Finished `release` profile [optimized + debuginfo] target(s) in 0.52s

    ╭─────────────────────────────────────────────╮
    │ Task build complete, prelinking for size... │
    ╰─────────────────────────────────────────────╯

    warning: adjusted region ram base up to 0x20000800 from 0x20000000

    ╭────────────────────────────╮
    │ building component: kernel │
    ╰────────────────────────────╯

        Finished `release` profile [optimized + debuginfo] target(s) in 0.62s

    Allocations (2.3811ms):
    MEMORY   OWNER         START         END       SIZE     WASTE
    vectors  kernel   0x10000000  0x10000063  100 bytes   0 bytes
    vectors  (total)                          100 bytes   0 bytes
    flash    idle     0x10000180  0x100001df   96 bytes  12 bytes
    flash    -pad-    0x100001e0  0x100001ff   32 bytes  32 bytes
    flash    super    0x10000200  0x100002ff  256 bytes   0 bytes
    flash    blinky   0x10000300  0x1000037f  128 bytes  12 bytes
    flash    kernel   0x10000380  0x10009d80   38.5 KiB   0 bytes
    flash    (total)                           39.0 KiB  56 bytes
    ram      kernel   0x20000000  0x200007ff   2.00 KiB   0 bytes
    ram      super    0x20000800  0x2000097f  384 bytes   0 bytes
    ram      idle     0x20000980  0x20000a7f  256 bytes   0 bytes
    ram      blinky   0x20000a80  0x20000b7f  256 bytes   0 bytes
    ram      kernel   0x20000b80  0x20000b80     1 byte   0 bytes
    ram      kernel   0x20000ba0  0x20000e7f  736 bytes   0 bytes
    ram      (total)                           3.59 KiB   0 bytes

    ╭─────────────────────────────────────────────────────────────────────────╮
    │ Build complete! Archive:                                                │
    │ \\?\C:\Users\adt8kor\wws\riscv\exhubris-riscv-hazard3\hazard3-build.zip │
    ╰─────────────────────────────────────────────────────────────────────────╯

    hubake pack-hex .\.work\hazard3\final\ output.hex
        START    END (ex)  OWNER
    0x10000000  0x10000064  kernel
    0x10000064  0x10000180  - unused -
    0x10000180  0x100001e0  idle
    0x100001e0  0x10000200  - unused -
    0x10000200  0x10000300  super
    0x10000300  0x10000380  blinky
    0x10000380  0x10009d80  kernel
    0x10009d80  0x20000000  - unused -
    0x20000000  0x20000800  kernel
    0x20000800  0x20000980  super
    0x20000980  0x20000a80  idle
    0x20000a80  0x20000b80  blinky
    0x20000b80  0x20000b81  kernel
    0x20000b81  0x20000ba0  - unused -
    0x20000ba0  0x20000e80  kernel
    picotool reboot -u -c riscv
    openocd -f .\app\rp235x-hazard3\openocd.cfg -c "program output.hex verify reset"
    Open On-Chip Debugger 0.12.0+dev (2025-08-08-14:31)
    Licensed under GNU GPL v2
    For bug reports, read
            http://openocd.org/doc/doxygen/bugs.html
    ocd_process_reset_inner
    ** Programming Started **
    ** Programming Finished **
    ** Verify Started **
    ** Verified OK **
    ** Resetting Target **
    ```

    > This will build the kernel and application using `hubake` and flash using `openocd` and wait for GDB to connect and run the app.

2. **Running using GDB**
   
   In the second terminal:
    ```sh
    $ just entry-point gdb
    ```

    Output:
    ```sh
    KERNEL Entry Point: 0x10000400
    IDLE   Entry Point: 0x10000180
    SUPER  Entry Point: 0x10000300
    BLINKY Entry Point: 0x10000280
    riscv32-unknown-elf-gdb.exe -q -x app/rp235x-hazard3/gdbconfig.cfg
    warning: multi-threaded target stopped without sending a thread-id, using first non-exited thread
    0x00007640 in ?? ()
    add symbol table from file ".work/hazard3/final/idle"
    add symbol table from file ".work/hazard3/final/super"
    add symbol table from file ".work/hazard3/final/blinky"
    semihosting is enabled
    (gdb)
    ```

    > This will load the kernel and application ELF files and wait for us to start the kernel.

3. **Running the kernel**
   
   In GDB, you can start the kernel by setting the `PC` register to the kernel's entry point and running `continue`:
   
   **2nd terminal:**
    ```sh
    (gdb) set $pc=0x10000380
    (gdb) continue
    Continuing.
    ```
    
   **1st terminal:**
    ```sh
    rp2350.rv0 halted due to debug-request.
    rp2350.rv1 halted due to debug-request.
    [KERN]: ###### starting: kernel ######
    [KERN]: ----- apply_memory_protection() for TASK [0] -----
    [KERN]: Region 0: Preparing pmpaddr=0x00000003, pmpcfg=0x18
    [KERN]: Region 0 programmed -> base=0x00000000, size=32
    [KERN]: Region 1: Preparing pmpaddr=0x0400009f, pmpcfg=0x1d
    [KERN]: Region 1 programmed -> base=0x10000200, size=256
    [KERN]: Region 2: Preparing pmpaddr=0x08000207, pmpcfg=0x1e
    [KERN]: Region 2 programmed -> base=0x20000800, size=64
    [KERN]: Region 3: Preparing pmpaddr=0x08000217, pmpcfg=0x1e
    [KERN]: Region 3 programmed -> base=0x20000840, size=64
    [KERN]: Region 4: Preparing pmpaddr=0x08000227, pmpcfg=0x1e
    [KERN]: Region 4 programmed -> base=0x20000880, size=64
    [KERN]: Region 5: Preparing pmpaddr=0x08000237, pmpcfg=0x1e
    [KERN]: Region 5 programmed -> base=0x200008c0, size=64
    [KERN]: Region 6: Preparing pmpaddr=0x08000247, pmpcfg=0x1e
    [KERN]: Region 6 programmed -> base=0x20000900, size=64
    [KERN]: Region 7: Preparing pmpaddr=0x08000257, pmpcfg=0x1e
    [KERN]: Region 7 programmed -> base=0x20000940, size=64
    [KERN]: ----- apply_memory_protection() DONE -----
    [KERN]: ++++++ PMP Register Status ++++++
    [KERN]: pmpcfg0: 0x1e1e1d18, pmpcfg1: 0x1e1e1e1e, pmpcfg2: 0x001f1f1f
    [KERN]: pmpaddr0: 0x00000000, pmpaddr1: 0x0400009c
    [KERN]: pmpaddr2: 0x08000204, pmpaddr3: 0x08000214
    [KERN]: pmpaddr4: 0x08000224, pmpaddr5: 0x08000234
    [KERN]: pmpaddr6: 0x08000244, pmpaddr7: 0x08000254
    [KERN]: pmpaddr8: 0x01ffffff, pmpaddr9: 0x13ffffff, pmpaddr10: 0x35ffffff
    [KERN]: ++++++ End PMP Register Status ++++++
    [KERN]: ###### starting: hubris with task id: 0 and priority: 0 ######
    [KERN]: Starting first task
    [KERN]: ****** trap_handler() MCAUSE: [0x00000008] ******
    [KERN]: Trap::Exception(UserEnvCall) from TASK [0]
    [KERN] ====== SYSCALL-1-ENTERED:for task 0 ======
    [KERN] NextTask::Other selected for syscall 1
    [KERN]: ----- apply_memory_protection() for TASK [1] -----
    [KERN]: Region 0: Preparing pmpaddr=0x00000003, pmpcfg=0x18
    [KERN]: Region 0 programmed -> base=0x00000000, size=32
    [KERN]: Region 1: Preparing pmpaddr=0x040000cf, pmpcfg=0x1d
    [KERN]: Region 1 programmed -> base=0x10000300, size=128
    [KERN]: Region 2: Preparing pmpaddr=0x080002a7, pmpcfg=0x1e
    [KERN]: Region 2 programmed -> base=0x20000a80, size=64
    [KERN]: Region 3: Preparing pmpaddr=0x080002b7, pmpcfg=0x1e
    [KERN]: Region 3 programmed -> base=0x20000ac0, size=64
    [KERN]: Region 4: Preparing pmpaddr=0x080002c7, pmpcfg=0x1e
    [KERN]: Region 4 programmed -> base=0x20000b00, size=64
    [KERN]: Region 5: Preparing pmpaddr=0x080002d3, pmpcfg=0x1e
    [KERN]: Region 5 programmed -> base=0x20000b40, size=32
    [KERN]: Region 6: Preparing pmpaddr=0x080002db, pmpcfg=0x1e
    [KERN]: Region 6 programmed -> base=0x20000b60, size=32
    [KERN]: Region 7: Preparing pmpaddr=0x3400003f, pmpcfg=0x1e
    [KERN]: Region 7 programmed -> base=0xd0000000, size=512
    [KERN]: ----- apply_memory_protection() DONE -----
    [KERN]: ++++++ PMP Register Status ++++++
    [KERN]: pmpcfg0: 0x1e1e1d18, pmpcfg1: 0x1e1e1e1e, pmpcfg2: 0x001f1f1f
    [KERN]: pmpaddr0: 0x00000000, pmpaddr1: 0x040000cc
    [KERN]: pmpaddr2: 0x080002a4, pmpaddr3: 0x080002b4
    [KERN]: pmpaddr4: 0x080002c4, pmpaddr5: 0x080002d0
    [KERN]: pmpaddr6: 0x080002d8, pmpaddr7: 0x3400003c
    [KERN]: pmpaddr8: 0x01ffffff, pmpaddr9: 0x13ffffff, pmpaddr10: 0x35ffffff
    [KERN]: ++++++ End PMP Register Status ++++++
    [KERN] ====== SYSCALL-1-EXITED:for task 0 ======
    [KERN]: ****** trap_handler() DONE ******
    ```

    > As you can see, the kernel launches successfully and schedules the 1st task `supervisor` which in turn schedules the next priority task `blinky`, which blinks an external LED.
    > Refer to the [hubris-riscv-hazard3](https://github.com/oxidecomputer/hubris/commit/a55363a57a29d97b94b587c7c2deb4021f50377d) repo for complete details about the logs.

## Output

<div style="display: flex; justify-content: center;">
  <video autoplay muted loop playsinline>
    <source src="/Hubris-on-Pico2W.mp4" type="video/mp4">
  </video>
</div>

## Issues

### SysCall issue

In the `supervisor` task, I'm actually calling the **sys_recv_notification** syscall. 
This syscall takes a *notification mask* as an input and listens *only* for notifications, leaving messages queued.
We use value `1` as our notification mask; this is a fixed detail of the kernel-supervisor interface: the kernel pokes *bit 0* on fault.

I forgot to implement this syscall initially for RISC-V and I faced the below issue:

- OpenOCD output:
```sh
Info : [rp2350.rv0] Hart unexpectedly reset!
```

> Just after flashing the kernel and trying to run it, OpenOCD reported a hart reset. There wasn't any additional info as to what could be the reason for this because the kernel hadn't even started to run to get the logs. After many trial and errors and studying the ARM userlib source code, I got to know I'm depending on this syscall. After implementing the syscall, the issue was resolved.

### Pico hardware issue

This issue caused me sleepless nights and it took me around 2 weeks to work around this issue 😢.

After the kernel launches successfully and starts the supervisor task, this task then schedules the next priority task which is *blinky* in this case. During the execution of this task, I was facing the **LoadFault Exception** whenever the task tried to access **PADS_BANK0 registers**.

See below:

```sh
[KERN]: ###### starting: kernel ######
[KERN]: ----- apply_memory_protection() for TASK [0] -----
[KERN]: ###### starting: hubris with task id: 0 and priority: 0 ######
[KERN]: Starting first task
[KERN]: ****** trap_handler() MCAUSE: [0x00000008] ******
[KERN]: Trap::Exception(UserEnvCall) from TASK [0]
[KERN] ====== SYSCALL-1-ENTERED:for task 0 ======
[KERN] NextTask::Other selected for syscall 1
[KERN]: ----- apply_memory_protection() for TASK [1] -----
[KERN] ====== SYSCALL-1-EXITED:for task 0 ======
[KERN]: ****** trap_handler() DONE ******
[KERN]: ****** trap_handler() MCAUSE: [0x00000005] ******
[KERN]: Trap::Exception(LoadFault)
[KERN]: ----- apply_memory_protection() for TASK [0] -----
[KERN]: Handled fault MemoryAccess which had program_counter: 0x1000035e
[KERN]: ****** trap_handler() DONE ******
```

> As you can see above, we hit **UserEnvCall Exception** which is a result of the supervisor task calling a syscall from userspace, and then when we switch to our next task blinky, we hit **LoadFault Exception** (MCAUSE: [0x00000005]), with PC pointing to 0x1000035e.

I checked the disassembly and it was indeed a load instruction accessing the **PADS_BANK0** memory region.

Creating disassembly:
```sh
$ just dump
```

Blinky task disassembly:
```asm
10000350 <main>:
10000350:	d0000537          	lui	a0,0xd0000
10000354:	004005b7          	lui	a1,0x400
10000358:	dd0c               	sw	a1,56(a0)
1000035a:	40038537          	lui	a0,0x40038
1000035e:	4d6c                lw	a1,92(a0)
10000360:	e3f5f593          	and	a1,a1,-449
10000364:	04058593          	add	a1,a1,64 # 400040
10000368:	cd6c               	sw	a1,92(a0)
1000036a:	40028537          	lui	a0,0x40028
1000036e:	4595                li	a1,5
10000370:	0ab52a23          	sw	a1,180(a0) # 400280b4
10000374:	a001                j	10000374 <main+0x24>
```

> Referring to the above assembly code, we are trying to access GPIO22 of the PADS_BANK0 register.

```asm
> a0 <= PADS_BANK0_BASE = 0x4003_8000
`1000035a:	40038537          	lui	a0,0x40038`

> a1 <= 92(a0) = 5C(a0) = PADS_BANK0->GPIO22
`1000035e:	4d6c                lw	a1,92(a0)`
```

After knowing what the issue was, I tried the following solutions:

1. I first suspected this could be due to wrong PMP implementation, but after reviewing the PMP configuration, it seemed to be correct. I even changed the PMP implementation to match the `tock-os` implementation to make sure this was not the issue.

2. I also checked the memory region permissions and ensured that the PADS_BANK0 region was correctly marked as accessible for the blinky task.

    ```sh
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

    peripheral "peripherals" {
        base 0x4000_0000
        size 0x2000_0000    // Hardwired PMP Region (PMPADDR9)
    }

    // blinky task. Blinks an external led
    task blinky {
        workspace-crate blinky
        stack-size 256
        priority 1
        uses-peripheral sio
        uses-peripheral io_bank0
        uses-peripheral pads_bank0
        uses-peripheral peripherals
    }
    ```

3. I even tried to give full peripheral permissions to the blinky task as follows:

    ```sh
    peripheral "peripherals" {
        base 0x4000_0000
        size 0x2000_0000    // Hardwired PMP Region (PMPADDR9)
    }

    // blinky task. Blinks an external led
    task blinky {
        workspace-crate blinky
        stack-size 256
        priority 1
        uses-peripheral peripherals
    }
    ```

4. I even tried not setting any explicit peripheral permissions for the blinky task, relying on the default permissions instead. Default permissions are set by Hardwired PMP Regions as follows:
   - ROM: 0x00000000 through 0x0fffffff
   - Peripherals: 0x40000000 through 0x5fffffff
   - SIO: 0xd0000000 through 0xdfffffff

> All the above 4 solutions didn't solve the issue, but in reality every one of these should have solved the problem.

After many trial and errors, I gave up for a few days and started fresh and looked into the datasheet pretty closely. Then I found the important errata which is relevant to me.

**RP2350 Datasheet:**
![**RP2350-E3**](/RP2350-E3.png)

> According to the above errata, the issue seems to be only on QFN-60 package which is our Pico 2(W) boards. And also only PADS_BANK0 is affected, not Bank1.

As per the workaround, we have to implement a syscall to set the PADS register in kernel mode and then other things in user mode as earlier.

5. I was not confident and comfortable enough to implement the syscall and check if this solves the issue. So I decided to set the registers before starting the Hubris kernel itself, which runs in **M-mode**, and once Hubris starts and schedules tasks, it automatically switches to **U-mode** wherein I toggle the GPIO which doesn't involve touching the PADS registers.

> This solved the issue and the blinky application works fine on RISC-V too 🥳.

## References

- [RP2350 Datasheet](https://datasheets.raspberrypi.org/rp2350/rp2350-datasheet.pdf)
- [Cliffle's Hubris Blog posts](https://cliffle.com/tags/hubris/)
- [Hubris Reference](https://hubris.oxide.computer/reference/)
- [exhubris-demo-rp235x](https://github.com/Karthik-d-k/exhubris-demo-rp235x)
- [Hubris-fork](https://github.com/Karthik-d-k/hubris-riscv-hazard3/tree/hazard3)
- [exhubris-fork](https://github.com/Karthik-d-k/exhubris-riscv-hazard3/tree/rp235x-hazard3)
