import { query } from './db';
import { TEMPLATES } from './templates';

let synced = false;
async function sync() {
  if (synced) return;
  const values = TEMPLATES.map((t) => [t.slug, t.premium ? 1 : 0]);
  await query('INSERT IGNORE INTO templates (slug, is_premium) VALUES ?', [values]);
  synced = true;
}

// Returns code templates merged with admin-controlled flags (premium / active) and live-site counts
export async function getTemplateList({ includeInactive = false } = {}) {
  let flags = {};
  let live = {};
  try {
    await sync();
    const [rows, counts] = await Promise.all([
      query('SELECT slug, is_premium, is_active FROM templates'),
      query('SELECT template_slug, COUNT(*) n FROM portfolios WHERE published_at IS NOT NULL GROUP BY template_slug'),
    ]);
    rows.forEach((r) => (flags[r.slug] = r));
    counts.forEach((c) => (live[c.template_slug] = Number(c.n)));
  } catch (e) {
    console.error('[folio] template flags unavailable:', e.message);
  }
  return TEMPLATES.map((t) => ({
    slug: t.slug,
    name: t.name,
    category: t.category,
    description: t.description,
    premium: flags[t.slug] ? !!flags[t.slug].is_premium : t.premium,
    active: flags[t.slug] ? !!flags[t.slug].is_active : true,
    published: live[t.slug] || 0,
  })).filter((t) => includeInactive || t.active);
}

export async function getTemplateFlags(slug) {
  const list = await getTemplateList({ includeInactive: true });
  return list.find((t) => t.slug === slug) || null;
}
