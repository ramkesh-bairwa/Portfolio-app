'use client';
// The advanced tools shown in the sidebar's Tools tab (each one is its own panel)
import { useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, Loader2, Shuffle, Sparkles, Wand2 } from 'lucide-react';
import { eid, graphicEl, shapeEl, textEl } from '@/lib/poster/design';
import { FORMATS } from '@/lib/poster/formats';
import { scaleDoc } from '@/lib/poster/scale';
import { contrast, designColors, luminance, swapColor } from '@/lib/poster/colors';
import { fileName } from './exporter';
import { textHeight } from './measure';

const clone = (x) => JSON.parse(JSON.stringify(x));
const Note = ({ children }) => <p className="text-xs text-mute">{children}</p>;
const Err = ({ children }) => (children ? <p className="rounded-md bg-red-50 p-2 text-xs text-red-700" role="alert">{children}</p> : null);
function saveBlob(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
async function aiCall(payload) {
  const r = await fetch('/api/posters/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'The AI tool failed. Please try again.');
  return j;
}

// ---------- Magic resize: one design, many sizes ----------
export function MagicResize({ api }) {
  const [picked, setPicked] = useState(['insta-post', 'story', 'fb-post', 'poster-a4']);
  const [busy, setBusy] = useState('');
  const [saved, setSaved] = useState([]);
  const [err, setErr] = useState('');
  const list = FORMATS.filter((f) => picked.includes(f.key));
  async function zipAll() {
    setErr('');
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      for (const [i, f] of list.entries()) {
        setBusy(`Making ${f.name} (${i + 1} of ${list.length})…`);
        const file = await api.renderPng(scaleDoc(api.doc, f.key, f.w, f.h), 1);
        zip.file(fileName(`${api.doc.name}-${f.key}`, 'png'), file);
      }
      setBusy('Packing the ZIP…');
      saveBlob(await zip.generateAsync({ type: 'blob' }), fileName(`${api.doc.name}-all-sizes`, 'zip'));
    } catch (e) { setErr(e.message || 'Could not create the files.'); } finally { setBusy(''); }
  }
  async function saveCopies() {
    setErr('');
    const out = [];
    try {
      for (const f of list) {
        setBusy(`Saving ${f.name}…`);
        const d = scaleDoc(api.doc, f.key, f.w, f.h);
        const id = await api.saveAsNew({ ...d, name: `${api.doc.name} · ${f.name}` });
        out.push([f.name, id]);
      }
      setSaved(out);
    } catch (e) { setErr(e.message || 'Could not save. Log in and try again.'); } finally { setBusy(''); }
  }
  return (
    <div className="space-y-3">
      <Note>Your design is fitted to each size: items keep their place, full-width bands and backgrounds stretch.</Note>
      {['Social', 'Print', 'Ads'].map((g) => (
        <div key={g}>
          <p className="mb-1 text-[11px] font-bold uppercase text-mute">{g}</p>
          {FORMATS.filter((f) => f.group === g).map((f) => (
            <label key={f.key} className="flex items-center gap-2 py-0.5 text-sm">
              <input type="checkbox" checked={picked.includes(f.key)} onChange={(e) => setPicked(e.target.checked ? [...picked, f.key] : picked.filter((k) => k !== f.key))} />
              {f.name} <span className="text-xs text-mute">{f.w}×{f.h}</span>
            </label>
          ))}
        </div>
      ))}
      <button type="button" disabled={!list.length || !!busy} onClick={zipAll} className="btn-primary w-full py-1.5 text-sm"><Download size={15} /> Download {list.length} sizes (ZIP)</button>
      <button type="button" disabled={!list.length || !!busy} onClick={saveCopies} className="btn-light w-full py-1.5 text-sm">Save as {list.length} new designs</button>
      {busy && <p className="flex items-center gap-2 text-xs"><Loader2 size={13} className="animate-spin" /> {busy}</p>}
      {!!saved.length && <ul className="space-y-1 text-xs">{saved.map(([n, id]) => <li key={id}><a className="font-semibold text-signal hover:underline" href={`/posters/${id}`} target="_blank" rel="noreferrer">Open {n} →</a></li>)}</ul>}
      <Err>{err}</Err>
    </div>
  );
}

// ---------- Bulk create: one poster per line of a list ----------
export function BulkCreate({ api }) {
  const texts = api.doc.elements.filter((e) => e.type === 'text' && !/^\p{Extended_Pictographic}/u.test(e.text || ''));
  const [cols, setCols] = useState(texts[0] ? [texts[0].id] : []);
  const [rows, setRows] = useState('');
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const lines = rows.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 200);
  const split = (l) => (l.includes('\t') ? l.split('\t') : l.includes('|') ? l.split('|') : l.split(',')).map((x) => x.trim());
  async function run() {
    setErr('');
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      for (const [i, line] of lines.entries()) {
        setBusy(`Making poster ${i + 1} of ${lines.length}…`);
        const vals = split(line);
        const d = clone(api.doc);
        d.elements = d.elements.map((e) => { const k = cols.indexOf(e.id); return k >= 0 && vals[k] !== undefined ? { ...e, text: vals[k] } : e; });
        zip.file(`${String(i + 1).padStart(3, '0')}-${fileName(vals[0] || `poster-${i + 1}`, 'png')}`, await api.renderPng(d, 1));
      }
      setBusy('Packing the ZIP…');
      saveBlob(await zip.generateAsync({ type: 'blob' }), fileName(`${api.doc.name}-bulk`, 'zip'));
    } catch (e) { setErr(e.message || 'Could not create the posters.'); } finally { setBusy(''); }
  }
  return (
    <div className="space-y-3">
      <Note>Make one poster per line, e.g. a birthday wish for every name, or a poster for every ward.</Note>
      {[0, 1, 2].map((i) => (i === 0 || cols[i - 1]) && (
        <label key={i} className="block">
          <span className="mb-0.5 block text-[11px] font-semibold text-mute">Column {i + 1} goes into</span>
          <select className="input py-1.5 text-sm" value={cols[i] || ''} onChange={(e) => { const next = [...cols]; next[i] = e.target.value; setCols(next.filter(Boolean)); }}>
            <option value="">{i ? '— not used —' : 'Pick a text'}</option>
            {texts.map((t) => <option key={t.id} value={t.id}>{(t.text || '').split('\n')[0].slice(0, 40)}</option>)}
          </select>
        </label>
      ))}
      <textarea className="input text-sm" rows={7} value={rows} onChange={(e) => setRows(e.target.value)} placeholder={'One line per poster. Separate columns with a comma:\nRahul Sharma, Ward 12\nPriya Verma, Ward 14'} aria-label="List" />
      <Note>{lines.length} poster{lines.length === 1 ? '' : 's'} (up to 200). Tip: paste straight from Excel.</Note>
      <button type="button" disabled={!lines.length || !cols.length || !!busy} onClick={run} className="btn-primary w-full py-1.5 text-sm"><Download size={15} /> Create {lines.length || ''} posters (ZIP)</button>
      {busy && <p className="flex items-center gap-2 text-xs"><Loader2 size={13} className="animate-spin" /> {busy}</p>}
      <Err>{err}</Err>
    </div>
  );
}

// ---------- AI writer ----------
export function AiWriter({ api }) {
  const [kind, setKind] = useState('slogan');
  const [topic, setTopic] = useState(api.doc.name || '');
  const [language, setLanguage] = useState('hi');
  const [tone, setTone] = useState('warm');
  const [busy, setBusy] = useState(false);
  const [options, setOptions] = useState([]);
  const [err, setErr] = useState('');
  const selText = api.selEls.find((e) => e.type === 'text');
  async function go() {
    setBusy(true); setErr('');
    try { setOptions((await aiCall({ action: 'write', kind, topic, language, tone })).options || []); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }
  const D = Math.min(api.doc.w, api.doc.h);
  const addText = (t) => {
    const w = Math.round(api.doc.w * 0.8);
    api.add(textEl(t, Math.round((api.doc.w - w) / 2), Math.round(api.doc.h * 0.45), w, Math.round(D * 0.12), { font: /[ऀ-ॿ]/.test(t) ? 'Baloo 2' : 'Poppins', weight: '800', size: Math.round(D * 0.05), color: '#111111' }));
  };
  return (
    <div className="space-y-2.5">
      <select className="input py-1.5 text-sm" value={kind} onChange={(e) => setKind(e.target.value)} aria-label="What to write">
        {[['slogan', 'Slogans'], ['headline', 'Headlines'], ['wish', 'Wishes & greetings'], ['caption', 'Social media captions'], ['offer', 'Sale / offer lines'], ['invite', 'Invitation lines']].map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
      <textarea className="input text-sm" rows={2} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What is the poster about? e.g. Ward 12 election, Rahul's 25th birthday, Diwali sale at my sweet shop" aria-label="Topic" />
      <div className="grid grid-cols-2 gap-1.5">
        <select className="input py-1.5 text-sm" value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Language"><option value="hi">हिंदी</option><option value="en">English</option><option value="hinglish">Hinglish</option></select>
        <select className="input py-1.5 text-sm" value={tone} onChange={(e) => setTone(e.target.value)} aria-label="Tone">{['warm', 'formal', 'energetic', 'funny', 'emotional', 'devotional', 'professional'].map((t) => <option key={t}>{t}</option>)}</select>
      </div>
      <button type="button" onClick={go} disabled={busy || !topic.trim()} className="btn-primary w-full py-1.5 text-sm">{busy ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />} Write with AI</button>
      <Err>{err}</Err>
      {options.map((o, i) => (
        <div key={i} className="rounded-lg border border-line bg-white p-2 text-sm">
          <p>{o}</p>
          <div className="mt-1.5 flex gap-1">
            <button type="button" onClick={() => addText(o)} className="btn-light px-2 py-0.5 text-xs">Add to page</button>
            {selText && <button type="button" onClick={() => api.update(selText.id, { text: o })} className="btn-light px-2 py-0.5 text-xs">Replace selected text</button>}
            <button type="button" onClick={() => navigator.clipboard?.writeText(o)} className="btn-ghost px-2 py-0.5 text-xs">Copy</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- AI translate ----------
export function AiTranslate({ api }) {
  const [to, setTo] = useState('hi');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState('');
  const sel = api.selEls.filter((e) => e.type === 'text');
  const all = api.doc.elements.filter((e) => e.type === 'text' && !/^\p{Extended_Pictographic}/u.test(e.text || ''));
  async function go(scope) {
    const items = scope === 'sel' ? sel : all;
    if (!items.length) return;
    setBusy(true); setErr(''); setDone('');
    try {
      const { translations = [] } = await aiCall({ action: 'translate', to, texts: items.map((e) => e.text) });
      const map = Object.fromEntries(items.map((e, i) => [e.id, translations[i]]).filter(([, t]) => t));
      api.setDoc({ ...api.doc, elements: api.doc.elements.map((e) => (map[e.id] ? api.withFont(e, map[e.id]) : e)) });
      setDone(`Translated ${Object.keys(map).length} text${Object.keys(map).length === 1 ? '' : 's'}. You can undo.`);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }
  return (
    <div className="space-y-2.5">
      <div className="flex rounded-lg border border-line bg-white p-0.5">
        {[['hi', 'To हिंदी'], ['en', 'To English']].map(([k, l]) => <button key={k} type="button" onClick={() => setTo(k)} className={`flex-1 rounded-md py-1 text-sm font-semibold ${to === k ? 'bg-ink text-white' : 'text-mute'}`}>{l}</button>)}
      </div>
      <button type="button" disabled={busy || !all.length} onClick={() => go('all')} className="btn-primary w-full py-1.5 text-sm">{busy ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />} Translate all {all.length} texts</button>
      <button type="button" disabled={busy || !sel.length} onClick={() => go('sel')} className="btn-light w-full py-1.5 text-sm">Translate selected ({sel.length})</button>
      <Note>Names, numbers, phone numbers and prices stay as they are. Fonts switch to Hindi fonts automatically.</Note>
      {done && <p className="text-xs text-green-700">{done}</p>}
      <Err>{err}</Err>
    </div>
  );
}

// ---------- Palette from a photo ----------
function extractPalette(img, k = 6) {
  const c = document.createElement('canvas');
  const s = 80 / Math.max(img.naturalWidth, img.naturalHeight);
  c.width = Math.max(1, Math.round(img.naturalWidth * s));
  c.height = Math.max(1, Math.round(img.naturalHeight * s));
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, c.width, c.height);
  const px = [];
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 128) px.push([d[i], d[i + 1], d[i + 2]]);
  let cent = Array.from({ length: k }, (_, i) => px[Math.floor((i / k) * px.length)] || [0, 0, 0]);
  for (let it = 0; it < 10; it++) {
    const sum = cent.map(() => [0, 0, 0, 0]);
    for (const p of px) {
      let bi = 0;
      let bd = Infinity;
      cent.forEach((q, i) => { const dd = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2; if (dd < bd) { bd = dd; bi = i; } });
      sum[bi][0] += p[0]; sum[bi][1] += p[1]; sum[bi][2] += p[2]; sum[bi][3]++;
    }
    cent = sum.map((s2, i) => (s2[3] ? [s2[0] / s2[3], s2[1] / s2[3], s2[2] / s2[3]] : cent[i]));
  }
  const hx = (v) => Math.round(v).toString(16).padStart(2, '0');
  return [...new Set(cent.map((q) => `#${hx(q[0])}${hx(q[1])}${hx(q[2])}`.toUpperCase()))];
}
export function PaletteFromPhoto({ api }) {
  const [pal, setPal] = useState([]);
  const [preview, setPreview] = useState('');
  const ref = useRef(null);
  const pick = (files) => {
    const f = files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPreview(url);
    const img = new Image();
    img.onload = () => setPal(extractPalette(img));
    img.src = url;
  };
  // swap the design's colours for the palette, darkest for darkest
  const apply = () => {
    const mine = designColors(api.doc).slice(0, pal.length).sort((a, b) => luminance(a) - luminance(b));
    const theirs = [...pal].sort((a, b) => luminance(a) - luminance(b));
    let d = api.doc;
    const temp = mine.map((_, i) => `#${(0x13579b + i * 7).toString(16).toUpperCase()}`); // placeholders so colours can swap without clashing
    mine.forEach((c, i) => { d = swapColor(d, c, temp[i]); });
    temp.forEach((t, i) => { d = swapColor(d, t, theirs[Math.round((i * (theirs.length - 1)) / Math.max(1, temp.length - 1))]); });
    api.setDoc(d);
  };
  return (
    <div className="space-y-2.5">
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files); e.target.value = ''; }} />
      <button type="button" onClick={() => ref.current?.click()} className="btn-primary w-full py-1.5 text-sm">Choose a photo</button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {preview && <img src={preview} alt="" className="max-h-40 w-full rounded-md object-cover" />}
      {!!pal.length && (
        <>
          <div className="flex gap-1">{pal.map((c) => <button key={c} type="button" title={c} onClick={() => navigator.clipboard?.writeText(c)} className="h-10 flex-1 rounded-md border border-line" style={{ background: c }} aria-label={`Colour ${c}`} />)}</div>
          <button type="button" onClick={apply} className="btn-light w-full py-1.5 text-sm">Apply these colours to my design</button>
          <button type="button" onClick={() => api.setBrand({ ...api.brand, colors: [...new Set([...(api.brand.colors || []), ...pal])].slice(0, 12) })} className="btn-light w-full py-1.5 text-sm">Add to brand colours</button>
        </>
      )}
      <Note>Great for matching a poster to a product photo, a party flag or a shop sign.</Note>
    </div>
  );
}

// ---------- Auto-enhance a photo ----------
export function AutoEnhance({ api }) {
  const img = api.selEls.find((e) => e.type === 'image' && e.src);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function go() {
    setBusy(true); setErr('');
    try {
      const im = await new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = img.src; });
      const c = document.createElement('canvas');
      c.width = 120; c.height = Math.max(1, Math.round((120 * im.naturalHeight) / im.naturalWidth));
      const ctx = c.getContext('2d');
      ctx.drawImage(im, 0, 0, c.width, c.height);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      const lum = [];
      let sat = 0;
      for (let i = 0; i < d.length; i += 4) {
        const [r, g, b] = [d[i], d[i + 1], d[i + 2]];
        lum.push(0.299 * r + 0.587 * g + 0.114 * b);
        const mx = Math.max(r, g, b); const mn = Math.min(r, g, b);
        sat += mx ? (mx - mn) / mx : 0;
      }
      lum.sort((a, b) => a - b);
      const lo = lum[Math.floor(lum.length * 0.02)];
      const hi = lum[Math.floor(lum.length * 0.98)];
      const mid = lum[Math.floor(lum.length / 2)];
      const avgSat = sat / lum.length;
      const contrastPct = Math.round(Math.max(90, Math.min(150, (200 / Math.max(40, hi - lo)) * 100)));
      const brightPct = Math.round(Math.max(85, Math.min(135, (128 / Math.max(30, mid)) * 100)));
      const satPct = Math.round(Math.max(100, Math.min(150, (0.35 / Math.max(0.1, avgSat)) * 100)));
      api.update(img.id, { filters: { ...(img.filters || {}), brightness: brightPct, contrast: contrastPct, saturate: satPct } });
    } catch { setErr('This photo could not be analysed. Upload it from your device and try again.'); } finally { setBusy(false); }
  }
  if (!img) return <Note>Select a photo on the page first, then come back here.</Note>;
  return (
    <div className="space-y-2.5">
      <button type="button" onClick={go} disabled={busy} className="btn-primary w-full py-1.5 text-sm">{busy ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />} Auto-enhance photo</button>
      <button type="button" onClick={() => api.update(img.id, { filters: {} })} className="btn-light w-full py-1.5 text-sm">Reset to original</button>
      <Note>Fixes dark, dull or washed-out photos by adjusting brightness, contrast and colour. Fine-tune it later under Filters on the right.</Note>
      <Err>{err}</Err>
    </div>
  );
}

// ---------- Watermark ----------
export function Watermark({ api }) {
  const [text, setText] = useState(api.brand.name || '© Your Name');
  const [opacity, setOpacity] = useState(12);
  const [color, setColor] = useState('#000000');
  const { w: W, h: H } = api.doc;
  const D = Math.min(W, H);
  const addText = () => {
    const size = Math.round(D * 0.035);
    const line = Array.from({ length: 8 }, () => text).join('      ');
    const big = Math.hypot(W, H) * 1.2;
    api.add({ ...textEl(Array.from({ length: Math.ceil(big / (size * 3)) }, () => line).join('\n\n'), Math.round((W - big) / 2), Math.round((H - big) / 2), Math.round(big), Math.round(big), { size, weight: '700', color, lh: 1.5, align: 'center', font: 'Poppins' }), rot: -30, opacity: opacity / 100, locked: true, name: 'Watermark' });
  };
  const addLogo = () => {
    const s = Math.round(D * 0.15);
    api.add({ id: eid(), type: 'image', src: api.brand.logo, x: Math.round(W - s - D * 0.04), y: Math.round(H - s - D * 0.04), w: s, h: s, rot: 0, opacity: 0.35, fit: 'contain', cropX: 50, cropY: 50, zoom: 1, filters: {}, name: 'Logo watermark' });
  };
  return (
    <div className="space-y-2.5">
      <input className="input py-1.5 text-sm" value={text} onChange={(e) => setText(e.target.value)} aria-label="Watermark text" />
      <label className="block text-xs">Strength: {opacity}% <input type="range" min={4} max={40} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-[#2F5BFF]" /></label>
      <div className="flex gap-1">{['#000000', '#FFFFFF', '#DC2626', '#2F5BFF'].map((c) => <button key={c} type="button" onClick={() => setColor(c)} className={`h-7 flex-1 rounded-md border-2 ${color === c ? 'border-signal' : 'border-line'}`} style={{ background: c }} aria-label={c} />)}</div>
      <button type="button" onClick={addText} disabled={!text.trim()} className="btn-primary w-full py-1.5 text-sm">Add repeating text watermark</button>
      <button type="button" onClick={addLogo} disabled={!api.brand.logo} className="btn-light w-full py-1.5 text-sm">Add logo watermark</button>
      <Note>{api.brand.logo ? 'The watermark is locked; unlock it in Layers to move or delete it.' : 'Upload a logo in Brand kit to use a logo watermark.'}</Note>
    </div>
  );
}

// ---------- Design checker ----------
function colourUnder(doc, el) {
  const cx = el.x + el.w / 2;
  const cy = el.y + el.h / 2;
  const i = doc.elements.indexOf(el);
  for (let k = i - 1; k >= 0; k--) {
    const e = doc.elements[k];
    if (e.hidden || e.type === 'text' || cx < e.x || cx > e.x + e.w || cy < e.y || cy > e.y + e.h) continue;
    if (e.type === 'shape' && e.fill && e.fill !== 'transparent' && (e.opacity ?? 1) > 0.6) return e.fill;
    if ((e.type === 'image' && e.src) || e.type === 'graphic' || e.type === 'qr') return null; // photo or decoration underneath: can't judge
  }
  return doc.bg?.type === 'image' ? null : doc.bg?.color;
}
export function DesignChecker({ api }) {
  const doc = api.doc;
  const issues = useMemo(() => {
    const out = [];
    const D = Math.min(doc.w, doc.h);
    doc.elements.forEach((e) => {
      if (e.hidden) return;
      const label = e.type === 'text' ? `“${(e.text || '').split('\n')[0].slice(0, 24)}”` : e.name || e.type;
      if (e.type === 'text' && e.color && e.color !== 'transparent' && !e.bgColor && !e.strokeW) {
        const under = colourUnder(doc, e);
        const ratio = under && contrast(e.color, under);
        if (ratio && ratio < 2.5) out.push({ id: e.id, level: 'error', msg: `${label} is hard to read on its background (contrast ${ratio.toFixed(1)}).`, fix: 'Fix contrast', patch: { color: (luminance(under) ?? 1) > 0.4 ? '#111111' : '#FFFFFF' } });
      }
      if (e.x < -2 || e.y < -2 || e.x + e.w > doc.w + 2 || e.y + e.h > doc.h + 2) {
        if (e.type === 'text') out.push({ id: e.id, level: 'error', msg: `${label} goes off the page and may be cut off.`, fix: 'Move inside', patch: { x: Math.max(0, Math.min(doc.w - Math.min(e.w, doc.w), e.x)), y: Math.max(0, Math.min(doc.h - Math.min(e.h, doc.h), e.y)), w: Math.min(e.w, doc.w) } });
      }
      if (e.type === 'text' && e.size < D * 0.016) out.push({ id: e.id, level: 'warn', msg: `${label} is very small and may be hard to read on a phone or in print.`, fix: 'Make bigger', patch: { size: Math.round(D * 0.022) } });
      if (e.type === 'text' && textHeight(e) > e.h * 1.2) out.push({ id: e.id, level: 'warn', msg: `${label} doesn't fit its box.`, fix: 'Fit box', patch: { h: Math.ceil(textHeight(e)) + 2 } });
      if (e.type === 'image' && !e.src) out.push({ id: e.id, level: 'warn', msg: `Photo frame “${e.slot || 'Photo'}” is empty (it will be left out of downloads).`, fix: null });
    });
    const hidden = doc.elements.filter((e) => e.hidden).length;
    if (hidden) out.push({ id: null, level: 'info', msg: `${hidden} hidden layer${hidden > 1 ? 's' : ''} (not in downloads).`, fix: null });
    return out;
  }, [doc]);
  const fixable = issues.filter((i) => i.patch);
  return (
    <div className="space-y-2">
      {!issues.length && <p className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800"><CheckCircle2 size={16} /> Looks good! No problems found.</p>}
      {!!fixable.length && <button type="button" onClick={() => api.setDoc({ ...doc, elements: doc.elements.map((e) => { const f = fixable.filter((i) => i.id === e.id); return f.length ? Object.assign({ ...e }, ...f.map((x) => x.patch)) : e; }) })} className="btn-primary w-full py-1.5 text-sm"><Wand2 size={15} /> Fix all ({fixable.length})</button>}
      {issues.map((i, k) => (
        <div key={k} className={`rounded-lg border p-2 text-xs ${i.level === 'error' ? 'border-red-200 bg-red-50' : i.level === 'warn' ? 'border-amber-200 bg-amber-50' : 'border-line bg-white'}`}>
          <p className="flex gap-1.5"><AlertTriangle size={13} className="mt-0.5 shrink-0" /> {i.msg}</p>
          <div className="mt-1 flex gap-1">
            {i.id && <button type="button" onClick={() => api.select([i.id])} className="btn-light px-2 py-0.5 text-xs">Select</button>}
            {i.patch && <button type="button" onClick={() => api.update(i.id, i.patch)} className="btn-light px-2 py-0.5 text-xs">{i.fix}</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- Freehand draw ----------
export function DrawTool({ api }) {
  const d = api.draw;
  const set = (patch) => api.setDraw({ ...d, ...patch });
  const MODES = [['pen', 'Pen', 6, false], ['marker', 'Marker', 16, false], ['highlighter', 'Highlighter', 28, true]];
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-3 gap-1">
        {MODES.map(([k, l, size, hl]) => <button key={k} type="button" onClick={() => set({ mode: k, size, highlighter: hl })} className={`rounded-md border py-1 text-xs font-semibold ${d.mode === k ? 'border-signal bg-signal-soft' : 'border-line text-mute'}`}>{l}</button>)}
      </div>
      <div className="flex flex-wrap gap-1">{['#111111', '#FFFFFF', '#DC2626', '#F59E0B', '#16A34A', '#2563EB', '#7C3AED', '#EC4899'].map((c) => <button key={c} type="button" onClick={() => set({ color: c })} className={`h-7 w-7 rounded-full border-2 ${d.color === c ? 'border-signal' : 'border-line'}`} style={{ background: c }} aria-label={c} />)}
        <input type="color" value={d.color} onChange={(e) => set({ color: e.target.value })} className="h-7 w-7 cursor-pointer rounded-full" aria-label="Custom colour" /></div>
      <label className="block text-xs">Size: {d.size}px <input type="range" min={1} max={80} value={d.size} onChange={(e) => set({ size: Number(e.target.value) })} className="w-full accent-[#2F5BFF]" /></label>
      <button type="button" onClick={() => set({ on: !d.on })} className={`${d.on ? 'btn-sun' : 'btn-primary'} w-full py-2 text-sm`}>{d.on ? 'Stop drawing' : 'Start drawing'}</button>
      <Note>{d.on ? 'Drag on the page to draw. Each stroke becomes a layer you can move, resize or delete.' : 'Draw arrows, underlines, signatures or doodles by hand.'}</Note>
    </div>
  );
}

// ---------- Price list / menu ----------
export function PriceList({ api }) {
  const [title, setTitle] = useState('Price List');
  const [rows, setRows] = useState('Haircut, ₹150\nBeard trim, ₹80\nHair colour, ₹500\nFacial, ₹600');
  const [color, setColor] = useState('#111111');
  const [accent, setAccent] = useState('#DC2626');
  const make = () => {
    const { w: W, h: H } = api.doc;
    const D = Math.min(W, H);
    const lines = rows.split('\n').map((l) => l.split(/[,|\t]/).map((x) => x.trim())).filter((l) => l[0]).slice(0, 30);
    const x = W * 0.1;
    const w = W * 0.8;
    const top = H * 0.22;
    const rowH = Math.min(D * 0.09, (H * 0.68) / Math.max(1, lines.length));
    const size = Math.round(rowH * 0.42);
    const gid = eid();
    const els = [textEl(title, Math.round(x), Math.round(top - D * 0.12), Math.round(w), Math.round(D * 0.1), { font: /[ऀ-ॿ]/.test(title) ? 'Baloo 2' : 'Montserrat', weight: '800', size: Math.round(D * 0.065), color: accent, groupId: gid, name: 'Price list title' })];
    lines.forEach(([item, price = ''], i) => {
      const y = top + i * rowH;
      const hi = /[ऀ-ॿ]/.test(item);
      els.push(textEl(item, Math.round(x), Math.round(y), Math.round(w * 0.62), Math.round(rowH * 0.8), { font: hi ? 'Hind' : 'Poppins', weight: '600', size, color, align: 'left', groupId: gid }));
      els.push(shapeEl('rect', Math.round(x + w * 0.5), Math.round(y + rowH * 0.5), Math.round(w * 0.3), 1, { fill: 'transparent', stroke: color, strokeW: Math.max(1, Math.round(size * 0.08)), dash: true, opacity: 0.4, groupId: gid, name: 'Dotted line' }));
      els.push(textEl(price, Math.round(x + w * 0.62), Math.round(y), Math.round(w * 0.38), Math.round(rowH * 0.8), { font: 'Poppins', weight: '800', size, color: accent, align: 'right', groupId: gid }));
    });
    api.add(els);
  };
  return (
    <div className="space-y-2.5">
      <input className="input py-1.5 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Title" />
      <textarea className="input text-sm" rows={7} value={rows} onChange={(e) => setRows(e.target.value)} aria-label="Items and prices" />
      <Note>One item per line: name, price. Works for menus, rate cards and fee lists.</Note>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <label>Text <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-7 w-full" /></label>
        <label>Prices & title <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-7 w-full" /></label>
      </div>
      <button type="button" onClick={make} className="btn-primary w-full py-1.5 text-sm">Add price list</button>
    </div>
  );
}

// ---------- Text effects ----------
const EFFECTS = [
  ['Neon glow', (e) => ({ color: '#FFFFFF', shadow: { x: 0, y: 0, blur: Math.round(e.size * 0.35), color: '#22F5D0' }, stroke: '', strokeW: 0, extrude: null, fill2: '' })],
  ['3D', (e) => ({ extrude: { depth: Math.max(3, Math.round(e.size * 0.08)), color: '#1F2937' }, shadow: null })],
  ['Outline', (e) => ({ stroke: '#FFFFFF', strokeW: Math.max(2, Math.round(e.size * 0.07)), shadow: { x: 0, y: Math.round(e.size * 0.05), blur: Math.round(e.size * 0.1), color: 'rgba(0,0,0,0.35)' } })],
  ['Hollow', (e) => ({ color: 'transparent', stroke: e.color && e.color !== 'transparent' ? e.color : '#111111', strokeW: Math.max(1.5, Math.round(e.size * 0.035)), fill2: '' })],
  ['Soft shadow', (e) => ({ shadow: { x: 0, y: Math.round(e.size * 0.06), blur: Math.round(e.size * 0.18), color: 'rgba(0,0,0,0.4)' } })],
  ['Hard shadow', (e) => ({ shadow: { x: Math.round(e.size * 0.06), y: Math.round(e.size * 0.06), blur: 0, color: '#111111' } })],
  ['Retro', (e) => ({ color: '#FACC15', stroke: '#111111', strokeW: Math.max(2, Math.round(e.size * 0.05)), extrude: { depth: Math.max(3, Math.round(e.size * 0.07)), color: '#EF4444' } })],
  ['Glitch', (e) => ({ shadow: { x: -Math.round(e.size * 0.04), y: 0, blur: 0, color: '#22D3EE' }, extrude: { depth: Math.max(2, Math.round(e.size * 0.04)), color: '#F43F5E' } })],
  ['Gradient', () => ({ color: '#7C3AED', fill2: '#EC4899', gradAngle: 90 })],
  ['Gold', () => ({ color: '#8B5E00', fill2: '#F5D27A', gradAngle: 90 })],
  ['Highlight', (e) => ({ bgColor: '#FACC15', bgPad: Math.round(e.size * 0.2), bgRadius: Math.round(e.size * 0.15), color: '#111111' })],
  ['Curved', (e) => ({ curve: 50, h: Math.max(e.h, Math.round(e.size * 2.4)) })],
];
export function TextEffects({ api }) {
  const sel = api.selEls.filter((e) => e.type === 'text');
  if (!sel.length) return <Note>Select one or more texts on the page, then pick an effect.</Note>;
  const apply = (fn) => api.setDoc({ ...api.doc, elements: api.doc.elements.map((e) => (sel.some((s) => s.id === e.id) ? { ...e, ...fn(e) } : e)) });
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-1.5">
        {EFFECTS.map(([name, fn]) => {
          const demo = { size: 22, color: '#2F5BFF', h: 30, ...fn({ size: 22, color: '#2F5BFF', h: 30 }) };
          return (
            <button key={name} type="button" onClick={() => apply(fn)} className={`grid h-14 place-items-center rounded-lg border border-line px-1 hover:border-signal ${name === 'Neon glow' ? 'bg-[#0A0A1A]' : 'bg-white'}`}>
              <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 18, color: demo.fill2 ? 'transparent' : demo.color, backgroundImage: demo.fill2 ? `linear-gradient(90deg, ${demo.color}, ${demo.fill2})` : undefined, WebkitBackgroundClip: demo.fill2 ? 'text' : undefined, background: demo.bgColor || (demo.fill2 ? `linear-gradient(90deg, ${demo.color}, ${demo.fill2})` : undefined), WebkitTextStroke: demo.color === 'transparent' ? `1px ${demo.stroke}` : undefined, textShadow: [demo.shadow && `${demo.shadow.x}px ${demo.shadow.y}px ${demo.shadow.blur}px ${demo.shadow.color}`, demo.extrude && `2px 2px 0 ${demo.extrude.color}`, demo.strokeW && demo.color !== 'transparent' && `0 0 1px ${demo.stroke}`].filter(Boolean).join(',') || undefined, padding: demo.bgColor ? '0 4px' : undefined, borderRadius: 4 }}>{name}</span>
            </button>
          );
        })}
      </div>
      <button type="button" onClick={() => apply(() => ({ shadow: null, extrude: null, stroke: '', strokeW: 0, fill2: '', bgColor: '', curve: 0 }))} className="btn-light w-full py-1 text-xs">Clear effects</button>
    </div>
  );
}

// ---------- Background generator ----------
const BG_PAIRS = [['#FF9A8B', '#FF6A88'], ['#FAD961', '#F76B1C'], ['#43E97B', '#38F9D7'], ['#667EEA', '#764BA2'], ['#F093FB', '#F5576C'], ['#4FACFE', '#00F2FE'], ['#FFECD2', '#FCB69F'], ['#A18CD1', '#FBC2EB'], ['#0F2027', '#2C5364'], ['#5B0A1A', '#D4A017'], ['#FF7A00', '#FFC300'], ['#138808', '#9BE15D'], ['#141E30', '#243B55'], ['#F7971E', '#FFD200'], ['#00C6FF', '#0072FF'], ['#E0EAFC', '#CFDEF3']];
const BG_PATTERNS = ['sparkles', 'bokeh', 'halftone', 'stripes', 'confetti', 'mandala', 'sunburst', 'arcs', 'petals'];
export function BackgroundGenerator({ api }) {
  const rnd = (l) => l[Math.floor(Math.random() * l.length)];
  const colours = () => {
    const [a, b] = rnd(BG_PAIRS);
    const type = rnd(['gradient', 'gradient', 'radial', 'solid']);
    api.setDoc({ ...api.doc, bg: { ...api.doc.bg, type, color: a, from: a, to: b, angle: rnd([90, 135, 160, 180, 225]) } });
  };
  const pattern = () => {
    const els = api.doc.elements.filter((e) => e.name !== 'Generated pattern');
    const g = rnd(BG_PATTERNS);
    const light = (luminance(api.doc.bg?.color) ?? 1) < 0.4;
    api.setDoc({ ...api.doc, elements: [graphicEl(g, 0, 0, api.doc.w, api.doc.h, { colors: light ? ['#FFFFFF', '#FDE68A'] : ['#111111', '#2F5BFF'], opacity: 0.35, seed: Math.floor(Math.random() * 99999), name: 'Generated pattern', locked: true }), ...els] });
  };
  return (
    <div className="space-y-2.5">
      <button type="button" onClick={colours} className="btn-primary w-full py-1.5 text-sm"><Shuffle size={15} /> Shuffle background colours</button>
      <button type="button" onClick={pattern} className="btn-light w-full py-1.5 text-sm"><Shuffle size={15} /> Shuffle pattern</button>
      <button type="button" onClick={() => api.setDoc({ ...api.doc, elements: api.doc.elements.filter((e) => e.name !== 'Generated pattern') })} className="btn-ghost w-full py-1 text-xs">Remove pattern</button>
      <Note>Keep pressing Shuffle until you like it; Undo brings back the last one.</Note>
    </div>
  );
}

// ---------- Smart arrange ----------
export function SmartArrange({ api }) {
  const [gap, setGap] = useState(24);
  const sel = api.selEls.filter((e) => !e.locked);
  const arrange = (mode) => {
    if (sel.length < 2) return;
    const left = Math.min(...sel.map((e) => e.x));
    const top = Math.min(...sel.map((e) => e.y));
    const order = [...sel].sort((a, b) => (mode === 'column' ? a.y - b.y : mode === 'row' ? a.x - b.x : a.y - b.y || a.x - b.x));
    const cols = mode === 'row' ? order.length : mode === 'column' ? 1 : Math.ceil(Math.sqrt(order.length));
    const cw = Math.max(...order.map((e) => e.w));
    const ch = Math.max(...order.map((e) => e.h));
    const pos = {};
    let x = left;
    let y = top;
    order.forEach((e, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      if (mode === 'row') { pos[e.id] = { x, y: top + (ch - e.h) / 2 }; x += e.w + gap; }
      else if (mode === 'column') { pos[e.id] = { x: left + (cw - e.w) / 2, y }; y += e.h + gap; }
      else pos[e.id] = { x: left + c * (cw + gap) + (cw - e.w) / 2, y: top + r * (ch + gap) + (ch - e.h) / 2 };
    });
    api.setDoc({ ...api.doc, elements: api.doc.elements.map((e) => (pos[e.id] ? { ...e, ...pos[e.id] } : e)) });
  };
  if (sel.length < 2) return <Note>Select two or more items (Shift-click, or drag a box around them), then choose a layout.</Note>;
  return (
    <div className="space-y-2.5">
      <label className="block text-xs">Spacing: {gap}px <input type="range" min={0} max={200} value={gap} onChange={(e) => setGap(Number(e.target.value))} className="w-full accent-[#2F5BFF]" /></label>
      <div className="grid grid-cols-3 gap-1">
        {[['row', 'In a row'], ['column', 'In a column'], ['grid', 'In a grid']].map(([k, l]) => <button key={k} type="button" onClick={() => arrange(k)} className="btn-light py-1.5 text-xs">{l}</button>)}
      </div>
      <Note>{sel.length} items selected. Items are lined up in their current order with equal gaps.</Note>
    </div>
  );
}
