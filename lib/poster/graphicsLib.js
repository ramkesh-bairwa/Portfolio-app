// The big graphics library: curves, lines, dividers, frames, corners, arrows, badges, blobs, patterns, festive items and more.
// Each family draws at the element's real size from a few parameters; PRESETS lists 500+ ready-made combinations.
import { GRAPHICS, f, flower, leaf, rng, star4, svg } from './graphics';
import { SHAPES } from './shapes';
import { ORNAMENTS, ORNAMENT_CATS, ORNAMENT_PRESETS } from './ornaments';

const sw = (w, h, p, k = 0.06) => Math.max(1.2, Math.min(w, h) * k * (p.sw || 1));
const stroke = (d, c, width, extra = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${f(width)}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const dashAttr = (style, width) => (style === 'dashed' ? `stroke-dasharray="${f(width * 3)} ${f(width * 2.2)}"` : style === 'dotted' ? `stroke-dasharray="0.1 ${f(width * 2.2)}"` : '');
const poly = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join(' ');
// Smooth curve through points (Catmull-Rom → Bézier)
function smooth(pts, closed = false) {
  const n = pts.length;
  const at = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + (closed ? 'Z' : '');
}
// A unit (0–100) shape path drawn into a box
const unitPath = (key, x, y, w, h, fill, extra = '') => `<path d="${SHAPES[key].path}" transform="translate(${f(x)} ${f(y)}) scale(${f(w / 100)} ${f(h / 100)})" fill="${fill}" ${extra}/>`;
const heart = (cx, cy, s, c) => unitPath('heart', cx - s / 2, cy - s / 2, s, s, c);
const star = (cx, cy, s, c, key = 'star') => unitPath(key, cx - s / 2, cy - s / 2, s, s, c);

function sinePts(w, h, amp, waves, phase = 0, yMid = h / 2, pad = 0) {
  const pts = [];
  const N = Math.max(40, waves * 24);
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push([pad + t * (w - 2 * pad), yMid + Math.sin(t * waves * Math.PI * 2 + phase) * amp]);
  }
  return pts;
}

function head(x, y, dx, dy, size, c) {
  const a = Math.atan2(dy, dx);
  const p1 = [x - Math.cos(a - 0.45) * size, y - Math.sin(a - 0.45) * size];
  const p2 = [x - Math.cos(a + 0.45) * size, y - Math.sin(a + 0.45) * size];
  return `<path d="M${f(p1[0])} ${f(p1[1])} L${f(x)} ${f(y)} L${f(p2[0])} ${f(p2[1])}" fill="none" stroke="${c}" stroke-width="${f(size * 0.32)}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

const UNIT_CURVES = {
  S: 'M0.03 0.82 C0.4 0.82 0.6 0.18 0.97 0.18',
  C: 'M0.92 0.06 C0.08 0.06 0.08 0.94 0.92 0.94',
  smile: 'M0.03 0.15 Q0.5 1.25 0.97 0.15',
  frown: 'M0.03 0.85 Q0.5 -0.25 0.97 0.85',
  hook: 'M0.05 0.92 C0.05 0.08 0.95 0.08 0.95 0.5 C0.95 0.78 0.68 0.82 0.6 0.6',
  swoosh: 'M0.03 0.7 C0.3 0.98 0.7 0.98 0.97 0.08',
};
const scaleD = (d, w, h, pad) => d.replace(/(-?\d*\.?\d+) (-?\d*\.?\d+)/g, (_, x, y) => `${f(pad + Number(x) * (w - 2 * pad))} ${f(pad + Number(y) * (h - 2 * pad))}`);

const ARROWS = {
  straight: { d: 'M0.05 0.5 L0.93 0.5', end: [0.93, 0.5, 1, 0] },
  curved: { d: 'M0.05 0.85 Q0.45 0.05 0.92 0.45', end: [0.92, 0.45, 1, 0.75] },
  loop: { d: 'M0.05 0.75 C0.3 0.75 0.48 0.1 0.32 0.18 C0.16 0.26 0.4 0.92 0.93 0.42', end: [0.93, 0.42, 1, -0.9] },
  zigzag: { d: 'M0.05 0.75 L0.3 0.3 L0.55 0.75 L0.92 0.3', end: [0.92, 0.3, 1, -1.2] },
  double: { d: 'M0.07 0.5 L0.93 0.5', end: [0.93, 0.5, 1, 0], start: [0.07, 0.5, -1, 0] },
  curly: { d: 'M0.05 0.5 C0.15 0.1 0.25 0.9 0.35 0.5 C0.45 0.1 0.55 0.9 0.65 0.5 C0.72 0.25 0.82 0.5 0.93 0.5', end: [0.93, 0.5, 1, 0] },
  bent: { d: 'M0.1 0.08 L0.1 0.85 L0.92 0.85', end: [0.92, 0.85, 1, 0] },
  uturn: { d: 'M0.2 0.92 L0.2 0.35 Q0.2 0.06 0.5 0.06 Q0.8 0.06 0.8 0.35 L0.8 0.85', end: [0.8, 0.85, 0, 1] },
  circle: { d: 'M0.85 0.5 A0.35 0.4 0 1 1 0.7 0.18', end: [0.7, 0.18, 0.6, 0.5] },
  swoosh: { d: 'M0.05 0.9 C0.35 0.95 0.75 0.7 0.93 0.12', end: [0.93, 0.12, 0.5, -1] },
};

export const FAMILIES = {
  // ---------- curves & lines ----------
  wave(w, h, [c, c2], s, id, p) {
    const t = sw(w, h, p, 0.08);
    const amp = (h / 2 - t) * (p.amp || 0.5);
    const lines = p.style === 'double' ? [-1, 1] : p.style === 'triple' ? [-1.6, 0, 1.6] : [0];
    return svg(w, h, lines.map((o, i) => stroke(poly(sinePts(w, h, amp * (lines.length > 1 ? 0.55 : 1), p.waves || 3, 0, h / 2 + o * t * 1.6, t)), i % 2 && c2 ? c2 : c, t, dashAttr(p.style, t))).join(''));
  },
  zigzag(w, h, [c], s, id, p) {
    const t = sw(w, h, p, 0.08);
    const n = p.teeth || 8;
    const amp = (h / 2 - t) * (p.amp || 0.6);
    const rows = p.style === 'double' ? [-1, 1] : [0];
    return svg(w, h, rows.map((o) => stroke(poly(Array.from({ length: n + 1 }, (_, i) => [t + (i / n) * (w - 2 * t), h / 2 + o * t * 1.8 + (i % 2 ? -amp : amp) * (rows.length > 1 ? 0.6 : 1)])), c, t)).join(''));
  },
  curve(w, h, [c, c2], s, id, p) {
    const t = sw(w, h, p, 0.05);
    const d = scaleD(UNIT_CURVES[p.shape] || UNIT_CURVES.S, w, h, t * 1.5);
    let out = stroke(d, c, t, dashAttr(p.style, t));
    if (p.dots) {
      const m = d.match(/-?\d+\.?\d*/g).map(Number);
      out += `<circle cx="${f(m[0])}" cy="${f(m[1])}" r="${f(t * 1.4)}" fill="${c2 || c}"/><circle cx="${f(m[m.length - 2])}" cy="${f(m[m.length - 1])}" r="${f(t * 1.4)}" fill="${c2 || c}"/>`;
    }
    return svg(w, h, out);
  },
  spiral(w, h, [c], s, id, p) {
    const t = sw(w, h, p, 0.035);
    const R = Math.min(w, h) / 2 - t;
    const turns = p.turns || 3;
    const pts = [];
    for (let i = 0; i <= turns * 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const r = (R * i) / (turns * 60);
      pts.push([w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r]);
    }
    return svg(w, h, stroke(poly(pts), c, t));
  },
  loops(w, h, [c], s, id, p) {
    const t = sw(w, h, p, 0.05);
    const n = p.loops || 5;
    const b = (h / 2 - t) * 0.9;
    const a = (w - 2 * t - 2 * b) / (n * Math.PI * 2);
    const pts = [];
    for (let i = 0; i <= n * 60; i++) {
      const th = (i / 60) * Math.PI * 2;
      pts.push([t + b + a * th - b * Math.sin(th) * 0.9, h / 2 - b * Math.cos(th) * 0.9]);
    }
    return svg(w, h, stroke(poly(pts), c, t));
  },
  scribble(w, h, [c], seed, id, p) {
    const r = rng(seed);
    const t = sw(w, h, p, 0.04);
    const pts = Array.from({ length: 9 }, (_, i) => [t + (i / 8) * (w - 2 * t), t + r() * (h - 2 * t)]);
    return svg(w, h, stroke(smooth(pts), c, t));
  },
  dotwave(w, h, [c, c2], s, id, p) {
    const pts = sinePts(w, h, h * 0.3, p.waves || 2, 0, h / 2, h * 0.1);
    const step = Math.max(2, Math.round(pts.length / (p.count || 26)));
    const r0 = Math.min(w, h) * (p.dot || 0.06);
    return svg(w, h, pts.filter((_, i) => i % step === 0).map(([x, y], i) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r0)}" fill="${i % 2 && c2 ? c2 : c}"/>`).join(''));
  },
  parallel(w, h, [c, c2], s, id, p) {
    const n = p.lines || 3;
    const t = sw(w, h, p, 0.04);
    let out = '';
    for (let i = 0; i < n; i++) out += stroke(poly(sinePts(w, h, h * 0.18, p.waves || 1.5, 0, ((i + 1) * h) / (n + 1), t)), i % 2 && c2 ? c2 : c, t);
    return svg(w, h, out);
  },
  taper(w, h, [c], s, id, p) {
    const pts = sinePts(w, h, h * 0.25 * (p.amp || 1), p.waves || 1, p.phase || 0, h / 2, 2);
    const top = pts.map(([x, y], i) => [x, y - Math.sin((i / (pts.length - 1)) * Math.PI) * h * 0.14]);
    const bot = pts.map(([x, y], i) => [x, y + Math.sin((i / (pts.length - 1)) * Math.PI) * h * 0.14]).reverse();
    return svg(w, h, `<path d="${poly([...top, ...bot])}Z" fill="${c}"/>`);
  },

  // ---------- dividers ----------
  divider(w, h, [c, c2], s, id, p) {
    const t = Math.max(1.2, h * 0.07 * (p.sw || 1));
    const g = p.orn === 'none' ? 0 : h * 0.9;
    const L = (x1, x2) => {
      const y = h / 2;
      if (p.line === 'double') return stroke(`M${f(x1)} ${f(y - t * 1.5)} L${f(x2)} ${f(y - t * 1.5)} M${f(x1)} ${f(y + t * 1.5)} L${f(x2)} ${f(y + t * 1.5)}`, c, t * 0.7);
      if (p.line === 'thickthin') return stroke(`M${f(x1)} ${f(y - t)} L${f(x2)} ${f(y - t)}`, c, t * 1.6) + stroke(`M${f(x1)} ${f(y + t * 1.4)} L${f(x2)} ${f(y + t * 1.4)}`, c, t * 0.5);
      return stroke(`M${f(x1)} ${f(y)} L${f(x2)} ${f(y)}`, c, t, dashAttr(p.line, t));
    };
    let out = L(t, w / 2 - g / 2) + L(w / 2 + g / 2, w - t);
    const cx = w / 2;
    const cy = h / 2;
    const o = h * 0.36;
    const oc = c2 || c;
    out += {
      none: '',
      diamond: `<path d="M${f(cx)} ${f(cy - o)} L${f(cx + o)} ${f(cy)} L${f(cx)} ${f(cy + o)} L${f(cx - o)} ${f(cy)}Z" fill="${oc}"/>`,
      dot: `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(o * 0.6)}" fill="${oc}"/>`,
      dots: [-1, 0, 1].map((k) => `<circle cx="${f(cx + k * o * 0.9)}" cy="${f(cy)}" r="${f(o * 0.28)}" fill="${oc}"/>`).join(''),
      flower: flower(cx, cy, o * 0.9, oc, c),
      heart: heart(cx, cy, o * 1.8, oc),
      star: star(cx, cy, o * 2, oc),
      leaf: leaf(cx, cy, o * 1.2, 200, oc) + leaf(cx, cy, o * 1.2, -20, oc),
      ring: `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(o * 0.7)}" fill="none" stroke="${oc}" stroke-width="${f(t)}"/>`,
    }[p.orn || 'none'];
    return svg(w, h, out);
  },

  // ---------- frames & borders ----------
  frame(w, h, [c, c2], s, id, p) {
    const t = Math.max(1.5, Math.min(w, h) * 0.008 * (p.sw || 1));
    const m = t * 2 + Math.min(w, h) * 0.02;
    const R = (x, y, ww, hh, rr = 0, extra = '') => `<rect x="${f(x)}" y="${f(y)}" width="${f(ww)}" height="${f(hh)}" rx="${f(rr)}" fill="none" stroke="${c}" stroke-width="${f(t)}" ${extra}/>`;
    const st = p.style;
    if (st === 'double') return svg(w, h, R(m, m, w - 2 * m, h - 2 * m) + R(m + t * 3, m + t * 3, w - 2 * m - t * 6, h - 2 * m - t * 6));
    if (st === 'dashed' || st === 'dotted') return svg(w, h, R(m, m, w - 2 * m, h - 2 * m, 0, dashAttr(st, t)).replace('/>', ' stroke-linecap="round"/>'));
    if (st === 'rounded') return svg(w, h, R(m, m, w - 2 * m, h - 2 * m, Math.min(w, h) * 0.06));
    if (st === 'thickthin') return svg(w, h, R(m, m, w - 2 * m, h - 2 * m).replace(`stroke-width="${f(t)}"`, `stroke-width="${f(t * 2.4)}"`) + R(m + t * 4, m + t * 4, w - 2 * m - t * 8, h - 2 * m - t * 8));
    if (st === 'scallop') {
      const r = Math.min(w, h) * 0.025;
      let out = '';
      for (let x = m; x <= w - m; x += r * 2) out += `<circle cx="${f(x)}" cy="${f(m)}" r="${f(r)}" fill="${c}"/><circle cx="${f(x)}" cy="${f(h - m)}" r="${f(r)}" fill="${c}"/>`;
      for (let y = m; y <= h - m; y += r * 2) out += `<circle cx="${f(m)}" cy="${f(y)}" r="${f(r)}" fill="${c}"/><circle cx="${f(w - m)}" cy="${f(y)}" r="${f(r)}" fill="${c}"/>`;
      return svg(w, h, out);
    }
    if (st === 'wavy') {
      const a = Math.min(w, h) * 0.012;
      const edge = (len, k) => Array.from({ length: 81 }, (_, i) => [(i / 80) * len, Math.sin((i / 80) * k * Math.PI * 2) * a]);
      const kx = Math.round(w / (Math.min(w, h) * 0.06));
      const ky = Math.round(h / (Math.min(w, h) * 0.06));
      const top = edge(w - 2 * m, kx).map(([x, y]) => [m + x, m + y]);
      const right = edge(h - 2 * m, ky).map(([x, y]) => [w - m + y, m + x]);
      const bottom = edge(w - 2 * m, kx).map(([x, y]) => [w - m - x, h - m - y]);
      const left = edge(h - 2 * m, ky).map(([x, y]) => [m - y, h - m - x]);
      return svg(w, h, stroke(poly([...top, ...right, ...bottom, ...left]) + 'Z', c, t));
    }
    if (st === 'brackets') {
      const k = Math.min(w, h) * 0.14;
      return svg(w, h, [[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]].map(([x, y, sx, sy]) => stroke(`M${f(x)} ${f(y + sy * k)} L${f(x)} ${f(y)} L${f(x + sx * k)} ${f(y)}`, c, t * 2)).join(''));
    }
    if (st === 'ticket') {
      const r = Math.min(w, h) * 0.06;
      return svg(w, h, stroke(`M${f(m)} ${f(m)} H${f(w - m)} V${f(h / 2 - r)} A${f(r)} ${f(r)} 0 0 0 ${f(w - m)} ${f(h / 2 + r)} V${f(h - m)} H${f(m)} V${f(h / 2 + r)} A${f(r)} ${f(r)} 0 0 0 ${f(m)} ${f(h / 2 - r)}Z`, c, t));
    }
    if (st === 'inset') {
      const r = Math.min(w, h) * 0.07;
      return svg(w, h, stroke(`M${f(m + r)} ${f(m)} H${f(w - m - r)} A${f(r)} ${f(r)} 0 0 0 ${f(w - m)} ${f(m + r)} V${f(h - m - r)} A${f(r)} ${f(r)} 0 0 0 ${f(w - m - r)} ${f(h - m)} H${f(m + r)} A${f(r)} ${f(r)} 0 0 0 ${f(m)} ${f(h - m - r)} V${f(m + r)} A${f(r)} ${f(r)} 0 0 0 ${f(m + r)} ${f(m)}Z`, c, t));
    }
    if (st === 'deco') {
      const k = Math.min(w, h) * 0.05;
      const corner = (x, y, sx, sy) => stroke(`M${f(x)} ${f(y + sy * 3 * k)} V${f(y + sy * k)} H${f(x + sx * k)} V${f(y)} H${f(x + sx * 3 * k)}`, c2 || c, t * 1.4);
      return svg(w, h, R(m + k * 1.5, m + k * 1.5, w - 2 * m - 3 * k, h - 2 * m - 3 * k) + corner(m, m, 1, 1) + corner(w - m, m, -1, 1) + corner(m, h - m, 1, -1) + corner(w - m, h - m, -1, -1));
    }
    if (st === 'gap') {
      const g = w * 0.36;
      return svg(w, h, stroke(`M${f(w / 2 - g / 2)} ${f(m)} H${f(m)} V${f(h - m)} H${f(w - m)} V${f(m)} H${f(w / 2 + g / 2)}`, c, t));
    }
    if (st === 'stamp') {
      const r = Math.min(w, h) * 0.018;
      let holes = '';
      for (let x = r * 2; x < w; x += r * 3) holes += `<circle cx="${f(x)}" cy="0" r="${f(r)}"/><circle cx="${f(x)}" cy="${f(h)}" r="${f(r)}"/>`;
      for (let y = r * 2; y < h; y += r * 3) holes += `<circle cx="0" cy="${f(y)}" r="${f(r)}"/><circle cx="${f(w)}" cy="${f(y)}" r="${f(r)}"/>`;
      return svg(w, h, `<rect width="${f(w)}" height="${f(h)}" fill="none" stroke="${c}" stroke-width="${f(r * 2.2)}" mask="url(#${id}m)"/>${R(m + r * 2, m + r * 2, w - 2 * m - r * 4, h - 2 * m - r * 4)}`, `<mask id="${id}m"><rect width="${f(w)}" height="${f(h)}" fill="#fff"/><g fill="#000">${holes}</g></mask>`);
    }
    return svg(w, h, R(m, m, w - 2 * m, h - 2 * m));
  },

  // ---------- corners (drawn top-left; flip to use other corners) ----------
  corner(w, h, [c, c2], seed, id, p) {
    const S = Math.min(w, h);
    const t = Math.max(1.5, S * 0.025 * (p.sw || 1));
    const k = p.k || 1;
    switch (p.style) {
      case 'swirl': return svg(w, h, stroke(`M${f(t)} ${f(S * 0.9)} C${f(t)} ${f(S * 0.3)} ${f(S * 0.3)} ${f(t)} ${f(S * 0.9)} ${f(t)}`, c, t) + stroke(`M${f(S * 0.18)} ${f(S * 0.55 * k)} c${f(S * 0.15)} ${f(-S * 0.05)} ${f(S * 0.12)} ${f(-S * 0.2)} 0 ${f(-S * 0.16)}`, c2 || c, t * 0.8) + stroke(`M${f(S * 0.55 * k)} ${f(S * 0.18)} c${f(-S * 0.05)} ${f(S * 0.15)} ${f(-S * 0.2)} ${f(S * 0.12)} ${f(-S * 0.16)} 0`, c2 || c, t * 0.8));
      case 'leaf': return svg(w, h, stroke(`M${f(t)} ${f(S * 0.95)} Q${f(t)} ${f(t)} ${f(S * 0.95)} ${f(t)}`, c, t * 0.7) + Array.from({ length: 5 + Math.round(k * 2) }, (_, i) => { const u = (i + 1) / (6 + k * 2); const x = t + (S * 0.95) * u * u; const y = S * 0.95 * (1 - u) * (1 - u) + t * u; return leaf(x, y, S * 0.14, -45 + (i % 2 ? 60 : -30), c2 || c); }).join(''));
      case 'triangle': return svg(w, h, `<path d="M0 0 H${f(S * k)} L0 ${f(S * k)}Z" fill="${c}"/><path d="M0 0 H${f(S * k * 0.6)} L0 ${f(S * k * 0.6)}Z" fill="${c2 || c}" opacity=".6"/>`);
      case 'quarter': return svg(w, h, `<path d="M0 0 H${f(S * k)} A${f(S * k)} ${f(S * k)} 0 0 1 0 ${f(S * k)}Z" fill="${c}"/><path d="M0 0 H${f(S * k * 0.55)} A${f(S * k * 0.55)} ${f(S * k * 0.55)} 0 0 1 0 ${f(S * k * 0.55)}Z" fill="${c2 || c}" opacity=".7"/>`);
      case 'lines': { let out = ''; for (let i = 1; i <= 4 + k * 2; i++) out += stroke(`M0 ${f(i * S * 0.12)} L${f(i * S * 0.12)} 0`, c, t * 0.7); return svg(w, h, out); }
      case 'dots': { let out = ''; const st = S * 0.11; for (let y = st / 2; y < S; y += st) for (let x = st / 2; x < S - y; x += st) out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(st * 0.22 * k)}" fill="${c}"/>`; return svg(w, h, out); }
      case 'floral': return svg(w, h, [[0.18, 0.18, 0.16], [0.45, 0.12, 0.1], [0.12, 0.45, 0.1], [0.38, 0.38, 0.07]].map(([x, y, r], i) => flower(S * x, S * y, S * r * k, i % 2 ? c2 || c : c, i % 2 ? c : c2 || c)).join('') + leaf(S * 0.55, S * 0.2, S * 0.16, 10, c2 || c) + leaf(S * 0.2, S * 0.55, S * 0.16, 80, c2 || c));
      default: return svg(w, h, stroke(`M${f(t)} ${f(S * 0.6 * k)} V${f(t)} H${f(S * 0.6 * k)}`, c, t) + `<circle cx="${f(S * 0.2)}" cy="${f(S * 0.2)}" r="${f(t * 1.3)}" fill="${c2 || c}"/>`);
    }
  },

  // ---------- arrows ----------
  arrow(w, h, [c], s, id, p) {
    const a = ARROWS[p.type] || ARROWS.straight;
    const t = sw(w, h, p, 0.05);
    const pad = t * 2;
    const X = (u) => pad + u * (w - 2 * pad);
    const Y = (v) => pad + v * (h - 2 * pad);
    let d = a.d.replace(/(-?\d*\.?\d+) (-?\d*\.?\d+)/g, (_, x, y) => `${f(X(Number(x)))} ${f(Y(Number(y)))}`);
    if (p.type === 'circle') d = `M${f(X(0.85))} ${f(Y(0.5))} A${f((w - 2 * pad) * 0.35)} ${f((h - 2 * pad) * 0.4)} 0 1 1 ${f(X(0.7))} ${f(Y(0.18))}`;
    let out = stroke(d, c, t, dashAttr(p.style, t));
    const hs = Math.max(t * 3.2, Math.min(w, h) * 0.12);
    out += head(X(a.end[0]), Y(a.end[1]), a.end[2], a.end[3], hs, c);
    if (a.start) out += head(X(a.start[0]), Y(a.start[1]), a.start[2], a.start[3], hs, c);
    return svg(w, h, out);
  },

  // ---------- badges & ribbons ----------
  seal(w, h, [c, c2], s, id, p) {
    const S = Math.min(w, h);
    const n = p.points || 16;
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const r = (i % 2 ? (p.inner || 0.85) : 1) * S / 2;
      const a = (Math.PI * i) / n - Math.PI / 2;
      pts.push([w / 2 + r * Math.cos(a), h / 2 + r * Math.sin(a)]);
    }
    return svg(w, h, `<path d="${poly(pts)}Z" fill="${c}"/><circle cx="${f(w / 2)}" cy="${f(h / 2)}" r="${f(S * 0.36)}" fill="none" stroke="${c2 || '#fff'}" stroke-width="${f(S * 0.015)}" ${p.dashed ? `stroke-dasharray="${f(S * 0.03)} ${f(S * 0.02)}"` : ''}/>`);
  },
  rosette(w, h, [c, c2], s, id, p) {
    const S = Math.min(w, h * 0.75);
    const cx = w / 2;
    const cy = S / 2;
    const tail = (x) => `<path d="M${f(x - S * 0.12)} ${f(cy + S * 0.25)} L${f(x - S * 0.12)} ${f(h)} L${f(x)} ${f(h - S * 0.12)} L${f(x + S * 0.12)} ${f(h)} L${f(x + S * 0.12)} ${f(cy + S * 0.25)}Z" fill="${c2 || c}"/>`;
    let ring = '';
    const n = p.points || 20;
    const pts = [];
    for (let i = 0; i < n * 2; i++) { const r = (i % 2 ? 0.86 : 1) * S / 2; const a = (Math.PI * i) / n; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    ring = `<path d="${poly(pts)}Z" fill="${c}"/>`;
    return svg(w, h, tail(cx - S * 0.16) + tail(cx + S * 0.16) + ring + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(S * 0.34)}" fill="${c2 || c}"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(S * 0.28)}" fill="none" stroke="#fff" stroke-width="${f(S * 0.012)}"/>`);
  },
  banner(w, h, [c, c2], s, id, p) {
    const dark = c2 || c;
    const e = h * 0.7;
    switch (p.style) {
      case 'flat': return svg(w, h, `<path d="M0 0 H${f(w)} L${f(w - h * 0.35)} ${f(h / 2)} L${f(w)} ${f(h)} H0 L${f(h * 0.35)} ${f(h / 2)}Z" fill="${c}"/>`);
      case 'curved': return svg(w, h, `<path d="M0 ${f(h * 0.3)} Q${f(w / 2)} ${f(-h * 0.25)} ${f(w)} ${f(h * 0.3)} V${f(h * 0.95)} Q${f(w / 2)} ${f(h * 0.4)} 0 ${f(h * 0.95)}Z" fill="${c}"/>`);
      case 'wavy': { const top = sinePts(w, h, h * 0.08, 1.5, 0, h * 0.2); const bot = sinePts(w, h, h * 0.08, 1.5, 0, h * 0.8).reverse(); return svg(w, h, `<path d="${poly([...top, ...bot])}Z" fill="${c}"/>`); }
      case 'angled': return svg(w, h, `<path d="M${f(h * 0.4)} 0 H${f(w)} L${f(w - h * 0.4)} ${f(h)} H0Z" fill="${c}"/><path d="M0 ${f(h)} L${f(h * 0.4)} ${f(h * 0.75)} V${f(h)}Z" fill="${dark}"/>`);
      case 'tabs': return svg(w, h, `<path d="M0 ${f(h * 0.25)} H${f(e)} V${f(h)} H0 L${f(e * 0.4)} ${f(h * 0.62)}Z" fill="${dark}"/><path d="M${f(w)} ${f(h * 0.25)} H${f(w - e)} V${f(h)} H${f(w)} L${f(w - e * 0.4)} ${f(h * 0.62)}Z" fill="${dark}"/><rect x="${f(e * 0.5)}" y="0" width="${f(w - e)}" height="${f(h * 0.78)}" fill="${c}"/>`);
      default: return GRAPHICS.ribbon.draw(w, h, [c, dark]);
    }
  },
  tag(w, h, [c, c2], s, id, p) {
    const r = Math.min(w, h) * 0.08;
    const shapes = {
      price: `M0 ${f(h * 0.15)} Q0 0 ${f(h * 0.15)} 0 H${f(w * 0.72)} L${f(w)} ${f(h / 2)} L${f(w * 0.72)} ${f(h)} H${f(h * 0.15)} Q0 ${f(h)} 0 ${f(h * 0.85)}Z`,
      label: `M${f(h * 0.3)} 0 H${f(w - h * 0.3)} L${f(w)} ${f(h / 2)} L${f(w - h * 0.3)} ${f(h)} H${f(h * 0.3)} L0 ${f(h / 2)}Z`,
      pill: `M${f(h / 2)} 0 H${f(w - h / 2)} A${f(h / 2)} ${f(h / 2)} 0 0 1 ${f(w - h / 2)} ${f(h)} H${f(h / 2)} A${f(h / 2)} ${f(h / 2)} 0 0 1 ${f(h / 2)} 0Z`,
      flag: `M0 0 H${f(w)} L${f(w * 0.85)} ${f(h / 2)} L${f(w)} ${f(h)} H0Z`,
      bookmark: `M0 0 H${f(w)} V${f(h)} L${f(w / 2)} ${f(h * 0.75)} L0 ${f(h)}Z`,
    };
    const hole = p.shape === 'price' ? `<circle cx="${f(w * 0.8)}" cy="${f(h / 2)}" r="${f(r)}" fill="${c2 || '#fff'}"/>` : '';
    return svg(w, h, `<path d="${shapes[p.shape] || shapes.price}" fill="${c}"/>${hole}`);
  },
  ringlabel(w, h, [c, c2], s, id, p) {
    const S = Math.min(w, h);
    const t = S * 0.02;
    return svg(w, h, `<circle cx="${f(w / 2)}" cy="${f(h / 2)}" r="${f(S / 2 - t)}" fill="${p.filled ? c : 'none'}" stroke="${c}" stroke-width="${f(t * 2)}"/><circle cx="${f(w / 2)}" cy="${f(h / 2)}" r="${f(S * 0.38)}" fill="none" stroke="${p.filled ? c2 || '#fff' : c2 || c}" stroke-width="${f(t)}" ${p.dotted ? `stroke-dasharray="0.1 ${f(t * 2.5)}" stroke-linecap="round"` : ''}/>`);
  },
  shield(w, h, [c, c2], s, id, p) {
    const d = p.style === 'round' ? `M${f(w * 0.08)} 0 H${f(w * 0.92)} V${f(h * 0.5)} Q${f(w * 0.92)} ${f(h * 0.85)} ${f(w / 2)} ${f(h)} Q${f(w * 0.08)} ${f(h * 0.85)} ${f(w * 0.08)} ${f(h * 0.5)}Z` : `M${f(w / 2)} 0 L${f(w)} ${f(h * 0.15)} V${f(h * 0.5)} Q${f(w)} ${f(h * 0.85)} ${f(w / 2)} ${f(h)} Q0 ${f(h * 0.85)} 0 ${f(h * 0.5)} V${f(h * 0.15)}Z`;
    return svg(w, h, `<path d="${d}" fill="${c}"/><path d="${d}" fill="none" stroke="${c2 || '#fff'}" stroke-width="${f(Math.min(w, h) * 0.025)}" transform="translate(${f(w * 0.08)} ${f(h * 0.06)}) scale(.84 .86)"/>`);
  },

  // ---------- blobs & splashes ----------
  blob(w, h, [c, c2], seed, id, p) {
    const r = rng(seed);
    const n = p.n || 8;
    const pts = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const k = 0.7 + r() * 0.3;
      return [w / 2 + Math.cos(a) * (w / 2) * k, h / 2 + Math.sin(a) * (h / 2) * k];
    });
    const fill = c2 ? `url(#${id}g)` : c;
    return svg(w, h, `<path d="${smooth(pts, true)}" fill="${fill}"/>`, c2 ? `<linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${c2}"/></linearGradient>` : '');
  },
  splash(w, h, [c], seed) {
    const r = rng(seed);
    const n = 14;
    const pts = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const k = i % 2 ? 0.45 + r() * 0.15 : 0.75 + r() * 0.25;
      return [w / 2 + Math.cos(a) * (w / 2) * k, h / 2 + Math.sin(a) * (h / 2) * k];
    });
    let drops = '';
    for (let i = 0; i < 9; i++) { const a = r() * Math.PI * 2; const d = 0.8 + r() * 0.18; drops += `<circle cx="${f(w / 2 + Math.cos(a) * (w / 2) * d)}" cy="${f(h / 2 + Math.sin(a) * (h / 2) * d)}" r="${f(Math.min(w, h) * (0.01 + r() * 0.03))}" fill="${c}"/>`; }
    return svg(w, h, `<path d="${smooth(pts, true)}" fill="${c}"/>${drops}`);
  },
  brushstroke(w, h, [c], seed) { return GRAPHICS.brush.draw(w, h, [c], seed); },
  drips(w, h, [c], seed) {
    const r = rng(seed);
    let d = `M0 0 H${f(w)} V${f(h * 0.3)}`;
    const n = 7;
    for (let i = n; i > 0; i--) {
      const x1 = (w * i) / n;
      const x0 = (w * (i - 1)) / n;
      const len = h * (0.35 + r() * 0.6);
      const mid = (x0 + x1) / 2;
      const dw = (x1 - x0) * 0.22;
      d += ` L${f(mid + dw)} ${f(h * 0.3)} L${f(mid + dw)} ${f(len - dw)} A${f(dw)} ${f(dw)} 0 0 1 ${f(mid - dw)} ${f(len - dw)} L${f(mid - dw)} ${f(h * 0.3)} L${f(x0)} ${f(h * 0.3)}`;
    }
    return svg(w, h, `<path d="${d} Z" fill="${c}"/>`);
  },

  // ---------- patterns ----------
  pattern(w, h, [c, c2], seed, id, p) {
    const r = rng(seed);
    const S = Math.min(w, h);
    const st = S * (p.step || 0.08);
    let out = '';
    switch (p.kind) {
      case 'polka': for (let y = st / 2, row = 0; y < h; y += st, row++) for (let x = (row % 2 ? st : st / 2); x < w; x += st) out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(st * 0.18 * (p.fade ? 1 - y / h : 1))}" fill="${c}"/>`; break;
      case 'cluster': for (let i = 0; i < 120; i++) { const a = r() * Math.PI * 2; const d = Math.pow(r(), 0.6) * S / 2; out += `<circle cx="${f(w / 2 + Math.cos(a) * d)}" cy="${f(h / 2 + Math.sin(a) * d)}" r="${f(S * 0.012 * (1.2 - d / (S / 2)))}" fill="${i % 3 ? c : c2 || c}"/>`; } break;
      case 'rings': for (let i = 1; i <= (p.n || 6); i++) out += `<circle cx="${f(w / 2)}" cy="${f(h / 2)}" r="${f((S / 2) * (i / (p.n || 6)))}" fill="none" stroke="${i % 2 && c2 ? c2 : c}" stroke-width="${f(S * 0.012)}"/>`; break;
      case 'plus': for (let y = st / 2; y < h; y += st) for (let x = st / 2; x < w; x += st) out += stroke(`M${f(x - st * 0.18)} ${f(y)} H${f(x + st * 0.18)} M${f(x)} ${f(y - st * 0.18)} V${f(y + st * 0.18)}`, c, st * 0.07); break;
      case 'triangles': for (let i = 0; i < 26; i++) { const x = r() * w; const y = r() * h; const s2 = S * (0.03 + r() * 0.05); out += `<path d="M${f(x)} ${f(y - s2)} L${f(x + s2)} ${f(y + s2)} L${f(x - s2)} ${f(y + s2)}Z" fill="${i % 2 && c2 ? c2 : c}" transform="rotate(${f(r() * 360)} ${f(x)} ${f(y)})" opacity=".85"/>`; } break;
      case 'memphis': for (let i = 0; i < 30; i++) { const x = r() * w; const y = r() * h; const s2 = S * (0.03 + r() * 0.04); const k = i % 4; const col = i % 2 && c2 ? c2 : c; out += k === 0 ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(s2 * 0.6)}" fill="${col}"/>` : k === 1 ? stroke(poly(sinePts(s2 * 3, s2, s2 * 0.35, 1.5).map(([a, b]) => [a + x, b + y])), col, s2 * 0.25) : k === 2 ? `<path d="M${f(x)} ${f(y - s2)} L${f(x + s2)} ${f(y + s2)} L${f(x - s2)} ${f(y + s2)}Z" fill="none" stroke="${col}" stroke-width="${f(s2 * 0.22)}"/>` : stroke(`M${f(x - s2)} ${f(y)} H${f(x + s2)} M${f(x)} ${f(y - s2)} V${f(y + s2)}`, col, s2 * 0.25); } break;
      case 'hex': { const R = st * 0.6; for (let y = 0, row = 0; y < h + R; y += R * 1.5, row++) for (let x = row % 2 ? R * 0.87 : 0; x < w + R; x += R * 1.73) out += `<path d="${poly(Array.from({ length: 6 }, (_, i) => [x + R * Math.cos((Math.PI / 3) * i + Math.PI / 6), y + R * Math.sin((Math.PI / 3) * i + Math.PI / 6)]))}Z" fill="none" stroke="${c}" stroke-width="${f(R * 0.08)}"/>`; break; }
      case 'checker': for (let y = 0, row = 0; y < h; y += st, row++) for (let x = (row % 2) * st, col = 0; x < w; x += st * 2, col++) out += `<rect x="${f(x)}" y="${f(y)}" width="${f(st)}" height="${f(st)}" fill="${c}"/>`; break;
      case 'diagonal': for (let x = -h; x < w; x += st) out += stroke(`M${f(x)} ${f(h)} L${f(x + h)} 0`, c, st * 0.12); break;
      case 'crosshatch': for (let x = -h; x < w; x += st) out += stroke(`M${f(x)} ${f(h)} L${f(x + h)} 0`, c, st * 0.08) + stroke(`M${f(x)} 0 L${f(x + h)} ${f(h)}`, c2 || c, st * 0.08); break;
      case 'grid': for (let x = 0; x <= w; x += st) out += stroke(`M${f(x)} 0 V${f(h)}`, c, st * 0.05); for (let y = 0; y <= h; y += st) out += stroke(`M0 ${f(y)} H${f(w)}`, c, st * 0.05); break;
      case 'waves': for (let y = st; y < h; y += st) out += stroke(poly(sinePts(w, h, st * 0.22, Math.max(2, Math.round(w / (st * 2))), 0, y)), c, st * 0.08); break;
      default: for (let i = 0; i < 30; i++) out += `<circle cx="${f(r() * w)}" cy="${f(r() * h)}" r="${f(S * (0.02 + r() * 0.05))}" fill="none" stroke="${i % 2 && c2 ? c2 : c}" stroke-width="${f(S * 0.008)}"/>`;
    }
    return svg(w, h, out);
  },

  // ---------- festive ----------
  garland(w, h, colors, seed, id) { return GRAPHICS.garland.draw(w, h, colors, seed, id); },
  diyas(w, h, colors) { return GRAPHICS.diyas.draw(w, h, colors); },
  toran(w, h, [c, c2, c3]) {
    const n = Math.max(5, Math.round(w / (h * 0.55)));
    let out = stroke(`M0 ${f(h * 0.08)} H${f(w)}`, c3 || '#B45309', h * 0.05);
    for (let i = 0; i < n; i++) {
      const x = ((i + 0.5) * w) / n;
      out += `<path d="M${f(x)} ${f(h * 0.08)} C${f(x + h * 0.22)} ${f(h * 0.35)} ${f(x + h * 0.1)} ${f(h * 0.8)} ${f(x)} ${f(h * 0.95)} C${f(x - h * 0.1)} ${f(h * 0.8)} ${f(x - h * 0.22)} ${f(h * 0.35)} ${f(x)} ${f(h * 0.08)}Z" fill="${i % 2 ? c : c2 || c}"/>`;
      out += `<circle cx="${f(x)}" cy="${f(h * 0.1)}" r="${f(h * 0.06)}" fill="${c3 || '#F59E0B'}"/>`;
    }
    return svg(w, h, out);
  },
  rangoli(w, h, colors) { return GRAPHICS.rangoli.draw(w, h, colors); },
  fireworks(w, h, cols, seed) {
    const r = rng(seed);
    let out = '';
    for (let b = 0; b < 4; b++) {
      const cx = w * (0.15 + r() * 0.7);
      const cy = h * (0.15 + r() * 0.6);
      const R = Math.min(w, h) * (0.12 + r() * 0.12);
      const c = cols[b % cols.length];
      for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2; out += stroke(`M${f(cx + Math.cos(a) * R * 0.3)} ${f(cy + Math.sin(a) * R * 0.3)} L${f(cx + Math.cos(a) * R)} ${f(cy + Math.sin(a) * R)}`, c, Math.max(1, R * 0.03)) + `<circle cx="${f(cx + Math.cos(a) * R * 1.12)}" cy="${f(cy + Math.sin(a) * R * 1.12)}" r="${f(R * 0.035)}" fill="${c}"/>`; }
    }
    return svg(w, h, out);
  },
  lanterns(w, h, [c, c2, c3]) {
    const n = Math.max(3, Math.round(w / (h * 0.6)));
    let out = stroke(`M0 ${f(h * 0.05)} Q${f(w / 2)} ${f(h * 0.28)} ${f(w)} ${f(h * 0.05)}`, '#78350F', Math.max(1, h * 0.012));
    for (let i = 0; i < n; i++) {
      const x = ((i + 0.5) * w) / n;
      const t = (i + 0.5) / n;
      const y0 = h * 0.05 + Math.sin(Math.PI * t) * h * 0.115;
      const L = h * (0.45 + (i % 2) * 0.12);
      const lw = h * 0.22;
      out += stroke(`M${f(x)} ${f(y0)} V${f(y0 + L * 0.35)}`, '#78350F', Math.max(1, h * 0.01));
      out += `<rect x="${f(x - lw * 0.3)}" y="${f(y0 + L * 0.35)}" width="${f(lw * 0.6)}" height="${f(h * 0.04)}" fill="${c3 || '#B45309'}"/><ellipse cx="${f(x)}" cy="${f(y0 + L * 0.35 + h * 0.04 + lw * 0.6)}" rx="${f(lw / 2)}" ry="${f(lw * 0.6)}" fill="${i % 2 ? c : c2 || c}"/><rect x="${f(x - lw * 0.3)}" y="${f(y0 + L * 0.35 + h * 0.04 + lw * 1.15)}" width="${f(lw * 0.6)}" height="${f(h * 0.04)}" fill="${c3 || '#B45309'}"/>`;
    }
    return svg(w, h, out);
  },
  bunting(w, h, cols, s, id, p) {
    const n = Math.max(4, Math.round(w / (h * (p.size || 0.7))));
    const sag = h * 0.25;
    let out = stroke(`M0 ${f(h * 0.08)} Q${f(w / 2)} ${f(h * 0.08 + sag * 2)} ${f(w)} ${f(h * 0.08)}`, '#64748B', Math.max(1, h * 0.015));
    for (let i = 0; i < n; i++) {
      const t0 = i / n;
      const t1 = (i + 0.85) / n;
      const yy = (t) => h * 0.08 + 4 * sag * t * (1 - t) * 0.5 * 2;
      const x0 = t0 * w;
      const x1 = t1 * w;
      const tip = p.shape === 'square' ? `L${f(x1)} ${f(yy(t1) + h * 0.55)} L${f(x0)} ${f(yy(t0) + h * 0.55)}` : `L${f((x0 + x1) / 2)} ${f(Math.max(yy(t0), yy(t1)) + h * 0.6)}`;
      out += `<path d="M${f(x0)} ${f(yy(t0))} L${f(x1)} ${f(yy(t1))} ${tip}Z" fill="${cols[i % cols.length]}"/>`;
    }
    return svg(w, h, out);
  },
  balloons(w, h, colors, seed) { return GRAPHICS.balloons.draw(w, h, colors, seed); },

  // ---------- bursts & rays ----------
  rays(w, h, [c, c2], s, id, p) {
    const n = p.n || 24;
    const cx = w / 2;
    const cy = p.from === 'bottom' ? h : h / 2;
    const R = Math.hypot(w, h);
    let out = '';
    const span = p.from === 'bottom' ? Math.PI : Math.PI * 2;
    const start = p.from === 'bottom' ? Math.PI : 0;
    for (let i = 0; i < n; i++) {
      const a1 = start + (i / n) * span;
      const a2 = start + ((i + (p.thin ? 0.2 : 0.5)) / n) * span;
      out += `<path d="M${f(cx)} ${f(cy)} L${f(cx + Math.cos(a1) * R)} ${f(cy + Math.sin(a1) * R)} L${f(cx + Math.cos(a2) * R)} ${f(cy + Math.sin(a2) * R)}Z" fill="${i % 2 && c2 ? c2 : c}" opacity="${p.op || 0.3}"/>`;
    }
    return svg(w, h, out);
  },
  beams(w, h, [c], seed, id, p) {
    const r = rng(seed);
    let out = '';
    for (let i = 0; i < (p.n || 5); i++) {
      const x = w * (0.1 + r() * 0.8);
      const bw = w * (0.05 + r() * 0.1);
      out += `<path d="M${f(x - bw * 0.2)} 0 L${f(x + bw * 0.2)} 0 L${f(x + bw * 2)} ${f(h)} L${f(x - bw * 2)} ${f(h)}Z" fill="url(#${id}b)" />`;
    }
    return svg(w, h, out, `<linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient>`);
  },
  radiate(w, h, [c], s, id, p) {
    const n = p.n || 36;
    const R = Math.min(w, h) / 2;
    let out = '';
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const r0 = R * (i % 2 ? 0.55 : 0.4); out += stroke(`M${f(w / 2 + Math.cos(a) * r0)} ${f(h / 2 + Math.sin(a) * r0)} L${f(w / 2 + Math.cos(a) * R)} ${f(h / 2 + Math.sin(a) * R)}`, c, Math.max(1, R * 0.02)); }
    return svg(w, h, out);
  },
  comic(w, h, [c, c2], seed, id, p) {
    const r = rng(seed);
    const n = p.n || 14;
    const pts = [];
    for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2; const k = i % 2 ? 0.62 + r() * 0.08 : 0.9 + r() * 0.1; pts.push([w / 2 + Math.cos(a) * (w / 2) * k, h / 2 + Math.sin(a) * (h / 2) * k]); }
    return svg(w, h, `<path d="${poly(pts)}Z" fill="${c}" stroke="${c2 || '#111'}" stroke-width="${f(Math.min(w, h) * 0.02)}" stroke-linejoin="round"/>`);
  },

  // ---------- floral ----------
  sprig(w, h, [c, c2], s, id, p) {
    const n = p.n || 6;
    const t = Math.max(1, Math.min(w, h) * 0.015);
    let out = stroke(`M${f(w * 0.05)} ${f(h * 0.95)} Q${f(w * 0.5)} ${f(h * (p.bend || 0.5))} ${f(w * 0.95)} ${f(h * 0.05)}`, c, t);
    for (let i = 1; i <= n; i++) {
      const u = i / (n + 1);
      const x = (1 - u) * (1 - u) * w * 0.05 + 2 * (1 - u) * u * w * 0.5 + u * u * w * 0.95;
      const y = (1 - u) * (1 - u) * h * 0.95 + 2 * (1 - u) * u * h * (p.bend || 0.5) + u * u * h * 0.05;
      out += leaf(x, y, Math.min(w, h) * 0.18, -45 + (i % 2 ? -50 : 50), c2 || c);
    }
    if (p.flower) out += flower(w * 0.95, h * 0.05, Math.min(w, h) * 0.1, c2 || c, c);
    return svg(w, h, out);
  },
  laurel(w, h, colors) { return GRAPHICS.laurel.draw(w, h, colors); },
  flowers(w, h, cols, seed) {
    const r = rng(seed);
    let out = '';
    for (let i = 0; i < 14; i++) out += flower(r() * w, r() * h, Math.min(w, h) * (0.03 + r() * 0.05), cols[i % cols.length], cols[(i + 1) % cols.length]);
    return svg(w, h, out);
  },
  vine(w, h, [c, c2], s, id, p) {
    const pts = sinePts(w, h, h * 0.18, p.waves || 3, 0, h / 2, 2);
    let out = stroke(poly(pts), c, Math.max(1, h * 0.04));
    pts.filter((_, i) => i % 9 === 4).forEach(([x, y], i) => { out += leaf(x, y, h * 0.4, i % 2 ? -60 : 60 + 180, c2 || c); });
    return svg(w, h, out);
  },

  // ---------- stars, hearts, sparkles ----------
  scatter(w, h, cols, seed, id, p) {
    const r = rng(seed);
    let out = '';
    for (let i = 0; i < (p.n || 18); i++) {
      const x = r() * w;
      const y = r() * h;
      const s2 = Math.min(w, h) * (0.04 + r() * 0.07);
      const c = cols[i % cols.length];
      out += p.kind === 'heart' ? heart(x, y, s2, c) : p.kind === 'sparkle' ? star4(x, y, s2 / 2, c) : star(x, y, s2, c);
    }
    return svg(w, h, out);
  },
  twinkle(w, h, [c, c2]) { return svg(w, h, star4(w / 2, h / 2, Math.min(w, h) / 2, c) + star4(w * 0.2, h * 0.2, Math.min(w, h) * 0.12, c2 || c)); },

  // ---------- speech bubbles ----------
  bubble(w, h, [c, c2], s, id, p) {
    const t = Math.max(1.5, Math.min(w, h) * 0.02);
    const right = p.side === 'right';
    const bh = h * 0.78;
    const tx = right ? w * 0.72 : w * 0.28;
    const tw = w * 0.06;
    const tipx = right ? tx + w * 0.1 : tx - w * 0.1;
    if (p.kind === 'thought') {
      const blobs = [[0.3, 0.4, 0.26], [0.55, 0.32, 0.28], [0.72, 0.47, 0.24], [0.45, 0.56, 0.26]].map(([x, y, r2]) => `<ellipse cx="${f(w * x)}" cy="${f(bh * y)}" rx="${f(w * r2)}" ry="${f(bh * r2 * 1.1)}" fill="${c}"/>`).join('');
      return svg(w, h, blobs + `<circle cx="${f(tx)}" cy="${f(bh * 0.97)}" r="${f(Math.min(w, h) * 0.05)}" fill="${c}"/><circle cx="${f(tipx)}" cy="${f(h * 0.93)}" r="${f(Math.min(w, h) * 0.03)}" fill="${c}"/>`);
    }
    if (p.kind === 'shout') return FAMILIES.comic(w, h, [c, c2 || '#111'], 3, id, { n: 12 });
    const r = p.kind === 'rect' ? Math.min(w, h) * 0.06 : Math.min(w * 0.45, bh * 0.45);
    const d = `M${f(r)} ${f(t)} H${f(w - r)} Q${f(w - t)} ${f(t)} ${f(w - t)} ${f(r)} V${f(bh - r)} Q${f(w - t)} ${f(bh)} ${f(w - r)} ${f(bh)} H${f(tx + tw)} L${f(tipx)} ${f(h - t)} L${f(tx - tw)} ${f(bh)} H${f(r)} Q${f(t)} ${f(bh)} ${f(t)} ${f(bh - r)} V${f(r)} Q${f(t)} ${f(t)} ${f(r)} ${f(t)}Z`;
    return svg(w, h, `<path d="${d}" fill="${c}" stroke="${c2 || 'none'}" stroke-width="${f(c2 ? t : 0)}" stroke-linejoin="round"/>`);
  },

  // ---------- wave bands & swooshes ----------
  waveband(w, h, cols, s, id, p) {
    const n = p.layers || 2;
    let out = '';
    for (let i = 0; i < n; i++) {
      const y = h * (0.15 + (i * 0.6) / n);
      const pts = sinePts(w, h, h * 0.1 * (p.amp || 1), p.waves || 1.2, i * 0.9, y);
      out += `<path d="${poly(pts)} L${f(w)} ${f(h)} L0 ${f(h)}Z" fill="${cols[i % cols.length]}" opacity="${i === n - 1 ? 1 : 0.55 + i * 0.15}"/>`;
    }
    return svg(w, h, p.top ? `<g transform="translate(0 ${f(h)}) scale(1 -1)">${out}</g>` : out);
  },
  swooshes(w, h, cols, s, id, p) {
    const n = p.n || 3;
    let out = '';
    for (let i = 0; i < n; i++) {
      const k = 1 - i * (0.7 / n);
      out += `<path d="M0 ${f(h)} V${f(h * (1 - k))} C${f(w * 0.3 * k)} ${f(h * (1 - k * 0.4))} ${f(w * 0.7 * k)} ${f(h)} ${f(w * k)} ${f(h)}Z" fill="${cols[i % cols.length]}"/>`;
    }
    return svg(w, h, out);
  },
};

// ---------- the preset list ----------
const PALS = [['#2F5BFF', '#93C5FD'], ['#EC4899', '#FBCFE8'], ['#F59E0B', '#FDE68A'], ['#10B981', '#A7F3D0'], ['#111827', '#9CA3AF'], ['#7C3AED', '#C4B5FD'], ['#EF4444', '#FCA5A5'], ['#0EA5E9', '#BAE6FD'], ['#D4A017', '#FFF3B0'], ['#E85D04', '#138808']];
const FEST = [['#FF8C00', '#FFC300', '#2E7D32'], ['#E91E63', '#FFC107', '#43A047'], ['#FF5722', '#FFEB3B', '#1B5E20'], ['#F44336', '#FF9800', '#4CAF50']];
const MULTI = [['#F59E0B', '#EC4899', '#3B82F6'], ['#EF4444', '#10B981', '#FACC15'], ['#7C3AED', '#22D3EE', '#F472B6'], ['#FF9933', '#FFFFFF', '#138808']];

const LEGACY_CATS = ['Curves & lines', 'Dividers', 'Frames & borders', 'Corners', 'Arrows', 'Badges & ribbons', 'Blobs & splashes', 'Patterns', 'Festive', 'Bursts & rays', 'Floral', 'Stars & hearts', 'Speech bubbles', 'Waves & swooshes'];

const presets = [];
let pi = 0;
// size: page | wide | square | corner | tall | bubble | banner
const add = (cat, family, name, params, colors, size) => {
  presets.push({ key: `${family}-${presets.length}`, cat, family, name, params, colors: colors || PALS[pi++ % PALS.length], size, seed: presets.length * 7919 + 13 });
};

// Curves & lines
for (const waves of [2, 3, 5, 8]) for (const amp of [0.25, 0.5, 0.9]) for (const style of ['single', 'double', 'dashed']) add('Curves & lines', 'wave', `Wavy line · ${waves} waves${style === 'single' ? '' : ` · ${style}`}`, { waves, amp, style }, null, 'wide');
for (const teeth of [4, 8, 14]) for (const amp of [0.4, 0.8]) for (const style of ['single', 'double']) add('Curves & lines', 'zigzag', `Zigzag · ${teeth} points${style === 'double' ? ' · double' : ''}`, { teeth, amp, style }, null, 'wide');
for (const shape of Object.keys(UNIT_CURVES)) for (const swk of [1, 2]) for (const dots of [false, true]) add('Curves & lines', 'curve', `${shape[0].toUpperCase() + shape.slice(1)} curve${swk === 2 ? ' · bold' : ''}${dots ? ' · dot ends' : ''}`, { shape, sw: swk, dots }, null, 'banner');
for (const shape of Object.keys(UNIT_CURVES)) add('Curves & lines', 'curve', `${shape[0].toUpperCase() + shape.slice(1)} curve · dashed`, { shape, style: 'dashed' }, null, 'banner');
for (const turns of [2, 3, 4]) for (const swk of [1, 2]) add('Curves & lines', 'spiral', `Spiral · ${turns} turns${swk === 2 ? ' · bold' : ''}`, { turns, sw: swk }, null, 'square');
for (const loops of [3, 5, 7]) for (const swk of [1, 2]) add('Curves & lines', 'loops', `Loopy line · ${loops} loops${swk === 2 ? ' · bold' : ''}`, { loops, sw: swk }, null, 'wide');
for (let i = 0; i < 12; i++) add('Curves & lines', 'scribble', `Scribble ${i + 1}`, {}, null, 'banner');
for (const waves of [1, 2, 3]) for (const dot of [0.04, 0.06, 0.09]) add('Curves & lines', 'dotwave', `Dotted wave · ${waves}${dot > 0.06 ? ' · big dots' : ''}`, { waves, dot }, null, 'wide');
for (const lines of [2, 3, 5]) for (const waves of [1, 2.5]) add('Curves & lines', 'parallel', `Parallel curves · ${lines} lines`, { lines, waves }, null, 'banner');
for (const [waves, phase, amp] of [[0.5, 0, 1], [1, 0, 1], [1, Math.PI, 1], [1.5, 0, 0.7], [0.5, Math.PI, 1.3], [2, 0, 0.6]]) add('Curves & lines', 'taper', `Tapered stroke · ${waves}`, { waves, phase, amp }, null, 'banner');

// Dividers
for (const line of ['single', 'double', 'dashed', 'dotted', 'thickthin']) for (const orn of ['none', 'diamond', 'dot', 'dots', 'flower', 'heart', 'star', 'leaf', 'ring']) add('Dividers', 'divider', `Divider · ${line}${orn === 'none' ? '' : ` · ${orn}`}`, { line, orn }, null, 'divider');

// Frames & borders
for (const style of ['single', 'double', 'dashed', 'dotted', 'rounded', 'thickthin', 'scallop', 'wavy', 'brackets', 'ticket', 'inset', 'deco', 'gap', 'stamp']) for (const swk of [1, 2.2]) add('Frames & borders', 'frame', `Frame · ${style}${swk > 1 ? ' · bold' : ''}`, { style, sw: swk }, null, 'page');

// Corners
for (const style of ['swirl', 'leaf', 'triangle', 'quarter', 'lines', 'dots', 'floral', 'bracket']) for (const k of [0.7, 1, 1.3]) add('Corners', 'corner', `Corner · ${style}${k !== 1 ? (k > 1 ? ' · large' : ' · small') : ''}`, { style, k }, null, 'corner');

// Arrows
for (const type of Object.keys(ARROWS)) for (const style of ['plain', 'bold', 'dashed']) add('Arrows', 'arrow', `Arrow · ${type}${style === 'plain' ? '' : ` · ${style}`}`, { type, style: style === 'dashed' ? 'dashed' : 'single', sw: style === 'bold' ? 2 : 1 }, null, 'banner');

// Badges & ribbons
for (const points of [8, 12, 16, 20, 24, 32]) for (const inner of [0.78, 0.9]) add('Badges & ribbons', 'seal', `Seal badge · ${points} points`, { points, inner, dashed: points % 8 === 0 }, null, 'square');
for (const points of [16, 20, 24, 30]) add('Badges & ribbons', 'rosette', `Award rosette · ${points}`, { points }, null, 'tall');
for (const style of ['flat', 'curved', 'wavy', 'angled', 'tabs']) for (let v = 0; v < 2; v++) add('Badges & ribbons', 'banner', `Ribbon banner · ${style}`, { style }, null, 'ribbon');
for (const shape of ['price', 'label', 'pill', 'flag', 'bookmark']) add('Badges & ribbons', 'tag', `Tag · ${shape}`, { shape }, null, shape === 'bookmark' ? 'tall' : 'ribbon');
for (const [filled, dotted] of [[false, false], [false, true], [true, false], [true, true]]) add('Badges & ribbons', 'ringlabel', `Circle label${filled ? ' · filled' : ''}${dotted ? ' · dotted' : ''}`, { filled, dotted }, null, 'square');
for (const style of ['round', 'pointed']) for (let v = 0; v < 2; v++) add('Badges & ribbons', 'shield', `Shield · ${style}`, { style }, null, 'tall');

// Blobs & splashes
for (let i = 0; i < 16; i++) add('Blobs & splashes', 'blob', `Blob ${i + 1}${i % 3 === 2 ? ' · gradient' : ''}`, { n: 6 + (i % 4) }, i % 3 === 2 ? [PALS[i % PALS.length][0], PALS[(i + 3) % PALS.length][0]] : [PALS[i % PALS.length][0]], 'square');
for (let i = 0; i < 12; i++) add('Blobs & splashes', 'splash', `Paint splash ${i + 1}`, {}, [PALS[i % PALS.length][0]], 'square');
for (let i = 0; i < 8; i++) add('Blobs & splashes', 'brushstroke', `Brush stroke ${i + 1}`, {}, [PALS[i % PALS.length][0]], 'banner');
for (let i = 0; i < 4; i++) add('Blobs & splashes', 'drips', `Paint drips ${i + 1}`, {}, [PALS[i % PALS.length][0]], 'wide2');

// Patterns
for (const step of [0.05, 0.08, 0.12, 0.16]) for (const fade of [false, true]) add('Patterns', 'pattern', `Polka dots${fade ? ' · fading' : ''}`, { kind: 'polka', step, fade }, null, 'page');
for (let i = 0; i < 4; i++) add('Patterns', 'pattern', `Dot cluster ${i + 1}`, { kind: 'cluster' }, null, 'square');
for (const n of [4, 6, 9, 14]) add('Patterns', 'pattern', `Concentric rings · ${n}`, { kind: 'rings', n }, null, 'square');
for (const step of [0.06, 0.09, 0.13, 0.18]) add('Patterns', 'pattern', 'Plus signs', { kind: 'plus', step }, null, 'page');
for (let i = 0; i < 4; i++) add('Patterns', 'pattern', `Triangles scatter ${i + 1}`, { kind: 'triangles' }, null, 'page');
for (let i = 0; i < 8; i++) add('Patterns', 'pattern', `Memphis shapes ${i + 1}`, { kind: 'memphis' }, MULTI[i % MULTI.length], 'page');
for (const step of [0.08, 0.12, 0.18]) add('Patterns', 'pattern', 'Honeycomb', { kind: 'hex', step }, null, 'page');
for (const step of [0.06, 0.1]) add('Patterns', 'pattern', 'Checks', { kind: 'checker', step }, null, 'page');
for (const step of [0.03, 0.05, 0.08, 0.12]) add('Patterns', 'pattern', 'Diagonal lines', { kind: 'diagonal', step }, null, 'page');
for (const step of [0.05, 0.09]) add('Patterns', 'pattern', 'Crosshatch', { kind: 'crosshatch', step }, null, 'page');
for (const step of [0.05, 0.08, 0.12]) add('Patterns', 'pattern', 'Grid lines', { kind: 'grid', step }, null, 'page');
for (const step of [0.06, 0.1, 0.15]) add('Patterns', 'pattern', 'Wave lines', { kind: 'waves', step }, null, 'page');
for (let i = 0; i < 4; i++) add('Patterns', 'pattern', `Circles scatter ${i + 1}`, { kind: 'circles' }, null, 'page');

// Festive
FEST.forEach((c, i) => { add('Festive', 'garland', `Marigold garland ${i + 1}`, {}, c, 'garland'); add('Festive', 'garland', `Marigold toran ${i + 1} · short`, {}, c, 'garland2'); });
for (let i = 0; i < 3; i++) add('Festive', 'diyas', `Diya row ${i + 1}`, {}, [['#F59E0B', '#B45309', '#FDE68A'], ['#FB923C', '#9A3412', '#FEF3C7'], ['#FACC15', '#A16207', '#FFF7ED']][i], ['strip', 'strip2', 'strip3'][i]);
FEST.forEach((c, i) => add('Festive', 'toran', `Mango leaf toran ${i + 1}`, {}, ['#2E7D32', '#43A047', c[0]], 'garland'));
for (let i = 0; i < 6; i++) add('Festive', 'rangoli', `Rangoli ${i + 1}`, {}, [FEST[i % 4][0], FEST[(i + 1) % 4][1], MULTI[i % 4][2]], 'square');
for (let i = 0; i < 6; i++) add('Festive', 'fireworks', `Fireworks ${i + 1}`, {}, MULTI[i % MULTI.length], 'page');
for (let i = 0; i < 4; i++) add('Festive', 'lanterns', `Hanging lanterns ${i + 1}`, {}, [['#EF4444', '#F59E0B', '#B45309'], ['#DC2626', '#FACC15', '#78350F'], ['#E11D48', '#FB923C', '#92400E'], ['#F43F5E', '#FDE047', '#B45309']][i], 'garland');
for (let i = 0; i < 6; i++) add('Festive', 'bunting', `Bunting flags ${i + 1}`, { shape: i % 2 ? 'square' : 'triangle', size: i < 4 ? 0.7 : 1 }, MULTI[i % MULTI.length], 'garland');
for (let i = 0; i < 4; i++) add('Festive', 'balloons', `Balloon bunch ${i + 1}`, {}, MULTI[i % MULTI.length], 'square');
for (const k of Object.keys(GRAPHICS).filter((x) => ['sunburst', 'glow', 'mandala', 'bokeh', 'sparkles', 'petals', 'halftone', 'stripes', 'streaks', 'arcs', 'ornate', 'flag', 'swoosh', 'waves', 'ribbon', 'brush', 'laurel', 'confetti'].includes(x))) {
  presets.push({ key: `classic-${k}`, cat: k === 'ornate' ? 'Frames & borders' : ['flag', 'confetti', 'petals'].includes(k) ? 'Festive' : ['sunburst', 'glow', 'streaks'].includes(k) ? 'Bursts & rays' : ['swoosh', 'waves'].includes(k) ? 'Waves & swooshes' : k === 'ribbon' ? 'Badges & ribbons' : k === 'laurel' ? 'Floral' : k === 'brush' ? 'Blobs & splashes' : k === 'sparkles' ? 'Stars & hearts' : 'Patterns', family: k, classic: true, name: GRAPHICS[k].name, params: {}, colors: GRAPHICS[k].colors.map((c) => (c === '#FFFFFF' ? '#2F5BFF' : c)), size: ['ornate', 'sunburst', 'glow', 'bokeh', 'sparkles', 'petals', 'halftone', 'stripes', 'streaks', 'arcs', 'confetti'].includes(k) ? 'page' : k === 'flag' ? 'banner' : ['swoosh', 'waves'].includes(k) ? 'band' : k === 'ribbon' ? 'ribbon' : 'square' });
}

// Bursts & rays
for (const n of [12, 16, 24, 36, 48]) for (const thin of [false, true]) add('Bursts & rays', 'rays', `Sun rays · ${n}${thin ? ' · thin' : ''}`, { n, thin }, null, 'page');
for (const n of [10, 16, 24, 32, 40]) add('Bursts & rays', 'rays', `Rising rays · ${n}`, { n, from: 'bottom' }, null, 'page');
for (let i = 0; i < 5; i++) add('Bursts & rays', 'beams', `Light beams ${i + 1}`, { n: 3 + i }, [['#FFFFFF', '#FDE68A', '#FEF3C7', '#E0F2FE', '#FCE7F3'][i]], 'page');
for (const n of [24, 36, 48, 60, 72]) add('Bursts & rays', 'radiate', `Radiating lines · ${n}`, { n }, null, 'square');
for (const n of [10, 12, 14, 16, 20]) add('Bursts & rays', 'comic', `Comic burst · ${n}`, { n }, [PALS[n % PALS.length][0], '#111111'], 'square');

// Floral
for (const n of [4, 6, 8]) for (const flower of [false, true]) add('Floral', 'sprig', `Leaf sprig · ${n} leaves${flower ? ' · flower' : ''}`, { n, flower }, [['#15803D', '#22C55E'], ['#166534', '#F472B6'], ['#14532D', '#FACC15']][n % 3], 'square');
for (const bend of [0.2, 0.5, 0.8]) for (const n of [5, 9]) add('Floral', 'sprig', `Curved branch · ${n}`, { n, bend }, [['#78350F', '#16A34A'], ['#7C2D12', '#65A30D']][n % 2], 'banner');
for (let i = 0; i < 6; i++) add('Floral', 'laurel', `Laurel wreath ${i + 1}`, {}, [['#D4A017', '#15803D', '#111827', '#B45309', '#FFFFFF', '#7C3AED'][i]], 'square');
for (let i = 0; i < 6; i++) add('Floral', 'flowers', `Flower scatter ${i + 1}`, {}, MULTI[i % MULTI.length], 'page');
for (const waves of [2, 3, 4, 5, 6, 8]) add('Floral', 'vine', `Vine border · ${waves}`, { waves }, [['#15803D', '#22C55E'], ['#166534', '#4ADE80']][waves % 2], 'wide');

// Stars & hearts
for (let i = 0; i < 5; i++) add('Stars & hearts', 'scatter', `Star scatter ${i + 1}`, { kind: 'star', n: 12 + i * 4 }, MULTI[i % MULTI.length], 'page');
for (let i = 0; i < 5; i++) add('Stars & hearts', 'scatter', `Heart scatter ${i + 1}`, { kind: 'heart', n: 12 + i * 4 }, [['#EF4444', '#F472B6', '#FDA4AF'], ['#E11D48', '#FB7185', '#FECDD3'], ['#DB2777', '#F9A8D4', '#BE185D']][i % 3], 'page');
for (let i = 0; i < 5; i++) add('Stars & hearts', 'scatter', `Sparkle scatter ${i + 1}`, { kind: 'sparkle', n: 14 + i * 4 }, [['#FACC15', '#FFFFFF', '#FDE68A'], ['#F59E0B', '#FEF3C7', '#FFFFFF']][i % 2], 'page');
for (let i = 0; i < 5; i++) add('Stars & hearts', 'twinkle', `Twinkle ${i + 1}`, {}, [PALS[i][0], PALS[i][1]], 'square');

// Speech bubbles
for (const kind of ['round', 'rect', 'thought', 'shout']) for (const side of ['left', 'right']) for (const v of [0, 1]) add('Speech bubbles', 'bubble', `Speech bubble · ${kind} · ${side}`, { kind, side }, v ? ['#FFFFFF', '#111111'] : [PALS[(pi + 3) % PALS.length][0]], 'bubble');

// Waves & swooshes
for (const layers of [1, 2, 3]) for (const amp of [0.6, 1.4]) for (const top of [false, true]) add('Waves & swooshes', 'waveband', `Wave band · ${layers} layer${layers > 1 ? 's' : ''}${top ? ' · top' : ''}`, { layers, amp, top, waves: amp > 1 ? 1 : 1.6 }, [PALS[pi % PALS.length][0], PALS[pi % PALS.length][1], PALS[(pi + 1) % PALS.length][0]], top ? 'bandTop' : 'band');
for (let i = 0; i < 8; i++) add('Waves & swooshes', 'swooshes', `Corner swoosh ${i + 1}`, { n: 2 + (i % 3) }, i % 4 === 3 ? ['#FF9933', '#FFFFFF', '#138808'] : [PALS[i % PALS.length][0], PALS[(i + 2) % PALS.length][1], PALS[(i + 5) % PALS.length][0]], 'band');

// The first library (curves, lines, badges…) is no longer offered, but designs that use it still draw
Object.assign(FAMILIES, ORNAMENTS);
const LEGACY_PRESETS = presets;
const CLASSIC_SIZE = { garland: 'garland', diyas: 'strip', flag: 'banner', swoosh: 'band', waves: 'band', ribbon: 'ribbon', brush: 'banner', balloons: 'square', laurel: 'square', mandala: 'square', rangoli: 'square' };
const CLASSIC_PRESETS = Object.keys(GRAPHICS).map((k) => ({ key: `classic-${k}`, cat: 'Originals', family: k, classic: true, name: GRAPHICS[k].name, params: {}, colors: GRAPHICS[k].colors, size: CLASSIC_SIZE[k] || 'page', seed: 7 }));
export const GRAPHIC_PRESETS = [...CLASSIC_PRESETS, ...ORNAMENT_PRESETS];
export const GRAPHIC_CATS = ['Originals', ...ORNAMENT_CATS];
const ALL = [...GRAPHIC_PRESETS, ...LEGACY_PRESETS];
export const findPreset = (key) => ALL.find((x) => x.key === key);
export const LEGACY_COUNT = LEGACY_PRESETS.length + LEGACY_CATS.length * 0;

// Where and how big a preset lands on the page
export function presetBox(preset, W, H) {
  const D = Math.min(W, H);
  const r = Math.round;
  const box = {
    page: [0, 0, W, H], wide: [W * 0.1, H / 2 - D * 0.06, W * 0.8, D * 0.12], banner: [W * 0.2, H / 2 - D * 0.15, W * 0.6, D * 0.3],
    divider: [W * 0.15, H / 2 - D * 0.04, W * 0.7, D * 0.08], square: [W / 2 - D * 0.25, H / 2 - D * 0.25, D * 0.5, D * 0.5],
    corner: [0, 0, D * 0.35, D * 0.35], tall: [W / 2 - D * 0.18, H / 2 - D * 0.25, D * 0.36, D * 0.5], bubble: [W / 2 - D * 0.3, H / 2 - D * 0.22, D * 0.6, D * 0.44],
    ribbon: [W * 0.15, H / 2 - D * 0.07, W * 0.7, D * 0.14], garland: [0, 0, W, D * 0.16], garland2: [0, 0, W, D * 0.1], strip: [W * 0.1, H - D * 0.18, W * 0.8, D * 0.12],
    strip2: [W * 0.15, H - D * 0.16, W * 0.7, D * 0.1], strip3: [W * 0.05, H - D * 0.2, W * 0.9, D * 0.14], band: [0, H * 0.65, W, H * 0.35], bandTop: [0, 0, W, H * 0.3],
    wide2: [0, 0, W, D * 0.3], garlandTall: [0, 0, W, D * 0.3], arch: [W / 2 - D * 0.3, H / 2 - D * 0.4, D * 0.6, D * 0.8],
  }[preset.size] || [W / 2 - D * 0.25, H / 2 - D * 0.25, D * 0.5, D * 0.5];
  return box.map(r);
}

// Preview proportions for the panel
export const PREVIEW_RATIO = { page: 0.75, wide: 0.25, banner: 0.45, divider: 0.15, square: 1, corner: 1, tall: 1.3, bubble: 0.75, ribbon: 0.25, garland: 0.2, garland2: 0.14, strip: 0.2, strip2: 0.18, strip3: 0.22, band: 0.45, bandTop: 0.45, wide2: 0.35, garlandTall: 0.3, arch: 1.3 };

// Draw any graphic element: library families use their params; the original graphics are drawn as before
export function renderGraphic(el) {
  const fam = FAMILIES[el.graphic];
  const base = fam ? null : GRAPHICS[el.graphic] || GRAPHICS.sparkles;
  const defaults = fam ? (findPreset(el.preset)?.colors || []) : base.colors;
  const n = Math.max(defaults.length, (el.colors || []).length, 1);
  const colors = Array.from({ length: n }, (_, i) => (el.colors && el.colors[i]) || defaults[i] || defaults[0] || '#2F5BFF');
  const id = `gr${String(el.id).replace(/[^a-z0-9]/gi, '')}`;
  const w = Math.max(1, el.w);
  const h = Math.max(1, el.h);
  return fam ? fam(w, h, colors, el.seed || 7, id, el.params || {}) : base.draw(w, h, colors, el.seed || 7, id);
}
