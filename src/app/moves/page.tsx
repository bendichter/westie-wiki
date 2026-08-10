import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, count, desc, eq, getTableColumns, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import {
  dancers,
  moveAliases,
  moves,
  moveTags,
  tags,
  videoDancers,
  videos,
} from "@/db/schema";
import { ListSearchForm } from "@/components/ListSearchForm";
import { clampPage, Pagination } from "@/components/Pagination";
import { ButtonLink, DifficultyBadge, EmptyState, PageTitle, TagChip } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import { likeContains } from "@/lib/like";

export const metadata: Metadata = { title: "Moves" };

const PER_PAGE = 20;

type SearchParams = {
  q?: string;
  tag?: string;
  difficulty?: string;
  dancer?: string;
  sort?: string;
  page?: string;
};

export default async function MovesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, tag, difficulty, dancer, sort, page: pageParam } = await searchParams;
  const query = (q ?? "").trim().slice(0, 100);
  const user = await getCurrentUser();

  // resolve filters
  const tagRow = tag ? db.select().from(tags).where(eq(tags.slug, tag)).get() : undefined;
  const dancerRow = dancer ? db.select().from(dancers).where(eq(dancers.slug, dancer)).get() : undefined;

  let moveIdFilter: number[] | null = null;
  if (tagRow) {
    const ids = db
      .select({ moveId: moveTags.moveId })
      .from(moveTags)
      .where(eq(moveTags.tagId, tagRow.id))
      .all()
      .map((r) => r.moveId);
    moveIdFilter = ids;
  }
  if (dancerRow) {
    const ids = db
      .selectDistinct({ moveId: videos.moveId })
      .from(videos)
      .innerJoin(videoDancers, eq(videoDancers.videoId, videos.id))
      .where(eq(videoDancers.dancerId, dancerRow.id))
      .all()
      .map((r) => r.moveId);
    moveIdFilter = moveIdFilter ? moveIdFilter.filter((id) => ids.includes(id)) : ids;
  }

  const conditions = [eq(moves.deleted, 0)];
  if (difficulty === "beginner" || difficulty === "intermediate" || difficulty === "advanced") {
    conditions.push(eq(moves.difficulty, difficulty));
  }
  if (moveIdFilter) {
    if (moveIdFilter.length === 0) {
      conditions.push(eq(moves.id, -1)); // no matches
    } else {
      conditions.push(inArray(moves.id, moveIdFilter));
    }
  }
  if (query) {
    // match the move name or any of its alternative names
    const aliasIds = db
      .selectDistinct({ moveId: moveAliases.moveId })
      .from(moveAliases)
      .where(likeContains(moveAliases.name, query))
      .all()
      .map((r) => r.moveId);
    conditions.push(
      aliasIds.length > 0
        ? or(likeContains(moves.name, query), inArray(moves.id, aliasIds))!
        : likeContains(moves.name, query)
    );
  }

  const total =
    db
      .select({ n: count() })
      .from(moves)
      .where(and(...conditions))
      .get()?.n ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = clampPage(pageParam, totalPages);

  // default sort: most video examples first
  const rows = db
    .select(getTableColumns(moves))
    .from(moves)
    .leftJoin(videos, eq(videos.moveId, moves.id))
    .where(and(...conditions))
    .groupBy(moves.id)
    .orderBy(
      ...(sort === "recent"
        ? [desc(moves.updatedAt)]
        : sort === "name"
          ? [asc(moves.name)]
          : [desc(count(videos.id)), asc(moves.name)]),
      asc(moves.id)
    )
    .limit(PER_PAGE)
    .offset((page - 1) * PER_PAGE)
    .all();

  // secondary data for the list
  const moveIds = rows.map((m) => m.id);
  const aliasRows = moveIds.length
    ? db.select().from(moveAliases).where(inArray(moveAliases.moveId, moveIds)).all()
    : [];
  const tagRows = moveIds.length
    ? db
        .select({ moveId: moveTags.moveId, slug: tags.slug, name: tags.name })
        .from(moveTags)
        .innerJoin(tags, eq(tags.id, moveTags.tagId))
        .where(inArray(moveTags.moveId, moveIds))
        .all()
    : [];
  const videoCounts = moveIds.length
    ? db
        .select({ moveId: videos.moveId, n: count() })
        .from(videos)
        .where(inArray(videos.moveId, moveIds))
        .groupBy(videos.moveId)
        .all()
    : [];
  const videoCountMap = new Map(videoCounts.map((r) => [r.moveId, r.n]));

  const allTags = db.select().from(tags).orderBy(asc(tags.name)).all();

  // page resets whenever a filter or the query changes
  const filterQuery = (overrides: Partial<SearchParams>) => {
    const params = new URLSearchParams();
    const merged = { q: query, tag, difficulty, dancer, sort, ...overrides };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const qs = params.toString();
    return qs ? `/moves?${qs}` : "/moves";
  };

  const activeFilters = [
    tagRow ? { label: `tag: ${tagRow.name}`, clear: filterQuery({ tag: undefined }) } : null,
    difficulty ? { label: `difficulty: ${difficulty}`, clear: filterQuery({ difficulty: undefined }) } : null,
    dancerRow ? { label: `danced by: ${dancerRow.name}`, clear: filterQuery({ dancer: undefined }) } : null,
    query ? { label: `matching: “${query}”`, clear: filterQuery({ q: undefined }) } : null,
  ].filter(Boolean) as { label: string; clear: string }[];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageTitle
          sub={`${total} move${total === 1 ? "" : "s"}${query || activeFilters.length ? " matching" : " documented by the community"}${totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}.`}
        >
          Moves
        </PageTitle>
        {user ? <ButtonLink href="/moves/new">+ Document a move</ButtonLink> : null}
      </div>

      <ListSearchForm
        basePath="/moves"
        query={query}
        placeholder="Search moves by name or alias…"
        preserve={{ tag, difficulty, dancer, sort }}
      />

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6 font-display text-sm">
        <span className="text-muted">Difficulty:</span>
        {["beginner", "intermediate", "advanced"].map((d) => (
          <Link
            key={d}
            href={filterQuery({ difficulty: difficulty === d ? undefined : d })}
            className={`rounded-full px-3 py-1 border ${
              difficulty === d
                ? "bg-denim text-white border-denim"
                : "bg-panel border-line text-ink-soft hover:border-denim"
            }`}
          >
            {d}
          </Link>
        ))}
        <span className="text-muted ml-3">Sort:</span>
        <Link
          href={filterQuery({ sort: undefined })}
          className={`rounded-full px-3 py-1 border ${!sort || sort === "examples" ? "bg-denim text-white border-denim" : "bg-panel border-line text-ink-soft hover:border-denim"}`}
        >
          Most examples
        </Link>
        <Link
          href={filterQuery({ sort: "name" })}
          className={`rounded-full px-3 py-1 border ${sort === "name" ? "bg-denim text-white border-denim" : "bg-panel border-line text-ink-soft hover:border-denim"}`}
        >
          A–Z
        </Link>
        <Link
          href={filterQuery({ sort: "recent" })}
          className={`rounded-full px-3 py-1 border ${sort === "recent" ? "bg-denim text-white border-denim" : "bg-panel border-line text-ink-soft hover:border-denim"}`}
        >
          Recently edited
        </Link>
      </div>

      {activeFilters.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-5 font-display text-sm items-center">
          <span className="text-muted">Filtering by</span>
          {activeFilters.map((f) => (
            <Link
              key={f.label}
              href={f.clear}
              className="bg-amber-soft border border-amber/40 text-amber rounded-full px-3 py-1 hover:line-through"
              title="Remove filter"
            >
              {f.label} ✕
            </Link>
          ))}
        </div>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState title="No moves match">
          Try clearing a filter — or{" "}
          <Link href="/moves/new" className="text-denim underline">
            document this move yourself
          </Link>
          .
        </EmptyState>
      ) : (
        <ul className="divide-y divide-line border border-line rounded-lg bg-panel">
          {rows.map((move) => {
            const moveAliasList = aliasRows.filter((a) => a.moveId === move.id).map((a) => a.name);
            const moveTagList = tagRows.filter((t) => t.moveId === move.id);
            const videoCount = videoCountMap.get(move.id) ?? 0;
            return (
              <li key={move.id} className="px-4 sm:px-5 py-4">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <Link
                    href={`/moves/${move.slug}`}
                    className="font-display text-lg font-bold text-denim hover:underline"
                  >
                    {move.name}
                  </Link>
                  <DifficultyBadge difficulty={move.difficulty} />
                  <span className="font-mono text-xs text-muted">
                    {videoCount} video{videoCount === 1 ? "" : "s"}
                  </span>
                  <span className="text-xs text-muted font-display ml-auto">
                    edited {timeAgo(move.updatedAt)}
                  </span>
                </div>
                {moveAliasList.length > 0 ? (
                  <p className="text-sm text-muted font-display mt-0.5">
                    a.k.a. {moveAliasList.join(" · ")}
                  </p>
                ) : null}
                {moveTagList.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {moveTagList.map((t) => (
                      <TagChip key={t.slug} slug={t.slug} name={t.name} />
                    ))}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/moves"
        params={{ q: query, tag, difficulty, dancer, sort }}
      />

      {allTags.length > 0 ? (
        <div className="mt-8">
          <h2 className="font-display text-xs uppercase tracking-widest text-muted font-bold mb-3">
            Browse by tag
          </h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map((t) => (
              <TagChip key={t.id} slug={t.slug} name={t.name} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
