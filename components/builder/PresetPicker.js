'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, LayoutTemplate, Shuffle, X } from 'lucide-react';
import { BLOCKS } from '@/lib/blocks';
import { LOOK_FONTS, applyPreset, presetsFor } from '@/lib/presets';
import { fontHref } from '@/lib/fonts';
import { esc, renderBlock, rootClass, themeVars, varsToString } from '@/lib/render';

const WIDTH = 1100;
const ASPECT = { navbar: 1100 / 220, marquee: 1100 / 300, footer: 1100 / 380, social: 1100 / 300, links: 1100 / 520 };

// A live, scaled-down render of the block with this preset applied. Uses the canvas stylesheet already on the page.
function Preview({ block, preset, theme }) {
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
  const aspect = ASPECT[block.type] || 1100 / 720;
  const html = seen ? `<div class="${rootClass(theme)}" style="${esc(varsToString(themeVars(theme)))}">${renderBlock(applyPreset(block, preset), theme)}</div>` : '';
  return (
    <div ref={box} className="relative w-full shrink-0 overflow-hidden bg-white" style={scale ? { height: (scale * WIDTH) / aspect } : { aspectRatio: String(aspect) }} aria-hidden="true">
      {scale > 0 && html ? (
        <div className="pointer-events-none absolute left-0 top-0 origin-top-left" style={{ width: WIDTH, transform: `scale(${scale})` }} dangerouslySetInnerHTML={{ __html: html }} />
      ) : <div className="absolute inset-0 animate-pulse bg-paper" />}
    </div>
  );
}

function useLookFonts() {
  useEffect(() => {
    if (document.getElementById('folio-look-fonts')) return;
    const l = document.createElement('link');
    l.id = 'folio-look-fonts';
    l.rel = 'stylesheet';
    l.href = fontHref(LOOK_FONTS);
    document.head.appendChild(l);
  }, []);
}

function Card({ block, preset, theme, active, onPick }) {
  return (
    <button type="button" onClick={() => onPick(preset)} className={`group flex flex-col self-start overflow-hidden rounded-xl border text-left transition ${active ? 'border-signal ring-2 ring-signal' : 'border-line hover:border-ink/50'}`}>
      <Preview block={block} preset={preset} theme={theme} />
      <span className="flex items-center justify-between gap-2 border-t border-line bg-white px-2.5 py-2 text-xs font-semibold">
        <span className="truncate">{preset.label}</span>
        {active && <Check size={14} className="shrink-0 text-signal" />}
      </span>
    </button>
  );
}

const ASK_KEY = 'folio_ask_style';
export function askOnInsert() {
  try { return localStorage.getItem(ASK_KEY) !== '0'; } catch { return true; }
}

// Full-screen chooser with every design for a block, shown as live previews.
export function PresetModal({ block, theme, onApply, onClose, isNew = false }) {
  useLookFonts();
  const list = presetsFor(block.type);
  const pick = (p) => onApply(applyPreset(block, p));
  const shuffle = () => pick(list[Math.floor(Math.random() * list.length)]);
  const [ask, setAsk] = useState(askOnInsert);
  const label = BLOCKS[block.type]?.label;
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const toggleAsk = (v) => { setAsk(v); try { localStorage.setItem(ASK_KEY, v ? '1' : '0'); } catch { /* storage unavailable */ } };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/70 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={`${label} styles`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mx-auto flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-paper shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-5 py-3">
          <div>
            <h2 className="text-lg font-bold">{isNew ? `Choose a style for your ${label}` : `${label} styles`}</h2>
            <p className="text-xs text-mute">{list.length} styles, shown with your own content. Click one to apply it — you can still change everything afterwards.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="btn-light" onClick={shuffle}><Shuffle size={15} /> Surprise me</button>
            <button type="button" className="btn-primary" onClick={onClose}>{isNew ? 'Use this style' : 'Done'}</button>
            <button type="button" className="btn-ghost px-2" onClick={onClose} aria-label="Close"><X size={18} /></button>
          </div>
        </div>
        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {list.map((p) => <Card key={p.id} block={block} preset={p} theme={theme} active={p.id === block.preset} onPick={pick} />)}
          </div>
        </div>
        {isNew && (
          <label className="flex items-center gap-2 border-t border-line bg-white px-5 py-2.5 text-xs text-mute">
            <input type="checkbox" checked={ask} onChange={(e) => toggleAsk(e.target.checked)} className="accent-[#2F5BFF]" />
            Show this when I add a new block
          </label>
        )}
      </div>
    </div>
  );
}

export default function PresetPicker({ block, theme, onApply }) {
  const [open, setOpen] = useState(false);
  const list = presetsFor(block.type);
  const current = list.find((p) => p.id === block.preset);
  const pick = (p) => onApply(applyPreset(block, p));
  const shuffle = () => pick(list[Math.floor(Math.random() * list.length)]);

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="label mb-0">Style</span>
        <span className="text-xs text-mute">{current ? current.label : `${list.length} styles`}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {list.slice(0, 6).map((p) => <Card key={p.id} block={block} preset={p} theme={theme} active={p.id === block.preset} onPick={pick} />)}
      </div>
      <div className="mt-2 flex gap-2">
        <button type="button" className="btn-primary flex-1 py-2" onClick={() => setOpen(true)}><LayoutTemplate size={15} /> See all {list.length} styles</button>
        <button type="button" className="btn-light px-3" onClick={shuffle} title="Surprise me" aria-label="Random style"><Shuffle size={15} /></button>
      </div>
      {open && <PresetModal block={block} theme={theme} onApply={onApply} onClose={() => setOpen(false)} />}
    </div>
  );
}
