// Colour helpers for poster designs

// Every colour used anywhere in the design, most used first
export function designColors(doc) {
  const count = new Map();
  const addC = (c) => { if (/^#[0-9a-f]{6}$/i.test(c || '')) count.set(c.toUpperCase(), (count.get(c.toUpperCase()) || 0) + 1); };
  const bg = doc.bg || {};
  [bg.color, bg.from, bg.to].forEach(addC);
  doc.elements.forEach((e) => {
    [e.color, e.fill, e.fill2, e.stroke, e.bgColor, e.fg, e.bg, e.shadow?.color, e.extrude?.color, e.tint?.color, e.fade?.color, e.outline?.color].forEach(addC);
    (e.colors || []).forEach(addC);
  });
  return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
}

export function swapColor(doc, from, to) {
  const same = (c) => typeof c === 'string' && c.toUpperCase() === from.toUpperCase();
  const sw = (c) => (same(c) ? to : c);
  const fix = (o, keys) => keys.reduce((acc, k) => (acc[k] && typeof acc[k] === 'object' && 'color' in acc[k] ? { ...acc, [k]: { ...acc[k], color: sw(acc[k].color) } } : acc), o);
  return {
    ...doc,
    bg: { ...doc.bg, color: sw(doc.bg?.color), from: sw(doc.bg?.from), to: sw(doc.bg?.to) },
    elements: doc.elements.map((e) => fix({
      ...e,
      ...['color', 'fill', 'fill2', 'stroke', 'bgColor', 'fg', 'bg'].reduce((o, k) => (e[k] ? { ...o, [k]: sw(e[k]) } : o), {}),
      ...(e.colors && { colors: e.colors.map(sw) }),
    }, ['shadow', 'extrude', 'tint', 'fade', 'outline'])),
  };
}


// Relative luminance and contrast ratio (WCAG)
export function luminance(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
export function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  if (la == null || lb == null) return null;
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
