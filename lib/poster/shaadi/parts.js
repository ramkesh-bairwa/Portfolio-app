// Shared pieces for wedding cards: element makers, colours, fonts, ornaments, programme and name blocks.
import { eid, graphicEl, r, shapeEl, stack, textEl } from '../kit';

export const G = (fam, x, y, w, h, colors, params = {}, o = {}) => graphicEl(fam, r(x), r(y), r(w), r(h), { colors, params, ...o });
export const T = (text, x, y, w, h, o) => textEl(String(text ?? ''), r(x), r(y), r(w), r(h), o);
export const box = (x, y, w, h, o) => shapeEl('rect', r(x), r(y), r(w), r(h), { fill: 'transparent', ...o });
export const hline = (x, y, w, c, sw = 1, o = {}) => shapeEl('rect', r(x), r(y), r(w), Math.max(1, r(sw)), { fill: c, name: 'Rule', ...o });
export const vline = (x, y, h, c, sw = 1, o = {}) => shapeEl('rect', r(x), r(y), Math.max(1, r(sw)), r(h), { fill: c, name: 'Rule', ...o });
export const qrEl = (url, x, y, s, fg, bg) => ({ id: eid(), type: 'qr', x: r(x), y: r(y), w: r(s), h: r(s), rot: 0, opacity: 1, qr: { kind: 'link', url: url || 'https://maps.google.com' }, fg, bg, margin: 1, dots: 'square', keepRatio: true, name: 'Location QR' });
export const solidBg = (c) => ({ type: 'solid', color: c, from: c, to: c, angle: 135, image: '', overlay: 0 });
export const gradBg = (a, b, angle = 160) => ({ type: 'gradient', color: a, from: a, to: b, angle, image: '', overlay: 0 });
export const mix = (a, b, k) => {
  const p = (h) => { const m = /^#([0-9a-f]{6})$/i.exec(h || ''); const n = m ? parseInt(m[1], 16) : 0; return [n >> 16, (n >> 8) & 255, n & 255]; };
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
};
export const isDeva = (s) => /[ऀ-ॿ]/.test(s || '');

// text item for stack(): { text, size, font, color, … }
export const it = (text, size, font, color, o = {}) => (text ? { kind: 'text', text: String(text), size, font, color, weight: o.weight || '400', lh: o.lh || 1.28, wide: o.wide, gap: o.gap || 0, upper: o.upper, italic: o.italic, ls: o.ls, el: o.el } : null);
export const flow = (items, b, align = 'center', valign = 'center') => stack(items.filter(Boolean), b, { align, valign });

// ---------- fonts ----------
const FONTSETS = {
  amita: { hi: ['Amita', 'Rozha One', 'Mukta', 'Kalam'], en: ['Cinzel Decorative', 'Playfair Display', 'Lora', 'Great Vibes'] },
  yatra: { hi: ['Yatra One', 'Yatra One', 'Martel', 'Kalam'], en: ['Cinzel', 'Cinzel', 'EB Garamond', 'Great Vibes'] },
  rozha: { hi: ['Rozha One', 'Palanquin Dark', 'Hind', 'Kalam'], en: ['Playfair Display', 'Playfair Display', 'Lora', 'Great Vibes'] },
  eczar: { hi: ['Amita', 'Eczar', 'Laila', 'Kalam'], en: ['Cinzel Decorative', 'Cormorant Garamond', 'EB Garamond', 'Great Vibes'] },
  palanquin: { hi: ['Yatra One', 'Palanquin Dark', 'Mukta', 'Kalam'], en: ['DM Serif Display', 'DM Serif Display', 'Lora', 'Great Vibes'] },
  tiro: { hi: ['Rozha One', 'Rozha One', 'Martel', 'Kalam'], en: ['Playfair Display', 'Cinzel', 'EB Garamond', 'Great Vibes'] },
};
// wide: average glyph width as a share of font size (Devanagari is wider), used to fit text
export function fonts(key, hi) {
  const [title, name, body, script] = FONTSETS[key][hi ? 'hi' : 'en'];
  return { title, name, body, script, tw: hi ? 0.78 : 0.62, nw: hi ? 0.76 : 0.6, bw: hi ? 0.66 : 0.52, sw: hi ? 0.7 : 0.42 };
}

// ---------- ornaments ----------
const symCols = (C) => (C.colour ? ['#C2410C', '#FACC15', '#15803D'] : [C.ink, C.paper, mix(C.ink, C.paper, 0.35)]);
export function sideOrn(kind, C, x, y, d) {
  switch (kind) {
    case 'kalash': return G('osymbol', x, y, d, d, symCols(C), { kind: 'kalash' });
    case 'swastik': return G('osymbol', x, y, d, d, [C.colour ? '#C2410C' : C.ink, mix(C.paper, C.acc, 0.15)], { kind: 'swastik', ring: true });
    case 'shehnai': return G('pshehnai', x, y, d * 1.3, d, [C.ink, C.acc, C.paper], { style: C.colour ? 'fill' : 'line' });
    case 'lotus': return G('oflora', x, y, d, d, [C.ink, C.acc, C.ink], { kind: 'lotusline' });
    default: return G('osymbol', x, y, d, d, [C.colour ? '#C2410C' : C.ink, mix(C.paper, C.acc, 0.15)], { kind: 'om', ring: true });
  }
}
export function emblem(kind, C, x, y, d) {
  if (kind === 'ganesh') return G('oganesh', x, y, d, d, [C.ink, C.acc, mix(C.paper, C.acc, 0.2)], { style: C.colour ? 'filled' : 'line', weight: 2.4 });
  if (kind === 'kalash') return G('osymbol', x, y, d, d, symCols(C), { kind: 'kalash' });
  return G('osymbol', x, y, d, d, [C.colour ? '#C2410C' : C.ink, mix(C.paper, C.acc, 0.15)], { kind: 'om', ring: true });
}

// ---------- programme (karyakram) ----------
// style: dots | pills | shield | cusp | scroll | table
export function program(style, D, F, C, b, u) {
  const list = (D.events || []).filter((e) => e && e.name).slice(0, 6);
  const els = [];
  if (!list.length) return els;
  const n = list.length;
  const when = (e) => [e.date, e.time].filter(Boolean).join('\n');
  const longest = (t) => Math.max(...String(t).split(/\s+/).map((w) => w.length), 1);
  const nameIt = (t, w, size, color) => it(t, Math.min(size, (w * 0.92) / (longest(t) * F.nw)), F.name, color, { wide: F.nw, lh: 1.15 });
  if (style === 'dots' || style === 'table') {
    const cols = Math.min(n, b.w > 520 ? (n === 4 ? 4 : 3) : n === 4 ? 2 : Math.min(3, n)), rows = Math.ceil(n / cols);
    const cw = b.w / cols, rh = b.h / rows;
    if (style === 'dots') els.push(hline(b.x, b.y, b.w, C.ink, 0.25 * u), hline(b.x, b.y + b.h, b.w, C.ink, 0.25 * u));
    list.forEach((e, i) => {
      const x = b.x + (i % cols) * cw, y = b.y + Math.floor(i / cols) * rh;
      els.push(...flow([nameIt(e.name, cw - 2 * u, 4.4 * u, C.ink), it(when(e), 2.1 * u, F.body, C.soft, { wide: F.bw, lh: 1.3, weight: '600' })], { x: x + u, y: y + u, w: cw - 2 * u, h: rh - 2 * u }));
      if (i % cols && style === 'dots') els.push(shapeEl('circle', r(x - 1.5 * u), r(y + rh * 0.22), r(3 * u), r(3 * u), { fill: 'transparent', stroke: C.ink, strokeW: Math.max(2, r(0.6 * u)), name: 'Dot' }), shapeEl('circle', r(x - 0.6 * u), r(y + rh * 0.22 + 0.9 * u), r(1.2 * u), r(1.2 * u), { fill: C.ink, name: 'Dot' }));
      if (i % cols && style === 'table') els.push(vline(x, y + 1.5 * u, rh - 3 * u, C.ink, 0.2 * u));
    });
    if (style === 'table' && rows > 1) els.push(hline(b.x, b.y + rh, b.w, C.ink, 0.2 * u, { opacity: 0.5 }));
  } else if (style === 'pills') {
    const rh = b.h / n;
    list.forEach((e, i) => {
      const y = b.y + i * rh, ph = Math.min(rh * 0.8, 7 * u);
      const filled = i % 2 === 0, capW = b.w * 0.42;
      if (filled) {
        els.push(G('skpill', b.x, y + (rh - ph) / 2, b.w, ph, [C.ink, C.acc, C.paper], { filled: true, cap: 0.42 }));
        els.push(...flow([nameIt(e.name, capW - 3 * u, 3.6 * u, C.paper)], { x: b.x + 1.5 * u, y: y + (rh - ph) / 2, w: capW - 2.5 * u, h: ph }));
      } else els.push(...flow([nameIt(e.name, capW - 3 * u, 3.8 * u, C.ink)], { x: b.x + 1.5 * u, y, w: capW - 2.5 * u, h: rh }));
      const dx = b.x + capW + ph * 0.75;
      els.push(...flow([it([e.date, e.time].filter(Boolean).join(' · '), 2.2 * u, F.body, C.ink, { wide: F.bw, weight: '600', lh: 1.2 })], { x: dx, y: y + (rh - ph) / 2 + ph * 0.08, w: b.x + b.w - dx - ph * 0.45, h: ph * 0.84 }, 'left'));
    });
  } else if (style === 'timeline') {
    // vertical line with a symbol per function, details to the right
    const rh = b.h / n, lx = b.x + 4 * u;
    els.push(vline(lx, b.y + rh * 0.3, b.h - rh * 0.6, C.ink, 0.3 * u));
    list.forEach((e, i) => {
      const y = b.y + i * rh, d = Math.min(rh * 0.7, 6 * u);
      els.push(shapeEl('circle', r(lx - d / 2), r(y + (rh - d) / 2), r(d), r(d), { fill: C.paper, stroke: C.ink, strokeW: Math.max(2, r(0.4 * u)), name: 'Step' }));
      els.push(T(String(i + 1), lx - d / 2, y + (rh - d) / 2 + d * 0.12, d, d * 0.8, { font: F.name, size: r(d * 0.5), color: C.acc, align: 'center', lh: 1.4 }));
      els.push(...flow([nameIt(e.name, b.w * 0.4, 3.6 * u, C.ink)], { x: lx + d / 2 + 2 * u, y, w: b.w * 0.42, h: rh }, 'left'));
      els.push(...flow([it(when(e).replace('\n', ' · '), 2.1 * u, F.body, C.soft, { wide: F.bw, weight: '600', lh: 1.25 })], { x: b.x + b.w * 0.5, y, w: b.w * 0.5, h: rh }, 'right'));
      if (i < n - 1) els.push(hline(lx + d, y + rh, b.w - (lx + d - b.x), C.ink, 1, { opacity: 0.18, dash: true }));
    });
  } else if (style === 'medallion') {
    // each function in a double circle, date and time under it
    const cols = Math.min(n, b.w < 520 ? 2 : n === 4 ? 4 : 3), rows = Math.ceil(n / cols);
    const cw = b.w / cols, rh = b.h / rows;
    list.forEach((e, i) => {
      const x = b.x + (i % cols) * cw, y = b.y + Math.floor(i / cols) * rh;
      const d = Math.min(cw * 0.78, rh * 0.62);
      const cx = x + cw / 2;
      els.push(shapeEl('circle', r(cx - d / 2), r(y), r(d), r(d), { fill: C.paper, stroke: C.ink, strokeW: Math.max(2, r(0.5 * u)), name: 'Medallion' }));
      els.push(shapeEl('circle', r(cx - d / 2 + d * 0.07), r(y + d * 0.07), r(d * 0.86), r(d * 0.86), { fill: 'transparent', stroke: C.acc, strokeW: 1, dash: true, name: 'Medallion' }));
      els.push(...flow([nameIt(e.name, d * 0.72, 3.4 * u, C.ink)], { x: cx - d * 0.36, y: y + d * 0.2, w: d * 0.72, h: d * 0.6 }));
      els.push(...flow([it(when(e), 1.9 * u, F.body, C.soft, { wide: F.bw, weight: '600', lh: 1.25 })], { x: x + u, y: y + d + 0.6 * u, w: cw - 2 * u, h: rh - d - 0.8 * u }, 'center', 'top'));
    });
  } else if (style === 'ribbon') {
    // each function on a folded ribbon, date beside it
    const rh = b.h / n;
    list.forEach((e, i) => {
      const y = b.y + i * rh, rw = b.w * 0.5, ry = y + rh * 0.08, rhh = rh * 0.84;
      const left = i % 2 === 0;
      const rx = left ? b.x : b.x + b.w - rw;
      els.push(G('oscroll', rx, ry, rw, rhh, [C.ink, C.acc, C.paper], { kind: 'ribbon' }));
      els.push(...flow([nameIt(e.name, rw * 0.6, 3.2 * u, C.paper)], { x: rx + rw * 0.2, y: ry, w: rw * 0.6, h: rhh * 0.86 }));
      els.push(...flow([it(when(e), 2.1 * u, F.body, C.ink, { wide: F.bw, weight: '600', lh: 1.25 })], { x: left ? b.x + rw + 2 * u : b.x, y, w: b.w - rw - 2 * u, h: rh }, left ? 'left' : 'right'));
    });
  } else if (style === 'shield' || style === 'cusp' || style === 'scroll') {
    const cols = style === 'scroll' ? Math.min(2, n) : b.w < 520 ? Math.min(2, n) : Math.min(n, n === 4 ? 4 : 3), rows = Math.ceil(n / cols);
    const cw = b.w / cols, rh = b.h / rows;
    list.forEach((e, i) => {
      const x = b.x + (i % cols) * cw, y = b.y + Math.floor(i / cols) * rh;
      const gw = cw * 0.94, gx = x + cw * 0.03;
      if (style === 'shield') {
        els.push(G('skshield', gx, y, gw, rh * 0.96, [C.ink, C.acc, C.paper]));
        els.push(...flow([it(`${D.lang === 'hi' ? 'दिनांक' : 'Date'} · ${e.date}`, 1.9 * u, F.body, C.paper, { wide: F.bw, weight: '700' })], { x: gx + gw * 0.1, y: y + rh * 0.06, w: gw * 0.8, h: rh * 0.27 }));
        els.push(...flow([nameIt(e.name, gw * 0.7, 3.8 * u, C.ink), it(e.time, 2 * u, F.body, C.soft, { wide: F.bw, weight: '600' })], { x: gx + gw * 0.15, y: y + rh * 0.34, w: gw * 0.7, h: rh * 0.38 }));
      } else if (style === 'cusp') {
        els.push(G('skcusp', gx, y, gw, rh * 0.98, [C.ink, C.acc, C.paper]));
        const ic = Math.min(5.2 * u, rh * 0.2);
        els.push(sideOrn(C.iconKind || 'kalash', C, gx + gw / 2 - ic / 2, y + rh * 0.07, ic));
        els.push(...flow([nameIt(e.name, gw * 0.76, 3.6 * u, C.ink), it(when(e), 1.9 * u, F.body, C.soft, { wide: F.bw, weight: '600', lh: 1.25 })], { x: gx + gw * 0.12, y: y + rh * 0.3, w: gw * 0.76, h: rh * 0.5 }));
      } else {
        els.push(G('skscroll', gx, y, gw, rh * 0.98, [C.ink, C.acc, C.paper]));
        els.push(...flow([it(e.date, 2 * u, F.body, C.ink, { wide: F.bw, weight: '700', gap: 0.6 * u }), nameIt(e.name, gw * 0.6, 3.8 * u, C.ink), it(e.time, 2 * u, F.body, C.soft, { wide: F.bw, weight: '600' })], { x: gx + gw * 0.2, y: y + rh * 0.16, w: gw * 0.6, h: rh * 0.6 }));
      }
    });
  }
  return els;
}

// ---------- the couple's names ----------
// style: big | bar | box
export function person(style, P, F, C, b, u, o = {}) {
  const els = [];
  const full = `${P.pre ? `${P.pre} ` : ''}${P.name}`;
  const nameH = Math.min(8 * u, b.h * 0.45);
  if (style === 'ribbon') {
    els.push(G('oscroll', b.x + b.w * 0.04, b.y - nameH * 0.1, b.w * 0.92, nameH * 1.2, [C.ink, C.acc, C.paper], { kind: 'ribbon' }));
    els.push(...flow([it(full, nameH * 0.48, F.name, C.paper, { wide: F.nw })], { x: b.x + b.w * 0.2, y: b.y, w: b.w * 0.6, h: nameH * 0.92 }));
  } else if (style === 'script') {
    els.push(...flow([it(P.pre, 2.2 * u, F.body, C.soft, { wide: F.bw, weight: '700', gap: 0.2 * u }), it(P.name, nameH * 0.78, F.title, C.acc, { wide: F.tw })], { x: b.x, y: b.y - 1 * u, w: b.w, h: nameH + 1 * u }));
  } else if (style === 'bar') {
    els.push(G('sknamebar', b.x, b.y, b.w, nameH, [C.ink, C.acc, C.paper]));
    els.push(...flow([it(full, nameH * 0.52, F.name, C.paper, { wide: F.nw })], { x: b.x + nameH * 1.4, y: b.y, w: b.w - nameH * 2.8, h: nameH }));
  } else if (style === 'box') {
    els.push(box(b.x + b.w * 0.06, b.y, b.w * 0.88, nameH, { stroke: C.acc, strokeW: Math.max(2, r(0.5 * u)), name: 'Name box' }));
    els.push(...flow([it(full, nameH * 0.56, F.name, C.ink, { wide: F.nw })], { x: b.x + b.w * 0.08, y: b.y, w: b.w * 0.84, h: nameH }));
  } else els.push(...flow([it(full, nameH * 0.8, F.name, o.nameColor || C.ink, { wide: F.nw })], { x: b.x, y: b.y, w: b.w, h: nameH }));
  els.push(...flow([it(P.parents, 2.3 * u, F.body, C.ink, { wide: F.bw, lh: 1.3, gap: 0.3 * u }), it(P.place, 2.1 * u, F.body, C.soft, { wide: F.bw, lh: 1.3 })], { x: b.x, y: b.y + nameH + 0.6 * u, w: b.w, h: b.h - nameH - 0.6 * u }, o.align || 'center', 'top'));
  return els;
}

// "Sang" with hands, used between the two names
export function sang(word, F, C, x, y, w, h) {
  return [
    G('skhands', x, y + h * 0.3, w, h * 0.7, [C.ink, C.acc, C.paper]),
    T(word, x, y - h * 0.02, w, h * 0.38, { font: F.script, size: r(h * 0.3), color: C.acc, align: 'center', lh: 1.1 }),
  ];
}

// Three bottom columns: darshanabhilashi | swagatkarta | vineet
export function lists(D, W_, F, C, b, u, cols = 3) {
  const els = [hline(b.x, b.y, b.w, C.ink, 0.25 * u)];
  const head = (t) => { const s = cols === 3 ? `${t} :` : D.lang === 'hi' ? `॥ ${t} ॥` : `· ${t} ·`; return it(s, Math.max(2.1 * u, Math.min(2.8 * u, ((b.w / cols) * 0.95) / (s.length * F.nw))), F.name, C.acc, { wide: F.nw, gap: 0.6 * u }); };
  const body = (t) => it(t, 2.1 * u, F.body, C.ink, { wide: F.bw, lh: 1.35 });
  const y = b.y + 1.2 * u, h = b.h - 1.2 * u;
  if (cols === 3) {
    const cw = b.w / 3;
    els.push(...flow([head(W_.darshan), body(D.darshan)], { x: b.x, y, w: cw - u, h }, 'left', 'top'));
    els.push(...flow([head(W_.swagat), body(D.swagat)], { x: b.x + cw, y, w: cw, h }, 'center', 'top'));
    els.push(...flow([head(W_.vineet), it(D.vineet, 2.4 * u, F.name, C.ink, { wide: F.nw, gap: 0.3 * u }), body(D.vineetPlace), body(D.phone ? `${W_.phone} ${D.phone}` : '')], { x: b.x + 2 * cw + u, y, w: cw - u, h }, 'right', 'top'));
  } else {
    const cw = b.w / 2;
    els.push(...flow([head(W_.darshan), body(D.darshan)], { x: b.x, y, w: cw - u, h }, 'left', 'top'));
    els.push(...flow([head(W_.vineet), it(D.vineet, 2.4 * u, F.name, C.ink, { wide: F.nw, gap: 0.3 * u }), body(D.vineetPlace), body(D.phone ? `${W_.phone} ${D.phone}` : '')], { x: b.x + cw + u, y, w: cw - u, h }, 'right', 'top'));
  }
  return els;
}
