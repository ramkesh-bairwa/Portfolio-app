// "Advanced" layouts: bento grid, duotone photo, luxe gold, 3D pop type and Swiss editorial.
// Richer layering than the classic ones (gradient and 3D text, outline type, rotated labels, icon rows, tiled grids),
// still built from plain editable elements and worked out from the page size.
import { graphicEl, grad, iconEl, isLight, items, photo, r, shapeEl, slotEl, solid, stack, textEl } from './kit';

const unit = (W, H) => (Math.min(W, H) / 100) * (H / W > 1.5 ? 1.25 : 1);
const radial = (from, to) => ({ type: 'radial', color: to, from, to, angle: 0, image: '', overlay: 0 });
const mixHex = (a, b, k) => {
  const p = (h) => { const m = /^#([0-9a-f]{6})$/i.exec(h || ''); const n = m ? parseInt(m[1], 16) : 0; return [n >> 16, (n >> 8) & 255, n & 255]; };
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
};
const on = (bg, dark = '#0F172A') => (isLight(bg) ? dark : '#FFFFFF');
const body = (t) => (t.hi ? t.bodyFont : t.bodyFont || 'Inter');
// Icon that matches what a detail line says
function detailIcon(l) {
  if (/(\+91|\d[\d\s-]{8,}|phone|call|मो\.|फ़ोन)/i.test(l)) return 'Phone';
  if (/@|email|mail|cv/i.test(l)) return 'Mail';
  if (/(\d{1,2}(:\d{2})?\s?(am|pm)|बजे|onwards|time)/i.test(l)) return 'Clock';
  if (/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}\s?[–-]\s?\d{1,2}|जनवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितंबर|अक्टूबर|नवंबर|दिसंबर)/i.test(l)) return 'Calendar';
  if (/(road|nagar|sector|park|hall|ground|club|street|marg|market|maidan|gate|mandir|ghat|palace|colony|city|centre|center|chowk|मार्ग|नगर|मैदान|हॉल)/i.test(l)) return 'MapPin';
  if (/(₹|%|off|price|fee|salary|free|offer)/i.test(l)) return 'Tag';
  if (/^(from|by|with)\b|परिवार|शुभेच्छु/i.test(l) || (l.length < 24 && !/\d/.test(l))) return 'Heart';
  return 'Sparkles';
}

// Details as icon rows (date, place, phone…)
function iconRows(c, t, x, y, w, size, color, dot) {
  const rowH = size * 2.2;
  return c.details.slice(0, 4).flatMap((l, i) => [
    shapeEl('circle', r(x), r(y + i * rowH), r(size * 1.6), r(size * 1.6), { fill: dot, name: 'Icon dot' }),
    iconEl(detailIcon(l), r(x + size * 0.35), r(y + i * rowH + size * 0.35), r(size * 0.9), r(size * 0.9), { color: on(dot) }),
    textEl(l, r(x + size * 2.2), r(y + i * rowH + size * 0.1), r(w - size * 2.2), r(size * 1.5), { font: body(t), weight: '600', size: r(size), color, align: 'left', lh: 1.3 }),
  ]);
}
const tile = (x, y, w, h, fill, s, o = {}) => shapeEl('rounded', r(x), r(y), r(w), r(h), { fill, radius: r(3.2 * s), ...o });

export const ADV_LAYOUTS = [
  {
    key: 'bento', name: 'Bento grid', adv: true,
    type: (p) => ({ titleFont: 'Unbounded', titleWeight: '700', titleWide: 0.74, titleSize: 8.5, titleLh: 1.08, bodyFont: 'Inter', title: on(p.deep), kicker: isLight(p.primary) ? p.primary : on(p.deep), text: on(p.deep), pillFill: p.primary, pillText: p.ink }),
    build(c, W, H, p, t) {
      const s = unit(W, H), pad = 4 * s, g = 2.2 * s;
      const land = W / H > 1.15;
      const bg = isLight(p.bg) ? mixHex(p.bg, '#FFFFFF', 0.4) : '#EEF0F4';
      const A = p.deep, B = p.primary === '#FFFFFF' ? p.accent : p.primary, E = p.accent === '#FFFFFF' ? p.bg2 : p.accent;
      let a, b, cc, d, e;
      if (land) {
        const lw = (W - 2 * pad - g) * 0.52, rw = W - 2 * pad - g - lw, rh = (H - 2 * pad - g) / 2, half = (rw - g) / 2;
        a = { x: pad, y: pad, w: lw, h: H - 2 * pad };
        b = { x: pad + lw + g, y: pad, w: half, h: rh }; cc = { x: b.x + half + g, y: pad, w: half, h: rh };
        d = { x: b.x, y: pad + rh + g, w: rw * 0.62, h: rh }; e = { x: d.x + d.w + g, y: d.y, w: rw - d.w - g, h: rh };
      } else {
        const iw = W - 2 * pad, ah = (H - 2 * pad - 2 * g) * 0.42, bh = (H - 2 * pad - 2 * g) * 0.26, dh = H - 2 * pad - 2 * g - ah - bh;
        a = { x: pad, y: pad, w: iw, h: ah };
        b = { x: pad, y: pad + ah + g, w: (iw - g) * 0.38, h: bh }; cc = { x: b.x + b.w + g, y: b.y, w: iw - b.w - g, h: bh };
        d = { x: pad, y: b.y + bh + g, w: (iw - g) * 0.62, h: dh }; e = { x: d.x + d.w + g, y: d.y, w: iw - d.w - g, h: dh };
      }
      const [, kick, title] = items(c, t, s, { emoji: false });
      const els = [
        tile(a.x, a.y, a.w, a.h, A, s, { name: 'Title tile' }),
        graphicEl('arcs', r(a.x + a.w * 0.45), r(a.y), r(a.w * 0.55), r(a.h), { colors: [on(A)], opacity: 0.12 }),
        ...stack([kick, title].filter(Boolean), { x: a.x + 5 * s, y: a.y + 4 * s, w: a.w - 10 * s, h: a.h - 8 * s }, { align: 'left' }),
        tile(b.x, b.y, b.w, b.h, B, s, { name: 'Emoji tile' }),
        textEl(c.emoji, r(b.x), r(b.y + b.h * 0.2), r(b.w), r(b.h * 0.6), { size: r(Math.min(b.w, b.h) * 0.5) }),
        slotEl('photo', r(cc.x), r(cc.y), r(cc.w), r(cc.h), { src: photo(c, 3, cc.w, cc.h), slot: c.x.photo, radius: r(3.2 * s), phBg: '#CBD5E1', phBg2: '#94A3B8' }),
        tile(d.x, d.y, d.w, d.h, '#FFFFFF', s, { name: 'Info tile', shadow: { x: 0, y: r(0.6 * s), blur: r(2 * s), color: 'rgba(15,23,42,0.08)' } }),
      ];
      els.push(...stack([
        { kind: 'text', text: c.sub, size: 3.6 * s, font: body(t), weight: '500', color: '#334155', lh: 1.35, gap: 2.4 * s },
      ], { x: d.x + 4 * s, y: d.y + 4 * s, w: d.w - 8 * s, h: d.h * (c.details.length ? 0.42 : 0.9) }, { align: 'left', valign: 'top' }));
      if (c.details.length) els.push(...iconRows(c, t, d.x + 4 * s, d.y + d.h * 0.48, d.w - 8 * s, Math.min(3.2 * s, (d.h * 0.48) / (c.details.length * 2.3)), '#0F172A', A));
      els.push(tile(e.x, e.y, e.w, e.h, E, s, { name: 'Action tile' }));
      els.push(iconEl(c.cta ? 'ArrowRight' : 'Heart', r(e.x + 3.5 * s), r(e.y + 3.5 * s), r(6 * s), r(6 * s), { color: on(E), strokeW: 2.4 }));
      els.push(...stack([{ kind: 'text', text: c.cta || (t.hi ? 'शुभकामनाएँ' : 'With love'), size: 4.4 * s, font: t.titleFont, weight: t.titleWeight, color: on(E), lh: 1.15, wide: t.titleWide }],
        { x: e.x + 3.5 * s, y: e.y + 11 * s, w: e.w - 7 * s, h: e.h - 14 * s }, { align: 'left', valign: 'top' }));
      return { bg: solid(bg), elements: els };
    },
  },
  {
    key: 'duotone', name: 'Duotone photo', adv: true,
    type: (p) => ({ titleFont: 'Bebas Neue', titleWeight: '400', titleWide: 0.42, titleSize: 15, titleUpper: true, titleLh: 0.95, bodyFont: 'Inter', title: '#FFFFFF', kicker: '#FFFFFF', text: 'rgba(255,255,255,0.9)', pillFill: p.primary === '#FFFFFF' ? p.accent : p.primary, pillText: p.ink }),
    build(c, W, H, p, t) {
      const s = unit(W, H), pad = 6 * s;
      const land = W / H > 1.15;
      const tint = isLight(p.deep) ? p.ink : p.deep;
      const pop = isLight(p.primary) && p.primary !== '#FFFFFF' ? p.primary : '#FDE047';
      const els = [
        slotEl('photo', 0, 0, W, H, { src: photo(c, 4, W, H), slot: c.x.photo, phBg: '#94A3B8', phBg2: '#475569', filters: { grayscale: 100, contrast: 115 } }),
        shapeEl('rect', 0, 0, W, H, { fill: tint, opacity: 0.62, name: 'Duotone tint' }),
        shapeEl('rect', 0, 0, W, H, { fill: 'rgba(0,0,0,0)', fill2: 'rgba(0,0,0,0.78)', gradAngle: land ? 90 : 180, name: 'Shade' }),
        graphicEl('halftone', r(W * 0.55), 0, r(W * 0.45), r(H * 0.35), { colors: [pop], opacity: 0.35 }),
      ];
      // big outline word behind the content
      const word = String(c.title).split(/\s+/).sort((x, y) => y.length - x.length)[0] || c.title;
      const ws = Math.min(H * 0.32, (W * 1.05) / Math.max(3, word.length * 0.46));
      els.push(textEl(word, r(-2 * s), r(land ? H * 0.06 : H * 0.08), r(W + 4 * s), r(ws * 1.05), { font: t.titleFont, weight: t.titleWeight, size: r(ws), color: 'transparent', stroke: 'rgba(255,255,255,0.45)', strokeW: Math.max(1, r(0.22 * s)), upper: !t.hi, lh: 1, align: land ? 'left' : 'center', name: 'Outline word' }));
      const [, kick, title, sub] = items(c, t, s, { emoji: false });
      const box = land ? { x: pad, y: H * 0.34, w: W * 0.55, h: H * 0.62 - pad } : { x: pad, y: H * 0.4, w: W - 2 * pad, h: H * 0.6 - pad };
      const kp = kick && { ...kick, kind: 'pill', fill: pop, color: '#0F172A', size: kick.size * 0.85, gap: 2 * s };
      const head = stack([kp, title, sub].filter(Boolean), { x: box.x, y: box.y, w: box.w, h: box.h * (c.details.length ? 0.62 : 0.85) }, { align: 'left' });
      els.push(...head);
      if (c.details.length) els.push(...iconRows(c, t, box.x, box.y + box.h * 0.66, box.w, Math.min(3.3 * s, (box.h * 0.32) / (c.details.length * 2.2)), '#FFFFFF', pop));
      if (c.cta) els.push(...stack([{ kind: 'pill', text: c.cta, size: 3.3 * s, font: body(t), fill: pop, color: '#0F172A' }], land ? { x: W * 0.68, y: H - pad - 9 * s, w: W * 0.28, h: 9 * s } : { x: W * 0.5, y: pad, w: W * 0.5 - pad, h: 9 * s }, { align: 'left' }));
      els.push(shapeEl('rect', r(pad), r(pad), r(10 * s), r(0.9 * s), { fill: pop }));
      return { bg: solid('#0F172A'), elements: els };
    },
  },
  {
    key: 'luxe', name: 'Luxe gold', adv: true,
    type: () => ({ titleFont: 'Cormorant Garamond', titleWeight: '700', titleWide: 0.5, titleSize: 12, titleLh: 1.05, kickerFont: 'Jost', bodyFont: 'Jost', subItalic: true, title: '#E9C46A', kicker: '#E9C46A', text: '#F5EBD7', pillFill: '#D4AF37', pillText: '#1A1406' }),
    build(c, W, H, p, t) {
      const s = unit(W, H);
      const land = W / H > 1.15;
      const base = mixHex(isLight(p.bg) ? p.ink : p.bg, '#000000', 0.35);
      const gold = '#D4AF37', light = '#F7E7B4';
      const D = land ? H * 0.42 : Math.min(W, H) * 0.34;
      const mx = land ? W * 0.08 : (W - D) / 2, my = land ? (H - D) / 2 : 12 * s;
      const els = [
        graphicEl('sparkles', 0, 0, W, H, { colors: [light, gold], opacity: 0.5, seed: 31 }),
        graphicEl('glow', r(mx - D * 0.4), r(my - D * 0.4), r(D * 1.8), r(D * 1.8), { colors: [gold], opacity: 0.22 }),
        graphicEl('ornate', r(3 * s), r(3 * s), r(W - 6 * s), r(H - 6 * s), { colors: [gold], name: 'Gold frame' }),
        graphicEl('laurel', r(mx - D * 0.18), r(my - D * 0.12), r(D * 1.36), r(D * 1.2), { colors: [gold] }),
        shapeEl('circle', r(mx), r(my), r(D), r(D), { fill: mixHex(base, gold, 0.12), stroke: gold, strokeW: Math.max(1, r(0.5 * s)) }),
        shapeEl('circle', r(mx + D * 0.07), r(my + D * 0.07), r(D * 0.86), r(D * 0.86), { fill: 'transparent', stroke: light, strokeW: Math.max(1, r(0.18 * s)), opacity: 0.7 }),
        textEl(c.emoji, r(mx), r(my + D * 0.24), r(D), r(D * 0.52), { size: r(D * 0.4) }),
      ];
      const list = items(c, t, s, { emoji: false }).filter(Boolean).map((it) => (it.kind === 'text' && it.color === '#E9C46A' && it.size > 5 * s ? { ...it, el: { fill2: light, gradAngle: 90 } } : it));
      const box = land ? { x: mx + D + 8 * s, y: 10 * s, w: W - mx - D - 18 * s, h: H - 20 * s } : { x: 12 * s, y: my + D + 5 * s, w: W - 24 * s, h: H - my - D - 17 * s };
      els.push(...stack(list, box, { align: land ? 'left' : 'center' }));
      return { bg: radial(mixHex(base, gold, 0.1), base), elements: els };
    },
  },
  {
    key: 'pop3d', name: '3D pop type', adv: true,
    type: (p) => {
      const lightBg = isLight(p.bg);
      const title = lightBg ? p.deep : isLight(p.primary) ? p.primary : '#FFFFFF';
      return { titleFont: 'Archivo Black', titleWeight: '400', titleWide: 0.78, titleSize: 11, titleUpper: true, titleLh: 1, bodyFont: 'Poppins', title, kicker: lightBg ? p.ink : '#FFFFFF', text: lightBg ? '#1E293B' : 'rgba(255,255,255,0.92)', pillFill: p.ink === title ? p.deep : p.ink, pillText: '#FFFFFF' };
    },
    build(c, W, H, p, t) {
      const s = unit(W, H), pad = 7 * s;
      const land = W / H > 1.15;
      const lightBg = isLight(p.bg);
      const depth = Math.max(3, r(1.4 * s));
      const ext = lightBg ? p.ink : mixHex(p.bg, '#000000', 0.55);
      const B = Math.min(W, H) * (land ? 0.36 : 0.3);
      const els = [
        graphicEl('halftone', 0, r(H * 0.55), r(W * 0.5), r(H * 0.45), { colors: [lightBg ? p.deep : '#FFFFFF'], opacity: 0.18 }),
        graphicEl('confetti', 0, 0, W, r(H * 0.5), { colors: [p.primary, p.accent, p.deep], opacity: 0.85, seed: 9 }),
        shapeEl('burst', r(W - B - 3 * s), r(3 * s), r(B), r(B), { fill: p.accent === '#FFFFFF' ? p.primary : p.accent, rot: 12, name: 'Sticker' }),
        textEl(c.cta || c.kicker, r(W - B - 3 * s + B * 0.16), r(3 * s + B * 0.36), r(B * 0.68), r(B * 0.3), { font: body(t), weight: '800', size: r(Math.min(B * 0.12, (B * 1.2) / Math.max(6, String(c.cta || c.kicker).length))), color: on(p.accent === '#FFFFFF' ? p.primary : p.accent), rot: 12, lh: 1.1, upper: !t.hi }),
        textEl(c.emoji, r(pad * 0.6), r(H - Math.min(W, H) * 0.3), r(Math.min(W, H) * 0.26), r(Math.min(W, H) * 0.26), { size: r(Math.min(W, H) * 0.18), rot: -14 }),
      ];
      const [, kick, title, sub, det] = items(c, t, s, { emoji: false, scale: 1.05 });
      const t3 = title && { ...title, el: { extrude: { depth, color: ext }, stroke: ext, strokeW: Math.max(1, r(0.25 * s)) } };
      const box = land ? { x: pad, y: pad, w: W * 0.6, h: H - 2 * pad } : { x: pad, y: B * 0.9, w: W - 2 * pad, h: H - B * 0.9 - Math.min(W, H) * 0.3 };
      els.push(...stack([kick, t3].filter(Boolean), { x: box.x, y: box.y, w: box.w, h: box.h * 0.55 }, { align: 'left' }));
      const tagY = box.y + box.h * 0.58;
      if (sub) {
        els.push(shapeEl('rounded', r(box.x), r(tagY), r(box.w * 0.92), r(box.h * 0.22), { fill: lightBg ? '#FFFFFF' : p.card, radius: r(2 * s), rot: -1.5, stroke: ext, strokeW: Math.max(1, r(0.3 * s)), shadow: { x: r(0.9 * s), y: r(0.9 * s), blur: 0, color: ext }, name: 'Tag' }));
        els.push(...stack([{ ...sub, color: '#1E293B' }], { x: box.x + 3 * s, y: tagY + 1.5 * s, w: box.w * 0.92 - 6 * s, h: box.h * 0.22 - 3 * s }, { align: 'left' }).map((e) => ({ ...e, rot: -1.5 })));
      }
      if (det) els.push(...stack([det], { x: box.x, y: tagY + box.h * 0.26, w: box.w, h: box.h * 0.16 }, { align: 'left' }));
      return { bg: lightBg ? solid(p.bg) : grad(p.bg, p.bg2, 160), elements: els };
    },
  },
  {
    key: 'editorial', name: 'Swiss editorial', adv: true,
    type: (p) => ({ titleFont: 'Space Grotesk', titleWeight: '700', titleWide: 0.6, titleSize: 11, titleLh: 0.98, bodyFont: 'Inter', title: '#111111', kicker: isLight(p.deep) ? p.ink : p.deep, text: '#3F3F46', pillFill: '#111111', pillText: '#FFFFFF' }),
    build(c, W, H, p, t) {
      const s = unit(W, H), pad = 6 * s;
      const land = W / H > 1.15;
      const acc = isLight(p.deep) ? p.ink : p.deep;
      const paper = '#F4F1EA';
      const num = String((c.key.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0) % 89) + 10);
      const els = [
        ...[1, 2, 3].map((k) => shapeEl('rect', r(pad + ((W - 2 * pad) * k) / 4), r(pad), 1, r(H - 2 * pad), { fill: '#111111', opacity: 0.1, name: 'Grid line' })),
        shapeEl('rect', r(pad), r(pad), r(W - 2 * pad), Math.max(2, r(0.5 * s)), { fill: '#111111' }),
        shapeEl('rect', r(pad), r(H - pad), r(W - 2 * pad), 1, { fill: '#111111' }),
        textEl(num, r(pad), r(pad + 2 * s), r(W * 0.4), r(22 * s), { font: 'Space Grotesk', weight: '700', size: r(20 * s), color: acc, align: 'left', lh: 1, ls: -0.04 }),
        textEl(String(c.kicker).toUpperCase(), r(W - pad - 3 * s - H * 0.25), r(pad + H * 0.13), r(H * 0.5), r(4 * s), { font: body(t), weight: '700', size: r(2.6 * s), color: '#111111', align: 'center', ls: 0.3, rot: 90, name: 'Vertical label' }),
      ];
      const pw = land ? W * 0.32 : (W - 2 * pad) * 0.5, ph = land ? H * 0.62 : H * 0.3;
      const px = land ? W - pad - 6 * s - pw : W - pad - 6 * s - pw, py = land ? pad + 6 * s : pad + 4 * s;
      els.push(slotEl('photo', r(px), r(py), r(pw), r(ph), { src: photo(c, 5, pw, ph), slot: c.x.photo, phBg: '#D4D4D8', phBg2: '#A1A1AA', filters: { grayscale: 100 } }));
      els.push(shapeEl('rect', r(px - 1.6 * s), r(py + ph - 8 * s), r(10 * s), r(10 * s), { fill: acc, name: 'Accent block' }));
      const [, , title, sub, det, cta] = items(c, t, s, { emoji: false });
      const tb = land ? { x: pad, y: H * 0.36, w: W * 0.58, h: H * 0.42 } : { x: pad, y: py + ph + 4 * s, w: W - 2 * pad - 4 * s, h: H * 0.3 };
      const titleEls = stack([title].filter(Boolean), tb, { align: 'left', valign: 'top' });
      els.push(...titleEls);
      const titleEnd = titleEls.reduce((m, e) => Math.max(m, e.y + e.h), tb.y);
      const colY = land ? Math.max(titleEnd + 3 * s, H * 0.66) : Math.max(titleEnd + 4 * s, H * 0.68), colH = H - pad - 10 * s - (colY + 3.6 * s), cw = (W - 2 * pad) / 2 - 3 * s;
      els.push(textEl(t.hi ? 'क्या' : 'WHAT', r(pad), r(colY), r(cw), r(3 * s), { font: body(t), weight: '700', size: r(2.2 * s), color: acc, align: 'left', ls: t.hi ? 0 : 0.2 }));
      els.push(...stack([sub && { ...sub, size: Math.min(sub.size, 3.4 * s) }].filter(Boolean), { x: pad, y: colY + 3.6 * s, w: cw, h: colH }, { align: 'left', valign: 'top' }));
      if (det) {
        els.push(textEl(t.hi ? 'कब / कहाँ' : 'WHEN / WHERE', r(pad + cw + 6 * s), r(colY), r(cw), r(3 * s), { font: body(t), weight: '700', size: r(2.2 * s), color: acc, align: 'left', ls: t.hi ? 0 : 0.2 }));
        els.push(...stack([{ ...det, size: Math.min(det.size, 3.2 * s) }], { x: pad + cw + 6 * s, y: colY + 3.6 * s, w: cw, h: colH }, { align: 'left', valign: 'top' }));
      }
      if (cta) els.push(textEl(`${cta.text}  →`, r(pad), r(H - pad - 7 * s), r(W - 2 * pad), r(5 * s), { font: body(t), weight: '700', size: r(3.2 * s), color: '#111111', align: 'left' }));
      els.push(textEl(`No. ${num} · 2026`, r(pad), r(H - pad - 7 * s), r(W - 2 * pad), r(5 * s), { font: 'Space Grotesk', weight: '500', size: r(2.6 * s), color: '#71717A', align: 'right' }));
      return { bg: solid(paper), elements: els };
    },
  },
];
