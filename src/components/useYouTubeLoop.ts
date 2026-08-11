"use client";

import { useEffect, useRef, useState } from "react";
import { formatTimestamp, parseTimestamp } from "@/lib/time";
import { loadYouTubeApi, type YTPlayer } from "@/lib/youtube-player";

/**
 * Player lifecycle plus segment-loop state for a YouTube video: string
 * start/end fields (the annotation form submits them verbatim), a loop rate
 * that doubles as the on/off flag, and the interval that keeps playback
 * inside the marked segment.
 */
export function useYouTubeLoop({
  videoId,
  initialStart = "",
  initialEnd = "",
}: {
  videoId: string | null;
  initialStart?: string;
  initialEnd?: string;
}) {
  const playerHostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [loopRate, setLoopRate] = useState<number | null>(null);

  const loopStartSec = parseTimestamp(start.trim());
  const loopEndSec = parseTimestamp(end.trim());
  const canLoop =
    playerReady && loopStartSec != null && loopEndSec != null && loopEndSec > loopStartSec;

  // the cue position for a video switched in place, without making the
  // creation effect depend on the parsed start (synced first, read below)
  const cueStartRef = useRef(0);
  useEffect(() => {
    cueStartRef.current = loopStartSec ?? 0;
  }, [loopStartSec]);

  // create the player for the first video; switching to another video cues it
  // in place and stops any running loop
  useEffect(() => {
    if (!videoId) return;
    if (playerRef.current) {
      setLoopRate(null);
      playerRef.current.cueVideoById(videoId, cueStartRef.current);
      return;
    }
    let cancelled = false;
    loadYouTubeApi().then(() => {
      if (cancelled || !playerHostRef.current || playerRef.current) return;
      playerRef.current = new window.YT!.Player(playerHostRef.current, {
        videoId,
        width: "100%",
        playerVars: { rel: 0 },
        events: { onReady: () => setPlayerReady(true) },
      });
    });
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  // while looping, snap back to the clip start whenever playback leaves the segment
  useEffect(() => {
    if (loopRate == null || loopStartSec == null || loopEndSec == null) return;
    const player = playerRef.current;
    if (!player) return;
    player.setPlaybackRate(loopRate);
    player.seekTo(loopStartSec, true);
    player.playVideo();
    const timer = setInterval(() => {
      const t = player.getCurrentTime();
      if (!Number.isFinite(t)) return;
      if (t >= loopEndSec || t < loopStartSec - 1.5) player.seekTo(loopStartSec, true);
    }, 200);
    return () => {
      clearInterval(timer);
      // the destroy cleanup below may have already run on unmount
      try {
        player.setPlaybackRate(1);
      } catch {
        /* player already destroyed */
      }
    };
  }, [loopRate, loopStartSec, loopEndSec]);

  function captureTime(setter: (v: string) => void) {
    const t = playerRef.current?.getCurrentTime();
    if (t != null && Number.isFinite(t)) setter(formatTimestamp(Math.round(t * 10) / 10));
  }

  function jumpTo(seconds: number) {
    playerRef.current?.seekTo(seconds, true);
    playerRef.current?.playVideo();
  }

  /**
   * Load a segment into the clip controls and cue the player to it. Pass a
   * rate to start looping it immediately (needs an end time).
   */
  function loadSegment(startSec: number, endSec: number | null, loop: number | null = null) {
    setStart(formatTimestamp(startSec));
    setEnd(endSec != null ? formatTimestamp(endSec) : "");
    setLoopRate(endSec != null ? loop : null);
    jumpTo(startSec);
  }

  return {
    playerHostRef,
    playerRef,
    playerReady,
    start,
    setStart,
    end,
    setEnd,
    loopRate,
    setLoopRate,
    loopStartSec,
    loopEndSec,
    canLoop,
    captureStart: () => captureTime(setStart),
    captureEnd: () => captureTime(setEnd),
    jumpTo,
    loadSegment,
  };
}
