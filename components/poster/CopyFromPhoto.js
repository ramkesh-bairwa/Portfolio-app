'use client';
// "Copy a design from a photo": the AI reads a poster image; we rebuild it as editable layers.
// Text becomes real text, colour areas become shapes, and photos / logos are cut from the original image.
import { useRef, useState } from 'react';
import { Check, ImageUp, Loader2, Sparkles, X } from 'lucide-react';
import { eid, imageEl, shapeEl, textEl } from '@/lib/poster/design';
import { FORMATS } from '@/lib/poster/formats';
import { fontHref } from '@/lib/fonts';
import { rememberUploads, uploadFiles } from '../builder/fields';
import { textHeight } from './measure';
import { removeBackground } from './removeBg';

const API_SIDE = 1568; // the size the AI reads images at
const DEVA = /[ऀ-ॿ]/;
const FONT = {
  en: { sans: ['Poppins', '600'], display: ['Montserrat', '800'], condensed: ['Bebas Neue', '400'], serif: ['Playfair Display', '700'], script: ['Great Vibes', '400'], handwritten: ['Caveat', '700'] },
  hi: { sans: ['Hind', '600'], display: ['Baloo 2', '800'], condensed: ['Khand', '700'], serif: ['Rozha One', '400'], script: ['Amita', '700'], handwritten: ['Kalam', '700'] },
};
const SHAPE = { rect: 'rect', rounded: 'rounded', circle: 'circle', ellipse: 'circle', ribbon: 'ribbon', triangle: 'triangle', star: 'star', line: 'line' };
const hex = (c, d) => (/^#[0-9a-f]{3,8}$/i.test(c || '') ? c : d);

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('That file could not be opened as an image.'));
    img.src = url;
  });
}

function toJpegBase64(img, maxSide) {
  const k = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * k);
  c.height = Math.round(img.naturalHeight * k);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.9).split(',')[1];
}

// Cut a region (percent box) out of the original full-size image
function crop(img, el) {
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const sx = Math.max(0, (el.x / 100) * W);
  const sy = Math.max(0, (el.y / 100) * H);
  const sw = Math.min(W - sx, (el.w / 100) * W);
  const sh = Math.min(H - sy, (el.h / 100) * H);
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(sw));
  c.height = Math.max(1, Math.round(sh));
  c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
  return new Promise((res) => c.toBlob((b) => res(new File([b], 'region.jpg', { type: 'image/jpeg' })), 'image/jpeg', 0.92));
}

// Page size: a known format if the photo matches its shape, else the photo's own shape
function pageFor(img) {
  const a = img.naturalWidth / img.naturalHeight;
  const f = FORMATS.find((x) => Math.abs(x.w / x.h - a) / a < 0.02);
  if (f) return { format: f.key, w: f.w, h: f.h };
  const long = 1200;
  return a >= 1 ? { format: 'custom', w: long, h: Math.round(long / a) } : { format: 'custom', w: Math.round(long * a), h: long };
}

// Load the fonts the copy will use, so text is measured with the real letters
async function loadFonts(names) {
  const href = fontHref(names);
  if (!href) return;
  if (!document.querySelector(`link[data-copy-fonts="${href}"]`)) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    l.dataset.copyFonts = href;
    document.head.appendChild(l);
    await new Promise((res) => { l.onload = res; l.onerror = res; setTimeout(res, 4000); });
  }
  await Promise.all(names.map((n) => document.fonts.load(`700 24px "${n}"`).catch(() => null)));
}

export async function buildFromLayout(layout, img, { cutPeople, keepGuide }, progress) {
  progress?.('Loading fonts…');
  await loadFonts([...new Set(Object.values(FONT).flatMap((g) => Object.values(g).map(([n]) => n)))]);
  const page = pageFor(img);
  const { w: W, h: H } = page;
  const bg = layout.background || {};
  const elements = [];
  const regions = [];
  const P = (v, total) => Math.round(((Number(v) || 0) / 100) * total);

  for (const it of layout.elements || []) {
    const x = P(it.x, W);
    const y = P(it.y, H);
    const w = Math.max(4, P(it.w, W));
    const h = Math.max(4, P(it.h, H));
    const base = { rot: Number(it.rotation) || 0, opacity: Math.max(0.05, Math.min(1, it.opacity ?? 1)), name: it.label || undefined };
    if (it.kind === 'text' && it.text) {
      const lang = DEVA.test(it.text) ? 'hi' : 'en';
      const [font, weight] = FONT[lang][it.fontStyle] || FONT[lang].sans;
      const wide = Math.round(w * 0.06); // a little slack so lines don't wrap unexpectedly
      const align = it.align || 'center';
      const el = textEl(it.text, align === 'left' ? x : align === 'right' ? x - wide : x - wide / 2, y, w + wide, h, {
        ...base, font, weight: lang === 'en' || ['Baloo 2', 'Hind', 'Khand'].includes(font) ? it.fontWeight || weight : weight,
        size: Math.max(6, ((Number(it.fontSizePct) || 3) / 100) * H), color: hex(it.color, '#111111'), align, italic: !!it.italic, upper: !!it.uppercase,
        lh: lang === 'hi' ? 1.25 : 1.12,
        ...(hex(it.outlineColor) && { stroke: it.outlineColor, strokeW: Math.max(1, Math.round(((Number(it.fontSizePct) || 3) / 100) * H * 0.06)) }),
        ...(it.shadow && { shadow: { x: 0, y: Math.round(H * 0.003), blur: Math.round(H * 0.008), color: 'rgba(0,0,0,0.35)' } }),
      });
      // shrink the font if the text would spill out of its box
      for (let i = 0; i < 12 && textHeight(el) > el.h * 1.08; i++) el.size = Math.max(6, el.size * 0.92);
      el.size = Math.round(el.size);
      elements.push(el);
    } else if (it.kind === 'shape') {
      const shape = SHAPE[it.shape] || 'rect';
      elements.push(shapeEl(shape, x, y, w, h, {
        ...base, fill: hex(it.fill, '#CCCCCC'), fill2: hex(it.fill2, ''), gradAngle: 90,
        radius: shape === 'rounded' ? Math.round(((Number(it.radiusPct) || 20) / 100) * h) : 0,
        ...(shape === 'line' && { strokeW: Math.max(1, h), fill: hex(it.fill, '#111111') }),
      }));
    } else if (it.kind === 'image_region') {
      const el = imageEl('', x, y, w, h, { ...base, placeholder: it.role === 'person' ? 'person' : 'photo', slot: it.label || 'Photo', fit: 'cover' });
      elements.push(el);
      regions.push({ el, it });
    }
  }

  // cut photos / logos out of the original and upload them
  for (let i = 0; i < regions.length; i++) {
    const { el, it } = regions[i];
    progress?.(`Cutting out ${it.label || 'photo'} (${i + 1} of ${regions.length})…`);
    try {
      const [url] = await uploadFiles([await crop(img, it)]);
      el.src = url;
      if (cutPeople && it.role === 'person' && it.cutout) {
        progress?.(`Removing the background from ${it.label || 'the person'}…`);
        try {
          const [cut] = await uploadFiles([await removeBackground(url)]);
          Object.assign(el, { src: cut, fit: 'contain', outline: { width: Math.max(3, Math.round(Math.min(W, H) * 0.006)), color: '#FFFFFF' } });
        } catch { /* keep the plain crop */ }
      }
      rememberUploads([el.src]);
    } catch { /* leave an empty frame the user can fill */ }
  }

  if (keepGuide) {
    progress?.('Adding the original as a hidden guide layer…');
    try {
      const file = await new Promise((res) => { const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; c.getContext('2d').drawImage(img, 0, 0); c.toBlob((b) => res(new File([b], 'original.jpg', { type: 'image/jpeg' })), 'image/jpeg', 0.85); });
      const [url] = await uploadFiles([file]);
      elements.push(imageEl(url, 0, 0, W, H, { id: eid(), name: 'Original photo (guide)', opacity: 0.4, hidden: true, locked: true }));
    } catch { /* optional */ }
  }

  return {
    ...page,
    bg: bg.type === 'gradient' || bg.type === 'radial'
      ? { type: bg.type, color: hex(bg.color1, '#FFFFFF'), from: hex(bg.color1, '#FFFFFF'), to: hex(bg.color2, '#FFFFFF'), angle: Number(bg.angle) || 180, image: '', overlay: 0 }
      : { type: 'solid', color: hex(bg.color1, '#FFFFFF'), from: hex(bg.color1, '#FFFFFF'), to: hex(bg.color2, '#E2E8F0'), angle: 135, image: '', overlay: 0 },
    elements,
  };
}

export default function CopyFromPhoto({ onDone, onClose, hasContent }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [cutPeople, setCutPeople] = useState(true);
  const [keepGuide, setKeepGuide] = useState(true);
  const [step, setStep] = useState('');
  const [error, setError] = useState('');
  const ref = useRef(null);
  const busy = !!step;

  const pick = (files) => {
    const f = Array.from(files || []).find((x) => x.type.startsWith('image/'));
    if (!f) return;
    setError('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  async function run() {
    if (!file) return;
    if (hasContent && !confirm('This replaces the current page with the copied design. You can undo it. Continue?')) return;
    setError('');
    try {
      setStep('Preparing the photo…');
      const img = await loadImage(file);
      setStep('Reading the design with AI… this usually takes 20–60 seconds.');
      const r = await fetch('/api/posters/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: toJpegBase64(img, API_SIDE), mediaType: 'image/jpeg' }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Could not read the design. Please try again.');
      const doc = await buildFromLayout(j.layout, img, { cutPeople, keepGuide }, setStep);
      onDone({ ...doc, name: file.name.replace(/\.[^.]+$/, '') || 'Copied design', template: 'copied' });
    } catch (e) {
      setError(e.message);
    } finally {
      setStep('');
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" role="dialog" aria-modal="true" aria-label="Copy a design from a photo">
      <div className="max-h-full w-full max-w-lg overflow-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold"><Sparkles size={20} className="text-signal" /> Copy a design from a photo</h2>
            <p className="mt-1 text-sm text-mute">Upload a photo or screenshot of any poster or banner. AI rebuilds it as an editable design: text you can change, shapes, and the photos and logos cut out of your image.</p>
          </div>
          <button onClick={onClose} disabled={busy} className="btn-ghost px-2" aria-label="Close"><X size={18} /></button>
        </div>
        <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => { pick(e.target.files); e.target.value = ''; }} />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files); }}
          disabled={busy}
          className="grid min-h-[200px] w-full place-items-center rounded-xl border-2 border-dashed border-line bg-paper p-3 hover:border-signal"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {preview ? <img src={preview} alt="Poster to copy" className="max-h-72 rounded-md object-contain shadow" /> : <span className="flex flex-col items-center gap-2 text-sm text-mute"><ImageUp size={28} /> Click or drop a poster photo here (JPG, PNG, WebP)</span>}
        </button>
        <div className="mt-4 space-y-2 text-sm">
          <label className="flex items-start gap-2"><input type="checkbox" className="mt-1" checked={cutPeople} onChange={(e) => setCutPeople(e.target.checked)} disabled={busy} /> <span>Remove the background from people automatically<span className="block text-xs text-mute">Cut-out photos get a white outline, like most posters.</span></span></label>
          <label className="flex items-start gap-2"><input type="checkbox" className="mt-1" checked={keepGuide} onChange={(e) => setKeepGuide(e.target.checked)} disabled={busy} /> <span>Keep the original as a hidden guide layer<span className="block text-xs text-mute">Show it from Layers to compare while you adjust.</span></span></label>
        </div>
        {step && <p className="mt-4 flex items-center gap-2 rounded-lg bg-signal-soft p-3 text-sm"><Loader2 size={16} className="shrink-0 animate-spin text-signal" /> {step}</p>}
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
        <button onClick={run} disabled={!file || busy} className="btn-primary mt-4 w-full py-2.5">{busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Copy this design</button>
        <p className="mt-3 text-center text-xs text-mute">The copy is close, not pixel-perfect: fonts are matched to similar ones and positions may need small fixes. Only copy designs you have the right to use.</p>
      </div>
    </div>
  );
}
