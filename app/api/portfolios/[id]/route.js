import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { body, fail, ok } from '@/lib/http';
import { cleanData, ownPortfolio, parseData } from '@/lib/portfolio';

export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return fail('Log in to open this portfolio.', 401);
  const row = await ownPortfolio(user, params.id);
  if (!row) return fail('Portfolio not found.', 404);
  return ok({ portfolio: { id: row.id, name: row.name, template: row.template_slug, updatedAt: row.updated_at, slug: row.slug, publishedAt: row.published_at, ...parseData(row) } });
}

export async function PUT(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return fail('Log in to save.', 401);
  const row = await ownPortfolio(user, params.id);
  if (!row) return fail('Portfolio not found.', 404);
  const { name, data } = await body(req);
  await query('UPDATE portfolios SET name = ?, data = ? WHERE id = ?', [String(name || row.name).slice(0, 160), JSON.stringify(cleanData(data)), row.id]);
  return ok({ saved: true });
}

export async function DELETE(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return fail('Log in first.', 401);
  const row = await ownPortfolio(user, params.id);
  if (!row) return fail('Portfolio not found.', 404);
  await query('DELETE FROM portfolios WHERE id = ?', [row.id]);
  return ok({ deleted: true });
}
