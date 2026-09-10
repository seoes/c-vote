ALTER TABLE `vote_records` ADD `is_abstain` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `votes` DROP COLUMN `pin`;