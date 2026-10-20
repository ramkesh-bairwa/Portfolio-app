import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { body, fail, ok } from '@/lib/http';
import { getPlan } from '@/lib/plans';
import { createOrder, getRazorpayKeys, toMinorUnits } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

// Creates a Razorpay order for a plan. The price always comes from the database, never from the browser.
export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return fail('Log in to buy a plan.', 401);
  const keys = await getRazorpayKeys();
  if (!keys.enabled) return fail('Online payments are not set up yet. Send a request from the Plans page instead.', 503);

  const { planId } = await body(req);
  const plan = await getPlan(planId, { activeOnly: true });
  if (!plan) return fail('That plan is no longer available. Refresh the page and pick another.', 404);
  const amount = toMinorUnits(plan.price);
  if (amount < 100) return fail('This plan is free or too cheap to pay online.');

  let order;
  try {
    order = await createOrder({
      amount,
      currency: plan.currency,
      receipt: `u${user.id}-p${plan.id}-${Date.now()}`.slice(0, 40),
      notes: { user_id: String(user.id), plan_id: String(plan.id), plan: plan.name },
    });
  } catch (e) {
    console.error('Razorpay order failed:', e.message);
    const currencyHint = /currency/i.test(e.message) ? ` Ask the admin to set this plan's currency to INR, or enable international payments in Razorpay.` : '';
    return fail(`Could not start the payment: ${e.message}.${currencyHint}`, 502);
  }

  await query('INSERT INTO payments (user_id, plan_id, plan_name, order_id, amount, currency, is_test) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    user.id, plan.id, plan.name, order.id, order.amount, order.currency, keys.isTest ? 1 : 0,
  ]);

  return ok({
    keyId: keys.keyId,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    plan: { id: plan.id, name: plan.name },
    prefill: { name: user.name || '', email: user.email || '', contact: user.phone || '' },
  });
}
