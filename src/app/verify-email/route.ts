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

  const url = request.nextUrl.clone();
  url.pathname = "/verify-email/result";
  url.search = ok ? "?ok=1" : "";
  return NextResponse.redirect(url, 303);
}
