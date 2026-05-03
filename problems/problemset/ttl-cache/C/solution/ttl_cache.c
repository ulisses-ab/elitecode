#include <stdlib.h>
#include <string.h>
#include "TTLCache.h"

#define NBUCKETS 2048

typedef struct Entry {
    char *key, *value;
    long long expires_at;
    struct Entry *next;
} Entry;

struct TTLCache {
    long long clock;
    Entry *buckets[NBUCKETS];
};

static unsigned hash_str(const char *s) {
    unsigned h = 5381;
    while (*s) h = h * 33 ^ (unsigned char)*s++;
    return h % NBUCKETS;
}

TTLCache *ttlcache_create(void) { return calloc(1, sizeof(TTLCache)); }

void ttlcache_set(TTLCache *c, const char *key, const char *value, long long ttl) {
    unsigned h = hash_str(key);
    for (Entry *e = c->buckets[h]; e; e = e->next) {
        if (strcmp(e->key, key) == 0) {
            free(e->value);
            e->value = strdup(value);
            e->expires_at = c->clock + ttl;
            return;
        }
    }
    Entry *e = malloc(sizeof(*e));
    e->key = strdup(key); e->value = strdup(value);
    e->expires_at = c->clock + ttl;
    e->next = c->buckets[h];
    c->buckets[h] = e;
}

const char *ttlcache_get(TTLCache *c, const char *key) {
    unsigned h = hash_str(key);
    for (Entry *e = c->buckets[h]; e; e = e->next)
        if (strcmp(e->key, key) == 0)
            return c->clock < e->expires_at ? e->value : NULL;
    return NULL;
}

void ttlcache_del(TTLCache *c, const char *key) {
    unsigned h = hash_str(key);
    Entry **pp = &c->buckets[h];
    while (*pp) {
        if (strcmp((*pp)->key, key) == 0) {
            Entry *e = *pp; *pp = e->next;
            free(e->key); free(e->value); free(e);
            return;
        }
        pp = &(*pp)->next;
    }
}

int ttlcache_size(TTLCache *c) {
    int n = 0;
    for (int i = 0; i < NBUCKETS; i++)
        for (Entry *e = c->buckets[i]; e; e = e->next)
            if (c->clock < e->expires_at) n++;
    return n;
}

void ttlcache_tick(TTLCache *c, long long delta) { c->clock += delta; }

void ttlcache_destroy(TTLCache *c) {
    for (int i = 0; i < NBUCKETS; i++)
        for (Entry *e = c->buckets[i], *n; e; e = n) {
            n = e->next; free(e->key); free(e->value); free(e);
        }
    free(c);
}
