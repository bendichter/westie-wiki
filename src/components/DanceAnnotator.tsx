"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { addAnnotation, deleteAnnotation, type AnnotationFormState } from "@/lib/actions/dances";
import { formatTimestamp } from "@/lib/time";
import { FormError, Input, inputClass, PrimaryButton } from "./ui";

// minimal typings for the YouTube IFrame API
type YTPlayer = {
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
};
declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: object) => YTPlayer; PlayerState?: unknown };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve();
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    });
  }
  return apiPromise;
}

export type AnnotationItem = {
  id: number;
  startSec: number;
  endSec: number | null;
  note: string | null;
  addedBy: number;
  addedByName: string;
  move: { slug: string; name: string };
};

export function DanceAnnotator({
  danceId,
  youtubeId,
  annotations,
  moveNames,
  currentUserId,
}: {
  danceId: number;
  youtubeId: string;
  annotations: AnnotationItem[];
  moveNames: string[];
  currentUserId: number | null;
}) {
  const playerHostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const moveInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadYouTubeApi().then(() => {
      if (cancelled || !playerHostRef.current || playerRef.current) return;
      playerRef.current = new window.YT!.Player(playerHostRef.current, {
        videoId: youtubeId,
        width: "100%",
        playerVars: { rel: 0 },
        events: { onReady: () => setPlayerReady(true) },
      });
    });
    return () => {
      cancelled = true;
    };
  }, [youtubeId]);

  const [state, formAction, pending] = useActionState<AnnotationFormState, FormData>(
    async (prev, formData) => {
      const result = await addAnnotation(prev, formData);
      if (result.success) {
        // reset for the next move; keep the tape rolling
        formRef.current?.reset();
        setStart("");
        setEnd("");
        moveInputRef.current?.focus();
      }
      return result;
    },
    { error: null }
  );

  function captureTime(setter: (v: string) => void) {
    const t = playerRef.current?.getCurrentTime();
    if (t != null && Number.isFinite(t)) setter(formatTimestamp(Math.floor(t)));
  }

  function jumpTo(seconds: number) {
    playerRef.current?.seekTo(seconds, true);
    playerRef.current?.playVideo();
  }

  const nowButtonClass =
    "shrink-0 cursor-pointer rounded-md border border-line bg-panel px-2 py-1.5 font-display text-xs font-semibold hover:border-amber hover:text-amber disabled:opacity-40";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* player + marking panel */}
      <div>
        <div className="overflow-hidden rounded-lg border border-line bg-ink [&_iframe]:aspect-video [&_iframe]:w-full">
          <div ref={playerHostRef} className="aspect-video w-full" />
        </div>

        {currentUserId ? (
          <form
            ref={formRef}
            action={formAction}
            className="mt-4 space-y-3 rounded-lg border border-line bg-panel p-4"
          >
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <h2 className="font-display text-lg font-bold">Mark a move</h2>
              <p className="font-display text-xs text-muted">
                Play the video, hit <span className="font-mono">now</span> at the start of each
                pattern, name it, add — repeat down the whole dance.
              </p>
            </div>
            <FormError error={state.error} />
            <input type="hidden" name="danceId" value={danceId} />

            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <div>
                <label htmlFor="annotate-move" className="mb-0.5 block font-display text-xs font-semibold text-ink-soft">
                  Move
                </label>
                <input
                  id="annotate-move"
                  name="moveName"
                  list="annotate-move-suggestions"
                  required
                  placeholder="e.g. Whip"
                  ref={moveInputRef}
                  className={inputClass()}
                />
                <datalist id="annotate-move-suggestions">
                  {moveNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
              <div>
                <label htmlFor="annotate-start" className="mb-0.5 block font-display text-xs font-semibold text-ink-soft">
                  Start
                </label>
                <div className="flex gap-1.5">
                  <Input
                    id="annotate-start"
                    name="start"
                    required
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    placeholder="1:23"
                    className="font-mono !w-24"
                  />
                  <button
                    type="button"
                    disabled={!playerReady}
                    onClick={() => captureTime(setStart)}
                    className={nowButtonClass}
                    title="Use current playback time"
                  >
                    now
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="annotate-end" className="mb-0.5 block font-display text-xs font-semibold text-ink-soft">
                  End <span className="font-normal text-muted">(optional)</span>
                </label>
                <div className="flex gap-1.5">
                  <Input
                    id="annotate-end"
                    name="end"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    placeholder="1:31"
                    className="font-mono !w-24"
                  />
                  <button
                    type="button"
                    disabled={!playerReady}
                    onClick={() => captureTime(setEnd)}
                    className={nowButtonClass}
                    title="Use current playback time"
                  >
                    now
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label htmlFor="annotate-note" className="mb-0.5 block font-display text-xs font-semibold text-ink-soft">
                  Note <span className="font-normal text-muted">(optional)</span>
                </label>
                <Input id="annotate-note" name="note" maxLength={500} placeholder="e.g. with a hand change exit" />
              </div>
              <PrimaryButton type="submit" disabled={pending}>
                {pending ? "Adding…" : "Add move"}
              </PrimaryButton>
            </div>
          </form>
        ) : (
          <p className="mt-4 font-display text-sm text-muted">
            <Link href="/login" className="text-denim underline">
              Log in
            </Link>{" "}
            to mark the moves in this dance.
          </p>
        )}
      </div>

      {/* annotation timeline */}
      <aside>
        <h2 className="mb-3 font-display text-lg font-bold">
          Moves in this dance{" "}
          <span className="font-mono text-sm font-normal text-muted">({annotations.length})</span>
        </h2>
        {annotations.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line bg-panel/50 px-4 py-6 text-center font-display text-sm text-muted">
            Nothing marked yet — be the first to map this dance.
          </p>
        ) : (
          <ol className="relative ml-2 space-y-0 border-l-2 border-line">
            {annotations.map((a) => (
              <li key={a.id} className="relative pb-4 pl-5">
                <span className="absolute -left-[5px] top-2 h-2 w-2 rounded-full bg-amber" aria-hidden />
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <button
                    type="button"
                    onClick={() => jumpTo(a.startSec)}
                    className="cursor-pointer font-mono text-xs text-amber hover:underline"
                    title="Jump the player here"
                  >
                    {formatTimestamp(a.startSec)}
                    {a.endSec != null ? `–${formatTimestamp(a.endSec)}` : ""}
                  </button>
                  <Link
                    href={`/moves/${a.move.slug}`}
                    className="font-display font-semibold text-denim hover:underline"
                  >
                    {a.move.name}
                  </Link>
                  {currentUserId === a.addedBy ? (
                    <form action={deleteAnnotation} className="ml-auto">
                      <input type="hidden" name="videoId" value={a.id} />
                      <button
                        type="submit"
                        aria-label={`Remove ${a.move.name} annotation`}
                        className="cursor-pointer text-xs text-muted/60 hover:text-danger"
                      >
                        ✕
                      </button>
                    </form>
                  ) : null}
                </div>
                {a.note ? <p className="font-display text-xs text-ink-soft">{a.note}</p> : null}
              </li>
            ))}
          </ol>
        )}
      </aside>
    </div>
  );
}
