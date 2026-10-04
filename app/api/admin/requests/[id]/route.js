import { requireAdmin } from '@/lib/auth';
import { one, query } from '@/lib/db';
import { body, fail, ok } from '@/lib/http';

export async function PATCH(req, { params }) {
  if (!(await requireAdmin())) return fail('Admins only.', 403);
  const { action } = await body(req);
  const r = await one('SELECT * FROM premium_requests WHERE id = ?', [Number(params.id)]);
  if (!r) return fail('Request not found.', 404);
  if (action === 'approve') {
    await query("UPDATE premium_requests SET status = 'approved', reviewed_at = NOW() WHERE id = ?", [r.id]);
    await query('UPDATE users SET is_premium = 1 WHERE id = ?', [r.user_id]);
  } else if (action === 'reject') {
    await query("UPDATE premium_requests SET status = 'rejected', reviewed_at = NOW() WHERE id = ?", [r.id]);
  } else return fail('Unknown action.');
  return ok({ updated: true });
}
