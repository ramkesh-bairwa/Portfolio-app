import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { body, fail, ok } from '@/lib/http';
import { getTemplate } from '@/lib/templates';

export async function PATCH(req, { params }) {
  if (!(await requireAdmin())) return fail('Admins only.', 403);
  if (!getTemplate(params.slug)) return fail('Template not found.', 404);
  const b = await body(req);
  const sets = [];
  const vals = [];
  if (b.premium !== undefined) { sets.push('is_premium = ?'); vals.push(b.premium ? 1 : 0); }
  if (b.active !== undefined) { sets.push('is_active = ?'); vals.push(b.active ? 1 : 0); }
  if (!sets.length) return fail('Nothing to update.');
  await query(`UPDATE templates SET ${sets.join(', ')} WHERE slug = ?`, [...vals, params.slug]);
  return ok({ updated: true });
}
