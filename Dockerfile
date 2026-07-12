# Westie Wiki — production image
#
#   docker build -t wcs-wiki .
#   docker run -p 3000:3000 -v wcs-wiki-data:/data -e DATABASE_PATH=/data/wcs-wiki.db wcs-wiki
#
# Set SEED=1 on first run to load the starter content:
#   docker run -p 3000:3000 -v wcs-wiki-data:/data -e DATABASE_PATH=/data/wcs-wiki.db -e SEED=1 wcs-wiki

FROM node:22-slim AS builder
WORKDIR /app

# native build tools for better-sqlite3
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# the build renders pages against a throwaway database
RUN DATABASE_PATH=/tmp/build.db npx drizzle-kit migrate || true
RUN DATABASE_PATH=/tmp/build.db npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_PATH=/data/wcs-wiki.db

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/src ./src
COPY --from=builder /app/drizzle.config.ts /app/next.config.ts /app/tsconfig.json ./

RUN mkdir -p /data
VOLUME /data
EXPOSE 3000

# migrate (idempotent), optionally seed, then serve
CMD ["sh", "-c", "npx tsx src/db/migrate.ts && if [ \"$SEED\" = \"1\" ]; then npx tsx src/db/seed.ts; fi && npx next start -p 3000"]
