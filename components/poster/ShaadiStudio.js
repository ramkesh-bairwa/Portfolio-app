'use client';
// Wedding card studio: fill the couple's details once, every design shows them live; preview all pages, then edit.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import NextLink from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, Eye, FileText, Image as ImageIcon, Minus, PenLine, Plus, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { PAGE_LABELS, SAMPLE, SHAADI_DESIGNS, SHAADI_GROUPS, SHAADI_INKS, SHAADI_PAGES, buildShaadiCard, loadDetails, saveDetails, shaadiSlug } from '@/lib/poster/shaadi';
import { pageDoc } from '@/lib/poster/pages';
import HinglishTextarea from './HinglishTextarea';
import Stage from './Stage';

const STEP = 18;
const PATRIKAS = SHAADI_DESIGNS.filter((d) => d.kind === 'patrika').length;

function Page({ doc, i = 0, width }) {
  const scale = width / doc.w;
  return (
    <div className="overflow-hidden rounded-[3px] bg-white shadow-[0_8px_24px_-12px_rgba(60,20,10,0.45)]" style={{ width, height: doc.h * scale }}>
      <Stage doc={pageDoc(doc, i)} scale={scale} hideEmpty />
    </div>
  );
}

// Which page best shows a design in the grid: the open spread for patrikas, the front for photo cards
const heroPage = (d, n) => (d.kind === 'patrika' ? (n === 1 ? 0 : n === 4 ? 2 : 1) : 0);

function Tile({ d, details, lang, pages, onPreview, href }) {
  const [w, setW] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const doc = useMemo(() => buildShaadiCard(d, { lang, pages, details }), [d, lang, pages, details]);
  const portrait = d.kind === 'photo';
  const pw = portrait ? Math.min(w * 0.62, 260) : w - 28;
  return (
    <article className="group">
      <div ref={ref} className="relative grid place-items-center overflow-hidden rounded-2xl border border-[#EADFCF] bg-gradient-to-br from-[#FBF4E8] to-[#F3E6D3] px-3.5 py-5" style={{ minHeight: 230 }}>
        {w > 0 && <Page doc={doc} i={heroPage(d, pages)} width={pw} />}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-[#7A2E12] shadow-sm">{portrait ? 'फोटो कार्ड' : 'पत्रिका'}</span>
        {pages > 1 && <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#3B0A12] px-2 py-0.5 text-[10px] font-bold text-[#F7D9A0]"><BookOpen size={11} /> {pages} पेज</span>}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[#2A0A0E]/55 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button onClick={() => onPreview(d)} className="btn bg-white text-ink hover:bg-white/90"><Eye size={16} /> सभी पेज देखें</button>
          <NextLink href={href} className="btn bg-[#C2410C] text-white hover:bg-[#A8380A]"><PenLine size={16} /> एडिट करें</NextLink>
        </div>
      </div>
      <div className="mt-2.5 flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <h3 className="truncate font-bold text-[#2A0F0A]">कार्ड {d.kind === 'patrika' ? d.no : `F${d.no}`} <span className="font-normal text-mute">· {d.title}</span></h3>
          <p className="truncate text-xs text-mute">{d.colourName} · {d.tags}</p>
        </div>
        <span className="mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-white shadow" style={{ background: d.swatch }} aria-hidden="true" />
      </div>
    </article>
  );
}

function Preview({ d, details, lang, pages, setPages, onClose }) {
  const doc = useMemo(() => buildShaadiCard(d, { lang, pages, details }), [d, lang, pages, details]);
  const [at, setAt] = useState(0);
  const n = doc.pages.length;
  useEffect(() => setAt(0), [pages]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') setAt((a) => Math.min(n - 1, a + 1)); if (e.key === 'ArrowLeft') setAt((a) => Math.max(0, a - 1)); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [n, onClose]);
  const [vw, setVw] = useState(1000);
  const [vh, setVh] = useState(700);
  useEffect(() => { setVw(window.innerWidth); setVh(window.innerHeight); }, []);
  const maxW = Math.min(vw - 140, 980), maxH = vh - 290;
  const width = Math.max(220, Math.min(maxW, (maxH * doc.w) / doc.h));
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1A0608]/90 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Card preview">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white sm:px-6">
        <div className="min-w-0">
          <p className="truncate font-bold">कार्ड {d.kind === 'patrika' ? d.no : `F${d.no}`} · {d.title}</p>
          <p className="truncate text-xs text-white/60">{d.colourName} · {d.tags}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden rounded-lg bg-white/10 p-0.5 sm:flex" role="radiogroup" aria-label="Pages">
            {SHAADI_PAGES.map((p) => <button key={p} role="radio" aria-checked={pages === p} onClick={() => setPages(p)} className={`rounded-md px-2.5 py-1 text-xs font-semibold ${pages === p ? 'bg-white text-ink' : 'text-white/75 hover:text-white'}`}>{p} पेज</button>)}
          </div>
          <NextLink href={`/posters/new?template=${shaadiSlug(d.id, lang, pages)}`} className="btn bg-[#E8A33D] py-2 text-[#2A0F0A] hover:bg-[#F0B456]"><PenLine size={16} /> एडिट करें</NextLink>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 hover:bg-white/20" aria-label="Close"><X size={18} /></button>
        </div>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-14 py-5">
        <button onClick={() => setAt(Math.max(0, at - 1))} disabled={at === 0} className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-25" aria-label="Previous page"><ArrowLeft size={20} /></button>
        <figure className="text-center">
          <Page doc={doc} i={at} width={width} />
          <figcaption className="mt-3 text-sm font-semibold text-white/80">{at + 1} / {n} · {doc.pages[at]?.name}</figcaption>
        </figure>
        <button onClick={() => setAt(Math.min(n - 1, at + 1))} disabled={at === n - 1} className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-25" aria-label="Next page"><ArrowRight size={20} /></button>
      </div>
      <div className="flex justify-center gap-3 overflow-x-auto border-t border-white/10 px-4 py-3">
        {doc.pages.map((p, i) => (
          <button key={i} onClick={() => setAt(i)} className={`shrink-0 rounded-md p-1 ${at === i ? 'bg-[#E8A33D]' : 'bg-white/10 hover:bg-white/20'}`} aria-label={`Page ${i + 1}`}>
            <Page doc={doc} i={i} width={doc.w > doc.h ? 110 : 62} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- details form ----------
function Field({ label, value, onChange, hindi, rows = 1, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold text-[#7A5A44]">{label}</span>
      <HinglishTextarea value={value || ''} onChange={onChange} enabled={hindi} rows={rows} placeholder={placeholder} className="input resize-none py-1.5 text-sm leading-snug" />
    </label>
  );
}
function Section({ title, open, onToggle, children }) {
  return (
    <section className="border-b border-[#EADFCF] last:border-0">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between py-3 text-left text-sm font-bold text-[#2A0F0A]" aria-expanded={open}>
        {title}<ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="space-y-2.5 pb-4">{children}</div>}
    </section>
  );
}

function DetailsForm({ details, setDetails, lang, hindi, setHindi, onReset }) {
  const [open, setOpen] = useState('couple');
  const t = (k) => (k === open ? '' : k);
  const set = (k, v) => setDetails({ ...details, [k]: v });
  const setP = (who, k, v) => setDetails({ ...details, [who]: { ...details[who], [k]: v } });
  const setE = (i, k, v) => setDetails({ ...details, events: details.events.map((e, j) => (j === i ? { ...e, [k]: v } : e)) });
  const hi = lang === 'hi';
  return (
    <div>
      <div className="flex items-center justify-between gap-2 pb-2">
        <h2 className="text-lg font-extrabold text-[#2A0F0A]">{hi ? 'आपका विवरण' : 'Your details'}</h2>
        <button type="button" onClick={onReset} className="flex items-center gap-1 text-xs font-semibold text-mute hover:text-ink"><RotateCcw size={12} /> {hi ? 'सैंपल भरें' : 'Use sample'}</button>
      </div>
      {hi && (
        <label className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-[#FFF4E0] px-3 py-2 text-xs text-[#7A3E12]">
          <span><b>Hinglish → हिंदी</b> · “mohit” लिखें, “मोहित” बनेगा</span>
          <input type="checkbox" checked={hindi} onChange={(e) => setHindi(e.target.checked)} className="h-4 w-4 accent-[#C2410C]" aria-label="Hindi typing" />
        </label>
      )}
      <div className="mb-1 grid grid-cols-2 gap-1 rounded-lg bg-[#F3E6D3] p-1 text-xs font-semibold" role="radiogroup" aria-label="Whose family sends the card">
        {[['groom', hi ? 'वर पक्ष' : "Groom's side"], ['bride', hi ? 'वधू पक्ष' : "Bride's side"]].map(([k, l]) => (
          <button key={k} type="button" role="radio" aria-checked={details.side === k} onClick={() => set('side', k)} className={`rounded-md py-1.5 ${details.side === k ? 'bg-white text-[#2A0F0A] shadow-sm' : 'text-[#7A5A44]'}`}>{l}</button>
        ))}
      </div>
      <Section title={hi ? '💑 वर और वधू' : '💑 Bride & groom'} open={open === 'couple'} onToggle={() => setOpen(t('couple'))}>
        {[['groom', hi ? 'वर (दूल्हा)' : 'Groom'], ['bride', hi ? 'वधू (दुल्हन)' : 'Bride']].map(([who, label]) => (
          <div key={who} className="rounded-xl border border-[#EADFCF] bg-white/60 p-2.5">
            <p className="mb-1.5 text-xs font-bold text-[#C2410C]">{label}</p>
            <div className="grid grid-cols-[72px_1fr] gap-2">
              <Field label={hi ? 'उपाधि' : 'Title'} value={details[who].pre} onChange={(v) => setP(who, 'pre', v)} hindi={hindi} />
              <Field label={hi ? 'नाम' : 'Name'} value={details[who].name} onChange={(v) => setP(who, 'name', v)} hindi={hindi} />
            </div>
            <div className="mt-2 space-y-2">
              <Field label={hi ? 'माता-पिता' : 'Parents'} value={details[who].parents} onChange={(v) => setP(who, 'parents', v)} hindi={hindi} rows={2} />
              <Field label={hi ? 'गाँव / शहर' : 'Village / city'} value={details[who].place} onChange={(v) => setP(who, 'place', v)} hindi={hindi} />
            </div>
          </div>
        ))}
      </Section>
      <Section title={hi ? '📅 तिथि और स्थान' : '📅 Date & venue'} open={open === 'date'} onToggle={() => setOpen(t('date'))}>
        <Field label={hi ? 'शीर्षक' : 'Title'} value={details.title} onChange={(v) => set('title', v)} hindi={hindi} />
        <div className="grid grid-cols-2 gap-2">
          <Field label={hi ? 'विवाह तिथि' : 'Wedding date'} value={details.date} onChange={(v) => set('date', v)} hindi={hindi} />
          <Field label={hi ? 'छोटी तिथि (कवर)' : 'Short date (cover)'} value={details.shortDate} onChange={(v) => set('shortDate', v)} hindi={false} />
        </div>
        <Field label={hi ? 'विवाह स्थल' : 'Venue'} value={details.venue} onChange={(v) => set('venue', v)} hindi={hindi} rows={2} />
        <Field label={hi ? 'बारात / नोट' : 'Baraat / note'} value={details.baraat} onChange={(v) => set('baraat', v)} hindi={hindi} rows={2} />
      </Section>
      <Section title={hi ? `🪔 मांगलिक कार्यक्रम (${details.events.length})` : `🪔 Programme (${details.events.length})`} open={open === 'events'} onToggle={() => setOpen(t('events'))}>
        {details.events.map((e, i) => (
          <div key={i} className="rounded-xl border border-[#EADFCF] bg-white/60 p-2.5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-bold text-[#C2410C]">{i + 1}</span>
              <button type="button" onClick={() => setDetails({ ...details, events: details.events.filter((_, j) => j !== i) })} className="text-mute hover:text-red-600" aria-label="Remove"><Minus size={14} /></button>
            </div>
            <Field label={hi ? 'कार्यक्रम' : 'Function'} value={e.name} onChange={(v) => setE(i, 'name', v)} hindi={hindi} />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Field label={hi ? 'दिनांक' : 'Date'} value={e.date} onChange={(v) => setE(i, 'date', v)} hindi={hindi} />
              <Field label={hi ? 'समय' : 'Time'} value={e.time} onChange={(v) => setE(i, 'time', v)} hindi={hindi} />
            </div>
          </div>
        ))}
        {details.events.length < 6 && <button type="button" onClick={() => setDetails({ ...details, events: [...details.events, { name: '', date: '', time: '' }] })} className="btn-light w-full py-1.5"><Plus size={14} /> {hi ? 'कार्यक्रम जोड़ें' : 'Add function'}</button>}
      </Section>
      <Section title={hi ? '🙏 परिवार और निवेदक' : '🙏 Family & hosts'} open={open === 'family'} onToggle={() => setOpen(t('family'))}>
        <Field label={hi ? 'दर्शनाभिलाषी' : 'Eagerly awaiting'} value={details.darshan} onChange={(v) => set('darshan', v)} hindi={hindi} rows={3} />
        <Field label={hi ? 'स्वागतकर्ता' : 'Welcome by'} value={details.swagat} onChange={(v) => set('swagat', v)} hindi={hindi} rows={2} />
        <Field label={hi ? 'विनीत / प्रेषक' : 'Host / sender'} value={details.vineet} onChange={(v) => set('vineet', v)} hindi={hindi} />
        <Field label={hi ? 'पता' : 'Address'} value={details.vineetPlace} onChange={(v) => set('vineetPlace', v)} hindi={hindi} />
        <div className="grid grid-cols-2 gap-2">
          <Field label={hi ? 'मोबाइल' : 'Mobile'} value={details.phone} onChange={(v) => set('phone', v)} hindi={false} />
          <Field label={hi ? 'परिवार का नाम' : 'Family name'} value={details.family} onChange={(v) => set('family', v)} hindi={hindi} />
        </div>
      </Section>
      <Section title={hi ? '🧒 बाल मनुहार' : '🧒 Kids’ request'} open={open === 'kids'} onToggle={() => setOpen(t('kids'))}>
        <Field label={hi ? 'शीर्षक' : 'Heading'} value={details.kidsTitle} onChange={(v) => set('kidsTitle', v)} hindi={hindi} />
        <Field label={hi ? 'पंक्तियाँ' : 'Lines'} value={details.kids} onChange={(v) => set('kids', v)} hindi={hindi} rows={3} />
        <Field label={hi ? 'बच्चों के नाम' : 'Kids’ names'} value={details.kidsNames} onChange={(v) => set('kidsNames', v)} hindi={hindi} />
      </Section>
      <Section title={hi ? '🍽️ प्रीतिभोज और लोकेशन' : '🍽️ Reception & location'} open={open === 'rec'} onToggle={() => setOpen(t('rec'))}>
        <Field label={hi ? 'शीर्षक' : 'Title'} value={details.reception} onChange={(v) => set('reception', v)} hindi={hindi} />
        <Field label={hi ? 'कब' : 'When'} value={details.receptionWhen} onChange={(v) => set('receptionWhen', v)} hindi={hindi} />
        <Field label={hi ? 'कहाँ' : 'Where'} value={details.receptionWhere} onChange={(v) => set('receptionWhere', v)} hindi={hindi} />
        <Field label={hi ? 'Google Maps लिंक (QR के लिए)' : 'Google Maps link (for the QR)'} value={details.map} onChange={(v) => set('map', v)} hindi={false} />
      </Section>
    </div>
  );
}

// ---------- studio ----------
export default function ShaadiStudio() {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState('hi');
  const [details, setDetailsState] = useState(SAMPLE.hi);
  const [hindi, setHindi] = useState(true);
  const [pages, setPages] = useState(2);
  const [kind, setKind] = useState('all');
  const [struct, setStruct] = useState('');
  const [ink, setInk] = useState('');
  const [limit, setLimit] = useState(STEP);
  const [preview, setPreview] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  // what the grid renders: the details settle for a moment before every card rebuilds
  const [shown, setShown] = useState(SAMPLE.hi);

  useEffect(() => { setMounted(true); const d = loadDetails('hi'); setDetailsState(d); setShown(d); }, []);
  useEffect(() => {
    if (!mounted) return undefined;
    const id = setTimeout(() => { setShown(details); saveDetails(details); setSaved(true); }, 450);
    return () => clearTimeout(id);
  }, [details, mounted]);
  useEffect(() => { if (!saved) return undefined; const id = setTimeout(() => setSaved(false), 1500); return () => clearTimeout(id); }, [saved]);
  useEffect(() => setLimit(STEP), [kind, struct, ink, pages, lang]);

  const setDetails = useCallback((d) => setDetailsState(d), []);
  const switchLang = (l) => { setLang(l); const d = loadDetails(l); setDetailsState(d); setShown(d); };
  const reset = () => { setDetailsState(SAMPLE[lang]); };

  const group = SHAADI_GROUPS.find((g) => g.key === struct);
  const list = useMemo(() => SHAADI_DESIGNS.filter((d) => (kind === 'all' || d.kind === kind) && (!group || (group.kind === d.kind && group.test(d))) && (!ink || d.ink === ink)), [kind, group, ink]);
  const structs = SHAADI_GROUPS.filter((s) => kind === 'all' || s.kind === kind);
  const hi = lang === 'hi';

  return (
    <div className="lg:grid lg:grid-cols-[360px_1fr] lg:gap-8">
      {/* details panel */}
      <aside className={`${formOpen ? 'fixed inset-0 z-40 block overflow-y-auto bg-[#FBF4E8] p-5' : 'hidden'} lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:rounded-2xl lg:border lg:border-[#EADFCF] lg:bg-[#FFFBF4] lg:p-5 thin-scroll`}>
        <div className="mb-3 flex items-center justify-between lg:hidden">
          <span className="font-bold">{hi ? 'विवरण भरें' : 'Fill details'}</span>
          <button onClick={() => setFormOpen(false)} className="btn-dark py-1.5"><Check size={15} /> {hi ? 'हो गया' : 'Done'}</button>
        </div>
        <DetailsForm details={details} setDetails={setDetails} lang={lang} hindi={hindi && hi} setHindi={setHindi} onReset={reset} />
        <p className={`mt-3 text-center text-xs font-semibold text-emerald-700 transition-opacity ${saved ? 'opacity-100' : 'opacity-0'}`}><Check size={12} className="inline" /> {hi ? 'सेव हो गया · सभी कार्ड अपडेट' : 'Saved · every card updated'}</p>
      </aside>

      <div className="min-w-0">
        {/* toolbar */}
        <div className="sticky top-16 z-30 -mx-2 mb-5 space-y-3 rounded-2xl border border-[#EADFCF] bg-[#FFFBF4]/95 p-3 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setFormOpen(true)} className="btn bg-[#3B0A12] text-[#F7D9A0] lg:hidden"><SlidersHorizontal size={15} /> {hi ? 'विवरण भरें' : 'Your details'}</button>
            <div className="flex rounded-lg bg-[#F3E6D3] p-0.5" role="radiogroup" aria-label="Pages">
              {SHAADI_PAGES.map((p) => (
                <button key={p} role="radio" aria-checked={pages === p} onClick={() => setPages(p)} title={PAGE_LABELS[p].note} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold ${pages === p ? 'bg-[#3B0A12] text-[#F7D9A0] shadow' : 'text-[#7A5A44] hover:text-[#2A0F0A]'}`}>
                  <span className="flex gap-px" aria-hidden="true">{Array.from({ length: p }).map((_, i) => <span key={i} className={`h-3 w-2 rounded-[1px] ${pages === p ? 'bg-[#F7D9A0]' : 'bg-[#C9AE8F]'}`} />)}</span>
                  {p} {hi ? 'पेज' : p === 1 ? 'page' : 'pages'}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg bg-[#F3E6D3] p-0.5 text-sm font-semibold" role="radiogroup" aria-label="Language">
              {[['hi', 'हिंदी'], ['en', 'English']].map(([k, l]) => <button key={k} role="radio" aria-checked={lang === k} onClick={() => switchLang(k)} className={`rounded-md px-3 py-1.5 ${lang === k ? 'bg-white text-[#2A0F0A] shadow-sm' : 'text-[#7A5A44]'}`}>{l}</button>)}
            </div>
            <span className="ml-auto text-sm text-mute">{list.length} {hi ? 'डिज़ाइन' : 'designs'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[['all', hi ? 'सभी' : 'All', SHAADI_DESIGNS.length, null], ['patrika', hi ? 'प्रेस पत्रिका' : 'Press patrika', PATRIKAS, FileText], ['photo', hi ? 'फोटो कार्ड' : 'Photo cards', SHAADI_DESIGNS.length - PATRIKAS, ImageIcon]].map(([k, l, c, Icon]) => (
              <button key={k} onClick={() => { setKind(k); setStruct(''); setInk(''); }} className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${kind === k ? 'border-[#3B0A12] bg-[#3B0A12] text-white' : 'border-[#E2D3BE] bg-white text-[#5C4030] hover:border-[#3B0A12]/40'}`}>
                {Icon && <Icon size={13} />}{l} <span className="opacity-60">{c}</span>
              </button>
            ))}
            <span className="mx-1 h-5 w-px bg-[#E2D3BE]" aria-hidden="true" />
            {kind !== 'photo' && (
              <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Ink colour">
                {Object.entries(SHAADI_INKS).map(([k, v]) => (
                  <button key={k} role="radio" aria-checked={ink === k} title={v.label} onClick={() => setInk(ink === k ? '' : k)} className={`h-6 w-6 rounded-full border-2 transition ${ink === k ? 'scale-110 border-[#2A0F0A] ring-2 ring-[#E8A33D]' : 'border-white shadow'}`} style={{ background: `linear-gradient(135deg, ${v.ink} 55%, ${v.paper} 55%)` }} />
                ))}
              </div>
            )}
          </div>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            <button onClick={() => setStruct('')} className={`shrink-0 rounded-lg px-3 py-1 text-xs font-semibold ${!struct ? 'bg-[#E8A33D] text-[#2A0F0A]' : 'bg-white text-[#7A5A44] hover:text-[#2A0F0A]'}`}>{hi ? 'सभी डिज़ाइन' : 'All styles'}</button>
            {structs.map((s) => <button key={s.key} onClick={() => setStruct(struct === s.key ? '' : s.key)} className={`shrink-0 rounded-lg px-3 py-1 text-xs font-semibold ${struct === s.key ? 'bg-[#E8A33D] text-[#2A0F0A]' : 'bg-white text-[#7A5A44] hover:text-[#2A0F0A]'}`}>{s.hiName}</button>)}
          </div>
        </div>

        {/* grid */}
        <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 2xl:grid-cols-3">
          {mounted && list.slice(0, limit).map((d) => (
            <Tile key={d.id} d={d} details={shown} lang={lang} pages={pages} onPreview={setPreview} href={`/posters/new?template=${shaadiSlug(d.id, lang, pages)}`} />
          ))}
          {!mounted && Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-[#F3E6D3]" />)}
        </div>
        {mounted && limit < list.length && (
          <div className="mt-10 text-center">
            <button onClick={() => setLimit(limit + STEP)} className="btn bg-[#3B0A12] px-6 py-3 text-[#F7D9A0] hover:bg-[#2A0710]">{hi ? `और डिज़ाइन देखें (${list.length - limit})` : `Show more (${list.length - limit})`}</button>
          </div>
        )}
      </div>

      {preview && <Preview d={preview} details={shown} lang={lang} pages={pages} setPages={setPages} onClose={() => setPreview(null)} />}
    </div>
  );
}

// Three real cards fanned out for the page header
export function HeroCards() {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  const picks = useMemo(() => ['pk1', 'fc2', 'pk4'].map((id) => SHAADI_DESIGNS.find((d) => d.id === id)).filter(Boolean), []);
  if (!ok) return <div className="h-[340px]" />;
  const pose = [{ w: 300, r: -8, x: -150, y: 30, z: 1 }, { w: 190, r: 0, x: 0, y: 0, z: 3 }, { w: 300, r: 8, x: 150, y: 30, z: 2 }];
  return (
    <div className="relative mx-auto h-[340px] w-full max-w-[560px]" aria-hidden="true">
      {picks.map((d, i) => {
        const doc = buildShaadiCard(d, { lang: 'hi', pages: 2, details: SAMPLE.hi });
        const p = pose[i];
        return (
          <div key={d.id} className="absolute left-1/2 top-1/2 transition-transform duration-500 hover:-translate-y-2" style={{ zIndex: p.z, transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px)) rotate(${p.r}deg)` }}>
            <Page doc={doc} i={d.kind === 'patrika' ? 1 : 0} width={p.w} />
          </div>
        );
      })}
    </div>
  );
}
