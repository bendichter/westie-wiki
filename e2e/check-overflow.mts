import { createHash } from "node:crypto";
import Database from "better-sqlite3";
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const PATHS = ["/", "/dances", "/moves", "/dances/test-dance", "/moves/sugar-push", "/changes", "/about", "/events", "/dancers", "/curricula", "/profile", "/loop", "/loop?v=GGi2Rkf-15g&start=15&end=19"];
const WIDTHS = [320, 360, 375, 390, 414];

// seed a session for the archivist user so logged-in UI renders
const db = new Database("data/wcs-wiki.db");
const token = "overflow-check-token";
const id = createHash("sha256").update(token).digest("hex");
db.prepare("INSERT OR REPLACE INTO sessions (id, user_id, expires_at) VALUES (?, 1, ?)").run(id, Date.now() + 3600_000);

const browser = await chromium.launch();
let anyOverflow = false;
for (const loggedIn of [false, true]) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  if (loggedIn) {
    await context.addCookies([{ name: "wcs_session", value: token, url: BASE }]);
  }
  const page = await context.newPage();
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of PATHS) {
      await page.goto(BASE + path, { waitUntil: "load" });
      await page.waitForTimeout(400);
      // open the edit-details panel too when present
      const editBtn = page.getByRole("button", { name: "Edit details" });
      if ((await editBtn.count()) > 0) await editBtn.click();
      const r = await page.evaluate(() => {
        const doc = document.documentElement;
        const overflow = doc.scrollWidth - doc.clientWidth;
        const bad: string[] = [];
        if (overflow > 0) {
          document.querySelectorAll("*").forEach((el) => {
            const b = el.getBoundingClientRect();
            if (b.width > 0 && b.right > doc.clientWidth + 1) {
              bad.push(`${el.tagName}.${String((el as HTMLElement).className || "").slice(0, 60)} right=${Math.round(b.right)}`);
            }
          });
        }
        return { overflow, bad: bad.slice(0, 5) };
      });
      if (r.overflow > 0) {
        anyOverflow = true;
        console.log(`${loggedIn ? "AUTH" : "anon"} ${width}px ${path} OVERFLOW ${r.overflow}px`, r.bad.join(" | "));
      }
    }
  }
  await context.close();
}
if (!anyOverflow) console.log("no horizontal overflow found at any width");
await browser.close();
db.prepare("DELETE FROM sessions WHERE id = ?").run(id);
db.close();
