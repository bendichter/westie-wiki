# Deploying Westie Wiki

The app is a single Next.js server with a SQLite file database — it runs anywhere a Node
process and a persistent disk exist. The instructions below use [Fly.io](https://fly.io)
(free-tier friendly, persistent volumes, simple CLI), with notes for alternatives at the end.

## What you need

- A [Fly.io](https://fly.io) account (sign up in the browser)
- The `flyctl` CLI: `brew install flyctl`
- This repository

## Fly.io walkthrough

1. **Log in**

   ```sh
   fly auth login
   ```

2. **Create the app** (run from the repo root; don't deploy yet)

   ```sh
   fly launch --no-deploy --name your-wcs-wiki --region sjc
   ```

   When it asks about Postgres/Redis, say no — the app uses SQLite. `fly launch` detects the
   Dockerfile automatically and writes `fly.toml`.

3. **Create a volume for the database** (1 GB is plenty to start)

   ```sh
   fly volumes create wcs_data --size 1 --region sjc
   ```

4. **Wire the volume and database path into `fly.toml`** — add these sections:

   ```toml
   [mounts]
     source = "wcs_data"
     destination = "/data"

   [env]
     DATABASE_PATH = "/data/wcs-wiki.db"
   ```

   Also make sure the service section maps internal port 3000 (fly launch usually sets
   `internal_port = 3000` from the Dockerfile's EXPOSE — verify).

   Because SQLite lives on one disk, keep a single machine:

   ```sh
   fly scale count 1
   ```

5. **First deploy, with seed content**

   ```sh
   fly deploy --env SEED=1
   ```

   `SEED=1` loads the starter content (25 moves, verified video clips, 2 curricula) on first
   boot. The seed is skipped automatically if the database already has moves, but for
   subsequent deploys just use plain `fly deploy`.

6. **Open it**

   ```sh
   fly apps open
   ```

### Backups

The whole site is one file. To snapshot it:

```sh
fly ssh console -C "cat /data/wcs-wiki.db" > backup-$(date +%F).db
```

(For a hot database under write load, prefer `sqlite3 /data/wcs-wiki.db '.backup /data/backup.db'`
via `fly ssh console`, then download that file. Fly also snapshots volumes daily by default.)

## Alternatives

- **Railway / Render**: both build the Dockerfile directly. Attach a persistent disk mounted
  at `/data`, set `DATABASE_PATH=/data/wcs-wiki.db`, and set `SEED=1` for the first deploy.
- **A VPS**: `docker build -t wcs-wiki . && docker run -d -p 3000:3000 -v wcs-wiki-data:/data -e SEED=1 wcs-wiki`,
  then put Caddy or nginx in front for TLS.
- **Vercel**: not recommended as-is — serverless has no persistent disk for SQLite. You'd need
  to swap the Drizzle driver to Turso/libSQL or Postgres first (the schema and queries port
  directly).

## Notes for production

- Sessions are stored in the database; no extra secret configuration is required.
- Login rate limiting is in-memory per process — fine for one machine, resets on deploy.
- All write actions require an account; browsing is public.
- The demo account seeded on first boot is `archivist@westiewiki.example` / `westie-demo-1234`.
  Change that password (or delete the row in `users`) if you don't want a shared login floating
  around: `fly ssh console -C "sqlite3 /data/wcs-wiki.db \"DELETE FROM sessions; UPDATE users SET password_hash='locked' WHERE username='archivist';\""`
