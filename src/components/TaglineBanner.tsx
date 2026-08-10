"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** The "descriptive, not prescriptive" strip — shown on the landing page only. */
export function TaglineBanner() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <div className="bg-denim-deep text-paper/85 text-center text-[13px] font-display py-1 px-4">
      Descriptive, not prescriptive — a learning aid built by dancers, not a source of truth about
      West Coast Swing.{" "}
      <Link href="/about" className="underline underline-offset-2 hover:text-paper">
        Read more
      </Link>
    </div>
  );
}
