// SVG building blocks for the design library: seeded randomness, colour maths, type and shape helpers.

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r1 = (v) => (typeof v === 'number' ? Math.round(v * 10) / 10 : v);

// ---------- colour ----------
const rgb = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
export const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
export const lum = (h) => { const [r, g, b] = rgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
export const onColor = (h) => (lum(h) > 0.62 ? '#14141A' : '#FFFFFF');

// ---------- type ----------
// w: average glyph width as a share of font size, used to fit text without a layout engine
export const FONTS = {
  didot: { f: "Didot,'Bodoni 72','Bodoni MT','Playfair Display',Georgia,serif", w: 0.5 },
  garamond: { f: "'Cormorant Garamond',Garamond,Baskerville,'Times New Roman',serif", w: 0.46 },
  palatino: { f: "'Iowan Old Style',Palatino,'Palatino Linotype','Book Antiqua',Georgia,serif", w: 0.52 },
  helvetica: { f: "'Helvetica Neue',Helvetica,Arial,sans-serif", w: 0.55 },
  futura: { f: "Futura,'Century Gothic','Avenir Next','Trebuchet MS',sans-serif", w: 0.57 },
  avenir: { f: "'Avenir Next',Avenir,'Segoe UI','Helvetica Neue',Arial,sans-serif", w: 0.56 },
  impact: { f: "Impact,'Bebas Neue',Oswald,'Arial Narrow',sans-serif", w: 0.47 },
  mono: { f: "'SF Mono',Menlo,Consolas,'Courier New',monospace", w: 0.61 },
  rounded: { f: "'SF Pro Rounded',Nunito,'Varela Round','Arial Rounded MT Bold','Helvetica Neue',sans-serif", w: 0.57 },
};

export function textWidth(s, size, font, upper = false, ls = 0) {
  return String(s).length * size * FONTS[font].w * (upper ? 1.14 : 1) + String(s).length * ls;
}

// Greedy word wrap at the largest size (down to minSize) that fits maxW in maxLines.
export function fit(text, font, maxW, maxSize, maxLines = 2, { upper = false, minSize = 12, ls = 0 } = {}) {
  const words = String(text).split(/\s+/);
  for (let size = maxSize; size >= minSize; size -= 2) {
    const lines = [];
    let cur = '';
    for (const w of words) {
      const next = cur ? cur + ' ' + w : w;
      if (textWidth(next, size, font, upper, ls) <= maxW || !cur) cur = next;
      else { lines.push(cur); cur = w; }
    }
    lines.push(cur);
    if (lines.length <= maxLines && lines.every((l) => textWidth(l, size, font, upper, ls) <= maxW)) return { lines, size };
  }
  return { lines: [String(text)], size: minSize };
}

// ---------- elements ----------
const attrs = (o) => Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== false && v !== '').map(([k, v]) => ` ${k}="${r1(v)}"`).join('');
const common = (o) => ({ mask: o.mask, stroke: o.stroke, 'stroke-width': o.sw, 'stroke-linecap': o.cap, 'stroke-linejoin': o.join, 'stroke-dasharray': o.dash, opacity: o.op, 'fill-opacity': o.fop, filter: o.f ? `url(#${o.f})` : '', transform: o.t, 'clip-path': o.clip });

export const rect = (x, y, w, h, fill, o = {}) => `<rect${attrs({ x, y, width: Math.max(0, w), height: Math.max(0, h), rx: o.r, fill, ...common(o) })}/>`;
export const circ = (cx, cy, r, fill, o = {}) => `<circle${attrs({ cx, cy, r, fill, ...common(o) })}/>`;
export const ell = (cx, cy, rx, ry, fill, o = {}) => `<ellipse${attrs({ cx, cy, rx, ry, fill, ...common(o) })}/>`;
export const path = (d, fill, o = {}) => `<path${attrs({ d, fill, ...common(o) })}/>`;
export const line = (x1, y1, x2, y2, stroke, sw = 1, o = {}) => `<line${attrs({ x1, y1, x2, y2, ...common({ cap: 'round', ...o, stroke, sw }) })}/>`;
export const poly = (pts, fill, o = {}) => `<polygon${attrs({ points: pts.map((p) => p.map(r1).join(',')).join(' '), fill, ...common(o) })}/>`;
export const g = (inner, o = {}) => `<g${attrs(common(o))}>${inner}</g>`;

export function txt(x, y, s, o = {}) {
  const font = FONTS[o.font || 'helvetica'];
  return `<text${attrs({
    x, y, 'font-family': font.f.replace(/"/g, "'"), 'font-size': o.size || 16, 'font-weight': o.weight || 400, 'font-style': o.italic ? 'italic' : '',
    fill: o.fill || '#111', stroke: o.stroke, 'stroke-width': o.sw, 'text-anchor': o.anchor, 'letter-spacing': o.ls, opacity: o.op, transform: o.t, filter: o.f ? `url(#${o.f})` : '',
  })}>${esc(o.upper ? String(s).toUpperCase() : s)}</text>`;
}

// ---------- document ----------
export function canvas(key, W, H) {
  let n = 0;
  const defs = [];
  const id = () => `${key}${n++}`;
  const stops = (list) => list.map(([o, c, op = 1]) => `<stop offset="${o}" stop-color="${c}"${op < 1 ? ` stop-opacity="${op}"` : ''}/>`).join('');
  return {
    W, H,
    lg(list, x1 = 0, y1 = 0, x2 = 0, y2 = 1) { const i = id(); defs.push(`<linearGradient id="${i}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(list)}</linearGradient>`); return `url(#${i})`; },
    rg(list, cx = 0.5, cy = 0.5, r = 0.5) { const i = id(); defs.push(`<radialGradient id="${i}" cx="${cx}" cy="${cy}" r="${r}">${stops(list)}</radialGradient>`); return `url(#${i})`; },
    clip(shape) { const i = id(); defs.push(`<clipPath id="${i}">${shape}</clipPath>`); return `url(#${i})`; },
    mask(inner) { const i = id(); defs.push(`<mask id="${i}" maskUnits="userSpaceOnUse" x="-5000" y="-5000" width="10000" height="10000">${inner}</mask>`); return `url(#${i})`; },
    pattern(w, h, inner) { const i = id(); defs.push(`<pattern id="${i}" width="${w}" height="${h}" patternUnits="userSpaceOnUse">${inner}</pattern>`); return `url(#${i})`; },
    done(body, title) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img"><title>${esc(title)}</title><defs>`
        + '<filter id="sh" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="24" stdDeviation="28" flood-color="#0A0E1A" flood-opacity=".22"/></filter>'
        + '<filter id="sm" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#0A0E1A" flood-opacity=".14"/></filter>'
        + '<filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>'
        + '<filter id="bl4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>'
        + '<filter id="bl60" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="60"/></filter>'
        + '<filter id="powder" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="7"/></filter>'
        + '<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0"/></filter>'
        + `${defs.join('')}</defs>${body}</svg>`;
    },
  };
}
