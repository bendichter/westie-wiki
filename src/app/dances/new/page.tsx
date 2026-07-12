import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { dancers } from "@/db/schema";
import { DanceCreateForm } from "@/components/DanceCreateForm";
import { PageTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Register a dance" };

export default async function NewDancePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dances/new");

  const dancerNames = db
    .select({ name: dancers.name })
    .from(dancers)
    .orderBy(asc(dancers.name))
    .all()
    .map((r) => r.name);

  return (
    <div className="max-w-2xl">
      <PageTitle sub="Register a full dance video once, then mark every move in it as you watch. Each marked move becomes a labeled clip on that move's page.">
        Register a dance
      </PageTitle>
      <DanceCreateForm dancerNames={dancerNames} />
    </div>
  );
}
