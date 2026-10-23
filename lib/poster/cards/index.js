// Wedding & function cards: every function × every theme (25 styles + 50 printing-press "patrika" styles), each in English and Hindi, as 1, 2 or 3 pages.
import { getFormat } from '../formats';
import { buildCardPages } from './build';
import { CARD_EVENTS, CARD_EVENT_GROUPS, getCardEvent } from './events';
import { CARD_THEMES as BASE_THEMES } from './themes';
// The printing-press patrikas live in the shaadi card studio (lib/poster/shaadi)
export const CARD_THEMES = BASE_THEMES;
const getCardTheme = (key) => CARD_THEMES.find((t) => t.key === key);
export { CARD_EVENTS, CARD_EVENT_GROUPS };
export const CARD_FORMAT = 'invitation';
export const CARD_PAGE_OPTIONS = [1, 2, 3];

// slug = "card--<function>--<theme>--<lang>-p<pages>", e.g. card--wedding--royal-maroon--hi-p3
export const cardSlug = (ev, theme, lang = 'en', pages = 3) => `card--${ev}--${theme}--${lang === 'hi' ? 'hi' : 'en'}-p${pages}`;
export const isCardSlug = (slug) => String(slug || '').startsWith('card--');

export function parseCardSlug(slug) {
  const [, ev, theme, extra = ''] = String(slug || '').split('--');
  const e = getCardEvent(ev);
  const t = getCardTheme(theme);
  if (!e || !t) return null;
  const pages = Number((/p(\d)/.exec(extra) || [])[1]) || e.pages;
  return { event: e, theme: t, lang: extra.startsWith('hi') ? 'hi' : 'en', pages: Math.min(3, Math.max(1, pages)) };
}

// Every design (function × theme), for counting and listing
export const CARD_DESIGNS = CARD_EVENTS.flatMap((e) => CARD_THEMES.map((t) => ({ event: e.key, theme: t.key })));

export function buildCard({ event, theme, lang, pages }, formatKey = CARD_FORMAT) {
  const f = getFormat(formatKey);
  const list = buildCardPages(event, theme, lang, pages, f.w, f.h);
  const name = `${lang === 'hi' ? event.hiName : event.name} · ${theme.name}`;
  return { name, template: cardSlug(event.key, theme.key, lang, pages), format: f.key, w: f.w, h: f.h, pages: list, page: 0, bg: list[0].bg, elements: list[0].elements };
}

export const cardFromSlug = (slug, formatKey) => {
  const c = parseCardSlug(slug);
  return c ? buildCard(c, formatKey || CARD_FORMAT) : null;
};
