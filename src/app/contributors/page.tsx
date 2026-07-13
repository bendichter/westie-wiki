import type { Metadata } from "next";
import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { curriculumRevisions, dances, moveRevisions, users, videos } from "@/db/schema";
import { EmptyState, PageTitle } from "@/components/ui";

export const metadata: Metadata = {
  title: "Contributors",
  description: "The dancers building Westie Wiki — move edits, clips, mapped dances, and learning paths.",
  alternates: { canonical: "/contributors" },
};

type Row = { userId: number; n: number };

function tally(rows: Row[], totals: Map<number, { edits: number; clips: number; dances: number; paths: number }>, key: "edits" | "clips" | "dances" | "paths") {
  for (const row of rows) {
    const entry = totals.get(row.userId) ?? { edits: 0, clips: 0, dances: 0, paths: 0 };
    entry[key] += row.n;
    totals.set(row.userId, entry);
  }
}

export default function ContributorsPage() {
  const totals = new Map<number, { edits: number; clips: number; dances: number; paths: number }>();

  tally(
    db.select({ userId: moveRevisions.editorId, n: count() }).from(moveRevisions).groupBy(moveRevisions.editorId).all(),
    totals,
    "edits"
  );
  tally(
    db.select({ userId: videos.addedBy, n: count() }).from(videos).groupBy(videos.addedBy).all(),
    totals,
    "clips"
  );
  tally(
    db.select({ userId: dances.addedBy, n: count() }).from(dances).groupBy(dances.addedBy).all(),
    totals,
    "dances"
  );
  tally(
    db
      .select({ userId: curriculumRevisions.editorId, n: count() })
      .from(curriculumRevisions)
      .groupBy(curriculumRevisions.editorId)
      .all(),
    totals,
    "paths"
  );

  const userRows = db
    .select({ id: users.id, username: users.username, displayName: users.displayName, city: users.city })
    .from(users)
    .all();
  const userById = new Map(userRows.map((u) => [u.id, u]));

  const leaderboard = [...totals.entries()]
    .map(([userId, t]) => ({
      user: userById.get(userId),
      ...t,
      total: t.edits + t.clips + t.dances + t.paths,
    }))
    .filter((row) => row.user)
    .sort((a, b) => b.total - a.total)
    .slice(0, 50);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="max-w-3xl">
      <PageTitle sub="Every edit, clip, mapped dance, and learning path, credited. The wiki is these people.">
        Contributors
      </PageTitle>

      {leaderboard.length === 0 ? (
        <EmptyState title="No contributions yet" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-panel">
          <table className="w-full text-[15px]">
            <thead>
              <tr className="border-b border-line font-display text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-2.5 text-left font-semibold">#</th>
                <th className="px-4 py-2.5 text-left font-semibold">Contributor</th>
                <th className="px-3 py-2.5 text-right font-semibold" title="Move page edits">Edits</th>
                <th className="px-3 py-2.5 text-right font-semibold" title="Video clips added">Clips</th>
                <th className="px-3 py-2.5 text-right font-semibold" title="Dances registered">Dances</th>
                <th className="px-3 py-2.5 text-right font-semibold" title="Curriculum edits">Paths</th>
                <th className="px-4 py-2.5 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {leaderboard.map((row, i) => (
                <tr key={row.user!.id}>
                  <td className="px-4 py-2.5 font-mono text-sm text-muted">
                    {medals[i] ?? i + 1}
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/users/${row.user!.username}`}
                      className="font-display font-semibold text-denim hover:underline"
                    >
                      {row.user!.username}
                    </Link>
                    {row.user!.city ? (
                      <span className="ml-2 font-display text-xs text-muted">{row.user!.city}</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-sm">{row.edits || "–"}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-sm">{row.clips || "–"}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-sm">{row.dances || "–"}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-sm">{row.paths || "–"}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 font-display text-sm text-muted">
        Counts include every revision and clip, including seeded starter content. Want on this
        board? <Link href="/dances" className="text-denim underline">Mark some moves in a dance</Link>.
      </p>
    </div>
  );
}
