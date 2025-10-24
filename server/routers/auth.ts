import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { supabase } from '../supabase';
import { nanoid } from 'nanoid';

const SALT_ROUNDS = 10;

export const authRouter = router({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(2),
        studentId: z.string().optional(),
        educationCenter: z.string().optional(),
        phone: z.string().optional(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { data: existingUser } = await supabase
        .from('auth_users')
        .select('id')
        .eq('email', input.email)
        .maybeSingle();

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'อีเมลนี้ถูกใช้งานแล้ว',
        });
      }

      const { data: existingRequest } = await supabase
        .from('registration_requests')
        .select('id')
        .eq('email', input.email)
        .maybeSingle();

      if (existingRequest) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'คำขอลงทะเบียนของคุณอยู่ระหว่างการพิจารณา',
        });
      }

      const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

      const { error } = await supabase.from('registration_requests').insert({
        email: input.email,
        password_hash: passwordHash,
        name: input.name,
        student_id: input.studentId,
        education_center: input.educationCenter,
        phone: input.phone,
        reason: input.reason,
        status: 'pending',
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'ไม่สามารถส่งคำขอลงทะเบียนได้',
        });
      }

      return {
        success: true,
        message: 'ส่งคำขอลงทะเบียนเรียบร้อยแล้ว รอการอนุมัติจากผู้ดูแลระบบ',
      };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data: user } = await supabase
        .from('auth_users')
        .select('*')
        .eq('email', input.email)
        .maybeSingle();

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        });
      }

      if (!user.is_active) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'บัญชีของคุณถูกระงับ',
        });
      }

      const isValidPassword = await bcrypt.compare(
        input.password,
        user.password_hash
      );

      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        });
      }

      const sessionId = nanoid();
      ctx.setAuthCookie(sessionId);
      ctx.session.set(sessionId, {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    const sessionId = ctx.getAuthCookie();
    if (sessionId) {
      ctx.session.delete(sessionId);
      ctx.clearAuthCookie();
    }
    return { success: true };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),

  checkRegistrationStatus: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      const { data } = await supabase
        .from('registration_requests')
        .select('status, created_at, reviewed_at, rejection_reason')
        .eq('email', input.email)
        .maybeSingle();

      return data;
    }),

  getPendingRegistrations: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
      });
    }

    const { data, error } = await supabase
      .from('registration_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ไม่สามารถโหลดข้อมูลได้',
      });
    }

    return data;
  }),

  getAllRegistrations: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
      });
    }

    const { data, error } = await supabase
      .from('registration_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ไม่สามารถโหลดข้อมูลได้',
      });
    }

    return data;
  }),

  approveRegistration: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'คุณไม่มีสิทธิ์ดำเนินการนี้',
        });
      }

      const { data: request } = await supabase
        .from('registration_requests')
        .select('*')
        .eq('id', input.requestId)
        .maybeSingle();

      if (!request) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'ไม่พบคำขอลงทะเบียน',
        });
      }

      if (request.status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'คำขอนี้ได้รับการพิจารณาแล้ว',
        });
      }

      const { error: userError } = await supabase.from('auth_users').insert({
        email: request.email,
        password_hash: request.password_hash,
        name: request.name,
        role: 'user',
        is_active: true,
      });

      if (userError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'ไม่สามารถสร้างบัญชีผู้ใช้ได้',
        });
      }

      const { error: updateError } = await supabase
        .from('registration_requests')
        .update({
          status: 'approved',
          reviewed_by: ctx.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', input.requestId);

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'ไม่สามารถอัพเดทสถานะได้',
        });
      }

      return { success: true, message: 'อนุมัติคำขอเรียบร้อยแล้ว' };
    }),

  rejectRegistration: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'คุณไม่มีสิทธิ์ดำเนินการนี้',
        });
      }

      const { data: request } = await supabase
        .from('registration_requests')
        .select('*')
        .eq('id', input.requestId)
        .maybeSingle();

      if (!request) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'ไม่พบคำขอลงทะเบียน',
        });
      }

      if (request.status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'คำขอนี้ได้รับการพิจารณาแล้ว',
        });
      }

      const { error } = await supabase
        .from('registration_requests')
        .update({
          status: 'rejected',
          reviewed_by: ctx.user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: input.reason,
        })
        .eq('id', input.requestId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'ไม่สามารถอัพเดทสถานะได้',
        });
      }

      return { success: true, message: 'ปฏิเสธคำขอเรียบร้อยแล้ว' };
    }),
});
