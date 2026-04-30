#!/bin/bash
set -e
python3 -c "import ast; ast.parse(open('code/ttl_cache.py').read())"
