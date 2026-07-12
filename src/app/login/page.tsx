import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { Card } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/redirects";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const { next, reset } = await searchParams;
  if (await getCurrentUser()) redirect(safeNextPath(next));

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-1">Welcome back</h1>
      <p className="text-muted font-display mb-6">Log in to edit moves and build curricula.</p>
      {reset === "1" ? (
        <div className="mb-4 rounded-md border border-success/30 bg-success/8 px-4 py-3 font-display text-sm text-success">
          Password updated — log in with your new password.
        </div>
      ) : null}
      <Card>
        <AuthForm mode="login" next={next} />
      </Card>
    </div>
  );
}
