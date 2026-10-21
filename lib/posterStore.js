import { one, query } from './db';

// The posters table is created on first use, so existing installs don't need to re-run the setup script.
let ready = null;
export function ensurePosters() {
  if (!ready) {
    ready = query(`CREATE TABLE IF NOT EXISTS posters (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNSIGNED NOT NULL,
      name VARCHAR(160) NOT NULL DEFAULT 'Untitled design',
      template_slug VARCHAR(80) NOT NULL DEFAULT 'blank',
      format VARCHAR(40) NOT NULL DEFAULT 'poster-a4',
      data LONGTEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user (user_id),
      CONSTRAINT fk_poster_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`).catch((e) => { ready = null; throw e; });
  }
  return ready;
}

const num = (v, d, min, max) => (Number.isFinite(Number(v)) ? Math.max(min, Math.min(max, Number(v))) : d);

const cleanBg = (bg) => (bg && typeof bg === 'object' ? bg : { type: 'solid', color: '#FFFFFF' });
const cleanEls = (els) => (Array.isArray(els) ? els.filter((e) => e && typeof e === 'object').slice(0, 400) : []);

export function cleanPoster(d = {}) {
  const doc = {
    format: String(d.format || 'custom').slice(0, 40),
    w: num(d.w, 794, 50, 8000),
    h: num(d.h, 1123, 50, 8000),
    bg: cleanBg(d.bg),
    elements: cleanEls(d.elements),
  };
  // Multi-page designs (cards): every page, plus which one was open
  if (Array.isArray(d.pages) && d.pages.length > 1) {
    doc.pages = d.pages.slice(0, 12).map((p) => ({ name: String(p?.name || '').slice(0, 60), bg: cleanBg(p?.bg), elements: cleanEls(p?.elements) }));
    doc.page = num(d.page, 0, 0, doc.pages.length - 1);
  }
  return doc;
}

export async function ownPoster(user, id) {
  await ensurePosters();
  const row = await one('SELECT * FROM posters WHERE id = ?', [Number(id)]);
  if (!row) return null;
  if (row.user_id !== user.id && user.role !== 'admin') return null;
  return row;
}
