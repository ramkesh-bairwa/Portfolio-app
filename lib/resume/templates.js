// Resume templates: every category gets all 30 designs, filled with that profession's content.
import { TEMPLATE_CATEGORIES } from '../templates';
import { NAMES, PACKS } from '../templateGen';
import { BASE_DESIGNS, TOP_DESIGNS, getDesign } from './designs';
import { makeSection } from './sections';

export const TOP_CATEGORY = 'Top Ranking';
const PROFESSION_CATEGORIES = TEMPLATE_CATEGORIES.filter((c) => c !== 'All' && c !== 'Link in bio' && PACKS[c]);
export const RESUME_CATEGORIES = [TOP_CATEGORY, ...PROFESSION_CATEGORIES];
// Professions used to fill the Top Ranking designs
const TOP_PROFESSIONS = ['Software Engineer', 'Product Manager', 'Data Scientist', 'Finance', 'Consultant', 'Marketing', 'Sales', 'UI/UX Designer', 'Full Stack Developer', 'DevOps Engineer', 'Lawyer', 'Entrepreneur', 'HR', 'Doctor', 'Data Analyst', 'Architect', 'Digital Marketing', 'AI / ML Engineer', 'Accountant', 'Teacher'];

const catSlug = (c) => c.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const cap = (s) => String(s || '').replace(/^\w/, (c) => c.toUpperCase());
const handle = (n) => n.toLowerCase().replace(/[^a-z]+/g, '');
const CITIES = ['Jaipur, India', 'Bengaluru, India', 'Pune, India', 'Mumbai, India', 'Delhi, India', 'Hyderabad, India', 'Chennai, India', 'Ahmedabad, India'];

const EDUCATION = {
  tech: [['B.Tech, Computer Science', 'IIT Jodhpur', '2014 – 2018', 'CGPA 8.6 / 10']],
  visual: [['B.Des, Communication Design', 'National Institute of Design', '2013 – 2017', 'Graduated with distinction']],
  business: [['MBA, Marketing & Strategy', 'IIM Indore', '2012 – 2014', 'Dean’s list'], ['B.Com (Hons)', 'Delhi University', '2009 – 2012', '']],
  people: [['Bachelor’s degree', 'University of Rajasthan', '2010 – 2013', '']],
};
const EDU_BY_CAT = {
  Doctor: [['MD, Internal Medicine', 'AIIMS Delhi', '2010 – 2013', ''], ['MBBS', 'SMS Medical College, Jaipur', '2004 – 2009', '']],
  Nurse: [['B.Sc Nursing', 'Manipal College of Nursing', '2010 – 2014', '']],
  Teacher: [['M.Sc Mathematics, B.Ed', 'University of Rajasthan', '2008 – 2012', 'Gold medallist']],
  Chef: [['Diploma in Culinary Arts', 'IHM Mumbai', '2010 – 2013', '']],
  Lawyer: [['LLB', 'National Law University, Jodhpur', '2005 – 2010', '']],
  Accountant: [['Chartered Accountant', 'ICAI', '2012', 'All India rank 42'], ['B.Com', 'Delhi University', '2007 – 2010', '']],
  Finance: [['Chartered Accountant', 'ICAI', '2014', ''], ['B.Com (Hons)', 'SRCC, Delhi', '2009 – 2012', '']],
  Student: [['B.Tech, Computer Science (pursuing)', 'Manipal University Jaipur', '2023 – 2027', 'CGPA 8.9 / 10'], ['Class XII (CBSE)', 'DPS Jaipur', '2023', '94%']],
  Architect: [['B.Arch', 'CEPT University', '2007 – 2012', '']],
  'Fitness Trainer': [['Certified Strength & Conditioning Coach', 'NSCA', '2016', '']],
};
const CERTS = {
  tech: [['AWS Certified Solutions Architect', 'Amazon Web Services', '2024'], ['Professional Scrum Master I', 'Scrum.org', '2023']],
  visual: [['Google UX Design Certificate', 'Coursera', '2023'], ['Adobe Certified Professional', 'Adobe', '2022']],
  business: [['Google Analytics Certification', 'Google', '2024'], ['Six Sigma Green Belt', 'KPMG', '2022']],
  people: [['First Aid & CPR', 'Red Cross', '2024'], ['Professional development course', 'Coursera', '2023']],
};

function contentFor(cat, ci, i, design) {
  const p = PACKS[cat];
  const name = NAMES[(i * 3 + ci) % NAMES.length];
  const kind = p.k === 'linkbio' ? 'people' : p.k;
  const S = (type, props = {}, style = {}) => makeSection(type, props, style);
  const exp = p.ex.map(([role, company, period, desc], j) => ({
    role, company, location: CITIES[(ci + j) % CITIES.length].split(',')[0], period,
    bullets: [desc, `${p.st[j + 1][0]} ${p.st[j + 1][1].toLowerCase()}`, `${p.pr[j % p.pr.length][0]}: ${p.pr[j % p.pr.length][1].replace(/\.$/, '')}`].join('\n'),
  }));
  const sec = {
    header: S('header', {
      name, title: cap(p.role), email: `${handle(name)}@email.com`, phone: '+91 98' + String(10000000 + ((ci * 7919 + i * 104729) % 89999999)).slice(0, 8),
      location: CITIES[(ci + i) % CITIES.length], linkedin: `linkedin.com/in/${handle(name)}`, github: kind === 'tech' ? `github.com/${handle(name)}` : '',
    }),
    summary: S('summary', { title: design.ats ? 'Professional Summary' : 'Profile', text: `${p.about} ${p.sub}` }),
    experience: S('experience', { title: design.ats ? 'Work Experience' : 'Experience', items: exp }),
    projects: S('projects', { items: p.pr.map(([nm, desc, tech]) => ({ name: nm, link: '', period: '', tech, desc })) }),
    education: S('education', { items: (EDU_BY_CAT[cat] || EDUCATION[kind]).map(([degree, school, period, details]) => ({ degree, school, location: '', period, details })) }),
    skills: S('skills', { title: design.ats ? 'Core Skills' : 'Skills', items: String(p.s).split(',').map((x, k) => ({ name: x.trim(), level: 92 - k * 7 })) }),
    certifications: S('certifications', { items: CERTS[kind].map(([nm, issuer, date]) => ({ name: nm, issuer, date })) }),
    achievements: S('achievements', { title: design.theme.tiles ? 'Impact' : 'Key achievements', text: p.st.map(([v, l]) => `${v} ${l.toLowerCase()}`).join('\n') }),
    languages: S('languages'),
    interests: S('interests', { text: ['Reading, Travel, Photography', 'Cricket, Music, Cooking', 'Running, Chess, Volunteering'][i % 3] }),
    personal: S('personal'),
    declaration: S('declaration', { place: CITIES[(ci + i) % CITIES.length].split(',')[0] }),
  };
  let order;
  if (design.slug === 'student-fresher' || cat === 'Student') order = ['header', 'summary', 'education', 'projects', 'skills', 'experience', 'certifications', 'achievements', 'languages', 'interests'];
  else if (design.theme.tiles) order = ['header', 'achievements', 'summary', 'experience', 'skills', 'education', 'projects', 'certifications', 'languages'];
  else if (design.tier === 'top') order = ['header', 'summary', 'experience', 'skills', 'achievements', 'education', 'projects', 'certifications', 'languages', 'interests'];
  else if (design.ats) order = ['header', 'summary', 'experience', 'skills', 'achievements', 'education', 'projects', 'certifications'];
  else order = ['header', 'summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'languages', 'interests'];
  if (design.slug === 'simple-indian') order = [...order, 'languages', 'personal', 'declaration'].filter((x, k, a) => a.indexOf(x) === k);
  return order.map((k) => sec[k]);
}

const topTemplates = TOP_DESIGNS.map((d, i) => {
  const cat = TOP_PROFESSIONS[i % TOP_PROFESSIONS.length];
  const ci = PROFESSION_CATEGORIES.indexOf(cat);
  return { slug: `top-${d.slug}`, name: d.name, category: TOP_CATEGORY, profession: cat, design: d.slug, premium: true, ats: d.ats, top: true, description: d.desc, build: () => contentFor(cat, ci, i, d) };
});

export const RESUME_TEMPLATES = [...topTemplates, ...PROFESSION_CATEGORIES.flatMap((cat, ci) =>
  BASE_DESIGNS.map((d, i) => ({
    slug: `${catSlug(cat)}-${d.slug}`,
    name: d.name,
    category: cat,
    design: d.slug,
    premium: d.premium,
    ats: d.ats,
    description: d.desc,
    build: () => contentFor(cat, ci, i, d),
  }))
)];
const BY_SLUG = new Map(RESUME_TEMPLATES.map((t) => [t.slug, t]));
export const getResumeTemplate = (slug) => BY_SLUG.get(slug) || null;

export function resumeFromTemplate(slug) {
  const t = getResumeTemplate(slug) || getResumeTemplate('software-engineer-classic-ats');
  const d = getDesign(t.design);
  return { name: `${t.profession || t.category} resume — ${t.name}`, template: t.slug, design: d.slug, theme: { ...d.theme }, sections: t.build() };
}

// Plain metadata for galleries (no functions, safe to pass to the client)
export const resumeTemplateList = () => RESUME_TEMPLATES.map(({ build, ...rest }) => rest);
