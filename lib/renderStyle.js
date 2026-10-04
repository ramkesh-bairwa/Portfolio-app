// Renderers for the core blocks with their design options (layouts, image looks, variants).
// Each one falls back to the block's original look when an option is missing, so older portfolios render unchanged.
import { GRADIENTS, TILE_PATTERNS } from './blocks';
import { btn, csv, esc, ext, h2, json, list, nl, safeUrl } from './html';
import { techIcon } from './renderDev';

const SOCIAL_SHORT = { GitHub: 'GH', LinkedIn: 'in', X: 'X', Instagram: 'IG', Dribbble: 'Dr', Behance: 'Bē', YouTube: 'YT', Facebook: 'f', TikTok: 'TT', Medium: 'M', WhatsApp: 'WA', Email: '@', Website: 'www' };
const clamp = (v, lo, hi, d) => { const n = Number(v); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };
const word = (v, allowed, d) => (allowed.includes(v) ? v : d);
const ratioVar = (r) => (/^\d+\/\d+$/.test(String(r)) ? r : 'auto');
const tagList = (tags) => (tags.length ? `<div class="pf-tags">${tags.map((t) => `<span class="pf-tag">${esc(t)}</span>`).join('')}</div>` : '');
const STARS = '<p class="pf-stars" aria-label="5 out of 5 stars">★★★★★</p>';

// A picture wrapper that carries crop ratio, filter, shape and hover effect.
export function pic(src, { alt = '', ratio, filter, shape, hover, focus, cls = '', lazy = true } = {}) {
  if (!src) return '';
  const classes = ['pf-pic', filter && `pf-fx-${esc(filter)}`, hover && `pf-hv-${esc(hover)}`, shape && `pf-shp-${esc(shape)}`, cls].filter(Boolean).join(' ');
  const r = ratioVar(ratio);
  const style = [r !== 'auto' && `--r:${r}`, focus && focus !== 'center' && `--fp:${esc(focus)}`].filter(Boolean).join(';');
  return `<span class="${classes}"${style ? ` style="${style}"` : ''}><img src="${safeUrl(src)}" alt="${esc(alt)}"${lazy ? ' loading="lazy"' : ''}></span>`;
}

function embedUrl(url, p) {
  const u = String(url || '');
  const flags = (y) => [p.autoplay && (y ? 'autoplay=1&mute=1' : 'autoplay=1&muted=1'), p.loop && 'loop=1', p.controls === false && 'controls=0'].filter(Boolean);
  let m = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (m) { const q = flags(true); if (p.loop) q.push(`playlist=${m[1]}`); return { kind: 'iframe', src: `https://www.youtube.com/embed/${m[1]}${q.length ? '?' + q.join('&') : ''}` }; }
  m = u.match(/vimeo\.com\/(\d+)/);
  if (m) { const q = flags(false); return { kind: 'iframe', src: `https://player.vimeo.com/video/${m[1]}${q.length ? '?' + q.join('&') : ''}` }; }
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(u)) return { kind: 'video', src: u };
  return null;
}

// Grid placement for one item of a tile pattern
const tile = (pattern, i) => {
  const spec = pattern[2][i % pattern[2].length];
  return `grid-column:${spec[2] ? `${spec[2]} / ` : ''}span ${spec[0]};grid-row:span ${spec[1]}`;
};

const fact = (s) => String(s || '').split('\n').map((l) => l.split(':')).filter((r) => r[0].trim());

export const STYLE_RENDERERS = {
  navbar: (p) => {
    const style = word(p.navStyle, ['classic', 'centered', 'pill', 'glass', 'underline', 'boxed', 'bold', 'minimal', 'split', 'tabs', 'outlined', 'stacked'], 'classic');
    const h = clamp(p.logoSize, 16, 100, 36);
    const logo = p.logoImage ? `<img src="${safeUrl(p.logoImage)}" alt="${esc(p.logo)}" style="height:${h}px">` : esc(p.logo);
    const cta = p.ctaText ? `<a class="pf-btn pf-btn-primary pf-nav-cta" href="${safeUrl(p.ctaUrl)}"${ext(p.ctaUrl)}>${esc(p.ctaText)}</a>` : '';
    return `<nav class="pf-nav pf-nav-${style}"><a class="pf-logo" href="#">${logo}</a>` +
      `<input type="checkbox" id="pf-menu" class="pf-menu-toggle" aria-label="Menu"><label for="pf-menu" class="pf-burger"><span></span></label>` +
      `<div class="pf-nav-links">${list(p.links).map((l, i, a) => `<a href="${safeUrl(l.url)}"${style === 'split' && i === Math.ceil(a.length / 2) ? ' class="pf-nav-gap"' : ''}>${esc(l.label)}</a>`).join('')}</div>${cta}</nav>`;
  },

  hero: (p) => {
    const layout = word(p.layout, ['split', 'image-left', 'center', 'cover', 'gradient', 'minimal', 'card', 'video', 'collage'], 'split');
    const shape = word(p.imageShape, ['rounded', 'square', 'circle', 'blob', 'arch', 'tilted', 'frame'], 'rounded');
    const words = csv(p.rotate);
    const rotate = words.length ? ` <span class="pf-rotate" data-rotate="${json(words)}">${esc(words[0])}</span>` : '';
    const text =
      `<div class="pf-hero-text">${p.badge ? `<p class="pf-avail"><i></i>${esc(p.badge)}</p>` : ''}${p.kicker ? `<p class="pf-kicker">${esc(p.kicker)}</p>` : ''}<h1 class="pf-h1">${nl(p.title)}${rotate}</h1>` +
      `${p.subtitle ? `<p class="pf-lead">${nl(p.subtitle)}</p>` : ''}<div class="pf-actions">${btn(p.buttonText, p.buttonUrl)}${btn(p.button2Text, p.button2Url, 'ghost')}</div></div>`;
    const ov = clamp(p.overlay, 0, 90, 50) / 100;
    let media = '';
    let attrs = '';
    if (['split', 'image-left', 'center'].includes(layout) && p.image) media = `<div class="pf-hero-media pf-hm-${shape}">${pic(p.image, { lazy: false })}</div>`;
    if (layout === 'collage') media = `<div class="pf-hero-collage pf-hc-${shape}">${[p.image, p.image2, p.image3].filter(Boolean).map((s) => pic(s, { lazy: false })).join('')}</div>`;
    if (['cover', 'card'].includes(layout) && p.image) attrs = ` style="--hero-img:url('${safeUrl(p.image)}');--ov:${ov}"`;
    if (layout === 'video') {
      attrs = ` style="--ov:${ov}"`;
      if (p.videoUrl) media = `<video class="pf-hero-video" src="${safeUrl(p.videoUrl)}" autoplay muted loop playsinline aria-hidden="true"></video>`;
    }
    if (layout === 'gradient') attrs = ` style="--hg:${GRADIENTS[p.gradient] || GRADIENTS.brand}"`;
    const hh = p.height === 'screen' || p.height === 'tall' ? ` pf-hh-${p.height}` : '';
    const scroll = p.scrollHint ? '<button type="button" class="pf-scroll" data-scroll aria-label="Scroll down">↓</button>' : '';
    const inner = layout === 'image-left' ? media + text : layout === 'video' ? media + text : text + media;
    return `<div class="pf-hero pf-hero-${layout}${hh}"${attrs}>${inner}${scroll}</div>`;
  },

  image: (p) => {
    const shape = p.shape || (p.rounded === false ? 'square' : 'rounded');
    const frame = word(p.frame, ['border', 'polaroid', 'shadow', 'shade', 'fade', 'glow', 'sticker', 'float', 'offset', 'browser', 'phone'], '');
    const capStyle = word(p.captionStyle, ['below', 'overlay', 'hover'], 'below');
    const ratio = frame === 'phone' ? '9/19' : p.ratio;
    let im = pic(p.src, { alt: p.alt, ratio, filter: p.filter, shape: frame === 'phone' ? '' : shape, hover: p.hover, focus: p.focus, lazy: false });
    if (p.link) im = `<a href="${safeUrl(p.link)}"${ext(p.link)}>${im}</a>`;
    const cap = p.caption ? `<figcaption class="pf-cap-${capStyle}">${esc(p.caption)}</figcaption>` : '';
    const bar = frame === 'browser' ? '<div class="pf-frame-bar"><i></i><i></i><i></i></div>' : '';
    const align = word(p.align, ['center', 'left', 'right'], 'center');
    return `<figure class="pf-figure pf-img-${align}${frame ? ` pf-frame pf-frame-${frame}` : ''}" style="max-width:${clamp(p.width, 10, 100, 100)}%">${bar}<div class="pf-figure-in">${im}${capStyle !== 'below' ? cap : ''}</div>${capStyle === 'below' ? cap : ''}</figure>`;
  },

  gallery: (p) => {
    const pattern = TILE_PATTERNS[p.layout];
    const layout = pattern ? 'pattern' : word(p.layout, ['grid', 'masonry', 'wide', 'mosaic', 'carousel', 'filmstrip', 'polaroid', 'justified', 'circles'], 'grid');
    const c = pattern ? pattern[1] : clamp(p.columns, 1, 6, 3);
    const cap = word(p.captionStyle, ['overlay', 'hover', 'below', 'none'], 'overlay');
    const corners = word(p.corners, ['square', 'round', 'xl'], '');
    const ratio = p.ratio || { wide: '16/9', circles: '1/1', grid: '1/1', carousel: '4/3', polaroid: '1/1', mosaic: '1/1' }[layout] || 'auto';
    const lb = p.lightbox !== false;
    const items = list(p.images).filter((i) => i.src).map((i, n) => {
      const image = pic(i.src, { alt: i.caption, ratio: ['masonry', 'filmstrip', 'justified', 'pattern'].includes(layout) ? 'auto' : ratio, filter: p.filter, hover: p.hover ?? 'zoom' });
      const caption = i.caption && cap !== 'none' ? `<span class="pf-gcap">${esc(i.caption)}</span>` : '';
      const tag = lb ? 'a' : 'div';
      return `<${tag} class="pf-gallery-item"${lb ? ` href="${safeUrl(i.src)}" data-lightbox` : ''}${pattern ? ` style="${tile(pattern, n)}"` : ''}>${image}${caption}</${tag}>`;
    }).join('');
    const scroller = layout === 'carousel' || layout === 'filmstrip';
    const cls = `pf-gallery pf-gallery-${layout} pf-cols-${c} pf-gcap-${cap}${corners ? ` pf-gc-${corners}` : ''}${scroller ? ' pf-carousel' : ''}`;
    return `${h2(p.title)}<div class="${cls}" style="--cols:${c};--gap:${clamp(p.gap, 0, 60, 12)}px;--rowh:${clamp(p.rowH, 60, 600, 190)}px">${items}</div>`;
  },

  video: (p) => {
    const e = embedUrl(p.url, p);
    if (!e) return `${h2(p.title)}<p class="pf-meta">Add a YouTube, Vimeo or MP4 link.</p>`;
    const frame = word(p.frame, ['card', 'browser', 'phone', 'laptop', 'cinema', 'float', 'glow'], '');
    const ratio = frame === 'phone' ? '9/19' : ratioVar(p.ratio || '16/9');
    const media = e.kind === 'iframe'
      ? `<iframe src="${esc(e.src)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy" title="${esc(p.title || 'Video')}"></iframe>`
      : `<video src="${esc(e.src)}"${p.controls === false ? '' : ' controls'}${p.autoplay ? ' autoplay muted' : ''}${p.loop ? ' loop' : ''} playsinline${p.poster ? ` poster="${safeUrl(p.poster)}"` : ''}></video>`;
    const bar = frame === 'browser' ? '<div class="pf-frame-bar"><i></i><i></i><i></i></div>' : '';
    const player = `<div class="pf-vframe${frame ? ` pf-vframe-${frame}` : ''}">${bar}<div class="pf-embed" style="--vr:${ratio}">${media}</div>${frame === 'laptop' ? '<div class="pf-laptop-base"></div>' : ''}</div>${p.caption ? `<p class="pf-meta pf-vcap">${esc(p.caption)}</p>` : ''}`;
    const side = word(p.side, ['left', 'right', 'below'], '');
    if (!side) return h2(p.title) + player;
    const copy = `<div class="pf-vtext">${p.heading ? `<h3 class="pf-h3">${esc(p.heading)}</h3>` : ''}${p.text ? `<p>${nl(p.text)}</p>` : ''}</div>`;
    return `${h2(p.title)}<div class="pf-vside pf-vside-${side}">${side === 'left' ? copy + player : player + copy}</div>`;
  },

  skills: (p) => {
    const items = list(p.items).map((s) => ({ name: s.name, v: clamp(s.level, 0, 100, 0) }));
    const d = word(p.display, ['bars', 'gradient', 'segments', 'circles', 'tags', 'cloud', 'dots', 'stars', 'cards', 'levels', 'icons'], 'bars');
    const show = p.showLevel !== false;
    const pct = (v) => (show ? `<span class="pf-meta">${v}%</span>` : '');
    const level = (v) => (v >= 85 ? 'Expert' : v >= 70 ? 'Advanced' : v >= 50 ? 'Intermediate' : 'Beginner');
    const row = (s, right) => `<div class="pf-skill"><div class="pf-skill-row"><span>${esc(s.name)}</span>${right}</div>`;
    let inner;
    if (d === 'tags') inner = `<div class="pf-tags pf-tags-lg">${items.map((s) => `<span class="pf-tag">${esc(s.name)}</span>`).join('')}</div>`;
    else if (d === 'cloud') inner = `<div class="pf-cloud">${items.map((s, i) => `<span style="font-size:${(0.9 + (s.v / 100) * 1.3).toFixed(2)}em" class="pf-cloud-${i % 3}">${esc(s.name)}</span>`).join('')}</div>`;
    else if (d === 'circles') inner = `<div class="pf-rings">${items.map((s) => `<div class="pf-ring"><div class="pf-ring-c" style="--v:${s.v}"><span>${show ? s.v + '%' : ''}</span></div><p>${esc(s.name)}</p></div>`).join('')}</div>`;
    else if (d === 'cards') inner = `<div class="pf-skcards">${items.map((s) => `<div class="pf-card pf-card-pad"><strong>${show ? s.v + '%' : level(s.v)}</strong><span>${esc(s.name)}</span><div class="pf-bar"><i style="width:${s.v}%"></i></div></div>`).join('')}</div>`;
    else if (d === 'icons') inner = `<div class="pf-stack-items">${items.map((s) => `<span class="pf-tech">${techIcon(s.name)}<span>${esc(s.name)}${show ? `<small class="pf-meta"> ${level(s.v)}</small>` : ''}</span></span>`).join('')}</div>`;
    else {
      inner = items.map((s) => {
        if (d === 'segments') return `${row(s, pct(s.v))}<div class="pf-segs">${Array.from({ length: 10 }, (_, i) => `<i${i < Math.round(s.v / 10) ? ' class="on"' : ''}></i>`).join('')}</div></div>`;
        if (d === 'dots') return `${row(s, `<span class="pf-dots">${Array.from({ length: 5 }, (_, i) => `<i${i < Math.round(s.v / 20) ? ' class="on"' : ''}></i>`).join('')}</span>`)}</div>`;
        if (d === 'stars') return `${row(s, `<span class="pf-sstars">${Array.from({ length: 5 }, (_, i) => `<i${i < Math.round(s.v / 20) ? ' class="on"' : ''}>★</i>`).join('')}</span>`)}</div>`;
        if (d === 'levels') return `${row(s, `<span class="pf-level pf-level-${level(s.v).toLowerCase()}">${level(s.v)}</span>`)}</div>`;
        return `${row(s, pct(s.v))}<div class="pf-bar${d === 'gradient' ? ' pf-bar-grad' : ''}"><i style="width:${s.v}%"></i></div></div>`;
      }).join('');
      inner = `<div class="pf-bars" style="--skc:${clamp(p.columns, 1, 4, 1)}">${inner}</div>`;
    }
    return `${h2(p.title)}<div class="pf-skills pf-skills-${d}${p.animate !== false ? ' pf-skanim' : ''}">${inner}</div>`;
  },

  projects: (p) => {
    const own = ['cards', 'overlay', 'minimal', 'list', 'zigzag', 'magazine', 'bento', 'carousel', 'numbered'];
    const pattern = !own.includes(p.layout) && TILE_PATTERNS[p.layout];
    const layout = pattern ? 'pattern' : word(p.layout, own, 'cards');
    const items = list(p.items);
    const all = [...new Set(items.flatMap((it) => csv(it.tags)))];
    const filters = p.filters && all.length > 1
      ? `<div class="pf-filters" role="toolbar" aria-label="Filter projects"><button type="button" class="pf-chip pf-on" data-filter="">All</button>${all.map((t) => `<button type="button" class="pf-chip" data-filter="${esc(t)}">${esc(t)}</button>`).join('')}</div>`
      : '';
    const cards = items.map((it, i) => {
      const tags = csv(it.tags);
      const href = it.url && it.url !== '#' ? it.url : '';
      const links = [
        href && p.linkText && `<a class="pf-plink" href="${safeUrl(href)}"${ext(href)}>${esc(p.linkText)} →</a>`,
        it.github && `<a class="pf-plink pf-plink-2" href="${safeUrl(it.github)}" target="_blank" rel="noopener">Code ↗</a>`,
      ].filter(Boolean).join('');
      const image = layout === 'numbered' ? '' : pic(it.image, { ratio: ['overlay', 'bento', 'pattern'].includes(layout) ? '' : p.ratio || '3/2', hover: p.hover ?? 'zoom' });
      const body = `<div class="pf-card-body">${layout === 'numbered' ? `<span class="pf-pnum">${String(i + 1).padStart(2, '0')}</span>` : ''}<div>${it.meta ? `<p class="pf-pmeta">${esc(it.meta)}</p>` : ''}<h3 class="pf-h4">${esc(it.title)}</h3>${it.desc ? `<p class="pf-meta">${nl(it.desc)}</p>` : ''}${p.showTags !== false ? tagList(tags) : ''}${links ? `<div class="pf-plinks">${links}</div>` : ''}</div></div>`;
      const whole = href && !links;
      const tag = whole ? 'a' : 'div';
      return `<${tag} class="pf-card pf-project"${whole ? ` href="${safeUrl(href)}"${ext(href)}` : ''} data-tags="${esc(tags.join('|'))}"${pattern ? ` style="${tile(pattern, i)}"` : ''}>${image}${body}</${tag}>`;
    }).join('');
    const c = pattern ? pattern[1] : Math.max(1, Math.min(4, Math.round(Number(p.columns) || 2)));
    return `${h2(p.title)}${filters}<div class="pf-projects pf-pl-${layout} pf-grid pf-cols-${c}${layout === 'carousel' ? ' pf-carousel' : ''}" style="--pr:${ratioVar(p.ratio || '3/2')};--pc:${c};--rowh:${clamp(p.rowH, 100, 600, 240)}px">${cards}</div>`;
  },

  about: (p) => {
    const v = word(p.variant, ['image-left', 'image-right', 'image-top', 'circle', 'overlap', 'boxed', 'centered'], 'image-left');
    const facts = fact(p.facts);
    const text = `<div class="pf-about-text">${h2(p.title)}<div class="pf-text">${nl(p.text)}</div>` +
      `${facts.length ? `<dl class="pf-facts">${facts.map((r) => `<div><dt>${esc(r[0].trim())}</dt><dd>${esc(r.slice(1).join(':').trim())}</dd></div>`).join('')}</dl>` : ''}` +
      `${p.signature ? `<p class="pf-signature">${esc(p.signature)}</p>` : ''}${p.buttonText ? `<div class="pf-actions">${btn(p.buttonText, p.buttonUrl)}</div>` : ''}</div>`;
    const image = p.image ? pic(p.image, { shape: v === 'circle' || v === 'centered' ? 'circle' : 'rounded', ratio: v === 'image-top' ? '21/9' : v === 'circle' || v === 'centered' ? '1/1' : '4/5', cls: 'pf-about-img' }) : '';
    return `<div class="pf-about pf-about-${v}${p.image ? '' : ' pf-about-noimg'}">${v === 'image-right' ? text + image : image + text}</div>`;
  },

  testimonials: (p) => {
    const v = word(p.variant, ['cards', 'single', 'carousel', 'masonry', 'bubbles', 'minimal'], 'cards');
    const items = list(p.items).slice(0, v === 'single' ? 1 : undefined);
    const card = (t) => `<figure class="pf-testimonial">${p.stars ? STARS : ''}<blockquote>${nl(t.quote)}</blockquote><figcaption>${t.avatar ? `<img src="${safeUrl(t.avatar)}" alt="" loading="lazy">` : ''}<span><strong>${esc(t.name)}</strong><br><span class="pf-meta">${esc(t.role)}</span></span></figcaption></figure>`;
    return `${h2(p.title)}<div class="pf-tm pf-tm-${v}${v === 'carousel' ? ' pf-carousel' : ''}">${items.map(card).join('')}</div>`;
  },

  services: (p) => {
    const v = word(p.variant, ['cards', 'numbered', 'icons', 'list', 'outline', 'gradient'], 'cards');
    const c = clamp(p.columns, 1, 4, 3);
    return `${h2(p.title)}<div class="pf-svc pf-svc-${v}" style="--sc:${c}">${list(p.items).map((s, i) => {
      const lead = v === 'numbered' ? `<span class="pf-svc-n">${String(i + 1).padStart(2, '0')}</span>` : (v === 'icons' || s.icon) ? `<span class="pf-svc-ic">${esc(s.icon || '✦')}</span>` : '';
      return `<div class="pf-svc-item">${lead}<div><h3 class="pf-h4">${esc(s.title)}</h3><p class="pf-meta">${nl(s.desc)}</p></div></div>`;
    }).join('')}</div>`;
  },

  stats: (p) => {
    const v = word(p.variant, ['plain', 'cards', 'divided', 'band', 'circles', 'left'], 'plain');
    return `<div class="pf-stats pf-stats-${v}"${p.countUp !== false ? ' data-countup' : ''}>${list(p.items).map((s) => `<div class="pf-stat"><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`).join('')}</div>`;
  },

  experience: (p) => {
    const v = word(p.variant, ['timeline', 'cards', 'center', 'compact', 'split', 'numbered'], 'timeline');
    return `${h2(p.title)}<ol class="pf-timeline pf-xp-${v}">${list(p.items).map((e, i) =>
      `<li>${v === 'numbered' ? `<span class="pf-xp-n">${String(i + 1).padStart(2, '0')}</span>` : ''}<div class="pf-xp-in"><p class="pf-meta">${esc(e.period)}</p><h3 class="pf-h4">${esc(e.role)}${e.company ? ` <span class="pf-at">at ${esc(e.company)}</span>` : ''}</h3>${e.desc ? `<p>${nl(e.desc)}</p>` : ''}</div></li>`
    ).join('')}</ol>`;
  },

  education: (p) => {
    const v = word(p.variant, ['list', 'cards', 'timeline', 'compact'], 'list');
    return `${h2(p.title)}<div class="pf-edu pf-edu-${v}">${list(p.items).map((e) => `<div class="pf-edu-item"><div><h3 class="pf-h4">${esc(e.degree)}</h3><p class="pf-meta">${esc(e.school)}</p></div><span class="pf-meta">${esc(e.period)}</span></div>`).join('')}</div>`;
  },

  contact: (p) => {
    const v = word(p.variant, ['split', 'centered', 'card', 'minimal', 'band'], 'split');
    const wa = String(p.whatsapp || '').replace(/\D/g, '');
    const info = [
      p.email && `<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>`,
      p.phone && `<a href="tel:${esc(String(p.phone).replace(/\s/g, ''))}">${esc(p.phone)}</a>`,
      wa && `<a href="https://wa.me/${wa}" target="_blank" rel="noopener">Chat on WhatsApp</a>`,
      p.address && `<span>${esc(p.address)}</span>`,
    ].filter(Boolean).join('');
    const form = p.showForm
      ? `<form class="pf-form" action="mailto:${esc(p.email)}" method="post" enctype="text/plain"><input class="pf-input" name="name" placeholder="Your name" required aria-label="Your name"><input class="pf-input" type="email" name="email" placeholder="Your email" required aria-label="Your email"><textarea class="pf-input" name="message" rows="5" placeholder="Your message" required aria-label="Your message"></textarea><button class="pf-btn pf-btn-primary" type="submit">Send message</button></form>`
      : '';
    return `<div class="pf-contact pf-contact-${v}${form ? '' : ' pf-contact-single'}"><div>${h2(p.title)}${p.text ? `<p class="pf-lead">${nl(p.text)}</p>` : ''}<div class="pf-contact-info">${info}</div></div>${form}</div>`;
  },

  cta: (p) => {
    const v = word(p.variant, ['banner', 'split', 'outline', 'gradient', 'image', 'minimal'], 'banner');
    const bg = v === 'image' && p.image ? ` style="--cta-img:url('${safeUrl(p.image)}')"` : '';
    return `<div class="pf-cta pf-cta-${v}"${bg}><div><h2 class="pf-h2">${esc(p.title)}</h2>${p.text ? `<p>${nl(p.text)}</p>` : ''}</div><div class="pf-actions">${btn(p.buttonText, p.buttonUrl)}</div></div>`;
  },

  pricing: (p) => {
    const v = word(p.variant, ['cards', 'bordered', 'minimal', 'dark', 'gradient'], 'cards');
    return `${h2(p.title)}<div class="pf-grid pf-cols-3 pf-price-${v}">${list(p.items).map((pl) =>
      `<div class="pf-card pf-card-pad pf-plan${pl.highlight ? ' pf-plan-hl' : ''}">${pl.highlight && v !== 'cards' ? '<span class="pf-plan-badge">Popular</span>' : ''}<h3 class="pf-h4">${esc(pl.name)}</h3><p class="pf-price">${esc(pl.price)}</p><ul>${String(pl.features || '').split('\n').filter(Boolean).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`
    ).join('')}</div>`;
  },

  faq: (p) => {
    const v = word(p.variant, ['accordion', 'twocol', 'cards', 'plus'], 'accordion');
    return `${h2(p.title)}<div class="pf-faq pf-faq-${v}">${list(p.items).map((q) => `<details><summary>${esc(q.q)}</summary><p>${nl(q.a)}</p></details>`).join('')}</div>`;
  },

  quote: (p) => {
    const v = word(p.variant, ['centered', 'mark', 'card', 'bar', 'highlight'], 'centered');
    return `<blockquote class="pf-quote pf-quote-${v}"><p>${nl(p.text)}</p>${p.author ? `<cite>${esc(p.author)}</cite>` : ''}</blockquote>`;
  },

  links: (p) => {
    const v = word(p.variant, ['outline', 'filled', 'soft', 'shadow', 'pill', 'gradient'], 'outline');
    return `<div class="pf-linklist pf-ll-${v}">${list(p.items).map((l) => `<a class="pf-linkitem" href="${safeUrl(l.url)}"${ext(l.url)}>${esc(l.label)}${l.note ? `<small>${esc(l.note)}</small>` : ''}</a>`).join('')}</div>`;
  },

  social: (p) => {
    const v = word(p.variant, ['pills', 'circles', 'squares', 'text', 'buttons', 'outline'], 'pills');
    return `<div class="pf-social pf-social-${v}">${list(p.items).map((s) => {
      const href = s.platform === 'Email' && s.url && !s.url.startsWith('mailto:') ? 'mailto:' + s.url : s.url;
      return `<a class="pf-social-item" href="${safeUrl(href)}"${ext(href)} aria-label="${esc(s.platform)}"><b>${esc(SOCIAL_SHORT[s.platform] || '•')}</b><span>${esc(s.platform)}</span></a>`;
    }).join('')}</div>`;
  },

  logos: (p) => {
    const v = word(p.variant, ['row', 'color', 'marquee', 'boxed'], 'row');
    const imgs = list(p.items).filter((i) => i.src).map((i) => `<img src="${safeUrl(i.src)}" alt="${esc(i.name)}" loading="lazy">`).join('');
    const inner = v === 'marquee' ? `<div class="pf-marquee"><div>${imgs}${imgs.replace(/alt="[^"]*"/g, 'alt="" aria-hidden="true"')}</div></div>` : imgs;
    return `${p.title ? `<p class="pf-meta pf-logos-title">${esc(p.title)}</p>` : ''}<div class="pf-logos pf-logos-${v}">${inner}</div>`;
  },

  footer: (p) => {
    const v = word(p.variant, ['simple', 'centered', 'big', 'split', 'line'], 'simple');
    const links = list(p.links).length ? `<nav class="pf-flinks">${list(p.links).map((l) => `<a href="${safeUrl(l.url)}"${ext(l.url)}>${esc(l.label)}</a>`).join('')}</nav>` : '';
    return `<footer class="pf-footer pf-footer-${v}">${v === 'big' ? `<p class="pf-fbig">${esc(p.bigText || p.text)}</p>` : ''}<div class="pf-fline"><span>${nl(p.text)}</span>${links}</div></footer>`;
  },
};

// ---------- CSS ----------
const H = ':is(h1,h2,h3,h4,.pf-h1,.pf-h2,.pf-h3,.pf-h4)';
const MAIN = ':is(.pf-h1,.pf-h2)';
const mask = (d) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'><path d='${d}'/></svg>`)}")`;
const DIVIDERS = {
  wave: 'M0,64 C300,130 900,-10 1200,64 L1200,120 L0,120 Z',
  slant: 'M0,120 L1200,0 L1200,120 Z',
  curve: 'M0,0 Q600,170 1200,0 L1200,120 L0,120 Z',
  triangle: 'M0,0 L600,110 L1200,0 L1200,120 L0,120 Z',
  zigzag: 'M0,70 L100,30 L200,70 L300,30 L400,70 L500,30 L600,70 L700,30 L800,70 L900,30 L1000,70 L1100,30 L1200,70 L1200,120 L0,120 Z',
};

export const STYLE_CSS = `
.pf-section{font-family:var(--pf-bfont);font-size:calc(var(--pf-base) * var(--b-scale,1));line-height:var(--b-line,1.65);font-weight:var(--b-weight,400)}
.pf-section>.pf-container{position:relative;z-index:1}
.pf-w-wide .pf-container{max-width:calc(var(--pf-max) + 260px)}
.pf ${H}{line-height:var(--t-line,1.12);color:var(--t-color,inherit);font-style:var(--t-style,normal)}

/* title effects */
.pf-tgrad ${H}{background:var(--t-grad);-webkit-background-clip:text;background-clip:text;color:transparent!important}
.pf-tsh-soft ${H}{text-shadow:0 2px 14px rgba(0,0,0,.25)}
.pf-tsh-hard ${H}{text-shadow:3px 3px 0 rgba(0,0,0,.3)}
.pf-tsh-glow ${H}{text-shadow:0 0 22px color-mix(in srgb,var(--pf-primary) 75%,transparent)}
.pf-tsh-neon ${H}{text-shadow:0 0 4px #fff,0 0 12px var(--pf-primary),0 0 30px var(--pf-primary)}
.pf-tsh-long ${H}{text-shadow:1px 1px 0 rgba(0,0,0,.12),2px 2px 0 rgba(0,0,0,.11),3px 3px 0 rgba(0,0,0,.1),4px 4px 0 rgba(0,0,0,.09),5px 5px 0 rgba(0,0,0,.08),6px 6px 0 rgba(0,0,0,.07),7px 7px 0 rgba(0,0,0,.06),8px 8px 0 rgba(0,0,0,.05)}
.pf-tsh-outline ${H}{-webkit-text-stroke:1.5px var(--t-color,currentColor);color:transparent!important}
.pf-tsh-3d ${H}{text-shadow:1px 1px 0 var(--pf-primary),2px 2px 0 var(--pf-primary),3px 3px 0 var(--pf-primary),4px 4px 0 color-mix(in srgb,var(--pf-primary) 70%,#000)}
.pf-tsh-lifted ${H}{text-shadow:0 1px 0 rgba(255,255,255,.4),0 14px 24px rgba(0,0,0,.28)}
.pf-tdec-underline ${MAIN}{text-decoration:underline;text-decoration-color:var(--pf-primary);text-decoration-thickness:.08em;text-underline-offset:.16em}
.pf-tdec-wavy ${MAIN}{text-decoration:underline wavy var(--pf-primary);text-decoration-thickness:.05em;text-underline-offset:.2em}
.pf-tdec-marker ${MAIN}{display:inline;background:linear-gradient(transparent 62%,color-mix(in srgb,var(--pf-secondary) 55%,transparent) 62%);box-decoration-break:clone;-webkit-box-decoration-break:clone}
.pf-tdec-marker ${MAIN}::after{content:'';display:block;margin-bottom:.5em}
.pf-tdec-bar ${MAIN}{border-left:.12em solid var(--pf-primary);padding-left:.4em}
.pf-tdec-dot ${MAIN}::after{content:'.';color:var(--pf-primary)}
.pf-tdec-overline ${MAIN}::before{content:'';display:block;width:56px;height:4px;border-radius:4px;background:var(--pf-primary);margin-bottom:.5em}
.pf-align-center.pf-tdec-overline ${MAIN}::before{margin-inline:auto}
.pf-tdec-pill ${MAIN}{display:inline-block;padding:.1em .55em;border-radius:999px;background:color-mix(in srgb,var(--pf-primary) 14%,transparent)}

/* buttons */
.pf-bsh-square .pf-btn{border-radius:0}.pf-bsh-rounded .pf-btn{border-radius:10px}.pf-bsh-pill .pf-btn{border-radius:999px}
.pf-bs-sm .pf-btn{font-size:.85em;padding:.55em 1.1em}.pf-bs-lg .pf-btn{font-size:1.12em;padding:.95em 1.9em}.pf-bs-xl .pf-btn{font-size:1.3em;padding:1.05em 2.3em}
.pf-bl-gradient .pf-btn-primary{background:${GRADIENTS.brand};border-color:transparent}
.pf-bl-glow .pf-btn-primary{box-shadow:0 10px 30px -6px color-mix(in srgb,var(--pf-primary) 70%,transparent)}
.pf-bl-pop .pf-btn{box-shadow:0 5px 0 color-mix(in srgb,var(--pf-primary) 55%,#000)}.pf-bl-pop .pf-btn:hover{transform:translateY(3px);box-shadow:0 2px 0 color-mix(in srgb,var(--pf-primary) 55%,#000)}
.pf-bl-outline .pf-btn-primary{background:transparent;color:var(--pf-primary)!important}
.pf-bl-glass .pf-btn{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.4);color:inherit!important;backdrop-filter:blur(8px)}
.pf-bl-link .pf-btn{background:none;border:0;padding:.2em 0;color:var(--pf-primary)!important;text-decoration:underline;text-underline-offset:.25em}
.pf-bl-brutal .pf-btn{border:2px solid #111;border-radius:0;background:var(--pf-secondary);color:#111!important;box-shadow:4px 4px 0 #111}

/* section background patterns */
.pf-section[class*="pf-spat-"]::before{content:'';position:absolute;inset:0;pointer-events:none;opacity:.7}
.pf-spat-dots::before{background-image:radial-gradient(var(--pf-border) 1.3px,transparent 1.3px);background-size:22px 22px}
.pf-spat-grid::before{background-image:linear-gradient(var(--pf-border) 1px,transparent 1px),linear-gradient(90deg,var(--pf-border) 1px,transparent 1px);background-size:40px 40px}
.pf-spat-lines::before{background-image:repeating-linear-gradient(45deg,var(--pf-border) 0 1px,transparent 1px 14px)}
.pf-spat-cross::before{background-image:radial-gradient(circle,transparent 9px,transparent 9px),linear-gradient(var(--pf-border) 2px,transparent 2px),linear-gradient(90deg,var(--pf-border) 2px,transparent 2px);background-size:36px 36px;background-position:center;opacity:.35}
.pf-spat-noise::before{background-image:url("data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='.35'/></svg>")}");opacity:.4}

/* content boxes */
.pf-section[class*="pf-box-"]>.pf-container{padding:clamp(24px,4cqi,56px);border-radius:var(--box-r,18px);width:calc(100% - 32px)}
.pf-box-card>.pf-container{background:var(--pf-surface);border:1px solid var(--pf-border)}
.pf-box-glass>.pf-container{background:color-mix(in srgb,var(--pf-surface) 55%,transparent);border:1px solid color-mix(in srgb,#fff 30%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.pf-box-outline>.pf-container{border:2px solid color-mix(in srgb,var(--pf-text) 18%,transparent)}
.pf-box-raised>.pf-container{background:var(--pf-surface);box-shadow:0 20px 50px -20px rgba(0,0,0,.35)}
.pf-box-float>.pf-container{background:var(--pf-surface);box-shadow:0 40px 90px -30px rgba(0,0,0,.45);transform:translateY(-6px)}
.pf-box-inset>.pf-container{background:color-mix(in srgb,var(--pf-text) 4%,transparent);box-shadow:inset 0 2px 12px rgba(0,0,0,.08)}
.pf-box-gradient>.pf-container{border:2px solid transparent;background:linear-gradient(var(--pf-surface),var(--pf-surface)) padding-box,${GRADIENTS.brand} border-box}
.pf-section.pf-shd-none>.pf-container{box-shadow:none}
.pf-section.pf-shd-sm>.pf-container{box-shadow:0 4px 14px rgba(0,0,0,.1)}
.pf-section.pf-shd-lg>.pf-container{box-shadow:0 30px 70px -25px rgba(0,0,0,.45)}
.pf-section.pf-shd-glow>.pf-container{box-shadow:0 0 50px color-mix(in srgb,var(--pf-primary) 35%,transparent)}
.pf-section.pf-shd-color>.pf-container{box-shadow:16px 16px 0 color-mix(in srgb,var(--pf-primary) 30%,transparent)}

/* entrance animations */
.pf-anim .pf-section.pf-an-fade{transform:none}
.pf-anim .pf-section.pf-an-zoom{transform:scale(.94)}
.pf-anim .pf-section.pf-an-left{transform:translateX(-48px)}
.pf-anim .pf-section.pf-an-right{transform:translateX(48px)}
.pf-anim .pf-section.pf-an-flip{transform:perspective(1200px) rotateX(14deg);transform-origin:top}
.pf-anim .pf-section.pf-an-blur{filter:blur(12px);transform:none;transition:opacity .8s ease,filter .8s ease}
.pf-anim .pf-section.pf-an-none{opacity:1;transform:none;transition:none}
.pf-anim .pf-section.pf-in{transform:none;filter:none}
.pf-section{overflow-x:clip}

/* bottom edge shapes */
.pf-section[class*="pf-div-"]{padding-bottom:calc(var(--pf-space) / 2 + 50px)}
.pf-section[class*="pf-div-"]::after{content:'';position:absolute;left:0;right:0;bottom:-1px;height:60px;background:var(--pf-bg);z-index:2;pointer-events:none;-webkit-mask-size:100% 100%;mask-size:100% 100%}
${Object.entries(DIVIDERS).map(([k, d]) => `.pf-div-${k}::after{-webkit-mask-image:${mask(d)};mask-image:${mask(d)}}`).join('\n')}

/* curved edge shapes and background decor (lib/shapes.js) */
.pf-section{--eh-k:1}
.pf-section.pf-has-et{padding-top:calc(var(--pf-space) / 2 + var(--eh-t) * var(--eh-k))}
.pf-section.pf-has-eb{padding-bottom:calc(var(--pf-space) / 2 + var(--eh-b) * var(--eh-k))}
.pf-edge{position:absolute;left:0;right:0;color:var(--pf-bg);pointer-events:none;z-index:2;line-height:0}
.pf-edge svg{display:block;width:100%;height:100%}
.pf-edge-t{top:-1px;height:calc(var(--eh-t) * var(--eh-k))}.pf-edge-t svg{transform:scaleY(-1)}
.pf-edge-b{bottom:-1px;height:calc(var(--eh-b) * var(--eh-k))}
.pf-edge-flip svg{transform:scaleX(-1)}.pf-edge-t.pf-edge-flip svg{transform:scale(-1,-1)}
.pf-section.pf-has-decor{overflow:clip}
.pf-decor{position:absolute;width:var(--dz);height:var(--dz);opacity:var(--do);color:var(--pf-primary);pointer-events:none;z-index:0;line-height:0}
.pf-decor svg{width:100%;height:100%;display:block}
.pf-decor-tr{top:calc(var(--dz) * -.28);right:calc(var(--dz) * -.22)}
.pf-decor-tl{top:calc(var(--dz) * -.28);left:calc(var(--dz) * -.22)}
.pf-decor-br{bottom:calc(var(--dz) * -.28);right:calc(var(--dz) * -.22)}
.pf-decor-bl{bottom:calc(var(--dz) * -.28);left:calc(var(--dz) * -.22)}.pf-decor-bl svg{transform:rotate(180deg)}
.pf-decor-center{top:50%;left:50%;margin:calc(var(--dz) / -2) 0 0 calc(var(--dz) / -2)}
.pf-decor-move svg{animation:pf-decor-float 14s ease-in-out infinite alternate}
.pf-decor-bl.pf-decor-move svg{animation-name:pf-decor-float-r}
@keyframes pf-decor-float{from{transform:translate(0,0) rotate(0)}to{transform:translate(-4%,6%) rotate(14deg)}}
@keyframes pf-decor-float-r{from{transform:rotate(180deg)}to{transform:translate(4%,-6%) rotate(194deg)}}
@container (max-width:680px){
  .pf-section{--eh-k:.55}
  .pf-section.pf-has-et{padding-top:calc(var(--pf-space) / 3 + var(--eh-t) * var(--eh-k))}
  .pf-section.pf-has-eb{padding-bottom:calc(var(--pf-space) / 3 + var(--eh-b) * var(--eh-k))}
  .pf-decor{width:calc(var(--dz) * .6);height:calc(var(--dz) * .6)}
}
@media (prefers-reduced-motion:reduce){.pf-decor-move svg{animation:none}}

/* pictures */
.pf-pic{position:relative;display:block;overflow:hidden;border-radius:inherit}
.pf-pic img{width:100%;height:100%;display:block;object-fit:cover;object-position:var(--fp,center);transition:transform .6s ease,filter .4s ease}
.pf-pic[style*="--r"]{aspect-ratio:var(--r)}
.pf-pic[style*="--r"] img{position:absolute;inset:0}
.pf-fx-grayscale img{filter:grayscale(1)}.pf-fx-sepia img{filter:sepia(.8)}.pf-fx-vintage img{filter:sepia(.4) contrast(1.1) saturate(.8) brightness(1.05)}
.pf-fx-warm img{filter:sepia(.25) saturate(1.35) hue-rotate(-8deg)}.pf-fx-cool img{filter:saturate(1.1) hue-rotate(14deg) brightness(1.04)}
.pf-fx-vivid img{filter:saturate(1.6) contrast(1.1)}.pf-fx-fade img{filter:contrast(.85) brightness(1.1) saturate(.7)}.pf-fx-moody img{filter:brightness(.78) contrast(1.2) saturate(.8)}
.pf-hv-zoom:hover img,a:hover>.pf-hv-zoom img,.pf-project:hover .pf-hv-zoom img{transform:scale(1.06)}
.pf-hv-lift{transition:transform .25s,box-shadow .25s}.pf-hv-lift:hover,.pf-project:hover .pf-hv-lift{transform:translateY(-6px);box-shadow:0 22px 40px -18px rgba(0,0,0,.45)}
.pf-hv-color img{filter:grayscale(1)}.pf-hv-color:hover img,.pf-project:hover .pf-hv-color img{filter:none}
.pf-hv-tilt{transition:transform .3s}.pf-hv-tilt:hover{transform:rotate(-1.5deg) scale(1.02)}
.pf-hv-shine::after{content:'';position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.45) 50%,transparent 70%);transform:translateX(-120%);transition:transform .8s}
.pf-hv-shine:hover::after{transform:translateX(120%)}
.pf-hv-darken::after{content:'';position:absolute;inset:0;background:#000;opacity:0;transition:opacity .3s}.pf-hv-darken:hover::after{opacity:.35}
.pf-shp-rounded{border-radius:var(--pf-radius)}.pf-shp-square{border-radius:0}
.pf-shp-circle{border-radius:50%;aspect-ratio:1}.pf-shp-circle img{position:absolute;inset:0}
.pf-shp-blob{border-radius:42% 58% 63% 37%/41% 44% 56% 59%}
.pf-shp-arch{border-radius:999px 999px var(--pf-radius) var(--pf-radius)}
.pf-shp-tilted{border-radius:var(--pf-radius);transform:rotate(-3deg)}
.pf-shp-curved{border-radius:clamp(24px,4cqi,48px)}.pf-shp-pill{border-radius:999px}.pf-shp-leaf{border-radius:0 clamp(40px,8cqi,90px)}
.pf-shp-hexagon{border-radius:0;clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)}
.pf-shp-diamond{border-radius:0;clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%)}

/* image block */
.pf-figure{margin:0 auto}
.pf-img-left{margin-left:0}.pf-img-right{margin-right:0}
.pf-figure-in{position:relative;border-radius:inherit}
.pf-figure figcaption{color:var(--pf-muted);font-size:.9em;text-align:center;margin-top:10px}
.pf-figure .pf-cap-overlay,.pf-figure .pf-cap-hover{position:absolute;left:0;right:0;bottom:0;margin:0;padding:14px 16px;color:#fff;text-align:left;background:linear-gradient(transparent,rgba(0,0,0,.7));border-radius:0 0 var(--pf-radius) var(--pf-radius);pointer-events:none}
.pf-figure .pf-cap-hover{opacity:0;transition:opacity .3s}.pf-figure:hover .pf-cap-hover{opacity:1}
.pf-frame-border .pf-figure-in{padding:8px;border:1px solid var(--pf-border);background:var(--pf-surface);border-radius:calc(var(--pf-radius) + 8px)}
.pf-frame-polaroid{background:#fff;padding:12px 12px 14px;box-shadow:0 18px 40px -18px rgba(0,0,0,.4);transform:rotate(-1.5deg)}
.pf-frame-polaroid .pf-pic{border-radius:0}.pf-frame-polaroid figcaption{color:#333;font-family:'Caveat','Segoe Print',cursive;font-size:1.2em}
.pf-frame-shadow .pf-pic{box-shadow:0 24px 50px -20px rgba(0,0,0,.45)}
.pf-frame-shade .pf-pic::before{content:'';position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(180deg,transparent 30%,rgba(0,0,0,.7))}
.pf-frame-fade .pf-pic{-webkit-mask-image:radial-gradient(ellipse at center,#000 50%,transparent 78%);mask-image:radial-gradient(ellipse at center,#000 50%,transparent 78%)}
.pf-frame-glow .pf-pic{box-shadow:0 0 0 1px color-mix(in srgb,var(--pf-primary) 40%,transparent),0 24px 70px -12px color-mix(in srgb,var(--pf-primary) 65%,transparent)}
.pf-frame-sticker .pf-pic{border:10px solid #fff;box-shadow:0 14px 34px -12px rgba(0,0,0,.45);transform:rotate(-2deg)}
.pf-frame-float .pf-pic{box-shadow:0 50px 90px -30px rgba(0,0,0,.55);transform:translateY(-8px)}
.pf-frame-offset .pf-figure-in::before{content:'';position:absolute;inset:0;transform:translate(16px,16px);border:2px solid var(--pf-primary);border-radius:var(--pf-radius);z-index:-1}
.pf-frame-offset .pf-figure-in{z-index:0;margin:0 16px 16px 0}
.pf-frame-browser{border:1px solid var(--pf-border);border-radius:calc(var(--pf-radius) + 2px);overflow:hidden;background:var(--pf-surface);box-shadow:0 30px 60px -30px rgba(0,0,0,.4)}
.pf-frame-browser .pf-pic{border-radius:0}
.pf-frame-bar{display:flex;gap:6px;padding:10px 12px;border-bottom:1px solid var(--pf-border);background:var(--pf-surface)}
.pf-frame-bar i{width:10px;height:10px;border-radius:50%;background:#FF5F57}.pf-frame-bar i:nth-child(2){background:#FEBC2E}.pf-frame-bar i:nth-child(3){background:#28C840}
.pf-frame-phone{max-width:min(320px,100%)!important;padding:10px;background:#111;border-radius:44px;box-shadow:0 40px 80px -30px rgba(0,0,0,.6)}
.pf-frame-phone .pf-pic{border-radius:34px}

/* navigation */
.pf-nav-cta{padding:.55em 1.2em;font-size:.9em}
.pf-sticky{position:sticky;top:0;z-index:60;background:var(--pf-bg);transition:box-shadow .2s,padding .2s}
.pf-sticky.pf-scrolled{box-shadow:0 8px 30px -12px rgba(0,0,0,.3)}
.pf-nav-centered{flex-direction:column;gap:12px}.pf-nav-centered .pf-nav-links{justify-content:center}
.pf-nav-pill{background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:999px;padding:10px 12px 10px 24px;box-shadow:0 10px 30px -15px rgba(0,0,0,.3)}
.pf-nav-glass{background:color-mix(in srgb,var(--pf-bg) 65%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid color-mix(in srgb,var(--pf-border) 70%,transparent);border-radius:calc(var(--pf-radius) + 4px);padding:10px 18px}
.pf-sticky:has(.pf-nav-glass){background:transparent}
.pf-nav-underline .pf-nav-links a{position:relative;padding:4px 0}
.pf-nav-underline .pf-nav-links a::after{content:'';position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--pf-primary);transform:scaleX(0);transform-origin:left;transition:transform .25s}
.pf-nav-underline .pf-nav-links a:hover::after{transform:scaleX(1)}
.pf-nav-boxed{border:1px solid var(--pf-border);border-radius:var(--pf-radius);padding:12px 20px}
.pf-nav-bold{background:var(--pf-primary);color:var(--pf-on-primary);border-radius:var(--pf-radius);padding:12px 22px}
.pf-nav-bold .pf-nav-links a{color:var(--pf-on-primary);opacity:.85}.pf-nav-bold .pf-nav-links a:hover{opacity:1;color:var(--pf-on-primary)}
.pf-nav-bold .pf-nav-cta{background:var(--pf-on-primary);color:var(--pf-primary)!important;border-color:var(--pf-on-primary)}
.pf-nav-minimal .pf-burger{display:block;width:40px;height:40px;cursor:pointer;position:relative;order:3}
.pf-nav-minimal .pf-burger span,.pf-nav-minimal .pf-burger span::before,.pf-nav-minimal .pf-burger span::after{content:'';position:absolute;left:9px;right:9px;height:2px;background:currentColor;border-radius:2px}
.pf-nav-minimal .pf-burger span{top:19px}.pf-nav-minimal .pf-burger span::before{top:-7px;left:0;right:0}.pf-nav-minimal .pf-burger span::after{top:7px;left:0;right:0}
.pf-nav-minimal .pf-nav-links{display:none;position:absolute;top:100%;right:0;min-width:220px;flex-direction:column;gap:0;background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:var(--pf-radius);padding:8px;z-index:20;box-shadow:0 20px 40px -20px rgba(0,0,0,.35)}
.pf-nav-minimal .pf-nav-links a{padding:10px 12px}
.pf-nav-minimal .pf-menu-toggle:checked ~ .pf-nav-links{display:flex}
.pf-nav-minimal .pf-nav-cta{margin-left:auto}

/* hero */
.pf-hero{position:relative}
.pf-hh-tall{min-height:72vh;align-content:center}.pf-hh-screen{min-height:calc(100vh - 110px);align-content:center}
.pf-hero-media .pf-pic{aspect-ratio:4/5}
.pf-hero-center .pf-hero-media .pf-pic{aspect-ratio:16/8}
.pf-hm-rounded .pf-pic{border-radius:var(--pf-radius)}.pf-hm-square .pf-pic{border-radius:0}
.pf-hm-circle .pf-pic{border-radius:50%;aspect-ratio:1!important;max-width:460px;margin:auto}
.pf-hm-blob .pf-pic{border-radius:42% 58% 63% 37%/41% 44% 56% 59%;aspect-ratio:1!important;max-width:520px;margin:auto}
.pf-hero-center .pf-hm-arch .pf-pic,.pf-hero-center .pf-hm-tilted .pf-pic,.pf-hero-center .pf-hm-frame .pf-pic{max-width:760px;margin:auto}
.pf-hero-cover .pf-avail,.pf-hero-gradient .pf-avail,.pf-hero-video .pf-avail{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.35);color:#fff}
.pf-hm-arch .pf-pic{border-radius:999px 999px var(--pf-radius) var(--pf-radius)}
.pf-hm-tilted .pf-pic{border-radius:var(--pf-radius);transform:rotate(3deg);box-shadow:0 30px 60px -25px rgba(0,0,0,.4)}
.pf-hm-frame{position:relative}.pf-hm-frame::before{content:'';position:absolute;inset:0;transform:translate(18px,18px);border:2px solid var(--pf-primary);border-radius:var(--pf-radius)}
.pf-hm-frame .pf-pic{position:relative;border-radius:var(--pf-radius)}
.pf-hero-cover{background:linear-gradient(rgba(0,0,0,var(--ov,.5)),rgba(0,0,0,var(--ov,.5))),var(--hero-img) center/cover}
.pf-hero-gradient{grid-template-columns:1fr;text-align:center;background:var(--hg);color:#fff;border-radius:calc(var(--pf-radius) * 1.5);padding:clamp(70px,12cqi,160px) 24px}
.pf-hero-gradient .pf-hero-text{max-width:860px;margin:0 auto}.pf-hero-gradient .pf-actions{justify-content:center}.pf-hero-gradient .pf-lead{color:rgba(255,255,255,.88);margin-inline:auto}
.pf-hero-gradient .pf-kicker{color:#fff;opacity:.85}.pf-hero-gradient .pf-btn-primary{background:#fff;color:#111!important;border-color:#fff}.pf-hero-gradient .pf-btn-ghost{color:#fff!important;border-color:rgba(255,255,255,.6)}
.pf-hero-minimal{grid-template-columns:1fr}.pf-hero-minimal .pf-h1{font-size:calc(clamp(3rem,10cqi,8.5rem) * var(--t-scale,1));line-height:.98}.pf-hero-minimal .pf-lead{font-size:1.35em}
.pf-hero-card{grid-template-columns:1fr;min-height:560px;align-items:end;padding:clamp(24px,5cqi,56px);border-radius:calc(var(--pf-radius) * 1.5);background:linear-gradient(rgba(0,0,0,var(--ov,.3)),rgba(0,0,0,var(--ov,.3))),var(--hero-img,var(--pf-surface)) center/cover}
.pf-hero-card .pf-hero-text{max-width:560px;background:var(--pf-surface);color:var(--pf-text);padding:clamp(24px,4cqi,44px);border-radius:var(--pf-radius);box-shadow:0 30px 60px -20px rgba(0,0,0,.45)}
.pf-hero-video{grid-template-columns:1fr;text-align:center;color:#fff;overflow:hidden;border-radius:calc(var(--pf-radius) * 1.5);padding:clamp(80px,14cqi,180px) 24px;background:#111}
.pf-hero-video>video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.pf-hero-video::before{content:'';position:absolute;inset:0;background:rgba(0,0,0,var(--ov,.5));z-index:1}
.pf-hero-video .pf-hero-text{position:relative;z-index:2;max-width:860px;margin:0 auto}.pf-hero-video .pf-actions{justify-content:center}.pf-hero-video .pf-lead{color:rgba(255,255,255,.85);margin-inline:auto}
.pf-hero-video .pf-btn-ghost{color:#fff!important;border-color:rgba(255,255,255,.6)}
.pf-hero-collage{display:grid;grid-template-columns:1.2fr 1fr;grid-template-rows:1fr 1fr;gap:14px;aspect-ratio:1}
.pf-hero-collage .pf-pic{border-radius:var(--pf-radius);height:100%}.pf-hero-collage .pf-pic img{position:absolute;inset:0}.pf-hero-collage .pf-pic:first-child{grid-row:span 2}
.pf-hc-square .pf-pic{border-radius:0}.pf-hc-circle .pf-pic{border-radius:50%}.pf-hc-arch .pf-pic{border-radius:999px 999px var(--pf-radius) var(--pf-radius)}.pf-hc-blob .pf-pic{border-radius:42% 58% 63% 37%/41% 44% 56% 59%}.pf-hc-tilted .pf-pic:nth-child(2){transform:rotate(3deg)}.pf-hc-tilted .pf-pic:nth-child(3){transform:rotate(-3deg)}
.pf-rotate{color:var(--pf-primary);white-space:nowrap}
.pf-rotate::after{content:'';display:inline-block;width:.06em;height:.9em;margin-left:.06em;background:currentColor;vertical-align:-.08em;animation:pf-blink 1s steps(1) infinite}
@keyframes pf-blink{50%{opacity:0}}
.pf-scroll{position:absolute;left:50%;bottom:-8px;transform:translateX(-50%);width:42px;height:42px;border-radius:50%;border:1px solid currentColor;background:transparent;color:inherit;cursor:pointer;font-size:1.1em;opacity:.7;animation:pf-bob 1.8s ease-in-out infinite;z-index:3}
@keyframes pf-bob{50%{transform:translate(-50%,6px)}}

/* gallery */
.pf-gallery{gap:var(--gap,12px)}
.pf-gallery-item{border-radius:var(--gr,var(--pf-radius))}
.pf-gc-square{--gr:0}.pf-gc-round{--gr:16px}.pf-gc-xl{--gr:32px}
.pf-gallery-item .pf-pic{border-radius:inherit}
.pf-gallery-masonry .pf-gallery-item{margin-bottom:var(--gap,12px)}.pf-gallery-masonry{column-gap:var(--gap,12px)}
.pf-gcap{position:absolute;inset:auto 0 0 0;padding:10px 12px;background:linear-gradient(transparent,rgba(0,0,0,.72));color:#fff;font-size:.85em;z-index:2}
.pf-gcap-hover .pf-gcap{opacity:0;transition:opacity .3s}.pf-gcap-hover .pf-gallery-item:hover .pf-gcap{opacity:1}
.pf-gcap-below .pf-gcap{position:static;background:none;color:var(--pf-muted);padding:8px 2px 0}
.pf-gcap-below .pf-gallery-item{overflow:visible;border-radius:0}.pf-gcap-below .pf-gallery-item .pf-pic{border-radius:var(--gr,var(--pf-radius))}
.pf-gallery-mosaic{grid-auto-flow:dense}.pf-gallery-mosaic .pf-gallery-item:nth-child(6n+1){grid-column:span 2;grid-row:span 2}
.pf-gallery-mosaic .pf-gallery-item .pf-pic{height:100%}
.pf-carousel{display:flex!important;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:thin;padding-bottom:8px;columns:auto!important}
.pf-carousel>*{scroll-snap-align:start;flex:0 0 calc((100% - (var(--cols,3) - 1) * var(--gap,16px)) / var(--cols,3));min-width:240px}
.pf-gallery-filmstrip>*{flex:0 0 auto;min-width:0;height:340px}.pf-gallery-filmstrip .pf-pic{height:100%}.pf-gallery-filmstrip .pf-pic img{width:auto;height:100%}
.pf-gallery-polaroid .pf-gallery-item{background:#fff;padding:10px 10px 0;box-shadow:0 14px 30px -14px rgba(0,0,0,.4);border-radius:2px;overflow:visible}
.pf-gallery-polaroid .pf-gallery-item:nth-child(odd){transform:rotate(-2deg)}.pf-gallery-polaroid .pf-gallery-item:nth-child(even){transform:rotate(1.6deg)}
.pf-gallery-polaroid .pf-gallery-item:hover{transform:rotate(0) scale(1.03);z-index:2}
.pf-gallery-polaroid .pf-pic{border-radius:0}.pf-gallery-polaroid .pf-gcap{position:static;background:none;color:#333;text-align:center;font-family:'Caveat','Segoe Print',cursive;font-size:1.1em;padding:8px 4px;opacity:1}
.pf-gallery-polaroid .pf-gallery-item{padding-bottom:10px}
.pf-gallery-justified{display:flex;flex-wrap:wrap}
.pf-gallery-justified .pf-gallery-item{flex:1 1 260px;height:260px}.pf-gallery-justified .pf-gallery-item:nth-child(3n+2){flex-basis:380px}.pf-gallery-justified .pf-gallery-item:nth-child(4n){flex-basis:200px}
.pf-gallery-justified .pf-pic{height:100%}
.pf-gallery-circles .pf-gallery-item{border-radius:50%}.pf-gallery-circles .pf-gcap{text-align:center;border-radius:0 0 50% 50%}
.pf-car-nav{display:flex;gap:8px;justify-content:flex-end;margin-top:10px}
.pf-car-nav button{width:40px;height:40px;border-radius:50%;border:1px solid var(--pf-border);background:var(--pf-surface);color:var(--pf-text);cursor:pointer;font-size:1.1em}

/* video */
.pf-embed{aspect-ratio:var(--vr,16/9)}
.pf-vframe-card{padding:12px;background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:calc(var(--pf-radius) + 10px);box-shadow:0 20px 50px -24px rgba(0,0,0,.4)}
.pf-vframe-browser{border:1px solid var(--pf-border);border-radius:calc(var(--pf-radius) + 2px);overflow:hidden;box-shadow:0 30px 60px -30px rgba(0,0,0,.45)}.pf-vframe-browser .pf-embed{border-radius:0}
.pf-vframe-phone{max-width:340px;margin:0 auto;padding:12px;background:#111;border-radius:46px;box-shadow:0 40px 80px -30px rgba(0,0,0,.6)}.pf-vframe-phone .pf-embed{border-radius:34px}
.pf-vframe-laptop{max-width:900px;margin:0 auto;padding:14px 14px 18px;background:#1b1b1f;border-radius:18px 18px 0 0}.pf-vframe-laptop .pf-embed{border-radius:4px}
.pf-laptop-base{height:16px;margin:0 -60px;background:linear-gradient(#cfd2d8,#9fa3ab);border-radius:0 0 18px 18px}
.pf-vframe-cinema{background:#000;padding:clamp(16px,4cqi,48px) 0;border-radius:var(--pf-radius)}.pf-vframe-cinema .pf-embed{border-radius:0}
.pf-vframe-float{transform:perspective(1400px) rotateY(-8deg) rotateX(4deg);box-shadow:30px 40px 80px -30px rgba(0,0,0,.55);border-radius:var(--pf-radius)}
.pf-vframe-glow .pf-embed{box-shadow:0 0 0 1px color-mix(in srgb,var(--pf-primary) 50%,transparent),0 0 70px color-mix(in srgb,var(--pf-primary) 45%,transparent)}
.pf-vcap{text-align:center;margin-top:10px}
.pf-vside{display:grid;grid-template-columns:1.4fr 1fr;gap:clamp(24px,5cqi,56px);align-items:center}
.pf-vside-left{grid-template-columns:1fr 1.4fr}.pf-vside-below{grid-template-columns:1fr}

/* skills */
.pf-bars{display:grid;grid-template-columns:repeat(var(--skc,1),minmax(0,1fr));gap:4px 32px}
.pf-bar i{transition:width 1.1s cubic-bezier(.2,.8,.2,1)}
.pf-js .pf-skanim:not(.pf-go) .pf-bar i{width:0!important}
.pf-bar-grad{height:12px}.pf-bar-grad i{background:${GRADIENTS.brand}}
.pf-segs{display:grid;grid-template-columns:repeat(10,1fr);gap:4px}.pf-segs i{height:10px;border-radius:3px;background:var(--pf-border)}.pf-segs i.on{background:var(--pf-primary)}
.pf-dots{display:flex;gap:6px}.pf-dots i{width:11px;height:11px;border-radius:50%;background:var(--pf-border)}.pf-dots i.on{background:var(--pf-primary)}
.pf-sstars i{font-style:normal;color:var(--pf-border);font-size:1.1em}.pf-sstars i.on{color:var(--pf-secondary)}
.pf-level{font-size:.8em;font-weight:700;padding:.2em .8em;border-radius:99px;background:color-mix(in srgb,var(--pf-primary) 14%,transparent);color:var(--pf-primary)}
.pf-level-expert{background:var(--pf-primary);color:var(--pf-on-primary)}.pf-level-beginner{background:var(--pf-border);color:var(--pf-muted)}
.pf-cloud{display:flex;flex-wrap:wrap;gap:10px 22px;align-items:center;font-family:var(--pf-hfont);font-weight:700;line-height:1.2}
.pf-align-center .pf-cloud{justify-content:center}
.pf-cloud-0{color:var(--pf-primary)}.pf-cloud-1{color:var(--pf-text)}.pf-cloud-2{color:var(--pf-secondary)}
.pf-skcards{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:14px;text-align:left}
.pf-skcards strong{display:block;font-family:var(--pf-hfont);font-size:1.8em;color:var(--pf-primary)}.pf-skcards span{display:block;margin-bottom:10px;font-weight:600}

/* projects */
.pf-projects .pf-card-body>div{min-width:0}
.pf-project .pf-pic{border-radius:0;aspect-ratio:var(--pr,3/2)}.pf-project .pf-pic img{position:absolute;inset:0}
.pf-pmeta{font-size:.78em;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--pf-primary);margin:0 0 4px!important}
.pf-plinks{display:flex;gap:16px;margin-top:14px}
.pf-plink{font-weight:600;font-size:.92em;color:var(--pf-primary)!important;text-decoration:none}.pf-plink-2{color:var(--pf-muted)!important}
.pf-pl-overlay .pf-project{position:relative;min-height:320px;display:flex;align-items:flex-end;border:0;color:#fff}
.pf-pl-overlay .pf-project .pf-pic{position:absolute;inset:0;aspect-ratio:auto}
.pf-pl-overlay .pf-card-body{position:relative;z-index:2;width:100%;background:linear-gradient(transparent,rgba(0,0,0,.82));padding-top:70px}
.pf-pl-overlay .pf-meta,.pf-pl-overlay .pf-pmeta,.pf-pl-overlay .pf-plink{color:rgba(255,255,255,.85)!important}.pf-pl-overlay .pf-tag{color:#fff;border-color:rgba(255,255,255,.4)}
.pf-pl-minimal .pf-project{background:none;border:0;overflow:visible}.pf-pl-minimal .pf-pic{border-radius:var(--pf-radius)}.pf-pl-minimal .pf-card-body{padding:14px 2px 0}
.pf-pl-list{grid-template-columns:1fr!important;gap:0}
.pf-pl-list .pf-project{display:grid;grid-template-columns:minmax(0,.9fr) 1.4fr;gap:28px;align-items:center;background:none;border:0;border-bottom:1px solid var(--pf-border);border-radius:0;padding:22px 0}
.pf-pl-list .pf-pic{border-radius:var(--pf-radius)}.pf-pl-list .pf-card-body{padding:0}
.pf-pl-zigzag{grid-template-columns:1fr!important;gap:clamp(32px,6cqi,72px)}
.pf-pl-zigzag .pf-project{display:grid;grid-template-columns:1.2fr 1fr;gap:clamp(20px,5cqi,56px);align-items:center;background:none;border:0;overflow:visible}
.pf-pl-zigzag .pf-project:nth-child(even) .pf-pic{order:2}.pf-pl-zigzag .pf-pic{border-radius:var(--pf-radius)}.pf-pl-zigzag .pf-h4{font-size:1.6em}
.pf-pl-magazine{grid-template-columns:repeat(3,minmax(0,1fr))!important}.pf-pl-magazine .pf-project:first-child{grid-column:span 2;grid-row:span 2}
.pf-pl-magazine .pf-project:first-child .pf-h4{font-size:1.6em}
.pf-pl-bento{grid-template-columns:repeat(4,minmax(0,1fr))!important;grid-auto-rows:220px;grid-auto-flow:dense}
.pf-pl-bento .pf-project{position:relative;display:flex;align-items:flex-end;color:#fff;border:0}
.pf-pl-bento .pf-project .pf-pic{position:absolute;inset:0;aspect-ratio:auto}
.pf-pl-bento .pf-card-body{position:relative;z-index:2;width:100%;background:linear-gradient(transparent,rgba(0,0,0,.8));padding-top:50px}
.pf-pl-bento .pf-meta,.pf-pl-bento .pf-pmeta,.pf-pl-bento .pf-plink{color:rgba(255,255,255,.85)!important}.pf-pl-bento .pf-tags{display:none}
.pf-pl-bento .pf-project:nth-child(6n+1){grid-column:span 2;grid-row:span 2}.pf-pl-bento .pf-project:nth-child(6n+2){grid-column:span 2}.pf-pl-bento .pf-project:nth-child(6n+5){grid-row:span 2}
.pf-pl-numbered{grid-template-columns:1fr!important;gap:0}
.pf-pl-numbered .pf-project{background:none;border:0;border-top:1px solid var(--pf-border);border-radius:0;transition:padding .25s}
.pf-pl-numbered .pf-project:hover{padding-left:12px}
.pf-pl-numbered .pf-card-body{display:flex;gap:28px;align-items:baseline;padding:24px 0}
.pf-pnum{font-family:var(--pf-hfont);font-size:2.4em;font-weight:700;color:var(--pf-primary);line-height:1;min-width:2ch}
.pf-pl-carousel{--cols:2;--gap:22px}

/* about */
.pf-about-img{width:100%}
.pf-about-image-right{grid-template-columns:1.2fr minmax(0,.8fr)}
.pf-about-image-top{grid-template-columns:1fr;gap:32px}
.pf-about-circle{grid-template-columns:240px 1fr}.pf-about-circle .pf-about-img{max-width:240px}
.pf-about-overlap{grid-template-columns:1fr 1fr;gap:0}.pf-about-overlap .pf-about-text{background:var(--pf-surface);padding:clamp(24px,4cqi,48px);border-radius:var(--pf-radius);margin-left:-60px;box-shadow:0 30px 60px -25px rgba(0,0,0,.35);position:relative;z-index:1}
.pf-about-boxed{background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:calc(var(--pf-radius) * 1.5);padding:clamp(20px,4cqi,48px)}
.pf-about-centered{grid-template-columns:1fr;text-align:center;justify-items:center}.pf-about-centered .pf-about-img{max-width:180px}.pf-about-centered .pf-text{margin-inline:auto}
.pf-about-centered .pf-facts,.pf-about-centered .pf-actions{justify-content:center}
.pf-facts{display:flex;flex-wrap:wrap;gap:12px 32px;margin:20px 0 0}
.pf-facts dt{font-size:.78em;color:var(--pf-muted);text-transform:uppercase;letter-spacing:.06em}.pf-facts dd{margin:0;font-weight:600}
.pf-signature{font-family:'Great Vibes','Brush Script MT',cursive;font-size:2.2em;color:var(--pf-primary);margin:16px 0 0!important;line-height:1.2}

/* testimonials */
.pf-tm{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;text-align:left}
.pf-tm-cards .pf-testimonial,.pf-tm-masonry .pf-testimonial,.pf-tm-carousel .pf-testimonial{background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:var(--pf-radius);padding:26px}
.pf-tm-single{grid-template-columns:1fr;text-align:center;max-width:820px;margin:0 auto}
.pf-tm-single blockquote{font-family:var(--pf-hfont);font-size:clamp(1.4rem,3.4cqi,2.2rem)!important;line-height:1.35}
.pf-tm-single figcaption{justify-content:center}
.pf-tm-carousel{--cols:1;--gap:22px}.pf-tm-carousel .pf-testimonial{text-align:center}.pf-tm-carousel blockquote{font-size:1.25em!important}.pf-tm-carousel figcaption{justify-content:center}
.pf-tm-masonry{display:block;columns:3 260px;column-gap:22px}.pf-tm-masonry .pf-testimonial{break-inside:avoid;margin-bottom:22px}
.pf-tm-bubbles blockquote{position:relative;background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:18px;padding:20px 22px}
.pf-tm-bubbles blockquote::after{content:'';position:absolute;left:28px;bottom:-9px;width:16px;height:16px;background:var(--pf-surface);border-right:1px solid var(--pf-border);border-bottom:1px solid var(--pf-border);transform:rotate(45deg)}
.pf-tm-minimal .pf-testimonial{border-left:3px solid var(--pf-primary);padding-left:20px}
.pf-stars{color:var(--pf-secondary);letter-spacing:.1em;margin:0 0 10px!important}

/* services */
.pf-svc{display:grid;grid-template-columns:repeat(var(--sc,3),minmax(0,1fr));gap:22px;text-align:left}
.pf-svc-item{display:flex;flex-direction:column;gap:14px}
.pf-svc-cards .pf-svc-item,.pf-svc-numbered .pf-svc-item,.pf-svc-icons .pf-svc-item{background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:var(--pf-radius);padding:26px}
.pf-svc-n{font-family:var(--pf-hfont);font-size:2.2em;font-weight:700;color:var(--pf-primary);line-height:1}
.pf-svc-ic{display:grid;place-items:center;width:52px;height:52px;border-radius:14px;background:color-mix(in srgb,var(--pf-primary) 14%,transparent);font-size:1.5em}
.pf-svc-icons .pf-svc-ic{width:68px;height:68px;font-size:2em;border-radius:50%}
.pf-svc-list{grid-template-columns:1fr;gap:0}.pf-svc-list .pf-svc-item{flex-direction:row;align-items:baseline;gap:24px;padding:22px 0;border-top:1px solid var(--pf-border)}
.pf-svc-list .pf-svc-item>div{display:grid;grid-template-columns:1fr 1.5fr;gap:24px;width:100%}.pf-svc-list h3{margin:0!important}
.pf-svc-outline .pf-svc-item{border:2px solid var(--pf-border);border-radius:var(--pf-radius);padding:26px;transition:border-color .2s,transform .2s}.pf-svc-outline .pf-svc-item:hover{border-color:var(--pf-primary);transform:translateY(-4px)}
.pf-svc-gradient .pf-svc-item{background:${GRADIENTS.brand};color:#fff;border-radius:var(--pf-radius);padding:26px}.pf-svc-gradient .pf-meta{color:rgba(255,255,255,.88)}.pf-svc-gradient .pf-svc-ic{background:rgba(255,255,255,.2)}
.pf-svc .pf-meta{margin:0}

/* stats */
.pf-stats-cards .pf-stat{background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:var(--pf-radius);padding:24px}
.pf-stats-divided{gap:0}.pf-stats-divided .pf-stat{padding:8px 24px;border-left:1px solid var(--pf-border)}.pf-stats-divided .pf-stat:first-child{border-left:0}
.pf-stats-band{background:var(--pf-primary);color:var(--pf-on-primary);border-radius:calc(var(--pf-radius) * 1.5);padding:clamp(24px,4cqi,48px)}.pf-stats-band .pf-stat strong{color:inherit}.pf-stats-band .pf-stat span{color:inherit;opacity:.85}
.pf-stats-circles .pf-stat{aspect-ratio:1;max-width:200px;margin:0 auto;width:100%;border:2px solid color-mix(in srgb,var(--pf-primary) 40%,transparent);border-radius:50%;display:grid;place-content:center;text-align:center}
.pf-stats-left .pf-stat{display:flex;align-items:center;gap:14px;text-align:left}.pf-stats-left .pf-stat span{max-width:14ch;line-height:1.3}

/* experience */
.pf-xp-in p:last-child{margin-bottom:0}
.pf-xp-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;border:0}
.pf-xp-cards li{padding:24px;background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:var(--pf-radius)}.pf-xp-cards li::before{display:none}
.pf-xp-center{border:0;position:relative}.pf-xp-center::before{content:'';position:absolute;left:50%;top:0;bottom:0;width:2px;background:var(--pf-border)}
.pf-xp-center li{width:50%;padding:0 36px 34px 0;text-align:right}.pf-xp-center li::before{left:auto;right:-7px}
.pf-xp-center li:nth-child(even){margin-left:50%;padding:0 0 34px 36px;text-align:left}.pf-xp-center li:nth-child(even)::before{left:-5px;right:auto}
.pf-xp-compact{border:0}.pf-xp-compact li{padding:16px 0;border-top:1px solid var(--pf-border)}.pf-xp-compact li::before{display:none}
.pf-xp-compact .pf-xp-in{display:grid;grid-template-columns:160px 1fr;gap:4px 24px}.pf-xp-compact .pf-xp-in>p:first-child{grid-row:span 2}.pf-xp-compact h3{margin:0!important}
.pf-xp-split{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 40px;border:0}.pf-xp-split li{padding:0 0 20px 22px;border-left:2px solid var(--pf-border)}.pf-xp-split li::before{left:-7px}
.pf-xp-numbered{border:0}.pf-xp-numbered li{display:flex;gap:24px;padding:0 0 28px}.pf-xp-numbered li::before{display:none}
.pf-xp-n{font-family:var(--pf-hfont);font-size:2.2em;font-weight:700;color:var(--pf-primary);line-height:1;min-width:2ch}

/* education */
.pf-edu-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
.pf-edu-cards .pf-edu-item{flex-direction:column;gap:8px;padding:22px;background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:var(--pf-radius)}
.pf-edu-timeline{border-left:2px solid var(--pf-border)}.pf-edu-timeline .pf-edu-item{position:relative;border:0;padding:0 0 26px 28px;flex-direction:column;gap:4px}
.pf-edu-timeline .pf-edu-item::before{content:'';position:absolute;left:-7px;top:.45em;width:12px;height:12px;border-radius:50%;background:var(--pf-primary)}
.pf-edu-compact .pf-edu-item{padding:10px 0}

/* contact */
.pf-contact-centered{grid-template-columns:1fr;text-align:center;max-width:680px;margin:0 auto}.pf-contact-centered .pf-lead{margin-inline:auto}.pf-contact-centered .pf-contact-info{align-items:center}
.pf-contact-card{background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:calc(var(--pf-radius) * 1.5);padding:clamp(24px,5cqi,56px);box-shadow:0 30px 60px -30px rgba(0,0,0,.35)}
.pf-contact-minimal{grid-template-columns:1fr}.pf-contact-minimal .pf-contact-info a:first-child{font-family:var(--pf-hfont);font-size:clamp(1.6rem,5cqi,3rem);font-weight:700}
.pf-contact-band{background:var(--pf-primary);color:var(--pf-on-primary);border-radius:calc(var(--pf-radius) * 1.5);padding:clamp(24px,5cqi,56px)}
.pf-contact-band .pf-lead,.pf-contact-band .pf-contact-info a{color:inherit}.pf-contact-band .pf-input{background:rgba(255,255,255,.95);color:#111}
.pf-contact-band .pf-btn-primary{background:var(--pf-on-primary);color:var(--pf-primary)!important;border-color:var(--pf-on-primary)}

/* call to action */
.pf-cta>div:first-child{max-width:720px;margin:0 auto}
.pf-cta-split{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:24px;text-align:left;background:var(--pf-surface);color:var(--pf-text);border:1px solid var(--pf-border)}
.pf-cta-split>div:first-child{margin:0}.pf-cta-split .pf-actions{margin:0}.pf-cta-split .pf-btn-primary{background:var(--pf-primary);color:var(--pf-on-primary)!important;border-color:var(--pf-primary)}
.pf-cta-outline{background:transparent;color:var(--pf-text);border:2px solid var(--pf-primary)}.pf-cta-outline .pf-btn-primary{background:var(--pf-primary);color:var(--pf-on-primary)!important;border-color:var(--pf-primary)}
.pf-cta-gradient{background:${GRADIENTS.brand};color:#fff}.pf-cta-gradient .pf-btn-primary{background:#fff;color:#111!important;border-color:#fff}
.pf-cta-image{background:linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)),var(--cta-img,var(--pf-primary)) center/cover;color:#fff}.pf-cta-image .pf-btn-primary{background:#fff;color:#111!important;border-color:#fff}
.pf-cta-minimal{background:none;color:var(--pf-text);padding:20px 0}.pf-cta-minimal .pf-h2{font-size:calc(clamp(2.2rem,6cqi,4rem) * var(--t-scale,1))}.pf-cta-minimal .pf-btn-primary{background:var(--pf-primary);color:var(--pf-on-primary)!important;border-color:var(--pf-primary)}

/* pricing */
.pf-plan{position:relative}
.pf-plan-badge{position:absolute;top:-12px;right:18px;font-size:.75em;font-weight:700;padding:.3em .9em;border-radius:99px;background:var(--pf-secondary);color:#111}
.pf-price-bordered .pf-plan{border-width:2px}.pf-price-bordered .pf-plan-hl{border-color:var(--pf-primary);transform:scale(1.03)}
.pf-price-minimal .pf-plan{background:none;border:0;border-left:1px solid var(--pf-border);border-radius:0}.pf-price-minimal .pf-plan:first-child{border-left:0}
.pf-price-dark .pf-plan-hl{background:var(--pf-text);color:var(--pf-bg);border-color:var(--pf-text)}.pf-price-dark .pf-plan-hl li{border-color:color-mix(in srgb,var(--pf-bg) 20%,transparent)}
.pf-price-gradient .pf-plan-hl{background:${GRADIENTS.brand};color:#fff;border-color:transparent}.pf-price-gradient .pf-plan-hl li{border-color:rgba(255,255,255,.25)}

/* faq */
.pf-faq-twocol{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 40px}
.pf-faq-cards{display:grid;gap:12px}.pf-faq-cards details{background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:var(--pf-radius);padding:18px 22px}
.pf-faq-plus summary{list-style:none;display:flex;justify-content:space-between;gap:16px}.pf-faq-plus summary::-webkit-details-marker{display:none}
.pf-faq-plus summary::after{content:'+';font-size:1.4em;line-height:1;color:var(--pf-primary)}.pf-faq-plus details[open] summary::after{content:'−'}

/* quote */
.pf-quote-mark{position:relative;padding-top:.6em}.pf-quote-mark::before{content:'“';position:absolute;top:-.25em;left:50%;transform:translateX(-50%);font-family:Georgia,serif;font-size:6em;line-height:1;color:var(--pf-primary);opacity:.35}
.pf-quote-card{max-width:760px;background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:calc(var(--pf-radius) * 1.5);padding:clamp(24px,5cqi,56px)}
.pf-quote-bar{text-align:left;max-width:760px;border-left:5px solid var(--pf-primary);padding-left:28px;margin:0}
.pf-quote-highlight p{display:inline;background:linear-gradient(transparent 60%,color-mix(in srgb,var(--pf-secondary) 50%,transparent) 60%);box-decoration-break:clone;-webkit-box-decoration-break:clone}
.pf-quote-highlight cite{display:block;margin-top:16px}

/* link list */
.pf-ll-filled .pf-linkitem{background:var(--pf-primary);color:var(--pf-on-primary);border-color:var(--pf-primary)}
.pf-ll-soft .pf-linkitem{background:var(--pf-surface);border-color:transparent}
.pf-ll-shadow .pf-linkitem{background:var(--pf-surface);border-color:transparent;box-shadow:0 10px 24px -12px rgba(0,0,0,.35)}
.pf-ll-pill .pf-linkitem{border-radius:999px}
.pf-ll-gradient .pf-linkitem{background:${GRADIENTS.brand};color:#fff;border-color:transparent}
.pf-ll-filled .pf-linkitem:hover,.pf-ll-gradient .pf-linkitem:hover,.pf-ll-shadow .pf-linkitem:hover,.pf-ll-soft .pf-linkitem:hover{transform:translateY(-2px);background-color:var(--pf-text);color:var(--pf-bg)}
.pf-linkitem{transition:background-color .15s,color .15s,transform .15s}

/* social */
.pf-social-circles .pf-social-item,.pf-social-squares .pf-social-item{padding:0;border:0}.pf-social-circles span,.pf-social-squares span{display:none}
.pf-social-circles b{width:46px;height:46px;font-size:.85em}.pf-social-squares b{width:46px;height:46px;border-radius:12px;font-size:.85em}
.pf-social-text{gap:20px}.pf-social-text .pf-social-item{border:0;padding:0;font-weight:600;text-decoration:underline;text-underline-offset:.25em}.pf-social-text b{display:none}
.pf-social-buttons{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}.pf-social-buttons .pf-social-item{padding:12px 16px;border-radius:var(--pf-radius);background:var(--pf-surface);font-weight:600}
.pf-social-outline .pf-social-item{padding:8px 16px;border:1.5px solid var(--pf-text)}.pf-social-outline b{display:none}
.pf-social-item{transition:transform .15s}.pf-social-item:hover{transform:translateY(-2px)}

/* logos */
.pf-logos-color img{filter:none;opacity:1}
.pf-logos-boxed{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}.pf-logos-boxed img{margin:auto;height:40px}
.pf-logos-boxed>img{box-sizing:content-box;padding:22px;border:1px solid var(--pf-border);border-radius:var(--pf-radius);background:var(--pf-surface);width:calc(100% - 46px);object-fit:contain}
.pf-logos-marquee{display:block;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent);mask-image:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)}
.pf-marquee>div{display:flex;gap:48px;width:max-content;animation:pf-marq 30s linear infinite}.pf-marquee img{height:44px;width:auto;filter:grayscale(1);opacity:.75}
@keyframes pf-marq{to{transform:translateX(-50%)}}

/* footer */
.pf-fline{display:flex;flex-wrap:wrap;gap:12px 24px;justify-content:center;align-items:center}
.pf-flinks{display:flex;flex-wrap:wrap;gap:18px}.pf-flinks a{text-decoration:none}.pf-flinks a:hover{color:var(--pf-primary)}
.pf-footer-centered .pf-fline{flex-direction:column}
.pf-footer-split .pf-fline{justify-content:space-between}
.pf-footer-big{border-top:0;text-align:left}.pf-footer-big .pf-fline{justify-content:space-between}
.pf-fbig{font-family:var(--pf-hfont);font-weight:800;font-size:clamp(3rem,14cqi,11rem);line-height:.9;letter-spacing:-.04em;color:var(--pf-text);margin:0 0 24px!important;word-break:break-word}
.pf-footer-line{border-top:1px solid var(--pf-border);padding-top:16px;font-size:.82em}.pf-footer-line .pf-fline{justify-content:space-between}


/* tile patterns (gallery + projects) */
.pf-gallery-pattern,.pf-pl-pattern{display:grid!important;grid-template-columns:repeat(var(--cols,var(--pc,3)),minmax(0,1fr))!important;grid-auto-rows:var(--rowh,190px);grid-auto-flow:dense;columns:auto}
.pf-pl-pattern{--cols:var(--pc,3)}
.pf-gallery-pattern .pf-gallery-item,.pf-gallery-pattern .pf-pic{height:100%}
.pf-gallery-pattern .pf-pic img{position:absolute;inset:0}
.pf-pl-pattern .pf-project{position:relative;display:flex;align-items:flex-end;color:#fff;border:0;min-height:0}
.pf-pl-pattern .pf-project .pf-pic{position:absolute;inset:0;aspect-ratio:auto}
.pf-pl-pattern .pf-project .pf-pic img{position:absolute;inset:0}
.pf-pl-pattern .pf-card-body{position:relative;z-index:2;width:100%;background:linear-gradient(transparent,rgba(0,0,0,.82));padding-top:56px}
.pf-pl-pattern .pf-meta,.pf-pl-pattern .pf-pmeta,.pf-pl-pattern .pf-plink{color:rgba(255,255,255,.86)!important}
.pf-pl-pattern .pf-tag{color:#fff;border-color:rgba(255,255,255,.4)}

/* extra navigation styles */
.pf-nav-split .pf-nav-links{order:1;flex:1;justify-content:space-between}
.pf-nav-split .pf-logo{order:2;position:absolute;left:50%;transform:translateX(-50%)}
.pf-nav-split .pf-nav-gap{margin-left:auto;padding-left:calc(120px + 4vw)}
.pf-nav-split .pf-nav-links a:first-child{margin-right:0}
.pf-nav-split .pf-nav-cta{order:3}
.pf-nav-tabs .pf-nav-links{gap:4px;background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:999px;padding:4px}
.pf-nav-tabs .pf-nav-links a{padding:6px 16px;border-radius:999px}.pf-nav-tabs .pf-nav-links a:hover{background:var(--pf-primary);color:var(--pf-on-primary)}
.pf-nav-outlined .pf-nav-links{gap:8px}.pf-nav-outlined .pf-nav-links a{padding:6px 14px;border:1px solid var(--pf-border);border-radius:999px;color:var(--pf-text)}
.pf-nav-outlined .pf-nav-links a:hover{border-color:var(--pf-primary);color:var(--pf-primary)}
.pf-nav-stacked{flex-direction:column;align-items:flex-start;gap:10px}.pf-nav-stacked .pf-logo{font-size:1.8em}
.pf-nav-stacked .pf-nav-links{width:100%;border-top:1px solid var(--pf-border);padding-top:10px}

/* section tones */
.pf-tone-dark{--pf-bg:#0F1115;--pf-surface:#1A1D24;--pf-text:#F2F3F5;--pf-muted:#A0A6B3;--pf-border:#2A2F3A;background-color:var(--pf-bg);color:var(--pf-text)}
.pf-tone-light{--pf-bg:#FFFFFF;--pf-surface:#F5F6FA;--pf-text:#151826;--pf-muted:#5D6378;--pf-border:#E3E5EF;background-color:var(--pf-bg);color:var(--pf-text)}
.pf-tone-soft{background-color:var(--pf-surface)}
.pf-tone-vivid{--pf-primary:#FFFFFF;--pf-on-primary:#111418;--pf-secondary:#FFE27A;--pf-text:#FFFFFF;--pf-muted:rgba(255,255,255,.84);--pf-border:rgba(255,255,255,.28);--pf-surface:rgba(255,255,255,.14);--pf-bg:rgba(0,0,0,.18);background-color:#222;color:#fff}
.pf-tone-vivid .pf-card,.pf-tone-vivid .pf-input{backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.pf-tone-vivid .pf-input::placeholder{color:rgba(255,255,255,.7)}
.pf-tone-brand{--pf-text:var(--pf-on-primary);--pf-muted:color-mix(in srgb,var(--pf-on-primary) 80%,transparent);--pf-border:color-mix(in srgb,var(--pf-on-primary) 25%,transparent);--pf-surface:color-mix(in srgb,var(--pf-on-primary) 12%,transparent);background-color:var(--pf-primary);color:var(--pf-on-primary)}
.pf-tone-brand .pf-btn-primary{background:var(--pf-on-primary);color:var(--pf-primary)!important;border-color:var(--pf-on-primary)}
.pf-tone-brand .pf-kicker,.pf-tone-brand .pf-stat strong,.pf-tone-brand .pf-pnum,.pf-tone-brand .pf-svc-n,.pf-tone-brand .pf-xp-n{color:inherit}

@container (max-width:900px){
  .pf .pf-pl-bento{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  .pf .pf-svc{grid-template-columns:repeat(min(var(--sc,3),2),minmax(0,1fr))}
}
@container (max-width:680px){
  .pf-gallery-pattern,.pf-pl-pattern{--cols:2!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-auto-rows:calc(var(--rowh,190px) * .8)}
  .pf-gallery-pattern>*,.pf-pl-pattern>*{grid-column:span 1!important;grid-row:span 1!important}
  .pf-gallery-pattern>:first-child,.pf-pl-pattern>:first-child{grid-column:span 2!important;grid-row:span 2!important}
  .pf-nav-split .pf-logo{position:static;transform:none}.pf-nav-split .pf-nav-gap{padding-left:12px;margin:0}
  .pf .pf-bars,.pf .pf-svc,.pf .pf-tm,.pf .pf-faq-twocol,.pf .pf-xp-cards,.pf .pf-xp-split,.pf .pf-vside{grid-template-columns:1fr}
  .pf .pf-pl-list .pf-project,.pf .pf-pl-zigzag .pf-project{grid-template-columns:1fr;gap:14px}
  .pf .pf-pl-zigzag .pf-project:nth-child(even) .pf-pic{order:0}
  .pf .pf-pl-magazine{grid-template-columns:1fr!important}.pf .pf-pl-magazine .pf-project:first-child{grid-column:auto;grid-row:auto}
  .pf .pf-pl-bento .pf-project:nth-child(n){grid-column:span 2;grid-row:span 1}
  .pf-about-image-right,.pf-about-circle,.pf-about-overlap{grid-template-columns:1fr}
  .pf-about-image-right .pf-about-img{order:-1}.pf-about-overlap .pf-about-text{margin:-40px 12px 0}
  .pf-xp-center::before{left:0}.pf-xp-center li,.pf-xp-center li:nth-child(even){width:auto;margin:0;padding:0 0 28px 26px;text-align:left}
  .pf-xp-center li::before,.pf-xp-center li:nth-child(even)::before{left:-5px;right:auto}
  .pf-xp-compact .pf-xp-in{grid-template-columns:1fr}
  .pf-stats-divided .pf-stat{border-left:0;border-top:1px solid var(--pf-border);padding:16px 0}.pf-stats-divided .pf-stat:first-child{border-top:0}
  .pf-price-minimal .pf-plan{border-left:0;border-top:1px solid var(--pf-border)}
  .pf-hero-collage{aspect-ratio:auto;grid-template-rows:200px 200px}
  .pf-gallery-filmstrip>*{height:240px}
  .pf-carousel>*{flex-basis:82%}
  .pf-nav-pill{border-radius:var(--pf-radius)}
  .pf-section[class*="pf-box-"]>.pf-container{width:calc(100% - 16px)}
}
@media (prefers-reduced-motion:reduce){.pf-marquee>div,.pf-rotate::after,.pf-scroll{animation:none}}
`;
