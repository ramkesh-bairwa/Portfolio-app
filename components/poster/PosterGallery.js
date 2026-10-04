'use client';
import { useEffect, useMemo, useState } from 'react';
import NextLink from 'next/link';
import { Plus, Search, Sparkles } from 'lucide-react';
import { POSTER_CATEGORIES, POSTER_GROUPS } from '@/lib/poster/categories';
import { POSTER_LANGS, buildTemplate, templatesFor } from '@/lib/poster/templates';
import { FORMATS, getFormat } from '@/lib/poster/formats';
import Stage from './Stage';

const THUMB = 260;

export function PosterThumb({ doc, width = THUMB }) {
  const scale = Math.min(width / doc.w, (width * 1.45) / doc.h);
  return (
    <div className="grid place-items-center overflow-hidden rounded-xl border border-line bg-[#E7EBF2]" style={{ height: Math.min(width * 1.45, doc.h * scale) + 24 }}>
      <div className="overflow-hidden rounded-[3px] shadow-md">
        <Stage doc={doc} scale={scale} />
      </div>
    </div>
  );
}

export default function PosterGallery({ initialCategory = 'diwali' }) {
  const [mounted, setMounted] = useState(false);
  const [group, setGroup] = useState('All');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(initialCategory);
  const [size, setSize] = useState('');
  const [lang, setLang] = useState('en');
  const [limit, setLimit] = useState(15);
  useEffect(() => setLimit(15), [cat, lang, size]);
  useEffect(() => setMounted(true), []);

  const cats = POSTER_CATEGORIES.filter((c) => (group === 'All' || c.group === group) && (!q || `${c.name} ${c.group} ${c.title}`.toLowerCase().includes(q.toLowerCase())));
  const category = POSTER_CATEGORIES.find((c) => c.key === cat) || POSTER_CATEGORIES[0];
  const format = getFormat(size || category.format);
  const all = useMemo(() => templatesFor(category.key, lang), [category, lang]);
  const docs = useMemo(() => (mounted ? all.slice(0, limit).map((t) => ({ t, doc: buildTemplate(t, format) })) : []), [mounted, all, limit, format]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input className="input pl-9" placeholder="Search: election, birthday, sale, rent…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search poster categories" />
        </div>
        <div className="flex rounded-lg border border-line bg-white p-0.5" role="radiogroup" aria-label="Language">
          {POSTER_LANGS.map(([k, l]) => (
            <button key={k} role="radio" aria-checked={lang === k} onClick={() => setLang(k)} className={`rounded-md px-3 py-1 text-sm font-semibold ${lang === k ? 'bg-ink text-white' : 'text-mute hover:text-ink'}`}>{l}</button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-mute">
          Size
          <select className="input w-auto py-1.5" value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="">Best size for each category</option>
            {['Print', 'Social', 'Ads'].map((g) => (
              <optgroup key={g} label={g}>
                {FORMATS.filter((f) => f.group === g).map((f) => <option key={f.key} value={f.key}>{f.name}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Poster groups">
        {['All', ...POSTER_GROUPS].map((g) => (
          <button key={g} role="tab" aria-selected={group === g} onClick={() => setGroup(g)} className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${group === g ? 'border-ink bg-ink text-white' : 'border-line bg-white text-mute hover:text-ink'}`}>{g}</button>
        ))}
      </div>

      <div className="thin-scroll mt-4 flex max-h-48 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-line bg-white p-3">
        {cats.map((c) => (
          <button key={c.key} onClick={() => setCat(c.key)} className={`rounded-lg border px-2.5 py-1 text-sm ${cat === c.key ? 'border-signal bg-signal-soft font-semibold text-ink' : 'border-transparent text-mute hover:border-line hover:text-ink'}`}>
            <span className="mr-1">{c.emoji}</span>{c.name}
          </button>
        ))}
        {!cats.length && <p className="p-2 text-sm text-mute">No category matches “{q}”. Try another word, or start blank below.</p>}
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold">{category.emoji} {category.name}</h3>
          <p className="text-sm text-mute">{all.length} designs in {lang === 'hi' ? 'Hindi' : 'English'} · {format.name} ({format.w}×{format.h}) · photo frames marked “+ Add photo” are yours to fill</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-5">
        {docs.map(({ t, doc }) => (
          <NextLink key={t.slug} href={`/posters/new?template=${t.slug}&format=${format.key}`} className="group block">
            <div className="transition group-hover:-translate-y-0.5 group-hover:drop-shadow-xl"><PosterThumb doc={doc} width={230} /></div>
            <p className="mt-2 text-sm font-semibold">{t.name.split(' · ').slice(1).join(' · ')}{t.pro && <span className="ml-1.5 rounded bg-sun/30 px-1.5 py-0.5 text-[10px] font-bold">PHOTO</span>}</p>
            <p className="text-xs text-signal opacity-0 transition group-hover:opacity-100">Edit this design →</p>
          </NextLink>
        ))}
        {!mounted && Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-72 animate-pulse rounded-xl bg-line/60" />)}
      </div>

      {mounted && limit < all.length && (
        <div className="mt-8 text-center">
          <button onClick={() => setLimit(limit + 15)} className="btn-light px-6">Show more designs ({all.length - limit} more)</button>
        </div>
      )}

      <NextLink href="/posters/new?copy=1&format=insta-post" className="mt-12 flex items-center gap-4 rounded-2xl border border-signal/30 bg-signal-soft p-5 hover:border-signal">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-signal text-white"><Sparkles size={22} /></span>
        <span className="min-w-0 flex-1"><span className="block font-bold">Copy a design from a photo</span><span className="block text-sm text-mute">Have a poster or banner you like? Upload its photo and AI turns it into an editable template.</span></span>
        <span className="hidden font-semibold text-signal sm:inline">Try it →</span>
      </NextLink>

      <div className="mt-6 rounded-2xl border border-line bg-white p-5">
        <h3 className="font-bold">Start from a blank page</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {FORMATS.map((f) => (
            <NextLink key={f.key} href={`/posters/new?format=${f.key}`} className="btn-light py-1.5 text-sm"><Plus size={14} /> {f.name}</NextLink>
          ))}
        </div>
      </div>
    </div>
  );
}
