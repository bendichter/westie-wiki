import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { moves, reports, users } from "@/db/schema";
import { AdminNav } from "@/components/AdminNav";
import { EmptyState, PageTitle } from "@/components/ui";
import { adminRestoreMove, blockUser, unblockUser } from "@/lib/actions/admin";
import { resolveReport } from "@/lib/actions/reports";
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Moderation", robots: { index: false } };

export default async function ModerationPage() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) notFound();

  const openReports = db
    .select({
      id: reports.id,
      targetLabel: reports.targetLabel,
      reason: reports.reason,
      createdAt: reports.createdAt,
      videoId: reports.videoId,
      danceId: reports.danceId,
      reporter: users.username,
    })
    .from(reports)
    .innerJoin(users, eq(users.id, reports.reporterId))
    .where(isNull(reports.resolvedAt))
    .orderBy(desc(reports.createdAt))
    .all();

  const deletedMoves = db
    .select()
    .from(moves)
    .where(eq(moves.deleted, 1))
    .orderBy(desc(moves.updatedAt))
    .all();

  const memberRows = db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      createdAt: users.createdAt,
      emailVerifiedAt: users.emailVerifiedAt,
      blockedAt: users.blockedAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(100)
    .all();

  return (
    <div className="max-w-3xl">
      <PageTitle sub="Janitor tools: restore soft-deleted moves and manage accounts. Deleting a move never destroys its revision history.">
        Moderation
      </PageTitle>
      <AdminNav active="/admin/moderation" />

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold">
          Open reports{" "}
          <span className="font-mono text-sm font-normal text-muted">({openReports.length})</span>
        </h2>
        {openReports.length === 0 ? (
          <EmptyState title="No open reports">
            Members can report clips and dances that violate the video guidelines.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line rounded-lg border border-line bg-panel">
            {openReports.map((report) => (
              <li key={report.id} className="px-4 py-3">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-display font-semibold text-ink-soft">{report.targetLabel}</span>
                  <span className="font-mono text-xs text-muted">
                    by {report.reporter} · {formatDateTime(report.createdAt)}
                  </span>
                </div>
                <p className="mt-1 font-display text-sm text-ink-soft">&ldquo;{report.reason}&rdquo;</p>
                <div className="mt-2 flex gap-2">
                  <form action={resolveReport}>
                    <input type="hidden" name="reportId" value={report.id} />
                    <input type="hidden" name="resolution" value="removed" />
                    <button
                      type="submit"
                      className="cursor-pointer rounded-md border border-danger/40 bg-panel px-3 py-1 font-display text-xs font-semibold text-danger hover:bg-danger/10"
                    >
                      Remove {report.danceId != null ? "dance" : "clip"}
                    </button>
                  </form>
                  <form action={resolveReport}>
                    <input type="hidden" name="reportId" value={report.id} />
                    <input type="hidden" name="resolution" value="dismissed" />
                    <button
                      type="submit"
                      className="cursor-pointer rounded-md border border-line bg-panel px-3 py-1 font-display text-xs font-semibold hover:border-denim hover:text-denim"
                    >
                      Dismiss
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold">Deleted moves</h2>
        {deletedMoves.length === 0 ? (
          <EmptyState title="Nothing deleted">
            Admins can delete a move from its page; it will land here, restorable.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line rounded-lg border border-line bg-panel">
            {deletedMoves.map((move) => (
              <li key={move.id} className="flex items-center gap-3 px-4 py-3">
                <span className="font-display font-semibold text-ink-soft">{move.name}</span>
                <span className="font-mono text-xs text-muted">deleted {formatDate(move.updatedAt)}</span>
                <form action={adminRestoreMove} className="ml-auto">
                  <input type="hidden" name="moveId" value={move.id} />
                  <button
                    type="submit"
                    className="cursor-pointer rounded-md border border-line bg-panel px-3 py-1 font-display text-xs font-semibold hover:border-denim hover:text-denim"
                  >
                    Restore
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Members</h2>
        <ul className="divide-y divide-line rounded-lg border border-line bg-panel">
          {memberRows.map((member) => (
            <li key={member.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
              <Link
                href={`/users/${member.username}`}
                className="font-display font-semibold text-denim hover:underline"
              >
                {member.username}
              </Link>
              <span className="font-mono text-xs text-muted">{member.email}</span>
              <span className="font-mono text-xs text-muted">joined {formatDate(member.createdAt)}</span>
              {member.emailVerifiedAt == null ? (
                <span className="rounded-full border border-amber/40 bg-amber/10 px-2 py-0.5 font-display text-xs text-amber">
                  unverified
                </span>
              ) : null}
              {member.blockedAt != null ? (
                <span className="rounded-full border border-danger/40 bg-danger/10 px-2 py-0.5 font-display text-xs text-danger">
                  blocked
                </span>
              ) : null}
              <div className="ml-auto">
                {member.id === user!.id ? (
                  <span className="font-display text-xs text-muted">you</span>
                ) : member.blockedAt != null ? (
                  <form action={unblockUser}>
                    <input type="hidden" name="userId" value={member.id} />
                    <button
                      type="submit"
                      className="cursor-pointer rounded-md border border-line bg-panel px-3 py-1 font-display text-xs font-semibold hover:border-denim hover:text-denim"
                    >
                      Unblock
                    </button>
                  </form>
                ) : (
                  <form action={blockUser}>
                    <input type="hidden" name="userId" value={member.id} />
                    <button
                      type="submit"
                      className="cursor-pointer rounded-md border border-line bg-panel px-3 py-1 font-display text-xs font-semibold text-danger hover:border-danger"
                    >
                      Block
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
