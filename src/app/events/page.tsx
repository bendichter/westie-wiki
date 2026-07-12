import type { Metadata } from "next";
import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { events, videos } from "@/db/schema";
import { EmptyState, PageTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Events" };

export default function EventsPage() {
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
    .groupBy(events.id)
    .orderBy(desc(events.year), events.name)
    .all();

  return (
    <div>
      <PageTitle sub="Conventions and competitions where labeled clips were filmed.">Events</PageTitle>

      {rows.length === 0 ? (
        <EmptyState title="No events yet">
          Events appear here automatically when video clips are labeled on move pages.
        </EmptyState>
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
    </div>
  );
}
