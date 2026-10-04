'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { fontHref } from '@/lib/fonts';
import { RESUME_DESIGNS } from '@/lib/resume/designs';
import { PAPER, RESUME_CSS, fullResumeTheme, resumeBody } from '@/lib/resume/render';

const MM = 96 / 25.4; // css px per millimetre

// Loads every font the resume designs use (once per page) and the resume stylesheet
export function ResumeAssets({ extraFonts = [] }) {
  const href = useMemo(() => fontHref([...new Set([...RESUME_DESIGNS.flatMap((d) => [d.theme.headingFont, d.theme.bodyFont]), ...extraFonts])]), [extraFonts]);
  useEffect(() => {
    let l = document.getElementById('folio-resume-fonts');
    if (!l) {
      l = document.createElement('link');
      l.id = 'folio-resume-fonts';
      l.rel = 'stylesheet';
      document.head.appendChild(l);
    }
    if (href && l.href !== href) l.href = href;
  }, [href]);
  // raw CSS: as text children React would escape > and quotes, which breaks hydration
  return <style dangerouslySetInnerHTML={{ __html: RESUME_CSS }} />;
}

// A resume page scaled to the width of its box. `crop` shows only the first page; `lazy` renders when scrolled into view.
export default function ResumeView({ doc, selectedId, crop = true, lazy = true, onPick, guides = false, className = '' }) {
  const box = useRef(null);
  const inner = useRef(null);
  const [w, setW] = useState(0);
  const [seen, setSeen] = useState(!lazy);
  const [contentH, setContentH] = useState(0);
  const paper = PAPER[fullResumeTheme(doc?.theme).paper] || PAPER.a4;
  const pageW = paper.w * MM;
  const pageH = paper.h * MM;
  useEffect(() => {
    const el = box.current;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    let io;
    if (lazy) {
      io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { rootMargin: '400px' });
      io.observe(el);
    }
    return () => { ro.disconnect(); io?.disconnect(); };
  }, [lazy]);
  const html = useMemo(() => (seen && doc ? resumeBody(doc, { selectedId }) : ''), [seen, doc, selectedId]);
  useEffect(() => {
    const el = inner.current;
    if (!el || crop) return;
    const ro = new ResizeObserver(() => setContentH(el.scrollHeight));
    ro.observe(el);
    return () => ro.disconnect();
    // the page div only mounts once the box has a width, so re-measure when that happens
  }, [crop, html, w > 0]);
  const scale = w ? w / pageW : 0;
  const height = crop ? pageH * scale : Math.max(pageH, contentH) * scale;
  const pages = crop ? 1 : Math.max(1, Math.ceil((contentH - 2) / pageH));

  return (
    <div ref={box} className={`relative w-full overflow-hidden ${className}`} style={{ height: scale ? height : undefined, aspectRatio: scale ? undefined : `${paper.w}/${paper.h}` }}>
      {scale > 0 && html ? (
        <div
          ref={inner}
          className={`absolute left-0 top-0 origin-top-left ${onPick ? '' : 'pointer-events-none'}`}
          style={{ width: pageW, transform: `scale(${scale})` }}
          onClick={onPick ? (e) => { const s = e.target.closest('[data-sid]'); if (s) return onPick(s.getAttribute('data-sid')); if (e.target.closest('.rs-head,.rs-head-side')) onPick(e.currentTarget.querySelector('.rs')?.getAttribute('data-head')); } : undefined}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : <div className="absolute inset-0 animate-pulse bg-white" />}
      {guides && scale > 0 && Array.from({ length: pages - 1 }, (_, i) => (
        <div key={i} className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-red-400/70" style={{ top: (i + 1) * pageH * scale }}>
          <span className="absolute right-1 top-1 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">Page {i + 2}</span>
        </div>
      ))}
    </div>
  );
}
