import { getCurrentUser, publicUser } from '@/lib/auth';
import { one, query } from '@/lib/db';
import { body, fail, ok } from '@/lib/http';
import { getRazorpayKeys, signatureIsValid } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

// Called by the checkout after the user pays (or when the payment fails).
// Premium is only switched on when Razorpay's signature checks out.
export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return fail('Log in first.', 401);
  const b = await body(req);
  const orderId = String(b.orderId || '');
  const payment = await one('SELECT * FROM payments WHERE order_id = ? AND user_id = ?', [orderId, user.id]);
  if (!payment) return fail('Payment not found.', 404);

  if (b.error) {
    if (payment.status === 'created') {
      await query("UPDATE payments SET status = 'failed', payment_id = ?, error = ? WHERE id = ?", [
        String(b.paymentId || '') || null, String(b.error).slice(0, 255), payment.id,
      ]);
    }
    return ok({ status: 'failed' });
  }

  if (payment.status !== 'paid') {
    const paymentId = String(b.paymentId || '');
    const { keySecret } = await getRazorpayKeys();
    if (!keySecret || !signatureIsValid({ orderId, paymentId, signature: b.signature, keySecret }))
      return fail('Could not confirm this payment. If money was taken, contact support with your payment ID.', 400);

    await query("UPDATE payments SET status = 'paid', payment_id = ?, error = NULL, paid_at = NOW() WHERE id = ?", [paymentId, payment.id]);
    await query('UPDATE users SET is_premium = 1, plan_id = COALESCE(?, plan_id) WHERE id = ?', [payment.plan_id, user.id]);
    // Any request still waiting for an admin is settled by the payment
    await query("UPDATE premium_requests SET status = 'approved', plan_id = COALESCE(?, plan_id), reviewed_at = NOW() WHERE user_id = ? AND status = 'pending'", [payment.plan_id, user.id]);
  }

  return ok({ status: 'paid', user: publicUser(await getCurrentUser()) });
}
