CREATE TABLE `committees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `committees_id` PRIMARY KEY(`id`),
	CONSTRAINT `committees_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `memberCommittees` (
	`memberId` int NOT NULL,
	`committeeId` int NOT NULL,
	`startDate` date,
	`endDate` date,
	`isCurrent` boolean DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `memberRoles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`role` enum('council_member','committee_member','regular_member') NOT NULL,
	`startDate` date,
	`endDate` date,
	`isCurrent` boolean DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memberRoles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `draftRegulations` ADD `proposedAt` enum('internal','central_council','thaprajan_council','rangsit_council','lampang_council','committee') DEFAULT 'internal' NOT NULL;--> statement-breakpoint
ALTER TABLE `draftRegulations` ADD `committeeId` int;--> statement-breakpoint
ALTER TABLE `memberCommittees` ADD CONSTRAINT `memberCommittees_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `memberCommittees` ADD CONSTRAINT `memberCommittees_committeeId_committees_id_fk` FOREIGN KEY (`committeeId`) REFERENCES `committees`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `memberRoles` ADD CONSTRAINT `memberRoles_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `draftRegulations` ADD CONSTRAINT `draftRegulations_committeeId_committees_id_fk` FOREIGN KEY (`committeeId`) REFERENCES `committees`(`id`) ON DELETE no action ON UPDATE no action;