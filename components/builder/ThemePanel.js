'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { FONTS, FONT_GROUPS, fontHref, fontStack } from '@/lib/fonts';
import { GRADIENTS } from '@/lib/blocks';
import { ChoiceInput, ColorInput, ImageInput, Toggle } from './fields';
import { FontPicker, useAllFonts } from './FontPicker';

const PALETTES = [
  { name: 'Cobalt', c: { primary: '#2F5BFF', secondary: '#FFB020', bg: '#FFFFFF', surface: '#F5F7FB', text: '#16213E', muted: '#5B6680', border: '#E1E6EF' } },
  { name: 'Ink', c: { primary: '#14171F', secondary: '#E3B505', bg: '#FFFFFF', surface: '#F4F4F5', text: '#14171F', muted: '#5C6372', border: '#E4E4E7' } },
  { name: 'Coral', c: { primary: '#FF4D2E', secondary: '#1E1E24', bg: '#F7F7FB', surface: '#FFFFFF', text: '#1E1E24', muted: '#6B6B78', border: '#E3E3EC' } },
  { name: 'Forest', c: { primary: '#1F6F50', secondary: '#E9C46A', bg: '#F4F8F5', surface: '#FFFFFF', text: '#14251D', muted: '#56685E', border: '#D7E3DB' } },
  { name: 'Plum', c: { primary: '#7A3E65', secondary: '#C9A9BE', bg: '#F6F2F5', surface: '#FFFFFF', text: '#2B1F28', muted: '#76687A', border: '#E5DCE2' } },
  { name: 'Lilac', c: { primary: '#7C4DFF', secondary: '#FF8FB1', bg: '#FBF8FF', surface: '#FFFFFF', text: '#2A2340', muted: '#6E6788', border: '#E9E1F7' } },
  { name: 'Midnight', c: { primary: '#58A6FF', secondary: '#3FB950', bg: '#0D1117', surface: '#161B22', text: '#E6EDF3', muted: '#8B949E', border: '#30363D' } },
  { name: 'Neon', c: { primary: '#00E5FF', secondary: '#FF2E97', bg: '#0A0A1A', surface: '#12122A', text: '#F1F1FF', muted: '#9A9AC0', border: '#26264A' } },
  { name: 'Gold', c: { primary: '#E8C468', secondary: '#E8C468', bg: '#0E0E0E', surface: '#171717', text: '#F2F2F2', muted: '#A3A3A3', border: '#2A2A2A' } },
  { name: 'Peach', c: { primary: '#111111', secondary: '#FFD23F', bg: '#FFE8D6', surface: '#FFFFFF', text: '#111111', muted: '#5A4A3F', border: '#E8C9B0' } },
];

const FONT_PAIRS = [
  ['Playfair Display', 'Lato'], ['Syne', 'DM Sans'], ['Space Grotesk', 'Outfit'], ['Fraunces', 'Inter'],
  ['Bebas Neue', 'Work Sans'], ['Great Vibes', 'Jost'], ['Unbounded', 'Figtree'], ['JetBrains Mono', 'IBM Plex Sans'],
];

const COLOR_KEYS = [
  ['primary', 'Brand colour'], ['secondary', 'Second colour'], ['surface', 'Cards'],
  ['text', 'Text'], ['muted', 'Soft text'], ['border', 'Lines'],
];

const ALT_KEYS = [
  ['altPrimary', 'Brand colour'], ['altBg', 'Page background'], ['altSurface', 'Cards'], ['altText', 'Text'], ['altMuted', 'Soft text'], ['altBorder', 'Lines'],
];
const ALT_PRESETS = [
  { name: 'Dark', c: { altPrimary: '#58A6FF', altBg: '#0D1117', altSurface: '#161B22', altText: '#E6EDF3', altMuted: '#8B949E', altBorder: '#30363D' } },
  { name: 'Light', c: { altPrimary: '#2F5BFF', altBg: '#FFFFFF', altSurface: '#F5F7FB', altText: '#16213E', altMuted: '#5B6680', altBorder: '#E1E6EF' } },
];

const GRADIENT_NAMES = [
  ['brand', 'Brand'], ['mesh', 'Soft mesh'], ['sunset', 'Sunset'], ['ocean', 'Ocean'], ['aurora', 'Aurora'], ['peach', 'Peach'],
  ['mint', 'Mint'], ['berry', 'Berry'], ['fire', 'Fire'], ['gold', 'Gold'], ['midnight', 'Midnight'],
];
const LAYOUTS = [
  ['contained', 'Standard', 'Background fills the screen, content is centred.'],
  ['full', 'Full width', 'Content stretches edge to edge.'],
  ['boxed', 'Boxed', 'The page sits as a card on an outside colour.'],
  ['mobile', 'Mobile card', 'A narrow 480px column, like a link-in-bio page.'],
];
const WIDTHS = [[760, 'Narrow'], [1120, 'Standard'], [1320, 'Wide']];

function Section({ title, children }) {
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
      <div className="mb-1 flex justify-between text-xs font-semibold text-mute">
        <span>{label}</span>
        <span>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#2F5BFF]" aria-label={label} />
    </div>
  );
}

function Segmented({ label, value, options, onChange }) {
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex rounded-lg bg-ink/5 p-0.5">
        {options.map(([v, l]) => (
          <button key={v} type="button" onClick={() => onChange(v)} className={`flex-1 rounded-md px-2 py-1 text-xs font-semibold ${value === v ? 'bg-white shadow-sm' : 'text-mute'}`}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

// Small sketch of each layout: grey = outside, white = page, blue = content
function LayoutIcon({ kind }) {
  const page = { contained: [2, 2, 36, 22], full: [2, 2, 36, 22], boxed: [7, 4, 26, 18], mobile: [14, 3, 12, 20] }[kind];
  const content = { contained: [10, 7, 20, 12], full: [4, 7, 32, 12], boxed: [11, 8, 18, 10], mobile: [16, 7, 8, 12] }[kind];
  return (
    <svg viewBox="0 0 40 26" className="mb-1.5 block h-7 w-full" aria-hidden="true">
      <rect x="0.5" y="0.5" width="39" height="25" rx="3" fill="#E9ECF2" stroke="#E8E2D8" />
      <rect x={page[0]} y={page[1]} width={page[2]} height={page[3]} rx="2" fill="#fff" />
      <rect x={content[0]} y={content[1]} width={content[2]} height={content[3]} rx="1.5" fill="#2F5BFF" opacity=".35" />
    </svg>
  );
}

export default function ThemePanel({ theme, onChange }) {
  useAllFonts();
  const set = (k) => (v) => onChange({ ...theme, [k]: v }, `theme.${k}`);

  return (
    <div>
      <Section title="Colour palettes">
        <div className="grid grid-cols-5 gap-2">
          {PALETTES.map((p) => (
            <button key={p.name} type="button" title={p.name} onClick={() => onChange({ ...theme, ...p.c })} className="group overflow-hidden rounded-lg border border-line hover:border-ink" aria-label={`Use ${p.name} palette`}>
              <div className="h-7" style={{ background: p.c.bg }}>
                <div className="flex h-full items-center justify-center gap-0.5">
                  <span className="h-3 w-3 rounded-full" style={{ background: p.c.primary }} />
                  <span className="h-3 w-3 rounded-full" style={{ background: p.c.secondary }} />
                  <span className="h-3 w-3 rounded-full" style={{ background: p.c.text }} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Colours">
        {COLOR_KEYS.map(([k, l]) => (
          <div key={k}>
            <span className="label">{l}</span>
            <ColorInput value={theme[k]} onChange={set(k)} allowClear={false} />
          </div>
        ))}
      </Section>

      <Section title="Page background">
        <div>
          <span className="label">Background colour</span>
          <ColorInput value={theme.bg} onChange={set('bg')} allowClear={false} />
        </div>
        <div>
          <span className="label">Style</span>
          <ChoiceInput cols={3} value={theme.bgType} onChange={set('bgType')} options={[['color', 'Plain'], ['gradient', 'Gradient'], ['image', 'Image']]} />
        </div>

        {theme.bgType === 'gradient' && (
          <>
            <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Gradient">
              {GRADIENT_NAMES.map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={theme.bgGradient === k}
                  title={l}
                  aria-label={l}
                  onClick={() => set('bgGradient')(k)}
                  className={`h-9 rounded-lg border-2 ${theme.bgGradient === k ? 'border-signal' : 'border-transparent hover:border-ink/30'}`}
                  style={{ '--pf-primary': theme.primary, '--pf-secondary': theme.secondary, backgroundColor: theme.bg, backgroundImage: GRADIENTS[k] }}
                />
              ))}
              <button
                type="button"
                role="radio"
                aria-checked={theme.bgGradient === 'custom'}
                onClick={() => set('bgGradient')('custom')}
                className={`h-9 rounded-lg border-2 text-[11px] font-bold ${theme.bgGradient === 'custom' ? 'border-signal' : 'border-line hover:border-ink/30'}`}
                style={{ backgroundImage: `linear-gradient(${theme.bgAngle}deg,${theme.bgGrad1},${theme.bgGrad2})` }}
              >
                Custom
              </button>
            </div>
            {theme.bgGradient === 'custom' && (
              <>
                <div>
                  <span className="label">From</span>
                  <ColorInput value={theme.bgGrad1} onChange={set('bgGrad1')} allowClear={false} />
                </div>
                <div>
                  <span className="label">To</span>
                  <ColorInput value={theme.bgGrad2} onChange={set('bgGrad2')} allowClear={false} />
                </div>
                <Range label="Direction" value={theme.bgAngle} min={0} max={360} step={5} unit="°" onChange={set('bgAngle')} />
              </>
            )}
            <Toggle label="Keep fixed while scrolling" checked={theme.bgFixed} onChange={set('bgFixed')} />
          </>
        )}

        {theme.bgType === 'image' && (
          <>
            <ImageInput value={theme.bgImage} onChange={set('bgImage')} />
            <Range label="Darken image" value={theme.bgOverlay} min={0} max={80} step={5} unit="%" onChange={set('bgOverlay')} />
            <div>
              <span className="label">Image size</span>
              <ChoiceInput cols={3} value={theme.bgSize} onChange={set('bgSize')} options={[['cover', 'Fill'], ['contain', 'Fit'], ['tile', 'Tile']]} />
            </div>
            <Toggle label="Keep fixed while scrolling" checked={theme.bgFixed} onChange={set('bgFixed')} />
            <p className="text-xs text-mute">Tip: if text is hard to read, darken the image or change the Text colour below.</p>
          </>
        )}

        <div>
          <span className="label">Pattern on top</span>
          <ChoiceInput cols={3} value={theme.pattern} onChange={set('pattern')} options={[['none', 'None'], ['dots', 'Dots'], ['grid', 'Grid'], ['lines', 'Lines'], ['noise', 'Grain'], ['gradient', 'Glow']]} />
        </div>
      </Section>

      <Section title="Page layout">
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Page layout">
          {LAYOUTS.map(([k, l, d]) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={theme.layout === k}
              title={d}
              onClick={() => set('layout')(k)}
              className={`rounded-lg border p-2 text-left text-xs font-semibold ${theme.layout === k ? 'border-signal bg-signal-soft text-ink' : 'border-line bg-white text-mute hover:border-ink/40 hover:text-ink'}`}
            >
              <LayoutIcon kind={k} />
              {l}
            </button>
          ))}
        </div>
        <p className="text-xs text-mute">{LAYOUTS.find(([k]) => k === theme.layout)?.[2]}</p>
        {(theme.layout === 'contained' || theme.layout === 'boxed') && (
          <>
            <Segmented label="Content width" value={theme.maxWidth} onChange={set('maxWidth')} options={WIDTHS} />
            <Range label="Custom width" value={theme.maxWidth} min={640} max={1600} step={10} unit="px" onChange={set('maxWidth')} />
          </>
        )}
        {(theme.layout === 'boxed' || theme.layout === 'mobile') && (
          <div>
            <span className="label">Outside colour</span>
            <ColorInput value={theme.outerBg} onChange={set('outerBg')} allowClear={false} />
          </div>
        )}
      </Section>

      <Section title="Fonts">
        <div className="flex flex-wrap gap-1.5">
          {FONT_PAIRS.map(([h, b]) => (
            <button key={h + b} type="button" onClick={() => onChange({ ...theme, headingFont: h, bodyFont: b })} className="rounded-md border border-line px-2 py-1 text-left hover:border-ink" title={`${h} + ${b}`}>
              <span className="block text-sm leading-tight" style={{ fontFamily: fontStack(h) }}>{h}</span>
              <span className="block text-[11px] text-mute" style={{ fontFamily: fontStack(b) }}>{b}</span>
            </button>
          ))}
        </div>
        <FontPicker label="Headings" value={theme.headingFont} onChange={set('headingFont')} />
        <FontPicker label="Body text" value={theme.bodyFont} onChange={set('bodyFont')} />
        <Range label="Text size" value={theme.baseSize} min={14} max={22} unit="px" onChange={set('baseSize')} />
        <div>
          <span className="label">Heading weight</span>
          <select className="input" value={theme.headingWeight} onChange={(e) => set('headingWeight')(e.target.value)}>
            {[['400', 'Regular'], ['500', 'Medium'], ['600', 'Semibold'], ['700', 'Bold'], ['800', 'Extra bold']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <Range label="Heading letter spacing" value={theme.letterSpacing} min={-0.06} max={0.2} step={0.01} unit="em" onChange={set('letterSpacing')} />
        <Segmented label="Heading case" value={theme.headingCase} onChange={set('headingCase')} options={[['none', 'As typed'], ['uppercase', 'CAPS'], ['capitalize', 'Title']]} />
      </Section>

      <Section title="Shape and layout">
        <Range label="Corner roundness" value={theme.radius} min={0} max={32} unit="px" onChange={set('radius')} />
        <Segmented label="Buttons" value={theme.buttonStyle} onChange={set('buttonStyle')} options={[['square', 'Square'], ['rounded', 'Rounded'], ['pill', 'Pill']]} />
        <Range label="Space between sections" value={theme.sectionSpacing} min={24} max={200} step={4} unit="px" onChange={set('sectionSpacing')} />
      </Section>

      <Section title="Effects">
        <Toggle label="Reveal sections on scroll" checked={theme.animation} onChange={set('animation')} />
      </Section>

      <Section title="Visitor extras">
        <Toggle label="Command palette (⌘K / Ctrl+K)" checked={theme.commandPalette} onChange={set('commandPalette')} />
        <p className="text-xs text-mute">Visitors press ⌘K to jump to sections, copy your email, open links and more. Give sections an ID in their Style tab so they show up.</p>
        <Toggle label="Light / dark switch" checked={theme.modeToggle} onChange={set('modeToggle')} />
        {theme.modeToggle && (
          <>
            <p className="text-xs text-mute">Your colours above are the default. The switch flips to these:</p>
            <div className="grid grid-cols-2 gap-2">
              {ALT_PRESETS.map((p) => (
                <button key={p.name} type="button" onClick={() => onChange({ ...theme, ...p.c })} className="flex items-center gap-2 rounded-lg border border-line px-2 py-1.5 text-xs font-semibold hover:border-ink">
                  <span className="h-4 w-4 rounded-full border border-line" style={{ background: p.c.altBg }} />
                  <span className="h-4 w-4 rounded-full" style={{ background: p.c.altPrimary }} />
                  {p.name}
                </button>
              ))}
            </div>
            {ALT_KEYS.map(([k, l]) => (
              <div key={k}>
                <span className="label">{l}</span>
                <ColorInput value={theme[k]} onChange={set(k)} allowClear={false} />
              </div>
            ))}
          </>
        )}
      </Section>

      <Section title="Custom CSS">
        <textarea className="input font-mono text-xs" rows={6} value={theme.customCSS || ''} onChange={(e) => set('customCSS')(e.target.value)} placeholder=".pf-h1 { text-shadow: 0 2px 0 #000; }" spellCheck={false} />
      </Section>
    </div>
  );
}
