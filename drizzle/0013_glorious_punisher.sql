CREATE TABLE `move_resources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`move_id` integer NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`added_by` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`move_id`) REFERENCES `moves`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`added_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `move_resources_move_idx` ON `move_resources` (`move_id`);