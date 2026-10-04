// Ready-made components: groups of 2–15 styled blocks that are inserted together.
import { img, makeBlock } from './blocks';

const B = (type, props = {}, style = {}) => makeBlock(type, props, style);
const C = (name, category, blocks) => ({ id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), name, category, blocks });
const center = { align: 'center' };
const dark = { tone: 'dark' };
const soft = { tone: 'soft' };
const tight = { paddingY: 16 };

export const COMPONENT_CATEGORIES = ['Intro', 'Text & media', 'About', 'Work', 'Services', 'Social proof', 'Contact & CTA', 'Developer', 'Endings', 'Full pages'];

export const COMPONENTS = [
  // ---------- Intro ----------
  C('Navigation + hero', 'Intro', () => [B('navbar'), B('hero')]),
  C('Hero + client logos', 'Intro', () => [B('hero', { layout: 'split', imageShape: 'blob' }), B('logos', { variant: 'marquee' })]),
  C('Hero + numbers', 'Intro', () => [B('hero', { layout: 'image-left', imageShape: 'arch' }), B('stats', { variant: 'cards' })]),
  C('Centred intro', 'Intro', () => [B('heading', { text: 'Hi, I’m Riya — a product designer.', level: '1' }, center), B('text', { text: 'I design calm, useful software for fintech and health teams.' }, { ...center, paddingY: 8 }), B('button', { text: 'See my work', url: '#work' }, center)]),
  C('Photo intro', 'Intro', () => [B('image', { src: img('intro-face', 600, 600), shape: 'circle', ratio: '1/1', width: 28 }, { paddingY: 40 }), B('heading', { text: 'Riya Sen', level: '2' }, { ...center, paddingY: 0 }), B('text', { text: 'Designer · Writer · Jaipur' }, { ...center, paddingY: 8 }), B('social', { variant: 'circles' }, center)]),
  C('Big type + scrolling words', 'Intro', () => [B('hero', { layout: 'minimal' }), B('marquee', { variant: 'band' })]),
  C('Gradient hero + features', 'Intro', () => [B('hero', { layout: 'gradient', gradient: 'aurora' }), B('services', { variant: 'icons' })]),
  C('Video hero + call to action', 'Intro', () => [B('hero', { layout: 'video', overlay: 55 }), B('cta', { variant: 'minimal' })]),
  C('Cover photo + ticker + stats', 'Intro', () => [B('hero', { layout: 'cover', overlay: 50 }, { width: 'full' }), B('marquee', { variant: 'small' }), B('stats', { variant: 'divided' })]),
  C('Collage hero + statement', 'Intro', () => [B('hero', { layout: 'collage', imageShape: 'rounded' }), B('statement', { variant: 'marker' }, soft)]),

  // ---------- Text & media ----------
  C('Heading + text', 'Text & media', () => [B('heading', { text: 'A short headline', level: '2' }), B('text')]),
  C('Heading + text + button', 'Text & media', () => [B('heading', { text: 'Ready to start?', level: '2' }), B('text', { text: 'Tell me about your project and I’ll get back within a day.' }), B('button', { text: 'Get in touch', url: '#contact' })]),
  C('Image + caption text', 'Text & media', () => [B('image', { shape: 'curved', frame: 'shadow' }), B('text', { text: 'A short caption that explains what we are looking at.' }, center)]),
  C('Image + heading + text + button', 'Text & media', () => [B('image', { ratio: '16/9', shape: 'curved' }), B('heading', { text: 'Project spotlight', level: '2' }), B('text'), B('button', { text: 'Read more', url: '#' })]),
  C('Heading + two buttons', 'Text & media', () => [B('heading', { text: 'Let’s build something good', level: '2' }, center), B('text', { text: 'Pick whichever is easier for you.' }, { ...center, paddingY: 8 }), B('button', { text: 'Book a call', url: '#' }, { ...center, paddingY: 8 }), B('button', { text: 'Send an email', url: 'mailto:hello@example.com', variant: 'outline' }, { ...center, paddingY: 8 })]),
  C('Photo + quote', 'Text & media', () => [B('image', { shape: 'arch', ratio: '3/4', width: 45 }), B('quote', { variant: 'mark' })]),
  C('Heading + divider + text', 'Text & media', () => [B('heading', { text: 'My approach', level: '2' }, center), B('divider', { style: 'accent' }, tight), B('text', { text: 'Listen first, sketch early, ship small, measure, repeat.' }, center)]),
  C('Title + two paragraphs', 'Text & media', () => [B('heading', { text: 'The long story', level: '2' }), B('text'), B('text', { text: 'These days I split my time between client work, writing and teaching a small design class.' })]),
  C('Image left + text', 'Text & media', () => [B('heading', { text: 'Why it works', level: '2' }, center), B('mediatext', { variant: 'left' })]),
  C('Text + image right', 'Text & media', () => [B('mediatext', { variant: 'right' }), B('button', { text: 'See more', url: '#' }, center)]),
  C('Three feature rows', 'Text & media', () => [B('mediatext', { variant: 'left', kicker: '01' }), B('mediatext', { variant: 'right', kicker: '02', title: 'Prototypes within days' }), B('mediatext', { variant: 'left', kicker: '03', title: 'Systems that scale' })]),
  C('Photo story', 'Text & media', () => [B('heading', { text: 'Behind the project', level: '2' }), B('text'), B('spacer', { height: 30 }), B('image', { ratio: '21/9', shape: 'curved' }), B('text', { text: 'Every detail was tested with real users before launch.' })]),

  // ---------- About ----------
  C('About + numbers', 'About', () => [B('about', { variant: 'image-left' }), B('stats', { variant: 'plain' })]),
  C('About + skills', 'About', () => [B('about', { variant: 'circle' }), B('skills', { display: 'bars', columns: 2 })]),
  C('About + experience + education', 'About', () => [B('about', { variant: 'image-right' }), B('experience', { variant: 'timeline' }, { width: 'narrow' }), B('education', { variant: 'list' }, { width: 'narrow' })]),
  C('About with facts + button', 'About', () => [B('about', { variant: 'overlap', facts: 'Based in: Jaipur\nExperience: 8 years\nLanguages: English, Hindi', buttonText: 'Download CV', buttonUrl: '#', signature: 'Riya' }), B('logos', { title: 'Worked with', variant: 'row' })]),
  C('About + quote', 'About', () => [B('about', { variant: 'boxed' }), B('quote', { variant: 'bar' })]),
  C('About + team', 'About', () => [B('about', { variant: 'centered' }), B('team', { variant: 'circles' })]),
  C('Story + timeline', 'About', () => [B('statement', { variant: 'split', label: 'My story', text: 'From fixing radios to designing apps used by a million people.' }), B('experience', { variant: 'center' })]),
  C('About + skill cloud + learning', 'About', () => [B('about', { variant: 'image-top' }), B('skills', { display: 'cloud' }, center), B('learning')]),
  C('Profile card + social', 'About', () => [B('about', { variant: 'circle' }, { box: 'card' }), B('social', { variant: 'buttons' })]),
  C('Resume summary', 'About', () => [B('about', { variant: 'centered' }), B('experience', { variant: 'compact' }), B('skills', { display: 'levels', columns: 2 }), B('resume')]),

  // ---------- Work ----------
  C('Heading + gallery', 'Work', () => [B('heading', { text: 'Selected shots', level: '2' }, center), B('gallery', { title: '', layout: 'big2' })]),
  C('Projects + call to action', 'Work', () => [B('projects', { layout: 'cards', columns: 3 }), B('cta', { variant: 'split' })]),
  C('Gallery + button', 'Work', () => [B('gallery', { layout: 'masonry' }), B('button', { text: 'See the full portfolio', url: '#', variant: 'outline' }, center)]),
  C('Case study + results', 'Work', () => [B('casestudy'), B('stats', { variant: 'band' })]),
  C('Before / after + text', 'Work', () => [B('beforeafter'), B('text', { text: 'Drag the slider to compare the old and new design.' }, center)]),
  C('Tabs + projects', 'Work', () => [B('tabs', { variant: 'pills' }), B('projects', { layout: 'minimal', columns: 3 })]),
  C('Bento projects + testimonials', 'Work', () => [B('projects', { layout: 'bento', columns: 4 }), B('testimonials', { variant: 'single', stars: true })]),
  C('Polaroid gallery + quote', 'Work', () => [B('gallery', { layout: 'polaroid' }, soft), B('quote', { variant: 'centered' })]),
  C('Video + story', 'Work', () => [B('video', { frame: 'card', side: 'right', heading: 'Watch the making of', text: 'Two minutes on how we built it.' }), B('button', { text: 'Read the full story', url: '#' }, center)]),
  C('Showreel + gallery + logos', 'Work', () => [B('video', { frame: 'cinema', title: 'Showreel' }), B('gallery', { layout: 'big4' }), B('logos', { variant: 'row' })]),

  // ---------- Services ----------
  C('Services + process', 'Services', () => [B('services', { variant: 'cards' }), B('process', { variant: 'row' })]),
  C('Services + pricing', 'Services', () => [B('services', { variant: 'numbered' }), B('pricing', { variant: 'bordered' })]),
  C('Process + call to action', 'Services', () => [B('process', { variant: 'circles' }), B('cta', { variant: 'gradient' })]),
  C('Services + FAQ', 'Services', () => [B('services', { variant: 'list' }), B('faq', { variant: 'plus' })]),
  C('Pricing + FAQ + call to action', 'Services', () => [B('pricing', { variant: 'gradient' }), B('faq', { variant: 'twocol' }), B('cta', { variant: 'banner' })]),
  C('Icon services + numbers', 'Services', () => [B('services', { variant: 'icons', items: [{ icon: '🎨', title: 'Design', desc: 'Interfaces people enjoy.' }, { icon: '💻', title: 'Development', desc: 'Fast, accessible builds.' }, { icon: '📈', title: 'Growth', desc: 'Pages that convert.' }] }), B('stats', { variant: 'circles' })]),
  C('Timeline process + button', 'Services', () => [B('process', { variant: 'timeline' }, { width: 'narrow' }), B('button', { text: 'Start a project', url: '#contact' }, center)]),
  C('Statement + services', 'Services', () => [B('statement', { variant: 'gradient', text: 'I help small teams ship big ideas.', highlight: 'big ideas' }), B('services', { variant: 'outline' })]),
  C('Services + testimonials', 'Services', () => [B('services', { variant: 'gradient' }), B('testimonials', { variant: 'bubbles' })]),
  C('Services tabs', 'Services', () => [B('heading', { text: 'What I can do for you', level: '2' }, center), B('tabs', { variant: 'cards' })]),

  // ---------- Social proof ----------
  C('Testimonials + logos', 'Social proof', () => [B('testimonials', { variant: 'cards', stars: true }), B('logos', { variant: 'row' })]),
  C('Numbers + testimonials', 'Social proof', () => [B('stats', { variant: 'cards' }), B('testimonials', { variant: 'masonry' })]),
  C('Logos + big quote', 'Social proof', () => [B('logos', { variant: 'marquee' }), B('quote', { variant: 'highlight' })]),
  C('Testimonial carousel + CTA', 'Social proof', () => [B('testimonials', { variant: 'carousel' }), B('cta', { variant: 'outline' })]),
  C('Certifications + logos', 'Social proof', () => [B('certs'), B('logos', { variant: 'boxed' })]),
  C('Proof stack', 'Social proof', () => [B('stats', { variant: 'band' }), B('testimonials', { variant: 'minimal' }), B('logos', { variant: 'color' })]),
  C('Quote + social links', 'Social proof', () => [B('quote', { variant: 'card' }), B('social', { variant: 'pills' }, center)]),
  C('Team + testimonials', 'Social proof', () => [B('team', { variant: 'overlay' }), B('testimonials', { variant: 'cards' }, soft)]),

  // ---------- Contact & CTA ----------
  C('CTA + contact', 'Contact & CTA', () => [B('cta', { variant: 'banner' }), B('contact', { variant: 'split' })]),
  C('Contact + map', 'Contact & CTA', () => [B('contact', { variant: 'card', showForm: true }), B('map')]),
  C('Contact + social', 'Contact & CTA', () => [B('contact', { variant: 'centered', showForm: false }), B('social', { variant: 'circles' }, center)]),
  C('Newsletter + social', 'Contact & CTA', () => [B('newsletter', { variant: 'card' }), B('social', { variant: 'text' }, center)]),
  C('Booking + FAQ', 'Contact & CTA', () => [B('booking', { variant: 'split' }), B('faq', { variant: 'cards' })]),
  C('Gradient CTA + footer', 'Contact & CTA', () => [B('cta', { variant: 'gradient' }), B('footer', { variant: 'centered' })]),
  C('Contact band + footer', 'Contact & CTA', () => [B('contact', { variant: 'band' }), B('footer', { variant: 'line' })]),
  C('Link-in-bio list', 'Contact & CTA', () => [B('links', { variant: 'pill' }), B('social', { variant: 'circles' }, center)]),
  C('CTA + newsletter', 'Contact & CTA', () => [B('cta', { variant: 'image', image: img('cta-photo', 1600, 900) }), B('newsletter', { variant: 'inline' })]),
  C('Minimal contact', 'Contact & CTA', () => [B('heading', { text: 'Say hello', level: '1' }), B('contact', { variant: 'minimal', title: '', showForm: false })]),

  // ---------- Developer ----------
  C('Tech stack + GitHub', 'Developer', () => [B('techstack'), B('github')]),
  C('Featured projects + case study', 'Developer', () => [B('featured'), B('casestudy')]),
  C('Architecture + dependency graph', 'Developer', () => [B('architecture'), B('depgraph')]),
  C('Terminal + code playground', 'Developer', () => [B('terminal'), B('playground')]),
  C('API + WebSocket demos', 'Developer', () => [B('apiplayground'), B('websocket')]),
  C('Coding stats + open source', 'Developer', () => [B('codingstats'), B('opensource')]),
  C('Performance + live status', 'Developer', () => [B('performance'), B('livestatus')]),
  C('Blog + learning', 'Developer', () => [B('blog'), B('learning')]),

  // ---------- Endings ----------
  C('Giant footer + social', 'Endings', () => [B('social', { variant: 'outline' }, center), B('footer', { variant: 'big', bigText: 'Let’s talk.' })]),
  C('CTA + simple footer', 'Endings', () => [B('cta', { variant: 'minimal' }), B('footer', { variant: 'simple' })]),
  C('Newsletter + footer', 'Endings', () => [B('newsletter', { variant: 'banner' }), B('footer', { variant: 'split', links: [{ label: 'Work', url: '#work' }, { label: 'About', url: '#about' }, { label: 'Contact', url: '#contact' }] })]),
  C('Social + footer', 'Endings', () => [B('social', { variant: 'squares' }, center), B('footer', { variant: 'centered' })]),
  C('Statement + footer', 'Endings', () => [B('statement', { variant: 'huge', text: 'Thanks for scrolling this far.', highlight: 'Thanks' }), B('footer', { variant: 'line' })]),
  C('Scrolling words + footer', 'Endings', () => [B('marquee', { variant: 'double' }), B('footer', { variant: 'simple' })]),

  // ---------- Full pages ----------
  C('Designer one-pager', 'Full pages', () => [B('navbar', { navStyle: 'pill', sticky: true }), B('hero', { layout: 'split', imageShape: 'blob' }), B('logos', { variant: 'marquee' }), B('gallery', { layout: 'bento' }, { anchor: 'work' }), B('about', { variant: 'overlap' }, { anchor: 'about' }), B('services', { variant: 'numbered' }), B('testimonials', { variant: 'cards', stars: true }), B('cta', { variant: 'gradient' }), B('contact', {}, { anchor: 'contact' }), B('footer', { variant: 'big', bigText: 'Let’s talk.' })]),
  C('Developer one-pager', 'Full pages', () => [B('navbar', { navStyle: 'glass', sticky: true }), B('hero3d'), B('stats', { variant: 'divided' }), B('techstack', {}, { anchor: 'about' }), B('featured', {}, { anchor: 'work' }), B('architecture'), B('experience', { variant: 'cards' }), B('github'), B('terminal'), B('blog'), B('contact', {}, { anchor: 'contact' }), B('footer')]),
  C('Photographer page', 'Full pages', () => [B('navbar', { navStyle: 'centered' }), B('hero', { layout: 'cover', overlay: 40, height: 'screen' }, { width: 'full' }), B('gallery', { layout: 'justified' }, { anchor: 'work', width: 'wide' }), B('quote', { variant: 'mark' }), B('gallery', { title: 'Stories', layout: 'big2r' }), B('pricing', { variant: 'minimal' }), B('contact', {}, { anchor: 'contact' }), B('footer', { variant: 'centered' })]),
  C('Freelancer page', 'Full pages', () => [B('navbar', { ctaText: 'Hire me', ctaUrl: '#contact' }), B('hero', { layout: 'image-left', imageShape: 'circle' }), B('services', { variant: 'icons' }, { anchor: 'about' }), B('process', { variant: 'arrows' }), B('projects', { layout: 'big2' }, { anchor: 'work' }), B('pricing', { variant: 'cards' }), B('faq'), B('booking', { variant: 'button' }), B('footer')]),
  C('Link-in-bio page', 'Full pages', () => [B('image', { src: img('bio-avatar', 400, 400), shape: 'circle', ratio: '1/1', width: 30 }, { paddingY: 48 }), B('heading', { text: '@tara.makes', level: '2' }, { ...center, paddingY: 0 }), B('text', { text: 'Ceramics, studio diaries and workshops in Jaipur.' }, { ...center, paddingY: 8 }), B('links', { variant: 'shadow' }, { paddingY: 24 }), B('social', { variant: 'circles' }, center), B('footer', { variant: 'line', text: '© 2026 Tara' })]),
  C('Consultant page', 'Full pages', () => [B('navbar', { navStyle: 'underline' }), B('hero', { layout: 'split', imageShape: 'rounded' }), B('logos', { variant: 'row' }), B('stats', { variant: 'band' }), B('services', { variant: 'list' }), B('casestudy'), B('testimonials', { variant: 'single', stars: true }), B('booking', { variant: 'split' }), B('footer', { variant: 'split' })]),
  C('Minimal resume', 'Full pages', () => [B('heading', { text: 'Riya Sen', level: '1' }), B('text', { text: 'Product designer · Jaipur · hello@example.com' }, { paddingY: 0 }), B('divider', {}, tight), B('experience', { variant: 'compact' }), B('education', { variant: 'compact' }), B('skills', { display: 'tags' }), B('resume'), B('footer', { variant: 'line' })]),
  C('Writer page', 'Full pages', () => [B('navbar', { navStyle: 'stacked' }), B('statement', { variant: 'split', label: 'Writer', text: 'Words that make complicated products feel simple.' }), B('about', { variant: 'centered' }), B('blog'), B('newsletter', { variant: 'minimal' }), B('footer', { variant: 'simple' })]),
  C('Musician page', 'Full pages', () => [B('navbar', { navStyle: 'bold' }), B('hero', { layout: 'cover', overlay: 55 }, { width: 'full' }), B('embed'), B('video', { frame: 'glow', title: 'Live session' }, dark), B('gallery', { layout: 'filmstrip' }), B('social', { variant: 'buttons' }), B('contact', { title: 'Bookings' }), B('footer')]),
  C('Chef page', 'Full pages', () => [B('navbar'), B('hero', { layout: 'card', overlay: 20 }), B('gallery', { layout: 'mosaic' }), B('mediatext', { variant: 'overlap', kicker: 'The kitchen', title: 'Seasonal food, cooked with care' }), B('pricing', { title: 'Menus' }), B('testimonials', { variant: 'bubbles' }), B('booking', { variant: 'button', title: 'Book a private dinner' }), B('map'), B('footer')]),
  C('Founder page', 'Full pages', () => [B('navbar', { navStyle: 'split' }), B('hero', { layout: 'minimal', title: 'Building tools that cut industrial emissions.' }), B('stats', { variant: 'left' }), B('about', { variant: 'image-right' }), B('experience', { variant: 'numbered' }), B('logos', { title: 'Featured in' }), B('contact'), B('footer')]),
  C('Case study page', 'Full pages', () => [B('casestudy'), B('beforeafter'), B('process', { variant: 'big' }), B('stats', { variant: 'cards' }), B('testimonials', { variant: 'single' }), B('cta', { variant: 'split' })]),
  C('Coming soon page', 'Full pages', () => [B('hero', { layout: 'gradient', gradient: 'berry', title: 'Something new is on the way.', subtitle: 'Leave your email and be the first to see it.', buttonText: '', button2Text: '' }), B('newsletter', { variant: 'inline' }), B('social', { variant: 'circles' }, center)]),
  C('Agency style page', 'Full pages', () => [B('navbar', { navStyle: 'tabs' }), B('hero', { layout: 'minimal' }, { bgGradient: 'mesh' }), B('marquee', { variant: 'tilted' }), B('projects', { layout: 'center' }), B('services', { variant: 'gradient' }), B('team', { variant: 'cards' }), B('testimonials', { variant: 'carousel' }), B('cta', { variant: 'image', image: img('agency-cta', 1600, 900) }), B('footer', { variant: 'big', bigText: 'Studio.' })]),
  C('Student page', 'Full pages', () => [B('navbar'), B('hero', { layout: 'split', imageShape: 'circle', kicker: 'Computer science student', title: 'Learning fast and building things.' }), B('skills', { display: 'icons' }), B('projects', { layout: 'cards', columns: 3 }), B('education', { variant: 'timeline' }), B('certs'), B('resume'), B('contact'), B('footer')]),
  C('Everything showcase', 'Full pages', () => [B('navbar', { navStyle: 'glass', sticky: true }), B('hero', { layout: 'collage', imageShape: 'blob' }), B('logos', { variant: 'marquee' }), B('about', { variant: 'overlap' }), B('stats', { variant: 'band' }), B('gallery', { layout: 'big2' }), B('services', { variant: 'icons' }), B('process', { variant: 'circles' }), B('projects', { layout: 'zigzag' }), B('testimonials', { variant: 'carousel' }), B('pricing', { variant: 'gradient' }), B('faq', { variant: 'plus' }), B('newsletter', { variant: 'card' }), B('contact'), B('footer', { variant: 'big', bigText: 'Thanks!' })]),
];

export const getComponent = (id) => COMPONENTS.find((c) => c.id === id) || null;
