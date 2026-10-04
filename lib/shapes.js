// Curved section shapes. EDGES sit on the top or bottom of a section (viewBox 0 0 1200 120, the
// filled part is below the curve and takes the colour of whatever comes next). DECOR are
// background shapes placed in a section's corners (viewBox 0 0 200 200).

const W = 1200;
const H = 120;
const r1 = (n) => Math.round(n * 10) / 10;
const pt = ([x, y]) => `${r1(x)},${r1(y)}`;

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Catmull-Rom spline through the points, as cubic Bézier segments
function spline(pts) {
  let d = `M${pt(pts[0])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return d;
}

function splineClosed(pts) {
  const n = pts.length;
  let d = `M${pt(pts[0])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    d += ` C${pt([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6])} ${pt([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6])} ${pt(p2)}`;
  }
  return d + ' Z';
}

const close = (d) => `${d} L${W},${H} L0,${H} Z`;
const curveFn = (fn, steps = 48) => close(spline(Array.from({ length: steps + 1 }, (_, i) => [(W * i) / steps, fn(i / steps)])));
const sine = (freq, amp, base = 60, phase = 0) => (t) => base + amp * Math.sin(2 * Math.PI * freq * t + phase);
const smoothstep = (t) => t * t * (3 - 2 * t);

const EDGE_LIST = [];
const edge = (key, name, group, layers) => EDGE_LIST.push({ key, name, group, layers: typeof layers === 'string' ? [{ d: layers }] : layers });
const layered = (ds, ops = [0.3, 0.55, 1]) => ds.map((d, i) => ({ d, o: ops[ops.length - ds.length + i] }));

// Waves
[[1, 'Gentle'], [1.5, 'Rolling'], [2, 'Double'], [3, 'Triple'], [4, 'Busy'], [6, 'Choppy']].forEach(([f, label]) => {
  edge(`wave-${f}`.replace('.', '_'), `${label} wave`, 'Waves', curveFn(sine(f, 22, 60, Math.PI / 2), Math.max(32, f * 16)));
  edge(`wave-${f}-tall`.replace('.', '_'), `${label} wave, tall`, 'Waves', curveFn(sine(f, 44, 64, Math.PI / 2), Math.max(32, f * 16)));
});
[[1, 'Offset'], [2, 'Shifted'], [1.25, 'Lazy'], [2.5, 'Uneven']].forEach(([f, label], i) => {
  edge(`wave-off-${i + 1}`, `${label} wave`, 'Waves', curveFn(sine(f, 30, 60, i * 1.3), 48));
});
[[8, 6], [12, 6], [16, 5], [8, 12], [12, 10], [20, 4]].forEach(([f, a], i) => {
  edge(`ripple-${i + 1}`, `Ripple ${i + 1}`, 'Waves', curveFn(sine(f, a, 64), f * 8));
});

// Curves and arcs
[[0.5, 'Centre'], [0.3, 'Left'], [0.7, 'Right'], [0.12, 'Far left'], [0.88, 'Far right']].forEach(([px, label]) => {
  edge(`curve-down-${label.toLowerCase().replace(' ', '-')}`, `Bowl, ${label.toLowerCase()}`, 'Curves', close(`M0,8 Q${W * px},200 ${W},8`));
  edge(`curve-up-${label.toLowerCase().replace(' ', '-')}`, `Hill, ${label.toLowerCase()}`, 'Curves', close(`M0,112 Q${W * px},-80 ${W},112`));
});
edge('curve-tilt-1', 'Tilted bowl', 'Curves', close(`M0,10 Q500,180 ${W},90`));
edge('curve-tilt-2', 'Tilted hill', 'Curves', close(`M0,110 Q700,-60 ${W},30`));
edge('curve-corner-l', 'Corner curve, left', 'Curves', close(`M0,0 C80,110 300,110 ${W},112`));
edge('curve-corner-r', 'Corner curve, right', 'Curves', close(`M0,112 C900,110 1120,110 ${W},0`));
edge('curve-flat-bowl', 'Wide bowl', 'Curves', close(`M0,10 C100,110 1100,110 ${W},10`));
edge('curve-flat-hill', 'Wide hill', 'Curves', close(`M0,110 C100,10 1100,10 ${W},110`));

// Layered waves (back layers are see-through)
edge('layer-wave-2', 'Two waves', 'Layered', layered([curveFn(sine(1, 26, 50, 0)), curveFn(sine(1, 26, 70, Math.PI))]));
edge('layer-wave-3', 'Three waves', 'Layered', layered([curveFn(sine(1, 22, 40, 0.4)), curveFn(sine(1.5, 22, 58, 2)), curveFn(sine(1, 22, 78, 3.6))]));
edge('layer-wave-dbl', 'Double waves stacked', 'Layered', layered([curveFn(sine(2, 20, 46, 0)), curveFn(sine(2, 20, 74, Math.PI))]));
edge('layer-wave-tri', 'Busy waves stacked', 'Layered', layered([curveFn(sine(3, 14, 40, 0)), curveFn(sine(3, 14, 60, 1)), curveFn(sine(3, 14, 82, 2))]));
edge('layer-curve-2', 'Two bowls', 'Layered', layered([close(`M0,0 Q600,170 ${W},0`), close(`M0,30 Q600,200 ${W},30`)]));
edge('layer-curve-3', 'Three bowls', 'Layered', layered([close(`M0,0 Q600,140 ${W},0`), close(`M0,20 Q600,170 ${W},20`), close(`M0,40 Q600,200 ${W},40`)]));
edge('layer-hill-2', 'Two hills', 'Layered', layered([close(`M0,80 Q600,-60 ${W},80`), close(`M0,112 Q600,-20 ${W},112`)]));
edge('layer-tilt-2', 'Two slopes', 'Layered', layered([close(`M0,20 C400,20 800,110 ${W},90`), close(`M0,60 C400,40 800,120 ${W},110`)]));
edge('layer-tilt-3', 'Three slopes', 'Layered', layered([close(`M0,90 C400,0 800,0 ${W},40`), close(`M0,100 C400,30 800,30 ${W},70`), close(`M0,110 C400,60 800,60 ${W},100`)]));
edge('layer-cross', 'Crossing waves', 'Layered', layered([curveFn(sine(1.5, 30, 60, 0)), curveFn(sine(1.5, 30, 60, Math.PI))], [0.45, 1]));
edge('layer-ripple', 'Ripples stacked', 'Layered', layered([curveFn(sine(6, 8, 50), 96), curveFn(sine(6, 8, 70, 1.5), 96), curveFn(sine(6, 8, 90, 3), 96)]));
edge('layer-mix', 'Wave over curve', 'Layered', layered([close(`M0,10 Q600,160 ${W},10`), curveFn(sine(2, 16, 82))], [0.4, 1]));
edge('layer-soft-4', 'Four soft waves', 'Layered', layered([curveFn(sine(1, 14, 30, 0)), curveFn(sine(1, 14, 50, 0.8)), curveFn(sine(1, 14, 70, 1.6)), curveFn(sine(1, 14, 90, 2.4))], [0.2, 0.4, 0.65, 1]));
edge('layer-peaks', 'Rounded peaks stacked', 'Layered', layered([curveFn(sine(4, 22, 52, 0)), curveFn(sine(3, 20, 80, 1))], [0.45, 1]));

// Clouds and scallops
const scallop = (count, base, up = true) => {
  const r = W / count / 2;
  let d = `M0,${base}`;
  for (let i = 0; i < count; i++) d += ` A${r1(r)},${r1(r)} 0 0,${up ? 1 : 0} ${r1((i + 1) * 2 * r)},${base}`;
  return close(d);
};
[6, 10, 16, 24].forEach((n) => edge(`scallop-${n}`, `Scallops ×${n}`, 'Clouds', scallop(n, n < 10 ? 118 : 110)));
[8, 16].forEach((n) => edge(`scallop-in-${n}`, `Bites ×${n}`, 'Clouds', scallop(n, 2, false)));
const cloud = (seed, count) => {
  const rand = rng(seed);
  const ws = Array.from({ length: count }, () => 0.6 + rand());
  const sum = ws.reduce((a, b) => a + b, 0);
  let x = 0;
  let d = 'M0,118';
  ws.forEach((w) => {
    const span = (W * w) / sum;
    const h = 30 + rand() * 70;
    d += ` C${r1(x)},${r1(118 - h * 1.25)} ${r1(x + span)},${r1(118 - h * 1.25)} ${r1(x + span)},118`;
    x += span;
  });
  return close(d);
};
[[11, 7], [23, 9], [37, 12], [51, 5]].forEach(([s, n], i) => edge(`cloud-${i + 1}`, `Cloud ${i + 1}`, 'Clouds', cloud(s, n)));

// Drips
const drips = (seed, count) => {
  const rand = rng(seed);
  let d = 'M0,6';
  const slot = W / count;
  for (let i = 0; i < count; i++) {
    const w = slot * (0.25 + rand() * 0.35);
    const x0 = i * slot + rand() * (slot - w);
    const depth = 25 + rand() * 85;
    d += ` L${r1(x0)},6 C${r1(x0 + w * 0.1)},${r1(6 + depth * 0.5)} ${r1(x0 - w * 0.05)},${r1(6 + depth * 1.3)} ${r1(x0 + w / 2)},${r1(6 + depth * 1.3)} C${r1(x0 + w * 1.05)},${r1(6 + depth * 1.3)} ${r1(x0 + w * 0.9)},${r1(6 + depth * 0.5)} ${r1(x0 + w)},6`;
  }
  return close(`${d} L${W},6`);
};
[[3, 6], [9, 8], [17, 10], [29, 5], [41, 12], [57, 7]].forEach(([s, n], i) => edge(`drip-${i + 1}`, `Drips ${i + 1}`, 'Drips', drips(s, n)));

// Hills
const hills = (seed, count, lo = 20, hi = 100) => {
  const rand = rng(seed);
  return curveFn((t) => {
    const i = Math.round(t * count * 2);
    return i % 2 ? lo + rand() * 40 : hi - rand() * 25;
  }, count * 2);
};
[[5, 3], [13, 4], [21, 5], [33, 6], [45, 2], [61, 8]].forEach(([s, n], i) => edge(`hills-${i + 1}`, `Hills ${i + 1}`, 'Hills', hills(s, n)));
edge('hills-layered', 'Rolling hills', 'Hills', layered([hills(71, 3, 10, 80), hills(83, 4, 50, 110)], [0.45, 1]));
edge('hills-far', 'Far hills', 'Hills', layered([hills(91, 5, 15, 60), hills(97, 3, 45, 95), hills(101, 4, 75, 115)]));

// Organic
const organic = (seed, n, lo = 15, hi = 105) => {
  const rand = rng(seed);
  return curveFn(() => lo + rand() * (hi - lo), n);
};
[[7, 6], [19, 7], [27, 8], [39, 5], [47, 9], [53, 6], [67, 10], [79, 7], [89, 4], [103, 8]].forEach(([s, n], i) => edge(`organic-${i + 1}`, `Organic ${i + 1}`, 'Organic', organic(s, n)));
edge('organic-layered-1', 'Organic layers', 'Organic', layered([organic(111, 6, 10, 80), organic(113, 7, 40, 110)], [0.45, 1]));
edge('organic-layered-2', 'Organic layers, three', 'Organic', layered([organic(117, 5, 5, 60), organic(119, 6, 30, 90), organic(123, 7, 60, 115)]));

// Swooshes
const swoosh = (from, to, wobble = 0, f = 1) => curveFn((t) => from + (to - from) * smoothstep(t) + wobble * Math.sin(Math.PI * 2 * f * t));
edge('swoosh-up', 'Swoosh up', 'Swoosh', swoosh(112, 8));
edge('swoosh-down', 'Swoosh down', 'Swoosh', swoosh(8, 112));
edge('swoosh-wave-up', 'Wavy swoosh up', 'Swoosh', swoosh(110, 20, 16, 2));
edge('swoosh-wave-down', 'Wavy swoosh down', 'Swoosh', swoosh(20, 110, 16, 2));
edge('swoosh-s', 'S-curve', 'Swoosh', close(`M0,100 C500,100 700,20 ${W},20`));
edge('swoosh-s-steep', 'Steep S-curve', 'Swoosh', close(`M0,110 C700,110 500,10 ${W},10`));
edge('swoosh-layer', 'Swoosh layers', 'Swoosh', layered([swoosh(90, 0), swoosh(115, 30)], [0.45, 1]));
edge('swoosh-ribbon', 'Ribbon', 'Swoosh', layered([close(`M0,20 C400,120 800,-20 ${W},70`), close(`M0,60 C400,140 800,20 ${W},100`)], [0.45, 1]));

// Tabs and notches
edge('tab-center', 'Rounded tab', 'Tabs', close(`M0,100 L420,100 C470,100 470,20 540,20 L660,20 C730,20 730,100 780,100 L${W},100`));
edge('notch-center', 'Rounded notch', 'Tabs', close(`M0,10 L420,10 C470,10 470,100 540,100 L660,100 C730,100 730,10 780,10 L${W},10`));
edge('arch-center', 'Arch', 'Tabs', close(`M0,112 L380,112 C380,0 820,0 820,112 L${W},112`));
edge('arch-wide', 'Wide arch', 'Tabs', close(`M0,112 L160,112 C160,-10 1040,-10 1040,112 L${W},112`));
edge('cup-center', 'Cup', 'Tabs', close(`M0,8 L380,8 C380,120 820,120 820,8 L${W},8`));
edge('tabs-two', 'Two tabs', 'Tabs', close(`M0,100 L160,100 C200,100 200,30 250,30 L450,30 C500,30 500,100 540,100 L660,100 C700,100 700,30 750,30 L950,30 C1000,30 1000,100 1040,100 L${W},100`));
edge('bump-left', 'Side bump, left', 'Tabs', close(`M0,20 C250,20 300,100 520,100 L${W},100`));
edge('bump-right', 'Side bump, right', 'Tabs', close(`M0,100 L680,100 C900,100 950,20 ${W},20`));

export const EDGES = EDGE_LIST;
export const EDGE_GROUPS = [...new Set(EDGES.map((e) => e.group))];
const EDGE_BY_KEY = new Map(EDGES.map((e) => [e.key, e]));
export const getEdge = (key) => EDGE_BY_KEY.get(key) || null;

// ---------- background decor ----------
const C = 100;
const blob = (seed, n = 7, lo = 62, hi = 92) => {
  const rand = rng(seed);
  return splineClosed(Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const r = lo + rand() * (hi - lo);
    return [C + r * Math.cos(a), C + r * Math.sin(a)];
  }));
};
const circle = (cx, cy, r) => `M${r1(cx + r)},${cy} A${r},${r} 0 1,0 ${r1(cx - r)},${cy} A${r},${r} 0 1,0 ${r1(cx + r)},${cy} Z`;
const radial = (fn, steps = 120) => splineClosed(Array.from({ length: steps }, (_, i) => {
  const a = (i / steps) * Math.PI * 2;
  const r = fn(a);
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
}));

const DECOR_LIST = [];
const decor = (key, name, d, stroke = false) => DECOR_LIST.push({ key, name, d, stroke });
[[3, 6], [8, 7], [14, 8], [22, 6], [31, 9], [44, 5], [58, 7], [63, 8], [77, 6], [85, 10]].forEach(([s, n], i) => decor(`blob-${i + 1}`, `Blob ${i + 1}`, blob(s, n)));
decor('circle', 'Circle', circle(C, C, 88));
decor('half', 'Half circle', 'M12,150 A88,88 0 0,1 188,150 Z');
decor('quarter', 'Quarter circle', 'M20,185 L20,20 A165,165 0 0,1 185,185 Z');
decor('egg', 'Egg', 'M100,12 C150,12 182,90 182,125 C182,165 145,190 100,190 C55,190 18,165 18,125 C18,90 50,12 100,12 Z');
decor('drop', 'Drop', 'M100,10 C100,10 168,92 168,128 A68,68 0 1,1 32,128 C32,92 100,10 100,10 Z');
decor('capsule', 'Capsule', 'M70,40 A30,30 0 0,1 130,40 L130,160 A30,30 0 0,1 70,160 Z');
decor('crescent', 'Crescent', 'M120,14 A88,88 0 1,0 120,186 A70,70 0 1,1 120,14 Z');
decor('flower', 'Flower', [0, 1, 2, 3, 4, 5].map((i) => circle(C + 48 * Math.cos((i * Math.PI) / 3), C + 48 * Math.sin((i * Math.PI) / 3), 44)).join(' ') + ' ' + circle(C, C, 50));
decor('sun', 'Wavy sun', radial((a) => 78 + 10 * Math.sin(a * 12)));
decor('star-soft', 'Soft star', radial((a) => 70 + 24 * Math.cos(a * 5), 90));
decor('ring', 'Ring', circle(C, C, 70), true);
decor('rings', 'Double ring', `${circle(C, C, 78)} ${circle(C, C, 48)}`, true);
decor('rainbow', 'Rainbow arcs', 'M20,170 A80,80 0 0,1 180,170 M48,170 A52,52 0 0,1 152,170 M76,170 A24,24 0 0,1 124,170', true);
decor('arch-line', 'Arch outline', 'M45,185 L45,100 A55,55 0 0,1 155,100 L155,185', true);
decor('squiggle', 'Squiggle', spline(Array.from({ length: 9 }, (_, i) => [15 + i * 21, i % 2 ? 70 : 130])), true);
decor('wavy-lines', 'Wavy lines', [60, 100, 140].map((y) => spline(Array.from({ length: 9 }, (_, i) => [10 + i * 22.5, y + (i % 2 ? -14 : 14)]))).join(' '), true);
decor('spiral', 'Spiral', spline(Array.from({ length: 60 }, (_, i) => {
  const a = i * 0.36;
  const r = 6 + i * 1.45;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
})), true);

export const DECORS = DECOR_LIST;
const DECOR_BY_KEY = new Map(DECORS.map((d) => [d.key, d]));
export const getDecor = (key) => DECOR_BY_KEY.get(key) || null;

export const SHAPE_COUNT = EDGES.length + DECORS.length;

// ---------- markup ----------
export const edgeSvg = (e, attrs = '') =>
  `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"${attrs}>${e.layers.map((l) => `<path d="${l.d}" fill="currentColor"${l.o && l.o < 1 ? ` opacity="${l.o}"` : ''}/>`).join('')}</svg>`;

export const decorSvg = (s, attrs = '') =>
  `<svg viewBox="0 0 200 200"${attrs}><path d="${s.d}" ${s.stroke ? 'fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"' : 'fill="currentColor"'}/></svg>`;
