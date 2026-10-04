// Shapes drawn as SVG paths in a 0–100 box (stretched to the element). rect / rounded / circle / line are drawn with CSS.
function starPath(points, inner) {
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 ? inner : 50;
    const a = (Math.PI * i) / points - Math.PI / 2;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join(' L')}Z`;
}
function polygon(n) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (2 * Math.PI * i) / n - Math.PI / 2;
    pts.push(`${(50 + 50 * Math.cos(a)).toFixed(2)} ${(50 + 50 * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join(' L')}Z`;
}

export const SHAPES = {
  rect: { name: 'Rectangle' },
  rounded: { name: 'Rounded box' },
  circle: { name: 'Circle' },
  ring: { name: 'Ring' },
  line: { name: 'Line' },
  triangle: { name: 'Triangle', path: 'M50 0 L100 100 L0 100Z' },
  'right-triangle': { name: 'Corner triangle', path: 'M0 0 L100 0 L0 100Z' },
  diamond: { name: 'Diamond', path: 'M50 0 L100 50 L50 100 L0 50Z' },
  pentagon: { name: 'Pentagon', path: polygon(5) },
  hexagon: { name: 'Hexagon', path: 'M25 0 L75 0 L100 50 L75 100 L25 100 L0 50Z' },
  octagon: { name: 'Octagon', path: polygon(8) },
  star: { name: 'Star', path: starPath(5, 21) },
  'star-6': { name: '6-point star', path: starPath(6, 30) },
  burst: { name: 'Burst badge', path: starPath(16, 40) },
  seal: { name: 'Seal', path: starPath(24, 45) },
  heart: { name: 'Heart', path: 'M50 92 C20 70 0 52 0 30 C0 13 13 2 28 2 C38 2 46 8 50 16 C54 8 62 2 72 2 C87 2 100 13 100 30 C100 52 80 70 50 92Z' },
  arrow: { name: 'Arrow', path: 'M0 35 H62 V10 L100 50 L62 90 V65 H0Z' },
  chevron: { name: 'Chevron', path: 'M0 0 H70 L100 50 L70 100 H0 L30 50Z' },
  ribbon: { name: 'Ribbon', path: 'M0 0 H100 L88 50 L100 100 H0 L12 50Z' },
  tag: { name: 'Price tag', path: 'M0 0 H78 L100 50 L78 100 H0Z' },
  parallelogram: { name: 'Slant', path: 'M18 0 H100 L82 100 H0Z' },
  bubble: { name: 'Speech bubble', path: 'M10 0 H90 Q100 0 100 10 V62 Q100 72 90 72 H40 L18 100 L24 72 H10 Q0 72 0 62 V10 Q0 0 10 0Z' },
  cross: { name: 'Plus', path: 'M35 0 H65 V35 H100 V65 H65 V100 H35 V65 H0 V35 H35Z' },
  wave: { name: 'Wave', path: 'M0 40 C20 10 35 10 50 40 C65 70 80 70 100 40 V100 H0Z' },
  blob: { name: 'Blob', path: 'M52 2 C76 0 98 18 99 44 C100 70 82 98 52 99 C24 100 2 80 1 52 C0 26 26 4 52 2Z' },
  arch: { name: 'Arch', path: 'M0 100 V50 C0 22 22 0 50 0 C78 0 100 22 100 50 V100Z' },
};

export const SHAPE_KEYS = Object.keys(SHAPES);
