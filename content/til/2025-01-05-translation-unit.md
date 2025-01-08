+++
title = "Translation Unit in C"
date = 2025-01-05
[taxonomies]
  tags = ["c"]
+++

- A **Translation Unit (TU)** is a source file that is given to the compiler to compile into an object file.
- Each TU can include any number of files using the **#include** directive. The included file can be any file with any extension (e.g., *.c, *.h, *.cpp) as long as it contains C source code that the compiler can understand.
- In the end, all object files generated for each TU will be linked by the linker to produce an executable.

## Example

**Snippet 1:**

File: `print.exe`

```c
#include <stdio.h>

void print_exe() {
    printf("print-exe\n");
}
```

File: `mian.c`

```c
#include "print.exe"
#include <stdio.h>

int main() {
    printf("print-main\n");
    print_exe();
    return 0;
}
```

**Compile:**
```bash
gcc main.c -o main.exe
./main.exe
```

**Snippet 1 stdout:**

```bash
print-main
print-exe
```

- In this example, we have one TU i.e, main.c which includes other source file *print.exe*, even though the extension is *.exe it still works as expected.
Output prints both the print statements from main.c and print.exe file.


# References

- [Handmade Hero Chat 013 - Translation Units, Function Pointers, Compilation, Linking, and Execution](https://youtu.be/n4fI4eUTTKM?si=HJAd51EqqrldZkoO)
 