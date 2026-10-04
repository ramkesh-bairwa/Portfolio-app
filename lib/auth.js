import { cookies } from 'next/headers';
import { one } from './db';
import { COOKIE, signSession, verifySession } from './session';

const USER_FIELDS =
  'id, name, email, phone, auth_type, role, status, is_premium, free_access, whatsapp_opt_in, created_at';

export async function getCurrentUser() {
  const token = cookies().get(COOKIE)?.value;
  const payload = await verifySession(token);
  if (!payload?.uid) return null;
  const user = await one(`SELECT ${USER_FIELDS} FROM users WHERE id = ?`, [payload.uid]);
  if (!user || user.status === 'blocked' || user.status === 'rejected') return null;
  return { ...user, is_premium: !!user.is_premium, free_access: !!user.free_access };
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  return user && user.role === 'admin' ? user : null;
}

export async function startSession(user) {
  const token = await signSession({ uid: user.id, role: user.role });
  const secure =
    process.env.COOKIE_SECURE != null
      ? process.env.COOKIE_SECURE === 'true'
      : process.env.NODE_ENV === 'production';
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function endSession() {
  cookies().delete(COOKIE);
}

export function hasPublishAccess(user) {
  return !!user && (user.role === 'admin' || !!user.is_premium || !!user.free_access);
}

export function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.status,
    authType: u.auth_type,
    isPremium: !!u.is_premium,
    freeAccess: !!u.free_access,
    canPublish: hasPublishAccess(u),
  };
}
