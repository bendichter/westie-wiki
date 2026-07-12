/**
 * One-time content migration, safe to re-run:
 *
 * 1. Removes the seeded competition clips that were speculatively attached to
 *    specific moves (the "watch for whips!" annotations) — full dances don't
 *    belong on individual move pages without real timestamps.
 * 2. Registers a catalog of verified real dance videos (competition heats,
 *    routines, pro shows) as `dances`, ready for the community to annotate
 *    move by move.
 *
 * Run locally:  npx tsx src/db/index-dances.ts
 * Run in prod:  fly ssh console -a westie-wiki -C "npx tsx src/db/index-dances.ts"
 */
import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "./index";
import { danceDancers, dancers, dances, events, users, videoDancers, videos } from "./schema";
import { slugify, uniqueSlug } from "../lib/slug";

type DanceEntry = {
  youtubeId: string;
  title: string;
  dancers: { name: string; role: "leader" | "follower" | null }[];
  event: string | null;
  eventYear: number | null;
  competition: string | null;
  note?: string | null;
};

// seed clips that attached full competition videos to single moves on vibes
const SPECULATIVE_CLIP_IDS = [
  "sfCLysB65UI",
  "q0htEqpnKUE",
  "rHD6oFaEASE",
  "ijV3ie60AP8",
  "GGi2Rkf-15g",
  "uQ8pVIm8yv4",
  "4VTlCKcXYAY",
  "HG0wchQTL-0",
];

// those same videos, re-homed as registered dances (+ the newly indexed catalog below)
const DANCES: DanceEntry[] = [
  {
    youtubeId: "sfCLysB65UI",
    title: "West Coast Swing - Ben Morris & Cameo McHenry - The US Open Swing Dance Championships Classic 1st",
    dancers: [
      { name: "Ben Morris", role: "leader" },
      { name: "Cameo McHenry", role: "follower" },
    ],
    event: "US Open Swing Dance Championships",
    eventYear: 2022,
    competition: "Classic",
  },
  {
    youtubeId: "q0htEqpnKUE",
    title: "2012 US Open Swing Dance Championships - Classic Division Champions",
    dancers: [
      { name: "Jordan Frisbee", role: "leader" },
      { name: "Tatiana Mollmann", role: "follower" },
    ],
    event: "US Open Swing Dance Championships",
    eventYear: 2012,
    competition: "Classic",
  },
  {
    youtubeId: "rHD6oFaEASE",
    title: "2013 Classic Champions - Jordan & Tatiana - US Open Swing Dance Championships",
    dancers: [
      { name: "Jordan Frisbee", role: "leader" },
      { name: "Tatiana Mollmann", role: "follower" },
    ],
    event: "US Open Swing Dance Championships",
    eventYear: 2013,
    competition: "Classic",
  },
  {
    youtubeId: "ijV3ie60AP8",
    title: 'Jordan Frisbee & Tatiana Mollmann "Gravity" - Pro Jack & Jill - Budafest 2018',
    dancers: [
      { name: "Jordan Frisbee", role: "leader" },
      { name: "Tatiana Mollmann", role: "follower" },
    ],
    event: "Budafest",
    eventYear: 2018,
    competition: "Pro Jack & Jill",
  },
  {
    youtubeId: "GGi2Rkf-15g",
    title: "Improv West Coast Swing Dance - Ben Morris & Victoria Henk - Budafest 2024 Pro Jack & Jill",
    dancers: [
      { name: "Ben Morris", role: "leader" },
      { name: "Victoria Henk", role: "follower" },
    ],
    event: "Budafest",
    eventYear: 2024,
    competition: "Pro Jack & Jill",
  },
  {
    youtubeId: "uQ8pVIm8yv4",
    title: "Improv West Coast Swing - Ben Morris & Tatiana Mollmann - City of Angels 2023 Champions Jack & Jill",
    dancers: [
      { name: "Ben Morris", role: "leader" },
      { name: "Tatiana Mollmann", role: "follower" },
    ],
    event: "City of Angels Swing Dance Championships",
    eventYear: 2023,
    competition: "Champions Jack & Jill",
  },
  {
    youtubeId: "4VTlCKcXYAY",
    title: "West Coast Swing | Kyle Redd + Sarah Vann Drake | Champion JJ Prelim - Desert City Swing",
    dancers: [
      { name: "Kyle Redd", role: "leader" },
      { name: "Sarah Vann Drake", role: "follower" },
    ],
    event: "Desert City Swing",
    eventYear: null,
    competition: "Champions Jack & Jill",
  },
  {
    youtubeId: "HG0wchQTL-0",
    title: "Improv West Coast Swing Dance - Maxence Martin & Virginie Grondin - Swingtzerland 2020 Pro Show",
    dancers: [
      { name: "Maxence Martin", role: "leader" },
      { name: "Virginie Grondin", role: "follower" },
    ],
    event: "Swingtzerland",
    eventYear: 2020,
    competition: "Pro Show",
  },
  // --- indexed catalog (verified via oEmbed) is appended below ---
  {
    youtubeId: "s1C3QHJ61n4",
    title: "Swing Fling 2024 Champions Jack & Jill PJ Turner & Larisa Tingle",
    dancers: [
      { name: "PJ Turner", role: "leader" },
      { name: "Larisa Tingle", role: "follower" },
    ],
    event: "Swing Fling",
    eventYear: 2024,
    competition: "Champions Jack & Jill",
    note: null,
  },
  {
    youtubeId: "RlYeSuzlVv0",
    title: "Swing Fling 2024 Champions Jack & Jill Thibault Ramirez & Tren Veal",
    dancers: [
      { name: "Thibault Ramirez", role: "leader" },
      { name: "Tren Veal", role: "follower" },
    ],
    event: "Swing Fling",
    eventYear: 2024,
    competition: "Champions Jack & Jill",
    note: null,
  },
  {
    youtubeId: "cF4Stm_iqSw",
    title: "Swing Fling 2024 Champions Jack & Jill Ryan Boz & Mia Primavera",
    dancers: [
      { name: "Ryan Boz", role: "leader" },
      { name: "Mia Primavera", role: "follower" },
    ],
    event: "Swing Fling",
    eventYear: 2024,
    competition: "Champions Jack & Jill",
    note: null,
  },
  {
    youtubeId: "ffaqfVUcs9U",
    title: "Swing Fling 2024 Champions Strictly Swing Robert Royston & Larisa Tingle",
    dancers: [
      { name: "Robert Royston", role: "leader" },
      { name: "Larisa Tingle", role: "follower" },
    ],
    event: "Swing Fling",
    eventYear: 2024,
    competition: "Champions Strictly Swing",
    note: null,
  },
  {
    youtubeId: "jyMJyeAkZic",
    title: "Liberty Swing 2024 Champions Strictly Swing Maxime Zzaoui & Nicole Ramirez",
    dancers: [
      { name: "Maxime Zzaoui", role: "leader" },
      { name: "Nicole Ramirez", role: "follower" },
    ],
    event: "Liberty Swing",
    eventYear: 2024,
    competition: "Champions Strictly Swing",
    note: null,
  },
  {
    youtubeId: "Bmmm9Mqdu6s",
    title: "Liberty Swing 2024 Champions Strictly Swing Robert Royston & Jessica Cox",
    dancers: [
      { name: "Robert Royston", role: "leader" },
      { name: "Jessica Cox", role: "follower" },
    ],
    event: "Liberty Swing",
    eventYear: 2024,
    competition: "Champions Strictly Swing",
    note: null,
  },
  {
    youtubeId: "jrQ_vYCdP34",
    title: "Liberty Swing 2024 Champions Strictly Swing Arjay Centeno & Bryn Anderson",
    dancers: [
      { name: "Arjay Centeno", role: "leader" },
      { name: "Bryn Anderson", role: "follower" },
    ],
    event: "Liberty Swing",
    eventYear: 2024,
    competition: "Champions Strictly Swing",
    note: null,
  },
  {
    youtubeId: "Qr9_aocDqAc",
    title: "John Lindo & Victoria Henk - Champions Jack&Jill Finals - Jack&Jill O'Rama 2024",
    dancers: [
      { name: "John Lindo", role: "leader" },
      { name: "Victoria Henk", role: "follower" },
    ],
    event: "Jack & Jill O'Rama",
    eventYear: 2024,
    competition: "Champions Jack & Jill",
    note: null,
  },
  {
    youtubeId: "QxQSyNNjlT0",
    title: "KP Rutland & Bryn Anderson - 1st place Champions Jack&Jill Finals - Summer Hummer 2024",
    dancers: [
      { name: "KP Rutland", role: "leader" },
      { name: "Bryn Anderson", role: "follower" },
    ],
    event: "Summer Hummer",
    eventYear: 2024,
    competition: "Champions Jack & Jill",
    note: "1st place",
  },
  {
    youtubeId: "wT_I0fgBkXk",
    title: "PJ Turner & Nicole Ramirez - 2nd place Champions Jack&Jill Finals - Summer Hummer 2024",
    dancers: [
      { name: "PJ Turner", role: "leader" },
      { name: "Nicole Ramirez", role: "follower" },
    ],
    event: "Summer Hummer",
    eventYear: 2024,
    competition: "Champions Jack & Jill",
    note: "2nd place",
  },
  {
    youtubeId: "sz6GhXI11NE",
    title: "Jeren Kutcher and Julia Boucher - Advanced Jack&Jill Finals - Summer Hummer 2024",
    dancers: [
      { name: "Jeren Kutcher", role: null },
      { name: "Julia Boucher", role: null },
    ],
    event: "Summer Hummer",
    eventYear: 2024,
    competition: "Advanced Jack & Jill",
    note: null,
  },
  {
    youtubeId: "o0VxAlaVTWU",
    title: "Capital Swing Champions J’n’J 2024 Deon Harrell And Melissa Rutz",
    dancers: [
      { name: "Deon Harrell", role: "leader" },
      { name: "Melissa Rutz", role: "follower" },
    ],
    event: "Capital Swing",
    eventYear: 2024,
    competition: "Champions Jack & Jill",
    note: null,
  },
  {
    youtubeId: "fb3iluyXWPM",
    title: "Boogie by the Bay 2023 Champions Strictly - John Lindo & Bryn Anderson",
    dancers: [
      { name: "John Lindo", role: "leader" },
      { name: "Bryn Anderson", role: "follower" },
    ],
    event: "Boogie by the Bay",
    eventYear: 2023,
    competition: "Champions Strictly Swing",
    note: null,
  },
  {
    youtubeId: "OkBjVv7atQI",
    title: "Improv West Coast Swing - Ben Morris & Torri Zzaoui - Boogie By The Bay 2023 Champions Strictly 2nd",
    dancers: [
      { name: "Ben Morris", role: "leader" },
      { name: "Torri Zzaoui", role: "follower" },
    ],
    event: "Boogie by the Bay",
    eventYear: 2023,
    competition: "Champions Strictly Swing",
    note: "2nd place",
  },
  {
    youtubeId: "AzuqLfm-duE",
    title: "Boogie by the Bay 2023 Champions JnJ - Sean McKeever & Brandi Guild",
    dancers: [
      { name: "Sean McKeever", role: "leader" },
      { name: "Brandi Guild", role: "follower" },
    ],
    event: "Boogie by the Bay",
    eventYear: 2023,
    competition: "Champions Jack & Jill",
    note: null,
  },
  {
    youtubeId: "oo0mfYZdTN8",
    title: "Jakub Jakoubek & Emeline Rochefeuille - 1st Place Classic Division - The Open 2024",
    dancers: [
      { name: "Jakub Jakoubek", role: "leader" },
      { name: "Emeline Rochefeuille", role: "follower" },
    ],
    event: "The US Open Swing Dance Championships",
    eventYear: 2024,
    competition: "Classic",
    note: "1st place routine",
  },
  {
    youtubeId: "qUCVWwVmrLg",
    title: "Chantelle Pianetta & Joel Torgeson | Easter Swing Champions Strictly 2023 | West Coast Swing",
    dancers: [
      { name: "Chantelle Pianetta", role: null },
      { name: "Joel Torgeson", role: null },
    ],
    event: "Easter Swing",
    eventYear: 2023,
    competition: "Champions Strictly Swing",
    note: null,
  },
  {
    youtubeId: "UbhacxIx794",
    title: "MADjam 2023 Champions Strictly Swing Arjay Centeno & Brandi Guild",
    dancers: [
      { name: "Arjay Centeno", role: "leader" },
      { name: "Brandi Guild", role: "follower" },
    ],
    event: "MADjam",
    eventYear: 2023,
    competition: "Champions Strictly Swing",
    note: null,
  },
  {
    youtubeId: "zu9DvDw2yvM",
    title: "MADjam 2023 Champions Jack & Jill Arjay Centeno & Tren Veal",
    dancers: [
      { name: "Arjay Centeno", role: "leader" },
      { name: "Tren Veal", role: "follower" },
    ],
    event: "MADjam",
    eventYear: 2023,
    competition: "Champions Jack & Jill",
    note: null,
  },
  {
    youtubeId: "M5S-vbYXwi4",
    title: "Kyle Redd & Chantelle Pianetta | Monterey SwingFest 2023 | AS/Champion Strictly | West Coast Swing",
    dancers: [
      { name: "Kyle Redd", role: "leader" },
      { name: "Chantelle Pianetta", role: "follower" },
    ],
    event: "Monterey SwingFest",
    eventYear: 2023,
    competition: "All-Star/Champions Strictly Swing",
    note: null,
  },
  {
    youtubeId: "kObwY_mhkPg",
    title: "Piotr Lenart & Fiona Lim - All-Stars Jack&Jill Finals - Warsaw Halloween Swing 2022",
    dancers: [
      { name: "Piotr Lenart", role: "leader" },
      { name: "Fiona Lim", role: "follower" },
    ],
    event: "Warsaw Halloween Swing",
    eventYear: 2022,
    competition: "All-Stars Jack & Jill",
    note: null,
  },
  {
    youtubeId: "e2vhpmDg9o8",
    title: "Philippe Amar & Vanessa Bachmann - Jack&Jill All-Stars Finals - Warsaw Halloween Swing 2023",
    dancers: [
      { name: "Philippe Amar", role: "leader" },
      { name: "Vanessa Bachmann", role: "follower" },
    ],
    event: "Warsaw Halloween Swing",
    eventYear: 2023,
    competition: "All-Stars Jack & Jill",
    note: null,
  },
  {
    youtubeId: "zPH5rz1s8LI",
    title: "Maxime Zzaoui & Melodie Paletta - Champions Jack&Jill Finals - Budafest 2024",
    dancers: [
      { name: "Maxime Zzaoui", role: "leader" },
      { name: "Melodie Paletta", role: "follower" },
    ],
    event: "Budafest",
    eventYear: 2024,
    competition: "Champions Jack & Jill",
    note: null,
  },
  {
    youtubeId: "0t1h3TagaD0",
    title: "Improv West Coast Swing - Ben Morris & Emeline Rochefeuille - Budafest 2023 Invitational Jack & Jill",
    dancers: [
      { name: "Ben Morris", role: "leader" },
      { name: "Emeline Rochefeuille", role: "follower" },
    ],
    event: "Budafest",
    eventYear: 2023,
    competition: "Invitational Jack & Jill",
    note: null,
  },
  {
    youtubeId: "xh8DrpJDrFg",
    title: "Jordan Frisbee & Nicole Ramirez \"Man! I Feel Like A Woman!\" - Invitational Jack&Jill - Budafest 2023",
    dancers: [
      { name: "Jordan Frisbee", role: "leader" },
      { name: "Nicole Ramirez", role: "follower" },
    ],
    event: "Budafest",
    eventYear: 2023,
    competition: "Invitational Jack & Jill",
    note: null,
  },
  {
    youtubeId: "kl3EPIRdyLc",
    title: "Thibault Ramirez & Tatiana Mollmann - Invitational Jack&Jill - Budafest 2024 [FULL EXTENDED]",
    dancers: [
      { name: "Thibault Ramirez", role: "leader" },
      { name: "Tatiana Mollmann", role: "follower" },
    ],
    event: "Budafest",
    eventYear: 2024,
    competition: "Invitational Jack & Jill",
    note: null,
  },
  {
    youtubeId: "hWPLvBoxOGg",
    title: "Maxence Martin & Emeline Rochefeuille - Invitational Jack&Jill - Budafest 2024  [FULL EXTENDED]",
    dancers: [
      { name: "Maxence Martin", role: "leader" },
      { name: "Emeline Rochefeuille", role: "follower" },
    ],
    event: "Budafest",
    eventYear: 2024,
    competition: "Invitational Jack & Jill",
    note: null,
  },
  {
    youtubeId: "k1U8Eqws4qo",
    title: "Ben Morris & Victoria Henk - Invitational Jack&Jill - Budafest 2024 [FULL EXTENDED]",
    dancers: [
      { name: "Ben Morris", role: "leader" },
      { name: "Victoria Henk", role: "follower" },
    ],
    event: "Budafest",
    eventYear: 2024,
    competition: "Invitational Jack & Jill",
    note: null,
  },
  {
    youtubeId: "h8WkqINNwnk",
    title: "Glenn Ball & Victoria Henk - BudaFest 2019 Invitiational Jack & Jill Show - West Coast Swing Dance",
    dancers: [
      { name: "Glenn Ball", role: "leader" },
      { name: "Victoria Henk", role: "follower" },
    ],
    event: "Budafest",
    eventYear: 2019,
    competition: "Invitational Jack & Jill",
    note: null,
  },
  {
    youtubeId: "7snXtTznD3Y",
    title: "Jakub Jakoubek & Aggie Powell - Pro Jack&Jill (Invitational) - Baltic Swing 2023",
    dancers: [
      { name: "Jakub Jakoubek", role: "leader" },
      { name: "Aggie Powell", role: "follower" },
    ],
    event: "Baltic Swing",
    eventYear: 2023,
    competition: "Pro Jack & Jill",
    note: null,
  },
  {
    youtubeId: "8g5jE0tyD9I",
    title: "Maxime Zzaoui & Victoria Henk - Swingtzerland 2017 Champions Jack & Jill 3rd Place",
    dancers: [
      { name: "Maxime Zzaoui", role: "leader" },
      { name: "Victoria Henk", role: "follower" },
    ],
    event: "Swingtzerland",
    eventYear: 2017,
    competition: "Champions Jack & Jill",
    note: "3rd place",
  },
  {
    youtubeId: "HI23ZSnaNgg",
    title: "Ben Morris & Victoria Henk - Swingtzerland 2019 Pro Jack & Jill Show - Improv West Coast Swing Dance",
    dancers: [
      { name: "Ben Morris", role: "leader" },
      { name: "Victoria Henk", role: "follower" },
    ],
    event: "Swingtzerland",
    eventYear: 2019,
    competition: "Pro Jack & Jill Show",
    note: null,
  },
  {
    youtubeId: "ySAK_ggzW00",
    title: "West Coast Swing - Ben Morris & Tashina Beckmann King - Swingtzerland 2020 Pro Jack & Jill Show",
    dancers: [
      { name: "Ben Morris", role: "leader" },
      { name: "Tashina Beckmann King", role: "follower" },
    ],
    event: "Swingtzerland",
    eventYear: 2020,
    competition: "Pro Jack & Jill Show",
    note: null,
  },
  {
    youtubeId: "6cdTsFz6djk",
    title: "JESSICA PACHECO & Maxence Martin | WEST COAST SWING DANCE | PRO J&J | Swingtzerland (CH)",
    dancers: [
      { name: "Maxence Martin", role: "leader" },
      { name: "Jessica Pacheco", role: "follower" },
    ],
    event: "Swingtzerland",
    eventYear: null,
    competition: "Pro Jack & Jill",
    note: null,
  },
  {
    youtubeId: "RtI434d9Vfc",
    title: "Johanna Thorn & Petter Fossheim - 1st place Switch Jack&Jill - Rock The Barn 2023",
    dancers: [
      { name: "Johanna Thorn", role: null },
      { name: "Petter Fossheim", role: null },
    ],
    event: "Rock The Barn",
    eventYear: 2023,
    competition: "Switch Jack & Jill",
    note: "1st place; switch division — roles alternate",
  },
  {
    youtubeId: "LqQGd-joikI",
    title: "MOVHigh Pro Show French Open WCS 2017",
    dancers: [
      { name: "Maxime Zzaoui", role: "leader" },
      { name: "Torri Zzaoui", role: "follower" },
      { name: "Olivier Massart", role: "leader" },
      { name: "Virginie Massart", role: "follower" },
    ],
    event: "French Open West Coast Swing",
    eventYear: 2017,
    competition: "Pro Show",
    note: "MOVHigh group show — two couples",
  },
  {
    youtubeId: "uNgZ_T2MABU",
    title: "Emeline Rochefeuille & Maxence Martin - Champions Jack & Jill - Budafest 2024",
    dancers: [
      { name: "Maxence Martin", role: "leader" },
      { name: "Emeline Rochefeuille", role: "follower" },
    ],
    event: "Budafest",
    eventYear: 2024,
    competition: "Champions Jack & Jill",
    note: null,
  },
  {
    youtubeId: "o79HE0_U3l8",
    title: "Emeline Rochefeuille & Maxence Martin - Pros Jack & Jill - WOTP 2024",
    dancers: [
      { name: "Maxence Martin", role: "leader" },
      { name: "Emeline Rochefeuille", role: "follower" },
    ],
    event: "WOTP",
    eventYear: 2024,
    competition: "Pros Jack & Jill",
    note: null,
  },
  {
    youtubeId: "qTmEpTgy1mk",
    title: "Maxence Martin & Virginie Grondin - Champions Jack&Jill - D-Town Swing 2023",
    dancers: [
      { name: "Maxence Martin", role: "leader" },
      { name: "Virginie Grondin", role: "follower" },
    ],
    event: "D-Town Swing",
    eventYear: 2023,
    competition: "Champions Jack & Jill",
    note: null,
  },
  {
    youtubeId: "Ywlikb_LAVI",
    title: "Ben Mchenry and Cameo Mchenry - Champions Jack&Jill Finals - US Open 2022",
    dancers: [
      { name: "Ben McHenry", role: "leader" },
      { name: "Cameo McHenry", role: "follower" },
    ],
    event: "US Open Swing Dance Championships",
    eventYear: 2022,
    competition: "Champions Jack & Jill",
    note: null,
  },
  {
    youtubeId: "lL3MEeM7-PU",
    title: "Thibault Ramirez & Torri Smith Zzaoui - 1st place Champions Jack&Jill - The Open 2022",
    dancers: [
      { name: "Thibault Ramirez", role: "leader" },
      { name: "Torri Smith Zzaoui", role: "follower" },
    ],
    event: "The Open Swing Dance Championships",
    eventYear: 2022,
    competition: "Champions Jack & Jill",
    note: "1st place",
  },
  {
    youtubeId: "Nuessx9D23c",
    title: "MADjam 2023 Champions Jack & Jill Jakub Jakoubek & Nicole Ramirez",
    dancers: [
      { name: "Jakub Jakoubek", role: "leader" },
      { name: "Nicole Ramirez", role: "follower" },
    ],
    event: "MADjam",
    eventYear: 2023,
    competition: "Champions Jack & Jill",
    note: null,
  },
  {
    youtubeId: "7SBKGiNKdxk",
    title: "Jakub Jakoubek & Emeline Rochefeuille \"Loverboy\" - Pro Jack&Jill - Baltic Swing 2022",
    dancers: [
      { name: "Jakub Jakoubek", role: "leader" },
      { name: "Emeline Rochefeuille", role: "follower" },
    ],
    event: "Baltic Swing",
    eventYear: 2022,
    competition: "Pro Jack & Jill",
    note: null,
  },
  {
    youtubeId: "RJY5KkM8j24",
    title: "Sean McKeever & Victoria Henk - Champions Jack&Jill - SwingCouver 2020",
    dancers: [
      { name: "Sean McKeever", role: "leader" },
      { name: "Victoria Henk", role: "follower" },
    ],
    event: "SwingCouver",
    eventYear: 2020,
    competition: "Champions Jack & Jill",
    note: null,
  },
  {
    youtubeId: "NZAYp2TQPuA",
    title: "Ben Morris & Torri Zzaoui - Swingtzerland 2017 Champions Jack & Jill 1st Place",
    dancers: [
      { name: "Ben Morris", role: "leader" },
      { name: "Torri Zzaoui", role: "follower" },
    ],
    event: "Swingtzerland",
    eventYear: 2017,
    competition: "Champions Jack & Jill",
    note: "1st place",
  },
  {
    youtubeId: "QZ5qd4wU01Y",
    title: "Maria Elizarova & Semion Ovsiannikov Bavarian Open 2017 All Star JnJ",
    dancers: [
      { name: "Semion Ovsiannikov", role: "leader" },
      { name: "Maria Elizarova", role: "follower" },
    ],
    event: "Bavarian Open",
    eventYear: 2017,
    competition: "All-Star Jack & Jill",
    note: null,
  },
  {
    youtubeId: "cBWIMaVPHws",
    title: "Semion Ovsiannikov & Maria Elizarova US Open 2017 West Coast Swing Routine in the Classic Division",
    dancers: [
      { name: "Semion Ovsiannikov", role: "leader" },
      { name: "Maria Elizarova", role: "follower" },
    ],
    event: "US Open Swing Dance Championships",
    eventYear: 2017,
    competition: "Classic",
    note: null,
  },
  {
    youtubeId: "D02pzbfXwJU",
    title: "Semion Ovsiannikov & Maria Elizarova West Coast Swing ProShow at Budafest 2024, Budapest, Hungary",
    dancers: [
      { name: "Semion Ovsiannikov", role: "leader" },
      { name: "Maria Elizarova", role: "follower" },
    ],
    event: "Budafest",
    eventYear: 2024,
    competition: "Pro Show",
    note: null,
  },
  {
    youtubeId: "xmbulgF-vIQ",
    title: "Hugo Miguez & Stacy Kay - Classic Division - The Open 2022",
    dancers: [
      { name: "Hugo Miguez", role: "leader" },
      { name: "Stacy Kay", role: "follower" },
    ],
    event: "The Open Swing Dance Championships",
    eventYear: 2022,
    competition: "Classic",
    note: null,
  },
  {
    youtubeId: "J5_JJyjAP4g",
    title: "Maxence Martin & Tatiana Mollmann - Invitational Jack&Jill - Budafest 2019",
    dancers: [
      { name: "Maxence Martin", role: "leader" },
      { name: "Tatiana Mollmann", role: "follower" },
    ],
    event: "Budafest",
    eventYear: 2019,
    competition: "Invitational Jack & Jill",
    note: null,
  },
  {
    youtubeId: "QGMNUOQmYp0",
    title: "Mircea Albu & Tatiana Mollmann - Winner Jack&Jill - Budafest 2026",
    dancers: [
      { name: "Mircea Albu", role: "leader" },
      { name: "Tatiana Mollmann", role: "follower" },
    ],
    event: "Budafest",
    eventYear: 2026,
    competition: "Jack & Jill",
    note: "Winning couple",
  },
  {
    youtubeId: "MfUIaK87zGQ",
    title: "MADjam 2014 Champions Jack &Jill  Robert Royston & Trendlyon Veal",
    dancers: [
      { name: "Robert Royston", role: "leader" },
      { name: "Trendlyon Veal", role: "follower" },
    ],
    event: "MADjam",
    eventYear: 2014,
    competition: "Champions Jack & Jill",
    note: null,
  },
  {
    youtubeId: "d--lNP9aI5k",
    title: "MADjam 2022 Champions Jack & Jill Kyle Redd & Bryn Anderson",
    dancers: [
      { name: "Kyle Redd", role: "leader" },
      { name: "Bryn Anderson", role: "follower" },
    ],
    event: "MADjam",
    eventYear: 2022,
    competition: "Champions Jack & Jill",
    note: null,
  },
  {
    youtubeId: "xRtmu6lqxU0",
    title: "Wild Wild Westie 2024 Champions Jack & Jill | Glenn Ball & Nicole Ramirez",
    dancers: [
      { name: "Glenn Ball", role: "leader" },
      { name: "Nicole Ramirez", role: "follower" },
    ],
    event: "Wild Wild Westie",
    eventYear: 2024,
    competition: "Champions Jack & Jill",
    note: null,
  },
  {
    youtubeId: "4HxarGxSAbE",
    title: "Wild Wild Westie 2024 Champions Jack & Jill | Arjay Centeno & Brandi Guild",
    dancers: [
      { name: "Arjay Centeno", role: "leader" },
      { name: "Brandi Guild", role: "follower" },
    ],
    event: "Wild Wild Westie",
    eventYear: 2024,
    competition: "Champions Jack & Jill",
    note: null,
  },
  {
    youtubeId: "faOjIwtueik",
    title: "West Coast Swing | Ben Mchenry + Melissa Rutz | 3rd Place Champions JnJ - Desert City Swing",
    dancers: [
      { name: "Ben McHenry", role: "leader" },
      { name: "Melissa Rutz", role: "follower" },
    ],
    event: "Desert City Swing",
    eventYear: null,
    competition: "Champions Jack & Jill",
    note: "3rd place",
  },
];

const archivist = db.select().from(users).where(eq(users.username, "archivist")).get();
if (!archivist) {
  console.error("No archivist account found — aborting.");
  process.exit(1);
}

// --- 1. remove speculative move annotations ---
const doomed = db
  .select({ id: videos.id })
  .from(videos)
  .where(and(inArray(videos.youtubeId, SPECULATIVE_CLIP_IDS), isNull(videos.danceId)))
  .all()
  .map((r) => r.id);
if (doomed.length > 0) {
  db.delete(videoDancers).where(inArray(videoDancers.videoId, doomed)).run();
  db.delete(videos).where(inArray(videos.id, doomed)).run();
}
console.log(`Removed ${doomed.length} speculative move clips.`);

// --- 2. register dances ---
function findOrCreateDancer(name: string): number {
  const slug = slugify(name);
  const existing = db.select().from(dancers).where(eq(dancers.slug, slug)).get();
  if (existing) return existing.id;
  const finalSlug = uniqueSlug(
    slug,
    (c) => !!db.select({ id: dancers.id }).from(dancers).where(eq(dancers.slug, c)).get()
  );
  return db.insert(dancers).values({ slug: finalSlug, name }).returning().get().id;
}

function findOrCreateEvent(name: string, year: number | null): number {
  const slug = slugify(year ? `${name} ${year}` : name);
  const existing = db.select().from(events).where(eq(events.slug, slug)).get();
  if (existing) return existing.id;
  return db.insert(events).values({ slug, name, year }).returning().get().id;
}

let added = 0;
let skipped = 0;
for (const entry of DANCES) {
  if (db.select({ id: dances.id }).from(dances).where(eq(dances.youtubeId, entry.youtubeId)).get()) {
    skipped++;
    continue;
  }
  const slugBase =
    entry.dancers.length > 0
      ? `${entry.dancers.map((d) => d.name).join(" ")}${entry.event ? ` ${entry.event}` : ""}${entry.eventYear ? ` ${entry.eventYear}` : ""}`
      : entry.title;
  const slug = uniqueSlug(
    slugify(slugBase),
    (c) => !!db.select({ id: dances.id }).from(dances).where(eq(dances.slug, c)).get()
  );
  const dance = db
    .insert(dances)
    .values({
      slug,
      youtubeId: entry.youtubeId,
      title: entry.title,
      note: entry.note ?? null,
      competition: entry.competition,
      eventId: entry.event ? findOrCreateEvent(entry.event, entry.eventYear) : null,
      addedBy: archivist.id,
      createdAt: Date.now(),
    })
    .returning()
    .get();
  const seen = new Set<number>();
  for (const d of entry.dancers) {
    const dancerId = findOrCreateDancer(d.name);
    if (seen.has(dancerId)) continue;
    seen.add(dancerId);
    db.insert(danceDancers).values({ danceId: dance.id, dancerId, role: d.role }).run();
  }
  added++;
}
console.log(`Registered ${added} dances (${skipped} already present).`);
