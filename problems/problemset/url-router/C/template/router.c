#include <stdlib.h>
#include <string.h>
#include "Router.h"

struct Router {
    /* add your fields here */
};

Router *router_create(void) {
    Router *r = malloc(sizeof(*r));
    return r;
}

void router_register(Router *r, const char *method, const char *pattern) {
    /* TODO */
    (void)r; (void)method; (void)pattern;
}

RouteMatch router_match(const Router *r, const char *method, const char *url) {
    /* TODO: return a RouteMatch with pattern[0]=='\0' if no match */
    RouteMatch m = {0};
    (void)r; (void)method; (void)url;
    return m;
}

void router_destroy(Router *r) {
    free(r);
}
