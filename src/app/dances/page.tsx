import type { Metadata } from "next";
import Link from "next/link";
import { DanceCard } from "@/components/DanceCard";
import { ButtonLink, EmptyState, PageTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { listDances } from "@/lib/data/dances";

export const metadata: Metadata = { title: "Dances" };

export default async function DancesPage() {
  const user = await getCurrentUser();
  const dances = listDances();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageTitle sub="Full dance videos, mapped move by move. Open one to watch with its move timeline — or to keep marking.">
          Dances
        </PageTitle>
        {user ? <ButtonLink href="/dances/new">+ Register a dance</ButtonLink> : null}
      </div>

      {dances.length === 0 ? (
        <EmptyState title="No dances registered yet">
          Register a competition or demo video and mark every move in it —{" "}
          {user ? (
            <Link href="/dances/new" className="text-denim underline">
              start with your favorite Jack &amp; Jill
            </Link>
          ) : (
            <Link href="/login?next=/dances/new" className="text-denim underline">
              log in to add the first one
            </Link>
          )}
          .
        </EmptyState>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {dances.map((dance) => (
            <li key={dance.id}>
              <DanceCard dance={dance} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
