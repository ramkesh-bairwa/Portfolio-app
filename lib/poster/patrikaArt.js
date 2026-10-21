// Line art for printing-press style wedding cards (kumkum patrika): bride and groom with varmala, mandap,
// dhol pair, shehnai pair and doli. Same signature as the other families: (w, h, colours, seed, id, params).
// colours: [ink, accent, paper] · params.style: 'line' (outline only) | 'fill' (ink silhouettes with accent details)
import { f, svg } from './graphics';

// Draw in a bw×bh box, fitted and centred in w×h
const fitBox = (w, h, bw, bh, body) => {
  const S = Math.min(w / bw, h / bh);
  return svg(w, h, `<g transform="translate(${f((w - bw * S) / 2)} ${f((h - bh * S) / 2)}) scale(${f(S * 1000) / 1000})">${body}</g>`);
};
const P = (d, fill, stroke, sw, extra = '') => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const dots = (pts, r, c) => pts.map(([x, y]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${c}"/>`).join('');
// Flowers along a quadratic curve
const garland = (x1, y1, cx, cy, x2, y2, n, r, c1, c2) => {
  let o = P(`M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`, 'none', c1, 0.8);
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t * t * x2, y = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t * t * y2;
    o += `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${i % 2 ? c2 : c1}"/>`;
  }
  return o;
};

function couple([ink, acc, paper], p) {
  const line = p.style === 'line';
  const body = line ? 'none' : ink;
  const det = line ? ink : paper;
  const sw = line ? 1.6 : 0.8;
  let o = '';
  // groom: safa with kalgi, sherwani, dupatta, churidar, mojari
  o += `<circle cx="58" cy="30" r="9" fill="${body}" stroke="${ink}" stroke-width="${sw}"/>`;
  o += P('M47 28 Q48 13 60 14 Q73 14 71 27 Q66 22 58 23 Q51 23 47 28Z', line ? 'none' : acc, ink, sw);
  o += P('M63 15 Q66 7 71 4 Q69 10 66 15', line ? 'none' : acc, ink, sw * 0.8);
  o += P('M50 40 L66 40 L73 52 L72 104 L48 104 L46 52Z', body, ink, sw);
  o += P('M52 41 L60 104', 'none', acc, 2.2);
  o += P('M58 42 V100', 'none', det, 0.7, 'stroke-dasharray="1.5 3"');
  o += P('M68 46 Q78 52 88 60', 'none', ink, 5) + `<circle cx="89" cy="61" r="2.6" fill="${body}" stroke="${ink}" stroke-width="${sw}"/>`;
  o += P('M52 104 V118 M66 104 V118', 'none', ink, 5) + P('M47 120 Q50 116 55 119 M61 120 Q64 116 70 119', 'none', ink, 2.4);
  // bride: veil, blouse, flared lehenga with border, payal
  o += `<circle cx="142" cy="32" r="8.5" fill="${body}" stroke="${ink}" stroke-width="${sw}"/>`;
  o += P('M133 30 Q137 15 148 21 Q166 38 170 112 L152 112 Q156 70 146 42Z', line ? 'none' : acc, ink, sw, line ? '' : 'opacity=".9"');
  o += P('M134 41 L148 41 L150 55 L132 55Z', body, ink, sw);
  o += P('M132 55 L150 55 L172 118 L110 118Z', body, ink, sw);
  o += P('M111 112 L171 112', 'none', line ? ink : acc, 3);
  o += dots([[118, 92], [128, 96], [138, 88], [148, 96], [158, 90], [124, 76], [144, 74], [136, 104], [156, 106]], 1.2, line ? ink : acc);
  o += P('M134 46 Q124 52 113 60', 'none', ink, 4.5) + `<circle cx="112" cy="61" r="2.4" fill="${body}" stroke="${ink}" stroke-width="${sw}"/>`;
  o += `<circle cx="146" cy="31" r="1.2" fill="${acc}"/>`;
  // varmala between the hands
  o += garland(89, 61, 100, 96, 112, 61, 14, 1.9, acc, line ? ink : '#E9C46A');
  o += P('M30 122 H170', 'none', ink, 0.8, 'opacity=".5"');
  return o;
}

function mandap([ink, acc, paper], p) {
  const line = p.style === 'line';
  const fillA = line ? 'none' : acc;
  let o = P('M12 90 H88 V97 H12Z', line ? 'none' : ink, ink, 1.2) + P('M8 97 H92 V100 H8Z', line ? 'none' : ink, ink, 1);
  [[18, 5], [77, 5], [33, 4], [63, 4]].forEach(([x, w]) => { o += P(`M${x} 42 H${x + w} V90 H${x}Z`, line ? 'none' : ink, ink, 1); o += P(`M${x - 1} 88 H${x + w + 1} M${x - 1} 46 H${x + w + 1}`, 'none', line ? ink : paper, 0.8); });
  o += P('M10 43 Q50 2 90 43Z', fillA, ink, 1.3, line ? '' : 'opacity=".9"');
  o += P('M10 43 Q50 12 90 43', 'none', line ? ink : paper, 0.8, 'stroke-dasharray="2 2"');
  for (let i = 0; i < 10; i++) o += P(`M${12 + i * 7.8} 43 q3.9 5 7.8 0`, 'none', ink, 1);
  o += P('M47 8 Q50 2 53 8 L52 11 H48Z', fillA, ink, 1) + `<circle cx="50" cy="4" r="1.6" fill="${ink}"/>`;
  o += P('M38 90 L42 80 H58 L62 90Z', line ? 'none' : ink, ink, 1.1);
  o += P('M50 62 Q57 71 53 80 Q50 76 47 80 Q43 71 50 62Z', acc, ink, 0.8) + P('M50 69 Q53 74 51 79 Q50 77 49 79 Q47 74 50 69Z', '#FFD166', 'none', 0);
  o += P('M22 48 Q36 60 50 48 Q64 60 78 48', 'none', acc, 1.4, 'stroke-dasharray="1 2.4"');
  return o;
}

function dhol([ink, acc, paper], p) {
  const line = p.style === 'line';
  const drum = (x, y) => {
    let o = P(`M${x} ${y} H${x + 34} V${y + 22} H${x}Z`, line ? 'none' : acc, ink, 1.2);
    o += `<ellipse cx="${x}" cy="${y + 11}" rx="5" ry="11" fill="${line ? 'none' : paper}" stroke="${ink}" stroke-width="1.2"/><ellipse cx="${x + 34}" cy="${y + 11}" rx="5" ry="11" fill="${line ? 'none' : paper}" stroke="${ink}" stroke-width="1.2"/>`;
    for (let i = 0; i < 6; i++) o += P(`M${x + 2 + i * 5.4} ${y} L${x + 4.7 + i * 5.4} ${y + 22}`, 'none', ink, 0.7);
    return o;
  };
  return drum(8, 26) + drum(56, 30) + P('M22 22 L30 8 M74 26 L82 12', 'none', ink, 1.6) + `<circle cx="30" cy="8" r="2" fill="${acc}"/><circle cx="82" cy="12" r="2" fill="${acc}"/>`
    + P('M40 18 q2 -4 4 0 M48 16 q2 -4 4 0', 'none', ink, 0.8);
}

function shehnai([ink, acc], p) {
  const line = p.style === 'line';
  const horn = (flip) => {
    const g = `<g transform="${flip ? 'translate(100 0) scale(-1 1)' : ''}">`
      + P('M10 52 L58 20', 'none', ink, 3.2) + P('M56 15 L70 6 L74 18 L62 24Z', line ? 'none' : acc, ink, 1.1)
      + dots([[22, 44], [30, 38.7], [38, 33.3], [46, 28]], 1, line ? ink : '#FFFFFF') + P('M8 54 L12 50', 'none', ink, 2) + '</g>';
    return g;
  };
  return horn(false) + horn(true) + P('M44 56 Q50 48 56 56', 'none', acc, 1.2) + `<circle cx="50" cy="52" r="1.6" fill="${acc}"/>`;
}

function doli([ink, acc, paper], p) {
  const line = p.style === 'line';
  let o = P('M4 30 H96', 'none', ink, 3) + P('M30 30 V36 M70 30 V36', 'none', ink, 1.6);
  o += P('M28 36 H72 V70 H28Z', line ? 'none' : acc, ink, 1.3);
  o += P('M26 36 Q50 12 74 36Z', line ? 'none' : ink, ink, 1.3) + `<circle cx="50" cy="16" r="2" fill="${acc}"/>`;
  o += P('M38 70 V48 Q50 38 62 48 V70Z', line ? 'none' : paper, ink, 1.1) + P('M41 50 Q46 58 41 68 M59 50 Q54 58 59 68', 'none', acc, 1);
  o += P('M26 70 H74 V74 H26Z', line ? 'none' : ink, ink, 1);
  for (let i = 0; i < 6; i++) o += P(`M${30 + i * 8} 74 v5`, 'none', acc, 1.2) + `<circle cx="${30 + i * 8}" cy="80" r="1.1" fill="${acc}"/>`;
  return o;
}

export const PATRIKA_ART = {
  pcouple: (w, h, cols, seed, id, p) => fitBox(w, h, 200, 125, couple(cols, p)),
  pmandap: (w, h, cols, seed, id, p) => fitBox(w, h, 100, 102, mandap(cols, p)),
  pdhol: (w, h, cols, seed, id, p) => fitBox(w, h, 100, 60, dhol(cols, p)),
  pshehnai: (w, h, cols, seed, id, p) => fitBox(w, h, 100, 62, shehnai(cols, p)),
  pdoli: (w, h, cols, seed, id, p) => fitBox(w, h, 100, 84, doli(cols, p)),
};
