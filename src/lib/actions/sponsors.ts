"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sponsors } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";

export type SponsorFormState = { error: string | null; success?: boolean };

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) throw new Error("FORBIDDEN");
  return user!;
}

function revalidateSponsorSurfaces() {
  revalidatePath("/admin/sponsors");
  revalidatePath("/");
  revalidatePath("/moves/[slug]", "page");
}

export async function addSponsor(_prev: SponsorFormState, formData: FormData): Promise<SponsorFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const url = String(formData.get("url") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim().slice(0, 140);
  const position = Number(formData.get("position"));

  if (name.length < 2) return { error: "Sponsor name is required." };
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { error: "Enter a full URL, including https://." };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { error: "The URL must be http(s)." };
  }

  db.insert(sponsors)
    .values({
      name,
      url: parsed.toString(),
      tagline,
      position: Number.isInteger(position) ? position : 0,
      createdAt: Date.now(),
    })
    .run();

  revalidateSponsorSurfaces();
  return { error: null, success: true };
}

export async function toggleSponsor(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("sponsorId"));
  const sponsor = db.select().from(sponsors).where(eq(sponsors.id, id)).get();
  if (!sponsor) return;
  db.update(sponsors).set({ active: sponsor.active ? 0 : 1 }).where(eq(sponsors.id, id)).run();
  revalidateSponsorSurfaces();
}

export async function deleteSponsor(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("sponsorId"));
  db.delete(sponsors).where(eq(sponsors.id, id)).run();
  revalidateSponsorSurfaces();
}
