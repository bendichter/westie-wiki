import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Contribution guidelines" };

export default function GuidelinesPage() {
  return (
    <div className="max-w-2xl">
      <PageTitle sub="How to write pages that serve every dancer who reads them.">
        Contribution guidelines
      </PageTitle>

      <div className="prose-wcs space-y-4">
        <p>
          These aren&apos;t rules enforced by software — they&apos;re the habits that keep a
          community wiki useful. When in doubt, edit boldly; everything is versioned and nothing
          is ever lost.
        </p>

        <h2>Describe, don&apos;t prescribe</h2>
        <ul>
          <li>
            Write what dancers actually do and what is commonly taught — not what you believe is
            correct. &ldquo;Most teachers cue the tuck on 3&rdquo; beats &ldquo;the tuck must
            happen on 3.&rdquo;
          </li>
          <li>
            When scenes disagree, say so. Disagreement is information, not a problem to resolve.
          </li>
          <li>
            Prefer video evidence over assertion — link a clip with timestamps.
          </li>
        </ul>

        <h2>Roles, not genders</h2>
        <ul>
          <li>
            Write about <strong>leaders</strong> and <strong>followers</strong> — never assume the
            gender of either. Anyone can dance either role, and at most events plenty of people do.
          </li>
          <li>
            Use <em>they/them</em> for a generic dancer: &ldquo;the follower turns under
            <em> their</em> own arm,&rdquo; not &ldquo;under <em>her</em> arm.&rdquo;
          </li>
          <li>
            Terms like &ldquo;the man&apos;s side&rdquo; or &ldquo;the ladies&apos; line&rdquo;
            appear in older curricula — if a historical name matters, record it as an alias and
            explain it, but write the description itself in role language.
          </li>
          <li>
            When labeling videos, the leader/follower tags describe who danced which role in that
            clip — nothing more.
          </li>
        </ul>

        <h2>Names and aliases</h2>
        <ul>
          <li>
            Names collide across scenes and eras — that&apos;s a feature. Pick the most widely
            recognized name for the page title and list every other name you&apos;ve heard as an
            alternative name.
          </li>
          <li>
            One page per pattern. If you think two pages describe the same move, raise it in the
            discussion section rather than blanking either page.
          </li>
        </ul>

        <h2>Editing well</h2>
        <ul>
          <li>
            Leave an edit summary — one sentence about what you changed and why. Future editors
            (including future you) will thank you.
          </li>
          <li>
            Improve rather than replace. If a description has a wrong detail, fix the detail;
            wholesale rewrites erase other contributors&apos; perspectives.
          </li>
          <li>
            Disagree in the discussion thread, not by revert-warring. Every page has one.
          </li>
          <li>
            Videos of yourself or your students are welcome when they genuinely demonstrate the
            move — this is a reference, not an ad. Label dancers and events accurately.
          </li>
        </ul>

        <h2>Writing for learners</h2>
        <ul>
          <li>
            Lead with the shape (counts, geometry, connection), then technique notes, then common
            variations and mistakes. Look at{" "}
            <Link href="/moves/sugar-push" className="text-denim underline">
              Sugar Push
            </Link>{" "}
            for the house pattern.
          </li>
          <li>
            Say which counts things happen on — &ldquo;the redirection on 3&amp;4&rdquo; is
            teachable; &ldquo;then you redirect&rdquo; isn&apos;t.
          </li>
          <li>Markdown is supported: use <code>##</code> headings, lists, and bold sparingly.</li>
        </ul>

        <p>
          Questions about any of this? Start a discussion on the move page you&apos;re editing, or
          read <Link href="/about" className="text-denim underline">about the project</Link>.
        </p>
      </div>
    </div>
  );
}
