import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { DanceCard } from "@/components/DanceCard";
import { clampPage, Pagination } from "@/components/Pagination";
import { TabNav } from "@/components/TabNav";
import { VideoCard } from "@/components/VideoCard";
import { EmptyState, PageTitle } from "@/components/ui";
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { getEventClips, groupClipsByDance, groupClipsByMove } from "@/lib/data/clips";
import { listDances } from "@/lib/data/dances";

const DANCES_PER_PAGE = 12;
const MOVE_GROUPS_PER_PAGE = 8;

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

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const { slug } = await params;
  const { tab: tabParam, page: pageParam } = await searchParams;
  const event = db.select().from(events).where(eq(events.slug, slug)).get();
  if (!event) notFound();

  const user = await getCurrentUser();
  const clips = getEventClips(event.id);
  const groups = groupClipsByMove(clips);
  const eventDances = listDances({ eventId: event.id });

  const tab =
    tabParam === "moves" || tabParam === "dances"
      ? tabParam
      : eventDances.length > 0
        ? "dances"
        : "moves";
  const basePath = `/events/${event.slug}`;

  const danceTotalPages = Math.max(1, Math.ceil(eventDances.length / DANCES_PER_PAGE));
  const moveTotalPages = Math.max(1, Math.ceil(groups.length / MOVE_GROUPS_PER_PAGE));
  const page = clampPage(pageParam, tab === "dances" ? danceTotalPages : moveTotalPages);

  const pagedDances = eventDances.slice((page - 1) * DANCES_PER_PAGE, page * DANCES_PER_PAGE);
  const pagedGroups = groups.slice((page - 1) * MOVE_GROUPS_PER_PAGE, page * MOVE_GROUPS_PER_PAGE);

  return (
    <div>
      <PageTitle
        sub={`${eventDances.length} dance${eventDances.length === 1 ? "" : "s"} · ${clips.length} labeled clip${clips.length === 1 ? "" : "s"} across ${groups.length} move${groups.length === 1 ? "" : "s"} from this event.`}
      >
        {event.name}
        {event.year ? <span className="text-muted font-mono text-2xl"> · {event.year}</span> : null}
      </PageTitle>

      <TabNav
        activeId={tab}
        items={[
          { id: "dances", label: "Dances", count: eventDances.length, href: `${basePath}?tab=dances` },
          { id: "moves", label: "Moves", count: groups.length, href: `${basePath}?tab=moves` },
        ]}
      />

      {tab === "dances" ? (
        <>
          {pagedDances.length === 0 ? (
            <EmptyState title="No dances from this event yet">
              Register a full video filmed at {event.name} and it will show up here.
            </EmptyState>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pagedDances.map((dance) => (
                <li key={dance.id}>
                  <DanceCard dance={dance} />
                </li>
              ))}
            </ul>
          )}
          <Pagination page={page} totalPages={danceTotalPages} basePath={basePath} params={{ tab: "dances" }} />
        </>
      ) : (
        <>
          {pagedGroups.length === 0 ? (
            <EmptyState title="No clips from this event yet">
              Mark moves in one of the event&apos;s dances, or label a video with this event on
              any move page, and clips will show up here.
            </EmptyState>
          ) : (
            <div className="space-y-10">
              {pagedGroups.map((group) => (
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
                    {groupClipsByDance(group.clips).map((g) => (
                      <VideoCard
                        key={g.primary.id}
                        video={g.primary}
                        extraClips={g.extras}
                        currentUserId={user?.id ?? null}
                        currentUserIsAdmin={isAdmin(user)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
          <Pagination page={page} totalPages={moveTotalPages} basePath={basePath} params={{ tab: "moves" }} />
        </>
      )}
    </div>
  );
}
