UPDATE `handholds` SET `position` = 2 WHERE `name` = 'Right-to-right (handshake)';--> statement-breakpoint
UPDATE `handholds` SET `position` = 3 WHERE `name` = 'Left-to-left (one-hand cross)';--> statement-breakpoint
UPDATE `handholds` SET `position` = 4 WHERE `name` = 'Two-hand';--> statement-breakpoint
UPDATE `handholds` SET `position` = 5 WHERE `name` = 'Crossed two-hand (right over left)';--> statement-breakpoint
UPDATE `handholds` SET `position` = 6 WHERE `name` = 'Crossed two-hand (left over right)';--> statement-breakpoint
UPDATE `handholds` SET `position` = 7 WHERE `name` = 'Closed position';--> statement-breakpoint
UPDATE `handholds` SET `position` = 8 WHERE `name` = 'No hands';--> statement-breakpoint
INSERT OR IGNORE INTO `handholds` (`name`, `note`, `position`) VALUES
('Leader''s right to follower''s left', 'The mirrored one-hand hold; common after hand changes and in side-by-side shapes.', 1);
