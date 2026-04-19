CREATE TABLE `cooking_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`dish_name` text NOT NULL,
	`yield_quantity` real NOT NULL,
	`unit` text NOT NULL,
	`total_cost` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `cookingLog_userId_idx` ON `cooking_log` (`user_id`);--> statement-breakpoint
ALTER TABLE `consumption` ADD `cooking_log_id` text REFERENCES cooking_log(id);--> statement-breakpoint
CREATE INDEX `consumption_cookingLogId_idx` ON `consumption` (`cooking_log_id`);