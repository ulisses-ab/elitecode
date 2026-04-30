#!/bin/bash
set -e
cp runner/testbench.rs build/testbench.rs
cp code/ttl_cache.rs build/ttl_cache.rs
mkdir -p build/ttl_cache
for f in code/*.rs; do
    fname=$(basename "$f")
    [ "$fname" = "ttl_cache.rs" ] && continue
    cp "$f" "build/ttl_cache/$fname"
done
/usr/local/cargo/bin/rustc --edition 2021 build/testbench.rs -o build/program.out
