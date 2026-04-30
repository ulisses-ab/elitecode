import sys
import json
import time
import resource

sys.path.insert(0, '/workspace/code')
from router import Router

def main():
    testcase = json.loads(sys.stdin.read())
    router = Router()
    output_lines = []

    start = time.perf_counter()

    for line in testcase['input'].splitlines():
        parts = line.split()
        if not parts:
            continue
        cmd = parts[0]
        if cmd == 'REGISTER':
            router.register(parts[1], parts[2])
        elif cmd == 'MATCH':
            result = router.match(parts[1], parts[2])
            if result is None or not result.pattern:
                output_lines.append('NOTFOUND')
            else:
                out = parts[1] + ' ' + result.pattern
                for k, v in result.params:
                    out += ' ' + k + '=' + v
                output_lines.append(out)

    elapsed_ms = (time.perf_counter() - start) * 1000
    memory_kb = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    actual_output = '\n'.join(output_lines) + '\n' if output_lines else ''

    result = {'actual_output': actual_output, 'time_ms': elapsed_ms, 'memory_kb': memory_kb}
    sys.stdout.write(f'__BEGIN_RESULT__{json.dumps(result)}__END_RESULT__')

main()
