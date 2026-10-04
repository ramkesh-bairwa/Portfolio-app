// Poster layouts. Each layout turns a category's text into positioned elements for any size (tall, square, wide or strip).
import { PALETTES, grad, isLight, items, photo, r, shapeEl, solid, stack, strip, textEl, imageEl } from './kit';
import { HI, extrasFor } from './hindi';
import { PRO_LAYOUTS } from './proLayouts';

export * from './kit';

export const LAYOUTS = [
  {
    key: 'bold', name: 'Bold',
    type: (p) => ({ titleFont: 'Bebas Neue', titleWide: 0.42, titleSize: 15, titleUpper: true, titleLh: 0.98, bodyFont: 'Poppins', title: p.text, kicker: p.primary, text: p.soft, pillFill: p.primary, pillText: p.ink }),
    build(c, W, H, p, t) {
      const s = Math.min(W, H) / 100;
      const D = Math.min(W, H);
      const pad = 7 * s;
      const els = [
        shapeEl('circle', r(W - D * 0.55), r(-D * 0.35), r(D * 0.9), r(D * 0.9), { fill: p.accent, opacity: 0.14 }),
        shapeEl('circle', r(-D * 0.2), r(H - D * 0.3), r(D * 0.5), r(D * 0.5), { fill: p.primary, opacity: 0.14 }),
        shapeEl('rect', 0, r(H - 1.6 * s), W, r(1.6 * s), { fill: p.primary }),
      ];
      if (W / H > 1.15) {
        els.push(textEl(c.emoji, r(pad), r(H * 0.25), r(W * 0.34), r(H * 0.5), { size: r(D * 0.34) }));
        els.push(...stack(items(c, t, s, { emoji: false }), { x: W * 0.4, y: pad, w: W * 0.6 - pad, h: H - 2 * pad }, { align: 'left' }));
      } else els.push(...stack(items(c, t, s), { x: pad, y: pad, w: W - 2 * pad, h: H - 2 * pad }));
      return { bg: solid(p.bg), elements: els };
    },
  },
  {
    key: 'split', name: 'Photo split',
    type: (p) => ({ titleFont: 'Montserrat', titleWeight: '800', titleWide: 0.66, titleSize: 9, bodyFont: 'Montserrat', title: p.text, kicker: p.primary, text: p.soft, pillFill: p.primary, pillText: p.ink }),
    build(c, W, H, p, t) {
      const s = Math.min(W, H) / 100;
      const pad = 7 * s;
      if (W / H > 1.15) {
        const iw = W * 0.46;
        return { bg: solid(p.bg), elements: [
          imageEl(photo(c, 1, iw, H), 0, 0, r(iw), H),
          shapeEl('rect', r(iw - 1.2 * s), 0, r(1.2 * s), H, { fill: p.primary }),
          ...stack(items(c, t, s, { emoji: false }), { x: iw + pad, y: pad, w: W - iw - 2 * pad, h: H - 2 * pad }, { align: 'left' }),
        ] };
      }
      const ih = H * 0.48;
      return { bg: solid(p.bg), elements: [
        imageEl(photo(c, 1, W, ih), 0, 0, W, r(ih)),
        shapeEl('rect', r(pad), r(ih - 1.2 * s), r(20 * s), r(2.4 * s), { fill: p.primary }),
        ...stack(items(c, t, s, { emoji: false }), { x: pad, y: ih + pad * 0.8, w: W - 2 * pad, h: H - ih - pad * 1.8 }, { align: 'left' }),
      ] };
    },
  },
  {
    key: 'frame', name: 'Elegant frame',
    type: (p) => ({ titleFont: 'Great Vibes', titleWeight: '400', titleWide: 0.5, titleSize: 14, titleLh: 1.25, kickerFont: 'Cormorant Garamond', bodyFont: 'Cormorant Garamond', subItalic: true, title: p.deep, kicker: p.ink, text: p.ink, pillFill: p.deep, pillText: '#FFFFFF', emojiSize: 11 }),
    build(c, W, H, p, t) {
      const s = Math.min(W, H) / 100;
      const pad = 12 * s;
      return { bg: solid(p.card), elements: [
        shapeEl('rect', r(3 * s), r(3 * s), r(W - 6 * s), r(H - 6 * s), { fill: 'transparent', stroke: p.deep, strokeW: r(0.7 * s) }),
        shapeEl('rect', r(4.8 * s), r(4.8 * s), r(W - 9.6 * s), r(H - 9.6 * s), { fill: 'transparent', stroke: p.deep, strokeW: Math.max(1, r(0.25 * s)), opacity: 0.6 }),
        shapeEl('diamond', r(W / 2 - 2 * s), r(1.6 * s), r(4 * s), r(4 * s), { fill: p.deep }),
        shapeEl('diamond', r(W / 2 - 2 * s), r(H - 5.6 * s), r(4 * s), r(4 * s), { fill: p.deep }),
        ...stack(items(c, t, s, { scale: W / H > 1.15 ? 0.9 : 1 }), { x: pad, y: pad, w: W - 2 * pad, h: H - 2 * pad }),
      ] };
    },
  },
  {
    key: 'gradient', name: 'Gradient glow',
    type: (p) => ({ titleFont: 'Poppins', titleWeight: '800', titleWide: 0.62, titleSize: 10, bodyFont: 'Poppins', title: '#FFFFFF', kicker: '#FFFFFF', text: 'rgba(255,255,255,0.88)', pillFill: '#FFFFFF', pillText: p.deep, titleShadow: { x: 0, y: 4, blur: 18, color: 'rgba(0,0,0,0.25)' } }),
    build(c, W, H, p, t) {
      const s = Math.min(W, H) / 100;
      const D = Math.min(W, H);
      const pad = 8 * s;
      const els = [
        shapeEl('blob', r(W - D * 0.5), r(-D * 0.15), r(D * 0.65), r(D * 0.6), { fill: '#FFFFFF', opacity: 0.12 }),
        shapeEl('ring', r(-D * 0.15), r(H - D * 0.4), r(D * 0.55), r(D * 0.55), { fill: 'transparent', stroke: '#FFFFFF', strokeW: r(1.2 * s), opacity: 0.35 }),
        shapeEl('circle', r(W * 0.08), r(H * 0.1), r(5 * s), r(5 * s), { fill: '#FFFFFF', opacity: 0.4 }),
      ];
      const land = W / H > 1.15;
      const cs = land ? D * 0.5 : D * 0.3;
      const cx = land ? pad : (W - cs) / 2;
      const cy = land ? (H - cs) / 2 : pad;
      els.push(shapeEl('circle', r(cx), r(cy), r(cs), r(cs), { fill: '#FFFFFF', opacity: 0.18 }));
      els.push(textEl(c.emoji, r(cx), r(cy + cs * 0.2), r(cs), r(cs * 0.6), { size: r(cs * 0.48) }));
      const box = land ? { x: cx + cs + pad, y: pad, w: W - cs - 3 * pad, h: H - 2 * pad } : { x: pad, y: cy + cs + 3 * s, w: W - 2 * pad, h: H - cy - cs - pad - 3 * s };
      els.push(...stack(items(c, t, s, { emoji: false }), box, { align: land ? 'left' : 'center' }));
      return { bg: grad(p.deep, isLight(p.bg) ? p.accent : p.bg2, 145), elements: els };
    },
  },
  {
    key: 'wave', name: 'Wave band',
    type: (p) => ({ titleFont: 'Archivo Black', titleWeight: '400', titleWide: 0.76, titleSize: 9, bodyFont: 'DM Sans', title: '#FFFFFF', kicker: 'rgba(255,255,255,0.85)', text: p.ink, pillFill: p.deep, pillText: '#FFFFFF' }),
    build(c, W, H, p, t) {
      const s = Math.min(W, H) / 100;
      const pad = 7 * s;
      const band = isLight(p.bg) ? p.deep : p.bg;
      const [kick, title, ...rest] = items(c, t, s, { emoji: false }).filter(Boolean);
      if (W / H > 1.15) {
        return { bg: solid(p.card), elements: [
          shapeEl('parallelogram', r(-W * 0.06), 0, r(W * 0.6), H, { fill: band }),
          ...stack([kick, title], { x: pad, y: pad, w: W * 0.44 - pad, h: H - 2 * pad }, { align: 'left' }),
          textEl(c.emoji, r(W * 0.58), r(pad), r(W * 0.42 - pad), r(H * 0.3), { size: r(H * 0.2) }),
          ...stack(rest, { x: W * 0.58, y: H * 0.36, w: W * 0.42 - pad, h: H * 0.64 - pad }),
        ] };
      }
      const bh = H * 0.56;
      return { bg: solid(p.card), elements: [
        shapeEl('wave', 0, 0, W, r(bh), { fill: band, rot: 180 }),
        ...stack([kick, title], { x: pad, y: pad, w: W - 2 * pad, h: bh * 0.6 - pad }),
        textEl(c.emoji, r(W - 26 * s), r(bh * 0.62), r(20 * s), r(20 * s), { size: r(14 * s) }),
        ...stack(rest, { x: pad, y: bh + 2 * s, w: W - 2 * pad, h: H - bh - pad - 2 * s }),
      ] };
    },
  },
  {
    key: 'photo', name: 'Photo poster',
    type: (p) => ({ titleFont: 'Montserrat', titleWeight: '800', titleWide: 0.66, titleSize: 10, bodyFont: 'Montserrat', title: '#FFFFFF', kicker: '#FFFFFF', text: 'rgba(255,255,255,0.9)', pillFill: p.deep, pillText: '#FFFFFF' }),
    build(c, W, H, p, t) {
      const s = Math.min(W, H) / 100;
      const pad = 7 * s;
      const land = W / H > 1.15;
      const [kick, ...rest] = items(c, t, s, { emoji: false }).filter(Boolean);
      const kp = { ...kick, kind: 'pill', fill: p.deep, color: '#FFFFFF', size: kick.size * 0.9 };
      return { bg: solid('#111111'), elements: [
        imageEl(photo(c, 2, W, H), 0, 0, W, H),
        shapeEl('rect', 0, 0, W, H, { fill: 'rgba(0,0,0,0.05)', fill2: 'rgba(0,0,0,0.85)', gradAngle: land ? 270 : 180, name: 'Shade' }),
        ...stack([kp, ...rest], land ? { x: pad, y: pad, w: W * 0.55, h: H - 2 * pad } : { x: pad, y: H * 0.42, w: W - 2 * pad, h: H * 0.58 - pad }, { align: 'left', valign: land ? 'center' : 'center' }),
      ] };
    },
  },
  {
    key: 'burst', name: 'Burst badge',
    type: (p) => ({ titleFont: 'Bungee', titleWeight: '400', titleWide: 0.74, titleSize: 9, bodyFont: 'Poppins', title: p.text, kicker: p.text, text: p.text, pillFill: p.deep === p.bg ? p.ink : p.deep, pillText: '#FFFFFF' }),
    build(c, W, H, p, t) {
      const s = Math.min(W, H) / 100;
      const D = Math.min(W, H);
      const pad = 7 * s;
      const land = W / H > 1.15;
      const bs = land ? D * 0.62 : D * 0.42;
      const bx = land ? pad : (W - bs) / 2;
      const by = land ? (H - bs) / 2 : pad;
      const els = [
        shapeEl('burst', r(bx), r(by), r(bs), r(bs), { fill: p.primary, rot: 8 }),
        shapeEl('circle', r(bx + bs * 0.18), r(by + bs * 0.18), r(bs * 0.64), r(bs * 0.64), { fill: p.card, opacity: 0.95 }),
        textEl(c.emoji, r(bx), r(by + bs * 0.27), r(bs), r(bs * 0.46), { size: r(bs * 0.34) }),
        shapeEl('right-triangle', 0, 0, r(D * 0.25), r(D * 0.25), { fill: p.primary, opacity: 0.25 }),
        shapeEl('right-triangle', r(W - D * 0.25), r(H - D * 0.25), r(D * 0.25), r(D * 0.25), { fill: p.primary, opacity: 0.25, rot: 180 }),
      ];
      const box = land ? { x: bx + bs + pad, y: pad, w: W - bs - 3 * pad, h: H - 2 * pad } : { x: pad, y: by + bs + 2 * s, w: W - 2 * pad, h: H - by - bs - pad - 2 * s };
      els.push(...stack(items(c, t, s, { emoji: false }), box, { align: land ? 'left' : 'center' }));
      return { bg: grad(p.bg, p.bg2, 160), elements: els };
    },
  },
  {
    key: 'minimal', name: 'Clean minimal',
    type: (p) => ({ titleFont: 'Playfair Display', titleWeight: '700', titleWide: 0.54, titleSize: 10, bodyFont: 'Inter', title: p.ink, kicker: p.deep, text: '#475569', pillFill: p.deep, pillText: '#FFFFFF' }),
    build(c, W, H, p, t) {
      const s = Math.min(W, H) / 100;
      const pad = 8 * s;
      return { bg: solid('#FFFFFF'), elements: [
        shapeEl('rect', r(pad), r(pad), r(1.2 * s), r(H - 2 * pad), { fill: p.deep }),
        shapeEl('circle', r(W - 24 * s), r(pad - 2 * s), r(18 * s), r(18 * s), { fill: p.deep, opacity: 0.08 }),
        textEl(c.emoji, r(W - 24 * s), r(pad + 2 * s), r(18 * s), r(12 * s), { size: r(9 * s) }),
        ...stack(items(c, t, s, { emoji: false }), { x: pad + 6 * s, y: pad + 10 * s, w: W - 2 * pad - 8 * s, h: H - 2 * pad - 12 * s }, { align: 'left' }),
        shapeEl('rect', r(pad + 6 * s), r(H - pad - 0.5 * s), r(30 * s), r(0.5 * s), { fill: p.deep, opacity: 0.4 }),
      ] };
    },
  },
  {
    key: 'festive', name: 'Festive gold',
    type: (p) => ({ titleFont: 'Abril Fatface', titleWeight: '400', titleWide: 0.66, titleSize: 10.5, titleLh: 1.12, bodyFont: 'Lora', kickerFont: 'Lora', subItalic: true, title: p.primary, kicker: p.soft, text: p.text, pillFill: p.primary, pillText: p.ink, emojiSize: 13 }),
    build(c, W, H, p, t) {
      const s = Math.min(W, H) / 100;
      const pad = 11 * s;
      const st = 7 * s;
      const corner = (x, y) => shapeEl('star-6', r(x), r(y), r(st), r(st), { fill: p.primary, opacity: 0.9 });
      const items_ = items(c, t, s, { emoji: false, scale: W / H > 1.15 ? 0.92 : 1 });
      items_[0] = { kind: 'emoji', text: `${c.emoji}  ${c.emoji}  ${c.emoji}`, size: 9 * s, gap: 3 * s };
      return { bg: grad(p.bg, p.bg2, 180), elements: [
        shapeEl('rect', r(4 * s), r(4 * s), r(W - 8 * s), r(H - 8 * s), { fill: 'transparent', stroke: p.primary, strokeW: r(0.5 * s), radius: r(2 * s) }),
        shapeEl('rect', r(5.6 * s), r(5.6 * s), r(W - 11.2 * s), r(H - 11.2 * s), { fill: 'transparent', stroke: p.primary, strokeW: Math.max(1, r(0.2 * s)), radius: r(1.5 * s), opacity: 0.6 }),
        corner(1.5 * s, 1.5 * s), corner(W - st - 1.5 * s, 1.5 * s), corner(1.5 * s, H - st - 1.5 * s), corner(W - st - 1.5 * s, H - st - 1.5 * s),
        ...stack(items_, { x: pad, y: pad, w: W - 2 * pad, h: H - 2 * pad }),
      ] };
    },
  },
  {
    key: 'card', name: 'Floating card',
    type: (p) => ({ titleFont: 'Fraunces', titleWeight: '700', titleWide: 0.56, titleSize: 9.5, bodyFont: 'DM Sans', title: p.ink, kicker: p.deep, text: '#475569', pillFill: p.deep, pillText: '#FFFFFF' }),
    build(c, W, H, p, t) {
      const s = Math.min(W, H) / 100;
      const pad = 6 * s;
      const land = W / H > 1.15;
      const cs = 20 * s;
      const card = { x: pad, y: land ? pad : pad + cs / 2, w: W - 2 * pad, h: H - 2 * pad - (land ? 0 : cs / 2) };
      const els = [
        shapeEl('rounded', r(card.x), r(card.y), r(card.w), r(card.h), { fill: '#FFFFFF', radius: r(3 * s), shadow: { x: 0, y: r(2 * s), blur: r(6 * s), color: 'rgba(0,0,0,0.25)' } }),
      ];
      const cx = land ? card.x + 5 * s : W / 2 - cs / 2;
      const cy = land ? H / 2 - cs / 2 : pad;
      els.push(shapeEl('circle', r(cx), r(cy), r(cs), r(cs), { fill: p.card === '#FFFFFF' ? '#FFFFFF' : p.card, stroke: p.deep, strokeW: r(0.8 * s) }));
      els.push(textEl(c.emoji, r(cx), r(cy + cs * 0.2), r(cs), r(cs * 0.6), { size: r(cs * 0.46) }));
      const box = land ? { x: cx + cs + 5 * s, y: card.y + 5 * s, w: card.w - cs - 15 * s, h: card.h - 10 * s } : { x: card.x + 6 * s, y: card.y + cs / 2 + 4 * s, w: card.w - 12 * s, h: card.h - cs / 2 - 10 * s };
      els.push(...stack(items(c, t, s, { emoji: false }), box, { align: land ? 'left' : 'center' }));
      return { bg: grad(isLight(p.bg) ? p.deep : p.bg, isLight(p.bg2) ? p.accent : p.bg2, 135), elements: els };
    },
  },
];

const CLASSIC = LAYOUTS;
export const ALL_LAYOUTS = [...CLASSIC, ...PRO_LAYOUTS];
export const getLayout = (key) => ALL_LAYOUTS.find((l) => l.key === key) || ALL_LAYOUTS[0];

// Second colour scheme for every palette (design variant 2)
export const ALT_PALETTE = {
  royal: 'festive', festive: 'royal', saffron: 'green', ocean: 'sunset', sky: 'coral', rose: 'purple', night: 'peacock', mono: 'royal',
  green: 'saffron', tricolour: 'saffron', purple: 'rose', pink: 'holi', neon: 'night', mint: 'ocean', earth: 'festive', red: 'night',
  sunset: 'ocean', sale: 'red', holi: 'neon', coral: 'sky', xmas: 'festive', peacock: 'night', certificate: 'royal',
};

// Swap Latin fonts for Devanagari ones of a similar feel
const HI_TITLE = { 'Bebas Neue': 'Khand', 'Great Vibes': 'Amita', Montserrat: 'Baloo 2', Poppins: 'Baloo 2', 'Archivo Black': 'Baloo 2', Bungee: 'Yatra One', 'Playfair Display': 'Rozha One', 'Abril Fatface': 'Rozha One', Fraunces: 'Eczar' };
const HI_WEIGHT = { Khand: '700', Amita: '700', 'Baloo 2': '800', 'Yatra One': '400', 'Rozha One': '400', Eczar: '700' };
const HI_BODY = { 'Cormorant Garamond': 'Martel', Lora: 'Martel', Inter: 'Mukta', 'DM Sans': 'Mukta', Montserrat: 'Mukta', Poppins: 'Hind' };
function hindiType(t) {
  const title = HI_TITLE[t.titleFont] || 'Baloo 2';
  return { ...t, hi: true, titleFont: title, titleWeight: HI_WEIGHT[title], titleWide: 0.68, titleUpper: false, titleLh: 1.25, bodyFont: HI_BODY[t.bodyFont] || 'Hind', kickerFont: HI_BODY[t.kickerFont] || HI_BODY[t.bodyFont] || 'Hind' };
}

export function localise(category, lang) {
  const c = { ...category };
  if (lang === 'hi' && HI[category.key]) {
    const [kicker, title, sub, details, cta] = HI[category.key];
    Object.assign(c, { kicker, title, sub, details: details ? details.split('|') : [], cta });
  }
  c.x = extrasFor(category.group, lang);
  return c;
}

const PERSONAL_GROUPS = new Set(['Politics & social', 'Wishes & greetings', 'Festivals', 'National days']);

export function buildPoster(category, layoutKey, format, { variant = 0, lang = 'en' } = {}) {
  const L = getLayout(layoutKey);
  const p = PALETTES[variant ? ALT_PALETTE[category.palette] || category.palette : category.palette] || PALETTES.royal;
  const c = localise(category, lang);
  const baseType = (L.type || CLASSIC[0].type)(p);
  // Tall sizes (stories, standees) have room for bigger text; stack() still shrinks it if it doesn't fit
  const t = { ...(lang === 'hi' ? hindiType(baseType) : baseType), boost: format.h / format.w > 1.5 ? 1.3 : 1 };
  const { w: W, h: H } = format;
  let made;
  if (W / H >= 2.6) {
    // Wide strips put all text straight on the background, so pick text colours from it
    const bg = L.build(c, 400, 300, p, t).bg;
    const light = isLight(bg.type === 'gradient' || bg.type === 'radial' ? bg.from : bg.color);
    const st = light
      ? { ...t, title: p.ink, kicker: p.deep, text: '#334155', pillFill: p.deep, pillText: '#FFFFFF' }
      : { ...t, title: '#FFFFFF', kicker: isLight(p.primary) ? p.primary : '#FFFFFF', text: 'rgba(255,255,255,0.88)', pillFill: isLight(p.primary) ? p.primary : '#FFFFFF', pillText: p.ink };
    made = strip(c, W, H, st, bg, [], { person: !L.type });
  } else made = L.build(c, W, H, p, t);
  let elements = made.elements;
  // Posters about people (candidates, birthdays, greetings) get person frames, not random sample photos
  if (PERSONAL_GROUPS.has(category.group))
    elements = elements.map((e) => (e.type === 'image' && e.placeholder === 'photo' ? { ...e, placeholder: 'person', src: '', phColor: e.phColor || '#94A3B8' } : e));
  return { format: format.key, w: W, h: H, bg: made.bg, elements };
}
