// Decorative graphics drawn as SVG at the element's real size, so nothing stretches.
// Each takes (w, h, colours[], seed) and returns SVG markup.

export function rng(seed = 1) {
  let s = (Math.abs(Math.floor(seed)) % 2147483646) + 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
export const f = (n) => Math.round(n * 10) / 10;
export const svg = (w, h, body, defs = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${f(w)} ${f(h)}" style="display:block;overflow:visible">${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`;

export function flower(cx, cy, r, c1, c2) {
  let p = '';
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    p += `<ellipse cx="${f(cx + Math.cos(a) * r * 0.55)}" cy="${f(cy + Math.sin(a) * r * 0.55)}" rx="${f(r * 0.5)}" ry="${f(r * 0.3)}" transform="rotate(${f((a * 180) / Math.PI)} ${f(cx + Math.cos(a) * r * 0.55)} ${f(cy + Math.sin(a) * r * 0.55)})" fill="${c1}"/>`;
  }
  return p + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.45)}" fill="${c2}"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.2)}" fill="${c1}" opacity=".6"/>`;
}

export function leaf(x, y, len, angle, color) {
  return `<path d="M0 0 Q${f(len / 2)} ${f(-len / 4)} ${f(len)} 0 Q${f(len / 2)} ${f(len / 4)} 0 0Z" fill="${color}" transform="translate(${f(x)} ${f(y)}) rotate(${f(angle)})"/>`;
}

export function star4(cx, cy, r, color, op = 1) {
  return `<path d="M${f(cx)} ${f(cy - r)} Q${f(cx + r * 0.15)} ${f(cy - r * 0.15)} ${f(cx + r)} ${f(cy)} Q${f(cx + r * 0.15)} ${f(cy + r * 0.15)} ${f(cx)} ${f(cy + r)} Q${f(cx - r * 0.15)} ${f(cy + r * 0.15)} ${f(cx - r)} ${f(cy)} Q${f(cx - r * 0.15)} ${f(cy - r * 0.15)} ${f(cx)} ${f(cy - r)}Z" fill="${color}" opacity="${op}"/>`;
}

export const GRAPHICS = {
  sunburst: {
    name: 'Sunburst rays', colors: ['#FFFFFF', '#FFE08A'],
    draw(w, h, [c1, c2], seed, id) {
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.hypot(w, h);
      let rays = '';
      const n = 28;
      for (let i = 0; i < n; i += 2) {
        const a1 = (i / n) * Math.PI * 2;
        const a2 = ((i + 1) / n) * Math.PI * 2;
        rays += `<path d="M${f(cx)} ${f(cy)} L${f(cx + Math.cos(a1) * R)} ${f(cy + Math.sin(a1) * R)} L${f(cx + Math.cos(a2) * R)} ${f(cy + Math.sin(a2) * R)}Z" fill="${c1}" opacity=".16"/>`;
      }
      return svg(w, h, `${rays}<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(Math.min(w, h) * 0.55)}" fill="url(#${id}g)"/>`, `<radialGradient id="${id}g"><stop offset="0" stop-color="${c2}" stop-opacity=".85"/><stop offset="1" stop-color="${c2}" stop-opacity="0"/></radialGradient>`);
    },
  },
  glow: {
    name: 'Soft glow', colors: ['#FFFFFF'],
    draw(w, h, [c1], s, id) {
      return svg(w, h, `<ellipse cx="${f(w / 2)}" cy="${f(h / 2)}" rx="${f(w / 2)}" ry="${f(h / 2)}" fill="url(#${id}g)"/>`, `<radialGradient id="${id}g"><stop offset="0" stop-color="${c1}" stop-opacity=".9"/><stop offset="1" stop-color="${c1}" stop-opacity="0"/></radialGradient>`);
    },
  },
  mandala: {
    name: 'Mandala', colors: ['#FFFFFF', '#FFFFFF'],
    draw(w, h, [c1, c2]) {
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) / 2;
      let out = '';
      [[1, 16, 0.42, 0.13], [0.74, 12, 0.34, 0.12], [0.5, 8, 0.28, 0.13]].forEach(([k, n, len, wd], ring) => {
        for (let i = 0; i < n; i++) {
          const a = (i / n) * 360 + ring * 11;
          out += `<ellipse cx="${f(cx)}" cy="${f(cy - R * k + R * len)}" rx="${f(R * wd)}" ry="${f(R * len)}" transform="rotate(${f(a)} ${f(cx)} ${f(cy)})" fill="none" stroke="${ring % 2 ? c2 : c1}" stroke-width="${f(Math.max(1, R * 0.012))}"/>`;
        }
      });
      for (let i = 0; i < 3; i++) out += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R * (0.18 + i * 0.07))}" fill="none" stroke="${c1}" stroke-width="${f(Math.max(1, R * 0.01))}"/>`;
      return svg(w, h, out);
    },
  },
  rangoli: {
    name: 'Rangoli', colors: ['#FF6B00', '#E91E63', '#FFC107'],
    draw(w, h, [c1, c2, c3]) {
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) / 2;
      let out = '';
      [[c1, 12, 1, 0.3], [c2, 12, 0.72, 0.26], [c3, 8, 0.48, 0.22], [c1, 6, 0.28, 0.16]].forEach(([c, n, k, len], ring) => {
        for (let i = 0; i < n; i++) {
          const a = (i / n) * 360 + ring * 15;
          out += `<path d="M${f(cx)} ${f(cy - R * k)} Q${f(cx + R * len * 0.6)} ${f(cy - R * k + R * len)} ${f(cx)} ${f(cy - R * k + R * len * 1.6)} Q${f(cx - R * len * 0.6)} ${f(cy - R * k + R * len)} ${f(cx)} ${f(cy - R * k)}Z" fill="${c}" transform="rotate(${f(a)} ${f(cx)} ${f(cy)})"/>`;
        }
      });
      return svg(w, h, out + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R * 0.12)}" fill="${c3}"/>`);
    },
  },
  confetti: {
    name: 'Confetti', colors: ['#F59E0B', '#EC4899', '#3B82F6'],
    draw(w, h, cols, seed = 7) {
      const r = rng(seed);
      let out = '';
      const n = Math.round(Math.min(90, (w * h) / 9000) + 20);
      for (let i = 0; i < n; i++) {
        const x = r() * w;
        const y = r() * h;
        const c = cols[i % cols.length];
        const s = 4 + r() * Math.min(w, h) * 0.02;
        out += r() > 0.5
          ? `<rect x="${f(x)}" y="${f(y)}" width="${f(s)}" height="${f(s * 0.45)}" fill="${c}" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})"/>`
          : `<circle cx="${f(x)}" cy="${f(y)}" r="${f(s * 0.35)}" fill="${c}"/>`;
      }
      return svg(w, h, out);
    },
  },
  bokeh: {
    name: 'Bokeh lights', colors: ['#FFFFFF', '#FFD166'],
    draw(w, h, [c1, c2], seed = 3) {
      const r = rng(seed);
      let out = '';
      for (let i = 0; i < 26; i++) {
        const s = Math.min(w, h) * (0.02 + r() * 0.09);
        out += `<circle cx="${f(r() * w)}" cy="${f(r() * h)}" r="${f(s)}" fill="${i % 2 ? c1 : c2}" opacity="${f(0.08 + r() * 0.25)}"/>`;
      }
      return svg(w, h, out);
    },
  },
  sparkles: {
    name: 'Sparkles', colors: ['#FFFFFF', '#FDE68A'],
    draw(w, h, [c1, c2], seed = 11) {
      const r = rng(seed);
      let out = '';
      for (let i = 0; i < 18; i++) out += star4(r() * w, r() * h, Math.min(w, h) * (0.015 + r() * 0.04), i % 2 ? c1 : c2, 0.6 + r() * 0.4);
      return svg(w, h, out);
    },
  },
  garland: {
    name: 'Marigold garland (toran)', colors: ['#FF8C00', '#FFC300', '#2E7D32'],
    draw(w, h, [c1, c2, c3]) {
      const r = Math.max(6, h * 0.16);
      const n = Math.max(3, Math.round(w / (r * 5)));
      const seg = w / n;
      let out = `<line x1="0" y1="${f(r)}" x2="${f(w)}" y2="${f(r)}" stroke="${c3}" stroke-width="${f(r * 0.25)}"/>`;
      for (let i = 0; i < n; i++) {
        const x0 = i * seg;
        const sag = h - r * 1.4;
        for (let k = 1; k < 8; k++) {
          const t = k / 8;
          const x = x0 + seg * t;
          const y = r + Math.sin(Math.PI * t) * sag * 0.55;
          out += flower(x, y, r * 0.75, k % 2 ? c1 : c2, k % 2 ? c2 : c1);
        }
        out += leaf(x0 + seg / 2 - r * 0.2, r + sag * 0.55 + r * 0.4, r * 1.6, 80, c3) + leaf(x0 + seg / 2 + r * 0.2, r + sag * 0.55 + r * 0.4, r * 1.6, 100, c3);
        out += flower(x0 + seg / 2, r + sag * 0.55 + r * 1.9, r * 0.9, c1, c2);
        out += flower(x0, r, r, c2, c1);
      }
      return svg(w, h, out + flower(w, r, r, c2, c1));
    },
  },
  laurel: {
    name: 'Laurel wreath', colors: ['#D4A017'],
    draw(w, h, [c1]) {
      const cx = w / 2;
      const cy = h * 0.55;
      const R = Math.min(w, h * 1.1) * 0.45;
      let out = '';
      for (const side of [-1, 1]) {
        for (let i = 0; i < 9; i++) {
          const a = (Math.PI * (0.62 + i * 0.075));
          const x = cx + side * Math.cos(a) * -R;
          const y = cy + Math.sin(a) * R * 0.95;
          out += leaf(x, y, R * 0.26, side > 0 ? -((a * 180) / Math.PI) + 210 : (a * 180) / Math.PI - 30, c1);
        }
      }
      return svg(w, h, out);
    },
  },
  ribbon: {
    name: 'Ribbon name plate', colors: ['#B91C1C', '#7F1D1D'],
    draw(w, h, [c1, c2]) {
      const e = h * 0.6;
      return svg(w, h, `<path d="M0 ${f(h * 0.25)} H${f(e)} V${f(h)} H0 L${f(e * 0.45)} ${f(h * 0.62)}Z" fill="${c2}"/><path d="M${f(w)} ${f(h * 0.25)} H${f(w - e)} V${f(h)} H${f(w)} L${f(w - e * 0.45)} ${f(h * 0.62)}Z" fill="${c2}"/><rect x="${f(e * 0.55)}" y="0" width="${f(w - e * 1.1)}" height="${f(h * 0.78)}" rx="${f(h * 0.06)}" fill="${c1}"/>`);
    },
  },
  ornate: {
    name: 'Ornate frame', colors: ['#D4A017'],
    draw(w, h, [c1]) {
      const m = Math.min(w, h);
      const k = m * 0.13;
      const sw = Math.max(1.5, m * 0.006);
      const corner = (x, y, sx, sy) => `<g transform="translate(${f(x)} ${f(y)}) scale(${sx} ${sy})" fill="none" stroke="${c1}" stroke-width="${f(sw)}"><path d="M0 ${f(k)} Q0 0 ${f(k)} 0"/><path d="M${f(k * 0.25)} ${f(k * 1.3)} Q${f(k * 0.25)} ${f(k * 0.25)} ${f(k * 1.3)} ${f(k * 0.25)}"/><circle cx="${f(k * 0.55)}" cy="${f(k * 0.55)}" r="${f(k * 0.14)}" fill="${c1}"/><path d="M${f(k * 1.3)} ${f(k * 0.25)} q${f(k * 0.3)} ${f(-k * 0.2)} ${f(k * 0.6)} 0 q${f(-k * 0.3)} ${f(k * 0.2)} ${f(-k * 0.6)} 0" fill="${c1}"/><path d="M${f(k * 0.25)} ${f(k * 1.3)} q${f(-k * 0.2)} ${f(k * 0.3)} 0 ${f(k * 0.6)} q${f(k * 0.2)} ${f(-k * 0.3)} 0 ${f(-k * 0.6)}" fill="${c1}"/></g>`;
      const p = k * 0.2;
      return svg(w, h, `<rect x="${f(p + k * 0.35)}" y="${f(p + k * 0.35)}" width="${f(w - 2 * p - k * 0.7)}" height="${f(h - 2 * p - k * 0.7)}" fill="none" stroke="${c1}" stroke-width="${f(sw)}"/>${corner(p, p, 1, 1)}${corner(w - p, p, -1, 1)}${corner(p, h - p, 1, -1)}${corner(w - p, h - p, -1, -1)}`);
    },
  },
  waves: {
    name: 'Wave bands', colors: ['#16A34A', '#15803D'],
    draw(w, h, [c1, c2]) {
      return svg(w, h, `<path d="M0 ${f(h * 0.35)} C${f(w * 0.25)} ${f(h * 0.05)} ${f(w * 0.55)} ${f(h * 0.6)} ${f(w)} ${f(h * 0.2)} V${f(h)} H0Z" fill="${c2}"/><path d="M0 ${f(h * 0.55)} C${f(w * 0.3)} ${f(h * 0.3)} ${f(w * 0.6)} ${f(h * 0.75)} ${f(w)} ${f(h * 0.42)} V${f(h)} H0Z" fill="${c1}"/>`);
    },
  },
  swoosh: {
    name: 'Corner swoosh', colors: ['#FF7A00', '#FFFFFF', '#138808'],
    draw(w, h, [c1, c2, c3]) {
      return svg(w, h, `<path d="M0 ${f(h)} V${f(h * 0.25)} C${f(w * 0.25)} ${f(h * 0.6)} ${f(w * 0.6)} ${f(h * 0.85)} ${f(w)} ${f(h)}Z" fill="${c3}"/><path d="M0 ${f(h * 0.25)} C${f(w * 0.25)} ${f(h * 0.6)} ${f(w * 0.6)} ${f(h * 0.85)} ${f(w)} ${f(h)} C${f(w * 0.55)} ${f(h * 0.7)} ${f(w * 0.2)} ${f(h * 0.4)} 0 0Z" fill="${c2}"/><path d="M0 0 C${f(w * 0.2)} ${f(h * 0.4)} ${f(w * 0.55)} ${f(h * 0.7)} ${f(w)} ${f(h)} C${f(w * 0.5)} ${f(h * 0.55)} ${f(w * 0.15)} ${f(h * 0.25)} 0 ${f(-h * 0.1)}Z" fill="${c1}"/>`);
    },
  },
  flag: {
    name: 'Tricolour flag wave', colors: ['#FF9933', '#FFFFFF', '#138808'],
    draw(w, h, [c1, c2, c3]) {
      const band = (y0, c) => `<path d="M0 ${f(y0)} C${f(w * 0.3)} ${f(y0 - h * 0.08)} ${f(w * 0.6)} ${f(y0 + h * 0.08)} ${f(w)} ${f(y0)} V${f(y0 + h / 3)} C${f(w * 0.6)} ${f(y0 + h / 3 + h * 0.08)} ${f(w * 0.3)} ${f(y0 + h / 3 - h * 0.08)} 0 ${f(y0 + h / 3)}Z" fill="${c}"/>`;
      const r = h * 0.12;
      let spokes = '';
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        spokes += `<line x1="${f(w / 2)}" y1="${f(h / 2)}" x2="${f(w / 2 + Math.cos(a) * r)}" y2="${f(h / 2 + Math.sin(a) * r)}" stroke="#000080" stroke-width="${f(Math.max(0.6, r * 0.05))}"/>`;
      }
      return svg(w, h, band(0, c1) + band(h / 3, c2) + band((2 * h) / 3, c3) + `<circle cx="${f(w / 2)}" cy="${f(h / 2)}" r="${f(r)}" fill="none" stroke="#000080" stroke-width="${f(Math.max(1, r * 0.1))}"/>${spokes}`);
    },
  },
  balloons: {
    name: 'Balloons', colors: ['#EF4444', '#3B82F6', '#F59E0B'],
    draw(w, h, cols, seed = 5) {
      const r = rng(seed);
      let out = '';
      const n = 5;
      for (let i = 0; i < n; i++) {
        const bw = w / (n * 0.9);
        const x = (i + 0.5) * (w / n) + (r() - 0.5) * bw * 0.3;
        const y = h * (0.12 + r() * 0.2);
        const c = cols[i % cols.length];
        out += `<path d="M${f(x)} ${f(y + bw * 0.62)} Q${f(x + bw * 0.1)} ${f(y + bw * 1.2)} ${f(x - bw * 0.05)} ${f(h)}" stroke="#999" stroke-width="1.2" fill="none"/>`;
        out += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(bw * 0.42)}" ry="${f(bw * 0.52)}" fill="${c}"/><ellipse cx="${f(x - bw * 0.14)}" cy="${f(y - bw * 0.2)}" rx="${f(bw * 0.08)}" ry="${f(bw * 0.14)}" fill="#fff" opacity=".45"/><path d="M${f(x - bw * 0.06)} ${f(y + bw * 0.6)} L${f(x + bw * 0.06)} ${f(y + bw * 0.6)} L${f(x)} ${f(y + bw * 0.5)}Z" fill="${c}"/>`;
      }
      return svg(w, h, out);
    },
  },
  petals: {
    name: 'Falling petals', colors: ['#F43F5E', '#FB7185'],
    draw(w, h, [c1, c2], seed = 9) {
      const r = rng(seed);
      let out = '';
      for (let i = 0; i < 30; i++) {
        const s = Math.min(w, h) * (0.012 + r() * 0.025);
        const x = r() * w;
        const y = r() * h;
        out += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(s)}" ry="${f(s * 0.55)}" fill="${i % 2 ? c1 : c2}" opacity="${f(0.6 + r() * 0.4)}" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})"/>`;
      }
      return svg(w, h, out);
    },
  },
  halftone: {
    name: 'Halftone dots', colors: ['#FFFFFF'],
    draw(w, h, [c1]) {
      const step = Math.max(10, Math.min(w, h) / 22);
      let out = '';
      for (let y = step / 2; y < h; y += step) for (let x = step / 2; x < w; x += step) {
        const k = 1 - x / w;
        if (k > 0.05) out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(step * 0.42 * k)}" fill="${c1}"/>`;
      }
      return svg(w, h, out);
    },
  },
  stripes: {
    name: 'Diagonal stripes', colors: ['#FFFFFF'],
    draw(w, h, [c1], s, id) {
      const st = Math.max(8, Math.min(w, h) / 14);
      return svg(w, h, `<rect width="${f(w)}" height="${f(h)}" fill="url(#${id}p)"/>`, `<pattern id="${id}p" width="${f(st)}" height="${f(st)}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="${f(st / 2)}" height="${f(st)}" fill="${c1}"/></pattern>`);
    },
  },
  brush: {
    name: 'Brush stroke', colors: ['#111827'],
    draw(w, h, [c1], seed = 2) {
      const r = rng(seed);
      let top = `M${f(w * 0.02)} ${f(h * 0.2)}`;
      let bot = '';
      for (let i = 1; i <= 10; i++) top += ` L${f((w * i) / 10)} ${f(h * (0.08 + r() * 0.16))}`;
      for (let i = 10; i >= 0; i--) bot += ` L${f((w * i) / 10 + (i === 0 ? w * 0.03 : 0))} ${f(h * (0.8 + r() * 0.14))}`;
      return svg(w, h, `<path d="${top}${bot}Z" fill="${c1}"/>`);
    },
  },
  streaks: {
    name: 'Light streaks', colors: ['#FFFFFF', '#22D3EE'],
    draw(w, h, [c1, c2], seed = 4) {
      const r = rng(seed);
      let out = '';
      for (let i = 0; i < 9; i++) {
        const y = r() * h;
        out += `<rect x="${f(-w * 0.1)}" y="${f(y)}" width="${f(w * 1.2)}" height="${f(Math.max(1, h * 0.004 + r() * h * 0.006))}" fill="${i % 2 ? c1 : c2}" opacity="${f(0.2 + r() * 0.5)}" transform="rotate(-18 ${f(w / 2)} ${f(y)})"/>`;
      }
      return svg(w, h, out);
    },
  },
  diyas: {
    name: 'Diya row', colors: ['#F59E0B', '#B45309', '#FDE68A'],
    draw(w, h, [c1, c2, c3]) {
      const n = Math.max(2, Math.round(w / (h * 1.6)));
      const step = w / n;
      let out = '';
      for (let i = 0; i < n; i++) {
        const cx = step * (i + 0.5);
        const bw = Math.min(step * 0.8, h * 1.3);
        const by = h * 0.62;
        out += `<ellipse cx="${f(cx)}" cy="${f(h * 0.3)}" rx="${f(bw * 0.16)}" ry="${f(h * 0.3)}" fill="${c3}" opacity=".5"/><path d="M${f(cx)} ${f(h * 0.05)} Q${f(cx + bw * 0.12)} ${f(h * 0.3)} ${f(cx)} ${f(h * 0.5)} Q${f(cx - bw * 0.12)} ${f(h * 0.3)} ${f(cx)} ${f(h * 0.05)}Z" fill="${c1}"/>`;
        out += `<path d="M${f(cx - bw / 2)} ${f(by)} Q${f(cx)} ${f(h * 1.08)} ${f(cx + bw / 2)} ${f(by)} Z" fill="${c2}"/><ellipse cx="${f(cx)}" cy="${f(by)}" rx="${f(bw / 2)}" ry="${f(h * 0.07)}" fill="${c1}"/>`;
      }
      return svg(w, h, out);
    },
  },
  arcs: {
    name: 'Soft arcs', colors: ['#FFFFFF'],
    draw(w, h, [c1]) {
      let out = '';
      for (let i = 1; i <= 6; i++) out += `<circle cx="${f(w * 0.85)}" cy="${f(h * 0.15)}" r="${f(Math.max(w, h) * i * 0.13)}" fill="none" stroke="${c1}" stroke-width="${f(Math.max(2, Math.min(w, h) * 0.03))}" opacity="${f(0.16 - i * 0.015)}"/>`;
      return svg(w, h, out);
    },
  },
};

export const GRAPHIC_KEYS = Object.keys(GRAPHICS);

export function graphicSvg(el) {
  const g = GRAPHICS[el.graphic] || GRAPHICS.sparkles;
  const colors = g.colors.map((c, i) => (el.colors && el.colors[i]) || c);
  return g.draw(Math.max(1, el.w), Math.max(1, el.h), colors, el.seed || 7, `gr${String(el.id).replace(/[^a-z0-9]/gi, '')}`);
}
