#include <stdlib.h>
#include <string.h>
#include "Map.h"

struct Map {
    /* add your fields here */
};

Map *map_create(void) {
    Map *m = malloc(sizeof(*m));
    return m;
}

void map_set(Map *m, const char *key, const char *val) {
    /* TODO */
    (void)m; (void)key; (void)val;
}

const char *map_get(const Map *m, const char *key) {
    /* TODO */
    (void)m; (void)key;
    return NULL;
}

int map_size(const Map *m) {
    /* TODO */
    (void)m;
    return 0;
}

void map_destroy(Map *m) {
    free(m);
}
