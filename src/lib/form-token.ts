import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// A per-process secret is enough here: tokens only need to survive the minutes
// between loading the signup page and submitting it. A deploy invalidates open
// forms, and the error asks the person to reload.
const SECRET = process.env.FORM_SECRET ?? randomBytes(32).toString("hex");

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("hex").slice(0, 32);
}

/** A signed record of when a form was rendered. */
export function issueFormToken(): string {
  const issued = Date.now().toString(36);
  return `${issued}.${sign(issued)}`;
}

/** Milliseconds since the token was issued, or null if it is missing or forged. */
export function formTokenAgeMs(token: unknown): number | null {
  if (typeof token !== "string") return null;
  const [issued, signature] = token.split(".");
  if (!issued || !signature) return null;
  const expected = Buffer.from(sign(issued));
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  const issuedAt = parseInt(issued, 36);
  return Number.isFinite(issuedAt) ? Date.now() - issuedAt : null;
}
