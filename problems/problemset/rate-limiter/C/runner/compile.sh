#!/bin/bash
set -e
gcc -std=c11 -O2 $(find runner/ code/ -name "*.c") -o build/program.out -lm
