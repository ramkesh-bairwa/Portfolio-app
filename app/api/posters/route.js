import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { body, fail, ok } from '@/lib/http';
import { cleanPoster, ensurePosters } from '@/lib/posterStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail('Log in first.', 401);
  await ensurePosters();
  const rows = await query('SELECT id, name, template_slug, format, updated_at FROM posters WHERE user_id = ? ORDER BY updated_at DESC', [user.id]);
  return ok({ posters: rows });
}

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return fail('Log in to save your design.', 401);
  await ensurePosters();
  const { name, template, data } = await body(req);
  const doc = cleanPoster(data);
  const res = await query('INSERT INTO posters (user_id, name, template_slug, format, data) VALUES (?, ?, ?, ?, ?)', [
    user.id, String(name || 'Untitled design').slice(0, 160), String(template || 'blank').slice(0, 80), doc.format, JSON.stringify(doc),
  ]);
  return ok({ id: res.insertId }, 201);
}
