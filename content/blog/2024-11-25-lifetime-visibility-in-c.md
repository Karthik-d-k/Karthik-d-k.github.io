+++
title = "Lifetime and Visibility in C Programs"
date = 2024-11-25
[taxonomies]
  tags = ["c"]
+++

## Motivation

I would like to explain how different **keywords in C** especially `static` and `extern` plays key role in defining the lifetime and visibility of objects. This has been ever confusing topic for me whenever i come across such keywords in real world code. This is my understanding and explanation as to when/how to use such keywords and how to reason about the same.

## Basic Exploration

Firstly, i will define the terms "Lifetime" and "Visibility" as follows:
> **Lifetime**: Every object has **start and end point** beyond which we can't/shouldn't access it. In other words it refers to *Storage duration* of an object.

> **Visibility**: An object can/should be accessed from **inside block** or **inside file** or from other **translation units [.c source files]** only according to its visibility. In other words it refers to *Linkage* of an object.

I will thoroughly explain the concepts with each **keywords** along the lines of above definition.

### static

<u>Lifetime</u>: Changes the lifetime to **Static storage duration** meaning it will be stored in memory till the end of the program.
This applies even for the object's which are in file scope (local) and/or block scope (global).

<u>Visibility</u>: Set's the objects to **Internal linkage**, i.e, object is accessible only within current translation unit.

- Un-initialized static objects will be automatically initialized to 0.

- static local variables will be initialized only once and retains its value between function calls.

**Snippet 1:**

```c
#include <stdio.h>

void func() {
    static int count = 0; // static local variable
    count++;
    printf("Count: %d\n", count);
}

int main() {
    func(); // Output: Count: 1
    func(); // Output: Count: 2
    func(); // Output: Count: 3

    return 0;
}
```

**Snippet 1 stdout:**
```
Count: 1
Count: 2
Count: 3
```

> In this example, the count variable is declared as static inside the func function. It retains its value between function calls, demonstrating static storage duration and internal linkage.

### extern

<u>Lifetime</u>: Changes the lifetime to **Static storage duration** meaning it will be stored in memory till the end of the program.
This applies even for the object's which are in file scope (local) and/or block scope (global).

<u>Visibility</u>: Set's the objects to **External linkage**, i.e, object is accessible to other current translation units.

- By default all functions and global variables will be set to extern unless otherwise overwritten.

**Snippet 2:**

File: `main.c`

```c
#include <stdio.h>

extern int globalVar; // Declaration of an external variable

int main() {
    printf("Global Variable: %d\n", globalVar);
    
    return 0;
}
```

File: `global.c`

```c
int globalVar = 42; // Definition of the external variable
```

**Snippet 2 stdout:**
```
Global Variable: 42
```

> In this example, globalVar is declared as extern in main.c and defined in global.c. This demonstrates external linkage, allowing the variable to be accessed across different translation units.

## Advanced Exploration

**Scenario 1:** *Let's say we have to create user defined type and the object with this type has to be shared among different source files.*

- User defined type has to be defined inside an `h file` and the object should be defined with `extern` keyword.
- extern will make sure the object is accessible among all source files which includes this header file.
- type information will also be available in the same source file because of inclusion of this header file.

**Snippet 3:**

File: `types.h`

```c
#ifndef TYPES_H
#define TYPES_H

typedef struct {
    int id;
    char name[50];
} User;

extern User user; // Declaration of an external variable of user-defined type

#endif // TYPES_H
```

File: `main.c`

```c
#include <stdio.h>
#include "types.h"

int main() {
    printf("User ID: %d\n", user.id);
    printf("User Name: %s\n", user.name);
    
    return 0;
}
```

File: `user.c`

```c
#include "types.h"

User user = {1, "John Doe"}; // Definition of the external variable
```

**Snippet 3 stdout:**
```
User ID: 1
User Name: John Doe
```

> In this example, the User type is defined in a header file types.h, and the user variable is declared as extern. The variable is defined in user.c and accessed in main.c, demonstrating external linkage and sharing of user-defined types across different source files.

**Scenario 2:** *Let's say we have to create a user-defined function that should be encapsulated and shouldn't be shared with other source files.*

- If we define a function in a header (.h) file and include it in multiple source files, it can be used in all those source files because, by default, all functions have extern linkage unless explicitly changed.
- To limit the visibility of a function to the current source file, we use the `static` keyword. This ensures the function can only be used within that single file. It is important to define the function in a .c file, not in a .h file, so that when the .h file is included in multiple source files, the function remains inaccessible.

**Snippet 4:**

File: `utils.c`

```c
#include "utils.h"

static void helperFunction() {
    // Function implementation
}

void publicFunction() {
    helperFunction(); // Can call the static function within the same file
}
```

File: `utils.h`

```c
#ifndef UTILS_H
#define UTILS_H

void publicFunction(); // Only declare the public function here

#endif // UTILS_H
```

File: `main.c`

```c
#include "utils.h"

int main() {
    publicFunction(); // Can call the public function
    // helperFunction(); // Error: helperFunction is not accessible here

    return 0;
}
```

> In this example, *helperFunction* is defined as static in utils.c, limiting its visibility to that file. *publicFunction* can call *helperFunction* within utils.c, but *helperFunction* is not accessible in main.c, demonstrating the use of static to encapsulate functions within a single source file.

## Summary
| Keyword |         Lifetime         |       Visibility                    |
|---------|--------------------------|-------------------------------------|
| static  | Stored till program ends | Accessible only within current file |
| extern  | Stored till program ends | Accessible across different files   |
