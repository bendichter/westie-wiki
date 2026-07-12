"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { dancers, events, moves, VIDEO_ROLES, videoDancers, videos, type VideoRole } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { slugify, uniqueSlug } from "@/lib/slug";
import { parseTimestamp } from "@/lib/time";
import { fetchYoutubeTitle, parseYoutubeUrl } from "@/lib/youtube";

export type VideoFormState = { error: string | null; success?: boolean };

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

export async function addVideo(_prev: VideoFormState, formData: FormData): Promise<VideoFormState> {
  const user = await getCurrentUser();
  const moveId = Number(formData.get("moveId"));
  const move = db.select().from(moves).where(and(eq(moves.id, moveId), eq(moves.deleted, 0))).get();
  if (!move) return { error: "This move no longer exists." };
  if (!user) redirect(`/login?next=/moves/${move.slug}`);

  const url = String(formData.get("url") ?? "").trim();
  const parsed = parseYoutubeUrl(url);
  if (!parsed) return { error: "That doesn't look like a YouTube link. Paste a watch, share, or shorts URL." };

  const startRaw = String(formData.get("start") ?? "").trim();
  const endRaw = String(formData.get("end") ?? "").trim();

  let startSec = 0;
  if (startRaw) {
    const t = parseTimestamp(startRaw);
    if (t == null) return { error: `Couldn't read the start time "${startRaw}". Use formats like 90 or 1:30.` };
    startSec = t;
  } else if (parsed.startSec != null) {
    startSec = parsed.startSec;
  }

  let endSec: number | null = null;
  if (endRaw) {
    const t = parseTimestamp(endRaw);
    if (t == null) return { error: `Couldn't read the end time "${endRaw}". Use formats like 105 or 1:45.` };
    endSec = t;
  }
  if (endSec != null && endSec <= startSec) {
    return { error: "The end time must be after the start time." };
  }

  // dancers arrive as parallel arrays: dancerName[] + dancerRole[]
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

  const note = String(formData.get("note") ?? "").trim().slice(0, 500);
  const title = await fetchYoutubeTitle(parsed.id);

  const video = db
    .insert(videos)
    .values({
      moveId: move.id,
      youtubeId: parsed.id,
      startSec,
      endSec,
      title,
      note: note || null,
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
    db.insert(videoDancers).values({ videoId: video.id, dancerId, role: d.role }).run();
  }

  revalidatePath(`/moves/${move.slug}`);
  return { error: null, success: true };
}

/**
 * Update a clip's timing and note. Open to any logged-in member, wiki-style —
 * trimming a full video down to the relevant segment is a contribution.
 */
export async function updateVideoClip(
  _prev: VideoFormState,
  formData: FormData
): Promise<VideoFormState> {
  const user = await getCurrentUser();
  const videoId = Number(formData.get("videoId"));
  const video = db.select().from(videos).where(eq(videos.id, videoId)).get();
  if (!video) return { error: "This video no longer exists." };
  const move = db.select().from(moves).where(eq(moves.id, video.moveId)).get();
  if (!move) return { error: "This move no longer exists." };
  if (!user) redirect(`/login?next=/moves/${move.slug}`);

  const startRaw = String(formData.get("start") ?? "").trim();
  const endRaw = String(formData.get("end") ?? "").trim();

  let startSec = 0;
  if (startRaw) {
    const t = parseTimestamp(startRaw);
    if (t == null) return { error: `Couldn't read the start time "${startRaw}". Use formats like 90 or 1:30.` };
    startSec = t;
  }

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

  db.update(videos)
    .set({ startSec, endSec, note: note || null })
    .where(eq(videos.id, videoId))
    .run();

  revalidatePath(`/moves/${move.slug}`);
  return { error: null, success: true };
}

export async function deleteVideo(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const videoId = Number(formData.get("videoId"));
  const video = db.select().from(videos).where(eq(videos.id, videoId)).get();
  if (!video || video.addedBy !== user.id) return;

  const move = db.select().from(moves).where(eq(moves.id, video.moveId)).get();
  db.delete(videoDancers).where(eq(videoDancers.videoId, videoId)).run();
  db.delete(videos).where(eq(videos.id, videoId)).run();
  if (move) revalidatePath(`/moves/${move.slug}`);
}
