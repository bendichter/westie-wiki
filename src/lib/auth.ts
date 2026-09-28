import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";

export { hashPassword, verifyPassword } from "./auth-crypto";

const SESSION_COOKIE = "wcs_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

// --- sessions ---

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  db.insert(sessions).values({ id: hashToken(token), userId, expiresAt }).run();
  // opportunistic cleanup of expired sessions
  db.delete(sessions).where(lt(sessions.expiresAt, Date.now())).run();

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    db.delete(sessions).where(eq(sessions.id, hashToken(token))).run();
  }
  cookieStore.delete(SESSION_COOKIE);
}

/** Current logged-in user, or null. Cached per request. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const row = db
    .select({ user: users, expiresAt: sessions.expiresAt })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.id, hashToken(token)))
    .get();

  if (!row || row.expiresAt < Date.now() || row.user.blockedAt != null) return null;
  return row.user;
});

/** Like getCurrentUser but throws a redirect-worthy error string if not logged in. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export const VERIFY_TO_EDIT_ERROR =
  "Confirm your email address to edit — check your inbox for the link, or resend it from the banner above.";

/** Editing requires a confirmed email; browsing and personal lists don't. */
export function isVerified(user: User | null): boolean {
  return user?.emailVerifiedAt != null;
}

// --- naive in-memory rate limiting (per process) ---

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_TRACKED_KEYS = 10_000;

export function checkRateLimit(key: string, max = 10, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  if (attempts.size >= MAX_TRACKED_KEYS) {
    for (const [k, v] of attempts) if (v.resetAt < now) attempts.delete(k);
    // still full of live entries: drop the oldest insertions
    for (const k of attempts.keys()) {
      if (attempts.size < MAX_TRACKED_KEYS) break;
      attempts.delete(k);
    }
  }
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= max;
}

/**
 * The visitor's IP for rate limiting. Fly's proxy sets Fly-Client-IP and
 * overwrites any client-supplied value; X-Forwarded-For is not used because
 * its first entry is whatever the client sent.
 */
export function clientIp(hdrs: Headers): string {
  return hdrs.get("fly-client-ip")?.trim() || "local";
}

export const WRITE_RATE_LIMIT_ERROR = "You're making changes very quickly. Wait a few minutes and try again.";

/**
 * Shared budget for all wiki writes by one account: generous enough for
 * marking every move in a dance in one sitting, low enough to cap scripted
 * vandalism or spam from a single account.
 */
export function checkWriteRateLimit(userId: number): boolean {
  return checkRateLimit(`write:${userId}`, 150, 10 * 60 * 1000);
}
