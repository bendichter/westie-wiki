import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MoveMarkdown } from "@/components/MoveMarkdown";
import { VideoCard } from "@/components/VideoCard";
import { ButtonLink, DifficultyBadge, EmptyState } from "@/components/ui";
import { toggleLearned } from "@/lib/actions/community";
import { getCurrentUser } from "@/lib/auth";
import {
  getCurriculumBySlug,
  getCurriculumSteps,
  getLatestCurriculumRevisionNo,
  getLearnedMoveIds,
} from "@/lib/data/curricula";
import { timeAgo } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const curriculum = getCurriculumBySlug(slug);
  if (!curriculum) return { title: "Curriculum not found" };
  return {
    title: `${curriculum.title} — West Coast Swing learning path`,
    description: curriculum.description.replace(/[#*_`>\n]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 160),
    alternates: { canonical: `/curricula/${curriculum.slug}` },
  };
}

export default async function CurriculumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const curriculum = getCurriculumBySlug(slug);
  if (!curriculum) notFound();

  const user = await getCurrentUser();
  const steps = getCurriculumSteps(curriculum.id);
  const learnedIds = user ? getLearnedMoveIds(user.id, curriculum.id) : new Set<number>();
  const learnedCount = steps.filter((s) => learnedIds.has(s.move.id)).length;
  const pct = steps.length > 0 ? Math.round((learnedCount / steps.length) * 100) : 0;
  const revisionCount = getLatestCurriculumRevisionNo(curriculum.id);

  return (
    <div className="max-w-3xl">
      {/* header */}
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl sm:text-4xl font-bold">{curriculum.title}</h1>
          <p className="text-sm text-muted font-display mt-1">
            {steps.length} move{steps.length === 1 ? "" : "s"} · updated {timeAgo(curriculum.updatedAt)} ·{" "}
            <Link href={`/curricula/${curriculum.slug}/history`} className="text-denim hover:underline">
              {revisionCount} revision{revisionCount === 1 ? "" : "s"}
            </Link>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <ButtonLink href={`/curricula/${curriculum.slug}/edit`} variant="secondary">
            Edit
          </ButtonLink>
          <ButtonLink href={`/curricula/${curriculum.slug}/history`} variant="secondary">
            History
          </ButtonLink>
        </div>
      </div>

      <div className="slot-line mt-4" aria-hidden />

      {curriculum.description ? (
        <div className="mt-5">
          <MoveMarkdown>{curriculum.description}</MoveMarkdown>
        </div>
      ) : null}

      {/* progress */}
      {user && steps.length > 0 ? (
        <div className="mt-6 bg-panel border border-line rounded-lg px-4 py-3">
          <div className="flex justify-between font-mono text-xs text-muted mb-1.5">
            <span>your progress</span>
            <span>
              {learnedCount}/{steps.length} learned ({pct}%)
            </span>
          </div>
          <div className="h-2 bg-line rounded-full overflow-hidden">
            <div className="h-full bg-amber rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      ) : null}
      {!user && steps.length > 0 ? (
        <p className="mt-6 text-sm text-muted font-display">
          <Link href={`/login?next=/curricula/${curriculum.slug}`} className="text-denim underline">
            Log in
          </Link>{" "}
          to track which moves you&apos;ve learned.
        </p>
      ) : null}

      {/* steps along the slot */}
      {steps.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No moves in this curriculum yet">
            <Link href={`/curricula/${curriculum.slug}/edit`} className="text-denim underline">
              Add the first move
            </Link>
            .
          </EmptyState>
        </div>
      ) : (
        <ol className="mt-8 relative border-l-2 border-line ml-3 space-y-8">
          {steps.map((step, index) => {
            const isLearned = learnedIds.has(step.move.id);
            return (
              <li key={step.id} className="relative pl-8">
                <span
                  className={`absolute -left-[13px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center font-mono text-[10px] font-bold ${
                    isLearned
                      ? "bg-amber border-amber text-white"
                      : "bg-paper border-line text-muted"
                  }`}
                  aria-hidden
                >
                  {isLearned ? "✓" : index + 1}
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/moves/${step.move.slug}`}
                    className="font-display text-xl font-bold text-denim hover:underline"
                  >
                    {step.move.name}
                  </Link>
                  <DifficultyBadge difficulty={step.move.difficulty} />
                  {user ? (
                    <form action={toggleLearned} className="ml-auto">
                      <input type="hidden" name="curriculumId" value={curriculum.id} />
                      <input type="hidden" name="moveId" value={step.move.id} />
                      <button
                        type="submit"
                        className={`font-display text-xs rounded-full border px-3 py-1 cursor-pointer ${
                          isLearned
                            ? "bg-amber/10 border-amber/40 text-amber hover:bg-amber/20"
                            : "bg-panel border-line text-muted hover:border-amber hover:text-amber"
                        }`}
                      >
                        {isLearned ? "✓ Learned" : "Mark learned"}
                      </button>
                    </form>
                  ) : null}
                </div>

                {step.notes ? (
                  <div className="mt-2 text-[15px] text-ink-soft bg-panel border border-line rounded-lg px-4 py-3">
                    <div className="text-[10px] uppercase tracking-widest text-muted font-display font-bold mb-1">
                      Learner notes
                    </div>
                    <MoveMarkdown>{step.notes}</MoveMarkdown>
                  </div>
                ) : null}

                {step.keyVideos.length > 0 ? (
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    {step.keyVideos.map((v) => (
                      <VideoCard key={v.id} video={v} currentUserId={null} />
                    ))}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
