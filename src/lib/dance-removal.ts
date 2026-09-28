import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { danceDancers, dances, danceSongs, reports, videoDancers, videos } from "@/db/schema";

/**
 * Hard-delete a dance and everything hanging off it: its annotation clips and
 * their dancer labels, its songs and dancer links. Reports pointing at the
 * dance or its clips are resolved as "removed" when still open, and detached
 * either way so the deletes clear their foreign keys.
 */
export function removeDanceCascade(danceId: number, now: number): void {
  // one transaction: a failure partway through must not leave half a dance
  db.transaction((tx) => {
    const annotationIds = tx
      .select({ id: videos.id })
      .from(videos)
      .where(eq(videos.danceId, danceId))
      .all()
      .map((r) => r.id);

    tx.update(reports)
      .set({ resolvedAt: now, resolution: "removed", danceId: null })
      .where(and(eq(reports.danceId, danceId), isNull(reports.resolvedAt)))
      .run();
    tx.update(reports).set({ danceId: null }).where(eq(reports.danceId, danceId)).run();

    for (const id of annotationIds) {
      tx.update(reports)
        .set({ resolvedAt: now, resolution: "removed", videoId: null })
        .where(and(eq(reports.videoId, id), isNull(reports.resolvedAt)))
        .run();
      tx.update(reports).set({ videoId: null }).where(eq(reports.videoId, id)).run();
      tx.delete(videoDancers).where(eq(videoDancers.videoId, id)).run();
      tx.delete(videos).where(eq(videos.id, id)).run();
    }

    tx.delete(danceSongs).where(eq(danceSongs.danceId, danceId)).run();
    tx.delete(danceDancers).where(eq(danceDancers.danceId, danceId)).run();
    tx.delete(dances).where(eq(dances.id, danceId)).run();
  });
}
