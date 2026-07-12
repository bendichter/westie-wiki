import Link from "next/link";
import { deleteVideo } from "@/lib/actions/videos";
import type { VideoWithLabels } from "@/lib/data/moves";
import { formatTimestamp } from "@/lib/time";
import { youtubeWatchUrl } from "@/lib/youtube";
import { EditClipForm } from "./EditClipForm";
import { LiteYouTube } from "./LiteYouTube";

export function VideoCard({
  video,
  currentUserId,
  showMove,
}: {
  video: VideoWithLabels & { moveName?: string; moveSlug?: string };
  currentUserId: number | null;
  showMove?: boolean;
}) {
  const clipLabel =
    video.endSec != null
      ? `${formatTimestamp(video.startSec)} → ${formatTimestamp(video.endSec)}`
      : video.startSec > 0
        ? `from ${formatTimestamp(video.startSec)}`
        : "full video";
  const duration =
    video.endSec != null ? `${video.endSec - video.startSec}s clip` : null;

  return (
    <div className="bg-panel border border-line rounded-lg overflow-hidden">
      <LiteYouTube
        youtubeId={video.youtubeId}
        startSec={video.startSec}
        endSec={video.endSec}
        title={video.title ?? "Video example"}
      />
      <div className="p-3.5">
        {/* clip bar: the labeled segment, in the wiki's slot motif */}
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-amber shrink-0" aria-hidden />
          <div className="h-px bg-line flex-1" aria-hidden />
          <span className="font-mono text-xs text-ink-soft whitespace-nowrap">
            {clipLabel}
            {duration ? <span className="text-muted"> · {duration}</span> : null}
          </span>
          <div className="h-px bg-line flex-1" aria-hidden />
          <span className="w-2 h-2 rounded-full bg-amber shrink-0" aria-hidden />
        </div>

        <div className="mt-2.5 text-sm font-display space-y-1">
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
            {currentUserId != null ? (
              <EditClipForm
                videoId={video.id}
                startSec={video.startSec}
                endSec={video.endSec}
                note={video.note}
              />
            ) : null}
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
