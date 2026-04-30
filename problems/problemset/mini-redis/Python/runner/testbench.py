import sys
import json
import time
import resource
import socket
import threading

sys.path.insert(0, '/workspace/code')
from mini_redis import MiniRedis

PORT = 16379

def send_cmd(sock, args):
    msg = f'*{len(args)}\r\n'
    for a in args:
        b = a.encode()
        msg += f'${len(b)}\r\n'
        sock.sendall(msg.encode() + b + b'\r\n')
        msg = ''
    if msg:
        sock.sendall(msg.encode())

def read_resp(buf, sock):
    def recv():
        chunk = sock.recv(4096)
        if chunk: buf.extend(chunk)
        return bool(chunk)

    def read_line():
        while True:
            nl = buf.find(b'\n')
            if nl >= 0:
                line = bytes(buf[:nl+1]).rstrip(b'\r\n')
                del buf[:nl+1]
                return line.decode()
            if not recv(): return ''

    def read_exact(n):
        while len(buf) < n + 2:
            if not recv(): break
        data = bytes(buf[:n]).decode()
        del buf[:n+2]
        return data

    line = read_line()
    if not line: return ''
    t, rest = line[0], line[1:]
    if t in ('+', '-'): return f'{t}{rest}\n'
    if t == ':':         return f':{rest}\n'
    if t == '$':
        n = int(rest)
        if n < 0: return '$-1\n'
        return f'${rest}\n{read_exact(n)}\n'
    if t == '*':
        count = int(rest)
        if count < 0: return '*-1\n'
        out = f'*{rest}\n'
        for _ in range(count): out += read_resp(buf, sock)
        return out
    return ''

def main():
    testcase = json.loads(sys.stdin.read())
    commands = [line.split() for line in testcase['input'].splitlines() if line.strip()]

    server = MiniRedis()
    threading.Thread(target=lambda: server.start(PORT), daemon=True).start()

    sock = None
    for _ in range(100):
        try:
            s = socket.socket()
            s.connect(('127.0.0.1', PORT))
            sock = s
            break
        except OSError:
            s.close()
            time.sleep(0.01)

    if sock is None:
        r = {'actual_output': 'ERROR: could not connect to server', 'time_ms': 0, 'memory_kb': 0}
        sys.stdout.write(f'__BEGIN_RESULT__{json.dumps(r)}__END_RESULT__')
        return

    buf = bytearray()
    output = ''
    start = time.perf_counter()

    for cmd in commands:
        send_cmd(sock, cmd)
        output += read_resp(buf, sock)

    elapsed_ms = (time.perf_counter() - start) * 1000
    memory_kb = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    sock.close()

    result = {'actual_output': output, 'time_ms': elapsed_ms, 'memory_kb': memory_kb}
    sys.stdout.write(f'__BEGIN_RESULT__{json.dumps(result)}__END_RESULT__')

main()
