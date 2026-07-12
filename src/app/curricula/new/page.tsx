import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CurriculumCreateForm } from "@/components/CurriculumCreateForm";
import { PageTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "New curriculum" };

export default async function NewCurriculumPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/curricula/new");

  return (
    <div className="max-w-2xl">
      <PageTitle sub="An ordered path through the moves, with notes and key videos at every step. Others can edit and improve it, wiki-style.">
        New curriculum
      </PageTitle>
      <CurriculumCreateForm />
    </div>
  );
}
