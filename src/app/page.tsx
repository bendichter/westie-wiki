import Link from "next/link";
import { count, desc, eq, isNotNull, max } from "drizzle-orm";
import { db } from "@/db";
import { curricula, dancers, dances, events, moves, videos } from "@/db/schema";
import { DanceCard } from "@/components/DanceCard";
import { SponsorSlot } from "@/components/SponsorSlot";
import { ButtonLink, EmptyState } from "@/components/ui";
import { listDances } from "@/lib/data/dances";

export default function HomePage() {
  const stats = {
    moves: db.select({ n: count() }).from(moves).where(eq(moves.deleted, 0)).get()?.n ?? 0,
    // every registered dance, matching the count on /dances
    dances: db.select({ n: count() }).from(dances).get()?.n ?? 0,
    dancers: db.select({ n: count() }).from(dancers).get()?.n ?? 0,
    events: db.select({ n: count() }).from(events).get()?.n ?? 0,
    curricula: db.select({ n: count() }).from(curricula).where(eq(curricula.deleted, 0)).get()?.n ?? 0,
  };

  // the two dances whose move annotations are newest
  const recentDanceIds = db
    .select({ danceId: videos.danceId })
    .from(videos)
    .where(isNotNull(videos.danceId))
    .groupBy(videos.danceId)
    .orderBy(desc(max(videos.createdAt)))
    .limit(2)
    .all()
    .map((r) => r.danceId);
  const allDances = listDances();
  // the concrete ask for new contributors: dances nobody has mapped yet
  const unmappedDances = allDances.filter((d) => d.annotationCount === 0);
  const recentDances = allDances
    .filter((d) => recentDanceIds.includes(d.id))
    .sort((a, b) => recentDanceIds.indexOf(a.id) - recentDanceIds.indexOf(b.id));

  return (
    <div>
      {/* hero */}
      <section className="py-10 sm:py-16">
        <div className="max-w-3xl">
          <div className="font-mono text-[13px] text-amber mb-4">1&nbsp;&nbsp;2&nbsp;&nbsp;3&amp;4&nbsp;&nbsp;5&amp;6</div>
          <h1 className="text-4xl sm:text-6xl font-bold leading-[1.05]">
            The moves of West Coast Swing,{" "}
            <span className="text-denim">documented by us.</span>
          </h1>
          <p className="mt-5 text-lg text-ink-soft max-w-2xl">
            Every dance mapped move by move, with timestamps. Every marked move linked to its
            wiki page, with names, aliases, and a description. Every page editable, wiki-style,
            by anyone in the community.
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
        {/* recently annotated dances */}
        <div>
          <h2 className="text-xl font-bold mb-4">Recent contributions</h2>
          {recentDances.length === 0 ? (
            <EmptyState title="No annotated dances yet">
              Dances are full videos mapped move by move —{" "}
              <Link href="/dances/new" className="text-denim underline">add the first one</Link>.
            </EmptyState>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {recentDances.map((dance) => (
                <DanceCard key={dance.id} dance={dance} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          {unmappedDances.length > 0 ? (
            <div className="rounded-lg border border-line bg-panel p-4">
              <h2 className="text-xl font-bold mb-1">Help map a dance</h2>
              <p className="font-display text-sm text-ink-soft mb-3">
                {unmappedDances.length} {unmappedDances.length === 1 ? "dance is" : "dances are"} waiting
                for someone to mark their moves. Play one, and each time a pattern starts, tap{" "}
                <span className="font-mono">now</span> and name it.
              </p>
              <ul className="space-y-1.5 mb-3">
                {unmappedDances.slice(0, 4).map((d) => (
                  <li key={d.id}>
                    <Link href={`/dances/${d.slug}`} className="font-display font-semibold text-denim hover:underline">
                      {d.dancers.length > 0 ? d.dancers.map((x) => x.name).join(" & ") : (d.title ?? "Untitled dance")}
                    </Link>
                    {d.eventName ? (
                      <span className="font-display text-sm text-muted">
                        {" "}· {d.eventName}{d.eventYear ? ` ${d.eventYear}` : ""}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
              <Link href="/dances" className="font-display text-sm text-denim underline">
                Browse all dances
              </Link>
            </div>
          ) : null}
          <SponsorSlot />
        </div>
      </section>
    </div>
  );
}
