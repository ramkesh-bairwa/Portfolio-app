import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { body, fail, ok } from '@/lib/http';
import { cleanPoster, ownPoster } from '@/lib/posterStore';

export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return fail('Log in to open this design.', 401);
  const row = await ownPoster(user, params.id);
  if (!row) return fail('Design not found.', 404);
  let data = {};
  try { data = JSON.parse(row.data || '{}'); } catch { /* keep empty */ }
  return ok({ poster: { id: row.id, name: row.name, template: row.template_slug, updatedAt: row.updated_at, ...cleanPoster(data) } });
}

export async function PUT(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return fail('Log in to save.', 401);
  const row = await ownPoster(user, params.id);
  if (!row) return fail('Design not found.', 404);
  const { name, data } = await body(req);
  const doc = cleanPoster(data);
  await query('UPDATE posters SET name = ?, format = ?, data = ? WHERE id = ?', [String(name || row.name).slice(0, 160), doc.format, JSON.stringify(doc), row.id]);
  return ok({ saved: true });
}

export async function DELETE(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return fail('Log in first.', 401);
  const row = await ownPoster(user, params.id);
  if (!row) return fail('Design not found.', 404);
  await query('DELETE FROM posters WHERE id = ?', [row.id]);
  return ok({ deleted: true });
}
