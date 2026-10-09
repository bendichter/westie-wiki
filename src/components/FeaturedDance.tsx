import Link from "next/link";
import { formatTimestamp } from "@/lib/time";
import { youtubeThumbnailUrl } from "@/lib/youtube";

// how many marked moves the card lists before linking to the full dance
const SHOWN_MOVES = 6;

/**
 * A mapped dance on the home page, so a first-time visitor sees what the wiki
 * does before reading about it. Nothing plays here: the thumbnail opens the
 * dance page, and each listed move opens it cued to that move.
 */
export function FeaturedDance({
  slug,
  youtubeId,
  who,
  eventLabel,
  moves,
}: {
  slug: string;
  youtubeId: string;
  who: string;
  eventLabel: string | null;
  /** Every marked move, sorted by start. */
  moves: { id: number; startSec: number; name: string }[];
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel">
      <Link
        href={`/dances/${slug}`}
        aria-label={`Watch ${who}, mapped move by move`}
        className="group relative block aspect-video bg-ink"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={youtubeThumbnailUrl(youtubeId)}
          alt=""
          className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/80 transition-colors group-hover:bg-amber">
            <svg viewBox="0 0 24 24" fill="white" className="ml-1 h-6 w-6" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </Link>
      <div className="p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <Link href={`/dances/${slug}`} className="font-display font-bold text-denim hover:underline">
            {who}
          </Link>
          {eventLabel ? <span className="font-display text-sm text-muted">{eventLabel}</span> : null}
        </div>
        <ol className="mt-2 grid gap-x-3 sm:grid-cols-2">
          {moves.slice(0, SHOWN_MOVES).map((m, i) => (
            // phones list four, to keep the card near one screen tall
            <li key={m.id} className={i < 4 ? "" : "hidden sm:block"}>
              <Link
                href={`/dances/${slug}?clip=${m.id}`}
                className="-mx-2 flex items-baseline gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-denim/8"
              >
                <span className="font-mono text-xs text-muted">{formatTimestamp(Math.floor(m.startSec))}</span>
                <span className="min-w-0 truncate font-display text-sm font-semibold text-denim">{m.name}</span>
              </Link>
            </li>
          ))}
        </ol>
        <Link href={`/dances/${slug}`} className="mt-2 inline-block font-display text-sm text-denim underline">
          {moves.length > SHOWN_MOVES
            ? `See all ${moves.length} moves in this dance`
            : "Open this dance"}
        </Link>
      </div>
    </div>
  );
}
