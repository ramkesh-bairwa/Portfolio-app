'use client';
import { useMemo, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { DECORS, EDGES, EDGE_GROUPS, decorSvg, edgeSvg, getDecor, getEdge } from '@/lib/shapes';

function EdgePreview({ shape, className = 'h-12' }) {
  return (
    <span className={`block overflow-hidden rounded-md bg-signal ${className}`}>
      <span className="flex h-full flex-col justify-end text-white">
        <span className="block h-[78%]" dangerouslySetInnerHTML={{ __html: edgeSvg(shape, ' style="width:100%;height:100%;display:block"') }} />
      </span>
    </span>
  );
}

function DecorPreview({ shape, className = 'h-12' }) {
  return <span className={`grid place-items-center rounded-md bg-paper p-1.5 text-coral ${className}`} dangerouslySetInnerHTML={{ __html: decorSvg(shape, ' style="height:100%;width:auto;display:block"') }} />;
}

// Visual picker for curved section edges (kind="edge") or background decor shapes (kind="decor")
export default function ShapePicker({ id, kind, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState('All');
  const isEdge = kind === 'edge';
  const current = isEdge ? getEdge(value) : getDecor(value);
  const groups = isEdge ? ['All', ...EDGE_GROUPS] : [];
  const items = useMemo(() => (isEdge ? EDGES.filter((e) => group === 'All' || e.group === group) : DECORS), [isEdge, group]);
  const Preview = isEdge ? EdgePreview : DecorPreview;

  return (
    <div>
      <div className="flex gap-1.5">
        <button id={id} type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-white p-1.5 text-left text-xs font-semibold hover:border-ink/40">
          {current ? <Preview shape={current} className={isEdge ? 'h-7 w-16 shrink-0' : 'h-7 w-7 shrink-0'} /> : <span className="h-7 w-7 shrink-0 rounded-md border border-dashed border-line" />}
          <span className="min-w-0 flex-1 truncate">{current ? current.name : 'None'}</span>
          <ChevronDown size={14} className={`shrink-0 text-mute transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {current && (
          <button type="button" onClick={() => onChange('')} className="rounded-lg border border-line bg-white px-2 text-mute hover:text-ink" aria-label="Remove shape"><X size={14} /></button>
        )}
      </div>
      {open && (
        <div className="mt-2 rounded-lg border border-line bg-white p-2">
          {groups.length > 0 && (
            <div className="no-scrollbar -mx-0.5 mb-2 flex gap-1 overflow-x-auto pb-0.5">
              {groups.map((g) => (
                <button key={g} type="button" onClick={() => setGroup(g)} className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${group === g ? 'bg-ink text-white' : 'bg-paper text-mute hover:text-ink'}`}>{g}</button>
              ))}
            </div>
          )}
          <div className={`thin-scroll grid max-h-72 gap-1.5 overflow-y-auto pr-0.5 ${isEdge ? 'grid-cols-2' : 'grid-cols-4'}`} role="radiogroup">
            {items.map((s) => (
              <button
                key={s.key}
                type="button"
                role="radio"
                aria-checked={value === s.key}
                title={s.name}
                onClick={() => { onChange(s.key); setOpen(false); }}
                className={`rounded-lg border p-1 text-left transition ${value === s.key ? 'border-signal ring-2 ring-signal/30' : 'border-transparent hover:border-ink/30'}`}
              >
                <Preview shape={s} />
                {isEdge && <span className="mt-1 block truncate px-0.5 text-[10px] font-semibold text-mute">{s.name}</span>}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-mute">{isEdge ? `${EDGES.length} curved edges · filled with the edge colour` : `${DECORS.length} shapes · brand colour unless you pick one`}</p>
        </div>
      )}
    </div>
  );
}
