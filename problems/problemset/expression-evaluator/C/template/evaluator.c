#include <stdlib.h>
#include "Evaluator.h"

struct Evaluator {
    /* add your fields here */
};

Evaluator *eval_create(void) {
    Evaluator *e = malloc(sizeof(*e));
    return e;
}

void eval_set(Evaluator *e, const char *name, double value) {
    /* TODO */
    (void)e; (void)name; (void)value;
}

double eval_eval(Evaluator *e, const char *expression) {
    /* TODO */
    (void)e; (void)expression;
    return 0.0;
}

void eval_destroy(Evaluator *e) {
    free(e);
}
