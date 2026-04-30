Implement an **in-memory key-value cache with TTL (time-to-live) expiration**.

A key set with a TTL of `ttl` milliseconds expires at time `setTime + ttl`. Getting a key at or after its expiry time returns an empty string. The cache uses a **simulated clock** advanced with `tick`.

Implement a `TTLCache` class with:

- `TTLCache()` — constructor, starts at time `0`.
- `void set(const std::string& key, const std::string& value, long long ttl)` — store `key = value`, expiring `ttl` ms from now. Overwrites existing entries.
- `std::string get(const std::string& key)` — return the value if the key exists and has not expired, otherwise return `""`.
- `void del(const std::string& key)` — remove a key (no-op if it doesn't exist).
- `int size()` — return the number of non-expired keys.
- `void tick(long long delta)` — advance the internal clock by `delta` milliseconds.

## Example

```
TTLCache cache;
cache.set("session", "abc", 1000);  // expires at t=1000
cache.get("session")                // "abc"  (t=0, alive)
cache.tick(999);
cache.get("session")                // "abc"  (t=999, alive)
cache.tick(1);
cache.get("session")                // ""     (t=1000, expired)
cache.size()                        // 0
```

## Constraints

- Keys and values are non-empty strings of lowercase letters and digits, max length 32.
- `1 <= ttl <= 10^12`
- `1 <= delta <= 10^9` per `tick` call
- At most `10^5` operations total
