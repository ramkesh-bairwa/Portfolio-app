import { requireAdmin } from '@/lib/auth';
import { one, query } from '@/lib/db';
import { body, fail, ok } from '@/lib/http';

export async function PATCH(req, { params }) {
  const admin = await requireAdmin();
  if (!admin) return fail('Admins only.', 403);
  const id = Number(params.id);
  const target = await one('SELECT id, role FROM users WHERE id = ?', [id]);
  if (!target) return fail('User not found.', 404);
  const b = await body(req);
  const sets = [];
  const vals = [];
  if (b.status !== undefined) {
    if (!['pending', 'active', 'rejected', 'blocked'].includes(b.status)) return fail('Unknown status.');
    if (id === admin.id) return fail('You cannot change your own status.');
    sets.push('status = ?');
    vals.push(b.status);
  }
  if (b.is_premium !== undefined) { sets.push('is_premium = ?'); vals.push(b.is_premium ? 1 : 0); }
  if (b.free_access !== undefined) { sets.push('free_access = ?'); vals.push(b.free_access ? 1 : 0); }
  if (!sets.length) return fail('Nothing to update.');
  await query(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, [...vals, id]);
  if (b.is_premium) await query("UPDATE premium_requests SET status = 'approved', reviewed_at = NOW() WHERE user_id = ? AND status = 'pending'", [id]);
  return ok({ updated: true });
}

export async function DELETE(_req, { params }) {
  const admin = await requireAdmin();
  if (!admin) return fail('Admins only.', 403);
  if (Number(params.id) === admin.id) return fail('You cannot delete your own account.');
  await query('DELETE FROM users WHERE id = ?', [Number(params.id)]);
  return ok({ deleted: true });
}
