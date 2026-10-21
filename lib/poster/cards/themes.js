// 25 card looks. Each picks a layout (how the page is dressed: arch, palace, mandala, toran…), its colours,
// English and Hindi fonts and a few ornament options. Every theme works for every function.
//   bg / bg2: page background (gradient when both) · ink: main text · gold: titles and ornaments · gold2: light gold for gradients
//   soft: secondary text · accent: second ornament colour · panel / panelInk: card panel colours for panel layouts
//   font: display (titles), script (names), body, with width factors used to size text; hi: the Devanagari equivalents
//   emblem: how Ganesha (or the faith symbol) is drawn: line | filled | halo | kalash | om | swastik
const EN = {
  classic: { display: 'Cinzel', dWide: 0.78, dUpper: true, script: 'Great Vibes', sWide: 0.42, body: 'Cormorant Garamond', bWide: 0.5 },
  deco: { display: 'Cinzel Decorative', dWide: 0.8, dUpper: false, script: 'Parisienne', sWide: 0.44, body: 'EB Garamond', bWide: 0.5 },
  modern: { display: 'Marcellus', dWide: 0.66, dUpper: true, script: 'Allura', sWide: 0.42, body: 'Jost', bWide: 0.52 },
  romantic: { display: 'Playfair Display', dWide: 0.6, dUpper: false, script: 'Great Vibes', sWide: 0.42, body: 'Lora', bWide: 0.52 },
  elegant: { display: 'Cormorant Garamond', dWide: 0.55, dUpper: true, script: 'Sacramento', sWide: 0.38, body: 'Cormorant Garamond', bWide: 0.5 },
  bold: { display: 'DM Serif Display', dWide: 0.6, dUpper: false, script: 'Dancing Script', sWide: 0.48, body: 'Montserrat', bWide: 0.56 },
};
const HI = {
  rozha: { display: 'Rozha One', script: 'Rozha One', body: 'Martel' },
  yatra: { display: 'Yatra One', script: 'Amita', body: 'Laila' },
  tiro: { display: 'Tiro Devanagari Hindi', script: 'Tiro Devanagari Hindi', body: 'Tiro Devanagari Hindi' },
  amita: { display: 'Amita', script: 'Amita', body: 'Martel' },
  eczar: { display: 'Eczar', script: 'Kalam', body: 'Mukta' },
  palanquin: { display: 'Palanquin Dark', script: 'Yatra One', body: 'Gotu' },
};

const T = (key, name, layout, colors, font, hi, emblem, opts = {}) => ({ key, name, layout, ...colors, font: EN[font], hi: HI[hi], emblem, opts });

export const CARD_THEMES = [
  T('royal-maroon', 'Royal Maroon Arch', 'arch', { bg: '#5A0B1C', bg2: '#8B1E2D', ink: '#FFF4DC', gold: '#E2B54A', gold2: '#FCE7A8', soft: '#F3D9A4', accent: '#F5C542', dark: true }, 'classic', 'rozha', 'line', { jaali: 'ogee', bells: true }),
  T('kesar', 'Kesar Saffron', 'arch', { bg: '#F59E0B', bg2: '#EA580C', ink: '#4A0A0A', gold: '#7F1D1D', gold2: '#B91C1C', soft: '#5C1A00', accent: '#FFF3B0', dark: false }, 'deco', 'yatra', 'filled', { jaali: 'quatrefoil', fill: '#FFE7B0' }),
  T('mughal-garden', 'Mughal Garden', 'arch', { bg: '#FBF5EA', bg2: '#F3E6CC', ink: '#2F3E2B', gold: '#A87B1E', gold2: '#D9B45B', soft: '#5B6B4E', accent: '#BE185D', dark: false }, 'romantic', 'tiro', 'line', { flora: true }),
  T('ivory-gold', 'Ivory & Gold', 'minimal', { bg: '#FBF7EE', ink: '#3E2C14', gold: '#B08A3E', gold2: '#E0C27A', soft: '#6B5A3C', accent: '#B08A3E', dark: false }, 'classic', 'tiro', 'line', {}),
  T('rose-gold', 'Blush Rose Gold', 'minimal', { bg: '#FBEDE8', bg2: '#F7DCD3', ink: '#5B2C35', gold: '#B76E79', gold2: '#E8B4B8', soft: '#7D4F57', accent: '#C9897F', dark: false }, 'elegant', 'amita', 'halo', { roses: true }),
  T('rajwada', 'Rajwada Palace', 'palace', { bg: '#FBEBD0', bg2: '#F4D7A8', ink: '#6B1020', gold: '#9A3412', gold2: '#C2410C', soft: '#7C2D12', accent: '#7F1D1D', dark: false }, 'deco', 'rozha', 'filled', { fill: '#FCD9A8' }),
  T('udaipur-dusk', 'Udaipur Dusk', 'palace', { bg: '#FBCFE8', bg2: '#FDBA74', ink: '#3B0A45', gold: '#6B1A6E', gold2: '#A3367F', soft: '#5B2160', accent: '#4C1D95', dark: false }, 'modern', 'palanquin', 'halo', { palace: '#4C1D95', dusk: true }),
  T('peacock', 'Peacock Mandala', 'mandala', { bg: '#053B47', bg2: '#0E6377', ink: '#F0FDFA', gold: '#E9C46A', gold2: '#FDE68A', soft: '#B9E4E0', accent: '#34D399', dark: true }, 'classic', 'rozha', 'halo', { mandala: 'mixed' }),
  T('bengal-alpana', 'Bengal Alpana', 'mandala', { bg: '#FFFDF8', ink: '#8E0E17', gold: '#C8102E', gold2: '#E8505B', soft: '#7A1C22', accent: '#C8102E', dark: false }, 'romantic', 'tiro', 'line', { mandala: 'line', light: true }),
  T('sindoor', 'Sindoor Red', 'mandala', { bg: '#7A0A14', bg2: '#A3141F', ink: '#FFF3E0', gold: '#F2C14E', gold2: '#FDE7A8', soft: '#F7D9B0', accent: '#F2C14E', dark: true }, 'deco', 'yatra', 'line', { mandala: 'dotted' }),
  T('lotus-pink', 'Lotus Pink', 'floral', { bg: '#FDECF3', bg2: '#FBD5E5', ink: '#5B1236', gold: '#B8326E', gold2: '#E879A6', soft: '#7A3555', accent: '#16A34A', dark: false }, 'romantic', 'amita', 'line', { flower: 'lotus' }),
  T('watercolour-blush', 'Watercolour Blush', 'floral', { bg: '#FFF7F5', bg2: '#FDE8EC', ink: '#4A2B3A', gold: '#B5838D', gold2: '#E5B9C2', soft: '#6D5260', accent: '#9AB89A', dark: false }, 'elegant', 'tiro', 'halo', { flower: 'rose', glow: true }),
  T('mehndi-green', 'Mehndi Green', 'floral', { bg: '#EEF3DD', bg2: '#DCE7BE', ink: '#2F3B12', gold: '#7C5A1E', gold2: '#B8862F', soft: '#4D5A2A', accent: '#B45309', dark: false }, 'bold', 'eczar', 'filled', { flower: 'paisley', fill: '#F3E3B8' }),
  T('marigold', 'Marigold Toran', 'toran', { bg: '#FFF3D6', bg2: '#FFE0A3', ink: '#6B1A07', gold: '#C2410C', gold2: '#F97316', soft: '#7C2D12', accent: '#15803D', dark: false }, 'deco', 'yatra', 'filled', { garland: 'marigold', fill: '#FFE7B0' }),
  T('haldi', 'Haldi Sunshine', 'toran', { bg: '#FFE985', bg2: '#FFC93C', ink: '#4A2C05', gold: '#8A4B08', gold2: '#B45309', soft: '#5C3A0A', accent: '#16A34A', dark: false }, 'bold', 'eczar', 'line', { garland: 'mixed', bunting: true }),
  T('kanjeevaram', 'Kanjeevaram Temple', 'temple', { bg: '#FFF7E6', ink: '#5E0B1B', gold: '#B8860B', gold2: '#E0B84D', soft: '#6B2A1A', accent: '#7A0F22', dark: false }, 'classic', 'rozha', 'filled', { band: 'temple', fill: '#FBE3B0' }),
  T('kasavu', 'Kerala Kasavu', 'temple', { bg: '#FBF6E9', ink: '#3B2A10', gold: '#B8912F', gold2: '#E3C36B', soft: '#5C4A2A', accent: '#B8912F', dark: false }, 'elegant', 'tiro', 'line', { band: 'zari', lamp: true }),
  T('banarasi', 'Banarasi Brocade', 'brocade', { bg: '#7E0D1F', ink: '#5A0B1C', gold: '#E2B54A', gold2: '#FCE7A8', soft: '#7A3B2E', accent: '#E2B54A', panel: '#FFF6E3', dark: true }, 'classic', 'rozha', 'line', { buti: 'flower' }),
  T('rani-brocade', 'Rani Pink Brocade', 'brocade', { bg: '#9D174D', ink: '#5B0E33', gold: '#F2C14E', gold2: '#FFE9A8', soft: '#7A2E52', accent: '#F2C14E', panel: '#FFF5F8', dark: true }, 'romantic', 'amita', 'halo', { buti: 'paisley' }),
  T('emerald-jaali', 'Emerald Jaali', 'royal', { bg: '#0B3B2C', bg2: '#145A43', ink: '#F4F1E1', gold: '#E2B54A', gold2: '#FCE7A8', soft: '#CFE3D6', accent: '#E2B54A', dark: true }, 'classic', 'rozha', 'line', { jaali: 'star', frame: 'royal' }),
  T('navy-deco', 'Navy Art Deco', 'royal', { bg: '#0D1B3E', bg2: '#16295C', ink: '#F5F1E6', gold: '#D8B45A', gold2: '#F6E3A6', soft: '#C9D2E8', accent: '#D8B45A', dark: true }, 'deco', 'palanquin', 'halo', { jaali: 'diamond', frame: 'beads' }),
  T('black-gold', 'Black & Gold Luxe', 'royal', { bg: '#0A0A0A', bg2: '#1C1A17', ink: '#F7F2E7', gold: '#D4AF37', gold2: '#F7E7B4', soft: '#CFC6B2', accent: '#D4AF37', dark: true }, 'elegant', 'rozha', 'line', { jaali: 'ogee', frame: 'filigree' }),
  T('midnight', 'Midnight Stars', 'night', { bg: '#0B1533', bg2: '#1E2A5E', ink: '#F8FAFC', gold: '#F2C66D', gold2: '#FDE7B0', soft: '#C7D2FE', accent: '#A78BFA', dark: true }, 'modern', 'yatra', 'halo', {}),
  T('royal-purple', 'Royal Purple Drapes', 'drape', { bg: '#3B0A45', bg2: '#5B1470', ink: '#FBF4FF', gold: '#E9C46A', gold2: '#FDE68A', soft: '#E9D5FF', accent: '#E9C46A', dark: true }, 'deco', 'rozha', 'line', {}),
  T('heritage-scroll', 'Heritage Scroll', 'scroll', { bg: '#4A1D0F', bg2: '#6B2D16', ink: '#4A2511', gold: '#8B4513', gold2: '#B7712F', soft: '#5C3317', accent: '#E2B54A', panel: '#F6E7C1', dark: true }, 'elegant', 'tiro', 'filled', { fill: '#EED9A8' }),
];

export const getCardTheme = (key) => CARD_THEMES.find((t) => t.key === key);
