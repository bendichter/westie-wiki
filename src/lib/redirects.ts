/**
 * Validate a user-supplied post-login destination. Only same-origin absolute
 * paths pass: exactly one leading "/", and no backslashes anywhere (WHATWG URL
 * parsing treats "\" like "/", so "/\evil.com" would escape the origin).
 * Everything else falls back to "/".
 */
export function safeNextPath(raw: unknown): string {
  const next = typeof raw === "string" ? raw : "";
  if (/^\/(?!\/)/.test(next) && !next.includes("\\")) return next;
  return "/";
}
