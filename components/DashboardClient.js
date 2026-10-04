'use client';
import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Clock, Crown, ExternalLink, Eye, Globe, PenLine, Plus, Trash2 } from 'lucide-react';
import PreviewModal from './PreviewModal';
import TemplateThumb from './TemplateThumb';
import { renderDocument } from '@/lib/render';
import ResumeView, { ResumeAssets } from './resume/ResumeView';
import { getDesign } from '@/lib/resume/designs';
import Stage from './poster/Stage';

const ago = (s) => {
  const d = (Date.now() - new Date(String(s).replace(' ', 'T')).getTime()) / 1000;
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d / 60)} min ago`;
  if (d < 86400) return `${Math.floor(d / 3600)} h ago`;
  return `${Math.floor(d / 86400)} days ago`;
};

export default function DashboardClient({ user, portfolios: initial, resumes: initialResumes = [], posters: initialPosters = [], request, publishNeedsPremium, templates }) {
  const router = useRouter();
  const [portfolios, setPortfolios] = useState(initial);
  const [resumes, setResumes] = useState(initialResumes);
  const [posters, setPosters] = useState(initialPosters);
  const [mounted, setMounted] = useState(false);
  const [preview, setPreview] = useState(null);
  const [req, setReq] = useState(request);
  useEffect(() => setMounted(true), []);
  const tpl = (slug) => templates.find((t) => t.slug === slug);

  async function remove(id) {
    if (!confirm('Delete this portfolio? This cannot be undone.')) return;
    const r = await fetch(`/api/portfolios/${id}`, { method: 'DELETE' });
    if (r.ok) setPortfolios(portfolios.filter((p) => p.id !== id));
  }
  async function removeResume(id) {
    if (!confirm('Delete this resume? This cannot be undone.')) return;
    const r = await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
    if (r.ok) setResumes(resumes.filter((x) => x.id !== id));
  }
  async function removePoster(id) {
    if (!confirm('Delete this design? This cannot be undone.')) return;
    const r = await fetch(`/api/posters/${id}`, { method: 'DELETE' });
    if (r.ok) setPosters(posters.filter((x) => x.id !== id));
  }
  async function askPremium() {
    const r = await fetch('/api/premium', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    if (r.ok) setReq({ status: 'pending' });
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Hi{user.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
          <p className="mt-1 text-mute">{user.email || user.phone}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <NextLink href="/portfolios" className="btn-primary"><Plus size={16} /> New portfolio</NextLink>
          <NextLink href="/resume" className="btn-light"><Plus size={16} /> New resume</NextLink>
          <NextLink href="/posters" className="btn-light"><Plus size={16} /> New poster</NextLink>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white p-5">
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${user.canPublish ? 'bg-sun/25' : 'bg-paper'}`}><Crown size={20} /></span>
        <div className="min-w-0 flex-1">
          {user.canPublish ? (
            <>
              <p className="font-semibold">{user.isPremium ? 'Premium account' : 'Free publish access'}</p>
              <p className="text-sm text-mute">You can publish any template.</p>
            </>
          ) : (
            <>
              <p className="font-semibold">Free account</p>
              <p className="text-sm text-mute">
                {publishNeedsPremium ? 'Build and preview anything. Publishing needs premium access.' : 'Free templates publish freely. Premium templates need premium access.'}
              </p>
            </>
          )}
        </div>
        {!user.canPublish && (req?.status === 'pending' ? (
          <span className="chip bg-paper py-1.5 text-mute"><Clock size={13} /> Request waiting for admin</span>
        ) : (
          <button onClick={askPremium} className="btn-sun"><Crown size={15} /> Ask for premium</button>
        ))}
        {req?.status === 'approved' && user.canPublish && <span className="chip bg-green-50 text-green-700"><Check size={12} /> Approved</span>}
      </div>

      <h2 className="mb-5 mt-12 text-2xl font-bold">My portfolios</h2>
      {!portfolios.length ? (
        <div className="rounded-2xl border-2 border-dashed border-line p-12 text-center">
          <p className="text-lg font-semibold">No portfolios yet</p>
          <p className="mt-1 text-mute">Pick a template to start your first one.</p>
          <NextLink href="/portfolios" className="btn-primary mt-5">Browse templates</NextLink>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {portfolios.map((p) => {
            const t = tpl(p.template_slug);
            return (
              <article key={p.id} className="overflow-hidden rounded-xl border border-line bg-white">
                <button className="block w-full" onClick={() => router.push(`/builder/${p.id}`)} aria-label={`Edit ${p.name}`}>
                  <TemplateThumb html={mounted ? renderDocument({ ...p.data, theme: { ...p.data.theme, animation: false } }) : ''} />
                </button>
                <div className="flex items-center gap-2 border-t border-line p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{p.name}</p>
                    <p className="text-xs text-mute">{t?.name || p.template_slug} · edited {ago(p.updated_at)} {t?.premium && <span className="ml-1 font-semibold text-ink">· Premium</span>}</p>
                    {p.published_at ? (
                      <a href={`/${p.slug}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:underline"><Globe size={12} /> Live at /{p.slug} <ExternalLink size={11} /></a>
                    ) : (
                      <p className="mt-1 text-xs text-mute">Not published</p>
                    )}
                  </div>
                  <button onClick={() => setPreview(p)} className="btn-ghost px-2" aria-label="Preview"><Eye size={16} /></button>
                  <NextLink href={`/builder/${p.id}`} className="btn-ghost px-2" aria-label="Edit"><PenLine size={16} /></NextLink>
                  <button onClick={() => remove(p.id)} className="btn-ghost px-2 hover:text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <h2 className="mb-5 mt-14 text-2xl font-bold">My resumes</h2>
      {!resumes.length ? (
        <div className="rounded-2xl border-2 border-dashed border-line p-12 text-center">
          <p className="text-lg font-semibold">No resumes yet</p>
          <p className="mt-1 text-mute">Pick from 1,650 resume templates with a live ATS score.</p>
          <NextLink href="/resume" className="btn-primary mt-5">Browse resume templates</NextLink>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          <ResumeAssets />
          {resumes.map((r) => {
            const d = getDesign(r.data?.design);
            return (
              <article key={r.id} className="overflow-hidden rounded-xl border border-line bg-white">
                <button className="block w-full bg-white" onClick={() => router.push(`/resume/${r.id}`)} aria-label={`Edit ${r.name}`}>
                  {mounted && <ResumeView doc={r.data} />}
                </button>
                <div className="flex items-center gap-1 border-t border-line p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{r.name}</p>
                    <p className="text-xs text-mute">{d.name}{d.premium ? ' · Premium' : ''} · edited {ago(r.updated_at)}</p>
                  </div>
                  <NextLink href={`/resume/${r.id}`} className="btn-ghost px-2" aria-label="Edit"><PenLine size={16} /></NextLink>
                  <button onClick={() => removeResume(r.id)} className="btn-ghost px-2 hover:text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <h2 className="mb-5 mt-14 text-2xl font-bold">My posters & designs</h2>
      {!posters.length ? (
        <div className="rounded-2xl border-2 border-dashed border-line p-12 text-center">
          <p className="text-lg font-semibold">No designs yet</p>
          <p className="mt-1 text-mute">Posters, pamphlets, social posts and ads. Download as PNG, JPG or PDF.</p>
          <NextLink href="/posters" className="btn-primary mt-5">Browse poster designs</NextLink>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
          {posters.map((p) => {
            const d = p.data;
            const scale = d.w && d.h ? Math.min(220 / d.w, 260 / d.h) : 0;
            return (
              <article key={p.id} className="overflow-hidden rounded-xl border border-line bg-white">
                <button className="grid h-[280px] w-full place-items-center bg-[#E7EBF2]" onClick={() => router.push(`/posters/${p.id}`)} aria-label={`Edit ${p.name}`}>
                  {mounted && scale > 0 && <div className="overflow-hidden rounded-[3px] shadow-md"><Stage doc={d} scale={scale} /></div>}
                </button>
                <div className="flex items-center gap-1 border-t border-line p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{p.name}</p>
                    <p className="text-xs text-mute">{d.w}×{d.h} · edited {ago(p.updated_at)}</p>
                  </div>
                  <NextLink href={`/posters/${p.id}`} className="btn-ghost px-2" aria-label="Edit"><PenLine size={16} /></NextLink>
                  <button onClick={() => removePoster(p.id)} className="btn-ghost px-2 hover:text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {preview && (
        <PreviewModal html={renderDocument(preview.data)} title={preview.name} onClose={() => setPreview(null)}>
          <NextLink href={`/builder/${preview.id}`} className="btn-primary"><PenLine size={16} /> Edit</NextLink>
        </PreviewModal>
      )}
    </main>
  );
}
