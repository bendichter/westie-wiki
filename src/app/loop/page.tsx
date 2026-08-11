import type { Metadata } from "next";
import { LoopPlayer } from "@/components/LoopPlayer";
import { PageTitle } from "@/components/ui";
import { parseTimestamp } from "@/lib/time";

export const metadata: Metadata = {
  title: "Loop",
  description: "Loop any stretch of a YouTube video at full, half, or quarter speed.",
};

export default async function LoopPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string; start?: string; end?: string; rate?: string }>;
}) {
  const { v, start: startRaw, end: endRaw, rate: rateRaw } = await searchParams;
  const videoId = v && /^[A-Za-z0-9_-]{11}$/.test(v) ? v : null;
  const start = startRaw != null ? parseTimestamp(startRaw) : null;
  const end = endRaw != null ? parseTimestamp(endRaw) : null;
  const rate = rateRaw === "1" ? 1 : rateRaw === "0.5" ? 0.5 : rateRaw === "0.25" ? 0.25 : null;
  const coherent = videoId != null && start != null && end != null && end > start;

  return (
    <div className="max-w-4xl">
      <PageTitle sub="Paste any YouTube link, mark a start and an end, and run that stretch of tape on repeat — full, half, or quarter speed. Nothing is saved; the link is the state.">
        Loop a clip
      </PageTitle>
      <LoopPlayer
        initialVideoId={videoId}
        initialStartSec={videoId != null ? start : null}
        initialEndSec={videoId != null ? end : null}
        initialRate={coherent ? rate : null}
      />
    </div>
  );
}
