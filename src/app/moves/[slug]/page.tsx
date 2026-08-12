import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { favorites, moveRelations, moves } from "@/db/schema";
import { CommentSection } from "@/components/CommentSection";
import { JsonLd } from "@/components/JsonLd";
import { DefaultHandholdPicker } from "@/components/DefaultHandholdPicker";
import { MoveMarkdown } from "@/components/MoveMarkdown";
import { stripMoveLinks } from "@/lib/move-links";
import { RelationEditor } from "@/components/RelationEditor";
import { ResourceSection } from "@/components/ResourceSection";
import { SponsorSlot } from "@/components/SponsorSlot";
import { VariantManager } from "@/components/VariantManager";
import { clampPage, Pagination } from "@/components/Pagination";
import { VideoCard } from "@/components/VideoCard";
import { ButtonLink, DifficultyBadge, EmptyState, TagChip } from "@/components/ui";
import { adminDeleteMove } from "@/lib/actions/admin";
import { removeRelation, toggleFavorite } from "@/lib/actions/community";
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import {
  getAliases,
  getHandholds,
  getLatestRevisionNo,
  getMoveBySlug,
  getMoveComments,
  getMoveResources,
  getMoveTags,
  getMoveVariants,
  getMoveVideos,
  getRelatedMoves,
  type MoveLink,
} from "@/lib/data/moves";
import { groupClipsByDance } from "@/lib/data/clips";
import { formatDate, timeAgo } from "@/lib/format";
import { platformLabel } from "@/lib/platform";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const move = getMoveBySlug(slug);
  if (!move) return { title: "Move not found" };
  const description =
    stripMoveLinks(move.description).replace(/[#*_`>\n]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) ||
    `${move.name} — a West Coast Swing move documented by the community.`;
  return {
    title: `${move.name} — West Coast Swing move`,
    description,
    alternates: { canonical: `/moves/${move.slug}` },
    openGraph: {
      title: move.name,
      description,
      type: "article",
      url: `/moves/${move.slug}`,
    },
  };
}

function RelationGroup({
  title,
  items,
  currentUserCanEdit,
  relationIds,
}: {
  title: string;
  items: MoveLink[];
  currentUserCanEdit: boolean;
  relationIds?: Map<string, number>;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted font-display font-semibold">{title}</dt>
      <dd className="mt-1 space-y-1">
        {items.map((m) => {
          const relationId = relationIds?.get(`${m.id}:${m.kind}`);
          return (
            <div key={`${m.id}-${m.kind}`} className="flex items-center gap-2 text-[15px]">
              <Link href={`/moves/${m.slug}`} className="text-denim font-display hover:underline">
                {m.name}
              </Link>
              {currentUserCanEdit && relationId != null ? (
                <form action={removeRelation}>
                  <input type="hidden" name="relationId" value={relationId} />
                  <button
                    type="submit"
                    aria-label={`Remove relation to ${m.name}`}
                    className="text-muted/60 hover:text-danger text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </form>
              ) : null}
            </div>
          );
        })}
      </dd>
    </div>
  );
}

const VIDEOS_PER_PAGE = 6;

export default async function MovePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const move = getMoveBySlug(slug);
  if (!move) notFound();

  const user = await getCurrentUser();
  const userIsAdmin = isAdmin(user);
  const aliases = getAliases(move.id);
  const tags = getMoveTags(move.id);
  const related = getRelatedMoves(move.id);
  const videos = getMoveVideos(move.id);
  // one card per dance: repeated occurrences of the move in the same dance
  // collapse into extra timing rows, earliest timing first
  const videoGroups = groupClipsByDance(videos);
  const videoTotalPages = Math.max(1, Math.ceil(videoGroups.length / VIDEOS_PER_PAGE));
  const videoPage = clampPage(pageParam, videoTotalPages);
  const pagedVideoGroups = videoGroups.slice(
    (videoPage - 1) * VIDEOS_PER_PAGE,
    videoPage * VIDEOS_PER_PAGE
  );
  const comments = getMoveComments(move.id).map((c) => ({
    ...c,
    timeAgoLabel: timeAgo(c.createdAt),
  }));
  const latestRevision = getLatestRevisionNo(move.id);
  const variants = getMoveVariants(move.id);
  const resources = getMoveResources(move.id).map((r) => ({ ...r, platform: platformLabel(r.url) }));
  const allHandholds = getHandholds();
  const defaultHandhold = allHandholds.find((h) => h.id === move.defaultHandholdId) ?? null;

  const isFavorite = user
    ? !!db
        .select()
        .from(favorites)
        .where(and(eq(favorites.userId, user.id), eq(favorites.moveId, move.id)))
        .get()
    : false;

  // for datalists in forms
  const allMoveNames = db
    .select({ name: moves.name })
    .from(moves)
    .where(eq(moves.deleted, 0))
    .orderBy(asc(moves.name))
    .all()
    .map((r) => r.name)
    .filter((n) => n !== move.name);
  // relation ids for the remove buttons (only outgoing relations are removable here)
  const relationRows = db
    .select()
    .from(moveRelations)
    .where(eq(moveRelations.fromMoveId, move.id))
    .all();
  const relationIds = new Map(relationRows.map((r) => [`${r.toMoveId}:${r.kind}`, r.id]));

  // the pattern card panel renders only when it has content (or edit affordances)
  const hasPatternCard =
    !!user ||
    defaultHandhold != null ||
    variants.length > 0 ||
    [related.prerequisites, related.variationOf, related.variations, related.related, related.unlocks].some(
      (items) => items.length > 0
    );

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: move.name,
          description: stripMoveLinks(move.description).slice(0, 200),
          url: `https://westie.wiki/moves/${move.slug}`,
          mainEntityOfPage: `https://westie.wiki/moves/${move.slug}`,
          datePublished: new Date(move.createdAt).toISOString(),
          dateModified: new Date(move.updatedAt).toISOString(),
          author: { "@type": "Organization", name: "Westie Wiki contributors", url: "https://westie.wiki" },
          publisher: { "@type": "Organization", name: "Westie Wiki", url: "https://westie.wiki" },
        }}
      />
      {/* header */}
      <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-bold">{move.name}</h1>
            <DifficultyBadge difficulty={move.difficulty} />
            <form action={toggleFavorite}>
              <input type="hidden" name="moveId" value={move.id} />
              <button
                type="submit"
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                className={`text-2xl leading-none cursor-pointer transition-colors ${
                  isFavorite ? "text-amber" : "text-line hover:text-amber"
                }`}
              >
                ★
              </button>
            </form>
          </div>
          {aliases.length > 0 ? (
            <p className="text-muted font-display mt-1">
              also known as: <span className="text-ink-soft">{aliases.join(" · ")}</span>
            </p>
          ) : null}
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((t) => (
                <TagChip key={t.id} slug={t.slug} name={t.name} />
              ))}
            </div>
          ) : null}
        </div>
        <div className="ml-auto flex gap-2 shrink-0">
          <ButtonLink href={`/moves/${move.slug}/edit`} variant="secondary">
            Edit
          </ButtonLink>
          <ButtonLink href={`/moves/${move.slug}/history`} variant="secondary">
            History
          </ButtonLink>
        </div>
      </div>

      <div className="slot-line mt-4" aria-hidden />

      <div className="mt-6 space-y-10">
        {/* pattern card */}
        {hasPatternCard ? (
        <section className="rounded-lg border border-line bg-panel p-5 sm:p-6">
          <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            <RelationGroup
              title="Learn first"
              items={related.prerequisites}
              currentUserCanEdit={!!user}
              relationIds={relationIds}
            />
            <RelationGroup
              title="Variation of"
              items={related.variationOf}
              currentUserCanEdit={!!user}
              relationIds={relationIds}
            />
            <RelationGroup
              title="Variations"
              items={related.variations}
              currentUserCanEdit={false}
            />
            <RelationGroup title="Related" items={related.related} currentUserCanEdit={!!user} relationIds={relationIds} />
            <RelationGroup title="Leads into" items={related.unlocks} currentUserCanEdit={false} />
            <DefaultHandholdPicker
              moveId={move.id}
              current={defaultHandhold}
              handholds={allHandholds}
              canEdit={!!user}
            />
            <VariantManager moveId={move.id} variants={variants} canEdit={!!user} />
          </dl>
          {user ? (
            <div className="mt-5 border-t border-line pt-4">
              <RelationEditor moveId={move.id} moveNames={allMoveNames} />
            </div>
          ) : null}
        </section>
        ) : null}

        <section>
            {move.description.trim() ? (
              <MoveMarkdown selfSlug={move.slug} className="!max-w-none">
                {move.description}
              </MoveMarkdown>
            ) : (
              <EmptyState title="No description yet">
                Know this move?{" "}
                <Link href={`/moves/${move.slug}/edit`} className="text-denim underline">
                  Write the first description
                </Link>
                .
              </EmptyState>
            )}
          </section>

          <section>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-xl font-bold">
                Video examples{" "}
                <span className="text-muted font-mono text-sm font-normal">({videos.length})</span>
              </h2>
            </div>
            {videos.length === 0 ? (
              <EmptyState title="No videos yet">
                Seen this move in a dance on YouTube?{" "}
                <Link href="/dances/new" className="text-denim underline">
                  Register the dance
                </Link>{" "}
                and mark the move there.
              </EmptyState>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {pagedVideoGroups.map((group) => (
                    <VideoCard
                      key={group.primary.id}
                      video={group.primary}
                      extraClips={group.extras}
                      currentUserId={user?.id ?? null}
                    />
                  ))}
                </div>
                <Pagination
                  page={videoPage}
                  totalPages={videoTotalPages}
                  basePath={`/moves/${move.slug}`}
                  params={{}}
                  preserveScroll
                />
              </>
            )}
          </section>

          <ResourceSection
            moveId={move.id}
            resources={resources}
            currentUserId={user?.id ?? null}
            currentUserIsAdmin={userIsAdmin}
          />

          <CommentSection moveId={move.id} comments={comments} currentUserId={user?.id ?? null} currentUserIsAdmin={userIsAdmin} />

        <SponsorSlot limit={1} />

        {userIsAdmin ? (
          <form action={adminDeleteMove}>
            <input type="hidden" name="moveId" value={move.id} />
            <button
              type="submit"
              className="cursor-pointer rounded-md border border-danger/40 bg-panel px-3 py-1.5 font-display text-xs font-semibold text-danger hover:bg-danger/10"
            >
              Delete move (admin — restorable)
            </button>
          </form>
        ) : null}

        <div className="pt-5 border-t border-line text-sm text-muted font-display space-y-1">
          <p>
            Created {formatDate(move.createdAt)} · last edited {timeAgo(move.updatedAt)}
          </p>
          <p>
            <Link href={`/moves/${move.slug}/history`} className="text-denim hover:underline">
              {latestRevision} revision{latestRevision === 1 ? "" : "s"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
