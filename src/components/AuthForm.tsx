"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, signup, type AuthFormState } from "@/lib/actions/auth";
import { FieldHint, FormError, Input, Label, PrimaryButton } from "./ui";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const action = mode === "login" ? login : signup;
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(action, {
    error: null,
  });

  return (
    <form action={formAction} className="space-y-4">
      <FormError error={state.error} />
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      {mode === "signup" ? (
        <div>
          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" autoComplete="username" required minLength={3} maxLength={24} />
          <FieldHint>Shown on your edits and comments. Letters, numbers, - or _.</FieldHint>
        </div>
      ) : null}

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
          minLength={mode === "signup" ? 8 : undefined}
        />
        {mode === "signup" ? <FieldHint>At least 8 characters.</FieldHint> : null}
      </div>

      <PrimaryButton type="submit" disabled={pending} className="w-full">
        {pending ? "One moment…" : mode === "login" ? "Log in" : "Create account"}
      </PrimaryButton>

      {mode === "login" ? (
        <p className="text-sm font-display text-center">
          <Link href="/forgot-password" className="text-denim underline">
            Forgot your password?
          </Link>
        </p>
      ) : null}

      <p className="text-sm text-muted font-display text-center">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-denim underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-denim underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
