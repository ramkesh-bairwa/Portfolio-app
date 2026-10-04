'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check, CloudOff, Download, Image as ImageIcon, Layers, LayoutTemplate, Loader2, Menu, Minus, PanelRight, PenLine, Plus, Redo2, Share2, Shapes,
  Smile, Sparkles, Spline, Sticker, Type, Undo2, X, Wrench, Focus, Smartphone, Keyboard,
} from 'lucide-react';
import { eid, imageEl } from '@/lib/poster/design';
import { blankPoster, posterFromTemplate } from '@/lib/poster/templates';
import { rememberUploads, uploadFiles } from '../builder/fields';
import { designFile, exportDesign, safeRatio } from './exporter';
import Inspector from './Inspector';
import { DetailsPanel, GraphicsPanel, IconsPanel, LayersPanel, PhotosPanel, ShapesPanel, StickersPanel, TemplatesPanel, TextPanel } from './Panels';
import ToolsPanel, { CurveDesigner, TOOLS, designColors } from './ToolsPanel';

const TOOL_COUNT = TOOLS.length;
import Mockup from './Mockup';
import CopyFromPhoto from './CopyFromPhoto';
import { scaleDoc } from '@/lib/poster/scale';
import { curveEl, layer as curveLayer, smoothThrough } from '@/lib/poster/curve';
import { SwatchContext } from './PosterColor';
import Stage from './Stage';
import { SHAPES } from '@/lib/poster/shapes';
import HinglishTextarea, { HindiTypingContext, TypingSwitch } from './HinglishTextarea';
import { FONTS } from '@/lib/fonts';
import { fontStack } from '@/lib/fonts';

const DRAFT_KEY = 'folio_poster_draft_v1';
const TYPING_KEY = 'folio_hindi_typing';
// Fonts without Hindi letters get swapped for a Hindi font of a similar style once Hindi is typed
const DEVA_FONTS = new Set(['Poppins', ...FONTS.filter((f) => f.category === 'hindi').map((f) => f.name)]);
const DEVA_FOR = {
  Montserrat: 'Baloo 2', 'Bebas Neue': 'Khand', 'Archivo Black': 'Baloo 2', Bungee: 'Yatra One', 'Playfair Display': 'Rozha One', 'Abril Fatface': 'Rozha One',
  Fraunces: 'Eczar', 'Great Vibes': 'Amita', Caveat: 'Kalam', Lobster: 'Yatra One', Righteous: 'Baloo 2', 'Cormorant Garamond': 'Martel', Lora: 'Martel',
  Inter: 'Mukta', 'DM Sans': 'Mukta', Unbounded: 'Baloo 2', Syne: 'Baloo 2',
};
// switching a Hindi text to English: back to a Latin font of the same feel
const DEVA_TO_LATIN = { 'Baloo 2': 'Montserrat', Khand: 'Bebas Neue', 'Rozha One': 'Playfair Display', Amita: 'Great Vibes', Kalam: 'Caveat', 'Yatra One': 'Lobster', Martel: 'Lora', Mukta: 'Inter', Eczar: 'Fraunces' };
const hasDeva = (t) => /[\u0900-\u097F]/.test(t || '');
const clone = (x) => JSON.parse(JSON.stringify(x));
const HANDLES = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];
const CURSORS = { '-1,-1': 'nwse-resize', '1,1': 'nwse-resize', '1,-1': 'nesw-resize', '-1,1': 'nesw-resize', '0,-1': 'ns-resize', '0,1': 'ns-resize', '-1,0': 'ew-resize', '1,0': 'ew-resize' };

function normalize(d) {
  return {
    name: d.name || 'Untitled design', template: d.template || 'blank', format: d.format || 'custom',
    w: d.w || 794, h: d.h || 1123, bg: d.bg || { type: 'solid', color: '#FFFFFF' }, elements: Array.isArray(d.elements) ? d.elements : [],
  };
}

// Smooth curve through drawn points (quadratic midpoints)
function smoothPath(pts) {
  const f = (n) => Math.round(n * 10) / 10;
  const p = pts.filter((q, i) => i === 0 || Math.hypot(q.x - pts[i - 1].x, q.y - pts[i - 1].y) > 1.5);
  if (p.length < 3) return `M${f(p[0].x)} ${f(p[0].y)} L${f(p.at(-1).x)} ${f(p.at(-1).y)}`;
  let d = `M${f(p[0].x)} ${f(p[0].y)}`;
  for (let i = 1; i < p.length - 1; i++) d += ` Q${f(p[i].x)} ${f(p[i].y)} ${f((p[i].x + p[i + 1].x) / 2)} ${f((p[i].y + p[i + 1].y) / 2)}`;
  return `${d} L${f(p.at(-1).x)} ${f(p.at(-1).y)}`;
}

// What "Copy style" copies for each kind of item
const STYLE_KEYS = {
  text: ['font', 'size', 'weight', 'italic', 'underline', 'strike', 'align', 'color', 'lh', 'ls', 'upper', 'fill2', 'gradAngle', 'stroke', 'strokeW', 'shadow', 'bgColor', 'bgPad', 'bgRadius', 'extrude', 'opacity', 'blend'],
  shape: ['fill', 'fill2', 'gradAngle', 'stroke', 'strokeW', 'radius', 'dash', 'shadow', 'opacity', 'blend'],
  image: ['filters', 'radius', 'mask', 'stroke', 'strokeW', 'outline', 'shadow', 'tint', 'fade', 'opacity', 'blend'],
  icon: ['color', 'strokeW', 'filled', 'shadow', 'opacity'],
  graphic: ['colors', 'shadow', 'opacity', 'blend'],
  qr: ['fg', 'bg', 'dots', 'margin'],
  curve: ['layers', 'mode', 'fillTo', 'tension', 'dash', 'cap', 'extend'],
  path: ['color', 'strokeW', 'highlighter'],
  common: ['shadow', 'opacity', 'blend'],
};
const pickStyle = (el) => Object.fromEntries((STYLE_KEYS[el.type] || STYLE_KEYS.common).filter((k) => el[k] !== undefined).map((k) => [k, JSON.parse(JSON.stringify(el[k]))]));

// Snap the moving box to page edges/centre and to other elements
function snap(box, others, W, H, th) {
  const xs = [0, W / 2, W, ...others.flatMap((o) => [o.x, o.x + o.w / 2, o.x + o.w])];
  const ys = [0, H / 2, H, ...others.flatMap((o) => [o.y, o.y + o.h / 2, o.y + o.h])];
  const pick = (edges, cands) => {
    let best = null;
    edges.forEach((e) => cands.forEach((c) => {
      const d = c - e;
      if (Math.abs(d) < th && (!best || Math.abs(d) < Math.abs(best.d))) best = { d, c };
    }));
    return best;
  };
  const bx = pick([box.l, (box.l + box.r) / 2, box.r], xs);
  const by = pick([box.t, (box.t + box.b) / 2, box.b], ys);
  return { dx: bx?.d || 0, dy: by?.d || 0, guides: { v: bx ? [bx.c] : [], h: by ? [by.c] : [] } };
}

export default function PosterEditor({ id, templateSlug, formatKey, resume, copy }) {
  const router = useRouter();
  const [doc, setDoc] = useState(null);
  const [posterId, setPosterId] = useState(id !== 'new' ? Number(id) : null);
  // the id as soon as it exists, so a save fired right after creation doesn't create a second copy
  const posterIdRef = useRef(id !== 'new' ? Number(id) : null);
  const [me, setMe] = useState(undefined);
  const [selected, setSelected] = useState([]);
  const [panel, setPanel] = useState('templates');
  const [status, setStatus] = useState('saved');
  const [zoom, setZoom] = useState(0.5);
  const [fit, setFit] = useState(true);
  const [guides, setGuides] = useState({ v: [], h: [] });
  const [marquee, setMarquee] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [cropping, setCropping] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportOpts, setExportOpts] = useState({ type: 'png', ratio: 2, transparent: false, bleed: false });
  // View settings (rulers, grid, snapping) and the brand kit are remembered on this device
  const [view, setViewState] = useState({ rulers: false, grid: false, gridSize: 40, snapGrid: false, snapObjects: true });
  const [brand, setBrandState] = useState({ colors: [] });
  const [mockup, setMockup] = useState(false);
  const [copyOpen, setCopyOpen] = useState(!!copy);
  const [shortcuts, setShortcuts] = useState(false);
  const [versionList, setVersionList] = useState([]);
  const styleClip = useRef(null);
  const viewSettings = useRef(view);
  viewSettings.current = view;
  const viewRef = useRef(null);
  const panning = useRef({ space: false });
  const [spaceDown, setSpaceDown] = useState(false);
  // freehand drawing settings, the persistent hand tool and the off-screen renderer used by Magic resize / Bulk create
  const [draw, setDrawState] = useState({ on: false, mode: 'pen', color: '#DC2626', size: 6, highlighter: false });
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const [stroke, setStroke] = useState(null);
  const [hand, setHandState] = useState(false);
  const [offDoc, setOffDoc] = useState(null);
  // custom curves: pen (click points to draw a new curve) and point editing of an existing curve
  const [pen, setPenState] = useState(null); // array of page points while drawing, or null
  const penRef = useRef(null);
  penRef.current = pen;
  const [editPointsId, setEditPointsId] = useState(null);
  const offNode = useRef(null);
  const offResolve = useRef(null);
  useEffect(() => {
    try { const v = JSON.parse(localStorage.getItem('folio_poster_view') || 'null'); if (v) setViewState((o) => ({ ...o, ...v })); } catch { /* none */ }
    try { const b = JSON.parse(localStorage.getItem('folio_brand_kit') || 'null'); if (b) setBrandState(b); } catch { /* none */ }
  }, []);
  // accepts a new settings object or an updater, so quick successive clicks don't undo each other
  const setView = (v) => setViewState((old) => {
    const next = typeof v === 'function' ? v(old) : v;
    try { localStorage.setItem('folio_poster_view', JSON.stringify(next)); } catch { /* storage blocked */ }
    return next;
  });
  const setBrand = (b) => { setBrandState(b); try { localStorage.setItem('folio_brand_kit', JSON.stringify(b)); } catch { /* storage blocked */ } };
  const [exporting, setExporting] = useState(null);
  const [toast, setToast] = useState('');
  const [loadError, setLoadError] = useState('');
  const [mobilePanel, setMobilePanel] = useState(null);
  const [shareFile, setShareFile] = useState(null);
  const [hindiTyping, setHindiTyping] = useState(false);
  const inlineRef = useRef(null);
  const fillRef = useRef(null);
  const fillTarget = useRef(null);

  const docRef = useRef(null);
  const zoomRef = useRef(zoom);
  const selRef = useRef(selected);
  const past = useRef([]);
  const future = useRef([]);
  const lastMerge = useRef({ key: null, t: 0 });
  const dirty = useRef(false);
  const loaded = useRef(false);
  const creating = useRef(null);
  const pageRef = useRef(null);
  const drag = useRef(null);
  const clip = useRef(null);
  const uploadRef = useRef(null);
  const exportNodeRef = useRef(null);
  docRef.current = doc;
  zoomRef.current = zoom;
  selRef.current = selected;

  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 3500); };

  // ---------- load ----------
  // Hindi typing is on for Hindi designs, otherwise it follows the last choice
  const initTyping = (d) => {
    let saved = null;
    try { saved = localStorage.getItem(TYPING_KEY); } catch { /* storage blocked */ }
    const hindiDesign = /-hi$|--hi|v2-hi/.test(d?.template || '') || (d?.elements || []).some((e) => e.type === 'text' && hasDeva(e.text));
    setHindiTyping(hindiDesign || saved === '1');
  };
  const toggleTyping = useCallback(() => setHindiTyping((v) => { try { localStorage.setItem(TYPING_KEY, v ? '0' : '1'); } catch { /* storage blocked */ } return !v; }), []);
  const typingCtx = useMemo(() => ({ on: hindiTyping, toggle: toggleTyping }), [hindiTyping, toggleTyping]);
  const swatchCtx = useMemo(() => ({ design: doc ? designColors(doc) : [], brand: brand.colors || [] }), [doc, brand]);

  const started = useRef(false);
  useEffect(() => {
    // Load once: saving rewrites the URL to /posters/<id>, which must not reload the page state
    if (started.current) return;
    started.current = true;
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setMe(d.user)).catch(() => setMe(null));
    (async () => {
      if (id !== 'new') {
        const r = await fetch(`/api/posters/${id}`);
        const d = await r.json().catch(() => ({}));
        if (!r.ok) return setLoadError(d.error || 'Could not open this design.');
        setDoc(normalize(d.poster));
        initTyping(d.poster);
        setPanel('details');
      } else {
        let draft = null;
        if (resume) try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch { /* no draft */ }
        const start = draft || (templateSlug ? posterFromTemplate(templateSlug, formatKey) : blankPoster(formatKey));
        setDoc(normalize(start));
        initTyping(start);
        setPanel(templateSlug || draft ? 'details' : 'templates');
        setStatus('local');
      }
      loaded.current = true;
    })();
  }, [id, templateSlug, formatKey, resume]);

  // ---------- history ----------
  const commit = useCallback((next, mergeKey) => {
    const now = Date.now();
    const m = lastMerge.current;
    if (!(mergeKey && m.key === mergeKey && now - m.t < 1000)) {
      past.current.push(docRef.current);
      if (past.current.length > 150) past.current.shift();
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
    dirty.current = true;
  }, []);
  const redo = useCallback(() => {
    if (!future.current.length) return;
    past.current.push(docRef.current);
    setDoc(future.current.pop());
    dirty.current = true;
  }, []);

  // ---------- element operations ----------
  const setEls = (elements, mk) => commit({ ...docRef.current, elements }, mk);
  const update = (eidv, patch, mk) => setEls(docRef.current.elements.map((e) => {
    if (e.id !== eidv) return e;
    const next = { ...e, ...patch };
    if (e.type === 'text' && patch.text !== undefined && hasDeva(patch.text) && !hasDeva(e.text) && !DEVA_FONTS.has(e.font) && !patch.font) next.font = DEVA_FOR[e.font] || 'Hind';
    if (e.type === 'text' && patch.text !== undefined && !hasDeva(patch.text) && hasDeva(e.text) && !patch.font && DEVA_TO_LATIN[e.font]) next.font = DEVA_TO_LATIN[e.font];
    return next;
  }), mk && `${eidv}.${mk}`);
  const add = (els) => {
    const list = (Array.isArray(els) ? els : [els]).map((e) => ({ ...e, id: e.id || eid() }));
    setEls([...docRef.current.elements, ...list]);
    setSelected(list.map((e) => e.id));
    setEditingId(null);
    setCropping(false);
    setMobilePanel(null);
  };
  const removeSel = () => {
    const sel = selRef.current;
    if (!sel.length) return;
    setEls(docRef.current.elements.filter((e) => !sel.includes(e.id)));
    setSelected([]);
  };
  const duplicateSel = (offset = 20) => {
    const copies = docRef.current.elements.filter((e) => selRef.current.includes(e.id)).map((e) => ({ ...clone(e), id: eid(), x: e.x + offset, y: e.y + offset, locked: false }));
    if (copies.length) add(copies);
  };
  const moveLayer = (eidv, dir) => {
    const els = [...docRef.current.elements];
    const i = els.findIndex((e) => e.id === eidv);
    const j = dir === 'front' ? els.length - 1 : dir === 'back' ? 0 : i + (dir === 'up' || dir === 1 ? 1 : -1);
    if (i < 0 || j < 0 || j >= els.length || i === j) return;
    const [el] = els.splice(i, 1);
    els.splice(j, 0, el);
    setEls(els);
  };
  const act = (kind, arg) => {
    const d = docRef.current;
    const sel = d.elements.filter((e) => selRef.current.includes(e.id));
    if (kind === 'delete') return removeSel();
    if (kind === 'duplicate') return duplicateSel();
    if (kind === 'layer') return sel.forEach((e) => moveLayer(e.id, arg));
    if (kind === 'lock') return setEls(d.elements.map((e) => (selRef.current.includes(e.id) ? { ...e, locked: true } : e)));
    if (kind === 'group' && sel.length > 1) { const gid = eid(); return setEls(d.elements.map((e) => (selRef.current.includes(e.id) ? { ...e, groupId: gid } : e))); }
    if (kind === 'ungroup') {
      const gids = new Set(sel.map((e) => e.groupId).filter(Boolean));
      return setEls(d.elements.map((e) => (gids.has(e.groupId) ? { ...e, groupId: undefined } : e)));
    }
    if (kind === 'copyStyle' && sel[0]) {
      styleClip.current = { type: sel[0].type, style: pickStyle(sel[0]) };
      return flash('Style copied. Select other items and press Paste style.');
    }
    if (kind === 'pasteStyle') {
      const c = styleClip.current;
      if (!c) return flash('Copy a style first.');
      return setEls(d.elements.map((e) => (selRef.current.includes(e.id) && (e.type === c.type || (STYLE_KEYS.common.some((k) => k in c.style))) ? { ...e, ...(e.type === c.type ? c.style : Object.fromEntries(STYLE_KEYS.common.filter((k) => k in c.style).map((k) => [k, c.style[k]]))) } : e)));
    }
    if (kind === 'editPoints' && sel[0]?.type === 'curve') { setEditPointsId(sel[0].id); return flash('Drag the points. Alt-click the curve to add one, double-click a point to remove it. Press Esc or Done when finished.'); }
    if (kind === 'match' && sel.length > 1) {
      const ref = d.elements.find((e) => e.id === selRef.current[0]) || sel[0];
      return setEls(d.elements.map((e) => (selRef.current.includes(e.id) && e.id !== ref.id ? { ...e, ...(arg !== 'h' && { w: ref.w }), ...(arg !== 'w' && { h: ref.h }) } : e)));
    }
    if (kind === 'align') {
      // one item: align to the page; several: align to their shared box
      const box = sel.length > 1
        ? { l: Math.min(...sel.map((e) => e.x)), r: Math.max(...sel.map((e) => e.x + e.w)), t: Math.min(...sel.map((e) => e.y)), b: Math.max(...sel.map((e) => e.y + e.h)) }
        : { l: 0, r: d.w, t: 0, b: d.h };
      const pos = (e) => ({
        left: { x: box.l }, center: { x: (box.l + box.r) / 2 - e.w / 2 }, right: { x: box.r - e.w },
        top: { y: box.t }, middle: { y: (box.t + box.b) / 2 - e.h / 2 }, bottom: { y: box.b - e.h },
      }[arg]);
      return setEls(d.elements.map((e) => (selRef.current.includes(e.id) && !e.locked ? { ...e, ...pos(e) } : e)));
    }
    if (kind === 'distribute' && sel.length > 2) {
      const k = arg === 'x' ? 'x' : 'y';
      const size = arg === 'x' ? 'w' : 'h';
      const sorted = [...sel].sort((a, b) => a[k] - b[k]);
      const start = sorted[0][k];
      const end = sorted[sorted.length - 1][k] + sorted[sorted.length - 1][size];
      const gap = (end - start - sorted.reduce((a, e) => a + e[size], 0)) / (sorted.length - 1);
      let at = start;
      const place = {};
      sorted.forEach((e) => { place[e.id] = at; at += e[size] + gap; });
      return setEls(d.elements.map((e) => (place[e.id] !== undefined ? { ...e, [k]: place[e.id] } : e)));
    }
  };

  // Change the page size and scale everything to fit
  const resize = (formatKeyv, W, H) => {
    commit(scaleDoc(docRef.current, formatKeyv, W, H));
    setFit(true);
  };

  // ---------- zoom ----------
  const fitZoom = useCallback(() => {
    const v = viewRef.current;
    const d = docRef.current;
    if (!v || !d) return;
    setZoom(Math.max(0.05, Math.min(2, (v.clientWidth - 80) / d.w, (v.clientHeight - 80) / d.h)));
  }, []);
  useEffect(() => {
    if (!fit || !doc) return;
    fitZoom();
    const ro = new ResizeObserver(fitZoom);
    if (viewRef.current) ro.observe(viewRef.current);
    return () => ro.disconnect();
  }, [fit, doc?.w, doc?.h, fitZoom]); // eslint-disable-line react-hooks/exhaustive-deps
  const zoomBy = (f) => { setFit(false); setZoom((z) => Math.max(0.05, Math.min(4, z * f))); };
  useEffect(() => {
    const v = viewRef.current;
    if (!v) return;
    const onWheel = (e) => {
      const sel = docRef.current?.elements.find((x) => x.id === selRef.current[0]);
      if (cropping && sel?.type === 'image') {
        e.preventDefault();
        update(sel.id, { zoom: Math.max(1, Math.min(4, (sel.zoom || 1) * (e.deltaY < 0 ? 1.06 : 0.94))) }, 'zoom');
      } else if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        zoomBy(e.deltaY < 0 ? 1.08 : 0.92);
      }
    };
    v.addEventListener('wheel', onWheel, { passive: false });
    return () => v.removeEventListener('wheel', onWheel);
  });

  // ---------- pointer interactions ----------
  const toDoc = (e) => {
    const r = pageRef.current.getBoundingClientRect();
    return { x: (e.clientX - r.left) / zoomRef.current, y: (e.clientY - r.top) / zoomRef.current };
  };
  const startDrag = (e, data) => {
    drag.current = { ...data, sx: e.clientX, sy: e.clientY, moved: false, base: docRef.current };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  };
  function onMove(e) {
    const d = drag.current;
    if (!d) return;
    const z = zoomRef.current;
    let dx = (e.clientX - d.sx) / z;
    let dy = (e.clientY - d.sy) / z;
    if (!d.moved) {
      if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 3) return;
      d.moved = true;
      if (d.mode !== 'marquee') {
        past.current.push(d.base);
        future.current = [];
        dirty.current = true;
        lastMerge.current = { key: null, t: 0 };
      }
    }
    const base = d.base;
    if (d.mode === 'marquee') {
      const p = toDoc(e);
      setMarquee({ x: Math.min(p.x, d.start.x), y: Math.min(p.y, d.start.y), w: Math.abs(p.x - d.start.x), h: Math.abs(p.y - d.start.y) });
      return;
    }
    if (d.mode === 'move') {
      const vw = viewSettings.current;
      if (!e.altKey && vw.snapGrid) {
        // grid snapping: the group's top-left corner lands on the grid
        const g = vw.gridSize;
        const l = Math.min(...d.orig.map((o) => o.x)) + dx;
        const t = Math.min(...d.orig.map((o) => o.y)) + dy;
        dx += Math.round(l / g) * g - l;
        dy += Math.round(t / g) * g - t;
        setGuides({ v: [], h: [] });
      } else if (!e.altKey && vw.snapObjects) {
        const ids = d.orig.map((o) => o.id);
        const box = { l: Math.min(...d.orig.map((o) => o.x)) + dx, r: Math.max(...d.orig.map((o) => o.x + o.w)) + dx, t: Math.min(...d.orig.map((o) => o.y)) + dy, b: Math.max(...d.orig.map((o) => o.y + o.h)) + dy };
        const s = snap(box, base.elements.filter((x) => !ids.includes(x.id) && !x.hidden), base.w, base.h, 6 / z);
        dx += s.dx;
        dy += s.dy;
        setGuides(s.guides);
      } else setGuides({ v: [], h: [] });
      const pos = Object.fromEntries(d.orig.map((o) => [o.id, { x: Math.round(o.x + dx), y: Math.round(o.y + dy) }]));
      setDoc({ ...base, elements: base.elements.map((x) => (pos[x.id] ? { ...x, ...pos[x.id] } : x)) });
      return;
    }
    const o = d.orig;
    let patch;
    if (d.mode === 'resize') {
      const th = ((o.rot || 0) * Math.PI) / 180;
      const cos = Math.cos(th);
      const sin = Math.sin(th);
      const lx = dx * cos + dy * sin;
      const ly = -dx * sin + dy * cos;
      const [hx, hy] = d.handle;
      let w = o.w + hx * lx;
      let h = o.h + hy * ly;
      const corner = hx && hy;
      const keep = corner && (o.keepRatio || e.shiftKey !== (o.type !== 'shape'));
      if (keep) {
        const k = Math.max(0.02, 1 + (hx * lx) / o.w / 2 + (hy * ly) / o.h / 2);
        w = o.w * k;
        h = o.h * k;
      }
      if (o.keepRatio && !corner) {
        if (hx) h = (w * o.h) / o.w;
        else w = (h * o.w) / o.h;
      }
      w = Math.max(8, w);
      h = Math.max(8, h);
      const dw = w - o.w;
      const dh = h - o.h;
      const cx = o.x + o.w / 2 + ((hx * dw) / 2) * cos - ((hy * dh) / 2) * sin;
      const cy = o.y + o.h / 2 + ((hx * dw) / 2) * sin + ((hy * dh) / 2) * cos;
      patch = { x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), w: Math.round(w), h: Math.round(h) };
      if (o.type === 'text' && keep) {
        const k = w / o.w;
        Object.assign(patch, { size: Math.max(4, Math.round(o.size * k * 10) / 10), ...(o.bgPad && { bgPad: o.bgPad * k }), ...(o.strokeW && { strokeW: o.strokeW * k }) });
      }
    } else if (d.mode === 'rotate') {
      const r = pageRef.current.getBoundingClientRect();
      const cx = r.left + (o.x + o.w / 2) * z;
      const cy = r.top + (o.y + o.h / 2) * z;
      let a = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;
      a = ((a % 360) + 360) % 360;
      if (e.shiftKey) a = Math.round(a / 15) * 15;
      else {
        const near = Math.round(a / 45) * 45;
        if (Math.abs(a - near) < 4) a = near;
      }
      patch = { rot: Math.round(a) % 360 };
    } else if (d.mode === 'crop') {
      const zz = o.zoom || 1;
      patch = { cropX: Math.max(0, Math.min(100, o.cropX - (dx / o.w) * 100 / zz)), cropY: Math.max(0, Math.min(100, o.cropY - (dy / o.h) * 100 / zz)) };
    }
    setDoc({ ...base, elements: base.elements.map((x) => (x.id === o.id ? { ...x, ...patch } : x)) });
  }
  function onUp() {
    window.removeEventListener('pointermove', onMove);
    const d = drag.current;
    drag.current = null;
    setGuides({ v: [], h: [] });
    if (d?.mode === 'marquee') {
      setMarquee((m) => {
        if (m && d.moved) {
          const hit = docRef.current.elements.filter((x) => !x.hidden && !x.locked && x.x < m.x + m.w && x.x + x.w > m.x && x.y < m.y + m.h && x.y + x.h > m.y).map((x) => x.id);
          setSelected(d.add ? [...new Set([...selRef.current, ...hit])] : hit);
        }
        return null;
      });
    }
  }

  // Elements whose box is mostly empty (curves, graphics, path shapes, cut-out photo slots) are only
  // hit where they are actually painted, so a click passes through their empty parts to what's below.
  const paintedOnly = (el) => el.type === 'graphic' || (el.type === 'shape' && !!SHAPES[el.shape]?.path) || (el.type === 'image' && !el.src && el.cutout);
  const pickAt = (x, y) => {
    const page = pageRef.current;
    if (!page) return null;
    const byId = new Map(docRef.current.elements.map((it) => [it.id, it]));
    for (const node of document.elementsFromPoint(x, y)) {
      const wrap = node.closest?.('[data-sid]');
      if (!wrap || !page.contains(wrap)) continue;
      const item = byId.get(wrap.getAttribute('data-sid'));
      if (!item || item.hidden) continue;
      if (paintedOnly(item)) {
        const svgPart = typeof SVGGraphicsElement !== 'undefined' && node instanceof SVGGraphicsElement && !(node instanceof SVGSVGElement) && node.tagName !== 'g';
        if (!svgPart) continue;
      }
      return item;
    }
    return null;
  };
  // What a click at this point means: the painted element under it, else the selected element if the
  // point is inside its box (so it can still be dragged by an empty corner), else nothing.
  const targetAt = (e) => {
    const hit = pickAt(e.clientX, e.clientY);
    if (hit) return hit;
    const cur = selRef.current.length === 1 && docRef.current.elements.find((x) => x.id === selRef.current[0]);
    if (cur) {
      const pt = toDoc(e);
      if (pt.x >= cur.x && pt.x <= cur.x + cur.w && pt.y >= cur.y && pt.y <= cur.y + cur.h) return cur;
    }
    return null;
  };
  const [hoverId, setHoverId] = useState(null);
  const hoverRaf = useRef(0);
  const onOverlayMove = (e) => {
    if (drag.current) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(hoverRaf.current);
    hoverRaf.current = requestAnimationFrame(() => setHoverId(pickAt(clientX, clientY)?.id || null));
  };

  const onElDown = (e) => {
    if (e.button === 1 || panning.current.space || panning.current.hand) { e.stopPropagation(); return startPan(e); }
    if (drawRef.current.on && e.button === 0) { e.stopPropagation(); return startStroke(e); }
    if (penRef.current && e.button === 0) { e.stopPropagation(); return addPenPoint(e); }
    if (e.button !== 0) return;
    const el = targetAt(e);
    if (!el) return onBackdropDown(e, true);
    e.stopPropagation();
    if (editingId === el.id) return;
    if (cropping && selRef.current[0] === el.id && el.type === 'image') return startDrag(e, { mode: 'crop', orig: el });
    let sel = selRef.current;
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      setSelected(sel.includes(el.id) ? sel.filter((x) => x !== el.id) : [...sel, el.id]);
      return;
    }
    if (!sel.includes(el.id)) {
      // clicking any member of a group selects the whole group
      sel = el.groupId ? docRef.current.elements.filter((x) => x.groupId === el.groupId && !x.hidden).map((x) => x.id) : [el.id];
      setSelected(sel);
      setCropping(false);
      setEditingId(null);
    }
    const orig = docRef.current.elements.filter((x) => sel.includes(x.id) && !x.locked).map((x) => ({ id: x.id, x: x.x, y: x.y, w: x.w, h: x.h }));
    if (orig.length) startDrag(e, { mode: 'move', orig });
  };
  const onElDouble = (e) => {
    if (penRef.current) return;
    const el = targetAt(e);
    if (!el || el.locked) return;
    setSelected([el.id]);
    if (el.type === 'text') setEditingId(el.id);
    if (el.type === 'image') { if (el.src) setCropping(true); else fillPhoto(el.id); }
  };
  // Hand tool: hold Space (or use the middle mouse button) and drag to move around
  const startPan = (e) => {
    const v = viewRef.current;
    if (!v) return;
    e.preventDefault();
    const sx = e.clientX;
    const sy = e.clientY;
    const l = v.scrollLeft;
    const t = v.scrollTop;
    const move = (ev) => { v.scrollLeft = l - (ev.clientX - sx); v.scrollTop = t - (ev.clientY - sy); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', () => window.removeEventListener('pointermove', move), { once: true });
  };
  // Curve pen: each click adds a point; Enter / double-click finishes, Esc cancels
  const addPenPoint = (e) => {
    e.preventDefault();
    const p = toDoc(e);
    const pts = penRef.current || [];
    const last = pts[pts.length - 1];
    if (last && Math.hypot(last.x - p.x, last.y - p.y) < 6 / zoomRef.current) return;
    setPenState([...pts, p]);
  };
  const startPen = () => { setSelected([]); setEditPointsId(null); setDrawState((d) => ({ ...d, on: false })); setPenState([]); };
  const finishPen = () => {
    const pts = penRef.current || [];
    setPenState(null);
    if (pts.length < 2) return;
    const d = docRef.current;
    const D = Math.min(d.w, d.h);
    const closedShape = pts.length > 3 && Math.hypot(pts[0].x - pts.at(-1).x, pts[0].y - pts.at(-1).y) < D * 0.04;
    const usePts = closedShape ? pts.slice(0, -1) : pts;
    const el = curveEl(d.w, d.h, usePts.map((p) => [p.x, p.y]), { mode: closedShape ? 'closed' : 'line', layers: [curveLayer({ color: '#2F5BFF', width: Math.round(D * 0.015), shadow: { on: true, x: 0, y: Math.round(D * 0.006), blur: Math.round(D * 0.012), color: '#000000', opacity: 30 } })] });
    add(el);
    flash('Curve added. Change it to a filled band, add layers and shadows on the right.');
  };
  // Point editing: drag a point of the curve being edited
  const curveLocal = (el, e) => {
    const r = pageRef.current.getBoundingClientRect();
    const z = zoomRef.current;
    const cx = r.left + (el.x + el.w / 2) * z;
    const cy = r.top + (el.y + el.h / 2) * z;
    const th = (-(el.rot || 0) * Math.PI) / 180;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const lx = (dx * Math.cos(th) - dy * Math.sin(th)) / z + el.w / 2;
    const ly = (dx * Math.sin(th) + dy * Math.cos(th)) / z + el.h / 2;
    return { x: (lx * (el.vw || el.w)) / el.w, y: (ly * (el.vh || el.h)) / el.h };
  };
  const dragPoint = (e, el, i) => {
    e.stopPropagation();
    e.preventDefault();
    commit({ ...docRef.current });
    const move = (ev) => {
      const q = curveLocal(el, ev);
      setDoc((d) => ({ ...d, elements: d.elements.map((x) => (x.id === el.id ? { ...x, points: x.points.map((p, k) => (k === i ? { x: Math.round(q.x), y: Math.round(q.y) } : p)) } : x)) }));
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', () => window.removeEventListener('pointermove', move), { once: true });
  };
  const addCurvePoint = (e, el) => {
    if (!e.altKey) return;
    e.stopPropagation();
    const q = curveLocal(el, e);
    const pts = el.points;
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    let best = pts.length;
    let cost = Infinity;
    const segs = el.mode === 'closed' ? pts.length : pts.length - 1;
    for (let i = 0; i < segs; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const c = dist(a, q) + dist(q, b) - dist(a, b);
      if (c < cost) { cost = c; best = i + 1; }
    }
    update(el.id, { points: [...pts.slice(0, best), { x: Math.round(q.x), y: Math.round(q.y) }, ...pts.slice(best)] });
  };
  const removeCurvePoint = (el, i) => {
    if (el.points.length <= 2) return;
    update(el.id, { points: el.points.filter((_, k) => k !== i) });
  };

  // Freehand drawing: collect points while dragging, then add the stroke as a layer
  const startStroke = (e) => {
    if (!pageRef.current) return;
    e.preventDefault();
    const pts = [toDoc(e)];
    setStroke(pts);
    const move = (ev) => { pts.push(toDoc(ev)); setStroke([...pts]); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', () => {
      window.removeEventListener('pointermove', move);
      setStroke(null);
      if (pts.length < 2) return;
      const dr = drawRef.current;
      const pad = dr.size;
      const minX = Math.min(...pts.map((p) => p.x)) - pad;
      const minY = Math.min(...pts.map((p) => p.y)) - pad;
      const w = Math.max(2 * pad, Math.max(...pts.map((p) => p.x)) + pad - minX);
      const h = Math.max(2 * pad, Math.max(...pts.map((p) => p.y)) + pad - minY);
      add({ id: eid(), type: 'path', x: Math.round(minX), y: Math.round(minY), w: Math.round(w), h: Math.round(h), vw: Math.round(w), vh: Math.round(h), rot: 0, opacity: 1, d: smoothPath(pts.map((p) => ({ x: p.x - minX, y: p.y - minY }))), color: dr.color, strokeW: dr.size, highlighter: dr.highlighter, name: dr.highlighter ? 'Highlighter' : 'Drawing' });
      setSelected([]);
    }, { once: true });
  };
  const onBackdropDown = (e, passThrough = false) => {
    if (e.button === 1 || panning.current.space || panning.current.hand) return startPan(e);
    if (drawRef.current.on && e.button === 0 && pageRef.current) { if (passThrough) e.stopPropagation(); return startStroke(e); }
    if (penRef.current && e.button === 0 && pageRef.current) { if (passThrough) e.stopPropagation(); return addPenPoint(e); }
    if (editPointsId) setEditPointsId(null);
    if (e.button !== 0 || !pageRef.current) return;
    if (passThrough) e.stopPropagation();
    else if (e.target.closest('[data-el],[data-handle],[data-editor]')) return;
    setEditingId(null);
    setCropping(false);
    setExportOpen(false);
    if (!e.shiftKey) setSelected([]);
    startDrag(e, { mode: 'marquee', start: toDoc(e), add: e.shiftKey });
  };

  // ---------- uploads (drop / paste) ----------
  const uploadAndAdd = async (files, at) => {
    const list = Array.from(files || []).filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    flash('Uploading…');
    try {
      const urls = await uploadFiles(list);
      rememberUploads(urls);
      const d = docRef.current;
      const s = Math.round(Math.min(d.w, d.h) * 0.5);
      add(urls.map((u, i) => imageEl(u, Math.round((at?.x ?? d.w / 2) - s / 2 + i * 24), Math.round((at?.y ?? d.h / 2) - s / 2 + i * 24), s, s)));
      setToast('');
    } catch (err) {
      flash(err.message || 'Upload failed.');
    }
  };
  const uploadBg = async (files) => {
    const f = Array.from(files || []).find((x) => x.type.startsWith('image/'));
    if (!f) return null;
    try {
      const [u] = await uploadFiles([f]);
      rememberUploads([u]);
      return u;
    } catch (err) {
      flash(err.message || 'Upload failed.');
      return null;
    }
  };

  // Fill a photo frame: pick a file, upload it, put it in the frame
  const fillPhoto = (id) => { fillTarget.current = id; fillRef.current?.click(); };
  const fillWith = async (id, files) => {
    const f = Array.from(files || []).find((x) => x.type.startsWith('image/'));
    if (!f || !id) return;
    flash('Uploading…');
    try {
      const [u] = await uploadFiles([f]);
      rememberUploads([u]);
      update(id, { src: u, cropX: 50, cropY: 50, zoom: 1 });
      setSelected([id]);
      setToast('');
    } catch (err) {
      flash(err.message || 'Upload failed.');
    }
  };
  // topmost visible photo frame under a point
  const imageAt = (pt) => [...docRef.current.elements].reverse().find((e) => e.type === 'image' && !e.hidden && !e.locked && pt.x >= e.x && pt.x <= e.x + e.w && pt.y >= e.y && pt.y <= e.y + e.h);

  // Render any design off-screen to a PNG file (Magic resize, Bulk create)
  const renderPng = (d, ratio = 1) => new Promise((resolve, reject) => { offResolve.current = { resolve, reject, ratio }; setOffDoc(d); });
  useEffect(() => {
    if (!offDoc) return;
    let stop = false;
    (async () => {
      const job = offResolve.current;
      try {
        await new Promise((r) => setTimeout(r, 60));
        const file = await designFile(offNode.current, offDoc, { ratio: job.ratio, name: offDoc.name });
        if (!stop) job.resolve(file);
      } catch (err) { job.reject(err); } finally { if (!stop) setOffDoc(null); }
    })();
    return () => { stop = true; };
  }, [offDoc]);
  const saveAsNew = async (d) => {
    const r = await fetch('/api/posters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: d.name, template: d.template, data: d }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || 'Could not save.');
    return j.id;
  };
  const withFont = (e, text) => {
    if (hasDeva(text) && !hasDeva(e.text) && !DEVA_FONTS.has(e.font)) return { ...e, text, font: DEVA_FOR[e.font] || 'Hind' };
    if (!hasDeva(text) && hasDeva(e.text) && DEVA_TO_LATIN[e.font]) return { ...e, text, font: DEVA_TO_LATIN[e.font] };
    return { ...e, text };
  };
  const setHand = (v) => { panning.current.hand = v; setHandState(v); if (v) setDrawState((d) => ({ ...d, on: false })); };
  const setDraw = (d) => { setDrawState(d); if (d.on) { setHand(false); setSelected([]); } };

  // Zoom so the selection (or the whole page) fills the view
  const zoomToSelection = () => {
    const d = docRef.current;
    const v = viewRef.current;
    if (!d || !v) return;
    const sel = d.elements.filter((x) => selRef.current.includes(x.id));
    const b = sel.length
      ? { x: Math.min(...sel.map((e) => e.x)), y: Math.min(...sel.map((e) => e.y)), r: Math.max(...sel.map((e) => e.x + e.w)), btm: Math.max(...sel.map((e) => e.y + e.h)) }
      : { x: 0, y: 0, r: d.w, btm: d.h };
    const nz = Math.max(0.05, Math.min(4, Math.min((v.clientWidth - 120) / (b.r - b.x), (v.clientHeight - 120) / (b.btm - b.y))));
    setFit(false);
    setZoom(nz);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const pr = pageRef.current?.getBoundingClientRect();
      const vr = v.getBoundingClientRect();
      if (!pr) return;
      v.scrollLeft += pr.left - vr.left + ((b.x + b.r) / 2) * nz - v.clientWidth / 2;
      v.scrollTop += pr.top - vr.top + ((b.y + b.btm) / 2) * nz - v.clientHeight / 2;
    }));
  };

  // Version history, kept on this device per design
  const versionKey = () => `folio_poster_versions_${posterIdRef.current || 'draft'}`;
  const readVersions = () => { try { return JSON.parse(localStorage.getItem(versionKey()) || '[]'); } catch { return []; } };
  const writeVersions = (list) => {
    let l = list;
    for (;;) {
      try { localStorage.setItem(versionKey(), JSON.stringify(l)); break; } catch { if (l.length <= 1) break; l = l.slice(0, -1); }
    }
    setVersionList(l);
  };
  const versions = {
    list: versionList,
    save: (name) => { writeVersions([{ id: eid(), name: name || `Version ${readVersions().length + 1}`, at: Date.now(), doc: docRef.current }, ...readVersions()].slice(0, 25)); flash('Version saved.'); },
    restore: (vid) => {
      const v = readVersions().find((x) => x.id === vid);
      if (!v) return;
      writeVersions([{ id: eid(), name: 'Before restoring', at: Date.now(), doc: docRef.current }, ...readVersions()].slice(0, 25));
      commit({ ...v.doc });
      setSelected([]);
      flash(`Restored “${v.name}”. You can undo this.`);
    },
    remove: (vid) => writeVersions(readVersions().filter((x) => x.id !== vid)),
  };
  useEffect(() => { if (panel === 'tools') setVersionList(readVersions()); }, [panel, posterId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- keyboard & clipboard ----------
  useEffect(() => {
    const typing = (t) => t.closest?.('input,textarea,select,[contenteditable]');
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      const k = e.key.toLowerCase();
      if (mod && k === 's') { e.preventDefault(); save(true); return; }
      if (mod && e.shiftKey && k === 'h') { e.preventDefault(); if (!typing(e.target)) toggleTyping(); return; }
      if (typing(e.target)) { if (e.key === 'Escape') e.target.blur(); return; }
      const sel = selRef.current;
      if (penRef.current) {
        if (e.key === 'Enter') { e.preventDefault(); finishPen(); return; }
        if (e.key === 'Escape') { e.preventDefault(); setPenState(null); return; }
        if (e.key === 'Backspace') { e.preventDefault(); setPenState(penRef.current.slice(0, -1)); return; }
      }
      if (editPointsId && (e.key === 'Escape' || e.key === 'Enter')) { e.preventDefault(); setEditPointsId(null); return; }
      if (e.key === ' ' && !e.repeat) { e.preventDefault(); panning.current.space = true; setSpaceDown(true); return; }
      if (mod && k === 'g') { e.preventDefault(); act(e.shiftKey ? 'ungroup' : 'group'); return; }
      if (mod && e.altKey && (e.code === 'KeyC' || e.code === 'KeyV')) { e.preventDefault(); act(e.code === 'KeyC' ? 'copyStyle' : 'pasteStyle'); return; }
      if (e.key === '?' || (e.shiftKey && e.code === 'Slash')) { e.preventDefault(); setShortcuts(true); return; }
      if (e.shiftKey && e.code === 'Digit2') { e.preventDefault(); zoomToSelection(); return; }
      if (mod && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if (mod && k === 'y') { e.preventDefault(); redo(); }
      else if (mod && k === 'a') { e.preventDefault(); setSelected(docRef.current.elements.filter((x) => !x.hidden && !x.locked).map((x) => x.id)); }
      else if (mod && k === 'd') { e.preventDefault(); duplicateSel(); }
      else if (mod && (k === 'c' || k === 'x') && sel.length) {
        clip.current = clone(docRef.current.elements.filter((x) => sel.includes(x.id)));
        if (k === 'x') removeSel();
      }
      else if (mod && (k === '=' || k === '+')) { e.preventDefault(); zoomBy(1.2); }
      else if (mod && k === '-') { e.preventDefault(); zoomBy(1 / 1.2); }
      else if (mod && k === '0') { e.preventDefault(); setFit(true); fitZoom(); }
      else if (mod && (k === ']' || k === '[')) { e.preventDefault(); act('layer', k === ']' ? (e.shiftKey ? 'front' : 'up') : e.shiftKey ? 'back' : 'down'); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && sel.length) { e.preventDefault(); removeSel(); }
      else if (e.key.startsWith('Arrow') && sel.length) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const [ddx, ddy] = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
        setEls(docRef.current.elements.map((x) => (sel.includes(x.id) && !x.locked ? { ...x, x: x.x + ddx, y: x.y + ddy } : x)), 'nudge');
      }
      else if (e.key === 'Enter' && sel.length === 1) {
        const el = docRef.current.elements.find((x) => x.id === sel[0]);
        if (el?.type === 'text' && !el.locked) { e.preventDefault(); setEditingId(el.id); }
      }
      else if (e.key === 'Escape') { if (cropping) setCropping(false); else { setSelected([]); setExportOpen(false); } }
    };
    const onPaste = (e) => {
      if (typing(e.target)) return;
      const files = Array.from(e.clipboardData?.files || []).filter((f) => f.type.startsWith('image/'));
      if (files.length) { e.preventDefault(); uploadAndAdd(files); return; }
      if (clip.current?.length) { e.preventDefault(); add(clip.current.map((x) => ({ ...clone(x), id: eid(), x: x.x + 20, y: x.y + 20 }))); clip.current = clip.current.map((x) => ({ ...x, x: x.x + 20, y: x.y + 20 })); }
    };
    const onKeyUp = (e) => { if (e.key === ' ') { panning.current.space = false; setSpaceDown(false); } };
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('keydown', onKey);
    window.addEventListener('paste', onPaste);
    return () => { window.removeEventListener('keyup', onKeyUp); window.removeEventListener('keydown', onKey); window.removeEventListener('paste', onPaste); };
  });

  // ---------- saving ----------
  const createOnServer = useCallback(async () => {
    if (creating.current) return creating.current;
    creating.current = (async () => {
      const d = docRef.current;
      const r = await fetch('/api/posters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: d.name, template: d.template, data: d }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      posterIdRef.current = j.id;
      setPosterId(j.id);
      localStorage.removeItem(DRAFT_KEY);
      window.history.replaceState(null, '', `/posters/${j.id}`);
      return j.id;
    })();
    try { return await creating.current; } finally { creating.current = null; }
  }, []);

  const save = useCallback(async (manual = false) => {
    const d = docRef.current;
    if (!d) return null;
    const pid = posterIdRef.current;
    try {
      if (!pid) {
        if (creating.current) { await creating.current; return save(manual); }
        try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch { /* storage full */ }
        if (!me) { setStatus('local'); if (manual) flash('Saved on this device. Log in to keep it in your account.'); return null; }
        if (!manual && !dirty.current) { setStatus('new'); return null; }
        setStatus('saving');
        const nid = await createOnServer();
        setStatus('saved');
        return nid;
      }
      setStatus('saving');
      const r = await fetch(`/api/posters/${pid}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: d.name, data: d }) });
      if (!r.ok) throw new Error((await r.json()).error);
      setStatus('saved');
      return pid;
    } catch (err) {
      setStatus('error');
      if (manual) flash(err.message || 'Could not save. Check your connection.');
      return null;
    }
  }, [me, createOnServer]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loaded.current || !doc || me === undefined) return;
    if (posterId && !dirty.current) return;
    if (drag.current) return;
    setStatus((s) => (s === 'saving' ? s : posterId || me ? 'unsaved' : 'local'));
    const t = setTimeout(() => save(false), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, me]);

  // ---------- download ----------
  function startDownload() {
    if (!me) {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(docRef.current)); } catch { /* storage full */ }
      router.push(`/login?next=${encodeURIComponent('/posters/new?resume=1')}`);
      return;
    }
    setExportOpen(false);
    setSelected([]);
    setEditingId(null);
    setCropping(false);
    setExporting({ ...exportOpts });
    save(true);
    const empty = docRef.current.elements.filter((e) => e.type === 'image' && !e.src && !e.hidden).length;
    if (empty) setTimeout(() => flash(`${empty} empty photo frame${empty > 1 ? 's were' : ' was'} left out of the file.`), 4000);
  }
  function startShare() {
    if (!me) return startDownload();
    setExportOpen(false);
    setSelected([]);
    setEditingId(null);
    setExporting({ ...exportOpts, share: true });
  }
  async function shareNow() {
    const file = shareFile;
    setShareFile(null);
    try {
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: docRef.current.name });
      else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = file.name;
        a.click();
        flash('Sharing isn’t available in this browser, so the image was downloaded instead.');
      }
    } catch { /* share cancelled */ }
  }
  useEffect(() => {
    if (!exporting) return;
    let cancelled = false;
    (async () => {
      try {
        await new Promise((r) => setTimeout(r, 80));
        if (cancelled || !exportNodeRef.current) return;
        if (exporting.share) setShareFile(await designFile(exportNodeRef.current, docRef.current, { ratio: exporting.ratio, name: docRef.current.name }));
        else {
          await exportDesign(exportNodeRef.current, docRef.current, { type: exporting.type, ratio: exporting.ratio, name: docRef.current.name, bleed: exporting.bleed });
          flash(`Downloaded as ${exporting.type.toUpperCase()}.`);
        }
      } catch (err) {
        console.error(err);
        flash('Could not create the file. If you used a photo from another website, upload it instead and try again.');
      } finally {
        if (!cancelled) setExporting(null);
      }
    })();
    return () => { cancelled = true; };
  }, [exporting]);

  if (loadError)
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <p className="text-lg font-semibold">{loadError}</p>
          <NextLink href="/posters" className="btn-primary mt-4">Back to poster templates</NextLink>
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
    ['details', PenLine, 'Edit'],
    ['curve', Spline, 'Curve'],
    ['tools', Wrench, 'Tools'],
    ['templates', LayoutTemplate, 'Designs'],
    ['text', Type, 'Text'],
    ['shapes', Shapes, 'Shapes'],
    ['graphics', Sparkles, 'Graphics'],
    ['icons', Smile, 'Icons'],
    ['stickers', Sticker, 'Stickers'],
    ['photos', ImageIcon, 'Photos'],
    ['layers', Layers, 'Layers'],
  ];
  const applyTemplate = (d) => {
    if (doc.elements.length && !confirm('Replace this page with the design? You can undo this.')) return;
    commit({ ...doc, ...d, w: doc.w, h: doc.h, format: doc.format });
    setSelected([]);
  };
  // Everything the sidebar tools can use
  const toolsApi = {
      doc, selEls: doc.elements.filter((e) => selected.includes(e.id)), add, update, setDoc: (d) => commit(d), act, select: setSelected, flash,
      view, setView, brand, setBrand, versions, renderPng, saveAsNew, withFont, draw, setDraw, hand, setHand, startPen,
      openMockup: () => setMockup(true), openShortcuts: () => setShortcuts(true), openCopyPhoto: () => setCopyOpen(true), zoomToSelection,
      openDownload: (o) => { setExportOpts((x) => ({ ...x, ...o })); setExportOpen(true); },
    };
  const panelBody = {
    templates: <TemplatesPanel doc={doc} onApply={applyTemplate} />,
    text: <TextPanel doc={doc} add={add} />,
    shapes: <ShapesPanel doc={doc} add={add} />,
    graphics: <GraphicsPanel doc={doc} add={add} />,
    details: <DetailsPanel doc={doc} update={update} select={setSelected} fillPhoto={fillPhoto} />,
    icons: <IconsPanel doc={doc} add={add} />,
    stickers: <StickersPanel doc={doc} add={add} />,
    photos: <PhotosPanel doc={doc} add={add} uploadRef={uploadRef} />,
    tools: <ToolsPanel api={toolsApi} />,
    curve: <div className="space-y-2.5 p-4"><p className="text-sm font-bold">Curve designer</p><CurveDesigner api={toolsApi} /></div>,
    layers: <LayersPanel doc={doc} selected={selected} select={setSelected} update={(i, p) => update(i, p)} move={(i, dir) => moveLayer(i, dir)} />,
  }[panel];

  const z = zoom;
  const selEls = doc.elements.filter((e) => selected.includes(e.id) && !e.hidden);
  const single = selEls.length === 1 ? selEls[0] : null;
  const editEl = doc.elements.find((e) => e.id === editingId);
  const outW = Math.round(doc.w * safeRatio(doc, exportOpts.ratio));
  const outH = Math.round(doc.h * safeRatio(doc, exportOpts.ratio));

  return (
    <HindiTypingContext.Provider value={typingCtx}>
    <SwatchContext.Provider value={swatchCtx}>
    <div className="flex h-screen flex-col overflow-hidden bg-paper">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-white px-3">
        <NextLink href={me ? '/dashboard' : '/posters'} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-signal text-white" aria-label="Back">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M6 4h12M6 4v16M6 12h8" /></svg>
        </NextLink>
        <button className="btn-ghost px-2 lg:hidden" onClick={() => setMobilePanel(mobilePanel === 'left' ? null : 'left')} aria-label="Tools"><Menu size={18} /></button>
        <input value={doc.name} onChange={(e) => commit({ ...doc, name: e.target.value }, 'name')} className="hidden w-48 rounded-md border border-transparent px-2 py-1 font-semibold hover:border-line focus:border-signal focus:outline-none md:block" aria-label="Design name" />
        <span className="hidden items-center gap-1 text-xs text-mute sm:flex">{statusUi[0]} {statusUi[1]}</span>
        <TypingSwitch on={hindiTyping} toggle={toggleTyping} />
        <div className="ml-1 flex">
          <button onClick={undo} disabled={!past.current.length} className="btn-ghost px-2" aria-label="Undo" title="Undo (Ctrl/⌘ Z)"><Undo2 size={16} /></button>
          <button onClick={redo} disabled={!future.current.length} className="btn-ghost px-2" aria-label="Redo" title="Redo (Ctrl/⌘ Shift Z)"><Redo2 size={16} /></button>
        </div>
        <div className="mx-auto hidden items-center gap-1 md:flex">
          <button onClick={() => zoomBy(1 / 1.2)} className="btn-ghost px-2" aria-label="Zoom out"><Minus size={15} /></button>
          <button onClick={() => { setFit(true); fitZoom(); }} className="w-16 rounded-md py-1 text-center text-xs font-semibold hover:bg-paper" title="Fit to screen">{Math.round(z * 100)}%</button>
          <button onClick={() => zoomBy(1.2)} className="btn-ghost px-2" aria-label="Zoom in"><Plus size={15} /></button>
          <button onClick={zoomToSelection} className="btn-ghost px-2" aria-label="Zoom to selection" title="Zoom to selection (Shift + 2)"><Focus size={15} /></button>
          <span className="ml-1 text-xs text-mute">{doc.w}×{doc.h}</span>
        </div>
        <div className="relative ml-auto flex items-center gap-2 md:ml-0">
          <button className="btn-ghost px-2 lg:hidden" onClick={() => setMobilePanel(mobilePanel === 'right' ? null : 'right')} aria-label="Settings"><PanelRight size={18} /></button>
          <button onClick={() => setShortcuts(true)} className="btn-ghost hidden px-2 xl:inline-flex" aria-label="Keyboard shortcuts" title="Keyboard shortcuts (?)"><Keyboard size={16} /></button>
          <button onClick={() => setMockup(true)} className="btn-light hidden sm:inline-flex" title="See it as a WhatsApp status, Instagram post or print"><Smartphone size={16} /> <span className="hidden lg:inline">Mockup</span></button>
          <button onClick={() => setExportOpen(!exportOpen)} disabled={!!exporting} className="btn-primary" aria-expanded={exportOpen}>
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} <span className="hidden sm:inline">Download</span>
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-11 z-50 w-72 rounded-xl border border-line bg-white p-4 shadow-2xl">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-mute">File type</p>
              <div className="space-y-1.5">
                {[['png', 'PNG', 'Best quality, for social media and WhatsApp'], ['jpg', 'JPG', 'Smaller file, good for sharing'], ['pdf', 'PDF', 'For printing (real paper size)']].map(([v, l, d]) => (
                  <label key={v} className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2 ${exportOpts.type === v ? 'border-signal bg-signal-soft' : 'border-line'}`}>
                    <input type="radio" name="ftype" className="mt-1" checked={exportOpts.type === v} onChange={() => setExportOpts({ ...exportOpts, type: v })} />
                    <span><span className="block text-sm font-semibold">{l}</span><span className="block text-xs text-mute">{d}</span></span>
                  </label>
                ))}
              </div>
              <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-mute">{exportOpts.type === 'pdf' ? 'Print quality' : 'Size'}</p>
              <div className="grid grid-cols-3 gap-1">
                {[[1, '1×'], [2, '2×'], [3, '3×']].map(([v, l]) => (
                  <button key={v} type="button" onClick={() => setExportOpts({ ...exportOpts, ratio: v })} className={`rounded-md border py-1 text-sm font-semibold ${exportOpts.ratio === v ? 'border-signal bg-signal-soft' : 'border-line text-mute'}`}>{l}</button>
                ))}
              </div>
              <p className="mt-1 text-xs text-mute">{outW} × {outH} px</p>
              {exportOpts.type === 'pdf' && (
                <label className="mt-3 flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-1" checked={exportOpts.bleed} onChange={(e) => setExportOpts({ ...exportOpts, bleed: e.target.checked })} />
                  <span>Print-ready: 3 mm bleed + crop marks<span className="block text-xs text-mute">For printing shops that trim the paper</span></span>
                </label>
              )}
              {exportOpts.type === 'png' && (
                <label className="mt-3 flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={exportOpts.transparent} onChange={(e) => setExportOpts({ ...exportOpts, transparent: e.target.checked })} /> Transparent background
                </label>
              )}
              <button onClick={startDownload} className="btn-primary mt-4 w-full"><Download size={16} /> Download {exportOpts.type.toUpperCase()}</button>
              <button onClick={startShare} className="btn-light mt-2 w-full"><Share2 size={16} /> Share (WhatsApp, Instagram…)</button>
              {!me && <p className="mt-2 text-center text-xs text-mute">You’ll be asked to log in first. Your design is kept.</p>}
            </div>
          )}
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <aside className={`${mobilePanel === 'left' ? 'absolute inset-y-0 left-0 z-30 flex shadow-2xl' : 'hidden'} shrink-0 border-r border-line bg-paper lg:static lg:flex lg:shadow-none`}>
          <nav className="flex w-[72px] flex-col gap-1 border-r border-line bg-white py-2" role="tablist" aria-label="Tools">
            {tabs.map(([k, Icon, l]) => (
              <button key={k} role="tab" aria-selected={panel === k} onClick={() => setPanel(k)} className={`relative mx-1.5 flex flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-semibold ${panel === k ? 'bg-signal-soft text-ink' : k === 'tools' ? 'text-signal hover:bg-signal-soft' : 'text-mute hover:bg-paper hover:text-ink'}`}>
                {k === 'tools' && <span className="absolute right-0.5 top-0.5 rounded-full bg-signal px-1 text-[8px] font-bold leading-[14px] text-white">{TOOL_COUNT}</span>}
                <Icon size={19} /> {l}
              </button>
            ))}
          </nav>
          <div className="thin-scroll w-[280px] overflow-y-auto">{panelBody}</div>
        </aside>

        <main
          ref={viewRef}
          className={`thin-scroll relative min-w-0 flex-1 overflow-auto bg-[#E7EBF2] ${spaceDown || hand ? 'cursor-grab [&_*]:!cursor-grab' : draw.on || pen ? 'cursor-crosshair [&_*]:!cursor-crosshair' : ''}`}
          onPointerDown={onBackdropDown}
          onDoubleClick={() => { if (penRef.current) finishPen(); }}
          onDragOver={(e) => { if (Array.from(e.dataTransfer.types).includes('Files')) e.preventDefault(); }}
          onDrop={(e) => {
            e.preventDefault();
            if (!pageRef.current) return;
            const pt = toDoc(e);
            const target = imageAt(pt);
            if (target) fillWith(target.id, e.dataTransfer.files);
            else uploadAndAdd(e.dataTransfer.files, pt);
          }}
        >
          <div className="flex min-h-full min-w-full items-center justify-center p-10" style={{ width: 'max-content' }}>
            <div ref={pageRef} className="relative shadow-[0_20px_60px_-20px_rgba(22,33,62,.45)]" style={{ width: doc.w * z, height: doc.h * z }}>
              <Stage doc={doc} scale={z} editingId={editingId} editor />
              {view.grid && (
                <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(47,91,255,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(47,91,255,.22) 1px, transparent 1px)', backgroundSize: `${view.gridSize * z}px ${view.gridSize * z}px` }} />
              )}
              {view.rulers && <Rulers w={doc.w} h={doc.h} z={z} />}
              <div className="absolute inset-0">
                {doc.elements.map((el) => (el.hidden ? null : (
                  <div
                    key={el.id}
                    data-el={el.id}
                    onPointerDown={onElDown}
                    onPointerMove={onOverlayMove}
                    onPointerLeave={() => setHoverId(null)}
                    onDoubleClick={onElDouble}
                    className="absolute"
                    style={{ left: el.x * z, top: el.y * z, width: el.w * z, height: el.h * z, transform: `rotate(${el.rot || 0}deg)`, cursor: cropping && single?.id === el.id ? 'grab' : hoverId === el.id && !el.locked ? 'move' : 'default' }}
                  >
                    {hoverId === el.id && !selected.includes(el.id) && <div className="pointer-events-none absolute inset-0 outline outline-1 outline-signal/70" />}
                  </div>
                )))}
                {selEls.map((el) => (
                  <div key={`s-${el.id}`} className="pointer-events-none absolute" style={{ left: el.x * z, top: el.y * z, width: el.w * z, height: el.h * z, transform: `rotate(${el.rot || 0}deg)`, outline: `2px solid ${el.locked ? '#F59E0B' : '#2F5BFF'}`, outlineOffset: 1 }}>
                    {single && !el.locked && !cropping && editingId !== el.id && (
                      <>
                        {HANDLES.map(([hx, hy]) => (
                          <span
                            key={`${hx},${hy}`}
                            data-handle
                            onPointerDown={(e) => { e.stopPropagation(); startDrag(e, { mode: 'resize', handle: [hx, hy], orig: { ...el } }); }}
                            className="pointer-events-auto absolute rounded-full border-2 border-signal bg-white shadow"
                            style={{ width: hx && hy ? 12 : 10, height: hx && hy ? 12 : 10, left: `calc(${(hx + 1) * 50}% - ${hx && hy ? 6 : 5}px)`, top: `calc(${(hy + 1) * 50}% - ${hx && hy ? 6 : 5}px)`, cursor: CURSORS[`${hx},${hy}`] }}
                          />
                        ))}
                        <span className="pointer-events-none absolute left-1/2 top-[-26px] h-[20px] w-px bg-signal" />
                        <span
                          data-handle
                          title="Rotate (hold Shift for 15° steps)"
                          onPointerDown={(e) => { e.stopPropagation(); startDrag(e, { mode: 'rotate', orig: { ...el } }); }}
                          className="pointer-events-auto absolute left-1/2 top-[-36px] grid h-5 w-5 -translate-x-1/2 cursor-grab place-items-center rounded-full border-2 border-signal bg-white text-[10px] text-signal shadow"
                        >↻</span>
                      </>
                    )}
                  </div>
                ))}
                {guides.v.map((x) => <div key={`v${x}`} className="pointer-events-none absolute inset-y-0 w-px bg-pink-500" style={{ left: x * z }} />)}
                {guides.h.map((y) => <div key={`h${y}`} className="pointer-events-none absolute inset-x-0 h-px bg-pink-500" style={{ top: y * z }} />)}
                {stroke && (
                  <svg className="pointer-events-none absolute inset-0 h-full w-full" style={{ overflow: 'visible' }}>
                    <polyline points={stroke.map((p) => `${p.x * z},${p.y * z}`).join(' ')} fill="none" stroke={draw.color} strokeWidth={draw.size * z} strokeLinecap="round" strokeLinejoin="round" opacity={draw.highlighter ? 0.45 : 1} />
                  </svg>
                )}
                {pen && (
                  <svg className="pointer-events-none absolute inset-0 h-full w-full" style={{ overflow: 'visible' }}>
                    {pen.length > 1 && <path d={smoothThrough(pen.map((p) => ({ x: p.x * z, y: p.y * z })), 0.5)} fill="none" stroke="#2F5BFF" strokeWidth="3" strokeDasharray="8 5" />}
                    {pen.map((p, i) => <circle key={i} cx={p.x * z} cy={p.y * z} r={i === 0 ? 7 : 5} fill={i === 0 ? '#2F5BFF' : '#FFFFFF'} stroke="#2F5BFF" strokeWidth="2" />)}
                  </svg>
                )}
                {(() => {
                  const el = editPointsId && doc.elements.find((x) => x.id === editPointsId);
                  if (!el) return null;
                  const sx = el.w / (el.vw || el.w);
                  const sy = el.h / (el.vh || el.h);
                  return (
                    <div data-handle className="absolute" style={{ left: el.x * z, top: el.y * z, width: el.w * z, height: el.h * z, transform: `rotate(${el.rot || 0}deg)`, outline: '1px dashed #2F5BFF', cursor: 'copy' }} onPointerDown={(e) => addCurvePoint(e, el)} title="Alt-click to add a point">
                      <svg className="pointer-events-none absolute inset-0 h-full w-full" style={{ overflow: 'visible' }}>
                        <polyline points={el.points.map((p) => `${p.x * sx * z},${p.y * sy * z}`).join(' ')} fill="none" stroke="#2F5BFF" strokeWidth="1" strokeDasharray="4 4" />
                      </svg>
                      {el.points.map((p, i) => (
                        <span
                          key={i}
                          data-handle
                          onPointerDown={(e) => dragPoint(e, el, i)}
                          onDoubleClick={(e) => { e.stopPropagation(); removeCurvePoint(el, i); }}
                          title="Drag to move · double-click to remove"
                          className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 cursor-move rounded-full border-2 border-signal bg-white shadow"
                          style={{ left: p.x * sx * z, top: p.y * sy * z }}
                        />
                      ))}
                    </div>
                  );
                })()}
                {marquee && <div className="pointer-events-none absolute border border-signal bg-signal/10" style={{ left: marquee.x * z, top: marquee.y * z, width: marquee.w * z, height: marquee.h * z }} />}
                {editEl && (
                  <div data-editor className="absolute" style={{ left: editEl.x * z, top: editEl.y * z, width: editEl.w * z, height: editEl.h * z, transform: `rotate(${editEl.rot || 0}deg)` }} onPointerDown={(e) => e.stopPropagation()}>
                    <HinglishTextarea
                      ref={inlineRef}
                      autoFocus
                      value={editEl.text}
                      onFocus={(e) => e.target.select()}
                      onChange={(v) => update(editEl.id, { text: v, h: Math.max(editEl.h, inlineRef.current?.scrollHeight || 0) }, 'text')}
                      barClassName="absolute left-0 top-full z-50 mt-2 w-max max-w-[460px]"
                      onBlur={() => setEditingId(null)}
                      aria-label="Edit text"
                      style={{
                        width: editEl.w, height: editEl.h, transform: `scale(${z})`, transformOrigin: '0 0', resize: 'none', overflow: 'hidden', border: 0, outline: '2px dashed #2F5BFF', background: 'rgba(255,255,255,0.06)',
                        padding: editEl.bgColor ? editEl.bgPad || 0 : 0, margin: 0, fontFamily: fontStack(editEl.font), fontSize: editEl.size, fontWeight: editEl.weight, fontStyle: editEl.italic ? 'italic' : 'normal',
                        textAlign: editEl.align, lineHeight: editEl.lh, letterSpacing: `${editEl.ls || 0}em`, textTransform: editEl.upper ? 'uppercase' : 'none',
                        color: !editEl.color || editEl.color === 'transparent' ? editEl.stroke || '#111111' : editEl.color, caretColor: '#2F5BFF', whiteSpace: 'pre-wrap',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          {cropping && single?.type === 'image' && (
            <div className="pointer-events-auto fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-xl">
              Drag to move the photo · scroll to zoom
              <button onClick={() => setCropping(false)} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink">Done</button>
            </div>
          )}
        </main>

        <aside className={`${mobilePanel === 'right' ? 'absolute inset-y-0 right-0 z-30 flex shadow-2xl' : 'hidden'} w-[300px] shrink-0 flex-col border-l border-line bg-paper lg:static lg:flex lg:shadow-none`}>
          <div className="flex items-center justify-between border-b border-line bg-white px-4 py-2 lg:hidden">
            <span className="text-sm font-semibold">Settings</span>
            <button onClick={() => setMobilePanel(null)} className="btn-ghost px-2" aria-label="Close"><X size={16} /></button>
          </div>
          <div className="thin-scroll flex-1 overflow-y-auto">
            <Inspector doc={doc} selected={selected} update={update} act={act} setDoc={commit} resize={resize} cropping={cropping} setCropping={setCropping} uploadBg={uploadBg} />
          </div>
          <p className="border-t border-line px-4 py-2 text-[11px] text-mute">Double-click text to type · Shift-click to select several · Arrow keys nudge · Ctrl/⌘ D duplicates</p>
        </aside>
      </div>

      <input ref={fillRef} type="file" accept="image/*" hidden onChange={(e) => { fillWith(fillTarget.current, e.target.files); e.target.value = ''; }} />
      {shareFile && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <p className="text-lg font-bold">Your image is ready</p>
            <p className="mt-1 text-sm text-mute">Share it to WhatsApp, Instagram or any app on this device.</p>
            <button onClick={shareNow} className="btn-primary mt-4 w-full"><Share2 size={16} /> Share now</button>
            <button onClick={() => setShareFile(null)} className="btn-ghost mt-2 w-full">Cancel</button>
          </div>
        </div>
      )}
      {toast && <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-xl">{toast}</div>}

      {(pen || editPointsId) && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-xl">
          {pen ? <>〰️ Click to add points ({pen.length}) · Backspace undoes a point</> : <>〰️ Editing curve points</>}
          {pen && <button onClick={finishPen} disabled={pen.length < 2} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink disabled:opacity-50">Finish</button>}
          <button onClick={() => { if (pen) setPenState(null); else setEditPointsId(null); }} className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">{pen ? 'Cancel' : 'Done'}</button>
        </div>
      )}
      {(draw.on || hand) && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-xl">
          {draw.on ? <>✏️ Drawing: drag on the page</> : <>✋ Hand tool: drag to move around</>}
          <button onClick={() => (draw.on ? setDraw({ ...draw, on: false }) : setHand(false))} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink">Done</button>
        </div>
      )}
      {offDoc && (
        <div aria-hidden style={{ position: 'fixed', left: -100000, top: 0, pointerEvents: 'none' }}>
          <Stage doc={offDoc} scale={1} stageRef={offNode} hideEmpty />
        </div>
      )}
      {exporting && (
        <div aria-hidden style={{ position: 'fixed', left: -100000, top: 0, pointerEvents: 'none' }}>
          <Stage doc={doc} scale={1} transparent={exporting.transparent} stageRef={exportNodeRef} hideEmpty />
        </div>
      )}
    </div>
      {mockup && <Mockup doc={doc} name={doc.name} onClose={() => setMockup(false)} />}
      {copyOpen && (
        <CopyFromPhoto
          hasContent={doc.elements.length > 0}
          onClose={() => setCopyOpen(false)}
          onDone={(d) => { commit({ ...docRef.current, ...d }); setSelected([]); setCopyOpen(false); setFit(true); setPanel('details'); flash('Design copied. Check the text and fix any positions; the original is in Layers as a hidden guide.'); }}
        />
      )}
      {shortcuts && <ShortcutsDialog onClose={() => setShortcuts(false)} />}
    </SwatchContext.Provider>
    </HindiTypingContext.Provider>
  );
}

// Pixel rulers along the top and left edge of the page
function Rulers({ w, h, z }) {
  const step = [10, 25, 50, 100, 200, 500, 1000].find((st) => st * z >= 40) || 1000;
  const ticks = (len) => Array.from({ length: Math.floor(len / step) + 1 }, (_, i) => i * step);
  return (
    <>
      <div className="pointer-events-none absolute -top-5 left-0 h-5 border-b border-line bg-white/90 text-[9px] text-mute" style={{ width: w * z }}>
        {ticks(w).map((x) => <span key={x} className="absolute bottom-0 border-l border-mute/60 pl-0.5" style={{ left: x * z, height: x % (step * 2) ? 6 : 12 }}>{x % (step * 2) ? '' : x}</span>)}
      </div>
      <div className="pointer-events-none absolute -left-5 top-0 w-5 border-r border-line bg-white/90 text-[9px] text-mute" style={{ height: h * z }}>
        {ticks(h).map((y) => <span key={y} className="absolute right-0 border-t border-mute/60" style={{ top: y * z, width: y % (step * 2) ? 6 : 12 }}><span className="absolute -left-4 top-0 -rotate-90 origin-bottom-right">{y % (step * 2) ? '' : y}</span></span>)}
      </div>
    </>
  );
}

const SHORTCUTS = [
  ['Undo / redo', 'Ctrl/⌘ Z · Ctrl/⌘ Shift Z'], ['Save', 'Ctrl/⌘ S'], ['Duplicate', 'Ctrl/⌘ D'], ['Copy / cut / paste', 'Ctrl/⌘ C · X · V'],
  ['Select all', 'Ctrl/⌘ A'], ['Delete', 'Delete / Backspace'], ['Move 1px / 10px', 'Arrow keys · Shift + arrows'], ['Group / ungroup', 'Ctrl/⌘ G · Ctrl/⌘ Shift G'],
  ['Copy / paste style', 'Ctrl/⌘ Alt C · Ctrl/⌘ Alt V'], ['Bring forward / send back', 'Ctrl/⌘ ] · Ctrl/⌘ ['], ['To front / to back', 'Ctrl/⌘ Shift ] · ['],
  ['Zoom in / out / fit', 'Ctrl/⌘ + · − · 0'], ['Zoom to selection', 'Shift 2'], ['Move around (hand tool)', 'Hold Space and drag'], ['Edit text', 'Double-click or Enter'],
  ['Crop photo', 'Double-click the photo'], ['Snap off while dragging', 'Hold Alt'], ['Keep proportions while resizing', 'Shift + corner'], ['Hindi typing on/off', 'Ctrl/⌘ Shift H'],
  ['Select several', 'Shift-click or drag a box'], ['This list', '?'],
];
function ShortcutsDialog({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" onClick={onClose}>
      <div className="max-h-full w-full max-w-lg overflow-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-bold">Keyboard shortcuts</h2><button onClick={onClose} className="btn-ghost px-2" aria-label="Close"><X size={18} /></button></div>
        <dl className="divide-y divide-line text-sm">
          {SHORTCUTS.map(([a, k]) => <div key={a} className="flex justify-between gap-4 py-1.5"><dt>{a}</dt><dd className="text-right font-mono text-xs text-mute">{k}</dd></div>)}
        </dl>
      </div>
    </div>
  );
}
