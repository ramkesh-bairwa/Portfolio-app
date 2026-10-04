import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { fail, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await requireAdmin())) return fail('Admins only.', 403);
  const requests = await query(
    `SELECT r.id, r.message, r.status, r.created_at, r.reviewed_at, u.id AS user_id, u.name, u.email, u.phone, u.is_premium, u.free_access
     FROM premium_requests r JOIN users u ON u.id = r.user_id ORDER BY (r.status = 'pending') DESC, r.created_at DESC LIMIT 300`
  );
  return ok({ requests });
}
