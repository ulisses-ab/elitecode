#!/bin/bash
set -e
python3 -c "import ast; ast.parse(open('code/rate_limiter.py').read())"
