import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { moves, users } from "@/db/schema";
import { DanceAnnotator } from "@/components/DanceAnnotator";
import { CountChip } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import {
  getDanceAnnotations,
  getDanceBySlug,
  getDanceDancers,
  getDanceEvent,
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
  return { title: who ? `${who} — dance` : (dance.title ?? "Dance") };
}

export default async function DancePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dance = getDanceBySlug(slug);
  if (!dance) notFound();

  const user = await getCurrentUser();
  const danceDancerList = getDanceDancers(dance.id);
  const event = getDanceEvent(dance.id);
  const annotations = getDanceAnnotations(dance.id);
  const addedBy = db.select({ username: users.username }).from(users).where(eq(users.id, dance.addedBy)).get();
  const moveNames = db
    .select({ name: moves.name })
    .from(moves)
    .where(eq(moves.deleted, 0))
    .orderBy(asc(moves.name))
    .all()
    .map((r) => r.name);

  const heading =
    danceDancerList.length > 0
      ? danceDancerList.map((d) => d.name).join(" & ")
      : (dance.title ?? "Untitled dance");

  return (
    <div>
      <div className="mb-6">
        <p className="mb-2 font-display text-sm text-muted">
          <Link href="/dances" className="text-denim hover:underline">
            Dances
          </Link>{" "}
          › {heading}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold sm:text-4xl">
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
        </div>
        <p className="mt-1 font-display text-[15px] text-muted">
          {event ? (
            <>
              at{" "}
              <Link href={`/events/${event.slug}`} className="text-denim hover:underline">
                {event.name}
                {event.year ? ` ${event.year}` : ""}
              </Link>
            </>
          ) : null}
          {dance.song || dance.artist ? (
            <>
              {event ? " · " : ""}
              <span aria-hidden>♪</span> {dance.song}
              {dance.song && dance.artist ? " — " : ""}
              {dance.artist}
            </>
          ) : null}
          {(event || dance.song || dance.artist) ? " · " : ""}
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
        {dance.note ? <p className="mt-1 font-display text-[15px] text-ink-soft">{dance.note}</p> : null}
        {dance.title ? (
          <p className="mt-0.5 truncate font-display text-xs text-muted" title={dance.title}>
            {dance.title}
          </p>
        ) : null}
        <div className="slot-line mt-3" aria-hidden />
      </div>

      <DanceAnnotator
        danceId={dance.id}
        youtubeId={dance.youtubeId}
        annotations={annotations}
        moveNames={moveNames}
        currentUserId={user?.id ?? null}
      />
    </div>
  );
}
