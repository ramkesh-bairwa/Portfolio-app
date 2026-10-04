import crypto from 'node:crypto';
import { one, query } from '@/lib/db';
import { body, fail, ok } from '@/lib/http';
import { hashOtp } from '@/lib/otp';
import { normalizePhone, sendWhatsAppOtp } from '@/lib/whatsapp';

export async function POST(req) {
  const { phone: raw, whatsappOptIn } = await body(req);
  if (!whatsappOptIn) return fail('Turn on WhatsApp updates to receive your login code on WhatsApp.');
  const phone = normalizePhone(raw);
  if (!phone) return fail('Enter a valid mobile number with country code, e.g. +91 98765 43210.');

  const user = await one('SELECT id, status FROM users WHERE phone = ?', [phone]);
  if (user && ['blocked', 'rejected'].includes(user.status)) return fail('This number is blocked. Contact support for help.', 403);

  const recent = await one('SELECT COUNT(*) AS n FROM otp_codes WHERE phone = ? AND created_at > NOW() - INTERVAL 10 MINUTE', [phone]);
  if (Number(recent.n) >= 5) return fail('Too many codes requested. Wait 10 minutes and try again.', 429);

  const code = String(crypto.randomInt(100000, 1000000));
  await query('INSERT INTO otp_codes (phone, code_hash, expires_at) VALUES (?, ?, NOW() + INTERVAL 5 MINUTE)', [phone, hashOtp(phone, code)]);

  try {
    const res = await sendWhatsAppOtp(phone, code);
    return ok({
      sent: true,
      phone,
      isNew: !user,
      ...(res.dev && (process.env.NODE_ENV !== 'production' || process.env.OTP_SHOW_IN_RESPONSE === 'true') ? { devOtp: code } : {}),
    });
  } catch (e) {
    return fail(e.message, 502);
  }
}
