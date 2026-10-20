import { ok } from '@/lib/http';
import { getInrRate, listPlans } from '@/lib/plans';
import { getRazorpayKeys } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { enabled, isTest } = await getRazorpayKeys();
  // payments.enabled false: plans are requested and an admin approves them
  return ok({ plans: await listPlans(), payments: { enabled, isTest }, inrRate: await getInrRate() });
}
