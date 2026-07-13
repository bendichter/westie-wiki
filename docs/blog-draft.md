# I built a Wikipedia for West Coast Swing in a weekend, with an AI agent doing the typing

**TL;DR:** [westie.wiki](https://westie.wiki) is a community wiki for West Coast Swing — moves documented with timestamped video of real dancers, full competition dances mapped move-by-move, and editable learning paths. I built it over a weekend with Claude as the engineer while I played product manager. This post is about what got built and what that collaboration actually felt like.

## The itch

West Coast Swing has a knowledge problem. It's a living, improvised dance — patterns mutate, names collide, every scene calls the same move something different — and its collective knowledge lives in workshop notes, YouTube comments, and the heads of teachers. When you're learning, you hear a name like "sugar tuck" and have no way to look it up, compare what different pros do with it, or figure out what to learn next.

Wikipedia solved this shape of problem for facts. I wanted the same thing for moves: pages anyone can edit, every claim backed by video evidence, revision history so nothing is ever lost — and one important inversion of the Wikipedia ethos, stated on every page: **descriptive, not prescriptive**. The wiki records how the community dances and what it calls things. It is a learning aid, not a source of truth. If your teacher disagrees with a page, listen to your teacher — then edit the page.

## What it does

- **Moves** — each pattern gets a page: description with counts and technique notes, alternative names (collisions are a feature, not a bug), difficulty, tags, and prerequisite/variation relationships that turn the catalog into a browsable skill graph.
- **Video evidence** — clips are YouTube links with start/end timestamps, labeled with who's dancing (leader/follower), at which event, and which variant of the move it shows. Search by dancer and get every move they've been tagged dancing.
- **Dances** — my favorite part. Instead of hunting clips for one move, you register a full competition video (dancers, event, division, placement, setlist) and then *annotate it while it plays*: hit "now" as each pattern starts, name the move, repeat. Every annotation becomes a labeled clip on that move's page automatically. There are 64 real dances indexed — US Open finals, Budafest invitationals, Champions Jack & Jills — waiting to be mapped.
- **Curricula** — ordered learning paths with per-step notes and hand-picked example videos, wiki-editable like everything else, with progress tracking.
- The wiki survival kit: revision diffs and restore, email-verified editing, discussion threads, moderation tools, nightly off-site backups, and a contributor leaderboard.

## How the collaboration actually worked

I wrote roughly none of the code. Over the weekend the agent produced ~12,500 lines of TypeScript across 32 commits and 13 database migrations, with a 75-step end-to-end test suite driving a real browser through every flow, and deployed it to a $6/month VM with CI on every push.

What I actually did turned out to be the interesting part. My contributions were almost entirely one-or-two-sentence product judgments, fired off whenever I looked at the site:

- "Remove the fine print in the footer — this is already said multiple times elsewhere."
- "Sometimes videos play 2 or more songs, so you should be able to annotate more than one song per video."
- "Dances should optionally be annotatable with placement. Not all are competitions, so this should be optional."
- "The song and artist should be attached to the dance, not the clip."

Each of those is a data-modeling decision wearing casual clothes. Each one turned into a migration, refactored queries, updated forms, new tests, and a deploy — usually within minutes, always with the existing data migrated rather than lost. The cost of changing my mind about the domain model dropped so low that I could treat schema design as an iterative conversation instead of an up-front commitment. That's the real unlock, more than the typing speed.

The agent pushed back sometimes, which I came to value. When I asked about searching by song, I wondered whether songs needed their own entity; it argued the canonicalization work wasn't worth it yet and wired song search over the existing text instead — deferring the model until usage proves the vocabulary. When I asked how to capture handhold variants of a move, it argued that a handhold is a *parameter* of a pattern, not a pattern, and that giving every variant its own page would explode the catalog. We landed on per-move curated "official variants" that clips can be tagged with — structure exactly where the community can maintain it. And when I told it that it was overusing my own "descriptive, not prescriptive" slogan, it trimmed the copy and apparently made a note to itself about restraint.

It also caught things I wouldn't have. A code review it ran on its own work found that a careless `.gitignore` pattern was silently excluding the entire data-access layer from version control — a fresh clone wouldn't have built. It found open-redirect vulnerabilities in the login flow, a diff algorithm a vandal could have used to crash the server, and a restore feature that quietly failed to restore tags. All fixed and regression-tested before any user existed to hit them.

It wasn't frictionless. The production email links briefly pointed at `localhost:3000` (a proxy-header bug found the moment I clicked a real verification email). The test suite went through a phase of mysterious failures that turned out to be the dev server getting flaky under repeated runs — the fix was testing against production builds, which it should arguably have done from the start. And its first pass at seeding content pinned competition videos to specific moves with hand-wavy notes like "watch for whips!" — when I called that out, the honest fix was deleting the speculation and re-homing those videos as unannotated dances. An AI that can be talked out of its own fabrications is more useful than one that never makes any.

## The part that matters now

The code was the easy half. A wiki is a social object: it's only real when the second person edits a page. Everything from here is community — which is why the whole design bends toward making contribution cheap (annotate a dance while you watch it, one phrase in a note field) and safe (nothing is ever lost, everything is attributed, disagreement goes in discussion threads instead of edit wars).

So: if you dance West Coast Swing, [go look up a move you know](https://westie.wiki/moves), and then fix what we got wrong about it. If you've got a favorite competition video, [register it and mark the moves](https://westie.wiki/dances) — the "now" button makes it weirdly satisfying, like Shazam for patterns. And if you teach: your curriculum wants to be a [learning path](https://westie.wiki/curricula).

The site is descriptive, not prescriptive. That goes for this blog post too — it describes what worked for me, this weekend, with this dance. Your mileage will vary. Edit accordingly.
