// Renderers for the Developer and Interactive blocks. Markup is static HTML; behaviour comes from lib/runtime.js,
// which finds these blocks by their data-* attributes. Without the runtime (the builder canvas) they still render sensibly.
import { btn, csv, esc, ext, h2, json, list, nl, safeUrl } from './html';

const GH_SVG = '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>';
const ARROW = '<span aria-hidden="true">↗</span>';

const linkBtns = (live, gh) =>
  [
    live && `<a class="pf-btn pf-btn-primary pf-btn-sm" href="${safeUrl(live)}" target="_blank" rel="noopener">Live demo ${ARROW}</a>`,
    gh && `<a class="pf-btn pf-btn-ghost pf-btn-sm" href="${safeUrl(gh)}" target="_blank" rel="noopener">${GH_SVG} Code</a>`,
  ].filter(Boolean).join('');
const tagList = (tags) => (tags.length ? `<div class="pf-tags">${tags.map((t) => `<span class="pf-tag">${esc(t)}</span>`).join('')}</div>` : '');
const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Number(v) || 0));
const monogram = (s) => esc(String(s || '?').replace(/[^\p{L}\p{N}+#]/gu, '').slice(0, 2) || '?');

// Tech name -> devicon folder. Unknown names fall back to a letter tile.
const DEVICON = {
  react: 'react', 'react native': 'react', 'next.js': 'nextjs', nextjs: 'nextjs', next: 'nextjs', 'node.js': 'nodejs', node: 'nodejs', nodejs: 'nodejs',
  typescript: 'typescript', javascript: 'javascript', 'tailwind css': 'tailwindcss', tailwind: 'tailwindcss', tailwindcss: 'tailwindcss', redux: 'redux',
  express: 'express', graphql: 'graphql', mysql: 'mysql', postgresql: 'postgresql', postgres: 'postgresql', mongodb: 'mongodb', redis: 'redis', sqlite: 'sqlite',
  docker: 'docker', aws: 'amazonwebservices', nginx: 'nginx', 'github actions': 'githubactions', linux: 'linux', kubernetes: 'kubernetes', git: 'git', github: 'github',
  python: 'python', django: 'django', flask: 'flask', fastapi: 'fastapi', java: 'java', spring: 'spring', go: 'go', golang: 'go', rust: 'rust', 'c++': 'cplusplus', c: 'c',
  'c#': 'csharp', '.net': 'dot-net', php: 'php', laravel: 'laravel', vue: 'vuejs', 'vue.js': 'vuejs', angular: 'angular', svelte: 'svelte', firebase: 'firebase',
  figma: 'figma', jest: 'jest', prisma: 'prisma', sass: 'sass', html: 'html5', html5: 'html5', css: 'css3', css3: 'css3', flutter: 'flutter', dart: 'dart',
  kotlin: 'kotlin', swift: 'swift', azure: 'azure', gcp: 'googlecloud', 'google cloud': 'googlecloud', vercel: 'vercel', terraform: 'terraform', jenkins: 'jenkins',
  webpack: 'webpack', vite: 'vitejs', bootstrap: 'bootstrap', jquery: 'jquery', 'socket.io': 'socketio', elasticsearch: 'elasticsearch', rabbitmq: 'rabbitmq',
  kafka: 'apachekafka', graphana: 'grafana', grafana: 'grafana', npm: 'npm', yarn: 'yarn', pnpm: 'pnpm', bash: 'bash', vscode: 'vscode', postman: 'postman',
};
const DEVICON_FILE = { amazonwebservices: 'amazonwebservices-original-wordmark' };
export function techIcon(name) {
  const slug = DEVICON[String(name).toLowerCase()];
  if (!slug) return `<span class="pf-tech-ico pf-noicon"><b>${monogram(name)}</b></span>`;
  const src = `https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/${slug}/${DEVICON_FILE[slug] || slug + '-original'}.svg`;
  return `<span class="pf-tech-ico"><img src="${src}" alt="" loading="lazy" onerror="this.parentNode.classList.add('pf-noicon')"><b>${monogram(name)}</b></span>`;
}

const PLATFORM_COLORS = {
  leetcode: '#FFA116', codeforces: '#1F8ACB', github: '#24292F', hackerrank: '#00B35F', codechef: '#5B4638', geeksforgeeks: '#2F8D46',
  atcoder: '#222222', kaggle: '#20BEFF', 'stack overflow': '#F48024', stackoverflow: '#F48024', topcoder: '#29A7DF', hackerearth: '#323754',
};
const OSS_COLORS = { 'Merged PR': '#8957E5', 'Open PR': '#1F883D', Issue: '#BF8700', Maintainer: '#CF222E', Contributor: '#0969DA', Docs: '#57606A' };
const lhColor = (v) => (v >= 90 ? '#0CCE6B' : v >= 50 ? '#FFA400' : '#FF4E42');

// Points spread evenly over a sphere (golden-angle spiral)
export function spherePoints(n) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(1 - y * y);
    const a = i * Math.PI * (3 - Math.sqrt(5));
    pts.push([Math.cos(a) * r, y, Math.sin(a) * r]);
  }
  return pts;
}
const spherePos = ([x, y, z]) => {
  const s = 0.62 + (z + 1) * 0.28;
  return `left:${(50 + x * 40).toFixed(2)}%;top:${(50 + y * 40).toFixed(2)}%;transform:translate(-50%,-50%) scale(${s.toFixed(3)});opacity:${(0.3 + (z + 1) * 0.35).toFixed(2)};z-index:${Math.round((z + 1) * 50)}`;
};

export const DEV_RENDERERS = {
  hero3d: (p) => {
    const words = csv(p.words).slice(0, 40);
    const pts = spherePoints(words.length);
    return `<div class="pf-h3d"><div class="pf-hero-text">${p.available ? `<p class="pf-avail"><i></i>${esc(p.available)}</p>` : ''}${p.kicker ? `<p class="pf-kicker">${esc(p.kicker)}</p>` : ''}<h1 class="pf-h1">${nl(p.title)}</h1>` +
      `${p.subtitle ? `<p class="pf-lead">${nl(p.subtitle)}</p>` : ''}<div class="pf-actions">${btn(p.buttonText, p.buttonUrl)}${btn(p.button2Text, p.button2Url, 'ghost')}</div></div>` +
      `<div class="pf-sphere" data-sphere aria-hidden="true"><div class="pf-sphere-glow"></div>${words.map((w, i) => `<span style="${spherePos(pts[i])}">${esc(w)}</span>`).join('')}</div></div>`;
  },

  techstack: (p) =>
    `${h2(p.title)}<div class="pf-stack pf-stack-${p.display === 'chips' ? 'chips' : 'icons'}">${list(p.groups).map((g) =>
      `<div class="pf-stack-group"><h3 class="pf-stack-name">${esc(g.name)}</h3><div class="pf-stack-items">${csv(g.items).map((t) => `<span class="pf-tech">${techIcon(t)}<span>${esc(t)}</span></span>`).join('')}</div></div>`
    ).join('')}</div>`,

  featured: (p) => {
    const items = list(p.items);
    const all = [...new Set(items.flatMap((it) => csv(it.tags)))];
    const filters = p.filters && all.length > 1
      ? `<div class="pf-filters" role="toolbar" aria-label="Filter projects"><button type="button" class="pf-chip pf-on" data-filter="">All</button>${all.map((t) => `<button type="button" class="pf-chip" data-filter="${esc(t)}">${esc(t)}</button>`).join('')}</div>`
      : '';
    const cards = items.map((it, i) => {
      const tags = csv(it.tags);
      const shots = list(it.shots).filter((s) => s.src);
      return `<article class="pf-feat" data-tags="${esc(tags.join('|'))}"><div class="pf-feat-media" data-tilt>${it.image ? `<img src="${safeUrl(it.image)}" alt="${esc(it.title)}" loading="lazy">` : '<div class="pf-feat-ph"></div>'}</div>` +
        `<div class="pf-feat-body"><p class="pf-feat-num">${String(i + 1).padStart(2, '0')}</p><h3 class="pf-h3">${esc(it.title)}</h3>${it.metric ? `<p class="pf-metric">${esc(it.metric)}</p>` : ''}` +
        `${it.desc ? `<p class="pf-meta">${nl(it.desc)}</p>` : ''}${tagList(tags)}` +
        `${shots.length ? `<div class="pf-shots">${shots.map((s) => `<a href="${safeUrl(s.src)}" data-lightbox><img src="${safeUrl(s.src)}" alt="Screenshot" loading="lazy"></a>`).join('')}</div>` : ''}` +
        `<div class="pf-actions">${linkBtns(it.liveUrl, it.githubUrl)}</div></div></article>`;
    }).join('');
    return `${h2(p.title)}${filters}<div class="pf-feats pf-feats-${p.layout === 'grid' ? 'grid' : 'alt'}">${cards}</div>`;
  },

  casestudy: (p) => {
    const step = (n, title, body) => `<li><span class="pf-step-n">${n}</span><div><h3 class="pf-h4">${title}</h3>${body}</div></li>`;
    const results = list(p.results).filter((r) => r.value || r.label);
    return `<article class="pf-case"><header class="pf-case-head">${p.kicker ? `<p class="pf-kicker">${esc(p.kicker)}</p>` : ''}<h2 class="pf-h2">${nl(p.title)}</h2>${tagList(csv(p.stack))}<div class="pf-actions">${linkBtns(p.liveUrl, p.githubUrl)}</div></header>` +
      `${p.image ? `<img class="pf-case-cover" src="${safeUrl(p.image)}" alt="" loading="lazy">` : ''}<ol class="pf-case-steps">` +
      step('01', 'Problem', `<p>${nl(p.problem)}</p>`) +
      step('02', 'Solution', `<p>${nl(p.solution)}</p>`) +
      step('03', 'Architecture', `<p>${nl(p.architecture)}</p>${p.archImage ? `<a href="${safeUrl(p.archImage)}" data-lightbox><img class="pf-case-arch" src="${safeUrl(p.archImage)}" alt="Architecture diagram" loading="lazy"></a>` : ''}`) +
      step('04', 'Result', results.length ? `<div class="pf-case-results">${results.map((r) => `<div><strong>${esc(r.value)}</strong><span>${esc(r.label)}</span></div>`).join('')}</div>` : '') +
      `</ol></article>`;
  },

  architecture: (p) => {
    const layers = [];
    list(p.nodes).forEach((n) => {
      const name = String(n.layer || 'Other').trim() || 'Other';
      let g = layers.find((l) => l.name === name);
      if (!g) layers.push((g = { name, nodes: [] }));
      g.nodes.push(n);
    });
    const first = layers[0]?.nodes[0];
    const flow = layers.map((g, li) =>
      `${li ? '<div class="pf-arch-arrow" aria-hidden="true"><i></i></div>' : ''}<div class="pf-arch-layer"><p class="pf-arch-label">${esc(g.name)}</p>${g.nodes.map((n) =>
        `<button type="button" class="pf-arch-node${n === first ? ' pf-on' : ''}" data-name="${esc(n.name)}" data-tech="${esc(n.tech)}" data-desc="${esc(n.desc)}">${esc(n.name)}${n.tech ? `<small>${esc(n.tech)}</small>` : ''}</button>`
      ).join('')}</div>`
    ).join('');
    const detail = first ? `<strong>${esc(first.name)}</strong>${first.tech ? `<span class="pf-meta">${esc(first.tech)}</span>` : ''}<p>${nl(first.desc)}</p>` : '';
    return `${h2(p.title)}${p.text ? `<p class="pf-lead">${nl(p.text)}</p>` : ''}<div class="pf-arch" data-arch><div class="pf-arch-flow">${flow}</div><div class="pf-arch-detail" aria-live="polite">${detail}</div></div>` +
      `${p.image ? `<a class="pf-arch-img" href="${safeUrl(p.image)}" data-lightbox><img src="${safeUrl(p.image)}" alt="Architecture diagram" loading="lazy"></a>` : ''}`;
  },

  depgraph: (p) => {
    const raw = list(p.nodes).filter((n) => n.name);
    const groups = [...new Set(raw.map((n) => n.group || 'Other'))];
    const nodes = groups.flatMap((g) => raw.filter((n) => (n.group || 'Other') === g));
    const idx = new Map(nodes.map((n, i) => [String(n.name).toLowerCase(), i]));
    const edges = [];
    nodes.forEach((n, i) => csv(n.uses).forEach((u) => { const j = idx.get(u.toLowerCase()); if (j != null && j !== i) edges.push([i, j]); }));
    const W = 560, H = 460, cx = W / 2, cy = H / 2, R = 150;
    const pos = nodes.map((_, i) => { const a = (i / Math.max(1, nodes.length)) * Math.PI * 2 - Math.PI / 2; return [cx + Math.cos(a) * R, cy + Math.sin(a) * R, a]; });
    const degree = nodes.map((_, i) => edges.filter(([a, b]) => a === i || b === i).length);
    const g = (n) => groups.indexOf(n.group || 'Other') % 6;
    const lines = edges.map(([a, b]) => {
      const [x1, y1] = pos[a], [x2, y2] = pos[b];
      const qx = (x1 + x2) / 4 + cx / 2, qy = (y1 + y2) / 4 + cy / 2;
      return `<path class="pf-dg-edge" data-a="${a}" data-b="${b}" d="M${x1.toFixed(1)} ${y1.toFixed(1)}Q${qx.toFixed(1)} ${qy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}"/>`;
    }).join('');
    const dots = nodes.map((n, i) => {
      const [x, y, a] = pos[i];
      const lx = cx + Math.cos(a) * (R + 16), ly = cy + Math.sin(a) * (R + 16);
      const anchor = Math.abs(Math.cos(a)) < 0.2 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end';
      return `<g class="pf-dg-node pf-dg-g${g(n)}" data-i="${i}" tabindex="0"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${6 + Math.min(6, degree[i])}"/><text x="${lx.toFixed(1)}" y="${(ly + 5).toFixed(1)}" text-anchor="${anchor}">${esc(n.name)}</text></g>`;
    }).join('');
    const legend = groups.map((name, i) => `<span class="pf-dg-g${i % 6}"><i></i>${esc(name)}</span>`).join('');
    return `${h2(p.title)}${p.text ? `<p class="pf-lead">${nl(p.text)}</p>` : ''}<div class="pf-dg" data-depgraph><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Technology dependency graph">${lines}${dots}</svg><div class="pf-dg-legend">${legend}</div></div>`;
  },

  github: (p, theme) => {
    const user = /^[A-Za-z0-9-]{1,39}$/.test(String(p.username || '')) ? p.username : '';
    if (!user) return `${h2(p.title)}<p class="pf-meta">Add your GitHub username.</p>`;
    const n = clamp(p.repoCount, 0, 12);
    const hex = String(theme?.primary || '#2F5BFF').replace('#', '').slice(0, 6);
    const skeleton = Array.from({ length: n }, () => '<div class="pf-card pf-card-pad pf-gh-repo pf-skel"><b></b><p></p><p></p></div>').join('');
    return `${h2(p.title)}<div class="pf-gh" data-gh="${esc(user)}" data-count="${n}" data-sort="${p.sort === 'updated' ? 'updated' : 'stars'}">` +
      `<div class="pf-gh-profile"><img class="pf-gh-avatar" src="https://github.com/${esc(user)}.png?size=120" alt="" loading="lazy"><div class="pf-gh-who"><h3 class="pf-h4"><a href="https://github.com/${esc(user)}" target="_blank" rel="noopener">@${esc(user)}</a></h3><p class="pf-meta pf-gh-bio">Live data from GitHub</p></div>` +
      `<div class="pf-gh-nums"><span><b data-k="public_repos">—</b>Repos</span><span><b data-k="stars">—</b>Stars</span><span><b data-k="followers">—</b>Followers</span></div></div>` +
      `${p.showChart ? `<div class="pf-gh-chart"><img src="https://ghchart.rshah.org/${esc(hex)}/${esc(user)}" alt="GitHub contributions of ${esc(user)}" loading="lazy" onerror="this.parentNode.remove()"></div>` : ''}` +
      `${p.showLanguages ? '<div class="pf-gh-langs" hidden><div class="pf-gh-langbar"></div><ul class="pf-gh-langlist"></ul></div>' : ''}` +
      `${n ? `<div class="pf-grid pf-cols-3 pf-gh-repos">${skeleton}</div>` : ''}</div>`;
  },

  codingstats: (p) =>
    `${h2(p.title)}<div class="pf-grid pf-cols-4 pf-cs-grid">${list(p.items).map((it) => {
      const color = PLATFORM_COLORS[String(it.platform || '').toLowerCase()] || 'var(--pf-primary)';
      const rows = String(it.stats || '').split('\n').map((l) => l.split(':')).filter((r) => r[0].trim());
      const [top, ...rest] = rows;
      const inner = `<div class="pf-cs-head"><span class="pf-cs-badge" style="background:${color}">${monogram(it.platform)}</span><div><strong>${esc(it.platform)}</strong><span class="pf-meta">${esc(it.handle)}</span></div></div>` +
        `${top ? `<p class="pf-cs-top"><strong>${esc((top[1] || '').trim())}</strong><span>${esc(top[0].trim())}</span></p>` : ''}` +
        `${rest.length ? `<dl class="pf-cs-rows">${rest.map((r) => `<div><dt>${esc(r[0].trim())}</dt><dd>${esc(r.slice(1).join(':').trim())}</dd></div>`).join('')}</dl>` : ''}`;
      return it.url ? `<a class="pf-card pf-card-pad pf-cs" href="${safeUrl(it.url)}"${ext(it.url)} style="--cs:${color}">${inner}</a>` : `<div class="pf-card pf-card-pad pf-cs" style="--cs:${color}">${inner}</div>`;
    }).join('')}</div>`,

  opensource: (p) =>
    `${h2(p.title)}<div class="pf-oss">${list(p.items).map((it) => {
      const inner = `<span class="pf-oss-kind" style="--k:${OSS_COLORS[it.kind] || 'var(--pf-primary)'}">${esc(it.kind)}</span><div class="pf-oss-main"><code class="pf-oss-repo">${esc(it.repo)}</code><strong>${esc(it.title)}</strong>${it.desc ? `<p class="pf-meta">${nl(it.desc)}</p>` : ''}</div>${it.url ? `<span class="pf-oss-go">${ARROW}</span>` : ''}`;
      return it.url ? `<a class="pf-oss-item" href="${safeUrl(it.url)}"${ext(it.url)}>${inner}</a>` : `<div class="pf-oss-item">${inner}</div>`;
    }).join('')}</div>`,

  certs: (p) =>
    `${h2(p.title)}<div class="pf-grid pf-cols-3">${list(p.items).map((c) => {
      const icon = c.badge
        ? `<img class="pf-cert-badge" src="${safeUrl(c.badge)}" alt="" loading="lazy">`
        : `<span class="pf-cert-ico" aria-hidden="true">${c.kind === 'Certification' ? '✓' : '★'}</span>`;
      return `<div class="pf-card pf-card-pad pf-cert">${icon}<div><span class="pf-cert-kind">${esc(c.kind)}</span><h3 class="pf-h4">${esc(c.name)}</h3><p class="pf-meta">${esc([c.issuer, c.date].filter(Boolean).join(' · '))}</p>` +
        `${c.url ? `<a class="pf-cert-link" href="${safeUrl(c.url)}" target="_blank" rel="noopener">Verify ${ARROW}</a>` : ''}</div></div>`;
    }).join('')}</div>`,

  blog: (p) => {
    const user = /^[\w-]{1,40}$/.test(String(p.devto || '')) ? p.devto : '';
    return `${h2(p.title)}<div class="pf-grid pf-cols-3 pf-blog"${user ? ` data-devto="${esc(user)}" data-count="${clamp(p.count, 1, 12)}"` : ''}>${list(p.items).map((a) =>
      `<a class="pf-card pf-post" href="${safeUrl(a.url)}"${ext(a.url)}>${a.image ? `<img src="${safeUrl(a.image)}" alt="" loading="lazy">` : ''}<div class="pf-card-body"><p class="pf-meta">${esc([a.date, a.readTime].filter(Boolean).join(' · '))}</p><h3 class="pf-h4">${esc(a.title)}</h3>${a.excerpt ? `<p class="pf-meta">${nl(a.excerpt)}</p>` : ''}${tagList(csv(a.tags))}</div></a>`
    ).join('')}</div>`;
  },

  learning: (p) =>
    `${h2(p.title)}<div class="pf-grid pf-cols-3">${list(p.items).map((it) => {
      const v = clamp(it.progress);
      return `<div class="pf-card pf-card-pad pf-learn"><p class="pf-learn-now"><i></i>Now exploring</p><h3 class="pf-h4">${esc(it.topic)}</h3>${it.note ? `<p class="pf-meta">${nl(it.note)}</p>` : ''}<div class="pf-bar"><i style="width:${v}%"></i></div><p class="pf-meta pf-learn-pct">${v}%</p></div>`;
    }).join('')}</div>`,

  terminal: (p) => {
    const cmds = {};
    list(p.commands).forEach((c) => { if (c.cmd) cmds[String(c.cmd).trim().toLowerCase()] = String(c.output || ''); });
    return `${h2(p.title)}<div class="pf-term" data-term data-prompt="${esc(p.prompt)}" data-cmds="${json(cmds)}" style="height:${clamp(p.height, 200, 800)}px">` +
      `<div class="pf-term-bar"><i></i><i></i><i></i><span>${esc(p.prompt || 'terminal')}</span></div>` +
      `<div class="pf-term-body"><pre class="pf-term-out">${esc(p.welcome)}</pre><form class="pf-term-line"><span class="pf-term-prompt">${esc(p.prompt)}</span><input class="pf-term-in" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Type a command"></form></div></div>`;
  },

  playground: (p) => {
    const doc = `<!doctype html><html><head><meta charset="utf-8"><style>${p.css || ''}</style></head><body>${p.html || ''}<script>${p.js || ''}</script></body></html>`;
    const area = (lang, code, on) => `<textarea class="pf-pg-code" data-lang="${lang}" spellcheck="false" aria-label="${lang.toUpperCase()} code"${on ? '' : ' hidden'}>${esc(code)}</textarea>`;
    return `${h2(p.title)}${p.text ? `<p class="pf-lead">${nl(p.text)}</p>` : ''}<div class="pf-pg" data-pg style="--h:${clamp(p.height, 200, 800)}px">` +
      `<div class="pf-pg-editor"><div class="pf-pg-tabs" role="tablist">${['html', 'css', 'js'].map((l, i) => `<button type="button" role="tab" class="${i ? '' : 'pf-on'}" data-tab="${l}">${l.toUpperCase()}</button>`).join('')}<button type="button" class="pf-pg-run">▶ Run</button></div>` +
      `${area('html', p.html, true)}${area('css', p.css)}${area('js', p.js)}</div>` +
      `<iframe class="pf-pg-out" title="Playground output" sandbox="allow-scripts allow-modals" srcdoc="${esc(doc)}"></iframe></div>`;
  },

  apiplayground: (p) => {
    const eps = list(p.endpoints).filter((e) => e.url);
    if (!eps.length) return `${h2(p.title)}<p class="pf-meta">Add an endpoint.</p>`;
    const e0 = eps[0];
    const m0 = String(e0.method || 'GET').toUpperCase();
    return `${h2(p.title)}${p.text ? `<p class="pf-lead">${nl(p.text)}</p>` : ''}<div class="pf-api" data-api="${json(eps.map((e) => ({ method: String(e.method || 'GET').toUpperCase(), url: e.url, body: e.body || '' })))}">` +
      `<div class="pf-api-list">${eps.map((e, i) => `<button type="button" class="pf-api-ep${i ? '' : ' pf-on'}" data-i="${i}"><b class="pf-m pf-m-${esc(String(e.method || 'GET').toLowerCase())}">${esc(String(e.method || 'GET').toUpperCase())}</b><span>${esc(e.label || e.url)}</span></button>`).join('')}</div>` +
      `<div class="pf-api-main"><form class="pf-api-req"><select class="pf-input pf-api-method" aria-label="Method">${['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => `<option${m === m0 ? ' selected' : ''}>${m}</option>`).join('')}</select>` +
      `<input class="pf-input pf-api-url" value="${esc(e0.url)}" aria-label="Request URL" spellcheck="false"><button class="pf-btn pf-btn-primary" type="submit">Send</button></form>` +
      `<textarea class="pf-input pf-api-body" rows="5" spellcheck="false" aria-label="Request body"${m0 === 'GET' || m0 === 'DELETE' ? ' hidden' : ''}>${esc(e0.body)}</textarea>` +
      `<div class="pf-api-status"><span class="pf-meta">Press Send to make a live request.</span></div><pre class="pf-api-out"></pre></div></div>`;
  },

  websocket: (p) =>
    `${h2(p.title)}${p.text ? `<p class="pf-lead">${nl(p.text)}</p>` : ''}<div class="pf-ws" data-ws="${esc(p.url)}">` +
    `<div class="pf-ws-head"><span class="pf-ws-dot"></span><span class="pf-ws-state">Not connected</span><code>${esc(p.url)}</code><button type="button" class="pf-btn pf-btn-outline pf-btn-sm pf-ws-toggle">Connect</button></div>` +
    `<div class="pf-ws-log" aria-live="polite"><p class="pf-meta">Connect, then send a message.</p></div>` +
    `<form class="pf-ws-form"><input class="pf-input" placeholder="Type a message" aria-label="Message" disabled><button class="pf-btn pf-btn-primary" type="submit" disabled>Send</button></form>` +
    `<div class="pf-ws-stats"><span>Sent <b data-k="sent">0</b></span><span>Received <b data-k="recv">0</b></span><span>Last round trip <b data-k="rtt">—</b></span></div></div>`,

  demoembed: (p) => {
    const host = String(p.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `${h2(p.title)}<div class="pf-browser" data-demo="${safeUrl(p.url)}" style="--h:${clamp(p.height, 240, 1000)}px">` +
      `<div class="pf-browser-bar"><i></i><i></i><i></i><span class="pf-browser-url">${esc(host)}</span>${p.url ? `<a href="${safeUrl(p.url)}" target="_blank" rel="noopener" aria-label="Open in new tab">${ARROW}</a>` : ''}</div>` +
      `<div class="pf-browser-view">${p.image ? `<img src="${safeUrl(p.image)}" alt="Screenshot of the app" loading="lazy">` : ''}${p.url ? '<button type="button" class="pf-btn pf-btn-primary pf-demo-load">▶ Launch live demo</button>' : ''}</div></div>` +
      `<div class="pf-demo-foot">${p.note ? `<p class="pf-meta">${esc(p.note)}</p>` : '<span></span>'}<div class="pf-actions">${linkBtns(p.url, p.githubUrl)}</div></div>`;
  },

  livestatus: (p) =>
    `${h2(p.title)}${p.text ? `<p class="pf-lead">${nl(p.text)}</p>` : ''}<div class="pf-status" data-status><div class="pf-status-top"><span class="pf-meta pf-status-when">Not checked yet</span><button type="button" class="pf-btn pf-btn-ghost pf-btn-sm pf-status-refresh">↻ Check now</button></div>` +
    list(p.items).filter((it) => it.url).map((it) => {
      const host = String(it.url).replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      return `<div class="pf-status-row" data-url="${safeUrl(it.url)}"><div class="pf-status-name"><strong>${esc(it.name)}</strong><a class="pf-meta" href="${safeUrl(it.url)}" target="_blank" rel="noopener">${esc(host)}</a>${it.stack ? `<span class="pf-meta"> · ${esc(it.stack)}</span>` : ''}</div>` +
        `<div class="pf-status-hist" aria-hidden="true"></div><span class="pf-status-ms">—</span><span class="pf-pill">Waiting</span></div>`;
    }).join('') + '</div>',

  performance: (p) => {
    const scores = [['Performance', p.performance], ['Accessibility', p.accessibility], ['Best practices', p.bestPractices], ['SEO', p.seo]];
    const vitals = [['LCP', 'Largest paint'], ['FCP', 'First paint'], ['CLS', 'Layout shift'], ['INP', 'Interaction'], ['TTFB', 'Server response']];
    return `${h2(p.title)}${p.text ? `<p class="pf-lead">${nl(p.text)}</p>` : ''}<div class="pf-perf"><div class="pf-perf-scores">${scores.map(([l, v]) => {
      const n = clamp(v);
      return `<div class="pf-perf-score"><div class="pf-gauge" style="--v:${n};--c:${lhColor(n)}"><span>${n}</span></div><p>${l}</p></div>`;
    }).join('')}</div>` +
      `${p.showLive ? `<div class="pf-vitals" data-vitals>${vitals.map(([k, l]) => `<div class="pf-vital" data-v="${k}"><span class="pf-vital-k">${k}</span><strong>—</strong><span class="pf-meta">${l}</span></div>`).join('')}</div>` +
        `<p class="pf-meta pf-vitals-note">Core Web Vitals are measured on this visit, in your browser. <a class="pf-psi" href="https://pagespeed.web.dev/" target="_blank" rel="noopener">Run a full PageSpeed test ${ARROW}</a></p>` : ''}</div>`;
  },

  chatbot: (p) => {
    const kb = list(p.knowledge).filter((k) => k.answer).map((k) => ({ k: csv(k.keywords).map((w) => w.toLowerCase()), a: String(k.answer) }));
    const sugs = csv(p.suggestions);
    return `${p.floating ? '' : h2(p.title)}<div class="pf-chat${p.floating ? ' pf-chat-floating' : ''}" data-chat="${json({ kb, endpoint: p.endpoint || '', title: p.title || '' })}">` +
      `<div class="pf-chat-head"><span class="pf-chat-av" aria-hidden="true">✦</span><div><strong>${esc(p.name || 'Assistant')}</strong><span class="pf-meta"><i class="pf-online"></i> Online</span></div><button type="button" class="pf-chat-close" aria-label="Close chat">×</button></div>` +
      `<div class="pf-chat-log" aria-live="polite"><div class="pf-msg pf-msg-bot">${nl(p.greeting)}</div></div>` +
      `${sugs.length ? `<div class="pf-chat-sugs">${sugs.map((s) => `<button type="button" class="pf-chip">${esc(s)}</button>`).join('')}</div>` : ''}` +
      `<form class="pf-chat-form"><input class="pf-input" placeholder="Ask a question…" aria-label="Your question" autocomplete="off"><button class="pf-btn pf-btn-primary" type="submit" aria-label="Send">➤</button></form>` +
      `${p.floating ? '<p class="pf-chat-hint">On the live site this opens from a chat button in the corner.</p>' : ''}</div>`;
  },
};

export const DEV_CSS = `
.pf-btn-sm{padding:.5em 1em;font-size:.88em;border-width:1.5px}
.pf-chip{font:inherit;font-size:.85em;padding:.4em .95em;border-radius:99px;border:1px solid var(--pf-border);background:transparent;color:var(--pf-muted);cursor:pointer;transition:all .15s}
.pf-chip:hover{border-color:var(--pf-primary);color:var(--pf-text)}
.pf-chip.pf-on{background:var(--pf-primary);border-color:var(--pf-primary);color:var(--pf-on-primary)}
.pf-pill{font-size:.78em;font-weight:600;padding:.25em .8em;border-radius:99px;background:var(--pf-border);color:var(--pf-muted);white-space:nowrap}
.pf-pill-up{background:color-mix(in srgb,#16A34A 18%,transparent);color:#16A34A}
.pf-pill-down{background:color-mix(in srgb,#DC2626 16%,transparent);color:#DC2626}
.pf-skel b,.pf-skel p{display:block;height:12px;border-radius:6px;background:var(--pf-border);margin:0 0 10px;animation:pf-pulse 1.4s ease-in-out infinite}
.pf-skel b{width:50%;height:16px}.pf-skel p:last-child{width:70%}
@keyframes pf-pulse{50%{opacity:.45}}
@keyframes pf-dash{to{stroke-dashoffset:-20;background-position:20px 0}}
@keyframes pf-spin{to{transform:rotate(360deg)}}
@keyframes pf-ping{75%,100%{transform:scale(2.2);opacity:0}}

/* 3D hero */
.pf-h3d{display:grid;grid-template-columns:1.1fr 1fr;gap:40px;align-items:center}
.pf-avail{display:inline-flex;align-items:center;gap:8px;font-size:.85em;font-weight:600;padding:.35em .9em;border-radius:99px;border:1px solid var(--pf-border);background:var(--pf-surface)}
.pf-avail i,.pf-learn-now i,.pf-online{position:relative;display:inline-block;width:8px;height:8px;border-radius:50%;background:#22C55E}
.pf-avail i::after,.pf-learn-now i::after{content:'';position:absolute;inset:0;border-radius:50%;background:inherit;animation:pf-ping 1.6s cubic-bezier(0,0,.2,1) infinite}
.pf-sphere{touch-action:pan-y;position:relative;aspect-ratio:1;max-width:520px;width:100%;margin:0 auto;user-select:none;cursor:grab}
.pf-sphere span{position:absolute;white-space:nowrap;font-family:var(--pf-hfont);font-weight:700;font-size:clamp(.8rem,1.9cqi,1.15rem);color:var(--pf-primary);will-change:left,top,transform}
.pf-sphere span:nth-child(3n){color:var(--pf-text)}.pf-sphere span:nth-child(3n+1){color:var(--pf-secondary)}
.pf-sphere-glow{position:absolute;inset:12%;border-radius:50%;background:radial-gradient(circle at 35% 30%,color-mix(in srgb,var(--pf-primary) 30%,transparent),transparent 65%);border:1px dashed color-mix(in srgb,var(--pf-primary) 35%,transparent);animation:pf-spin 40s linear infinite}

/* Tech stack */
.pf-stack{display:grid;gap:28px;text-align:left}
.pf-stack-name{font-size:.8em!important;letter-spacing:.08em!important;text-transform:uppercase!important;color:var(--pf-muted);margin-bottom:12px!important}
.pf-stack-items{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:12px}
.pf-tech{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--pf-border);border-radius:var(--pf-radius);background:var(--pf-surface);font-weight:600;font-size:.92em;transition:transform .2s,border-color .2s}
.pf-tech:hover{transform:translateY(-3px);border-color:var(--pf-primary)}
.pf-tech-ico{flex:none;display:grid;place-items:center;width:34px;height:34px;border-radius:8px;background:#fff;padding:5px}
.pf-tech-ico img{width:100%;height:100%;object-fit:contain}
.pf-tech-ico b{display:none;font-size:.8em;color:#111418}
.pf-tech-ico.pf-noicon{background:var(--pf-primary)}.pf-tech-ico.pf-noicon img{display:none}.pf-tech-ico.pf-noicon b{display:block;color:var(--pf-on-primary)}
.pf-stack-chips .pf-stack-items{display:flex;flex-wrap:wrap;gap:8px}
.pf-stack-chips .pf-tech{padding:5px 12px 5px 5px;border-radius:99px}
.pf-stack-chips .pf-tech-ico{width:24px;height:24px;padding:3px;border-radius:50%}
.pf-stack-chips{grid-template-columns:repeat(2,minmax(0,1fr))}

/* Featured projects */
.pf-filters{display:flex;flex-wrap:wrap;gap:8px;margin:-.5em 0 28px}
.pf-align-center .pf-filters{justify-content:center}
.pf-feats{display:grid;gap:clamp(40px,7cqi,88px);text-align:left}
.pf-feat{display:grid;grid-template-columns:1.2fr 1fr;gap:clamp(24px,5cqi,56px);align-items:center;transition:opacity .35s,transform .35s}
.pf-feats-alt .pf-feat:nth-child(even) .pf-feat-media{order:2}
.pf-feat[hidden]{display:none}
.pf-feat-media{border-radius:var(--pf-radius);overflow:hidden;border:1px solid var(--pf-border);transition:transform .25s ease;transform-style:preserve-3d;box-shadow:0 30px 60px -30px color-mix(in srgb,var(--pf-primary) 45%,transparent)}
.pf-feat-media img{width:100%;aspect-ratio:3/2;object-fit:cover;transition:transform .6s ease}
.pf-feat:hover .pf-feat-media img{transform:scale(1.04)}
.pf-feat-ph{aspect-ratio:3/2;background:linear-gradient(135deg,var(--pf-primary),var(--pf-secondary))}
.pf-feat-num{font-family:var(--pf-hfont);font-weight:700;color:var(--pf-primary);margin:0 0 .3em!important}
.pf-metric{display:inline-block;font-weight:700;font-size:.9em;padding:.3em .8em;border-radius:99px;background:color-mix(in srgb,var(--pf-primary) 14%,transparent);color:var(--pf-primary)}
.pf-shots{display:flex;gap:8px;margin-top:16px}
.pf-shots a{display:block;width:72px;border-radius:8px;overflow:hidden;border:1px solid var(--pf-border)}
.pf-shots img{width:100%;aspect-ratio:4/3;object-fit:cover}
.pf-feats-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}
.pf-feats-grid .pf-feat{grid-template-columns:1fr;gap:0;background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:var(--pf-radius);overflow:hidden;align-items:start}
.pf-feats-grid .pf-feat-media{border:0;border-radius:0;box-shadow:none}
.pf-feats-grid .pf-feat-body{padding:20px 22px 24px}
.pf-feats-grid .pf-h3{font-size:1.25em}

/* Case study */
.pf-case{text-align:left}
.pf-case-head{max-width:760px;margin-bottom:28px}
.pf-case-cover{width:100%;aspect-ratio:2/1;object-fit:cover;border-radius:var(--pf-radius);margin-bottom:40px}
.pf-case-steps{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;counter-reset:s}
.pf-case-steps li{display:flex;gap:16px;padding:26px;border:1px solid var(--pf-border);border-radius:var(--pf-radius);background:var(--pf-surface);position:relative}
.pf-case-steps li p{color:var(--pf-muted);margin:0}
.pf-step-n{flex:none;display:grid;place-items:center;width:42px;height:42px;border-radius:50%;background:var(--pf-primary);color:var(--pf-on-primary);font-weight:700;font-family:var(--pf-hfont)}
.pf-case-arch{margin-top:14px;border-radius:calc(var(--pf-radius) / 1.5);border:1px solid var(--pf-border)}
.pf-case-results{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:14px;margin-top:8px}
.pf-case-results strong{display:block;font-family:var(--pf-hfont);font-size:1.9em;color:var(--pf-primary);line-height:1.1}
.pf-case-results span{color:var(--pf-muted);font-size:.88em}

/* Architecture */
.pf-arch{border:1px solid var(--pf-border);border-radius:var(--pf-radius);background:var(--pf-surface);padding:clamp(16px,3cqi,28px);text-align:left}
.pf-arch-flow{display:flex;align-items:stretch;gap:0;overflow-x:auto;padding-bottom:4px}
.pf-arch-layer{flex:1 1 0;min-width:140px;display:flex;flex-direction:column;gap:10px;padding:14px;border:1px dashed var(--pf-border);border-radius:var(--pf-radius);background:var(--pf-bg)}
.pf-arch-label{font-size:.75em;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pf-muted);margin:0!important}
.pf-arch-node{font:inherit;font-weight:600;text-align:left;padding:10px 12px;border-radius:calc(var(--pf-radius) / 1.5);border:1px solid var(--pf-border);background:var(--pf-surface);color:var(--pf-text);cursor:pointer;transition:all .15s}
.pf-arch-node small{display:block;font-weight:400;color:var(--pf-muted);font-size:.8em}
.pf-arch-node:hover{border-color:var(--pf-primary)}
.pf-arch-node.pf-on{border-color:var(--pf-primary);background:var(--pf-primary);color:var(--pf-on-primary)}
.pf-arch-node.pf-on small{color:inherit;opacity:.8}
.pf-arch-arrow{flex:0 0 34px;display:flex;align-items:center}
.pf-arch-arrow i{position:relative;display:block;width:100%;height:2px;background:linear-gradient(90deg,var(--pf-primary) 50%,transparent 0) 0 0/10px 2px;animation:pf-dash 1s linear infinite}
.pf-arch-arrow i::after{content:'';position:absolute;right:-1px;top:-4px;border:5px solid transparent;border-left-color:var(--pf-primary);border-right:0}
.pf-arch-detail{margin-top:18px;padding:16px 18px;border-left:3px solid var(--pf-primary);background:var(--pf-bg);border-radius:0 var(--pf-radius) var(--pf-radius) 0;min-height:84px}
.pf-arch-detail strong{margin-right:10px}
.pf-arch-detail p{margin:6px 0 0;white-space:pre-line}
.pf-arch-img{display:block;margin-top:22px;border-radius:var(--pf-radius);overflow:hidden;border:1px solid var(--pf-border)}

/* Dependency graph */
.pf-dg{border:1px solid var(--pf-border);border-radius:var(--pf-radius);background:var(--pf-surface);padding:12px}
.pf-dg svg{display:block;width:100%;max-width:640px;margin:0 auto;height:auto;overflow:visible}
.pf-dg-edge{fill:none;stroke:var(--pf-muted);stroke-opacity:.35;stroke-width:1.4;transition:stroke-opacity .2s,stroke .2s}
.pf-dg-node{cursor:pointer;outline:none}
.pf-dg-node circle{stroke:var(--pf-surface);stroke-width:3;transition:r .2s}
.pf-dg-node text{fill:var(--pf-text);font:600 14px var(--pf-bfont);transition:opacity .2s}
.pf-dg-hl .pf-dg-edge{stroke-opacity:.08}.pf-dg-hl .pf-dg-node{opacity:.3}
.pf-dg-hl .pf-dg-edge.pf-on{stroke:var(--pf-primary);stroke-opacity:1;stroke-width:2.4;stroke-dasharray:6 4;animation:pf-dash .8s linear infinite}
.pf-dg-hl .pf-dg-node.pf-on{opacity:1}
.pf-dg-g0{fill:var(--pf-primary);--g:var(--pf-primary)}.pf-dg-g1{fill:var(--pf-secondary);--g:var(--pf-secondary)}.pf-dg-g2{fill:#22C55E;--g:#22C55E}.pf-dg-g3{fill:#A855F7;--g:#A855F7}.pf-dg-g4{fill:#EF4444;--g:#EF4444}.pf-dg-g5{fill:#06B6D4;--g:#06B6D4}
.pf-dg-legend{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;font-size:.88em;color:var(--pf-muted);margin-top:6px}
.pf-dg-legend i{display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--g);margin-right:6px}

/* GitHub */
.pf-gh{text-align:left}
.pf-gh-profile{display:flex;flex-wrap:wrap;align-items:center;gap:18px;padding:20px;border:1px solid var(--pf-border);border-radius:var(--pf-radius);background:var(--pf-surface)}
.pf-gh-avatar{width:64px;height:64px;border-radius:50%;object-fit:cover}
.pf-gh-who{flex:1;min-width:180px}.pf-gh-who h3{margin:0!important}.pf-gh-who a{text-decoration:none}.pf-gh-bio{margin:2px 0 0!important}
.pf-gh-nums{display:flex;gap:26px}
.pf-gh-nums span{display:flex;flex-direction:column;color:var(--pf-muted);font-size:.82em}
.pf-gh-nums b{font-family:var(--pf-hfont);font-size:1.6em;color:var(--pf-text)}
.pf-gh-chart{margin-top:16px;padding:16px;border:1px solid var(--pf-border);border-radius:var(--pf-radius);background:#fff;overflow-x:auto}
.pf-gh-chart img{min-width:640px;width:100%}
.pf-gh-langs{margin-top:16px}
.pf-gh-langbar{display:flex;height:10px;border-radius:99px;overflow:hidden;background:var(--pf-border)}
.pf-gh-langbar i{display:block;height:100%}
.pf-gh-langlist{display:flex;flex-wrap:wrap;gap:6px 18px;list-style:none;padding:0;margin:10px 0 0;font-size:.88em;color:var(--pf-muted)}
.pf-gh-langlist i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px}
.pf-gh-repos{margin-top:16px}
.pf-gh-repo{display:flex;flex-direction:column;gap:8px}
.pf-gh-repo h3{margin:0!important;font-size:1em;word-break:break-word}
.pf-gh-repo p{margin:0;flex:1}
.pf-gh-meta{display:flex;gap:14px;font-size:.82em;color:var(--pf-muted)}
.pf-gh-meta i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}

/* Coding stats */
.pf-cs{display:flex;flex-direction:column;gap:14px;border-top:3px solid var(--cs);transition:transform .2s}
a.pf-cs:hover{transform:translateY(-3px)}
.pf-cs-head{display:flex;align-items:center;gap:12px}
.pf-cs-head div{display:flex;flex-direction:column;line-height:1.3}
.pf-cs-badge{display:grid;place-items:center;width:38px;height:38px;border-radius:10px;color:#fff;font-weight:800;font-size:.85em}
.pf-cs-top{margin:0!important;display:flex;flex-direction:column}
.pf-cs-top strong{font-family:var(--pf-hfont);font-size:2em;line-height:1.1}
.pf-cs-top span{color:var(--pf-muted);font-size:.88em}
.pf-cs-rows{margin:0;display:grid;gap:6px;font-size:.9em}
.pf-cs-rows div{display:flex;justify-content:space-between;gap:10px;padding-top:6px;border-top:1px solid var(--pf-border)}
.pf-cs-rows dt{color:var(--pf-muted)}.pf-cs-rows dd{margin:0;font-weight:600}

/* Open source */
.pf-oss{display:grid;gap:12px;text-align:left}
.pf-oss-item{display:flex;align-items:flex-start;gap:16px;padding:18px 20px;border:1px solid var(--pf-border);border-radius:var(--pf-radius);background:var(--pf-surface);text-decoration:none;transition:border-color .15s,transform .15s}
a.pf-oss-item:hover{border-color:var(--pf-primary);transform:translateX(4px)}
.pf-oss-kind{flex:none;font-size:.75em;font-weight:700;padding:.35em .8em;border-radius:99px;color:var(--k);background:color-mix(in srgb,var(--k) 15%,transparent);margin-top:2px;min-width:92px;text-align:center}
.pf-oss-main{flex:1;min-width:0}
.pf-oss-repo{display:block;font-size:.85em;color:var(--pf-muted)}
.pf-oss-main p{margin:4px 0 0}
.pf-oss-go{color:var(--pf-muted)}

/* Certifications */
.pf-cert{display:flex;gap:16px;align-items:flex-start}
.pf-cert-badge{width:56px;height:56px;object-fit:contain;flex:none}
.pf-cert-ico{flex:none;display:grid;place-items:center;width:52px;height:52px;border-radius:14px;background:color-mix(in srgb,var(--pf-primary) 14%,transparent);color:var(--pf-primary);font-size:1.4em;font-weight:700}
.pf-cert-kind{font-size:.72em;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--pf-primary)}
.pf-cert h3{margin:.2em 0 .3em!important}.pf-cert p{margin:0}
.pf-cert-link{display:inline-block;margin-top:8px;font-weight:600;font-size:.9em;color:var(--pf-primary)!important;text-decoration:none}

/* Blog */
.pf-post img{width:100%;aspect-ratio:16/9;object-fit:cover;transition:transform .5s}
.pf-post:hover img{transform:scale(1.03)}
.pf-post .pf-card-body>p:first-child{margin:0 0 6px}

/* Learning */
.pf-learn-now{display:flex;align-items:center;gap:8px;font-size:.78em;font-weight:700;color:#16A34A;margin:0 0 10px!important}
.pf-learn .pf-bar{margin-top:14px}
.pf-learn-pct{margin:6px 0 0!important;text-align:right}

/* Terminal */
.pf-term{display:flex;flex-direction:column;border-radius:var(--pf-radius);overflow:hidden;background:#0B0F14;color:#E6EDF3;font:14px/1.6 'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace;box-shadow:0 30px 60px -25px rgba(0,0,0,.5);text-align:left;border:1px solid #222a35}
.pf-term-bar{display:flex;align-items:center;gap:7px;padding:10px 14px;background:#161B22;border-bottom:1px solid #222a35}
.pf-term-bar i{width:12px;height:12px;border-radius:50%;background:#FF5F57}.pf-term-bar i:nth-child(2){background:#FEBC2E}.pf-term-bar i:nth-child(3){background:#28C840}
.pf-term-bar span{margin-left:10px;color:#8B949E;font-size:.85em}
.pf-term-body{flex:1;overflow-y:auto;padding:14px 16px;cursor:text}
.pf-term-out{margin:0;white-space:pre-wrap;word-break:break-word;font:inherit}
.pf-term-out .pf-term-cmd{color:#7EE787}.pf-term-out .pf-term-err{color:#FF7B72}
.pf-term-line{display:flex;gap:8px;align-items:center}
.pf-term-prompt{color:#7EE787;white-space:nowrap}
.pf-term-in{flex:1;min-width:0;background:transparent;border:0;outline:0;color:inherit;font:inherit;caret-color:#7EE787;padding:0}

/* Code playground */
.pf-pg{display:grid;grid-template-columns:1fr 1fr;height:var(--h);border:1px solid var(--pf-border);border-radius:var(--pf-radius);overflow:hidden;text-align:left}
.pf-pg-editor{display:flex;flex-direction:column;background:#0B0F14;min-width:0}
.pf-pg-tabs{display:flex;gap:2px;padding:6px;background:#161B22}
.pf-pg-tabs button{font:600 12px ui-monospace,Menlo,monospace;padding:6px 12px;border:0;border-radius:6px;background:transparent;color:#8B949E;cursor:pointer}
.pf-pg-tabs button.pf-on{background:#0B0F14;color:#E6EDF3}
.pf-pg-tabs .pf-pg-run{margin-left:auto;background:var(--pf-primary);color:var(--pf-on-primary)}
.pf-pg-code{flex:1;width:100%;resize:none;border:0;outline:0;padding:14px;background:#0B0F14;color:#E6EDF3;font:13px/1.6 'JetBrains Mono',ui-monospace,Menlo,monospace;tab-size:2}
.pf-pg-code[hidden]{display:none}
.pf-pg-out{width:100%;height:100%;border:0;background:#fff}

/* API playground */
.pf-api{display:grid;grid-template-columns:240px 1fr;border:1px solid var(--pf-border);border-radius:var(--pf-radius);overflow:hidden;background:var(--pf-surface);text-align:left}
.pf-api-list{display:flex;flex-direction:column;gap:4px;padding:10px;border-right:1px solid var(--pf-border)}
.pf-api-ep{display:flex;align-items:center;gap:10px;font:inherit;font-size:.9em;text-align:left;padding:9px 10px;border:0;border-radius:8px;background:transparent;color:var(--pf-text);cursor:pointer}
.pf-api-ep:hover{background:var(--pf-bg)}.pf-api-ep.pf-on{background:var(--pf-bg);box-shadow:inset 3px 0 0 var(--pf-primary)}
.pf-m{flex:none;font:700 10.5px ui-monospace,Menlo,monospace;padding:3px 6px;border-radius:5px;color:#fff;background:#1F883D;min-width:52px;text-align:center}
.pf-m-post{background:#BF8700}.pf-m-put,.pf-m-patch{background:#0969DA}.pf-m-delete{background:#CF222E}
.pf-api-main{padding:16px;min-width:0}
.pf-api-req{display:flex;gap:8px}
.pf-api-req .pf-input{margin:0}
.pf-api-method{width:auto;flex:none;font-family:ui-monospace,Menlo,monospace;font-weight:700}
.pf-api-url{flex:1;min-width:0;font-family:ui-monospace,Menlo,monospace;font-size:.88em}
.pf-api-body{margin:10px 0 0!important;font:13px/1.5 ui-monospace,Menlo,monospace}
.pf-api-body[hidden]{display:none}
.pf-api-status{display:flex;gap:14px;align-items:center;margin:14px 0 8px;font-size:.88em}
.pf-api-status b{font-family:ui-monospace,Menlo,monospace}
.pf-api-out{margin:0;max-height:340px;overflow:auto;padding:14px;border-radius:calc(var(--pf-radius) / 1.5);background:#0B0F14;color:#E6EDF3;font:12.5px/1.55 ui-monospace,Menlo,monospace;white-space:pre-wrap;word-break:break-word}
.pf-api-out:empty{display:none}
.pf-api-out .s{color:#A5D6FF}.pf-api-out .n{color:#79C0FF}.pf-api-out .k{color:#7EE787}.pf-api-out .b{color:#FF7B72}

/* WebSocket */
.pf-ws{border:1px solid var(--pf-border);border-radius:var(--pf-radius);background:var(--pf-surface);overflow:hidden;text-align:left}
.pf-ws-head{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--pf-border)}
.pf-ws-head code{font-size:.8em;color:var(--pf-muted);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pf-ws-dot{width:10px;height:10px;border-radius:50%;background:var(--pf-muted)}
.pf-ws-on .pf-ws-dot{background:#22C55E;box-shadow:0 0 0 4px color-mix(in srgb,#22C55E 25%,transparent)}
.pf-ws-wait .pf-ws-dot{background:#F59E0B}
.pf-ws-state{font-weight:600;font-size:.9em}
.pf-ws-log{height:240px;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px}
.pf-ws-log .pf-msg{max-width:78%}
.pf-ws-form{display:flex;gap:8px;padding:12px 16px;border-top:1px solid var(--pf-border)}
.pf-ws-form .pf-input{margin:0}
.pf-ws-stats{display:flex;flex-wrap:wrap;gap:20px;padding:10px 16px;border-top:1px solid var(--pf-border);font-size:.82em;color:var(--pf-muted)}
.pf-ws-stats b{color:var(--pf-text);font-family:ui-monospace,Menlo,monospace}
.pf-msg{padding:9px 13px;border-radius:14px;font-size:.93em;line-height:1.5;word-break:break-word;animation:pf-in .25s ease}
.pf-msg-me{align-self:flex-end;background:var(--pf-primary);color:var(--pf-on-primary);border-bottom-right-radius:4px}
.pf-msg-bot{align-self:flex-start;background:var(--pf-bg);border:1px solid var(--pf-border);border-bottom-left-radius:4px}
.pf-msg small{display:block;font-size:.75em;opacity:.7;margin-top:2px}
.pf-msg-sys{align-self:center;font-size:.8em;color:var(--pf-muted)}
@keyframes pf-in{from{opacity:0;transform:translateY(6px)}}

/* Live demo */
.pf-browser{border:1px solid var(--pf-border);border-radius:var(--pf-radius);overflow:hidden;background:var(--pf-surface);box-shadow:0 30px 60px -30px rgba(0,0,0,.35)}
.pf-browser-bar{display:flex;align-items:center;gap:7px;padding:10px 14px;border-bottom:1px solid var(--pf-border)}
.pf-browser-bar>i{width:11px;height:11px;border-radius:50%;background:var(--pf-border)}
.pf-browser-url{flex:1;margin:0 10px;padding:4px 12px;border-radius:99px;background:var(--pf-bg);font-size:.82em;color:var(--pf-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pf-browser-bar a{text-decoration:none;color:var(--pf-muted)}
.pf-browser-view{position:relative;height:var(--h);display:grid;place-items:center;background:linear-gradient(135deg,color-mix(in srgb,var(--pf-primary) 20%,var(--pf-bg)),var(--pf-bg))}
.pf-browser-view img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top}
.pf-browser-view .pf-demo-load{position:relative;box-shadow:0 10px 30px rgba(0,0,0,.3)}
.pf-browser-view iframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:#fff}
.pf-demo-foot{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;margin-top:14px}
.pf-demo-foot .pf-actions{margin:0}.pf-demo-foot p{margin:0}

/* Live status */
.pf-status{border:1px solid var(--pf-border);border-radius:var(--pf-radius);background:var(--pf-surface);text-align:left}
.pf-status-top{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid var(--pf-border)}
.pf-status-row{display:grid;grid-template-columns:1fr auto 70px 100px;align-items:center;gap:16px;padding:14px 18px;border-bottom:1px solid var(--pf-border)}
.pf-status-row:last-child{border-bottom:0}
.pf-status-name a{text-decoration:none}
.pf-status-name strong{display:block}
.pf-status-hist{display:flex;gap:3px;align-items:flex-end;height:22px}
.pf-status-hist i{width:5px;border-radius:2px;background:#22C55E}.pf-status-hist i.pf-x{background:#DC2626;height:100%!important}
.pf-status-ms{font-family:ui-monospace,Menlo,monospace;font-size:.85em;color:var(--pf-muted);text-align:right}
.pf-status-row .pf-pill{text-align:center}

/* Performance */
.pf-perf-scores{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;text-align:center}
.pf-gauge{width:min(120px,100%);aspect-ratio:1;margin:0 auto 10px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--c) calc(var(--v)*1%),color-mix(in srgb,var(--c) 18%,transparent) 0)}
.pf-gauge span{width:80%;aspect-ratio:1;border-radius:50%;background:var(--pf-bg);display:grid;place-items:center;font:700 1.7em var(--pf-hfont);color:var(--c)}
.pf-perf-score p{margin:0;font-weight:600}
.pf-vitals{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:32px}
.pf-vital{padding:16px;border:1px solid var(--pf-border);border-radius:var(--pf-radius);background:var(--pf-surface);text-align:left;border-top:3px solid var(--vc,var(--pf-border))}
.pf-vital-k{display:block;font-size:.75em;font-weight:700;letter-spacing:.06em;color:var(--pf-muted)}
.pf-vital strong{display:block;font-family:var(--pf-hfont);font-size:1.6em;color:var(--vc,var(--pf-text))}
.pf-vitals-note{margin-top:12px!important;text-align:center}
.pf-psi{color:var(--pf-primary)!important}

/* Chatbot */
.pf-chat{display:flex;flex-direction:column;max-width:560px;margin:0 auto;height:480px;border:1px solid var(--pf-border);border-radius:calc(var(--pf-radius) + 4px);background:var(--pf-surface);overflow:hidden;text-align:left;box-shadow:0 24px 60px -24px rgba(0,0,0,.35)}
.pf-chat-head{display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--pf-primary);color:var(--pf-on-primary)}
.pf-chat-head div{flex:1;display:flex;flex-direction:column;line-height:1.3}
.pf-chat-head .pf-meta{color:inherit;opacity:.85;font-size:.8em}
.pf-chat-av{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:color-mix(in srgb,var(--pf-on-primary) 20%,transparent);font-size:1.1em}
.pf-chat-close{display:none;font-size:1.6em;line-height:1;background:none;border:0;color:inherit;cursor:pointer;padding:0 4px}
.pf-chat-log{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}
.pf-chat-sugs{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 10px}
.pf-chat-form{display:flex;gap:8px;padding:12px;border-top:1px solid var(--pf-border)}
.pf-chat-form .pf-input{margin:0;background:var(--pf-bg)}
.pf-chat-form .pf-btn{padding:.6em 1em}
.pf-chat-hint{margin:0!important;padding:8px;font-size:.78em;text-align:center;color:var(--pf-muted);border-top:1px dashed var(--pf-border)}
.pf-typing{display:inline-flex;gap:4px}.pf-typing i{width:6px;height:6px;border-radius:50%;background:var(--pf-muted);animation:pf-pulse 1s infinite}.pf-typing i:nth-child(2){animation-delay:.15s}.pf-typing i:nth-child(3){animation-delay:.3s}

/* Floating layer (chat button, command palette, mode switch) lives outside .pf */
.pf-layer{font-family:var(--pf-bfont);font-size:var(--pf-base);color:var(--pf-text);line-height:1.5}
.pf-layer *,.pf-layer *::before,.pf-layer *::after{box-sizing:border-box}
.pf-fab{position:fixed;right:20px;bottom:20px;z-index:9990;width:58px;height:58px;border-radius:50%;border:0;background:var(--pf-primary);color:var(--pf-on-primary);font-size:1.5em;cursor:pointer;box-shadow:0 12px 30px rgba(0,0,0,.3);transition:transform .2s}
.pf-fab:hover{transform:scale(1.06)}
.pf-layer .pf-chat{position:fixed;right:20px;bottom:90px;z-index:9991;width:min(380px,calc(100vw - 32px));height:min(540px,calc(100vh - 120px));margin:0;transform-origin:bottom right;transition:opacity .2s,transform .2s,visibility .2s}
.pf-layer .pf-chat:not(.pf-open){opacity:0;visibility:hidden;transform:scale(.9) translateY(10px);pointer-events:none}
.pf-layer .pf-chat-close{display:block}
.pf-layer .pf-chat-hint{display:none}
.pf-mode{display:inline-grid;place-items:center;width:38px;height:38px;border-radius:50%;border:1px solid var(--pf-border);background:var(--pf-surface);color:var(--pf-text);cursor:pointer;font-size:1.05em;flex:none}
.pf-mode-float{position:fixed;top:16px;right:16px;z-index:9989}
.pf-kbd{position:fixed;left:16px;bottom:16px;z-index:9989;font:600 12px var(--pf-bfont);padding:7px 12px;border-radius:99px;border:1px solid var(--pf-border);background:var(--pf-surface);color:var(--pf-muted);cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.12)}
.pf-cmdk{position:fixed;inset:0;z-index:9995;background:rgba(0,0,0,.5);display:flex;align-items:flex-start;justify-content:center;padding:12vh 16px 16px;backdrop-filter:blur(3px)}
.pf-cmdk[hidden]{display:none}
.pf-cmdk-box{width:min(600px,100%);background:var(--pf-surface);border:1px solid var(--pf-border);border-radius:14px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.4)}
.pf-cmdk-in{width:100%;padding:16px 18px;border:0;border-bottom:1px solid var(--pf-border);background:transparent;color:var(--pf-text);font:inherit;font-size:1.05em;outline:0}
.pf-cmdk-list{max-height:min(380px,55vh);overflow-y:auto;padding:6px;margin:0;list-style:none}
.pf-cmdk-list li{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:8px;cursor:pointer}
.pf-cmdk-list li.pf-on{background:color-mix(in srgb,var(--pf-primary) 15%,transparent)}
.pf-cmdk-list li span{flex:1}.pf-cmdk-list li small{color:var(--pf-muted);font-size:.78em}
.pf-cmdk-list b{display:grid;place-items:center;width:28px;height:28px;border-radius:7px;background:var(--pf-bg);border:1px solid var(--pf-border);font-weight:400}
.pf-cmdk-foot{padding:8px 14px;border-top:1px solid var(--pf-border);font-size:.75em;color:var(--pf-muted)}

@container (max-width:900px){
  .pf .pf-feats-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pf .pf-vitals{grid-template-columns:repeat(3,1fr)}
  .pf .pf-api{grid-template-columns:1fr}
  .pf .pf-api-list{flex-direction:row;overflow-x:auto;border-right:0;border-bottom:1px solid var(--pf-border)}
  .pf .pf-api-ep{flex:none}
}
@container (max-width:680px){
  .pf-h3d,.pf-feat,.pf-case-steps,.pf-pg,.pf-stack-chips{grid-template-columns:1fr}
  .pf-sphere{max-width:340px;order:-1}
  .pf-feats-alt .pf-feat:nth-child(even) .pf-feat-media{order:0}
  .pf .pf-feats-grid{grid-template-columns:1fr}
  .pf-arch-flow{flex-direction:column}
  .pf-arch-arrow{flex-basis:28px;justify-content:center}
  .pf-arch-arrow i{width:2px;height:100%;background:linear-gradient(var(--pf-primary) 50%,transparent 0) 0 0/2px 10px}
  .pf-arch-arrow i::after{right:-4px;top:auto;bottom:-1px;border:5px solid transparent;border-top-color:var(--pf-primary);border-bottom:0}
  .pf-pg{height:auto}.pf-pg-code{min-height:200px}.pf-pg-out{height:var(--h)}
  .pf-perf-scores{grid-template-columns:repeat(2,1fr)}
  .pf .pf-vitals{grid-template-columns:repeat(2,1fr)}
  .pf-status-row{grid-template-columns:1fr auto;gap:8px 12px}
  .pf-status-hist{display:none}
  .pf-gh-nums{width:100%;justify-content:space-between}
  .pf-oss-item{flex-direction:column;gap:8px}
  .pf-api-req{flex-wrap:wrap}.pf-api-url{flex-basis:100%;order:-1}
}
@media (hover:none){.pf-kbd{display:none}}
@media (prefers-reduced-motion:reduce){.pf-sphere-glow,.pf-arch-arrow i,.pf-avail i::after,.pf-learn-now i::after{animation:none}}
`;
