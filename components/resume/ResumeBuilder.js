'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowDown, ArrowUp, BadgeCheck, Check, ClipboardCopy, CloudOff, Copy, Crown, Download, GripVertical, LayoutList, Loader2, Palette, Plus, Redo2, Trash2, Trophy, Undo2, X,
} from 'lucide-react';
import { BlockIcon } from '../icons';
import { ChoiceInput, ColorInput, FieldsForm, Toggle } from '../builder/fields';
import { FontPicker } from '../builder/FontPicker';
import { atsCheck } from '@/lib/resume/ats';
import { RESUME_DESIGNS, RESUME_PALETTES, getDesign } from '@/lib/resume/designs';
import { fullResumeTheme } from '@/lib/resume/render';
import { SECTIONS, SECTION_GROUPS, makeSection, rid } from '@/lib/resume/sections';
import { resumeFromTemplate } from '@/lib/resume/templates';
import ResumeView, { ResumeAssets } from './ResumeView';

const DRAFT_KEY = 'folio_resume_draft_v1';

function normalize(d) {
  return { name: d.name || 'My resume', template: d.template || '', design: d.design || 'classic-ats', theme: fullResumeTheme(d.theme), sections: Array.isArray(d.sections) ? d.sections : [] };
}

const LAYOUTS = [['single', 'One column'], ['labels', 'Labels left'], ['sidebar-left', 'Sidebar left'], ['sidebar-right', 'Sidebar right'], ['band-side', 'Banner + sidebar'], ['equal', 'Two equal columns'], ['band', 'Colour band'], ['split', 'Split header'], ['timeline', 'Timeline']];
const HEADINGS = [['underline', 'Underline'], ['bar', 'Side bar'], ['caps', 'Spaced caps'], ['boxed', 'Tinted box'], ['dotted', 'Dotted'], ['accent-left', 'Left line'], ['plain', 'Plain'], ['pill', 'Pill'], ['center-line', 'Centre lines'], ['filled', 'Filled']];
const BULLETS = [['disc', '• Dot'], ['dash', '– Dash'], ['arrow', '▸ Arrow'], ['square', '■ Square'], ['check', '✓ Tick'], ['none', 'None']];
const SKILLS = [['tags', 'Tags'], ['outline', 'Outline tags'], ['bars', 'Bars'], ['dots', 'Dots'], ['matrix', 'Matrix'], ['text', 'Text'], ['columns', 'Columns']];

function Group({ title, children }) {
  return (
    <section className="border-b border-line px-4 py-4">
      <h3 className="mb-3 text-sm font-bold">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
function Range({ label, value, min, max, step = 1, unit = '', onChange }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold text-mute"><span>{label}</span><span>{value}{unit}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#2F5BFF]" aria-label={label} />
    </div>
  );
}

function DesignCard({ design, doc, active, onPick }) {
  const preview = useMemo(() => ({ ...doc, design: design.slug, theme: { ...design.theme, paper: doc.theme.paper } }), [doc, design]);
  return (
    <button type="button" onClick={() => onPick(design)} className={`overflow-hidden rounded-lg border text-left ${active ? 'border-signal ring-2 ring-signal' : 'border-line hover:border-ink/50'}`}>
      <div className="relative bg-white">
        <ResumeView doc={preview} />
        <div className="absolute left-1 top-1 flex flex-col gap-0.5">
          {design.tier === 'top' && <span className="rounded bg-ink px-1 text-[9px] font-bold text-sun">TOP</span>}
          {design.premium && <span className="rounded bg-sun px-1 text-[9px] font-bold text-ink">PRO</span>}
          {design.ats && <span className="rounded bg-emerald-600 px-1 text-[9px] font-bold text-white">ATS</span>}
        </div>
      </div>
      <span className="block truncate border-t border-line bg-white px-2 py-1.5 text-[11px] font-semibold">{design.name}</span>
    </button>
  );
}

function AtsPanel({ doc, onClose, onAtsDesigns }) {
  const r = atsCheck(doc);
  const color = r.score >= 85 ? '#16A34A' : r.score >= 65 ? '#D97706' : '#DC2626';
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" role="dialog" aria-modal="true" aria-label="ATS check" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="thin-scroll max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">ATS score</h2>
            <p className="text-sm text-mute">How well applicant tracking systems and recruiters can read this resume.</p>
          </div>
          <button onClick={onClose} className="btn-ghost px-2" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="my-5 flex items-center gap-5">
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${color} ${r.score}%, #E5E7EB 0)` }}>
            <span className="grid h-[76px] w-[76px] place-items-center rounded-full bg-white text-2xl font-extrabold" style={{ color }}>{r.score}</span>
          </div>
          <p className="text-sm">{r.score >= 85 ? 'Excellent — this resume should parse cleanly and read well.' : r.score >= 65 ? 'Good, with a few quick wins below.' : 'Needs work — fix the items below to get past ATS filters.'}{!r.atsDesign && <><br /><button className="mt-2 font-semibold text-signal underline" onClick={onAtsDesigns}>See ATS-friendly designs</button></>}</p>
        </div>
        <ul className="space-y-2">
          {r.checks.map((c) => (
            <li key={c.label} className={`rounded-lg border p-3 text-sm ${c.ok ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
              <p className="flex items-center gap-2 font-semibold">{c.ok ? <Check size={15} className="text-emerald-600" /> : <span className="text-amber-600">!</span>} {c.label}</p>
              {!c.ok && <p className="mt-1 pl-6 text-mute">{c.tip}</p>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function UpgradeModal({ design, onClose }) {
  const [state, setState] = useState('idle');
  useEffect(() => {
    fetch('/api/premium').then((r) => r.json()).then((d) => d.request?.status === 'pending' && setState('sent')).catch(() => {});
  }, []);
  async function ask() {
    setState('busy');
    const r = await fetch('/api/premium', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: `Resume design: ${design.name}` }) });
    setState(r.ok ? 'sent' : 'idle');
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-sun/25"><Crown size={22} /></span>
          <button onClick={onClose} className="btn-ghost px-2" aria-label="Close"><X size={18} /></button>
        </div>
        <h2 className="text-2xl font-bold">“{design.name}” is a premium design</h2>
        <p className="mt-2 text-mute">Premium resume designs are built to rank high with applicant tracking systems. Ask for premium access, or switch to one of the free designs to download now.</p>
        {state === 'sent' ? (
          <p className="mt-5 flex items-center gap-2 rounded-lg bg-signal-soft p-3 text-sm font-semibold"><Check size={16} className="text-signal" /> Request sent. You can download once an admin approves it.</p>
        ) : (
          <button onClick={ask} disabled={state === 'busy'} className="btn-sun mt-5 w-full py-2.5"><Crown size={16} /> Ask for premium access</button>
        )}
      </div>
    </div>
  );
}

// Plain-text version for job portals that ask you to paste your resume
function plainText(doc) {
  const out = [];
  doc.sections.forEach((s) => {
    const p = s.props || {};
    if (s.type === 'header') { out.push(p.name, p.title, [p.email, p.phone, p.location, p.linkedin, p.website, p.github].filter(Boolean).join(' | '), ''); return; }
    out.push((p.title || SECTIONS[s.type]?.label || '').toUpperCase());
    if (p.text) out.push(p.text);
    (p.items || []).forEach((it) => {
      const head = [it.role || it.degree || it.name || it.title || it.label, it.company || it.school || it.issuer || it.provider || it.org || it.by || it.publisher || it.value, it.period || it.date].filter(Boolean).join(' — ');
      if (head) out.push(head);
      String(it.bullets || it.desc || it.details || '').split('\n').filter(Boolean).forEach((b) => out.push('• ' + b.trim()));
    });
    if (p.bullets) String(p.bullets).split('\n').filter(Boolean).forEach((b) => out.push('• ' + b.trim()));
    out.push('');
  });
  return out.join('\n');
}

export default function ResumeBuilder({ id, templateSlug, resume }) {
  const router = useRouter();
  const [doc, setDoc] = useState(null);
  const [resumeId, setResumeId] = useState(id !== 'new' ? Number(id) : null);
  const [me, setMe] = useState(undefined);
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState('sections');
  const [status, setStatus] = useState('saved');
  const [ats, setAts] = useState(false);
  const [upgrade, setUpgrade] = useState(null);
  const [toast, setToast] = useState('');
  const [loadError, setLoadError] = useState('');
  const [atsOnly, setAtsOnly] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [mobile, setMobile] = useState(null);

  const docRef = useRef(null);
  const past = useRef([]);
  const future = useRef([]);
  const lastMerge = useRef({ key: null, t: 0 });
  const loaded = useRef(false);
  const dirty = useRef(false);
  const creating = useRef(null);
  docRef.current = doc;
  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 3500); };

  const started = useRef(false);
  useEffect(() => {
    // Load once: the first save rewrites the URL (dropping ?template=), which must not reload the page
    if (started.current) return;
    started.current = true;
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setMe(d.user)).catch(() => setMe(null));
    (async () => {
      if (id !== 'new') {
        const r = await fetch(`/api/resumes/${id}`);
        const d = await r.json();
        if (!r.ok) return setLoadError(d.error || 'Could not open this resume.');
        setDoc(normalize(d.resume));
      } else {
        let draft = null;
        if (resume) try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch { /* no draft */ }
        setDoc(normalize(draft || resumeFromTemplate(templateSlug)));
        setStatus('local');
      }
      loaded.current = true;
    })();
  }, [id, templateSlug, resume]);

  const commit = useCallback((next, mergeKey) => {
    const now = Date.now();
    const m = lastMerge.current;
    if (!(mergeKey && m.key === mergeKey && now - m.t < 1000)) {
      past.current.push(docRef.current);
      if (past.current.length > 100) past.current.shift();
    }
    lastMerge.current = { key: mergeKey || null, t: now };
    future.current = [];
    dirty.current = true;
    setDoc(next);
  }, []);
  const undo = () => { if (!past.current.length) return; future.current.push(docRef.current); setDoc(past.current.pop()); lastMerge.current = { key: null, t: 0 }; };
  const redo = () => { if (!future.current.length) return; past.current.push(docRef.current); setDoc(future.current.pop()); };

  const setSections = (sections, mk) => commit({ ...docRef.current, sections }, mk);
  const setTheme = (k) => (v) => commit({ ...docRef.current, theme: { ...docRef.current.theme, [k]: v } }, 'theme.' + k);
  const updateSection = (part, k, v, mk) => setSections(docRef.current.sections.map((s) => (s.id === selectedId ? { ...s, [part]: { ...(s[part] || {}), [k]: v } } : s)), `${selectedId}.${part}.${mk}`);
  const addSection = (type) => {
    const secs = docRef.current.sections;
    if (SECTIONS[type].single && secs.some((s) => s.type === type)) return;
    const s = makeSection(type);
    const si = secs.findIndex((x) => x.id === selectedId);
    const idx = si >= 0 ? si + 1 : secs.length;
    setSections([...secs.slice(0, idx), s, ...secs.slice(idx)]);
    setSelectedId(s.id);
    setMobile(null);
  };
  const act = (a, sid) => {
    const secs = [...docRef.current.sections];
    const i = secs.findIndex((s) => s.id === sid);
    if (i < 0) return;
    if (a === 'delete') { setSections(secs.filter((s) => s.id !== sid)); if (selectedId === sid) setSelectedId(null); }
    if (a === 'up' && i > 0) { [secs[i - 1], secs[i]] = [secs[i], secs[i - 1]]; setSections(secs); }
    if (a === 'down' && i < secs.length - 1) { [secs[i + 1], secs[i]] = [secs[i], secs[i + 1]]; setSections(secs); }
    if (a === 'duplicate') { const c = { ...JSON.parse(JSON.stringify(secs[i])), id: rid() }; secs.splice(i + 1, 0, c); setSections(secs); setSelectedId(c.id); }
  };
  const moveTo = (sid, to) => {
    const secs = [...docRef.current.sections];
    const from = secs.findIndex((s) => s.id === sid);
    if (from < 0 || from === to) return;
    const [s] = secs.splice(from, 1);
    secs.splice(to > from ? to - 1 : to, 0, s);
    setSections(secs);
  };
  const pickDesign = (d) => commit({ ...docRef.current, design: d.slug, theme: { ...d.theme, paper: docRef.current.theme.paper } });

  // ---------- saving ----------
  const createOnServer = useCallback(async () => {
    if (creating.current) return creating.current;
    creating.current = (async () => {
      const d = docRef.current;
      const r = await fetch('/api/resumes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ template: d.template, name: d.name, data: d }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setResumeId(j.id);
      localStorage.removeItem(DRAFT_KEY);
      window.history.replaceState(null, '', `/resume/${j.id}`);
      return j.id;
    })();
    try { return await creating.current; } finally { creating.current = null; }
  }, []);
  const save = useCallback(async (manual = false) => {
    const d = docRef.current;
    if (!d) return null;
    try {
      if (!resumeId) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
        if (!me) { setStatus('local'); if (manual) flash('Saved on this device. Log in to keep it in your account.'); return null; }
        if (!manual && !dirty.current) { setStatus('new'); return null; }
        setStatus('saving');
        const nid = await createOnServer();
        setStatus('saved');
        return nid;
      }
      setStatus('saving');
      const r = await fetch(`/api/resumes/${resumeId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: d.name, data: d }) });
      if (!r.ok) throw new Error((await r.json()).error);
      setStatus('saved');
      return resumeId;
    } catch (e) {
      setStatus('error');
      if (manual) flash(e.message || 'Could not save. Check your connection.');
      return null;
    }
  }, [resumeId, me, createOnServer]);
  useEffect(() => {
    if (!loaded.current || !doc || me === undefined) return;
    if (resumeId && !dirty.current) return;
    setStatus((s) => (s === 'saving' ? s : resumeId || me ? 'unsaved' : 'local'));
    const t = setTimeout(() => save(false), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, me]);

  useEffect(() => {
    const onKey = (e) => {
      const typing = e.target.closest('input,textarea,select,[contenteditable]');
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'z' && !typing) { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); save(true); }
      else if (e.key === 'Escape' && !ats) setSelectedId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  async function download() {
    if (!me) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(docRef.current));
      router.push(`/login?next=${encodeURIComponent('/resume/new?resume=1')}`);
      return;
    }
    const design = getDesign(docRef.current.design);
    if (design.premium && !me.canPublish) { setUpgrade(design); return; }
    const pid = await save(true);
    if (!pid) return;
    window.open(`/api/resumes/${pid}/print`, '_blank');
    flash('Your resume opened in a new tab. Choose “Save as PDF” in the print dialog.');
  }
  async function copyText() {
    try { await navigator.clipboard.writeText(plainText(docRef.current)); flash('Plain-text resume copied — paste it into job portals.'); } catch { flash('Could not copy. Your browser blocked clipboard access.'); }
  }

  const score = useMemo(() => (doc ? atsCheck(doc).score : 0), [doc]);
  if (loadError) return <div className="grid min-h-screen place-items-center p-6 text-center"><div><p className="text-lg font-semibold">{loadError}</p><NextLink href="/dashboard" className="btn-primary mt-4">Back to dashboard</NextLink></div></div>;
  if (!doc) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin text-signal" /></div>;

  const t = doc.theme;
  const selected = doc.sections.find((s) => s.id === selectedId);
  const design = getDesign(doc.design);
  const twoCol = ['sidebar-left', 'sidebar-right', 'split', 'equal', 'band-side'].includes(t.layout);
  const statusUi = { saved: [<Check key="i" size={14} />, 'Saved'], saving: [<Loader2 key="i" size={14} className="animate-spin" />, 'Saving…'], unsaved: [<Loader2 key="i" size={14} className="animate-spin" />, 'Saving…'], local: [<CloudOff key="i" size={14} />, 'Saved on this device'], new: [<CloudOff key="i" size={14} />, 'Not saved yet'], error: [<CloudOff key="i" size={14} className="text-red-600" />, 'Not saved'] }[status];
  const designs = RESUME_DESIGNS.filter((d) => !atsOnly || d.ats);

  const left = (
    <>
      <div className="grid grid-cols-2 border-b border-line bg-white" role="tablist">
        {[['sections', LayoutList, 'Sections'], ['design', Palette, 'Design']].map(([k, Icon, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`flex items-center justify-center gap-2 py-3 text-xs font-semibold ${tab === k ? 'border-b-2 border-signal text-ink' : 'text-mute hover:text-ink'}`}><Icon size={16} /> {l}</button>
        ))}
      </div>
      <div className="thin-scroll flex-1 overflow-y-auto">
        {tab === 'sections' && (
          <div className="p-3">
            <p className="mb-2 px-1 text-xs text-mute">Drag to reorder. Click to edit.</p>
            <ol className="space-y-1">
              {doc.sections.map((s, i) => (
                <li
                  key={s.id}
                  draggable
                  onDragStart={() => setDragId(s.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); if (dragId) moveTo(dragId, i > doc.sections.findIndex((x) => x.id === dragId) ? i + 1 : i); setDragId(null); }}
                  className={`group flex items-center gap-1.5 rounded-lg border px-2 py-2 text-sm ${selectedId === s.id ? 'border-signal bg-signal-soft' : 'border-transparent bg-white hover:border-line'}`}
                >
                  <GripVertical size={13} className="shrink-0 cursor-grab text-mute" />
                  <button className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => { setSelectedId(s.id); setMobile(null); }}>
                    <BlockIcon name={SECTIONS[s.type]?.icon} size={14} className="shrink-0 text-signal" />
                    <span className="truncate font-medium">{s.props?.title || SECTIONS[s.type]?.label}</span>
                    {twoCol && s.type !== 'header' && <span className="ml-auto shrink-0 rounded bg-paper px-1 text-[10px] text-mute">{(s.style?.area || (['skills', 'languages', 'certifications', 'interests', 'personal', 'strengths', 'courses', 'references'].includes(s.type) ? 'side' : 'main')) === 'side' ? 'Side' : 'Main'}</span>}
                  </button>
                  <span className="flex opacity-0 group-hover:opacity-100">
                    <button className="rounded p-0.5 text-mute hover:text-ink" onClick={() => act('up', s.id)} aria-label="Move up"><ArrowUp size={13} /></button>
                    <button className="rounded p-0.5 text-mute hover:text-ink" onClick={() => act('down', s.id)} aria-label="Move down"><ArrowDown size={13} /></button>
                    {s.type !== 'header' && <button className="rounded p-0.5 text-mute hover:text-red-600" onClick={() => act('delete', s.id)} aria-label="Delete section"><Trash2 size={13} /></button>}
                  </span>
                </li>
              ))}
            </ol>
            <h3 className="mb-2 mt-5 px-1 text-xs font-bold text-mute">ADD A SECTION</h3>
            {SECTION_GROUPS.map((g) => (
              <div key={g} className="mb-3">
                <p className="mb-1.5 px-1 text-[11px] font-semibold text-mute">{g}</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(SECTIONS).filter(([, d]) => d.group === g).map(([type, d]) => {
                    const used = d.single && doc.sections.some((s) => s.type === type);
                    return (
                      <button key={type} disabled={used} onClick={() => addSection(type)} className="flex items-center gap-2 rounded-lg border border-line bg-white px-2 py-2 text-left text-xs font-semibold hover:border-signal hover:bg-signal-soft disabled:opacity-40">
                        <BlockIcon name={d.icon} size={14} className="shrink-0 text-signal" /> {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'design' && (
          <div>
            <Group title={`Designs (${designs.length})`}>
              <Toggle label="Show ATS-friendly designs only" checked={atsOnly} onChange={setAtsOnly} />
              <p className="flex items-center gap-1.5 text-xs font-bold text-amber-700"><Trophy size={13} /> TOP RANKING · {designs.filter((d) => d.tier === 'top').length} premium designs</p>
              <div className="grid grid-cols-2 gap-2">
                {designs.filter((d) => d.tier === 'top').map((d) => <DesignCard key={d.slug} design={d} doc={doc} active={doc.design === d.slug} onPick={pickDesign} />)}
              </div>
              <p className="pt-2 text-xs font-bold text-mute">MORE DESIGNS</p>
              <div className="grid grid-cols-2 gap-2">
                {designs.filter((d) => d.tier !== 'top').map((d) => <DesignCard key={d.slug} design={d} doc={doc} active={doc.design === d.slug} onPick={pickDesign} />)}
              </div>
            </Group>
            <Group title="Layout">
              <ChoiceInput value={t.layout} options={LAYOUTS} onChange={setTheme('layout')} />
            </Group>
            <Group title="Colours">
              <div className="grid grid-cols-6 gap-1.5">
                {RESUME_PALETTES.map(([n, c]) => <button key={c} type="button" title={n} aria-label={`${n} accent`} onClick={() => setTheme('accent')(c)} className={`h-8 rounded-md border-2 ${t.accent === c ? 'border-ink' : 'border-transparent'}`} style={{ background: c }} />)}
              </div>
              <div><span className="label">Accent</span><ColorInput value={t.accent} onChange={setTheme('accent')} allowClear={false} /></div>
              <div><span className="label">Text</span><ColorInput value={t.text} onChange={setTheme('text')} allowClear={false} /></div>
              {twoCol && !['split', 'equal'].includes(t.layout) && <>
                <div><span className="label">Sidebar background</span><ColorInput value={t.sidebarBg} onChange={setTheme('sidebarBg')} allowClear={false} /></div>
                <div><span className="label">Sidebar text</span><ColorInput value={t.sidebarText} onChange={setTheme('sidebarText')} allowClear={false} /></div>
              </>}
            </Group>
            <Group title="Fonts and size">
              <FontPicker label="Headings" value={t.headingFont} onChange={setTheme('headingFont')} />
              <FontPicker label="Body text" value={t.bodyFont} onChange={setTheme('bodyFont')} />
              <Range label="Text size" value={t.baseSize} min={8} max={13} step={0.5} unit="pt" onChange={setTheme('baseSize')} />
              <Range label="Name size" value={t.nameSize} min={16} max={44} unit="pt" onChange={setTheme('nameSize')} />
              <Range label="Line spacing" value={t.lineHeight} min={1.1} max={1.9} step={0.05} onChange={setTheme('lineHeight')} />
            </Group>
            <Group title="Spacing">
              <Range label="Page margins" value={t.margin} min={8} max={26} unit="mm" onChange={setTheme('margin')} />
              <Range label="Space between sections" value={t.gap} min={4} max={28} unit="pt" onChange={setTheme('gap')} />
            </Group>
            <Group title="Section headings">
              <ChoiceInput value={t.heading} options={HEADINGS} onChange={setTheme('heading')} />
              <ChoiceInput value={t.headingCase} options={[['uppercase', 'CAPS'], ['none', 'As typed'], ['capitalize', 'Title Case']]} cols={3} onChange={setTheme('headingCase')} />
            </Group>
            <Group title="Details">
              <span className="label">Bullet points</span><ChoiceInput value={t.bullets} options={BULLETS} cols={3} onChange={setTheme('bullets')} />
              <span className="label">Skills</span><ChoiceInput value={t.skills} options={SKILLS} cols={3} onChange={setTheme('skills')} />
              <span className="label">Dates</span><ChoiceInput value={t.dates} options={[['right', 'Right'], ['below', 'Below title'], ['left', 'Left column']]} cols={3} onChange={setTheme('dates')} />
              <span className="label">Photo shape</span><ChoiceInput value={t.photoShape} options={[['circle', 'Circle'], ['rounded', 'Rounded'], ['square', 'Square']]} cols={3} onChange={setTheme('photoShape')} />
              <Toggle label="Icons next to contact details" checked={t.icons} onChange={setTheme('icons')} />
            </Group>
            <Group title="Pro details">
              <span className="label">Header style</span><ChoiceInput value={t.headerAlign} options={[['left', 'Left'], ['center', 'Centred'], ['rule', 'Bold rule'], ['stacked', 'Big stacked name'], ['boxed', 'Boxed name'], ['banner', 'Dark banner'], ['band', 'Colour band'], ['split', 'Split']]} onChange={setTheme('headerAlign')} />
              <span className="label">Page decoration</span><ChoiceInput value={t.decor || 'none'} options={[['none', 'None'], ['rail', 'Side rail'], ['frame', 'Frame'], ['topstrip', 'Top strip'], ['corner', 'Corner']]} cols={3} onChange={setTheme('decor')} />
              <span className="label">Job titles</span><ChoiceInput value={t.items || ''} options={[['', 'Standard'], ['accent', 'Accent colour'], ['company', 'Company first'], ['card', 'Cards']]} onChange={setTheme('items')} />
              <Toggle label="Monogram (your initials)" checked={!!t.monogram} onChange={setTheme('monogram')} />
              <Toggle label="Number the sections (01, 02…)" checked={!!t.numbered} onChange={setTheme('numbered')} />
              <Toggle label="Show key achievements as impact tiles" checked={!!t.tiles} onChange={setTheme('tiles')} />
            </Group>
            <Group title="Paper">
              <ChoiceInput value={t.paper} options={[['a4', 'A4 (India, UK, EU)'], ['letter', 'US Letter']]} onChange={setTheme('paper')} />
            </Group>
          </div>
        )}
      </div>
    </>
  );

  const right = selected ? (
    <>
      <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3">
        <div className="flex items-center gap-2 font-semibold"><BlockIcon name={SECTIONS[selected.type]?.icon} size={16} className="text-signal" /> {SECTIONS[selected.type]?.label}</div>
        <div className="flex items-center gap-1">
          {selected.type !== 'header' && <button className="btn-ghost px-2" onClick={() => act('duplicate', selected.id)} title="Duplicate" aria-label="Duplicate"><Copy size={15} /></button>}
          <button onClick={() => { setSelectedId(null); setMobile(null); }} className="btn-ghost px-2" aria-label="Close"><X size={16} /></button>
        </div>
      </div>
      <div className="thin-scroll flex-1 overflow-y-auto p-4">
        {twoCol && selected.type !== 'header' && (
          <div className="mb-4">
            <span className="label">Place in</span>
            <ChoiceInput value={selected.style?.area || ''} options={[['', 'Design default'], ['main', 'Main column'], ['side', 'Sidebar']]} cols={3} onChange={(v) => updateSection('style', 'area', v, 'area')} />
          </div>
        )}
        <FieldsForm key={selected.id} fields={SECTIONS[selected.type].fields} values={selected.props} onChange={(k, v, mk) => updateSection('props', k, v, mk)} />
      </div>
    </>
  ) : (
    <div className="p-5 text-sm text-mute">
      <p className="font-semibold text-ink">Click any part of the resume to edit it.</p>
      <ul className="mt-3 list-disc space-y-1.5 pl-4">
        <li>Start bullets with a verb and add numbers.</li>
        <li>Keep it to one or two pages.</li>
        <li>Use an ATS design for online applications.</li>
      </ul>
      <div className="mt-5 rounded-xl border border-line bg-white p-4">
        <p className="text-xs font-semibold text-mute">ATS score</p>
        <p className="text-3xl font-extrabold" style={{ color: score >= 85 ? '#16A34A' : score >= 65 ? '#D97706' : '#DC2626' }}>{score}<span className="text-base text-mute">/100</span></p>
        <button className="btn-light mt-2 w-full" onClick={() => setAts(true)}><BadgeCheck size={15} /> See how to improve</button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-paper">
      <ResumeAssets extraFonts={[t.headingFont, t.bodyFont]} />
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-white px-3">
        <NextLink href={me ? '/dashboard' : '/resume'} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-signal text-white" aria-label="Back">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M6 4h12M6 4v16M6 12h8" /></svg>
        </NextLink>
        <button className="btn-ghost px-2 lg:hidden" onClick={() => setMobile(mobile === 'left' ? null : 'left')} aria-label="Sections and design"><LayoutList size={18} /></button>
        <input value={doc.name} onChange={(e) => commit({ ...doc, name: e.target.value }, 'name')} className="hidden w-56 rounded-md border border-transparent px-2 py-1 font-semibold hover:border-line focus:border-signal focus:outline-none md:block" aria-label="Resume name" />
        <span className="hidden items-center gap-1 text-xs text-mute sm:flex">{statusUi[0]} {statusUi[1]}</span>
        <div className="ml-1 flex">
          <button onClick={undo} disabled={!past.current.length} className="btn-ghost px-2" aria-label="Undo" title="Undo"><Undo2 size={16} /></button>
          <button onClick={redo} disabled={!future.current.length} className="btn-ghost px-2" aria-label="Redo" title="Redo"><Redo2 size={16} /></button>
        </div>
        <span className="mx-auto hidden items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-xs font-semibold md:flex">
          {design.premium ? <Crown size={13} className="text-amber-500" /> : null}{design.name}{design.ats && <BadgeCheck size={13} className="text-emerald-600" />}
        </span>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button className="btn-ghost px-2 lg:hidden" onClick={() => setMobile(mobile === 'right' ? null : 'right')} aria-label="Edit section"><Plus size={18} /></button>
          <button onClick={() => setAts(true)} className="btn-light" title="ATS score"><BadgeCheck size={16} className={score >= 85 ? 'text-emerald-600' : 'text-amber-500'} /> <span className="hidden sm:inline">ATS {score}</span></button>
          <button onClick={copyText} className="btn-light hidden px-2 sm:inline-flex" title="Copy as plain text" aria-label="Copy as plain text"><ClipboardCopy size={16} /></button>
          <button onClick={download} className="btn-primary"><Download size={16} /> <span className="hidden sm:inline">Download PDF</span></button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <aside className={`${mobile === 'left' ? 'absolute inset-y-0 left-0 z-30 flex shadow-2xl' : 'hidden'} w-[300px] shrink-0 flex-col border-r border-line bg-paper lg:static lg:flex lg:shadow-none`}>{left}</aside>
        <main className="thin-scroll min-w-0 flex-1 overflow-auto bg-[#E7EBF2] p-4 sm:p-8" onClick={(e) => { if (!e.target.closest('.rs')) setSelectedId(null); }}>
          <div className="mx-auto max-w-[820px] bg-white shadow-[0_20px_60px_-20px_rgba(22,33,62,.35)]">
            <ResumeView doc={doc} selectedId={selectedId} crop={false} lazy={false} guides onPick={(sid) => { if (sid) { setSelectedId(sid); setMobile(null); } }} />
          </div>
          <p className="mt-3 text-center text-xs text-mute">Red dashed lines show where pages break when printed.</p>
        </main>
        <aside className={`${mobile === 'right' ? 'absolute inset-y-0 right-0 z-30 flex shadow-2xl' : 'hidden'} w-[330px] shrink-0 flex-col border-l border-line bg-paper lg:static lg:flex lg:shadow-none`}>{right}</aside>
      </div>

      {!me && me !== undefined && (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
          <p className="pointer-events-auto rounded-full bg-ink px-4 py-2 text-xs text-white shadow-lg">
            Editing as a guest — <NextLink className="font-semibold text-sun underline" href={`/login?next=${encodeURIComponent('/resume/new?resume=1')}`} onClick={() => localStorage.setItem(DRAFT_KEY, JSON.stringify(doc))}>log in</NextLink> to save and download.
          </p>
        </div>
      )}
      {toast && <div role="status" className="fixed bottom-16 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-xl">{toast}</div>}
      {ats && <AtsPanel doc={doc} onClose={() => setAts(false)} onAtsDesigns={() => { setAts(false); setTab('design'); setAtsOnly(true); setMobile('left'); }} />}
      {upgrade && <UpgradeModal design={upgrade} onClose={() => setUpgrade(null)} />}
    </div>
  );
}
