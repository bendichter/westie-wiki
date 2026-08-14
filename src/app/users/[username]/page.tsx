import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { dances, moveRevisions, moves, users, videos } from "@/db/schema";
import { clampPage, Pagination } from "@/components/Pagination";
import { EmptyState, PageTitle } from "@/components/ui";
import { getDanceDancers } from "@/lib/data/dances";
import { formatDate, timeAgo } from "@/lib/format";
import { formatTimestamp } from "@/lib/time";

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

type ContributionRow = {
  key: string;
  href: string;
  title: string;
  detail: string | null;
  createdAt: number;
};

const PER_SECTION = 15;

/**
 * One paginated contribution category. Each section owns a query param so the
 * three paginate independently on the shared profile URL.
 */
function ContributionSection({
  title,
  rows,
  page,
  paramName,
  basePath,
  otherParams,
}: {
  title: string;
  rows: ContributionRow[];
  page: number;
  paramName: string;
  basePath: string;
  otherParams: Record<string, string | undefined>;
}) {
  if (rows.length === 0) return null;
  const totalPages = Math.max(1, Math.ceil(rows.length / PER_SECTION));
  const paged = rows.slice((page - 1) * PER_SECTION, page * PER_SECTION);
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-bold">
        {title}{" "}
        <span className="font-mono text-sm font-normal text-muted">({rows.length})</span>
      </h2>
      <ul className="divide-y divide-line rounded-lg border border-line bg-panel">
        {paged.map((entry) => (
          <li key={entry.key} className="px-4 py-3">
            <Link href={entry.href} className="font-display font-semibold text-denim hover:underline">
              {entry.title}
            </Link>
            <span className="font-display text-sm text-muted">
              {entry.detail ? <> — {entry.detail}</> : null} · {timeAgo(entry.createdAt)}
            </span>
          </li>
        ))}
      </ul>
      <Pagination
        page={page}
        totalPages={totalPages}
        basePath={basePath}
        params={otherParams}
        paramName={paramName}
        preserveScroll
      />
    </section>
  );
}

export default async function PublicProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ dpage?: string; apage?: string; mpage?: string }>;
}) {
  const { username } = await params;
  const { dpage, apage, mpage } = await searchParams;
  const user = db.select().from(users).where(eq(users.username, username)).get();
  if (!user) notFound();

  // dances this user registered, newest first
  const danceLabel = (danceId: number, title: string | null) => {
    const who = getDanceDancers(danceId).map((d) => d.name).join(" & ");
    return who || title || "Untitled dance";
  };
  const registeredDances: ContributionRow[] = db
    .select()
    .from(dances)
    .where(eq(dances.addedBy, user.id))
    .orderBy(desc(dances.createdAt))
    .all()
    .map((d) => ({
      key: `dance-${d.id}`,
      href: `/dances/${d.slug}`,
      title: danceLabel(d.id, d.title),
      detail: [d.competition, "registered"].filter(Boolean).join(" · "),
      createdAt: d.createdAt,
    }));

  // move page work: creations and edits, newest first
  const moveEdits: ContributionRow[] = db
    .select({
      id: moveRevisions.id,
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
    .all()
    .map((e) => ({
      key: `edit-${e.id}`,
      href: `/moves/${e.slug}/history/${e.revisionNo}`,
      title: e.title,
      detail: e.detail || (e.revisionNo === 1 ? "created the page" : "edited"),
      createdAt: e.createdAt,
    }));

  // moves this user marked in mapped dances, newest first; clips from the
  // era before dance mapping have no dance and link to their move instead
  const annotations: ContributionRow[] = db
    .select({
      id: videos.id,
      startSec: videos.startSec,
      moveName: moves.name,
      moveSlug: moves.slug,
      danceId: dances.id,
      danceSlug: dances.slug,
      danceTitle: dances.title,
      createdAt: videos.createdAt,
    })
    .from(videos)
    .innerJoin(moves, eq(moves.id, videos.moveId))
    .leftJoin(dances, eq(dances.id, videos.danceId))
    .where(and(eq(videos.addedBy, user.id), eq(moves.deleted, 0)))
    .orderBy(desc(videos.createdAt))
    .all()
    .map((a) => ({
      key: `annotation-${a.id}`,
      href: a.danceSlug != null ? `/dances/${a.danceSlug}?clip=${a.id}` : `/moves/${a.moveSlug}`,
      title: a.moveName,
      detail:
        a.danceId != null
          ? `marked at ${formatTimestamp(a.startSec)} in ${danceLabel(a.danceId, a.danceTitle)}`
          : "added a video clip",
      createdAt: a.createdAt,
    }));

  const subtitleParts = [
    user.city,
    user.wsdcNumber != null ? `WSDC #${user.wsdcNumber}` : null,
    user.danceRole ? ROLE_LABELS[user.danceRole] : null,
    `member since ${formatDate(user.createdAt)}`,
    `${registeredDances.length} dance${registeredDances.length === 1 ? "" : "s"}`,
    `${moveEdits.length} edit${moveEdits.length === 1 ? "" : "s"}`,
    `${annotations.length} annotation${annotations.length === 1 ? "" : "s"}`,
  ].filter(Boolean);

  const total = registeredDances.length + moveEdits.length + annotations.length;

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

      {total === 0 ? (
        <EmptyState title="No contributions yet" />
      ) : (
        (() => {
          const basePath = `/users/${user.username}`;
          const pages = {
            dpage: clampPage(dpage, Math.ceil(registeredDances.length / PER_SECTION)),
            apage: clampPage(apage, Math.ceil(annotations.length / PER_SECTION)),
            mpage: clampPage(mpage, Math.ceil(moveEdits.length / PER_SECTION)),
          };
          // each section's pagination preserves the other sections' positions
          const others = (self: keyof typeof pages) =>
            Object.fromEntries(
              Object.entries(pages)
                .filter(([k, v]) => k !== self && v > 1)
                .map(([k, v]) => [k, String(v)])
            );
          return (
            <>
              <ContributionSection
                title="Dances"
                rows={registeredDances}
                page={pages.dpage}
                paramName="dpage"
                basePath={basePath}
                otherParams={others("dpage")}
              />
              <ContributionSection
                title="Annotations"
                rows={annotations}
                page={pages.apage}
                paramName="apage"
                basePath={basePath}
                otherParams={others("apage")}
              />
              <ContributionSection
                title="Moves"
                rows={moveEdits}
                page={pages.mpage}
                paramName="mpage"
                basePath={basePath}
                otherParams={others("mpage")}
              />
            </>
          );
        })()
      )}
    </div>
  );
}
