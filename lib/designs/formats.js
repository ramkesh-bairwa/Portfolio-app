// The ten design formats. Each draws a full 1600×1200 shot from a theme `t` built in index.js.
import { art } from './art';
import { circ, ell, fit, g, line, mix, onColor, path, poly, rect, textWidth, txt } from './core';

export const W = 1600;
export const H = 1200;

// ---------- type ----------
function hd(t, x, y, s, size, o = {}) {
  return txt(x, y, s, {
    font: t.ty.h, weight: t.ty.hw, size, fill: o.fill || t.pal.ink, upper: t.ty.up && !o.noUp,
    ls: o.ls ?? (t.ty.ls || 0) * (size / 40), italic: t.ty.italic && o.italic !== false, anchor: o.anchor, op: o.op, t: o.t,
  });
}
const tx = (t, x, y, s, size, o = {}) => txt(x, y, s, { font: o.font || t.ty.b, weight: o.weight || 400, size, fill: o.fill || t.pal.muted, anchor: o.anchor, op: o.op, ls: o.ls, upper: o.upper, t: o.t });

// Headline block from a top edge; returns its height so callers can stack below it.
function heading(t, x, y, text, maxW, maxSize, maxLines = 3, o = {}) {
  const f = fit(text, t.ty.h, maxW, maxSize, maxLines, { upper: t.ty.up && !o.noUp, minSize: 16, ls: (t.ty.ls || 0) * (maxSize / 40) });
  const lh = f.size * (o.lh || 1.06);
  return { svg: f.lines.map((l, i) => hd(t, x, y + f.size * 0.84 + i * lh, l, f.size, o)).join(''), h: f.lines.length * lh, size: f.size };
}
function para(t, x, y, text, maxW, size, maxLines = 3, o = {}) {
  const lines = fit(text, o.font || t.ty.b, maxW, size, 99, { minSize: size }).lines;
  const shown = lines.slice(0, maxLines);
  if (lines.length > maxLines) shown[maxLines - 1] = shown[maxLines - 1].replace(/\s*\S+$/, '…');
  const lh = size * (o.lh || 1.5);
  return { svg: shown.map((l, i) => tx(t, x, y + size + i * lh, l, size, o)).join(''), h: shown.length * lh };
}
// Grey "text" lines for long copy
const bars = (x, y, w, n, gap, col, h = 6) => Array.from({ length: n }, (_, i) => rect(x, y + i * gap, i === n - 1 ? w * 0.62 : w * (0.9 + ((i * 37) % 10) / 100), h, col, { r: h / 2 })).join('');

// ---------- small parts ----------
const ICON = {
  search: 'M9 3a6 6 0 1 0 0 12A6 6 0 1 0 9 3zM13.5 13.5L18 18', bag: 'M4 7h12l-1 11H5zM7 7a3 3 0 0 1 6 0', heart: 'M10 17s-7-4.3-7-9a4 4 0 0 1 7-2.5A4 4 0 0 1 17 8c0 4.7-7 9-7 9z',
  user: 'M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM3 18a7 7 0 0 1 14 0', menu: 'M3 6h14M3 10h14M3 14h10', arrow: 'M3 10h13M11 5l5 5-5 5', back: 'M17 10H4M9 5l-5 5 5 5',
  home: 'M3 9l7-6 7 6v8H3z', grid: 'M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z', bell: 'M5 14V9a5 5 0 0 1 10 0v5l2 2H3zM8 18h4', check: 'M4 10l4 4 8-8',
  plus: 'M10 4v12M4 10h12', minus: 'M4 10h12', chart: 'M3 17V9M8 17V4M13 17v-6M18 17V7', cog: 'M10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4',
  truck: 'M2 5h10v9H2zM12 8h4l2 3v3h-6M5 16a1.5 1.5 0 1 0 0-.1M15 16a1.5 1.5 0 1 0 0-.1', share: 'M15 6a2 2 0 1 0 0-.1M5 10a2 2 0 1 0 0-.1M15 14a2 2 0 1 0 0-.1M7 9l6-2.5M7 11l6 2.5', chat: 'M3 4h14v10H8l-4 3v-3H3z',
};
const icon = (name, x, y, s, col, sw = 1.8) => path(ICON[name], 'none', { stroke: col, sw: sw * (20 / s), cap: 'round', join: 'round', t: `translate(${x} ${y}) scale(${s / 20})` });
const starPts = (cx, cy, r) => Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr = i % 2 ? r * 0.45 : r; return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]; });
const stars = (x, y, s, fill, n = 5) => Array.from({ length: 5 }, (_, i) => poly(starPts(x + s / 2 + i * (s + 3), y + s / 2, s / 2), i < n ? fill : mix(fill, '#FFFFFF', 0.6))).join('');
const pill = (t, x, y, label, o = {}) => {
  const size = o.size || 13, w = textWidth(label, size, t.ty.b, o.upper) + 28 + (o.upper ? label.length * 1.2 : 0);
  return { svg: rect(x, y, w, size + 16, o.bg || mix(t.pal.accent, t.pal.bg, 0.86), { r: (size + 16) / 2 }) + tx(t, x + w / 2, y + size + 4, label, size, { fill: o.fill || t.pal.accent, weight: 600, anchor: 'middle', upper: o.upper, ls: o.upper ? 1.2 : 0 }), w };
};

function btn(t, x, y, label, o = {}) {
  const up = t.mood === 'luxe';
  const size = o.size || (up ? 13 : 15), h = o.h || 50, pad = o.pad || 28, ls = up ? 2 : 0;
  const lw = textWidth(label, size, t.ty.b, up, ls);
  const w = o.w || lw + pad * 2 + (o.arrow ? 26 : 0);
  const solid = o.solid !== false;
  const bg = o.bg || t.pal.accent;
  const fg = o.fg || (solid ? onColor(bg) : t.pal.ink);
  const cx = x + w / 2 - (o.arrow ? 13 : 0);
  return {
    svg: rect(x, y, w, h, solid ? bg : 'none', { r: Math.min(t.r, h / 2), stroke: solid ? '' : o.stroke || t.pal.ink, sw: solid ? '' : 1.5 })
      + tx(t, cx, y + h / 2 + size * 0.36, label, size, { fill: fg, weight: 600, anchor: 'middle', upper: up, ls })
      + (o.arrow ? icon('arrow', cx + lw / 2 + 10, y + h / 2 - 8, 16, fg, 2) : ''),
    w,
  };
}

function mark(t, cx, cy, s, fill, ink) {
  const L = t.brand.word[0];
  const letter = (col, k = 0.56) => txt(cx, cy + s * k * 0.36, L, { font: t.ty.h, weight: Math.max(t.ty.hw, 600), size: s * k, fill: col, anchor: 'middle' });
  switch (t.markKind) {
    case 0: return circ(cx, cy, s / 2, fill) + letter(ink);
    case 1: return rect(cx - s / 2, cy - s / 2, s, s, fill, { r: s * 0.28 }) + letter(ink);
    case 2: return poly([[cx, cy - s / 2], [cx + s / 2, cy], [cx, cy + s / 2], [cx - s / 2, cy]], fill) + letter(ink, 0.42);
    case 3: return path(`M${cx - s / 2} ${cy + s / 2}L${cx - s / 2} ${cy}A${s / 2} ${s / 2} 0 0 1 ${cx + s / 2} ${cy}L${cx + s / 2} ${cy + s / 2}Z`, fill) + letter(ink, 0.5);
    case 4: return circ(cx, cy, s * 0.44, 'none', { stroke: fill, sw: s * 0.1 }) + letter(fill, 0.5);
    default: return circ(cx - s * 0.17, cy, s * 0.33, fill) + circ(cx + s * 0.17, cy, s * 0.33, fill, { op: 0.55 });
  }
}
// Logo lockup centred vertically on y
function logo(t, x, y, size, o = {}) {
  const up = t.mood === 'luxe' || t.mood === 'bold';
  const ts = size * 0.8, ls = up ? ts * 0.14 : -ts * 0.02;
  const tw = textWidth(t.brand.word, ts, t.ty.h, up, ls);
  const total = o.noMark ? tw : size * 1.38 + tw;
  const x0 = o.anchor === 'middle' ? x - total / 2 : x;
  const mf = o.markFill || t.pal.accent;
  return {
    svg: (o.noMark ? '' : mark(t, x0 + size / 2, y, size, mf, o.markInk || onColor(mf)))
      + txt(x0 + (o.noMark ? 0 : size * 1.38), y + ts * 0.35, t.brand.word, { font: t.ty.h, weight: Math.max(t.ty.hw, t.ty.h === 'impact' ? 400 : 600), size: ts, fill: o.fill || t.pal.ink, upper: up, ls }),
    w: total,
  };
}

function glow(t, bg) {
  t.glows = t.glows || {};
  if (!t.glows[bg]) t.glows[bg] = t.c.rg([[0, mix(bg, '#FFFFFF', t.dark ? 0.1 : 0.6)], [1, bg, 0]]);
  return t.glows[bg];
}
// Product "photo": soft backdrop, glow, floor shadow and an illustration
function tile(t, x, y, w, h, kind, o = {}) {
  const bg = o.bg || t.pal.soft;
  const s = Math.min(w, h) * (o.scale || 0.68);
  return rect(x, y, w, h, bg, { r: o.r ?? t.r * 1.3 }) + ell(x + w / 2, y + h * 0.48, w * 0.44, h * 0.44, glow(t, bg))
    + art(t.c, kind, t.k, x + w / 2 + (o.dx || 0), y + h / 2 + (o.dy || 0), s);
}

function scene(t) {
  const { c, pal } = t;
  const base = t.dark ? mix(pal.bg, '#000000', 0.2) : mix(pal.soft, pal.accent, 0.07);
  return rect(0, 0, W, H, c.lg([[0, mix(base, '#FFFFFF', t.dark ? 0.05 : 0.4)], [1, base]], 0, 0, 1, 1))
    + circ(t.flip ? W * 0.12 : W * 0.88, H * 0.1, 560, c.rg([[0, pal.accent, 0.2], [1, pal.accent, 0]]))
    + circ(t.flip ? W * 0.9 : W * 0.08, H * 0.96, 600, c.rg([[0, pal.accent2, 0.16], [1, pal.accent2, 0]]));
}

function browser(t, x, y, w, h, inner) {
  const bar = 46;
  const dom = `${t.brand.word.toLowerCase()}.com`;
  return rect(x, y, w, h, t.pal.bg, { r: 16, f: 'sh' })
    + rect(x, y, w, bar + 16, t.dark ? mix(t.pal.bg, '#FFFFFF', 0.08) : '#EEF0F3', { r: 16 }) + rect(x, y + bar, w, 16, t.pal.bg)
    + ['#FF5F57', '#FEBC2E', '#28C840'].map((col, i) => circ(x + 26 + i * 20, y + bar / 2, 6, col)).join('')
    + rect(x + w / 2 - 180, y + 11, 360, 24, t.dark ? mix(t.pal.bg, '#FFFFFF', 0.14) : '#FFFFFF', { r: 8 })
    + tx(t, x + w / 2, y + 28, dom, 12, { anchor: 'middle', fill: t.dark ? '#B8BCC6' : '#6B7280' })
    + g(inner(w, h - bar), { t: `translate(${x} ${y + bar})`, clip: t.c.clip(rect(0, -20, w, h - bar + 20, '#000', { r: 16 })) });
}

function phone(t, x, y, w, h, inner) {
  const b = 12, iw = w - b * 2, ih = h - b * 2;
  return rect(x, y, w, h, '#0E0F13', { r: 54, f: 'sh' }) + rect(x + 3, y + 3, w - 6, h - 6, 'none', { r: 51, stroke: '#3A3D46', sw: 2 })
    + g(rect(0, 0, iw, ih, t.pal.bg) + statusBar(t, iw) + inner(iw, ih), { t: `translate(${x + b} ${y + b})`, clip: t.c.clip(rect(0, 0, iw, ih, '#000', { r: 43 })) })
    + rect(x + w / 2 - 50, y + b + 10, 100, 28, '#0E0F13', { r: 14 });
}
const statusBar = (t, w) => tx(t, 34, 34, '9:41', 14, { fill: t.pal.ink, weight: 700 })
  + rect(w - 52, 24, 22, 11, 'none', { r: 3, stroke: t.pal.ink, sw: 1.4 }) + rect(w - 50, 26, 15, 7, t.pal.ink, { r: 1.5 })
  + [0, 1, 2, 3].map((i) => rect(w - 86 + i * 5, 32 - i * 3, 3, 4 + i * 3, t.pal.ink, { r: 1 })).join('');

function nav(t, w, h = 84) {
  const L = logo(t, 48, h / 2, 30);
  let x = Math.max(L.w + 130, w * 0.34);
  const links = t.ind.cats.slice(0, 4).map((cat) => { const s = tx(t, x, h / 2 + 5, cat, 15, { fill: t.pal.ink, weight: 500 }); x += textWidth(cat, 15, t.ty.b) + 38; return s; }).join('');
  const icons = ['bag', 'heart', 'search'].map((n, i) => icon(n, w - 68 - i * 46, h / 2 - 10, 20, t.pal.ink)).join('');
  return rect(0, 0, w, h, t.pal.bg) + L.svg + links + icons + circ(w - 46, h / 2 - 11, 9, t.pal.accent) + tx(t, w - 46, h / 2 - 7, '2', 11, { fill: onColor(t.pal.accent), weight: 700, anchor: 'middle' })
    + line(0, h, w, h, t.pal.line, 1);
}

function productCard(t, x, y, w, i, o = {}) {
  const [name, price] = t.items[i % t.items.length];
  const th = o.h || w * 0.82;
  return tile(t, x, y, w, th, t.arts[i % t.arts.length], { bg: o.bg }) + circ(x + w - 26, y + 26, 16, t.pal.surface) + icon('heart', x + w - 34, y + 18, 16, t.pal.ink)
    + tx(t, x + 2, y + th + 30, name, o.size || 17, { fill: t.pal.ink, weight: 600 }) + tx(t, x + 2, y + th + 56, price, o.size ? o.size - 1 : 16, { fill: t.pal.muted })
    + (o.rating !== false ? stars(x + w - 84, y + th + 18, 13, '#F5A524', 4 + (i % 2)) : '');
}

// ---------- 1. landing page ----------
function landing(t) {
  return scene(t) + browser(t, 110, 80, 1380, 1040, (w, h) => {
    let s = rect(0, 0, w, h, t.pal.bg) + nav(t, w);
    const tx0 = t.flip ? 740 : 64, ix = t.flip ? 64 : 720;
    const k = pill(t, tx0, 140, t.ind.kicker, { upper: t.mood === 'luxe' || t.mood === 'bold' });
    s += k.svg;
    const hh = heading(t, tx0, 196, t.head, 590, 78, 3);
    s += hh.svg;
    const p = para(t, tx0, 214 + hh.h, t.ind.sub, 520, 18, 3);
    s += p.svg;
    const by = 250 + hh.h + p.h;
    const b1 = btn(t, tx0, by, t.ind.cta, { arrow: true });
    s += b1.svg + btn(t, tx0 + b1.w + 14, by, 'Learn more', { solid: false }).svg;
    const ty = by + 92;
    s += [0, 1, 2, 3].map((i) => circ(tx0 + 20 + i * 28, ty, 20, [t.pal.accent, t.pal.accent2, mix(t.pal.accent, t.pal.ink, 0.4), t.pal.soft][i], { stroke: t.pal.bg, sw: 3 })).join('')
      + stars(tx0 + 140, ty - 18, 15, '#F5A524') + tx(t, tx0 + 140, ty + 18, 'Loved by 120,000+ customers', 14);
    s += tile(t, ix, 120, 596, 500, t.arts[0], { scale: 0.74 });
    // floating cards
    const fx = ix - 30, fy = 540;
    s += rect(fx, fy, 250, 92, t.pal.surface, { r: 16, f: 'sm' }) + tile(t, fx + 14, fy + 14, 64, 64, t.arts[1 % t.arts.length], { r: 12, scale: 0.8 })
      + tx(t, fx + 92, fy + 40, t.items[1][0], 15, { fill: t.pal.ink, weight: 600 }) + tx(t, fx + 92, fy + 64, t.items[1][1], 14, { fill: t.pal.accent, weight: 700 });
    s += rect(ix + 430, 146, 140, 56, t.pal.surface, { r: 28, f: 'sm' }) + poly(starPts(ix + 462, 174, 12), '#F5A524') + tx(t, ix + 484, 181, '4.9 / 5', 16, { fill: t.pal.ink, weight: 700 });
    // product row
    const ry = 650;
    s += hd(t, 64, ry + 30, t.mood === 'luxe' ? 'The edit' : 'Bestsellers', 30, { noUp: false }) + tx(t, w - 64, ry + 26, 'View all →', 15, { anchor: 'end', fill: t.pal.ink, weight: 600 });
    const cw = (w - 128 - 3 * 24) / 4;
    for (let i = 0; i < 4; i++) s += productCard(t, 64 + i * (cw + 24), ry + 56, cw, i + 2, { h: 184 });
    return s;
  });
}

// ---------- 2. mobile app ----------
const LIST_TITLE = { restaurant: 'Your order', coffee: 'Your order', fintech: 'Activity', saas: 'Projects', travel: 'Saved trips', fitness: 'This week', healthcare: 'Appointments', education: 'My courses', music: 'Up next', gaming: 'Library', realestate: 'Shortlist', automotive: 'Garage' };
function mobile(t) {
  const pw = 372, ph = 800, gap = 52, x0 = (W - pw * 3 - gap * 2) / 2;
  let s = scene(t);
  const hh = heading(t, 0, 70, t.head, 1100, 54, 1, { anchor: 'middle' });
  s += g(hh.svg, { t: `translate(${W / 2} 0)` }) + tx(t, W / 2, 106 + hh.h, `${t.brand.full} · iOS & Android app`, 18, { anchor: 'middle' });
  const ys = t.flip ? [250, 300, 250] : [300, 250, 300];
  const screens = [appHome, appDetail, appList];
  screens.forEach((fn, i) => { s += phone(t, x0 + i * (pw + gap), ys[i], pw, ph, (w, h) => fn(t, w, h)); });
  return s;
}
function appHome(t, w) {
  let s = tx(t, 24, 84, 'Good morning,', 15) + hd(t, 24, 116, t.brand.word, 28, { noUp: true }) + circ(w - 44, 98, 22, t.pal.soft) + icon('bell', w - 54, 88, 20, t.pal.ink);
  s += rect(24, 140, w - 48, 50, t.pal.soft, { r: 25 }) + icon('search', 42, 155, 20, t.pal.muted) + tx(t, 74, 171, `Search ${t.ind.cats[0].toLowerCase()}…`, 15);
  s += rect(24, 210, w - 48, 170, t.pal.accent, { r: 24 }) + circ(w - 70, 260, 110, '#FFFFFF', { op: 0.12 });
  const bh = heading(t, 44, 236, t.ind.items[0][0], 160, 26, 2, { fill: onColor(t.pal.accent), noUp: true });
  s += tx(t, 44, 234, t.ind.kicker.split('·')[0].trim(), 12, { fill: onColor(t.pal.accent), op: 0.8, upper: true, ls: 1 }) + bh.svg
    + rect(44, 320, 104, 36, t.pal.surface, { r: 18 }) + tx(t, 96, 343, t.ind.cta.split(' ')[0], 13, { fill: t.pal.ink, weight: 700, anchor: 'middle' })
    + art(t.c, t.arts[0], t.k, w - 100, 296, 150);
  let cx = 24;
  s += t.ind.cats.slice(0, 4).map((cat, i) => { const p = pill(t, cx, 400, cat, { bg: i === 0 ? t.pal.ink : t.pal.soft, fill: i === 0 ? t.pal.bg : t.pal.ink }); cx += p.w + 8; return p.svg; }).join('');
  s += hd(t, 24, 474, 'Popular', 20, { noUp: true }) + tx(t, w - 24, 474, 'See all', 13, { anchor: 'end', fill: t.pal.accent, weight: 600 });
  const cw = (w - 64) / 2;
  s += [0, 1].map((i) => productCard(t, 24 + i * (cw + 16), 494, cw, i + 1, { h: 128, size: 14, rating: false })).join('');
  s += rect(16, 700, w - 32, 64, t.pal.ink, { r: 32 }) + ['home', 'grid', 'heart', 'user'].map((n, i) => (i === 0 ? circ(56 + i * ((w - 112) / 3), 732, 22, t.pal.accent) : '') + icon(n, 46 + i * ((w - 112) / 3), 722, 20, i === 0 ? onColor(t.pal.accent) : t.pal.bg)).join('');
  return s;
}
function appDetail(t, w, h) {
  const [name, price] = t.items[0];
  let s = tile(t, 0, 0, w, 420, t.arts[0], { r: 0, scale: 0.62, dy: 20 }) + statusBar(t, w);
  s += circ(44, 82, 22, t.pal.surface) + icon('back', 34, 72, 20, t.pal.ink) + circ(w - 44, 82, 22, t.pal.surface) + icon('heart', w - 54, 72, 20, t.pal.accent);
  s += [0, 1, 2].map((i) => rect(w / 2 - 30 + i * 22, 392, i === 0 ? 24 : 10, 8, i === 0 ? t.pal.ink : t.pal.line, { r: 4 })).join('');
  s += rect(0, 400, w, h - 400, t.pal.bg, { r: 30 });
  s += hd(t, 24, 456, name, 26, { noUp: true }) + stars(24, 474, 14, '#F5A524') + tx(t, 116, 487, '4.9 (248)', 13);
  s += tx(t, w - 24, 460, price, 22, { anchor: 'end', fill: t.pal.accent, weight: 700 });
  s += para(t, 24, 504, t.ind.sub, w - 48, 14, 3).svg;
  s += tx(t, 24, 600, 'Options', 14, { fill: t.pal.ink, weight: 700 })
    + [t.pal.accent, t.pal.accent2, t.pal.ink, t.pal.soft].map((col, i) => circ(40 + i * 44, 634, 15, col, { stroke: i === 0 ? t.pal.bg : t.pal.line, sw: 2 }) + (i === 0 ? circ(40, 634, 20, 'none', { stroke: t.pal.ink, sw: 2 }) : '')).join('');
  s += rect(w - 132, 616, 108, 38, t.pal.soft, { r: 19 }) + icon('minus', w - 120, 625, 18, t.pal.ink) + tx(t, w - 78, 641, '1', 15, { fill: t.pal.ink, weight: 700, anchor: 'middle' }) + icon('plus', w - 56, 625, 18, t.pal.ink);
  s += btn(t, 24, 690, t.ind.cta, { w: w - 48, h: 58 }).svg;
  return s;
}
function appList(t, w) {
  let s = circ(44, 92, 22, t.pal.soft) + icon('back', 34, 82, 20, t.pal.ink) + hd(t, w / 2, 102, LIST_TITLE[t.ind.slug] || 'My bag', 22, { anchor: 'middle', noUp: true }) + icon('menu', w - 54, 82, 20, t.pal.ink);
  [1, 2, 3].forEach((i, r) => {
    const y = 140 + r * 118;
    const [name, price] = t.items[i % t.items.length];
    s += rect(24, y, w - 48, 102, t.pal.surface, { r: 20, stroke: t.pal.line, sw: 1 }) + tile(t, 36, y + 12, 78, 78, t.arts[i % t.arts.length], { r: 14, scale: 0.8 })
      + tx(t, 130, y + 42, name, 15, { fill: t.pal.ink, weight: 600 }) + tx(t, 130, y + 66, ['In stock', 'Ships today', 'Only 2 left'][r], 13)
      + tx(t, w - 40, y + 42, price, 15, { fill: t.pal.ink, weight: 700, anchor: 'end' })
      + rect(w - 116, y + 58, 76, 30, t.pal.soft, { r: 15 }) + tx(t, w - 78, y + 78, `−  ${r + 1}  +`, 13, { fill: t.pal.ink, weight: 600, anchor: 'middle' });
  });
  const sy = 510;
  s += line(24, sy, w - 24, sy, t.pal.line, 1, { dash: '4 6' });
  [['Subtotal', t.items[1][1]], ['Delivery', 'Free'], ['Total', t.items[1][1]]].forEach(([a, b], i) => {
    s += tx(t, 24, sy + 40 + i * 34, a, i === 2 ? 17 : 15, { fill: i === 2 ? t.pal.ink : t.pal.muted, weight: i === 2 ? 700 : 400 }) + tx(t, w - 24, sy + 40 + i * 34, b, i === 2 ? 17 : 15, { fill: t.pal.ink, weight: 700, anchor: 'end' });
  });
  s += rect(24, 640, w - 48, 52, t.pal.soft, { r: 14 }) + icon('truck', 40, 656, 20, t.pal.accent) + tx(t, 72, 671, 'Arrives tomorrow, before 9 PM', 13, { fill: t.pal.ink });
  s += btn(t, 24, 710, 'Checkout', { w: w - 48, h: 58, arrow: true }).svg;
  return s;
}

// ---------- 3. product detail page ----------
function product(t) {
  return scene(t) + browser(t, 110, 80, 1380, 1040, (w, h) => {
    let s = rect(0, 0, w, h, t.pal.bg) + nav(t, w);
    const gx = t.flip ? 720 : 64, ix = t.flip ? 64 : 740, iw = 580;
    s += tx(t, 64, 126, `Home  /  ${t.ind.cats[0]}  /  ${t.items[0][0]}`, 14);
    s += tile(t, gx, 150, 600, 600, t.arts[0], { scale: 0.7 }) + pill(t, gx + 24, 174, 'New', { bg: t.pal.ink, fill: t.pal.bg }).svg;
    for (let i = 0; i < 4; i++) s += tile(t, gx + i * 156, 770, 132, 132, t.arts[i % t.arts.length], { r: t.r, scale: 0.7 }) + (i === 0 ? rect(gx, 770, 132, 132, 'none', { r: t.r, stroke: t.pal.ink, sw: 2 }) : '');
    let y = 160;
    s += tx(t, ix, y, t.brand.full, 13, { upper: true, ls: 2, fill: t.pal.accent, weight: 700 });
    const hh = heading(t, ix, y + 16, t.items[0][0], iw, 52, 2, { noUp: true });
    s += hh.svg;
    y += 32 + hh.h;
    s += stars(ix, y, 16, '#F5A524') + tx(t, ix + 104, y + 14, '4.9 · 248 reviews', 14);
    y += 64;
    s += hd(t, ix, y, t.items[0][1], 38, { noUp: true, italic: false }) + tx(t, ix + textWidth(t.items[0][1], 38, t.ty.h) + 20, y - 4, 'Inclusive of all taxes', 14);
    y += 22;
    s += para(t, ix, y, t.ind.sub, iw - 40, 16, 3).svg;
    y += 104;
    s += tx(t, ix, y, 'Colour', 15, { fill: t.pal.ink, weight: 700 }) + [t.pal.accent, t.pal.accent2, t.pal.ink, mix(t.pal.accent, '#FFFFFF', 0.5)].map((col, i) => circ(ix + 20 + i * 50, y + 34, 16, col) + (i === 0 ? circ(ix + 20, y + 34, 22, 'none', { stroke: t.pal.ink, sw: 2 }) : '')).join('');
    y += 82;
    const opts = ['S', 'M', 'L', 'XL', 'XXL'];
    s += tx(t, ix, y, 'Size', 15, { fill: t.pal.ink, weight: 700 }) + tx(t, ix + iw, y, 'Size guide', 14, { anchor: 'end', fill: t.pal.ink }) + opts.map((o, i) => rect(ix + i * 70, y + 16, 58, 46, i === 1 ? t.pal.ink : 'none', { r: Math.min(t.r, 10), stroke: i === 1 ? '' : t.pal.line, sw: 1.5 }) + tx(t, ix + i * 70 + 29, y + 45, o, 15, { anchor: 'middle', fill: i === 1 ? t.pal.bg : t.pal.ink, weight: 600 })).join('');
    y += 94;
    s += btn(t, ix, y, 'Add to bag', { w: iw - 72, h: 58 }).svg + rect(ix + iw - 58, y, 58, 58, 'none', { r: Math.min(t.r, 29), stroke: t.pal.line, sw: 1.5 }) + icon('heart', ix + iw - 39, y + 19, 20, t.pal.ink);
    y += 92;
    s += [['truck', 'Free delivery in 2–4 days'], ['check', '30-day easy returns'], ['share', 'Share with a friend']].map(([ic, l], i) => icon(ic, ix, y + i * 34 - 15, 18, t.pal.accent) + tx(t, ix + 30, y + i * 34, l, 15, { fill: t.pal.ink })).join('');
    y += 110;
    s += ['Details & care', 'Shipping & returns'].map((l, i) => line(ix, y + i * 56, ix + iw, y + i * 56, t.pal.line, 1) + tx(t, ix, y + i * 56 + 36, l, 16, { fill: t.pal.ink, weight: 600 }) + icon('plus', ix + iw - 20, y + i * 56 + 20, 18, t.pal.ink)).join('');
    return s;
  });
}

// ---------- 4. poster ----------
function posterMain(t, w, h) {
  const v = t.v % 3, A = t.pal.accent, on = onColor(A);
  if (v === 0) {
    const big = fit(t.brand.word, t.ty.h, w - 80, 220, 1, { upper: true, minSize: 60 });
    return rect(0, 0, w, h, t.pal.bg) + hd(t, w / 2, 80 + big.size * 0.8, t.brand.word.toUpperCase(), big.size, { anchor: 'middle', noUp: true, ls: 0 })
      + circ(w / 2, h * 0.56, w * 0.36, A) + art(t.c, t.arts[0], t.k, w / 2, h * 0.56, w * 0.6)
      + heading(t, 40, h - 150, t.head, w - 80, 34, 2, { noUp: true }).svg
      + line(40, h - 62, w - 40, h - 62, t.pal.ink, 1.5) + tx(t, 40, h - 32, t.ind.kicker, 14, { fill: t.pal.ink, upper: true, ls: 1.5 }) + tx(t, w - 40, h - 32, `${t.brand.word.toLowerCase()}.com`, 14, { fill: t.pal.ink, anchor: 'end' });
  }
  if (v === 1) {
    const vert = t.head.split(' ').slice(0, 3).join(' ');
    const vf = fit(vert, t.ty.h, h - 200, 64, 1, { upper: t.ty.up, minSize: 24 });
    return rect(0, 0, w, h, A) + circ(w * 0.7, h * 0.36, w * 0.5, '#FFFFFF', { op: 0.1 }) + art(t.c, t.arts[0], t.k, w * 0.62, h * 0.42, w * 0.78)
      + hd(t, 0, 0, vert, vf.size, { fill: on, t: `translate(${30 + vf.size * 0.8} ${h - 150}) rotate(-90)`, noUp: false })
      + rect(0, h - 120, w, 120, t.pal.ink) + logo(t, 40, h - 60, 34, { fill: t.pal.bg }).svg + tx(t, w - 40, h - 52, t.ind.cta.toUpperCase(), 15, { fill: t.pal.bg, anchor: 'end', weight: 700, ls: 1.5 });
  }
  const hh = heading(t, 40, h - 330, t.head, w - 80, 72, 3, { noUp: false });
  return rect(0, 0, w, h, t.pal.surface) + [1, 2, 3].map((i) => line((w / 4) * i, 0, (w / 4) * i, h, t.pal.line, 1)).join('') + line(0, h * 0.5, w, h * 0.5, t.pal.line, 1)
    + hd(t, 40, 120, String(t.v + 1).padStart(2, '0'), 110, { fill: A, noUp: true, italic: false }) + tx(t, 40, 160, t.ind.kicker, 14, { fill: t.pal.ink, upper: true, ls: 1.5 })
    + art(t.c, t.arts[0], t.k, w * 0.66, h * 0.3, w * 0.56) + hh.svg + rect(40, h - 60, 44, 6, A) + tx(t, w - 40, h - 44, t.brand.full, 15, { fill: t.pal.ink, anchor: 'end', weight: 700 });
}
function posterSide(t, w, h) {
  const bg = t.v % 2 ? t.pal.ink : t.pal.accent2, on = onColor(bg);
  return rect(0, 0, w, h, bg) + circ(w / 2, h * 0.42, w * 0.34, on, { op: 0.08 }) + art(t.c, t.arts[1 % t.arts.length], t.k, w / 2, h * 0.42, w * 0.62)
    + heading(t, 32, h - 190, t.items[1][0], w - 64, 40, 2, { fill: on, noUp: false }).svg + tx(t, 32, h - 50, t.items[1][1], 18, { fill: on, weight: 700 }) + logo(t, w - 32 - 130, 50, 26, { fill: on }).svg;
}
function poster(t) {
  const wall = t.dark ? mix(t.pal.bg, '#FFFFFF', 0.08) : mix(t.pal.soft, t.pal.ink, 0.05);
  const mx = t.flip ? 820 : 260, sx = t.flip ? 340 : 960;
  return rect(0, 0, W, H, t.c.lg([[0, mix(wall, '#FFFFFF', 0.3)], [1, mix(wall, '#000000', 0.06)]], 0, 0, 1, 1))
    + poly([[t.flip ? 0 : 1600, 0], [t.flip ? 600 : 1000, 0], [t.flip ? 1100 : 500, 1200], [t.flip ? 0 : 1600, 1200]], '#FFFFFF', { op: t.dark ? 0.03 : 0.16 })
    + rect(0, 1080, W, 120, mix(wall, '#000000', 0.08))
    + rect(mx - 14, 136, 548, 808, '#FFFFFF', { f: 'sh' }) + g(posterMain(t, 520, 780), { t: `translate(${mx} 150)`, clip: t.c.clip(rect(0, 0, 520, 780, '#000')) })
    + rect(sx - 12, 368, 404, 564, t.dark ? '#1C1C1C' : '#22201E', { f: 'sh' }) + g(posterSide(t, 380, 540), { t: `translate(${sx} 380)`, clip: t.c.clip(rect(0, 0, 380, 540, '#000')) })
    + ell(t.flip ? 1360 : 240, 1088, 120, 14, '#000000', { op: 0.12 }) + art(t.c, 'plant', { ...t.k, main: mix(t.pal.ink, t.pal.soft, 0.3) }, t.flip ? 1360 : 240, 990, 220);
}

// ---------- 5. brand identity ----------
function card(t, x, y, w, h, bg, label, inner, labelFill) {
  return rect(x, y, w, h, bg, { r: 24 }) + tx(t, x + 28, y + 40, label, 12, { fill: labelFill || mix(onColor(bg), bg, 0.4), upper: true, ls: 2, weight: 600 }) + inner;
}
function brand(t) {
  const P = t.pal, A = P.accent;
  let s = rect(0, 0, W, H, t.dark ? P.bg : mix(P.bg, P.ink, 0.04));
  s += card(t, 60, 60, 700, 500, A, '01 — Primary logo', mark(t, 410, 270, 170, onColor(A), A) + logo(t, 410, 450, 44, { anchor: 'middle', fill: onColor(A), noMark: true }).svg);
  const sw = [P.ink, A, P.accent2, P.soft, P.bg];
  s += card(t, 784, 60, 360, 240, P.surface, '02 — Colour', sw.map((col, i) => rect(812 + i * 62, 84 + 0, 56, 156, col, { r: 12, stroke: P.line, sw: 1, t: 'translate(0 26)' }) + tx(t, 840 + i * 62, 292, col.toUpperCase(), 10, { anchor: 'middle', font: 'mono', fill: P.muted })).join(''));
  s += card(t, 1168, 60, 372, 240, P.ink, '03 — Typography', hd(t, 1196, 230, 'Aa', 120, { fill: P.bg, noUp: true }) + tx(t, 1376, 160, 'Headline', 13, { fill: mix(P.bg, P.ink, 0.4) }) + tx(t, 1376, 184, t.ty.h[0].toUpperCase() + t.ty.h.slice(1), 18, { fill: P.bg, weight: 700 })
    + tx(t, 1376, 222, 'Body', 13, { fill: mix(P.bg, P.ink, 0.4) }) + tx(t, 1376, 246, t.ty.b[0].toUpperCase() + t.ty.b.slice(1), 18, { fill: P.bg, weight: 700 }));
  // business cards
  const bc = (x, y, rot, front) => g(rect(0, 0, 330, 190, front ? A : P.surface, { r: 10, f: 'sm' })
    + (front ? mark(t, 165, 95, 70, onColor(A), A) : logo(t, 28, 44, 24).svg + tx(t, 28, 122, t.ind.slug === 'fashion' ? 'Creative Director' : 'Founder', 12, { fill: P.muted }) + tx(t, 28, 100, 'Aarav Mehta', 17, { fill: P.ink, weight: 700 })
      + tx(t, 28, 160, `hello@${t.brand.word.toLowerCase()}.com`, 12, { fill: P.ink }) + rect(0, 182, 330, 8, A)), { t: `translate(${x} ${y}) rotate(${rot})` });
  s += card(t, 784, 324, 756, 236, mix(P.soft, P.bg, 0.3), '04 — Stationery', bc(880, 360, -6, false) + bc(1160, 352, 5, true));
  // pattern
  const pat = t.c.pattern(90, 90, g(mark(t, 45, 45, 40, mix(A, P.ink, 0.25), P.ink), { op: 0.9 }));
  s += rect(60, 584, 460, 556, P.ink, { r: 24 }) + rect(60, 584, 460, 556, pat, { r: 24, op: 0.5 }) + rect(90, 1040, 400, 70, P.ink, { r: 14 }) + tx(t, 116, 1084, '05 — Pattern', 13, { fill: P.bg, upper: true, ls: 2, weight: 600 });
  // shopping bag
  const bx = 640, by = 700;
  s += card(t, 544, 584, 520, 556, P.soft, '06 — Packaging', path(`M${bx + 70} ${by}C${bx + 70} ${by - 90} ${bx + 210} ${by - 90} ${bx + 210} ${by}`, 'none', { stroke: P.ink, sw: 8 })
    + rect(bx, by, 280, 340, P.surface, { r: 6, f: 'sm' }) + rect(bx + 236, by, 44, 340, '#000', { op: 0.05 }) + mark(t, bx + 140, by + 140, 90, A, onColor(A)) + logo(t, bx + 140, by + 250, 26, { anchor: 'middle', noMark: true }).svg
    + art(t.c, t.arts[0], t.k, 970, 1030, 150));
  // app icons
  const ic = [[A, onColor(A)], [P.ink, P.bg], [P.accent2, onColor(P.accent2)]];
  s += card(t, 1088, 584, 452, 270, P.surface, '07 — App icon', ic.map(([bg, ink], i) => rect(1124 + i * 136, 652, 112, 112, bg, { r: 28, f: 'sm' }) + mark(t, 1180 + i * 136, 708, 58, ink, bg)).join('') + tx(t, 1180, 802, t.brand.word, 13, { anchor: 'middle', fill: P.muted }));
  s += card(t, 1088, 878, 452, 262, P.accent2, '08 — Voice', heading(t, 1116, 940, `“${t.head}”`, 396, 40, 3, { fill: onColor(P.accent2), noUp: true }).svg);
  return s;
}

// ---------- 6. dashboard ----------
function dashboard(t) {
  const P = t.pal, R = t.R, A = P.accent;
  const darkSide = t.v % 2 === 0;
  const sb = darkSide ? (t.dark ? mix(P.bg, '#000000', 0.3) : P.ink) : P.surface, sbInk = onColor(sb);
  const X = 60, Y = 60, w = 1480, h = 1080, sw = 250;
  let s = scene(t) + rect(X, Y, w, h, t.dark ? P.bg : mix(P.bg, P.ink, 0.025), { r: 22, f: 'sh' });
  s += g(rect(0, 0, sw, h, sb) + (darkSide ? '' : line(sw, 0, sw, h, P.line, 1)) + logo(t, 28, 52, 30, { fill: sbInk }).svg
    + ['Dashboard', ...t.ind.cats.slice(0, 4), 'Customers', 'Settings'].map((l, i) => (i === 0 ? rect(16, 104, sw - 32, 46, A, { r: 12 }) : '')
      + icon(['grid', 'bag', 'chart', 'heart', 'bell', 'user', 'cog'][i], 34, 117 + i * 54, 20, i === 0 ? onColor(A) : mix(sbInk, sb, 0.35)) + tx(t, 68, 133 + i * 54, l, 15, { fill: i === 0 ? onColor(A) : mix(sbInk, sb, 0.25), weight: i === 0 ? 700 : 500 })).join('')
    + rect(16, h - 200, sw - 32, 170, mix(A, sb, 0.75), { r: 18 }) + tx(t, 36, h - 154, 'Go Pro', 18, { fill: sbInk, weight: 700 }) + para(t, 36, h - 140, 'Unlock reports, exports and team seats.', sw - 72, 13, 2, { fill: mix(sbInk, sb, 0.3) }).svg
    + rect(36, h - 82, 110, 36, A, { r: 18 }) + tx(t, 91, h - 59, 'Upgrade', 13, { fill: onColor(A), weight: 700, anchor: 'middle' }),
  { t: `translate(${X} ${Y})`, clip: t.c.clip(rect(0, 0, w, h, '#000', { r: 22 })) });
  const mx = X + sw + 36, mw = w - sw - 72;
  s += hd(t, mx, Y + 66, 'Overview', 34, { noUp: true, italic: false }) + tx(t, mx, Y + 94, `Welcome back — here is what’s happening at ${t.brand.word}.`, 15);
  s += rect(mx + mw - 470, Y + 40, 250, 46, P.surface, { r: 23, stroke: P.line, sw: 1 }) + icon('search', mx + mw - 452, Y + 53, 20, P.muted) + tx(t, mx + mw - 420, Y + 69, 'Search…', 14)
    + rect(mx + mw - 206, Y + 40, 140, 46, P.surface, { r: 23, stroke: P.line, sw: 1 }) + tx(t, mx + mw - 136, Y + 69, 'Last 30 days', 14, { anchor: 'middle', fill: P.ink, weight: 600 })
    + circ(mx + mw - 26, Y + 63, 24, mix(A, P.bg, 0.6)) + tx(t, mx + mw - 26, Y + 69, 'AM', 14, { anchor: 'middle', fill: P.ink, weight: 700 });
  const ky = Y + 128, kw = (mw - 3 * 22) / 4;
  t.ind.kpis.forEach(([label, value], i) => {
    const x = mx + i * (kw + 22);
    const up = i !== 2 || t.v % 3 !== 0;
    const pts = Array.from({ length: 9 }, (_, j) => [x + 24 + j * ((kw - 48) / 8), ky + 150 - (j * 3 + R() * 26) * (up ? 1 : -0.4) - (up ? 0 : 30)]);
    s += rect(x, ky, kw, 172, i === 0 ? A : P.surface, { r: 20, stroke: i === 0 ? '' : P.line, sw: 1 })
      + tx(t, x + 24, ky + 40, label, 14, { fill: i === 0 ? mix(onColor(A), A, 0.2) : P.muted }) + tx(t, x + 24, ky + 84, value, 30, { fill: i === 0 ? onColor(A) : P.ink, weight: 700, font: t.ty.h === 'impact' ? 'helvetica' : t.ty.b })
      + rect(x + kw - 92, ky + 22, 70, 26, i === 0 ? '#FFFFFF' : up ? '#E7F8EE' : '#FDECEC', { r: 13, op: i === 0 ? 0.2 : 1 }) + tx(t, x + kw - 57, ky + 40, `${up ? '+' : '−'}${(4 + R() * 18).toFixed(1)}%`, 12, { anchor: 'middle', weight: 700, fill: i === 0 ? onColor(A) : up ? '#12805C' : '#C2353A' })
      + path('M' + pts.map((p) => p.join(' ')).join('L'), 'none', { stroke: i === 0 ? onColor(A) : A, sw: 3, cap: 'round', join: 'round', op: i === 0 ? 0.8 : 1 });
  });
  // area chart
  const cy = ky + 196, cw = mw * 0.64, ch = 380;
  const vals = Array.from({ length: 12 }, (_, i) => 0.35 + 0.4 * Math.sin(i / 2 + t.v) * 0.5 + i * 0.035 + R() * 0.12);
  const pts = vals.map((v, i) => [mx + 70 + i * ((cw - 100) / 11), cy + ch - 50 - v * (ch - 150)]);
  const d = 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(' ')).join('L');
  s += rect(mx, cy, cw, ch, P.surface, { r: 20, stroke: P.line, sw: 1 }) + tx(t, mx + 28, cy + 44, 'Revenue', 18, { fill: P.ink, weight: 700 }) + tx(t, mx + 28, cy + 70, t.ind.kpis[0][1] + ' this month', 14)
    + [0, 1, 2, 3].map((i) => line(mx + 70, cy + 110 + i * 60, mx + cw - 28, cy + 110 + i * 60, P.line, 1, { dash: '4 6' }) + tx(t, mx + 28, cy + 115 + i * 60, `${(4 - i) * 25}k`, 12)).join('')
    + path(`${d}L${pts[11][0]} ${cy + ch - 50}L${pts[0][0]} ${cy + ch - 50}Z`, t.c.lg([[0, A, 0.35], [1, A, 0]])) + path(d, 'none', { stroke: A, sw: 3.5, join: 'round' })
    + path('M' + pts.map(([x, y], i) => `${x} ${y + 30 + Math.sin(i) * 14}`).join('L'), 'none', { stroke: P.accent2, sw: 2.5, dash: '6 6' })
    + ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((m, i) => tx(t, pts[i][0], cy + ch - 22, m, 12, { anchor: 'middle' })).join('')
    + circ(pts[8][0], pts[8][1], 7, P.surface, { stroke: A, sw: 3 }) + rect(pts[8][0] - 52, pts[8][1] - 52, 104, 34, P.ink, { r: 8 }) + tx(t, pts[8][0], pts[8][1] - 30, t.ind.kpis[0][1], 13, { fill: P.bg, anchor: 'middle', weight: 700 });
  // donut
  const dx = mx + cw + 22, dw = mw - cw - 22;
  const share = [0.38, 0.27, 0.2, 0.15], cols = [A, P.accent2, mix(A, P.ink, 0.45), mix(A, P.bg, 0.6)];
  let acc = 0;
  const C = 2 * Math.PI * 80;
  s += rect(dx, cy, dw, ch, P.surface, { r: 20, stroke: P.line, sw: 1 }) + tx(t, dx + 28, cy + 44, 'By category', 18, { fill: P.ink, weight: 700 })
    + share.map((sh, i) => { const seg = circ(dx + dw / 2, cy + 170, 80, 'none', { stroke: cols[i], sw: 30, dash: `${(sh * C - 4).toFixed(1)} ${C.toFixed(1)}`, t: `rotate(${-90 + acc * 360} ${dx + dw / 2} ${cy + 170})` }); acc += sh; return seg; }).join('')
    + tx(t, dx + dw / 2, cy + 168, '100%', 22, { anchor: 'middle', fill: P.ink, weight: 700 }) + tx(t, dx + dw / 2, cy + 190, 'of sales', 12, { anchor: 'middle' })
    + share.map((sh, i) => circ(dx + 36 + (i % 2) * (dw / 2 - 10), cy + 296 + Math.floor(i / 2) * 34, 6, cols[i]) + tx(t, dx + 50 + (i % 2) * (dw / 2 - 10), cy + 301 + Math.floor(i / 2) * 34, `${t.ind.cats[i]} ${Math.round(sh * 100)}%`, 13, { fill: P.ink })).join('');
  // table
  const ty = cy + ch + 22, th = Y + h - 36 - ty;
  const status = [['Completed', '#12805C', '#E7F8EE'], ['Pending', '#B7791F', '#FEF6E4'], ['Processing', '#2B6CB0', '#E8F1FB']];
  s += rect(mx, ty, cw, th, P.surface, { r: 20, stroke: P.line, sw: 1 }) + tx(t, mx + 28, ty + 42, 'Recent orders', 18, { fill: P.ink, weight: 700 }) + tx(t, mx + cw - 28, ty + 42, 'View all', 14, { anchor: 'end', fill: A, weight: 600 })
    + ['Item', 'Customer', 'Status', 'Amount'].map((l, i) => tx(t, mx + [28, cw * 0.42, cw * 0.62, cw - 28][i], ty + 80, l, 12, { upper: true, ls: 1, anchor: i === 3 ? 'end' : 'start' })).join('')
    + [0, 1, 2].map((r) => {
      const ry = ty + 100 + r * 62, [name, price] = t.items[r + 1], st = status[(r + t.v) % 3];
      return line(mx + 28, ry, mx + cw - 28, ry, P.line, 1) + tile(t, mx + 28, ry + 10, 42, 42, t.arts[(r + 1) % t.arts.length], { r: 10, scale: 0.85 })
        + tx(t, mx + 84, ry + 37, name, 15, { fill: P.ink, weight: 600 }) + tx(t, mx + cw * 0.42, ry + 37, ['Diya Kapoor', 'Kabir Rao', 'Meera Joshi'][r], 14, { fill: P.ink })
        + rect(mx + cw * 0.62, ry + 17, textWidth(st[0], 12, t.ty.b) + 26, 28, st[2], { r: 14 }) + tx(t, mx + cw * 0.62 + 13, ry + 36, st[0], 12, { fill: st[1], weight: 700 }) + tx(t, mx + cw - 28, ry + 37, price, 15, { anchor: 'end', fill: P.ink, weight: 700 });
    }).join('');
  s += rect(dx, ty, dw, th, P.ink, { r: 20 }) + tx(t, dx + 28, ty + 42, 'Top performers', 18, { fill: P.bg, weight: 700 })
    + [0, 1, 2].map((r) => { const y = ty + 80 + r * 62, pct = [0.86, 0.64, 0.42][r]; return tx(t, dx + 28, y + 14, t.items[r][0], 14, { fill: P.bg }) + tx(t, dx + dw - 28, y + 14, `${Math.round(pct * 100)}%`, 14, { fill: P.bg, anchor: 'end', weight: 700 })
      + rect(dx + 28, y + 26, dw - 56, 8, mix(P.bg, P.ink, 0.8), { r: 4 }) + rect(dx + 28, y + 26, (dw - 56) * pct, 8, [A, P.accent2, mix(A, P.bg, 0.4)][r], { r: 4 }); }).join('');
  return s;
}

// ---------- 7. social media kit ----------
function post(t, i, size) {
  const P = t.pal, s = size / 400;
  const wrap = (inner) => g(inner, { t: `scale(${s})` });
  const kind = (i + t.v) % 4;
  if (kind === 0) {
    return wrap(tile(t, 0, 0, 400, 400, t.arts[i % t.arts.length], { r: 0, scale: 0.62 }) + pill(t, 24, 24, 'New in', { bg: P.ink, fill: P.bg, size: 15 }).svg
      + rect(24, 312, 230, 64, P.surface, { r: 14 }) + tx(t, 42, 340, t.items[i % t.items.length][0], 16, { fill: P.ink, weight: 700 }) + tx(t, 42, 364, t.items[i % t.items.length][1], 15, { fill: P.accent, weight: 700 }));
  }
  if (kind === 1) {
    return wrap(rect(0, 0, 400, 400, P.accent) + hd(t, 36, 112, '“', 120, { fill: onColor(P.accent), op: 0.4, noUp: true }) + heading(t, 36, 120, t.head, 330, 46, 4, { fill: onColor(P.accent), noUp: true }).svg
      + tx(t, 36, 366, `@${t.brand.word.toLowerCase()}`, 15, { fill: onColor(P.accent), weight: 600 }));
  }
  if (kind === 2) {
    return wrap(rect(0, 0, 400, 400, P.ink) + tx(t, 200, 84, t.ind.kicker.split('·')[0].trim(), 16, { anchor: 'middle', fill: P.bg, upper: true, ls: 3, weight: 600 })
      + txt(200, 250, '−40%', { font: t.ty.h === 'impact' ? 'impact' : 'helvetica', weight: t.ty.h === 'impact' ? 400 : 800, size: 128, fill: P.accent, anchor: 'middle', ls: -4 })
      + tx(t, 200, 300, 'This weekend only', 18, { anchor: 'middle', fill: P.bg }) + rect(120, 330, 160, 42, P.accent, { r: 21 }) + tx(t, 200, 357, t.ind.cta.split(' ')[0], 15, { fill: onColor(P.accent), anchor: 'middle', weight: 700 }));
  }
  return wrap(rect(0, 0, 400, 400, P.soft) + rect(200, 0, 200, 400, P.accent2) + art(t.c, t.arts[(i + 1) % t.arts.length], t.k, 300, 220, 230)
    + heading(t, 28, 50, t.ind.cats[i % t.ind.cats.length], 170, 40, 2, { noUp: false }).svg + para(t, 28, 160, t.ind.sub, 160, 13, 5).svg + tx(t, 28, 370, 'Swipe →', 15, { fill: P.ink, weight: 700 })
    + [0, 1, 2].map((j) => circ(330 + j * 14, 370, 4, onColor(P.accent2), { op: j === 0 ? 1 : 0.4 })).join(''));
}
function social(t) {
  const P = t.pal;
  let s = scene(t);
  const px = t.flip ? 1060 : 140;
  s += phone(t, px, 170, 400, 860, (w) => {
    let p = tx(t, w / 2, 86, t.brand.word.toLowerCase(), 17, { anchor: 'middle', fill: P.ink, weight: 700 }) + icon('menu', w - 50, 70, 22, P.ink);
    p += circ(64, 152, 44, P.accent) + circ(64, 152, 50, 'none', { stroke: P.accent2, sw: 3 }) + mark(t, 64, 152, 54, onColor(P.accent), P.accent);
    p += [['248', 'Posts'], ['48.2K', 'Followers'], ['312', 'Following']].map(([a, b], i) => tx(t, 170 + i * 74, 150, a, 17, { anchor: 'middle', fill: P.ink, weight: 700 }) + tx(t, 170 + i * 74, 172, b, 12, { anchor: 'middle' })).join('');
    p += tx(t, 20, 226, t.brand.full, 15, { fill: P.ink, weight: 700 }) + para(t, 20, 232, t.ind.sub, w - 40, 13, 2).svg;
    p += rect(20, 292, (w - 50) / 2, 36, P.accent, { r: 10 }) + tx(t, 20 + (w - 50) / 4, 315, 'Follow', 14, { anchor: 'middle', fill: onColor(P.accent), weight: 700 })
      + rect(30 + (w - 50) / 2, 292, (w - 50) / 2, 36, P.soft, { r: 10 }) + tx(t, 30 + ((w - 50) * 3) / 4, 315, 'Message', 14, { anchor: 'middle', fill: P.ink, weight: 700 });
    p += t.ind.cats.slice(0, 4).map((cat, i) => circ(48 + i * 84, 380, 28, P.soft, { stroke: P.line, sw: 2 }) + art(t.c, t.arts[i % t.arts.length], t.k, 48 + i * 84, 380, 40) + tx(t, 48 + i * 84, 428, cat, 11, { anchor: 'middle', fill: P.ink })).join('');
    const gs = (w - 4) / 3;
    for (let i = 0; i < 9; i++) p += g(post(t, i, gs), { t: `translate(${(i % 3) * (gs + 2)} ${450 + Math.floor(i / 3) * (gs + 2)})` });
    return p;
  });
  const gx = t.flip ? 140 : 620, size = 410, gap = 30;
  for (let i = 0; i < 4; i++) {
    const x = gx + (i % 2) * (size + gap), y = 150 + Math.floor(i / 2) * (size + gap + 30);
    s += rect(x, y, size, size, P.bg, { r: 10, f: 'sh' }) + g(post(t, i, size), { t: `translate(${x} ${y})`, clip: t.c.clip(rect(0, 0, size, size, '#000', { r: 10 })) });
  }
  return s;
}

// ---------- 8. packaging ----------
function packaging(t) {
  const P = t.pal, A = P.accent;
  let s = scene(t) + ell(800, 1000, 700, 90, '#000000', { op: t.dark ? 0.25 : 0.07 });
  // box
  const bx = t.flip ? 1000 : 200, by = 660, bw = 380, bh = 320;
  s += poly([[bx, by], [bx + 60, by - 50], [bx + bw + 60, by - 50], [bx + bw, by]], mix(A, '#FFFFFF', 0.25)) + poly([[bx + bw, by], [bx + bw + 60, by - 50], [bx + bw + 60, by + bh - 50], [bx + bw, by + bh]], mix(A, '#000000', 0.25))
    + rect(bx, by, bw, bh, A) + rect(bx + bw * 0.42, by, 44, bh, P.accent2) + poly([[bx + bw * 0.42 + 60, by - 50], [bx + bw * 0.42 + 104, by - 50], [bx + bw * 0.42 + 44, by], [bx + bw * 0.42, by]], mix(P.accent2, '#FFFFFF', 0.2))
    + g(logo(t, 0, 0, 30, { fill: onColor(A), markFill: onColor(A), markInk: A }).svg, { t: `translate(${bx + 30} ${by + bh - 44})` });
  // bag
  const gx = t.flip ? 560 : 640, gy = 380, gw = 360, gh = 600;
  const bagBg = t.v % 2 ? P.ink : P.surface, bagInk = onColor(bagBg);
  s += path(`M${gx + 90} ${gy + 4}C${gx + 90} ${gy - 140} ${gx + gw - 90} ${gy - 140} ${gx + gw - 90} ${gy + 4}`, 'none', { stroke: mix(bagBg, '#000000', 0.3), sw: 10 })
    + rect(gx, gy, gw, gh, bagBg, { f: 'sh' }) + poly([[gx + gw, gy], [gx + gw + 50, gy + 20], [gx + gw + 50, gy + gh - 10], [gx + gw, gy + gh]], mix(bagBg, '#000000', 0.18))
    + mark(t, gx + gw / 2, gy + 210, 120, A, onColor(A)) + txt(gx + gw / 2, gy + 360, t.brand.word, { font: t.ty.h, weight: Math.max(t.ty.hw, 500), size: 42, fill: bagInk, anchor: 'middle', upper: t.mood === 'luxe' || t.mood === 'bold', ls: 4 })
    + tx(t, gx + gw / 2, gy + 396, t.ind.kicker, 13, { anchor: 'middle', fill: mix(bagInk, bagBg, 0.35), upper: true, ls: 2 })
    + line(gx + gw - 120, gy + 10, gx + gw - 70, gy + 120, mix(bagInk, bagBg, 0.5), 1.5) + rect(gx + gw - 110, gy + 120, 80, 120, P.accent2, { r: 6, t: `rotate(-12 ${gx + gw - 70} ${gy + 180})` });
  // canister
  const cx = t.flip ? 220 : 1100, cy = 560, cw = 240, chh = 420;
  s += rect(cx, cy, cw, chh, t.c.lg([[0, mix(P.accent2, '#000000', 0.15)], [0.35, mix(P.accent2, '#FFFFFF', 0.25)], [1, mix(P.accent2, '#000000', 0.3)]], 0, 0, 1, 0)) + ell(cx + cw / 2, cy + chh, cw / 2, 26, mix(P.accent2, '#000000', 0.3))
    + rect(cx, cy + 120, cw, 200, P.surface) + ell(cx + cw / 2, cy, cw / 2, 26, mix(P.accent2, '#FFFFFF', 0.35)) + mark(t, cx + cw / 2, cy + 190, 70, A, onColor(A))
    + tx(t, cx + cw / 2, cy + 270, t.items[0][0], 15, { anchor: 'middle', fill: P.ink, weight: 700 }) + tx(t, cx + cw / 2, cy + 294, t.brand.full, 12, { anchor: 'middle', upper: true, ls: 1.5 });
  s += art(t.c, t.arts[0], t.k, t.flip ? 1300 : 300, 1020, 230);
  s += logo(t, 80, 110, 40).svg + tx(t, W - 80, 118, 'Packaging & brand system', 18, { anchor: 'end', fill: P.ink, weight: 600 });
  return s;
}

// ---------- 9. editorial spread ----------
function editorial(t) {
  const P = t.pal;
  const desk = t.dark ? mix(P.bg, '#000000', 0.3) : mix(P.ink, P.accent, 0.2);
  let s = rect(0, 0, W, H, t.c.lg([[0, mix(desk, '#FFFFFF', 0.08)], [1, mix(desk, '#000000', 0.2)]], 0, 0, 1, 1));
  const x = 140, y = 150, pw = 660, ph = 900;
  const L = t.flip ? x + pw : x, Rx = t.flip ? x : x + pw;
  s += rect(x - 6, y + 6, pw * 2 + 12, ph, '#000000', { op: 0.35, f: 'sh' });
  // picture page
  s += g(rect(0, 0, pw, ph, P.accent) + circ(pw * 0.5, ph * 0.42, 260, '#FFFFFF', { op: 0.12 }) + art(t.c, t.arts[0], t.k, pw / 2, ph * 0.42, 460)
    + tx(t, 44, 66, `ISSUE ${String(t.v + 1).padStart(2, '0')} — ${t.ind.name.toUpperCase()}`, 13, { fill: onColor(P.accent), ls: 3, weight: 600 })
    + heading(t, 44, ph - 230, t.head, pw - 88, 70, 3, { fill: onColor(P.accent) }).svg, { t: `translate(${L} ${y})`, clip: t.c.clip(rect(0, 0, pw, ph, '#000')) });
  // text page
  const tc = P.ink;
  let r = rect(0, 0, pw, ph, mix(P.bg, '#FFFFFF', t.dark ? 0 : 0.5)) + tx(t, 56, 70, t.ind.kicker, 12, { upper: true, ls: 2, fill: P.accent, weight: 700 });
  const hh = heading(t, 56, 90, `The art of ${t.ind.cats[0].toLowerCase()}`, pw - 112, 54, 2, { fill: tc });
  r += hh.svg + tx(t, 56, 126 + hh.h, `Words by Ishita Verma · Photographs by ${t.brand.word} studio`, 13, { fill: P.muted });
  const cy = 170 + hh.h, colW = (pw - 112 - 30) / 2;
  r += hd(t, 56, cy + 74, t.brand.word[0], 96, { fill: P.accent, noUp: true, italic: false }) + bars(130, cy + 10, colW - 74, 4, 20, mix(tc, P.bg, 0.78)) + bars(56, cy + 92, colW, 9, 20, mix(tc, P.bg, 0.78));
  r += bars(56 + colW + 30, cy + 10, colW, 6, 20, mix(tc, P.bg, 0.78));
  r += line(56 + colW + 30, cy + 140, 56 + colW + 30, cy + 260, P.accent, 3) + heading(t, 56 + colW + 46, cy + 138, `“${t.ind.sub.split(/[.·]/)[0].trim()}.”`, colW - 20, 22, 5, { fill: P.accent, noUp: true }).svg;
  r += tile(t, 56, cy + 300, pw - 112, 230, t.arts[1 % t.arts.length], { r: 0, scale: 0.8 }) + tx(t, 56, cy + 556, `${t.items[1][0]} — ${t.items[1][1]}`, 12, { fill: P.muted, italic: true });
  r += bars(56, cy + 580, colW, 3, 20, mix(tc, P.bg, 0.78)) + bars(56 + colW + 30, cy + 580, colW, 3, 20, mix(tc, P.bg, 0.78));
  r += tx(t, 56, ph - 34, String(40 + t.v * 2), 12, { fill: P.muted }) + tx(t, pw - 56, ph - 34, t.brand.full.toUpperCase(), 11, { anchor: 'end', fill: P.muted, ls: 2 });
  s += g(r, { t: `translate(${Rx} ${y})`, clip: t.c.clip(rect(0, 0, pw, ph, '#000')) });
  s += rect(x + pw - 40, y, 80, ph, t.c.lg([[0, '#000000', 0], [0.5, '#000000', 0.22], [1, '#000000', 0]], 0, 0, 1, 0));
  return s;
}

// ---------- 10. email + ads campaign ----------
function campaign(t) {
  const P = t.pal, A = P.accent;
  let s = scene(t);
  const ex = t.flip ? 960 : 140, ew = 500, ey = 60, eh = 1080;
  let e = rect(0, 0, ew, eh, P.bg) + logo(t, ew / 2, 50, 28, { anchor: 'middle' }).svg + t.ind.cats.slice(0, 3).map((c, i) => tx(t, ew / 2 + (i - 1) * 110, 102, c, 13, { anchor: 'middle', fill: P.ink })).join('');
  e += tile(t, 24, 130, ew - 48, 380, t.arts[0], { bg: A, r: 0, scale: 0.62, dx: 90, dy: 20 })
    + tx(t, 52, 182, t.ind.kicker.split('·')[0].trim(), 12, { upper: true, ls: 2, fill: onColor(A), weight: 700 }) + heading(t, 52, 196, t.head, 250, 40, 4, { fill: onColor(A) }).svg
    + btn(t, 52, 430, t.ind.cta, { bg: onColor(A), h: 46, size: 14 }).svg;
  e += hd(t, ew / 2, 566, 'Picked for you', 24, { anchor: 'middle', noUp: true });
  const cw = (ew - 48 - 16) / 2;
  for (let i = 0; i < 2; i++) e += productCard(t, 24 + i * (cw + 16), 590, cw, i + 1, { h: 180, size: 15, rating: false });
  e += rect(24, 860, ew - 48, 110, P.soft) + tx(t, ew / 2, 902, 'Members get free delivery, always', 16, { anchor: 'middle', fill: P.ink, weight: 700 }) + tx(t, ew / 2, 930, 'Join in one tap — no fees, no spam.', 13, { anchor: 'middle' });
  e += [0, 1, 2, 3].map((i) => circ(ew / 2 - 66 + i * 44, 1010, 15, P.ink)).join('') + tx(t, ew / 2, 1058, `© 2026 ${t.brand.full} · Unsubscribe`, 11, { anchor: 'middle' });
  s += rect(ex, ey, ew, eh, P.bg, { r: 18, f: 'sh' }) + g(e, { t: `translate(${ex} ${ey})`, clip: t.c.clip(rect(0, 0, ew, eh, '#000', { r: 18 })) });
  const rx = t.flip ? 140 : 700;
  // story ad
  const story = rect(0, 0, 340, 604, P.ink) + circ(170, 250, 150, A, { op: 0.9 }) + art(t.c, t.arts[1 % t.arts.length], t.k, 170, 250, 260)
    + [0, 1, 2].map((i) => rect(16 + i * 106, 16, 98, 4, P.bg, { r: 2, op: i === 0 ? 1 : 0.35 })).join('') + logo(t, 20, 54, 24, { fill: P.bg }).svg
    + heading(t, 24, 430, t.items[1][0], 292, 38, 2, { fill: P.bg }).svg + rect(24, 534, 292, 50, P.bg, { r: 25 }) + tx(t, 170, 565, t.ind.cta, 15, { anchor: 'middle', fill: P.ink, weight: 700 });
  s += rect(rx, 60, 340, 604, P.ink, { r: 22, f: 'sh' }) + g(story, { t: `translate(${rx} 60)`, clip: t.c.clip(rect(0, 0, 340, 604, '#000', { r: 22 })) });
  // square ad
  s += rect(rx + 380, 60, 380, 380, P.bg, { r: 14, f: 'sh' }) + g(post(t, 2, 380), { t: `translate(${rx + 380} 60)`, clip: t.c.clip(rect(0, 0, 380, 380, '#000', { r: 14 })) });
  s += rect(rx + 380, 470, 380, 194, P.accent2, { r: 14, f: 'sh' }) + heading(t, rx + 408, 500, t.ind.items[2][0], 200, 30, 2, { fill: onColor(P.accent2), noUp: true }).svg
    + tx(t, rx + 408, 630, t.ind.items[2][1], 18, { fill: onColor(P.accent2), weight: 700 }) + art(t.c, t.arts[2 % t.arts.length], t.k, rx + 668, 567, 160);
  // leaderboard banners
  const lb = rect(0, 0, 760, 210, P.soft) + art(t.c, t.arts[0], t.k, 650, 105, 190) + logo(t, 32, 40, 24).svg + heading(t, 32, 64, t.head, 470, 30, 2).svg + btn(t, 32, 152, t.ind.cta, { h: 42, size: 14, arrow: true }).svg;
  s += rect(rx, 700, 760, 210, P.soft, { r: 14, f: 'sh' }) + g(lb, { t: `translate(${rx} 700)`, clip: t.c.clip(rect(0, 0, 760, 210, '#000', { r: 14 })) });
  const lb2 = rect(0, 0, 760, 190, A) + tx(t, 32, 74, t.ind.kicker, 14, { fill: onColor(A), upper: true, ls: 2, weight: 700 }) + heading(t, 32, 90, `${t.items[3 % t.items.length][0]} · ${t.items[3 % t.items.length][1]}`, 460, 34, 1, { fill: onColor(A), noUp: true }).svg
    + rect(560, 0, 200, 190, onColor(A), { op: 0.12 }) + art(t.c, t.arts[(t.v + 1) % t.arts.length], t.k, 660, 95, 150);
  s += rect(rx, 940, 760, 190, A, { r: 14, f: 'sh' }) + g(lb2, { t: `translate(${rx} 940)`, clip: t.c.clip(rect(0, 0, 760, 190, '#000', { r: 14 })) });
  return s;
}

export const FORMATS = [
  { slug: 'landing', name: 'Landing page', draw: landing },
  { slug: 'mobile', name: 'Mobile app', draw: mobile },
  { slug: 'product', name: 'Product page', draw: product },
  { slug: 'poster', name: 'Poster', draw: poster },
  { slug: 'brand', name: 'Brand identity', draw: brand },
  { slug: 'dashboard', name: 'Dashboard', draw: dashboard },
  { slug: 'social', name: 'Social media kit', draw: social },
  { slug: 'packaging', name: 'Packaging', draw: packaging },
  { slug: 'editorial', name: 'Editorial', draw: editorial },
  { slug: 'campaign', name: 'Email & ads', draw: campaign },
];
