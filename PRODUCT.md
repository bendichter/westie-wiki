# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences of equal priority, forming one loop:

- **Learners**: West Coast Swing dancers looking up a move (often right after a class or social),
  watching timestamped clips of real dancers, and following curricula with progress tracking.
  Mostly mobile-plausible contexts: phone at a dance, laptop at home.
- **Contributors**: dancers who document moves, link and label video clips, write and revise
  descriptions, assemble curricula, map full dances move-by-move, and discuss on per-move threads.

When priorities conflict, neither consistently wins; the product treats learning and contributing
as two halves of the same loop.

Secondary audiences: sponsors (WCS events, instructors, shoe/gear/music vendors) evaluating the
`/sponsor` page, and admins (moderation, analytics, sponsor management under `/admin`).

## Product Purpose

A community-edited encyclopedia of West Coast Swing moves: every pattern gets a page with names,
aliases, markdown description, difficulty, tags, timestamped YouTube clips labeled with dancers
and events, prerequisite/variation/related links, and full Wikipedia-style revision history.
Curricula provide ordered learning paths; full dances are mapped move-by-move with clip playback.

Success over the next year (confirmed 2026-07): **community adoption** (traffic, accounts, repeat
visits, word of mouth in WCS scenes) and an emerging **contributor community** (a core of regular
editors so the wiki does not depend on its founder). Sponsor revenue and content depth matter but
are not the primary goals.

## Positioning

**Descriptive, not prescriptive.** The wiki records how the community actually dances and what it
actually calls things; it never defines how a move must be danced or named. Name collisions are
treated as a feature (all aliases listed, description explains). "If your teacher says something
different, listen to your teacher — then add what you learned to the wiki." This stance is the
product's identity and a durable differentiator from instructional sites and pattern databases.

Supporting mechanisms a neighbor could not truthfully copy without becoming this product:
timestamped clip evidence of real dancers at real events (only videos uploaded by the dancers or
event, or shared with the dancer's explicit permission — never workshop recaps), full revision
history on everything editable, and a browsable skill graph of move relationships.

## Operating Context

- Live at **westie.wiki**, deployed on Fly.io (`westie-wiki`, sjc) with a persistent SQLite volume
  and Litestream replication.
- Anyone can browse; editing requires a free account. Email verification and password reset send
  via Resend when `RESEND_API_KEY` is set (the README's "no verification emails" line predates
  this and is stale).
- Admins are set by `ADMIN_USERNAMES` (currently `bendichter,archivist`); admin surfaces cover
  moderation, analytics, and sponsor management.
- Sponsorship program (see SPONSOR-KIT.md): clearly-labeled cards only (Site Sponsor on move
  pages + home, Community Sponsor on home, time-boxed Event Boost), clicks counted via `/s/[id]`,
  no tracking scripts, sponsorship never influences wiki content. Founding rates $25–$50/mo until
  ~5k monthly visitors.

## Capabilities and Constraints

- Next.js 16 App Router (breaking changes vs. older Next — consult `node_modules/next/dist/docs/`
  per AGENTS.md), React Server Components + server actions, no separate API layer.
- SQLite via Drizzle (`better-sqlite3`), single file DB, WAL mode. Scrypt auth, DB-backed
  sessions, login rate limiting; no third-party auth.
- Revisions are full snapshots with optimistic concurrency (friendly conflict message, never
  silent clobber). Nothing is ever lost; any revision restorable.
- YouTube integration is keyless: oEmbed titles, `i.ytimg.com` thumbnails, embeds load only after
  click (privacy and page weight). Playback embeds only the labeled start/end segment.
- Content domain terminology: moves (with aliases, difficulty, tags), dancers (leader/follower
  labels on clips), events, curricula (steps with learner notes and key examples), dances
  (full dances mapped move-by-move), Recent Changes, favorites/practice lists.
- Testing: Vitest unit tests, Playwright-based e2e suite run against a production build.

## Brand Commitments

- **Binding**: the name Westie Wiki, the westie.wiki domain, and the editorial voice: warm,
  honest, community-first, lightly playful ("break these rules constantly and gloriously"),
  role-neutral language per the contribution guidelines, never authoritative or prescriptive.
- **Open**: the current visual identity (denim palette, header W mark, existing look) is not
  binding; future design work may redesign it. (Confirmed 2026-07.)
- Non-negotiable content ethics: video linking policy (dancer/event-uploaded or explicit
  permission only), clearly-labeled sponsorship with no editorial influence, no ad-junk, no
  tracking scripts.

## Evidence on Hand

- Seed content: 25 real WCS moves with verified video clips and 2 curricula (`npm run db:seed`).
- Live production content at westie.wiki beyond the seed (moves, dances, clips, curricula).
- SPONSOR-KIT.md: real pricing, inventory, and outreach templates.
- No testimonials, press, or traffic benchmarks yet; do not fabricate any. Traffic is
  pre-milestone (under the ~5k/mo founding-rate threshold as of 2026-07).

## Product Principles

1. **Describe, never prescribe.** Every surface and copy decision reinforces that pages are maps
   drawn by fellow travelers, not rulings; disagreement and name collisions are surfaced, not
   resolved away.
2. **Evidence over assertion.** Timestamped video of real dancers is the atomic unit of proof;
   prefer showing a clip to claiming a fact.
3. **Nothing is ever lost.** Revision history, restorability, and edit summaries are core trust
   mechanics, not power-user extras.
4. **The learn/contribute loop is one loop.** Reading should invite editing; editing should make
   reading better. Neither audience outranks the other.
5. **Free and clean stays free and clean.** Labeled sponsor cards only; no tracking, no ad junk,
   no paywalls; community trust is the asset that funds the site.
