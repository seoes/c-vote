CREATE TABLE `candidate_preset_members` (
	`preset_id` text NOT NULL,
	`member_id` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`preset_id`) REFERENCES `candidate_presets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `candidate_preset_members_preset_member_idx` ON `candidate_preset_members` (`preset_id`,`member_id`);--> statement-breakpoint
CREATE INDEX `candidate_preset_members_preset_idx` ON `candidate_preset_members` (`preset_id`);--> statement-breakpoint
CREATE TABLE `candidate_presets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
