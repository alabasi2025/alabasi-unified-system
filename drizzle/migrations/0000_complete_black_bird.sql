CREATE TABLE `accountCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`nameAr` varchar(100) NOT NULL,
	`nameEn` varchar(100),
	`type` enum('asset','liability','equity','revenue','expense') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accountCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `accountCategories_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `accountCurrencies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`currencyId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accountCurrencies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiConversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`message` text NOT NULL,
	`response` text NOT NULL,
	`action` varchar(100),
	`actionData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiConversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analyticalAccountTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`nameAr` varchar(100) NOT NULL,
	`nameEn` varchar(100),
	`icon` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyticalAccountTypes_id` PRIMARY KEY(`id`),
	CONSTRAINT `analyticalAccountTypes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `analyticalAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`nameAr` varchar(200) NOT NULL,
	`nameEn` varchar(200),
	`chartAccountId` int NOT NULL,
	`typeId` int NOT NULL,
	`branchId` int NOT NULL,
	`openingBalance` int NOT NULL DEFAULT 0,
	`currentBalance` int NOT NULL DEFAULT 0,
	`currencyId` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int,
	CONSTRAINT `analyticalAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `analyticalAccounts_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`nameAr` varchar(200) NOT NULL,
	`nameEn` varchar(200),
	`category` varchar(100),
	`branchId` int NOT NULL,
	`purchaseDate` timestamp NOT NULL,
	`purchasePrice` int NOT NULL,
	`currentValue` int NOT NULL,
	`currencyId` int NOT NULL,
	`depreciationRate` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`description` text,
	`serialNumber` varchar(100),
	`location` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int,
	CONSTRAINT `assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `assets_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `branches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`nameAr` varchar(200) NOT NULL,
	`nameEn` varchar(200),
	`isMain` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int,
	CONSTRAINT `branches_id` PRIMARY KEY(`id`),
	CONSTRAINT `branches_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `chartOfAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`nameAr` varchar(200) NOT NULL,
	`nameEn` varchar(200),
	`parentId` int,
	`categoryId` int,
	`level` int NOT NULL DEFAULT 1,
	`isParent` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int,
	CONSTRAINT `chartOfAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `chartOfAccounts_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
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
CREATE TABLE `currencies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(10) NOT NULL,
	`nameAr` varchar(100) NOT NULL,
	`nameEn` varchar(100) NOT NULL,
	`symbol` varchar(10) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `currencies_id` PRIMARY KEY(`id`),
	CONSTRAINT `currencies_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`nameAr` varchar(200) NOT NULL,
	`nameEn` varchar(200),
	`position` varchar(100),
	`branchId` int NOT NULL,
	`salary` int NOT NULL,
	`currencyId` int NOT NULL,
	`hireDate` timestamp NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`phone` varchar(50),
	`email` varchar(320),
	`address` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int,
	CONSTRAINT `employees_id` PRIMARY KEY(`id`),
	CONSTRAINT `employees_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`nameAr` varchar(200) NOT NULL,
	`nameEn` varchar(200),
	`category` varchar(100),
	`branchId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`unitPrice` int NOT NULL,
	`currencyId` int NOT NULL,
	`minQuantity` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int,
	CONSTRAINT `inventory_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `journalEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entryNumber` varchar(50) NOT NULL,
	`date` timestamp NOT NULL,
	`description` text NOT NULL,
	`voucherId` int,
	`branchId` int NOT NULL,
	`status` enum('draft','posted','cancelled') NOT NULL DEFAULT 'posted',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int,
	CONSTRAINT `journalEntries_id` PRIMARY KEY(`id`),
	CONSTRAINT `journalEntries_entryNumber_unique` UNIQUE(`entryNumber`)
);
--> statement-breakpoint
CREATE TABLE `journalEntryLines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entryId` int NOT NULL,
	`accountId` int NOT NULL,
	`type` enum('debit','credit') NOT NULL,
	`amount` int NOT NULL,
	`currencyId` int NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `journalEntryLines_id` PRIMARY KEY(`id`)
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
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `vouchers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`voucherNumber` varchar(50) NOT NULL,
	`type` enum('receipt','payment') NOT NULL,
	`voucherType` enum('cash','bank') NOT NULL,
	`date` timestamp NOT NULL,
	`amount` int NOT NULL,
	`currencyId` int NOT NULL,
	`fromAccountId` int,
	`toAccountId` int,
	`branchId` int NOT NULL,
	`statement` text NOT NULL,
	`referenceNumber` varchar(100),
	`attachmentUrl` text,
	`status` enum('draft','approved','cancelled') NOT NULL DEFAULT 'approved',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int,
	`approvedAt` timestamp,
	`approvedBy` int,
	CONSTRAINT `vouchers_id` PRIMARY KEY(`id`),
	CONSTRAINT `vouchers_voucherNumber_unique` UNIQUE(`voucherNumber`)
);
--> statement-breakpoint
ALTER TABLE `accountCurrencies` ADD CONSTRAINT `accountCurrencies_accountId_chartOfAccounts_id_fk` FOREIGN KEY (`accountId`) REFERENCES `chartOfAccounts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `accountCurrencies` ADD CONSTRAINT `accountCurrencies_currencyId_currencies_id_fk` FOREIGN KEY (`currencyId`) REFERENCES `currencies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aiConversations` ADD CONSTRAINT `aiConversations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analyticalAccounts` ADD CONSTRAINT `analyticalAccounts_chartAccountId_chartOfAccounts_id_fk` FOREIGN KEY (`chartAccountId`) REFERENCES `chartOfAccounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analyticalAccounts` ADD CONSTRAINT `analyticalAccounts_typeId_analyticalAccountTypes_id_fk` FOREIGN KEY (`typeId`) REFERENCES `analyticalAccountTypes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analyticalAccounts` ADD CONSTRAINT `analyticalAccounts_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analyticalAccounts` ADD CONSTRAINT `analyticalAccounts_currencyId_currencies_id_fk` FOREIGN KEY (`currencyId`) REFERENCES `currencies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analyticalAccounts` ADD CONSTRAINT `analyticalAccounts_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assets` ADD CONSTRAINT `assets_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assets` ADD CONSTRAINT `assets_currencyId_currencies_id_fk` FOREIGN KEY (`currencyId`) REFERENCES `currencies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assets` ADD CONSTRAINT `assets_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `branches` ADD CONSTRAINT `branches_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chartOfAccounts` ADD CONSTRAINT `chartOfAccounts_categoryId_accountCategories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `accountCategories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chartOfAccounts` ADD CONSTRAINT `chartOfAccounts_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clearingAccounts` ADD CONSTRAINT `clearingAccounts_accountId_analyticalAccounts_id_fk` FOREIGN KEY (`accountId`) REFERENCES `analyticalAccounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `command_history` ADD CONSTRAINT `command_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employees` ADD CONSTRAINT `employees_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employees` ADD CONSTRAINT `employees_currencyId_currencies_id_fk` FOREIGN KEY (`currencyId`) REFERENCES `currencies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employees` ADD CONSTRAINT `employees_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_currencyId_currencies_id_fk` FOREIGN KEY (`currencyId`) REFERENCES `currencies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `journalEntries` ADD CONSTRAINT `journalEntries_voucherId_vouchers_id_fk` FOREIGN KEY (`voucherId`) REFERENCES `vouchers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `journalEntries` ADD CONSTRAINT `journalEntries_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `journalEntries` ADD CONSTRAINT `journalEntries_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `journalEntryLines` ADD CONSTRAINT `journalEntryLines_entryId_journalEntries_id_fk` FOREIGN KEY (`entryId`) REFERENCES `journalEntries`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `journalEntryLines` ADD CONSTRAINT `journalEntryLines_accountId_analyticalAccounts_id_fk` FOREIGN KEY (`accountId`) REFERENCES `analyticalAccounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `journalEntryLines` ADD CONSTRAINT `journalEntryLines_currencyId_currencies_id_fk` FOREIGN KEY (`currencyId`) REFERENCES `currencies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learned_patterns` ADD CONSTRAINT `learned_patterns_accountId_chartOfAccounts_id_fk` FOREIGN KEY (`accountId`) REFERENCES `chartOfAccounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizations` ADD CONSTRAINT `organizations_unitId_units_id_fk` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizations` ADD CONSTRAINT `organizations_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `units` ADD CONSTRAINT `units_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vouchers` ADD CONSTRAINT `vouchers_currencyId_currencies_id_fk` FOREIGN KEY (`currencyId`) REFERENCES `currencies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vouchers` ADD CONSTRAINT `vouchers_fromAccountId_analyticalAccounts_id_fk` FOREIGN KEY (`fromAccountId`) REFERENCES `analyticalAccounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vouchers` ADD CONSTRAINT `vouchers_toAccountId_analyticalAccounts_id_fk` FOREIGN KEY (`toAccountId`) REFERENCES `analyticalAccounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vouchers` ADD CONSTRAINT `vouchers_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vouchers` ADD CONSTRAINT `vouchers_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vouchers` ADD CONSTRAINT `vouchers_approvedBy_users_id_fk` FOREIGN KEY (`approvedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `account_idx` ON `accountCurrencies` (`accountId`);--> statement-breakpoint
CREATE INDEX `currency_idx` ON `accountCurrencies` (`currencyId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `aiConversations` (`userId`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `aiConversations` (`createdAt`);--> statement-breakpoint
CREATE INDEX `chart_account_idx` ON `analyticalAccounts` (`chartAccountId`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `analyticalAccounts` (`typeId`);--> statement-breakpoint
CREATE INDEX `branch_idx` ON `analyticalAccounts` (`branchId`);--> statement-breakpoint
CREATE INDEX `branch_idx` ON `assets` (`branchId`);--> statement-breakpoint
CREATE INDEX `parent_idx` ON `chartOfAccounts` (`parentId`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `chartOfAccounts` (`categoryId`);--> statement-breakpoint
CREATE INDEX `accountId_idx` ON `clearingAccounts` (`accountId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `command_history` (`userId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `command_history` (`status`);--> statement-breakpoint
CREATE INDEX `branch_idx` ON `employees` (`branchId`);--> statement-breakpoint
CREATE INDEX `branch_idx` ON `inventory` (`branchId`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `journalEntries` (`date`);--> statement-breakpoint
CREATE INDEX `voucher_idx` ON `journalEntries` (`voucherId`);--> statement-breakpoint
CREATE INDEX `branch_idx` ON `journalEntries` (`branchId`);--> statement-breakpoint
CREATE INDEX `entry_idx` ON `journalEntryLines` (`entryId`);--> statement-breakpoint
CREATE INDEX `account_idx` ON `journalEntryLines` (`accountId`);--> statement-breakpoint
CREATE INDEX `keyword_idx` ON `learned_patterns` (`keyword`);--> statement-breakpoint
CREATE INDEX `accountId_idx` ON `learned_patterns` (`accountId`);--> statement-breakpoint
CREATE INDEX `unitId_idx` ON `organizations` (`unitId`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `vouchers` (`date`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `vouchers` (`type`);--> statement-breakpoint
CREATE INDEX `branch_idx` ON `vouchers` (`branchId`);--> statement-breakpoint
CREATE INDEX `from_account_idx` ON `vouchers` (`fromAccountId`);--> statement-breakpoint
CREATE INDEX `to_account_idx` ON `vouchers` (`toAccountId`);