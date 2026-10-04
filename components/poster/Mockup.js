'use client';
// See the design as a WhatsApp status, an Instagram post or a printed sheet before downloading
import { useState } from 'react';
import { Heart, MessageCircle, Send, X } from 'lucide-react';
import Stage from './Stage';

function Phone({ children, dark }) {
  return (
    <div className={`relative h-[600px] w-[300px] overflow-hidden rounded-[42px] border-[10px] border-[#111] shadow-2xl ${dark ? 'bg-black' : 'bg-white'}`}>
      <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#111]" />
      {children}
    </div>
  );
}

export default function Mockup({ doc, name, onClose }) {
  const [tab, setTab] = useState('status');
  const fit = (bw, bh) => Math.min(bw / doc.w, bh / doc.h);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4" role="dialog" aria-modal="true" aria-label="Mockup preview" onClick={onClose}>
      <div className="max-h-full w-full max-w-3xl overflow-auto rounded-2xl bg-paper p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex rounded-lg bg-ink/5 p-0.5" role="tablist">
            {[['status', 'WhatsApp status'], ['insta', 'Instagram post'], ['print', 'Printed poster']].map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`rounded-md px-3 py-1.5 text-sm font-semibold ${tab === k ? 'bg-white shadow-sm' : 'text-mute'}`}>{l}</button>
            ))}
          </div>
          <button onClick={onClose} className="btn-ghost px-2" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="grid min-h-[620px] place-items-center rounded-xl bg-[#E7EBF2] p-4">
          {tab === 'status' && (
            <Phone dark>
              <div className="absolute inset-x-3 top-9 z-10 flex gap-1">{[0, 1, 2].map((i) => <span key={i} className={`h-0.5 flex-1 rounded ${i === 0 ? 'bg-white' : 'bg-white/40'}`} />)}</div>
              <div className="absolute inset-x-3 top-12 z-10 flex items-center gap-2 text-white"><span className="h-7 w-7 rounded-full bg-white/30" /><span className="text-xs font-semibold">My status · just now</span></div>
              <div className="grid h-full place-items-center"><Stage doc={doc} scale={fit(280, 580)} /></div>
              <div className="absolute inset-x-0 bottom-3 text-center text-[11px] text-white/70">⌃ Reply</div>
            </Phone>
          )}
          {tab === 'insta' && (
            <Phone>
              <div className="mt-8 flex items-center gap-2 px-3 py-2"><span className="h-7 w-7 rounded-full bg-gradient-to-tr from-amber-400 to-pink-600 p-0.5"><span className="block h-full w-full rounded-full border-2 border-white bg-slate-200" /></span><span className="text-xs font-semibold">{(name || 'yourbrand').toLowerCase().replace(/[^a-z0-9]+/g, '')}</span></div>
              <div className="grid place-items-center bg-black/5"><Stage doc={doc} scale={fit(280, 340)} /></div>
              <div className="flex gap-3 px-3 py-2"><Heart size={20} /><MessageCircle size={20} /><Send size={20} /></div>
              <p className="px-3 text-xs"><b>1,248 likes</b></p>
              <p className="px-3 text-xs"><b>yourbrand</b> {name}</p>
            </Phone>
          )}
          {tab === 'print' && (
            <div className="relative grid h-[580px] w-full place-items-center rounded-lg bg-[linear-gradient(135deg,#d6c7b0,#b9a68a)]">
              <div className="rotate-[-2deg] bg-white p-2 shadow-[0_25px_50px_-12px_rgba(0,0,0,.6)]"><Stage doc={doc} scale={fit(420, 500)} /></div>
            </div>
          )}
        </div>
        <p className="mt-3 text-center text-xs text-mute">This is only a preview. Empty photo frames are hidden in downloads.</p>
      </div>
    </div>
  );
}
