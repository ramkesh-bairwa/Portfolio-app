// Builds a card (1–3 pages) from a function's wording and a theme.
// Each layout "dresses" a page (background, frames, garlands…) and hands back the box the text flows into;
// the composers below fill that box with the cover, invitation or programme in the theme's fonts.
import { estimate, grad, graphicEl, r, shapeEl, solid, textEl } from '../kit';

const radial = (from, to) => ({ type: 'radial', color: to, from, to, angle: 0, image: '', overlay: 0 });
function mix(a, b, k) {
  const p = (h) => { const m = /^#([0-9a-f]{6})$/i.exec(h || ''); const n = m ? parseInt(m[1], 16) : 0; return [n >> 16, (n >> 8) & 255, n & 255]; };
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
}
const G = (fam, x, y, w, h, colors, params = {}, o = {}) => graphicEl(fam, r(x), r(y), r(w), r(h), { colors, params, ...o });
const hash = (str) => String(str).split('').reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
// Hindi vowel signs sit on other letters, so they add no width
const glyphs = (t) => String(t).replace(/[ऀ-ःऺ-ॏ॑-ॗॢॣ]/g, '').length;
const deva = (t) => /[ऀ-ॿ]/.test(t || '');
const initial = (t) => (String(t).match(/^.[ा-्ऀ-ः]*/u) || [''])[0];

const WEIGHT = { Cinzel: '600', 'Cinzel Decorative': '700', 'Playfair Display': '600', 'Cormorant Garamond': '600', Amita: '700', Eczar: '700', 'Palanquin Dark': '600', Kalam: '700', 'Dancing Script': '700' };
const BODY_WEIGHT = { 'Cormorant Garamond': '500', 'EB Garamond': '500', Lora: '500', Jost: '400', Montserrat: '500', Laila: '500', Mukta: '500' };

// Font roles for a theme and language: display (titles), script (names), body
function roles(T, hi) {
  const f = hi ? T.hi : T.font;
  return {
    display: { font: f.display, weight: WEIGHT[f.display] || '400', wide: hi ? 0.74 : T.font.dWide, upper: !hi && T.font.dUpper, lh: hi ? 1.38 : 1.12, ls: !hi && T.font.dUpper ? 0.08 : 0 },
    script: { font: f.script, weight: WEIGHT[f.script] || '400', wide: hi ? 0.74 : T.font.sWide, upper: false, lh: hi ? 1.38 : 1.18, ls: 0 },
    body: { font: f.body, weight: BODY_WEIGHT[f.body] || '400', wide: hi ? 0.64 : T.font.bWide, upper: false, lh: hi ? 1.58 : 1.36, ls: 0 },
  };
}

// ---------- flowing text and ornaments into a box ----------
// text items: { text, role, size, color, gap, upper, ls, italic, weight, el } · art items: { art: true, h, w, make(x, y, w, h) }
function flow(list, box, F, { align = 'center', valign = 'center' } = {}) {
  const items = list.filter((it) => it && (it.art || String(it.text || '').trim())).map((it) => (it.art ? it : { ...F[it.role || 'body'], ...it, kind: 'text' }));
  const height = (it, k) => (it.art ? it.h * k : estimate(it, box.w, k));
  let k = 1;
  let hs = [];
  let total = 0;
  for (let i = 0; i < 20; i++) {
    hs = items.map((it) => height(it, k));
    total = hs.reduce((a, h, j) => a + h + (j < items.length - 1 ? (items[j].gap || 0) * k : 0), 0);
    if (total <= box.h) break;
    k *= 0.93;
  }
  let y = valign === 'top' ? box.y : box.y + Math.max(0, (box.h - total) / 2);
  const els = [];
  items.forEach((it, j) => {
    const h = hs[j];
    if (it.art) {
      const w = Math.min(box.w, (it.w || box.w) * k);
      els.push(...it.make(align === 'left' ? box.x : box.x + (box.w - w) / 2, y, w, h, k));
    } else {
      els.push(textEl(String(it.text), r(box.x), r(y), r(box.w), r(h), {
        font: it.font, size: r(it.size * k), weight: it.weight, color: it.color, align, lh: it.lh, ls: it.ls || 0, upper: !!it.upper, italic: !!it.italic, ...(it.el || {}),
      }));
    }
    y += h + (it.gap || 0) * k;
  });
  return els;
}

// Size that keeps one line of text inside width w
const fitLine = (text, size, w, wide) => Math.min(size, (w * 0.94) / Math.max(1, glyphs(text) * wide));

// ---------- emblems ----------
const EVENT_EMBLEM = { 'griha-pravesh': 'kalash', satyanarayan: 'om', janeu: 'om' };
function emblem(T, ev, tone, size, txt) {
  const g = [tone.gold, tone.gold2];
  const make = (fn) => ({ art: true, h: size, w: size, make: fn });
  if (ev.faith === 'muslim') return make((x, y, w, h) => [G('ocrescent', x, y, w, h, [tone.gold, tone.gold2, mix(tone.gold, T.dark ? '#000000' : '#FFFFFF', 0.85)], { kind: ['arch', 'palace', 'royal', 'brocade'].includes(T.layout) ? 'mosque' : 'moon' }, { name: 'Crescent' })]);
  if (ev.faith === 'sikh') return make((x, y, w, h) => [G('omonogram', x, y, w, h, g, {}, { name: 'Emblem ring' }), textEl('ੴ', r(x), r(y + h * 0.16), r(w), r(h * 0.66), { font: 'Mukta Mahee', size: r(h * 0.5), weight: '700', color: tone.gold, align: 'center', lh: 1.2, name: 'Ik Onkar' })]);
  if (ev.faith === 'christian') return make((x, y, w, h) => [G(ev.key === 'christian-wedding' && hash(T.key) % 2 ? 'ocross' : 'orings', x, y, w, h, [tone.gold, tone.gold2], { hearts: true }, { name: 'Emblem' })]);
  if (ev.faith === 'neutral') return make((x, y, w, h) => [G('omonogram', x, y, w, h, g, {}, { name: 'Monogram ring' }), textEl(initial(txt.a), r(x), r(y + h * 0.2), r(w), r(h * 0.6), { font: roles(T, deva(txt.a)).display.font, size: r(h * 0.42), weight: '400', color: tone.gold, align: 'center', lh: 1.2 })]);
  const kind = EVENT_EMBLEM[ev.key];
  if (kind === 'kalash') return make((x, y, w, h) => [G('osymbol', x, y, w, h, [tone.gold, tone.gold2, '#15803D'], { kind: 'kalash' }, { name: 'Kalash' })]);
  if (kind === 'om') return make((x, y, w, h) => [G('omonogram', x, y, w, h, g, {}, { name: 'Emblem ring' }), G('osymbol', x + w * 0.18, y + h * 0.16, w * 0.64, h * 0.64, [tone.gold, tone.gold2], { kind: 'om' }, { name: 'Om' })]);
  const style = { filled: 'filled', halo: 'halo' }[T.emblem] || 'line';
  return make((x, y, w, h) => [G('oganesh', x, y, w, h, [tone.gold, tone.gold2, T.opts.fill || mix(tone.gold2, '#FFFFFF', 0.55)], { style }, { name: 'Ganesha' })]);
}

function divider(T, tone, s, w = 46) {
  const kinds = ['scroll', 'leafy', 'dots'];
  const centers = ['lotus', 'paisley', 'flower', 'diamond', 'diya'];
  const hv = hash(T.key);
  return { art: true, h: 4.2 * s, w: w * s, gap: 2.6 * s, make: (x, y, ww, hh) => [G('odivider', x, y, ww, hh, [tone.gold, tone.gold2, tone.gold, '#FFFFFF'], { kind: kinds[hv % 3], center: centers[(hv >> 3) % 5] }, { name: 'Divider' })] };
}

// ---------- page layouts ----------
const frameRect = (m, W, H, color, sw, o = {}) => shapeEl('rect', r(m), r(m), r(W - 2 * m), r(H - 2 * m), { fill: 'transparent', stroke: color, strokeW: Math.max(1, r(sw)), name: 'Frame line', ...o });
// Floral corner art is drawn for the top-left; rotate it into the other corners
const corner = (fam, colors, params, D, W, H, where, o = {}) => {
  const at = { tl: [0, 0, 0], tr: [W - D, 0, 90], br: [W - D, H - D, 180], bl: [0, H - D, 270] }[where];
  return G(fam, at[0], at[1], D, D, colors, params, { rot: at[2], name: 'Corner flowers', ...o });
};

const LAYOUTS = {
  arch(T, W, H, inside, s) {
    const tone = { ink: T.ink, gold: T.gold, gold2: T.gold2, soft: T.soft };
    const els = [];
    if (T.opts.jaali) els.push(G('ojaali', 0, 0, W, H, [T.gold2], { kind: T.opts.jaali, scale: 0.085 }, { opacity: T.dark ? 0.09 : 0.14, name: 'Jaali pattern' }));
    els.push(G('oframe', 3.2 * s, 3.2 * s, W - 6.4 * s, H - 6.4 * s, [T.gold, T.gold2, T.gold], { style: 'mughal' }, { name: 'Arch frame' }));
    if (T.opts.flora) {
      const cols = ['#E11D48', '#BE185D', '#3F6212'];
      els.push(corner('oflora', cols, { kind: 'corner' }, W * 0.3, W, H, 'bl'), corner('oflora', cols, { kind: 'corner' }, W * 0.3, W, H, 'br'));
    }
    if (T.opts.bells && !inside) els.push(G('osymbol', W * 0.13, H * 0.09, 9 * s, 15 * s, [T.gold, T.gold2], { kind: 'bells' }, { name: 'Bells' }), G('osymbol', W * 0.87 - 9 * s, H * 0.09, 9 * s, 15 * s, [T.gold, T.gold2], { kind: 'bells' }, { name: 'Bells' }));
    return { bg: T.bg2 ? grad(T.bg, T.bg2, 165) : solid(T.bg), els, tone, box: { x: W * 0.15, y: H * 0.19, w: W * 0.7, h: H * (T.opts.flora ? 0.64 : 0.68) } };
  },

  minimal(T, W, H, inside, s) {
    const tone = { ink: T.ink, gold: T.gold, gold2: T.gold2, soft: T.soft };
    const m = 4 * s;
    const els = [frameRect(m, W, H, T.gold, 0.3 * s), frameRect(m + 1.4 * s, W, H, T.gold, 0.12 * s, { opacity: 0.8 })];
    [[m + 1.4 * s, m + 1.4 * s], [W - m - 1.4 * s, m + 1.4 * s], [m + 1.4 * s, H - m - 1.4 * s], [W - m - 1.4 * s, H - m - 1.4 * s]].forEach(([x, y]) => els.push(shapeEl('diamond', r(x - 1.3 * s), r(y - 1.3 * s), r(2.6 * s), r(2.6 * s), { fill: T.gold, name: 'Corner diamond' })));
    if (T.opts.roses) {
      const cols = ['#E8A0AE', '#C97B8B', '#8FAF8F'];
      els.push(corner('oflora', cols, { kind: 'corner' }, W * (inside ? 0.26 : 0.34), W, H, 'tl', { opacity: 0.9 }), corner('oflora', cols, { kind: 'corner' }, W * (inside ? 0.26 : 0.34), W, H, 'br', { opacity: 0.9 }));
    }
    return { bg: T.bg2 ? grad(T.bg, T.bg2, 180) : solid(T.bg), els, tone, box: { x: W * 0.13, y: H * 0.08, w: W * 0.74, h: H * 0.84 }, monogram: !inside };
  },

  palace(T, W, H, inside, s) {
    const tone = { ink: T.ink, gold: T.gold, gold2: T.gold2, soft: T.soft };
    const pal = T.opts.palace || T.accent;
    const els = [graphicEl('glow', r(W * 0.1), r(H * 0.08), r(W * 0.8), r(W * 0.8), { colors: [T.dark ? '#FFFFFF' : T.gold2], opacity: 0.22, name: 'Glow' })];
    const ph = inside ? H * 0.12 : H * 0.26;
    els.push(G('opalace', 0, H - ph, W, ph, [pal, T.opts.dusk ? '#FDE68A' : mix(T.bg, '#FFFFFF', 0.4)], {}, { opacity: inside ? 0.35 : 0.95, name: 'Palace' }));
    els.push(frameRect(3 * s, W, H, T.dark ? '#FFFFFF' : T.gold, 0.25 * s, { opacity: 0.7 }));
    return { bg: grad(T.bg, T.bg2 || T.bg, 180), els, tone, box: inside ? { x: W * 0.11, y: H * 0.07, w: W * 0.78, h: H * 0.78 } : { x: W * 0.1, y: H * 0.06, w: W * 0.8, h: H * 0.66 } };
  },

  mandala(T, W, H, inside, s) {
    const tone = { ink: T.ink, gold: T.gold, gold2: T.gold2, soft: T.soft };
    const cols = [T.gold, T.gold2, T.accent, T.dark ? '#FFFFFF' : T.gold];
    const els = [];
    const D = W * 1.15;
    els.push(G('omandala', (W - D) / 2, H * 0.5 - D / 2, D, D, cols, { style: T.opts.mandala || 'line', layers: 5 }, { opacity: inside ? 0.06 : T.opts.light ? 0.12 : 0.15, seed: 11, name: 'Mandala' }));
    const C = W * (inside ? 0.42 : 0.52);
    [[-C / 2, -C / 2], [W - C / 2, -C / 2], [-C / 2, H - C / 2], [W - C / 2, H - C / 2]].forEach(([x, y]) => els.push(G('omandala', x, y, C, C, cols, { style: T.opts.mandala || 'line', layers: 4 }, { opacity: T.opts.light ? 0.85 : 0.55, seed: 23, name: 'Corner mandala' })));
    els.push(frameRect(3 * s, W, H, T.gold, 0.25 * s, { opacity: 0.8 }));
    return { bg: T.dark ? radial(T.bg2, T.bg) : solid(T.bg), els, tone, box: { x: W * 0.14, y: H * 0.11, w: W * 0.72, h: H * 0.78 } };
  },

  floral(T, W, H, inside, s) {
    const tone = { ink: T.ink, gold: T.gold, gold2: T.gold2, soft: T.soft };
    const els = [];
    if (T.opts.glow) els.push(G('oglow', 0, 0, W, H, [T.gold2, mix(T.accent, '#FFFFFF', 0.4), '#FFFFFF'], { n: 3 }, { opacity: 0.4, name: 'Soft glow' }));
    const D = W * (inside ? 0.3 : 0.42);
    if (T.opts.flower === 'paisley') {
      const cols = [T.gold, T.accent, T.opts.fill || '#FDE68A'];
      els.push(G('opaisley', 0, 2.5 * s, W, 8 * s, cols, { kind: 'border' }, { name: 'Paisley border' }), G('opaisley', 0, H - 10.5 * s, W, 8 * s, cols, { kind: 'border' }, { name: 'Paisley border' }));
      if (!inside) els.push(G('opaisley', W * 0.06, H * 0.42, W * 0.88, W * 0.5, cols, { kind: 'scatter' }, { opacity: 0.1, name: 'Paisley pattern' }));
      return { bg: grad(T.bg, T.bg2 || T.bg, 180), els, tone, box: { x: W * 0.12, y: H * 0.11, w: W * 0.76, h: H * 0.78 } };
    }
    const cols = T.opts.flower === 'lotus' ? ['#EC4899', '#F9A8D4', '#16A34A'] : ['#E8A0AE', '#C97B8B', '#8FAF8F'];
    els.push(corner('oflora', cols, { kind: 'corner' }, D, W, H, 'tl'), corner('oflora', cols, { kind: 'corner' }, D, W, H, 'br'));
    if (T.opts.flower === 'lotus' && !inside) els.push(G('oflora', W * 0.18, H - 11 * s, W * 0.64, 8 * s, cols, { kind: 'lotusrow' }, { name: 'Lotus row' }));
    els.push(frameRect(3 * s, W, H, T.gold, 0.18 * s, { opacity: 0.6 }));
    return { bg: grad(T.bg, T.bg2 || T.bg, 180), els, tone, box: { x: W * 0.14, y: H * (inside ? 0.1 : 0.14), w: W * 0.72, h: H * (inside ? 0.8 : 0.72) } };
  },

  toran(T, W, H, inside, s) {
    const tone = { ink: T.ink, gold: T.gold, gold2: T.gold2, soft: T.soft };
    const gh = inside ? H * 0.1 : H * 0.15;
    const els = [frameRect(3 * s, W, H, T.gold, 0.25 * s, { opacity: 0.7 })];
    if (T.opts.bunting) els.push(G('omandala', W * 0.1, H * 0.3, W * 0.8, W * 0.8, [T.gold, T.gold2, T.accent], { style: 'dotted', layers: 4 }, { opacity: 0.05, name: 'Mandala' }));
    els.push(G('ogarland', 0, 0, W, gh, ['#FF8C00', '#FFC300', '#2E7D32', '#E11D48'], { flower: T.opts.garland || 'marigold', strands: inside ? 1 : 2, drop: 'leaf' }, { name: 'Toran' }));
    if (!inside) els.push(G('odiwali', W * 0.22, H - 14 * s, W * 0.56, 11 * s, ['#F59E0B', '#B45309', '#FFF7AE'], { kind: 'trio' }, { name: 'Diyas' }));
    return { bg: grad(T.bg, T.bg2 || T.bg, 180), els, tone, box: inside ? { x: W * 0.12, y: gh + 2 * s, w: W * 0.76, h: H - gh - 8 * s } : { x: W * 0.12, y: gh + 2 * s, w: W * 0.76, h: H - gh - 18 * s } };
  },

  temple(T, W, H, inside, s) {
    const tone = { ink: T.ink, gold: T.gold, gold2: T.gold2, soft: T.soft };
    const bh = 6.5 * s;
    const zari = T.opts.band === 'zari';
    const cols = zari ? [T.gold, mix(T.gold2, '#FFFFFF', 0.3)] : [T.accent, T.gold, T.accent];
    const els = [];
    if (!inside) els.push(G('omandala', W * 0.12, H / 2 - W * 0.38, W * 0.76, W * 0.76, [T.gold, T.gold2, T.accent], { style: 'dotted', layers: 4 }, { opacity: 0.08, name: 'Mandala' }));
    els.push(G('oband', 0, 2 * s, W, bh, cols, { kind: T.opts.band }, { name: 'Border band' }), G('oband', 0, H - 2 * s - bh, W, bh, cols, { kind: T.opts.band }, { name: 'Border band' }));
    els.push(shapeEl('rect', r(3 * s), r(2 * s + bh), Math.max(1, r(0.3 * s)), r(H - 4 * s - 2 * bh), { fill: T.gold, name: 'Side line' }), shapeEl('rect', r(W - 3.3 * s), r(2 * s + bh), Math.max(1, r(0.3 * s)), r(H - 4 * s - 2 * bh), { fill: T.gold, name: 'Side line' }));
    if (T.opts.lamp && !inside) els.push(G('odiwali', W / 2 - 6 * s, H - bh - 16 * s, 12 * s, 12 * s, ['#F59E0B', '#B45309', '#FFF7AE'], { kind: 'big' }, { name: 'Lamp' }));
    return { bg: solid(T.bg), els, tone, box: { x: W * 0.12, y: bh + 6 * s, w: W * 0.76, h: H - 2 * bh - (T.opts.lamp && !inside ? 26 : 12) * s } };
  },

  brocade(T, W, H, inside, s) {
    const tone = { ink: T.ink, gold: mix(T.gold, T.ink, 0.42), gold2: T.gold, soft: T.soft };
    const els = [G('obuti', 0, 0, W, H, [T.gold, T.gold2], { kind: T.opts.buti, scale: 0.085 }, { opacity: 0.5, name: 'Brocade pattern' })];
    if (inside) {
      els.push(shapeEl('rounded', r(W * 0.07), r(H * 0.05), r(W * 0.86), r(H * 0.9), { fill: T.panel, radius: r(2.5 * s), stroke: T.gold, strokeW: Math.max(1, r(0.6 * s)), name: 'Panel' }));
      els.push(shapeEl('rounded', r(W * 0.07 + 1.8 * s), r(H * 0.05 + 1.8 * s), r(W * 0.86 - 3.6 * s), r(H * 0.9 - 3.6 * s), { fill: 'transparent', radius: r(1.8 * s), stroke: T.gold, strokeW: Math.max(1, r(0.15 * s)), name: 'Panel line' }));
      return { bg: solid(T.bg), els, tone, box: { x: W * 0.14, y: H * 0.09, w: W * 0.72, h: H * 0.82 } };
    }
    els.push(G('oarch', W * 0.08, H * 0.05, W * 0.84, H * 0.9, [T.panel, T.gold, T.gold], { kind: 'filled' }, { name: 'Arch panel' }));
    els.push(G('oarch', W * 0.11, H * 0.08, W * 0.78, H * 0.84, [T.gold, T.gold2, T.gold], { kind: 'outline' }, { name: 'Arch line' }));
    return { bg: solid(T.bg), els, tone, box: { x: W * 0.17, y: H * 0.21, w: W * 0.66, h: H * 0.68 } };
  },

  royal(T, W, H, inside, s) {
    const tone = { ink: T.ink, gold: T.gold, gold2: T.gold2, soft: T.soft };
    const els = [G('ojaali', 0, 0, W, H, [T.gold], { kind: T.opts.jaali || 'ogee', scale: 0.09 }, { opacity: inside ? 0.06 : 0.1, name: 'Jaali pattern' })];
    els.push(G('oframe', 2.6 * s, 2.6 * s, W - 5.2 * s, H - 5.2 * s, [T.gold, T.gold2, T.gold], { style: T.opts.frame || 'royal' }, { name: 'Frame' }));
    if (!inside) els.push(graphicEl('glow', r(W * 0.1), r(H * 0.2), r(W * 0.8), r(W * 0.8), { colors: [T.gold], opacity: 0.14, name: 'Glow' }));
    return { bg: radial(T.bg2 || T.bg, T.bg), els, tone, box: { x: W * 0.14, y: H * 0.09, w: W * 0.72, h: H * 0.82 } };
  },

  night(T, W, H, inside, s) {
    const tone = { ink: T.ink, gold: T.gold, gold2: T.gold2, soft: T.soft };
    const lh = inside ? H * 0.08 : H * 0.13;
    const els = [
      graphicEl('sparkles', 0, 0, W, H, { colors: [T.gold2, '#FFFFFF'], opacity: inside ? 0.12 : 0.22, seed: 17, name: 'Stars' }),
      graphicEl('glow', r(W * 0.12), r(H * 0.22), r(W * 0.76), r(W * 0.76), { colors: [T.accent], opacity: 0.16, name: 'Glow' }),
      G('olights', 0, 0, W, lh, ['#FDE68A', '#FBBF24'], { kind: 'fairy', strands: 2 }, { name: 'Fairy lights' }),
      frameRect(3 * s, W, H, T.gold, 0.2 * s, { opacity: 0.6 }),
    ];
    return { bg: radial(T.bg2, T.bg), els, tone, box: { x: W * 0.12, y: lh + 2 * s, w: W * 0.76, h: H - lh - 8 * s } };
  },

  drape(T, W, H, inside, s) {
    const tone = { ink: T.ink, gold: T.gold, gold2: T.gold2, soft: T.soft };
    const dh = inside ? H * 0.11 : H * 0.2;
    const els = [
      G('obuti', 0, 0, W, H, [T.gold], { kind: 'dot', scale: 0.07 }, { opacity: 0.07, name: 'Pattern' }),
      G('odrape', 0, 0, W, dh, [mix(T.bg2, '#000000', 0.15), T.gold, mix(T.bg, '#000000', 0.35)], { n: inside ? 5 : 4 }, { name: 'Drapes' }),
      G('oband', 0, H - 5 * s, W, 5 * s, [mix(T.bg, '#000000', 0.3), T.gold, T.bg], { kind: 'beads' }, { name: 'Border band' }),
    ];
    return { bg: grad(T.bg, T.bg2, 180), els, tone, box: { x: W * 0.12, y: dh + (inside ? 3 : 1) * s, w: W * 0.76, h: H - dh - 10 * s } };
  },

  scroll(T, W, H, inside, s) {
    const tone = { ink: T.ink, gold: T.gold, gold2: T.gold2, soft: T.soft };
    // parchment sheet with a wooden roller at the top and bottom
    const px = W * 0.1;
    const py = H * 0.08;
    const roller = (y) => [
      shapeEl('rounded', r(W * 0.06), r(y), r(W * 0.88), r(4.4 * s), { fill: '#6B3A16', fill2: '#B7712F', gradAngle: 180, radius: r(2.2 * s), name: 'Scroll roller' }),
      shapeEl('circle', r(W * 0.06 - 1.6 * s), r(y + 0.6 * s), r(3.2 * s), r(3.2 * s), { fill: T.accent, name: 'Roller knob' }),
      shapeEl('circle', r(W * 0.94 - 1.6 * s), r(y + 0.6 * s), r(3.2 * s), r(3.2 * s), { fill: T.accent, name: 'Roller knob' }),
    ];
    const els = [
      G('ojaali', 0, 0, W, H, [T.accent], { kind: 'star', scale: 0.09 }, { opacity: 0.12, name: 'Pattern' }),
      shapeEl('rect', r(px), r(py), r(W - 2 * px), r(H - 2 * py), { fill: T.panel, fill2: mix(T.panel, '#C89B5A', 0.35), gradAngle: 90, name: 'Parchment' }),
      frameRect(0, W, H, T.gold, 0.15 * s, { x: r(px + 2.4 * s), y: r(py + 4 * s), w: r(W - 2 * px - 4.8 * s), h: r(H - 2 * py - 8 * s), opacity: 0.6 }),
      ...roller(py - 2.2 * s), ...roller(H - py - 2.2 * s),
    ];
    return { bg: grad(T.bg, T.bg2, 160), els, tone, box: { x: W * 0.16, y: H * 0.14, w: W * 0.68, h: H * 0.72 } };
  },
};

// ---------- page composers ----------
const foil = (T, tone) => (T.dark && T.layout !== 'brocade' && T.layout !== 'scroll' ? { fill2: tone.gold, gradAngle: 180 } : undefined);

function coverItems(T, ev, txt, tone, F, s, L, single) {
  const couple = !!txt.b;
  const hi = deva(txt.title);
  const gold = foil(T, tone);
  const head = [
    emblem(T, ev, tone, couple ? 17 * s : 19 * s, txt),
    { text: txt.invoke, role: 'body', size: 2.9 * s, color: tone.gold, weight: '600', ls: hi ? 0 : 0.1, gap: 2.2 * s },
  ];
  head[0].gap = 1.6 * s;
  if (L.monogram && couple) {
    const sz = 19 * s;
    head.push({ art: true, h: sz, w: sz, gap: 2.4 * s, make: (x, y, w, h) => [G('omonogram', x, y, w, h, [tone.gold, tone.gold2], {}, { name: 'Monogram ring' }), textEl(`${initial(txt.a)} | ${initial(txt.b)}`, r(x), r(y + h * 0.3), r(w), r(h * 0.42), { font: F.display.font, size: r(h * 0.26), weight: F.display.weight, color: tone.gold, align: 'center', lh: 1.25, name: 'Initials' })] });
  }
  const title = couple
    ? [
        { text: txt.kicker, role: 'body', size: 2.8 * s, color: tone.soft, upper: !hi, ls: hi ? 0 : 0.22, gap: 1.2 * s },
        { text: txt.title, role: 'display', size: (hi ? 7.6 : 5.6) * s, color: tone.gold, gap: 1.4 * s, el: gold },
        divider(T, tone, s, 40),
        { text: txt.a, role: 'script', size: (hi ? 8.6 : 11.5) * s, color: tone.ink, gap: 0.2 * s },
        { text: txt.join, role: 'script', size: (hi ? 4.4 : 6) * s, color: tone.gold, gap: 0.2 * s },
        { text: txt.b, role: 'script', size: (hi ? 8.6 : 11.5) * s, color: tone.ink, gap: 2.4 * s },
      ]
    : [
        { text: txt.kicker, role: 'body', size: 3 * s, color: tone.soft, upper: !hi, ls: hi ? 0 : 0.18, gap: 1.6 * s },
        { text: txt.title, role: 'display', size: (hi ? 9 : 7.4) * s, color: tone.gold, gap: 1.6 * s, el: gold },
        divider(T, tone, s, 40),
        txt.aFull || txt.a ? { text: txt.a, role: 'script', size: (hi ? 7.4 : 9.5) * s, color: tone.ink, gap: 0.6 * s } : null,
        txt.aRel ? { text: txt.aRel, role: 'body', size: 3 * s, color: tone.soft, italic: !hi, gap: 2.4 * s } : null,
      ];
  const when = single
    ? [
        { text: [txt.hosts, txt.intro].filter(Boolean).join(' '), role: 'body', size: 3.1 * s, color: tone.ink, gap: 2.2 * s },
        { text: txt.date, role: 'body', size: 3.5 * s, color: tone.gold, weight: '700', gap: 0.8 * s },
        { text: txt.time, role: 'body', size: 3.1 * s, color: tone.ink, gap: 0.8 * s },
        { text: txt.venue, role: 'body', size: 3.1 * s, color: tone.ink, gap: 1.6 * s },
        txt.extra ? { text: txt.extra, role: 'body', size: 2.8 * s, color: tone.soft, italic: !hi, gap: 1.4 * s } : null,
        { text: txt.rsvp, role: 'body', size: 2.7 * s, color: tone.soft, weight: '600' },
      ]
    : [
        { text: txt.date, role: 'body', size: 3.4 * s, color: tone.gold, weight: '700', upper: !hi, ls: hi ? 0 : 0.08, gap: 0.8 * s },
        { text: txt.venue, role: 'body', size: 3.1 * s, color: tone.ink },
      ];
  return [...head, ...title, ...when];
}

function inviteItems(T, ev, txt, tone, F, s, { mantra, program }) {
  const hi = deva(txt.title);
  const nameSize = (hi ? 6.4 : 7.8) * s;
  const items = [
    emblem(T, ev, tone, 11 * s, txt),
    { text: txt.invoke, role: 'body', size: 2.7 * s, color: tone.gold, weight: '600', ls: hi ? 0 : 0.08, gap: mantra ? 1 * s : 2 * s },
    mantra ? { text: txt.mantra, role: 'body', size: 2.5 * s, color: tone.soft, italic: !hi, gap: 2.4 * s } : null,
    { text: txt.title, role: 'display', size: (hi ? 6 : 4.6) * s, color: tone.gold, gap: 1 * s, el: foil(T, tone) },
    divider(T, tone, s, 36),
    { text: txt.hosts, role: 'body', size: 3.4 * s, color: tone.ink, weight: '700', gap: 0.8 * s },
    { text: txt.intro, role: 'body', size: 3 * s, color: tone.ink, gap: 1.6 * s },
    { text: txt.aFull, role: 'script', size: nameSize, color: tone.gold, gap: 0.2 * s },
    { text: txt.aRel, role: 'body', size: 2.6 * s, color: tone.soft, italic: !hi, gap: 0.8 * s },
    { text: txt.with, role: 'body', size: 3 * s, color: tone.ink, italic: !hi, gap: 0.6 * s },
    { text: txt.bFull, role: 'script', size: nameSize, color: tone.gold, gap: 0.2 * s },
    { text: txt.bRel, role: 'body', size: 2.6 * s, color: tone.soft, italic: !hi, gap: 1.2 * s },
    { text: txt.outro, role: 'body', size: 3 * s, color: tone.ink, gap: 2 * s },
    divider(T, tone, s, 30),
    { text: txt.date, role: 'body', size: 3.6 * s, color: tone.gold, weight: '700', gap: 0.6 * s },
    { text: txt.time, role: 'body', size: 3.1 * s, color: tone.ink, gap: 0.6 * s },
    { text: txt.venue, role: 'body', size: 3.1 * s, color: tone.ink, gap: 1.8 * s },
  ];
  if (program) {
    items.push({ text: txt.programTitle, role: 'display', size: (hi ? 4 : 3.2) * s, color: tone.gold, gap: 1 * s });
    items.push(programArt(txt, tone, F, s, true));
    items.push({ text: txt.rsvp, role: 'body', size: 2.7 * s, color: tone.soft, weight: '600' });
  } else items.push({ text: txt.closing, role: 'body', size: 2.8 * s, color: tone.soft, italic: !hi });
  return items;
}

// Programme as a grid of entries (two columns when there are four or more)
function programArt(txt, tone, F, s, compact = false) {
  const list = txt.program || [];
  const cols = list.length >= 4 ? 2 : 1;
  const rows = Math.ceil(list.length / cols);
  const cell = (compact ? 9.5 : 14) * s;
  return {
    art: true, h: rows * cell, w: cols === 1 ? 60 * s : 200 * s, gap: (compact ? 2 : 3) * s,
    make: (x, y, w, h) => {
      const cw = w / cols;
      const ch = h / rows;
      const k = ch / cell;
      const els = [];
      list.forEach(([label, when, where], i) => {
        const cx = x + (i % cols) * cw;
        const cy = y + Math.floor(i / cols) * ch;
        const iw = cw - 2 * s;
        const ls = fitLine(label, (compact ? 3.3 : 4) * s * k, iw, F.display.wide * (F.display.upper ? 1.1 : 1) + F.display.ls);
        const ws = fitLine(when, (compact ? 2.5 : 2.8) * s * k, iw, F.body.wide);
        if (!compact) els.push(shapeEl('diamond', r(cx + cw / 2 - 1 * s * k), r(cy + 0.4 * s * k), r(2 * s * k), r(2 * s * k), { fill: tone.gold, name: 'Bullet' }));
        const ly = cy + (compact ? 0.4 : 3) * s * k;
        els.push(textEl(label, r(cx + s), r(ly), r(iw), r(ls * F.display.lh * 1.05), { font: F.display.font, size: r(ls), weight: F.display.weight, color: tone.gold, align: 'center', lh: F.display.lh, upper: F.display.upper, ls: F.display.ls, name: 'Programme event' }));
        const wy = ly + ls * F.display.lh * 1.05 + 0.4 * s * k;
        const lines = where ? `${when}\n${where}` : when;
        els.push(textEl(lines, r(cx + s), r(wy), r(iw), r(ws * F.body.lh * (where ? 2 : 1) * 1.05), { font: F.body.font, size: r(ws), weight: F.body.weight, color: tone.ink, align: 'center', lh: F.body.lh, name: 'Programme time' }));
      });
      // thin rule between the two columns
      if (cols === 2) els.push(shapeEl('rect', r(x + w / 2), r(y + 0.6 * s), 1, r(h - 1.2 * s), { fill: tone.gold, opacity: 0.45, name: 'Column rule' }));
      return els;
    },
  };
}

function programItems(T, ev, txt, tone, F, s) {
  const hi = deva(txt.title);
  const kidsBox = txt.kids && {
    art: true, h: 11 * s, w: 66 * s, gap: 2.6 * s,
    make: (x, y, w, h, k) => [
      shapeEl('rounded', r(x), r(y), r(w), r(h), { fill: tone.gold, opacity: 0.1, radius: r(2 * s * k), name: 'Kids note box' }),
      shapeEl('rounded', r(x), r(y), r(w), r(h), { fill: 'transparent', stroke: tone.gold, strokeW: 1, radius: r(2 * s * k), opacity: 0.6, name: 'Kids note line' }),
      textEl(txt.kids, r(x + 2 * s * k), r(y + 1.4 * s * k), r(w - 4 * s * k), r(h - 2.8 * s * k), { font: F.body.font, size: r(Math.min(2.7 * s * k, (h - 2.8 * s * k) / (2 * F.body.lh))), weight: F.body.weight, italic: !hi, color: tone.ink, align: 'center', lh: F.body.lh, name: 'Kids note' }),
    ],
  };
  return [
    divider(T, tone, s, 36),
    { text: txt.programTitle, role: 'display', size: (hi ? 6.2 : 5) * s, color: tone.gold, gap: 0.8 * s, el: foil(T, tone) },
    { text: txt.short, role: 'body', size: 2.6 * s, color: tone.soft, ls: 0.2, gap: 3 * s },
    programArt(txt, tone, F, s),
    divider(T, tone, s, 30),
    { text: txt.familyTitle, role: 'display', size: (hi ? 4.4 : 3.4) * s, color: tone.gold, gap: 0.8 * s },
    { text: txt.family, role: 'body', size: 3 * s, color: tone.ink, gap: 2.6 * s },
    kidsBox,
    { text: txt.closing, role: 'body', size: 2.8 * s, color: tone.soft, italic: !hi, gap: 1.6 * s },
    { text: txt.rsvp, role: 'body', size: 3 * s, color: tone.ink, weight: '700' },
  ];
}

const PAGE_NAMES = { cover: 'Cover', invite: 'Invitation', program: 'Programme', single: 'Card' };

function page(T, ev, txt, kind, W, H, opts) {
  const s = Math.min(W, H) / 100;
  const L = LAYOUTS[T.layout](T, W, H, kind !== 'cover' && kind !== 'single', s);
  const F = roles(T, deva(txt.title));
  const items = kind === 'program' ? programItems(T, ev, txt, L.tone, F, s)
    : kind === 'invite' ? inviteItems(T, ev, txt, L.tone, F, s, opts)
      : coverItems(T, ev, txt, L.tone, F, s, L, kind === 'single');
  return { name: PAGE_NAMES[kind], bg: L.bg, elements: [...L.els, ...flow(items, L.box, F)] };
}

// pages: 1 = single card · 2 = cover + invitation with programme · 3 = cover, invitation, programme
export function buildCardPages(ev, T, lang, pages, W, H) {
  const txt = ev[lang === 'hi' ? 'hi' : 'en'];
  if (pages <= 1) return [page(T, ev, txt, 'single', W, H)];
  if (pages === 2) return [page(T, ev, txt, 'cover', W, H), page(T, ev, txt, 'invite', W, H, { mantra: false, program: true })];
  return [page(T, ev, txt, 'cover', W, H), page(T, ev, txt, 'invite', W, H, { mantra: true, program: false }), page(T, ev, txt, 'program', W, H)];
}
