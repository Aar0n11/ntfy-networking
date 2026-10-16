#include <stdio.h>
#include <emscripten.h>

EMSCRIPTEN_KEEPALIVE
int testWASM()
{
    printf("WASM Working!\n");

    return 0;
}

EMSCRIPTEN_KEEPALIVE
int main()
{
    printf("WASM loaded!\n");

    return 0;
}