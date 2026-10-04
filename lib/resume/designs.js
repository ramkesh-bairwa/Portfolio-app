// Resume designs. A design is a full theme: layout, colours, fonts, heading style, bullets, skill display, spacing.
// `ats` designs are single-column with standard fonts and no icons/photo, which applicant tracking systems read best.

export const DEFAULT_RESUME_THEME = {
  layout: 'single', // single | sidebar-left | sidebar-right | band | split | timeline
  accent: '#2F5BFF',
  text: '#1F2430',
  muted: '#5B6375',
  sidebarBg: '#F3F5F9',
  sidebarText: '#1F2430',
  headingFont: 'Inter',
  bodyFont: 'Inter',
  baseSize: 10, // pt
  lineHeight: 1.45,
  margin: 16, // mm
  gap: 14, // pt between sections
  heading: 'underline', // underline | bar | caps | boxed | dotted | accent-left | plain | pill | center-line | filled
  headingCase: 'uppercase',
  nameSize: 26, // pt
  bullets: 'disc', // disc | dash | arrow | square | check | none
  skills: 'tags', // tags | bars | dots | text | columns
  dates: 'right', // right | below | left
  icons: true,
  photoShape: 'circle', // circle | rounded | square
  headerAlign: 'left', // left | center | split | band
  paper: 'a4', // a4 | letter
};

const D = (slug, name, desc, premium, ats, t) => ({ slug, name, desc, premium, ats, theme: { ...DEFAULT_RESUME_THEME, ...t } });

export const RESUME_DESIGNS = [
  D('classic-ats', 'Classic ATS', 'Clean single column that every applicant tracking system reads perfectly.', false, true, { accent: '#1F2937', headingFont: 'Lato', bodyFont: 'Lato', heading: 'underline', icons: false, headerAlign: 'left' }),
  D('clean-pro', 'Clean Professional', 'Crisp blue accents, easy to scan in six seconds.', false, true, { accent: '#2F5BFF', heading: 'bar', icons: false }),
  D('ats-pro-max', 'ATS Pro Max', 'Top-ranking layout: keyword-first summary, standard headings, perfect parsing.', true, true, { accent: '#0B5394', headingFont: 'Lato', bodyFont: 'Lato', heading: 'underline', icons: false, baseSize: 10.5, gap: 12, nameSize: 24 }),
  D('harvard', 'Harvard', 'The classic Ivy-League format recruiters trust.', true, true, { accent: '#111111', headingFont: 'EB Garamond', bodyFont: 'EB Garamond', heading: 'caps', headerAlign: 'center', icons: false, baseSize: 11, nameSize: 24 }),
  D('executive-navy', 'Executive Navy', 'Senior, polished and ATS-safe with a serif touch.', true, true, { accent: '#1E3A8A', headingFont: 'Libre Baskerville', bodyFont: 'Source Sans 3', heading: 'underline', icons: false, nameSize: 25 }),
  D('corporate-blue', 'Corporate Blue', 'Boxed headings that guide the eye; ranks well with ATS.', true, true, { accent: '#0369A1', headingFont: 'Montserrat', bodyFont: 'Source Sans 3', heading: 'boxed', icons: false }),
  D('monochrome-pro', 'Monochrome Pro', 'Black-and-white precision, centred section lines.', true, true, { accent: '#111111', headingFont: 'Work Sans', bodyFont: 'Work Sans', heading: 'center-line', headerAlign: 'center', icons: false }),
  D('minimal-mono', 'Minimal', 'Lots of white space and quiet type.', false, true, { accent: '#374151', headingFont: 'IBM Plex Sans', bodyFont: 'IBM Plex Sans', heading: 'plain', headingCase: 'none', icons: false, gap: 16 }),
  D('compact-one', 'Compact One-Page', 'Fits more on one page without feeling crowded.', false, true, { accent: '#2563EB', baseSize: 9.5, gap: 10, margin: 12, heading: 'bar', skills: 'columns', icons: false, nameSize: 22 }),
  D('academic-cv', 'Academic CV', 'Serif, small caps, made for research and teaching roles.', false, true, { accent: '#7F1D1D', headingFont: 'Merriweather', bodyFont: 'Merriweather', heading: 'caps', headingCase: 'uppercase', icons: false, baseSize: 9.5, headerAlign: 'center' }),
  D('simple-indian', 'Simple Indian', 'Familiar Indian format with personal details and declaration.', false, true, { accent: '#1F2937', headingFont: 'Source Sans 3', bodyFont: 'Source Sans 3', heading: 'filled', icons: false }),
  D('nordic', 'Nordic', 'Soft greys and calm spacing.', false, true, { accent: '#64748B', headingFont: 'Figtree', bodyFont: 'Figtree', heading: 'plain', headingCase: 'none', icons: true }),
  D('modern-sidebar', 'Modern Sidebar', 'Dark sidebar with photo, skills and contacts.', false, false, { headColor: '#0369A1', layout: 'sidebar-left', accent: '#38BDF8', sidebarBg: '#1F2937', sidebarText: '#F3F4F6', headingFont: 'Poppins', bodyFont: 'Poppins', heading: 'bar', skills: 'bars' }),
  D('teal-sidebar', 'Teal Sidebar', 'Light teal sidebar, friendly and modern.', false, false, { layout: 'sidebar-left', accent: '#0D9488', sidebarBg: '#F0FDFA', headingFont: 'Manrope', bodyFont: 'Inter', heading: 'accent-left', skills: 'dots' }),
  D('right-column', 'Right Column', 'Main story on the left, details on the right.', false, false, { layout: 'sidebar-right', accent: '#7C3AED', sidebarBg: '#F5F3FF', headingFont: 'Manrope', bodyFont: 'Inter', heading: 'underline' }),
  D('header-band', 'Header Band', 'Bold colour band with your name.', false, false, { layout: 'band', accent: '#0EA5E9', headerAlign: 'band', heading: 'bar' }),
  D('timeline', 'Timeline', 'Dates on the left like a timeline.', false, false, { layout: 'timeline', accent: '#2F5BFF', dates: 'left', heading: 'underline' }),
  D('creative-coral', 'Creative Coral', 'Warm coral sidebar for creative roles.', false, false, { layout: 'sidebar-left', accent: '#FF4D2E', sidebarBg: '#FFF1EE', headingFont: 'Syne', bodyFont: 'DM Sans', heading: 'pill', skills: 'tags' }),
  D('elegant-serif', 'Elegant Serif', 'Centred header, gold accents, graceful serif.', true, false, { accent: '#A16207', headingFont: 'Playfair Display', bodyFont: 'Lato', heading: 'dotted', headerAlign: 'center', headingCase: 'none' }),
  D('tech-dev', 'Tech Developer', 'Monospace headings and a split header for engineers.', false, false, { layout: 'split', accent: '#16A34A', headingFont: 'JetBrains Mono', bodyFont: 'IBM Plex Sans', heading: 'accent-left', headerAlign: 'split', skills: 'tags' }),
  D('bold-name', 'Bold Name', 'Big name, strong bars, impossible to miss.', false, false, { accent: '#111111', headingFont: 'Archivo Black', bodyFont: 'Work Sans', heading: 'bar', nameSize: 34, headingCase: 'uppercase' }),
  D('pastel', 'Pastel', 'Lavender sidebar with soft rounded touches.', false, false, { layout: 'sidebar-right', accent: '#8B5CF6', sidebarBg: '#F5F0FF', headingFont: 'Fredoka', bodyFont: 'Nunito', heading: 'pill', skills: 'dots', photoShape: 'rounded' }),
  D('dark-header', 'Dark Header', 'Charcoal header band with gold highlights.', true, false, { layout: 'band', accent: '#D4A017', headerAlign: 'band', heading: 'underline', headingFont: 'Montserrat', bodyFont: 'Source Sans 3', bandBg: '#111827' }),
  D('two-tone-split', 'Two-tone Split', 'Name and contacts split across the top.', true, false, { layout: 'split', accent: '#DB2777', headerAlign: 'split', heading: 'accent-left', headingFont: 'Outfit', bodyFont: 'Inter' }),
  D('student-fresher', 'Student / Fresher', 'Education and projects first, perfect for freshers.', false, false, { accent: '#0891B2', headingFont: 'Nunito', bodyFont: 'Nunito', heading: 'pill', skills: 'tags' }),
  D('designer-grid', 'Designer Grid', 'Pink accents and a modern grotesk sidebar.', true, false, { layout: 'sidebar-left', accent: '#EC4899', sidebarBg: '#FDF2F8', headingFont: 'Space Grotesk', bodyFont: 'Inter', heading: 'bar', skills: 'bars', photoShape: 'rounded' }),
  D('green-fresh', 'Green Fresh', 'Fresh green band, optimistic and clean.', false, false, { layout: 'band', accent: '#059669', headerAlign: 'band', heading: 'accent-left', headingFont: 'Outfit', bodyFont: 'Inter' }),
  D('startup', 'Startup', 'Orange accents and a punchy right column.', false, false, { layout: 'sidebar-right', accent: '#EA580C', sidebarBg: '#FFF7ED', headingFont: 'Outfit', bodyFont: 'Inter', heading: 'bar', skills: 'bars' }),
  D('royal-purple', 'Royal Purple', 'Deep purple sidebar that feels premium.', true, false, { headColor: '#6D28D9', layout: 'sidebar-left', accent: '#C4B5FD', sidebarBg: '#4C1D95', sidebarText: '#F5F3FF', headingFont: 'Playfair Display', bodyFont: 'Lato', heading: 'underline', skills: 'dots' }),
  D('infographic', 'Infographic', 'Skill bars, icons and a visual sidebar.', true, false, { headColor: '#B45309', layout: 'sidebar-left', accent: '#F59E0B', sidebarBg: '#0F172A', sidebarText: '#E2E8F0', headingFont: 'Poppins', bodyFont: 'Poppins', heading: 'filled', skills: 'bars' }),
];

// ---------- Top Ranking: 50 premium designs, 10 structural families × 5 looks ----------
const T = (slug, name, desc, ats, t) => ({ ...D(slug, name, desc, true, ats, t), tier: 'top' });
export const TOP_DESIGNS = [
  // Consulting labels: section titles in a left column — the format top firms shortlist
  T('consulting-classic', 'Consulting Classic', 'McKinsey-style labelled sections in timeless Garamond.', true, { layout: 'labels', accent: '#111111', headingFont: 'EB Garamond', bodyFont: 'EB Garamond', heading: 'plain', headerAlign: 'rule', items: 'company', skills: 'text', icons: false, baseSize: 10.5, nameSize: 28 }),
  T('investment-banker', 'Investment Banker', 'Dense, precise and trusted on Wall Street and Dalal Street.', true, { layout: 'labels', accent: '#1E3A8A', headingFont: 'Libre Baskerville', bodyFont: 'Source Sans 3', heading: 'caps', headerAlign: 'center', skills: 'columns', icons: false, baseSize: 9.5, gap: 10 }),
  T('strategist', 'Strategist', 'Numbered, labelled sections that read like a board deck.', true, { layout: 'labels', accent: '#0F766E', headingFont: 'Inter', bodyFont: 'Inter', heading: 'plain', numbered: true, headerAlign: 'left', items: 'accent', icons: false }),
  T('partner', 'Partner', 'Boxed name and burgundy labels for senior leaders.', true, { layout: 'labels', accent: '#7F1D1D', headingFont: 'Playfair Display', bodyFont: 'Lato', heading: 'plain', headerAlign: 'boxed', items: 'company', icons: false, headingCase: 'none' }),
  T('analyst-pro', 'Analyst Pro', 'Big stacked name, labelled sections and a skills matrix.', true, { layout: 'labels', accent: '#334155', headingFont: 'IBM Plex Sans', bodyFont: 'IBM Plex Sans', heading: 'plain', headerAlign: 'stacked', skills: 'matrix', icons: false }),
  // Accent rail down the page
  T('sapphire-rail', 'Sapphire Rail', 'A confident blue rail and accented job titles.', true, { decor: 'rail', accent: '#1D4ED8', headingFont: 'Manrope', bodyFont: 'Inter', heading: 'plain', headerAlign: 'left', items: 'accent', icons: false, nameSize: 30 }),
  T('emerald-rail', 'Emerald Rail', 'Green rail, bold rule under your name.', true, { decor: 'rail', accent: '#047857', headingFont: 'Outfit', bodyFont: 'Figtree', heading: 'accent-left', headerAlign: 'rule', icons: false }),
  T('crimson-rail', 'Crimson Rail', 'Serif headings with a crimson edge.', true, { decor: 'rail', accent: '#B91C1C', headingFont: 'Lora', bodyFont: 'Source Sans 3', heading: 'caps', headerAlign: 'center', icons: false }),
  T('graphite-rail', 'Graphite Rail', 'Monogram, graphite rail, crisp grotesk type.', true, { decor: 'rail', accent: '#18181B', headingFont: 'Space Grotesk', bodyFont: 'Inter', heading: 'underline', monogram: true, headerAlign: 'left', icons: false }),
  T('violet-rail', 'Violet Rail', 'Impact tiles up top and a violet rail.', true, { decor: 'rail', accent: '#6D28D9', headingFont: 'Jost', bodyFont: 'Jost', heading: 'boxed', tiles: true, headerAlign: 'left', icons: false }),
  // Dark banner header
  T('midnight-banner', 'Midnight Banner', 'Deep navy banner with sky-blue highlights.', true, { headColor: '#0369A1', headerAlign: 'banner', bandBg: '#0B1220', accent: '#38BDF8', headingFont: 'Montserrat', bodyFont: 'Inter', heading: 'bar', icons: true }),
  T('charcoal-gold', 'Charcoal & Gold', 'Luxurious charcoal banner, gold rules.', true, { headColor: '#A16207', headerAlign: 'banner', bandBg: '#1C1917', accent: '#CA8A04', headingFont: 'Playfair Display', bodyFont: 'Lato', heading: 'underline', headingCase: 'none' }),
  T('navy-command', 'Navy Command', 'Monogram in a navy banner for executives.', true, { headColor: '#1D4ED8', headerAlign: 'banner', bandBg: '#172554', accent: '#60A5FA', headingFont: 'Libre Baskerville', bodyFont: 'Source Sans 3', heading: 'caps', monogram: true }),
  T('forest-banner', 'Forest Banner', 'Forest green banner with impact tiles.', true, { headColor: '#15803D', headerAlign: 'banner', bandBg: '#052E16', accent: '#4ADE80', headingFont: 'Outfit', bodyFont: 'Inter', heading: 'accent-left', tiles: true }),
  T('plum-banner', 'Plum Banner', 'Rich plum banner with dotted headings.', true, { headColor: '#86198F', headerAlign: 'banner', bandBg: '#3B0764', accent: '#E879F9', headingFont: 'DM Serif Display', bodyFont: 'DM Sans', heading: 'dotted', headingCase: 'none' }),
  // Framed page
  T('framed-classic', 'Framed Classic', 'A fine border frames a classic serif resume.', true, { decor: 'frame', accent: '#111111', headingFont: 'EB Garamond', bodyFont: 'EB Garamond', heading: 'caps', headerAlign: 'center', icons: false, baseSize: 10.5 }),
  T('framed-modern', 'Framed Modern', 'Modern frame, bold rule, side-bar headings.', true, { decor: 'frame', accent: '#2563EB', headingFont: 'Inter', bodyFont: 'Inter', heading: 'bar', headerAlign: 'rule', icons: false }),
  T('framed-serif', 'Framed Serif', 'Elegant Cormorant with centred section lines.', true, { decor: 'frame', accent: '#9A3412', headingFont: 'Cormorant Garamond', bodyFont: 'Jost', heading: 'center-line', headerAlign: 'center', icons: false, nameSize: 30 }),
  T('framed-mono', 'Framed Mono', 'Code-flavoured frame with numbered sections.', true, { decor: 'frame', accent: '#0F172A', headingFont: 'JetBrains Mono', bodyFont: 'IBM Plex Sans', heading: 'plain', numbered: true, headerAlign: 'left', icons: false }),
  T('framed-gold', 'Framed Gold', 'Gold frame and monogram, quietly premium.', true, { decor: 'frame', accent: '#A16207', headingFont: 'Playfair Display', bodyFont: 'Lato', heading: 'dotted', monogram: true, headerAlign: 'center', headingCase: 'none', icons: false }),
  // Top strip + monogram
  T('ocean-strip', 'Ocean Strip', 'Bright top strip and a monogram badge.', true, { decor: 'topstrip', accent: '#0284C7', headingFont: 'Poppins', bodyFont: 'Poppins', heading: 'underline', monogram: true, icons: true }),
  T('coral-strip', 'Coral Strip', 'Energetic coral strip with pill headings.', true, { decor: 'topstrip', accent: '#E11D48', headingFont: 'Bricolage Grotesque', bodyFont: 'Inter', heading: 'pill', monogram: true }),
  T('teal-strip', 'Teal Strip', 'Teal strip, monogram and impact tiles.', true, { decor: 'topstrip', accent: '#0D9488', headingFont: 'Figtree', bodyFont: 'Figtree', heading: 'accent-left', monogram: true, tiles: true }),
  T('amber-strip', 'Amber Strip', 'Warm amber strip with spaced caps.', true, { decor: 'topstrip', accent: '#D97706', headingFont: 'Raleway', bodyFont: 'Lato', heading: 'caps', monogram: true, icons: false }),
  T('indigo-strip', 'Indigo Strip', 'Indigo strip with a big stacked name.', true, { decor: 'topstrip', accent: '#4338CA', headingFont: 'Manrope', bodyFont: 'Inter', heading: 'boxed', headerAlign: 'stacked', icons: false }),
  // Balanced two equal columns
  T('balanced-blue', 'Balanced Blue', 'Two equal columns for skills-heavy roles.', false, { layout: 'equal', accent: '#2563EB', headingFont: 'Inter', bodyFont: 'Inter', heading: 'underline', headerAlign: 'left' }),
  T('balanced-serif', 'Balanced Serif', 'Even columns with a classic serif voice.', false, { layout: 'equal', accent: '#7C2D12', headingFont: 'Lora', bodyFont: 'Source Sans 3', heading: 'caps', headerAlign: 'center' }),
  T('balanced-mono', 'Balanced Mono', 'Black-and-white columns with a bold rule.', false, { layout: 'equal', accent: '#111111', headingFont: 'Space Grotesk', bodyFont: 'Inter', heading: 'bar', headerAlign: 'rule', skills: 'outline' }),
  T('balanced-green', 'Balanced Green', 'Green accents, monogram, balanced layout.', false, { layout: 'equal', accent: '#15803D', headingFont: 'Outfit', bodyFont: 'Figtree', heading: 'accent-left', monogram: true, skills: 'matrix' }),
  T('balanced-rose', 'Balanced Rose', 'Rose serif headings over two columns.', false, { layout: 'equal', accent: '#BE185D', headingFont: 'DM Serif Display', bodyFont: 'DM Sans', heading: 'dotted', headingCase: 'none', skills: 'outline' }),
  // Command: banner header + sidebar
  T('command-blue', 'Command Blue', 'Banner header over a soft blue sidebar.', false, { headColor: '#1E40AF', layout: 'band-side', bandBg: '#1E40AF', accent: '#93C5FD', sidebarBg: '#EFF6FF', headingFont: 'Montserrat', bodyFont: 'Inter', heading: 'bar', skills: 'bars' }),
  T('command-slate', 'Command Slate', 'Slate banner, orange highlights, dot skills.', false, { layout: 'band-side', bandBg: '#0F172A', accent: '#F97316', sidebarBg: '#F8FAFC', headingFont: 'Inter', bodyFont: 'Inter', heading: 'underline', skills: 'dots' }),
  T('command-teal', 'Command Teal', 'Teal banner with a mint sidebar.', false, { headColor: '#0F766E', layout: 'band-side', bandBg: '#134E4A', accent: '#2DD4BF', sidebarBg: '#F0FDFA', headingFont: 'Poppins', bodyFont: 'Poppins', heading: 'accent-left', skills: 'bars' }),
  T('command-wine', 'Command Wine', 'Wine banner, blush sidebar, serif names.', false, { headColor: '#9F1239', layout: 'band-side', bandBg: '#4C0519', accent: '#FB7185', sidebarBg: '#FFF1F2', headingFont: 'Playfair Display', bodyFont: 'Lato', heading: 'underline', headingCase: 'none', skills: 'matrix' }),
  T('command-gold', 'Command Gold', 'Black banner, gold accents, warm sidebar.', false, { headColor: '#A16207', layout: 'band-side', bandBg: '#111827', accent: '#EAB308', sidebarBg: '#FEFCE8', headingFont: 'Raleway', bodyFont: 'Lato', heading: 'caps', monogram: true, skills: 'dots' }),
  // Impact: metric tiles under the name
  T('impact-blue', 'Impact Blue', 'Your top numbers as tiles right under your name.', true, { tiles: true, accent: '#2563EB', headingFont: 'Inter', bodyFont: 'Inter', heading: 'bar', headerAlign: 'left', icons: false }),
  T('impact-night', 'Impact Night', 'Dark banner with glowing impact tiles.', true, { headColor: '#0369A1', tiles: true, headerAlign: 'banner', bandBg: '#0F172A', accent: '#0EA5E9', headingFont: 'Manrope', bodyFont: 'Inter', heading: 'underline' }),
  T('impact-serif', 'Impact Serif', 'Fraunces headlines with impact tiles.', true, { tiles: true, accent: '#9F1239', headingFont: 'Fraunces', bodyFont: 'Inter', heading: 'underline', headerAlign: 'center', icons: false }),
  T('impact-green', 'Impact Green', 'Green rule header and achievement tiles.', true, { tiles: true, accent: '#059669', headingFont: 'Manrope', bodyFont: 'Manrope', heading: 'accent-left', headerAlign: 'rule', icons: false }),
  T('impact-mono', 'Impact Mono', 'Monochrome tiles with card-style jobs.', true, { tiles: true, accent: '#111111', headingFont: 'IBM Plex Sans', bodyFont: 'IBM Plex Sans', heading: 'plain', items: 'card', icons: false }),
  // Statement: huge stacked name
  T('statement-black', 'Statement Black', 'Huge stacked name, impossible to miss.', true, { headerAlign: 'stacked', accent: '#111111', headingFont: 'Archivo Black', bodyFont: 'Work Sans', heading: 'bar', nameSize: 30, icons: false }),
  T('statement-blue', 'Statement Blue', 'Stacked name with a blue surname.', true, { headerAlign: 'stacked', accent: '#1D4ED8', headingFont: 'Bricolage Grotesque', bodyFont: 'Inter', heading: 'underline', icons: false }),
  T('statement-serif', 'Statement Serif', 'Editorial stacked name in DM Serif.', true, { headerAlign: 'stacked', accent: '#44403C', headingFont: 'DM Serif Display', bodyFont: 'Lato', heading: 'caps', icons: false }),
  T('statement-red', 'Statement Red', 'Stacked name plus a red rail.', true, { headerAlign: 'stacked', decor: 'rail', accent: '#DC2626', headingFont: 'Space Grotesk', bodyFont: 'Inter', heading: 'accent-left', icons: false }),
  T('statement-teal', 'Statement Teal', 'Stacked name under a teal strip.', true, { headerAlign: 'stacked', decor: 'topstrip', accent: '#0F766E', headingFont: 'Outfit', bodyFont: 'Figtree', heading: 'plain', items: 'accent', icons: false }),
  // Numbered minimal
  T('numbered-clean', 'Numbered Clean', 'Minimal sections numbered 01, 02, 03.', true, { numbered: true, accent: '#2563EB', headingFont: 'Inter', bodyFont: 'Inter', heading: 'plain', headingCase: 'none', icons: false, gap: 16 }),
  T('numbered-serif', 'Numbered Serif', 'Numbered serif sections with a corner accent.', true, { numbered: true, decor: 'corner', accent: '#78350F', headingFont: 'Lora', bodyFont: 'Source Sans 3', heading: 'underline', icons: false }),
  T('numbered-bold', 'Numbered Bold', 'Filled headings, numbered and bold.', true, { numbered: true, accent: '#111111', headingFont: 'Montserrat', bodyFont: 'Inter', heading: 'filled', icons: false }),
  T('numbered-corner', 'Numbered Corner', 'Violet corner accent and numbered sections.', true, { numbered: true, decor: 'corner', accent: '#7C3AED', headingFont: 'Outfit', bodyFont: 'Outfit', heading: 'underline', monogram: true }),
  T('numbered-grey', 'Numbered Grey', 'Soft grey, dotted headings, rule header.', true, { numbered: true, accent: '#475569', headingFont: 'Work Sans', bodyFont: 'Work Sans', heading: 'dotted', headerAlign: 'rule', items: 'card', icons: false }),
];

export const BASE_DESIGNS = RESUME_DESIGNS.slice();
RESUME_DESIGNS.push(...TOP_DESIGNS);

export const getDesign = (slug) => RESUME_DESIGNS.find((d) => d.slug === slug) || RESUME_DESIGNS[0];

export const RESUME_PALETTES = [
  ['Blue', '#2F5BFF'], ['Navy', '#1E3A8A'], ['Teal', '#0D9488'], ['Green', '#059669'], ['Purple', '#7C3AED'], ['Pink', '#DB2777'],
  ['Coral', '#FF4D2E'], ['Orange', '#EA580C'], ['Gold', '#A16207'], ['Maroon', '#7F1D1D'], ['Slate', '#475569'], ['Black', '#111111'],
];
