// name, category, weights ('' = single weight family)
export const FONTS = [
  ['System', 'sans', null],
  ['Inter', 'sans', '400;500;600;700;800'],
  ['Manrope', 'sans', '400;500;600;700;800'],
  ['DM Sans', 'sans', '400;500;700'],
  ['Poppins', 'sans', '400;500;600;700'],
  ['Montserrat', 'sans', '400;500;600;700;800'],
  ['Outfit', 'sans', '400;500;600;700'],
  ['Space Grotesk', 'sans', '400;500;600;700'],
  ['Syne', 'sans', '400;500;600;700;800'],
  ['Figtree', 'sans', '400;500;600;700'],
  ['Jost', 'sans', '400;500;600;700'],
  ['Nunito', 'sans', '400;600;700;800'],
  ['Fredoka', 'sans', '400;500;600;700'],
  ['Lato', 'sans', '400;700'],
  ['Source Sans 3', 'sans', '400;600;700'],
  ['IBM Plex Sans', 'sans', '400;500;600;700'],
  ['Raleway', 'sans', '400;500;600;700'],
  ['Work Sans', 'sans', '400;500;600;700'],
  ['Bricolage Grotesque', 'sans', '400;500;600;700;800'],
  ['Playfair Display', 'serif', '400;500;600;700'],
  ['Cormorant Garamond', 'serif', '400;500;600;700'],
  ['Libre Baskerville', 'serif', '400;700'],
  ['Lora', 'serif', '400;500;600;700'],
  ['Merriweather', 'serif', '400;700'],
  ['DM Serif Display', 'serif', ''],
  ['Fraunces', 'serif', '400;600;700'],
  ['EB Garamond', 'serif', '400;500;600;700'],
  ['Bebas Neue', 'display', ''],
  ['Abril Fatface', 'display', ''],
  ['Righteous', 'display', ''],
  ['Lobster', 'display', ''],
  ['Unbounded', 'display', '400;600;700'],
  ['Archivo Black', 'display', ''],
  ['Bungee', 'display', ''],
  ['Pacifico', 'script', ''],
  ['Dancing Script', 'script', '400;700'],
  ['Great Vibes', 'script', ''],
  ['Satisfy', 'script', ''],
  ['Caveat', 'script', '400;700'],
  ['Sacramento', 'script', ''],
  ['Allura', 'script', ''],
  ['Parisienne', 'script', ''],
  ['JetBrains Mono', 'mono', '400;500;700'],
  ['Space Mono', 'mono', '400;700'],
  ['Fira Code', 'mono', '400;500;700'],
  // Hindi / Devanagari
  ['Hind', 'hindi', '400;500;600;700'],
  ['Mukta', 'hindi', '400;500;600;700;800'],
  ['Baloo 2', 'hindi', '400;500;600;700;800'],
  ['Noto Sans Devanagari', 'hindi', '400;500;600;700;800'],
  ['Rozha One', 'hindi', ''],
  ['Teko', 'hindi', '400;500;600;700'],
  ['Yatra One', 'hindi', ''],
  ['Kalam', 'hindi', '400;700'],
  ['Khand', 'hindi', '400;500;600;700'],
  ['Eczar', 'hindi', '400;500;600;700;800'],
  ['Martel', 'hindi', '400;600;700;800'],
  ['Amita', 'hindi', '400;700'],
  ['Sarpanch', 'hindi', '400;600;700;800;900'],
  ['Tiro Devanagari Hindi', 'hindi', ''],
  ['Palanquin Dark', 'hindi', '400;500;600;700'],
  ['Laila', 'hindi', '400;500;600;700'],
  ['Modak', 'hindi', ''],
  ['Rajdhani', 'hindi', '400;500;600;700'],
  ['Gotu', 'hindi', ''],
].map(([name, category, weights]) => ({ name, category, weights }));

export const FONT_GROUPS = [
  ['sans', 'Clean sans'],
  ['serif', 'Serif'],
  ['display', 'Display'],
  ['script', 'Stylish script'],
  ['mono', 'Monospace'],
  ['hindi', 'Hindi (Devanagari)'],
];

const FALLBACK = {
  sans: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  display: 'Impact, system-ui, sans-serif',
  script: 'cursive',
  mono: 'ui-monospace, Menlo, Consolas, monospace',
  hindi: '"Noto Sans Devanagari", "Mangal", "Kohinoor Devanagari", sans-serif',
};

export function fontStack(name) {
  const f = FONTS.find((x) => x.name === name);
  if (!f || f.name === 'System') return FALLBACK.sans;
  return `'${f.name}', ${FALLBACK[f.category]}`;
}

export function fontHref(names) {
  const list = [...new Set(names)]
    .map((n) => FONTS.find((f) => f.name === n))
    .filter((f) => f && f.weights !== null);
  if (!list.length) return null;
  const fam = list
    .map((f) => 'family=' + f.name.replace(/ /g, '+') + (f.weights ? ':wght@' + f.weights : ''))
    .join('&');
  return `https://fonts.googleapis.com/css2?${fam}&display=swap`;
}
