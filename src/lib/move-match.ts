// Client-safe move name matching for pickers. The server resolves names the
// same way (see findMoveByName), so what the picker accepts is what saves.

export type MoveOption = { name: string; aliases: string[] };
export type MoveMatch = { name: string; alias: string | null };

/**
 * The canonical name for typed text: a case-insensitive name match, or an
 * alias that belongs to exactly one move. Null when nothing matches.
 */
export function resolveMoveName(options: MoveOption[], text: string): string | null {
  const q = text.trim().toLowerCase();
  if (!q) return null;
  const byName = options.find((o) => o.name.toLowerCase() === q);
  if (byName) return byName.name;
  const byAlias = options.filter((o) => o.aliases.some((a) => a.toLowerCase() === q));
  return byAlias.length === 1 ? byAlias[0].name : null;
}

// lower is better: the whole string starts with the query, then a later word
// does, then the query appears anywhere
function score(candidate: string, q: string): number | null {
  const c = candidate.toLowerCase();
  if (c.startsWith(q)) return 0;
  if (c.split(/[\s\-/(]+/).some((w) => w.startsWith(q))) return 1;
  if (c.includes(q)) return 2;
  return null;
}

/**
 * Moves matching the typed text, best first. Names outrank aliases, so an
 * alias match only shows when the move's own name doesn't match. An empty
 * query lists every move.
 */
export function matchMoves(options: MoveOption[], text: string): MoveMatch[] {
  const q = text.trim().toLowerCase();
  if (!q) return options.map((o) => ({ name: o.name, alias: null }));
  const ranked: { match: MoveMatch; rank: number }[] = [];
  for (const o of options) {
    const nameScore = score(o.name, q);
    if (nameScore != null) {
      ranked.push({ match: { name: o.name, alias: null }, rank: nameScore });
      continue;
    }
    let best: { alias: string; rank: number } | null = null;
    for (const a of o.aliases) {
      const s = score(a, q);
      if (s != null && (best == null || s < best.rank)) best = { alias: a, rank: s };
    }
    if (best) ranked.push({ match: { name: o.name, alias: best.alias }, rank: best.rank + 0.5 });
  }
  ranked.sort((x, y) => x.rank - y.rank || x.match.name.localeCompare(y.match.name));
  return ranked.map((r) => r.match);
}
