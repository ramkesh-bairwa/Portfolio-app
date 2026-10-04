'use client';
import { useRef, useState } from 'react';
import {
  AlignCenter, AlignCenterHorizontal, AlignCenterVertical, AlignEndHorizontal, AlignEndVertical, AlignJustify, AlignLeft, AlignRight,
  AlignStartHorizontal, AlignStartVertical, ArrowDownToLine, ArrowUpToLine, ChevronDown, ChevronUp, Copy, Crop, FlipHorizontal2,
  FlipVertical2, Group, Italic, Link2, Link2Off, Loader2, Lock, Paintbrush, Shuffle, Strikethrough, Trash2, Underline, Ungroup, Unlock, Upload, Wand2,
} from 'lucide-react';
import PosterColor from './PosterColor';
import { fitFontSize, textHeight } from './measure';
import { QR_KINDS } from '@/lib/poster/qr';
import { GRAPHICS } from '@/lib/poster/graphics';
import { findPreset } from '@/lib/poster/graphicsLib';
import { removeBackground } from './removeBg';
import { FORMATS } from '@/lib/poster/formats';
import { SHAPES, SHAPE_KEYS } from '@/lib/poster/shapes';
import { Toggle, rememberUploads, uploadFiles } from '../builder/fields';
import { FontPicker } from '../builder/FontPicker';
import { ICON_NAMES } from './icons';
import { elementLabel } from './Panels';
import { FILTER_DEFAULTS } from './Stage';
import HinglishTextarea from './HinglishTextarea';

function Section({ title, children, open: initial = true }) {
  const [open, setOpen] = useState(initial);
  return (
    <section className="border-b border-line">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold">
        {title} {open ? <ChevronUp size={14} className="text-mute" /> : <ChevronDown size={14} className="text-mute" />}
      </button>
      {open && <div className="space-y-3 px-4 pb-4">{children}</div>}
    </section>
  );
}

function Num({ label, value, onChange, step = 1, min, max, suffix }) {
  return (
    <label className="block">
      <span className="mb-0.5 block text-[11px] font-semibold text-mute">{label}</span>
      <div className="flex items-center rounded-md border border-line bg-white focus-within:border-signal">
        <input type="number" className="w-full min-w-0 rounded-md px-2 py-1 text-sm focus:outline-none" value={Number.isFinite(value) ? Math.round(value * 100) / 100 : ''} step={step} min={min} max={max} onChange={(e) => e.target.value !== '' && onChange(Number(e.target.value))} />
        {suffix && <span className="pr-2 text-xs text-mute">{suffix}</span>}
      </div>
    </label>
  );
}

function Range({ label, value, min, max, step = 1, unit = '', onChange }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold text-mute"><span>{label}</span><span>{Math.round(value * 100) / 100}{unit}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#2F5BFF]" aria-label={label} />
    </div>
  );
}

function Color({ label, value, onChange, clear = false }) {
  return <PosterColor label={label} value={value} onChange={onChange} clear={clear} />;
}

const IconBtn = ({ on, label, onClick, children, danger }) => (
  <button type="button" onClick={onClick} title={label} aria-label={label} aria-pressed={on} className={`grid h-8 flex-1 place-items-center rounded-md border text-sm ${on ? 'border-signal bg-signal-soft text-ink' : 'border-line bg-white text-mute hover:text-ink'} ${danger ? 'hover:text-red-600' : ''}`}>
    {children}
  </button>
);

const SHADOWS = [
  ['None', null],
  ['Soft', { x: 0, y: 6, blur: 18, color: 'rgba(0,0,0,0.3)' }],
  ['Hard', { x: 6, y: 6, blur: 0, color: 'rgba(0,0,0,0.9)' }],
  ['Glow', { x: 0, y: 0, blur: 20, color: 'rgba(255,255,255,0.9)' }],
];
const FILTER_PRESETS = [
  ['Original', {}],
  ['B&W', { grayscale: 100, contrast: 110 }],
  ['Warm', { sepia: 30, saturate: 120, brightness: 105 }],
  ['Cool', { hue: 190, saturate: 80, brightness: 105 }],
  ['Vintage', { sepia: 55, contrast: 90, brightness: 95 }],
  ['Vivid', { saturate: 160, contrast: 115 }],
  ['Faded', { contrast: 80, brightness: 115, saturate: 70 }],
  ['Dramatic', { contrast: 140, brightness: 90, saturate: 110 }],
];
const BG_PRESETS = [
  ['#FF5F6D', '#FFC371'], ['#2193B0', '#6DD5ED'], ['#7C3AED', '#EC4899'], ['#11998E', '#38EF7D'], ['#0F2027', '#2C5364'],
  ['#F12711', '#F5AF19'], ['#FFE0D6', '#FBC2EB'], ['#5B0A1A', '#8B1E2D'], ['#0B1F4D', '#1E40AF'], ['#FDFBFB', '#EBEDEE'],
];
const BLENDS = [['', 'Normal'], ['multiply', 'Multiply'], ['screen', 'Screen'], ['overlay', 'Overlay'], ['darken', 'Darken'], ['lighten', 'Lighten'], ['color-burn', 'Colour burn'], ['difference', 'Difference']];

function Arrange({ el, set, act }) {
  return (
    <Section title="Position & size">
      <div className="grid grid-cols-2 gap-2">
        <Num label="X" value={el.x} onChange={(v) => set({ x: v })} />
        <Num label="Y" value={el.y} onChange={(v) => set({ y: v })} />
        <Num label="Width" value={el.w} min={4} onChange={(v) => set(el.keepRatio ? { w: Math.max(4, v), h: Math.max(4, (v * el.h) / el.w) } : { w: Math.max(4, v) })} />
        <div className="relative">
          <Num label="Height" value={el.h} min={4} onChange={(v) => set(el.keepRatio ? { h: Math.max(4, v), w: Math.max(4, (v * el.w) / el.h) } : { h: Math.max(4, v) })} />
          <button type="button" onClick={() => set({ keepRatio: !el.keepRatio })} title={el.keepRatio ? 'Aspect ratio locked' : 'Lock aspect ratio'} aria-label="Lock aspect ratio" aria-pressed={!!el.keepRatio} className={`absolute -left-3.5 top-6 grid h-5 w-5 place-items-center rounded-full border bg-white ${el.keepRatio ? 'border-signal text-signal' : 'border-line text-mute'}`}>{el.keepRatio ? <Link2 size={11} /> : <Link2Off size={11} />}</button>
        </div>
        <Num label="Rotation" value={el.rot || 0} suffix="°" onChange={(v) => set({ rot: ((v % 360) + 360) % 360 })} />
        <Num label="Opacity" value={Math.round((el.opacity ?? 1) * 100)} min={0} max={100} suffix="%" onChange={(v) => set({ opacity: Math.max(0, Math.min(100, v)) / 100 })} />
      </div>
      <div>
        <span className="mb-1 block text-[11px] font-semibold text-mute">Align to page</span>
        <div className="flex gap-1">
          <IconBtn label="Align left" onClick={() => act('align', 'left')}><AlignStartVertical size={15} /></IconBtn>
          <IconBtn label="Centre horizontally" onClick={() => act('align', 'center')}><AlignCenterVertical size={15} /></IconBtn>
          <IconBtn label="Align right" onClick={() => act('align', 'right')}><AlignEndVertical size={15} /></IconBtn>
          <IconBtn label="Align top" onClick={() => act('align', 'top')}><AlignStartHorizontal size={15} /></IconBtn>
          <IconBtn label="Centre vertically" onClick={() => act('align', 'middle')}><AlignCenterHorizontal size={15} /></IconBtn>
          <IconBtn label="Align bottom" onClick={() => act('align', 'bottom')}><AlignEndHorizontal size={15} /></IconBtn>
        </div>
      </div>
      <div>
        <span className="mb-1 block text-[11px] font-semibold text-mute">Layer & flip</span>
        <div className="flex gap-1">
          <IconBtn label="Bring to front" onClick={() => act('layer', 'front')}><ArrowUpToLine size={15} /></IconBtn>
          <IconBtn label="Bring forward" onClick={() => act('layer', 'up')}><ChevronUp size={15} /></IconBtn>
          <IconBtn label="Send backward" onClick={() => act('layer', 'down')}><ChevronDown size={15} /></IconBtn>
          <IconBtn label="Send to back" onClick={() => act('layer', 'back')}><ArrowDownToLine size={15} /></IconBtn>
          <IconBtn label="Flip horizontally" on={!!el.flipX} onClick={() => set({ flipX: !el.flipX })}><FlipHorizontal2 size={15} /></IconBtn>
          <IconBtn label="Flip vertically" on={!!el.flipY} onClick={() => set({ flipY: !el.flipY })}><FlipVertical2 size={15} /></IconBtn>
        </div>
      </div>
      <div className="flex gap-1">
        <IconBtn label={el.locked ? 'Unlock' : 'Lock'} on={!!el.locked} onClick={() => set({ locked: !el.locked })}>{el.locked ? <Lock size={15} /> : <Unlock size={15} />}</IconBtn>
        <IconBtn label="Duplicate" onClick={() => act('duplicate')}><Copy size={15} /></IconBtn>
        <IconBtn label="Delete" danger onClick={() => act('delete')}><Trash2 size={15} /></IconBtn>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <button type="button" onClick={() => act('copyStyle')} className="btn-light py-1 text-xs" title="Ctrl/⌘ + Alt + C"><Paintbrush size={13} /> Copy style</button>
        <button type="button" onClick={() => act('pasteStyle')} className="btn-light py-1 text-xs" title="Ctrl/⌘ + Alt + V">Paste style</button>
      </div>
      {el.groupId && <button type="button" onClick={() => act('ungroup')} className="btn-light w-full py-1 text-xs"><Ungroup size={13} /> Ungroup</button>}
      <label className="block">
        <span className="mb-0.5 block text-[11px] font-semibold text-mute">Blend mode</span>
        <select className="input py-1.5" value={el.blend || ''} onChange={(e) => set({ blend: e.target.value })}>
          {BLENDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
    </Section>
  );
}

function ShadowControls({ el, set }) {
  return (
    <Section title="Shadow" open={!!el.shadow}>
      <div className="flex gap-1">
        {SHADOWS.map(([l, s]) => (
          <button key={l} type="button" onClick={() => set({ shadow: s })} className={`flex-1 rounded-md border px-1 py-1 text-xs font-semibold ${(!el.shadow && !s) || (el.shadow && s && el.shadow.blur === s.blur && el.shadow.x === s.x) ? 'border-signal bg-signal-soft' : 'border-line bg-white text-mute'}`}>{l}</button>
        ))}
      </div>
      {el.shadow && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Num label="X" value={el.shadow.x} onChange={(v) => set({ shadow: { ...el.shadow, x: v } })} />
            <Num label="Y" value={el.shadow.y} onChange={(v) => set({ shadow: { ...el.shadow, y: v } })} />
            <Num label="Blur" value={el.shadow.blur} min={0} onChange={(v) => set({ shadow: { ...el.shadow, blur: Math.max(0, v) } })} />
          </div>
          <Color label="Shadow colour" value={el.shadow.color} onChange={(v) => set({ shadow: { ...el.shadow, color: v } })} />
        </>
      )}
    </Section>
  );
}

// Grow the text box so the whole arc fits, keeping it centred where it was
function curvePatch(el, v) {
  if (!v) return { curve: 0 };
  const theta = (Math.abs(v) / 100) * Math.PI * 0.95;
  const rad = el.w / 2 / Math.sin(theta / 2);
  const sag = rad - Math.sqrt(Math.max(0, rad * rad - (el.w / 2) ** 2));
  const h = Math.round(Math.max(el.size * 1.3, sag + el.size * 1.5));
  return { curve: v, h, y: Math.round(el.y + (el.h - h) / 2) };
}

function TextControls({ el, set }) {
  return (
    <>
      <Section title="Text">
        <HinglishTextarea className="input text-sm" rows={3} value={el.text} onChange={(v) => set({ text: v }, 'text')} aria-label="Text" barClassName="mt-1" />
        <FontPicker label="Font" value={el.font} onChange={(v) => set({ font: v })} />
        <div className="grid grid-cols-2 gap-2">
          <Num label="Size" value={el.size} min={4} onChange={(v) => set({ size: Math.max(4, v) })} suffix="px" />
          <label className="block">
            <span className="mb-0.5 block text-[11px] font-semibold text-mute">Weight</span>
            <select className="input py-1.5" value={el.weight} onChange={(e) => set({ weight: e.target.value })}>
              {[['300', 'Light'], ['400', 'Regular'], ['500', 'Medium'], ['600', 'Semibold'], ['700', 'Bold'], ['800', 'Extra bold'], ['900', 'Black']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        </div>
        <div className="flex gap-1">
          <IconBtn label="Italic" on={el.italic} onClick={() => set({ italic: !el.italic })}><Italic size={15} /></IconBtn>
          <IconBtn label="Underline" on={el.underline} onClick={() => set({ underline: !el.underline })}><Underline size={15} /></IconBtn>
          <IconBtn label="Strikethrough" on={el.strike} onClick={() => set({ strike: !el.strike })}><Strikethrough size={15} /></IconBtn>
          <IconBtn label="Uppercase" on={el.upper} onClick={() => set({ upper: !el.upper })}><span className="text-xs font-bold">AA</span></IconBtn>
        </div>
        <div className="flex gap-1">
          {[['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight], ['justify', AlignJustify]].map(([a, I]) => (
            <IconBtn key={a} label={`Align ${a}`} on={el.align === a} onClick={() => set({ align: a })}><I size={15} /></IconBtn>
          ))}
        </div>
        <Color label="Colour" value={el.color} onChange={(v) => set({ color: v }, 'color')} />
        <Toggle label="Gradient text" checked={!!el.fill2} onChange={(v) => set({ fill2: v ? '#EC4899' : '' })} />
        {el.fill2 && (
          <>
            <Color label="Gradient to" value={el.fill2} onChange={(v) => set({ fill2: v }, 'fill2')} />
            <Range label="Gradient angle" value={el.gradAngle ?? 90} min={0} max={360} step={5} unit="°" onChange={(v) => set({ gradAngle: v }, 'ga')} />
          </>
        )}
        <div className="grid grid-cols-2 gap-1">
          <button type="button" className="btn-light py-1 text-xs" title="Make the text as big as fits in its box" onClick={() => set({ size: fitFontSize(el) })}>Fit text to box</button>
          <button type="button" className="btn-light py-1 text-xs" title="Make the box exactly as tall as the text" onClick={() => set({ h: Math.ceil(textHeight(el)) + 2 })}>Fit box to text</button>
        </div>
        <Range label="Line height" value={el.lh} min={0.7} max={2.5} step={0.05} onChange={(v) => set({ lh: v }, 'lh')} />
        <Range label="Letter spacing" value={el.ls || 0} min={-0.1} max={0.6} step={0.01} unit="em" onChange={(v) => set({ ls: v }, 'ls')} />
        <Range label="Curve text (arc)" value={el.curve || 0} min={-100} max={100} step={5} onChange={(v) => set(curvePatch(el, v), 'curve')} />
        {!!el.curve && <p className="text-xs text-mute">Curved text shows on one line. Set the curve back to 0 to edit line breaks.</p>}
      </Section>
      <Section title="Outline, 3D & highlight" open={!!(el.bgColor || el.strokeW || el.extrude?.depth)}>
        <Color label="Highlight behind text" value={el.bgColor || ''} clear onChange={(v) => set({ bgColor: v }, 'bgc')} />
        {el.bgColor && (
          <div className="grid grid-cols-2 gap-2">
            <Num label="Padding" value={el.bgPad ?? 0} min={0} onChange={(v) => set({ bgPad: Math.max(0, v) })} />
            <Num label="Corner radius" value={el.bgRadius ?? 8} min={0} onChange={(v) => set({ bgRadius: Math.max(0, v) })} />
          </div>
        )}
        <Color label="Outline colour" value={el.stroke || ''} clear onChange={(v) => set({ stroke: v, strokeW: v ? el.strokeW || Math.max(2, Math.round(el.size * 0.06)) : 0 }, 'stc')} />
        {el.stroke && <Range label="Outline thickness" value={el.strokeW || 0} min={0} max={Math.max(20, Math.round(el.size * 0.2))} step={0.5} unit="px" onChange={(v) => set({ strokeW: v }, 'stw')} />}
        <Toggle label="3D text" checked={!!el.extrude?.depth} onChange={(v) => set({ extrude: v ? { depth: Math.max(3, Math.round(el.size * 0.06)), color: '#000000' } : null })} />
        {el.extrude?.depth > 0 && (
          <>
            <Range label="3D depth" value={el.extrude.depth} min={1} max={Math.max(12, Math.round(el.size * 0.2))} unit="px" onChange={(v) => set({ extrude: { ...el.extrude, depth: v } }, 'exd')} />
            <Color label="3D colour" value={el.extrude.color} onChange={(v) => set({ extrude: { ...el.extrude, color: v } }, 'exc')} />
          </>
        )}
      </Section>
      <ShadowControls el={el} set={set} />
    </>
  );
}

function ShapeControls({ el, set }) {
  return (
    <>
      <Section title="Shape">
        <label className="block">
          <span className="mb-0.5 block text-[11px] font-semibold text-mute">Shape</span>
          <select className="input py-1.5" value={el.shape} onChange={(e) => set({ shape: e.target.value })}>
            {SHAPE_KEYS.map((k) => <option key={k} value={k}>{SHAPES[k].name}</option>)}
          </select>
        </label>
        {el.shape !== 'ring' && <Color label="Fill" value={el.fill} onChange={(v) => set({ fill: v }, 'fill')} />}
        {el.shape !== 'ring' && el.shape !== 'line' && <Toggle label="Gradient fill" checked={!!el.fill2} onChange={(v) => set({ fill2: v ? '#EC4899' : '' })} />}
        {el.fill2 && (
          <>
            <Color label="Gradient to" value={el.fill2} onChange={(v) => set({ fill2: v }, 'fill2')} />
            <Range label="Gradient angle" value={el.gradAngle ?? 135} min={0} max={360} step={5} unit="°" onChange={(v) => set({ gradAngle: v }, 'ga')} />
          </>
        )}
        {el.shape !== 'line' && (
          <>
            <Color label="Border" value={el.stroke || ''} clear onChange={(v) => set({ stroke: v, strokeW: v ? el.strokeW || 4 : 0 }, 'stroke')} />
            {el.stroke && <Range label="Border width" value={el.strokeW || 0} min={0} max={60} unit="px" onChange={(v) => set({ strokeW: v }, 'sw')} />}
            {el.stroke && <Toggle label="Dashed border" checked={!!el.dash} onChange={(v) => set({ dash: v })} />}
          </>
        )}
        {el.shape === 'line' && <Range label="Thickness" value={el.strokeW || 4} min={1} max={60} unit="px" onChange={(v) => set({ strokeW: v }, 'sw')} />}
        {(el.shape === 'rect' || el.shape === 'rounded') && <Range label="Corner radius" value={el.radius || 0} min={0} max={Math.round(Math.min(el.w, el.h) / 2)} unit="px" onChange={(v) => set({ radius: v }, 'radius')} />}
      </Section>
      <ShadowControls el={el} set={set} />
    </>
  );
}

function ImageControls({ el, set, cropping, setCropping }) {
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);
  const f = { ...FILTER_DEFAULTS, ...(el.filters || {}) };
  const setF = (k, v) => set({ filters: { ...f, [k]: v } }, `f.${k}`);
  const [cutting, setCutting] = useState(false);
  async function cutout() {
    setCutting(true);
    try {
      const file = await removeBackground(el.src);
      const [u] = await uploadFiles([file]);
      rememberUploads([u]);
      set({ src: u, fit: 'contain', mask: 'none', radius: 0, outline: el.outline?.width ? el.outline : { width: Math.max(4, Math.round(Math.min(el.w, el.h) * 0.012)), color: '#FFFFFF' } });
    } catch (e) {
      alert(e.message || 'Could not remove the background. Try another photo.');
    } finally {
      setCutting(false);
    }
  }
  async function replace(files) {
    const file = Array.from(files || []).find((x) => x.type.startsWith('image/'));
    if (!file) return;
    setBusy(true);
    try {
      const [u] = await uploadFiles([file]);
      rememberUploads([u]);
      set({ src: u, cropX: 50, cropY: 50, zoom: 1 });
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Section title="Image">
        <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => { replace(e.target.files); e.target.value = ''; }} />
        {!el.src && (
          <button type="button" onClick={() => ref.current?.click()} className="btn-primary w-full py-2">{busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Add {el.slot ? el.slot.toLowerCase() : 'photo'}</button>
        )}
        {el.src && (
          <button type="button" onClick={cutout} disabled={cutting} className="btn-sun w-full py-2 text-sm">
            {cutting ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />} {cutting ? 'Removing background…' : 'Remove background'}
          </button>
        )}
        {cutting && <p className="text-xs text-mute">The first time takes a little longer while the tool downloads.</p>}
        <div className="flex gap-2">
          <button type="button" onClick={() => ref.current?.click()} className="btn-light flex-1 py-1.5 text-sm">{busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Replace</button>
          <button type="button" onClick={() => setCropping(!cropping)} className={`flex-1 py-1.5 text-sm ${cropping ? 'btn-primary' : 'btn-light'}`}><Crop size={14} /> {cropping ? 'Done' : 'Crop'}</button>
        </div>
        {cropping && <p className="rounded-md bg-signal-soft p-2 text-xs">Drag the photo to move it inside the frame. Scroll or use Zoom to crop tighter.</p>}
        <Range label="Zoom (crop)" value={el.zoom || 1} min={1} max={4} step={0.05} unit="×" onChange={(v) => set({ zoom: v }, 'zoom')} />
        <div className="grid grid-cols-2 gap-2">
          <Range label="Focus left–right" value={el.cropX ?? 50} min={0} max={100} unit="%" onChange={(v) => set({ cropX: v }, 'cx')} />
          <Range label="Focus top–bottom" value={el.cropY ?? 50} min={0} max={100} unit="%" onChange={(v) => set({ cropY: v }, 'cy')} />
        </div>
        <label className="block">
          <span className="mb-0.5 block text-[11px] font-semibold text-mute">Frame shape</span>
          <select className="input py-1.5" value={el.mask || 'none'} onChange={(e) => set({ mask: e.target.value })}>
            <option value="none">Square / rounded</option>
            <option value="circle">Circle</option>
            {['arch', 'hexagon', 'heart', 'star', 'blob', 'diamond', 'pentagon', 'octagon', 'triangle', 'burst', 'seal', 'bubble'].map((k) => <option key={k} value={k}>{SHAPES[k].name}</option>)}
          </select>
        </label>
        {(!el.mask || el.mask === 'none') && <Range label="Corner radius" value={el.radius || 0} min={0} max={Math.round(Math.min(el.w, el.h) / 2)} unit="px" onChange={(v) => set({ radius: v }, 'radius')} />}
        <div className="grid grid-cols-2 gap-2">
          <ChoiceSmall value={el.fit || 'cover'} onChange={(v) => set({ fit: v })} options={[['cover', 'Fill frame'], ['contain', 'Show all']]} />
        </div>
        <Color label="Border" value={el.stroke || ''} clear onChange={(v) => set({ stroke: v, strokeW: v ? el.strokeW || 6 : 0 }, 'stroke')} />
        {el.stroke && <Range label="Border width" value={el.strokeW || 0} min={0} max={60} unit="px" onChange={(v) => set({ strokeW: v }, 'sw')} />}
        <Toggle label="Cut-out outline (sticker edge)" checked={!!el.outline?.width} onChange={(v) => set({ outline: v ? { width: Math.max(4, Math.round(Math.min(el.w, el.h) * 0.012)), color: '#FFFFFF' } : null })} />
        {el.outline?.width > 0 && (
          <>
            <Range label="Outline thickness" value={el.outline.width} min={1} max={40} unit="px" onChange={(v) => set({ outline: { ...el.outline, width: v } }, 'olw')} />
            <Color label="Outline colour" value={el.outline.color} onChange={(v) => set({ outline: { ...el.outline, color: v } }, 'olc')} />
          </>
        )}
      </Section>
      <Section title="Colour overlay & fade" open={!!(el.tint?.strength || el.fade?.strength)}>
        <Toggle label="Colour tint" checked={!!el.tint?.strength} onChange={(v) => set({ tint: v ? { color: '#FF7A00', strength: 45, mode: 'color' } : null })} />
        {el.tint?.strength > 0 && (
          <>
            <Color label="Tint colour" value={el.tint.color} onChange={(v) => set({ tint: { ...el.tint, color: v } }, 'tc')} />
            <Range label="Strength" value={el.tint.strength} min={5} max={100} unit="%" onChange={(v) => set({ tint: { ...el.tint, strength: v } }, 'ts')} />
            <div className="grid grid-cols-3 gap-1">{[['color', 'Colour'], ['multiply', 'Darker'], ['screen', 'Lighter']].map(([m, l]) => <ChoiceSmall key={m} value={el.tint.mode} onChange={(v) => set({ tint: { ...el.tint, mode: v } })} options={[[m, l]]} />)}</div>
          </>
        )}
        <Toggle label="Fade into colour" checked={!!el.fade?.strength} onChange={(v) => set({ fade: v ? { color: '#000000', strength: 60, side: 'bottom' } : null })} />
        {el.fade?.strength > 0 && (
          <>
            <Color label="Fade colour" value={el.fade.color} onChange={(v) => set({ fade: { ...el.fade, color: v } }, 'fc')} />
            <Range label="Fade amount" value={el.fade.strength} min={10} max={100} unit="%" onChange={(v) => set({ fade: { ...el.fade, strength: v } }, 'fs')} />
            <div className="grid grid-cols-4 gap-1">{['bottom', 'top', 'left', 'right'].map((sd) => <ChoiceSmall key={sd} value={el.fade.side} onChange={(v) => set({ fade: { ...el.fade, side: v } })} options={[[sd, sd[0].toUpperCase() + sd.slice(1)]]} />)}</div>
          </>
        )}
      </Section>
      <Section title="Filters & adjustments" open={false}>
        <div className="grid grid-cols-4 gap-1">
          {FILTER_PRESETS.map(([l, v]) => (
            <button key={l} type="button" onClick={() => set({ filters: v })} className="rounded-md border border-line bg-white px-1 py-1 text-[11px] font-semibold hover:border-signal">{l}</button>
          ))}
        </div>
        <Range label="Brightness" value={f.brightness} min={0} max={200} unit="%" onChange={(v) => setF('brightness', v)} />
        <Range label="Contrast" value={f.contrast} min={0} max={200} unit="%" onChange={(v) => setF('contrast', v)} />
        <Range label="Saturation" value={f.saturate} min={0} max={300} unit="%" onChange={(v) => setF('saturate', v)} />
        <Range label="Blur" value={f.blur} min={0} max={20} step={0.5} unit="px" onChange={(v) => setF('blur', v)} />
        <Range label="Black & white" value={f.grayscale} min={0} max={100} unit="%" onChange={(v) => setF('grayscale', v)} />
        <Range label="Sepia" value={f.sepia} min={0} max={100} unit="%" onChange={(v) => setF('sepia', v)} />
        <Range label="Hue" value={f.hue} min={0} max={360} unit="°" onChange={(v) => setF('hue', v)} />
      </Section>
      <ShadowControls el={el} set={set} />
    </>
  );
}

function ChoiceSmall({ value, onChange, options }) {
  return options.map(([v, l]) => (
    <button key={v} type="button" onClick={() => onChange(v)} className={`rounded-md border px-2 py-1 text-xs font-semibold ${value === v ? 'border-signal bg-signal-soft' : 'border-line bg-white text-mute'}`}>{l}</button>
  ));
}

function IconControls({ el, set }) {
  return (
    <>
      <Section title="Icon">
        <label className="block">
          <span className="mb-0.5 block text-[11px] font-semibold text-mute">Icon</span>
          <select className="input py-1.5" value={el.icon} onChange={(e) => set({ icon: e.target.value })}>
            {ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <Color label="Colour" value={el.color} onChange={(v) => set({ color: v }, 'color')} />
        <Range label="Line thickness" value={el.strokeW || 2} min={0.5} max={4} step={0.25} onChange={(v) => set({ strokeW: v }, 'sw')} />
        <Toggle label="Filled" checked={!!el.filled} onChange={(v) => set({ filled: v })} />
      </Section>
      <ShadowControls el={el} set={set} />
    </>
  );
}

// Families drawn with lines get a thickness slider; some also offer solid / dashed
const LINE_FAMILIES = new Set(['wave', 'zigzag', 'curve', 'spiral', 'loops', 'scribble', 'parallel', 'divider', 'frame', 'corner', 'arrow']);
const DASH_FAMILIES = new Set(['wave', 'curve', 'arrow']);
function GraphicControls({ el, set }) {
  const preset = findPreset(el.preset);
  const base = GRAPHICS[el.graphic]?.colors || preset?.colors || [];
  const colors = base.map((c, i) => (el.colors && el.colors[i]) || c);
  const params = el.params || {};
  return (
    <>
      <Section title={preset?.name || GRAPHICS[el.graphic]?.name || 'Graphic'}>
        {colors.map((c, i) => (
          <Color key={i} label={`Colour ${i + 1}`} value={c} onChange={(v) => { const next = [...colors]; next[i] = v; set({ colors: next }, `gc${i}`); }} />
        ))}
        {LINE_FAMILIES.has(el.graphic) && <Range label="Line thickness" value={params.sw || 1} min={0.3} max={4} step={0.1} unit="×" onChange={(v) => set({ params: { ...params, sw: v } }, 'gsw')} />}
        {DASH_FAMILIES.has(el.graphic) && (
          <div className="grid grid-cols-3 gap-1">
            {[['single', 'Solid'], ['dashed', 'Dashed'], ['dotted', 'Dotted']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => set({ params: { ...params, style: v } })} className={`rounded-md border px-1 py-1 text-xs font-semibold ${(params.style || 'single') === v || (v === 'single' && ['double', 'triple'].includes(params.style)) ? 'border-signal bg-signal-soft' : 'border-line bg-white text-mute'}`}>{l}</button>
            ))}
          </div>
        )}
        <button type="button" onClick={() => set({ seed: Math.floor(Math.random() * 100000) })} className="btn-light w-full py-1.5 text-sm"><Shuffle size={14} /> Shuffle pattern</button>
      </Section>
      <ShadowControls el={el} set={set} />
    </>
  );
}

function QrControls({ el, set }) {
  const q = el.qr || { kind: 'link' };
  const setQ = (patch) => set({ qr: { ...q, ...patch } }, 'qr');
  const field = (k, label, ph) => (
    <label key={k} className="block">
      <span className="mb-0.5 block text-[11px] font-semibold text-mute">{label}</span>
      <input className="input py-1.5 text-sm" value={q[k] || ''} placeholder={ph} onChange={(e) => setQ({ [k]: e.target.value })} />
    </label>
  );
  const fields = {
    link: [['url', 'Link', 'https://yourwebsite.com']],
    upi: [['upi', 'UPI ID', 'yourname@upi'], ['name', 'Name shown', 'Your Shop'], ['amount', 'Amount (optional)', '499'], ['note', 'Note (optional)', 'Order #12']],
    whatsapp: [['phone', 'WhatsApp number', '98765 43210'], ['message', 'Message (optional)', 'Hi, I saw your poster']],
    phone: [['phone', 'Phone number', '+91 98765 43210']],
    email: [['email', 'Email', 'you@example.com'], ['subject', 'Subject (optional)', 'Enquiry']],
    text: [['text', 'Text', 'Any text']],
  }[q.kind] || [];
  return (
    <Section title="QR code">
      <label className="block">
        <span className="mb-0.5 block text-[11px] font-semibold text-mute">QR code for</span>
        <select className="input py-1.5" value={q.kind} onChange={(e) => setQ({ kind: e.target.value })}>{QR_KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
      </label>
      {fields.map(([k, l, ph]) => field(k, l, ph))}
      <p className="text-xs text-mute">Test it with your phone camera before printing.</p>
      <Color label="Code colour" value={el.fg || '#111111'} onChange={(v) => set({ fg: v }, 'qfg')} />
      <Color label="Background" value={el.bg || '#FFFFFF'} onChange={(v) => set({ bg: v }, 'qbg')} />
      <div className="grid grid-cols-3 gap-1">{[['square', 'Square'], ['rounded', 'Rounded'], ['dots', 'Dots']].map(([k, l]) => <ChoiceSmall key={k} value={el.dots || 'square'} onChange={(v) => set({ dots: v })} options={[[k, l]]} />)}</div>
      <Range label="White border" value={el.margin ?? 2} min={0} max={6} onChange={(v) => set({ margin: v }, 'qm')} />
    </Section>
  );
}

// Custom curve: style, smoothness and its layers (each with colour, gradient, offset and shadow)
function CurveControls({ el, set, act }) {
  const layers = el.layers || [];
  const setLayer = (i, patch, mk) => set({ layers: layers.map((l, k) => (k === i ? { ...l, ...patch } : l)) }, mk && `cl${i}${mk}`);
  const move = (i, dir) => { const j = i + dir; if (j < 0 || j >= layers.length) return; const next = [...layers]; [next[i], next[j]] = [next[j], next[i]]; set({ layers: next }); };
  const D = Math.min(el.vw || el.w, el.vh || el.h);
  return (
    <>
      <Section title="Curve">
        <button type="button" onClick={() => act('editPoints')} className="btn-primary w-full py-1.5 text-sm">Edit points on the page</button>
        <p className="text-xs text-mute">Drag points to reshape. Alt-click the curve to add a point, double-click a point to remove it.</p>
        <div className="grid grid-cols-3 gap-1">{[['line', 'Line'], ['fill', 'Filled band'], ['closed', 'Closed shape']].map(([k, l]) => <ChoiceSmall key={k} value={el.mode} onChange={(v) => set({ mode: v })} options={[[k, l]]} />)}</div>
        {el.mode === 'fill' && (
          <div>
            <span className="mb-1 block text-[11px] font-semibold text-mute">Fill towards</span>
            <div className="grid grid-cols-4 gap-1">{['bottom', 'top', 'left', 'right'].map((k) => <ChoiceSmall key={k} value={el.fillTo || 'bottom'} onChange={(v) => set({ fillTo: v })} options={[[k, k[0].toUpperCase() + k.slice(1)]]} />)}</div>
          </div>
        )}
        {el.mode === 'fill' && <Toggle label="Stretch to page edges" checked={el.extend !== false} onChange={(v) => set({ extend: v })} />}
        <Range label="Smoothness" value={el.tension ?? 0.5} min={0} max={1} step={0.05} onChange={(v) => set({ tension: v }, 'tension')} />
        {el.mode === 'line' && (
          <>
            <Toggle label="Dashed line" checked={!!el.dash} onChange={(v) => set({ dash: v })} />
            <div className="grid grid-cols-3 gap-1">{[['round', 'Round ends'], ['butt', 'Flat ends'], ['square', 'Square ends']].map(([k, l]) => <ChoiceSmall key={k} value={el.cap || 'round'} onChange={(v) => set({ cap: v })} options={[[k, l]]} />)}</div>
          </>
        )}
        <button type="button" onClick={() => set({ points: [...el.points].reverse().map((p) => ({ x: (el.vw || el.w) - p.x, y: p.y })) })} className="btn-light w-full py-1 text-xs">Mirror left ↔ right</button>
      </Section>
      <Section title={`Layers (${layers.length})`}>
        <p className="text-xs text-mute">The first layer is on top. Offset layers to stack bands, like a tricolour swoosh.</p>
        {layers.map((L, i) => (
          <div key={L.id || i} className="space-y-2 rounded-lg border border-line bg-white p-2.5">
            <div className="flex items-center gap-1">
              <span className="h-4 w-4 rounded" style={{ background: L.color2 ? `linear-gradient(90deg, ${L.color}, ${L.color2})` : L.color }} />
              <b className="flex-1 text-xs">Layer {i + 1}</b>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="btn-ghost px-1" aria-label="Move layer up"><ChevronUp size={13} /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === layers.length - 1} className="btn-ghost px-1" aria-label="Move layer down"><ChevronDown size={13} /></button>
              <button type="button" onClick={() => set({ layers: [...layers.slice(0, i + 1), { ...JSON.parse(JSON.stringify(L)), id: Math.random().toString(36).slice(2), dy: (L.dy || 0) + Math.round(D * 0.03) }, ...layers.slice(i + 1)] })} className="btn-ghost px-1" aria-label="Duplicate layer"><Copy size={13} /></button>
              <button type="button" onClick={() => set({ layers: layers.filter((_, k) => k !== i) })} disabled={layers.length < 2} className="btn-ghost px-1 hover:text-red-600" aria-label="Delete layer"><Trash2 size={13} /></button>
            </div>
            <Color label="Colour" value={L.color} onChange={(v) => setLayer(i, { color: v }, 'c')} />
            <Toggle label="Gradient" checked={!!L.color2} onChange={(v) => setLayer(i, { color2: v ? '#EC4899' : '' })} />
            {L.color2 && (
              <>
                <Color label="Gradient to" value={L.color2} onChange={(v) => setLayer(i, { color2: v }, 'c2')} />
                <Range label="Gradient angle" value={L.angle ?? 90} min={0} max={360} step={5} unit="°" onChange={(v) => setLayer(i, { angle: v }, 'ang')} />
              </>
            )}
            {el.mode === 'line' && <Range label="Thickness" value={L.width || 8} min={1} max={Math.round(D * 0.2)} unit="px" onChange={(v) => setLayer(i, { width: v }, 'w')} />}
            <div className="grid grid-cols-2 gap-2">
              <Num label="Offset X" value={L.dx || 0} onChange={(v) => setLayer(i, { dx: v }, 'dx')} />
              <Num label="Offset Y" value={L.dy || 0} onChange={(v) => setLayer(i, { dy: v }, 'dy')} />
            </div>
            <Range label="Opacity" value={Math.round((L.opacity ?? 1) * 100)} min={5} max={100} unit="%" onChange={(v) => setLayer(i, { opacity: v / 100 }, 'op')} />
            <Toggle label="Shadow" checked={!!L.shadow?.on} onChange={(v) => setLayer(i, { shadow: { x: 0, y: 8, blur: 14, color: '#000000', opacity: 35, ...(L.shadow || {}), on: v } })} />
            {L.shadow?.on && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <Num label="X" value={L.shadow.x ?? 0} onChange={(v) => setLayer(i, { shadow: { ...L.shadow, x: v } }, 'sx')} />
                  <Num label="Y" value={L.shadow.y ?? 8} onChange={(v) => setLayer(i, { shadow: { ...L.shadow, y: v } }, 'sy')} />
                  <Num label="Blur" value={L.shadow.blur ?? 14} min={0} onChange={(v) => setLayer(i, { shadow: { ...L.shadow, blur: Math.max(0, v) } }, 'sb')} />
                </div>
                <Range label="Shadow strength" value={L.shadow.opacity ?? 35} min={5} max={100} unit="%" onChange={(v) => setLayer(i, { shadow: { ...L.shadow, opacity: v } }, 'so')} />
                <Color label="Shadow colour" value={L.shadow.color || '#000000'} onChange={(v) => setLayer(i, { shadow: { ...L.shadow, color: v } }, 'sc')} />
              </>
            )}
            {el.mode !== 'line' && <Color label="Edge line (optional)" value={L.border || ''} clear onChange={(v) => setLayer(i, { border: v, borderW: L.borderW || 4 }, 'bd')} />}
          </div>
        ))}
        <button type="button" onClick={() => { const last = layers[layers.length - 1] || {}; set({ layers: [...layers, { id: Math.random().toString(36).slice(2), color: '#F59E0B', color2: '', angle: 90, opacity: 1, dx: last.dx || 0, dy: (last.dy || 0) - Math.round(D * 0.035), width: last.width || 10, shadow: { on: true, x: 0, y: 8, blur: 14, color: '#000000', opacity: 30 } }] }); }} className="btn-light w-full py-1.5 text-sm">+ Add layer</button>
      </Section>
    </>
  );
}

function PageControls({ doc, setDoc, resize, uploadBg }) {
  const bg = doc.bg || {};
  const setBg = (patch, mk) => setDoc({ ...doc, bg: { ...bg, ...patch } }, mk);
  const [cw, setCw] = useState(doc.w);
  const [ch, setCh] = useState(doc.h);
  const ref = useRef(null);
  return (
    <>
      <Section title="Design">
        <label className="block">
          <span className="mb-0.5 block text-[11px] font-semibold text-mute">Name</span>
          <input className="input py-1.5" value={doc.name} onChange={(e) => setDoc({ ...doc, name: e.target.value }, 'name')} />
        </label>
        <label className="block">
          <span className="mb-0.5 block text-[11px] font-semibold text-mute">Size (content is scaled to fit)</span>
          <select className="input py-1.5" value={FORMATS.some((f) => f.key === doc.format) ? doc.format : 'custom'} onChange={(e) => { const f = FORMATS.find((x) => x.key === e.target.value); if (f) { resize(f.key, f.w, f.h); setCw(f.w); setCh(f.h); } }}>
            {['Print', 'Social', 'Ads'].map((g) => (
              <optgroup key={g} label={g}>{FORMATS.filter((f) => f.group === g).map((f) => <option key={f.key} value={f.key}>{f.name} ({f.w}×{f.h})</option>)}</optgroup>
            ))}
            <option value="custom">Custom size</option>
          </select>
        </label>
        <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
          <Num label="Width" value={cw} min={50} max={8000} onChange={setCw} suffix="px" />
          <Num label="Height" value={ch} min={50} max={8000} onChange={setCh} suffix="px" />
          <button type="button" className="btn-light px-2 py-1 text-xs" onClick={() => resize('custom', Math.max(50, Math.min(8000, cw)), Math.max(50, Math.min(8000, ch)))}>Apply</button>
        </div>
      </Section>
      <Section title="Background">
        <div className="grid grid-cols-4 gap-1">
          {[['solid', 'Colour'], ['gradient', 'Gradient'], ['radial', 'Radial'], ['image', 'Image']].map(([v, l]) => (
            <button key={v} type="button" onClick={() => setBg({ type: v, from: bg.from || bg.color, to: bg.to || '#E2E8F0' })} className={`rounded-md border px-1 py-1 text-xs font-semibold ${(bg.type || 'solid') === v ? 'border-signal bg-signal-soft' : 'border-line bg-white text-mute'}`}>{l}</button>
          ))}
        </div>
        {(bg.type || 'solid') === 'solid' && <Color label="Colour" value={bg.color} onChange={(v) => setBg({ color: v }, 'bgc')} />}
        {(bg.type === 'gradient' || bg.type === 'radial') && (
          <>
            <div className="grid grid-cols-5 gap-1">
              {BG_PRESETS.map(([a, b]) => (
                <button key={a + b} type="button" onClick={() => setBg({ from: a, to: b, color: a })} className="h-8 rounded-md border border-line" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} aria-label="Gradient preset" />
              ))}
            </div>
            <Color label="From" value={bg.from} onChange={(v) => setBg({ from: v, color: v }, 'bgf')} />
            <Color label="To" value={bg.to} onChange={(v) => setBg({ to: v }, 'bgt')} />
            {bg.type === 'gradient' && <Range label="Angle" value={bg.angle ?? 135} min={0} max={360} step={5} unit="°" onChange={(v) => setBg({ angle: v }, 'bga')} />}
          </>
        )}
        {bg.type === 'image' && (
          <>
            <input ref={ref} type="file" accept="image/*" hidden onChange={async (e) => { const u = await uploadBg(e.target.files); if (u) setBg({ image: u }); e.target.value = ''; }} />
            <button type="button" onClick={() => ref.current?.click()} className="btn-light w-full py-1.5 text-sm"><Upload size={14} /> {bg.image ? 'Replace background photo' : 'Upload background photo'}</button>
            <Range label="Darken" value={bg.overlay || 0} min={0} max={85} step={5} unit="%" onChange={(v) => setBg({ overlay: v }, 'bgo')} />
            <Color label="Colour behind photo" value={bg.color} onChange={(v) => setBg({ color: v }, 'bgc')} />
          </>
        )}
      </Section>
    </>
  );
}

function MultiControls({ count, act, grouped }) {
  return (
    <Section title={grouped ? `Group of ${count}` : `${count} items selected`}>
      <div>
        <span className="mb-1 block text-[11px] font-semibold text-mute">Align to each other</span>
        <div className="flex gap-1">
          <IconBtn label="Align left" onClick={() => act('align', 'left')}><AlignStartVertical size={15} /></IconBtn>
          <IconBtn label="Align centres" onClick={() => act('align', 'center')}><AlignCenterVertical size={15} /></IconBtn>
          <IconBtn label="Align right" onClick={() => act('align', 'right')}><AlignEndVertical size={15} /></IconBtn>
          <IconBtn label="Align top" onClick={() => act('align', 'top')}><AlignStartHorizontal size={15} /></IconBtn>
          <IconBtn label="Align middles" onClick={() => act('align', 'middle')}><AlignCenterHorizontal size={15} /></IconBtn>
          <IconBtn label="Align bottom" onClick={() => act('align', 'bottom')}><AlignEndHorizontal size={15} /></IconBtn>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className="btn-light py-1.5 text-xs" onClick={() => act('distribute', 'x')}>Space evenly ↔</button>
        <button type="button" className="btn-light py-1.5 text-xs" onClick={() => act('distribute', 'y')}>Space evenly ↕</button>
      </div>
      <div>
        <span className="mb-1 block text-[11px] font-semibold text-mute">Make the same size as the first selected</span>
        <div className="grid grid-cols-3 gap-1">
          <button type="button" className="btn-light py-1 text-xs" onClick={() => act('match', 'w')}>Width</button>
          <button type="button" className="btn-light py-1 text-xs" onClick={() => act('match', 'h')}>Height</button>
          <button type="button" className="btn-light py-1 text-xs" onClick={() => act('match', 'both')}>Both</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <button type="button" className="btn-primary py-1.5 text-xs" onClick={() => act('group')} title="Ctrl/⌘ + G"><Group size={14} /> Group</button>
        <button type="button" className="btn-light py-1.5 text-xs" onClick={() => act('ungroup')} title="Ctrl/⌘ + Shift + G"><Ungroup size={14} /> Ungroup</button>
      </div>
      <button type="button" className="btn-light w-full py-1 text-xs" onClick={() => act('pasteStyle')}>Paste style on all</button>
      <div className="flex gap-1">
        <IconBtn label="Lock all" onClick={() => act('lock')}><Lock size={15} /></IconBtn>
        <IconBtn label="Duplicate" onClick={() => act('duplicate')}><Copy size={15} /></IconBtn>
        <IconBtn label="Delete" danger onClick={() => act('delete')}><Trash2 size={15} /></IconBtn>
      </div>
    </Section>
  );
}

export default function Inspector({ doc, selected, update, act, setDoc, resize, cropping, setCropping, uploadBg }) {
  const els = doc.elements.filter((e) => selected.includes(e.id));
  if (!els.length) return <PageControls key={doc.w + 'x' + doc.h} doc={doc} setDoc={setDoc} resize={resize} uploadBg={uploadBg} />;
  if (els.length > 1) return <MultiControls count={els.length} act={act} grouped={!!els[0].groupId && els.every((e) => e.groupId === els[0].groupId)} />;
  const el = els[0];
  const set = (patch, mk) => update(el.id, patch, mk);
  return (
    <div key={el.id}>
      <p className="truncate border-b border-line px-4 py-3 text-sm font-semibold">{elementLabel(el)}</p>
      {el.type === 'text' && <TextControls el={el} set={set} />}
      {el.type === 'shape' && <ShapeControls el={el} set={set} />}
      {el.type === 'image' && <ImageControls el={el} set={set} cropping={cropping} setCropping={setCropping} />}
      {el.type === 'icon' && <IconControls el={el} set={set} />}
      {el.type === 'graphic' && <GraphicControls el={el} set={set} />}
      {el.type === 'qr' && <QrControls el={el} set={set} />}
      {el.type === 'curve' && <CurveControls el={el} set={set} act={act} />}
      <Arrange el={el} set={set} act={act} />
    </div>
  );
}
