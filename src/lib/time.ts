/**
 * Parse a human timestamp into seconds.
 * Accepts "83", "1:23", "1:02:03", "1m23s", "83s", "1h2m3s".
 * Returns null for unparseable input.
 */
export function parseTimestamp(input: string): number | null {
  const s = input.trim().toLowerCase();
  if (s === "") return null;

  if (/^\d+$/.test(s)) return parseInt(s, 10);

  const colon = s.match(/^(?:(\d+):)?(\d{1,2}):(\d{2})$/);
  if (colon) {
    const [, h, m, sec] = colon;
    const mins = parseInt(m, 10);
    const secs = parseInt(sec, 10);
    if (secs >= 60 || (h !== undefined && mins >= 60)) return null;
    return (h ? parseInt(h, 10) * 3600 : 0) + mins * 60 + secs;
  }

  const units = s.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);
  if (units && (units[1] || units[2] || units[3])) {
    return (
      (units[1] ? parseInt(units[1], 10) * 3600 : 0) +
      (units[2] ? parseInt(units[2], 10) * 60 : 0) +
      (units[3] ? parseInt(units[3], 10) : 0)
    );
  }

  return null;
}

/** Format seconds as "m:ss" or "h:mm:ss". */
export function formatTimestamp(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const ss = String(s).padStart(2, "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${ss}`;
  return `${m}:${ss}`;
}
