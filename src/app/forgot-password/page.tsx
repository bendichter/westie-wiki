import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/components/PasswordResetForms";
import { Card } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Forgot password" };

export default async function ForgotPasswordPage() {
  if (await getCurrentUser()) redirect("/profile");

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-1">Forgot your password?</h1>
      <p className="text-muted font-display mb-6">
        Happens to the best of us — usually mid-song.
      </p>
      <Card>
        <ForgotPasswordForm />
      </Card>
    </div>
  );
}
