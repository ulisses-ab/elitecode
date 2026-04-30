#!/bin/bash
set -e
python3 -c "import ast; ast.parse(open('code/evaluator.py').read())"
