// Small string helpers shared by the block renderers. Everything user-typed goes through esc / safeUrl.
export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const nl = (s) => esc(s).replace(/\n/g, '<br>');
export const safeUrl = (u) => {
  const s = String(u ?? '').trim();
  if (!s || /^(javascript|vbscript|data:text)/i.test(s)) return '#';
  return esc(s);
};
export const ext = (u, force) => (force || /^https?:\/\//i.test(String(u || '')) ? ' target="_blank" rel="noopener"' : '');
export const btn = (text, href, variant = 'primary', newTab) =>
  text ? `<a class="pf-btn pf-btn-${variant}" href="${safeUrl(href)}"${ext(href, newTab)}>${esc(text)}</a>` : '';
export const h2 = (t) => (t ? `<h2 class="pf-h2 pf-title">${esc(t)}</h2>` : '');
export const list = (a) => (Array.isArray(a) ? a : []);
export const cols = (n, d) => Math.max(1, Math.min(6, Math.round(Number(n) || d)));
export const csv = (s) => String(s || '').split(',').map((t) => t.trim()).filter(Boolean);
export const json = (v) => esc(JSON.stringify(v));

export function hexToRgb(hex) {
  let h = String(hex || '').replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  if (Number.isNaN(n) || h.length !== 6) return [0, 0, 0];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function onColor(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? '#111418' : '#FFFFFF';
}
