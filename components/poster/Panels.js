'use client';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Loader2, Lock, Search, Unlock, Upload } from 'lucide-react';
import { img } from '@/lib/blocks';
import { fontStack } from '@/lib/fonts';
import { POSTER_CATEGORIES } from '@/lib/poster/categories';
import { graphicEl, iconEl, imageEl, shapeEl, slotEl, textEl } from '@/lib/poster/design';
import { POSTER_LANGS, buildTemplate, templatesFor } from '@/lib/poster/templates';
import { GRAPHICS } from '@/lib/poster/graphics';
import { GRAPHIC_CATS, GRAPHIC_PRESETS, PREVIEW_RATIO, findPreset, presetBox } from '@/lib/poster/graphicsLib';
import { isLight } from '@/lib/poster/kit';
import { getFormat } from '@/lib/poster/formats';
import { SHAPES, SHAPE_KEYS } from '@/lib/poster/shapes';
import { rememberUploads, uploadFiles } from '../builder/fields';
import { ICON_NAMES, POSTER_ICONS } from './icons';
import { PosterThumb } from './PosterGallery';
import { ElementBody } from './Stage';
import HinglishTextarea, { HindiTypingContext } from './HinglishTextarea';

export function elementLabel(el) {
  if (el.name) return el.name;
  if (el.type === 'text') return (el.text || 'Text').split('\n')[0].slice(0, 28);
  if (el.type === 'image') return el.slot ? `Photo · ${el.slot}` : 'Image';
  if (el.type === 'graphic') return GRAPHICS[el.graphic]?.name || findPreset(el.preset)?.name || 'Graphic';
  if (el.type === 'icon') return `Icon · ${el.icon}`;
  return SHAPES[el.shape]?.name || 'Shape';
}

const Title = ({ children }) => <h3 className="mb-2 mt-5 text-xs font-bold uppercase tracking-wide text-mute first:mt-0">{children}</h3>;

// ---------- Templates ----------
export function TemplatesPanel({ doc, onApply }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(null);
  const [lang, setLang] = useState('en');
  const [limit, setLimit] = useState(12);
  const format = { ...getFormat(doc.format), w: doc.w, h: doc.h, key: doc.format };
  const list = POSTER_CATEGORIES.filter((c) => !q || `${c.name} ${c.group}`.toLowerCase().includes(q.toLowerCase()));
  const category = POSTER_CATEGORIES.find((c) => c.key === cat);
  const docs = useMemo(() => (category ? templatesFor(category.key, lang).slice(0, limit).map((tp) => ({ tp, d: buildTemplate(tp, format) })) : []), [category, lang, limit, doc.w, doc.h]); // eslint-disable-line react-hooks/exhaustive-deps
  if (category)
    return (
      <div className="p-4">
        <button onClick={() => setCat(null)} className="mb-3 text-sm font-semibold text-signal">← All categories</button>
        <p className="mb-2 font-bold">{category.emoji} {category.name}</p>
        <div className="mb-3 flex rounded-lg border border-line bg-white p-0.5">
          {POSTER_LANGS.map(([k, l]) => (
            <button key={k} onClick={() => { setLang(k); setLimit(12); }} className={`flex-1 rounded-md py-1 text-xs font-semibold ${lang === k ? 'bg-ink text-white' : 'text-mute'}`}>{l}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {docs.map(({ tp, d }) => (
            <button key={tp.slug} onClick={() => onApply({ ...d, name: category.name, template: tp.slug })} className="text-left" title={`Use ${tp.name}`}>
              <PosterThumb doc={d} width={118} />
              <span className="mt-1 block truncate text-xs font-semibold text-mute">{tp.name.split(' · ').slice(1).join(' · ')}</span>
            </button>
          ))}
        </div>
        {limit < 50 && <button onClick={() => setLimit(limit + 12)} className="btn-light mt-3 w-full py-1.5 text-xs">Show more designs</button>}
      </div>
    );
  return (
    <div className="p-4">
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
        <input className="input pl-8" placeholder="Search categories" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search categories" />
      </div>
      <p className="mb-3 text-xs text-mute">Pick a category to see its designs in this size. Using one replaces the page (you can undo).</p>
      <div className="space-y-0.5">
        {list.map((c) => (
          <button key={c.key} onClick={() => setCat(c.key)} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-white">
            <span>{c.emoji}</span> <span className="flex-1">{c.name}</span> <span className="text-[11px] text-mute">{c.group}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Text ----------
const TEXT_STYLES = [
  ['Bold display', { font: 'Bebas Neue', weight: '400', ls: 0.02, text: 'BIG HEADLINE', p: 'HEADLINE' }],
  ['Elegant script', { font: 'Great Vibes', weight: '400', text: 'Celebrate' }],
  ['Classic serif', { font: 'Playfair Display', weight: '700', text: 'Grand Opening', p: 'Grand' }],
  ['Modern sans', { font: 'Montserrat', weight: '800', text: 'Modern Title', p: 'Modern' }],
  ['Retro', { font: 'Bungee', weight: '400', text: 'RETRO' }],
  ['Handwritten', { font: 'Caveat', weight: '700', text: 'Thank you!' }],
  ['Fancy', { font: 'Lobster', weight: '400', text: 'Happy Day' }],
  ['Outline', { font: 'Archivo Black', weight: '400', text: 'OUTLINE', color: 'transparent', stroke: '#111111', strokeW: 2 }],
  ['Neon glow', { font: 'Righteous', weight: '400', text: 'NEON', color: '#FFFFFF', shadow: { x: 0, y: 0, blur: 18, color: '#22F5D0' }, bgColor: '#0A0A1A', bgPad: 12 }],
  ['Highlight', { font: 'Poppins', weight: '700', text: 'Highlighted', p: 'Highlight', color: '#FFFFFF', bgColor: '#DC2626', bgPad: 10, bgRadius: 6 }],
  ['Gradient', { font: 'Poppins', weight: '800', text: 'Gradient', color: '#7C3AED', fill2: '#EC4899', gradAngle: 90 }],
  ['3D shadow', { font: 'Archivo Black', weight: '400', text: 'POP!', color: '#FACC15', shadow: { x: 5, y: 5, blur: 0, color: '#111111' } }],
];

export function TextPanel({ doc, add }) {
  const hindi = useContext(HindiTypingContext).on;
  const D = Math.min(doc.w, doc.h);
  const cx = (w) => Math.round((doc.w - w) / 2);
  const base = (text, size, o = {}) => {
    const w = Math.round(doc.w * 0.7);
    const h = Math.round(size * 1.35);
    return textEl(text, cx(w), Math.round(doc.h / 2 - h / 2), w, h, { size: Math.round(size), color: '#111111', ...o });
  };
  const combos = [
    ['Sale badge', () => {
      const w = Math.round(D * 0.6);
      const x = cx(w);
      const y = Math.round(doc.h / 2 - D * 0.2);
      return [
        textEl('MEGA', x, y, w, Math.round(D * 0.07), { font: 'Poppins', weight: '700', size: Math.round(D * 0.05), ls: 0.3, color: '#111111' }),
        textEl('SALE', x, y + Math.round(D * 0.07), w, Math.round(D * 0.2), { font: 'Bebas Neue', size: Math.round(D * 0.2), lh: 1, color: '#DC2626' }),
        shapeEl('rounded', x + Math.round(w * 0.15), y + Math.round(D * 0.29), Math.round(w * 0.7), Math.round(D * 0.08), { fill: '#111111', radius: Math.round(D * 0.04) }),
        textEl('UP TO 50% OFF', x + Math.round(w * 0.15), y + Math.round(D * 0.305), Math.round(w * 0.7), Math.round(D * 0.05), { font: 'Poppins', weight: '700', size: Math.round(D * 0.038), color: '#FFFFFF' }),
      ];
    }],
    ['Save the date', () => {
      const w = Math.round(D * 0.7);
      const x = cx(w);
      const y = Math.round(doc.h / 2 - D * 0.12);
      return [
        textEl('Save the Date', x, y, w, Math.round(D * 0.14), { font: 'Great Vibes', size: Math.round(D * 0.11), color: '#8B1E2D' }),
        textEl('12 · 12 · 2026', x, y + Math.round(D * 0.15), w, Math.round(D * 0.07), { font: 'Cormorant Garamond', weight: '600', size: Math.round(D * 0.05), ls: 0.2, color: '#111111' }),
      ];
    }],
    ['Quote', () => {
      const w = Math.round(D * 0.75);
      const x = cx(w);
      const y = Math.round(doc.h / 2 - D * 0.18);
      return [
        textEl('“', x, y, w, Math.round(D * 0.14), { font: 'Playfair Display', weight: '700', size: Math.round(D * 0.2), lh: 1, color: '#2F5BFF' }),
        textEl('The best way to predict the future is to create it.', x, y + Math.round(D * 0.13), w, Math.round(D * 0.16), { font: 'Playfair Display', italic: true, size: Math.round(D * 0.055), lh: 1.3, color: '#111111' }),
        textEl('— Your Name', x, y + Math.round(D * 0.31), w, Math.round(D * 0.05), { font: 'Inter', weight: '600', size: Math.round(D * 0.032), color: '#475569' }),
      ];
    }],
    ['Contact details', () => {
      const s = Math.round(D * 0.04);
      const x = Math.round(doc.w * 0.15);
      const y = Math.round(doc.h / 2 - s * 2.5);
      return [['Phone', '+91 98765 43210'], ['Mail', 'hello@yourname.com'], ['MapPin', 'Shop 12, Main Market, Your City']].flatMap(([ic, t], i) => [
        iconEl(ic, x, y + i * s * 1.9, s, s, { color: '#2F5BFF' }),
        textEl(t, x + Math.round(s * 1.5), y + i * s * 1.9 - Math.round(s * 0.1), Math.round(doc.w * 0.6), Math.round(s * 1.3), { font: 'Poppins', weight: '500', size: Math.round(s * 0.8), align: 'left', color: '#111111' }),
      ]);
    }],
    ['Big offer', () => {
      const w = Math.round(D * 0.5);
      const x = cx(w);
      const y = Math.round(doc.h / 2 - D * 0.15);
      return [
        shapeEl('burst', x, y, w, w, { fill: '#DC2626' }),
        textEl('50%', x, y + Math.round(w * 0.28), w, Math.round(w * 0.3), { font: 'Archivo Black', size: Math.round(w * 0.24), lh: 1.1, color: '#FFFFFF' }),
        textEl('OFF', x, y + Math.round(w * 0.56), w, Math.round(w * 0.16), { font: 'Poppins', weight: '800', size: Math.round(w * 0.12), color: '#FFFFFF' }),
      ];
    }],
  ];
  return (
    <div className="p-4">
      <div className="space-y-2">
        <button onClick={() => add(base(hindi ? 'शीर्षक यहाँ लिखें' : 'Add a heading', D * 0.09, { font: hindi ? 'Baloo 2' : 'Poppins', weight: '800', lh: hindi ? 1.3 : 1.2 }))} className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-left text-xl font-extrabold hover:border-signal">Add a heading</button>
        <button onClick={() => add(base(hindi ? 'उपशीर्षक यहाँ लिखें' : 'Add a subheading', D * 0.05, { font: hindi ? 'Hind' : 'Poppins', weight: '600', lh: hindi ? 1.35 : 1.2 }))} className="w-full rounded-lg border border-line bg-white px-3 py-2 text-left text-base font-semibold hover:border-signal">Add a subheading</button>
        <button onClick={() => add(base(hindi ? 'यहाँ अपना संदेश लिखें' : 'Add a little bit of body text', D * 0.032, { font: hindi ? 'Hind' : 'Poppins', lh: 1.45 }))} className="w-full rounded-lg border border-line bg-white px-3 py-2 text-left text-sm hover:border-signal">Add body text</button>
        {hindi && <p className="text-xs text-mute">Hindi typing is on: type in English letters (e.g. “shubh deepawali”) and press space.</p>}
      </div>
      <Title>Text styles</Title>
      <div className="grid grid-cols-2 gap-2">
        {TEXT_STYLES.map(([label, o]) => (
          <button key={label} onClick={() => add(base(o.text, D * 0.09, { color: '#111111', ...o }))} className="grid h-16 place-items-center overflow-hidden rounded-lg border border-line bg-white px-1 hover:border-signal" title={label}>
            <span style={{ fontFamily: fontStack(o.font), fontWeight: o.weight, fontSize: 19, whiteSpace: 'nowrap', color: o.color === 'transparent' ? 'transparent' : o.fill2 ? undefined : o.color || '#111', WebkitTextStroke: o.stroke ? `1px ${o.stroke}` : undefined, textShadow: o.shadow ? `${o.shadow.x / 2}px ${o.shadow.y / 2}px ${o.shadow.blur / 2}px ${o.shadow.color}` : undefined, background: o.fill2 ? `linear-gradient(90deg, ${o.color}, ${o.fill2})` : o.bgColor, WebkitBackgroundClip: o.fill2 ? 'text' : undefined, WebkitTextFillColor: o.fill2 ? 'transparent' : undefined, padding: o.bgColor ? '0 6px' : undefined, borderRadius: 4 }}>
              {o.p || o.text}
            </span>
          </button>
        ))}
      </div>
      <Title>Text combinations</Title>
      <div className="grid grid-cols-2 gap-2">
        {combos.map(([label, make]) => (
          <button key={label} onClick={() => add(make())} className="rounded-lg border border-line bg-white px-2 py-3 text-xs font-semibold hover:border-signal">{label}</button>
        ))}
      </div>
    </div>
  );
}

// ---------- Shapes ----------
const LINES = [
  ['Line', { shape: 'line', strokeW: 4 }],
  ['Thick line', { shape: 'line', strokeW: 12 }],
  ['Arrow', { shape: 'arrow' }],
];
export function ShapesPanel({ doc, add }) {
  const D = Math.min(doc.w, doc.h);
  const size = Math.round(D * 0.3);
  const put = (shape, o = {}) => add(shapeEl(shape, Math.round((doc.w - size) / 2), Math.round((doc.h - size) / 2), size, shape === 'line' ? Math.max(20, o.strokeW * 3) : size, { fill: '#2F5BFF', stroke: shape === 'ring' ? '#2F5BFF' : '', strokeW: shape === 'ring' ? Math.round(D * 0.02) : 0, ...o }));
  return (
    <div className="p-4">
      <Title>Shapes</Title>
      <div className="grid grid-cols-4 gap-2">
        {SHAPE_KEYS.filter((k) => k !== 'line').map((k) => (
          <button key={k} onClick={() => put(k)} title={SHAPES[k].name} aria-label={SHAPES[k].name} className="grid aspect-square place-items-center rounded-lg border border-line bg-white p-2.5 hover:border-signal">
            <div className="relative h-full w-full"><ElementBody el={{ id: `p-${k}`, type: 'shape', shape: k, w: 40, h: 40, fill: '#2F5BFF', stroke: '#2F5BFF', strokeW: k === 'ring' ? 4 : 0 }} /></div>
          </button>
        ))}
      </div>
      <Title>Lines</Title>
      <div className="grid grid-cols-3 gap-2">
        {LINES.map(([l, o]) => (
          <button key={l} onClick={() => put(o.shape, { ...o, fill: '#111111' })} className="rounded-lg border border-line bg-white px-2 py-2 text-xs font-semibold hover:border-signal">{l}</button>
        ))}
      </div>
      <Title>Gradient shapes</Title>
      <div className="grid grid-cols-4 gap-2">
        {[['#7C3AED', '#EC4899'], ['#F12711', '#F5AF19'], ['#11998E', '#38EF7D'], ['#2193B0', '#6DD5ED']].map(([a, b]) => (
          <button key={a} onClick={() => put('blob', { fill: a, fill2: b })} className="aspect-square rounded-lg border border-line hover:border-signal" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} aria-label="Gradient blob" />
        ))}
      </div>
    </div>
  );
}

// ---------- Icons ----------
export function IconsPanel({ doc, add }) {
  const [q, setQ] = useState('');
  const size = Math.round(Math.min(doc.w, doc.h) * 0.14);
  const list = ICON_NAMES.filter((n) => n.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="p-4">
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
        <input className="input pl-8" placeholder="Search icons" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search icons" />
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {list.map((n) => {
          const Icon = POSTER_ICONS[n];
          return (
            <button key={n} title={n} aria-label={n} onClick={() => add(iconEl(n, Math.round((doc.w - size) / 2), Math.round((doc.h - size) / 2), size, size, { color: '#111111' }))} className="grid aspect-square place-items-center rounded-lg border border-line bg-white hover:border-signal">
              <Icon size={20} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Stickers ----------
const STICKERS = {
  Celebration: '🎉 🎊 🎈 🎁 🎂 🍰 🥳 🎆 🎇 ✨ 🎀 🪅 🏆 🥇 🎖️ 👑 💐 🌹 🌸 🌺 🌻 🌷',
  Festivals: '🪔 🕉️ 🛕 🙏 📿 🔱 🐘 🦚 🪁 🌙 ☪️ 🕌 🎄 🎅 ⛪ 🕎 🇮🇳 🧧 🏮 🪷 🥭 🍬',
  Love: '❤️ 🧡 💛 💚 💙 💜 🤍 💖 💕 💞 💍 💒 👰 🤵 💑 😍 🥰 😘',
  Business: '📢 📣 🛍️ 🛒 💰 💸 🏷️ 💳 📈 📊 🏪 🏬 🏢 🏠 🏡 🔑 📞 📱 💻 ✉️ 📍 🚚 ⭐ ✅ 🔥 ⚡ 🆕 🆓 💯',
  People: '😀 😃 😄 😁 😊 😎 🤩 😇 🙂 😉 🤗 👍 👏 🙌 💪 👋 ✌️ 👌 🧑‍🎓 🧑‍💼 🧑‍⚕️ 🧑‍🍳 🧑‍🏫 👨‍👩‍👧',
  Things: '📚 ✏️ 🎓 🏫 🩺 💊 🍕 🍔 ☕ 🧁 🍛 🚗 🏍️ ✈️ 🏖️ ⛰️ ⚽ 🏏 🎵 🎤 🎧 📷 🎬 🗳️ ☀️ 🌈 🌳 🌍',
};
export function StickersPanel({ doc, add }) {
  const size = Math.round(Math.min(doc.w, doc.h) * 0.16);
  return (
    <div className="p-4">
      {Object.entries(STICKERS).map(([g, list]) => (
        <div key={g}>
          <Title>{g}</Title>
          <div className="grid grid-cols-6 gap-1">
            {list.split(' ').map((e) => (
              <button key={e} onClick={() => add(textEl(e, Math.round((doc.w - size) / 2), Math.round((doc.h - size) / 2), size, Math.round(size * 1.2), { size: Math.round(size * 0.85), lh: 1.2, name: `Sticker ${e}` }))} className="grid aspect-square place-items-center rounded-lg text-2xl hover:bg-white" aria-label={`Sticker ${e}`}>
                {e}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- Photos ----------
const SAMPLES = ['city', 'house', 'nature', 'people', 'food', 'office', 'party', 'flowers', 'beach', 'mountain', 'cars', 'abstract', 'wedding', 'school', 'shop', 'sky'];
const MASKS = [['none', 'Square'], ['rounded', 'Rounded'], ['circle', 'Circle'], ['arch', 'Arch'], ['hexagon', 'Hexagon'], ['heart', 'Heart'], ['star', 'Star'], ['blob', 'Blob'], ['diamond', 'Diamond']];
function recentUploads() {
  try { return JSON.parse(localStorage.getItem('folio_recent_uploads') || '[]'); } catch { return []; }
}
export function PhotosPanel({ doc, add, uploadRef }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [recent, setRecent] = useState([]);
  const fileRef = useRef(null);
  useEffect(() => setRecent(recentUploads()), []);
  const D = Math.min(doc.w, doc.h);
  const put = (src, mask = 'none') => {
    const w = Math.round(D * 0.5);
    add(imageEl(src, Math.round((doc.w - w) / 2), Math.round((doc.h - w) / 2), w, w, { mask: mask === 'rounded' ? 'none' : mask, radius: mask === 'rounded' ? Math.round(w * 0.12) : 0 }));
  };
  async function upload(files) {
    const list = Array.from(files || []).filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    setBusy(true);
    setErr('');
    try {
      const urls = await uploadFiles(list);
      rememberUploads(urls);
      setRecent(recentUploads());
      urls.forEach((u) => put(u));
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (uploadRef) uploadRef.current = upload;
  return (
    <div className="p-4">
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
      <button onClick={() => fileRef.current?.click()} disabled={busy} className="btn-primary w-full">{busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Upload photos</button>
      <p className="mt-2 text-xs text-mute">You can also drag photos from your computer onto the page, or paste them (Ctrl/⌘ + V).</p>
      {err && <p className="mt-2 text-sm text-red-600" role="alert">{err}</p>}
      {!!recent.length && (
        <>
          <Title>Your uploads</Title>
          <div className="grid grid-cols-3 gap-1.5">
            {recent.map((u) => (
              // eslint-disable-next-line @next/next/no-img-element
              <button key={u} onClick={() => put(u)} className="overflow-hidden rounded-md border border-line"><img src={u} alt="" className="aspect-square w-full object-cover" /></button>
            ))}
          </div>
        </>
      )}
      <Title>Photo frames</Title>
      <div className="grid grid-cols-3 gap-1.5">
        {MASKS.map(([m, l]) => (
          <button key={m} onClick={() => put(img(`frame-${m}`, 800, 800), m)} className="rounded-md border border-line bg-white px-1 py-2 text-xs font-semibold hover:border-signal">{l}</button>
        ))}
      </div>
      <Title>Sample photos</Title>
      <div className="grid grid-cols-3 gap-1.5">
        {SAMPLES.map((s) => (
          // eslint-disable-next-line @next/next/no-img-element
          <button key={s} onClick={() => put(img(`poster-${s}`, 1000, 1000))} className="overflow-hidden rounded-md border border-line"><img src={img(`poster-${s}`, 200, 200)} alt="" loading="lazy" className="aspect-square w-full object-cover" /></button>
        ))}
      </div>
    </div>
  );
}

// ---------- Layers ----------
export function LayersPanel({ doc, selected, select, update, move }) {
  const list = [...doc.elements].reverse();
  if (!list.length) return <p className="p-4 text-sm text-mute">Nothing on the page yet.</p>;
  return (
    <ol className="space-y-1 p-3">
      {list.map((el) => (
        <li key={el.id} className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-sm ${selected.includes(el.id) ? 'border-signal bg-signal-soft' : 'border-transparent hover:bg-white'}`}>
          <button className="min-w-0 flex-1 truncate text-left" onClick={(e) => select(e.shiftKey ? [...new Set([...selected, el.id])] : [el.id])} style={{ opacity: el.hidden ? 0.5 : 1 }}>{elementLabel(el)}</button>
          <button className="rounded p-1 text-mute hover:text-ink" onClick={() => move(el.id, 1)} aria-label="Bring forward" title="Bring forward"><ArrowUp size={13} /></button>
          <button className="rounded p-1 text-mute hover:text-ink" onClick={() => move(el.id, -1)} aria-label="Send backward" title="Send backward"><ArrowDown size={13} /></button>
          <button className="rounded p-1 text-mute hover:text-ink" onClick={() => update(el.id, { hidden: !el.hidden })} aria-label={el.hidden ? 'Show' : 'Hide'} title={el.hidden ? 'Show' : 'Hide'}>{el.hidden ? <EyeOff size={13} /> : <Eye size={13} />}</button>
          <button className="rounded p-1 text-mute hover:text-ink" onClick={() => update(el.id, { locked: !el.locked })} aria-label={el.locked ? 'Unlock' : 'Lock'} title={el.locked ? 'Unlock' : 'Lock'}>{el.locked ? <Lock size={13} /> : <Unlock size={13} />}</button>
        </li>
      ))}
    </ol>
  );
}

// ---------- Graphics: 500+ curves, lines, frames, badges and decorations ----------
function GraphicPreview({ preset }) {
  const ratio = PREVIEW_RATIO[preset.size] || 1;
  const w = 120;
  const h = Math.round(Math.min(90, w * ratio));
  const el = { id: `pv${preset.key}`, type: 'graphic', graphic: preset.family, preset: preset.key, params: preset.params, colors: preset.colors, seed: preset.seed, w: ratio > 0.75 ? Math.round(h / ratio) : w, h };
  return <div style={{ width: el.w, height: el.h }}><ElementBody el={el} /></div>;
}

export function GraphicsPanel({ doc, add }) {
  const [cat, setCat] = useState('Originals');
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(48);
  const list = GRAPHIC_PRESETS.filter((g) => (q ? `${g.name} ${g.cat}`.toLowerCase().includes(q.toLowerCase()) : g.cat === cat));
  const put = (g) => {
    const [x, y, w, h] = presetBox(g, doc.w, doc.h);
    add(graphicEl(g.family, x, y, w, h, { preset: g.key, params: { ...g.params }, colors: [...g.colors], seed: g.seed, name: g.name }));
  };
  return (
    <div className="p-4">
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
        <input className="input pl-8" placeholder={`Search ${GRAPHIC_PRESETS.length} graphics`} value={q} onChange={(e) => { setQ(e.target.value); setLimit(48); }} aria-label="Search graphics" />
      </div>
      {!q && (
        <div className="mb-3 flex flex-wrap gap-1">
          {GRAPHIC_CATS.map((c) => (
            <button key={c} onClick={() => { setCat(c); setLimit(48); }} className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cat === c ? 'border-ink bg-ink text-white' : 'border-line bg-white text-mute hover:text-ink'}`}>
              {c} <span className="opacity-60">{GRAPHIC_PRESETS.filter((g) => g.cat === c).length}</span>
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {list.slice(0, limit).map((g) => (
          <button key={g.key} onClick={() => put(g)} className="overflow-hidden rounded-lg border border-line bg-white text-left hover:border-signal" title={g.name}>
            <div className={`grid h-[86px] place-items-center p-1 ${isLight(g.colors[0]) ? 'bg-[#334155]' : 'bg-[#F1F5F9]'}`}>
              <GraphicPreview preset={g} />
            </div>
            <span className="block truncate px-2 py-1 text-[11px] font-semibold text-mute">{g.name}</span>
          </button>
        ))}
      </div>
      {!list.length && <p className="text-sm text-mute">No graphics match “{q}”.</p>}
      {limit < list.length && <button onClick={() => setLimit(limit + 48)} className="btn-light mt-3 w-full py-1.5 text-xs">Show more ({list.length - limit} more)</button>}
      <p className="mt-3 text-xs text-mute">Change colours and line thickness on the right after adding. Corner graphics can be flipped to fit any corner.</p>
    </div>
  );
}

// ---------- Edit details: every text and photo frame in one list ----------
export function DetailsPanel({ doc, update, select, fillPhoto }) {
  const texts = doc.elements.filter((e) => e.type === 'text' && !/^\p{Extended_Pictographic}/u.test(e.text || ''));
  const photos = doc.elements.filter((e) => e.type === 'image');
  return (
    <div className="p-4">
      {!!photos.length && (
        <>
          <Title>Photos</Title>
          <div className="space-y-2">
            {photos.map((e) => (
              <div key={e.id} className="flex items-center gap-2 rounded-lg border border-line bg-white p-2">
                <button onClick={() => select([e.id])} className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-paper" aria-label="Select photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {e.src ? <img src={e.src} alt="" className="h-full w-full object-cover" /> : <ImagePlus size={18} className="m-auto mt-3 text-mute" />}
                </button>
                <span className="min-w-0 flex-1 truncate text-xs font-semibold">{e.slot || 'Photo'}</span>
                <button onClick={() => fillPhoto(e.id)} className="btn-light px-2 py-1 text-xs"><Upload size={13} /> {e.src ? 'Replace' : 'Add'}</button>
              </div>
            ))}
          </div>
        </>
      )}
      <Title>Text</Title>
      <div className="space-y-2">
        {texts.map((e) => (
          <div key={e.id}>
            <HinglishTextarea
              className="input text-sm"
              rows={Math.min(4, Math.max(1, Math.ceil((e.text || '').length / 34)))}
              value={e.text}
              onFocus={() => select([e.id])}
              onChange={(v) => update(e.id, { text: v }, 'text')}
              aria-label="Poster text"
              barClassName="mt-1"
            />
          </div>
        ))}
        {!texts.length && <p className="text-sm text-mute">No text on this page yet.</p>}
      </div>
    </div>
  );
}
