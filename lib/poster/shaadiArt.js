// Artwork for Indian wedding cards (patrika): bride & groom with varmala, baraat procession, "sang" hands,
// and the frames, badges and bars card presses use. Signature as the other families: (w, h, colours, seed, id, params).
// colours: [ink, accent, paper]. People are ink silhouettes with paper-coloured details, which print well in one colour.
import { f, svg } from './graphics';

const fitBox = (w, h, bw, bh, body, align = 'center') => {
  const S = Math.min(w / bw, h / bh);
  const dx = align === 'left' ? 0 : align === 'right' ? w - bw * S : (w - bw * S) / 2;
  return svg(w, h, `<g transform="translate(${f(dx)} ${f((h - bh * S) / 2)}) scale(${f(S * 1000) / 1000})">${body}</g>`);
};
const P = (d, fill, stroke = 'none', sw = 0, extra = '') => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const C = (cx, cy, r, fill, stroke = 'none', sw = 0) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const flip = (body, w) => `<g transform="translate(${w} 0) scale(-1 1)">${body}</g>`;

// ---------- people ----------
// Groom facing right in a 100×220 box: safa with turra and kalgi, sherwani with dupatta, churidar and juttis
function groom(ink, acc, paper, hands = 'garland') {
  let o = '';
  o += P('M30 30C22 36 19 52 23 66C27 54 30 44 35 36Z', ink); // turra (tail of the safa)
  o += P('M28 32C27 15 42 5 56 7C70 9 77 19 73 32C64 28 53 27 44 28C37 29 32 31 28 32Z', ink);
  o += P('M33 26C42 22 56 21 70 24M31 19C40 15 54 14 66 16', 'none', paper, 1.2);
  o += P('M58 9C60 1 68 -3 75 -1C69 3 65 7 62 12Z', acc) + C(60, 17, 3.2, acc, paper, 0.8);
  o += P('M35 31L70 31L70 37L75 43L71 45L72 48L69 53C66 57 61 58 57 59L57 66L42 66L42 56C37 51 35 43 35 31Z', ink); // face in profile
  o += P('M28 68C24 74 22 86 22 100L20 152L72 152L70 102C70 86 70 74 66 68C56 64 40 64 28 68Z', ink); // sherwani
  o += P('M42 66Q50 70 58 66', 'none', paper, 1.4);
  for (let y = 74; y < 146; y += 9) o += C(57 - (y - 74) * 0.01, y, 1.1, paper);
  o += P('M33 69C42 92 54 116 63 152', 'none', acc, 4.5); // dupatta
  o += P('M22 146H71', 'none', paper, 1, 'stroke-dasharray="2 2.5"');
  if (hands === 'garland') o += P('M60 73Q66 92 68 97L87 91', 'none', ink, 9) + C(89, 90, 4.4, ink);
  else o += P('M60 73Q64 92 64 110', 'none', ink, 9) + C(64, 113, 4.4, ink);
  o += P('M30 152L41 152L40 206L33 206Z', ink) + P('M51 152L63 152L59 206L52 206Z', ink);
  o += P('M33 196H40M52 196H59M33 200H40M52 200H59', 'none', paper, 0.8);
  o += P('M30 206H42C48 206 52 207 55 203C55 210 50 214 44 214H30Z', ink) + P('M50 206H61C67 206 71 207 74 203C74 210 69 214 63 214H50Z', ink);
  return o;
}
// Bride facing left in a 100×220 box: veil to the ground, choli and flared lehenga with border bands
function bride(ink, acc, paper, hands = 'garland') {
  let o = '';
  o += P('M48 16C62 12 76 22 78 38C82 74 88 124 94 212L68 212C70 152 64 92 58 60Z', ink); // veil falling behind
  o += P('M38 24C44 11 61 9 71 21C79 38 84 100 92 206', 'none', acc, 2.4, 'stroke-dasharray="0.1 4.5"');
  o += P('M40 24C46 17 57 17 61 24C63 34 61 46 55 54L53 63L44 63L44 57C40 55 37 53 36 51L33 47L34 45L29 41L35 37L36 31C36 28 38 26 40 24Z', ink); // face
  o += C(31.5, 44, 3.2, 'none', acc, 1.2) + C(41, 24.5, 1.8, acc);
  o += P('M38 23C44 9 62 7 72 20C76 30 74 42 70 48C70 38 68 28 62 22C54 16 44 18 38 23Z', ink);
  o += P('M42 63L61 63C63 75 63 85 61 93L40 93C38 85 38 74 42 63Z', ink); // choli
  o += P('M40 93L61 93C68 132 80 172 88 212L8 212C14 172 30 132 40 93Z', ink); // lehenga
  o += P('M11 202L86 202M13 195L84 195', 'none', acc, 2);
  o += P('M15 188L82 188', 'none', paper, 1.2, 'stroke-dasharray="1 4"');
  [[30, 130], [50, 128], [40, 150], [60, 152], [24, 168], [46, 172], [68, 170], [34, 112], [54, 110]].forEach(([x, y]) => { o += C(x, y, 1.6, paper); });
  if (hands === 'garland') o += P('M46 69Q37 89 34 93L15 89', 'none', ink, 8.5) + C(12.5, 88, 4.2, ink) + P('M28 92L30 86M24 91L26 85', 'none', acc, 1.6);
  else o += P('M46 69Q40 90 40 108', 'none', ink, 8.5) + C(40, 111, 4.2, ink);
  return o;
}
const flowerChain = (pts, r, c1, c2) => pts.map(([x, y], i) => C(x, y, r, i % 3 ? c1 : c2)).join('');
function varmala(x1, y1, x2, y2, depth, acc, ink) {
  const pts = [];
  for (let k = 0; k <= 18; k++) {
    const t = k / 18;
    pts.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * depth]);
  }
  return P(`M${pts.map((p) => p.map(f).join(' ')).join('L')}`, 'none', ink, 0.8) + flowerChain(pts, 2.3, acc, '#F4C430');
}

// Baraat in a 320×130 box: chhatri bearer, groom on a decorated horse, dhol player
function baraat(ink, acc, paper) {
  let o = '';
  // chhatri (umbrella) over the groom
  o += P('M126 8Q160 -12 194 8Z', acc, ink, 1.2) + P('M126 8L194 8', 'none', ink, 1.2);
  for (let x = 128; x <= 192; x += 8) o += P(`M${x} 8V14`, 'none', ink, 1) + C(x, 15, 1.1, acc);
  o += P('M160 -4V2', 'none', ink, 2) + P('M160 8L104 58', 'none', ink, 2);
  // bearer
  o += C(96, 40, 6, ink) + P('M88 38Q96 27 104 37Z', acc) + P('M88 48L104 48L108 96L84 96Z', ink) + P('M100 52L104 58', 'none', ink, 5);
  o += P('M88 96L86 122M102 96L106 122', 'none', ink, 5) + P('M84 124H90M104 124H110', 'none', ink, 3);
  // horse
  o += P('M120 68C120 54 140 49 170 50C196 50 212 56 214 68C216 82 204 90 180 90L140 90C126 90 120 82 120 68Z', ink);
  o += P('M194 58C202 44 208 32 214 25L229 29C225 40 219 52 213 66Z', ink);
  o += P('M212 23C218 16 229 16 235 22L247 39C249 43 245 47 240 44L227 37Z', ink) + P('M217 20L216 11L222 18Z', ink);
  o += P('M206 30C200 38 198 46 196 54', 'none', paper, 1.2, 'stroke-dasharray="1 3"');
  o += P('M200 86L206 121M188 88L183 121M135 86L128 121M148 88L153 121', 'none', ink, 6);
  o += P('M120 64C108 68 104 84 108 100C112 88 116 78 122 72Z', ink);
  o += P('M140 52L196 52L192 88L144 88Z', acc) + P('M144 88L192 88', 'none', paper, 1.5, 'stroke-dasharray="1 3"');
  [[152, 62], [168, 62], [184, 62], [160, 75], [176, 75]].forEach(([x, y]) => { o += C(x, y, 2, paper); });
  o += P('M222 26L238 40', 'none', acc, 2);
  // groom riding
  o += P('M156 52L178 52L175 24L159 24Z', ink) + C(167, 16, 7, ink) + P('M157 13Q167 -1 178 11Q168 8 157 13Z', acc);
  o += P('M162 18V30M166 18V31M170 18V30M174 17V28', 'none', '#F4C430', 1) + P('M168 52L172 78L180 80', 'none', ink, 5);
  // dhol player
  o += C(282, 40, 6, ink) + P('M274 38Q282 27 290 37Z', acc) + P('M274 48L290 48L294 96L270 96Z', ink);
  o += `<ellipse cx="282" cy="74" rx="17" ry="11" fill="${acc}" stroke="${ink}" stroke-width="1.4"/>` + P('M266 74H298', 'none', ink, 1) + P('M270 66L294 82M270 82L294 66', 'none', ink, 0.8);
  o += P('M276 60L262 52M288 60L302 50', 'none', ink, 2) + P('M274 96L272 122M290 96L294 122', 'none', ink, 5);
  o += P('M10 126H312', 'none', ink, 0.8, 'opacity=".4"');
  return o;
}

// "Sang" hands in a 160×80 box: bride's hand with mehndi resting on the groom's, bangles and kalawa
function hands(ink, acc, paper) {
  let o = '';
  // groom's hand from the right, palm up, cupping
  o += P('M160 47H128C118 47 106 49 96 54C89 58 89 64 96 64C104 64 112 62 120 61C130 64 142 66 160 66Z', paper, ink, 1.5);
  o += P('M120 47C114 42 109 40 104 42C101 44 105 49 111 49', paper, ink, 1.4);
  o += P('M140 45V68M146 45V68M150 45V68', 'none', ink, 1.6) + P('M100 58Q108 56 116 57', 'none', ink, 0.9);
  // bride's hand from the left, palm down, fingers resting on his
  o += P('M0 25L36 27C50 22 64 20 80 22C92 23 106 26 116 30C122 33 122 39 116 40C108 41 100 40 94 40C102 42 106 47 101 50C93 53 81 52 72 53C60 55 46 55 36 53L0 52Z', paper, ink, 1.5);
  o += P('M116 40H96M101 50H84M94 34Q104 33 112 35', 'none', ink, 0.9);
  [6, 12, 18, 24, 30].forEach((x, i) => { o += P(`M${x} 26V51`, 'none', i % 2 ? acc : ink, i % 2 ? 3.2 : 2.2); });
  o += P('M40 27V53', 'none', '#B91C1C', 1.8) + P('M43.5 27V53', 'none', '#B91C1C', 1);
  // mehndi on the back of her hand
  o += C(70, 38, 7.5, 'none', acc, 1.2) + C(70, 38, 3.8, 'none', acc, 1) + C(70, 38, 1.4, acc);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; o += C(70 + Math.cos(a) * 10.5, 38 + Math.sin(a) * 9.5, 0.95, acc); }
  o += P('M84 30Q90 28 96 30M86 46Q92 48 98 46', 'none', acc, 1.1, 'stroke-dasharray="0.1 2.2"');
  return o;
}

// ---------- frames, badges and bars (drawn at the element's size, so nothing stretches) ----------
const t = (w, h, k = 0.012) => Math.max(1.5, Math.min(w, h) * k);
// Cusped mehrab: the big arch that spans the fold of an open card
function cuspArch(w, h, [ink, acc, paper], seed, id, p = {}) {
  const sw = t(w, h, 0.01);
  const d = (k) => {
    const x0 = w * k, x1 = w * (1 - k), top = h * (k * 1.4);
    return `M${f(x0)} ${f(h)}V${f(h * 0.52)}C${f(x0)} ${f(h * 0.3)} ${f(w * (0.06 + k))} ${f(h * 0.24)} ${f(w * (0.22 + k * 0.4))} ${f(h * 0.2)}C${f(w * 0.4)} ${f(h * 0.16)} ${f(w * 0.43)} ${f(h * 0.08 + top)} ${f(w / 2)} ${f(top)}C${f(w * 0.57)} ${f(h * 0.08 + top)} ${f(w * 0.6)} ${f(h * 0.16)} ${f(w * (0.78 - k * 0.4))} ${f(h * 0.2)}C${f(w * (0.94 - k))} ${f(h * 0.24)} ${f(x1)} ${f(h * 0.3)} ${f(x1)} ${f(h * 0.52)}V${f(h)}`;
  };
  return svg(w, h, P(d(0.01), p.fill ? paper : 'none', ink, sw * 2.2) + P(d(0.035), 'none', ink, sw * 0.8, `stroke-dasharray="${f(sw * 3)} ${f(sw * 2.5)}"`));
}
// Oval with a petal border and pillars on both sides (opens around the fold)
function ovalStambh(w, h, [ink, acc, paper]) {
  const sw = t(w, h, 0.008);
  const cx = w / 2, cy = h / 2, rx = w * 0.36, ry = h * 0.46;
  let o = `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${paper}" stroke="${ink}" stroke-width="${f(sw * 2.4)}"/>`;
  o += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx * 0.9)}" ry="${f(ry * 0.93)}" fill="none" stroke="${ink}" stroke-width="${f(sw)}"/>`;
  const n = 46;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    if (Math.abs(Math.cos(a)) > 0.86) continue; // leave the sides for the pillars
    const x = cx + Math.cos(a) * rx * 1.07, y = cy + Math.sin(a) * ry * 1.04, rot = (a * 180) / Math.PI + 90;
    o += `<path d="M0 ${f(-sw * 5)}Q${f(sw * 2.6)} 0 0 ${f(sw * 4)}Q${f(-sw * 2.6)} 0 0 ${f(-sw * 5)}Z" fill="${ink}" transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})"/>`;
  }
  [-1, 1].forEach((side) => {
    const px = cx + side * rx - w * 0.035, pw = w * 0.07;
    o += `<rect x="${f(px)}" y="${f(cy - h * 0.2)}" width="${f(pw)}" height="${f(h * 0.4)}" fill="${paper}" stroke="${ink}" stroke-width="${f(sw * 1.4)}"/>`;
    o += `<rect x="${f(px + pw * 0.3)}" y="${f(cy - h * 0.2)}" width="${f(pw * 0.4)}" height="${f(h * 0.4)}" fill="${ink}"/>`;
    [-0.22, 0.2].forEach((k) => { o += `<rect x="${f(px - pw * 0.25)}" y="${f(cy + h * k)}" width="${f(pw * 1.5)}" height="${f(h * 0.03)}" rx="${f(h * 0.01)}" fill="${ink}"/>`; });
    o += `<ellipse cx="${f(px + pw / 2)}" cy="${f(cy)}" rx="${f(pw * 0.9)}" ry="${f(h * 0.025)}" fill="${paper}" stroke="${ink}" stroke-width="${f(sw * 1.4)}"/>`;
  });
  return svg(w, h, o);
}
// Shield banner for one programme item (red press-card style)
function shield(w, h, [ink, acc, paper], seed, id, p = {}) {
  const sw = t(w, h, 0.02);
  const fill = p.filled ? acc : paper;
  let o = P(`M${f(w * 0.02)} ${f(h * 0.06)}H${f(w * 0.98)}L${f(w * 0.92)} ${f(h * 0.2)}L${f(w * 0.98)} ${f(h * 0.34)}H${f(w * 0.02)}L${f(w * 0.08)} ${f(h * 0.2)}Z`, ink);
  o += P(`M${f(w * 0.1)} ${f(h * 0.3)}H${f(w * 0.9)}V${f(h * 0.7)}L${f(w / 2)} ${f(h * 0.97)}L${f(w * 0.1)} ${f(h * 0.7)}Z`, fill, ink, sw * 1.6);
  o += P(`M${f(w * 0.16)} ${f(h * 0.7)}L${f(w / 2)} ${f(h * 0.9)}L${f(w * 0.84)} ${f(h * 0.7)}`, 'none', ink, sw, `stroke-dasharray="${f(sw * 2)} ${f(sw * 2)}"`);
  return svg(w, h, o);
}
// Multifoil badge with fringe (programme item), room for an icon at the top
function cuspBadge(w, h, [ink, acc, paper], seed, id, p = {}) {
  const sw = t(w, h, 0.02);
  const top = h * 0.12, body = h * 0.8;
  let d = `M${f(w * 0.06)} ${f(body)}V${f(h * 0.42)}`;
  d += `C${f(w * 0.06)} ${f(h * 0.28)} ${f(w * 0.2)} ${f(h * 0.3)} ${f(w * 0.22)} ${f(h * 0.24)}`;
  d += `C${f(w * 0.26)} ${f(top)} ${f(w * 0.4)} ${f(top)} ${f(w / 2)} ${f(top * 0.4)}`;
  d += `C${f(w * 0.6)} ${f(top)} ${f(w * 0.74)} ${f(top)} ${f(w * 0.78)} ${f(h * 0.24)}`;
  d += `C${f(w * 0.8)} ${f(h * 0.3)} ${f(w * 0.94)} ${f(h * 0.28)} ${f(w * 0.94)} ${f(h * 0.42)}V${f(body)}`;
  d += `L${f(w * 0.86)} ${f(body)}L${f(w / 2)} ${f(body + h * 0.06)}L${f(w * 0.14)} ${f(body)}Z`;
  let o = P(d, p.filled ? acc : paper, ink, sw * 1.6);
  for (let i = 0; i < 9; i++) { const x = w * (0.16 + i * 0.085); o += P(`M${f(x)} ${f(body + h * 0.03)}V${f(h * 0.99)}`, 'none', ink, sw * 0.8); }
  return svg(w, h, o);
}
// Hanging scroll banner with a rod, knobs and tassels
function scrollBanner(w, h, [ink, acc, paper]) {
  const sw = t(w, h, 0.016);
  let o = P(`M${f(w * 0.04)} ${f(h * 0.07)}H${f(w * 0.96)}`, 'none', ink, sw * 3.2);
  [0.04, 0.96].forEach((k) => { o += C(w * k, h * 0.07, sw * 3.2, ink); });
  o += P(`M${f(w * 0.12)} ${f(h * 0.1)}H${f(w * 0.88)}V${f(h * 0.62)}C${f(w * 0.88)} ${f(h * 0.78)} ${f(w * 0.62)} ${f(h * 0.8)} ${f(w / 2)} ${f(h * 0.96)}C${f(w * 0.38)} ${f(h * 0.8)} ${f(w * 0.12)} ${f(h * 0.78)} ${f(w * 0.12)} ${f(h * 0.62)}Z`, paper, ink, sw * 1.8);
  o += P(`M${f(w * 0.16)} ${f(h * 0.14)}H${f(w * 0.84)}V${f(h * 0.6)}C${f(w * 0.84)} ${f(h * 0.74)} ${f(w * 0.6)} ${f(h * 0.76)} ${f(w / 2)} ${f(h * 0.9)}C${f(w * 0.4)} ${f(h * 0.76)} ${f(w * 0.16)} ${f(h * 0.74)} ${f(w * 0.16)} ${f(h * 0.6)}Z`, 'none', ink, sw * 0.7);
  [0.04, 0.96].forEach((k) => {
    const x = w * k;
    o += P(`M${f(x)} ${f(h * 0.1)}V${f(h * 0.42)}`, 'none', ink, sw);
    o += C(x, h * 0.48, w * 0.035, paper, ink, sw) + C(x, h * 0.48, w * 0.012, acc);
    for (let i = -2; i <= 2; i++) o += P(`M${f(x)} ${f(h * 0.52)}L${f(x + i * w * 0.008)} ${f(h * 0.62)}`, 'none', ink, sw * 0.6);
  });
  return svg(w, h, o);
}
// Filled name bar with chevrons at both ends: «« name »»
function nameBar(w, h, [ink, acc, paper]) {
  const r = h / 2;
  let o = P(`M${f(r)} 0H${f(w - r)}A${f(r)} ${f(r)} 0 0 1 ${f(w - r)} ${f(h)}H${f(r)}A${f(r)} ${f(r)} 0 0 1 ${f(r)} 0Z`, paper, ink, Math.max(1.5, h * 0.05));
  o += P(`M${f(h * 0.18)} ${f(h * 0.18)}H${f(w - h * 0.18)}A${f(h * 0.32)} ${f(h * 0.32)} 0 0 1 ${f(w - h * 0.18)} ${f(h * 0.82)}H${f(h * 0.18)}Z`, ink);
  const chev = (x, dir) => [0, 1, 2].map((i) => P(`M${f(x + dir * i * h * 0.22)} ${f(h * 0.3)}L${f(x + dir * (i * h * 0.22 + h * 0.16))} ${f(h / 2)}L${f(x + dir * i * h * 0.22)} ${f(h * 0.7)}`, 'none', paper, Math.max(1.5, h * 0.07))).join('');
  o += chev(h * 0.62, -1) + chev(w - h * 0.62, 1);
  return svg(w, h, o);
}
// Outlined event pill: filled cap on the left, ))) separators
function eventPill(w, h, [ink, acc, paper], seed, id, p = {}) {
  const r = h / 2, capW = w * (p.cap || 0.38);
  let o = P(`M${f(r)} ${f(h * 0.05)}H${f(w - r)}A${f(r * 0.95)} ${f(r * 0.95)} 0 0 1 ${f(w - r)} ${f(h * 0.95)}H${f(r)}A${f(r * 0.95)} ${f(r * 0.95)} 0 0 1 ${f(r)} ${f(h * 0.05)}Z`, paper, ink, Math.max(1.5, h * 0.05));
  if (p.filled) o += P(`M${f(r)} ${f(h * 0.05)}H${f(capW)}V${f(h * 0.95)}H${f(r)}A${f(r * 0.95)} ${f(r * 0.95)} 0 0 1 ${f(r)} ${f(h * 0.05)}Z`, ink);
  else o += P(`M${f(capW)} ${f(h * 0.05)}V${f(h * 0.95)}`, 'none', ink, Math.max(1.5, h * 0.05));
  [0, 1, 2].forEach((i) => { o += P(`M${f(capW + h * (0.12 + i * 0.16))} ${f(h * 0.22)}Q${f(capW + h * (0.26 + i * 0.16))} ${f(h / 2)} ${f(capW + h * (0.12 + i * 0.16))} ${f(h * 0.78)}`, 'none', ink, Math.max(1.5, h * 0.06)); });
  return svg(w, h, o);
}
// Address box for the cover: rod with curls, rounded box with writing lines, hanging strings
function addressBox(w, h, [ink, acc, paper]) {
  const sw = t(w, h, 0.012);
  let o = P(`M${f(w * 0.05)} ${f(h * 0.06)}H${f(w * 0.95)}`, 'none', ink, sw * 2.4);
  [0.05, 0.95].forEach((k, i) => { o += P(`M${f(w * k)} ${f(h * 0.06)}q${f((i ? 1 : -1) * w * 0.03)} ${f(h * 0.04)} 0 ${f(h * 0.1)}`, 'none', ink, sw * 1.2); });
  o += `<rect x="${f(w * 0.08)}" y="${f(h * 0.16)}" width="${f(w * 0.84)}" height="${f(h * 0.78)}" rx="${f(Math.min(h * 0.3, w * 0.1))}" fill="${paper}" stroke="${ink}" stroke-width="${f(sw * 1.6)}"/>`;
  [0.4, 0.58, 0.76].forEach((k) => { o += P(`M${f(w * 0.18)} ${f(h * k)}H${f(w * 0.82)}`, 'none', ink, sw * 0.7); });
  [0.03, 0.97].forEach((k) => { o += P(`M${f(w * k)} ${f(h * 0.18)}V${f(h * 0.7)}`, 'none', ink, sw * 0.7) + C(w * k, h * 0.72, sw * 1.6, ink); });
  return svg(w, h, o);
}
// Vertical side border: chain of diamonds with a dot and leaf curls
function sideBorder(w, h, [ink, acc, paper]) {
  const n = Math.max(3, Math.round(h / (w * 1.25)));
  const step = h / n;
  let o = P(`M${f(w * 0.1)} 0V${f(h)}M${f(w * 0.9)} 0V${f(h)}`, 'none', ink, t(w, h, 0.03));
  for (let i = 0; i < n; i++) {
    const cy = step * (i + 0.5), cx = w / 2, r = Math.min(w * 0.36, step * 0.36);
    o += P(`M${f(cx)} ${f(cy - r)}L${f(cx + r)} ${f(cy)}L${f(cx)} ${f(cy + r)}L${f(cx - r)} ${f(cy)}Z`, paper, ink, t(w, h, 0.04));
    o += C(cx, cy, r * 0.32, i % 2 ? acc : ink);
    o += P(`M${f(cx)} ${f(cy + r)}q${f(r * 0.4)} ${f((step - 2 * r) * 0.5)} 0 ${f(step - 2 * r)}`, 'none', ink, t(w, h, 0.03));
  }
  return svg(w, h, o);
}

export const SHAADI_ART = {
  skcouple: (w, h, [ink, acc, paper]) => fitBox(w, h, 240, 222, groom(ink, acc, paper) + `<g transform="translate(130 0)">${bride(ink, acc, paper)}</g>` + varmala(89, 90, 142.5, 88, 40, acc, ink)),
  skgroom: (w, h, [ink, acc, paper], seed, id, p) => fitBox(w, h, 100, 220, p.mirror ? flip(groom(ink, acc, paper, 'side'), 100) : groom(ink, acc, paper, 'side')),
  skbride: (w, h, [ink, acc, paper], seed, id, p) => fitBox(w, h, 100, 220, p.mirror ? flip(bride(ink, acc, paper, 'side'), 100) : bride(ink, acc, paper, 'side')),
  skbaraat: (w, h, [ink, acc, paper], seed, id, p) => fitBox(w, h, 320, 132, p.mirror ? flip(baraat(ink, acc, paper), 320) : baraat(ink, acc, paper)),
  skhands: (w, h, [ink, acc, paper]) => fitBox(w, h, 160, 80, hands(ink, acc, paper)),
  skcusparch: cuspArch,
  skoval: ovalStambh,
  skshield: shield,
  skcusp: cuspBadge,
  skscroll: scrollBanner,
  sknamebar: nameBar,
  skpill: eventPill,
  skaddress: addressBox,
  skborder: sideBorder,
};
