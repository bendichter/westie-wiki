/**
 * Public origin used in emailed links. Never derive this from the request's
 * Host header: an attacker can send any Host, and a password-reset email
 * built from it would carry the victim's token to the attacker's domain.
 */
export const SITE_URL = (
  process.env.SITE_URL ??
  (process.env.NODE_ENV === "production" ? "https://westie.wiki" : "http://localhost:3000")
).replace(/\/$/, "");
