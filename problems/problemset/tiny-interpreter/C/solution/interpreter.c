#define _POSIX_C_SOURCE 200809L
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <stdint.h>
#include <ctype.h>
#include "Interpreter.h"

/* ================================================================ LEXER ================================================================ */

typedef enum {
    T_INT, T_IDENT,
    T_PLUS, T_MINUS, T_STAR, T_SLASH, T_PERCENT,
    T_EQEQ, T_NEQ, T_LT, T_LE, T_GT, T_GE,
    T_ASSIGN, T_LPAREN, T_RPAREN, T_COMMA, T_COLON,
    T_AND, T_OR, T_NOT,
    T_IF, T_ELIF, T_ELSE, T_WHILE, T_DEF, T_RETURN, T_PRINT,
    T_INDENT, T_DEDENT, T_NEWLINE, T_EOF
} TT;

typedef struct { TT type; int64_t ival; char name[64]; } Tok;
typedef struct { Tok *t; int n, cap; } TArr;

static void ta_push(TArr *a, Tok t) {
    if (a->n == a->cap) { a->cap = a->cap ? a->cap*2 : 128; a->t = realloc(a->t, a->cap*sizeof(Tok)); }
    a->t[a->n++] = t;
}
static void ta_type(TArr *a, TT tt) { Tok t={0}; t.type=tt; ta_push(a,t); }

static TArr lex(const char *src) {
    TArr a={0};
    int stk[512]; stk[0]=0; int sp=0;
    const char *p=src;
    while (*p) {
        /* count indent */
        int sp_cnt=0;
        while (*p==' ') { sp_cnt++; p++; }
        /* skip blank/comment lines */
        if (*p=='\n'||*p=='\r'||*p=='#'||!*p) {
            while (*p && *p!='\n') p++;
            if (*p=='\n') p++;
            continue;
        }
        /* emit INDENT/DEDENT */
        if (sp_cnt > stk[sp]) { stk[++sp]=sp_cnt; ta_type(&a,T_INDENT); }
        else while (sp_cnt < stk[sp]) { sp--; ta_type(&a,T_DEDENT); }

        /* tokenize line */
        while (*p && *p!='\n' && *p!='\r') {
            if (*p=='#') { while(*p&&*p!='\n') p++; break; }
            if (*p==' '||*p=='\t') { p++; continue; }
            if (isdigit((unsigned char)*p)) {
                Tok t={0}; t.type=T_INT;
                while (isdigit((unsigned char)*p)) t.ival=t.ival*10+(*p++-'0');
                ta_push(&a,t); continue;
            }
            if (isalpha((unsigned char)*p)||*p=='_') {
                char buf[64]; int i=0;
                while ((isalnum((unsigned char)*p)||*p=='_')&&i<63) buf[i++]=*p++;
                buf[i]='\0';
                Tok t={0};
                if      (!strcmp(buf,"if"))     t.type=T_IF;
                else if (!strcmp(buf,"elif"))   t.type=T_ELIF;
                else if (!strcmp(buf,"else"))   t.type=T_ELSE;
                else if (!strcmp(buf,"while"))  t.type=T_WHILE;
                else if (!strcmp(buf,"def"))    t.type=T_DEF;
                else if (!strcmp(buf,"return")) t.type=T_RETURN;
                else if (!strcmp(buf,"print"))  t.type=T_PRINT;
                else if (!strcmp(buf,"and"))    t.type=T_AND;
                else if (!strcmp(buf,"or"))     t.type=T_OR;
                else if (!strcmp(buf,"not"))    t.type=T_NOT;
                else { t.type=T_IDENT; strncpy(t.name,buf,63); }
                ta_push(&a,t); continue;
            }
            Tok t={0};
            if      (p[0]=='='&&p[1]=='='){t.type=T_EQEQ; p+=2;}
            else if (p[0]=='!'&&p[1]=='='){t.type=T_NEQ;  p+=2;}
            else if (p[0]=='<'&&p[1]=='='){t.type=T_LE;   p+=2;}
            else if (p[0]=='>'&&p[1]=='='){t.type=T_GE;   p+=2;}
            else if (*p=='+'){t.type=T_PLUS;   p++;}
            else if (*p=='-'){t.type=T_MINUS;  p++;}
            else if (*p=='*'){t.type=T_STAR;   p++;}
            else if (*p=='/'){t.type=T_SLASH;  p++;}
            else if (*p=='%'){t.type=T_PERCENT;p++;}
            else if (*p=='('){t.type=T_LPAREN; p++;}
            else if (*p==')'){t.type=T_RPAREN; p++;}
            else if (*p==','){t.type=T_COMMA;  p++;}
            else if (*p==':'){t.type=T_COLON;  p++;}
            else if (*p=='<'){t.type=T_LT;     p++;}
            else if (*p=='>'){t.type=T_GT;     p++;}
            else if (*p=='='){t.type=T_ASSIGN; p++;}
            else { p++; continue; }
            ta_push(&a,t);
        }
        ta_type(&a,T_NEWLINE);
        if (*p=='\r') p++;
        if (*p=='\n') p++;
    }
    while (sp>0) { sp--; ta_type(&a,T_DEDENT); }
    ta_type(&a,T_EOF);
    return a;
}

/* ================================================================ AST ================================================================ */

typedef enum {
    ND_INT, ND_VAR, ND_BINOP, ND_UNOP, ND_CALL,
    ND_ASSIGN, ND_PRINT, ND_RETURN,
    ND_IF, ND_WHILE, ND_FUNC, ND_BLOCK
} NK;

#define OP_ADD 1
#define OP_SUB 2
#define OP_MUL 3
#define OP_DIV 4
#define OP_MOD 5
#define OP_EQ  6
#define OP_NEQ 7
#define OP_LT  8
#define OP_LE  9
#define OP_GT  10
#define OP_GE  11
#define OP_AND 12
#define OP_OR  13
#define OP_NOT 14
#define OP_NEG 15

typedef struct Node Node;
struct Node {
    NK       kind;
    int64_t  ival;
    char     name[64];
    int      op;
    Node    *a, *b, *c;
    Node   **list;  int nlist;   /* block stmts, call args */
    char   **slist; int nslist;  /* func param names */
};

static Node *nd(NK k) { Node *n=calloc(1,sizeof(Node)); n->kind=k; return n; }
static void nl_push(Node *n, Node *c) {
    n->list=realloc(n->list,(n->nlist+1)*sizeof(Node*)); n->list[n->nlist++]=c;
}
static void ns_push(Node *n, const char *s) {
    n->slist=realloc(n->slist,(n->nslist+1)*sizeof(char*)); n->slist[n->nslist++]=strdup(s);
}

/* ================================================================ PARSER ================================================================ */

typedef struct { Tok *t; int pos; } Pr;
static TT pt(Pr *p)    { return p->t[p->pos].type; }
static Tok pa(Pr *p)   { return p->t[p->pos++]; }
static int pe(Pr *p, TT tt) { if(pt(p)==tt){p->pos++;return 1;} return 0; }

static Node *pe_expr(Pr *p);
static Node *pe_block(Pr *p);
static Node *pe_stmt(Pr *p);

static Node *pe_primary(Pr *p) {
    if (pt(p)==T_INT)    { Node *n=nd(ND_INT);  n->ival=pa(p).ival; return n; }
    if (pt(p)==T_MINUS)  { pa(p); Node *n=nd(ND_UNOP); n->op=OP_NEG; n->a=pe_primary(p); return n; }
    if (pt(p)==T_LPAREN) { pa(p); Node *n=pe_expr(p); pe(p,T_RPAREN); return n; }
    if (pt(p)==T_IDENT)  {
        Tok id=pa(p);
        if (pt(p)==T_LPAREN) {
            pa(p);
            Node *n=nd(ND_CALL); strncpy(n->name,id.name,63);
            while (pt(p)!=T_RPAREN&&pt(p)!=T_EOF) { nl_push(n,pe_expr(p)); pe(p,T_COMMA); }
            pe(p,T_RPAREN); return n;
        }
        Node *n=nd(ND_VAR); strncpy(n->name,id.name,63); return n;
    }
    Node *n=nd(ND_INT); pa(p); return n;
}

static Node *pe_mul(Pr *p) {
    Node *l=pe_primary(p);
    while (pt(p)==T_STAR||pt(p)==T_SLASH||pt(p)==T_PERCENT) {
        int op=pt(p)==T_STAR?OP_MUL:pt(p)==T_SLASH?OP_DIV:OP_MOD; pa(p);
        Node *n=nd(ND_BINOP); n->op=op; n->a=l; n->b=pe_primary(p); l=n;
    }
    return l;
}
static Node *pe_add(Pr *p) {
    Node *l=pe_mul(p);
    while (pt(p)==T_PLUS||pt(p)==T_MINUS) {
        int op=pt(p)==T_PLUS?OP_ADD:OP_SUB; pa(p);
        Node *n=nd(ND_BINOP); n->op=op; n->a=l; n->b=pe_mul(p); l=n;
    }
    return l;
}
static Node *pe_cmp(Pr *p) {
    Node *l=pe_add(p);
    int op=0;
    TT tt=pt(p);
    if      (tt==T_EQEQ) op=OP_EQ;
    else if (tt==T_NEQ)  op=OP_NEQ;
    else if (tt==T_LT)   op=OP_LT;
    else if (tt==T_LE)   op=OP_LE;
    else if (tt==T_GT)   op=OP_GT;
    else if (tt==T_GE)   op=OP_GE;
    if (op) { pa(p); Node *n=nd(ND_BINOP); n->op=op; n->a=l; n->b=pe_add(p); l=n; }
    return l;
}
static Node *pe_not(Pr *p) {
    if (pt(p)==T_NOT) { pa(p); Node *n=nd(ND_UNOP); n->op=OP_NOT; n->a=pe_not(p); return n; }
    return pe_cmp(p);
}
static Node *pe_and(Pr *p) {
    Node *l=pe_not(p);
    while (pt(p)==T_AND) { pa(p); Node *n=nd(ND_BINOP); n->op=OP_AND; n->a=l; n->b=pe_not(p); l=n; }
    return l;
}
static Node *pe_expr(Pr *p) {
    Node *l=pe_and(p);
    while (pt(p)==T_OR) { pa(p); Node *n=nd(ND_BINOP); n->op=OP_OR; n->a=l; n->b=pe_and(p); l=n; }
    return l;
}

static Node *pe_block(Pr *p) {
    Node *bl=nd(ND_BLOCK); pe(p,T_INDENT);
    while (pt(p)!=T_DEDENT&&pt(p)!=T_EOF) { Node *s=pe_stmt(p); if(s) nl_push(bl,s); }
    pe(p,T_DEDENT);
    return bl;
}

static Node *pe_if(Pr *p) { /* handles both T_IF and T_ELIF */
    pa(p); /* consume IF or ELIF */
    Node *n=nd(ND_IF);
    n->a=pe_expr(p); pe(p,T_COLON); pe(p,T_NEWLINE);
    n->b=pe_block(p);
    while (pt(p)==T_NEWLINE) pa(p);
    if (pt(p)==T_ELIF) {
        Node *el=nd(ND_BLOCK); nl_push(el,pe_if(p)); n->c=el;
    } else if (pt(p)==T_ELSE) {
        pa(p); pe(p,T_COLON); pe(p,T_NEWLINE); n->c=pe_block(p);
    }
    return n;
}

static Node *pe_stmt(Pr *p) {
    while (pt(p)==T_NEWLINE) pa(p);
    if (pt(p)==T_EOF||pt(p)==T_DEDENT) return NULL;

    if (pt(p)==T_DEF) {
        pa(p);
        Node *n=nd(ND_FUNC); strncpy(n->name,p->t[p->pos].name,63); pa(p);
        pe(p,T_LPAREN);
        while (pt(p)!=T_RPAREN&&pt(p)!=T_EOF) { ns_push(n,p->t[p->pos].name); pa(p); pe(p,T_COMMA); }
        pe(p,T_RPAREN); pe(p,T_COLON); pe(p,T_NEWLINE);
        n->b=pe_block(p);
        return n;
    }
    if (pt(p)==T_IF||pt(p)==T_ELIF) return pe_if(p);
    if (pt(p)==T_WHILE) {
        pa(p); Node *n=nd(ND_WHILE);
        n->a=pe_expr(p); pe(p,T_COLON); pe(p,T_NEWLINE); n->b=pe_block(p);
        return n;
    }
    if (pt(p)==T_RETURN) {
        pa(p); Node *n=nd(ND_RETURN);
        if (pt(p)!=T_NEWLINE&&pt(p)!=T_EOF) n->a=pe_expr(p);
        pe(p,T_NEWLINE); return n;
    }
    if (pt(p)==T_PRINT) {
        pa(p); Node *n=nd(ND_PRINT);
        pe(p,T_LPAREN); n->a=pe_expr(p); pe(p,T_RPAREN); pe(p,T_NEWLINE);
        return n;
    }
    if (pt(p)==T_IDENT) {
        int saved=p->pos; Tok id=pa(p);
        if (pt(p)==T_ASSIGN) {
            pa(p); Node *n=nd(ND_ASSIGN); strncpy(n->name,id.name,63);
            n->a=pe_expr(p); pe(p,T_NEWLINE); return n;
        }
        p->pos=saved;
    }
    /* expression statement */
    Node *e=pe_expr(p); pe(p,T_NEWLINE); return e;
}

static Node *parse_prog(Tok *toks) {
    Pr p={toks,0}; Node *bl=nd(ND_BLOCK);
    while (pt(&p)!=T_EOF) { Node *s=pe_stmt(&p); if(s) nl_push(bl,s); }
    return bl;
}

/* ================================================================ INTERPRETER ================================================================ */

typedef struct Var { char name[64]; int64_t val; struct Var *next; } Var;
typedef struct { Var *vars; } Env;
typedef struct FD { char name[64]; Node *fn; struct FD *next; } FD;

typedef struct {
    FD      *funcs;
    Env      global;
    char    *out; size_t out_len, out_cap;
    int      returning;
    int64_t  ret_val;
} IP;

static void emit(IP *ip, int64_t v) {
    char buf[32]; int n=snprintf(buf,sizeof(buf),"%lld\n",(long long)v);
    if (ip->out_len+n+1>ip->out_cap) {
        ip->out_cap=(ip->out_cap+n+1)*2; ip->out=realloc(ip->out,ip->out_cap);
    }
    memcpy(ip->out+ip->out_len,buf,n); ip->out_len+=n; ip->out[ip->out_len]='\0';
}

static void var_set(Env *e, const char *nm, int64_t v) {
    for (Var *x=e->vars;x;x=x->next) if(!strcmp(x->name,nm)){x->val=v;return;}
    Var *x=malloc(sizeof(*x)); strncpy(x->name,nm,63); x->val=v; x->next=e->vars; e->vars=x;
}
static int var_get(Env *e, const char *nm, int64_t *out) {
    for (Var *x=e->vars;x;x=x->next) if(!strcmp(x->name,nm)){*out=x->val;return 1;}
    return 0;
}
static void env_free(Env *e) {
    Var *v=e->vars; while(v){Var *n=v->next;free(v);v=n;} e->vars=NULL;
}

static int64_t eval(IP *ip, Env *loc, Node *n);
static void exec(IP *ip, Env *loc, Node *bl);

static int64_t call_func(IP *ip, Env *caller, Node *cn) {
    FD *fd=NULL;
    for (FD *f=ip->funcs;f;f=f->next) if(!strcmp(f->name,cn->name)){fd=f;break;}
    if (!fd) return 0;
    Node *fn=fd->fn;
    Env loc={NULL};
    for (int i=0;i<fn->nslist&&i<cn->nlist;i++)
        var_set(&loc,fn->slist[i], eval(ip,caller,cn->list[i]));
    ip->returning=0;
    exec(ip,&loc,fn->b);
    int64_t ret=ip->returning?ip->ret_val:0;
    ip->returning=0; env_free(&loc);
    return ret;
}

static int64_t eval(IP *ip, Env *loc, Node *n) {
    switch(n->kind) {
    case ND_INT: return n->ival;
    case ND_VAR: {
        int64_t v=0;
        if (loc!=&ip->global && var_get(loc,n->name,&v)) return v;
        var_get(&ip->global,n->name,&v); return v;
    }
    case ND_UNOP: {
        int64_t a=eval(ip,loc,n->a);
        return n->op==OP_NEG ? -a : !a;
    }
    case ND_BINOP: {
        int64_t a=eval(ip,loc,n->a);
        if (n->op==OP_AND) { if(!a) return 0; return eval(ip,loc,n->b)?1:0; }
        if (n->op==OP_OR)  { if(a)  return 1; return eval(ip,loc,n->b)?1:0; }
        int64_t b=eval(ip,loc,n->b);
        switch(n->op){
        case OP_ADD: return a+b; case OP_SUB: return a-b;
        case OP_MUL: return a*b; case OP_DIV: return b?a/b:0;
        case OP_MOD: return b?a%b:0;
        case OP_EQ:  return a==b; case OP_NEQ: return a!=b;
        case OP_LT:  return a<b;  case OP_LE:  return a<=b;
        case OP_GT:  return a>b;  case OP_GE:  return a>=b;
        }
        return 0;
    }
    case ND_CALL: return call_func(ip,loc,n);
    default: return 0;
    }
}

static void exec(IP *ip, Env *loc, Node *bl) {
    for (int i=0;i<bl->nlist&&!ip->returning;i++) {
        Node *s=bl->list[i]; if(!s) continue;
        switch(s->kind) {
        case ND_ASSIGN: var_set(loc,s->name,eval(ip,loc,s->a)); break;
        case ND_PRINT:  emit(ip,eval(ip,loc,s->a)); break;
        case ND_RETURN: ip->returning=1; ip->ret_val=s->a?eval(ip,loc,s->a):0; return;
        case ND_IF: {
            int64_t cond=eval(ip,loc,s->a);
            if (cond) exec(ip,loc,s->b);
            else if (s->c) exec(ip,loc,s->c);
            break;
        }
        case ND_WHILE:
            while (!ip->returning&&eval(ip,loc,s->a)) exec(ip,loc,s->b);
            break;
        case ND_FUNC: {
            FD *fd=malloc(sizeof(*fd)); strncpy(fd->name,s->name,63); fd->fn=s;
            fd->next=ip->funcs; ip->funcs=fd; break;
        }
        case ND_CALL: call_func(ip,loc,s); break;
        default: break;
        }
    }
}

/* ================================================================ PUBLIC API ================================================================ */

struct Interpreter { int _; };
Interpreter *interp_create(void) { return malloc(sizeof(Interpreter)); }

char *interp_run(Interpreter *interp, const char *source) {
    (void)interp;
    TArr ta=lex(source);
    Node *prog=parse_prog(ta.t);

    IP ip={0};
    ip.out_cap=256; ip.out=malloc(ip.out_cap); ip.out[0]='\0';
    exec(&ip,&ip.global,prog);

    free(ta.t);
    env_free(&ip.global);
    FD *f=ip.funcs; while(f){FD *n=f->next;free(f);f=n;}
    return ip.out;
}

void interp_destroy(Interpreter *interp) { free(interp); }

