import "server-only";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  curricula,
  curriculumItems,
  curriculumRevisions,
  learned,
  moves,
  users,
  type Curriculum,
} from "@/db/schema";
import { getMoveVideos, type VideoWithLabels } from "./moves";

export function getCurriculumBySlug(slug: string): Curriculum | undefined {
  return db
    .select()
    .from(curricula)
    .where(and(eq(curricula.slug, slug), eq(curricula.deleted, 0)))
    .get();
}

export type CurriculumStep = {
  id: number;
  position: number;
  notes: string;
  keyVideoIds: number[];
  move: {
    id: number;
    slug: string;
    name: string;
    difficulty: string | null;
  };
  keyVideos: VideoWithLabels[];
};

export function getCurriculumSteps(curriculumId: number): CurriculumStep[] {
  const rows = db
    .select({
      id: curriculumItems.id,
      position: curriculumItems.position,
      notes: curriculumItems.notes,
      keyVideoIds: curriculumItems.keyVideoIds,
      moveId: moves.id,
      moveSlug: moves.slug,
      moveName: moves.name,
      moveDifficulty: moves.difficulty,
    })
    .from(curriculumItems)
    .innerJoin(moves, eq(moves.id, curriculumItems.moveId))
    .where(and(eq(curriculumItems.curriculumId, curriculumId), eq(moves.deleted, 0)))
    .orderBy(asc(curriculumItems.position))
    .all();

  return rows.map((r) => {
    const keyVideoIds = (JSON.parse(r.keyVideoIds) as number[]) ?? [];
    const allVideos = getMoveVideos(r.moveId);
    const keyVideos = allVideos.filter((v) => keyVideoIds.includes(v.id));
    return {
      id: r.id,
      position: r.position,
      notes: r.notes,
      keyVideoIds,
      move: { id: r.moveId, slug: r.moveSlug, name: r.moveName, difficulty: r.moveDifficulty },
      keyVideos,
    };
  });
}

export function getLearnedMoveIds(userId: number, curriculumId: number): Set<number> {
  return new Set(
    db
      .select({ moveId: learned.moveId })
      .from(learned)
      .where(and(eq(learned.userId, userId), eq(learned.curriculumId, curriculumId)))
      .all()
      .map((r) => r.moveId)
  );
}

export function getCurriculumRevisionList(curriculumId: number) {
  return db
    .select({
      id: curriculumRevisions.id,
      revisionNo: curriculumRevisions.revisionNo,
      title: curriculumRevisions.title,
      editSummary: curriculumRevisions.editSummary,
      createdAt: curriculumRevisions.createdAt,
      editor: users.username,
    })
    .from(curriculumRevisions)
    .innerJoin(users, eq(users.id, curriculumRevisions.editorId))
    .where(eq(curriculumRevisions.curriculumId, curriculumId))
    .orderBy(desc(curriculumRevisions.revisionNo))
    .all();
}

export function getCurriculumRevision(curriculumId: number, revisionNo: number) {
  return db
    .select({
      id: curriculumRevisions.id,
      revisionNo: curriculumRevisions.revisionNo,
      title: curriculumRevisions.title,
      description: curriculumRevisions.description,
      items: curriculumRevisions.items,
      editSummary: curriculumRevisions.editSummary,
      createdAt: curriculumRevisions.createdAt,
      editor: users.username,
    })
    .from(curriculumRevisions)
    .innerJoin(users, eq(users.id, curriculumRevisions.editorId))
    .where(
      and(
        eq(curriculumRevisions.curriculumId, curriculumId),
        eq(curriculumRevisions.revisionNo, revisionNo)
      )
    )
    .get();
}

export function getLatestCurriculumRevisionNo(curriculumId: number): number {
  const row = db
    .select({ revisionNo: curriculumRevisions.revisionNo })
    .from(curriculumRevisions)
    .where(eq(curriculumRevisions.curriculumId, curriculumId))
    .orderBy(desc(curriculumRevisions.revisionNo))
    .limit(1)
    .get();
  return row?.revisionNo ?? 0;
}

/** Resolve move names for a revision's item snapshot (deleted moves included, marked). */
export function resolveRevisionItems(itemsJson: string) {
  const items = (JSON.parse(itemsJson) as { moveId: number; notes: string; keyVideoIds: number[] }[]) ?? [];
  if (items.length === 0) return [];
  const moveRows = db
    .select({ id: moves.id, slug: moves.slug, name: moves.name, deleted: moves.deleted })
    .from(moves)
    .where(inArray(moves.id, items.map((i) => i.moveId)))
    .all();
  const moveMap = new Map(moveRows.map((m) => [m.id, m]));
  return items.map((item) => ({
    ...item,
    move: moveMap.get(item.moveId) ?? null,
  }));
}
