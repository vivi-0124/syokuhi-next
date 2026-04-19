CREATE TABLE `consumption` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`inventory_id` text NOT NULL,
	`quantity` real NOT NULL,
	`date` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`note` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inventory_id`) REFERENCES `inventory`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `consumption_userId_idx` ON `consumption` (`user_id`);--> statement-breakpoint
CREATE INDEX `consumption_inventoryId_idx` ON `consumption` (`inventory_id`);--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`total_quantity` real NOT NULL,
	`remaining_quantity` real NOT NULL,
	`unit` text NOT NULL,
	`purchase_price` integer NOT NULL,
	`purchase_date` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`expiry_date` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `inventory_userId_idx` ON `inventory` (`user_id`);