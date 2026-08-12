import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { dancers, dances, danceSongs, events, handholds, moves, moveVariants, users, videoDancers, videos } from "@/db/schema";
import type { VideoWithLabels } from "./moves";

export type ClipWithMove = VideoWithLabels & { moveId: number; moveName: string; moveSlug: string };

function hydrateClips(
  rows: {
    id: number;
    youtubeId: string;
    startSec: number;
    portrait: number;
    endSec: number | null;
    title: string | null;
    note: string | null;
    danceSlug: string | null;
    danceId: number | null;
    variantId: number | null;
    variantName: string | null;
    handholdId: number | null;
    handholdName: string | null;
    createdAt: number;
    addedBy: number;
    addedByName: string;
    eventId: number | null;
    eventSlug: string | null;
    eventName: string | null;
    eventYear: number | null;
    moveId: number;
    moveName: string;
    moveSlug: string;
  }[]
): ClipWithMove[] {
  if (rows.length === 0) return [];

  const danceIds = [...new Set(rows.map((r) => r.danceId).filter((id): id is number => id != null))];
  const songRows =
    danceIds.length > 0
      ? db
          .select({ danceId: danceSongs.danceId, song: danceSongs.song, artist: danceSongs.artist, position: danceSongs.position })
          .from(danceSongs)
          .where(inArray(danceSongs.danceId, danceIds))
          .all()
          .sort((a, b) => a.position - b.position)
      : [];

  const dancerRows = db
    .select({
      videoId: videoDancers.videoId,
      id: dancers.id,
      slug: dancers.slug,
      name: dancers.name,
      role: videoDancers.role,
    })
    .from(videoDancers)
    .innerJoin(dancers, eq(dancers.id, videoDancers.dancerId))
    .where(inArray(videoDancers.videoId, rows.map((r) => r.id)))
    .all();

  return rows.map((r) => ({
    id: r.id,
    youtubeId: r.youtubeId,
    startSec: r.startSec,
    portrait: r.portrait === 1,
    endSec: r.endSec,
    title: r.title,
    note: r.note,
    danceSlug: r.danceSlug,
    danceSongs: songRows.filter((sr) => sr.danceId === r.danceId).map(({ song, artist }) => ({ song, artist })),
    variantId: r.variantId,
    variantName: r.variantName,
    handholdId: r.handholdId,
    handholdName: r.handholdName,
    createdAt: r.createdAt,
    addedBy: r.addedBy,
    addedByName: r.addedByName,
    moveId: r.moveId,
    moveName: r.moveName,
    moveSlug: r.moveSlug,
    event:
      r.eventId != null
        ? { id: r.eventId, slug: r.eventSlug!, name: r.eventName!, year: r.eventYear }
        : null,
    dancers: dancerRows.filter((d) => d.videoId === r.id),
  }));
}

const clipSelection = {
  id: videos.id,
  youtubeId: videos.youtubeId,
  startSec: videos.startSec,
  portrait: videos.portrait,
  endSec: videos.endSec,
  title: videos.title,
  note: videos.note,
  danceSlug: dances.slug,
  danceId: dances.id,
  variantId: videos.variantId,
  variantName: moveVariants.name,
  handholdId: videos.handholdId,
  handholdName: handholds.name,
  createdAt: videos.createdAt,
  addedBy: videos.addedBy,
  addedByName: users.username,
  eventId: events.id,
  eventSlug: events.slug,
  eventName: events.name,
  eventYear: events.year,
  moveId: moves.id,
  moveName: moves.name,
  moveSlug: moves.slug,
};

export function getDancerClips(dancerId: number): ClipWithMove[] {
  const rows = db
    .select(clipSelection)
    .from(videos)
    .innerJoin(videoDancers, eq(videoDancers.videoId, videos.id))
    .innerJoin(users, eq(users.id, videos.addedBy))
    .innerJoin(moves, eq(moves.id, videos.moveId))
    .leftJoin(events, eq(events.id, videos.eventId))
    .leftJoin(dances, eq(dances.id, videos.danceId))
    .leftJoin(moveVariants, eq(moveVariants.id, videos.variantId))
    .leftJoin(handholds, eq(handholds.id, videos.handholdId))
    .where(and(eq(videoDancers.dancerId, dancerId), eq(moves.deleted, 0)))
    .orderBy(desc(videos.createdAt))
    .all();
  return hydrateClips(rows);
}

export function getEventClips(eventId: number): ClipWithMove[] {
  const rows = db
    .select(clipSelection)
    .from(videos)
    .innerJoin(users, eq(users.id, videos.addedBy))
    .innerJoin(moves, eq(moves.id, videos.moveId))
    .leftJoin(events, eq(events.id, videos.eventId))
    .leftJoin(dances, eq(dances.id, videos.danceId))
    .leftJoin(moveVariants, eq(moveVariants.id, videos.variantId))
    .leftJoin(handholds, eq(handholds.id, videos.handholdId))
    .where(and(eq(videos.eventId, eventId), eq(moves.deleted, 0)))
    .orderBy(desc(videos.createdAt))
    .all();
  return hydrateClips(rows);
}

/**
 * Collapse repeated occurrences within the same dance into one card: the
 * earliest occurrence leads and the rest become extra timing rows on it.
 * Standalone clips (no dance) stay separate.
 */
export function groupClipsByDance<T extends { danceSlug: string | null; startSec: number }>(
  clips: T[]
): { primary: T; extras: T[] }[] {
  const groups: { primary: T; extras: T[] }[] = [];
  const byDance = new Map<string, { primary: T; extras: T[] }>();
  for (const clip of clips) {
    const group = clip.danceSlug ? byDance.get(clip.danceSlug) : undefined;
    if (group) {
      group.extras.push(clip);
    } else {
      const next = { primary: clip, extras: [] as T[] };
      groups.push(next);
      if (clip.danceSlug) byDance.set(clip.danceSlug, next);
    }
  }
  for (const group of groups) {
    if (group.extras.length === 0) continue;
    const ordered = [group.primary, ...group.extras].sort((a, b) => a.startSec - b.startSec);
    group.primary = ordered[0];
    group.extras = ordered.slice(1);
  }
  return groups;
}

/** Group clips by move, preserving clip order within each move. */
export function groupClipsByMove(clips: ClipWithMove[]): {
  moveId: number;
  moveName: string;
  moveSlug: string;
  clips: ClipWithMove[];
}[] {
  const groups = new Map<number, { moveId: number; moveName: string; moveSlug: string; clips: ClipWithMove[] }>();
  for (const clip of clips) {
    let group = groups.get(clip.moveId);
    if (!group) {
      group = { moveId: clip.moveId, moveName: clip.moveName, moveSlug: clip.moveSlug, clips: [] };
      groups.set(clip.moveId, group);
    }
    group.clips.push(clip);
  }
  return [...groups.values()].sort((a, b) => a.moveName.localeCompare(b.moveName));
}
