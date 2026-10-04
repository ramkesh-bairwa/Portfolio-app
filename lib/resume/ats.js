// A quick ATS (applicant tracking system) health check with a 0–100 score and tips.
import { getDesign } from './designs';
import { fullResumeTheme } from './render';

const ACTION_VERBS = /^(led|built|created|designed|delivered|grew|improved|increased|reduced|cut|launched|managed|owned|drove|developed|shipped|trained|won|saved|automated|negotiated|planned|organised|organized|handled|achieved|implemented|optimised|optimized|mentored|presented|scaled|raised|closed|resolved)\b/i;
const SAFE_FONTS = ['Inter', 'Lato', 'Source Sans 3', 'IBM Plex Sans', 'Work Sans', 'Montserrat', 'Merriweather', 'EB Garamond', 'Libre Baskerville', 'Figtree', 'Poppins', 'Nunito', 'Manrope', 'Outfit', 'DM Sans', 'Lora', 'Raleway'];

export function atsCheck(doc) {
  const t = fullResumeTheme(doc?.theme);
  const secs = Array.isArray(doc?.sections) ? doc.sections : [];
  const get = (type) => secs.find((s) => s.type === type)?.props;
  const head = get('header') || {};
  const summary = get('summary');
  const exp = get('experience');
  const skills = get('skills');
  const bullets = (exp?.items || []).flatMap((x) => String(x.bullets || '').split('\n').map((b) => b.trim()).filter(Boolean));
  const withNumbers = bullets.filter((b) => /\d/.test(b)).length;
  const withVerbs = bullets.filter((b) => ACTION_VERBS.test(b.replace(/^[-•*]\s*/, ''))).length;
  const words = JSON.stringify(secs.map((s) => s.props)).replace(/[^a-zA-Z ]/g, ' ').split(/\s+/).filter(Boolean).length;
  const design = getDesign(doc?.design);

  const checks = [
    [!!(head.email && head.phone), 12, 'Email and phone are present', 'Add both an email address and a phone number to the header.'],
    [!!head.location, 4, 'Location is listed', 'Add your city and country — many recruiters filter by location.'],
    [!!head.linkedin, 4, 'LinkedIn profile is linked', 'Add your LinkedIn URL; most recruiters check it.'],
    [!!(summary?.text && summary.text.length > 80), 10, 'Summary is 2–4 lines', 'Write a 2–4 line summary with your role, years of experience and top skills.'],
    [!!exp?.items?.length, 14, 'Work experience is included', 'Add an Experience section, even internships or freelance work.'],
    [bullets.length >= 4, 8, 'Experience uses bullet points', 'Use 3–5 bullet points per job, one achievement per line.'],
    [bullets.length > 0 && withNumbers / bullets.length >= 0.4, 10, 'Achievements include numbers', 'Add numbers to at least half your bullets (%, ₹, time saved, team size).'],
    [bullets.length > 0 && withVerbs / bullets.length >= 0.5, 6, 'Bullets start with action verbs', 'Start bullets with verbs like Led, Built, Improved, Reduced.'],
    [(skills?.items?.length || 0) >= 5, 10, 'At least 5 skills listed', 'List 6–12 hard skills that match the job description.'],
    [!!get('education'), 6, 'Education is included', 'Add your highest degree or qualification.'],
    [t.layout === 'single' || t.layout === 'timeline' || t.layout === 'band', 6, 'Single-column layout', 'Two-column layouts can confuse older ATS software. Pick an ATS design for online applications.'],
    [!head.showPhoto, 4, 'No photo', 'Photos are skipped by ATS and discouraged in many countries — hide it for online applications.'],
    [SAFE_FONTS.includes(t.bodyFont), 3, 'Readable body font', 'Use a standard font such as Lato, Inter or Source Sans for body text.'],
    [words >= 250 && words <= 900, 3, 'Good length (about one page)', words < 250 ? 'Your resume is short — add achievements and skills.' : 'Your resume is long — trim older or less relevant details.'],
  ];
  const max = checks.reduce((s, c) => s + c[1], 0);
  const got = checks.reduce((s, c) => s + (c[0] ? c[1] : 0), 0);
  return {
    score: Math.round((got / max) * 100),
    atsDesign: !!design?.ats,
    checks: checks.map(([ok, , label, tip]) => ({ ok: !!ok, label, tip })),
  };
}
