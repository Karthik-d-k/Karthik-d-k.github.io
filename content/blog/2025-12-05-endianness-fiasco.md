+++
title = "Endianness Fiasco"
date = 2025-12-05
[taxonomies]
  tags = ["c"]
+++

## Motivation

I'm from embedded background and I deal with hardware. Often, we deal with bitwise operations to manipulate data at the bit level. 
One of the common challenges that arise in such scenarios is endianness - the order in which bytes are arranged within larger data types.
Only if we know how the data is stored, we can correctly interpret and manipulate it.

## Endianness

Endianness defines how `multi-byte data` will be `stored` in our `computer memory`.\
**Big-endian** and **Little-endian** are the types widely used; other types may not be relevant to most users.
explore [wiki](https://en.wikipedia.org/wiki/Endianness) for this.

> Smallest addressable unit of data in current computing systems is `byte (8-bits)`.

Endianness comes into the picture when we try to *read/write multi-byte data*. Endianness does not matter if you have a *single byte*.

1. **Big-endian**: When we store multi-byte data, the most-significant byte will be stored at the lowest addressed memory.

2. **Little-endian**: When we store multi-byte data, the least-significant byte will be stored at the lowest addressed memory.

We can visualize this difference by running the following **c code snippet**.

**Snippet 1:**
```c
#include <stdio.h>
#include <stdint.h>
#include <endian.h>  // GNU/Linux (glibc). Not portable to Windows/MSVC.

int main(void) {          
    uint16_t data_u16 = 0x1122;
    uint16_t u16_be = htobe16(data_u16);    // Store 16-bit data in big-endian format
    uint16_t u16_le = htole16(data_u16);    // Store 16-bit data in little-endian format

    uint8_t* u8p_be = (uint8_t *)&u16_be;   // Point to lowest address of `be` data
    uint8_t* u8p_le = (uint8_t *)&u16_le;   // Point to lowest address of `le` data

    printf("data_u16  = %#x\n", data_u16);
    printf("u8p_be[0] = %#x\n", *u8p_be);
    printf("u8p_le[0] = %#x\n", *u8p_le);

    return 0;
}

```

**Snippet 1 stdout:**
```bash
data_u16  = 0x1122
u8p_be[0] = 0x11
u8p_le[0] = 0x22
```

- Let's assume our 16-bit data is **0x1122** wherein **0x11** is the most-significant byte and **0x22** is the least-significant byte.
- Here, I'm using `htobe16` and `htole16` functions from `endian.h` to simulate big- and little-endian representations. Note: `endian.h` is GNU-specific; on other platforms you may use `htons`/`ntohs` or manual byte operations.
- By reading the first byte stored at the lowest address of our data, we get to know that a LE machine stores the least-significant byte and a BE machine stores the most-significant byte.

Using the above example with slight modification, we could get to know our machine's endianness.

**Snippet 2:**
```c
#include <stdio.h>
#include <stdint.h>

int main(void) {          
    uint16_t u16 = 0x1122;
    uint8_t* u8p = (uint8_t *)&u16; 

    if ((*u8p) == 0x22) {
        printf("LITTLE ENDIAN\n");
    } else {
        printf("BIG ENDIAN\n");
    }

    return 0;
}

```

**Snippet 2 stdout:**
```bash
LITTLE ENDIAN
```

## Bit Twiddling

I will explain how to set/clear the bits in a multi-byte data by taking endianness into account.
Let's say we have a 32-bit data and we had to set the 25th bit and clear the 6th bit, the usual way is to
use a bit-mask and do bit-wise operations as shown in the below snippet:

**Snippet 3:**
```c
#include <stdio.h>
#include <stdint.h>

int main(void) {          
    uint32_t u32_in = 0xDD223344;
    uint32_t u32_out = u32_in;
    uint32_t set_mask = 0x02000000;     // 25th bit is 1, everything else is 0
    uint32_t clear_mask = 0xFFFFFFBF;  // 6th  bit is 0, everything else is 1

    u32_out |= set_mask;    // set   25th bit
    u32_out &= clear_mask;  // clear 6th bit

    printf("u32_in : %#b\n", u32_in);
    printf("u32_out: %#b\n", u32_out);

    return 0;
}

```

**Snippet 3 stdout:**
```bash
u32_in : 0b11011101001000100011001101000100
u32_out: 0b11011111001000100011001100000100
```

> From the above snippet, we can confirm that endianness comes into the picture only when we treat multibyte data as raw bytes, but doesn't matter when we operate using multi-byte operations directly.

## Real world scenarios

### Raw memory dumps

When we get memory dumps from GDB, QEMU, EEPROM and/or flash images, we should know beforehand which endian is used to store the data.

**Snippet 4:**
```bash
Memory dump: 66 00 00 00
LE → 0x00000066 (102 decimal)
BE → 0x66000000 (1,711,276,032 decimal)
```
From the above snippet, we can confirm that if we had to read 32-bit data from the raw memory dump, we could end up with different values if we don't know how it was stored in the first place.

### ELF

Executable and Linkable Format (ELF) is a common file format for executables, object files, shared libraries, device drivers and core dumps.
The fifth byte of the ELF header (e_ident[EI_DATA]) determines how to interpret all subsequent multi-byte fields (such as addresses, offsets, and sizes) in the entire file.
- Value 1: Specifies Little-endian encoding
- Value 2: Specifies Big-endian encoding

### Network protocols

Most networking protocols use `network byte order` which is `big-endian`, but be careful out there because some network protocols use `little-endian` too.

### Kerberos

**Version 2** of `Keytab file format` always uses big-endian byte order, whereas
**version 1** uses native byte order for integer representations.

### Binary file formats

Many binary file formats either encode the endian type or use a fixed endian type for that particular file format.
So we have to consider this if we are dealing with raw binary formats in any form.

## Conclusion

- Full script is available on github [**endianness_fiasco.c**](https://github.com/Karthik-d-k/Karthik-d-k.github.io/blob/main/content/scripts/endianness_fiasco.c)
