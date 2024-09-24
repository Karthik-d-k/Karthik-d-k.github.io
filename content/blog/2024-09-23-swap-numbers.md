+++
title = "Swapping addresses instead of values"
date = 2024-09-23
[taxonomies]
  tags = ["c"]
+++

## Motivation

I was thinking about famous `C interview question` wherein we will be asked to swap 2 variables. Generally, this could be solved using pointers with either using temporary variable or with xor method.

But now i want to takle the same problem in a different perspective.
Instead of changing the variable's values, what if we were asked to swap its addresses instead of values ?

Solving this problem was not straight forward as i thought initially, it involves some fair bit of understanding pointers and pointer to pointer (int** for example) manipulations.

In this blog, i will try to explain how i got to the solution or in other words, how i would solve it.

## Exploration

First, lets see how we would solve the problem of swapping 2 variables using function `swap`. We would write a function as follows, which uses temporary variable as a placeholder to exchange numbers.

**Snippet 1:**
```c
#include <stdio.h>

void swap(int a, int b) {
    int t;

    t = a;
    a = b;
    b = t;
    printf("FUNC  : a = %d, b = %d\n", a, b);
}

int main(void) {
    int a = 11;
    int b = 22;

    printf("BEFORE: a = %d, b = %d\n", a, b);
    swap(a, b);
    printf("AFTER : a = %d, b = %d\n", a, b);
}
```

**Snippet 1 stdout:**
```
BEFORE: a = 11, b = 22
FUNC  : a = 22, b = 11
AFTER : a = 11, b = 22
```

Surprisingly, we would see the variables are swapped but it is not reflected back to the caller in the main function. 

> In **C**, each and every function has its own stack which will be created at the time of function call and destroyed after function call si done. Another most important part is, function parameters and each variables created inside the function is stored in its own stack. 

Hence, eventhough swap() is changing a and b, it is changing only inside its own stack (look @FUNC output above) and these local variables will be destroyed once function call exits. Hence @AFTER output is unchanged.

 
> In **C**, to change values present in one function from another function, we have a classic tool for that which is `pointers`. You would have to share the address of variables **("value of interest")** to the function, to access and change the values present inside.

**Snippet 2:**
```c
#include <stdio.h>

void swap(int* ap, int* bp) {
    int t;

    t = *ap;
    *ap = *bp;
    *bp = t;
    printf("FUNC  : a = %d, b = %d\n", *ap, *bp);
}

int main(void) {
    int a = 11;
    int b = 22;

    printf("BEFORE: a = %d, b = %d\n", a, b);
    swap(&a, &b);
    printf("AFTER : a = %d, b = %d\n", a, b);
}
```

**Snippet 2 stdout:**
```
BEFORE: a = 11, b = 22
FUNC  : a = 22, b = 11
AFTER : a = 22, b = 11
```

We are sharing a and b by sending its addresses (`&a, &b`) to swap func. 
Inside swap func, we are dereferencing a and b (`*ap, *bp`) to get inside its values and swapping them, this way we are modifying the memeory of a and b stored inside main func stack. Output reflects the same above. Here value of interest is a and b and we sent its addresses for modification. This is the most important part of pointers. PLease remember this, this will come back when we try to swap 2 pointers instead of values.

Now that we know how to swap 2 variables using pointers to the variables, let's look at the problem of swapping pointers itself (i.e, addresses of variables).

First we will try the naive way as we did in snippet 1.

**Snippet 3:**
```c
#include <stdio.h>

void swap(int* ap, int* bp) {
    int* t;

    t = ap;
    ap = bp;
    bp = t;
    printf("FUNC  : a = [%X]: %d, b = [%X]: %d\n", ap, *ap, bp, *bp);
}

int main(void) {
    int a = 11;
    int b = 22;
    int* ap = &a;
    int* bp = &b;

    printf("BEFORE: a = [%X]: %d, b = [%X]: %d\n", ap, a, bp, b);
    swap(ap, bp);
    printf("AFTER : a = [%X]: %d, b = [%X]: %d\n", ap, a, bp, b);

    printf("\nlegend --> [ADDRESS]: VALUE\n");
}
```

**Snippet 3 stdout:**
```
BEFORE: a = [DBF232EC]: 11, b = [DBF232E8]: 22
FUNC  : a = [DBF232E8]: 22, b = [DBF232EC]: 11
AFTER : a = [DBF232EC]: 11, b = [DBF232E8]: 22

legend --> [ADDRESS]: VALUE
```

> **NOTE:** Output addresses printed in the stdout changes with every fresh run of the program and concentarte only the addresses for now.

Same fate as **Snippet 1 output**, we were able to change the addresses but it only reflects inside swap func not in main func. The problem again is, we are changing the addresses local to swap function. To change the addresses present in main function, we have to send pointers to these addresses, becuase now our value of interest is (`&a, &b`).

Let's try sending the pointers to addresses of a and b -->

**Snippet 4:**
```c
#include <stdio.h>

void swap(int** app, int** bpp) {
    int* t;

    t = *app;
    *app = *bpp;
    *bpp = t;
    printf("FUNC  : a = [%X]: %d, b = [%X]: %d\n", *app, **app, *bpp, **bpp);
}

int main(void) {
    int a = 11;
    int b = 22;
    int* ap = &a;
    int* bp = &b;

    printf("BEFORE: a = [%X]: %d, b = [%X]: %d\n", ap, a, bp, b);
    swap(&ap, &bp);
    printf("AFTER : a = [%X]: %d, b = [%X]: %d\n", ap, a, bp, b);
    
    printf("\nlegend --> [ADDRESS]: VALUE\n");
}
```

**Snippet 4 stdout:**
```
BEFORE: a = [DBF232EC]: 11, b = [DBF232E8]: 22
FUNC  : a = [DBF232E8]: 22, b = [DBF232EC]: 11
AFTER : a = [DBF232E8]: 11, b = [DBF232EC]: 22

legend --> [ADDRESS]: VALUE
```

We passed pointers to value of interest and dereferenced inside the calling function to change the values inside it directly so that it reflects back in the caller site.

Astute reader may have noticed,\
 `we were able to swap the addresses but not the values of a and b`.\
Can you decode why ???

> This question is left as an exercise for the reader and modify the snippet so that we were able to change both addresses and values of variables a and b.

## Conclusion

- There is one most important takeaway from this post which i would like to highlight. If you want to modify values (**"value of interest"**) present in one function from another function, you should share pointers to those **"value of interest"**.

- Full script is available on github [**swap_numbers.c**](https://github.com/Karthik-d-k/Karthik-d-k.github.io/blob/main/content/scripts/swap_numbers.c)
