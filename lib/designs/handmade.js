// "Made by hand" artwork: sketchbook pages, wireframes, moodboards, lettering, process boards, doodles,
// paper collage, type studies, colour studies and icon sets. Pencil (#pen), wobble (#wob) and torn-paper (#torn)
// filters give the drawn look. Each draw(c, R, i, W, H) gets a seeded random function and the index in its category (0–49).
import { art, artColors } from './art';
import { circ, ell, fit, g, line, mix, onColor, path, poly, rect, textWidth, txt } from './core';
import { coined } from './graphics';

const pick = (R, arr) => arr[Math.floor(R() * arr.length)];
const jit = (R, n) => (R() - 0.5) * 2 * n;
const GRAPHITE = '#34343A';
const MARKERS = ['#F25F5C', '#FFB703', '#3A86FF', '#06D6A0', '#FF8FAB', '#8E7DBE', '#F4A261', '#90BE6D'];
const hand = (x, y, s, size, o = {}) => txt(x, y, s, { font: o.font || 'hand', weight: o.weight || 400, size, fill: o.fill || GRAPHITE, anchor: o.anchor, op: o.op, t: o.t, upper: o.upper, ls: o.ls });

// ---------- hand-drawn strokes ----------
const hline = (R, x1, y1, x2, y2, col = GRAPHITE, sw = 2.5) => {
  const mx = (x1 + x2) / 2 + jit(R, 4), my = (y1 + y2) / 2 + jit(R, 4);
  return path(`M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}`, 'none', { stroke: col, sw, cap: 'round' }) + path(`M${x1 + jit(R, 2)} ${y1 + jit(R, 2)}Q${mx + jit(R, 3)} ${my + jit(R, 3)} ${x2 + jit(R, 2)} ${y2 + jit(R, 2)}`, 'none', { stroke: col, sw: sw * 0.5, cap: 'round', op: 0.5 });
};
const hrect = (R, x, y, w, h, col = GRAPHITE, sw = 2.5, r = 0) => (r
  ? path(`M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r + 6} ${y - 1}`, 'none', { stroke: col, sw, cap: 'round' })
  : hline(R, x - 4, y, x + w + 5, y + jit(R, 1.5), col, sw) + hline(R, x + w, y - 4, x + w + jit(R, 1.5), y + h + 5, col, sw) + hline(R, x + w + 4, y + h, x - 5, y + h + jit(R, 1.5), col, sw) + hline(R, x, y + h + 4, x + jit(R, 1.5), y - 5, col, sw));
const hcircle = (R, cx, cy, r, col = GRAPHITE, sw = 2.5) => {
  const pts = Array.from({ length: 14 }, (_, k) => { const a = -0.3 + (k / 12.5) * Math.PI * 2; const rr = r * (1 + jit(R, 0.04)) + k * 0.3; return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]; });
  return path('M' + pts.map((p, k) => (k ? 'L' : '') + p.map((n) => n.toFixed(1)).join(' ')).join(''), 'none', { stroke: col, sw, cap: 'round', join: 'round' });
};
const arrow = (R, x1, y1, x2, y2, col = GRAPHITE, sw = 2.5) => {
  const mx = (x1 + x2) / 2 + (y2 - y1) * 0.2, my = (y1 + y2) / 2 - (x2 - x1) * 0.2;
  const a = Math.atan2(y2 - my, x2 - mx);
  return path(`M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}`, 'none', { stroke: col, sw, cap: 'round' })
    + path(`M${x2 - Math.cos(a - 0.5) * 16} ${y2 - Math.sin(a - 0.5) * 16}L${x2} ${y2}L${x2 - Math.cos(a + 0.5) * 16} ${y2 - Math.sin(a + 0.5) * 16}`, 'none', { stroke: col, sw, cap: 'round', join: 'round' });
};
const squiggle = (R, x, y, w, col = GRAPHITE, sw = 2) => path(`M${x} ${y}` + Array.from({ length: Math.max(2, Math.floor(w / 14)) }, (_, k) => `q7 ${k % 2 ? 5 : -5} 14 0`).join(''), 'none', { stroke: col, sw, cap: 'round', join: 'round', op: 0.75 });
const tape = (x, y, w, rot, col = '#F3E7C9') => rect(x - w / 2, y - 18, w, 36, col, { op: 0.75, t: `rotate(${rot} ${x} ${y})` }) + rect(x - w / 2, y - 18, w, 36, '#FFFFFF', { f: 'grain', op: 0.25, t: `rotate(${rot} ${x} ${y})` });
const sticky = (R, x, y, s, lines, col) => {
  const rot = jit(R, 5);
  return g(rect(6, 10, s, s, '#000000', { op: 0.18, f: 'bl4' }) + rect(0, 0, s, s, col) + rect(0, 0, s, 26, '#000000', { op: 0.05 })
    + lines.map((l, k) => hand(18, 62 + k * 34, l, 24)).join(''), { t: `translate(${x} ${y}) rotate(${rot})` });
};
const marker = (R, cx, cy, rx, ry, col) => ell(cx + jit(R, 10), cy + jit(R, 10), rx, ry, col, { op: 0.32, f: 'wob', t: `rotate(${jit(R, 20)} ${cx} ${cy})` });

// ---------- paper ----------
const PAPERS = { cream: '#F4EFE4', white: '#FBFAF7', kraft: '#CDB48E', blue: '#EEF3F8', dark: '#262629' };
function paperFill(c, w, h, kind) {
  const base = PAPERS[kind] || PAPERS.cream;
  let s = rect(0, 0, w, h, base);
  if (kind === 'blue') s += rect(0, 0, w, h, c.pattern(32, 32, line(0, 0, 32, 0, '#9DB7D5', 1, { op: 0.45 }) + line(0, 0, 0, 32, '#9DB7D5', 1, { op: 0.45 })));
  if (kind === 'white') s += rect(0, 0, w, h, c.pattern(30, 30, circ(15, 15, 1.6, '#B8B4AC')));
  return s + rect(0, 0, w, h, '#000000', { f: 'grain', op: kind === 'dark' ? 0.35 : 0.16 }) + rect(0, 0, w, h, c.rg([[0.6, '#000000', 0], [1, '#000000', 0.12]], 0.5, 0.5, 0.75));
}
// The page either fills the frame, or lies on a desk with a pencil and eraser next to it.
function sheet(c, R, W, H, kind, desk, inner) {
  if (!desk) return paperFill(c, W, H, kind) + inner(W, H);
  const pw = 1380, ph = 1020, x = (W - pw) / 2, y = (H - ph) / 2, rot = jit(R, 1.4);
  const wood = pick(R, ['#8A6446', '#6E4E37', '#B08A66', '#4A4A4E', '#D7D2CA']);
  const deskBg = rect(0, 0, W, H, c.lg([[0, mix(wood, '#FFFFFF', 0.08)], [1, mix(wood, '#000000', 0.18)]], 0, 0, 1, 1))
    + Array.from({ length: 16 }, (_, k) => path(`M0 ${k * 80 + jit(R, 20)}Q800 ${k * 80 + jit(R, 40)} 1600 ${k * 80 + jit(R, 20)}`, 'none', { stroke: '#000000', sw: 1.5, op: 0.08 })).join('') + rect(0, 0, W, H, '#000000', { f: 'grain', op: 0.2 });
  const pencil = g(rect(0, -9, 360, 18, '#F2B705') + rect(0, -9, 360, 6, '#FFD54A') + rect(-30, -9, 34, 18, '#E8C9A0') + poly([[-30, -9], [-52, 0], [-30, 9]], '#E8C9A0') + poly([[-44, -3], [-52, 0], [-44, 3]], '#2A2A2A')
    + rect(360, -9, 26, 18, '#BFC5CC') + rect(386, -9, 30, 18, '#F28B9B', { r: 4 }), { t: `translate(${1180 + jit(R, 40)} ${1140}) rotate(${-14 + jit(R, 6)})` });
  return deskBg + rect(x + 10, y + 18, pw, ph, '#000000', { op: 0.35, f: 'bl', t: `rotate(${rot} ${W / 2} ${H / 2})` })
    + g(paperFill(c, pw, ph, kind) + inner(pw, ph), { t: `rotate(${rot} ${W / 2} ${H / 2}) translate(${x} ${y})`, clip: c.clip(rect(0, 0, pw, ph, '#000')) })
    + g(rect(0, 0, 90, 46, '#F4F4F2', { r: 8 }) + rect(0, 0, 90, 14, '#3A86FF', { r: 4 }), { t: `translate(${90 + jit(R, 30)} ${1110}) rotate(${jit(R, 20)})` }) + pencil;
}

const SKETCH_OBJ = ['sneaker', 'perfume', 'perfume2', 'watch', 'watchSq', 'handbag', 'headphones', 'lipstick', 'serum', 'jar', 'bottle', 'cup', 'takeaway', 'chair', 'lamp', 'sofa', 'plant', 'car', 'controller', 'trophy', 'ring', 'necklace', 'diamond', 'dress', 'tshirt', 'sunglasses', 'kettlebell', 'mic', 'vinyl', 'house'];
const OBJ_NAME = { watchSq: 'smartwatch', perfume2: 'perfume bottle', takeaway: 'coffee cup', jar: 'cream jar', serum: 'serum bottle', bottle: 'water bottle', cup: 'mug', mic: 'microphone', vinyl: 'record player', controller: 'game controller', tshirt: 't-shirt' };
const objName = (k) => OBJ_NAME[k] || k;
const NOTES = ['matte finish', 'brushed metal', 'softer curve?', 'try 2 mm thinner', 'rubber grip', 'gold accent', 'v2 — better!', 'keep it simple', 'check proportions', 'logo here', 'more contrast', 'rounded edge', 'recycled material', 'like this one ✓'];
const pen = (c, kind, x, y, s, col) => g(art(c, kind, artColors({ accent: col, accent2: mix(col, '#FFFFFF', 0.3), ink: '#222222', bg: '#FFFFFF' }, 'gold'), x, y, s), { f: 'pen' });
const DATES = (i) => `${String(1 + (i * 7) % 28).padStart(2, '0')}.${String(1 + (i * 5) % 12).padStart(2, '0')}.26`;

// ======================= 1. SKETCHBOOK =======================
function sketchbook(c, R, i, W, H) {
  const kind = pick(R, ['cream', 'white', 'cream', 'kraft']);
  return sheet(c, R, W, H, kind, i % 2 === 1, (w, h) => {
    const mk = MARKERS[i % MARKERS.length];
    const objs = [SKETCH_OBJ[i % SKETCH_OBJ.length], SKETCH_OBJ[(i * 7 + 3) % SKETCH_OBJ.length], SKETCH_OBJ[(i * 11 + 5) % SKETCH_OBJ.length]];
    let s = hand(70, 100, `Concept ${String(i + 1).padStart(2, '0')} — ${objName(objs[0])}`, 46) + hand(w - 70, 96, DATES(i), 30, { anchor: 'end', op: 0.7 }) + hline(R, 70, 120, 520, 124, GRAPHITE, 2);
    if (kind !== 'kraft' && i % 2 === 0) s += Array.from({ length: 14 }, (_, k) => circ(120 + k * ((w - 240) / 13), 26, 9, '#2A2A2A', { op: 0.85 })).join('');
    const layout = Math.floor(i / 2) % 3;
    if (layout === 0) {
      s += marker(R, w * 0.4, h * 0.55, 260, 200, mk) + pen(c, objs[0], w * 0.4, h * 0.55, 560, mk)
        + hline(R, w * 0.4 - 330, h * 0.55 + 250, w * 0.4 + 330, h * 0.55 + 250, GRAPHITE, 1.2)
        + [1, 2].map((k) => pen(c, objs[k], w * 0.82, 260 + (k - 1) * 330, 240, MARKERS[(i + k) % MARKERS.length]) + hand(w * 0.82, 400 + (k - 1) * 330, `alt ${k}`, 24, { anchor: 'middle', op: 0.7 })).join('')
        + arrow(R, w * 0.4 + 140, h * 0.55 - 220, w * 0.4 + 240, h * 0.55 - 300) + hand(w * 0.4 + 250, h * 0.55 - 306, NOTES[i % NOTES.length], 30)
        + arrow(R, w * 0.4 - 200, h * 0.55 + 140, w * 0.4 - 330, h * 0.55 + 220) + hand(w * 0.4 - 470, h * 0.55 + 250, NOTES[(i + 5) % NOTES.length], 30);
    } else if (layout === 1) {
      s += [0, 1, 2].map((k) => { const x = w * (0.2 + k * 0.3); return marker(R, x, h * 0.5, 150, 120, MARKERS[(i + k) % MARKERS.length]) + pen(c, objs[k], x, h * 0.5, 340, MARKERS[(i + k) % MARKERS.length])
        + hand(x, h * 0.5 + 230, `0${k + 1}. ${NOTES[(i + k * 3) % NOTES.length]}`, 28, { anchor: 'middle' }) + (k === 2 ? hcircle(R, x, h * 0.5 + 220, 140, '#E63946', 3) : ''); }).join('')
        + hand(w * 0.8, h * 0.5 + 330, 'this one!', 34, { anchor: 'middle', fill: '#E63946' });
    } else {
      s += marker(R, w * 0.36, h * 0.55, 280, 220, mk) + pen(c, objs[0], w * 0.36, h * 0.55, 600, mk) + hcircle(R, w * 0.36 + 120, h * 0.55 - 40, 70, GRAPHITE, 2)
        + path(`M${w * 0.36 + 180} ${h * 0.55 - 80}L${w * 0.72 - 150} ${h * 0.45 - 80}`, 'none', { stroke: GRAPHITE, sw: 1.5, dash: '8 8' })
        + hcircle(R, w * 0.74, h * 0.45, 180, GRAPHITE, 3) + g(pen(c, objs[0], w * 0.74 - 150, h * 0.45 + 50, 1200, mk), { clip: c.clip(circ(w * 0.74, h * 0.45, 176, '#000')) })
        + hand(w * 0.74, h * 0.45 + 240, `detail — ${NOTES[(i + 2) % NOTES.length]}`, 28, { anchor: 'middle' });
    }
    return s;
  });
}

// ======================= 2. WIREFRAMES =======================
function screen(R, x, y, w, h, kind, accent) {
  let s = hrect(R, x, y, w, h, GRAPHITE, 3, 26) + hline(R, x + w / 2 - 30, y + 18, x + w / 2 + 30, y + 18, GRAPHITE, 4);
  let cy = y + 50;
  const imgBox = (bx, by, bw, bh) => hrect(R, bx, by, bw, bh, GRAPHITE, 2) + hline(R, bx, by, bx + bw, by + bh, GRAPHITE, 1.2) + hline(R, bx + bw, by, bx, by + bh, GRAPHITE, 1.2);
  s += squiggle(R, x + 20, cy + 10, w * 0.4, GRAPHITE, 3) + hcircle(R, x + w - 36, cy + 8, 13);
  cy += 40;
  const blocks = kind === 0 ? ['img', 'text', 'text', 'row', 'row', 'btn'] : kind === 1 ? ['img2', 'text', 'chips', 'text', 'btn'] : ['row', 'row', 'row', 'row', 'text', 'btn'];
  for (const b of blocks) {
    if (cy > y + h - 80) break;
    if (b === 'img') { s += imgBox(x + 20, cy, w - 40, h * 0.26); cy += h * 0.26 + 20; }
    else if (b === 'img2') { s += imgBox(x + 20, cy, w - 40, h * 0.38); cy += h * 0.38 + 20; }
    else if (b === 'text') { s += squiggle(R, x + 20, cy + 8, w * 0.7) + squiggle(R, x + 20, cy + 30, w * 0.5); cy += 52; }
    else if (b === 'chips') { s += [0, 1, 2].map((k) => hrect(R, x + 20 + k * ((w - 40) / 3), cy, (w - 60) / 3, 30, GRAPHITE, 2, 14)).join(''); cy += 50; }
    else if (b === 'row') { s += hcircle(R, x + 42, cy + 20, 18) + squiggle(R, x + 72, cy + 12, w * 0.45) + squiggle(R, x + 72, cy + 32, w * 0.3); cy += 58; }
    else { s += rect(x + 20, cy, w - 40, 46, accent, { r: 22, op: 0.35 }) + hrect(R, x + 20, cy, w - 40, 46, GRAPHITE, 2.5, 22) + squiggle(R, x + w / 2 - 40, cy + 23, 80); cy += 66; }
  }
  return s + [0, 1, 2, 3].map((k) => hcircle(R, x + 40 + k * ((w - 80) / 3), y + h - 30, 9, GRAPHITE, 2)).join('');
}
const FLOWS = ['Onboarding flow', 'Checkout flow', 'Booking flow', 'Sign-up flow', 'Order tracking', 'Profile & settings', 'Search & filters', 'Course player'];
function wireframes(c, R, i, W, H) {
  return sheet(c, R, W, H, i % 3 === 2 ? 'blue' : 'white', i % 2 === 0, (w, h) => {
    const acc = MARKERS[i % MARKERS.length];
    let s = hand(70, 100, `${FLOWS[i % FLOWS.length]} — v${1 + (i % 4)}`, 46) + hand(w - 70, 96, DATES(i + 3), 30, { anchor: 'end', op: 0.7 });
    const layout = Math.floor(i / 2) % 3;
    let lines = '';
    if (layout === 0) {
      const sw = 300, sh = 600, gap = (w - 3 * sw) / 4;
      lines += [0, 1, 2].map((k) => screen(R, gap + k * (sw + gap), 200, sw, sh, (k + i) % 3, acc) + hand(gap + k * (sw + gap) + sw / 2, 850, ['01 home', '02 detail', '03 confirm'][k], 30, { anchor: 'middle' })).join('')
        + arrow(R, gap + sw + 10, 420, gap * 2 + sw - 10, 440) + arrow(R, gap * 2 + sw * 2 + 10, 520, gap * 3 + sw * 2 - 10, 500);
      s += sticky(R, w - 300, 640, 220, ['bigger CTA?', 'test w/ users'], '#FFE873') + hcircle(R, gap + sw + gap + sw / 2, 760, 120, '#E63946', 3);
    } else if (layout === 1) {
      lines += hrect(R, 80, 180, 900, 700, GRAPHITE, 3, 14) + hline(R, 80, 230, 980, 230) + [0, 1, 2].map((k) => hcircle(R, 110 + k * 26, 205, 7, GRAPHITE, 2)).join('')
        + squiggle(R, 120, 280, 120, GRAPHITE, 3) + [0, 1, 2, 3].map((k) => squiggle(R, 560 + k * 100, 280, 60)).join('')
        + hrect(R, 120, 330, 380, 260) + squiggle(R, 140, 380, 300, GRAPHITE, 4) + squiggle(R, 140, 420, 240, GRAPHITE, 4) + squiggle(R, 140, 470, 300) + squiggle(R, 140, 495, 260)
        + rect(140, 530, 150, 44, acc, { r: 20, op: 0.35 }) + hrect(R, 140, 530, 150, 44, GRAPHITE, 2.5, 20)
        + hrect(R, 540, 330, 400, 260) + hline(R, 540, 330, 940, 590, GRAPHITE, 1.2) + hline(R, 940, 330, 540, 590, GRAPHITE, 1.2)
        + [0, 1, 2].map((k) => hrect(R, 120 + k * 280, 630, 250, 210) + hcircle(R, 160 + k * 280, 680, 22) + squiggle(R, 140 + k * 280, 740, 180) + squiggle(R, 140 + k * 280, 770, 140)).join('');
      s += sticky(R, 1040, 200, 260, ['hero image', 'full width?'], '#FFE873') + sticky(R, 1060, 520, 240, ['3 features', 'max!'], '#FFB3C7')
        + arrow(R, 1040, 330, 960, 420, '#E63946', 3);
    } else {
      const sw = 230, sh = 380;
      lines += Array.from({ length: 8 }, (_, k) => { const x = 80 + (k % 4) * (sw + 80), y = 170 + Math.floor(k / 4) * (sh + 70); return screen(R, x, y, sw, sh, (k + i) % 3, acc) + hand(x - 10, y + 20, String(k + 1), 30, { anchor: 'end', fill: '#E63946' }); }).join('');
      s += hand(w - 70, h - 50, 'crazy 8s · 8 min', 30, { anchor: 'end', fill: '#E63946' });
    }
    return s + g(lines, { f: 'wob' });
  });
}

// ======================= 3. MOODBOARDS =======================
const MOOD_WORDS = ['calm', 'earthy', 'bold', 'warm light', 'linen', 'playful', 'honest', 'quiet luxury', 'monsoon', 'handmade', 'clean', 'nostalgic', 'sunlit', 'grounded'];
const MOOD_PALS = [['#C9A27E', '#6B705C', '#F2E8DC', '#A3B18A', '#3A2E26'], ['#E07A5F', '#3D405B', '#81B29A', '#F2CC8F', '#F4F1DE'], ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51'],
  ['#D8A7B1', '#B6E2D3', '#FAE8E0', '#EF7C8E', '#5C4B51'], ['#1D3557', '#457B9D', '#A8DADC', '#F1FAEE', '#E63946'], ['#606C38', '#283618', '#FEFAE0', '#DDA15E', '#BC6C25']];
const fabric = (c, col, kind) => (kind === 0 ? c.pattern(24, 24, rect(0, 0, 24, 24, col) + rect(0, 0, 12, 24, mix(col, '#FFFFFF', 0.25)))
  : kind === 1 ? c.pattern(30, 30, rect(0, 0, 30, 30, col) + rect(0, 0, 30, 10, mix(col, '#000000', 0.15), { op: 0.6 }) + rect(0, 0, 10, 30, mix(col, '#000000', 0.15), { op: 0.6 }))
    : c.pattern(22, 22, rect(0, 0, 22, 22, col) + circ(11, 11, 4, mix(col, '#FFFFFF', 0.45))));
function moodboards(c, R, i, W, H) {
  const pal = MOOD_PALS[i % MOOD_PALS.length];
  const bgKind = i % 3;
  const name = coined(i + 210);
  let s = bgKind === 0 ? rect(0, 0, W, H, '#C8A27A') + rect(0, 0, W, H, c.pattern(14, 14, circ(4, 5, 1.6, '#8C6440') + circ(10, 11, 1.2, '#E2C29C'))) + rect(0, 0, W, H, '#000000', { f: 'grain', op: 0.25 })
    : bgKind === 1 ? paperFill(c, W, H, 'white') : rect(0, 0, W, H, '#B9B7B2') + rect(0, 0, W, H, '#000000', { f: 'grain', op: 0.3 });
  const pin = (x, y) => circ(x + 3, y + 5, 10, '#000000', { op: 0.25, f: 'bl4' }) + circ(x, y, 10, pick(R, ['#E63946', '#1D3557', '#F4A261', '#2A9D8F'])) + circ(x - 3, y - 3, 3, '#FFFFFF', { op: 0.7 });
  const objs = [SKETCH_OBJ[(i * 3) % SKETCH_OBJ.length], SKETCH_OBJ[(i * 5 + 7) % SKETCH_OBJ.length], SKETCH_OBJ[(i * 7 + 11) % SKETCH_OBJ.length]];
  const pol = (x, y, ww, k, rot) => {
    const bg = pal[(k + 1) % pal.length], ph = ww * 0.86;
    return g(rect(8, 14, ww, ww * 1.18, '#000000', { op: 0.25, f: 'bl4' }) + rect(0, 0, ww, ww * 1.18, '#FBFAF6') + rect(ww * 0.07, ww * 0.07, ww * 0.86, ph, bg)
      + ell(ww / 2, ww * 0.07 + ph / 2, ww * 0.4, ph * 0.4, mix(bg, '#FFFFFF', 0.25), { op: 0.6 }) + art(c, objs[k % 3], artColors({ accent: pal[(k + 3) % pal.length], accent2: pal[(k + 2) % pal.length], ink: '#222', bg }, 'gold'), ww / 2, ww * 0.07 + ph / 2, ph * 0.7)
      + rect(0, 0, ww, ww * 1.18, '#FFFFFF', { f: 'grain', op: 0.12 }) + hand(ww / 2, ww * 1.1, MOOD_WORDS[(i + k) % MOOD_WORDS.length], 26, { anchor: 'middle' }), { t: `translate(${x} ${y}) rotate(${rot})` });
  };
  s += pol(90, 150, 360, 0, jit(R, 6)) + pin(270, 160) + pol(560, 90, 300, 1, jit(R, 6)) + tape(710, 100, 140, jit(R, 10)) + pol(1150, 470, 330, 2, jit(R, 6)) + pin(1315, 480);
  s += g(rect(8, 12, 360, 150, '#000000', { op: 0.2, f: 'bl4' }) + pal.map((col, k) => rect(k * 72, 0, 72, 150, col)).join('') + rect(0, 0, 360, 150, '#FFFFFF', { f: 'grain', op: 0.12 }), { t: `translate(940 140) rotate(${jit(R, 4)})` }) + tape(1120, 140, 120, jit(R, 8));
  s += [0, 1].map((k) => g(rect(0, 0, 220, 220, fabric(c, pal[(k * 2 + i) % pal.length], (i + k) % 3), { f: 'torn' }) + rect(0, 0, 220, 220, '#000000', { f: 'grain', op: 0.15 }), { t: `translate(${120 + k * 250} ${720 + k * 40}) rotate(${jit(R, 10)})` })).join('');
  s += g(rect(8, 12, 300, 300, '#000000', { op: 0.2, f: 'bl4' }) + rect(0, 0, 300, 300, '#FBFAF6') + txt(150, 200, 'Aa', { font: pick(R, ['didot', 'garamond', 'futura', 'palatino']), size: 170, fill: pal[4] === '#F4F1DE' ? pal[1] : pal[4], anchor: 'middle' }) + hand(150, 270, 'headline type', 22, { anchor: 'middle', op: 0.7 }), { t: `translate(640 520) rotate(${jit(R, 5)})` }) + pin(790, 530);
  s += [0, 1, 2].map((k) => { const word = MOOD_WORDS[(i * 3 + k) % MOOD_WORDS.length]; const ww = textWidth(word, 30, 'mono', true) + 40;
    return g(rect(0, 0, ww, 50, '#1A1A1A', { r: 4 }) + txt(20, 35, word, { font: 'mono', weight: 700, size: 30, fill: '#FFFFFF', upper: true, ls: 2 }), { t: `translate(${1000 + jit(R, 60)} ${800 + k * 72}) rotate(${jit(R, 4)})` }); }).join('');
  s += g(rect(0, 0, 420, 110, '#FBFAF6') + hand(24, 70, `Moodboard — ${name}`, 40), { t: `translate(560 1040) rotate(${jit(R, 3)})` }) + tape(560, 1050, 100, -30) + tape(980, 1050, 100, 30);
  return s;
}

// ======================= 4. HAND LETTERING =======================
const PHRASES = ['Chai first', 'Stay curious', 'Made with love', 'Kuch bhi ho sakta hai', 'Good things take time', 'Dream big', 'Hello sunshine', 'Keep it simple', 'Apna time aayega', 'Create daily',
  'Less but better', 'Be kind', 'Do more of what you love', 'Slow mornings', 'Jugaad works', 'One step at a time', 'Ghar ka khana', 'Hustle quietly', 'Choose joy', 'Bas kar pagle',
  'Sapne bade rakho', 'Coffee & ideas', 'Trust the process', 'Mehnat rang laayegi', 'Think in pencil', 'Not perfect, just honest', 'Sunday vibes', 'Ek cutting chai', 'Keep going', 'Design is thinking',
  'Ghoomte raho', 'Hello monsoon', 'Make it happen', 'Stay weird', 'Dil se banaya', 'Pause. Breathe.', 'Yaari dosti', 'Draw every day', 'Small wins', 'Home is a feeling',
  'Shubh aarambh', 'Ideas need air', 'Curiosity first', 'Write it down', 'Thoda aur', 'Kindness is cool', 'Learn by doing', 'Paint the sky', 'Chalo, shuru karein', 'Bloom where planted'];
function lettering(c, R, i, W, H) {
  const ink = ['#1F2A44', '#2B2B2B', '#7F1D1D', '#14532D', '#3B1E54'][i % 5];
  const acc = MARKERS[(i * 3) % MARKERS.length];
  const phrase = PHRASES[i % PHRASES.length];
  return sheet(c, R, W, H, i % 4 === 3 ? 'kraft' : 'cream', i % 3 === 1, (w, h) => {
    let s = Array.from({ length: 9 }, (_, k) => line(80, 260 + k * 80, w - 80, 260 + k * 80, '#7FA7D9', 1, { op: 0.35 })).join('');
    const words = phrase.split(' ');
    const half = Math.ceil(words.length / 2);
    const l1 = words.slice(0, half).join(' '), l2 = words.slice(half).join(' ');
    const f1 = fit(l1, 'hand', w - 260, 220, 1, { minSize: 80 });
    const draft = i % 2 === 0;
    const block = (dx, dy, sc, col, op) => g(txt(w / 2, 470, l1, { font: 'hand', weight: 700, size: f1.size, fill: col, anchor: 'middle' })
      + (l2 ? txt(w / 2, 470 + f1.size * 0.95, l2, { font: i % 3 === 0 ? 'didot' : 'hand', weight: 700, size: Math.min(f1.size * 0.8, fit(l2, 'didot', w - 300, 200, 1, { minSize: 60 }).size), fill: col, anchor: 'middle', italic: i % 3 === 0 }) : ''),
    { t: `translate(${dx} ${dy}) scale(${sc})`, op });
    if (draft) s += block(-6, 6, 1, GRAPHITE, 0.25);
    s += path(`M${w / 2 - 340} ${520 + (l2 ? f1.size : 0)}C${w / 2 - 100} ${560 + (l2 ? f1.size : 0)} ${w / 2 + 120} ${480 + (l2 ? f1.size : 0)} ${w / 2 + 360} ${530 + (l2 ? f1.size : 0)}`, 'none', { stroke: acc, sw: 26, cap: 'round', op: 0.7, f: 'wob' });
    s += g(block(0, 0, 1, ink, 1), { f: 'wob' });
    const doodles = ['star', 'leaf', 'heart', 'sun', 'flower', 'spark'];
    s += [[180, 230], [w - 200, 250], [200, h - 200], [w - 220, h - 210]].map(([x, y], k) => g(path(DOODLE[doodles[(i + k) % doodles.length]], 'none', { stroke: k % 2 ? acc : ink, sw: 2.2, cap: 'round', join: 'round' }), { t: `translate(${x - 48} ${y - 48}) scale(4) rotate(${jit(R, 15)} 12 12)` })).join('');
    s += path(`M${w / 2 - 420} 290q60 -60 120 0t120 0`, 'none', { stroke: ink, sw: 3, cap: 'round', f: 'wob' }) + path(`M${w / 2 + 180} 290q60 -60 120 0t120 0`, 'none', { stroke: ink, sw: 3, cap: 'round', f: 'wob' });
    s += hand(w - 90, h - 60, `lettering #${i + 1} · ${DATES(i)}`, 26, { anchor: 'end', op: 0.6 }) + (draft ? hand(90, h - 60, 'pencil draft → ink', 26, { op: 0.6 }) : '');
    return s;
  });
}

// ======================= 5. PROCESS BOARDS =======================
const INSIGHTS = [['users skip', 'onboarding'], ['price feels', 'unclear'], ['mobile', 'first!'], ['trust', 'issues'], ['too many', 'steps'], ['love the', 'colours'], ['needs', 'reviews'], ['make it', 'faster']];
function process(c, R, i, W, H) {
  return sheet(c, R, W, H, i % 2 ? 'white' : 'cream', i % 3 === 0, (w, h) => {
    const obj = SKETCH_OBJ[(i * 3 + 1) % SKETCH_OBJ.length], pal = MOOD_PALS[i % MOOD_PALS.length];
    const colW = (w - 160) / 3;
    let s = hand(70, 96, `Case study — ${coined(i + 260)} ${objName(obj)}`, 46) + hline(R, 70, 116, 700, 118, GRAPHITE, 2);
    s += ['01 research', '02 sketches', '03 final'].map((t, k) => hand(80 + k * (colW + 0) + 20, 190, t, 36, { fill: k === 2 ? '#E63946' : GRAPHITE }) + hline(R, 80 + k * colW + 20, 205, 80 + k * colW + 260, 207, GRAPHITE, 1.5)).join('');
    s += [0, 1, 2, 3].map((k) => sticky(R, 100 + (k % 2) * 200, 250 + Math.floor(k / 2) * 230, 180, INSIGHTS[(i + k) % INSIGHTS.length], ['#FFE873', '#FFB3C7', '#B5EAD7', '#C7CEEA'][k])).join('');
    s += g(hrect(R, 110, 740, 340, 200, GRAPHITE, 2) + hcircle(R, 170, 800, 36) + hcircle(R, 158, 792, 4) + hcircle(R, 182, 792, 4) + path('M155 815q15 12 30 0', 'none', { stroke: GRAPHITE, sw: 2 })
      + hand(230, 790, 'Priya, 28', 26) + squiggle(R, 230, 830, 180) + squiggle(R, 140, 880, 280) + squiggle(R, 140, 910, 220), { f: 'wob' });
    const sx = 80 + colW;
    s += marker(R, sx + colW / 2, 420, 150, 110, pal[0]) + pen(c, obj, sx + colW / 2, 420, 320, pal[0]) + pen(c, obj, sx + colW / 2 - 80, 760, 200, pal[1]) + pen(c, SKETCH_OBJ[(i * 3 + 9) % SKETCH_OBJ.length], sx + colW / 2 + 100, 770, 190, pal[2])
      + hcircle(R, sx + colW / 2, 420, 190, '#E63946', 2.5) + hand(sx + colW / 2 + 120, 640, '✓ go with this', 26, { fill: '#E63946' });
    const fx = 80 + colW * 2 + 30, fw = colW - 60;
    s += rect(fx + 10, 270, fw, 520, '#000000', { op: 0.18, f: 'bl4' }) + rect(fx, 260, fw, 520, pal[2], { r: 18 }) + ell(fx + fw / 2, 470, fw * 0.4, 180, mix(pal[2], '#FFFFFF', 0.35), { op: 0.7 })
      + art(c, obj, artColors({ accent: pal[0], accent2: pal[3], ink: '#222', bg: pal[2] }, 'gold'), fx + fw / 2, 480, fw * 0.75)
      + txt(fx + 30, 740, coined(i + 260), { font: 'didot', size: 40, fill: onColor(pal[2]) === '#FFFFFF' ? '#FFFFFF' : '#1A1A1A' }) + tape(fx + fw / 2, 262, 130, jit(R, 6))
      + pal.slice(0, 4).map((col, k) => circ(fx + 30 + k * 60, 850, 22, col, { stroke: GRAPHITE, sw: 1.5 })).join('') + hand(fx, 920, 'final palette + render', 26, { op: 0.75 });
    s += g(arrow(R, 80 + colW - 40, 470, sx + 40, 440) + arrow(R, sx + colW - 30, 480, fx - 10, 470), { f: 'wob' });
    return s;
  });
}

// ======================= 6. DOODLES =======================
const DOODLE = {
  star: 'M12 2l3 6.5 7 1-5 5 1.2 7L12 18l-6.2 3.5L7 14.5l-5-5 7-1z', heart: 'M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11z',
  cloud: 'M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 18z', sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z', cup: 'M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 10h2a2.5 2.5 0 0 1 0 5h-2M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3',
  leaf: 'M5 19C5 9 11 4 20 4c0 9-5 15-15 15zM5 19l8-8', arrow: 'M4 12h15M14 6l6 6-6 6', spiral: 'M12 12a1 1 0 0 1 1 1a2 2 0 0 1-2 2a3 3 0 0 1-3-3a4 4 0 0 1 4-4a5 5 0 0 1 5 5a6 6 0 0 1-6 6a7 7 0 0 1-7-7',
  flower: 'M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM12 9.5C9 3 15 3 12 9.5M14.5 12c6.5-3 6.5 3 0 0M12 14.5c3 6.5-3 6.5 0 0M9.5 12c-6.5 3-6.5-3 0 0',
  rocket: 'M12 2c4 3 5 8 3 13H9C7 10 8 5 12 2zM9 15l-3 3 1-5M15 15l3 3-1-5M10.5 19l1.5 3 1.5-3M12 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z', note: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM20 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', moon: 'M20 14A8 8 0 1 1 10 4a6.5 6.5 0 0 0 10 10z', bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
  house: 'M3 11l9-8 9 8M5 9.5V21h14V9.5M10 21v-6h4v6', smile: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01', chat: 'M4 5h16v11H9l-5 4z',
  pencil: 'M4 20l1-5L16 4l4 4L9 19zM14 6l4 4', plant: 'M12 21v-9M12 12C12 7 8 5 4 5c0 5 3 7 8 7zM12 14c0-4 3-6 7-6 0 4-3 6-7 6zM8 21h8', camera: 'M3 8h4l2-3h6l2 3h4v12H3zM12 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  mountain: 'M2 20l7-12 4 6 3-4 6 10z', globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18', pulse: 'M3 12h4l2-5 4 10 2-5h6',
  check: 'M4 12l5 5L20 6', mail: 'M3 6h18v12H3zM3 6l9 7 9-7', spark: 'M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3',
  bag: 'M5 8h14l-1 13H6zM9 8a3 3 0 0 1 6 0', clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2', music: 'M8 18a2.5 2.5 0 1 1-2.5-2.5A2.5 2.5 0 0 1 8 18zM8 18V6l10-2v11M18 15a2.5 2.5 0 1 1-2.5-2.5A2.5 2.5 0 0 1 18 15z',
  lock: 'M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3', pin: 'M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12zM12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z', gift: 'M3 9h18v4H3zM5 13h14v8H5zM12 9v12M12 9c-2-4-6-3-5 0M12 9c2-4 6-3 5 0',
};
const DOODLE_KEYS = Object.keys(DOODLE);
function doodles(c, R, i, W, H) {
  const kind = ['white', 'kraft', 'dark', 'cream'][i % 4];
  const dark = kind === 'dark';
  const inkCols = dark ? ['#F4F1EA', '#FFD166', '#7BDFF2'] : ['#1F2A44', '#2B2B2B', '#7F1D1D'];
  return sheet(c, R, W, H, kind, i % 5 === 2, (w, h) => {
    let s = '';
    const cols = 7, rows = 5, cw = (w - 160) / cols, ch = (h - 200) / rows;
    const used = [];
    for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
      if (r === 2 && q >= 2 && q <= 4) continue;
      const key = DOODLE_KEYS[(i * 5 + r * cols + q) % DOODLE_KEYS.length];
      used.push(key);
      const x = 80 + q * cw + cw / 2 + jit(R, 12), y = 140 + r * ch + ch / 2 + jit(R, 12), sc = 3.2 + R() * 1.4, col = inkCols[(r + q + i) % inkCols.length];
      if (R() < 0.35) s += circ(x + jit(R, 10), y + jit(R, 10), 34 + R() * 14, MARKERS[(r * 3 + q + i) % MARKERS.length], { op: dark ? 0.5 : 0.4, f: 'wob' });
      s += g(path(DOODLE[key], 'none', { stroke: col, sw: 1.8, cap: 'round', join: 'round' }), { t: `translate(${x - 12 * sc} ${y - 12 * sc}) scale(${sc}) rotate(${jit(R, 14)} 12 12)` });
    }
    s = g(s, { f: 'wob' });
    s += txt(w / 2, 140 + 2 * ch + ch / 2 + 10, `doodle day #${i + 1}`, { font: 'marker', size: 68, fill: dark ? '#FFFFFF' : '#1A1A1A', anchor: 'middle' })
      + hand(w / 2, 140 + 2 * ch + ch / 2 + 62, `${used.length} tiny drawings · ${DATES(i)}`, 26, { anchor: 'middle', fill: dark ? '#DDDDDD' : GRAPHITE, op: 0.75 });
    return s;
  });
}

// ======================= 7. PAPER COLLAGE =======================
const COLLAGE_PALS = [['#F4EDE1', '#E76F51', '#F4A261', '#2A9D8F', '#264653'], ['#FAF3E3', '#D62828', '#F77F00', '#FCBF49', '#003049'], ['#EFE9F4', '#5E548E', '#9F86C0', '#E0B1CB', '#231942'],
  ['#F1F7ED', '#7CA982', '#243E36', '#E0EEC6', '#C2A83E'], ['#FFF4E6', '#FF6F59', '#254441', '#43AA8B', '#B2B09B'], ['#F6F1EB', '#C8553D', '#588B8B', '#F2D0A4', '#2D3047']];
const torn = (shape, col) => g(g(shape, { t: 'translate(6 10)', op: 0.28 }).replace(/fill="[^"]+"/g, 'fill="#000"'), { f: 'bl4' }) + g(shape.replace(/fill="[^"]+"/, `fill="${col}"`), { f: 'torn' });
function collage(c, R, i, W, H) {
  const [bg, a, b, d, e] = COLLAGE_PALS[i % COLLAGE_PALS.length];
  const v = Math.floor(i / 6) % 3;
  let s = paperFill(c, W, H, 'cream').replace(PAPERS.cream, bg);
  if (v === 0) {
    s += torn(circ(1080, 330, 170, '#000'), b) + torn(path('M0 760Q300 520 620 700T1300 640T1600 700V1200H0Z', '#000'), d) + torn(path('M0 880Q400 720 800 860T1600 820V1200H0Z', '#000'), e)
      + torn(path('M0 1000Q300 930 700 1010T1600 980V1200H0Z', '#000'), a) + Array.from({ length: 3 }, (_, k) => torn(path(`M${300 + k * 90} ${300 + k * 30}q20 -14 40 0q20 -14 40 0`, '#000'), '#1A1A1A')).join('');
  } else if (v === 1) {
    s += torn(rect(200, 180, 520, 700, '#000'), a) + torn(circ(980, 520, 300, '#000'), b) + torn(poly([[620, 1040], [1000, 420], [1380, 1040]], '#000'), d) + torn(rect(1040, 160, 300, 160, '#000'), e)
      + Array.from({ length: 6 }, (_, k) => line(260, 950 + k * 24, 700, 950 + k * 24, e, 6, { op: 0.8 })).join('');
  } else {
    const word = ['DREAM', 'HELLO', 'CREATE', 'NAMASTE', 'PLAY', 'BHAI'][i % 6];
    const cw = Math.min(220, 1300 / word.length);
    s += word.split('').map((ch, k) => { const x = 150 + k * cw + jit(R, 10), y = 380 + jit(R, 40), col = [a, b, d, e, '#FFFFFF'][(k + i) % 5], font = pick(R, ['didot', 'impact', 'futura', 'helvetica', 'palatino', 'mono']);
      return g(rect(6, 10, cw - 14, 300, '#000000', { op: 0.25, f: 'bl4' }) + g(rect(0, 0, cw - 14, 300, col), { f: 'torn' }) + txt((cw - 14) / 2, 220, ch, { font, weight: 800, size: 200, fill: col === '#FFFFFF' || onColor(col) === '#14141A' ? '#1A1A1A' : '#FFFFFF', anchor: 'middle' }), { t: `translate(${x} ${y}) rotate(${jit(R, 7)})` }); }).join('')
      + torn(rect(-20, 900, 1640, 120, '#000'), a) + tape(300, 370, 120, -12) + tape(1300, 380, 120, 10);
  }
  return s + rect(0, 0, W, H, '#000000', { f: 'grain', op: 0.18 }) + g(rect(0, 0, 340, 70, '#FBFAF6') + hand(20, 48, `collage no. ${i + 1}`, 32), { t: `translate(${W - 420} ${H - 120}) rotate(-2)` });
}

// ======================= 8. TYPE STUDIES =======================
const TYPE_FACES = ['didot', 'garamond', 'palatino', 'helvetica', 'futura', 'avenir', 'impact', 'mono', 'rounded'];
function typestudy(c, R, i, W, H) {
  const font = TYPE_FACES[i % TYPE_FACES.length], acc = MARKERS[(i * 3) % MARKERS.length];
  const pair = ['Ag', 'Rg', 'Qa', 'Gy', 'Ry', 'Ef'][Math.floor(i / 9) % 6];
  const fname = font[0].toUpperCase() + font.slice(1);
  return sheet(c, R, W, H, i % 2 ? 'blue' : 'white', i % 3 === 2, (w, h) => {
    const base = 700, size = 520, cap = base - size * 0.72, xh = base - size * 0.5, desc = base + size * 0.22;
    let s = txt(380, base, pair, { font, weight: font === 'impact' ? 400 : 700, size, fill: '#1A1A1A', anchor: 'middle' });
    s += g([[cap, 'cap height'], [xh, 'x-height'], [base, 'baseline'], [desc, 'descender']].map(([y, l], k) => line(60, y, 720, y, k === 2 ? acc : '#3A86FF', k === 2 ? 2.5 : 1.5, { dash: k === 2 ? '' : '8 6' }) + hand(730, y + 8, l, 24, { fill: k === 2 ? acc : '#3A86FF' })).join('')
      + arrow(R, 940, cap, 940, base, GRAPHITE, 2) + hand(960, (cap + base) / 2, `${Math.round(size * 0.72)} u`, 24), { f: 'wob' });
    s += hand(80, 100, `Type study — ${fname}`, 46) + hline(R, 80, 120, 560, 122, GRAPHITE, 2);
    const rows = ['ABCDEFGHIJKLM', 'NOPQRSTUVWXYZ', 'abcdefghijklm', 'nopqrstuvwxyz', '0123456789 &?!₹'];
    s += rows.map((r, k) => txt(1040, 220 + k * 64, r, { font, weight: font === 'impact' ? 400 : 500, size: 40, fill: '#1A1A1A', ls: 2 })).join('');
    s += [48, 36, 24, 16].map((sz, k) => txt(1040, 600 + k * 70, 'Quick brown fox', { font, weight: font === 'impact' ? 400 : 600, size: Math.min(sz, fit('Quick brown fox', font, w - 1140, sz, 1, { minSize: 10 }).size), fill: '#1A1A1A' }) + hand(w - 50, 600 + k * 70, `${sz}`, 22, { anchor: 'end', op: 0.6 })).join('');
    s += hcircle(R, 380 + size * 0.18, base + size * 0.08, 90, '#E63946', 3) + hand(380 + size * 0.18 + 100, base + size * 0.24, NOTES[(i + 9) % NOTES.length], 28, { fill: '#E63946' });
    return s;
  });
}

// ======================= 9. COLOUR STUDIES =======================
const hsl = (h, s, l) => {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
  return '#' + [f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
};
const SCHEMES = [['analogous', [0, 25, 50, -25]], ['complementary', [0, 180, 15, 195]], ['triadic', [0, 120, 240, 20]], ['split', [0, 150, 210, 10]], ['monochrome', [0, 0, 0, 0]]];
function colorstudy(c, R, i, W, H) {
  const hue = (i * 37) % 360, [sname, offs] = SCHEMES[i % SCHEMES.length];
  const cols = offs.map((o, k) => hsl(hue + o, sname === 'monochrome' ? 55 : 55 + k * 8, sname === 'monochrome' ? 25 + k * 17 : 42 + (k % 2) * 16)).concat([hsl(hue, 20, 92)]);
  return sheet(c, R, W, H, i % 3 === 1 ? 'white' : 'cream', i % 2 === 1, (w, h) => {
    let s = hand(80, 100, `Palette exploration #${String(i + 1).padStart(2, '0')}`, 46) + hand(w - 80, 100, sname, 34, { anchor: 'end', fill: '#E63946' });
    s += cols.map((col, k) => { const x = 90 + k * 205, y = 190;
      return g(rect(0, 0, 180, 300, col, { op: 0.92 }) + rect(10, 20, 160, 260, col, { op: 0.35 }), { f: 'torn', t: `translate(${x} ${y})` }) + hand(x + 90, 540, col, 26, { anchor: 'middle' })
        + (k === 3 ? hline(R, x - 10, y + 10, x + 190, y + 290, '#E63946', 4) + hand(x + 90, 580, 'too dark?', 24, { anchor: 'middle', fill: '#E63946' }) : ''); }).join('');
    s += g(Array.from({ length: 12 }, (_, k) => { const a1 = (k / 12) * Math.PI * 2 - Math.PI / 2, a2 = ((k + 1) / 12) * Math.PI * 2 - Math.PI / 2, r1 = 70, r2 = 190, cx = 300, cy = 860;
      const P = (r, a) => `${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`;
      return path(`M${P(r1, a1)}L${P(r2, a1)}A${r2} ${r2} 0 0 1 ${P(r2, a2)}L${P(r1, a2)}A${r1} ${r1} 0 0 0 ${P(r1, a1)}Z`, hsl(hue + k * 30, 65, 55), { op: 0.85, stroke: '#FBFAF6', sw: 3 }); }).join(''), { f: 'wob' })
      + hcircle(R, 300 + Math.cos(-Math.PI / 2) * 130, 860 + Math.sin(-Math.PI / 2) * 130, 34, GRAPHITE, 3);
    s += rect(620, 700, 820, 90, c.lg([[0, cols[0]], [0.5, cols[1]], [1, cols[2]]], 0, 0, 1, 0), { f: 'torn' }) + hand(620, 840, 'gradient test', 26, { op: 0.7 });
    s += [0, 1, 2].map((k) => rect(620 + k * 280, 880, 250, 160, cols[k], { r: 6 }) + txt(640 + k * 280, 950, 'Aa', { font: 'didot', size: 60, fill: cols[(k + 3) % 4] === cols[k] ? '#FFFFFF' : cols[(k + 2) % 5] }) + hand(640 + k * 280, 1020, 'contrast ok', 20, { fill: onColor(cols[k]) === '#FFFFFF' ? '#FFFFFF' : GRAPHITE })).join('');
    return s;
  });
}

// ======================= 10. ICON SETS =======================
function icons(c, R, i, W, H) {
  const dark = i % 4 === 3;
  const bg = dark ? '#16161A' : ['#FFFFFF', '#F6F4EF', '#F2F5FA'][i % 3], ink = dark ? '#F4F4F4' : '#1A1A1A';
  const acc = MARKERS[(i * 5) % MARKERS.length], duo = i % 2 === 1, sw = [1.5, 2, 2.5][i % 3];
  const set = Array.from({ length: 20 }, (_, k) => DOODLE_KEYS[(i * 3 + k * 7) % DOODLE_KEYS.length]).filter((v, k, a) => a.indexOf(v) === k).slice(0, 16);
  let s = rect(0, 0, W, H, bg) + rect(0, 0, W, H, c.pattern(40, 40, line(0, 0, 40, 0, ink, 1, { op: 0.05 }) + line(0, 0, 0, 40, ink, 1, { op: 0.05 })));
  const icon = (key, x, y, size) => g((duo ? path(DOODLE[key], acc, { op: 0.35 }) : '') + path(DOODLE[key], 'none', { stroke: ink, sw, cap: 'round', join: 'round' }), { t: `translate(${x} ${y}) scale(${size / 24})` });
  const big = set[0], bx = 120, by = 220, bs = 520;
  s += rect(bx, by, bs, bs, dark ? '#202026' : '#FFFFFF', { stroke: mix(ink, bg, 0.85), sw: 1 })
    + Array.from({ length: 25 }, (_, k) => line(bx + (k * bs) / 24, by, bx + (k * bs) / 24, by + bs, acc, 1, { op: k % 4 ? 0.12 : 0.3 }) + line(bx, by + (k * bs) / 24, bx + bs, by + (k * bs) / 24, acc, 1, { op: k % 4 ? 0.12 : 0.3 })).join('')
    + circ(bx + bs / 2, by + bs / 2, bs * 0.42, 'none', { stroke: acc, sw: 1.5, op: 0.6 }) + rect(bx + bs * 0.12, by + bs * 0.12, bs * 0.76, bs * 0.76, 'none', { stroke: acc, sw: 1.5, op: 0.6 })
    + g(path(DOODLE[big], 'none', { stroke: ink, sw: sw * 0.9, cap: 'round', join: 'round' }), { t: `translate(${bx} ${by}) scale(${bs / 24})` })
    + hand(bx, by + bs + 50, `${big} · ${sw}px stroke · 24px grid`, 26, { fill: ink, op: 0.75 });
  s += set.slice(1, 16).map((key, k) => { const x = 760 + (k % 5) * 160, y = 220 + Math.floor(k / 5) * 190;
    return rect(x, y, 130, 130, dark ? '#202026' : '#FFFFFF', { r: 18, stroke: mix(ink, bg, 0.88), sw: 1 }) + icon(key, x + 33, y + 33, 64) + txt(x + 65, y + 160, key, { font: 'mono', size: 15, fill: ink, anchor: 'middle', op: 0.6 }); }).join('');
  s += txt(120, 130, `${coined(i + 300)} Icons`, { font: 'helvetica', weight: 800, size: 54, fill: ink, ls: -1 }) + hand(122, 175, `set ${String(i + 1).padStart(2, '0')} · ${duo ? 'duotone' : 'outline'} · rounded caps`, 26, { fill: ink, op: 0.7 })
    + hand(760, 900, NOTES[(i + 4) % NOTES.length], 28, { fill: '#E63946' }) + arrow(R, 900, 880, 980, 820, '#E63946', 2.5);
  return s;
}

export const HANDMADE = { sketchbook, wireframes, moodboards, lettering, process, doodles, collage, typestudy, colorstudy, icons };
