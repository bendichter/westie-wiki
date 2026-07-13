import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { sponsors } from "@/db/schema";
import { AdminNav } from "@/components/AdminNav";
import { SponsorAdminForm } from "@/components/SponsorAdminForm";
import { EmptyState, PageTitle } from "@/components/ui";
import { deleteSponsor, toggleSponsor } from "@/lib/actions/sponsors";
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Sponsors admin", robots: { index: false } };

export default async function SponsorsAdminPage() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) notFound();

  const rows = db.select().from(sponsors).orderBy(asc(sponsors.position), asc(sponsors.id)).all();

  return (
    <div className="max-w-3xl">
      <PageTitle sub="Sponsor cards appear on the home page and every move page. Active sponsors show in position order; when none are active, a house ad invites new ones.">
        Sponsors
      </PageTitle>
      <AdminNav active="/admin/sponsors" />

      {rows.length === 0 ? (
        <div className="mb-8">
          <EmptyState title="No sponsors yet">
            The slot is currently showing the house ad. Add your first sponsor below.
          </EmptyState>
        </div>
      ) : (
        <ul className="mb-8 divide-y divide-line rounded-lg border border-line bg-panel">
          {rows.map((sponsor) => (
            <li key={sponsor.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-bold">{sponsor.name}</span>
                  {!sponsor.active ? (
                    <span className="rounded-full border border-line px-2 py-0.5 font-display text-xs text-muted">
                      paused
                    </span>
                  ) : null}
                </div>
                <div className="truncate font-display text-sm text-muted">
                  {sponsor.tagline || sponsor.url}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-3 font-mono text-xs text-muted">
                <span title="Click-throughs">{sponsor.clicks} clicks</span>
                <span>pos {sponsor.position}</span>
                <span>since {formatDate(sponsor.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <form action={toggleSponsor}>
                  <input type="hidden" name="sponsorId" value={sponsor.id} />
                  <button
                    type="submit"
                    className="cursor-pointer rounded-md border border-line bg-panel px-3 py-1 font-display text-xs font-semibold hover:border-denim hover:text-denim"
                  >
                    {sponsor.active ? "Pause" : "Activate"}
                  </button>
                </form>
                <form action={deleteSponsor}>
                  <input type="hidden" name="sponsorId" value={sponsor.id} />
                  <button
                    type="submit"
                    className="cursor-pointer rounded-md border border-line bg-panel px-3 py-1 font-display text-xs font-semibold text-danger hover:border-danger"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <SponsorAdminForm />
    </div>
  );
}
