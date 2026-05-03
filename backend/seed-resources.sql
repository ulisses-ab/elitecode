DO $$
DECLARE
  r1 text := gen_random_uuid()::text;
  r2 text := gen_random_uuid()::text;
  r3 text := gen_random_uuid()::text;
  r4 text := gen_random_uuid()::text;
  r5 text := gen_random_uuid()::text;
  r6 text := gen_random_uuid()::text;
  r7 text := gen_random_uuid()::text;
  r8 text := gen_random_uuid()::text;
  r9 text := gen_random_uuid()::text;
  r10 text := gen_random_uuid()::text;

  -- problem ids
  p_chess      text := 'f562c077-42e7-4dd1-8386-5507edfa03e0';
  p_expr       text := '40d97a22-0db4-42ad-a2df-56d355386f67';
  p_rate       text := '90d728ea-5b55-4f19-8f7a-3da56844869c';
  p_interp     text := 'b98b07a9-88ac-4ec9-83f9-d78909089b22';
  p_ttl        text := '80667cb6-423d-4130-95db-97e402873181';
  p_router     text := 'c750e095-3ead-498a-9957-93276e188daf';
  p_vfs        text := 'bed550dc-ab6c-4dec-9150-f32ad9d9b187';
  p_redis      text := '40e2f8cc-70c6-412c-8961-051179e7b19c';
BEGIN

-- ── Resources ─────────────────────────────────────────────────────────────────

INSERT INTO "Resource" (id, title, content, "order", "createdAt", "updatedAt") VALUES
(r1, 'Sliding Window Technique', $content$
A sliding window is a contiguous subrange that moves through a larger sequence. Instead of reprocessing the entire range on every step, you maintain a running result and update it incrementally as the window advances — adding whatever enters the front and removing whatever falls out the back.

## Fixed-size windows

When the window size is constant, each step is a simple exchange: subtract the element leaving the left edge and add the element entering the right edge. This turns what would be an O(n·k) scan into a single O(n) pass.

The pattern appears in problems like maximum sum subarray of size k, average of every k consecutive elements, and any query that asks about a fixed-width slice of a sequence.

## Variable-size windows

When the window can grow or shrink, you expand the right boundary to explore and contract the left boundary to restore a violated invariant. The key insight is that each element is added once and removed at most once, so the total work remains linear even though the window size changes dynamically.

This variant solves problems like longest substring without repeating characters, smallest subarray with sum ≥ target, and minimum window substring.

## Time-based windows

In systems problems, the window is defined by a time range rather than an element count — for example, "at most N requests in the last 60 seconds." The structure is the same: maintain a queue of timestamps, evict entries older than the window boundary on every operation, and check whether the remaining count satisfies the limit.

Because entries are added to one end and removed from the other, a double-ended queue is the natural backing data structure. Each timestamp is enqueued once and dequeued once, giving O(1) amortised cost per operation.

## Why it works

The core insight behind every sliding window is that you are exploiting monotonicity — either the window size is fixed, or moving the left boundary can only make things worse in one direction (shrink the count, reduce the sum, etc.). This lets you reason about the window with a two-pointer approach instead of exhaustive search.

## Complexity

Fixed-size windows run in O(n) time and O(1) extra space. Variable-size windows also run in O(n) time but may require O(k) space for the auxiliary structure tracking what is currently in the window. Time-based windows use O(limit) space bounded by the maximum number of entries that can be inside the window simultaneously.
$content$, 0, NOW(), NOW()),

(r2, 'Queue & Deque Data Structures', $content$
## Queue

A queue is a First-In, First-Out (FIFO) data structure. Elements are added at the back and removed from the front, so the element that has been waiting the longest is always served next.

The three fundamental operations are enqueue (add to back), dequeue (remove from front), and peek (inspect the front without removing it). All three run in O(1) time with a linked-list or circular-array implementation.

Queues appear naturally whenever you need to process items in arrival order — BFS traversal, job scheduling, request buffers, and message passing between concurrent components are all queue-shaped problems.

## Deque

A deque (double-ended queue) generalises the queue by supporting O(1) insertion and removal at both ends. This makes it more flexible: it can act as a stack (last-in, first-out) by operating on one end, as a queue by operating on opposite ends, or as a sliding window by adding to the right and evicting from the left.

## Monotonic deque

A monotonic deque maintains its elements in sorted order by evicting from the appropriate end whenever a new element violates the ordering invariant. This lets you answer "what is the maximum (or minimum) in the current window?" in O(1) per step, because the front of the deque always holds the answer.

The eviction rule is the key: before enqueueing a new element, pop from the back any elements that are smaller (for a max-deque) or larger (for a min-deque) than the incoming element — they can never be the answer for any future window that includes the new element.

## Relationship to the call stack

A stack is a deque restricted to one end — Last-In, First-Out (LIFO). The call stack in every programming language is a stack: function frames are pushed on call and popped on return. Understanding this makes it easy to convert recursive algorithms to iterative ones by maintaining an explicit stack.

## Complexity summary

| Operation | Queue (linked list) | Deque |
|---|---|---|
| Push front | — | O(1) |
| Push back | O(1) | O(1) |
| Pop front | O(1) | O(1) |
| Pop back | — | O(1) |
| Peek | O(1) | O(1) |
$content$, 1, NOW(), NOW()),

(r3, 'Hash Maps In Depth', $content$
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
$content$, 0, NOW(), NOW()),

(r4, 'Trees & Tries', $content$
## Trees

A tree is a hierarchical data structure made up of nodes connected by edges, where every node except the root has exactly one parent. Trees are acyclic by definition — there are no cycles in the parent-child relationships.

Key terminology:

- **Root** — the single top-level node with no parent.
- **Leaf** — a node with no children.
- **Internal node** — any non-leaf node.
- **Depth** — the number of edges from the root to a node.
- **Height** — the number of edges on the longest path from a node to a leaf.
- **N-ary tree** — a tree where each node may have up to N children.

### File systems as trees

A hierarchical file system is a natural tree. Directories are internal nodes and files are leaves. The root is the top-level directory. Every file has a unique absolute path, which is just the sequence of node names from root to leaf — a path through the tree.

Operations like "find all files matching a pattern" or "calculate total size of a directory" are tree traversals. Because each node is visited once, they run in O(n) time proportional to the number of nodes.

### Tree traversal orders

**Pre-order** visits a node before visiting its children. Useful for serialising a tree or computing properties that depend on ancestors (e.g. absolute paths from relative names).

**Post-order** visits a node after all its children have been visited. Useful for computing properties that depend on descendants (e.g. subtree size, disk usage).

**Level-order** (BFS) visits all nodes at depth d before visiting nodes at depth d+1. Useful when you care about the nearest match or minimum depth.

---

## Tries (Prefix Trees)

A trie is a tree that stores strings by distributing their characters across the tree's edges. Every path from the root to a marked node spells out a stored string. Nodes at the same depth share the same prefix.

This structure makes prefix operations extremely efficient. Checking whether any stored string starts with a given prefix takes O(m) time where m is the prefix length, regardless of how many strings are stored.

### Why tries work for routing

A URL router must match an incoming path like `/api/users/42/posts` against a set of registered route patterns. A trie indexed by path segments (splitting on `/`) reduces each lookup to a sequence of child-pointer dereferences — one per segment. This is O(depth) regardless of the total number of routes, which is much better than scanning every pattern linearly.

Wildcards (`:userId`, `*`) are handled by adding special child types that match any segment.

### Complexity

| Operation | Time |
|---|---|
| Insert a string of length m | O(m) |
| Lookup a string of length m | O(m) |
| Find all strings with prefix p | O(p + results) |

Space is O(total characters stored), with sharing across common prefixes.
$content$, 1, NOW(), NOW()),

(r5, 'Recursion & The Call Stack', $content$
## What recursion is

A function is recursive when it calls itself as part of its own definition. Every recursive solution consists of two parts: a base case that produces a result directly without further recursion, and a recursive case that reduces the problem to a smaller version of itself and combines the results.

The key question when designing a recursive solution is: if I already had the answer for a smaller input, how would I construct the answer for the current input?

## The call stack

Each function call creates a stack frame that holds the function's local variables, parameters, and the address to return to when the function finishes. These frames are stored on the call stack — a LIFO structure managed automatically by the runtime.

When a recursive function calls itself, a new frame is pushed onto the stack. When it returns, the frame is popped and control returns to the caller. Deep recursion therefore uses O(depth) stack space, which is why very deep recursion risks a stack overflow.

## Recursion and tree structures

Tree-shaped problems are where recursion shines most clearly. A tree is naturally recursive — each subtree is itself a tree of the same kind. This means a function that works on a tree almost always has the form: handle the base case (null or leaf), recursively process the children, then combine the results.

File system traversal, expression evaluation, and game tree search all have this structure. The recursive call mirrors the tree's structure exactly, which makes the code direct and easy to reason about.

## Converting recursion to iteration

Any recursive algorithm can be rewritten iteratively by maintaining an explicit stack. You push what would have been a recursive call's arguments onto the stack, then pop and process them in a loop. This gives you control over memory usage and avoids stack-overflow limits, at the cost of more verbose code.

The reverse is also true: iterative algorithms that use an explicit stack can often be expressed more cleanly as recursion.

## Memoisation

When the same subproblem appears multiple times in the recursion tree, recomputing it is wasteful. Memoisation stores the result of each subproblem the first time it is computed and returns the cached result on subsequent calls. This transforms exponential recursion into polynomial time for problems with overlapping subproblems — a technique that underpins dynamic programming.

## Tail calls

A tail call is a recursive call that is the very last operation in the function — the caller does nothing with the result except return it. Some languages optimise tail calls by reusing the current stack frame instead of creating a new one, turning what would be O(n) stack usage into O(1). Python does not perform this optimisation, so deep tail-recursive functions still need to be converted to iteration.

## Common pitfalls

- Forgetting the base case, causing infinite recursion.
- A base case that is correct but not reached for some inputs.
- Modifying shared state inside the recursion without properly undoing it (backtracking requires careful cleanup).
- Assuming the call stack is unlimited — in practice it is a few thousand to a few tens of thousands of frames deep.
$content$, 2, NOW(), NOW()),

(r6, 'Parsing & Tokenization', $content$
Parsing is the process of converting raw text into a structured representation that a program can work with. Almost all interpreters, compilers, configuration parsers, and command-line tools begin with the same two-stage pipeline: lexing followed by parsing.

## Stage 1 — Lexing (Tokenization)

The lexer reads raw characters and groups them into tokens — the smallest meaningful units of the language. A token has a type (number, identifier, operator, bracket) and a value (the actual text it was matched from).

For example, the string `3 + (4 * 2)` produces a flat list of tokens: `NUMBER(3)`, `PLUS`, `LPAREN`, `NUMBER(4)`, `STAR`, `NUMBER(2)`, `RPAREN`.

The lexer's output throws away whitespace and comments, leaving only the semantically significant pieces. This simplifies the next stage considerably.

## Stage 2 — Parsing

The parser consumes the token stream and builds an Abstract Syntax Tree (AST) — a tree that captures the grammatical structure of the input. Each node in the AST represents a construct: a binary operation, a function call, an if-statement, and so on.

The AST makes the nesting and precedence of operations explicit in its shape. The expression `3 + 4 * 2` becomes a tree where the `*` node is a child of the `+` node, correctly encoding that multiplication binds tighter.

## Recursive descent parsing

Recursive descent is the most natural technique for hand-written parsers. You define one function per grammatical rule, and each function calls other functions for the sub-rules it contains. The call stack mirrors the tree structure being built.

Operator precedence is encoded by the order of the grammar rules: rules for lower-precedence operators appear higher in the call chain and invoke rules for higher-precedence operators as sub-rules. When the parser wants a `term` (for multiplication), it calls `factor` (for atoms and parenthesised expressions) — the nesting naturally gives multiplication priority over addition.

## Handling parentheses

Parentheses are not stored in the AST — they only affect which sub-expressions are grouped together. The parser handles them by recursively calling the top-level expression-parsing rule when it encounters an open parenthesis, then consuming the matching close parenthesis. Whatever tree is built inside the parentheses becomes a single subtree at that position.

## Evaluation

Once the AST is built, evaluating it is a post-order traversal: recursively evaluate the left and right children, then apply the current node's operator to the results. Leaf nodes (numbers, variables) return their value directly. This cleanly separates parsing (what does the structure mean?) from evaluation (what does it compute?).

## Alternative approaches

**Shunting-yard** converts infix notation to postfix (reverse Polish notation) using a stack, without building an explicit tree. The postfix form can then be evaluated with a second stack pass. This is simpler to implement than a full recursive descent parser for expression evaluation specifically.

**Pratt parsing** associates a binding power with each token instead of encoding precedence in the grammar rules. It handles complex precedence and right-associativity elegantly and is the basis of many production parsers.

## Common challenges

- Left recursion: a grammar rule that calls itself as its first action causes infinite recursion in a recursive descent parser and must be refactored.
- Error recovery: deciding what to do when the input doesn't match the grammar — skip tokens, insert synthetic tokens, or report and abort.
- Operator associativity: `a - b - c` should parse as `(a - b) - c` (left-associative), not `a - (b - c)`.
$content$, 0, NOW(), NOW()),

(r7, 'TTL & Cache Eviction Strategies', $content$
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
$content$, 1, NOW(), NOW()),

(r8, 'Networking Basics: TCP & Sockets', $content$
## The TCP/IP model

Network communication is organised into layers, each responsible for a different concern. The two layers most relevant for application developers are:

**IP (Internet Protocol)** handles addressing and routing. It delivers packets from one machine to another on a best-effort basis — packets may be lost, reordered, or duplicated.

**TCP (Transmission Control Protocol)** sits on top of IP and provides a reliable, ordered, connection-oriented byte stream. It retransmits lost packets, reorders out-of-order arrivals, and controls the rate of transmission to avoid overwhelming the receiver. From the application's perspective, writing to a TCP connection is like writing to a file — you send bytes in order and the receiver gets them in order.

## The three-way handshake

Before data can flow, TCP establishes a connection through a handshake:

1. The client sends a SYN (synchronise) segment to signal it wants to connect.
2. The server responds with SYN-ACK, acknowledging the client's sequence number and announcing its own.
3. The client sends ACK, completing the handshake.

Only after this exchange is the connection considered established. This ensures both sides agree on the starting sequence numbers and that the path is reachable in both directions.

## Sockets

A socket is the OS abstraction for one endpoint of a network connection. From the application's point of view it looks like a file descriptor — you read from it to receive data and write to it to send data. The OS handles all the TCP details underneath.

A server socket is bound to a port and listens for incoming connections. When a client connects, the server's `accept` call returns a new connected socket representing that specific client. The server can then read the client's request, process it, and write the response back — all through that socket.

## Handling multiple clients

A naïve server blocks on `accept`, handles one client to completion, then accepts the next. This works for demonstration purposes but fails in practice because one slow client blocks all others.

The standard approaches are:

**Thread per connection** spawns a new OS thread for each accepted connection. The threads run concurrently, so one client's slowness doesn't block others. The downside is memory and scheduling overhead — OS threads are expensive, so this approach doesn't scale to thousands of simultaneous connections.

**Event-driven / non-blocking I/O** uses a single thread with a selector (epoll on Linux, kqueue on macOS) that monitors many sockets at once and wakes only when a socket is ready to read or write. This is how Redis, Nginx, and Node.js handle enormous numbers of connections with minimal threads. The tradeoff is that your logic must be written as event handlers and you must never block the event loop.

**Thread pool** combines both: a fixed number of threads each pick up connections from a queue. This bounds memory use while still allowing concurrency.

## RESP — Redis Serialization Protocol

Redis communicates over plain TCP using a text protocol called RESP. Each value is prefixed with a byte indicating its type, followed by the data and a CRLF terminator. The types are: simple strings (`+`), errors (`-`), integers (`:`), bulk strings (`$` followed by the byte length), and arrays (`*` followed by the element count).

The protocol is line-oriented and trivial to parse without a parser library — you read until CRLF, check the first byte, and handle the rest accordingly. This simplicity is a deliberate design choice that makes it easy to interact with Redis using nothing but a raw TCP connection and `cat`.

## Why this matters for Mini Redis

Implementing a Redis-like server means accepting TCP connections, parsing RESP-encoded commands, dispatching to command handlers (GET, SET, DEL, EXPIRE, etc.), and writing RESP-encoded responses back. Each piece — socket binding, accept loop, RESP parsing, command dispatch — is a separable concern that you can design and test independently.
$content$, 0, NOW(), NOW()),

(r9, 'Game Trees & Minimax', $content$
## Game trees

A game tree is a tree where each node represents a game state and each edge represents a legal move that transitions from one state to another. The root is the current position. The children of any node are all positions reachable by one move. Leaf nodes are terminal states — checkmate, stalemate, draw, or any other position where the game is over.

The branching factor of the tree is the average number of legal moves available from any position. For chess it is roughly 35. The depth of the tree is the number of moves ahead you want to search. The total number of positions in the tree grows as branching_factor^depth, which is why searching even a few moves deep is computationally demanding.

## Minimax

In a two-player zero-sum game, one player's gain is the other's loss. Minimax exploits this structure: the maximising player picks the move that leads to the highest-scoring position; the minimising player picks the move that leads to the lowest-scoring position.

To find the best move at the root, you evaluate every leaf node with a static evaluation function, then propagate the scores back up the tree: maximising nodes take the maximum over their children's scores; minimising nodes take the minimum. The root then selects the move that leads to the best propagated score.

This produces the optimal play under the assumption that your opponent also plays optimally — which is the correct assumption in competitive settings.

## Static evaluation functions

The static evaluation function assigns a numeric score to a non-terminal position. It is called "static" because it does not recurse further — it estimates the value of the position based only on its current features.

For chess, a classical evaluation function considers:

- **Material balance** — the sum of piece values for each side. Standard values are pawn=1, knight=3, bishop=3, rook=5, queen=9.
- **Piece-square tables** — a bonus or penalty for each piece type based on the square it occupies. A knight is worth more in the centre than in the corner.
- **King safety** — the king should be tucked away and sheltered, especially in the middlegame.
- **Pawn structure** — doubled, isolated, and passed pawns all affect the long-term character of the position.
- **Mobility** — the number of legal moves available is a rough proxy for activity and flexibility.

The evaluation function is the most important design decision in a chess engine. All else being equal, a more accurate evaluation allows you to search to a shallower depth and still play well.

## Alpha-beta pruning

Alpha-beta pruning is an optimisation of minimax that eliminates branches that cannot possibly affect the final result.

The idea is to maintain two bounds during the search:
- **Alpha** — the best score the maximising player is guaranteed to achieve so far.
- **Beta** — the best score the minimising player is guaranteed to achieve so far.

If at any point the current node's score would fall outside the window [alpha, beta], you prune the remaining children — they will never be chosen by a rational opponent.

Alpha-beta pruning does not change the result of minimax, only the number of nodes evaluated. In the best case (when moves are ordered so the best move is always examined first), alpha-beta reduces the effective branching factor from b to approximately the square root of b, allowing you to search twice as deep in the same time.

Move ordering — examining likely-good moves first — is therefore crucial to getting the most out of alpha-beta.

## Iterative deepening

Rather than searching to a fixed depth, iterative deepening searches to depth 1, then depth 2, then depth 3, and so on, using the results of each pass to order moves for the next. This lets you use all available time while always having a best-move ready if you run out of time mid-search. Combined with a transposition table (a cache of previously evaluated positions), iterative deepening is the backbone of modern chess engines.
$content$, 0, NOW(), NOW()),

(r10, 'BFS & DFS', $content$
Graph search algorithms answer the question "which nodes are reachable from a starting node, and how?" The two fundamental strategies — breadth-first search (BFS) and depth-first search (DFS) — differ in the order they visit nodes, and this difference makes each one naturally suited to different problems.

## Depth-First Search (DFS)

DFS explores as far as possible along a branch before backtracking. It descends into a neighbour immediately, then descends into that node's neighbours, and so on, until it reaches a node with no unvisited neighbours — at which point it backtracks and tries the next option.

The implicit data structure is the call stack: a recursive DFS uses the system's call stack, while an iterative DFS maintains an explicit stack. Either way, the currently active path from the start node to the current node is what's stored on the stack.

DFS is the natural choice when you need to:

- Detect cycles in a graph.
- Compute a topological ordering of a DAG.
- Find any path (not necessarily the shortest) between two nodes.
- Enumerate all paths or solutions via backtracking.
- Traverse a tree in pre-order or post-order.
- Explore a file system recursively.

The space complexity of DFS is O(h), where h is the maximum depth of the search. For trees this is the height; for general graphs it depends on the structure. DFS can use much less memory than BFS when the graph is wide but not deep.

## Breadth-First Search (BFS)

BFS explores all nodes at the current depth before moving to the next depth level. It fans out layer by layer from the starting node. The data structure is a queue — nodes are added to the back as they are discovered and removed from the front as they are visited.

The crucial property of BFS is that it visits nodes in order of their distance from the start. The first time BFS reaches any node, it has found the shortest path (in terms of number of edges) from the start to that node. This makes BFS the correct algorithm for shortest-path queries in unweighted graphs.

BFS is the natural choice when you need to:

- Find the shortest path in an unweighted graph.
- Find all nodes within a given number of hops.
- Compute the minimum number of moves to reach a goal state.
- Traverse a tree level-by-level.

The space complexity of BFS is O(w), where w is the maximum width of the graph at any level. In the worst case (e.g. a star graph) this can be O(n), which makes BFS more memory-intensive than DFS.

## Comparison

| Property | DFS | BFS |
|---|---|---|
| Data structure | Stack (implicit or explicit) | Queue |
| Finds shortest path? | No (in general) | Yes (unweighted) |
| Memory | O(height) | O(width) |
| Detects cycles? | Yes | Yes |
| Natural for trees? | Pre/post-order traversal | Level-order traversal |

## Marking visited nodes

Both algorithms require tracking which nodes have already been visited to avoid revisiting them and looping infinitely in cyclic graphs. The standard approach is a hash set that is checked before each new visit. In grids and other structured graphs, a boolean array is often more efficient.

## Connection to file systems

Traversing a directory tree is DFS — you fully explore each subdirectory before moving to the next. The recursive structure of the file system (each directory contains files and more directories) maps directly onto DFS's recursive descent. A "find all files matching a pattern" operation is nothing more than a DFS over the tree that collects matching leaf nodes.
$content$, 0, NOW(), NOW());

-- ── Link resources to problems ────────────────────────────────────────────────

-- Rate Limiter → Sliding Window, Queue/Deque
INSERT INTO "_ProblemResources" ("A", "B") VALUES
(p_rate, r1), (p_rate, r2);

-- TTL Cache → Hash Maps, TTL & Eviction
INSERT INTO "_ProblemResources" ("A", "B") VALUES
(p_ttl, r3), (p_ttl, r7);

-- URL Router → Trees & Tries
INSERT INTO "_ProblemResources" ("A", "B") VALUES
(p_router, r4);

-- Virtual File System → Trees & Tries, Recursion, BFS & DFS
INSERT INTO "_ProblemResources" ("A", "B") VALUES
(p_vfs, r4), (p_vfs, r5), (p_vfs, r10);

-- Expression Evaluator → Recursion, Parsing
INSERT INTO "_ProblemResources" ("A", "B") VALUES
(p_expr, r5), (p_expr, r6);

-- Tiny Interpreter → Recursion, Parsing
INSERT INTO "_ProblemResources" ("A", "B") VALUES
(p_interp, r5), (p_interp, r6);

-- Mini Redis → Hash Maps, Networking, TTL & Eviction
INSERT INTO "_ProblemResources" ("A", "B") VALUES
(p_redis, r3), (p_redis, r7), (p_redis, r8);

-- Chess Engine → Game Trees, BFS & DFS, Recursion
INSERT INTO "_ProblemResources" ("A", "B") VALUES
(p_chess, r9), (p_chess, r10), (p_chess, r5);

END $$;
