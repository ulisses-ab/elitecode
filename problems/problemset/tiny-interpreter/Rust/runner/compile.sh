#!/bin/bash
set -e
cp runner/testbench.rs build/testbench.rs
cp code/interpreter.rs build/interpreter.rs
mkdir -p build/interpreter
for f in code/*.rs; do
    fname=$(basename "$f")
    [ "$fname" = "interpreter.rs" ] && continue
    cp "$f" "build/interpreter/$fname"
done
/usr/local/cargo/bin/rustc --edition 2021 build/testbench.rs -o build/program.out
