import { getCurrentUser, hasPublishAccess } from '@/lib/auth';
import { ownResume } from '@/lib/resumeStore';
import { getDesign } from '@/lib/resume/designs';
import { renderResumeDocument } from '@/lib/resume/render';

export const dynamic = 'force-dynamic';

const page = (msg, status) =>
  new Response(`<!doctype html><meta charset="utf-8"><title>Resume</title><p style="font-family:system-ui;padding:3rem;text-align:center;max-width:520px;margin:auto">${msg}</p>`, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });

// Printable resume (opens the print dialog so it can be saved as PDF). Premium designs need premium access.
export async function GET(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return page('Log in to download your resume.', 401);
  const row = await ownResume(user, params.id);
  if (!row) return page('Resume not found.', 404);
  let data = {};
  try { data = JSON.parse(row.data || '{}'); } catch { /* keep empty */ }
  const design = getDesign(data.design);
  if (design.premium && !hasPublishAccess(user)) return page(`“${design.name}” is a premium resume design. Ask for premium access from the builder or your dashboard, or switch to a free design.`, 402);
  return new Response(renderResumeDocument(data, { print: true }), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}
