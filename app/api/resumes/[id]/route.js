import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { body, fail, ok } from '@/lib/http';
import { cleanResume, ownResume } from '@/lib/resumeStore';

export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return fail('Log in to open this resume.', 401);
  const row = await ownResume(user, params.id);
  if (!row) return fail('Resume not found.', 404);
  let data = {};
  try { data = JSON.parse(row.data || '{}'); } catch { /* keep empty */ }
  return ok({ resume: { ...data, id: row.id, name: row.name, template: row.template_slug } });
}

export async function PUT(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return fail('Log in to save.', 401);
  const row = await ownResume(user, params.id);
  if (!row) return fail('Resume not found.', 404);
  const { name, data } = await body(req);
  await query('UPDATE resumes SET name = ?, data = ? WHERE id = ?', [String(name || row.name).slice(0, 160), JSON.stringify(cleanResume(data)), row.id]);
  return ok({ saved: true });
}

export async function DELETE(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return fail('Log in first.', 401);
  const row = await ownResume(user, params.id);
  if (!row) return fail('Resume not found.', 404);
  await query('DELETE FROM resumes WHERE id = ?', [row.id]);
  return ok({ deleted: true });
}
