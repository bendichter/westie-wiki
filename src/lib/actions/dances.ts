"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  danceDancers,
  dancers,
  dances,
  events,
  moves,
  VIDEO_ROLES,
  videoDancers,
  videos,
  type VideoRole,
} from "@/db/schema";
import { getCurrentUser, isVerified, VERIFY_TO_EDIT_ERROR } from "@/lib/auth";
import { slugify, uniqueSlug } from "@/lib/slug";
import { parseTimestamp } from "@/lib/time";
import { fetchYoutubeTitle, parseYoutubeUrl } from "@/lib/youtube";

export type DanceFormState = { error: string | null };
export type AnnotationFormState = { error: string | null; success?: boolean };

function findOrCreateDancer(name: string): number {
  const trimmed = name.trim();
  const slug = slugify(trimmed);
  const existing = db.select().from(dancers).where(eq(dancers.slug, slug)).get();
  if (existing) return existing.id;
  const finalSlug = uniqueSlug(
    slug,
    (c) => !!db.select({ id: dancers.id }).from(dancers).where(eq(dancers.slug, c)).get()
  );
  return db.insert(dancers).values({ slug: finalSlug, name: trimmed }).returning().get().id;
}

function findOrCreateEvent(name: string, year: number | null): number {
  const trimmed = name.trim();
  const slug = slugify(year ? `${trimmed} ${year}` : trimmed);
  const existing = db.select().from(events).where(eq(events.slug, slug)).get();
  if (existing) return existing.id;
  return db.insert(events).values({ slug, name: trimmed, year }).returning().get().id;
}

export async function createDance(_prev: DanceFormState, formData: FormData): Promise<DanceFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dances/new");
  if (!isVerified(user)) return { error: VERIFY_TO_EDIT_ERROR };

  const url = String(formData.get("url") ?? "").trim();
  const parsed = parseYoutubeUrl(url);
  if (!parsed) return { error: "That doesn't look like a YouTube link. Paste a watch, share, or shorts URL." };

  const existing = db.select().from(dances).where(eq(dances.youtubeId, parsed.id)).get();
  if (existing) {
    redirect(`/dances/${existing.slug}`);
  }

  const names = formData.getAll("dancerName").map((v) => String(v).trim());
  const roles = formData.getAll("dancerRole").map((v) => String(v));
  const labeledDancers: { name: string; role: VideoRole | null }[] = [];
  for (let i = 0; i < names.length; i++) {
    if (!names[i]) continue;
    const role = (VIDEO_ROLES as readonly string[]).includes(roles[i]) ? (roles[i] as VideoRole) : null;
    labeledDancers.push({ name: names[i], role });
  }

  const eventName = String(formData.get("eventName") ?? "").trim();
  const eventYearRaw = String(formData.get("eventYear") ?? "").trim();
  const eventYear = /^\d{4}$/.test(eventYearRaw) ? Number(eventYearRaw) : null;
  const song = String(formData.get("song") ?? "").trim().slice(0, 120);
  const artist = String(formData.get("artist") ?? "").trim().slice(0, 120);
  const competition = String(formData.get("competition") ?? "").trim().slice(0, 80);
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);

  const title = await fetchYoutubeTitle(parsed.id);

  // slug from dancers + event when available, else title, else the video id
  const slugBase =
    labeledDancers.length > 0
      ? `${labeledDancers.map((d) => d.name).join(" ")}${eventName ? ` ${eventName}` : ""}${eventYear ? ` ${eventYear}` : ""}`
      : (title ?? parsed.id);
  const slug = uniqueSlug(
    slugify(slugBase),
    (c) => !!db.select({ id: dances.id }).from(dances).where(eq(dances.slug, c)).get()
  );

  const dance = db
    .insert(dances)
    .values({
      slug,
      youtubeId: parsed.id,
      title,
      note: note || null,
      song: song || null,
      artist: artist || null,
      competition: competition || null,
      eventId: eventName ? findOrCreateEvent(eventName, eventYear) : null,
      addedBy: user.id,
      createdAt: Date.now(),
    })
    .returning()
    .get();

  const seen = new Set<number>();
  for (const d of labeledDancers) {
    const dancerId = findOrCreateDancer(d.name);
    if (seen.has(dancerId)) continue;
    seen.add(dancerId);
    db.insert(danceDancers).values({ danceId: dance.id, dancerId, role: d.role }).run();
  }

  redirect(`/dances/${dance.slug}`);
}

/**
 * Add one move annotation to a dance. Creates a regular clip on the move's
 * page, inheriting the dance's event, song, and dancer labels.
 */
export async function addAnnotation(
  _prev: AnnotationFormState,
  formData: FormData
): Promise<AnnotationFormState> {
  const user = await getCurrentUser();
  const danceId = Number(formData.get("danceId"));
  const dance = db.select().from(dances).where(eq(dances.id, danceId)).get();
  if (!dance) return { error: "This dance no longer exists." };
  if (!user) redirect(`/login?next=/dances/${dance.slug}`);
  if (!isVerified(user)) return { error: VERIFY_TO_EDIT_ERROR };

  const moveName = String(formData.get("moveName") ?? "").trim();
  const move = db
    .select()
    .from(moves)
    .where(and(eq(moves.name, moveName), eq(moves.deleted, 0)))
    .get();
  if (!move) {
    return { error: `No move named "${moveName}" — pick one from the suggestions, or document it first.` };
  }

  const startRaw = String(formData.get("start") ?? "").trim();
  const endRaw = String(formData.get("end") ?? "").trim();
  if (!startRaw) return { error: "Mark a start time first." };
  const startSec = parseTimestamp(startRaw);
  if (startSec == null) return { error: `Couldn't read the start time "${startRaw}". Use formats like 90 or 1:30.` };

  let endSec: number | null = null;
  if (endRaw) {
    const t = parseTimestamp(endRaw);
    if (t == null) return { error: `Couldn't read the end time "${endRaw}". Use formats like 105 or 1:45.` };
    endSec = t;
  }
  if (endSec != null && endSec <= startSec) {
    return { error: "The end time must be after the start time." };
  }

  const note = String(formData.get("note") ?? "").trim().slice(0, 500);

  const video = db
    .insert(videos)
    .values({
      moveId: move.id,
      youtubeId: dance.youtubeId,
      startSec,
      endSec,
      title: dance.title,
      note: note || null,
      song: dance.song,
      artist: dance.artist,
      eventId: dance.eventId,
      danceId: dance.id,
      addedBy: user.id,
      createdAt: Date.now(),
    })
    .returning()
    .get();

  // inherit the dance's dancer labels
  const labels = db.select().from(danceDancers).where(eq(danceDancers.danceId, dance.id)).all();
  for (const label of labels) {
    db.insert(videoDancers)
      .values({ videoId: video.id, dancerId: label.dancerId, role: label.role })
      .onConflictDoNothing()
      .run();
  }

  revalidatePath(`/dances/${dance.slug}`);
  revalidatePath(`/moves/${move.slug}`);
  return { error: null, success: true };
}

export async function deleteAnnotation(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const videoId = Number(formData.get("videoId"));
  const video = db.select().from(videos).where(eq(videos.id, videoId)).get();
  if (!video || video.addedBy !== user.id || video.danceId == null) return;

  const dance = db.select().from(dances).where(eq(dances.id, video.danceId)).get();
  db.delete(videoDancers).where(eq(videoDancers.videoId, videoId)).run();
  db.delete(videos).where(eq(videos.id, videoId)).run();
  if (dance) revalidatePath(`/dances/${dance.slug}`);
}
