#!/bin/bash
set -e
cp runner/testbench.rs build/testbench.rs
cp code/chess.rs build/chess.rs
mkdir -p build/chess
for f in code/*.rs; do
    fname=$(basename "$f")
    [ "$fname" = "chess.rs" ] && continue
    cp "$f" "build/chess/$fname"
done
/usr/local/cargo/bin/rustc --edition 2021 build/testbench.rs -o build/program.out
