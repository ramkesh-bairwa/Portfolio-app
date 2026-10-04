'use client';
import { useCallback, useEffect, useState } from 'react';
import { Ban, Check, Loader2, Mail, MessageCircle, Search, Smartphone, Trash2, X } from 'lucide-react';
import Switch from './Switch';

const FILTERS = [
  ['all', 'All'], ['pending', 'Waiting'], ['active', 'Active'], ['premium', 'Premium'], ['free', 'Free access'],
  ['email', 'Email'], ['mobile', 'Mobile'], ['blocked', 'Blocked'], ['rejected', 'Rejected'],
];
const STATUS_STYLE = {
  pending: 'bg-sun/20 text-ink',
  active: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  blocked: 'bg-ink text-white',
};

export default function UsersTable({ initialFilter }) {
  const [filter, setFilter] = useState(initialFilter);
  const [q, setQ] = useState('');
  const [users, setUsers] = useState(null);
  const [busy, setBusy] = useState({});
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    const r = await fetch(`/api/admin/users?filter=${filter}&q=${encodeURIComponent(q)}`);
    const d = await r.json();
    setUsers(d.users || []);
  }, [filter, q]);
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function patch(u, changes) {
    setBusy((b) => ({ ...b, [u.id]: true }));
    setErr('');
    setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, ...changes } : x)));
    const r = await fetch(`/api/admin/users/${u.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(changes) });
    if (!r.ok) {
      setErr((await r.json()).error);
      load();
    }
    setBusy((b) => ({ ...b, [u.id]: false }));
  }
  async function remove(u) {
    if (!confirm(`Delete ${u.name || u.email || u.phone} and all their portfolios?`)) return;
    const r = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' });
    if (r.ok) setUsers((list) => list.filter((x) => x.id !== u.id));
    else setErr((await r.json()).error);
  }

  return (
    <div className="max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Users</h1>
          <p className="mt-1 text-mute">Approve email sign-ups, give premium, or turn on free publish access.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input className="input pl-9" placeholder="Search name, email or phone" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search users" />
        </div>
      </div>

      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto">
        {FILTERS.map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`shrink-0 rounded-full border px-3.5 py-1 text-sm font-semibold ${filter === k ? 'border-ink bg-ink text-white' : 'border-line bg-white text-mute hover:text-ink'}`}>{l}</button>
        ))}
      </div>
      {err && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold text-mute">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Login</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Approval</th>
              <th className="px-4 py-3 text-center">Premium</th>
              <th className="px-4 py-3 text-center">Free access</th>
              <th className="px-4 py-3 text-center">Portfolios</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users === null && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-mute"><Loader2 className="mx-auto animate-spin" /></td></tr>
            )}
            {users?.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-mute">No users match this filter.</td></tr>}
            {users?.map((u) => {
              const isAdmin = u.role === 'admin';
              return (
                <tr key={u.id} className={`border-b border-line last:border-0 ${u.status === 'pending' ? 'bg-sun/5' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{u.name || <span className="text-mute">No name</span>} {isAdmin && <span className="chip ml-1 bg-signal-soft text-signal">admin</span>}</p>
                    <p className="text-mute">{u.email || u.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    {u.auth_type === 'mobile' ? (
                      <span className="flex items-center gap-1.5"><Smartphone size={14} /> Mobile {u.whatsapp_opt_in ? <MessageCircle size={14} className="text-[#25D366]" title="WhatsApp opted in" /> : null}</span>
                    ) : (
                      <span className="flex items-center gap-1.5"><Mail size={14} /> Email</span>
                    )}
                  </td>
                  <td className="px-4 py-3"><span className={`chip ${STATUS_STYLE[u.status]}`}>{u.status === 'pending' ? 'waiting' : u.status}</span></td>
                  <td className="px-4 py-3">
                    {isAdmin ? <span className="text-mute">—</span> : u.status === 'pending' || u.status === 'rejected' ? (
                      <div className="flex gap-1.5">
                        <button disabled={busy[u.id]} onClick={() => patch(u, { status: 'active' })} className="btn bg-green-600 px-2.5 py-1 text-white hover:bg-green-700"><Check size={14} /> Approve</button>
                        {u.status === 'pending' && <button disabled={busy[u.id]} onClick={() => patch(u, { status: 'rejected' })} className="btn-light px-2.5 py-1"><X size={14} /> Reject</button>}
                      </div>
                    ) : u.status === 'blocked' ? (
                      <button disabled={busy[u.id]} onClick={() => patch(u, { status: 'active' })} className="btn-light px-2.5 py-1">Unblock</button>
                    ) : (
                      <button disabled={busy[u.id]} onClick={() => patch(u, { status: 'blocked' })} className="btn-ghost px-2.5 py-1 text-mute hover:text-red-600"><Ban size={14} /> Block</button>
                    )}
                  </td>
                  <td className="px-4 py-3"><div className="flex justify-center"><Switch tone="sun" label="Premium" checked={!!u.is_premium} disabled={busy[u.id]} onChange={(v) => patch(u, { is_premium: v ? 1 : 0 })} /></div></td>
                  <td className="px-4 py-3"><div className="flex justify-center"><Switch tone="green" label="Free publish access" checked={!!u.free_access} disabled={busy[u.id]} onChange={(v) => patch(u, { free_access: v ? 1 : 0 })} /></div></td>
                  <td className="px-4 py-3 text-center text-mute">{u.portfolios} <span className="text-xs">({u.published} live)</span></td>
                  <td className="px-4 py-3 text-right">
                    {!isAdmin && <button onClick={() => remove(u)} className="btn-ghost px-2 text-mute hover:text-red-600" aria-label="Delete user"><Trash2 size={15} /></button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
