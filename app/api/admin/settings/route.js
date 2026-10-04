import { requireAdmin } from '@/lib/auth';
import { body, fail, ok } from '@/lib/http';
import { DEFAULT_SETTINGS, getSettings, setSetting } from '@/lib/settings';

export async function PUT(req) {
  if (!(await requireAdmin())) return fail('Admins only.', 403);
  const b = await body(req);
  for (const k of Object.keys(DEFAULT_SETTINGS)) if (b[k] !== undefined) await setSetting(k, b[k] ? '1' : '0');
  return ok({ settings: await getSettings() });
}
