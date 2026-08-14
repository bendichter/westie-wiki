"use client";

import type { ReactNode, RefObject } from "react";
import { Input } from "./ui";

export const nowButtonClass =
  "shrink-0 cursor-pointer rounded-md border border-line bg-panel px-2 py-1.5 font-display text-xs font-semibold hover:border-amber hover:text-amber disabled:opacity-40";

export const loopButtonClass = (active: boolean) =>
  `shrink-0 cursor-pointer rounded-md border px-2 py-1.5 font-display text-xs font-semibold disabled:opacity-40 ${
    active
      ? "border-amber bg-amber/15 text-amber"
      : "border-line bg-panel hover:border-amber hover:text-amber"
  }`;

/** The 16:9 box the YT API's iframe is pinned to (its own height attribute is
 * fixed, so the wrapper enforces the real aspect). */
export function PlayerBox({ hostRef }: { hostRef: RefObject<HTMLDivElement | null> }) {
  return (
    // full-bleed on phones: the negative margins cancel the page's px-4 so the
    // video reaches the screen edges, with no rounding or side borders there
    <div className="-mx-4 overflow-hidden border-y border-line bg-ink sm:mx-0 sm:rounded-lg sm:border">
      <div className="relative aspect-video w-full [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full">
        <div ref={hostRef} className="absolute inset-0" />
      </div>
    </div>
  );
}

/** Start/end timestamp fields with "now" capture buttons. */
export function StartEndFields({
  start,
  end,
  onStartChange,
  onEndChange,
  onCaptureStart,
  onCaptureEnd,
  playerReady,
  idPrefix,
  withFormNames = false,
  endLabel = (
    <>
      End <span className="font-normal text-muted">(optional)</span>
    </>
  ),
}: {
  start: string;
  end: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  onCaptureStart: () => void;
  onCaptureEnd: () => void;
  playerReady: boolean;
  idPrefix: string;
  /** render name="start"/name="end" (+ required on start) for form submission */
  withFormNames?: boolean;
  endLabel?: ReactNode;
}) {
  return (
    <>
      <div>
        <label htmlFor={`${idPrefix}-start`} className="mb-0.5 block font-display text-xs font-semibold text-ink-soft">
          Start
        </label>
        <div className="flex gap-1.5">
          <Input
            id={`${idPrefix}-start`}
            name={withFormNames ? "start" : undefined}
            required={withFormNames}
            value={start}
            onChange={(e) => onStartChange(e.target.value)}
            placeholder="1:23"
            className="font-mono !w-24"
          />
          <button
            type="button"
            disabled={!playerReady}
            onClick={onCaptureStart}
            className={nowButtonClass}
            title="Use current playback time"
          >
            now
          </button>
        </div>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-end`} className="mb-0.5 block font-display text-xs font-semibold text-ink-soft">
          {endLabel}
        </label>
        <div className="flex gap-1.5">
          <Input
            id={`${idPrefix}-end`}
            name={withFormNames ? "end" : undefined}
            value={end}
            onChange={(e) => onEndChange(e.target.value)}
            placeholder="1:31"
            className="font-mono !w-24"
          />
          <button
            type="button"
            disabled={!playerReady}
            onClick={onCaptureEnd}
            className={nowButtonClass}
            title="Use current playback time"
          >
            now
          </button>
        </div>
      </div>
    </>
  );
}

/** The 1x / half / quarter speed loop toggles. */
export function ClipLoopControls({
  loopRate,
  setLoopRate,
  canLoop,
}: {
  loopRate: number | null;
  setLoopRate: (r: number | null) => void;
  canLoop: boolean;
}) {
  return (
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
  );
}
