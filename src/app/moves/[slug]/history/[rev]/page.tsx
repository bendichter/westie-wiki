import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DiffView } from "@/components/DiffView";
import { Markdown } from "@/components/Markdown";
import { CountChip, DifficultyBadge, PrimaryButton } from "@/components/ui";
import { restoreRevision } from "@/lib/actions/moves";
import { getCurrentUser } from "@/lib/auth";
import { getLatestRevisionNo, getMoveBySlug, getRevision } from "@/lib/data/moves";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Revision" };

export default async function RevisionPage({
  params,
}: {
  params: Promise<{ slug: string; rev: string }>;
}) {
  const { slug, rev } = await params;
  const move = getMoveBySlug(slug);
  if (!move) notFound();

  const revisionNo = Number(rev);
  if (!Number.isInteger(revisionNo) || revisionNo < 1) notFound();

  const revision = getRevision(move.id, revisionNo);
  if (!revision) notFound();

  const previous = revisionNo > 1 ? getRevision(move.id, revisionNo - 1) : null;
  const latest = getLatestRevisionNo(move.id);
  const isCurrent = revisionNo === latest;
  const user = await getCurrentUser();
  const aliases = JSON.parse(revision.aliases) as string[];

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <p className="text-sm font-display text-muted mb-2">
          <Link href={`/moves/${move.slug}`} className="text-denim hover:underline">
            {move.name}
          </Link>{" "}
          ›{" "}
          <Link href={`/moves/${move.slug}/history`} className="text-denim hover:underline">
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
            href={`/moves/${move.slug}/history/${revisionNo - 1}`}
            className="text-sm font-display text-denim hover:underline"
          >
            ← Revision {revisionNo - 1}
          </Link>
        ) : null}
        {revisionNo < latest ? (
          <Link
            href={`/moves/${move.slug}/history/${revisionNo + 1}`}
            className="text-sm font-display text-denim hover:underline"
          >
            Revision {revisionNo + 1} →
          </Link>
        ) : null}
        {!isCurrent && user ? (
          <form action={restoreRevision} className="ml-auto">
            <input type="hidden" name="moveId" value={move.id} />
            <input type="hidden" name="revisionNo" value={revisionNo} />
            <PrimaryButton type="submit">Restore this revision</PrimaryButton>
          </form>
        ) : null}
      </div>

      {previous ? (
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-1">
            Changes from revision {previous.revisionNo}
          </h2>
          {previous.name !== revision.name ? (
            <p className="text-sm font-display mb-2">
              Renamed: <span className="text-danger line-through">{previous.name}</span> →{" "}
              <span className="text-success font-semibold">{revision.name}</span>
            </p>
          ) : null}
          {previous.difficulty !== revision.difficulty ? (
            <p className="text-sm font-display mb-2">
              Difficulty: <span className="text-danger">{previous.difficulty ?? "not set"}</span> →{" "}
              <span className="text-success font-semibold">{revision.difficulty ?? "not set"}</span>
            </p>
          ) : null}
          {previous.aliases !== revision.aliases ? (
            <p className="text-sm font-display mb-2">
              Alternative names: <span className="text-danger">{(JSON.parse(previous.aliases) as string[]).join(", ") || "none"}</span> →{" "}
              <span className="text-success font-semibold">{aliases.join(", ") || "none"}</span>
            </p>
          ) : null}
          {previous.tags !== revision.tags ? (
            <p className="text-sm font-display mb-2">
              Tags: <span className="text-danger">{(JSON.parse(previous.tags || "[]") as string[]).join(", ") || "none"}</span> →{" "}
              <span className="text-success font-semibold">{(JSON.parse(revision.tags || "[]") as string[]).join(", ") || "none"}</span>
            </p>
          ) : null}
          <DiffView before={previous.description} after={revision.description} />
        </section>
      ) : (
        <p className="text-sm text-muted font-display mb-10">
          This is the first revision — the page as originally created.
        </p>
      )}

      <section className="border border-line rounded-lg bg-panel p-6">
        <div className="text-xs uppercase tracking-widest text-muted font-display font-bold mb-4">
          Page as of this revision
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-2xl font-bold">{revision.name}</h2>
          <DifficultyBadge difficulty={revision.difficulty} />
        </div>
        {aliases.length > 0 ? (
          <p className="text-muted font-display mt-1">also known as: {aliases.join(" · ")}</p>
        ) : null}
        <div className="mt-4">
          <Markdown>{revision.description}</Markdown>
        </div>
      </section>
    </div>
  );
}
