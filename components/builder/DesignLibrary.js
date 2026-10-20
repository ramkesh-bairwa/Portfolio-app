'use client';
import { useEffect, useMemo, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { allDesigns, DESIGN_COLLECTIONS, DESIGN_COUNT, DESIGN_FORMATS, DESIGN_INDUSTRIES } from '@/lib/designs';

const PAGE = 36;
// Newest collection (artwork) first
const ORDERED = () => [...allDesigns()].sort((a, b) => (a.collection === b.collection ? a.id - b.id : a.collection === 'artwork' ? -1 : 1));

// Browse the ready-made designs. multi: pick many (gallery lists), otherwise one click picks and closes.
export default function DesignLibrary({ onPick, onClose, multi = false }) {
  const [collection, setCollection] = useState('');
  const [industry, setIndustry] = useState('');
  const [format, setFormat] = useState('');
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [picked, setPicked] = useState([]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return ORDERED().filter((d) => (!collection || d.collection === collection) && (!industry || d.industry === industry) && (!format || d.format === format)
      && (!s || d.title.toLowerCase().includes(s) || d.industryName.toLowerCase().includes(s) || String(d.id) === s));
  }, [collection, industry, format, q]);

  useEffect(() => setLimit(PAGE), [collection, industry, format, q]);
  const pickCollection = (slug) => { setCollection(slug); setIndustry(''); setFormat(''); };
  const inCollection = (x) => !collection || x.collection === collection;
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggle = (d) => setPicked((p) => (p.some((x) => x.id === d.id) ? p.filter((x) => x.id !== d.id) : [...p, d].slice(0, 30)));
  const choose = (d) => (multi ? toggle(d) : (onPick([d]), onClose()));
  const chip = (active) => `shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${active ? 'border-ink bg-ink text-white' : 'border-line bg-white text-mute hover:border-ink/40 hover:text-ink'}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 sm:p-6" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Design library" className="flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-ink">Design library</h2>
            <p className="text-xs text-mute">{DESIGN_COUNT.toLocaleString('en-IN')} ready-made designs: logos, posters, product shots, fashion, rangoli, websites, apps and more. Free to use in your portfolio.</p>
          </div>
          <label className="relative hidden w-64 sm:block">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
            <input className="input py-2 pl-8 text-sm" placeholder="Search brand, industry or #" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-mute hover:bg-paper hover:text-ink" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="space-y-2 border-b border-line px-5 py-3">
          <input className="input py-2 text-sm sm:hidden" placeholder="Search brand, industry or #" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="flex gap-1 rounded-lg bg-paper p-1" role="tablist">
            {[{ slug: '', name: 'All', count: DESIGN_COUNT }, ...DESIGN_COLLECTIONS].map((x) => (
              <button key={x.slug} type="button" role="tab" aria-selected={collection === x.slug} onClick={() => pickCollection(x.slug)} className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${collection === x.slug ? 'bg-white text-ink shadow-sm' : 'text-mute hover:text-ink'}`}>
                {x.name} <span className="font-normal text-mute">({x.count.toLocaleString('en-IN')})</span>
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 no-scrollbar overflow-x-auto pb-1">
            <button type="button" className={chip(!industry)} onClick={() => setIndustry('')}>All categories</button>
            {DESIGN_INDUSTRIES.filter(inCollection).map((x) => <button key={x.slug} type="button" className={chip(industry === x.slug)} onClick={() => setIndustry(x.slug)}>{x.name}</button>)}
          </div>
          <div className="flex gap-1.5 no-scrollbar overflow-x-auto pb-1">
            <button type="button" className={chip(!format)} onClick={() => setFormat('')}>All formats</button>
            {DESIGN_FORMATS.filter(inCollection).map((x) => <button key={x.slug} type="button" className={chip(format === x.slug)} onClick={() => setFormat(x.slug)}>{x.name}</button>)}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <p className="mb-3 text-xs text-mute">{list.length.toLocaleString('en-IN')} designs{multi ? ' · pick as many as you like (up to 30)' : ''}</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {list.slice(0, limit).map((d) => {
              const on = picked.some((x) => x.id === d.id);
              return (
                <button key={d.id} type="button" onClick={() => choose(d)} className={`group overflow-hidden rounded-xl border text-left transition ${on ? 'border-signal ring-2 ring-signal' : 'border-line hover:border-ink/40 hover:shadow-md'}`}>
                  <div className="relative aspect-[4/3] bg-paper">
                    <img src={d.url} alt={d.title} loading="lazy" className={`h-full w-full ${d.w / d.h === 4 / 3 ? 'object-cover' : 'object-contain'}`} />
                    {multi && <span className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 ${on ? 'border-signal bg-signal text-white' : 'border-white bg-black/20'}`}>{on && <Check size={14} />}</span>}
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="truncate text-xs font-semibold text-ink">{d.brand}</p>
                    <p className="truncate text-[11px] text-mute">#{d.id} · {d.industryName} · {d.formatName}</p>
                  </div>
                </button>
              );
            })}
          </div>
          {!list.length && <p className="py-16 text-center text-sm text-mute">No designs match. Try another filter.</p>}
          {limit < list.length && (
            <div className="mt-5 text-center"><button type="button" className="btn-light px-5 py-2" onClick={() => setLimit((l) => l + PAGE * 2)}>Show more</button></div>
          )}
        </div>

        {multi && (
          <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
            <p className="text-sm text-mute">{picked.length ? `${picked.length} selected` : 'Click designs to select them'}</p>
            <div className="flex gap-2">
              {!!picked.length && <button type="button" className="btn-light px-4 py-2" onClick={() => setPicked([])}>Clear</button>}
              <button type="button" className="btn-primary px-4 py-2" disabled={!picked.length} onClick={() => { onPick(picked); onClose(); }}>
                Add {picked.length || ''} design{picked.length === 1 ? '' : 's'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
