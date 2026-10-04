// Rich decorative graphics in the style of the original set: mandalas, rangoli, garlands, ornate frames, paisley,
// lotus and roses, diyas and lanterns, lights, confetti, glows, gradient waves, tricolour and auspicious symbols.
import { f, flower, leaf, rng, star4, svg } from './graphics';

const radial = (id, c, o1 = 0.9, o2 = 0) => `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${o1}"/><stop offset="1" stop-color="${c}" stop-opacity="${o2}"/></radialGradient>`;
const linear = (id, a, b, vertical = true) => `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const pick = (r, list) => list[Math.floor(r() * list.length) % list.length];
const sstroke = (d, c, w, extra = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;

// One petal pointing away from (cx, cy) at `angle`, starting at radius r0
function petal(cx, cy, r0, len, wid, angle, shape, fill, strokeC, sw) {
  const d = {
    almond: `M0 0 Q${f(wid)} ${f(len / 2)} 0 ${f(len)} Q${f(-wid)} ${f(len / 2)} 0 0Z`,
    round: `M0 0 C${f(wid * 1.3)} ${f(len * 0.15)} ${f(wid * 1.3)} ${f(len)} 0 ${f(len)} C${f(-wid * 1.3)} ${f(len)} ${f(-wid * 1.3)} ${f(len * 0.15)} 0 0Z`,
    tear: `M0 ${f(len)} C${f(wid * 1.4)} ${f(len * 0.55)} ${f(wid * 0.9)} 0 0 0 C${f(-wid * 0.9)} 0 ${f(-wid * 1.4)} ${f(len * 0.55)} 0 ${f(len)}Z`,
    pointed: `M0 0 L${f(wid)} ${f(len * 0.45)} L0 ${f(len)} L${f(-wid)} ${f(len * 0.45)}Z`,
    heart: `M0 ${f(len)} C${f(wid * 1.6)} ${f(len * 0.6)} ${f(wid * 1.2)} 0 0 ${f(len * 0.25)} C${f(-wid * 1.2)} 0 ${f(-wid * 1.6)} ${f(len * 0.6)} 0 ${f(len)}Z`,
  }[shape] || '';
  const deg = (angle * 180) / Math.PI - 90;
  const x = cx + Math.cos(angle) * r0;
  const y = cy + Math.sin(angle) * r0;
  return `<path d="${d}" transform="translate(${f(x)} ${f(y)}) rotate(${f(deg)})" fill="${fill}" ${strokeC ? `stroke="${strokeC}" stroke-width="${f(sw)}" stroke-linejoin="round"` : ''}/>`;
}

const PAISLEY = 'M46 98 C20 98 6 80 8 60 C10 40 28 30 44 26 C58 22 66 14 64 2 C80 10 90 28 88 50 C86 78 70 98 46 98Z';
// Keri / paisley: filled body, inner outline, small inner keri and a row of dots, like block-print motifs
const paisley = (x, y, s, rot, fill, inner) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s / 100)})"><g transform="translate(-50 -50)"><path d="${PAISLEY}" fill="${fill}"/>${inner ? `<path d="${PAISLEY}" transform="translate(13 16) scale(.74)" fill="none" stroke="${inner}" stroke-width="3"/><path d="${PAISLEY}" transform="translate(28 36) scale(.42)" fill="${inner}"/>${[[20, 70], [18, 58], [22, 46], [31, 38], [42, 34]].map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="2.6" fill="${inner}"/>`).join('')}` : ''}</g></g>`;

function marigold(cx, cy, r, c1, c2) {
  let p = '';
  for (let ring = 0; ring < 2; ring++) {
    const n = ring ? 9 : 12;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + ring * 0.3;
      const rr = r * (ring ? 0.5 : 0.78);
      p += `<circle cx="${f(cx + Math.cos(a) * rr)}" cy="${f(cy + Math.sin(a) * rr)}" r="${f(r * (ring ? 0.32 : 0.3))}" fill="${ring ? c2 : c1}"/>`;
    }
  }
  return p + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.35)}" fill="${c2}"/>`;
}
function rose(cx, cy, r, c1, c2) {
  let p = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${c1}"/>`;
  for (let i = 0; i < 4; i++) {
    const rr = r * (0.85 - i * 0.2);
    const a0 = i * 1.4;
    p += sstroke(`M${f(cx + Math.cos(a0) * rr)} ${f(cy + Math.sin(a0) * rr)} A${f(rr)} ${f(rr)} 0 0 1 ${f(cx + Math.cos(a0 + 3.6) * rr)} ${f(cy + Math.sin(a0 + 3.6) * rr)}`, c2, r * 0.12);
  }
  return p;
}
function jasmine(cx, cy, r, c1, c2) {
  let p = '';
  for (let i = 0; i < 5; i++) p += petal(cx, cy, r * 0.15, r * 0.85, r * 0.35, (i / 5) * Math.PI * 2 - Math.PI / 2, 'round', c1);
  return p + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.22)}" fill="${c2}"/>`;
}
function lotus(cx, cy, s, c1, c2, c3, line) {
  let p = '';
  const petals = [[-70, 0.7], [-40, 0.85], [-15, 1], [15, 1], [40, 0.85], [70, 0.7], [0, 1.1]];
  petals.forEach(([deg, k], i) => {
    const a = ((deg - 90) * Math.PI) / 180;
    p += petal(cx, cy, 0, s * 0.55 * k, s * 0.14, a, 'almond', line ? 'none' : i === 6 ? c2 : c1, line ? c1 : c3 || null, Math.max(1, s * 0.02));
  });
  p += `<path d="M${f(cx - s * 0.32)} ${f(cy)} Q${f(cx)} ${f(cy + s * 0.16)} ${f(cx + s * 0.32)} ${f(cy)}" fill="${line ? 'none' : c3 || c2}" stroke="${line ? c1 : 'none'}" stroke-width="${f(Math.max(1, s * 0.02))}"/>`;
  return p;
}
function bell(x, y, s, c1, c2) {
  return `<path d="M${f(x - s * 0.18)} ${f(y)} Q${f(x - s * 0.2)} ${f(y + s * 0.55)} ${f(x - s * 0.42)} ${f(y + s * 0.75)} H${f(x + s * 0.42)} Q${f(x + s * 0.2)} ${f(y + s * 0.55)} ${f(x + s * 0.18)} ${f(y)}Z" fill="${c1}"/><rect x="${f(x - s * 0.45)}" y="${f(y + s * 0.72)}" width="${f(s * 0.9)}" height="${f(s * 0.08)}" rx="${f(s * 0.04)}" fill="${c2}"/><circle cx="${f(x)}" cy="${f(y + s * 0.88)}" r="${f(s * 0.09)}" fill="${c2}"/>`;
}
function diya(cx, by, s, c1, c2, c3, id, glow = true) {
  return `${glow ? `<circle cx="${f(cx)}" cy="${f(by - s * 0.55)}" r="${f(s * 0.7)}" fill="url(#${id}gl)"/>` : ''}<path d="M${f(cx)} ${f(by - s * 0.95)} Q${f(cx + s * 0.16)} ${f(by - s * 0.55)} ${f(cx)} ${f(by - s * 0.32)} Q${f(cx - s * 0.16)} ${f(by - s * 0.55)} ${f(cx)} ${f(by - s * 0.95)}Z" fill="${c1}"/><path d="M${f(cx)} ${f(by - s * 0.78)} Q${f(cx + s * 0.07)} ${f(by - s * 0.55)} ${f(cx)} ${f(by - s * 0.42)} Q${f(cx - s * 0.07)} ${f(by - s * 0.55)} ${f(cx)} ${f(by - s * 0.78)}Z" fill="${c3}"/><path d="M${f(cx - s * 0.6)} ${f(by - s * 0.3)} Q${f(cx)} ${f(by + s * 0.25)} ${f(cx + s * 0.6)} ${f(by - s * 0.3)} Q${f(cx + s * 0.75)} ${f(by - s * 0.42)} ${f(cx + s * 0.85)} ${f(by - s * 0.5)} Q${f(cx + s * 0.62)} ${f(by - s * 0.22)} ${f(cx + s * 0.45)} ${f(by - s * 0.2)}Z" fill="${c2}"/><ellipse cx="${f(cx)}" cy="${f(by - s * 0.3)}" rx="${f(s * 0.6)}" ry="${f(s * 0.09)}" fill="${c1}"/>`;
}
const scrollCurl = (x, y, s, dir, c, w) => sstroke(`M${f(x)} ${f(y)} C${f(x + dir * s * 0.4)} ${f(y - s * 0.35)} ${f(x + dir * s * 0.9)} ${f(y - s * 0.1)} ${f(x + dir * s * 0.75)} ${f(y + s * 0.2)} C${f(x + dir * s * 0.62)} ${f(y + s * 0.42)} ${f(x + dir * s * 0.38)} ${f(y + s * 0.25)} ${f(x + dir * s * 0.5)} ${f(y + s * 0.08)}`, c, w);

export const ORNAMENTS = {
  // ---------- mandala & rangoli ----------
  omandala(w, h, cols, seed, id, p) {
    const r = rng(seed);
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) / 2;
    const L = p.layers || 4;
    const shapes = ['almond', 'round', 'tear', 'pointed', 'heart'];
    const line = p.style === 'line';
    const sw = Math.max(1, R * 0.012);
    let out = '';
    for (let i = 0; i < L; i++) {
      const outer = R * (1 - (i * 0.78) / L);
      const len = (R * 0.78) / L * 1.25;
      const n = pick(r, i === 0 ? [16, 24, 32] : i === L - 1 ? [8, 10, 12] : [12, 16, 20, 24]);
      const shape = pick(r, shapes);
      const col = cols[i % cols.length];
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + (i % 2 ? Math.PI / n : 0);
        out += petal(cx, cy, outer - len, len, len * (shape === 'pointed' ? 0.28 : 0.32) * (16 / Math.max(10, n)) * 1.4, a, shape, line ? 'none' : col, line ? col : p.style === 'mixed' ? cols[(i + 1) % cols.length] : null, sw);
      }
      if (p.style === 'dotted' || p.style === 'mixed') {
        const dn = n * 2;
        for (let k = 0; k < dn; k++) { const a = (k / dn) * Math.PI * 2; out += `<circle cx="${f(cx + Math.cos(a) * (outer - len - R * 0.03))}" cy="${f(cy + Math.sin(a) * (outer - len - R * 0.03))}" r="${f(R * 0.012)}" fill="${cols[(i + 2) % cols.length]}"/>`; }
      }
    }
    out += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R * 0.14)}" fill="${line ? 'none' : cols[0]}" stroke="${cols[1 % cols.length]}" stroke-width="${f(sw * 1.5)}"/>` + (line ? '' : flower(cx, cy, R * 0.1, cols[1 % cols.length], cols[2 % cols.length]));
    return svg(w, h, out);
  },
  orangoli(w, h, cols, seed, id, p) {
    const r = rng(seed);
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) / 2;
    let out = '';
    // scalloped outer border with dots
    const sc = pick(r, [20, 24, 28]);
    for (let k = 0; k < sc; k++) {
      const a = (k / sc) * Math.PI * 2;
      out += `<circle cx="${f(cx + Math.cos(a) * R * 0.9)}" cy="${f(cy + Math.sin(a) * R * 0.9)}" r="${f(R * 0.1)}" fill="${cols[k % 2 ? 0 : 1]}"/><circle cx="${f(cx + Math.cos(a) * R * 0.9)}" cy="${f(cy + Math.sin(a) * R * 0.9)}" r="${f(R * 0.035)}" fill="#FFFFFF"/>`;
    }
    const layers = [[0.8, 0.3], [0.56, 0.26], [0.36, 0.22]];
    layers.forEach(([k, len], i) => {
      const n = pick(r, [8, 12, 16]);
      const shape = pick(r, ['almond', 'tear', 'heart', 'round']);
      for (let j = 0; j < n; j++) out += petal(cx, cy, R * (k - len), R * len, R * len * 0.42, (j / n) * Math.PI * 2 + (i % 2 ? Math.PI / n : 0), shape, cols[(i + 2) % cols.length], '#FFFFFF', Math.max(1, R * 0.01));
    });
    out += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R * 0.15)}" fill="${cols[cols.length - 1]}"/>` + flower(cx, cy, R * 0.11, cols[0], '#FFFFFF');
    return svg(w, h, out);
  },

  // ---------- garlands ----------
  ogarland(w, h, cols, seed, id, p) {
    const [c1, c2, c3, c4] = cols;
    const kind = p.flower || 'marigold';
    const r = Math.max(5, h * 0.11);
    const n = Math.max(2, Math.round(w / (h * 1.6)));
    const seg = w / n;
    const sag = h * (p.strands === 2 ? 0.28 : 0.4);
    let out = '';
    const fl = (x, y, rr, k) => (kind === 'rose' ? rose(x, y, rr * 0.8, k % 2 ? c1 : c2, darker(k % 2 ? c1 : c2)) : kind === 'jasmine' ? jasmine(x, y, rr, '#FFFFFF', c2) : kind === 'mixed' ? (k % 3 === 0 ? jasmine(x, y, rr, '#FFFFFF', c2) : k % 3 === 1 ? marigold(x, y, rr, c1, c2) : rose(x, y, rr * 0.8, c4 || '#E11D48', '#9F1239')) : marigold(x, y, rr, k % 2 ? c1 : c2, k % 2 ? c2 : c1));
    for (let s = 0; s < (p.strands || 1); s++) {
      const off = s * sag * 0.9;
      for (let i = 0; i < n; i++) {
        const x0 = i * seg;
        const steps = Math.max(6, Math.round(seg / (r * 1.5)));
        for (let k = 0; k <= steps; k++) {
          const t = k / steps;
          out += fl(x0 + seg * t, r + off * 0.5 + Math.sin(Math.PI * t) * (sag - off * 0.3), r * (s ? 0.8 : 1), k + i);
        }
      }
    }
    // hangings at each joint
    for (let i = 0; i <= n; i++) {
      const x = i * seg;
      const top = r;
      const dl = h - r * 1.2;
      if (p.drop === 'bell') out += sstroke(`M${f(x)} ${f(top)} V${f(top + dl * 0.55)}`, c3, Math.max(1, r * 0.15)) + bell(x, top + dl * 0.55, dl * 0.42, '#D4A017', '#8B5E00');
      else if (p.drop === 'tassel') { for (let k = -2; k <= 2; k++) out += sstroke(`M${f(x)} ${f(top)} L${f(x + k * r * 0.25)} ${f(top + dl)}`, k % 2 ? c1 : c2, Math.max(1, r * 0.12)); out += `<circle cx="${f(x)}" cy="${f(top)}" r="${f(r * 0.5)}" fill="${c3}"/>`; }
      else if (p.drop === 'leaf') out += leaf(x - r * 0.2, top, dl * 0.6, 80, c3) + leaf(x + r * 0.2, top, dl * 0.6, 100, c3);
      else if (p.drop === 'lari') { const m = Math.max(2, Math.round(dl / (r * 1.5))); for (let k = 0; k < m; k++) out += fl(x, top + k * r * 1.5, r * 0.75, k); }
      out += fl(x, top, r * 1.15, i);
    }
    return svg(w, h, out);
  },

  // ---------- ornate frames ----------
  oframe(w, h, [c1, c2, c3], seed, id, p) {
    const S = Math.min(w, h);
    const m = S * 0.03;
    const t = Math.max(1.5, S * 0.006);
    const rect = (x, y, ww, hh, sw, c, extra = '') => `<rect x="${f(x)}" y="${f(y)}" width="${f(ww)}" height="${f(hh)}" fill="none" stroke="${c}" stroke-width="${f(sw)}" ${extra}/>`;
    let out = '';
    const corners = (fn) => [[0, 0, 1, 1], [w, 0, -1, 1], [0, h, 1, -1], [w, h, -1, -1]].map(([x, y, sx, sy]) => `<g transform="translate(${f(x)} ${f(y)}) scale(${sx} ${sy})">${fn()}</g>`).join('');
    const k = S * 0.16;
    switch (p.style) {
      case 'flourish':
        out = rect(m * 2, m * 2, w - m * 4, h - m * 4, t, c1) + corners(() => scrollCurl(m * 2, k * 1.2, k * 0.9, 1, c1, t * 1.5) + scrollCurl(k * 1.2, m * 2, k * 0.9, 1, c1, t * 1.5).replace(/M([\d.]+) ([\d.]+)/, (_, a, b) => `M${a} ${b}`) + `<circle cx="${f(m * 2)}" cy="${f(m * 2)}" r="${f(k * 0.16)}" fill="${c2}"/>` + leaf(m * 3, m * 3, k * 0.6, 45, c2));
        break;
      case 'floral':
        out = rect(m * 1.5, m * 1.5, w - m * 3, h - m * 3, t, c1) + rect(m * 2.6, m * 2.6, w - m * 5.2, h - m * 5.2, t * 0.6, c1) + corners(() => marigold(k * 0.45, k * 0.45, k * 0.3, c2, c3) + rose(k * 0.95, k * 0.3, k * 0.18, '#E11D48', '#9F1239') + rose(k * 0.3, k * 0.95, k * 0.18, '#E11D48', '#9F1239') + leaf(k * 1.1, k * 0.55, k * 0.45, 20, '#15803D') + leaf(k * 0.55, k * 1.1, k * 0.45, 70, '#15803D'));
        break;
      case 'paisley':
        out = rect(m * 1.5, m * 1.5, w - m * 3, h - m * 3, t * 1.4, c1) + corners(() => paisley(k * 0.55, k * 0.55, k * 0.8, 135, c2, c3) + `<circle cx="${f(k * 1.15)}" cy="${f(k * 0.25)}" r="${f(k * 0.06)}" fill="${c1}"/><circle cx="${f(k * 0.25)}" cy="${f(k * 1.15)}" r="${f(k * 0.06)}" fill="${c1}"/>`);
        break;
      case 'mughal': {
        const top = h * 0.22;
        out = sstroke(`M${f(m * 2)} ${f(h - m * 2)} V${f(top)} Q${f(m * 2)} ${f(top * 0.45)} ${f(w * 0.3)} ${f(top * 0.32)} Q${f(w / 2)} ${f(top * 0.26)} ${f(w / 2)} ${f(m * 2)} Q${f(w / 2)} ${f(top * 0.26)} ${f(w * 0.7)} ${f(top * 0.32)} Q${f(w - m * 2)} ${f(top * 0.45)} ${f(w - m * 2)} ${f(top)} V${f(h - m * 2)}Z`, c1, t * 1.8);
        out += sstroke(`M${f(m * 4)} ${f(h - m * 4)} V${f(top + m * 2)} Q${f(m * 4)} ${f(top * 0.55 + m)} ${f(w * 0.3)} ${f(top * 0.45 + m)} Q${f(w / 2)} ${f(top * 0.38 + m)} ${f(w / 2)} ${f(m * 5)} Q${f(w / 2)} ${f(top * 0.38 + m)} ${f(w * 0.7)} ${f(top * 0.45 + m)} Q${f(w - m * 4)} ${f(top * 0.55 + m)} ${f(w - m * 4)} ${f(top + m * 2)} V${f(h - m * 4)}Z`, c2, t);
        out += `<circle cx="${f(w / 2)}" cy="${f(m * 2)}" r="${f(S * 0.025)}" fill="${c2}"/>`;
        break;
      }
      case 'beads': {
        out = rect(m, m, w - 2 * m, h - 2 * m, t * 1.2, c1) + rect(m * 3.2, m * 3.2, w - m * 6.4, h - m * 6.4, t * 1.2, c1);
        const step = S * 0.035;
        for (let x = m * 2.1; x < w - m * 2; x += step) out += `<circle cx="${f(x)}" cy="${f(m * 2.1)}" r="${f(step * 0.22)}" fill="${c2}"/><circle cx="${f(x)}" cy="${f(h - m * 2.1)}" r="${f(step * 0.22)}" fill="${c2}"/>`;
        for (let y = m * 2.1 + step; y < h - m * 2.1; y += step) out += `<circle cx="${f(m * 2.1)}" cy="${f(y)}" r="${f(step * 0.22)}" fill="${c2}"/><circle cx="${f(w - m * 2.1)}" cy="${f(y)}" r="${f(step * 0.22)}" fill="${c2}"/>`;
        break;
      }
      case 'filigree':
        out = rect(m * 2, m * 2, w - m * 4, h - m * 4, t, c1, `rx="${f(S * 0.02)}"`) + corners(() => [0, 1, 2].map((i) => scrollCurl(m * 2 + i * k * 0.35, m * 2 + k * (0.9 - i * 0.25), k * (0.7 - i * 0.15), 1, i === 1 ? c2 : c1, t * 1.2)).join('') + [0, 1, 2].map((i) => `<g transform="matrix(0 1 1 0 0 0)">${scrollCurl(m * 2 + i * k * 0.35, m * 2 + k * (0.9 - i * 0.25), k * (0.7 - i * 0.15), 1, i === 1 ? c2 : c1, t * 1.2)}</g>`).join(''));
        break;
      case 'leafy': {
        out = rect(m * 2, m * 2, w - m * 4, h - m * 4, t * 0.8, c1);
        const step = S * 0.07;
        let i = 0;
        for (let x = m * 4; x < w - m * 3; x += step, i++) out += leaf(x, m * 2, step * 0.8, i % 2 ? -30 : 30, c2) + leaf(x, h - m * 2, step * 0.8, i % 2 ? -30 : 30, c2);
        for (let y = m * 4; y < h - m * 3; y += step, i++) out += leaf(m * 2, y, step * 0.8, i % 2 ? 60 : 120, c2) + leaf(w - m * 2, y, step * 0.8, i % 2 ? 60 : 120, c2);
        break;
      }
      default: { // royal
        out = rect(m, m, w - 2 * m, h - 2 * m, S * 0.025, `url(#${id}g)`) + rect(m * 2.6, m * 2.6, w - m * 5.2, h - m * 5.2, t, c1);
        out += corners(() => `<path d="M${f(m * 2.6)} ${f(m * 2.6 - k * 0.2)} L${f(m * 2.6 + k * 0.2)} ${f(m * 2.6)} L${f(m * 2.6)} ${f(m * 2.6 + k * 0.2)} L${f(m * 2.6 - k * 0.2)} ${f(m * 2.6)}Z" fill="${c2}"/>`);
        return svg(w, h, out, linear(`${id}g`, c1, c2, false));
      }
    }
    return svg(w, h, out);
  },

  // ---------- paisley ----------
  opaisley(w, h, [c1, c2, c3], seed, id, p) {
    const r = rng(seed);
    const S = Math.min(w, h);
    if (p.kind === 'border') {
      const n = Math.max(3, Math.round(w / (h * 0.9)));
      let out = '';
      for (let i = 0; i < n; i++) out += paisley(((i + 0.5) * w) / n, h / 2, h * 0.85, i % 2 ? 90 : 270, i % 2 ? c1 : c2, c3);
      return svg(w, h, out);
    }
    if (p.kind === 'scatter') {
      let out = '';
      for (let i = 0; i < 14; i++) out += paisley(r() * w, r() * h, S * (0.1 + r() * 0.1), r() * 360, [c1, c2, c3][i % 3], i % 2 ? '#FFFFFF' : null);
      return svg(w, h, out);
    }
    if (p.kind === 'pair') return svg(w, h, paisley(w * 0.32, h / 2, S * 0.7, 200, c1, c3) + paisley(w * 0.68, h / 2, S * 0.7, 20, c2, c3));
    let out = paisley(w / 2, h / 2, S * 0.95, p.rot || 0, c1, c2);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; out += `<circle cx="${f(w / 2 + Math.cos(a) * S * 0.47)}" cy="${f(h / 2 + Math.sin(a) * S * 0.47)}" r="${f(S * 0.015)}" fill="${c3}"/>`; }
    return svg(w, h, out);
  },

  // ---------- sunburst & glow ----------
  oburst(w, h, [c1, c2, c3], seed, id, p) {
    const cx = p.from === 'bottom' ? w / 2 : p.from === 'corner' ? 0 : w / 2;
    const cy = p.from === 'bottom' ? h : p.from === 'corner' ? 0 : h / 2;
    const R = Math.hypot(w, h);
    const n = p.n || 24;
    let rays = '';
    for (let i = 0; i < n; i++) {
      const a1 = (i / n) * Math.PI * 2;
      const a2 = ((i + 0.5) / n) * Math.PI * 2;
      rays += `<path d="M${f(cx)} ${f(cy)} L${f(cx + Math.cos(a1) * R)} ${f(cy + Math.sin(a1) * R)} L${f(cx + Math.cos(a2) * R)} ${f(cy + Math.sin(a2) * R)}Z" fill="${c1}" opacity="${p.op || 0.18}"/>`;
    }
    let rings = '';
    for (let i = 1; i <= 3; i++) rings += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(Math.min(w, h) * 0.18 * i)}" fill="none" stroke="${c3 || c1}" stroke-width="${f(Math.max(1, Math.min(w, h) * 0.006))}" opacity="${f(0.35 - i * 0.08)}"/>`;
    return svg(w, h, rays + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(Math.min(w, h) * (p.glow || 0.55))}" fill="url(#${id}g)"/>` + rings + star4(cx, cy, Math.min(w, h) * 0.06, '#FFFFFF', 0.8), radial(`${id}g`, c2));
  },
  oglow(w, h, cols, seed, id, p) {
    const r = rng(seed);
    let defs = '';
    let out = '';
    for (let i = 0; i < (p.n || 3); i++) {
      defs += radial(`${id}${i}`, cols[i % cols.length], 0.85);
      const s = Math.min(w, h) * (0.35 + r() * 0.4);
      out += `<circle cx="${f(r() * w)}" cy="${f(r() * h)}" r="${f(s)}" fill="url(#${id}${i})"/>`;
    }
    return svg(w, h, out, defs);
  },

  // ---------- lights ----------
  olights(w, h, cols, seed, id, p) {
    const r = rng(seed);
    const [c1, c2] = cols;
    let out = '';
    if (p.kind === 'fairy') {
      const strands = p.strands || 1;
      const bulb = 0.09 + r() * 0.06;
      const n = Math.max(6, Math.round(w / (h * (0.25 + r() * 0.2))));
      for (let s = 0; s < strands; s++) {
        const y0 = h * (0.12 + s * 0.3);
        const sag = h * (0.18 + r() * 0.18);
        out += sstroke(`M0 ${f(y0)} Q${f(w / 2)} ${f(y0 + sag * 2)} ${f(w)} ${f(y0)}`, '#334155', Math.max(1, h * 0.012));
        for (let i = 0; i < n; i++) {
          const t = (i + 0.5) / n;
          const x = t * w;
          const y = y0 + 2 * t * (1 - t) * sag * 2 + h * 0.06;
          const c = cols[(i + s) % cols.length];
          out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(h * bulb * 1.3)}" fill="url(#${id}${(i + s) % cols.length})"/><ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(h * bulb * 0.3)}" ry="${f(h * bulb * 0.45)}" fill="${c}"/>`;
        }
      }
      return svg(w, h, out, cols.map((c, i) => radial(`${id}${i}`, c, 0.7)).join(''));
    }
    if (p.kind === 'glitter') {
      for (let i = 0; i < 160; i++) out += `<circle cx="${f(r() * w)}" cy="${f(Math.pow(r(), p.fall ? 1.8 : 1) * h)}" r="${f(Math.min(w, h) * (0.002 + r() * 0.006))}" fill="${i % 3 ? c1 : c2}" opacity="${f(0.4 + r() * 0.6)}"/>`;
      for (let i = 0; i < 10; i++) out += star4(r() * w, r() * h, Math.min(w, h) * (0.012 + r() * 0.02), c2);
      return svg(w, h, out);
    }
    // hexagon bokeh
    for (let i = 0; i < 24; i++) {
      const s = Math.min(w, h) * (0.03 + r() * 0.08);
      const x = r() * w;
      const y = r() * h;
      const pts = Array.from({ length: 6 }, (_, k) => `${f(x + s * Math.cos((Math.PI / 3) * k))} ${f(y + s * Math.sin((Math.PI / 3) * k))}`);
      out += `<path d="M${pts.join(' L')}Z" fill="${cols[i % cols.length]}" opacity="${f(0.1 + r() * 0.3)}"/>`;
    }
    return svg(w, h, out);
  },

  // ---------- celebration ----------
  ocelebrate(w, h, cols, seed, id, p) {
    const r = rng(seed);
    let out = '';
    const S = Math.min(w, h);
    if (p.kind === 'streamers') {
      for (let i = 0; i < 12; i++) {
        const x = r() * w;
        const y = r() * h * 0.9;
        const len = S * (0.15 + r() * 0.2);
        const pts = Array.from({ length: 14 }, (_, k) => `${k ? 'L' : 'M'}${f(x + Math.sin(k * 0.9) * S * 0.025)} ${f(y + (k / 13) * len)}`).join(' ');
        out += sstroke(pts, cols[i % cols.length], S * 0.012, `transform="rotate(${f(r() * 60 - 30)} ${f(x)} ${f(y)})"`);
      }
    }
    if (p.kind === 'stars' || p.kind === 'streamers') for (let i = 0; i < 26; i++) { const x = r() * w; const y = r() * h; out += `<path d="M0 -1 L.29 -.4 .95 -.31 .48 .15 .59 .81 0 .5 -.59 .81 -.48 .15 -.95 -.31 -.29 -.4Z" transform="translate(${f(x)} ${f(y)}) scale(${f(S * (0.01 + r() * 0.02))}) rotate(${f(r() * 70)})" fill="${cols[i % cols.length]}"/>`; }
    if (p.kind === 'metallic') {
      const defs = linear(`${id}g`, '#FDE68A', '#B7791F') + linear(`${id}s`, '#F8FAFC', '#94A3B8');
      for (let i = 0; i < 70; i++) { const x = r() * w; const y = r() * h; const s = S * (0.008 + r() * 0.018); out += r() > 0.5 ? `<rect x="${f(x)}" y="${f(y)}" width="${f(s * 2)}" height="${f(s)}" fill="url(#${id}${i % 2 ? 'g' : 's'})" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})"/>` : `<circle cx="${f(x)}" cy="${f(y)}" r="${f(s * 0.6)}" fill="url(#${id}${i % 2 ? 'g' : 's'})"/>`; }
      return svg(w, h, out, defs);
    }
    if (p.kind === 'falling') for (let i = 0; i < 60; i++) { const x = r() * w; const y = Math.pow(r(), 1.6) * h; const s = S * (0.008 + r() * 0.016); out += `<rect x="${f(x)}" y="${f(y)}" width="${f(s)}" height="${f(s * 2.2)}" rx="${f(s * 0.3)}" fill="${cols[i % cols.length]}" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})"/>`; }
    if (p.kind === 'popper') {
      const bx = w * 0.12;
      const by = h * 0.88;
      out += `<path d="M${f(bx)} ${f(by)} L${f(bx + S * 0.1)} ${f(by - S * 0.3)} L${f(bx + S * 0.3)} ${f(by - S * 0.1)}Z" fill="url(#${id}c)"/>`;
      for (let i = 0; i < 40; i++) { const a = -Math.PI / 4 + (r() - 0.5) * 1.3; const d = S * (0.3 + r() * 0.55); const x = bx + S * 0.2 + Math.cos(a) * d; const y = by - S * 0.2 + Math.sin(a) * d; out += i % 3 ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(S * (0.006 + r() * 0.012))}" fill="${cols[i % cols.length]}"/>` : sstroke(`M${f(x)} ${f(y)} q${f(S * 0.02)} ${f(-S * 0.02)} ${f(S * 0.04)} 0 t${f(S * 0.04)} 0`, cols[i % cols.length], S * 0.006); }
      return svg(w, h, out, linear(`${id}c`, cols[0], cols[1]));
    }
    return svg(w, h, out);
  },

  // ---------- diwali ----------
  odiwali(w, h, [c1, c2, c3], seed, id, p) {
    const defs = radial(`${id}gl`, '#FFD166', 0.75);
    const S = Math.min(w, h);
    if (p.kind === 'big') return svg(w, h, diya(w / 2, h * 0.9, S * 0.95, c1, c2, c3, id), defs);
    if (p.kind === 'trio') return svg(w, h, diya(w * 0.2, h * 0.92, S * 0.42, c1, c2, c3, id) + diya(w * 0.5, h * 0.88, S * 0.55, c1, c2, c3, id) + diya(w * 0.8, h * 0.92, S * 0.42, c1, c2, c3, id), defs);
    if (p.kind === 'kandil') {
      const cx = w / 2;
      const s = Math.min(w, h * 0.7);
      const top = h * 0.08;
      return svg(w, h, sstroke(`M${f(cx)} 0 V${f(top)}`, '#78350F', Math.max(1, s * 0.015)) + `<circle cx="${f(cx)}" cy="${f(top + s * 0.4)}" r="${f(s * 0.55)}" fill="url(#${id}gl)"/><path d="M${f(cx - s * 0.15)} ${f(top)} H${f(cx + s * 0.15)} L${f(cx + s * 0.4)} ${f(top + s * 0.35)} L${f(cx + s * 0.15)} ${f(top + s * 0.7)} H${f(cx - s * 0.15)} L${f(cx - s * 0.4)} ${f(top + s * 0.35)}Z" fill="${c1}"/><path d="M${f(cx - s * 0.4)} ${f(top + s * 0.35)} H${f(cx + s * 0.4)}" stroke="${c2}" stroke-width="${f(s * 0.03)}"/><path d="M${f(cx)} ${f(top)} V${f(top + s * 0.7)}" stroke="${c2}" stroke-width="${f(s * 0.02)}"/>` + [-0.12, -0.06, 0, 0.06, 0.12].map((k) => sstroke(`M${f(cx + k * s)} ${f(top + s * 0.7)} V${f(h * 0.98)}`, k ? c3 : c2, Math.max(1, s * 0.02))).join(''), defs);
    }
    if (p.kind === 'sparkler') {
      const r = rng(seed);
      let out = sstroke(`M${f(w * 0.2)} ${f(h)} L${f(w * 0.55)} ${f(h * 0.4)}`, '#64748B', Math.max(1, S * 0.012));
      for (let i = 0; i < 46; i++) { const a = r() * Math.PI * 2; const d = S * (0.05 + r() * 0.28); out += sstroke(`M${f(w * 0.55)} ${f(h * 0.4)} L${f(w * 0.55 + Math.cos(a) * d)} ${f(h * 0.4 + Math.sin(a) * d)}`, i % 2 ? c2 : '#FFFFFF', Math.max(0.6, S * 0.004)); }
      return svg(w, h, `<circle cx="${f(w * 0.55)}" cy="${f(h * 0.4)}" r="${f(S * 0.32)}" fill="url(#${id}gl)"/>` + out, defs);
    }
    // hanging diyas
    const n = Math.max(3, Math.round(w / (h * 0.5)));
    let out = sstroke(`M0 ${f(h * 0.04)} H${f(w)}`, c2, Math.max(1, h * 0.012));
    for (let i = 0; i < n; i++) {
      const x = ((i + 0.5) * w) / n;
      const L = h * (0.45 + (i % 2) * 0.25);
      out += sstroke(`M${f(x)} ${f(h * 0.04)} V${f(L)}`, c2, Math.max(1, h * 0.008)) + diya(x, L + h * 0.2, h * 0.24, c1, c2, c3, id);
    }
    return svg(w, h, out, defs);
  },

  // ---------- flowers ----------
  oflora(w, h, [c1, c2, c3], seed, id, p) {
    const r = rng(seed);
    const S = Math.min(w, h);
    switch (p.kind) {
      case 'lotus': return svg(w, h, lotus(w / 2, h * 0.75, S * 0.95, c1, c2, c3));
      case 'lotusline': return svg(w, h, lotus(w / 2, h * 0.75, S * 0.95, c1, c2, c3, true));
      case 'lotusrow': { const n = Math.max(3, Math.round(w / h)); let out = ''; for (let i = 0; i < n; i++) out += lotus(((i + 0.5) * w) / n, h * 0.8, h * 0.85, c1, c2, c3); return svg(w, h, out); }
      case 'rose': return svg(w, h, rose(w / 2, h / 2, S * 0.3, c1, c2) + leaf(w / 2 + S * 0.2, h / 2 + S * 0.15, S * 0.32, 30, c3) + leaf(w / 2 - S * 0.2, h / 2 + S * 0.15, S * 0.32, 150, c3));
      case 'bunch': {
        let out = '';
        for (let i = 0; i < 9; i++) out += leaf(w / 2, h * 0.65, S * (0.35 + r() * 0.15), -160 + i * 18 + r() * 8, c3);
        [[0.5, 0.4, 0.17], [0.32, 0.48, 0.13], [0.68, 0.48, 0.13], [0.42, 0.62, 0.11], [0.6, 0.64, 0.11]].forEach(([x, y, s], i) => { out += i % 2 ? rose(w * x, h * y, S * s, c1, c2) : marigold(w * x, h * y, S * s, c2, c1); });
        return svg(w, h, out);
      }
      case 'corner': {
        let out = '';
        for (let i = 0; i < 7; i++) out += leaf(S * 0.15, S * 0.15, S * (0.45 + r() * 0.2), i * 13 + r() * 6, c3);
        [[0.22, 0.22, 0.17], [0.52, 0.12, 0.11], [0.12, 0.52, 0.11], [0.42, 0.4, 0.09]].forEach(([x, y, s], i) => { out += i % 2 ? jasmine(S * x, S * y, S * s, '#FFFFFF', c2) : rose(S * x, S * y, S * s, c1, c2); });
        return svg(w, h, out);
      }
      default: { // flower scatter
        let out = '';
        for (let i = 0; i < 16; i++) { const x = r() * w; const y = r() * h; const s = S * (0.035 + r() * 0.05); out += [rose(x, y, s, c1, c2), marigold(x, y, s, c2, c1), jasmine(x, y, s * 1.2, '#FFFFFF', c2), flower(x, y, s, c1, c2)][i % 4]; }
        return svg(w, h, out);
      }
    }
  },

  // ---------- wreaths ----------
  owreath(w, h, [c1, c2, c3], seed, id, p) {
    const r = rng(seed);
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.4;
    let out = '';
    const n = 28;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const deg = (a * 180) / Math.PI;
      out += leaf(cx + Math.cos(a) * R, cy + Math.sin(a) * R, R * 0.32, deg + 100 + r() * 20, i % 2 ? c1 : c3 || c1);
      out += leaf(cx + Math.cos(a) * R, cy + Math.sin(a) * R, R * 0.28, deg - 80 - r() * 20, c1);
    }
    if (p.kind === 'berries') for (let i = 0; i < 18; i++) { const a = r() * Math.PI * 2; out += `<circle cx="${f(cx + Math.cos(a) * R * (0.9 + r() * 0.2))}" cy="${f(cy + Math.sin(a) * R * (0.9 + r() * 0.2))}" r="${f(R * 0.045)}" fill="${c2}"/>`; }
    if (p.kind === 'floral') for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; out += i % 2 ? rose(cx + Math.cos(a) * R, cy + Math.sin(a) * R, R * 0.13, c2, '#9F1239') : marigold(cx + Math.cos(a) * R, cy + Math.sin(a) * R, R * 0.13, '#FF8C00', '#FFC300'); }
    if (p.kind === 'bow') out += `<path d="M${f(cx)} ${f(cy + R)} l${f(-R * 0.3)} ${f(-R * 0.18)} v${f(R * 0.36)}Z M${f(cx)} ${f(cy + R)} l${f(R * 0.3)} ${f(-R * 0.18)} v${f(R * 0.36)}Z" fill="${c2}"/><path d="M${f(cx)} ${f(cy + R)} l${f(-R * 0.15)} ${f(R * 0.4)} M${f(cx)} ${f(cy + R)} l${f(R * 0.15)} ${f(R * 0.4)}" stroke="${c2}" stroke-width="${f(R * 0.07)}"/>`;
    return svg(w, h, out);
  },

  // ---------- scroll banners ----------
  oscroll(w, h, [c1, c2, c3], seed, id, p) {
    const e = h * 0.45;
    if (p.kind === 'parchment') return svg(w, h, `<rect x="${f(e * 0.5)}" y="${f(h * 0.12)}" width="${f(w - e)}" height="${f(h * 0.76)}" fill="${c1}"/><ellipse cx="${f(e * 0.5)}" cy="${f(h / 2)}" rx="${f(e * 0.35)}" ry="${f(h * 0.5)}" fill="${c2}"/><ellipse cx="${f(w - e * 0.5)}" cy="${f(h / 2)}" rx="${f(e * 0.35)}" ry="${f(h * 0.5)}" fill="${c2}"/><ellipse cx="${f(e * 0.5)}" cy="${f(h / 2)}" rx="${f(e * 0.15)}" ry="${f(h * 0.3)}" fill="${c3}"/><ellipse cx="${f(w - e * 0.5)}" cy="${f(h / 2)}" rx="${f(e * 0.15)}" ry="${f(h * 0.3)}" fill="${c3}"/>`);
    if (p.kind === 'curl') return svg(w, h, `<path d="M${f(e)} ${f(h * 0.1)} H${f(w - e)} V${f(h * 0.75)} H${f(e)}Z" fill="${c1}"/><path d="M${f(e)} ${f(h * 0.1)} C${f(e * 0.2)} ${f(h * 0.1)} ${f(e * 0.2)} ${f(h * 0.55)} ${f(e)} ${f(h * 0.55)} V${f(h * 0.75)} C${f(0)} ${f(h * 0.75)} ${f(0)} ${f(h * 0.1)} ${f(e)} ${f(h * 0.1)}Z" fill="${c2}"/><path d="M${f(w - e)} ${f(h * 0.1)} C${f(w - e * 0.2)} ${f(h * 0.1)} ${f(w - e * 0.2)} ${f(h * 0.55)} ${f(w - e)} ${f(h * 0.55)} V${f(h * 0.75)} C${f(w)} ${f(h * 0.75)} ${f(w)} ${f(h * 0.1)} ${f(w - e)} ${f(h * 0.1)}Z" fill="${c2}"/>${sstroke(`M${f(e)} ${f(h * 0.18)} H${f(w - e)} M${f(e)} ${f(h * 0.67)} H${f(w - e)}`, c3, Math.max(1, h * 0.02))}`);
    // folded ribbon with curls
    return svg(w, h, `<path d="M0 ${f(h * 0.35)} H${f(e * 1.3)} V${f(h * 0.95)} H0 L${f(e * 0.45)} ${f(h * 0.65)}Z" fill="${c2}"/><path d="M${f(w)} ${f(h * 0.35)} H${f(w - e * 1.3)} V${f(h * 0.95)} H${f(w)} L${f(w - e * 0.45)} ${f(h * 0.65)}Z" fill="${c2}"/><path d="M${f(e * 0.9)} ${f(h * 0.82)} L${f(e * 1.3)} ${f(h * 0.95)} V${f(h * 0.82)}Z M${f(w - e * 0.9)} ${f(h * 0.82)} L${f(w - e * 1.3)} ${f(h * 0.95)} V${f(h * 0.82)}Z" fill="${darker(c2)}"/><path d="M${f(e * 0.9)} ${f(h * 0.05)} Q${f(w / 2)} ${f(p.arc ? -h * 0.15 : h * 0.05)} ${f(w - e * 0.9)} ${f(h * 0.05)} V${f(h * 0.82)} Q${f(w / 2)} ${f(p.arc ? h * 0.62 : h * 0.82)} ${f(e * 0.9)} ${f(h * 0.82)}Z" fill="${c1}"/>${sstroke(`M${f(e * 1.1)} ${f(h * 0.14)} Q${f(w / 2)} ${f(p.arc ? -h * 0.05 : h * 0.14)} ${f(w - e * 1.1)} ${f(h * 0.14)}`, c3, Math.max(1, h * 0.02), 'stroke-dasharray="1 4"')}`);
  },

  // ---------- arches & temples ----------
  oarch(w, h, [c1, c2, c3], seed, id, p) {
    const t = Math.max(1.5, Math.min(w, h) * 0.012);
    if (p.kind === 'temple') {
      const base = h * 0.95;
      return svg(w, h, `<path d="M${f(w * 0.1)} ${f(base)} V${f(h * 0.55)} H${f(w * 0.25)} L${f(w * 0.35)} ${f(h * 0.3)} Q${f(w * 0.5)} ${f(h * 0.02)} ${f(w * 0.65)} ${f(h * 0.3)} L${f(w * 0.75)} ${f(h * 0.55)} H${f(w * 0.9)} V${f(base)}Z" fill="${c1}"/><path d="M${f(w * 0.42)} ${f(base)} V${f(h * 0.7)} Q${f(w * 0.5)} ${f(h * 0.58)} ${f(w * 0.58)} ${f(h * 0.7)} V${f(base)}Z" fill="${c2}"/>${sstroke(`M${f(w * 0.5)} ${f(h * 0.06)} V${f(-h * 0.02)}`, c3, t)}<path d="M${f(w * 0.5)} ${f(-h * 0.02)} l${f(w * 0.08)} ${f(h * 0.03)} l${f(-w * 0.08)} ${f(h * 0.03)}Z" fill="${c3}"/>`);
    }
    if (p.kind === 'dome') return svg(w, h, `<path d="M${f(w * 0.08)} ${f(h)} V${f(h * 0.55)} Q${f(w * 0.08)} ${f(h * 0.12)} ${f(w / 2)} ${f(h * 0.06)} Q${f(w * 0.92)} ${f(h * 0.12)} ${f(w * 0.92)} ${f(h * 0.55)} V${f(h)}Z" fill="${c1}"/><circle cx="${f(w / 2)}" cy="${f(h * 0.04)}" r="${f(Math.min(w, h) * 0.03)}" fill="${c2}"/>`);
    const fill = p.kind === 'filled';
    const d = `M${f(t)} ${f(h - t)} V${f(h * 0.42)} Q${f(t)} ${f(h * 0.18)} ${f(w * 0.25)} ${f(h * 0.12)} Q${f(w * 0.45)} ${f(h * 0.08)} ${f(w / 2)} ${f(t)} Q${f(w * 0.55)} ${f(h * 0.08)} ${f(w * 0.75)} ${f(h * 0.12)} Q${f(w - t)} ${f(h * 0.18)} ${f(w - t)} ${f(h * 0.42)} V${f(h - t)}Z`;
    return svg(w, h, `<path d="${d}" fill="${fill ? c1 : 'none'}" stroke="${fill ? c2 : c1}" stroke-width="${f(t * (fill ? 1 : 2))}"/>${fill ? '' : `<path d="${d}" transform="translate(${f(w * 0.06)} ${f(h * 0.05)}) scale(.88 .94)" fill="none" stroke="${c2}" stroke-width="${f(t)}"/>`}`);
  },

  // ---------- gradient waves ----------
  owaves(w, h, cols, seed, id, p) {
    const n = p.layers || 3;
    let defs = '';
    let out = '';
    for (let i = 0; i < n; i++) {
      const a = cols[i % cols.length];
      const b = cols[(i + 1) % cols.length];
      defs += linear(`${id}${i}`, a, b, false);
      const y = h * (0.2 + (i * 0.55) / n);
      const amp = h * (0.08 + 0.05 * (p.amp || 1));
      const ph = i * 1.1 + (seed % 7);
      const pts = [];
      for (let k = 0; k <= 40; k++) { const t = k / 40; pts.push([t * w, y + Math.sin(t * Math.PI * (p.waves || 1.4) + ph) * amp]); }
      out += `<path d="M${pts.map(([x, yy]) => `${f(x)} ${f(yy)}`).join(' L')} L${f(w)} ${f(h)} L0 ${f(h)}Z" fill="url(#${id}${i})" opacity="${f(0.55 + (0.45 * (i + 1)) / n)}"/>`;
    }
    return svg(w, h, p.top ? `<g transform="translate(0 ${f(h)}) scale(1 -1)">${out}</g>` : out, defs);
  },
  ocornerwave(w, h, cols, seed, id, p) {
    let defs = '';
    let out = '';
    const n = p.n || 3;
    for (let i = 0; i < n; i++) {
      const k = 1 - i * (0.6 / n);
      defs += linear(`${id}${i}`, cols[i % cols.length], cols[(i + 1) % cols.length], false);
      out += `<path d="M0 ${f(h)} V${f(h * (1 - k))} C${f(w * 0.35 * k)} ${f(h * (1 - k * 0.3))} ${f(w * 0.65 * k)} ${f(h * (1 - k * 0.05))} ${f(w * k)} ${f(h)}Z" fill="url(#${id}${i})"/>`;
    }
    return svg(w, h, out, defs);
  },

  // ---------- tricolour ----------
  otricolour(w, h, cols, seed, id, p) {
    const [o, wh, g] = ['#FF9933', '#FFFFFF', '#138808'];
    const navy = '#000080';
    const chakra = (cx, cy, R) => {
      let s = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R)}" fill="none" stroke="${navy}" stroke-width="${f(Math.max(1, R * 0.1))}"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R * 0.15)}" fill="${navy}"/>`;
      for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; s += `<line x1="${f(cx)}" y1="${f(cy)}" x2="${f(cx + Math.cos(a) * R)}" y2="${f(cy + Math.sin(a) * R)}" stroke="${navy}" stroke-width="${f(Math.max(0.6, R * 0.045))}"/>`; }
      return s;
    };
    const v = p.v || 0;
    if (p.kind === 'chakra') {
      const R = Math.min(w, h) * (v ? 0.32 : 0.45);
      let ring = '';
      if (v === 1) for (let i = 0; i < 24; i++) ring += `<path d="M0 0 Q${f(R * 0.12)} ${f(R * 0.25)} 0 ${f(R * 0.5)} Q${f(-R * 0.12)} ${f(R * 0.25)} 0 0Z" transform="translate(${f(w / 2)} ${f(h / 2)}) rotate(${f(i * 15)}) translate(0 ${f(R * 1.08)})" fill="${i % 2 ? o : g}"/>`;
      if (v === 2) ring = [o, wh, g].map((c, i) => `<circle cx="${f(w / 2)}" cy="${f(h / 2)}" r="${f(R * (1.42 - i * 0.12))}" fill="none" stroke="${c}" stroke-width="${f(R * 0.12)}"/>`).join('');
      return svg(w, h, ring + chakra(w / 2, h / 2, R));
    }
    if (p.kind === 'swirl') {
      const k = [0.2, 0.12, 0.28, 0.16][v % 4];
      const bend = [0.2, 0.35, 0.1, 0.45][v % 4];
      return svg(w, h, [o, wh, g].map((c, i) => `<path d="M0 ${f(h * (0.25 + i * 0.25))} C${f(w * 0.3)} ${f(h * (0.25 - bend + i * 0.25))} ${f(w * 0.6)} ${f(h * (0.25 + bend + i * 0.25))} ${f(w)} ${f(h * (0.2 + i * 0.25))}" fill="none" stroke="${c === wh ? '#F1F5F9' : c}" stroke-width="${f(h * k)}" stroke-linecap="round"/>`).join(''));
    }
    if (p.kind === 'balloons') { let out = ''; const order = [[o, wh, g, o, g], [g, o, wh, g, o], [o, o, wh, g, g]][v % 3]; order.forEach((c, i) => { const x = w * (0.15 + i * 0.175); const y = h * (0.25 + ((i + v) % 3) * 0.08); const bw = w * 0.14; out += sstroke(`M${f(x)} ${f(y + bw * 0.6)} Q${f(x + bw * 0.1)} ${f(y + bw * 1.4)} ${f(x)} ${f(h)}`, '#94A3B8', 1.2) + `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(bw * 0.42)}" ry="${f(bw * 0.52)}" fill="${c}" stroke="${c === wh ? '#CBD5E1' : 'none'}"/>`; }); return svg(w, h, out); }
    if (p.kind === 'band') {
      const a = h * [0.1, 0.2, 0.03][v % 3];
      return svg(w, h, [o, wh, g].map((c, i) => `<path d="M0 ${f((h / 3) * i)} C${f(w * 0.3)} ${f((h / 3) * i - a)} ${f(w * 0.6)} ${f((h / 3) * i + a)} ${f(w)} ${f((h / 3) * i)} V${f((h / 3) * (i + 1))} C${f(w * 0.6)} ${f((h / 3) * (i + 1) + a)} ${f(w * 0.3)} ${f((h / 3) * (i + 1) - a)} 0 ${f((h / 3) * (i + 1))}Z" fill="${c}"/>`).join('') + (v === 2 ? '' : chakra(w / 2, h / 2, h * 0.13)));
    }
    if (p.kind === 'corner' && v === 1) return svg(w, h, [g, wh, o].map((c, i) => `<path d="M0 0 H${f(w * (0.95 - i * 0.25))} A${f(w * (0.95 - i * 0.25))} ${f(h * (0.95 - i * 0.25))} 0 0 1 0 ${f(h * (0.95 - i * 0.25))}Z" fill="${c === wh ? '#F8FAFC' : c}"/>`).join('') + chakra(w * 0.18, h * 0.18, Math.min(w, h) * 0.1));
    if (p.kind === 'corner' && v === 2) return svg(w, h, [o, wh, g].map((c, i) => `<path d="M0 ${f(h * (0.15 + i * 0.22))} L${f(w * (0.15 + i * 0.22))} 0" stroke="${c === wh ? '#E2E8F0' : c}" stroke-width="${f(Math.min(w, h) * 0.16)}" stroke-linecap="round"/>`).join(''));
    if (p.kind === 'corner') return svg(w, h, `<path d="M0 0 H${f(w * 0.9)} C${f(w * 0.5)} ${f(h * 0.1)} ${f(w * 0.1)} ${f(h * 0.5)} 0 ${f(h * 0.9)}Z" fill="${o}"/><path d="M0 0 H${f(w * 0.65)} C${f(w * 0.35)} ${f(h * 0.08)} ${f(w * 0.08)} ${f(h * 0.35)} 0 ${f(h * 0.65)}Z" fill="#FFFFFF"/><path d="M0 0 H${f(w * 0.42)} C${f(w * 0.22)} ${f(h * 0.06)} ${f(w * 0.06)} ${f(h * 0.22)} 0 ${f(h * 0.42)}Z" fill="${g}"/>`);
    // waving flag on a pole
    const pole = v !== 1;
    const fw = w * (pole ? 0.8 : 0.9);
    const fh = h * (pole ? 0.5 : 0.6);
    const x0 = pole ? w * 0.12 : w * 0.05;
    const y0 = pole ? h * 0.1 : h * 0.2;
    const wv = fh * [0.12, 0.08, 0.2, 0.04][v % 4];
    const band = (i, c) => `<path d="M${f(x0)} ${f(y0 + (fh / 3) * i)} C${f(x0 + fw * 0.3)} ${f(y0 + (fh / 3) * i - wv)} ${f(x0 + fw * 0.6)} ${f(y0 + (fh / 3) * i + wv)} ${f(x0 + fw)} ${f(y0 + (fh / 3) * i)} V${f(y0 + (fh / 3) * (i + 1))} C${f(x0 + fw * 0.6)} ${f(y0 + (fh / 3) * (i + 1) + wv)} ${f(x0 + fw * 0.3)} ${f(y0 + (fh / 3) * (i + 1) - wv)} ${f(x0)} ${f(y0 + (fh / 3) * (i + 1))}Z" fill="${c}"/>`;
    return svg(w, h, (pole ? `<rect x="${f(x0 - w * 0.025)}" y="${f(y0 - h * 0.04)}" width="${f(w * 0.025)}" height="${f(h * 0.94)}" fill="#78716C"/><circle cx="${f(x0 - w * 0.0125)}" cy="${f(y0 - h * 0.05)}" r="${f(w * 0.022)}" fill="#D4A017"/>` : '') + band(0, o) + band(1, wh) + band(2, g) + chakra(x0 + fw / 2, y0 + fh / 2, fh * 0.13));
  },

  // ---------- auspicious symbols ----------
  osymbol(w, h, [c1, c2, c3], seed, id, p) {
    const S = Math.min(w, h);
    const cx = w / 2;
    const cy = h / 2;
    if (p.kind === 'om') return svg(w, h, `${p.ring ? `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(S * 0.47)}" fill="${c2}"/>` : ''}<text x="${f(cx)}" y="${f(cy + S * 0.3)}" font-size="${f(S * (p.ring ? 0.68 : 0.85))}" text-anchor="middle" fill="${c1}" font-family="'Noto Sans Devanagari','Kohinoor Devanagari','Mangal',sans-serif" font-weight="700">ॐ</text>`);
    if (p.kind === 'swastik') {
      const a = S * 0.38;
      const t = S * 0.09;
      const d = `M${f(cx)} ${f(cy - a)} V${f(cy + a)} M${f(cx - a)} ${f(cy)} H${f(cx + a)} M${f(cx)} ${f(cy - a)} H${f(cx + a)} M${f(cx + a)} ${f(cy)} V${f(cy + a)} M${f(cx)} ${f(cy + a)} H${f(cx - a)} M${f(cx - a)} ${f(cy)} V${f(cy - a)}`;
      return svg(w, h, `${p.ring ? `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(S * 0.49)}" fill="${c2}"/>` : ''}<path d="${d}" stroke="${c1}" stroke-width="${f(t)}" stroke-linecap="square" fill="none"/>` + [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => `<circle cx="${f(cx + sx * a * 0.5)}" cy="${f(cy + sy * a * 0.5)}" r="${f(t * 0.55)}" fill="${c1}"/>`).join(''));
    }
    if (p.kind === 'kalash') {
      const s = S;
      let out = '';
      for (let i = 0; i < 5; i++) out += leaf(cx, cy - s * 0.12, s * 0.32, -160 + i * 35, c3);
      out += `<circle cx="${f(cx)}" cy="${f(cy - s * 0.2)}" r="${f(s * 0.12)}" fill="#8B5E3C"/>${sstroke(`M${f(cx)} ${f(cy - s * 0.32)} l${f(-s * 0.04)} ${f(-s * 0.08)} M${f(cx)} ${f(cy - s * 0.32)} l${f(s * 0.04)} ${f(-s * 0.08)}`, c3, s * 0.015)}`;
      out += `<rect x="${f(cx - s * 0.12)}" y="${f(cy - s * 0.1)}" width="${f(s * 0.24)}" height="${f(s * 0.08)}" rx="${f(s * 0.02)}" fill="${c2}"/><path d="M${f(cx - s * 0.1)} ${f(cy - s * 0.02)} C${f(cx - s * 0.45)} ${f(cy + s * 0.05)} ${f(cx - s * 0.4)} ${f(cy + s * 0.48)} ${f(cx)} ${f(cy + s * 0.46)} C${f(cx + s * 0.4)} ${f(cy + s * 0.48)} ${f(cx + s * 0.45)} ${f(cy + s * 0.05)} ${f(cx + s * 0.1)} ${f(cy - s * 0.02)}Z" fill="${c1}"/>`;
      // tilak (U mark with a red dot) and two decorative bands
      out += sstroke(`M${f(cx - s * 0.05)} ${f(cy + s * 0.13)} Q${f(cx)} ${f(cy + s * 0.29)} ${f(cx + s * 0.05)} ${f(cy + s * 0.13)}`, c2, s * 0.022) + `<circle cx="${f(cx)}" cy="${f(cy + s * 0.2)}" r="${f(s * 0.022)}" fill="#DC2626"/>`;
      out += sstroke(`M${f(cx - s * 0.31)} ${f(cy + s * 0.07)} Q${f(cx)} ${f(cy + s * 0.15)} ${f(cx + s * 0.31)} ${f(cy + s * 0.07)}`, c2, s * 0.022) + sstroke(`M${f(cx - s * 0.33)} ${f(cy + s * 0.32)} Q${f(cx)} ${f(cy + s * 0.4)} ${f(cx + s * 0.33)} ${f(cy + s * 0.32)}`, c2, s * 0.018, 'stroke-dasharray="1 5"');
      return svg(w, h, out);
    }
    if (p.kind === 'bells') return svg(w, h, sstroke(`M${f(w * 0.3)} 0 V${f(h * 0.3)} M${f(w * 0.7)} 0 V${f(h * 0.45)}`, '#8B5E00', Math.max(1, S * 0.012)) + bell(w * 0.3, h * 0.3, S * 0.5, c1, c2) + bell(w * 0.7, h * 0.45, S * 0.42, c1, c2));
    // Lakshmi charan: a pair of footprints with toes and an alta dot
    const foot = (x, inner) => {
      const fx = w * x;
      const sole = `M${f(fx)} ${f(h * 0.92)} C${f(fx - S * 0.09)} ${f(h * 0.92)} ${f(fx - S * 0.1)} ${f(h * 0.72)} ${f(fx - S * 0.08)} ${f(h * 0.6)} C${f(fx - S * 0.06)} ${f(h * 0.47)} ${f(fx - S * 0.1)} ${f(h * 0.38)} ${f(fx)} ${f(h * 0.36)} C${f(fx + S * 0.12)} ${f(h * 0.37)} ${f(fx + S * 0.1)} ${f(h * 0.52)} ${f(fx + S * 0.08)} ${f(h * 0.62)} C${f(fx + S * 0.07)} ${f(h * 0.74)} ${f(fx + S * 0.08)} ${f(h * 0.92)} ${f(fx)} ${f(h * 0.92)}Z`;
      const toes = [0.045, 0.034, 0.03, 0.026, 0.022].map((r, i) => {
        const k = inner * (i - 0.4) * 0.042;
        return `<circle cx="${f(fx + k * S)}" cy="${f(h * 0.3 + Math.abs(i - 0.4) * S * 0.018 - (i ? 0 : S * 0.012))}" r="${f(r * S)}" fill="${c1}"/>`;
      }).join('');
      return `<path d="${sole}" fill="${c1}" transform="scale(${inner < 0 ? -1 : 1} 1) translate(${inner < 0 ? f(-2 * fx) : 0} 0)"/>${toes}<circle cx="${f(fx)}" cy="${f(h * 0.62)}" r="${f(S * 0.035)}" fill="${c2}"/><circle cx="${f(fx)}" cy="${f(h * 0.62)}" r="${f(S * 0.015)}" fill="${c1}"/>`;
    };
    return svg(w, h, foot(0.36, -1) + foot(0.64, 1));
  },

  // ---------- ornate dividers ----------
  odivider(w, h, [c1, c2, c3], seed, id, p) {
    const cy = h / 2;
    const t = Math.max(1.2, h * 0.05);
    const cx = w / 2;
    const o = h * 0.42;
    let out = '';
    const center = {
      lotus: lotus(cx, cy + o * 0.6, o * 1.8, c2, c3, c1),
      paisley: paisley(cx - o * 0.6, cy, o * 1.4, 270, c2, c3) + paisley(cx + o * 0.6, cy, o * 1.4, 90, c2, c3),
      flower: marigold(cx, cy, o * 0.8, c2, c3),
      diamond: `<path d="M${f(cx)} ${f(cy - o)} L${f(cx + o * 0.7)} ${f(cy)} L${f(cx)} ${f(cy + o)} L${f(cx - o * 0.7)} ${f(cy)}Z" fill="${c2}"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(o * 0.25)}" fill="${c3}"/>`,
      diya: diya(cx, cy + o * 0.9, o * 1.6, c2, c1, c3, id, false),
    }[p.center] || '';
    const g = o * 1.6;
    if (p.kind === 'scroll') {
      out += scrollCurl(cx - g, cy, o * 2, -1, c1, t) + scrollCurl(cx + g, cy, o * 2, 1, c1, t);
      out += sstroke(`M${f(cx - g - o * 1.7)} ${f(cy + o * 0.15)} H${f(w * 0.04)} M${f(cx + g + o * 1.7)} ${f(cy + o * 0.15)} H${f(w * 0.96)}`, c1, t * 0.7);
    } else if (p.kind === 'dots') {
      for (let x = w * 0.05; x < cx - g; x += o * 0.7) out += `<circle cx="${f(x)}" cy="${f(cy)}" r="${f(o * 0.12 * (0.4 + (x / (cx - g)) * 0.8))}" fill="${c1}"/>`;
      for (let x = w * 0.95; x > cx + g; x -= o * 0.7) out += `<circle cx="${f(x)}" cy="${f(cy)}" r="${f(o * 0.12 * (0.4 + ((w - x) / (cx - g)) * 0.8))}" fill="${c1}"/>`;
    } else {
      out += `<path d="M${f(w * 0.03)} ${f(cy)} Q${f(cx * 0.6)} ${f(cy - o * 0.5)} ${f(cx - g)} ${f(cy)} Q${f(cx * 0.6)} ${f(cy + o * 0.5)} ${f(w * 0.03)} ${f(cy)}Z M${f(w * 0.97)} ${f(cy)} Q${f(w - cx * 0.6)} ${f(cy - o * 0.5)} ${f(cx + g)} ${f(cy)} Q${f(w - cx * 0.6)} ${f(cy + o * 0.5)} ${f(w * 0.97)} ${f(cy)}Z" fill="${c1}"/>`;
    }
    return svg(w, h, out + center, radial(`${id}gl`, '#FFD166', 0.7));
  },
};

function darker(hex, k = 0.7) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const c = (v) => Math.round(v * k).toString(16).padStart(2, '0');
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
}

// ---------- presets ----------
const GOLD = ['#D4A017', '#F5D27A', '#8B5E00'];
const SCHEMES = {
  gold: ['#D4A017', '#F5D27A', '#8B5E00', '#FFFFFF'], saffron: ['#FF7A00', '#FFC300', '#C2185B', '#FFFFFF'], peacock: ['#0E7490', '#16A34A', '#1E3A8A', '#FBBF24'],
  maroon: ['#8B1E2D', '#D4A017', '#F5D27A', '#FFFFFF'], pink: ['#EC4899', '#F9A8D4', '#BE185D', '#FDE68A'], purple: ['#7C3AED', '#F0ABFC', '#4C1D95', '#FDE68A'],
  rangoli: ['#FF6B00', '#E91E63', '#FFC107', '#00A86B', '#3F51B5'], white: ['#FFFFFF', '#FDE68A', '#F8FAFC', '#FFFFFF'], teal: ['#14B8A6', '#5EEAD4', '#0F766E', '#FDE68A'],
  red: ['#DC2626', '#FCA5A5', '#7F1D1D', '#FDE68A'], blue: ['#2563EB', '#93C5FD', '#1E3A8A', '#FDE68A'], green: ['#16A34A', '#BBF7D0', '#14532D', '#FACC15'],
};
const SCHEME_NAMES = Object.keys(SCHEMES);

export const ORNAMENT_CATS = ['Mandala', 'Rangoli', 'Garlands & toran', 'Ornate frames', 'Paisley', 'Flowers & lotus', 'Wreaths', 'Diwali & lamps', 'Lights & glitter', 'Celebration', 'Sunburst & glow', 'Ribbons & scrolls', 'Arches & temples', 'Gradient waves', 'Tricolour', 'Auspicious symbols', 'Ornate dividers'];

const list = [];
const add = (cat, family, name, params, colors, size) => list.push({ key: `orn-${list.length}`, cat, family, name, params, colors, size, seed: list.length * 104729 + 31 });

// Mandala: 4 styles × 20 colour/seed variations
['filled', 'line', 'dotted', 'mixed'].forEach((style) => {
  for (let i = 0; i < 20; i++) {
    const sch = SCHEME_NAMES[(i + style.length) % SCHEME_NAMES.length];
    add('Mandala', 'omandala', `Mandala · ${style} ${i + 1}`, { style, layers: 3 + (i % 3) }, style === 'line' ? [SCHEMES[sch][0], SCHEMES[sch][1], SCHEMES[sch][2]] : SCHEMES[sch], 'square');
  }
});
// Rangoli: 40
for (let i = 0; i < 40; i++) {
  const base = SCHEMES.rangoli;
  const rot = i % base.length;
  add('Rangoli', 'orangoli', `Rangoli ${i + 1}`, {}, [...base.slice(rot), ...base.slice(0, rot)], 'square');
}
// Garlands: 4 flowers × 2 strands × 5 hangings
['marigold', 'rose', 'jasmine', 'mixed'].forEach((flowerKind) => [1, 2].forEach((strands) => ['none', 'bell', 'tassel', 'leaf', 'lari'].forEach((drop) => {
  const cols = flowerKind === 'rose' ? ['#E11D48', '#F43F5E', '#15803D', '#E11D48'] : flowerKind === 'jasmine' ? ['#FFFFFF', '#FACC15', '#15803D', '#E11D48'] : ['#FF8C00', '#FFC300', '#2E7D32', '#E11D48'];
  add('Garlands & toran', 'ogarland', `${flowerKind[0].toUpperCase() + flowerKind.slice(1)} garland${strands === 2 ? ' · double' : ''}${drop === 'none' ? '' : ` · ${drop === 'lari' ? 'hanging strings' : drop === 'bell' ? 'bells' : drop === 'tassel' ? 'tassels' : 'leaves'}`}`, { flower: flowerKind, strands, drop }, cols, drop === 'none' ? 'garland' : 'garlandTall');
})));
// Ornate frames: 8 styles × 5 colours
['flourish', 'floral', 'paisley', 'mughal', 'beads', 'filigree', 'leafy', 'royal'].forEach((style) => ['gold', 'maroon', 'saffron', 'peacock', 'white'].forEach((sch) => add('Ornate frames', 'oframe', `Frame · ${style} · ${sch}`, { style }, style === 'leafy' ? [SCHEMES[sch][0], '#15803D', SCHEMES[sch][2]] : SCHEMES[sch], 'page')));
// Paisley: 25
['single', 'pair', 'border', 'scatter'].forEach((kind, k) => {
  for (let i = 0; i < (kind === 'single' ? 7 : 6); i++) add('Paisley', 'opaisley', `Paisley · ${kind} ${i + 1}`, { kind, rot: i * 45 }, SCHEMES[SCHEME_NAMES[(i + k * 3) % SCHEME_NAMES.length]], kind === 'border' ? 'strip' : kind === 'scatter' ? 'page' : 'square');
});
// Flowers & lotus: 40
[['lotus', 8], ['lotusline', 6], ['lotusrow', 6], ['rose', 6], ['bunch', 6], ['corner', 4], ['scatter', 4]].forEach(([kind, n]) => {
  for (let i = 0; i < n; i++) {
    const cols = kind.startsWith('lotus') ? [['#EC4899', '#F9A8D4', '#16A34A'], ['#F472B6', '#FBCFE8', '#15803D'], ['#D4A017', '#F5D27A', '#8B5E00'], ['#FFFFFF', '#FDE68A', '#16A34A'], ['#C026D3', '#F0ABFC', '#15803D'], ['#FB7185', '#FECDD3', '#166534'], ['#E11D48', '#FDA4AF', '#14532D'], ['#F97316', '#FED7AA', '#15803D']][i % 8] : [['#E11D48', '#9F1239', '#15803D'], ['#F43F5E', '#BE123C', '#16A34A'], ['#FF8C00', '#FFC300', '#15803D'], ['#DB2777', '#831843', '#166534'], ['#F59E0B', '#B45309', '#15803D'], ['#EF4444', '#7F1D1D', '#14532D']][i % 6];
    add('Flowers & lotus', 'oflora', `${{ lotus: 'Lotus', lotusline: 'Lotus outline', lotusrow: 'Lotus row', rose: 'Rose', bunch: 'Flower bunch', corner: 'Floral corner', scatter: 'Flower shower' }[kind]} ${i + 1}`, { kind }, cols, kind === 'lotusrow' ? 'strip' : kind === 'corner' ? 'corner' : kind === 'scatter' ? 'page' : 'square');
  }
});
// Wreaths: 20
['plain', 'berries', 'floral', 'bow'].forEach((kind) => {
  for (let i = 0; i < 5; i++) add('Wreaths', 'owreath', `Wreath · ${kind} ${i + 1}`, { kind }, [['#15803D', '#DC2626', '#22C55E'], ['#D4A017', '#8B1E2D', '#F5D27A'], ['#166534', '#F59E0B', '#4ADE80'], ['#0F766E', '#EC4899', '#5EEAD4'], ['#14532D', '#E11D48', '#16A34A']][i], 'square');
});
// Diwali & lamps: 30
[['big', 6], ['trio', 6], ['kandil', 6], ['sparkler', 6], ['hanging', 6]].forEach(([kind, n]) => {
  for (let i = 0; i < n; i++) add('Diwali & lamps', 'odiwali', `${{ big: 'Glowing diya', trio: 'Three diyas', kandil: 'Akash kandil', sparkler: 'Phuljhadi sparkler', hanging: 'Hanging diyas' }[kind]} ${i + 1}`, { kind }, [['#F59E0B', '#B45309', '#FFF7AE'], ['#FB923C', '#9A3412', '#FEF3C7'], ['#E11D48', '#D4A017', '#FDE68A'], ['#D97706', '#7C2D12', '#FFFBEB'], ['#C2410C', '#F59E0B', '#FEF9C3'], ['#EA580C', '#7F1D1D', '#FDE68A']][i], kind === 'hanging' ? 'garlandTall' : kind === 'kandil' ? 'tall' : kind === 'trio' ? 'strip' : 'square');
});
// Lights & glitter: 35
for (let i = 0; i < 12; i++) add('Lights & glitter', 'olights', `Fairy lights ${i + 1}`, { kind: 'fairy', strands: i % 3 === 2 ? 2 : 1 }, [['#FDE68A', '#FCA5A5', '#A7F3D0', '#BFDBFE'], ['#FDE68A', '#FBBF24'], ['#F472B6', '#A78BFA', '#60A5FA'], ['#FFFFFF', '#FDE68A']][i % 4], 'garland');
for (let i = 0; i < 12; i++) add('Lights & glitter', 'olights', `Gold glitter ${i + 1}`, { kind: 'glitter', fall: i % 2 }, [['#F5D27A', '#FFFFFF'], ['#D4A017', '#FDE68A'], ['#E2E8F0', '#FFFFFF'], ['#F9A8D4', '#FFFFFF']][i % 4], 'page');
for (let i = 0; i < 11; i++) add('Lights & glitter', 'olights', `Hexagon bokeh ${i + 1}`, { kind: 'hex' }, [['#FFFFFF', '#FDE68A'], ['#F472B6', '#FFFFFF'], ['#60A5FA', '#A78BFA'], ['#FBBF24', '#F97316']][i % 4], 'page');
// Celebration: 35
[['streamers', 7], ['stars', 7], ['metallic', 7], ['falling', 7], ['popper', 7]].forEach(([kind, n]) => {
  for (let i = 0; i < n; i++) add('Celebration', 'ocelebrate', `${{ streamers: 'Streamers', stars: 'Star confetti', metallic: 'Gold & silver confetti', falling: 'Falling confetti', popper: 'Party popper' }[kind]} ${i + 1}`, { kind }, [['#F59E0B', '#EC4899', '#3B82F6', '#10B981'], ['#EF4444', '#FACC15', '#22C55E'], ['#A855F7', '#F472B6', '#38BDF8'], ['#F97316', '#FDE047', '#E11D48'], ['#D4A017', '#FFFFFF', '#F5D27A'], ['#14B8A6', '#F43F5E', '#FBBF24'], ['#6366F1', '#EC4899', '#F59E0B']][i], 'page');
});
// Sunburst & glow: 30
[['center', 12], ['bottom', 8], ['corner', 4]].forEach(([from, n]) => {
  for (let i = 0; i < n; i++) add('Sunburst & glow', 'oburst', `Sunburst · ${from} ${i + 1}`, { from, n: [16, 20, 24, 32, 40, 48][i % 6], op: 0.14 + (i % 3) * 0.06, glow: 0.4 + (i % 4) * 0.1 }, [['#FFFFFF', '#FFE08A', '#FFFFFF'], ['#FFFFFF', '#FBCFE8', '#FFFFFF'], ['#FDE68A', '#FFFFFF', '#FDE68A'], ['#FFFFFF', '#BAE6FD', '#FFFFFF']][i % 4], 'page');
});
for (let i = 0; i < 6; i++) add('Sunburst & glow', 'oglow', `Glow orbs ${i + 1}`, { n: 2 + (i % 3) }, [['#F472B6', '#A78BFA', '#60A5FA'], ['#FBBF24', '#F97316', '#EF4444'], ['#34D399', '#22D3EE', '#818CF8'], ['#FFFFFF', '#FDE68A', '#FBCFE8']][i % 4], 'page');
// Ribbons & scrolls: 20
[['ribbon', 8], ['ribbonarc', 4], ['parchment', 4], ['curl', 4]].forEach(([kind, n]) => {
  for (let i = 0; i < n; i++) add('Ribbons & scrolls', 'oscroll', `${{ ribbon: 'Folded ribbon', ribbonarc: 'Arched ribbon', parchment: 'Parchment scroll', curl: 'Curled scroll' }[kind]} ${i + 1}`, { kind: kind === 'ribbonarc' ? 'ribbon' : kind, arc: kind === 'ribbonarc' }, kind === 'parchment' || kind === 'curl' ? [['#FEF3C7', '#D6B98C', '#A16207'], ['#FFF7ED', '#E7C9A0', '#92400E'], ['#FDF2F8', '#F9A8D4', '#9D174D'], ['#F0FDF4', '#BBF7D0', '#166534']][i % 4] : [SCHEMES[SCHEME_NAMES[i % SCHEME_NAMES.length]][0], darker(SCHEMES[SCHEME_NAMES[i % SCHEME_NAMES.length]][0], 0.6), '#FFFFFF'], 'ribbon');
});
// Arches & temples: 15
[['outline', 5], ['filled', 4], ['temple', 3], ['dome', 3]].forEach(([kind, n]) => {
  for (let i = 0; i < n; i++) add('Arches & temples', 'oarch', `${{ outline: 'Mughal arch', filled: 'Arch window', temple: 'Temple', dome: 'Dome' }[kind]} ${i + 1}`, { kind }, SCHEMES[['gold', 'maroon', 'saffron', 'peacock', 'white'][i % 5]], kind === 'outline' || kind === 'filled' ? 'arch' : 'square');
});
// Gradient waves: 30
for (let i = 0; i < 20; i++) add('Gradient waves', 'owaves', `Gradient waves ${i + 1}${i % 2 ? ' · top' : ''}`, { layers: 2 + (i % 3), amp: 0.6 + (i % 4) * 0.4, top: i % 2 === 1, waves: 1 + (i % 3) * 0.4 }, [['#7C3AED', '#EC4899', '#F59E0B'], ['#0EA5E9', '#22D3EE', '#A7F3D0'], ['#FF7A00', '#FFC300', '#E11D48'], ['#16A34A', '#84CC16', '#FACC15'], ['#1E3A8A', '#6366F1', '#F472B6']][i % 5], i % 2 ? 'bandTop' : 'band');
for (let i = 0; i < 10; i++) add('Gradient waves', 'ocornerwave', `Gradient corner ${i + 1}`, { n: 2 + (i % 3) }, [['#F59E0B', '#EC4899', '#7C3AED'], ['#22D3EE', '#3B82F6', '#1E3A8A'], ['#FF9933', '#FFC300', '#138808'], ['#F472B6', '#FB7185', '#FDE68A'], ['#10B981', '#14B8A6', '#0EA5E9']][i % 5], 'band');
// Tricolour: 20
[['flag', 4], ['chakra', 3], ['swirl', 4], ['balloons', 3], ['band', 3], ['corner', 3]].forEach(([kind, n]) => {
  for (let i = 0; i < n; i++) add('Tricolour', 'otricolour', `${{ flag: 'Waving flag', chakra: 'Ashoka chakra', swirl: 'Tricolour swirl', balloons: 'Tricolour balloons', band: 'Tricolour band', corner: 'Tricolour corner' }[kind]} ${i + 1}`, { kind, v: i }, ['#FF9933', '#FFFFFF', '#138808'], kind === 'band' || kind === 'swirl' ? 'banner' : kind === 'corner' ? 'corner' : 'square');
});
// Auspicious symbols: 15
[['om', 4], ['swastik', 4], ['kalash', 3], ['bells', 2], ['charan', 2]].forEach(([kind, n]) => {
  for (let i = 0; i < n; i++) add('Auspicious symbols', 'osymbol', `${{ om: 'Om', swastik: 'Swastik', kalash: 'Kalash', bells: 'Temple bells', charan: 'Lakshmi charan' }[kind]} ${i + 1}`, { kind, ring: i % 2 === 1 }, [['#D4A017', '#7F1D1D', '#15803D'], ['#C2410C', '#FEF3C7', '#15803D'], ['#B91C1C', '#FDE68A', '#16A34A'], ['#8B1E2D', '#F5D27A', '#166534']][i % 4], kind === 'bells' ? 'tall' : 'square');
});
// Ornate dividers: 20
['scroll', 'leafy', 'dots', 'scroll'].forEach((kind, k) => ['lotus', 'paisley', 'flower', 'diamond', 'diya'].forEach((center, i) => {
  add('Ornate dividers', 'odivider', `Divider · ${kind === 'leafy' ? 'leaf' : kind} · ${center}`, { kind, center }, k === 3 ? SCHEMES.maroon : k === 2 ? SCHEMES.saffron : GOLD.concat('#FFFFFF'), 'divider');
}));

export const ORNAMENT_PRESETS = list;
