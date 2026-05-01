#!/bin/bash
set -e
python3 - << 'EOF'
import ast, sys
try:
    src = open('code/mini_redis.py', encoding='utf-8', errors='replace').read()
    ast.parse(src)
except SyntaxError as e:
    print(f"SyntaxError on line {e.lineno}: {e.msg}", file=sys.stderr)
    sys.exit(1)
EOF
