'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Layers, Plus, Search } from 'lucide-react';
import { COMPONENTS, COMPONENT_CATEGORIES } from '@/lib/components';
import { esc, renderBlock, rootClass, themeVars, varsToString } from '@/lib/render';

const WIDTH = 1100;

// Live, scaled-down render of all blocks in a component (top part only)
function Preview({ comp, theme }) {
  const box = useRef(null);
  const [scale, setScale] = useState(0);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = box.current;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / WIDTH));
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { rootMargin: '300px' });
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); };
  }, []);
  const html = useMemo(() => (seen ? `<div class="${rootClass(theme)}" style="${esc(varsToString(themeVars(theme)))}">${comp.blocks().map((b) => renderBlock(b, theme)).join('')}</div>` : ''), [seen, comp, theme]);
  return (
    <div ref={box} className="relative w-full shrink-0 overflow-hidden bg-white" style={scale ? { height: (scale * WIDTH) / 1.35 } : { aspectRatio: '1.35' }} aria-hidden="true">
      {scale > 0 && html ? <div className="pointer-events-none absolute left-0 top-0 origin-top-left" style={{ width: WIDTH, transform: `scale(${scale})` }} dangerouslySetInnerHTML={{ __html: html }} /> : <div className="absolute inset-0 animate-pulse bg-paper" />}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}

export default function ComponentsPanel({ theme, onAdd, setDragging }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const counts = useMemo(() => {
    const c = {};
    COMPONENTS.forEach((x) => { c[x.category] = (c[x.category] || 0) + 1; });
    return c;
  }, []);
  const shown = COMPONENTS.filter((c) => (cat === 'All' || c.category === cat) && (!q || `${c.name} ${c.category}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="p-4">
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
        <input className="input pl-8" placeholder={`Search ${COMPONENTS.length} components`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search components" />
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Component categories">
        {['All', ...COMPONENT_CATEGORIES].map((c) => (
          <button key={c} type="button" role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cat === c ? 'border-ink bg-ink text-white' : 'border-line bg-white text-mute hover:text-ink'}`}>
            {c} <span className="opacity-60">{c === 'All' ? COMPONENTS.length : counts[c]}</span>
          </button>
        ))}
      </div>
      <p className="mb-3 text-xs text-mute">Ready-made sets of blocks. Click to add below the selected block, or drag onto the page. Every block stays fully editable.</p>
      <div className="space-y-3">
        {shown.map((c) => {
          const n = c.blocks().length;
          return (
            <button
              key={c.id}
              type="button"
              draggable
              onDragStart={(e) => { e.dataTransfer.setData('text/plain', 'comp:' + c.id); e.dataTransfer.effectAllowed = 'copy'; setDragging(true); }}
              onDragEnd={() => setDragging(false)}
              onClick={() => onAdd(c)}
              className="group block w-full cursor-grab overflow-hidden rounded-xl border border-line bg-white text-left hover:border-signal active:cursor-grabbing"
            >
              <Preview comp={c} theme={theme} />
              <span className="flex items-center justify-between gap-2 border-t border-line px-3 py-2">
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold">{c.name}</span>
                  <span className="text-[11px] text-mute">{c.category}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-paper px-2 py-0.5 text-[11px] font-semibold text-mute"><Layers size={11} /> {n}</span>
                <Plus size={15} className="shrink-0 text-signal opacity-0 group-hover:opacity-100" />
              </span>
            </button>
          );
        })}
        {!shown.length && <p className="py-8 text-center text-sm text-mute">No components match.</p>}
      </div>
    </div>
  );
}
