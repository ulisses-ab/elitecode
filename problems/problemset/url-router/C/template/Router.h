#ifndef ROUTER_H
#define ROUTER_H

#define ROUTE_MAX_PARAMS 16

typedef struct {
    char pattern[512];
    char param_keys[ROUTE_MAX_PARAMS][64];
    char param_vals[ROUTE_MAX_PARAMS][512];
    int  param_count;
} RouteMatch;

typedef struct Router Router;

Router    *router_create(void);
void       router_register(Router *r, const char *method, const char *pattern);
RouteMatch router_match(const Router *r, const char *method, const char *url);
void       router_destroy(Router *r);

#endif
