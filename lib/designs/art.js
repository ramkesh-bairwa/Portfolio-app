// Product illustrations, each drawn in a 200×200 box. k: colours from artColors().
import { circ, ell, g, line, mix, path, poly, rect } from './core';

export function artColors(pal, metal = 'gold') {
  const M = metal === 'gold' ? ['#F8E7B0', '#D4AF5A', '#9A7428'] : metal === 'rose' ? ['#F9DCD2', '#D99A86', '#A0624F'] : ['#F4F6F9', '#BCC3CE', '#7D8796'];
  return {
    main: pal.accent, alt: pal.accent2, dark: mix(pal.ink, '#000000', 0.25), light: mix(pal.bg, '#FFFFFF', 0.6),
    metal: M, gem: [mix(pal.accent2, '#FFFFFF', 0.75), mix(pal.accent2, '#FFFFFF', 0.25), mix(pal.accent2, '#000000', 0.25)],
  };
}

const shade = (c, col, a = 0.28) => c.lg([[0, mix(col, '#FFFFFF', a)], [1, mix(col, '#000000', a * 0.8)]], 0, 0, 1, 1);
const metal = (c, k, v = true) => c.lg([[0, k.metal[0]], [0.45, k.metal[1]], [1, k.metal[2]]], 0, 0, v ? 0.3 : 1, 1);
const gloss = (x, y, w, h, r = 6) => rect(x, y, w, h, '#FFFFFF', { r, op: 0.35 });
const sparkle = (x, y, s, fill = '#FFFFFF') => path(`M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z`, fill, { op: 0.9 });
const drop = (x, y, w, h) => `M${x} ${y}C${x + w * 0.2} ${y + h * 0.25} ${x + w} ${y + h * 0.5} ${x + w} ${y + h * 0.72}A${w} ${w} 0 0 1 ${x - w} ${y + h * 0.72}C${x - w} ${y + h * 0.5} ${x - w * 0.2} ${y + h * 0.25} ${x} ${y}Z`;

function gem(c, k, x, y, s) {
  const p = (dx, dy) => [x + dx * s, y + dy * s];
  return g(
    poly([p(-1, 0), p(-0.6, -0.5), p(0.6, -0.5), p(1, 0)], k.gem[0])
    + poly([p(-1, 0), p(1, 0), p(0, 1.15)], c.lg([[0, k.gem[1]], [1, k.gem[2]]], 0, 0, 1, 1))
    + path(`M${p(-0.6, -0.5)}L${p(-0.3, 0)}L${p(0, -0.5)}L${p(0.3, 0)}L${p(0.6, -0.5)}M${p(-0.3, 0)}L${p(0, 1.15)}L${p(0.3, 0)}`.replace(/,/g, ' '), 'none', { stroke: '#FFFFFF', sw: 1.4, op: 0.6, join: 'round' })
    + sparkle(x + s * 0.9, y - s * 0.75, s * 0.32),
  );
}

export const ART = {
  ring: (c, k) => g(ell(100, 124, 60, 50, 'none', { stroke: metal(c, k, false), sw: 14 }) + ell(100, 124, 60, 50, 'none', { stroke: '#FFFFFF', sw: 2, op: 0.5, dash: '60 260' })
    + poly([[84, 76], [90, 64], [110, 64], [116, 76]], metal(c, k)) + gem(c, k, 100, 54, 24)),
  necklace: (c, k) => g(path('M28 30C36 118 164 118 172 30', 'none', { stroke: metal(c, k), sw: 4, dash: '1 7', cap: 'round' })
    + path('M28 30C36 118 164 118 172 30', 'none', { stroke: k.metal[2], sw: 1, op: 0.5 })
    + circ(100, 102, 6, 'none', { stroke: metal(c, k), sw: 3 }) + path(drop(100, 108, 22, 64), c.lg([[0, k.gem[0]], [0.5, k.gem[1]], [1, k.gem[2]]], 0, 0, 1, 1))
    + path(drop(100, 116, 10, 34), '#FFFFFF', { op: 0.35 }) + sparkle(126, 120, 8)),
  earrings: (c, k) => g([62, 138].map((x) => circ(x, 38, 8, metal(c, k)) + line(x, 46, x, 72, k.metal[1], 3) + circ(x, 76, 5, metal(c, k))
    + path(drop(x, 82, 20, 80), c.lg([[0, k.gem[0]], [1, k.gem[2]]], 0, 0, 1, 1)) + path(drop(x - 4, 92, 6, 30), '#FFFFFF', { op: 0.4 })).join('') + sparkle(160, 120, 9)),
  diamond: (c, k) => g(ell(100, 172, 52, 7, k.dark, { op: 0.12 }) + gem(c, k, 100, 88, 58) + sparkle(40, 50, 10) + sparkle(170, 140, 7)),
  dress: (c, k) => g(line(86, 22, 90, 52, k.dark, 2.5) + line(114, 22, 110, 52, k.dark, 2.5)
    + path('M82 52Q100 60 118 52L114 96L86 96Z', shade(c, k.main)) + rect(84, 92, 32, 8, k.alt, { r: 2 })
    + path('M86 100L114 100Q140 130 164 178Q100 194 36 178Q60 130 86 100Z', shade(c, k.main, 0.2))
    + path('M100 100Q96 150 84 186M100 100Q106 150 120 186', 'none', { stroke: '#000', sw: 1.5, op: 0.12 })),
  handbag: (c, k) => g(path('M70 86C70 30 130 30 130 86', 'none', { stroke: k.dark, sw: 9, cap: 'round' })
    + path('M44 82L156 82L168 172Q168 182 158 182L42 182Q32 182 32 172Z', shade(c, k.main))
    + path('M44 82L156 82L151 120Q100 136 49 120Z', mix(k.main, '#000000', 0.18)) + rect(90, 114, 20, 16, metal(c, k), { r: 3 }) + gloss(50, 140, 6, 30, 3)),
  tshirt: (c, k) => g(path('M62 36L82 26Q100 44 118 26L138 36L176 68L154 94L140 84L140 176L60 176L60 84L46 94L24 68Z', shade(c, k.main, 0.15), { join: 'round' })
    + path('M82 26Q100 44 118 26', 'none', { stroke: '#000', sw: 3, op: 0.15 }) + circ(100, 104, 20, k.alt) + circ(100, 104, 9, k.light)),
  sunglasses: (c, k) => g(path('M20 82Q20 72 32 72L84 72Q94 72 92 84L88 112Q84 132 60 132L50 132Q26 132 22 110Z', c.lg([[0, mix(k.dark, k.main, 0.4)], [1, k.dark]], 0, 0, 1, 1), { stroke: k.metal[1], sw: 4 })
    + path('M180 82Q180 72 168 72L116 72Q106 72 108 84L112 112Q116 132 140 132L150 132Q174 132 178 110Z', c.lg([[0, mix(k.dark, k.main, 0.4)], [1, k.dark]], 0, 0, 1, 1), { stroke: k.metal[1], sw: 4 })
    + path('M92 82Q100 74 108 82', 'none', { stroke: k.metal[1], sw: 4 }) + path('M32 84L60 84L40 120Z', '#FFFFFF', { op: 0.22 }) + path('M120 84L148 84L128 120Z', '#FFFFFF', { op: 0.22 })),
  sneaker: (c, k) => g(ell(102, 170, 86, 6, k.dark, { op: 0.14 })
    + path('M18 136L184 136Q190 136 190 146L190 152Q190 162 178 162L28 162Q16 162 16 150Z', k.light, { stroke: '#000', sw: 1, op: 1 })
    + path('M20 138L24 104Q26 92 40 90L76 86Q92 66 104 58L120 56Q128 76 142 88Q172 98 182 116Q188 128 186 138Z', shade(c, k.main, 0.2))
    + path('M48 132Q104 124 152 94', 'none', { stroke: k.alt, sw: 9, cap: 'round' }) + path('M104 60L120 58Q124 70 132 80L112 84Z', mix(k.main, '#000000', 0.2))
    + [0, 1, 2].map((i) => line(100 + i * 9, 72 + i * 7, 112 + i * 9, 66 + i * 7, '#FFFFFF', 3)).join('') + rect(18, 148, 172, 3, k.alt, { op: 0.6 })),
  headphones: (c, k) => g(path('M46 112C46 30 154 30 154 112', 'none', { stroke: k.dark, sw: 11, cap: 'round' }) + path('M52 104C52 44 148 44 148 104', 'none', { stroke: '#FFFFFF', sw: 2, op: 0.2 })
    + rect(28, 98, 38, 66, shade(c, k.main), { r: 16 }) + rect(134, 98, 38, 66, shade(c, k.main), { r: 16 }) + rect(56, 106, 14, 50, k.dark, { r: 7 }) + rect(130, 106, 14, 50, k.dark, { r: 7 })
    + gloss(34, 106, 6, 30, 3) + gloss(140, 106, 6, 30, 3)),
  watch: (c, k) => g(rect(78, 8, 44, 60, k.dark, { r: 8 }) + rect(78, 132, 44, 60, k.dark, { r: 8 }) + rect(146, 92, 10, 16, metal(c, k), { r: 3 })
    + circ(100, 100, 50, metal(c, k, false)) + circ(100, 100, 41, c.rg([[0, mix(k.main, '#FFFFFF', 0.15)], [1, mix(k.main, '#000000', 0.35)]]))
    + Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return line(100 + Math.sin(a) * 33, 100 - Math.cos(a) * 33, 100 + Math.sin(a) * (i % 3 ? 37 : 30), 100 - Math.cos(a) * (i % 3 ? 37 : 30), k.metal[0], i % 3 ? 1.5 : 3); }).join('')
    + line(100, 100, 100, 72, k.metal[0], 3.5) + line(100, 100, 120, 110, k.metal[0], 3) + line(100, 112, 100, 66, k.alt, 1.2) + circ(100, 100, 4, k.metal[1]) + path('M62 78A44 44 0 0 1 100 56', 'none', { stroke: '#FFFFFF', sw: 3, op: 0.3, cap: 'round' })),
  watchSq: (c, k) => g(rect(74, 6, 52, 64, k.alt, { r: 10 }) + rect(74, 130, 52, 64, k.alt, { r: 10 }) + rect(146, 82, 9, 22, metal(c, k), { r: 3 })
    + rect(52, 46, 96, 108, metal(c, k, false), { r: 30 }) + rect(60, 54, 80, 92, '#0B0B10', { r: 24 })
    + circ(100, 100, 26, 'none', { stroke: k.main, sw: 7, dash: '120 200', cap: 'round', t: 'rotate(-90 100 100)' }) + circ(100, 100, 16, 'none', { stroke: k.alt, sw: 6, dash: '70 200', cap: 'round', t: 'rotate(-90 100 100)' })
    + rect(70, 128, 60, 5, '#FFFFFF', { r: 2, op: 0.3 })),
  box: (c, k) => g(poly([[100, 40], [164, 72], [100, 104], [36, 72]], mix(k.main, '#FFFFFF', 0.25)) + poly([[36, 72], [100, 104], [100, 176], [36, 144]], k.main) + poly([[100, 104], [164, 72], [164, 144], [100, 176]], mix(k.main, '#000000', 0.22))
    + poly([[60, 60], [124, 92], [124, 104], [60, 72]], k.alt, { op: 0.9 }) + poly([[124, 92], [140, 84], [140, 156], [124, 164]], mix(k.alt, '#000000', 0.15)) + poly([[124, 92], [60, 60], [76, 52], [140, 84]], mix(k.alt, '#FFFFFF', 0.25))),
  phone: (c, k) => g(rect(60, 10, 80, 180, k.dark, { r: 18 }) + rect(65, 15, 70, 170, k.light, { r: 14 }) + rect(88, 20, 24, 6, k.dark, { r: 3 })
    + rect(72, 34, 56, 56, shade(c, k.main), { r: 10 }) + circ(100, 62, 14, '#FFFFFF', { op: 0.4 })
    + rect(72, 98, 40, 6, k.dark, { r: 3, op: 0.7 }) + rect(72, 110, 52, 5, k.dark, { r: 2, op: 0.25 }) + rect(72, 121, 30, 5, k.dark, { r: 2, op: 0.25 })
    + rect(72, 140, 56, 18, k.alt, { r: 9 }) + rect(72, 166, 26, 10, k.dark, { r: 3, op: 0.12 }) + rect(102, 166, 26, 10, k.dark, { r: 3, op: 0.12 })),
  serum: (c, k) => g(ell(100, 184, 40, 5, k.dark, { op: 0.14 }) + path('M100 8Q114 8 114 24L114 44L86 44L86 24Q86 8 100 8Z', k.dark) + rect(82, 42, 36, 22, metal(c, k, false), { r: 4 })
    + rect(64, 64, 72, 118, c.lg([[0, mix(k.main, '#FFFFFF', 0.45), 0.9], [1, mix(k.main, '#000000', 0.15), 0.95]], 0, 0, 1, 1), { r: 18 })
    + rect(64, 100, 72, 82, k.main, { r: 18, op: 0.5 }) + rect(74, 112, 52, 40, k.light, { r: 4 }) + rect(82, 122, 36, 4, k.dark, { r: 2, op: 0.7 }) + rect(88, 132, 24, 3, k.dark, { r: 1.5, op: 0.4 }) + gloss(72, 72, 7, 90, 3.5)),
  lipstick: (c, k) => g(ell(100, 186, 34, 5, k.dark, { op: 0.14 }) + path('M84 84L84 54Q84 34 116 22L116 84Z', shade(c, k.main, 0.2)) + path('M84 54Q84 38 104 30L104 84L84 84Z', '#FFFFFF', { op: 0.15 })
    + rect(80, 82, 40, 34, metal(c, k, false), { r: 3 }) + rect(74, 114, 52, 70, c.lg([[0, k.dark], [0.5, mix(k.dark, '#FFFFFF', 0.2)], [1, k.dark]], 0, 0, 1, 0), { r: 5 }) + rect(74, 120, 52, 4, k.metal[1])),
  jar: (c, k) => g(ell(100, 172, 64, 7, k.dark, { op: 0.14 }) + rect(50, 70, 100, 30, metal(c, k, false), { r: 8 }) + rect(46, 96, 108, 74, shade(c, k.main, 0.18), { r: 20 })
    + rect(46, 114, 108, 34, k.light, { op: 0.9 }) + rect(78, 124, 44, 5, k.dark, { r: 2, op: 0.7 }) + rect(86, 135, 28, 3, k.dark, { r: 1.5, op: 0.4 }) + gloss(56, 102, 6, 56, 3)),
  perfume: (c, k) => g(ell(100, 186, 56, 6, k.dark, { op: 0.14 }) + rect(74, 18, 52, 44, metal(c, k, false), { r: 6 }) + rect(88, 60, 24, 18, k.metal[2])
    + rect(48, 76, 104, 108, c.lg([[0, mix(k.main, '#FFFFFF', 0.55), 0.85], [1, mix(k.main, '#000000', 0.1), 0.95]], 0, 0, 1, 1), { r: 26 })
    + rect(58, 104, 84, 72, k.main, { r: 18, op: 0.55 }) + rect(72, 118, 56, 24, k.light, { r: 3, op: 0.9 }) + rect(82, 127, 36, 4, k.dark, { r: 2 }) + gloss(58, 84, 8, 80, 4)),
  perfume2: (c, k) => g(ell(100, 188, 50, 6, k.dark, { op: 0.14 }) + poly([[86, 10], [114, 10], [124, 30], [114, 52], [86, 52], [76, 30]], metal(c, k, false)) + rect(90, 52, 20, 16, k.metal[2])
    + poly([[60, 68], [140, 68], [160, 108], [140, 184], [60, 184], [40, 108]], c.lg([[0, mix(k.main, '#FFFFFF', 0.5), 0.9], [1, mix(k.main, '#000000', 0.2)]], 0, 0, 1, 1))
    + poly([[60, 68], [100, 108], [40, 108]], '#FFFFFF', { op: 0.25 }) + poly([[140, 68], [160, 108], [100, 108]], '#000000', { op: 0.08 }) + poly([[40, 108], [100, 108], [60, 184]], '#FFFFFF', { op: 0.1 })
    + rect(78, 124, 44, 20, k.light, { r: 2 }) + rect(86, 132, 28, 3, k.dark, { r: 1.5 })),
  bowl: (c, k) => g(ell(100, 178, 76, 8, k.dark, { op: 0.14 }) + path('M20 96Q28 172 100 174Q172 172 180 96Z', shade(c, k.main, 0.15)) + ell(100, 96, 80, 26, mix(k.light, '#E9DCC4', 0.4))
    + ['#7DB561', '#F2C14E', '#E76F51', '#5A9A4C', '#F4E3B5', '#A44A3F'].map((col, i) => circ(56 + i * 17 + (i % 2) * 4, 88 + (i % 3) * 6, 12 + (i % 2) * 3, col)).join('')
    + circ(112, 84, 13, '#FFFFFF') + circ(112, 84, 6, '#F4B400') + line(130, 20, 70, 96, k.dark, 4) + line(144, 24, 82, 98, k.dark, 4)),
  burger: (c, k) => g(ell(100, 178, 76, 7, k.dark, { op: 0.14 }) + path('M30 94Q30 36 100 36Q170 36 170 94Z', c.lg([[0, '#F2B05E'], [1, '#C77A2C']]))
    + [[70, 56], [96, 50], [122, 58], [84, 72], [140, 76], [60, 78]].map(([x, y]) => ell(x, y, 4, 2.4, '#FFF4D6')).join('')
    + path('M24 98Q40 88 56 100Q72 88 88 100Q104 88 120 100Q136 88 152 100Q166 90 176 98L176 108L24 108Z', '#6DBB4A') + poly([[40, 108], [164, 108], [150, 128], [124, 114]], '#F7C948')
    + rect(30, 110, 140, 24, '#6B3A22', { r: 12 }) + rect(34, 136, 132, 8, '#E4533B', { r: 4 }) + path('M30 146L170 146Q170 172 140 172L60 172Q30 172 30 146Z', '#E19A4C')),
  pizza: (c, k) => g(ell(104, 108, 82, 82, k.dark, { op: 0.1 }) + circ(100, 100, 82, '#D9923F') + circ(100, 100, 70, '#F1C24B') + circ(100, 100, 66, '#E85D3B', { op: 0.25 })
    + [[70, 70], [120, 62], [140, 108], [96, 130], [62, 118], [108, 96], [80, 96], [124, 136]].map(([x, y], i) => circ(x, y, i % 2 ? 9 : 11, i % 3 ? '#B83227' : '#3E7C3A')).join('')
    + [0, 1, 2].map((i) => line(100 - Math.cos(i * 1.05) * 70, 100 - Math.sin(i * 1.05) * 70, 100 + Math.cos(i * 1.05) * 70, 100 + Math.sin(i * 1.05) * 70, '#B9772E', 2, { op: 0.6 })).join('')),
  cup: (c, k) => g(path('M84 42Q74 28 86 16M104 42Q94 28 106 16M124 42Q114 28 126 16', 'none', { stroke: k.dark, sw: 3, op: 0.25, cap: 'round' })
    + ell(100, 160, 78, 16, mix(k.light, '#000000', 0.06)) + ell(100, 156, 62, 10, k.light)
    + path('M150 82Q182 82 180 106Q178 130 146 128', 'none', { stroke: k.main, sw: 10 }) + path('M42 68L158 68Q154 148 100 156Q46 148 42 68Z', shade(c, k.main, 0.15))
    + ell(100, 68, 58, 13, '#5B3423') + path('M100 76Q88 64 94 62Q100 60 100 66Q100 60 106 62Q112 64 100 76Z', '#F2D7B6') + gloss(52, 80, 6, 40, 3)),
  takeaway: (c, k) => g(ell(100, 186, 40, 5, k.dark, { op: 0.14 }) + rect(54, 24, 92, 16, k.dark, { r: 6 }) + rect(60, 16, 80, 12, k.dark, { r: 4, op: 0.85 })
    + path('M60 40L140 40L128 184L72 184Z', k.light) + path('M64 80L136 80L131 136L69 136Z', shade(c, k.main, 0.1)) + circ(100, 108, 14, k.light) + circ(100, 108, 6, k.main)),
  beans: (c, k) => g([[60, 70, 20], [120, 56, -30], [96, 118, 60], [150, 118, 10], [54, 140, -50], [118, 164, 30]].map(([x, y, a]) => g(ell(0, 0, 22, 16, c.lg([[0, '#8A5A3C'], [1, '#4A2C1C']], 0, 0, 1, 1)) + path('M-18 0Q-6 -8 0 0Q6 8 18 0', 'none', { stroke: '#2E1A10', sw: 2.5 }), { t: `translate(${x} ${y}) rotate(${a})` })).join('')),
  house: (c, k) => g(ell(100, 178, 90, 8, k.dark, { op: 0.12 }) + rect(34, 92, 132, 82, k.light) + poly([[24, 98], [100, 36], [176, 98]], k.dark) + rect(34, 98, 132, 5, '#000', { op: 0.08 })
    + rect(48, 112, 36, 30, c.lg([[0, '#CFE7FF'], [1, '#7DA6D8']], 0, 0, 1, 1), { r: 2 }) + rect(116, 112, 36, 30, c.lg([[0, '#CFE7FF'], [1, '#7DA6D8']], 0, 0, 1, 1), { r: 2 })
    + line(66, 112, 66, 142, k.light, 2) + line(134, 112, 134, 142, k.light, 2) + rect(88, 128, 24, 46, k.main, { r: 2 }) + circ(107, 152, 2, k.metal[1])
    + circ(30, 160, 16, '#6E9E5A') + circ(174, 158, 18, '#5D8C4A') + rect(132, 48, 14, 30, k.dark)),
  building: (c, k) => g(ell(100, 186, 86, 6, k.dark, { op: 0.12 }) + rect(70, 16, 60, 168, c.lg([[0, mix(k.main, '#FFFFFF', 0.3)], [1, mix(k.main, '#000000', 0.3)]], 0, 0, 1, 1))
    + Array.from({ length: 10 }, (_, i) => line(70, 30 + i * 15, 130, 30 + i * 15, '#FFFFFF', 1, { op: 0.35 })).join('') + line(100, 16, 100, 184, '#FFFFFF', 1, { op: 0.3 })
    + rect(26, 92, 44, 92, k.dark) + rect(130, 70, 44, 114, mix(k.dark, k.main, 0.3))
    + Array.from({ length: 12 }, (_, i) => rect(34 + (i % 3) * 11, 102 + Math.floor(i / 3) * 18, 6, 9, k.metal[0], { op: 0.8 })).join('')
    + Array.from({ length: 15 }, (_, i) => rect(138 + (i % 3) * 11, 80 + Math.floor(i / 3) * 20, 6, 10, k.metal[0], { op: 0.7 })).join('')),
  sofa: (c, k) => g(ell(100, 168, 90, 6, k.dark, { op: 0.14 }) + rect(30, 64, 140, 54, mix(k.main, '#000000', 0.12), { r: 18 }) + rect(22, 106, 156, 46, shade(c, k.main, 0.15), { r: 14 })
    + rect(12, 88, 30, 66, k.main, { r: 14 }) + rect(158, 88, 30, 66, k.main, { r: 14 }) + line(100, 72, 100, 112, '#000', 2, { op: 0.12 }) + line(100, 112, 100, 148, '#000', 2, { op: 0.12 })
    + line(30, 152, 26, 168, k.dark, 5) + line(170, 152, 174, 168, k.dark, 5) + rect(132, 78, 28, 26, k.alt, { r: 8 })),
  chair: (c, k) => g(ell(100, 182, 64, 6, k.dark, { op: 0.14 }) + path('M50 28Q100 10 150 28L144 112Q100 124 56 112Z', shade(c, k.main, 0.18))
    + path('M40 108Q100 96 160 108L160 128Q100 144 40 128Z', mix(k.main, '#000000', 0.12)) + line(56, 132, 44, 180, '#6B4A2E', 5) + line(144, 132, 156, 180, '#6B4A2E', 5) + line(84, 136, 80, 176, '#6B4A2E', 4) + line(116, 136, 120, 176, '#6B4A2E', 4)),
  lamp: (c, k) => g(line(100, 0, 100, 62, k.dark, 2) + ell(100, 150, 70, 30, c.rg([[0, '#FFE9A8', 0.7], [1, '#FFE9A8', 0]])) + path('M48 120Q48 62 100 62Q152 62 152 120Z', shade(c, k.main, 0.2))
    + ell(100, 120, 52, 8, mix(k.main, '#000000', 0.3)) + circ(100, 126, 10, '#FFF3C4') + rect(94, 56, 12, 10, k.metal[1], { r: 2 })),
  plant: (c, k) => g(ell(100, 184, 40, 5, k.dark, { op: 0.14 }) + [[-40, '#4E8B4A'], [-15, '#5FA05A'], [10, '#3F7A3D'], [35, '#6CB066'], [-62, '#5FA05A'], [60, '#4E8B4A']].map(([a, col]) => g(path('M0 0C-18 -30 -14 -70 0 -88C14 -70 18 -30 0 0Z', col) + line(0, 0, 0, -80, '#FFFFFF', 1.4, { op: 0.35 }), { t: `translate(100 128) rotate(${a})` })).join('')
    + path('M66 124L134 124L124 184L76 184Z', shade(c, k.main, 0.15)) + rect(62, 120, 76, 12, mix(k.main, '#000000', 0.15), { r: 3 })),
  mountain: (c, k) => g(circ(100, 100, 84, c.lg([[0, mix(k.alt, '#FFFFFF', 0.5)], [1, mix(k.main, '#FFFFFF', 0.2)]])) + circ(132, 66, 18, '#FFF3C4', { op: 0.95 })
    + g(poly([[0, 170], [70, 70], [124, 140], [150, 110], [200, 170]], mix(k.main, '#000000', 0.3)) + poly([[70, 70], [86, 92], [76, 88], [64, 96], [58, 88]], '#FFFFFF', { op: 0.9 })
      + poly([[0, 184], [50, 130], [100, 170], [150, 124], [200, 184]], mix(k.main, '#000000', 0.1)), { clip: c.clip(circ(100, 100, 84, '#000')) })
    + path('M40 52l18 4l8 -6l3 2l-6 7l16 4l-3 3l-16 -2l-10 8l-3 -1l4 -9l-12 -4z', '#FFFFFF')),
  palm: (c, k) => g(circ(118, 70, 34, '#FFD27A', { op: 0.9 }) + rect(10, 150, 180, 40, mix(k.main, '#FFFFFF', 0.3), { r: 20 }) + path('M20 164Q50 156 80 164T140 164T200 164', 'none', { stroke: '#FFFFFF', sw: 3, op: 0.6 })
    + path('M92 160Q96 110 82 60', 'none', { stroke: '#8A5A3C', sw: 9, cap: 'round' })
    + [[-70, 1], [-30, 1.1], [10, 1], [50, 0.9], [100, 0.8], [150, 0.9]].map(([a, s]) => path('M0 0Q30 -20 62 6Q32 -6 0 0Z', '#3F8F4F', { t: `translate(82 60) rotate(${a}) scale(${s})` })).join('')),
  suitcase: (c, k) => g(ell(100, 188, 54, 5, k.dark, { op: 0.14 }) + rect(80, 18, 40, 30, 'none', { stroke: k.dark, sw: 7, r: 8 }) + rect(48, 42, 104, 136, shade(c, k.main, 0.2), { r: 18 })
    + [70, 100, 130].map((x) => rect(x - 3, 50, 6, 120, '#000', { r: 3, op: 0.12 })).join('') + circ(66, 184, 6, k.dark) + circ(134, 184, 6, k.dark)
    + path('M140 70L162 92L156 98L134 76Z', k.alt) + gloss(56, 52, 6, 50, 3)),
  dumbbell: (c, k) => g(ell(100, 150, 80, 6, k.dark, { op: 0.14 }) + rect(40, 94, 120, 12, metal(c, k, false), { r: 5 })
    + rect(26, 62, 18, 76, shade(c, k.main), { r: 6 }) + rect(46, 72, 14, 56, k.dark, { r: 5 }) + rect(156, 62, 18, 76, shade(c, k.main), { r: 6 }) + rect(140, 72, 14, 56, k.dark, { r: 5 })
    + Array.from({ length: 8 }, (_, i) => line(76 + i * 7, 95, 76 + i * 7, 105, k.metal[2], 1.5)).join('')),
  kettlebell: (c, k) => g(ell(100, 178, 52, 6, k.dark, { op: 0.14 }) + path('M68 96L66 54Q66 26 100 26Q134 26 134 54L132 96', 'none', { stroke: k.dark, sw: 16, join: 'round' })
    + path('M44 128Q44 76 100 76Q156 76 156 128Q156 160 132 174L68 174Q44 160 44 128Z', c.rg([[0, mix(k.main, '#FFFFFF', 0.25)], [1, mix(k.main, '#000000', 0.35)]], 0.35, 0.3, 0.8))
    + rect(84, 116, 32, 22, k.light, { r: 4 }) + gloss(56, 104, 7, 34, 3.5)),
  bottle: (c, k) => g(ell(100, 188, 38, 5, k.dark, { op: 0.14 }) + rect(82, 8, 36, 26, k.dark, { r: 6 }) + rect(88, 30, 24, 12, k.metal[1])
    + path('M70 54Q70 40 84 40L116 40Q130 40 130 54L130 176Q130 186 120 186L80 186Q70 186 70 176Z', shade(c, k.main, 0.18))
    + rect(70, 92, 60, 44, k.light) + rect(82, 108, 36, 5, k.dark, { r: 2 }) + rect(88, 118, 24, 3, k.dark, { r: 1.5, op: 0.5 }) + gloss(76, 50, 6, 120, 3)),
  card: (c, k) => g(rect(30, 30, 160, 102, mix(k.dark, k.alt, 0.25), { r: 14, t: 'rotate(-8 100 100)', op: 0.9 })
    + rect(12, 62, 172, 108, c.lg([[0, mix(k.main, '#FFFFFF', 0.15)], [1, mix(k.main, '#000000', 0.35)]], 0, 0, 1, 1), { r: 14 })
    + path('M12 140Q90 90 184 120L184 156Q184 170 170 170L26 170Q12 170 12 156Z', '#FFFFFF', { op: 0.08 }) + rect(30, 92, 28, 22, metal(c, k, false), { r: 5 })
    + line(30, 103, 58, 103, k.metal[2], 1) + line(44, 92, 44, 114, k.metal[2], 1)
    + [0, 1, 2].map((i) => path(`M${70 + i * 6} 96Q${76 + i * 6} 103 ${70 + i * 6} 110`, 'none', { stroke: '#FFFFFF', sw: 2, op: 0.7 })).join('')
    + [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => circ(32 + i * 30 + j * 5.5, 138, 2, '#FFFFFF', { op: i === 3 ? 1 : 0.7 })).join('')).join('')
    + circ(156, 150, 9, k.alt, { op: 0.9 }) + circ(166, 150, 9, k.metal[1], { op: 0.8 })),
  coins: (c, k) => g(ell(100, 182, 70, 7, k.dark, { op: 0.14 }) + [0, 1, 2, 3, 4].map((i) => g(rect(44, 150 - i * 18, 72, 18, k.metal[2], { r: 0 }) + ell(80, 168 - i * 18, 36, 10, k.metal[2]) + ell(80, 150 - i * 18, 36, 10, metal(c, k, false)))).join('')
    + circ(146, 82, 38, metal(c, k, false)) + circ(146, 82, 29, 'none', { stroke: k.metal[2], sw: 2.5 }) + path('M138 66L156 66M138 74L156 74M140 66Q160 68 148 82L138 82L156 100', 'none', { stroke: k.metal[2], sw: 4, cap: 'round', join: 'round' })),
  chart: (c, k) => g(rect(14, 22, 172, 156, k.light, { r: 18, f: 'sm' }) + [44, 70, 58, 96, 120].map((h, i) => rect(36 + i * 28, 160 - h, 18, h, i === 4 ? k.main : mix(k.main, '#FFFFFF', 0.55), { r: 5 })).join('')
    + path('M38 108L74 84L102 96L132 58L160 36', 'none', { stroke: k.alt, sw: 5, cap: 'round', join: 'round' }) + poly([[148, 32], [166, 30], [162, 48]], k.alt)),
  laptop: (c, k) => g(rect(30, 34, 140, 96, k.dark, { r: 8 }) + rect(36, 40, 128, 84, k.light, { r: 3 }) + rect(36, 40, 30, 84, mix(k.main, '#000000', 0.1))
    + rect(74, 48, 50, 6, k.dark, { r: 3, op: 0.6 }) + rect(74, 62, 40, 22, k.main, { r: 4, op: 0.85 }) + rect(118, 62, 38, 22, k.alt, { r: 4, op: 0.85 })
    + [0, 1, 2].map((i) => rect(74, 92 + i * 9, 82 - i * 14, 4, k.dark, { r: 2, op: 0.18 })).join('') + path('M14 132L186 132L178 148Q176 152 170 152L30 152Q24 152 22 148Z', metal(c, k, false))),
  car: (c, k) => g(ell(102, 150, 92, 7, k.dark, { op: 0.18 }) + path('M12 128Q12 106 42 100L76 94Q98 70 130 70L148 72Q166 84 180 96Q194 102 192 122L190 134L12 134Z', c.lg([[0, mix(k.main, '#FFFFFF', 0.25)], [1, mix(k.main, '#000000', 0.3)]]))
    + path('M84 96Q102 78 128 78L144 79Q156 88 164 98Z', c.lg([[0, '#2A3442'], [1, '#0E141C']])) + line(124, 78, 120, 98, mix(k.main, '#000000', 0.2), 3)
    + path('M20 112L190 108', 'none', { stroke: '#FFFFFF', sw: 2, op: 0.25 }) + rect(176, 104, 14, 6, '#FFF3C4', { r: 3 }) + rect(12, 110, 8, 6, '#E5484D', { r: 2 })
    + [52, 152].map((x) => circ(x, 134, 20, '#121418') + circ(x, 134, 12, metal(c, k, false)) + circ(x, 134, 3, k.dark)).join('')),
  wheel: (c, k) => g(circ(100, 100, 86, '#16181D') + circ(100, 100, 82, 'none', { stroke: '#2B2F38', sw: 6, dash: '6 6' }) + circ(100, 100, 60, metal(c, k, false))
    + Array.from({ length: 5 }, (_, i) => path('M-8 -16L8 -16L14 -56L-14 -56Z', mix(k.metal[2], '#000000', 0.25), { t: `translate(100 100) rotate(${i * 72})` })).join('')
    + circ(100, 100, 18, k.main) + circ(100, 100, 6, k.metal[0]) + rect(132, 70, 10, 16, k.main, { r: 3 })),
  vinyl: (c, k) => g(circ(92, 104, 84, '#141418') + [74, 64, 54, 44].map((r) => circ(92, 104, r, 'none', { stroke: '#FFFFFF', sw: 0.8, op: 0.12 })).join('')
    + path('M30 70A72 72 0 0 1 80 34', 'none', { stroke: '#FFFFFF', sw: 6, op: 0.12, cap: 'round' }) + circ(92, 104, 28, k.main) + circ(92, 104, 4, '#FFFFFF')
    + line(178, 24, 160, 110, k.metal[1], 4) + rect(150, 104, 18, 26, k.metal[2], { r: 3, t: 'rotate(12 160 116)' }) + circ(178, 24, 10, k.metal[1])),
  mic: (c, k) => g(rect(70, 14, 60, 92, c.lg([[0, k.metal[0]], [1, k.metal[2]]], 0, 0, 1, 0), { r: 30 }) + g(Array.from({ length: 12 }, (_, i) => line(70, 20 + i * 7, 130, 20 + i * 7, k.metal[2], 1.2, { op: 0.6 })).join(''), { clip: c.clip(rect(70, 14, 60, 92, '#000', { r: 30 })) })
    + rect(66, 70, 68, 10, k.main) + path('M54 74Q54 130 100 130Q146 130 146 74', 'none', { stroke: k.dark, sw: 6 }) + line(100, 130, 100, 176, k.dark, 6) + rect(70, 172, 60, 10, k.dark, { r: 5 })),
  books: (c, k) => g(ell(100, 182, 76, 6, k.dark, { op: 0.14 }) + rect(32, 140, 136, 36, k.main, { r: 4 }) + rect(32, 150, 136, 4, '#FFFFFF', { op: 0.4 })
    + rect(42, 106, 120, 34, k.alt, { r: 4, t: 'rotate(-3 100 123)' }) + rect(42, 116, 120, 3, '#FFFFFF', { op: 0.4, t: 'rotate(-3 100 123)' })
    + rect(36, 74, 128, 32, k.dark, { r: 4, t: 'rotate(2 100 90)' }) + rect(48, 86, 50, 4, k.metal[1], { r: 2, t: 'rotate(2 100 90)' })
    + path('M118 74L118 34Q132 22 148 34L148 74', k.light) + line(133, 26, 133, 74, k.dark, 1, { op: 0.2 })),
  gradcap: (c, k) => g(ell(100, 160, 60, 7, k.dark, { op: 0.14 }) + path('M54 92L54 136Q100 160 146 136L146 92Z', mix(k.dark, k.main, 0.2)) + poly([[100, 40], [184, 80], [100, 120], [16, 80]], k.dark)
    + poly([[100, 40], [184, 80], [100, 120], [16, 80]], '#FFFFFF', { op: 0.06 }) + circ(100, 80, 5, k.alt) + path('M100 80L162 96L162 140', 'none', { stroke: k.alt, sw: 3 }) + rect(156, 136, 12, 26, k.alt, { r: 3 })),
  heart: (c, k) => g(path('M100 172C34 128 16 96 16 68C16 40 38 22 62 22C80 22 92 32 100 46C108 32 120 22 138 22C162 22 184 40 184 68C184 96 166 128 100 172Z', c.lg([[0, mix(k.main, '#FFFFFF', 0.2)], [1, mix(k.main, '#000000', 0.25)]], 0, 0, 1, 1))
    + path('M30 92L70 92L82 66L100 122L114 80L124 92L170 92', 'none', { stroke: '#FFFFFF', sw: 6, cap: 'round', join: 'round' }) + path('M44 44Q56 34 70 38', 'none', { stroke: '#FFFFFF', sw: 6, op: 0.35, cap: 'round' })),
  pills: (c, k) => g(ell(100, 176, 70, 6, k.dark, { op: 0.12 }) + g(rect(-60, -20, 120, 40, k.light, { r: 20 }) + path('M0 -20L-40 -20Q-60 -20 -60 0Q-60 20 -40 20L0 20Z', shade(c, k.main, 0.15)) + gloss(-50, -14, 90, 6, 3), { t: 'translate(92 86) rotate(-30)' })
    + circ(144, 140, 24, k.alt) + line(128, 140, 160, 140, '#FFFFFF', 3, { op: 0.6 }) + circ(80, 150, 18, mix(k.alt, '#FFFFFF', 0.5))),
  shield: (c, k) => g(path('M100 14L170 40L170 96Q170 150 100 186Q30 150 30 96L30 40Z', c.lg([[0, mix(k.main, '#FFFFFF', 0.2)], [1, mix(k.main, '#000000', 0.3)]], 0, 0, 1, 1))
    + path('M100 14L170 40L170 96Q170 150 100 186Z', '#000', { op: 0.1 }) + rect(88, 58, 24, 76, '#FFFFFF', { r: 4 }) + rect(62, 84, 76, 24, '#FFFFFF', { r: 4 })),
  controller: (c, k) => g(ell(100, 168, 82, 7, k.dark, { op: 0.14 }) + path('M50 60L150 60Q182 60 190 104Q198 152 172 160Q154 164 140 136L60 136Q46 164 28 160Q2 152 10 104Q18 60 50 60Z', shade(c, k.main, 0.2))
    + rect(40, 92, 34, 10, k.dark, { r: 3 }) + rect(52, 80, 10, 34, k.dark, { r: 3 }) + circ(146, 84, 7, '#FF6B6B') + circ(162, 98, 7, '#4CC9F0') + circ(130, 98, 7, '#FFD166') + circ(146, 112, 7, '#06D6A0')
    + circ(82, 124, 11, k.dark) + circ(118, 124, 11, k.dark) + rect(90, 74, 20, 6, k.light, { r: 3, op: 0.6 })),
  trophy: (c, k) => g(ell(100, 186, 50, 5, k.dark, { op: 0.14 }) + path('M54 40Q16 40 24 74Q30 98 64 102M146 40Q184 40 176 74Q170 98 136 102', 'none', { stroke: k.metal[1], sw: 8 })
    + path('M52 24L148 24L148 64Q148 116 100 120Q52 116 52 64Z', metal(c, k, false)) + rect(90, 118, 20, 26, k.metal[2]) + rect(62, 144, 76, 14, k.metal[1], { r: 3 }) + rect(54, 158, 92, 24, k.dark, { r: 4 })
    + path('M100 46L106 60L120 62L110 72L112 86L100 79L88 86L90 72L80 62L94 60Z', '#FFFFFF', { op: 0.8 }) + gloss(62, 32, 8, 50, 4)),
};

export function art(c, kind, k, cx, cy, size) {
  const fn = ART[kind] || ART.box;
  return g(fn(c, k), { t: `translate(${cx - size / 2} ${cy - size / 2}) scale(${size / 200})` });
}
