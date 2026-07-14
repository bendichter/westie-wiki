"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  addAnnotation,
  deleteAnnotation,
  updateAnnotation,
  type AnnotationFormState,
} from "@/lib/actions/dances";
import { formatTimestamp, parseTimestamp } from "@/lib/time";
import { FormError, Input, inputClass, PrimaryButton } from "./ui";

// minimal typings for the YouTube IFrame API
type YTPlayer = {
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  setPlaybackRate: (rate: number) => void;
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
  variantId: number | null;
  handholdId: number | null;
  addedBy: number;
  addedByName: string;
  move: { slug: string; name: string };
};

export function DanceAnnotator({
  danceId,
  youtubeId,
  annotations,
  moveNames,
  variantsByMove,
  handholds,
  currentUserId,
}: {
  danceId: number;
  youtubeId: string;
  annotations: AnnotationItem[];
  moveNames: string[];
  variantsByMove: Record<string, { id: number; name: string }[]>;
  handholds: { id: number; name: string }[];
  currentUserId: number | null;
}) {
  const playerHostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const moveInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [moveName, setMoveName] = useState("");
  const [variantId, setVariantId] = useState("");
  const [handholdId, setHandholdId] = useState("");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loopRate, setLoopRate] = useState<number | null>(null);
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

  const loopStartSec = parseTimestamp(start.trim());
  const loopEndSec = parseTimestamp(end.trim());
  const canLoop =
    playerReady && loopStartSec != null && loopEndSec != null && loopEndSec > loopStartSec;

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
      player.setPlaybackRate(1);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loopRate, loopStartSec, loopEndSec]);

  function clearForm() {
    formRef.current?.reset();
    setStart("");
    setEnd("");
    setMoveName("");
    setVariantId("");
    setHandholdId("");
    setNote("");
    setEditingId(null);
    setLoopRate(null);
  }

  const [state, formAction, pending] = useActionState<AnnotationFormState, FormData>(
    async (prev, formData) => {
      const result = editingId != null
        ? await updateAnnotation(prev, formData)
        : await addAnnotation(prev, formData);
      if (result.success) {
        // reset for the next move; keep the tape rolling
        clearForm();
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

  /** Load an annotation into the form for editing (and cue the player to it). */
  function loadAnnotation(a: AnnotationItem) {
    setEditingId(a.id);
    setMoveName(a.move.name);
    setStart(formatTimestamp(a.startSec));
    setEnd(a.endSec != null ? formatTimestamp(a.endSec) : "");
    setVariantId(a.variantId != null ? String(a.variantId) : "");
    setHandholdId(a.handholdId != null ? String(a.handholdId) : "");
    setNote(a.note ?? "");
    setLoopRate(null);
    jumpTo(a.startSec);
  }

  const nowButtonClass =
    "shrink-0 cursor-pointer rounded-md border border-line bg-panel px-2 py-1.5 font-display text-xs font-semibold hover:border-amber hover:text-amber disabled:opacity-40";
  const loopButtonClass = (active: boolean) =>
    `shrink-0 cursor-pointer rounded-md border px-2 py-1.5 font-display text-xs font-semibold disabled:opacity-40 ${
      active
        ? "border-amber bg-amber/15 text-amber"
        : "border-line bg-panel hover:border-amber hover:text-amber"
    }`;

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
              <h2 className="font-display text-lg font-bold">
                {editingId != null ? "Edit this move" : "Mark a move"}
              </h2>
              <p className="font-display text-xs text-muted">
                {editingId != null ? (
                  <>Adjust the fields, then save — or cancel to go back to marking.</>
                ) : (
                  <>
                    Play the video, hit <span className="font-mono">now</span> at the start of each
                    pattern, name it, add — repeat down the whole dance.
                  </>
                )}
              </p>
            </div>
            <FormError error={state.error} />
            <input type="hidden" name="danceId" value={danceId} />
            {editingId != null ? <input type="hidden" name="videoId" value={editingId} /> : null}

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
                  value={moveName}
                  onChange={(e) => setMoveName(e.target.value)}
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

            {/* clip playback: loop the marked segment, full speed or half speed */}
            <div className="flex items-center gap-1.5">
              <span className="font-display text-xs font-semibold text-ink-soft">Clip:</span>
              <button
                type="button"
                disabled={!canLoop}
                onClick={() => setLoopRate(loopRate === 1 ? null : 1)}
                className={loopButtonClass(loopRate === 1)}
                title="Play the marked segment on repeat"
              >
                {loopRate === 1 ? "◼ stop loop" : "↻ loop"}
              </button>
              <button
                type="button"
                disabled={!canLoop}
                onClick={() => setLoopRate(loopRate === 0.5 ? null : 0.5)}
                className={loopButtonClass(loopRate === 0.5)}
                title="Play the marked segment on repeat at half speed"
              >
                {loopRate === 0.5 ? "◼ stop ½× loop" : "↻ loop ½×"}
              </button>
              <button
                type="button"
                disabled={!canLoop}
                onClick={() => setLoopRate(loopRate === 0.25 ? null : 0.25)}
                className={loopButtonClass(loopRate === 0.25)}
                title="Play the marked segment on repeat at quarter speed"
              >
                {loopRate === 0.25 ? "◼ stop ¼× loop" : "↻ loop ¼×"}
              </button>
              {!canLoop ? (
                <span className="font-display text-xs text-muted">
                  set a start and end to loop the clip
                </span>
              ) : null}
            </div>

            <div className="flex items-end gap-3">
              {(variantsByMove[moveName] ?? []).length > 0 ? (
                <div className="w-52">
                  <label htmlFor="annotate-variant" className="mb-0.5 block font-display text-xs font-semibold text-ink-soft">
                    Variant <span className="font-normal text-muted">(optional)</span>
                  </label>
                  <select
                    id="annotate-variant"
                    name="variantId"
                    value={variantId}
                    onChange={(e) => setVariantId(e.target.value)}
                    className={inputClass("cursor-pointer")}
                  >
                    <option value="">Not specified</option>
                    {(variantsByMove[moveName] ?? []).map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              <div className="w-48">
                <label htmlFor="annotate-handhold" className="mb-0.5 block font-display text-xs font-semibold text-ink-soft">
                  Handhold <span className="font-normal text-muted">(optional)</span>
                </label>
                <select
                  id="annotate-handhold"
                  name="handholdId"
                  value={handholdId}
                  onChange={(e) => setHandholdId(e.target.value)}
                  className={inputClass("cursor-pointer")}
                >
                  <option value="">Not specified</option>
                  {handholds.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="annotate-note" className="mb-0.5 block font-display text-xs font-semibold text-ink-soft">
                  Note <span className="font-normal text-muted">(optional)</span>
                </label>
                <Input
                  id="annotate-note"
                  name="note"
                  maxLength={500}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. with a hand change exit"
                />
              </div>
              <PrimaryButton type="submit" disabled={pending}>
                {pending ? "Saving…" : editingId != null ? "Edit" : "Add move"}
              </PrimaryButton>
              {editingId != null ? (
                <button
                  type="button"
                  onClick={clearForm}
                  className="cursor-pointer pb-2.5 font-display text-sm text-muted hover:text-ink"
                >
                  Cancel
                </button>
              ) : null}
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
                <span
                  className={`absolute -left-[5px] top-2 h-2 w-2 rounded-full ${
                    editingId === a.id ? "bg-denim" : "bg-amber"
                  }`}
                  aria-hidden
                />
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <button
                    type="button"
                    onClick={() => (currentUserId ? loadAnnotation(a) : jumpTo(a.startSec))}
                    className="cursor-pointer font-mono text-xs text-amber hover:underline"
                    title={currentUserId ? "Load this clip into the form" : "Jump the player here"}
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
