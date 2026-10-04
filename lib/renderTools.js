// Renderers for the "Sections" tools: process, before/after, tabs, scrolling text, newsletter, booking, embed,
// image + text, team and big statement.
import { btn, csv, esc, ext, h2, list, nl, safeUrl } from './html';

const word = (v, allowed, d) => (allowed.includes(v) ? v : d);
const clamp = (v, lo, hi, d) => { const n = Number(v); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };
const ratio = (r) => (/^\d+\/\d+$/.test(String(r)) ? r : '16/9');
const img = (src, alt = '') => (src ? `<img src="${safeUrl(src)}" alt="${esc(alt)}" loading="lazy">` : '');

// Turns share links into embeddable ones for common services
function embedSrc(url) {
  const u = String(url || '').trim();
  let m;
  if ((m = u.match(/figma\.com\/(file|design|proto)\//))) return `https://www.figma.com/embed?embed_host=folio&url=${encodeURIComponent(u)}`;
  if ((m = u.match(/codepen\.io\/([^/]+)\/(?:pen|full)\/([^/?#]+)/))) return `https://codepen.io/${m[1]}/embed/${m[2]}?default-tab=result`;
  if ((m = u.match(/open\.spotify\.com\/(track|album|playlist|episode|show|artist)\/([\w]+)/))) return `https://open.spotify.com/embed/${m[1]}/${m[2]}`;
  if (/soundcloud\.com\//.test(u)) return `https://w.soundcloud.com/player/?url=${encodeURIComponent(u)}&visual=true`;
  if ((m = u.match(/loom\.com\/share\/([\w]+)/))) return `https://www.loom.com/embed/${m[1]}`;
  if ((m = u.match(/docs\.google\.com\/presentation\/d\/([\w-]+)/))) return `https://docs.google.com/presentation/d/${m[1]}/embed`;
  if ((m = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/))) return `https://www.youtube.com/embed/${m[1]}`;
  if (/^https?:\/\//i.test(u)) return u;
  return '';
}

export const TOOL_RENDERERS = {
  process: (p) => {
    const v = word(p.variant, ['row', 'timeline', 'arrows', 'circles', 'zigzag', 'big', 'icons', 'minimal'], 'row');
    return `${h2(p.title)}<ol class="pf-proc pf-proc-${v}">${list(p.items).map((s, i) =>
      `<li><span class="pf-proc-n">${v === 'icons' && s.icon ? esc(s.icon) : String(i + 1).padStart(2, '0')}</span><div><h3 class="pf-h4">${esc(s.title)}</h3>${s.desc ? `<p class="pf-meta">${nl(s.desc)}</p>` : ''}</div></li>`
    ).join('')}</ol>`;
  },

  beforeafter: (p) => {
    const v = word(p.variant, ['slider', 'side', 'hover', 'stacked'], 'slider');
    const label = (t, cls) => (t ? `<span class="pf-ba-label ${cls}">${esc(t)}</span>` : '');
    const cap = p.caption ? `<p class="pf-meta pf-ba-cap">${esc(p.caption)}</p>` : '';
    if (v === 'side' || v === 'stacked') {
      return `${h2(p.title)}<div class="pf-ba-pair pf-ba-${v}" style="--r:${ratio(p.ratio)}"><figure>${img(p.before, p.beforeLabel)}${label(p.beforeLabel, 'pf-ba-l')}</figure><figure>${img(p.after, p.afterLabel)}${label(p.afterLabel, 'pf-ba-l')}</figure></div>${cap}`;
    }
    return `${h2(p.title)}<div class="pf-ba pf-ba-${v}" data-ba style="--r:${ratio(p.ratio)};--pos:50%">${img(p.after, p.afterLabel)}<div class="pf-ba-top">${img(p.before, p.beforeLabel)}</div>` +
      `${label(p.beforeLabel, 'pf-ba-l')}${label(p.afterLabel, 'pf-ba-r')}${v === 'slider' ? '<span class="pf-ba-handle" aria-hidden="true"></span><input type="range" min="0" max="100" value="50" class="pf-ba-range" aria-label="Compare before and after">' : ''}</div>${cap}`;
  },

  tabs: (p) => {
    const v = word(p.variant, ['top', 'pills', 'side', 'underline', 'cards'], 'top');
    const items = list(p.items);
    const tabs = items.map((t, i) => `<button type="button" role="tab" aria-selected="${i === 0}" class="pf-tab${i ? '' : ' pf-on'}" data-tab="${i}">${esc(t.label)}</button>`).join('');
    const panels = items.map((t, i) => `<div class="pf-tabpanel" role="tabpanel"${i ? ' hidden' : ''}><div>${t.title ? `<h3 class="pf-h3">${esc(t.title)}</h3>` : ''}${t.text ? `<p>${nl(t.text)}</p>` : ''}</div>${t.image ? `<img src="${safeUrl(t.image)}" alt="" loading="lazy">` : ''}</div>`).join('');
    return `${h2(p.title)}<div class="pf-tabs pf-tabs-${v}" data-tabs><div class="pf-tablist" role="tablist">${tabs}</div><div class="pf-tabpanels">${panels}</div></div>`;
  },

  marquee: (p) => {
    const v = word(p.variant, ['solid', 'outline', 'double', 'band', 'tilted', 'small'], 'solid');
    const words = csv(p.text);
    const sep = p.separator ? `<i>${esc(p.separator)}</i>` : '';
    const run = words.map((w) => `<span>${esc(w)}</span>${sep}`).join('');
    const row = (rev) => `<div class="pf-mq-row${rev ? ' pf-mq-rev' : ''}"><div class="pf-mq-track" style="--mq:${clamp(p.speed, 4, 120, 30)}s"><div>${run}</div><div aria-hidden="true">${run}</div></div></div>`;
    return `<div class="pf-mq pf-mq-${v}" aria-label="${esc(words.join(', '))}">${row(false)}${v === 'double' ? row(true) : ''}</div>`;
  },

  newsletter: (p) => {
    const v = word(p.variant, ['inline', 'card', 'split', 'banner', 'minimal'], 'card');
    const action = p.action ? safeUrl(p.action) : p.email ? `mailto:${esc(p.email)}?subject=Newsletter%20signup` : '#';
    const method = p.action ? 'post' : 'get';
    const form = `<form class="pf-nl-form" action="${action}" method="${method}"${p.action ? ' target="_blank"' : ''}><input class="pf-input" type="email" name="email" placeholder="you@example.com" required aria-label="Email address"><button class="pf-btn pf-btn-primary" type="submit">${esc(p.buttonText || 'Subscribe')}</button></form>`;
    const copy = `<div class="pf-nl-copy">${h2(p.title)}${p.text ? `<p class="pf-meta">${nl(p.text)}</p>` : ''}${form}</div>`;
    return `<div class="pf-nl pf-nl-${v}">${v === 'split' && p.image ? `<img src="${safeUrl(p.image)}" alt="" loading="lazy">` : ''}${copy}</div>`;
  },

  booking: (p) => {
    const v = word(p.variant, ['embed', 'split', 'button'], 'embed');
    const url = /^https?:\/\//.test(String(p.url || '')) ? p.url : '';
    const copy = `<div class="pf-book-copy">${h2(p.title)}${p.text ? `<p class="pf-lead">${nl(p.text)}</p>` : ''}${v === 'button' || !url ? `<div class="pf-actions">${btn(p.buttonText || 'Book a call', url || '#', 'primary', true)}</div>` : ''}</div>`;
    if (v === 'button' || !url) return `<div class="pf-book pf-book-button">${copy}</div>`;
    const frame = `<div class="pf-book-frame"><iframe src="${safeUrl(url)}" title="Booking calendar" loading="lazy" style="height:${clamp(p.height, 300, 1200, 660)}px"></iframe></div>`;
    return `<div class="pf-book pf-book-${v}">${copy}${frame}</div>`;
  },

  embed: (p) => {
    const src = embedSrc(p.url);
    const frame = word(p.frame, ['plain', 'card', 'browser'], 'plain');
    if (!src) return `${h2(p.title)}<p class="pf-meta">Paste a link to embed.</p>`;
    return `${h2(p.title)}<div class="pf-emb pf-emb-${frame}">${frame === 'browser' ? '<div class="pf-frame-bar"><i></i><i></i><i></i></div>' : ''}<iframe src="${esc(src)}" title="${esc(p.title || 'Embedded content')}" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowfullscreen style="height:${clamp(p.height, 80, 1400, 380)}px"></iframe></div>${p.caption ? `<p class="pf-meta pf-vcap">${esc(p.caption)}</p>` : ''}`;
  },

  mediatext: (p) => {
    const v = word(p.variant, ['left', 'right', 'top', 'overlap', 'background', 'bleed', 'circle', 'framed'], 'left');
    const points = String(p.points || '').split('\n').map((x) => x.trim()).filter(Boolean);
    const copy = `<div class="pf-mt-copy">${p.kicker ? `<p class="pf-kicker">${esc(p.kicker)}</p>` : ''}<h2 class="pf-h2">${nl(p.title)}</h2>${p.text ? `<p class="pf-lead">${nl(p.text)}</p>` : ''}` +
      `${points.length ? `<ul class="pf-mt-points">${points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}${p.buttonText ? `<div class="pf-actions">${btn(p.buttonText, p.buttonUrl)}</div>` : ''}</div>`;
    const media = p.image ? `<div class="pf-mt-media">${img(p.image)}</div>` : '';
    const bg = v === 'background' && p.image ? ` style="--mt-img:url('${safeUrl(p.image)}')"` : '';
    return `<div class="pf-mt pf-mt-${v}"${bg}>${v === 'right' ? copy + media : v === 'background' ? copy : media + copy}</div>`;
  },

  team: (p) => {
    const v = word(p.variant, ['cards', 'circles', 'overlay', 'minimal', 'list'], 'cards');
    return `${h2(p.title)}<div class="pf-team pf-team-${v}">${list(p.items).map((m) => {
      const inner = `<div class="pf-team-photo">${img(m.photo, m.name)}</div><div class="pf-team-info"><strong>${esc(m.name)}</strong><span class="pf-meta">${esc(m.role)}</span></div>`;
      return m.url ? `<a class="pf-team-item" href="${safeUrl(m.url)}"${ext(m.url)}>${inner}</a>` : `<div class="pf-team-item">${inner}</div>`;
    }).join('')}</div>`;
  },

  statement: (p) => {
    const v = word(p.variant, ['huge', 'gradient', 'outline', 'marker', 'split', 'boxed'], 'huge');
    let text = nl(p.text);
    const hl = String(p.highlight || '').trim();
    if (hl) {
      const safe = esc(hl).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      text = text.replace(new RegExp(safe, 'i'), (m) => `<em class="pf-st-hl">${m}</em>`);
    }
    return `<div class="pf-st pf-st-${v}">${p.label ? `<p class="pf-st-label">${esc(p.label)}</p>` : ''}<p class="pf-st-text">${text}</p>${p.author ? `<p class="pf-meta pf-st-author">— ${esc(p.author)}</p>` : ''}</div>`;
  },
};

export const TOOL_CSS = `
/* process */
.pf-proc{list-style:none;margin:0;padding:0;display:grid;gap:22px;text-align:left;counter-reset:s}
.pf-proc li{display:flex;gap:16px;position:relative}
.pf-proc h3{margin:0 0 4px!important}.pf-proc p{margin:0}
.pf-proc-n{flex:none;font-family:var(--pf-hfont);font-weight:700;color:var(--pf-primary)}
.pf-proc-row{grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}.pf-proc-row li{flex-direction:column;gap:10px;padding-top:18px;border-top:3px solid var(--pf-primary)}
.pf-proc-timeline{border-left:2px solid var(--pf-border);margin-left:20px;gap:30px}.pf-proc-timeline li{padding-left:34px}
.pf-proc-timeline .pf-proc-n{position:absolute;left:-21px;top:-4px;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:var(--pf-primary);color:var(--pf-on-primary);font-size:.85em}
.pf-proc-arrows{grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:34px}.pf-proc-arrows li{flex-direction:column;padding:24px;background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:var(--pf-radius)}
.pf-proc-arrows li:not(:last-child)::after{content:'→';position:absolute;right:-26px;top:50%;transform:translateY(-50%);color:var(--pf-primary);font-size:1.4em}
.pf-proc-circles{grid-template-columns:repeat(auto-fit,minmax(170px,1fr));text-align:center}.pf-proc-circles li{flex-direction:column;align-items:center}
.pf-proc-circles .pf-proc-n{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;border:2px solid var(--pf-primary);font-size:1.2em;background:var(--pf-bg);position:relative;z-index:1}
.pf-proc-circles li:not(:last-child)::before{content:'';position:absolute;top:32px;left:calc(50% + 32px);right:calc(-50% + 32px);border-top:2px dashed var(--pf-border)}
.pf-proc-zigzag li{width:62%;padding:22px;background:var(--pf-surface);border-radius:var(--pf-radius)}.pf-proc-zigzag li:nth-child(even){margin-left:auto}
.pf-proc-big{grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:34px}.pf-proc-big li{flex-direction:column;gap:6px}
.pf-proc-big .pf-proc-n{font-size:4.5em;line-height:.9;color:transparent;-webkit-text-stroke:2px var(--pf-primary)}
.pf-proc-icons{grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}.pf-proc-icons li{flex-direction:column;padding:26px;background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:var(--pf-radius)}
.pf-proc-icons .pf-proc-n{width:56px;height:56px;border-radius:16px;display:grid;place-items:center;background:color-mix(in srgb,var(--pf-primary) 14%,transparent);font-size:1.6em}
.pf-proc-minimal{gap:0}.pf-proc-minimal li{padding:18px 0;border-top:1px solid var(--pf-border);align-items:baseline}.pf-proc-minimal .pf-proc-n{min-width:3ch}

/* before / after */
.pf-ba{position:relative;aspect-ratio:var(--r);overflow:hidden;border-radius:var(--pf-radius);user-select:none}
.pf-ba img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.pf-ba-top{position:absolute;inset:0;clip-path:inset(0 calc(100% - var(--pos)) 0 0)}
.pf-ba-hover .pf-ba-top{transition:clip-path .5s ease}.pf-ba-hover:hover .pf-ba-top{clip-path:inset(0 100% 0 0)}
.pf-ba-handle{position:absolute;top:0;bottom:0;left:var(--pos);width:3px;margin-left:-1.5px;background:#fff;box-shadow:0 0 10px rgba(0,0,0,.4);pointer-events:none}
.pf-ba-handle::after{content:'⟷';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:42px;height:42px;border-radius:50%;background:#fff;color:#111;display:grid;place-items:center;font-size:1.1em}
.pf-ba-range{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:ew-resize;margin:0}
.pf-ba-label{position:absolute;top:14px;padding:4px 12px;border-radius:99px;background:rgba(0,0,0,.6);color:#fff;font-size:.8em;font-weight:600;z-index:2}
.pf-ba-l{left:14px}.pf-ba-r{right:14px}
.pf-ba-pair{display:grid;grid-template-columns:1fr 1fr;gap:14px}.pf-ba-stacked{grid-template-columns:1fr}
.pf-ba-pair figure{position:relative;margin:0;aspect-ratio:var(--r);overflow:hidden;border-radius:var(--pf-radius)}
.pf-ba-pair img{width:100%;height:100%;object-fit:cover}
.pf-ba-cap{text-align:center;margin-top:10px}

/* tabs */
.pf-tablist{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:22px}
.pf-tab{font:inherit;font-weight:600;padding:10px 18px;border:1px solid var(--pf-border);background:var(--pf-surface);color:var(--pf-muted);border-radius:var(--pf-radius) var(--pf-radius) 0 0;cursor:pointer}
.pf-tab.pf-on{background:var(--pf-primary);color:var(--pf-on-primary);border-color:var(--pf-primary)}
.pf-tabpanel{display:grid;grid-template-columns:1fr 1fr;gap:clamp(20px,4cqi,48px);align-items:center;text-align:left}
.pf-tabpanel[hidden]{display:none}.pf-tabpanel img{width:100%;border-radius:var(--pf-radius);aspect-ratio:4/3;object-fit:cover}
.pf-tabpanel:not(:has(img)){grid-template-columns:1fr}
.pf-tabs-pills .pf-tab{border-radius:999px}
.pf-tabs-underline .pf-tablist{border-bottom:1px solid var(--pf-border);gap:24px}.pf-tabs-underline .pf-tab{background:none;border:0;border-bottom:3px solid transparent;border-radius:0;padding:10px 2px}
.pf-tabs-underline .pf-tab.pf-on{background:none;color:var(--pf-text);border-bottom-color:var(--pf-primary)}
.pf-tabs-side{display:grid;grid-template-columns:220px 1fr;gap:32px}.pf-tabs-side .pf-tablist{flex-direction:column;margin:0}.pf-tabs-side .pf-tab{border-radius:var(--pf-radius);text-align:left}
.pf-tabs-cards .pf-tablist{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr))}.pf-tabs-cards .pf-tab{border-radius:var(--pf-radius);padding:18px;font-size:1.05em}

/* scrolling text */
.pf-mq{overflow:hidden;font-family:var(--pf-hfont);font-weight:800;line-height:1.1}
.pf-mq-row{overflow:hidden;padding:.15em 0}
.pf-mq-track{display:flex;width:max-content;animation:pf-marq var(--mq,30s) linear infinite}
.pf-mq-rev .pf-mq-track{animation-direction:reverse}
.pf-mq-track>div{display:flex;align-items:center;gap:.5em;padding-right:.5em}
.pf-mq-track i{font-style:normal;color:var(--pf-primary)}
.pf-mq-solid,.pf-mq-outline,.pf-mq-double{font-size:clamp(2.4rem,8cqi,6rem)}
.pf-mq-outline span{color:transparent;-webkit-text-stroke:1.5px var(--pf-text)}
.pf-mq-double .pf-mq-rev span{color:transparent;-webkit-text-stroke:1.5px var(--pf-text)}
.pf-mq-band,.pf-mq-tilted{font-size:clamp(1.4rem,4cqi,2.6rem);background:var(--pf-primary);color:var(--pf-on-primary);padding:.4em 0}
.pf-mq-band i,.pf-mq-tilted i{color:inherit;opacity:.7}
.pf-mq-tilted{transform:rotate(-3deg);margin:30px -40px}
.pf-mq-small{font-size:1em;font-weight:600;text-transform:uppercase;letter-spacing:.1em;border-block:1px solid var(--pf-border);padding:.6em 0}

/* newsletter */
.pf-nl{text-align:left}.pf-nl .pf-title{margin-bottom:.4em!important}
.pf-nl-form{display:flex;gap:10px;margin-top:18px;max-width:520px}.pf-nl-form .pf-input{margin:0;flex:1}
.pf-nl-card{max-width:720px;margin:0 auto;text-align:center;padding:clamp(28px,5cqi,56px);background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:calc(var(--pf-radius) * 1.5)}
.pf-nl-card .pf-nl-form,.pf-nl-banner .pf-nl-form{margin-inline:auto}
.pf-nl-split{display:grid;grid-template-columns:1fr 1.1fr;gap:clamp(24px,5cqi,56px);align-items:center}.pf-nl-split img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--pf-radius)}
.pf-nl-banner{text-align:center;background:var(--pf-primary);color:var(--pf-on-primary);border-radius:calc(var(--pf-radius) * 1.5);padding:clamp(28px,5cqi,56px)}
.pf-nl-banner .pf-meta{color:inherit;opacity:.85}.pf-nl-banner .pf-btn-primary{background:var(--pf-on-primary);color:var(--pf-primary)!important;border-color:var(--pf-on-primary)}
.pf-nl-inline .pf-nl-copy{display:grid;grid-template-columns:1fr 1fr;gap:6px 32px;align-items:center}.pf-nl-inline .pf-title,.pf-nl-inline .pf-meta{grid-column:1}.pf-nl-inline .pf-nl-form{grid-column:2;grid-row:1 / span 2;margin:0;max-width:none}
.pf-nl-minimal .pf-nl-form{border-bottom:2px solid var(--pf-text);gap:0}.pf-nl-minimal .pf-input{border:0;background:none;padding-left:0}.pf-nl-minimal .pf-btn{background:none;border:0;color:var(--pf-text)!important}

/* booking */
.pf-book-frame{border:1px solid var(--pf-border);border-radius:var(--pf-radius);overflow:hidden;background:#fff}
.pf-book-frame iframe{display:block;width:100%;border:0}
.pf-book-embed .pf-book-copy{text-align:center;margin-bottom:20px}.pf-book-embed .pf-lead{margin-inline:auto}
.pf-book-split{display:grid;grid-template-columns:.8fr 1.2fr;gap:clamp(24px,5cqi,56px);align-items:start;text-align:left}
.pf-book-button{text-align:center}.pf-book-button .pf-lead{margin-inline:auto}.pf-book-button .pf-actions{justify-content:center}

/* embed */
.pf-emb iframe{display:block;width:100%;border:0;border-radius:var(--pf-radius)}
.pf-emb-card{padding:12px;background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:calc(var(--pf-radius) + 10px)}
.pf-emb-browser{border:1px solid var(--pf-border);border-radius:calc(var(--pf-radius) + 2px);overflow:hidden}.pf-emb-browser iframe{border-radius:0}

/* image + text */
.pf-mt{display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,5cqi,64px);align-items:center;text-align:left}
.pf-mt-media img{width:100%;aspect-ratio:5/4;object-fit:cover;border-radius:var(--pf-radius)}
.pf-mt-points{list-style:none;padding:0;margin:18px 0 0;display:grid;gap:10px}
.pf-mt-points li{padding-left:28px;position:relative}.pf-mt-points li::before{content:'✓';position:absolute;left:0;top:0;width:20px;height:20px;border-radius:50%;background:color-mix(in srgb,var(--pf-primary) 15%,transparent);color:var(--pf-primary);font-size:.75em;display:grid;place-items:center;font-weight:700}
.pf-mt-top{grid-template-columns:1fr;text-align:center}.pf-mt-top .pf-mt-media img{aspect-ratio:21/9}.pf-mt-top .pf-lead{margin-inline:auto}.pf-mt-top .pf-mt-points{justify-content:center}.pf-mt-top .pf-actions{justify-content:center}
.pf-mt-overlap{gap:0}.pf-mt-overlap .pf-mt-copy{background:var(--pf-surface);padding:clamp(24px,4cqi,48px);border-radius:var(--pf-radius);margin-left:-70px;position:relative;box-shadow:0 30px 60px -25px rgba(0,0,0,.35)}
.pf-mt-background{grid-template-columns:1fr;min-height:480px;align-items:end;padding:clamp(24px,5cqi,56px);border-radius:calc(var(--pf-radius) * 1.5);background:linear-gradient(rgba(0,0,0,.15),rgba(0,0,0,.65)),var(--mt-img,var(--pf-primary)) center/cover;color:#fff}
.pf-mt-background .pf-lead,.pf-mt-background .pf-kicker{color:rgba(255,255,255,.88)}.pf-mt-background .pf-mt-copy{max-width:620px}
.pf-mt-bleed{gap:0;background:var(--pf-surface);border-radius:calc(var(--pf-radius) * 1.5);overflow:hidden}.pf-mt-bleed .pf-mt-media img{border-radius:0;aspect-ratio:auto;height:100%;min-height:420px}.pf-mt-bleed .pf-mt-copy{padding:clamp(24px,5cqi,56px)}
.pf-mt-circle .pf-mt-media img{border-radius:50%;aspect-ratio:1;max-width:440px;margin:auto}
.pf-mt-framed .pf-mt-media{position:relative}.pf-mt-framed .pf-mt-media::before{content:'';position:absolute;inset:0;transform:translate(18px,18px);border:2px solid var(--pf-primary);border-radius:var(--pf-radius)}.pf-mt-framed .pf-mt-media img{position:relative}

/* team */
.pf-team{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:22px;text-align:left}
.pf-team-item{text-decoration:none;color:inherit;display:block}
.pf-team-photo{overflow:hidden;border-radius:var(--pf-radius)}.pf-team-photo img{width:100%;aspect-ratio:4/5;object-fit:cover;transition:transform .5s}
.pf-team-item:hover .pf-team-photo img{transform:scale(1.04)}
.pf-team-info{display:flex;flex-direction:column;padding-top:12px}
.pf-team-cards .pf-team-item{background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:var(--pf-radius);overflow:hidden}.pf-team-cards .pf-team-photo{border-radius:0}.pf-team-cards .pf-team-info{padding:14px 16px 18px}
.pf-team-circles{text-align:center}.pf-team-circles .pf-team-photo{border-radius:50%;max-width:180px;margin:0 auto}.pf-team-circles .pf-team-photo img{aspect-ratio:1}
.pf-team-overlay .pf-team-item{position:relative;border-radius:var(--pf-radius);overflow:hidden}.pf-team-overlay .pf-team-info{position:absolute;inset:auto 0 0;padding:40px 16px 16px;background:linear-gradient(transparent,rgba(0,0,0,.75));color:#fff}.pf-team-overlay .pf-meta{color:rgba(255,255,255,.85)}
.pf-team-minimal .pf-team-photo img{filter:grayscale(1)}.pf-team-minimal .pf-team-item:hover img{filter:none}
.pf-team-list{grid-template-columns:1fr;gap:0}.pf-team-list .pf-team-item{display:flex;align-items:center;gap:16px;padding:14px 0;border-top:1px solid var(--pf-border)}.pf-team-list .pf-team-photo{width:64px;flex:none;border-radius:50%}.pf-team-list .pf-team-photo img{aspect-ratio:1}.pf-team-list .pf-team-info{padding:0}

/* big statement */
.pf-st{text-align:center;max-width:1000px;margin:0 auto}
.pf-st-label{font-size:.8em;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--pf-primary);margin-bottom:14px!important}
.pf-st-text{font-family:var(--pf-hfont);font-weight:var(--pf-hweight);letter-spacing:var(--pf-hspacing);font-size:calc(clamp(2rem,6cqi,4.4rem) * var(--t-scale,1));line-height:1.1;margin:0!important}
.pf-st-hl{font-style:normal;color:var(--pf-primary)}
.pf-st-gradient .pf-st-hl{background:linear-gradient(135deg,var(--pf-primary),var(--pf-secondary));-webkit-background-clip:text;background-clip:text;color:transparent}
.pf-st-outline .pf-st-text{color:transparent;-webkit-text-stroke:1.5px var(--pf-text)}.pf-st-outline .pf-st-hl{color:var(--pf-primary);-webkit-text-stroke:0}
.pf-st-marker .pf-st-hl{color:inherit;background:linear-gradient(transparent 58%,color-mix(in srgb,var(--pf-secondary) 60%,transparent) 58%)}
.pf-st-split{display:grid;grid-template-columns:200px 1fr;gap:32px;text-align:left;max-width:none}.pf-st-split .pf-st-text{font-size:calc(clamp(1.7rem,4.5cqi,3.2rem) * var(--t-scale,1))}
.pf-st-boxed{background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:calc(var(--pf-radius) * 1.5);padding:clamp(28px,6cqi,72px)}
.pf-st-author{margin-top:18px!important}

@container (max-width:680px){
  .pf-tabpanel,.pf-tabs-side,.pf-nl-split,.pf-nl-inline .pf-nl-copy,.pf-book-split,.pf-mt,.pf-st-split,.pf-ba-pair{grid-template-columns:1fr}
  .pf-nl-inline .pf-nl-form{grid-column:1;grid-row:auto}
  .pf-mt-overlap .pf-mt-copy{margin:-40px 12px 0}
  .pf-mt-right .pf-mt-media{order:-1}
  .pf-proc-zigzag li{width:auto}
  .pf-proc-arrows li:not(:last-child)::after{content:'↓';right:auto;left:50%;top:auto;bottom:-30px;transform:translateX(-50%)}
  .pf-proc-circles li::before{display:none}
  .pf-nl-form{flex-direction:column}
}
@media (prefers-reduced-motion:reduce){.pf-mq-track{animation:none}}
`;
