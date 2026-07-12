import { notFound } from "next/navigation";
import { OgCard, ogResponse, OG_SIZE } from "@/lib/og";
import { getAliases, getMoveBySlug, getMoveVideos } from "@/lib/data/moves";

export const alt = "West Coast Swing move on Westie Wiki";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function MoveOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const move = getMoveBySlug(slug);
  if (!move) notFound();

  const aliases = getAliases(move.id);
  const clipCount = getMoveVideos(move.id).length;
  const subtitleParts = [
    move.difficulty ?? null,
    aliases.length > 0 ? `a.k.a. ${aliases.slice(0, 2).join(", ")}` : null,
    clipCount > 0 ? `${clipCount} video clip${clipCount === 1 ? "" : "s"}` : null,
  ].filter(Boolean);

  return ogResponse(
    <OgCard
      eyebrow="West Coast Swing move"
      title={move.name}
      subtitle={subtitleParts.join("  ·  ")}
    />
  );
}
