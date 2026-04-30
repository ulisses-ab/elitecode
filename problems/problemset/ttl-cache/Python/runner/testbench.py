import sys
import json
import time
import resource

sys.path.insert(0, '/workspace/code')
from ttl_cache import TTLCache

def main():
    testcase = json.loads(sys.stdin.read())
    cache = TTLCache()
    output_lines = []

    start = time.perf_counter()

    for line in testcase['input'].splitlines():
        parts = line.split()
        if not parts:
            continue
        cmd = parts[0]
        if cmd == 'SET':
            cache.set(parts[1], parts[2], int(parts[3]))
        elif cmd == 'GET':
            val = cache.get(parts[1])
            output_lines.append('""' if not val else val)
        elif cmd == 'DEL':
            cache.delete(parts[1])
        elif cmd == 'SIZE':
            output_lines.append(str(cache.size()))
        elif cmd == 'TICK':
            cache.tick(int(parts[1]))

    elapsed_ms = (time.perf_counter() - start) * 1000
    memory_kb = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    actual_output = '\n'.join(output_lines) + '\n' if output_lines else ''

    result = {'actual_output': actual_output, 'time_ms': elapsed_ms, 'memory_kb': memory_kb}
    sys.stdout.write(f'__BEGIN_RESULT__{json.dumps(result)}__END_RESULT__')

main()
