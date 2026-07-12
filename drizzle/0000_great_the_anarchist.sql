CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`move_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`move_id`) REFERENCES `moves`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `comments_move_idx` ON `comments` (`move_id`);--> statement-breakpoint
CREATE TABLE `curricula` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`created_by` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `curricula_slug_idx` ON `curricula` (`slug`);--> statement-breakpoint
CREATE TABLE `curriculum_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`curriculum_id` integer NOT NULL,
	`position` integer NOT NULL,
	`move_id` integer NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`key_video_ids` text DEFAULT '[]' NOT NULL,
	FOREIGN KEY (`curriculum_id`) REFERENCES `curricula`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`move_id`) REFERENCES `moves`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `curriculum_items_curriculum_idx` ON `curriculum_items` (`curriculum_id`);--> statement-breakpoint
CREATE TABLE `curriculum_revisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`curriculum_id` integer NOT NULL,
	`revision_no` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`items` text DEFAULT '[]' NOT NULL,
	`editor_id` integer NOT NULL,
	`edit_summary` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`curriculum_id`) REFERENCES `curricula`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`editor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `curriculum_revisions_curriculum_idx` ON `curriculum_revisions` (`curriculum_id`);--> statement-breakpoint
CREATE TABLE `dancers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `dancers_slug_idx` ON `dancers` (`slug`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`year` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_slug_idx` ON `events` (`slug`);--> statement-breakpoint
CREATE TABLE `favorites` (
	`user_id` integer NOT NULL,
	`move_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `move_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`move_id`) REFERENCES `moves`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `learned` (
	`user_id` integer NOT NULL,
	`curriculum_id` integer NOT NULL,
	`move_id` integer NOT NULL,
	`checked_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `curriculum_id`, `move_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`curriculum_id`) REFERENCES `curricula`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`move_id`) REFERENCES `moves`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `move_aliases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`move_id` integer NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`move_id`) REFERENCES `moves`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `move_aliases_move_idx` ON `move_aliases` (`move_id`);--> statement-breakpoint
CREATE TABLE `move_relations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from_move_id` integer NOT NULL,
	`to_move_id` integer NOT NULL,
	`kind` text NOT NULL,
	FOREIGN KEY (`from_move_id`) REFERENCES `moves`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_move_id`) REFERENCES `moves`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `move_relations_unique_idx` ON `move_relations` (`from_move_id`,`to_move_id`,`kind`);--> statement-breakpoint
CREATE INDEX `move_relations_to_idx` ON `move_relations` (`to_move_id`);--> statement-breakpoint
CREATE TABLE `move_revisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`move_id` integer NOT NULL,
	`revision_no` integer NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`aliases` text DEFAULT '[]' NOT NULL,
	`difficulty` text,
	`editor_id` integer NOT NULL,
	`edit_summary` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`move_id`) REFERENCES `moves`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`editor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `move_revisions_move_idx` ON `move_revisions` (`move_id`);--> statement-breakpoint
CREATE TABLE `move_tags` (
	`move_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	PRIMARY KEY(`move_id`, `tag_id`),
	FOREIGN KEY (`move_id`) REFERENCES `moves`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `move_tags_tag_idx` ON `move_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `moves` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`difficulty` text,
	`created_by` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `moves_slug_idx` ON `moves` (`slug`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_idx` ON `tags` (`slug`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_idx` ON `users` (`username`);--> statement-breakpoint
CREATE TABLE `video_dancers` (
	`video_id` integer NOT NULL,
	`dancer_id` integer NOT NULL,
	`role` text,
	PRIMARY KEY(`video_id`, `dancer_id`),
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`dancer_id`) REFERENCES `dancers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `video_dancers_dancer_idx` ON `video_dancers` (`dancer_id`);--> statement-breakpoint
CREATE TABLE `videos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`move_id` integer NOT NULL,
	`youtube_id` text NOT NULL,
	`start_sec` integer DEFAULT 0 NOT NULL,
	`end_sec` integer,
	`title` text,
	`note` text,
	`event_id` integer,
	`added_by` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`move_id`) REFERENCES `moves`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`added_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `videos_move_idx` ON `videos` (`move_id`);--> statement-breakpoint
CREATE INDEX `videos_event_idx` ON `videos` (`event_id`);