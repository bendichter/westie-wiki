import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { curricula, curriculumRevisions, moveRevisions, moves, users } from "@/db/schema";
import { CountChip, EmptyState, PageTitle } from "@/components/ui";
import { clampPage, Pagination } from "@/components/Pagination";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Recent changes" };

const PER_PAGE = 50;

export default async function ChangesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const moveEdits = db
    .select({
      name: moves.name,
      slug: moves.slug,
      revisionNo: moveRevisions.revisionNo,
      editSummary: moveRevisions.editSummary,
      createdAt: moveRevisions.createdAt,
      editor: users.username,
    })
    .from(moveRevisions)
    .innerJoin(moves, eq(moves.id, moveRevisions.moveId))
    .innerJoin(users, eq(users.id, moveRevisions.editorId))
    .where(eq(moves.deleted, 0))
    .orderBy(desc(moveRevisions.createdAt))
    .all()
    .map((e) => ({ ...e, kind: "move" as const }));

  const curriculumEdits = db
    .select({
      name: curricula.title,
      slug: curricula.slug,
      revisionNo: curriculumRevisions.revisionNo,
      editSummary: curriculumRevisions.editSummary,
      createdAt: curriculumRevisions.createdAt,
      editor: users.username,
    })
    .from(curriculumRevisions)
    .innerJoin(curricula, eq(curricula.id, curriculumRevisions.curriculumId))
    .innerJoin(users, eq(users.id, curriculumRevisions.editorId))
    .where(eq(curricula.deleted, 0))
    .orderBy(desc(curriculumRevisions.createdAt))
    .all()
    .map((e) => ({ ...e, kind: "curriculum" as const }));

  const all = [...moveEdits, ...curriculumEdits].sort((a, b) => b.createdAt - a.createdAt);
  const totalPages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const page = clampPage(pageParam, totalPages);
  const edits = all.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="max-w-3xl">
      <PageTitle
        sub={`Every edit to every page, newest first — the wiki's pulse.${totalPages > 1 ? ` Page ${page} of ${totalPages}.` : ""}`}
      >
        Recent changes
      </PageTitle>

      {edits.length === 0 ? (
        <EmptyState title="No edits yet" />
      ) : (
        <ul className="divide-y divide-line border border-line rounded-lg bg-panel">
          {edits.map((edit, i) => (
            <li key={i} className="px-4 py-3 flex items-baseline gap-3">
              <CountChip>{edit.kind === "move" ? "move" : "path"}</CountChip>
              <div className="min-w-0">
                <Link
                  href={
                    edit.kind === "move"
                      ? `/moves/${edit.slug}/history/${edit.revisionNo}`
                      : `/curricula/${edit.slug}/history/${edit.revisionNo}`
                  }
                  className="font-display font-semibold text-denim hover:underline"
                >
                  {edit.name} · r{edit.revisionNo}
                </Link>
                <span className="text-sm text-muted font-display">
                  {" "}
                  — {edit.editSummary || "edited"} ·{" "}
                  <Link href={`/users/${edit.editor}`} className="hover:underline">{edit.editor}</Link> · {formatDateTime(edit.createdAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={page} totalPages={totalPages} basePath="/changes" params={{}} />
    </div>
  );
}
