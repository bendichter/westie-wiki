import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { sponsors } from "@/db/schema";

/**
 * Transparent sponsor cards. When no sponsors are active, shows a house ad
 * inviting them — the site's own solicitation.
 */
export function SponsorSlot({ limit = 2 }: { limit?: number }) {
  const active = db
    .select()
    .from(sponsors)
    .where(eq(sponsors.active, 1))
    .orderBy(asc(sponsors.position), asc(sponsors.id))
    .limit(limit)
    .all();

  if (active.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-panel/60 p-4">
        <div className="mb-1 font-display text-[10px] font-bold uppercase tracking-widest text-muted">
          Sponsor
        </div>
        <p className="font-display text-sm text-ink-soft">
          Your event, shoes, or classes in front of dancers who are actively learning.{" "}
          <Link href="/sponsor" className="text-denim underline">
            Sponsor Westie Wiki
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {active.map((sponsor) => (
        <div key={sponsor.id} className="rounded-lg border border-line bg-panel p-4">
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <span className="font-display text-[10px] font-bold uppercase tracking-widest text-muted">
              Sponsor
            </span>
            <Link href="/sponsor" className="font-display text-[10px] text-muted hover:text-denim hover:underline">
              why ads?
            </Link>
          </div>
          <a
            href={`/s/${sponsor.id}`}
            target="_blank"
            rel="noopener sponsored"
            className="font-display font-bold text-denim hover:underline"
          >
            {sponsor.name}
          </a>
          {sponsor.tagline ? (
            <p className="mt-0.5 font-display text-sm text-ink-soft">{sponsor.tagline}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
