"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  addAnnotation,
  deleteAnnotation,
  updateAnnotation,
  type AnnotationFormState,
} from "@/lib/actions/dances";
import { formatTimestamp } from "@/lib/time";
import { ClipLoopControls, PlayerBox, StartEndFields } from "./LoopControls";
import { useYouTubeLoop } from "./useYouTubeLoop";
import { FormError, inputClass, Input, PrimaryButton } from "./ui";

export type AnnotationItem = {
  id: number;
  startSec: number;
  endSec: number | null;
  note: string | null;
  variantId: number | null;
  handholdId: number | null;
  handholdName: string | null;
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
  initialClipId = null,
}: {
  danceId: number;
  youtubeId: string;
  annotations: AnnotationItem[];
  moveNames: string[];
  variantsByMove: Record<string, { id: number; name: string }[]>;
  handholds: { id: number; name: string }[];
  currentUserId: number | null;
  initialClipId?: number | null;
}) {
  const moveInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [moveName, setMoveName] = useState("");
  const [variantId, setVariantId] = useState("");
  const [handholdId, setHandholdId] = useState("");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [removing, setRemoving] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);

  const yt = useYouTubeLoop({ videoId: youtubeId });
  const { playerReady, playerRef } = yt;

  // arriving from a move page's clip thumbnail: cue that clip
  // into the form and player once, as soon as the player is ready
  const initialClipLoaded = useRef(false);
  useEffect(() => {
    if (!playerReady || initialClipLoaded.current || initialClipId == null) return;
    const target = annotations.find((a) => a.id === initialClipId);
    if (!target) return;
    initialClipLoaded.current = true;
    // start looping the linked clip right away
    if (currentUserId) loadAnnotation(target, 1);
    else loadClip(target, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerReady, initialClipId, annotations]);

  // follow playback and highlight the annotation under the playhead; an
  // annotation without an end time stays active until the next one starts
  useEffect(() => {
    if (!playerReady || annotations.length === 0) return;
    const timer = setInterval(() => {
      const t = playerRef.current?.getCurrentTime();
      if (t == null || !Number.isFinite(t)) return;
      let current: AnnotationItem | null = null;
      for (const a of annotations) {
        if (a.startSec <= t) current = a;
        else break;
      }
      if (current && current.endSec != null && t > current.endSec) current = null;
      setActiveId(current?.id ?? null);
    }, 250);
    return () => clearInterval(timer);
  }, [playerReady, annotations, playerRef]);

  // offer to document a move the wiki doesn't know yet (matching is
  // case-insensitive so a lowercase spelling of an existing move doesn't
  // read as new)
  const knownMoveNames = useMemo(
    () => new Set(moveNames.map((n) => n.toLowerCase())),
    [moveNames]
  );
  const trimmedMoveName = moveName.trim();
  const isUnknownMove =
    trimmedMoveName.length >= 2 && !knownMoveNames.has(trimmedMoveName.toLowerCase());

  function clearForm() {
    formRef.current?.reset();
    yt.setStart("");
    yt.setEnd("");
    setMoveName("");
    setVariantId("");
    setHandholdId("");
    setNote("");
    setEditingId(null);
    yt.setLoopRate(null);
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

  /** Delete the annotation currently loaded in the edit form (owner only). */
  async function removeEditingAnnotation() {
    if (editingId == null || removing) return;
    setRemoving(true);
    try {
      const fd = new FormData();
      fd.set("videoId", String(editingId));
      await deleteAnnotation(fd);
      clearForm();
    } finally {
      setRemoving(false);
    }
  }

  /**
   * Load an annotation's segment into the clip controls (and cue the player to
   * it). Pass a rate to start looping it immediately (needs an end time).
   */
  function loadClip(a: AnnotationItem, loop: number | null = null) {
    yt.loadSegment(a.startSec, a.endSec, loop);
  }

  /** Load an annotation into the form for editing (and cue the player to it). */
  function loadAnnotation(a: AnnotationItem, loop: number | null = null) {
    setEditingId(a.id);
    setMoveName(a.move.name);
    setVariantId(a.variantId != null ? String(a.variantId) : "");
    setHandholdId(a.handholdId != null ? String(a.handholdId) : "");
    setNote(a.note ?? "");
    loadClip(a, loop);
  }

  // start/end inputs and the loop buttons are shared between the logged-in
  // annotation form and the logged-out clip panel
  const startEndFields = (
    <StartEndFields
      idPrefix="annotate"
      withFormNames
      start={yt.start}
      end={yt.end}
      onStartChange={yt.setStart}
      onEndChange={yt.setEnd}
      onCaptureStart={yt.captureStart}
      onCaptureEnd={yt.captureEnd}
      playerReady={playerReady}
    />
  );

  const clipLoopControls = (
    <ClipLoopControls loopRate={yt.loopRate} setLoopRate={yt.setLoopRate} canLoop={yt.canLoop} />
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* player + marking panel */}
      <div>
        <PlayerBox hostRef={yt.playerHostRef} />

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
                {isUnknownMove ? (
                  <p className="mt-1.5 flex flex-wrap items-center gap-1.5 font-display text-xs text-muted">
                    <span>No move named “{trimmedMoveName}” yet.</span>
                    <a
                      href={`/moves/new?name=${encodeURIComponent(trimmedMoveName)}`}
                      target="_blank"
                      rel="noopener"
                      className="shrink-0 rounded-md border border-line bg-panel px-2 py-1 font-semibold hover:border-amber hover:text-amber"
                    >
                      + document it
                    </a>
                    <span>(opens a new tab, your marks stay put)</span>
                  </p>
                ) : null}
              </div>
              {startEndFields}
            </div>

            {/* clip playback: loop the marked segment, full speed or half speed */}
            {clipLoopControls}

            <div className="flex flex-wrap items-end gap-3">
              {(variantsByMove[moveName] ?? []).length > 0 ? (
                <div className="w-full sm:w-52">
                  <label htmlFor="annotate-variant" className="mb-0.5 block font-display text-xs font-semibold text-ink-soft">
                    Variant <span className="font-normal text-muted">(optional)</span>
                  </label>
                  <select
                    id="annotate-variant"
                    name="variantId"
                    value={variantId}
                    onChange={(e) => setVariantId(e.target.value)}
                    className={inputClass("cursor-pointer min-w-0 max-w-full")}
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
              <div className="w-full sm:w-48">
                <label htmlFor="annotate-handhold" className="mb-0.5 block font-display text-xs font-semibold text-ink-soft">
                  Handhold <span className="font-normal text-muted">(optional)</span>
                </label>
                <select
                  id="annotate-handhold"
                  name="handholdId"
                  value={handholdId}
                  onChange={(e) => setHandholdId(e.target.value)}
                  className={inputClass("cursor-pointer min-w-0 max-w-full")}
                >
                  <option value="">Not specified</option>
                  {handholds.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-auto sm:flex-1">
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
              {editingId != null &&
              annotations.find((a) => a.id === editingId)?.addedBy === currentUserId ? (
                <button
                  type="button"
                  onClick={removeEditingAnnotation}
                  disabled={removing}
                  className="ml-6 cursor-pointer rounded-md border border-danger/40 bg-panel px-3 py-2 font-display text-sm font-semibold text-danger hover:bg-danger/10 disabled:opacity-40"
                >
                  {removing ? "Removing…" : "Remove"}
                </button>
              ) : null}
            </div>
          </form>
        ) : (
          <div className="mt-4 space-y-3 rounded-lg border border-line bg-panel p-4">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <h2 className="font-display text-lg font-bold">Loop a clip</h2>
              <p className="font-display text-xs text-muted">
                Click a marked move, or set a start and end yourself, then loop it at full, half,
                or quarter speed.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">{startEndFields}</div>
            {clipLoopControls}
            <p className="font-display text-sm text-muted">
              <Link href="/login" className="text-denim underline">
                Log in
              </Link>{" "}
              to mark the moves in this dance.
            </p>
          </div>
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
              <li
                key={a.id}
                className={`relative pb-4 pl-5 transition-colors ${
                  activeId === a.id ? "rounded-r-md bg-amber/10" : ""
                }`}
              >
                <span
                  className={`absolute -left-[5px] top-2 h-2 w-2 rounded-full ${
                    editingId === a.id ? "bg-denim" : "bg-amber"
                  } ${activeId === a.id ? "ring-4 ring-amber/30" : ""}`}
                  aria-hidden
                />
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <button
                    type="button"
                    onClick={() => (currentUserId ? loadAnnotation(a) : loadClip(a))}
                    className="cursor-pointer font-mono text-sm font-semibold text-amber hover:underline"
                    title={
                      currentUserId
                        ? "Load this clip into the form"
                        : "Load this clip into the loop controls"
                    }
                  >
                    {formatTimestamp(a.startSec)}
                    {a.endSec != null ? `–${formatTimestamp(a.endSec)}` : ""}
                  </button>
                  <Link
                    href={`/moves/${a.move.slug}`}
                    className="font-display text-sm font-semibold text-denim hover:underline"
                  >
                    {a.move.name}
                  </Link>
                  {a.handholdName ? (
                    <span className="rounded-full border border-line bg-panel px-2 py-0.5 font-display text-[11px] text-muted">
                      {a.handholdName}
                    </span>
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
