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
- **5&6**: [[Anchor Step|anchor step]] — both partners settle away from each other and re-establish leverage

## What it teaches

The sugar push is the purest expression of WCS **elastic connection**: extension into compression into extension. Commonly taught points include keeping the arms relaxed so the connection moves your body (not your shoulders), and letting the compression on 3&4 come from body positioning rather than pushing with the hands. Despite the name, there is no actual push: Thibault and Nicole Ramirez teach it as absorbing the follower's energy and sending it back out, warning that "sugar push is a little bit of a misnomer — we don't actually want to push our partners."[^1] Brian B teaches the same idea with a roller-skates image: if the follower were on skates, they would roll in until the connection stopped them, and roll back out only when sent.[^2]

## Common variations

The skeleton stays the same across handholds — list the variant in a clip's note when you spot one:

- **Two-hand** — both hands connected; the most common classroom version, with compression split across both arms.
- **Right-to-left (standard one-hand)** — leader's left to follower's right; frees a hand for styling and hand changes.
- **Right-to-right (handshake)** — sets up tucks, hand changes behind the back, and crossed-hand shapes.
- **Left-to-left** — less common; usually a deliberate setup for a specific next pattern.
- **One-hand with resistance styling, no-hands (body-lead) push** — advanced connection play on the same geometry.

## Naming

Widely also called the **push break**, especially in scenes with roots in East Coast Swing pedagogy. Both names are heard at every event; neither is wrong. The "sugar" traces back to Lindy Hop: strictly, a sugar push includes a **sugar foot** — a follower swivel on the way in — and the swivel-free version is technically a push break, named for the leader breaking away to open position. Over the years the distinction eroded and the two names now describe the same pattern.[^3]

[^1]: Thibault & Nicole Ramirez, ["Sugar Push – The Heart of West Coast Swing"](https://www.youtube.com/watch?v=mM86VQ_hViw&t=172s) at 2:52.
[^2]: Brian B & Megan, West Coast Swing Online, ["How to Dance the West Coast Swing Basic Steps"](https://www.youtube.com/watch?v=dfVpwMLqm-o&t=283s) at 4:43.
[^3]: Brian B, West Coast Swing Online, ["How to Dance the West Coast Swing Basic Steps"](https://www.youtube.com/watch?v=dfVpwMLqm-o&t=368s) at 6:08–7:24.`,
  },
  {
    name: "Left Side Pass",
    aliases: ["LSP"],
    difficulty: "beginner",
    tags: ["fundamentals", "pass family", "6-count"],
    description: `A 6-count pattern where the follower passes the leader on the leader's **left** side. Along with the [[Sugar Push|sugar push]] and [[Right Side Pass|right side pass]], it forms the core triangle of beginner WCS.

## The shape

- **1–2**: leader steps back and slightly off-slot, opening a lane on their left; follower walks forward
- **3&4**: follower passes the leader and turns to face back down the slot
- **5&6**: anchor

The leader redirects the follower's momentum down the slot rather than pulling — a common teaching image is "opening a door" and letting the follower walk through. Robert Royston teaches the lead as saying "after you" at a doorway: the leader steps completely out of the way on count 1 and invites the follower past the left side.[^1]

## Common notes

- Followers generally keep their travel on the slot; a drifting left side pass is one of the most common beginner habits.
- The leader's hand stays low and relaxed ("in the toolbox") — high hands early in this pattern usually mean an accidental [[Inside Roll|inside roll]] is coming.
- Brian B describes the leader's path as *curling out of the slot* on 1–2, letting the follower pass on 3&4, then rejoining the slot on the other side for the anchor.[^2]
- Thibault and Nicole Ramirez teach the same geometry from the follower's side: the leader is always the one who leaves the slot, clearing the path by count 2 so the follower keeps a straight line.[^3]
- They also use this first pattern to introduce WCS's defining feel: keep a light elastic tension through 1–2, pass each other, and find the elastic again — "the elasticity is the signature of our dance."[^4]

[^1]: Robert Royston, ["How to Do the Left Side Pass | Swing Dance"](https://www.youtube.com/watch?v=k7D6Uv8Y0E8&t=43s) (Howcast) at 0:43.
[^2]: Brian B & Megan, West Coast Swing Online, ["West Coast Swing Basic Steps // Beginner WCS"](https://www.youtube.com/watch?v=cKcamMuk3sA&t=195s) at 3:15.
[^3]: Thibault & Nicole Ramirez, ["Left Side Pass – Your First West Coast Swing Move"](https://www.youtube.com/watch?v=GnU7ADF9hP4&t=153s) at 2:33.
[^4]: Thibault & Nicole Ramirez, ["Left Side Pass – Your First West Coast Swing Move"](https://www.youtube.com/watch?v=GnU7ADF9hP4&t=196s) at 3:16.`,
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
- Danced without the raised arm (a simple pass on the right side), the same slot geometry is often just called a *side pass* or *outside pass* depending on the scene.
- The follower's footwork is identical to the [[Left Side Pass|left side pass]] — Brian B calls this "the bonus" of learning the passes together, though the raised hand makes it feel different.[^1]
- As the partners pass, the feet should cross rather than close: Robert Royston teaches that one foot stays crossed in front of the other on the passing triple.[^2]
- Brian B's tip for followers is "getting skinny" — turning the shoulders slightly while passing so the joined hand clears the head easily instead of dragging across the leader's forearm.[^3]
- Thibault Ramirez's memory hook for the lead: raise the left hand as if placing it beside your nose ("leaders, wipe your nose") to put the follower on your right side.[^4]
- The handhold pivots during the pass, so followers shouldn't grab: leave space in the hook and let the ring- and middle-finger connection rotate as you go under — the leader releases and re-catches into the natural hold on the way out.[^5]
- Leaders decide late: count 1 travels down the line either way, and count 2 is where the leader commits to a left side pass or an underarm.[^6]

[^1]: Brian B & Megan, West Coast Swing Online, ["West Coast Swing Basic Steps // Beginner WCS"](https://www.youtube.com/watch?v=cKcamMuk3sA&t=363s) at 6:03.
[^2]: Robert Royston, ["How to Do the Underarm Turn | Swing Dance"](https://www.youtube.com/watch?v=bSu7QJZ5SLU&t=65s) (Howcast) at 1:05.
[^3]: Brian B & Megan, West Coast Swing Online, ["West Coast Swing Basic Steps // Beginner WCS"](https://www.youtube.com/watch?v=cKcamMuk3sA&t=423s) at 7:03.
[^4]: Thibault & Nicole Ramirez, ["Underarm Turn – Learn This Classic WCS Basic"](https://www.youtube.com/watch?v=wIiKVYFA10I&t=46s) at 0:46; the "wipe your nose" cue is from their [Sugar Tuck lesson](https://www.youtube.com/watch?v=ivvl2xtYyBo&t=192s) at 3:12.
[^5]: Thibault & Nicole Ramirez, ["Underarm Turn – Learn This Classic WCS Basic"](https://www.youtube.com/watch?v=wIiKVYFA10I&t=152s) at 2:32–3:08.
[^6]: Thibault & Nicole Ramirez, ["Underarm Turn – Learn This Classic WCS Basic"](https://www.youtube.com/watch?v=wIiKVYFA10I&t=199s) at 3:19.`,
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

The follower's path is sometimes described as a "down-and-back" on a single track: the whip sends them past the leader, turns them around at the end of the slot, and brings them home. Thibault and Nicole Ramirez describe the shape as a paper clip or hairpin turn — very linear, with the leader staying "mostly the base" while the follower travels in and out to finish with a stretch.[^2] It is one of the three basic families of WCS patterns: pushes, passes, and whips.[^3]

## What it teaches

Whips are where **stretch** becomes unavoidable: the redirection on 3&4 and the leverage on 5–6 only feel good when both partners maintain elastic connection through their bodies. Rushing count 4 is the classic whip mistake — most teachers drill "wait for the stretch." Brian B teaches followers to *delay* count 4 and roll through the step heel to toe: landing hard between the leader's feet kills the connection the leader needs for the exit.[^4]

## Naming

Some older curricula count the whip's second half differently or teach a "coaster" ending; the 8-count structure above is the one most commonly taught today.[^1]

[^1]: See e.g. [West Coast Swing Online's basic patterns guide](https://www.westcoastswingonline.com/west-coast-swing-basic-patterns/), which teaches the whip as the fourth core pattern with this structure.
[^2]: Thibault & Nicole Ramirez, ["Whip – The Signature 8-Count Move of WCS"](https://www.youtube.com/watch?v=EPupCziC9bY&t=266s) at 4:26.
[^3]: Thibault & Nicole Ramirez, ["Whip – The Signature 8-Count Move of WCS"](https://www.youtube.com/watch?v=EPupCziC9bY&t=48s) at 0:48.
[^4]: Brian B & Megan, West Coast Swing Online, ["West Coast Swing Basic Steps // Beginner WCS"](https://www.youtube.com/watch?v=cKcamMuk3sA&t=1198s) at 19:58.`,
  },
  {
    name: "Sugar Tuck",
    aliases: ["Tuck Turn", "Push Tuck"],
    difficulty: "beginner",
    tags: ["push family", "spins & turns", "6-count"],
    description: `A [[Sugar Push|sugar push]] where the compression is redirected into an outside (clockwise) turn for the follower.

## The shape

Danced like a sugar push through counts 1–2, but on **3&4** the leader rotates the follower slightly toward them ("the tuck") and releases into a free outside turn on **4–5**, finishing with an anchor on **5&6**.

## Common notes

- The tuck is a rotation of the follower's frame, not an arm pull; the free turn comes from the follower unwinding the stored rotation.
- Often the first pattern where followers practice **spotting** and controlled free spins.
- Frequently danced with one hand, two hands, or with a hand change behind the leader's back as a styling variation.
- Because the leader's hand finishes over the top of the grip, the tuck is commonly followed by an underarm turn ([[Right Side Pass|right side pass]]) to fix the handhold — Brian B calls this fix "magic, and for no extra charge."[^1]
- Raising the lead hand does double duty: Brian B teaches that the raise itself closes the distance between the partners as the tuck sets up.[^2]
- Robert Royston points out the tuck's leverage as a variation factory: led with the left hand up, right hand up, both hands, or no hands (a [[Free Spin|free spin]]), "once you learn the sugar tuck you immediately have four more moves."[^3]
- The signal lives in the leader's left hand: Thibault Ramirez turns the fingers to face out, telling the follower "you're going to rotate outside" — and the follower compresses on a *high point* for 3&4 before unwinding.[^4]
- Keep the handhold loose through the turn: release to catch. Nicole demonstrates letting the hand flip free so the leader can reconnect to the palm — holding a grip makes the switch impossible.[^5]

[^1]: Brian B & Megan, West Coast Swing Online, ["West Coast Swing Basic Steps // Beginner WCS"](https://www.youtube.com/watch?v=cKcamMuk3sA&t=598s) at 9:58.
[^2]: Brian B & Megan, West Coast Swing Online, ["West Coast Swing Basic Steps // Beginner WCS"](https://www.youtube.com/watch?v=cKcamMuk3sA&t=575s) at 9:35.
[^3]: Robert Royston, ["How to Do the Sugar Tuck | Swing Dance"](https://www.youtube.com/watch?v=AzV0eeolJ20&t=68s) (Howcast) at 1:08.
[^4]: Thibault & Nicole Ramirez, ["Sugar Tuck – Add Style with This WCS Variation"](https://www.youtube.com/watch?v=ivvl2xtYyBo&t=38s) at 0:38–1:51.
[^5]: Thibault & Nicole Ramirez, ["Sugar Tuck – Add Style with This WCS Variation"](https://www.youtube.com/watch?v=ivvl2xtYyBo&t=201s) at 3:21–3:46.`,
  },
  {
    name: "Starter Step",
    aliases: ["Intro Step"],
    difficulty: "beginner",
    tags: ["fundamentals", "connection & technique"],
    description: `The little two-triple pattern many dancers use to begin a dance: side triple, side triple (or rock-and-triple), establishing connection and the slot before the first real pattern.

Not universal — plenty of dancers start straight into a [[Sugar Push|sugar push]] or side pass — but common enough in classes that learners should recognize it. Its real job is a **connection check**: settling weight, matching hand pressure, and agreeing on timing before anything travels.

## One taught version

Thibault and Nicole Ramirez teach the starter step from closed position: the partners first "tap the tempo" in place (walk-touch on the beat) for as long as the leader likes, then dance two triple steps — the first to the side, the second opening the position — flowing directly into a [[Left Side Pass|left side pass]].[^1] For the follower, the first triple is the signal: taps can continue indefinitely, but "as soon as we start with the triples, that tells me that the dance has now started."[^2] Their companion rhythm lesson pins down *when* to start: WCS basics come in 6- and 8-count structures, and the dance starts on a **downbeat** — odd counts are downbeats, even counts the upbeats.[^3]

[^1]: Thibault & Nicole Ramirez, ["Starter Step – How to Begin Your West Coast Swing"](https://www.youtube.com/watch?v=5NCgLVFecwI&t=50s) at 0:50.
[^2]: Thibault & Nicole Ramirez, ["Starter Step – How to Begin Your West Coast Swing"](https://www.youtube.com/watch?v=5NCgLVFecwI&t=175s) at 2:55.
[^3]: Thibault & Nicole Ramirez, ["West Coast Swing Rhythm & Timing – Start Dancing on Beat"](https://www.youtube.com/watch?v=qM0bbXMYjd0&t=76s) at 1:16–1:55.`,
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
- Brian B defines the **anchored position** by the connection, not the feet: at the end of the anchor both partners' centers are moved away from each other with connection maintained through the arms, so that when the leader's center moves, the follower moves.[^1]
- The anchor is *rhythm-flexible*: advanced dancers replace the standard triple with holds, drags, syncopations, and play — as long as the connection stays anchored.
- The anchor can also be **extended**: Sean and Alyssa McKeever teach a step–brush–flick variation that lengthens the anchor by two beats, noting that "sometimes we need to extend a six count pattern to fit the music."[^2]

Strictly speaking this is a **building block** rather than a pattern, but it gets its own page because so much technique instruction centers on it.

[^1]: Brian B & Megan, West Coast Swing Online, ["How to Dance the West Coast Swing Basic Steps"](https://www.youtube.com/watch?v=dfVpwMLqm-o&t=331s) at 5:31.
[^2]: Sean & Alyssa McKeever, ["Brush & Flick – WEST COAST SWING Anchor Variation"](https://www.youtube.com/watch?v=djR6DkMX3FU&t=11s) at 0:11 and 2:56.`,
  },
  {
    name: "Throwout",
    aliases: ["Toss Out", "Whip Throwout", "Slingshot Throwout"],
    difficulty: "intermediate",
    tags: ["whip family", "8-count"],
    description: `A [[Whip|whip]]-family pattern in which the follower is released ("thrown out") down the slot instead of being brought back to closed position.

Danced like a whip through the first half; on **5–6** the leader lets the follower travel out to open position, often with a free turn, and both anchor apart. Common as a transition from closed-position figures back to open work, and as a dramatic musical accent when the release is timed to a hit in the music.`,
  },
  {
    name: "Inside Roll",
    aliases: ["Inside Turn", "Left Side Pass with Inside Turn"],
    difficulty: "intermediate",
    tags: ["pass family", "spins & turns", "6-count"],
    description: `A left-side pass in which the follower travels down the slot while turning **left (counter-clockwise)** under the joined hands — an inside turn taken while traveling.

## The shape

- **1–2**: as in a [[Left Side Pass|left side pass]], but the leader raises the joined hand and initiates rotation
- **3&4**: follower rolls through one (or more) traveling turns down the slot
- **5&6**: anchor

## Common notes

- The traveling turn wants a small, centered head and stacked posture; big stepping makes multi-roll variations impossible.
- Leaders: the hand traces a small halo — stirring lowers the follower's axis and kills the turn.
- Frequently extended into double or triple rolls, or into a **[[Barrel Roll|barrel roll]]** when both partners rotate.
- The name is literal: Brian B teaches that the joined hand "cuts inside our heads" as it passes between the partners — hence *inside* turn.[^1]
- The double prep ("prep, prep") that beginners often learn is mostly unnecessary — only the second prep sets the follower's energy for the turn. Big double preps are usually a symptom of weak connection: the better the connection, the less the hand has to visibly move.[^2]

[^1]: Brian B & Megan, West Coast Swing Online, ["Beginner West Coast Swing | How to Prep and Inside Turn"](https://www.youtube.com/watch?v=fEIwV6bFTqk&t=46s) at 0:46.
[^2]: Brian B & Megan, West Coast Swing Online, ["Beginner West Coast Swing | How to Prep and Inside Turn"](https://www.youtube.com/watch?v=fEIwV6bFTqk&t=65s) at 1:05–2:10.`,
  },
  {
    name: "Free Spin",
    aliases: ["Follower's Free Spin", "Push Spin"],
    difficulty: "intermediate",
    tags: ["spins & turns", "pass family", "6-count"],
    description: `Any pattern where the follower is released to turn without hand connection — most commonly a [[Right Side Pass|right side pass]] or tuck released into a full free turn.

The lead is finished **before** the spin begins: rotation is offered on the setup counts, the hand releases, and the follower owns the turn. A clean free spin is a spotlight moment for the follower's balance and spotting technique, and one of the most common places musicality happens ("hit the break with a free spin").

## Common notes

- Brian B likes to initiate the basic free spin from the leader's **right** hand (reached from a [[Sugar Push|sugar push]]) so the follower never has a hand over their head.[^1]
- The prep follows the same rule as other turns: two preps are taught but only the second is needed, and the most advanced version is just a slight *expansion* on count 2 — "when this is done well you shouldn't actually see the hand move."[^2]
- Clear follower footwork on "3-and" (close the feet, step down the line, pivot) is what makes free-spin variations leadable — the leader needs that moment to pick up the follower's back and redirect.[^3]

[^1]: Brian B & Megan, West Coast Swing Online, ["3 Free Spin Variations for West Coast Swing!"](https://www.youtube.com/watch?v=MyZsVRB89ik&t=22s) at 0:22.
[^2]: Brian B & Megan, West Coast Swing Online, ["3 Free Spin Variations for West Coast Swing!"](https://www.youtube.com/watch?v=MyZsVRB89ik&t=93s) at 1:33–2:18.
[^3]: Brian B & Megan, West Coast Swing Online, ["3 Free Spin Variations for West Coast Swing!"](https://www.youtube.com/watch?v=MyZsVRB89ik&t=146s) at 2:26–3:23.`,
  },
  {
    name: "Basket Whip",
    aliases: ["Basket", "Locked Whip"],
    difficulty: "intermediate",
    tags: ["whip family", "wraps & cuddles", "8-count"],
    description: `A [[Whip|whip]] variation danced with two hands in which the follower is turned at the post into a wrapped ("basket") position facing away from the leader, then unwound home.

The wrap happens around counts **3&4–5** with both hands held low; the exit typically unwinds the follower on **5–6** before the anchor. A friendly first "shape" whip: the geometry is showy but the timing stays plain whip timing. Watch for cranked shoulders — the wrap should sit at the follower's waist, led from body rotation.

## Common notes

- Regionally also called the **locked whip**: Robert Royston notes "some places in the country call this a basket whip. Locked whip, basket whip — same thing."[^1]
- The follower's path is dead straight — all the way forward with no turn, then straight back — while the leader dances the same footwork as a basic whip.[^2]
- Keep the basket relaxed: the leader's hand rests at the follower's hip and the free hand stays off the body rather than clamping the wrap shut.[^3]
- The lead is a shape, not a pull: Brian B teaches "creating a basket with my right arm that she comes into" — and points out the built-in delay at the far end, where the follower stays anchored away until the leader moves across.[^4]

[^1]: Robert Royston, ["How to Do Locked Whip in West Coast | Swing Dance"](https://www.youtube.com/watch?v=v6ifac32Pww&t=13s) (Howcast) at 0:13.
[^2]: Robert Royston, ["How to Do Locked Whip in West Coast | Swing Dance"](https://www.youtube.com/watch?v=v6ifac32Pww&t=25s) (Howcast) at 0:25.
[^3]: Robert Royston, ["How to Do Locked Whip in West Coast | Swing Dance"](https://www.youtube.com/watch?v=v6ifac32Pww&t=52s) (Howcast) at 0:52.
[^4]: Brian B & Megan, West Coast Swing Online, ["The Basket Whip for West Coast Swing"](https://www.youtube.com/watch?v=XrjWjMDHUTg&t=52s) at 0:52–2:04.`,
  },
  {
    name: "Reverse Whip",
    aliases: ["Left Side Whip", "Cutoff Whip"],
    difficulty: "intermediate",
    tags: ["whip family", "8-count"],
    description: `A [[Whip|whip]] danced with the redirection happening on the **left/reverse** side: the leader steps into the slot mirrored from a standard whip and the follower is turned counter-clockwise at the post.

Because everything happens on the "wrong" side, the reverse whip is a favorite test of whether both partners are actually dancing connection rather than pattern memory. Timing is standard 8-count whip timing.

## Common notes

- The good news is asymmetric: the leader keeps basic whip footwork while the follower's footwork changes — turning **away** from the partner, over the left shoulder, instead of toward them.[^1] Brian B has also heard the pattern called the **cutoff whip**; naming varies between scenes.[^2]
- Filipe de Barros preps the reverse turn by slowing one side of the follower's body — letting the right shoulder stay back on count 2 — and stresses catching the follower's back *early*, around "3-and": taken too late, the connection is already gone.[^3]
- A practical use: when a follower breaks frame and walks in on you, a reverse whip often absorbs the situation cleanly.[^4]

[^1]: Brian B & Megan, West Coast Swing Online, ["The Reverse Whip for West Coast Swing"](https://www.youtube.com/watch?v=OLXJylMWZto&t=45s) at 0:45.
[^2]: Brian B & Megan, West Coast Swing Online, ["The Reverse Whip for West Coast Swing"](https://www.youtube.com/watch?v=OLXJylMWZto&t=22s) at 0:22.
[^3]: Filipe de Barros, ["The Reverse Whip & Variations - West Coast Swing Tutorial"](https://www.youtube.com/watch?v=2Zvz7e_MXXo&t=124s) at 2:04–3:01.
[^4]: Filipe de Barros, ["The Reverse Whip & Variations - West Coast Swing Tutorial"](https://www.youtube.com/watch?v=2Zvz7e_MXXo&t=36s) at 0:36.`,
  },
  {
    name: "Wrapped Whip",
    aliases: ["Cuddle Whip", "Sweetheart Whip"],
    difficulty: "intermediate",
    tags: ["whip family", "wraps & cuddles", "8-count"],
    description: `A [[Whip|whip]] variation in which the follower is caught in a wrap ([[Cuddle|cuddle]]/sweetheart position — follower's back to the leader's front, arms crossed) at the whip's midpoint, then released down the slot.

Distinguished from the [[Basket Whip|basket whip]] mainly by the entry and the height/shape of the wrap; scene naming here is famously inconsistent, so expect these two names to blur together in classes. The exit can unwind (follower turns out) or release straight, and both are commonly taught.

## One taught route in

Matt and Maggie (Daily Dance Services) teach a two-sets-of-six version: a **half whip** ending in a right-to-left handhold, then rolling the follower into a wrap on the leader's left side facing down the slot, with a tuck-turn exit turning the follower out clockwise.[^1] Their key lead point: open your line and ask for the follower's free hand as the roll-in starts — collect it too late and the tuck exit is gone.[^2] Because back-to-back 6-count chunks come fast, they stress resetting the connection at the end of each piece.[^3]

[^1]: Matt & Maggie, Daily Dance Services, ["Half Whip Wrap & Tuck Turn"](https://www.youtube.com/watch?v=TTHHevW2r7E&t=73s) at 1:13–1:47.
[^2]: Matt & Maggie, Daily Dance Services, ["Half Whip Wrap & Tuck Turn"](https://www.youtube.com/watch?v=TTHHevW2r7E&t=353s) at 5:53–6:17.
[^3]: Matt & Maggie, Daily Dance Services, ["Half Whip Wrap & Tuck Turn"](https://www.youtube.com/watch?v=TTHHevW2r7E&t=411s) at 6:51.`,
  },
  {
    name: "Whip with Inside Turn",
    aliases: ["Inside Turn Whip", "Inside Whip"],
    difficulty: "intermediate",
    tags: ["whip family", "spins & turns", "8-count"],
    description: `A [[Whip|whip]] in which the follower takes an inside (counter-clockwise) turn on counts **5–6** as they travel back down the slot.

The turn is prepped by the leader's raised hand around the post; the follower's travel and the whip timing don't change. Often the first whip variation taught because it isolates one new skill — turning while maintaining whip geometry — without changing the pattern's skeleton.

## Common notes

- The name is literal: Robert Royston defines an *inside* turn as the lead hand passing inside — between the two partners — where an outside turn sends the lead hand away from the body.[^1]
- The prep starts early: the lead hand begins rising on "3-and" into count 4, so the follower knows she's going underneath before the turn arrives on 5.[^2]
- Create room at the redirection — crossing the hand in front crowds the partnership if the partners are too close on the "3-and."[^3]

[^1]: Robert Royston, ["How to Do a Whip with an Inside Turn | Swing Dance"](https://www.youtube.com/watch?v=TMpTWmn7jQM&t=43s) (Howcast) at 0:43.
[^2]: Robert Royston, ["How to Do a Whip with an Inside Turn | Swing Dance"](https://www.youtube.com/watch?v=TMpTWmn7jQM&t=36s) (Howcast) at 0:36.
[^3]: Robert Royston, ["How to Do a Whip with an Inside Turn | Swing Dance"](https://www.youtube.com/watch?v=TMpTWmn7jQM&t=68s) (Howcast) at 1:08.`,
  },
  {
    name: "Whip with Outside Turn",
    aliases: ["Outside Turn Whip"],
    difficulty: "intermediate",
    tags: ["whip family", "spins & turns", "8-count"],
    description: `The mirror of the [[Whip with Inside Turn|whip with inside turn]]: the follower takes an outside (clockwise) turn on counts **5–6** while returning down the slot.

Commonly used to set up spins, hand changes, or free-spin exits. The classic error is starting the turn on 4 instead of after the post — the redirection has to finish before the rotation begins.

## Common notes

- The lead arm stays **long and open** through the redirection for a single turn; Robert Royston warns that bringing the arm in and tightening it up usually turns the single into a double turn (fine, but know which one you led).[^1]
- In the double-turn version each step is a half rotation, and either version finishes with an underarm turn to fix the handhold.[^2]

[^1]: Robert Royston, ["How to Do Whip w/ a Single Outside Turn | Swing Dance"](https://www.youtube.com/watch?v=UGs-q6lc-Cc&t=54s) (Howcast) at 0:54.
[^2]: Robert Royston, ["How to Do Whip w/ a Single Outside Turn | Swing Dance"](https://www.youtube.com/watch?v=UGs-q6lc-Cc&t=81s) (Howcast) at 1:21.`,
  },
  {
    name: "Continuous Whip",
    aliases: ["Double Whip", "Whip with Extension", "Extended Whip"],
    difficulty: "advanced",
    tags: ["whip family", "8-count", "musicality"],
    description: `A [[Whip|whip]] whose middle is extended by repeating the coil: instead of releasing the follower down the slot on 5–6, the leader keeps the follower rotating around the post for an extra 2 (or more) counts before the exit.

Counted as a 10- or 12-count figure depending on how many extensions are danced. Continuous whips are a workhorse of musicality dancing — the extra counts let you sit inside a musical phrase and exit exactly on the hit. They demand genuinely good posts from the leader and patient, centered rotation from the follower.

## Common notes

- The whole trick lives on count 4: Brian B teaches it as the leader holding the follower's weight and *pivoting them on that foot* while sneaking his own foot across into a spot where he can catch the weight — put the foot in the wrong place and the catch (and the timing) falls apart.[^1]
- The matching follower skill is a clean pivot on the ball of one foot with the weight staying forward over it — if the follower isn't comfortable pivoting, the extension can't be led smoothly.[^2]
- On length: around 12 counts is a good maximum — "if you extend it longer than that you probably forgot how to come out of it."[^3]

[^1]: Brian B & Megan, West Coast Swing Online, ["The Extended Whip for WCS!"](https://www.youtube.com/watch?v=DqqWs68b1LE&t=39s) at 0:39–3:30.
[^2]: Brian B & Megan, West Coast Swing Online, ["The Extended Whip for WCS!"](https://www.youtube.com/watch?v=DqqWs68b1LE&t=88s) at 1:28.
[^3]: Brian B & Megan, West Coast Swing Online, ["The Extended Whip for WCS!"](https://www.youtube.com/watch?v=DqqWs68b1LE&t=34s) at 0:34.`,
  },
  {
    name: "Barrel Roll",
    aliases: ["Barrel Turn"],
    difficulty: "advanced",
    tags: ["spins & turns", "pass family"],
    description: `A traveling figure where **both** partners roll down the slot together — the follower in a traveling [[Inside Roll|inside roll]] while the leader rotates around them in the same lane, trading places as they go.

Usually entered from a [[Left Side Pass|left side pass]] or inside roll setup. The signature feeling is two axes braided down one track: neither partner owns the slot for a moment, and then both do. Requires committed frames and real spotting from both partners, which is why it's usually taught after traveling rolls are solid.

## Common notes

- A common two-hand version (taught by Matt Davis and Desiree) enters from a push break: an outside-turn lead from the leader's right hand, both hands traveling up and over the heads while the leader turns only about 90 degrees.[^1]
- Height differences are handled with the arms, not the spine — leaning backwards to clear a shorter partner "knocks the follower off their slot"; instead take the elbows back over the shoulders.[^2]
- Followers: keep filling out the full length of the slot through the roll rather than collapsing toward the middle.[^3]

[^1]: Matt Davis & Desiree, Rising Tide Swing Dance Studio, ["WCS Guide #80 – Barrel Roll Rock & Go!"](https://www.youtube.com/watch?v=lDKsWDw5dxk&t=76s) at 1:16.
[^2]: Matt Davis & Desiree, Rising Tide Swing Dance Studio, ["WCS Guide #80 – Barrel Roll Rock & Go!"](https://www.youtube.com/watch?v=lDKsWDw5dxk&t=94s) at 1:34.
[^3]: Matt Davis & Desiree, Rising Tide Swing Dance Studio, ["WCS Guide #80 – Barrel Roll Rock & Go!"](https://www.youtube.com/watch?v=lDKsWDw5dxk&t=173s) at 2:53.`,
  },
  {
    name: "One Footed Spin",
    aliases: ["One Foot Spin", "Pirouette"],
    difficulty: "advanced",
    tags: ["spins & turns", "connection & technique"],
    description: `A spin danced on a single foot — the partnered cousin of the ballet pirouette[^1] — usually danced by the follower, most often on the right foot, with the leader's hand keeping a light connection overhead. Multiple rotations on one foot are among the showiest skills in WCS, and among the most drilled.

## The setup

The lead comes from the leader's right hand — to the follower's left, or right-to-right off a hand change. Counts 1–2 stay calm, then on 3 the leader gives a small "up" that sets the follower onto the spinning foot, and the rotation happens in place before stepping out.[^2]

## Technique commonly taught

Brian B teaches one-footed spins as three keys — balance, rotation around the connection, and creating rotation — in that order.[^1]

- **Balance before everything.** Find the balance point over the "three-toe base" (the first three toes) with the heel up, then drill quarter turns, half turns, and finally full turns, finishing each one balanced. If you can't stand on one foot for ten seconds, more turns won't help.[^3]
- **Less energy than you think.** "A hundred out of a hundred times everyone has too much energy." Use the least energy that completes the turn — that's what preserves balance. As Brian B puts it, the first turn is free; the second is where the skill starts.[^4]
- **Extra turns come from the flare.** Let the free leg flare slightly on the first rotation, then pull it in — the ice-skater trick: rotation speeds up as the radius shrinks. Where the leg tucks (ankle, crossed, figure-four) matters less than the pull-in itself.[^5]
- **The leader circles the head.** During the spin the leader's hand traces a small circle around the follower's head so that, from the follower's side, the arm effectively stays in one place — never pushing the follower under their own arm.[^6]
- **A quiet hand beats a busy one.** Analyzing Ben Morris's lead, Nerdy WCS notes the hand change on 2 and a compression prep on 3, after which the hand *stops traveling through space* — it stays put and lets the follower come around before anything changes height.[^7]
- **Spotting is personal.** Down-the-line and a fixed front are the common answers, and when the leader travels around the spinning follower, the follower spots the *leader* — which is why those revolutions aren't clean full turns.[^8]

[^1]: Brian B & Megan, West Coast Swing Online, ["3 Keys to One Footed Spins"](https://www.youtube.com/watch?v=tW7Yv1KZogs&t=43s) at 0:43.
[^2]: Brian B & Megan, West Coast Swing Online, ["3 Keys to One Footed Spins"](https://www.youtube.com/watch?v=tW7Yv1KZogs&t=875s) at 14:35.
[^3]: Brian B & Megan, West Coast Swing Online, ["3 Keys to One Footed Spins"](https://www.youtube.com/watch?v=tW7Yv1KZogs&t=173s) at 2:53–5:20.
[^4]: Brian B & Megan, West Coast Swing Online, ["3 Keys to One Footed Spins"](https://www.youtube.com/watch?v=tW7Yv1KZogs&t=474s) at 7:54–8:51.
[^5]: Brian B & Megan, West Coast Swing Online, ["3 Keys to One Footed Spins"](https://www.youtube.com/watch?v=tW7Yv1KZogs&t=591s) at 9:51–12:07.
[^6]: Brian B & Megan, West Coast Swing Online, ["One footed spins for #wcs"](https://www.youtube.com/watch?v=HIavlzCSIDc&t=16s) at 0:16.
[^7]: Cassie Winter & Alicia Marshall, Nerdy West Coast Swing, ["Spin Technique | One Foot Spins in West Coast Swing"](https://www.youtube.com/watch?v=KYRStjChChw&t=802s) at 13:22–13:56.
[^8]: Cassie Winter & Alicia Marshall, Nerdy West Coast Swing, ["Spin Technique | One Foot Spins in West Coast Swing"](https://www.youtube.com/watch?v=KYRStjChChw&t=245s) at 4:05; Brian B at [15:56](https://www.youtube.com/watch?v=tW7Yv1KZogs&t=956s).`,
  },
  {
    name: "Hip Catch",
    aliases: ["Hip Check Catch"],
    difficulty: "intermediate",
    tags: ["push family", "connection & technique", "musicality"],
    description: `A compression pattern where the follower's forward travel is caught at the leader's hip instead of in the hands — the follower arrives beside the leader, is caught in a brief side-by-side compression, and rebounds back down the slot.

Lives in the same connection family as the [[Sugar Push|sugar push]] (extension → compression → extension) but with the catch displaced to the side, which reads beautifully on slow, bluesy songs. A common musicality tool for marking a pause or drop in the music.

## Common notes

- Hip catches showcase one of WCS's signature ideas: connection points beyond the hands — forearm, tricep, hips, bottom of the ribs — with the follower always filling the space that's offered.[^1]
- Filipe de Barros rolls in like a [[Left Side Pass|left side pass]], arriving with the forearm at the follower's waist, and recommends catching on the **bony part of the hip** rather than the ribs or the fleshy part.[^2]
- The connection is two-way: the follower gives the weight of the hip into the leader's hand, then waits — reading the lead's energy rather than pre-empting the exit.[^3]
- Standard exits include spinning the follower out, redirecting to a catch on the *other* hip, or rising into a tuck.[^4]

[^1]: Filipe de Barros, ["Upgrade Your Hip Catch: Basic + 3 Creative Variations"](https://www.youtube.com/watch?v=lXYYpK4cm3k&t=40s) at 0:40.
[^2]: Filipe de Barros, ["West Coast Swing - The Hip Catch: A Guide!"](https://www.youtube.com/watch?v=IPo2KD5jOQ0&t=48s) at 0:48–2:04.
[^3]: Filipe de Barros, ["West Coast Swing - The Hip Catch: A Guide!"](https://www.youtube.com/watch?v=IPo2KD5jOQ0&t=184s) at 3:04.
[^4]: Filipe de Barros, ["West Coast Swing - The Hip Catch: A Guide!"](https://www.youtube.com/watch?v=IPo2KD5jOQ0&t=357s) at 5:57.`,
  },
  {
    name: "Left Side Pass with Outside Turn",
    aliases: ["LSP with Outside Turn"],
    difficulty: "intermediate",
    tags: ["pass family", "spins & turns", "6-count"],
    description: `A [[Left Side Pass|left side pass]] in which the follower takes an outside (clockwise) turn while traveling down the slot, led under the joined hands.

The complement to the [[Inside Roll|inside roll]] on the same side of the slot. Because the rotation runs against the follower's natural facing during the pass, the prep matters more than in the inside version — the turn is offered on 2, taken on 3&4, and finished before the anchor.`,
  },
  {
    name: "Cuddle",
    aliases: ["Sweetheart", "Wrap"],
    difficulty: "intermediate",
    tags: ["wraps & cuddles", "6-count"],
    description: `A 6-count pattern that brings the follower into wrapped position (follower's back to the leader's front, both hands connected, arms crossed in front of the follower) and holds or exits.

The cuddle is a **position**, and this pattern is the standard way in and out of it: enter like a [[Left Side Pass|left side pass]] with two hands, catch the follower into the wrap on 3&4, exit by unwinding or releasing down the slot. Once in the wrap, dancers commonly hang out for extra counts, add sways or body rolls, or chain into wrapped whips — which is why teachers often introduce the cuddle as "a place you can go," not just a pattern.

## One taught version

Brian B teaches the roll into sweetheart position from a right-to-right handhold: the leader dances left-side-pass footwork but stops **on the rail of the slot** on count 4 (not in it, not out of it) while the follower takes a left spinning side pass, landing forward on 4. The key detail is a mild stop in the leader's right hand on 4 so the follower settles forward over the right foot — then both partners connect *away* from that point for the anchor.[^1] The same entry is taught as a 6-count or an 8-count (walk-walk-triple, walk-walk-triple) figure.[^2]

[^1]: Brian B & Megan, West Coast Swing Online, ["Intermediate West Coast Swing Pattern"](https://www.youtube.com/watch?v=5O1VkJgiYFQ&t=158s) (roll in/roll out to sweetheart) at 2:38–3:55.
[^2]: Brian B & Megan, West Coast Swing Online, ["Intermediate West Coast Swing Pattern"](https://www.youtube.com/watch?v=5O1VkJgiYFQ&t=260s) at 4:20.`,
  },
  {
    name: "Kick Ball Change",
    aliases: ["KBC"],
    difficulty: "beginner",
    tags: ["fundamentals", "styling & footwork"],
    description: `A syncopation unit — kick, then a quick ball-change weight transfer — borrowed from vernacular jazz and used constantly in WCS as anchor-step play, filler during extensions, and leader footwork during whips.

Not a pattern on its own, but documented here because it's among the first footwork variations taught, and because "throw a kick ball change on your anchor" is the classic first step into improvised footwork.

## Common notes

- Syncopations like this are **neither led nor followed** — either partner (or both) can dance one on their own while the other keeps regular rhythm.[^1]
- Technique from DrDanceRight: the full unit is "kick, ball, foot flat," and the kick stays compact — kicked *down and up* with a little snap in the knee, not out.[^2]
- Keep the top still while the feet play — "the mark of a better dancer is to always keep the top very still." In practice the follower often joins in on the second repetition, once she's seen the leader do it.[^3]

[^1]: DrDanceRight, ["West Coast Swing 403: Syncopation 1"](https://www.youtube.com/watch?v=RPI-toEPBJI&t=6s) at 0:06.
[^2]: DrDanceRight, ["West Coast Swing 403: Syncopation 1"](https://www.youtube.com/watch?v=RPI-toEPBJI&t=27s) at 0:27–1:07.
[^3]: DrDanceRight, ["West Coast Swing 403: Syncopation 1"](https://www.youtube.com/watch?v=RPI-toEPBJI&t=186s) at 3:06–3:39.`,
  },
  {
    name: "Swivels",
    aliases: ["Follower Swivels", "Walk-Walk Swivels"],
    difficulty: "intermediate",
    tags: ["styling & footwork", "connection & technique"],
    description: `Follower styling in which the walk-walk counts (1–2 of most patterns) are danced with the feet closing and the hips rotating through each step — the classic sultry WCS look on slow music.

Swivels are almost always described as **optional styling**, chosen by the follower when the connection and tempo give room for them. Technique instruction usually focuses on swiveling from the standing leg with the core engaged, keeping the travel honest so the pattern timing doesn't distort.

## Common notes

- A simple placement rule from Megan (West Coast Swing Online): almost any triple step that rotates a half turn can be replaced with a swivel or sweep — anchors included.[^1]
- Three sizes to play with: tight and low; bigger, sweeping out and back in before the step; or lifted.[^2]
- Done on time, swivels don't disturb the partnership: the leader keeps thinking "triple step" and the follower is on the expected foot at the expected moment.[^3]

[^1]: Brian B & Megan, West Coast Swing Online, ["Swivels & Sweeps for West Coast Swing"](https://www.youtube.com/watch?v=CxmxOcX97zc&t=16s) at 0:16.
[^2]: Brian B & Megan, West Coast Swing Online, ["Swivels & Sweeps for West Coast Swing"](https://www.youtube.com/watch?v=CxmxOcX97zc&t=46s) at 0:46.
[^3]: Brian B & Megan, West Coast Swing Online, ["Swivels & Sweeps for West Coast Swing"](https://www.youtube.com/watch?v=CxmxOcX97zc&t=67s) at 1:07.`,
  },
  {
    name: "Body Roll",
    aliases: ["Bodywave"],
    difficulty: "intermediate",
    tags: ["styling & footwork", "musicality"],
    description: `A wave passed through the body — chest to center to hips (or the reverse) — used by both roles as musical styling, most commonly during anchors, wraps, and hip catches on slow or contemporary music.

Pure styling vocabulary rather than a led pattern, though it can be *matched* between partners when the connection invites it. Usually practiced solo against a wall or mirror first; the classic cue is to move through the spine sequentially rather than bowing at the waist.

## Common notes

- The standard sequence taught at West Coast Swing Online: going down it's shoulder, then ribcage, then hips; coming back up the order reverses — hips, ribcage, shoulder — with the head initiating whichever direction you start.[^1]
- The wall drill: stand a touch away from a wall (or with your head against it), peel away segment by segment, feel like you got "punched in the stomach" at the contraction, then roll back up from the hips.[^2]
- Keep a bend in the knees — "it's really, really hard to do any of this movement with straight legs."[^3]

[^1]: Emily & Megan, West Coast Swing Online, ["Body Rolls for Leaders and Followers - West Coast Swing"](https://www.youtube.com/watch?v=I-eRBXV0V6c&t=104s) at 1:44–3:13.
[^2]: Emily & Megan, West Coast Swing Online, ["Body Rolls for Leaders and Followers - West Coast Swing"](https://www.youtube.com/watch?v=I-eRBXV0V6c&t=301s) at 5:01.
[^3]: Emily & Megan, West Coast Swing Online, ["Body Rolls for Leaders and Followers - West Coast Swing"](https://www.youtube.com/watch?v=I-eRBXV0V6c&t=400s) at 6:40.`,
  },
  {
    name: "Whip with Hand Change",
    aliases: ["Hand Change Whip", "Behind-the-Back Whip"],
    difficulty: "intermediate",
    tags: ["whip family", "8-count"],
    description: `A [[Whip|whip]] in which the leader changes the connected hand mid-figure — commonly behind the leader's back at the post, or overhead during the follower's return — ending the pattern in the opposite handhold.

Mostly a connective-tissue pattern: hand changes are how leaders set up the *next* figure (wraps, two-hand patterns, tandem shapes) without stopping the dance. Clean hand changes are quiet; if the follower feels the swap, it was late.

## Common notes

- Followers, stay stretched away through every switch: in hand-change whips the follower's job is to keep the away connection while meeting each new hand — Desiree (Rising Tide) warns that missing one of the hand movements "will make this whip particularly impossible for your leader."[^1]

[^1]: Matt Davis & Desiree, Rising Tide Swing Dance Studio, ["Open Reverse Whip with Leader's Turn! – WCS Guide #162"](https://www.youtube.com/watch?v=N1xwmyM5pI4&t=143s) at 2:23–3:31.`,
  },
  {
    name: "Duck",
    aliases: ["Duck Under", "Head Duck"],
    difficulty: "intermediate",
    tags: ["spins & turns", "connection & technique"],
    description: `A move where one partner — usually the follower — ducks briefly under the joined hands as the arm passes overhead, most often layered onto an [[Inside Roll|inside turn]] or a [[Whip|whip]].

## For followers

- Read the speed of the lead through the connection: the leader may take the turn slow or syncopate it faster, and matching their pace is what keeps an elbow out of your face.[^1]
- Duck **late and briefly**: most people get dizzy turning with their head down, so stay upright through the turn and only pop the head down and back up between counts 3 and 4, when you feel the leader's arm coming over.[^2]
- Keep your free arm in a ready frame — a hanging arm gets trapped under the joined hands and the duck stops working.[^3]
- On an open-whip head duck, expand and open the back on count 5 rather than collapsing the frame — that's what gives the leader room to build the window.[^4]

## For leaders

Brian B teaches ducks on patterns the follower already owns (inside turn from either hand, basic whip): once the follower is prepped and turning on her own, slide the joined hand down to her **elbow or armpit** — the elbow is "cooler and easier" because lifting it leaves more room — then travel the hand *out and around* her path with your elbow to the sky. A flat elbow or a cut-off path is how followers get hit in the back of the head.[^5]

[^1]: Megan, West Coast Swing Online, ["West Coast Swing Ducks | What You Should Know About Ducking"](https://www.youtube.com/watch?v=S16GYhXK47M&t=42s) at 0:42.
[^2]: Megan, West Coast Swing Online, ["West Coast Swing Ducks | What You Should Know About Ducking"](https://www.youtube.com/watch?v=S16GYhXK47M&t=106s) at 1:46–2:44.
[^3]: Brian B & Megan, West Coast Swing Online, ["How to dance a "DUCK" in West Coast Swing - 3 Different Ducks!"](https://www.youtube.com/watch?v=GJv6HOzo93A&t=286s) at 4:46.
[^4]: Matt Davis & Desiree, Rising Tide Swing Dance Studio, ["Underarm Open Whip with a Head Duck! – WCS Guide #161"](https://www.youtube.com/watch?v=_1uYSrYR2bs&t=149s) at 2:29.
[^5]: Brian B & Megan, West Coast Swing Online, ["How to dance a "DUCK" in West Coast Swing - 3 Different Ducks!"](https://www.youtube.com/watch?v=GJv6HOzo93A&t=162s) at 2:42–3:47.`,
  },
  {
    name: "Open Whip",
    aliases: ["Hustle Whip"],
    difficulty: "intermediate",
    tags: ["whip family", "8-count"],
    description: `A [[Whip|whip]] danced without the closed-position catch: the connection stays in the hands the whole way, so there's an extra arm's length between the partners at the redirection.

## How it differs from the basic whip

In a basic whip the leader essentially holds their spot while the follower travels; in an open whip **both partners travel roughly equal amounts** — EastonSwing describes it as "a changing of places that happens twice," and notes it's also called a hustle whip.[^1] Because there's no body-to-body catch, the leader has to eat that extra arm's length with their own travel — moving counter to the follower down the slot on 2 and "3-and" — instead of catching and redirecting in place.[^2]

## Common notes

- Danced plain it's "a bit flat" — the pattern almost demands an exit turn, and both inside- and outside-turn exits are standard. The naming rule: if the joined hands travel *outside* the partnership first it's an outside turn, *inside* first (between the partners) it's an inside turn — which means an open-whip inside turn can genuinely feel like an outside turn to the follower.[^3]
- Followers: the "3-and" feels long here because of the open hold — hang out in it and don't rush forward into count 4. There's real distance for the arm and body to make up before the leader places you.[^4]
- Followers also get an "end arm" moment as the slack gets eaten up: let the frame extend momentarily, then collect it on the way back.[^5]
- A [[Sugar Push|sugar push]] is the standard way to arrive in the two-hand or open hold that starts one.[^3]

[^1]: EastonSwing, ["West Coast Swing, Level 2, Open Whip Variations"](https://www.youtube.com/watch?v=UqjnOxLE6zM&t=66s) at 1:04–1:36.
[^2]: Matt Davis & Desiree, Rising Tide Swing Dance Studio, ["Open Whip and Exits! – WCS Guide #271"](https://www.youtube.com/watch?v=lKSaRBg6VE8&t=68s) at 1:08–1:45.
[^3]: Matt Davis & Desiree, Rising Tide Swing Dance Studio, ["Open Whip and Exits! – WCS Guide #271"](https://www.youtube.com/watch?v=lKSaRBg6VE8&t=181s) at 3:01–4:04; EastonSwing at [1:36](https://www.youtube.com/watch?v=UqjnOxLE6zM&t=96s).
[^4]: Matt Davis & Desiree, Rising Tide Swing Dance Studio, ["Underarm Open Whip with a Head Duck! – WCS Guide #161"](https://www.youtube.com/watch?v=_1uYSrYR2bs&t=109s) at 1:49–2:27.
[^5]: Matt Davis & Desiree, Rising Tide Swing Dance Studio, ["Open Whip and Exits! – WCS Guide #271"](https://www.youtube.com/watch?v=lKSaRBg6VE8&t=268s) at 4:28.`,
  },
  {
    name: "Rock and Go",
    aliases: ["Rock & Go"],
    difficulty: "intermediate",
    tags: ["connection & technique", "musicality"],
    description: `A connector rather than a standalone pattern: instead of finishing a pattern's [[Anchor Step|anchor]], the leader uses the connection to **rock the follower out of the anchor and directly into count 2 of the next pattern**.[^1]

## The concept

Brian B's framing: a rock and go bypasses the "5-and-6" of a 6-count pattern, taking the follower forward onto the left foot as count 2 of whatever comes next — two patterns fused with the anchor skipped. You can count the result as one long pattern (a 10-count sugar-push-plus-turn) or think of it as jumping between patterns; either mental model works.[^1]

## Common notes

- It layers onto patterns you already know: taught off the [[Sugar Push|sugar push]], [[Sugar Tuck|sugar tuck]], [[Whip|whip]], [[Starter Step|starter step]], and roll-in-roll-out shapes.[^2]
- The lead is the stored tension in the hands at the would-be anchor — rock, then go. The leader's own footwork can rock stepping behind or stepping forward, as long as the follower is placed onto the left foot for the turn out.[^3]
- Followers: knowing this exists is half the skill — when the anchor gets interrupted and you're taken forward, you're on count 2 of something new, not making a mistake.[^1]

[^1]: Brian B & Megan, West Coast Swing Online, ["Ultimate Guide to Rock & Go's in WCS"](https://www.youtube.com/watch?v=hh-Rt6gwjWA&t=100s) at 1:40–2:52.
[^2]: Brian B & Megan, West Coast Swing Online, ["Rock & Go for West Coast Swing"](https://www.youtube.com/watch?v=pGmktxwaRok&t=35s) at 0:35; ["Ultimate Guide to Rock & Go's in WCS"](https://www.youtube.com/watch?v=hh-Rt6gwjWA&t=49s) at 0:49.
[^3]: Brian B & Megan, West Coast Swing Online, ["Rock & Go for West Coast Swing"](https://www.youtube.com/watch?v=pGmktxwaRok&t=76s) at 1:16–3:23.`,
  },
  {
    name: "Hammerlock",
    aliases: ["Hammerlock Position"],
    difficulty: "intermediate",
    tags: ["wraps & cuddles", "spins & turns", "6-count"],
    description: `A two-hand pattern that finishes a [[Sugar Tuck|tuck turn]] with one of the follower's hands folded behind their back — the "hammerlock" hold — usually the entry to a family of wrapped and behind-the-back figures.

## One taught version

DrDanceRight teaches it as a sugar tuck where the leader simply *keeps both hands*: lead the tuck and spin as usual under the raised left hand while the joined right hand stays low, and the follower's arm settles behind their back into the lock.[^1]

## Common notes

- Grip light: "a lot of times we say no thumbs" — fingertip connection lets the hands flip around freely, and hard thumbs on the wrist are how followers get bruised.[^2]
- The exit is a release, not a pull: never tug the locked arm. The follower just walks out with [[Right Side Pass|underarm-pass]] footwork while the leader lets go.[^3]
- The pair ends up offset, follower to the leader's right — the leader deliberately stays off the slot so the follower has a clear lane to walk out on, then drifts back in front.[^4]

[^1]: DrDanceRight, ["West Coast Swing 106: Hammerlock"](https://www.youtube.com/watch?v=tViu2wllUus&t=9s) at 0:09–0:46.
[^2]: DrDanceRight, ["West Coast Swing 106: Hammerlock"](https://www.youtube.com/watch?v=tViu2wllUus&t=25s) at 0:25.
[^3]: DrDanceRight, ["West Coast Swing 106: Hammerlock"](https://www.youtube.com/watch?v=tViu2wllUus&t=70s) at 1:10.
[^4]: DrDanceRight, ["West Coast Swing 106: Hammerlock"](https://www.youtube.com/watch?v=tViu2wllUus&t=95s) at 1:35.`,
  },
  {
    name: "Slingshot",
    aliases: ["Slingshot Pass"],
    difficulty: "intermediate",
    tags: ["connection & technique", "musicality", "6-count"],
    description: `A [[Left Side Pass|left side pass]] cut off early into a shared stretch: instead of letting the follower travel through, the leader catches the second hand and both partners settle into opposition — hips stretching away from each other — before releasing into an exit.[^1]

## The connection

Brian B builds it on a slightly **outward, rotational** connection (the childhood doorway-press feeling): flare the elbows without pushing the hands out, "read the paper" open on count 2, roll together on 3, and *set* on 4 by taking the rotation back out of the arms — that's what lets both partners land the stretch instead of bouncing off it.[^2] Filipe de Barros cues the same shape from the follower's side: forward on 1 and 2, land on 3, stretching away while the leader stretches the other way.[^3]

## Common notes

- The pocket is playtime: hip bumps are the classic filler (led from the centers, not the arms), and grooving in place works just as well.[^4]
- Standard exits are a [[Sugar Tuck|tuck]] or an inside turn, but vary them — and try accelerating the entry ("one, two-and-three") to land the stretch on a hit in the music.[^5]
- Brian B tests the partnership with a [[Open Whip|hustle whip]] first — it proves the pair can share the middle of the slot before the slingshot asks them to.[^6]

[^1]: Filipe de Barros, ["Slingshot TIPS & TRICKS | For West Coast Swing Leaders & Followers"](https://www.youtube.com/watch?v=HeH6r-tGX18&t=25s) at 0:25–1:06.
[^2]: Brian B & Megan, West Coast Swing Online, ["3 "WCS Slingshot" Variations for West Coast Swing"](https://www.youtube.com/watch?v=0a2z7VlTKGs&t=52s) at 0:52–3:11.
[^3]: Filipe de Barros, ["Slingshot TIPS & TRICKS | For West Coast Swing Leaders & Followers"](https://www.youtube.com/watch?v=HeH6r-tGX18&t=112s) at 1:52.
[^4]: Filipe de Barros, ["Slingshot TIPS & TRICKS | For West Coast Swing Leaders & Followers"](https://www.youtube.com/watch?v=HeH6r-tGX18&t=147s) at 2:27.
[^5]: Filipe de Barros, ["Slingshot TIPS & TRICKS | For West Coast Swing Leaders & Followers"](https://www.youtube.com/watch?v=HeH6r-tGX18&t=176s) at 2:56–5:01.
[^6]: Brian B & Megan, West Coast Swing Online, ["3 "WCS Slingshot" Variations for West Coast Swing"](https://www.youtube.com/watch?v=0a2z7VlTKGs&t=221s) at 3:41.`,
  },
  {
    name: "Leader's Underarm Turn",
    aliases: ["Leader's Turn", "Leader Turn"],
    difficulty: "intermediate",
    tags: ["spins & turns", "pass family", "6-count"],
    description: `Any figure where the **leader** turns under the joined hands while the follower dances essentially normal pass footwork — the mirror image of the follower's [[Right Side Pass|underarm turn]], and a first taste of leaders dancing their own spins.

## Two taught versions

Rising Tide teaches a matched pair off basic passes: a **left turn** off the [[Left Side Pass|left side pass]] — leave the left side open on 3&4 to store torque, keep the elbow high, and place the follower's hand around your waist on 5 — and a **right turn** where the leader starts rotating on 4 and passes the hand behind their own back in a self-[[Hammerlock|hammerlock]], keeping the chest and shoulders open rather than hunching into the change.[^1]

EastonSwing's version takes the joined hand over the leader's *own head*: raise it slightly higher than a normal underarm pass, prep on 5, and turn about three-quarters on the "and" count — then release so the follower traces lightly down your arm to the fingertips and the connection is already rebuilt.[^2]

## Common notes

- Followers: your job is patience. When the leader turns instead of you, the post stops moving — anchor where you are rather than driving down the slot, and roll through the body into count 1 so the connection is there when the leader finishes.[^3]

[^1]: Matt Davis & Desiree, Rising Tide Swing Dance Studio, ["Basic Leader Turns – WCS Guide #51"](https://www.youtube.com/watch?v=sZsLwbUyRqg&t=63s) at 1:03–1:56.
[^2]: EastonSwing, ["West Coast Swing, Level 2, Leaders Turns"](https://www.youtube.com/watch?v=w6eH9BtdF4k&t=104s) at 1:44–3:30.
[^3]: Matt Davis & Desiree, Rising Tide Swing Dance Studio, ["Basic Leader Turns – WCS Guide #51"](https://www.youtube.com/watch?v=sZsLwbUyRqg&t=124s) at 2:04–3:45.`,
  },
  {
    name: "Shoulder Roll",
    aliases: [],
    difficulty: "intermediate",
    tags: ["spins & turns", "styling & footwork"],
    description: `A close-position roll where the joined arm folds over one partner's head and unrolls across the back of their shoulders as they turn out from underneath. Think of it as a [[Barrel Roll|barrel roll]] scaled down to the shoulder line: instead of the whole body rolling down the slot along the arm, the roll travels across the shoulders while the feet stay nearly in place.

## The shape

- From open position, the leader brings the follower in so the partners end up close together, roughly side by side and facing the same way.
- The joined hands sweep up, and the arm folds over the rolling partner's head, elbow high and soft so the connection clears the face and hair.
- As the rolling partner rotates out from under the arm, the connection unrolls across the back of the shoulders and peels off, the hands releasing at the end of the roll.
- The partners re-extend down the slot, reconnect, and anchor.

## Either partner can roll

It's All Swing's demo shows the pattern both ways. In the slow walkthrough the follower takes the roll, sweeping the arm up and unrolling it across her shoulders as the leader stays behind her.[^1] In the next run the leader takes it, folding the joined hands over his own head as the follower steps behind him, then unwinding back out to open position.[^2]

Because the roll itself is a shape rather than a crank through the hands, the rolling partner controls the speed of the unroll. That makes it an easy place to play with the music: hit a phrase ending by letting the arm melt off the shoulders slowly, or match a fast lick by snapping it through.

[^1]: It's All Swing, ["#MondayMoves - Ep 12"](https://www.youtube.com/watch?v=2TOz-R2TBGY&t=26s) at 0:26–0:34; full-speed run at [0:11](https://www.youtube.com/watch?v=2TOz-R2TBGY&t=11s).
[^2]: It's All Swing, ["#MondayMoves - Ep 12"](https://www.youtube.com/watch?v=2TOz-R2TBGY&t=40s) at 0:40–0:47.`,
  },
];

// relations: [fromMove, toMove, kind]
// "prerequisite": learn toMove before fromMove
// "variation": fromMove is a variation of toMove
// "related": symmetric
/** [move name, url, title] — instructional videos surfaced as "Learn more" on move pages. */
export const SEED_RESOURCES: [string, string, string][] = [
  [
    "Sugar Push",
    "https://www.youtube.com/watch?v=mM86VQ_hViw",
    "Sugar Push – The Heart of West Coast Swing (Thibault & Nicole Ramirez)",
  ],
  [
    "Sugar Push",
    "https://www.youtube.com/watch?v=dfVpwMLqm-o",
    "How to Dance the West Coast Swing Basic Steps (West Coast Swing Online)",
  ],
  [
    "Sugar Push",
    "https://www.youtube.com/watch?v=cKcamMuk3sA",
    "West Coast Swing Basic Steps // Beginner WCS (West Coast Swing Online)",
  ],
  [
    "Left Side Pass",
    "https://www.youtube.com/watch?v=k7D6Uv8Y0E8",
    "How to Do the Left Side Pass (Robert Royston, Howcast)",
  ],
  [
    "Left Side Pass",
    "https://www.youtube.com/watch?v=cKcamMuk3sA",
    "West Coast Swing Basic Steps // Beginner WCS (West Coast Swing Online)",
  ],
  [
    "Right Side Pass",
    "https://www.youtube.com/watch?v=bSu7QJZ5SLU",
    "How to Do the Underarm Turn (Robert Royston, Howcast)",
  ],
  [
    "Right Side Pass",
    "https://www.youtube.com/watch?v=cKcamMuk3sA",
    "West Coast Swing Basic Steps // Beginner WCS (West Coast Swing Online)",
  ],
  [
    "Whip",
    "https://www.youtube.com/watch?v=EPupCziC9bY",
    "Whip – The Signature 8-Count Move of WCS (Thibault & Nicole Ramirez)",
  ],
  [
    "Whip",
    "https://www.youtube.com/watch?v=dfVpwMLqm-o",
    "How to Dance the West Coast Swing Basic Steps (West Coast Swing Online)",
  ],
  [
    "Starter Step",
    "https://www.youtube.com/watch?v=5NCgLVFecwI",
    "Starter Step – How to Begin Your West Coast Swing (Thibault & Nicole Ramirez)",
  ],
  [
    "Sugar Tuck",
    "https://www.youtube.com/watch?v=AzV0eeolJ20",
    "How to Do the Sugar Tuck (Robert Royston, Howcast)",
  ],
  [
    "Sugar Tuck",
    "https://www.youtube.com/watch?v=cKcamMuk3sA",
    "West Coast Swing Basic Steps // Beginner WCS (West Coast Swing Online)",
  ],
  [
    "Whip with Inside Turn",
    "https://www.youtube.com/watch?v=TMpTWmn7jQM",
    "How to Do a Whip with an Inside Turn (Robert Royston, Howcast)",
  ],
  [
    "Whip with Outside Turn",
    "https://www.youtube.com/watch?v=UGs-q6lc-Cc",
    "How to Do Whip w/ a Single Outside Turn (Robert Royston, Howcast)",
  ],
  [
    "Basket Whip",
    "https://www.youtube.com/watch?v=v6ifac32Pww",
    "How to Do Locked Whip in West Coast (Robert Royston, Howcast)",
  ],
  [
    "Anchor Step",
    "https://www.youtube.com/watch?v=djR6DkMX3FU",
    "Brush & Flick – WCS Anchor Variation (Sean & Alyssa McKeever)",
  ],
  [
    "Inside Roll",
    "https://www.youtube.com/watch?v=cKcamMuk3sA",
    "West Coast Swing Basic Steps // Beginner WCS (West Coast Swing Online)",
  ],
  [
    "Inside Roll",
    "https://www.youtube.com/watch?v=fEIwV6bFTqk",
    "How to Prep an Inside Turn (West Coast Swing Online)",
  ],
  [
    "Free Spin",
    "https://www.youtube.com/watch?v=MyZsVRB89ik",
    "3 Free Spin Variations for West Coast Swing (West Coast Swing Online)",
  ],
  [
    "Reverse Whip",
    "https://www.youtube.com/watch?v=OLXJylMWZto",
    "The Reverse Whip for West Coast Swing (West Coast Swing Online)",
  ],
  [
    "Reverse Whip",
    "https://www.youtube.com/watch?v=Pok2kEhxLbw",
    "Reverse Whip + 2 Basic Variations (West Coast Swing Online)",
  ],
  [
    "Reverse Whip",
    "https://www.youtube.com/watch?v=2Zvz7e_MXXo",
    "The Reverse Whip & Variations (Filipe de Barros)",
  ],
  [
    "Continuous Whip",
    "https://www.youtube.com/watch?v=DqqWs68b1LE",
    "The Extended Whip for WCS (West Coast Swing Online)",
  ],
  [
    "Continuous Whip",
    "https://www.youtube.com/watch?v=ltIXNvs--bo",
    "Continuous Basket Whip – WCS Guide #47 (Rising Tide Swing Dance Studio)",
  ],
  [
    "Barrel Roll",
    "https://www.youtube.com/watch?v=lDKsWDw5dxk",
    "Barrel Roll Rock & Go – WCS Guide #80 (Rising Tide Swing Dance Studio)",
  ],
  [
    "Hip Catch",
    "https://www.youtube.com/watch?v=IPo2KD5jOQ0",
    "The Hip Catch: A Guide! (Filipe de Barros)",
  ],
  [
    "Hip Catch",
    "https://www.youtube.com/watch?v=lXYYpK4cm3k",
    "Upgrade Your Hip Catch: Basic + 3 Creative Variations (Filipe de Barros)",
  ],
  [
    "Cuddle",
    "https://www.youtube.com/watch?v=5O1VkJgiYFQ",
    "Roll In to Sweetheart Position (West Coast Swing Online)",
  ],
  [
    "Swivels",
    "https://www.youtube.com/watch?v=CxmxOcX97zc",
    "Swivels & Sweeps for West Coast Swing (West Coast Swing Online)",
  ],
  [
    "Body Roll",
    "https://www.youtube.com/watch?v=I-eRBXV0V6c",
    "Body Rolls for Leaders and Followers (West Coast Swing Online)",
  ],
  [
    "Whip with Hand Change",
    "https://www.youtube.com/watch?v=N1xwmyM5pI4",
    "Open Reverse Whip with Leader's Turn – WCS Guide #162 (Rising Tide Swing Dance Studio)",
  ],
  [
    "Basket Whip",
    "https://www.youtube.com/watch?v=XrjWjMDHUTg",
    "The Basket Whip for West Coast Swing (West Coast Swing Online)",
  ],
  [
    "Basket Whip",
    "https://www.youtube.com/watch?v=uOLZLX4kT2c",
    "Basket Whip + 4 Sweet Variations (West Coast Swing Online)",
  ],
  [
    "Kick Ball Change",
    "https://www.youtube.com/watch?v=RPI-toEPBJI",
    "WCS 403: Syncopation 1 – Kick Ball Change (DrDanceRight)",
  ],
  [
    "Wrapped Whip",
    "https://www.youtube.com/watch?v=TTHHevW2r7E",
    "Half Whip Wrap & Tuck Turn (Daily Dance Services)",
  ],
  [
    "Left Side Pass",
    "https://www.youtube.com/watch?v=GnU7ADF9hP4",
    "Left Side Pass – Your First WCS Move (Thibault & Nicole Ramirez)",
  ],
  [
    "Left Side Pass",
    "https://www.youtube.com/watch?v=zsle7AwtEYk",
    "Learn to Dance West Coast Swing in 5 Minutes! (Thibault & Nicole Ramirez)",
  ],
  [
    "Right Side Pass",
    "https://www.youtube.com/watch?v=wIiKVYFA10I",
    "Underarm Turn – Learn This Classic WCS Basic (Thibault & Nicole Ramirez)",
  ],
  [
    "Right Side Pass",
    "https://www.youtube.com/watch?v=zsle7AwtEYk",
    "Learn to Dance West Coast Swing in 5 Minutes! (Thibault & Nicole Ramirez)",
  ],
  [
    "Sugar Tuck",
    "https://www.youtube.com/watch?v=ivvl2xtYyBo",
    "Sugar Tuck – Add Style with This WCS Variation (Thibault & Nicole Ramirez)",
  ],
  [
    "Starter Step",
    "https://www.youtube.com/watch?v=qM0bbXMYjd0",
    "WCS Rhythm & Timing – Start Dancing on Beat (Thibault & Nicole Ramirez)",
  ],
  [
    "Sugar Push",
    "https://www.youtube.com/watch?v=zsle7AwtEYk",
    "Learn to Dance West Coast Swing in 5 Minutes! (Thibault & Nicole Ramirez)",
  ],
  [
    "One Footed Spin",
    "https://www.youtube.com/watch?v=tW7Yv1KZogs",
    "3 Keys to One Footed Spins (West Coast Swing Online)",
  ],
  [
    "One Footed Spin",
    "https://www.youtube.com/watch?v=HIavlzCSIDc",
    "One Footed Spins for WCS (West Coast Swing Online)",
  ],
  [
    "One Footed Spin",
    "https://www.youtube.com/watch?v=KYRStjChChw",
    "Spin Technique | One Foot Spins in WCS (Nerdy West Coast Swing)",
  ],
  [
    "Duck",
    "https://www.youtube.com/watch?v=GJv6HOzo93A",
    "How to Dance a Duck – 3 Different Ducks! (West Coast Swing Online)",
  ],
  [
    "Duck",
    "https://www.youtube.com/watch?v=S16GYhXK47M",
    "What You Should Know About Ducking (West Coast Swing Online)",
  ],
  [
    "Duck",
    "https://www.youtube.com/watch?v=_1uYSrYR2bs",
    "Underarm Open Whip with a Head Duck – WCS Guide #161 (Rising Tide Swing Dance Studio)",
  ],
  [
    "Open Whip",
    "https://www.youtube.com/watch?v=lKSaRBg6VE8",
    "Open Whip and Exits – WCS Guide #271 (Rising Tide Swing Dance Studio)",
  ],
  [
    "Open Whip",
    "https://www.youtube.com/watch?v=UqjnOxLE6zM",
    "Open Whip Variations, Level 2 (EastonSwing)",
  ],
  [
    "Open Whip",
    "https://www.youtube.com/watch?v=_1uYSrYR2bs",
    "Underarm Open Whip with a Head Duck – WCS Guide #161 (Rising Tide Swing Dance Studio)",
  ],
  [
    "Rock and Go",
    "https://www.youtube.com/watch?v=hh-Rt6gwjWA",
    "Ultimate Guide to Rock & Go's in WCS (West Coast Swing Online)",
  ],
  [
    "Rock and Go",
    "https://www.youtube.com/watch?v=pGmktxwaRok",
    "Rock & Go for West Coast Swing (West Coast Swing Online)",
  ],
  [
    "Hammerlock",
    "https://www.youtube.com/watch?v=tViu2wllUus",
    "WCS 106: Hammerlock (DrDanceRight)",
  ],
  [
    "Hammerlock",
    "https://www.youtube.com/watch?v=H44piGTg9PI",
    "WCS 305: Hammerlock Technique (DrDanceRight)",
  ],
  [
    "Slingshot",
    "https://www.youtube.com/watch?v=HeH6r-tGX18",
    "Slingshot Tips & Tricks (Filipe de Barros)",
  ],
  [
    "Slingshot",
    "https://www.youtube.com/watch?v=0a2z7VlTKGs",
    "3 WCS Slingshot Variations (West Coast Swing Online)",
  ],
  [
    "Leader's Underarm Turn",
    "https://www.youtube.com/watch?v=sZsLwbUyRqg",
    "Basic Leader Turns – WCS Guide #51 (Rising Tide Swing Dance Studio)",
  ],
  [
    "Leader's Underarm Turn",
    "https://www.youtube.com/watch?v=w6eH9BtdF4k",
    "Leaders Turns, Level 2 (EastonSwing)",
  ],
  [
    "Shoulder Roll",
    "https://www.youtube.com/watch?v=2TOz-R2TBGY",
    "#MondayMoves - Ep 12 (It's All Swing)",
  ],
];

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
  ["One Footed Spin", "Free Spin", "related"],
  ["Duck", "Inside Roll", "related"],
  ["Duck", "Whip", "related"],
  ["Open Whip", "Whip", "variation"],
  ["Rock and Go", "Anchor Step", "related"],
  ["Hammerlock", "Sugar Tuck", "prerequisite"],
  ["Slingshot", "Left Side Pass", "prerequisite"],
  ["Leader's Underarm Turn", "Right Side Pass", "related"],
  ["Barrel Roll", "Inside Roll", "prerequisite"],
  ["Whip with Inside Turn", "Whip", "prerequisite"],
  ["Continuous Whip", "Whip", "prerequisite"],
  ["Basket Whip", "Whip", "prerequisite"],
  ["Swivels", "Anchor Step", "related"],
  ["Kick Ball Change", "Anchor Step", "related"],
  ["Body Roll", "Cuddle", "related"],
  ["Cuddle", "Left Side Pass", "prerequisite"],
  ["Shoulder Roll", "Barrel Roll", "related"],
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
