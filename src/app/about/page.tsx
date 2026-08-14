import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/ui";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <PageTitle sub="What this project is — and what it isn't.">About Westie Wiki</PageTitle>

      <div className="prose-wcs space-y-4">
        <p>
          Westie Wiki is a community-edited catalog of West Coast Swing moves. Dancers document
          patterns, link video examples with exact timestamps, label who&apos;s dancing and where, and
          assemble curricula — ordered paths through the material with notes for learners.
        </p>

        <h2>Descriptive, not prescriptive</h2>
        <p>
          Everything here describes how dancers actually dance and what they actually call things.
          Nothing here defines how a move <em>must</em> be danced or what it <em>must</em>{" "}be
          called. West Coast Swing is a living, improvised dance: patterns mutate, names collide,
          regional scenes disagree, and the pros you&apos;ll find in our video examples break these
          &ldquo;rules&rdquo; constantly and gloriously.
        </p>
        <p>
          Treat every page as a learning aid — a map drawn by fellow travelers — not as a source of
          truth about West Coast Swing. If your teacher tells you something different from what you
          read here, listen to your teacher. Better yet, add what you learned to the wiki.
        </p>

        <h2>How it works</h2>
        <ul>
          <li>
            <strong>Anyone can browse.</strong> Moves, videos, dancers, events, and curricula are
            public.
          </li>
          <li>
            <strong>Members can edit.</strong> Like Wikipedia, every edit is recorded with who made
            it and why. Old versions are never lost — you can view history, compare revisions, and
            restore.
          </li>
          <li>
            <strong>Videos stay on YouTube.</strong>{" "}We link to clips with start/end timestamps and
            label them with dancers and events. We host nothing and claim nothing — and we only
            link videos uploaded by the dancers themselves or the event, or shared with the
            dancer&apos;s explicit permission. Never workshop recaps.
          </li>
        </ul>

        <h2>House style</h2>
        <p>
          The short version is below — the full{" "}
          <Link href="/guidelines" className="text-denim underline">
            contribution guidelines
          </Link>{" "}
          cover role-neutral language, naming collisions, and how to write for learners.
        </p>
        <ul>
          <li>Describe what you see and what is commonly taught, not what you think is correct.</li>
          <li>When names conflict, list them all as alternative names and let the description explain.</li>
          <li>Prefer video evidence over assertion — link a clip.</li>
          <li>Leave an edit summary so others understand your change.</li>
        </ul>

        <h2>Bugs and Feature Requests</h2>
        <p>
          Westie Wiki is developed in the open at{" "}
          <a
            href="https://github.com/bendichter/westie-wiki"
            className="text-denim underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/bendichter/westie-wiki
          </a>
          . If something looks broken, or you have an idea that would make the wiki more useful,
          please{" "}
          <a
            href="https://github.com/bendichter/westie-wiki/issues"
            className="text-denim underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            open a GitHub issue
          </a>
          . Reports of small annoyances are just as welcome as big feature ideas.
        </p>

        <p>
          Ready to contribute?{" "}
          <Link href="/signup" className="text-denim underline">
            Create an account
          </Link>{" "}
          or{" "}
          <Link href="/moves" className="text-denim underline">
            start browsing
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
