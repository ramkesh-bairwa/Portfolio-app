import { BookOpen, Download, Languages, Sparkles } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import CardGallery from '@/components/poster/CardGallery';
import { CARD_DESIGNS, CARD_EVENTS, CARD_THEMES } from '@/lib/poster/cards';

export const metadata = { title: 'Wedding cards & invitations — Folio', description: 'Indian wedding cards and function invitations in Hindi and English. Single, double or triple page. Edit and download as PDF.' };

export default function CardsPage({ searchParams }) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-7xl px-5 pb-10 pt-14">
          <p className="chip bg-sun/25 text-ink"><Sparkles size={13} /> शादी कार्ड · Invitation cards</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-extrabold leading-[1.04] tracking-tight sm:text-6xl">Wedding cards & function invitations.</h1>
          <p className="mt-5 max-w-2xl text-lg text-mute">
            {CARD_DESIGNS.length} designs for {CARD_EVENTS.length} functions, from Shubh Vivah, Nikah and Anand Karaj to Haldi, Griha Pravesh and Mundan. {CARD_THEMES.length} styles, each in हिंदी and English, as a single, double or triple page card.
          </p>
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-mute">
            <span className="flex items-center gap-2"><BookOpen size={16} className="text-signal" /> Cover, invitation and programme pages</span>
            <span className="flex items-center gap-2"><Languages size={16} className="text-emerald-600" /> Hindi typing built in</span>
            <span className="flex items-center gap-2"><Download size={16} className="text-amber-500" /> All pages in one print-ready PDF</span>
          </div>
        </section>
        <section className="border-t border-line bg-white/60">
          <div className="mx-auto max-w-7xl px-5 py-12">
            <CardGallery initialEvent={searchParams?.event || 'wedding'} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
