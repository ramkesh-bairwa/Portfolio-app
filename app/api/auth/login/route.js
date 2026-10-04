import bcrypt from 'bcryptjs';
import { one, query } from '@/lib/db';
import { publicUser, startSession } from '@/lib/auth';
import { body, fail, ok } from '@/lib/http';

const STATUS_MSG = {
  pending: 'Your account is waiting for admin approval. You can log in once it is approved.',
  rejected: 'Your registration was not approved. Contact support for help.',
  blocked: 'This account is blocked. Contact support for help.',
};

export async function POST(req) {
  const { email, password } = await body(req);
  const user = await one('SELECT * FROM users WHERE email = ?', [String(email || '').trim().toLowerCase()]);
  if (!user || !user.password_hash || !(await bcrypt.compare(String(password || ''), user.password_hash)))
    return fail('Email or password is incorrect.', 401);
  if (user.status !== 'active') return fail(STATUS_MSG[user.status], 403, { status: user.status });

  await query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
  await startSession(user);
  return ok({ user: publicUser(user) });
}
