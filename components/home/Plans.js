'use client';
import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { Check, Clock, Crown, Sparkles } from 'lucide-react';

const FREE = [
  'Build portfolios, resumes and posters',
  'All free templates',
  'Live ATS score while you write',
  'Preview on desktop, tablet and phone',
  'Save your work to your dashboard',
];
const PREMIUM = [
  'Everything in Free',
  'Premium portfolio and resume templates',
  'Publish your portfolio to a live link',
  'Download resume PDFs and posters',
  'Top-ranking ATS Pro resume designs',
];

export default function Plans() {
  const [user, setUser] = useState(undefined);
  const [request, setRequest] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      setUser(d.user);
      if (d.user) fetch('/api/premium').then((r) => r.json()).then((p) => setRequest(p.request)).catch(() => {});
    }).catch(() => setUser(null));
  }, []);

  async function ask() {
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/premium', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Could not send your request. Try again.');
      setRequest(d.already ? { status: 'approved' } : d.request);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const premium = user && (user.isPremium || user.canPublish);
  const onFree = user && !premium;

  let cta;
  if (user === undefined) cta = <span className="btn w-full bg-white/10 py-3 text-white/60">…</span>;
  else if (!user) cta = <NextLink href="/register?next=/%23plans" className="btn-sun w-full py-3 text-base"><Crown size={17} /> Sign up and get Premium</NextLink>;
  else if (premium) cta = <span className="btn w-full bg-white/10 py-3 text-base text-white"><Check size={17} /> You have Premium</span>;
  else if (request?.status === 'pending') cta = <span className="btn w-full bg-white/10 py-3 text-base text-white"><Clock size={17} /> Request sent — waiting for approval</span>;
  else cta = <button onClick={ask} disabled={busy} className="btn-sun w-full py-3 text-base"><Crown size={17} /> {busy ? 'Sending…' : 'Ask for Premium'}</button>;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={`relative rounded-3xl border bg-white p-8 ${onFree ? 'border-signal ring-4 ring-signal/10' : 'border-line'}`}>
        {onFree && <span className="chip absolute right-6 top-6 bg-signal-soft text-signal">Your plan</span>}
        <h3 className="text-2xl font-extrabold">Free</h3>
        <p className="mt-1 text-mute">Everything you need to get started.</p>
        <p className="mt-6 font-display text-5xl font-extrabold">₹0</p>
        <p className="text-sm text-mute">forever</p>
        <ul className="mt-6 space-y-3">
          {FREE.map((f) => (
            <li key={f} className="flex gap-3"><Check size={18} className="mt-0.5 shrink-0 text-mint" /> {f}</li>
          ))}
        </ul>
        <div className="mt-8">
          {user ? (
            <NextLink href="/dashboard" className="btn-light w-full py-3 text-base">Go to dashboard</NextLink>
          ) : (
            <NextLink href="/register" className="btn-light w-full py-3 text-base">Start free</NextLink>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-ink p-8 text-white">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-signal/50 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-coral/30 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <span className="chip absolute right-0 top-0 bg-sun text-ink">{premium ? 'Your plan' : <><Sparkles size={12} /> Most loved</>}</span>
          <h3 className="flex items-center gap-2 text-2xl font-extrabold"><Crown size={22} className="text-sun" /> Premium</h3>
          <p className="mt-1 text-white/70">For when it's time to go live.</p>
          <p className="mt-6 font-display text-5xl font-extrabold">On request</p>
          <p className="text-sm text-white/60">An admin turns it on for your account</p>
          <ul className="mt-6 space-y-3">
            {PREMIUM.map((f) => (
              <li key={f} className="flex gap-3"><Check size={18} className="mt-0.5 shrink-0 text-sun" /> {f}</li>
            ))}
          </ul>
          <div className="mt-8">{cta}</div>
          {error && <p role="alert" className="mt-3 text-sm text-coral">{error}</p>}
        </div>
      </div>
    </div>
  );
}
