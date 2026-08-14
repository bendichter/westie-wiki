"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { dances, moves, reports, videoDancers, videos } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { removeDanceCascade } from "@/lib/dance-removal";
import { checkRateLimit, getCurrentUser } from "@/lib/auth";

export type ReportFormState = { error: string | null; success?: boolean };

/** Report a clip or a dance for violating the video guidelines. Any member. */
export async function reportContent(
  _prev: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!checkRateLimit(`report:${user.id}`, 10)) {
    return { error: "Too many reports in a short time. Try again later." };
  }

  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500);
  if (reason.length < 5) return { error: "Say briefly what the problem is." };

  const videoId = Number(formData.get("videoId"));
  const danceId = Number(formData.get("danceId"));

  let targetLabel: string;
  let target: { videoId?: number; danceId?: number };

  if (Number.isInteger(videoId) && videoId > 0) {
    const row = db
      .select({ youtubeId: videos.youtubeId, moveName: moves.name })
      .from(videos)
      .innerJoin(moves, eq(moves.id, videos.moveId))
      .where(eq(videos.id, videoId))
      .get();
    if (!row) return { error: "This clip no longer exists." };
    targetLabel = `Clip on "${row.moveName}" (youtube:${row.youtubeId})`;
    target = { videoId };
  } else if (Number.isInteger(danceId) && danceId > 0) {
    const dance = db.select().from(dances).where(eq(dances.id, danceId)).get();
    if (!dance) return { error: "This dance no longer exists." };
    targetLabel = `Dance "${dance.title ?? dance.slug}" (youtube:${dance.youtubeId})`;
    target = { danceId };
  } else {
    return { error: "Nothing to report." };
  }

  const alreadyOpen = db
    .select({ id: reports.id })
    .from(reports)
    .where(
      and(
        target.videoId ? eq(reports.videoId, target.videoId) : eq(reports.danceId, target.danceId!),
        eq(reports.reporterId, user.id),
        isNull(reports.resolvedAt)
      )
    )
    .get();
  if (alreadyOpen) return { error: null, success: true }; // idempotent: already reported

  db.insert(reports)
    .values({
      videoId: target.videoId ?? null,
      danceId: target.danceId ?? null,
      targetLabel,
      reason,
      reporterId: user.id,
      createdAt: Date.now(),
    })
    .run();

  revalidatePath("/admin/moderation");
  return { error: null, success: true };
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) throw new Error("FORBIDDEN");
  return user!;
}

/** Resolve a report: dismiss it, or remove the reported content entirely. */
export async function resolveReport(formData: FormData): Promise<void> {
  await requireAdmin();
  const reportId = Number(formData.get("reportId"));
  const action = String(formData.get("resolution"));
  if (action !== "removed" && action !== "dismissed") return;

  const report = db.select().from(reports).where(eq(reports.id, reportId)).get();
  if (!report || report.resolvedAt != null) return;

  const now = Date.now();

  if (action === "removed") {
    if (report.videoId != null) {
      const videoId = report.videoId;
      // resolve every open report on this clip, detach FKs, then delete it
      db.update(reports)
        .set({ resolvedAt: now, resolution: "removed", videoId: null })
        .where(and(eq(reports.videoId, videoId), isNull(reports.resolvedAt)))
        .run();
      // detach already-resolved reports too, or the delete hits their FK
      db.update(reports).set({ videoId: null }).where(eq(reports.videoId, videoId)).run();
      db.delete(videoDancers).where(eq(videoDancers.videoId, videoId)).run();
      db.delete(videos).where(eq(videos.id, videoId)).run();
    } else if (report.danceId != null) {
      removeDanceCascade(report.danceId, now);
    }
    revalidatePath("/dances");
    revalidatePath("/moves", "layout");
  } else {
    db.update(reports)
      .set({ resolvedAt: now, resolution: "dismissed" })
      .where(eq(reports.id, reportId))
      .run();
  }

  revalidatePath("/admin/moderation");
}
