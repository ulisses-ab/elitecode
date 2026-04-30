#!/bin/sh
# Build the sandbox image and push it to the Fly registry.
# Run this once before deploying (or whenever executor.Dockerfile changes).
#
# Usage: ./push-sandbox.sh
#
# Requires: flyctl installed and authenticated (`flyctl auth login`)
set -e

APP="elitecode-executor"
TAG="registry.fly.io/${APP}:sandbox"

echo "==> Authenticating with Fly registry..."
flyctl auth docker

echo "==> Building sandbox image..."
docker build -f executor.Dockerfile -t "$TAG" .

echo "==> Pushing sandbox image to $TAG ..."
docker push "$TAG"

echo "==> Done. Sandbox image is live at $TAG"
echo ""
echo "Next: set the registry token as a Fly secret so the executor can pull it:"
echo "  flyctl secrets set -a $APP FLY_REGISTRY_TOKEN=\$(flyctl auth token)"
echo ""
echo "Then deploy:"
echo "  flyctl deploy"
