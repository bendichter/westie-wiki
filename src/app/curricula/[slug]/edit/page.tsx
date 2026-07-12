import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { curriculumItems, moves } from "@/db/schema";
import { CurriculumEditor, type EditorVideoOption } from "@/components/CurriculumEditor";
import { PageTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getCurriculumBySlug, getLatestCurriculumRevisionNo } from "@/lib/data/curricula";
import { getMoveVideos } from "@/lib/data/moves";
import { formatTimestamp } from "@/lib/time";

export const metadata: Metadata = { title: "Edit curriculum" };

export default async function EditCurriculumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const curriculum = getCurriculumBySlug(slug);
  if (!curriculum) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/curricula/${slug}/edit`);

  const items = db
    .select({
      moveId: curriculumItems.moveId,
      notes: curriculumItems.notes,
      keyVideoIds: curriculumItems.keyVideoIds,
    })
    .from(curriculumItems)
    .where(eq(curriculumItems.curriculumId, curriculum.id))
    .orderBy(asc(curriculumItems.position))
    .all()
    .map((item) => ({
      moveId: item.moveId,
      notes: item.notes,
      keyVideoIds: (JSON.parse(item.keyVideoIds) as number[]) ?? [],
    }));

  const movesCatalog = db
    .select({ id: moves.id, name: moves.name, difficulty: moves.difficulty })
    .from(moves)
    .where(eq(moves.deleted, 0))
    .orderBy(asc(moves.name))
    .all();

  const videosByMove: Record<number, EditorVideoOption[]> = {};
  for (const move of movesCatalog) {
    const moveVideos = getMoveVideos(move.id);
    if (moveVideos.length === 0) continue;
    videosByMove[move.id] = moveVideos.map((v) => {
      const who = v.dancers.map((d) => d.name).join(" & ") || v.title || v.youtubeId;
      const where = v.event ? ` at ${v.event.name}${v.event.year ? ` ${v.event.year}` : ""}` : "";
      const when =
        v.endSec != null
          ? ` (${formatTimestamp(v.startSec)}→${formatTimestamp(v.endSec)})`
          : v.startSec > 0
            ? ` (from ${formatTimestamp(v.startSec)})`
            : "";
      return { id: v.id, label: `${who}${where}${when}` };
    });
  }

  return (
    <div className="max-w-3xl">
      <PageTitle sub="Reorder with the arrows. Your change is saved as a new revision — nothing is ever lost.">
        Editing: {curriculum.title}
      </PageTitle>
      <CurriculumEditor
        curriculum={{
          id: curriculum.id,
          slug: curriculum.slug,
          title: curriculum.title,
          description: curriculum.description,
        }}
        baseRevision={getLatestCurriculumRevisionNo(curriculum.id)}
        initialItems={items}
        movesCatalog={movesCatalog}
        videosByMove={videosByMove}
      />
    </div>
  );
}
