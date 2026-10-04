'use client';
import { useEffect, useState } from 'react';
import { Check, Crown, Loader2, X } from 'lucide-react';

export default function RequestsList() {
  const [rows, setRows] = useState(null);
  const load = () => fetch('/api/admin/requests').then((r) => r.json()).then((d) => setRows(d.requests || []));
  useEffect(() => { load(); }, []);

  async function act(id, action) {
    setRows((list) => list.map((r) => (r.id === id ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r)));
    await fetch(`/api/admin/requests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
    load();
  }

  const pending = rows?.filter((r) => r.status === 'pending') || [];
  const done = rows?.filter((r) => r.status !== 'pending') || [];

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Premium requests</h1>
      <p className="mt-1 text-mute">Approving a request turns on Premium for that user, so they can publish any template.</p>
      {rows === null ? <Loader2 className="mt-10 animate-spin text-signal" /> : (
        <>
          <h2 className="mb-3 mt-8 font-bold">Waiting ({pending.length})</h2>
          {!pending.length && <p className="card p-6 text-sm text-mute">Nothing to review right now.</p>}
          <div className="space-y-3">
            {pending.map((r) => (
              <div key={r.id} className="card flex flex-wrap items-center gap-4 border-sun/60 p-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-sun/25"><Crown size={18} /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{r.name || 'No name'} <span className="font-normal text-mute">· {r.email || r.phone}</span></p>
                  {r.message && <p className="mt-1 text-sm">“{r.message}”</p>}
                  <p className="text-xs text-mute">Asked {new Date(r.created_at.replace(' ', 'T')).toLocaleString()}</p>
                </div>
                <button onClick={() => act(r.id, 'approve')} className="btn bg-green-600 text-white hover:bg-green-700"><Check size={15} /> Approve</button>
                <button onClick={() => act(r.id, 'reject')} className="btn-light"><X size={15} /> Reject</button>
              </div>
            ))}
          </div>
          {!!done.length && (
            <>
              <h2 className="mb-3 mt-10 font-bold">Reviewed</h2>
              <div className="card divide-y divide-line">
                {done.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span className="truncate">{r.name || r.email || r.phone}</span>
                    <span className={`chip ${r.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
