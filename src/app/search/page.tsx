import type { Metadata } from "next";
import Link from "next/link";
import { and, eq, inArray, or, sql, type SQL } from "drizzle-orm";
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import { db } from "@/db";
import { curricula, dancers, danceSongs, dances, events, moveAliases, moves } from "@/db/schema";
import { getDanceDancers } from "@/lib/data/dances";
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
        <PageTitle sub="Search moves, alternative names, descriptions, dances, songs, dancers, events, and curricula.">
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

  // split the query into words and require every word to match somewhere, so
  // "MADJam Bryn" finds a dance whose event and dancer each carry one word;
  // escape LIKE metacharacters so searching for "100%" or "s_gar" is literal
  const tokens = query
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => `%${t.replace(/[\\%_]/g, (m) => `\\${m}`)}%`);
  // every word must match at least one of the given columns
  const matches = (...columns: AnySQLiteColumn[]): SQL =>
    and(
      ...tokens.map(
        (p) => or(...columns.map((c) => sql`${c} LIKE ${p} ESCAPE '\\'`))!
      )
    )!;

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

  // dances match on everything a person might describe them by: title,
  // competition, event, dancers, and songs, concatenated into one haystack so
  // each word can land in a different field
  const danceIdRows = db.all<{ id: number }>(sql`
    SELECT d.id AS id,
      coalesce(d.title, '') || ' ' || coalesce(d.competition, '') || ' '
        || coalesce(e.name, '') || ' ' || coalesce(e.year, '') || ' '
        || coalesce(group_concat(dr.name, ' '), '') || ' '
        || coalesce(group_concat(ds.song, ' '), '') || ' '
        || coalesce(group_concat(ds.artist, ' '), '') AS haystack
    FROM dances d
    LEFT JOIN events e ON e.id = d.event_id
    LEFT JOIN dance_dancers dd ON dd.dance_id = d.id
    LEFT JOIN dancers dr ON dr.id = dd.dancer_id
    LEFT JOIN dance_songs ds ON ds.dance_id = d.id
    GROUP BY d.id
    HAVING ${sql.join(
      tokens.map((p) => sql`haystack LIKE ${p} ESCAPE '\\'`),
      sql` AND `
    )}
    LIMIT 15
  `);
  const danceIds = danceIdRows.map((r) => r.id);
  // annotate results whose songs matched, like before
  const songMatches = db
    .selectDistinct({ danceId: danceSongs.danceId, song: danceSongs.song, artist: danceSongs.artist })
    .from(danceSongs)
    .where(matches(danceSongs.song, danceSongs.artist))
    .limit(15)
    .all();
  const songByDance = new Map(songMatches.map((r) => [r.danceId, r]));
  const danceResults =
    danceIds.length > 0
      ? db
          .select({
            id: dances.id,
            slug: dances.slug,
            title: dances.title,
            competition: dances.competition,
            eventName: events.name,
            eventYear: events.year,
          })
          .from(dances)
          .leftJoin(events, eq(events.id, dances.eventId))
          .where(inArray(dances.id, danceIds))
          .all()
          .map((d) => ({
            ...d,
            dancerNames: getDanceDancers(d.id).map((x) => x.name),
            matchedSong: songByDance.get(d.id) ?? null,
          }))
      : [];

  const dancerResults = db.select().from(dancers).where(matches(dancers.name)).limit(15).all();
  const eventResults = db
    .select()
    .from(events)
    .where(matches(events.name, events.year))
    .limit(15)
    .all();
  const curriculumResults = db
    .select()
    .from(curricula)
    .where(and(eq(curricula.deleted, 0), matches(curricula.title, curricula.description)))
    .limit(15)
    .all();

  const total =
    moveResults.length +
    danceResults.length +
    dancerResults.length +
    eventResults.length +
    curriculumResults.length;

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

          {danceResults.length > 0 ? (
            <section>
              <h2 className="text-lg font-bold mb-3">Dances</h2>
              <ul className="divide-y divide-line border border-line rounded-lg bg-panel">
                {danceResults.map((d) => (
                  <li key={d.id} className="px-4 py-3 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <Link
                      href={`/dances/${d.slug}`}
                      className="font-display font-bold text-denim hover:underline"
                    >
                      {d.dancerNames.length > 0
                        ? d.dancerNames.join(" & ")
                        : (d.title ?? "Untitled dance")}
                    </Link>
                    {d.eventName ? (
                      <span className="text-sm text-muted font-display">
                        {d.eventName}
                        {d.eventYear ? ` ${d.eventYear}` : ""}
                        {d.competition ? ` · ${d.competition}` : ""}
                      </span>
                    ) : d.competition ? (
                      <span className="text-sm text-muted font-display">{d.competition}</span>
                    ) : null}
                    {d.matchedSong ? (
                      <span className="text-sm text-muted font-display">
                        ♪ {d.matchedSong.song}
                        {d.matchedSong.song && d.matchedSong.artist ? " — " : ""}
                        {d.matchedSong.artist}
                      </span>
                    ) : null}
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
