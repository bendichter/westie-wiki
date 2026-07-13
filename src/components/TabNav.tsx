import Link from "next/link";

export type TabNavItem = {
  id: string;
  label: string;
  count: number;
  href: string;
};

/** URL-driven tab bar — each tab is a link, so tab state and per-tab pagination live in the query string. */
export function TabNav({ items, activeId }: { items: TabNavItem[]; activeId: string }) {
  return (
    <div role="tablist" className="mb-6 flex gap-1 border-b border-line">
      {items.map((item) => {
        const selected = item.id === activeId;
        return (
          <Link
            key={item.id}
            role="tab"
            aria-selected={selected}
            href={item.href}
            className={`-mb-px rounded-t-md border-x border-t px-4 py-2 font-display text-sm font-semibold ${
              selected
                ? "border-line bg-paper text-ink border-b-2 border-b-amber"
                : "border-transparent text-muted hover:text-denim"
            }`}
          >
            {item.label}
            <span className={`ml-1.5 font-mono text-xs ${selected ? "text-amber" : "text-muted"}`}>
              {item.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
