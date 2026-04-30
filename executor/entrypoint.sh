#!/bin/sh
set -e

# Fly.io VMs run on an overlayfs rootfs. Docker's overlay2 driver requires
# the data directory to support d_type — overlayfs does not. Solution: mount
# a tmpfs at /var/lib/docker so overlay2 has a usable backing filesystem.
# The sandbox image (~400 MB) is re-pulled on every boot anyway, so the
# ephemeral nature of tmpfs is fine. 3 GB gives room for the image layers
# plus up to EXECUTOR_CONCURRENCY simultaneous containers.
mkdir -p /var/lib/docker
mount -t tmpfs -o size=3g tmpfs /var/lib/docker

echo "Starting Docker daemon (overlay2 on tmpfs)..."
dockerd \
    --storage-driver=overlay2 \
    --bridge=none \
    --iptables=false \
    --ip-masq=false \
    --userland-proxy=false \
    --dns=8.8.8.8 \
    --dns=8.8.4.4 \
    > /tmp/dockerd.log 2>&1 &
DOCKERD_PID=$!

echo "Waiting for Docker daemon..."
i=0
until docker info >/dev/null 2>&1; do
    i=$((i + 1))
    if ! kill -0 "$DOCKERD_PID" 2>/dev/null; then
        echo "ERROR: dockerd exited. Log:"
        cat /tmp/dockerd.log
        exit 1
    fi
    if [ "$i" -ge 60 ]; then
        echo "ERROR: Docker daemon did not become ready in 60s. Log:"
        cat /tmp/dockerd.log
        exit 1
    fi
    sleep 1
done
echo "Docker daemon ready."

# Pull sandbox image
echo "Pulling sandbox image from Fly registry..."
echo "${FLY_REGISTRY_TOKEN}" | docker login registry.fly.io -u x --password-stdin
docker pull registry.fly.io/elitecode-executor:sandbox
docker tag  registry.fly.io/elitecode-executor:sandbox leetcode-executor:latest
echo "Sandbox image ready."

# Smoke test
echo "Running smoke test..."
if docker run --rm --network=none leetcode-executor:latest echo "smoke-test-ok"; then
    echo "Smoke test PASSED."
else
    echo "Smoke test FAILED. dockerd log:"
    cat /tmp/dockerd.log
    exit 1
fi

# Start BullMQ worker
/app/node_modules/.bin/tsx /app/src/server.ts &
WORKER_PID=$!
echo "Worker started (PID $WORKER_PID), dockerd PID $DOCKERD_PID"

# Monitor — exit (triggering Fly restart) if either process dies
while true; do
    sleep 10

    if ! kill -0 "$DOCKERD_PID" 2>/dev/null; then
        echo "ERROR: dockerd died. Last log:"
        tail -80 /tmp/dockerd.log
        kill "$WORKER_PID" 2>/dev/null || true
        exit 1
    fi

    if ! kill -0 "$WORKER_PID" 2>/dev/null; then
        echo "ERROR: worker died."
        kill "$DOCKERD_PID" 2>/dev/null || true
        exit 1
    fi
done
