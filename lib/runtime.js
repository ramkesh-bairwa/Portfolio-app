// Browser runtime for published portfolios (and the builder preview).
// It is injected as source text via runtime.toString(), so it must stay self-contained:
// no imports, no references to anything outside this function.
export function runtime() {
  var root = document.querySelector('.pf');
  if (!root) return;
  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var el = function (tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  var data = function (node, attr) { try { return JSON.parse(node.getAttribute(attr) || 'null'); } catch (e) { return null; } };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } },
  };
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var fmt = function (n) { n = Number(n) || 0; return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k' : String(n); };

  root.classList.add('pf-js');
  var onView = function (els, cb, threshold) {
    if (!('IntersectionObserver' in window)) { els.forEach(cb); return; }
    var o = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { cb(e.target); o.unobserve(e.target); } }); }, { threshold: threshold || 0.2 });
    els.forEach(function (x) { o.observe(x); });
  };

  // Fixed-position UI has to live outside .pf: its container-type makes it the containing block for fixed children.
  var layer = el('div', 'pf-layer');
  layer.setAttribute('style', root.getAttribute('style') || '');
  document.body.appendChild(layer);

  // ---------- scroll reveal, lightbox, mobile menu ----------
  if (root.classList.contains('pf-anim') && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('pf-in'); io.unobserve(e.target); } }); }, { threshold: 0.08 });
    $$('.pf-section').forEach(function (s) { io.observe(s); });
  } else $$('.pf-section').forEach(function (s) { s.classList.add('pf-in'); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-lightbox]');
    if (!a) return;
    e.preventDefault();
    var d = el('div', 'pf-lb');
    var im = el('img'); im.alt = ''; im.src = a.getAttribute('href');
    d.appendChild(im);
    d.onclick = function () { d.remove(); };
    document.body.appendChild(d);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var l = $('.pf-lb'); if (l) l.remove(); } });
  $$('.pf-nav-links a').forEach(function (a) { a.addEventListener('click', function () { var t = document.getElementById('pf-menu'); if (t) t.checked = false; }); });

  // ---------- light / dark switch ----------
  var toggleMode = null;
  if (root.hasAttribute('data-mode')) {
    var baseDark = root.getAttribute('data-mode') === 'dark';
    var modeBtn = el('button', 'pf-mode');
    modeBtn.type = 'button';
    var setAlt = function (on) {
      root.classList.toggle('pf-alt', on);
      layer.classList.toggle('pf-alt', on);
      var dark = on ? !baseDark : baseDark;
      modeBtn.textContent = dark ? '☀' : '☾';
      modeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    };
    var nav = $('.pf-nav', root);
    if (nav) nav.appendChild(modeBtn);
    else { modeBtn.classList.add('pf-mode-float'); layer.appendChild(modeBtn); }
    toggleMode = function () { var on = !root.classList.contains('pf-alt'); setAlt(on); store.set('pf-alt', on ? '1' : '0'); };
    modeBtn.onclick = toggleMode;
    setAlt(store.get('pf-alt') === '1');
  }

  // ---------- 3D word sphere ----------
  $$('[data-sphere]', root).forEach(function (box) {
    var spans = $$('span', box);
    var n = spans.length;
    if (!n || reduce) return;
    var pts = spans.map(function (_, i) {
      var y = 1 - (2 * (i + 0.5)) / n, r = Math.sqrt(1 - y * y), a = i * Math.PI * (3 - Math.sqrt(5));
      return [Math.cos(a) * r, y, Math.sin(a) * r];
    });
    var ax = 0.002, ay = 0.004, tx = ax, ty = ay, visible = true, drag = null;
    function draw() {
      var cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
      pts.forEach(function (p, i) {
        var x = p[0] * cy - p[2] * sy, z = p[0] * sy + p[2] * cy, y = p[1] * cx - z * sx;
        z = p[1] * sx + z * cx;
        p[0] = x; p[1] = y; p[2] = z;
        var st = spans[i].style;
        st.left = (50 + x * 40) + '%';
        st.top = (50 + y * 40) + '%';
        st.transform = 'translate(-50%,-50%) scale(' + (0.62 + (z + 1) * 0.28) + ')';
        st.opacity = 0.3 + (z + 1) * 0.35;
        st.zIndex = Math.round((z + 1) * 50);
      });
    }
    function tick() {
      if (visible) { if (!drag) { ax += (tx - ax) * 0.05; ay += (ty - ay) * 0.05; } draw(); }
      requestAnimationFrame(tick);
    }
    box.addEventListener('pointermove', function (e) {
      if (drag) { ay = (e.clientX - drag[0]) * 0.004; ax = -(e.clientY - drag[1]) * 0.004; drag = [e.clientX, e.clientY]; return; }
      var r = box.getBoundingClientRect();
      ty = ((e.clientX - r.left) / r.width - 0.5) * 0.03;
      tx = -((e.clientY - r.top) / r.height - 0.5) * 0.03;
    });
    box.addEventListener('pointerdown', function (e) { drag = [e.clientX, e.clientY]; box.setPointerCapture(e.pointerId); });
    box.addEventListener('pointerup', function () { drag = null; tx = ax; ty = ay; });
    box.addEventListener('pointerleave', function () { if (!drag) { tx = 0.002; ty = 0.004; } });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(box);
    requestAnimationFrame(tick);
  });

  // ---------- featured projects: tag filters + tilt ----------
  $$('.pf-filters', root).forEach(function (bar) {
    var cards = $$('[data-tags]', bar.parentNode);
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter]');
      if (!b) return;
      $$('.pf-chip', bar).forEach(function (c) { c.classList.toggle('pf-on', c === b); });
      var f = b.getAttribute('data-filter');
      cards.forEach(function (c) { c.hidden = !!f && c.getAttribute('data-tags').split('|').indexOf(f) < 0; });
    });
  });
  if (!reduce && window.matchMedia && matchMedia('(hover: hover)').matches) {
    $$('[data-tilt]', root).forEach(function (m) {
      m.addEventListener('mousemove', function (e) {
        var r = m.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        m.style.transform = 'perspective(900px) rotateY(' + x * 8 + 'deg) rotateX(' + -y * 8 + 'deg)';
      });
      m.addEventListener('mouseleave', function () { m.style.transform = ''; });
    });
  }

  // ---------- hero typewriter words ----------
  $$('[data-rotate]', root).forEach(function (span) {
    var list = data(span, 'data-rotate') || [];
    if (list.length < 2 || reduce) return;
    var wi = 0, ci = list[0].length, del = true;
    (function step() {
      var w = list[wi];
      if (del) { ci--; if (ci <= 0) { del = false; wi = (wi + 1) % list.length; } }
      else { ci++; if (ci >= list[wi].length) { del = true; span.textContent = list[wi]; setTimeout(step, 1600); return; } }
      span.textContent = list[wi].slice(0, Math.max(0, ci)) || '\u200b';
      setTimeout(step, del ? 45 : 85);
    })();
  });

  // ---------- carousels: prev / next buttons ----------
  $$('.pf-carousel', root).forEach(function (c) {
    var nav = el('div', 'pf-car-nav');
    [['‹', -1, 'Previous'], ['›', 1, 'Next']].forEach(function (b) {
      var x = el('button', null, b[0]);
      x.type = 'button';
      x.setAttribute('aria-label', b[2]);
      x.onclick = function () { c.scrollBy({ left: b[1] * c.clientWidth * 0.85, behavior: reduce ? 'auto' : 'smooth' }); };
      nav.appendChild(x);
    });
    c.parentNode.insertBefore(nav, c.nextSibling);
  });

  // ---------- stats count up ----------
  onView($$('[data-countup]', root), function (box) {
    if (reduce) return;
    $$('.pf-stat strong', box).forEach(function (s) {
      var m = s.textContent.match(/^(\D*)([\d,]+(?:\.\d+)?)(.*)$/);
      if (!m) return;
      var target = parseFloat(m[2].replace(/,/g, '')), dec = (m[2].split('.')[1] || '').length, comma = m[2].indexOf(',') > -1, t0 = null;
      var fmtN = function (v) { var n = v.toFixed(dec); return comma ? Number(n).toLocaleString('en-IN', { minimumFractionDigits: dec }) : n; };
      (function frame(ts) {
        if (!t0) t0 = ts;
        var k = Math.min(1, (ts - t0) / 1400), e = 1 - Math.pow(1 - k, 3);
        s.textContent = m[1] + fmtN(target * e) + m[3];
        if (k < 1) requestAnimationFrame(frame);
      })(performance.now());
    });
  }, 0.4);

  // ---------- skill bars fill on view ----------
  onView($$('.pf-skanim', root), function (x) { x.classList.add('pf-go'); }, 0.25);

  // ---------- sticky navigation shadow ----------
  var sticky = $$('.pf-sticky', root);
  if (sticky.length) {
    var onScroll = function () { sticky.forEach(function (n) { n.classList.toggle('pf-scrolled', window.scrollY > 8); }); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------- hero scroll arrow ----------
  $$('[data-scroll]', root).forEach(function (b) {
    b.addEventListener('click', function () {
      var sec = b.closest('.pf-section'), next = sec && sec.nextElementSibling;
      if (next) next.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  // ---------- before / after slider ----------
  $$('[data-ba]', root).forEach(function (box) {
    var r = $('.pf-ba-range', box);
    if (r) r.addEventListener('input', function () { box.style.setProperty('--pos', r.value + '%'); });
  });

  // ---------- tabs ----------
  $$('[data-tabs]', root).forEach(function (t) {
    var tabs = $$('.pf-tab', t), panels = $$('.pf-tabpanel', t);
    tabs.forEach(function (b, i) {
      b.addEventListener('click', function () {
        tabs.forEach(function (x, j) { x.classList.toggle('pf-on', j === i); x.setAttribute('aria-selected', String(j === i)); });
        panels.forEach(function (pn, j) { pn.hidden = j !== i; });
      });
    });
  });

  // ---------- architecture diagram ----------
  $$('[data-arch]', root).forEach(function (a) {
    var detail = $('.pf-arch-detail', a);
    a.addEventListener('click', function (e) {
      var n = e.target.closest('.pf-arch-node');
      if (!n) return;
      $$('.pf-arch-node', a).forEach(function (x) { x.classList.toggle('pf-on', x === n); });
      detail.innerHTML = '';
      detail.appendChild(el('strong', null, n.getAttribute('data-name')));
      if (n.getAttribute('data-tech')) detail.appendChild(el('span', 'pf-meta', n.getAttribute('data-tech')));
      detail.appendChild(el('p', null, n.getAttribute('data-desc')));
    });
  });

  // ---------- dependency graph ----------
  $$('[data-depgraph] svg', root).forEach(function (svg) {
    var edges = $$('.pf-dg-edge', svg), nodes = $$('.pf-dg-node', svg);
    function on(i) {
      var near = {};
      near[i] = 1;
      svg.classList.add('pf-dg-hl');
      edges.forEach(function (e) {
        var a = e.getAttribute('data-a'), b = e.getAttribute('data-b'), hit = a === i || b === i;
        e.classList.toggle('pf-on', hit);
        if (hit) { near[a] = 1; near[b] = 1; }
      });
      nodes.forEach(function (nd) { nd.classList.toggle('pf-on', !!near[nd.getAttribute('data-i')]); });
    }
    function off() { svg.classList.remove('pf-dg-hl'); }
    nodes.forEach(function (nd) {
      var i = nd.getAttribute('data-i');
      ['mouseenter', 'focus', 'click'].forEach(function (ev) { nd.addEventListener(ev, function () { on(i); }); });
      nd.addEventListener('mouseleave', off);
      nd.addEventListener('blur', off);
    });
  });

  // ---------- GitHub activity ----------
  var LANG = {
    JavaScript: '#F1E05A', TypeScript: '#3178C6', Python: '#3572A5', Go: '#00ADD8', Rust: '#DEA584', Java: '#B07219', 'C++': '#F34B7D', C: '#555555',
    'C#': '#178600', PHP: '#4F5D95', Ruby: '#701516', Swift: '#F05138', Kotlin: '#A97BFF', Dart: '#00B4AB', HTML: '#E34C26', CSS: '#563D7C', SCSS: '#C6538C',
    Shell: '#89E051', Vue: '#41B883', Svelte: '#FF3E00', 'Jupyter Notebook': '#DA5B0B', Dockerfile: '#384D54', Lua: '#000080', Elixir: '#6E4A7E', Astro: '#FF5A03',
  };
  $$('[data-gh]', root).forEach(function (box) {
    var user = box.getAttribute('data-gh'), count = Number(box.getAttribute('data-count')) || 0, sort = box.getAttribute('data-sort');
    var api = 'https://api.github.com/users/' + encodeURIComponent(user);
    var num = function (k, v) { var b = $('[data-k="' + k + '"]', box); if (b) b.textContent = fmt(v); };
    var get = function (u) { return fetch(u, { headers: { Accept: 'application/vnd.github+json' } }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); };
    get(api).then(function (u) {
      num('public_repos', u.public_repos);
      num('followers', u.followers);
      if (u.bio) $('.pf-gh-bio', box).textContent = u.bio;
    }).catch(function () {});
    get(api + '/repos?per_page=100&sort=updated').then(function (repos) {
      repos = repos.filter(function (r) { return !r.fork; });
      num('stars', repos.reduce(function (s, r) { return s + r.stargazers_count; }, 0));
      var langs = {};
      repos.forEach(function (r) { if (r.language) langs[r.language] = (langs[r.language] || 0) + 1; });
      var top = Object.keys(langs).sort(function (a, b) { return langs[b] - langs[a]; }).slice(0, 6);
      var total = top.reduce(function (s, l) { return s + langs[l]; }, 0);
      var lb = $('.pf-gh-langs', box);
      if (lb && total) {
        lb.hidden = false;
        top.forEach(function (l) {
          var pct = Math.round((langs[l] / total) * 1000) / 10, c = LANG[l] || '#8B949E';
          var seg = el('i'); seg.style.width = pct + '%'; seg.style.background = c; seg.title = l;
          $('.pf-gh-langbar', lb).appendChild(seg);
          var li = el('li'), dot = el('i');
          dot.style.background = c;
          li.appendChild(dot);
          li.appendChild(document.createTextNode(l + ' ' + pct + '%'));
          $('.pf-gh-langlist', lb).appendChild(li);
        });
      }
      var grid = $('.pf-gh-repos', box);
      if (!grid) return;
      if (sort === 'stars') repos.sort(function (a, b) { return b.stargazers_count - a.stargazers_count; });
      grid.innerHTML = '';
      repos.slice(0, count).forEach(function (r) {
        var a = el('a', 'pf-card pf-card-pad pf-gh-repo');
        a.href = r.html_url; a.target = '_blank'; a.rel = 'noopener';
        a.appendChild(el('h3', 'pf-h4', r.name));
        a.appendChild(el('p', 'pf-meta', r.description || 'No description'));
        var m = el('div', 'pf-gh-meta');
        if (r.language) { var s = el('span'), d = el('i'); d.style.background = LANG[r.language] || '#8B949E'; s.appendChild(d); s.appendChild(document.createTextNode(r.language)); m.appendChild(s); }
        m.appendChild(el('span', null, '★ ' + fmt(r.stargazers_count)));
        m.appendChild(el('span', null, '⑂ ' + fmt(r.forks_count)));
        a.appendChild(m);
        grid.appendChild(a);
      });
      if (!grid.children.length) grid.remove();
    }).catch(function () {
      var g = $('.pf-gh-repos', box);
      if (g) g.innerHTML = '<p class="pf-meta">GitHub data could not be loaded right now.</p>';
    });
  });

  // ---------- dev.to articles ----------
  $$('[data-devto]', root).forEach(function (grid) {
    fetch('https://dev.to/api/articles?username=' + encodeURIComponent(grid.getAttribute('data-devto')) + '&per_page=' + (grid.getAttribute('data-count') || 3))
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (posts) {
        if (!posts.length) return;
        grid.innerHTML = '';
        posts.forEach(function (p) {
          var a = el('a', 'pf-card pf-post');
          a.href = p.url; a.target = '_blank'; a.rel = 'noopener';
          var cover = p.cover_image || p.social_image;
          if (cover) { var im = el('img'); im.src = cover; im.alt = ''; im.loading = 'lazy'; a.appendChild(im); }
          var b = el('div', 'pf-card-body');
          b.appendChild(el('p', 'pf-meta', [p.readable_publish_date, p.reading_time_minutes ? p.reading_time_minutes + ' min read' : ''].filter(Boolean).join(' · ')));
          b.appendChild(el('h3', 'pf-h4', p.title));
          if (p.description) b.appendChild(el('p', 'pf-meta', p.description));
          if (p.tag_list && p.tag_list.length) {
            var t = el('div', 'pf-tags');
            p.tag_list.slice(0, 3).forEach(function (x) { t.appendChild(el('span', 'pf-tag', x)); });
            b.appendChild(t);
          }
          a.appendChild(b);
          grid.appendChild(a);
        });
      }).catch(function () { /* keep the hand-written articles */ });
  });

  // ---------- terminal ----------
  $$('[data-term]', root).forEach(function (t) {
    var cmds = data(t, 'data-cmds') || {}, prompt = t.getAttribute('data-prompt') || '$';
    var out = $('.pf-term-out', t), input = $('.pf-term-in', t), body = $('.pf-term-body', t), hist = [], hi = 0;
    var names = Object.keys(cmds), all = names.concat(['help', 'clear']);
    var print = function (text, cls) { out.appendChild(el('span', cls, text + '\n')); };
    function run(raw) {
      var c = raw.trim();
      if (out.textContent && !/\n$/.test(out.textContent)) out.appendChild(document.createTextNode('\n'));
      print(prompt + ' ' + c, 'pf-term-cmd');
      if (!c) return;
      hist.push(c);
      hi = hist.length;
      var k = c.toLowerCase();
      if (k === 'clear') out.textContent = '';
      else if (k === 'help') print('Commands:\n' + all.map(function (x) { return '  ' + x; }).join('\n'));
      else if (k === 'ls') print(names.join('  '));
      else if (k === 'date') print(new Date().toString());
      else if (k.indexOf('echo ') === 0) print(c.slice(5));
      else if (Object.prototype.hasOwnProperty.call(cmds, k)) print(cmds[k]);
      else if (k.indexOf('sudo') === 0) print('Nice try 😄', 'pf-term-err');
      else print('command not found: ' + c + ' — type "help"', 'pf-term-err');
    }
    $('.pf-term-line', t).addEventListener('submit', function (e) { e.preventDefault(); run(input.value); input.value = ''; body.scrollTop = body.scrollHeight; });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) input.value = hist[--hi]; }
      else if (e.key === 'ArrowDown') { e.preventDefault(); if (hi < hist.length) input.value = hist[++hi] || ''; }
      else if (e.key === 'Tab' && input.value) {
        var m = all.filter(function (x) { return x.indexOf(input.value.toLowerCase()) === 0; });
        if (m.length === 1) { e.preventDefault(); input.value = m[0]; }
      }
    });
    body.addEventListener('click', function () { if (!String(window.getSelection())) input.focus({ preventScroll: true }); });
  });

  // ---------- code playground ----------
  $$('[data-pg]', root).forEach(function (pg) {
    var frame = $('.pf-pg-out', pg), code = {};
    $$('.pf-pg-code', pg).forEach(function (a) { code[a.getAttribute('data-lang')] = a; });
    function run() {
      frame.srcdoc = '<!doctype html><html><head><meta charset="utf-8"><style>' + code.css.value + '</style></head><body>' + code.html.value + '<script>' + code.js.value + '<\/script></body></html>';
    }
    $('.pf-pg-tabs', pg).addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.classList.contains('pf-pg-run')) return run();
      var lang = b.getAttribute('data-tab');
      $$('[data-tab]', pg).forEach(function (x) { x.classList.toggle('pf-on', x === b); });
      Object.keys(code).forEach(function (k) { code[k].hidden = k !== lang; });
      code[lang].focus();
    });
    var timer;
    pg.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 800); });
    pg.addEventListener('keydown', function (e) { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); run(); } });
  });

  // ---------- API playground ----------
  function highlight(txt) {
    var h = txt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return h.replace(/("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (m) {
      var c = /^"/.test(m) ? (/:$/.test(m) ? 'k' : 's') : /true|false|null/.test(m) ? 'b' : 'n';
      return '<span class="' + c + '">' + m + '</span>';
    });
  }
  $$('[data-api]', root).forEach(function (box) {
    var eps = data(box, 'data-api') || [], method = $('.pf-api-method', box), url = $('.pf-api-url', box), body = $('.pf-api-body', box);
    var status = $('.pf-api-status', box), out = $('.pf-api-out', box);
    var syncBody = function () { body.hidden = method.value === 'GET' || method.value === 'DELETE'; };
    var setStatus = function (parts) {
      status.innerHTML = '';
      parts.forEach(function (p) { var s = el(p[2] ? 'b' : 'span', p[2] ? null : 'pf-meta', p[0]); if (p[1]) s.style.color = p[1]; status.appendChild(s); });
    };
    box.addEventListener('click', function (e) {
      var b = e.target.closest('.pf-api-ep');
      if (!b) return;
      var ep = eps[Number(b.getAttribute('data-i'))];
      $$('.pf-api-ep', box).forEach(function (x) { x.classList.toggle('pf-on', x === b); });
      method.value = ep.method; url.value = ep.url; body.value = ep.body;
      syncBody();
      out.textContent = '';
      setStatus([['Press Send to make a live request.']]);
    });
    method.addEventListener('change', syncBody);
    $('.pf-api-req', box).addEventListener('submit', function (e) {
      e.preventDefault();
      var opts = { method: method.value, headers: {} };
      if (!body.hidden && body.value.trim()) { opts.body = body.value; opts.headers['Content-Type'] = 'application/json'; }
      setStatus([['Sending…']]);
      out.textContent = '';
      var t0 = performance.now();
      fetch(url.value, opts).then(function (r) {
        return r.text().then(function (txt) {
          var ms = Math.round(performance.now() - t0);
          setStatus([[r.status + ' ' + (r.statusText || ''), r.ok ? '#16A34A' : '#DC2626', 1], [ms + ' ms'], [(txt.length / 1024).toFixed(1) + ' KB']]);
          try { out.innerHTML = highlight(JSON.stringify(JSON.parse(txt), null, 2).slice(0, 60000)); } catch (x) { out.textContent = txt.slice(0, 20000); }
        });
      }).catch(function () {
        setStatus([['Request failed', '#DC2626', 1], ['The API may block browser requests (CORS) or be offline.']]);
      });
    });
  });

  // ---------- WebSocket demo ----------
  $$('[data-ws]', root).forEach(function (box) {
    var url = box.getAttribute('data-ws'), ws = null, pending = [], sent = 0, recv = 0;
    var log = $('.pf-ws-log', box), form = $('.pf-ws-form', box), input = $('input', form), send = $('button', form), toggle = $('.pf-ws-toggle', box), state = $('.pf-ws-state', box);
    var stat = function (k, v) { $('[data-k="' + k + '"]', box).textContent = v; };
    function msg(text, who, meta) {
      var m = el('div', 'pf-msg pf-msg-' + who, text);
      if (meta) m.appendChild(el('small', null, meta));
      log.appendChild(m);
      log.scrollTop = log.scrollHeight;
    }
    function set(s, label) {
      box.classList.toggle('pf-ws-on', s === 'on');
      box.classList.toggle('pf-ws-wait', s === 'wait');
      state.textContent = label;
      input.disabled = send.disabled = s !== 'on';
      toggle.textContent = s === 'off' ? 'Connect' : 'Disconnect';
    }
    toggle.addEventListener('click', function () {
      if (ws) { ws.close(); return; }
      if (!/^wss?:\/\//.test(url)) { msg('Set a ws:// or wss:// URL for this block.', 'sys'); return; }
      log.innerHTML = '';
      set('wait', 'Connecting…');
      try { ws = new WebSocket(url); } catch (e) { ws = null; set('off', 'Not connected'); msg('Could not open the connection.', 'sys'); return; }
      ws.onopen = function () { set('on', 'Connected'); msg('Connected to ' + url, 'sys'); input.focus(); };
      ws.onmessage = function (e) {
        recv++;
        stat('recv', recv);
        var text = typeof e.data === 'string' ? e.data : '[binary message]';
        var i = pending.findIndex(function (p) { return p.text === text; });
        if (i > -1) {
          var ms = Math.round(performance.now() - pending[i].t);
          pending.splice(i, 1);
          stat('rtt', ms + ' ms');
          msg(text, 'bot', 'echo · ' + ms + ' ms');
        } else msg(text, 'bot', 'server');
      };
      ws.onclose = function () { ws = null; pending = []; set('off', 'Disconnected'); msg('Connection closed.', 'sys'); };
      ws.onerror = function () { msg('Connection error. The server may be offline.', 'sys'); };
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text || !ws || ws.readyState !== 1) return;
      pending.push({ text: text, t: performance.now() });
      ws.send(text);
      stat('sent', ++sent);
      msg(text, 'me');
      input.value = '';
    });
  });

  // ---------- live demo embed ----------
  $$('[data-demo]', root).forEach(function (b) {
    var go = $('.pf-demo-load', b);
    if (!go) return;
    go.addEventListener('click', function () {
      var f = el('iframe');
      f.src = b.getAttribute('data-demo');
      f.title = 'Live demo';
      f.setAttribute('allow', 'clipboard-write; fullscreen');
      $('.pf-browser-view', b).appendChild(f);
      go.remove();
    });
  });

  // ---------- live project status ----------
  $$('[data-status]', root).forEach(function (box) {
    var rows = $$('.pf-status-row', box), when = $('.pf-status-when', box);
    function bar(hist, ms, ok) {
      var i = el('i', ok ? '' : 'pf-x');
      i.style.height = Math.max(20, Math.min(100, ms / 15)) + '%';
      i.title = ok ? ms + ' ms' : 'unreachable';
      hist.appendChild(i);
      while (hist.children.length > 12) hist.removeChild(hist.firstChild);
    }
    function check(row) {
      var pill = $('.pf-pill', row), ms = $('.pf-status-ms', row), hist = $('.pf-status-hist', row), u = row.getAttribute('data-url');
      pill.className = 'pf-pill';
      pill.textContent = 'Checking…';
      var ctl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 8000), t0 = performance.now();
      // no-cors gives an opaque response: it resolves when the server answers and rejects when it is unreachable
      return fetch(u, { mode: 'no-cors', cache: 'no-store', signal: ctl ? ctl.signal : undefined }).then(function () {
        var t = Math.round(performance.now() - t0);
        pill.className = 'pf-pill pf-pill-up'; pill.textContent = 'Online'; ms.textContent = t + ' ms';
        bar(hist, t, true);
      }, function () {
        pill.className = 'pf-pill pf-pill-down'; pill.textContent = 'Unreachable'; ms.textContent = '—';
        bar(hist, 0, false);
      }).then(function () { clearTimeout(timer); });
    }
    function all() { Promise.all(rows.map(check)).then(function () { when.textContent = 'Last checked ' + new Date().toLocaleTimeString(); }); }
    $('.pf-status-refresh', box).addEventListener('click', all);
    all();
    setInterval(function () { if (!document.hidden) all(); }, 60000);
  });

  // ---------- Core Web Vitals ----------
  $$('[data-vitals]', root).forEach(function (box) {
    var TH = { LCP: [2500, 4000], FCP: [1800, 3000], CLS: [0.1, 0.25], INP: [200, 500], TTFB: [800, 1800] };
    function show(k, v) {
      var c = $('[data-v="' + k + '"]', box);
      if (!c) return;
      var t = TH[k];
      c.style.setProperty('--vc', v <= t[0] ? '#0CCE6B' : v <= t[1] ? '#FFA400' : '#FF4E42');
      $('strong', c).textContent = k === 'CLS' ? v.toFixed(3) : v >= 1000 ? (v / 1000).toFixed(2) + ' s' : Math.round(v) + ' ms';
    }
    function watch(type, cb, extra) {
      try {
        var o = new PerformanceObserver(function (l) { l.getEntries().forEach(cb); });
        o.observe(Object.assign({ type: type, buffered: true }, extra || {}));
      } catch (e) { /* metric not supported here */ }
    }
    var navEntry = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    if (navEntry && navEntry.responseStart > 0) show('TTFB', navEntry.responseStart);
    watch('paint', function (e) { if (e.name === 'first-contentful-paint') show('FCP', e.startTime); });
    watch('largest-contentful-paint', function (e) { show('LCP', e.startTime); });
    var cls = 0;
    show('CLS', 0);
    watch('layout-shift', function (e) { if (!e.hadRecentInput) { cls += e.value; show('CLS', cls); } });
    var inp = 0;
    watch('event', function (e) { if (e.interactionId && e.duration > inp) { inp = e.duration; show('INP', inp); } }, { durationThreshold: 16 });
    var inpCell = $('[data-v="INP"] strong', box);
    if (inpCell) inpCell.textContent = 'tap page';
    setTimeout(function () {
      $$('.pf-vital strong', box).forEach(function (s) { if (s.textContent === '—') { s.textContent = 'n/a'; s.title = 'Not available in this browser'; } });
    }, 6000);
    var psi = $('.pf-psi', box.parentNode);
    if (psi && /^https?:/.test(location.href)) psi.href = 'https://pagespeed.web.dev/report?url=' + encodeURIComponent(location.href);
  });

  // ---------- chatbot ----------
  var openChat = null;
  var STOP = 'a an the is are am do does did you your i me my of to in on for and or what which who how when where why can could would will with about tell please there have has it this that be'.split(' ');
  var words = function (s) { return s.toLowerCase().replace(/[^\p{L}\p{N}+#.\s]/gu, ' ').split(/\s+/).filter(function (w) { return w.length > 1 && STOP.indexOf(w) < 0; }); };
  $$('[data-chat]', root).forEach(function (chat) {
    var cfg = data(chat, 'data-chat') || {}, log = $('.pf-chat-log', chat), form = $('.pf-chat-form', chat), input = $('input', form), history = [];
    var FALLBACK = 'I’m not sure about that one. Try asking about projects, tech stack, experience, or how to get in touch.';
    function say(text, who) {
      var m = el('div', 'pf-msg pf-msg-' + who, text);
      m.style.whiteSpace = 'pre-line';
      log.appendChild(m);
      log.scrollTop = log.scrollHeight;
      return m;
    }
    // Offline answers: match the question against the owner's keyword list, then against the page's own text.
    function local(q) {
      var qw = words(q), lq = q.toLowerCase();
      if (!qw.length) return null;
      var best = null, score = 0;
      (cfg.kb || []).forEach(function (entry) {
        var s = 0;
        entry.k.forEach(function (k) {
          if (k.indexOf(' ') > -1) { if (lq.indexOf(k) > -1) s += 3; return; }
          qw.forEach(function (w) { if (w === k || (k.length > 3 && w.indexOf(k) === 0) || (w.length > 3 && k.indexOf(w) === 0)) s += 2; });
        });
        if (s > score) { score = s; best = entry.a; }
      });
      if (best) return best;
      var hit = null;
      score = 0;
      $$('.pf-section p, .pf-section li, .pf-section h3, .pf-section blockquote', root).forEach(function (n) {
        if (chat.contains(n)) return;
        var t = n.textContent.toLowerCase(), s = 0;
        qw.forEach(function (w) { if (t.indexOf(w) > -1) s++; });
        if (s > score) { score = s; hit = n; }
      });
      if (hit && score >= Math.min(2, qw.length)) {
        var sec = hit.closest('.pf-section'), h = sec && $('h1,h2', sec);
        return (h ? 'From “' + h.textContent.trim() + '”: ' : '') + hit.textContent.trim().slice(0, 280);
      }
      return null;
    }
    function ask(q) {
      q = q.trim();
      if (!q) return;
      say(q, 'me');
      input.value = '';
      var typing = say('', 'bot');
      typing.innerHTML = '<span class="pf-typing"><i></i><i></i><i></i></span>';
      var done = function (a) {
        typing.textContent = a;
        log.scrollTop = log.scrollHeight;
        history.push({ role: 'user', content: q }, { role: 'assistant', content: a });
      };
      if (cfg.endpoint) {
        fetch(cfg.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: q, history: history.slice(-10) }) })
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
          .then(function (t) {
            var a;
            try { var j = JSON.parse(t); a = j.reply || j.answer || j.message || j.text; } catch (e) { a = t; }
            done(String(a || local(q) || FALLBACK));
          })
          .catch(function () { done(local(q) || FALLBACK); });
      } else setTimeout(function () { done(local(q) || FALLBACK); }, 450 + Math.random() * 400);
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); });
    chat.addEventListener('click', function (e) { var c = e.target.closest('.pf-chip'); if (c) ask(c.textContent); });

    if (chat.classList.contains('pf-chat-floating') && !$('.pf-fab', layer)) {
      var sec = chat.closest('.pf-section');
      if (sec) sec.style.display = 'none';
      layer.appendChild(chat);
      var fab = el('button', 'pf-fab', '✦');
      fab.type = 'button';
      fab.setAttribute('aria-label', cfg.title || 'Open chat');
      fab.setAttribute('aria-expanded', 'false');
      layer.appendChild(fab);
      var show = function (open) {
        chat.classList.toggle('pf-open', open);
        fab.textContent = open ? '×' : '✦';
        fab.setAttribute('aria-expanded', String(open));
        if (open) setTimeout(function () { input.focus(); }, 60);
      };
      fab.onclick = function () { show(!chat.classList.contains('pf-open')); };
      $('.pf-chat-close', chat).onclick = function () { show(false); fab.focus(); };
      chat.addEventListener('keydown', function (e) { if (e.key === 'Escape') { show(false); fab.focus(); } });
      openChat = function () { show(true); };
    } else if (!openChat) {
      openChat = function () { chat.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); input.focus({ preventScroll: true }); };
    }
  });

  // ---------- command palette (⌘K / Ctrl+K) ----------
  if (root.hasAttribute('data-cmdk')) {
    var items = [];
    var go = function (target) { return function () { target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }; };
    $$('.pf-section[id]', root).forEach(function (s) {
      var h = $('h1,h2,h3', s);
      items.push({ icon: '#', label: (h ? h.textContent : s.id).trim().slice(0, 60), hint: 'Section', run: go(s) });
    });
    if (toggleMode) items.push({ icon: '◐', label: 'Switch light / dark mode', hint: 'Theme', run: toggleMode });
    if (openChat) items.push({ icon: '✦', label: 'Ask the assistant', hint: 'Chat', run: openChat });
    var mail = $('a[href^="mailto:"]', root);
    if (mail) {
      var addr = mail.getAttribute('href').replace(/^mailto:/, '').split('?')[0];
      items.push({ icon: '@', label: 'Copy email address', hint: addr, run: function () { if (navigator.clipboard) navigator.clipboard.writeText(addr).catch(function () {}); } });
      items.push({ icon: '✉', label: 'Send an email', hint: addr, run: function () { location.href = 'mailto:' + addr; } });
    }
    var cv = $('.pf-s-resume a, a[href$=".pdf"]', root);
    if (cv) items.push({ icon: '⇩', label: 'Download resume', hint: 'CV', run: function () { window.open(cv.href, '_blank', 'noopener'); } });
    $$('.pf-social-item', root).forEach(function (a) {
      items.push({ icon: '↗', label: 'Open ' + (a.getAttribute('aria-label') || a.textContent), hint: 'Link', run: function () { window.open(a.href, '_blank', 'noopener'); } });
    });
    items.push({ icon: '↑', label: 'Back to top', hint: 'Navigate', run: function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); } });

    var box = el('div', 'pf-cmdk');
    box.hidden = true;
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Command palette');
    box.innerHTML = '<div class="pf-cmdk-box"><input class="pf-cmdk-in" placeholder="Search sections, links and actions…" aria-label="Search commands"><ul class="pf-cmdk-list" role="listbox"></ul><div class="pf-cmdk-foot">↑ ↓ to move · Enter to open · Esc to close</div></div>';
    layer.appendChild(box);
    var q = $('.pf-cmdk-in', box), ul = $('.pf-cmdk-list', box), shown = [], active = 0, lastFocus = null;
    var mark = function () {
      $$('li', ul).forEach(function (li, i) { li.classList.toggle('pf-on', i === active); li.setAttribute('aria-selected', String(i === active)); });
      var cur = ul.children[active];
      if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
    };
    var draw = function () {
      var term = q.value.toLowerCase().trim();
      shown = items.filter(function (it) { return (it.label + ' ' + it.hint).toLowerCase().indexOf(term) > -1; });
      active = Math.max(0, Math.min(active, shown.length - 1));
      ul.innerHTML = '';
      shown.forEach(function (it, i) {
        var li = el('li');
        li.setAttribute('role', 'option');
        li.appendChild(el('b', null, it.icon));
        li.appendChild(el('span', null, it.label));
        li.appendChild(el('small', null, it.hint));
        li.onmousemove = function () { if (active !== i) { active = i; mark(); } };
        li.onclick = function () { choose(i); };
        ul.appendChild(li);
      });
      if (!shown.length) ul.appendChild(el('li', null, 'No matches'));
      mark();
    };
    var openK = function () { lastFocus = document.activeElement; box.hidden = false; q.value = ''; active = 0; draw(); q.focus(); };
    var closeK = function () { box.hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); };
    var choose = function (i) { var it = shown[i]; closeK(); if (it) it.run(); };
    q.oninput = function () { active = 0; draw(); };
    q.onkeydown = function (e) {
      var n = Math.max(1, shown.length);
      if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % n; mark(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + n) % n; mark(); }
      else if (e.key === 'Enter') { e.preventDefault(); choose(active); }
      else if (e.key === 'Escape') { e.preventDefault(); closeK(); }
      else if (e.key === 'Tab') e.preventDefault();
    };
    box.onclick = function (e) { if (e.target === box) closeK(); };
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (box.hidden) openK(); else closeK(); }
    });
    var hint = el('button', 'pf-kbd', (/Mac|iP/.test(navigator.platform || navigator.userAgent) ? '⌘' : 'Ctrl ') + 'K');
    hint.type = 'button';
    hint.setAttribute('aria-label', 'Open command palette');
    hint.onclick = openK;
    layer.appendChild(hint);
  }
}
