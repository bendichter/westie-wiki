import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { curricula, dancers, moveRevisions, moves, users, videos } from "@/db/schema";
import { ButtonLink, CountChip, EmptyState } from "@/components/ui";
import { timeAgo } from "@/lib/format";

export default function HomePage() {
  const stats = {
    moves: db.select({ n: count() }).from(moves).where(eq(moves.deleted, 0)).get()?.n ?? 0,
    videos: db.select({ n: count() }).from(videos).get()?.n ?? 0,
    dancers: db.select({ n: count() }).from(dancers).get()?.n ?? 0,
    curricula: db.select({ n: count() }).from(curricula).where(eq(curricula.deleted, 0)).get()?.n ?? 0,
  };

  const recentEdits = db
    .select({
      moveName: moves.name,
      moveSlug: moves.slug,
      editSummary: moveRevisions.editSummary,
      editor: users.username,
      createdAt: moveRevisions.createdAt,
      revisionNo: moveRevisions.revisionNo,
    })
    .from(moveRevisions)
    .innerJoin(moves, eq(moves.id, moveRevisions.moveId))
    .innerJoin(users, eq(users.id, moveRevisions.editorId))
    .where(eq(moves.deleted, 0))
    .orderBy(desc(moveRevisions.createdAt))
    .limit(8)
    .all();

  const featuredCurricula = db
    .select()
    .from(curricula)
    .where(eq(curricula.deleted, 0))
    .orderBy(desc(curricula.updatedAt))
    .limit(3)
    .all();

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
            <ButtonLink href="/moves">Browse the moves</ButtonLink>
            <ButtonLink href="/curricula" variant="secondary">
              Start a learning path
            </ButtonLink>
          </div>
        </div>

        <div className="mt-12 slot-line" aria-hidden />
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm text-muted">
          <span><strong className="text-ink">{stats.moves}</strong> moves</span>
          <span><strong className="text-ink">{stats.videos}</strong> video clips</span>
          <span><strong className="text-ink">{stats.dancers}</strong> dancers</span>
          <span><strong className="text-ink">{stats.curricula}</strong> curricula</span>
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1fr_360px] mt-4">
        {/* recent edits */}
        <div>
          <h2 className="text-xl font-bold mb-4">Recent edits</h2>
          {recentEdits.length === 0 ? (
            <EmptyState title="No edits yet">
              The wiki is brand new. <Link href="/moves/new" className="text-denim underline">Document the first move</Link>.
            </EmptyState>
          ) : (
            <ul className="divide-y divide-line border border-line rounded-lg bg-panel">
              {recentEdits.map((edit, i) => (
                <li key={i} className="px-4 py-3 flex items-baseline gap-3">
                  <CountChip>r{edit.revisionNo}</CountChip>
                  <div className="min-w-0">
                    <Link
                      href={`/moves/${edit.moveSlug}`}
                      className="font-display font-semibold text-denim hover:underline"
                    >
                      {edit.moveName}
                    </Link>
                    <span className="text-sm text-muted font-display">
                      {" "}
                      — {edit.editSummary || "edited"} · {edit.editor} · {timeAgo(edit.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* curricula + about */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Learning paths</h2>
            {featuredCurricula.length === 0 ? (
              <EmptyState title="No curricula yet">
                Curricula are ordered lists of moves with notes and key videos —{" "}
                <Link href="/curricula/new" className="text-denim underline">build one</Link>.
              </EmptyState>
            ) : (
              <ul className="space-y-3">
                {featuredCurricula.map((c) => (
                  <li key={c.id} className="border border-line rounded-lg bg-panel p-4">
                    <Link
                      href={`/curricula/${c.slug}`}
                      className="font-display font-bold text-denim hover:underline"
                    >
                      {c.title}
                    </Link>
                    <p className="text-sm text-muted mt-1 font-display line-clamp-2">{c.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border border-amber/40 bg-amber-soft/40 rounded-lg p-4 text-[15px]">
            <div className="font-display font-bold text-amber mb-1">A map, not the territory</div>
            <p className="text-ink-soft">
              This wiki is descriptive, not prescriptive: it records how the community dances and
              names moves. It&apos;s a learning aid — not a source of truth about West Coast Swing.{" "}
              <Link href="/about" className="text-denim underline">Read the whole disclaimer</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
