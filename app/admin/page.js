import NextLink from 'next/link';
import { one, query } from '@/lib/db';

export default async function AdminHome() {
  const [u, p, d, r, recent, topTemplates] = await Promise.all([
    one(`SELECT COUNT(*) total, SUM(status='pending') pending, SUM(is_premium=1) premium, SUM(free_access=1) free, SUM(auth_type='mobile') mobile FROM users WHERE role='user'`),
    one('SELECT COUNT(*) n FROM portfolios'),
    one('SELECT SUM(published_at IS NOT NULL) n, SUM(published_at > NOW() - INTERVAL 7 DAY) week FROM portfolios'),
    one(`SELECT COUNT(*) n FROM premium_requests WHERE status='pending'`),
    query(`SELECT id, name, email, phone, auth_type, status, created_at FROM users WHERE role='user' ORDER BY created_at DESC LIMIT 8`),
    query('SELECT template_slug slug, COUNT(*) n FROM portfolios WHERE published_at IS NOT NULL GROUP BY template_slug ORDER BY n DESC LIMIT 5'),
  ]);
  const n = (v) => Number(v || 0);
  const cards = [
    ['Users', n(u.total), `${n(u.mobile)} via mobile`, '/admin/users'],
    ['Waiting for approval', n(u.pending), 'Email sign-ups', '/admin/users?filter=pending'],
    ['Premium requests', n(r.n), 'Waiting for review', '/admin/requests'],
    ['Premium users', n(u.premium), `${n(u.free)} with free access`, '/admin/users?filter=premium'],
    ['Portfolios', n(p.n), 'Created by users', '/admin/portfolios'],
    ['Published', n(d.n), `${n(d.week)} published in the last 7 days`, '/admin/portfolios?filter=live'],
  ];
  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value, sub, href]) => {
          const body = (
            <>
              <p className="text-sm font-semibold text-mute">{label}</p>
              <p className="mt-2 font-display text-4xl font-extrabold">{value}</p>
              <p className="mt-1 text-sm text-mute">{sub}</p>
            </>
          );
          return href ? (
            <NextLink key={label} href={href} className={`card p-5 hover:border-ink/40 ${(label.startsWith('Waiting') || label.startsWith('Premium req')) && value > 0 ? 'border-sun bg-sun/5' : ''}`}>{body}</NextLink>
          ) : (
            <div key={label} className="card p-5">{body}</div>
          );
        })}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="card overflow-hidden">
          <h2 className="border-b border-line px-5 py-3 text-lg font-bold">Newest users</h2>
          <ul>
            {recent.map((x) => (
              <li key={x.id} className="flex items-center justify-between gap-3 border-b border-line px-5 py-3 last:border-0">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{x.name || 'No name'}</p>
                  <p className="truncate text-sm text-mute">{x.email || x.phone} · {x.auth_type}</p>
                </div>
                <span className={`chip ${x.status === 'pending' ? 'bg-sun/20 text-ink' : x.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{x.status}</span>
              </li>
            ))}
            {!recent.length && <li className="px-5 py-6 text-sm text-mute">No users yet.</li>}
          </ul>
        </section>
        <section className="card overflow-hidden">
          <h2 className="border-b border-line px-5 py-3 text-lg font-bold">Most published templates</h2>
          <ul>
            {topTemplates.map((t) => (
              <li key={t.slug} className="flex justify-between border-b border-line px-5 py-3 text-sm last:border-0">
                <span className="font-semibold capitalize">{t.slug}</span>
                <span className="text-mute">{t.n} live</span>
              </li>
            ))}
            {!topTemplates.length && <li className="px-5 py-6 text-sm text-mute">Nothing published yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
