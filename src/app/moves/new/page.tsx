import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MoveForm } from "@/components/MoveForm";
import { PageTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "New move" };

export default async function NewMovePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/moves/new");

  return (
    <div className="max-w-3xl">
      <PageTitle sub="Document a pattern as the community dances it. You can attach videos after creating the page.">
        Document a move
      </PageTitle>
      <MoveForm mode="create" />
    </div>
  );
}
