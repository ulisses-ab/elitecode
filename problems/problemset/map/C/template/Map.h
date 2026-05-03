#ifndef MAP_H
#define MAP_H

/* Implement a hash map without using any standard library hash/tree containers. */

typedef struct Map Map;

Map       *map_create(void);
void       map_set(Map *m, const char *key, const char *val);
const char *map_get(const Map *m, const char *key); /* NULL if not found */
int        map_size(const Map *m);
void       map_destroy(Map *m);

#endif
