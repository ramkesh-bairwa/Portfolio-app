// Public portfolio URLs: http://host/<slug>
const RESERVED = new Set([
  'admin', 'api', 'builder', 'resume', 'resumes', 'portfolios', 'posters', 'poster', 'plans', 'dashboard', 'login', 'logout', 'register', 'uploads', 'templates', 'settings',
  'account', 'help', 'about', 'privacy', 'terms', 'static', 'public', 'assets', 'favicon.ico', 'robots.txt', 'sitemap.xml',
]);

export const SLUG_RULE = 'Use 3–40 lowercase letters, numbers or hyphens.';

export function toSlug(s) {
  return String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}

export function slugError(slug) {
  if (!/^[a-z0-9](?:[a-z0-9-]{1,38})[a-z0-9]$/.test(slug)) return SLUG_RULE;
  if (RESERVED.has(slug)) return `"${slug}" is reserved. Pick another name.`;
  return null;
}
