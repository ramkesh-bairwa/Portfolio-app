import { one, query } from '@/lib/db';
import { publicUser, startSession } from '@/lib/auth';
import { body, fail, ok } from '@/lib/http';
import { hashOtp } from '@/lib/otp';
import { normalizePhone } from '@/lib/whatsapp';

export async function POST(req) {
  const { phone: raw, code, name } = await body(req);
  const phone = normalizePhone(raw);
  if (!phone) return fail('Enter a valid mobile number.');

  const otp = await one('SELECT * FROM otp_codes WHERE phone = ? AND expires_at > NOW() ORDER BY id DESC LIMIT 1', [phone]);
  if (!otp) return fail('This code has expired. Request a new one.');
  if (otp.attempts >= 5) return fail('Too many wrong attempts. Request a new code.', 429);
  if (otp.code_hash !== hashOtp(phone, String(code || '').trim())) {
    await query('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?', [otp.id]);
    return fail('That code is not right. Check WhatsApp and try again.');
  }
  await query('DELETE FROM otp_codes WHERE phone = ?', [phone]);

  const cleanName = String(name || '').trim().slice(0, 120);
  let user = await one('SELECT * FROM users WHERE phone = ?', [phone]);
  if (!user) {
    const r = await query(
      "INSERT INTO users (name, phone, auth_type, status, whatsapp_opt_in, whatsapp_opt_in_at, last_login_at) VALUES (?, ?, 'mobile', 'active', 1, NOW(), NOW())",
      [cleanName, phone]
    );
    user = await one('SELECT * FROM users WHERE id = ?', [r.insertId]);
  } else {
    if (['blocked', 'rejected'].includes(user.status)) return fail('This number is blocked. Contact support for help.', 403);
    if (user.status === 'pending') return fail('Your account is waiting for admin approval.', 403);
    await query(
      'UPDATE users SET whatsapp_opt_in = 1, whatsapp_opt_in_at = COALESCE(whatsapp_opt_in_at, NOW()), last_login_at = NOW(), name = IF(name = "", ?, name) WHERE id = ?',
      [cleanName, user.id]
    );
  }
  await startSession(user);
  return ok({ user: publicUser(user) });
}
