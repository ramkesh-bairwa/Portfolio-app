// Ready-made designs for each block, shown as live previews in the builder's design picker.
// A preset only sets design keys (props and style); content like titles, text and images is never touched.
import { BLOCKS, TILE_PATTERNS } from './blocks';

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const opts = (type, key) => BLOCKS[type]?.fields.find((f) => f.k === key)?.options || [];
const P = (label, props = {}, style = {}) => ({ id: slug(label), label, props, style });

const BG = {
  plain: ['', {}],
  dark: ['Dark', { tone: 'dark' }],
  brand: ['Brand colour', { tone: 'brand' }],
  soft: ['Soft tint', { tone: 'soft' }],
  card: ['In a card', { box: 'card' }],
  dots: ['Dotted', { pattern: 'dots' }],
  mesh: ['Soft glow', { bgGradient: 'mesh' }],
  glass: ['Glass on gradient', { bgGradient: 'aurora', box: 'glass' }],
};
const bgs = (...keys) => keys.map((k) => BG[k]);

// Every option of a design field, combined with background treatments
function combos(type, key, backgrounds, extra = {}) {
  return opts(type, key).flatMap(([v, l]) => backgrounds.map(([bl, st]) => P(bl ? `${l} · ${bl}` : l, { [key]: v, ...(extra[v] || {}) }, st)));
}

const GENERIC = [P('Theme'), P('Dark', {}, { tone: 'dark' }), P('Brand colour', {}, { tone: 'brand' }), P('Soft tint', {}, { tone: 'soft' }), P('In a card', {}, { box: 'card' }), P('Dotted', {}, { pattern: 'dots' }), P('Soft glow', {}, { bgGradient: 'mesh' }), P('Glass on gradient', {}, { bgGradient: 'aurora', box: 'glass', color: '#ffffff' }), P('Raised box', {}, { box: 'raised' }), P('Grid lines', {}, { pattern: 'grid' })];

const galleryCols = { grid: 3, masonry: 3, wide: 2, mosaic: 4, carousel: 3, filmstrip: 3, polaroid: 3, justified: 3, circles: 4 };

export const PRESETS = {
  gallery: [
    ...opts('gallery', 'layout').map(([v, l]) => P(l, { layout: v, columns: galleryCols[v] || 3, rowH: TILE_PATTERNS[v] ? (v === 'stack' ? 320 : 190) : undefined, captionStyle: v === 'polaroid' ? 'overlay' : undefined })),
    P('Black & white grid', { layout: 'grid', columns: 3, filter: 'grayscale', hover: 'color' }),
    P('Vintage masonry', { layout: 'masonry', columns: 3, filter: 'vintage' }),
    P('Moody 1 big + 2 small', { layout: 'big2', filter: 'moody', hover: 'darken' }, { tone: 'dark' }),
  ],

  projects: [
    ...opts('projects', 'layout').map(([v, l]) => P(l, { layout: v, columns: ['list', 'zigzag', 'numbered'].includes(v) ? 1 : v === 'carousel' ? 2 : 3 })),
    P('Cards on dark', { layout: 'cards', columns: 3 }, { tone: 'dark' }),
    P('Minimal black & white', { layout: 'minimal', columns: 3, hover: 'color' }),
    P('Numbered on soft tint', { layout: 'numbered', columns: 1 }, { tone: 'soft' }),
  ],

  hero: [
    P('Text + photo', { layout: 'split', imageShape: 'rounded' }),
    P('Text + round photo', { layout: 'split', imageShape: 'circle' }),
    P('Text + blob photo', { layout: 'split', imageShape: 'blob' }),
    P('Text + arch photo', { layout: 'split', imageShape: 'arch' }),
    P('Text + tilted photo', { layout: 'split', imageShape: 'tilted' }),
    P('Text + framed photo', { layout: 'split', imageShape: 'frame' }),
    P('Photo + text', { layout: 'image-left', imageShape: 'rounded' }),
    P('Round photo + text', { layout: 'image-left', imageShape: 'circle' }),
    P('Arch photo + text', { layout: 'image-left', imageShape: 'arch' }),
    P('Centred with wide photo', { layout: 'center', imageShape: 'rounded' }),
    P('Big type only', { layout: 'minimal' }),
    P('Big type on soft glow', { layout: 'minimal' }, { bgGradient: 'mesh' }),
    P('Big gradient headline', { layout: 'minimal' }, { tGradient: 'brand' }),
    P('Photo background · dark', { layout: 'cover', overlay: 60 }),
    P('Photo background · light', { layout: 'cover', overlay: 25 }),
    P('Full-screen photo', { layout: 'cover', overlay: 45, height: 'screen' }),
    P('Card on photo', { layout: 'card', overlay: 20 }),
    P('Brand gradient', { layout: 'gradient', gradient: 'brand' }),
    P('Sunset gradient', { layout: 'gradient', gradient: 'sunset' }),
    P('Aurora gradient', { layout: 'gradient', gradient: 'aurora' }),
    P('Midnight gradient', { layout: 'gradient', gradient: 'midnight' }),
    P('Video background', { layout: 'video', overlay: 50 }),
    P('Photo collage', { layout: 'collage', imageShape: 'rounded' }),
    P('Blob collage', { layout: 'collage', imageShape: 'blob' }),
    P('Arch collage', { layout: 'collage', imageShape: 'arch' }),
    P('Text + photo · dark', { layout: 'split', imageShape: 'rounded' }, { tone: 'dark' }),
    P('Text + photo · dotted', { layout: 'split', imageShape: 'rounded' }, { pattern: 'dots' }),
    P('Neon headline · dark', { layout: 'center', imageShape: 'rounded' }, { tone: 'dark', tShadow: 'neon' }),
    P('Full-screen split', { layout: 'split', imageShape: 'rounded', height: 'screen' }),
  ],

  navbar: [
    ...opts('navbar', 'navStyle').map(([v, l]) => P(l, { navStyle: v })),
    P('Classic · dark', { navStyle: 'classic' }, { tone: 'dark' }),
    P('Centred · dark', { navStyle: 'centered' }, { tone: 'dark' }),
    P('Underline · sticky', { navStyle: 'underline', sticky: true }),
    P('Glass · sticky', { navStyle: 'glass', sticky: true }),
    P('Floating pill · sticky', { navStyle: 'pill', sticky: true }),
    P('Logo in the middle · dark', { navStyle: 'split' }, { tone: 'dark' }),
    P('Tab links · soft tint', { navStyle: 'tabs' }, { tone: 'soft' }),
    P('Menu button · brand', { navStyle: 'minimal' }, { tone: 'brand' }),
    P('Classic · brand', { navStyle: 'classic' }, { tone: 'brand' }),
    P('Outlined · dark', { navStyle: 'outlined' }, { tone: 'dark' }),
  ],

  image: [
    P('Rounded'), P('Curved', { shape: 'curved' }), P('Shaded', { shape: 'curved', frame: 'shadow' }), P('Dark shade', { shape: 'curved', frame: 'shade', captionStyle: 'overlay' }),
    P('Square', { shape: 'square' }), P('Circle', { shape: 'circle', ratio: '1/1', width: 45 }), P('Capsule', { shape: 'pill', ratio: '3/4', width: 45 }), P('Blob', { shape: 'blob', ratio: '1/1', width: 45 }),
    P('Arch', { shape: 'arch', ratio: '3/4', width: 45 }), P('Leaf', { shape: 'leaf', ratio: '1/1', width: 45 }), P('Hexagon', { shape: 'hexagon', ratio: '1/1', width: 45 }), P('Diamond', { shape: 'diamond', ratio: '1/1', width: 45 }),
    P('Tilted', { shape: 'tilted' }), P('Fade edges', { frame: 'fade' }), P('Glow', { shape: 'curved', frame: 'glow' }), P('Sticker', { shape: 'square', frame: 'sticker' }),
    P('Polaroid', { frame: 'polaroid' }), P('Vintage polaroid', { frame: 'polaroid', filter: 'vintage' }), P('Floating', { frame: 'float' }), P('Offset outline', { frame: 'offset' }),
    P('Border frame', { frame: 'border' }), P('Browser window', { frame: 'browser' }), P('Phone mockup', { frame: 'phone' }),
    P('Black & white', { filter: 'grayscale', hover: 'color' }), P('Vintage', { filter: 'vintage' }), P('Warm', { filter: 'warm' }), P('Moody', { filter: 'moody' }),
    P('Cinematic wide', { ratio: '21/9', shape: 'curved' }), P('Caption on image', { captionStyle: 'overlay', ratio: '16/9' }), P('Zoom on hover', { hover: 'zoom', ratio: '4/3' }),
  ],

  video: [
    ...opts('video', 'frame').flatMap(([v, l]) => [P(l, { frame: v, side: '' }), P(`${l} · text beside`, { frame: v, side: 'right' })]),
    P('Vertical phone video', { frame: 'phone', ratio: '9/16' }), P('Ultra-wide cinema', { frame: 'cinema', ratio: '21/9' }), P('Square card', { frame: 'card', ratio: '1/1', side: 'left' }),
    P('Glow · dark', { frame: 'glow' }, { tone: 'dark' }),
  ],

  skills: [
    ...combos('skills', 'display', bgs('plain', 'card'), { bars: { columns: 2 }, gradient: { columns: 2 }, segments: { columns: 2 }, dots: { columns: 2 }, stars: { columns: 2 }, levels: { columns: 2 } }),
    P('Bars in 3 columns', { display: 'bars', columns: 3 }), P('Rings · brand', { display: 'circles' }, { tone: 'brand' }), P('Word cloud · dark', { display: 'cloud' }, { tone: 'dark', align: 'center' }),
  ],

  testimonials: combos('testimonials', 'variant', bgs('plain', 'dark', 'soft', 'dots'), { cards: { stars: true }, single: { stars: true } }),
  services: combos('services', 'variant', bgs('plain', 'dark', 'soft', 'mesh')),
  about: combos('about', 'variant', bgs('plain', 'soft', 'dark')),
  stats: combos('stats', 'variant', bgs('plain', 'dark', 'brand', 'soft')),
  experience: combos('experience', 'variant', bgs('plain', 'soft', 'dark')),
  education: combos('education', 'variant', bgs('plain', 'soft', 'dark')),
  contact: combos('contact', 'variant', bgs('plain', 'soft', 'dark', 'mesh')),
  cta: combos('cta', 'variant', bgs('plain', 'soft', 'dark')),
  pricing: combos('pricing', 'variant', bgs('plain', 'soft', 'dark')),
  faq: combos('faq', 'variant', bgs('plain', 'soft', 'dark')),
  quote: combos('quote', 'variant', bgs('plain', 'soft', 'dark', 'brand')),
  links: combos('links', 'variant', bgs('plain', 'soft', 'dark')),
  social: combos('social', 'variant', bgs('plain', 'soft', 'dark')),
  logos: combos('logos', 'variant', bgs('plain', 'soft', 'dark')),
  footer: combos('footer', 'variant', bgs('plain', 'soft', 'dark')),
  process: combos('process', 'variant', bgs('plain', 'soft', 'dark')),
  beforeafter: opts('beforeafter', 'variant').flatMap(([v, l]) => [['16/9', '16:9'], ['4/3', '4:3'], ['1/1', 'Square']].map(([r, rl]) => P(`${l} · ${rl}`, { variant: v, ratio: r }))),
  tabs: combos('tabs', 'variant', bgs('plain', 'soft', 'dark')),
  marquee: combos('marquee', 'variant', bgs('plain', 'dark')),
  newsletter: combos('newsletter', 'variant', bgs('plain', 'soft', 'dark')),
  booking: combos('booking', 'variant', bgs('plain', 'soft')),
  embed: combos('embed', 'frame', bgs('plain', 'soft', 'dark')),
  mediatext: combos('mediatext', 'variant', bgs('plain', 'soft', 'dark')),
  team: combos('team', 'variant', bgs('plain', 'soft', 'dark')),
  statement: combos('statement', 'variant', bgs('plain', 'soft', 'dark')),
  techstack: combos('techstack', 'display', bgs('plain', 'dark', 'soft', 'card', 'mesh')),
  featured: combos('featured', 'layout', bgs('plain', 'dark', 'soft', 'mesh')),
};

export const hasPresets = (type) => !!PRESETS[type];

// 39 complete looks (background + typography + box + curved shapes), paired with each block's own layouts.
export const LOOKS = [
  ['Midnight', { tone: 'dark' }],
  ['Brand pop', { tone: 'brand' }],
  ['Paper soft', { tone: 'soft', tFont: 'Fraunces' }],
  ['Sunset glow', { tone: 'vivid', bgGradient: 'sunset' }],
  ['Ocean breeze', { tone: 'vivid', bgGradient: 'ocean' }],
  ['Aurora glass', { tone: 'vivid', bgGradient: 'aurora', box: 'glass' }],
  ['Mint fresh', { tone: 'vivid', bgGradient: 'mint' }],
  ['Berry night', { tone: 'vivid', bgGradient: 'berry', tShadow: 'soft' }],
  ['Peach blush', { tone: 'light', bgGradient: 'peach', tFont: 'DM Serif Display' }],
  ['Deep sea', { tone: 'dark', bgGradient: 'midnight', tGradient: 'ocean' }],
  ['Golden luxe', { tone: 'dark', tFont: 'Cormorant Garamond', tColor: '#D9B76E', tWeight: '600' }],
  ['Editorial serif', { tFont: 'Playfair Display', tWeight: '700', tDecor: 'overline' }],
  ['Bold caps', { tCase: 'uppercase', tWeight: '800', tSpacing: 0.02 }],
  ['Tech mono', { tone: 'dark', tFont: 'JetBrains Mono', pattern: 'grid' }],
  ['Neon nights', { tone: 'dark', tShadow: 'neon', btnLook: 'glow' }],
  ['Gradient headline', { tGradient: 'brand', btnLook: 'gradient' }],
  ['Fire headline', { tGradient: 'fire', tWeight: '800' }],
  ['Marker notes', { tDecor: 'marker', tFont: 'Caveat', tSize: 130 }],
  ['Underlined', { tDecor: 'underline', btnLook: 'outline' }],
  ['Wavy bottom', { tone: 'soft', shapeBottom: 'wave-1' }],
  ['Slanted brand', { tone: 'brand', shapeBottom: 'swoosh-up' }],
  ['Curved dark', { tone: 'dark', shapeBottom: 'curve-down-centre' }],
  ['Layered waves', { tone: 'brand', shapeTop: 'layer-wave-2', shapeBottom: 'layer-wave-3' }],
  ['Cloud soft', { tone: 'soft', shapeBottom: 'cloud-2', decor: 'blob-3', decorPos: 'tr' }],
  ['Blob corners', { tone: 'light', decor: 'blob-5', decorPos: 'both', decorSize: 380, decorOpacity: 18 }],
  ['Drip pop', { tone: 'vivid', bgGradient: 'sunset', shapeBottom: 'drip-1' }],
  ['Rolling hills', { tone: 'soft', shapeBottom: 'hills-layered', decor: 'sun', decorPos: 'tl', decorSize: 220, decorOpacity: 22 }],
  ['Arch stage', { tone: 'dark', shapeBottom: 'arch-wide', decor: 'rainbow', decorPos: 'tr' }],
  ['Ocean ripple', { tone: 'vivid', bgGradient: 'ocean', shapeTop: 'ripple-4', shapeBottom: 'layer-ripple' }],
  ['Organic flow', { tone: 'brand', shapeTop: 'organic-3', shapeBottom: 'organic-layered-1', decor: 'squiggle', decorPos: 'br', decorSize: 200, decorOpacity: 30 }],
  ['Bubble float', { tone: 'soft', decor: 'flower', decorPos: 'both', decorMotion: true, decorOpacity: 14 }],
  ['Neo brutal', { box: 'outline', btnLook: 'brutal', tFont: 'Archivo Black', tWeight: '400' }],
  ['Playful dots', { pattern: 'dots', tFont: 'Fredoka', btnShape: 'pill' }],
  ['Retro pop', { tone: 'light', bgGradient: 'peach', tFont: 'Righteous', tShadow: 'hard' }],
  ['Floating card', { box: 'float', radius: 28 }],
  ['Gradient frame', { box: 'gradient', radius: 24 }],
  ['Inset calm', { box: 'inset', tWeight: '500' }],
  ['Grain film', { tone: 'dark', pattern: 'noise', tFont: 'Bebas Neue', tWeight: '400', tSize: 130 }],
  ['Soft glow 3D', { bgGradient: 'mesh', tShadow: 'lifted', btnLook: 'pop' }],
];
export const LOOK_FONTS = [...new Set(LOOKS.map(([, st]) => st.tFont).filter(Boolean))];

// The design field each block uses for its layouts
const VARIANT_KEY = { gallery: 'layout', projects: 'layout', hero: 'layout', navbar: 'navStyle', skills: 'display', video: 'frame', embed: 'frame', techstack: 'display', featured: 'layout' };

function lookPresets(type, base) {
  const key = VARIANT_KEY[type] || 'variant';
  const layouts = opts(type, key);
  // blocks without a layout field (image) cycle through their own first designs instead
  const sources = layouts.length
    ? layouts.map(([v, l]) => ({ label: l, props: { [key]: v } }))
    : base.slice(0, 15).map((p) => ({ label: p.label, props: p.props }));
  return LOOKS.map(([name, style], i) => {
    const src = sources.length ? sources[(i * 7) % sources.length] : { label: '', props: {} };
    return P(src.label ? `${src.label} · ${name}` : name, { ...src.props }, style);
  });
}

const cache = {};
export function presetsFor(type) {
  if (cache[type]) return cache[type];
  const base = PRESETS[type] || GENERIC;
  const seen = new Set(base.map((p) => p.id));
  const extra = lookPresets(type, base).map((p) => {
    let id = p.id;
    for (let n = 2; seen.has(id); n++) id = `${p.id}-${n}`;
    seen.add(id);
    return { ...p, id };
  });
  return (cache[type] = [...base, ...extra]);
}

// Keys any preset of this block type sets: cleared before applying another, so designs don't pile up.
export function presetKeys(type) {
  const list = presetsFor(type);
  return {
    props: [...new Set(list.flatMap((p) => Object.keys(p.props)))],
    style: [...new Set(list.flatMap((p) => Object.keys(p.style)))],
  };
}

export function applyPreset(block, preset) {
  const keys = presetKeys(block.type);
  const props = { ...block.props };
  const style = { ...(block.style || {}) };
  keys.props.forEach((k) => { if (!(k in preset.props)) delete props[k]; });
  keys.style.forEach((k) => delete style[k]);
  Object.entries(preset.props).forEach(([k, v]) => { if (v === undefined) delete props[k]; else props[k] = v; });
  Object.assign(style, preset.style);
  return { ...block, props, style, preset: preset.id };
}
