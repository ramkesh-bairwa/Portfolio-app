'use client';
// Colour field for the poster editor: picker + eyedropper + swatches (brand, this design, recently used)
import { createContext, useContext, useEffect, useState } from 'react';
import { Pipette } from 'lucide-react';
import { ColorInput } from '../builder/fields';

export const SwatchContext = createContext({ design: [], brand: [] });

const RECENT_KEY = 'folio_recent_colors';
const HEX = /^#[0-9a-f]{6}$/i;
export function recentColors() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}
function remember(c) {
  if (!HEX.test(c || '')) return;
  try {
    const list = [c.toUpperCase(), ...recentColors().filter((x) => x.toUpperCase() !== c.toUpperCase())].slice(0, 10);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch { /* storage blocked */ }
}

function Swatches({ label, colors, onPick }) {
  if (!colors.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="w-12 shrink-0 text-[10px] font-semibold uppercase text-mute">{label}</span>
      {colors.map((c) => (
        <button key={c} type="button" title={c} aria-label={`Use ${c}`} onClick={() => onPick(c)} className="h-5 w-5 rounded-md border border-line" style={{ background: c }} />
      ))}
    </div>
  );
}

export default function PosterColor({ label, value, onChange, clear = false }) {
  const { design, brand } = useContext(SwatchContext);
  const [recent, setRecent] = useState([]);
  const [open, setOpen] = useState(false);
  const canPick = typeof window !== 'undefined' && 'EyeDropper' in window;
  useEffect(() => { if (open) setRecent(recentColors()); }, [open]);
  // remember a colour once the user stops changing it
  useEffect(() => {
    const t = setTimeout(() => remember(value), 1200);
    return () => clearTimeout(t);
  }, [value]);

  async function eyedrop() {
    try {
      const r = await new window.EyeDropper().open();
      onChange(r.sRGBHex.length === 7 ? r.sRGBHex.toUpperCase() : r.sRGBHex);
    } catch { /* cancelled */ }
  }
  const pick = (c) => { onChange(c); remember(c); };

  return (
    <div>
      {label && <span className="mb-0.5 block text-[11px] font-semibold text-mute">{label}</span>}
      <div className="flex items-center gap-1">
        <div className="min-w-0 flex-1"><ColorInput value={value} onChange={onChange} allowClear={clear} /></div>
        {canPick && <button type="button" onClick={eyedrop} className="btn-ghost shrink-0 px-2" title="Pick a colour from the screen" aria-label="Eyedropper"><Pipette size={15} /></button>}
        <button type="button" onClick={() => setOpen(!open)} className={`h-8 shrink-0 rounded-md border px-1.5 text-[10px] font-bold ${open ? 'border-signal bg-signal-soft' : 'border-line text-mute'}`} title="Brand, design and recent colours" aria-expanded={open}>
          <span className="grid grid-cols-2 gap-0.5">{[...brand, ...design, '#E2E8F0', '#E2E8F0', '#E2E8F0', '#E2E8F0'].slice(0, 4).map((c, i) => <span key={i} className="h-1.5 w-1.5 rounded-sm" style={{ background: c }} />)}</span>
        </button>
      </div>
      {open && (
        <div className="mt-1.5 space-y-1 rounded-lg border border-line bg-white p-2">
          <Swatches label="Brand" colors={brand} onPick={pick} />
          <Swatches label="Design" colors={design.slice(0, 14)} onPick={pick} />
          <Swatches label="Recent" colors={recent} onPick={pick} />
          {!brand.length && !design.length && !recent.length && <p className="text-xs text-mute">Colours you use will show up here.</p>}
        </div>
      )}
    </div>
  );
}
