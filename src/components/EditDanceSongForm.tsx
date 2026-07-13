"use client";

import { useActionState, useRef, useState } from "react";
import { updateDanceSongs, type AnnotationFormState } from "@/lib/actions/dances";
import { FormError, Input, PrimaryButton } from "./ui";

type SongRow = { song: string; artist: string };

export function EditDanceSongForm({
  danceId,
  songs,
  canEdit,
}: {
  danceId: number;
  songs: SongRow[];
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const initialRows = songs.length > 0 ? songs : [{ song: "", artist: "" }];
  const [rows, setRows] = useState(initialRows.map((r, i) => ({ key: i, ...r })));
  const nextKey = useRef(initialRows.length);
  const [state, formAction, pending] = useActionState<AnnotationFormState, FormData>(
    async (prev, formData) => {
      const result = await updateDanceSongs(prev, formData);
      if (result.success) setOpen(false);
      return result;
    },
    { error: null }
  );

  if (!open) {
    return (
      <span className="inline-flex flex-wrap items-baseline gap-1.5">
        {songs.length > 0 ? (
          <span>
            <span aria-hidden>♪</span>{" "}
            {songs.map((s, i) => (
              <span key={i}>
                {s.song}
                {s.song && s.artist ? " — " : ""}
                {s.artist}
                {i < songs.length - 1 ? " · " : ""}
              </span>
            ))}
          </span>
        ) : null}
        {canEdit ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="cursor-pointer text-xs text-denim underline underline-offset-2 hover:text-denim-deep"
          >
            {songs.length > 0 ? "edit songs" : "♪ add songs"}
          </button>
        ) : null}
      </span>
    );
  }

  return (
    <form action={formAction} className="mt-2 max-w-md space-y-2">
      <FormError error={state.error} />
      <input type="hidden" name="danceId" value={danceId} />
      {rows.map((row, index) => (
        <div key={row.key} className="flex gap-2">
          <Input
            name="songName"
            defaultValue={row.song}
            maxLength={120}
            placeholder={`Song ${index + 1}`}
            aria-label={`Song ${index + 1}`}
            className="!py-1.5 text-sm"
          />
          <Input
            name="songArtist"
            defaultValue={row.artist}
            maxLength={120}
            placeholder="Artist"
            aria-label={`Artist ${index + 1}`}
            className="!py-1.5 text-sm"
          />
          {rows.length > 1 ? (
            <button
              type="button"
              aria-label={`Remove song ${index + 1}`}
              onClick={() => setRows((r) => r.filter((x) => x.key !== row.key))}
              className="cursor-pointer px-1 text-muted hover:text-danger"
            >
              ✕
            </button>
          ) : null}
        </div>
      ))}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setRows((r) => [...r, { key: nextKey.current++, song: "", artist: "" }])}
          className="cursor-pointer font-display text-sm text-denim hover:underline"
        >
          + Another song
        </button>
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
