# TTL & Cache Eviction Strategies

## What is a cache?

A cache is a fast, bounded store that sits in front of a slower authoritative source. When a requested item is in the cache (a cache hit), it is served immediately. When it is not (a cache miss), the item is fetched from the underlying store and optionally inserted into the cache for future requests.

Because a cache is bounded, it must decide which items to keep when it fills up. This decision is the eviction policy.

## TTL — Time-To-Live

A TTL is a duration after which a cached item is considered stale and should no longer be served. It is expressed either as an absolute expiry timestamp or as a relative duration from the time of insertion.

TTL prevents the cache from serving indefinitely outdated data. Once an item expires, the next request for it is treated as a cache miss and the item is refreshed from the source.

### Lazy expiration

With lazy expiration, expired items are not removed proactively. They are detected and discarded at the moment of access — the getter checks the current time against the stored expiry and returns nothing if the item has expired.

This is simple to implement and adds no background overhead, but stale entries accumulate in memory until they happen to be accessed. In a cache with many infrequently accessed keys, this can waste significant space.

### Eager expiration

A background process periodically scans the store for expired entries and removes them. This keeps memory consumption bounded and predictable, at the cost of added complexity and the overhead of the sweep.

Production systems typically combine both: lazy expiration on access (for correctness) plus periodic sweeping (to reclaim memory from entries that would otherwise never be accessed again).

## Eviction policies

When the cache is full and a new item must be inserted, one existing item must be evicted. The choice of which item to evict is the eviction policy.

**LRU (Least Recently Used)** evicts the item that was accessed least recently. The intuition is that items accessed recently are more likely to be needed again soon. LRU is the most common general-purpose policy.

**LFU (Least Frequently Used)** evicts the item that has been accessed the fewest times total. It performs better than LRU for access patterns with stable hot items, but requires more bookkeeping and can be slow to adapt to changing workloads.

**FIFO (First In, First Out)** evicts the oldest inserted item regardless of how often it has been accessed. Simple but often a poor predictor of future utility.

**TTL-ordered** evicts the item that will expire soonest. Useful when all items have TTLs and you want to maximise the fraction of non-expired items in the cache.

**Random** evicts a randomly chosen item. Surprisingly competitive in practice and extremely cheap to implement.

## Implementing LRU

An LRU cache requires two operations in O(1): look up an item by key, and move an accessed item to the "most recently used" position. A hash map combined with a doubly linked list satisfies both requirements. The map provides O(1) lookup; the linked list maintains the recency order and allows O(1) splicing of any node to the front. Eviction removes the tail node — the least recently used.

In Python, `collections.OrderedDict` provides this combination built-in, exposing a `move_to_end` method for O(1) promotion.

## Interaction between TTL and eviction

TTL and eviction policies are orthogonal and are typically used together. TTL ensures correctness (no stale data); the eviction policy ensures the cache stays within its memory budget. An item can be removed either because it expired (TTL) or because the cache is full and the policy selected it for eviction — whichever comes first.
