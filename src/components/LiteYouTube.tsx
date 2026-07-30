"use client";

import { useState } from "react";
import Link from "next/link";
import { youtubeEmbedUrl, youtubeThumbnailUrl } from "@/lib/youtube";

/**
 * Thumbnail that swaps to a real YouTube iframe on click — keeps pages with
 * many clips fast, and only talks to YouTube once the user opts in. With an
 * `href`, the thumbnail navigates there instead of playing inline.
 */
export function LiteYouTube({
  youtubeId,
  startSec,
  endSec,
  title,
  portrait = false,
  href,
}: {
  youtubeId: string;
  startSec: number;
  endSec: number | null;
  title: string;
  portrait?: boolean;
  href?: string;
}) {
  const [playing, setPlaying] = useState(false);
  // vertical (Shorts-style) clips get a 9:16 frame at a sane height instead
  // of a pillarboxed 16:9 box
  const frame = portrait ? "aspect-[9/16] h-[420px] max-w-full mx-auto" : "w-full aspect-video";

  if (href) {
    return (
      <Link
        href={href}
        className={`relative block ${frame} rounded-md border border-line overflow-hidden group bg-ink`}
        aria-label={`Watch in the mapped dance: ${title}`}
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
      </Link>
    );
  }

  if (playing) {
    return (
      <iframe
        src={`${youtubeEmbedUrl(youtubeId, startSec, endSec)}&autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={`${frame} rounded-md border border-line bg-ink`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className={`relative ${portrait ? "block" : ""} ${frame} rounded-md border border-line overflow-hidden group cursor-pointer bg-ink`}
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
