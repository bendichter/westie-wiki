import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { dancers } from "@/db/schema";
import { DanceCard } from "@/components/DanceCard";
import { clampPage, Pagination } from "@/components/Pagination";
import { TabNav } from "@/components/TabNav";
import { VideoCard } from "@/components/VideoCard";
import { EmptyState, PageTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getDancerClips, groupClipsByMove } from "@/lib/data/clips";
import { listDances } from "@/lib/data/dances";

const DANCES_PER_PAGE = 12;
const MOVE_GROUPS_PER_PAGE = 8;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dancer = db.select().from(dancers).where(eq(dancers.slug, slug)).get();
  if (!dancer) return { title: "Dancer not found" };
  return {
    title: `${dancer.name} — West Coast Swing dances & clips`,
    description: `${dancer.name}'s dances and labeled move clips on Westie Wiki, the community West Coast Swing move wiki.`,
    alternates: { canonical: `/dancers/${dancer.slug}` },
  };
}

export default async function DancerPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const { slug } = await params;
  const { tab: tabParam, page: pageParam } = await searchParams;
  const dancer = db.select().from(dancers).where(eq(dancers.slug, slug)).get();
  if (!dancer) notFound();

  const user = await getCurrentUser();
  const clips = getDancerClips(dancer.id);
  const groups = groupClipsByMove(clips);
  const dancerDances = listDances({ dancerId: dancer.id });

  const tab =
    tabParam === "moves" || tabParam === "dances"
      ? tabParam
      : dancerDances.length > 0
        ? "dances"
        : "moves";
  const basePath = `/dancers/${dancer.slug}`;

  const danceTotalPages = Math.max(1, Math.ceil(dancerDances.length / DANCES_PER_PAGE));
  const moveTotalPages = Math.max(1, Math.ceil(groups.length / MOVE_GROUPS_PER_PAGE));
  const page = clampPage(pageParam, tab === "dances" ? danceTotalPages : moveTotalPages);

  const pagedDances = dancerDances.slice((page - 1) * DANCES_PER_PAGE, page * DANCES_PER_PAGE);
  const pagedGroups = groups.slice((page - 1) * MOVE_GROUPS_PER_PAGE, page * MOVE_GROUPS_PER_PAGE);

  return (
    <div>
      <PageTitle
        sub={`${dancerDances.length} dance${dancerDances.length === 1 ? "" : "s"} · ${clips.length} labeled clip${clips.length === 1 ? "" : "s"} across ${groups.length} move${groups.length === 1 ? "" : "s"}. Labeled by the community — corrections welcome.`}
      >
        {dancer.name}
      </PageTitle>

      <TabNav
        activeId={tab}
        items={[
          { id: "dances", label: "Dances", count: dancerDances.length, href: `${basePath}?tab=dances` },
          { id: "moves", label: "Moves", count: groups.length, href: `${basePath}?tab=moves` },
        ]}
      />

      {tab === "dances" ? (
        <>
          {pagedDances.length === 0 ? (
            <EmptyState title="No dances yet">
              Register a full video of {dancer.name} dancing and it will show up here.
            </EmptyState>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pagedDances.map((dance) => (
                <li key={dance.id}>
                  <DanceCard dance={dance} />
                </li>
              ))}
            </ul>
          )}
          <Pagination page={page} totalPages={danceTotalPages} basePath={basePath} params={{ tab: "dances" }} />
        </>
      ) : (
        <>
          {pagedGroups.length === 0 ? (
            <EmptyState title="No clips labeled yet">
              Mark moves in one of {dancer.name}&apos;s dances, or label them in a video on any
              move page, and clips will show up here.
            </EmptyState>
          ) : (
            <div className="space-y-10">
              {pagedGroups.map((group) => (
                <section key={group.moveId}>
                  <div className="flex items-baseline gap-3 mb-4">
                    <h2 className="text-xl font-bold">
                      <Link href={`/moves/${group.moveSlug}`} className="text-denim hover:underline">
                        {group.moveName}
                      </Link>
                    </h2>
                    <span className="font-mono text-xs text-muted">
                      {group.clips.length} clip{group.clips.length === 1 ? "" : "s"}
                    </span>
                    <div className="slot-line flex-1 self-center hidden sm:block" aria-hidden />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {group.clips.map((clip) => (
                      <VideoCard key={clip.id} video={clip} currentUserId={user?.id ?? null} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
          <Pagination page={page} totalPages={moveTotalPages} basePath={basePath} params={{ tab: "moves" }} />
        </>
      )}
    </div>
  );
}
