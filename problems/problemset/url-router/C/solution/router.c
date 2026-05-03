#define _POSIX_C_SOURCE 200809L
#include <stdlib.h>
#include <string.h>
#include "Router.h"

#define MAX_ROUTES 400
#define MAX_SEGS   12

typedef struct {
    char method[16];
    char pattern[512];
    int  nseg;
    int  is_param[MAX_SEGS];
    char seg_lit[MAX_SEGS][128];   /* literal value (if !is_param) */
    char seg_name[MAX_SEGS][64];   /* param name  (if is_param) */
} Route;

struct Router {
    Route *routes;
    int    count, cap;
};

static int split_path(const char *path, char out[][128], int max) {
    int n = 0;
    const char *p = path;
    while (*p == '/') p++;
    while (*p && n < max) {
        int i = 0;
        while (*p && *p != '/') out[n][i++] = *p++;
        out[n++][i] = '\0';
        if (*p == '/') p++;
    }
    return n;
}

Router *router_create(void) {
    Router *r = malloc(sizeof(*r));
    r->cap = 16; r->count = 0;
    r->routes = malloc(r->cap * sizeof(Route));
    return r;
}

void router_register(Router *r, const char *method, const char *pattern) {
    if (r->count == r->cap) {
        r->cap *= 2;
        r->routes = realloc(r->routes, r->cap * sizeof(Route));
    }
    Route *rt = &r->routes[r->count++];
    strncpy(rt->method,  method,  15);
    strncpy(rt->pattern, pattern, 511);

    char segs[MAX_SEGS][128];
    rt->nseg = split_path(pattern, segs, MAX_SEGS);
    for (int i = 0; i < rt->nseg; i++) {
        if (segs[i][0] == ':') {
            rt->is_param[i] = 1;
            strncpy(rt->seg_name[i], segs[i] + 1, 63);
        } else {
            rt->is_param[i] = 0;
            strncpy(rt->seg_lit[i], segs[i], 127);
        }
    }
}

/* Compare two matching routes: returns 1 if a beats b (higher priority). */
static int beats(const Route *a, const Route *b) {
    for (int i = 0; i < a->nseg; i++) {
        int as = !a->is_param[i], bs = !b->is_param[i];
        if (as > bs) return 1;
        if (as < bs) return 0;
    }
    return 0;
}

RouteMatch router_match(const Router *r, const char *method, const char *url) {
    RouteMatch best = {0};
    const Route *best_rt = NULL;

    char url_segs[MAX_SEGS][128];
    int  url_nseg = split_path(url, url_segs, MAX_SEGS);

    for (int i = 0; i < r->count; i++) {
        const Route *rt = &r->routes[i];
        if (strcmp(rt->method, method) != 0) continue;
        if (rt->nseg != url_nseg) continue;

        char tmp_keys[ROUTE_MAX_PARAMS][64];
        char tmp_vals[ROUTE_MAX_PARAMS][512];
        int  pc = 0, ok = 1;

        for (int j = 0; j < rt->nseg; j++) {
            if (rt->is_param[j]) {
                strncpy(tmp_keys[pc], rt->seg_name[j], 63);
                strncpy(tmp_vals[pc], url_segs[j],     511);
                pc++;
            } else if (strcmp(rt->seg_lit[j], url_segs[j]) != 0) {
                ok = 0; break;
            }
        }
        if (!ok) continue;

        if (!best_rt || beats(rt, best_rt)) {
            best_rt = rt;
            strncpy(best.pattern, rt->pattern, 511);
            best.param_count = pc;
            for (int j = 0; j < pc; j++) {
                strncpy(best.param_keys[j], tmp_keys[j], 63);
                strncpy(best.param_vals[j], tmp_vals[j], 511);
            }
        }
    }
    return best;
}

void router_destroy(Router *r) { free(r->routes); free(r); }
