import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MoveForm } from "@/components/MoveForm";
import { PageTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "New move" };

export default async function NewMovePage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  // ?name= prefills the form, e.g. from the dance annotator's "document it" button
  const { name } = await searchParams;
  const initialName = name?.trim().slice(0, 80) || undefined;

  const user = await getCurrentUser();
  if (!user) {
    const next = initialName ? `/moves/new?name=${encodeURIComponent(initialName)}` : "/moves/new";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return (
    <div className="max-w-3xl">
      <PageTitle sub="Document a pattern as the community dances it. You can attach videos after creating the page.">
        Document a move
      </PageTitle>
      <MoveForm mode="create" initialName={initialName} />
    </div>
  );
}
