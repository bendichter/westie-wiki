"use client";

import { useActionState, useRef, useState } from "react";
import { addRelation, type RelationFormState } from "@/lib/actions/community";
import { FormError, Input, PrimaryButton, Select } from "./ui";

export function RelationEditor({
  moveId,
  moveNames,
}: {
  moveId: number;
  moveNames: string[];
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<RelationFormState, FormData>(
    async (prev, formData) => {
      const result = await addRelation(prev, formData);
      if (result.success) {
        formRef.current?.reset();
        setOpen(false);
      }
      return result;
    },
    { error: null }
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-denim font-display hover:underline cursor-pointer"
      >
        + Link a related move
      </button>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-2.5">
      <FormError error={state.error} />
      <input type="hidden" name="moveId" value={moveId} />
      <Select name="kind" required aria-label="Relationship type" defaultValue="">
        <option value="" disabled>
          Relationship…
        </option>
        <option value="prerequisite">Learn that move first (prerequisite)</option>
        <option value="variation">This move is a variation of that move</option>
        <option value="related">Related move</option>
      </Select>
      <Input
        name="targetMove"
        list="move-suggestions"
        required
        placeholder="Move name"
        aria-label="Related move name"
      />
      <datalist id="move-suggestions">
        {moveNames.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <div className="flex gap-2">
        <PrimaryButton type="submit" disabled={pending} className="!px-3 !py-1.5">
          {pending ? "Linking…" : "Link"}
        </PrimaryButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-muted font-display hover:text-ink cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
