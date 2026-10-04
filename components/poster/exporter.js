'use client';
// Turns a rendered design into PNG / JPG / PDF files in the browser.
import { getFormat } from '@/lib/poster/formats';

export const fileName = (name, ext) => `${(name || 'design').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'design'}.${ext}`;

// Keep the output under ~8000px on the long side so browsers can draw it
export const safeRatio = (doc, ratio) => Math.max(0.25, Math.min(ratio, 8000 / Math.max(doc.w, doc.h)));

async function waitForAssets(node) {
  try { await document.fonts.ready; } catch { /* fonts API unavailable */ }
  const imgs = Array.from(node.querySelectorAll('img'));
  await Promise.all(imgs.map((im) => (im.complete ? null : new Promise((res) => { im.onload = res; im.onerror = res; }))));
}

function save(dataUrl, name) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// PNG file of the design, for the phone's share sheet
export async function designFile(node, doc, { ratio = 2, name }) {
  const { toBlob } = await import('html-to-image');
  await waitForAssets(node);
  const blob = await toBlob(node, { pixelRatio: safeRatio(doc, ratio), width: doc.w, height: doc.h, cacheBust: false, style: { transform: 'none' } });
  return new File([blob], fileName(name, 'png'), { type: 'image/png' });
}

export async function exportDesign(node, doc, { type = 'png', ratio = 2, name, bleed = false }) {
  const { toPng, toJpeg } = await import('html-to-image');
  await waitForAssets(node);
  const pixelRatio = safeRatio(doc, ratio);
  const opts = { pixelRatio, width: doc.w, height: doc.h, cacheBust: false, style: { transform: 'none' } };
  if (type === 'png') return save(await toPng(node, opts), fileName(name, 'png'));
  const jpg = await toJpeg(node, { ...opts, quality: 0.93, backgroundColor: '#FFFFFF' });
  if (type === 'jpg') return save(jpg, fileName(name, 'jpg'));
  // PDF: one page at the real print size when the format has one, otherwise at 96 dpi
  const { jsPDF } = await import('jspdf');
  const f = getFormat(doc.format);
  const real = f.key === doc.format && f.mm;
  const [pw, ph] = real ? f.mm : [doc.w * 0.264583, doc.h * 0.264583];
  if (!bleed) {
    const pdf = new jsPDF({ orientation: pw > ph ? 'landscape' : 'portrait', unit: 'mm', format: [pw, ph], compress: true });
    pdf.addImage(jpg, 'JPEG', 0, 0, pw, ph, undefined, 'FAST');
    pdf.save(fileName(name, 'pdf'));
    return;
  }
  // Print-ready: 3 mm bleed (the design is enlarged slightly past the cut line) and crop marks outside it
  const B = 3;
  const M = 8;
  const W = pw + 2 * (B + M);
  const H = ph + 2 * (B + M);
  const pdf = new jsPDF({ orientation: W > H ? 'landscape' : 'portrait', unit: 'mm', format: [W, H], compress: true });
  pdf.addImage(jpg, 'JPEG', M, M, pw + 2 * B, ph + 2 * B, undefined, 'FAST');
  pdf.setDrawColor(0);
  pdf.setLineWidth(0.25);
  const x0 = M + B;
  const y0 = M + B;
  const x1 = x0 + pw;
  const y1 = y0 + ph;
  const L = 5;
  [[x0, y0, -1, -1], [x1, y0, 1, -1], [x0, y1, -1, 1], [x1, y1, 1, 1]].forEach(([x, y, sx, sy]) => {
    pdf.line(x + sx * (B + 0.5), y, x + sx * (B + 0.5 + L), y);
    pdf.line(x, y + sy * (B + 0.5), x, y + sy * (B + 0.5 + L));
  });
  pdf.setFontSize(6);
  pdf.text(`${name || 'design'} · trim ${Math.round(pw)}×${Math.round(ph)} mm · 3 mm bleed`, M, H - 2.5);
  pdf.save(fileName(name, 'pdf'));
}
