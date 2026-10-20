// Safe to import from client components (no database access)
export const PERIODS = { month: 'per month', year: 'per year', once: 'one-time' };

export const DEFAULT_INR_RATE = 88;

// Rupee amount for a price in another currency, e.g. "₹6,952" for $79 at 88. Empty when not needed.
export function inrHint(amount, currency, rate) {
  if (currency === 'INR' || !(Number(rate) > 0)) return '';
  if (currency !== 'USD') return '';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(Number(amount) * Number(rate)));
}

export function formatPrice(amount, currency = 'USD') {
  const n = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: Number.isInteger(n) ? 0 : 2 }).format(n);
  } catch {
    return `${currency} ${n}`;
  }
}
