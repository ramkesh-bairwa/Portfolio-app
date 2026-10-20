import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { body, fail, ok } from '@/lib/http';
import { cleanPlanInput, getPlan } from '@/lib/plans';

export async function PUT(req, { params }) {
  if (!(await requireAdmin())) return fail('Admins only.', 403);
  const plan = await getPlan(params.id);
  if (!plan) return fail('Plan not found.', 404);
  const { error, values } = cleanPlanInput(await body(req));
  if (error) return fail(error);
  await query('UPDATE plans SET ? WHERE id = ?', [values, plan.id]);
  return ok({ plan: await getPlan(plan.id) });
}

export async function DELETE(_req, { params }) {
  if (!(await requireAdmin())) return fail('Admins only.', 403);
  const plan = await getPlan(params.id);
  if (!plan) return fail('Plan not found.', 404);
  // Users and requests keep working without the plan; they just stop showing its name
  await query('UPDATE users SET plan_id = NULL WHERE plan_id = ?', [plan.id]);
  await query('UPDATE premium_requests SET plan_id = NULL WHERE plan_id = ?', [plan.id]);
  await query('DELETE FROM plans WHERE id = ?', [plan.id]);
  return ok({ deleted: true });
}
