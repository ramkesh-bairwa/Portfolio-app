// Photo-based "pro" layouts: empty photo frames people fill with their own pictures (candidate, birthday person, sender…),
// plus decorative graphics, name plates and slogan bands. All positions are worked out from the page size.
import { graphicEl, grad, iconEl, isLight, photo, r, shapeEl, slotEl, solid, stack, textEl } from './kit';

// Size unit; tall pages (stories, standees) get bigger text and frames
const unit = (W, H) => (Math.min(W, H) / 100) * (H / W > 1.5 ? 1.25 : 1);
const radial = (from, to) => ({ type: 'radial', color: to, from, to, angle: 0, image: '', overlay: 0 });
const F = (t, en, hi) => (t.hi ? hi : en);
const darker = (hex, k = 0.72) => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const c = (v) => Math.round(v * k).toString(16).padStart(2, '0');
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
};
const soft = (s) => ({ x: 0, y: r(0.8 * s), blur: r(2.5 * s), color: 'rgba(0,0,0,0.3)' });
const TRI = ['#FF9933', '#FFFFFF', '#138808'];
const patriotic = (c) => c.group === 'Politics & social' || c.group === 'National days';

// Text items for stack(): headline with optional thick outline
function heads(c, t, s, o) {
  const big = o.size || 10;
  return [
    c.kicker && { kind: 'text', text: c.kicker, size: 3.6 * s, font: F(t, 'Poppins', 'Hind'), weight: '700', color: o.kicker, upper: !t.hi, ls: t.hi ? 0 : 0.14, gap: 1.4 * s },
    { kind: 'text', text: c.title, size: big * s, font: o.font || F(t, 'Montserrat', 'Baloo 2'), weight: o.weight || '800', color: o.title, lh: t.hi ? 1.25 : 1.05, wide: o.wide || (t.hi ? 0.7 : 0.66), upper: !!o.upper && !t.hi, gap: 2 * s,
      el: { ...(o.outline && { stroke: o.outline, strokeW: r(o.outlineW || 0.45 * s) }), ...(o.shadow && { shadow: o.shadow }) } },
    o.sub !== false && c.sub && { kind: 'text', text: c.sub, size: (o.subSize || 3.8) * s, font: F(t, 'Poppins', 'Hind'), weight: '500', color: o.text, lh: 1.35, gap: 2 * s },
  ];
}
function rest(c, t, s, o) {
  return [
    o.details !== false && c.details.length && { kind: 'text', text: c.details.join('\n'), size: (o.detSize || 3.5) * s, font: F(t, 'Poppins', 'Hind'), weight: '600', color: o.text, lh: 1.45, gap: 2.4 * s },
    o.cta !== false && c.cta && { kind: 'pill', text: c.cta, size: 3.2 * s, font: F(t, 'Poppins', 'Hind'), fill: o.pill, color: o.pillText },
  ];
}

// Name + role on a ribbon
function namePlate(c, t, x, y, w, h, fill, s) {
  return [
    graphicEl('ribbon', r(x), r(y), r(w), r(h), { colors: [fill, darker(fill, 0.6)], name: 'Name plate' }),
    textEl(c.x.name, r(x + h * 0.55), r(y + h * 0.06), r(w - h * 1.1), r(h * 0.42), { font: F(t, 'Montserrat', 'Baloo 2'), weight: '800', size: r(h * 0.32), color: '#FFFFFF', lh: 1.2 }),
    textEl(c.x.role, r(x + h * 0.55), r(y + h * 0.44), r(w - h * 1.1), r(h * 0.3), { font: F(t, 'Poppins', 'Hind'), weight: '500', size: r(h * 0.18), color: 'rgba(255,255,255,0.92)', lh: 1.25 }),
  ];
}

function band(c, t, W, H, s, fill) {
  const bh = 10 * s;
  return [
    shapeEl('rect', 0, r(H - bh - 0.6 * s), W, r(0.6 * s), { fill: '#FFFFFF', name: 'Band line' }),
    shapeEl('rect', 0, r(H - bh), W, r(bh), { fill, name: 'Slogan band' }),
    textEl(c.x.band1, r(2 * s), r(H - bh + bh * 0.26), r(W / 2 - 3 * s), r(bh * 0.6), { font: F(t, 'Poppins', 'Hind'), weight: '700', size: r(3.6 * s), color: '#FFFFFF', lh: 1.2 }),
    textEl(c.x.band2, r(W / 2 + s), r(H - bh + bh * 0.26), r(W / 2 - 3 * s), r(bh * 0.6), { font: F(t, 'Poppins', 'Hind'), weight: '700', size: r(3.6 * s), color: '#FFFFFF', lh: 1.2 }),
  ];
}

function infoRows(c, t, x, y, w, s, color, iconColor) {
  const icons = ['Calendar', 'MapPin', 'Phone', 'Clock'];
  const lines = [...c.details, ...(c.cta ? [c.cta] : [])].slice(0, 4);
  const size = 3.4 * s;
  const rowH = size * 2.1;
  return lines.flatMap((l, i) => [
    shapeEl('circle', r(x), r(y + i * rowH), r(size * 1.6), r(size * 1.6), { fill: iconColor, name: 'Icon dot' }),
    iconEl(icons[i], r(x + size * 0.35), r(y + i * rowH + size * 0.35), r(size * 0.9), r(size * 0.9), { color: '#FFFFFF' }),
    textEl(l, r(x + size * 2.1), r(y + i * rowH + size * 0.12), r(w - size * 2.1), r(size * 1.5), { font: F(t, 'Poppins', 'Hind'), weight: '600', size: r(size), color, align: 'left', lh: 1.3 }),
  ]);
}

// Cut-out person frame; the silhouette is dark on light backgrounds and light on dark ones
const tint = (bg) => (isLight(bg) ? 'rgba(15,23,42,0.28)' : 'rgba(255,255,255,0.62)');
const person = (c, x, y, w, h, s, bg, o = {}) => slotEl('person', r(x), r(y), r(w), r(h), { cutout: true, slot: c.x.photo, phColor: tint(bg), outline: { width: r(0.6 * s), color: '#FFFFFF' }, ...o });
const circlePhoto = (label, x, y, d, ring, s, o = {}) => slotEl('person', r(x), r(y), r(d), r(d), { mask: 'circle', slot: label, stroke: ring, strokeW: r(Math.max(2, d * 0.04)), phBg: '#F1F5F9', phBg2: '#CBD5E1', shadow: soft(s), ...o });

export const PRO_LAYOUTS = [
  {
    key: 'leader', name: 'Leader hero',
    build(c, W, H, p, t) {
      const s = unit(W, H);
      const pad = 5 * s;
      const land = W / H > 1.15;
      const lightC = isLight(p.bg2);
      const bandFill = patriotic(c) ? '#138808' : p.deep;
      const head = { title: lightC ? p.ink : '#FFFFFF', outline: lightC ? '#FFFFFF' : p.ink, outlineW: 0.5 * s, kicker: lightC ? p.ink : '#FFFFFF', text: lightC ? p.ink : '#FFFFFF', size: 9, shadow: { x: 0, y: r(0.6 * s), blur: r(1.5 * s), color: 'rgba(0,0,0,0.25)' } };
      const L = (land ? 13 : 15) * s;
      const g = 2.5 * s;
      const rowW = 4 * L + 3 * g;
      const rowX = W - pad - rowW;
      const els = [
        graphicEl('sunburst', 0, 0, W, H, { colors: ['#FFFFFF', p.bg2], opacity: 0.9 }),
        graphicEl('arcs', 0, 0, W, H, { colors: ['#FFFFFF'] }),
        ...[0, 1, 2, 3].map((i) => circlePhoto(`${c.x.leaders} ${i + 1}`, rowX + i * (L + g), pad, L, '#FFFFFF', s)),
      ];
      const bh = 10 * s;
      if (land) {
        els.push(person(c, 0, H * 0.1, W * 0.36, H * 0.9 - bh, s, p.bg));
        els.push(...stack(heads(c, t, s, head), { x: W * 0.38, y: pad + L + 2 * s, w: W * 0.4, h: H - pad - L - bh - 6 * s }));
        els.push(slotEl('logo', r(W * 0.8), r(H * 0.36), r(W * 0.16), r(W * 0.16), { mask: 'circle', slot: F(t, 'Party symbol', 'चुनाव चिन्ह'), phColor: lightC ? p.deep : '#FFFFFF' }));
        els.push(...namePlate(c, t, s, H - bh - 13 * s, W * 0.34, 12 * s, p.deep, s));
      } else {
        els.push(person(c, -2 * s, H * 0.3, W * 0.58, H * 0.7 - bh, s, p.bg));
        els.push(...stack(heads(c, t, s, head), { x: W * 0.3, y: pad + L + 3 * s, w: W * 0.7 - pad, h: H * 0.27 }));
        const sy = pad + L + 3 * s + H * 0.28;
        const sd = Math.min(W * 0.3, H * 0.2) * (H / W < 1.2 ? 0.75 : 1); // smaller symbol on square pages leaves room for the details
        els.push(slotEl('logo', r(W * 0.62 + (W * 0.38 - pad - sd) / 2), r(sy), r(sd), r(sd), { mask: 'circle', slot: F(t, 'Party symbol', 'चुनाव चिन्ह'), phColor: lightC ? p.deep : '#FFFFFF' }));
        els.push(...stack(rest(c, t, s, { text: head.text, pill: p.deep, pillText: '#FFFFFF', detSize: 3.2 }), { x: W * 0.56, y: sy + sd + 2 * s, w: W * 0.44 - pad, h: H - bh - 16 * s - sy - sd - 2 * s }));
        els.push(...namePlate(c, t, pad * 0.4, H - bh - 14 * s, W * 0.52, 12 * s, p.deep, s));
      }
      els.push(...band(c, t, W, H, s, bandFill));
      return { bg: radial(p.bg2, p.bg), elements: els };
    },
  },
  {
    key: 'sender', name: 'Wishes from you',
    build(c, W, H, p, t) {
      const s = unit(W, H);
      const pad = 6 * s;
      const land = W / H > 1.15;
      const dark = !isLight(p.bg);
      const titleC = dark ? (isLight(p.primary) ? p.primary : '#FFFFFF') : p.deep;
      const els = [
        graphicEl('bokeh', 0, 0, W, H, { colors: ['#FFFFFF', p.primary], opacity: 0.8 }),
        graphicEl('mandala', r(W * 0.15), r(-H * 0.05), r(W * 0.7), r(W * 0.7), { colors: [dark ? '#FFFFFF' : p.deep, p.primary], opacity: 0.18 }),
        graphicEl('garland', 0, 0, W, r(13 * s), { name: 'Garland' }),
      ];
      const head = { title: titleC, outline: dark ? darker(p.bg, 0.5) : '#FFFFFF', outlineW: 0.35 * s, kicker: dark ? '#FFFFFF' : p.ink, text: dark ? 'rgba(255,255,255,0.9)' : p.ink, size: 10, font: F(t, 'Playfair Display', 'Rozha One'), weight: F(t, '700', '400'), wide: t.hi ? 0.62 : 0.56 };
      if (land) {
        els.push(...stack([...heads(c, t, s, head), ...rest(c, t, s, { text: head.text, pill: p.primary, pillText: p.ink })], { x: pad, y: 15 * s, w: W * 0.58, h: H - 30 * s }));
        els.push(person(c, W * 0.62, H * 0.2, W * 0.38, H * 0.8, s, p.bg));
        els.push(shapeEl('rounded', r(pad), r(H - 15 * s), r(W * 0.55), r(11 * s), { fill: '#FFFFFF', radius: r(2 * s), shadow: soft(s), name: 'Sender card' }));
      } else {
        els.push(...stack([...heads(c, t, s, head)], { x: pad, y: 15 * s, w: W - 2 * pad, h: H * 0.38 }));
        els.push(shapeEl('wave', 0, r(H * 0.62), W, r(H * 0.38), { fill: '#FFFFFF', opacity: 0.96, name: 'Panel' }));
        els.push(person(c, W * 0.5, H * 0.5, W * 0.5, H * 0.5, s, '#FFFFFF', { outline: { width: r(0.5 * s), color: '#FFFFFF' } }));
        els.push(...stack([
          { kind: 'text', text: F(t, 'With best wishes', 'शुभेच्छु'), size: 3.2 * s, font: F(t, 'Poppins', 'Hind'), weight: '600', color: p.deep, gap: s },
          { kind: 'text', text: c.x.name, size: 6.5 * s, font: F(t, 'Montserrat', 'Baloo 2'), weight: '800', color: p.ink, lh: 1.1, gap: s },
          { kind: 'text', text: c.x.role, size: 3 * s, font: F(t, 'Poppins', 'Hind'), weight: '500', color: '#475569', lh: 1.3 },
        ], { x: pad, y: H * 0.76, w: W * 0.48, h: H * 0.2 }, { align: 'left' }));
      }
      if (land) els.push(textEl(c.x.name, r(pad + 2 * s), r(H - 13.5 * s), r(W * 0.5), r(5 * s), { font: F(t, 'Montserrat', 'Baloo 2'), weight: '800', size: r(4.2 * s), color: p.ink, align: 'left' }), textEl(c.x.role, r(pad + 2 * s), r(H - 8.5 * s), r(W * 0.5), r(4 * s), { font: F(t, 'Poppins', 'Hind'), size: r(2.6 * s), color: '#475569', align: 'left' }));
      return { bg: grad(p.bg, p.bg2, 160), elements: els };
    },
  },
  {
    key: 'portrait-ring', name: 'Photo in a ring',
    build(c, W, H, p, t) {
      const s = unit(W, H);
      const pad = 6 * s;
      const land = W / H > 1.15;
      const dark = !isLight(p.bg);
      const ink = dark ? '#FFFFFF' : p.ink;
      const els = [
        graphicEl('confetti', 0, 0, W, H, { colors: [p.primary, p.accent, '#FFFFFF'], opacity: 0.85 }),
        graphicEl('balloons', r(-2 * s), 0, r(W * 0.28), r(H * 0.42), { colors: [p.primary, p.accent, p.deep] }),
        graphicEl('balloons', r(W * 0.74), 0, r(W * 0.28), r(H * 0.42), { colors: [p.accent, p.deep, p.primary], seed: 13 }),
      ];
      const D = land ? H * 0.62 : W * 0.46;
      const cx = land ? W * 0.27 : W / 2;
      const cy = land ? H * 0.46 : H * 0.1 + D / 2;
      els.push(graphicEl('laurel', r(cx - D * 0.72), r(cy - D * 0.64), r(D * 1.44), r(D * 1.12), { colors: [p.primary === '#FFFFFF' ? p.accent : p.primary] }));
      els.push(circlePhoto(c.x.photo, cx - D / 2, cy - D / 2, D, p.primary === '#FFFFFF' ? '#FFFFFF' : p.primary, s));
      const script = { kind: 'text', text: c.title, size: (t.hi ? 8 : 11) * s, font: F(t, 'Great Vibes', 'Amita'), weight: F(t, '400', '700'), color: dark ? (isLight(p.primary) ? p.primary : '#FFFFFF') : p.deep, lh: 1.2, wide: t.hi ? 0.62 : 0.5, gap: 1.5 * s, el: { shadow: { x: 0, y: r(0.4 * s), blur: r(1.2 * s), color: 'rgba(0,0,0,0.25)' } } };
      const who = c.details[0] || c.x.name;
      const items = [
        c.kicker && { kind: 'text', text: c.kicker, size: 3.4 * s, font: F(t, 'Poppins', 'Hind'), weight: '600', color: ink, upper: !t.hi, ls: t.hi ? 0 : 0.14, gap: 1 * s },
        script,
        { kind: 'pill', text: who, size: 4.2 * s, font: F(t, 'Montserrat', 'Baloo 2'), weight: '800', fill: p.deep, color: '#FFFFFF', gap: 2 * s },
        c.sub && { kind: 'text', text: c.sub, size: 3.4 * s, font: F(t, 'Poppins', 'Hind'), color: ink, lh: 1.35 },
      ];
      if (land) els.push(...stack(items, { x: W * 0.52, y: pad, w: W * 0.44, h: H - 22 * s }));
      else els.push(...stack(items, { x: pad, y: cy + D / 2 + 3 * s, w: W - 2 * pad, h: H - cy - D / 2 - 22 * s }));
      // well-wisher strip
      const wy = H - 17 * s;
      els.push(shapeEl('rounded', r(pad), r(wy), r(W - 2 * pad), r(13 * s), { fill: dark ? 'rgba(255,255,255,0.14)' : '#FFFFFF', radius: r(6.5 * s), name: 'Wisher strip', shadow: dark ? null : soft(s) }));
      els.push(circlePhoto(F(t, 'Wisher photo', 'शुभेच्छु फोटो'), pad + 1.5 * s, wy + 1.5 * s, 10 * s, p.primary === '#FFFFFF' ? p.accent : p.primary, s, { shadow: null }));
      // label, then the name in bold and the role underneath, each on its own line so nothing spills out of the strip
      const tw = r(W - 2 * pad - 16 * s);
      els.push(textEl(F(t, 'Wishes from', 'शुभेच्छु'), r(pad + 14 * s), r(wy + 1.2 * s), tw, r(3.2 * s), { font: F(t, 'Poppins', 'Hind'), size: r(2.3 * s), weight: '600', color: dark ? 'rgba(255,255,255,0.8)' : '#64748B', align: 'left', lh: 1.2 }));
      els.push(textEl(c.x.name, r(pad + 14 * s), r(wy + 4.2 * s), tw, r(4.6 * s), { font: F(t, 'Montserrat', 'Baloo 2'), size: r(3.5 * s), weight: '800', color: ink, align: 'left', lh: 1.2 }));
      els.push(textEl(c.x.role, r(pad + 14 * s), r(wy + 8.7 * s), tw, r(3.4 * s), { font: F(t, 'Poppins', 'Hind'), size: r(2.4 * s), weight: '500', color: dark ? 'rgba(255,255,255,0.8)' : '#475569', align: 'left', lh: 1.2 }));
      return { bg: grad(p.bg, p.bg2, 135), elements: els };
    },
  },
  {
    key: 'polaroid', name: 'Polaroid',
    build(c, W, H, p, t) {
      const s = unit(W, H);
      const pad = 7 * s;
      const land = W / H > 1.15;
      const dark = !isLight(p.bg);
      const fw = land ? H * 0.66 : W * 0.56;
      const fx = land ? W * 0.07 : (W - fw) / 2;
      const fy = land ? (H - fw * 1.12) / 2 : 6 * s;
      const els = [
        graphicEl('sparkles', 0, 0, W, H, { colors: ['#FFFFFF', p.primary] }),
        shapeEl('rect', r(fx), r(fy), r(fw), r(fw * 1.12), { fill: '#FFFFFF', rot: -4, shadow: { x: 0, y: r(1.5 * s), blur: r(4 * s), color: 'rgba(0,0,0,0.3)' }, name: 'Polaroid' }),
        slotEl('photo', r(fx + fw * 0.06), r(fy + fw * 0.06), r(fw * 0.88), r(fw * 0.88), { src: photo(c, 7, 900, 900),  rot: -4, slot: c.x.photo, phBg: '#E2E8F0', phBg2: '#CBD5E1' }),
        shapeEl('rect', r(fx + fw * 0.38), r(fy - 2 * s), r(fw * 0.24), r(5 * s), { fill: p.primary === '#FFFFFF' ? p.accent : p.primary, opacity: 0.8, rot: -4, name: 'Tape' }),
        textEl(c.emoji, r(fx + fw * 0.06), r(fy + fw * 0.95), r(fw * 0.88), r(fw * 0.14), { size: r(fw * 0.09), rot: -4 }),
      ];
      const head = { title: dark ? '#FFFFFF' : p.ink, kicker: dark ? p.primary : p.deep, text: dark ? 'rgba(255,255,255,0.9)' : p.ink, size: 9, font: F(t, 'Caveat', 'Kalam'), weight: '700', wide: t.hi ? 0.6 : 0.46 };
      const box = land ? { x: fx + fw + 6 * s, y: pad, w: W - fx - fw - 10 * s, h: H - 2 * pad } : { x: pad, y: fy + fw * 1.12 + 4 * s, w: W - 2 * pad, h: H - fy - fw * 1.12 - 4 * s - pad };
      els.push(...stack([...heads(c, t, s, head), ...rest(c, t, s, { text: head.text, pill: p.deep, pillText: '#FFFFFF' })], box));
      return { bg: grad(p.bg, p.bg2, 150), elements: els };
    },
  },
  {
    key: 'magazine', name: 'Magazine cover',
    build(c, W, H, p, t) {
      const s = unit(W, H);
      const pad = 6 * s;
      const land = W / H > 1.15;
      const base = isLight(p.bg) ? p.ink : p.bg;
      const els = [];
      if (land) {
        els.push(slotEl('photo', r(W * 0.42), 0, r(W * 0.58), H, { src: photo(c, 1, 900, 900),  slot: c.x.photo, phBg: '#CBD5E1', phBg2: '#94A3B8' }));
        els.push(shapeEl('rect', r(W * 0.42), 0, r(W * 0.25), H, { fill: base, fill2: 'rgba(0,0,0,0)', gradAngle: 90, name: 'Fade' }));
        els.push(...stack([...heads(c, t, s, { title: '#FFFFFF', kicker: p.primary === '#FFFFFF' ? p.accent : p.primary, text: 'rgba(255,255,255,0.88)', size: 10, details: false })], { x: pad, y: pad, w: W * 0.5, h: H * 0.6 }, { align: 'left' }));
        els.push(...infoRows(c, t, pad, H * 0.66, W * 0.48, s * 0.9, '#FFFFFF', p.deep === base ? p.accent : p.deep));
      } else {
        const ph = H * 0.62;
        els.push(slotEl('photo', 0, 0, W, r(ph), { src: photo(c, 8, 900, 900),  slot: c.x.photo, phBg: '#CBD5E1', phBg2: '#94A3B8' }));
        els.push(shapeEl('rect', 0, r(ph * 0.55), W, r(ph * 0.46), { fill: 'rgba(0,0,0,0)', fill2: base, gradAngle: 180, name: 'Fade' }));
        els.push(...stack([
          { kind: 'pill', text: c.kicker || c.emoji, size: 3 * s, font: F(t, 'Poppins', 'Hind'), fill: p.deep === base ? p.accent : p.deep, color: '#FFFFFF', gap: 2 * s },
          { kind: 'text', text: c.title, size: 10 * s, font: F(t, 'Montserrat', 'Baloo 2'), weight: '800', color: '#FFFFFF', lh: t.hi ? 1.25 : 1.04, wide: t.hi ? 0.7 : 0.66, gap: 1.5 * s },
          c.sub && { kind: 'text', text: c.sub, size: 3.6 * s, font: F(t, 'Poppins', 'Hind'), color: 'rgba(255,255,255,0.88)', lh: 1.35 },
        ], { x: pad, y: ph * 0.48, w: W - 2 * pad, h: ph * 0.5 + 6 * s }, { align: 'left', valign: 'center' }));
        els.push(...infoRows(c, t, pad, ph + 9 * s, W - 2 * pad, s, '#FFFFFF', p.deep === base ? p.accent : p.deep));
      }
      return { bg: solid(base), elements: els };
    },
  },
  {
    key: 'slant', name: 'Slanted photo',
    build(c, W, H, p, t) {
      const s = unit(W, H);
      const pad = 6 * s;
      const land = W / H > 1.15;
      const accent = isLight(p.primary) && p.primary !== '#FFFFFF' ? p.primary : p.accent;
      const els = [
        slotEl('photo', r(land ? W * 0.42 : W * 0.3), 0, r(land ? W * 0.62 : W * 0.75), r(land ? H : H * 0.6), { src: photo(c, 4, 900, 900),  mask: 'parallelogram', slot: c.x.photo, phBg: '#CBD5E1', phBg2: '#94A3B8' }),
        shapeEl('parallelogram', r(land ? W * 0.38 : W * 0.25), 0, r(land ? W * 0.08 : W * 0.12), r(land ? H : H * 0.6), { fill: accent, name: 'Accent' }),
      ];
      const text = { title: p.ink, kicker: p.deep, text: '#334155', size: 9 };
      if (land) {
        els.push(...stack([...heads(c, t, s, text), ...rest(c, t, s, { text: '#334155', pill: p.deep, pillText: '#FFFFFF' })], { x: pad, y: pad, w: W * 0.36, h: H - 16 * s }, { align: 'left' }));
      } else {
        els.push(...stack(heads(c, t, s, { ...text, sub: false }), { x: pad, y: H * 0.6 + 3 * s, w: W - 2 * pad, h: H * 0.2 }, { align: 'left' }));
        els.push(...stack([{ kind: 'text', text: c.sub, size: 3.4 * s, font: F(t, 'Poppins', 'Hind'), color: '#334155', lh: 1.35, gap: 1.5 * s }, ...rest(c, t, s, { text: '#334155', pill: p.deep, pillText: '#FFFFFF', detSize: 3.2 })], { x: pad, y: H * 0.81, w: W - 2 * pad, h: H * 0.19 - 12 * s }, { align: 'left' }));
      }
      els.push(shapeEl('rect', 0, r(H - 9 * s), W, r(9 * s), { fill: p.deep, name: 'Contact strip' }));
      els.push(iconEl('Phone', r(pad), r(H - 6.6 * s), r(4.2 * s), r(4.2 * s), { color: '#FFFFFF' }));
      els.push(textEl(c.x.role, r(pad + 6 * s), r(H - 7 * s), r(W - 2 * pad - 6 * s), r(5 * s), { font: F(t, 'Poppins', 'Hind'), weight: '600', size: r(3.2 * s), color: '#FFFFFF', align: 'left' }));
      return { bg: solid('#FFFFFF'), elements: els };
    },
  },
  {
    key: 'arch', name: 'Arch invitation',
    build(c, W, H, p, t) {
      const s = unit(W, H);
      const land = W / H > 1.15;
      const aw = land ? H * 0.46 : W * 0.4;
      const ah = aw * 1.25;
      const ax = land ? W * 0.12 : (W - aw) / 2;
      const ay = land ? (H - ah) / 2 : 12 * s;
      const els = [
        graphicEl('petals', 0, 0, W, H, { colors: [p.deep, p.primary === '#FFFFFF' ? p.accent : p.primary], opacity: 0.45 }),
        graphicEl('ornate', 0, 0, W, H, { colors: [p.deep] }),
        slotEl('person', r(ax), r(ay), r(aw), r(ah), { mask: 'arch', slot: c.x.photo, phBg: '#F1F5F9', phBg2: '#E2E8F0', phColor: '#CBD5E1' }),
        shapeEl('arch', r(ax - 1.2 * s), r(ay - 1.2 * s), r(aw + 2.4 * s), r(ah + 2.4 * s), { fill: 'transparent', stroke: p.deep, strokeW: Math.max(2, r(0.5 * s)), name: 'Arch border' }),
      ];
      const head = { title: p.deep, kicker: p.ink, text: p.ink, size: t.hi ? 8 : 11, font: F(t, 'Great Vibes', 'Amita'), weight: F(t, '400', '700'), wide: t.hi ? 0.62 : 0.5 };
      const box = land ? { x: ax + aw + 8 * s, y: 12 * s, w: W - ax - aw - 20 * s, h: H - 24 * s } : { x: 12 * s, y: ay + ah + 3 * s, w: W - 24 * s, h: H - ay - ah - 15 * s };
      els.push(...stack([...heads(c, t, s, head), ...rest(c, t, s, { text: p.ink, pill: p.deep, pillText: '#FFFFFF', detSize: 3.2 })], box));
      return { bg: solid(p.card === '#FFFFFF' ? '#FFFDF8' : p.card), elements: els };
    },
  },
  {
    key: 'ribbon', name: 'Ribbon offer',
    build(c, W, H, p, t) {
      const s = unit(W, H);
      const pad = 6 * s;
      const land = W / H > 1.15;
      const pop = p.primary === '#FFFFFF' ? p.accent : p.primary;
      const D = land ? H * 0.6 : W * 0.5;
      const px = land ? W * 0.06 : (W - D) / 2;
      const py = land ? (H - D) / 2 : 7 * s;
      const els = [
        graphicEl('stripes', 0, 0, W, H, { colors: ['#FFFFFF'], opacity: 0.07 }),
        circlePhoto(c.x.photo, px, py, D, '#FFFFFF', s, { placeholder: 'photo' }),
        shapeEl('burst', r(px + D * 0.68), r(py - D * 0.04), r(D * 0.42), r(D * 0.42), { fill: pop, rot: 12, name: 'Badge' }),
        textEl(c.kicker || c.emoji, r(px + D * 0.72), r(py + D * 0.12), r(D * 0.34), r(D * 0.12), { font: F(t, 'Poppins', 'Hind'), weight: '800', size: r(D * 0.055), color: isLight(pop) ? p.ink : '#FFFFFF', rot: 12, lh: 1.1 }),
      ];
      const rx = land ? px + D + 4 * s : pad * 0.5;
      const rw = land ? W - rx - pad * 0.5 : W - pad;
      const ry = land ? H * 0.16 : py + D + 3 * s;
      const rh = 15 * s;
      els.push(graphicEl('ribbon', r(rx), r(ry), r(rw), r(rh), { colors: [pop, darker(pop, 0.62)], name: 'Title ribbon' }));
      els.push(...stack([{ kind: 'text', text: c.title, size: 7 * s, font: F(t, 'Montserrat', 'Baloo 2'), weight: '800', color: isLight(pop) ? p.ink : '#FFFFFF', lh: 1.05, wide: t.hi ? 0.7 : 0.66 }], { x: rx + rh * 0.7, y: ry + 0.8 * s, w: rw - rh * 1.4, h: rh * 0.62 }));
      const textC = isLight(p.bg) ? p.ink : '#FFFFFF';
      els.push(...stack([
        c.sub && { kind: 'text', text: c.sub, size: 3.8 * s, font: F(t, 'Poppins', 'Hind'), weight: '500', color: textC, lh: 1.35, gap: 2 * s },
        ...rest(c, t, s, { text: textC, pill: '#FFFFFF', pillText: p.ink }),
      ], { x: land ? rx + 2 * s : pad, y: ry + rh + 2 * s, w: land ? rw - 4 * s : W - 2 * pad, h: H - ry - rh - pad }));
      return { bg: grad(p.bg, p.bg2, 160), elements: els };
    },
  },
  {
    key: 'collage', name: 'Photo collage',
    build(c, W, H, p, t) {
      const s = unit(W, H);
      const pad = 4 * s;
      const land = W / H > 1.15;
      const g = 1.5 * s;
      const ph = { phBg: '#CBD5E1', phBg2: '#94A3B8', radius: r(2 * s) };
      const els = [];
      if (land) {
        const x0 = W * 0.48;
        const cw = W - x0 - pad;
        els.push(slotEl('photo', r(x0), r(pad), r(cw), r((H - 2 * pad - g) * 0.6), { slot: c.x.photo, ...ph, src: photo(c, 3, 900, 900) }));
        els.push(slotEl('photo', r(x0), r(pad + (H - 2 * pad - g) * 0.6 + g), r((cw - g) / 2), r((H - 2 * pad - g) * 0.4), { slot: 'Photo 2', ...ph, src: photo(c, 4, 600, 600) }));
        els.push(slotEl('photo', r(x0 + (cw - g) / 2 + g), r(pad + (H - 2 * pad - g) * 0.6 + g), r((cw - g) / 2), r((H - 2 * pad - g) * 0.4), { slot: 'Photo 3', ...ph, src: photo(c, 5, 600, 600) }));
        els.push(...stack([...heads(c, t, s, { title: p.ink, kicker: p.deep, text: '#334155', size: 9 }), ...rest(c, t, s, { text: '#334155', pill: p.deep, pillText: '#FFFFFF' })], { x: 2 * pad, y: 2 * pad, w: x0 - 4 * pad, h: H - 4 * pad }, { align: 'left' }));
        return { bg: solid('#FFFFFF'), elements: els };
      }
      const top = H * 0.46;
      const bw = (W - 2 * pad - g) * 0.62;
      els.push(slotEl('photo', r(pad), r(pad), r(bw), r(top), { src: photo(c, 6, 900, 900),  slot: c.x.photo, ...ph }));
      els.push(slotEl('photo', r(pad + bw + g), r(pad), r(W - 2 * pad - bw - g), r((top - g) / 2), { slot: 'Photo 2', ...ph, src: photo(c, 4, 600, 600) }));
      els.push(slotEl('photo', r(pad + bw + g), r(pad + (top - g) / 2 + g), r(W - 2 * pad - bw - g), r((top - g) / 2), { slot: 'Photo 3', ...ph, src: photo(c, 5, 600, 600) }));
      const by = pad + top + 2.5 * s;
      els.push(shapeEl('rect', 0, r(by), W, r(H * 0.2), { fill: p.deep, name: 'Title band' }));
      els.push(...stack(heads(c, t, s, { title: '#FFFFFF', kicker: isLight(p.primary) ? p.primary : '#FFFFFF', text: '#FFFFFF', size: 8.5, sub: false }), { x: 2 * pad, y: by + 1.5 * s, w: W - 4 * pad, h: H * 0.2 - 3 * s }));
      els.push(...stack([{ kind: 'text', text: c.sub, size: 3.5 * s, font: F(t, 'Poppins', 'Hind'), color: '#334155', lh: 1.35, gap: 2 * s }, ...rest(c, t, s, { text: '#334155', pill: p.deep, pillText: '#FFFFFF', detSize: 3.2 })], { x: 2 * pad, y: by + H * 0.2 + 2 * s, w: W - 4 * pad, h: H - by - H * 0.2 - 2 * s - pad }));
      return { bg: solid('#FFFFFF'), elements: els };
    },
  },
  {
    key: 'announce', name: 'Big announcement',
    build(c, W, H, p, t) {
      const s = unit(W, H);
      const pad = 6 * s;
      const land = W / H > 1.15;
      const pop = isLight(p.primary) && p.primary !== '#FFFFFF' ? p.primary : '#FACC15';
      const els = [
        shapeEl('rect', 0, 0, W, r(5 * s), { fill: pop }),
        graphicEl('stripes', 0, 0, W, r(5 * s), { colors: ['#111111'], opacity: 0.85 }),
        shapeEl('rect', 0, r(H - 11 * s), W, r(11 * s), { fill: '#111111', name: 'Ticker' }),
        graphicEl('stripes', 0, r(H - 11 * s), W, r(1.4 * s), { colors: [pop] }),
        textEl(c.cta || c.details[0] || c.x.band2, r(pad), r(H - 8.2 * s), r(W - 2 * pad), r(6 * s), { font: F(t, 'Poppins', 'Hind'), weight: '800', size: r(3.6 * s), color: pop, lh: 1.3, upper: !t.hi }),
        graphicEl('halftone', 0, r(5 * s), W, r(H - 16 * s), { colors: ['#FFFFFF'], opacity: 0.08 }),
      ];
      const ps = land ? H * 0.55 : W * 0.42;
      els.push(slotEl('photo', r(W - pad - ps), r(land ? H * 0.2 : H - 15 * s - ps), r(ps), r(ps), { src: photo(c, 2, 900, 900),  slot: c.x.photo, radius: r(2.5 * s), stroke: pop, strokeW: r(0.8 * s), phBg: '#CBD5E1', phBg2: '#94A3B8', rot: 3 }));
      const textC = isLight(p.bg) ? p.ink : '#FFFFFF';
      const items = [
        { kind: 'pill', text: c.kicker || c.emoji, size: 3.6 * s, font: F(t, 'Poppins', 'Hind'), fill: pop, color: '#111111', gap: 2 * s },
        { kind: 'text', text: c.title, size: 12 * s, font: F(t, 'Bebas Neue', 'Khand'), weight: F(t, '400', '700'), color: textC, upper: !t.hi, lh: t.hi ? 1.15 : 0.98, wide: t.hi ? 0.55 : 0.44, gap: 2 * s, el: { extrude: { depth: r(0.6 * s), color: 'rgba(0,0,0,0.35)' } } },
        c.sub && { kind: 'text', text: c.sub, size: 3.8 * s, font: F(t, 'Poppins', 'Hind'), color: textC, lh: 1.35, gap: 2 * s },
        c.details.length && { kind: 'text', text: c.details.join('\n'), size: 3.4 * s, font: F(t, 'Poppins', 'Hind'), weight: '600', color: textC, lh: 1.45 },
      ];
      els.push(...stack(items, land ? { x: pad, y: 9 * s, w: W - ps - 3 * pad, h: H - 24 * s } : { x: pad, y: 10 * s, w: W - 2 * pad, h: H - ps - 30 * s }, { align: 'left' }));
      return { bg: solid(p.bg), elements: els };
    },
  },
  {
    key: 'glass', name: 'Glass card',
    build(c, W, H, p, t) {
      const s = unit(W, H);
      const pad = 6 * s;
      const land = W / H > 1.15;
      const D = land ? H * 0.5 : W * 0.34;
      const card = land ? { x: pad, y: pad, w: W - 2 * pad, h: H - 2 * pad } : { x: pad, y: pad + D * 0.55, w: W - 2 * pad, h: H - 2 * pad - D * 0.55 };
      const dark = !isLight(p.bg);
      const ink = dark ? '#FFFFFF' : p.ink;
      const els = [
        graphicEl('bokeh', 0, 0, W, H, { colors: ['#FFFFFF', p.primary], seed: 21 }),
        graphicEl('glow', r(-W * 0.2), r(-H * 0.1), r(W * 0.8), r(W * 0.8), { colors: [p.primary === '#FFFFFF' ? p.accent : p.primary], opacity: 0.5 }),
        shapeEl('rounded', r(card.x), r(card.y), r(card.w), r(card.h), { fill: dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.62)', stroke: 'rgba(255,255,255,0.55)', strokeW: Math.max(1, r(0.3 * s)), radius: r(4 * s), name: 'Glass card' }),
      ];
      const px = land ? card.x + 5 * s : (W - D) / 2;
      const py = land ? (H - D) / 2 : pad;
      els.push(circlePhoto(c.x.photo, px, py, D, '#FFFFFF', s));
      const box = land ? { x: px + D + 5 * s, y: card.y + 4 * s, w: card.x + card.w - px - D - 9 * s, h: card.h - 8 * s } : { x: card.x + 5 * s, y: py + D + 3 * s, w: card.w - 10 * s, h: card.y + card.h - py - D - 7 * s };
      els.push(...stack([...heads(c, t, s, { title: ink, kicker: dark ? p.primary : p.deep, text: ink, size: 9 }), ...rest(c, t, s, { text: ink, pill: dark ? '#FFFFFF' : p.deep, pillText: dark ? p.ink : '#FFFFFF' })], box));
      return { bg: grad(p.bg, p.bg2, 135), elements: els };
    },
  },
  {
    key: 'neon', name: 'Neon night',
    build(c, W, H, p, t) {
      const s = unit(W, H);
      const pad = 7 * s;
      const land = W / H > 1.15;
      const glowC = isLight(p.primary) && p.primary !== '#FFFFFF' ? p.primary : '#22F5D0';
      const pop = isLight(p.accent) && p.accent !== '#FFFFFF' ? p.accent : '#FF2E97'; // must read on the near-black background
      const D = land ? H * 0.6 : W * 0.48;
      const px = land ? W * 0.08 : (W - D) / 2;
      const py = land ? (H - D) / 2 : pad;
      const els = [
        graphicEl('streaks', 0, 0, W, H, { colors: [glowC, pop] }),
        graphicEl('glow', r(px - D * 0.3), r(py - D * 0.3), r(D * 1.6), r(D * 1.6), { colors: [glowC], opacity: 0.35 }),
        circlePhoto(c.x.photo, px, py, D, glowC, s, { shadow: { x: 0, y: 0, blur: r(4 * s), color: glowC } }),
      ];
      const box = land ? { x: px + D + 6 * s, y: pad, w: W - px - D - 12 * s, h: H - 2 * pad } : { x: pad, y: py + D + 4 * s, w: W - 2 * pad, h: H - py - D - pad - 4 * s };
      els.push(...stack([...heads(c, t, s, { title: '#FFFFFF', kicker: pop, text: 'rgba(255,255,255,0.85)', size: 9.5, shadow: { x: 0, y: 0, blur: r(2.5 * s), color: glowC } }), ...rest(c, t, s, { text: 'rgba(255,255,255,0.85)', pill: pop, pillText: '#FFFFFF' })], box));
      return { bg: radial('#1E1B4B', '#05050F'), elements: els };
    },
  },
  {
    key: 'swoosh', name: 'Swoosh cut-out',
    build(c, W, H, p, t) {
      const s = unit(W, H);
      const pad = 6 * s;
      const land = W / H > 1.15;
      const cols = patriotic(c) ? TRI : [p.deep, '#FFFFFF', p.primary === '#FFFFFF' ? p.accent : p.primary];
      const els = [
        graphicEl('swoosh', 0, r(H * 0.58), W, r(H * 0.42), { colors: cols }),
        graphicEl('swoosh', r(W * 0.55), 0, r(W * 0.45), r(H * 0.18), { colors: cols, rot: 180, opacity: 0.9 }),
        person(c, land ? W * 0.6 : W * 0.44, land ? H * 0.12 : H * 0.3, land ? W * 0.38 : W * 0.56, land ? H * 0.88 : H * 0.7, s, '#FFFFFF'),
      ];
      els.push(...stack([...heads(c, t, s, { title: p.ink, kicker: cols[0] === '#FF9933' ? '#E86A00' : p.deep, text: '#334155', size: 9 }), ...rest(c, t, s, { text: '#334155', pill: cols[0] === '#FF9933' ? '#E86A00' : p.deep, pillText: '#FFFFFF', cta: !land })], land ? { x: pad, y: pad, w: W * 0.55, h: H * 0.62 } : { x: pad, y: pad + 2 * s, w: W * 0.6, h: H * 0.56 }, { align: 'left' }));
      els.push(...namePlate(c, t, land ? pad : pad * 0.4, H - 16 * s, land ? W * 0.42 : W * 0.5, 12 * s, cols[2] === '#138808' ? '#0B3D91' : p.deep, s));
      return { bg: solid('#FFFFFF'), elements: els };
    },
  },
  {
    key: 'info', name: 'Event info',
    build(c, W, H, p, t) {
      const s = unit(W, H);
      const pad = 6 * s;
      const land = W / H > 1.15;
      const head = land ? H : H * 0.3;
      const els = [
        shapeEl('rect', 0, 0, land ? r(W * 0.5) : W, r(head), { fill: p.deep, name: 'Header' }),
        graphicEl('sparkles', 0, 0, land ? r(W * 0.5) : W, r(head), { colors: ['#FFFFFF', isLight(p.primary) ? p.primary : '#FDE68A'], opacity: 0.6 }),
      ];
      const kick = isLight(p.primary) ? p.primary : '#FFFFFF';
      els.push(...stack(heads(c, t, s, { title: '#FFFFFF', kicker: kick, text: 'rgba(255,255,255,0.9)', size: 8.5, sub: land }), land ? { x: pad, y: pad, w: W * 0.5 - 2 * pad, h: H - 2 * pad } : { x: pad, y: pad * 0.7, w: W - 2 * pad, h: head - pad * 1.4 }));
      if (land) {
        els.push(slotEl('photo', r(W * 0.54), r(pad), r(W * 0.42), r(H * 0.45), { src: photo(c, 1, 900, 900),  slot: c.x.photo, radius: r(2 * s), phBg: '#CBD5E1', phBg2: '#94A3B8' }));
        els.push(...infoRows(c, t, W * 0.54, H * 0.45 + pad + 3 * s, W * 0.42, s * 0.85, p.ink, p.deep));
      } else {
        els.push(slotEl('photo', r(pad), r(head - 3 * s), r(W - 2 * pad), r(H * 0.3), { src: photo(c, 2, 900, 900),  slot: c.x.photo, radius: r(2.5 * s), stroke: '#FFFFFF', strokeW: r(0.8 * s), phBg: '#CBD5E1', phBg2: '#94A3B8', shadow: soft(s) }));
        els.push(...stack([{ kind: 'text', text: c.sub, size: 3.6 * s, font: F(t, 'Poppins', 'Hind'), color: '#334155', lh: 1.35 }], { x: pad, y: head + H * 0.3, w: W - 2 * pad, h: H * 0.1 }));
        els.push(...infoRows(c, t, pad, head + H * 0.41, W - 2 * pad, s, p.ink, p.deep));
      }
      return { bg: solid('#FFFFFF'), elements: els };
    },
  },
  {
    key: 'spotlight', name: 'Spotlight cut-out',
    build(c, W, H, p, t) {
      const s = unit(W, H);
      const pad = 6 * s;
      const land = W / H > 1.15;
      const dark = !isLight(p.bg);
      const ink = dark ? '#FFFFFF' : p.ink;
      const bh = 15 * s;
      const els = [
        graphicEl('sunburst', 0, 0, W, H, { colors: [dark ? '#FFFFFF' : p.deep, p.bg2], opacity: 0.55 }),
        graphicEl('sparkles', 0, 0, W, H, { colors: ['#FFFFFF', p.primary] }),
        graphicEl('glow', r(W * 0.15), r(H * 0.3), r(W * 0.7), r(H * 0.6), { colors: ['#FFFFFF'], opacity: 0.45 }),
      ];
      if (land) {
        els.push(person(c, W * 0.58, H * 0.08, W * 0.4, H * 0.92 - bh, s, p.bg2));
        els.push(...stack([...heads(c, t, s, { title: ink, kicker: dark ? p.primary : p.deep, text: ink, size: 10, outline: dark ? p.ink : '#FFFFFF', outlineW: 0.35 * s }), ...rest(c, t, s, { text: ink, pill: p.deep, pillText: '#FFFFFF' })], { x: pad, y: pad, w: W * 0.54, h: H - bh - 2 * pad }, { align: 'left' }));
      } else {
        els.push(...stack(heads(c, t, s, { title: ink, kicker: dark ? p.primary : p.deep, text: ink, size: 10, outline: dark ? p.ink : '#FFFFFF', outlineW: 0.35 * s }), { x: pad, y: pad, w: W - 2 * pad, h: H * 0.3 }));
        els.push(person(c, W * 0.15, H * 0.36, W * 0.7, H * 0.64 - bh, s, p.bg2));
      }
      els.push(shapeEl('rect', 0, r(H - bh), W, r(bh), { fill: p.deep, name: 'Name band' }));
      els.push(shapeEl('rect', 0, r(H - bh), W, r(0.8 * s), { fill: p.primary === '#FFFFFF' ? p.accent : p.primary }));
      els.push(textEl(c.x.name, r(pad), r(H - bh + 2.2 * s), r(W - 2 * pad), r(6.5 * s), { font: F(t, 'Montserrat', 'Baloo 2'), weight: '800', size: r(5.4 * s), color: '#FFFFFF', lh: 1.15 }));
      els.push(textEl(c.x.role, r(pad), r(H - bh + 8.8 * s), r(W - 2 * pad), r(4.5 * s), { font: F(t, 'Poppins', 'Hind'), weight: '500', size: r(3 * s), color: 'rgba(255,255,255,0.9)', lh: 1.25 }));
      return { bg: radial(p.bg2, p.bg), elements: els };
    },
  },
];
