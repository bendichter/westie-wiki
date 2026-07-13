/** Human label for where an instructional link lives, from its hostname. */
export function platformLabel(url: string): string {
  let host: string;
  try {
    host = new URL(url).hostname.replace(/^www\.|^m\./, "");
  } catch {
    return "link";
  }
  if (host === "youtube.com" || host === "youtu.be" || host === "youtube-nocookie.com") return "YouTube";
  if (host === "instagram.com") return "Instagram";
  if (host === "facebook.com" || host === "fb.watch" || host === "fb.com") return "Facebook";
  if (host === "tiktok.com") return "TikTok";
  if (host === "vimeo.com") return "Vimeo";
  if (host.endsWith(".patreon.com") || host === "patreon.com") return "Patreon";
  return host;
}
