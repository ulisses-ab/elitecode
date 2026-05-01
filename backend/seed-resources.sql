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
## Sliding Window

A sliding window is a subarray or subrange that moves through a larger sequence, letting you process a chunk of data without reprocessing every element from scratch.

### Fixed-size window

```python
def max_sum_subarray(arr, k):
    window_sum = sum(arr[:k])
    best = window_sum
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]
        best = max(best, window_sum)
    return best
```

Adds the new element, drops the oldest — O(n) instead of O(n·k).

### Time-based sliding window (rate limiters)

Instead of a fixed element count, the window is a time range, e.g. "requests in the last 60 seconds".

**Approach:** keep a queue of timestamps. On each request:
1. Evict timestamps older than `now - window_size`.
2. Check `len(queue) < limit`.
3. Append `now`.

```python
from collections import deque
import time

class RateLimiter:
    def __init__(self, limit, window_secs):
        self.limit = limit
        self.window = window_secs
        self.timestamps = deque()

    def allow(self):
        now = time.time()
        while self.timestamps and self.timestamps[0] < now - self.window:
            self.timestamps.popleft()
        if len(self.timestamps) < self.limit:
            self.timestamps.append(now)
            return True
        return False
```

### Complexity

| | Time | Space |
|---|---|---|
| Fixed window | O(n) | O(1) |
| Time-based window | O(1) amortised | O(limit) |

The window slides because you only ever add to one end and remove from the other — this is why a `deque` is the natural backing structure.
$content$, 0, NOW(), NOW()),

(r2, 'Queue & Deque Data Structures', $content$
## Queue (FIFO)

A queue is a **First-In, First-Out** (FIFO) data structure. Elements are added at the back (enqueue) and removed from the front (dequeue).

```
enqueue →  [ 3 | 7 | 1 | 9 ]  → dequeue
              back         front
```

### Core operations

| Operation | Linked-list | Array (circular) |
|---|---|---|
| enqueue | O(1) | O(1) amortised |
| dequeue | O(1) | O(1) |
| peek | O(1) | O(1) |

### Python

```python
from collections import deque
q = deque()
q.append(1)       # enqueue
q.append(2)
x = q.popleft()   # dequeue → 1
```

---

## Deque (Double-Ended Queue)

A deque allows O(1) insertion and removal from **both ends**.

```python
from collections import deque
d = deque()
d.append(1)        # add right
d.appendleft(0)    # add left
d.pop()            # remove right
d.popleft()        # remove left
```

### When to use a deque
- Sliding window problems (add right, evict from left)
- BFS traversal
- Monotonic deque (next greater element)

### Monotonic deque example — sliding window maximum

```python
def sliding_max(nums, k):
    dq, result = deque(), []
    for i, n in enumerate(nums):
        while dq and nums[dq[-1]] < n:
            dq.pop()           # evict smaller elements
        dq.append(i)
        if dq[0] == i - k:
            dq.popleft()       # evict out-of-window index
        if i >= k - 1:
            result.append(nums[dq[0]])
    return result
```
$content$, 1, NOW(), NOW()),

(r3, 'Hash Maps In Depth', $content$
## Hash Maps

A hash map stores key-value pairs with average O(1) lookup, insert, and delete.

### How it works

1. **Hash function** — converts a key into an integer index.
2. **Buckets** — an array of slots; the index points to a bucket.
3. **Collision resolution** — chaining (linked list per bucket) or open addressing (probe for next free slot).

```
key → hash(key) % capacity → bucket index → value
```

### Load factor & resizing

`load_factor = n / capacity`

When the load factor exceeds ~0.75, the table doubles in size and all entries are rehashed. This keeps average-case O(1).

### Complexity

| Operation | Average | Worst (all collide) |
|---|---|---|
| get | O(1) | O(n) |
| set | O(1) | O(n) |
| delete | O(1) | O(n) |

### Python dict internals

Python uses open addressing with pseudo-random probing. It resizes when 2/3 full.

```python
d = {}
d["key"] = 42
val = d.get("key")   # None if missing, no KeyError
del d["key"]
```

### OrderedDict — insertion-order + O(1) move-to-end

```python
from collections import OrderedDict
lru = OrderedDict()
lru["a"] = 1
lru.move_to_end("a")        # mark as recently used
lru.popitem(last=False)     # evict LRU entry (front)
```

`OrderedDict` is ideal for LRU cache implementations.

### defaultdict

```python
from collections import defaultdict
counts = defaultdict(int)
counts["x"] += 1   # no KeyError on first access
```
$content$, 0, NOW(), NOW()),

(r4, 'Trees & Tries', $content$
## Tree Data Structures

### Terminology

- **Root** — the top node.
- **Leaf** — a node with no children.
- **Depth** — distance from the root.
- **Height** — longest path from a node to a leaf.
- **N-ary tree** — each node can have up to N children.

### File system as a tree

```
/
├── home/
│   └── user/
│       └── notes.txt
└── etc/
    └── hosts
```

Every directory is an internal node; every file is a leaf.

### Tree traversals

```python
def dfs(node):
    if node is None:
        return
    # pre-order: process node here
    for child in node.children:
        dfs(child)
    # post-order: process node here
```

---

## Trie (Prefix Tree)

A trie stores strings character-by-character. Each path from root to a marked node represents a word or route segment.

```
         root
          |
          a
         / \
        p   n
        |   |
        i   d
       (*)  (*)
```

Words stored: "api", "and"

### Trie node

```python
class TrieNode:
    def __init__(self):
        self.children = {}   # char → TrieNode
        self.is_end = False
        self.value = None    # store route handler here

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, path, handler):
        node = self.root
        for segment in path.strip("/").split("/"):
            if segment not in node.children:
                node.children[segment] = TrieNode()
            node = node.children[segment]
        node.is_end = True
        node.value = handler

    def search(self, path):
        node = self.root
        for segment in path.strip("/").split("/"):
            if segment not in node.children:
                return None
            node = node.children[segment]
        return node.value if node.is_end else None
```

### Complexity

| Operation | Time | Space |
|---|---|---|
| Insert | O(m) | O(m) per string |
| Lookup | O(m) | — |

where m = length of the string/path.
$content$, 1, NOW(), NOW()),

(r5, 'Recursion & The Call Stack', $content$
## Recursion

A function is recursive when it calls itself. Every recursive solution needs:

1. **Base case** — a condition that stops recursion.
2. **Recursive case** — a smaller version of the same problem.

### Classic example: factorial

```python
def factorial(n):
    if n == 0:           # base case
        return 1
    return n * factorial(n - 1)
```

Call stack for `factorial(3)`:
```
factorial(3) → 3 * factorial(2)
                   → 2 * factorial(1)
                           → 1 * factorial(0)
                                   → 1
```

### Recursion vs. iteration

Any recursion can be rewritten iteratively with an explicit stack. The call stack *is* a stack — each frame holds local variables and the return address.

### Tree recursion

When a function makes **multiple** recursive calls, it forms a call tree. This appears in:
- Parsing nested expressions
- Traversing a file system
- Evaluating an AST

```python
def eval_ast(node):
    if node.is_leaf:
        return node.value
    left  = eval_ast(node.left)
    right = eval_ast(node.right)
    return node.op(left, right)
```

### Stack overflow

Deep recursion exhausts the call stack. Mitigations:
- Convert to iteration + explicit stack.
- Increase the limit: `sys.setrecursionlimit(10000)` (use sparingly).

### Memoisation

Cache results to avoid redundant calls:

```python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n < 2:
        return n
    return fib(n-1) + fib(n-2)
```
$content$, 2, NOW(), NOW()),

(r6, 'Parsing & Tokenization', $content$
## Parsing Pipeline

Parsing converts raw text into a structured representation. It has two stages:

### 1. Lexing (Tokenization)

Break the input string into a flat list of **tokens**.

```
input:  "3 + (4 * 2)"
tokens: [NUM(3), PLUS, LPAREN, NUM(4), STAR, NUM(2), RPAREN]
```

```python
import re

def tokenize(expr):
    pattern = re.compile(r'\s*(\d+|[+\-*/()])\\s*')
    return pattern.findall(expr)
```

### 2. Recursive Descent Parsing

Consume the token stream and build an **Abstract Syntax Tree (AST)**.

The grammar encodes operator precedence — lower-precedence operators appear higher in the call chain:

```
expr   → term   (('+' | '-') term)*
term   → factor (('*' | '/') factor)*
factor → NUMBER | '(' expr ')'
```

```python
class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0

    def peek(self):
        return self.tokens[self.pos] if self.pos < len(self.tokens) else None

    def consume(self):
        tok = self.tokens[self.pos]
        self.pos += 1
        return tok

    def parse_expr(self):
        left = self.parse_term()
        while self.peek() in ('+', '-'):
            op = self.consume()
            right = self.parse_term()
            left = (op, left, right)
        return left

    def parse_term(self):
        left = self.parse_factor()
        while self.peek() in ('*', '/'):
            op = self.consume()
            right = self.parse_factor()
            left = (op, left, right)
        return left

    def parse_factor(self):
        tok = self.peek()
        if tok == '(':
            self.consume()
            node = self.parse_expr()
            self.consume()   # ')'
            return node
        return int(self.consume())
```

### Evaluating the AST

```python
def evaluate(node):
    if isinstance(node, int):
        return node
    op, left, right = node
    l, r = evaluate(left), evaluate(right)
    return {'+': l+r, '-': l-r, '*': l*r, '/': l//r}[op]
```

### Alternatives

- **Shunting-yard** — converts infix to postfix (RPN), then evaluate with a stack. No recursion needed.
- **Pratt parsing** — associates binding power with tokens; more flexible than recursive descent.
$content$, 0, NOW(), NOW()),

(r7, 'TTL & Cache Eviction Strategies', $content$
## TTL (Time-To-Live)

TTL is a duration after which a cache entry is considered stale.

### Lazy expiration

Entries are evicted on the **next access**, not when they expire.

```python
import time

class TTLCache:
    def __init__(self):
        self.store = {}   # key → (value, expires_at)

    def set(self, key, value, ttl):
        self.store[key] = (value, time.time() + ttl)

    def get(self, key):
        if key not in self.store:
            return None
        value, expires_at = self.store[key]
        if time.time() > expires_at:
            del self.store[key]
            return None
        return value
```

**Pro:** simple, no background thread.
**Con:** stale entries accumulate until accessed.

### Eager expiration (background sweep)

A background thread periodically scans and removes expired entries.

```python
import threading, time

class TTLCache:
    def __init__(self):
        self.store = {}
        self._lock = threading.Lock()
        threading.Thread(target=self._sweep, daemon=True).start()

    def _sweep(self):
        while True:
            time.sleep(1)
            now = time.time()
            with self._lock:
                expired = [k for k, (_, exp) in self.store.items() if now > exp]
                for k in expired:
                    del self.store[k]
```

### Eviction policies (when cache is full)

| Policy | Description |
|---|---|
| **LRU** | Evict least recently used |
| **LFU** | Evict least frequently used |
| **FIFO** | Evict oldest inserted entry |
| **TTL** | Evict soonest-to-expire entry |
| **Random** | Evict a random entry |

### LRU with OrderedDict

```python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = OrderedDict()

    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.cap:
            self.cache.popitem(last=False)
```
$content$, 1, NOW(), NOW()),

(r8, 'Networking Basics: TCP & Sockets', $content$
## TCP/IP

TCP provides **reliable, ordered, connection-oriented** byte streams.

### Connection lifecycle

```
Client                    Server
  |──── SYN ────────────>|
  |<─── SYN-ACK ─────────|
  |──── ACK ────────────>|   ← connection established
  |<──── data ──────────>|
  |──── FIN ────────────>|   ← teardown
```

### Sockets in Python

```python
import socket

# Server
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(('0.0.0.0', 6379))
server.listen(5)
conn, addr = server.accept()   # blocks until client connects
data = conn.recv(1024)
conn.sendall(b'+OK\r\n')
conn.close()
```

```python
# Client
client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect(('127.0.0.1', 6379))
client.sendall(b'PING\r\n')
response = client.recv(1024)
```

### RESP (Redis Serialization Protocol)

| Type | Prefix | Example |
|---|---|---|
| Simple string | `+` | `+OK\r\n` |
| Error | `-` | `-ERR unknown\r\n` |
| Integer | `:` | `:42\r\n` |
| Bulk string | `$` | `$5\r\nHello\r\n` |
| Array | `*` | `*2\r\n$4\r\nLLEN\r\n$6\r\nmylist\r\n` |

### Handling multiple clients with selectors

```python
import selectors

sel = selectors.DefaultSelector()

def accept(sock):
    conn, _ = sock.accept()
    sel.register(conn, selectors.EVENT_READ, read)

def read(conn):
    data = conn.recv(1024)
    if data:
        conn.sendall(data)
    else:
        sel.unregister(conn)
        conn.close()

sel.register(server, selectors.EVENT_READ, accept)
while True:
    for key, _ in sel.select():
        key.data(key.fileobj)
```

This is the basis of event-driven servers like Redis itself.
$content$, 0, NOW(), NOW()),

(r9, 'Game Trees & Minimax', $content$
## Game Trees

A game tree is a tree where each node is a game state and each edge is a legal move. Leaf nodes are terminal states (checkmate, draw, stalemate).

### Minimax

In a two-player zero-sum game, one player maximises the score; the other minimises it.

```python
def minimax(state, depth, is_maximising):
    if depth == 0 or state.is_terminal():
        return evaluate(state)

    if is_maximising:
        best = -float('inf')
        for move in state.legal_moves():
            score = minimax(state.apply(move), depth - 1, False)
            best = max(best, score)
        return best
    else:
        best = float('inf')
        for move in state.legal_moves():
            score = minimax(state.apply(move), depth - 1, True)
            best = min(best, score)
        return best
```

### Alpha-Beta Pruning

Prunes branches that cannot affect the result, reducing the effective branching factor from b to roughly sqrt(b).

```python
def alphabeta(state, depth, alpha, beta, is_maximising):
    if depth == 0 or state.is_terminal():
        return evaluate(state)

    if is_maximising:
        for move in state.legal_moves():
            alpha = max(alpha, alphabeta(state.apply(move), depth-1, alpha, beta, False))
            if alpha >= beta:
                break   # beta cut-off
        return alpha
    else:
        for move in state.legal_moves():
            beta = min(beta, alphabeta(state.apply(move), depth-1, alpha, beta, True))
            if beta <= alpha:
                break   # alpha cut-off
        return beta
```

### Static evaluation function

Assigns a numeric score to non-terminal states. For chess:

```python
PIECE_VALUES = {'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 0}

def evaluate(board):
    score = 0
    for piece, color in board.pieces():
        val = PIECE_VALUES[piece]
        score += val if color == WHITE else -val
    return score
```
$content$, 0, NOW(), NOW()),

(r10, 'BFS & DFS', $content$
## Graph Search

Two fundamental strategies for traversing graphs and trees:

### Depth-First Search (DFS)

Go as deep as possible before backtracking. Uses a stack (implicit via recursion, or explicit).

```python
def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    visited.add(start)
    for neighbour in graph[start]:
        if neighbour not in visited:
            dfs(graph, neighbour, visited)
    return visited
```

**Iterative DFS:**

```python
def dfs_iter(graph, start):
    visited, stack = set(), [start]
    while stack:
        node = stack.pop()
        if node not in visited:
            visited.add(node)
            stack.extend(graph[node])
    return visited
```

### Breadth-First Search (BFS)

Visit all nodes at the current depth before going deeper. Uses a queue. Finds the **shortest path** in unweighted graphs.

```python
from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for neighbour in graph[node]:
            if neighbour not in visited:
                visited.add(neighbour)
                queue.append(neighbour)
    return visited
```

### Shortest path with BFS

```python
def shortest_path(graph, start, target):
    queue = deque([(start, [start])])
    visited = {start}
    while queue:
        node, path = queue.popleft()
        if node == target:
            return path
        for neighbour in graph[node]:
            if neighbour not in visited:
                visited.add(neighbour)
                queue.append((neighbour, path + [neighbour]))
    return None
```

### Comparison

| | DFS | BFS |
|---|---|---|
| Data structure | Stack | Queue |
| Memory | O(h) height | O(w) width |
| Shortest path | No | Yes (unweighted) |
| Use cases | Cycle detection, topological sort, backtracking | Level-order, shortest path |

### File system traversal with DFS

```python
def find_file(node, name):
    if node.name == name:
        return node
    for child in node.children:
        result = find_file(child, name)
        if result:
            return result
    return None
```
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
