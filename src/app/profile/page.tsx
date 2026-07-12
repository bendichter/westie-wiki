import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  curricula,
  curriculumItems,
  favorites,
  learned,
  moveRevisions,
  moves,
  videos,
} from "@/db/schema";
import { ProfileForm } from "@/components/ProfileForm";
import { DifficultyBadge, EmptyState, PageTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Your profile" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");

  const favoriteMoves = db
    .select({ move: moves, favoritedAt: favorites.createdAt })
    .from(favorites)
    .innerJoin(moves, eq(moves.id, favorites.moveId))
    .where(and(eq(favorites.userId, user.id), eq(moves.deleted, 0)))
    .orderBy(desc(favorites.createdAt))
    .all();

  // curricula the user has progress in
  const progressRows = db
    .select({
      curriculum: curricula,
      learnedCount: count(learned.moveId),
    })
    .from(learned)
    .innerJoin(curricula, eq(curricula.id, learned.curriculumId))
    .where(and(eq(learned.userId, user.id), eq(curricula.deleted, 0)))
    .groupBy(curricula.id)
    .all();
  const progress = progressRows.map((row) => {
    const total =
      db
        .select({ n: count() })
        .from(curriculumItems)
        .where(eq(curriculumItems.curriculumId, row.curriculum.id))
        .get()?.n ?? 0;
    return { ...row, total };
  });

  const editCount =
    db.select({ n: count() }).from(moveRevisions).where(eq(moveRevisions.editorId, user.id)).get()
      ?.n ?? 0;
  const videoCount =
    db.select({ n: count() }).from(videos).where(eq(videos.addedBy, user.id)).get()?.n ?? 0;

  const recentEdits = db
    .select({
      moveName: moves.name,
      moveSlug: moves.slug,
      revisionNo: moveRevisions.revisionNo,
      editSummary: moveRevisions.editSummary,
      createdAt: moveRevisions.createdAt,
    })
    .from(moveRevisions)
    .innerJoin(moves, eq(moves.id, moveRevisions.moveId))
    .where(and(eq(moveRevisions.editorId, user.id), eq(moves.deleted, 0)))
    .orderBy(desc(moveRevisions.createdAt))
    .limit(10)
    .all();

  return (
    <div>
      <PageTitle sub={`Member since ${formatDate(user.createdAt)} · ${editCount} edit${editCount === 1 ? "" : "s"} · ${videoCount} video${videoCount === 1 ? "" : "s"} added`}>
        {user.username}
      </PageTitle>

      <section className="mb-10">
        <div className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="text-xl font-bold">Your public profile</h2>
          <Link href={`/users/${user.username}`} className="font-display text-sm text-denim hover:underline">
            View as others see it →
          </Link>
        </div>
        <ProfileForm
          initial={{
            displayName: user.displayName,
            city: user.city,
            bio: user.bio,
            danceRole: user.danceRole,
          }}
        />
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="text-xl font-bold mb-4">Favorite moves</h2>
          {favoriteMoves.length === 0 ? (
            <EmptyState title="No favorites yet">
              Tap the ★ on any move page to build your practice list.
            </EmptyState>
          ) : (
            <ul className="divide-y divide-line border border-line rounded-lg bg-panel">
              {favoriteMoves.map(({ move }) => (
                <li key={move.id} className="px-4 py-3 flex items-baseline gap-3">
                  <span className="text-amber">★</span>
                  <Link
                    href={`/moves/${move.slug}`}
                    className="font-display font-semibold text-denim hover:underline"
                  >
                    {move.name}
                  </Link>
                  <DifficultyBadge difficulty={move.difficulty} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Learning progress</h2>
          {progress.length === 0 ? (
            <EmptyState title="No progress tracked yet">
              Open a <Link href="/curricula" className="text-denim underline">curriculum</Link> and mark
              moves as learned.
            </EmptyState>
          ) : (
            <ul className="space-y-3">
              {progress.map(({ curriculum, learnedCount, total }) => {
                const pct = total > 0 ? Math.round((learnedCount / total) * 100) : 0;
                return (
                  <li key={curriculum.id} className="bg-panel border border-line rounded-lg px-4 py-3">
                    <div className="flex justify-between items-baseline gap-3">
                      <Link
                        href={`/curricula/${curriculum.slug}`}
                        className="font-display font-bold text-denim hover:underline"
                      >
                        {curriculum.title}
                      </Link>
                      <span className="font-mono text-xs text-muted">
                        {learnedCount}/{total}
                      </span>
                    </div>
                    <div className="h-1.5 bg-line rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-amber rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">Your recent edits</h2>
        {recentEdits.length === 0 ? (
          <EmptyState title="No edits yet">
            Improve any <Link href="/moves" className="text-denim underline">move page</Link> — every edit
            is credited to you in the page history.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line border border-line rounded-lg bg-panel">
            {recentEdits.map((edit, i) => (
              <li key={i} className="px-4 py-3 text-[15px]">
                <Link
                  href={`/moves/${edit.moveSlug}/history/${edit.revisionNo}`}
                  className="font-display font-semibold text-denim hover:underline"
                >
                  {edit.moveName} · r{edit.revisionNo}
                </Link>
                <span className="text-sm text-muted font-display">
                  {" "}
                  — {edit.editSummary || "edited"} · {timeAgo(edit.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
