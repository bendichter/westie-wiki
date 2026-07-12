import type { MetadataRoute } from "next";

// the Docker build runs against a throwaway DB — always render from live data
export const dynamic = "force-dynamic";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { curricula, dancers, dances, events, moves } from "@/db/schema";

const BASE = "https://westie.wiki";

export default function sitemap(): MetadataRoute.Sitemap {
  const statics: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/moves`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/dances`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/dancers`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/events`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE}/curricula`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/guidelines`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/sponsor`, changeFrequency: "monthly", priority: 0.2 },
  ];

  const moveEntries: MetadataRoute.Sitemap = db
    .select({ slug: moves.slug, updatedAt: moves.updatedAt })
    .from(moves)
    .where(eq(moves.deleted, 0))
    .all()
    .map((m) => ({
      url: `${BASE}/moves/${m.slug}`,
      lastModified: new Date(m.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const danceEntries: MetadataRoute.Sitemap = db
    .select({ slug: dances.slug, createdAt: dances.createdAt })
    .from(dances)
    .all()
    .map((d) => ({
      url: `${BASE}/dances/${d.slug}`,
      lastModified: new Date(d.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const dancerEntries: MetadataRoute.Sitemap = db
    .select({ slug: dancers.slug })
    .from(dancers)
    .all()
    .map((d) => ({
      url: `${BASE}/dancers/${d.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));

  const eventEntries: MetadataRoute.Sitemap = db
    .select({ slug: events.slug })
    .from(events)
    .all()
    .map((e) => ({
      url: `${BASE}/events/${e.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    }));

  const curriculumEntries: MetadataRoute.Sitemap = db
    .select({ slug: curricula.slug, updatedAt: curricula.updatedAt })
    .from(curricula)
    .where(eq(curricula.deleted, 0))
    .all()
    .map((c) => ({
      url: `${BASE}/curricula/${c.slug}`,
      lastModified: new Date(c.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  return [
    ...statics,
    ...moveEntries,
    ...danceEntries,
    ...curriculumEntries,
    ...dancerEntries,
    ...eventEntries,
  ];
}
