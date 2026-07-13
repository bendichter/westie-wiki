import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { desc, eq, gte, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { pageViews } from "@/db/schema";
import { AdminNav } from "@/components/AdminNav";
import { EmptyState, PageTitle } from "@/components/ui";
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Analytics", robots: { index: false } };

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400_000).toISOString().slice(0, 10);
}

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
  const total30 =
    db
      .select({ n: sum(pageViews.count).mapWith(Number) })
      .from(pageViews)
      .where(gte(pageViews.day, since30))
      .get()?.n ?? 0;

  const maxDaily = Math.max(1, ...daily.map((d) => d.views));

  return (
    <div className="max-w-3xl">
      <PageTitle sub={`${total30.toLocaleString()} page views in the last 30 days. Counted client-side (bots excluded); no visitor data is stored — just path and day.`}>
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
        </>
      )}
    </div>
  );
}
