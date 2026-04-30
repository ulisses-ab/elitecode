#!/bin/bash
set -e
g++ -std=c++20 $(find runner/ code/ -name "*.cpp") -o build/program.out -lpthread
