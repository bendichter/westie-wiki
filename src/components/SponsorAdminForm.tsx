"use client";

import { useActionState, useRef } from "react";
import { addSponsor, type SponsorFormState } from "@/lib/actions/sponsors";
import { FieldHint, FormError, Input, Label, PrimaryButton } from "./ui";

export function SponsorAdminForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<SponsorFormState, FormData>(
    async (prev, formData) => {
      const result = await addSponsor(prev, formData);
      if (result.success) formRef.current?.reset();
      return result;
    },
    { error: null }
  );

  return (
    <form ref={formRef} action={formAction} className="max-w-lg space-y-4 rounded-lg border border-line bg-panel p-5">
      <h2 className="font-display text-lg font-bold">Add a sponsor</h2>
      <FormError error={state.error} />
      <div>
        <Label htmlFor="sponsor-name">Name</Label>
        <Input id="sponsor-name" name="name" required maxLength={80} placeholder="e.g. Swingtacular 2027" />
      </div>
      <div>
        <Label htmlFor="sponsor-url">Link</Label>
        <Input id="sponsor-url" name="url" type="url" required placeholder="https://…" />
        <FieldHint>Clicks route through /s/[id] so you can report click counts to sponsors.</FieldHint>
      </div>
      <div>
        <Label htmlFor="sponsor-tagline">Tagline</Label>
        <Input
          id="sponsor-tagline"
          name="tagline"
          maxLength={140}
          placeholder="One sentence shown under the name"
        />
      </div>
      <div className="max-w-32">
        <Label htmlFor="sponsor-position">Position</Label>
        <Input id="sponsor-position" name="position" type="number" defaultValue={0} className="font-mono" />
        <FieldHint>Lower shows first.</FieldHint>
      </div>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add sponsor"}
      </PrimaryButton>
    </form>
  );
}
