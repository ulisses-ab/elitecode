#ifndef TTL_CACHE_H
#define TTL_CACHE_H

typedef struct TTLCache TTLCache;

TTLCache   *ttlcache_create(void);
void        ttlcache_set(TTLCache *c, const char *key, const char *value, long long ttl);
const char *ttlcache_get(TTLCache *c, const char *key); /* NULL if not found / expired */
void        ttlcache_del(TTLCache *c, const char *key);
int         ttlcache_size(TTLCache *c);
void        ttlcache_tick(TTLCache *c, long long delta); /* advance internal clock by delta ms */
void        ttlcache_destroy(TTLCache *c);

#endif
