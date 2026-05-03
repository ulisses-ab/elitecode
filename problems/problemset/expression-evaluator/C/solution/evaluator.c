#define _POSIX_C_SOURCE 200809L
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <ctype.h>
#include "Evaluator.h"

/* ---- Variable store ---- */

typedef struct Var { char name[64]; double val; struct Var *next; } Var;

struct Evaluator { Var *vars; };

Evaluator *eval_create(void) { return calloc(1, sizeof(Evaluator)); }

void eval_set(Evaluator *e, const char *name, double value) {
    for (Var *v = e->vars; v; v = v->next)
        if (strcmp(v->name, name) == 0) { v->val = value; return; }
    Var *v = malloc(sizeof(*v));
    strncpy(v->name, name, 63); v->val = value;
    v->next = e->vars; e->vars = v;
}

static double lookup(Evaluator *e, const char *name) {
    for (Var *v = e->vars; v; v = v->next)
        if (strcmp(v->name, name) == 0) return v->val;
    return 0.0;
}

/* ---- Lexer ---- */

typedef enum {
    T_NUM, T_IDENT, T_PLUS, T_MINUS, T_STAR, T_SLASH,
    T_LPAREN, T_RPAREN, T_COMMA, T_EOF
} TokT;

typedef struct { TokT type; double num; char name[64]; } Tok;

typedef struct { const char *p; Tok cur; Evaluator *e; } Parser;

static void next_tok(Parser *pr) {
    while (isspace((unsigned char)*pr->p)) pr->p++;
    if (!*pr->p) { pr->cur.type = T_EOF; return; }
    char c = *pr->p;
    if (c == '+') { pr->cur.type = T_PLUS;   pr->p++; return; }
    if (c == '-') { pr->cur.type = T_MINUS;  pr->p++; return; }
    if (c == '*') { pr->cur.type = T_STAR;   pr->p++; return; }
    if (c == '/') { pr->cur.type = T_SLASH;  pr->p++; return; }
    if (c == '(') { pr->cur.type = T_LPAREN; pr->p++; return; }
    if (c == ')') { pr->cur.type = T_RPAREN; pr->p++; return; }
    if (c == ',') { pr->cur.type = T_COMMA;  pr->p++; return; }
    if (isdigit((unsigned char)c) || (c == '.' && isdigit((unsigned char)pr->p[1]))) {
        char *end;
        pr->cur.type = T_NUM;
        pr->cur.num  = strtod(pr->p, &end);
        pr->p = end; return;
    }
    if (isalpha((unsigned char)c)) {
        int i = 0;
        while (isalnum((unsigned char)*pr->p) || *pr->p == '_')
            pr->cur.name[i++] = *pr->p++;
        pr->cur.name[i] = '\0';
        pr->cur.type = T_IDENT; return;
    }
    pr->p++; pr->cur.type = T_EOF;
}

/* Forward declarations */
static double parse_expr(Parser *pr);

static double parse_primary(Parser *pr) {
    if (pr->cur.type == T_NUM) {
        double v = pr->cur.num; next_tok(pr); return v;
    }
    if (pr->cur.type == T_MINUS) {
        next_tok(pr); return -parse_primary(pr);
    }
    if (pr->cur.type == T_LPAREN) {
        next_tok(pr);
        double v = parse_expr(pr);
        if (pr->cur.type == T_RPAREN) next_tok(pr);
        return v;
    }
    if (pr->cur.type == T_IDENT) {
        char name[64]; strncpy(name, pr->cur.name, 63);
        next_tok(pr);
        if (pr->cur.type == T_LPAREN) { /* function call */
            next_tok(pr);
            double args[8]; int nargs = 0;
            while (pr->cur.type != T_RPAREN && pr->cur.type != T_EOF) {
                args[nargs++] = parse_expr(pr);
                if (pr->cur.type == T_COMMA) next_tok(pr);
            }
            if (pr->cur.type == T_RPAREN) next_tok(pr);
            if (strcmp(name, "min") == 0) return fmin(args[0], args[1]);
            if (strcmp(name, "max") == 0) return fmax(args[0], args[1]);
            if (strcmp(name, "abs") == 0) return fabs(args[0]);
            if (strcmp(name, "pow") == 0) return pow(args[0], args[1]);
            return 0.0;
        }
        return lookup(pr->e, name);
    }
    return 0.0;
}

static double parse_term(Parser *pr) {
    double v = parse_primary(pr);
    while (pr->cur.type == T_STAR || pr->cur.type == T_SLASH) {
        TokT op = pr->cur.type; next_tok(pr);
        double r = parse_primary(pr);
        v = (op == T_STAR) ? v * r : v / r;
    }
    return v;
}

static double parse_expr(Parser *pr) {
    double v = parse_term(pr);
    while (pr->cur.type == T_PLUS || pr->cur.type == T_MINUS) {
        TokT op = pr->cur.type; next_tok(pr);
        double r = parse_term(pr);
        v = (op == T_PLUS) ? v + r : v - r;
    }
    return v;
}

double eval_eval(Evaluator *e, const char *expression) {
    Parser pr; pr.p = expression; pr.e = e;
    next_tok(&pr);
    return parse_expr(&pr);
}

void eval_destroy(Evaluator *e) {
    Var *v = e->vars;
    while (v) { Var *n = v->next; free(v); v = n; }
    free(e);
}
