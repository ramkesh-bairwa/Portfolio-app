'use client';
import { Fragment, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Copy, GripVertical, Plus, Trash2 } from 'lucide-react';
import { BLOCKS } from '@/lib/blocks';
import { BASE_CSS, outerBg, pageBgCss, renderBlockInner, rootClass, sectionAttrs, sectionShapes, themeFontHref, themeVars } from '@/lib/render';

function useThemeFonts(theme, blocks) {
  const href = themeFontHref(theme, blocks);
  useEffect(() => {
    let l = document.getElementById('folio-theme-fonts');
    if (!l) {
      l = document.createElement('link');
      l.id = 'folio-theme-fonts';
      l.rel = 'stylesheet';
      document.head.appendChild(l);
    }
    if (href) l.href = href;
  }, [href]);
}

function cssText(styleStr) {
  const out = {};
  String(styleStr || '').split(';').filter(Boolean).forEach((decl) => {
    const i = decl.indexOf(':');
    if (i < 0) return;
    const k = decl.slice(0, i).trim();
    const v = decl.slice(i + 1).trim();
    out[k.startsWith('--') ? k : k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v;
  });
  return out;
}

export default function Canvas({ doc, selectedId, onSelect, onDrop, onAction, width, dragging, onAddFirst }) {
  const [dropIndex, setDropIndex] = useState(null);
  useThemeFonts(doc.theme, doc.blocks);
  useEffect(() => { if (!dragging) setDropIndex(null); }, [dragging]);

  const over = (e, i) => {
    e.preventDefault();
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    setDropIndex(e.clientY < r.top + r.height / 2 ? i : i + 1);
  };
  const drop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    const at = dropIndex ?? doc.blocks.length;
    setDropIndex(null);
    onDrop(data, at);
  };
  const Marker = ({ i }) =>
    dropIndex === i ? (
      <div className="pointer-events-none relative z-20 h-0">
        <div className="absolute inset-x-2 -top-[3px] flex h-1.5 items-center rounded-full bg-signal">
          <span className="mx-auto -mt-0.5 rounded-full bg-signal px-2 py-0.5 text-[10px] font-bold text-white">Drop here</span>
        </div>
      </div>
    ) : null;

  return (
    <div
      className="pf-editing mx-auto min-h-full bg-white shadow-[0_20px_60px_-20px_rgba(22,33,62,.35)] transition-[width] duration-300"
      style={{ width, maxWidth: '100%', ...(outerBg(doc.theme) && { background: outerBg(doc.theme), paddingBlock: 1 }) }}
      onDragOver={(e) => { e.preventDefault(); if (!doc.blocks.length) setDropIndex(0); }}
      onDrop={drop}
      onClickCapture={(e) => { if (e.target.closest('a,button[type=submit],summary')) e.preventDefault(); }}
      onSubmitCapture={(e) => e.preventDefault()}
    >
      <style>{BASE_CSS + (doc.theme.customCSS || '')}</style>
      <div className={rootClass(doc.theme)} style={cssText([...Object.entries(themeVars(doc.theme)).map(([k, v]) => `${k}:${v}`), pageBgCss(doc.theme)].filter(Boolean).join(';'))}>
        {!doc.blocks.length && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-10 text-center font-sans text-mute">
            <p className="text-lg font-semibold text-ink">This page is empty</p>
            <p>Drag a block here from the left panel.</p>
            <button className="btn-primary" onClick={onAddFirst}><Plus size={16} /> Add a hero section</button>
          </div>
        )}
        {doc.blocks.map((b, i) => {
          const a = sectionAttrs(b);
          const selected = b.id === selectedId;
          return (
            <Fragment key={b.id}>
              <Marker i={i} />
              <div
                draggable
                onDragStart={(e) => { e.dataTransfer.setData('text/plain', 'move:' + b.id); e.dataTransfer.effectAllowed = 'move'; onAction('dragstart'); }}
                onDragEnd={() => onAction('dragend')}
                onDragOver={(e) => over(e, i)}
                onClick={(e) => { e.stopPropagation(); onSelect(b.id, e.target); }}
                className={`group relative cursor-pointer outline-offset-[-2px] ${selected ? 'outline outline-2 outline-signal' : 'hover:outline hover:outline-1 hover:outline-dashed hover:outline-signal/70'}`}
              >
                <section className={a.cls} id={a.id || undefined} style={cssText(a.style)} dangerouslySetInnerHTML={{ __html: `${sectionShapes(b)}<div class="pf-container">${renderBlockInner(b, doc.theme)}</div>` }} />
                <div className={`absolute right-2 top-2 z-10 flex items-center gap-0.5 rounded-lg bg-ink p-0.5 font-sans text-white shadow-lg ${selected ? 'flex' : 'hidden group-hover:flex'}`}>
                  <span className="flex items-center gap-1 px-1.5 text-[11px] font-semibold"><GripVertical size={12} /> {BLOCKS[b.type]?.label}</span>
                  {[
                    ['up', ArrowUp, 'Move up'],
                    ['down', ArrowDown, 'Move down'],
                    ['duplicate', Copy, 'Duplicate'],
                    ['delete', Trash2, 'Delete'],
                  ].map(([act, Icon, label]) => (
                    <button key={act} title={label} aria-label={label} onClick={(e) => { e.stopPropagation(); onAction(act, b.id); }} className={`rounded-md p-1.5 hover:bg-white/15 ${act === 'delete' ? 'hover:bg-red-500' : ''}`}>
                      <Icon size={13} />
                    </button>
                  ))}
                </div>
              </div>
            </Fragment>
          );
        })}
        <Marker i={doc.blocks.length} />
        {doc.blocks.length > 0 && (
          <div onDragOver={(e) => { e.preventDefault(); setDropIndex(doc.blocks.length); }} className={`h-24 ${dragging ? 'border-2 border-dashed border-signal/40' : ''}`} />
        )}
      </div>
    </div>
  );
}
