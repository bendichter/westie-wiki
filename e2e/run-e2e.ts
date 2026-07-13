/**
 * End-to-end verification: drives the real app in headless Chromium through
 * every core user flow. Run with the dev or prod server on :3000:
 *
 *   npx tsx e2e/run-e2e.ts [screenshot-dir]
 *
 * Exits non-zero on the first failed assertion.
 */
import { chromium, type Page } from "playwright";
import Database from "better-sqlite3";
import { createHash, randomBytes } from "node:crypto";
import fs from "node:fs";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const SHOTS = process.argv[2] ?? "./e2e/shots";
const run = Date.now().toString(36).slice(-5);

const user1 = { username: `tester${run}`, email: `tester${run}@example.com`, password: "password123" };
const user2 = { username: `editor${run}`, email: `editor${run}@example.com`, password: "password123" };
const moveName = `Test Move ${run.toUpperCase()}`;
const curriculumTitle = `Test Path ${run.toUpperCase()}`;

let step = "";
function log(s: string) {
  step = s;
  console.log(`▸ ${s}`);
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
}

async function expectText(page: Page, text: string) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: "visible", timeout: 15000 });
}

function cleanupPreviousRuns() {
  // dances dedupe on youtubeId and sponsors accumulate — scrub leftovers so
  // count-based assertions hold on every run
  const sqlite = new Database(process.env.DATABASE_PATH ?? "./data/wcs-wiki.db");
  sqlite.exec(`
    DELETE FROM video_dancers WHERE video_id IN (SELECT id FROM videos WHERE dance_id IS NOT NULL);
    DELETE FROM videos WHERE dance_id IS NOT NULL;
    DELETE FROM dance_dancers;
    DELETE FROM dances;
    DELETE FROM sponsors;
  `);
  sqlite.close();
}

function plantVerificationToken(email: string): string {
  const raw = randomBytes(32).toString("hex");
  const sqlite = new Database(process.env.DATABASE_PATH ?? "./data/wcs-wiki.db");
  const u = sqlite.prepare("SELECT id FROM users WHERE email = ?").get(email) as { id: number };
  sqlite.prepare("DELETE FROM email_verification_tokens WHERE user_id = ?").run(u.id);
  sqlite
    .prepare("INSERT INTO email_verification_tokens (id, user_id, expires_at) VALUES (?, ?, ?)")
    .run(createHash("sha256").update(raw).digest("hex"), u.id, Date.now() + 3600_000);
  sqlite.close();
  return raw;
}

function markVerified(email: string) {
  const sqlite = new Database(process.env.DATABASE_PATH ?? "./data/wcs-wiki.db");
  sqlite.prepare("UPDATE users SET email_verified_at = ? WHERE email = ?").run(Date.now(), email);
  sqlite.close();
}

async function main() {
  fs.mkdirSync(SHOTS, { recursive: true });
  cleanupPreviousRuns();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.setDefaultTimeout(20000);

  // --- public browsing ---
  log("home page renders with seed stats");
  await page.goto(BASE);
  await expectText(page, "The moves of West Coast Swing");
  await expectText(page, "Descriptive, not prescriptive");
  await shot(page, "01-home");

  log("moves list renders and filters");
  await page.goto(`${BASE}/moves?difficulty=beginner`);
  await expectText(page, "Sugar Push");
  await shot(page, "02-moves-browse");

  log("move page renders with videos, pattern card, relations");
  await page.goto(`${BASE}/moves/whip`);
  await expectText(page, "Basic Whip");
  await expectText(page, "Pattern card");
  await expectText(page, "Variations");
  await shot(page, "03-move-whip");

  log("SEO surfaces: sitemap, robots, OG images, structured data");
  const sitemapRes = await page.request.get(`${BASE}/sitemap.xml`);
  if (!(await sitemapRes.text()).includes("/moves/whip")) throw new Error("sitemap missing move URLs");
  const robotsRes = await page.request.get(`${BASE}/robots.txt`);
  if (!(await robotsRes.text()).includes("Disallow: /admin/")) throw new Error("robots missing admin disallow");
  for (const ogPath of ["/opengraph-image", "/moves/whip/opengraph-image"]) {
    const res = await page.request.get(`${BASE}${ogPath}`);
    if (res.status() !== 200 || !res.headers()["content-type"]?.includes("image/png")) {
      throw new Error(`OG image failed: ${ogPath} -> ${res.status()}`);
    }
  }
  const movePage = await (await page.request.get(`${BASE}/moves/whip`)).text();
  if (!movePage.includes('"@type":"Article"')) throw new Error("move page missing Article JSON-LD");

  // --- signup ---
  log("signup user1");
  await page.goto(`${BASE}/signup`);
  await page.getByLabel("Email").fill(user1.email);
  await page.getByLabel("Username").fill(user1.username);
  await page.getByLabel("Password").fill(user1.password);
  await shot(page, "04-signup");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL(`${BASE}/`);
  await expectText(page, user1.username);

  // --- email verification gate ---
  log("unverified user is blocked from editing");
  await expectText(page, "Confirm your email address to edit the wiki");
  await page.goto(`${BASE}/moves/new`);
  await page.getByLabel("Move name").fill("Blocked Move");
  await page.getByRole("button", { name: "Create move" }).click();
  await expectText(page, "Confirm your email address to edit");

  log("verification link confirms the email");
  const verifyToken = plantVerificationToken(user1.email);
  await page.goto(`${BASE}/verify-email?token=${verifyToken}`);
  await expectText(page, "Email confirmed");
  await page.goto(`${BASE}/`);
  const bannerGone = await page.getByText("Confirm your email address to edit the wiki").count();
  if (bannerGone !== 0) throw new Error("verify banner still visible after confirming");

  // --- create move ---
  log("create a move");
  await page.goto(`${BASE}/moves/new`);
  await page.getByLabel("Move name").fill(moveName);
  await page.getByLabel("Alternative names").fill("Test Alias One, Secret Handshake");
  await page.getByLabel("Difficulty").selectOption("intermediate");
  await page
    .getByLabel("Description")
    .fill("A test pattern.\n\n## Counts\n\n- 1-2 walk walk\n- 3&4 triple");
  await page.getByLabel("Tags").fill("test tag, whip family");
  await page.getByRole("button", { name: "Create move" }).click();
  await page.waitForURL(/\/moves\/test-move-/);
  await expectText(page, "Test Alias One");
  await expectText(page, "walk walk");
  const moveUrl = page.url();
  await shot(page, "05-move-created");

  // --- edit move + revision history ---
  log("edit the move");
  await page.goto(`${moveUrl}/edit`);
  await page.getByLabel("Description").fill("A test pattern, now improved.\n\n## Counts\n\n- 1-2 walk walk\n- 3&4 triple\n- 5&6 anchor");
  await page.getByLabel("Edit summary").fill("Added the anchor");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForURL(moveUrl);
  await expectText(page, "now improved");

  log("history shows 2 revisions with diff");
  await page.goto(`${moveUrl}/history`);
  await expectText(page, "Revision 2");
  await expectText(page, "Added the anchor");
  await shot(page, "06-history");
  await page.goto(`${moveUrl}/history/2`);
  await expectText(page, "Changes from revision 1");
  await expectText(page, "5&6 anchor");
  await shot(page, "07-diff");

  log("restore revision 1");
  await page.goto(`${moveUrl}/history/1`);
  await page.getByRole("button", { name: "Restore this revision" }).click();
  await page.waitForURL(moveUrl);
  const restored = await page.getByText("now improved").count();
  if (restored !== 0) throw new Error("restore did not revert description");
  await page.goto(`${moveUrl}/history`);
  await expectText(page, "Restored revision 1");

  // --- add video with labels ---
  log("add a video with timestamps, dancers, event");
  await page.goto(moveUrl);
  await page.getByRole("button", { name: "+ Add a video example" }).click();
  await page.getByLabel("YouTube link").fill("https://youtu.be/dfVpwMLqm-o?t=30");
  await page.getByLabel("Clip end").fill("1:00");
  await page.locator('input[name="dancerName"]').nth(0).fill(`Lead ${run}`);
  await page.locator('select[name="dancerRole"]').nth(0).selectOption("leader");
  await page.locator('input[name="dancerName"]').nth(1).fill(`Follow ${run}`);
  await page.locator('select[name="dancerRole"]').nth(1).selectOption("follower");
  await page.getByLabel("Event", { exact: true }).fill(`Test Event ${run.toUpperCase()}`);
  await page.getByLabel("Year").fill("2025");
  await page.getByLabel("Note").fill("Automated test clip");
  await page.getByRole("button", { name: "Add video" }).click();
  await expectText(page, "0:30 → 1:00");
  await expectText(page, `Lead ${run}`);
  await shot(page, "08-video-added");

  log("edit clip timing on an existing video");
  await page.goto(moveUrl);
  await page.getByRole("button", { name: "Edit clip" }).first().click();
  await page.getByLabel("Clip start").fill("0:10");
  await page.getByLabel("Clip end").fill("0:50");
  await page.getByRole("button", { name: "Save clip" }).click();
  await expectText(page, "0:10 → 0:50");

  log("restore original clip timing");
  await page.getByRole("button", { name: "Edit clip" }).first().click();
  await page.getByLabel("Clip start").fill("0:30");
  await page.getByLabel("Clip end").fill("1:00");
  await page.getByRole("button", { name: "Save clip" }).click();
  await expectText(page, "0:30 → 1:00");

  log("dancer page groups clips by move");
  await page.goto(`${BASE}/dancers/lead-${run}`);
  await expectText(page, moveName);
  await expectText(page, "0:30 → 1:00");
  await shot(page, "09-dancer-page");

  log("event page shows the clip");
  await page.goto(`${BASE}/events`);
  await expectText(page, `Test Event ${run.toUpperCase()}`);

  log("search finds move by alias and dancer by name");
  await page.goto(`${BASE}/search?q=Secret Handshake`);
  await expectText(page, moveName);
  await page.goto(`${BASE}/search?q=Follow ${run}`);
  await expectText(page, `Follow ${run}`);
  await shot(page, "10-search");

  log("list pages: inline search and pagination");
  await page.goto(`${BASE}/moves?q=Secret Handshake`);
  await expectText(page, moveName);
  await page.goto(`${BASE}/moves?page=2`);
  await expectText(page, "page 2 of");
  await page.goto(`${BASE}/dancers?q=Lead ${run}`);
  await expectText(page, `Lead ${run}`);
  await page.goto(`${BASE}/events?q=Test Event ${run.toUpperCase()}`);
  await expectText(page, `Test Event ${run.toUpperCase()}`);

  log("home feed counts the clip as a contribution");
  await page.goto(BASE);
  await expectText(page, "Recent contributions");
  await expectText(page, "added a video clip");

  // --- relations ---
  log("link a related move");
  await page.goto(moveUrl);
  await page.getByRole("button", { name: "+ Link a related move" }).click();
  await page.getByLabel("Relationship type").selectOption("prerequisite");
  await page.getByLabel("Related move name").fill("Whip");
  await page.getByRole("button", { name: "Link", exact: true }).click();
  await expectText(page, "Learn first");

  // --- comments + favorite ---
  log("post and delete a comment");
  await page.goto(moveUrl);
  await page.getByLabel("Comment").fill("Great test move, would dance again.");
  await page.getByRole("button", { name: "Post comment" }).click();
  await expectText(page, "would dance again");
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.waitForTimeout(1200);
  const commentGone = await page.getByText("would dance again").count();
  if (commentGone !== 0) throw new Error("comment was not deleted");

  log("favorite the move");
  await page.getByRole("button", { name: "Add to favorites" }).click();
  await page.getByRole("button", { name: "Remove from favorites" }).waitFor();

  // --- dances ---
  log("register a dance with dancers, event, competition");
  await page.goto(`${BASE}/dances/new`);
  await page.getByLabel("YouTube link").fill("https://www.youtube.com/watch?v=GGi2Rkf-15g");
  await page.locator('input[name="dancerName"]').nth(0).fill(`Lead ${run}`);
  await page.locator('select[name="dancerRole"]').nth(0).selectOption("leader");
  await page.locator('input[name="dancerName"]').nth(1).fill(`Follow ${run}`);
  await page.locator('select[name="dancerRole"]').nth(1).selectOption("follower");
  await page.getByLabel("Event", { exact: true }).fill(`Test Event ${run.toUpperCase()}`);
  await page.getByLabel("Year").fill("2025");
  await page.getByLabel("Competition").fill("Advanced Jack & Jill");
  await page.getByLabel("Song", { exact: true }).fill("Dance Song");
  await page.getByLabel("Artist", { exact: true }).fill("Dance Artist");
  await page.getByRole("button", { name: "Register and start marking" }).click();
  await page.waitForURL(/\/dances\//);
  await expectText(page, "Advanced Jack & Jill");
  const danceUrl = page.url();
  await shot(page, "15-dance-page");

  log("annotate multiple moves in the dance");
  for (const [move, start, end] of [
    ["Sugar Push", "0:15", "0:19"],
    ["Whip", "0:22", ""],
    [moveName, "0:31", "0:38"],
  ] as const) {
    await page.getByLabel("Move", { exact: true }).fill(move);
    await page.getByLabel("Start").fill(start);
    if (end) await page.getByLabel("End (optional)").fill(end);
    await page.getByRole("button", { name: "Add move" }).click();
    await expectText(page, move);
    await page.waitForTimeout(400);
  }
  await expectText(page, "(3)");
  await shot(page, "16-dance-annotated");

  log("unknown move name is rejected with guidance");
  await page.getByLabel("Move", { exact: true }).fill("Not A Real Move");
  await page.getByLabel("Start").fill("1:00");
  await page.getByRole("button", { name: "Add move" }).click();
  await expectText(page, "pick one from the suggestions");

  log("annotation appears on the move page with the dance's song");
  await page.goto(`${BASE}/moves/sugar-push`);
  await expectText(page, "0:15 → 0:19");
  await expectText(page, "Dance Song");
  await expectText(page, "From a mapped dance");
  await page.getByRole("link", { name: "From a mapped dance" }).first().click();
  await page.waitForURL(danceUrl);

  log("dances list shows the mapped dance");
  await page.goto(`${BASE}/dances`);
  await expectText(page, "3 moves marked");

  log("dance appears on the dancer page and move page");
  await page.goto(`${BASE}/dancers/lead-${run}`);
  await expectText(page, "Advanced Jack & Jill");
  await page.goto(`${BASE}/moves/sugar-push`);
  await expectText(page, "Seen in dances");
  await expectText(page, `Lead ${run} & Follow ${run}`);

  // --- curriculum ---
  log("create a curriculum with ordered moves, notes, key videos");
  await page.goto(`${BASE}/curricula/new`);
  await page.getByLabel("Title").fill(curriculumTitle);
  await page.getByLabel("Description").fill("An automated test path.");
  await page.getByRole("button", { name: "Create and add moves" }).click();
  await page.waitForURL(/\/curricula\/test-path-.*\/edit/);

  await page.getByLabel("Add a move").fill("Sugar Push");
  await page.getByRole("button", { name: "+ Add", exact: true }).click();
  await page.getByLabel("Add a move").fill(moveName);
  await page.getByRole("button", { name: "+ Add", exact: true }).click();
  await page.getByLabel(`Notes for Sugar Push`).fill("Start here. Focus on the anchor.");
  // pick the first key-video checkbox for Sugar Push
  await page.locator('input[type="checkbox"]').first().check();
  // reorder: move Sugar Push down, then back up
  await page.getByRole("button", { name: "Move Sugar Push down" }).click();
  await page.getByRole("button", { name: "Move Sugar Push up" }).click();
  await page.getByLabel("Edit summary").fill("Initial move list");
  await shot(page, "11-curriculum-editor");
  await page.getByRole("button", { name: "Save curriculum" }).click();
  await page.waitForURL(/\/curricula\/test-path-(?!.*edit)/);
  await expectText(page, "Start here. Focus on the anchor.");
  const curriculumUrl = page.url();

  log("mark a move learned, progress updates");
  await page.getByRole("button", { name: "Mark learned" }).first().click();
  await expectText(page, "1/2 learned");
  await shot(page, "12-curriculum-progress");

  log("curriculum history recorded");
  await page.goto(`${curriculumUrl}/history`);
  await expectText(page, "Initial move list");

  // --- profile ---
  log("profile shows favorites, progress, edits");
  await page.goto(`${BASE}/profile`);
  await expectText(page, moveName);
  await expectText(page, curriculumTitle);
  await shot(page, "13-profile");

  log("fill in public profile with name and city");
  await page.getByRole("button", { name: "Edit profile" }).click();
  await page.getByLabel("Name").fill("Test Dancer");
  await page.getByLabel("City").fill("Nashville, TN");
  await page.getByLabel("I dance as").selectOption("switch");
  await page.getByLabel("About you").fill("Automated test dancer since 2026.");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expectText(page, "Profile saved.");

  log("public profile page shows the info and contributions");
  await page.goto(`${BASE}/users/${user1.username}`);
  await expectText(page, "Test Dancer");
  await expectText(page, "Nashville, TN");
  await expectText(page, "dances both roles");
  await expectText(page, "added a video clip");
  await shot(page, "13b-public-profile");

  // --- second user: collaborative editing ---
  log("second user edits the same move (wiki-style)");
  await page.getByRole("button", { name: "Log out" }).click();
  await page.waitForURL(`${BASE}/`);
  await page.goto(`${BASE}/signup`);
  await page.getByLabel("Email").fill(user2.email);
  await page.getByLabel("Username").fill(user2.username);
  await page.getByLabel("Password").fill(user2.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL(`${BASE}/`);
  markVerified(user2.email);

  await page.goto(`${moveUrl}/edit`);
  await page.getByLabel("Alternative names").fill("Test Alias One, Secret Handshake, Community Name");
  await page.getByLabel("Edit summary").fill("Added the name our scene uses");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForURL(moveUrl);
  await expectText(page, "Community Name");

  await page.goto(`${moveUrl}/history`);
  await expectText(page, user2.username);
  await expectText(page, user1.username);
  await shot(page, "14-collaborative-history");

  log("login page works for returning user");
  await page.getByRole("button", { name: "Log out" }).click();
  await page.waitForURL(`${BASE}/`);
  await page.goto(`${BASE}/login`);
  await page.getByLabel("Email").fill(user1.email);
  await page.getByLabel("Password").fill(user1.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(`${BASE}/`);
  await expectText(page, user1.username);

  log("wrong password rejected");
  await page.getByRole("button", { name: "Log out" }).click();
  await page.waitForURL(`${BASE}/`);
  await page.goto(`${BASE}/login`);
  await page.getByLabel("Email").fill(user1.email);
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expectText(page, "Incorrect email or password");

  // --- sponsors ---
  log("house ad shows when no sponsors; admin page hidden from non-admins");
  await page.goto(`${BASE}/`);
  await expectText(page, "Sponsor Westie Wiki");
  const adminRes = await page.goto(`${BASE}/admin/sponsors`);
  if (adminRes && adminRes.status() !== 404) throw new Error("admin page leaked to non-admin");

  log("admin adds a sponsor; card and click-through work");
  await page.goto(`${BASE}/login`);
  await page.getByLabel("Email").fill("archivist@westiewiki.example");
  await page.getByLabel("Password").fill("westie-demo-1234");
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(`${BASE}/`);
  await page.goto(`${BASE}/admin/sponsors`);
  const sponsorName = `Test Sponsor ${run.toUpperCase()}`;
  await page.getByLabel("Name", { exact: true }).fill(sponsorName);
  await page.getByLabel("Link").fill("https://example.com/sponsor-landing");
  await page.getByLabel("Tagline").fill("The finest test sponsorship money can buy.");
  await page.getByRole("button", { name: "Add sponsor" }).click();
  const sponsorRow = page.locator("li", { hasText: sponsorName });
  await sponsorRow.getByText("0 clicks").waitFor();

  await page.goto(`${BASE}/`);
  await expectText(page, sponsorName);
  const clickHref = await page.locator('a[href^="/s/"]').first().getAttribute("href");
  const clickRes = await page.request.get(`${BASE}${clickHref}`, { maxRedirects: 0 });
  if (clickRes.status() !== 302) throw new Error(`sponsor click-through returned ${clickRes.status()}`);
  await page.goto(`${BASE}/admin/sponsors`);
  await sponsorRow.getByText("1 clicks").waitFor();

  log("paused sponsor disappears from the slot");
  await sponsorRow.getByRole("button", { name: "Pause" }).click();
  await sponsorRow.getByText("paused").waitFor();
  await page.goto(`${BASE}/`);
  await expectText(page, "Sponsor Westie Wiki");
  await page.goto(`${BASE}/admin/sponsors`);
  await sponsorRow.getByRole("button", { name: "Delete", exact: true }).click();
  await sponsorRow.waitFor({ state: "detached" });
  await page.getByRole("button", { name: "Log out" }).click();
  await page.waitForURL(`${BASE}/`);

  log("sponsor pitch page renders");
  await page.goto(`${BASE}/sponsor`);
  await expectText(page, "What a sponsorship includes");
  await shot(page, "17-sponsor-page");

  log("forgot-password request always claims success");
  await page.goto(`${BASE}/forgot-password`);
  await page.getByLabel("Email").fill(user1.email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expectText(page, "a reset link is on its way");

  log("reset password via emailed token, old sessions killed");
  // no inbox in CI: plant a token directly, exactly as requestPasswordReset stores it
  const rawToken = randomBytes(32).toString("hex");
  const sqlite = new Database(process.env.DATABASE_PATH ?? "./data/wcs-wiki.db");
  const userRow = sqlite.prepare("SELECT id FROM users WHERE email = ?").get(user1.email) as { id: number };
  sqlite
    .prepare("INSERT INTO password_reset_tokens (id, user_id, expires_at) VALUES (?, ?, ?)")
    .run(createHash("sha256").update(rawToken).digest("hex"), userRow.id, Date.now() + 3600_000);
  sqlite.close();

  await page.goto(`${BASE}/reset-password?token=${rawToken}`);
  await page.getByLabel("New password").fill("brand-new-password-1");
  await page.getByRole("button", { name: "Set new password" }).click();
  await page.waitForURL(/login\?reset=1/);
  await expectText(page, "Password updated");
  await page.getByLabel("Email").fill(user1.email);
  await page.getByLabel("Password").fill("brand-new-password-1");
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(`${BASE}/`);
  await expectText(page, user1.username);

  log("used reset token is rejected");
  await page.getByRole("button", { name: "Log out" }).click();
  await page.goto(`${BASE}/reset-password?token=${rawToken}`);
  await page.getByLabel("New password").fill("another-password-1");
  await page.getByRole("button", { name: "Set new password" }).click();
  await expectText(page, "expired or was already used");

  await browser.close();
  console.log("\n✅ All E2E flows passed.");
}

main().catch((err) => {
  console.error(`\n❌ FAILED at step: ${step}`);
  console.error(err);
  process.exit(1);
});
