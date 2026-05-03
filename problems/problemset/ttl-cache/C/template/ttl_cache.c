#include <stdlib.h>
#include "TTLCache.h"

struct TTLCache {
    long long clock; /* current time in ms */
    /* add your fields here */
};

TTLCache *ttlcache_create(void) {
    TTLCache *c = malloc(sizeof(*c));
    c->clock = 0;
    return c;
}

void ttlcache_set(TTLCache *c, const char *key, const char *value, long long ttl) {
    /* TODO */
    (void)c; (void)key; (void)value; (void)ttl;
}

const char *ttlcache_get(TTLCache *c, const char *key) {
    /* TODO */
    (void)c; (void)key;
    return NULL;
}

void ttlcache_del(TTLCache *c, const char *key) {
    /* TODO */
    (void)c; (void)key;
}

int ttlcache_size(TTLCache *c) {
    /* TODO */
    (void)c;
    return 0;
}

void ttlcache_tick(TTLCache *c, long long delta) {
    c->clock += delta;
}

void ttlcache_destroy(TTLCache *c) {
    free(c);
}
