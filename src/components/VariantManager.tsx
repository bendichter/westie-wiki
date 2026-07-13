"use client";

import { useActionState, useRef, useState } from "react";
import { addVariant, deleteVariant, type VariantFormState } from "@/lib/actions/variants";
import { FormError, Input, PrimaryButton } from "./ui";

export type VariantItem = { id: number; name: string; note: string | null };

export function VariantManager({
  moveId,
  variants,
  canEdit,
}: {
  moveId: number;
  variants: VariantItem[];
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<VariantFormState, FormData>(
    async (prev, formData) => {
      const result = await addVariant(prev, formData);
      if (result.success) {
        formRef.current?.reset();
        setOpen(false);
      }
      return result;
    },
    { error: null }
  );

  if (variants.length === 0 && !canEdit) return null;

  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted font-display font-semibold">
        Official variants
      </dt>
      <dd className="mt-1 space-y-1">
        {variants.map((variant) => (
          <div key={variant.id} className="flex items-baseline gap-2 text-[15px]">
            <span className="font-display text-ink-soft">{variant.name}</span>
            {variant.note ? (
              <span className="font-display text-xs text-muted">{variant.note}</span>
            ) : null}
            {canEdit ? (
              <form action={deleteVariant}>
                <input type="hidden" name="variantId" value={variant.id} />
                <button
                  type="submit"
                  aria-label={`Remove variant ${variant.name}`}
                  className="cursor-pointer text-xs text-muted/60 hover:text-danger"
                >
                  ✕
                </button>
              </form>
            ) : null}
          </div>
        ))}

        {canEdit && !open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="cursor-pointer font-display text-sm text-denim hover:underline"
          >
            + Add a variant
          </button>
        ) : null}

        {open ? (
          <form ref={formRef} action={formAction} className="mt-2 space-y-2">
            <FormError error={state.error} />
            <input type="hidden" name="moveId" value={moveId} />
            <Input name="name" required maxLength={60} placeholder="e.g. Right-to-right (handshake)" aria-label="Variant name" />
            <Input name="note" maxLength={200} placeholder="One-line description (optional)" aria-label="Variant note" />
            <div className="flex gap-2">
              <PrimaryButton type="submit" disabled={pending} className="!px-3 !py-1.5">
                {pending ? "Adding…" : "Add variant"}
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
        ) : null}
      </dd>
    </div>
  );
}
