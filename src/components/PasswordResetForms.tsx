"use client";

import { useActionState } from "react";
import { requestPasswordReset, resetPassword, type AuthFormState } from "@/lib/actions/auth";
import { FieldHint, FormError, Input, Label, PrimaryButton } from "./ui";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthFormState & { sent?: boolean }, FormData>(
    requestPasswordReset,
    { error: null }
  );

  if (state.sent) {
    return (
      <div className="rounded-md border border-success/30 bg-success/8 px-4 py-3 font-display text-[15px] text-success">
        If an account exists for that email, a reset link is on its way. It works once and
        expires in an hour — check your spam folder if it doesn&apos;t arrive.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <FormError error={state.error} />
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        <FieldHint>The email you signed up with. We&apos;ll send a one-time reset link.</FieldHint>
      </div>
      <PrimaryButton type="submit" disabled={pending} className="w-full">
        {pending ? "Sending…" : "Send reset link"}
      </PrimaryButton>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(resetPassword, {
    error: null,
  });

  return (
    <form action={formAction} className="space-y-4">
      <FormError error={state.error} />
      <input type="hidden" name="token" value={token} />
      <div>
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
        <FieldHint>At least 8 characters. You&apos;ll be logged out everywhere else.</FieldHint>
      </div>
      <PrimaryButton type="submit" disabled={pending} className="w-full">
        {pending ? "Saving…" : "Set new password"}
      </PrimaryButton>
    </form>
  );
}
