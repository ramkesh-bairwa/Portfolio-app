'use client';
// Tools tab: every advanced tool as a card in the sidebar; a card opens its tool right here
import { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, Brush, Spline, CheckCheck, Copy, Crop, Download, Expand, Focus, Grid3x3, Group, Hand, History, Keyboard, Languages, LayoutGrid,
  Link2, Loader2, Maximize2, Paintbrush, Palette, PenLine, Pipette, Printer, QrCode, Receipt, Replace, Rows3, Shuffle, Smartphone,
  Sparkles, Stamp, Sun, Trash2, Type, Upload, Wand2, X,
} from 'lucide-react';
import { eid, imageEl, textEl } from '@/lib/poster/design';
import { designColors, swapColor } from '@/lib/poster/colors';
import { ColorInput, Toggle, rememberUploads, uploadFiles } from '../builder/fields';
import { FontPicker } from '../builder/FontPicker';
import { fitFontSize, textHeight } from './measure';
import { removeBackground } from './removeBg';
import { ElementBody } from './Stage';
import { CURVE_PRESETS, presetCurve } from '@/lib/poster/curve';
import {
  AiTranslate, AiWriter, AutoEnhance, BackgroundGenerator, BulkCreate, DesignChecker, DrawTool, MagicResize, PaletteFromPhoto, PriceList,
  SmartArrange, TextEffects, Watermark,
} from './AdvancedTools';

export { designColors } from '@/lib/poster/colors';

const Note = ({ children }) => <p className="text-xs text-mute">{children}</p>;
const NeedSel = ({ what }) => <p className="rounded-lg bg-paper p-3 text-xs text-mute">Select {what} on the page first, then use this tool.</p>;

const COLLAGES = [
  ['2 side by side', [[0, 0, 0.5, 1], [0.5, 0, 0.5, 1]]],
  ['2 stacked', [[0, 0, 1, 0.5], [0, 0.5, 1, 0.5]]],
  ['3 · big left', [[0, 0, 0.6, 1], [0.6, 0, 0.4, 0.5], [0.6, 0.5, 0.4, 0.5]]],
  ['3 · big top', [[0, 0, 1, 0.6], [0, 0.6, 0.5, 0.4], [0.5, 0.6, 0.5, 0.4]]],
  ['3 in a row', [[0, 0, 1 / 3, 1], [1 / 3, 0, 1 / 3, 1], [2 / 3, 0, 1 / 3, 1]]],
  ['4 grid', [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]]],
  ['4 · big top', [[0, 0, 1, 0.6], [0, 0.6, 1 / 3, 0.4], [1 / 3, 0.6, 1 / 3, 0.4], [2 / 3, 0.6, 1 / 3, 0.4]]],
  ['6 grid', [0, 1, 2].flatMap((c) => [0, 1].map((r) => [c / 3, r / 2, 1 / 3, 1 / 2]))],
];

// Every tool shown in the sidebar: key, name, icon, group, one-line description
export const TOOLS = [
  ['copyphoto', 'Copy from photo', Sparkles, 'AI tools', 'Turn any poster photo into an editable design'],
  ['writer', 'AI writer', PenLine, 'AI tools', 'Slogans, wishes, captions in Hindi or English'],
  ['translate', 'AI translate', Languages, 'AI tools', 'Hindi ⇄ English for all text'],
  ['removebg', 'Remove background', Wand2, 'AI tools', 'Cut people out of photos'],
  ['curve', 'Curve designer', Spline, 'Create', 'Your own curves, bands and swooshes, with layers and shadows'],
  ['magicresize', 'Magic resize', Expand, 'Create', 'One design → many sizes at once'],
  ['bulk', 'Bulk create', Rows3, 'Create', 'One poster per name from a list'],
  ['qr', 'QR code', QrCode, 'Create', 'UPI, WhatsApp, link, phone'],
  ['collage', 'Photo collage', LayoutGrid, 'Create', 'Grids of photo frames'],
  ['pricelist', 'Price list / menu', Receipt, 'Create', 'Items and prices, neatly lined up'],
  ['draw', 'Freehand draw', Brush, 'Create', 'Pen, marker, highlighter'],
  ['watermark', 'Watermark', Stamp, 'Create', 'Repeat your name or logo'],
  ['bggen', 'Background generator', Shuffle, 'Create', 'Shuffle colours and patterns'],
  ['effects', 'Text effects', Type, 'Edit', 'Neon, 3D, outline, retro, glitch'],
  ['fittext', 'Auto-fit text', Maximize2, 'Edit', 'Text fits its box, or box fits text'],
  ['find', 'Find & replace', Replace, 'Edit', 'Change a word everywhere'],
  ['recolor', 'Replace colour', Palette, 'Edit', 'Swap one colour everywhere'],
  ['copystyle', 'Copy / paste style', Paintbrush, 'Edit', 'Copy the look of one item to others'],
  ['eyedropper', 'Eyedropper', Pipette, 'Edit', 'Pick a colour from the screen'],
  ['group', 'Group / ungroup', Group, 'Edit', 'Move several items together'],
  ['arrange', 'Smart arrange', CheckCheck, 'Layout', 'Row, column or grid with equal gaps'],
  ['match', 'Match size', Copy, 'Layout', 'Same width or height'],
  ['ratio', 'Lock aspect ratio', Link2, 'Layout', 'Resize without stretching'],
  ['grid', 'Grid, rulers & snap', Grid3x3, 'Layout', 'Line things up precisely'],
  ['zoomsel', 'Zoom to selection', Focus, 'Layout', 'Jump to what is selected'],
  ['hand', 'Hand tool', Hand, 'Layout', 'Drag to move around the page'],
  ['enhance', 'Auto-enhance photo', Sun, 'Photo', 'Fix dark or dull photos'],
  ['tint', 'Tint & fade', Crop, 'Photo', 'Colour overlay, fade into colour'],
  ['palette', 'Palette from photo', Palette, 'Brand & colour', 'Take colours from any image'],
  ['brand', 'Brand kit', Stamp, 'Brand & colour', 'Logo, colours, fonts'],
  ['checker', 'Design checker', CheckCheck, 'Export & share', 'Find and fix problems'],
  ['mockup', 'Mockup preview', Smartphone, 'Export & share', 'WhatsApp, Instagram, print'],
  ['printpdf', 'Print-ready PDF', Printer, 'Export & share', 'Bleed and crop marks'],
  ['versions', 'Version history', History, 'Export & share', 'Save and restore versions'],
  ['shortcuts', 'Keyboard shortcuts', Keyboard, 'Export & share', 'All the shortcuts'],
];
const GROUPS = ['AI tools', 'Create', 'Edit', 'Layout', 'Photo', 'Brand & colour', 'Export & share'];
// Cards that act straight away instead of opening a panel
const DIRECT = { mockup: 'openMockup', shortcuts: 'openShortcuts', copyphoto: 'openCopyPhoto', zoomsel: 'zoomToSelection' };

export default function ToolsPanel({ api }) {
  const [active, setActive] = useState(null);
  const [q, setQ] = useState('');
  const tool = TOOLS.find((t) => t[0] === active);

  if (!tool) {
    const list = TOOLS.filter((t) => !q || `${t[1]} ${t[4]} ${t[3]}`.toLowerCase().includes(q.toLowerCase()));
    return (
      <div className="p-3">
        <p className="mb-2 px-1 text-sm font-bold">{TOOLS.length} advanced tools</p>
        <input className="input mb-3 py-1.5 text-sm" placeholder="Search tools" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search tools" />
        {GROUPS.map((g) => {
          const items = list.filter((t) => t[3] === g);
          if (!items.length) return null;
          return (
            <div key={g} className="mb-4">
              <h3 className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-mute">{g}</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {items.map(([key, name, Icon, , desc]) => (
                  <button key={key} type="button" data-tool={key} onClick={() => (DIRECT[key] ? api[DIRECT[key]]() : setActive(key))} title={desc} className={`flex flex-col items-start gap-1 rounded-lg border bg-white p-2 text-left hover:border-signal hover:bg-signal-soft ${g === 'AI tools' ? 'border-signal/30' : 'border-line'}`}>
                    <Icon size={18} className={g === 'AI tools' ? 'text-signal' : 'text-ink'} />
                    <span className="text-xs font-semibold leading-tight">{name}</span>
                    <span className="line-clamp-2 text-[10px] leading-tight text-mute">{desc}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {!list.length && <p className="px-1 text-sm text-mute">No tool matches “{q}”.</p>}
      </div>
    );
  }

  const [, name, Icon, , desc] = tool;
  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-line bg-paper px-3 py-2">
        <button type="button" onClick={() => setActive(null)} className="flex items-center gap-1 text-xs font-semibold text-signal"><ArrowLeft size={13} /> All tools</button>
        <h3 className="mt-1 flex items-center gap-2 text-sm font-bold"><Icon size={16} className="text-signal" /> {name}</h3>
        <p className="text-[11px] text-mute">{desc}</p>
      </div>
      <div className="space-y-2.5 p-4">
        <ToolBody tool={active} api={api} />
      </div>
    </div>
  );
}

function ToolBody({ tool, api }) {
  const { doc, add, setDoc, view, setView, brand, setBrand, versions } = api;
  const sel = api.selEls;
  const one = sel.length === 1 ? sel[0] : null;
  switch (tool) {
    case 'writer': return <AiWriter api={api} />;
    case 'translate': return <AiTranslate api={api} />;
    case 'removebg': return <RemoveBgTool api={api} />;
    case 'curve': return <CurveDesigner api={api} />;
    case 'magicresize': return <MagicResize api={api} />;
    case 'bulk': return <BulkCreate api={api} />;
    case 'qr': return <QrTool doc={doc} add={add} />;
    case 'collage': return <CollageTool doc={doc} add={add} />;
    case 'pricelist': return <PriceList api={api} />;
    case 'draw': return <DrawTool api={api} />;
    case 'watermark': return <Watermark api={api} />;
    case 'bggen': return <BackgroundGenerator api={api} />;
    case 'effects': return <TextEffects api={api} />;
    case 'fittext': {
      const t = one?.type === 'text' ? one : null;
      if (!t) return <NeedSel what="a text" />;
      return (
        <>
          <button type="button" className="btn-primary w-full py-1.5 text-sm" onClick={() => api.update(t.id, { size: fitFontSize(t) })}>Make text fill its box</button>
          <button type="button" className="btn-light w-full py-1.5 text-sm" onClick={() => api.update(t.id, { h: Math.ceil(textHeight(t)) + 2 })}>Make box fit the text</button>
          <Note>Current size {t.size}px. Resize the box first, then “Make text fill its box” for the biggest text that fits.</Note>
        </>
      );
    }
    case 'find': return <FindReplace doc={doc} setDoc={setDoc} />;
    case 'recolor': return <Recolor doc={doc} setDoc={setDoc} />;
    case 'copystyle':
      return (
        <>
          <button type="button" disabled={!one} className="btn-primary w-full py-1.5 text-sm" onClick={() => api.act('copyStyle')}>Copy style of selected</button>
          <button type="button" disabled={!sel.length} className="btn-light w-full py-1.5 text-sm" onClick={() => api.act('pasteStyle')}>Paste style on selected ({sel.length})</button>
          <Note>Shortcut: Ctrl/⌘ + Alt + C to copy, Ctrl/⌘ + Alt + V to paste. Copies font, colours, outline, shadow, effects and filters.</Note>
        </>
      );
    case 'eyedropper': return <EyedropperTool api={api} />;
    case 'group':
      return (
        <>
          <button type="button" disabled={sel.length < 2} className="btn-primary w-full py-1.5 text-sm" onClick={() => api.act('group')}><Group size={15} /> Group selected ({sel.length})</button>
          <button type="button" disabled={!sel.some((e) => e.groupId)} className="btn-light w-full py-1.5 text-sm" onClick={() => api.act('ungroup')}>Ungroup</button>
          <Note>Shift-click several items (or drag a box around them) and group them. Clicking any member then selects the whole group. Ctrl/⌘ + G / Ctrl/⌘ + Shift + G.</Note>
        </>
      );
    case 'arrange': return <SmartArrange api={api} />;
    case 'match':
      if (sel.length < 2) return <NeedSel what="two or more items" />;
      return (
        <>
          <Note>Everything gets the size of the first item you selected.</Note>
          <div className="grid grid-cols-3 gap-1">{[['w', 'Width'], ['h', 'Height'], ['both', 'Both']].map(([k, l]) => <button key={k} type="button" className="btn-light py-1.5 text-xs" onClick={() => api.act('match', k)}>{l}</button>)}</div>
        </>
      );
    case 'ratio':
      if (!one) return <NeedSel what="an item" />;
      return (
        <>
          <Toggle label="Keep proportions when resizing" checked={!!one.keepRatio} onChange={(v) => api.update(one.id, { keepRatio: v })} />
          <Note>When on, every handle (and the width/height boxes) resizes without stretching. You can also hold Shift on a corner.</Note>
        </>
      );
    case 'grid':
      return (
        <>
          <Toggle label="Show rulers" checked={view.rulers} onChange={(v) => setView((o) => ({ ...o, rulers: v }))} />
          <Toggle label="Show grid" checked={view.grid} onChange={(v) => setView((o) => ({ ...o, grid: v }))} />
          <label className="block text-xs">Grid size: {view.gridSize}px <input type="range" min={10} max={200} step={5} value={view.gridSize} onChange={(e) => setView((o) => ({ ...o, gridSize: Number(e.target.value) }))} className="w-full accent-[#2F5BFF]" /></label>
          <Toggle label="Snap to grid" checked={view.snapGrid} onChange={(v) => setView((o) => ({ ...o, snapGrid: v }))} />
          <Toggle label="Snap to page & other items" checked={view.snapObjects} onChange={(v) => setView((o) => ({ ...o, snapObjects: v }))} />
          <Note>Hold Alt while dragging to move freely without snapping.</Note>
        </>
      );
    case 'hand':
      return (
        <>
          <Toggle label="Hand tool on (drag to move around)" checked={api.hand} onChange={api.setHand} />
          <Note>Or hold the Space bar and drag, or drag with the middle mouse button.</Note>
        </>
      );
    case 'enhance': return <AutoEnhance api={api} />;
    case 'tint': {
      const img = one?.type === 'image' && one.src ? one : null;
      if (!img) return <NeedSel what="a photo" />;
      return (
        <>
          {[['Warm saffron', { color: '#FF7A00', strength: 35, mode: 'color' }], ['Royal blue', { color: '#1E40AF', strength: 35, mode: 'color' }], ['Golden', { color: '#D4A017', strength: 40, mode: 'multiply' }], ['Rose', { color: '#E11D48', strength: 30, mode: 'color' }]].map(([l, t]) => (
            <button key={l} type="button" className="btn-light w-full py-1 text-xs" onClick={() => api.update(img.id, { tint: t })}>Tint: {l}</button>
          ))}
          {[['Fade to black at bottom', { color: '#000000', strength: 60, side: 'bottom' }], ['Fade to white at bottom', { color: '#FFFFFF', strength: 60, side: 'bottom' }]].map(([l, fd]) => (
            <button key={l} type="button" className="btn-light w-full py-1 text-xs" onClick={() => api.update(img.id, { fade: fd })}>{l}</button>
          ))}
          <button type="button" className="btn-ghost w-full py-1 text-xs" onClick={() => api.update(img.id, { tint: null, fade: null })}>Remove tint & fade</button>
          <Note>Fine-tune colours and strength in “Colour overlay & fade” on the right.</Note>
        </>
      );
    }
    case 'palette': return <PaletteFromPhoto api={api} />;
    case 'brand': return <BrandKit doc={doc} add={add} setDoc={setDoc} brand={brand} setBrand={setBrand} />;
    case 'checker': return <DesignChecker api={api} />;
    case 'printpdf':
      return (
        <>
          <button type="button" className="btn-primary w-full py-1.5 text-sm" onClick={() => api.openDownload({ type: 'pdf', bleed: true, ratio: 3 })}><Download size={15} /> Open print-ready PDF download</button>
          <Note>Adds 3 mm bleed around the design and crop marks for the printer, at the real paper size for print formats (A4, A3, A5, flex banner…).</Note>
        </>
      );
    case 'versions': return <Versions versions={versions} />;
    default: return null;
  }
}

export function CurveDesigner({ api }) {
  const { doc } = api;
  const ratio = doc.h / doc.w;
  return (
    <>
      <button type="button" onClick={api.startPen} className="btn-primary w-full py-2 text-sm"><Spline size={16} /> Draw my own curve</button>
      <Note>Click on the page to place points; the curve runs smoothly through them. Press Enter or double-click to finish. End on the first point for a closed shape.</Note>
      <p className="pt-1 text-[11px] font-bold uppercase text-mute">Or start from a preset</p>
      <div className="grid grid-cols-2 gap-1.5">
        {CURVE_PRESETS.map((p) => {
          const el = presetCurve(p, doc.w, doc.h);
          return (
            <button key={p.name} type="button" onClick={() => api.add(presetCurve(p, doc.w, doc.h))} className="overflow-hidden rounded-lg border border-line bg-white text-left hover:border-signal" title={p.name}>
              <div className="relative w-full overflow-hidden bg-[#F1F5F9]" style={{ paddingTop: `${Math.min(100, ratio * 100)}%` }}>
                <div className="absolute inset-0"><ElementBody el={{ ...el, id: `pv${p.name.replace(/\W/g, '')}` }} /></div>
              </div>
              <span className="block truncate px-2 py-1 text-[11px] font-semibold text-mute">{p.name}</span>
            </button>
          );
        })}
      </div>
      <Note>After adding, use the panel on the right: line or filled band, fill direction, smoothness, and layers with their own colours, gradients, offsets and shadows. “Edit points on the page” lets you reshape it.</Note>
    </>
  );
}

function RemoveBgTool({ api }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const img = api.selEls.find((e) => e.type === 'image' && e.src);
  if (!img) return <NeedSel what="a photo of a person" />;
  async function go() {
    setBusy(true); setErr('');
    try {
      const [u] = await uploadFiles([await removeBackground(img.src)]);
      rememberUploads([u]);
      api.update(img.id, { src: u, fit: 'contain', outline: img.outline?.width ? img.outline : { width: Math.max(4, Math.round(Math.min(img.w, img.h) * 0.012)), color: '#FFFFFF' } });
    } catch (e) { setErr(e.message || 'Could not remove the background.'); } finally { setBusy(false); }
  }
  return (
    <>
      <button type="button" onClick={go} disabled={busy} className="btn-primary w-full py-1.5 text-sm">{busy ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />} {busy ? 'Removing…' : 'Remove background'}</button>
      <Note>Works best on photos of people. Runs on your device; the first time takes a little longer.</Note>
      {err && <p className="text-xs text-red-700">{err}</p>}
    </>
  );
}

function EyedropperTool({ api }) {
  const can = typeof window !== 'undefined' && 'EyeDropper' in window;
  const [last, setLast] = useState('');
  const one = api.selEls.length === 1 ? api.selEls[0] : null;
  async function pick() {
    try {
      const { sRGBHex } = await new window.EyeDropper().open();
      const c = sRGBHex.toUpperCase();
      setLast(c);
      if (!one) api.setDoc({ ...api.doc, bg: { ...api.doc.bg, type: api.doc.bg?.type === 'image' ? 'image' : 'solid', color: c } });
      else if (one.type === 'text' || one.type === 'icon' || one.type === 'path') api.update(one.id, { color: c });
      else if (one.type === 'shape') api.update(one.id, { fill: c });
      else if (one.type === 'qr') api.update(one.id, { fg: c });
      else if (one.type === 'graphic') api.update(one.id, { colors: [c, ...(one.colors || []).slice(1)] });
    } catch { /* cancelled */ }
  }
  if (!can) return <Note>Your browser doesn’t support the eyedropper. Use Chrome or Edge on a computer.</Note>;
  return (
    <>
      <button type="button" onClick={pick} className="btn-primary w-full py-1.5 text-sm"><Pipette size={15} /> Pick a colour</button>
      <Note>{one ? 'The colour goes to the selected item.' : 'Nothing selected: the colour becomes the page background.'} You can pick from anywhere on the screen, even other windows.</Note>
      {last && <p className="flex items-center gap-2 text-xs"><span className="h-5 w-5 rounded border border-line" style={{ background: last }} /> {last}</p>}
    </>
  );
}

function QrTool({ doc, add }) {
  const D = Math.min(doc.w, doc.h);
  const addQr = (kind) => {
    const s = Math.round(D * 0.3);
    add({ id: eid(), type: 'qr', x: Math.round((doc.w - s) / 2), y: Math.round((doc.h - s) / 2), w: s, h: s, rot: 0, opacity: 1, qr: { kind, url: 'https://yourwebsite.com' }, fg: '#111111', bg: '#FFFFFF', margin: 2, dots: 'square', keepRatio: true, name: 'QR code' });
  };
  return (
    <>
      {[['upi', 'UPI payment'], ['whatsapp', 'WhatsApp chat'], ['link', 'Website / link'], ['phone', 'Phone call']].map(([k, l]) => (
        <button key={k} type="button" onClick={() => addQr(k)} className="btn-light w-full py-1.5 text-sm"><QrCode size={15} /> Add {l} QR</button>
      ))}
      <Note>Fill in the UPI ID, number or link on the right after adding. Test it with your phone camera before printing.</Note>
    </>
  );
}

function CollageTool({ doc, add }) {
  const [gap, setGap] = useState(12);
  const [round, setRound] = useState(12);
  const addCollage = (cells) => {
    const box = { x: doc.w * 0.08, y: doc.h * 0.12, w: doc.w * 0.84, h: doc.h * 0.6 };
    const g = gap / 2;
    const gid = eid();
    add(cells.map(([cx, cy, cw, ch], i) => imageEl('', Math.round(box.x + cx * box.w + g), Math.round(box.y + cy * box.h + g), Math.round(cw * box.w - gap), Math.round(ch * box.h - gap), { placeholder: 'photo', slot: `Photo ${i + 1}`, radius: round, phBg: '#E2E8F0', phBg2: '#CBD5E1', groupId: gid })));
  };
  return (
    <>
      <div className="grid grid-cols-4 gap-1.5">
        {COLLAGES.map(([name, cells]) => (
          <button key={name} type="button" title={name} aria-label={name} onClick={() => addCollage(cells)} className="relative aspect-[4/3] rounded-md border border-line bg-white p-1 hover:border-signal">
            {cells.map(([x, y, w, h], i) => <span key={i} className="absolute rounded-[2px] bg-signal/30" style={{ left: `calc(${x * 100}% + 3px)`, top: `calc(${y * 100}% + 3px)`, width: `calc(${w * 100}% - 4px)`, height: `calc(${h * 100}% - 4px)` }} />)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <label>Gap <input type="range" min={0} max={40} value={gap} onChange={(e) => setGap(Number(e.target.value))} className="w-full accent-[#2F5BFF]" /></label>
        <label>Corners <input type="range" min={0} max={60} value={round} onChange={(e) => setRound(Number(e.target.value))} className="w-full accent-[#2F5BFF]" /></label>
      </div>
      <Note>The frames come grouped. Double-click a frame to add a photo.</Note>
    </>
  );
}

function FindReplace({ doc, setDoc }) {
  const [find, setFind] = useState('');
  const [repl, setRepl] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const re = find ? new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), matchCase ? 'g' : 'gi') : null;
  const hits = re ? doc.elements.filter((e) => e.type === 'text').reduce((n, e) => n + ((e.text || '').match(re) || []).length, 0) : 0;
  return (
    <>
      <input className="input py-1.5 text-sm" placeholder="Find" value={find} onChange={(e) => setFind(e.target.value)} aria-label="Find" />
      <input className="input py-1.5 text-sm" placeholder="Replace with" value={repl} onChange={(e) => setRepl(e.target.value)} aria-label="Replace with" />
      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-1.5"><input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} /> Match case</label>
        <span className="text-mute">{find ? `${hits} found` : ''}</span>
      </div>
      <button type="button" disabled={!hits} onClick={() => setDoc({ ...doc, elements: doc.elements.map((e) => (e.type === 'text' ? { ...e, text: (e.text || '').replace(re, repl) } : e)) })} className="btn-primary w-full py-1.5 text-sm">Replace all</button>
    </>
  );
}

function Recolor({ doc, setDoc }) {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState('#FF7A00');
  const colors = useMemo(() => designColors(doc), [doc]);
  return (
    <>
      <Note>Pick a colour used in your design, then choose what it should become.</Note>
      <div className="flex flex-wrap gap-1">
        {colors.slice(0, 30).map((c) => <button key={c} type="button" onClick={() => setFrom(c)} title={c} aria-label={`Pick ${c}`} className={`h-7 w-7 rounded-md border-2 ${from === c ? 'border-signal' : 'border-line'}`} style={{ background: c }} />)}
      </div>
      {from && (
        <>
          <p className="text-xs text-mute">Change <b style={{ color: from }}>{from}</b> to:</p>
          <ColorInput value={to} onChange={setTo} allowClear={false} />
          <button type="button" onClick={() => { setDoc(swapColor(doc, from, to)); setFrom(null); }} className="btn-primary w-full py-1.5 text-sm">Replace colour</button>
        </>
      )}
    </>
  );
}

function BrandKit({ doc, add, setDoc, brand, setBrand }) {
  const [busy, setBusy] = useState(false);
  const logoRef = useRef(null);
  const D = Math.min(doc.w, doc.h);
  async function uploadLogo(files) {
    const f = Array.from(files || []).find((x) => x.type.startsWith('image/'));
    if (!f) return;
    setBusy(true);
    try { const [u] = await uploadFiles([f]); rememberUploads([u]); setBrand({ ...brand, logo: u }); } catch (e) { alert(e.message); } finally { setBusy(false); }
  }
  const addLogo = () => { const s = Math.round(D * 0.18); add(imageEl(brand.logo, Math.round(doc.w - s - D * 0.05), Math.round(D * 0.05), s, s, { fit: 'contain', name: 'Brand logo', keepRatio: true })); };
  const applyFonts = () => {
    const texts = doc.elements.filter((e) => e.type === 'text' && !/^\p{Extended_Pictographic}/u.test(e.text || ''));
    if (!texts.length) return;
    const big = Math.max(...texts.map((e) => e.size));
    setDoc({ ...doc, elements: doc.elements.map((e) => (texts.includes(e) ? { ...e, font: e.size >= big * 0.6 ? brand.heading || e.font : brand.body || e.font } : e)) });
  };
  const addBrandName = () => { const w = Math.round(doc.w * 0.6); add(textEl(brand.name || 'Your Brand', Math.round((doc.w - w) / 2), Math.round(doc.h * 0.85), w, Math.round(D * 0.08), { font: brand.heading || 'Poppins', weight: '800', size: Math.round(D * 0.055), color: brand.colors?.[0] || '#111111' })); };
  return (
    <>
      <input ref={logoRef} type="file" accept="image/*" hidden onChange={(e) => { uploadLogo(e.target.files); e.target.value = ''; }} />
      <div className="flex items-center gap-2">
        <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {brand.logo ? <img src={brand.logo} alt="Brand logo" className="max-h-full max-w-full object-contain" /> : <span className="text-[10px] text-mute">Logo</span>}
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <button type="button" onClick={() => logoRef.current?.click()} className="btn-light py-1 text-xs">{busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} {brand.logo ? 'Change logo' : 'Upload logo'}</button>
          {brand.logo && <button type="button" onClick={addLogo} className="btn-primary py-1 text-xs">Add logo to page</button>}
        </div>
      </div>
      <label className="block">
        <span className="mb-0.5 block text-[11px] font-semibold text-mute">Brand / business name</span>
        <input className="input py-1.5 text-sm" value={brand.name || ''} onChange={(e) => setBrand({ ...brand, name: e.target.value })} placeholder="Your Brand" />
      </label>
      <div>
        <span className="mb-1 block text-[11px] font-semibold text-mute">Brand colours (show up in every colour picker)</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {(brand.colors || []).map((c, i) => (
            <span key={c + i} className="group relative">
              <span className="block h-7 w-7 rounded-md border border-line" style={{ background: c }} title={c} />
              <button type="button" onClick={() => setBrand({ ...brand, colors: brand.colors.filter((_, k) => k !== i) })} className="absolute -right-1.5 -top-1.5 hidden h-4 w-4 place-items-center rounded-full bg-ink text-white group-hover:grid" aria-label={`Remove ${c}`}><X size={10} /></button>
            </span>
          ))}
          <label className="relative h-7 w-7 cursor-pointer rounded-md border border-dashed border-mute text-center text-sm leading-7 text-mute" title="Add a brand colour">+
            <input type="color" className="absolute inset-0 cursor-pointer opacity-0" onChange={(e) => setBrand({ ...brand, colors: [...(brand.colors || []), e.target.value.toUpperCase()].slice(0, 12) })} aria-label="Add brand colour" />
          </label>
        </div>
      </div>
      <FontPicker label="Heading font" value={brand.heading || ''} onChange={(v) => setBrand({ ...brand, heading: v })} />
      <FontPicker label="Body font" value={brand.body || ''} onChange={(v) => setBrand({ ...brand, body: v })} />
      <div className="grid grid-cols-2 gap-1">
        <button type="button" onClick={applyFonts} disabled={!brand.heading && !brand.body} className="btn-light py-1 text-xs">Apply brand fonts</button>
        <button type="button" onClick={addBrandName} className="btn-light py-1 text-xs">Add brand name</button>
      </div>
      <Note>Saved on this device for all your designs.</Note>
    </>
  );
}

function Versions({ versions }) {
  const [vName, setVName] = useState('');
  return (
    <>
      <div className="flex gap-1">
        <input className="input py-1.5 text-sm" placeholder="Version name (optional)" value={vName} onChange={(e) => setVName(e.target.value)} aria-label="Version name" />
        <button type="button" onClick={() => { versions.save(vName); setVName(''); }} className="btn-primary shrink-0 px-3 py-1 text-xs">Save</button>
      </div>
      {versions.list.length ? (
        <ol className="space-y-1">
          {versions.list.map((v) => (
            <li key={v.id} className="flex items-center gap-2 rounded-md border border-line bg-white px-2 py-1.5 text-xs">
              <span className="min-w-0 flex-1"><b className="block truncate">{v.name}</b><span className="text-mute">{new Date(v.at).toLocaleString()}</span></span>
              <button type="button" onClick={() => versions.restore(v.id)} className="btn-light px-2 py-0.5 text-xs">Restore</button>
              <button type="button" onClick={() => versions.remove(v.id)} className="btn-ghost px-1 text-mute hover:text-red-600" aria-label="Delete version"><Trash2 size={13} /></button>
            </li>
          ))}
        </ol>
      ) : <Note>No saved versions yet. Restoring a version also saves your current design as a version first.</Note>}
    </>
  );
}
