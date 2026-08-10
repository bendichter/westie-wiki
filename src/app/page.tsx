import Link from "next/link";
import { count, countDistinct, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { curricula, curriculumRevisions, dancers, events, moveRevisions, moves, users, videos } from "@/db/schema";
import { SponsorSlot } from "@/components/SponsorSlot";
import { ButtonLink, CountChip, EmptyState } from "@/components/ui";
import { timeAgo } from "@/lib/format";

export default function HomePage() {
  const stats = {
    moves: db.select({ n: count() }).from(moves).where(eq(moves.deleted, 0)).get()?.n ?? 0,
    dances: db.select({ n: countDistinct(videos.danceId) }).from(videos).where(isNotNull(videos.danceId)).get()?.n ?? 0,
    dancers: db.select({ n: count() }).from(dancers).get()?.n ?? 0,
    events: db.select({ n: count() }).from(events).get()?.n ?? 0,
    curricula: db.select({ n: count() }).from(curricula).where(eq(curricula.deleted, 0)).get()?.n ?? 0,
  };

  // merged feed: move edits, clip additions, and curriculum edits
  const moveEdits = db
    .select({
      title: moves.name,
      href: moves.slug,
      detail: moveRevisions.editSummary,
      who: users.username,
      createdAt: moveRevisions.createdAt,
    })
    .from(moveRevisions)
    .innerJoin(moves, eq(moves.id, moveRevisions.moveId))
    .innerJoin(users, eq(users.id, moveRevisions.editorId))
    .where(eq(moves.deleted, 0))
    .orderBy(desc(moveRevisions.createdAt))
    .limit(10)
    .all()
    .map((e) => ({ ...e, kind: "edit" as const, href: `/moves/${e.href}` }));

  const clipAdds = db
    .select({
      title: moves.name,
      href: moves.slug,
      who: users.username,
      createdAt: videos.createdAt,
    })
    .from(videos)
    .innerJoin(moves, eq(moves.id, videos.moveId))
    .innerJoin(users, eq(users.id, videos.addedBy))
    .where(eq(moves.deleted, 0))
    .orderBy(desc(videos.createdAt))
    .limit(10)
    .all()
    .map((e) => ({ ...e, kind: "clip" as const, detail: "added a video clip", href: `/moves/${e.href}` }));

  const curriculumEdits = db
    .select({
      title: curricula.title,
      href: curricula.slug,
      detail: curriculumRevisions.editSummary,
      who: users.username,
      createdAt: curriculumRevisions.createdAt,
    })
    .from(curriculumRevisions)
    .innerJoin(curricula, eq(curricula.id, curriculumRevisions.curriculumId))
    .innerJoin(users, eq(users.id, curriculumRevisions.editorId))
    .where(eq(curricula.deleted, 0))
    .orderBy(desc(curriculumRevisions.createdAt))
    .limit(10)
    .all()
    .map((e) => ({ ...e, kind: "path" as const, href: `/curricula/${e.href}` }));

  const contributions = [...moveEdits, ...clipAdds, ...curriculumEdits]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 8);

  return (
    <div>
      {/* hero */}
      <section className="py-10 sm:py-16">
        <div className="max-w-3xl">
          <div className="font-mono text-[13px] text-amber mb-4">1&nbsp;&nbsp;2&nbsp;&nbsp;3&amp;4&nbsp;&nbsp;5&amp;6</div>
          <h1 className="text-4xl sm:text-6xl font-bold leading-[1.05]">
            The moves of West Coast Swing,{" "}
            <span className="text-denim">documented by the people dancing them.</span>
          </h1>
          <p className="mt-5 text-lg text-ink-soft max-w-2xl">
            Every move with its names and its aliases. Every description backed by timestamped
            video of real dancers at real events. Every page editable, wiki-style, by anyone in the
            community.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/dances">Watch dances</ButtonLink>
            <ButtonLink href="/moves" variant="secondary">
              Browse moves
            </ButtonLink>
            <ButtonLink href="/curricula" variant="secondary">
              Start a learning path
            </ButtonLink>
          </div>
        </div>

        <div className="mt-12 slot-line" aria-hidden />
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm text-muted">
          <Link href="/dances" className="group hover:text-denim hover:underline underline-offset-4">
            <strong className="text-ink group-hover:text-denim">{stats.dances}</strong> dances
          </Link>
          <Link href="/moves" className="group hover:text-denim hover:underline underline-offset-4">
            <strong className="text-ink group-hover:text-denim">{stats.moves}</strong> moves
          </Link>
          <Link href="/dancers" className="group hover:text-denim hover:underline underline-offset-4">
            <strong className="text-ink group-hover:text-denim">{stats.dancers}</strong> dancers
          </Link>
          <Link href="/events" className="group hover:text-denim hover:underline underline-offset-4">
            <strong className="text-ink group-hover:text-denim">{stats.events}</strong> events
          </Link>
          <Link href="/curricula" className="group hover:text-denim hover:underline underline-offset-4">
            <strong className="text-ink group-hover:text-denim">{stats.curricula}</strong> curricula
          </Link>
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1fr_360px] mt-4">
        {/* recent contributions */}
        <div>
          <h2 className="text-xl font-bold mb-4">Recent contributions</h2>
          {contributions.length === 0 ? (
            <EmptyState title="No contributions yet">
              The wiki is brand new. <Link href="/moves/new" className="text-denim underline">Document the first move</Link>.
            </EmptyState>
          ) : (
            <ul className="divide-y divide-line border border-line rounded-lg bg-panel">
              {contributions.map((entry, i) => (
                <li key={i} className="px-4 py-3 flex items-baseline gap-3">
                  <CountChip>{entry.kind}</CountChip>
                  <div className="min-w-0">
                    <Link
                      href={entry.href}
                      className="font-display font-semibold text-denim hover:underline"
                    >
                      {entry.title}
                    </Link>
                    <span className="text-sm text-muted font-display">
                      {" "}
                      — {entry.detail || "edited"} ·{" "}
                      <Link href={`/users/${entry.who}`} className="hover:underline">{entry.who}</Link> · {timeAgo(entry.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-8">
          <SponsorSlot />
        </div>
      </section>
    </div>
  );
}
