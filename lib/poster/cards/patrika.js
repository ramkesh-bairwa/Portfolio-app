// Printing-press style wedding cards ("kumkum patrika"): envelope cover, a left page with the mangal karyakram
// and a right page with both families and the invitation, the way Indian card presses lay them out.
// 10 styles × 5 ink colours = 50 themes; each works with every function's wording, in Hindi and English.
//   pages: 1 = everything on one sheet · 2 = left + right inner pages · 3 = cover + left + right
import { graphicEl, r, shapeEl, slotEl, stack, textEl } from '../kit';

const G = (fam, x, y, w, h, colors, params = {}, o = {}) => graphicEl(fam, r(x), r(y), r(w), r(h), { colors, params, ...o });
const solidBg = (c) => ({ type: 'solid', color: c, from: c, to: c, angle: 135, image: '', overlay: 0 });
const mix = (a, b, k) => {
  const p = (h) => { const m = /^#([0-9a-f]{6})$/i.exec(h || ''); const n = m ? parseInt(m[1], 16) : 0; return [n >> 16, (n >> 8) & 255, n & 255]; };
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
};

// ---------- colours and type ----------
const INKS = {
  black: { label: 'Black ink', hiLabel: 'काली स्याही', ink: '#1A1A1A', paper: '#FFFFFF', accent: '#1A1A1A', soft: '#3F3F46' },
  maroon: { label: 'Maroon', hiLabel: 'मैरून', ink: '#6B0F1A', paper: '#FFF9F0', accent: '#B8860B', soft: '#5C2A2A' },
  kumkum: { label: 'Kumkum on yellow', hiLabel: 'कुमकुम', ink: '#9B0A0A', paper: '#FFF1BF', accent: '#C2410C', soft: '#6B1A07' },
  navy: { label: 'Navy & gold', hiLabel: 'नीला', ink: '#13265C', paper: '#F8F6F0', accent: '#B8860B', soft: '#334155' },
  green: { label: 'Mehndi green', hiLabel: 'हरा', ink: '#14532D', paper: '#FBFBF3', accent: '#B45309', soft: '#365314' },
};
// Each style: page dressing, programme look, ornaments, art and fonts
const STYLES = [
  { key: 'arch', name: 'Arch Patrika', hiName: 'मेहराब पत्रिका', frame: 'dashed', gutter: 'arch', events: 'dots', side: 'kalash', art: ['pdhol', 'pshehnai'], emblem: 'ganesh', hi: ['Yatra One', 'Martel'], en: ['Cinzel', 'Lora'] },
  { key: 'oval', name: 'Oval Pillar', hiName: 'स्तंभ पत्रिका', frame: 'double', gutter: 'oval', events: 'pills', side: 'swastik', art: ['pcouple'], emblem: 'kalash', hi: ['Rozha One', 'Laila'], en: ['Playfair Display', 'EB Garamond'] },
  { key: 'scroll', name: 'Scroll Banner', hiName: 'पताका पत्रिका', frame: 'ornate', gutter: '', events: 'scroll', side: 'divider', art: ['pdoli'], emblem: 'ganesh', hi: ['Amita', 'Martel'], en: ['Cinzel Decorative', 'Lora'] },
  { key: 'badge', name: 'Arch Badges', hiName: 'तोरण बैज', frame: 'chain', gutter: '', events: 'badges', side: 'swastik', art: ['pmandap'], emblem: 'om', hi: ['Palanquin Dark', 'Mukta'], en: ['DM Serif Display', 'Jost'] },
  { key: 'boxed', name: 'Kalash Boxed', hiName: 'कलश पत्रिका', frame: 'double', gutter: '', events: 'boxed', side: 'kalash', art: ['pdhol'], emblem: 'kalash', hi: ['Eczar', 'Hind'], en: ['Marcellus', 'Jost'] },
  { key: 'table', name: 'Ganesh Classic', hiName: 'गणेश क्लासिक', frame: 'single', gutter: 'line', events: 'table', side: 'divider', art: ['pshehnai'], emblem: 'ganesh', hi: ['Tiro Devanagari Hindi', 'Tiro Devanagari Hindi'], en: ['Cormorant Garamond', 'EB Garamond'] },
  { key: 'mandala', name: 'Mandala Corner', hiName: 'मंडल पत्रिका', frame: 'mandala', gutter: '', events: 'dots', side: 'lotus', art: ['pcouple'], emblem: 'ganesh', hi: ['Rozha One', 'Gotu'], en: ['Playfair Display', 'Lora'] },
  { key: 'paisley', name: 'Paisley Border', hiName: 'कैरी बॉर्डर', frame: 'paisley', gutter: '', events: 'pills', side: 'kalash', art: ['pdoli'], emblem: 'swastik', hi: ['Yatra One', 'Laila'], en: ['Cinzel', 'EB Garamond'] },
  { key: 'toran', name: 'Marigold Toran', hiName: 'गेंदा तोरण', frame: 'toran', gutter: '', events: 'badges', side: 'diya', art: ['pmandap'], emblem: 'ganesh', colour: true, hi: ['Amita', 'Mukta'], en: ['Cinzel Decorative', 'Jost'] },
  { key: 'photo', name: 'Couple Photo', hiName: 'फोटो पत्रिका', frame: 'wave', gutter: '', events: 'boxed', side: 'swastik', art: ['pcouple'], emblem: 'ganesh', colour: true, photo: true, hi: ['Palanquin Dark', 'Mukta'], en: ['DM Serif Display', 'Montserrat'] },
];

// Ink-major order so the first screen of a gallery shows every style
export const PATRIKA_THEMES = Object.entries(INKS).flatMap(([ik, ink]) => STYLES.map((st) => ({
  key: `patrika-${st.key}-${ik}`, name: `${st.name} · ${ink.label}`, layout: `patrika ${st.hiName}`, patrika: true, style: st, inkKey: ik, ...ink,
  // fields other card code reads
  bg: ink.paper, gold: ink.accent, gold2: ink.accent, dark: false,
})));

const LABELS = {
  hi: { to: 'प्रतिष्ठार्थ,', sriman: 'श्रीमान / श्रीमती', from: 'प्रेषक :', dear: 'सम्मानित स्नेही स्वजन,', blessing: 'परमपिता परमेश्वर की असीम अनुकम्पा से', darshan: 'दर्शनाभिलाषी', vineet: 'विनीत', kids: 'बाल मनुहार', venue: 'स्थान', invite: 'का स्नेहिल आमंत्रण', note: 'कृपया इसी पत्रिका को व्यक्तिगत निमंत्रण मानकर पधारें।' },
  en: { to: 'To,', sriman: 'Mr. / Mrs.', from: 'From :', dear: 'Dear family & friends,', blessing: 'With the blessings of the Almighty,', darshan: 'Eagerly awaiting', vineet: 'With best compliments', kids: 'Kids’ request', venue: 'Venue', invite: 'warmly invite you', note: 'Kindly treat this card as a personal invitation.' },
};

// ---------- text helpers ----------
// Room kept clear beside the fold for the arch / oval that spans both inner pages
const GUTTER = 21;
const isHi = (txt) => /[ऀ-ॿ]/.test(txt.title || '');
function fonts(T, hi) {
  const [display, body] = hi ? T.style.hi : T.style.en;
  return { display, body, hand: 'Kalam', wide: hi ? 0.72 : 0.58, dWide: hi ? 0.74 : 0.66 };
}
const it = (text, size, font, color, o = {}) => text && { kind: 'text', text: String(text), size, font, color, weight: o.weight || '400', lh: o.lh || 1.3, wide: o.wide, gap: o.gap || 0, upper: o.upper, italic: o.italic, ls: o.ls };
const flow = (list, box, align = 'center', valign = 'center') => stack(list.filter(Boolean), box, { align, valign });

// ---------- page dressing ----------
// side: cover | left | right | single. Returns decoration elements and the inner box text goes into.
function dress(T, W, H, side) {
  const st = T.style, s = W / 100, ink = T.ink, acc = T.accent, paper = T.paper;
  const els = [];
  let m = 4 * s, top = 0, bottom = 0;
  const rect = (mm, o) => shapeEl('rect', r(mm), r(mm), r(W - 2 * mm), r(H - 2 * mm), { fill: 'transparent', stroke: ink, strokeW: Math.max(1, r(0.3 * s)), name: 'Frame line', ...o });
  if (st.frame === 'dashed') { els.push(rect(2.6 * s, { strokeW: Math.max(2, r(0.5 * s)) }), rect(4.4 * s, { dash: true })); m = 6 * s; }
  else if (st.frame === 'double') { els.push(rect(2.6 * s, { strokeW: Math.max(2, r(0.6 * s)) }), rect(3.8 * s)); m = 6 * s; }
  else if (st.frame === 'single') { els.push(rect(3 * s, { strokeW: Math.max(2, r(0.45 * s)) })); m = 5.5 * s; }
  else if (st.frame === 'ornate') { els.push(G('oframe', 1.5 * s, 1.5 * s, W - 3 * s, H - 3 * s, [ink, acc, ink], { style: 'flourish' })); m = 11 * s; }
  else if (st.frame === 'chain') {
    els.push(rect(2.4 * s));
    const n = Math.floor((H - 8 * s) / (4.2 * s));
    for (let i = 0; i < n; i++) {
      const y = 4 * s + i * 4.2 * s;
      els.push(shapeEl('diamond', r(3.6 * s), r(y), r(3.2 * s), r(3.2 * s), { fill: i % 2 ? 'transparent' : ink, stroke: ink, strokeW: 1, name: 'Border' }));
      els.push(shapeEl('diamond', r(W - 6.8 * s), r(y), r(3.2 * s), r(3.2 * s), { fill: i % 2 ? 'transparent' : ink, stroke: ink, strokeW: 1, name: 'Border' }));
    }
    m = 9 * s;
  } else if (st.frame === 'mandala') {
    els.push(rect(2.5 * s));
    const D = 26 * s;
    [[-D / 2, -D / 2], [W - D / 2, -D / 2], [-D / 2, H - D / 2], [W - D / 2, H - D / 2]].forEach(([x, y]) => els.push(G('omandala', x, y, D, D, [ink, acc, ink], { style: 'line', layers: 4 }, { seed: 17, opacity: 0.8 })));
    m = 11 * s;
  } else if (st.frame === 'paisley') {
    els.push(rect(2.5 * s));
    els.push(G('opaisley', 3 * s, 3 * s, W - 6 * s, 6 * s, [ink, acc, ink], { kind: 'border' }), G('opaisley', 3 * s, H - 9 * s, W - 6 * s, 6 * s, [ink, acc, ink], { kind: 'border' }));
    m = 10.5 * s;
  } else if (st.frame === 'toran') {
    els.push(rect(2.5 * s, { stroke: acc, strokeW: Math.max(2, r(0.6 * s)) }));
    els.push(G('ogarland', 0, 0, W, 13 * s, ['#FF8C00', '#FFC300', '#2E7D32', '#E11D48'], { flower: 'marigold', strands: 1, drop: 'bell' }));
    els.push(shapeEl('rect', 0, r(H - 2.4 * s), W, r(2.4 * s), { fill: acc, name: 'Base band' }));
    m = 6 * s;
    top = 14 * s;
  } else if (st.frame === 'wave') {
    els.push(shapeEl('rect', 0, r(H * 0.9), W, r(H * 0.1), { fill: ink, fill2: mix(ink, acc, 0.6), gradAngle: 135, name: 'Colour band' }));
    els.push(G('owaves', 0, H * 0.86, W, H * 0.06, [paper, paper], { layers: 1, amp: 1, top: true }));
    els.push(shapeEl('rect', 0, 0, W, r(1.6 * s), { fill: ink, name: 'Top band' }));
    m = 6 * s;
    bottom = H * 0.12;
  }
  // gutter decoration where the two inner pages meet
  if (side === 'left' || side === 'right') {
    const gx = side === 'left' ? W : 0;
    if (st.gutter === 'arch') {
      const aw = 2 * (GUTTER - 3) * s, ah = H * 0.62;
      els.push(G('oarch', gx - aw / 2, H - ah - 3 * s, aw, ah, [ink, ink, paper], { kind: 'outline' }, { opacity: 0.9 }));
    } else if (st.gutter === 'oval') {
      const ow = 2 * (GUTTER - 4) * s, oh = H * 0.66;
      els.push(shapeEl('circle', r(gx - ow / 2), r((H - oh) / 2), r(ow), r(oh), { fill: 'transparent', stroke: ink, strokeW: Math.max(2, r(0.7 * s)), name: 'Oval' }));
      els.push(shapeEl('circle', r(gx - ow / 2 + 2.4 * s), r((H - oh) / 2 + 2.4 * s), r(ow - 4.8 * s), r(oh - 4.8 * s), { fill: 'transparent', stroke: ink, strokeW: 1, dash: true, name: 'Oval' }));
    } else if (st.gutter === 'line') {
      els.push(shapeEl('line', r(side === 'left' ? W - 2 : 0), r(4 * s), 2, r(H - 8 * s), { fill: ink, stroke: ink, strokeW: 1, dash: true, opacity: 0.5, name: 'Fold line' }));
    }
  }
  const y0 = Math.max(m, top), y1 = H - Math.max(m, bottom);
  return { els, box: { x: m, y: y0, w: W - 2 * m, h: y1 - y0 } };
}

// ---------- ornaments ----------
// Symbols take [shape, details, leaves/ring]; single-ink cards get paper-tone details so nothing merges
const symbolCols = (T) => (T.style.colour ? ['#C2410C', '#FACC15', '#15803D'] : [T.ink, T.paper, mix(T.ink, T.paper, 0.35)]);
function sideOrn(T, x, y, d) {
  const ink = T.ink, acc = T.accent;
  switch (T.style.side) {
    case 'kalash': return G('osymbol', x, y, d, d, symbolCols(T), { kind: 'kalash' });
    case 'swastik': return G('osymbol', x, y, d, d, [T.style.colour ? '#C2410C' : ink, mix(T.paper, acc, 0.18)], { kind: 'swastik', ring: true });
    case 'lotus': return G('oflora', x, y, d, d, [ink, acc, ink], { kind: 'lotusline' });
    case 'diya': return G('odiwali', x, y, d, d, ['#F59E0B', '#FDE68A', '#B45309'], { kind: 'big' });
    default: return G('osymbol', x, y, d, d, [ink, acc, T.paper], { kind: 'om' });
  }
}
function emblem(T, x, y, d) {
  const ink = T.ink, acc = T.accent;
  if (T.style.emblem === 'ganesh') return G('oganesh', x, y, d, d, [ink, acc, mix(T.paper, acc, 0.18)], { style: T.style.colour ? 'filled' : 'line', weight: 2.4 });
  if (T.style.emblem === 'kalash') return G('osymbol', x, y, d, d, symbolCols(T), { kind: 'kalash' });
  return G('osymbol', x, y, d, d, [T.style.colour ? '#C2410C' : ink, mix(T.paper, acc, 0.18)], { kind: T.style.emblem, ring: true });
}

// Frame around the couple's names on the cover, different for every style
function nameFrame(T, x, y, w, h, s) {
  const ink = T.ink, acc = T.accent, paper = T.paper;
  const line = { fill: 'transparent', stroke: ink, strokeW: Math.max(2, r(0.5 * s)) };
  switch (T.style.key) {
    case 'oval': return [shapeEl('circle', r(x), r(y), r(w), r(h), { ...line, name: 'Name frame' }), shapeEl('circle', r(x + 1.6 * s), r(y + 1.6 * s), r(w - 3.2 * s), r(h - 3.2 * s), { ...line, strokeW: 1, dash: true, name: 'Name frame' })];
    case 'scroll': case 'paisley': return [G('oframe', x - 3 * s, y, w + 6 * s, h, [ink, acc, ink], { style: T.style.key === 'scroll' ? 'filigree' : 'paisley' })];
    case 'badge': return [shapeEl('arch', r(x), r(y), r(w), r(h), { fill: mix(paper, acc, 0.1), stroke: ink, strokeW: Math.max(2, r(0.5 * s)), name: 'Name frame' })];
    case 'boxed': return [shapeEl('rounded', r(x), r(y), r(w), r(h), { ...line, radius: r(3 * s), name: 'Name frame' }), shapeEl('rounded', r(x + 1.4 * s), r(y + 1.4 * s), r(w - 2.8 * s), r(h - 2.8 * s), { ...line, strokeW: 1, radius: r(2.4 * s), name: 'Name frame' })];
    case 'table': return [shapeEl('circle', r(x + (w - h) / 2), r(y), r(h), r(h), { ...line, name: 'Name frame' })];
    case 'mandala': return [G('omandala', x + (w - h) / 2 - 4 * s, y - 4 * s, h + 8 * s, h + 8 * s, [mix(ink, paper, 0.72), mix(acc, paper, 0.5), mix(ink, paper, 0.6)], { style: 'line', layers: 3 }, { seed: 41, opacity: 0.7 })];
    case 'toran': return [G('oarch', x, y, w, h, [mix(paper, acc, 0.25), ink, paper], { kind: 'filled' })];
    default: return [G('oarch', x, y, w, h, [ink, acc, paper], { kind: 'outline' })];
  }
}
const rule = (T, x, y, w, s, o = {}) => shapeEl('rect', r(x), r(y), r(w), Math.max(1, r(0.25 * s)), { fill: T.ink, name: 'Rule', ...o });
const divider = (T, x, y, w, h) => G('odivider', x, y, w, h, [T.ink, T.accent, T.ink], { kind: 'scroll', center: 'lotus' });

// ---------- programme blocks ----------
function program(T, txt, F, box, s) {
  const list = (txt.program || []).slice(0, 6);
  const els = [];
  if (!list.length) return els;
  const ink = T.ink, acc = T.accent, paper = T.paper;
  const st = T.style.events;
  const longest = (t) => Math.max(...String(t).split(/\s+/).map((wd) => wd.length), 1);
  const name = (t, x, y, w, h, color = ink, size = 4.2) => flow([it(t, Math.min(size * s, (w * 0.9) / (longest(t) * F.dWide * 1.25)), F.display, color, { wide: F.dWide, lh: 1.15 })], { x, y, w, h });
  const when = (t, x, y, w, h, color = T.soft, size = 2.6) => flow([it(t, size * s, F.body, color, { wide: F.wide, lh: 1.3, weight: '600' })], { x, y, w, h });
  if (st === 'dots' || st === 'badges') {
    const cols = list.length <= 3 ? list.length : list.length === 4 ? 2 : 3;
    const rows = Math.ceil(list.length / cols);
    const cw = box.w / cols, rh = box.h / rows;
    list.forEach(([nm, wh], i) => {
      const x = box.x + (i % cols) * cw, y = box.y + Math.floor(i / cols) * rh;
      if (st === 'badges') {
        els.push(shapeEl('arch', r(x + cw * 0.06), r(y + rh * 0.04), r(cw * 0.88), r(rh * 0.78), { fill: T.style.colour ? mix(paper, acc, 0.12) : 'transparent', stroke: ink, strokeW: Math.max(1, r(0.35 * s)), name: 'Badge' }));
        for (let k = 0; k < 7; k++) els.push(shapeEl('rect', r(x + cw * (0.2 + k * 0.1)), r(y + rh * 0.83), 1, r(rh * 0.1), { fill: ink, name: 'Fringe' }));
        els.push(sideOrn(T, x + cw / 2 - 3.5 * s, y + rh * 0.09, 7 * s));
        els.push(...name(nm, x + cw * 0.12, y + rh * 0.3, cw * 0.76, rh * 0.22));
        els.push(...when(wh, x + cw * 0.12, y + rh * 0.52, cw * 0.76, rh * 0.26));
      } else {
        els.push(...name(nm, x + 1 * s, y, cw - 2 * s, rh * 0.42));
        els.push(...when(wh, x + 1 * s, y + rh * 0.44, cw - 2 * s, rh * 0.5));
        if (i % cols) els.push(shapeEl('circle', r(x - 1.3 * s), r(y + rh * 0.13), r(2.6 * s), r(2.6 * s), { fill: 'transparent', stroke: ink, strokeW: Math.max(2, r(0.6 * s)), name: 'Dot' }), shapeEl('circle', r(x - 0.55 * s), r(y + rh * 0.13 + 0.75 * s), r(1.1 * s), r(1.1 * s), { fill: ink, name: 'Dot' }));
      }
    });
    if (st === 'dots') els.push(rule(T, box.x, box.y - 1.2 * s, box.w, s), rule(T, box.x, box.y + box.h + 0.6 * s, box.w, s));
  } else if (st === 'pills' || st === 'table' || st === 'boxed') {
    const rh = box.h / list.length;
    list.forEach(([nm, wh], i) => {
      const y = box.y + i * rh;
      if (st === 'pills') {
        const filled = i % 2 === 0, pw = box.w * 0.42;
        els.push(shapeEl('rounded', r(box.x), r(y + rh * 0.12), r(pw), r(rh * 0.76), { fill: filled ? ink : 'transparent', stroke: ink, strokeW: Math.max(1, r(0.3 * s)), radius: r(rh * 0.38), name: 'Event tab' }));
        els.push(...name(nm, box.x + 2 * s, y + rh * 0.14, pw - 4 * s, rh * 0.72, filled ? paper : ink, 4.2));
        els.push(...flow([it(wh, 3 * s, F.body, ink, { wide: F.wide, weight: '600' })], { x: box.x + pw + 2.5 * s, y, w: box.w - pw - 2.5 * s, h: rh }, 'left'));
      } else if (st === 'table') {
        els.push(...flow([it(nm, 4 * s, F.display, ink, { wide: F.dWide })], { x: box.x, y, w: box.w * 0.4, h: rh }, 'left'));
        els.push(shapeEl('line', r(box.x + box.w * 0.41), r(y + rh / 2), r(box.w * 0.08), 2, { fill: acc, stroke: acc, strokeW: 2, dash: true, name: 'Leader' }));
        els.push(...flow([it(wh, 3 * s, F.body, T.soft, { wide: F.wide, weight: '600' })], { x: box.x + box.w * 0.5, y, w: box.w * 0.5, h: rh }, 'right'));
        if (i < list.length - 1) els.push(rule(T, box.x, y + rh - 1, box.w, s, { opacity: 0.25 }));
      } else {
        els.push(shapeEl('rounded', r(box.x), r(y + rh * 0.08), r(box.w), r(rh * 0.84), { fill: T.style.colour ? mix(paper, acc, 0.1) : 'transparent', stroke: ink, strokeW: Math.max(1, r(0.3 * s)), radius: r(1.4 * s), name: 'Event box' }));
        els.push(shapeEl('rect', r(box.x), r(y + rh * 0.08), r(box.w * 0.34), r(rh * 0.84), { fill: ink, name: 'Event tab' }));
        els.push(...name(nm, box.x + 1.5 * s, y + rh * 0.1, box.w * 0.34 - 3 * s, rh * 0.8, paper, 4));
        els.push(...flow([it(wh, 3 * s, F.body, ink, { wide: F.wide, weight: '600' })], { x: box.x + box.w * 0.38, y, w: box.w * 0.6, h: rh }, 'left'));
      }
    });
  } else if (st === 'scroll') {
    const cols = Math.min(2, list.length), rows = Math.ceil(list.length / cols);
    const cw = box.w / cols, rh = box.h / rows;
    list.forEach(([nm, wh], i) => {
      const x = box.x + (i % cols) * cw, y = box.y + Math.floor(i / cols) * rh;
      els.push(shapeEl('rect', r(x + cw * 0.06), r(y + rh * 0.04), r(cw * 0.88), Math.max(3, r(0.8 * s)), { fill: ink, name: 'Rod' }));
      els.push(shapeEl('circle', r(x + cw * 0.03), r(y + rh * 0.04 - 0.6 * s), r(2 * s), r(2 * s), { fill: ink, name: 'Rod end' }), shapeEl('circle', r(x + cw * 0.95 - 2 * s), r(y + rh * 0.04 - 0.6 * s), r(2 * s), r(2 * s), { fill: ink, name: 'Rod end' }));
      els.push(shapeEl('pentagon', r(x + cw * 0.12), r(y + rh * 0.07), r(cw * 0.76), r(rh * 0.86), { fill: 'transparent', stroke: ink, strokeW: Math.max(1, r(0.35 * s)), rot: 180, name: 'Banner' }));
      els.push(...when(wh, x + cw * 0.18, y + rh * 0.12, cw * 0.64, rh * 0.3, ink));
      els.push(...name(nm, x + cw * 0.18, y + rh * 0.42, cw * 0.64, rh * 0.26));
    });
  }
  return els;
}

// ---------- art band ----------
function artBand(T, x, y, w, h, which = 0) {
  const fam = T.style.art[which % T.style.art.length];
  const style = T.style.colour ? 'fill' : 'line';
  return G(fam, x, y, w, h, [T.ink, T.accent, T.paper], { style });
}

// ---------- pages ----------
function coverPage(T, txt, L, F, W, H) {
  const s = W / 100, D = dress(T, W, H, 'cover'), b = D.box, ink = T.ink, acc = T.accent;
  const els = [...D.els];
  // vertical spacing shrinks when the page dressing leaves less room (garland, colour band)
  const k = Math.min(1, b.h / (128 * s));
  els.push(...flow([it(txt.invoke, 3 * s, F.body, ink, { weight: '600', wide: F.wide })], { x: b.x, y: b.y, w: b.w, h: 4 * s }));
  els.push(emblem(T, W / 2 - 9 * s, b.y + 5 * s * k, 18 * s));
  els.push(sideOrn(T, b.x + 2 * s, b.y + 8 * s * k, 12 * s), sideOrn(T, b.x + b.w - 14 * s, b.y + 8 * s * k, 12 * s));
  els.push(...flow([it(txt.title, 11 * s, F.display, ink, { wide: F.dWide, lh: 1.1 })], { x: b.x, y: b.y + 24 * s * k, w: b.w, h: 14 * s }));
  if (txt.short) els.push(shapeEl('rounded', r(W / 2 - 18 * s), r(b.y + 38.5 * s * k), r(36 * s), r(6 * s), { fill: ink, radius: r(3 * s), name: 'Date ribbon' }), ...flow([it(txt.short, 3.4 * s, F.body, T.paper, { weight: '700', wide: F.wide })], { x: W / 2 - 17 * s, y: b.y + 38.5 * s * k, w: 34 * s, h: 6 * s }));
  // couple names in an arch frame
  const ny = b.y + 46 * s * k, nh = 33 * s * k;
  if (T.style.photo) {
    els.push(slotEl('person', r(W / 2 - 16 * s), r(ny - 1 * s), r(32 * s), r(32 * s), { mask: 'circle', stroke: acc, strokeW: r(0.8 * s), phBg: '#F1F5F9', phBg2: '#CBD5E1', name: 'Couple photo' }));
    els.push(...flow([it(txt.a, 7 * s, F.display, ink, { wide: F.dWide })], { x: b.x, y: ny + 6 * s, w: W / 2 - 18 * s - b.x, h: 18 * s }, 'right'));
    if (txt.b) els.push(...flow([it(txt.b, 7 * s, F.display, ink, { wide: F.dWide })], { x: W / 2 + 18 * s, y: ny + 6 * s, w: W / 2 - 18 * s - b.x, h: 18 * s }, 'left'));
  } else {
    els.push(...nameFrame(T, W / 2 - 24 * s, ny, 48 * s, nh, s));
    els.push(...flow([it(txt.a, 9 * s, F.display, ink, { wide: F.dWide, gap: 1 * s }), txt.b && it(txt.join || '&', 5 * s, F.hand, acc, { gap: 1 * s }), txt.b && it(txt.b, 9 * s, F.display, ink, { wide: F.dWide })], { x: W / 2 - 17 * s, y: ny + 7 * s, w: 34 * s, h: nh - 9 * s }));
  }
  // address box
  const ay = b.y + b.h - 44 * s * k, aw = b.w * 0.86, ax = (W - aw) / 2;
  els.push(...flow([it(L.to, 3.6 * s, F.body, ink, { weight: '700', wide: F.wide })], { x: ax, y: ay, w: aw, h: 5 * s }, 'left'));
  els.push(shapeEl('rounded', r(ax), r(ay + 6 * s), r(aw), r(22 * s), { fill: T.style.colour ? '#FFFFFF' : 'transparent', stroke: ink, strokeW: Math.max(2, r(0.45 * s)), radius: r(6 * s), name: 'Address box' }));
  els.push(...flow([it(L.sriman, 3.3 * s, F.body, ink, { weight: '600', wide: F.wide })], { x: ax + 6 * s, y: ay + 8 * s, w: aw - 12 * s, h: 5 * s }, 'left'));
  [0, 1, 2].forEach((k) => els.push(rule(T, ax + 6 * s, ay + 14 * s + k * 4.6 * s, aw - 12 * s, s, { opacity: 0.6 })));
  // sender
  els.push(...flow([it(L.from, 3 * s, F.body, acc, { weight: '700', wide: F.wide, gap: 0.6 * s }), it(txt.hosts, 3.4 * s, F.display, ink, { wide: F.dWide, gap: 0.4 * s }), it(txt.venue, 2.8 * s, F.body, T.soft, { wide: F.wide })], { x: b.x + 2 * s, y: b.y + b.h - 15 * s * k, w: b.w - 4 * s, h: 15 * s }, 'left'));
  return { name: 'Cover', bg: solidBg(T.paper), elements: els };
}

function leftPage(T, txt, L, F, W, H) {
  const s = W / 100, D = dress(T, W, H, 'left'), b = D.box, ink = T.ink;
  const els = [...D.els];
  const narrow = T.style.gutter === 'arch' || T.style.gutter === 'oval' ? W - b.x - GUTTER * s : b.w;
  els.push(...flow([it(txt.invoke, 3 * s, F.body, ink, { weight: '700', wide: F.wide, gap: 0.8 * s }), it(txt.mantra, 2.6 * s, F.body, T.soft, { wide: F.wide, lh: 1.4 })], { x: b.x, y: b.y, w: b.w, h: 11 * s }));
  const ty = b.y + 12 * s;
  els.push(sideOrn(T, b.x + 1 * s, ty, 11 * s), sideOrn(T, b.x + b.w - 12 * s, ty, 11 * s));
  els.push(...flow([it(txt.programTitle || txt.title, 8 * s, F.display, ink, { wide: F.dWide })], { x: b.x + 13 * s, y: ty, w: b.w - 26 * s, h: 11 * s }));
  if (T.style.side === 'divider') els.push(divider(T, W / 2 - 18 * s, ty + 11 * s, 36 * s, 4 * s));
  const py = ty + 16 * s, ph = b.h * 0.42;
  els.push(...program(T, txt, F, { x: b.x + 1 * s, y: py, w: narrow - 2 * s, h: ph }, s));
  let y = py + ph + 3 * s;
  if (txt.venue) {
    els.push(rule(T, b.x, y, narrow, s));
    els.push(...flow([it(`${L.venue}: ${txt.venue}`, 3.4 * s, F.display, ink, { wide: F.dWide })], { x: b.x, y: y + 1 * s, w: narrow, h: 7 * s }));
    els.push(rule(T, b.x, y + 9 * s, narrow, s));
    y += 11 * s;
  }
  const kidsH = txt.kids ? 17 * s : 0;
  const artH = b.y + b.h - y - kidsH - 2 * s;
  if (artH > 10 * s) els.push(artBand(T, b.x, y, narrow, artH, 0));
  if (txt.kids) {
    const [head, ...rest] = String(txt.kids).split(/[:：]\s*/);
    const body = rest.length ? rest.join(': ') : head;
    const ky = b.y + b.h - kidsH;
    els.push(shapeEl('rounded', r(b.x), r(ky), r(narrow), r(kidsH - 1 * s), { fill: 'transparent', stroke: ink, strokeW: 1, dash: true, radius: r(2 * s), name: 'Kids box' }));
    els.push(...flow([it(rest.length ? head : L.kids, 3.6 * s, F.display, T.accent, { wide: F.dWide, gap: 0.6 * s }), it(body, 3 * s, F.hand, ink, { wide: F.wide, lh: 1.35 })], { x: b.x + 2 * s, y: ky + 1 * s, w: narrow - 4 * s, h: kidsH - 3 * s }));
  }
  return { name: 'Programme', bg: solidBg(T.paper), elements: els };
}

function rightPage(T, txt, L, F, W, H) {
  const s = W / 100, D = dress(T, W, H, 'right'), b = D.box, ink = T.ink, acc = T.accent;
  const els = [...D.els];
  const off = T.style.gutter === 'arch' || T.style.gutter === 'oval' ? GUTTER * s - b.x : 0;
  const x = b.x + off, w = b.w - off;
  els.push(...flow([it(L.dear, 3.4 * s, F.display, ink, { wide: F.dWide, gap: 0.6 * s }), it(`${L.blessing} ${txt.hosts || ''} ${txt.intro || ''}`.trim(), 3 * s, F.body, T.soft, { wide: F.wide, lh: 1.45 })], { x, y: b.y, w, h: 14 * s }, 'left'));
  let y = b.y + 15 * s;
  const nameBlock = (full, rel, yy) => flow([it(full, 8.5 * s, F.display, ink, { wide: F.dWide, gap: 0.8 * s }), it(rel, 2.9 * s, F.body, T.soft, { wide: F.wide, lh: 1.4 })], { x, y: yy, w, h: 17 * s });
  if (T.style.photo) { els.push(slotEl('person', r(x + w / 2 - 13 * s), r(y), r(26 * s), r(26 * s), { mask: 'circle', stroke: acc, strokeW: r(0.8 * s), phBg: '#F1F5F9', phBg2: '#CBD5E1', name: 'Couple photo' })); y += 28 * s; }
  els.push(...nameBlock(txt.aFull || txt.a, txt.aRel, y));
  y += 18 * s;
  // couple functions get the rings and the second name; one-person functions (mundan, namkaran…) skip them
  if (txt.bFull || txt.b) {
  els.push(G('orings', x + w / 2 - 9 * s, y, 8 * s, 8 * s, [acc, ink]), ...flow([it(txt.with || '&', 5.5 * s, F.hand, acc)], { x: x + w / 2, y, w: 14 * s, h: 8 * s }, 'left'));
  y += 9 * s;
  els.push(...nameBlock(txt.bFull || txt.b, txt.bRel, y));
  y += 19 * s;
  } else y += 4 * s;
  const outroH = T.style.photo ? 14 * s : 20 * s;
  els.push(...flow([it(txt.outro, 3.3 * s, F.body, ink, { wide: F.wide, lh: 1.45, gap: 1 * s }), it([txt.date, txt.time].filter(Boolean).join(' · '), 3.4 * s, F.display, acc, { wide: F.dWide })], { x, y, w, h: outroH }));
  y += outroH + 2 * s;
  els.push(rule(T, x, y, w, s));
  const cy = y + 2 * s, ch = b.y + b.h - cy;
  const colW = (w - 4 * s) / 2;
  els.push(...flow([it(`:: ${txt.familyTitle && /[ऀ-ॿ]/.test(txt.familyTitle) ? txt.familyTitle : L.darshan} ::`, 3.4 * s, F.display, acc, { wide: F.dWide, gap: 1 * s }), it(txt.family, 2.9 * s, F.body, ink, { wide: F.wide, lh: 1.45 })], { x, y: cy, w: colW, h: ch }, 'left', 'top'));
  els.push(shapeEl('rect', r(x + colW + 1.6 * s), r(cy), 1, r(ch * 0.8), { fill: ink, opacity: 0.3, name: 'Column line' }));
  els.push(...flow([it(`:: ${L.vineet} ::`, 3.4 * s, F.display, acc, { wide: F.dWide, gap: 1 * s }), it(String(txt.rsvp || '').replace(/^(निवेदक|RSVP)\s*:\s*/i, '').replace(' · ', '\n'), 3 * s, F.body, ink, { wide: F.wide, lh: 1.45, weight: '600' })], { x: x + colW + 4 * s, y: cy, w: colW, h: ch }, 'right', 'top'));
  return { name: 'Invitation', bg: solidBg(T.paper), elements: els };
}

function singlePage(T, txt, L, F, W, H) {
  const s = W / 100, D = dress(T, W, H, 'single'), b = D.box, ink = T.ink, acc = T.accent;
  const els = [...D.els];
  els.push(...flow([it(txt.invoke, 2.8 * s, F.body, ink, { weight: '700', wide: F.wide })], { x: b.x, y: b.y, w: b.w, h: 4 * s }));
  els.push(emblem(T, W / 2 - 6 * s, b.y + 4.5 * s, 12 * s));
  els.push(...flow([it(txt.title, 8 * s, F.display, ink, { wide: F.dWide })], { x: b.x, y: b.y + 17 * s, w: b.w, h: 10 * s }));
  const cw = b.w / 2 - 6 * s, ny = b.y + 28 * s;
  if (txt.bFull || txt.b) {
    els.push(...flow([it(txt.aFull || txt.a, 6 * s, F.display, ink, { wide: F.dWide, gap: 0.6 * s }), it(txt.aRel || txt.hosts, 2.5 * s, F.body, T.soft, { wide: F.wide })], { x: b.x, y: ny, w: cw, h: 15 * s }));
    els.push(G('orings', W / 2 - 4 * s, ny + 3 * s, 8 * s, 8 * s, [acc, ink]), ...flow([it(txt.with || '&', 4.5 * s, F.hand, acc)], { x: W / 2 - 6 * s, y: ny + 10 * s, w: 12 * s, h: 6 * s }));
    els.push(...flow([it(txt.bFull || txt.b, 6 * s, F.display, ink, { wide: F.dWide, gap: 0.6 * s }), it(txt.bRel, 2.5 * s, F.body, T.soft, { wide: F.wide })], { x: b.x + b.w - cw, y: ny, w: cw, h: 15 * s }));
  } else els.push(...flow([it(txt.aFull || txt.a, 7 * s, F.display, ink, { wide: F.dWide, gap: 0.6 * s }), it(txt.aRel || txt.hosts, 2.6 * s, F.body, T.soft, { wide: F.wide })], { x: b.x, y: ny, w: b.w, h: 15 * s }));
  els.push(...flow([it(txt.outro, 2.9 * s, F.body, ink, { wide: F.wide, lh: 1.4, gap: 0.6 * s }), it([txt.date, txt.time].filter(Boolean).join(' · '), 3.2 * s, F.display, acc, { wide: F.dWide })], { x: b.x, y: ny + 16 * s, w: b.w, h: 12 * s }));
  const py = ny + 30 * s, ph = b.h * 0.3;
  els.push(...program(T, txt, F, { x: b.x + 2 * s, y: py, w: b.w - 4 * s, h: ph }, s * 0.85));
  const fy = py + ph + 3 * s, fh = b.y + b.h - fy;
  els.push(rule(T, b.x, fy - 1.5 * s, b.w, s));
  els.push(...flow([it(`${L.darshan} :`, 3 * s, F.display, acc, { wide: F.dWide, gap: 0.6 * s }), it(txt.family, 2.6 * s, F.body, ink, { wide: F.wide })], { x: b.x, y: fy, w: b.w / 2 - 2 * s, h: fh * 0.7 }, 'left', 'top'));
  els.push(...flow([it(`${L.vineet} :`, 3 * s, F.display, acc, { wide: F.dWide, gap: 0.6 * s }), it(String(txt.rsvp || '').replace(/^(निवेदक|RSVP)\s*:\s*/i, ''), 2.6 * s, F.body, ink, { wide: F.wide })], { x: W / 2 + 2 * s, y: fy, w: b.w / 2 - 2 * s, h: fh * 0.7 }, 'right', 'top'));
  if (txt.kids) els.push(...flow([it(txt.kids, 2.5 * s, F.hand, ink, { wide: F.wide })], { x: b.x, y: b.y + b.h - fh * 0.28, w: b.w, h: fh * 0.28 }));
  return { name: 'Card', bg: solidBg(T.paper), elements: els };
}

export function buildPatrikaPages(ev, T, lang, pages, W, H) {
  const txt = ev[lang === 'hi' ? 'hi' : 'en'];
  const hi = isHi(txt);
  const L = LABELS[hi ? 'hi' : 'en'];
  const F = fonts(T, hi);
  if (pages <= 1) return [singlePage(T, txt, L, F, W, H)];
  const inner = [leftPage(T, txt, L, F, W, H), rightPage(T, txt, L, F, W, H)];
  return pages === 2 ? inner : [coverPage(T, txt, L, F, W, H), ...inner];
}
