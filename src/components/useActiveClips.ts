"use client";

import { useEffect, useState, type RefObject } from "react";
import type { YTPlayer } from "@/lib/youtube-player";

export type TimedClip = { id: number; startSec: number; endSec: number | null };

/**
 * Follow playback and report every clip whose segment contains the playhead.
 * Overlapping segments are all active together; a clip without an end time
 * stays active until the next one starts. Clips must be sorted by start.
 */
export function useActiveClips(
  playerRef: RefObject<YTPlayer | null>,
  playerReady: boolean,
  clips: TimedClip[]
): ReadonlySet<number> {
  const [activeIds, setActiveIds] = useState<ReadonlySet<number>>(new Set());

  useEffect(() => {
    if (!playerReady || clips.length === 0) return;
    const timer = setInterval(() => {
      const t = playerRef.current?.getCurrentTime();
      if (t == null || !Number.isFinite(t)) return;
      const next = new Set<number>();
      for (let i = 0; i < clips.length; i++) {
        const c = clips[i];
        if (t < c.startSec) break; // sorted by start; the rest start later
        const end = c.endSec ?? clips[i + 1]?.startSec ?? Infinity;
        if (t < end) next.add(c.id);
      }
      // keep the same Set instance when nothing changed, so playback doesn't
      // re-render the timeline four times a second
      setActiveIds((prev) =>
        prev.size === next.size && [...next].every((id) => prev.has(id)) ? prev : next
      );
    }, 250);
    return () => clearInterval(timer);
  }, [playerReady, clips, playerRef]);

  return activeIds;
}
