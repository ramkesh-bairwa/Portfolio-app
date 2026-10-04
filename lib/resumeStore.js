import { one, query } from './db';

// The resumes table is created on first use, so existing installs don't need to re-run the setup script.
let ready = null;
export function ensureResumes() {
  if (!ready) {
    ready = query(`CREATE TABLE IF NOT EXISTS resumes (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNSIGNED NOT NULL,
      name VARCHAR(160) NOT NULL DEFAULT 'My resume',
      template_slug VARCHAR(80) NOT NULL,
      data LONGTEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user (user_id),
      CONSTRAINT fk_resume_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`).catch((e) => { ready = null; throw e; });
  }
  return ready;
}

export function cleanResume(d = {}) {
  return {
    design: typeof d.design === 'string' ? d.design.slice(0, 60) : '',
    theme: d.theme && typeof d.theme === 'object' ? d.theme : {},
    sections: Array.isArray(d.sections) ? d.sections.slice(0, 60) : [],
  };
}

export async function ownResume(user, id) {
  await ensureResumes();
  const row = await one('SELECT * FROM resumes WHERE id = ?', [Number(id)]);
  if (!row) return null;
  if (row.user_id !== user.id && user.role !== 'admin') return null;
  return row;
}
