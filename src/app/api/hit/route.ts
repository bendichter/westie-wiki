import { NextResponse, type NextRequest } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { pageViews } from "@/db/schema";

/**
 * Page-view beacon. Client-side only (so crawlers don't count), stores
 * path + day tallies and nothing else: no visitor id, no IP, no cookies.
 */
export async function POST(request: NextRequest) {
  let path: unknown;
  try {
    ({ path } = await request.json());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof path !== "string" || !path.startsWith("/") || path.length > 200) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  // strip query strings and normalize; skip admin/api noise
  const clean = path.split("?")[0];
  if (clean.startsWith("/admin") || clean.startsWith("/api")) {
    return NextResponse.json({ ok: true });
  }

  const day = new Date().toISOString().slice(0, 10);
  db.insert(pageViews)
    .values({ path: clean, day, count: 1 })
    .onConflictDoUpdate({
      target: [pageViews.path, pageViews.day],
      set: { count: sql`${pageViews.count} + 1` },
    })
    .run();

  return NextResponse.json({ ok: true });
}
