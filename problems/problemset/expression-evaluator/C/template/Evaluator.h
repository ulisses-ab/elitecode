#ifndef EVALUATOR_H
#define EVALUATOR_H

typedef struct Evaluator Evaluator;

Evaluator *eval_create(void);
void       eval_set(Evaluator *e, const char *name, double value);
double     eval_eval(Evaluator *e, const char *expression);
void       eval_destroy(Evaluator *e);

#endif
