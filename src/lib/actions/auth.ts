"use server";

import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import { eq, or, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { emailVerificationTokens, passwordResetTokens, sessions, users } from "@/db/schema";
import {
  checkRateLimit,
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";
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

  await sendVerificationEmail(inserted.id, email, username);
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
  if (user.blockedAt != null) {
    return { error: "This account has been disabled. Contact the site admin if you think that's a mistake." };
  }

  await createSession(user.id);
  redirect(safeNextPath(formData.get("next")));
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/");
}

// --- email verification ---

const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function sendVerificationEmail(userId: number, email: string, username: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, userId)).run();
  db.insert(emailVerificationTokens)
    .values({
      id: createHash("sha256").update(token).digest("hex"),
      userId,
      expiresAt: Date.now() + VERIFY_TOKEN_TTL_MS,
    })
    .run();

  const hdrs = await headers();
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const host = hdrs.get("host") ?? "localhost:3000";
  const link = `${proto}://${host}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: "Confirm your Westie Wiki email",
    text: `Hi ${username},\n\nConfirm your email to start editing on Westie Wiki. This link expires in 24 hours:\n\n${link}\n\nIf you didn't create this account, you can ignore this email.\n\n— Westie Wiki`,
  });
}

export async function resendVerification(): Promise<AuthFormState & { sent?: boolean }> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.emailVerifiedAt != null) return { error: null, sent: true };

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!checkRateLimit(`verify:${ip}`, 5)) {
    return { error: "Too many requests. Try again in a few minutes." };
  }

  await sendVerificationEmail(user.id, user.email, user.username);
  return { error: null, sent: true };
}

// --- password reset ---

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState & { sent?: boolean }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!checkRateLimit(`reset:${ip}`, 5)) {
    return { error: "Too many reset requests. Try again in a few minutes." };
  }

  // Always claim success so the form can't be used to probe which emails exist.
  const user = db.select().from(users).where(eq(users.email, email)).get();
  if (user) {
    const token = randomBytes(32).toString("hex");
    db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id)).run();
    db.insert(passwordResetTokens)
      .values({ id: hashResetToken(token), userId: user.id, expiresAt: Date.now() + RESET_TOKEN_TTL_MS })
      .run();

    const proto = hdrs.get("x-forwarded-proto") ?? "http";
    const host = hdrs.get("host") ?? "localhost:3000";
    const link = `${proto}://${host}/reset-password?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your Westie Wiki password",
      text: `Hi ${user.username},\n\nSomeone (hopefully you) asked to reset your Westie Wiki password. This link works once and expires in an hour:\n\n${link}\n\nIf you didn't ask for this, you can ignore this email — your password is unchanged.\n\n— Westie Wiki`,
    });
  }

  return { error: null, sent: true };
}

export async function resetPassword(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (!/^[a-f0-9]{64}$/.test(token)) return { error: "This reset link is invalid. Request a new one." };

  const row = db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.id, hashResetToken(token)))
    .get();
  if (!row || row.expiresAt < Date.now()) {
    return { error: "This reset link has expired or was already used. Request a new one." };
  }

  db.update(users)
    .set({ passwordHash: hashPassword(password) })
    .where(eq(users.id, row.userId))
    .run();
  // single-use token; log out every existing session for safety
  db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, row.userId)).run();
  db.delete(sessions).where(eq(sessions.userId, row.userId)).run();

  redirect("/login?reset=1");
}
