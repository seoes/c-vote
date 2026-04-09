PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_members` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`password_hash` text,
	`church` text NOT NULL,
	`region` text NOT NULL,
	`sigchal` text NOT NULL,
	`position` text,
	`security_answer` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`is_admin` integer DEFAULT false NOT NULL,
	`can_vote` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_members`("id", "name", "phone", "password_hash", "church", "region", "sigchal", "position", "security_answer", "status", "is_admin", "can_vote", "created_at") SELECT "id", "name", "phone", "password_hash", "church", "region", "sigchal", "position", "security_answer", "status", "is_admin", "can_vote", "created_at" FROM `members`;--> statement-breakpoint
DROP TABLE `members`;--> statement-breakpoint
ALTER TABLE `__new_members` RENAME TO `members`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `members_phone_idx` ON `members` (`phone`);--> statement-breakpoint
CREATE INDEX `members_status_idx` ON `members` (`status`);