CREATE TABLE `files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_id` integer NOT NULL,
	`file_name` text NOT NULL,
	`original_name` text NOT NULL,
	`file_type` text NOT NULL,
	`mime_type` text NOT NULL,
	`file_size` integer NOT NULL,
	`url` text NOT NULL,
	`storage_path` text NOT NULL,
	`thumbnail_url` text,
	`thumbnail_path` text,
	`related_type` text,
	`related_id` text,
	`metadata` text,
	`uploaded_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `industry_skill_votes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`skill_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`vote_type` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`skill_id`) REFERENCES `industry_skills`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `industry_skills` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`posted_by` integer NOT NULL,
	`skill_name` text NOT NULL,
	`category` text NOT NULL,
	`industry` text NOT NULL,
	`demand_level` text NOT NULL,
	`description` text,
	`related_skills` text,
	`average_salary_impact` text,
	`learning_resources` text,
	`upvotes` integer DEFAULT 0,
	`downvotes` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`posted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `message_reactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`message_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`emoji` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ml_models` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`model_name` text NOT NULL,
	`model_type` text NOT NULL,
	`version` text NOT NULL,
	`algorithm` text NOT NULL,
	`file_path` text NOT NULL,
	`parameters` text,
	`metrics` text,
	`training_data_count` integer,
	`features` text,
	`status` text DEFAULT 'active' NOT NULL,
	`trained_by` integer,
	`trained_at` text NOT NULL,
	`last_used_at` text,
	`description` text,
	FOREIGN KEY (`trained_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `project_submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team_id` integer NOT NULL,
	`submitted_by` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`repository_url` text,
	`demo_url` text,
	`document_url` text,
	`technologies` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`reviewed_by` integer,
	`reviewed_at` text,
	`review_comments` text,
	`grade` text,
	`submitted_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`submitted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `referral_usage` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`referral_id` integer NOT NULL,
	`student_id` integer NOT NULL,
	`job_id` integer,
	`application_id` integer,
	`used_at` text NOT NULL,
	FOREIGN KEY (`referral_id`) REFERENCES `referrals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`alumni_id` integer NOT NULL,
	`code` text NOT NULL,
	`company` text NOT NULL,
	`position` text NOT NULL,
	`description` text,
	`max_uses` integer DEFAULT 10,
	`used_count` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`expires_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`alumni_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `referrals_code_unique` ON `referrals` (`code`);--> statement-breakpoint
CREATE TABLE `skill_endorsements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`skill_id` integer NOT NULL,
	`endorsed_by` integer NOT NULL,
	`endorsed_at` text NOT NULL,
	FOREIGN KEY (`skill_id`) REFERENCES `user_skills`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`endorsed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `task_attachments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_id` integer NOT NULL,
	`file_id` integer NOT NULL,
	`uploaded_by` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_skills` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`skill_name` text NOT NULL,
	`proficiency_level` text,
	`years_of_experience` integer,
	`endorsements` integer DEFAULT 0,
	`added_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_donations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`campaign_id` integer,
	`donor_id` integer NOT NULL,
	`amount` integer NOT NULL,
	`message` text,
	`is_anonymous` integer DEFAULT false,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`transaction_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`donor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_donations`("id", "campaign_id", "donor_id", "amount", "message", "is_anonymous", "payment_status", "transaction_id", "created_at") SELECT "id", "campaign_id", "donor_id", "amount", "message", "is_anonymous", "payment_status", "transaction_id", "created_at" FROM `donations`;--> statement-breakpoint
DROP TABLE `donations`;--> statement-breakpoint
ALTER TABLE `__new_donations` RENAME TO `donations`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `chat_members` ADD `is_typing` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `messages` ADD `media_url` text;--> statement-breakpoint
ALTER TABLE `messages` ADD `image_url` text;--> statement-breakpoint
ALTER TABLE `messages` ADD `is_read` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `messages` ADD `read_at` text;--> statement-breakpoint
ALTER TABLE `payments` ADD `gateway_response` text;--> statement-breakpoint
ALTER TABLE `payments` ADD `receipt_url` text;--> statement-breakpoint
ALTER TABLE `payments` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `image_urls` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `tags` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `shares_count` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `cover_image_url` text;--> statement-breakpoint
ALTER TABLE `users` ADD `online_status` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `last_seen` text;