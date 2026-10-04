import { query } from './db';

export const DEFAULT_SETTINGS = {
  download_requires_premium: '1',
  allow_guest_uploads: '1',
};

export async function getSettings() {
  const rows = await query('SELECT k, v FROM settings');
  const out = { ...DEFAULT_SETTINGS };
  rows.forEach((r) => (out[r.k] = r.v));
  return out;
}

export async function setSetting(k, v) {
  if (!(k in DEFAULT_SETTINGS)) return;
  await query('INSERT INTO settings (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)', [k, String(v)]);
}
