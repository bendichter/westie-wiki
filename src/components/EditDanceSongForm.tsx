"use client";

import { useActionState, useState } from "react";
import { updateDanceSong, type AnnotationFormState } from "@/lib/actions/dances";
import { FormError, Input, PrimaryButton } from "./ui";

export function EditDanceSongForm({
  danceId,
  song,
  artist,
  canEdit,
}: {
  danceId: number;
  song: string | null;
  artist: string | null;
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<AnnotationFormState, FormData>(
    async (prev, formData) => {
      const result = await updateDanceSong(prev, formData);
      if (result.success) setOpen(false);
      return result;
    },
    { error: null }
  );

  if (!open) {
    return (
      <span className="inline-flex items-baseline gap-1.5">
        {song || artist ? (
          <>
            <span aria-hidden>♪</span> {song}
            {song && artist ? " — " : ""}
            {artist}
          </>
        ) : null}
        {canEdit ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="cursor-pointer text-xs text-denim underline underline-offset-2 hover:text-denim-deep"
          >
            {song || artist ? "edit song" : "♪ add song"}
          </button>
        ) : null}
      </span>
    );
  }

  return (
    <form action={formAction} className="mt-2 flex max-w-md flex-wrap items-end gap-2">
      <FormError error={state.error} />
      <input type="hidden" name="danceId" value={danceId} />
      <div className="flex-1 min-w-32">
        <label htmlFor={`dance-song-${danceId}`} className="mb-0.5 block font-display text-xs font-semibold text-ink-soft">
          Song
        </label>
        <Input
          id={`dance-song-${danceId}`}
          name="song"
          defaultValue={song ?? ""}
          maxLength={120}
          className="!py-1.5 text-sm"
        />
      </div>
      <div className="flex-1 min-w-32">
        <label htmlFor={`dance-artist-${danceId}`} className="mb-0.5 block font-display text-xs font-semibold text-ink-soft">
          Artist
        </label>
        <Input
          id={`dance-artist-${danceId}`}
          name="artist"
          defaultValue={artist ?? ""}
          maxLength={120}
          className="!py-1.5 text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <PrimaryButton type="submit" disabled={pending} className="!px-3 !py-1.5">
          {pending ? "Saving…" : "Save"}
        </PrimaryButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="cursor-pointer font-display text-sm text-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
