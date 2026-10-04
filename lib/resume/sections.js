// Resume sections: what each one holds and the fields the editor shows. Same field format as the portfolio blocks
// (minus HTML: resumes have no custom-code section).
export const rid = () => 'r' + Math.random().toString(36).slice(2, 10);
const f = (k, label, t = 'text', extra = {}) => ({ k, label, t, ...extra });
const title = f('title', 'Section title');
const list = (label, item, fields) => f('items', label, 'list', { item, fields });
const layoutField = f('layout', 'Layout', 'choice', { options: [['', 'Design default'], ['compact', 'Compact'], ['timeline', 'Timeline'], ['cards', 'Boxed']], cols: 2 });
const levelOpts = [['', 'Design default'], ['tags', 'Tags'], ['outline', 'Outline tags'], ['bars', 'Bars'], ['dots', 'Dots'], ['matrix', 'Matrix'], ['text', 'Plain text'], ['columns', 'Two columns']];

export const SECTION_GROUPS = ['Essentials', 'Extras', 'Personal'];

export const SECTIONS = {
  header: {
    label: 'Header', group: 'Essentials', icon: 'User', single: true,
    defaults: () => ({ name: 'Your Name', title: 'Job title', email: 'you@example.com', phone: '+91 98765 43210', location: 'Jaipur, India', website: '', linkedin: 'linkedin.com/in/yourname', github: '', photo: '', showPhoto: false }),
    fields: [
      f('name', 'Full name'), f('title', 'Job title / headline'), f('email', 'Email'), f('phone', 'Phone'), f('location', 'City, Country'),
      f('website', 'Website'), f('linkedin', 'LinkedIn'), f('github', 'GitHub / portfolio'), f('photo', 'Photo', 'image'), f('showPhoto', 'Show photo (skip for ATS)', 'toggle'),
      f('variant', 'Header style', 'choice', { options: [['', 'Design default'], ['left', 'Left aligned'], ['center', 'Centred'], ['rule', 'Bold rule'], ['stacked', 'Big stacked name'], ['boxed', 'Boxed name'], ['banner', 'Dark banner'], ['split', 'Name left, contacts right'], ['band', 'Colour band']], cols: 2 }),
    ],
  },
  summary: {
    label: 'Summary', group: 'Essentials', icon: 'Pilcrow',
    defaults: () => ({ title: 'Profile', text: 'Results-driven professional with 6+ years of experience. Known for clear communication, ownership and measurable impact.' }),
    fields: [title, f('text', 'Summary (3–4 lines work best)', 'textarea', { rows: 5 })],
  },
  experience: {
    label: 'Experience', group: 'Essentials', icon: 'Briefcase',
    defaults: () => ({ title: 'Experience', items: [
      { role: 'Senior Executive', company: 'Northwind Pvt Ltd', location: 'Bengaluru', period: '2022 – Present', bullets: 'Led a team of 6 and delivered 12 projects on time\nCut process costs by 18% through automation\nPresented monthly results to leadership' },
      { role: 'Executive', company: 'Brightloop', location: 'Pune', period: '2019 – 2022', bullets: 'Owned day-to-day operations for 3 client accounts\nImproved customer satisfaction from 82% to 94%' },
    ] }),
    fields: [title, layoutField, list('Jobs', { role: 'Role', company: 'Company', location: '', period: '', bullets: '' }, [f('role', 'Role'), f('company', 'Company'), f('location', 'Location'), f('period', 'Dates (e.g. 2021 – Present)'), f('bullets', 'Achievements (one per line, start with a verb, add numbers)', 'textarea', { rows: 5 })])],
  },
  education: {
    label: 'Education', group: 'Essentials', icon: 'GraduationCap',
    defaults: () => ({ title: 'Education', items: [{ degree: 'B.Tech, Computer Science', school: 'University of Rajasthan', location: 'Jaipur', period: '2015 – 2019', details: 'CGPA 8.4 / 10' }] }),
    fields: [title, layoutField, list('Entries', { degree: '', school: '', location: '', period: '', details: '' }, [f('degree', 'Degree / course'), f('school', 'School / university'), f('location', 'Location'), f('period', 'Dates'), f('details', 'Details (grade, honours)')])],
  },
  skills: {
    label: 'Skills', group: 'Essentials', icon: 'Gauge',
    defaults: () => ({ title: 'Skills', items: ['Communication', 'Project management', 'Excel', 'Problem solving', 'Leadership', 'Data analysis'].map((name, i) => ({ name, level: 90 - i * 7 })) }),
    fields: [title, f('display', 'Display', 'choice', { options: levelOpts, cols: 2 }), list('Skills', { name: 'Skill', level: 70 }, [f('name', 'Skill'), f('level', 'Level %', 'range', { min: 0, max: 100 })])],
  },
  projects: {
    label: 'Projects', group: 'Extras', icon: 'FolderKanban',
    defaults: () => ({ title: 'Projects', items: [{ name: 'Sales dashboard', link: '', period: '2024', tech: 'Power BI, SQL', desc: 'Built a dashboard used daily by 80 managers.' }] }),
    fields: [title, layoutField, list('Projects', { name: 'Project', link: '', period: '', tech: '', desc: '' }, [f('name', 'Name'), f('link', 'Link'), f('period', 'Date'), f('tech', 'Tools / tech'), f('desc', 'What you did and the result', 'textarea')])],
  },
  certifications: {
    label: 'Certifications', group: 'Extras', icon: 'Award',
    defaults: () => ({ title: 'Certifications', items: [{ name: 'Google Data Analytics', issuer: 'Coursera', date: '2024' }] }),
    fields: [title, list('Certifications', { name: '', issuer: '', date: '' }, [f('name', 'Name'), f('issuer', 'Issued by'), f('date', 'Date')])],
  },
  languages: {
    label: 'Languages', group: 'Extras', icon: 'MessageSquareQuote',
    defaults: () => ({ title: 'Languages', items: [{ name: 'English', level: 'Fluent' }, { name: 'Hindi', level: 'Native' }] }),
    fields: [title, f('display', 'Display', 'choice', { options: levelOpts, cols: 2 }), list('Languages', { name: '', level: 'Fluent' }, [f('name', 'Language'), f('level', 'Level', 'select', { options: ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic'].map((x) => [x, x]) })])],
  },
  awards: {
    label: 'Awards', group: 'Extras', icon: 'Trophy',
    defaults: () => ({ title: 'Awards', items: [{ name: 'Employee of the Year', by: 'Northwind', date: '2024', desc: '' }] }),
    fields: [title, list('Awards', { name: '', by: '', date: '', desc: '' }, [f('name', 'Award'), f('by', 'Given by'), f('date', 'Date'), f('desc', 'Details', 'textarea')])],
  },
  achievements: {
    label: 'Key achievements', group: 'Extras', icon: 'Sparkles',
    defaults: () => ({ title: 'Key achievements', text: 'Grew revenue by 32% in one year\nTrained 40+ new team members\nLaunched 3 products ahead of schedule' }),
    fields: [title, f('text', 'Achievements (one per line)', 'textarea', { rows: 5 })],
  },
  volunteering: {
    label: 'Volunteering', group: 'Extras', icon: 'Users',
    defaults: () => ({ title: 'Volunteering', items: [{ role: 'Mentor', org: 'Teach for India', period: '2023 – Present', desc: 'Weekly sessions for 25 students.' }] }),
    fields: [title, list('Roles', { role: '', org: '', period: '', desc: '' }, [f('role', 'Role'), f('org', 'Organisation'), f('period', 'Dates'), f('desc', 'Details', 'textarea')])],
  },
  publications: {
    label: 'Publications', group: 'Extras', icon: 'BookOpen',
    defaults: () => ({ title: 'Publications', items: [{ title: 'A study of customer retention', publisher: 'Journal of Business', date: '2023', link: '' }] }),
    fields: [title, list('Publications', { title: '', publisher: '', date: '', link: '' }, [f('title', 'Title'), f('publisher', 'Publisher'), f('date', 'Date'), f('link', 'Link')])],
  },
  courses: {
    label: 'Courses & training', group: 'Extras', icon: 'Lightbulb',
    defaults: () => ({ title: 'Courses', items: [{ name: 'Advanced Excel', provider: 'LinkedIn Learning', date: '2023' }] }),
    fields: [title, list('Courses', { name: '', provider: '', date: '' }, [f('name', 'Course'), f('provider', 'Provider'), f('date', 'Date')])],
  },
  strengths: {
    label: 'Strengths', group: 'Extras', icon: 'Rocket',
    defaults: () => ({ title: 'Strengths', items: [{ name: 'Ownership', desc: 'I see work through to the end.' }, { name: 'Clear communicator', desc: 'Complex ideas in simple words.' }] }),
    fields: [title, list('Strengths', { name: '', desc: '' }, [f('name', 'Strength'), f('desc', 'One line about it')])],
  },
  interests: {
    label: 'Interests', group: 'Personal', icon: 'Lightbulb',
    defaults: () => ({ title: 'Interests', text: 'Reading, Cricket, Travel, Photography' }),
    fields: [title, f('text', 'Interests (comma separated)')],
  },
  personal: {
    label: 'Personal details', group: 'Personal', icon: 'User',
    defaults: () => ({ title: 'Personal details', items: [{ label: 'Date of birth', value: '12 March 1997' }, { label: 'Nationality', value: 'Indian' }] }),
    fields: [title, list('Details', { label: '', value: '' }, [f('label', 'Label'), f('value', 'Value')])],
  },
  references: {
    label: 'References', group: 'Personal', icon: 'MessageSquareQuote',
    defaults: () => ({ title: 'References', note: 'Available on request', items: [] }),
    fields: [title, f('note', 'Note (shown when no references are listed)'), list('References', { name: '', role: '', contact: '' }, [f('name', 'Name'), f('role', 'Role & company'), f('contact', 'Email / phone')])],
  },
  declaration: {
    label: 'Declaration', group: 'Personal', icon: 'FileText',
    defaults: () => ({ title: 'Declaration', text: 'I hereby declare that the information above is true to the best of my knowledge.', place: 'Jaipur', date: '' }),
    fields: [title, f('text', 'Text', 'textarea'), f('place', 'Place'), f('date', 'Date')],
  },
  custom: {
    label: 'Custom section', group: 'Extras', icon: 'Pilcrow',
    defaults: () => ({ title: 'Custom section', text: 'Write anything here.', bullets: '' }),
    fields: [title, f('text', 'Text', 'textarea'), f('bullets', 'Bullet points (one per line)', 'textarea')],
  },
};

// Sections that sit in the sidebar by default in two-column designs
export const SIDE_DEFAULT = ['skills', 'languages', 'certifications', 'interests', 'personal', 'strengths', 'courses', 'references'];

export function makeSection(type, props = {}, style = {}) {
  return { id: rid(), type, props: { ...SECTIONS[type].defaults(), ...props }, style };
}
