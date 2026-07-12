"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  DIFFICULTIES,
  moveAliases,
  moveRevisions,
  moves,
  moveTags,
  tags,
  type Difficulty,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getLatestRevisionNo, getRevision } from "@/lib/data/moves";
import { slugify, uniqueSlug } from "@/lib/slug";

export type MoveFormState = { error: string | null };

function parseAliases(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  ].slice(0, 12);
}

function parseTagNames(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  ].slice(0, 10);
}

function parseDifficulty(raw: string): Difficulty | null {
  return (DIFFICULTIES as readonly string[]).includes(raw) ? (raw as Difficulty) : null;
}

function syncAliases(moveId: number, aliases: string[]) {
  db.delete(moveAliases).where(eq(moveAliases.moveId, moveId)).run();
  if (aliases.length > 0) {
    db.insert(moveAliases)
      .values(aliases.map((name) => ({ moveId, name })))
      .run();
  }
}

function syncTags(moveId: number, tagNames: string[]) {
  db.delete(moveTags).where(eq(moveTags.moveId, moveId)).run();
  for (const name of tagNames) {
    const slug = slugify(name);
    let tag = db.select().from(tags).where(eq(tags.slug, slug)).get();
    if (!tag) {
      tag = db.insert(tags).values({ slug, name }).returning().get();
    }
    db.insert(moveTags).values({ moveId, tagId: tag.id }).onConflictDoNothing().run();
  }
}

type ParsedMoveForm = {
  name: string;
  description: string;
  aliases: string[];
  tagNames: string[];
  difficulty: Difficulty | null;
  editSummary: string;
};

function parseMoveForm(formData: FormData): { ok: true; data: ParsedMoveForm } | { ok: false; error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").replace(/\r\n/g, "\n").trim();
  const aliases = parseAliases(String(formData.get("aliases") ?? ""));
  const tagNames = parseTagNames(String(formData.get("tags") ?? ""));
  const difficulty = parseDifficulty(String(formData.get("difficulty") ?? ""));
  const editSummary = String(formData.get("editSummary") ?? "").trim().slice(0, 200);

  if (name.length < 2 || name.length > 80) return { ok: false, error: "Move name must be 2–80 characters." };
  if (description.length > 20000) return { ok: false, error: "Description is too long (20,000 character max)." };

  return { ok: true, data: { name, description, aliases, tagNames, difficulty, editSummary } };
}

/**
 * Move names must be unique (case-insensitively): relations and curricula
 * resolve moves by exact name, so duplicates would bind ambiguously.
 */
function nameTaken(name: string, excludeMoveId?: number): boolean {
  const conditions = [
    sql`lower(${moves.name}) = ${name.toLowerCase()}`,
    eq(moves.deleted, 0),
  ];
  if (excludeMoveId != null) conditions.push(ne(moves.id, excludeMoveId));
  return !!db
    .select({ id: moves.id })
    .from(moves)
    .where(and(...conditions))
    .get();
}

export async function createMove(_prev: MoveFormState, formData: FormData): Promise<MoveFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/moves/new");

  const parsed = parseMoveForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const { name, description, aliases, tagNames, difficulty, editSummary } = parsed.data;

  if (nameTaken(name)) {
    return { error: `A move named "${name}" already exists — improve that page instead, or pick a distinct name and list this one as an alias there.` };
  }

  const slug = uniqueSlug(
    slugify(name),
    (candidate) => !!db.select({ id: moves.id }).from(moves).where(eq(moves.slug, candidate)).get()
  );

  const now = Date.now();
  const move = db
    .insert(moves)
    .values({ slug, name, description, difficulty, createdBy: user.id, createdAt: now, updatedAt: now })
    .returning()
    .get();

  syncAliases(move.id, aliases);
  syncTags(move.id, tagNames);

  db.insert(moveRevisions)
    .values({
      moveId: move.id,
      revisionNo: 1,
      name,
      description,
      aliases: JSON.stringify(aliases),
      tags: JSON.stringify(tagNames),
      difficulty,
      editorId: user.id,
      editSummary: editSummary || "Created page",
      createdAt: now,
    })
    .run();

  redirect(`/moves/${slug}`);
}

export async function updateMove(_prev: MoveFormState, formData: FormData): Promise<MoveFormState> {
  const user = await getCurrentUser();
  const moveId = Number(formData.get("moveId"));
  const move = db.select().from(moves).where(and(eq(moves.id, moveId), eq(moves.deleted, 0))).get();
  if (!move) return { error: "This move no longer exists." };
  if (!user) redirect(`/login?next=/moves/${move.slug}/edit`);

  const parsed = parseMoveForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const { name, description, aliases, tagNames, difficulty, editSummary } = parsed.data;

  if (nameTaken(name, move.id)) {
    return { error: `A different move named "${name}" already exists — pick a distinct name.` };
  }

  // optimistic concurrency: reject if someone saved a newer revision since this form loaded
  const baseRevision = Number(formData.get("baseRevision"));
  const latest = getLatestRevisionNo(move.id);
  if (Number.isFinite(baseRevision) && baseRevision !== latest) {
    return {
      error: `Someone else saved revision ${latest} while you were editing. Open the page in a new tab to see their change, then re-apply yours.`,
    };
  }

  const now = Date.now();
  db.update(moves)
    .set({ name, description, difficulty, updatedAt: now })
    .where(eq(moves.id, move.id))
    .run();
  syncAliases(move.id, aliases);
  syncTags(move.id, tagNames);

  db.insert(moveRevisions)
    .values({
      moveId: move.id,
      revisionNo: latest + 1,
      name,
      description,
      aliases: JSON.stringify(aliases),
      tags: JSON.stringify(tagNames),
      difficulty,
      editorId: user.id,
      editSummary,
      createdAt: now,
    })
    .run();

  revalidatePath(`/moves/${move.slug}`);
  redirect(`/moves/${move.slug}`);
}

export async function restoreRevision(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  const moveId = Number(formData.get("moveId"));
  const revisionNo = Number(formData.get("revisionNo"));
  const move = db.select().from(moves).where(and(eq(moves.id, moveId), eq(moves.deleted, 0))).get();
  if (!move) return;
  if (!user) redirect(`/login?next=/moves/${move.slug}/history`);

  const revision = getRevision(move.id, revisionNo);
  if (!revision) return;

  // restoring must not collide with a move renamed to this name since then
  if (nameTaken(revision.name, move.id)) {
    redirect(`/moves/${move.slug}/history`);
  }

  const now = Date.now();
  const latest = getLatestRevisionNo(move.id);
  const aliases = JSON.parse(revision.aliases) as string[];
  const tagNames = JSON.parse(revision.tags || "[]") as string[];

  db.update(moves)
    .set({
      name: revision.name,
      description: revision.description,
      difficulty: revision.difficulty,
      updatedAt: now,
    })
    .where(eq(moves.id, move.id))
    .run();
  syncAliases(move.id, aliases);
  syncTags(move.id, tagNames);

  db.insert(moveRevisions)
    .values({
      moveId: move.id,
      revisionNo: latest + 1,
      name: revision.name,
      description: revision.description,
      aliases: revision.aliases,
      tags: revision.tags,
      difficulty: revision.difficulty,
      editorId: user.id,
      editSummary: `Restored revision ${revisionNo}`,
      createdAt: now,
    })
    .run();

  revalidatePath(`/moves/${move.slug}`);
  redirect(`/moves/${move.slug}`);
}
