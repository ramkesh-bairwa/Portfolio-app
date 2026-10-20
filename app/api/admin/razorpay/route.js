import { requireAdmin } from '@/lib/auth';
import { body, fail, ok } from '@/lib/http';
import { clearRazorpayKeys, getRazorpayKeys, razorpayStatus, saveRazorpayKeys, testRazorpayKeys } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await requireAdmin())) return fail('Admins only.', 403);
  return ok({ razorpay: await razorpayStatus() });
}

// Save keys. The keys are checked with Razorpay first, so a typo is caught here and not at checkout.
export async function PUT(req) {
  if (!(await requireAdmin())) return fail('Admins only.', 403);
  const b = await body(req);
  const keyId = String(b.keyId || '').trim();
  const saved = await getRazorpayKeys();
  const keySecret = String(b.keySecret || '').trim() || saved.keySecret;
  if (!/^rzp_(test|live)_[A-Za-z0-9]+$/.test(keyId)) return fail('Key ID looks wrong. It starts with rzp_test_ (sandbox) or rzp_live_.');
  if (!keySecret) return fail('Enter the Key Secret.');
  try {
    await testRazorpayKeys({ keyId, keySecret });
  } catch (e) {
    return fail(e.status === 401 ? 'Razorpay did not accept these keys. Copy them again from Dashboard → Account & Settings → API Keys.' : `Could not reach Razorpay: ${e.message}`);
  }
  await saveRazorpayKeys({ keyId, keySecret: String(b.keySecret || '').trim() });
  return ok({ razorpay: await razorpayStatus() });
}

export async function DELETE() {
  if (!(await requireAdmin())) return fail('Admins only.', 403);
  await clearRazorpayKeys();
  return ok({ razorpay: await razorpayStatus() });
}
