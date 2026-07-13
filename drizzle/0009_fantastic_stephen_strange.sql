CREATE TABLE `dance_songs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dance_id` integer NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`song` text DEFAULT '' NOT NULL,
	`artist` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`dance_id`) REFERENCES `dances`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `dance_songs` (`dance_id`, `position`, `song`, `artist`)
SELECT `id`, 0, COALESCE(`song`, ''), COALESCE(`artist`, '') FROM `dances`
WHERE `song` IS NOT NULL OR `artist` IS NOT NULL;
--> statement-breakpoint
CREATE INDEX `dance_songs_dance_idx` ON `dance_songs` (`dance_id`);--> statement-breakpoint
ALTER TABLE `dances` DROP COLUMN `song`;--> statement-breakpoint
ALTER TABLE `dances` DROP COLUMN `artist`;