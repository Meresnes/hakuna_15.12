# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/tsconfig.json ./
COPY backend/src ./src

RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY backend/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY db/migrations ./db/migrations

# Verify migrations directory exists
RUN test -d /app/db/migrations || (echo "ERROR: Migrations directory not found!" && exit 1) && \
    echo "✅ Migrations directory verified: /app/db/migrations" && \
    ls -la /app/db/migrations

EXPOSE 3001

CMD ["node", "dist/server.js"]
