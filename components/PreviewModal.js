'use client';
import { useEffect, useState } from 'react';
import { Monitor, Smartphone, Tablet, X } from 'lucide-react';

export const DEVICES = [
  { key: 'desktop', label: 'Desktop', width: '100%', Icon: Monitor },
  { key: 'tablet', label: 'Tablet', width: '820px', Icon: Tablet },
  { key: 'mobile', label: 'Mobile', width: '390px', Icon: Smartphone },
];

export function DeviceSwitch({ value, onChange, dark = false }) {
  return (
    <div className={`flex rounded-lg p-0.5 ${dark ? 'bg-white/10' : 'bg-ink/5'}`} role="radiogroup" aria-label="Preview size">
      {DEVICES.map(({ key, label, Icon }) => (
        <button
          key={key}
          role="radio"
          aria-checked={value === key}
          title={label}
          onClick={() => onChange(key)}
          className={`rounded-md px-2.5 py-1.5 ${value === key ? (dark ? 'bg-white text-ink' : 'bg-white text-ink shadow-sm') : dark ? 'text-white/70 hover:text-white' : 'text-mute hover:text-ink'}`}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}

export default function PreviewModal({ html, title, onClose, children }) {
  const [device, setDevice] = useState('desktop');
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);
  const width = DEVICES.find((d) => d.key === device).width;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink" role="dialog" aria-modal="true" aria-label={`Preview of ${title}`}>
      <div className="flex h-14 shrink-0 items-center justify-between gap-3 px-4 text-white">
        <div className="min-w-0 truncate font-display text-lg font-semibold">{title}</div>
        <DeviceSwitch value={device} onChange={setDevice} dark />
        <div className="flex items-center gap-2">
          {children}
          <button onClick={onClose} className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white" aria-label="Close preview">
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="flex flex-1 justify-center overflow-hidden bg-[#0f1830] p-3">
        <iframe
          title="Portfolio preview"
          srcDoc={html}
          className="h-full rounded-lg bg-white shadow-2xl transition-[width] duration-300"
          style={{ width, maxWidth: '100%' }}
          sandbox="allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
}
