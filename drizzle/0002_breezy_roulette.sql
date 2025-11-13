CREATE TABLE `clearingAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`clearingType` enum('inter_branch','inter_organization','inter_unit') NOT NULL,
	`entity1Type` enum('branch','organization','unit') NOT NULL,
	`entity1Id` int NOT NULL,
	`entity2Type` enum('branch','organization','unit') NOT NULL,
	`entity2Id` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clearingAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `entities_unique` UNIQUE(`clearingType`,`entity1Type`,`entity1Id`,`entity2Type`,`entity2Id`)
);
--> statement-breakpoint
CREATE TABLE `command_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`command` text NOT NULL,
	`commandType` enum('create_unit','create_organization','create_branch','create_chart','create_analytical_account','create_journal_entry','create_payment_voucher','create_receipt_voucher','query_data','generate_report','other') NOT NULL,
	`status` enum('success','failed','pending') NOT NULL DEFAULT 'pending',
	`result` text,
	`errorMessage` text,
	`executionTime` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `command_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learned_patterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyword` varchar(255) NOT NULL,
	`accountId` int NOT NULL,
	`frequency` int NOT NULL DEFAULT 1,
	`weight` int NOT NULL DEFAULT 100,
	`lastUsed` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learned_patterns_id` PRIMARY KEY(`id`),
	CONSTRAINT `keyword_account_unique` UNIQUE(`keyword`,`accountId`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unitId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(50) NOT NULL,
	`taxNumber` varchar(50),
	`address` text,
	`phone` varchar(50),
	`email` varchar(320),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `code_unit_unique` UNIQUE(`code`,`unitId`)
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(50) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int,
	CONSTRAINT `units_id` PRIMARY KEY(`id`),
	CONSTRAINT `units_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `clearingAccounts` ADD CONSTRAINT `clearingAccounts_accountId_analyticalAccounts_id_fk` FOREIGN KEY (`accountId`) REFERENCES `analyticalAccounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `command_history` ADD CONSTRAINT `command_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learned_patterns` ADD CONSTRAINT `learned_patterns_accountId_chartOfAccounts_id_fk` FOREIGN KEY (`accountId`) REFERENCES `chartOfAccounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizations` ADD CONSTRAINT `organizations_unitId_units_id_fk` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizations` ADD CONSTRAINT `organizations_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `units` ADD CONSTRAINT `units_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `accountId_idx` ON `clearingAccounts` (`accountId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `command_history` (`userId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `command_history` (`status`);--> statement-breakpoint
CREATE INDEX `keyword_idx` ON `learned_patterns` (`keyword`);--> statement-breakpoint
CREATE INDEX `accountId_idx` ON `learned_patterns` (`accountId`);--> statement-breakpoint
CREATE INDEX `unitId_idx` ON `organizations` (`unitId`);