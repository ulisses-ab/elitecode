FROM docker:27-dind

# Install Node.js (Alpine-based image)
RUN apk add --no-cache nodejs npm

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/
# Sandbox image Dockerfile — built inside the DinD daemon at startup
COPY executor.Dockerfile ./executor.Dockerfile
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
