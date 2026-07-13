"use client";

import { useActionState, useState } from "react";
import { updateVideoClip, type VideoFormState } from "@/lib/actions/videos";
import { formatTimestamp } from "@/lib/time";
import { FormError, Input, PrimaryButton, Select } from "./ui";

export function EditClipForm({
  videoId,
  startSec,
  endSec,
  note,
  variantId,
  variants,
  handholdId,
  handholds,
}: {
  videoId: number;
  startSec: number;
  endSec: number | null;
  note: string | null;
  variantId?: number | null;
  variants?: { id: number; name: string }[];
  handholdId?: number | null;
  handholds?: { id: number; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<VideoFormState, FormData>(
    async (prev, formData) => {
      const result = await updateVideoClip(prev, formData);
      if (result.success) setOpen(false);
      return result;
    },
    { error: null }
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hover:text-denim underline cursor-pointer"
      >
        Edit clip
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-2 w-full space-y-2 rounded-md border border-line bg-paper p-3">
      <FormError error={state.error} />
      <input type="hidden" name="videoId" value={videoId} />
      <div className="flex gap-2">
        <div className="flex-1">
          <label htmlFor={`clip-start-${videoId}`} className="mb-0.5 block font-display text-xs font-semibold text-ink-soft">
            Clip start
          </label>
          <Input
            id={`clip-start-${videoId}`}
            name="start"
            defaultValue={startSec > 0 ? formatTimestamp(startSec) : ""}
            placeholder="0:00"
            className="font-mono !py-1.5 text-sm"
          />
        </div>
        <div className="flex-1">
          <label htmlFor={`clip-end-${videoId}`} className="mb-0.5 block font-display text-xs font-semibold text-ink-soft">
            Clip end
          </label>
          <Input
            id={`clip-end-${videoId}`}
            name="end"
            defaultValue={endSec != null ? formatTimestamp(endSec) : ""}
            placeholder="e.g. 1:45"
            className="font-mono !py-1.5 text-sm"
          />
        </div>
      </div>
      {variants && variants.length > 0 ? (
        <div>
          <label htmlFor={`clip-variant-${videoId}`} className="mb-0.5 block font-display text-xs font-semibold text-ink-soft">
            Variant
          </label>
          <Select id={`clip-variant-${videoId}`} name="variantId" defaultValue={variantId ?? ""} className="!py-1.5 text-sm">
            <option value="">Not specified</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}
      {handholds && handholds.length > 0 ? (
        <div>
          <label htmlFor={`clip-handhold-${videoId}`} className="mb-0.5 block font-display text-xs font-semibold text-ink-soft">
            Handhold
          </label>
          <Select id={`clip-handhold-${videoId}`} name="handholdId" defaultValue={handholdId ?? ""} className="!py-1.5 text-sm">
            <option value="">Not specified</option>
            {handholds.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}
      <div>
        <label htmlFor={`clip-note-${videoId}`} className="mb-0.5 block font-display text-xs font-semibold text-ink-soft">Note</label>
        <Input id={`clip-note-${videoId}`} name="note" defaultValue={note ?? ""} maxLength={500} className="!py-1.5 text-sm" />
      </div>
      <div className="flex items-center gap-3">
        <PrimaryButton type="submit" disabled={pending} className="!px-3 !py-1.5">
          {pending ? "Saving…" : "Save clip"}
        </PrimaryButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="font-display text-sm text-muted hover:text-ink cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
