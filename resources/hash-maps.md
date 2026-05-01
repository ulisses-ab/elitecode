# Hash Maps

A hash map (hash table) stores key-value pairs and supports average O(1) lookup, insertion, and deletion. It is one of the most widely used data structures in systems and application programming.

## How it works

A hash function converts a key into an integer, which is then reduced modulo the table's capacity to produce a bucket index. The value is stored in that bucket. On lookup, the same hash function is applied to find the bucket, and the value is retrieved directly.

The critical property a hash function must have is uniformity — it should spread keys evenly across buckets so that no single bucket becomes a bottleneck. Good hash functions also run in O(1) time and are deterministic.

## Collision resolution

Two distinct keys can map to the same bucket — this is called a collision. The two standard strategies for handling collisions are:

**Chaining** stores a linked list at each bucket. Colliding entries are appended to the list and scanned linearly on lookup. This keeps the table simple but adds pointer overhead.

**Open addressing** stores all entries in the array itself. When a collision occurs, a probe sequence (linear, quadratic, or double-hashing) finds the next free slot. Lookup follows the same sequence until it finds the key or an empty slot.

## Load factor and resizing

The load factor is the ratio of stored entries to table capacity. As it grows, collisions become more frequent and performance degrades. Most implementations resize — typically doubling capacity — when the load factor crosses a threshold (around 0.75 for chained tables, 2/3 for open addressing). All existing entries are rehashed into the new array.

Resizing is O(n) but happens infrequently enough that the amortised cost per insertion remains O(1).

## Ordered variants

A standard hash map gives no guarantee about iteration order. An ordered map (such as Python's `OrderedDict` or Java's `LinkedHashMap`) additionally maintains a doubly linked list through all entries in insertion order. This makes it possible to find and evict the least-recently-used entry in O(1), which is why ordered maps are the standard building block for LRU caches.

## Complexity summary

| Operation | Average | Worst case |
|---|---|---|
| Lookup | O(1) | O(n) |
| Insert | O(1) amortised | O(n) |
| Delete | O(1) | O(n) |

The worst case occurs only when all keys collide — a situation that a good hash function and resizing policy make vanishingly unlikely in practice.
