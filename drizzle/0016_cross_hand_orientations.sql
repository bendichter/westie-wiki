UPDATE `handholds` SET `position` = 6 WHERE `name` = 'Closed position';--> statement-breakpoint
UPDATE `handholds` SET `position` = 7 WHERE `name` = 'No hands';--> statement-breakpoint
UPDATE `handholds` SET `note` = 'Both hands connected, uncrossed.' WHERE `name` = 'Two-hand';--> statement-breakpoint
UPDATE `handholds` SET `name` = 'Left-to-left (one-hand cross)', `note` = 'Single crossed connection; a common setup for wraps.' WHERE `name` = 'Left-to-left (cross-hand)';--> statement-breakpoint
INSERT INTO `handholds` (`name`, `note`, `position`) VALUES
('Crossed two-hand (right over left)', 'Both hands crossed, with the right-to-right pair on top.', 4),
('Crossed two-hand (left over right)', 'Both hands crossed, with the left-to-left pair on top.', 5);
