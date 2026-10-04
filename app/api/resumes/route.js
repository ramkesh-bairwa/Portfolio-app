import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { body, fail, ok } from '@/lib/http';
import { cleanResume, ensureResumes } from '@/lib/resumeStore';
import { getResumeTemplate, resumeFromTemplate } from '@/lib/resume/templates';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail('Log in first.', 401);
  await ensureResumes();
  const rows = await query('SELECT id, name, template_slug, updated_at FROM resumes WHERE user_id = ? ORDER BY updated_at DESC', [user.id]);
  return ok({ resumes: rows });
}

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return fail('Log in to save your resume.', 401);
  await ensureResumes();
  const { template, name, data } = await body(req);
  const slug = getResumeTemplate(template) ? template : 'software-engineer-classic-ats';
  const doc = cleanResume(data || resumeFromTemplate(slug));
  const res = await query('INSERT INTO resumes (user_id, name, template_slug, data) VALUES (?, ?, ?, ?)', [user.id, String(name || 'My resume').slice(0, 160), slug, JSON.stringify(doc)]);
  return ok({ id: res.insertId });
}
