// Custom curves: a smooth line through your points, drawn as one or more layers (lines or filled bands),
// each with its own colour/gradient, offset and shadow.
import { eid } from './kit';

const f = (n) => Math.round(n * 10) / 10;

// Smooth path through points (Catmull-Rom → cubic Bézier). tension 0 = straight lines, 1 = very round
export function smoothThrough(pts, tension = 0.5, closed = false) {
  const n = pts.length;
  if (n < 2) return '';
  if (n === 2 || tension <= 0) return `M${pts.map((p) => `${f(p.x)} ${f(p.y)}`).join(' L')}${closed ? 'Z' : ''}`;
  const at = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  const k = tension / 3;
  let d = `M${f(pts[0].x)} ${f(pts[0].y)}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    d += ` C${f(p1.x + (p2.x - p0.x) * k)} ${f(p1.y + (p2.y - p0.y) * k)} ${f(p2.x - (p3.x - p1.x) * k)} ${f(p2.y - (p3.y - p1.y) * k)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return d + (closed ? 'Z' : '');
}

// The outline of one layer: the curve itself (line), or the area between the curve and an edge of the box
export function layerPath(el, layer) {
  let pts = el.points.map((p) => ({ x: p.x + (layer.dx || 0), y: p.y + (layer.dy || 0) }));
  const mode = el.mode || 'line';
  // filled bands run edge to edge unless switched off: carry the curve out to the page sides
  if (mode === 'fill' && el.extend !== false && pts.length > 1) {
    const W0 = el.vw;
    const H0 = el.vh;
    const across = el.fillTo === 'left' || el.fillTo === 'right' ? 'y' : 'x';
    const ordered = pts[0][across] <= pts[pts.length - 1][across] ? pts : [...pts].reverse();
    const first = ordered[0];
    const last = ordered[ordered.length - 1];
    const lo = across === 'x' ? { x: -W0 * 0.05, y: first.y } : { x: first.x, y: -H0 * 0.05 };
    const hi = across === 'x' ? { x: W0 * 1.05, y: last.y } : { x: last.x, y: H0 * 1.05 };
    pts = [...(first[across] > 0 ? [lo] : []), ...ordered, ...(last[across] < (across === 'x' ? W0 : H0) ? [hi] : [])];
  }
  if (mode === 'closed') return smoothThrough(pts, el.tension ?? 0.5, true);
  const d = smoothThrough(pts, el.tension ?? 0.5, false);
  if (mode === 'line') return d;
  const W = el.vw;
  const H = el.vh;
  const a = pts[0];
  const b = pts[pts.length - 1];
  // reach past the box a little so offset layers still meet the edge
  const over = Math.max(W, H);
  switch (el.fillTo) {
    case 'top': return `${d} L${f(b.x)} ${f(-over)} L${f(a.x)} ${f(-over)}Z`;
    case 'left': return `${d} L${f(-over)} ${f(b.y)} L${f(-over)} ${f(a.y)}Z`;
    case 'right': return `${d} L${f(W + over)} ${f(b.y)} L${f(W + over)} ${f(a.y)}Z`;
    default: return `${d} L${f(b.x)} ${f(H + over)} L${f(a.x)} ${f(H + over)}Z`;
  }
}

export function renderCurve(el) {
  const W = el.vw || el.w;
  const H = el.vh || el.h;
  // sizes (line width, shadow) are in page pixels; convert to the curve's own units
  const k = (W / el.w + H / el.h) / 2;
  const uid = `cv${String(el.id).replace(/[^a-z0-9]/gi, '')}`;
  const layers = (el.layers || []).slice().reverse(); // first layer in the list is drawn on top
  let defs = '';
  let body = '';
  layers.forEach((L, i) => {
    const d = layerPath({ ...el, vw: W, vh: H }, L);
    const lid = `${uid}l${i}`;
    let paint = L.color || '#2F5BFF';
    if (L.color2) {
      const a = (((L.angle ?? 90) - 90) * Math.PI) / 180;
      const x = Math.cos(a) / 2;
      const y = Math.sin(a) / 2;
      defs += `<linearGradient id="${lid}g" x1="${f(0.5 - x)}" y1="${f(0.5 - y)}" x2="${f(0.5 + x)}" y2="${f(0.5 + y)}"><stop offset="0" stop-color="${L.color}"/><stop offset="1" stop-color="${L.color2}"/></linearGradient>`;
      paint = `url(#${lid}g)`;
    }
    let filter = '';
    if (L.shadow?.on) {
      const s = L.shadow;
      defs += `<filter id="${lid}s" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="${f((s.x ?? 0) * k)}" dy="${f((s.y ?? 8) * k)}" stdDeviation="${f(((s.blur ?? 12) * k) / 2)}" flood-color="${s.color || '#000000'}" flood-opacity="${(s.opacity ?? 35) / 100}"/></filter>`;
      filter = ` filter="url(#${lid}s)"`;
    }
    const op = L.opacity ?? 1;
    if ((el.mode || 'line') === 'line') {
      const dash = el.dash ? ` stroke-dasharray="${f((L.width || 8) * k * 2.5)} ${f((L.width || 8) * k * 1.8)}"` : '';
      body += `<path d="${d}" fill="none" stroke="${paint}" stroke-width="${f((L.width || 8) * k)}" stroke-linecap="${el.cap || 'round'}" stroke-linejoin="round" opacity="${op}"${dash}${filter}/>`;
    } else {
      const edge = L.border ? ` stroke="${L.border}" stroke-width="${f((L.borderW || 4) * k)}"` : '';
      body += `<path d="${d}" fill="${paint}" opacity="${op}"${edge}${filter}/>`;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(W)} ${f(H)}" preserveAspectRatio="none" width="100%" height="100%" style="display:block;overflow:visible"><defs>${defs}</defs>${body}</svg>`;
}

export const layer = (o = {}) => ({ id: eid(), color: '#2F5BFF', color2: '', angle: 90, opacity: 1, dx: 0, dy: 0, width: 10, shadow: { on: false, x: 0, y: 8, blur: 14, color: '#000000', opacity: 35 }, ...o });
const sh = (y = 10, blur = 18, opacity = 35) => ({ on: true, x: 0, y, blur, color: '#000000', opacity });

// Ready-made curves (points as fractions of the page), each with its layers
export const CURVE_PRESETS = [
  { name: 'Wave band', mode: 'fill', fillTo: 'bottom', pts: [[0, 0.74], [0.25, 0.68], [0.5, 0.76], [0.75, 0.69], [1, 0.73]], layers: (D) => [layer({ color: '#2F5BFF', color2: '#7C3AED', shadow: sh(-D * 0.008, D * 0.02) }), layer({ color: '#93C5FD', dy: -D * 0.035, opacity: 0.9, shadow: sh(-D * 0.006, D * 0.015, 25) })] },
  { name: 'Tricolour swoosh', mode: 'fill', fillTo: 'bottom', pts: [[0, 0.6], [0.3, 0.8], [0.65, 0.93], [1, 0.97]], layers: (D) => [layer({ color: '#138808', shadow: sh(-D * 0.006, D * 0.015) }), layer({ color: '#FFFFFF', dy: -D * 0.035, shadow: sh(-D * 0.006, D * 0.015, 25) }), layer({ color: '#FF9933', dy: -D * 0.07, shadow: sh(-D * 0.006, D * 0.015, 25) })] },
  { name: 'Top arc', mode: 'fill', fillTo: 'top', pts: [[0, 0.16], [0.5, 0.3], [1, 0.16]], layers: (D) => [layer({ color: '#E11D48', color2: '#F59E0B', shadow: sh(D * 0.01, D * 0.02) }), layer({ color: '#FDE68A', dy: D * 0.03, opacity: 0.8 })] },
  { name: 'Diagonal sweep', mode: 'fill', fillTo: 'bottom', pts: [[0, 0.9], [0.45, 0.62], [1, 0.32]], layers: (D) => [layer({ color: '#0F172A', shadow: sh(-D * 0.01, D * 0.025, 40) }), layer({ color: '#FACC15', dy: -D * 0.03 })] },
  { name: 'Side curve', mode: 'fill', fillTo: 'right', pts: [[0.72, 0], [0.62, 0.5], [0.78, 1]], layers: (D) => [layer({ color: '#7C3AED', color2: '#EC4899', angle: 180, shadow: sh(0, D * 0.025) }), layer({ color: '#F0ABFC', dx: -D * 0.03, opacity: 0.7 })] },
  { name: 'S-line', mode: 'line', pts: [[0.1, 0.78], [0.38, 0.32], [0.62, 0.68], [0.9, 0.22]], layers: (D) => [layer({ color: '#DC2626', width: D * 0.018, shadow: sh(D * 0.006, D * 0.012) }), layer({ color: '#FACC15', width: D * 0.018, dy: D * 0.03 })] },
  { name: 'Ribbon wave', mode: 'line', pts: [[0.05, 0.5], [0.3, 0.4], [0.55, 0.58], [0.8, 0.44], [0.95, 0.5]], layers: (D) => [layer({ color: '#F59E0B', color2: '#DC2626', width: D * 0.07, shadow: sh(D * 0.01, D * 0.02, 30) }), layer({ color: '#7C2D12', width: D * 0.07, dy: D * 0.012, opacity: 0.6 })] },
  { name: 'Blob', mode: 'closed', pts: [[0.5, 0.25], [0.72, 0.35], [0.75, 0.6], [0.52, 0.75], [0.28, 0.62], [0.27, 0.38]], layers: (D) => [layer({ color: '#14B8A6', color2: '#3B82F6', shadow: sh(D * 0.012, D * 0.03) }), layer({ color: '#99F6E4', dx: D * 0.025, dy: D * 0.025, opacity: 0.6 })] },
];

// A curve element covering the page, with points in page pixels
export function curveEl(W, H, pts, o = {}) {
  return { id: eid(), type: 'curve', x: 0, y: 0, w: W, h: H, vw: W, vh: H, rot: 0, opacity: 1, points: pts.map(([x, y]) => ({ x, y })), mode: 'line', fillTo: 'bottom', tension: 0.5, layers: [layer()], name: 'Custom curve', ...o };
}
export function presetCurve(p, W, H) {
  const D = Math.min(W, H);
  return curveEl(W, H, p.pts.map(([x, y]) => [x * W, y * H]), { mode: p.mode, fillTo: p.fillTo || 'bottom', layers: p.layers(D), name: p.name });
}
