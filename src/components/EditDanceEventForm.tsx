"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { updateDanceEvent, type AnnotationFormState } from "@/lib/actions/dances";
import { FormError, Input, PrimaryButton } from "./ui";

/** Inline editor for the event a dance belongs to, mirroring the placement/songs editors. */
export function EditDanceEventForm({
  danceId,
  event,
  eventSuggestions,
  canEdit,
}: {
  danceId: number;
  event: { slug: string; name: string; year: number | null } | null;
  eventSuggestions: string[];
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<AnnotationFormState, FormData>(
    async (prev, formData) => {
      const result = await updateDanceEvent(prev, formData);
      if (result.success) setOpen(false);
      return result;
    },
    { error: null }
  );

  if (!open) {
    return (
      <span className="inline-flex items-baseline gap-1.5">
        {event ? (
          <>
            at{" "}
            <Link href={`/events/${event.slug}`} className="text-denim hover:underline">
              {event.name}
              {event.year ? ` ${event.year}` : ""}
            </Link>
          </>
        ) : null}
        {canEdit ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="cursor-pointer text-xs font-display text-denim underline underline-offset-2 hover:text-denim-deep"
          >
            {event ? "edit event" : "+ event"}
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
        name="eventName"
        defaultValue={event?.name ?? ""}
        maxLength={120}
        list="dance-event-suggestions"
        placeholder="e.g. The US Open"
        aria-label="Event name"
        className="!w-52 !py-1.5 text-sm"
      />
      <datalist id="dance-event-suggestions">
        {eventSuggestions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <Input
        name="eventYear"
        defaultValue={event?.year ?? ""}
        maxLength={4}
        inputMode="numeric"
        placeholder="year"
        aria-label="Event year"
        className="!w-20 !py-1.5 text-sm font-mono"
      />
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
