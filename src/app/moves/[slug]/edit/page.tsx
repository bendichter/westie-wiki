import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { MoveForm } from "@/components/MoveForm";
import { PageTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getAliases, getLatestRevisionNo, getMoveBySlug, getMoveTags } from "@/lib/data/moves";

export const metadata: Metadata = { title: "Edit move" };

export default async function EditMovePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const move = getMoveBySlug(slug);
  if (!move) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/moves/${slug}/edit`);

  return (
    <div className="max-w-3xl">
      <PageTitle sub="Your change is saved as a new revision — nothing is ever lost.">
        Editing: {move.name}
      </PageTitle>
      <MoveForm
        mode="edit"
        initial={{
          moveId: move.id,
          baseRevision: getLatestRevisionNo(move.id),
          name: move.name,
          description: move.description,
          aliases: getAliases(move.id),
          tags: getMoveTags(move.id).map((t) => t.name),
          difficulty: move.difficulty,
        }}
      />
    </div>
  );
}
