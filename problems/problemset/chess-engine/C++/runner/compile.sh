#!/bin/bash
set -e
g++ -std=c++20 -O2 $(find runner/ code/ -name "*.cpp") -o build/program.out
