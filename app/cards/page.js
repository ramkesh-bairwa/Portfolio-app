import NextLink from 'next/link';
import { redirect } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import CardGallery from '@/components/poster/CardGallery';

export const metadata = { title: 'More wedding card styles — Folio' };

// Wedding cards now live on the posters page (tab "शादी कार्ड"); this page only keeps the older styles
export default function CardsPage({ searchParams }) {
  if (!searchParams?.legacy) redirect('/posters?tab=cards');
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-12">
        <NextLink href="/posters?tab=cards" className="text-sm font-semibold text-signal">← शादी कार्ड</NextLink>
        <h1 className="mb-6 mt-3 text-3xl font-extrabold">More card styles</h1>
        <CardGallery initialEvent={searchParams?.event || 'wedding'} />
      </main>
      <SiteFooter />
    </>
  );
}
