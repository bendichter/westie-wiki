"use client";

import { useState } from "react";
import { youtubeEmbedUrl, youtubeThumbnailUrl } from "@/lib/youtube";

/**
 * Thumbnail that swaps to a real YouTube iframe on click — keeps pages with
 * many clips fast, and only talks to YouTube once the user opts in.
 */
export function LiteYouTube({
  youtubeId,
  startSec,
  endSec,
  title,
}: {
  youtubeId: string;
  startSec: number;
  endSec: number | null;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src={`${youtubeEmbedUrl(youtubeId, startSec, endSec)}&autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full aspect-video rounded-md border border-line bg-ink"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="relative w-full aspect-video rounded-md border border-line overflow-hidden group cursor-pointer bg-ink"
      aria-label={`Play clip: ${title}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={youtubeThumbnailUrl(youtubeId)}
        alt=""
        loading="lazy"
        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="bg-ink/80 group-hover:bg-amber transition-colors rounded-full w-14 h-14 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 ml-1" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
