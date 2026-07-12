"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { DANCE_ROLES, users, type DanceRole } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export type ProfileFormState = { error: string | null; success?: boolean };

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");

  const displayName = String(formData.get("displayName") ?? "").trim().slice(0, 60);
  const city = String(formData.get("city") ?? "").trim().slice(0, 60);
  const bio = String(formData.get("bio") ?? "").replace(/\r\n/g, "\n").trim();
  const danceRoleRaw = String(formData.get("danceRole") ?? "");
  const danceRole = (DANCE_ROLES as readonly string[]).includes(danceRoleRaw)
    ? (danceRoleRaw as DanceRole)
    : null;

  if (bio.length > 1000) return { error: "Bio is capped at 1,000 characters." };

  db.update(users)
    .set({
      displayName: displayName || null,
      city: city || null,
      bio: bio || null,
      danceRole,
    })
    .where(eq(users.id, user.id))
    .run();

  revalidatePath("/profile");
  revalidatePath(`/users/${user.username}`);
  return { error: null, success: true };
}
