import { NextResponse, type NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { curricula, dancers, dances, events, moves, pageViews, regionViews, users } from "@/db/schema";
import { checkRateLimit, clientIp } from "@/lib/auth";

const STATIC_PATHS = new Set([
  "/", "/about", "/changes", "/contributors", "/curricula", "/curricula/new", "/dancers",
  "/dances", "/dances/new", "/events", "/forgot-password", "/guidelines", "/login", "/loop",
  "/moves", "/moves/new", "/profile", "/reset-password", "/search", "/signup", "/sponsor",
  "/verify-email/result",
]);

/**
 * Only count paths that are real pages. The beacon is unauthenticated, so
 * without this anyone could post endless made-up paths, each one a new row.
 */
function isKnownPath(path: string): boolean {
  if (STATIC_PATHS.has(path)) return true;
  const m = path.match(/^\/([a-z]+)\/([^/]+)(\/.*)?$/);
  if (!m) return false;
  const [, section, rawKey, rest = ""] = m;
  let key: string;
  try {
    key = decodeURIComponent(rawKey);
  } catch {
    return false;
  }
  const exists = (row: unknown) => row !== undefined;
  switch (section) {
    case "moves":
      return /^(\/edit|\/history(\/\d+)?)?$/.test(rest) &&
        exists(db.select({ id: moves.id }).from(moves).where(eq(moves.slug, key)).get());
    case "curricula":
      return /^(\/edit|\/history(\/\d+)?)?$/.test(rest) &&
        exists(db.select({ id: curricula.id }).from(curricula).where(eq(curricula.slug, key)).get());
    case "dances":
      return rest === "" && exists(db.select({ id: dances.id }).from(dances).where(eq(dances.slug, key)).get());
    case "dancers":
      return rest === "" && exists(db.select({ id: dancers.id }).from(dancers).where(eq(dancers.slug, key)).get());
    case "events":
      return rest === "" && exists(db.select({ id: events.id }).from(events).where(eq(events.slug, key)).get());
    case "users":
      return rest === "" && exists(db.select({ id: users.id }).from(users).where(eq(users.username, key)).get());
    default:
      return false;
  }
}

/**
 * Page-view beacon. Client-side only (so crawlers don't count), stores
 * path + day and region + day tallies and nothing else: no visitor id,
 * no IP, no cookies. Region is the Fly edge the visitor connected
 * through, so it is only recorded when deployed behind the Fly proxy.
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
  // strip query strings and normalize; skip admin/api noise and anything that isn't a page
  const clean = path.split(/[?#]/)[0];
  if (!isKnownPath(clean)) {
    return NextResponse.json({ ok: true });
  }
  // one visitor can't inflate the counts (real browsing is far below this)
  if (!checkRateLimit(`hit:${clientIp(request.headers)}`, 300, 10 * 60 * 1000)) {
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

  const region = request.headers.get("fly-region");
  if (region && /^[a-z]{3}$/.test(region)) {
    db.insert(regionViews)
      .values({ region, day, count: 1 })
      .onConflictDoUpdate({
        target: [regionViews.region, regionViews.day],
        set: { count: sql`${regionViews.count} + 1` },
      })
      .run();
  }

  return NextResponse.json({ ok: true });
}
