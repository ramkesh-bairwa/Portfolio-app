'use client';
import { useEffect, useRef, useState } from 'react';

// Pass `html`, or `render` to build the HTML only once the thumbnail scrolls near the viewport.
export default function TemplateThumb({ html, render, width = 1280, height = 900 }) {
  const box = useRef(null);
  const [scale, setScale] = useState(0);
  const [visible, setVisible] = useState(!render);
  const [lazyHtml, setLazyHtml] = useState('');
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  useEffect(() => {
    if (!render || visible) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: '400px' });
    io.observe(box.current);
    return () => io.disconnect();
  }, [render, visible]);
  useEffect(() => {
    if (render && visible) setLazyHtml(render());
  }, [render, visible]);
  const doc = render ? lazyHtml : html;
  return (
    <div ref={box} className="relative w-full overflow-hidden bg-white" style={{ aspectRatio: `${width}/${height}` }}>
      {scale > 0 && doc ? (
        <iframe
          title="Template thumbnail"
          srcDoc={doc}
          tabIndex={-1}
          aria-hidden="true"
          scrolling="no"
          loading="lazy"
          className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
          style={{ width, height, transform: `scale(${scale})` }}
        />
      ) : (
        <div className="absolute inset-0 animate-pulse bg-paper" />
      )}
    </div>
  );
}
