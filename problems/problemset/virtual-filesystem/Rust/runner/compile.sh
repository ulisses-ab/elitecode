#!/bin/bash
set -e
cp runner/testbench.rs build/testbench.rs
cp code/vfs.rs build/vfs.rs
mkdir -p build/vfs
for f in code/*.rs; do
    fname=$(basename "$f")
    [ "$fname" = "vfs.rs" ] && continue
    cp "$f" "build/vfs/$fname"
done
/usr/local/cargo/bin/rustc --edition 2021 build/testbench.rs -o build/program.out
