import { Download, Image as ImageIcon, Move, Sparkles } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PosterGallery from '@/components/poster/PosterGallery';
import { POSTER_CATEGORIES } from '@/lib/poster/categories';
import { POSTER_TEMPLATES } from '@/lib/poster/templates';
import { FORMATS } from '@/lib/poster/formats';

export const metadata = { title: 'Posters, flyers & ads — Folio', description: 'Design posters, pamphlets, social posts and ads. Download as PNG, JPG or PDF.' };

export default function PostersPage({ searchParams }) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-7xl px-5 pb-10 pt-14">
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
