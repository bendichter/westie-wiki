"use client";

import { useActionState, useRef, useState } from "react";
import { addVideo, type VideoFormState } from "@/lib/actions/videos";
import {
  FieldHint,
  FormError,
  Input,
  Label,
  PrimaryButton,
  SecondaryButton,
  Select,
} from "./ui";

export function AddVideoForm({
  moveId,
  dancerNames,
  variants,
}: {
  moveId: number;
  dancerNames: string[];
  variants: { id: number; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [dancerRows, setDancerRows] = useState([0, 1]);
  const nextRow = useRef(2);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<VideoFormState, FormData>(
    async (prev, formData) => {
      const result = await addVideo(prev, formData);
      if (result.success) {
        formRef.current?.reset();
        setOpen(false);
        setDancerRows([0, 1]);
      }
      return result;
    },
    { error: null }
  );

  if (!open) {
    return (
      <SecondaryButton type="button" onClick={() => setOpen(true)}>
        + Add a video example
      </SecondaryButton>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="bg-panel border border-line rounded-lg p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold">Add a video example</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-muted hover:text-ink text-sm font-display cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <FormError error={state.error} />
      <input type="hidden" name="moveId" value={moveId} />

      <div>
        <Label htmlFor="url">YouTube link</Label>
        <Input
          id="url"
          name="url"
          required
          placeholder="https://www.youtube.com/watch?v=… or https://youtu.be/…"
        />
        <FieldHint>
          If the link has a timestamp (?t=), it becomes the start time. Publicly shared
          competition and social footage only — no workshop recaps (see the{" "}
          <a href="/guidelines" target="_blank" className="text-denim underline">
            guidelines
          </a>
          ).
        </FieldHint>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-sm">
        <div>
          <Label htmlFor="start">Clip start</Label>
          <Input id="start" name="start" placeholder="1:23" className="font-mono" />
        </div>
        <div>
          <Label htmlFor="end">Clip end</Label>
          <Input id="end" name="end" placeholder="1:45" className="font-mono" />
        </div>
      </div>

      <div>
        <Label>Dancers in this clip</Label>
        <div className="space-y-2">
          {dancerRows.map((rowId) => (
            <div key={rowId} className="flex gap-2">
              <div className="flex-1">
                <Input
                  name="dancerName"
                  list="dancer-suggestions"
                  placeholder="Dancer name"
                  aria-label="Dancer name"
                />
              </div>
              <Select name="dancerRole" aria-label="Role" className="!w-36">
                <option value="">Role…</option>
                <option value="leader">Leader</option>
                <option value="follower">Follower</option>
              </Select>
              {dancerRows.length > 1 ? (
                <button
                  type="button"
                  aria-label="Remove dancer row"
                  onClick={() => setDancerRows((rows) => rows.filter((r) => r !== rowId))}
                  className="text-muted hover:text-danger px-2 cursor-pointer"
                >
                  ✕
                </button>
              ) : null}
            </div>
          ))}
        </div>
        <datalist id="dancer-suggestions">
          {dancerNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <button
          type="button"
          onClick={() => setDancerRows((rows) => [...rows, nextRow.current++])}
          className="mt-2 text-sm text-denim font-display hover:underline cursor-pointer"
        >
          + Another dancer
        </button>
        <FieldHint>New dancers are added to the wiki automatically.</FieldHint>
      </div>

      <div className="grid grid-cols-[1fr_120px] gap-4 max-w-md">
        <div>
          <Label htmlFor="eventName">Event</Label>
          <Input id="eventName" name="eventName" placeholder="e.g. The US Open" />
        </div>
        <div>
          <Label htmlFor="eventYear">Year</Label>
          <Input id="eventYear" name="eventYear" placeholder="2024" inputMode="numeric" className="font-mono" />
        </div>
      </div>

      {variants.length > 0 ? (
        <div className="max-w-64">
          <Label htmlFor="variantId">Variant</Label>
          <Select id="variantId" name="variantId" defaultValue="">
            <option value="">Not specified</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      <div>
        <Label htmlFor="note">Note</Label>
        <Input
          id="note"
          name="note"
          maxLength={500}
          placeholder="e.g. Slow-motion demo, or competition improvisation"
        />
      </div>

      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add video"}
      </PrimaryButton>
    </form>
  );
}
