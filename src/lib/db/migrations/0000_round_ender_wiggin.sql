CREATE TABLE `candidates` (
	`id` text PRIMARY KEY NOT NULL,
	`vote_id` text NOT NULL,
	`member_id` text,
	`name` text NOT NULL,
	`church` text,
	`order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`vote_id`) REFERENCES `votes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `candidates_vote_idx` ON `candidates` (`vote_id`);--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`password_hash` text NOT NULL,
	`church` text NOT NULL,
	`sigchal` text NOT NULL,
	`position` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`is_admin` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `members_phone_idx` ON `members` (`phone`);--> statement-breakpoint
CREATE INDEX `members_status_idx` ON `members` (`status`);--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `refresh_tokens_token_idx` ON `refresh_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `refresh_tokens_member_idx` ON `refresh_tokens` (`member_id`);--> statement-breakpoint
CREATE TABLE `vote_records` (
	`id` text PRIMARY KEY NOT NULL,
	`vote_id` text NOT NULL,
	`member_id` text NOT NULL,
	`voted_at` integer NOT NULL,
	FOREIGN KEY (`vote_id`) REFERENCES `votes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `vote_records_vote_idx` ON `vote_records` (`vote_id`);--> statement-breakpoint
CREATE INDEX `vote_records_member_idx` ON `vote_records` (`member_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `vote_records_vote_member_idx` ON `vote_records` (`vote_id`,`member_id`);--> statement-breakpoint
CREATE TABLE `vote_selections` (
	`id` text PRIMARY KEY NOT NULL,
	`record_id` text NOT NULL,
	`candidate_id` text NOT NULL,
	FOREIGN KEY (`record_id`) REFERENCES `vote_records`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `vote_selections_record_idx` ON `vote_selections` (`record_id`);--> statement-breakpoint
CREATE INDEX `vote_selections_candidate_idx` ON `vote_selections` (`candidate_id`);--> statement-breakpoint
CREATE TABLE `votes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`vote_type` text NOT NULL,
	`max_selections` integer DEFAULT 1 NOT NULL,
	`pin` text NOT NULL,
	`end_time` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `votes_status_idx` ON `votes` (`status`);--> statement-breakpoint
CREATE INDEX `votes_type_idx` ON `votes` (`vote_type`);