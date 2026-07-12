import type { Metadata } from "next";
import Link from "next/link";
import { and, eq, or, sql, type SQL } from "drizzle-orm";
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import { db } from "@/db";
import { curricula, dancers, events, moveAliases, moves } from "@/db/schema";
import { DifficultyBadge, EmptyState, PageTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim().slice(0, 100);

  if (!query) {
    return (
      <div className="max-w-2xl">
        <PageTitle sub="Search moves, alternative names, descriptions, dancers, events, and curricula.">
          Search
        </PageTitle>
        <form action="/search" className="flex gap-2">
          <input
            type="search"
            name="q"
            autoFocus
            placeholder="e.g. whip, sugar push, or a dancer's name"
            aria-label="Search"
            className="flex-1 bg-panel border border-line rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-denim/50 font-display"
          />
          <button
            type="submit"
            className="bg-denim text-white font-display font-semibold rounded-md px-5 hover:bg-denim-deep cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>
    );
  }

  // escape LIKE metacharacters so searching for "100%" or "s_gar" is literal
  const pattern = `%${query.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
  const matches = (column: AnySQLiteColumn): SQL => sql`${column} LIKE ${pattern} ESCAPE '\\'`;

  // moves by name or alias (deduped, name matches ranked first)
  const nameMatches = db
    .select()
    .from(moves)
    .where(and(eq(moves.deleted, 0), matches(moves.name)))
    .limit(25)
    .all();
  const aliasMatches = db
    .select({ move: moves, alias: moveAliases.name })
    .from(moveAliases)
    .innerJoin(moves, eq(moves.id, moveAliases.moveId))
    .where(and(eq(moves.deleted, 0), matches(moveAliases.name)))
    .limit(25)
    .all();
  const descriptionMatches = db
    .select()
    .from(moves)
    .where(and(eq(moves.deleted, 0), matches(moves.description)))
    .limit(25)
    .all();

  const seen = new Set<number>();
  const moveResults: { move: typeof nameMatches[number]; via: string | null }[] = [];
  for (const m of nameMatches) {
    if (!seen.has(m.id)) {
      seen.add(m.id);
      moveResults.push({ move: m, via: null });
    }
  }
  for (const { move, alias } of aliasMatches) {
    if (!seen.has(move.id)) {
      seen.add(move.id);
      moveResults.push({ move, via: `a.k.a. “${alias}”` });
    }
  }
  for (const m of descriptionMatches) {
    if (!seen.has(m.id)) {
      seen.add(m.id);
      moveResults.push({ move: m, via: "mentioned in description" });
    }
  }

  const dancerResults = db.select().from(dancers).where(matches(dancers.name)).limit(15).all();
  const eventResults = db.select().from(events).where(matches(events.name)).limit(15).all();
  const curriculumResults = db
    .select()
    .from(curricula)
    .where(and(eq(curricula.deleted, 0), or(matches(curricula.title), matches(curricula.description))))
    .limit(15)
    .all();

  const total =
    moveResults.length + dancerResults.length + eventResults.length + curriculumResults.length;

  return (
    <div className="max-w-3xl">
      <PageTitle sub={`${total} result${total === 1 ? "" : "s"} for “${query}”.`}>Search</PageTitle>

      <form action="/search" className="flex gap-2 mb-8">
        <input
          type="search"
          name="q"
          defaultValue={query}
          aria-label="Search"
          className="flex-1 bg-panel border border-line rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-denim/50 font-display"
        />
        <button
          type="submit"
          className="bg-denim text-white font-display font-semibold rounded-md px-5 hover:bg-denim-deep cursor-pointer"
        >
          Search
        </button>
      </form>

      {total === 0 ? (
        <EmptyState title={`Nothing found for “${query}”`}>
          Know this move by another name? It might be documented under a different one — or{" "}
          <Link href="/moves/new" className="text-denim underline">
            add it yourself
          </Link>
          .
        </EmptyState>
      ) : (
        <div className="space-y-8">
          {moveResults.length > 0 ? (
            <section>
              <h2 className="text-lg font-bold mb-3">Moves</h2>
              <ul className="divide-y divide-line border border-line rounded-lg bg-panel">
                {moveResults.map(({ move, via }) => (
                  <li key={move.id} className="px-4 py-3 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <Link
                      href={`/moves/${move.slug}`}
                      className="font-display font-bold text-denim hover:underline"
                    >
                      {move.name}
                    </Link>
                    <DifficultyBadge difficulty={move.difficulty} />
                    {via ? <span className="text-sm text-muted font-display">{via}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {dancerResults.length > 0 ? (
            <section>
              <h2 className="text-lg font-bold mb-3">Dancers</h2>
              <ul className="divide-y divide-line border border-line rounded-lg bg-panel">
                {dancerResults.map((d) => (
                  <li key={d.id} className="px-4 py-3">
                    <Link
                      href={`/dancers/${d.slug}`}
                      className="font-display font-bold text-denim hover:underline"
                    >
                      {d.name}
                    </Link>
                    <span className="text-sm text-muted font-display ml-2">see their labeled clips</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {eventResults.length > 0 ? (
            <section>
              <h2 className="text-lg font-bold mb-3">Events</h2>
              <ul className="divide-y divide-line border border-line rounded-lg bg-panel">
                {eventResults.map((e) => (
                  <li key={e.id} className="px-4 py-3">
                    <Link
                      href={`/events/${e.slug}`}
                      className="font-display font-bold text-denim hover:underline"
                    >
                      {e.name}
                      {e.year ? ` (${e.year})` : ""}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {curriculumResults.length > 0 ? (
            <section>
              <h2 className="text-lg font-bold mb-3">Curricula</h2>
              <ul className="divide-y divide-line border border-line rounded-lg bg-panel">
                {curriculumResults.map((c) => (
                  <li key={c.id} className="px-4 py-3">
                    <Link
                      href={`/curricula/${c.slug}`}
                      className="font-display font-bold text-denim hover:underline"
                    >
                      {c.title}
                    </Link>
                    {c.description ? (
                      <p className="text-sm text-muted font-display mt-0.5 line-clamp-1">{c.description}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
