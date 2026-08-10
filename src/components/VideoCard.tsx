import Link from "next/link";
import { deleteVideo } from "@/lib/actions/videos";
import type { VideoWithLabels } from "@/lib/data/moves";
import { formatTimestamp } from "@/lib/time";
import { youtubeWatchUrl } from "@/lib/youtube";
import { CountChip } from "./ui";
import { LiteYouTube } from "./LiteYouTube";

function clipTiming(clip: { startSec: number; endSec: number | null }): {
  label: string;
  duration: string | null;
} {
  const label =
    clip.endSec != null
      ? `${formatTimestamp(clip.startSec)} — ${formatTimestamp(clip.endSec)}`
      : clip.startSec > 0
        ? `from ${formatTimestamp(clip.startSec)}`
        : "full video";
  const duration = clip.endSec != null ? `${clip.endSec - clip.startSec}s` : null;
  return { label, duration };
}

export function VideoCard({
  video,
  extraClips = [],
  currentUserId,
  showMove,
}: {
  video: VideoWithLabels & { moveName?: string; moveSlug?: string };
  /** further timings of the same move in the same dance video */
  extraClips?: VideoWithLabels[];
  currentUserId: number | null;
  showMove?: boolean;
}) {
  const { label: clipLabel, duration } = clipTiming(video);

  return (
    <div className="bg-panel border border-line rounded-lg overflow-hidden">
      <LiteYouTube
        youtubeId={video.youtubeId}
        startSec={video.startSec}
        endSec={video.endSec}
        title={video.title ?? "Video example"}
        portrait={video.portrait}
        href={video.danceSlug ? `/dances/${video.danceSlug}?clip=${video.id}` : undefined}
      />
      <div className="p-3.5">
        {/* clip bars: labeled segments in the wiki's slot motif, two per line, at most 4 */}
        {(() => {
          const timings = [video, ...extraClips].slice(0, 4);
          const lines: (typeof timings)[] = [];
          for (let i = 0; i < timings.length; i += 2) lines.push(timings.slice(i, i + 2));
          return lines.map((line, i) => (
            <div key={line[0].id} className={`flex items-center gap-3${i > 0 ? " mt-1.5" : ""}`}>
              <span className="w-2 h-2 rounded-full bg-amber shrink-0" aria-hidden />
              {line.map((clip) => {
                const timing = clipTiming(clip);
                const text = (
                  <>
                    {timing.label}
                    {timing.duration ? <span className="text-muted"> · {timing.duration}</span> : null}
                  </>
                );
                return (
                  <span key={clip.id} className="contents">
                    <div className="h-px bg-line flex-1" aria-hidden />
                    {clip.danceSlug ? (
                      <Link
                        href={`/dances/${clip.danceSlug}?clip=${clip.id}`}
                        className="font-mono text-xs text-ink-soft whitespace-nowrap hover:text-denim hover:underline"
                      >
                        {text}
                      </Link>
                    ) : (
                      <span className="font-mono text-xs text-ink-soft whitespace-nowrap">{text}</span>
                    )}
                  </span>
                );
              })}
              <div className="h-px bg-line flex-1" aria-hidden />
              <span className="w-2 h-2 rounded-full bg-amber shrink-0" aria-hidden />
            </div>
          ));
        })()}
        {extraClips.length > 3 ? (
          <div className="mt-1.5 text-center font-mono text-xs text-muted">
            {video.danceSlug ? (
              <Link href={`/dances/${video.danceSlug}`} className="hover:text-denim hover:underline">
                … ({extraClips.length - 3} more)
              </Link>
            ) : (
              <>… ({extraClips.length - 3} more)</>
            )}
          </div>
        ) : null}

        <div className="mt-2.5 text-sm font-display space-y-1">
          {video.variantName || video.handholdName ? (
            <div className="flex flex-wrap gap-1.5">
              {video.variantName ? <CountChip>{video.variantName}</CountChip> : null}
              {video.handholdName ? <CountChip>{video.handholdName}</CountChip> : null}
            </div>
          ) : null}
          {showMove && video.moveSlug ? (
            <div>
              <Link href={`/moves/${video.moveSlug}`} className="font-bold text-denim hover:underline">
                {video.moveName}
              </Link>
            </div>
          ) : null}
          {video.dancers.length > 0 ? (
            <div className="flex flex-wrap gap-x-1.5">
              {video.dancers.map((d, i) => (
                <span key={d.id}>
                  <Link href={`/dancers/${d.slug}`} className="text-denim font-semibold hover:underline">
                    {d.name}
                  </Link>
                  {d.role ? <span className="text-muted"> ({d.role})</span> : null}
                  {i < video.dancers.length - 1 ? <span className="text-muted"> &amp;</span> : null}
                </span>
              ))}
            </div>
          ) : null}
          {video.event ? (
            <div className="text-muted">
              at{" "}
              <Link href={`/events/${video.event.slug}`} className="text-denim hover:underline">
                {video.event.name}
                {video.event.year ? ` ${video.event.year}` : ""}
              </Link>
            </div>
          ) : null}
          {video.danceSongs.length > 0 ? (
            <div className="text-muted">
              <span aria-hidden>♪</span>{" "}
              {video.danceSongs.map((s, i) => (
                <span key={i}>
                  <span className="text-ink-soft">{s.song}</span>
                  {s.song && s.artist ? " — " : ""}
                  {s.artist}
                  {i < video.danceSongs.length - 1 ? " · " : ""}
                </span>
              ))}
            </div>
          ) : null}
          {video.note ? <p className="text-ink-soft">{video.note}</p> : null}
          {video.title ? (
            <p className="text-xs text-muted truncate" title={video.title}>
              {video.title}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted">
            <a
              href={youtubeWatchUrl(video.youtubeId, video.startSec)}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-denim underline"
            >
              Watch on YouTube
            </a>
            <span>
              added by{" "}
              <Link href={`/users/${video.addedByName}`} className="hover:text-denim hover:underline">
                {video.addedByName}
              </Link>
            </span>
            {currentUserId === video.addedBy ? (
              <form action={deleteVideo} className="ml-auto">
                <input type="hidden" name="videoId" value={video.id} />
                <button
                  type="submit"
                  className="text-danger/70 hover:text-danger underline cursor-pointer"
                >
                  Remove
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
