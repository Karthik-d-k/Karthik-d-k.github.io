#include <stdio.h>
// ------------------------------------------------------------------------------------------ //
//                                        SNIPPET 1
// ------------------------------------------------------------------------------------------ //

void swap1(int a, int b) {
    int t;

    t = a;
    a = b;
    b = t;
    printf("FUNC  : a = %d, b = %d\n", a, b);
}

int main1(void) {
    int a = 11;
    int b = 22;

    printf("BEFORE: a = %d, b = %d\n", a, b);
    swap1(a, b);
    printf("AFTER : a = %d, b = %d\n", a, b);
}

// ------------------------------------------------------------------------------------------ //
//                                        SNIPPET 2
// ------------------------------------------------------------------------------------------ //

void swap2(int* ap, int* bp) {
    int t;

    t = *ap;
    *ap = *bp;
    *bp = t;
    printf("FUNC  : a = %d, b = %d\n", *ap, *bp);
}

int main2(void) {
    int a = 11;
    int b = 22;

    printf("BEFORE: a = %d, b = %d\n", a, b);
    swap2(&a, &b);
    printf("AFTER : a = %d, b = %d\n", a, b);
}

// ------------------------------------------------------------------------------------------ //
//                                        SNIPPET 3
// ------------------------------------------------------------------------------------------ //

void swap3(int* ap, int* bp) {
    int* t;

    t = ap;
    ap = bp;
    bp = t;
    printf("FUNC  : a = [%X]: %d, b = [%X]: %d\n", ap, *ap, bp, *bp);
}

int main3(void) {
    int a = 11;
    int b = 22;
    int* ap = &a;
    int* bp = &b;

    printf("BEFORE: a = [%X]: %d, b = [%X]: %d\n", ap, a, bp, b);
    swap3(ap, bp);
    printf("AFTER : a = [%X]: %d, b = [%X]: %d\n", ap, a, bp, b);
}

// ------------------------------------------------------------------------------------------ //
//                                        SNIPPET 4
// ------------------------------------------------------------------------------------------ //

void swap4(int** app, int** bpp) {
    int* t;

    t = *app;
    *app = *bpp;
    *bpp = t;
    printf("FUNC  : a = [%X]: %d, b = [%X]: %d\n", *app, **app, *bpp, **bpp);
}

int main4(void) {
    int a = 11;
    int b = 22;
    int* ap = &a;
    int* bp = &b;

    printf("BEFORE: a = [%X]: %d, b = [%X]: %d\n", ap, a, bp, b);
    swap4(&ap, &bp);
    printf("AFTER : a = [%X]: %d, b = [%X]: %d\n", ap, a, bp, b);
}

// ------------------------------------------------------------------------------------------ //
//                                        MAIN FUNC
// ------------------------------------------------------------------------------------------ //
int main(void) {
    printf("Snippet 1:\n");
    main1();

    printf("\nSnippet 2:\n");
    main2();

    printf("\nSnippet 3:\n");
    main3();

    printf("\nSnippet 4:\n");
    main4();

    printf("\nlegend --> [ADDRESS]: VALUE\n");

    return 0;
}
