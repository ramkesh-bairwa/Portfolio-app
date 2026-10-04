import { redirect } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import DashboardClient from '@/components/DashboardClient';
import { getCurrentUser, publicUser } from '@/lib/auth';
import { one, query } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { getTemplateList } from '@/lib/templateStore';
import { ensureResumes } from '@/lib/resumeStore';
import { ensurePosters } from '@/lib/posterStore';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/dashboard');
  const resumes = await ensureResumes()
    .then(() => query('SELECT id, name, template_slug, data, updated_at FROM resumes WHERE user_id = ? ORDER BY updated_at DESC', [user.id]))
    .catch(() => []);
  const posters = await ensurePosters()
    .then(() => query('SELECT id, name, data, updated_at FROM posters WHERE user_id = ? ORDER BY updated_at DESC', [user.id]))
    .catch(() => []);
  const [portfolios, request, settings, templates] = await Promise.all([
    query('SELECT id, name, template_slug, data, slug, published_at, updated_at FROM portfolios WHERE user_id = ? ORDER BY updated_at DESC', [user.id]),
    one('SELECT status, created_at FROM premium_requests WHERE user_id = ? ORDER BY id DESC LIMIT 1', [user.id]),
    getSettings(),
    getTemplateList({ includeInactive: true }),
  ]);
  return (
    <>
      <SiteHeader />
      <DashboardClient
        user={publicUser(user)}
        portfolios={portfolios.map((p) => ({ ...p, data: JSON.parse(p.data || '{}') }))}
        resumes={resumes.map((r) => { let data = {}; try { data = JSON.parse(r.data || '{}'); } catch { /* skip */ } return { ...r, data }; })}
        posters={posters.map((p) => { let data = {}; try { data = JSON.parse(p.data || '{}'); } catch { /* skip */ } return { ...p, data }; })}
        request={request}
        publishNeedsPremium={settings.download_requires_premium === '1'}
        templates={templates}
      />
    </>
  );
}
