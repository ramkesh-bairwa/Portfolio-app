// Design library, drawn as SVG on demand.
// 1–2000 "mockups": 20 industries × 10 formats × 10 variants; within every block of 200 the formats are staggered so neighbours never look alike.
// 2001–3000 "artwork": 10 standalone categories × 100 (no device frames), interleaved one category at a time.
// 3001–3500 "handmade": 10 categories × 50 that look drawn by hand (pencil, paper, tape), interleaved the same way.
import { artColors } from './art';
import { canvas, lum, mix, rng } from './core';
import { FORMATS, H, W } from './formats';
import { coined, GRAPHICS } from './graphics';
import { HANDMADE } from './handmade';
import { brandName, INDUSTRIES, TYPE } from './industries';
import { SCENES } from './scenes';

const MOCKUPS = INDUSTRIES.length * FORMATS.length * 10;
const ARTWORK = [
  { slug: 'logos', name: 'Logos', format: 'logo', formatName: 'Logo design', draw: GRAPHICS.logos },
  { slug: 'machinery', name: 'Machinery', format: 'render', formatName: '3D render', draw: SCENES.machinery },
  { slug: 'property', name: 'Property & Architecture', format: 'render', formatName: '3D render', draw: SCENES.realestate },
  { slug: 'posters', name: 'Posters', format: 'print', formatName: 'Print poster', draw: GRAPHICS.posters, w: 1200, h: 1600 },
  { slug: 'products', name: 'Product shots', format: 'studio', formatName: 'Studio shot', draw: SCENES.products },
  { slug: 'apparel', name: 'Fashion & Clothes', format: 'lookbook', formatName: 'Lookbook', draw: SCENES.fashion },
  { slug: 'shoes', name: 'Shoes & Footwear', format: 'studio', formatName: 'Studio shot', draw: SCENES.shoes },
  { slug: 'rangoli', name: 'Rangoli', format: 'pattern', formatName: 'Pattern art', draw: GRAPHICS.rangoli, w: 1400, h: 1400 },
  { slug: 'homes', name: 'Home Interiors', format: 'scene', formatName: 'Interior scene', draw: SCENES.interiors },
  { slug: 'festive', name: 'Festive Greetings', format: 'greeting', formatName: 'Greeting card', draw: GRAPHICS.festive, w: 1400, h: 1400 },
];
const PER_ART = 100;
const HAND = [
  { slug: 'sketchbook', name: 'Sketchbook', format: 'sketch', formatName: 'Pencil sketch', draw: HANDMADE.sketchbook },
  { slug: 'wireframes', name: 'Wireframes', format: 'wireframe', formatName: 'Wireframe', draw: HANDMADE.wireframes },
  { slug: 'moodboards', name: 'Moodboards', format: 'board', formatName: 'Board', draw: HANDMADE.moodboards },
  { slug: 'lettering', name: 'Hand lettering', format: 'lettering', formatName: 'Lettering', draw: HANDMADE.lettering },
  { slug: 'process', name: 'Process boards', format: 'board', formatName: 'Board', draw: HANDMADE.process },
  { slug: 'doodles', name: 'Doodles', format: 'sketch', formatName: 'Pencil sketch', draw: HANDMADE.doodles },
  { slug: 'collage', name: 'Paper collage', format: 'collage', formatName: 'Collage', draw: HANDMADE.collage },
  { slug: 'typestudy', name: 'Type studies', format: 'study', formatName: 'Study sheet', draw: HANDMADE.typestudy },
  { slug: 'colorstudy', name: 'Colour studies', format: 'study', formatName: 'Study sheet', draw: HANDMADE.colorstudy },
  { slug: 'iconsets', name: 'Icon sets', format: 'icons', formatName: 'Icon set', draw: HANDMADE.icons },
];
const PER_HAND = 50;
const ART_END = MOCKUPS + ARTWORK.length * PER_ART;

export const DESIGN_COUNT = ART_END + HAND.length * PER_HAND;
export const DESIGN_COLLECTIONS = [
  { slug: 'handmade', name: 'Hand-made', count: HAND.length * PER_HAND },
  { slug: 'artwork', name: 'Artwork & renders', count: ARTWORK.length * PER_ART },
  { slug: 'mockup', name: 'Website & app mockups', count: MOCKUPS },
];
const uniqFormats = (list, collection) => list.filter((a, i) => list.findIndex((b) => b.format === a.format) === i).map((a) => ({ slug: a.format, name: a.formatName, collection }));
export const DESIGN_INDUSTRIES = [...INDUSTRIES.map(({ slug, name }) => ({ slug, name, collection: 'mockup' })), ...ARTWORK.map(({ slug, name }) => ({ slug, name, collection: 'artwork' })),
  ...HAND.map(({ slug, name }) => ({ slug, name, collection: 'handmade' }))];
export const DESIGN_FORMATS = [...FORMATS.map(({ slug, name }) => ({ slug, name, collection: 'mockup' })), ...uniqFormats(ARTWORK, 'artwork'), ...uniqFormats(HAND, 'handmade')];
const RADIUS = { luxe: 2, bold: 6, clean: 12, warm: 14, soft: 22, playful: 22 };

const rotate = (arr, n) => arr.map((_, i) => arr[(i + n) % arr.length]);

export function designMeta(id) {
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1 || n > DESIGN_COUNT) return null;
  if (n > ART_END) {
    const k = n - ART_END - 1, ci = k % HAND.length, a = HAND[ci], idx = Math.floor(k / HAND.length);
    const brand = coined(idx * 5 + ci * 23 + 7);
    return { id: n, v: idx, collection: 'handmade', industry: a.slug, industryName: a.name, format: a.format, formatName: a.formatName, brand, title: `${a.name} #${idx + 1}`, url: designUrl(n), w: W, h: H };
  }
  if (n > MOCKUPS) {
    const k = n - MOCKUPS - 1, ci = k % ARTWORK.length, a = ARTWORK[ci], idx = Math.floor(k / ARTWORK.length);
    const brand = coined(idx * 3 + ci * 17);
    return { id: n, v: idx, collection: 'artwork', industry: a.slug, industryName: a.name, format: a.format, formatName: a.formatName, brand, title: `${brand} — ${a.name}`, url: designUrl(n), w: a.w || W, h: a.h || H };
  }
  const k = n - 1;
  const v = Math.floor(k / 200), r = k % 200;
  const i = r % INDUSTRIES.length, f = (i + Math.floor(r / INDUSTRIES.length)) % FORMATS.length;
  const ind = INDUSTRIES[i], fmt = FORMATS[f];
  const brand = brandName(k * 7 + i, ind);
  return { id: n, v, collection: 'mockup', industry: ind.slug, industryName: ind.name, format: fmt.slug, formatName: fmt.name, brand: brand.full, title: `${brand.full} — ${fmt.name}`, url: designUrl(n), w: W, h: H };
}

export const designUrl = (id) => `/api/designs/${id}`;

let cache;
export function allDesigns() {
  if (!cache) cache = Array.from({ length: DESIGN_COUNT }, (_, i) => designMeta(i + 1));
  return cache;
}

function renderArtwork(m) {
  const a = (m.collection === 'handmade' ? HAND : ARTWORK).find((x) => x.slug === m.industry);
  const c = canvas('s', m.w, m.h);
  return c.done(a.draw(c, rng(m.id * 7919), m.v, m.w, m.h), m.title);
}

export function renderDesign(id) {
  const m = designMeta(id);
  if (!m) return null;
  if (m.collection !== 'mockup') return renderArtwork(m);
  const ind = INDUSTRIES.find((x) => x.slug === m.industry);
  const fmt = FORMATS.find((x) => x.slug === m.format);
  const v = m.v;
  const [bg, ink, accent, accent2, soft] = ind.pals[v % ind.pals.length];
  const dark = lum(bg) < 0.4;
  const pal = {
    bg, ink, accent, accent2, soft,
    surface: dark ? mix(bg, '#FFFFFF', 0.07) : '#FFFFFF',
    muted: mix(ink, bg, 0.42),
    line: mix(ink, bg, dark ? 0.8 : 0.87),
  };
  const types = TYPE[ind.mood];
  const t = {
    c: canvas('d', W, H), R: rng(m.id * 9973), pal, dark, ind, v, mood: ind.mood,
    ty: types[(v + Math.floor(v / ind.pals.length)) % types.length],
    r: RADIUS[ind.mood],
    flip: Math.floor(v / ind.pals.length) % 2 === 1,
    markKind: (m.id * 7) % 6,
    brand: brandName((m.id - 1) * 7 + INDUSTRIES.indexOf(ind), ind),
    head: ind.headlines[v % ind.headlines.length],
    items: rotate(ind.items, v),
    arts: rotate(ind.art, v),
    k: artColors(pal, ind.metal),
  };
  return t.c.done(fmt.draw(t), m.title);
}
