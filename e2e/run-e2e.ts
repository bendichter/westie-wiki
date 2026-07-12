/**
 * End-to-end verification: drives the real app in headless Chromium through
 * every core user flow. Run with the dev or prod server on :3000:
 *
 *   npx tsx e2e/run-e2e.ts [screenshot-dir]
 *
 * Exits non-zero on the first failed assertion.
 */
import { chromium, type Page } from "playwright";
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

async function main() {
  fs.mkdirSync(SHOTS, { recursive: true });
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
  await page.goto(`${BASE}/login`);
  await page.getByLabel("Email").fill(user1.email);
  await page.getByLabel("Password").fill(user1.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(`${BASE}/`);
  await expectText(page, user1.username);

  log("wrong password rejected");
  await page.getByRole("button", { name: "Log out" }).click();
  await page.goto(`${BASE}/login`);
  await page.getByLabel("Email").fill(user1.email);
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expectText(page, "Incorrect email or password");

  await browser.close();
  console.log("\n✅ All E2E flows passed.");
}

main().catch((err) => {
  console.error(`\n❌ FAILED at step: ${step}`);
  console.error(err);
  process.exit(1);
});
