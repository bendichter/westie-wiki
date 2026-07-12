import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { dancers } from "@/db/schema";
import { VideoCard } from "@/components/VideoCard";
import { EmptyState, PageTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getDancerClips, groupClipsByMove } from "@/lib/data/clips";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dancer = db.select().from(dancers).where(eq(dancers.slug, slug)).get();
  return { title: dancer ? `${dancer.name} — clips` : "Dancer not found" };
}

export default async function DancerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dancer = db.select().from(dancers).where(eq(dancers.slug, slug)).get();
  if (!dancer) notFound();

  const user = await getCurrentUser();
  const clips = getDancerClips(dancer.id);
  const groups = groupClipsByMove(clips);

  return (
    <div>
      <PageTitle
        sub={`${clips.length} labeled clip${clips.length === 1 ? "" : "s"} across ${groups.length} move${groups.length === 1 ? "" : "s"}. Labeled by the community — corrections welcome on each move page.`}
      >
        {dancer.name}
      </PageTitle>

      {groups.length === 0 ? (
        <EmptyState title="No clips labeled yet">
          Label {dancer.name} in a video on any move page and it will show up here.
        </EmptyState>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
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
    </div>
  );
}
