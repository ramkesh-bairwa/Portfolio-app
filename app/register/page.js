'use client';
import { useState } from 'react';
import NextLink from 'next/link';
import { ArrowRight, Check, Clock, Smartphone } from 'lucide-react';
import AuthShell from '@/components/AuthShell';
import PasswordInput from '@/components/PasswordInput';

function strength(pw) {
  if (!pw) return 0;
  let s = pw.length >= 8 ? 1 : 0;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return Math.max(1, s);
}
const LEVELS = [
  ['', ''],
  ['Weak', 'bg-coral'],
  ['Okay', 'bg-sun'],
  ['Good', 'bg-mint'],
  ['Strong', 'bg-mint'],
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const level = strength(form.password);
  const matches = form.confirm && form.confirm === form.password;

  async function submit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Something went wrong. Try again.');
      setDone(data.message);
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <AuthShell title="Almost there">
        <div className="flex gap-4 rounded-2xl bg-sun/15 p-5">
          <Clock className="mt-0.5 shrink-0 text-sun" />
          <div>
            <p className="font-semibold">{done}</p>
            <p className="mt-1 text-sm text-mute">In a hurry? Log in with your mobile number instead — it works right away.</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <NextLink href="/login" className="btn-primary px-5 py-2.5">Go to log in</NextLink>
          <NextLink href="/" className="btn-light px-5 py-2.5">Browse templates</NextLink>
        </div>
      </AuthShell>
    );

  return (
    <AuthShell title="Create your account" subtitle="Free to start. Build portfolios, resumes and posters.">
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label" htmlFor="name">Full name</label><input id="name" required className="input py-2.5" placeholder="Your name" value={form.name} onChange={set('name')} autoComplete="name" /></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" required className="input py-2.5" placeholder="you@example.com" value={form.email} onChange={set('email')} autoComplete="email" /></div>
        <div>
          <label className="label" htmlFor="pw">Password</label>
          <PasswordInput id="pw" minLength={8} required placeholder="At least 8 characters" value={form.password} onChange={set('password')} autoComplete="new-password" />
          {form.password && (
            <div className="mt-2 flex items-center gap-2" aria-live="polite">
              <div className="flex flex-1 gap-1">
                {[1, 2, 3, 4].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= level ? LEVELS[level][1] : 'bg-line'}`} />)}
              </div>
              <span className="w-12 text-right text-xs font-semibold text-mute">{form.password.length < 8 ? 'Too short' : LEVELS[level][0]}</span>
            </div>
          )}
        </div>
        <div>
          <label className="label" htmlFor="pw2">Confirm password</label>
          <PasswordInput id="pw2" minLength={8} required value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
          {form.confirm && (
            <p className={`mt-1.5 flex items-center gap-1 text-xs font-semibold ${matches ? 'text-mint' : 'text-coral'}`}>
              {matches ? <><Check size={13} /> Passwords match</> : 'Passwords do not match yet'}
            </p>
          )}
        </div>
        <button disabled={busy} className="btn-primary w-full py-3 text-base">{busy ? 'Creating…' : <>Create account <ArrowRight size={17} /></>}</button>
        <p className="rounded-lg bg-paper px-3 py-2 text-center text-xs text-mute">An admin approves new email accounts before first login.</p>
      </form>
      <NextLink href="/login?tab=mobile" className="btn-light mt-4 w-full py-2.5"><Smartphone size={16} /> Sign up instantly with mobile number</NextLink>
      <p className="mt-6 border-t border-line pt-5 text-center text-sm text-mute">Already have an account? <NextLink href="/login" className="font-semibold text-signal">Log in</NextLink></p>
    </AuthShell>
  );
}
