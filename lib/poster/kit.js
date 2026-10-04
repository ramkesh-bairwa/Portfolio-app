// Building blocks shared by every poster layout: palettes, element makers and the text stacker.
import { img } from '../blocks';

// deep = a strong colour that reads on white; ink = dark text for light panels
export const PALETTES = {
  royal: { bg: '#0B1F4D', bg2: '#1E40AF', primary: '#FACC15', accent: '#38BDF8', text: '#FFFFFF', soft: '#C7D2FE', card: '#FFFFFF', ink: '#0B1F4D', deep: '#1E40AF' },
  festive: { bg: '#5B0A1A', bg2: '#8B1E2D', primary: '#F5C542', accent: '#FF9F1C', text: '#FFF4D6', soft: '#F3D9A4', card: '#FFF8E7', ink: '#4A0814', deep: '#8B1E2D' },
  saffron: { bg: '#E85D04', bg2: '#FFB703', primary: '#FFF3B0', accent: '#7A1C00', text: '#FFFFFF', soft: '#FFE8CC', card: '#FFF7ED', ink: '#5C1A00', deep: '#C2410C' },
  ocean: { bg: '#03396C', bg2: '#0E7490', primary: '#22D3EE', accent: '#FDE047', text: '#FFFFFF', soft: '#BAE6FD', card: '#FFFFFF', ink: '#03396C', deep: '#0E7490' },
  sky: { bg: '#E0F2FE', bg2: '#BAE6FD', primary: '#0284C7', accent: '#F97316', text: '#0C2D48', soft: '#33607F', card: '#FFFFFF', ink: '#0C2D48', deep: '#0284C7' },
  rose: { bg: '#FFE4EC', bg2: '#FBCFE8', primary: '#BE185D', accent: '#F59E0B', text: '#4A0E2B', soft: '#86385C', card: '#FFFFFF', ink: '#4A0E2B', deep: '#BE185D' },
  night: { bg: '#0F172A', bg2: '#312E81', primary: '#FBBF24', accent: '#A78BFA', text: '#F8FAFC', soft: '#CBD5E1', card: '#FFFFFF', ink: '#0F172A', deep: '#4338CA' },
  mono: { bg: '#F5F5F4', bg2: '#E7E5E4', primary: '#111111', accent: '#DC2626', text: '#111111', soft: '#57534E', card: '#FFFFFF', ink: '#111111', deep: '#111111' },
  green: { bg: '#14532D', bg2: '#15803D', primary: '#BEF264', accent: '#FDE047', text: '#FFFFFF', soft: '#D1FAE5', card: '#FFFFFF', ink: '#14532D', deep: '#15803D' },
  tricolour: { bg: '#FFFFFF', bg2: '#FFF1E0', primary: '#FF7A00', accent: '#138808', text: '#0B1F4D', soft: '#334155', card: '#FFFFFF', ink: '#0B1F4D', deep: '#E86A00' },
  purple: { bg: '#3B0764', bg2: '#7E22CE', primary: '#F0ABFC', accent: '#FDE047', text: '#FFFFFF', soft: '#E9D5FF', card: '#FFFFFF', ink: '#3B0764', deep: '#7E22CE' },
  pink: { bg: '#FFF1F7', bg2: '#FFD6E8', primary: '#EC4899', accent: '#8B5CF6', text: '#3F1D38', soft: '#7A4A6E', card: '#FFFFFF', ink: '#3F1D38', deep: '#DB2777' },
  neon: { bg: '#0A0A1A', bg2: '#1E1B4B', primary: '#22F5D0', accent: '#FF2E97', text: '#FFFFFF', soft: '#A5B4FC', card: '#FFFFFF', ink: '#0A0A1A', deep: '#7C3AED' },
  mint: { bg: '#ECFDF5', bg2: '#D1FAE5', primary: '#059669', accent: '#0EA5E9', text: '#064E3B', soft: '#3F6F5E', card: '#FFFFFF', ink: '#064E3B', deep: '#059669' },
  earth: { bg: '#3E2723', bg2: '#6D4C41', primary: '#FFB74D', accent: '#A5D6A7', text: '#FFF8E1', soft: '#D7CCC8', card: '#FFF8E1', ink: '#3E2723', deep: '#6D4C41' },
  red: { bg: '#B91C1C', bg2: '#7F1D1D', primary: '#FFFFFF', accent: '#FDE047', text: '#FFFFFF', soft: '#FECACA', card: '#FFFFFF', ink: '#7F1D1D', deep: '#B91C1C' },
  sunset: { bg: '#FF5F6D', bg2: '#FFC371', primary: '#FFFFFF', accent: '#4A044E', text: '#FFFFFF', soft: '#FFF1E6', card: '#FFFFFF', ink: '#4A044E', deep: '#E11D48' },
  sale: { bg: '#FACC15', bg2: '#F97316', primary: '#DC2626', accent: '#111111', text: '#111111', soft: '#3F3F46', card: '#FFFFFF', ink: '#111111', deep: '#DC2626' },
  holi: { bg: '#7C3AED', bg2: '#EC4899', primary: '#FDE047', accent: '#22D3EE', text: '#FFFFFF', soft: '#FCE7F3', card: '#FFFFFF', ink: '#4C1D95', deep: '#7C3AED' },
  coral: { bg: '#FF6B4A', bg2: '#FFB199', primary: '#1F1235', accent: '#FFE66D', text: '#FFFFFF', soft: '#FFE4DC', card: '#FFFFFF', ink: '#1F1235', deep: '#E8553B' },
  xmas: { bg: '#0F5132', bg2: '#7F1D1D', primary: '#FDE68A', accent: '#FFFFFF', text: '#FFFFFF', soft: '#D1FAE5', card: '#FFFFFF', ink: '#0F5132', deep: '#B91C1C' },
  peacock: { bg: '#064E63', bg2: '#1E3A8A', primary: '#FBBF24', accent: '#34D399', text: '#FFFFFF', soft: '#BAE6FD', card: '#FFFFFF', ink: '#064E63', deep: '#0E7490' },
  certificate: { bg: '#FFFDF5', bg2: '#F5E9C8', primary: '#A87B1E', accent: '#0B1F4D', text: '#0B1F4D', soft: '#5B5B6B', card: '#FFFFFF', ink: '#0B1F4D', deep: '#A87B1E' },
};

export const eid = () => 'e' + Math.random().toString(36).slice(2, 10);

export const textEl = (text, x, y, w, h, o = {}) => ({
  id: eid(), type: 'text', x, y, w, h, rot: 0, opacity: 1, text,
  font: 'Poppins', size: 40, weight: '400', italic: false, underline: false, strike: false,
  align: 'center', color: '#111111', lh: 1.2, ls: 0, upper: false, ...o,
});
export const shapeEl = (shape, x, y, w, h, o = {}) => ({
  id: eid(), type: 'shape', shape, x, y, w, h, rot: 0, opacity: 1, fill: '#111111', fill2: '', gradAngle: 135, stroke: '', strokeW: 0, radius: 0, ...o,
});
export const imageEl = (src, x, y, w, h, o = {}) => ({
  id: eid(), type: 'image', src, x, y, w, h, rot: 0, opacity: 1, cropX: 50, cropY: 50, zoom: 1, radius: 0, mask: 'none',
  filters: {}, stroke: '', strokeW: 0, ...o,
});
export const iconEl = (icon, x, y, w, h, o = {}) => ({ id: eid(), type: 'icon', icon, x, y, w, h, rot: 0, opacity: 1, color: '#111111', strokeW: 2, ...o });

export const r = Math.round;

// True for light colours (dark text reads on them)
export function isLight(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const [R, G, B] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * R + 0.587 * G + 0.114 * B > 160;
}

// Rough text height: enough to place things; users adjust boxes in the editor
export function estimate(it, w, k) {
  const size = it.size * k;
  if (it.kind === 'emoji') return size * 1.3;
  if (it.kind === 'pill') return size * 2.4;
  // outlined text is wider by the outline on both sides
  const per = size * (it.wide ?? 0.58) * (it.upper ? 1.1 : 1) + size * (it.ls || 0) + (it.el?.strokeW || 0) * 1.6;
  const cpl = Math.max(1, Math.floor((w * 0.94) / per));
  // Hindi vowel signs and viramas sit on other letters, so they don't add width
  const len = (l) => l.replace(/[\u0900-\u0903\u093A-\u094F\u0951-\u0957\u0962\u0963]/g, '').length;
  const lines = String(it.text).split('\n').reduce((a, l) => a + Math.max(1, Math.ceil(len(l) / cpl)), 0);
  return lines * size * (it.lh || 1.2) + size * 0.12;
}

// Stack items top to bottom inside box, shrinking everything until it fits
export function stack(items, box, { align = 'center', valign = 'center' } = {}) {
  const list = items.filter((it) => it && it.text);
  let k = 1;
  let hs = [];
  let total = 0;
  for (let i = 0; i < 14; i++) {
    hs = list.map((it) => estimate(it, box.w, k));
    total = hs.reduce((a, h, j) => a + h + (j < list.length - 1 ? (list[j].gap ?? 0) * k : 0), 0);
    if (total <= box.h) break;
    k *= 0.9;
  }
  let y = valign === 'top' ? box.y : box.y + Math.max(0, (box.h - total) / 2);
  const out = [];
  list.forEach((it, j) => {
    const h = hs[j];
    const size = it.size * k;
    if (it.kind === 'pill') {
      const deva = /[\u0900-\u097F]/.test(it.text);
      const glyphs = it.text.replace(/[\u0900-\u0903\u093A-\u094F\u0951-\u0957\u0962\u0963]/g, '').length;
      const per = deva ? 0.78 : 0.62;
      // a long label shrinks so it stays on one line inside its pill
      const fs = Math.min(size, box.w / (glyphs * per + 2.6));
      const pw = Math.min(box.w, glyphs * fs * per + fs * 2.6);
      const px = align === 'left' ? box.x : box.x + (box.w - pw) / 2;
      out.push(shapeEl('rounded', r(px), r(y), r(pw), r(h), { fill: it.fill, radius: r(h / 2), name: 'Button' }));
      out.push(textEl(it.text, r(px), r(y + (h - fs * 1.25) / 2), r(pw), r(fs * 1.25), { font: it.font, size: r(fs), weight: it.weight || '600', color: it.color, align: 'center', lh: 1.25 }));
    } else {
      out.push(textEl(it.text, r(box.x), r(y), r(box.w), r(h), {
        font: it.font || 'Poppins', size: r(size), weight: it.weight || '400', color: it.color, align: it.kind === 'emoji' ? 'center' : align,
        lh: it.kind === 'emoji' ? 1.2 : it.lh || 1.2, ls: it.ls || 0, upper: !!it.upper, italic: !!it.italic,
        ...(it.shadow && { shadow: it.shadow }),
        ...(it.el || {}),
      }));
    }
    y += h + (it.gap ?? 0) * k;
  });
  return out;
}

// Standard text items from a category; t = layout's type settings, s = size unit
export function items(c, t, s, { emoji = true, scale = 1 } = {}) {
  const z = (n) => n * s * scale * (t.boost || 1);
  return [
    emoji && { kind: 'emoji', text: c.emoji, size: z(t.emojiSize || 16), gap: z(2) },
    { kind: 'text', text: c.kicker, size: z(3.6), font: t.kickerFont || t.bodyFont, weight: '600', color: t.kicker, upper: !t.hi, ls: t.hi ? 0 : 0.18, wide: 0.6, gap: z(1.6) },
    { kind: 'text', text: c.title, size: z(t.titleSize || 11), font: t.titleFont, weight: t.titleWeight || '700', color: t.title, upper: !!t.titleUpper && !t.hi, wide: t.titleWide, lh: t.titleLh || 1.08, gap: z(2.4), shadow: t.titleShadow },
    { kind: 'text', text: c.sub, size: z(4.2), font: t.bodyFont, weight: '400', color: t.text, italic: !!t.subItalic, lh: 1.35, gap: z(2.4) },
    c.details.length && { kind: 'text', text: c.details.join('\n'), size: z(3.8), font: t.bodyFont, weight: '600', color: t.text, lh: 1.45, gap: z(3) },
    c.cta && { kind: 'pill', text: c.cta, size: z(3.4), font: t.bodyFont, fill: t.pillFill, color: t.pillText },
  ];
}

export const solid = (color) => ({ type: 'solid', color, from: color, to: color, angle: 135, image: '', overlay: 0 });
export const grad = (from, to, angle = 135) => ({ type: 'gradient', color: from, from, to, angle, image: '', overlay: 0 });

// Very wide sizes (hoardings, leaderboard ads, covers): emoji | headline | details
export function strip(c, W, H, t, bg, deco = [], { person = false } = {}) {
  const s = H / 100;
  const pad = H * 0.12;
  const els = [...deco];
  els.push(textEl(c.emoji, r(pad), r(H * 0.2), r(H * 0.75), r(H * 0.6), { size: r(H * 0.45), lh: 1.2 }));
  const mid = { x: pad + H * 0.9, y: pad, w: W * 0.62 - H * 0.9 - pad, h: H - 2 * pad };
  els.push(...stack([
    { kind: 'text', text: c.kicker, size: 7 * s, font: t.bodyFont, weight: '600', color: t.kicker, upper: !t.hi, ls: t.hi ? 0 : 0.15, gap: 2 * s },
    { kind: 'text', text: c.title, size: 24 * s, font: t.titleFont, weight: t.titleWeight || '700', color: t.title, upper: !!t.titleUpper && !t.hi, wide: t.titleWide, lh: 1.05, gap: 3 * s },
    { kind: 'text', text: c.sub, size: 8 * s, font: t.bodyFont, color: t.text, lh: 1.3 },
  ], mid, { align: 'left' }));
  // photo layouts keep a cut-out person frame at the right end
  const pw = person ? H * 0.8 : 0;
  const right = { x: W * 0.64, y: pad, w: W * 0.36 - pad - pw, h: H - 2 * pad };
  if (person) els.push(imageEl('', Math.round(W - pw - pad * 0.3), Math.round(H * 0.06), Math.round(pw), Math.round(H * 0.94), { placeholder: 'person', cutout: true, slot: c.x?.photo, phColor: t.title === '#FFFFFF' ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.28)', outline: { width: Math.max(2, Math.round(H * 0.012)), color: '#FFFFFF' } }));
  els.push(...stack([
    c.details.length && { kind: 'text', text: c.details.join('\n'), size: 8 * s, font: t.bodyFont, weight: '600', color: t.text, lh: 1.35, gap: 4 * s },
    c.cta && { kind: 'pill', text: c.cta, size: 7.5 * s, font: t.bodyFont, fill: t.pillFill, color: t.pillText },
  ], right));
  return { bg, elements: els };
}

export const photo = (c, n, w, h) => img(`${c.key}-${n}`, Math.min(1600, r(w)), Math.min(1600, r(h)));

export const graphicEl = (graphic, x, y, w, h, o = {}) => ({ id: eid(), type: 'graphic', graphic, x, y, w, h, rot: 0, opacity: 1, colors: [], seed: 7, ...o });
// An empty photo frame people tap to fill: kind = person | logo | photo
export const slotEl = (kind, x, y, w, h, o = {}) => imageEl('', x, y, w, h, { placeholder: kind, ...o });
