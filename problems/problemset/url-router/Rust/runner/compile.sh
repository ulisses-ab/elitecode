#!/bin/bash
set -e
cp runner/testbench.rs build/testbench.rs
cp code/router.rs build/router.rs
mkdir -p build/router
for f in code/*.rs; do
    fname=$(basename "$f")
    [ "$fname" = "router.rs" ] && continue
    cp "$f" "build/router/$fname"
done
/usr/local/cargo/bin/rustc --edition 2021 build/testbench.rs -o build/program.out
