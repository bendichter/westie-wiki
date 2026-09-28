import type { Metadata } from "next";
import { confirmEmail } from "@/lib/actions/auth";
import { Card, PrimaryButton } from "@/components/ui";

export const metadata: Metadata = { title: "Confirm your email", robots: { index: false } };

/**
 * Landing page for the emailed confirmation link. Opening the link does not
 * confirm anything: company mail scanners open every link in incoming mail,
 * and when a page load confirmed the account they confirmed accounts that bots
 * had created with other people's addresses. Only the button click does.
 */
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; next?: string }>;
}) {
  const { token = "", next = "" } = await searchParams;

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-1">Confirm your email</h1>
      <p className="text-muted font-display mb-6">
        One click and your account can mark moves, edit move pages, and add clips.
      </p>
      <Card>
        <form action={confirmEmail}>
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="next" value={next} />
          <PrimaryButton type="submit" className="w-full">
            Confirm my email
          </PrimaryButton>
        </form>
      </Card>
      <p className="mt-4 text-sm text-muted font-display">
        Didn&apos;t sign up for Westie Wiki? Close this page and nothing happens.
      </p>
    </div>
  );
}
