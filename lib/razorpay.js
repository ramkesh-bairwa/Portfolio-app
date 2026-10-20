import crypto from 'node:crypto';
import { query } from './db';

const API = 'https://api.razorpay.com/v1';

// Keys are saved by an admin in Settings; RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in .env.local are a fallback
export async function getRazorpayKeys() {
  const rows = await query("SELECT k, v FROM settings WHERE k IN ('razorpay_key_id', 'razorpay_key_secret')");
  const s = Object.fromEntries(rows.map((r) => [r.k, r.v]));
  const keyId = s.razorpay_key_id || process.env.RAZORPAY_KEY_ID || '';
  const keySecret = s.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET || '';
  return { keyId, keySecret, enabled: !!(keyId && keySecret), isTest: keyId.startsWith('rzp_test_') };
}

// What the admin screen may see: never the secret itself
export async function razorpayStatus() {
  const { keyId, keySecret, enabled, isTest } = await getRazorpayKeys();
  return { keyId, hasSecret: !!keySecret, secretHint: keySecret ? `••••${keySecret.slice(-4)}` : '', enabled, isTest };
}

export async function saveRazorpayKeys({ keyId, keySecret }) {
  const save = (k, v) => query('INSERT INTO settings (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)', [k, v]);
  await save('razorpay_key_id', String(keyId || '').trim());
  // An empty secret field means "keep the saved one"
  if (keySecret) await save('razorpay_key_secret', String(keySecret).trim());
}

export async function clearRazorpayKeys() {
  await query("DELETE FROM settings WHERE k IN ('razorpay_key_id', 'razorpay_key_secret')");
}

async function call(path, { method = 'GET', body, keys } = {}) {
  const { keyId, keySecret } = keys || (await getRazorpayKeys());
  const r = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      ...(body && { 'Content-Type': 'application/json' }),
    },
    body: body && JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const e = new Error(data?.error?.description || `Razorpay answered ${r.status}`);
    e.status = r.status;
    throw e;
  }
  return data;
}

// Checks the keys with a harmless read
export const testRazorpayKeys = (keys) => call('/orders?count=1', { keys });

export const createOrder = ({ amount, currency, receipt, notes }) =>
  call('/orders', { method: 'POST', body: { amount, currency, receipt, notes } });

// Razorpay signs "order_id|payment_id" with the key secret
export function signatureIsValid({ orderId, paymentId, signature, keySecret }) {
  const expected = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Prices are stored in major units ($79.00); Razorpay wants the smallest unit (7900 cents)
export const toMinorUnits = (price) => Math.round(Number(price) * 100);
