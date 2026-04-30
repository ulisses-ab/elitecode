#!/bin/bash
set -e
cp runner/testbench.rs build/testbench.rs
cp code/rate_limiter.rs build/rate_limiter.rs
mkdir -p build/rate_limiter
for f in code/*.rs; do
    fname=$(basename "$f")
    [ "$fname" = "rate_limiter.rs" ] && continue
    cp "$f" "build/rate_limiter/$fname"
done
/usr/local/cargo/bin/rustc --edition 2021 build/testbench.rs -o build/program.out
