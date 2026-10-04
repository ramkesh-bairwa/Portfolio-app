import { one } from '@/lib/db';
import { renderDocument } from '@/lib/render';

export const dynamic = 'force-dynamic';

const notFound = () =>
  new Response('<!doctype html><meta charset="utf-8"><title>Not found</title><p style="font-family:system-ui;padding:3rem;text-align:center">This portfolio does not exist or is not published.</p>', {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });

// Published portfolios: /<slug>. Fixed routes (/admin, /login, ...) take priority over this one.
export async function GET(_req, { params }) {
  const slug = String(params.slug || '').toLowerCase();
  const row = await one(
    `SELECT p.name, p.published_data FROM portfolios p JOIN users u ON u.id = p.user_id
     WHERE p.slug = ? AND p.published_at IS NOT NULL AND u.status NOT IN ('blocked', 'rejected')`,
    [slug]
  );
  if (!row?.published_data) return notFound();
  let data;
  try {
    data = JSON.parse(row.published_data);
  } catch {
    return notFound();
  }
  return new Response(renderDocument({ ...data, name: row.name }), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
