import { eq, and, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  members,
  positions,
  departments,
  memberPositions,
  memberDepartments,
  meetings,
  meetingTypes,
  meetingAttendances,
  agendas,
  votes,
  meetingReports,
  draftRegulations,
  committees,
  memberCommittees,
  memberRoles,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// Members (สมาชิก)
// ============================================

export async function getAllMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(members).orderBy(asc(members.firstName));
}

export async function getMemberById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(members).where(eq(members.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createMember(data: typeof members.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(members).values(data);
  return result;
}

export async function updateMember(id: number, data: Partial<typeof members.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(members).set(data).where(eq(members.id, id));
}

export async function deleteMember(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(members).where(eq(members.id, id));
}

// ============================================
// Positions (ตำแหน่ง)
// ============================================

export async function getAllPositions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(positions).orderBy(asc(positions.name));
}

export async function getPositionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(positions).where(eq(positions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPosition(data: typeof positions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(positions).values(data);
}

export async function updatePosition(id: number, data: Partial<typeof positions.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(positions).set(data).where(eq(positions.id, id));
}

export async function deletePosition(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(positions).where(eq(positions.id, id));
}

// ============================================
// Departments (ฝ่าย)
// ============================================

export async function getAllDepartments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(departments).orderBy(asc(departments.name));
}

export async function getDepartmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(departments).where(eq(departments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDepartment(data: typeof departments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(departments).values(data);
}

export async function updateDepartment(id: number, data: Partial<typeof departments.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(departments).set(data).where(eq(departments.id, id));
}

export async function deleteDepartment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(departments).where(eq(departments.id, id));
}

// ============================================
// Member Positions (ตำแหน่งของสมาชิก)
// ============================================

export async function getMemberPositions(memberId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(memberPositions)
    .leftJoin(positions, eq(memberPositions.positionId, positions.id))
    .where(eq(memberPositions.memberId, memberId));
}

export async function addMemberPosition(data: typeof memberPositions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(memberPositions).values(data);
}

export async function removeMemberPosition(memberId: number, positionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .delete(memberPositions)
    .where(and(eq(memberPositions.memberId, memberId), eq(memberPositions.positionId, positionId)));
}

// ============================================
// Member Departments (ฝ่ายของสมาชิก)
// ============================================

export async function getMemberDepartments(memberId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(memberDepartments)
    .leftJoin(departments, eq(memberDepartments.departmentId, departments.id))
    .where(eq(memberDepartments.memberId, memberId));
}

export async function addMemberDepartment(data: typeof memberDepartments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(memberDepartments).values(data);
}

export async function removeMemberDepartment(memberId: number, departmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .delete(memberDepartments)
    .where(and(eq(memberDepartments.memberId, memberId), eq(memberDepartments.departmentId, departmentId)));
}

// ============================================
// Meetings (การประชุม)
// ============================================

export async function getAllMeetings() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(meetings)
    .leftJoin(meetingTypes, eq(meetings.meetingTypeId, meetingTypes.id))
    .orderBy(desc(meetings.date));
}

export async function getMeetingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(meetings)
    .leftJoin(meetingTypes, eq(meetings.meetingTypeId, meetingTypes.id))
    .where(eq(meetings.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createMeeting(data: typeof meetings.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(meetings).values(data);
}

export async function updateMeeting(id: number, data: Partial<typeof meetings.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(meetings).set(data).where(eq(meetings.id, id));
}

// ============================================
// Meeting Attendances (การเข้าร่วมประชุม)
// ============================================

export async function getAllMeetingAttendances() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(meetingAttendances)
    .leftJoin(members, eq(meetingAttendances.memberId, members.id))
    .orderBy(desc(meetingAttendances.createdAt));
}

export async function getMeetingAttendances(meetingId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(meetingAttendances)
    .leftJoin(members, eq(meetingAttendances.memberId, members.id))
    .where(eq(meetingAttendances.meetingId, meetingId));
}

export async function recordAttendance(data: typeof meetingAttendances.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(meetingAttendances).values(data);
}

export async function updateAttendance(id: number, data: Partial<typeof meetingAttendances.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(meetingAttendances).set(data).where(eq(meetingAttendances.id, id));
}

// ============================================
// Agendas (ระเบียบวาระ)
// ============================================

export async function getMeetingAgendas(meetingId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(agendas).where(eq(agendas.meetingId, meetingId));
}

export async function getAgendaById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(agendas).where(eq(agendas.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAgenda(data: typeof agendas.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(agendas).values(data);
}

export async function updateAgenda(id: number, data: Partial<typeof agendas.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(agendas).set(data).where(eq(agendas.id, id));
}

// ============================================
// Votes (การโหวต)
// ============================================

export async function getAllVotes() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(votes)
    .leftJoin(members, eq(votes.memberId, members.id))
    .leftJoin(agendas, eq(votes.agendaId, agendas.id))
    .orderBy(desc(votes.createdAt));
}

export async function getAgendaVotes(agendaId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(votes)
    .leftJoin(members, eq(votes.memberId, members.id))
    .where(eq(votes.agendaId, agendaId));
}

export async function recordVote(data: typeof votes.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(votes).values(data);
}

// ============================================
// Draft Regulations (ร่างระเบียบ/กฎหมาย)
// ============================================

export async function getAllDraftRegulations() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(draftRegulations)
    .leftJoin(members, eq(draftRegulations.proposerMemberId, members.id))
    .orderBy(desc(draftRegulations.createdAt));
}

export async function getDraftRegulationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(draftRegulations)
    .leftJoin(members, eq(draftRegulations.proposerMemberId, members.id))
    .where(eq(draftRegulations.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDraftRegulation(data: typeof draftRegulations.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(draftRegulations).values(data);
}

export async function updateDraftRegulation(id: number, data: Partial<typeof draftRegulations.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(draftRegulations).set(data).where(eq(draftRegulations.id, id));
}

export async function deleteDraftRegulation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(draftRegulations).where(eq(draftRegulations.id, id));
}


// ============================================
// Committees (กรรมาธิการ)
// ============================================

export async function getAllCommittees() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(committees).orderBy(asc(committees.name));
}

export async function getCommitteeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(committees).where(eq(committees.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCommittee(data: typeof committees.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(committees).values(data);
}

export async function updateCommittee(id: number, data: Partial<typeof committees.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(committees).set(data).where(eq(committees.id, id));
}

export async function deleteCommittee(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(committees).where(eq(committees.id, id));
}

// ============================================
// Member Committees (สมาชิกกรรมาธิการ)
// ============================================

export async function getMemberCommittees(memberId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(memberCommittees)
    .leftJoin(committees, eq(memberCommittees.committeeId, committees.id))
    .where(eq(memberCommittees.memberId, memberId));
}

export async function addMemberCommittee(data: typeof memberCommittees.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(memberCommittees).values(data);
}

export async function removeMemberCommittee(memberId: number, committeeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .delete(memberCommittees)
    .where(and(eq(memberCommittees.memberId, memberId), eq(memberCommittees.committeeId, committeeId)));
}

// ============================================
// Member Roles (บทบาทสมาชิก)
// ============================================

export async function getMemberRoles(memberId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(memberRoles).where(eq(memberRoles.memberId, memberId));
}

export async function addMemberRole(data: typeof memberRoles.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(memberRoles).values(data);
}

export async function updateMemberRole(id: number, data: Partial<typeof memberRoles.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(memberRoles).set(data).where(eq(memberRoles.id, id));
}

export async function removeMemberRole(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(memberRoles).where(eq(memberRoles.id, id));
}
