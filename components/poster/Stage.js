'use client';
import { fontHref, fontStack } from '@/lib/fonts';
import { renderGraphic } from '@/lib/poster/graphicsLib';
import { qrSvg } from '@/lib/poster/qr';
import { renderCurve } from '@/lib/poster/curve';
import { SHAPES } from '@/lib/poster/shapes';
import { POSTER_ICONS } from './icons';

const svgUrl = (path) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path d='${path}'/></svg>`)}")`;

export const FILTER_DEFAULTS = { brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0, sepia: 0, hue: 0 };

export function filterCss(f = {}) {
  const v = { ...FILTER_DEFAULTS, ...f };
  const parts = [];
  if (v.brightness !== 100) parts.push(`brightness(${v.brightness}%)`);
  if (v.contrast !== 100) parts.push(`contrast(${v.contrast}%)`);
  if (v.saturate !== 100) parts.push(`saturate(${v.saturate}%)`);
  if (v.blur) parts.push(`blur(${v.blur}px)`);
  if (v.grayscale) parts.push(`grayscale(${v.grayscale}%)`);
  if (v.sepia) parts.push(`sepia(${v.sepia}%)`);
  if (v.hue) parts.push(`hue-rotate(${v.hue}deg)`);
  return parts.join(' ') || undefined;
}

const shadowCss = (s) => (s ? `${s.x || 0}px ${s.y || 0}px ${s.blur || 0}px ${s.color || 'rgba(0,0,0,0.35)'}` : '');

export function bgCss(bg = {}) {
  if (bg.type === 'gradient') return { background: `linear-gradient(${bg.angle ?? 135}deg, ${bg.from || bg.color}, ${bg.to || bg.color})` };
  if (bg.type === 'radial') return { background: `radial-gradient(circle at 50% 40%, ${bg.from || bg.color}, ${bg.to || bg.color})` };
  if (bg.type === 'image' && bg.image) return { backgroundColor: bg.color, backgroundImage: `url("${bg.image}")`, backgroundSize: 'cover', backgroundPosition: 'center' };
  return { background: bg.color || '#FFFFFF' };
}

function fillCss(el) {
  return el.fill2 ? `linear-gradient(${el.gradAngle ?? 135}deg, ${el.fill}, ${el.fill2})` : el.fill;
}

function ShapeBody({ el }) {
  const sh = SHAPES[el.shape] || SHAPES.rect;
  if (!sh.path) {
    const round = el.shape === 'circle' || el.shape === 'ring' ? '50%' : el.shape === 'rounded' ? (el.radius || Math.min(el.w, el.h) * 0.15) : el.radius || 0;
    const isRing = el.shape === 'ring';
    return (
      <div
        style={{
          width: '100%',
          height: el.shape === 'line' ? Math.max(1, el.strokeW || el.h) : '100%',
          marginTop: el.shape === 'line' ? (el.h - Math.max(1, el.strokeW || el.h)) / 2 : 0,
          background: isRing ? 'transparent' : fillCss(el),
          borderRadius: round,
          border: el.strokeW && el.stroke && el.shape !== 'line' ? `${el.strokeW}px ${el.dash ? 'dashed' : 'solid'} ${el.stroke}` : isRing ? `${Math.max(2, el.strokeW || 6)}px solid ${el.stroke || el.fill}` : undefined,
          boxSizing: 'border-box',
        }}
      />
    );
  }
  const gid = `g-${el.id}`;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>
      {el.fill2 && (
        <defs>
          <linearGradient id={gid} gradientTransform={`rotate(${(el.gradAngle ?? 135) - 90} 0.5 0.5)`}>
            <stop offset="0" stopColor={el.fill} />
            <stop offset="1" stopColor={el.fill2} />
          </linearGradient>
        </defs>
      )}
      <path d={sh.path} fill={el.fill2 ? `url(#${gid})` : el.fill} stroke={el.strokeW ? el.stroke : 'none'} strokeWidth={el.strokeW || 0} vectorEffect="non-scaling-stroke" strokeDasharray={el.dash ? '8 6' : undefined} />
    </svg>
  );
}

// Empty photo slots: a person silhouette, a logo circle or a photo icon
const PLACEHOLDER_TEXT = { person: '+ Add photo', logo: '+ Logo / symbol', photo: '+ Add photo' };
function Placeholder({ el, editor }) {
  const tint = el.phColor || '#94A3B8';
  const kind = el.placeholder || 'photo';
  const label = editor && (
    <span style={{ position: 'absolute', left: '50%', bottom: kind === 'person' && el.cutout ? '6%' : '8%', transform: 'translateX(-50%)', background: 'rgba(15,23,42,.75)', color: '#fff', font: `600 ${Math.max(11, Math.min(el.w, el.h) * 0.06)}px system-ui, sans-serif`, padding: '0.25em 0.7em', borderRadius: 999, whiteSpace: 'nowrap' }}>{el.slot || PLACEHOLDER_TEXT[kind]}</span>
  );
  if (kind === 'logo')
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', border: `${Math.max(2, Math.min(el.w, el.h) * 0.03)}px dashed ${tint}`, borderRadius: el.mask === 'circle' ? '50%' : 12, color: tint, font: `700 ${Math.min(el.w, el.h) * 0.16}px system-ui, sans-serif`, background: 'rgba(255,255,255,.35)' }}>
        LOGO{label}
      </div>
    );
  if (kind === 'person')
    return (
      <div style={{ position: 'absolute', inset: 0, background: el.cutout ? 'transparent' : `linear-gradient(180deg, ${el.phBg || '#E2E8F0'}, ${el.phBg2 || '#CBD5E1'})` }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <circle cx="50" cy="36" r="17" fill={tint} />
          <path d="M12 100 C12 72 28 58 50 58 C72 58 88 72 88 100Z" fill={tint} />
        </svg>
        {label}
      </div>
    );
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${el.phBg || '#E2E8F0'}, ${el.phBg2 || '#CBD5E1'})`, display: 'grid', placeItems: 'center' }}>
      <svg viewBox="0 0 24 24" width="30%" height="30%" fill="none" stroke={tint} strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 9" /></svg>
      {label}
    </div>
  );
}

function ImageBody({ el, editor }) {
  const sh = SHAPES[el.mask];
  const mask = sh?.path ? svgUrl(sh.path) : null;
  const radius = el.mask === 'circle' ? '50%' : el.radius || 0;
  return (
    <div
      style={{
        position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: radius,
        border: el.strokeW && el.stroke ? `${el.strokeW}px solid ${el.stroke}` : undefined, boxSizing: 'border-box',
        ...(mask && { WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }),
      }}
    >
      {!el.src && <Placeholder el={el} editor={editor} />}
      {el.src && el.tint?.strength > 0 && <div style={{ position: 'absolute', inset: 0, background: el.tint.color, opacity: el.tint.strength / 100, mixBlendMode: el.tint.mode || 'color', pointerEvents: 'none' }} />}
      {el.src && el.fade?.strength > 0 && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${{ bottom: 180, top: 0, left: 270, right: 90 }[el.fade.side || 'bottom']}deg, transparent ${100 - el.fade.strength}%, ${el.fade.color})`, pointerEvents: 'none' }} />}
      {el.src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={el.src}
          alt=""
          crossOrigin="anonymous"
          draggable={false}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: el.fit === 'contain' ? 'contain' : 'cover',
            objectPosition: `${el.cropX ?? 50}% ${el.cropY ?? 50}%`, transform: `scale(${el.zoom || 1})`, transformOrigin: `${el.cropX ?? 50}% ${el.cropY ?? 50}%`,
            filter: filterCss(el.filters), userSelect: 'none', pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}

// Thick outline drawn as a ring of shadows (works for any font and survives export)
function textShadows(el) {
  const out = [];
  const hollow = !el.color || el.color === 'transparent';
  if (el.strokeW && el.stroke && !hollow) {
    const w = el.strokeW;
    const n = Math.min(32, Math.max(12, Math.round(w * 4)));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      out.push(`${(Math.cos(a) * w).toFixed(2)}px ${(Math.sin(a) * w).toFixed(2)}px 0 ${el.stroke}`);
    }
  }
  if (el.extrude?.depth) {
    for (let i = 1; i <= el.extrude.depth; i++) out.push(`${i}px ${i}px 0 ${el.extrude.color || '#000'}`);
  }
  if (el.shadow) out.push(shadowCss(el.shadow));
  return out.join(', ') || undefined;
}

function CurvedText({ el }) {
  const c = Math.max(-100, Math.min(100, el.curve));
  const theta = (Math.abs(c) / 100) * Math.PI * 0.95;
  const w = el.w;
  const r = w / 2 / Math.sin(theta / 2);
  const sag = r - Math.sqrt(Math.max(0, r * r - (w / 2) ** 2));
  // The words cover the middle of the arc, so place the arc's middle at the box centre
  const end = c > 0 ? el.h * 0.5 + el.size * 0.3 + sag * 0.75 : el.h * 0.5 + el.size * 0.3 - sag * 0.75;
  const d = `M0 ${end} A${r} ${r} 0 0 ${c > 0 ? 1 : 0} ${w} ${end}`;
  const pid = `cv-${el.id}`;
  const hollow = !el.color || el.color === 'transparent';
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${el.h}`} style={{ overflow: 'visible', display: 'block' }}>
      <defs><path id={pid} d={d} /></defs>
      <text
        style={{ fontFamily: fontStack(el.font), fontSize: el.size, fontWeight: el.weight, fontStyle: el.italic ? 'italic' : 'normal', letterSpacing: `${el.ls || 0}em`, textTransform: el.upper ? 'uppercase' : 'none', textShadow: el.shadow ? shadowCss(el.shadow) : undefined, paintOrder: 'stroke fill' }}
        fill={hollow ? 'none' : el.color}
        stroke={el.strokeW && el.stroke ? el.stroke : 'none'}
        strokeWidth={el.strokeW ? el.strokeW * 2 : 0}
        strokeLinejoin="round"
        textAnchor="middle"
      >
        <textPath href={`#${pid}`} startOffset="50%">{String(el.text).replace(/\n/g, ' ')}</textPath>
      </text>
    </svg>
  );
}

function TextBody({ el, editing }) {
  if (el.curve && !editing) return <CurvedText el={el} />;
  const gradient = el.fill2 ? { backgroundImage: `linear-gradient(${el.gradAngle ?? 90}deg, ${el.color}, ${el.fill2})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' } : { color: el.color };
  return (
    <div
      style={{
        width: '100%', height: '100%', fontFamily: fontStack(el.font), fontSize: el.size, fontWeight: el.weight, fontStyle: el.italic ? 'italic' : 'normal',
        textDecoration: [el.underline && 'underline', el.strike && 'line-through'].filter(Boolean).join(' ') || 'none',
        textAlign: el.align, lineHeight: el.lh, letterSpacing: `${el.ls || 0}em`, textTransform: el.upper ? 'uppercase' : 'none',
        whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere',
        textShadow: el.fill2 ? undefined : textShadows(el),
        WebkitTextStroke: el.strokeW && el.stroke && (!el.color || el.color === 'transparent') ? `${el.strokeW}px ${el.stroke}` : undefined,
        background: el.bgColor || undefined, borderRadius: el.bgColor ? el.bgRadius ?? 8 : undefined, padding: el.bgColor ? `${el.bgPad ?? 0}px` : undefined, boxSizing: 'border-box',
        visibility: editing ? 'hidden' : 'visible',
      }}
    >
      <span style={el.fill2 ? gradient : { color: el.color }}>{el.text}</span>
    </div>
  );
}

export function ElementBody({ el, editing, editor }) {
  if (el.type === 'text') return <TextBody el={el} editing={editing} />;
  if (el.type === 'image') return <ImageBody el={el} editor={editor} />;
  if (el.type === 'path') {
    // freehand stroke: drawn in its own coordinates (vw × vh) and stretched with the box
    const k = ((el.vw || el.w) / el.w + (el.vh || el.h) / el.h) / 2;
    return (
      <svg viewBox={`0 0 ${el.vw || el.w} ${el.vh || el.h}`} preserveAspectRatio="none" width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>
        <path d={el.d} fill="none" stroke={el.color} strokeWidth={(el.strokeW || 6) * k} strokeLinecap="round" strokeLinejoin="round" opacity={el.highlighter ? 0.45 : 1} />
      </svg>
    );
  }
  if (el.type === 'curve') return <div style={{ width: '100%', height: '100%', overflow: 'visible' }} dangerouslySetInnerHTML={{ __html: renderCurve(el) }} />;
  if (el.type === 'qr') return <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: qrSvg(el) }} />;
  if (el.type === 'graphic') return <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: renderGraphic(el) }} />;
  if (el.type === 'icon') {
    const Icon = POSTER_ICONS[el.icon] || POSTER_ICONS.Star;
    return <Icon width="100%" height="100%" color={el.color} strokeWidth={el.strokeW || 2} fill={el.filled ? el.color : 'none'} style={{ display: 'block' }} />;
  }
  return <ShapeBody el={el} />;
}

// White sticker outline around cut-out photos, then the drop shadow
function wrapFilter(el) {
  if (el.type === 'text') return undefined;
  const parts = [];
  if (el.outline?.width && el.type === 'image' && el.src) {
    const w = el.outline.width;
    const c = el.outline.color || '#FFFFFF';
    [[w, 0], [-w, 0], [0, w], [0, -w], [w * 0.7, w * 0.7], [-w * 0.7, w * 0.7], [w * 0.7, -w * 0.7], [-w * 0.7, -w * 0.7]].forEach(([x, y]) => parts.push(`drop-shadow(${x.toFixed(1)}px ${y.toFixed(1)}px 0 ${c})`));
  }
  if (el.shadow) parts.push(`drop-shadow(${shadowCss(el.shadow)})`);
  return parts.join(' ') || undefined;
}

export function wrapStyle(el) {
  const flip = `${el.flipX ? ' scaleX(-1)' : ''}${el.flipY ? ' scaleY(-1)' : ''}`;
  return {
    position: 'absolute', left: el.x, top: el.y, width: el.w, height: el.h,
    transform: `rotate(${el.rot || 0}deg)${flip}`, opacity: el.opacity ?? 1,
    filter: wrapFilter(el),
    mixBlendMode: el.blend || undefined,
  };
}

export function docFonts(doc) {
  return [...new Set((doc.elements || []).filter((e) => e.type === 'text').map((e) => e.font))];
}

export function FontLinks({ doc }) {
  const href = fontHref(docFonts(doc));
  return href ? <link rel="stylesheet" href={href} crossOrigin="anonymous" /> : null;
}

// Renders a design at its real size, scaled by `scale` for display
// hideEmpty: leave out photo frames nobody filled (used when downloading)
export default function Stage({ doc, scale = 1, transparent = false, editingId, children, stageRef, className = '', editor = false, hideEmpty = false }) {
  return (
    <div className={className} style={{ width: doc.w * scale, height: doc.h * scale, position: 'relative', flexShrink: 0 }}>
      <FontLinks doc={doc} />
      <div ref={stageRef} style={{ width: doc.w, height: doc.h, position: 'absolute', left: 0, top: 0, transform: `scale(${scale})`, transformOrigin: '0 0', overflow: 'hidden', ...(transparent ? {} : bgCss(doc.bg)) }}>
        {!transparent && doc.bg?.type === 'image' && doc.bg.overlay > 0 && <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${doc.bg.overlay / 100})` }} />}
        {(doc.elements || []).map((el) => (el.hidden || (hideEmpty && el.type === 'image' && !el.src) ? null : (
          <div key={el.id} data-sid={el.id} style={wrapStyle(el)}>
            <ElementBody el={el} editing={editingId === el.id} editor={editor} />
          </div>
        )))}
        {children}
      </div>
    </div>
  );
}
