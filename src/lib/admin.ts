import "server-only";
import type { User } from "@/db/schema";

/**
 * Admins are named by the ADMIN_USERNAMES env var (comma-separated).
 * Defaults to the seed account so a fresh install has a working admin.
 */
export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  const names = (process.env.ADMIN_USERNAMES ?? "archivist")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return names.includes(user.username.toLowerCase());
}
