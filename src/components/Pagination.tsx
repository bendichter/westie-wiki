import Link from "next/link";

/**
 * Query-param-preserving pagination controls. Renders nothing when there is
 * only one page.
 */
export function Pagination({
  page,
  totalPages,
  basePath,
  params,
  preserveScroll,
  paramName = "page",
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params: Record<string, string | undefined>;
  /** keep the current scroll position on navigation (for mid-page sections) */
  preserveScroll?: boolean;
  /** query param carrying the page number — override when several paginated
   *  sections share one URL */
  paramName?: string;
}) {
  if (totalPages <= 1) return null;
  const scroll = !preserveScroll;

  const href = (p: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
    if (p > 1) qs.set(paramName, String(p));
    else qs.delete(paramName);
    const s = qs.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  // window of page numbers around the current page
  const windowStart = Math.max(1, Math.min(page - 2, totalPages - 4));
  const windowEnd = Math.min(totalPages, windowStart + 4);
  const numbers = [];
  for (let p = windowStart; p <= windowEnd; p++) numbers.push(p);

  const linkClass =
    "rounded-md border border-line bg-panel px-3 py-1.5 font-display text-sm hover:border-denim hover:text-denim";
  const currentClass =
    "rounded-md border border-denim bg-denim px-3 py-1.5 font-display text-sm text-white";

  return (
    <nav className="mt-6 flex flex-wrap items-center gap-2" aria-label="Pagination">
      {page > 1 ? (
        <Link href={href(page - 1)} scroll={scroll} className={linkClass} rel="prev">
          ← Prev
        </Link>
      ) : null}
      {windowStart > 1 ? (
        <>
          <Link href={href(1)} scroll={scroll} className={linkClass}>1</Link>
          {windowStart > 2 ? <span className="text-muted px-1">…</span> : null}
        </>
      ) : null}
      {numbers.map((p) =>
        p === page ? (
          <span key={p} className={currentClass} aria-current="page">
            {p}
          </span>
        ) : (
          <Link key={p} href={href(p)} scroll={scroll} className={linkClass}>
            {p}
          </Link>
        )
      )}
      {windowEnd < totalPages ? (
        <>
          {windowEnd < totalPages - 1 ? <span className="text-muted px-1">…</span> : null}
          <Link href={href(totalPages)} scroll={scroll} className={linkClass}>{totalPages}</Link>
        </>
      ) : null}
      {page < totalPages ? (
        <Link href={href(page + 1)} scroll={scroll} className={linkClass} rel="next">
          Next →
        </Link>
      ) : null}
    </nav>
  );
}

export function clampPage(raw: string | undefined, totalPages: number): number {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return 1;
  return Math.min(n, Math.max(1, totalPages));
}
