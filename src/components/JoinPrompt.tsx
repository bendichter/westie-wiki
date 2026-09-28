"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
