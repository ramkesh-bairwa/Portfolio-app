// Turns a resume document into printable HTML (A4 / Letter). Used by the live preview, the gallery and the PDF download.
import { esc, nl, safeUrl } from '../html';
import { fontHref, fontStack } from '../fonts';
import { DEFAULT_RESUME_THEME } from './designs';
import { SIDE_DEFAULT } from './sections';

const list = (a) => (Array.isArray(a) ? a : []);
const lines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);
const csv = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
const cssVal = (v) => String(v ?? '').replace(/[<>{};"]/g, '');
const pick = (v, allowed, d) => (allowed.includes(v) ? v : d);

export const PAPER = { a4: { w: 210, h: 297, css: 'A4' }, letter: { w: 215.9, h: 279.4, css: 'letter' } };

export const fullResumeTheme = (t) => ({ ...DEFAULT_RESUME_THEME, ...(t || {}) });

const ICON = {
  email: 'M2 4h20v16H2zM2 5l10 8 10-8',
  phone: 'M5 2h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 11l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 4a2 2 0 0 1 2-2',
  location: 'M12 22s7-7.6 7-13a7 7 0 0 0-14 0c0 5.4 7 13 7 13zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
  website: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M2 12h20M12 2c3 3 3 17 0 20M12 2c-3 3-3 17 0 20',
  linkedin: 'M4 9h4v11H4zM6 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4M10 9h4v2c1-2 6-3 6 2v7h-4v-6c0-2-2-2-2 0v6h-4z',
  github: 'M9 19c-4 1.5-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6.2 0C6.6 2.8 5.6 3.1 5.6 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.2 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21',
};
const icon = (k, show) => (show ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICON[k]}"/></svg>` : '');

function contacts(h, t) {
  const items = [
    ['email', h.email, h.email && `mailto:${h.email}`],
    ['phone', h.phone, h.phone && `tel:${String(h.phone).replace(/\s/g, '')}`],
    ['location', h.location, ''],
    ['website', h.website, h.website && (/^https?:/.test(h.website) ? h.website : `https://${h.website}`)],
    ['linkedin', h.linkedin, h.linkedin && (/^https?:/.test(h.linkedin) ? h.linkedin : `https://${h.linkedin}`)],
    ['github', h.github, h.github && (/^https?:/.test(h.github) ? h.github : `https://${h.github}`)],
  ].filter(([, v]) => v);
  return `<ul class="rs-contacts">${items.map(([k, v, href]) => `<li>${icon(k, t.icons)}${href ? `<a href="${safeUrl(href)}">${esc(v)}</a>` : `<span>${esc(v)}</span>`}</li>`).join('')}</ul>`;
}

const photo = (h, t) => (h.showPhoto && h.photo ? `<img class="rs-photo rs-photo-${pick(t.photoShape, ['circle', 'rounded', 'square'], 'circle')}" src="${safeUrl(h.photo)}" alt="">` : '');

const initials = (n) => String(n || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

function header(sec, t, part = 'all') {
  const h = sec?.props || {};
  const mono = t.monogram ? `<span class="rs-mono" aria-hidden="true">${esc(initials(h.name))}</span>` : '';
  const title = h.title ? `<p class="rs-title">${esc(h.title)}</p>` : '';
  const name = `<h1 class="rs-name">${esc(h.name)}</h1>${title}`;
  if (part === 'name') return `<div class="rs-head rs-head-name">${mono}<div>${name}</div></div>`;
  if (part === 'side') return `<div class="rs-head-side">${photo(h, t)}${contacts(h, t)}</div>`;
  const align = pick(h.variant || t.headerAlign, ['left', 'center', 'split', 'band', 'banner', 'rule', 'stacked', 'boxed'], 'left');
  if (align === 'split') return `<header class="rs-head rs-head-split"><div class="rs-head-id">${photo(h, t)}${mono}<div>${name}</div></div>${contacts(h, t)}</header>`;
  if (align === 'stacked') {
    const parts = String(h.name || '').trim().split(/\s+/);
    const last = parts.length > 1 ? parts.pop() : '';
    return `<header class="rs-head rs-head-stacked"><div class="rs-head-id">${photo(h, t)}${mono}<div><h1 class="rs-name rs-name-stacked"><span>${esc(parts.join(' '))}</span>${last ? `<span>${esc(last)}</span>` : ''}</h1>${title}</div></div>${contacts(h, t)}</header>`;
  }
  if (align === 'rule') return `<header class="rs-head rs-head-rule"><div class="rs-head-id">${photo(h, t)}${mono}<div>${name}</div></div><hr class="rs-rule">${contacts(h, t)}</header>`;
  if (align === 'boxed') return `<header class="rs-head rs-head-boxed">${photo(h, t)}<div class="rs-namebox">${mono}${name}</div>${contacts(h, t)}</header>`;
  if (align === 'banner') return `<header class="rs-head rs-head-banner">${photo(h, t)}${mono}<div class="rs-head-text">${name}${contacts(h, t)}</div></header>`;
  return `<header class="rs-head rs-head-${align}">${photo(h, t)}${mono}<div class="rs-head-text">${name}${contacts(h, t)}</div></header>`;
}

const bullets = (text) => {
  const b = lines(text);
  return b.length ? `<ul class="rs-bullets">${b.map((x) => `<li>${esc(x.replace(/^[-•*]\s*/, ''))}</li>`).join('')}</ul>` : '';
};
const meta = (...parts) => parts.filter(Boolean).map((x) => esc(x)).join(' · ');
const item = ({ main, sub, date, body }) =>
  `<div class="rs-item"><div class="rs-item-date">${esc(date || '')}</div><div class="rs-item-main"><div class="rs-item-head"><div><h3>${main}</h3>${sub ? `<p class="rs-sub">${sub}</p>` : ''}</div>${date ? `<span class="rs-date">${esc(date)}</span>` : ''}</div>${body || ''}</div></div>`;

function levels(items, display, t) {
  const d = pick(display || t.skills, ['tags', 'bars', 'dots', 'text', 'columns', 'matrix', 'outline'], 'tags');
  const num = (v) => (typeof v === 'number' || /^\d+$/.test(String(v)) ? Math.max(0, Math.min(100, Number(v))) : ({ Native: 100, Fluent: 90, Advanced: 75, Intermediate: 55, Basic: 30 })[v] ?? 70);
  const label = (it) => (typeof it.level === 'string' && !/^\d+$/.test(it.level) ? it.level : '');
  const word = (it) => label(it) || (num(it.level) >= 85 ? 'Expert' : num(it.level) >= 70 ? 'Advanced' : num(it.level) >= 50 ? 'Intermediate' : 'Basic');
  if (d === 'matrix') return `<dl class="rs-matrix">${items.map((it) => `<div><dt>${esc(it.name)}</dt><dd>${esc(word(it))}</dd></div>`).join('')}</dl>`;
  if (d === 'outline') return `<div class="rs-tags rs-tags-outline">${items.map((it) => `<span>${esc(it.name)}</span>`).join('')}</div>`;
  if (d === 'text') return `<p class="rs-skilltext">${items.map((it) => esc(it.name) + (label(it) ? ` (${esc(label(it))})` : '')).join(', ')}</p>`;
  if (d === 'columns') return `<ul class="rs-skillcols">${items.map((it) => `<li>${esc(it.name)}${label(it) ? ` <span>— ${esc(label(it))}</span>` : ''}</li>`).join('')}</ul>`;
  if (d === 'bars') return `<div class="rs-bars">${items.map((it) => `<div><span>${esc(it.name)}${label(it) ? ` <em>${esc(label(it))}</em>` : ''}</span><i><b style="width:${num(it.level)}%"></b></i></div>`).join('')}</div>`;
  if (d === 'dots') return `<div class="rs-dots">${items.map((it) => `<div><span>${esc(it.name)}</span><span class="rs-dotrow">${[1, 2, 3, 4, 5].map((n) => `<i${n <= Math.round(num(it.level) / 20) ? ' class="on"' : ''}></i>`).join('')}</span></div>`).join('')}</div>`;
  return `<div class="rs-tags">${items.map((it) => `<span>${esc(it.name)}</span>`).join('')}</div>`;
}

const SECTION_HTML = {
  summary: (p) => `<p>${nl(p.text)}</p>`,
  experience: (p, t) => list(p.items).map((x) => (t.items === 'company'
    ? item({ main: esc(x.company || x.role), sub: meta(x.role, x.location), date: x.period, body: bullets(x.bullets) })
    : item({ main: esc(x.role), sub: meta(x.company, x.location), date: x.period, body: bullets(x.bullets) }))).join(''),
  education: (p) => list(p.items).map((x) => item({ main: esc(x.degree), sub: meta(x.school, x.location), date: x.period, body: x.details ? `<p class="rs-small">${esc(x.details)}</p>` : '' })).join(''),
  skills: (p, t) => levels(list(p.items), p.display, t),
  languages: (p, t) => levels(list(p.items), p.display || (t.skills === 'tags' ? 'text' : t.skills), t),
  projects: (p) => list(p.items).map((x) => item({ main: esc(x.name) + (x.link ? ` <a class="rs-link" href="${safeUrl(/^https?:/.test(x.link) ? x.link : 'https://' + x.link)}">${esc(x.link)}</a>` : ''), sub: x.tech ? esc(x.tech) : '', date: x.period, body: x.desc ? `<p>${nl(x.desc)}</p>` : '' })).join(''),
  certifications: (p) => list(p.items).map((x) => item({ main: esc(x.name), sub: esc(x.issuer || ''), date: x.date })).join(''),
  awards: (p) => list(p.items).map((x) => item({ main: esc(x.name), sub: esc(x.by || ''), date: x.date, body: x.desc ? `<p>${nl(x.desc)}</p>` : '' })).join(''),
  achievements: (p, t) => {
    if (!t.tiles) return bullets(p.text);
    const tiles = lines(p.text).slice(0, 4).map((l) => {
      const m = l.match(/^([₹$€£]?[\d.,]+\s?[%+×xkKMBCr]*\+?)\s+(.*)$/);
      return m ? `<div><strong>${esc(m[1])}</strong><span>${esc(m[2])}</span></div>` : `<div><span>${esc(l)}</span></div>`;
    });
    return `<div class="rs-tiles">${tiles.join('')}</div>`;
  },
  volunteering: (p) => list(p.items).map((x) => item({ main: esc(x.role), sub: esc(x.org || ''), date: x.period, body: x.desc ? `<p>${nl(x.desc)}</p>` : '' })).join(''),
  publications: (p) => list(p.items).map((x) => item({ main: esc(x.title), sub: esc(x.publisher || ''), date: x.date })).join(''),
  courses: (p) => list(p.items).map((x) => item({ main: esc(x.name), sub: esc(x.provider || ''), date: x.date })).join(''),
  strengths: (p) => `<div class="rs-strengths">${list(p.items).map((x) => `<div><strong>${esc(x.name)}</strong>${x.desc ? `<span>${esc(x.desc)}</span>` : ''}</div>`).join('')}</div>`,
  interests: (p) => `<div class="rs-tags rs-tags-soft">${csv(p.text).map((x) => `<span>${esc(x)}</span>`).join('')}</div>`,
  personal: (p) => `<dl class="rs-personal">${list(p.items).map((x) => `<div><dt>${esc(x.label)}</dt><dd>${esc(x.value)}</dd></div>`).join('')}</dl>`,
  references: (p) => (list(p.items).length ? list(p.items).map((x) => item({ main: esc(x.name), sub: meta(x.role, x.contact) })).join('') : `<p class="rs-small">${esc(p.note || 'Available on request')}</p>`),
  declaration: (p) => `<p>${nl(p.text)}</p>${p.place || p.date ? `<div class="rs-sign"><span>${p.place ? 'Place: ' + esc(p.place) : ''}</span><span>${p.date ? 'Date: ' + esc(p.date) : ''}</span></div>` : ''}`,
  custom: (p) => `${p.text ? `<p>${nl(p.text)}</p>` : ''}${bullets(p.bullets)}`,
};

function section(sec, t, selectedId) {
  const fn = SECTION_HTML[sec.type];
  if (!fn) return '';
  const p = sec.props || {};
  const lay = pick(p.layout, ['compact', 'timeline', 'cards'], '');
  return `<section class="rs-sec rs-sec-${sec.type}${lay ? ` rs-lay-${lay}` : ''}${sec.id === selectedId ? ' rs-selected' : ''}" data-sid="${esc(sec.id)}">${p.title ? `<h2>${esc(p.title)}</h2>` : ''}<div class="rs-sec-body">${fn(p, t)}</div></section>`;
}

export function sectionArea(sec, t) {
  if (sec.style?.area === 'main' || sec.style?.area === 'side') return sec.style.area;
  return SIDE_DEFAULT.includes(sec.type) ? 'side' : 'main';
}

export function resumeVars(t) {
  const paper = PAPER[t.paper] || PAPER.a4;
  return [
    `--r-accent:${cssVal(t.accent)}`, `--r-text:${cssVal(t.text)}`, `--r-muted:${cssVal(t.muted)}`, `--r-side-bg:${cssVal(t.sidebarBg)}`, `--r-side-text:${cssVal(t.sidebarText)}`,
    `--r-band:${cssVal(t.bandBg || t.accent)}`, `--r-head:${cssVal(t.headColor || t.accent)}`, `--r-hfont:${fontStack(t.headingFont)}`, `--r-bfont:${fontStack(t.bodyFont)}`, `--r-size:${Number(t.baseSize) || 10}pt`,
    `--r-lh:${Number(t.lineHeight) || 1.45}`, `--r-margin:${Number(t.margin) || 16}mm`, `--r-gap:${Number(t.gap) || 14}pt`, `--r-name:${Number(t.nameSize) || 26}pt`,
    `--r-case:${cssVal(t.headingCase || 'uppercase')}`, `--r-w:${paper.w}mm`, `--r-h:${paper.h}mm`,
  ].join(';');
}

// The resume page itself (no <html>), for previews and the print document
export function resumeBody(doc, { selectedId } = {}) {
  const t = fullResumeTheme(doc?.theme);
  const secs = list(doc?.sections);
  const head = secs.find((s) => s.type === 'header');
  const rest = secs.filter((s) => s.type !== 'header');
  const layout = pick(t.layout, ['single', 'sidebar-left', 'sidebar-right', 'band', 'split', 'timeline', 'labels', 'equal', 'band-side'], 'single');
  const cls = [`rs`, `rs-l-${layout}`, t.decor && t.decor !== 'none' && `rs-dc-${pick(t.decor, ['rail', 'frame', 'topstrip', 'corner'], 'rail')}`, t.numbered && 'rs-num',
    t.items && `rs-it-${pick(t.items, ['accent', 'company', 'card'], 'accent')}`, `rs-hd-${pick(t.heading, ['underline', 'bar', 'caps', 'boxed', 'dotted', 'accent-left', 'plain', 'pill', 'center-line', 'filled'], 'underline')}`,
    `rs-b-${pick(t.bullets, ['disc', 'dash', 'arrow', 'square', 'check', 'none'], 'disc')}`, `rs-d-${layout === 'timeline' ? 'left' : pick(t.dates, ['right', 'below', 'left'], 'right')}`].filter(Boolean).join(' ');
  const render = (arr) => arr.map((s) => section(s, t, selectedId)).join('');
  let inner;
  if (layout === 'sidebar-left' || layout === 'sidebar-right') {
    const side = `<aside class="rs-side">${head ? header(head, t, 'side') : ''}${render(rest.filter((s) => sectionArea(s, t) === 'side'))}</aside>`;
    const main = `<div class="rs-main">${head ? header(head, t, 'name') : ''}${render(rest.filter((s) => sectionArea(s, t) === 'main'))}</div>`;
    inner = `<div class="rs-cols">${layout === 'sidebar-left' ? side + main : main + side}</div>`;
  } else if (layout === 'band-side') {
    const side = `<aside class="rs-side">${render(rest.filter((s) => sectionArea(s, t) === 'side'))}</aside>`;
    const main = `<div class="rs-main">${render(rest.filter((s) => sectionArea(s, t) === 'main'))}</div>`;
    inner = `${head ? header(head, { ...t, headerAlign: 'banner' }) : ''}<div class="rs-cols">${side}${main}</div>`;
  } else if (layout === 'equal') {
    inner = `${head ? header(head, t) : ''}<div class="rs-cols rs-cols-plain rs-cols-equal"><div class="rs-main">${render(rest.filter((s) => sectionArea(s, t) === 'main'))}</div><aside class="rs-side">${render(rest.filter((s) => sectionArea(s, t) === 'side'))}</aside></div>`;
  } else if (layout === 'split') {
    inner = `${head ? header(head, { ...t, headerAlign: 'split' }) : ''}<div class="rs-cols rs-cols-plain"><div class="rs-main">${render(rest.filter((s) => sectionArea(s, t) === 'main'))}</div><aside class="rs-side">${render(rest.filter((s) => sectionArea(s, t) === 'side'))}</aside></div>`;
  } else {
    inner = `${head ? header(head, layout === 'band' ? { ...t, headerAlign: 'band' } : t) : ''}<div class="rs-flow">${render(rest)}</div>`;
  }
  const headSel = head && head.id === selectedId ? ' rs-head-selected' : '';
  return `<div class="${cls}${headSel}" style="${esc(resumeVars(t))}" data-head="${head ? esc(head.id) : ''}">${inner}</div>`;
}

export function resumeFontHref(doc) {
  const t = fullResumeTheme(doc?.theme);
  return fontHref([...new Set([t.headingFont, t.bodyFont])]);
}

export function renderResumeDocument(doc, { print = false } = {}) {
  const t = fullResumeTheme(doc?.theme);
  const paper = PAPER[t.paper] || PAPER.a4;
  const font = resumeFontHref(doc);
  const title = esc((list(doc?.sections).find((s) => s.type === 'header')?.props?.name || 'Resume') + ' — Resume');
  // Sidebar layouts: paint the sidebar colour down every printed page, not just as far as the content goes
  const side = t.layout === 'sidebar-left' || t.layout === 'band-side' ? `linear-gradient(90deg,${cssVal(t.sidebarBg)} 34%,#fff 34%)` : t.layout === 'sidebar-right' ? `linear-gradient(90deg,#fff 66%,${cssVal(t.sidebarBg)} 66%)` : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
${font ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${esc(font)}">` : ''}
<style>@page{size:${paper.css};margin:12mm 0}@page :first{margin-top:0}html,body{margin:0;background:${print ? '#fff' : '#E7EBF2'}}body{padding:${print ? '0' : '24px 0'}}${RESUME_CSS}
@media print{body{padding:0;background:#fff}.rs{box-shadow:none!important;margin:0!important}${side ? `html{background:${side}!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{background:transparent!important}.rs{background:transparent}` : ''}}</style></head>
<body>${resumeBody(doc)}${print ? '<script>window.addEventListener("load",function(){setTimeout(function(){window.print()},400)})</script>' : ''}</body></html>`;
}

export const RESUME_CSS = `
.rs{box-sizing:border-box;width:var(--r-w);min-height:var(--r-h);margin:0 auto;background:#fff;color:var(--r-text);font-family:var(--r-bfont);font-size:var(--r-size);line-height:var(--r-lh);padding:var(--r-margin);padding-bottom:calc(var(--r-margin) * .6);box-shadow:0 10px 40px -12px rgba(15,23,42,.25);-webkit-print-color-adjust:exact;print-color-adjust:exact;position:relative}
.rs *,.rs *::before,.rs *::after{box-sizing:border-box}
.rs p{margin:0 0 .35em}.rs a{color:inherit;text-decoration:none}
.rs h1,.rs h2,.rs h3{font-family:var(--r-hfont);margin:0;line-height:1.2}
.rs-name{font-size:var(--r-name);font-weight:700;letter-spacing:-.01em;color:var(--r-text)}
.rs-title{font-size:1.2em;color:var(--r-accent);font-weight:600;margin:.15em 0 .5em!important}
.rs-head{margin-bottom:calc(var(--r-gap) * 1.1)}
.rs-head-left{display:flex;gap:16px;align-items:center}
.rs-head-center{display:flex;flex-direction:column;align-items:center;text-align:center}.rs-head-center .rs-contacts{justify-content:center}
.rs-head-split{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;padding-bottom:10px;border-bottom:2px solid var(--r-accent)}
.rs-head-split .rs-contacts{flex-direction:column;align-items:flex-end;gap:3px}.rs-head-id{display:flex;gap:14px;align-items:center}
.rs-head-band{background:var(--r-band);color:#fff;margin:calc(var(--r-margin) * -1) calc(var(--r-margin) * -1) var(--r-gap);padding:calc(var(--r-margin) * .9) var(--r-margin);display:flex;gap:18px;align-items:center}
.rs-head-band .rs-name{color:#fff}.rs-head-band .rs-title{color:rgba(255,255,255,.9)}.rs-head-band .rs-contacts svg{stroke:#fff}
.rs-contacts{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:4px 14px;font-size:.92em}
.rs-contacts li{display:flex;align-items:center;gap:5px;min-width:0}.rs-contacts li a,.rs-contacts li span{overflow-wrap:anywhere}
.rs-contacts svg{width:1.05em;height:1.05em;flex:none;fill:none;stroke:var(--r-accent);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.rs-photo{width:88px;height:88px;object-fit:cover;flex:none}.rs-photo-circle{border-radius:50%}.rs-photo-rounded{border-radius:14px}.rs-photo-square{border-radius:0}
.rs-sec{margin-bottom:var(--r-gap);break-inside:auto}
.rs-sec h2{font-size:1.08em;font-weight:700;text-transform:var(--r-case);letter-spacing:.06em;color:var(--r-head);margin-bottom:.55em;break-after:avoid}
.rs-item{display:block;margin-bottom:.6em;break-inside:avoid}
.rs-item-date{display:none}
.rs-item-head{display:flex;justify-content:space-between;gap:12px;align-items:baseline}.rs-item-head>div{min-width:0}
.rs-item h3{font-size:1.02em;font-weight:700}
.rs-sub{color:var(--r-muted);margin:0!important}
.rs-date{color:var(--r-muted);font-size:.92em;white-space:nowrap}
.rs-small{color:var(--r-muted);font-size:.95em}
.rs-link{font-family:var(--r-bfont);font-weight:400;font-size:.88em;color:var(--r-accent)}
.rs-d-below .rs-item-head{flex-direction:column;gap:0}
.rs-d-left .rs-item{display:grid;grid-template-columns:24mm minmax(0,1fr);gap:10px}.rs-d-left .rs-item-date{display:block;color:var(--r-muted);font-size:.9em;padding-top:.1em}.rs-d-left .rs-date{display:none}
.rs-bullets{margin:.25em 0 0;padding-left:1.15em;list-style:disc}.rs ul,.rs ol{margin-top:0}.rs-bullets li{margin:.1em 0}
.rs-b-dash .rs-bullets,.rs-b-arrow .rs-bullets,.rs-b-check .rs-bullets,.rs-b-none .rs-bullets{list-style:none;padding-left:1.1em}
.rs-b-dash .rs-bullets li::before,.rs-b-arrow .rs-bullets li::before,.rs-b-check .rs-bullets li::before{position:absolute;margin-left:-1.05em;color:var(--r-accent)}
.rs-b-dash li::before{content:'–'}.rs-b-arrow li::before{content:'▸'}.rs-b-check li::before{content:'✓'}.rs-b-square .rs-bullets{list-style:square}.rs-b-none .rs-bullets{padding-left:0}
.rs-bullets li::marker{color:var(--r-accent)}
/* heading styles */
.rs-hd-underline .rs-sec h2{border-bottom:1.5px solid var(--r-accent);padding-bottom:.2em}
.rs-hd-bar .rs-sec h2{display:flex;align-items:center;gap:8px}.rs-hd-bar .rs-sec h2::before{content:'';width:4px;height:1em;background:var(--r-accent);border-radius:2px}
.rs-hd-caps .rs-sec h2{color:var(--r-text);letter-spacing:.14em;border-bottom:1px solid currentColor;padding-bottom:.2em;font-weight:600}
.rs-hd-boxed .rs-sec h2{background:color-mix(in srgb,var(--r-accent) 12%,transparent);padding:.25em .6em;border-radius:3px}
.rs-hd-dotted .rs-sec h2{border-bottom:2px dotted var(--r-accent);padding-bottom:.25em}
.rs-hd-accent-left .rs-sec h2{border-left:3px solid var(--r-accent);padding-left:.5em;color:var(--r-text)}
.rs-hd-plain .rs-sec h2{color:var(--r-text);letter-spacing:0;font-size:1.15em}
.rs-hd-pill .rs-sec h2{display:inline-block;background:var(--r-accent);color:#fff;padding:.2em .8em;border-radius:99px;letter-spacing:.04em;font-size:.95em}
.rs-hd-center-line .rs-sec h2{display:flex;align-items:center;gap:10px;color:var(--r-text);letter-spacing:.16em}.rs-hd-center-line .rs-sec h2::before,.rs-hd-center-line .rs-sec h2::after{content:'';flex:1;height:1px;background:currentColor;opacity:.5}
.rs-hd-filled .rs-sec h2{background:var(--r-accent);color:#fff;padding:.25em .6em}
/* skills */
.rs-tags{display:flex;flex-wrap:wrap;gap:4px}.rs-tags span{padding:.15em .6em;border-radius:4px;background:color-mix(in srgb,var(--r-accent) 12%,transparent);font-size:.93em}
.rs-tags-soft span{background:none;border:1px solid color-mix(in srgb,currentColor 30%,transparent)}
.rs-bars{display:grid;gap:5px}.rs-bars span{display:block;font-size:.95em}.rs-bars em{font-style:normal;color:var(--r-muted);font-size:.88em}
.rs-bars i{display:block;height:5px;border-radius:3px;background:color-mix(in srgb,currentColor 15%,transparent);overflow:hidden}.rs-bars b{display:block;height:100%;background:var(--r-accent);border-radius:inherit}
.rs-dots{display:grid;gap:4px}.rs-dots>div{display:flex;justify-content:space-between;gap:8px;align-items:center}
.rs-dotrow{display:flex;gap:3px}.rs-dotrow i{width:7px;height:7px;border-radius:50%;background:color-mix(in srgb,currentColor 18%,transparent)}.rs-dotrow i.on{background:var(--r-accent)}
.rs-skillcols{columns:2;margin:0;padding-left:1.1em;list-style:disc}.rs-skillcols span{color:var(--r-muted)}
.rs-strengths{display:grid;gap:5px}.rs-strengths strong{display:block}.rs-strengths span{color:var(--r-muted);font-size:.95em}
.rs-personal{margin:0;display:grid;gap:3px}.rs-personal div{display:grid;grid-template-columns:38% 1fr;gap:8px}.rs-personal dt{color:var(--r-muted)}.rs-personal dd{margin:0}
.rs-sign{display:flex;justify-content:space-between;margin-top:1.2em;color:var(--r-muted)}
/* per-section layouts */
.rs-lay-compact .rs-item{margin-bottom:.3em}.rs-lay-compact .rs-bullets li{margin:0}
.rs-lay-timeline .rs-sec-body{border-left:2px solid color-mix(in srgb,var(--r-accent) 35%,transparent);padding-left:12px;margin-left:4px}
.rs-lay-timeline .rs-item{position:relative}.rs-lay-timeline .rs-item::before{content:'';position:absolute;left:-17.5px;top:.35em;width:9px;height:9px;border-radius:50%;background:var(--r-accent)}
.rs-lay-cards .rs-item{border:1px solid color-mix(in srgb,currentColor 15%,transparent);border-radius:6px;padding:.5em .7em}
/* layouts */
.rs-l-sidebar-left,.rs-l-sidebar-right{padding:0}
.rs-cols{display:grid;grid-template-columns:34% 1fr;min-height:var(--r-h)}
.rs-l-sidebar-right .rs-cols{grid-template-columns:1fr 34%}
.rs-side{background:var(--r-side-bg);color:var(--r-side-text);padding:var(--r-margin) calc(var(--r-margin) * .75)}
.rs-main{padding:var(--r-margin);min-width:0}
.rs-side .rs-sec h2{color:var(--r-side-text)}.rs-l-sidebar-left .rs-side .rs-sec h2,.rs-l-sidebar-right .rs-side .rs-sec h2{color:var(--r-accent)}
.rs-side .rs-sub,.rs-side .rs-date,.rs-side .rs-small{color:inherit;opacity:.78}
.rs-head-side{display:flex;flex-direction:column;gap:12px;margin-bottom:var(--r-gap)}
.rs-head-side .rs-photo{width:110px;height:110px;align-self:center}
.rs-head-side .rs-contacts{flex-direction:column;gap:5px}
.rs-head-name{margin-bottom:var(--r-gap)}
.rs-cols-plain{min-height:0;grid-template-columns:1fr 32%;gap:22px}.rs-cols-plain .rs-main,.rs-cols-plain .rs-side{padding:0;background:none;color:inherit}
.rs-l-band .rs-head{border-radius:0}
.rs-hd-pill .rs-sec h2,.rs-hd-filled .rs-sec h2{color:#fff!important}

/* top-ranking extras: header styles */
.rs-mono{flex:none;display:grid;place-items:center;width:15mm;height:15mm;border-radius:50%;background:var(--r-accent);color:#fff;font-family:var(--r-hfont);font-weight:700;font-size:1.5em;letter-spacing:.02em}
.rs-head-name{display:flex;gap:12px;align-items:center}
.rs-head-stacked{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;padding-bottom:12px;border-bottom:1px solid color-mix(in srgb,var(--r-text) 18%,transparent)}
.rs-head-stacked .rs-head-id{display:flex;gap:14px;align-items:center}
.rs-name-stacked{display:flex;flex-direction:column;line-height:.95;font-size:calc(var(--r-name) * 1.15)}.rs-name-stacked span:last-child{color:var(--r-accent)}
.rs-head-stacked .rs-contacts{flex-direction:column;align-items:flex-end;gap:3px}
.rs-head-rule .rs-head-id{display:flex;gap:14px;align-items:center}
.rs-rule{border:0;height:3px;background:var(--r-accent);margin:8px 0 8px}
.rs-head-boxed{display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px}
.rs-namebox{border:2px solid var(--r-accent);padding:10px 28px;display:flex;flex-direction:column;align-items:center}.rs-namebox .rs-mono{margin-bottom:6px}
.rs-head-boxed .rs-contacts{justify-content:center}
.rs-head-banner{background:var(--r-band);color:#fff;margin:calc(var(--r-margin) * -1) calc(var(--r-margin) * -1) var(--r-gap);padding:calc(var(--r-margin) * .9) var(--r-margin);display:flex;gap:18px;align-items:center;border-bottom:4px solid var(--r-accent)}
.rs-head-banner .rs-name{color:#fff}.rs-head-banner .rs-title{color:var(--r-accent)}.rs-head-banner .rs-contacts{opacity:.92}.rs-head-banner .rs-contacts svg{stroke:var(--r-accent)}
.rs-head-banner .rs-mono{background:transparent;border:2px solid var(--r-accent);color:#fff}
.rs-l-band-side,.rs-l-equal{padding-top:var(--r-margin)}
.rs-l-band-side{padding:0}.rs-l-band-side .rs-head-banner{margin:0;padding:var(--r-margin)}
.rs-l-band-side .rs-cols{min-height:0}.rs-l-band-side .rs-side .rs-sec h2{color:var(--r-head)}
/* labels layout: section titles in a left column */
.rs-l-labels .rs-sec{display:grid;grid-template-columns:31mm minmax(0,1fr);gap:5mm;align-items:start}
.rs-l-labels .rs-sec h2{margin:0;padding-top:.1em;font-size:.95em;border:0!important;background:none!important;color:var(--r-head)!important;padding-left:0!important}
.rs-l-labels .rs-sec h2::after{display:none}
.rs-l-labels .rs-sec+.rs-sec{border-top:1px solid color-mix(in srgb,var(--r-text) 14%,transparent);padding-top:calc(var(--r-gap) * .7)}
/* equal columns */
.rs-cols-equal{grid-template-columns:1fr 1fr!important;gap:8mm}
/* decorations */
.rs-dc-rail{padding-left:calc(var(--r-margin) + 5mm)}.rs-dc-rail::before{content:'';position:absolute;left:0;top:0;bottom:0;width:6mm;background:var(--r-accent)}
.rs-dc-frame::after{content:'';position:absolute;inset:6mm;border:1.2px solid var(--r-accent);pointer-events:none}.rs-dc-frame{padding:calc(var(--r-margin) + 4mm)}
.rs-dc-topstrip{padding-top:calc(var(--r-margin) + 6mm)}.rs-dc-topstrip::before{content:'';position:absolute;left:0;right:0;top:0;height:7mm;background:var(--r-accent)}
.rs-dc-corner::before{content:'';position:absolute;right:0;top:0;width:42mm;height:42mm;background:var(--r-accent);clip-path:polygon(100% 0,0 0,100% 100%);opacity:.9}
.rs-dc-rail .rs-head-banner,.rs-dc-topstrip .rs-head-banner{margin-top:0}
/* numbered sections */
.rs-num{counter-reset:rsec}.rs-num .rs-sec{counter-increment:rsec}
.rs-num .rs-sec h2::before{content:counter(rsec,decimal-leading-zero);margin-right:.6em;color:var(--r-head);font-weight:800;opacity:.85}
/* item styles */
.rs-it-accent .rs-item h3{color:var(--r-accent)}
.rs-it-company .rs-item h3{text-transform:uppercase;letter-spacing:.04em;font-size:.95em}.rs-it-company .rs-sub{font-style:italic;color:var(--r-text)}
.rs-it-card .rs-sec-experience .rs-item,.rs-it-card .rs-sec-projects .rs-item{border:1px solid color-mix(in srgb,var(--r-text) 14%,transparent);border-left:3px solid var(--r-accent);border-radius:4px;padding:.5em .75em}
/* impact tiles + skill matrix */
.rs-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(30mm,1fr));gap:3mm}
.rs-tiles div{border:1px solid color-mix(in srgb,var(--r-accent) 35%,transparent);background:color-mix(in srgb,var(--r-accent) 7%,transparent);border-radius:4px;padding:.55em .7em;display:flex;flex-direction:column}
.rs-tiles strong{font-family:var(--r-hfont);font-size:1.7em;line-height:1.05;color:var(--r-head)}.rs-tiles span{font-size:.88em;color:var(--r-muted)}
.rs-matrix{margin:0;display:grid;gap:2px}.rs-matrix div{display:flex;justify-content:space-between;gap:10px;padding:2px 0;border-bottom:1px dotted color-mix(in srgb,currentColor 30%,transparent)}.rs-matrix dd{margin:0;color:var(--r-accent);font-weight:600;font-size:.92em}
.rs-tags-outline span{background:none;border:1px solid var(--r-accent);color:var(--r-accent);border-radius:99px}

.rs-selected,.rs-head-selected .rs-head,.rs-head-selected .rs-head-side{outline:2px solid #2F5BFF;outline-offset:3px;border-radius:2px}
@media print{.rs-selected,.rs-head-selected .rs-head,.rs-head-selected .rs-head-side{outline:none}}
`;
