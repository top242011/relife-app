import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, boolean, date, time, foreignKey, uniqueIndex } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * สมาชิกพรรคนักศึกษา
 */
export const members = mysqlTable("members", {
  id: int("id").primaryKey().autoincrement(),
  firstName: varchar("firstName", { length: 255 }).notNull(),
  lastName: varchar("lastName", { length: 255 }).notNull(),
  studentId: varchar("studentId", { length: 50 }).unique(),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 20 }),
  educationCenter: varchar("educationCenter", { length: 255 }),
  isOpenData: boolean("isOpenData").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Member = typeof members.$inferSelect;
export type InsertMember = typeof members.$inferInsert;

/**
 * ตำแหน่งในพรรค
 */
export const positions = mysqlTable("positions", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Position = typeof positions.$inferSelect;
export type InsertPosition = typeof positions.$inferInsert;

/**
 * ฝ่ายต่างๆ ในพรรค
 */
export const departments = mysqlTable("departments", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;

/**
 * ความสัมพันธ์ระหว่างสมาชิกกับตำแหน่ง (รองรับหลายตำแหน่ง)
 */
export const memberPositions = mysqlTable(
  "memberPositions",
  {
    memberId: int("memberId").notNull(),
    positionId: int("positionId").notNull(),
    startDate: date("startDate"),
    endDate: date("endDate"),
    isCurrent: boolean("isCurrent").default(true),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
  },
  (table) => ([
    foreignKey({
      columns: [table.memberId],
      foreignColumns: [members.id],
    }),
    foreignKey({
      columns: [table.positionId],
      foreignColumns: [positions.id],
    }),
  ])
);

export type MemberPosition = typeof memberPositions.$inferSelect;
export type InsertMemberPosition = typeof memberPositions.$inferInsert;

/**
 * ความสัมพันธ์ระหว่างสมาชิกกับฝ่าย (รองรับหลายฝ่าย)
 */
export const memberDepartments = mysqlTable(
  "memberDepartments",
  {
    memberId: int("memberId").notNull(),
    departmentId: int("departmentId").notNull(),
    startDate: date("startDate"),
    endDate: date("endDate"),
    isCurrent: boolean("isCurrent").default(true),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
  },
  (table) => ([
    foreignKey({
      columns: [table.memberId],
      foreignColumns: [members.id],
    }),
    foreignKey({
      columns: [table.departmentId],
      foreignColumns: [departments.id],
    }),
  ])
);

export type MemberDepartment = typeof memberDepartments.$inferSelect;
export type InsertMemberDepartment = typeof memberDepartments.$inferInsert;

/**
 * ประเภทการประชุม
 */
export const meetingTypes = mysqlTable("meetingTypes", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type MeetingType = typeof meetingTypes.$inferSelect;
export type InsertMeetingType = typeof meetingTypes.$inferInsert;

/**
 * การประชุม
 */
export const meetings = mysqlTable(
  "meetings",
  {
    id: int("id").primaryKey().autoincrement(),
    meetingTypeId: int("meetingTypeId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    date: date("date").notNull(),
    time: time("time"),
    location: varchar("location", { length: 255 }),
    description: text("description"),
    isOpenData: boolean("isOpenData").default(false),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
  },
  (table) => ([
    foreignKey({
      columns: [table.meetingTypeId],
      foreignColumns: [meetingTypes.id],
    }),
  ])
);

export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = typeof meetings.$inferInsert;

/**
 * การเข้าร่วมประชุม
 */
export const meetingAttendances = mysqlTable(
  "meetingAttendances",
  {
    id: int("id").primaryKey().autoincrement(),
    meetingId: int("meetingId").notNull(),
    memberId: int("memberId").notNull(),
    status: mysqlEnum("status", ["present", "absent", "late", "excused"]).notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
  },
  (table) => ([
    foreignKey({
      columns: [table.meetingId],
      foreignColumns: [meetings.id],
    }),
    foreignKey({
      columns: [table.memberId],
      foreignColumns: [members.id],
    }),
    uniqueIndex("unique_meeting_member").on(table.meetingId, table.memberId),
  ])
);

export type MeetingAttendance = typeof meetingAttendances.$inferSelect;
export type InsertMeetingAttendance = typeof meetingAttendances.$inferInsert;

/**
 * ระเบียบวาระการประชุมสภา/กรรมาธิการ
 */
export const agendas = mysqlTable(
  "agendas",
  {
    id: int("id").primaryKey().autoincrement(),
    meetingId: int("meetingId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    proposerMemberId: int("proposerMemberId"),
    chairMemberId: int("chairMemberId"),
    principleReason: text("principleReason"),
    status: mysqlEnum("status", ["proposed", "considering", "passed", "failed"]).notNull().default("proposed"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
  },
  (table) => ([
    foreignKey({
      columns: [table.meetingId],
      foreignColumns: [meetings.id],
    }),
    foreignKey({
      columns: [table.proposerMemberId],
      foreignColumns: [members.id],
    }),
    foreignKey({
      columns: [table.chairMemberId],
      foreignColumns: [members.id],
    }),
  ])
);

export type Agenda = typeof agendas.$inferSelect;
export type InsertAgenda = typeof agendas.$inferInsert;

/**
 * เอกสารประกอบระเบียบวาระ
 */
export const agendaAttachments = mysqlTable(
  "agendaAttachments",
  {
    id: int("id").primaryKey().autoincrement(),
    agendaId: int("agendaId").notNull(),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    filePath: varchar("filePath", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
  },
  (table) => ([
    foreignKey({
      columns: [table.agendaId],
      foreignColumns: [agendas.id],
    }),
  ])
);

export type AgendaAttachment = typeof agendaAttachments.$inferSelect;
export type InsertAgendaAttachment = typeof agendaAttachments.$inferInsert;

/**
 * การโหวต
 */
export const votes = mysqlTable(
  "votes",
  {
    id: int("id").primaryKey().autoincrement(),
    agendaId: int("agendaId").notNull(),
    memberId: int("memberId").notNull(),
    voteChoice: mysqlEnum("voteChoice", ["agree", "disagree", "abstain", "not_voted"]).notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
  },
  (table) => ([
    foreignKey({
      columns: [table.agendaId],
      foreignColumns: [agendas.id],
    }),
    foreignKey({
      columns: [table.memberId],
      foreignColumns: [members.id],
    }),
    uniqueIndex("unique_agenda_member_vote").on(table.agendaId, table.memberId),
  ])
);

export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;

/**
 * รายงานการประชุม
 */
export const meetingReports = mysqlTable(
  "meetingReports",
  {
    id: int("id").primaryKey().autoincrement(),
    meetingId: int("meetingId").notNull(),
    reportContent: text("reportContent").notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    isPublic: boolean("isPublic").default(false),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
  },
  (table) => ([
    foreignKey({
      columns: [table.meetingId],
      foreignColumns: [meetings.id],
    }),
  ])
);

export type MeetingReport = typeof meetingReports.$inferSelect;
export type InsertMeetingReport = typeof meetingReports.$inferInsert;

/**
 * กรรมาธิการ
 */
export const committees = mysqlTable("committees", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Committee = typeof committees.$inferSelect;
export type InsertCommittee = typeof committees.$inferInsert;

/**
 * ความสัมพันธ์ระหว่างสมาชิกกับกรรมาธิการ
 */
export const memberCommittees = mysqlTable(
  "memberCommittees",
  {
    memberId: int("memberId").notNull(),
    committeeId: int("committeeId").notNull(),
    startDate: date("startDate"),
    endDate: date("endDate"),
    isCurrent: boolean("isCurrent").default(true),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
  },
  (table) => ([
    foreignKey({
      columns: [table.memberId],
      foreignColumns: [members.id],
    }),
    foreignKey({
      columns: [table.committeeId],
      foreignColumns: [committees.id],
    }),
  ])
);

export type MemberCommittee = typeof memberCommittees.$inferSelect;
export type InsertMemberCommittee = typeof memberCommittees.$inferInsert;

/**
 * บทบาทสมาชิก (สมาชิกสภา, กรรมการ, สมาชิกทั่วไป)
 */
export const memberRoles = mysqlTable(
  "memberRoles",
  {
    id: int("id").primaryKey().autoincrement(),
    memberId: int("memberId").notNull(),
    role: mysqlEnum("role", ["council_member", "committee_member", "regular_member"]).notNull(),
    startDate: date("startDate"),
    endDate: date("endDate"),
    isCurrent: boolean("isCurrent").default(true),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
  },
  (table) => ([
    foreignKey({
      columns: [table.memberId],
      foreignColumns: [members.id],
    }),
  ])
);

export type MemberRole = typeof memberRoles.$inferSelect;
export type InsertMemberRole = typeof memberRoles.$inferInsert;

/**
 * ร่างระเบียบ/ญัตติที่เสนอ
 */
export const draftRegulations = mysqlTable(
  "draftRegulations",
  {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 255 }).notNull(),
    proposerMemberId: int("proposerMemberId").notNull(),
    content: text("content").notNull(),
    proposedAt: mysqlEnum("proposedAt", [
      "internal",
      "central_council",
      "thaprajan_council",
      "rangsit_council",
      "lampang_council",
      "committee"
    ]).notNull().default("internal"),
    committeeId: int("committeeId"),
    status: mysqlEnum("status", ["proposed", "considering", "passed", "failed"]).notNull().default("proposed"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
  },
  (table) => ([
    foreignKey({
      columns: [table.proposerMemberId],
      foreignColumns: [members.id],
    }),
    foreignKey({
      columns: [table.committeeId],
      foreignColumns: [committees.id],
    }),
  ])
);

export type DraftRegulation = typeof draftRegulations.$inferSelect;
export type InsertDraftRegulation = typeof draftRegulations.$inferInsert;

/**
 * เอกสารประกอบร่างระเบียบ/กฎหมาย
 */
export const draftRegulationAttachments = mysqlTable(
  "draftRegulationAttachments",
  {
    id: int("id").primaryKey().autoincrement(),
    draftId: int("draftId").notNull(),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    filePath: varchar("filePath", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
  },
  (table) => ([
    foreignKey({
      columns: [table.draftId],
      foreignColumns: [draftRegulations.id],
    }),
  ])
);

export type DraftRegulationAttachment = typeof draftRegulationAttachments.$inferSelect;
export type InsertDraftRegulationAttachment = typeof draftRegulationAttachments.$inferInsert;
