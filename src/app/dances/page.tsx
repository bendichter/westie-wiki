import type { Metadata } from "next";
import Link from "next/link";
import { DanceCard } from "@/components/DanceCard";
import { ListSearchForm } from "@/components/ListSearchForm";
import { clampPage, Pagination } from "@/components/Pagination";
import { ButtonLink, EmptyState, PageTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { listDances } from "@/lib/data/dances";

export const metadata: Metadata = { title: "Dances" };

const PER_PAGE = 12;

export default async function DancesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
}) {
  const { q, page: pageParam, sort } = await searchParams;
  const query = (q ?? "").trim().slice(0, 100);
  const user = await getCurrentUser();

  const dances = listDances(query ? { query } : undefined);
  // default: most recently annotated first; unannotated dances fall to the end
  if (sort === "annotations") {
    dances.sort((a, b) => b.annotationCount - a.annotationCount || b.createdAt - a.createdAt);
  } else if (sort !== "added") {
    dances.sort((a, b) => (b.lastAnnotatedAt ?? 0) - (a.lastAnnotatedAt ?? 0) || b.createdAt - a.createdAt);
  }
  const totalPages = Math.max(1, Math.ceil(dances.length / PER_PAGE));
  const page = clampPage(pageParam, totalPages);
  const paged = dances.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const sortHref = (s?: string) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (s) params.set("sort", s);
    const qs = params.toString();
    return qs ? `/dances?${qs}` : "/dances";
  };
  const sortChips: { key?: string; label: string }[] = [
    { key: undefined, label: "Recently annotated" },
    { key: "annotations", label: "Most annotations" },
    { key: "added", label: "Recently added" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageTitle
          sub={`${dances.length} dance${dances.length === 1 ? "" : "s"}${query ? ` matching “${query}”` : ", mapped move by move"}${totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}. Open one to watch with its move timeline — or to keep marking.`}
        >
          Dances
        </PageTitle>
        {user ? <ButtonLink href="/dances/new">+ Register a dance</ButtonLink> : null}
      </div>

      <ListSearchForm
        basePath="/dances"
        query={query}
        placeholder="Search by song, artist, dancer, or event…"
        preserve={{ sort }}
      />

      <div className="flex flex-wrap items-center gap-2 mb-6 font-display text-sm">
        <span className="text-muted">Sort:</span>
        {sortChips.map((chip) => (
          <Link
            key={chip.label}
            href={sortHref(chip.key)}
            className={`rounded-full px-3 py-1 border ${
              (sort ?? undefined) === chip.key || (!sort && !chip.key)
                ? "bg-denim text-white border-denim"
                : "bg-panel border-line text-ink-soft hover:border-denim"
            }`}
          >
            {chip.label}
          </Link>
        ))}
      </div>

      {paged.length === 0 ? (
        query ? (
          <EmptyState title={`No dances matching “${query}”`}>
            Songs are community-annotated — the dance you&apos;re after may just not have its
            setlist filled in yet.
          </EmptyState>
        ) : (
          <EmptyState title="No dances registered yet">
            Register a competition or demo video and mark every move in it —{" "}
            {user ? (
              <Link href="/dances/new" className="text-denim underline">
                start with your favorite Jack &amp; Jill
              </Link>
            ) : (
              <Link href="/login?next=/dances/new" className="text-denim underline">
                log in to add the first one
              </Link>
            )}
            .
          </EmptyState>
        )
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paged.map((dance) => (
            <li key={dance.id}>
              <DanceCard dance={dance} />
            </li>
          ))}
        </ul>
      )}

      <Pagination page={page} totalPages={totalPages} basePath="/dances" params={{ q: query, sort }} />
    </div>
  );
}
