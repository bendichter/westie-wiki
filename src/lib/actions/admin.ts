"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { moves, sessions, users } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) throw new Error("FORBIDDEN");
  return user!;
}

/** Soft-delete a move: hidden everywhere, revisions preserved, restorable. */
export async function adminDeleteMove(formData: FormData): Promise<void> {
  await requireAdmin();
  const moveId = Number(formData.get("moveId"));
  const move = db.select().from(moves).where(eq(moves.id, moveId)).get();
  if (!move) return;
  db.update(moves).set({ deleted: 1 }).where(eq(moves.id, moveId)).run();
  revalidatePath("/moves");
  revalidatePath("/admin/moderation");
  redirect("/moves");
}

export async function adminRestoreMove(formData: FormData): Promise<void> {
  await requireAdmin();
  const moveId = Number(formData.get("moveId"));
  const move = db.select().from(moves).where(eq(moves.id, moveId)).get();
  if (!move) return;
  db.update(moves).set({ deleted: 0 }).where(eq(moves.id, moveId)).run();
  revalidatePath("/moves");
  revalidatePath(`/moves/${move.slug}`);
  revalidatePath("/admin/moderation");
}

/** Block an account: kills its sessions and prevents future logins. */
export async function blockUser(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const userId = Number(formData.get("userId"));
  if (userId === admin.id) return; // no self-blocking
  const target = db.select().from(users).where(eq(users.id, userId)).get();
  if (!target) return;
  db.update(users).set({ blockedAt: Date.now() }).where(eq(users.id, userId)).run();
  db.delete(sessions).where(eq(sessions.userId, userId)).run();
  revalidatePath("/admin/moderation");
}

export async function unblockUser(formData: FormData): Promise<void> {
  await requireAdmin();
  const userId = Number(formData.get("userId"));
  db.update(users).set({ blockedAt: null }).where(eq(users.id, userId)).run();
  revalidatePath("/admin/moderation");
}
