import Link from "next/link";
import type { DanceListItem } from "@/lib/data/dances";
import { youtubeThumbnailUrl } from "@/lib/youtube";
import { CountChip } from "./ui";

export function DanceCard({ dance }: { dance: DanceListItem }) {
  const who = dance.dancers.map((d) => d.name).join(" & ");
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel">
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
            {dance.placement ? <CountChip>{dance.placement}</CountChip> : null}
            {dance.eventName ? (
              <span>
                {dance.eventName}
                {dance.eventYear ? ` ${dance.eventYear}` : ""}
              </span>
            ) : null}
          </div>
          {dance.songs.length > 0 ? (
            <div className="mt-1 font-display text-sm text-muted">
              <span aria-hidden>♪</span>{" "}
              {dance.songs.map((s, i) => (
                <span key={i}>
                  {s.song}
                  {s.song && s.artist ? " — " : ""}
                  {s.artist}
                  {i < dance.songs.length - 1 ? " · " : ""}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </Link>
    </div>
  );
}
