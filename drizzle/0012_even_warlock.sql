CREATE TABLE `page_views` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`path` text NOT NULL,
	`day` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `page_views_path_day_idx` ON `page_views` (`path`,`day`);--> statement-breakpoint
ALTER TABLE `users` ADD `blocked_at` integer;