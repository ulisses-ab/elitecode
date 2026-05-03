#include <stdlib.h>
#include <string.h>
#include "Interpreter.h"

struct Interpreter {
    /* add your fields here */
};

Interpreter *interp_create(void) {
    Interpreter *i = malloc(sizeof(*i));
    return i;
}

char *interp_run(Interpreter *interp, const char *source) {
    /* TODO: lex, parse, and execute source; return malloc'd output string */
    (void)interp; (void)source;
    return strdup("");
}

void interp_destroy(Interpreter *interp) {
    free(interp);
}
