'use client';
import { Suspense, useState } from 'react';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Mail, MessageCircle, Smartphone } from 'lucide-react';
import AuthShell from '@/components/AuthShell';
import PasswordInput from '@/components/PasswordInput';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next');
  const [tab, setTab] = useState(params.get('tab') === 'mobile' ? 'mobile' : 'email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [phone, setPhone] = useState('+91 ');
  const [optIn, setOptIn] = useState(false);
  const [step, setStep] = useState('phone');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [isNew, setIsNew] = useState(false);

  const done = (user) => {
    const dest = next && next.startsWith('/') ? next : user.role === 'admin' ? '/admin' : '/dashboard';
    router.push(dest);
    router.refresh();
  };

  async function post(url, payload) {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Try again.');
      return data;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function emailLogin(e) {
    e.preventDefault();
    const d = await post('/api/auth/login', { email, password });
    if (d) done(d.user);
  }

  async function sendCode(e) {
    e?.preventDefault();
    if (!optIn) return setError('Turn on WhatsApp updates to receive your login code on WhatsApp.');
    const d = await post('/api/auth/otp/send', { phone, whatsappOptIn: optIn });
    if (!d) return;
    setPhone(d.phone);
    setIsNew(d.isNew);
    setStep('code');
    setInfo(d.devOtp ? `WhatsApp isn't configured yet, so here is your test code: ${d.devOtp}` : `We sent a 6-digit code to ${d.phone} on WhatsApp.`);
  }

  async function verify(e) {
    e.preventDefault();
    const d = await post('/api/auth/otp/verify', { phone, code, name });
    if (d) done(d.user);
  }

  const tabBtn = (key, Icon, label) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === key}
      onClick={() => { setTab(key); setError(''); setInfo(''); }}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${tab === key ? 'bg-white text-ink shadow-sm' : 'text-mute hover:text-ink'}`}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <AuthShell title="Welcome back" subtitle={next ? 'Log in to keep going. Your work is saved on this device.' : 'Log in to pick up where you left off.'}>
      <div className="mb-6 flex rounded-xl bg-paper p-1 ring-1 ring-line" role="tablist">
        {tabBtn('email', Mail, 'Email')}
        {tabBtn('mobile', Smartphone, 'Mobile number')}
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {info && !error && <p className="mb-4 rounded-lg bg-signal-soft px-3 py-2 text-sm text-ink">{info}</p>}

      {tab === 'email' ? (
        <form onSubmit={emailLogin} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required autoComplete="email" placeholder="you@example.com" className="input py-2.5" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <PasswordInput id="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button disabled={busy} className="btn-primary w-full py-3 text-base">{busy ? 'Logging in…' : <>Log in <ArrowRight size={17} /></>}</button>
          <p className="rounded-lg bg-paper px-3 py-2 text-center text-xs text-mute">Email accounts are approved by an admin before first login. Need in now? Use <button type="button" className="font-semibold text-ink underline" onClick={() => { setTab('mobile'); setError(''); }}>mobile number</button>.</p>
        </form>
      ) : step === 'phone' ? (
        <form onSubmit={sendCode} className="space-y-4">
          <div>
            <label className="label" htmlFor="phone">Mobile number</label>
            <input id="phone" type="tel" required autoComplete="tel" className="input py-2.5" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-paper p-3">
            <input type="checkbox" className="mt-1 h-4 w-4 accent-[#25D366]" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} required />
            <span className="text-sm">
              <span className="flex items-center gap-1.5 font-semibold"><MessageCircle size={15} className="text-[#25D366]" /> Get updates on WhatsApp</span>
              <span className="text-mute">Your login code and account updates are sent on WhatsApp. Required for mobile login.</span>
            </span>
          </label>
          <button disabled={busy || !optIn} className="btn w-full bg-[#25D366] py-3 text-base text-white hover:brightness-95">
            {busy ? 'Sending…' : 'Send code on WhatsApp'}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-4">
          <div>
            <label className="label" htmlFor="code">6-digit code</label>
            <input id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required className="input text-center text-2xl tracking-[0.5em]" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
          </div>
          {isNew && (
            <div>
              <label className="label" htmlFor="name">Your name</label>
              <input id="name" className="input py-2.5" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
          )}
          <button disabled={busy || code.length !== 6} className="btn-primary w-full py-3 text-base">{busy ? 'Checking…' : isNew ? 'Create account' : 'Log in'}</button>
          <div className="flex justify-between text-sm">
            <button type="button" className="text-mute hover:text-ink" onClick={() => { setStep('phone'); setCode(''); setInfo(''); }}>Change number</button>
            <button type="button" className="font-semibold text-signal" disabled={busy} onClick={sendCode}>Resend code</button>
          </div>
        </form>
      )}
      <p className="mt-6 border-t border-line pt-5 text-center text-sm text-mute">
        New to Folio? <NextLink href={`/register${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-signal">Create a free account</NextLink>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
