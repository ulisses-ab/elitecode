#include <stdlib.h>
#include <string.h>
#include "Map.h"

#define NBUCKETS 4096

typedef struct Slot {
    char *key, *val;
    struct Slot *next;
} Slot;

struct Map {
    Slot *buckets[NBUCKETS];
    int count;
};

static unsigned hash_str(const char *s) {
    unsigned h = 5381;
    while (*s) h = h * 33 ^ (unsigned char)*s++;
    return h % NBUCKETS;
}

Map *map_create(void) { return calloc(1, sizeof(Map)); }

void map_set(Map *m, const char *key, const char *val) {
    unsigned h = hash_str(key);
    for (Slot *s = m->buckets[h]; s; s = s->next) {
        if (strcmp(s->key, key) == 0) { free(s->val); s->val = strdup(val); return; }
    }
    Slot *s = malloc(sizeof(*s));
    s->key = strdup(key); s->val = strdup(val);
    s->next = m->buckets[h]; m->buckets[h] = s;
    m->count++;
}

const char *map_get(const Map *m, const char *key) {
    unsigned h = hash_str(key);
    for (Slot *s = m->buckets[h]; s; s = s->next)
        if (strcmp(s->key, key) == 0) return s->val;
    return NULL;
}

int map_size(const Map *m) { return m->count; }

void map_destroy(Map *m) {
    for (int i = 0; i < NBUCKETS; i++)
        for (Slot *s = m->buckets[i], *n; s; s = n) {
            n = s->next; free(s->key); free(s->val); free(s);
        }
    free(m);
}
