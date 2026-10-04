'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { FONTS, FONT_GROUPS, fontHref, fontStack } from '@/lib/fonts';

export function useAllFonts() {
  useEffect(() => {
    if (document.getElementById('folio-all-fonts')) return;
    const l = document.createElement('link');
    l.id = 'folio-all-fonts';
    l.rel = 'stylesheet';
    l.href = fontHref(FONTS.map((f) => f.name));
    document.head.appendChild(l);
  }, []);
}

export function FontPicker({ label, value, onChange, allowDefault = false, id }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  return (
    <div ref={ref} className="relative">
      {label && <span className="label">{label}</span>}
      <button id={id} type="button" onClick={() => setOpen(!open)} className="input flex items-center justify-between text-left" aria-expanded={open}>
        <span style={{ fontFamily: value ? fontStack(value) : undefined, fontSize: 16 }}>{value || 'Theme font'}</span>
        <ChevronDown size={14} className="text-mute" />
      </button>
      {open && (
        <div className="thin-scroll absolute z-30 mt-1 max-h-80 w-full overflow-y-auto rounded-lg border border-line bg-white p-1 shadow-xl">
          {allowDefault && (
            <button type="button" onClick={() => { onChange(''); setOpen(false); }} className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-paper ${!value ? 'bg-signal-soft' : ''}`}>
              Theme font {!value && <Check size={14} className="text-signal" />}
            </button>
          )}
          {FONT_GROUPS.map(([cat, name]) => (
            <div key={cat}>
              <p className="px-2 pb-1 pt-2 text-[11px] font-semibold text-mute">{name}</p>
              {FONTS.filter((f) => f.category === cat).map((f) => (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => { onChange(f.name); setOpen(false); }}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-paper ${value === f.name ? 'bg-signal-soft' : ''}`}
                >
                  <span style={{ fontFamily: fontStack(f.name), fontSize: 17 }}>{f.name}</span>
                  {value === f.name && <Check size={14} className="text-signal" />}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

