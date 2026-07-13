import { sqliteTable, text, integer, primaryKey, uniqueIndex, index } from "drizzle-orm/sqlite-core";

export const DANCE_ROLES = ["leader", "follower", "switch"] as const;
export type DanceRole = (typeof DANCE_ROLES)[number];

export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    username: text("username").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: integer("created_at").notNull(),
    // set once the address is confirmed; editing requires it
    emailVerifiedAt: integer("email_verified_at"),
    // optional public profile fields
    displayName: text("display_name"),
    city: text("city"),
    bio: text("bio"),
    danceRole: text("dance_role", { enum: DANCE_ROLES }),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email), uniqueIndex("users_username_idx").on(t.username)]
);

export const sessions = sqliteTable("sessions", {
  // sha256 hash of the session token; raw token only lives in the cookie
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: integer("expires_at").notNull(),
});

export const emailVerificationTokens = sqliteTable(
  "email_verification_tokens",
  {
    // sha256 hash of the token; raw token only lives in the emailed link
    id: text("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    expiresAt: integer("expires_at").notNull(),
  },
  (t) => [index("email_verification_tokens_user_idx").on(t.userId)]
);

export const passwordResetTokens = sqliteTable(
  "password_reset_tokens",
  {
    // sha256 hash of the token; raw token only lives in the emailed link
    id: text("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    expiresAt: integer("expires_at").notNull(),
  },
  (t) => [index("password_reset_tokens_user_idx").on(t.userId)]
);

export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const moves = sqliteTable(
  "moves",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    difficulty: text("difficulty", { enum: DIFFICULTIES }),
    createdBy: integer("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
    deleted: integer("deleted").notNull().default(0),
  },
  (t) => [uniqueIndex("moves_slug_idx").on(t.slug)]
);

export const moveAliases = sqliteTable(
  "move_aliases",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    moveId: integer("move_id")
      .notNull()
      .references(() => moves.id),
    name: text("name").notNull(),
  },
  (t) => [index("move_aliases_move_idx").on(t.moveId)]
);

export const moveVariants = sqliteTable(
  "move_variants",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    moveId: integer("move_id")
      .notNull()
      .references(() => moves.id),
    // e.g. "Two-hand", "Right-to-right (handshake)" — curated per move
    name: text("name").notNull(),
    note: text("note"),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [index("move_variants_move_idx").on(t.moveId)]
);

export const moveRevisions = sqliteTable(
  "move_revisions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    moveId: integer("move_id")
      .notNull()
      .references(() => moves.id),
    revisionNo: integer("revision_no").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    // JSON array of alias strings at the time of this revision
    aliases: text("aliases").notNull().default("[]"),
    // JSON array of tag names at the time of this revision
    tags: text("tags").notNull().default("[]"),
    difficulty: text("difficulty", { enum: DIFFICULTIES }),
    editorId: integer("editor_id")
      .notNull()
      .references(() => users.id),
    editSummary: text("edit_summary").notNull().default(""),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [index("move_revisions_move_idx").on(t.moveId)]
);

export const dancers = sqliteTable(
  "dancers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
  },
  (t) => [uniqueIndex("dancers_slug_idx").on(t.slug)]
);

export const events = sqliteTable(
  "events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    year: integer("year"),
  },
  (t) => [uniqueIndex("events_slug_idx").on(t.slug)]
);

export const dances = sqliteTable(
  "dances",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    youtubeId: text("youtube_id").notNull(),
    title: text("title"),
    note: text("note"),
    // competition/division, e.g. "Advanced Jack & Jill", "Classic", "Strictly Swing"
    competition: text("competition"),
    // optional result, e.g. "1st place", "Finalist" — many dances aren't competitions
    placement: text("placement"),
    eventId: integer("event_id").references(() => events.id),
    addedBy: integer("added_by")
      .notNull()
      .references(() => users.id),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [uniqueIndex("dances_slug_idx").on(t.slug), index("dances_event_idx").on(t.eventId)]
);

export const danceSongs = sqliteTable(
  "dance_songs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    danceId: integer("dance_id")
      .notNull()
      .references(() => dances.id),
    // play order within the video — extended dances often run 2-3 songs
    position: integer("position").notNull().default(0),
    song: text("song").notNull().default(""),
    artist: text("artist").notNull().default(""),
  },
  (t) => [index("dance_songs_dance_idx").on(t.danceId)]
);

export const videos = sqliteTable(
  "videos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    moveId: integer("move_id")
      .notNull()
      .references(() => moves.id),
    youtubeId: text("youtube_id").notNull(),
    startSec: integer("start_sec").notNull().default(0),
    endSec: integer("end_sec"),
    title: text("title"),
    note: text("note"),
    eventId: integer("event_id").references(() => events.id),
    // which official variant of the move this clip shows, if tagged
    variantId: integer("variant_id").references(() => moveVariants.id),
    // set when this clip is an annotation within a registered dance
    danceId: integer("dance_id").references(() => dances.id),
    addedBy: integer("added_by")
      .notNull()
      .references(() => users.id),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [
    index("videos_move_idx").on(t.moveId),
    index("videos_event_idx").on(t.eventId),
    index("videos_dance_idx").on(t.danceId),
  ]
);

export const VIDEO_ROLES = ["leader", "follower"] as const;
export type VideoRole = (typeof VIDEO_ROLES)[number];

export const videoDancers = sqliteTable(
  "video_dancers",
  {
    videoId: integer("video_id")
      .notNull()
      .references(() => videos.id),
    dancerId: integer("dancer_id")
      .notNull()
      .references(() => dancers.id),
    role: text("role", { enum: VIDEO_ROLES }),
  },
  (t) => [primaryKey({ columns: [t.videoId, t.dancerId] }), index("video_dancers_dancer_idx").on(t.dancerId)]
);

export const danceDancers = sqliteTable(
  "dance_dancers",
  {
    danceId: integer("dance_id")
      .notNull()
      .references(() => dances.id),
    dancerId: integer("dancer_id")
      .notNull()
      .references(() => dancers.id),
    role: text("role", { enum: VIDEO_ROLES }),
  },
  (t) => [primaryKey({ columns: [t.danceId, t.dancerId] }), index("dance_dancers_dancer_idx").on(t.dancerId)]
);

export const tags = sqliteTable(
  "tags",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
  },
  (t) => [uniqueIndex("tags_slug_idx").on(t.slug)]
);

export const moveTags = sqliteTable(
  "move_tags",
  {
    moveId: integer("move_id")
      .notNull()
      .references(() => moves.id),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id),
  },
  (t) => [primaryKey({ columns: [t.moveId, t.tagId] }), index("move_tags_tag_idx").on(t.tagId)]
);

export const RELATION_KINDS = ["prerequisite", "variation", "related"] as const;
export type RelationKind = (typeof RELATION_KINDS)[number];

export const moveRelations = sqliteTable(
  "move_relations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    fromMoveId: integer("from_move_id")
      .notNull()
      .references(() => moves.id),
    toMoveId: integer("to_move_id")
      .notNull()
      .references(() => moves.id),
    // "prerequisite": to-move is a prerequisite of from-move
    // "variation": from-move is a variation of to-move
    // "related": symmetric
    kind: text("kind", { enum: RELATION_KINDS }).notNull(),
  },
  (t) => [
    uniqueIndex("move_relations_unique_idx").on(t.fromMoveId, t.toMoveId, t.kind),
    index("move_relations_to_idx").on(t.toMoveId),
  ]
);

export const curricula = sqliteTable(
  "curricula",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    createdBy: integer("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
    deleted: integer("deleted").notNull().default(0),
  },
  (t) => [uniqueIndex("curricula_slug_idx").on(t.slug)]
);

export const curriculumItems = sqliteTable(
  "curriculum_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    curriculumId: integer("curriculum_id")
      .notNull()
      .references(() => curricula.id),
    position: integer("position").notNull(),
    moveId: integer("move_id")
      .notNull()
      .references(() => moves.id),
    notes: text("notes").notNull().default(""),
    // JSON array of video ids picked as key examples for this step
    keyVideoIds: text("key_video_ids").notNull().default("[]"),
  },
  (t) => [index("curriculum_items_curriculum_idx").on(t.curriculumId)]
);

export const curriculumRevisions = sqliteTable(
  "curriculum_revisions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    curriculumId: integer("curriculum_id")
      .notNull()
      .references(() => curricula.id),
    revisionNo: integer("revision_no").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    // JSON array of { moveId, notes, keyVideoIds }
    items: text("items").notNull().default("[]"),
    editorId: integer("editor_id")
      .notNull()
      .references(() => users.id),
    editSummary: text("edit_summary").notNull().default(""),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [index("curriculum_revisions_curriculum_idx").on(t.curriculumId)]
);

export const comments = sqliteTable(
  "comments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    moveId: integer("move_id")
      .notNull()
      .references(() => moves.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    body: text("body").notNull(),
    createdAt: integer("created_at").notNull(),
    deleted: integer("deleted").notNull().default(0),
  },
  (t) => [index("comments_move_idx").on(t.moveId)]
);

export const favorites = sqliteTable(
  "favorites",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    moveId: integer("move_id")
      .notNull()
      .references(() => moves.id),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.moveId] })]
);

export const learned = sqliteTable(
  "learned",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    curriculumId: integer("curriculum_id")
      .notNull()
      .references(() => curricula.id),
    moveId: integer("move_id")
      .notNull()
      .references(() => moves.id),
    checkedAt: integer("checked_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.curriculumId, t.moveId] })]
);

export const sponsors = sqliteTable("sponsors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  tagline: text("tagline").notNull().default(""),
  active: integer("active").notNull().default(1),
  position: integer("position").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  createdAt: integer("created_at").notNull(),
});

export type User = typeof users.$inferSelect;
export type Move = typeof moves.$inferSelect;
export type MoveRevision = typeof moveRevisions.$inferSelect;
export type Dancer = typeof dancers.$inferSelect;
export type EventRow = typeof events.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type Dance = typeof dances.$inferSelect;
export type Sponsor = typeof sponsors.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Curriculum = typeof curricula.$inferSelect;
export type CurriculumItem = typeof curriculumItems.$inferSelect;
export type Comment = typeof comments.$inferSelect;
