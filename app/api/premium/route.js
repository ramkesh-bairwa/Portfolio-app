import { getCurrentUser } from '@/lib/auth';
import { one, query } from '@/lib/db';
import { body, fail, ok } from '@/lib/http';
import { getPlan } from '@/lib/plans';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail('Log in first.', 401);
  const request = await one('SELECT id, status, plan_id AS planId, created_at, reviewed_at FROM premium_requests WHERE user_id = ? ORDER BY id DESC LIMIT 1', [user.id]);
  return ok({ request });
}

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return fail('Log in to ask for premium access.', 401);
  if (user.is_premium || user.free_access) return ok({ already: true });
  const { message, planId } = await body(req);
  let plan = null;
  if (planId != null) {
    plan = await getPlan(planId, { activeOnly: true });
    if (!plan) return fail('That plan is no longer available. Refresh the page and pick another.', 404);
  }
  const pending = await one("SELECT id FROM premium_requests WHERE user_id = ? AND status = 'pending'", [user.id]);
  if (pending) {
    // Picking another plan while waiting switches the request to it
    if (plan) await query('UPDATE premium_requests SET plan_id = ? WHERE id = ?', [plan.id, pending.id]);
    return ok({ request: { id: pending.id, status: 'pending', planId: plan?.id ?? null } });
  }
  const r = await query('INSERT INTO premium_requests (user_id, message, plan_id) VALUES (?, ?, ?)', [user.id, String(message || '').slice(0, 500), plan?.id ?? null]);
  return ok({ request: { id: r.insertId, status: 'pending', planId: plan?.id ?? null } }, 201);
}
