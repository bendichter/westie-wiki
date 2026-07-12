import type { Metadata } from "next";
import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { danceDancers, dancers, videoDancers } from "@/db/schema";
import { ListSearchForm } from "@/components/ListSearchForm";
import { clampPage, Pagination } from "@/components/Pagination";
import { EmptyState, PageTitle } from "@/components/ui";
import { likeContains } from "@/lib/like";

export const metadata: Metadata = { title: "Dancers" };

const PER_PAGE = 30;

export default async function DancersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const query = (q ?? "").trim().slice(0, 100);

  const where = query ? likeContains(dancers.name, query) : undefined;

  const total = db.select({ n: count() }).from(dancers).where(where).get()?.n ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = clampPage(pageParam, totalPages);

  const rows = db
    .select({
      id: dancers.id,
      slug: dancers.slug,
      name: dancers.name,
      clipCount: count(videoDancers.videoId),
    })
    .from(dancers)
    .leftJoin(videoDancers, eq(videoDancers.dancerId, dancers.id))
    .where(where)
    .groupBy(dancers.id)
    .orderBy(asc(dancers.name), asc(dancers.id))
    .limit(PER_PAGE)
    .offset((page - 1) * PER_PAGE)
    .all();

  const danceCounts = new Map(
    rows.length > 0
      ? db
          .select({ dancerId: danceDancers.dancerId, n: count() })
          .from(danceDancers)
          .groupBy(danceDancers.dancerId)
          .all()
          .map((r) => [r.dancerId, r.n])
      : []
  );

  return (
    <div>
      <PageTitle
        sub={`${total} dancer${total === 1 ? "" : "s"}${query ? ` matching “${query}”` : " labeled in video clips"}${totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}. Click a dancer to see every move they've been tagged dancing.`}
      >
        Dancers
      </PageTitle>

      <ListSearchForm basePath="/dancers" query={query} placeholder="Search dancers by name…" />

      {rows.length === 0 ? (
        query ? (
          <EmptyState title={`No dancers matching “${query}”`}>
            Dancers appear here when they&apos;re labeled in a video clip on a move page.
          </EmptyState>
        ) : (
          <EmptyState title="No dancers labeled yet">
            Dancers appear here automatically when video clips are labeled on move pages.
          </EmptyState>
        )
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((d) => (
            <li key={d.id}>
              <Link
                href={`/dancers/${d.slug}`}
                className="block bg-panel border border-line rounded-lg px-4 py-3 hover:border-denim group"
              >
                <span className="font-display font-bold text-denim group-hover:underline">
                  {d.name}
                </span>
                <span className="block font-mono text-xs text-muted mt-0.5">
                  {danceCounts.get(d.id) ?? 0} dance{(danceCounts.get(d.id) ?? 0) === 1 ? "" : "s"} ·{" "}
                  {d.clipCount} labeled clip{d.clipCount === 1 ? "" : "s"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={page} totalPages={totalPages} basePath="/dancers" params={{ q: query }} />
    </div>
  );
}
