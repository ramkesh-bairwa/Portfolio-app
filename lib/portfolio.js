import { one } from './db';

export function parseData(row) {
  try {
    return JSON.parse(row.data);
  } catch {
    return { theme: {}, blocks: [], page: {} };
  }
}

export function cleanData(d = {}) {
  return {
    theme: d.theme && typeof d.theme === 'object' ? d.theme : {},
    blocks: Array.isArray(d.blocks) ? d.blocks.slice(0, 200) : [],
    page: d.page && typeof d.page === 'object' ? d.page : {},
  };
}

export async function ownPortfolio(user, id) {
  const row = await one('SELECT * FROM portfolios WHERE id = ?', [Number(id)]);
  if (!row) return null;
  if (row.user_id !== user.id && user.role !== 'admin') return null;
  return row;
}
