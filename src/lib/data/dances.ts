import "server-only";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  danceDancers,
  dancers,
  dances,
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

export function listDances() {
  const rows = db
    .select({
      id: dances.id,
      slug: dances.slug,
      youtubeId: dances.youtubeId,
      title: dances.title,
      song: dances.song,
      artist: dances.artist,
      competition: dances.competition,
      createdAt: dances.createdAt,
      eventName: events.name,
      eventYear: events.year,
      annotationCount: count(videos.id),
    })
    .from(dances)
    .leftJoin(events, eq(events.id, dances.eventId))
    .leftJoin(videos, eq(videos.danceId, dances.id))
    .groupBy(dances.id)
    .orderBy(desc(dances.createdAt))
    .all();

  return rows.map((row) => ({
    ...row,
    dancers: getDanceDancers(row.id),
  }));
}
