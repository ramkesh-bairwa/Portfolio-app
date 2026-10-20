// Safe to import from client components (no database access)
export const PERIODS = { month: 'per month', year: 'per year', once: 'one-time' };

export function formatPrice(amount, currency = 'USD') {
  const n = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: Number.isInteger(n) ? 0 : 2 }).format(n);
  } catch {
    return `${currency} ${n}`;
  }
}
