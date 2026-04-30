FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma/ ./prisma/
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src/ ./src/

# DATABASE_URL is only needed at runtime, but prisma.config.ts reads it at generate time.
# Provide a dummy value so prisma generate succeeds during the build stage.
RUN DATABASE_URL=postgresql://build:build@localhost/build npx prisma generate && npx tsc

EXPOSE 3030

CMD ["sh", "-c", "npx prisma db push && node dist/server.js"]
