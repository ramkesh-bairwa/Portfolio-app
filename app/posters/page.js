import { Download, Image as ImageIcon, Move, Sparkles } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import NextLink from 'next/link';
import PosterGallery from '@/components/poster/PosterGallery';
import ShaadiSection from '@/components/poster/ShaadiSection';
import { SHAADI_DESIGNS } from '@/lib/poster/shaadi';
import { POSTER_CATEGORIES } from '@/lib/poster/categories';
import { POSTER_TEMPLATES } from '@/lib/poster/templates';
import { FORMATS } from '@/lib/poster/formats';

export const metadata = { title: 'Posters, flyers & ads — Folio', description: 'Design posters, pamphlets, social posts and ads. Download as PNG, JPG or PDF.' };

// Tabs at the top of the posters page: posters, or the wedding card studio
function Tabs({ cards }) {
  const tab = (href, active, label, count) => (
    <NextLink href={href} scroll={false} aria-current={active ? 'page' : undefined} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors sm:text-base ${active ? 'bg-ink text-white shadow' : 'text-mute hover:bg-white hover:text-ink'}`}>
      {label} <span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white/15' : 'bg-ink/5'}`}>{count}</span>
    </NextLink>
  );
  return (
    <div className="mx-auto max-w-7xl px-5 pt-6">
      <div className="inline-flex gap-1 rounded-2xl border border-line bg-paper p-1" role="tablist" aria-label="Poster type">
        {tab('/posters', !cards, 'पोस्टर · Posters', POSTER_TEMPLATES.length.toLocaleString('en-IN'))}
        {tab('/posters?tab=cards', cards, 'शादी कार्ड · Wedding cards', SHAADI_DESIGNS.length)}
      </div>
    </div>
  );
}

export default function PostersPage({ searchParams }) {
  const cards = searchParams?.tab === 'cards';
  if (cards) {
    return (
      <>
        <SiteHeader />
        <main className="bg-[#FBF6EE]">
          <Tabs cards />
          <div className="mt-6"><ShaadiSection /></div>
        </main>
        <SiteFooter />
      </>
    );
  }
  return (
    <>
      <SiteHeader />
      <main>
        <Tabs cards={false} />
        <section className="mx-auto max-w-7xl px-5 pb-10 pt-10">
          <p className="chip bg-sun/25 text-ink"><Sparkles size={13} /> Poster maker</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-extrabold leading-[1.04] tracking-tight sm:text-6xl">Posters, pamphlets, ads and social posts.</h1>
          <p className="mt-5 max-w-2xl text-lg text-mute">
            {POSTER_TEMPLATES.length.toLocaleString('en-IN')} designs (English and हिंदी) across {POSTER_CATEGORIES.length} categories, in {FORMATS.length} sizes. Put your own photo into any design. Drag anything anywhere, resize, crop, and download as PNG, JPG or PDF.
          </p>
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-mute">
            <span className="flex items-center gap-2"><Move size={16} className="text-signal" /> Drag, resize, rotate</span>
            <span className="flex items-center gap-2"><ImageIcon size={16} className="text-emerald-600" /> Your photos, crop and filters</span>
            <span className="flex items-center gap-2"><Download size={16} className="text-amber-500" /> PNG, JPG and print-ready PDF</span>
          </div>
        </section>
        <section className="border-t border-line bg-white/60">
          <div className="mx-auto max-w-7xl px-5 py-12">
            <PosterGallery initialCategory={searchParams?.category || 'diwali'} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
