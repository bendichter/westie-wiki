"use client";

import { useActionState } from "react";
import { resendVerification, type AuthFormState } from "@/lib/actions/auth";

export function VerifyEmailBanner() {
  const [state, formAction, pending] = useActionState<AuthFormState & { sent?: boolean }, FormData>(
    async () => resendVerification(),
    { error: null }
  );

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
