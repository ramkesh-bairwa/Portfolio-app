export const img = (seed, w = 900, h = 700) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const uid = () => 'b' + Math.random().toString(36).slice(2, 10);

const f = (k, label, t = 'text', extra = {}) => ({ k, label, t, ...extra });
const title = f('title', 'Section title');

export const SOCIAL_PLATFORMS = [
  'GitHub', 'LinkedIn', 'X', 'Instagram', 'Dribbble', 'Behance', 'YouTube',
  'Facebook', 'TikTok', 'Medium', 'WhatsApp', 'Email', 'Website',
];

export const BLOCK_GROUPS = ['Layout', 'Basic', 'Media', 'Profile', 'Showcase', 'Sections', 'Developer', 'Interactive', 'Links', 'Advanced'];

const links2 = [f('liveUrl', 'Live demo link', 'url'), f('githubUrl', 'GitHub link', 'url')];

export const BLOCKS = {
  navbar: {
    label: 'Navigation', group: 'Layout', icon: 'Menu',
    defaults: () => ({ logo: 'Your Name', links: [{ label: 'Work', url: '#work' }, { label: 'About', url: '#about' }, { label: 'Contact', url: '#contact' }] }),
    fields: [f('logo', 'Logo text'), f('logoImage', 'Logo image', 'image'), f('links', 'Menu links', 'list', { item: { label: 'Link', url: '#' }, fields: [f('label', 'Label'), f('url', 'URL', 'url')] })],
  },
  hero: {
    label: 'Hero', group: 'Layout', icon: 'Sparkles',
    defaults: () => ({ layout: 'split', kicker: 'Product designer', title: 'I design calm software for busy people.', subtitle: 'Eight years shaping apps for fintech and health teams.', image: img('hero-portrait', 800, 1000), buttonText: 'See my work', buttonUrl: '#work', button2Text: 'Get in touch', button2Url: '#contact' }),
    fields: [
      f('layout', 'Layout', 'select', { options: [['split', 'Text + image'], ['center', 'Centered'], ['image-left', 'Image + text'], ['cover', 'Full background image']] }),
      f('kicker', 'Small line above title'), f('title', 'Title', 'textarea'), f('subtitle', 'Subtitle', 'textarea'), f('image', 'Image', 'image'),
      f('buttonText', 'Button text'), f('buttonUrl', 'Button link', 'url'), f('button2Text', 'Second button text'), f('button2Url', 'Second button link', 'url'),
    ],
  },
  heading: {
    label: 'Heading', group: 'Basic', icon: 'Heading',
    defaults: () => ({ text: 'Section heading', level: '2' }),
    fields: [f('text', 'Text', 'textarea'), f('level', 'Size', 'select', { options: [['1', 'Extra large'], ['2', 'Large'], ['3', 'Medium'], ['4', 'Small']] })],
  },
  text: {
    label: 'Paragraph', group: 'Basic', icon: 'Pilcrow',
    defaults: () => ({ text: 'Write something about your work, your process, or what makes you different.' }),
    fields: [f('text', 'Text', 'textarea', { rows: 6 })],
  },
  button: {
    label: 'Button', group: 'Basic', icon: 'MousePointerClick',
    defaults: () => ({ text: 'Download my CV', url: '#', variant: 'primary', newTab: false }),
    fields: [f('text', 'Text'), f('url', 'Link', 'url'), f('variant', 'Style', 'select', { options: [['primary', 'Filled'], ['outline', 'Outline'], ['ghost', 'Subtle']] }), f('newTab', 'Open in new tab', 'toggle')],
  },
  quote: {
    label: 'Quote', group: 'Basic', icon: 'Quote',
    defaults: () => ({ text: 'Good design is as little design as possible.', author: 'Dieter Rams' }),
    fields: [f('text', 'Quote', 'textarea'), f('author', 'Author')],
  },
  divider: {
    label: 'Divider', group: 'Basic', icon: 'Minus',
    defaults: () => ({ style: 'line' }),
    fields: [f('style', 'Style', 'select', { options: [['line', 'Line'], ['dashed', 'Dashed'], ['dots', 'Dots'], ['accent', 'Accent bar']] })],
  },
  spacer: {
    label: 'Spacer', group: 'Basic', icon: 'MoveVertical',
    defaults: () => ({ height: 60 }),
    fields: [f('height', 'Height (px)', 'range', { min: 8, max: 300 })],
  },
  image: {
    label: 'Image', group: 'Media', icon: 'Image',
    defaults: () => ({ src: img('single-image', 1400, 800), alt: '', caption: '', width: 100, rounded: true, link: '' }),
    fields: [f('src', 'Image', 'image'), f('alt', 'Alt text'), f('caption', 'Caption'), f('link', 'Link when clicked', 'url'), f('width', 'Width (%)', 'range', { min: 20, max: 100 }), f('rounded', 'Rounded corners', 'toggle')],
  },
  gallery: {
    label: 'Gallery', group: 'Media', icon: 'LayoutGrid',
    defaults: () => ({ title: 'Selected shots', columns: 3, layout: 'grid', images: [1, 2, 3, 4, 5, 6].map((i) => ({ src: img('gallery-' + i, 800, 800), caption: '' })) }),
    fields: [title, f('columns', 'Columns', 'range', { min: 1, max: 6 }), f('layout', 'Layout', 'select', { options: [['grid', 'Square grid'], ['masonry', 'Masonry'], ['wide', 'Wide (16:9)']] }), f('images', 'Images', 'list', { bulkImage: true, item: { src: '', caption: '' }, fields: [f('src', 'Image', 'image'), f('caption', 'Caption')] })],
  },
  video: {
    label: 'Video', group: 'Media', icon: 'Youtube',
    defaults: () => ({ title: '', url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U' }),
    fields: [title, f('url', 'YouTube / Vimeo / MP4 link', 'url')],
  },
  logos: {
    label: 'Client logos', group: 'Media', icon: 'Building2',
    defaults: () => ({ title: 'Trusted by', items: [1, 2, 3, 4, 5].map((i) => ({ src: img('logo-' + i, 240, 100), name: 'Client ' + i })) }),
    fields: [title, f('items', 'Logos', 'list', { bulkImage: true, item: { src: '', name: '' }, fields: [f('src', 'Logo', 'image'), f('name', 'Name')] })],
  },
  about: {
    label: 'About me', group: 'Profile', icon: 'User',
    defaults: () => ({ title: 'About', text: 'I grew up taking radios apart and now I take user flows apart. I care about clear language, fast interfaces, and teams that ship.', image: img('about-me', 700, 800) }),
    fields: [title, f('text', 'Text', 'textarea', { rows: 6 }), f('image', 'Photo', 'image')],
  },
  skills: {
    label: 'Skills', group: 'Profile', icon: 'Gauge',
    defaults: () => ({ title: 'Skills', display: 'bars', items: [{ name: 'Product design', level: 92 }, { name: 'Prototyping', level: 85 }, { name: 'User research', level: 78 }, { name: 'Front-end code', level: 64 }] }),
    fields: [title, f('display', 'Display', 'select', { options: [['bars', 'Progress bars'], ['tags', 'Tags'], ['circles', 'Rings']] }), f('items', 'Skills', 'list', { item: { name: 'Skill', level: 70 }, fields: [f('name', 'Skill'), f('level', 'Level %', 'range', { min: 0, max: 100 })] })],
  },
  experience: {
    label: 'Experience', group: 'Profile', icon: 'Briefcase',
    defaults: () => ({ title: 'Experience', items: [{ role: 'Lead Designer', company: 'Northwind', period: '2022 – now', desc: 'Leading design for the payments platform.' }, { role: 'Product Designer', company: 'Brightloop', period: '2018 – 2022', desc: 'Shipped the mobile app from zero to 1M users.' }] }),
    fields: [title, f('items', 'Jobs', 'list', { item: { role: 'Role', company: 'Company', period: '', desc: '' }, fields: [f('role', 'Role'), f('company', 'Company'), f('period', 'Period'), f('desc', 'Description', 'textarea')] })],
  },
  education: {
    label: 'Education', group: 'Profile', icon: 'GraduationCap',
    defaults: () => ({ title: 'Education', items: [{ degree: 'B.Des, Interaction Design', school: 'National Institute of Design', period: '2014 – 2018' }] }),
    fields: [title, f('items', 'Entries', 'list', { item: { degree: '', school: '', period: '' }, fields: [f('degree', 'Degree / course'), f('school', 'School'), f('period', 'Period')] })],
  },
  stats: {
    label: 'Numbers', group: 'Profile', icon: 'BarChart3',
    defaults: () => ({ items: [{ value: '8+', label: 'Years of practice' }, { value: '60', label: 'Projects shipped' }, { value: '24', label: 'Happy clients' }] }),
    fields: [f('items', 'Numbers', 'list', { item: { value: '0', label: 'Label' }, fields: [f('value', 'Value'), f('label', 'Label')] })],
  },
  resume: {
    label: 'Resume download', group: 'Profile', icon: 'FileDown',
    defaults: () => ({ text: 'Want the full story?', label: 'Download resume (PDF)', url: '#' }),
    fields: [f('text', 'Text'), f('label', 'Button text'), f('url', 'File link', 'url')],
  },
  projects: {
    label: 'Projects', group: 'Showcase', icon: 'FolderKanban',
    defaults: () => ({ title: 'Selected work', columns: 2, items: [1, 2, 3, 4].map((i) => ({ title: 'Project ' + i, desc: 'A short line about the problem and the result.', image: img('project-' + i, 900, 600), url: '#', tags: 'UX, Mobile' })) }),
    fields: [title, f('columns', 'Columns', 'range', { min: 1, max: 4 }), f('items', 'Projects', 'list', { item: { title: 'New project', desc: '', image: '', url: '', tags: '' }, fields: [f('title', 'Title'), f('desc', 'Description', 'textarea'), f('image', 'Cover image', 'image'), f('url', 'Link', 'url'), f('tags', 'Tags (comma separated)')] })],
  },
  services: {
    label: 'Services', group: 'Showcase', icon: 'Layers',
    defaults: () => ({ title: 'What I do', items: [{ title: 'Product design', desc: 'From research to polished UI.' }, { title: 'Design systems', desc: 'Components your team will actually use.' }, { title: 'Prototyping', desc: 'Clickable ideas within days.' }] }),
    fields: [title, f('items', 'Services', 'list', { item: { title: 'Service', desc: '' }, fields: [f('title', 'Title'), f('desc', 'Description', 'textarea')] })],
  },
  testimonials: {
    label: 'Testimonials', group: 'Showcase', icon: 'MessageSquareQuote',
    defaults: () => ({ title: 'Kind words', items: [{ quote: 'The clearest designer I have worked with.', name: 'Asha Rao', role: 'CEO, Northwind', avatar: img('avatar-1', 120, 120) }, { quote: 'Our conversion went up 30% after the redesign.', name: 'Dev Malhotra', role: 'PM, Brightloop', avatar: img('avatar-2', 120, 120) }] }),
    fields: [title, f('items', 'Testimonials', 'list', { item: { quote: '', name: '', role: '', avatar: '' }, fields: [f('quote', 'Quote', 'textarea'), f('name', 'Name'), f('role', 'Role'), f('avatar', 'Photo', 'image')] })],
  },
  pricing: {
    label: 'Pricing', group: 'Showcase', icon: 'BadgeIndianRupee',
    defaults: () => ({ title: 'Packages', items: [{ name: 'Starter', price: '₹15,000', features: 'Landing page\n2 revisions\n1 week', highlight: false }, { name: 'Studio', price: '₹45,000', features: 'Full website\nDesign system\nUnlimited revisions', highlight: true }] }),
    fields: [title, f('items', 'Plans', 'list', { item: { name: 'Plan', price: '', features: '', highlight: false }, fields: [f('name', 'Name'), f('price', 'Price'), f('features', 'Features (one per line)', 'textarea'), f('highlight', 'Highlight', 'toggle')] })],
  },
  faq: {
    label: 'FAQ', group: 'Showcase', icon: 'HelpCircle',
    defaults: () => ({ title: 'Questions', items: [{ q: 'How long does a project take?', a: 'Most projects take three to six weeks.' }, { q: 'Do you work remotely?', a: 'Yes, with teams in any time zone.' }] }),
    fields: [title, f('items', 'Questions', 'list', { item: { q: 'Question', a: '' }, fields: [f('q', 'Question'), f('a', 'Answer', 'textarea')] })],
  },
  cta: {
    label: 'Call to action', group: 'Showcase', icon: 'Megaphone',
    defaults: () => ({ title: 'Have a project in mind?', text: 'I take on two new clients each quarter.', buttonText: 'Start a conversation', buttonUrl: '#contact' }),
    fields: [f('title', 'Title'), f('text', 'Text', 'textarea'), f('buttonText', 'Button text'), f('buttonUrl', 'Button link', 'url')],
  },
  links: {
    label: 'Link list', group: 'Links', icon: 'Link',
    defaults: () => ({ items: [{ label: 'My latest case study', url: 'https://example.com', note: '' }, { label: 'Book a 20-min call', url: 'https://example.com', note: 'Free' }, { label: 'Read my blog', url: 'https://example.com', note: '' }] }),
    fields: [f('items', 'Links', 'list', { item: { label: 'New link', url: 'https://', note: '' }, fields: [f('label', 'Label'), f('url', 'URL', 'url'), f('note', 'Small note')] })],
  },
  social: {
    label: 'Social links', group: 'Links', icon: 'Share2',
    defaults: () => ({ items: [{ platform: 'LinkedIn', url: 'https://linkedin.com' }, { platform: 'GitHub', url: 'https://github.com' }, { platform: 'Instagram', url: 'https://instagram.com' }] }),
    fields: [f('items', 'Profiles', 'list', { item: { platform: 'Website', url: 'https://' }, fields: [f('platform', 'Platform', 'select', { options: SOCIAL_PLATFORMS.map((p) => [p, p]) }), f('url', 'URL', 'url')] })],
  },
  contact: {
    label: 'Contact', group: 'Links', icon: 'Mail',
    defaults: () => ({ title: 'Let’s talk', text: 'Tell me about your project and timeline.', email: 'hello@example.com', phone: '+91 98765 43210', whatsapp: '', address: 'Jaipur, India', showForm: true }),
    fields: [title, f('text', 'Text', 'textarea'), f('email', 'Email'), f('phone', 'Phone'), f('whatsapp', 'WhatsApp number (with country code)'), f('address', 'Location'), f('showForm', 'Show contact form', 'toggle')],
  },
  map: {
    label: 'Map', group: 'Links', icon: 'MapPin',
    defaults: () => ({ query: 'Hawa Mahal, Jaipur', height: 360 }),
    fields: [f('query', 'Address or place'), f('height', 'Height', 'range', { min: 200, max: 600 })],
  },
  // ---------- Developer ----------
  hero3d: {
    label: '3D hero', group: 'Developer', icon: 'Orbit',
    defaults: () => ({
      kicker: 'Hi, I’m Aarav 👋', title: 'Full-stack engineer building fast, reliable web products.',
      subtitle: 'React and Next.js on the front, Node.js, MySQL, Docker and AWS behind it. Five years shipping SaaS for startups.',
      available: 'Available for freelance work',
      words: 'React, Next.js, Node.js, TypeScript, MySQL, Docker, AWS, Redis, GraphQL, Tailwind, PostgreSQL, Kubernetes, Git, Linux, REST, WebSockets, Jest, Nginx',
      buttonText: 'View projects', buttonUrl: '#work', button2Text: 'Hire me', button2Url: '#contact',
    }),
    fields: [
      f('kicker', 'Small line above title'), f('title', 'Title', 'textarea'), f('subtitle', 'Subtitle', 'textarea'),
      f('available', 'Status badge (leave empty to hide)'), f('words', 'Words on the 3D sphere (comma separated)', 'textarea'),
      f('buttonText', 'Button text'), f('buttonUrl', 'Button link', 'url'), f('button2Text', 'Second button text'), f('button2Url', 'Second button link', 'url'),
    ],
  },
  techstack: {
    label: 'Tech stack', group: 'Developer', icon: 'Cpu',
    defaults: () => ({
      title: 'Tech stack', display: 'icons',
      groups: [
        { name: 'Frontend', items: 'React, Next.js, TypeScript, Tailwind CSS, Redux' },
        { name: 'Backend', items: 'Node.js, Express, GraphQL, REST APIs' },
        { name: 'Database', items: 'MySQL, PostgreSQL, MongoDB, Redis' },
        { name: 'DevOps & Cloud', items: 'Docker, AWS, Nginx, GitHub Actions, Linux' },
      ],
    }),
    fields: [
      title, f('display', 'Display', 'select', { options: [['icons', 'Logo tiles'], ['chips', 'Compact chips']] }),
      f('groups', 'Categories', 'list', { item: { name: 'Category', items: '' }, fields: [f('name', 'Category'), f('items', 'Technologies (comma separated)', 'textarea')] }),
    ],
  },
  featured: {
    label: 'Featured projects', group: 'Developer', icon: 'Rocket',
    defaults: () => ({
      title: 'Featured projects', layout: 'alternating', filters: true,
      items: [
        { title: 'ShipFast — SaaS starter kit', desc: 'Multi-tenant SaaS boilerplate with auth, Stripe billing, teams and an admin panel.', image: img('feat-1', 1200, 800), metric: '300+ teams onboarded', tags: 'Next.js, Stripe, MySQL', liveUrl: 'https://example.com', githubUrl: 'https://github.com', shots: [] },
        { title: 'Pulse — real-time analytics', desc: 'Self-hosted analytics with live dashboards streamed over WebSockets.', image: img('feat-2', 1200, 800), metric: '2M events / day', tags: 'Node.js, Redis, WebSockets', liveUrl: 'https://example.com', githubUrl: 'https://github.com', shots: [] },
        { title: 'Deployr — one-click Docker deploys', desc: 'CLI and dashboard that ships any Dockerfile to AWS with zero-downtime rollouts.', image: img('feat-3', 1200, 800), metric: '1.1k GitHub stars', tags: 'Docker, AWS, Go', liveUrl: '', githubUrl: 'https://github.com', shots: [] },
      ],
    }),
    fields: [
      title,
      f('layout', 'Layout', 'select', { options: [['alternating', 'Big alternating rows'], ['grid', 'Card grid']] }),
      f('filters', 'Show tag filters', 'toggle'),
      f('items', 'Projects', 'list', {
        item: { title: 'New project', desc: '', image: '', metric: '', tags: '', liveUrl: '', githubUrl: '', shots: [] },
        fields: [
          f('title', 'Title'), f('desc', 'Description', 'textarea'), f('image', 'Cover image', 'image'), f('metric', 'Key result (e.g. 40% faster)'),
          f('tags', 'Tags (comma separated)'), ...links2,
          f('shots', 'Screenshots', 'list', { bulkImage: true, item: { src: '' }, fields: [f('src', 'Screenshot', 'image')] }),
        ],
      }),
    ],
  },
  casestudy: {
    label: 'Case study', group: 'Developer', icon: 'BookOpen',
    defaults: () => ({
      kicker: 'Case study', title: 'Cutting checkout latency by 62% for a D2C brand', image: img('case-cover', 1400, 700),
      problem: 'Checkout took 4.8s on mobile and failed under sale-day traffic. Every extra second was costing roughly 7% of orders.',
      solution: 'Moved pricing and inventory reads to Redis, split the monolith’s checkout into its own Node.js service, and made payment webhooks idempotent with a queue.',
      architecture: 'Next.js storefront → API gateway → checkout service → Redis cache + MySQL (RDS) · payment events through SQS workers.',
      archImage: '',
      results: [{ value: '62%', label: 'Faster checkout' }, { value: '3.1×', label: 'Peak throughput' }, { value: '0', label: 'Downtime during migration' }],
      stack: 'Next.js, Node.js, Redis, MySQL, AWS SQS', liveUrl: 'https://example.com', githubUrl: '',
    }),
    fields: [
      f('kicker', 'Small line above title'), f('title', 'Title', 'textarea'), f('image', 'Cover image', 'image'),
      f('problem', '1. Problem', 'textarea', { rows: 4 }), f('solution', '2. Solution', 'textarea', { rows: 4 }),
      f('architecture', '3. Architecture', 'textarea', { rows: 4 }), f('archImage', 'Architecture diagram image', 'image'),
      f('results', '4. Results', 'list', { item: { value: '', label: '' }, fields: [f('value', 'Value'), f('label', 'Label')] }),
      f('stack', 'Tech used (comma separated)'), ...links2,
    ],
  },
  architecture: {
    label: 'Architecture diagram', group: 'Developer', icon: 'Workflow',
    defaults: () => ({
      title: 'System architecture', text: 'How ShipFast serves 2M requests a day. Click any part to see what it does.', image: '',
      nodes: [
        { name: 'Web app', layer: 'Client', tech: 'Next.js, React', desc: 'Server-rendered pages, hydrated into a fast dashboard.' },
        { name: 'Mobile app', layer: 'Client', tech: 'React Native', desc: 'Shares API types and validation with the web app.' },
        { name: 'CDN', layer: 'Edge', tech: 'CloudFront', desc: 'Caches static assets and images close to users.' },
        { name: 'Load balancer', layer: 'Edge', tech: 'AWS ALB', desc: 'Spreads traffic across containers and terminates TLS.' },
        { name: 'API gateway', layer: 'Services', tech: 'Node.js, Express', desc: 'Auth, rate limiting and routing to internal services.' },
        { name: 'Workers', layer: 'Services', tech: 'BullMQ', desc: 'Emails, webhooks and billing jobs run in the background.' },
        { name: 'Realtime', layer: 'Services', tech: 'Socket.IO', desc: 'Pushes live notifications over WebSockets.' },
        { name: 'MySQL', layer: 'Data', tech: 'AWS RDS', desc: 'Primary database with a read replica for reports.' },
        { name: 'Redis', layer: 'Data', tech: 'ElastiCache', desc: 'Sessions, cache and the job queue.' },
        { name: 'S3', layer: 'Data', tech: 'AWS S3', desc: 'User uploads and nightly backups.' },
      ],
    }),
    fields: [
      title, f('text', 'Intro', 'textarea'),
      f('nodes', 'Parts', 'list', {
        item: { name: 'Service', layer: 'Services', tech: '', desc: '' },
        fields: [f('name', 'Name'), f('layer', 'Layer (same layer = same column)'), f('tech', 'Tech'), f('desc', 'What it does', 'textarea')],
      }),
      f('image', 'Extra diagram image (optional, shown below)', 'image'),
    ],
  },
  depgraph: {
    label: 'Stack dependency graph', group: 'Developer', icon: 'Waypoints',
    defaults: () => ({
      title: 'How my stack fits together', text: 'Hover a technology to see what it connects to.',
      nodes: [
        { name: 'React', group: 'Frontend', uses: '' },
        { name: 'Next.js', group: 'Frontend', uses: 'React, Node.js' },
        { name: 'Tailwind', group: 'Frontend', uses: 'Next.js' },
        { name: 'Node.js', group: 'Backend', uses: '' },
        { name: 'Express', group: 'Backend', uses: 'Node.js' },
        { name: 'GraphQL', group: 'Backend', uses: 'Express' },
        { name: 'MySQL', group: 'Data', uses: '' },
        { name: 'Prisma', group: 'Data', uses: 'MySQL, Node.js' },
        { name: 'Redis', group: 'Data', uses: '' },
        { name: 'Docker', group: 'DevOps', uses: 'Node.js, MySQL, Redis' },
        { name: 'AWS', group: 'DevOps', uses: 'Docker' },
        { name: 'GitHub Actions', group: 'DevOps', uses: 'Docker, AWS' },
      ],
    }),
    fields: [
      title, f('text', 'Intro', 'textarea'),
      f('nodes', 'Technologies', 'list', { item: { name: 'Tech', group: 'Backend', uses: '' }, fields: [f('name', 'Name'), f('group', 'Group'), f('uses', 'Connects to (names, comma separated)')] }),
    ],
  },
  github: {
    label: 'GitHub activity', group: 'Developer', icon: 'Github',
    defaults: () => ({ title: 'On GitHub', username: 'sindresorhus', showChart: true, showLanguages: true, repoCount: 6, sort: 'stars' }),
    fields: [
      title, f('username', 'GitHub username'), f('showChart', 'Show contribution chart', 'toggle'), f('showLanguages', 'Show top languages', 'toggle'),
      f('repoCount', 'Repositories to show', 'range', { min: 0, max: 12 }),
      f('sort', 'Pick repositories by', 'select', { options: [['stars', 'Most stars'], ['updated', 'Recently updated']] }),
    ],
  },
  codingstats: {
    label: 'Coding stats', group: 'Developer', icon: 'Trophy',
    defaults: () => ({
      title: 'Coding stats',
      items: [
        { platform: 'LeetCode', handle: '@aarav', url: 'https://leetcode.com', stats: 'Problems solved: 612\nContest rating: 1,874\nBadge: Knight' },
        { platform: 'Codeforces', handle: 'aarav_s', url: 'https://codeforces.com', stats: 'Rating: 1,642\nRank: Expert' },
        { platform: 'GitHub', handle: 'aarav', url: 'https://github.com', stats: 'Contributions (year): 1,420\nStars earned: 2.3k' },
        { platform: 'HackerRank', handle: 'aarav', url: 'https://hackerrank.com', stats: 'Problem solving: 5★\nSQL: 5★' },
      ],
    }),
    fields: [
      title,
      f('items', 'Profiles', 'list', {
        item: { platform: 'Platform', handle: '', url: '', stats: '' },
        fields: [f('platform', 'Platform'), f('handle', 'Username'), f('url', 'Profile link', 'url'), f('stats', 'Stats (one per line, Label: Value)', 'textarea', { rows: 4 })],
      }),
    ],
  },
  opensource: {
    label: 'Open source', group: 'Developer', icon: 'GitPullRequest',
    defaults: () => ({
      title: 'Open source contributions',
      items: [
        { repo: 'vercel/next.js', title: 'Fix image loader for custom domains', url: 'https://github.com', kind: 'Merged PR', desc: 'Resolved a caching bug affecting self-hosted image loaders.' },
        { repo: 'prisma/prisma', title: 'Better error for missing MySQL SSL config', url: 'https://github.com', kind: 'Merged PR', desc: '' },
        { repo: 'aarav/queue-kit', title: 'Maintainer', url: 'https://github.com', kind: 'Maintainer', desc: 'Tiny Redis job queue · 1.1k stars · 40 contributors.' },
        { repo: 'tailwindlabs/tailwindcss', title: 'Docs: container queries examples', url: 'https://github.com', kind: 'Docs', desc: '' },
      ],
    }),
    fields: [
      title,
      f('items', 'Contributions', 'list', {
        item: { repo: 'owner/repo', title: '', url: '', kind: 'Merged PR', desc: '' },
        fields: [
          f('repo', 'Repository (owner/name)'), f('title', 'What you did'), f('url', 'Link', 'url'),
          f('kind', 'Type', 'select', { options: ['Merged PR', 'Open PR', 'Issue', 'Maintainer', 'Contributor', 'Docs'].map((k) => [k, k]) }),
          f('desc', 'Details', 'textarea'),
        ],
      }),
    ],
  },
  certs: {
    label: 'Certifications', group: 'Developer', icon: 'Award',
    defaults: () => ({
      title: 'Certifications & achievements',
      items: [
        { name: 'AWS Certified Solutions Architect – Associate', issuer: 'Amazon Web Services', date: '2025', url: 'https://aws.amazon.com', badge: '', kind: 'Certification' },
        { name: 'Smart India Hackathon — Winner', issuer: 'Government of India', date: '2023', url: '', badge: '', kind: 'Award' },
        { name: 'Meta Front-End Developer', issuer: 'Coursera', date: '2022', url: 'https://coursera.org', badge: '', kind: 'Certification' },
      ],
    }),
    fields: [
      title,
      f('items', 'Entries', 'list', {
        item: { name: '', issuer: '', date: '', url: '', badge: '', kind: 'Certification' },
        fields: [
          f('name', 'Name'), f('issuer', 'Issued by'), f('date', 'Date'), f('url', 'Verify link', 'url'), f('badge', 'Badge image', 'image'),
          f('kind', 'Type', 'select', { options: ['Certification', 'Award', 'Achievement'].map((k) => [k, k]) }),
        ],
      }),
    ],
  },
  blog: {
    label: 'Blog / articles', group: 'Developer', icon: 'Newspaper',
    defaults: () => ({
      title: 'Writing', devto: '', count: 3,
      items: [
        { title: 'How I cut our AWS bill by 40%', excerpt: 'Right-sizing, Graviton and a few boring spreadsheets.', date: 'Aug 2026', readTime: '7 min read', url: 'https://example.com', image: img('blog-1', 900, 500), tags: 'AWS, Cost' },
        { title: 'MySQL indexes, explained with a library', excerpt: 'Why your query is slow and what EXPLAIN is trying to tell you.', date: 'Jun 2026', readTime: '9 min read', url: 'https://example.com', image: img('blog-2', 900, 500), tags: 'MySQL' },
        { title: 'Zero-downtime deploys with Docker', excerpt: 'Health checks, rolling updates and the one flag everyone forgets.', date: 'Apr 2026', readTime: '6 min read', url: 'https://example.com', image: img('blog-3', 900, 500), tags: 'Docker, DevOps' },
      ],
    }),
    fields: [
      title, f('devto', 'Load latest posts from dev.to (username, optional)'), f('count', 'Posts to load from dev.to', 'range', { min: 1, max: 12 }),
      f('items', 'Articles', 'list', {
        item: { title: 'New article', excerpt: '', date: '', readTime: '', url: '', image: '', tags: '' },
        fields: [f('title', 'Title'), f('excerpt', 'Summary', 'textarea'), f('date', 'Date'), f('readTime', 'Read time'), f('url', 'Link', 'url'), f('image', 'Cover', 'image'), f('tags', 'Tags (comma separated)')],
      }),
    ],
  },
  learning: {
    label: 'Currently exploring', group: 'Developer', icon: 'Lightbulb',
    defaults: () => ({
      title: 'Currently exploring',
      items: [
        { topic: 'Rust', note: 'Building a small CLI to learn ownership and lifetimes.', progress: 35 },
        { topic: 'System design', note: 'Working through distributed caching and queues.', progress: 60 },
        { topic: 'LLM apps', note: 'RAG pipelines with embeddings and evals.', progress: 45 },
      ],
    }),
    fields: [title, f('items', 'Topics', 'list', { item: { topic: 'Topic', note: '', progress: 30 }, fields: [f('topic', 'Topic'), f('note', 'What you are doing', 'textarea'), f('progress', 'Progress %', 'range', { min: 0, max: 100 })] })],
  },

  // ---------- Interactive ----------
  terminal: {
    label: 'Terminal', group: 'Interactive', icon: 'Terminal',
    defaults: () => ({
      title: '', prompt: 'guest@aarav:~$', height: 360,
      welcome: 'Welcome to my portfolio terminal.\nType "help" to see what you can ask.',
      commands: [
        { cmd: 'about', output: 'Full-stack engineer, 5 years. I build SaaS products end to end.' },
        { cmd: 'skills', output: 'Frontend  React · Next.js · TypeScript\nBackend   Node.js · Express · GraphQL\nData      MySQL · PostgreSQL · Redis\nDevOps    Docker · AWS · GitHub Actions' },
        { cmd: 'projects', output: 'shipfast   SaaS starter kit\npulse      real-time analytics\ndeployr    one-click Docker deploys' },
        { cmd: 'contact', output: 'email   hello@example.com\ngithub  github.com/aarav' },
      ],
    }),
    fields: [
      title, f('prompt', 'Prompt'), f('welcome', 'Welcome text', 'textarea'), f('height', 'Height', 'range', { min: 220, max: 640 }),
      f('commands', 'Commands', 'list', { item: { cmd: 'command', output: '' }, fields: [f('cmd', 'Command'), f('output', 'Output', 'code', { rows: 5 })] }),
    ],
  },
  playground: {
    label: 'Code playground', group: 'Interactive', icon: 'Braces',
    defaults: () => ({
      title: 'Playground', text: 'Edit the code and press Run. It runs in a safe sandbox right here.', height: 380,
      html: '<button id="b">Click me</button>\n<p id="out">Clicked 0 times</p>',
      css: 'body { font-family: system-ui; display: grid; place-items: center; height: 90vh; margin: 0 }\nbutton { padding: 12px 20px; border: 0; border-radius: 10px; background: #2F5BFF; color: #fff; font-size: 16px; cursor: pointer }',
      js: "let n = 0;\ndocument.getElementById('b').onclick = () => {\n  n++;\n  document.getElementById('out').textContent = `Clicked ${n} times`;\n};",
    }),
    fields: [title, f('text', 'Intro', 'textarea'), f('html', 'HTML', 'code', { rows: 6 }), f('css', 'CSS', 'code', { rows: 6 }), f('js', 'JavaScript', 'code', { rows: 8 }), f('height', 'Height', 'range', { min: 240, max: 700 })],
  },
  apiplayground: {
    label: 'API playground', group: 'Interactive', icon: 'Webhook',
    defaults: () => ({
      title: 'API playground', text: 'Send real requests and see the live response.',
      endpoints: [
        { label: 'Get a GitHub repository', method: 'GET', url: 'https://api.github.com/repos/vercel/next.js', body: '' },
        { label: 'List users', method: 'GET', url: 'https://jsonplaceholder.typicode.com/users?_limit=3', body: '' },
        { label: 'Create a post', method: 'POST', url: 'https://jsonplaceholder.typicode.com/posts', body: '{\n  "title": "Hello",\n  "body": "Sent from my portfolio",\n  "userId": 1\n}' },
      ],
    }),
    fields: [
      title, f('text', 'Intro', 'textarea'),
      f('endpoints', 'Endpoints', 'list', {
        item: { label: 'Endpoint', method: 'GET', url: 'https://', body: '' },
        fields: [f('label', 'Name'), f('method', 'Method', 'select', { options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => [m, m]) }), f('url', 'URL', 'url'), f('body', 'JSON body', 'code', { rows: 5 })],
      }),
    ],
  },
  websocket: {
    label: 'WebSocket demo', group: 'Interactive', icon: 'Radio',
    defaults: () => ({ title: 'Real-time demo', text: 'This chat talks to a live WebSocket server. Each message travels there and back, and you can see the round-trip time.', url: 'wss://echo.websocket.org' }),
    fields: [title, f('text', 'Intro', 'textarea'), f('url', 'WebSocket URL (wss://…)')],
  },
  demoembed: {
    label: 'Live demo', group: 'Interactive', icon: 'MonitorPlay',
    defaults: () => ({ title: 'Try it live', url: 'https://example.com', image: img('demo-shot', 1400, 860), height: 560, note: 'Demo login: demo@example.com / demo1234', githubUrl: 'https://github.com' }),
    fields: [title, f('url', 'Live app URL', 'url'), f('image', 'Screenshot (shown before it loads)', 'image'), f('note', 'Note under the demo'), f('githubUrl', 'GitHub link', 'url'), f('height', 'Height', 'range', { min: 320, max: 900 })],
  },
  livestatus: {
    label: 'Live project dashboard', group: 'Interactive', icon: 'Activity',
    defaults: () => ({
      title: 'Live projects', text: 'Checked from your browser right now, and again every minute.',
      items: [
        { name: 'ShipFast', url: 'https://example.com', stack: 'Next.js · AWS' },
        { name: 'Public API', url: 'https://api.github.com', stack: 'Node.js · Docker' },
        { name: 'Docs site', url: 'https://developer.mozilla.org', stack: 'Static · CDN' },
      ],
    }),
    fields: [title, f('text', 'Intro', 'textarea'), f('items', 'Projects', 'list', { item: { name: 'Project', url: 'https://', stack: '' }, fields: [f('name', 'Name'), f('url', 'URL', 'url'), f('stack', 'Stack')] })],
  },
  performance: {
    label: 'Performance dashboard', group: 'Interactive', icon: 'Gauge',
    defaults: () => ({ title: 'Performance', text: 'Lighthouse scores for this site, plus Core Web Vitals measured live in your browser.', performance: 98, accessibility: 100, bestPractices: 100, seo: 100, showLive: true }),
    fields: [
      title, f('text', 'Intro', 'textarea'),
      f('performance', 'Lighthouse: Performance', 'range', { min: 0, max: 100 }), f('accessibility', 'Lighthouse: Accessibility', 'range', { min: 0, max: 100 }),
      f('bestPractices', 'Lighthouse: Best practices', 'range', { min: 0, max: 100 }), f('seo', 'Lighthouse: SEO', 'range', { min: 0, max: 100 }),
      f('showLive', 'Measure Core Web Vitals live', 'toggle'),
    ],
  },
  chatbot: {
    label: 'AI chatbot', group: 'Interactive', icon: 'Bot',
    defaults: () => ({
      title: 'Ask about my projects', name: 'Aarav’s assistant', floating: true, endpoint: '',
      greeting: 'Hi! Ask me about my projects, tech stack, experience, or how to hire me.',
      suggestions: 'What do you build?, Which tech do you use?, Are you available?',
      knowledge: [
        { keywords: 'stack, tech, technology, tools, languages, use', answer: 'Mostly React and Next.js on the frontend, Node.js and Express on the backend, MySQL and Redis for data, and Docker on AWS for deploys.' },
        { keywords: 'projects, build, built, work, portfolio, made', answer: 'Highlights: ShipFast (a SaaS starter used by 300+ teams), Pulse (real-time analytics, 2M events a day) and Deployr (one-click Docker deploys). Scroll to Featured projects for demos.' },
        { keywords: 'hire, available, freelance, rate, contact, email, work together', answer: 'Yes, I’m taking on freelance work. Email hello@example.com or use the contact form below.' },
        { keywords: 'experience, years, company, job, background', answer: 'Five years building SaaS products, most recently leading backend at a fintech startup.' },
      ],
    }),
    fields: [
      title, f('name', 'Assistant name'), f('greeting', 'First message', 'textarea'), f('suggestions', 'Suggested questions (comma separated)', 'textarea'),
      f('floating', 'Floating chat button (bottom right)', 'toggle'),
      f('knowledge', 'Answers', 'list', { item: { keywords: '', answer: '' }, fields: [f('keywords', 'When the question mentions (comma separated)'), f('answer', 'Answer', 'textarea')] }),
      f('endpoint', 'AI endpoint URL (optional, receives POST { message, history })', 'url'),
    ],
  },

  html: {
    label: 'Custom HTML', group: 'Advanced', icon: 'Code2',
    defaults: () => ({ code: '<p style="text-align:center">Your custom HTML here</p>' }),
    fields: [f('code', 'HTML', 'code', { rows: 10 })],
  },
  footer: {
    label: 'Footer', group: 'Layout', icon: 'PanelBottom',
    defaults: () => ({ text: '© 2026 Your Name. Made with care.' }),
    fields: [f('text', 'Text', 'textarea')],
  },
};

// ---------- design options ----------
const ch = (k, label, options, extra = {}) => f(k, label, 'choice', { options, ...extra });
const g = (label) => ({ k: 'g_' + label, label, t: 'group' });
const is = (k, ...vals) => (v) => vals.includes(v[k] ?? '');

export const GRADIENTS = {
  brand: 'linear-gradient(135deg,var(--pf-primary),var(--pf-secondary))',
  sunset: 'linear-gradient(135deg,#FF5F6D,#FFC371)',
  ocean: 'linear-gradient(135deg,#2193B0,#6DD5ED)',
  aurora: 'linear-gradient(135deg,#7C5CFF,#22D3EE 55%,#A3E635)',
  gold: 'linear-gradient(135deg,#9A6B12,#F5D27A 50%,#9A6B12)',
  fire: 'linear-gradient(135deg,#F12711,#F5AF19)',
  mint: 'linear-gradient(135deg,#11998E,#38EF7D)',
  berry: 'linear-gradient(135deg,#8E2DE2,#F64F59)',
  midnight: 'linear-gradient(160deg,#0F2027,#203A43 50%,#2C5364)',
  peach: 'linear-gradient(135deg,#FFE0D6,#FBC2EB)',
  mesh: 'radial-gradient(at 15% 20%,color-mix(in srgb,var(--pf-primary) 35%,transparent),transparent 55%),radial-gradient(at 85% 30%,color-mix(in srgb,var(--pf-secondary) 35%,transparent),transparent 55%),radial-gradient(at 50% 90%,color-mix(in srgb,var(--pf-primary) 20%,transparent),transparent 60%)',
};
const GRAD_OPTS = [['', 'None'], ['brand', 'Brand'], ['sunset', 'Sunset'], ['ocean', 'Ocean'], ['aurora', 'Aurora'], ['gold', 'Gold'], ['fire', 'Fire'], ['mint', 'Mint'], ['berry', 'Berry'], ['midnight', 'Midnight'], ['peach', 'Peach'], ['mesh', 'Soft mesh']];
export const FILTER_OPTS = [['', 'None'], ['grayscale', 'Black & white'], ['sepia', 'Sepia'], ['vintage', 'Vintage'], ['warm', 'Warm'], ['cool', 'Cool'], ['vivid', 'Vivid'], ['fade', 'Faded'], ['moody', 'Moody']];
const HOVER_OPTS = [['', 'None'], ['zoom', 'Zoom'], ['lift', 'Lift'], ['color', 'B&W → colour'], ['tilt', 'Tilt'], ['shine', 'Shine'], ['darken', 'Darken']];
const RATIO_OPTS = [['auto', 'Original'], ['1/1', 'Square'], ['4/3', '4:3'], ['3/2', '3:2'], ['16/9', '16:9'], ['21/9', 'Wide'], ['3/4', 'Portrait'], ['9/16', 'Story']];
const SHAPE_OPTS = [['rounded', 'Rounded'], ['square', 'Square'], ['circle', 'Circle'], ['blob', 'Blob'], ['arch', 'Arch'], ['tilted', 'Tilted'], ['frame', 'Offset frame']];
const variant = (options, def) => ch('variant', 'Design', options, { def });

// Rewrites a block's fields and adds defaults for new blocks (saved blocks fall back to the renderer's defaults).
function extend(type, fields, defaults = {}) {
  const bl = BLOCKS[type];
  bl.fields = typeof fields === 'function' ? fields(bl.fields) : [...fields, ...bl.fields];
  const d = bl.defaults;
  bl.defaults = () => ({ ...defaults, ...d() });
}

extend('navbar', (old) => [
  ch('navStyle', 'Navigation style', [['classic', 'Classic'], ['centered', 'Centered'], ['pill', 'Floating pill'], ['glass', 'Glass'], ['underline', 'Underline links'], ['boxed', 'Boxed'], ['bold', 'Bold bar'], ['minimal', 'Menu button only']], { def: 'classic' }),
  f('sticky', 'Stick to top while scrolling', 'toggle'),
  ...old,
  f('logoSize', 'Logo image height', 'range', { min: 20, max: 80, def: 36 }),
  f('ctaText', 'Button on the right (optional)'), f('ctaUrl', 'Button link', 'url'),
], { navStyle: 'classic' });

extend('hero', (old) => {
  const keep = old.filter((x) => x.k !== 'layout' && x.k !== 'image');
  return [
    ch('layout', 'Layout', [['split', 'Text + image'], ['image-left', 'Image + text'], ['center', 'Centered'], ['cover', 'Photo background'], ['gradient', 'Gradient background'], ['minimal', 'Big type only'], ['card', 'Card on photo'], ['video', 'Video background'], ['collage', 'Photo collage']]),
    ch('height', 'Height', [['', 'Auto'], ['tall', 'Tall'], ['screen', 'Full screen']], { cols: 3 }),
    ...keep,
    f('rotate', 'Typewriter words after the title (comma separated)'),
    f('badge', 'Small badge above the title (e.g. Available for work)'),
    f('image', 'Image', 'image', { show: (v) => !['minimal', 'gradient', 'video'].includes(v.layout) }),
    ch('imageShape', 'Image shape', SHAPE_OPTS, { def: 'rounded', show: is('layout', 'split', 'image-left', 'center', 'collage', '') }),
    f('image2', 'Collage image 2', 'image', { show: is('layout', 'collage') }), f('image3', 'Collage image 3', 'image', { show: is('layout', 'collage') }),
    f('videoUrl', 'Background video (MP4 link)', 'url', { show: is('layout', 'video') }),
    ch('gradient', 'Gradient', GRAD_OPTS.slice(1), { def: 'brand', cols: 3, show: is('layout', 'gradient') }),
    f('overlay', 'Darken background (%)', 'range', { min: 0, max: 90, def: 50, show: is('layout', 'cover', 'video', 'card') }),
    f('scrollHint', 'Show “scroll down” arrow', 'toggle'),
  ];
}, { imageShape: 'rounded', overlay: 50 });

extend('image', [
  g('Look'),
  ch('ratio', 'Crop to', RATIO_OPTS, { def: 'auto', cols: 4 }),
  ch('shape', 'Shape', [['rounded', 'Rounded'], ['curved', 'Curved'], ['square', 'Square'], ['circle', 'Circle'], ['pill', 'Capsule'], ['blob', 'Blob'], ['arch', 'Arch'], ['leaf', 'Leaf'], ['hexagon', 'Hexagon'], ['diamond', 'Diamond'], ['tilted', 'Tilted']], { cols: 3 }),
  ch('filter', 'Filter', FILTER_OPTS, { cols: 3 }),
  ch('frame', 'Frame', [['', 'None'], ['shadow', 'Shaded'], ['shade', 'Dark shade'], ['fade', 'Fade edges'], ['glow', 'Glow'], ['border', 'Border'], ['polaroid', 'Polaroid'], ['sticker', 'Sticker'], ['float', 'Floating'], ['offset', 'Offset outline'], ['browser', 'Browser window'], ['phone', 'Phone']], { cols: 2 }),
  ch('hover', 'Hover effect', HOVER_OPTS, { cols: 3 }),
  ch('focus', 'Focus point', [['center', 'Centre'], ['top', 'Top'], ['bottom', 'Bottom'], ['left', 'Left'], ['right', 'Right']], { def: 'center', cols: 3, show: (v) => (v.ratio || 'auto') !== 'auto' }),
  ch('captionStyle', 'Caption', [['below', 'Below'], ['overlay', 'On image'], ['hover', 'On hover']], { def: 'below', cols: 3 }),
  ch('align', 'Position', [['center', 'Centre'], ['left', 'Left'], ['right', 'Right']], { def: 'center', cols: 3 }),
  g('Content'),
], {});
BLOCKS.image.fields = BLOCKS.image.fields.filter((x) => x.k !== 'rounded');

extend('gallery', (old) => [
  old[0],
  ch('layout', 'Layout', [['grid', 'Grid'], ['masonry', 'Masonry'], ['wide', 'Wide 16:9'], ['mosaic', 'Mosaic'], ['carousel', 'Carousel'], ['filmstrip', 'Filmstrip'], ['polaroid', 'Polaroids'], ['justified', 'Justified rows'], ['circles', 'Circles']]),
  old[1],
  f('gap', 'Space between', 'range', { min: 0, max: 40, def: 12 }),
  ch('ratio', 'Photo shape', [['', 'Layout default'], ['1/1', 'Square'], ['4/3', '4:3'], ['3/4', 'Portrait'], ['16/9', '16:9']], { cols: 3, show: is('layout', 'grid', 'carousel', 'filmstrip', 'polaroid', '') }),
  ch('filter', 'Filter', FILTER_OPTS, { cols: 3 }),
  ch('hover', 'Hover effect', HOVER_OPTS, { def: 'zoom', cols: 3 }),
  ch('captionStyle', 'Captions', [['overlay', 'On photo'], ['hover', 'On hover'], ['below', 'Below'], ['none', 'Hidden']], { def: 'overlay' }),
  ch('corners', 'Corners', [['', 'Theme'], ['square', 'Square'], ['round', 'Round'], ['xl', 'Extra round']], { cols: 4 }),
  f('lightbox', 'Open photos full screen on click', 'toggle', { def: true }),
  ...old.slice(3),
], { gap: 12, hover: 'zoom', lightbox: true });

extend('video', [
  ch('frame', 'Style', [['', 'Plain'], ['card', 'Card'], ['browser', 'Browser'], ['phone', 'Phone'], ['laptop', 'Laptop'], ['cinema', 'Cinematic'], ['float', 'Floating'], ['glow', 'Glow']]),
  ch('ratio', 'Shape', [['16/9', '16:9'], ['4/3', '4:3'], ['1/1', 'Square'], ['9/16', 'Vertical'], ['21/9', 'Ultra-wide']], { def: '16/9', cols: 3 }),
  ch('side', 'Text beside video', [['', 'None'], ['left', 'Text left'], ['right', 'Text right'], ['below', 'Text below']], { cols: 2 }),
  f('heading', 'Heading', 'text', { show: (v) => !!v.side }), f('text', 'Text', 'textarea', { show: (v) => !!v.side }),
], { ratio: '16/9' });
BLOCKS.video.fields.push(
  f('poster', 'Cover image (MP4 only)', 'image'), f('caption', 'Caption'),
  f('autoplay', 'Autoplay (muted)', 'toggle'), f('loop', 'Loop', 'toggle'), f('controls', 'Show controls', 'toggle', { def: true }),
);

extend('skills', (old) => [
  old[0],
  ch('display', 'Display', [['bars', 'Bars'], ['gradient', 'Gradient bars'], ['segments', 'Segments'], ['circles', 'Rings'], ['tags', 'Tags'], ['cloud', 'Word cloud'], ['dots', 'Dots'], ['stars', 'Stars'], ['cards', 'Cards'], ['levels', 'Levels'], ['icons', 'Logo tiles']]),
  f('columns', 'Columns', 'range', { min: 1, max: 4, def: 1, show: is('display', 'bars', 'gradient', 'segments', 'dots', 'stars', 'levels', '') }),
  f('showLevel', 'Show level number', 'toggle', { def: true }),
  f('animate', 'Animate when scrolled into view', 'toggle', { def: true }),
  ...old.slice(2),
], { columns: 1, showLevel: true, animate: true });

extend('projects', (old) => {
  const items = old.find((x) => x.k === 'items');
  items.item = { ...items.item, meta: '', github: '' };
  items.fields = [...items.fields.slice(0, 4), f('github', 'GitHub / second link', 'url'), f('meta', 'Year or role (e.g. 2025 · Lead)'), ...items.fields.slice(4)];
  return [
    old[0],
    ch('layout', 'Layout', [['cards', 'Cards'], ['overlay', 'Text on image'], ['minimal', 'Minimal'], ['list', 'List rows'], ['zigzag', 'Zigzag'], ['magazine', 'Magazine'], ['bento', 'Bento grid'], ['carousel', 'Carousel'], ['numbered', 'Numbered']], { def: 'cards' }),
    old[1],
    ch('ratio', 'Image shape', [['3/2', '3:2'], ['4/3', '4:3'], ['1/1', 'Square'], ['16/9', '16:9'], ['3/4', 'Portrait']], { def: '3/2', cols: 3 }),
    ch('hover', 'Hover effect', HOVER_OPTS, { def: 'zoom', cols: 3 }),
    f('filters', 'Show tag filters', 'toggle'),
    f('showTags', 'Show tags', 'toggle', { def: true }),
    f('linkText', 'Link label (e.g. View project)'),
    items,
  ];
}, { layout: 'cards', ratio: '3/2', hover: 'zoom', showTags: true });

extend('about', [variant([['image-left', 'Photo left'], ['image-right', 'Photo right'], ['image-top', 'Photo on top'], ['circle', 'Round photo'], ['overlap', 'Overlapping card'], ['boxed', 'Boxed'], ['centered', 'Centred text']], 'image-left')]);
BLOCKS.about.fields.push(f('facts', 'Quick facts (one per line, Label: Value)', 'textarea'), f('buttonText', 'Button text'), f('buttonUrl', 'Button link', 'url'), f('signature', 'Signature (shown in script font)'));
extend('testimonials', [variant([['cards', 'Cards'], ['single', 'One big quote'], ['carousel', 'Carousel'], ['masonry', 'Masonry'], ['bubbles', 'Chat bubbles'], ['minimal', 'Minimal']], 'cards'), f('stars', 'Show 5 stars', 'toggle')]);
extend('services', [variant([['cards', 'Cards'], ['numbered', 'Numbered'], ['icons', 'Big icons'], ['list', 'List'], ['outline', 'Outlined'], ['gradient', 'Gradient cards']], 'cards'), f('columns', 'Columns', 'range', { min: 1, max: 4, def: 3 })]);
BLOCKS.services.fields.find((x) => x.k === 'items').fields.unshift(f('icon', 'Icon (emoji)'));
extend('stats', [variant([['plain', 'Plain'], ['cards', 'Cards'], ['divided', 'Divided'], ['band', 'Colour band'], ['circles', 'Circles'], ['left', 'Left aligned']], 'plain'), f('countUp', 'Count up when visible', 'toggle', { def: true })]);
extend('experience', [variant([['timeline', 'Timeline'], ['cards', 'Cards'], ['center', 'Centre timeline'], ['compact', 'Compact list'], ['split', 'Two columns'], ['numbered', 'Numbered']], 'timeline')]);
extend('education', [variant([['list', 'List'], ['cards', 'Cards'], ['timeline', 'Timeline'], ['compact', 'Compact']], 'list')]);
extend('contact', [variant([['split', 'Split'], ['centered', 'Centred'], ['card', 'Card'], ['minimal', 'Minimal'], ['band', 'Colour band']], 'split')]);
extend('cta', [variant([['banner', 'Banner'], ['split', 'Split'], ['outline', 'Outline'], ['gradient', 'Gradient'], ['image', 'Photo background'], ['minimal', 'Minimal']], 'banner')]);
BLOCKS.cta.fields.push(f('image', 'Background photo', 'image', { show: is('variant', 'image') }));
extend('pricing', [variant([['cards', 'Cards'], ['bordered', 'Bordered'], ['minimal', 'Minimal'], ['dark', 'Dark highlight'], ['gradient', 'Gradient highlight']], 'cards')]);
extend('faq', [variant([['accordion', 'Accordion'], ['twocol', 'Two columns'], ['cards', 'Cards'], ['plus', 'Plus / minus']], 'accordion')]);
extend('quote', [variant([['centered', 'Centred'], ['mark', 'Big quote mark'], ['card', 'Card'], ['bar', 'Side bar'], ['highlight', 'Highlighted']], 'centered')]);
extend('links', [variant([['outline', 'Outline'], ['filled', 'Filled'], ['soft', 'Soft'], ['shadow', 'Shadow'], ['pill', 'Pill'], ['gradient', 'Gradient']], 'outline')]);
extend('social', [variant([['pills', 'Pills'], ['circles', 'Round icons'], ['squares', 'Square icons'], ['text', 'Text links'], ['buttons', 'Big buttons'], ['outline', 'Outline']], 'pills')]);
extend('logos', [variant([['row', 'Grey row'], ['color', 'Full colour'], ['marquee', 'Scrolling'], ['boxed', 'Boxed grid']], 'row')]);
extend('footer', [variant([['simple', 'Simple'], ['centered', 'Centred'], ['big', 'Giant name'], ['split', 'Split with links'], ['line', 'Thin line']], 'simple'), f('bigText', 'Giant text (for “Giant name”)', 'text', { show: is('variant', 'big') }), f('links', 'Links', 'list', { item: { label: 'Link', url: '#' }, fields: [f('label', 'Label'), f('url', 'URL', 'url')] })]);

// Tile patterns: [columns, [[colSpan, rowSpan, colStart?], ...]] repeated over the items.
export const TILE_PATTERNS = {
  big2: ['1 big + 2 small', 3, [[2, 2], [1, 1], [1, 1]]],
  big2r: ['2 small + 1 big', 3, [[2, 2, 2], [1, 1, 1], [1, 1, 1]]],
  big4: ['1 big + 4 small', 4, [[2, 2], [1, 1], [1, 1], [1, 1], [1, 1]]],
  big4r: ['4 small + 1 big', 4, [[2, 2, 3], [1, 1, 1], [1, 1, 2], [1, 1, 1], [1, 1, 2]]],
  center: ['Big in the middle', 4, [[1, 1, 1], [2, 2, 2], [1, 1, 4], [1, 1, 1], [1, 1, 4]]],
  banner: ['Banner + 4 below', 4, [[4, 2], [1, 1], [1, 1], [1, 1], [1, 1]]],
  widetop: ['Wide on top + 3', 3, [[3, 1], [1, 1], [1, 1], [1, 1]]],
  widebottom: ['3 + wide below', 3, [[1, 1], [1, 1], [1, 1], [3, 1]]],
  tallwide: ['Tall + wide + 2', 3, [[1, 2], [2, 1], [1, 1], [1, 1]]],
  widetall: ['Wide + tall + 2', 3, [[2, 1, 1], [1, 2, 3], [1, 1, 1], [1, 1, 2]]],
  duo: ['1 tall + 2 stacked', 2, [[1, 2], [1, 1], [1, 1]]],
  duor: ['2 stacked + 1 tall', 2, [[1, 2, 2], [1, 1, 1], [1, 1, 1]]],
  trio: ['Three tall', 3, [[1, 2]]],
  magazine: ['Magazine', 4, [[2, 2], [1, 2], [1, 1], [1, 1]]],
  bento: ['Bento', 4, [[2, 2], [2, 1], [1, 1], [1, 1], [1, 2], [1, 1], [2, 1]]],
  checker: ['Alternating wide', 3, [[2, 1], [1, 1], [1, 1], [2, 1]]],
  pyramid: ['2 then 3', 6, [[3, 1], [3, 1], [2, 1], [2, 1], [2, 1]]],
  pyramidr: ['3 then 2', 6, [[2, 1], [2, 1], [2, 1], [3, 1], [3, 1]]],
  stack: ['Full-width stack', 1, [[1, 2]]],
  grid2: ['Even 2 columns', 2, [[1, 1]]],
  grid4: ['Even 4 columns', 4, [[1, 1]]],
  grid5: ['Even 5 columns', 5, [[1, 1]]],
};
const PATTERN_OPTS = Object.entries(TILE_PATTERNS).map(([k, v]) => [k, v[0]]);
const isPattern = (k) => (v) => !!TILE_PATTERNS[v[k]];

// More layouts on top of the design options above
{
  const gl = BLOCKS.gallery.fields.find((x) => x.k === 'layout');
  gl.options = [...gl.options, ...PATTERN_OPTS];
  BLOCKS.gallery.fields.splice(BLOCKS.gallery.fields.indexOf(gl) + 1, 0, f('rowH', 'Row height', 'range', { min: 90, max: 420, step: 10, def: 190, show: isPattern('layout') }));
  const pl = BLOCKS.projects.fields.find((x) => x.k === 'layout');
  pl.options = [...pl.options, ...PATTERN_OPTS.filter(([k]) => !['grid5', 'stack', 'magazine', 'bento'].includes(k))];
  BLOCKS.projects.fields.splice(BLOCKS.projects.fields.indexOf(pl) + 1, 0, f('rowH', 'Row height', 'range', { min: 140, max: 420, step: 10, def: 240, show: isPattern('layout') }));
  const nv = BLOCKS.navbar.fields.find((x) => x.k === 'navStyle');
  nv.options = [...nv.options, ['split', 'Logo in the middle'], ['tabs', 'Tab links'], ['outlined', 'Outlined links'], ['stacked', 'Logo above links']];
}

const items3 = (fn) => [1, 2, 3].map(fn);

// ---------- new section tools ----------
Object.assign(BLOCKS, {
  process: {
    label: 'Process steps', group: 'Sections', icon: 'ListOrdered',
    defaults: () => ({ title: 'How I work', variant: 'row', items: [{ title: 'Discover', desc: 'A call to understand your goals, users and constraints.', icon: '🔍' }, { title: 'Design', desc: 'Sketches, then polished screens you can click through.', icon: '✏️' }, { title: 'Build', desc: 'Fast, accessible code with weekly demos.', icon: '⚙️' }, { title: 'Launch', desc: 'Go live, measure, and keep improving.', icon: '🚀' }] }),
    fields: [title, ch('variant', 'Design', [['row', 'Numbered row'], ['timeline', 'Vertical timeline'], ['arrows', 'Cards with arrows'], ['circles', 'Connected circles'], ['zigzag', 'Zigzag'], ['big', 'Big numbers'], ['icons', 'Icon cards'], ['minimal', 'Minimal list']]), f('items', 'Steps', 'list', { item: { title: 'Step', desc: '', icon: '' }, fields: [f('title', 'Title'), f('desc', 'Description', 'textarea'), f('icon', 'Icon (emoji)')] })],
  },
  beforeafter: {
    label: 'Before / after', group: 'Sections', icon: 'ArrowLeftRight',
    defaults: () => ({ title: 'Before and after', before: img('before-shot', 1400, 900), after: img('after-shot', 1400, 900), beforeLabel: 'Before', afterLabel: 'After', variant: 'slider', ratio: '16/9', caption: '' }),
    fields: [title, ch('variant', 'Design', [['slider', 'Drag slider'], ['side', 'Side by side'], ['hover', 'Hover to reveal'], ['stacked', 'Stacked']]), ch('ratio', 'Shape', [['16/9', '16:9'], ['4/3', '4:3'], ['1/1', 'Square'], ['3/4', 'Portrait']], { cols: 4 }), f('before', 'Before image', 'image'), f('after', 'After image', 'image'), f('beforeLabel', 'Before label'), f('afterLabel', 'After label'), f('caption', 'Caption')],
  },
  tabs: {
    label: 'Tabs', group: 'Sections', icon: 'PanelsTopLeft',
    defaults: () => ({ title: 'What I bring', variant: 'top', items: [{ label: 'Design', title: 'Interfaces people enjoy', text: 'Research-led product design, from flows to pixel-perfect UI.', image: img('tab-1', 1000, 700) }, { label: 'Code', title: 'Fast, accessible builds', text: 'React and Next.js front-ends that score 95+ on Lighthouse.', image: img('tab-2', 1000, 700) }, { label: 'Strategy', title: 'Clear priorities', text: 'Roadmaps and metrics that keep teams focused on what matters.', image: img('tab-3', 1000, 700) }] }),
    fields: [title, ch('variant', 'Design', [['top', 'Tabs on top'], ['pills', 'Pill tabs'], ['side', 'Tabs on the side'], ['underline', 'Underlined'], ['cards', 'Big card tabs']]), f('items', 'Tabs', 'list', { item: { label: 'Tab', title: '', text: '', image: '' }, fields: [f('label', 'Tab label'), f('title', 'Title'), f('text', 'Text', 'textarea'), f('image', 'Image', 'image')] })],
  },
  marquee: {
    label: 'Scrolling text', group: 'Sections', icon: 'Type',
    defaults: () => ({ text: 'Product design, Branding, Web development, Motion, Strategy', variant: 'solid', speed: 30, separator: '✦' }),
    fields: [f('text', 'Words (comma separated)', 'textarea'), ch('variant', 'Design', [['solid', 'Big solid'], ['outline', 'Outline text'], ['double', 'Two rows'], ['band', 'Colour band'], ['tilted', 'Tilted band'], ['small', 'Small ticker']]), f('speed', 'Speed (seconds per loop)', 'range', { min: 8, max: 80, def: 30 }), f('separator', 'Separator')],
  },
  newsletter: {
    label: 'Newsletter signup', group: 'Sections', icon: 'MailPlus',
    defaults: () => ({ title: 'Get my monthly notes', text: 'One email a month about design, code and the things I learn. No spam.', buttonText: 'Subscribe', action: '', email: 'hello@example.com', variant: 'card', image: img('newsletter', 900, 700) }),
    fields: [title, f('text', 'Text', 'textarea'), f('buttonText', 'Button text'), ch('variant', 'Design', [['inline', 'Inline'], ['card', 'Card'], ['split', 'With image'], ['banner', 'Colour banner'], ['minimal', 'Minimal']]), f('image', 'Image (for “With image”)', 'image'), f('action', 'Form address (Mailchimp, Buttondown, Substack…)', 'url'), f('email', 'Or send sign-ups to this email')],
  },
  booking: {
    label: 'Booking calendar', group: 'Sections', icon: 'CalendarCheck',
    defaults: () => ({ title: 'Book a 20-minute call', text: 'Pick a time that suits you. I’ll send a meeting link.', url: 'https://calendly.com/', variant: 'embed', height: 660, buttonText: 'Book a call' }),
    fields: [title, f('text', 'Text', 'textarea'), f('url', 'Calendly / Cal.com link', 'url'), ch('variant', 'Design', [['embed', 'Calendar on page'], ['split', 'Text + calendar'], ['button', 'Button only']]), f('buttonText', 'Button text'), f('height', 'Calendar height', 'range', { min: 400, max: 1000, def: 660 })],
  },
  embed: {
    label: 'Embed', group: 'Sections', icon: 'Frame',
    defaults: () => ({ title: '', url: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M', height: 380, frame: 'plain', caption: '' }),
    fields: [title, f('url', 'Link (Figma, CodePen, Spotify, SoundCloud, Loom, Google Slides, any page)', 'url'), ch('frame', 'Style', [['plain', 'Plain'], ['card', 'Card'], ['browser', 'Browser']], { cols: 3 }), f('height', 'Height', 'range', { min: 120, max: 1000, def: 380 }), f('caption', 'Caption')],
  },
  mediatext: {
    label: 'Image + text', group: 'Sections', icon: 'LayoutPanelLeft',
    defaults: () => ({ kicker: 'Featured', title: 'Design that earns its place', text: 'Every screen starts with a question: what does the person need right now? The answer shapes everything else.', points: 'Research before pixels\nPrototypes within days\nDesign systems that scale', image: img('mediatext', 1000, 800), buttonText: 'Read the case study', buttonUrl: '#', variant: 'left' }),
    fields: [ch('variant', 'Design', [['left', 'Image left'], ['right', 'Image right'], ['top', 'Image on top'], ['overlap', 'Overlapping card'], ['background', 'Text on image'], ['bleed', 'Full-bleed split'], ['circle', 'Round image'], ['framed', 'Framed image']]), f('kicker', 'Small line above title'), f('title', 'Title', 'textarea'), f('text', 'Text', 'textarea'), f('points', 'Bullet points (one per line)', 'textarea'), f('image', 'Image', 'image'), f('buttonText', 'Button text'), f('buttonUrl', 'Button link', 'url')],
  },
  team: {
    label: 'Team', group: 'Sections', icon: 'Users',
    defaults: () => ({ title: 'People I work with', variant: 'cards', items: items3((i) => ({ name: ['Asha Rao', 'Dev Malhotra', 'Meera Joshi'][i - 1], role: ['Developer', 'Illustrator', 'Copywriter'][i - 1], photo: img('team-' + i, 500, 600), url: '' })) }),
    fields: [title, ch('variant', 'Design', [['cards', 'Cards'], ['circles', 'Round photos'], ['overlay', 'Name on photo'], ['minimal', 'Minimal'], ['list', 'List']]), f('items', 'People', 'list', { bulkImage: true, item: { name: 'Name', role: '', photo: '', url: '' }, fields: [f('name', 'Name'), f('role', 'Role'), f('photo', 'Photo', 'image'), f('url', 'Link', 'url')] })],
  },
  statement: {
    label: 'Big statement', group: 'Sections', icon: 'TextQuote',
    defaults: () => ({ label: 'My belief', text: 'Good design is invisible until it’s missing.', highlight: 'invisible', author: '', variant: 'huge' }),
    fields: [ch('variant', 'Design', [['huge', 'Huge centred'], ['gradient', 'Gradient words'], ['outline', 'Outline text'], ['marker', 'Highlighted word'], ['split', 'Label + statement'], ['boxed', 'Boxed']]), f('label', 'Small label'), f('text', 'Statement', 'textarea'), f('highlight', 'Word(s) to highlight'), f('author', 'Author (optional)')],
  },
});

const WEIGHTS = [['', 'Theme'], ['300', 'Light'], ['400', 'Regular'], ['500', 'Medium'], ['600', 'Semibold'], ['700', 'Bold'], ['800', 'Extra bold'], ['900', 'Black']];

// Text tab: typography for this section (stored in block.style)
export const TEXT_FIELDS = [
  g('Titles'),
  f('tFont', 'Font', 'font'),
  f('tSize', 'Size (%)', 'range', { min: 50, max: 220, step: 5, def: 100 }),
  ch('tWeight', 'Weight', WEIGHTS, { cols: 4 }),
  ch('tCase', 'Letter case', [['', 'Theme'], ['none', 'As typed'], ['uppercase', 'CAPS'], ['lowercase', 'lower'], ['capitalize', 'Title Case']], { cols: 3 }),
  f('tItalic', 'Italic', 'toggle'),
  f('tSpacing', 'Letter spacing (em)', 'range', { min: -0.08, max: 0.4, step: 0.01, def: 0 }),
  f('tLine', 'Line height', 'range', { min: 0.8, max: 1.8, step: 0.05, def: 1.12 }),
  f('tColor', 'Colour', 'color'),
  ch('tGradient', 'Gradient text', GRAD_OPTS, { cols: 3 }),
  ch('tShadow', 'Shadow', [['', 'None'], ['soft', 'Soft'], ['hard', 'Hard'], ['glow', 'Glow'], ['neon', 'Neon'], ['long', 'Long'], ['outline', 'Outline'], ['3d', '3D'], ['lifted', 'Lifted']], { cols: 3 }),
  ch('tDecor', 'Accent', [['', 'None'], ['underline', 'Underline'], ['marker', 'Marker'], ['bar', 'Side bar'], ['dot', 'Dot'], ['overline', 'Line above'], ['pill', 'Pill'], ['wavy', 'Wavy']], { cols: 4 }),
  g('Body text'),
  f('bFont', 'Font', 'font'),
  f('bSize', 'Size (%)', 'range', { min: 75, max: 150, step: 5, def: 100 }),
  ch('bWeight', 'Weight', WEIGHTS.slice(0, 6), { cols: 3 }),
  f('bLine', 'Line height', 'range', { min: 1.1, max: 2.4, step: 0.05, def: 1.65 }),
  f('bColor', 'Colour', 'color'),
  g('Buttons'),
  ch('btnLook', 'Style', [['', 'Theme'], ['solid', 'Solid'], ['gradient', 'Gradient'], ['glow', 'Glow'], ['pop', '3D pop'], ['outline', 'Outline'], ['glass', 'Glass'], ['link', 'Text link'], ['brutal', 'Brutal']], { cols: 3 }),
  ch('btnShape', 'Shape', [['', 'Theme'], ['square', 'Square'], ['rounded', 'Rounded'], ['pill', 'Pill']], { cols: 4 }),
  ch('btnSize', 'Size', [['', 'Normal'], ['sm', 'Small'], ['lg', 'Large'], ['xl', 'Huge']], { cols: 4 }),
];

export const STYLE_FIELDS = [
  g('Background'),
  ch('tone', 'Tone', [['', 'Theme'], ['dark', 'Dark'], ['brand', 'Brand colour'], ['soft', 'Soft tint'], ['light', 'Light'], ['vivid', 'On colour']], { cols: 3 }),
  f('bg', 'Colour', 'color'),
  ch('bgGradient', 'Gradient', GRAD_OPTS, { cols: 3 }),
  f('bgImage', 'Image', 'image'),
  f('overlay', 'Darken image (%)', 'range', { min: 0, max: 90, def: 0, show: (v) => !!v.bgImage }),
  f('bgFixed', 'Parallax (image stays still)', 'toggle', { show: (v) => !!v.bgImage }),
  ch('pattern', 'Pattern', [['', 'None'], ['dots', 'Dots'], ['grid', 'Grid'], ['lines', 'Lines'], ['cross', 'Crosses'], ['noise', 'Grain']], { cols: 3 }),
  f('color', 'Text colour', 'color'),
  g('Box'),
  ch('box', 'Content box', [['', 'None'], ['card', 'Card'], ['glass', 'Glass'], ['outline', 'Outline'], ['raised', 'Raised'], ['float', 'Floating'], ['inset', 'Inset'], ['gradient', 'Gradient border']], { cols: 2 }),
  f('radius', 'Box corners', 'range', { min: 0, max: 48, def: 18, show: (v) => !!v.box }),
  ch('shadow', 'Box shadow', [['', 'Default'], ['none', 'None'], ['sm', 'Small'], ['lg', 'Large'], ['glow', 'Glow'], ['color', 'Coloured']], { cols: 3, show: (v) => !!v.box }),
  g('Layout'),
  f('paddingY', 'Vertical space', 'range', { min: 0, max: 200 }),
  f('align', 'Alignment', 'select', { options: [['', 'Default'], ['left', 'Left'], ['center', 'Center'], ['right', 'Right']] }),
  f('width', 'Content width', 'select', { options: [['', 'Normal'], ['narrow', 'Narrow'], ['wide', 'Wide'], ['full', 'Full width']] }),
  g('Effects'),
  ch('anim', 'Entrance animation', [['', 'Fade up'], ['fade', 'Fade'], ['zoom', 'Zoom'], ['left', 'Slide from left'], ['right', 'Slide from right'], ['flip', 'Flip'], ['blur', 'Blur in'], ['none', 'None']], { cols: 2 }),
  g('Shapes'),
  f('shapeTop', 'Top edge', 'edge'),
  f('shapeBottom', 'Bottom edge', 'edge'),
  f('shapeHeight', 'Edge height', 'range', { min: 20, max: 320, def: 90, show: (v) => !!(v.shapeTop || v.shapeBottom) }),
  f('shapeColor', 'Edge colour (match the next section)', 'color', { show: (v) => !!(v.shapeTop || v.shapeBottom) }),
  f('shapeFlip', 'Mirror edges', 'toggle', { show: (v) => !!(v.shapeTop || v.shapeBottom) }),
  f('decor', 'Background shape', 'decor'),
  ch('decorPos', 'Shape position', [['tr', 'Top right'], ['tl', 'Top left'], ['br', 'Bottom right'], ['bl', 'Bottom left'], ['both', 'Two corners'], ['center', 'Behind centre']], { def: 'tr', show: (v) => !!v.decor }),
  f('decorSize', 'Shape size', 'range', { min: 60, max: 900, def: 320, show: (v) => !!v.decor }),
  f('decorOpacity', 'Shape strength (%)', 'range', { min: 2, max: 100, def: 16, show: (v) => !!v.decor }),
  f('decorColor', 'Shape colour', 'color', { show: (v) => !!v.decor }),
  f('decorMotion', 'Slow floating motion', 'toggle', { show: (v) => !!v.decor }),
  g('Advanced'),
  f('anchor', 'Section ID (for menu links, e.g. about)'),
  f('hideMobile', 'Hide on mobile', 'toggle'),
];

export function makeBlock(type, props = {}, style = {}) {
  return { id: uid(), type, props: { ...BLOCKS[type].defaults(), ...props }, style };
}

export const DEFAULT_THEME = {
  primary: '#2F5BFF',
  secondary: '#FFB020',
  bg: '#FFFFFF',
  surface: '#F5F7FB',
  text: '#16213E',
  muted: '#5B6680',
  border: '#E1E6EF',
  headingFont: 'Manrope',
  bodyFont: 'Inter',
  baseSize: 17,
  headingWeight: '700',
  letterSpacing: -0.02,
  headingCase: 'none',
  radius: 12,
  maxWidth: 1120,
  sectionSpacing: 96,
  buttonStyle: 'rounded',
  pattern: 'none',
  // Page background: base colour (bg) + optional gradient or image, with pattern on top
  bgType: 'color',
  bgGradient: 'brand',
  bgGrad1: '#FDFBFB',
  bgGrad2: '#E2E8F5',
  bgAngle: 135,
  bgImage: '',
  bgOverlay: 0,
  bgSize: 'cover',
  bgFixed: false,
  // Page layout: contained | full | boxed | mobile
  layout: 'contained',
  outerBg: '#E9ECF2',
  animation: true,
  // Visitor light/dark switch: alt* is the palette the switch flips to
  modeToggle: false,
  altPrimary: '#58A6FF',
  altBg: '#0D1117',
  altSurface: '#161B22',
  altText: '#E6EDF3',
  altMuted: '#8B949E',
  altBorder: '#30363D',
  commandPalette: false,
  customCSS: '',
};
