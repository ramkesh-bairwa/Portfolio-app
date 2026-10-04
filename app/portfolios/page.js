import NextLink from 'next/link';
import { Globe, LayoutTemplate, MousePointerClick, Palette } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import TemplateGallery from '@/components/TemplateGallery';
import { getTemplateList } from '@/lib/templateStore';
import { BLOCKS } from '@/lib/blocks';
import { COMPONENTS } from '@/lib/components';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Portfolio templates — Folio', description: 'Portfolio website templates for every profession. Drag, customise and publish in one click.' };

export default async function PortfoliosPage() {
  const templates = await getTemplateList();
  const categories = new Set(templates.map((t) => t.category)).size;
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-7xl px-5 pb-10 pt-14">
          <p className="chip bg-signal-soft text-signal"><LayoutTemplate size={13} /> Portfolio websites</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-extrabold leading-[1.04] tracking-tight sm:text-6xl">A portfolio website for every kind of work.</h1>
          <p className="mt-5 max-w-2xl text-lg text-mute">
            {templates.length.toLocaleString('en-IN')} templates across {categories} categories, {Object.keys(BLOCKS).length} blocks and {COMPONENTS.length} ready-made components. Publish to your own link in one click.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#all-portfolios" className="btn-primary px-5 py-3 text-base">Browse templates</a>
            <NextLink href="/builder/new?template=blank" className="btn-light px-5 py-3 text-base">Start blank</NextLink>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-mute">
            <span className="flex items-center gap-2"><MousePointerClick size={16} className="text-signal" /> Drag-and-drop blocks</span>
            <span className="flex items-center gap-2"><Palette size={16} className="text-coral" /> Thousands of styles</span>
            <span className="flex items-center gap-2"><Globe size={16} className="text-mint" /> Publish to a live link</span>
          </div>
        </section>
        <section id="all-portfolios" className="scroll-mt-16 border-t border-line bg-white/60">
          <div className="mx-auto max-w-7xl px-5 py-12">
            <TemplateGallery templates={templates} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
