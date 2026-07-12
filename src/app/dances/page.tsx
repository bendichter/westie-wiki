import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink, CountChip, EmptyState, PageTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { listDances } from "@/lib/data/dances";
import { youtubeThumbnailUrl } from "@/lib/youtube";

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
          {dances.map((dance) => {
            const who = dance.dancers.map((d) => d.name).join(" & ");
            return (
              <li key={dance.id} className="overflow-hidden rounded-lg border border-line bg-panel">
                <Link href={`/dances/${dance.slug}`} className="group block">
                  <div className="relative aspect-video bg-ink">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={youtubeThumbnailUrl(dance.youtubeId)}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover opacity-90 group-hover:opacity-100"
                    />
                    <span className="absolute bottom-2 right-2 rounded bg-ink/85 px-2 py-0.5 font-mono text-xs text-paper">
                      {dance.annotationCount} move{dance.annotationCount === 1 ? "" : "s"} marked
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="font-display font-bold text-denim group-hover:underline">
                      {who || dance.title || "Untitled dance"}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-display text-sm text-muted">
                      {dance.competition ? <CountChip>{dance.competition}</CountChip> : null}
                      {dance.eventName ? (
                        <span>
                          {dance.eventName}
                          {dance.eventYear ? ` ${dance.eventYear}` : ""}
                        </span>
                      ) : null}
                    </div>
                    {dance.song || dance.artist ? (
                      <div className="mt-1 font-display text-sm text-muted">
                        <span aria-hidden>♪</span> {dance.song}
                        {dance.song && dance.artist ? " — " : ""}
                        {dance.artist}
                      </div>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
