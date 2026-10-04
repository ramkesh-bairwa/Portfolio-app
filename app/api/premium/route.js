import { getCurrentUser } from '@/lib/auth';
import { one, query } from '@/lib/db';
import { body, fail, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail('Log in first.', 401);
  const request = await one('SELECT id, status, created_at, reviewed_at FROM premium_requests WHERE user_id = ? ORDER BY id DESC LIMIT 1', [user.id]);
  return ok({ request });
}

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return fail('Log in to ask for premium access.', 401);
  if (user.is_premium || user.free_access) return ok({ already: true });
  const pending = await one("SELECT id FROM premium_requests WHERE user_id = ? AND status = 'pending'", [user.id]);
  if (pending) return ok({ request: { id: pending.id, status: 'pending' } });
  const { message } = await body(req);
  const r = await query('INSERT INTO premium_requests (user_id, message) VALUES (?, ?)', [user.id, String(message || '').slice(0, 500)]);
  return ok({ request: { id: r.insertId, status: 'pending' } }, 201);
}
