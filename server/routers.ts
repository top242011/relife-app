import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { authRouter } from "./routers/auth";

export const appRouter = router({
  system: systemRouter,

  auth: authRouter,

  // ============================================
  // Members (สมาชิก)
  // ============================================
  members: router({
    list: publicProcedure.query(() => db.getAllMembers()),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getMemberById(input.id)),
    
    create: protectedProcedure
      .input(z.object({
        firstName: z.string(),
        lastName: z.string(),
        studentId: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional(),
        educationCenter: z.string().optional(),
        isOpenData: z.boolean().default(false),
      }))
      .mutation(({ input }) => db.createMember(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        studentId: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional(),
        educationCenter: z.string().optional(),
        isOpenData: z.boolean().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateMember(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteMember(input.id)),
  }),

  // ============================================
  // Positions (ตำแหน่ง)
  // ============================================
  positions: router({
    list: publicProcedure.query(() => db.getAllPositions()),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getPositionById(input.id)),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
      }))
      .mutation(({ input }) => db.createPosition(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updatePosition(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deletePosition(input.id)),
  }),

  // ============================================
  // Departments (ฝ่าย)
  // ============================================
  departments: router({
    list: publicProcedure.query(() => db.getAllDepartments()),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getDepartmentById(input.id)),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
      }))
      .mutation(({ input }) => db.createDepartment(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateDepartment(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteDepartment(input.id)),
  }),

  // ============================================
  // Member Positions (ตำแหน่งของสมาชิก)
  // ============================================
  memberPositions: router({
    getByMemberId: publicProcedure
      .input(z.object({ memberId: z.number() }))
      .query(({ input }) => db.getMemberPositions(input.memberId)),
    
    add: protectedProcedure
      .input(z.object({
        memberId: z.number(),
        positionId: z.number(),
        startDate: z.string().optional().transform(str => str ? new Date(str).toISOString().split('T')[0] : undefined),
        endDate: z.string().optional().transform(str => str ? new Date(str).toISOString().split('T')[0] : undefined),
        isCurrent: z.boolean().default(true),
      }))
      .mutation(({ input }) => {
        const { ...data } = input;
        return db.addMemberPosition(data as any);
      }),
    
    remove: protectedProcedure
      .input(z.object({
        memberId: z.number(),
        positionId: z.number(),
      }))
      .mutation(({ input }) => db.removeMemberPosition(input.memberId, input.positionId)),
  }),

  // ============================================
  // Member Departments (ฝ่ายของสมาชิก)
  // ============================================
  memberDepartments: router({
    getByMemberId: publicProcedure
      .input(z.object({ memberId: z.number() }))
      .query(({ input }) => db.getMemberDepartments(input.memberId)),
    
    add: protectedProcedure
      .input(z.object({
        memberId: z.number(),
        departmentId: z.number(),
        startDate: z.string().optional().transform(str => str ? new Date(str).toISOString().split('T')[0] : undefined),
        endDate: z.string().optional().transform(str => str ? new Date(str).toISOString().split('T')[0] : undefined),
        isCurrent: z.boolean().default(true),
      }))
      .mutation(({ input }) => {
        const { ...data } = input;
        return db.addMemberDepartment(data as any);
      }),
    
    remove: protectedProcedure
      .input(z.object({
        memberId: z.number(),
        departmentId: z.number(),
      }))
      .mutation(({ input }) => db.removeMemberDepartment(input.memberId, input.departmentId)),
  }),

  // ============================================
  // Meetings (การประชุม)
  // ============================================
  meetings: router({
    list: publicProcedure.query(() => db.getAllMeetings()),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getMeetingById(input.id)),
    
    create: protectedProcedure
      .input(z.object({
        meetingTypeId: z.number(),
        title: z.string(),
        date: z.string().transform(str => new Date(str)),
        time: z.string().optional(),
        location: z.string().optional(),
        description: z.string().optional(),
        isOpenData: z.boolean().default(false),
      }))
      .mutation(({ input }) => db.createMeeting(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        meetingTypeId: z.number().optional(),
        title: z.string().optional(),
        date: z.string().optional().transform(str => str ? new Date(str) : undefined),
        time: z.string().optional(),
        location: z.string().optional(),
        description: z.string().optional(),
        isOpenData: z.boolean().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateMeeting(id, data);
      }),
  }),

  // ============================================
  // Meeting Attendances (การเข้าร่วมประชุม)
  // ============================================
  meetingAttendances: router({
    list: publicProcedure.query(() => db.getAllMeetingAttendances()),
    
    getByMeetingId: publicProcedure
      .input(z.object({ meetingId: z.number() }))
      .query(({ input }) => db.getMeetingAttendances(input.meetingId)),
    
    record: protectedProcedure
      .input(z.object({
        meetingId: z.number(),
        memberId: z.number(),
        status: z.enum(["present", "absent", "late", "excused"]),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { ...data } = input;
        return db.recordAttendance(data as any);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["present", "absent", "late", "excused"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateAttendance(id, data);
      }),
  }),

  // ============================================
  // Agendas (ระเบียบวาระ)
  // ============================================
  agendas: router({
    getByMeetingId: publicProcedure
      .input(z.object({ meetingId: z.number() }))
      .query(({ input }) => db.getMeetingAgendas(input.meetingId)),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getAgendaById(input.id)),
    
    create: protectedProcedure
      .input(z.object({
        meetingId: z.number(),
        title: z.string(),
        proposerMemberId: z.number().optional(),
        chairMemberId: z.number().optional(),
        principleReason: z.string().optional(),
        status: z.enum(["proposed", "considering", "passed", "failed"]).default("proposed"),
      }))
      .mutation(({ input }) => db.createAgenda(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        proposerMemberId: z.number().optional(),
        chairMemberId: z.number().optional(),
        principleReason: z.string().optional(),
        status: z.enum(["proposed", "considering", "passed", "failed"]).optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateAgenda(id, data);
      }),
  }),

  // ============================================
  // Votes (การโหวต)
  // ============================================
  votes: router({
    list: publicProcedure.query(() => db.getAllVotes()),
    
    getByAgendaId: publicProcedure
      .input(z.object({ agendaId: z.number() }))
      .query(({ input }) => db.getAgendaVotes(input.agendaId)),
    
    record: protectedProcedure
      .input(z.object({
        agendaId: z.number(),
        memberId: z.number(),
        voteChoice: z.enum(["agree", "disagree", "abstain", "not_voted"]),
      }))
      .mutation(({ input }) => db.recordVote(input)),
  }),

  // ============================================
  // Draft Regulations (ร่างระเบียบ/กฎหมาย)
  // ============================================
  draftRegulations: router({
    list: publicProcedure.query(() => db.getAllDraftRegulations()),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getDraftRegulationById(input.id)),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        proposerMemberId: z.number(),
        content: z.string(),
        proposedAt: z.enum(["internal", "central_council", "thaprajan_council", "rangsit_council", "lampang_council", "committee"]).default("internal"),
        committeeId: z.number().optional(),
        status: z.enum(["proposed", "considering", "passed", "failed"]).default("proposed"),
      }))
      .mutation(({ input }) => db.createDraftRegulation(input as any)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        proposerMemberId: z.number().optional(),
        content: z.string().optional(),
        proposedAt: z.enum(["internal", "central_council", "thaprajan_council", "rangsit_council", "lampang_council", "committee"]).optional(),
        committeeId: z.number().optional(),
        status: z.enum(["proposed", "considering", "passed", "failed"]).optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateDraftRegulation(id, data as any);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteDraftRegulation(input.id)),
  }),

  // ============================================
  // Member Roles (บทบาทสมาชิก)
  // ============================================
  memberRoles: router({
    getByMemberId: publicProcedure
      .input(z.object({ memberId: z.number() }))
      .query(({ input }) => db.getMemberRoles(input.memberId)),
    
    create: protectedProcedure
      .input(z.object({
        memberId: z.number(),
        role: z.enum(["council_member", "committee_member", "regular_member"]),
        startDate: z.string().optional().transform(str => str ? new Date(str).toISOString().split('T')[0] : undefined),
        endDate: z.string().optional().transform(str => str ? new Date(str).toISOString().split('T')[0] : undefined),
        isCurrent: z.boolean().default(true),
      }))
      .mutation(({ input }) => {
        const { ...data } = input;
        return db.addMemberRole(data as any);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        role: z.enum(["council_member", "committee_member", "regular_member"]).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        isCurrent: z.boolean().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateMemberRole(id, data as any);
      }),
    
    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.removeMemberRole(input.id)),
  }),

  // ============================================
  // Member Committees (ความสัมพันธ์กรรมาธิการ)
  // ============================================
  memberCommittees: router({
    getByMemberId: publicProcedure
      .input(z.object({ memberId: z.number() }))
      .query(({ input }) => db.getMemberCommittees(input.memberId)),
    
    create: protectedProcedure
      .input(z.object({
        memberId: z.number(),
        committeeId: z.number(),
        startDate: z.string().optional().transform(str => str ? new Date(str).toISOString().split('T')[0] : undefined),
        endDate: z.string().optional().transform(str => str ? new Date(str).toISOString().split('T')[0] : undefined),
        isCurrent: z.boolean().default(true),
      }))
      .mutation(({ input }) => {
        const { ...data } = input;
        return db.addMemberCommittee(data as any);
      }),
    
    remove: protectedProcedure
      .input(z.object({
        memberId: z.number(),
        committeeId: z.number(),
      }))
      .mutation(({ input }) => db.removeMemberCommittee(input.memberId, input.committeeId)),
  }),

  // ============================================
  // Committees (กรรมาธิการ)
  // ============================================
  committees: router({
    list: publicProcedure.query(() => db.getAllCommittees()),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getCommitteeById(input.id)),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
      }))
      .mutation(({ input }) => db.createCommittee(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateCommittee(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteCommittee(input.id)),
  }),
});

export type AppRouter = typeof appRouter;

