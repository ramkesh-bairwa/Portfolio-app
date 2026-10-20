// Flat graphic artwork: logos, posters, rangoli and festive greetings. Each draw(c, R, i) gets the canvas,
// a seeded random function and the design's index inside its category (0–99).
import { circ, ell, fit, g, line, mix, onColor, path, poly, rect, textWidth, txt } from './core';

const pick = (R, arr) => arr[Math.floor(R() * arr.length)];
const polar = (cx, cy, r, a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
const P = (pts) => pts.map((p) => p.map((n) => Math.round(n * 10) / 10).join(' ')).join('L');

const SYL1 = ['Ka', 'Ve', 'Lu', 'Mi', 'So', 'Ari', 'No', 'Ze', 'Ta', 'Ori', 'Ela', 'Ru', 'Sa', 'Vi', 'Da', 'Ne', 'Ko', 'Ia', 'Mo', 'Ae'];
const SYL2 = ['ra', 'lia', 'vo', 'nix', 'ssa', 'ren', 'mi', 'lo', 'ya', 'dra', 'ka', 'sen', 'va', 'na', 'ro'];
export const coined = (i) => SYL1[i % SYL1.length] + SYL2[(i * 7 + Math.floor(i / SYL1.length)) % SYL2.length];

// ======================= LOGOS =======================
const LOGO_PALS = [
  ['#F7F4EE', '#1B1B1F', '#E4572E', '#2E86AB'], ['#0F172A', '#F8FAFC', '#38BDF8', '#A78BFA'], ['#FFF8E7', '#2B2118', '#D4A017', '#7A9E3B'],
  ['#EEF6F2', '#0D2B22', '#13A06F', '#F2A541'], ['#FDF1F4', '#2D1320', '#D6336C', '#6741D9'], ['#111111', '#F5F5F5', '#FF6B00', '#FFD60A'],
  ['#F1F4FA', '#14213D', '#1D4ED8', '#FCA311'], ['#F5EFE6', '#3A2618', '#9C4A1A', '#2F5D50'], ['#14111D', '#F3EEFF', '#C084FC', '#2DD4BF'], ['#FAFAF7', '#222222', '#0F766E', '#E11D48'],
];
const LOGO_SUFFIX = [['Studio', 'Design & branding'], ['Labs', 'Technology for people'], ['Café', 'Coffee · Kitchen · Bakery'], ['Works', 'Engineering & build'], ['Collective', 'Creative community'],
  ['Foods', 'Fresh from the farm'], ['Fitness', 'Strength & wellness'], ['Interiors', 'Spaces with soul'], ['Ventures', 'Capital for founders'], ['Jewels', 'Fine handcrafted jewellery'], ['Organics', 'Pure · Natural · Honest'], ['Travels', 'Journeys worth taking']];
const LOGO_FONTS = [['avenir', 700, false, -1], ['didot', 400, true, 6], ['futura', 700, true, 4], ['palatino', 700, false, 0], ['helvetica', 800, false, -2], ['garamond', 600, true, 5], ['rounded', 800, false, 0]];

const MARKS = [
  (c, x, y, s, A, B, L, F) => circ(x, y, s * 0.42, 'none', { stroke: A, sw: s * 0.09, dash: `${s * 2.2} ${s * 0.44}`, cap: 'round', t: `rotate(-60 ${x} ${y})` }) + txt(x, y + s * 0.17, L, { font: F, weight: 700, size: s * 0.48, fill: B, anchor: 'middle' }),
  (c, x, y, s, A, B) => [0, 1, 2].map((k) => { const [px, py] = polar(x, y + s * 0.04, s * 0.17, -Math.PI / 2 + (k * 2 * Math.PI) / 3); return circ(px, py, s * 0.29, [A, B, mix(A, B, 0.5)][k], { op: 0.82 }); }).join(''),
  (c, x, y, s, A, B) => [0, 1, 2].map((k) => path(`M${x - s * 0.36} ${y - s * 0.22 + k * s * 0.22}L${x} ${y - s * 0.02 + k * s * 0.22}L${x + s * 0.36} ${y - s * 0.22 + k * s * 0.22}`, 'none', { stroke: k === 1 ? B : A, sw: s * 0.1, cap: 'round', join: 'round' })).join(''),
  (c, x, y, s, A, B, L, F, bg) => rect(x - s * 0.42, y - s * 0.42, s * 0.84, s * 0.84, A, { r: s * 0.22 }) + txt(x, y + s * 0.2, L, { font: F, weight: 800, size: s * 0.56, fill: bg, anchor: 'middle' }) + circ(x + s * 0.3, y - s * 0.3, s * 0.1, B),
  (c, x, y, s, A, B) => [[-1, A], [1, B]].map(([d, col]) => path(`M${x} ${y + s * 0.4}C${x + d * s * 0.5} ${y + s * 0.1} ${x + d * s * 0.42} ${y - s * 0.4} ${x + d * s * 0.04} ${y - s * 0.44}C${x + d * s * 0.16} ${y - s * 0.1} ${x + d * s * 0.1} ${y + s * 0.2} ${x} ${y + s * 0.4}Z`, col)).join(''),
  (c, x, y, s, A, B, L, F) => poly(Array.from({ length: 6 }, (_, k) => polar(x, y, s * 0.44, Math.PI / 6 + (k * Math.PI) / 3)), 'none', { stroke: A, sw: s * 0.07, join: 'round' }) + txt(x, y + s * 0.15, L, { font: F, weight: 700, size: s * 0.42, fill: B, anchor: 'middle' }),
  (c, x, y, s, A, B) => Array.from({ length: 12 }, (_, k) => { const a = (k * Math.PI) / 6; return line(...polar(x, y, s * 0.3, a), ...polar(x, y, s * 0.46, a), k % 2 ? B : A, s * 0.05); }).join('') + circ(x, y, s * 0.2, A),
  (c, x, y, s, A, B) => circ(x + s * 0.18, y - s * 0.2, s * 0.1, B) + poly([[x - s * 0.46, y + s * 0.32], [x - s * 0.1, y - s * 0.3], [x + s * 0.26, y + s * 0.32]], A) + poly([[x - s * 0.06, y + s * 0.32], [x + s * 0.16, y - s * 0.06], [x + s * 0.46, y + s * 0.32]], mix(A, B, 0.55)),
  (c, x, y, s, A, B) => g(circ(x, y, s * 0.44, A) + [0, 1, 2].map((k) => path(`M${x - s * 0.5} ${y - s * 0.06 + k * s * 0.17}q${s * 0.125} -${s * 0.09} ${s * 0.25} 0t${s * 0.25} 0t${s * 0.25} 0t${s * 0.25} 0`, 'none', { stroke: B, sw: s * 0.06, cap: 'round' })).join(''), { clip: c.clip(circ(x, y, s * 0.44, '#000')) }),
  (c, x, y, s, A, B) => [0, 45, 90, 135].map((a, k) => ell(x, y, s * 0.46, s * 0.17, k % 2 ? B : A, { op: 0.78, t: `rotate(${a} ${x} ${y})` })).join('') + circ(x, y, s * 0.08, '#FFFFFF'),
  (c, x, y, s, A, B, L, F) => txt(x - s * 0.04, y + s * 0.3, L, { font: F, weight: 800, size: s * 0.9, fill: A, anchor: 'middle' }) + circ(x + s * 0.34, y + s * 0.24, s * 0.08, B),
  (c, x, y, s, A, B) => path(`M${x} ${y - s * 0.46}L${x + s * 0.38} ${y - s * 0.32}L${x + s * 0.38} ${y}Q${x + s * 0.38} ${y + s * 0.32} ${x} ${y + s * 0.48}Q${x - s * 0.38} ${y + s * 0.32} ${x - s * 0.38} ${y}L${x - s * 0.38} ${y - s * 0.32}Z`, A)
    + path(`M${x - s * 0.22} ${y - s * 0.02}L${x} ${y + s * 0.16}L${x + s * 0.22} ${y - s * 0.02}`, 'none', { stroke: B, sw: s * 0.08, cap: 'round', join: 'round' }) + circ(x, y - s * 0.2, s * 0.06, B),
];

function logos(c, R, i, W, H) {
  const [bg, ink, A, B] = LOGO_PALS[i % LOGO_PALS.length];
  const [suf, tag] = LOGO_SUFFIX[(i * 5) % LOGO_SUFFIX.length];
  const word = coined(i + 3);
  const [font, weight, upper, ls] = LOGO_FONTS[(i * 3) % LOGO_FONTS.length];
  const mk = MARKS[i % MARKS.length];
  const L = word[0];
  const layout = Math.floor(i / MARKS.length) % 5;
  const wordmark = (x, y, size, fill, anchor = 'middle') => txt(x, y, word, { font, weight, size, fill, anchor, upper, ls: ls * (size / 60) });
  const tagline = (x, y, fill, anchor = 'middle') => txt(x, y, `${suf} · ${tag}`, { font: 'avenir', weight: 500, size: 20, fill, anchor, upper: true, ls: 4, op: 0.7 });
  if (layout === 0) {
    return rect(0, 0, W, H, bg) + mk(c, W / 2, 470, 320, A, B, L, font, bg) + wordmark(W / 2, 790, 96, ink) + tagline(W / 2, 850, ink)
      + rect(0, H - 8, W, 8, A);
  }
  if (layout === 1) {
    return rect(0, 0, W / 2, H, bg) + rect(W / 2, 0, W / 2, H, ink)
      + mk(c, W / 4, 500, 240, A, B, L, font, bg) + wordmark(W / 4, 760, 64, ink)
      + mk(c, (W * 3) / 4, 500, 240, onColor(ink) === '#FFFFFF' ? '#FFFFFF' : A, B, L, font, ink) + wordmark((W * 3) / 4, 760, 64, bg)
      + txt(60, 80, 'Primary', { font: 'avenir', size: 16, fill: ink, upper: true, ls: 3, op: 0.5 }) + txt(W / 2 + 60, 80, 'Reversed', { font: 'avenir', size: 16, fill: bg, upper: true, ls: 3, op: 0.5 });
  }
  if (layout === 2) {
    const mx = 520, my = 600, s = 420;
    const grid = Array.from({ length: 17 }, (_, k) => line(k * 100, 0, k * 100, H, ink, 1, { op: 0.06 })).join('') + Array.from({ length: 13 }, (_, k) => line(0, k * 100, W, k * 100, ink, 1, { op: 0.06 })).join('');
    const guides = [0.5, 0.31, 0.19].map((r) => circ(mx, my, s * r, 'none', { stroke: A, sw: 1.5, dash: '6 8', op: 0.6 })).join('') + line(mx - s * 0.6, my, mx + s * 0.6, my, A, 1, { op: 0.5 }) + line(mx, my - s * 0.6, mx, my + s * 0.6, A, 1, { op: 0.5 });
    return rect(0, 0, W, H, bg) + grid + guides + mk(c, mx, my, s, A, B, L, font, bg)
      + wordmark(900, 560, 92, ink, 'start') + tagline(902, 612, ink, 'start')
      + [bg, ink, A, B].map((col, k) => rect(900 + k * 130, 700, 110, 110, col, { r: 16, stroke: mix(ink, bg, 0.8), sw: 1 }) + txt(955 + k * 130, 840, col.toUpperCase(), { font: 'mono', size: 14, fill: ink, anchor: 'middle', op: 0.6 })).join('')
      + txt(900, 920, `Typeface — ${font[0].toUpperCase() + font.slice(1)}`, { font: 'avenir', size: 18, fill: ink, op: 0.6 });
  }
  if (layout === 3) {
    const gr = c.lg([[0, A], [1, mix(A, B, 0.7)]], 0, 0, 1, 1);
    const ww = textWidth(word, 110, font, upper, ls * 1.8);
    const total = 230 + 50 + ww, x0 = (W - total) / 2;
    return rect(0, 0, W, H, gr) + circ(W * 0.85, H * 0.1, 420, '#FFFFFF', { op: 0.08 }) + circ(W * 0.1, H * 0.95, 380, '#000000', { op: 0.08 })
      + mk(c, x0 + 115, H / 2 - 20, 230, '#FFFFFF', mix(B, '#FFFFFF', 0.4), L, font, A) + wordmark(x0 + 280, H / 2 + 18, 110, '#FFFFFF', 'start') + tagline(x0 + 284, H / 2 + 76, '#FFFFFF', 'start');
  }
  return rect(0, 0, W, H, bg) + rect(220, 330, 520, 520, A, { r: 120, f: 'sm' }) + mk(c, 480, 590, 330, onColor(A), mix(B, onColor(A), 0.3), L, font, A)
    + wordmark(860, 560, 88, ink, 'start') + tagline(862, 610, ink, 'start')
    + [[ink, bg], [B, onColor(B)], [bg, A]].map(([b2, f2], k) => rect(860 + k * 150, 680, 120, 120, b2, { r: 30, stroke: mix(ink, bg, 0.8), sw: 1 }) + mk(c, 920 + k * 150, 740, 80, f2, A, L, font, b2)).join('');
}

// ======================= POSTERS (portrait) =======================
const POSTER_PALS = [
  ['#F2EDE4', '#151515', '#E63946', '#1D3557', '#F1A208'], ['#0B0B0F', '#F4F4F4', '#FF4D6D', '#7B2CBF', '#4CC9F0'], ['#FFF3E0', '#22223B', '#FF7F11', '#2EC4B6', '#E71D36'],
  ['#E9F5F2', '#0B3C49', '#00A896', '#F25F5C', '#FFE066'], ['#1B1B3A', '#F8F4FF', '#F72585', '#4361EE', '#FFBE0B'], ['#F7F7F2', '#111111', '#0057FF', '#FF3B00', '#FFD000'],
  ['#2A1B12', '#F6E7D7', '#E07A5F', '#81B29A', '#F2CC8F'], ['#EAE4FF', '#1E1442', '#6A4CFF', '#FF6B9A', '#00C2A8'], ['#101820', '#F2F2F2', '#FEE715', '#E94F37', '#3F88C5'], ['#FCEFEF', '#3D0C11', '#D90429', '#2B2D42', '#EF8354'],
];
const EVENTS = ['Design Week', 'Jazz Night', 'Summer Fest', 'Film Club', 'Art Fair', 'Tech Summit', 'Night Market', 'Poetry Slam', 'Food Carnival', 'Indie Gigs'];
const CITIES = ['Jaipur', 'Mumbai', 'Delhi', 'Pune', 'Goa', 'Bengaluru', 'Udaipur', 'Kochi', 'Kolkata', 'Rishikesh'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function posters(c, R, i, W, H) {
  const [bg, ink, A, B, C] = POSTER_PALS[(i * 3 + Math.floor(i / 10)) % POSTER_PALS.length];
  const style = i % 10;
  const ev = EVENTS[Math.floor(i / 10) % EVENTS.length], city = CITIES[(i * 7) % CITIES.length];
  const day = 1 + ((i * 11) % 28), mon = MONTHS[(i * 5) % 12];
  const info = (y, fill) => line(70, y - 40, W - 70, y - 40, fill, 2) + txt(70, y, `${day} ${mon} 2027`, { font: 'helvetica', weight: 700, size: 30, fill }) + txt(W / 2, y, city, { font: 'helvetica', weight: 700, size: 30, fill, anchor: 'middle' })
    + txt(W - 70, y, 'Entry free', { font: 'helvetica', weight: 700, size: 30, fill, anchor: 'end' });
  const title = (x, y, maxW, size, fill, font = 'helvetica', o = {}) => {
    const f = fit(ev, font, maxW, size, o.lines || 2, { upper: o.upper !== false, minSize: 40 });
    return f.lines.map((l, k) => txt(x, y + k * f.size * 0.95, l, { font, weight: o.weight || 800, size: f.size, fill, upper: o.upper !== false, anchor: o.anchor, ls: o.ls ?? -2, italic: o.italic })).join('');
  };
  switch (style) {
    case 0: return rect(0, 0, W, H, bg) + Array.from({ length: 5 }, (_, k) => line(k * 240 + 120, 0, k * 240 + 120, H, ink, 1, { op: 0.12 })).join('')
      + txt(50, 560, String(day).padStart(2, '0'), { font: 'helvetica', weight: 800, size: 560, fill: A, ls: -30 })
      + title(70, 800, W - 140, 150, ink) + txt(70, 1120, `${mon} · ${city}`, { font: 'helvetica', weight: 700, size: 44, fill: ink })
      + [0, 1, 2].map((k) => txt(70 + k * 360, 1300, ['Talks', 'Workshops', 'Exhibits'][k], { font: 'helvetica', weight: 700, size: 26, fill: ink }) + rect(70 + k * 360, 1320, 280, 6, ink, { r: 3, op: 0.2 }) + rect(70 + k * 360, 1340, 220, 6, ink, { r: 3, op: 0.2 })).join('')
      + info(1520, ink);
    case 1: return rect(0, 0, W, H, bg) + circ(380, 420, 260, A) + rect(600, 160, 460, 520, B) + path('M140 1000A320 320 0 0 1 780 1000Z', C) + poly([[700, 1000], [1080, 1000], [890, 680]], ink)
      + rect(120, 160, 60, 60, ink) + circ(980, 820, 40, A) + title(70, 1180, W - 140, 140, ink) + info(1520, ink);
    case 2: return rect(0, 0, W, H, '#0A0A12') + circ(300, 400, 380, A, { f: 'bl60', op: 0.9 }) + circ(900, 700, 420, B, { f: 'bl60', op: 0.9 }) + circ(500, 1100, 360, C, { f: 'bl60', op: 0.8 })
      + rect(0, 0, W, H, '#FFFFFF', { f: 'grain', op: 0.25 }) + title(W / 2, 760, W - 160, 180, '#FFFFFF', 'helvetica', { anchor: 'middle' }) + txt(W / 2, 200, 'Live · Loud · Late', { font: 'avenir', weight: 600, size: 30, fill: '#FFFFFF', anchor: 'middle', upper: true, ls: 10 }) + info(1520, '#FFFFFF');
    case 3: return rect(0, 0, W, H, bg) + circ(W / 2, 560, 330, A) + Array.from({ length: 7 }, (_, k) => rect(0, 640 + k * 34, W, 14 + k * 2, bg)).join('')
      + rect(0, 900, W, H - 900, mix(bg, ink, 0.06)) + title(W / 2, 1090, W - 200, 120, ink, 'didot', { anchor: 'middle', weight: 400, upper: false, ls: 0 })
      + txt(W / 2, 1180, `An evening in ${city}`, { font: 'didot', size: 40, fill: ink, anchor: 'middle', italic: true }) + info(1520, ink);
    case 4: {
      const sky = c.lg([[0, mix(C, '#FFFFFF', 0.3)], [1, mix(A, '#FFFFFF', 0.2)]]);
      const ridge = (y, amp, col, seed) => path(`M0 ${H}L0 ${y}` + Array.from({ length: 7 }, (_, k) => `L${(k + 1) * 200 - 100} ${y - amp * ((k * seed) % 3 === 0 ? 1 : 0.45)}L${(k + 1) * 200} ${y}`).join('') + `L${W} ${H}Z`, col);
      return rect(0, 0, W, H, sky) + circ(W / 2, 640, 170, mix(C, '#FFFFFF', 0.6)) + ridge(760, 300, mix(B, '#FFFFFF', 0.3), 1) + ridge(900, 240, B, 2) + ridge(1050, 200, mix(B, ink, 0.5), 5)
        + rect(0, 1200, W, 400, mix(ink, B, 0.3)) + txt(W / 2, 230, `Visit ${city}`, { font: 'futura', weight: 800, size: 130, fill: ink, anchor: 'middle', upper: true, ls: 6 })
        + txt(W / 2, 300, 'Mountains · Lakes · Stories', { font: 'futura', weight: 500, size: 30, fill: ink, anchor: 'middle', upper: true, ls: 8 }) + txt(W / 2, 1420, 'Railways of India · Est. 1953', { font: 'futura', weight: 600, size: 30, fill: bg, anchor: 'middle', upper: true, ls: 6 });
    }
    case 5: {
      const word = ev.split(' ')[0].toUpperCase();
      const f = fit(word, 'helvetica', W - 100, 260, 1, { upper: true, minSize: 60 });
      return rect(0, 0, W, H, A) + Array.from({ length: 7 }, (_, k) => txt(W / 2, 260 + k * f.size * 0.92, word, { font: 'helvetica', weight: 800, size: f.size, anchor: 'middle', ls: -4, fill: k % 2 ? 'none' : onColor(A), stroke: onColor(A), sw: 3 })).join('')
        + info(1520, onColor(A));
    }
    case 6: return rect(0, 0, W, H, bg) + Array.from({ length: 12 }, (_, k) => circ(W / 2 + (k % 2) * 20, 640, 560 - k * 46, [A, bg, B, bg, C, bg][k % 6])).join('')
      + rect(70, 1180, W - 140, 220, ink) + title(110, 1300, W - 220, 100, bg) + info(1520, ink);
    case 7: {
      let tiles = '';
      for (let y = 0; y < 6; y++) for (let x = 0; x < 5; x++) {
        const tx0 = x * 240, ty0 = y * 240, col = pick(R, [A, B, C, ink]), r = Math.floor(R() * 4);
        const corner = [[tx0, ty0], [tx0 + 240, ty0], [tx0 + 240, ty0 + 240], [tx0, ty0 + 240]][r];
        tiles += rect(tx0, ty0, 240, 240, pick(R, [bg, mix(bg, ink, 0.06)])) + (R() < 0.5 ? circ(corner[0], corner[1], 240, col) : circ(tx0 + 120, ty0 + 120, 90, col));
      }
      return rect(0, 0, W, H, bg) + g(tiles, { clip: c.clip(rect(0, 0, W, 1440, '#000')) }) + rect(70, 1000, W - 140, 300, bg) + title(110, 1130, W - 220, 110, ink) + txt(110, 1260, `${city} · ${day} ${mon}`, { font: 'helvetica', weight: 700, size: 36, fill: A }) + info(1540, ink);
    }
    case 8: {
      const night = c.lg([[0, '#05070F'], [1, mix(A, '#05070F', 0.6)]]);
      return rect(0, 0, W, H, night) + Array.from({ length: 70 }, () => circ(R() * W, R() * 800, R() * 2 + 0.6, '#FFFFFF', { op: R() * 0.8 + 0.2 })).join('')
        + circ(820, 420, 150, '#F4F1DE') + circ(870, 390, 140, '#05070F', { op: 0.15 })
        + path(`M0 1100L180 900L320 1000L520 780L700 960L880 860L1200 1080L1200 1600L0 1600Z`, '#04060C') + path('M560 1100l12 -60l12 60l-6 0l0 40l-12 0l0 -40z', '#04060C')
        + title(W / 2, 1240, W - 160, 120, '#F4F1DE', 'didot', { anchor: 'middle', weight: 400, ls: 8 })
        + txt(W / 2, 1150, `A ${coined(i)} Pictures film`, { font: 'avenir', size: 26, fill: '#F4F1DE', anchor: 'middle', upper: true, ls: 8, op: 0.8 })
        + Array.from({ length: 4 }, (_, k) => rect(120 + (k % 2) * 40, 1420 + k * 22, W - 240 - (k % 2) * 80, 8, '#F4F1DE', { r: 4, op: 0.35 })).join('')
        + txt(W / 2, 1550, `In cinemas ${day} ${mon}`, { font: 'avenir', weight: 700, size: 30, fill: A, anchor: 'middle', upper: true, ls: 6 });
    }
    default: return rect(0, 0, W, H, ink) + g(Array.from({ length: 30 }, (_, k) => rect(-400 + k * 80, -200, 36, 2400, A, { op: 0.9 })).join(''), { t: `rotate(-30 ${W / 2} ${H / 2})`, clip: c.clip(rect(0, 0, W, 520, '#000')) })
      + txt(W / 2, 980, '50%', { font: 'helvetica', weight: 800, size: 420, fill: A, anchor: 'middle', ls: -20 }) + txt(W / 2, 1100, 'OFF EVERYTHING', { font: 'helvetica', weight: 800, size: 80, fill: bg, anchor: 'middle', ls: 4 })
      + txt(W / 2, 1200, `${ev} sale · ${city}`, { font: 'avenir', weight: 600, size: 34, fill: bg, anchor: 'middle', op: 0.75 }) + info(1520, bg);
  }
}

// ======================= RANGOLI (square) =======================
const RANGOLI_PALS = [
  ['#E91E63', '#FF9800', '#FFEB3B', '#4CAF50', '#2196F3'], ['#D7263D', '#F46036', '#FFD23F', '#1B998B', '#FFFFFF'], ['#7B2CBF', '#F72585', '#FFBE0B', '#3A86FF', '#FFFFFF'],
  ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#06D6A0'], ['#C1121F', '#FDF0D5', '#F4A261', '#2A9D8F', '#E9C46A'], ['#FF4D6D', '#FFB703', '#06D6A0', '#118AB2', '#FFFFFF'],
  ['#9D0208', '#E85D04', '#FFBA08', '#FFFFFF', '#2D6A4F'], ['#00A6FB', '#F15BB5', '#FEE440', '#00F5D4', '#9B5DE5'], ['#B5179E', '#F77F00', '#FCBF49', '#EAE2B7', '#003049'], ['#E63946', '#F1FAEE', '#FFB703', '#43AA8B', '#577590'],
];
const FLOORS = ['#6E2B1B', '#1E1B2E', '#E9DFCB', '#1E3A2C', '#141414', '#3B2A20'];
const PETALS = [
  (L, w) => `M0 0C${w} ${-L * 0.3} ${w * 0.8} ${-L * 0.8} 0 ${-L}C${-w * 0.8} ${-L * 0.8} ${-w} ${-L * 0.3} 0 0Z`,
  (L, w) => `M0 0Q${w * 1.1} ${-L / 2} 0 ${-L}Q${-w * 1.1} ${-L / 2} 0 0Z`,
  (L, w) => `M0 ${-L * 0.15}C${w * 1.3} ${-L * 0.6} ${w * 0.6} ${-L * 1.05} 0 ${-L * 0.72}C${-w * 0.6} ${-L * 1.05} ${-w * 1.3} ${-L * 0.6} 0 ${-L * 0.15}Z`,
  (L, w) => `M0 0L${w * 0.8} ${-L * 0.5}L0 ${-L}L${-w * 0.8} ${-L * 0.5}Z`,
  (L, w) => `M${-w * 0.3} 0L${-w * 0.3} ${-L + w}A${w} ${w} 0 1 1 ${w * 0.3} ${-L + w}L${w * 0.3} 0Z`,
];

function diya(cx, cy, s, c) {
  return ell(cx, cy - s * 0.9, s * 0.9, s * 1.2, c.rg([[0, '#FFD166', 0.75], [1, '#FFD166', 0]])) + path(`M${cx - s} ${cy}Q${cx} ${cy + s * 0.9} ${cx + s} ${cy}Z`, c.lg([[0, '#C2571A'], [1, '#7A2E0E']]))
    + ell(cx, cy, s, s * 0.22, '#E07A2E') + path(`M${cx} ${cy - s * 1.1}Q${cx + s * 0.32} ${cy - s * 0.4} ${cx} ${cy - s * 0.15}Q${cx - s * 0.32} ${cy - s * 0.4} ${cx} ${cy - s * 1.1}Z`, c.lg([[0, '#FFF3B0'], [1, '#FF8C1A']]));
}

function rangoli(c, R, i, W, H) {
  const pal = RANGOLI_PALS[i % RANGOLI_PALS.length];
  const floor = FLOORS[(i * 3) % FLOORS.length];
  const cx = W / 2, cy = H / 2;
  const n = [6, 8, 10, 12, 16][Math.floor(i / 10) % 5];
  let r = 40, art = '';
  const ring = (count, radius, shape, L, w, fill, rot = 0, outline) => Array.from({ length: count }, (_, k) => path(PETALS[shape](L, w), fill, { t: `translate(${cx} ${cy}) rotate(${(k * 360) / count + rot}) translate(0 ${-radius})`, stroke: outline, sw: outline ? 5 : '' })).join('');
  const dots = (count, radius, size, fill) => Array.from({ length: count }, (_, k) => circ(...polar(cx, cy, radius, (k * 2 * Math.PI) / count), size, fill)).join('');
  art += circ(cx, cy, 60, pal[2]) + circ(cx, cy, 34, pal[0]) + circ(cx, cy, 14, pal[4]);
  for (let l = 0; r < 470; l++) {
    const kind = Math.floor(R() * 4), col = pal[(l + 1 + Math.floor(R() * 2)) % pal.length], col2 = pal[(l + 3) % pal.length];
    const count = n * (R() < 0.4 ? 2 : 1);
    if (kind === 0) { const L = 70 + R() * 50; art += ring(count, r, Math.floor(R() * PETALS.length), L, 30 + R() * 14, col, l % 2 ? 180 / count : 0, col2); r += L + 12; }
    else if (kind === 1) { art += circ(cx, cy, r + 14, 'none', { stroke: col, sw: 18 }) + dots(count * 3, r + 14, 5, col2); r += 34; }
    else if (kind === 2) { art += dots(count * 2, r + 18, 13, col) + dots(count * 2, r + 18, 5, col2); r += 40; }
    else { art += Array.from({ length: count }, (_, k) => circ(...polar(cx, cy, r + 30, (k * 2 * Math.PI) / count), 32, col)).join('') + circ(cx, cy, r + 2, 'none', { stroke: col2, sw: 6 }); r += 66; }
  }
  const outerR = Math.min(r + 30, 600);
  art = ring(n * 2, outerR - 110, 0, 120, 44, pal[1], 0) + circ(cx, cy, outerR - 112, floor) + art;
  const diyas = [0, 1, 2, 3].map((k) => { const [x, y] = polar(cx, cy, outerR + 20, Math.PI / 4 + (k * Math.PI) / 2); return diya(x, y + 20, 34, c); }).join('');
  const marigold = Array.from({ length: 26 }, () => { const a = R() * Math.PI * 2, d = outerR + 70 + R() * 120; const [x, y] = polar(cx, cy, d, a); return circ(x, y, 7 + R() * 7, pick(R, ['#FF9F1C', '#FFBF00', '#FF6B35', '#E63946'])); }).join('');
  return rect(0, 0, W, H, c.rg([[0, mix(floor, '#FFFFFF', 0.12)], [1, mix(floor, '#000000', 0.25)]], 0.5, 0.5, 0.75)) + rect(0, 0, W, H, '#FFFFFF', { f: 'grain', op: 0.18 })
    + g(art, { f: 'powder' }) + g(art, { op: 0.25, f: 'bl4' }) + marigold + diyas;
}

// ======================= FESTIVE GREETINGS (square) =======================
const FESTS = [
  { name: 'Happy Diwali', sub: 'May the festival of lights fill your home with joy', pals: [['#1A0B2E', '#FFD166', '#F77F00'], ['#3D0B0B', '#FFC857', '#E63946'], ['#0B1D3A', '#FFD700', '#FF7B00']] },
  { name: 'Happy Holi', sub: 'Colours, laughter and sweet gujiyas', pals: [['#FFFFFF', '#E0007A', '#00A6ED'], ['#FFF8F0', '#7B2CBF', '#FF5400'], ['#F7FFF7', '#FF006E', '#3A86FF']] },
  { name: 'Eid Mubarak', sub: 'Wishing you peace, joy and blessings', pals: [['#0B3D2E', '#E9C46A', '#2A9D8F'], ['#101A40', '#F2D16B', '#5B8DEF'], ['#2B193D', '#E8C468', '#8E5DB8']] },
  { name: 'Merry Christmas', sub: 'Warm wishes for the holidays and a bright new year', pals: [['#0F3B2E', '#F2E8CF', '#D62828'], ['#7A0C1A', '#FDF0D5', '#2D6A4F'], ['#F3EFE6', '#1B4332', '#C1121F']] },
  { name: 'Happy New Year', sub: 'Here is to new beginnings · 2027', pals: [['#0A0A1A', '#FFD166', '#EF476F'], ['#101820', '#F2AA4C', '#4CC9F0'], ['#1B0F2E', '#F8F7FF', '#B388EB']] },
  { name: 'Happy Raksha Bandhan', sub: 'A thread of love, a promise for life', pals: [['#FFF4E6', '#C1121F', '#F4A261'], ['#FDF2F8', '#9D174D', '#F59E0B'], ['#F0FDF4', '#B45309', '#DC2626']] },
  { name: 'Happy Navratri', sub: 'Nine nights of dance, devotion and colour', pals: [['#7A0019', '#FFD23F', '#FF7A00'], ['#2B0A3D', '#FFB703', '#FB5607'], ['#004E64', '#FFD166', '#EF476F']] },
  { name: 'Happy Makar Sankranti', sub: 'Til-gud ghya, god god bola · Let the kites fly high', pals: [['#7EC8E3', '#0B2545', '#FF6F59'], ['#FFD6A5', '#3D2C8D', '#E63946'], ['#BDE0FE', '#1D3557', '#F77F00']] },
];

function festive(c, R, i, W, H) {
  const type = i % FESTS.length, F = FESTS[type];
  const [bg, A, B] = F.pals[Math.floor(i / FESTS.length) % F.pals.length];
  const ink = onColor(bg) === '#FFFFFF' ? '#FFFFFF' : mix(A, '#000000', 0.3);
  const brand = coined(i * 3 + 1);
  let art = '';
  const ty = 1050, by = 0;
  if (type === 0) {
    art += Array.from({ length: 5 }, (_, k) => { const x = 180 + k * 260, len = 140 + (k % 2) * 110; return line(x, 0, x, len, A, 2, { op: 0.6 }) + rect(x - 40, len, 80, 110, c.lg([[0, B], [1, mix(B, '#000000', 0.4)]]), { r: 18 }) + ell(x, len + 55, 70, 80, c.rg([[0, A, 0.5], [1, A, 0]])) + rect(x - 30, len + 8, 60, 6, A) + rect(x - 30, len + 96, 60, 6, A) + line(x, len + 110, x, len + 160, A, 3); }).join('');
    art += Array.from({ length: 7 }, (_, k) => diya(200 + k * 167, by + 760, 46, c)).join('');
    art += Array.from({ length: 40 }, () => circ(R() * W, R() * H, R() * 3 + 1, A, { op: R() })).join('');
  } else if (type === 1) {
    art += Array.from({ length: 9 }, (_, k) => circ(R() * W, by + 300 + R() * 600, 120 + R() * 160, [A, B, '#FFD60A', '#06D6A0', '#FF5400'][k % 5], { f: 'bl60', op: 0.75 })).join('')
      + Array.from({ length: 160 }, () => circ(R() * W, by + 200 + R() * 800, R() * 7 + 1, pick(R, [A, B, '#FFD60A', '#06D6A0']), { op: 0.8 })).join('');
  } else if (type === 2) {
    art += circ(1050, 330, 150, A, { mask: c.mask(circ(1050, 330, 150, '#FFFFFF') + circ(1110, 290, 130, '#000000')) }) + poly(Array.from({ length: 10 }, (_, k) => polar(950, 260, k % 2 ? 14 : 34, -Math.PI / 2 + (k * Math.PI) / 5)), A);
    art += [260, 520, 780].map((x, k) => { const len = 200 + k * 90; return line(x, 0, x, len, A, 2) + path(`M${x - 50} ${len + 40}L${x} ${len}L${x + 50} ${len + 40}L${x + 40} ${len + 170}L${x - 40} ${len + 170}Z`, mix(A, '#000000', 0.2)) + rect(x - 30, len + 52, 60, 100, c.rg([[0, '#FFF3B0'], [1, A, 0.7]])) + poly([[x - 50, len + 40], [x, len - 20], [x + 50, len + 40]], A); }).join('');
    art += Array.from({ length: 50 }, () => circ(R() * W, R() * 900, R() * 2.5 + 0.5, A, { op: R() })).join('');
  } else if (type === 3) {
    const tx = 700, tyy = by + 160;
    art += [0, 1, 2, 3].map((k) => poly([[tx, tyy + k * 140], [tx + 160 + k * 70, tyy + 220 + k * 140], [tx - 160 - k * 70, tyy + 220 + k * 140]], mix(B === '#D62828' ? '#2D6A4F' : B, '#000000', k * 0.08))).join('')
      + rect(tx - 30, tyy + 640, 60, 70, '#6B4423') + poly(Array.from({ length: 10 }, (_, k) => polar(tx, tyy - 10, k % 2 ? 18 : 44, -Math.PI / 2 + (k * Math.PI) / 5)), '#FFD166')
      + Array.from({ length: 16 }, () => { const k = Math.floor(R() * 4), yy = tyy + 120 + k * 140 + R() * 80, half = (yy - tyy) * 0.7; return circ(tx + (R() - 0.5) * half * 1.6, yy, 16, pick(R, [A, '#FFD166', B, '#FFFFFF'])); }).join('')
      + Array.from({ length: 80 }, () => circ(R() * W, R() * H, R() * 4 + 1, '#FFFFFF', { op: 0.7 })).join('');
  } else if (type === 4) {
    art += Array.from({ length: 5 }, () => { const x = 150 + R() * 1100, y = by + 150 + R() * 450, col = pick(R, [A, B, '#FFFFFF', '#4CC9F0']), rr = 90 + R() * 90;
      return Array.from({ length: 24 }, (_, k) => { const a = (k * Math.PI) / 12; return line(...polar(x, y, rr * 0.3, a), ...polar(x, y, rr, a), col, 4) + circ(...polar(x, y, rr + 10, a), 5, col); }).join(''); }).join('')
      + txt(700, by + 820, '2027', { font: 'helvetica', weight: 800, size: 260, fill: 'none', stroke: A, sw: 4, anchor: 'middle', ls: 10 });
  } else if (type === 5) {
    art += path(`M0 ${by + 640}Q350 ${by + 560} 700 ${by + 640}T1400 ${by + 640}`, 'none', { stroke: A, sw: 14, cap: 'round' }) + path(`M0 ${by + 640}Q350 ${by + 560} 700 ${by + 640}T1400 ${by + 640}`, 'none', { stroke: B, sw: 4, dash: '2 14', cap: 'round' })
      + Array.from({ length: 12 }, (_, k) => ell(700, by + 640, 150, 54, k % 2 ? A : B, { t: `rotate(${k * 15} 700 ${by + 640})`, op: 0.9 })).join('') + circ(700, by + 640, 70, '#FFD166') + circ(700, by + 640, 40, A)
      + Array.from({ length: 16 }, (_, k) => circ(...polar(700, by + 640, 105, (k * Math.PI) / 8), 9, '#FFFFFF')).join('');
  } else if (type === 6) {
    art += Array.from({ length: 16 }, (_, k) => path(PETALS[1](200, 60), k % 2 ? A : B, { t: `translate(700 ${by + 620}) rotate(${k * 22.5})`, op: 0.35 })).join('')
      + [[-1, A], [1, B]].map(([d, col]) => g(rect(-14, -320, 28, 640, c.lg([[0, col], [0.5, '#FFD166'], [1, col]], 0, 0, 0, 1)) + [-250, -150, 150, 250].map((y) => rect(-16, y, 32, 20, '#FFFFFF', { op: 0.7 })).join(''), { t: `translate(700 ${by + 620}) rotate(${d * 35})` })).join('');
  } else {
    art += Array.from({ length: 6 }, () => { const x = 120 + R() * 1160, y = by + 120 + R() * 520, s = 70 + R() * 70, col = pick(R, [A, B, '#FFD166', '#06D6A0', '#EF476F']), a = (R() - 0.5) * 40;
      return g(poly([[0, -s], [s * 0.8, 0], [0, s * 1.1], [-s * 0.8, 0]], col) + line(0, -s, 0, s * 1.1, '#FFFFFF', 2, { op: 0.6 }) + line(-s * 0.8, 0, s * 0.8, 0, '#FFFFFF', 2, { op: 0.6 })
        + path(`M0 ${s * 1.1}q20 40 -10 80t10 80`, 'none', { stroke: col, sw: 3 }), { t: `translate(${x} ${y}) rotate(${a})` }) + path(`M${x} ${y + s * 1.1}Q${x + 200} ${H} ${x + 400} ${H + 200}`, 'none', { stroke: ink, sw: 1, op: 0.3 }); }).join('')
      + circ(1180, 180, 80, '#FFD166', { op: 0.9 });
  }
  const f = fit(F.name, 'didot', W - 200, 130, 2, { minSize: 60 });
  const textBlock = f.lines.map((l, k) => txt(W / 2, ty + k * f.size, l, { font: 'didot', size: f.size, fill: type === 1 ? mix(A, '#000000', 0.3) : ink, anchor: 'middle' })).join('')
    + txt(W / 2, ty + (f.lines.length - 1) * f.size + 70, F.sub, { font: 'avenir', weight: 500, size: 30, fill: type === 1 ? '#333333' : ink, anchor: 'middle', op: 0.85 })
    + txt(W / 2, H - 60, `Warm wishes from ${brand} family`, { font: 'avenir', weight: 600, size: 22, fill: type === 1 ? '#333333' : ink, anchor: 'middle', upper: true, ls: 5, op: 0.7 });
  return rect(0, 0, W, H, c.rg([[0, mix(bg, '#FFFFFF', 0.1)], [1, bg]], 0.5, 0.4, 0.8)) + art + textBlock;
}

export const GRAPHICS = { logos, posters, rangoli, festive };
