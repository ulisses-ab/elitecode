#!/bin/bash
set -e
python3 - <<'EOF'
import ast, sys

try:
    src = open('code/interpreter.py', encoding='utf-8', errors='replace').read()
    tree = ast.parse(src)
except SyntaxError as e:
    print(f"SyntaxError on line {e.lineno}: {e.msg}", file=sys.stderr)
    sys.exit(1)

for node in ast.walk(tree):
    if isinstance(node, ast.Call):
        fn = node.func
        if isinstance(fn, ast.Name) and fn.id in ('eval', 'exec', 'compile'):
            print(f"ERROR: use of built-in {fn.id}() is not allowed", file=sys.stderr)
            sys.exit(1)
EOF
