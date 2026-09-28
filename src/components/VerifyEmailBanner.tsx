"use client";

import { useActionState } from "react";
import { usePathname } from "next/navigation";
import { resendVerification, type AuthFormState } from "@/lib/actions/auth";

type ResendState = AuthFormState & { sent?: boolean };

/** Resend the confirmation email; its link brings the user back to this page. */
function useResend(returnQuery = "") {
  const pathname = usePathname();
  return useActionState<ResendState, FormData>(async () => resendVerification((pathname ?? "/") + returnQuery), {
    error: null,
  });
}

export function VerifyEmailBanner() {
  const [state, formAction, pending] = useResend();

  return (
    <div className="bg-amber text-white text-center text-[13px] font-display py-1 px-4">
      {state.sent ? (
        <>Verification email sent — check your inbox (and spam folder).</>
      ) : (
        <>
          Confirm your email address to edit the wiki.{" "}
          <form action={formAction} className="inline">
            <button
              type="submit"
              disabled={pending}
              className="underline underline-offset-2 cursor-pointer disabled:opacity-60"
            >
              {pending ? "Sending…" : "Resend the link"}
            </button>
          </form>
          {state.error ? <span className="ml-2 opacity-90">{state.error}</span> : null}
        </>
      )}
    </div>
  );
}

/**
 * Shown in place of the marking form to logged-in users who haven't confirmed
 * their email, so they learn it before filling in a mark that can't be saved.
 */
export function VerifyToMarkNotice() {
  // "?mark=1" opens the marking panel when the link brings them back
  const [state, formAction, pending] = useResend("?mark=1");

  return (
    <div className="rounded-md border border-amber/40 bg-amber/10 px-3 py-2 font-display text-sm text-ink-soft">
      <p>
        <span className="font-semibold text-ink">One step left before you can mark moves:</span>{" "}
        confirm your email. The link we sent brings you back to this dance.
      </p>
      {state.sent ? (
        <p className="mt-1 text-muted">Sent. Check your inbox (and spam folder).</p>
      ) : (
        <form action={formAction} className="mt-1">
          <button
            type="submit"
            disabled={pending}
            className="cursor-pointer text-denim underline disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send the link again"}
          </button>
          {state.error ? <span className="ml-2 text-danger">{state.error}</span> : null}
        </form>
      )}
    </div>
  );
}
