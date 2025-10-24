import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { parse as parseCookieHeader, serialize } from 'cookie';
import { COOKIE_NAME } from '@shared/const';

type SessionData = {
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
};

const sessionStore = new Map<string, SessionData>();

export type AuthUser = SessionData & { id: string };

export type AuthContext = {
  req: CreateExpressContextOptions['req'];
  res: CreateExpressContextOptions['res'];
  user: AuthUser | null;
  session: Map<string, SessionData>;
  getAuthCookie: () => string | undefined;
  setAuthCookie: (sessionId: string) => void;
  clearAuthCookie: () => void;
};

export async function createAuthContext(
  opts: CreateExpressContextOptions
): Promise<AuthContext> {
  let user: AuthUser | null = null;

  const getAuthCookie = () => {
    const cookies = parseCookieHeader(opts.req.headers.cookie || '');
    return cookies[COOKIE_NAME];
  };

  const setAuthCookie = (sessionId: string) => {
    const cookie = serialize(COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    opts.res.setHeader('Set-Cookie', cookie);
  };

  const clearAuthCookie = () => {
    const cookie = serialize(COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    opts.res.setHeader('Set-Cookie', cookie);
  };

  const sessionId = getAuthCookie();
  if (sessionId) {
    const sessionData = sessionStore.get(sessionId);
    if (sessionData) {
      user = {
        ...sessionData,
        id: sessionData.userId,
      };
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    session: sessionStore,
    getAuthCookie,
    setAuthCookie,
    clearAuthCookie,
  };
}
