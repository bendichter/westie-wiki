CREATE TABLE `handholds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`note` text,
	`position` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `handholds_name_idx` ON `handholds` (`name`);--> statement-breakpoint
ALTER TABLE `moves` ADD `default_handhold_id` integer REFERENCES handholds(id);--> statement-breakpoint
ALTER TABLE `videos` ADD `handhold_id` integer REFERENCES handholds(id);--> statement-breakpoint
INSERT INTO `handholds` (`name`, `note`, `position`) VALUES
('Leader''s left to follower''s right', 'The standard one-hand open hold.', 0),
('Right-to-right (handshake)', 'Sets up tucks and behind-the-back hand changes.', 1),
('Left-to-left (cross-hand)', 'Crossed connection; a common setup for wraps.', 2),
('Two-hand', 'Both hands connected.', 3),
('Closed position', 'Body-contact frame, as in the middle of a whip.', 4),
('No hands', 'Body lead or free styling.', 5);
--> statement-breakpoint
UPDATE `videos` SET `variant_id` = NULL WHERE `variant_id` IN (
  SELECT `id` FROM `move_variants` WHERE `move_id` = (SELECT `id` FROM `moves` WHERE `slug` = 'sugar-push')
  AND `name` IN ('Two-hand','Right-to-left (one-hand)','Right-to-right (handshake)','Left-to-left','No-hands (body lead)')
);
--> statement-breakpoint
DELETE FROM `move_variants` WHERE `move_id` = (SELECT `id` FROM `moves` WHERE `slug` = 'sugar-push')
  AND `name` IN ('Two-hand','Right-to-left (one-hand)','Right-to-right (handshake)','Left-to-left','No-hands (body lead)');
--> statement-breakpoint
UPDATE `moves` SET `default_handhold_id` = (SELECT `id` FROM `handholds` WHERE `name` = 'Two-hand')
  WHERE `slug` = 'sugar-push';
