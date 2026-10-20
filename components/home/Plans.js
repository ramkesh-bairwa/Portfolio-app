'use client';
import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { Check, Clock, Crown, Sparkles } from 'lucide-react';
import { PERIODS, formatPrice, inrHint } from '@/lib/price';

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
const CHECKOUT_JS = 'https://checkout.razorpay.com/v1/checkout.js';
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = CHECKOUT_JS;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Could not load Razorpay. Check your internet connection and try again.'));
    document.body.appendChild(s);
  });
}

// Tailwind needs literal class names
const COLS = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' };

export default function Plans() {
  const [user, setUser] = useState(undefined);
  const [plans, setPlans] = useState(undefined);
  const [payments, setPayments] = useState({ enabled: false, isTest: false });
  const [paidMsg, setPaidMsg] = useState('');
  const [inrRate, setInrRate] = useState(0);
  const [request, setRequest] = useState(null);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/plans').then((r) => r.json()).then((d) => {
      setPlans(d.plans || []);
      if (d.payments) setPayments(d.payments);
      if (d.inrRate) setInrRate(d.inrRate);
    }).catch(() => setPlans([]));
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      setUser(d.user);
      if (d.user) fetch('/api/premium').then((r) => r.json()).then((p) => setRequest(p.request)).catch(() => {});
    }).catch(() => setUser(null));
  }, []);

  // No online payments: ask for the plan (or plain Premium); an admin approves it in Admin → Requests
  async function ask(plan) {
    setBusy(plan ? plan.id : 'premium');
    setError('');
    try {
      const r = await fetch('/api/premium', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(plan ? { planId: plan.id } : {}) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Could not send your request. Try again.');
      setRequest(d.already ? { status: 'approved' } : d.request);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }

  async function pay(plan) {
    setError('');
    if (!payments.enabled) return ask(plan);
    setBusy(plan.id);
    try {
      const r = await fetch('/api/payments/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId: plan.id }) });
      const order = await r.json();
      if (!r.ok) throw new Error(order.error || 'Could not start the payment. Try again.');
      const report = (data) =>
        fetch('/api/payments/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: order.orderId, ...data }) }).then((res) => res.json().then((d) => ({ ok: res.ok, ...d })));
      await loadCheckout();
      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'Folio',
        description: `${order.plan.name} plan`,
        prefill: order.prefill,
        theme: { color: '#111827' },
        handler: async (res) => {
          setBusy(plan.id);
          const d = await report({ paymentId: res.razorpay_payment_id, signature: res.razorpay_signature });
          setBusy(null);
          if (!d.ok) return setError(d.error || 'Could not confirm the payment.');
          if (d.user) setUser(d.user);
          setPaidMsg(`Payment received. You are on ${order.plan.name} now.`);
        },
        modal: { ondismiss: () => setBusy(null) },
      });
      rzp.on('payment.failed', (res) => {
        report({ error: res.error?.description || 'Payment failed', paymentId: res.error?.metadata?.payment_id });
        setError(`Payment failed: ${res.error?.description || 'try again'}.`);
      });
      rzp.open();
    } catch (e) {
      setError(e.message);
      setBusy(null);
    }
  }

  const premium = user && (user.isPremium || user.canPublish);
  const onFree = user && !premium;
  const pending = request?.status === 'pending';

  function cta(plan, dark) {
    const muted = `btn w-full py-3 text-base ${dark ? 'bg-white/10 text-white' : 'bg-ink/5 text-ink'}`;
    const main = `${dark ? 'btn-sun' : 'btn-dark'} w-full py-3 text-base`;
    if (user === undefined) return <span className={`${muted} opacity-60`}>…</span>;
    if (!user) return <NextLink href="/register?next=/plans" className={main}><Crown size={17} /> Sign up and {plan ? `buy ${plan.name}` : 'get Premium'}</NextLink>;
    if (premium) return <span className={muted}><Check size={17} /> {plan && user.planId === plan.id ? 'Your plan' : 'You have Premium'}</span>;
    if (pending && (!plan || request.planId === plan.id)) return <span className={muted}><Clock size={17} /> Request sent — waiting for approval</span>;
    if (plan && !payments.enabled) return <button onClick={() => ask(plan)} disabled={busy !== null} className={main}><Crown size={17} /> {busy === plan.id ? 'Sending…' : pending ? `Switch request to ${plan.name}` : `Request ${plan.name}`}</button>;
    if (plan) return <button onClick={() => pay(plan)} disabled={busy !== null} className={main}><Crown size={17} /> {busy === plan.id ? 'Please wait…' : `Buy ${plan.name}`}</button>;
    return <button onClick={() => ask()} disabled={busy !== null} className={main}><Crown size={17} /> {busy === 'premium' ? 'Sending…' : 'Ask for Premium'}</button>;
  }

  const currency = plans?.[0]?.currency || 'USD';
  // No paid plans set up yet: fall back to the single "Premium on request" card
  const paid = plans?.length ? plans : null;
  const cols = COLS[Math.min((paid?.length || 1) + 1, 4)];

  return (
    <div>
      <div className={`grid gap-6 md:grid-cols-2 ${cols}`}>
        <div className={`relative flex flex-col rounded-3xl border bg-white p-7 ${onFree ? 'border-signal ring-4 ring-signal/10' : 'border-line'}`}>
          {onFree && <span className="chip absolute right-6 top-6 bg-signal-soft text-signal">Your plan</span>}
          <h3 className="text-2xl font-extrabold">Free</h3>
          <p className="mt-1 text-mute">Everything you need to get started.</p>
          <p className="mt-6 font-display text-5xl font-extrabold">{formatPrice(0, currency)}</p>
          <p className="text-sm text-mute">forever</p>
          <ul className="mt-6 flex-1 space-y-3">
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

        {plans === undefined && <div className="grid min-h-[420px] place-items-center rounded-3xl border border-line bg-white text-mute">Loading plans…</div>}

        {plans && !paid && (
          <PlanCard dark name="Premium" tagline="For when it's time to go live." price="On request" note="An admin turns it on for your account" features={PREMIUM} badge={premium ? 'Your plan' : null}>
            {cta(null, true)}
          </PlanCard>
        )}

        {paid?.map((p) => (
          <PlanCard
            key={p.id}
            dark={p.isPopular}
            name={p.name}
            tagline={p.description}
            price={formatPrice(p.price, p.currency)}
            priceInr={inrHint(p.price, p.currency, inrRate)}
            note={PERIODS[p.period]}
            features={p.features}
            badge={premium && user.planId === p.id ? 'Your plan' : p.isPopular ? 'Most popular' : null}
          >
            {cta(p, p.isPopular)}
          </PlanCard>
        ))}
      </div>
      {paidMsg && <p role="status" className="mt-4 text-center font-semibold text-green-700">{paidMsg}</p>}
      {error && <p role="alert" className="mt-4 text-center text-sm text-coral">{error}</p>}
      {pending && <p role="status" className="mt-4 text-center text-sm font-semibold text-ink">Your request has been sent. Premium features unlock as soon as an admin approves it.</p>}
      {plans?.length > 0 && !payments.enabled && !pending && !premium && (
        <p className="mt-4 text-center text-xs text-mute">Pick a plan to send a request. An admin will confirm your payment and turn it on for your account.</p>
      )}
      {payments.enabled && payments.isTest && (
        <p className="mt-4 text-center text-xs text-mute">Test mode: no real money is taken. Pay with a Razorpay test card or the UPI ID success@razorpay.</p>
      )}
    </div>
  );
}

function PlanCard({ dark, name, tagline, price, priceInr, note, features, badge, children }) {
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-3xl p-7 ${dark ? 'bg-ink text-white' : 'border border-line bg-white'}`}>
      {dark && (
        <>
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-signal/50 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-coral/30 blur-3xl" aria-hidden="true" />
        </>
      )}
      <div className="relative flex flex-1 flex-col">
        {badge && <span className={`chip absolute right-0 top-0 ${dark ? 'bg-sun text-ink' : 'bg-sun/25 text-ink'}`}>{badge === 'Most popular' && <Sparkles size={12} />} {badge}</span>}
        <h3 className="flex items-center gap-2 pr-24 text-2xl font-extrabold"><Crown size={22} className={dark ? 'text-sun' : 'text-signal'} /> {name}</h3>
        {tagline && <p className={`mt-1 ${dark ? 'text-white/70' : 'text-mute'}`}>{tagline}</p>}
        <p className="mt-6 font-display text-5xl font-extrabold">
          {price}
          {priceInr && <span className={`ml-2 align-middle text-lg font-bold ${dark ? 'text-white/70' : 'text-mute'}`}>({priceInr})</span>}
        </p>
        <p className={`text-sm ${dark ? 'text-white/60' : 'text-mute'}`}>{note}</p>
        <ul className="mt-6 flex-1 space-y-3">
          {features.map((f) => (
            <li key={f} className="flex gap-3"><Check size={18} className={`mt-0.5 shrink-0 ${dark ? 'text-sun' : 'text-mint'}`} /> {f}</li>
          ))}
        </ul>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
