import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DiffView } from "@/components/DiffView";
import { Markdown } from "@/components/Markdown";
import { CountChip, PrimaryButton } from "@/components/ui";
import { restoreCurriculumRevision } from "@/lib/actions/curricula";
import { getCurrentUser } from "@/lib/auth";
import {
  getCurriculumBySlug,
  getCurriculumRevision,
  getLatestCurriculumRevisionNo,
  resolveRevisionItems,
} from "@/lib/data/curricula";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Revision" };

function itemsAsText(items: ReturnType<typeof resolveRevisionItems>): string {
  return items
    .map((item, i) => {
      const name = item.move ? item.move.name : `(deleted move #${item.moveId})`;
      const notes = item.notes ? ` — ${item.notes.replace(/\n/g, " ")}` : "";
      return `${i + 1}. ${name}${notes}`;
    })
    .join("\n");
}

export default async function CurriculumRevisionPage({
  params,
}: {
  params: Promise<{ slug: string; rev: string }>;
}) {
  const { slug, rev } = await params;
  const curriculum = getCurriculumBySlug(slug);
  if (!curriculum) notFound();

  const revisionNo = Number(rev);
  if (!Number.isInteger(revisionNo) || revisionNo < 1) notFound();
  const revision = getCurriculumRevision(curriculum.id, revisionNo);
  if (!revision) notFound();

  const previous = revisionNo > 1 ? getCurriculumRevision(curriculum.id, revisionNo - 1) : null;
  const latest = getLatestCurriculumRevisionNo(curriculum.id);
  const isCurrent = revisionNo === latest;
  const user = await getCurrentUser();
  const items = resolveRevisionItems(revision.items);

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <p className="text-sm font-display text-muted mb-2">
          <Link href={`/curricula/${curriculum.slug}`} className="text-denim hover:underline">
            {curriculum.title}
          </Link>{" "}
          ›{" "}
          <Link href={`/curricula/${curriculum.slug}/history`} className="text-denim hover:underline">
            History
          </Link>{" "}
          › Revision {revisionNo}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold">Revision {revisionNo}</h1>
          {isCurrent ? <CountChip>current</CountChip> : null}
        </div>
        <p className="text-muted font-display mt-1">
          <Link href={`/users/${revision.editor}`} className="hover:underline">{revision.editor}</Link> · {formatDateTime(revision.createdAt)} ·{" "}
          {revision.editSummary || <span className="italic">no edit summary</span>}
        </p>
        <div className="slot-line mt-3" aria-hidden />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        {revisionNo > 1 ? (
          <Link
            href={`/curricula/${curriculum.slug}/history/${revisionNo - 1}`}
            className="text-sm font-display text-denim hover:underline"
          >
            ← Revision {revisionNo - 1}
          </Link>
        ) : null}
        {revisionNo < latest ? (
          <Link
            href={`/curricula/${curriculum.slug}/history/${revisionNo + 1}`}
            className="text-sm font-display text-denim hover:underline"
          >
            Revision {revisionNo + 1} →
          </Link>
        ) : null}
        {!isCurrent && user ? (
          <form action={restoreCurriculumRevision} className="ml-auto">
            <input type="hidden" name="curriculumId" value={curriculum.id} />
            <input type="hidden" name="revisionNo" value={revisionNo} />
            <PrimaryButton type="submit">Restore this revision</PrimaryButton>
          </form>
        ) : null}
      </div>

      {previous ? (
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-1">Changes from revision {previous.revisionNo}</h2>
          {previous.title !== revision.title ? (
            <p className="text-sm font-display mb-2">
              Renamed: <span className="text-danger line-through">{previous.title}</span> →{" "}
              <span className="text-success font-semibold">{revision.title}</span>
            </p>
          ) : null}
          {previous.description !== revision.description ? (
            <div className="mb-4">
              <h3 className="text-sm font-display font-semibold text-muted mb-1">Description</h3>
              <DiffView before={previous.description} after={revision.description} />
            </div>
          ) : null}
          <h3 className="text-sm font-display font-semibold text-muted mb-1">Move list</h3>
          <DiffView
            before={itemsAsText(resolveRevisionItems(previous.items))}
            after={itemsAsText(items)}
          />
        </section>
      ) : (
        <p className="text-sm text-muted font-display mb-10">
          This is the first revision — the curriculum as originally created.
        </p>
      )}

      <section className="border border-line rounded-lg bg-panel p-6">
        <div className="text-xs uppercase tracking-widest text-muted font-display font-bold mb-4">
          Curriculum as of this revision
        </div>
        <h2 className="text-2xl font-bold">{revision.title}</h2>
        {revision.description ? (
          <div className="mt-2">
            <Markdown>{revision.description}</Markdown>
          </div>
        ) : null}
        {items.length > 0 ? (
          <ol className="mt-4 space-y-3 list-none">
            {items.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-mono text-sm text-amber font-semibold shrink-0 w-7">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  {item.move && !item.move.deleted ? (
                    <Link
                      href={`/moves/${item.move.slug}`}
                      className="font-display font-bold text-denim hover:underline"
                    >
                      {item.move.name}
                    </Link>
                  ) : (
                    <span className="font-display font-bold text-muted">
                      {item.move ? item.move.name : "(deleted move)"}
                    </span>
                  )}
                  {item.notes ? <p className="text-sm text-ink-soft mt-0.5">{item.notes}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted font-display mt-3">No moves in this revision.</p>
        )}
      </section>
    </div>
  );
}
