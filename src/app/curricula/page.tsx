import type { Metadata } from "next";
import Link from "next/link";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { curricula, curriculumItems, learned, users } from "@/db/schema";
import { ButtonLink, EmptyState, PageTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Curricula" };

export default async function CurriculaPage() {
  const user = await getCurrentUser();

  const rows = db
    .select({
      id: curricula.id,
      slug: curricula.slug,
      title: curricula.title,
      description: curricula.description,
      updatedAt: curricula.updatedAt,
      createdByName: users.username,
      moveCount: count(curriculumItems.id),
    })
    .from(curricula)
    .innerJoin(users, eq(users.id, curricula.createdBy))
    .leftJoin(curriculumItems, eq(curriculumItems.curriculumId, curricula.id))
    .where(eq(curricula.deleted, 0))
    .groupBy(curricula.id)
    .orderBy(desc(curricula.updatedAt))
    .all();

  const progress = new Map<number, number>();
  if (user) {
    for (const row of rows) {
      const learnedCount =
        db
          .select({ n: count() })
          .from(learned)
          .where(and(eq(learned.userId, user.id), eq(learned.curriculumId, row.id)))
          .get()?.n ?? 0;
      progress.set(row.id, learnedCount);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageTitle sub="Ordered learning paths through the moves, with notes and key videos for each step. Wiki-editable, like everything here.">
          Curricula
        </PageTitle>
        {user ? <ButtonLink href="/curricula/new">+ New curriculum</ButtonLink> : null}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No curricula yet">
          A curriculum is an ordered list of moves with learner notes — the wiki&apos;s answer to
          &ldquo;what should I learn next?&rdquo;{" "}
          {user ? (
            <Link href="/curricula/new" className="text-denim underline">
              Build the first one
            </Link>
          ) : (
            <Link href="/login" className="text-denim underline">
              Log in to build one
            </Link>
          )}
          .
        </EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {rows.map((c) => {
            const learnedCount = progress.get(c.id) ?? 0;
            const pct = c.moveCount > 0 ? Math.round((learnedCount / c.moveCount) * 100) : 0;
            return (
              <li key={c.id} className="bg-panel border border-line rounded-lg p-5 flex flex-col">
                <Link
                  href={`/curricula/${c.slug}`}
                  className="font-display text-xl font-bold text-denim hover:underline"
                >
                  {c.title}
                </Link>
                <p className="text-[15px] text-ink-soft mt-1.5 line-clamp-3 flex-1">{c.description}</p>
                <div className="mt-4 font-mono text-xs text-muted">
                  {c.moveCount} move{c.moveCount === 1 ? "" : "s"} · started by {c.createdByName} · updated{" "}
                  {timeAgo(c.updatedAt)}
                </div>
                {user && c.moveCount > 0 ? (
                  <div className="mt-3">
                    <div className="flex justify-between font-mono text-xs text-muted mb-1">
                      <span>your progress</span>
                      <span>
                        {learnedCount}/{c.moveCount}
                      </span>
                    </div>
                    <div className="h-1.5 bg-line rounded-full overflow-hidden">
                      <div className="h-full bg-amber rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
