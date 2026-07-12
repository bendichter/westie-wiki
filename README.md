# Westie Wiki

A community wiki for documenting **West Coast Swing** moves — built for dancers, editable by
dancers, and explicitly **descriptive, not prescriptive**: it records how the community dances
and names things; it is a learning aid, not a source of truth about WCS.

## What it does

- **Moves** — every pattern gets a page: name, alternative names (names collide across scenes —
  that's a feature), markdown description, difficulty, and tags.
- **Wikipedia-style editing** — every edit by any member is stored as a numbered revision with
  an edit summary. View history, see side-by-side diffs, restore any revision. Nothing is ever lost.
- **Video examples** — link YouTube clips to moves with start/end timestamps (`1:23` style input,
  timestamps in pasted URLs are picked up automatically). Label each clip with the dancers
  (leader/follower) and the event. Playback embeds only the labeled segment.
- **Search by dancer** — every dancer labeled in a clip gets a page collecting all their clips,
  grouped by move. Same for events. Unified search covers moves, aliases, descriptions, dancers,
  events, and curricula.
- **Curricula** — ordered learning paths through the moves, with per-step learner notes and
  hand-picked key example videos. Wiki-editable with full revision history. Logged-in dancers
  check off moves and track progress.
- **Move relationships** — prerequisite / variation-of / related links turn the catalog into a
  browsable skill graph ("Learn first", "Variations", "Leads into" on every page).
- **Community** — per-move discussion threads, favorites/practice lists, user profiles with
  contribution history, and a site-wide Recent Changes feed.

Anyone can browse. Editing requires a free account (email + password, no verification emails).

## Quick start

Requires Node 20+.

```sh
npm install
npm run db:migrate   # create the SQLite database (data/wcs-wiki.db)
npm run db:seed      # optional: 25 real WCS moves, verified video clips, 2 curricula
npm run dev          # http://localhost:3000
```

The seed creates a demo login for **local development** — `archivist@westiewiki.example` /
`westie-demo-1234` (rotate it on any real deployment) — and
attributes all starter content to it. The seed refuses to run twice.

## Scripts

| command              | what it does                                      |
| -------------------- | ------------------------------------------------- |
| `npm run dev`        | dev server on :3000                               |
| `npm run build`      | production build                                  |
| `npm start`          | serve the production build                        |
| `npm test`           | unit tests (Vitest)                               |
| `npm run db:generate`| regenerate SQL migrations after schema changes    |
| `npm run db:migrate` | apply migrations                                  |
| `npm run db:seed`    | load starter content (no-op if moves exist)       |
| `npx tsx e2e/run-e2e.ts` | full end-to-end suite in headless Chromium (needs `npx playwright install chromium` and a running server) |

## Architecture

- **Next.js 16 App Router**, React Server Components + server actions — no separate API layer.
- **SQLite via Drizzle ORM** (`better-sqlite3`), one file at `data/wcs-wiki.db`
  (override with `DATABASE_PATH`). WAL mode, foreign keys on.
- **Auth**: scrypt-hashed passwords, DB-backed sessions in an httpOnly cookie, login rate
  limiting. No third-party auth service.
- **Revisions**: full snapshots per edit (`move_revisions`, `curriculum_revisions`) with
  optimistic concurrency — concurrent editors get a friendly conflict message instead of
  silently clobbering each other.
- **YouTube**: keyless — oEmbed for titles, `i.ytimg.com` thumbnails, embeds load only after a
  click (privacy + page weight).

```
src/
  app/            routes (moves, dancers, events, curricula, search, changes, auth, profile)
  components/     UI (move form, video cards, curriculum editor, diff view, …)
  db/             drizzle schema, migrations runner, seed
  lib/            auth, slug/time/youtube/diff utilities, server actions, data queries
e2e/              headless end-to-end suite (playwright, plain script)
drizzle/          generated SQL migrations
```

## Deploying

See [DEPLOY.md](./DEPLOY.md) — Dockerfile included; the walkthrough targets Fly.io with a
persistent volume, with notes for Railway/Render/VPS.

## The disclaimer, because it matters

West Coast Swing is a living, improvised dance. Patterns mutate, names collide, and regional
scenes disagree — the pros in the video examples break these "rules" constantly and gloriously.
If your teacher says something different from a page here, listen to your teacher. Then add
what you learned to the wiki.
