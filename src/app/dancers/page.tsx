import type { Metadata } from "next";
import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { dancers, videoDancers } from "@/db/schema";
import { EmptyState, PageTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Dancers" };

export default function DancersPage() {
  const rows = db
    .select({
      id: dancers.id,
      slug: dancers.slug,
      name: dancers.name,
      clipCount: count(videoDancers.videoId),
    })
    .from(dancers)
    .leftJoin(videoDancers, eq(videoDancers.dancerId, dancers.id))
    .groupBy(dancers.id)
    .orderBy(asc(dancers.name))
    .all();

  return (
    <div>
      <PageTitle sub="Everyone labeled in a video clip. Click a dancer to see every move they've been tagged dancing.">
        Dancers
      </PageTitle>

      {rows.length === 0 ? (
        <EmptyState title="No dancers labeled yet">
          Dancers appear here automatically when video clips are labeled on move pages.
        </EmptyState>
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
                  {d.clipCount} labeled clip{d.clipCount === 1 ? "" : "s"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
