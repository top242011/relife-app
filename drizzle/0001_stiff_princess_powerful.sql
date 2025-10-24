CREATE TABLE `agendaAttachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agendaId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`filePath` varchar(255) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `agendaAttachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agendas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`meetingId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`proposerMemberId` int,
	`chairMemberId` int,
	`principleReason` text,
	`status` enum('proposed','considering','passed','failed') NOT NULL DEFAULT 'proposed',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agendas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `departments_id` PRIMARY KEY(`id`),
	CONSTRAINT `departments_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `draftRegulationAttachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`draftId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`filePath` varchar(255) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `draftRegulationAttachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `draftRegulations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`proposerMemberId` int NOT NULL,
	`content` text NOT NULL,
	`status` enum('proposed','considering','passed','failed') NOT NULL DEFAULT 'proposed',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `draftRegulations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meetingAttendances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`meetingId` int NOT NULL,
	`memberId` int NOT NULL,
	`status` enum('present','absent','late','excused') NOT NULL,
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meetingAttendances_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_meeting_member` UNIQUE(`meetingId`,`memberId`)
);
--> statement-breakpoint
CREATE TABLE `meetingReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`meetingId` int NOT NULL,
	`reportContent` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`isPublic` boolean DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meetingReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meetingTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meetingTypes_id` PRIMARY KEY(`id`),
	CONSTRAINT `meetingTypes_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `meetings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`meetingTypeId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`date` date NOT NULL,
	`time` time,
	`location` varchar(255),
	`description` text,
	`isOpenData` boolean DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meetings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memberDepartments` (
	`memberId` int NOT NULL,
	`departmentId` int NOT NULL,
	`startDate` date,
	`endDate` date,
	`isCurrent` boolean DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `memberPositions` (
	`memberId` int NOT NULL,
	`positionId` int NOT NULL,
	`startDate` date,
	`endDate` date,
	`isCurrent` boolean DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(255) NOT NULL,
	`lastName` varchar(255) NOT NULL,
	`studentId` varchar(50),
	`email` varchar(255),
	`phone` varchar(20),
	`educationCenter` varchar(255),
	`isOpenData` boolean DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `members_id` PRIMARY KEY(`id`),
	CONSTRAINT `members_studentId_unique` UNIQUE(`studentId`),
	CONSTRAINT `members_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `positions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `positions_id` PRIMARY KEY(`id`),
	CONSTRAINT `positions_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agendaId` int NOT NULL,
	`memberId` int NOT NULL,
	`voteChoice` enum('agree','disagree','abstain','not_voted') NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `votes_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_agenda_member_vote` UNIQUE(`agendaId`,`memberId`)
);
--> statement-breakpoint
ALTER TABLE `agendaAttachments` ADD CONSTRAINT `agendaAttachments_agendaId_agendas_id_fk` FOREIGN KEY (`agendaId`) REFERENCES `agendas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agendas` ADD CONSTRAINT `agendas_meetingId_meetings_id_fk` FOREIGN KEY (`meetingId`) REFERENCES `meetings`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agendas` ADD CONSTRAINT `agendas_proposerMemberId_members_id_fk` FOREIGN KEY (`proposerMemberId`) REFERENCES `members`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agendas` ADD CONSTRAINT `agendas_chairMemberId_members_id_fk` FOREIGN KEY (`chairMemberId`) REFERENCES `members`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `draftRegulationAttachments` ADD CONSTRAINT `draftRegulationAttachments_draftId_draftRegulations_id_fk` FOREIGN KEY (`draftId`) REFERENCES `draftRegulations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `draftRegulations` ADD CONSTRAINT `draftRegulations_proposerMemberId_members_id_fk` FOREIGN KEY (`proposerMemberId`) REFERENCES `members`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meetingAttendances` ADD CONSTRAINT `meetingAttendances_meetingId_meetings_id_fk` FOREIGN KEY (`meetingId`) REFERENCES `meetings`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meetingAttendances` ADD CONSTRAINT `meetingAttendances_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meetingReports` ADD CONSTRAINT `meetingReports_meetingId_meetings_id_fk` FOREIGN KEY (`meetingId`) REFERENCES `meetings`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meetings` ADD CONSTRAINT `meetings_meetingTypeId_meetingTypes_id_fk` FOREIGN KEY (`meetingTypeId`) REFERENCES `meetingTypes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `memberDepartments` ADD CONSTRAINT `memberDepartments_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `memberDepartments` ADD CONSTRAINT `memberDepartments_departmentId_departments_id_fk` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `memberPositions` ADD CONSTRAINT `memberPositions_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `memberPositions` ADD CONSTRAINT `memberPositions_positionId_positions_id_fk` FOREIGN KEY (`positionId`) REFERENCES `positions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `votes` ADD CONSTRAINT `votes_agendaId_agendas_id_fk` FOREIGN KEY (`agendaId`) REFERENCES `agendas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `votes` ADD CONSTRAINT `votes_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE no action ON UPDATE no action;