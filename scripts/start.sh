#!/bin/sh
# Production entrypoint: migrate → optional seed → serve.
# When LITESTREAM_REPLICA_URL is set, the server runs under Litestream for
# continuous off-site replication; on a fresh/empty volume it first attempts
# to restore the database from the replica.
set -e

if [ -n "$LITESTREAM_REPLICA_URL" ] && [ ! -f "$DATABASE_PATH" ]; then
  echo "No database on volume — attempting restore from replica..."
  litestream restore -config /app/litestream.yml -if-replica-exists "$DATABASE_PATH" || true
fi

npx tsx src/db/migrate.ts
if [ "$SEED" = "1" ]; then
  npx tsx src/db/seed.ts
fi

if [ -n "$LITESTREAM_REPLICA_URL" ]; then
  echo "Starting under Litestream replication."
  exec litestream replicate -config /app/litestream.yml -exec "npx next start -p 3000"
else
  exec npx next start -p 3000
fi
