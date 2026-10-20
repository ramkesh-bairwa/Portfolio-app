'use client';
import { useState } from 'react';
import { CheckCircle2, CreditCard, Loader2 } from 'lucide-react';

export default function RazorpaySettings({ initial }) {
  const [status, setStatus] = useState(initial);
  const [keyId, setKeyId] = useState(initial.keyId);
  const [keySecret, setKeySecret] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function send(method, payload) {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch('/api/admin/razorpay', { method, headers: { 'Content-Type': 'application/json' }, body: payload && JSON.stringify(payload) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Could not save.');
      setStatus(d.razorpay);
      setKeyId(d.razorpay.keyId);
      setKeySecret('');
      setMsg({ ok: true, text: method === 'DELETE' ? 'Keys removed. Plans go back to “ask an admin”.' : 'Keys checked with Razorpay and saved.' });
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card mt-6 max-w-3xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-semibold"><CreditCard size={18} /> Razorpay payments</p>
        {status.enabled ? (
          <span className={`chip ${status.isTest ? 'bg-sun/25 text-ink' : 'bg-green-50 text-green-700'}`}>
            <CheckCircle2 size={12} /> {status.isTest ? 'On — test mode' : 'On — live'}
          </span>
        ) : (
          <span className="chip bg-line text-mute">Off</span>
        )}
      </div>
      <p className="mt-1 text-sm text-mute">
        With keys saved, users pay for a plan on the Plans page and get Premium right away. Use test keys (<code>rzp_test_…</code>) from
        Razorpay Dashboard → Account &amp; Settings → API Keys to try it without real money.
      </p>
      <form onSubmit={(e) => { e.preventDefault(); send('PUT', { keyId, keySecret }); }} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label>
          <span className="label">Key ID</span>
          <input className="input font-mono" value={keyId} onChange={(e) => setKeyId(e.target.value)} placeholder="rzp_test_xxxxxxxxxxxx" autoComplete="off" required />
        </label>
        <label>
          <span className="label">Key Secret {status.hasSecret && <span className="font-normal">(saved {status.secretHint}, leave empty to keep)</span>}</span>
          <input className="input font-mono" type="password" value={keySecret} onChange={(e) => setKeySecret(e.target.value)} placeholder={status.hasSecret ? '••••••••' : 'Key Secret'} autoComplete="new-password" required={!status.hasSecret} />
        </label>
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
          <button disabled={busy} className="btn-primary">{busy && <Loader2 size={15} className="animate-spin" />} Check and save</button>
          {status.enabled && <button type="button" disabled={busy} onClick={() => confirm('Remove the Razorpay keys? Online payments stop.') && send('DELETE')} className="btn-light">Remove keys</button>}
          {msg && <span role={msg.ok ? 'status' : 'alert'} className={`text-sm ${msg.ok ? 'text-green-700' : 'text-red-600'}`}>{msg.text}</span>}
        </div>
      </form>
    </div>
  );
}
