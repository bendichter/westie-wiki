"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  danceDancers,
  dancers,
  dances,
  danceSongs,
  handholds,
  moveVariants,
  events,
  moves,
  reports,
  VIDEO_ROLES,
  videoDancers,
  videos,
  type VideoRole,
} from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { removeDanceCascade } from "@/lib/dance-removal";
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
  const songs = parseSongRows(formData);
  const competition = String(formData.get("competition") ?? "").trim().slice(0, 80);
  const placement = String(formData.get("placement") ?? "").trim().slice(0, 40);
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
      competition: competition || null,
      placement: placement || null,
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

  replaceSongs(dance.id, songs);

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
  const variantRaw = Number(formData.get("variantId"));
  const variantId =
    Number.isInteger(variantRaw) && variantRaw > 0
      ? (db
          .select({ id: moveVariants.id })
          .from(moveVariants)
          .where(and(eq(moveVariants.id, variantRaw), eq(moveVariants.moveId, move.id)))
          .get()?.id ?? null)
      : null;

  const handholdRaw = Number(formData.get("handholdId"));
  const handholdId =
    Number.isInteger(handholdRaw) && handholdRaw > 0
      ? (db.select({ id: handholds.id }).from(handholds).where(eq(handholds.id, handholdRaw)).get()?.id ?? null)
      : null;

  const video = db
    .insert(videos)
    .values({
      moveId: move.id,
      youtubeId: dance.youtubeId,
      startSec,
      endSec,
      title: dance.title,
      note: note || null,
      variantId,
      handholdId,
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

/** Edit an existing annotation in place (wiki-style: any verified member). */
export async function updateAnnotation(
  _prev: AnnotationFormState,
  formData: FormData
): Promise<AnnotationFormState> {
  const user = await getCurrentUser();
  const videoId = Number(formData.get("videoId"));
  const clip = db.select().from(videos).where(eq(videos.id, videoId)).get();
  if (!clip || clip.danceId == null) return { error: "This annotation no longer exists." };
  const dance = db.select().from(dances).where(eq(dances.id, clip.danceId)).get();
  if (!dance) return { error: "This dance no longer exists." };
  if (!user) redirect(`/login?next=/dances/${dance.slug}`);
  if (!isVerified(user)) return { error: VERIFY_TO_EDIT_ERROR };

  const previousMove = db.select().from(moves).where(eq(moves.id, clip.moveId)).get();

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
  const variantRaw = Number(formData.get("variantId"));
  const variantId =
    Number.isInteger(variantRaw) && variantRaw > 0
      ? (db
          .select({ id: moveVariants.id })
          .from(moveVariants)
          .where(and(eq(moveVariants.id, variantRaw), eq(moveVariants.moveId, move.id)))
          .get()?.id ?? null)
      : null;

  const handholdRaw = Number(formData.get("handholdId"));
  const handholdId =
    Number.isInteger(handholdRaw) && handholdRaw > 0
      ? (db.select({ id: handholds.id }).from(handholds).where(eq(handholds.id, handholdRaw)).get()?.id ?? null)
      : null;

  db.update(videos)
    .set({ moveId: move.id, startSec, endSec, note: note || null, variantId, handholdId })
    .where(eq(videos.id, clip.id))
    .run();

  revalidatePath(`/dances/${dance.slug}`);
  revalidatePath(`/moves/${move.slug}`);
  if (previousMove && previousMove.id !== move.id) revalidatePath(`/moves/${previousMove.slug}`);
  return { error: null, success: true };
}

// songs arrive as parallel arrays: songName[] + songArtist[]; a row counts if either is set
function parseSongRows(formData: FormData): { song: string; artist: string }[] {
  const names = formData.getAll("songName").map((v) => String(v).trim().slice(0, 120));
  const artists = formData.getAll("songArtist").map((v) => String(v).trim().slice(0, 120));
  const rows: { song: string; artist: string }[] = [];
  for (let i = 0; i < Math.max(names.length, artists.length); i++) {
    const song = names[i] ?? "";
    const artist = artists[i] ?? "";
    if (song || artist) rows.push({ song, artist });
  }
  return rows.slice(0, 10);
}

function replaceSongs(danceId: number, rows: { song: string; artist: string }[]) {
  db.delete(danceSongs).where(eq(danceSongs.danceId, danceId)).run();
  rows.forEach((row, position) => {
    db.insert(danceSongs).values({ danceId, position, song: row.song, artist: row.artist }).run();
  });
}

/**
 * Edit a dance's metadata in one pass: dancers and their roles, competition,
 * placement, event, songs, and note. Annotation clips carry the dance's event
 * and dancer labels, so those are kept in step.
 */
export async function updateDanceDetails(
  _prev: AnnotationFormState,
  formData: FormData
): Promise<AnnotationFormState> {
  const user = await getCurrentUser();
  const danceId = Number(formData.get("danceId"));
  const dance = db.select().from(dances).where(eq(dances.id, danceId)).get();
  if (!dance) return { error: "This dance no longer exists." };
  if (!user) redirect(`/login?next=/dances/${dance.slug}`);
  if (!isVerified(user)) return { error: VERIFY_TO_EDIT_ERROR };

  const names = formData.getAll("dancerName").map((v) => String(v).trim().slice(0, 80));
  const roles = formData.getAll("dancerRole").map((v) => String(v));
  const labeledDancers: { name: string; role: VideoRole | null }[] = [];
  for (let i = 0; i < names.length; i++) {
    if (!names[i]) continue;
    const role = (VIDEO_ROLES as readonly string[]).includes(roles[i]) ? (roles[i] as VideoRole) : null;
    labeledDancers.push({ name: names[i], role });
  }

  const eventName = String(formData.get("eventName") ?? "").trim().slice(0, 120);
  const eventYearRaw = String(formData.get("eventYear") ?? "").trim();
  if (eventYearRaw && !/^\d{4}$/.test(eventYearRaw)) {
    return { error: "Event year should be a four-digit year, e.g. 2024." };
  }
  const eventId = eventName
    ? findOrCreateEvent(eventName, eventYearRaw ? Number(eventYearRaw) : null)
    : null;

  const competition = String(formData.get("competition") ?? "").trim().slice(0, 80);
  const placement = String(formData.get("placement") ?? "").trim().slice(0, 40);
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);

  db.update(dances)
    .set({
      eventId,
      competition: competition || null,
      placement: placement || null,
      note: note || null,
    })
    .where(eq(dances.id, dance.id))
    .run();
  // annotation clips carry the dance's event label — keep them in step
  db.update(videos).set({ eventId }).where(eq(videos.danceId, dance.id)).run();

  // replace the dancer labels on the dance and on its annotation clips
  const clipIds = db
    .select({ id: videos.id })
    .from(videos)
    .where(eq(videos.danceId, dance.id))
    .all()
    .map((r) => r.id);
  db.delete(danceDancers).where(eq(danceDancers.danceId, dance.id)).run();
  if (clipIds.length > 0) db.delete(videoDancers).where(inArray(videoDancers.videoId, clipIds)).run();
  const seen = new Set<number>();
  for (const d of labeledDancers) {
    const dancerId = findOrCreateDancer(d.name);
    if (seen.has(dancerId)) continue;
    seen.add(dancerId);
    db.insert(danceDancers).values({ danceId: dance.id, dancerId, role: d.role }).run();
    for (const videoId of clipIds) {
      db.insert(videoDancers).values({ videoId, dancerId, role: d.role }).run();
    }
  }

  replaceSongs(dance.id, parseSongRows(formData));

  revalidatePath(`/dances/${dance.slug}`);
  return { error: null, success: true };
}

/**
 * Remove a dance and its whole move timeline from the wiki. The member who
 * registered it, or an admin.
 */
export async function deleteDance(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const danceId = Number(formData.get("danceId"));
  const dance = db.select().from(dances).where(eq(dances.id, danceId)).get();
  if (!dance) return;
  if (dance.addedBy !== user.id && !isAdmin(user)) return;

  removeDanceCascade(danceId, Date.now());
  revalidatePath("/dances");
  revalidatePath("/moves", "layout");
  redirect("/dances");
}

/** Delete an annotation: its owner, or an admin cleaning up. */
export async function deleteAnnotation(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const videoId = Number(formData.get("videoId"));
  const video = db.select().from(videos).where(eq(videos.id, videoId)).get();
  if (!video || video.danceId == null) return;
  if (video.addedBy !== user.id && !isAdmin(user)) return;

  const dance = db.select().from(dances).where(eq(dances.id, video.danceId)).get();
  // detach any reports pointing at this clip, or the delete hits their FK
  db.update(reports).set({ videoId: null }).where(eq(reports.videoId, videoId)).run();
  db.delete(videoDancers).where(eq(videoDancers.videoId, videoId)).run();
  db.delete(videos).where(eq(videos.id, videoId)).run();
  if (dance) revalidatePath(`/dances/${dance.slug}`);
}
