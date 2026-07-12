import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/PasswordResetForms";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-1">Reset link invalid</h1>
        <p className="text-muted font-display">
          This reset link is malformed or incomplete.{" "}
          <Link href="/forgot-password" className="text-denim underline">
            Request a new one
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-1">Choose a new password</h1>
      <p className="text-muted font-display mb-6">Then log back in and get back to dancing.</p>
      <Card>
        <ResetPasswordForm token={token} />
      </Card>
    </div>
  );
}
