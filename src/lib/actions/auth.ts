"use server";

import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import { eq, or, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { emailVerificationTokens, passwordResetTokens, sessions, users } from "@/db/schema";
import {
  checkRateLimit,
  clientIp,
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";
import { safeNextPath } from "@/lib/redirects";
import { SITE_URL } from "@/lib/site-url";
import { canonicalEmail } from "@/lib/email";
import { formTokenAgeMs } from "@/lib/form-token";

export type AuthFormState = { error: string | null };

const SIGNUP_MIN_MS = 2000;
const SIGNUP_MAX_MS = 6 * 60 * 60 * 1000;

export async function signup(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const hdrs = await headers();
  const ip = clientIp(hdrs);
  // "local" means no Fly proxy (development and e2e), where there is no real traffic to limit
  if (ip !== "local" && !checkRateLimit(`signup:${ip}`, 5, 60 * 60 * 1000)) {
    return { error: "Too many signup attempts. Try again later." };
  }

  // Bot checks. A person leaves the hidden "homepage" field empty and spends
  // more than a couple of seconds on the form; the scripted signups that sent
  // confirmation emails to strangers in Sep 2026 did neither.
  const formAge = formTokenAgeMs(formData.get("formToken"));
  const looksAutomated =
    String(formData.get("homepage") ?? "") !== "" ||
    formAge == null ||
    formAge < SIGNUP_MIN_MS ||
    formAge > SIGNUP_MAX_MS;
  if (looksAutomated) {
    console.warn(`[signup] rejected as automated: ip=${ip} age=${formAge}`);
    return { error: "Something went wrong. Reload the page and try again." };
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
  // dotted and "+tag" variants of an existing Gmail address count as the same address
  const canonical = canonicalEmail(email);
  if (canonical !== email) {
    const gmailUsers = db
      .select({ email: users.email })
      .from(users)
      .where(sql`${users.email} like '%@gmail.com' or ${users.email} like '%@googlemail.com'`)
      .all();
    if (gmailUsers.some((u) => canonicalEmail(u.email) === canonical)) {
      return { error: "An account with that email already exists." };
    }
  }

  const inserted = db
    .insert(users)
    .values({ email, username, passwordHash: hashPassword(password), createdAt: Date.now() })
    .returning({ id: users.id })
    .get();

  const next = safeNextPath(formData.get("next"));
  await sendVerificationEmail(inserted.id, email, username, next);
  await createSession(inserted.id);
  redirect(next);
}

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const hdrs = await headers();
  const ip = clientIp(hdrs);
  if (!checkRateLimit(`login:${ip}`) || !checkRateLimit(`login-account:${email}`, 20)) {
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

/** `next` is where the confirmation link returns them: the page they were on when they signed up. */
async function sendVerificationEmail(
  userId: number,
  email: string,
  username: string,
  next = "/"
): Promise<void> {
  const token = randomBytes(32).toString("hex");
  db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, userId)).run();
  db.insert(emailVerificationTokens)
    .values({
      id: createHash("sha256").update(token).digest("hex"),
      userId,
      expiresAt: Date.now() + VERIFY_TOKEN_TTL_MS,
    })
    .run();

  const link = `${SITE_URL}/verify-email?token=${token}${next !== "/" ? `&next=${encodeURIComponent(next)}` : ""}`;
  await sendEmail({
    to: email,
    subject: "Confirm your Westie Wiki email",
    text: `Hi ${username},\n\nConfirm your email to start editing on Westie Wiki. This link expires in 24 hours:\n\n${link}\n\nIf you didn't create this account, you can ignore this email.\n\n— Westie Wiki`,
  });
}

export async function resendVerification(nextPath?: string): Promise<AuthFormState & { sent?: boolean }> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.emailVerifiedAt != null) return { error: null, sent: true };

  const hdrs = await headers();
  const ip = clientIp(hdrs);
  if (!checkRateLimit(`verify:${ip}`, 5)) {
    return { error: "Too many requests. Try again in a few minutes." };
  }

  await sendVerificationEmail(user.id, user.email, user.username, safeNextPath(nextPath));
  return { error: null, sent: true };
}

/** The confirm button on /verify-email: consume the token, then show the result page. */
export async function confirmEmail(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  const next = safeNextPath(formData.get("next"));

  let ok = false;
  if (/^[a-f0-9]{64}$/.test(token)) {
    const row = db
      .select({ userId: emailVerificationTokens.userId, expiresAt: emailVerificationTokens.expiresAt, blockedAt: users.blockedAt })
      .from(emailVerificationTokens)
      .innerJoin(users, eq(users.id, emailVerificationTokens.userId))
      .where(eq(emailVerificationTokens.id, createHash("sha256").update(token).digest("hex")))
      .get();
    if (row && row.expiresAt >= Date.now() && row.blockedAt == null) {
      db.update(users).set({ emailVerifiedAt: Date.now() }).where(eq(users.id, row.userId)).run();
      db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, row.userId)).run();
      ok = true;
    }
  }

  const nextParam = next !== "/" ? `&next=${encodeURIComponent(next)}` : "";
  redirect(`/verify-email/result${ok ? `?ok=1${nextParam}` : ""}`);
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
  const ip = clientIp(hdrs);
  if (!checkRateLimit(`reset:${ip}`, 5) || !checkRateLimit(`reset-account:${email}`, 3, 60 * 60 * 1000)) {
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

    const link = `${SITE_URL}/reset-password?token=${token}`;
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
