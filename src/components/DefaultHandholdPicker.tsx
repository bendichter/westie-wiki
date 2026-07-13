"use client";

import { useActionState, useState } from "react";
import { setDefaultHandhold, type VariantFormState } from "@/lib/actions/variants";
import { FormError, PrimaryButton, Select } from "./ui";

export function DefaultHandholdPicker({
  moveId,
  current,
  handholds,
  canEdit,
}: {
  moveId: number;
  current: { id: number; name: string } | null;
  handholds: { id: number; name: string }[];
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<VariantFormState, FormData>(
    async (prev, formData) => {
      const result = await setDefaultHandhold(prev, formData);
      if (result.success) setOpen(false);
      return result;
    },
    { error: null }
  );

  if (current == null && !canEdit) return null;

  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted font-display font-semibold">
        Default handhold
      </dt>
      <dd className="mt-1">
        {!open ? (
          <span className="flex items-baseline gap-2 text-[15px]">
            {current ? (
              <span className="font-display text-ink-soft">{current.name}</span>
            ) : (
              <span className="font-display text-sm text-muted">not set</span>
            )}
            {canEdit ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="cursor-pointer text-xs text-denim underline underline-offset-2 hover:text-denim-deep"
              >
                edit
              </button>
            ) : null}
          </span>
        ) : (
          <form action={formAction} className="space-y-2">
            <FormError error={state.error} />
            <input type="hidden" name="moveId" value={moveId} />
            <Select name="handholdId" defaultValue={current?.id ?? ""} aria-label="Default handhold">
              <option value="">Not set</option>
              {handholds.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </Select>
            <div className="flex gap-2">
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
        )}
      </dd>
    </div>
  );
}
