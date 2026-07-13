import Link from "next/link";

const PAGES = [
  { href: "/admin/sponsors", label: "Sponsors" },
  { href: "/admin/moderation", label: "Moderation" },
  { href: "/admin/analytics", label: "Analytics" },
];

export function AdminNav({ active }: { active: string }) {
  return (
    <div className="mb-6 flex gap-1 border-b border-line">
      {PAGES.map((page) => (
        <Link
          key={page.href}
          href={page.href}
          className={`-mb-px rounded-t-md border-x border-t px-4 py-2 font-display text-sm font-semibold ${
            page.href === active
              ? "border-line bg-paper text-ink border-b-2 border-b-amber"
              : "border-transparent text-muted hover:text-denim"
          }`}
        >
          {page.label}
        </Link>
      ))}
    </div>
  );
}
