"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/dances", label: "Dances" },
  { href: "/moves", label: "Moves" },
  { href: "/dancers", label: "Dancers" },
  { href: "/loop", label: "Loop" },
  { href: "/curricula", label: "Curricula" },
  { href: "/search", label: "Search" },
];

/** Phone-width nav: a hamburger toggle plus an in-flow panel of links that
 * wraps onto its own row of the header band. Hidden at sm and up. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // close the panel after navigating (state adjustment during render, per the
  // React docs pattern, instead of a cascading effect)
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        className="sm:hidden order-3 -mr-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-paper/90 hover:text-paper"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          {open ? (
            <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </button>
      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Site"
          className="sm:hidden order-last w-full border-t border-ink-soft font-display text-sm"
        >
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`block py-3 underline-offset-4 ${
                  active ? "text-paper underline" : "text-paper/80 hover:text-paper hover:underline"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </>
  );
}
