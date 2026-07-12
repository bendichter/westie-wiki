export type DiffOp = { type: "equal" | "add" | "del"; text: string };

/**
 * Above this many LCS table cells (after prefix/suffix trimming) we skip the
 * fine-grained diff — the table is O(n·m) memory, and adversarial inputs
 * (thousands of one-char lines) could otherwise allocate GBs per request.
 */
const MAX_LCS_CELLS = 1_000_000;

/**
 * Line-based diff via LCS. Returns ops in document order; "del" lines come
 * from `a`, "add" lines from `b`. Common prefix/suffix are matched first, and
 * pathologically large middles degrade to a coarse replace-block diff.
 */
export function diffLines(a: string, b: string): DiffOp[] {
  const aLines = a === "" ? [] : a.split("\n");
  const bLines = b === "" ? [] : b.split("\n");

  // trim common prefix and suffix — the usual case for wiki edits
  let start = 0;
  while (start < aLines.length && start < bLines.length && aLines[start] === bLines[start]) start++;
  let aEnd = aLines.length;
  let bEnd = bLines.length;
  while (aEnd > start && bEnd > start && aLines[aEnd - 1] === bLines[bEnd - 1]) {
    aEnd--;
    bEnd--;
  }

  const aMid = aLines.slice(start, aEnd);
  const bMid = bLines.slice(start, bEnd);
  const prefix: DiffOp[] = aLines.slice(0, start).map((text) => ({ type: "equal", text }));
  const suffix: DiffOp[] = aLines.slice(aEnd).map((text) => ({ type: "equal", text }));

  let middle: DiffOp[];
  if ((aMid.length + 1) * (bMid.length + 1) > MAX_LCS_CELLS) {
    // coarse fallback: whole middle replaced
    middle = [
      ...aMid.map((text): DiffOp => ({ type: "del", text })),
      ...bMid.map((text): DiffOp => ({ type: "add", text })),
    ];
  } else {
    middle = lcsDiff(aMid, bMid);
  }

  return [...prefix, ...middle, ...suffix];
}

function lcsDiff(aLines: string[], bLines: string[]): DiffOp[] {
  const n = aLines.length;
  const m = bLines.length;

  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] =
        aLines[i] === bLines[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (aLines[i] === bLines[j]) {
      ops.push({ type: "equal", text: aLines[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      ops.push({ type: "del", text: aLines[i] });
      i++;
    } else {
      ops.push({ type: "add", text: bLines[j] });
      j++;
    }
  }
  while (i < n) ops.push({ type: "del", text: aLines[i++] });
  while (j < m) ops.push({ type: "add", text: bLines[j++] });
  return ops;
}
