import type { Metadata } from "next";
import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { moves, users, videos } from "@/db/schema";
import { PageTitle } from "@/components/ui";

export const metadata: Metadata = {
  title: "Sponsor Westie Wiki",
  description:
    "Put your event, shoes, or classes in front of West Coast Swing dancers who are actively learning.",
};

const CONTACT_EMAIL = process.env.SPONSOR_CONTACT_EMAIL ?? "ben.dichter@gmail.com";

export default function SponsorPage() {
  const stats = {
    moves: db.select({ n: count() }).from(moves).where(eq(moves.deleted, 0)).get()?.n ?? 0,
    clips: db.select({ n: count() }).from(videos).get()?.n ?? 0,
    members: db.select({ n: count() }).from(users).get()?.n ?? 0,
  };

  return (
    <div className="max-w-2xl">
      <PageTitle sub="Reach West Coast Swing dancers at the exact moment they're investing in the dance.">
        Sponsor Westie Wiki
      </PageTitle>

      <div className="prose-wcs space-y-4">
        <p>
          Westie Wiki is the community-edited reference for West Coast Swing moves — currently{" "}
          <strong>{stats.moves} documented moves</strong> with <strong>{stats.clips} labeled
          video clips</strong>, built by {stats.members} member{stats.members === 1 ? "" : "s"}.
          The people reading it are learners looking up patterns after class, dancers preparing
          for their next event, and teachers building curricula — exactly the audience for WCS
          events, dance shoes, apparel, and instruction.
        </p>

        <h2>What a sponsorship includes</h2>
        <ul>
          <li>
            A named sponsor card — your name, one-line pitch, and link — shown in the sidebar of
            the home page and <em>every move page</em> on the site.
          </li>
          <li>Click-through counts reported to you monthly.</li>
          <li>
            Clear &ldquo;Sponsor&rdquo; labeling. No pop-ups, no tracking scripts, no user data —
            ever. Sponsors here fund hosting and keep the wiki free and open for the community.
          </li>
        </ul>

        <h2>House rules</h2>
        <ul>
          <li>Sponsors must be relevant to the swing dance community (events, gear, instruction, music).</li>
          <li>Sponsorship never influences wiki content — the community writes the pages.</li>
        </ul>

        <h2>Get in touch</h2>
        <p>
          Email <a href={`mailto:${CONTACT_EMAIL}`} className="text-denim underline">{CONTACT_EMAIL}</a>{" "}
          with who you are and what you&apos;d like to promote. Event organizers: ask about
          short-term placements timed to your registration window.
        </p>

        <p>
          <Link href="/about" className="text-denim underline">
            More about the project →
          </Link>
        </p>
      </div>
    </div>
  );
}
