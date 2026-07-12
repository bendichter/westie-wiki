import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { Card } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/redirects";

export const metadata: Metadata = { title: "Join" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(safeNextPath(next));

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-1">Join the wiki</h1>
      <p className="text-muted font-display mb-6">
        Free account. Document moves, label videos, and build learning paths for the community.
      </p>
      <Card>
        <AuthForm mode="signup" next={next} />
      </Card>
    </div>
  );
}
