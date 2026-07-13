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
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const query = (q ?? "").trim().slice(0, 100);
  const user = await getCurrentUser();

  const dances = listDances(query ? { query } : undefined);
  const totalPages = Math.max(1, Math.ceil(dances.length / PER_PAGE));
  const page = clampPage(pageParam, totalPages);
  const paged = dances.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
      />

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

      <Pagination page={page} totalPages={totalPages} basePath="/dances" params={{ q: query }} />
    </div>
  );
}
