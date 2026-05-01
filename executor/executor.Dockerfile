FROM node:20-bookworm

# Install any tools your runner scripts might need.
# Adjust this list to match what runner/run.sh uses (python, gcc, etc).
RUN apt-get update && apt-get install -y \
    bash \
    python3 \
    python3-pip \
    build-essential \
    nlohmann-json3-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Rust via rustup into /usr/local/{rustup,cargo} so all users can access it
ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | \
    sh -s -- -y --no-modify-path --default-toolchain stable && \
    chmod -R a+rx /usr/local/rustup /usr/local/cargo

# Force Python 3 to use UTF-8 for file I/O regardless of the system locale
ENV PYTHONUTF8=1

# Create non-root user to run untrusted code
RUN useradd -ms /bin/bash runner
USER runner

WORKDIR /workspace

# The executor mounts the submission directory at /workspace, so we don't
# copy any project files into this image.

