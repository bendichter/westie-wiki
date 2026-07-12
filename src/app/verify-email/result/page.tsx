import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Verify email" };

export default async function VerifyEmailResultPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;

  if (ok === "1") {
    return (
      <div className="max-w-md mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-1">Email confirmed ✓</h1>
        <p className="text-muted font-display">
          You can now edit moves, add clips, and build curricula.{" "}
          <Link href="/moves" className="text-denim underline">
            Get to it
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-1">Verification link invalid</h1>
      <p className="text-muted font-display">
        This link is malformed, expired, or already used. Log in and use the
        &ldquo;resend&rdquo; link in the banner to get a fresh one.
      </p>
    </div>
  );
}
