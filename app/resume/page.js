import NextLink from 'next/link';
import { BadgeCheck, Crown, FileText, PenLine } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ResumeGallery from '@/components/resume/ResumeGallery';
import { RESUME_DESIGNS } from '@/lib/resume/designs';
import { RESUME_CATEGORIES, resumeTemplateList } from '@/lib/resume/templates';

export const metadata = { title: 'Resume templates — Folio', description: 'Create a professional, ATS-friendly resume in minutes.' };

export default function ResumePage() {
  const templates = resumeTemplateList();
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-7xl px-5 pb-10 pt-14">
          <p className="chip bg-signal-soft text-signal"><FileText size={13} /> Resume builder</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-extrabold leading-[1.04] tracking-tight sm:text-6xl">Build a resume that gets you shortlisted.</h1>
          <p className="mt-5 max-w-2xl text-lg text-mute">
            {templates.length.toLocaleString('en-IN')} templates across {RESUME_CATEGORIES.length} professions, {RESUME_DESIGNS.length} designs, a live ATS score and one-click PDF download.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#resume-templates" className="btn-primary px-5 py-3 text-base"><PenLine size={18} /> Choose a resume template</a>
            <NextLink href="/resume/new?template=software-engineer-classic-ats" className="btn-light px-5 py-3 text-base">Start with a simple ATS resume</NextLink>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-mute">
            <span className="flex items-center gap-2"><BadgeCheck size={16} className="text-emerald-600" /> ATS-friendly designs</span>
            <span className="flex items-center gap-2"><Crown size={16} className="text-amber-500" /> Premium top-ranking designs</span>
            <span className="flex items-center gap-2"><FileText size={16} className="text-signal" /> A4 or US Letter PDF</span>
          </div>
        </section>
        <section id="resume-templates" className="border-t border-line bg-white/60">
          <div className="mx-auto max-w-7xl px-5 py-14">
            <h2 className="mb-6 text-3xl font-extrabold tracking-tight">Resume templates</h2>
            <ResumeGallery templates={templates} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
