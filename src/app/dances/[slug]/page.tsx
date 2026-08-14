import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { dancers as dancersTable, events, handholds as handholdsTable, moves, moveVariants, users } from "@/db/schema";
import { DanceAnnotator } from "@/components/DanceAnnotator";
import { EditDanceDetailsForm } from "@/components/EditDanceDetailsForm";
import { ReportForm } from "@/components/ReportForm";
import { JsonLd } from "@/components/JsonLd";
import { CountChip } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import {
  getDanceAnnotations,
  getDanceBySlug,
  getDanceDancers,
  getDanceEvent,
  getDanceSongs,
} from "@/lib/data/dances";
import { formatDate } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dance = getDanceBySlug(slug);
  if (!dance) return { title: "Dance not found" };
  const who = getDanceDancers(dance.id).map((d) => d.name).join(" & ");
  const event = getDanceEvent(dance.id);
  const description = `Watch ${who || "this dance"}${event ? ` at ${event.name}${event.year ? ` ${event.year}` : ""}` : ""}${dance.competition ? ` (${dance.competition})` : ""}, mapped move by move on Westie Wiki.`;
  return {
    title: who ? `${who} — dance` : (dance.title ?? "Dance"),
    description,
    alternates: { canonical: `/dances/${dance.slug}` },
    openGraph: {
      title: who ? `${who} — West Coast Swing dance` : (dance.title ?? "Dance"),
      description,
      type: "video.other",
      url: `/dances/${dance.slug}`,
      images: [{ url: `https://i.ytimg.com/vi/${dance.youtubeId}/hqdefault.jpg` }],
    },
  };
}

export default async function DancePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ clip?: string }>;
}) {
  const { slug } = await params;
  const { clip } = await searchParams;
  const initialClipId = clip && /^\d+$/.test(clip) ? Number(clip) : null;
  const dance = getDanceBySlug(slug);
  if (!dance) notFound();

  const user = await getCurrentUser();
  const danceDancerList = getDanceDancers(dance.id);
  const event = getDanceEvent(dance.id);
  const eventSuggestions = db
    .selectDistinct({ name: events.name })
    .from(events)
    .all()
    .map((r) => r.name)
    .sort((a, b) => a.localeCompare(b));
  const dancerSuggestions = db
    .selectDistinct({ name: dancersTable.name })
    .from(dancersTable)
    .all()
    .map((r) => r.name)
    .sort((a, b) => a.localeCompare(b));
  const songs = getDanceSongs(dance.id);
  const annotations = getDanceAnnotations(dance.id);
  const addedBy = db.select({ username: users.username }).from(users).where(eq(users.id, dance.addedBy)).get();
  const moveNames = db
    .select({ name: moves.name })
    .from(moves)
    .where(eq(moves.deleted, 0))
    .orderBy(asc(moves.name))
    .all()
    .map((r) => r.name);

  const allHandholds = db
    .select({ id: handholdsTable.id, name: handholdsTable.name })
    .from(handholdsTable)
    .orderBy(asc(handholdsTable.position), asc(handholdsTable.id))
    .all();

  const variantsByMove: Record<string, { id: number; name: string }[]> = {};
  for (const row of db
    .select({ moveName: moves.name, id: moveVariants.id, name: moveVariants.name })
    .from(moveVariants)
    .innerJoin(moves, eq(moves.id, moveVariants.moveId))
    .where(eq(moves.deleted, 0))
    .orderBy(asc(moveVariants.name))
    .all()) {
    (variantsByMove[row.moveName] ??= []).push({ id: row.id, name: row.name });
  }

  const heading =
    danceDancerList.length > 0
      ? danceDancerList.map((d) => d.name).join(" & ")
      : (dance.title ?? "Untitled dance");

  return (
    // full-bleed: escape the site column so the player can use the whole viewport
    <div className="relative left-1/2 w-screen -translate-x-1/2 px-4 sm:px-6">
      <div className="mx-auto max-w-[1500px]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: dance.title ?? heading,
          description: `West Coast Swing${dance.competition ? ` — ${dance.competition}` : ""}${event ? ` at ${event.name}${event.year ? ` ${event.year}` : ""}` : ""}, danced by ${heading}.`,
          thumbnailUrl: `https://i.ytimg.com/vi/${dance.youtubeId}/hqdefault.jpg`,
          uploadDate: new Date(dance.createdAt).toISOString(),
          embedUrl: `https://www.youtube-nocookie.com/embed/${dance.youtubeId}`,
          url: `https://westie.wiki/dances/${dance.slug}`,
        }}
      />
      <div className="mb-6">
        <p className="mb-2 font-display text-sm text-muted">
          <Link href="/dances" className="text-denim hover:underline">
            Dances
          </Link>{" "}
          › {heading}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold sm:text-4xl">
            {danceDancerList.length > 0
              ? danceDancerList.map((d, i) => (
                  <span key={d.id}>
                    <Link href={`/dancers/${d.slug}`} className="hover:underline">
                      {d.name}
                    </Link>
                    {d.role ? (
                      <span className="text-xl text-muted font-normal"> ({d.role})</span>
                    ) : null}
                    {i < danceDancerList.length - 1 ? <span className="text-muted"> &amp; </span> : null}
                  </span>
                ))
              : heading}
          </h1>
          {dance.competition ? <CountChip>{dance.competition}</CountChip> : null}
          {dance.placement ? <CountChip>{dance.placement}</CountChip> : null}
        </div>
        {event || songs.length > 0 ? (
          <div className="mt-1 font-display text-[15px] text-muted">
            {event ? (
              <>
                at{" "}
                <Link href={`/events/${event.slug}`} className="text-denim hover:underline">
                  {event.name}
                  {event.year ? ` ${event.year}` : ""}
                </Link>
              </>
            ) : null}
            {event && songs.length > 0 ? " · " : null}
            {songs.length > 0 ? (
              <>
                <span aria-hidden>♪</span>{" "}
                {songs.map((s, i) => (
                  <span key={i}>
                    {s.song}
                    {s.song && s.artist ? " — " : ""}
                    {s.artist}
                    {i < songs.length - 1 ? " · " : ""}
                  </span>
                ))}
              </>
            ) : null}
          </div>
        ) : null}
        {dance.note ? <p className="mt-1 font-display text-[15px] text-ink-soft">{dance.note}</p> : null}
        {user ? (
          <div className="mt-2">
            <EditDanceDetailsForm
              danceId={dance.id}
              dancers={danceDancerList.map((d) => ({ name: d.name, role: d.role }))}
              competition={dance.competition}
              placement={dance.placement}
              event={event ?? null}
              songs={songs.map((s) => ({ song: s.song, artist: s.artist }))}
              note={dance.note}
              eventSuggestions={eventSuggestions}
              dancerSuggestions={dancerSuggestions}
              canEdit={!!user}
            />
          </div>
        ) : null}
        <div className="slot-line mt-3" aria-hidden />
      </div>

      <DanceAnnotator
        danceId={dance.id}
        youtubeId={dance.youtubeId}
        annotations={annotations}
        moveNames={moveNames}
        variantsByMove={variantsByMove}
        handholds={allHandholds}
        currentUserId={user?.id ?? null}
        initialClipId={initialClipId}
      />

      <div className="mt-10 border-t border-line pt-5 font-display text-sm text-muted">
        <p>
          registered by{" "}
          {addedBy ? (
            <Link href={`/users/${addedBy.username}`} className="hover:underline">
              {addedBy.username}
            </Link>
          ) : (
            "unknown"
          )}{" "}
          on {formatDate(dance.createdAt)}
        </p>
        {user ? (
          <div className="mt-1">
            <ReportForm danceId={dance.id} />
          </div>
        ) : null}
      </div>
      </div>
    </div>
  );
}
