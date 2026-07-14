/**
 * Parse a human timestamp into seconds.
 * Accepts "83", "83.5", "1:23", "1:10.5", "1:02:03", "1m23s", "83s", "1h2m3.5s".
 * Fractional seconds are kept to one decimal place. Returns null for
 * unparseable input.
 */
export function parseTimestamp(input: string): number | null {
  const s = input.trim().toLowerCase();
  if (s === "") return null;

  const tenth = (n: number) => Math.round(n * 10) / 10;

  if (/^\d+(?:\.\d+)?$/.test(s)) return tenth(parseFloat(s));

  const colon = s.match(/^(?:(\d+):)?(\d{1,2}):(\d{2}(?:\.\d+)?)$/);
  if (colon) {
    const [, h, m, sec] = colon;
    const mins = parseInt(m, 10);
    const secs = parseFloat(sec);
    if (secs >= 60 || (h !== undefined && mins >= 60)) return null;
    return tenth((h ? parseInt(h, 10) * 3600 : 0) + mins * 60 + secs);
  }

  const units = s.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+(?:\.\d+)?)s?)?$/);
  if (units && (units[1] || units[2] || units[3])) {
    return tenth(
      (units[1] ? parseInt(units[1], 10) * 3600 : 0) +
        (units[2] ? parseInt(units[2], 10) * 60 : 0) +
        (units[3] ? parseFloat(units[3]) : 0)
    );
  }

  return null;
}

/** Format seconds as "m:ss" or "h:mm:ss", keeping one decimal when fractional. */
export function formatTimestamp(totalSec: number): string {
  const total = Math.max(0, Math.round(totalSec * 10) / 10);
  const whole = Math.floor(total);
  const frac = Math.round((total - whole) * 10);
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  const s = whole % 60;
  const ss = String(s).padStart(2, "0") + (frac > 0 ? `.${frac}` : "");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${ss}`;
  return `${m}:${ss}`;
}
