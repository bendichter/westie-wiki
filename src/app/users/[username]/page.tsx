import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { moveRevisions, moves, users, videos } from "@/db/schema";
import { CountChip, EmptyState, PageTitle } from "@/components/ui";
import { formatDate, timeAgo } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `${username} — profile` };
}

const ROLE_LABELS: Record<string, string> = {
  leader: "dances as a leader",
  follower: "dances as a follower",
  switch: "dances both roles",
};

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = db.select().from(users).where(eq(users.username, username)).get();
  if (!user) notFound();

  const editCount =
    db.select({ n: count() }).from(moveRevisions).where(eq(moveRevisions.editorId, user.id)).get()
      ?.n ?? 0;
  const clipCount =
    db.select({ n: count() }).from(videos).where(eq(videos.addedBy, user.id)).get()?.n ?? 0;

  const edits = db
    .select({
      title: moves.name,
      slug: moves.slug,
      revisionNo: moveRevisions.revisionNo,
      detail: moveRevisions.editSummary,
      createdAt: moveRevisions.createdAt,
    })
    .from(moveRevisions)
    .innerJoin(moves, eq(moves.id, moveRevisions.moveId))
    .where(and(eq(moveRevisions.editorId, user.id), eq(moves.deleted, 0)))
    .orderBy(desc(moveRevisions.createdAt))
    .limit(15)
    .all()
    .map((e) => ({
      kind: "edit" as const,
      href: `/moves/${e.slug}/history/${e.revisionNo}`,
      title: e.title,
      detail: e.detail || "edited",
      createdAt: e.createdAt,
    }));

  const clips = db
    .select({
      title: moves.name,
      slug: moves.slug,
      createdAt: videos.createdAt,
    })
    .from(videos)
    .innerJoin(moves, eq(moves.id, videos.moveId))
    .where(and(eq(videos.addedBy, user.id), eq(moves.deleted, 0)))
    .orderBy(desc(videos.createdAt))
    .limit(15)
    .all()
    .map((e) => ({
      kind: "clip" as const,
      href: `/moves/${e.slug}`,
      title: e.title,
      detail: "added a video clip",
      createdAt: e.createdAt,
    }));

  const contributions = [...edits, ...clips]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 20);

  const subtitleParts = [
    user.city,
    user.danceRole ? ROLE_LABELS[user.danceRole] : null,
    `member since ${formatDate(user.createdAt)}`,
    `${editCount} edit${editCount === 1 ? "" : "s"}`,
    `${clipCount} clip${clipCount === 1 ? "" : "s"}`,
  ].filter(Boolean);

  return (
    <div className="max-w-3xl">
      <PageTitle sub={subtitleParts.join(" · ")}>
        {user.displayName ? (
          <>
            {user.displayName} <span className="text-muted text-2xl">({user.username})</span>
          </>
        ) : (
          user.username
        )}
      </PageTitle>

      {user.bio ? (
        <p className="mb-8 max-w-xl whitespace-pre-wrap text-[16px] text-ink-soft">{user.bio}</p>
      ) : null}

      <h2 className="mb-4 text-xl font-bold">Contributions</h2>
      {contributions.length === 0 ? (
        <EmptyState title="No contributions yet" />
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line bg-panel">
          {contributions.map((entry, i) => (
            <li key={i} className="flex items-baseline gap-3 px-4 py-3">
              <CountChip>{entry.kind}</CountChip>
              <div className="min-w-0">
                <Link href={entry.href} className="font-display font-semibold text-denim hover:underline">
                  {entry.title}
                </Link>
                <span className="font-display text-sm text-muted">
                  {" "}
                  — {entry.detail} · {timeAgo(entry.createdAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
