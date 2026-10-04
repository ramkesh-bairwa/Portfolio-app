import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { fail, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  if (!(await requireAdmin())) return fail('Admins only.', 403);
  const sp = new URL(req.url).searchParams;
  const q = `%${(sp.get('q') || '').trim()}%`;
  const filter = sp.get('filter') || 'all';
  const where = ['(name LIKE ? OR email LIKE ? OR phone LIKE ?)'];
  if (['pending', 'active', 'rejected', 'blocked'].includes(filter)) where.push(`status = '${filter}'`);
  if (filter === 'premium') where.push('is_premium = 1');
  if (filter === 'free') where.push('free_access = 1');
  if (filter === 'mobile' || filter === 'email') where.push(`auth_type = '${filter}'`);
  const users = await query(
    `SELECT u.id, u.name, u.email, u.phone, u.auth_type, u.role, u.status, u.is_premium, u.free_access, u.whatsapp_opt_in, u.created_at, u.last_login_at,
      (SELECT COUNT(*) FROM portfolios p WHERE p.user_id = u.id) AS portfolios,
      (SELECT COUNT(*) FROM portfolios p WHERE p.user_id = u.id AND p.published_at IS NOT NULL) AS published
     FROM users u WHERE ${where.join(' AND ')} ORDER BY (u.status = 'pending') DESC, u.created_at DESC LIMIT 500`,
    [q, q, q]
  );
  return ok({ users });
}
