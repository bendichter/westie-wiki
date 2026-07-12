import "server-only";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  comments,
  dancers,
  events,
  moveAliases,
  moveRelations,
  moveRevisions,
  moves,
  moveTags,
  tags,
  users,
  videoDancers,
  videos,
  type Move,
  type RelationKind,
} from "@/db/schema";

export function getMoveBySlug(slug: string): Move | undefined {
  return db
    .select()
    .from(moves)
    .where(and(eq(moves.slug, slug), eq(moves.deleted, 0)))
    .get();
}

export function getAliases(moveId: number): string[] {
  return db
    .select({ name: moveAliases.name })
    .from(moveAliases)
    .where(eq(moveAliases.moveId, moveId))
    .all()
    .map((r) => r.name);
}

export function getMoveTags(moveId: number) {
  return db
    .select({ id: tags.id, slug: tags.slug, name: tags.name })
    .from(moveTags)
    .innerJoin(tags, eq(tags.id, moveTags.tagId))
    .where(eq(moveTags.moveId, moveId))
    .orderBy(asc(tags.name))
    .all();
}

export type MoveLink = { id: number; slug: string; name: string; kind: RelationKind };

/** Relations shown on a move page, resolved in both directions. */
export function getRelatedMoves(moveId: number): {
  prerequisites: MoveLink[];
  variations: MoveLink[];
  variationOf: MoveLink[];
  related: MoveLink[];
  unlocks: MoveLink[];
} {
  const outgoing = db
    .select({
      id: moves.id,
      slug: moves.slug,
      name: moves.name,
      kind: moveRelations.kind,
    })
    .from(moveRelations)
    .innerJoin(moves, eq(moves.id, moveRelations.toMoveId))
    .where(and(eq(moveRelations.fromMoveId, moveId), eq(moves.deleted, 0)))
    .all() as MoveLink[];

  const incoming = db
    .select({
      id: moves.id,
      slug: moves.slug,
      name: moves.name,
      kind: moveRelations.kind,
    })
    .from(moveRelations)
    .innerJoin(moves, eq(moves.id, moveRelations.fromMoveId))
    .where(and(eq(moveRelations.toMoveId, moveId), eq(moves.deleted, 0)))
    .all() as MoveLink[];

  return {
    // this move requires those moves first
    prerequisites: outgoing.filter((r) => r.kind === "prerequisite"),
    // this move is a variation of those moves
    variationOf: outgoing.filter((r) => r.kind === "variation"),
    // those moves are variations of this move
    variations: incoming.filter((r) => r.kind === "variation"),
    related: [
      ...outgoing.filter((r) => r.kind === "related"),
      ...incoming.filter((r) => r.kind === "related"),
    ],
    // moves that list this one as a prerequisite
    unlocks: incoming.filter((r) => r.kind === "prerequisite"),
  };
}

export type VideoWithLabels = {
  id: number;
  youtubeId: string;
  startSec: number;
  endSec: number | null;
  title: string | null;
  note: string | null;
  song: string | null;
  artist: string | null;
  createdAt: number;
  addedBy: number;
  addedByName: string;
  event: { id: number; slug: string; name: string; year: number | null } | null;
  dancers: { id: number; slug: string; name: string; role: string | null }[];
};

export function getMoveVideos(moveId: number): VideoWithLabels[] {
  const rows = db
    .select({
      id: videos.id,
      youtubeId: videos.youtubeId,
      startSec: videos.startSec,
      endSec: videos.endSec,
      title: videos.title,
      note: videos.note,
      song: videos.song,
      artist: videos.artist,
      createdAt: videos.createdAt,
      addedBy: videos.addedBy,
      addedByName: users.username,
      eventId: events.id,
      eventSlug: events.slug,
      eventName: events.name,
      eventYear: events.year,
    })
    .from(videos)
    .innerJoin(users, eq(users.id, videos.addedBy))
    .leftJoin(events, eq(events.id, videos.eventId))
    .where(eq(videos.moveId, moveId))
    .orderBy(asc(videos.createdAt))
    .all();

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
    song: r.song,
    artist: r.artist,
    createdAt: r.createdAt,
    addedBy: r.addedBy,
    addedByName: r.addedByName,
    event:
      r.eventId != null
        ? { id: r.eventId, slug: r.eventSlug!, name: r.eventName!, year: r.eventYear }
        : null,
    dancers: dancerRows
      .filter((d) => d.videoId === r.id)
      .sort((a, b) => (a.role === "leader" ? -1 : 0) - (b.role === "leader" ? -1 : 0)),
  }));
}

export function getMoveComments(moveId: number) {
  return db
    .select({
      id: comments.id,
      body: comments.body,
      createdAt: comments.createdAt,
      userId: comments.userId,
      username: users.username,
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.userId))
    .where(and(eq(comments.moveId, moveId), eq(comments.deleted, 0)))
    .orderBy(asc(comments.createdAt))
    .all();
}

export function getRevisions(moveId: number) {
  return db
    .select({
      id: moveRevisions.id,
      revisionNo: moveRevisions.revisionNo,
      name: moveRevisions.name,
      editSummary: moveRevisions.editSummary,
      createdAt: moveRevisions.createdAt,
      editor: users.username,
    })
    .from(moveRevisions)
    .innerJoin(users, eq(users.id, moveRevisions.editorId))
    .where(eq(moveRevisions.moveId, moveId))
    .orderBy(desc(moveRevisions.revisionNo))
    .all();
}

export function getRevision(moveId: number, revisionNo: number) {
  return db
    .select({
      id: moveRevisions.id,
      revisionNo: moveRevisions.revisionNo,
      name: moveRevisions.name,
      description: moveRevisions.description,
      aliases: moveRevisions.aliases,
      tags: moveRevisions.tags,
      difficulty: moveRevisions.difficulty,
      editSummary: moveRevisions.editSummary,
      createdAt: moveRevisions.createdAt,
      editor: users.username,
    })
    .from(moveRevisions)
    .innerJoin(users, eq(users.id, moveRevisions.editorId))
    .where(and(eq(moveRevisions.moveId, moveId), eq(moveRevisions.revisionNo, revisionNo)))
    .get();
}

export function getLatestRevisionNo(moveId: number): number {
  const row = db
    .select({ revisionNo: moveRevisions.revisionNo })
    .from(moveRevisions)
    .where(eq(moveRevisions.moveId, moveId))
    .orderBy(desc(moveRevisions.revisionNo))
    .limit(1)
    .get();
  return row?.revisionNo ?? 0;
}
