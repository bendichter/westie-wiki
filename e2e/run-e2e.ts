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
let failurePage: import("playwright").Page | null = null;
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
    UPDATE reports SET video_id = NULL WHERE video_id IN (SELECT id FROM videos WHERE dance_id IS NOT NULL);
    UPDATE reports SET dance_id = NULL WHERE dance_id IS NOT NULL;
    DELETE FROM video_dancers WHERE video_id IN (SELECT id FROM videos WHERE dance_id IS NOT NULL);
    DELETE FROM videos WHERE dance_id IS NOT NULL;
    DELETE FROM dance_dancers;
    DELETE FROM dance_songs;
    DELETE FROM dances;
    DELETE FROM sponsors;
    -- retire prior runs' test moves, or their shared alias crowds this run's
    -- move out of the capped search results
    UPDATE moves SET deleted = 1 WHERE name LIKE 'Test Move %' AND deleted = 0;
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
  failurePage = page;
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
    .fill(
      "A test pattern, commonly taught with a triple.[^1]\n\n## Counts\n\n- 1-2 walk walk\n- 3&4 triple\n\n[^1]: Test Citation, Imaginary Dance Manual"
    );
  await page.getByLabel("Tags").fill("test tag, whip family");
  await page.getByRole("button", { name: "Create move" }).click();
  await page.waitForURL(/\/moves\/test-move-/);
  await expectText(page, "Test Alias One");
  await expectText(page, "walk walk");
  await expectText(page, "Test Citation, Imaginary Dance Manual");
  if ((await page.locator(".prose-wcs sup a").count()) < 1) {
    throw new Error("footnote reference did not render as sup link");
  }
  const moveUrl = page.url();
  await shot(page, "05-move-created");

  log("add an official variant to the move");
  await page.getByRole("button", { name: "+ Add a variant" }).click();
  await page.getByLabel("Variant name").fill("With hand-change exit");
  await page.getByLabel("Variant note").fill("Ends with a hand change.");
  await page.getByRole("button", { name: "Add variant" }).click();
  await expectText(page, "Official variants");
  await expectText(page, "Ends with a hand change.");

  log("set the move's default handhold");
  await page.getByRole("button", { name: "edit", exact: true }).click();
  await page.getByLabel("Default handhold").selectOption({ label: "Two-hand" });
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expectText(page, "Default handhold");
  await expectText(page, "Two-hand");

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

  log("cite an instructional video from another platform");
  await page.goto(moveUrl);
  await page.getByRole("button", { name: "+ Cite an instructional video" }).click();
  await page.getByLabel("Link").fill("https://www.instagram.com/p/example-tutorial/");
  await page.getByLabel("Title", { exact: true }).fill("Handhold breakdown reel");
  await page.getByRole("button", { name: "Add citation" }).click();
  await expectText(page, "Handhold breakdown reel");
  await expectText(page, "Instagram");

  log("search finds move by alias");
  await page.goto(`${BASE}/search?q=Secret Handshake`);
  await expectText(page, moveName);
  await shot(page, "10-search");

  log("list pages: inline search and pagination");
  await page.goto(`${BASE}/moves?q=Secret Handshake`);
  await expectText(page, moveName);
  await page.goto(`${BASE}/moves?page=2`);
  await expectText(page, "page 2 of");

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
  await page.getByLabel("Placement").fill("2nd place");
  await page.getByLabel("Song", { exact: true }).fill("Dance Song");
  await page.getByLabel("Artist", { exact: true }).fill("Dance Artist");
  await page.getByRole("button", { name: "+ Another song" }).click();
  await page.locator('input[name="songName"]').nth(1).fill("Second Song");
  await page.locator('input[name="songArtist"]').nth(1).fill("Second Artist");
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
    if (move === moveName) {
      await page.getByLabel("Variant (optional)").selectOption({ label: "With hand-change exit" });
      await page.getByLabel("Handhold (optional)").selectOption({ label: "Two-hand" });
    }
    await page.getByRole("button", { name: "Add move" }).click();
    await expectText(page, move);
    await page.waitForTimeout(400);
  }
  await expectText(page, "(3)");
  await page.locator("aside").getByText("Two-hand").waitFor({ state: "visible", timeout: 15000 });
  await shot(page, "16-dance-annotated");

  log("clicking a timeline segment loads it into the form for editing");
  await page.getByRole("button", { name: "0:15–0:19" }).click();
  await expectText(page, "Edit this move");
  if ((await page.getByLabel("Move", { exact: true }).inputValue()) !== "Sugar Push") {
    throw new Error("edit form did not populate the move name");
  }
  if ((await page.getByLabel("Start").inputValue()) !== "0:15") {
    throw new Error("edit form did not populate the start time");
  }
  await page.getByLabel("End (optional)").fill("0:20");
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await expectText(page, "0:15–0:20");

  log("loop buttons are enabled once start and end are set");
  await page.getByRole("button", { name: "0:15–0:20" }).click();
  const loopButton = page.getByRole("button", { name: "↻ loop", exact: true });
  if (await loopButton.isDisabled()) throw new Error("loop button should be enabled with start+end");
  await page.getByRole("button", { name: "Cancel" }).click();
  await expectText(page, "Mark a move");

  log("loop tool: paste a link with t=, set end, loop, share");
  await page.goto(`${BASE}/loop`);
  await page.getByLabel("YouTube link").fill("https://youtu.be/GGi2Rkf-15g?t=15");
  await page.getByRole("button", { name: "Load", exact: true }).click();
  if ((await page.getByLabel("Start").inputValue()) !== "0:15") {
    throw new Error("loop page did not prefill start from the link's t= parameter");
  }
  await page.getByLabel("End", { exact: true }).fill("0:19");
  const loopToolButton = page.getByRole("button", { name: "↻ loop", exact: true });
  for (let i = 0; i < 60 && (await loopToolButton.isDisabled()); i++) await page.waitForTimeout(250);
  if (await loopToolButton.isDisabled()) throw new Error("loop tool button never enabled");
  const shareHref = await page.getByRole("link", { name: "Share this loop" }).getAttribute("href");
  if (!shareHref?.includes("v=GGi2Rkf-15g") || !shareHref.includes("start=15") || !shareHref.includes("end=19")) {
    throw new Error(`share link missing loop params: ${shareHref}`);
  }

  log("loop tool: share-link arrival auto-loops at the given rate");
  await page.goto(`${BASE}/loop?v=GGi2Rkf-15g&start=15&end=19&rate=0.5`);
  await page.getByRole("button", { name: "◼ stop ½× loop" }).waitFor({ timeout: 15000 });
  await page.goto(danceUrl);
  // the marking panel is an accordion, collapsed by default on a mapped dance
  await page.getByRole("button", { name: /Mark a move/ }).click();
  await page.getByLabel("Move", { exact: true }).waitFor();

  log("removing an annotation requires clicking into it first");
  if ((await page.getByText("\u2715").count()) !== 0) throw new Error("timeline should not show inline delete buttons");
  await page.getByLabel("Move", { exact: true }).fill("Whip");
  await page.getByLabel("Start").fill("0:50.5");
  await page.getByRole("button", { name: "Add move" }).click();
  await expectText(page, "(4)");
  await page.getByRole("button", { name: "0:50.5" }).click();
  await expectText(page, "Edit this move");
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await expectText(page, "(3)");
  await expectText(page, "Mark a move");

  log("unknown move name is rejected with guidance");
  await page.getByLabel("Move", { exact: true }).fill("Not A Real Move");
  await page.getByLabel("Start").fill("1:00");
  await page.getByRole("button", { name: "Add move" }).click();
  await expectText(page, "pick one from the suggestions");

  log("annotation appears on the move page with the dance's song");
  await page.goto(`${BASE}/moves/sugar-push`);
  await expectText(page, "0:15 — 0:20");
  await expectText(page, "Dance Song");

  log("clicking the clip thumbnail opens the mapped dance with the clip looping");
  await page.getByRole("link", { name: /mapped dance/i }).first().click();
  await page.waitForURL((u) => u.href.startsWith(danceUrl) && u.searchParams.has("clip"));
  await expectText(page, "Edit this move");
  if ((await page.getByLabel("Start").inputValue()) !== "0:15") {
    throw new Error("linked clip did not preload its start time");
  }
  await page.getByRole("button", { name: "◼ stop loop" }).waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: "Cancel" }).click();

  log("dancer page groups clips by move under the Moves tab");
  await page.goto(`${BASE}/dancers/lead-${run}?tab=moves`);
  await expectText(page, "Sugar Push");
  await expectText(page, "0:15 — 0:20");
  await shot(page, "09-dancer-page");

  log("event page shows the clip under the Moves tab");
  await page.goto(`${BASE}/events`);
  await expectText(page, `Test Event ${run.toUpperCase()}`);
  await page.goto(`${BASE}/events/test-event-${run}-2025?tab=moves`);
  await expectText(page, "0:15 — 0:20");

  log("search finds the dancer by name; list pages find dancer and event");
  await page.goto(`${BASE}/search?q=Follow ${run}`);
  await expectText(page, `Follow ${run}`);
  await page.goto(`${BASE}/dancers?q=Lead ${run}`);
  await expectText(page, `Lead ${run}`);
  await page.goto(`${BASE}/events?q=Test Event ${run.toUpperCase()}`);
  await expectText(page, `Test Event ${run.toUpperCase()}`);

  log("home shows the freshly annotated dance's card");
  await page.goto(BASE);
  await expectText(page, "Recent contributions");
  await expectText(page, `Lead ${run} & Follow ${run}`);

  log("dances list shows the mapped dance");
  await page.goto(`${BASE}/dances`);
  await expectText(page, "3 moves marked");

  log("dance event can be edited from the Edit details panel");
  await page.goto(danceUrl);
  await page.getByRole("button", { name: "Edit details" }).click();
  await page.getByLabel("Event", { exact: true }).fill(`Corrected Event ${run.toUpperCase()}`);
  await page.getByLabel("Year").fill("2024");
  await page.getByRole("button", { name: "Save details" }).click();
  await expectText(page, `Corrected Event ${run.toUpperCase()} 2024`);

  log("search finds the dance by song and artist");
  await page.goto(`${BASE}/search?q=Second Song`);
  await expectText(page, "Dances");
  await expectText(page, "Second Song");
  await page.goto(`${BASE}/dances?q=Dance Artist`);
  await expectText(page, `Lead ${run}`);
  await page.goto(`${BASE}/dances?q=zzzz-no-match`);
  await expectText(page, "No dances matching");

  log("one Edit details panel updates placement and songs together");
  await page.goto(danceUrl);
  await expectText(page, "2nd place");
  await expectText(page, "Second Song");
  await page.getByRole("button", { name: "Edit details" }).click();
  await page.getByLabel("Placement").fill("1st place");
  await page.locator('input[name="songName"]').first().fill("Corrected Song");
  await page.getByRole("button", { name: "Save details" }).click();
  await expectText(page, "1st place");
  await expectText(page, "Corrected Song");
  await page.goto(`${BASE}/moves/sugar-push`);
  await expectText(page, "Corrected Song");
  await expectText(page, "Second Song");

  log("dance appears on the dancer page (Dances tab default) and move page");
  await page.goto(`${BASE}/dancers/lead-${run}`);
  await expectText(page, "Advanced Jack & Jill");
  await page.getByRole("tab", { name: /Moves/ }).click();
  await expectText(page, "0:15 — 0:20");
  await page.goto(`${BASE}/moves/sugar-push`);
  await expectText(page, `Lead ${run}`);
  await expectText(page, `Follow ${run}`);

  log("owner can remove a dance from the edit panel");
  await page.goto(`${BASE}/dances/new`);
  await page.getByLabel("YouTube link").fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  await page.getByRole("button", { name: "Register and start marking" }).click();
  await page.waitForURL((u) => u.pathname.startsWith("/dances/") && u.pathname !== "/dances/new");
  const tempDanceUrl = page.url();
  await page.getByRole("button", { name: "Edit details" }).click();
  await page.getByRole("button", { name: "Remove this dance" }).click();
  await page.getByRole("button", { name: "Yes, remove it" }).click();
  await page.waitForURL(`${BASE}/dances`);
  const removedDance = await page.request.get(tempDanceUrl);
  if (removedDance.status() !== 404) throw new Error(`removed dance returned ${removedDance.status()}`);

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
  await page.getByLabel("WSDC #").fill("12345");
  await page.getByLabel("I dance as").selectOption("switch");
  await page.getByLabel("About you").fill("Automated test dancer since 2026.");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expectText(page, "Profile saved.");

  log("public profile page shows the info and contributions");
  await page.goto(`${BASE}/users/${user1.username}`);
  await expectText(page, "Test Dancer");
  await expectText(page, "Nashville, TN");
  await expectText(page, "WSDC #12345");
  await expectText(page, "dances both roles");
  // contributions are grouped: dances, annotations, move edits
  await expectText(page, "Advanced Jack & Jill · registered");
  await expectText(page, `marked at 0:15 in Lead ${run} & Follow ${run}`);
  await expectText(page, "Created page");
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

  log("contributor leaderboard ranks the test user");
  await page.goto(`${BASE}/contributors`);
  await expectText(page, "Contributors");
  await expectText(page, user1.username);
  await expectText(page, "archivist");

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
  if ((await page.getByRole("link", { name: "Admin", exact: true }).count()) !== 0) {
    throw new Error("Admin header link leaked to non-admin");
  }
  const adminRes = await page.goto(`${BASE}/admin/sponsors`);
  if (adminRes && adminRes.status() !== 404) throw new Error("admin page leaked to non-admin");

  log("admin adds a sponsor; card and click-through work");
  await page.goto(`${BASE}/login`);
  await page.getByLabel("Email").fill("archivist@westiewiki.example");
  await page.getByLabel("Password").fill("westie-demo-1234");
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(`${BASE}/`);
  await page.getByRole("link", { name: "Admin", exact: true }).waitFor({ state: "visible" });
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

  log("analytics beacon records views; admin dashboard shows them");
  await page.goto(`${BASE}/moves/whip`);
  await page.waitForTimeout(600);
  await page.goto(`${BASE}/admin/analytics`);
  await expectText(page, "Daily views");
  await expectText(page, "/moves/whip");

  log("admin can soft-delete and restore a move");
  await page.goto(`${BASE}/moves/whip`);
  await page.getByRole("button", { name: /Delete move \(admin/ }).click();
  await page.waitForURL(`${BASE}/moves`);
  const gone = await page.request.get(`${BASE}/moves/whip`);
  if (gone.status() !== 404) throw new Error(`deleted move returned ${gone.status()}`);
  await page.goto(`${BASE}/admin/moderation`);
  await page
    .locator("li", { hasText: "Whip" })
    .getByRole("button", { name: "Restore" })
    .click();
  await page.waitForTimeout(600);
  const back = await page.request.get(`${BASE}/moves/whip`);
  if (back.status() !== 200) throw new Error(`restored move returned ${back.status()}`);

  log("admin can delete another member's annotation");
  await page.goto(danceUrl);
  await page.getByRole("button", { name: "0:22" }).click();
  await expectText(page, "Edit this move");
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await expectText(page, "(2)");

  log("admin can block and unblock an account");
  await page.goto(`${BASE}/admin/moderation`);
  const blockRow = page.locator("li", { hasText: user2.username });
  await blockRow.getByRole("button", { name: "Block" }).click();
  await blockRow.getByText("blocked").waitFor();
  // blocked user cannot log in
  const ctx2 = await page.context().browser()!.newContext();
  const p2 = await ctx2.newPage();
  await p2.goto(`${BASE}/login`);
  await p2.getByLabel("Email").fill(user2.email);
  await p2.getByLabel("Password").fill(user2.password);
  await p2.getByRole("button", { name: "Log in" }).click();
  await p2.getByText("This account has been disabled").waitFor();
  await ctx2.close();
  await blockRow.getByRole("button", { name: "Unblock" }).click();
  await blockRow.getByText("blocked").waitFor({ state: "detached" });

  log("member reports a dance; admin sees and dismisses it");
  await page.goto(danceUrl);
  await page.getByRole("button", { name: "Report", exact: true }).first().click();
  await page.getByLabel("Report reason").fill("Testing the report flow");
  await page.getByRole("button", { name: "Send report" }).click();
  await expectText(page, "Reported — an admin will review.");
  await page.goto(`${BASE}/admin/moderation`);
  await expectText(page, "Testing the report flow");
  await page.getByRole("button", { name: "Dismiss" }).click();
  await expectText(page, "No open reports");

  log("reported dance can be removed by admin");
  await page.goto(danceUrl);
  await page.getByRole("button", { name: "Report", exact: true }).first().click();
  await page.getByLabel("Report reason").fill("Workshop recap, please remove");
  await page.getByRole("button", { name: "Send report" }).click();
  await expectText(page, "Reported — an admin will review.");
  await page.goto(`${BASE}/admin/moderation`);
  await page.getByRole("button", { name: "Remove dance" }).click();
  await expectText(page, "No open reports");
  const danceGone = await page.request.get(danceUrl);
  if (danceGone.status() !== 404) throw new Error(`removed dance returned ${danceGone.status()}`);

  log("paused sponsor disappears from the slot");
  await page.goto(`${BASE}/admin/sponsors`);
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

main().catch(async (err) => {
  console.error(`\n❌ FAILED at step: ${step}`);
  console.error(err);
  if (failurePage) {
    await failurePage.screenshot({ path: `${SHOTS}/FAILURE.png`, fullPage: true }).catch(() => {});
    console.error(`Failure screenshot: ${SHOTS}/FAILURE.png`);
  }
  process.exit(1);
});
