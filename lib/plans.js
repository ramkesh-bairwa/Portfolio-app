import { one, query } from './db';
import { PERIODS } from './price';

const toPlan = (r) => ({
  id: r.id,
  name: r.name,
  price: Number(r.price),
  currency: r.currency,
  period: r.period,
  description: r.description,
  features: String(r.features || '').split('\n').map((f) => f.trim()).filter(Boolean),
  isPopular: !!r.is_popular,
  isActive: !!r.is_active,
  sortOrder: r.sort_order,
});

export async function listPlans({ includeInactive = false } = {}) {
  const rows = await query(`SELECT * FROM plans ${includeInactive ? '' : 'WHERE is_active = 1'} ORDER BY sort_order, price, id`);
  return rows.map(toPlan);
}

export async function getPlan(id, { activeOnly = false } = {}) {
  const r = await one(`SELECT * FROM plans WHERE id = ? ${activeOnly ? 'AND is_active = 1' : ''}`, [Number(id)]);
  return r ? toPlan(r) : null;
}

// Validates admin input; returns { error } or { values } ready for INSERT/UPDATE
export function cleanPlanInput(b) {
  const name = String(b.name || '').trim().slice(0, 60);
  const price = Number(b.price);
  const currency = String(b.currency || 'USD').trim().toUpperCase();
  const period = String(b.period || 'year');
  if (!name) return { error: 'Plan name is required.' };
  if (!Number.isFinite(price) || price < 0 || price > 99999999) return { error: 'Enter a valid price.' };
  if (!/^[A-Z]{3}$/.test(currency)) return { error: 'Currency must be a 3-letter code like USD or INR.' };
  if (!(period in PERIODS)) return { error: 'Pick a billing period.' };
  const features = (Array.isArray(b.features) ? b.features : String(b.features || '').split('\n'))
    .map((f) => String(f).trim())
    .filter(Boolean)
    .join('\n');
  return {
    values: {
      name,
      price: Math.round(price * 100) / 100,
      currency,
      period,
      description: String(b.description || '').trim().slice(0, 255),
      features,
      is_popular: b.isPopular ? 1 : 0,
      is_active: b.isActive === false ? 0 : 1,
      sort_order: Number.isFinite(Number(b.sortOrder)) ? Math.trunc(Number(b.sortOrder)) : 0,
    },
  };
}
