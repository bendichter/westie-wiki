"use client";

import { useActionState, useState } from "react";
import { reportContent, type ReportFormState } from "@/lib/actions/reports";
import { FormError, Input, PrimaryButton } from "./ui";

/** Small inline report control for a clip (videoId) or a dance (danceId). */
export function ReportForm({ videoId, danceId }: { videoId?: number; danceId?: number }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ReportFormState, FormData>(
    reportContent,
    { error: null }
  );

  if (state.success) {
    return <span className="font-display text-xs text-success">Reported — an admin will review.</span>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer text-xs text-muted underline hover:text-danger"
      >
        Report
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-2 flex w-full flex-wrap items-center gap-2">
      <FormError error={state.error} />
      {videoId != null ? <input type="hidden" name="videoId" value={videoId} /> : null}
      {danceId != null ? <input type="hidden" name="danceId" value={danceId} /> : null}
      <Input
        name="reason"
        required
        minLength={5}
        maxLength={500}
        placeholder="What's wrong? (e.g. workshop recap, posted without permission)"
        aria-label="Report reason"
        className="!py-1.5 text-sm flex-1 min-w-52"
      />
      <PrimaryButton type="submit" disabled={pending} className="!px-3 !py-1.5">
        {pending ? "Sending…" : "Send report"}
      </PrimaryButton>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="cursor-pointer font-display text-xs text-muted hover:text-ink"
      >
        Cancel
      </button>
    </form>
  );
}
