/**
 * Extract a YouTube video id from a URL or a bare id.
 * Supports youtube.com/watch?v=, youtu.be/, youtube.com/shorts/, /embed/, /live/.
 * Also returns the start time if the URL carries t= / start=.
 */
export function parseYoutubeUrl(input: string): { id: string; startSec: number | null } | null {
  const trimmed = input.trim();

  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return { id: trimmed, startSec: null };

  let url: URL;
  try {
    url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\.|^m\./, "");
  let id: string | null = null;

  if (host === "youtu.be") {
    id = url.pathname.slice(1).split("/")[0] || null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      id = url.searchParams.get("v");
    } else {
      const m = url.pathname.match(/^\/(?:shorts|embed|live|v)\/([A-Za-z0-9_-]{11})/);
      if (m) id = m[1];
    }
  }

  if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null;

  const t = url.searchParams.get("t") ?? url.searchParams.get("start");
  let startSec: number | null = null;
  if (t) {
    const unitMatch = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);
    if (unitMatch && (unitMatch[1] || unitMatch[2] || unitMatch[3])) {
      startSec =
        (unitMatch[1] ? parseInt(unitMatch[1], 10) * 3600 : 0) +
        (unitMatch[2] ? parseInt(unitMatch[2], 10) * 60 : 0) +
        (unitMatch[3] ? parseInt(unitMatch[3], 10) : 0);
    }
  }

  return { id, startSec };
}

export function youtubeEmbedUrl(id: string, startSec: number, endSec: number | null): string {
  const params = new URLSearchParams({ rel: "0" });
  if (startSec > 0) params.set("start", String(startSec));
  if (endSec != null && endSec > startSec) params.set("end", String(endSec));
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export function youtubeWatchUrl(id: string, startSec: number): string {
  return `https://www.youtube.com/watch?v=${id}${startSec > 0 ? `&t=${startSec}s` : ""}`;
}

export function youtubeThumbnailUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/** Fetch the video title via YouTube's keyless oEmbed endpoint. Null on failure. */
export async function fetchYoutubeTitle(id: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string };
    return data.title ?? null;
  } catch {
    return null;
  }
}
