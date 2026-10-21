'use client';
import { useEffect, useMemo, useState } from 'react';
import NextLink from 'next/link';
import { BookOpen, Eye, Search, X } from 'lucide-react';
import { CARD_EVENTS, CARD_EVENT_GROUPS, CARD_FORMAT, CARD_PAGE_OPTIONS, CARD_THEMES, buildCard, cardSlug } from '@/lib/poster/cards';
import { pageDoc } from '@/lib/poster/pages';
import { getFormat } from '@/lib/poster/formats';
import Stage from './Stage';

const STEP = 10;

function Page({ doc, width }) {
  const scale = width / doc.w;
  return (
    <div className="overflow-hidden rounded-[3px] bg-white shadow-md" style={{ width, height: doc.h * scale }}>
      <Stage doc={doc} scale={scale} hideEmpty />
    </div>
  );
}

// Cover with the other pages peeking out behind it, like a folded card
function CardThumb({ doc, width = 220 }) {
  const n = doc.pages?.length || 1;
  const h = (doc.h / doc.w) * width;
  return (
    <div className="relative grid place-items-center rounded-xl border border-line bg-[#E7EBF2] py-4" style={{ minHeight: h + 32 }}>
      <div className="relative" style={{ width, height: h }}>
        {Array.from({ length: n - 1 }).map((_, i) => (
          <div key={i} className="absolute inset-0 rounded-[3px] bg-white shadow" style={{ transform: `translate(${(n - 1 - i) * 7}px, ${(n - 1 - i) * -5}px) rotate(${(n - 1 - i) * 2}deg)` }} />
        ))}
        <div className="relative"><Page doc={pageDoc(doc, 0)} width={width} /></div>
      </div>
      {n > 1 && <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white"><BookOpen size={11} /> {n} pages</span>}
    </div>
  );
}

function Preview({ doc, href, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const n = doc.pages?.length || 1;
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Card preview" onClick={onClose}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 text-white" onClick={(e) => e.stopPropagation()}>
        <p className="min-w-0 truncate font-bold">{doc.name} · {n} page{n > 1 ? 's' : ''}</p>
        <div className="flex shrink-0 items-center gap-2">
          <NextLink href={href} className="btn-primary py-2">Edit this card</NextLink>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 hover:bg-white/25" aria-label="Close preview"><X size={18} /></button>
        </div>
      </div>
      <div className="thin-scroll mt-4 flex flex-1 items-center gap-6 overflow-x-auto px-2 pb-4 sm:justify-center" onClick={(e) => e.stopPropagation()}>
        {Array.from({ length: n }).map((_, i) => (
          <figure key={i} className="shrink-0">
            <Page doc={pageDoc(doc, i)} width={Math.min(340, typeof window !== 'undefined' ? window.innerWidth - 64 : 340)} />
            <figcaption className="mt-2 text-center text-xs font-semibold text-white/80">{i + 1} · {doc.pages?.[i]?.name || 'Card'}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export default function CardGallery({ initialEvent = 'wedding' }) {
  const [mounted, setMounted] = useState(false);
  const [group, setGroup] = useState('All');
  const [q, setQ] = useState('');
  const [evKey, setEvKey] = useState(CARD_EVENTS.some((e) => e.key === initialEvent) ? initialEvent : 'wedding');
  const [lang, setLang] = useState('hi');
  const [pages, setPages] = useState(0); // 0 = what this function usually has
  const [limit, setLimit] = useState(STEP);
  const [preview, setPreview] = useState(null);
  useEffect(() => setMounted(true), []);
  useEffect(() => setLimit(STEP), [evKey, lang, pages, q]);

  const events = CARD_EVENTS.filter((e) => (group === 'All' || e.group === group));
  const ev = CARD_EVENTS.find((e) => e.key === evKey) || CARD_EVENTS[0];
  const n = pages || ev.pages;
  const themes = CARD_THEMES.filter((t) => !q || `${t.name} ${t.layout}`.toLowerCase().includes(q.toLowerCase()));
  const format = getFormat(CARD_FORMAT);
  const docs = useMemo(
    () => (mounted ? themes.slice(0, limit).map((t) => ({ t, slug: cardSlug(ev.key, t.key, lang, n), doc: buildCard({ event: ev, theme: t, lang, pages: n }) })) : []),
    [mounted, ev, lang, n, limit, q], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const href = (slug) => `/posters/new?template=${slug}&format=${format.key}`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-line bg-white p-0.5" role="radiogroup" aria-label="Language">
          {[['hi', 'हिंदी'], ['en', 'English']].map(([k, l]) => (
            <button key={k} role="radio" aria-checked={lang === k} onClick={() => setLang(k)} className={`rounded-md px-3 py-1 text-sm font-semibold ${lang === k ? 'bg-ink text-white' : 'text-mute hover:text-ink'}`}>{l}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-mute">
          Pages
          <div className="flex rounded-lg border border-line bg-white p-0.5" role="radiogroup" aria-label="Number of pages">
            {[0, ...CARD_PAGE_OPTIONS].map((p) => (
              <button key={p} role="radio" aria-checked={pages === p} onClick={() => setPages(p)} className={`rounded-md px-3 py-1 text-sm font-semibold ${pages === p ? 'bg-ink text-white' : 'text-mute hover:text-ink'}`}>
                {p === 0 ? `Usual (${ev.pages})` : p === 1 ? 'Single' : p === 2 ? 'Double' : 'Triple'}
              </button>
            ))}
          </div>
        </div>
        <div className="relative w-full sm:ml-auto sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input className="input pl-9" placeholder="Style: royal, floral, palace…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search card styles" />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Function groups">
        {['All', ...CARD_EVENT_GROUPS].map((g) => (
          <button key={g} role="tab" aria-selected={group === g} onClick={() => setGroup(g)} className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${group === g ? 'border-ink bg-ink text-white' : 'border-line bg-white text-mute hover:text-ink'}`}>{g}</button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5 rounded-xl border border-line bg-white p-3">
        {events.map((e) => (
          <button key={e.key} onClick={() => setEvKey(e.key)} className={`rounded-lg border px-2.5 py-1 text-sm ${evKey === e.key ? 'border-signal bg-signal-soft font-semibold text-ink' : 'border-transparent text-mute hover:border-line hover:text-ink'}`}>
            <span className="mr-1">{e.emoji}</span>{lang === 'hi' ? e.hiName : e.name}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-2xl font-extrabold">{ev.emoji} {lang === 'hi' ? ev.hiName : ev.name}</h3>
        <p className="text-sm text-mute">{themes.length} designs in {lang === 'hi' ? 'Hindi' : 'English'} · {n === 1 ? 'single page' : `${n} pages`} · {format.name} · every word, photo and colour can be changed</p>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-9 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {docs.map(({ t, slug, doc }) => (
          <div key={slug} className="group">
            <NextLink href={href(slug)} className="block transition group-hover:-translate-y-0.5 group-hover:drop-shadow-xl" aria-label={`Edit ${t.name}`}>
              <CardThumb doc={doc} width={190} />
            </NextLink>
            <div className="mt-2 flex items-start justify-between gap-2">
              <p className="text-sm font-semibold">{t.name}</p>
              <button onClick={() => setPreview({ doc, slug })} className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold text-signal hover:bg-signal-soft"><Eye size={13} /> All pages</button>
            </div>
          </div>
        ))}
        {!mounted && Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-80 animate-pulse rounded-xl bg-line/60" />)}
        {mounted && !themes.length && <p className="col-span-full text-sm text-mute">No style matches “{q}”.</p>}
      </div>
      {mounted && limit < themes.length && (
        <div className="mt-8 text-center">
          <button onClick={() => setLimit(limit + STEP)} className="btn-light px-6">Show more designs ({themes.length - limit} more)</button>
        </div>
      )}
      {preview && <Preview doc={preview.doc} href={href(preview.slug)} onClose={() => setPreview(null)} />}
    </div>
  );
}
