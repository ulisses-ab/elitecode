#!/bin/bash
set -e
cp runner/testbench.rs build/testbench.rs
cp code/evaluator.rs build/evaluator.rs
mkdir -p build/evaluator
for f in code/*.rs; do
    fname=$(basename "$f")
    [ "$fname" = "evaluator.rs" ] && continue
    cp "$f" "build/evaluator/$fname"
done
/usr/local/cargo/bin/rustc --edition 2021 build/testbench.rs -o build/program.out
