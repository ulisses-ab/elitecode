import sys
import json
import time
import resource

sys.path.insert(0, '/workspace/code')
from chess import Chess

def main():
    testcase = json.loads(sys.stdin.read())
    game = Chess()
    output_lines = []

    start = time.perf_counter()

    for line in testcase['input'].splitlines():
        parts = line.split()
        if not parts:
            continue
        cmd = parts[0]
        if cmd == 'NEW':
            game.new_game()
        elif cmd == 'MOVE':
            output_lines.append(game.move(parts[1]))
        elif cmd == 'PRINT':
            output_lines.append(game.print_board().rstrip('\n'))
        elif cmd == 'MOVES':
            sq = parts[1] if len(parts) > 1 else ''
            output_lines.append(game.moves(sq))
        elif cmd == 'STATUS':
            output_lines.append(game.status())
        elif cmd == 'HISTORY':
            output_lines.append(game.history().rstrip('\n'))

    elapsed_ms = (time.perf_counter() - start) * 1000
    memory_kb = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    actual_output = '\n'.join(output_lines) + '\n' if output_lines else ''

    result = {'actual_output': actual_output, 'time_ms': elapsed_ms, 'memory_kb': memory_kb}
    sys.stdout.write(f'__BEGIN_RESULT__{json.dumps(result)}__END_RESULT__')

main()
