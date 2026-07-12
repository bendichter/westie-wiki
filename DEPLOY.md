# Deploying Westie Wiki

The app is a single Next.js server with a SQLite file database — it runs anywhere a Node
process and a persistent disk exist. The instructions below use [Fly.io](https://fly.io)
(free-tier friendly, persistent volumes, simple CLI), with notes for alternatives at the end.

## What you need

- A [Fly.io](https://fly.io) account (sign up in the browser)
- The `flyctl` CLI: `brew install flyctl`
- This repository

## Fly.io walkthrough

The repo already contains a ready `fly.toml` (app name `westie-wiki`, region `sjc`, volume
mounted at `/data`, `DATABASE_PATH` and `SEED=1` set). The app has been created on Fly; to
deploy:

1. **Log in**

   ```sh
   fly auth login
   ```

2. **Deploy** (from the repo root)

   ```sh
   fly deploy --ha=false
   ```

   `--ha=false` matters: it keeps a single machine. Fly otherwise creates two machines for
   high availability, and each would get its own volume — SQLite would split-brain. The
   `data` volume is created automatically on first deploy from the `[[mounts]]` section.

   `SEED=1` in fly.toml loads the starter content (25 moves, verified clips, 2 curricula)
   on first boot and is a no-op once moves exist.

3. **Open it**

   ```sh
   fly apps open
   ```

### Continuous deployment

`.github/workflows/fly-deploy.yml` deploys on every push to `main`, using the app-scoped
`FLY_API_TOKEN` secret already set on the GitHub repo. Delete the workflow file if you'd
rather deploy manually. Note the workflow runs plain `flyctl deploy` — after the FIRST
manual `fly deploy --ha=false`, the machine count is already 1 and later deploys keep it.

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
