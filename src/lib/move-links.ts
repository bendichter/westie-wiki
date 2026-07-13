/**
 * Wiki-style inline cross-links between moves.
 *
 * Editors write [[Sugar Push]] or [[Sugar Push|sugar pushes]] in any
 * markdown field; names and aliases resolve case-insensitively to a
 * /moves/<slug> link. Unresolved names render as plain text so a typo
 * (or a later-deleted move) never breaks a page.
 */
export function linkifyMoves(
  markdown: string,
  index: Map<string, string>,
  selfSlug?: string
): string {
  return markdown.replace(
    /\[\[([^[\]|\n]+)(?:\|([^[\]\n]+))?\]\]/g,
    (_raw, name: string, label?: string) => {
      const slug = index.get(name.trim().toLowerCase());
      const text = (label ?? name).trim();
      if (!slug || slug === selfSlug) return text;
      return `[${text}](/moves/${slug})`;
    }
  );
}
