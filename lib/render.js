import { DEFAULT_THEME, GRADIENTS } from './blocks';
import { fontHref, fontStack } from './fonts';
import { btn, esc, list, nl, onColor, safeUrl } from './html';
import { DEV_CSS, DEV_RENDERERS } from './renderDev';
import { STYLE_CSS, STYLE_RENDERERS } from './renderStyle';
import { TOOL_CSS, TOOL_RENDERERS } from './renderTools';
import { runtime } from './runtime';
import { decorSvg, edgeSvg, getDecor, getEdge } from './shapes';

export { esc, onColor };

// Blocks without design variants. The rest live in renderStyle.js (core blocks) and renderDev.js (developer blocks).
const R = {
  ...DEV_RENDERERS,
  heading: (p) => {
    const l = ['1', '2', '3', '4'].includes(String(p.level)) ? p.level : '2';
    return `<h${l} class="pf-h${l}">${nl(p.text)}</h${l}>`;
  },
  text: (p) => `<div class="pf-text">${nl(p.text)}</div>`,
  button: (p) => `<div class="pf-actions">${btn(p.text, p.url, p.variant, p.newTab)}</div>`,
  divider: (p) => `<hr class="pf-divider pf-divider-${esc(p.style || 'line')}">`,
  spacer: (p) => `<div style="height:${Number(p.height) || 40}px"></div>`,
  resume: (p) => `<div class="pf-resume"><p class="pf-h3">${esc(p.text)}</p>${btn(p.label, p.url, 'primary', true)}</div>`,
  map: (p) => `<div class="pf-map" style="height:${Number(p.height) || 360}px"><iframe loading="lazy" title="Map" src="https://maps.google.com/maps?q=${encodeURIComponent(p.query || '')}&output=embed"></iframe></div>`,
  html: (p) => `<div class="pf-html">${p.code || ''}</div>`,
  ...STYLE_RENDERERS,
  ...TOOL_RENDERERS,
};

export function renderBlockInner(block, theme) {
  const fn = R[block.type];
  return fn ? fn(block.props || {}, theme) : '';
}

const cssVal = (v) => String(v ?? '').replace(/[<>{};"]/g, '');
const num = (v) => (v === undefined || v === '' || v === null || Number.isNaN(Number(v)) ? null : Number(v));
const pick = (v, list) => (list.includes(v) ? v : '');

export function sectionAttrs(block) {
  const s = block.style || {};
  const css = [];
  const cls = ['pf-section', `pf-s-${block.type}`];
  // background: overlay, image and gradient stack in that order
  const layers = [];
  if (s.bgImage) {
    const o = num(s.overlay);
    if (o) layers.push(`linear-gradient(rgba(0,0,0,${o / 100}),rgba(0,0,0,${o / 100}))`);
    layers.push(`url('${safeUrl(s.bgImage)}')`);
  }
  if (GRADIENTS[s.bgGradient]) layers.push(GRADIENTS[s.bgGradient]);
  if (s.bg) css.push(`background-color:${cssVal(s.bg)}`);
  if (layers.length) css.push(`background-image:${layers.join(',')};background-size:cover;background-position:center${s.bgFixed ? ';background-attachment:fixed' : ''}`);
  if (s.color) css.push(`color:${cssVal(s.color)};--pf-text:${cssVal(s.color)};--pf-muted:${cssVal(s.color)}`);
  if (num(s.paddingY) !== null) css.push(`padding-top:${num(s.paddingY)}px;padding-bottom:${num(s.paddingY)}px`);
  // titles
  if (s.tFont) css.push(`--pf-hfont:${fontStack(s.tFont)}`);
  if (s.tWeight) css.push(`--pf-hweight:${cssVal(s.tWeight)}`);
  if (s.tCase) css.push(`--pf-hcase:${cssVal(s.tCase)}`);
  if (num(s.tSpacing) !== null) css.push(`--pf-hspacing:${num(s.tSpacing)}em`);
  if (num(s.tSize) !== null && num(s.tSize) !== 100) css.push(`--t-scale:${num(s.tSize) / 100}`);
  if (num(s.tLine) !== null) css.push(`--t-line:${num(s.tLine)}`);
  if (s.tColor) css.push(`--t-color:${cssVal(s.tColor)}`);
  if (s.tItalic) css.push('--t-style:italic');
  if (GRADIENTS[s.tGradient]) { css.push(`--t-grad:${GRADIENTS[s.tGradient]}`); cls.push('pf-tgrad'); }
  if (pick(s.tShadow, ['soft', 'hard', 'glow', 'neon', 'long', 'outline', '3d', 'lifted'])) cls.push(`pf-tsh-${s.tShadow}`);
  if (pick(s.tDecor, ['underline', 'marker', 'bar', 'dot', 'overline', 'pill', 'wavy'])) cls.push(`pf-tdec-${s.tDecor}`);
  // body text
  if (s.bFont) css.push(`--pf-bfont:${fontStack(s.bFont)}`);
  if (num(s.bSize) !== null && num(s.bSize) !== 100) css.push(`--b-scale:${num(s.bSize) / 100}`);
  if (s.bWeight) css.push(`--b-weight:${cssVal(s.bWeight)}`);
  if (num(s.bLine) !== null) css.push(`--b-line:${num(s.bLine)}`);
  if (s.bColor) css.push(`color:${cssVal(s.bColor)};--pf-text:${cssVal(s.bColor)}`);
  // buttons
  if (pick(s.btnLook, ['solid', 'gradient', 'glow', 'pop', 'outline', 'glass', 'link', 'brutal'])) cls.push(`pf-bl-${s.btnLook}`);
  if (pick(s.btnShape, ['square', 'rounded', 'pill'])) cls.push(`pf-bsh-${s.btnShape}`);
  if (pick(s.btnSize, ['sm', 'lg', 'xl'])) cls.push(`pf-bs-${s.btnSize}`);
  if (pick(s.tone, ['dark', 'brand', 'soft', 'light', 'vivid'])) cls.push(`pf-tone-${s.tone}`);
  // box, effects, layout
  if (pick(s.pattern, ['dots', 'grid', 'lines', 'cross', 'noise'])) cls.push(`pf-spat-${s.pattern}`);
  if (pick(s.box, ['card', 'glass', 'outline', 'raised', 'float', 'inset', 'gradient'])) {
    cls.push(`pf-box-${s.box}`);
    if (num(s.radius) !== null) css.push(`--box-r:${num(s.radius)}px`);
    if (pick(s.shadow, ['none', 'sm', 'lg', 'glow', 'color'])) cls.push(`pf-shd-${s.shadow}`);
  }
  if (pick(s.anim, ['fade', 'zoom', 'left', 'right', 'flip', 'blur', 'none'])) cls.push(`pf-an-${s.anim}`);
  // curved top/bottom edges (the old `divider` setting still works until a bottom shape is picked)
  const eh = Math.max(20, Math.min(320, num(s.shapeHeight) ?? 90));
  const et = getEdge(s.shapeTop);
  const eb = getEdge(s.shapeBottom);
  if (et) { cls.push('pf-has-et'); css.push(`--eh-t:${eh}px`); }
  if (eb) { cls.push('pf-has-eb'); css.push(`--eh-b:${eh}px`); }
  if (et || eb) {
    const py = num(s.paddingY);
    if (py !== null) {
      if (et) css.push(`padding-top:calc(${py}px + var(--eh-t) * var(--eh-k,1))`);
      if (eb) css.push(`padding-bottom:calc(${py}px + var(--eh-b) * var(--eh-k,1))`);
    }
  }
  if (getDecor(s.decor)) cls.push('pf-has-decor');
  if (s.shapeBottom === undefined && pick(s.divider, ['wave', 'slant', 'curve', 'triangle', 'zigzag'])) cls.push(`pf-div-${s.divider}`);
  if (s.align) cls.push(`pf-align-${cssVal(s.align)}`);
  if (s.width) cls.push(`pf-w-${cssVal(s.width)}`);
  if (s.hideMobile) cls.push('pf-hide-m');
  if (block.type === 'navbar' && block.props?.sticky) cls.push('pf-sticky');
  return { cls: cls.join(' '), style: css.join(';'), id: s.anchor ? String(s.anchor).replace(/[^\w-]/g, '') : '' };
}

// Fonts picked per section in the Text tab (plus the script font used for About signatures)
export function blockFonts(blocks) {
  const set = new Set();
  list(blocks).forEach((b) => {
    if (b.style?.tFont) set.add(b.style.tFont);
    if (b.style?.bFont) set.add(b.style.bFont);
    if (b.type === 'about' && b.props?.signature) set.add('Great Vibes');
    if (b.type === 'image' && b.props?.frame === 'polaroid') set.add('Caveat');
    if (b.type === 'gallery' && b.props?.layout === 'polaroid') set.add('Caveat');
  });
  return [...set];
}

const DECOR_POS = ['tr', 'tl', 'br', 'bl', 'both', 'center'];

// Edge and decor shapes drawn inside a section, before its content
export function sectionShapes(block) {
  const s = block.style || {};
  let out = '';
  const d = getDecor(s.decor);
  if (d) {
    const pos = pick(s.decorPos, DECOR_POS) || 'tr';
    const size = Math.max(60, Math.min(900, num(s.decorSize) ?? 320));
    const op = Math.max(2, Math.min(100, num(s.decorOpacity) ?? 16)) / 100;
    const style = `--dz:${size}px;--do:${op}${s.decorColor ? `;color:${cssVal(s.decorColor)}` : ''}`;
    const one = (p) => `<div class="pf-decor pf-decor-${p}${s.decorMotion ? ' pf-decor-move' : ''}" style="${esc(style)}" aria-hidden="true">${decorSvg(d)}</div>`;
    out += pos === 'both' ? one('tr') + one('bl') : one(pos);
  }
  const color = s.shapeColor ? ` style="color:${esc(cssVal(s.shapeColor))}"` : '';
  const flip = s.shapeFlip ? ' pf-edge-flip' : '';
  const et = getEdge(s.shapeTop);
  const eb = getEdge(s.shapeBottom);
  if (et) out += `<div class="pf-edge pf-edge-t${flip}"${color} aria-hidden="true">${edgeSvg(et)}</div>`;
  if (eb) out += `<div class="pf-edge pf-edge-b${flip}"${color} aria-hidden="true">${edgeSvg(eb)}</div>`;
  return out;
}

export function renderBlock(block, theme) {
  const a = sectionAttrs(block);
  return `<section class="${a.cls}"${a.id ? ` id="${a.id}"` : ''}${a.style ? ` style="${esc(a.style)}"` : ''}>${sectionShapes(block)}<div class="pf-container">${renderBlockInner(block, theme)}</div></section>`;
}

export function fullTheme(theme) {
  return { ...DEFAULT_THEME, ...(theme || {}) };
}

export function themeVars(theme) {
  const t = fullTheme(theme);
  return {
    '--pf-primary': t.primary,
    '--pf-on-primary': onColor(t.primary),
    '--pf-secondary': t.secondary,
    '--pf-bg': t.bg,
    '--pf-surface': t.surface,
    '--pf-text': t.text,
    '--pf-muted': t.muted,
    '--pf-border': t.border,
    '--pf-hfont': fontStack(t.headingFont),
    '--pf-bfont': fontStack(t.bodyFont),
    '--pf-base': `${t.baseSize}px`,
    '--pf-hweight': t.headingWeight,
    '--pf-hspacing': `${t.letterSpacing}em`,
    '--pf-hcase': t.headingCase,
    '--pf-radius': `${t.radius}px`,
    '--pf-max': `${t.maxWidth}px`,
    '--pf-space': `${t.sectionSpacing}px`,
  };
}

const NOISE = `url("data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='.18'/></svg>")}")`;
// Page patterns as background layers: [images, sizes]
const PAGE_PATTERNS = {
  dots: [['radial-gradient(var(--pf-border) 1.2px,transparent 1.2px)'], ['22px 22px']],
  grid: [['linear-gradient(var(--pf-border) 1px,transparent 1px)', 'linear-gradient(90deg,var(--pf-border) 1px,transparent 1px)'], ['44px 44px', '44px 44px']],
  lines: [['repeating-linear-gradient(45deg,var(--pf-border) 0 1px,transparent 1px 14px)'], ['auto']],
  noise: [[NOISE], ['160px 160px']],
  gradient: [[
    'radial-gradient(1200px 600px at 85% -10%,color-mix(in srgb,var(--pf-primary) 22%,transparent),transparent)',
    'radial-gradient(900px 500px at -10% 30%,color-mix(in srgb,var(--pf-secondary) 18%,transparent),transparent)',
  ], ['auto', 'auto']],
};
export const PAGE_GRADIENTS = GRADIENTS;

// Background of the whole page: pattern on top, then image overlay, then image or gradient, over the base colour
export function pageBgCss(theme) {
  const t = fullTheme(theme);
  const imgs = [];
  const sizes = [];
  const repeats = [];
  const attach = [];
  const add = (img, size = 'auto', repeat = 'repeat', fixed = false) => { imgs.push(img); sizes.push(size); repeats.push(repeat); attach.push(fixed ? 'fixed' : 'scroll'); };
  const pat = PAGE_PATTERNS[t.pattern];
  if (pat) pat[0].forEach((img, i) => add(img, pat[1][i]));
  if (t.bgType === 'image' && t.bgImage) {
    const o = Math.max(0, Math.min(90, Number(t.bgOverlay) || 0));
    if (o) add(`linear-gradient(rgba(0,0,0,${o / 100}),rgba(0,0,0,${o / 100}))`, 'auto', 'no-repeat', t.bgFixed);
    const tile = t.bgSize === 'tile';
    add(`url('${safeUrl(t.bgImage)}')`, tile ? 'auto' : t.bgSize === 'contain' ? 'contain' : 'cover', tile ? 'repeat' : 'no-repeat', t.bgFixed);
  } else if (t.bgType === 'gradient') {
    const g = t.bgGradient === 'custom'
      ? `linear-gradient(${Number(t.bgAngle) || 0}deg,${cssVal(t.bgGrad1)},${cssVal(t.bgGrad2)})`
      : GRADIENTS[t.bgGradient];
    if (g) add(g, 'auto', 'no-repeat', t.bgFixed);
  }
  if (!imgs.length) return '';
  return `background-image:${imgs.join(',')};background-size:${sizes.join(',')};background-repeat:${repeats.join(',')};background-position:center;background-attachment:${attach.join(',')}`;
}

// Colour around the page in boxed / mobile layouts
export const outerBg = (theme) => {
  const t = fullTheme(theme);
  return t.layout === 'boxed' || t.layout === 'mobile' ? cssVal(t.outerBg) || '#E9ECF2' : '';
};

export const varsToString = (v) => Object.entries(v).map(([k, val]) => `${k}:${val}`).join(';');

export function rootClass(theme, live = false) {
  const t = fullTheme(theme);
  const layout = ['full', 'boxed', 'mobile'].includes(t.layout) && `pf-layout-${t.layout}`;
  return ['pf', `pf-btns-${t.buttonStyle}`, layout, live && t.animation && 'pf-anim'].filter(Boolean).join(' ');
}

export function themeFontHref(theme, blocks = []) {
  const t = fullTheme(theme);
  return fontHref([...new Set([t.headingFont, t.bodyFont, ...blockFonts(blocks)])]);
}

export const BASE_CSS = `
.pf{container-type:inline-size;background-color:var(--pf-bg);color:var(--pf-text);font-family:var(--pf-bfont);font-size:var(--pf-base);line-height:1.65;-webkit-font-smoothing:antialiased;min-height:100%}
.pf *,.pf *::before,.pf *::after{box-sizing:border-box}
.pf img{max-width:100%;display:block}
.pf a{color:inherit}
.pf p{margin:0 0 1em}
.pf-container{max-width:var(--pf-max);margin:0 auto;padding:0 24px}
.pf-layout-full .pf-container{max-width:none}
.pf-layout-boxed,.pf-layout-mobile{margin:40px auto;min-height:calc(100% - 80px);border-radius:16px;overflow:clip;box-shadow:0 30px 80px -30px rgba(15,23,42,.45)}
.pf-layout-boxed{max-width:calc(var(--pf-max) + 48px)}
.pf-layout-mobile{max-width:480px}
@media (max-width:560px){.pf-layout-boxed,.pf-layout-mobile{margin:0;min-height:100%;border-radius:0;box-shadow:none}}
.pf-w-full .pf-container{max-width:none}
.pf-w-narrow .pf-container{max-width:760px}
.pf-section{padding:calc(var(--pf-space) / 2) 0;position:relative}
.pf-align-left{text-align:left}.pf-align-center{text-align:center}.pf-align-right{text-align:right}
.pf h1,.pf h2,.pf h3,.pf h4,.pf .pf-h1,.pf .pf-h2,.pf .pf-h3,.pf .pf-h4{font-family:var(--pf-hfont);font-weight:var(--pf-hweight);letter-spacing:var(--pf-hspacing);text-transform:var(--pf-hcase);line-height:1.12;margin:0 0 .5em;color:inherit}
.pf .pf-h1{font-size:calc(clamp(2.3rem,6.4cqi,4.6rem) * var(--t-scale,1))}
.pf .pf-h2{font-size:calc(clamp(1.8rem,4.2cqi,2.8rem) * var(--t-scale,1))}
.pf .pf-h3{font-size:calc(1.5em * var(--t-scale,1))}
.pf .pf-h4{font-size:calc(1.15em * var(--t-scale,1));line-height:1.3}
.pf-title{margin-bottom:1em!important}
.pf-lead{font-size:1.18em;color:var(--pf-muted);max-width:58ch}
.pf-align-center .pf-lead,.pf-align-center .pf-text{margin-inline:auto}
.pf-kicker{color:var(--pf-primary);font-weight:600;letter-spacing:.02em}
.pf-meta{color:var(--pf-muted);font-size:.92em}
.pf-text{max-width:68ch}
.pf-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5em;padding:.8em 1.5em;border-radius:var(--pf-radius);font:inherit;font-weight:600;text-decoration:none;border:2px solid var(--pf-primary);cursor:pointer;transition:transform .15s ease,background-color .15s ease}
.pf-btn:hover{transform:translateY(-1px)}
.pf-btn-primary{background:var(--pf-primary);color:var(--pf-on-primary)!important}
.pf-btn-outline{background:transparent;color:var(--pf-primary)!important}
.pf-btn-ghost{background:transparent;color:var(--pf-text)!important;border-color:var(--pf-border)}
.pf-btns-pill .pf-btn{border-radius:999px}.pf-btns-square .pf-btn{border-radius:0}
.pf-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:1.4em}
.pf-align-center .pf-actions{justify-content:center}.pf-align-right .pf-actions{justify-content:flex-end}
.pf-s-navbar{padding-top:20px;padding-bottom:20px}
.pf-nav{display:flex;justify-content:space-between;align-items:center;gap:16px;position:relative}
.pf-logo{font-family:var(--pf-hfont);font-weight:700;font-size:1.25em;text-decoration:none}
.pf-logo img{height:36px;width:auto}
.pf-nav-links{display:flex;gap:26px;flex-wrap:wrap}
.pf-nav-links a{text-decoration:none;color:var(--pf-muted);font-weight:500}
.pf-nav-links a:hover{color:var(--pf-primary)}
.pf-menu-toggle,.pf-burger{display:none}
.pf-hero{display:grid;gap:56px;align-items:center;grid-template-columns:1.15fr 1fr}
.pf-hero-image-left{grid-template-columns:1fr 1.15fr}
.pf-hero-center,.pf-hero-cover{grid-template-columns:1fr;text-align:center}
.pf-hero-center .pf-hero-text,.pf-hero-cover .pf-hero-text{max-width:860px;margin:0 auto}
.pf-hero-center .pf-actions,.pf-hero-cover .pf-actions{justify-content:center}
.pf-hero-center .pf-lead,.pf-hero-cover .pf-lead{margin-inline:auto}
.pf-hero-media img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--pf-radius)}
.pf-hero-center .pf-hero-media img{aspect-ratio:16/8}
.pf-hero-cover{padding:clamp(80px,14cqi,180px) 24px;border-radius:var(--pf-radius);background:linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.55)),var(--hero-img) center/cover;color:#fff}
.pf-hero-cover .pf-lead{color:rgba(255,255,255,.85)}
.pf-hero-cover .pf-btn-ghost{color:#fff!important;border-color:rgba(255,255,255,.6)}
.pf-figure{margin:0 auto}
.pf-figure figcaption{color:var(--pf-muted);font-size:.9em;text-align:center;margin-top:10px}
.pf-rounded{border-radius:var(--pf-radius)}
.pf-gallery{display:grid;grid-template-columns:repeat(var(--cols),1fr);gap:12px}
.pf-gallery-item{position:relative;display:block;overflow:hidden;border-radius:var(--pf-radius)}
.pf-gallery-item img{width:100%;aspect-ratio:1;object-fit:cover;transition:transform .5s ease}
.pf-gallery-wide .pf-gallery-item img{aspect-ratio:16/9}
.pf-gallery-masonry{display:block;columns:var(--cols);column-gap:12px}
.pf-gallery-masonry .pf-gallery-item{margin-bottom:12px;break-inside:avoid}
.pf-gallery-masonry .pf-gallery-item img{aspect-ratio:auto}
.pf-embed{position:relative;aspect-ratio:16/9;border-radius:var(--pf-radius);overflow:hidden;background:#000}
.pf-embed iframe,.pf-embed video{position:absolute;inset:0;width:100%;height:100%;border:0}
.pf-logos-title{text-align:center;margin-bottom:20px}
.pf-logos{display:flex;flex-wrap:wrap;gap:36px;justify-content:center;align-items:center}
.pf-logos img{height:44px;width:auto;filter:grayscale(1);opacity:.75}
.pf-about{display:grid;grid-template-columns:minmax(0,.8fr) 1.2fr;gap:56px;align-items:center}
.pf-about img{width:100%;aspect-ratio:4/5;object-fit:cover}
.pf-about-noimg{grid-template-columns:1fr}
.pf-skill{margin-bottom:16px}
.pf-skill-row{display:flex;justify-content:space-between;margin-bottom:6px;font-weight:500}
.pf-bar{height:8px;background:var(--pf-border);border-radius:99px;overflow:hidden}
.pf-bar i{display:block;height:100%;background:var(--pf-primary);border-radius:inherit}
.pf-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.pf-align-center .pf-tags{justify-content:center}
.pf-tag{padding:.3em .85em;border:1px solid var(--pf-border);border-radius:99px;font-size:.82em;color:var(--pf-muted)}
.pf-tags-lg .pf-tag{font-size:1em;padding:.5em 1.1em;color:var(--pf-text);background:var(--pf-surface)}
.pf-rings{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:24px;text-align:center}
.pf-ring-c{width:110px;height:110px;margin:0 auto 10px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--pf-primary) calc(var(--v)*1%),var(--pf-border) 0)}
.pf-ring-c span{width:86px;height:86px;border-radius:50%;background:var(--pf-bg);display:grid;place-items:center;font-weight:700}
.pf-timeline{list-style:none;padding:0;margin:0;border-left:2px solid var(--pf-border);text-align:left}
.pf-timeline li{position:relative;padding:0 0 30px 30px}
.pf-timeline li::before{content:'';position:absolute;left:-7px;top:.5em;width:12px;height:12px;border-radius:50%;background:var(--pf-primary)}
.pf-timeline .pf-meta{margin:0 0 4px}
.pf-at{font-weight:400;color:var(--pf-muted)}
.pf-edu-item{display:flex;justify-content:space-between;gap:16px;padding:18px 0;border-bottom:1px solid var(--pf-border);text-align:left}
.pf-edu-item p{margin:0}
.pf-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:24px}
.pf-stat strong{display:block;font-family:var(--pf-hfont);font-size:clamp(2.2rem,5cqi,3.4rem);color:var(--pf-primary);line-height:1.05}
.pf-stat span{color:var(--pf-muted)}
.pf-resume{display:flex;flex-wrap:wrap;gap:20px;align-items:center;justify-content:space-between;padding:32px;border:1px solid var(--pf-border);border-radius:var(--pf-radius);background:var(--pf-surface)}
.pf-resume .pf-h3{margin:0}
.pf-grid{display:grid;gap:22px;grid-template-columns:repeat(3,minmax(0,1fr))}
.pf-grid.pf-cols-1{grid-template-columns:minmax(0,1fr)}.pf-grid.pf-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.pf-grid.pf-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}.pf-grid.pf-cols-5{grid-template-columns:repeat(5,minmax(0,1fr))}.pf-grid.pf-cols-6{grid-template-columns:repeat(6,minmax(0,1fr))}
.pf-card{display:block;background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:var(--pf-radius);overflow:hidden;text-decoration:none;color:inherit;text-align:left}
.pf-card-pad{padding:26px}
.pf-project img{width:100%;aspect-ratio:3/2;object-fit:cover;transition:transform .5s ease}
.pf-card-body{padding:20px 22px 24px}
.pf-card-body p{margin:6px 0 0}
.pf-testimonial{margin:0}
.pf-testimonial blockquote{margin:0 0 20px;font-size:1.08em}
.pf-testimonial figcaption{display:flex;align-items:center;gap:12px}
.pf-testimonial img{width:46px;height:46px;border-radius:50%;object-fit:cover}
.pf-plan ul{list-style:none;padding:0;margin:16px 0 0}
.pf-plan li{padding:8px 0;border-top:1px solid var(--pf-border)}
.pf-price{font-family:var(--pf-hfont);font-size:2em;font-weight:700;margin:4px 0}
.pf-plan-hl{border:2px solid var(--pf-primary)}
.pf-faq details{border-bottom:1px solid var(--pf-border);padding:18px 0;text-align:left}
.pf-faq summary{cursor:pointer;font-weight:600;font-size:1.05em}
.pf-faq details p{margin:12px 0 0;color:var(--pf-muted)}
.pf-cta{background:var(--pf-primary);color:var(--pf-on-primary);padding:clamp(40px,7cqi,72px) 32px;border-radius:var(--pf-radius);text-align:center}
.pf-cta p{opacity:.9;max-width:52ch;margin-inline:auto}
.pf-cta .pf-actions{justify-content:center}
.pf-cta .pf-btn-primary{background:var(--pf-on-primary);color:var(--pf-primary)!important;border-color:var(--pf-on-primary)}
.pf-quote{margin:0 auto;max-width:32ch;text-align:center}
.pf-quote p{font-family:var(--pf-hfont);font-size:clamp(1.5rem,3.6cqi,2.4rem);line-height:1.3}
.pf-quote cite{color:var(--pf-muted);font-style:normal}
.pf-divider{border:0;border-top:1px solid var(--pf-border);margin:0}
.pf-divider-dashed{border-top-style:dashed;border-top-width:2px}
.pf-divider-dots{border-top:4px dotted var(--pf-border)}
.pf-divider-accent{width:72px;border-top:4px solid var(--pf-primary);margin:0 auto}
.pf-linklist{display:flex;flex-direction:column;gap:14px;max-width:580px;margin:0 auto}
.pf-linkitem{display:flex;justify-content:center;align-items:center;gap:10px;padding:17px 22px;border:2px solid var(--pf-text);border-radius:var(--pf-radius);text-decoration:none;font-weight:600;transition:background-color .15s,color .15s}
.pf-linkitem:hover{background:var(--pf-text);color:var(--pf-bg)}
.pf-linkitem small{font-size:.75em;padding:2px 8px;border-radius:99px;background:var(--pf-secondary);color:${'#111418'}}
.pf-social{display:flex;flex-wrap:wrap;gap:10px}
.pf-align-center .pf-social{justify-content:center}
.pf-social-item{display:inline-flex;align-items:center;gap:8px;padding:8px 14px 8px 8px;border:1px solid var(--pf-border);border-radius:99px;text-decoration:none;font-size:.92em}
.pf-social-item b{display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--pf-primary);color:var(--pf-on-primary);font-size:.72em}
.pf-contact{display:grid;grid-template-columns:1fr 1fr;gap:56px;text-align:left}
.pf-contact-single{grid-template-columns:1fr}
.pf-contact-info{display:flex;flex-direction:column;gap:10px;font-size:1.05em}
.pf-contact-info a{color:var(--pf-primary);font-weight:600;text-decoration:none}
.pf-input{display:block;width:100%;padding:.85em 1em;border:1px solid var(--pf-border);border-radius:var(--pf-radius);background:var(--pf-surface);color:var(--pf-text);font:inherit;margin:0 0 12px}
.pf-map{border-radius:var(--pf-radius);overflow:hidden}
.pf-map iframe{width:100%;height:100%;border:0}
.pf-footer{color:var(--pf-muted);font-size:.9em;padding-top:28px;border-top:1px solid var(--pf-border);text-align:center}
.pf-anim .pf-section{opacity:0;transform:translateY(18px);transition:opacity .7s ease,transform .7s ease}
.pf-anim .pf-section.pf-in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.pf-anim .pf-section{opacity:1;transform:none;transition:none}.pf *{transition:none!important}}
.pf-lb{position:fixed;inset:0;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;z-index:9999;cursor:zoom-out;padding:24px}
.pf-lb img{max-width:94vw;max-height:88vh;border-radius:6px}
@container (max-width:900px){
  .pf .pf-grid.pf-cols-3,.pf .pf-grid.pf-cols-4,.pf .pf-grid.pf-cols-5,.pf .pf-grid.pf-cols-6{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pf .pf-gallery.pf-cols-4,.pf .pf-gallery.pf-cols-5,.pf .pf-gallery.pf-cols-6{grid-template-columns:repeat(3,1fr)}
  .pf .pf-gallery-masonry.pf-cols-4,.pf .pf-gallery-masonry.pf-cols-5,.pf .pf-gallery-masonry.pf-cols-6{columns:3}
}
@container (max-width:680px){
  .pf-container{padding:0 18px}
  .pf-section{padding:calc(var(--pf-space) / 3) 0}
  .pf-hero,.pf-hero-image-left,.pf-about,.pf-contact{grid-template-columns:1fr;gap:32px}
  .pf-hero-image-left .pf-hero-media{order:-1}
  .pf .pf-grid[class*="pf-cols-"]{grid-template-columns:minmax(0,1fr)}
  .pf .pf-gallery[class*="pf-cols-"]:not(.pf-cols-1){grid-template-columns:repeat(2,1fr);columns:2}
  .pf-burger{display:block;width:40px;height:40px;cursor:pointer;position:relative}
  .pf-burger span,.pf-burger span::before,.pf-burger span::after{content:'';position:absolute;left:9px;right:9px;height:2px;background:currentColor;border-radius:2px}
  .pf-burger span{top:19px}.pf-burger span::before{top:-7px;left:0;right:0}.pf-burger span::after{top:7px;left:0;right:0}
  .pf-nav-links{display:none;position:absolute;top:100%;left:0;right:0;flex-direction:column;gap:0;background:var(--pf-bg);border:1px solid var(--pf-border);border-radius:var(--pf-radius);padding:8px;z-index:20}
  .pf-nav-links a{padding:10px 12px}
  .pf-menu-toggle:checked ~ .pf-nav-links{display:flex}
  .pf-hide-m{display:none}
  .pf-edu-item{flex-direction:column;gap:4px}
  .pf-nav>.pf-mode{order:2;margin-left:auto;margin-right:4px}.pf-burger{order:3}
}
.pf-nav>.pf-mode{margin-left:-8px}
.pf-nav:has(>.pf-mode) .pf-nav-links{margin-left:auto}
${DEV_CSS}${STYLE_CSS}${TOOL_CSS}
.pf-hero-media .pf-pic img,.pf-gallery-item .pf-pic[style*="--r"] img{aspect-ratio:auto}
.pf-hero-media .pf-pic img{position:absolute;inset:0;height:100%}
.pf-gallery-filmstrip img,.pf-gallery-justified img{aspect-ratio:auto!important}
.pf-about.pf-about-noimg{grid-template-columns:1fr}
`;

// Injected as source. Escape `</script` and `<!--` so string literals can't end the <script> element early.
const RUNTIME_JS = `(${runtime.toString()})();`.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');

// Palette the visitor's light/dark switch flips to. !important beats the inline theme vars on .pf.
function altThemeCss(t) {
  if (!t.modeToggle) return '';
  const v = { primary: t.altPrimary, 'on-primary': onColor(t.altPrimary), bg: t.altBg, surface: t.altSurface, text: t.altText, muted: t.altMuted, border: t.altBorder };
  return `.pf.pf-alt,.pf-layer.pf-alt{${Object.entries(v).map(([k, val]) => `--pf-${k}:${cssVal(val)}!important`).join(';')}}`;
}

export function renderDocument(portfolio, { mapUrl } = {}) {
  const data = portfolio || {};
  const t = fullTheme(data.theme);
  const map = mapUrl || ((u) => u);
  const blocks = list(data.blocks).map((b) => JSON.parse(JSON.stringify(b, (k, v) => (typeof v === 'string' ? map(v) : v))));
  const font = themeFontHref(t, blocks);
  const page = data.page || {};
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(page.title || data.name || 'Portfolio')}</title>
${page.description ? `<meta name="description" content="${esc(page.description)}">` : ''}
${page.favicon ? `<link rel="icon" href="${safeUrl(map(page.favicon))}">` : ''}
${font ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${esc(font)}">` : ''}
<style>html,body{margin:0;padding:0;height:100%;scroll-behavior:smooth}${outerBg(t) ? `body{background:${outerBg(t)}}` : ''}${BASE_CSS}${altThemeCss(t)}${t.customCSS || ''}</style>
</head>
<body>
<div class="${rootClass(t, true)}" style="${esc([varsToString(themeVars(t)), pageBgCss(t)].filter(Boolean).join(';'))}"${t.modeToggle ? ` data-mode="${onColor(t.bg) === '#FFFFFF' ? 'dark' : 'light'}"` : ''}${t.commandPalette ? ' data-cmdk' : ''}>
${blocks.map((b) => renderBlock(b, t)).join('\n')}
</div>
<script>${RUNTIME_JS}</script>
</body>
</html>`;
}
