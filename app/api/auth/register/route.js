import bcrypt from 'bcryptjs';
import { one, query } from '@/lib/db';
import { body, fail, ok } from '@/lib/http';

export async function POST(req) {
  const { name, email, password } = await body(req);
  const mail = String(email || '').trim().toLowerCase();
  if (!String(name || '').trim()) return fail('Enter your name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) return fail('Enter a valid email address.');
  if (String(password || '').length < 8) return fail('Use at least 8 characters for your password.');
  if (await one('SELECT id FROM users WHERE email = ?', [mail])) return fail('An account with this email already exists. Log in instead.', 409);

  const hash = await bcrypt.hash(password, 10);
  await query("INSERT INTO users (name, email, password_hash, auth_type, status) VALUES (?, ?, ?, 'email', 'pending')", [String(name).trim().slice(0, 120), mail, hash]);
  return ok({ pending: true, message: 'Account created. An admin will review it — you can log in once it is approved.' }, 201);
}
