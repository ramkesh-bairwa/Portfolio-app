// Shaadi card studio: 420 printing-press patrikas + 84 colour photo cards = 504 designs. Each design is put together
// from parts (frame, art across the fold, heading, programme, names, bottom art, columns, block order / photo shape,
// background…) and no two designs share most of their parts. Every design comes as 1, 2, 3 or 4 pages, Hindi or English.
import { getFormat } from '../formats';
import { WORDS, loadDetails } from './details';
import { INKS, PART_LABELS, PATRIKA_DESIGNS, buildPatrika } from './patrika';
import { PHOTO_DESIGNS, buildPhoto } from './photo';

export { SAMPLE, WORDS, DETAILS_KEY, loadDetails, saveDetails } from './details';
export const SHAADI_PAGES = [1, 2, 3, 4];
export const PAGE_LABELS = {
  1: { hi: 'एक पेज', en: 'Single', note: 'Everything on one sheet' },
  2: { hi: 'दो पेज', en: 'Double', note: 'Cover + inside' },
  3: { hi: 'तीन पेज', en: 'Triple', note: 'Cover + inside + reception insert' },
  4: { hi: 'चार पेज', en: 'Four', note: 'Front, back, inside and insert' },
};
export const SHAADI_INKS = INKS;
// Filters for the gallery: the art across the fold (patrikas) and the photo shape (photo cards)
export const SHAADI_GROUPS = [
  ...Object.entries(PART_LABELS.fold).map(([key, hiName]) => ({ key: `fold:${key}`, kind: 'patrika', hiName, test: (d) => d.parts.fold === key })),
  ...[['circles', 'दो फोटो'], ['arch', 'मेहराब फोटो'], ['heart', 'दिल फोटो'], ['wave', 'कपल फोटो'], ['art', 'बिना फोटो']].map(([key, hiName]) => ({ key: `photo:${key}`, kind: 'photo', hiName, test: (d) => d.parts.photo === key })),
];

// five patrikas, then a photo card, so the first screens mix both
export const SHAADI_DESIGNS = [];
for (let i = 0, j = 0; i < PATRIKA_DESIGNS.length || j < PHOTO_DESIGNS.length;) {
  for (let k = 0; k < 5 && i < PATRIKA_DESIGNS.length; k++) SHAADI_DESIGNS.push(PATRIKA_DESIGNS[i++]);
  if (j < PHOTO_DESIGNS.length) SHAADI_DESIGNS.push(PHOTO_DESIGNS[j++]);
}
const BY_ID = new Map(SHAADI_DESIGNS.map((d) => [d.id, d]));
export const getShaadiDesign = (id) => BY_ID.get(id) || null;

// slug = "shaadi--<design id>--<hi|en>-p<pages>"
export const shaadiSlug = (id, lang = 'hi', pages = 3) => `shaadi--${id}--${lang === 'en' ? 'en' : 'hi'}-p${pages}`;
export const isShaadiSlug = (slug) => String(slug || '').startsWith('shaadi--');
export function parseShaadiSlug(slug) {
  const [, id, extra = ''] = String(slug || '').split('--');
  const d = getShaadiDesign(id);
  if (!d) return null;
  const pages = Math.min(4, Math.max(1, Number((/p(\d)/.exec(extra) || [])[1]) || 3));
  return { design: d, lang: extra.startsWith('en') ? 'en' : 'hi', pages };
}

// details: the couple's wording (defaults to what the studio saved, else the sample)
export function buildShaadiCard(design, { lang = 'hi', pages = 3, details } = {}) {
  const D = details || loadDetails(lang);
  const W_ = WORDS[D.lang === 'en' ? 'en' : 'hi'];
  const f = getFormat(design.format);
  const list = (design.kind === 'patrika' ? buildPatrika : buildPhoto)(design, D, W_, pages, f.w, f.h);
  const who = `${D.groom.name.split(' ')[0]} & ${D.bride.name.split(' ')[0]}`;
  return { name: `${who} · कार्ड ${design.kind === 'patrika' ? design.no : `F${design.no}`}`, template: shaadiSlug(design.id, D.lang, pages), format: f.key, w: f.w, h: f.h, pages: list, page: 0, bg: list[0].bg, elements: list[0].elements };
}

export function shaadiFromSlug(slug) {
  const p = parseShaadiSlug(slug);
  return p ? buildShaadiCard(p.design, { lang: p.lang, pages: p.pages }) : null;
}
