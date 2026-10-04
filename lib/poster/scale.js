// Fit a design to a new page size. Items keep their proportions and relative position; items that span the
// whole width or height (backgrounds, bands, garlands) stretch to the new edges instead.
export function scaleDoc(d, formatKey, W, H) {
  const sx = W / d.w;
  const sy = H / d.h;
  const s = Math.min(sx, sy);
  const elements = d.elements.map((e) => {
    const fullW = e.x <= d.w * 0.03 && e.x + e.w >= d.w * 0.97;
    const fullH = e.y <= d.h * 0.03 && e.y + e.h >= d.h * 0.97;
    const w = fullW ? e.w * sx : e.w * s;
    const h = fullH ? e.h * sy : e.h * s;
    const n = { ...e, w, h, x: fullW ? e.x * sx : (e.x + e.w / 2) * sx - w / 2, y: fullH ? e.y * sy : (e.y + e.h / 2) * sy - h / 2 };
    // a band glued to the top or bottom edge stays glued
    if (fullW && !fullH && e.y + e.h >= d.h * 0.97) n.y = H - h - (d.h - e.y - e.h) * s;
    if (fullW && !fullH && e.y <= d.h * 0.03) n.y = e.y * s;
    if (e.type === 'text') Object.assign(n, { size: Math.max(4, Math.round(e.size * s)), bgPad: e.bgPad ? e.bgPad * s : e.bgPad, strokeW: e.strokeW ? e.strokeW * s : e.strokeW });
    if ((e.type === 'shape' || e.type === 'path') && e.strokeW) n.strokeW = Math.max(1, e.strokeW * s);
    if (e.radius) n.radius = e.radius * s;
    return n;
  });
  return { ...d, format: formatKey, w: W, h: H, elements };
}
