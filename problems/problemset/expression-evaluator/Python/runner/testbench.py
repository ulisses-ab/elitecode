import sys
import json
import time
import resource

import builtins

# --- whitelist builtins ---
ALLOWED_BUILTINS = {
    "abs": abs,
    "min": min,
    "max": max,
    "pow": pow,
    "float": float,
    "int": int,
    "str": str,
    "len": len,
    "range": range,
    "enumerate": enumerate,
}

builtins.__dict__.clear()
builtins.__dict__.update(ALLOWED_BUILTINS)

# --------------------------------

sys.path.insert(0, '/workspace/code')
from evaluator import Evaluator

def fmt(v):
    return f'{v:.6g}'

def main():
    testcase = json.loads(sys.stdin.read())
    ev = Evaluator()
    output_lines = []

    start = time.perf_counter()

    for line in testcase['input'].splitlines():
        if not line:
            continue
        if line.startswith('SET '):
            _, name, val = line.split()
            ev.set(name, float(val))
        elif line.startswith('EVAL '):
            expr = line[5:]
            output_lines.append(fmt(ev.eval(expr)))

    elapsed_ms = (time.perf_counter() - start) * 1000
    memory_kb = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    actual_output = '\n'.join(output_lines) + '\n' if output_lines else ''

    result = {'actual_output': actual_output, 'time_ms': elapsed_ms, 'memory_kb': memory_kb}
    sys.stdout.write(f'__BEGIN_RESULT__{json.dumps(result)}__END_RESULT__')

main()
