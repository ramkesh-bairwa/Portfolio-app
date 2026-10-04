import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { body, fail, ok } from '@/lib/http';
import { cleanData } from '@/lib/portfolio';
import { getTemplate, portfolioFromTemplate } from '@/lib/templates';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail('Log in to see your portfolios.', 401);
  const rows = await query('SELECT id, name, template_slug, updated_at, created_at FROM portfolios WHERE user_id = ? ORDER BY updated_at DESC', [user.id]);
  return ok({ portfolios: rows });
}

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return fail('Log in to save your portfolio.', 401);
  const { template, name, data } = await body(req);
  const slug = getTemplate(template) ? template : 'blank';
  const base = data ? cleanData(data) : cleanData(portfolioFromTemplate(slug));
  const r = await query('INSERT INTO portfolios (user_id, name, template_slug, data) VALUES (?, ?, ?, ?)', [
    user.id,
    String(name || 'My portfolio').slice(0, 160),
    slug,
    JSON.stringify(base),
  ]);
  return ok({ id: r.insertId }, 201);
}
