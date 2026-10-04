'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check, CloudOff, Copy, Crown, ExternalLink, Eye, FileText, Globe, Layers, Loader2, Menu, Palette, PanelRight, Plus, Redo2, Search, Trash2, Undo2, X, Boxes,
} from 'lucide-react';
import { BLOCKS, BLOCK_GROUPS, STYLE_FIELDS, TEXT_FIELDS, makeBlock, uid } from '@/lib/blocks';
import { fullTheme, renderDocument } from '@/lib/render';
import { slugError, toSlug } from '@/lib/publish';
import { portfolioFromTemplate } from '@/lib/templates';
import { BlockIcon } from '../icons';
import PreviewModal, { DEVICES, DeviceSwitch } from '../PreviewModal';
import Canvas from './Canvas';
import { Field, FieldsForm } from './fields';
import ThemePanel from './ThemePanel';
import PresetPicker, { PresetModal, askOnInsert } from './PresetPicker';
import ComponentsPanel from './ComponentsPanel';
import { getComponent } from '@/lib/components';
import { hasPresets } from '@/lib/presets';

const DRAFT_KEY = 'folio_draft_v1';

function normalize(d) {
  return {
    name: d.name || 'My portfolio',
    template: d.template || 'blank',
    theme: fullTheme(d.theme),
    blocks: Array.isArray(d.blocks) ? d.blocks : [],
    page: { title: '', description: '', favicon: '', ...(d.page || {}) },
  };
}

function Palette_({ onAdd, setDragging }) {
  const [q, setQ] = useState('');
  const entries = Object.entries(BLOCKS).filter(([, b]) => b.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="p-4">
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
        <input className="input pl-8" placeholder="Search blocks" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search blocks" />
      </div>
      <p className="mb-4 text-xs text-mute">Drag a block onto the page, or click to add it below the selected block.</p>
      {BLOCK_GROUPS.map((g) => {
        const items = entries.filter(([, b]) => b.group === g);
        if (!items.length) return null;
        return (
          <div key={g} className="mb-5">
            <h3 className="mb-2 text-xs font-bold text-mute">{g}</h3>
            <div className="grid grid-cols-2 gap-2">
              {items.map(([type, b]) => (
                <button
                  key={type}
                  draggable
                  onDragStart={(e) => { e.dataTransfer.setData('text/plain', 'new:' + type); e.dataTransfer.effectAllowed = 'copy'; setDragging(true); }}
                  onDragEnd={() => setDragging(false)}
                  onClick={() => onAdd(type)}
                  className="flex cursor-grab flex-col items-start gap-2 rounded-lg border border-line bg-white p-2.5 text-left text-xs font-semibold hover:border-signal hover:bg-signal-soft active:cursor-grabbing"
                >
                  <BlockIcon name={b.icon} size={18} className="text-signal" />
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LayersList({ blocks, selectedId, onSelect, onMove, onDelete }) {
  const [dragId, setDragId] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  if (!blocks.length) return <p className="p-4 text-sm text-mute">No blocks yet. Add some from the Blocks tab.</p>;
  return (
    <ol className="space-y-1 p-3">
      {blocks.map((b, i) => (
        <li
          key={b.id}
          draggable
          onDragStart={(e) => { setDragId(b.id); e.dataTransfer.setData('text/plain', 'layer'); }}
          onDragOver={(e) => { e.preventDefault(); setOverIdx(i); }}
          onDrop={(e) => { e.preventDefault(); if (dragId) onMove(dragId, i > blocks.findIndex((x) => x.id === dragId) ? i + 1 : i); setDragId(null); setOverIdx(null); }}
          onDragEnd={() => { setDragId(null); setOverIdx(null); }}
          className={`group flex items-center gap-2 rounded-lg border px-2 py-2 text-sm ${selectedId === b.id ? 'border-signal bg-signal-soft' : 'border-transparent hover:bg-white'} ${overIdx === i && dragId ? 'border-t-signal' : ''}`}
        >
          <button className="flex min-w-0 flex-1 cursor-grab items-center gap-2 text-left" onClick={() => onSelect(b.id)}>
            <BlockIcon name={BLOCKS[b.type]?.icon} size={15} className="shrink-0 text-mute" />
            <span className="font-medium">{BLOCKS[b.type]?.label || b.type}</span>
            <span className="truncate text-xs text-mute">{b.props?.title || b.props?.text || b.props?.logo || ''}</span>
          </button>
          <button className="rounded p-1 text-mute opacity-0 hover:text-red-600 group-hover:opacity-100" onClick={() => onDelete(b.id)} aria-label="Delete block"><Trash2 size={13} /></button>
        </li>
      ))}
    </ol>
  );
}

function UpgradeModal({ message, onClose }) {
  const [state, setState] = useState('idle');
  const [note, setNote] = useState('');
  useEffect(() => {
    fetch('/api/premium').then((r) => r.json()).then((d) => d.request?.status === 'pending' && setState('sent')).catch(() => {});
  }, []);
  async function ask() {
    setState('busy');
    const r = await fetch('/api/premium', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: note }) });
    setState(r.ok ? 'sent' : 'idle');
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-sun/25"><Crown className="text-ink" size={22} /></span>
          <button onClick={onClose} className="btn-ghost px-2" aria-label="Close"><X size={18} /></button>
        </div>
        <h2 className="text-2xl font-bold">Premium access needed</h2>
        <p className="mt-2 text-mute">{message}</p>
        {state === 'sent' ? (
          <p className="mt-5 flex items-center gap-2 rounded-lg bg-signal-soft p-3 text-sm font-semibold"><Check size={16} className="text-signal" /> Request sent. An admin will review it and you can publish once it is approved.</p>
        ) : (
          <>
            <label className="label mt-5" htmlFor="note">Note for the admin (optional)</label>
            <textarea id="note" className="input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. I need this for my job applications this week" />
            <button onClick={ask} disabled={state === 'busy'} className="btn-sun mt-4 w-full py-2.5"><Crown size={16} /> Ask for premium access</button>
          </>
        )}
        <p className="mt-4 text-center text-xs text-mute">Your portfolio is saved. You can keep editing and previewing meanwhile.</p>
      </div>
    </div>
  );
}

function PublishModal({ live, defaultSlug, onPublish, onUnpublish, onClose }) {
  const [slug, setSlug] = useState(live.slug || defaultSlug);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${origin}/${live.slug}`;
  const isLive = !!live.publishedAt;

  async function run(kind, fn) {
    setBusy(kind);
    setError('');
    try { await fn(); } catch (e) { setError(e.message); } finally { setBusy(''); }
  }
  const publish = (e) => {
    e?.preventDefault();
    const err = slugError(slug);
    if (err) return setError(err);
    run('publish', () => onPublish(slug));
  };
  const copy = () => navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" role="dialog" aria-modal="true" aria-labelledby="publish-title">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-signal-soft"><Globe className="text-signal" size={22} /></span>
          <button onClick={onClose} className="btn-ghost px-2" aria-label="Close"><X size={18} /></button>
        </div>
        <h2 id="publish-title" className="text-2xl font-bold">{isLive ? 'Your portfolio is live' : 'Publish your portfolio'}</h2>

        {isLive && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-paper p-2 pl-3">
            <a href={url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-sm font-semibold text-signal hover:underline">{url}</a>
            <button onClick={copy} className="btn-ghost px-2" aria-label="Copy link" title="Copy link">{copied ? <Check size={16} /> : <Copy size={16} />}</button>
            <a href={url} target="_blank" rel="noreferrer" className="btn-ghost px-2" aria-label="Open live page" title="Open"><ExternalLink size={16} /></a>
          </div>
        )}

        <form onSubmit={publish} className="mt-5">
          <label className="label" htmlFor="slug">Page address</label>
          <div className="flex items-center rounded-lg border border-line focus-within:border-signal">
            <span className="shrink-0 pl-3 text-sm text-mute">{origin.replace(/^https?:\/\//, '')}/</span>
            <input id="slug" className="min-w-0 flex-1 rounded-r-lg py-2 pr-3 text-sm font-semibold focus:outline-none" value={slug} onChange={(e) => setSlug(toSlug(e.target.value.replace(/\s/g, '-')) + (/[\s-]$/.test(e.target.value) ? '-' : ''))} maxLength={40} autoFocus={!isLive} spellCheck={false} />
          </div>
          {error && <p className="mt-2 text-sm font-semibold text-red-600" role="alert">{error}</p>}
          <button type="submit" disabled={!!busy} className="btn-primary mt-4 w-full py-2.5">
            {busy === 'publish' ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />} {isLive ? 'Publish changes' : 'Publish'}
          </button>
        </form>
        {isLive ? (
          <button onClick={() => { if (confirm('Take this page offline? The link will stop working until you publish again.')) run('unpublish', onUnpublish); }} disabled={!!busy} className="btn-ghost mt-2 w-full text-red-600">
            {busy === 'unpublish' && <Loader2 size={16} className="animate-spin" />} Unpublish
          </button>
        ) : (
          <p className="mt-4 text-center text-xs text-mute">Edits you make later go live when you press Publish changes.</p>
        )}
      </div>
    </div>
  );
}

export default function Builder({ id, templateSlug, resume }) {
  const router = useRouter();
  const [doc, setDoc] = useState(null);
  const [portfolioId, setPortfolioId] = useState(id !== 'new' ? Number(id) : null);
  const [me, setMe] = useState(undefined);
  const [selectedId, setSelectedId] = useState(null);
  const [panel, setPanel] = useState('add');
  const [rightTab, setRightTab] = useState('content');
  const [device, setDevice] = useState('desktop');
  const [status, setStatus] = useState('saved');
  const [preview, setPreview] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [upgrade, setUpgrade] = useState(null);
  const [toast, setToast] = useState('');
  const [publishOpen, setPublishOpen] = useState(false);
  const [live, setLive] = useState({ slug: null, publishedAt: null });
  const [loadError, setLoadError] = useState('');
  const [mobilePanel, setMobilePanel] = useState(null);
  const [chooser, setChooser] = useState(null);

  const docRef = useRef(null);
  const past = useRef([]);
  const future = useRef([]);
  const lastMerge = useRef({ key: null, t: 0 });
  const creating = useRef(null);
  const loaded = useRef(false);
  const dirty = useRef(false);
  docRef.current = doc;

  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 3500); };

  // ---------- load ----------
  const started = useRef(false);
  useEffect(() => {
    // Load once: the first save rewrites the URL (dropping ?template=), which must not reload the page
    if (started.current) return;
    started.current = true;
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setMe(d.user)).catch(() => setMe(null));
    (async () => {
      if (id !== 'new') {
        const r = await fetch(`/api/portfolios/${id}`);
        const d = await r.json();
        if (!r.ok) return setLoadError(d.error || 'Could not open this portfolio.');
        setDoc(normalize(d.portfolio));
        setLive({ slug: d.portfolio.slug, publishedAt: d.portfolio.publishedAt });
      } else {
        let draft = null;
        if (resume) try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch {}
        setDoc(normalize(draft || portfolioFromTemplate(templateSlug || 'blank')));
        setStatus('local');
      }
      loaded.current = true;
    })();
  }, [id, templateSlug, resume]);

  // ---------- history ----------
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
  const undo = useCallback(() => {
    if (!past.current.length) return;
    future.current.push(docRef.current);
    setDoc(past.current.pop());
    lastMerge.current = { key: null, t: 0 };
  }, []);
  const redo = useCallback(() => {
    if (!future.current.length) return;
    past.current.push(docRef.current);
    setDoc(future.current.pop());
  }, []);

  // ---------- block ops ----------
  const setBlocks = (blocks, mk) => commit({ ...docRef.current, blocks }, mk);
  const insertBlock = (type, at) => {
    const blocks = docRef.current.blocks;
    const b = makeBlock(type);
    let idx = at;
    if (idx == null) {
      const si = blocks.findIndex((x) => x.id === selectedId);
      idx = si >= 0 ? si + 1 : blocks.length;
    }
    setBlocks([...blocks.slice(0, idx), b, ...blocks.slice(idx)]);
    setSelectedId(b.id);
    if (hasPresets(type) && askOnInsert()) setChooser(b.id);
    setRightTab('content');
    setMobilePanel(null);
  };
  // Adds every block of a ready-made component in one undo step
  const insertComponent = (comp, at) => {
    const blocks = docRef.current.blocks;
    const added = comp.blocks();
    let idx = at;
    if (idx == null) {
      const si = blocks.findIndex((x) => x.id === selectedId);
      idx = si >= 0 ? si + 1 : blocks.length;
    }
    setBlocks([...blocks.slice(0, idx), ...added, ...blocks.slice(idx)]);
    setSelectedId(added[0]?.id || null);
    setRightTab('content');
    setMobilePanel(null);
    flash(`Added “${comp.name}” — ${added.length} blocks. Click any of them to edit.`);
  };
  const moveBlock = (bid, to) => {
    const blocks = [...docRef.current.blocks];
    const from = blocks.findIndex((x) => x.id === bid);
    if (from < 0) return;
    const [b] = blocks.splice(from, 1);
    let t = to > from ? to - 1 : to;
    t = Math.max(0, Math.min(blocks.length, t));
    if (t === from) return;
    blocks.splice(t, 0, b);
    setBlocks(blocks);
  };
  const action = (act, bid) => {
    if (act === 'dragstart') return setDragging(true);
    if (act === 'dragend') return setDragging(false);
    const blocks = docRef.current.blocks;
    const i = blocks.findIndex((x) => x.id === bid);
    if (act === 'delete') { setBlocks(blocks.filter((x) => x.id !== bid)); if (selectedId === bid) setSelectedId(null); }
    if (act === 'up' && i > 0) moveBlock(bid, i - 1);
    if (act === 'down' && i < blocks.length - 1) moveBlock(bid, i + 2);
    if (act === 'duplicate') {
      const copy = { ...JSON.parse(JSON.stringify(blocks[i])), id: uid() };
      setBlocks([...blocks.slice(0, i + 1), copy, ...blocks.slice(i + 1)]);
      setSelectedId(copy.id);
    }
  };
  const onDrop = (data, at) => {
    setDragging(false);
    if (data.startsWith('new:')) insertBlock(data.slice(4), at);
    else if (data.startsWith('comp:')) { const c = getComponent(data.slice(5)); if (c) insertComponent(c, at); }
    else if (data.startsWith('move:')) moveBlock(data.slice(5), at);
  };
  const updateSelected = (part, key, value, mk) => {
    setBlocks(
      docRef.current.blocks.map((b) => (b.id === selectedId ? { ...b, [part]: { ...(b[part] || {}), [key]: value } } : b)),
      `${selectedId}.${part}.${mk}`
    );
  };

  // ---------- keyboard ----------
  useEffect(() => {
    const onKey = (e) => {
      const typing = e.target.closest('input,textarea,select,[contenteditable]');
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'z' && !typing) { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if (mod && e.key.toLowerCase() === 'y' && !typing) { e.preventDefault(); redo(); }
      else if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); save(true); }
      else if (!typing && selectedId && (e.key === 'Delete' || e.key === 'Backspace')) { e.preventDefault(); action('delete', selectedId); }
      else if (!typing && selectedId && mod && e.key.toLowerCase() === 'd') { e.preventDefault(); action('duplicate', selectedId); }
      else if (e.key === 'Escape' && !preview) setSelectedId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // ---------- saving ----------
  const createOnServer = useCallback(async () => {
    if (creating.current) return creating.current;
    creating.current = (async () => {
      const d = docRef.current;
      const r = await fetch('/api/portfolios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ template: d.template, name: d.name, data: d }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setPortfolioId(j.id);
      localStorage.removeItem(DRAFT_KEY);
      window.history.replaceState(null, '', `/builder/${j.id}`);
      return j.id;
    })();
    try { return await creating.current; } finally { creating.current = null; }
  }, []);

  const save = useCallback(async (manual = false) => {
    const d = docRef.current;
    if (!d) return null;
    try {
      if (!portfolioId) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
        if (!me) { setStatus('local'); if (manual) flash('Saved on this device. Log in to keep it in your account.'); return null; }
        if (!manual && !dirty.current) { setStatus('new'); return null; }
        setStatus('saving');
        const nid = await createOnServer();
        setStatus('saved');
        return nid;
      }
      setStatus('saving');
      const r = await fetch(`/api/portfolios/${portfolioId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: d.name, data: d }) });
      if (!r.ok) throw new Error((await r.json()).error);
      setStatus('saved');
      return portfolioId;
    } catch (e) {
      setStatus('error');
      if (manual) flash(e.message || 'Could not save. Check your connection.');
      return null;
    }
  }, [portfolioId, me, createOnServer]);

  useEffect(() => {
    if (!loaded.current || !doc || me === undefined) return;
    if (portfolioId && !dirty.current) return;
    setStatus((s) => (s === 'saving' ? s : portfolioId || me ? 'unsaved' : 'local'));
    const t = setTimeout(() => save(false), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, me]);

  // ---------- publish ----------
  async function openPublish() {
    if (!me) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(docRef.current));
      router.push(`/login?next=${encodeURIComponent('/builder/new?resume=1')}`);
      return;
    }
    if (!(await save(true))) return;
    setPublishOpen(true);
  }
  async function publish(slug) {
    const pid = await save(true);
    if (!pid) throw new Error('Could not save. Check your connection.');
    const r = await fetch(`/api/portfolios/${pid}/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
    const j = await r.json().catch(() => ({}));
    if (j.code === 'premium') { setPublishOpen(false); setUpgrade(j.error); return; }
    if (!r.ok) throw new Error(j.error || 'Could not publish. Try again.');
    setLive({ slug: j.slug, publishedAt: j.publishedAt });
    flash(`Published at ${window.location.origin}/${j.slug}`);
  }
  async function unpublish() {
    const r = await fetch(`/api/portfolios/${portfolioId}/publish`, { method: 'DELETE' });
    if (!r.ok) throw new Error('Could not unpublish. Try again.');
    setLive((l) => ({ ...l, publishedAt: null }));
    flash('Unpublished. The link no longer works.');
  }

  const previewHtml = useMemo(() => (preview && doc ? renderDocument(doc) : ''), [preview, doc]);
  const selected = doc?.blocks.find((b) => b.id === selectedId);
  const width = DEVICES.find((d) => d.key === device).width;

  if (loadError)
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <p className="text-lg font-semibold">{loadError}</p>
          <NextLink href="/dashboard" className="btn-primary mt-4">Back to my portfolios</NextLink>
        </div>
      </div>
    );
  if (!doc) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin text-signal" /></div>;

  const statusUi = {
    saved: [<Check key="i" size={14} />, 'Saved'],
    saving: [<Loader2 key="i" size={14} className="animate-spin" />, 'Saving…'],
    unsaved: [<Loader2 key="i" size={14} className="animate-spin" />, 'Saving…'],
    local: [<CloudOff key="i" size={14} />, 'Saved on this device'],
    new: [<CloudOff key="i" size={14} />, 'Not saved yet'],
    error: [<CloudOff key="i" size={14} className="text-red-600" />, 'Not saved'],
  }[status];

  const tabs = [
    ['add', Plus, 'Blocks'],
    ['components', Boxes, 'Components'],
    ['layers', Layers, 'Layers'],
    ['design', Palette, 'Design'],
    ['page', FileText, 'Page'],
  ];

  const leftPanel = (
    <>
      <div className="grid grid-cols-5 border-b border-line bg-white" role="tablist">
        {tabs.map(([k, Icon, l]) => (
          <button key={k} role="tab" aria-selected={panel === k} onClick={() => setPanel(k)} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${panel === k ? 'border-b-2 border-signal text-ink' : 'text-mute hover:text-ink'}`}>
            <Icon size={17} /> {l}
          </button>
        ))}
      </div>
      <div className="thin-scroll flex-1 overflow-y-auto">
        {panel === 'add' && <Palette_ onAdd={(t) => insertBlock(t)} setDragging={setDragging} />}
        {panel === 'components' && <ComponentsPanel theme={doc.theme} onAdd={(c) => insertComponent(c)} setDragging={setDragging} />}
        {panel === 'layers' && <LayersList blocks={doc.blocks} selectedId={selectedId} onSelect={(i) => { setSelectedId(i); setMobilePanel(null); }} onMove={moveBlock} onDelete={(i) => action('delete', i)} />}
        {panel === 'design' && <ThemePanel theme={doc.theme} onChange={(theme, mk) => commit({ ...doc, theme }, mk)} />}
        {panel === 'page' && (
          <div className="space-y-4 p-4">
            <Field field={{ k: 'name', label: 'Portfolio name (only you see this)', t: 'text' }} value={doc.name} onChange={(v) => commit({ ...doc, name: v }, 'name')} />
            <Field field={{ k: 'title', label: 'Browser tab title', t: 'text' }} value={doc.page.title} onChange={(v) => commit({ ...doc, page: { ...doc.page, title: v } }, 'page.title')} />
            <Field field={{ k: 'description', label: 'Search description', t: 'textarea' }} value={doc.page.description} onChange={(v) => commit({ ...doc, page: { ...doc.page, description: v } }, 'page.desc')} />
            <Field field={{ k: 'favicon', label: 'Site icon (favicon)', t: 'image' }} value={doc.page.favicon} onChange={(v) => commit({ ...doc, page: { ...doc.page, favicon: v } })} />
            <button className="btn-light w-full text-red-600" onClick={() => { if (confirm('Remove every block from this page?')) { setBlocks([]); setSelectedId(null); } }}>
              <Trash2 size={14} /> Clear page
            </button>
          </div>
        )}
      </div>
    </>
  );

  const rightPanel = selected ? (
    <>
      <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3">
        <div className="flex items-center gap-2 font-semibold">
          <BlockIcon name={BLOCKS[selected.type]?.icon} size={16} className="text-signal" /> {BLOCKS[selected.type]?.label}
        </div>
        <button onClick={() => { setSelectedId(null); setMobilePanel(null); }} className="btn-ghost px-2" aria-label="Close"><X size={16} /></button>
      </div>
      <div className="flex border-b border-line bg-white px-4" role="tablist">
        {[['content', 'Content'], ['text', 'Text'], ['style', 'Style']].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={rightTab === k} onClick={() => setRightTab(k)} className={`mr-5 py-2 text-sm font-semibold ${rightTab === k ? 'border-b-2 border-signal' : 'text-mute'}`}>{l}</button>
        ))}
      </div>
      <div className="thin-scroll flex-1 overflow-y-auto p-4">
        {rightTab === 'content' && (
          <>
            <PresetPicker key={selected.id + 'p'} block={selected} theme={doc.theme} onApply={(nb) => setBlocks(docRef.current.blocks.map((b) => (b.id === nb.id ? nb : b)))} />
            <FieldsForm key={selected.id} fields={BLOCKS[selected.type].fields} values={selected.props} onChange={(k, v, mk) => updateSelected('props', k, v, mk)} />
          </>
        )}
        {rightTab === 'text' && (
          <>
            <p className="mb-4 rounded-lg bg-signal-soft px-3 py-2 text-xs text-ink">Styles the titles, text and buttons in this section only. Tip: click any title on the page to jump here.</p>
            <FieldsForm key={selected.id + 't'} fields={TEXT_FIELDS} values={selected.style} onChange={(k, v, mk) => updateSelected('style', k, v, mk)} />
            <button type="button" className="btn-light mt-5 w-full" onClick={() => setBlocks(docRef.current.blocks.map((b) => (b.id === selectedId ? { ...b, style: Object.fromEntries(Object.entries(b.style || {}).filter(([k]) => !TEXT_FIELDS.some((f) => f.k === k))) } : b)))}>Reset text styles</button>
          </>
        )}
        {rightTab === 'style' && <FieldsForm key={selected.id + 's'} fields={STYLE_FIELDS} values={selected.style} onChange={(k, v, mk) => updateSelected('style', k, v, mk)} />}
      </div>
    </>
  ) : (
    <div className="p-5 text-sm text-mute">
      <p className="font-semibold text-ink">Click any block on the page to edit it.</p>
      <ul className="mt-3 list-disc space-y-1.5 pl-4">
        <li>Drag blocks to reorder them.</li>
        <li>Use Design for colours and fonts.</li>
        <li>Ctrl/⌘ + Z undoes, Ctrl/⌘ + D duplicates.</li>
      </ul>
    </div>
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-paper">
      {/* top bar */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-white px-3">
        <NextLink href={me ? '/dashboard' : '/'} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-signal text-white" aria-label="Back">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M6 4h12M6 4v16M6 12h8" /></svg>
        </NextLink>
        <button className="btn-ghost px-2 lg:hidden" onClick={() => setMobilePanel(mobilePanel === 'left' ? null : 'left')} aria-label="Blocks and design"><Menu size={18} /></button>
        <input value={doc.name} onChange={(e) => commit({ ...doc, name: e.target.value }, 'name')} className="hidden w-48 rounded-md border border-transparent px-2 py-1 font-semibold hover:border-line focus:border-signal focus:outline-none md:block" aria-label="Portfolio name" />
        <span className="hidden items-center gap-1 text-xs text-mute sm:flex">{statusUi[0]} {statusUi[1]}</span>
        <div className="ml-1 flex">
          <button onClick={undo} disabled={!past.current.length} className="btn-ghost px-2" aria-label="Undo" title="Undo"><Undo2 size={16} /></button>
          <button onClick={redo} disabled={!future.current.length} className="btn-ghost px-2" aria-label="Redo" title="Redo"><Redo2 size={16} /></button>
        </div>
        <div className="mx-auto hidden md:block"><DeviceSwitch value={device} onChange={setDevice} /></div>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button className="btn-ghost px-2 lg:hidden" onClick={() => setMobilePanel(mobilePanel === 'right' ? null : 'right')} aria-label="Block settings"><PanelRight size={18} /></button>
          <button onClick={() => setPreview(true)} className="btn-light"><Eye size={16} /> <span className="hidden sm:inline">Preview</span></button>
          {live.publishedAt && (
            <a href={`/${live.slug}`} target="_blank" rel="noreferrer" className="btn-ghost hidden px-2 xl:inline-flex" title="Open live page"><ExternalLink size={16} /> /{live.slug}</a>
          )}
          <button onClick={openPublish} className="btn-primary">
            <Globe size={16} /> <span className="hidden sm:inline">{live.publishedAt ? 'Update' : 'Publish'}</span>
          </button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <aside className={`${mobilePanel === 'left' ? 'absolute inset-y-0 left-0 z-30 flex shadow-2xl' : 'hidden'} w-[300px] shrink-0 flex-col border-r border-line bg-paper lg:static lg:flex lg:shadow-none`}>
          {leftPanel}
        </aside>

        <main className="thin-scroll min-w-0 flex-1 overflow-auto bg-[#E7EBF2] p-4 sm:p-8" onClick={() => setSelectedId(null)}>
          <Canvas
            doc={doc}
            selectedId={selectedId}
            onSelect={(i, target) => { setSelectedId(i); setRightTab(target?.closest?.('h1,h2,h3,h4,.pf-h1,.pf-h2,.pf-h3,.pf-h4') ? 'text' : 'content'); }}
            onDrop={onDrop}
            onAction={action}
            width={width}
            dragging={dragging}
            onAddFirst={() => insertBlock('hero', 0)}
          />
        </main>

        <aside className={`${mobilePanel === 'right' ? 'absolute inset-y-0 right-0 z-30 flex shadow-2xl' : 'hidden'} w-[320px] shrink-0 flex-col border-l border-line bg-paper lg:static lg:flex lg:shadow-none`}>
          {rightPanel}
        </aside>
      </div>

      {!me && me !== undefined && (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
          <p className="pointer-events-auto rounded-full bg-ink px-4 py-2 text-xs text-white shadow-lg">
            Editing as a guest — <NextLink className="font-semibold text-sun underline" href={`/login?next=${encodeURIComponent('/builder/new?resume=1')}`} onClick={() => localStorage.setItem(DRAFT_KEY, JSON.stringify(doc))}>log in</NextLink> to save to your account and publish.
          </p>
        </div>
      )}

      {toast && <div role="status" className="fixed bottom-16 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-xl">{toast}</div>}

      {preview && (
        <PreviewModal html={previewHtml} title={doc.name} onClose={() => setPreview(false)}>
          <button onClick={() => { setPreview(false); openPublish(); }} className="btn-primary"><Globe size={16} /> {live.publishedAt ? 'Update' : 'Publish'}</button>
        </PreviewModal>
      )}
      {publishOpen && (
        <PublishModal live={live} defaultSlug={toSlug(me?.name || doc.name)} onPublish={publish} onUnpublish={unpublish} onClose={() => setPublishOpen(false)} />
      )}
      {upgrade && <UpgradeModal message={upgrade} onClose={() => setUpgrade(null)} />}
      {chooser && doc.blocks.find((b) => b.id === chooser) && (
        <PresetModal
          isNew
          block={doc.blocks.find((b) => b.id === chooser)}
          theme={doc.theme}
          onApply={(nb) => setBlocks(docRef.current.blocks.map((b) => (b.id === nb.id ? nb : b)))}
          onClose={() => { setChooser(null); setRightTab('content'); }}
        />
      )}
    </div>
  );
}
