"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { formatTimestamp } from "@/lib/time";
import { parseYoutubeUrl, youtubeWatchUrl } from "@/lib/youtube";
import { ClipLoopControls, PlayerBox, StartEndFields } from "./LoopControls";
import { useYouTubeLoop } from "./useYouTubeLoop";
import { FormError, Input, PrimaryButton, SecondaryButton } from "./ui";

/**
 * The /loop tool: paste any YouTube link, mark a start and end, loop the
 * segment at full, half, or quarter speed. Nothing is stored — the URL is
 * the whole state, so the address bar always holds a shareable link.
 */
export function LoopPlayer({
  initialVideoId,
  initialStartSec,
  initialEndSec,
  initialRate,
}: {
  initialVideoId: string | null;
  initialStartSec: number | null;
  initialEndSec: number | null;
  initialRate: number | null;
}) {
  const [videoId, setVideoId] = useState<string | null>(initialVideoId);
  const [urlInput, setUrlInput] = useState(
    initialVideoId ? youtubeWatchUrl(initialVideoId, 0) : ""
  );
  const [urlError, setUrlError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const yt = useYouTubeLoop({
    videoId,
    initialStart: initialStartSec != null ? formatTimestamp(initialStartSec) : "",
    initialEnd: initialEndSec != null ? formatTimestamp(initialEndSec) : "",
  });

  function loadUrl(e: FormEvent) {
    e.preventDefault();
    const parsed = parseYoutubeUrl(urlInput);
    if (!parsed) {
      setUrlError("That doesn't look like a YouTube link. Paste a watch, share, or shorts URL.");
      return;
    }
    setUrlError(null);
    yt.setEnd("");
    yt.setStart(parsed.startSec != null ? formatTimestamp(parsed.startSec) : "");
    yt.setLoopRate(null);
    setVideoId(parsed.id);
  }

  // arriving via a share link with a rate: arm the loop once the player is
  // ready. Browsers may block programmatic playback without a gesture; the
  // armed loop then takes over at the viewer's first manual play.
  const autoLooped = useRef(false);
  useEffect(() => {
    if (!yt.playerReady || autoLooped.current) return;
    autoLooped.current = true;
    if (initialRate != null && yt.canLoop) yt.setLoopRate(initialRate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yt.playerReady]);

  // the canonical share path for the current state
  const share = videoId
    ? (() => {
        const qs = new URLSearchParams({ v: videoId });
        if (yt.loopStartSec != null) qs.set("start", String(yt.loopStartSec));
        if (yt.loopEndSec != null) qs.set("end", String(yt.loopEndSec));
        if (yt.loopRate != null) qs.set("rate", String(yt.loopRate));
        return `/loop?${qs.toString()}`;
      })()
    : null;

  // keep the address bar in sync so the current URL is always shareable;
  // replaceState integrates with the app router without re-rendering
  useEffect(() => {
    window.history.replaceState(null, "", share ?? "/loop");
  }, [share]);

  async function copyLink() {
    if (!share) return;
    const url = window.location.origin + share;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={loadUrl}>
        <label htmlFor="loop-url" className="mb-0.5 block font-display text-xs font-semibold text-ink-soft">
          YouTube link
        </label>
        <div className="flex gap-2">
          <Input
            id="loop-url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            className="min-w-0 flex-1"
          />
          <PrimaryButton type="submit" className="shrink-0">
            Load
          </PrimaryButton>
        </div>
        <div className="mt-2">
          <FormError error={urlError} />
        </div>
      </form>

      {videoId ? (
        <>
          <PlayerBox hostRef={yt.playerHostRef} />

          <div className="space-y-3 rounded-lg border border-line bg-panel p-4">
            <div className="flex flex-wrap gap-3">
              <StartEndFields
                idPrefix="loop"
                endLabel="End"
                start={yt.start}
                end={yt.end}
                onStartChange={yt.setStart}
                onEndChange={yt.setEnd}
                onCaptureStart={yt.captureStart}
                onCaptureEnd={yt.captureEnd}
                playerReady={yt.playerReady}
              />
            </div>
            <ClipLoopControls loopRate={yt.loopRate} setLoopRate={yt.setLoopRate} canLoop={yt.canLoop} />
            {share ? (
              <div className="flex flex-wrap items-center gap-3 border-t border-line pt-3">
                <a href={share} className="font-display text-sm text-denim underline underline-offset-2">
                  Share this loop
                </a>
                <SecondaryButton type="button" onClick={copyLink} className="!px-3 !py-1.5 text-xs">
                  Copy link
                </SecondaryButton>
                {copied ? <span className="font-display text-xs text-success">Copied</span> : null}
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-line bg-panel/50 px-6 text-center font-display text-sm text-muted">
          Paste a YouTube link above and mark any stretch of the video to loop it, full speed or
          slowed down.
        </div>
      )}
    </div>
  );
}
