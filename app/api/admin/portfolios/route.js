import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { fail, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  if (!(await requireAdmin())) return fail('Admins only.', 403);
  const sp = new URL(req.url).searchParams;
  const q = `%${(sp.get('q') || '').trim()}%`;
  const filter = sp.get('filter') || 'all';
  const where = ['(p.name LIKE ? OR p.slug LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)'];
  if (filter === 'live') where.push('p.published_at IS NOT NULL');
  if (filter === 'draft') where.push('p.published_at IS NULL');
  const portfolios = await query(
    `SELECT p.id, p.name, p.template_slug, p.slug, p.published_at, p.created_at, p.updated_at,
      u.id AS user_id, u.name AS user_name, u.email AS user_email, u.phone AS user_phone
     FROM portfolios p JOIN users u ON u.id = p.user_id
     WHERE ${where.join(' AND ')} ORDER BY p.updated_at DESC LIMIT 500`,
    [q, q, q, q, q]
  );
  return ok({ portfolios });
}
