# Westie Wiki Sponsor Kit

Internal reference: pricing, outreach templates, and how the sponsor system works.
(Manage live sponsors at `/admin/sponsors`. Admin usernames are set by `ADMIN_USERNAMES` in fly.toml.)

## Inventory

| Placement | Where it appears | Slots |
|---|---|---|
| **Site Sponsor** | Sidebar card on **every move page** (the highest-traffic pages) + top card on the home page | 1 (exclusive) |
| **Community Sponsor** | Home page sidebar card | 2 |
| **Event Boost** | Community Sponsor slot, time-boxed to an event's registration window | as available |

Every placement is a clearly-labeled card: sponsor name, one-line tagline, link. Clicks route
through `/s/[id]` so click counts are reportable. No tracking scripts, no user data shared.

## Pricing

**Founding rates**: honest positioning while the site grows; locked for 12 months for anyone
who signs on before the site reaches ~5,000 monthly visitors:

| Placement | Monthly | Annual (2 months free) |
|---|---|---|
| Site Sponsor (exclusive) | **$50** | **$500** |
| Community Sponsor | **$25** | **$250** |
| Event Boost (6 weeks) | **$79 flat** | n/a |

**Standard rates**: switch to these once analytics show sustained traffic (~5k+ visits/mo):

| Placement | Monthly | Annual |
|---|---|---|
| Site Sponsor (exclusive) | $150 | $1,500 |
| Community Sponsor | $60 | $600 |
| Event Boost (6 weeks) | $199 flat | n/a |

Rationale: at founding scale this prices like "support the project, get real placement";
at standard scale it's still far below what a WCS event spends on one Facebook campaign,
with a fully-targeted audience. Revisit rates when real analytics exist, and anchor to roughly
$10–20 per thousand qualified page views.

**Terms to state up front:** month-to-month, cancel anytime; sponsors must be relevant to the
swing dance community (events, shoes, apparel, instruction, music); sponsorship never
influences wiki content; monthly click report included.

## Community post (Facebook groups / Reddit r/WestCoastSwing / newsletters)

> **Westie Wiki is live and looking for its founding sponsors** 🕺
>
> westie.wiki is a new community-edited encyclopedia of West Coast Swing: 25+ moves documented
> with timestamped video of real dancers at real events, full dances mapped move-by-move,
> learning paths with progress tracking, all free and editable by the community.
>
> To keep it free and ad-junk-free, we're offering a handful of **founding sponsor** slots:
> a clean, clearly-labeled card with your name and link on the site, starting at **$25/month**,
> with the exclusive every-page slot at **$50/month**, rates locked for a year. If you run an
> event, teach, or sell dance shoes/gear, this is your audience: dancers actively looking up
> moves after class.
>
> Details at westie.wiki/sponsor or email me. And whether or not you sponsor, come document
> a move! ✨

## Direct outreach email (event organizers, instructors, vendors)

> Subject: Founding sponsor slot on westie.wiki ($25–50/mo, WCS dancers only)
>
> Hi [name],
>
> I run westie.wiki, a new community wiki that documents West Coast Swing moves with
> timestamped video examples, mapped dances, and learning paths. The people using it are
> exactly your audience: dancers looking up patterns after class and deciding which event
> to hit next.
>
> I'm offering founding sponsorships while the site grows: a clearly-labeled card with your
> name, tagline, and link: $25/month on the home page, or $50/month for the exclusive slot
> that appears on every move page. Rates locked for 12 months, month-to-month, cancel anytime,
> click counts reported monthly. For events, I also do a flat $79 six-week placement timed to
> your registration window.
>
> Interested? Reply and I'll set you up this week.
>
> [your name], westie.wiki

## Operational notes

- Add/pause/delete sponsors and see click counts at `/admin/sponsors` (log in as an admin
  account; usernames listed in `ADMIN_USERNAMES`).
- When no sponsor is active, the slot shows a house ad linking to `/sponsor`.
- The `/sponsor` page contact email comes from `SPONSOR_CONTACT_EMAIL` (defaults to
  ben.dichter@gmail.com); change it with `fly secrets set SPONSOR_CONTACT_EMAIL=...`.
- Payment collection is manual (invoice, PayPal, or Zelle, your choice); nothing is built in.
