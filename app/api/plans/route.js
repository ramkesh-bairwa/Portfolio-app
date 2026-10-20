import { ok } from '@/lib/http';
import { listPlans } from '@/lib/plans';

export const dynamic = 'force-dynamic';

export async function GET() {
  return ok({ plans: await listPlans() });
}
