CREATE TABLE `move_variants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`move_id` integer NOT NULL,
	`name` text NOT NULL,
	`note` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`move_id`) REFERENCES `moves`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `move_variants_move_idx` ON `move_variants` (`move_id`);--> statement-breakpoint
ALTER TABLE `videos` ADD `variant_id` integer REFERENCES move_variants(id);