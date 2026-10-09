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
    description: `The sugar push is a 6-count pattern and usually the first one taught in West Coast Swing. The follower walks toward the leader, the connection compresses, and the follower returns to where they started. Unlike most WCS patterns, the follower does not pass the leader.

- **1–2**: the follower walks forward (walk, walk)
- **3&4**: triple step as the connection compresses
- **5&6**: [[Anchor Step|anchor step]]

The name is misleading, because neither partner pushes with the hands. Thibault and Nicole Ramirez call it "a little bit of a misnomer" and teach the leader to absorb the follower's energy and send it back out.[^1] The arms stay relaxed and the compression comes from where the two bodies are.

It is danced with a two-hand hold, the most common in classes, or with one hand: leader's left to follower's right, right-to-right (handshake), or left-to-left. The footwork and timing stay the same.

## Naming

Also called the **push break**. The "sugar" comes from Lindy Hop, where a sugar push included a sugar foot (a follower swivel on the way in) and the version without the swivel was a push break. The two names now describe the same pattern.[^2]

[^1]: Thibault & Nicole Ramirez, ["Sugar Push – The Heart of West Coast Swing"](https://www.youtube.com/watch?v=mM86VQ_hViw&t=172s) at 2:52.
[^2]: Brian B, West Coast Swing Online, ["How to Dance the West Coast Swing Basic Steps"](https://www.youtube.com/watch?v=dfVpwMLqm-o&t=368s) at 6:08–7:24.`,
  },
  {
    name: "Left Side Pass",
    aliases: ["LSP"],
    difficulty: "beginner",
    tags: ["fundamentals", "pass family", "6-count"],
    description: `A 6-count pattern where the follower passes the leader on the leader's left side. Along with the [[Sugar Push|sugar push]] and [[Right Side Pass|right side pass]], it is one of the first patterns taught.

- **1–2**: the leader steps back and slightly off the slot, opening a lane on their left, and the follower walks forward
- **3&4**: the follower passes the leader and turns to face back down the slot
- **5&6**: anchor

The leader moves out of the follower's way and does not pull. Robert Royston teaches the lead as saying "after you" at a doorway.[^1] Brian B describes the leader's path as curling out of the slot on 1–2 and rejoining it on the other side for the anchor.[^2] Thibault and Nicole Ramirez teach the same thing from the follower's side: the leader clears the path by count 2 so the follower keeps a straight line.[^3]

The leader's hand stays low. A hand raised early usually leads an [[Inside Roll|inside roll]].

[^1]: Robert Royston, ["How to Do the Left Side Pass | Swing Dance"](https://www.youtube.com/watch?v=k7D6Uv8Y0E8&t=43s) (Howcast) at 0:43.
[^2]: Brian B & Megan, West Coast Swing Online, ["West Coast Swing Basic Steps // Beginner WCS"](https://www.youtube.com/watch?v=cKcamMuk3sA&t=195s) at 3:15.
[^3]: Thibault & Nicole Ramirez, ["Left Side Pass – Your First West Coast Swing Move"](https://www.youtube.com/watch?v=GnU7ADF9hP4&t=153s) at 2:33.`,
  },
  {
    name: "Right Side Pass",
    aliases: ["Underarm Pass", "RSP"],
    difficulty: "beginner",
    tags: ["fundamentals", "pass family", "6-count"],
    description: `A 6-count pattern where the follower passes on the leader's right side, usually under the joined hands, which gives it the other common name, **underarm pass**.

- **1–2**: the leader steps back and raises the joined left hand to make an arch, and the follower walks forward
- **3&4**: the follower passes under the arch and turns right to face back down the slot
- **5&6**: anchor

The follower's footwork is the same as in the [[Left Side Pass|left side pass]].[^1] Count 1 travels down the line either way, and count 2 is where the leader commits to a left side pass or an underarm.[^2] Thibault Ramirez's cue for the lead is to raise the left hand as if placing it beside your nose.[^3]

As the partners pass, Robert Royston teaches that one foot stays crossed in front of the other on the triple.[^4] Brian B's tip for followers is "getting skinny": turning the shoulders slightly so the joined hand clears the head.[^5] The handhold pivots during the pass, so the follower leaves space in the hand and the leader releases and re-catches on the way out.[^6]

Danced without the raised arm, the same pattern is often called a side pass or outside pass, depending on the scene.

[^1]: Brian B & Megan, West Coast Swing Online, ["West Coast Swing Basic Steps // Beginner WCS"](https://www.youtube.com/watch?v=cKcamMuk3sA&t=363s) at 6:03.
[^2]: Thibault & Nicole Ramirez, ["Underarm Turn – Learn This Classic WCS Basic"](https://www.youtube.com/watch?v=wIiKVYFA10I&t=199s) at 3:19.
[^3]: Thibault & Nicole Ramirez, ["Underarm Turn – Learn This Classic WCS Basic"](https://www.youtube.com/watch?v=wIiKVYFA10I&t=46s) at 0:46; the "wipe your nose" cue is from their [Sugar Tuck lesson](https://www.youtube.com/watch?v=ivvl2xtYyBo&t=192s) at 3:12.
[^4]: Robert Royston, ["How to Do the Underarm Turn | Swing Dance"](https://www.youtube.com/watch?v=bSu7QJZ5SLU&t=65s) (Howcast) at 1:05.
[^5]: Brian B & Megan, West Coast Swing Online, ["West Coast Swing Basic Steps // Beginner WCS"](https://www.youtube.com/watch?v=cKcamMuk3sA&t=423s) at 7:03.
[^6]: Thibault & Nicole Ramirez, ["Underarm Turn – Learn This Classic WCS Basic"](https://www.youtube.com/watch?v=wIiKVYFA10I&t=152s) at 2:32–3:08.`,
  },
  {
    name: "Whip",
    aliases: ["Basic Whip", "8-Count Whip"],
    difficulty: "beginner",
    tags: ["fundamentals", "whip family", "8-count"],
    description: `The whip is the standard 8-count pattern of West Coast Swing and the base of a large family of variations. Pushes, passes, and whips are the three basic families of WCS patterns.[^1]

- **1–2**: the follower travels forward down the slot
- **3&4**: the leader steps across the slot and catches the follower's momentum in a near-closed position, redirecting them
- **5–6**: the follower travels back down the slot the way they came, and the leader posts
- **7&8**: anchor

Thibault and Nicole Ramirez describe the shape as a paper clip or hairpin turn: very linear, with the leader staying "mostly the base" while the follower travels in and out and finishes with a stretch.[^2]

Rushing count 4 is the most common mistake. Brian B teaches followers to delay count 4 and roll through the step heel to toe.[^3]

Some older curricula count the second half differently or teach a "coaster" ending. The 8-count structure above is the one most commonly taught today.[^4]

[^1]: Thibault & Nicole Ramirez, ["Whip – The Signature 8-Count Move of WCS"](https://www.youtube.com/watch?v=EPupCziC9bY&t=48s) at 0:48.
[^2]: Thibault & Nicole Ramirez, ["Whip – The Signature 8-Count Move of WCS"](https://www.youtube.com/watch?v=EPupCziC9bY&t=266s) at 4:26.
[^3]: Brian B & Megan, West Coast Swing Online, ["West Coast Swing Basic Steps // Beginner WCS"](https://www.youtube.com/watch?v=cKcamMuk3sA&t=1198s) at 19:58.
[^4]: See e.g. [West Coast Swing Online's basic patterns guide](https://www.westcoastswingonline.com/west-coast-swing-basic-patterns/), which teaches the whip as the fourth core pattern with this structure.`,
  },
  {
    name: "Sugar Tuck",
    aliases: ["Tuck Turn", "Push Tuck"],
    difficulty: "beginner",
    tags: ["push family", "spins & turns", "6-count"],
    description: `A [[Sugar Push|sugar push]] where the compression is redirected into an outside (clockwise) turn for the follower.

It is danced like a sugar push through counts 1–2. On **3&4** the leader rotates the follower slightly toward them (the tuck) and releases into a free outside turn on **4–5**, and the pattern finishes with an anchor on **5&6**.

Thibault Ramirez signals the turn with the left hand, turning the fingers to face out, and the follower compresses on a high point for 3&4 before unwinding.[^1] The handhold stays loose through the turn so the leader can reconnect to the palm.[^2] Because the leader's hand finishes over the top of the grip, the tuck is commonly followed by an underarm turn ([[Right Side Pass|right side pass]]) to fix the handhold.[^3]

Robert Royston points out that it can be led with the left hand up, the right hand up, both hands, or no hands (a [[Free Spin|free spin]]): "once you learn the sugar tuck you immediately have four more moves."[^4]

[^1]: Thibault & Nicole Ramirez, ["Sugar Tuck – Add Style with This WCS Variation"](https://www.youtube.com/watch?v=ivvl2xtYyBo&t=38s) at 0:38–1:51.
[^2]: Thibault & Nicole Ramirez, ["Sugar Tuck – Add Style with This WCS Variation"](https://www.youtube.com/watch?v=ivvl2xtYyBo&t=201s) at 3:21–3:46.
[^3]: Brian B & Megan, West Coast Swing Online, ["West Coast Swing Basic Steps // Beginner WCS"](https://www.youtube.com/watch?v=cKcamMuk3sA&t=598s) at 9:58.
[^4]: Robert Royston, ["How to Do the Sugar Tuck | Swing Dance"](https://www.youtube.com/watch?v=AzV0eeolJ20&t=68s) (Howcast) at 1:08.`,
  },
  {
    name: "Starter Step",
    aliases: ["Intro Step"],
    difficulty: "beginner",
    tags: ["fundamentals", "connection & technique"],
    description: `A short two-triple pattern many dancers use to begin a dance: side triple, side triple (or rock-and-triple). It establishes the connection and the slot before the first traveling pattern. Not everyone uses one, and many dancers start directly with a [[Sugar Push|sugar push]] or side pass.

Thibault and Nicole Ramirez teach it from closed position. The partners first tap the tempo in place for as long as the leader likes, then dance two triple steps, the first to the side and the second opening the position, and go directly into a [[Left Side Pass|left side pass]].[^1] For the follower, the first triple is the signal that the dance has started.[^2] The dance starts on a downbeat, which is an odd count.[^3]

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
    description: `A [[Left Side Pass|left side pass]] in which the follower turns left (counter-clockwise) under the joined hands while traveling down the slot.

- **1–2**: as in a left side pass, but the leader raises the joined hand and starts the rotation
- **3&4**: the follower rolls through one or more traveling turns down the slot
- **5&6**: anchor

Brian B explains the name: the joined hand "cuts inside our heads" as it passes between the partners.[^1] Of the double prep that beginners often learn, only the second prep sets the follower's energy for the turn, and with good connection the hand barely has to move.[^2]

It is often extended into double or triple rolls, or into a [[Barrel Roll|barrel roll]] when both partners rotate.

[^1]: Brian B & Megan, West Coast Swing Online, ["Beginner West Coast Swing | How to Prep and Inside Turn"](https://www.youtube.com/watch?v=fEIwV6bFTqk&t=46s) at 0:46.
[^2]: Brian B & Megan, West Coast Swing Online, ["Beginner West Coast Swing | How to Prep and Inside Turn"](https://www.youtube.com/watch?v=fEIwV6bFTqk&t=65s) at 1:05–2:10.`,
  },
  {
    name: "Free Spin",
    aliases: ["Follower's Free Spin", "Push Spin"],
    difficulty: "intermediate",
    tags: ["spins & turns", "pass family", "6-count"],
    description: `Any pattern where the follower is released to turn without a hand connection, most commonly a [[Left Side Pass|left side pass]] or tuck released into a full free turn. The lead is finished before the spin begins: rotation is offered on the setup counts, the hand releases, and the follower completes the turn alone.

Brian B starts the basic free spin from the leader's right hand, reached from a [[Sugar Push|sugar push]], so the follower never has a hand over their head.[^1] The prep can be as small as a slight expansion on count 2.[^2] Follower footwork on "3-and" (close the feet, step down the line, pivot) gives the leader a moment to pick up the follower's back and redirect in free-spin variations.[^3]

[^1]: Brian B & Megan, West Coast Swing Online, ["3 Free Spin Variations for West Coast Swing!"](https://www.youtube.com/watch?v=MyZsVRB89ik&t=22s) at 0:22.
[^2]: Brian B & Megan, West Coast Swing Online, ["3 Free Spin Variations for West Coast Swing!"](https://www.youtube.com/watch?v=MyZsVRB89ik&t=93s) at 1:33–2:18.
[^3]: Brian B & Megan, West Coast Swing Online, ["3 Free Spin Variations for West Coast Swing!"](https://www.youtube.com/watch?v=MyZsVRB89ik&t=146s) at 2:26–3:23.`,
  },
  {
    name: "Basket Whip",
    aliases: ["Basket", "Locked Whip"],
    difficulty: "intermediate",
    tags: ["whip family", "wraps & cuddles", "8-count"],
    description: `A [[Whip|whip]] variation danced with two hands. Around counts **3&4–5** the follower is turned at the post into a wrapped ("basket") position facing away from the leader, with both hands held low, and is unwound on **5–6** before the anchor. The timing is plain whip timing.

The follower's path is straight forward and straight back with no turn, and the leader dances the same footwork as a basic whip.[^1] The leader's hand rests at the follower's hip and the free hand stays off the body.[^2] Brian B describes the lead as "creating a basket with my right arm that she comes into", and points out that the follower stays anchored at the far end until the leader moves across.[^3]

## Naming

Also called the **locked whip**. Robert Royston: "some places in the country call this a basket whip. Locked whip, basket whip, same thing."[^4]

[^1]: Robert Royston, ["How to Do Locked Whip in West Coast | Swing Dance"](https://www.youtube.com/watch?v=v6ifac32Pww&t=25s) (Howcast) at 0:25.
[^2]: Robert Royston, ["How to Do Locked Whip in West Coast | Swing Dance"](https://www.youtube.com/watch?v=v6ifac32Pww&t=52s) (Howcast) at 0:52.
[^3]: Brian B & Megan, West Coast Swing Online, ["The Basket Whip for West Coast Swing"](https://www.youtube.com/watch?v=XrjWjMDHUTg&t=52s) at 0:52–2:04.
[^4]: Robert Royston, ["How to Do Locked Whip in West Coast | Swing Dance"](https://www.youtube.com/watch?v=v6ifac32Pww&t=13s) (Howcast) at 0:13.`,
  },
  {
    name: "Reverse Whip",
    aliases: ["Left Side Whip", "Cutoff Whip"],
    difficulty: "intermediate",
    tags: ["whip family", "8-count"],
    description: `A [[Whip|whip]] with the redirection on the reverse side: the leader steps into the slot mirrored from a standard whip and the follower is turned counter-clockwise at the post. The timing is standard 8-count whip timing. Brian B has also heard it called the cutoff whip.[^1]

The leader keeps basic whip footwork. The follower's footwork changes, turning away from the partner over the left shoulder.[^2] Filipe de Barros preps the turn by letting the follower's right shoulder stay back on count 2, and catches the follower's back early, around "3-and".[^3] A reverse whip also works when a follower breaks frame and walks in.[^4]

[^1]: Brian B & Megan, West Coast Swing Online, ["The Reverse Whip for West Coast Swing"](https://www.youtube.com/watch?v=OLXJylMWZto&t=22s) at 0:22.
[^2]: Brian B & Megan, West Coast Swing Online, ["The Reverse Whip for West Coast Swing"](https://www.youtube.com/watch?v=OLXJylMWZto&t=45s) at 0:45.
[^3]: Filipe de Barros, ["The Reverse Whip & Variations - West Coast Swing Tutorial"](https://www.youtube.com/watch?v=2Zvz7e_MXXo&t=124s) at 2:04–3:01.
[^4]: Filipe de Barros, ["The Reverse Whip & Variations - West Coast Swing Tutorial"](https://www.youtube.com/watch?v=2Zvz7e_MXXo&t=36s) at 0:36.`,
  },
  {
    name: "Wrapped Whip",
    aliases: ["Cuddle Whip", "Sweetheart Whip"],
    difficulty: "intermediate",
    tags: ["whip family", "wraps & cuddles", "8-count"],
    description: `A [[Whip|whip]] variation in which the follower is caught in a wrap at the midpoint ([[Cuddle|cuddle]] or sweetheart position, with the follower's back to the leader's front and arms crossed), then released down the slot. The exit can unwind, with the follower turning out, or release straight.

It differs from the [[Basket Whip|basket whip]] mainly in the entry and in the height and shape of the wrap. The two names are often used interchangeably in classes.

Matt and Maggie of Daily Dance Services teach a version in two sets of six: a half whip ending in a right-to-left handhold, then rolling the follower into a wrap on the leader's left side facing down the slot, with a tuck-turn exit that turns the follower out clockwise.[^1] The leader asks for the follower's free hand as the roll-in starts, because collecting it late loses the tuck exit.[^2]

[^1]: Matt & Maggie, Daily Dance Services, ["Half Whip Wrap & Tuck Turn"](https://www.youtube.com/watch?v=TTHHevW2r7E&t=73s) at 1:13–1:47.
[^2]: Matt & Maggie, Daily Dance Services, ["Half Whip Wrap & Tuck Turn"](https://www.youtube.com/watch?v=TTHHevW2r7E&t=353s) at 5:53–6:17.`,
  },
  {
    name: "Whip with Inside Turn",
    aliases: ["Inside Turn Whip", "Inside Whip"],
    difficulty: "intermediate",
    tags: ["whip family", "spins & turns", "8-count"],
    description: `A [[Whip|whip]] in which the follower takes an inside (counter-clockwise) turn on counts **5–6** while traveling back down the slot. The follower's travel and the whip timing do not change, and it is often the first whip variation taught.

Robert Royston defines an inside turn as the lead hand passing inside, between the two partners, where an outside turn sends the lead hand away from the body.[^1] The lead hand begins rising on "3-and" into count 4, so the follower knows about the turn before it arrives on 5.[^2] The partners need room at the redirection, because crossing the hand in front crowds them if they are too close on the "3-and".[^3]

[^1]: Robert Royston, ["How to Do a Whip with an Inside Turn | Swing Dance"](https://www.youtube.com/watch?v=TMpTWmn7jQM&t=43s) (Howcast) at 0:43.
[^2]: Robert Royston, ["How to Do a Whip with an Inside Turn | Swing Dance"](https://www.youtube.com/watch?v=TMpTWmn7jQM&t=36s) (Howcast) at 0:36.
[^3]: Robert Royston, ["How to Do a Whip with an Inside Turn | Swing Dance"](https://www.youtube.com/watch?v=TMpTWmn7jQM&t=68s) (Howcast) at 1:08.`,
  },
  {
    name: "Whip with Outside Turn",
    aliases: ["Outside Turn Whip"],
    difficulty: "intermediate",
    tags: ["whip family", "spins & turns", "8-count"],
    description: `The mirror of the [[Whip with Inside Turn|whip with inside turn]]: the follower takes an outside (clockwise) turn on counts **5–6** while returning down the slot. It is commonly used to set up spins, hand changes, or free-spin exits. The turn starts after the post, not on 4.

For a single turn the lead arm stays long and open through the redirection. Robert Royston warns that bringing the arm in usually makes it a double turn.[^1] In the double-turn version each step is a half rotation, and either version finishes with an underarm turn to fix the handhold.[^2]

[^1]: Robert Royston, ["How to Do Whip w/ a Single Outside Turn | Swing Dance"](https://www.youtube.com/watch?v=UGs-q6lc-Cc&t=54s) (Howcast) at 0:54.
[^2]: Robert Royston, ["How to Do Whip w/ a Single Outside Turn | Swing Dance"](https://www.youtube.com/watch?v=UGs-q6lc-Cc&t=81s) (Howcast) at 1:21.`,
  },
  {
    name: "Continuous Whip",
    aliases: ["Double Whip", "Whip with Extension", "Extended Whip"],
    difficulty: "advanced",
    tags: ["whip family", "8-count", "musicality"],
    description: `A [[Whip|whip]] whose middle is extended. The leader does not release the follower down the slot on 5–6 and keeps them rotating around the post for 2 or more extra counts before the exit, which makes it a 10- or 12-count figure. The extra counts are often used to exit on a hit in the music.

Brian B teaches that the extension depends on count 4. The leader holds the follower's weight and pivots them on that foot while moving their own foot across to where they can catch the weight.[^1] The follower needs a clean pivot on the ball of one foot with the weight forward over it.[^2] Brian B suggests about 12 counts as a maximum: "if you extend it longer than that you probably forgot how to come out of it."[^3]

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
    description: `A spin on a single foot, usually danced by the follower and most often on the right foot, with the leader's hand keeping a light connection overhead.

The lead comes from the leader's right hand, either to the follower's left or right-to-right after a hand change. Counts 1–2 stay calm. On 3 the leader gives a small "up" that sets the follower onto the spinning foot, and the rotation happens in place before the follower steps out.[^1]

## Technique

Brian B teaches three keys in order: balance, rotation around the connection, and creating rotation.[^2]

- Find the balance point over the first three toes with the heel up, then drill quarter, half, and full turns, finishing each one balanced.[^3]
- Use the least energy that completes the turn, which is what preserves balance.[^4]
- For extra turns, let the free leg flare slightly on the first rotation, then pull it in. Rotation speeds up as the radius shrinks.[^5]
- The leader's hand traces a small circle around the follower's head, so the follower's arm stays in one place.[^6]
- For spotting, down the line and a fixed front are both common. When the leader travels around the spinning follower, the follower spots the leader.[^7]

[^1]: Brian B & Megan, West Coast Swing Online, ["3 Keys to One Footed Spins"](https://www.youtube.com/watch?v=tW7Yv1KZogs&t=875s) at 14:35.
[^2]: Brian B & Megan, West Coast Swing Online, ["3 Keys to One Footed Spins"](https://www.youtube.com/watch?v=tW7Yv1KZogs&t=43s) at 0:43.
[^3]: Brian B & Megan, West Coast Swing Online, ["3 Keys to One Footed Spins"](https://www.youtube.com/watch?v=tW7Yv1KZogs&t=173s) at 2:53–5:20.
[^4]: Brian B & Megan, West Coast Swing Online, ["3 Keys to One Footed Spins"](https://www.youtube.com/watch?v=tW7Yv1KZogs&t=474s) at 7:54–8:51.
[^5]: Brian B & Megan, West Coast Swing Online, ["3 Keys to One Footed Spins"](https://www.youtube.com/watch?v=tW7Yv1KZogs&t=591s) at 9:51–12:07.
[^6]: Brian B & Megan, West Coast Swing Online, ["One footed spins for #wcs"](https://www.youtube.com/watch?v=HIavlzCSIDc&t=16s) at 0:16.
[^7]: Cassie Winter & Alicia Marshall, Nerdy West Coast Swing, ["Spin Technique | One Foot Spins in West Coast Swing"](https://www.youtube.com/watch?v=KYRStjChChw&t=245s) at 4:05; Brian B at [15:56](https://www.youtube.com/watch?v=tW7Yv1KZogs&t=956s).`,
  },
  {
    name: "Hip Catch",
    aliases: ["Hip Check Catch"],
    difficulty: "intermediate",
    tags: ["push family", "connection & technique", "musicality"],
    description: `A compression pattern where the follower's forward travel is caught at the leader's hip instead of in the hands. The follower arrives beside the leader, is caught in a brief side-by-side compression, and returns down the slot. It is often used to mark a pause or drop in the music.

Filipe de Barros rolls in as in a [[Left Side Pass|left side pass]], arriving with the forearm at the follower's waist, and recommends catching on the bony part of the hip.[^1] The follower gives the weight of the hip into the leader's hand and waits for the lead out.[^2] Common exits are spinning the follower out, redirecting to a catch on the other hip, or rising into a tuck.[^3]

[^1]: Filipe de Barros, ["West Coast Swing - The Hip Catch: A Guide!"](https://www.youtube.com/watch?v=IPo2KD5jOQ0&t=48s) at 0:48–2:04.
[^2]: Filipe de Barros, ["West Coast Swing - The Hip Catch: A Guide!"](https://www.youtube.com/watch?v=IPo2KD5jOQ0&t=184s) at 3:04.
[^3]: Filipe de Barros, ["West Coast Swing - The Hip Catch: A Guide!"](https://www.youtube.com/watch?v=IPo2KD5jOQ0&t=357s) at 5:57.`,
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
    description: `A syncopation borrowed from vernacular jazz: a kick, then a quick ball-change weight transfer. It is not a pattern on its own. Dancers use it on the anchor, as filler during extensions, and as leader footwork during whips, and it is among the first footwork variations taught.

It is neither led nor followed. Either partner, or both, can dance one while the other keeps regular rhythm.[^1] DrDanceRight teaches the unit as "kick, ball, foot flat", with a compact kick that goes down and up from the knee, not out.[^2] The upper body stays still while the feet move.[^3]

[^1]: DrDanceRight, ["West Coast Swing 403: Syncopation 1"](https://www.youtube.com/watch?v=RPI-toEPBJI&t=6s) at 0:06.
[^2]: DrDanceRight, ["West Coast Swing 403: Syncopation 1"](https://www.youtube.com/watch?v=RPI-toEPBJI&t=27s) at 0:27–1:07.
[^3]: DrDanceRight, ["West Coast Swing 403: Syncopation 1"](https://www.youtube.com/watch?v=RPI-toEPBJI&t=186s) at 3:06–3:39.`,
  },
  {
    name: "Swivels",
    aliases: ["Follower Swivels", "Walk-Walk Swivels"],
    difficulty: "intermediate",
    tags: ["styling & footwork", "connection & technique"],
    description: `Follower styling in which the walk-walk counts (1–2 of most patterns) are danced with the feet closing and the hips rotating through each step. Swivels are optional and chosen by the follower when the connection and tempo leave room for them.

Megan of West Coast Swing Online gives a placement rule: almost any triple step that rotates a half turn can be replaced with a swivel or sweep, anchors included.[^1] They can be tight and low, bigger with a sweep out and back in before the step, or lifted.[^2] Done on time they do not disturb the partnership, since the follower is on the expected foot at the expected moment.[^3]

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
    description: `One partner, usually the follower, ducks briefly under the joined hands as the arm passes overhead. It is most often added to an [[Inside Roll|inside turn]] or a [[Whip|whip]].

## For followers

Megan of West Coast Swing Online teaches matching the speed of the lead, since the leader may take the turn slowly or syncopate it.[^1] Duck late and briefly: stay upright through the turn and drop the head only between counts 3 and 4, when the leader's arm comes over, because most people get dizzy turning with the head down.[^2] Keep the free arm up in frame so it does not get trapped under the joined hands.[^3] On an open-whip head duck, Matt Davis and Desiree teach opening the back on count 5 to give the leader room.[^4]

## For leaders

Brian B teaches ducks on patterns the follower already knows, such as an inside turn or a basic whip. Once the follower is turning, the leader slides the joined hand down to the follower's elbow or armpit, then moves the hand out and around the follower's path with the elbow pointing up. A flat elbow or a shortened path is how followers get hit in the back of the head.[^5]

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
    description: `A [[Whip|whip]] danced without the closed-position catch. The connection stays in the hands the whole way, so the partners are an arm's length further apart at the redirection. It is also called a hustle whip.

In a basic whip the leader mostly holds their spot while the follower travels. In an open whip both partners travel about the same amount, which EastonSwing describes as "a changing of places that happens twice."[^1] The leader covers the extra distance by moving counter to the follower down the slot on 2 and "3-and".[^2]

It is usually danced with a turn on the exit, inside or outside. A [[Sugar Push|sugar push]] is the standard way to arrive in the two-hand or open hold that starts one.[^3] For the follower, the "3-and" is longer than in a basic whip because of the open hold, and Matt Davis and Desiree teach waiting in it before stepping into count 4.[^4]

[^1]: EastonSwing, ["West Coast Swing, Level 2, Open Whip Variations"](https://www.youtube.com/watch?v=UqjnOxLE6zM&t=66s) at 1:04–1:36.
[^2]: Matt Davis & Desiree, Rising Tide Swing Dance Studio, ["Open Whip and Exits! – WCS Guide #271"](https://www.youtube.com/watch?v=lKSaRBg6VE8&t=68s) at 1:08–1:45.
[^3]: Matt Davis & Desiree, Rising Tide Swing Dance Studio, ["Open Whip and Exits! – WCS Guide #271"](https://www.youtube.com/watch?v=lKSaRBg6VE8&t=181s) at 3:01–4:04; EastonSwing at [1:36](https://www.youtube.com/watch?v=UqjnOxLE6zM&t=96s).
[^4]: Matt Davis & Desiree, Rising Tide Swing Dance Studio, ["Underarm Open Whip with a Head Duck! – WCS Guide #161"](https://www.youtube.com/watch?v=_1uYSrYR2bs&t=109s) at 1:49–2:27.`,
  },
  {
    name: "Rock and Go",
    aliases: ["Rock & Go"],
    difficulty: "intermediate",
    tags: ["connection & technique", "musicality"],
    description: `A connector between patterns. The leader skips the [[Anchor Step|anchor]] of one pattern and uses the connection to rock the follower directly into count 2 of the next.[^1]

Brian B describes it as bypassing the "5-and-6" of a 6-count pattern and taking the follower forward onto the left foot as count 2 of whatever comes next. The result can be counted as one long pattern, such as a 10-count sugar push plus turn, or thought of as two patterns joined.[^1]

It is taught off the [[Sugar Push|sugar push]], [[Sugar Tuck|sugar tuck]], [[Whip|whip]], [[Starter Step|starter step]], and roll-in-roll-out.[^2] The lead comes from the tension in the hands where the anchor would be. The leader can rock stepping behind or forward, as long as the follower is placed onto the left foot.[^3] For the follower, an interrupted anchor that moves forward means count 2 of a new pattern.[^1]

[^1]: Brian B & Megan, West Coast Swing Online, ["Ultimate Guide to Rock & Go's in WCS"](https://www.youtube.com/watch?v=hh-Rt6gwjWA&t=100s) at 1:40–2:52.
[^2]: Brian B & Megan, West Coast Swing Online, ["Rock & Go for West Coast Swing"](https://www.youtube.com/watch?v=pGmktxwaRok&t=35s) at 0:35; ["Ultimate Guide to Rock & Go's in WCS"](https://www.youtube.com/watch?v=hh-Rt6gwjWA&t=49s) at 0:49.
[^3]: Brian B & Megan, West Coast Swing Online, ["Rock & Go for West Coast Swing"](https://www.youtube.com/watch?v=pGmktxwaRok&t=76s) at 1:16–3:23.`,
  },
  {
    name: "Hammerlock",
    aliases: ["Hammerlock Position"],
    difficulty: "intermediate",
    tags: ["wraps & cuddles", "spins & turns", "6-count"],
    description: `A two-hand pattern that finishes a [[Sugar Tuck|tuck turn]] with one of the follower's hands folded behind their back, the "hammerlock" hold. It is usually the entry to wrapped and behind-the-back figures.

DrDanceRight teaches it as a sugar tuck where the leader keeps both hands. The follower spins under the raised left hand while the joined right hand stays low, and the follower's arm settles behind their back.[^1] The connection is in the fingertips with no thumbs, so the hands can turn freely and the follower's wrist is not squeezed.[^2]

To exit, the leader lets go and the follower walks out with [[Right Side Pass|underarm-pass]] footwork. The locked arm is never pulled.[^3] The pair ends up offset, with the follower to the leader's right, and the leader stays off the slot until the follower has walked out.[^4]

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
    description: `A [[Left Side Pass|left side pass]] cut off early into a shared stretch. The leader catches the follower's second hand and both partners settle with their hips stretching away from each other before releasing into an exit.[^1]

Brian B builds it on a slightly outward, rotational connection: flare the elbows without pushing the hands out, open on count 2, roll together on 3, and set on 4 by taking the rotation back out of the arms.[^2] Filipe de Barros cues it from the follower's side: forward on 1 and 2, land on 3, stretching away while the leader stretches the other way.[^3]

Hip bumps led from the centers are the usual filler during the stretch, and grooving in place also works.[^4] Standard exits are a [[Sugar Tuck|tuck]] or an inside turn. The entry can be accelerated ("one, two-and-three") to land the stretch on a hit in the music.[^5]

[^1]: Filipe de Barros, ["Slingshot TIPS & TRICKS | For West Coast Swing Leaders & Followers"](https://www.youtube.com/watch?v=HeH6r-tGX18&t=25s) at 0:25–1:06.
[^2]: Brian B & Megan, West Coast Swing Online, ["3 "WCS Slingshot" Variations for West Coast Swing"](https://www.youtube.com/watch?v=0a2z7VlTKGs&t=52s) at 0:52–3:11.
[^3]: Filipe de Barros, ["Slingshot TIPS & TRICKS | For West Coast Swing Leaders & Followers"](https://www.youtube.com/watch?v=HeH6r-tGX18&t=112s) at 1:52.
[^4]: Filipe de Barros, ["Slingshot TIPS & TRICKS | For West Coast Swing Leaders & Followers"](https://www.youtube.com/watch?v=HeH6r-tGX18&t=147s) at 2:27.
[^5]: Filipe de Barros, ["Slingshot TIPS & TRICKS | For West Coast Swing Leaders & Followers"](https://www.youtube.com/watch?v=HeH6r-tGX18&t=176s) at 2:56–5:01.`,
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
