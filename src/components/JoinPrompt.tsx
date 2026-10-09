"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ButtonLink } from "./ui";

/**
 * "Join or log in to …" for logged-out visitors. Most people reading a
 * prompt like this don't have an account yet, so signup comes first, and
 * both links bring them back to the page they were on.
 */
export function JoinPrompt({
  children,
  className,
  returnQuery = "",
}: {
  children: React.ReactNode;
  className?: string;
  /** Appended to the return path, e.g. "?mark=1" to reopen a panel. */
  returnQuery?: string;
}) {
  const pathname = usePathname();
  const next = pathname ? `?next=${encodeURIComponent(pathname + returnQuery)}` : "";
  return (
    <p className={className ?? "font-display text-sm text-muted"}>
      <Link href={`/signup${next}`} className="font-semibold text-denim underline">
        Join the wiki
      </Link>{" "}
      (free) or{" "}
      <Link href={`/login${next}`} className="text-denim underline">
        log in
      </Link>{" "}
      {children}
    </p>
  );
}

/**
 * The same invitation as a panel with a button, for the pages where joining
 * is the main thing a logged-out visitor can do next.
 */
export function JoinCallout({
  title,
  action,
  children,
  returnQuery = "",
}: {
  title: string;
  /** Button label, e.g. "Join to mark moves". */
  action: string;
  children: React.ReactNode;
  returnQuery?: string;
}) {
  const pathname = usePathname();
  const next = pathname ? `?next=${encodeURIComponent(pathname + returnQuery)}` : "";
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-lg border border-amber/40 bg-amber/10 px-4 py-3">
      <div className="min-w-0 flex-1 basis-64">
        <h2 className="font-display text-base font-bold">{title}</h2>
        <p className="mt-0.5 font-display text-sm text-ink-soft">{children}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 font-display text-sm text-ink-soft">
        <ButtonLink href={`/signup${next}`}>{action}</ButtonLink>
        <span>
          Free, or{" "}
          <Link href={`/login${next}`} className="text-denim underline">
            log in
          </Link>
        </span>
      </div>
    </div>
  );
}
