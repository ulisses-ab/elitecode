#ifndef MINI_REDIS_H
#define MINI_REDIS_H

/* Start a RESP-compatible TCP server on the given port.
   Accept connections one at a time. For each connection, read RESP commands
   and write RESP responses until the client disconnects.
   This function should block until the process exits.

   Supported commands (same semantics as Redis):
     String:  SET, GET, DEL, EXISTS, EXPIRE, TTL, TYPE
     List:    LPUSH, RPUSH, LPOP, RPOP, LRANGE, LLEN
     Set:     SADD, SREM, SMEMBERS, SISMEMBER, SCARD
     ZSet:    ZADD, ZRANGE, ZRANK, ZSCORE, ZCARD
     Server:  PING, FLUSHALL */

void mini_redis_start(int port);

#endif
