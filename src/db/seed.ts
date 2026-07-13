/**
 * Seed the wiki with real WCS content: ~25 moves, relations, tags, two
 * curricula, and verified YouTube clips of real dancers and events.
 *
 * All seeded content is attributed to the "archivist" demo account and is
 * meant to be corrected/extended by the community. Idempotent-ish: refuses
 * to run if moves already exist.
 */
import { count, eq } from "drizzle-orm";
import { db } from "./index";
import {
  curricula,
  handholds,
  curriculumItems,
  curriculumRevisions,
  dancers,
  events,
  moveAliases,
  moveRelations,
  moveResources,
  moveRevisions,
  moves,
  moveTags,
  tags,
  users,
  videoDancers,
  videos,
} from "./schema";
import { SEED_CURRICULA, SEED_MOVES, SEED_RELATIONS, SEED_RESOURCES } from "./seed-data";
import { hashPassword } from "../lib/auth-crypto";
import { slugify } from "../lib/slug";

const existing = db.select({ n: count() }).from(moves).get()?.n ?? 0;
if (existing > 0) {
  console.log(`Database already has ${existing} moves — skipping seed.`);
  process.exit(0);
}

const now = Date.now();

// --- demo editor account ---
const archivist = db
  .insert(users)
  .values({
    email: "archivist@westiewiki.example",
    username: "archivist",
    passwordHash: hashPassword("westie-demo-1234"),
    createdAt: now,
    emailVerifiedAt: now,
  })
  .returning()
  .get();
console.log("Created demo account: archivist@westiewiki.example / westie-demo-1234");

// --- moves, aliases, tags, revision 1 ---
const moveIdByName = new Map<string, number>();
const tagIdBySlug = new Map<string, number>();

for (const seedMove of SEED_MOVES) {
  const move = db
    .insert(moves)
    .values({
      slug: slugify(seedMove.name),
      name: seedMove.name,
      description: seedMove.description,
      difficulty: seedMove.difficulty,
      createdBy: archivist.id,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();
  moveIdByName.set(seedMove.name, move.id);

  if (seedMove.aliases.length > 0) {
    db.insert(moveAliases)
      .values(seedMove.aliases.map((name) => ({ moveId: move.id, name })))
      .run();
  }

  for (const tagName of seedMove.tags) {
    const tagSlug = slugify(tagName);
    let tagId = tagIdBySlug.get(tagSlug);
    if (tagId == null) {
      tagId = db.insert(tags).values({ slug: tagSlug, name: tagName }).returning().get().id;
      tagIdBySlug.set(tagSlug, tagId);
    }
    db.insert(moveTags).values({ moveId: move.id, tagId }).run();
  }

  db.insert(moveRevisions)
    .values({
      moveId: move.id,
      revisionNo: 1,
      name: seedMove.name,
      description: seedMove.description,
      aliases: JSON.stringify(seedMove.aliases),
      tags: JSON.stringify(seedMove.tags),
      difficulty: seedMove.difficulty,
      editorId: archivist.id,
      editSummary: "Seeded from the community starter set",
      createdAt: now,
    })
    .run();
}
console.log(`Seeded ${SEED_MOVES.length} moves.`);

// flagship default handhold (handholds themselves are seeded by migration)
const sugarPushId = moveIdByName.get("Sugar Push");
if (sugarPushId != null) {
  const twoHand = db.select().from(handholds).where(eq(handholds.name, "Two-hand")).get();
  if (twoHand) {
    db.update(moves).set({ defaultHandholdId: twoHand.id }).where(eq(moves.id, sugarPushId)).run();
    console.log("Set Sugar Push default handhold: Two-hand.");
  }
}

// --- relations ---
for (const [from, to, kind] of SEED_RELATIONS) {
  const fromId = moveIdByName.get(from);
  const toId = moveIdByName.get(to);
  if (fromId == null || toId == null) {
    console.warn(`Relation skipped (unknown move): ${from} -> ${to}`);
    continue;
  }
  db.insert(moveRelations)
    .values({ fromMoveId: fromId, toMoveId: toId, kind })
    .onConflictDoNothing()
    .run();
}
console.log(`Seeded ${SEED_RELATIONS.length} relations.`);

// --- instructional resources ("Learn more") ---
for (const [moveName, url, title] of SEED_RESOURCES) {
  const moveId = moveIdByName.get(moveName);
  if (moveId == null) {
    console.warn(`Resource skipped (unknown move): ${moveName}`);
    continue;
  }
  db.insert(moveResources).values({ moveId, url, title, addedBy: archivist.id, createdAt: now }).run();
}
console.log(`Seeded ${SEED_RESOURCES.length} resources.`);

// --- dancers & events ---
const ROLE_BY_DANCER: Record<string, "leader" | "follower"> = {
  "Jordan Frisbee": "leader",
  "Tatiana Mollmann": "follower",
  "Ben Morris": "leader",
  "Cameo McHenry": "follower",
  "Victoria Henk": "follower",
  "Kyle Redd": "leader",
  "Sarah Vann Drake": "follower",
  "Maxence Martin": "leader",
  "Virginie Grondin": "follower",
  "Brian Barakauskas": "leader",
};

const dancerIdByName = new Map<string, number>();
function dancerId(name: string): number {
  let id = dancerIdByName.get(name);
  if (id == null) {
    id = db.insert(dancers).values({ slug: slugify(name), name }).returning().get().id;
    dancerIdByName.set(name, id);
  }
  return id;
}

const eventIdByKey = new Map<string, number>();
function eventId(name: string, year: number | null): number {
  const key = `${name}|${year ?? ""}`;
  let id = eventIdByKey.get(key);
  if (id == null) {
    id = db
      .insert(events)
      .values({ slug: slugify(year ? `${name} ${year}` : name), name, year })
      .returning()
      .get().id;
    eventIdByKey.set(key, id);
  }
  return id;
}

// --- verified YouTube clips ---
type SeedVideo = {
  youtubeId: string;
  title: string;
  moves: string[];
  dancers: string[];
  event: string | null;
  eventYear: number | null;
  note: string;
};

const SEED_VIDEOS: SeedVideo[] = [
  {
    youtubeId: "dfVpwMLqm-o",
    title: "How to Dance the West Coast Swing Basic Steps | Sugar Push, Side Pass, Whip",
    moves: ["Sugar Push", "Whip"],
    dancers: ["Brian Barakauskas"],
    event: null,
    eventYear: null,
    note: "Full tutorial covering all four basics — this move among them.",
  },
  {
    youtubeId: "4zV_TJ7PZyg",
    title: "The First 4 Basics of WCS - Start Here!",
    moves: ["Left Side Pass", "Right Side Pass"],
    dancers: ["Brian Barakauskas"],
    event: null,
    eventYear: null,
    note: "Beginner tutorial on the first four patterns — this move among them.",
  },
  {
    youtubeId: "StRuCN9jbgM",
    title: "Total BEGINNERS Guide to West Coast Swing!",
    moves: ["Starter Step"],
    dancers: ["Brian Barakauskas"],
    event: null,
    eventYear: null,
    note: "Full from-zero beginner guide.",
  },
  {
    youtubeId: "gYYYJNatVXQ",
    title: "HOW TO WEST COAST SWING Sugar Push",
    moves: ["Sugar Push"],
    dancers: [],
    event: null,
    eventYear: null,
    note: "Dedicated sugar push tutorial.",
  },
  {
    youtubeId: "WHk1qylcQzQ",
    title: "West Coast Swing Basic Steps (Starter Step & Left Side Pass)",
    moves: ["Starter Step", "Left Side Pass"],
    dancers: [],
    event: null,
    eventYear: null,
    note: "Covers the starter step and left side pass together.",
  },
  {
    youtubeId: "5vVeFs6q9os",
    title: "West Coast Swing Basic Whip",
    moves: ["Whip"],
    dancers: ["Brian Barakauskas"],
    event: null,
    eventYear: null,
    note: "Dedicated basic whip tutorial.",
  },
  {
    youtubeId: "6W4eFJXh4K0",
    title: "Jordan Frisbee & Tatiana Mollmann: HOW TO DANCE A PERFECT TOSS-OUT in WEST COAST SWING",
    moves: ["Throwout"],
    dancers: ["Jordan Frisbee", "Tatiana Mollmann"],
    event: null,
    eventYear: null,
    note: "Pro tutorial — they call it a toss-out; same pattern.",
  },
  {
    youtubeId: "sfCLysB65UI",
    title: "West Coast Swing - Ben Morris & Cameo McHenry - The US Open Swing Dance Championships Classic 1st",
    moves: ["Whip"],
    dancers: ["Ben Morris", "Cameo McHenry"],
    event: "US Open Swing Dance Championships",
    eventYear: 2022,
    note: "Championship classic routine — whip variations throughout; spot as many as you can.",
  },
  {
    youtubeId: "q0htEqpnKUE",
    title: "2012 US Open Swing Dance Championships - Classic Division Champions",
    moves: ["Sugar Push"],
    dancers: ["Jordan Frisbee", "Tatiana Mollmann"],
    event: "US Open Swing Dance Championships",
    eventYear: 2012,
    note: "Choreographed championship routine — the basics are in there, dressed up.",
  },
  {
    youtubeId: "rHD6oFaEASE",
    title: "2013 Classic Champions - Jordan & Tatiana - US Open Swing Dance Championships",
    moves: ["Whip"],
    dancers: ["Jordan Frisbee", "Tatiana Mollmann"],
    event: "US Open Swing Dance Championships",
    eventYear: 2013,
    note: "Championship classic routine built on whip-family patterns.",
  },
  {
    youtubeId: "ijV3ie60AP8",
    title: 'Jordan Frisbee & Tatiana Mollmann "Gravity" - Pro Jack & Jill - Budafest 2018',
    moves: ["Left Side Pass"],
    dancers: ["Jordan Frisbee", "Tatiana Mollmann"],
    event: "Budafest",
    eventYear: 2018,
    note: "Improvised pro Jack & Jill — watch how much mileage they get from simple passes.",
  },
  {
    youtubeId: "GGi2Rkf-15g",
    title: "Improv West Coast Swing Dance - Ben Morris & Victoria Henk - Budafest 2024 Pro Jack & Jill",
    moves: ["Anchor Step"],
    dancers: ["Ben Morris", "Victoria Henk"],
    event: "Budafest",
    eventYear: 2024,
    note: "Improvised dancing — watch the anchors: almost every pattern ends in play.",
  },
  {
    youtubeId: "uQ8pVIm8yv4",
    title: "Improv West Coast Swing - Ben Morris & Tatiana Mollmann - City of Angels 2023 Champions Jack & Jill",
    moves: ["Free Spin"],
    dancers: ["Ben Morris", "Tatiana Mollmann"],
    event: "City of Angels Swing Dance Championships",
    eventYear: 2023,
    note: "Improvised champions Jack & Jill — several released turns and free spins.",
  },
  {
    youtubeId: "4VTlCKcXYAY",
    title: "West Coast Swing | Kyle Redd + Sarah Vann Drake | Champion JJ Prelim - Desert City Swing",
    moves: ["Right Side Pass"],
    dancers: ["Kyle Redd", "Sarah Vann Drake"],
    event: "Desert City Swing",
    eventYear: null,
    note: "Social-style champion Jack & Jill prelim — clean, social-floor-realistic patterns.",
  },
  {
    youtubeId: "HG0wchQTL-0",
    title: "Improv West Coast Swing Dance - Maxence Martin & Virginie Grondin - Swingtzerland 2020 Pro Show",
    moves: ["Body Roll"],
    dancers: ["Maxence Martin", "Virginie Grondin"],
    event: "Swingtzerland",
    eventYear: 2020,
    note: "Pro show — styling and musicality throughout, body isolation everywhere.",
  },
];

const videoIdsByMove = new Map<string, number[]>();
let clipCount = 0;
for (const sv of SEED_VIDEOS) {
  for (const moveName of sv.moves) {
    const moveId = moveIdByName.get(moveName);
    if (moveId == null) {
      console.warn(`Video skipped (unknown move): ${moveName}`);
      continue;
    }
    const video = db
      .insert(videos)
      .values({
        moveId,
        youtubeId: sv.youtubeId,
        startSec: 0,
        endSec: null,
        title: sv.title,
        note: sv.note,
        eventId: sv.event ? eventId(sv.event, sv.eventYear) : null,
        addedBy: archivist.id,
        createdAt: now,
      })
      .returning()
      .get();
    clipCount++;
    const list = videoIdsByMove.get(moveName) ?? [];
    list.push(video.id);
    videoIdsByMove.set(moveName, list);

    for (const dancerName of sv.dancers) {
      db.insert(videoDancers)
        .values({
          videoId: video.id,
          dancerId: dancerId(dancerName),
          role: ROLE_BY_DANCER[dancerName] ?? null,
        })
        .onConflictDoNothing()
        .run();
    }
  }
}
console.log(`Seeded ${clipCount} video clips, ${dancerIdByName.size} dancers, ${eventIdByKey.size} events.`);

// --- curricula ---
for (const sc of SEED_CURRICULA) {
  const curriculum = db
    .insert(curricula)
    .values({
      slug: slugify(sc.title),
      title: sc.title,
      description: sc.description,
      createdBy: archivist.id,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();

  const revisionItems: { moveId: number; notes: string; keyVideoIds: number[] }[] = [];
  sc.items.forEach((item, index) => {
    const moveId = moveIdByName.get(item.move);
    if (moveId == null) {
      console.warn(`Curriculum item skipped (unknown move): ${item.move}`);
      return;
    }
    // feature up to 2 of the move's seeded clips as key examples
    const keyVideoIds = (videoIdsByMove.get(item.move) ?? []).slice(0, 2);
    db.insert(curriculumItems)
      .values({
        curriculumId: curriculum.id,
        position: index,
        moveId,
        notes: item.notes,
        keyVideoIds: JSON.stringify(keyVideoIds),
      })
      .run();
    revisionItems.push({ moveId, notes: item.notes, keyVideoIds });
  });

  db.insert(curriculumRevisions)
    .values({
      curriculumId: curriculum.id,
      revisionNo: 1,
      title: sc.title,
      description: sc.description,
      items: JSON.stringify(revisionItems),
      editorId: archivist.id,
      editSummary: "Seeded from the community starter set",
      createdAt: now,
    })
    .run();
}
console.log(`Seeded ${SEED_CURRICULA.length} curricula.`);
console.log("Done.");
