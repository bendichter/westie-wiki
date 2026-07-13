import { getMoveLinkIndex } from "@/lib/data/moves";
import { linkifyMoves } from "@/lib/move-links";
import { Markdown } from "./Markdown";

/**
 * Markdown with [[Move Name]] cross-links resolved against the live move
 * catalog. Server-only (hits the DB); pass selfSlug on a move's own page so
 * self-references render as plain text instead of circular links.
 */
export function MoveMarkdown({ children, selfSlug }: { children: string; selfSlug?: string }) {
  if (!children.trim()) return null;
  return <Markdown>{linkifyMoves(children, getMoveLinkIndex(), selfSlug)}</Markdown>;
}
