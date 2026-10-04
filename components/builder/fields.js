'use client';
import { useId, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Copy, ImagePlus, Images, Loader2, Plus, Trash2, Upload, X } from 'lucide-react';
import { FontPicker } from './FontPicker';
import ShapePicker from './ShapePicker';

export async function uploadFiles(fileList) {
  const fd = new FormData();
  Array.from(fileList).forEach((f) => fd.append('files', f));
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Upload failed. Try again.');
  return data.urls;
}

const LIB_KEY = 'folio_recent_uploads';
export function rememberUploads(urls) {
  try {
    const prev = JSON.parse(localStorage.getItem(LIB_KEY) || '[]');
    localStorage.setItem(LIB_KEY, JSON.stringify([...urls, ...prev.filter((u) => !urls.includes(u))].slice(0, 40)));
  } catch { /* storage unavailable */ }
}
function recentUploads() {
  try { return JSON.parse(localStorage.getItem(LIB_KEY) || '[]'); } catch { return []; }
}
const imageFiles = (list) => Array.from(list || []).filter((f) => f.type?.startsWith('image/'));
const SAMPLE_TOPICS = ['portrait', 'workspace', 'city', 'nature', 'food', 'travel', 'product', 'abstract'];

export function ImageInput({ value, onChange, id }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [over, setOver] = useState(false);
  const [lib, setLib] = useState(null);
  async function upload(files) {
    const list = imageFiles(files);
    if (!list.length) return;
    setBusy(true);
    setErr('');
    try {
      const [url] = await uploadFiles([list[0]]);
      rememberUploads([url]);
      onChange(url);
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  }
  const onPaste = (e) => {
    const files = imageFiles(e.clipboardData?.files);
    if (files.length) { e.preventDefault(); upload(files); }
  };
  const sample = (topic) => onChange(`https://picsum.photos/seed/${topic}-${Math.random().toString(36).slice(2, 7)}/1200/900`);
  return (
    <div onPaste={onPaste}>
      <div
        className={`flex gap-2 rounded-lg p-1 transition-colors ${over ? 'bg-signal-soft outline-dashed outline-2 outline-signal' : ''}`}
        onDragOver={(e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); e.stopPropagation(); setOver(true); } }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { if (!e.dataTransfer.files?.length) return; e.preventDefault(); e.stopPropagation(); setOver(false); upload(e.dataTransfer.files); }}
      >
        <button type="button" onClick={() => ref.current?.click()} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-[repeating-conic-gradient(#eef1f5_0_25%,#fff_0_50%)] bg-[length:12px_12px]" aria-label="Upload image">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="m-auto text-mute" size={20} />}
        </button>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex gap-1.5">
            <button type="button" onClick={() => ref.current?.click()} className="btn-light flex-1 py-1.5" disabled={busy}>
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {busy ? 'Uploading…' : 'Upload'}
            </button>
            <button type="button" onClick={() => setLib(lib ? null : recentUploads())} className={`btn-light px-2 py-1.5 ${lib ? 'border-signal' : ''}`} title="My uploads and sample photos" aria-label="Photo library"><Images size={14} /></button>
            {value && <button type="button" onClick={() => onChange('')} className="btn-light px-2 py-1.5 hover:text-red-600" aria-label="Remove image"><X size={14} /></button>}
          </div>
          <input id={id} className="input py-1.5 text-xs" placeholder="Drop, paste (Ctrl+V) or link an image" value={value || ''} onChange={(e) => onChange(e.target.value)} />
        </div>
      </div>
      {lib && (
        <div className="mt-2 rounded-lg border border-line bg-white p-2">
          <p className="mb-1.5 text-[11px] font-semibold text-mute">My recent uploads</p>
          {lib.length ? (
            <div className="grid grid-cols-5 gap-1">
              {lib.map((u) => (
                <button key={u} type="button" onClick={() => { onChange(u); setLib(null); }} className={`aspect-square overflow-hidden rounded border ${u === value ? 'border-signal ring-2 ring-signal' : 'border-line'}`}>
                  <img src={u} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          ) : <p className="text-xs text-mute">Images you upload will appear here so you can reuse them.</p>}
          <p className="mb-1.5 mt-3 text-[11px] font-semibold text-mute">Sample photos</p>
          <div className="flex flex-wrap gap-1">
            {SAMPLE_TOPICS.map((t) => <button key={t} type="button" onClick={() => { sample(t); setLib(null); }} className="rounded-full border border-line px-2 py-0.5 text-xs capitalize hover:border-signal">{t}</button>)}
          </div>
        </div>
      )}
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
    </div>
  );
}

export function ChoiceInput({ value, options, onChange, cols = 2 }) {
  return (
    <div className={`grid gap-1.5 ${cols === 3 ? 'grid-cols-3' : cols === 4 ? 'grid-cols-4' : 'grid-cols-2'}`} role="radiogroup">
      {options.map(([v, l]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={(value ?? '') === v}
          onClick={() => onChange(v)}
          className={`rounded-lg border px-2 py-1.5 text-left text-xs font-semibold transition-colors ${(value ?? '') === v ? 'border-signal bg-signal-soft text-ink' : 'border-line bg-white text-mute hover:border-ink/40 hover:text-ink'}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function ColorInput({ value, onChange, id, allowClear = true }) {
  return (
    <div className="flex items-center gap-2">
      <label className="relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-line" style={{ background: value || 'repeating-conic-gradient(#eef1f5 0 25%,#fff 0 50%) 0 0/10px 10px' }}>
        <input type="color" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" value={/^#[0-9a-f]{6}$/i.test(value || '') ? value : '#ffffff'} onChange={(e) => onChange(e.target.value)} aria-label="Pick colour" />
      </label>
      <input id={id} className="input py-1.5 font-mono text-xs" value={value || ''} placeholder="Theme default" onChange={(e) => onChange(e.target.value)} />
      {allowClear && value && (
        <button type="button" onClick={() => onChange('')} className="btn-ghost px-2" aria-label="Clear colour"><X size={14} /></button>
      )}
    </div>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={!!checked} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-3 py-1 text-left text-sm">
      <span>{label}</span>
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-signal' : 'bg-line'}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
    </button>
  );
}

function ListField({ field, value, onChange }) {
  const items = Array.isArray(value) ? value : [];
  const [open, setOpen] = useState(0);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);
  const set = (i, k, v) => onChange(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)), `${field.k}.${i}.${k}`);
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const a = [...items];
    [a[i], a[j]] = [a[j], a[i]];
    onChange(a);
    setOpen(j);
  };
  const imageKey = field.fields.find((f) => f.t === 'image')?.k;
  const summary = (it, i) => {
    const textKey = field.fields.find((f) => ['text', 'select'].includes(f.t))?.k;
    return (textKey && it[textKey]) || `Item ${i + 1}`;
  };
  const [over, setOver] = useState(false);
  async function addFiles(files) {
    const list = imageFiles(files).slice(0, 20);
    if (!list.length) return;
    setBusy(true);
    try {
      const urls = await uploadFiles(list);
      rememberUploads(urls);
      onChange([...items, ...urls.map((u) => ({ ...field.item, [imageKey]: u }))]);
    } catch (x) {
      alert(x.message);
    } finally {
      setBusy(false);
    }
  }
  const bulk = (e) => { addFiles(e.target.files); e.target.value = ''; };
  const dropProps = field.bulkImage ? {
    onDragOver: (e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setOver(true); } },
    onDragLeave: (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(false); },
    onDrop: (e) => { if (!e.dataTransfer.files?.length) return; e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); },
  } : {};

  return (
    <div className={`space-y-2 rounded-lg ${over ? 'bg-signal-soft outline-dashed outline-2 outline-signal' : ''}`} {...dropProps}>
      {items.map((it, i) => (
        <div key={i} className="rounded-lg border border-line bg-white">
          <div className="flex items-center gap-1 px-2 py-1.5">
            <button type="button" onClick={() => setOpen(open === i ? -1 : i)} className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-medium" aria-expanded={open === i}>
              {imageKey && it[imageKey] && <img src={it[imageKey]} alt="" className="h-7 w-7 shrink-0 rounded object-cover" />}
              <span className="truncate">{summary(it, i)}</span>
            </button>
            <button type="button" className="rounded p-1 text-mute hover:bg-paper hover:text-ink" onClick={() => move(i, -1)} aria-label="Move up"><ChevronUp size={14} /></button>
            <button type="button" className="rounded p-1 text-mute hover:bg-paper hover:text-ink" onClick={() => move(i, 1)} aria-label="Move down"><ChevronDown size={14} /></button>
            <button type="button" className="rounded p-1 text-mute hover:bg-paper hover:text-ink" onClick={() => onChange([...items.slice(0, i + 1), { ...it }, ...items.slice(i + 1)])} aria-label="Duplicate"><Copy size={13} /></button>
            <button type="button" className="rounded p-1 text-mute hover:bg-red-50 hover:text-red-600" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Delete"><Trash2 size={13} /></button>
          </div>
          {open === i && (
            <div className="space-y-3 border-t border-line p-3">
              {field.fields.map((sf) => (
                <Field key={sf.k} field={sf} value={it[sf.k]} onChange={(v) => set(i, sf.k, v)} />
              ))}
            </div>
          )}
        </div>
      ))}
      <div className="flex gap-2">
        <button type="button" className="btn-light flex-1 py-1.5" onClick={() => { onChange([...items, { ...field.item }]); setOpen(items.length); }}>
          <Plus size={14} /> Add
        </button>
        {field.bulkImage && (
          <>
            <button type="button" className="btn-light flex-1 py-1.5" disabled={busy} onClick={() => ref.current?.click()}>
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload many
            </button>
            <input ref={ref} type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={bulk} />
          </>
        )}
      </div>
      {field.bulkImage && <p className="text-[11px] text-mute">Tip: drop up to 20 images here at once.</p>}
    </div>
  );
}

export function Field({ field, value, onChange }) {
  const id = useId();
  let control;
  switch (field.t) {
    case 'textarea':
    case 'code':
      control = <textarea id={id} rows={field.rows || 3} className={`input resize-y ${field.t === 'code' ? 'font-mono text-xs' : ''}`} value={value ?? ''} onChange={(e) => onChange(e.target.value)} spellCheck={field.t !== 'code'} />;
      break;
    case 'number':
      control = <input id={id} type="number" className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />;
      break;
    case 'range':
      control = (
        <div className="flex items-center gap-3">
          <input id={id} type="range" min={field.min} max={field.max} step={field.step || 1} className="flex-1 accent-[#5B4BFF]" value={value ?? field.min} onChange={(e) => onChange(Number(e.target.value))} />
          <input type="number" aria-label={field.label} className="input w-16 px-2 py-1 text-xs" value={value ?? ''} step={field.step || 1} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
      );
      break;
    case 'select':
      control = (
        <select id={id} className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          {field.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      );
      break;
    case 'toggle':
      return <Toggle checked={!!value} onChange={onChange} label={field.label} />;
    case 'color':
      control = <ColorInput id={id} value={value} onChange={onChange} />;
      break;
    case 'image':
      control = <ImageInput id={id} value={value} onChange={onChange} />;
      break;
    case 'list':
      control = <ListField field={field} value={value} onChange={onChange} />;
      break;
    case 'choice':
      control = <ChoiceInput value={value} options={field.options} cols={field.cols} onChange={onChange} />;
      break;
    case 'edge':
    case 'decor':
      control = <ShapePicker id={id} kind={field.t} value={value} onChange={onChange} />;
      break;
    case 'font':
      control = <FontPicker id={id} value={value} onChange={onChange} allowDefault />;
      break;
    case 'group':
      return <h4 className="-mb-1 border-t border-line pt-4 text-[11px] font-bold uppercase tracking-wide text-mute first:border-0 first:pt-0">{field.label}</h4>;
    default:
      control = <input id={id} className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
  }
  return (
    <div>
      <label className="label" htmlFor={id}>{field.label}</label>
      {control}
    </div>
  );
}

export function FieldsForm({ fields, values, onChange }) {
  return (
    <div className="space-y-4">
      {fields.filter((f) => !f.show || f.show(values || {})).map((f) => (
        <Field key={f.k} field={f} value={values?.[f.k] ?? f.def} onChange={(v, mk) => onChange(f.k, v, mk || f.k)} />
      ))}
    </div>
  );
}
