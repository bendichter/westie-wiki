import type { Difficulty, RelationKind } from "./schema";

export type SeedMove = {
  name: string;
  aliases: string[];
  difficulty: Difficulty;
  tags: string[];
  description: string;
};

export const SEED_MOVES: SeedMove[] = [
  {
    name: "Sugar Push",
    aliases: ["Push Break", "6-Count Push"],
    difficulty: "beginner",
    tags: ["fundamentals", "push family", "6-count"],
    description: `The sugar push is usually the first pattern taught in West Coast Swing, and many dancers argue it stays the hardest to do *well* for your entire dancing life.

## The shape

A 6-count pattern danced in the slot. The follower travels toward the leader, reaches a two-hand (or one-hand) compression, and returns to roughly where they started. Unlike most WCS patterns, the follower does not pass the leader.

- **1–2**: follower walks forward toward the leader (walk, walk)
- **3&4**: follower arrives with a triple, connection compresses ("catch")
- **5&6**: anchor step — both partners settle away from each other and re-establish leverage

## What it teaches

The sugar push is the purest expression of WCS **elastic connection**: extension into compression into extension. Commonly taught points include keeping the arms relaxed so the connection moves your body (not your shoulders), and letting the compression on 3&4 come from body positioning rather than pushing with the hands.

## Common variations

The skeleton stays the same across handholds — list the variant in a clip's note when you spot one:

- **Two-hand** — both hands connected; the most common classroom version, with compression split across both arms.
- **Right-to-left (standard one-hand)** — leader's left to follower's right; frees a hand for styling and hand changes.
- **Right-to-right (handshake)** — sets up tucks, hand changes behind the back, and crossed-hand shapes.
- **Left-to-left** — less common; usually a deliberate setup for a specific next pattern.
- **One-hand with resistance styling, no-hands (body-lead) push** — advanced connection play on the same geometry.

## Naming

Widely also called the **push break**, especially in scenes with roots in East Coast Swing pedagogy. Both names are heard at every event; neither is wrong.`,
  },
  {
    name: "Left Side Pass",
    aliases: ["LSP"],
    difficulty: "beginner",
    tags: ["fundamentals", "pass family", "6-count"],
    description: `A 6-count pattern where the follower passes the leader on the leader's **left** side. Along with the sugar push and right side pass, it forms the core triangle of beginner WCS.

## The shape

- **1–2**: leader steps back and slightly off-slot, opening a lane on their left; follower walks forward
- **3&4**: follower passes the leader and turns to face back down the slot
- **5&6**: anchor

The leader redirects the follower's momentum down the slot rather than pulling — a common teaching image is "opening a door" and letting the follower walk through.

## Common notes

- Followers generally keep their travel on the slot; a drifting left side pass is one of the most common beginner habits.
- The leader's hand stays low and relaxed ("in the toolbox") — high hands early in this pattern usually mean an accidental inside roll is coming.`,
  },
  {
    name: "Right Side Pass",
    aliases: ["Underarm Pass", "RSP"],
    difficulty: "beginner",
    tags: ["fundamentals", "pass family", "6-count"],
    description: `A 6-count pattern where the follower passes on the leader's **right** side, usually traveling under the joined hands — hence the common alternative name **underarm pass**.

## The shape

- **1–2**: leader steps back, raising the joined left hand to create an arch; follower walks forward
- **3&4**: follower passes under the arch and turns right to face back down the slot
- **5&6**: anchor

## Common notes

- The arch is an invitation, not a crank: most instruction emphasizes that the leader's raised hand stays quiet and the follower turns themselves.
- Danced without the raised arm (a simple pass on the right side), the same slot geometry is often just called a *side pass* or *outside pass* depending on the scene.`,
  },
  {
    name: "Whip",
    aliases: ["Basic Whip", "8-Count Whip"],
    difficulty: "beginner",
    tags: ["fundamentals", "whip family", "8-count"],
    description: `The whip is the signature 8-count pattern of West Coast Swing and the gateway to an enormous family of variations.

## The shape

- **1–2**: follower travels forward down the slot
- **3&4**: leader steps across the slot and catches the follower's momentum in closed-ish position, redirecting them ("the coil")
- **5–6**: follower travels back down the slot the way they came, leader posts
- **7&8**: anchor

The follower's path is sometimes described as a "down-and-back" on a single track: the whip sends them past the leader, turns them around at the end of the slot, and brings them home.

## What it teaches

Whips are where **stretch** becomes unavoidable: the redirection on 3&4 and the leverage on 5–6 only feel good when both partners maintain elastic connection through their bodies. Rushing count 4 is the classic whip mistake — most teachers drill "wait for the stretch."

## Naming

Some older curricula count the whip's second half differently or teach a "coaster" ending; the 8-count structure above is the one most commonly taught today.[^1]

[^1]: See e.g. [West Coast Swing Online's basic patterns guide](https://www.westcoastswingonline.com/west-coast-swing-basic-patterns/), which teaches the whip as the fourth core pattern with this structure.`,
  },
  {
    name: "Sugar Tuck",
    aliases: ["Tuck Turn", "Push Tuck"],
    difficulty: "beginner",
    tags: ["push family", "spins & turns", "6-count"],
    description: `A sugar push where the compression is redirected into an outside (clockwise) turn for the follower.

## The shape

Danced like a sugar push through counts 1–2, but on **3&4** the leader rotates the follower slightly toward them ("the tuck") and releases into a free outside turn on **4–5**, finishing with an anchor on **5&6**.

## Common notes

- The tuck is a rotation of the follower's frame, not an arm pull; the free turn comes from the follower unwinding the stored rotation.
- Often the first pattern where followers practice **spotting** and controlled free spins.
- Frequently danced with one hand, two hands, or with a hand change behind the leader's back as a styling variation.`,
  },
  {
    name: "Starter Step",
    aliases: ["Intro Step"],
    difficulty: "beginner",
    tags: ["fundamentals", "connection & technique"],
    description: `The little two-triple pattern many dancers use to begin a dance: side triple, side triple (or rock-and-triple), establishing connection and the slot before the first real pattern.

Not universal — plenty of dancers start straight into a sugar push or side pass — but common enough in classes that learners should recognize it. Its real job is a **connection check**: settling weight, matching hand pressure, and agreeing on timing before anything travels.`,
  },
  {
    name: "Anchor Step",
    aliases: ["Anchor"],
    difficulty: "beginner",
    tags: ["fundamentals", "connection & technique"],
    description: `The anchor step is the ending unit of nearly every WCS pattern: a triple (commonly cued as "an-chor-step") danced at the end of the slot during which both partners settle **away** from each other and restore leverage connection.

## Why it matters

The anchor is what makes West Coast Swing elastic. Without a real anchor, patterns blur together and both partners feel rushed; with one, every pattern ends in a moment of stretch that powers the next one. Teachers frequently describe the anchor as "the most important step in WCS."

## Technique notes commonly taught

- Weight stays back over the anchor leg; resist drifting forward toward your partner.
- The anchor is *rhythm-flexible*: advanced dancers replace the standard triple with holds, drags, syncopations, and play — as long as the connection stays anchored.

Strictly speaking this is a **building block** rather than a pattern, but it gets its own page because so much technique instruction centers on it.`,
  },
  {
    name: "Throwout",
    aliases: ["Toss Out", "Whip Throwout", "Slingshot Throwout"],
    difficulty: "intermediate",
    tags: ["whip family", "8-count"],
    description: `A whip-family pattern in which the follower is released ("thrown out") down the slot instead of being brought back to closed position.

Danced like a whip through the first half; on **5–6** the leader lets the follower travel out to open position, often with a free turn, and both anchor apart. Common as a transition from closed-position figures back to open work, and as a dramatic musical accent when the release is timed to a hit in the music.`,
  },
  {
    name: "Inside Roll",
    aliases: ["Inside Turn", "Left Side Pass with Inside Turn"],
    difficulty: "intermediate",
    tags: ["pass family", "spins & turns", "6-count"],
    description: `A left-side pass in which the follower travels down the slot while turning **left (counter-clockwise)** under the joined hands — an inside turn taken while traveling.

## The shape

- **1–2**: as in a left side pass, but the leader raises the joined hand and initiates rotation
- **3&4**: follower rolls through one (or more) traveling turns down the slot
- **5&6**: anchor

## Common notes

- The traveling turn wants a small, centered head and stacked posture; big stepping makes multi-roll variations impossible.
- Leaders: the hand traces a small halo — stirring lowers the follower's axis and kills the turn.
- Frequently extended into double or triple rolls, or into a **barrel roll** when both partners rotate.`,
  },
  {
    name: "Free Spin",
    aliases: ["Follower's Free Spin", "Push Spin"],
    difficulty: "intermediate",
    tags: ["spins & turns", "pass family", "6-count"],
    description: `Any pattern where the follower is released to turn without hand connection — most commonly a right side pass or tuck released into a full free turn.

The lead is finished **before** the spin begins: rotation is offered on the setup counts, the hand releases, and the follower owns the turn. A clean free spin is a spotlight moment for the follower's balance and spotting technique, and one of the most common places musicality happens ("hit the break with a free spin").`,
  },
  {
    name: "Basket Whip",
    aliases: ["Basket"],
    difficulty: "intermediate",
    tags: ["whip family", "wraps & cuddles", "8-count"],
    description: `A whip variation danced with two hands in which the follower is turned at the post into a wrapped ("basket") position facing away from the leader, then unwound home.

The wrap happens around counts **3&4–5** with both hands held low; the exit typically unwinds the follower on **5–6** before the anchor. A friendly first "shape" whip: the geometry is showy but the timing stays plain whip timing. Watch for cranked shoulders — the wrap should sit at the follower's waist, led from body rotation.`,
  },
  {
    name: "Reverse Whip",
    aliases: ["Left Side Whip"],
    difficulty: "intermediate",
    tags: ["whip family", "8-count"],
    description: `A whip danced with the redirection happening on the **left/reverse** side: the leader steps into the slot mirrored from a standard whip and the follower is turned counter-clockwise at the post.

Because everything happens on the "wrong" side, the reverse whip is a favorite test of whether both partners are actually dancing connection rather than pattern memory. Timing is standard 8-count whip timing.`,
  },
  {
    name: "Wrapped Whip",
    aliases: ["Cuddle Whip", "Sweetheart Whip"],
    difficulty: "intermediate",
    tags: ["whip family", "wraps & cuddles", "8-count"],
    description: `A whip variation in which the follower is caught in a wrap (cuddle/sweetheart position — follower's back to the leader's front, arms crossed) at the whip's midpoint, then released down the slot.

Distinguished from the basket whip mainly by the entry and the height/shape of the wrap; scene naming here is famously inconsistent, so expect these two names to blur together in classes. The exit can unwind (follower turns out) or release straight, and both are commonly taught.`,
  },
  {
    name: "Whip with Inside Turn",
    aliases: ["Inside Turn Whip", "Inside Whip"],
    difficulty: "intermediate",
    tags: ["whip family", "spins & turns", "8-count"],
    description: `A whip in which the follower takes an inside (counter-clockwise) turn on counts **5–6** as they travel back down the slot.

The turn is prepped by the leader's raised hand around the post; the follower's travel and the whip timing don't change. Often the first whip variation taught because it isolates one new skill — turning while maintaining whip geometry — without changing the pattern's skeleton.`,
  },
  {
    name: "Whip with Outside Turn",
    aliases: ["Outside Turn Whip"],
    difficulty: "intermediate",
    tags: ["whip family", "spins & turns", "8-count"],
    description: `The mirror of the whip with inside turn: the follower takes an outside (clockwise) turn on counts **5–6** while returning down the slot.

Commonly used to set up spins, hand changes, or free-spin exits. The classic error is starting the turn on 4 instead of after the post — the redirection has to finish before the rotation begins.`,
  },
  {
    name: "Continuous Whip",
    aliases: ["Double Whip", "Whip with Extension"],
    difficulty: "advanced",
    tags: ["whip family", "8-count", "musicality"],
    description: `A whip whose middle is extended by repeating the coil: instead of releasing the follower down the slot on 5–6, the leader keeps the follower rotating around the post for an extra 2 (or more) counts before the exit.

Counted as a 10- or 12-count figure depending on how many extensions are danced. Continuous whips are a workhorse of musicality dancing — the extra counts let you sit inside a musical phrase and exit exactly on the hit. They demand genuinely good posts from the leader and patient, centered rotation from the follower.`,
  },
  {
    name: "Barrel Roll",
    aliases: ["Barrel Turn"],
    difficulty: "advanced",
    tags: ["spins & turns", "pass family"],
    description: `A traveling figure where **both** partners roll down the slot together — the follower in a traveling inside roll while the leader rotates around them in the same lane, trading places as they go.

Usually entered from a left side pass or inside roll setup. The signature feeling is two axes braided down one track: neither partner owns the slot for a moment, and then both do. Requires committed frames and real spotting from both partners, which is why it's usually taught after traveling rolls are solid.`,
  },
  {
    name: "Ripcord",
    aliases: ["Ripcord Roll"],
    difficulty: "intermediate",
    tags: ["spins & turns", "pass family", "6-count"],
    description: `A redirect pattern: the leader begins as if leading an inside roll, then "pulls the ripcord" — reversing the follower's rotation with a small counter-rotation so the follower unwinds the other way and returns down the slot.

The surprise reversal makes it a favorite for playfulness and for matching stutters or rewinds in the music. Should feel like a smooth elastic rebound, not a yank; most instruction emphasizes leading the reversal from the center, softly, with the hand staying close to the follower's axis.`,
  },
  {
    name: "Hip Catch",
    aliases: ["Hip Check Catch"],
    difficulty: "intermediate",
    tags: ["push family", "connection & technique", "musicality"],
    description: `A compression pattern where the follower's forward travel is caught at the leader's hip instead of in the hands — the follower arrives beside the leader, is caught in a brief side-by-side compression, and rebounds back down the slot.

Lives in the same connection family as the sugar push (extension → compression → extension) but with the catch displaced to the side, which reads beautifully on slow, bluesy songs. A common musicality tool for marking a pause or drop in the music.`,
  },
  {
    name: "Left Side Pass with Outside Turn",
    aliases: ["LSP with Outside Turn"],
    difficulty: "intermediate",
    tags: ["pass family", "spins & turns", "6-count"],
    description: `A left side pass in which the follower takes an outside (clockwise) turn while traveling down the slot, led under the joined hands.

The complement to the inside roll on the same side of the slot. Because the rotation runs against the follower's natural facing during the pass, the prep matters more than in the inside version — the turn is offered on 2, taken on 3&4, and finished before the anchor.`,
  },
  {
    name: "Cuddle",
    aliases: ["Sweetheart", "Wrap"],
    difficulty: "intermediate",
    tags: ["wraps & cuddles", "6-count"],
    description: `A 6-count pattern that brings the follower into wrapped position (follower's back to the leader's front, both hands connected, arms crossed in front of the follower) and holds or exits.

The cuddle is a **position**, and this pattern is the standard way in and out of it: enter like a left side pass with two hands, catch the follower into the wrap on 3&4, exit by unwinding or releasing down the slot. Once in the wrap, dancers commonly hang out for extra counts, add sways or body rolls, or chain into wrapped whips — which is why teachers often introduce the cuddle as "a place you can go," not just a pattern.`,
  },
  {
    name: "Kick Ball Change",
    aliases: ["KBC"],
    difficulty: "beginner",
    tags: ["fundamentals", "styling & footwork"],
    description: `A syncopation unit — kick, then a quick ball-change weight transfer — borrowed from vernacular jazz and used constantly in WCS as anchor-step play, filler during extensions, and leader footwork during whips.

Not a pattern on its own, but documented here because it's among the first footwork variations taught, and because "throw a kick ball change on your anchor" is the classic first step into improvised footwork.`,
  },
  {
    name: "Swivels",
    aliases: ["Follower Swivels", "Walk-Walk Swivels"],
    difficulty: "intermediate",
    tags: ["styling & footwork", "connection & technique"],
    description: `Follower styling in which the walk-walk counts (1–2 of most patterns) are danced with the feet closing and the hips rotating through each step — the classic sultry WCS look on slow music.

Swivels are almost always described as **optional styling**, chosen by the follower when the connection and tempo give room for them. Technique instruction usually focuses on swiveling from the standing leg with the core engaged, keeping the travel honest so the pattern timing doesn't distort.`,
  },
  {
    name: "Body Roll",
    aliases: ["Bodywave"],
    difficulty: "intermediate",
    tags: ["styling & footwork", "musicality"],
    description: `A wave passed through the body — chest to center to hips (or the reverse) — used by both roles as musical styling, most commonly during anchors, wraps, and hip catches on slow or contemporary music.

Pure styling vocabulary rather than a led pattern, though it can be *matched* between partners when the connection invites it. Usually practiced solo against a wall or mirror first; the classic cue is to move through the spine sequentially rather than bowing at the waist.`,
  },
  {
    name: "Whip with Hand Change",
    aliases: ["Hand Change Whip", "Behind-the-Back Whip"],
    difficulty: "intermediate",
    tags: ["whip family", "8-count"],
    description: `A whip in which the leader changes the connected hand mid-figure — commonly behind the leader's back at the post, or overhead during the follower's return — ending the pattern in the opposite handhold.

Mostly a connective-tissue pattern: hand changes are how leaders set up the *next* figure (wraps, two-hand patterns, tandem shapes) without stopping the dance. Clean hand changes are quiet; if the follower feels the swap, it was late.`,
  },
];

// relations: [fromMove, toMove, kind]
// "prerequisite": learn toMove before fromMove
// "variation": fromMove is a variation of toMove
// "related": symmetric
export const SEED_RELATIONS: [string, string, RelationKind][] = [
  ["Sugar Tuck", "Sugar Push", "variation"],
  ["Sugar Tuck", "Sugar Push", "prerequisite"],
  ["Hip Catch", "Sugar Push", "related"],
  ["Whip", "Left Side Pass", "prerequisite"],
  ["Whip", "Sugar Push", "prerequisite"],
  ["Throwout", "Whip", "variation"],
  ["Basket Whip", "Whip", "variation"],
  ["Reverse Whip", "Whip", "variation"],
  ["Wrapped Whip", "Whip", "variation"],
  ["Whip with Inside Turn", "Whip", "variation"],
  ["Whip with Outside Turn", "Whip", "variation"],
  ["Continuous Whip", "Whip", "variation"],
  ["Whip with Hand Change", "Whip", "variation"],
  ["Basket Whip", "Cuddle", "related"],
  ["Wrapped Whip", "Cuddle", "related"],
  ["Wrapped Whip", "Basket Whip", "related"],
  ["Inside Roll", "Left Side Pass", "variation"],
  ["Left Side Pass with Outside Turn", "Left Side Pass", "variation"],
  ["Free Spin", "Right Side Pass", "variation"],
  ["Free Spin", "Sugar Tuck", "related"],
  ["Barrel Roll", "Inside Roll", "prerequisite"],
  ["Ripcord", "Inside Roll", "prerequisite"],
  ["Whip with Inside Turn", "Whip", "prerequisite"],
  ["Continuous Whip", "Whip", "prerequisite"],
  ["Basket Whip", "Whip", "prerequisite"],
  ["Swivels", "Anchor Step", "related"],
  ["Kick Ball Change", "Anchor Step", "related"],
  ["Body Roll", "Cuddle", "related"],
  ["Cuddle", "Left Side Pass", "prerequisite"],
];

export type SeedCurriculum = {
  title: string;
  description: string;
  items: { move: string; notes: string }[];
};

export const SEED_CURRICULA: SeedCurriculum[] = [
  {
    title: "WCS Foundations",
    description:
      "The standard first-months path: the core patterns nearly every beginner class teaches, in a common teaching order. Work through it top to bottom — by the end you can survive (and enjoy) any social floor.\n\n*Order is a suggestion, not a law. Different teachers sequence differently, and that's fine.*",
    items: [
      {
        move: "Starter Step",
        notes:
          "Optional but useful from day one: it's really a connection check. Practice matching pressure with your partner before anything travels.",
      },
      {
        move: "Anchor Step",
        notes:
          "Learn this with your very first pattern, not after. If your anchors settle away from your partner, everything else in WCS gets easier. 'Good enough' = you can anchor without drifting forward.",
      },
      {
        move: "Sugar Push",
        notes:
          "The heart of the dance. Focus: relaxed arms, compression from body position, full anchor at the end. You will keep refining this one for years — aim for comfortable, not perfect.",
      },
      {
        move: "Left Side Pass",
        notes:
          "First traveling pattern. Leaders: open the door, don't pull through it. Followers: own your slot — walk straight down it.",
      },
      {
        move: "Right Side Pass",
        notes:
          "Same geometry, other side, plus your first arch. Leaders: the raised hand is an invitation, keep it quiet. Ready to move on when you can dance push/LSP/RSP in any order without thinking.",
      },
      {
        move: "Sugar Tuck",
        notes:
          "Your first turn from compression. Followers: the free turn is yours — practice spotting. Leaders: tuck with rotation, never with a push of the arm.",
      },
      {
        move: "Whip",
        notes:
          "The 8-count milestone. Expect this one to take a while — the redirection on 3&4 ('wait for the stretch') is a genuinely new skill. Drill it slow before you drill it fast.",
      },
      {
        move: "Kick Ball Change",
        notes:
          "Your first anchor variation, and the door into footwork play. Throw it on an anchor when the music tells you to.",
      },
    ],
  },
  {
    title: "Intermediate Patterns & Turns",
    description:
      "For dancers comfortable with the foundations who want vocabulary: traveling turns, the whip family, wraps, and the beginnings of musicality tools. Roughly ordered by how most intermediate curricula sequence them.",
    items: [
      {
        move: "Inside Roll",
        notes:
          "The traveling turn that unlocks half the intermediate syllabus. Followers: small steps, stacked posture. Get one clean roll before chasing doubles.",
      },
      {
        move: "Free Spin",
        notes:
          "Released turns build balance you'll need everywhere. Practice both from a tuck and from a right side pass.",
      },
      {
        move: "Whip with Inside Turn",
        notes: "First whip variation — one new skill on a familiar skeleton. Turn happens after the post, not on it.",
      },
      {
        move: "Whip with Outside Turn",
        notes: "The mirror. If your inside-turn whip is clean, this mostly tests your prep timing.",
      },
      {
        move: "Basket Whip",
        notes: "First wrap. Keep both hands low; the wrap sits at the waist and comes from body rotation.",
      },
      {
        move: "Cuddle",
        notes:
          "Learn the wrap as a *position* you can stay in, decorate, and leave — not just a pattern that ends. Try holding it for an extra 2 counts on slow songs.",
      },
      {
        move: "Wrapped Whip",
        notes: "Combines the last two ideas. Naming varies wildly between scenes — focus on the shape, not the label.",
      },
      {
        move: "Ripcord",
        notes: "Your first redirect. Lead the reversal softly from the center — it should feel like elastic, not a yank.",
      },
      {
        move: "Hip Catch",
        notes: "Compression displaced to the hip. Gorgeous on slow music; practice making the rebound feel unhurried.",
      },
      {
        move: "Throwout",
        notes: "A release with drama. Time it to a hit in the music and you've got your first choreographed-feeling moment.",
      },
      {
        move: "Swivels",
        notes:
          "Followers: styling, always optional. Start with walk-walk swivels on sugar pushes at slow tempos. Leaders: your job is to give room and keep the connection honest.",
      },
      {
        move: "Barrel Roll",
        notes:
          "The capstone: both partners traveling and turning in one lane. Only start this once traveling rolls feel automatic.",
      },
    ],
  },
];
