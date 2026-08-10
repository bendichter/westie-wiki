import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { curricula, curriculumRevisions, dances, moveRevisions, moves, users, videos } from "@/db/schema";
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
    .map((e) => ({ ...e, kind: "move" as const, href: `/moves/${e.slug}/history/${e.revisionNo}` }));

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
    .map((e) => ({ ...e, kind: "curriculum" as const, href: `/curricula/${e.slug}/history/${e.revisionNo}` }));

  // video annotations: move clips marked in a dance, or standalone clips on a move
  const annotations = db
    .select({
      id: videos.id,
      name: moves.name,
      slug: moves.slug,
      danceSlug: dances.slug,
      danceTitle: dances.title,
      createdAt: videos.createdAt,
      editor: users.username,
    })
    .from(videos)
    .innerJoin(moves, eq(moves.id, videos.moveId))
    .innerJoin(users, eq(users.id, videos.addedBy))
    .leftJoin(dances, eq(dances.id, videos.danceId))
    .where(eq(moves.deleted, 0))
    .orderBy(desc(videos.createdAt))
    .all()
    .map((e) => ({
      name: e.name,
      revisionNo: null,
      editSummary: e.danceSlug ? `annotated in ${e.danceTitle || "a dance"}` : "added a video clip",
      createdAt: e.createdAt,
      editor: e.editor,
      kind: "clip" as const,
      href: e.danceSlug ? `/dances/${e.danceSlug}?clip=${e.id}` : `/moves/${e.slug}`,
    }));

  const all = [...moveEdits, ...curriculumEdits, ...annotations].sort(
    (a, b) => b.createdAt - a.createdAt
  );
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
              <CountChip>{edit.kind === "move" ? "move" : edit.kind === "curriculum" ? "path" : "clip"}</CountChip>
              <div className="min-w-0">
                <Link
                  href={edit.href}
                  className="font-display font-semibold text-denim hover:underline"
                >
                  {edit.name}
                  {edit.revisionNo != null ? ` · r${edit.revisionNo}` : ""}
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
