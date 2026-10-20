// Rendered-style scenes (no device frames): machinery, real estate, studio products, fashion, shoes and interiors.
// Each draw(c, R, i, W, H) gets the canvas, a seeded random function and the index inside its category (0–99).
import { art } from './art';
import { circ, ell, g, line, mix, onColor, path, poly, rect, txt } from './core';
import { coined } from './graphics';

const pick = (R, arr) => arr[Math.floor(R() * arr.length)];
const polar = (cx, cy, r, a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
const P = (pts) => pts.map((p) => p.map((n) => Math.round(n * 10) / 10).join(' ')).join('L');
const shadow = (cx, cy, rx, ry, op = 0.35) => ell(cx, cy, rx, ry, '#000000', { op, f: 'bl' });
const metal = (c, col) => c.lg([[0, mix(col, '#FFFFFF', 0.4)], [0.45, col], [1, mix(col, '#000000', 0.38)]], 0, 0, 1, 1);
const STEEL = (c) => c.lg([[0, '#F4F6F8'], [0.5, '#A9B1BC'], [1, '#5E6670']], 0, 0, 1, 1);
const label = (x, y, s, o = {}) => txt(x, y, s, { font: o.font || 'avenir', weight: o.weight || 600, size: o.size || 20, fill: o.fill || '#111', anchor: o.anchor, upper: o.upper, ls: o.ls, op: o.op, italic: o.italic });
const studio = (c, W, H, wall, floorY) => rect(0, 0, W, H, c.lg([[0, mix(wall, '#FFFFFF', 0.25)], [1, mix(wall, '#000000', 0.08)]]))
  + rect(0, floorY, W, H - floorY, c.lg([[0, mix(wall, '#000000', 0.06)], [1, mix(wall, '#000000', 0.18)]])) + rect(0, floorY - 30, W, 60, wall, { f: 'bl', op: 0.8 })
  + ell(W / 2, floorY - 200, W * 0.45, 380, c.rg([[0, '#FFFFFF', 0.35], [1, '#FFFFFF', 0]]));

// ======================= MACHINERY =======================
const MC = ['#F2B705', '#F26B1D', '#2D6CDF', '#D7263D', '#2E8B57', '#0FA3B1', '#3A3F47'];
const SPECS = [
  ['Gear train assembly', ['Hardened steel · 58 HRC', 'Module 4 · 24 / 16 / 12 teeth', 'Efficiency 98.5%']],
  ['RX-20 robotic arm', ['6-axis articulation', 'Payload 20 kg', 'Repeatability ±0.02 mm']],
  ['EX-210 excavator', ['Operating weight 21 t', 'Bucket 1.2 m³', 'Dig depth 6.6 m']],
  ['TF-9 turbofan', ['Thrust 120 kN', 'Bypass ratio 9:1', '22 titanium fan blades']],
  ['VMC-850 CNC centre', ['3-axis · 12,000 rpm', 'Table 1000 × 500 mm', 'Auto tool changer · 24']],
  ['TC-65 tower crane', ['Max load 8 t', 'Jib length 65 m', 'Hook height 52 m']],
];

function gearPath(cx, cy, n, ro, ri, rot = 0) {
  const pts = [];
  const step = (2 * Math.PI) / n;
  for (let k = 0; k < n; k++) {
    const a = rot + k * step;
    pts.push(polar(cx, cy, ri, a), polar(cx, cy, ro, a + step * 0.14), polar(cx, cy, ro, a + step * 0.36), polar(cx, cy, ri, a + step * 0.5));
  }
  return 'M' + P(pts) + 'Z';
}
function gear(c, cx, cy, n, ro, col, rot) {
  const ri = ro * 0.9;
  return path(gearPath(cx + 14, cy + 22, n, ro, ri, rot), '#000000', { op: 0.3, f: 'bl' }) + path(gearPath(cx, cy, n, ro, ri, rot), metal(c, col))
    + circ(cx, cy, ri * 0.8, mix(col, '#000000', 0.22)) + circ(cx, cy, ri * 0.74, metal(c, col))
    + Array.from({ length: 6 }, (_, k) => circ(...polar(cx, cy, ri * 0.48, rot + (k * Math.PI) / 3), ri * 0.13, mix(col, '#000000', 0.55))).join('')
    + circ(cx, cy, ri * 0.26, STEEL(c)) + circ(cx, cy, ri * 0.11, '#1A1C20') + rect(cx - ri * 0.03, cy - ri * 0.17, ri * 0.06, ri * 0.08, '#1A1C20')
    + path(`M${P([polar(cx, cy, ri * 0.7, Math.PI * 1.05)])}A${ri * 0.7} ${ri * 0.7} 0 0 1 ${P([polar(cx, cy, ri * 0.7, Math.PI * 1.45)])}`, 'none', { stroke: '#FFFFFF', sw: ri * 0.03, op: 0.45, cap: 'round' });
}

const MACHINES = [
  (c, col) => ({ svg: gear(c, 640, 640, 24, 300, col, 0.05) + gear(c, 1021, 373, 16, 200, '#A9B1BC', 0.12) + gear(c, 1004, 850, 12, 140, mix(col, '#000000', 0.45), 0.2), pins: [[640, 400], [1100, 300], [1060, 900]] }),
  (c, col) => {
    const arm = (x1, y1, x2, y2, w) => line(x1 + 10, y1 + 16, x2 + 10, y2 + 16, '#000000', w, { op: 0.25, f: 'bl' }) + line(x1, y1, x2, y2, mix(col, '#000000', 0.25), w) + line(x1, y1, x2, y2, col, w * 0.82) + line(x1 - w * 0.18, y1 - w * 0.18, x2 - w * 0.18, y2 - w * 0.18, '#FFFFFF', w * 0.12, { op: 0.35 });
    const joint = (x, y, r) => circ(x, y, r, '#2A2D33') + circ(x, y, r * 0.62, STEEL(c)) + circ(x, y, r * 0.2, '#2A2D33');
    return {
      svg: shadow(700, 960, 300, 40) + ell(700, 930, 230, 56, STEEL(c)) + rect(600, 770, 200, 160, metal(c, col)) + ell(700, 770, 100, 26, mix(col, '#FFFFFF', 0.3)) + ell(700, 930, 100, 26, mix(col, '#000000', 0.3))
        + arm(700, 720, 980, 420, 120) + joint(700, 720, 78) + arm(980, 420, 1190, 580, 86) + joint(980, 420, 64)
        + path('M720 760Q860 520 990 470', 'none', { stroke: '#1A1C20', sw: 8, op: 0.8 }) + joint(1190, 580, 44)
        + rect(1160, 620, 60, 50, '#2A2D33', { r: 8 }) + rect(1150, 668, 22, 90, STEEL(c), { r: 6 }) + rect(1208, 668, 22, 90, STEEL(c), { r: 6 }) + rect(1150, 740, 80, 60, mix(col, '#FFFFFF', 0.2), { r: 6, op: 0.95 }),
      pins: [[700, 720], [980, 420], [1190, 700]],
    };
  },
  (c, col) => {
    const dark = '#26282C';
    return {
      svg: shadow(760, 930, 420, 40) + rect(380, 820, 560, 110, dark, { r: 55 }) + Array.from({ length: 7 }, (_, k) => circ(440 + k * 74, 875, 30, STEEL(c)) + circ(440 + k * 74, 875, 10, dark)).join('')
        + rect(380, 820, 560, 110, 'none', { r: 55, stroke: '#3A3D42', sw: 12, dash: '14 10' })
        + rect(430, 650, 470, 160, metal(c, col), { r: 18 }) + rect(780, 620, 150, 190, mix(col, '#000000', 0.2), { r: 14 }) + rect(470, 470, 190, 190, metal(c, col), { r: 14 })
        + path('M488 490L640 490L640 640L488 640Z', c.lg([[0, '#BFE3FF'], [1, '#2E4A66']], 0, 0, 1, 1)) + line(560, 490, 560, 640, mix(col, '#000000', 0.3), 6) + path('M500 500L540 500L500 560Z', '#FFFFFF', { op: 0.35 })
        + line(700, 640, 1000, 360, mix(col, '#000000', 0.3), 74, { cap: 'round' }) + line(700, 640, 1000, 360, col, 60, { cap: 'round' }) + line(740, 560, 940, 380, STEEL(c), 12)
        + line(1000, 360, 1200, 640, mix(col, '#000000', 0.3), 56, { cap: 'round' }) + line(1000, 360, 1200, 640, col, 44, { cap: 'round' }) + line(1020, 420, 1150, 600, STEEL(c), 10)
        + path('M1150 610Q1270 600 1290 700L1250 760L1150 740Z', '#3A3D42') + Array.from({ length: 4 }, (_, k) => poly([[1160 + k * 26, 740], [1176 + k * 26, 740], [1166 + k * 26, 770]], STEEL(c))).join('')
        + rect(450, 670, 120, 10, '#000000', { op: 0.2 }) + label(800, 760, 'EX-210', { font: 'helvetica', weight: 800, size: 30, fill: onColor(col), anchor: 'middle' }),
      pins: [[560, 560], [1000, 360], [1260, 720]],
    };
  },
  (c, col) => {
    const blades = Array.from({ length: 22 }, (_, k) => {
      const a = (k * 2 * Math.PI) / 22;
      return path(`M${P([polar(800, 600, 95, a)])}Q${P([polar(800, 600, 230, a + 0.28)])} ${P([polar(800, 600, 340, a + 0.14)])}L${P([polar(800, 600, 340, a + 0.27)])}Q${P([polar(800, 600, 230, a + 0.4)])} ${P([polar(800, 600, 95, a + 0.22)])}Z`,
        k % 2 ? c.lg([[0, '#D9DEE5'], [1, '#6B7480']], 0, 0, 1, 1) : c.lg([[0, '#EEF1F5'], [1, '#8A93A0']], 0, 0, 1, 1));
    }).join('');
    return {
      svg: shadow(820, 1020, 380, 40) + circ(800, 600, 410, metal(c, col)) + circ(800, 600, 372, '#16181C') + circ(800, 600, 395, 'none', { stroke: '#FFFFFF', sw: 4, op: 0.3 })
        + blades + circ(800, 600, 110, c.rg([[0, '#4A505A'], [1, '#121418']], 0.4, 0.35, 0.7)) + path('M800 600m-60 0a60 60 0 0 1 60 -60a40 40 0 0 1 40 40', 'none', { stroke: '#FFFFFF', sw: 6, op: 0.8, cap: 'round' })
        + path('M520 300A400 400 0 0 1 900 210', 'none', { stroke: '#FFFFFF', sw: 10, op: 0.35, cap: 'round' }),
      pins: [[800, 230], [560, 760], [800, 600]],
    };
  },
  (c, col, R) => ({
    svg: shadow(800, 940, 470, 34) + rect(370, 300, 860, 620, c.lg([[0, '#F2F4F7'], [1, '#C4CAD3']], 0, 0, 1, 1), { r: 26 }) + rect(370, 300, 860, 60, col, { r: 26 }) + rect(370, 330, 860, 30, col)
      + label(400, 342, 'VMC-850', { font: 'helvetica', weight: 800, size: 26, fill: onColor(col) }) + rect(370, 900, 860, 30, '#2A2D33', { r: 6 })
      + rect(430, 400, 500, 440, '#20242B', { r: 18 }) + rect(446, 416, 468, 408, c.lg([[0, '#3A4250'], [1, '#141820']]), { r: 12 })
      + ell(680, 640, 200, 120, c.rg([[0, '#9AD7FF', 0.35], [1, '#9AD7FF', 0]])) + rect(640, 416, 80, 150, STEEL(c)) + rect(664, 566, 32, 70, '#A9B1BC') + poly([[664, 636], [696, 636], [680, 666]], '#E5E9EE')
      + rect(560, 700, 240, 70, metal(c, '#8C96A3'), { r: 4 }) + Array.from({ length: 14 }, () => circ(680 + (R() - 0.5) * 80, 680 + R() * 20, 2.5, '#FFD27A')).join('')
      + path('M460 430L560 430L460 620Z', '#FFFFFF', { op: 0.08 }) + rect(912, 600, 10, 60, '#5E6670', { r: 5 })
      + rect(970, 400, 220, 440, '#2A2D33', { r: 16 }) + rect(990, 420, 180, 130, c.lg([[0, mix(col, '#FFFFFF', 0.3)], [1, mix(col, '#000000', 0.3)]]), { r: 8 })
      + [0, 1, 2].map((k) => rect(1004, 440 + k * 30, 120 - k * 30, 10, '#FFFFFF', { r: 5, op: 0.7 })).join('')
      + Array.from({ length: 9 }, (_, k) => rect(996 + (k % 3) * 60, 580 + Math.floor(k / 3) * 46, 48, 34, '#3F444C', { r: 6 })).join('')
      + circ(1030, 760, 22, '#E5484D') + circ(1090, 760, 22, '#30A46C') + circ(1150, 760, 26, STEEL(c)),
    pins: [[680, 500], [1080, 470], [800, 330]],
  }),
  (c, col) => {
    const truss = (x1, y1, x2, y2, h, n) => { let s = line(x1, y1, x2, y2, col, 8) + line(x1, y1 + h, x2, y2 + h, col, 8); for (let k = 0; k < n; k++) { const xa = x1 + ((x2 - x1) * k) / n, xb = x1 + ((x2 - x1) * (k + 1)) / n; s += line(xa, y1 + (k % 2 ? h : 0), xb, y1 + (k % 2 ? 0 : h), col, 4); } return s; };
    let mast = line(740, 1000, 740, 260, col, 9) + line(820, 1000, 820, 260, col, 9);
    for (let y = 260; y < 1000; y += 60) mast += line(740, y, 820, y + 60, col, 4) + line(740, y + 60, 820, y + 60, col, 3);
    return {
      svg: mast + truss(780, 240, 1420, 240, 44, 18) + truss(380, 240, 780, 240, 44, 8) + poly([[740, 240], [780, 120], [820, 240]], 'none', { stroke: col, sw: 8 })
        + line(780, 120, 1400, 240, '#2A2D33', 3) + line(780, 120, 400, 240, '#2A2D33', 3)
        + rect(400, 284, 120, 90, '#8A8F98', { r: 6 }) + rect(530, 284, 80, 90, '#9AA0A8', { r: 6 }) + rect(830, 270, 80, 70, '#2A2D33', { r: 8 }) + rect(842, 282, 56, 34, c.lg([[0, '#BFE3FF'], [1, '#4B6A88']]), { r: 4 })
        + rect(1180, 280, 70, 24, '#2A2D33', { r: 4 }) + line(1200, 304, 1200, 640, '#2A2D33', 2) + line(1230, 304, 1230, 640, '#2A2D33', 2)
        + path('M1215 640q0 20 -16 22', 'none', { stroke: '#2A2D33', sw: 6 }) + line(1150, 700, 1215, 662, '#2A2D33', 2) + line(1280, 700, 1215, 662, '#2A2D33', 2) + rect(1100, 700, 230, 60, metal(c, mix(col, '#000000', 0.15)), { r: 4 })
        + [[120, 820, 200, 380], [330, 900, 150, 300], [1300, 860, 160, 340], [1460, 780, 140, 420]].map(([x, y, w, h]) => rect(x, y, w, h, '#000000', { op: 0.18 })).join(''),
      pins: [[1000, 240], [1215, 730], [780, 600]],
    };
  },
];

function machinery(c, R, i, W, H) {
  const subj = i % MACHINES.length, col = MC[(i * 5 + Math.floor(i / 6)) % MC.length], bgk = Math.floor(i / 6) % 4;
  const [name, specs] = SPECS[subj];
  let bg, ink;
  if (bgk === 0) {
    const grid = c.pattern(40, 40, line(0, 0, 40, 0, '#FFFFFF', 1, { op: 0.08 }) + line(0, 0, 0, 40, '#FFFFFF', 1, { op: 0.08 }));
    bg = rect(0, 0, W, H, '#0E3A6B') + rect(0, 0, W, H, grid) + rect(30, 30, W - 60, H - 60, 'none', { stroke: '#FFFFFF', sw: 2, op: 0.4 })
      + rect(W - 430, H - 190, 400, 160, 'none', { stroke: '#FFFFFF', sw: 2, op: 0.5 }) + line(W - 430, H - 130, W - 30, H - 130, '#FFFFFF', 1.5, { op: 0.5 }) + line(W - 230, H - 130, W - 230, H - 30, '#FFFFFF', 1.5, { op: 0.5 })
      + label(W - 410, H - 90, `DWG ${100 + i}-A`, { font: 'mono', size: 18, fill: '#FFFFFF', op: 0.75 }) + label(W - 210, H - 90, 'SCALE 1:20', { font: 'mono', size: 18, fill: '#FFFFFF', op: 0.75 });
    ink = '#FFFFFF';
  } else if (bgk === 1) { bg = studio(c, W, H, '#E4E7EC', 960); ink = '#14161A'; }
  else if (bgk === 2) { bg = rect(0, 0, W, H, '#111317') + ell(800, 560, 640, 440, c.rg([[0, col, 0.28], [1, col, 0]])) + rect(0, 960, W, 240, '#0B0C0F'); ink = '#F2F4F7'; }
  else { bg = rect(0, 0, W, H, c.lg([[0, '#F7E9D7'], [1, '#E2BE98']])) + circ(1300, 260, 160, '#FFF1D6', { op: 0.8 }) + rect(0, 960, W, 240, '#CFA27A'); ink = '#2A1B10'; }
  const m = MACHINES[subj](c, col, R);
  const spots = [[150, 260], [1250, 160], [1250, 900]];
  const callouts = m.pins.map(([px, py], k) => {
    const [lx, ly] = spots[k];
    const ex = lx < 800 ? lx + 260 : lx - 20;
    return circ(px, py, 9, ink, { op: 0.9 }) + circ(px, py, 18, 'none', { stroke: ink, sw: 2, op: 0.5 }) + path(`M${px} ${py}L${ex} ${ly + 14}L${lx < 800 ? lx : lx + 300} ${ly + 14}`, 'none', { stroke: ink, sw: 1.5, op: 0.7 })
      + label(lx < 800 ? lx : lx + 300, ly, specs[k], { size: 22, fill: ink, anchor: lx < 800 ? 'start' : 'end', weight: 600 });
  }).join('');
  return bg + m.svg + callouts + label(70, H - 120, name, { font: 'helvetica', weight: 800, size: 54, fill: ink }) + label(72, H - 76, `Industrial design concept · ${coined(i + 11)} Engineering`, { size: 22, fill: ink, op: 0.7 });
}

// ======================= REAL ESTATE =======================
const SKIES = [
  { top: '#7DB9F2', bot: '#DCEEFF', tint: '#000000', k: 0, lit: false, glass: ['#E3F2FF', '#6E93C2'] },
  { top: '#FF8A5C', bot: '#FFD9A0', tint: '#5A2A1A', k: 0.12, lit: false, glass: ['#FFE2B8', '#C97B4A'] },
  { top: '#2E2459', bot: '#F08C8C', tint: '#2E2459', k: 0.35, lit: true, glass: ['#FFE7A3', '#FFB547'] },
  { top: '#070B1E', bot: '#22305A', tint: '#0B1026', k: 0.6, lit: true, glass: ['#FFE7A3', '#FFA93A'] },
];
const WALLS = ['#F4F1EA', '#E8E2D6', '#DCE3E8', '#F2E6DA', '#E6E9EE'];
const RE_TITLES = [['Luxury Villas', '4 BHK · Private pool', '₹3.4 Cr'], ['Sky Residences', '2 & 3 BHK · 42 floors', '₹1.2 Cr'], ['Garden Townhomes', '3 BHK row houses', '₹1.8 Cr'], ['The Cottage Retreat', 'Weekend homes in the hills', '₹96 L'], ['Business District', 'Grade-A office spaces', '₹28,000/sq ft']];

function tree(x, y, s, col, kind) {
  if (kind) return rect(x - s * 0.06, y - s * 0.3, s * 0.12, s * 0.3, '#5B3A24') + poly([[x, y - s * 1.3], [x + s * 0.4, y - s * 0.25], [x - s * 0.4, y - s * 0.25]], col) + poly([[x, y - s * 1.3], [x + s * 0.4, y - s * 0.25], [x, y - s * 0.25]], '#000000', { op: 0.15 });
  return rect(x - s * 0.06, y - s * 0.5, s * 0.12, s * 0.5, '#5B3A24') + circ(x - s * 0.22, y - s * 0.7, s * 0.32, col) + circ(x + s * 0.22, y - s * 0.72, s * 0.3, mix(col, '#000000', 0.12)) + circ(x, y - s * 0.98, s * 0.34, mix(col, '#FFFFFF', 0.08))
    + circ(x + s * 0.15, y - s * 0.9, s * 0.2, '#000000', { op: 0.08 });
}

function realestate(c, R, i, W, H) {
  const type = i % 5, sky = SKIES[Math.floor(i / 5) % 4], overlay = Math.floor(i / 20) % 5;
  const tint = (col) => mix(col, sky.tint, sky.k);
  const wall = tint(WALLS[(i * 3) % WALLS.length]);
  const glass = sky.lit ? c.lg([[0, sky.glass[0]], [1, sky.glass[1]]]) : c.lg([[0, sky.glass[0]], [1, sky.glass[1]]], 0, 0, 1, 1);
  const win = (x, y, w, h, on = true) => rect(x, y, w, h, on || !sky.lit ? glass : tint('#2B3445')) + (sky.lit && on ? ell(x + w / 2, y + h / 2, w * 0.9, h * 0.9, c.rg([[0, '#FFC864', 0.35], [1, '#FFC864', 0]])) : '');
  const G = 900;
  let s = rect(0, 0, W, H, c.lg([[0, sky.top], [1, sky.bot]]));
  if (sky.k === 0) s += [[300, 200], [1100, 140], [1350, 260]].map(([x, y]) => g(ell(x, y, 120, 34, '#FFFFFF') + ell(x + 60, y - 20, 70, 40, '#FFFFFF') + ell(x - 50, y - 10, 60, 30, '#FFFFFF'), { op: 0.85, f: 'bl4' })).join('');
  if (Math.floor(i / 5) % 4 === 1) s += circ(260, 620, 120, '#FFF3C4', { op: 0.9 }) + circ(260, 620, 260, '#FFD27A', { f: 'bl60', op: 0.6 });
  if (sky.lit) s += Array.from({ length: 90 }, () => circ(R() * W, R() * 500, R() * 1.8 + 0.4, '#FFFFFF', { op: R() * (sky.k > 0.5 ? 0.9 : 0.4) })).join('') + (sky.k > 0.5 ? circ(1300, 180, 50, '#F4F1DE') : '');
  s += path(`M0 ${G - 60}Q400 ${G - 120} 800 ${G - 70}T${W} ${G - 80}L${W} ${G}L0 ${G}Z`, tint('#6F9A6A'), { op: 0.6 });
  s += rect(0, G, W, H - G, c.lg([[0, tint('#6FA35A')], [1, tint('#3E6E35')]]));
  const trees = (list) => list.map(([x, s2, k]) => tree(x, G + 10, s2, tint(k ? '#2F5D3A' : '#4C8A44'), k)).join('');
  if (type === 0) {
    s += shadow(800, G + 10, 520, 26, 0.3) + rect(420, 640, 760, 260, wall) + rect(400, 628, 800, 18, tint('#2C2F36'))
      + rect(640, 448, 560, 192, tint('#9C6B45')) + Array.from({ length: 28 }, (_, k) => line(650 + k * 20, 452, 650 + k * 20, 636, tint('#7A5234'), 3)).join('') + rect(620, 436, 600, 18, tint('#2C2F36'))
      + win(460, 680, 400, 210) + [560, 660, 760].map((x) => line(x, 680, x, 890, tint('#2C2F36'), 4)).join('') + win(900, 480, 270, 140) + line(1035, 480, 1035, 620, tint('#2C2F36'), 4)
      + rect(900, 690, 240, 200, tint('#3A3F47')) + win(920, 710, 90, 180) + rect(1030, 710, 90, 180, tint('#6B4A2E'))
      + poly([[340, 950], [1260, 950], [1320, 1030], [280, 1030]], c.lg([[0, tint('#7FD3F0')], [1, tint('#2E9BC6')]])) + path('M380 980Q520 970 660 985T940 980T1220 985', 'none', { stroke: '#FFFFFF', sw: 3, op: 0.5 })
      + rect(260, 1030, 1080, 14, tint('#E8E2D6')) + trees([[230, 300, 0], [1340, 260, 1], [1440, 330, 0]]);
  } else if (type === 1) {
    s += shadow(840, G + 10, 300, 22, 0.3) + rect(980, 190, 90, 710, tint(mix(WALLS[i % 5], '#000000', 0.25)))
      + rect(620, 160, 360, 740, wall) + Array.from({ length: 12 }, (_, k) => win(640, 180 + k * 58, 320, 40, R() > 0.3) + rect(612, 220 + k * 58, 376, 8, tint('#C9CED6'))).join('')
      + Array.from({ length: 12 }, (_, k) => rect(988, 182 + k * 58, 70, 34, sky.lit && R() > 0.4 ? glass : tint('#5A6575'))).join('')
      + rect(700, 820, 200, 80, glass) + rect(680, 806, 240, 14, tint('#2C2F36')) + trees([[420, 260, 0], [520, 220, 1], [1220, 280, 0], [1330, 230, 1]]);
  } else if (type === 2) {
    const cols = ['#C8553D', '#F2D0A4', '#588B8B', '#FFD5C2', '#93A8AC'];
    s += shadow(800, G + 10, 520, 22, 0.3) + [0, 1, 2].map((k) => {
      const x = 330 + k * 320, colr = tint(cols[(i + k) % cols.length]);
      return rect(x, 600, 300, 300, colr) + poly([[x - 20, 610], [x + 150, 440], [x + 320, 610]], tint('#3A2E2A')) + rect(x + 110, 760, 80, 140, tint('#4A3426'), { r: 4 }) + circ(x + 176, 830, 4, '#D4AF5A')
        + win(x + 30, 650, 70, 80) + win(x + 200, 650, 70, 80) + line(x + 65, 650, x + 65, 730, colr, 4) + line(x + 235, 650, x + 235, 730, colr, 4)
        + win(x + 120, 520, 60, 60) + rect(x + 100, 900, 100, 10, tint('#BDB5A8')) + (k === 1 ? rect(x + 220, 450, 40, 90, tint('#6B4A3A')) : '');
    }).join('') + trees([[220, 280, 0], [1380, 300, 0], [1480, 240, 1]]);
  } else if (type === 3) {
    s += shadow(800, G + 10, 380, 22, 0.3) + rect(980, 480, 60, 150, tint('#7A6A5C')) + circ(1010, 440, 26, '#FFFFFF', { op: 0.3, f: 'bl4' }) + circ(1030, 400, 34, '#FFFFFF', { op: 0.2, f: 'bl4' })
      + rect(500, 620, 600, 280, wall) + poly([[460, 640], [800, 400], [1140, 640]], tint('#5A3A2E')) + poly([[460, 640], [800, 400], [800, 640]], '#000000', { op: 0.08 })
      + rect(720, 720, 160, 180, tint('#6B4A2E'), { r: 4 }) + rect(700, 690, 200, 20, tint('#5A3A2E')) + [705, 880].map((x) => rect(x, 700, 16, 200, tint('#EDE6DA'))).join('')
      + win(540, 700, 120, 110) + win(940, 700, 120, 110) + line(600, 700, 600, 810, wall, 5) + line(1000, 700, 1000, 810, wall, 5) + win(760, 500, 80, 80)
      + Array.from({ length: 26 }, (_, k) => rect(330 + k * 36, 930, 14, 70, tint('#F3EEE6'), { r: 7 })).join('') + rect(330, 950, 930, 8, tint('#F3EEE6'))
      + Array.from({ length: 30 }, () => circ(400 + R() * 800, 905 + R() * 20, 6, pick(R, ['#E63946', '#FFB703', '#F72585', '#FFFFFF']))).join('') + trees([[260, 340, 1], [1320, 320, 0]]);
  } else {
    const towers = [[460, 300, 240, 600], [740, 120, 300, 780], [1080, 240, 260, 660]];
    s += towers.map(([x, y, w, h], k) => rect(x, y, w, h, c.lg([[0, tint(mix(sky.top, '#FFFFFF', 0.5))], [1, tint('#3A4A5E')]], 0, 0, 1, 1))
      + Array.from({ length: Math.floor(h / 36) }, (_, r) => line(x, y + r * 36, x + w, y + r * 36, '#FFFFFF', 1.5, { op: 0.35 })).join('') + Array.from({ length: Math.floor(w / 40) }, (_, q) => line(x + q * 40, y, x + q * 40, y + h, '#FFFFFF', 1, { op: 0.2 })).join('')
      + (sky.lit ? Array.from({ length: 30 }, () => rect(x + Math.floor(R() * (w / 40)) * 40 + 4, y + Math.floor(R() * (h / 36)) * 36 + 4, 32, 28, '#FFD27A', { op: 0.85 })).join('') : '')
      + poly([[x, y], [x + w * 0.4, y], [x, y + h * 0.5]], '#FFFFFF', { op: 0.12 }) + (k === 1 ? rect(x + w / 2 - 4, y - 80, 8, 80, tint('#5A6575')) : '')).join('')
      + rect(300, 900, 1000, 20, tint('#BFC5CC')) + trees([[360, 220, 0], [1420, 240, 0]]);
  }
  const [title, sub, price] = RE_TITLES[type];
  const brand = `${coined(i + 40)} Realty`;
  if (overlay === 1) s += rect(0, 0, 560, H, '#0B0F17', { op: 0.82 }) + label(70, 140, brand, { size: 22, fill: '#E9C46A', upper: true, ls: 5 }) + label(70, 330, title.split(' ')[0], { font: 'didot', weight: 400, size: 96, fill: '#FFFFFF' })
    + label(70, 430, title.split(' ').slice(1).join(' '), { font: 'didot', weight: 400, size: 96, fill: '#FFFFFF' }) + label(70, 500, sub, { size: 26, fill: '#FFFFFF', op: 0.8 })
    + label(70, 640, 'Starting at', { size: 20, fill: '#FFFFFF', op: 0.6, upper: true, ls: 3 }) + label(70, 700, price, { font: 'helvetica', weight: 800, size: 60, fill: '#E9C46A' })
    + rect(70, 780, 340, 70, '#E9C46A', { r: 4 }) + label(240, 824, 'Book a site visit', { size: 22, weight: 700, fill: '#0B0F17', anchor: 'middle' }) + label(70, 1080, '+91 98290 00000 · RERA approved', { size: 20, fill: '#FFFFFF', op: 0.7 });
  else if (overlay === 2) s += rect(0, 1040, W, 160, '#0B0F17', { op: 0.88 }) + label(70, 1110, title, { font: 'didot', weight: 400, size: 54, fill: '#FFFFFF' }) + label(70, 1152, `${sub} · ${brand}`, { size: 22, fill: '#FFFFFF', op: 0.75 })
    + label(W - 70, 1120, price, { font: 'helvetica', weight: 800, size: 54, fill: '#E9C46A', anchor: 'end' }) + label(W - 70, 1156, 'Onwards · Easy EMI', { size: 20, fill: '#FFFFFF', op: 0.7, anchor: 'end' });
  else if (overlay === 3) s += txt(W / 2, 170, title, { font: 'didot', weight: 400, size: 104, fill: '#FFFFFF', anchor: 'middle', op: 0.95 }) + label(W / 2, 230, `${sub} · ${price} onwards`, { size: 28, fill: '#FFFFFF', anchor: 'middle', op: 0.9 })
    + rect(70, 70, 210, 50, '#FFFFFF', { r: 25 }) + label(175, 103, 'New launch', { size: 20, weight: 700, fill: '#111', anchor: 'middle', upper: true, ls: 2 });
  else if (overlay === 4) s += g(rect(-120, 0, 600, 70, '#E63946') + label(180, 46, 'Coming soon', { size: 28, weight: 800, fill: '#FFFFFF', anchor: 'middle', upper: true, ls: 4 }), { t: `translate(${W - 260} 40) rotate(35 180 35)` })
    + rect(60, H - 140, 420, 90, '#FFFFFF', { r: 12, op: 0.92 }) + label(90, H - 100, brand, { size: 26, weight: 800, fill: '#111' }) + label(90, H - 68, title, { size: 18, fill: '#444' });
  return s;
}

// ======================= STUDIO PRODUCTS =======================
const PRODUCTS = ['perfume', 'perfume2', 'serum', 'jar', 'lipstick', 'bottle', 'watch', 'headphones', 'sneaker', 'takeaway', 'handbag', 'kettlebell', 'watchSq', 'cup'];
const PROD_NAMES = { perfume: 'Eau de Parfum', perfume2: 'Oud Intense', serum: 'Glow Serum', jar: 'Night Cream', lipstick: 'Velvet Matte', bottle: 'Steel Bottle', watch: 'Chrono 42', headphones: 'Studio Max', sneaker: 'Air Glide', takeaway: 'Cold Brew', handbag: 'Mini Tote', kettlebell: 'Iron 16', watchSq: 'Pulse Fit', cup: 'Morning Roast' };
const PROD_PALS = [['#F3E1D6', '#C0705A', '#E9C46A', '#E8CFC0'], ['#1B1B22', '#C8A46E', '#7B5CFF', '#2A2A33'], ['#DDEBE3', '#2F7A5B', '#F2A541', '#C7DDD0'], ['#E6E3F6', '#6A4CFF', '#FF8FAB', '#D4CFEE'],
  ['#F7EBDC', '#B5651D', '#2A9D8F', '#EAD8C2'], ['#0F2027', '#2DD4BF', '#F59E0B', '#18323B'], ['#FCE4EC', '#D6336C', '#7048E8', '#F6C9D8'], ['#ECEFF3', '#1E3A5F', '#E63946', '#D5DBE3']];
const kCols = (main, alt, bg) => ({ main, alt, dark: '#1C1C22', light: mix(bg, '#FFFFFF', 0.7), metal: ['#F8E7B0', '#D4AF5A', '#9A7428'], gem: [mix(alt, '#FFFFFF', 0.7), alt, mix(alt, '#000000', 0.3)] });

function products(c, R, i, W, H) {
  const scene = i % 5, kind = PRODUCTS[(i * 3 + Math.floor(i / 14)) % PRODUCTS.length];
  const [bg, main, alt, pod] = PROD_PALS[(i + Math.floor(i / 5)) % PROD_PALS.length];
  const dark = onColor(bg) === '#FFFFFF';
  const ink = dark ? '#F5F5F5' : '#1A1A1A';
  const k = kCols(main, alt, bg);
  const product = (x, y, s) => art(c, kind, k, x, y, s);
  const fy = 860;
  let s = studio(c, W, H, bg, fy);
  if (scene === 0) {
    const cyl = (cx, top, rx, h, col) => rect(cx - rx, top, rx * 2, h, c.lg([[0, mix(col, '#000000', 0.12)], [0.4, mix(col, '#FFFFFF', 0.2)], [1, mix(col, '#000000', 0.2)]], 0, 0, 1, 0)) + ell(cx, top + h, rx, rx * 0.18, mix(col, '#000000', 0.15)) + ell(cx, top, rx, rx * 0.18, mix(col, '#FFFFFF', 0.15));
    s += shadow(800, 1000, 420, 40, 0.3) + cyl(1060, 520, 150, 470, mix(pod, main, 0.2)) + cyl(800, 760, 320, 230, pod) + shadow(800, 770, 160, 24, 0.4) + product(800, 560, 440)
      + circ(1240, 900, 70, c.rg([[0, mix(alt, '#FFFFFF', 0.5)], [1, alt]], 0.35, 0.3, 0.75)) + shadow(1240, 975, 70, 12, 0.3);
  } else if (scene === 1) {
    s += path(`M520 ${fy}L520 420A280 280 0 0 1 1080 420L1080 ${fy}Z`, c.lg([[0, mix(pod, '#FFFFFF', 0.2)], [1, mix(pod, '#000000', 0.1)]])) + rect(620, 760, 360, 100, c.lg([[0, mix(pod, '#FFFFFF', 0.3)], [1, pod]]), { r: 4 })
      + shadow(800, 770, 150, 20, 0.45) + product(800, 560, 420) + g(art(c, 'plant', { ...k, main: mix(alt, '#000000', 0.2) }, 400, 760, 300), { op: 0.95 }) + shadow(400, 860, 80, 12, 0.3);
  } else if (scene === 2) {
    s += [[420, 300, 90], [1180, 260, 60], [1260, 640, 110], [360, 720, 70], [980, 160, 40]].map(([x, y, r]) => circ(x + 20, y + 40, r, '#000000', { op: 0.15, f: 'bl' }) + circ(x, y, r, c.rg([[0, mix(k.gem[0], '#FFFFFF', 0.5)], [0.6, alt], [1, mix(alt, '#000000', 0.35)]], 0.35, 0.3, 0.8))).join('')
      + shadow(800, 960, 170, 20, 0.25) + product(800, 520, 500);
  } else if (scene === 3) {
    s = rect(0, 0, W, H, bg) + poly([[W * 0.55, 0], [W, 0], [W, H], [W * 0.3, H]], main) + txt(W / 2, 700, PROD_NAMES[kind].split(' ')[0], { font: 'helvetica', weight: 800, size: 340, anchor: 'middle', fill: 'none', stroke: dark ? '#FFFFFF' : '#111111', sw: 3, op: 0.35, ls: -10 })
      + shadow(820, 980, 260, 30, 0.35) + g(product(800, 580, 560), { t: 'rotate(-8 800 580)' });
  } else {
    const fade = c.mask(rect(0, fy, W, 400, c.lg([[0, '#FFFFFF', 0.45], [0.6, '#FFFFFF', 0]])));
    s = rect(0, 0, W, fy, c.lg([[0, mix(bg, '#FFFFFF', 0.2)], [1, bg]])) + rect(0, fy, W, H - fy, mix(bg, '#000000', dark ? 0.3 : 0.12))
      + Array.from({ length: 5 }, (_, q) => ell(800, fy + 10, 160 + q * 90, 26 + q * 14, 'none', { stroke: '#FFFFFF', sw: 2, op: 0.3 - q * 0.05 })).join('')
      + g(g(product(800, fy - 230, 460), { t: `translate(0 ${fy * 2}) scale(1 -1)` }), { mask: fade }) + product(800, fy - 230, 460);
  }
  return s + label(80, 110, coined(i + 70), { font: 'didot', weight: 400, size: 44, fill: ink }) + label(80, 150, PROD_NAMES[kind], { size: 20, fill: ink, upper: true, ls: 4, op: 0.7 })
    + label(W - 80, H - 70, 'Studio product shot', { size: 18, fill: ink, anchor: 'end', op: 0.5, upper: true, ls: 3 });
}

// ======================= FASHION =======================
const GARMENT = ['#F4F1EA', '#1F2A44', '#A3B18A', '#C9A27E', '#7F1D1D', '#E9C46A', '#3D5A80', '#D8A7B1', '#2F3E46', '#F2E8DC', '#6B705C', '#B5838D'];
const shade = (c, col) => c.lg([[0, mix(col, '#FFFFFF', 0.12)], [1, mix(col, '#000000', 0.16)]], 0, 0, 1, 1);
const fold = (d) => path(d, 'none', { stroke: '#000000', sw: 2, op: 0.12, cap: 'round' });
const CLOTHES = {
  shirt: (c, col) => path('M70 30L86 22L100 34L114 22L130 30L168 52L184 150L164 156L150 80L148 186L52 186L50 80L36 156L16 150L32 52Z', shade(c, col), { join: 'round' })
    + path('M86 22L100 46L114 22L106 18L100 30L94 18Z', mix(col, '#FFFFFF', 0.3)) + line(100, 46, 100, 186, mix(col, '#000000', 0.25), 2) + [64, 88, 112, 136, 160].map((y) => circ(104, y, 2.6, mix(col, '#000000', 0.35))).join('')
    + rect(118, 70, 22, 20, 'none', { stroke: mix(col, '#000000', 0.2), sw: 1.5 }) + fold('M70 110Q76 140 68 176M132 120Q126 150 134 178'),
  blazer: (c, col) => path('M66 28L100 24L134 28L172 52L186 160L166 166L152 84L152 188L48 188L48 84L34 166L14 160L28 52Z', shade(c, col), { join: 'round' })
    + path('M80 26L100 120L120 26L132 30L108 132L100 140L92 132L68 30Z', mix(col, '#000000', 0.2)) + path('M100 120L82 60L76 30L100 92Z', mix(col, '#FFFFFF', 0.12))
    + circ(108, 150, 4, '#1A1A1A') + circ(108, 168, 4, '#1A1A1A') + line(56, 150, 84, 150, mix(col, '#000000', 0.3), 2) + line(118, 150, 146, 150, mix(col, '#000000', 0.3), 2) + rect(122, 76, 22, 4, mix(col, '#000000', 0.3)),
  jeans: (c, col) => path('M52 18L148 18L156 190L112 190L100 70L88 190L44 190Z', c.lg([[0, mix(col, '#FFFFFF', 0.1)], [1, mix(col, '#000000', 0.25)]], 0, 0, 1, 1))
    + rect(52, 18, 96, 14, mix(col, '#000000', 0.2)) + circ(100, 25, 3, '#D4AF5A') + path('M100 32L100 62Q96 70 90 72', 'none', { stroke: '#E9C46A', sw: 1.5, dash: '3 3' })
    + path('M56 34Q70 52 88 36M144 34Q130 52 112 36', 'none', { stroke: '#E9C46A', sw: 1.5, dash: '3 3' }) + fold('M66 90Q72 140 64 186M134 90Q128 140 136 186'),
  kurta: (c, col) => path('M70 24L88 18Q100 26 112 18L130 24L166 46L178 130L160 134L148 74L150 196L50 196L52 74L40 134L22 130L34 46Z', shade(c, col), { join: 'round' })
    + path('M100 22L100 70', 'none', { stroke: '#D4AF5A', sw: 3 }) + Array.from({ length: 7 }, (_, k) => circ(94 - k * 0 + (k % 2) * 12, 26 + k * 7, 2.2, '#D4AF5A')).join('')
    + Array.from({ length: 13 }, (_, k) => circ(56 + k * 7.5, 188, 2.6, '#D4AF5A')).join('') + line(50, 182, 150, 182, '#D4AF5A', 2) + fold('M74 100Q80 150 72 190M128 100Q122 150 130 190'),
  hoodie: (c, col) => path('M62 34Q100 -6 138 34L172 56L186 160L166 166L152 88L152 186L48 186L48 88L34 166L14 160L28 56Z', shade(c, col), { join: 'round' })
    + path('M72 36Q100 6 128 36Q118 58 100 60Q82 58 72 36Z', mix(col, '#000000', 0.3)) + line(92, 58, 90, 96, mix(col, '#FFFFFF', 0.5), 2.5) + line(108, 58, 110, 96, mix(col, '#FFFFFF', 0.5), 2.5)
    + path('M66 128L134 128L144 168L56 168Z', mix(col, '#000000', 0.1)) + rect(48, 176, 104, 10, mix(col, '#000000', 0.15)),
  skirt: (c, col) => rect(64, 24, 72, 14, mix(col, '#000000', 0.2), { r: 3 }) + path('M64 38L136 38L170 186Q100 198 30 186Z', shade(c, col))
    + Array.from({ length: 8 }, (_, k) => line(72 + k * 8, 40, 40 + k * 17.5, 188, '#000000', 1.5, { op: 0.12 })).join(''),
  dress: (c, col) => art(c, 'dress', { main: col, alt: mix(col, '#000000', 0.3), dark: '#2A2A2A' }, 100, 100, 200),
  tshirt: (c, col) => art(c, 'tshirt', { main: col, alt: mix(col, '#FFFFFF', 0.4), light: mix(col, '#FFFFFF', 0.7) }, 100, 100, 200),
};
const CLOTH_KEYS = Object.keys(CLOTHES);
const cloth = (c, kind, col, x, y, s, rot = 0) => g(CLOTHES[kind](c, col), { t: `translate(${x - s / 2} ${y - s / 2}) rotate(${rot} ${s / 2} ${s / 2}) scale(${s / 200})` });
const hanger = (x, y, s, col = '#3A2E26') => path(`M${x} ${y - s * 0.22}q0 -${s * 0.07} ${s * 0.05} -${s * 0.07}q${s * 0.05} 0 ${s * 0.05} ${s * 0.05}q0 ${s * 0.04} -${s * 0.1} ${s * 0.07}L${x - s * 0.3} ${y + s * 0.02}L${x + s * 0.3} ${y + s * 0.02}L${x} ${y - s * 0.1}`, 'none', { stroke: col, sw: s * 0.015, join: 'round', cap: 'round' });
const SEASONS = ['Linen', 'Monsoon', 'Festive', 'Winter', 'Weekend', 'Resort', 'Workwear', 'Handloom'];

function fashion(c, R, i, W, H) {
  const comp = i % 4;
  const wall = ['#EFE9E1', '#E4E8E2', '#F3E7E3', '#E7E4EE', '#1E1E22', '#EEE6D8'][(i * 5) % 6];
  const dark = onColor(wall) === '#FFFFFF', ink = dark ? '#F2F2F2' : '#1C1A18';
  const col = (k) => GARMENT[(i * 3 + k * 5) % GARMENT.length];
  const season = SEASONS[(i * 7) % SEASONS.length], brand = `${coined(i + 90)} Atelier`;
  let s;
  if (comp === 0) {
    s = studio(c, W, H, wall, 980) + rect(160, 190, 1280, 14, '#B9BEC6', { r: 7 }) + rect(170, 190, 12, 800, '#A3A9B2') + rect(1418, 190, 12, 800, '#A3A9B2') + rect(130, 980, 90, 12, '#8A9099', { r: 6 }) + rect(1380, 980, 90, 12, '#8A9099', { r: 6 });
    s += [0, 1, 2, 3, 4].map((k) => { const x = 330 + k * 235, kind = CLOTH_KEYS[(i + k * 3) % CLOTH_KEYS.length], sz = kind === 'kurta' || kind === 'dress' ? 420 : 340;
      return line(x, 197, x, 236, '#6B6F76', 4) + cloth(c, kind, col(k), x, 236 + sz * 0.5 - 10, sz, (R() - 0.5) * 4) + hanger(x, 236, 300); }).join('')
      + shadow(800, 1000, 640, 20, 0.2);
  } else if (comp === 1) {
    const items = [['shirt', 360, 380, 520, -8], ['jeans', 920, 520, 620, 6], ['sneaker', 520, 920, 360, -14], ['sunglasses', 1240, 230, 260, 12], ['handbag', 1300, 860, 340, -6], ['watch', 260, 760, 200, 20]];
    const top = R() < 0.5 ? 'shirt' : pick(R, ['tshirt', 'hoodie', 'kurta']);
    s = rect(0, 0, W, H, wall) + rect(0, 0, W, H, '#000000', { f: 'grain', op: 0.12 });
    s += items.map(([kind, x, y, sz, rot], k) => {
      const kk = k === 0 ? top : kind, cc = col(k);
      const draw = CLOTHES[kk] ? cloth(c, kk, cc, x, y, sz, rot) : g(art(c, kk, { ...kCols(cc, col(k + 2), wall), dark: '#22201E' }, x, y, sz), { t: `rotate(${rot} ${x} ${y})` });
      return g(draw, { t: 'translate(14 20)', op: 0.25, f: 'bl4' }).replace(/fill="[^"]+"/g, 'fill="#000"') + draw;
    }).join('');
    s += g(path('M0 0C30 -40 60 -40 80 0C60 20 30 20 0 0Z', '#4E8B4A') + line(0, 0, 80, 0, '#FFFFFF', 1.5, { op: 0.4 }), { t: 'translate(1060 120) rotate(30) scale(1.6)' });
  } else if (comp === 2) {
    const kind = CLOTH_KEYS[(i * 5) % CLOTH_KEYS.length], cc = col(0);
    s = studio(c, W, H, wall, 1060) + circ(560, 150, 12, '#8A9099') + shadow(600, 640, 200, 330, 0.22) + cloth(c, kind, cc, 560, 620, 760) + hanger(560, 236, 520)
      + line(560, 162, 560, 182, '#8A9099', 4) + path('M700 360Q760 420 770 470', 'none', { stroke: '#8A6D4B', sw: 2 }) + g(rect(-50, 0, 100, 150, '#F7F3EA', { r: 6 }) + circ(0, 18, 6, wall) + txt(0, 70, '₹', { font: 'didot', size: 30, fill: '#1A1A1A', anchor: 'middle' }) + txt(0, 110, String(1499 + i * 100), { font: 'avenir', weight: 700, size: 22, fill: '#1A1A1A', anchor: 'middle' }), { t: 'translate(770 470) rotate(-10)' })
      + label(1000, 470, `The ${season}`, { font: 'didot', weight: 400, size: 84, fill: ink }) + label(1000, 570, kind[0].toUpperCase() + kind.slice(1), { font: 'didot', weight: 400, size: 84, fill: ink, italic: true })
      + label(1004, 640, `Handmade by ${brand}`, { size: 22, fill: ink, op: 0.7 }) + rect(1004, 690, 220, 56, ink, { r: 2 }) + label(1114, 726, 'Shop now', { size: 18, weight: 700, fill: wall, anchor: 'middle', upper: true, ls: 3 });
  } else {
    const a = CLOTH_KEYS[(i + 1) % CLOTH_KEYS.length], b2 = CLOTH_KEYS[(i + 4) % CLOTH_KEYS.length], accent = col(3);
    s = rect(0, 0, W, H, wall) + rect(W * 0.52, 0, W * 0.48, H, mix(accent, wall, 0.55)) + shadow(1020, 980, 340, 30, 0.2)
      + cloth(c, a, col(0), 960, 560, 640, -6) + cloth(c, b2, col(1), 1200, 620, 620, 5)
      + label(100, 300, `The ${season}`, { font: 'didot', weight: 400, size: 110, fill: ink }) + label(100, 420, 'Edit', { font: 'didot', weight: 400, size: 110, fill: ink, italic: true })
      + label(104, 500, `Collection 0${1 + (i % 9)} · ${brand}`, { size: 22, fill: ink, op: 0.7, upper: true, ls: 4 })
      + Array.from({ length: 4 }, (_, k) => rect(104, 580 + k * 26, 380 - k * 40, 6, ink, { r: 3, op: 0.18 })).join('') + label(104, 900, 'Lookbook 2027', { size: 18, fill: ink, op: 0.6, upper: true, ls: 6 });
  }
  return s + (comp < 2 ? label(70, 90, brand, { font: 'didot', weight: 400, size: 40, fill: ink }) + label(72, 126, `${season} collection`, { size: 18, fill: ink, op: 0.6, upper: true, ls: 4 }) : '');
}

// ======================= SHOES =======================
// 400×200 box, toe pointing right. q: { up, sole, acc, lace }
const SHOE = {
  sneaker: (c, q) => path('M30 172L372 172Q386 172 386 160L386 154L26 154Q18 166 30 172Z', '#24262B')
    + path('M22 154L386 154Q392 136 376 128L40 128Q20 132 22 154Z', c.lg([[0, '#FFFFFF'], [1, '#D9DCE1']])) + path('M40 146L380 146', 'none', { stroke: '#000', sw: 1.5, op: 0.12 })
    + path('M40 130L44 90Q46 68 70 64L150 58Q178 38 206 28L236 24Q252 50 276 64Q330 82 366 102Q384 114 378 130Z', c.lg([[0, mix(q.up, '#FFFFFF', 0.18)], [1, mix(q.up, '#000000', 0.22)]], 0, 0, 1, 1))
    + path('M300 78Q350 90 372 110Q382 122 378 130L300 130Z', mix(q.up, '#FFFFFF', 0.2)) + path('M40 130L44 90Q46 70 70 64L98 64L104 130Z', mix(q.up, '#000000', 0.18))
    + path('M108 122Q200 110 292 74', 'none', { stroke: q.acc, sw: 13, cap: 'round' }) + path('M206 28Q214 10 236 12L240 26Z', mix(q.up, '#000000', 0.25))
    + Array.from({ length: 5 }, (_, k) => line(212 + k * 14, 36 + k * 9, 224 + k * 14, 30 + k * 9, q.lace, 4)).join('') + Array.from({ length: 5 }, (_, k) => circ(210 + k * 14, 38 + k * 9, 2.5, '#1A1A1A')).join('')
    + path('M48 92Q50 72 72 70L150 64', 'none', { stroke: '#FFFFFF', sw: 1.5, dash: '4 4', op: 0.5 }) + path('M60 100Q140 84 200 60', 'none', { stroke: '#FFFFFF', sw: 6, op: 0.18, cap: 'round' }),
  hightop: (c, q) => SHOE.sneaker(c, q) + path('M44 92L52 6Q54 -4 66 -4L148 -2Q176 4 206 28L150 58L70 64Q46 68 44 92Z', c.lg([[0, mix(q.up, '#FFFFFF', 0.15)], [1, mix(q.up, '#000000', 0.25)]], 0, 0, 1, 1))
    + path('M52 6Q54 -4 66 -4L148 -2', 'none', { stroke: mix(q.up, '#000000', 0.4), sw: 10, cap: 'round' }) + Array.from({ length: 4 }, (_, k) => line(150 + k * 14, 6 + k * 6, 162 + k * 14, 0 + k * 6, q.lace, 4)).join('')
    + circ(96, 40, 18, q.acc) + circ(96, 40, 8, '#FFFFFF'),
  heel: (c, q) => path('M66 104L76 104L86 192L78 192Z', '#1A1A1A') + path('M48 70Q58 50 90 58Q150 104 232 132Q300 150 360 144Q388 142 388 160Q386 174 360 174L238 174Q166 168 104 114L80 108Q54 100 48 70Z', c.lg([[0, mix(q.up, '#FFFFFF', 0.25)], [1, mix(q.up, '#000000', 0.25)]], 0, 0, 1, 1))
    + path('M90 60Q150 104 228 130Q252 122 280 128Q230 106 170 88Q120 70 90 60Z', mix(q.up, '#000000', 0.45)) + path('M238 174L360 174Q386 174 388 162', 'none', { stroke: '#1A1A1A', sw: 4 })
    + path('M120 90Q190 124 300 140', 'none', { stroke: '#FFFFFF', sw: 4, op: 0.35, cap: 'round' }) + circ(330, 130, 6, q.acc),
  boot: (c, q) => path('M62 0L172 0L178 92Q232 104 300 116Q372 128 380 152L380 166L52 166L52 120Q48 60 62 0Z', c.lg([[0, mix(q.up, '#FFFFFF', 0.15)], [1, mix(q.up, '#000000', 0.3)]], 0, 0, 1, 1))
    + path('M120 10L176 10L180 90Q150 96 126 90Z', mix(q.up, '#000000', 0.35)) + Array.from({ length: 6 }, (_, k) => line(128 + k * 9, 14, 132 + k * 8, 88, '#000', 1.2, { op: 0.3 })).join('')
    + path('M62 0Q66 -26 84 -24L84 6', 'none', { stroke: mix(q.up, '#000000', 0.4), sw: 8 }) + rect(48, 166, 334, 18, '#2A211C', { r: 4 }) + rect(48, 166, 70, 30, '#2A211C', { r: 3 })
    + path('M58 30Q66 80 60 150', 'none', { stroke: '#FFFFFF', sw: 6, op: 0.18, cap: 'round' }) + path('M180 100Q280 116 372 146', 'none', { stroke: '#FFFFFF', sw: 1.5, dash: '4 4', op: 0.4 }),
  loafer: (c, q) => path('M36 124Q44 92 90 88L200 90Q300 94 362 118Q388 130 384 154L384 168L36 168Z', c.lg([[0, mix(q.up, '#FFFFFF', 0.2)], [1, mix(q.up, '#000000', 0.3)]], 0, 0, 1, 1))
    + path('M90 90Q100 112 150 112L230 108Q250 100 260 94', mix(q.up, '#000000', 0.5)) + path('M230 98Q290 92 340 116Q300 128 250 118Z', 'none', { stroke: mix(q.up, '#000000', 0.4), sw: 2, dash: '4 3' })
    + rect(196, 104, 70, 14, mix(q.up, '#000000', 0.25), { r: 4 }) + ell(230, 111, 12, 4, '#000000', { op: 0.6 }) + rect(32, 166, 356, 12, '#2A211C', { r: 4 }) + rect(32, 166, 60, 22, '#2A211C', { r: 3 })
    + path('M60 120Q160 110 300 116', 'none', { stroke: '#FFFFFF', sw: 5, op: 0.18, cap: 'round' }),
  runner: (c, q) => SHOE.sneaker(c, q) + path('M40 130L44 90Q46 68 70 64L150 58Q178 38 206 28L236 24Q252 50 276 64Q330 82 366 102Q384 114 378 130Z', c.pattern(8, 8, circ(4, 4, 1.4, '#FFFFFF', { op: 0.25 })))
    + path('M24 150Q90 138 160 148T300 146T386 142', 'none', { stroke: q.acc, sw: 5 }),
};
const SHOE_KEYS = Object.keys(SHOE);
const SHOE_COLS = [['#E8E4DC', '#E63946', '#FFFFFF'], ['#1F1F24', '#C6FF00', '#FFFFFF'], ['#C8553D', '#F2D0A4', '#FFFFFF'], ['#3D5A80', '#FFB703', '#F1FAEE'], ['#7B2CBF', '#06D6A0', '#FFFFFF'],
  ['#8C5A3C', '#E9C46A', '#F4E9DC'], ['#F72585', '#4CC9F0', '#FFFFFF'], ['#2A9D8F', '#F4A261', '#FFFFFF'], ['#111111', '#D4AF5A', '#EEEEEE'], ['#F4F1EA', '#1D4ED8', '#1F2937']];
const shoe = (c, kind, q, x, y, w, rot = 0, flip = false) => g(SHOE[kind](c, q), { t: `translate(${x} ${y}) rotate(${rot}) scale(${(flip ? -1 : 1) * (w / 400)} ${w / 400}) translate(-200 -100)` });

function shoes(c, R, i, W, H) {
  const comp = i % 4, kind = SHOE_KEYS[(i + Math.floor(i / 4)) % SHOE_KEYS.length];
  const [up, acc, lace] = SHOE_COLS[(i * 3 + Math.floor(i / 6)) % SHOE_COLS.length];
  const q = { up, acc, lace };
  const bg = ['#EEEAE4', '#111214', mix(up, '#FFFFFF', 0.82), '#E4ECF2', mix(acc, '#FFFFFF', 0.75)][(i * 7) % 5];
  const dark = onColor(bg) === '#FFFFFF', ink = dark ? '#F4F4F4' : '#121212';
  const model = `${coined(i + 130).toUpperCase()} ${['ONE', 'PRO', 'LUX', 'RUN', 'X', '07'][i % 6]}`;
  let s;
  if (comp === 0) {
    s = rect(0, 0, W, H, c.rg([[0, mix(bg, '#FFFFFF', 0.25)], [1, bg]], 0.5, 0.45, 0.8))
      + txt(W / 2, 700, model.split(' ')[0], { font: 'helvetica', weight: 800, size: 300, anchor: 'middle', fill: 'none', stroke: ink, sw: 3, op: 0.3, ls: -6 })
      + shadow(800, 960, 380, 28, 0.35) + shoe(c, kind, q, 800, 560, 1000, -12);
  } else if (comp === 1) {
    s = studio(c, W, H, bg, 900) + shadow(900, 930, 420, 26, 0.35) + shoe(c, kind, q, 640, 650, 760, 0, true) + shadow(980, 1010, 400, 26, 0.35) + shoe(c, kind, q, 960, 790, 820, -4);
  } else if (comp === 2) {
    const pod = mix(acc, '#FFFFFF', 0.55);
    s = studio(c, W, H, bg, 900) + shadow(800, 990, 340, 30, 0.3) + rect(530, 780, 540, 190, c.lg([[0, mix(pod, '#000000', 0.12)], [0.4, mix(pod, '#FFFFFF', 0.2)], [1, mix(pod, '#000000', 0.2)]], 0, 0, 1, 0))
      + ell(800, 970, 270, 42, mix(pod, '#000000', 0.15)) + ell(800, 780, 270, 42, mix(pod, '#FFFFFF', 0.25)) + shadow(800, 782, 230, 16, 0.45) + shoe(c, kind, q, 800, 640, 700, 0);
  } else {
    s = rect(0, 0, W, H, bg) + circ(560, 420, 300, acc, { f: 'bl60', op: 0.7 }) + circ(1100, 760, 320, up, { f: 'bl60', op: 0.55 })
      + path('M200 760C420 640 760 860 1000 700S1360 560 1460 640', 'none', { stroke: acc, sw: 120, cap: 'round', op: 0.85 })
      + shadow(820, 980, 360, 26, 0.3) + shoe(c, kind, q, 800, 640, 940, -16)
      + label(80, 150, 'New drop', { font: 'helvetica', weight: 800, size: 30, fill: ink, upper: true, ls: 6 }) + label(W - 80, H - 90, `₹${(4999 + i * 250).toLocaleString('en-IN')}`, { font: 'helvetica', weight: 800, size: 56, fill: ink, anchor: 'end' });
  }
  return s + label(80, H - 90, model, { font: 'helvetica', weight: 800, size: 40, fill: ink, ls: 2 }) + label(82, H - 56, `${kind === 'heel' ? 'Stiletto pump' : kind === 'boot' ? 'Chelsea boot' : kind === 'loafer' ? 'Penny loafer' : kind === 'hightop' ? 'High-top' : 'Sneaker'} · ${coined(i + 7)} Footwear`, { size: 20, fill: ink, op: 0.65 });
}

// ======================= INTERIORS =======================
const WALL_COLS = ['#E9E2D6', '#D9E2DC', '#E8D9CF', '#D6DCE6', '#EDE7DD', '#2E3A35', '#C9B8A6', '#E4DCEB', '#F1ECE4', '#B9C7BD'];
const SOFT = ['#8B9A7B', '#C77D5B', '#3D5A80', '#D8B48A', '#6B4E71', '#2F3E46', '#E9C46A', '#A3B18A'];

function frameArt(c, x, y, w, h, R, cols) {
  return rect(x - 8, y - 8, w + 16, h + 16, '#2A211C') + rect(x, y, w, h, '#F6F1E8') + g(circ(x + w * (0.3 + R() * 0.4), y + h * 0.45, Math.min(w, h) * 0.28, cols[0]) + rect(x, y + h * 0.62, w, h * 0.38, cols[1], { op: 0.85 })
    + path(`M${x} ${y + h * 0.7}Q${x + w / 2} ${y + h * 0.4} ${x + w} ${y + h * 0.66}`, 'none', { stroke: cols[2], sw: 6 }), { clip: c.clip(rect(x, y, w, h, '#000')) }) + shadow(x + w / 2 + 10, y + h + 14, w * 0.5, 10, 0.18);
}

function interiors(c, R, i, W, H) {
  const room = i % 3, wall = WALL_COLS[(i * 3) % WALL_COLS.length], fab = SOFT[(i * 5) % SOFT.length], acc = SOFT[(i * 5 + 3) % SOFT.length];
  const darkWall = onColor(wall) === '#FFFFFF';
  const fy = 820, wood = ['#B07D52', '#8A5A3B', '#D2B48C', '#6B4A33'][i % 4];
  let s = rect(0, 0, W, fy, c.lg([[0, mix(wall, '#FFFFFF', 0.12)], [1, mix(wall, '#000000', 0.06)]]));
  const opening = Math.floor(i / 3) % 3;
  if (opening === 0) s += rect(120, 140, 320, 520, '#F4F1EA') + rect(136, 156, 288, 488, c.lg([[0, '#BFDDF5'], [1, '#EAF4FB']])) + line(280, 156, 280, 644, '#F4F1EA', 10) + line(136, 400, 424, 400, '#F4F1EA', 10)
    + rect(90, 120, 40, 600, mix(acc, '#FFFFFF', 0.5), { op: 0.9 }) + rect(430, 120, 40, 600, mix(acc, '#FFFFFF', 0.5), { op: 0.9 }) + poly([[136, 644], [424, 644], [760, 1200], [200, 1200]], '#FFFFFF', { op: 0.14 });
  else if (opening === 1) s += path(`M560 ${fy}L560 330A240 240 0 0 1 1040 330L1040 ${fy}Z`, mix(wall, '#000000', 0.08));
  else s += Array.from({ length: 30 }, (_, k) => line(k * 56, 0, k * 56, fy, mix(wall, '#000000', 0.1), 3)).join('');
  s += rect(0, fy - 18, W, 18, mix(wall, '#FFFFFF', 0.3));
  s += rect(0, fy, W, H - fy, c.lg([[0, mix(wood, '#FFFFFF', 0.1)], [1, mix(wood, '#000000', 0.2)]])) + Array.from({ length: 22 }, (_, k) => line(800 + (k - 11) * 40, fy, 800 + (k - 11) * 170, H, mix(wood, '#000000', 0.25), 1.5, { op: 0.6 })).join('');
  const artCols = [acc, mix(fab, '#FFFFFF', 0.3), '#2A211C'];
  if (room === 0) {
    s += ell(800, 1010, 520, 110, mix(acc, '#FFFFFF', 0.45)) + ell(800, 1010, 480, 94, 'none', { stroke: mix(acc, '#FFFFFF', 0.2), sw: 6, dash: '2 10' })
      + frameArt(c, 640, 260, 150, 200, R, artCols) + frameArt(c, 820, 300, 200, 140, R, [artCols[1], acc, '#2A211C'])
      + shadow(800, 900, 460, 30, 0.3) + art(c, 'sofa', { main: fab, alt: acc, dark: '#2A211C' }, 800, 720, 760)
      + shadow(820, 1000, 220, 18, 0.3) + rect(620, 930, 360, 26, wood, { r: 13 }) + rect(650, 956, 10, 50, '#2A211C') + rect(940, 956, 10, 50, '#2A211C') + art(c, 'cup', { main: '#F4F1EA', light: '#FFFFFF', dark: '#2A211C' }, 760, 905, 60) + rect(840, 910, 90, 20, acc, { r: 3 })
      + art(c, 'plant', { main: mix(wood, '#FFFFFF', 0.2), dark: '#2A211C' }, 1320, 720, 360) + line(1460, 300, 1460, 900, '#2A211C', 6) + path('M1400 300Q1460 220 1520 300Z', mix(acc, '#FFFFFF', 0.4)) + ell(1460, 330, 80, 50, c.rg([[0, '#FFE9A8', 0.6], [1, '#FFE9A8', 0]]));
  } else if (room === 1) {
    s += rect(500, 420, 600, 300, mix(fab, '#000000', 0.1), { r: 30 }) + Array.from({ length: 6 }, (_, k) => line(550 + k * 100, 440, 550 + k * 100, 700, '#000000', 2, { op: 0.12 })).join('')
      + frameArt(c, 700, 180, 200, 180, R, artCols) + shadow(800, 960, 560, 30, 0.3)
      + rect(440, 690, 720, 120, '#F4F1EA', { r: 20 }) + path('M440 760L1160 760L1200 930L400 930Z', c.lg([[0, mix(acc, '#FFFFFF', 0.35)], [1, mix(acc, '#000000', 0.05)]])) + rect(400, 930, 800, 30, mix(wood, '#000000', 0.2), { r: 6 })
      + rect(520, 640, 220, 100, '#FFFFFF', { r: 30 }) + rect(860, 640, 220, 100, '#FFFFFF', { r: 30 }) + rect(640, 680, 150, 80, acc, { r: 24 }) + path('M460 790Q800 760 1180 800', 'none', { stroke: '#FFFFFF', sw: 4, op: 0.4 })
      + [[250, 1], [1350, -1]].map(([x]) => rect(x - 90, 760, 180, 150, wood, { r: 6 }) + rect(x - 80, 830, 160, 4, mix(wood, '#000000', 0.3)) + rect(x - 8, 690, 16, 70, '#2A211C') + path(`M${x - 60} 690L${x + 60} 690L${x + 40} 610L${x - 40} 610Z`, mix(acc, '#FFFFFF', 0.5)) + ell(x, 690, 120, 60, c.rg([[0, '#FFE9A8', 0.5], [1, '#FFE9A8', 0]]))).join('');
  } else {
    s += rect(980, 200, 420, 16, wood) + rect(980, 380, 420, 16, wood) + [[1000, 120], [1060, 150], [1110, 110]].map(([x, h], k) => rect(x, 200 - h, 40, h, [acc, fab, '#F4F1EA'][k], { r: 3 })).join('')
      + art(c, 'plant', { main: '#F4F1EA', dark: '#2A211C' }, 1300, 150, 140) + art(c, 'books', { main: acc, alt: fab, dark: '#2A211C', light: '#F4F1EA', metal: ['#F8E7B0', '#D4AF5A', '#9A7428'] }, 1100, 330, 140)
      + frameArt(c, 620, 220, 240, 170, R, artCols) + shadow(760, 960, 420, 26, 0.3)
      + rect(460, 640, 620, 30, wood, { r: 6 }) + rect(480, 670, 16, 260, '#2A211C') + rect(1044, 670, 16, 260, '#2A211C') + rect(860, 670, 180, 120, mix(wood, '#000000', 0.15), { r: 4 })
      + art(c, 'laptop', { main: acc, alt: fab, dark: '#2A211C', light: '#F4F1EA', metal: ['#F4F6F9', '#BCC3CE', '#7D8796'] }, 680, 570, 200) + art(c, 'lamp', { main: acc, dark: '#2A211C', metal: ['#F4F6F9', '#BCC3CE', '#7D8796'] }, 960, 560, 160)
      + art(c, 'chair', { main: fab, dark: '#2A211C' }, 760, 820, 300) + art(c, 'plant', { main: mix(wood, '#FFFFFF', 0.2), dark: '#2A211C' }, 1340, 760, 300);
  }
  const ink = darkWall ? '#F4F1EA' : '#2A211C';
  return s + label(70, 90, `${['Living room', 'Bedroom', 'Home studio'][room]} · ${coined(i + 170)} Interiors`, { size: 22, fill: ink, upper: true, ls: 4, op: 0.75 });
}

export const SCENES = { machinery, realestate, products, fashion, shoes, interiors };
