'use client';
import { useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import Switch from './Switch';

export default function SettingsForm({ initial, whatsapp }) {
  const [s, setS] = useState(initial);
  const [saved, setSaved] = useState('');
  async function set(k, v) {
    setS({ ...s, [k]: v ? '1' : '0' });
    const r = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [k]: v }) });
    setSaved(r.ok ? 'Saved' : 'Could not save');
    setTimeout(() => setSaved(''), 2000);
  }
  const Row = ({ k, title, desc }) => (
    <div className="flex items-start justify-between gap-6 border-b border-line p-5 last:border-0">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-mute">{desc}</p>
      </div>
      <Switch label={title} checked={s[k] === '1'} onChange={(v) => set(k, v)} />
    </div>
  );
  return (
    <div className="max-w-3xl">
      <div className="flex items-baseline justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
        <span role="status" className="text-sm text-mute">{saved}</span>
      </div>
      <div className="card mt-6">
        <Row k="download_requires_premium" title="Publishing needs premium" desc="On: only premium users and users with free access can publish. Off: anyone logged in can publish free templates; premium templates still need access." />
        <Row k="allow_guest_uploads" title="Guests can upload images" desc="Let people upload photos in the builder before they log in." />
      </div>
      <div className="card mt-6 flex gap-4 p-5">
        {whatsapp ? <CheckCircle2 className="shrink-0 text-green-600" /> : <AlertTriangle className="shrink-0 text-sun" />}
        <div>
          <p className="font-semibold">WhatsApp login codes {whatsapp ? 'are connected' : 'are in test mode'}</p>
          <p className="mt-1 text-sm text-mute">
            {whatsapp
              ? 'Codes are sent through the WhatsApp Cloud API using your approved authentication template.'
              : 'Add WHATSAPP_TOKEN and WHATSAPP_PHONE_ID to .env.local. Until then, codes are printed in the server log and shown on the login screen during development.'}
          </p>
        </div>
      </div>
    </div>
  );
}
