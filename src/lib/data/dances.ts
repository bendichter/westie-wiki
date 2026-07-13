import "server-only";
import { likeContains } from "@/lib/like";
import { and, asc, count, desc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import {
  danceDancers,
  dancers,
  dances,
  danceSongs,
  events,
  moves,
  users,
  videos,
  type Dance,
} from "@/db/schema";
import type { AnnotationItem } from "@/components/DanceAnnotator";

export function getDanceBySlug(slug: string): Dance | undefined {
  return db.select().from(dances).where(eq(dances.slug, slug)).get();
}

export function getDanceDancers(danceId: number) {
  return db
    .select({
      id: dancers.id,
      slug: dancers.slug,
      name: dancers.name,
      role: danceDancers.role,
    })
    .from(danceDancers)
    .innerJoin(dancers, eq(dancers.id, danceDancers.dancerId))
    .where(eq(danceDancers.danceId, danceId))
    .all()
    .sort((a, b) => (a.role === "leader" ? -1 : 0) - (b.role === "leader" ? -1 : 0));
}

export function getDanceSongs(danceId: number) {
  return db
    .select({ song: danceSongs.song, artist: danceSongs.artist })
    .from(danceSongs)
    .where(eq(danceSongs.danceId, danceId))
    .orderBy(asc(danceSongs.position), asc(danceSongs.id))
    .all();
}

export function getDanceEvent(danceId: number) {
  return db
    .select({ id: events.id, slug: events.slug, name: events.name, year: events.year })
    .from(dances)
    .innerJoin(events, eq(events.id, dances.eventId))
    .where(eq(dances.id, danceId))
    .get();
}

export function getDanceAnnotations(danceId: number): AnnotationItem[] {
  return db
    .select({
      id: videos.id,
      startSec: videos.startSec,
      endSec: videos.endSec,
      note: videos.note,
      addedBy: videos.addedBy,
      addedByName: users.username,
      moveSlug: moves.slug,
      moveName: moves.name,
    })
    .from(videos)
    .innerJoin(moves, eq(moves.id, videos.moveId))
    .innerJoin(users, eq(users.id, videos.addedBy))
    .where(and(eq(videos.danceId, danceId), eq(moves.deleted, 0)))
    .orderBy(asc(videos.startSec), asc(videos.id))
    .all()
    .map((r) => ({
      id: r.id,
      startSec: r.startSec,
      endSec: r.endSec,
      note: r.note,
      addedBy: r.addedBy,
      addedByName: r.addedByName,
      move: { slug: r.moveSlug, name: r.moveName },
    }));
}

export type DanceListItem = ReturnType<typeof listDances>[number];

/**
 * Dance cards, optionally restricted to a dancer's dances, an event's dances,
 * or the dances in which a move has been annotated.
 */
export function listDances(filter?: {
  dancerId?: number;
  eventId?: number;
  moveId?: number;
  query?: string;
}) {
  let idFilter: number[] | null = null;
  const query = filter?.query?.trim();
  if (query) {
    // match song/artist, dancer name, event name, competition, or video title
    const bySong = db
      .selectDistinct({ id: danceSongs.danceId })
      .from(danceSongs)
      .where(or(likeContains(danceSongs.song, query), likeContains(danceSongs.artist, query)))
      .all()
      .map((r) => r.id);
    const byDancer = db
      .selectDistinct({ id: danceDancers.danceId })
      .from(danceDancers)
      .innerJoin(dancers, eq(dancers.id, danceDancers.dancerId))
      .where(likeContains(dancers.name, query))
      .all()
      .map((r) => r.id);
    const byEvent = db
      .selectDistinct({ id: dances.id })
      .from(dances)
      .innerJoin(events, eq(events.id, dances.eventId))
      .where(likeContains(events.name, query))
      .all()
      .map((r) => r.id);
    const byDance = db
      .selectDistinct({ id: dances.id })
      .from(dances)
      .where(or(likeContains(dances.title, query), likeContains(dances.competition, query)))
      .all()
      .map((r) => r.id);
    const matched = [...new Set([...bySong, ...byDancer, ...byEvent, ...byDance])];
    idFilter = matched;
  }
  if (filter?.dancerId != null) {
    const ids = db
      .select({ danceId: danceDancers.danceId })
      .from(danceDancers)
      .where(eq(danceDancers.dancerId, filter.dancerId))
      .all()
      .map((r) => r.danceId);
    idFilter = idFilter ? idFilter.filter((id) => ids.includes(id)) : ids;
  }
  if (filter?.moveId != null) {
    const ids = db
      .selectDistinct({ danceId: videos.danceId })
      .from(videos)
      .where(eq(videos.moveId, filter.moveId))
      .all()
      .map((r) => r.danceId)
      .filter((id): id is number => id != null);
    idFilter = idFilter ? idFilter.filter((id) => ids.includes(id)) : ids;
  }
  if (idFilter != null && idFilter.length === 0) return [];

  const conditions = [];
  if (idFilter != null) conditions.push(inArray(dances.id, idFilter));
  if (filter?.eventId != null) conditions.push(eq(dances.eventId, filter.eventId));

  const rows = db
    .select({
      id: dances.id,
      slug: dances.slug,
      youtubeId: dances.youtubeId,
      title: dances.title,
      competition: dances.competition,
      placement: dances.placement,
      createdAt: dances.createdAt,
      eventName: events.name,
      eventYear: events.year,
      annotationCount: count(videos.id),
    })
    .from(dances)
    .leftJoin(events, eq(events.id, dances.eventId))
    .leftJoin(videos, eq(videos.danceId, dances.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(dances.id)
    .orderBy(desc(dances.createdAt))
    .all();

  return rows.map((row) => ({
    ...row,
    dancers: getDanceDancers(row.id),
    songs: getDanceSongs(row.id),
  }));
}
