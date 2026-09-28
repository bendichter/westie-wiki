import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui";
import { safeNextPath } from "@/lib/redirects";

export const metadata: Metadata = { title: "Verify email", robots: { index: false } };

export default async function VerifyEmailResultPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; next?: string }>;
}) {
  const { ok, next: rawNext } = await searchParams;
  const next = safeNextPath(rawNext);

  if (ok === "1") {
    return (
      <div className="max-w-md mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-1">Email confirmed ✓</h1>
        <p className="text-muted font-display mb-5">
          You can now mark moves in dances, edit move pages, add clips, and build curricula.
        </p>
        {next !== "/" ? (
          <ButtonLink href={next}>{next.startsWith("/dances/") ? "Back to the dance to start marking" : "Back to where you were"}</ButtonLink>
        ) : (
          <ButtonLink href="/dances">Find a dance to map</ButtonLink>
        )}
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
