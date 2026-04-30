import sys
import json
import time
import resource

sys.path.insert(0, '/workspace/code')
from interpreter import Interpreter

import builtins
del builtins.eval, builtins.exec, builtins.compile

def main():
    testcase = json.loads(sys.stdin.read())

    interp = Interpreter()

    start = time.perf_counter()
    output = interp.run(testcase['input'])
    elapsed_ms = (time.perf_counter() - start) * 1000
    memory_kb = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss

    result = {'actual_output': output, 'time_ms': elapsed_ms, 'memory_kb': memory_kb}
    sys.stdout.write(f'__BEGIN_RESULT__{json.dumps(result)}__END_RESULT__')

main()
