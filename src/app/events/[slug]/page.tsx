import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { DanceCard } from "@/components/DanceCard";
import { VideoCard } from "@/components/VideoCard";
import { EmptyState, PageTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getEventClips, groupClipsByMove } from "@/lib/data/clips";
import { listDances } from "@/lib/data/dances";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = db.select().from(events).where(eq(events.slug, slug)).get();
  if (!event) return { title: "Event not found" };
  const name = `${event.name}${event.year ? ` ${event.year}` : ""}`;
  return {
    title: `${name} — West Coast Swing dances & clips`,
    description: `Dances and labeled move clips from ${name} on Westie Wiki.`,
    alternates: { canonical: `/events/${event.slug}` },
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = db.select().from(events).where(eq(events.slug, slug)).get();
  if (!event) notFound();

  const user = await getCurrentUser();
  const clips = getEventClips(event.id);
  const groups = groupClipsByMove(clips);
  const eventDances = listDances({ eventId: event.id });

  return (
    <div>
      <PageTitle
        sub={`${eventDances.length} dance${eventDances.length === 1 ? "" : "s"} · ${clips.length} labeled clip${clips.length === 1 ? "" : "s"} across ${groups.length} move${groups.length === 1 ? "" : "s"} from this event.`}
      >
        {event.name}
        {event.year ? <span className="text-muted font-mono text-2xl"> · {event.year}</span> : null}
      </PageTitle>

      {eventDances.length > 0 ? (
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold">Dances</h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {eventDances.map((dance) => (
              <li key={dance.id}>
                <DanceCard dance={dance} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <h2 className="mb-4 text-xl font-bold">Clips by move</h2>
      {groups.length === 0 ? (
        <EmptyState title="No clips from this event yet">
          Mark moves in one of the dances above, or label a video with this event on any move
          page, and clips will show up here.
        </EmptyState>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.moveId}>
              <div className="flex items-baseline gap-3 mb-4">
                <h2 className="text-xl font-bold">
                  <Link href={`/moves/${group.moveSlug}`} className="text-denim hover:underline">
                    {group.moveName}
                  </Link>
                </h2>
                <span className="font-mono text-xs text-muted">
                  {group.clips.length} clip{group.clips.length === 1 ? "" : "s"}
                </span>
                <div className="slot-line flex-1 self-center hidden sm:block" aria-hidden />
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.clips.map((clip) => (
                  <VideoCard key={clip.id} video={clip} currentUserId={user?.id ?? null} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
