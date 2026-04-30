Implement a **Mini Redis** server that listens for real TCP connections and speaks the **RESP (Redis Serialization Protocol)**.

Your server must accept connections on a port passed as `argv[1]` and handle one client at a time. The testbench connects to it like a real Redis client and verifies responses.

## Protocol

Clients send commands as **RESP arrays** (e.g. `*3\r\n$3\r\nSET\r\n$3\r\nfoo\r\n$3\r\nbar\r\n`). Your server must respond with the appropriate RESP type.

## RESP — Redis Serialization Protocol

RESP is a simple line-oriented text protocol. Every value begins with a single-byte **type prefix** followed by a `\r\n` terminator.

### Data types

| Prefix | Type | Example wire bytes | Meaning |
|---|---|---|---|
| `+` | Simple string | `+OK\r\n` | Short status reply |
| `-` | Error | `-ERR unknown command\r\n` | Error message |
| `:` | Integer | `:42\r\n` | Signed 64-bit integer |
| `$` | Bulk string | `$5\r\nhello\r\n` | Arbitrary binary string |
| `*` | Array | `*2\r\n:1\r\n:2\r\n` | Ordered list of RESP values |

**Nil bulk string** — a missing value (e.g. `GET` on a nonexistent key) is encoded as `$-1\r\n`, not as an empty string.

**Nil array** — an absent array is `*-1\r\n`.

### How commands are sent

Every command arrives as a RESP array of bulk strings. `SET foo bar` on the wire looks like:

```
*3\r\n        ← array of 3 elements
$3\r\n        ← bulk string of length 3
SET\r\n
$3\r\n        ← bulk string of length 3
foo\r\n
$3\r\n        ← bulk string of length 3
bar\r\n
```

Command names are **case-insensitive** (`set`, `SET`, and `SeT` are all valid).

### How to respond

Match the return type shown in the command tables below:

- **`+OK`** → simple string: `+OK\r\n`
- **Integer** → `:n\r\n` (e.g. `DEL` returns the count of deleted keys)
- **Bulk string** → `$<len>\r\n<data>\r\n`, or `$-1\r\n` for nil
- **Array** → `*<count>\r\n` followed by one RESP value per element
- **Error** → `-<message>\r\n`

### Parsing tips

1. Read until `\r\n` to get a line; the first byte is the type prefix.
2. For `$` (bulk string): the line gives the byte count, then read exactly that many bytes plus a trailing `\r\n`.
3. For `*` (array): the line gives the element count, then read that many RESP values recursively.

## Commands to implement

### Generic
| Command | Returns |
|---|---|
| `PING [msg]` | `+PONG` or the message as bulk string |
| `DEL key [key…]` | Integer: count of deleted keys |
| `EXISTS key [key…]` | Integer: count of existing keys |
| `TYPE key` | Simple string: `string`, `list`, `set`, or `none` |
| `EXPIRE key seconds` | `1` if set, `0` if key not found |
| `TTL key` | Seconds remaining; `-1` if no expiry; `-2` if key not found |
| `DEBUG TICK n` | `+OK` — advance the internal clock by `n` seconds (for TTL testing) |

### Strings
| Command | Returns |
|---|---|
| `SET key value [EX seconds]` | `+OK` |
| `GET key` | Bulk string or nil |
| `INCR key` | Integer (create as 0 then increment if missing) |

### Lists
| Command | Returns |
|---|---|
| `LPUSH key val [val…]` | Integer: new list length |
| `RPUSH key val [val…]` | Integer: new list length |
| `LPOP key [count]` | Bulk string, or array if count given |
| `RPOP key [count]` | Bulk string, or array if count given |
| `LRANGE key start stop` | Array |
| `LLEN key` | Integer |

### Sets
| Command | Returns |
|---|---|
| `SADD key member [member…]` | Integer: added count |
| `SREM key member [member…]` | Integer: removed count |
| `SMEMBERS key` | Array (sorted for determinism) |
| `SISMEMBER key member` | `1` or `0` |
| `SCARD key` | Integer |

## Type errors

If a command is used against a key of the wrong type, return:
```
-WRONGTYPE Operation against a key holding the wrong kind of value
```

## Notes
- Keys set with `EXPIRE` (or `SET ... EX`) expire based on the **internal clock**, which starts at 0 and is only advanced by `DEBUG TICK n`. Expired keys must not be returned by any command.
- `SMEMBERS` results must be **sorted lexicographically** for determinism.
- Your server only needs to handle one connection at a time.
