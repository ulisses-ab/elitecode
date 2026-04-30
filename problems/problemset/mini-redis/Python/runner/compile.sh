#!/bin/bash
set -e
python3 -c "import ast; ast.parse(open('code/mini_redis.py').read())"
