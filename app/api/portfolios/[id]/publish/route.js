import { getCurrentUser, hasPublishAccess } from '@/lib/auth';
import { one, query } from '@/lib/db';
import { body, fail, ok } from '@/lib/http';
import { ownPortfolio } from '@/lib/portfolio';
import { slugError } from '@/lib/publish';
import { getSettings } from '@/lib/settings';
import { getTemplateFlags } from '@/lib/templateStore';

export const dynamic = 'force-dynamic';

// Publish (or republish) the saved portfolio at /<slug>
export async function POST(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return fail('Log in to publish your portfolio.', 401, { code: 'login' });
  if (user.status !== 'active') return fail('Your account is waiting for admin approval.', 403, { code: 'pending' });

  const row = await ownPortfolio(user, params.id);
  if (!row) return fail('Portfolio not found.', 404);

  const [settings, tpl] = await Promise.all([getSettings(), getTemplateFlags(row.template_slug)]);
  const needsPremium = settings.download_requires_premium === '1' || !!tpl?.premium;
  if (needsPremium && !hasPublishAccess(user))
    return fail(
      tpl?.premium ? `"${tpl.name}" is a premium template. Ask for premium access to publish it.` : 'Publishing is a premium feature. Ask for premium access to publish.',
      402,
      { code: 'premium' }
    );

  const slug = String((await body(req)).slug || '').trim().toLowerCase();
  const err = slugError(slug);
  if (err) return fail(err, 400, { code: 'slug' });
  const taken = await one('SELECT id FROM portfolios WHERE slug = ? AND id <> ?', [slug, row.id]);
  if (taken) return fail(`"${slug}" is already taken. Try another name.`, 409, { code: 'slug' });

  try {
    await query('UPDATE portfolios SET slug = ?, published_data = data, published_at = NOW(), updated_at = updated_at WHERE id = ?', [slug, row.id]);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return fail(`"${slug}" is already taken. Try another name.`, 409, { code: 'slug' });
    throw e;
  }
  return ok({ slug, publishedAt: new Date().toISOString() });
}

// Take the public page down. The name stays with this portfolio so it can be republished.
export async function DELETE(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return fail('Log in first.', 401);
  const row = await ownPortfolio(user, params.id);
  if (!row) return fail('Portfolio not found.', 404);
  await query('UPDATE portfolios SET published_data = NULL, published_at = NULL, updated_at = updated_at WHERE id = ?', [row.id]);
  return ok({ unpublished: true });
}
