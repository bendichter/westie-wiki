"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  comments,
  curricula,
  curriculumItems,
  favorites,
  learned,
  moveRelations,
  moves,
  RELATION_KINDS,
  type RelationKind,
} from "@/db/schema";
import { getCurrentUser, isVerified, VERIFY_TO_EDIT_ERROR } from "@/lib/auth";

export type CommentFormState = { error: string | null; success?: boolean };

export async function addComment(_prev: CommentFormState, formData: FormData): Promise<CommentFormState> {
  const user = await getCurrentUser();
  const moveId = Number(formData.get("moveId"));
  const move = db.select().from(moves).where(and(eq(moves.id, moveId), eq(moves.deleted, 0))).get();
  if (!move) return { error: "This move no longer exists." };
  if (!user) redirect(`/login?next=/moves/${move.slug}`);
  if (!isVerified(user)) return { error: VERIFY_TO_EDIT_ERROR };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Write something first." };
  if (body.length > 5000) return { error: "Comments are capped at 5,000 characters." };

  db.insert(comments).values({ moveId: move.id, userId: user.id, body, createdAt: Date.now() }).run();
  revalidatePath(`/moves/${move.slug}`);
  return { error: null, success: true };
}

export async function deleteComment(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const commentId = Number(formData.get("commentId"));
  const comment = db.select().from(comments).where(eq(comments.id, commentId)).get();
  if (!comment || comment.userId !== user.id) return;

  db.update(comments).set({ deleted: 1 }).where(eq(comments.id, commentId)).run();
  const move = db.select().from(moves).where(eq(moves.id, comment.moveId)).get();
  if (move) revalidatePath(`/moves/${move.slug}`);
}

export async function toggleFavorite(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  const moveId = Number(formData.get("moveId"));
  const move = db.select().from(moves).where(eq(moves.id, moveId)).get();
  if (!move) return;
  if (!user) redirect(`/login?next=/moves/${move.slug}`);

  const existing = db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, user.id), eq(favorites.moveId, moveId)))
    .get();

  if (existing) {
    db.delete(favorites).where(and(eq(favorites.userId, user.id), eq(favorites.moveId, moveId))).run();
  } else {
    db.insert(favorites).values({ userId: user.id, moveId, createdAt: Date.now() }).run();
  }
  revalidatePath(`/moves/${move.slug}`);
}

export type RelationFormState = { error: string | null; success?: boolean };

export async function addRelation(_prev: RelationFormState, formData: FormData): Promise<RelationFormState> {
  const user = await getCurrentUser();
  const fromMoveId = Number(formData.get("moveId"));
  const move = db.select().from(moves).where(and(eq(moves.id, fromMoveId), eq(moves.deleted, 0))).get();
  if (!move) return { error: "This move no longer exists." };
  if (!user) redirect(`/login?next=/moves/${move.slug}`);
  if (!isVerified(user)) return { error: VERIFY_TO_EDIT_ERROR };

  const kindRaw = String(formData.get("kind") ?? "");
  if (!(RELATION_KINDS as readonly string[]).includes(kindRaw)) return { error: "Pick a relationship type." };
  const kind = kindRaw as RelationKind;

  const targetName = String(formData.get("targetMove") ?? "").trim();
  const target = db
    .select()
    .from(moves)
    .where(and(eq(moves.name, targetName), eq(moves.deleted, 0)))
    .get();
  if (!target) return { error: `No move named "${targetName}" — pick one from the suggestions.` };
  if (target.id === move.id) return { error: "A move can't relate to itself." };

  db.insert(moveRelations)
    .values({ fromMoveId: move.id, toMoveId: target.id, kind })
    .onConflictDoNothing()
    .run();
  revalidatePath(`/moves/${move.slug}`);
  revalidatePath(`/moves/${target.slug}`);
  return { error: null, success: true };
}

export async function removeRelation(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || !isVerified(user)) return;
  const relationId = Number(formData.get("relationId"));
  const relation = db.select().from(moveRelations).where(eq(moveRelations.id, relationId)).get();
  if (!relation) return;

  db.delete(moveRelations).where(eq(moveRelations.id, relationId)).run();
  const from = db.select().from(moves).where(eq(moves.id, relation.fromMoveId)).get();
  if (from) revalidatePath(`/moves/${from.slug}`);
}

export async function toggleLearned(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  const curriculumId = Number(formData.get("curriculumId"));
  const moveId = Number(formData.get("moveId"));
  const curriculum = db.select().from(curricula).where(eq(curricula.id, curriculumId)).get();
  if (!curriculum) return;
  if (!user) redirect(`/login?next=/curricula/${curriculum.slug}`);

  // only moves actually in this curriculum can be checked off
  if (!Number.isInteger(moveId)) return;
  const inCurriculum = db
    .select({ id: curriculumItems.id })
    .from(curriculumItems)
    .where(and(eq(curriculumItems.curriculumId, curriculumId), eq(curriculumItems.moveId, moveId)))
    .get();
  if (!inCurriculum) return;

  const where = and(
    eq(learned.userId, user.id),
    eq(learned.curriculumId, curriculumId),
    eq(learned.moveId, moveId)
  );
  const existing = db.select().from(learned).where(where).get();
  if (existing) {
    db.delete(learned).where(where).run();
  } else {
    db.insert(learned).values({ userId: user.id, curriculumId, moveId, checkedAt: Date.now() }).run();
  }
  revalidatePath(`/curricula/${curriculum.slug}`);
}
