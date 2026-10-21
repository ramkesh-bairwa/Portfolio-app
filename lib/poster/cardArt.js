// Wedding & ceremony card artwork: Ganesha line-art, crescent, rings, cross, jaali lattice, brocade buti,
// saree-border bands, palace skyline and royal drapes. Same signature as the other families: (w, h, colours, seed, id, params).
import { f, leaf, svg } from './graphics';

const line = (d, c, w, extra = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
// Draw in a 100×100 box, fitted and centred in w×h
const fit = (w, h, body, defs = '') => {
  const S = Math.min(w, h) / 100;
  return svg(w, h, `<g transform="translate(${f((w - 100 * S) / 2)} ${f((h - 100 * S) / 2)}) scale(${f(S * 1000) / 1000})">${body}</g>`, defs);
};

// Frontal Ganesha head: mukut, fan ears, curled trunk, tusk, tilak. Line art, or filled with a soft tone.
function ganesha([c1, c2, c3], p) {
  const sw = p.weight || 2.2;
  const fill = p.style === 'filled';
  const soft = c3 || c2;
  let o = '';
  if (p.style === 'halo') {
    o += `<circle cx="50" cy="47" r="46" fill="none" stroke="${c1}" stroke-width="${f(sw * 0.5)}" opacity=".7"/>`;
    for (let i = 0; i < 36; i++) { const a = (i / 36) * Math.PI * 2; o += `<circle cx="${f(50 + Math.cos(a) * 42)}" cy="${f(47 + Math.sin(a) * 42)}" r="${i % 3 ? 0.7 : 1.3}" fill="${c2}"/>`; }
  }
  const earL = 'M38 33 C26 22 9 29 11 46 C12 58 22 66 33 61 C36 59.5 38.5 57 40 54';
  const earR = 'M62 33 C74 22 91 29 89 46 C88 58 78 66 67 61 C64 59.5 61.5 57 60 54';
  const head = 'M38 31 C36 40 37 49 42 54 M62 31 C64 40 63 49 58 54';
  const trunk = 'M45 44 C44.5 57 42.5 69 48.5 78 C53 84.5 62.5 85 65.5 78.5 C67.5 73.5 63 69.5 59 72.5';
  const trunk2 = 'M55 44 C55.2 55 53.5 65 54.6 70.5 C55.6 75 58.3 75.4 59 72.5';
  if (fill) {
    o += `<path d="${earL} C38 48 38 38 38 33Z" fill="${soft}"/><path d="${earR} C62 48 62 38 62 33Z" fill="${soft}"/>`;
    o += `<path d="M38 31 C36 40 37 49 42 54 L45 44 L55 44 L58 54 C63 49 64 40 62 31Z" fill="${soft}"/>`;
    o += `<path d="${trunk} C58.3 75.4 55.6 75 54.6 70.5 C53.5 65 55.2 55 55 44Z" fill="${soft}"/>`;
  }
  // mukut (crown) with three tiers and a finial
  o += `<path d="M37.5 31 L39.5 21 Q50 10 60.5 21 L62.5 31Z" fill="${fill ? c2 : 'none'}" stroke="${c1}" stroke-width="${f(sw)}" stroke-linejoin="round"/>`;
  o += line('M38.6 26 H61.4 M41 21 Q50 17.5 59 21', c1, sw * 0.6);
  o += `<circle cx="50" cy="9.5" r="2.2" fill="${c2}" stroke="${c1}" stroke-width="${f(sw * 0.5)}"/>` + line('M50 11.8 V14.5', c1, sw * 0.7);
  [44, 50, 56].forEach((x) => { o += `<circle cx="${x}" cy="28.5" r="1" fill="${c2}"/>`; });
  // ears with inner folds
  o += line(earL, c1, sw) + line(earR, c1, sw);
  o += line('M36 37 C27 32 18 38 19.5 47 C20.5 53 26 56.5 32 54.5', c1, sw * 0.55) + line('M64 37 C73 32 82 38 80.5 47 C79.5 53 74 56.5 68 54.5', c1, sw * 0.55);
  o += line(head, c1, sw);
  // eyes, tilak
  o += line('M42 40 Q44.6 38.2 47.2 40', c1, sw * 0.75) + line('M52.8 40 Q55.4 38.2 58 40', c1, sw * 0.75);
  o += line('M47.8 31.5 Q50 37.5 52.2 31.5', c2, sw * 0.8) + `<circle cx="50" cy="35.6" r="1.1" fill="${p.dot || '#DC2626'}"/>`;
  // trunk with folds, tusk
  o += line(trunk, c1, sw) + line(trunk2, c1, sw);
  o += line('M45.6 52 Q50 54 54.8 52 M45.2 58 Q49.5 60 54.3 58 M45.4 64 Q49.4 66 54 64', c1, sw * 0.45);
  o += line('M58.3 53 Q63.5 56.5 61.5 62', c1, sw * 0.9);
  // modak hand hint below: a small lotus seat
  if (p.seat !== false) o += line('M30 92 Q50 84 70 92 M36 92 Q42 86 50 92 Q58 86 64 92', c2, sw * 0.7);
  return o;
}

export const CARD_ART = {
  oganesh(w, h, cols, seed, id, p) {
    return fit(w, h, ganesha(cols, p));
  },

  // Crescent moon and star, optionally over a dome and minarets
  ocrescent(w, h, [c1, c2, c3], seed, id, p) {
    let o = '';
    if (p.kind === 'mosque') {
      o += `<path d="M22 92 V62 Q22 44 50 38 Q78 44 78 62 V92Z" fill="${c3 || 'none'}" stroke="${c1}" stroke-width="1.6"/>`;
      o += `<path d="M10 92 V52 L13 46 L16 52 V92 M84 92 V52 L87 46 L90 52 V92" fill="none" stroke="${c1}" stroke-width="1.6" stroke-linejoin="round"/>`;
      o += `<path d="M40 92 V74 Q50 62 60 74 V92" fill="none" stroke="${c2}" stroke-width="1.4"/><path d="M4 92 H96" stroke="${c1}" stroke-width="1.6"/>`;
      o += `<path d="M50 38 V30" stroke="${c1}" stroke-width="1.4"/>`;
      o += `<path d="M56 6 A16 16 0 1 0 56 34 A12.5 12.5 0 1 1 56 6Z" fill="${c2}" transform="translate(-6 -2) scale(1)"/>`;
      o += `<path d="M62 14 l1.6 3.6 3.9.4-2.9 2.6.9 3.8-3.5-2-3.5 2 .9-3.8-2.9-2.6 3.9-.4Z" fill="${c2}"/>`;
      return fit(w, h, o);
    }
    o += `<path d="M62 14 A40 40 0 1 0 62 86 A44 44 0 0 1 62 14Z" fill="${c1}"/>`;
    o += `<path d="M74 34 l3.4 7.6 8.2.8-6.2 5.4 1.9 8-7.3-4.3-7.3 4.3 1.9-8-6.2-5.4 8.2-.8Z" fill="${c2}"/>`;
    return fit(w, h, o);
  },

  // Two interlocked rings with a diamond, for Christian weddings and anniversaries
  orings(w, h, [c1, c2], seed, id, p) {
    const o = `<circle cx="40" cy="58" r="22" fill="none" stroke="${c1}" stroke-width="4.5"/><circle cx="60" cy="58" r="22" fill="none" stroke="${c2 || c1}" stroke-width="4.5"/>`
      + `<path d="M54 30 L60 24 L66 30 L60 38Z" fill="${c2 || c1}" stroke="${c1}" stroke-width="1"/><path d="M54 30 H66 M60 24 V38" stroke="#FFFFFF" stroke-width=".6" opacity=".7"/>`
      + (p.hearts ? `<path d="M50 14 C46 8 38 12 42 18 L50 25 L58 18 C62 12 54 8 50 14Z" fill="${c1}"/>` : '');
    return fit(w, h, o);
  },

  // Cross with a floral flourish
  ocross(w, h, [c1, c2], seed, id) {
    let o = `<path d="M46 8 H54 V30 H74 V38 H54 V90 H46 V38 H26 V30 H46Z" fill="${c1}"/>`;
    o += line('M30 70 C20 66 16 56 22 50 M70 70 C80 66 84 56 78 50', c2 || c1, 1.6);
    o += leaf(30, 70, 12, 150, c2 || c1) + leaf(70, 70, 12, 30, c2 || c1) + leaf(24, 58, 10, 200, c2 || c1) + leaf(76, 58, 10, -20, c2 || c1);
    return fit(w, h, o);
  },

  // Khanda-free Sikh emblem: a lotus with rays (the Ik Onkar itself is set as text so it uses a Gurmukhi font)
  olotusrays(w, h, [c1, c2], seed, id) {
    let o = '';
    for (let i = 0; i < 24; i++) { const a = Math.PI + (i / 23) * Math.PI; o += line(`M${f(50 + Math.cos(a) * 30)} ${f(70 + Math.sin(a) * 30)} L${f(50 + Math.cos(a) * 44)} ${f(70 + Math.sin(a) * 44)}`, c2 || c1, 1.2); }
    [[-60, 0.7], [-30, 0.88], [0, 1], [30, 0.88], [60, 0.7]].forEach(([deg, k]) => {
      o += `<path d="M0 0 Q9 -16 0 -32 Q-9 -16 0 0Z" transform="translate(50 74) rotate(${deg}) scale(${k})" fill="${c1}" opacity="${0.55 + k * 0.4}"/>`;
    });
    o += line('M24 76 Q50 86 76 76', c1, 2);
    return fit(w, h, o);
  },

  // Repeating lattice (jaali) across the whole box
  ojaali(w, h, [c1], seed, id, p) {
    const S = Math.max(12, Math.min(w, h) * (p.scale || 0.1));
    const sw = Math.max(0.8, S * (p.weight || 0.035));
    const k = S / 100;
    const motif = {
      ogee: `<path d="M50 0 C50 25 0 25 0 50 C0 75 50 75 50 100 C50 75 100 75 100 50 C100 25 50 25 50 0Z" fill="none" stroke="${c1}" stroke-width="${f(sw / k)}"/><circle cx="50" cy="50" r="6" fill="${c1}"/>`,
      quatrefoil: `<path d="M50 14 C62 14 66 26 66 34 C74 34 86 38 86 50 C86 62 74 66 66 66 C66 74 62 86 50 86 C38 86 34 74 34 66 C26 66 14 62 14 50 C14 38 26 34 34 34 C34 26 38 14 50 14Z" fill="none" stroke="${c1}" stroke-width="${f(sw / k)}"/><circle cx="0" cy="0" r="7" fill="${c1}"/><circle cx="100" cy="0" r="7" fill="${c1}"/><circle cx="0" cy="100" r="7" fill="${c1}"/><circle cx="100" cy="100" r="7" fill="${c1}"/>`,
      star: `<path d="M50 8 L62 38 L92 50 L62 62 L50 92 L38 62 L8 50 L38 38Z" fill="none" stroke="${c1}" stroke-width="${f(sw / k)}"/><rect x="29" y="29" width="42" height="42" transform="rotate(45 50 50)" fill="none" stroke="${c1}" stroke-width="${f(sw / k)}"/><circle cx="50" cy="50" r="5" fill="${c1}"/>`,
      diamond: `<path d="M50 0 L100 50 L50 100 L0 50Z" fill="none" stroke="${c1}" stroke-width="${f(sw / k)}"/><path d="M50 22 L78 50 L50 78 L22 50Z" fill="none" stroke="${c1}" stroke-width="${f(sw / k / 2)}"/><circle cx="50" cy="50" r="4" fill="${c1}"/>`,
    }[p.kind || 'ogee'];
    const pid = `${id}jl`;
    return svg(w, h, `<rect width="${f(w)}" height="${f(h)}" fill="url(#${pid})"/>`, `<pattern id="${pid}" width="${f(S)}" height="${f(S)}" patternUnits="userSpaceOnUse" x="${f((w % S) / 2)}" y="${f((h % S) / 2)}"><g transform="scale(${f(k * 1000) / 1000})">${motif}</g></pattern>`);
  },

  // Brocade (Banarasi) butis on a half-drop grid
  obuti(w, h, [c1, c2], seed, id, p) {
    const S = Math.max(14, Math.min(w, h) * (p.scale || 0.09));
    const k = S / 100;
    const b = {
      flower: [0, 1, 2, 3, 4, 5].map((i) => `<ellipse cx="50" cy="38" rx="6" ry="12" transform="rotate(${i * 60} 50 50)" fill="${c1}"/>`).join('') + `<circle cx="50" cy="50" r="6" fill="${c2 || c1}"/>`,
      paisley: `<path d="M46 80 C30 80 22 68 24 56 C26 44 38 38 48 36 C56 34 60 28 58 20 C68 26 74 38 72 52 C70 68 60 80 46 80Z" fill="${c1}"/><circle cx="44" cy="60" r="6" fill="${c2 || c1}"/>`,
      leaf: `<path d="M50 20 Q66 40 50 80 Q34 40 50 20Z" fill="${c1}"/><path d="M50 26 V76" stroke="${c2 || c1}" stroke-width="2"/>`,
      dot: `<circle cx="50" cy="50" r="9" fill="${c1}"/><circle cx="50" cy="50" r="16" fill="none" stroke="${c2 || c1}" stroke-width="2"/>`,
      lotus: `<path d="M50 30 Q60 46 50 66 Q40 46 50 30Z M50 66 Q30 60 26 44 Q42 46 50 66Z M50 66 Q70 60 74 44 Q58 46 50 66Z" fill="${c1}"/><path d="M34 70 Q50 76 66 70" stroke="${c2 || c1}" stroke-width="3" fill="none"/>`,
    }[p.kind || 'flower'];
    const pid = `${id}bt`;
    const cell = `<g transform="scale(${f(k * 1000) / 1000})">${b}<g transform="translate(50 100) scale(.55) translate(-50 -50)">${b}</g><g transform="translate(-50 100) scale(.55) translate(-50 -50)">${b}</g></g>`;
    return svg(w, h, `<rect width="${f(w)}" height="${f(h)}" fill="url(#${pid})"/>`, `<pattern id="${pid}" width="${f(S)}" height="${f(S * 2)}" patternUnits="userSpaceOnUse"><g>${cell}</g><g transform="translate(${f(S / 2)} ${f(S)})">${cell}</g></pattern>`);
  },

  // Saree-border band: temple triangles, zari stripes, rudraksha beads or lotus row
  oband(w, h, [c1, c2, c3], seed, id, p) {
    let o = `<rect width="${f(w)}" height="${f(h)}" fill="${c1}"/>`;
    const t = Math.max(1, h * 0.05);
    o += `<rect y="${f(t)}" width="${f(w)}" height="${f(t)}" fill="${c2}"/><rect y="${f(h - 2 * t)}" width="${f(w)}" height="${f(t)}" fill="${c2}"/>`;
    const inner = h - 6 * t;
    const y0 = 3 * t;
    if (p.kind === 'temple') {
      const n = Math.max(4, Math.round(w / inner));
      const step = w / n;
      for (let i = 0; i < n; i++) {
        const x = i * step;
        o += `<path d="M${f(x)} ${f(y0 + inner)} L${f(x + step / 2)} ${f(y0)} L${f(x + step)} ${f(y0 + inner)}Z" fill="${c2}"/><path d="M${f(x + step * 0.25)} ${f(y0 + inner)} L${f(x + step / 2)} ${f(y0 + inner * 0.45)} L${f(x + step * 0.75)} ${f(y0 + inner)}Z" fill="${c3 || c1}"/>`;
      }
    } else if (p.kind === 'beads') {
      const r = inner * 0.32;
      for (let x = r * 1.4; x < w; x += r * 2.8) o += `<circle cx="${f(x)}" cy="${f(y0 + inner / 2)}" r="${f(r)}" fill="${c2}"/><circle cx="${f(x)}" cy="${f(y0 + inner / 2)}" r="${f(r * 0.4)}" fill="${c3 || c1}"/>`;
    } else if (p.kind === 'lotus') {
      const n = Math.max(4, Math.round(w / (inner * 1.4)));
      const step = w / n;
      for (let i = 0; i < n; i++) {
        const cx = (i + 0.5) * step;
        const by = y0 + inner * 0.95;
        o += `<path d="M${f(cx)} ${f(y0 + inner * 0.05)} Q${f(cx + inner * 0.28)} ${f(y0 + inner * 0.5)} ${f(cx)} ${f(by)} Q${f(cx - inner * 0.28)} ${f(y0 + inner * 0.5)} ${f(cx)} ${f(y0 + inner * 0.05)}Z M${f(cx)} ${f(by)} Q${f(cx - inner * 0.6)} ${f(by - inner * 0.1)} ${f(cx - inner * 0.62)} ${f(y0 + inner * 0.4)} Q${f(cx - inner * 0.2)} ${f(y0 + inner * 0.55)} ${f(cx)} ${f(by)}Z M${f(cx)} ${f(by)} Q${f(cx + inner * 0.6)} ${f(by - inner * 0.1)} ${f(cx + inner * 0.62)} ${f(y0 + inner * 0.4)} Q${f(cx + inner * 0.2)} ${f(y0 + inner * 0.55)} ${f(cx)} ${f(by)}Z" fill="${c2}"/>`;
      }
    } else {
      // zari: fine diagonal lines between two gold rules
      const g = Math.max(3, inner * 0.35);
      for (let x = -inner; x < w + inner; x += g) o += `<path d="M${f(x)} ${f(y0 + inner)} L${f(x + inner)} ${f(y0)}" stroke="${c2}" stroke-width="${f(Math.max(0.8, g * 0.18))}" clip-path="url(#${id}bc)"/>`;
    }
    return svg(w, h, o, `<clipPath id="${id}bc"><rect width="${f(w)}" height="${f(h)}"/></clipPath>`);
  },

  // Rajasthani palace skyline: domes, chhatris, arched windows
  opalace(w, h, [c1, c2], seed, id) {
    const base = h;
    let o = '';
    const dome = (cx, top, rw, rh) => `<path d="M${f(cx - rw)} ${f(top + rh)} Q${f(cx - rw)} ${f(top + rh * 0.15)} ${f(cx)} ${f(top)} Q${f(cx + rw)} ${f(top + rh * 0.15)} ${f(cx + rw)} ${f(top + rh)}Z" fill="${c1}"/><path d="M${f(cx)} ${f(top)} V${f(top - rh * 0.35)}" stroke="${c1}" stroke-width="${f(Math.max(1, rw * 0.08))}"/>`;
    const block = (x, top, bw) => {
      let s = `<rect x="${f(x)}" y="${f(top)}" width="${f(bw)}" height="${f(base - top)}" fill="${c1}"/>`;
      const n = Math.max(2, Math.round(bw / (h * 0.12)));
      const ww = bw / n;
      for (let i = 0; i < n; i++) {
        const wx = x + i * ww + ww * 0.25;
        const wy = top + (base - top) * 0.25;
        s += `<path d="M${f(wx)} ${f(wy + ww)} V${f(wy + ww * 0.35)} Q${f(wx + ww * 0.25)} ${f(wy)} ${f(wx + ww * 0.5)} ${f(wy + ww * 0.35)} V${f(wy + ww)}Z" fill="${c2}"/>`;
      }
      return s;
    };
    o += block(0, h * 0.55, w * 0.22) + dome(w * 0.11, h * 0.32, w * 0.06, h * 0.23);
    o += block(w * 0.22, h * 0.42, w * 0.18) + dome(w * 0.31, h * 0.2, w * 0.05, h * 0.22);
    o += block(w * 0.4, h * 0.3, w * 0.2) + dome(w * 0.5, h * 0.02, w * 0.085, h * 0.28);
    o += block(w * 0.6, h * 0.42, w * 0.18) + dome(w * 0.69, h * 0.2, w * 0.05, h * 0.22);
    o += block(w * 0.78, h * 0.55, w * 0.22) + dome(w * 0.89, h * 0.32, w * 0.06, h * 0.23);
    return svg(w, h, o);
  },

  // Royal drapes (pelmet swags with tassels) hanging from the top edge
  odrape(w, h, [c1, c2, c3], seed, id, p) {
    const n = p.n || 4;
    const sw = w / n;
    let o = '';
    for (let i = 0; i < n; i++) {
      const x = i * sw;
      o += `<path d="M${f(x)} 0 H${f(x + sw)} V${f(h * 0.18)} Q${f(x + sw / 2)} ${f(h * 0.95)} ${f(x)} ${f(h * 0.18)}Z" fill="url(#${id}dr)"/>`;
      o += line(`M${f(x + sw * 0.08)} ${f(h * 0.28)} Q${f(x + sw / 2)} ${f(h * 0.82)} ${f(x + sw * 0.92)} ${f(h * 0.28)}`, c2, Math.max(1, h * 0.02));
    }
    for (let i = 0; i <= n; i++) {
      const x = i * sw;
      o += line(`M${f(x)} ${f(h * 0.16)} V${f(h * 0.55)}`, c2, Math.max(1, h * 0.018));
      o += `<path d="M${f(x)} ${f(h * 0.55)} l${f(-h * 0.06)} ${f(h * 0.3)} h${f(h * 0.12)}Z" fill="${c2}"/><circle cx="${f(x)}" cy="${f(h * 0.55)}" r="${f(h * 0.04)}" fill="${c3 || c2}"/>`;
    }
    o += `<rect width="${f(w)}" height="${f(h * 0.12)}" fill="${c2}"/><rect y="${f(h * 0.12)}" width="${f(w)}" height="${f(h * 0.04)}" fill="${c1}"/>`;
    return svg(w, h, o, `<linearGradient id="${id}dr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c3 || c1}"/></linearGradient>`);
  },

  // Monogram ring: thin double circle with dots, for initials set on top as text
  omonogram(w, h, [c1, c2], seed, id) {
    let o = `<circle cx="50" cy="50" r="47" fill="none" stroke="${c1}" stroke-width="1.2"/><circle cx="50" cy="50" r="43" fill="none" stroke="${c1}" stroke-width=".5"/>`;
    for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + Math.PI / 4; o += `<circle cx="${f(50 + Math.cos(a) * 45)}" cy="${f(50 + Math.sin(a) * 45)}" r="1.6" fill="${c2 || c1}"/>`; }
    o += leaf(50, 3, 8, 180, c2 || c1) + leaf(50, 3, 8, 0, c2 || c1) + leaf(50, 97, 8, 180, c2 || c1) + leaf(50, 97, 8, 0, c2 || c1);
    return fit(w, h, o);
  },
};
