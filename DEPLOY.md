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

### Password-reset email (Resend)

Password reset works out of the box but only *logs* the reset link to the server console
(`fly logs`) until an email provider is configured. To actually deliver email:

1. Create a free [Resend](https://resend.com) account (100 emails/day free).
2. Add the `westie.wiki` domain in Resend and create the DNS records it asks for at your
   registrar (TXT + DKIM records — Resend shows exactly what to add).
3. Create an API key and set it on the app:

   ```sh
   fly secrets set RESEND_API_KEY=re_xxxxxxxx
   ```

The From address defaults to `Westie Wiki <noreply@westie.wiki>`; override with
`fly secrets set MAIL_FROM='...'` if needed.

### Backups

Three layers protect the database:

1. **Fly volume snapshots** — automatic, daily, ~5-day retention. Last-resort only.
2. **Nightly off-site backup (already active)** — `.github/workflows/db-backup.yml` pulls a
   consistent snapshot off the volume every night, verifies `PRAGMA integrity_check`, and
   stores it as a GitHub Actions artifact for 30 days. Run it on demand from the Actions tab
   ("DB Backup" → Run workflow). To restore: download the artifact, then
   `fly ssh sftp shell -a westie-wiki` → `put backup.db /data/wcs-wiki.db` (with the app
   stopped: `fly machine stop <id>` first, `fly machine start <id>` after).
3. **Continuous replication with Litestream (optional, recommended once the site matters)** —
   the image ships with Litestream; it activates when secrets are set. With Cloudflare R2
   (free tier: 10 GB):

   1. Create an R2 bucket (e.g. `westie-wiki-backup`) in the Cloudflare dashboard.
   2. Create an R2 API token with edit access to that bucket.
   3. Set the secrets:

      ```sh
      fly secrets set \
        LITESTREAM_REPLICA_URL=s3://westie-wiki-backup/db \
        LITESTREAM_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com \
        LITESTREAM_ACCESS_KEY_ID=... \
        LITESTREAM_SECRET_ACCESS_KEY=...
      ```

   The app restarts under `litestream replicate` (10-second sync interval, 30-day retention).
   On a fresh volume the entrypoint auto-restores from the replica before starting — so a
   destroyed volume recovers to within seconds of the last write. Manual restore:
   `litestream restore -config /app/litestream.yml /data/wcs-wiki.db` via `fly ssh console`.

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
