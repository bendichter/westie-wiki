CREATE TABLE `reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`video_id` integer,
	`dance_id` integer,
	`target_label` text NOT NULL,
	`reason` text NOT NULL,
	`reporter_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	`resolved_at` integer,
	`resolution` text,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`dance_id`) REFERENCES `dances`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `reports_video_idx` ON `reports` (`video_id`);--> statement-breakpoint
CREATE INDEX `reports_dance_idx` ON `reports` (`dance_id`);