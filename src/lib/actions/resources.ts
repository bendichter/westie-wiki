"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { moveResources, moves } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { getCurrentUser, isVerified, VERIFY_TO_EDIT_ERROR } from "@/lib/auth";

export type ResourceFormState = { error: string | null; success?: boolean };

export async function addResource(
  _prev: ResourceFormState,
  formData: FormData
): Promise<ResourceFormState> {
  const user = await getCurrentUser();
  const moveId = Number(formData.get("moveId"));
  const move = db.select().from(moves).where(and(eq(moves.id, moveId), eq(moves.deleted, 0))).get();
  if (!move) return { error: "This move no longer exists." };
  if (!user) redirect(`/login?next=/moves/${move.slug}`);
  if (!isVerified(user)) return { error: VERIFY_TO_EDIT_ERROR };

  const urlRaw = String(formData.get("url") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim().slice(0, 120);
  if (title.length < 3) return { error: "Give the resource a short title (who teaches it, what it covers)." };

  let url: URL;
  try {
    url = new URL(urlRaw);
  } catch {
    return { error: "Enter a full link, including https://." };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { error: "The link must be http(s)." };
  }

  const existing = db
    .select()
    .from(moveResources)
    .where(eq(moveResources.moveId, move.id))
    .all();
  if (existing.some((r) => r.url === url.toString())) {
    return { error: "That link is already cited on this move." };
  }
  if (existing.length >= 30) {
    return { error: "This move already cites 30 resources — tidy before adding more." };
  }

  db.insert(moveResources)
    .values({ moveId: move.id, url: url.toString(), title, addedBy: user.id, createdAt: Date.now() })
    .run();

  revalidatePath(`/moves/${move.slug}`);
  return { error: null, success: true };
}

export async function deleteResource(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const resourceId = Number(formData.get("resourceId"));
  const resource = db.select().from(moveResources).where(eq(moveResources.id, resourceId)).get();
  if (!resource) return;
  if (resource.addedBy !== user.id && !isAdmin(user)) return;

  db.delete(moveResources).where(eq(moveResources.id, resourceId)).run();
  const move = db.select().from(moves).where(eq(moves.id, resource.moveId)).get();
  if (move) revalidatePath(`/moves/${move.slug}`);
}
