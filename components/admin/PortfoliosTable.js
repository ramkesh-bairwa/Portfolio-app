'use client';
import { useCallback, useEffect, useState } from 'react';
import NextLink from 'next/link';
import { ExternalLink, Globe, Loader2, PenLine, Search, Trash2 } from 'lucide-react';

const FILTERS = [['all', 'All'], ['live', 'Live'], ['draft', 'Not published']];
const date = (s) => (s ? new Date(String(s).replace(' ', 'T')).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

export default function PortfoliosTable({ initialFilter }) {
  const [filter, setFilter] = useState(initialFilter);
  const [q, setQ] = useState('');
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState({});
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    const r = await fetch(`/api/admin/portfolios?filter=${filter}&q=${encodeURIComponent(q)}`);
    const d = await r.json();
    setRows(d.portfolios || []);
  }, [filter, q]);
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function act(p, method, path, confirmText, after) {
    if (!confirm(confirmText)) return;
    setBusy((b) => ({ ...b, [p.id]: true }));
    setErr('');
    const r = await fetch(`/api/portfolios/${p.id}${path}`, { method });
    if (r.ok) setRows(after);
    else setErr((await r.json().catch(() => ({}))).error || 'Something went wrong. Try again.');
    setBusy((b) => ({ ...b, [p.id]: false }));
  }
  const unpublish = (p) =>
    act(p, 'DELETE', '/publish', `Take /${p.slug} offline?`, (list) => list.map((x) => (x.id === p.id ? { ...x, published_at: null } : x)));
  const remove = (p) =>
    act(p, 'DELETE', '', `Delete "${p.name}" by ${p.user_name || p.user_email || p.user_phone}? This cannot be undone.`, (list) => list.filter((x) => x.id !== p.id));

  return (
    <div className="max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Portfolios</h1>
          <p className="mt-1 text-mute">Every portfolio from every user. Open one to edit it, or take a live page offline.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input className="input pl-9" placeholder="Search name, link or owner" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search portfolios" />
        </div>
      </div>

      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto">
        {FILTERS.map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`shrink-0 rounded-full border px-3.5 py-1 text-sm font-semibold ${filter === k ? 'border-ink bg-ink text-white' : 'border-line bg-white text-mute hover:text-ink'}`}>{l}</button>
        ))}
      </div>
      {err && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold text-mute">
              <th className="px-4 py-3">Portfolio</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Template</th>
              <th className="px-4 py-3">Public link</th>
              <th className="px-4 py-3">Last edited</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows === null && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-mute"><Loader2 className="mx-auto animate-spin" /></td></tr>
            )}
            {rows?.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-mute">No portfolios match this filter.</td></tr>}
            {rows?.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-semibold">{p.name}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{p.user_name || <span className="text-mute">No name</span>}</p>
                  <p className="text-mute">{p.user_email || p.user_phone}</p>
                </td>
                <td className="px-4 py-3 capitalize text-mute">{p.template_slug}</td>
                <td className="px-4 py-3">
                  {p.published_at ? (
                    <a href={`/${p.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-green-700 hover:underline">
                      <Globe size={14} /> /{p.slug} <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="chip bg-paper text-mute">not published</span>
                  )}
                  {p.published_at && <p className="mt-0.5 text-xs text-mute">since {date(p.published_at)}</p>}
                </td>
                <td className="px-4 py-3 text-mute">{date(p.updated_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <NextLink href={`/builder/${p.id}`} className="btn-ghost px-2" aria-label="Open in builder" title="Open in builder"><PenLine size={15} /></NextLink>
                    {p.published_at && (
                      <button disabled={busy[p.id]} onClick={() => unpublish(p)} className="btn-ghost px-2.5 py-1 text-mute hover:text-red-600">Unpublish</button>
                    )}
                    <button disabled={busy[p.id]} onClick={() => remove(p)} className="btn-ghost px-2 text-mute hover:text-red-600" aria-label="Delete portfolio"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
