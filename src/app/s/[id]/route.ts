import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { sponsors } from "@/db/schema";

/** Sponsor click-through: count the click, then send the visitor on. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sponsorId = Number(id);
  if (!Number.isInteger(sponsorId)) {
    return NextResponse.redirect(new URL("/", "https://westie.wiki"), 302);
  }

  const sponsor = db.select().from(sponsors).where(eq(sponsors.id, sponsorId)).get();
  if (!sponsor || !sponsor.active) {
    return NextResponse.redirect(new URL("/sponsor", "https://westie.wiki"), 302);
  }

  db.update(sponsors)
    .set({ clicks: sql`${sponsors.clicks} + 1` })
    .where(eq(sponsors.id, sponsorId))
    .run();

  return NextResponse.redirect(sponsor.url, 302);
}
