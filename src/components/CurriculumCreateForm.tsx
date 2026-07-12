"use client";

import { useActionState } from "react";
import { createCurriculum, type CurriculumFormState } from "@/lib/actions/curricula";
import { FieldHint, FormError, Input, Label, PrimaryButton, Textarea } from "./ui";

export function CurriculumCreateForm() {
  const [state, formAction, pending] = useActionState<CurriculumFormState, FormData>(
    createCurriculum,
    { error: null }
  );

  return (
    <form action={formAction} className="space-y-5">
      <FormError error={state.error} />
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={100}
          placeholder="e.g. WCS Foundations, or First Year of Whips"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Who is this path for, and what will they be able to dance at the end?"
        />
        <FieldHint>You&apos;ll add and order the moves on the next screen.</FieldHint>
      </div>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create and add moves"}
      </PrimaryButton>
    </form>
  );
}
