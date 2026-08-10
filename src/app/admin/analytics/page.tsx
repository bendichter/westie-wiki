import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { desc, eq, gte, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { pageViews, regionViews } from "@/db/schema";
import { AdminNav } from "@/components/AdminNav";
import { EmptyState, PageTitle } from "@/components/ui";
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Analytics", robots: { index: false } };

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400_000).toISOString().slice(0, 10);
}

// Fly.io edge region codes → nearest city. Coarse by design: we know which
// edge a visitor connected through, never who or exactly where they are.
const REGION_LABELS: Record<string, string> = {
  ams: "Amsterdam, Netherlands",
  arn: "Stockholm, Sweden",
  atl: "Atlanta, US",
  bog: "Bogotá, Colombia",
  bom: "Mumbai, India",
  bos: "Boston, US",
  cdg: "Paris, France",
  den: "Denver, US",
  dfw: "Dallas, US",
  ewr: "New Jersey, US",
  eze: "Buenos Aires, Argentina",
  fra: "Frankfurt, Germany",
  gdl: "Guadalajara, Mexico",
  gig: "Rio de Janeiro, Brazil",
  gru: "São Paulo, Brazil",
  hkg: "Hong Kong",
  iad: "Virginia, US",
  jnb: "Johannesburg, South Africa",
  lax: "Los Angeles, US",
  lhr: "London, UK",
  mad: "Madrid, Spain",
  mia: "Miami, US",
  nrt: "Tokyo, Japan",
  ord: "Chicago, US",
  otp: "Bucharest, Romania",
  phx: "Phoenix, US",
  qro: "Querétaro, Mexico",
  scl: "Santiago, Chile",
  sea: "Seattle, US",
  sin: "Singapore",
  sjc: "San Jose, US",
  syd: "Sydney, Australia",
  waw: "Warsaw, Poland",
  yul: "Montreal, Canada",
  yyz: "Toronto, Canada",
};

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) notFound();

  const since7 = daysAgo(7);
  const since30 = daysAgo(30);

  const daily = db
    .select({ day: pageViews.day, views: sum(pageViews.count).mapWith(Number) })
    .from(pageViews)
    .where(gte(pageViews.day, daysAgo(14)))
    .groupBy(pageViews.day)
    .orderBy(desc(pageViews.day))
    .all();

  const topPaths = (since: string, limit: number) =>
    db
      .select({ path: pageViews.path, views: sum(pageViews.count).mapWith(Number) })
      .from(pageViews)
      .where(gte(pageViews.day, since))
      .groupBy(pageViews.path)
      .orderBy(desc(sql`sum(${pageViews.count})`))
      .limit(limit)
      .all();

  const top7 = topPaths(since7, 20);
  const top30 = topPaths(since30, 20);
  const regions = db
    .select({ region: regionViews.region, views: sum(regionViews.count).mapWith(Number) })
    .from(regionViews)
    .where(gte(regionViews.day, since30))
    .groupBy(regionViews.region)
    .orderBy(desc(sql`sum(${regionViews.count})`))
    .all();
  const maxRegion = Math.max(1, ...regions.map((r) => r.views));
  const total30 =
    db
      .select({ n: sum(pageViews.count).mapWith(Number) })
      .from(pageViews)
      .where(gte(pageViews.day, since30))
      .get()?.n ?? 0;

  const maxDaily = Math.max(1, ...daily.map((d) => d.views));

  return (
    <div className="max-w-3xl">
      <PageTitle sub={`${total30.toLocaleString()} page views in the last 30 days. Counted client-side (bots excluded); no visitor data is stored — just path, coarse region, and day.`}>
        Analytics
      </PageTitle>
      <AdminNav active="/admin/analytics" />

      {daily.length === 0 ? (
        <EmptyState title="No views recorded yet">
          The beacon started counting with this deploy — check back tomorrow.
        </EmptyState>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="mb-3 text-lg font-bold">Daily views (14 days)</h2>
            <div className="rounded-lg border border-line bg-panel p-4">
              {daily.map((d) => (
                <div key={d.day} className="flex items-center gap-3 py-0.5">
                  <span className="w-24 shrink-0 font-mono text-xs text-muted">{d.day}</span>
                  <div className="h-4 rounded-sm bg-denim" style={{ width: `${Math.max(2, (d.views / maxDaily) * 100)}%` }} />
                  <span className="font-mono text-xs text-ink-soft">{d.views}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-8 sm:grid-cols-2">
            {[
              { title: "Top pages — 7 days", rows: top7 },
              { title: "Top pages — 30 days", rows: top30 },
            ].map(({ title, rows }) => (
              <section key={title}>
                <h2 className="mb-3 text-lg font-bold">{title}</h2>
                <ul className="divide-y divide-line rounded-lg border border-line bg-panel">
                  {rows.map((row) => (
                    <li key={row.path} className="flex items-baseline gap-2 px-3 py-2">
                      <span className="truncate font-mono text-sm text-ink-soft">{row.path}</span>
                      <span className="ml-auto font-mono text-xs text-muted">{row.views}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {regions.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-3 text-lg font-bold">Visitor regions — 30 days</h2>
              <div className="rounded-lg border border-line bg-panel p-4">
                {regions.map((r) => (
                  <div key={r.region} className="flex items-center gap-3 py-0.5">
                    <span className="w-48 shrink-0 truncate text-sm text-ink-soft">
                      {REGION_LABELS[r.region] ?? r.region}
                    </span>
                    <div className="h-4 rounded-sm bg-denim" style={{ width: `${Math.max(2, (r.views / maxRegion) * 60)}%` }} />
                    <span className="font-mono text-xs text-muted">{r.views}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted">
                Region is the network edge a visitor connected through, so it reflects the nearest
                Fly.io location rather than an exact position.
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
