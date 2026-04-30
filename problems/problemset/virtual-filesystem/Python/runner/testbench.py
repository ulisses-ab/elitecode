import sys
import json
import time
import resource

sys.path.insert(0, '/workspace/code')
from vfs import VFS

def main():
    testcase = json.loads(sys.stdin.read())
    vfs = VFS()
    output = ''

    start = time.perf_counter()

    for line in testcase['input'].splitlines():
        if not line:
            continue
        parts = line.split()
        cmd = parts[0]

        if cmd == 'MKDIR':
            output += vfs.mkdir(parts[1]) or ''
        elif cmd == 'TOUCH':
            output += vfs.touch(parts[1]) or ''
        elif cmd == 'WRITE':
            _, path, *rest = line.split(' ', 2)
            content = rest[0] if rest else ''
            output += vfs.write(path, content) or ''
        elif cmd == 'READ':
            output += vfs.read(parts[1]) or ''
        elif cmd == 'LS':
            output += vfs.ls(parts[1]) or ''
        elif cmd == 'RM':
            if parts[1] == '-r':
                output += vfs.rmr(parts[2]) or ''
            else:
                output += vfs.rm(parts[1]) or ''
        elif cmd == 'MV':
            output += vfs.mv(parts[1], parts[2]) or ''
        elif cmd == 'CP':
            output += vfs.cp(parts[1], parts[2]) or ''
        elif cmd == 'FIND':
            output += vfs.find(parts[1], parts[2]) or ''

    elapsed_ms = (time.perf_counter() - start) * 1000
    memory_kb = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    result = {'actual_output': output, 'time_ms': elapsed_ms, 'memory_kb': memory_kb}
    sys.stdout.write(f'__BEGIN_RESULT__{json.dumps(result)}__END_RESULT__')

main()
