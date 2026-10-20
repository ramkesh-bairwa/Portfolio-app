'use client';
import { useState } from 'react';
import { Loader2, Pencil, Plus, Sparkles, Trash2, X } from 'lucide-react';
import Switch from './Switch';
import { PERIODS, formatPrice } from '@/lib/price';

const EMPTY = { name: '', price: '', currency: 'USD', period: 'year', description: '', features: '', isPopular: false, isActive: true, sortOrder: 0 };

const toForm = (p) => ({ ...p, price: String(p.price), features: p.features.join('\n') });

export default function PlansAdmin({ initial }) {
  const [plans, setPlans] = useState(initial);
  const [form, setForm] = useState(null); // null = closed, {id?} = editing
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const reload = () => fetch('/api/admin/plans').then((r) => r.json()).then((d) => setPlans(d.plans || []));
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  function open(plan) {
    setError('');
    setForm(plan ? toForm(plan) : { ...EMPTY, sortOrder: plans.length + 1 });
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await fetch(form.id ? `/api/admin/plans/${form.id}` : '/api/admin/plans', {
        method: form.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Could not save the plan.');
      setForm(null);
      await reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(plan, isActive) {
    setPlans((list) => list.map((p) => (p.id === plan.id ? { ...p, isActive } : p)));
    await fetch(`/api/admin/plans/${plan.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...plan, isActive }) });
    reload();
  }

  async function remove(plan) {
    if (!confirm(`Delete the ${plan.name} plan? Users already on it keep Premium.`)) return;
    await fetch(`/api/admin/plans/${plan.id}`, { method: 'DELETE' });
    reload();
  }

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Plans</h1>
          <p className="mt-1 text-mute">Paid plans shown on the Plans page. Picking one sends a premium request; approving it gives the user Premium on that plan.</p>
        </div>
        <button onClick={() => open(null)} className="btn-primary"><Plus size={16} /> New plan</button>
      </div>

      {form && (
        <form onSubmit={save} className="card mt-6 grid gap-4 p-5 sm:grid-cols-2">
          <div className="flex items-center justify-between sm:col-span-2">
            <h2 className="font-bold">{form.id ? `Edit ${form.name || 'plan'}` : 'New plan'}</h2>
            <button type="button" onClick={() => setForm(null)} className="btn-ghost p-1.5" aria-label="Close"><X size={16} /></button>
          </div>
          <label className="sm:col-span-2">
            <span className="label">Name</span>
            <input className="input" value={form.name} onChange={set('name')} placeholder="Pro" required maxLength={60} />
          </label>
          <label>
            <span className="label">Price</span>
            <input className="input" type="number" min="0" step="0.01" value={form.price} onChange={set('price')} placeholder="79" required />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="label">Currency</span>
              <input className="input uppercase" value={form.currency} onChange={set('currency')} maxLength={3} required />
            </label>
            <label>
              <span className="label">Billing</span>
              <select className="input" value={form.period} onChange={set('period')}>
                {Object.entries(PERIODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
          </div>
          <label className="sm:col-span-2">
            <span className="label">Short description</span>
            <input className="input" value={form.description} onChange={set('description')} maxLength={255} placeholder="For job seekers who want every advantage." />
          </label>
          <label className="sm:col-span-2">
            <span className="label">Features (one per line)</span>
            <textarea className="input min-h-[120px]" value={form.features} onChange={set('features')} placeholder={'Everything in Basic\nTop-ranking ATS Pro resume designs'} />
          </label>
          <label>
            <span className="label">Order on the page</span>
            <input className="input" type="number" value={form.sortOrder} onChange={set('sortOrder')} />
          </label>
          <div className="flex flex-wrap items-end gap-5 pb-2 text-sm font-semibold">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isPopular} onChange={set('isPopular')} /> Most popular</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Shown on site</label>
          </div>
          {error && <p role="alert" className="text-sm text-red-600 sm:col-span-2">{error}</p>}
          <div className="flex gap-2 sm:col-span-2">
            <button disabled={busy} className="btn-primary">{busy && <Loader2 size={15} className="animate-spin" />} {form.id ? 'Save changes' : 'Create plan'}</button>
            <button type="button" onClick={() => setForm(null)} className="btn-light">Cancel</button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {!plans.length && <p className="card p-6 text-sm text-mute">No plans yet. Create one with “New plan”.</p>}
        {plans.map((p) => (
          <div key={p.id} className={`card flex flex-wrap items-center gap-4 p-4 ${p.isActive ? '' : 'opacity-60'}`}>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                {p.name}
                {p.isPopular && <span className="chip bg-sun/25 text-ink"><Sparkles size={11} /> Most popular</span>}
                {!p.isActive && <span className="chip bg-line text-mute">Hidden</span>}
              </p>
              <p className="text-sm text-mute">
                <span className="font-semibold text-ink">{formatPrice(p.price, p.currency)}</span> {PERIODS[p.period]} · {p.features.length} features
              </p>
            </div>
            <Switch label={p.isActive ? 'Shown on site' : 'Hidden'} checked={p.isActive} onChange={(v) => toggleActive(p, v)} tone="green" />
            <button onClick={() => open(p)} className="btn-light"><Pencil size={14} /> Edit</button>
            <button onClick={() => remove(p)} className="btn-ghost text-red-600" aria-label={`Delete ${p.name}`}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
