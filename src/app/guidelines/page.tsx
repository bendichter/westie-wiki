import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Contribution guidelines" };

export default function GuidelinesPage() {
  return (
    <div className="max-w-3xl">
      <PageTitle sub="How to write pages that serve every dancer who reads them.">
        Contribution guidelines
      </PageTitle>

      <div className="prose-wcs !max-w-none space-y-4">
        <p>
          These aren&apos;t rules enforced by software: they&apos;re the habits that keep a
          community wiki useful. When in doubt, edit boldly; everything is versioned and nothing
          is ever lost.
        </p>

        <h2>Describe, don&apos;t prescribe</h2>
        <ul>
          <li>
            Write what dancers actually do and what is commonly taught, not what you believe is
            correct. &ldquo;Most teachers cue the tuck on 3&rdquo; beats &ldquo;the tuck must
            happen on 3.&rdquo;
          </li>
          <li>
            When scenes disagree, say so. Disagreement is information, not a problem to resolve.
          </li>
          <li>
            Prefer video evidence over assertion: link a clip with timestamps.
          </li>
        </ul>

        <h2>Roles, not genders</h2>
        <ul>
          <li>
            Write about <strong>leaders</strong> and <strong>followers</strong>. Never assume the
            gender of either. Anyone can dance either role, and at most events plenty of people do.
          </li>
          <li>
            Use <em>they/them</em>{" "}
            for a generic dancer: &ldquo;the follower turns under <em>their</em>{" "}
            own arm,&rdquo; not &ldquo;under <em>her</em>{" "}arm.&rdquo;
          </li>
          <li>
            Terms like &ldquo;the man&apos;s side&rdquo; or &ldquo;the ladies&apos; line&rdquo;
            appear in older curricula. If a historical name matters, record it as an alias and
            explain it, but write the description itself in role language.
          </li>
          <li>
            When labeling videos, the leader/follower tags describe who danced which role in that
            clip, nothing more.
          </li>
        </ul>

        <h2>Words we use</h2>
        <ul>
          <li>
            A <strong>move</strong> is anything with a page here: patterns, elements, footwork
            units, styling. A <strong>pattern</strong> means specifically a led figure with
            counts, so a whip is a pattern but swivels are not. Use whichever is accurate in
            your writing.
          </li>
          <li>
            A <strong>clip</strong> is a timestamped video segment showing a move, whether added
            directly to a move page or by marking a move in a dance.
          </li>
        </ul>

        <h2>Variants: parameters vs. patterns</h2>
        <ul>
          <li>
            Handholds and minor parameterizations (two-hand vs. right-to-left vs.
            right-to-right, one-hand styling, a different exit) belong in a{" "}
            <strong>&ldquo;Common variations&rdquo; section of the move&apos;s description</strong>:
            they&apos;re parameters of the pattern, not new patterns.
          </li>
          <li>
            When a clip shows a specific variant, say so in the clip&apos;s{" "}
            <strong>note</strong> (&ldquo;two-hand hold&rdquo;, &ldquo;R2R, hand-change
            exit&rdquo;). Notes show on the clip card, so learners can find an example of the
            exact variant.
          </li>
          <li>
            A variant earns its <em>own page</em> only when it has its own skeleton: new
            geometry, counts, or skill (Basket Whip yes; two-hand sugar push no). Link it with a
            variation-of relation.
          </li>
        </ul>

        <h2>Names and aliases</h2>
        <ul>
          <li>
            Names collide across scenes and eras. That&apos;s a feature. Pick the most widely
            recognized name for the page title and list every other name you&apos;ve heard as an
            alternative name.
          </li>
          <li>
            One page per pattern. If you think two pages describe the same move, raise it in the
            discussion section rather than blanking either page.
          </li>
        </ul>

        <h2 id="which-dances" className="scroll-mt-4">
          Which dances to register
        </h2>
        <ul>
          <li>
            Register <strong>competition spotlights only</strong>: moments where one couple
            dances alone for the crowd, like Jack &amp; Jill and Strictly finals in spotlight
            format, routines, and showcases. Social-floor footage and all-skate heats, where
            nobody chose to be featured, don&apos;t belong here.
          </li>
          <li>
            You can always register a dance <strong>you danced in yourself</strong>.
          </li>
          <li>
            You can register spotlights of <strong>All-Star and Champion</strong> dancers
            without asking: dancing a spotlight at that level is a public performance, and
            studying those dances is what this site is for.
          </li>
          <li>
            For dancers <strong>below All-Star</strong>, get permission from both dancers before
            registering their dance. A newcomer or novice spotlight is often a personal memory,
            not a performance they expect to be studied move by move.
          </li>
          <li>
            The consent rules below apply on top of all of this: the video itself must still
            come from one of the dancers or from the event.
          </li>
        </ul>

        <h2>Video consent</h2>
        <ul>
          <li>
            Only link a video if it was <strong>uploaded by one of the dancers in it or by the
            event</strong>{" "}where it was filmed, or if you have the dancer&apos;s explicit
            permission. Someone else&apos;s upload of someone else&apos;s dancing doesn&apos;t
            qualify, even when it&apos;s public.
          </li>
          <li>
            Instructional videos that were properly shared on YouTube by their creators are
            welcome for explaining a move: tutorials are published to be watched. Cite them in
            a move&apos;s &ldquo;Learn more&rdquo; section or link them as clips.
          </li>
          <li>
            <strong>Don&apos;t link workshop recaps.</strong>{" "}Recap videos are recorded for the
            attendees&apos; personal review and are generally not meant to be shared. That
            stays true even when someone has uploaded one publicly.
          </li>
          <li>
            See a video that breaks these rules? Use the <strong>Report</strong> link on the
            clip or dance. Admins review every report. And if you appear in a linked video and
            want it removed, report it or say so in the discussion thread. It will be taken
            down, no questions asked.
          </li>
        </ul>

        <h2>Editing well</h2>
        <ul>
          <li>
            Leave an edit summary: one sentence about what you changed and why. Future editors
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
            move. This is a reference, not an ad. Label dancers and events accurately.
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
            Say which counts things happen on: &ldquo;the redirection on 3&amp;4&rdquo; is
            teachable; &ldquo;then you redirect&rdquo; isn&apos;t.
          </li>
          <li>Markdown is supported: use <code>##</code> headings, lists, and bold sparingly.</li>
          <li>
            Cross-link other moves inline with double brackets: <code>[[Sugar Push]]</code> links
            the move by name (aliases work too), and <code>[[Sugar Push|sugar pushes]]</code>{" "}
            customizes the shown text. Unknown names render as plain text, so links never break.
          </li>
          <li>
            Cite specific claims Wikipedia-style with footnotes: write{" "}
            <code>most teachers cue the tuck on 3[^1]</code> in the text, and{" "}
            <code>[^1]: Skippy Blair, Dance Terminology Notebook</code> (links welcome) on its
            own line at the bottom of the description.
          </li>
        </ul>

        <p>
          Questions about any of this? Start a discussion on the move page you&apos;re editing, or
          read <Link href="/about" className="text-denim underline">about the project</Link>.
        </p>
      </div>
    </div>
  );
}
