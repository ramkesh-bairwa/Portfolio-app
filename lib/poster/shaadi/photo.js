// Colour photo cards (5×7 in portrait) built from parts: background, photo shape, heading, names, details, footer.
// Designs are picked so any two differ in at least three parts. 1 page = the card; more pages add invitation,
// programme and reception / RSVP pages in the same look.
import { slotEl } from '../kit';
import { rng } from '../graphics';
import { G, box, emblem, flow, fonts, gradBg, hline, it, lists, mix, person, program, qrEl, sang, sideOrn, solidBg } from './parts';

export const PHOTO_PARTS = {
  bg: ['goldwhite', 'gradient', 'royal', 'split', 'wash'],
  photo: ['circles', 'arch', 'heart', 'wave', 'art'],
  header: ['ganesh', 'om', 'kalash'],
  names: ['side', 'stack', 'script'],
  details: ['bars', 'table', 'minimal'],
  footer: ['dhol', 'baraat', 'qr', 'florals'],
  motif: ['flowers', 'mandala', 'paisley'],
};
const KEYS = Object.keys(PHOTO_PARTS);
const PHOTO_LABEL = { circles: 'दो फोटो', arch: 'मेहराब फोटो', heart: 'दिल फोटो', wave: 'कपल फोटो', art: 'बिना फोटो' };
// [name, page, page2, title, text, accent, gold, soft]
const PALETTES = {
  goldwhite: [['Ivory & red', '#FFFFFF', '#FFF8EE', '#B91C1C', '#5B2A1A', '#B8860B', '#C9A227', '#6B4A33'], ['Rose', '#FFF7F7', '#FDECEC', '#BE185D', '#4A1530', '#B76E79', '#C98A92', '#6D4C57'], ['Mint', '#F6FBF7', '#E3F2E8', '#15803D', '#173B26', '#B8860B', '#C9A227', '#3F5F48']],
  gradient: [['Peach glow', '#FFF1E6', '#FFD7BA', '#C2410C', '#4A230F', '#E85D04', '#D4A017', '#7A4A2A'], ['Lilac', '#F5EEFF', '#DCCBFF', '#6D28D9', '#2E1A57', '#9333EA', '#C9A227', '#5B4B73'], ['Sky', '#ECF6FF', '#C8E3FF', '#1D4ED8', '#13285A', '#2563EB', '#C9A227', '#3F5878']],
  royal: [['Navy & blush', '#0F1E3D', '#1B2E57', '#F7D6CF', '#FDF2EE', '#E8B4A6', '#E8B4A6', '#D9C4BE'], ['Maroon & gold', '#4A0E17', '#6B1424', '#F7E7B4', '#FFF7E0', '#D4AF37', '#D4AF37', '#E9D7A8'], ['Emerald & gold', '#06372A', '#0B4D3B', '#F7E7B4', '#FFF7E0', '#D4AF37', '#D4AF37', '#CFE3D6']],
  split: [['Kesari', '#FFFFFF', '#FFF7ED', '#EA580C', '#4A1D0B', '#DC2626', '#F59E0B', '#5C2A10'], ['Magenta', '#FFFFFF', '#FDF2F8', '#BE185D', '#4A0E2B', '#DB2777', '#F472B6', '#6D2948'], ['Royal blue', '#FFFFFF', '#EFF6FF', '#1D4ED8', '#0F2557', '#2563EB', '#FBBF24', '#334155']],
  wash: [['Blush wash', '#FFFBF8', '#FCE7EF', '#9D174D', '#3B1424', '#DB2777', '#C9A227', '#6D4C57'], ['Sage wash', '#FBFDF9', '#E3EFE0', '#3F6212', '#1F2E14', '#65A30D', '#C9A227', '#4D5A3F'], ['Saffron wash', '#FFFDF6', '#FDEFD0', '#B45309', '#3A230A', '#D97706', '#C9A227', '#6B4A2A']],
};

function choose(n, minDiff, seed) {
  const R = rng(seed);
  const picked = [];
  for (let t = 0; picked.length < n && t < 500000; t++) {
    const c = KEYS.map((k) => Math.floor(R() * PHOTO_PARTS[k].length));
    if (PHOTO_PARTS.photo[c[1]] === 'wave' && PHOTO_PARTS.footer[c[5]] === 'florals') continue;
    if (picked.every((p) => p.reduce((d, v, i) => d + (v !== c[i] ? 1 : 0), 0) >= minDiff)) picked.push(c);
  }
  return picked;
}
export const PHOTO_DESIGNS = choose(84, 3, 7012027).map((c, i) => {
  const parts = Object.fromEntries(KEYS.map((k, j) => [k, PHOTO_PARTS[k][c[j]]]));
  const pal = PALETTES[parts.bg][i % 3];
  return { id: `fc${i + 1}`, kind: 'photo', no: i + 1, parts, pal: i % 3, format: 'invitation', swatch: pal[3], paper: pal[1], colourName: pal[0], title: `${PHOTO_LABEL[parts.photo]} · ${parts.names}`, tags: parts.bg };
});

const theme = (dz) => {
  const [, bg, bg2, title, text, acc, gold, soft] = PALETTES[dz.parts.bg][dz.pal];
  const dark = dz.parts.bg === 'royal';
  return { bg, bg2, title, text, acc, gold, soft, dark, ink: dark ? title : text, paper: dark ? bg : '#FFFFFF', colour: true, iconKind: dz.parts.header === 'om' ? 'swastik' : 'kalash' };
};

// background, frame and decoration for a page
function backdrop(dz, T, W, H, u, inner = false) {
  const els = [];
  let bg = solidBg(T.bg);
  switch (dz.parts.bg) {
    case 'goldwhite':
      els.push(box(1.6 * u, 1.6 * u, W - 3.2 * u, H - 3.2 * u, { stroke: T.gold, strokeW: Math.max(3, Math.round(0.8 * u)), name: 'Gold frame' }), box(3 * u, 3 * u, W - 6 * u, H - 6 * u, { stroke: T.gold, strokeW: 1, name: 'Gold frame' }));
      if (!inner) els.push(G('oflora', W - 40 * u, 2 * u, 38 * u, 38 * u, ['#E57373', '#F8BBD0', '#81C784'], { kind: 'corner' }, { opacity: 0.5, rot: 90 }));
      break;
    case 'gradient':
      bg = gradBg(T.bg, T.bg2, 170);
      for (let i = 0; i < 14; i++) els.push(box(((i * 31) % 92) * u, ((i * 47) % 132) * u, 2 * u, 2 * u, { fill: T.acc, radius: Math.round(u), opacity: 0.18, name: 'Dot' }));
      els.push(box(3 * u, 3 * u, W - 6 * u, H - 6 * u, { stroke: T.title, strokeW: 1, radius: Math.round(3 * u), name: 'Frame' }));
      break;
    case 'royal':
      bg = gradBg(T.bg, T.bg2, 180);
      els.push(G('oframe', 3 * u, 4 * u, W - 6 * u, H - 8 * u, [T.gold, T.gold, T.gold], { style: inner ? 'flourish' : 'filigree' }));
      if (!inner) els.push(G('oflora', 1 * u, 1 * u, 22 * u, 22 * u, ['#E57399', '#F9C5D5', '#7CB27C'], { kind: 'lotus' }), G('oflora', W - 23 * u, H - 25 * u, 22 * u, 22 * u, ['#E57399', '#F9C5D5', '#7CB27C'], { kind: 'lotus' }));
      break;
    case 'split':
      if (!inner) els.push(G('owaves', 0, H * 0.6, W, H * 0.1, [T.title, T.acc], { layers: 2, amp: 1.2 }), box(0, H * 0.68, W, H * 0.32, { fill: T.title, fill2: T.acc, gradAngle: 135, name: 'Colour band' }));
      else els.push(box(0, 0, W, 4 * u, { fill: T.title, fill2: T.acc, gradAngle: 90, name: 'Top band' }), box(0, H - 4 * u, W, 4 * u, { fill: T.title, fill2: T.acc, gradAngle: 90, name: 'Bottom band' }));
      break;
    default: // wash
      [[-10, -8, 50, T.bg2], [70, 20, 44, mix(T.bg2, T.acc, 0.2)], [-14, 96, 56, mix(T.bg2, '#FFFFFF', 0.2)], [64, 110, 48, T.bg2]].forEach(([x, y, d, c]) => els.push(box(x * u, y * u, d * u, d * u, { fill: c, radius: Math.round((d * u) / 2), opacity: 0.85, name: 'Wash' })));
      els.push(box(4 * u, 4 * u, W - 8 * u, H - 8 * u, { stroke: T.gold, strokeW: 1, name: 'Frame' }));
  }
  return { els, bg };
}

const weddingTime = (D) => D.events.find((e) => /विवाह|wedding/i.test(e.name))?.time || '';
const photoSlot = (shape, x, y, w, h, ring, label) => slotEl('person', Math.round(x), Math.round(y), Math.round(w), Math.round(h), { mask: shape, stroke: ring, strokeW: Math.round(Math.max(3, Math.min(w, h) * 0.03)), phBg: '#F1F5F9', phBg2: '#CBD5E1', name: label, slot: label });

function front(dz, D, W_, W, H, single) {
  const u = W / 100, P = dz.parts, T = theme(dz), F = fonts(['amita', 'rozha', 'yatra', 'eczar', 'palanquin', 'tiro'][dz.no % 6], D.lang === 'hi');
  const K = { ink: T.title, acc: T.acc, paper: T.paper, soft: T.soft, colour: true, iconKind: T.iconKind };
  const bd = backdrop(dz, T, W, H, u);
  const els = [...bd.els];
  // decorative layer
  if (P.motif === 'mandala') els.push(G('omandala', W / 2 - 34 * u, 2 * u, 68 * u, 68 * u, [T.dark ? T.gold : mix(T.title, T.bg, 0.7), T.acc, T.dark ? T.gold : mix(T.title, T.bg, 0.6)], { style: 'line', layers: 4 }, { seed: dz.no, opacity: T.dark ? 0.35 : 0.5 }));
  else if (P.motif === 'paisley') els.push(G('opaisley', 6 * u, 1.5 * u, W - 12 * u, 5 * u, [T.dark ? T.gold : T.title, T.acc, T.dark ? T.gold : T.title], { kind: 'border' }), G('opaisley', 6 * u, H - 6.5 * u, W - 12 * u, 5 * u, [T.dark ? T.gold : T.title, T.acc, T.dark ? T.gold : T.title], { kind: 'border' }));
  else els.push(G('oflora', -4 * u, H * 0.42, 22 * u, 22 * u, ['#E57373', '#F8BBD0', '#81C784'], { kind: 'bunch' }, { opacity: 0.55 }), G('oflora', W - 18 * u, H * 0.3, 22 * u, 22 * u, ['#E57373', '#F8BBD0', '#81C784'], { kind: 'bunch' }, { opacity: 0.55 }));
  const g = D.groom, b = D.bride;
  const ec = T.dark ? { ink: T.gold, acc: T.gold, paper: T.bg, colour: false } : K;
  const wave = P.photo === 'wave';
  // heading
  const em = wave ? 11 * u : 14 * u;
  els.push(emblem(P.header, ec, W / 2 - em / 2, 5 * u, em));
  els.push(...flow([it(D.invoke, 2.6 * u, F.body, T.dark ? T.gold : T.title, { weight: '700', wide: F.bw })], { x: 12 * u, y: 5 * u + em + 0.5 * u, w: 76 * u, h: 4 * u }));
  let y = 5 * u + em + 5 * u;
  // photo
  if (!wave) {
    const ph = 34 * u;
    if (P.photo === 'circles') {
      els.push(photoSlot('circle', 8 * u, y, ph, ph, T.gold, 'Groom photo'), photoSlot('circle', W - 8 * u - ph, y, ph, ph, T.gold, 'Bride photo'));
      els.push(sideOrn(P.header === 'om' ? 'swastik' : 'kalash', K, W / 2 - 7 * u, y + ph / 2 - 7 * u, 14 * u));
    } else if (P.photo === 'arch') els.push(photoSlot('arch', W / 2 - 22 * u, y - 2 * u, 44 * u, ph + 4 * u, T.gold, 'Couple photo'));
    else if (P.photo === 'heart') els.push(photoSlot('heart', W / 2 - 21 * u, y, 42 * u, ph + 2 * u, T.gold, 'Couple photo'));
    else els.push(G('skcouple', W / 2 - 28 * u, y, 56 * u, ph, [T.title, T.acc, T.paper]));
    y += ph + 3 * u;
  }
  // names
  const nameC = T.dark ? T.title : T.title, textC = T.dark ? T.soft : T.text;
  if (P.names === 'side') {
    [[g, 4 * u], [b, 54 * u]].forEach(([p, x]) => els.push(...flow([it(p.pre, 2.4 * u, F.body, nameC, { weight: '700', wide: F.bw }), it(p.name, 5.6 * u, F.name, nameC, { wide: F.nw, gap: 0.5 * u }), it(p.parents, 2 * u, F.body, textC, { wide: F.bw, lh: 1.3 })], { x, y, w: 42 * u, h: 20 * u })));
    els.push(...flow([it(W_.sang, 4 * u, F.script, T.acc, { wide: F.sw })], { x: 44 * u, y: y + 5 * u, w: 12 * u, h: 7 * u }));
    y += 21 * u;
  } else if (P.names === 'stack') {
    els.push(...flow([it(`${g.pre} ${g.name}`, 5.6 * u, F.name, nameC, { wide: F.nw, gap: 0.4 * u }), it(W_.sang, 3.6 * u, F.script, T.acc, { wide: F.sw, gap: 0.4 * u }), it(`${b.pre} ${b.name}`, 5.6 * u, F.name, nameC, { wide: F.nw })], { x: 10 * u, y, w: 80 * u, h: 22 * u }));
    y += 23 * u;
  } else {
    els.push(...flow([it(`${g.name.split(' ')[0]}  ${D.lang === 'hi' ? '❤' : '&'}  ${b.name.split(' ')[0]}`, 9 * u, F.title, nameC, { wide: F.tw, el: { fill2: T.gold, gradAngle: 90 } })], { x: 6 * u, y, w: 88 * u, h: 13 * u }));
    els.push(...flow([it(`${g.parents} · ${b.parents}`, 1.9 * u, F.body, textC, { wide: F.bw, lh: 1.3 })], { x: 8 * u, y: y + 13 * u, w: 84 * u, h: 6 * u }));
    y += 20 * u;
  }
  // details
  const detailsBottom = wave ? H * 0.6 : (single ? 110 : 116) * u;
  const dh = detailsBottom - y;
  if (P.details === 'bars') {
    const bar = (yy, text) => [box(26 * u, yy, 48 * u, 5 * u, { fill: T.title, fill2: mix(T.title, '#FFFFFF', 0.35), gradAngle: 90, radius: Math.round(0.8 * u), name: 'Heading bar' }), ...flow([it(`❖ ${text} ❖`, 2.5 * u, F.name, T.dark ? T.bg : '#FFFFFF', { wide: F.nw })], { x: 26 * u, y: yy, w: 48 * u, h: 5 * u })];
    els.push(...bar(y, W_.shubh), ...flow([it(`${D.date}\n${weddingTime(D)}`, 2.6 * u, F.body, textC, { wide: F.bw, weight: '700', lh: 1.35 })], { x: 10 * u, y: y + 5.6 * u, w: 80 * u, h: dh * 0.36 - 5.6 * u }));
    const y2 = y + dh * 0.42;
    els.push(...bar(y2, W_.venue), ...flow([it(D.venue, 2.4 * u, F.body, textC, { wide: F.bw, lh: 1.35 })], { x: 10 * u, y: y2 + 5.6 * u, w: 80 * u, h: dh * 0.58 - 5.6 * u }));
  } else if (P.details === 'table') {
    els.push(...program('table', D, F, { ink: T.dark ? T.title : T.text, acc: T.acc, paper: T.paper, soft: textC, colour: true }, { x: 6 * u, y, w: 88 * u, h: dh * 0.72 }, u));
    els.push(...flow([it(`${W_.venue}: ${D.venue}`, 2.2 * u, F.body, textC, { wide: F.bw, weight: '600', lh: 1.3 })], { x: 8 * u, y: y + dh * 0.74, w: 84 * u, h: dh * 0.26 }));
  } else {
    els.push(...flow([it(W_.shubh, 8 * u, F.title, T.dark ? T.gold : T.acc, { wide: F.tw, gap: 0.6 * u }), it(`${D.date} · ${weddingTime(D)}`, 2.6 * u, F.body, textC, { wide: F.bw, weight: '700', gap: 0.8 * u })], { x: 10 * u, y, w: 80 * u, h: dh * 0.55 }));
    els.push(G('odivider', 25 * u, y + dh * 0.56, 50 * u, 4 * u, [T.dark ? T.gold : T.title, T.acc, T.dark ? T.gold : T.title], { kind: 'scroll', center: 'lotus' }));
    els.push(...flow([it(D.venue, 2.3 * u, F.body, textC, { wide: F.bw, lh: 1.35 })], { x: 10 * u, y: y + dh * 0.62, w: 80 * u, h: dh * 0.38 }));
  }
  // bottom: colour wave with the couple photo, or a footer
  if (wave) {
    els.push(G('owaves', 0, H * 0.6, W, H * 0.1, [T.title, T.acc], { layers: 2, amp: 1.2 }), box(0, H * 0.68, W, H * 0.32, { fill: T.title, fill2: T.acc, gradAngle: 135, name: 'Colour band' }));
    els.push(slotEl('person', Math.round(2 * u), Math.round(H * 0.6), Math.round(50 * u), Math.round(H * 0.4), { cutout: true, phColor: 'rgba(255,255,255,0.65)', name: 'Couple photo', slot: 'Couple photo' }));
    els.push(...flow([it(D.family, 5.4 * u, F.title, '#FFFFFF', { wide: F.tw, gap: 0.6 * u }), it(W_.invite, 2.4 * u, F.name, '#FFFFFF', { wide: F.nw, gap: 1.4 * u }), it(`${W_.vineet}: ${D.vineet}`, 2.1 * u, F.body, '#FFFFFF', { wide: F.bw, weight: '700' })], { x: 52 * u, y: H * 0.72, w: 45 * u, h: 22 * u }));
  }
  const fy = 118 * u;
  if (P.footer === 'qr') {
    const q = wave ? 15 * u : 16 * u, qx = wave ? 80 * u : W / 2 - q / 2, qy = wave ? H - q - 6 * u : fy - 1 * u;
    els.push(qrEl(D.map, qx, qy, q, '#111111', '#FFFFFF'), ...flow([it(W_.scan, 1.6 * u, F.body, wave ? '#FFFFFF' : textC, { wide: F.bw, weight: '700' })], { x: qx - 6 * u, y: qy + q + 0.4 * u, w: q + 12 * u, h: 3 * u }));
  } else if (P.footer === 'baraat') els.push(G('skbaraat', wave ? 54 * u : 22 * u, wave ? H - 14 * u : fy, wave ? 42 * u : 56 * u, wave ? 12 * u : 17 * u, wave ? ['#FFFFFF', T.gold, T.title] : [T.title, T.acc, T.paper], { mirror: true }));
  else if (P.footer === 'dhol') els.push(G('pdhol', wave ? 72 * u : 36 * u, wave ? H - 15 * u : fy, wave ? 24 * u : 28 * u, wave ? 13 * u : 16 * u, [wave ? '#FFFFFF' : T.title, T.gold, T.title], { style: 'fill' }));
  else if (!wave) els.push(G('oflora', 2 * u, H - 28 * u, 26 * u, 26 * u, ['#E57373', '#F8BBD0', '#81C784'], { kind: 'corner' }, { opacity: 0.7 }), G('oflora', W - 28 * u, H - 28 * u, 26 * u, 26 * u, ['#E57373', '#F8BBD0', '#81C784'], { kind: 'corner' }, { opacity: 0.7, rot: 90 }));
  if (single && !wave) els.push(...flow([it(`${W_.vineet}: ${D.vineet}${D.phone ? ` · ${D.phone}` : ''}`, 2 * u, F.body, textC, { wide: F.bw, weight: '700' })], { x: 8 * u, y: 111.5 * u, w: 84 * u, h: 4 * u }));
  return { name: 'Card', bg: bd.bg, elements: els };
}

function inner(dz, D, W_, W, H, kind) {
  const u = W / 100, T = theme(dz), F = fonts(['amita', 'rozha', 'yatra', 'eczar', 'palanquin', 'tiro'][dz.no % 6], D.lang === 'hi');
  const C = T.dark ? { ink: T.title, acc: T.gold, paper: T.bg, soft: T.soft, colour: true, iconKind: T.iconKind } : { ink: T.text, acc: T.title, paper: T.paper, soft: T.soft, colour: true, iconKind: T.iconKind };
  const bd = backdrop(dz, T, W, H, u, true);
  const els = [...bd.els];
  const x = 12 * u, w = 76 * u;
  els.push(emblem(dz.parts.header, T.dark ? { ink: T.gold, acc: T.gold, paper: T.bg } : { ...C, colour: true }, W / 2 - 6 * u, 9 * u, 12 * u));
  els.push(...flow([it(D.invoke, 2.6 * u, F.body, C.acc, { weight: '700', wide: F.bw })], { x, y: 22 * u, w, h: 4 * u }));
  if (kind === 'invite') {
    els.push(...flow([it(W_.dear, 3 * u, F.name, C.ink, { wide: F.nw, gap: 0.4 * u }), it(`${W_.blessing} ${D.side === 'bride' ? W_.ourDaughter : W_.ourSon}`, 2.4 * u, F.body, C.soft, { wide: F.bw })], { x, y: 28 * u, w, h: 9 * u }));
    const first = D.side === 'bride' ? D.bride : D.groom, second = D.side === 'bride' ? D.groom : D.bride;
    const st = ['big', 'script', 'ribbon'][dz.no % 3];
    els.push(...person(st, first, F, C, { x, y: 39 * u, w, h: 17 * u }, u * 1.15));
    els.push(...sang(W_.sang, F, C, W / 2 - 13 * u, 57 * u, 26 * u, 12 * u));
    els.push(...person(st, second, F, C, { x, y: 70 * u, w, h: 17 * u }, u * 1.15));
    els.push(...flow([it(W_.parinay, 4.4 * u, F.title, C.acc, { wide: F.tw, gap: u }), it(W_.outro, 2.3 * u, F.body, C.ink, { wide: F.bw, lh: 1.45, gap: u }), it(D.date, 3 * u, F.name, C.acc, { wide: F.nw })], { x, y: 89 * u, w, h: 33 * u }));
  } else if (kind === 'program') {
    els.push(...flow([it(D.programTitle, 6 * u, F.title, C.acc, { wide: F.tw })], { x, y: 28 * u, w, h: 9 * u }));
    els.push(...program(['pills', 'timeline', 'medallion'][dz.no % 3], D, F, C, { x, y: 40 * u, w, h: 48 * u }, u));
    els.push(hline(x, 92 * u, w, C.acc, 0.3 * u));
    els.push(...flow([it(W_.venue, 3.2 * u, F.name, C.acc, { wide: F.nw, gap: 0.6 * u }), it(D.venue, 2.4 * u, F.body, C.ink, { wide: F.bw, lh: 1.35, gap: 1.2 * u }), it(D.baraat, 2.2 * u, F.body, C.soft, { wide: F.bw, lh: 1.35 })], { x, y: 94 * u, w, h: 20 * u }));
    els.push(G('skbaraat', 20 * u, H - 22 * u, 60 * u, 16 * u, [C.ink, C.acc, C.paper]));
  } else {
    els.push(...flow([it(D.reception, 5 * u, F.title, C.acc, { wide: F.tw, gap: 0.8 * u }), it(D.receptionWhen, 2.6 * u, F.body, C.ink, { wide: F.bw, weight: '700', gap: 0.5 * u }), it(D.receptionWhere, 2.4 * u, F.body, C.soft, { wide: F.bw })], { x, y: 28 * u, w, h: 20 * u }));
    els.push(qrEl(D.map, W / 2 - 11 * u, 50 * u, 22 * u, '#111111', '#FFFFFF'), ...flow([it(W_.scan, 2 * u, F.body, C.ink, { wide: F.bw, weight: '700' })], { x, y: 73 * u, w, h: 4 * u }));
    els.push(...flow([it(D.kidsTitle, 3.4 * u, F.name, C.acc, { wide: F.nw, gap: 0.5 * u }), it(D.kids, 2.3 * u, F.script, C.ink, { wide: F.sw, lh: 1.4, gap: 0.4 * u }), it(D.kidsNames, 2.2 * u, F.body, C.ink, { wide: F.bw, weight: '700' })], { x, y: 79 * u, w, h: 20 * u }));
    els.push(...lists(D, W_, F, C, { x, y: 102 * u, w, h: 28 * u }, u, 2));
  }
  return { name: kind === 'invite' ? 'Invitation' : kind === 'program' ? 'Programme' : 'Reception & RSVP', bg: bd.bg, elements: els };
}

export function buildPhoto(dz, D, W_, pages, W, H) {
  if (pages <= 1) return [front(dz, D, W_, W, H, true)];
  const f = front(dz, D, W_, W, H, false);
  const rest = [inner(dz, D, W_, W, H, 'invite'), inner(dz, D, W_, W, H, 'program'), inner(dz, D, W_, W, H, 'rsvp')];
  return [f, ...rest.slice(0, pages - 1)];
}
