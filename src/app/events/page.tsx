import type { Metadata } from "next";
import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { events, videos } from "@/db/schema";
import { ListSearchForm } from "@/components/ListSearchForm";
import { clampPage, Pagination } from "@/components/Pagination";
import { EmptyState, PageTitle } from "@/components/ui";
import { likeContains } from "@/lib/like";

export const metadata: Metadata = { title: "Events" };

const PER_PAGE = 30;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const query = (q ?? "").trim().slice(0, 100);

  const where = query ? likeContains(events.name, query) : undefined;

  const total = db.select({ n: count() }).from(events).where(where).get()?.n ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = clampPage(pageParam, totalPages);

  const rows = db
    .select({
      id: events.id,
      slug: events.slug,
      name: events.name,
      year: events.year,
      clipCount: count(videos.id),
    })
    .from(events)
    .leftJoin(videos, eq(videos.eventId, events.id))
    .where(where)
    .groupBy(events.id)
    .orderBy(desc(events.year), events.name)
    .limit(PER_PAGE)
    .offset((page - 1) * PER_PAGE)
    .all();

  return (
    <div>
      <PageTitle
        sub={`${total} event${total === 1 ? "" : "s"}${query ? ` matching “${query}”` : " where labeled clips were filmed"}${totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}.`}
      >
        Events
      </PageTitle>

      <ListSearchForm basePath="/events" query={query} placeholder="Search events by name…" />

      {rows.length === 0 ? (
        query ? (
          <EmptyState title={`No events matching “${query}”`}>
            Events appear here when a video clip is labeled with them on a move page.
          </EmptyState>
        ) : (
          <EmptyState title="No events yet">
            Events appear here automatically when video clips are labeled on move pages.
          </EmptyState>
        )
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((e) => (
            <li key={e.id}>
              <Link
                href={`/events/${e.slug}`}
                className="block bg-panel border border-line rounded-lg px-4 py-3 hover:border-denim group"
              >
                <span className="font-display font-bold text-denim group-hover:underline">
                  {e.name}
                  {e.year ? <span className="text-muted font-mono text-sm"> · {e.year}</span> : null}
                </span>
                <span className="block font-mono text-xs text-muted mt-0.5">
                  {e.clipCount} clip{e.clipCount === 1 ? "" : "s"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={page} totalPages={totalPages} basePath="/events" params={{ q: query }} />
    </div>
  );
}
