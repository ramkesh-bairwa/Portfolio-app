// Multi-page designs (wedding cards: cover, invitation, programme).
// The page being edited lives in doc.bg / doc.elements like a one-page design, so every editing tool keeps working;
// doc.pages holds all pages and doc.page says which one is open. pages[page] is refreshed from bg/elements on every read.
export const MAX_PAGES = 12;

export const pageCount = (d) => (Array.isArray(d?.pages) && d.pages.length ? d.pages.length : 1);
export const pageIndex = (d) => Math.min(Math.max(0, d?.page || 0), pageCount(d) - 1);

export function allPages(d) {
  if (!Array.isArray(d.pages) || !d.pages.length) return [{ name: '', bg: d.bg, elements: d.elements }];
  const at = pageIndex(d);
  return d.pages.map((p, i) => (i === at ? { ...p, bg: d.bg, elements: d.elements } : p));
}

// A single page as a normal one-page design, for thumbnails and export
export const pageDoc = (d, i) => {
  const p = allPages(d)[i] || allPages(d)[0];
  return { ...d, bg: p.bg, elements: p.elements, pages: undefined, page: 0 };
};

export function goToPage(d, i) {
  const pages = allPages(d);
  const at = Math.min(Math.max(0, i), pages.length - 1);
  return { ...d, pages, page: at, bg: pages[at].bg, elements: pages[at].elements };
}

const blankBg = (bg) => ({ ...(bg || {}), type: bg?.type === 'image' ? 'solid' : bg?.type || 'solid' });

export function addPage(d, { after = pageIndex(d), copy = false, eid } = {}) {
  const pages = allPages(d);
  if (pages.length >= MAX_PAGES) return d;
  const src = pages[after];
  const page = copy
    ? { name: '', bg: JSON.parse(JSON.stringify(src.bg)), elements: src.elements.map((e) => ({ ...JSON.parse(JSON.stringify(e)), id: eid ? eid() : `${e.id}c` })) }
    : { name: '', bg: blankBg(src.bg), elements: [] };
  pages.splice(after + 1, 0, page);
  return goToPage({ ...d, pages }, after + 1);
}

export function removePage(d, i = pageIndex(d)) {
  const pages = allPages(d);
  if (pages.length < 2) return d;
  pages.splice(i, 1);
  return goToPage({ ...d, pages }, Math.min(i, pages.length - 1));
}

export function movePage(d, i, dir) {
  const pages = allPages(d);
  const j = i + dir;
  if (j < 0 || j >= pages.length) return d;
  [pages[i], pages[j]] = [pages[j], pages[i]];
  const at = pageIndex(d);
  return goToPage({ ...d, pages }, at === i ? j : at === j ? i : at);
}

// Apply fn to the elements of every page (used by resize)
export function mapPages(d, fn) {
  if (!Array.isArray(d.pages) || !d.pages.length) return d;
  const pages = allPages(d).map((p) => ({ ...p, ...fn(p) }));
  return { ...d, pages, bg: pages[pageIndex(d)].bg, elements: pages[pageIndex(d)].elements };
}
