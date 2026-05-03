#ifndef INTERPRETER_H
#define INTERPRETER_H

/* Execute the given source program and return all printed output as a
   malloc'd, newline-separated string. The caller frees the result.
   Add as many additional .h/.c files as you need. */

typedef struct Interpreter Interpreter;

Interpreter *interp_create(void);
char        *interp_run(Interpreter *interp, const char *source);
void         interp_destroy(Interpreter *interp);

#endif
