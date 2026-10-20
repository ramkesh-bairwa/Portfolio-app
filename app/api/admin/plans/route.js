import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { body, fail, ok } from '@/lib/http';
import { cleanPlanInput, getInrRate, getPlan, listPlans, setInrRate } from '@/lib/plans';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await requireAdmin())) return fail('Admins only.', 403);
  return ok({ plans: await listPlans({ includeInactive: true }), inrRate: await getInrRate() });
}

// Rupee rate shown in brackets next to USD prices
export async function PATCH(req) {
  if (!(await requireAdmin())) return fail('Admins only.', 403);
  const rate = Number((await body(req)).inrRate);
  if (!(rate > 0 && rate < 10000)) return fail('Enter how many rupees 1 USD is, like 88.');
  await setInrRate(Math.round(rate * 100) / 100);
  return ok({ inrRate: await getInrRate() });
}

export async function POST(req) {
  if (!(await requireAdmin())) return fail('Admins only.', 403);
  const { error, values } = cleanPlanInput(await body(req));
  if (error) return fail(error);
  const r = await query('INSERT INTO plans SET ?', [values]);
  return ok({ plan: await getPlan(r.insertId) }, 201);
}
