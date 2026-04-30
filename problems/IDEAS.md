# Problem Ideas

Problems that are big enough for users to naturally create multiple files, or that test behavior beyond simple return-value correctness.

---

## From Previous Sessions

### Multiple-File / Mock-Based

**HTTP Client with Retry** (Medium)
Files: `HttpClient.h`, `RetryPolicy.h`
Testbench injects a mock transport with configurable failure count. Tests verify call count on the mock, not just the final response value. Non-retryable errors (4xx) must not be retried.

**Fluent Query Builder** (Medium)
Files: `QueryBuilder.h`, `Condition.h`, `OrderBy.h`
Build SQL-style queries through a fluent API. Testbench compares the generated SQL string to a canonical expected form. Tests cover aliasing, multi-condition WHERE, AND/OR, and LIMIT.

**Circuit Breaker** (Hard)
Files: `CircuitBreaker.h`, `CallStats.h`
Testbench provides a mock service. Tests verify state transitions CLOSED→OPEN→HALF_OPEN→CLOSED and that calls in OPEN state are NOT forwarded to the mock (verified via call count).

**Plugin Pipeline** (Medium)
Files: `Pipeline.h`, `Plugin.h`, `PluginResult.h`
Plugins transform a request object or reject it early. Tests verify execution log (each plugin appends to it), early rejection stops the chain, and transformed fields are visible to downstream plugins.

**Memoize with Call Counting** (Easy–Medium)
Files: `Memoize.h`, `Cache.h`
Wraps an arbitrary function. Testbench wraps a counter-incrementing function. Tests verify the counter stays at 1 after N identical calls, increments on new inputs, and resets on `invalidate`/`clear`.

**Task Scheduler with Dependencies** (Hard)
Files: `Scheduler.h`, `Task.h`, `DependencyGraph.h`
Tasks declare dependencies; `run()` executes in topological order. Tests verify execution log is valid topological order, cycles are detected, and removing a dependency makes a task runnable earlier.

---

## New Ideas

**A — Transactional Key-Value Store** (Medium)
`BEGIN` / `COMMIT` / `ROLLBACK` with nested transactions. Writes inside a transaction are invisible externally until committed. Tests verify rollback undoes writes, committed state is visible, and nested transactions only affect their own scope.

**B — Log Query Engine** (Medium)
Ingest `INGEST timestamp level "message"`. Query with `QUERY level=ERROR since=T until=T`, `COUNT level=WARN`, `TAIL N`, `RATE level=ERROR window=W`. Tests verify filtered counts, time-range slicing, and rate calculations. Naturally grows into `LogStore`, `LogEntry`, `QueryParser`.

**C — Expression Evaluator** (Medium–Hard)
`SET x 3`, `EVAL x * (2 + x) / max(x, 5)`. Operators, grouping, small stdlib (`min`, `max`, `abs`, `pow`). Tests compare evaluated results to expected values. Naturally splits into lexer, parser, and evaluator.

**D — Inventory & Reservations** (Medium)
`STOCK item qty`, `RESERVE item qty`, `FULFILL reservation_id`, `CANCEL reservation_id`, `AVAILABLE item`. Tests verify reservations reduce available stock immediately, fulfillment is final, cancellation restores availability, and over-reservation is rejected.

**E — LFU Cache** (Hard)
Least-Frequently-Used eviction with capacity. On tie, evict least-recently-used. Tests verify not just value correctness but **which key was evicted** after specific access patterns. Naturally decomposes into a frequency list and bucket structure.

**F — Trie with Ranked Autocomplete** (Medium)
`INSERT word frequency`, `DELETE word`, `SEARCH prefix` → top-3 completions by frequency, `COUNT prefix`. Tests verify rankings after deletions, frequency changes, and exact prefix counts. Naturally grows into `TrieNode` + `Trie`.

**G — State Machine** (Medium)
`DEFINE_STATE`, `DEFINE_TRANSITION from event to [action]`, `START`, `SEND event`. Testbench records states entered and actions fired. Tests verify the state log matches expected sequences, invalid transitions are ignored, terminal states reject events.

**H — Mini Regex Engine** (Hard)
Support `.`, `*`, `+`, `?`, `^`, `$`, `[abc]`, `[^abc]`. Input: `MATCH pattern string` → `YES` / `NO`. Tests cover anchoring, greedy quantifiers, negated classes, empty-string edge cases. Naturally decomposes into tokenizer, NFA builder, and matcher.

---

## Large Problems (200+ LOC)

**A — Virtual File System** (Hard) ~400 LOC
In-memory filesystem with full path semantics. `MKDIR`, `TOUCH`, `WRITE path content`, `READ path`, `LS path`, `RM [-r] path`, `MV src dst`, `CP src dst`, `FIND path name`. Tests verify directory structure, file contents, recursive operations, and error cases (file-not-found, dir-not-empty). Naturally grows into `Inode`, `Directory`, `File`, `VFS`.

**B — Mini Redis** (Hard) ~350 LOC
Multi-structure key-value store. Strings: `SET`, `GET`, `DEL`, `EXPIRE`, `TTL`. Lists: `LPUSH`, `RPUSH`, `LPOP`, `RPOP`, `LRANGE`. Sets: `SADD`, `SREM`, `SMEMBERS`, `SISMEMBER`. Sorted sets: `ZADD`, `ZRANGE`, `ZRANK`. One type per key; type mismatch returns an error. TTLs apply across all types. Tests check data correctness, TTL expiry, type errors, and ordering.

**C — Graph Engine** (Hard) ~300 LOC
Directed weighted graph with algorithm suite. `ADD_NODE`, `ADD_EDGE src dst weight`, `SHORTEST src dst` (Dijkstra), `REACHABLE src` (BFS, sorted), `TOPO_SORT` (or `CYCLE` if one exists), `SCC` (sorted strongly connected components). Naturally decomposes into `Graph`, `Dijkstra`, `Traversal`, `SCC`.

**D — JSON Parser** (Hard) ~300 LOC
Full JSON parser from scratch — `nlohmann` forbidden in user code (testbench enforces). Parse nested objects, arrays, strings (escapes: `\"`, `\\`, `\n`, `\t`, `\uXXXX`), numbers, booleans, null. Then query: `PARSE json`, `GET path.to.key`, `TYPE path`, `KEYS path`, `LENGTH path`. Tests cover deep nesting, edge-case strings, type queries.

**E — Template Engine** (Hard) ~300 LOC
Render templates with a small language. `{{ var }}` substitution, `{% if expr %}...{% elif %}...{% endif %}`, `{% for item in list %}...{% endfor %}`, filters (`{{ name | upper }}`, `{{ items | length }}`). Commands: `BIND var value`, `BIND_LIST var a b c`, `RENDER template`. Tests check loops, nested conditionals, filter chaining.

**F — Write-Ahead Log** (Hard) ~250 LOC
Crash-safe key-value store backed by a WAL. `SET key value`, `DEL key`, `GET key`, `CHECKPOINT` (flush snapshot, truncate log), `CRASH` (discard all in-memory state), `RECOVER` (replay log on top of last snapshot), `LOG` (print current log entries). Tests verify that after `CRASH` + `RECOVER`, all committed writes are visible and uncommitted ones are not.

**G — Diff Engine** (Medium–Hard) ~250 LOC
Myers diff algorithm with unified diff output. Commands: `FILE_A name` / `FILE_B name` (followed by lines until `END`), then `DIFF` outputs unified diff (`---`, `+++`, `@@` headers, `-`/`+`/` ` lines). Tests compare exact diff output including hunk boundaries and context lines. Decomposes into `Myers`, `Hunk`, `Formatter`.

**H — Tiny Interpreter** (Hard) ~450 LOC
Interpreter for a small imperative language: variable assignment (`x = expr`), arithmetic, `if/elif/else`, `while`, `print`, `def`/`return`, recursion. Testbench runs programs and captures `print` output. Tests include loops, recursive functions (fibonacci, factorial), nested scopes. Naturally splits into `Lexer`, `Parser` (AST nodes), `Interpreter`.

---

## More Ideas

### Focused / Single-File-ish (Easy–Medium)

**Pub/Sub Event Bus** (Easy)
`SUBSCRIBE channel handler_id`, `UNSUBSCRIBE channel handler_id`, `PUBLISH channel message` → prints `handler_id: message` for every subscriber in subscription order. Tests verify delivery order, no delivery after unsubscribe, and publishing to a channel with no subscribers is a no-op. Simple but teaches the observer pattern cleanly.

**Undo/Redo Buffer** (Easy–Medium)
Text buffer with history. `INSERT pos text`, `DELETE pos len`, `REPLACE pos len text`, `UNDO`, `REDO`, `PRINT`. Undo/redo is a two-stack scheme; branching (new edit after undo) discards the redo stack. Tests verify buffer state after sequences of edits and undo/redo, including branch-discard behavior.

**Stream Statistics** (Medium)
Online statistics over a data stream. `PUSH value`, then queries: `MIN`, `MAX`, `MEAN`, `MEDIAN`, `P95`, `STDDEV`, `COUNT`. All queries answered in O(log n) or better. Tests mix pushes and queries, checking exact values (no floating-point tolerance for integer inputs). Naturally splits into a sorted structure + running aggregates.

**Job Queue** (Medium)
Priority job scheduler. `ENQUEUE job_id priority`, `WORKER` (runs the highest-priority job, ties broken by insertion order), `CANCEL job_id`, `PEEK` (name of next job without running), `PENDING` (count). Tests verify priority ordering, tie-breaking, cancel removes from queue mid-wait, and peek doesn't consume.

**Transactional KV Store** (Medium)
`SET key value`, `GET key`, `DEL key`, `BEGIN`, `COMMIT`, `ROLLBACK`. Nested transactions allowed; inner commit only finalises to the outer transaction, not globally. Tests verify reads inside a transaction see pending writes, rollback discards them, and only the outermost commit makes data visible externally.

---

### Larger Problems (200+ LOC)

**Inventory & Reservations** (Medium) ~200 LOC
`STOCK item qty`, `RESERVE item qty` → reservation_id (or ERROR if insufficient), `FULFILL id`, `CANCEL id`, `AVAILABLE item`, `RESERVED item`. Fulfillment is permanent; cancellation restores availability. Tests verify over-reservation is rejected, available = total − reserved, fulfil removes reservation but not stock.

**Rope** (Hard) ~300 LOC
Persistent rope data structure for efficient string editing. `BUILD text`, `INSERT pos text`, `DELETE pos len`, `CONCAT other_rope`, `SUBSTRING start len`, `FIND pattern` (first index), `PRINT`. Tests verify correctness of all ops on large strings that would be O(n) with a naive buffer. Decomposes into `RopeNode`, `Rope`, `Iterator`.

**Graph Engine** (Hard) ~300 LOC
Directed weighted graph with algorithm suite. `ADD_NODE`, `ADD_EDGE src dst weight`, `SHORTEST src dst` (Dijkstra), `REACHABLE src` (BFS, sorted), `TOPO_SORT` (or `CYCLE` if one exists), `SCC` (sorted strongly connected components). Naturally decomposes into `Graph`, `Dijkstra`, `Traversal`, `SCC`.

**CSV Query Engine** (Hard) ~300 LOC
Load a CSV (header + rows via `LOAD` command), then: `SELECT col1,col2 WHERE col=val`, `COUNT WHERE col=val`, `ORDER col [ASC|DESC]`, `DISTINCT col`, `GROUP_BY col COUNT`. Tests verify filtering, ordering stability, group counts, and missing-value handling. Naturally decomposes into `Table`, `Row`, `Filter`, `Aggregator`.

**Mini Shell** (Hard) ~350 LOC
Command interpreter with `VAR=value` assignment, `$VAR` expansion, pipelines `cmd1 | cmd2`, redirects `> file` / `>> file` / `< file`, and a small set of builtins: `echo`, `cat`, `grep pattern`, `sort`, `uniq`, `wc -l`. Testbench provides virtual file contents via `WRITE filename lines...` and then `RUN command`. Tests compare stdout to expected output. Decomposes into `Lexer`, `Parser`, `Executor`, `Builtins`.

**Memory Allocator** (Hard) ~300 LOC
Simulate `malloc`/`free` over a fixed heap. `ALLOC size` → address (or ERROR), `FREE address`, `REALLOC address size`, `STATS` (total/used/free/fragmentation%). Support three strategies selectable at init: `INIT strategy size` where strategy ∈ {FIRST_FIT, BEST_FIT, BUDDY}. Tests verify address uniqueness, no-overlap, correct reuse after free, and that BUDDY always returns power-of-two-aligned blocks.

**B-Tree** (Expert) ~400 LOC
On-disk-style B-tree with configurable order `t`. `CREATE t`, `INSERT key`, `DELETE key`, `SEARCH key` (YES/NO), `RANGE lo hi` (sorted keys in range), `PRINT` (level-order: one line per node, keys space-separated). Tests verify structural invariants after every insert/delete (min keys, max keys, leaf depth uniformity) as well as query correctness. Decomposes into `BTreeNode`, `BTree`, `BTreePrinter`.

**Bytecode VM** (Expert) ~450 LOC
Stack-based virtual machine. Instructions: `PUSH n`, `POP`, `ADD`, `SUB`, `MUL`, `DIV`, `MOD`, `DUP`, `SWAP`, `LOAD reg`, `STORE reg`, `JMP label`, `JZ label`, `JNZ label`, `CALL label`, `RET`, `PRINT`, `HALT`. Input is an assembly program (labels end with `:`). Tests compare printed output of programs: loops, recursive subroutines, Fibonacci, factorial. Decomposes into `Assembler`, `VM`, `CallStack`.

**Chess Engine** (Expert) ~600 LOC
Full chess game with legal-move enforcement. Commands:
- `NEW` — start a new game (white to move)
- `MOVE e2e4` — attempt a move in from-to notation; prints `OK`, `ILLEGAL`, or `CHECKMATE` / `STALEMATE` / `DRAW` if the game ends
- `PRINT` — render the board, rank 8 at top, files a–h left to right; uppercase = white, lowercase = black, `.` = empty
- `MOVES e2` — list all legal destination squares for the piece on e2, space-separated and sorted (e.g. `e3 e4`)
- `STATUS` — one of `WHITE_TO_MOVE`, `BLACK_TO_MOVE`, `CHECK`, `CHECKMATE`, `STALEMATE`, `DRAW`
- `HISTORY` — print each move so far, one per line, in `e2e4` notation

Must handle all standard rules: castling (both sides), en passant, pawn promotion (always to queen), fifty-move draw rule. Tests cover opening sequences, pin detection, discovered check, castling legality (can't castle through check), and endgame detection. Naturally decomposes into `Board`, `Piece`, `MoveGenerator`, `Rules`, `Game`.
