#!/bin/bash
set -e
cp runner/testbench.rs build/testbench.rs
cp code/mini_redis.rs build/mini_redis.rs
mkdir -p build/mini_redis
for f in code/*.rs; do
    fname=$(basename "$f")
    [ "$fname" = "mini_redis.rs" ] && continue
    cp "$f" "build/mini_redis/$fname"
done
/usr/local/cargo/bin/rustc --edition 2021 build/testbench.rs -o build/program.out
