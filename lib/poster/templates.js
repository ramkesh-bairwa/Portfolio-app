import { POSTER_CATEGORIES, getPosterCategory } from './categories';
import { ALL_LAYOUTS, buildPoster } from './design';
import { FORMATS, getFormat } from './formats';

export const POSTER_LANGS = [['en', 'English'], ['hi', 'हिंदी']];
export const POSTER_VARIANTS = [0, 1];

// slug = "<category>--<layout>" plus "--v2", "--hi" or "--v2-hi" for the other colour scheme / Hindi
export const templateSlug = (cat, layout, variant = 0, lang = 'en') => {
  const extra = [variant ? 'v2' : '', lang === 'hi' ? 'hi' : ''].filter(Boolean).join('-');
  return `${cat}--${layout}${extra ? `--${extra}` : ''}`;
};

function describe(c, l, variant, lang) {
  return {
    slug: templateSlug(c.key, l.key, variant, lang), name: `${c.name} · ${l.name}${variant ? ' (colour 2)' : ''}${lang === 'hi' ? ' · हिंदी' : ''}`,
    category: c.key, categoryName: c.name, group: c.group, layout: l.key, variant, lang, format: c.format, pro: !l.type,
  };
}

// Every category × layout × colour scheme × language
export const POSTER_TEMPLATES = POSTER_CATEGORIES.flatMap((c) =>
  POSTER_LANGS.flatMap(([lang]) => POSTER_VARIANTS.flatMap((v) => ALL_LAYOUTS.map((l) => describe(c, l, v, lang))))
);

export const templatesFor = (catKey, lang) => {
  const c = getPosterCategory(catKey);
  if (!c) return [];
  return POSTER_VARIANTS.flatMap((v) => ALL_LAYOUTS.map((l) => describe(c, l, v, lang)))
    .sort((a, b) => Number(b.pro) - Number(a.pro) || a.variant - b.variant);
};

export function getPosterTemplate(slug) {
  const [cat, layout, extra = ''] = String(slug || '').split('--');
  const c = getPosterCategory(cat);
  const l = ALL_LAYOUTS.find((x) => x.key === layout);
  if (!c || !l) return null;
  return describe(c, l, extra.includes('v2') ? 1 : 0, extra.includes('hi') ? 'hi' : 'en');
}

export const buildTemplate = (t, format) => buildPoster(getPosterCategory(t.category), t.layout, format, { variant: t.variant, lang: t.lang });

// A fresh design from a template, in the template's own size unless another one is asked for
export function posterFromTemplate(slug, formatKey) {
  const t = getPosterTemplate(slug) || POSTER_TEMPLATES[0];
  const format = getFormat(formatKey && FORMATS.some((f) => f.key === formatKey) ? formatKey : t.format);
  return { name: t.categoryName, template: t.slug, ...buildTemplate(t, format) };
}

export function blankPoster(formatKey) {
  const f = getFormat(formatKey);
  return { name: 'Untitled design', template: 'blank', format: f.key, w: f.w, h: f.h, bg: { type: 'solid', color: '#FFFFFF', from: '#FFFFFF', to: '#E2E8F0', angle: 135, image: '', overlay: 0 }, elements: [] };
}
