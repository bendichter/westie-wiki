"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { curricula, curriculumItems, curriculumRevisions, moves } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { slugify, uniqueSlug } from "@/lib/slug";

export type CurriculumFormState = { error: string | null };

export type CurriculumItemInput = {
  moveId: number;
  notes: string;
  keyVideoIds: number[];
};

function parseItems(raw: string): CurriculumItemInput[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length > 200) return null;

  const items: CurriculumItemInput[] = [];
  for (const entry of parsed) {
    if (typeof entry !== "object" || entry === null) return null;
    const e = entry as Record<string, unknown>;
    const moveId = Number(e.moveId);
    if (!Number.isInteger(moveId)) return null;
    const notes = typeof e.notes === "string" ? e.notes.slice(0, 5000) : "";
    const keyVideoIds = Array.isArray(e.keyVideoIds)
      ? e.keyVideoIds.map(Number).filter(Number.isInteger).slice(0, 10)
      : [];
    items.push({ moveId, notes, keyVideoIds });
  }
  return items;
}

function getLatestCurriculumRevisionNo(curriculumId: number): number {
  const row = db
    .select({ revisionNo: curriculumRevisions.revisionNo })
    .from(curriculumRevisions)
    .where(eq(curriculumRevisions.curriculumId, curriculumId))
    .orderBy(desc(curriculumRevisions.revisionNo))
    .limit(1)
    .get();
  return row?.revisionNo ?? 0;
}

function replaceItems(curriculumId: number, items: CurriculumItemInput[]) {
  db.delete(curriculumItems).where(eq(curriculumItems.curriculumId, curriculumId)).run();
  items.forEach((item, index) => {
    db.insert(curriculumItems)
      .values({
        curriculumId,
        position: index,
        moveId: item.moveId,
        notes: item.notes,
        keyVideoIds: JSON.stringify(item.keyVideoIds),
      })
      .run();
  });
}

function writeRevision(
  curriculumId: number,
  title: string,
  description: string,
  items: CurriculumItemInput[],
  editorId: number,
  editSummary: string
) {
  db.insert(curriculumRevisions)
    .values({
      curriculumId,
      revisionNo: getLatestCurriculumRevisionNo(curriculumId) + 1,
      title,
      description,
      items: JSON.stringify(items),
      editorId,
      editSummary,
      createdAt: Date.now(),
    })
    .run();
}

export async function createCurriculum(
  _prev: CurriculumFormState,
  formData: FormData
): Promise<CurriculumFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/curricula/new");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").replace(/\r\n/g, "\n").trim();
  if (title.length < 3 || title.length > 100) return { error: "Title must be 3–100 characters." };
  if (description.length > 5000) return { error: "Description is too long." };

  const slug = uniqueSlug(
    slugify(title),
    (c) => !!db.select({ id: curricula.id }).from(curricula).where(eq(curricula.slug, c)).get()
  );

  const now = Date.now();
  const curriculum = db
    .insert(curricula)
    .values({ slug, title, description, createdBy: user.id, createdAt: now, updatedAt: now })
    .returning()
    .get();

  writeRevision(curriculum.id, title, description, [], user.id, "Created curriculum");
  redirect(`/curricula/${slug}/edit`);
}

export async function updateCurriculum(
  _prev: CurriculumFormState,
  formData: FormData
): Promise<CurriculumFormState> {
  const user = await getCurrentUser();
  const curriculumId = Number(formData.get("curriculumId"));
  const curriculum = db
    .select()
    .from(curricula)
    .where(and(eq(curricula.id, curriculumId), eq(curricula.deleted, 0)))
    .get();
  if (!curriculum) return { error: "This curriculum no longer exists." };
  if (!user) redirect(`/login?next=/curricula/${curriculum.slug}/edit`);

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").replace(/\r\n/g, "\n").trim();
  const editSummary = String(formData.get("editSummary") ?? "").trim().slice(0, 200);
  if (title.length < 3 || title.length > 100) return { error: "Title must be 3–100 characters." };
  if (description.length > 5000) return { error: "Description is too long." };

  const items = parseItems(String(formData.get("itemsJson") ?? "[]"));
  if (!items) return { error: "The move list couldn't be read — reload and try again." };

  // all moves must exist and be live
  if (items.length > 0) {
    const validIds = new Set(
      db
        .select({ id: moves.id })
        .from(moves)
        .where(and(inArray(moves.id, items.map((i) => i.moveId)), eq(moves.deleted, 0)))
        .all()
        .map((r) => r.id)
    );
    if (items.some((i) => !validIds.has(i.moveId))) {
      return { error: "One of the moves in the list no longer exists. Remove it and try again." };
    }
  }

  const baseRevision = Number(formData.get("baseRevision"));
  const latest = getLatestCurriculumRevisionNo(curriculum.id);
  if (Number.isFinite(baseRevision) && baseRevision !== latest) {
    return {
      error: `Someone else saved revision ${latest} while you were editing. Open the page in a new tab to see their change, then re-apply yours.`,
    };
  }

  db.update(curricula)
    .set({ title, description, updatedAt: Date.now() })
    .where(eq(curricula.id, curriculum.id))
    .run();
  replaceItems(curriculum.id, items);
  writeRevision(curriculum.id, title, description, items, user.id, editSummary);

  revalidatePath(`/curricula/${curriculum.slug}`);
  redirect(`/curricula/${curriculum.slug}`);
}

export async function restoreCurriculumRevision(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  const curriculumId = Number(formData.get("curriculumId"));
  const revisionNo = Number(formData.get("revisionNo"));
  const curriculum = db
    .select()
    .from(curricula)
    .where(and(eq(curricula.id, curriculumId), eq(curricula.deleted, 0)))
    .get();
  if (!curriculum) return;
  if (!user) redirect(`/login?next=/curricula/${curriculum.slug}/history`);

  const revision = db
    .select()
    .from(curriculumRevisions)
    .where(
      and(
        eq(curriculumRevisions.curriculumId, curriculum.id),
        eq(curriculumRevisions.revisionNo, revisionNo)
      )
    )
    .get();
  if (!revision) return;

  const items = parseItems(revision.items) ?? [];
  // drop moves deleted since the revision was written
  const validIds = new Set(
    items.length > 0
      ? db
          .select({ id: moves.id })
          .from(moves)
          .where(and(inArray(moves.id, items.map((i) => i.moveId)), eq(moves.deleted, 0)))
          .all()
          .map((r) => r.id)
      : []
  );
  const liveItems = items.filter((i) => validIds.has(i.moveId));

  db.update(curricula)
    .set({ title: revision.title, description: revision.description, updatedAt: Date.now() })
    .where(eq(curricula.id, curriculum.id))
    .run();
  replaceItems(curriculum.id, liveItems);
  writeRevision(
    curriculum.id,
    revision.title,
    revision.description,
    liveItems,
    user.id,
    `Restored revision ${revisionNo}`
  );

  revalidatePath(`/curricula/${curriculum.slug}`);
  redirect(`/curricula/${curriculum.slug}`);
}
