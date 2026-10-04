'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import NextLink from 'next/link';
import { ArrowRight, BadgeCheck, Crown, PenLine } from 'lucide-react';
import TemplateThumb from '@/components/TemplateThumb';
import { thumbHtml } from '@/components/TemplateGallery';
import ResumeView from '@/components/resume/ResumeView';
import Stage from '@/components/poster/Stage';
import { resumeFromTemplate } from '@/lib/resume/templates';
import { getPosterTemplate, posterFromTemplate } from '@/lib/poster/templates';
import { getFormat } from '@/lib/poster/formats';

export const posterHref = (slug) => `/posters/new?template=${encodeURIComponent(slug)}`;

export function PortfolioThumb({ slug }) {
  const render = useCallback(() => thumbHtml(slug), [slug]);
  return <TemplateThumb render={render} />;
}

export function ResumeThumb({ slug }) {
  const doc = useMemo(() => resumeFromTemplate(slug), [slug]);
  return <ResumeView doc={doc} />;
}

// Poster docs get random element ids, so they are built after mount to keep hydration stable
export function PosterThumb({ slug }) {
  const box = useRef(null);
  const [w, setW] = useState(0);
  const [doc, setDoc] = useState(null);
  const f = getFormat(getPosterTemplate(slug)?.format);
  useEffect(() => setDoc(posterFromTemplate(slug)), [slug]);
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(box.current);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="relative w-full overflow-hidden bg-paper" style={{ aspectRatio: `${f.w}/${f.h}` }}>
      {doc && w > 0 ? <Stage doc={doc} scale={w / doc.w} /> : <div className="absolute inset-0 animate-pulse bg-line/50" />}
    </div>
  );
}

function BrowserFrame({ children, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-ink/10 bg-white shadow-2xl shadow-ink/20 ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-line bg-paper px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-coral" />
        <span className="h-2.5 w-2.5 rounded-full bg-sun" />
        <span className="h-2.5 w-2.5 rounded-full bg-mint" />
        <span className="ml-3 h-4 flex-1 rounded bg-line/70" />
      </div>
      {children}
    </div>
  );
}

export function HeroCollage({ portfolio, resume, poster }) {
  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-xl" aria-hidden="true">
      <div className="absolute -right-6 -top-6 h-48 w-48 rounded-full bg-sun/40 blur-3xl" />
      <div className="absolute -bottom-8 left-4 h-52 w-52 rounded-full bg-signal/30 blur-3xl" />
      <BrowserFrame className="absolute left-0 top-[6%] w-[78%] -rotate-2">
        <PortfolioThumb slug={portfolio} />
      </BrowserFrame>
      <div className="absolute right-0 top-0 w-[38%] rotate-[5deg] overflow-hidden rounded-lg border border-ink/10 bg-white shadow-2xl shadow-ink/25">
        <ResumeThumb slug={resume} />
      </div>
      <div className="absolute bottom-0 right-[14%] w-[32%] -rotate-[4deg] overflow-hidden rounded-lg shadow-2xl shadow-ink/30 ring-4 ring-white">
        <PosterThumb slug={poster} />
      </div>
      <span className="absolute bottom-[14%] left-[4%] chip rotate-[-3deg] bg-white px-3 py-1.5 text-sm text-ink shadow-lg"><BadgeCheck size={15} className="text-mint" /> ATS score 92</span>
    </div>
  );
}

function Hover({ href, label }) {
  return (
    <NextLink href={href} className="absolute inset-0 flex items-center justify-center bg-ink/55 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100">
      <span className="btn-primary"><PenLine size={16} /> {label}</span>
    </NextLink>
  );
}

function SectionHead({ eyebrow, color, title, text, href, cta }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className={`chip ${color}`}>{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
        <p className="mt-2 text-mute">{text}</p>
      </div>
      <NextLink href={href} className="btn-light">{cta} <ArrowRight size={16} /></NextLink>
    </div>
  );
}

export function PortfolioRow({ templates }) {
  return (
    <>
      <SectionHead
        eyebrow="Portfolio website" color="bg-signal-soft text-signal"
        title="A website that shows your work, not just lists it."
        text="Drag in blocks, change colours and fonts, and publish to your own link in one click."
        href="/portfolios" cta="All portfolio templates"
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {templates.map((t) => (
          <article key={t.slug} className="group">
            <div className="relative overflow-hidden rounded-xl border border-line bg-white shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-xl">
              <PortfolioThumb slug={t.slug} />
              <Hover href={`/builder/new?template=${t.slug}`} label="Use template" />
              {t.premium && <span className="chip absolute left-3 top-3 bg-sun text-ink shadow"><Crown size={12} /> Premium</span>}
            </div>
            <h3 className="mt-3 font-bold">{t.name}</h3>
            <p className="text-sm text-mute">{t.category}</p>
          </article>
        ))}
      </div>
    </>
  );
}

export function ResumeRow({ templates }) {
  return (
    <>
      <SectionHead
        eyebrow="Resume" color="bg-mint-soft text-mint"
        title="Resumes that get past the ATS and into a shortlist."
        text="Pick a design for your profession, watch your ATS score live, then download a clean PDF."
        href="/resume" cta="All resume templates"
      />
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
        {templates.map((t) => (
          <article key={t.slug} className="group">
            <div className="relative overflow-hidden rounded-xl border border-line bg-white shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-xl">
              <ResumeThumb slug={t.slug} />
              <Hover href={`/resume/new?template=${t.slug}`} label="Use template" />
              <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                {t.premium && <span className="chip bg-sun text-ink shadow"><Crown size={12} /> Premium</span>}
                {t.ats && <span className="chip bg-mint text-white shadow"><BadgeCheck size={12} /> ATS</span>}
              </div>
            </div>
            <h3 className="mt-2.5 font-bold">{t.name}</h3>
            <p className="text-xs text-mute">{t.profession || t.category}</p>
          </article>
        ))}
      </div>
    </>
  );
}

export function PosterRow({ slugs }) {
  return (
    <>
      <SectionHead
        eyebrow="Posters & social posts" color="bg-coral-soft text-coral"
        title="Posters, flyers and posts for every occasion."
        text="Admissions, hiring, offers, festivals and more — ready for print, Instagram, WhatsApp status and YouTube."
        href="/posters" cta="All poster designs"
      />
      <div className="columns-2 gap-5 sm:columns-3 lg:columns-5">
        {slugs.map((slug) => (
          <article key={slug} className="group mb-5 break-inside-avoid">
            <div className="relative overflow-hidden rounded-xl border border-line shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-xl">
              <PosterThumb slug={slug} />
              <Hover href={posterHref(slug)} label="Customise" />
            </div>
            <p className="mt-2 text-sm font-semibold">{getPosterTemplate(slug)?.categoryName}</p>
          </article>
        ))}
      </div>
    </>
  );
}
