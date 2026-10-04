'use client';
import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Eye, PenLine, Search } from 'lucide-react';
import PreviewModal from './PreviewModal';
import TemplateThumb from './TemplateThumb';
import { renderDocument } from '@/lib/render';
import { TEMPLATE_CATEGORIES, portfolioFromTemplate } from '@/lib/templates';

const PAGE = 24;

export const thumbHtml = (slug) => {
  const p = portfolioFromTemplate(slug);
  return renderDocument({ ...p, theme: { ...p.theme, animation: false } });
};

function Card({ t, onPreview, onUse }) {
  const render = useCallback(() => thumbHtml(t.slug), [t.slug]);
  return (
    <article className="group">
      <div className="relative overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_0_#E8E2D8]">
        <TemplateThumb render={render} />
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/60 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button onClick={() => onPreview(t)} className="btn-light"><Eye size={16} /> Preview</button>
          <button onClick={() => onUse(t.slug)} className="btn-primary"><PenLine size={16} /> Use template</button>
        </div>
        {t.premium && <span className="chip absolute left-3 top-3 bg-sun text-ink shadow"><Crown size={12} /> Premium</span>}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">{t.name}</h3>
          <p className="text-sm text-mute">{t.description}</p>
        </div>
        <span className="mt-1 shrink-0 text-right text-xs font-semibold text-mute">{t.category}</span>
      </div>
    </article>
  );
}

export default function TemplateGallery({ templates }) {
  const router = useRouter();
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [tier, setTier] = useState('all');
  const [limit, setLimit] = useState(PAGE);
  const [preview, setPreview] = useState(null);

  const counts = useMemo(() => {
    const c = {};
    templates.forEach((t) => { c[t.category] = (c[t.category] || 0) + 1; });
    return c;
  }, [templates]);
  const cats = TEMPLATE_CATEGORIES.filter((c) => c === 'All' || counts[c]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return templates.filter((t) =>
      (cat === 'All' || t.category === cat) &&
      (tier === 'all' || (tier === 'premium') === !!t.premium) &&
      (!term || `${t.name} ${t.category} ${t.description}`.toLowerCase().includes(term)));
  }, [templates, cat, tier, q]);

  const reset = (fn) => (v) => { fn(v); setLimit(PAGE); };
  const use = (slug) => router.push(`/builder/new?template=${slug}`);
  const previewHtml = useMemo(() => (preview ? renderDocument(portfolioFromTemplate(preview.slug)) : ''), [preview]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input className="input pl-9" placeholder={`Search ${templates.length} templates — try “chef”, “dark” or “minimal”`} value={q} onChange={(e) => reset(setQ)(e.target.value)} aria-label="Search templates" />
        </div>
        <div className="flex rounded-lg bg-ink/5 p-0.5" role="radiogroup" aria-label="Price">
          {[['all', 'All'], ['free', 'Free'], ['premium', 'Premium']].map(([v, l]) => (
            <button key={v} role="radio" aria-checked={tier === v} onClick={() => reset(setTier)(v)} className={`rounded-md px-3 py-1.5 text-sm font-semibold ${tier === v ? 'bg-white shadow-sm' : 'text-mute'}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="thin-scroll -mx-1 mb-8 flex gap-2 overflow-x-auto px-1 pb-2" role="tablist" aria-label="Template categories">
        {cats.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={cat === c}
            onClick={() => reset(setCat)(c)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold ${cat === c ? 'border-ink bg-ink text-white' : 'border-line bg-white text-mute hover:text-ink'}`}
          >
            {c} <span className={cat === c ? 'text-white/60' : 'text-mute/70'}>{c === 'All' ? templates.length : counts[c]}</span>
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm text-mute">{shown.length} template{shown.length === 1 ? '' : 's'}{cat !== 'All' ? ` for ${cat}` : ''}</p>
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {shown.slice(0, limit).map((t) => <Card key={t.slug} t={t} onPreview={setPreview} onUse={use} />)}
      </div>
      {shown.length > limit && (
        <div className="mt-10 text-center">
          <button className="btn-light px-6 py-2.5" onClick={() => setLimit((l) => l + PAGE)}>Show more ({shown.length - limit} left)</button>
        </div>
      )}
      {!shown.length && (
        <p className="rounded-xl border border-dashed border-line py-16 text-center text-mute">No templates match. Try another search or category.</p>
      )}

      {preview && (
        <PreviewModal html={previewHtml} title={`${preview.name}${preview.premium ? ' · Premium' : ''}`} onClose={() => setPreview(null)}>
          <button onClick={() => use(preview.slug)} className="btn-primary"><PenLine size={16} /> Use this template</button>
        </PreviewModal>
      )}
    </div>
  );
}
