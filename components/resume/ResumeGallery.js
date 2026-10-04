'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BadgeCheck, Crown, Eye, PenLine, Search, Trophy, X } from 'lucide-react';
import { RESUME_DESIGNS } from '@/lib/resume/designs';
import { RESUME_CATEGORIES, TOP_CATEGORY, resumeFromTemplate } from '@/lib/resume/templates';
import ResumeView, { ResumeAssets } from './ResumeView';

const PAGE = 24;

function Card({ t, onPreview, onUse }) {
  const doc = useMemo(() => resumeFromTemplate(t.slug), [t.slug]);
  return (
    <article className="group">
      <div className="relative overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_0_#E8E2D8]">
        <ResumeView doc={doc} />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/60 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button onClick={() => onPreview(t)} className="btn-light"><Eye size={16} /> Preview</button>
          <button onClick={() => onUse(t.slug)} className="btn-primary"><PenLine size={16} /> Use template</button>
        </div>
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
          {t.top && <span className="chip bg-ink text-sun shadow"><Trophy size={12} /> Top ranking</span>}
          {t.premium && <span className="chip bg-sun text-ink shadow"><Crown size={12} /> Premium</span>}
          {t.ats && <span className="chip bg-emerald-600 text-white shadow"><BadgeCheck size={12} /> ATS-friendly</span>}
        </div>
      </div>
      <div className="mt-2.5">
        <h3 className="font-bold">{t.name}</h3>
        <p className="text-xs text-mute">{t.top ? `Top ranking · ${t.profession}` : t.category}</p>
      </div>
    </article>
  );
}

export default function ResumeGallery({ templates }) {
  const router = useRouter();
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [tier, setTier] = useState('all');
  const [design, setDesign] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [preview, setPreview] = useState(null);
  const reset = (fn) => (v) => { fn(v); setLimit(PAGE); };
  const counts = useMemo(() => {
    const c = {};
    templates.forEach((t) => { c[t.category] = (c[t.category] || 0) + 1; });
    return c;
  }, [templates]);
  useEffect(() => {
    if (!preview) return;
    const onKey = (e) => e.key === 'Escape' && setPreview(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [preview]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return templates.filter((t) =>
      (cat === 'All' || t.category === cat) &&
      (tier === 'all' || (tier === 'premium' && t.premium) || (tier === 'free' && !t.premium) || (tier === 'ats' && t.ats) || (tier === 'top' && t.top)) &&
      (!design || t.design === design) &&
      (!term || `${t.name} ${t.category} ${t.description}`.toLowerCase().includes(term)));
  }, [templates, cat, tier, design, q]);
  const use = (slug) => router.push(`/resume/new?template=${slug}`);
  const previewDoc = useMemo(() => (preview ? resumeFromTemplate(preview.slug) : null), [preview]);

  return (
    <div>
      <ResumeAssets />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input className="input pl-9" placeholder={`Search ${templates.length} resume templates — try “nurse”, “ATS” or “sidebar”`} value={q} onChange={(e) => reset(setQ)(e.target.value)} aria-label="Search resume templates" />
        </div>
        <select className="input w-auto" value={design} onChange={(e) => reset(setDesign)(e.target.value)} aria-label="Design">
          <option value="">All {RESUME_DESIGNS.length} designs</option>
          {RESUME_DESIGNS.map((d) => <option key={d.slug} value={d.slug}>{d.tier === 'top' ? '🏆 ' : ''}{d.name}{d.premium ? ' ★' : ''}</option>)}
        </select>
        <div className="flex rounded-lg bg-ink/5 p-0.5" role="radiogroup" aria-label="Filter">
          {[['all', 'All'], ['top', 'Top ranking'], ['free', 'Free'], ['premium', 'Premium'], ['ats', 'ATS-friendly']].map(([v, l]) => (
            <button key={v} role="radio" aria-checked={tier === v} onClick={() => reset(setTier)(v)} className={`rounded-md px-3 py-1.5 text-sm font-semibold ${tier === v ? 'bg-white shadow-sm' : 'text-mute'}`}>{l}</button>
          ))}
        </div>
      </div>
      <div className="thin-scroll -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-2" role="tablist" aria-label="Resume categories">
        {['All', ...RESUME_CATEGORIES].map((c) => (
          <button key={c} role="tab" aria-selected={cat === c} onClick={() => reset(setCat)(c)} className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold ${c === TOP_CATEGORY ? (cat === c ? 'border-amber-500 bg-amber-500 text-ink' : 'border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100') : cat === c ? 'border-ink bg-ink text-white' : 'border-line bg-white text-mute hover:text-ink'}`}>
            {c === TOP_CATEGORY && <Trophy size={14} />}{c} {c !== 'All' && <span className="opacity-60">{counts[c] || 0}</span>}
          </button>
        ))}
      </div>
      <p className="mb-4 text-sm text-mute">{shown.length} resume template{shown.length === 1 ? '' : 's'}{cat !== 'All' ? ` for ${cat}` : ''}</p>
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {shown.slice(0, limit).map((t) => <Card key={t.slug} t={t} onPreview={setPreview} onUse={use} />)}
      </div>
      {shown.length > limit && (
        <div className="mt-10 text-center"><button className="btn-light px-6 py-2.5" onClick={() => setLimit((l) => l + PAGE)}>Show more ({shown.length - limit} left)</button></div>
      )}
      {!shown.length && <p className="rounded-xl border border-dashed border-line py-16 text-center text-mute">No resume templates match.</p>}

      {preview && previewDoc && (
        <div className="fixed inset-0 z-50 flex flex-col bg-ink/80" role="dialog" aria-modal="true" aria-label={`Preview of ${preview.name}`}>
          <div className="flex h-14 shrink-0 items-center justify-between gap-3 px-4 text-white">
            <div className="min-w-0 truncate font-semibold">{preview.name} · {preview.category}{preview.premium ? ' · Premium' : ''}</div>
            <div className="flex items-center gap-2">
              <button onClick={() => use(preview.slug)} className="btn-primary"><PenLine size={16} /> Use this template</button>
              <button onClick={() => setPreview(null)} className="rounded-lg p-2 text-white/80 hover:bg-white/10" aria-label="Close preview"><X size={20} /></button>
            </div>
          </div>
          <div className="thin-scroll flex-1 overflow-y-auto px-4 pb-8">
            <div className="mx-auto max-w-3xl overflow-hidden rounded-md bg-white shadow-2xl"><ResumeView doc={previewDoc} crop={false} lazy={false} guides /></div>
          </div>
        </div>
      )}
    </div>
  );
}
