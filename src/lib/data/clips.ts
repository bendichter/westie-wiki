import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { dancers, dances, events, moves, users, videoDancers, videos } from "@/db/schema";
import type { VideoWithLabels } from "./moves";

export type ClipWithMove = VideoWithLabels & { moveId: number; moveName: string; moveSlug: string };

function hydrateClips(
  rows: {
    id: number;
    youtubeId: string;
    startSec: number;
    endSec: number | null;
    title: string | null;
    note: string | null;
    danceSlug: string | null;
    danceSong: string | null;
    danceArtist: string | null;
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
    endSec: r.endSec,
    title: r.title,
    note: r.note,
    danceSlug: r.danceSlug,
    danceSong: r.danceSong,
    danceArtist: r.danceArtist,
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
  endSec: videos.endSec,
  title: videos.title,
  note: videos.note,
  danceSlug: dances.slug,
  danceSong: dances.song,
  danceArtist: dances.artist,
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
    .where(and(eq(videos.eventId, eventId), eq(moves.deleted, 0)))
    .orderBy(desc(videos.createdAt))
    .all();
  return hydrateClips(rows);
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
