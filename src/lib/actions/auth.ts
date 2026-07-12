"use server";

import { redirect } from "next/navigation";
import { eq, or, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  checkRateLimit,
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { safeNextPath } from "@/lib/redirects";

export type AuthFormState = { error: string | null };

export async function signup(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!checkRateLimit(`signup:${ip}`)) {
    return { error: "Too many signup attempts. Try again in a few minutes." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  if (!/^[a-zA-Z0-9_-]{3,24}$/.test(username))
    return { error: "Username must be 3–24 characters: letters, numbers, - or _." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  // usernames are case-insensitively unique so "Archivist" can't impersonate "archivist"
  const existing = db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(or(eq(users.email, email), sql`lower(${users.username}) = ${username.toLowerCase()}`))
    .get();
  if (existing) {
    return {
      error:
        existing.email === email
          ? "An account with that email already exists."
          : "That username is taken.",
    };
  }

  const inserted = db
    .insert(users)
    .values({ email, username, passwordHash: hashPassword(password), createdAt: Date.now() })
    .returning({ id: users.id })
    .get();

  await createSession(inserted.id);
  redirect(safeNextPath(formData.get("next")));
}

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!checkRateLimit(`login:${ip}`)) {
    return { error: "Too many login attempts. Try again in a few minutes." };
  }

  const user = db.select().from(users).where(eq(users.email, email)).get();
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Incorrect email or password." };
  }

  await createSession(user.id);
  redirect(safeNextPath(formData.get("next")));
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/");
}
