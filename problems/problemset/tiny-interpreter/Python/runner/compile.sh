#!/bin/bash
set -e
python3 - <<'EOF'
import ast, sys

src = open('code/interpreter.py').read()
tree = ast.parse(src)

for node in ast.walk(tree):
    if isinstance(node, ast.Call):
        fn = node.func
        if isinstance(fn, ast.Name) and fn.id in ('eval', 'exec', 'compile'):
            print(f"ERROR: use of built-in {fn.id}() is not allowed", file=sys.stderr)
            sys.exit(1)
EOF
