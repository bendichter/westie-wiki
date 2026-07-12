import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { emailVerificationTokens, users } from "@/db/schema";

/** Email verification link target: consume the token, then show the result page. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";

  let ok = false;
  if (/^[a-f0-9]{64}$/.test(token)) {
    const row = db
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.id, createHash("sha256").update(token).digest("hex")))
      .get();
    if (row && row.expiresAt >= Date.now()) {
      db.update(users).set({ emailVerifiedAt: Date.now() }).where(eq(users.id, row.userId)).run();
      db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, row.userId)).run();
      ok = true;
    }
  }

  // behind fly-proxy, nextUrl reflects the internal host (localhost:3000) —
  // build the public URL from the forwarded headers instead
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const host = request.headers.get("host") ?? "localhost:3000";
  return NextResponse.redirect(
    `${proto}://${host}/verify-email/result${ok ? "?ok=1" : ""}`,
    303
  );
}
