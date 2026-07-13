"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { moves, moveVariants, videos } from "@/db/schema";
import { getCurrentUser, isVerified, VERIFY_TO_EDIT_ERROR } from "@/lib/auth";

export type VariantFormState = { error: string | null; success?: boolean };

export async function addVariant(
  _prev: VariantFormState,
  formData: FormData
): Promise<VariantFormState> {
  const user = await getCurrentUser();
  const moveId = Number(formData.get("moveId"));
  const move = db.select().from(moves).where(and(eq(moves.id, moveId), eq(moves.deleted, 0))).get();
  if (!move) return { error: "This move no longer exists." };
  if (!user) redirect(`/login?next=/moves/${move.slug}`);
  if (!isVerified(user)) return { error: VERIFY_TO_EDIT_ERROR };

  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  const note = String(formData.get("note") ?? "").trim().slice(0, 200);
  if (name.length < 2) return { error: "Variant name is required." };

  const existing = db
    .select()
    .from(moveVariants)
    .where(eq(moveVariants.moveId, move.id))
    .all();
  if (existing.some((v) => v.name.toLowerCase() === name.toLowerCase())) {
    return { error: `"${name}" is already a variant of this move.` };
  }
  if (existing.length >= 20) return { error: "This move already has 20 variants — tidy before adding more." };

  db.insert(moveVariants)
    .values({ moveId: move.id, name, note: note || null, createdAt: Date.now() })
    .run();

  revalidatePath(`/moves/${move.slug}`);
  return { error: null, success: true };
}

export async function deleteVariant(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || !isVerified(user)) return;
  const variantId = Number(formData.get("variantId"));
  const variant = db.select().from(moveVariants).where(eq(moveVariants.id, variantId)).get();
  if (!variant) return;

  // untag clips first, then remove the variant
  db.update(videos).set({ variantId: null }).where(eq(videos.variantId, variantId)).run();
  db.delete(moveVariants).where(eq(moveVariants.id, variantId)).run();

  const move = db.select().from(moves).where(eq(moves.id, variant.moveId)).get();
  if (move) revalidatePath(`/moves/${move.slug}`);
}
