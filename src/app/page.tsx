import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { curricula, dancers, dances, events, moves } from "@/db/schema";
import { DanceCard } from "@/components/DanceCard";
import { FeaturedDance } from "@/components/FeaturedDance";
import { SponsorSlot } from "@/components/SponsorSlot";
import { ButtonLink, EmptyState } from "@/components/ui";
import { getDanceAnnotations, listDances } from "@/lib/data/dances";

export default function HomePage() {
  const stats = {
    moves: db.select({ n: count() }).from(moves).where(eq(moves.deleted, 0)).get()?.n ?? 0,
    // every registered dance, matching the count on /dances
    dances: db.select({ n: count() }).from(dances).get()?.n ?? 0,
    dancers: db.select({ n: count() }).from(dancers).get()?.n ?? 0,
    events: db.select({ n: count() }).from(events).get()?.n ?? 0,
    curricula: db.select({ n: count() }).from(curricula).where(eq(curricula.deleted, 0)).get()?.n ?? 0,
  };

  const allDances = listDances();
  // the concrete ask for new contributors: dances nobody has mapped yet
  const unmappedDances = allDances.filter((d) => d.annotationCount === 0);
  // the dances with the most moves marked show what a mapped dance looks like;
  // ties go to the one annotated most recently
  const rankedDances = allDances
    .filter((d) => d.annotationCount > 0)
    .sort(
      (a, b) =>
        b.annotationCount - a.annotationCount || (b.lastAnnotatedAt ?? 0) - (a.lastAnnotatedAt ?? 0)
    );
  // the best-mapped one is shown in the hero
  const featured = rankedDances[0];
  const featuredMoves = featured
    ? getDanceAnnotations(featured.id).map((a) => ({
        id: a.id,
        startSec: a.startSec,
        name: a.move.name,
      }))
    : [];
  // and the cards show the next four, unless that would leave the row thin
  const mappedDances = rankedDances.length > 4 ? rankedDances.slice(1, 5) : rankedDances.slice(0, 4);

  return (
    <div>
      {/* hero */}
      <section className="py-10 sm:py-16">
        <div className={featured ? "grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]" : ""}>
          <div className="max-w-3xl">
            <div className="font-mono text-[13px] text-amber mb-4">1&nbsp;&nbsp;2&nbsp;&nbsp;3&amp;4&nbsp;&nbsp;5&amp;6</div>
            <h1 className={`text-4xl font-bold leading-[1.05] text-balance ${featured ? "sm:text-5xl" : "sm:text-6xl"}`}>
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
          {featured ? (
            <FeaturedDance
              slug={featured.slug}
              youtubeId={featured.youtubeId}
              who={featured.dancers.map((d) => d.name).join(" & ") || featured.title || "Untitled dance"}
              eventLabel={
                featured.eventName ? `${featured.eventName}${featured.eventYear ? ` ${featured.eventYear}` : ""}` : null
              }
              moves={featuredMoves}
            />
          ) : null}
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
        {/* the most thoroughly mapped dances */}
        <div>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-xl font-bold">Most mapped dances</h2>
            {mappedDances.length > 0 ? (
              <Link href="/dances?sort=annotations" className="font-display text-sm text-denim underline">
                See all dances
              </Link>
            ) : null}
          </div>
          {mappedDances.length === 0 ? (
            <EmptyState title="No annotated dances yet">
              Dances are full videos mapped move by move —{" "}
              <Link href="/dances/new" className="text-denim underline">add the first one</Link>.
            </EmptyState>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {mappedDances.map((dance, i) => (
                // phones get the top two, so the "Help map a dance" panel stays within reach
                <div key={dance.id} className={i < 2 ? "contents" : "hidden sm:contents"}>
                  <DanceCard dance={dance} />
                </div>
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
