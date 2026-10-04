'use client';
// Measures how tall a text element's text really is, using the same styles the poster uses.
import { fontStack } from '@/lib/fonts';

let box = null;
function measureBox() {
  if (!box) {
    box = document.createElement('div');
    box.setAttribute('aria-hidden', 'true');
    Object.assign(box.style, { position: 'fixed', left: '-100000px', top: '0', visibility: 'hidden', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere', boxSizing: 'border-box' });
    document.body.appendChild(box);
  }
  return box;
}

export function textHeight(el, size = el.size) {
  const b = measureBox();
  Object.assign(b.style, {
    width: `${el.w}px`, fontFamily: fontStack(el.font), fontSize: `${size}px`, fontWeight: el.weight, fontStyle: el.italic ? 'italic' : 'normal',
    lineHeight: String(el.lh), letterSpacing: `${el.ls || 0}em`, textTransform: el.upper ? 'uppercase' : 'none', padding: el.bgColor ? `${el.bgPad || 0}px` : '0',
  });
  b.textContent = el.text || ' ';
  return b.scrollHeight;
}

// Largest font size that keeps the text inside the box (and words unbroken where possible)
export function fitFontSize(el) {
  let lo = 4;
  let hi = Math.max(8, Math.min(1000, el.h * 2));
  for (let i = 0; i < 24 && hi - lo > 0.5; i++) {
    const mid = (lo + hi) / 2;
    if (textHeight(el, mid) <= el.h) lo = mid;
    else hi = mid;
  }
  return Math.floor(lo);
}
