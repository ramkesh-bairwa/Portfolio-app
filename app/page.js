import NextLink from 'next/link';
import { FileText, Image as ImageIcon, LayoutTemplate } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import Logo from '@/components/Logo';
import Plans from '@/components/home/Plans';
import { HeroCollage, PortfolioRow, PosterRow, ResumeRow } from '@/components/home/Showcase';
import { ResumeAssets } from '@/components/resume/ResumeView';
import { getTemplateList } from '@/lib/templateStore';
import { resumeTemplateList, RESUME_TEMPLATES } from '@/lib/resume/templates';
import { POSTER_TEMPLATES } from '@/lib/poster/templates';

export const dynamic = 'force-dynamic';

// Ten posters, one per layout, across different occasions
const POSTERS = ['hiring--bold', 'admission-open--gradient', 'freelancer--burst', 'clinic--card', 'school-event--festive', 'coaching--wave', 'result--frame', 'pharmacy--minimal', 'diwali--photo', 'birthday--split'];

// One template per category, so the strip shows range rather than four near-twins
function spread(list, n, key = 'category') {
  const seen = new Set();
  return list.filter((t) => !seen.has(t[key]) && seen.add(t[key])).slice(0, n);
}

export default async function Home() {
  const templates = await getTemplateList();
  const portfolios = spread(templates, 10);
  const resumes = resumeTemplateList();
  // 4 Top Ranking designs from different families, then 6 more with a different design and profession each
  const top = resumes.filter((t) => t.top);
  const usedDesign = new Set();
  const usedCat = new Set();
  const others = resumes.filter((t) => !t.top && !usedDesign.has(t.design) && !usedCat.has(t.category) && usedDesign.add(t.design) && usedCat.add(t.category)).filter((_, i) => i % 3 === 0).slice(0, 6);
  const resumePicks = [...[0, 12, 25, 37].map((i) => top[i]).filter(Boolean), ...others];
  const posters = POSTERS.filter((s) => POSTER_TEMPLATES.some((t) => t.slug === s));

  const stats = [
    [templates.length, 'portfolio templates'],
    [RESUME_TEMPLATES.length, 'resume templates'],
    [POSTER_TEMPLATES.length, 'poster designs'],
  ];

  return (
    <>
      <ResumeAssets />
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_85%_10%,#ECEAFF_0%,transparent_70%),radial-gradient(40%_40%_at_0%_100%,#FFE9E3_0%,transparent_70%)]" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <p className="chip border border-line bg-white px-3 py-1 text-sm text-ink shadow-sm">
                <span className="h-2 w-2 rounded-full bg-signal" /> Portfolio
                <span className="h-2 w-2 rounded-full bg-mint" /> Resume
                <span className="h-2 w-2 rounded-full bg-coral" /> Poster
              </p>
              <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl">
                Show your work. <span className="bg-gradient-to-r from-signal via-[#9A4BFF] to-coral bg-clip-text text-transparent">Get noticed.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-mute">
                Make a portfolio website, a job-ready resume and eye-catching posters — all in one place, with templates made to look good from the first click.
              </p>
              <div className="mt-9 grid max-w-xl gap-3 sm:grid-cols-3">
                <a href="#portfolio" className="group rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-signal hover:shadow-lg">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-signal text-white"><LayoutTemplate size={20} /></span>
                  <span className="mt-3 block font-bold">Portfolio</span>
                  <span className="text-sm text-mute">Website + live link</span>
                </a>
                <a href="#resume" className="group rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-mint hover:shadow-lg">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-white"><FileText size={20} /></span>
                  <span className="mt-3 block font-bold">Resume</span>
                  <span className="text-sm text-mute">ATS score + PDF</span>
                </a>
                <a href="#posters" className="group rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-coral hover:shadow-lg">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-coral text-white"><ImageIcon size={20} /></span>
                  <span className="mt-3 block font-bold">Poster</span>
                  <span className="text-sm text-mute">Print + social</span>
                </a>
              </div>
              <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
                {stats.map(([n, label]) => (
                  <div key={label}>
                    <dt className="sr-only">{label}</dt>
                    <dd className="font-display text-3xl font-extrabold">{n.toLocaleString('en-IN')}+</dd>
                    <dd className="text-sm text-mute">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <HeroCollage portfolio={portfolios[0]?.slug || 'blank'} resume={resumePicks[0]?.slug} poster={posters[0]} />
          </div>
        </section>

        <section id="portfolio" className="scroll-mt-16 border-t border-line bg-white">
          <div className="mx-auto max-w-7xl px-5 py-20"><PortfolioRow templates={portfolios} /></div>
        </section>

        <section id="resume" className="scroll-mt-16 border-t border-line bg-mint-soft/40">
          <div className="mx-auto max-w-7xl px-5 py-20"><ResumeRow templates={resumePicks} /></div>
        </section>

        <section id="posters" className="scroll-mt-16 border-t border-line bg-coral-soft/40">
          <div className="mx-auto max-w-7xl px-5 py-20"><PosterRow slugs={posters} /></div>
        </section>

        <section id="plans" className="scroll-mt-16 border-t border-line">
          <div className="mx-auto max-w-5xl px-5 py-20">
            <div className="mb-10 text-center">
              <p className="chip bg-sun/25 text-ink">Plans</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Start free. Go Premium when you're ready.</h2>
              <p className="mx-auto mt-2 max-w-xl text-mute">Build and preview everything for free. Premium unlocks publishing, downloads and the premium templates.</p>
            </div>
            <Plans />
          </div>
        </section>

      </main>
      <footer className="bg-ink text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-10">
          <Logo light />
          <nav className="flex flex-wrap gap-5 text-sm text-white/70">
            <NextLink href="/portfolios" className="hover:text-white">Portfolios</NextLink>
            <NextLink href="/resume" className="hover:text-white">Resumes</NextLink>
            <NextLink href="/posters" className="hover:text-white">Posters</NextLink>
            <NextLink href="/plans" className="hover:text-white">Plans</NextLink>
          </nav>
          <p className="text-sm text-white/50">© {new Date().getFullYear()} Folio</p>
        </div>
      </footer>
    </>
  );
}
