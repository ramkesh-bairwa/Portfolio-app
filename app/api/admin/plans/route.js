import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { body, fail, ok } from '@/lib/http';
import { cleanPlanInput, getPlan, listPlans } from '@/lib/plans';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await requireAdmin())) return fail('Admins only.', 403);
  return ok({ plans: await listPlans({ includeInactive: true }) });
}

export async function POST(req) {
  if (!(await requireAdmin())) return fail('Admins only.', 403);
  const { error, values } = cleanPlanInput(await body(req));
  if (error) return fail(error);
  const r = await query('INSERT INTO plans SET ?', [values]);
  return ok({ plan: await getPlan(r.insertId) }, 201);
}
