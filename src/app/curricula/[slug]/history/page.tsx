import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CountChip, PageTitle } from "@/components/ui";
import { getCurriculumBySlug, getCurriculumRevisionList } from "@/lib/data/curricula";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "History" };

export default async function CurriculumHistoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const curriculum = getCurriculumBySlug(slug);
  if (!curriculum) notFound();

  const revisions = getCurriculumRevisionList(curriculum.id);

  return (
    <div className="max-w-3xl">
      <PageTitle
        sub={
          <>
            Every saved version of{" "}
            <Link href={`/curricula/${curriculum.slug}`} className="text-denim underline">
              {curriculum.title}
            </Link>
            .
          </>
        }
      >
        History: {curriculum.title}
      </PageTitle>

      <ol className="relative border-l-2 border-line ml-2">
        {revisions.map((rev, i) => (
          <li key={rev.id} className="relative pl-6 pb-6">
            <span
              className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full ${
                i === 0 ? "bg-amber" : "bg-line"
              }`}
              aria-hidden
            />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <Link
                href={`/curricula/${curriculum.slug}/history/${rev.revisionNo}`}
                className="font-display font-bold text-denim hover:underline"
              >
                Revision {rev.revisionNo}
              </Link>
              {i === 0 ? <CountChip>current</CountChip> : null}
              <span className="text-sm text-muted font-display">
                {rev.editor} · {formatDateTime(rev.createdAt)}
              </span>
            </div>
            <p className="text-[15px] text-ink-soft font-display mt-0.5">
              {rev.editSummary || <span className="text-muted italic">no edit summary</span>}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
