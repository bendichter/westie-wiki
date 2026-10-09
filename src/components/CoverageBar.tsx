"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { formatTimestamp } from "@/lib/time";
import type { YTPlayer } from "@/lib/youtube-player";
import type { TimedClip } from "./useActiveClips";

// a clip marked without an end time is drawn this long (about one six-count
// pattern), so it shows on the bar without claiming the whole gap after it
const OPEN_CLIP_SEC = 4;

/**
 * The whole dance as one slot line: marked moves are filled segments, the
 * gaps between them are what is left to map, and the amber marker follows
 * playback. The timeline list carries the same controls for keyboard and
 * screen-reader users, so the bar itself is pointer-only.
 */
export function CoverageBar({
  clips,
  labels,
  playerRef,
  playerReady,
  activeIds,
  onSelect,
  onSeek,
}: {
  /** Sorted by start. */
  clips: TimedClip[];
  /** Hover text per clip id, e.g. the move name. */
  labels: Record<number, string>;
  playerRef: RefObject<YTPlayer | null>;
  playerReady: boolean;
  activeIds: ReadonlySet<number>;
  onSelect: (id: number) => void;
  onSeek: (seconds: number) => void;
}) {
  const markerRef = useRef<HTMLSpanElement>(null);
  // only the player knows how long the video is
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!playerReady) return;
    const timer = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      const d = player.getDuration();
      if (!Number.isFinite(d) || d <= 0) return;
      setDuration((prev) => (prev === d ? prev : d));
      // moved through the ref so playback doesn't re-render the bar
      const t = player.getCurrentTime();
      if (markerRef.current && Number.isFinite(t)) {
        markerRef.current.style.left = `${Math.min(100, Math.max(0, (t / d) * 100))}%`;
      }
    }, 250);
    return () => clearInterval(timer);
  }, [playerReady, playerRef]);

  const segments = useMemo(
    () =>
      clips.map((c, i) => ({
        id: c.id,
        start: c.startSec,
        end: c.endSec ?? Math.min(clips[i + 1]?.startSec ?? Infinity, c.startSec + OPEN_CLIP_SEC),
      })),
    [clips]
  );

  // seconds covered by at least one segment (overlaps counted once)
  const coveredSec = useMemo(() => {
    let total = 0;
    let reach = 0;
    for (const s of segments) {
      const end = duration > 0 ? Math.min(s.end, duration) : s.end;
      if (end > reach) {
        total += end - Math.max(s.start, reach);
        reach = end;
      }
    }
    return total;
  }, [segments, duration]);

  const count = clips.length;
  const summary =
    count === 0
      ? "no moves marked yet"
      : `${count} move${count === 1 ? "" : "s"} marked${
          duration > 0
            ? `, ${formatTimestamp(Math.round(coveredSec))} of ${formatTimestamp(Math.round(duration))}`
            : ""
        }`;

  return (
    <div className="mt-3">
      <div
        aria-hidden
        onClick={(e) => {
          if (duration <= 0) return;
          const box = e.currentTarget.getBoundingClientRect();
          onSeek(Math.max(0, Math.min(1, (e.clientX - box.left) / box.width)) * duration);
        }}
        className={`relative h-2 rounded-full bg-line ${duration > 0 ? "cursor-pointer" : ""}`}
      >
        {duration > 0
          ? segments.map((s) => (
              <button
                key={s.id}
                type="button"
                tabIndex={-1}
                title={`${formatTimestamp(s.start)} ${labels[s.id] ?? ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(s.id);
                }}
                style={{
                  left: `${(s.start / duration) * 100}%`,
                  width: `${(Math.max(0, Math.min(s.end, duration) - s.start) / duration) * 100}%`,
                }}
                className={`absolute inset-y-0 min-w-[3px] cursor-pointer rounded-full transition-colors hover:bg-denim-deep ${
                  activeIds.has(s.id) ? "bg-denim-deep" : "bg-denim/60"
                }`}
              />
            ))
          : null}
        <span
          ref={markerRef}
          className={`pointer-events-none absolute top-1/2 left-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber ring-2 ring-paper ${
            duration > 0 ? "" : "hidden"
          }`}
        />
      </div>
      <div className="mt-1.5 flex items-baseline justify-between gap-3 font-mono text-xs text-muted">
        <span aria-hidden>0:00</span>
        <span>{summary}</span>
        <span aria-hidden>{duration > 0 ? formatTimestamp(Math.round(duration)) : ""}</span>
      </div>
    </div>
  );
}
