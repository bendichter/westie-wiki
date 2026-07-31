---
name: Westie Wiki
description: A community-edited encyclopedia of West Coast Swing — indigo ink, denim blue, amber stage light on warm paper.
colors:
  ink: "#212842"
  ink-soft: "#3a4160"
  paper: "#f6f6f2"
  panel: "#ffffff"
  denim: "#35507f"
  denim-deep: "#273c61"
  amber: "#b8681b"
  amber-soft: "#f3e3cd"
  line: "#deddd3"
  muted: "#6b7086"
  danger: "#a33b2e"
  success: "#2e6b46"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Avenir Next, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Bricolage Grotesque, Avenir Next, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Bricolage Grotesque, Avenir Next, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  mono:
    fontFamily: "Spline Sans Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "20px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.denim}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.denim-deep}"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-secondary-hover:
    textColor: "{colors.denim}"
  input:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  card:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  chip-tag:
    textColor: "{colors.denim}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  chip-count:
    textColor: "{colors.ink-soft}"
    typography: "{typography.mono}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
---

# Design System: Westie Wiki

## Overview

**Creative North Star: "The Ballroom at Night"**

The system pictures a social dance late in the evening: a dark indigo room, one warm amber
stage light, denim on the floor, and warm paper for the pages where dancers write it all down.
The dark ink lives in the site chrome (header, footer), the paper is the reading surface, denim
carries every link and action, and amber appears only where attention belongs: the brand mark,
the slot marker, the play button on hover, the Join button.

The mood is warm and welcoming above all. This is a community reference built by dancers for
dancers, so nothing should feel corporate, gamified, or intimidating. The reading experience is
bookish in practice (serif body text, footnote citations, revision history) but the personality
stays approachable: friendly copy, generous line-height, and a signature motif with a wink. That
motif is **the slot**: a thin track line with a round amber marker, echoing West Coast Swing's
slotted dance. It underlines the brand mark, sits beneath every page title, and frames clip
timestamps on video cards.

**Key Characteristics:**
- Warm paper page, white panels, dark indigo chrome; depth from color banding, never shadows
- Serif prose for reading, grotesque display type for headings and UI chrome, mono for timestamps
- Denim blue is the single interactive voice; amber is scarce and always meaningful
- The slot-line motif (track + marker) as the recurring signature
- Quiet, utilitarian components: flat fills, 1px hairlines, modest radii

## Colors

A nocturnal indigo-and-amber palette grounded on warm paper, with denim blue as the sole
interactive voice.

### Primary
- **Denim Blue** (#35507f): every link, primary button fill, focus ring, and tag chip. If it is
  denim, you can click it. Tints of it (8–25% opacity) make chip backgrounds and borders.
- **Deep Denim** (#273c61): primary button hover and the tagline banner under the header.

### Secondary
- **Amber Stage Light** (#b8681b): the spotlight. The brand mark's second word, the slot-line
  marker dot, the intermediate difficulty badge, the play button on hover, and the Join button.
  Used at small sizes only; its scarcity is what makes it read as light.
- **Soft Amber** (#f3e3cd): the only large amber surface allowed, and only as a wash: text
  selection highlight and gentle callout backgrounds.

### Tertiary
- **Brick Danger** (#a33b2e): destructive actions, error alerts, advanced difficulty. Always
  muted brick, never fire-engine red.
- **Floor Green** (#2e6b46): success states and beginner difficulty.

### Neutral
- **Indigo Ink** (#212842): body text, and the fill of the header and footer bands.
- **Soft Ink** (#3a4160): secondary headings, labels, count chips; the slot track inside the
  dark header.
- **Warm Paper** (#f6f6f2): the page background, and light text on dark chrome (at 60–90%
  opacity for hierarchy).
- **Panel White** (#ffffff): cards, inputs, and any surface content sits on.
- **Hairline** (#deddd3): all borders, dividers, and table rules; warm gray, 1px, everywhere.
- **Muted** (#6b7086): metadata, hints, empty-state copy, blockquotes.

### Named Rules
**The Stage Light Rule.** Amber is a spotlight, not a paint bucket: it appears only on small,
meaningful marks (the marker dot, the brand accent, one CTA, hover on play). Soft Amber is its
only permitted wash. If amber covers a large area, the metaphor is broken.

**The One Voice Rule.** Denim is the only color that signals interactivity. Never introduce a
second link color; never use denim decoratively on non-interactive elements.

## Typography

**Display Font:** Bricolage Grotesque (with Avenir Next, sans-serif)
**Body Font:** Source Serif 4 (with Georgia, serif)
**Label/Mono Font:** Spline Sans Mono (with ui-monospace)

**Character:** A characterful grotesque doing the talking, a bookish serif doing the reading,
and a mono doing the measuring. The pairing says "a real reference work, maintained by people
with personality."

### Hierarchy
- **Display** (700, 1.875rem, 1.2, −0.01em): page titles, always followed by the slot line.
- **Headline** (600, 1.35rem): section headings within pages and prose.
- **Title** (600, 1.15rem): sub-sections and card headings.
- **Body** (400, 1.0625rem, 1.65): all running prose, in serif, capped at 65ch (`.prose-wcs`).
- **Label** (600, 0.875rem): form labels, nav items, buttons, and metadata, in the display face.
- **Mono** (400, 0.75rem): timestamps (`0:42 → 1:07`), counts, and revision numbers only.

### Named Rules
**The Two Faces Rule.** Serif is for reading; the display grotesque is for everything you scan:
headings, navigation, buttons, labels, hints, and card metadata. UI chrome never uses the serif,
and long prose never uses the grotesque.

**The Timestamp Rule.** Anything measured (clip times, durations, counts, revision numbers) is
set in the mono face, small (11–12px), never bold.

## Layout

A single centered column, max-width 72rem (`max-w-6xl`), with 16px side padding (24px ≥640px)
and 32px vertical page padding. The page is banded: dark ink header, deep-denim tagline strip,
warm paper content, dark ink footer. Prose is further constrained to 65ch inside the column.
Listing pages use responsive card grids (`grid gap-*` with 2–3 columns at `sm`/`lg`); forms and
reading pages stay single-column at `max-w-2xl`. Density is comfortable, not compact: cards pad
20px, sections separate with 24–32px, and the rhythm follows Tailwind's 4px scale.

## Elevation & Depth

The system is entirely flat: there are no box-shadows anywhere. Depth is conveyed by color
banding (dark chrome vs. paper page vs. white panels) and 1px hairline borders. State changes
express through color shifts and opacity, never lift or glow.

### Named Rules
**The Flat Floor Rule.** No box-shadows, no gradients, no glows. If a surface needs separation,
give it Panel White and a Hairline border; if it needs emphasis, give it a color tint at ≤15%
opacity.

## Shapes

Softly rounded rectangles at modest radii: 6px on controls (buttons, inputs), 8px on cards and
media containers, 4px on inline code and count chips, and full pills only for the small taxonomy
chips (tags, difficulty). Borders are always 1px solid Hairline; empty states are the one place
a dashed hairline border appears. The counterpoint to all the rectangles is the slot motif:
a 2px track line carrying an 8px round amber marker, plus the round play button and marker dots.
Circles belong to the dance layer; rectangles belong to the wiki layer.

## Components

All components share one temperament: quiet and utilitarian. Flat fills, hairline borders,
color-only state changes with short transitions (150–200ms, colors and opacity only), and
`prefers-reduced-motion` collapses all motion.

### Buttons
- **Shape:** softly rounded (6px), padding 8px 16px, Label typography (display face, 600, 14px).
- **Primary:** Denim Blue fill, white text; hover deepens to Deep Denim.
- **Secondary:** Panel White fill, Hairline border, Ink text; hover recolors border and text to
  denim. Nothing moves or lifts.
- **Disabled:** 50% opacity, same fill.
- **Amber CTA:** reserved for the single "Join" action in the header (amber fill, white text).

### Chips
- **Tag chips:** pill (9999px), denim text on an 8% denim tint with a 25% denim border; hover
  deepens the tint to 15%.
- **Difficulty badges:** same pill anatomy, color-coded 10% tints: green (beginner), amber
  (intermediate), brick (advanced).
- **Count chips:** small rectangles (4px radius), mono 11px, Soft Ink text on 5% ink tint.

### Cards / Containers
- **Corner Style:** 8px radius.
- **Background:** Panel White on the paper page.
- **Shadow Strategy:** none, per the Flat Floor Rule.
- **Border:** 1px Hairline.
- **Internal Padding:** 20px (14px for dense media cards).

### Inputs / Fields
- **Style:** Panel White, 1px Hairline border, 6px radius, 8px 12px padding, 15px text.
- **Focus:** 2px ring of 50% denim plus denim border; no outline.
- **Labels:** display face, 14px, 600, Soft Ink; hints 13px Muted below the field.
- **Errors:** brick text on an 8% brick tint with a 30% brick border, 6px radius, `role="alert"`.

### Navigation
- **Header:** Indigo Ink band; brand mark in display 24px bold with "Wiki" in amber and a
  slot-line underline. Nav links are Label type in 80% paper, hover to full paper with a 4px
  underline offset. Below it, a Deep Denim strip carries the "Descriptive, not prescriptive"
  tagline at 13px.
- **Footer:** the same ink band, 70% paper text, display face, hover underline.

### The Slot Line (signature)
A 2px Hairline track with an 8px round Amber marker sitting at its start (`.slot-line`). It
underlines the brand mark (with a Soft Ink track on dark chrome) and every page title. Video
cards extend the motif into a clip bar: marker dots at both ends of a hairline track with the
mono timestamp range between them, framing the labeled segment of the clip.

### Media (LiteYouTube)
Video embeds are click-to-load: a thumbnail at 90% opacity with a 56px round play button in 80%
ink; hover brings the thumbnail to full opacity and turns the button amber. Nothing plays or
animates until asked.

## Do's and Don'ts

### Do:
- **Do** end every page title with the slot line; it is the site's handshake.
- **Do** set all running prose in the serif at 65ch, and all UI chrome in the display face.
- **Do** use denim for every interactive element, and tints of a status color (≤15% opacity)
  with a matching low-opacity border for chips, badges, and alerts.
- **Do** use the mono face for every timestamp, duration, and count.
- **Do** keep transitions to color and opacity, 150–200ms, and honor `prefers-reduced-motion`.

### Don't:
- **Don't** use box-shadows, gradients, or glows anywhere (the Flat Floor Rule).
- **Don't** let amber cover large areas or become a second interactive color (the Stage Light
  Rule); Soft Amber washes and small marks only.
- **Don't** introduce colors outside the twelve-token palette, pure black, or pure gray;
  every neutral here is warm or indigo-leaning.
- **Don't** use the serif for buttons, labels, navigation, or metadata, or the grotesque for
  long prose (the Two Faces Rule).
- **Don't** exceed 1px borders except the 2px slot track and 3px blockquote rule.
