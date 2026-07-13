"use client";

import { useActionState, useState } from "react";
import { updateDancePlacement, type AnnotationFormState } from "@/lib/actions/dances";
import { CountChip, FormError, Input, PrimaryButton } from "./ui";

export function EditPlacementForm({
  danceId,
  placement,
  canEdit,
}: {
  danceId: number;
  placement: string | null;
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<AnnotationFormState, FormData>(
    async (prev, formData) => {
      const result = await updateDancePlacement(prev, formData);
      if (result.success) setOpen(false);
      return result;
    },
    { error: null }
  );

  if (!open) {
    return (
      <span className="inline-flex items-center gap-1.5">
        {placement ? <CountChip>{placement}</CountChip> : null}
        {canEdit ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="cursor-pointer text-xs font-display text-denim underline underline-offset-2 hover:text-denim-deep"
          >
            {placement ? "edit" : "+ placement"}
          </button>
        ) : null}
      </span>
    );
  }

  return (
    <form action={formAction} className="inline-flex flex-wrap items-center gap-2">
      <FormError error={state.error} />
      <input type="hidden" name="danceId" value={danceId} />
      <Input
        name="placement"
        defaultValue={placement ?? ""}
        maxLength={40}
        list="placement-edit-suggestions"
        placeholder="e.g. 1st place"
        aria-label="Placement"
        className="!w-40 !py-1.5 text-sm"
      />
      <datalist id="placement-edit-suggestions">
        {["1st place", "2nd place", "3rd place", "4th place", "5th place", "Finalist", "Semifinalist"].map(
          (v) => (
            <option key={v} value={v} />
          )
        )}
      </datalist>
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
    </form>
  );
}
