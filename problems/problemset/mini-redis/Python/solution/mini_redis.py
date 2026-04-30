import socket
from collections import deque

WRONGTYPE = "WRONGTYPE Operation against a key holding the wrong kind of value"

class _Entry:
    __slots__ = ('type', 'str_val', 'list_val', 'set_val', 'zset_val', 'expire_at')
    def __init__(self, type_=None):
        self.type      = type_
        self.str_val   = ''
        self.list_val  = deque()
        self.set_val   = set()
        self.zset_val  = {}   # member -> score
        self.expire_at = -1

class _Store:
    def __init__(self):
        self._d   = {}
        self._now = 0

    def _dead(self, k):
        e = self._d.get(k)
        if e is None: return True
        if e.expire_at >= 0 and e.expire_at <= self._now:
            del self._d[k]; return True
        return False

    def alive(self, k):
        return not self._dead(k)

    def get(self, k):
        return None if self._dead(k) else self._d[k]

    def make(self, k, t):
        if self._dead(k):
            e = _Entry(t); self._d[k] = e
        else:
            e = self._d[k]
            if e.type is None: e.type = t
        return e

    def reset(self, k):
        e = _Entry(); self._d[k] = e; return e

    def erase(self, k):  self._d.pop(k, None)
    def flush(self):     self._d.clear()
    def tick(self, n):   self._now += n
    def time(self):      return self._now

    def dbsize(self):
        ks = list(self._d.keys())
        return sum(1 for k in ks if self.alive(k))


class MiniRedis:
    def __init__(self):
        self._s = _Store()

    # ── RESP reader ───────────────────────────────────────────────────────────

    @staticmethod
    def _read_cmd(buf, conn):
        # buf is a bytearray used as a read buffer
        def recv_into():
            chunk = conn.recv(4096)
            if chunk: buf.extend(chunk)
            return bool(chunk)

        def read_line():
            while True:
                nl = buf.find(b'\n')
                if nl >= 0:
                    line = bytes(buf[:nl+1])
                    del buf[:nl+1]
                    return line.rstrip(b'\r\n')
                if not recv_into(): return None

        def read_exact(n):
            while len(buf) < n + 2:
                if not recv_into(): return None
            data = bytes(buf[:n])
            del buf[:n+2]
            return data

        line = read_line()
        if not line or not line.startswith(b'*'): return None
        try: argc = int(line[1:])
        except ValueError: return None
        args = []
        for _ in range(argc):
            blen = read_line()
            if not blen or not blen.startswith(b'$'): return None
            try: n = int(blen[1:])
            except ValueError: return None
            arg = read_exact(n)
            if arg is None: return None
            args.append(arg.decode())
        return args

    # ── RESP writer ───────────────────────────────────────────────────────────

    @staticmethod
    def _w(conn, s): conn.sendall(s if isinstance(s, bytes) else s.encode())

    @classmethod
    def _simple(cls, c, s):   cls._w(c, f'+{s}\r\n')
    @classmethod
    def _err(cls, c, s):      cls._w(c, f'-{s}\r\n')
    @classmethod
    def _int(cls, c, n):      cls._w(c, f':{n}\r\n')
    @classmethod
    def _nil(cls, c):         cls._w(c, '$-1\r\n')
    @classmethod
    def _earr(cls, c):        cls._w(c, '*0\r\n')

    @classmethod
    def _bulk(cls, c, s):
        b = s.encode(); cls._w(c, f'${len(b)}\r\n'.encode() + b + b'\r\n')

    @classmethod
    def _arr(cls, c, items):
        cls._w(c, f'*{len(items)}\r\n')
        for item in items: cls._bulk(c, item)

    # ── Command dispatch ──────────────────────────────────────────────────────

    def _dispatch(self, conn, args):
        if not args: return
        cmd = args[0].upper()
        s = self._s

        if cmd == 'PING':
            if len(args) > 1: self._bulk(conn, args[1])
            else: self._simple(conn, 'PONG')

        elif cmd == 'FLUSHALL':
            s.flush(); self._simple(conn, 'OK')

        elif cmd == 'DBSIZE':
            self._int(conn, s.dbsize())

        elif cmd == 'DEL':
            n = 0
            for k in args[1:]:
                if s.alive(k): s.erase(k); n += 1
            self._int(conn, n)

        elif cmd == 'EXISTS':
            self._int(conn, sum(1 for k in args[1:] if s.alive(k)))

        elif cmd == 'TYPE':
            e = s.get(args[1])
            self._simple(conn, e.type if e else 'none')

        elif cmd == 'EXPIRE':
            e = s.get(args[1])
            if not e: self._int(conn, 0); return
            e.expire_at = s.time() + int(args[2])
            self._int(conn, 1)

        elif cmd == 'TTL':
            e = s.get(args[1])
            if not e: self._int(conn, -2); return
            self._int(conn, -1 if e.expire_at < 0 else e.expire_at - s.time())

        elif cmd == 'DEBUG':
            sub = args[1].upper() if len(args) > 1 else ''
            if sub == 'TICK' and len(args) >= 3:
                s.tick(int(args[2])); self._simple(conn, 'OK')
            else:
                self._err(conn, 'ERR unknown DEBUG subcommand')

        elif cmd == 'SET':
            e = s.reset(args[1]); e.type = 'string'; e.str_val = args[2]
            i = 3
            while i + 1 < len(args):
                if args[i].upper() == 'EX':
                    e.expire_at = s.time() + int(args[i+1]); i += 2
                else: i += 1
            self._simple(conn, 'OK')

        elif cmd == 'GET':
            e = s.get(args[1])
            if not e: self._nil(conn); return
            if e.type != 'string': self._err(conn, WRONGTYPE); return
            self._bulk(conn, e.str_val)

        elif cmd == 'MSET':
            for i in range(1, len(args) - 1, 2):
                e = s.reset(args[i]); e.type = 'string'; e.str_val = args[i+1]
            self._simple(conn, 'OK')

        elif cmd == 'MGET':
            self._w(conn, f'*{len(args)-1}\r\n')
            for k in args[1:]:
                e = s.get(k)
                if e and e.type == 'string': self._bulk(conn, e.str_val)
                else: self._nil(conn)

        elif cmd in ('INCR', 'INCRBY'):
            by = int(args[2]) if cmd == 'INCRBY' else 1
            e = s.make(args[1], 'string')
            if e.type != 'string': self._err(conn, WRONGTYPE); return
            if not e.str_val: e.str_val = '0'
            try: v = int(e.str_val) + by
            except ValueError:
                self._err(conn, 'ERR value is not an integer or out of range'); return
            e.str_val = str(v); self._int(conn, v)

        elif cmd == 'APPEND':
            e = s.make(args[1], 'string')
            if e.type != 'string': self._err(conn, WRONGTYPE); return
            e.str_val += args[2]; self._int(conn, len(e.str_val))

        elif cmd in ('LPUSH', 'RPUSH'):
            e = s.make(args[1], 'list')
            if e.type != 'list': self._err(conn, WRONGTYPE); return
            for v in args[2:]:
                if cmd == 'LPUSH': e.list_val.appendleft(v)
                else: e.list_val.append(v)
            self._int(conn, len(e.list_val))

        elif cmd in ('LPOP', 'RPOP'):
            e = s.get(args[1])
            if not e or not e.list_val: self._nil(conn); return
            if e.type != 'list': self._err(conn, WRONGTYPE); return
            left = cmd == 'LPOP'
            if len(args) >= 3:
                cnt = int(args[2]); res = []
                while cnt > 0 and e.list_val:
                    res.append(e.list_val.popleft() if left else e.list_val.pop()); cnt -= 1
                if not e.list_val: s.erase(args[1])
                self._arr(conn, res)
            else:
                v = e.list_val.popleft() if left else e.list_val.pop()
                if not e.list_val: s.erase(args[1])
                self._bulk(conn, v)

        elif cmd == 'LRANGE':
            e = s.get(args[1])
            if not e: self._earr(conn); return
            if e.type != 'list': self._err(conn, WRONGTYPE); return
            lst = list(e.list_val); ln = len(lst)
            a, b = int(args[2]), int(args[3])
            if a < 0: a = max(0, ln + a)
            if b < 0: b = ln + b
            b = min(b, ln - 1)
            if a > b: self._earr(conn); return
            self._arr(conn, lst[a:b+1])

        elif cmd == 'LLEN':
            e = s.get(args[1])
            if not e: self._int(conn, 0); return
            if e.type != 'list': self._err(conn, WRONGTYPE); return
            self._int(conn, len(e.list_val))

        elif cmd == 'SADD':
            e = s.make(args[1], 'set')
            if e.type != 'set': self._err(conn, WRONGTYPE); return
            n = 0
            for v in args[2:]:
                if v not in e.set_val: e.set_val.add(v); n += 1
            self._int(conn, n)

        elif cmd == 'SREM':
            e = s.get(args[1])
            if not e: self._int(conn, 0); return
            if e.type != 'set': self._err(conn, WRONGTYPE); return
            n = 0
            for v in args[2:]:
                if v in e.set_val: e.set_val.discard(v); n += 1
            if not e.set_val: s.erase(args[1])
            self._int(conn, n)

        elif cmd == 'SMEMBERS':
            e = s.get(args[1])
            if not e: self._earr(conn); return
            if e.type != 'set': self._err(conn, WRONGTYPE); return
            self._arr(conn, sorted(e.set_val))

        elif cmd == 'SISMEMBER':
            e = s.get(args[1])
            if not e: self._int(conn, 0); return
            if e.type != 'set': self._err(conn, WRONGTYPE); return
            self._int(conn, 1 if args[2] in e.set_val else 0)

        elif cmd == 'SCARD':
            e = s.get(args[1])
            if not e: self._int(conn, 0); return
            if e.type != 'set': self._err(conn, WRONGTYPE); return
            self._int(conn, len(e.set_val))

        elif cmd == 'ZADD':
            e = s.make(args[1], 'zset')
            if e.type != 'zset': self._err(conn, WRONGTYPE); return
            n = 0
            for i in range(2, len(args) - 1, 2):
                m = args[i+1]
                if m not in e.zset_val: n += 1
                e.zset_val[m] = float(args[i])
            self._int(conn, n)

        elif cmd == 'ZREM':
            e = s.get(args[1])
            if not e: self._int(conn, 0); return
            if e.type != 'zset': self._err(conn, WRONGTYPE); return
            n = 0
            for v in args[2:]:
                if v in e.zset_val: del e.zset_val[v]; n += 1
            if not e.zset_val: s.erase(args[1])
            self._int(conn, n)

        elif cmd == 'ZSCORE':
            e = s.get(args[1])
            if not e or args[2] not in e.zset_val: self._nil(conn); return
            self._bulk(conn, '%g' % e.zset_val[args[2]])

        elif cmd == 'ZRANK':
            e = s.get(args[1])
            if not e: self._nil(conn); return
            if e.type != 'zset': self._err(conn, WRONGTYPE); return
            srt = sorted(e.zset_val.items(), key=lambda x: (x[1], x[0]))
            for i, (m, _) in enumerate(srt):
                if m == args[2]: self._int(conn, i); return
            self._nil(conn)

        elif cmd == 'ZRANGE':
            e = s.get(args[1])
            if not e: self._earr(conn); return
            if e.type != 'zset': self._err(conn, WRONGTYPE); return
            srt = sorted(e.zset_val.items(), key=lambda x: (x[1], x[0]))
            ln = len(srt); a, b = int(args[2]), int(args[3])
            if a < 0: a = max(0, ln + a)
            if b < 0: b = ln + b
            b = min(b, ln - 1)
            ws = len(args) >= 5 and args[4].upper() == 'WITHSCORES'
            res = []
            for i in range(a, b + 1):
                res.append(srt[i][0])
                if ws: res.append('%g' % srt[i][1])
            if not res: self._earr(conn)
            else: self._arr(conn, res)

        elif cmd == 'ZCARD':
            e = s.get(args[1])
            if not e: self._int(conn, 0); return
            if e.type != 'zset': self._err(conn, WRONGTYPE); return
            self._int(conn, len(e.zset_val))

        else:
            self._err(conn, f"ERR unknown command '{args[0]}'")

    # ── Server loop ───────────────────────────────────────────────────────────

    def start(self, port):
        srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        srv.bind(('', port))
        srv.listen(5)
        while True:
            conn, _ = srv.accept()
            buf = bytearray()
            while True:
                args = self._read_cmd(buf, conn)
                if args is None: break
                self._dispatch(conn, args)
            conn.close()
