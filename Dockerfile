# syntax=docker/dockerfile:1

# All dependencies (dev ones are needed for the build: tailwind, postcss)
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# The build does not touch the database, so no .env is needed here
RUN npm run build

# Runtime dependencies only
FROM node:22-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOST=0.0.0.0 \
    PORT=3301

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --chown=node:node package.json next.config.mjs ./
# Used by `node scripts/setup.mjs` (creates tables and the first admin)
COPY --chown=node:node scripts ./scripts
COPY --chown=node:node database ./database
# Image uploads: mount a volume here so they survive new images
RUN mkdir -p uploads && chown node:node uploads

USER node
EXPOSE 3301
CMD ["sh", "-c", "exec node_modules/.bin/next start -H \"$HOST\" -p \"$PORT\""]
