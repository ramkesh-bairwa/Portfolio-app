// Printing-press patrika built from parts. Every design picks one option for each part — frame, art across the fold,
// heading, programme, names, bottom art, family columns and type — and no two designs share more than three parts,
// so cards differ in layout, not just colour. Sheet: A4 landscape; inside = open spread (karyakram | nimantran).
import { rng } from '../graphics';
import { G, box, emblem, flow, fonts, hline, it, lists, mix, person, program, qrEl, sang, sideOrn, solidBg, vline } from './parts';

export const PARTS = {
  frame: ['double', 'dashed', 'chain', 'mandala', 'paisley', 'toran', 'ornate', 'brackets', 'panel'],
  fold: ['arch', 'oval', 'mandap', 'ganesh', 'column', 'none'],
  header: ['kalash', 'ribbon', 'arch', 'divider', 'tabs'],
  events: ['dots', 'pills', 'shield', 'cusp', 'scroll', 'table', 'timeline', 'medallion', 'ribbon'],
  names: ['big', 'bar', 'box', 'ribbon', 'side', 'arches', 'script'],
  art: ['baraat', 'couple', 'doli', 'music', 'palace', 'figures'],
  lists: ['three', 'two', 'stack'],
  // order of blocks on the karyakram page
  order: ['classic', 'artTop', 'eventsLast'],
  font: ['amita', 'yatra', 'rozha', 'eczar', 'palanquin', 'tiro'],
};
export const PART_LABELS = {
  frame: { double: 'Double line', dashed: 'Dashed', chain: 'Diamond chain', mandala: 'Mandala corners', paisley: 'Paisley bands', toran: 'Marigold toran', ornate: 'Ornate frame', brackets: 'Corner brackets', panel: 'Mehrab panel' },
  fold: { arch: 'मेहराब', oval: 'स्तम्भ', mandap: 'मंडप', ganesh: 'गणेश मंडल', column: 'कलश स्तम्भ', none: 'सादा' },
};
export const INKS = {
  black: { label: 'Black', ink: '#161616', acc: '#161616', paper: '#FFFFFF', soft: '#3A3A3A' },
  red: { label: 'Red', ink: '#C8102E', acc: '#C8102E', paper: '#FFFFFF', soft: '#9B1022' },
  maroon: { label: 'Maroon & gold', ink: '#5E0B15', acc: '#A8730E', paper: '#FFF8EC', soft: '#5E2A2A' },
  navy: { label: 'Navy', ink: '#14295C', acc: '#C2410C', paper: '#FFFFFF', soft: '#334155' },
  green: { label: 'Green', ink: '#0F4D2C', acc: '#B45309', paper: '#FBFBF2', soft: '#2F4A33' },
  kesari: { label: 'Kesari', ink: '#7A1F00', acc: '#D94E04', paper: '#FFF4D6', soft: '#6B2A0A' },
};
const DECOR = { kalash: { emblem: 'ganesh', side: 'kalash', icon: 'kalash' }, swastik: { emblem: 'om', side: 'swastik', icon: 'swastik' }, shehnai: { emblem: 'ganesh', side: 'shehnai', icon: 'kalash' }, lotus: { emblem: 'kalash', side: 'lotus', icon: 'lotus' } };
const DECOR_KEYS = Object.keys(DECOR);
const NARROW = new Set(['arch', 'oval', 'mandap', 'column']);
const KEYS = ['frame', 'fold', 'header', 'events', 'names', 'art', 'lists', 'order', 'font'];
const VISIBLE = KEYS.length - 1; // every part but the font

// Pick n designs: each differs from every other in at least `minDiff` of the visible parts (all but the font)
function choose(n, minDiff, seed) {
  const R = rng(seed);
  const picked = [];
  const ok = (c) => !(NARROW.has(PARTS.fold[c[1]]) && ['side', 'arches'].includes(PARTS.names[c[4]]));
  for (let tries = 0; picked.length < n && tries < 2000000; tries++) {
    const c = KEYS.map((k) => Math.floor(R() * PARTS[k].length));
    if (!ok(c)) continue;
    // font is left out of the count: it changes the look least
    if (picked.every((p) => p.reduce((d, v, i) => d + (i < VISIBLE && v !== c[i] ? 1 : 0), 0) >= minDiff)) picked.push(c);
  }
  return picked;
}
let CHOSEN = choose(420, 4, 20261212);
if (CHOSEN.length < 420) CHOSEN = choose(420, 3, 20261212);
export const PATRIKA_DESIGNS = CHOSEN.map((c, i) => {
  const parts = Object.fromEntries(KEYS.map((k, j) => [k, PARTS[k][c[j]]]));
  const ink = Object.keys(INKS)[(i * 5) % 6];
  const decor = DECOR_KEYS[(i * 3 + c[0]) % 4];
  return { id: `pk${i + 1}`, kind: 'patrika', no: i + 1, parts, ink, decor, format: 'card-spread', swatch: INKS[ink].ink, paper: INKS[ink].paper, colourName: INKS[ink].label,
    title: `${PART_LABELS.fold[parts.fold]} · ${parts.events}`, tags: `${PART_LABELS.frame[parts.frame]}` };
});

// ---------- frame for one panel ----------
function frame(kind, C, x0, pw, H, u, outer = 'both') {
  const els = [];
  const m1 = 1.5 * u, m2 = 2.5 * u;
  const rect = (m, o) => box(x0 + m, m, pw - 2 * m, H - 2 * m, { stroke: C.ink, name: 'Frame', ...o });
  let padL = 4.2 * u, padR = 4.2 * u, top = 4 * u, bottom = H - 4 * u;
  const strong = Math.max(2, Math.round(0.45 * u));
  switch (kind) {
    case 'dashed': els.push(rect(m1, { strokeW: strong }), rect(m2, { strokeW: Math.max(1, Math.round(0.22 * u)), dash: true })); break;
    case 'chain': {
      els.push(rect(m1, { strokeW: strong }));
      const bw = 3.6 * u;
      if (outer !== 'right') { els.push(G('skborder', x0 + m2, m2, bw, H - 2 * m2, [C.ink, C.acc, C.paper])); padL += bw; }
      if (outer !== 'left') { els.push(G('skborder', x0 + pw - m2 - bw, m2, bw, H - 2 * m2, [C.ink, C.acc, C.paper])); padR += bw; }
      break;
    }
    case 'mandala': {
      els.push(rect(m1, { strokeW: 1 }));
      const D = 24 * u;
      [[x0 - D / 2, -D / 2], [x0 + pw - D / 2, -D / 2], [x0 - D / 2, H - D / 2], [x0 + pw - D / 2, H - D / 2]].forEach(([x, y]) => els.push(G('omandala', x, y, D, D, [C.ink, C.acc, C.ink], { style: 'line', layers: 4 }, { seed: 17, opacity: 0.85 })));
      padL += 4 * u; padR += 4 * u; top += 4 * u; bottom -= 4 * u;
      break;
    }
    case 'paisley':
      els.push(rect(m1, { strokeW: 1 }), G('opaisley', x0 + 2 * u, 2 * u, pw - 4 * u, 5 * u, [C.ink, C.acc, C.ink], { kind: 'border' }), G('opaisley', x0 + 2 * u, H - 7 * u, pw - 4 * u, 5 * u, [C.ink, C.acc, C.ink], { kind: 'border' }));
      top += 4.5 * u; bottom -= 4.5 * u;
      break;
    case 'toran':
      els.push(rect(m1, { stroke: C.acc, strokeW: strong }), G('ogarland', x0, 0, pw, 11 * u, ['#FF8C00', '#FFC300', '#2E7D32', '#E11D48'], { flower: 'marigold', strands: 1, drop: 'bell' }), box(x0, H - 2 * u, pw, 2 * u, { fill: C.acc, name: 'Base band' }));
      top += 8 * u;
      break;
    case 'ornate':
      els.push(G('oframe', x0 + u, u, pw - 2 * u, H - 2 * u, [C.ink, C.acc, C.ink], { style: 'flourish' }));
      padL += 3 * u; padR += 3 * u; top += 4 * u; bottom -= 4 * u;
      break;
    case 'brackets': {
      const L = 9 * u, t = Math.max(3, Math.round(0.8 * u));
      els.push(rect(m2, { strokeW: 1 }));
      [[0, 0, 1, 1], [1, 0, -1, 1], [0, 1, 1, -1], [1, 1, -1, -1]].forEach(([ax, ay, sx, sy]) => {
        const cx = x0 + (ax ? pw - m1 : m1), cy = ay ? H - m1 : m1;
        els.push(box(sx > 0 ? cx : cx - L, sy > 0 ? cy : cy - t, L, t, { fill: C.ink, name: 'Corner' }), box(sx > 0 ? cx : cx - t, sy > 0 ? cy : cy - L, t, L, { fill: C.ink, name: 'Corner' }));
      });
      break;
    }
    case 'panel':
      els.push(rect(m1, { strokeW: strong }), G('skcusparch', x0 + m2 + u, m2 + u, pw - 2 * m2 - 2 * u, H - 2 * m2 - 1.5 * u, [C.ink, C.acc, C.paper]));
      top += 12 * u; padL += 1.5 * u; padR += 1.5 * u;
      break;
    default: els.push(rect(m1, { strokeW: strong }), rect(m2, { strokeW: 1 }));
  }
  return { els, x: x0 + padL, w: pw - padL - padR, top, bottom };
}

// ---------- art across the fold; returns the half-width text must keep from the fold at height y ----------
function fold(kind, C, W, H, u) {
  const HW = W / 2, els = [];
  let half = () => 0;
  if (kind === 'arch') {
    const AW = W * 0.3, top = H * 0.36;
    els.push(G('skcusparch', HW - AW / 2, top, AW, H - top - 1.5 * u, [C.ink, C.acc, C.paper], { fill: true }), G('skcouple', HW - AW * 0.42, H * 0.5, AW * 0.84, H * 0.42, [C.ink, C.acc, C.paper]));
    half = (y0, y1) => (y1 > top + 2 * u ? AW / 2 + 1.5 * u : 0);
  } else if (kind === 'oval') {
    const OW = W * 0.27;
    els.push(G('skoval', HW - OW / 2, H * 0.07, OW, H * 0.86, [C.ink, C.acc, C.paper]), G('skcouple', HW - OW * 0.36, H * 0.3, OW * 0.72, H * 0.42, [C.ink, C.acc, C.paper]));
    half = () => OW / 2 + 1.5 * u;
  } else if (kind === 'mandap') {
    const D = W * 0.25, cy = H * 0.56;
    els.push(G('omandala', HW - D * 0.62, cy - D * 0.62, D * 1.24, D * 1.24, [mix(C.ink, C.paper, 0.6), C.acc, mix(C.ink, C.paper, 0.5)], { style: 'line', layers: 3 }, { seed: 5 }));
    els.push(box(HW - D / 2, cy - D / 2, D, D, { fill: C.paper, stroke: C.ink, strokeW: Math.max(2, Math.round(0.5 * u)), radius: Math.round(D / 2), name: 'Medallion' }));
    els.push(G('pmandap', HW - D * 0.34, cy - D * 0.36, D * 0.68, D * 0.68, [C.ink, C.acc, C.paper], { style: 'line' }));
    half = (y0, y1) => (y1 > cy - D * 0.62 && y0 < cy + D * 0.62 ? D * 0.62 + u : 0);
  } else if (kind === 'ganesh') {
    const D = W * 0.2, top = 5 * u;
    els.push(G('omandala', HW - D / 2, top, D, D, [C.ink, C.acc, mix(C.ink, C.paper, 0.5)], { style: 'line', layers: 4 }, { seed: 9 }));
    els.push(box(HW - D * 0.3, top + D * 0.2, D * 0.6, D * 0.6, { fill: C.paper, radius: Math.round(D * 0.3), name: 'Medallion' }), G('oganesh', HW - D * 0.24, top + D * 0.24, D * 0.48, D * 0.48, [C.ink, C.acc, C.paper], { style: 'line', weight: 2.6 }));
    els.push(vline(HW - 0.5, top + D + u, H - top - D - 5 * u, C.ink, 1, { dash: true, opacity: 0.5 }));
    half = (y0) => (y0 < top + D ? D / 2 + u : 0);
  } else if (kind === 'column') {
    const cw = W * 0.1;
    els.push(vline(HW - cw / 2, 3 * u, H - 6 * u, C.ink, 0.3 * u), vline(HW + cw / 2, 3 * u, H - 6 * u, C.ink, 0.3 * u));
    const n = 5, step = (H - 10 * u) / n;
    for (let i = 0; i < n; i++) {
      const y = 5 * u + i * step, d = Math.min(cw * 0.8, step * 0.7);
      els.push(i % 2 ? sideOrn('swastik', C, HW - d / 2, y + (step - d) / 2, d) : G('osymbol', HW - d / 2, y + (step - d) / 2, d, d, C.colour ? ['#C2410C', '#FACC15', '#15803D'] : [C.ink, C.paper, mix(C.ink, C.paper, 0.35)], { kind: 'kalash' }));
    }
    half = () => cw / 2 + 2 * u;
  } else els.push(vline(HW - 0.5, 3 * u, H - 6 * u, C.ink, 1, { dash: true, opacity: 0.4 }));
  return { els, half };
}

// ---------- heading on the karyakram page ----------
function header(kind, D, F, C, decor, b, u) {
  const els = [];
  const title = D.programTitle || D.title;
  if (kind === 'ribbon') {
    els.push(...flow([it(D.invoke, 2.4 * u, F.body, C.ink, { weight: '700', wide: F.bw })], { x: b.x, y: b.y, w: b.w, h: 3.6 * u }));
    els.push(G('oscroll', b.x + b.w * 0.1, b.y + 4.5 * u, b.w * 0.8, 10 * u, [C.ink, C.acc, C.paper], { kind: 'ribbon' }));
    els.push(...flow([it(title, 4.6 * u, F.title, C.paper, { wide: F.tw })], { x: b.x + b.w * 0.24, y: b.y + 4.5 * u, w: b.w * 0.52, h: 8.6 * u }));
    els.push(...flow([it(D.shloka, 1.8 * u, F.body, C.soft, { wide: F.bw })], { x: b.x, y: b.y + 15 * u, w: b.w, h: 3 * u }));
  } else if (kind === 'arch') {
    els.push(...flow([it(D.invoke, 2.3 * u, F.body, C.ink, { weight: '700', wide: F.bw })], { x: b.x, y: b.y, w: b.w, h: 3.4 * u }));
    els.push(G('oarch', b.x + b.w / 2 - 17 * u, b.y + 3.6 * u, 34 * u, 15 * u, [C.ink, C.acc, C.paper], { kind: 'outline' }));
    els.push(emblem(decor.emblem, C, b.x + b.w / 2 - 3 * u, b.y + 5.6 * u, 6 * u));
    els.push(...flow([it(title, 3.6 * u, F.title, C.ink, { wide: F.tw })], { x: b.x + b.w / 2 - 13 * u, y: b.y + 11.6 * u, w: 26 * u, h: 6.4 * u }));
    const d = Math.min(10 * u, (b.w - 36 * u) / 2 - u);
    if (d > 4 * u) els.push(sideOrn(decor.side, C, b.x, b.y + 7 * u, d), sideOrn(decor.side, C, b.x + b.w - d * (decor.side === 'shehnai' ? 1.3 : 1), b.y + 7 * u, d));
  } else if (kind === 'divider') {
    els.push(emblem(decor.emblem, C, b.x, b.y + 1 * u, 12 * u));
    els.push(...flow([it(D.invoke, 2.3 * u, F.body, C.ink, { weight: '700', wide: F.bw })], { x: b.x + 14 * u, y: b.y, w: b.w - 14 * u, h: 3.6 * u }, 'left'));
    els.push(...flow([it(title, 6 * u, F.title, C.ink, { wide: F.tw })], { x: b.x + 14 * u, y: b.y + 3.6 * u, w: b.w - 14 * u, h: 8 * u }, 'left'));
    els.push(G('odivider', b.x + 14 * u, b.y + 12 * u, Math.min(40 * u, b.w - 14 * u), 3.6 * u, [C.ink, C.acc, C.ink], { kind: 'scroll', center: 'lotus' }));
    els.push(...flow([it(D.shloka, 1.7 * u, F.body, C.soft, { wide: F.bw })], { x: b.x, y: b.y + 16 * u, w: b.w, h: 2.8 * u }));
  } else if (kind === 'tabs') {
    els.push(...flow([it(D.invoke, 2.4 * u, F.body, C.ink, { weight: '700', wide: F.bw, gap: 0.3 * u }), it(D.shloka, 1.8 * u, F.body, C.soft, { wide: F.bw })], { x: b.x, y: b.y, w: b.w, h: 6.6 * u }));
    const words = String(title).split(/\s+/);
    const tw = Math.min(26 * u, (b.w - 14 * u) / words.length), x0 = b.x + (b.w - tw * words.length) / 2;
    words.forEach((wd, i) => {
      els.push(box(x0 + i * tw + 0.5 * u, b.y + 8 * u, tw - u, 8 * u, { fill: C.ink, radius: Math.round(0.8 * u), name: 'Title tab' }));
      els.push(...flow([it(wd, 4.4 * u, F.title, C.paper, { wide: F.tw })], { x: x0 + i * tw + 1.5 * u, y: b.y + 8 * u, w: tw - 3 * u, h: 8 * u }));
    });
    els.push(hline(b.x, b.y + 12 * u, x0 - 2 * u - b.x, C.ink, 0.3 * u), hline(x0 + tw * words.length + 2 * u, b.y + 12 * u, b.x + b.w - (x0 + tw * words.length + 2 * u), C.ink, 0.3 * u));
  } else {
    els.push(...flow([it(D.invoke, 2.5 * u, F.body, C.ink, { weight: '700', wide: F.bw, gap: 0.3 * u }), it(D.shloka, 1.9 * u, F.body, C.soft, { wide: F.bw, lh: 1.3 })], { x: b.x, y: b.y, w: b.w, h: 7 * u }));
    const d = 9 * u, k = decor.side === 'shehnai' ? 1.3 : 1;
    els.push(sideOrn(decor.side, C, b.x, b.y + 7.6 * u, d), sideOrn(decor.side, C, b.x + b.w - d * k, b.y + 7.6 * u, d));
    els.push(...flow([it(title, 6 * u, F.title, C.ink, { wide: F.tw })], { x: b.x + d * k + u, y: b.y + 7.6 * u, w: b.w - 2 * d * k - 2 * u, h: 9.5 * u }));
  }
  return els;
}

// ---------- bottom-left art with the kids' verse ----------
function bottomArt(kind, D, F, C, b, u) {
  const els = [];
  const verse = (bx) => flow([it(`${D.kidsTitle} :`, 2.6 * u, F.name, C.acc, { wide: F.nw, gap: 0.4 * u }), it(D.kids, 2 * u, F.script, C.ink, { wide: F.sw, lh: 1.3, gap: 0.3 * u }), it(D.kidsNames, 2 * u, F.body, C.ink, { wide: F.bw, weight: '700' })], bx);
  if (kind === 'figures' || kind === 'music') {
    const side = Math.min(b.w * 0.2, 13 * u);
    const [l, rgt] = kind === 'figures' ? ['skbride', 'skgroom'] : ['pshehnai', 'pdhol'];
    els.push(G(l, b.x, b.y + b.h * 0.1, side, b.h * 0.85, [C.ink, C.acc, C.paper], { style: 'line', mirror: true }), G(rgt, b.x + b.w - side, b.y + b.h * 0.1, side, b.h * 0.85, [C.ink, C.acc, C.paper], { style: 'line', mirror: true }));
    const vx = b.x + side + u, vw = b.w - 2 * side - 2 * u;
    els.push(G('skpill', vx + vw * 0.15, b.y, vw * 0.7, 5 * u, [C.ink, C.acc, C.paper], { filled: true, cap: 1 }));
    els.push(...flow([it(D.kidsTitle, 2.5 * u, F.name, C.paper, { wide: F.nw })], { x: vx + vw * 0.2, y: b.y, w: vw * 0.6, h: 5 * u }));
    els.push(...flow([it(D.kids, 2 * u, F.script, C.ink, { wide: F.sw, lh: 1.35, gap: 0.4 * u }), it(D.kidsNames, 2 * u, F.body, C.ink, { wide: F.bw, weight: '700' })], { x: vx, y: b.y + 6 * u, w: vw, h: b.h - 6 * u }));
    return els;
  }
  const fam = { baraat: 'skbaraat', couple: 'skcouple', doli: 'pdoli', palace: 'opalace' }[kind];
  const kh = Math.min(15 * u, b.h * 0.48), ah = b.h - kh - u;
  if (ah > 6 * u) els.push(G(fam, b.x, b.y, b.w, ah, kind === 'palace' ? [mix(C.ink, C.paper, 0.15), C.acc] : [C.ink, C.acc, C.paper], { style: 'line' }));
  els.push(box(b.x, b.y + ah + u, b.w, kh, { stroke: C.ink, strokeW: 1, dash: true, radius: Math.round(1.5 * u), name: 'Kids box' }));
  els.push(...verse({ x: b.x + 1.5 * u, y: b.y + ah + 1.6 * u, w: b.w - 3 * u, h: kh - 1.2 * u }));
  return els;
}

// ---------- the couple's names: first, sang, second ----------
function names(kind, D, W_, F, C, b, u) {
  const els = [];
  const first = D.side === 'bride' ? D.bride : D.groom, second = D.side === 'bride' ? D.groom : D.bride;
  if (kind === 'side' || kind === 'arches') {
    const cw = b.w * 0.4;
    [[first, b.x], [second, b.x + b.w - cw]].forEach(([P, x]) => {
      if (kind === 'arches') {
        els.push(G('oarch', x + cw * 0.08, b.y, cw * 0.84, b.h * 0.62, [C.ink, C.acc, C.paper], { kind: 'outline' }));
        els.push(...flow([it(P.pre, 2.2 * u, F.body, C.soft, { weight: '700', wide: F.bw }), it(P.name, 5 * u, F.name, C.ink, { wide: F.nw })], { x: x + cw * 0.18, y: b.y + b.h * 0.18, w: cw * 0.64, h: b.h * 0.4 }));
        els.push(...flow([it(P.parents, 2 * u, F.body, C.ink, { wide: F.bw, lh: 1.3 }), it(P.place, 1.9 * u, F.body, C.soft, { wide: F.bw })], { x, y: b.y + b.h * 0.65, w: cw, h: b.h * 0.35 }, 'center', 'top'));
      } else els.push(...person('box', P, F, C, { x, y: b.y + b.h * 0.1, w: cw, h: b.h * 0.85 }, u));
    });
    els.push(...sang(W_.sang, F, C, b.x + b.w / 2 - b.w * 0.1, b.y + b.h * 0.2, b.w * 0.2, b.h * 0.42));
    return els;
  }
  const h1 = b.h * 0.38, hs = b.h * 0.24;
  els.push(...person(kind, first, F, C, { x: b.x, y: b.y, w: b.w, h: h1 }, u));
  els.push(...sang(W_.sang, F, C, b.x + b.w / 2 - Math.min(b.w * 0.3, 15 * u), b.y + h1, Math.min(b.w * 0.6, 30 * u), hs));
  els.push(...person(kind, second, F, C, { x: b.x, y: b.y + h1 + hs, w: b.w, h: h1 }, u));
  return els;
}

function familyBlock(kind, D, W_, F, C, b, u) {
  if (kind === 'stack') {
    return [hline(b.x, b.y, b.w, C.ink, 0.25 * u), ...flow([
      it(`${W_.darshan} :`, 2.6 * u, F.name, C.acc, { wide: F.nw, gap: 0.3 * u }), it(D.darshan, 2.1 * u, F.body, C.ink, { wide: F.bw, lh: 1.35, gap: 0.8 * u }),
      it(`${W_.vineet} : ${D.vineet}`, 2.5 * u, F.name, C.ink, { wide: F.nw, gap: 0.2 * u }), it([D.vineetPlace, D.phone && `${W_.phone} ${D.phone}`].filter(Boolean).join(' · '), 2 * u, F.body, C.soft, { wide: F.bw })], { x: b.x, y: b.y + 1.2 * u, w: b.w, h: b.h - 1.2 * u })];
  }
  return lists(D, W_, F, C, b, u, kind === 'three' && b.w > 380 ? 3 : 2);
}

const colours = (ink, decorKey) => ({ ...INKS[ink], colour: false, iconKind: DECOR[decorKey].icon });

// ---------- pages ----------
function spread(dz, D, W_, W, H) {
  const u = H / 100, HW = W / 2, P = dz.parts, C = colours(dz.ink, dz.decor), F = fonts(P.font, D.lang === 'hi'), decor = DECOR[dz.decor];
  const L = frame(P.frame, C, 0, HW, H, u, 'left'), R = frame(P.frame, C, HW, HW, H, u, 'right');
  const fd = fold(P.fold, C, W, H, u);
  const els = [...L.els, ...R.els, ...fd.els];
  const lw = (y0, y1) => Math.min(L.x + L.w, HW - fd.half(y0, y1)) - L.x;
  const rx = (y0, y1) => Math.max(R.x, HW + fd.half(y0, y1));
  // left page: karyakram, blocks in the design's order
  let y = L.top;
  const hh = 18.5 * u;
  els.push(...header(P.header, D, F, C, decor, { x: L.x, y, w: lw(y, y + hh), h: hh }, u));
  y += hh + 1.5 * u;
  const evH = ['pills', 'table', 'timeline', 'ribbon'].includes(P.events) ? 32 * u : P.events === 'dots' ? 22 * u : 30 * u;
  const evFit = (room) => Math.min(evH, room);
  const events = (h) => { els.push(...program(P.events, D, F, C, { x: L.x, y, w: lw(y, y + h), h }, u)); y += h + 1.6 * u; };
  const venue = () => {
    const vw = lw(y, y + 7 * u);
    els.push(hline(L.x, y, vw, C.ink, 0.22 * u), hline(L.x, y + 7 * u, vw, C.ink, 0.22 * u));
    els.push(...flow([it(`${W_.venue}: ${D.venue}`, 2.3 * u, F.name, C.ink, { wide: F.nw, lh: 1.25 })], { x: L.x + u, y: y + 0.4 * u, w: vw - 2 * u, h: 6.2 * u }));
    y += 8.6 * u;
  };
  if (P.order === 'artTop') {
    const ah = 16 * u, art = { baraat: 'skbaraat', couple: 'skcouple', doli: 'pdoli', palace: 'opalace', figures: 'skcouple', music: 'pdhol' }[P.art];
    els.push(G(art, L.x, y, lw(y, y + ah), ah, [C.ink, C.acc, C.paper], { style: 'line' }));
    y += ah + 1.2 * u;
    const kh = 12 * u;
    events(evFit(L.bottom - y - kh - 10.5 * u));
    venue();
    const kb = { x: L.x, y, w: lw(y, L.bottom), h: L.bottom - y };
    els.push(box(kb.x, kb.y, kb.w, kb.h, { stroke: C.ink, strokeW: 1, dash: true, radius: Math.round(1.5 * u), name: 'Kids box' }));
    els.push(...flow([it(`${D.kidsTitle} :`, 2.5 * u, F.name, C.acc, { wide: F.nw, gap: 0.3 * u }), it(D.kids, 1.9 * u, F.script, C.ink, { wide: F.sw, lh: 1.3, gap: 0.3 * u }), it(D.kidsNames, 1.9 * u, F.body, C.ink, { wide: F.bw, weight: '700' })], { x: kb.x + 1.5 * u, y: kb.y + 0.6 * u, w: kb.w - 3 * u, h: kb.h - 1.2 * u }));
  } else if (P.order === 'eventsLast') {
    venue();
    const eh = evFit((L.bottom - y) * 0.5);
    const ab = L.bottom - y - eh - 1.6 * u;
    els.push(...bottomArt(P.art, D, F, C, { x: L.x, y, w: lw(y, y + ab), h: ab }, u));
    y += ab + 1.6 * u;
    events(eh);
  } else {
    events(evFit((L.bottom - y) * 0.52));
    venue();
    els.push(...bottomArt(P.art, D, F, C, { x: L.x, y, w: lw(y, L.bottom), h: L.bottom - y }, u));
  }
  // right page: nimantran
  y = R.top;
  const row = (h) => { const x = rx(y, y + h); const b = { x, y, w: R.x + R.w - x, h }; y += h; return b; };
  let b = row(8.6 * u);
  els.push(...flow([it(W_.dear, 2.6 * u, F.name, C.ink, { wide: F.nw, gap: 0.4 * u }), it(`${W_.blessing} ${D.side === 'bride' ? W_.ourDaughter : W_.ourSon}`, 2.2 * u, F.body, C.soft, { wide: F.bw, lh: 1.3 })], b, 'left'));
  y += 0.8 * u;
  const nh = Math.min(40 * u, (R.bottom - y) * 0.55);
  b = row(nh); els.push(...names(P.names, D, W_, F, C, b, u));
  b = row(6 * u);
  els.push(...flow([it(W_.parinay, 4.2 * u, F.title, C.acc, { wide: F.tw })], b));
  b = row(11 * u); els.push(...flow([it(W_.outro, 2.1 * u, F.body, C.ink, { wide: F.bw, lh: 1.4 }), it(D.date, 2.4 * u, F.name, C.acc, { wide: F.nw })], b));
  y += 0.6 * u;
  b = row(R.bottom - y); els.push(...familyBlock(P.lists, D, W_, F, C, b, u));
  return { name: 'Inside spread', bg: solidBg(C.paper), elements: els };
}

// Cover: three arrangements, chosen by design number
function cover(dz, D, W_, W, H, front) {
  const u = H / 100, P = dz.parts, C = colours(dz.ink, dz.decor), F = fonts(P.font, D.lang === 'hi'), decor = DECOR[dz.decor];
  const fr = frame(P.frame, C, 0, W, H, u, 'both');
  const els = [...fr.els];
  const x0 = fr.x, w0 = fr.w, t0 = fr.top, b0 = fr.bottom;
  const short = `${D.groom.name.split(' ')[0]}\n${W_.sang}\n${D.bride.name.split(' ')[0]}`;
  if (front) {
    const v = dz.no % 3;
    els.push(...flow([it(D.invoke, 2.5 * u, F.body, C.ink, { weight: '700', wide: F.bw })], { x: x0, y: t0, w: w0, h: 4 * u }));
    if (v === 0) {
      els.push(emblem(decor.emblem, C, W / 2 - 9 * u, t0 + 5 * u, 18 * u));
      els.push(...flow([it(D.title, 11 * u, F.title, C.ink, { wide: F.tw })], { x: x0, y: t0 + 24 * u, w: w0, h: 14 * u }));
      els.push(box(W / 2 - 16 * u, t0 + 39 * u, 32 * u, 5.4 * u, { fill: C.ink, radius: Math.round(2.7 * u), name: 'Date band' }), ...flow([it(D.shortDate, 2.8 * u, F.body, C.paper, { weight: '700', wide: F.bw })], { x: W / 2 - 16 * u, y: t0 + 39 * u, w: 32 * u, h: 5.4 * u }));
      els.push(G('skcouple', W / 2 - 24 * u, t0 + 47 * u, 48 * u, b0 - t0 - 48 * u, [C.ink, C.acc, C.paper]));
    } else if (v === 1) {
      els.push(G('skcusparch', x0 + 4 * u, t0 + 6 * u, 46 * u, b0 - t0 - 7 * u, [C.ink, C.acc, C.paper], { fill: true }));
      els.push(G('skcouple', x0 + 8 * u, t0 + 30 * u, 38 * u, b0 - t0 - 33 * u, [C.ink, C.acc, C.paper]));
      els.push(emblem(decor.emblem, C, x0 + w0 * 0.62 - 7 * u, t0 + 8 * u, 14 * u));
      els.push(...flow([it(D.title, 10 * u, F.title, C.ink, { wide: F.tw, gap: 2 * u }), it(short.replace(/\n/g, ' '), 5.4 * u, F.name, C.acc, { wide: F.nw, gap: 2 * u }), it(D.date, 3 * u, F.body, C.ink, { wide: F.bw, weight: '700' })], { x: x0 + 56 * u, y: t0 + 24 * u, w: w0 - 58 * u, h: 40 * u }));
      els.push(sideOrn(decor.side, C, x0 + w0 * 0.62 - 6 * u, b0 - 16 * u, 12 * u));
    } else {
      els.push(G('omandala', W / 2 - 34 * u, t0 + 6 * u, 68 * u, 68 * u, [mix(C.ink, C.paper, 0.7), C.acc, mix(C.ink, C.paper, 0.6)], { style: 'line', layers: 4 }, { seed: 33 }));
      els.push(box(W / 2 - 22 * u, t0 + 18 * u, 44 * u, 44 * u, { fill: C.paper, stroke: C.ink, strokeW: Math.max(2, Math.round(0.5 * u)), radius: Math.round(22 * u), name: 'Medallion' }));
      els.push(...flow([it(short, 6 * u, F.name, C.ink, { wide: F.nw, lh: 1.15 })], { x: W / 2 - 17 * u, y: t0 + 24 * u, w: 34 * u, h: 32 * u }));
      els.push(...flow([it(D.title, 8 * u, F.title, C.ink, { wide: F.tw })], { x: x0, y: t0 + 76 * u, w: w0, h: 10 * u }));
      els.push(G('skgroom', x0 + 6 * u, t0 + 30 * u, 14 * u, 50 * u, [C.ink, C.acc, C.paper]), G('skbride', x0 + w0 - 20 * u, t0 + 30 * u, 14 * u, 50 * u, [C.ink, C.acc, C.paper]));
    }
    return { name: 'Cover front', bg: solidBg(C.paper), elements: els };
  }
  // envelope side with the address box
  const v = (dz.no + 1) % 3;
  els.push(...flow([it(D.invoke, 2.5 * u, F.body, C.ink, { weight: '700', wide: F.bw })], { x: x0, y: t0, w: w0, h: 4 * u }));
  const addr = (ax, ay, aw, ah) => [
    ...flow([it(W_.to, 2.8 * u, F.name, C.ink, { wide: F.nw })], { x: ax, y: ay - 6 * u, w: 40 * u, h: 5 * u }, 'left'),
    G('skaddress', ax, ay, aw, ah, [C.ink, C.acc, C.paper]),
    ...flow([it(W_.sriman, 2.6 * u, F.body, C.ink, { wide: F.bw, weight: '600' })], { x: ax + aw * 0.13, y: ay + ah * 0.19, w: aw * 0.7, h: 5 * u }, 'left'),
  ];
  const sender = (sx, sy, sw, align) => flow([it(W_.from, 2.4 * u, F.name, C.acc, { wide: F.nw, gap: 0.4 * u }), it(D.vineet, 3 * u, F.name, C.ink, { wide: F.nw, gap: 0.3 * u }), it(D.vineetPlace, 2.1 * u, F.body, C.soft, { wide: F.bw }), it(D.phone ? `${W_.phone} ${D.phone}` : '', 2.1 * u, F.body, C.soft, { wide: F.bw })], { x: sx, y: sy, w: sw, h: 19 * u }, align);
  const family = (fx, fy, fw) => flow([it(D.family, 4.6 * u, F.title, C.ink, { wide: F.tw }), it(W_.invite, 2.6 * u, F.name, C.ink, { wide: F.nw })], { x: fx, y: fy, w: fw, h: 14 * u });
  if (v === 0) {
    els.push(G('oarch', x0 + 2 * u, t0 + 6 * u, 34 * u, 44 * u, [C.ink, C.acc, C.paper], { kind: 'outline' }), ...flow([it(short, 6 * u, F.name, C.ink, { wide: F.nw, lh: 1.15 })], { x: x0 + 6.5 * u, y: t0 + 16 * u, w: 25 * u, h: 31 * u }));
    els.push(emblem(decor.emblem, C, x0 + w0 - 22 * u, t0 + 4 * u, 12 * u), ...flow([it(W_.shubh, 7 * u, F.title, C.ink, { wide: F.tw })], { x: x0 + w0 - 46 * u, y: t0 + 16 * u, w: 46 * u, h: 10 * u }));
    els.push(...addr(x0 + 42 * u, t0 + 30 * u, 72 * u, 36 * u), ...sender(x0 + 2 * u, b0 - 20 * u, 34 * u, 'left'), ...family(W / 2 - 22 * u, b0 - 15 * u, 44 * u));
    els.push(G('skbaraat', x0 + w0 - 52 * u, b0 - 26 * u, 52 * u, 24 * u, [C.ink, C.acc, C.paper], { mirror: true }));
  } else if (v === 1) {
    els.push(...flow([it(W_.shubh, 9 * u, F.title, C.ink, { wide: F.tw })], { x: x0, y: t0 + 6 * u, w: w0, h: 12 * u }));
    els.push(sideOrn(decor.side, C, x0 + w0 / 2 - 34 * u, t0 + 7 * u, 10 * u), sideOrn(decor.side, C, x0 + w0 / 2 + 24 * u, t0 + 7 * u, 10 * u));
    els.push(box(W / 2 - 15 * u, t0 + 19 * u, 30 * u, 5 * u, { fill: C.ink, radius: Math.round(2.5 * u), name: 'Date band' }), ...flow([it(D.shortDate, 2.6 * u, F.body, C.paper, { weight: '700', wide: F.bw })], { x: W / 2 - 15 * u, y: t0 + 19 * u, w: 30 * u, h: 5 * u }));
    els.push(...addr(W / 2 - 38 * u, t0 + 34 * u, 76 * u, 32 * u));
    els.push(...sender(x0 + 2 * u, b0 - 20 * u, 40 * u, 'left'), ...flow([it(short.replace(/\n/g, ' '), 4.6 * u, F.name, C.acc, { wide: F.nw })], { x: x0 + w0 - 50 * u, y: b0 - 16 * u, w: 48 * u, h: 7 * u }, 'right'), ...flow([it(`${D.family} ${W_.invite}`, 2.4 * u, F.body, C.ink, { wide: F.bw, weight: '700' })], { x: x0 + w0 - 60 * u, y: b0 - 8 * u, w: 58 * u, h: 5 * u }, 'right'));
  } else {
    els.push(G('skgroom', x0 + 2 * u, t0 + 10 * u, 16 * u, b0 - t0 - 12 * u, [C.ink, C.acc, C.paper]), G('skbride', x0 + w0 - 18 * u, t0 + 10 * u, 16 * u, b0 - t0 - 12 * u, [C.ink, C.acc, C.paper]));
    els.push(...family(W / 2 - 30 * u, t0 + 6 * u, 60 * u));
    els.push(...addr(W / 2 - 34 * u, t0 + 30 * u, 68 * u, 32 * u));
    els.push(...sender(W / 2 - 30 * u, b0 - 21 * u, 60 * u, 'center'));
  }
  return { name: 'Cover', bg: solidBg(C.paper), elements: els };
}

function insert(dz, D, W_, W, H) {
  const u = H / 100, HW = W / 2, P = dz.parts, C = colours(dz.ink, dz.decor), F = fonts(P.font, D.lang === 'hi'), decor = DECOR[dz.decor];
  const L = frame(P.frame, C, 0, HW, H, u, 'left'), R = frame(P.frame, C, HW, HW, H, u, 'right');
  const els = [...L.els, ...R.els];
  els.push(sideOrn(decor.side, C, L.x + L.w / 2 - 5 * u, L.top + 1 * u, 10 * u));
  els.push(...flow([it(D.reception, 5.6 * u, F.title, C.ink, { wide: F.tw, gap: 1.2 * u, lh: 1.15 }), it(D.receptionWhen, 2.7 * u, F.name, C.acc, { wide: F.nw, gap: 0.7 * u }), it(D.receptionWhere, 2.4 * u, F.body, C.ink, { wide: F.bw, lh: 1.35 })], { x: L.x, y: L.top + 13 * u, w: L.w, h: 30 * u }));
  const q = Math.min(24 * u, L.bottom - L.top - 60 * u);
  els.push(qrEl(D.map, L.x + L.w / 2 - q / 2, L.top + 47 * u, q, C.ink, C.paper), ...flow([it(W_.scan, 2.1 * u, F.body, C.ink, { wide: F.bw, weight: '700' })], { x: L.x, y: L.top + 48 * u + q, w: L.w, h: 4 * u }));
  els.push(...flow([it(`${W_.vineet} : ${D.vineet}${D.phone ? ` · ${D.phone}` : ''}`, 2.2 * u, F.body, C.ink, { wide: F.bw, weight: '600' })], { x: L.x, y: L.bottom - 5 * u, w: L.w, h: 5 * u }));
  const art = { baraat: 'skbaraat', couple: 'skcouple', doli: 'pdoli', palace: 'opalace', figures: 'skcouple', music: 'pdhol' }[P.art];
  els.push(...flow([it(D.kidsTitle, 5.4 * u, F.title, C.acc, { wide: F.tw, gap: u }), it(D.kids, 2.6 * u, F.script, C.ink, { wide: F.sw, lh: 1.45, gap: u }), it(D.kidsNames, 2.5 * u, F.name, C.ink, { wide: F.nw })], { x: R.x, y: R.top + 2 * u, w: R.w, h: 34 * u }));
  els.push(G(art, R.x, R.top + 38 * u, R.w, R.bottom - R.top - 54 * u, [C.ink, C.acc, C.paper], { style: 'line' }));
  els.push(hline(R.x, R.bottom - 14 * u, R.w, C.ink, 0.22 * u));
  els.push(...flow([it(D.baraat, 2.2 * u, F.body, C.ink, { wide: F.bw, gap: 0.5 * u, lh: 1.35 }), it(W_.note, 2 * u, F.body, C.soft, { wide: F.bw, lh: 1.35 })], { x: R.x, y: R.bottom - 13 * u, w: R.w, h: 13 * u }));
  return { name: 'Reception insert', bg: solidBg(C.paper), elements: els };
}

function single(dz, D, W_, W, H) {
  const u = H / 100, P = dz.parts, C = colours(dz.ink, dz.decor), F = fonts(P.font, D.lang === 'hi'), decor = DECOR[dz.decor];
  const fr = frame(P.frame, C, 0, W, H, u, 'both');
  const els = [...fr.els];
  const x0 = fr.x, w0 = fr.w;
  let y = fr.top;
  els.push(...header(P.header === 'tabs' || P.header === 'ribbon' ? P.header : 'kalash', { ...D, programTitle: W_.vaivahik }, F, C, decor, { x: x0 + w0 * 0.18, y, w: w0 * 0.64, h: 17 * u }, u));
  els.push(...flow([it(D.shloka, 1.8 * u, F.body, C.soft, { wide: F.bw, lh: 1.3 })], { x: x0, y, w: w0 * 0.17, h: 14 * u }, 'left'));
  els.push(...flow([it(D.kids, 1.8 * u, F.script, C.soft, { wide: F.sw, lh: 1.3 })], { x: x0 + w0 * 0.83, y, w: w0 * 0.17, h: 14 * u }, 'right'));
  y += 18 * u;
  const evStyle = ['pills', 'table', 'timeline', 'ribbon'].includes(P.events) ? 'table' : P.events;
  const eh = Math.min(24 * u, (fr.bottom - y) * 0.36);
  els.push(...program(evStyle, D, F, C, { x: x0 + 2 * u, y, w: w0 - 4 * u, h: eh }, u));
  y += eh + 2 * u;
  const nh = Math.min(19 * u, (fr.bottom - y) * 0.45);
  els.push(...names(['side', 'arches'].includes(P.names) ? P.names : 'side', D, W_, F, C, { x: x0, y, w: w0, h: nh }, u));
  y += nh + 0.5 * u;
  els.push(...flow([it(`${W_.parinay} · ${D.date} · ${W_.venue}: ${D.venue}`, 2.1 * u, F.name, C.ink, { wide: F.nw, lh: 1.3 })], { x: x0, y, w: w0, h: 5 * u }));
  y += 5.5 * u;
  els.push(...familyBlock(P.lists === 'stack' ? 'three' : P.lists, D, W_, F, C, { x: x0, y, w: w0, h: fr.bottom - y }, u));
  return { name: 'Card', bg: solidBg(C.paper), elements: els };
}

export function buildPatrika(dz, D, W_, pages, W, H) {
  if (pages <= 1) return [single(dz, D, W_, W, H)];
  const sp = spread(dz, D, W_, W, H);
  if (pages === 2) return [cover(dz, D, W_, W, H, false), sp];
  if (pages === 3) return [cover(dz, D, W_, W, H, false), sp, insert(dz, D, W_, W, H)];
  return [cover(dz, D, W_, W, H, true), cover(dz, D, W_, W, H, false), sp, insert(dz, D, W_, W, H)];
}
