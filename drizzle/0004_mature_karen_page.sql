CREATE TABLE `dance_dancers` (
	`dance_id` integer NOT NULL,
	`dancer_id` integer NOT NULL,
	`role` text,
	PRIMARY KEY(`dance_id`, `dancer_id`),
	FOREIGN KEY (`dance_id`) REFERENCES `dances`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`dancer_id`) REFERENCES `dancers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `dance_dancers_dancer_idx` ON `dance_dancers` (`dancer_id`);--> statement-breakpoint
CREATE TABLE `dances` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`youtube_id` text NOT NULL,
	`title` text,
	`note` text,
	`song` text,
	`artist` text,
	`event_id` integer,
	`added_by` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`added_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `dances_slug_idx` ON `dances` (`slug`);--> statement-breakpoint
CREATE INDEX `dances_event_idx` ON `dances` (`event_id`);--> statement-breakpoint
ALTER TABLE `videos` ADD `dance_id` integer REFERENCES dances(id);--> statement-breakpoint
CREATE INDEX `videos_dance_idx` ON `videos` (`dance_id`);