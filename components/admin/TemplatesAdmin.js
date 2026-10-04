'use client';
import { useCallback, useMemo, useState } from 'react';
import { Eye, Search } from 'lucide-react';
import PreviewModal from '../PreviewModal';
import TemplateThumb from '../TemplateThumb';
import { thumbHtml } from '../TemplateGallery';
import Switch from './Switch';
import { renderDocument } from '@/lib/render';
import { TEMPLATE_CATEGORIES, portfolioFromTemplate } from '@/lib/templates';

const PAGE = 30;

function Card({ t, onPreview, patch }) {
  const render = useCallback(() => thumbHtml(t.slug), [t.slug]);
  return (
    <article className={`card overflow-hidden ${t.active ? '' : 'opacity-60'}`}>
      <button className="relative block w-full" onClick={() => onPreview(t)} aria-label={`Preview ${t.name}`}>
        <TemplateThumb render={render} />
        <span className="absolute right-2 top-2 rounded-md bg-ink/80 p-1.5 text-white"><Eye size={14} /></span>
      </button>
      <div className="border-t border-line p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="truncate text-lg font-bold">{t.name}</h2>
          <span className="shrink-0 text-xs text-mute">{t.published} live</span>
        </div>
        <p className="text-xs text-mute">{t.category}</p>
        <div className="mt-3 flex items-center justify-between text-sm"><span>Premium</span><Switch tone="sun" label="Premium" checked={t.premium} onChange={(v) => patch(t.slug, { premium: v })} /></div>
        <div className="mt-2 flex items-center justify-between text-sm"><span>Show in gallery</span><Switch label="Show in gallery" checked={t.active} onChange={(v) => patch(t.slug, { active: v })} /></div>
      </div>
    </article>
  );
}

export default function TemplatesAdmin({ initial }) {
  const [list, setList] = useState(initial);
  const [preview, setPreview] = useState(null);
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(PAGE);

  async function patch(slug, changes) {
    setList((l) => l.map((t) => (t.slug === slug ? { ...t, ...changes } : t)));
    await fetch(`/api/admin/templates/${slug}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(changes) });
  }

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return list.filter((t) => (cat === 'All' || t.category === cat) && (!term || `${t.name} ${t.slug} ${t.category}`.toLowerCase().includes(term)));
  }, [list, cat, q]);
  const previewHtml = useMemo(() => (preview ? renderDocument(portfolioFromTemplate(preview.slug)) : ''), [preview]);
  const live = list.filter((t) => t.active).length;
  const premium = list.filter((t) => t.premium).length;

  return (
    <div className="max-w-7xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Templates</h1>
      <p className="mt-1 text-mute">Mark templates as premium, or hide them from the gallery. {list.length} templates · {live} shown · {premium} premium.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input className="input pl-9" placeholder="Search by name or slug" value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} aria-label="Search templates" />
        </div>
        <select className="input w-auto" value={cat} onChange={(e) => { setCat(e.target.value); setLimit(PAGE); }} aria-label="Category">
          {TEMPLATE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {shown.slice(0, limit).map((t) => <Card key={t.slug} t={t} onPreview={setPreview} patch={patch} />)}
      </div>
      {shown.length > limit && (
        <div className="mt-8 text-center"><button className="btn-light px-6 py-2.5" onClick={() => setLimit((l) => l + PAGE)}>Show more ({shown.length - limit} left)</button></div>
      )}
      {preview && <PreviewModal html={previewHtml} title={preview.name} onClose={() => setPreview(null)} />}
    </div>
  );
}
