import { DEFAULT_THEME, img, makeBlock as b } from './blocks';
import { generateCurvyTemplates, generateTemplates } from './templateGen';

const theme = (t) => ({ ...DEFAULT_THEME, ...t });

// Style categories, then profession categories. The gallery only shows a category once a template uses it.
export const TEMPLATE_CATEGORIES = [
  'All',
  'Minimal', 'Creative', 'Developer', 'Photography', 'Business', 'Link in bio',
  // Tech
  'IT', 'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile App Developer',
  'Data Scientist', 'Data Analyst', 'DevOps Engineer', 'Cybersecurity', 'AI / ML Engineer', 'QA Tester', 'Product Manager',
  // Design & creative
  'Designer', 'Graphic Designer', 'UI/UX Designer', 'Web Designer', 'Illustrator', 'Animator', 'Video Editor',
  'Photographer', 'Videographer', 'Interior Designer', 'Fashion Designer', 'Architect', 'Artist', 'Musician',
  // Business
  'Sales', 'Marketing', 'Digital Marketing', 'Social Media Manager', 'Content Writer', 'Copywriter', 'SEO Specialist',
  'HR', 'Finance', 'Accountant', 'Consultant', 'Entrepreneur', 'Real Estate Agent', 'Lawyer', 'Customer Support',
  // People & services
  'Teacher', 'Student', 'Doctor', 'Nurse', 'Fitness Trainer', 'Chef', 'Event Planner', 'Freelancer',
];

const HANDMADE = [
  {
    slug: 'mono',
    name: 'Mono',
    category: 'Minimal',
    premium: false,
    description: 'Quiet, type-led layout for writers, designers and consultants.',
    theme: theme({ primary: '#1F3A93', bg: '#FFFFFF', surface: '#F6F7F9', text: '#14171F', muted: '#5C6372', border: '#E4E6EB', headingFont: 'Manrope', bodyFont: 'Inter', headingWeight: '800', radius: 6, buttonStyle: 'square', maxWidth: 1040 }),
    blocks: () => [
      b('navbar', { logo: 'Riya Sen' }),
      b('hero', { layout: 'center', kicker: 'Writer & content strategist', title: 'Words that make complicated products feel simple.', subtitle: 'I help SaaS teams write onboarding, docs and product copy people actually read.', image: '' }, { align: 'center', paddingY: 140 }),
      b('about', { image: img('mono-about', 700, 800) }, { anchor: 'about' }),
      b('projects', { title: 'Recent work', columns: 2 }, { anchor: 'work' }),
      b('experience', {}, { width: 'narrow' }),
      b('contact', { showForm: true }, { anchor: 'contact' }),
      b('footer', { text: '© 2026 Riya Sen' }),
    ],
  },
  {
    slug: 'studio',
    name: 'Studio',
    category: 'Creative',
    premium: false,
    description: 'Bold colour and big imagery for designers and illustrators.',
    theme: theme({ primary: '#FF4D2E', secondary: '#1E1E24', bg: '#F7F7FB', surface: '#FFFFFF', text: '#1E1E24', muted: '#6B6B78', border: '#E3E3EC', headingFont: 'Syne', bodyFont: 'DM Sans', headingWeight: '800', letterSpacing: -0.03, radius: 18, buttonStyle: 'pill' }),
    blocks: () => [
      b('navbar', { logo: 'Kabir.Studio' }),
      b('hero', { kicker: 'Brand & illustration', title: 'Loud ideas,\ncarefully made.', subtitle: 'Identity systems and illustration for brands that want to be remembered.', image: img('studio-hero', 800, 1000) }),
      b('logos'),
      b('gallery', { title: 'Latest pieces', columns: 3, layout: 'masonry', images: [1, 2, 3, 4, 5, 6].map((i) => ({ src: img('studio-g' + i, 800, i % 2 ? 1000 : 700), caption: '' })) }, { anchor: 'work' }),
      b('services', {}, { anchor: 'about' }),
      b('testimonials'),
      b('cta'),
      b('contact', { showForm: false }, { anchor: 'contact', align: 'center' }),
      b('footer', { text: '© 2026 Kabir Studio' }),
    ],
  },
  {
    slug: 'terminal',
    name: 'Terminal',
    category: 'Developer',
    premium: false,
    description: 'Dark, code-flavoured portfolio for engineers.',
    theme: theme({ primary: '#3FB950', secondary: '#58A6FF', bg: '#0D1117', surface: '#161B22', text: '#E6EDF3', muted: '#8B949E', border: '#30363D', headingFont: 'JetBrains Mono', bodyFont: 'IBM Plex Sans', headingWeight: '700', letterSpacing: -0.01, radius: 8, pattern: 'grid', baseSize: 16 }),
    blocks: () => [
      b('navbar', { logo: '~/arjun', links: [{ label: 'projects', url: '#work' }, { label: 'stack', url: '#about' }, { label: 'contact', url: '#contact' }] }),
      b('hero', { layout: 'center', kicker: '$ whoami', title: 'Full-stack engineer who likes boring, reliable systems.', subtitle: 'Node, Laravel and Postgres. Currently scaling payments at a fintech in Bengaluru.', image: '', buttonText: 'View projects', button2Text: 'GitHub', button2Url: 'https://github.com' }, { paddingY: 150 }),
      b('stats', { items: [{ value: '1.2k', label: 'GitHub stars' }, { value: '40+', label: 'Repos' }, { value: '6', label: 'Years shipping' }] }, { align: 'center' }),
      b('skills', { title: 'Stack', display: 'tags', items: ['TypeScript', 'Node.js', 'Next.js', 'Laravel', 'MySQL', 'PostgreSQL', 'Redis', 'Docker', 'AWS'].map((n) => ({ name: n, level: 80 })) }, { anchor: 'about' }),
      b('projects', { title: 'Projects', columns: 3, items: [1, 2, 3].map((i) => ({ title: ['queue-kit', 'ledgerly', 'tiny-cron'][i - 1], desc: 'Open-source tool with a one-line description.', image: img('code-' + i, 900, 600), url: 'https://github.com', tags: 'TypeScript, OSS' })) }, { anchor: 'work' }),
      b('experience'),
      b('social', { items: [{ platform: 'GitHub', url: 'https://github.com' }, { platform: 'LinkedIn', url: 'https://linkedin.com' }, { platform: 'Email', url: 'arjun@example.com' }] }, { anchor: 'contact', align: 'center' }),
      b('footer', { text: 'built with ♥ and too much chai' }),
    ],
  },
  {
    slug: 'fullstack',
    name: 'Full Stack Pro',
    category: 'Full Stack Developer',
    premium: false,
    description: 'Interactive developer portfolio: 3D hero, live GitHub, case studies, terminal, API playground, AI chat and ⌘K.',
    theme: theme({
      primary: '#7C5CFF', secondary: '#22D3EE', bg: '#0B0D14', surface: '#131722', text: '#E8EAF2', muted: '#9097AD', border: '#262B3B',
      headingFont: 'Space Grotesk', bodyFont: 'Inter', headingWeight: '700', letterSpacing: -0.03, radius: 14, buttonStyle: 'pill', pattern: 'gradient', baseSize: 16,
      modeToggle: true, commandPalette: true,
      altPrimary: '#5B3DF5', altBg: '#FFFFFF', altSurface: '#F5F6FB', altText: '#151826', altMuted: '#5D6378', altBorder: '#E3E5EF',
    }),
    blocks: () => [
      b('navbar', { logo: 'aarav.dev', links: [{ label: 'Work', url: '#work' }, { label: 'Stack', url: '#stack' }, { label: 'Labs', url: '#labs' }, { label: 'Contact', url: '#contact' }] }),
      b('hero3d', {}, { paddingY: 110, anchor: 'home' }),
      b('stats', { items: [{ value: '5+', label: 'Years shipping' }, { value: '40+', label: 'Projects delivered' }, { value: '2M', label: 'Requests / day handled' }, { value: '1.1k', label: 'GitHub stars' }] }, { align: 'center' }),
      b('about', { title: 'About me', text: 'I started by building WordPress sites in college and fell in love with the backend. Today I design and ship full products: React and Next.js frontends, Node.js APIs, MySQL schemas, and the Docker + AWS setup that keeps them running.\n\nI care about fast pages, boring reliable infrastructure, and clear communication with the people paying for it.', image: img('dev-about', 700, 800) }, { anchor: 'about' }),
      b('techstack', {}, { anchor: 'stack' }),
      b('featured', {}, { anchor: 'work' }),
      b('casestudy', {}, { anchor: 'case-study' }),
      b('architecture', {}, { anchor: 'architecture' }),
      b('experience', { title: 'Experience', items: [{ role: 'Senior Backend Engineer', company: 'Paylite (fintech)', period: '2024 – now', desc: 'Lead the payments API team. Moved settlements to an event-driven pipeline on SQS.' }, { role: 'Full-stack Engineer', company: 'Brightloop', period: '2021 – 2024', desc: 'Built the customer dashboard in Next.js and the Node.js services behind it.' }, { role: 'Freelance Developer', company: 'Self-employed', period: '2019 – 2021', desc: '20+ client projects: stores, booking systems and internal tools.' }] }, { anchor: 'experience', width: 'narrow' }),
      b('github', {}, { anchor: 'github' }),
      b('codingstats', {}),
      b('opensource', {}, { anchor: 'open-source' }),
      b('depgraph', {}),
      b('heading', { text: 'Labs — try things live', level: '2' }, { anchor: 'labs', align: 'center', paddingY: 40 }),
      b('terminal', {}),
      b('apiplayground', {}),
      b('websocket', {}),
      b('playground', {}),
      b('livestatus', {}),
      b('performance', {}, { anchor: 'performance' }),
      b('certs', {}),
      b('testimonials', { title: 'What clients say' }),
      b('services', { title: 'Services', items: [{ title: 'Web apps', desc: 'React / Next.js products from idea to launch.' }, { title: 'APIs & backends', desc: 'Node.js services, MySQL design, integrations.' }, { title: 'SaaS MVPs', desc: 'Auth, billing, dashboards — shipped in weeks.' }, { title: 'DevOps', desc: 'Docker, CI/CD and AWS setups that stay up.' }] }, { anchor: 'services' }),
      b('blog', {}, { anchor: 'blog' }),
      b('learning', {}),
      b('resume', { text: 'Want the one-page version?', label: 'Download CV (PDF)' }),
      b('contact', { title: 'Let’s build something', text: 'Tell me about your product, timeline and budget. I reply within a day.' }, { anchor: 'contact' }),
      b('social', { items: [{ platform: 'GitHub', url: 'https://github.com' }, { platform: 'LinkedIn', url: 'https://linkedin.com' }, { platform: 'X', url: 'https://x.com' }, { platform: 'Email', url: 'hello@example.com' }] }, { align: 'center' }),
      b('chatbot', {}),
      b('footer', { text: '© 2026 Aarav Sharma · Press ⌘K to explore' }),
    ],
  },
  {
    slug: 'lens',
    name: 'Lens',
    category: 'Photography',
    premium: true,
    description: 'Full-bleed cover and galleries that let photos lead.',
    theme: theme({ primary: '#E8C468', secondary: '#E8C468', bg: '#0E0E0E', surface: '#171717', text: '#F2F2F2', muted: '#A3A3A3', border: '#2A2A2A', headingFont: 'Cormorant Garamond', bodyFont: 'Jost', headingWeight: '600', letterSpacing: 0, radius: 2, buttonStyle: 'square', maxWidth: 1280 }),
    blocks: () => [
      b('navbar', { logo: 'MEERA KAUL', links: [{ label: 'Portfolio', url: '#work' }, { label: 'Stories', url: '#stories' }, { label: 'Book', url: '#contact' }] }),
      b('hero', { layout: 'cover', kicker: 'Wedding & travel photography', title: 'Light, people, and places worth remembering.', subtitle: 'Based in Jaipur. Travelling everywhere.', image: img('lens-cover', 1800, 1100), buttonText: 'View portfolio', button2Text: 'Book a shoot' }, { width: 'full' }),
      b('gallery', { title: '', columns: 3, layout: 'grid', images: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => ({ src: img('lens-' + i, 900, 900), caption: '' })) }, { anchor: 'work', width: 'full' }),
      b('quote', { text: 'Photography is the story I fail to put into words.', author: 'Destin Sparks' }),
      b('gallery', { title: 'Stories', columns: 2, layout: 'wide', images: [1, 2, 3, 4].map((i) => ({ src: img('lens-story-' + i, 1400, 800), caption: ['Udaipur wedding', 'Ladakh in winter', 'Kerala backwaters', 'Old Delhi mornings'][i - 1] })) }, { anchor: 'stories' }),
      b('pricing', { title: 'Sessions', items: [{ name: 'Portrait', price: '₹12,000', features: '2 hours\n40 edited photos', highlight: false }, { name: 'Wedding day', price: '₹1,20,000', features: 'Full day\n600+ edited photos\nPrinted album', highlight: true }, { name: 'Travel', price: 'On request', features: 'Brand & tourism shoots', highlight: false }] }),
      b('contact', { title: 'Book a shoot', showForm: true }, { anchor: 'contact' }),
      b('footer', { text: '© 2026 Meera Kaul Photography' }),
    ],
  },
  {
    slug: 'atelier',
    name: 'Atelier',
    category: 'Creative',
    premium: true,
    description: 'Elegant serif and script styling for fashion and lifestyle.',
    theme: theme({ primary: '#7A3E65', secondary: '#C9A9BE', bg: '#F6F2F5', surface: '#FFFFFF', text: '#2B1F28', muted: '#76687A', border: '#E5DCE2', headingFont: 'Playfair Display', bodyFont: 'Lato', headingWeight: '500', letterSpacing: 0, radius: 0, buttonStyle: 'square', pattern: 'none' }),
    blocks: () => [
      b('navbar', { logo: 'Ananya Atelier' }),
      b('hero', { layout: 'image-left', kicker: 'Fashion designer', title: 'Handwoven textiles, modern silhouettes.', subtitle: 'Small-batch collections made with weavers across Rajasthan.', image: img('atelier-hero', 800, 1000), buttonText: 'Explore the collection', button2Text: '' }),
      b('heading', { text: 'The collection', level: '2' }, { align: 'center', anchor: 'work' }),
      b('gallery', { title: '', columns: 4, layout: 'grid', images: [1, 2, 3, 4].map((i) => ({ src: img('atelier-' + i, 800, 1000), caption: '' })) }),
      b('about', { title: 'The studio', image: img('atelier-about', 700, 800) }, { anchor: 'about', bg: '#FFFFFF' }),
      b('testimonials', { title: 'Press' }),
      b('social', { items: [{ platform: 'Instagram', url: 'https://instagram.com' }, { platform: 'Facebook', url: 'https://facebook.com' }, { platform: 'WhatsApp', url: 'https://wa.me/919876543210' }] }, { align: 'center' }),
      b('contact', { title: 'Visit or write', showForm: true }, { anchor: 'contact' }),
      b('footer', { text: '© 2026 Ananya Atelier, Jaipur' }),
    ],
  },
  {
    slug: 'pastel',
    name: 'Pastel Pop',
    category: 'Creative',
    premium: false,
    description: 'Friendly rounded shapes and soft colour for UI/UX designers.',
    theme: theme({ primary: '#7C4DFF', secondary: '#FF8FB1', bg: '#FBF8FF', surface: '#FFFFFF', text: '#2A2340', muted: '#6E6788', border: '#E9E1F7', headingFont: 'Fredoka', bodyFont: 'Nunito', headingWeight: '600', letterSpacing: -0.01, radius: 24, buttonStyle: 'pill', pattern: 'dots' }),
    blocks: () => [
      b('navbar', { logo: 'zoya.design' }),
      b('hero', { kicker: 'UI/UX designer', title: 'Interfaces that feel like a friendly nudge.', image: img('pastel-hero', 800, 1000) }),
      b('skills', { display: 'circles' }, { align: 'center' }),
      b('projects', { columns: 3, items: [1, 2, 3].map((i) => ({ title: ['Budget buddy', 'Plant pal', 'Study sprint'][i - 1], desc: 'Mobile app case study.', image: img('pastel-p' + i, 900, 600), url: '#', tags: 'Mobile, Research' })) }, { anchor: 'work' }),
      b('about', {}, { anchor: 'about' }),
      b('faq'),
      b('cta', { title: 'Let’s make something lovely' }),
      b('footer', { text: 'Made with lots of tiny details © 2026' }),
    ],
  },
  {
    slug: 'executive',
    name: 'Executive',
    category: 'Business',
    premium: true,
    description: 'Polished resume-style site for leaders and consultants.',
    theme: theme({ primary: '#0B5394', secondary: '#C7A008', bg: '#FFFFFF', surface: '#F4F7FA', text: '#1A2330', muted: '#5A6878', border: '#DDE4EC', headingFont: 'Libre Baskerville', bodyFont: 'Source Sans 3', headingWeight: '700', letterSpacing: -0.01, radius: 4, buttonStyle: 'square', baseSize: 18 }),
    blocks: () => [
      b('navbar', { logo: 'Vikram Mehta', links: [{ label: 'Profile', url: '#about' }, { label: 'Career', url: '#career' }, { label: 'Contact', url: '#contact' }] }),
      b('hero', { kicker: 'Chief Operating Officer', title: 'Building operations that scale with confidence.', subtitle: '20 years leading supply chain and operations for consumer brands across India and the Middle East.', image: img('exec-hero', 800, 1000), buttonText: 'Download CV', button2Text: 'Contact' }),
      b('stats', { items: [{ value: '₹900Cr', label: 'P&L managed' }, { value: '3', label: 'Turnarounds led' }, { value: '1,400', label: 'People in org' }] }, { bg: '#F4F7FA' }),
      b('about', { title: 'Profile' }, { anchor: 'about' }),
      b('experience', { title: 'Career' }, { anchor: 'career', width: 'narrow' }),
      b('education', {}, { width: 'narrow' }),
      b('testimonials', { title: 'Endorsements' }),
      b('resume', {}),
      b('contact', { showForm: false }, { anchor: 'contact' }),
      b('footer', { text: '© 2026 Vikram Mehta' }),
    ],
  },
  {
    slug: 'neon',
    name: 'Neon',
    category: 'Business',
    premium: true,
    description: 'Glowing dark theme for freelancers who sell services.',
    theme: theme({ primary: '#00E5FF', secondary: '#FF2E97', bg: '#0A0A1A', surface: '#12122A', text: '#F1F1FF', muted: '#9A9AC0', border: '#26264A', headingFont: 'Space Grotesk', bodyFont: 'Outfit', headingWeight: '700', letterSpacing: -0.03, radius: 14, buttonStyle: 'pill', pattern: 'gradient' }),
    blocks: () => [
      b('navbar', { logo: 'NEHA/DEV', links: [{ label: 'Services', url: '#services' }, { label: 'Pricing', url: '#pricing' }, { label: 'Work', url: '#work' }, { label: 'Contact', url: '#contact' }] }),
      b('hero', { layout: 'center', kicker: 'Freelance web developer', title: 'Fast websites for small brands that want to look big.', subtitle: 'Next.js sites, online stores and landing pages. Delivered in weeks, not months.', image: '' }, { paddingY: 160 }),
      b('services', { title: 'Services' }, { anchor: 'services' }),
      b('pricing', {}, { anchor: 'pricing' }),
      b('projects', { columns: 3, items: [1, 2, 3].map((i) => ({ title: 'Client site ' + i, desc: 'Launched in 3 weeks, 98 Lighthouse score.', image: img('neon-p' + i, 900, 600), url: '#', tags: 'Next.js, Shopify' })) }, { anchor: 'work' }),
      b('faq'),
      b('cta'),
      b('contact', {}, { anchor: 'contact' }),
      b('footer', { text: '© 2026 Neha Dev' }),
    ],
  },
  {
    slug: 'linkhub',
    name: 'Linkhub',
    category: 'Link in bio',
    premium: false,
    description: 'One-page link-in-bio for creators and social profiles.',
    theme: theme({ primary: '#111111', secondary: '#FFD23F', bg: '#FFE8D6', surface: '#FFFFFF', text: '#111111', muted: '#5A4A3F', border: '#E8C9B0', headingFont: 'Archivo Black', bodyFont: 'Work Sans', headingWeight: '400', letterSpacing: 0, radius: 14, maxWidth: 640, buttonStyle: 'pill' }),
    blocks: () => [
      b('image', { src: img('linkhub-avatar', 300, 300), width: 30, rounded: true }, { paddingY: 48 }),
      b('heading', { text: '@tara.cooks', level: '2' }, { align: 'center', paddingY: 0 }),
      b('text', { text: 'Home recipes, 15 minutes or less. New video every Friday.' }, { align: 'center', paddingY: 8 }),
      b('links', {}, { paddingY: 24 }),
      b('video', { title: '' }, { paddingY: 24 }),
      b('social', { items: [{ platform: 'Instagram', url: 'https://instagram.com' }, { platform: 'YouTube', url: 'https://youtube.com' }, { platform: 'TikTok', url: 'https://tiktok.com' }] }, { align: 'center' }),
      b('footer', { text: '© 2026 Tara Cooks' }),
    ],
  },
  {
    slug: 'blank',
    name: 'Blank canvas',
    category: 'Minimal',
    premium: false,
    description: 'Start from a clean page and drag in only what you need.',
    theme: theme({}),
    blocks: () => [b('navbar'), b('hero', { layout: 'center', image: '' }), b('footer')],
  },
];

// Hand-made templates first, then generated ones to bring every category up to 20.
// Curvy templates (curved edges + background shapes) are added on top of each category's 20.
export const TEMPLATES = [...HANDMADE, ...generateTemplates(TEMPLATE_CATEGORIES.slice(1), HANDMADE), ...generateCurvyTemplates(TEMPLATE_CATEGORIES.slice(1))];
const BY_SLUG = new Map(TEMPLATES.map((t) => [t.slug, t]));

export function getTemplate(slug) {
  return BY_SLUG.get(slug) || null;
}

export function portfolioFromTemplate(slug) {
  const t = getTemplate(slug) || TEMPLATES[0];
  return {
    name: `My ${t.name} portfolio`,
    template: t.slug,
    theme: { ...t.theme },
    blocks: t.blocks(),
    page: { title: '', description: '', favicon: '' },
  };
}
